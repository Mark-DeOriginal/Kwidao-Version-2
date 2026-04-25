"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
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
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        authenticationStatus,
        openAccountModal,
        openChainModal,
        openConnectModal,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          !!account &&
          !!chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (!connected) {
          return (
            <button
              type="button"
              onClick={openConnectModal}
              className={classNames(styles.connectButton, className)}
            >
              {label}
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              type="button"
              onClick={openChainModal}
              className={classNames(styles.warningButton, className)}
            >
              Switch Network
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={openAccountModal}
            className={classNames(styles.connectedButton, className)}
          >
            <span className={styles.chainDot} />
            <span className={styles.connectedLabel}>{account.displayName}</span>
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}

