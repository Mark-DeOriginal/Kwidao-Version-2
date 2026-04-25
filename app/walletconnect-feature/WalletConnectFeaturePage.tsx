"use client";

import WalletConnectHeader from "./components/WalletConnectHeader";
import WalletDashboard from "./components/WalletDashboard";
import WalletConnectProvider from "./providers/WalletConnectProvider";
import styles from "./WalletConnectFeaturePage.module.css";

export default function WalletConnectFeaturePage() {
  return (
    <WalletConnectProvider>
      <div className={styles.pageShell}>
        <WalletConnectHeader />
        <main className={styles.main}>
          <WalletDashboard />
        </main>
      </div>
    </WalletConnectProvider>
  );
}

