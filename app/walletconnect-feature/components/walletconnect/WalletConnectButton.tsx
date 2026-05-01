"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
                <span className={styles.connectedAddress}>{displayAddress}</span>
              </span>
              <span className={classNames(styles.caret, menuOpen && styles.caretOpen)}>
                <CaretIcon />
              </span>
            </button>

            {menuOpen ? (
                <div className={styles.menu} role="menu">
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
                </div>
            ) : null}
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
