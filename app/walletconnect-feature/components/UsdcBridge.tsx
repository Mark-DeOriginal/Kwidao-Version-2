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
  isEvmBridgeChain,
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

type TxStatus = "pending" | "attesting" | "claiming" | "success" | "claimPending" | "failed";

type BridgeHistoryItem = {
  id: string;
  createdAt: number;
  source: BridgeChain;
  destination: BridgeChain;
  amount: bigint;
  burnHash: `0x${string}`;
  claimHash?: `0x${string}`;
  status: TxStatus;
  note?: string;
};

type PersistedBridgeState = {
  sourceChainId: number;
  destinationChainId: number;
  mode: BridgeMode;
  amount: string;
  recipient: string;
  phase: BridgePhase;
  message: string;
  tx: BridgeTx;
  history: Array<Omit<BridgeHistoryItem, "amount"> & { amount: string }>;
  reclaimCooldowns: Record<string, number>;
  manualBurnHash: string;
  manualSourceChainId: number;
  manualDestinationChainId: number;
  updatedAt: number;
};

const BRIDGE_STORAGE_KEY = "kwidao-usdc-bridge-state-v1";

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

function formatCooldown(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function statusChipClass(status: TxStatus) {
  switch (status) {
    case "success":
      return styles.chipSuccess;
    case "failed":
      return styles.chipFailed;
    case "claimPending":
      return styles.chipPending;
    case "attesting":
    case "claiming":
      return styles.chipWorking;
    default:
      return styles.chipNeutral;
  }
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
  const [history, setHistory] = useState<BridgeHistoryItem[]>([]);
  const [reclaimCooldowns, setReclaimCooldowns] = useState<Record<string, number>>({});
  const [manualBurnHash, setManualBurnHash] = useState("");
  const [manualSourceChainId, setManualSourceChainId] = useState(sourceChainId);
  const [manualDestinationChainId, setManualDestinationChainId] = useState(destinationChainId);
  const [manualError, setManualError] = useState("");
  const [manualMessage, setManualMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const source = useMemo(() => getBridgeChain(sourceChainId), [sourceChainId]);
  const destination = useMemo(() => getBridgeChain(destinationChainId), [destinationChainId]);
  const sourceSupported = isEvmBridgeChain(source);
  const destinationSupported = isEvmBridgeChain(destination);
  const routeSupported = sourceSupported && destinationSupported;
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
    setManualSourceChainId(sourceChainId);
    setManualDestinationChainId(destinationChainId);
  }, [sourceChainId, destinationChainId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setReclaimCooldowns((current) => {
        const next: Record<string, number> = {};
        let changed = false;
        for (const [key, value] of Object.entries(current)) {
          const reduced = Math.max(0, value - 1);
          if (reduced > 0) {
            next[key] = reduced;
          }
          if (reduced !== value) changed = true;
        }
        return changed ? next : current;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || hydrated) return;
    try {
      const raw = window.localStorage.getItem(BRIDGE_STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<PersistedBridgeState>;
      if (typeof parsed.sourceChainId === "number") setSourceChainId(parsed.sourceChainId);
      if (typeof parsed.destinationChainId === "number") setDestinationChainId(parsed.destinationChainId);
      if (parsed.mode === "fast" || parsed.mode === "standard") setMode(parsed.mode);
      if (typeof parsed.amount === "string") setAmount(parsed.amount);
      if (typeof parsed.recipient === "string") setRecipient(parsed.recipient);
      if (typeof parsed.phase === "string") setPhase(parsed.phase as BridgePhase);
      if (typeof parsed.message === "string") setMessage(parsed.message);
      setError("");
      setManualError("");
      setManualMessage("");
      if (parsed.tx && typeof parsed.tx === "object") setTx(parsed.tx as BridgeTx);
      if (Array.isArray(parsed.history)) {
        setHistory(
          parsed.history.map((row) => ({
            ...row,
            amount: BigInt(String(row.amount)),
          })),
        );
      }
      if (parsed.reclaimCooldowns && typeof parsed.reclaimCooldowns === "object") {
        setReclaimCooldowns(parsed.reclaimCooldowns as Record<string, number>);
      }
      if (typeof parsed.manualBurnHash === "string") setManualBurnHash(parsed.manualBurnHash);
      if (typeof parsed.manualSourceChainId === "number") setManualSourceChainId(parsed.manualSourceChainId);
      if (typeof parsed.manualDestinationChainId === "number") {
        setManualDestinationChainId(parsed.manualDestinationChainId);
      }
    } catch {
      // ignore corrupted persisted state
    } finally {
      setHydrated(true);
    }
  }, [hasMounted, hydrated]);

  useEffect(() => {
    if (!hasMounted || !hydrated) return;
    try {
      const payload: PersistedBridgeState = {
        sourceChainId,
        destinationChainId,
        mode,
        amount,
        recipient,
        phase,
        message,
        tx,
        history: history.map((row) => ({ ...row, amount: row.amount.toString() })),
        reclaimCooldowns,
        manualBurnHash,
        manualSourceChainId,
        manualDestinationChainId,
        updatedAt: Date.now(),
      };
      window.localStorage.setItem(BRIDGE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // no-op if persistence unavailable
    }
  }, [
    amount,
    destinationChainId,
    error,
    hasMounted,
    history,
    hydrated,
    manualBurnHash,
    manualDestinationChainId,
    manualSourceChainId,
    message,
    mode,
    phase,
    recipient,
    reclaimCooldowns,
    sourceChainId,
    tx,
  ]);

  useEffect(() => {
    let active = true;

    async function loadBalance() {
      if (!hasMounted || !account.address || !sourceSupported) {
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
  }, [account.address, config, hasMounted, source, sourceSupported]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      async function loadFee() {
        if (!routeSupported || !amountRaw || amountRaw <= BigInt(0) || source.chainId === destination.chainId) {
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
  }, [amountRaw, destination, mode, routeSupported, source]);

  const validationError = useMemo(() => {
    if (!connected) return "Connect a wallet to bridge USDC.";
    if (!routeSupported) {
      return "Unsupported route. Source and destination must be EVM chains.";
    }
    if (!amountRaw || amountRaw <= BigInt(0)) return "Enter a valid USDC amount.";
    if (source.chainId === destination.chainId) return "Choose two different chains.";
    if (!recipientAddress || !isValidEvmRecipient(recipientAddress)) {
      return "Enter a valid EVM recipient address.";
    }
    if (amountRaw > balance) return "Insufficient native USDC balance on the source chain.";
    return "";
  }, [
    amountRaw,
    balance,
    connected,
    destination.chainId,
    destinationSupported,
    routeSupported,
    recipientAddress,
    source.chainId,
    sourceSupported
  ]);

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

  const updateHistory = (burnHash: `0x${string}`, patch: Partial<BridgeHistoryItem>) => {
    setHistory((current) =>
      current.map((row) => (row.burnHash === burnHash ? { ...row, ...patch } : row)),
    );
  };

  const claimTransfer = async (burnHash: `0x${string}`, txSource = source, txDestination = destination) => {
    if (!walletClient || !account.address) {
      throw new Error("Wallet client is not ready.");
    }

    setPhase("attesting");
    setMessage("Waiting for Circle Iris to attest the burn.");
    updateHistory(burnHash, { status: "attesting", note: "Waiting for Circle attestation" });
    const attestation = await waitForCircleAttestation(txSource.domain, burnHash);
    if (!attestation) {
      setTx((current) => ({ ...current, source: txSource, destination: txDestination, burnHash }));
      setPhase("claimPending");
      setMessage("Circle attestation is still pending. You can retry the claim shortly.");
      updateHistory(burnHash, { status: "claimPending", note: "Attestation still pending" });
      return;
    }

    // This block switches the wallet to the destination chain, which isn't necessary
    // if (account.chainId !== txDestination.chainId) {
    //   setMessage(`Switching wallet to ${txDestination.name}.`);
    //   await switchChainAsync({ chainId: txDestination.chainId });
    // }

    setPhase("claiming");
    setMessage(`Minting native USDC on ${txDestination.name}.`);
    updateHistory(burnHash, { status: "claiming", note: "Mint transaction submitted" });
    const claimHash = await walletClient.writeContract({
      address: txDestination.messageTransmitter,
      abi: MESSAGE_TRANSMITTER_V2_ABI,
      functionName: "receiveMessage",
      args: [attestation.message, attestation.attestation],
      chain: undefined,
      account: account.address,
    } as any);
    setTx((current) => ({ ...current, destination: txDestination, claimHash }));
    updateHistory(burnHash, { claimHash, note: "Waiting for destination confirmation" });
    await waitForTransactionReceipt(config, { hash: claimHash, chainId: txDestination.chainId });
    setPhase("success");
    setMessage("USDC has been minted on the destination chain.");
    updateHistory(burnHash, { status: "success", note: "USDC minted successfully" });
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
      setHistory((current) => [
        {
          id: `${burnHash}-${Date.now()}`,
          createdAt: Date.now(),
          source,
          destination,
          amount: amountRaw,
          burnHash,
          status: "pending",
          note: "Burn transaction submitted",
        },
        ...current,
      ]);
      await waitForTransactionReceipt(config, { hash: burnHash, chainId: source.chainId });
      await claimTransfer(burnHash, source, destination);
    } catch (bridgeError) {
      setPhase("failed");
      setError(simplifyBridgeError(bridgeError));
      if (tx.burnHash) {
        updateHistory(tx.burnHash, { status: "failed", note: "Claim failed. Retry available." });
      }
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
      if (tx.burnHash) {
        updateHistory(tx.burnHash, { status: "failed", note: "Retry failed. Try again shortly." });
      }
    }
  };

  const startRowReclaim = async (row: BridgeHistoryItem) => {
    const cooldown = reclaimCooldowns[row.id] ?? 0;
    if (cooldown > 0) return;
    setReclaimCooldowns((current) => ({ ...current, [row.id]: 180 }));
    try {
      setError("");
      setMessage("Reclaim requested. Checking Circle attestation.");
      await claimTransfer(row.burnHash, row.source, row.destination);
    } catch (claimError) {
      updateHistory(row.burnHash, { status: "failed", note: "Reclaim attempt failed." });
      setPhase("failed");
      setError(simplifyBridgeError(claimError));
    }
  };

  const manualClaim = async () => {
    setManualError("");
    setManualMessage("");
    const normalized = manualBurnHash.trim();
    if (!/^0x([A-Fa-f0-9]{64})$/.test(normalized)) {
      setManualError("Enter a valid burn transaction hash (0x + 64 hex chars).");
      return;
    }

    const sourceChain = getBridgeChain(manualSourceChainId);
    const destinationChain = getBridgeChain(manualDestinationChainId);

    if (sourceChain.chainId === destinationChain.chainId) {
      setManualError("Choose different source and destination chains for manual claim.");
      return;
    }

    const burnHash = normalized as `0x${string}`;
    setHistory((current) => {
      if (current.some((row) => row.burnHash === burnHash)) return current;
      return [
        {
          id: `${burnHash}-${Date.now()}`,
          createdAt: Date.now(),
          source: sourceChain,
          destination: destinationChain,
          amount: BigInt(0),
          burnHash,
          status: "claimPending",
          note: "Manual claim request submitted",
        },
        ...current,
      ];
    });

    try {
      setManualMessage("Claim submitted. Checking Circle attestation and mint status.");
      await claimTransfer(burnHash, sourceChain, destinationChain);
      setManualBurnHash("");
      setManualMessage("Manual claim processed. Check transaction history for latest status.");
    } catch (manualError) {
      updateHistory(burnHash, { status: "failed", note: "Manual claim failed." });
      setManualError(simplifyBridgeError(manualError));
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

          <div className={classNames(styles.statusPanel, styles.statusInfo)}>
            {mode === "standard"
              ? "Standard mode is free, but may take about 1 hour or more to complete transactions depending on network conditions."
              : "Fast mode makes transactions faster but incurs a fee."
            }
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

          <div className={styles.historyPanel}>
            <p className={styles.historyTitle}>Bridge history</p>
            {history.length === 0 ? (
              <span className={styles.historyEmpty}>No bridge transactions yet.</span>
            ) : (
              <div className={styles.historyTableWrap}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row) => {
                      const cooldown = reclaimCooldowns[row.id] ?? 0;
                      return (
                        <tr key={row.id}>
                          <td>
                            <div className={styles.routeCell}>
                              <ChainIcon chain={row.source} />
                              <span>{row.source.shortName} to {row.destination.shortName}</span>
                            </div>
                          </td>
                          <td>{row.amount > BigInt(0) ? `${formatUsdc(row.amount)} USDC` : "-"}</td>
                          <td>
                            <span className={classNames(styles.statusChip, statusChipClass(row.status))}>
                              {row.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.reclaimInline}
                              disabled={cooldown > 0}
                              onClick={() => void startRowReclaim(row)}
                            >
                              {cooldown > 0 ? `Try again in ${formatCooldown(cooldown)}` : "Reclaim"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.manualClaimPanel}>
            <p className={styles.historyTitle}>Manual claim</p>
            <small>Paste burn hash and retry mint if Circle attestation was delayed.</small>
            <input
              value={manualBurnHash}
              onChange={(event) => setManualBurnHash(event.target.value)}
              placeholder="0x burn transaction hash"
              className={styles.manualHashInput}
            />
            <div className={styles.manualRouteGrid}>
              <ManualChainSelect
                label="Source chain"
                chainId={manualSourceChainId}
                onChange={setManualSourceChainId}
              />
              <ManualChainSelect
                label="Destination chain"
                chainId={manualDestinationChainId}
                onChange={setManualDestinationChainId}
              />
            </div>
            {manualError ? (
              <div className={classNames(styles.statusPanel, styles.statusError)}>{manualError}</div>
            ) : null}
            {manualMessage ? (
              <div className={classNames(styles.statusPanel, styles.statusInfo)}>{manualMessage}</div>
            ) : null}
            <button type="button" className={styles.secondaryButton} onClick={() => void manualClaim()}>
              Claim with burn hash
            </button>
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
        <button
          type="button"
          className={styles.chainTrigger}
          onClick={() => setMenuOpen((current) => !current)}
          aria-expanded={menuOpen}
          aria-haspopup="listbox"
          aria-label={`Choose ${label.toLowerCase()} chain`}
        >
        <ChainIcon chain={chain} />
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

function ManualChainSelect({
  label,
  chainId,
  onChange,
}: {
  label: string;
  chainId: number;
  onChange: (chainId: number) => void;
}) {
  const chain = getBridgeChain(chainId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
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

  const computeMenuDirection = () => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const estimatedMenuHeight = 260;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    setOpenAbove(spaceBelow < estimatedMenuHeight);
  };

  return (
    <div className={styles.manualChainField} ref={menuRef}>
      <small>{label}</small>
      <button
        type="button"
        className={styles.chainTrigger}
        onClick={() => {
          if (!menuOpen) {
            computeMenuDirection();
          }
          setMenuOpen((current) => !current);
        }}
        aria-expanded={menuOpen}
        aria-haspopup="listbox"
        aria-label={`Choose ${label.toLowerCase()}`}
      >
        <ChainIcon chain={chain} />
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
            className={classNames(styles.chainMenu, openAbove && styles.chainMenuAbove)}
            role="listbox"
            aria-label={`${label} options`}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {BRIDGE_CHAINS.map((option) => {
              const selected = option.chainId === chainId;
              return (
                <button
                  key={`manual-${label}-${option.chainId}`}
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
      <svg
        width="1503"
        height="1504"
        viewBox="0 0 1503 1504"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="287" y="258" width="928" height="844" fill="white" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1502.5 752C1502.5 1166.77 1166.27 1503 751.5 1503C336.734 1503 0.5 1166.77 0.5 752C0.5 337.234 336.734 1 751.5 1C1166.27 1 1502.5 337.234 1502.5 752ZM538.688 1050.86H392.94C362.314 1050.86 347.186 1050.86 337.962 1044.96C327.999 1038.5 321.911 1027.8 321.173 1015.99C320.619 1005.11 328.184 991.822 343.312 965.255L703.182 330.935C718.495 303.999 726.243 290.531 736.021 285.55C746.537 280.2 759.083 280.2 769.599 285.55C779.377 290.531 787.126 303.999 802.438 330.935L876.42 460.079L876.797 460.738C893.336 489.635 901.723 504.289 905.385 519.669C909.443 536.458 909.443 554.169 905.385 570.958C901.695 586.455 893.393 601.215 876.604 630.549L687.573 964.702L687.084 965.558C670.436 994.693 661.999 1009.46 650.306 1020.6C637.576 1032.78 622.263 1041.63 605.474 1046.62C590.161 1050.86 573.004 1050.86 538.688 1050.86ZM906.75 1050.86H1115.59C1146.4 1050.86 1161.9 1050.86 1171.13 1044.78C1181.09 1038.32 1187.36 1027.43 1187.92 1015.63C1188.45 1005.1 1181.05 992.33 1166.55 967.307C1166.05 966.455 1165.55 965.588 1165.04 964.706L1060.43 785.75L1059.24 783.735C1044.54 758.877 1037.12 746.324 1027.59 741.472C1017.08 736.121 1004.71 736.121 994.199 741.472C984.605 746.453 976.857 759.552 961.544 785.934L857.306 964.891L856.949 965.507C841.69 991.847 834.064 1005.01 834.614 1015.81C835.352 1027.62 841.44 1038.5 851.402 1044.96C860.443 1050.86 875.94 1050.86 906.75 1050.86Z"
          fill="#E84142"
        />
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

  if (key === "POLYGON") {
    return (
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <path d="M64 0c35.348 0 64 28.652 64 64s-28.652 64-64 64S0 99.348 0 64 28.652 0 64 0zm0 0" fill="#fff"/>
        <path d="M85.898 49.242a5.76 5.76 0 00-5.418 0l-12.214 7.223-8.532 4.742-12.214 7.227a5.76 5.76 0 01-5.418 0l-9.707-5.649a5.423 5.423 0 01-2.711-4.52V46.989a4.972 4.972 0 012.71-4.52l9.708-5.417a5.738 5.738 0 015.418 0l9.707 5.418a5.423 5.423 0 012.71 4.52v7.218l8.329-4.965v-6.996a4.963 4.963 0 00-2.664-4.52l-17.86-10.382a5.738 5.738 0 00-5.418 0L24.266 37.727a4.608 4.608 0 00-2.934 4.52v20.991a4.967 4.967 0 002.711 4.496l18.059 10.407a5.76 5.76 0 005.418 0l12.214-7 8.352-4.965 12.172-6.977a5.76 5.76 0 015.418 0l9.707 5.418a5.419 5.419 0 012.707 4.52v11.062a4.967 4.967 0 01-2.707 4.516l-9.707 5.64a5.738 5.738 0 01-5.418 0l-9.707-5.418a5.416 5.416 0 01-2.711-4.515v-7.25l-8.106 4.738v7.219a4.969 4.969 0 002.707 4.52L80.5 100.03a5.746 5.746 0 005.422 0l18.058-10.383a5.42 5.42 0 002.688-4.511v-21a4.964 4.964 0 00-2.711-4.516zm0 0" fill="#7950DD"/>
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
