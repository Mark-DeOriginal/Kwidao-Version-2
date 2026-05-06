"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { AnimatePresence, motion } from "framer-motion";
import { useAccount, useDisconnect } from "wagmi";
import { shortenAddress } from "../../services/format";
import styles from "./WalletConnectButton.module.css";

type Props = {
  className?: string;
  label?: string;
};

function classNames(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export default function WalletConnectButton({
  className,
  label = "Connect Wallet",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const accountState = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setMenuOpen(false);
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        authenticationStatus,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          accountState.status === "connected" &&
          !!accountState.address &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        const displayAddress =
          account?.displayName ||
          (accountState.address ? shortenAddress(accountState.address, 6, 4) : "");
        const displayChain = chain?.name || "Unknown";

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className={classNames(styles.connectButton, className)}
            >
              <WalletIcon />
              {label}
            </button>
          );
        }

        if (chain?.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={classNames(styles.warningButton, className)}
            >
              <WalletIcon />
              Switch Network
            </button>
          );
        }

        return (
          <div ref={rootRef} className={styles.menuRoot}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={classNames(styles.connectedButton, className)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Wallet account menu"
            >
              <span className={styles.connectedMain}>
                <WalletIcon />
                <span className={styles.connectedAddress}>
                  <span className="inline max-[570px]:hidden">{displayAddress}</span>
                  <span className="hidden max-[570px]:inline">{displayAddress.slice(0, 4)}</span>
                </span>
                <span className={styles.connectedDivider} />
                <span className={styles.connectedChain}>
                  <ChainIcon chainName={displayChain} />
                  <span className={styles.chainName}>{displayChain}</span>
                </span>
              </span>
              <span className={classNames(styles.caret, menuOpen && styles.caretOpen)}>
                <CaretIcon />
              </span>
            </button>

            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  className={styles.menu}
                  role="menu"
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                >
                  <Link
                    href="/usdc-bridge"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    <BridgeIcon />
                    USDC Bridge
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!accountState.address) return;
                      try {
                        await navigator.clipboard.writeText(accountState.address);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1200);
                      } catch {
                        setCopied(false);
                      }
                    }}
                    className={styles.menuItem}
                    role="menuitem"
                  >
                    <CopyIcon />
                    {copied ? "Copied" : "Copy Address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      disconnect();
                      setMenuOpen(false);
                    }}
                    className={styles.menuItem}
                    role="menuitem"
                  >
                    <DisconnectIcon />
                    Disconnect
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}

function WalletIcon() {
  return (
    <svg
      className={styles.walletIcon}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 7.5h14A2.5 2.5 0 0121 10v7a2.5 2.5 0 01-2.5 2.5h-14A2.5 2.5 0 012 17V7.5A2.5 2.5 0 014.5 5h12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17 13.5h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function CaretIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={styles.caretIcon} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DisconnectIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.disconnectIcon} fill="none" aria-hidden="true">
      <path
        d="M10 7.5V6a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2h-6a2 2 0 01-2-2v-1.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 12H4m0 0l3-3m-3 3l3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BridgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.menuIcon} fill="none" aria-hidden="true">
      <path
        d="M7 8h10m0 0l-3-3m3 3l-3 3M17 16H7m0 0l3-3m-3 3l3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.menuIcon} fill="none" aria-hidden="true">
      <path
        d="M9 9.5A1.5 1.5 0 0 1 10.5 8h8A1.5 1.5 0 0 1 20 9.5v10a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 9 19.5v-10Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M15 8V6.5A1.5 1.5 0 0 0 13.5 5h-8A1.5 1.5 0 0 0 4 6.5v10A1.5 1.5 0 0 0 5.5 18H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChainIcon({ chainName }: { chainName: string }) {
  return (
    <span className={styles.chainIcon}>
      {getChainIcon(chainName)}
    </span>
  );
}

function getChainIcon(chainName: string) {
  const name = chainName.toUpperCase();

  // Map full chain names to short codes
  const shortNameMap: Record<string, string> = {
    ETHEREUM: "ETH",
    "ETHEREUM MAINNET": "ETH",
    AVALANCHE: "AVAX",
    "AVALANCHE C-CHAIN": "AVAX",
    "OPTIMISM MAINNET": "OP",
    OPTIMISM: "OP",
    ARBITRUM: "ARB",
    "ARBITRUM ONE": "ARB",
    BASE: "BASE",
    "BASE MAINNET": "BASE",
  };

  const key = shortNameMap[name] || name.slice(0, 3).toUpperCase();

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

  // Fallback icon
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1C2A3D" />
    </svg>
  );
}
