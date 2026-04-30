"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";
import type { WalletDetailsResponse } from "../../types/walletTypes";
import { formatCurrencyUsd, shortenAddress } from "../../services/format";
import styles from "./WalletConnectButton.module.css";

type Props = {
  className?: string;
  label?: string;
};

type MenuItem = {
  key: string;
  label: string;
  href?: string;
  onSelect?: () => void;
  icon?: React.ReactNode;
};

function classNames(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export default function WalletConnectButton({
  className,
  label = "Connect Wallet",
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const accountState = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (!accountState.address || accountState.status !== "connected") {
      setPortfolioValue(null);
      return () => {
        active = false;
        if (timer) clearTimeout(timer);
      };
    }

    const scheduleNext = (delayMs: number) => {
      if (!active) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void run();
      }, delayMs);
    };

    const run = async () => {
      try {
        const query = new URLSearchParams({ address: accountState.address });
        if (accountState.chainId) query.set("chainId", String(accountState.chainId));

        const response = await fetch(`/api/walletconnect/details?${query.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) throw new Error("Could not fetch portfolio value.");

        const payload = (await response.json()) as WalletDetailsResponse;
        if (!active) return;
        setPortfolioValue(formatCurrencyUsd(payload.valuation.totalUsd));
        scheduleNext(10_000);
      } catch {
        if (!active) return;
        setPortfolioValue(null);
        scheduleNext(3_000);
      }
    };

    void run();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [accountState.address, accountState.chainId, accountState.status]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      const target = event.target as Node;
      if (!rootRef.current.contains(target)) {
        setMenuOpen(false);
      }
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
            {(() => {
              const menuItems: MenuItem[] = [
                {
                  key: "dashboard",
                  label: "Dashboard",
                  href: "#",
                  icon: <DashboardIcon />,
                },
                {
                  key: "disconnect",
                  label: "Disconnect",
                  onSelect: () => {
                    disconnect();
                    setMenuOpen(false);
                  },
                  icon: <DisconnectIcon />,
                },
              ];

              return (
                <>
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
                    {portfolioValue ? (
                      <>
                        <span className={styles.connectedDivider} aria-hidden="true" />
                        <span className={styles.connectedBalance}>{portfolioValue}</span>
                      </>
                    ) : null}
                    <span className={classNames(styles.caret, menuOpen && styles.caretOpen)}>
                      <CaretIcon />
                    </span>
                  </button>

                  <AnimatePresence>
                    {menuOpen ? (
                      <motion.div
                        className={styles.menu}
                        role="menu"
                        initial={{ opacity: 0, y: 10, scale: 0.90 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.90 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      >
                        {menuItems.map((item) =>
                          item.href ? (
                            <Link
                              key={item.key}
                              href={item.href}
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => setMenuOpen(false)}
                            >
                              {item.icon ? item.icon : null}
                              {item.label}
                            </Link>
                          ) : (
                            <button
                              key={item.key}
                              type="button"
                              onClick={item.onSelect}
                              className={styles.menuItem}
                              role="menuitem"
                            >
                              {item.icon ? item.icon : null}
                              {item.label}
                            </button>
                          ),
                        )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </>
              );
            })()}
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
      viewBox="166.3675 116.4848 111.146 89.2525"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M 106.146 27 L 19 27 C 19 27 14 26 14 23 L 107.146 16 L 107.146 10 C 107.146 10 106.259 4.524 98.146 6 L 13 17 C 13 17 5 18 5 28 L 5 85 C 5 90.522 9.477 95 15 95 L 106.146 95 C 111.669 95 116.146 90.522 116.146 85 L 116.146 37 C 116.146 31.478 111.669 27 106.146 27 Z M 100.146 68 C 96.28 68 93.146 64.866 93.146 61 C 93.146 57.134 96.28 54 100.146 54 C 104.012 54 107.146 57.134 107.146 61 C 107.146 64.866 104.012 68 100.146 68 Z"
        id="object-1"
        transform="matrix(1, 0, 0, 1, 161.3675079345703, 110.73737335205078)"
      />
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

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className={styles.menuIcon} fill="none" aria-hidden="true">
      <path
        d="M4 13h6V4H4v9zm10 7h6V4h-6v16zM4 20h6v-5H4v5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
