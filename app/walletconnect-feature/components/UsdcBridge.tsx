"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isAddress } from "viem";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import { useAccount, useConfig, useSwitchChain, useWalletClient } from "wagmi";
import {
  addressToBytes32,
  BRIDGE_CHAINS,
  ERC20_ABI,
  estimateMaxFee,
  fetchAttestation,
  fetchRouteFee,
  formatUsdc,
  getBridgeChain,
  getFinalityThreshold,
  isValidEvmRecipient,
  MESSAGE_TRANSMITTER_V2_ABI,
  parseUsdcAmount,
  TOKEN_MESSENGER_V2_ABI,
  ZERO_BYTES_32,
  type BridgeChain,
  type BridgeMode,
} from "../services/cctpBridge";
import styles from "./UsdcBridge.module.css";

type BridgePhase =
  | "idle"
  | "checking"
  | "approving"
  | "burning"
  | "attesting"
  | "claiming"
  | "success"
  | "claimPending"
  | "failed";

type BridgeTx = {
  source?: BridgeChain;
  destination?: BridgeChain;
  burnHash?: `0x${string}`;
  claimHash?: `0x${string}`;
};

const STEPS: Array<{ key: BridgePhase; label: string }> = [
  { key: "checking", label: "Review" },
  { key: "approving", label: "Approve" },
  { key: "burning", label: "Burn" },
  { key: "attesting", label: "Attest" },
  { key: "claiming", label: "Mint" },
];

function classNames(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function shortHash(hash?: string) {
  return hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : "";
}

function simplifyBridgeError(error: unknown) {
  const raw =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === "string"
        ? error
        : "Unknown error";
  const message = raw.toLowerCase();

  if (
    message.includes("user rejected") ||
    message.includes("rejected the request") ||
    message.includes("user denied")
  ) {
    return "Transaction was rejected in your wallet.";
  }

  if (message.includes("does not match the target chain") || message.includes("chain mismatch")) {
    return "Wrong network selected in wallet. Please switch to the required chain and try again.";
  }

  if (message.includes("insufficient funds")) {
    return "Insufficient gas balance for this transaction.";
  }

  if (message.includes("nonce")) {
    return "Transaction nonce issue. Please retry in a few seconds.";
  }

  return "Transaction failed. Please try again.";
}

function formatInputAmount(value: string) {
  if (!value) return "";
  const [wholeRaw, fractionRaw] = value.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0";
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fractionRaw !== undefined ? `${withCommas}.${fractionRaw}` : withCommas;
}

export default function UsdcBridge() {
  const config = useConfig();
  const account = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const [hasMounted, setHasMounted] = useState(false);
  const [sourceChainId, setSourceChainId] = useState(8453);
  const [destinationChainId, setDestinationChainId] = useState(42161);
  const [mode, setMode] = useState<BridgeMode>("standard");
  const [amount, setAmount] = useState("");
  const [amountFocused, setAmountFocused] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [feeBps, setFeeBps] = useState<number | null>(null);
  const [maxFee, setMaxFee] = useState<bigint>(BigInt(0));
  const [phase, setPhase] = useState<BridgePhase>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tx, setTx] = useState<BridgeTx>({});

  const source = useMemo(() => getBridgeChain(sourceChainId), [sourceChainId]);
  const destination = useMemo(() => getBridgeChain(destinationChainId), [destinationChainId]);
  const connected = hasMounted && account.status === "connected" && !!account.address;
  const amountRaw = useMemo(() => {
    try {
      return amount.trim() ? parseUsdcAmount(amount) : BigInt(0);
    } catch {
      return null;
    }
  }, [amount]);
  const recipientAddress = recipient.trim() || account.address || "";
  const expectedAmount =
    amountRaw && amountRaw > maxFee ? amountRaw - maxFee : amountRaw ?? BigInt(0);
  const busy = !["idle", "success", "claimPending", "failed"].includes(phase);
  const displayAmount = amountFocused ? amount : formatInputAmount(amount);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadBalance() {
      if (!hasMounted || !account.address) {
        setBalance(BigInt(0));
        return;
      }

      try {
        const nextBalance = (await readContract(config, {
          address: source.usdc,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [account.address],
          chainId: source.chainId,
        } as any)) as bigint;
        if (active) setBalance(nextBalance);
      } catch {
        if (active) setBalance(BigInt(0));
      }
    }

    void loadBalance();
    return () => {
      active = false;
    };
  }, [account.address, config, hasMounted, source]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      async function loadFee() {
        if (!amountRaw || amountRaw <= BigInt(0) || source.chainId === destination.chainId) {
          setFeeBps(null);
          setMaxFee(BigInt(0));
          return;
        }

        try {
          const nextFeeBps = await fetchRouteFee(source.domain, destination.domain, mode);
          if (!active) return;
          setFeeBps(nextFeeBps);
          setMaxFee(estimateMaxFee(amountRaw, nextFeeBps));
        } catch {
          if (!active) return;
          setFeeBps(null);
          setMaxFee(BigInt(0));
        }
      }

      void loadFee();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [amountRaw, destination, mode, source]);

  const validationError = useMemo(() => {
    if (!connected) return "Connect a wallet to bridge USDC.";
    if (!amountRaw || amountRaw <= BigInt(0)) return "Enter a valid USDC amount.";
    if (source.chainId === destination.chainId) return "Choose two different chains.";
    if (!recipientAddress || !isValidEvmRecipient(recipientAddress)) {
      return "Enter a valid EVM recipient address.";
    }
    if (amountRaw > balance) return "Insufficient native USDC balance on the source chain.";
    return "";
  }, [amountRaw, balance, connected, destination.chainId, recipientAddress, source.chainId]);

  const switchRoute = () => {
    setSourceChainId(destination.chainId);
    setDestinationChainId(source.chainId);
  };

  const selectMax = () => {
    setAmount(formatUsdc(balance));
  };

  const waitForCircleAttestation = async (sourceDomain: number, burnHash: `0x${string}`) => {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      const attestation = await fetchAttestation(sourceDomain, burnHash);
      if (attestation) return attestation;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
    return null;
  };

  const claimTransfer = async (burnHash: `0x${string}`, txSource = source, txDestination = destination) => {
    if (!walletClient || !account.address) {
      throw new Error("Wallet client is not ready.");
    }

    setPhase("attesting");
    setMessage("Waiting for Circle Iris to attest the burn.");
    const attestation = await waitForCircleAttestation(txSource.domain, burnHash);
    if (!attestation) {
      setTx((current) => ({ ...current, source: txSource, destination: txDestination, burnHash }));
      setPhase("claimPending");
      setMessage("Circle attestation is still pending. You can retry the claim shortly.");
      return;
    }

    if (account.chainId !== txDestination.chainId) {
      setMessage(`Switching wallet to ${txDestination.name}.`);
      await switchChainAsync({ chainId: txDestination.chainId });
    }

    setPhase("claiming");
    setMessage(`Minting native USDC on ${txDestination.name}.`);
    const claimHash = await walletClient.writeContract({
      address: txDestination.messageTransmitter,
      abi: MESSAGE_TRANSMITTER_V2_ABI,
      functionName: "receiveMessage",
      args: [attestation.message, attestation.attestation],
      chain: undefined,
      account: account.address,
    } as any);
    setTx((current) => ({ ...current, destination: txDestination, claimHash }));
    await waitForTransactionReceipt(config, { hash: claimHash, chainId: txDestination.chainId });
    setPhase("success");
    setMessage("USDC has been minted on the destination chain.");
  };

  const startBridge = async () => {
    setError("");
    setMessage("");

    if (validationError) {
      setPhase("failed");
      setError(validationError);
      return;
    }

    if (!walletClient || !account.address || !amountRaw || !isAddress(recipientAddress)) {
      setPhase("failed");
      setError("Wallet is not ready for signing.");
      return;
    }

    try {
      setPhase("checking");
      setMessage("Checking allowance and route details.");
      setTx({ source, destination });

      if (account.chainId !== source.chainId) {
        setMessage(`Switching wallet to ${source.name}.`);
        await switchChainAsync({ chainId: source.chainId });
      }

      const allowance = (await readContract(config, {
        address: source.usdc,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [account.address, source.tokenMessenger],
        chainId: source.chainId,
      } as any)) as bigint;

      if (allowance < amountRaw) {
        setPhase("approving");
        setMessage("Waiting for you to approve the transaction");
        const approveHash = await walletClient.writeContract({
          address: source.usdc,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [source.tokenMessenger, amountRaw],
          chain: undefined,
          account: account.address,
        } as any);
        await waitForTransactionReceipt(config, { hash: approveHash, chainId: source.chainId });
      }

      const routeFeeBps = feeBps ?? (await fetchRouteFee(source.domain, destination.domain, mode));
      const routeMaxFee = estimateMaxFee(amountRaw, routeFeeBps);
      setFeeBps(routeFeeBps);
      setMaxFee(routeMaxFee);

      setPhase("burning");
      setMessage(`Burning USDC on ${source.name}.`);
      const burnHash = await walletClient.writeContract({
        address: source.tokenMessenger,
        abi: TOKEN_MESSENGER_V2_ABI,
        functionName: "depositForBurn",
        args: [
          amountRaw,
          destination.domain,
          addressToBytes32(recipientAddress),
          source.usdc,
          ZERO_BYTES_32,
          routeMaxFee,
          getFinalityThreshold(mode),
        ],
        chain: undefined,
        account: account.address,
      } as any);
      setTx({ source, destination, burnHash });
      await waitForTransactionReceipt(config, { hash: burnHash, chainId: source.chainId });
      await claimTransfer(burnHash, source, destination);
    } catch (bridgeError) {
      setPhase("failed");
      setError(simplifyBridgeError(bridgeError));
    }
  };

  const retryClaim = async () => {
    if (!tx.burnHash || !tx.source || !tx.destination) return;
    try {
      setError("");
      await claimTransfer(tx.burnHash, tx.source, tx.destination);
    } catch (claimError) {
      setPhase("failed");
      setError(simplifyBridgeError(claimError));
    }
  };

  return (
    <section className={classNames(styles.bridgePage, styles.reveal)}>
      <div className={styles.bridgeIntro}>
        <h1>Bridge native USDC <br/>across chains</h1>
        <p>Move USDC between blockchains smoothly and securely without the complexity of traditional bridges, via Circle's CCTP.
        </p>
      </div>

      <div className={styles.bridgeLayout}>
        <article className={styles.bridgeCard}>
          <div className={styles.routeGrid}>
            <ChainSelect
              label="From"
              chainId={source.chainId}
              onChange={setSourceChainId}
              balance={formatUsdc(balance)}
              amountValue={displayAmount}
              amountPlaceholder="0.00"
              onAmountChange={(value) => setAmount(value)}
              onAmountFocus={() => setAmountFocused(true)}
              onAmountBlur={() => setAmountFocused(false)}
              showMaxButton
              onMax={selectMax}
              maxDisabled={!connected || balance <= BigInt(0)}
            />
            <button
              type="button"
              className={styles.routeSwitch}
              onClick={switchRoute}
              aria-label="Switch source and destination chains"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 7h10l-2.8-2.8a1 1 0 0 1 1.4-1.4l4.5 4.5a1 1 0 0 1 0 1.4l-4.5 4.5a1 1 0 1 1-1.4-1.4L17 9H7a1 1 0 1 1 0-2Zm10 10H7l2.8 2.8a1 1 0 0 1-1.4 1.4l-4.5-4.5a1 1 0 0 1 0-1.4l4.5-4.5a1 1 0 1 1 1.4 1.4L7 15h10a1 1 0 1 1 0 2Z" />
              </svg>
            </button>
            <ChainSelect
              label="To"
              chainId={destination.chainId}
              onChange={setDestinationChainId}
              amountValue={amountRaw && amountRaw > BigInt(0) ? formatUsdc(expectedAmount) : ""}
              amountPlaceholder="0.00"
              amountReadOnly
            />
          </div>

          <div className={styles.modeControl} role="tablist" aria-label="Transfer speed">
            {(["standard", "fast"] as BridgeMode[]).map((option) => (
              <button
                key={option}
                type="button"
                className={classNames(styles.modeButton, mode === option && styles.modeActive)}
                onClick={() => setMode(option)}
              >
                {mode === option ? <span className={styles.modePill} /> : null}
                <span>{option === "standard" ? "Standard" : "Fast"}</span>
              </button>
            ))}
          </div>

          <div className={styles.inputPanel}>
            <label htmlFor="bridge-recipient">Recipient</label>
            <input
              id="bridge-recipient"
              value={recipient}
              placeholder={account.address || "Defaults to connected wallet"}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>

          <div className={styles.quoteBox}>
            <QuoteRow label="Fee" value={feeBps === null ? "Fetching route fee" : `${feeBps} bps`} />
            <QuoteRow label="Max fee" value={`${formatUsdc(maxFee)} USDC`} />
            <QuoteRow label="Expected receive" value={`${formatUsdc(expectedAmount)} USDC`} strong />
          </div>

          {(error || validationError || phase === "success" || phase === "claimPending") && (
              <div
                key={`${phase}-${error || validationError || message}`}
                className={classNames(
                  styles.statusPanel,
                  phase === "success" && styles.statusSuccess,
                  phase === "claimPending" && styles.statusWarning,
                  (error || validationError) && phase !== "success" && styles.statusError,
                )}
              >
                {phase === "success" ? message : error || validationError || message}
              </div>
          )}

          <button
            type="button"
            className={styles.primaryButton}
            disabled={busy || !!validationError}
            onClick={startBridge}
          >
              <span>
                {busy ? message || "Working..." : validationError ? "Review bridge details" : "Bridge USDC"}
              </span>
          </button>

          {phase === "claimPending" ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={retryClaim}
            >
              Retry claim
            </button>
          ) : null}
        </article>

        <aside className={styles.bridgeAside}>
          <div className={styles.timeline}>
            {STEPS.map((step, index) => {
              const currentIndex = STEPS.findIndex((item) => item.key === phase);
              const complete = phase === "success" || (currentIndex > index && currentIndex !== -1);
              const active = step.key === phase;
              return (
                <div
                  key={step.key}
                  className={classNames(
                    styles.timelineItem,
                    complete && styles.timelineComplete,
                    active && styles.timelineActive,
                  )}
                >
                  <span>{complete ? "OK" : index + 1}</span>
                  <div>
                    <p>{step.label}</p>
                    <small>{active ? message || "In progress" : complete ? "Complete" : "Waiting"}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.txLinks}>
            <p>Transaction trail</p>
            {tx.burnHash && tx.source ? (
              <a href={`${tx.source.explorer}${tx.burnHash}`} target="_blank" rel="noreferrer">
                Burn: {shortHash(tx.burnHash)}
              </a>
            ) : (
              <span>Burn transaction pending</span>
            )}
            {tx.claimHash && tx.destination ? (
              <a href={`${tx.destination.explorer}${tx.claimHash}`} target="_blank" rel="noreferrer">
                Claim: {shortHash(tx.claimHash)}
              </a>
            ) : (
              <span>Claim transaction pending</span>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function ChainSelect({
  label,
  chainId,
  onChange,
  balance,
  amountValue,
  amountPlaceholder,
  onAmountChange,
  onAmountFocus,
  onAmountBlur,
  amountReadOnly,
  showMaxButton,
  onMax,
  maxDisabled,
}: {
  label: string;
  chainId: number;
  onChange: (chainId: number) => void;
  balance?: string;
  amountValue?: string;
  amountPlaceholder?: string;
  onAmountChange?: (value: string) => void;
  onAmountFocus?: () => void;
  onAmountBlur?: () => void;
  amountReadOnly?: boolean;
  showMaxButton?: boolean;
  onMax?: () => void;
  maxDisabled?: boolean;
}) {
  const chain = getBridgeChain(chainId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className={styles.chainSelect} ref={menuRef}>
      <span>{label}</span>
      <div className={styles.chainSelectInner}>
        <ChainIcon chain={chain} />
        <button
          type="button"
          className={styles.chainTrigger}
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          aria-label={`Choose ${label.toLowerCase()} chain`}
        >
          <span>{chain.name}</span>
          <span className={classNames(styles.chainCaret, menuOpen && styles.chainCaretOpen)}>
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              className={styles.chainMenu}
              role="listbox"
              aria-label={`${label} chain options`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
            >
              {BRIDGE_CHAINS.map((option) => {
                const selected = option.chainId === chainId;
                return (
                  <button
                    key={option.chainId}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={classNames(styles.chainOption, selected && styles.chainOptionActive)}
                    onClick={() => {
                      onChange(option.chainId);
                      setMenuOpen(false);
                    }}
                  >
                    <ChainIcon chain={option} />
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <div className={styles.chainAmount}>
        <div className={styles.chainAmountHeader}>
          {showMaxButton ? (
            <button type="button" onClick={onMax} disabled={maxDisabled}>
              Max
            </button>
          ) : null}
        </div>
        <div className={styles.chainAmountRow}>
          <input
            value={amountValue ?? ""}
            inputMode={amountReadOnly ? undefined : "decimal"}
            placeholder={amountPlaceholder ?? "0.00"}
            readOnly={amountReadOnly}
            onFocus={onAmountFocus}
            onBlur={onAmountBlur}
            onChange={(event) => {
              if (!onAmountChange) return;
              onAmountChange(
                event.target.value
                  .replace(/,/g, "")
                  .replace(/[^\d.]/g, ""),
              );
            }}
          />
        </div>
      </div>
      {balance ? <small>{balance} USDC</small> : null}
    </div>
  );
}

function ChainIcon({ chain }: { chain: BridgeChain }) {
  return <span className={styles.chainIcon}>{getChainIcon(chain.shortName)}</span>;
}

function getChainIcon(shortName: string) {
  const key = shortName.toUpperCase();

  if (key === "ETH") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#8C8C8C" d="M12 2.8 6.2 12l5.8-2.8L17.8 12 12 2.8Z" />
        <path fill="#3C3C3B" d="M12 9.9 6.2 12 12 15.5 17.8 12 12 9.9Z" />
        <path fill="#8C8C8C" d="M6.2 13.2 12 21.2V16.8L6.2 13.2Z" />
        <path fill="#3C3C3B" d="M12 16.8v4.4l5.8-8-5.8 3.6Z" />
      </svg>
    );
  }

  if (key === "AVAX") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#E84142" />
        <path fill="#fff" d="M12.7 6.7a1 1 0 0 0-1.8 0L7.2 14a1 1 0 0 0 .9 1.4h7.8a1 1 0 0 0 .9-1.4l-4.1-7.3Z" />
        <rect x="8.2" y="16.2" width="3.6" height="3.2" rx=".8" fill="#fff" />
      </svg>
    );
  }

  if (key === "OP") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#FF0420" />
        <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff">
          OP
        </text>
      </svg>
    );
  }

  if (key === "ARB") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <polygon points="12,2.5 20,7 20,17 12,21.5 4,17 4,7" fill="#213147" />
        <polygon points="12,5.5 17.2,8.5 17.2,15.5 12,18.5 6.8,15.5 6.8,8.5" fill="#2D374B" />
        <path fill="#28A0F0" d="M10 8.2h2l3 7.6h-2L10 8.2Z" />
        <path fill="#fff" d="M8.6 8.2h1.8l3 7.6h-1.8l-3-7.6Z" />
      </svg>
    );
  }

  if (key === "BASE") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#0052FF" />
        <circle cx="12" cy="12" r="5.2" fill="#fff" />
        <circle cx="12" cy="12" r="2.6" fill="#0052FF" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1C2A3D" />
    </svg>
  );
}

function QuoteRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={classNames(styles.quoteRow, strong && styles.quoteStrong)}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
