"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { isAddress } from "viem";
import { readContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { useAccount, useConfig, useDisconnect, useSwitchChain } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  addressToBytes32,
  BRIDGE_CHAINS,
  BRIDGE_CHAIN_OPTIONS,
  ERC20_ABI,
  estimateMaxFee,
  fetchAttestation,
  fetchAttestationStatus,
  fetchRouteFee,
  formatUsdc,
  getBridgeChain,
  getFinalityThreshold,
  isEvmBridgeChain,
  isValidRecipient,
  MESSAGE_TRANSMITTER_V2_ABI,
  parseUsdcAmount,
  supportsBridgeMode,
  TOKEN_MESSENGER_V2_ABI,
  ZERO_BYTES_32,
  type BridgeChain,
  type BridgeChainOption,
  type BridgeMode,
  type ChainType,
} from "../services/cctpBridge";
import {
  getEvmBalance,
  getEvmAllowance,
  approveEvmUsdc,
  depositForBurnEvm,
  receiveMessageEvm,
} from "../services/evmBridge";
import {
  connectSolanaWallet,
  getSolanaBalance,
  depositForBurnSolana,
  receiveMessageSolana,
  resolveSolanaRecipientTokenAccount,
  hasSolanaWallet,
} from "../services/solanaBridge";
import {
  connectStarknetWallet,
  getStarknetBalance,
  depositForBurnStarknet,
  receiveMessageStarknet,
  hasStarknetWallet,
} from "../services/starknetBridge";
import {
  connectStellarWallet,
  getStellarBalance,
  depositForBurnStellar,
  receiveMessageStellar,
  hasStellarWallet,
} from "../services/stellarBridge";
import { useBridgeWallet } from "../services/bridgeContext";
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
  burnHash?: string;
  claimHash?: `0x${string}`;
};

type TxStatus = "pending" | "attesting" | "claiming" | "success" | "claimPending" | "failed";

type BridgeHistoryItem = {
  id: string;
  createdAt: number;
  source: BridgeChain;
  destination: BridgeChain;
  amount: bigint;
  burnHash: string;
  claimHash?: string;
  status: TxStatus;
  note?: string;
};

type PersistedBridgeState = {
  history: Array<Omit<BridgeHistoryItem, "amount"> & { amount: string }>;
  updatedAt: number;
};

const BRIDGE_STORAGE_KEY = "kwidao-usdc-bridge-state-v1";
const HISTORY_RETENTION_MS = 3 * 24 * 60 * 60 * 1000;
const HIDDEN_EVM_SOON_CHAIN_NAMES = new Set(["Codex", "Arc", "EDGE", "Pharos"]);

const WALLET_INSTALL_URL: Record<Exclude<ChainType, "evm">, string> = {
  solana: "https://phantom.app/",
  starknet: "https://www.argent.xyz/",
  stellar: "https://freighter.app/",
};

const WALLET_HINT: Record<Exclude<ChainType, "evm">, string> = {
  solana: "Phantom or Backpack",
  starknet: "Argent or Braavos",
  stellar: "Freighter",
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

function chainNameForType(type: ChainType) {
  return BRIDGE_CHAINS.find((chain) => chain.type === type)?.name ?? type;
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

  if (message.includes("insufficient funds") || message.includes("insufficient lamports")) {
    return "Insufficient gas balance for this transaction.";
  }

  if (message.includes("simulation failed") || message.includes("sendrawtransaction")) {
    return raw;
  }

  if (message.includes("nonce")) {
    return "Transaction nonce issue. Please retry in a few seconds.";
  }

  return raw;
}

function formatInputAmount(value: string) {
  if (!value) return "";
  const [wholeRaw, fractionRaw] = value.split(".");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "") || "0";
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fractionRaw !== undefined ? `${withCommas}.${fractionRaw}` : withCommas;
}

function pruneBridgeHistory(rows: BridgeHistoryItem[], now = Date.now()) {
  const cutoff = now - HISTORY_RETENTION_MS;
  return rows.filter((row) => Number.isFinite(row.createdAt) && row.createdAt >= cutoff);
}

async function waitForChainId(
  accountRef: { current: { chainId?: number } | undefined },
  chainId: number,
  timeoutMs = 15_000,
) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (accountRef.current?.chainId === chainId) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return accountRef.current?.chainId === chainId;
}

async function waitForCircleAttestation(sourceDomain: number, burnHash: string) {
  for (let attempt = 0; attempt < 450; attempt += 1) {
    try {
      const attestation = await fetchAttestation(sourceDomain, burnHash);
      if (attestation) return attestation;
    } catch {
      // Transient Iris errors (rate limits, timeouts) — keep polling.
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  return null;
}

export default function UsdcBridge() {
  const config = useConfig();
  const account = useAccount();
  const accountRef = useRef(account);
  useEffect(() => {
    accountRef.current = account;
  });
  const { switchChainAsync } = useSwitchChain();
  const {
    wallet: nonEvmWallet,
    connectWallet,
    disconnectWallet,
    hasWalletForChain,
  } = useBridgeWallet();
  const nonEvmWalletRef = useRef(nonEvmWallet);
  useEffect(() => {
    nonEvmWalletRef.current = nonEvmWallet;
  });
  const { disconnect: evmDisconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const [hasMounted, setHasMounted] = useState(false);
  const [sourceChainId, setSourceChainId] = useState(8453);
  const [destinationChainId, setDestinationChainId] = useState(42161);
  const [mode, setMode] = useState<BridgeMode>("standard");
  const [amount, setAmount] = useState("");
  const [amountFocused, setAmountFocused] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [solanaRecipientTokenAccount, setSolanaRecipientTokenAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [feeBps, setFeeBps] = useState<number | null>(null);
  const [maxFee, setMaxFee] = useState<bigint>(BigInt(0));
  const [routeFeeError, setRouteFeeError] = useState("");
  const [phase, setPhase] = useState<BridgePhase>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tx, setTx] = useState<BridgeTx>({});
  const [history, setHistory] = useState<BridgeHistoryItem[]>([]);
  const [manualBurnHash, setManualBurnHash] = useState("");
  const [manualSourceChainId, setManualSourceChainId] = useState(sourceChainId);
  const [manualDestinationChainId, setManualDestinationChainId] = useState(destinationChainId);
  const [manualError, setManualError] = useState("");
  const [manualMessage, setManualMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [switchError, setSwitchError] = useState("");
  const [connectPrompt, setConnectPrompt] = useState<number | null>(null);
  const [connectPromptError, setConnectPromptError] = useState("");
  const [attestationPendingModal, setAttestationPendingModal] = useState(false);

  const source = useMemo(() => getBridgeChain(sourceChainId), [sourceChainId]);
  const destination = useMemo(() => getBridgeChain(destinationChainId), [destinationChainId]);
  const sourceType = source.type;
  const destType = destination.type;
  const sourceSupported = isEvmBridgeChain(source) || sourceType !== "evm";
  const destinationSupported = isEvmBridgeChain(destination) || destType !== "evm";
  const routeSupported = sourceSupported && destinationSupported;
  const fastModeAvailable = supportsBridgeMode(source, "fast");
  const connected = useMemo(() => {
    if (sourceType === "evm") {
      return hasMounted && account.status === "connected" && !!account.address;
    }
    return nonEvmWallet.isConnected && nonEvmWallet.chainType === sourceType;
  }, [sourceType, hasMounted, account, nonEvmWallet]);
  const walletAddress = useMemo(() => {
    if (sourceType === "evm") return account.address ?? null;
    return nonEvmWallet.address;
  }, [sourceType, account.address, nonEvmWallet.address]);

  const connectedChainType = useMemo<ChainType | null>(() => {
    if (hasMounted && account.status === "connected" && !!account.address) return "evm";
    if (nonEvmWallet.isConnected) return nonEvmWallet.chainType;
    return null;
  }, [hasMounted, account, nonEvmWallet]);

  const evmWalletConnected =
    hasMounted && account.status === "connected" && !!account.address;
  const promptChain = useMemo(
    () => (connectPrompt ? getBridgeChain(connectPrompt) : null),
    [connectPrompt],
  );
  const promptWalletDetected = promptChain
    ? promptChain.type === "evm"
      ? true
      : hasWalletForChain(promptChain.type)
    : false;
  const mismatchedWalletLabel = useMemo(() => {
    if (!promptChain) return null;
    if (promptChain.type === "evm") {
      if (nonEvmWallet.isConnected) {
        return `${chainNameForType(nonEvmWallet.chainType)} wallet`;
      }
      return null;
    }
    if (evmWalletConnected) return "EVM wallet";
    if (nonEvmWallet.isConnected && nonEvmWallet.chainType !== promptChain.type) {
      return `${chainNameForType(nonEvmWallet.chainType)} wallet`;
    }
    return null;
  }, [promptChain, evmWalletConnected, nonEvmWallet]);

  const sourceChainOptions = useMemo(() => {
    return BRIDGE_CHAIN_OPTIONS.filter(
      (option) => !HIDDEN_EVM_SOON_CHAIN_NAMES.has(option.name),
    );
  }, []);

  const amountRaw = useMemo(() => {
    try {
      return amount.trim() ? parseUsdcAmount(amount, source.decimals) : BigInt(0);
    } catch {
      return null;
    }
  }, [amount, source.decimals]);
  const recipientAddress = recipient.trim();
  const expectedAmount =
    amountRaw && amountRaw > maxFee ? amountRaw - maxFee : amountRaw ?? BigInt(0);
  const busy = !["idle", "success", "claimPending", "failed"].includes(phase);
  const displayAmount = amountFocused ? amount : formatInputAmount(amount);

  useEffect(() => {
    setManualSourceChainId(sourceChainId);
    setManualDestinationChainId(destinationChainId);
  }, [sourceChainId, destinationChainId]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!connectedChainType) return;
    if (sourceType === connectedChainType) return;

    const chainIdByType: Record<ChainType, number> = {
      evm: 1,
      solana: 5,
      starknet: 25,
      stellar: 27,
    };

    const targetChainId = chainIdByType[connectedChainType];
    if (targetChainId !== undefined) {
      setSourceChainId(targetChainId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedChainType]);

  useEffect(() => {
    if (sourceType === "evm") {
      if (hasMounted && account.status === "connected" && account.chainId === sourceChainId) {
        setSwitchError("");
      }
      return;
    }
    if (nonEvmWallet.isConnected && nonEvmWallet.chainType === sourceType) {
      setSwitchError("");
    }
  }, [hasMounted, sourceType, account.status, account.chainId, sourceChainId, nonEvmWallet]);

  useEffect(() => {
    if (!connectPrompt || !promptChain) return;
    if (promptChain.type === "evm") {
      if (evmWalletConnected) {
        setConnectPrompt(null);
        setConnectPromptError("");
        if (account.chainId && account.chainId !== promptChain.chainId) {
          void switchChainAsync({ chainId: promptChain.chainId }).catch(() => {
            setSwitchError(
              `Your wallet doesn't support ${promptChain.name}. Select ${promptChain.name} in your wallet's network settings to bridge from here.`,
            );
          });
        }
      }
      return;
    }
    if (nonEvmWallet.isConnected && nonEvmWallet.chainType === promptChain.type) {
      setConnectPrompt(null);
      setConnectPromptError("");
    }
  }, [connectPrompt, promptChain, evmWalletConnected, account.chainId, nonEvmWallet, switchChainAsync]);

  useEffect(() => {
    if (!connectPrompt) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [connectPrompt]);

  useEffect(() => {
    if (!hasMounted || hydrated) return;
    try {
      const raw = window.localStorage.getItem(BRIDGE_STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const parsed = JSON.parse(raw) as Partial<PersistedBridgeState>;
      setError("");
      setManualError("");
      setManualMessage("");
      setPhase("idle");
      setMessage("");
      setTx({});
      setAmount("");
      setRecipient("");
      if (Array.isArray(parsed.history)) {
        const restoredHistory = parsed.history.map((row) => ({
          ...row,
          amount: BigInt(String(row.amount)),
        }));
        const prunedHistory = pruneBridgeHistory(restoredHistory);
        setHistory(prunedHistory);
        const payload: PersistedBridgeState = {
          history: prunedHistory.map((row) => ({ ...row, amount: row.amount.toString() })),
          updatedAt: Date.now(),
        };
        window.localStorage.setItem(BRIDGE_STORAGE_KEY, JSON.stringify(payload));
      } else {
        window.localStorage.removeItem(BRIDGE_STORAGE_KEY);
      }
      setManualBurnHash("");
    } catch {
      window.localStorage.removeItem(BRIDGE_STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, [hasMounted, hydrated]);

  useEffect(() => {
    if (phase !== "claiming") return;
    const timer = setTimeout(() => {
      setPhase("claimPending");
      setMessage("Claim is taking longer than expected. Retry claim to continue.");
    }, 90_000);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    let cancelled = false;
    if (destination.type !== "solana" || !isValidRecipient(destination, recipient)) {
      setSolanaRecipientTokenAccount(null);
      return;
    }
    resolveSolanaRecipientTokenAccount(recipient, destination.usdc)
      .then((tokenAccount) => {
        if (!cancelled) setSolanaRecipientTokenAccount(tokenAccount);
      })
      .catch(() => {
        if (!cancelled) setSolanaRecipientTokenAccount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [destination, recipient]);

  useEffect(() => {
    if (!hasMounted || !hydrated) return;
    try {
      const prunedHistory = pruneBridgeHistory(history);
      if (prunedHistory.length !== history.length) {
        setHistory(prunedHistory);
        return;
      }
      const payload: PersistedBridgeState = {
        history: prunedHistory.map((row) => ({ ...row, amount: row.amount.toString() })),
        updatedAt: Date.now(),
      };
      window.localStorage.setItem(BRIDGE_STORAGE_KEY, JSON.stringify(payload));
    } catch {
    }
  }, [
    hasMounted,
    history,
    hydrated,
  ]);

  const loadBalance = useCallback(async (chain: BridgeChain, address: string) => {
    try {
      switch (chain.type) {
        case "evm":
          if (!isAddress(address)) return BigInt(0);
          return getEvmBalance(config, chain, address as `0x${string}`);
        case "solana":
          return getSolanaBalance(chain, address);
        case "starknet":
          return getStarknetBalance(chain, address);
        case "stellar":
          return getStellarBalance(chain, address);
      }
    } catch {
      return BigInt(0);
    }
  }, [config]);

  useEffect(() => {
    let active = true;

    async function refreshBalance() {
      if (!hasMounted || !walletAddress || !sourceSupported) {
        setBalance(BigInt(0));
        return;
      }
      const nextBalance = await loadBalance(source, walletAddress);
      if (active) setBalance(nextBalance);
    }

    void refreshBalance();
    return () => {
      active = false;
    };
  }, [walletAddress, config, hasMounted, source, sourceSupported, loadBalance]);

  useEffect(() => {
    if (mode === "fast" && !fastModeAvailable) {
      setMode("standard");
    }
  }, [fastModeAvailable, mode]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      async function loadFee() {
        if (!routeSupported || !amountRaw || amountRaw <= BigInt(0) || source.chainId === destination.chainId) {
          setFeeBps(null);
          setMaxFee(BigInt(0));
          setRouteFeeError("");
          return;
        }

        if (!supportsBridgeMode(source, mode)) {
          setFeeBps(null);
          setMaxFee(BigInt(0));
          setRouteFeeError(`Fast transfer is not available from ${source.name}.`);
          return;
        }

        try {
          setRouteFeeError("");
          const nextFeeBps = await fetchRouteFee(source.domain, destination.domain, mode);
          if (!active) return;
          setFeeBps(nextFeeBps);
          setMaxFee(estimateMaxFee(amountRaw, nextFeeBps));
        } catch {
          if (!active) return;
          setFeeBps(null);
          setMaxFee(BigInt(0));
          setRouteFeeError("This transfer route is currently unavailable for the selected speed.");
        }
      }

      void loadFee();
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [amountRaw, destination, mode, routeSupported, source]);

  useEffect(() => {
    if (phase !== "success") return;
    const timer = setTimeout(() => {
      resetBridgeUi();
    }, 2200);
    return () => clearTimeout(timer);
  }, [phase]);

  const validationError = useMemo(() => {
    if (sourceType !== "evm" && !nonEvmWallet.isConnected) {
      return `Connect your ${source.name} wallet to bridge USDC.`;
    }
    if (sourceType === "evm" && !connected) return "Connect a wallet to bridge USDC.";
    if (!routeSupported) {
      return "Unsupported route. Source and destination must be active chains.";
    }
    if (!amountRaw || amountRaw <= BigInt(0)) return "Enter a valid USDC amount.";
    if (source.chainId === destination.chainId) return "Choose two different chains.";
    if (!supportsBridgeMode(source, mode)) {
      return `Fast transfer is not available from ${source.name}. Switch to Standard.`;
    }
    if (!recipientAddress) {
      return "Please provide a recipient address to receive the bridged funds.";
    }
    if (!isValidRecipient(destination, recipientAddress)) {
      return `Enter a valid ${destination.name} recipient address.`;
    }
    if (routeFeeError) return routeFeeError;
    if (amountRaw > balance) return "Insufficient USDC balance on the source chain.";
    return "";
  }, [
    sourceType,
    nonEvmWallet.isConnected,
    connected,
    amountRaw,
    balance,
    source.name,
    source.chainId,
    destination.chainId,
    destination.name,
    destination,
    mode,
    routeSupported,
    routeFeeError,
    recipientAddress,
  ]);

  const switchSourceChain = async (nextChainId: number) => {
    if (nextChainId === source.chainId) return;
    const nextChain = getBridgeChain(nextChainId);
    setSourceChainId(nextChainId);
    setSwitchError("");
    setConnectPrompt(null);
    setConnectPromptError("");

    if (nextChain.type === "evm") {
      if (hasMounted && account.status === "connected" && !!account.address) {
        setMessage(`Switching wallet to ${nextChain.name}.`);
        try {
          await switchChainAsync({ chainId: nextChainId });
          setMessage("");
        } catch {
          setMessage("");
          setSwitchError(
            `Your wallet doesn't support ${nextChain.name}. Select ${nextChain.name} in your wallet's network settings to bridge from here.`,
          );
        }
        return;
      }
      setConnectPrompt(nextChainId);
      return;
    }

    if (nonEvmWallet.isConnected && nonEvmWallet.chainType === nextChain.type) {
      return;
    }

    setConnectPrompt(nextChain.chainId);
  };

  const confirmConnectPrompt = async () => {
    if (!promptChain) return;
    setConnectPromptError("");
    if (promptChain.type === "evm") {
      openConnectModal?.();
      return;
    }
    try {
      await connectWallet(promptChain.type);
      setConnectPrompt(null);
    } catch {
      setConnectPromptError(
        `Could not connect your ${promptChain.name} wallet. Please try again.`,
      );
    }
  };

  const dismissConnectPrompt = () => {
    setConnectPrompt(null);
    setConnectPromptError("");
  };

  const disconnectForPrompt = () => {
    if (account.status === "connected") evmDisconnect();
    void disconnectWallet();
    setConnectPromptError("");
  };

  const switchRoute = () => {
    setDestinationChainId(source.chainId);
    void switchSourceChain(destination.chainId);
  };

  const resetBridgeUi = useCallback(() => {
    setPhase("idle");
    setMessage("");
    setError("");
    setSwitchError("");
    setTx({});
    setAmount("");
  }, []);

  const selectMax = () => {
    setAmount(formatUsdc(balance, source.decimals));
  };

  const updateHistory = (burnHash: string, patch: Partial<BridgeHistoryItem>) => {
    setHistory((current) =>
      current.map((row) => (row.burnHash === burnHash ? { ...row, ...patch } : row)),
    );
  };

  const claimTransfer = async (burnHash: string, txSource: BridgeChain, txDestination: BridgeChain) => {
    setTx((current) => ({
      ...current,
      source: txSource,
      destination: txDestination,
      burnHash,
      claimHash: undefined,
    }));

    setPhase("attesting");
    setMessage("Waiting for Circle Iris to attest the burn.");
    updateHistory(burnHash, { status: "attesting", note: "Waiting for Circle attestation" });

    try {
      const status = await fetchAttestationStatus(txSource.domain, burnHash);
      if (status === "pending") {
        setPhase("claimPending");
        updateHistory(burnHash, { status: "claimPending", note: "Attestation still pending" });
        setAttestationPendingModal(true);
        return;
      }
    } catch {
      // Fall through to the polling loop below.
    }

    const attestation = await waitForCircleAttestation(txSource.domain, burnHash);
    if (!attestation) {
      setPhase("claimPending");
      setMessage(
        mode === "fast"
          ? "Fast transfer attestation is still pending. This can still take a few minutes; retry claim shortly."
          : "Standard transfer attestation is still pending. Retry claim shortly.",
      );
      updateHistory(burnHash, { status: "claimPending", note: "Attestation still pending" });
      setAttestationPendingModal(true);
      return;
    }

    setPhase("claiming");
    setMessage(`Minting USDC on ${txDestination.name}.`);
    updateHistory(burnHash, { status: "claiming", note: "Mint transaction submitted" });

    try {
      let claimHashValue: string;
      switch (txDestination.type) {
        case "evm": {
          if (!accountRef.current || accountRef.current.status !== "connected" || !accountRef.current.address) {
            setMessage(`Connect your EVM wallet to mint on ${txDestination.name}.`);
            openConnectModal();
            const started = Date.now();
            while (Date.now() - started < 120_000) {
              const latest = accountRef.current;
              if (latest.status === "connected" && latest.address) break;
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
            if (!accountRef.current?.address) {
              throw new Error("EVM wallet not connected. Connect your wallet and retry the claim.");
            }
          }
          if (accountRef.current.chainId !== txDestination.chainId) {
            setMessage(`Switching wallet to ${txDestination.name}.`);
            await Promise.race([
              switchChainAsync({ chainId: txDestination.chainId }),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Wallet switch to ${txDestination.name} timed out. Check your wallet and retry.`)), 30_000),
              ),
            ]);
          }
          claimHashValue = await Promise.race([
            receiveMessageEvm(config, {
              account: accountRef.current.address as `0x${string}`,
              destination: txDestination,
              attestation,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error(`Minting on ${txDestination.name} timed out. Check your wallet and retry.`)), 120_000),
            ),
          ]);
          break;
        }
        case "solana": {
          if (!hasWalletForChain("solana")) {
            throw new Error("Solana wallet not found. Install Phantom or Backpack to mint.");
          }
          if (!nonEvmWalletRef.current.isConnected || nonEvmWalletRef.current.chainType !== "solana") {
            setMessage("Connect your Solana wallet to mint.");
            await connectWallet("solana");
          }
          claimHashValue = await receiveMessageSolana(txDestination, attestation);
          break;
        }
        case "starknet":
          if (!hasWalletForChain("starknet")) {
            throw new Error("Starknet wallet not found. Install Argent X or Braavos to mint.");
          }
          if (!nonEvmWalletRef.current.isConnected || nonEvmWalletRef.current.chainType !== "starknet") {
            setMessage("Connect your Starknet wallet to mint.");
            await connectWallet("starknet");
          }
          claimHashValue = await receiveMessageStarknet(txDestination, attestation);
          break;
        case "stellar":
          if (!hasWalletForChain("stellar")) {
            throw new Error("Stellar wallet not found. Install Freighter to mint.");
          }
          if (!nonEvmWalletRef.current.isConnected || nonEvmWalletRef.current.chainType !== "stellar") {
            setMessage("Connect your Stellar wallet to mint.");
            await connectWallet("stellar");
          }
          claimHashValue = await receiveMessageStellar(txDestination, attestation);
          break;
        default:
          throw new Error(`Unsupported destination chain: ${txDestination.type}`);
      }
      setTx((current) => ({ ...current, destination: txDestination, claimHash: claimHashValue as `0x${string}` }));
      updateHistory(burnHash, { claimHash: claimHashValue, note: "Waiting for destination confirmation" });
      setPhase("success");
      setMessage("USDC has been minted on the destination chain.");
      updateHistory(burnHash, { status: "success", note: "USDC minted successfully" });
    } catch (claimError) {
      console.error("Claim failed:", claimError);
      setPhase("failed");
      setMessage("");
      setError(simplifyBridgeError(claimError));
      updateHistory(burnHash, { status: "failed", note: "Mint failed. Retry available." });
    }
  };

  const startBridge = async () => {
    setError("");
    setMessage("");
    setSwitchError("");
    let submittedBurnHash: string | undefined;

    if (sourceType === "evm") {
      if (!evmWalletConnected) {
        setConnectPrompt(source.chainId);
        setConnectPromptError("");
        return;
      }
    } else if (!nonEvmWallet.isConnected || nonEvmWallet.chainType !== sourceType) {
      setConnectPrompt(source.chainId);
      setConnectPromptError("");
      return;
    }

    if (validationError) {
      setPhase("failed");
      setError(validationError);
      return;
    }

    if (!walletAddress || !amountRaw || !recipientAddress) {
      setPhase("failed");
      setError("Wallet is not ready for signing.");
      return;
    }
    setTx({});

    try {
      setPhase("checking");
      setMessage("Checking route details.");
      setTx({ source, destination, claimHash: undefined });

      let burnHashValue: string;

      const cctpRecipient =
        destination.type === "solana"
          ? await resolveSolanaRecipientTokenAccount(recipientAddress, destination.usdc)
          : recipientAddress;

      const routeFeeBps = feeBps ?? (await fetchRouteFee(source.domain, destination.domain, mode));
      const routeMaxFee = estimateMaxFee(amountRaw, routeFeeBps);
      setFeeBps(routeFeeBps);
      setMaxFee(routeMaxFee);

      switch (source.type) {
        case "evm": {
          if (!accountRef.current?.address) throw new Error("EVM wallet not connected.");
          if (accountRef.current.chainId !== source.chainId) {
            setMessage(`Switching wallet to ${source.name}.`);
            await switchChainAsync({ chainId: source.chainId });
            const switched = await waitForChainId(accountRef, source.chainId);
            if (!switched) {
              throw new Error(`Wallet is still on the wrong network. Switch to ${source.name} in your wallet and retry.`);
            }
          }

          const allowance = await getEvmAllowance(config, source, accountRef.current.address as `0x${string}`);
          if (allowance < amountRaw) {
            setPhase("approving");
            setMessage("Waiting for you to approve the transaction");
            await approveEvmUsdc(config, source, accountRef.current.address as `0x${string}`, amountRaw);
          }

          setPhase("burning");
          setMessage(`Burning USDC on ${source.name}.`);
          burnHashValue = await depositForBurnEvm(config, {
            config,
            account: accountRef.current.address as `0x${string}`,
            source,
            destination,
            amount: amountRaw,
            recipient: cctpRecipient,
            mode,
            maxFee: routeMaxFee,
          });
          break;
        }
        case "solana": {
          setPhase("burning");
          setMessage(`Burning USDC on ${source.name}.`);
          const solRecipientBytes = await addressToBytes32(cctpRecipient, destination.type);
          burnHashValue = await depositForBurnSolana(
            source,
            destination.domain,
            amountRaw,
            solRecipientBytes,
            routeMaxFee,
            getFinalityThreshold(mode),
          );
          break;
        }
        case "starknet": {
          setPhase("burning");
          setMessage(`Burning USDC on ${source.name}.`);
          const strkRecipientBytes = await addressToBytes32(cctpRecipient, destination.type);
          burnHashValue = await depositForBurnStarknet(
            source,
            destination.domain,
            amountRaw,
            strkRecipientBytes,
            routeMaxFee,
            getFinalityThreshold(mode),
          );
          break;
        }
        case "stellar": {
          setPhase("burning");
          setMessage(`Burning USDC on ${source.name}.`);
          const stelRecipientBytes = await addressToBytes32(cctpRecipient, destination.type);
          burnHashValue = await depositForBurnStellar(
            source,
            destination.domain,
            amountRaw,
            stelRecipientBytes,
          );
          break;
        }
        default:
          throw new Error(`Unsupported source chain: ${source.type}`);
      }

      submittedBurnHash = burnHashValue;
      setTx({ source, destination, burnHash: burnHashValue, claimHash: undefined });
      setHistory((current) => [
        {
          id: `${burnHashValue}-${Date.now()}`,
          createdAt: Date.now(),
          source: { ...source },
          destination: { ...destination },
          amount: amountRaw,
          burnHash: burnHashValue,
          status: "pending",
          note: "Burn transaction submitted",
        },
        ...current,
      ]);
      if (source.type === "evm") {
        await waitForTransactionReceipt(config, { hash: burnHashValue as `0x${string}`, chainId: source.chainId });
      }
      await claimTransfer(burnHashValue, source, destination);
    } catch (bridgeError) {
      setPhase("failed");
      setError(simplifyBridgeError(bridgeError));
      const latestBurnHash = submittedBurnHash ?? tx.burnHash;
      if (latestBurnHash) {
        updateHistory(latestBurnHash, { status: "failed", note: "Claim failed. Retry available." });
      }
    }
  };

  const retryClaim = async () => {
    if (!tx.burnHash || !tx.source || !tx.destination) return;
    try {
      setError("");
      setTx((current) => ({ ...current, claimHash: undefined }));
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
    setTx({ source: sourceChain, destination: destinationChain, burnHash, claimHash: undefined });
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
        <h1>
          Bridge native USDC <br />
          across chains
        </h1>
        <p>
          Move USDC between blockchains smoothly and securely without the
          complexity of traditional bridges, via Circle's CCTP.
        </p>
      </div>

      <div className={styles.bridgeLayout}>
        <article className={styles.bridgeCard}>
          <div className={styles.routeGrid}>
            <ChainSelect
              label="From"
              chainId={source.chainId}
              onChange={(chainId) => void switchSourceChain(chainId)}
              balance={formatUsdc(balance, source.decimals)}
              amountValue={displayAmount}
              amountPlaceholder="0.00"
              onAmountChange={(value) => setAmount(value)}
              onAmountFocus={() => setAmountFocused(true)}
              onAmountBlur={() => setAmountFocused(false)}
              showMaxButton
              onMax={selectMax}
              maxDisabled={!connected || balance <= BigInt(0)}
              connectedWallet={walletAddress}
              chainOptions={sourceChainOptions}
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
              amountValue={
                amountRaw && amountRaw > BigInt(0)
                  ? formatUsdc(expectedAmount, source.decimals)
                  : ""
              }
              amountPlaceholder="0.00"
              amountReadOnly
              connectedWallet={walletAddress}
            />
          </div>

          <div
            className={styles.modeControl}
            role="tablist"
            aria-label="Transfer speed"
          >
            {(["standard", "fast"] as BridgeMode[]).map((option) => (
              <button
                key={option}
                type="button"
                className={classNames(
                  styles.modeButton,
                  mode === option && styles.modeActive,
                  option === "fast" && !fastModeAvailable && styles.modeDisabled,
                )}
                onClick={() => {
                  if (option === "fast" && !fastModeAvailable) return;
                  setMode(option);
                }}
                disabled={option === "fast" && !fastModeAvailable}
              >
                {mode === option ? <span className={styles.modePill} /> : null}
                <span>{option === "standard" ? "Standard" : "Fast"}</span>
              </button>
            ))}
          </div>

          <div className={classNames(styles.statusPanel, styles.statusInfo)}>
            {!fastModeAvailable
              ? `Fast transfer is not available from ${source.name}. Standard transfer will be used for this route.`
              : mode === "standard"
              ? "Standard mode is free, but may take about 1 hour or more to complete transactions depending on network conditions."
              : "Fast mode makes transactions faster but incurs a fee."}
          </div>

          <div className={styles.inputPanel}>
            <label htmlFor="bridge-recipient">Recipient</label>
            <input
              id="bridge-recipient"
              value={recipient}
              placeholder={`Input ${destination.shortName} address`}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>

          {destination.type === "solana" && solanaRecipientTokenAccount && (
            <div className={styles.statusPanel}>
              USDC will be minted to your token account: {solanaRecipientTokenAccount}
            </div>
          )}

          <div className={styles.quoteBox}>
            <QuoteRow
              label="Fee"
              value={
                routeFeeError
                  ? routeFeeError
                  : feeBps === null
                    ? "Fetching route fee"
                    : `${feeBps} bps`
              }
            />
            <QuoteRow label="Max fee" value={`${formatUsdc(maxFee, source.decimals)} USDC`} />
            <QuoteRow
              label="Expected receive"
              value={`${formatUsdc(expectedAmount, source.decimals)} USDC`}
              strong
            />
          </div>

          {(error ||
            validationError ||
            switchError ||
            phase === "success" ||
            phase === "claimPending") && (
            <div
              key={`${phase}-${error || validationError || switchError || message}`}
              className={classNames(
                styles.statusPanel,
                phase === "success" && styles.statusSuccess,
                phase === "claimPending" && styles.statusWarning,
                (error || validationError || switchError) &&
                  phase !== "success" &&
                  styles.statusError,
              )}
            >
              {phase === "success"
                ? message
                : error || switchError || validationError || message}
            </div>
          )}

          <button
            type="button"
            className={styles.primaryButton}
            disabled={busy || !!validationError || (sourceType !== "evm" && !connected)}
            onClick={startBridge}
          >
            <span>
              {busy
                ? message || "Working..."
                : sourceType !== "evm" && !connected
                  ? `Connect ${source.name} wallet`
                  : validationError
                    ? "Review bridge details"
                    : "Bridge USDC"}
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
              const currentIndex = STEPS.findIndex(
                (item) => item.key === phase,
              );
              const complete =
                phase === "success" ||
                (currentIndex > index && currentIndex !== -1);
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
                    <small>
                      {active
                        ? message || "In progress"
                        : complete
                          ? "Complete"
                          : "Waiting"}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.historyPanel}>
            <p className={styles.historyTitle}>Bridge history</p>
            {history.length === 0 ? (
              <span className={styles.historyEmpty}>
                No bridge transactions yet.
              </span>
            ) : (
              <div className={styles.historyTableWrap}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Tx</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row) => {
                      return (
                        <tr key={row.id}>
                          <td>
                            <div className={styles.routeCell}>
                              <ChainIcon chain={row.source} />
                              <span>
                                {row.source.shortName} to{" "}
                                {row.destination.shortName}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.txCell}>
                              <a
                                href={row.source.explorer + row.burnHash}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.txLink}
                                title={row.burnHash}
                              >
                                {`${row.burnHash.slice(0, 6)}...`}
                              </a>
                              <button
                                type="button"
                                className={styles.copyBtn}
                                onClick={() => navigator.clipboard.writeText(row.burnHash)}
                                title="Copy transaction hash"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td>
                            {row.amount > BigInt(0)
                              ? `${formatUsdc(row.amount, row.source.decimals ?? 6)} USDC`
                              : "-"}
                          </td>
                          <td>
                            <span
                              className={classNames(
                                styles.statusChip,
                                statusChipClass(row.status),
                              )}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td>
                            {row.status !== "success" && (
                              <button
                                type="button"
                                className={styles.reclaimInline}
                                onClick={() => void startRowReclaim(row)}
                              >
                                Reclaim
                              </button>
                            )}
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
            <small>
              Paste burn hash and retry mint if Circle attestation was delayed.
            </small>
            <input
              value={manualBurnHash}
              onChange={(event) => setManualBurnHash(event.target.value)}
              placeholder="Enter burn transaction hash"
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
              <div
                className={classNames(styles.statusPanel, styles.statusError)}
              >
                {manualError}
              </div>
            ) : null}
            {manualMessage ? (
              <div
                className={classNames(styles.statusPanel, styles.statusInfo)}
              >
                {manualMessage}
              </div>
            ) : null}
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => void manualClaim()}
            >
              Claim with burn hash
            </button>
          </div>
        </aside>
      </div>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {connectPrompt && promptChain ? (
                <motion.div
                  className={styles.modalOverlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) dismissConnectPrompt();
                  }}
                >
                  <motion.div
                    className={styles.modalCard}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="connect-prompt-title"
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className={styles.modalHeader}>
                      <ChainIcon chain={promptChain} />
                      <h3 id="connect-prompt-title">
                        {promptChain.type === "evm"
                          ? "Connect an EVM wallet"
                          : `Connect a ${promptChain.name} wallet`}
                      </h3>
                      <button
                        type="button"
                        className={styles.modalClose}
                        onClick={dismissConnectPrompt}
                        aria-label="Close"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>

                    <div className={styles.modalBody}>
                      {mismatchedWalletLabel ? (
                        <p>
                          Your connected {mismatchedWalletLabel} doesn't support{" "}
                          {promptChain.name}.
                        </p>
                      ) : null}
                      <p>
                        {promptChain.type === "evm"
                          ? `Connect an EVM wallet to bridge USDC from ${promptChain.name}.`
                          : promptWalletDetected
                            ? `Connect your ${promptChain.name} wallet to bridge USDC from ${promptChain.name}.`
                            : `No ${promptChain.name} wallet detected. Install ${WALLET_HINT[promptChain.type as Exclude<ChainType, "evm">]} to bridge USDC from ${promptChain.name}.`}
                      </p>
                    </div>

                    {connectPromptError ? (
                      <div className={classNames(styles.statusPanel, styles.statusError)}>
                        {connectPromptError}
                      </div>
                    ) : null}

                    <div className={styles.modalActions}>
                      {promptChain.type === "evm" ? (
                        <button
                          type="button"
                          className={styles.primaryButton}
                          onClick={() => void confirmConnectPrompt()}
                        >
                          Connect EVM wallet
                        </button>
                      ) : promptWalletDetected ? (
                        <button
                          type="button"
                          className={styles.primaryButton}
                          disabled={nonEvmWallet.connecting}
                          onClick={() => void confirmConnectPrompt()}
                        >
                          {nonEvmWallet.connecting
                            ? `Connecting ${promptChain.name} wallet...`
                            : `Connect ${promptChain.name} wallet`}
                        </button>
                      ) : (
                        <a
                          href={WALLET_INSTALL_URL[promptChain.type as Exclude<ChainType, "evm">]}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.primaryButton}
                          onClick={dismissConnectPrompt}
                        >
                          Install {WALLET_HINT[promptChain.type as Exclude<ChainType, "evm">]}
                        </a>
                      )}

                      {mismatchedWalletLabel ? (
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={disconnectForPrompt}
                        >
                          Disconnect current wallet
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={dismissConnectPrompt}
                        >
                          Not now
                        </button>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}

              {attestationPendingModal ? (
                <motion.div
                  className={styles.modalOverlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setAttestationPendingModal(false);
                  }}
                >
                  <motion.div
                    className={styles.modalCard}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="attestation-pending-title"
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <div className={styles.modalHeader}>
                      <h3 id="attestation-pending-title">Transaction still confirming</h3>
                      <button
                        type="button"
                        className={styles.modalClose}
                        onClick={() => setAttestationPendingModal(false)}
                        aria-label="Close"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>

                    <div className={styles.modalBody}>
                      <p>
                        Your burn transaction is still being confirmed on the blockchain. Circle
                        needs a few more minutes to attest it before you can mint USDC on the
                        destination chain.
                      </p>
                      <p>Please wait a moment and try again.</p>
                    </div>

                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => setAttestationPendingModal(false)}
                      >
                        Got it
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}

      <footer className="mt-20">
        
        <p className="text-center opacity-50 text-[14px]">© {new Date().getFullYear()} Kwizerana DAO</p>
      </footer>
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
  connectedWallet,
  chainOptions: chainOptionsProp,
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
  connectedWallet?: string | null;
  chainOptions?: BridgeChainOption[];
}) {
  const chain = getBridgeChain(chainId);
  const chainOptions = (chainOptionsProp ?? BRIDGE_CHAIN_OPTIONS).filter((option) => !HIDDEN_EVM_SOON_CHAIN_NAMES.has(option.name));
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
              {chainOptions.map((option) => {
                const selected = option.chainId === chainId;
                return (
                  <button
                    key={`${option.domain}-${option.name}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.status !== "active"}
                    className={classNames(
                      styles.chainOption,
                      selected && styles.chainOptionActive,
                      option.status !== "active" && styles.chainOptionPlanned,
                    )}
                    onClick={() => {
                      if (option.chainId) onChange(option.chainId);
                      setMenuOpen(false);
                    }}
                  >
                    <ChainIcon chain={option} />
                    <span>{option.name}</span>
                    {option.status !== "active" ? <span className={styles.chainBadge}>Soon</span> : null}
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
  const chainOptions = BRIDGE_CHAIN_OPTIONS.filter((option) => !HIDDEN_EVM_SOON_CHAIN_NAMES.has(option.name));
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

  const measureMenuHeight = () => {
    if (!menuRef.current) return 0;

    const probe = document.createElement("div");
    probe.className = styles.chainMenu;
    probe.style.position = "fixed";
    probe.style.left = "-99999px";
    probe.style.top = "0";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.width = `${menuRef.current.offsetWidth}px`;

    for (const option of chainOptions) {
      const row = document.createElement("div");
      row.className = styles.chainOption;
      row.textContent = option.name;
      probe.appendChild(row);
    }

    document.body.appendChild(probe);
    const height = probe.getBoundingClientRect().height || probe.scrollHeight || 0;
    document.body.removeChild(probe);
    return height;
  };

  const computeMenuDirection = () => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const menuHeight = measureMenuHeight();
    setOpenAbove(spaceBelow < menuHeight);
  };

  return (
    <div className={styles.manualChainField} ref={menuRef}>
      <small>{label}</small>
      <button
        type="button"
        className={styles.chainTrigger}
        onClick={() => {
          const nextOpen = !menuOpen;
          if (nextOpen) {
            computeMenuDirection();
          }
          setMenuOpen(nextOpen);
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
            {chainOptions.map((option) => {
              const selected = option.chainId === chainId;
              return (
                <button
                  key={`manual-${label}-${option.domain}-${option.name}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={option.status !== "active"}
                  className={classNames(
                    styles.chainOption,
                    selected && styles.chainOptionActive,
                    option.status !== "active" && styles.chainOptionPlanned,
                  )}
                  onClick={() => {
                    if (option.chainId) onChange(option.chainId);
                    setMenuOpen(false);
                  }}
                >
                  <ChainIcon chain={option} />
                  <span>{option.name}</span>
                  {option.status !== "active" ? <span className={styles.chainBadge}>Soon</span> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ChainIcon({
  chain,
}: {
  chain: { shortName: string; accent: string; icon?: string };
}) {
  const icon = getChainIcon(chain.shortName);

  return (
    <span
      className={styles.chainIcon}
      style={chain.icon ? undefined : { background: chain.accent }}
    >
      {chain.icon ? (
        <img src={chain.icon} alt="" aria-hidden="true" />
      ) : (
        icon ?? <span className={styles.chainIconFallback}>{chain.shortName.slice(0, 4)}</span>
      )}
    </span>
  );
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

  if (key === "INJ") {
    return (
      <svg viewBox="0 0 400 400" aria-hidden="true">
        <defs>
          <linearGradient id="inj-grad-a" x1="0" y1="217.64" x2="400" y2="217.64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0082FA" />
            <stop offset="1" stopColor="#00F2FE" />
          </linearGradient>
          <linearGradient id="inj-grad-b" x1="0" y1="182.36" x2="400" y2="182.36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0082FA" />
            <stop offset="1" stopColor="#00F2FE" />
          </linearGradient>
        </defs>
        <path
          fill="url(#inj-grad-a)"
          d="M48.5 69.1c2.5-3.1 5.1-6.1 7.7-9.1.1-.1.4-.2.5-.3.2-.3.6-.5.9-.8l.2-.3c1.8-1.7 3.8-3.5 6-5.2 8-6 16.2-10.6 24.9-13.7 28-9.8 59.1-3.8 83.5 19.3 34.1 31.9 31 83.4 3.8 117.6-34.4 51-93.4 122.1-11.7 185.8 14.7 11.5 25.6 20.9 71.9 34.3-30.3 5.6-58.4 3.8-89.6-4.1-22.1-12.5-56.9-39.2-68.7-75.3-17.9-54.7 31.5-136.6 55.3-168.1 32.7-43.6-20.2-90.8-59.3-38.1C53.7 138.6 18 216.3 30.4 274c7.2 32.7 16.9 56.5 55.2 89.3-7.1-4.2-14-8.9-20.7-14.3C-24 266.1-13.7 137.9 48.5 69.1Z"
        />
        <path
          fill="url(#inj-grad-b)"
          d="M351.5 330.9c-2.5 3.1-5.1 6.1-7.7 9.1-.1.1-.4.2-.5.3-.2.3-.6.5-.9.8l-.2.3c-1.8 1.7-3.8 3.5-6 5.1-8 6-16.2 10.6-24.9 13.7-28 9.8-59.1 3.8-83.5-19.3-34.1-31.9-31-83.4-3.8-117.6 34.4-51 93.4-122.1 11.7-185.8-14.7-11.5-25.6-20.9-71.9-34.3 30.3-5.6 58.4-3.8 89.6 4.1 22.1 12.5 56.9 39.2 68.7 75.3 17.9 54.7-31.5 136.6-55.3 168.1-32.7 43.6 20.2 90.8 59.3 38.1 20.4-27.5 56.1-105.2 43.7-162.9-7.2-32.7-16.9-56.5-55.2-89.3 7.1 4.2 14 8.9 20.7 14.3C424 133.9 413.7 262.1 351.5 330.9Z"
        />
      </svg>
    );
  }

  if (key === "POLYGON") {
    return (
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <path d="M64 0c35.348 0 64 28.652 64 64s-28.652 64-64 64S0 99.348 0 64 28.652 0 64 0zm0 0" fill="#fff"/>
        <path d="M83.414 50.422c-1.238-.715-2.855-.715-4.094 0l-9.555 5.52-6.492 3.59-9.554 5.52c-1.238.715-2.855.715-4.094 0l-7.586-4.41c-1.238-.715-2.094-2.078-2.094-3.508v-8.781c0-1.43.715-2.793 2.094-3.508l7.586-4.41c1.238-.715 2.855-.715 4.094 0l7.586 4.41c1.238.715 2.094 2.078 2.094 3.508v5.52l6.492-3.73v-5.66c0-1.43-.715-2.793-2.094-3.508l-13.96-8.082c-1.238-.715-2.855-.715-4.094 0L40.45 46.082c-1.238.715-2.234 2.078-2.234 3.508v16.164c0 1.43.855 2.793 2.094 3.508l14.102 8.082c1.238.715 2.855.715 4.094 0l9.554-5.52 6.492-3.73 9.554-5.52c1.238-.715 2.855-.715 4.094 0l7.586 4.41c1.238.715 2.094 2.078 2.094 3.508v8.781c0 1.43-.715 2.793-2.094 3.508l-7.586 4.41c-1.238.715-2.855.715-4.094 0l-7.586-4.41c-1.238-.715-2.094-2.078-2.094-3.508v-5.52l-6.492 3.73v5.66c0 1.43.715 2.793 2.094 3.508l14.102 8.082c1.238.715 2.855.715 4.094 0L97.59 98.168c1.238-.715 2.094-2.078 2.094-3.508V78.496c0-1.43-.715-2.793-2.094-3.508z" fill="#8247e5"/>
      </svg>
    );
  }

  if (key === "SOL") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="sol-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#9945FF"/>
            <stop offset="1" stopColor="#14F195"/>
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="url(#sol-grad)" />
        <path d="M7 14.5h10l-2-2.5H9l-2 2.5zm0-5h10l-2 2.5H9l-2-2.5z" fill="#fff"/>
      </svg>
    );
  }

  if (key === "STRK") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#fc5b3f" />
        <text x="12" y="15" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">
          STRK
        </text>
      </svg>
    );
  }

  if (key === "XLM") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#7d8cff" />
        <text x="12" y="15" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff">
          XLM
        </text>
      </svg>
    );
  }

  return null;
}

function QuoteRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={classNames(styles.quoteRow, strong && styles.quoteStrong)}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
