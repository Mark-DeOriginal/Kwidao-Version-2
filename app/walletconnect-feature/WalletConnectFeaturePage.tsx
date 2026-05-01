"use client";

import WalletConnectHeader from "./components/WalletConnectHeader";
import UsdcBridge from "./components/UsdcBridge";
import WalletConnectProvider from "./providers/WalletConnectProvider";
import styles from "./WalletConnectFeaturePage.module.css";

export default function WalletConnectFeaturePage() {
  return (
    <WalletConnectProvider>
      <div className={styles.pageShell}>
        <WalletConnectHeader />
        <main className={styles.main}>
          <UsdcBridge />
        </main>
      </div>
    </WalletConnectProvider>
  );
}

