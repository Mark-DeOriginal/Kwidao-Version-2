"use client";

import Link from "next/link";
import WalletConnectButton from "./walletconnect/WalletConnectButton";
import styles from "./WalletConnectHeader.module.css";

export default function WalletConnectHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logoWrap}>
          <img src="/logo.svg" alt="Kwidao Logo" className={styles.logo} />
        </Link>
        <WalletConnectButton />
      </div>
    </header>
  );
}

