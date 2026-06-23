"use client";

import WalletConnectHeader from "../wallet-connect-btn/components/WalletConnectHeader";
import UsdcBridge from "./components/UsdcBridge";
import WalletConnectProvider from "../wallet-connect-btn/providers/WalletConnectProvider";
import { BridgeProvider } from "./services/bridgeContext";
import styles from "./UsdcBridgePage.module.css";

export default function UsdcBridgePage() {
  return (
    <WalletConnectProvider>
      <BridgeProvider>
        <div className={styles.pageShell}>
          <WalletConnectHeader />
          <main className={styles.main}>
            <UsdcBridge />
          </main>
        </div>
      </BridgeProvider>
    </WalletConnectProvider>
  );
}
