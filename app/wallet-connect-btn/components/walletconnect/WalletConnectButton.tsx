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
              <span className="inline max-[435px]:hidden">{label}</span>
              <span className="hidden max-[435px]:inline">Connect</span>
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
  const iconPath = getChainIconPath(chainName);

  return (
    <span className={styles.chainIcon}>
      {iconPath ? (
        <img src={iconPath} alt="" aria-hidden="true" />
      ) : (
        getChainIcon(chainName)
      )}
    </span>
  );
}

function getChainIconPath(chainName: string) {
  const name = chainName.toUpperCase();

  const pathMap: Record<string, string> = {
    UNICHAIN: "/chains/unichain.svg",
    LINEA: "/chains/linea.svg",
    SONIC: "/chains/sonic.svg",
    "WORLD CHAIN": "/chains/world.svg",
    WORLDCHAIN: "/chains/world.svg",
    MONAD: "/chains/monad.svg",
    SEI: "/chains/sei.svg",
    XDC: "/chains/xdc.svg",
    HYPEREVM: "/chains/hyperevm.svg",
    "HYPER EVM": "/chains/hyperevm.svg",
    INK: "/chains/ink.svg",
    PLUME: "/chains/plume.svg",
    "PLUME MAINNET": "/chains/plume.svg",
    MORPH: "/chains/morph.svg",
  };

  return pathMap[name] || "";
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
    POLYGON: "POLYGON",
    INJECTIVE: "INJ",
    "INJECTIVE EVM": "INJ",
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
          <linearGradient id="wallet-inj-grad-a" x1="0" y1="217.64" x2="400" y2="217.64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0082FA" />
            <stop offset="1" stopColor="#00F2FE" />
          </linearGradient>
          <linearGradient id="wallet-inj-grad-b" x1="0" y1="182.36" x2="400" y2="182.36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0082FA" />
            <stop offset="1" stopColor="#00F2FE" />
          </linearGradient>
        </defs>
        <path
          fill="url(#wallet-inj-grad-a)"
          d="M48.5 69.1c2.5-3.1 5.1-6.1 7.7-9.1.1-.1.4-.2.5-.3.2-.3.6-.5.9-.8l.2-.3c1.8-1.7 3.8-3.5 6-5.2 8-6 16.2-10.6 24.9-13.7 28-9.8 59.1-3.8 83.5 19.3 34.1 31.9 31 83.4 3.8 117.6-34.4 51-93.4 122.1-11.7 185.8 14.7 11.5 25.6 20.9 71.9 34.3-30.3 5.6-58.4 3.8-89.6-4.1-22.1-12.5-56.9-39.2-68.7-75.3-17.9-54.7 31.5-136.6 55.3-168.1 32.7-43.6-20.2-90.8-59.3-38.1C53.7 138.6 18 216.3 30.4 274c7.2 32.7 16.9 56.5 55.2 89.3-7.1-4.2-14-8.9-20.7-14.3C-24 266.1-13.7 137.9 48.5 69.1Z"
        />
        <path
          fill="url(#wallet-inj-grad-b)"
          d="M351.5 330.9c-2.5 3.1-5.1 6.1-7.7 9.1-.1.1-.4.2-.5.3-.2.3-.6.5-.9.8l-.2.3c-1.8 1.7-3.8 3.5-6 5.1-8 6-16.2 10.6-24.9 13.7-28 9.8-59.1 3.8-83.5-19.3-34.1-31.9-31-83.4-3.8-117.6 34.4-51 93.4-122.1 11.7-185.8-14.7-11.5-25.6-20.9-71.9-34.3 30.3-5.6 58.4-3.8 89.6 4.1 22.1 12.5 56.9 39.2 68.7 75.3 17.9 54.7-31.5 136.6-55.3 168.1-32.7 43.6 20.2 90.8 59.3 38.1 20.4-27.5 56.1-105.2 43.7-162.9-7.2-32.7-16.9-56.5-55.2-89.3 7.1 4.2 14 8.9 20.7 14.3C424 133.9 413.7 262.1 351.5 330.9Z"
        />
      </svg>
    );
  }

  if (key === "POLYGON") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#8247e5" d="M12 2L22 8v8l-10 6L2 16V8l10-6z"/>
        <path fill="#fff" d="M9.5 9.5L12 7.5l2.5 2v5L12 16.5 9.5 14.5v-5z"/>
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
