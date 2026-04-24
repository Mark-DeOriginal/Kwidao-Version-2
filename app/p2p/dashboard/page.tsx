import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/p2p/auth";
import WalletBalances from "../components/WalletBalances";
import { createTrade, markNotificationRead } from "../actions";

function formatDate(input: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(input);
}

export default async function P2PDashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/p2p");
  }

  const [trades, notifications] = await Promise.all([
    prisma.trade.findMany({
      where: {
        OR: [{ buyerId: user.id }, { sellerId: user.id }],
      },
      include: {
        buyer: true,
        seller: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  return (
    <main className="space-y-4">
      <section className="p2p-hero">
        <p className="p2p-eyebrow">User operations</p>
        <h1 className="p2p-title">Trading Desk</h1>
        <p className="p2p-subtitle">
          Wallet {user.walletAddress} is active. Open trades, send payment proof, and track settlement in
          real time.
        </p>
      </section>

      <section className="p2p-panel">
        <h2 className="p2p-section-title">Wallet Balances</h2>
        <p className="p2p-subtitle">
          Live snapshot of your AVAX C-chain wallet for AVAX, USDT and USDC.
        </p>
        <div className="mt-4">
          <WalletBalances walletAddress={user.walletAddress} />
        </div>
      </section>

      <section className="p2p-grid-2">
        <article className="p2p-panel">
          <h2 className="p2p-section-title">Create New Trade</h2>
          <p className="p2p-subtitle">
            Provide seller wallet and amount details. Buyer starts in payment pending state.
          </p>
          <form action={createTrade} className="mt-4 grid gap-3">
            <input
              name="sellerWallet"
              required
              placeholder="Seller wallet (0x...)"
              className="p2p-input"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                name="assetSymbol"
                className="p2p-select"
                defaultValue="USDT"
              >
                <option value="USDT">USDT</option>
                <option value="USDC">USDC</option>
                <option value="AVAX">AVAX</option>
              </select>
              <input
                name="cryptoAmount"
                type="number"
                step="0.000001"
                min="0.000001"
                required
                placeholder="Crypto amount"
                className="p2p-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="fiatAmount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Fiat amount"
                className="p2p-input"
              />
              <input
                name="fiatCurrency"
                defaultValue="USD"
                required
                className="p2p-input uppercase"
              />
            </div>
            <button type="submit" className="p2p-btn-primary mt-1">
              Create Trade
            </button>
          </form>
        </article>

        <article className="p2p-panel">
          <h2 className="p2p-section-title">Notifications</h2>
          <div className="mt-4 space-y-3">
            {notifications.length === 0 ? (
              <p className="p2p-muted text-sm">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p2p-card-compact"
                >
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="text-sm p2p-muted">{notification.body}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs p2p-muted">{formatDate(notification.createdAt)}</span>
                    {!notification.readAt ? (
                      <form action={markNotificationRead}>
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <button type="submit" className="text-xs text-[#0f8c83]">
                          Mark read
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs p2p-muted">Read</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="p2p-panel">
        <h2 className="p2p-section-title">Your Trades</h2>
        <div className="mt-4 space-y-3">
          {trades.length === 0 ? (
            <p className="text-sm p2p-muted">No trades yet. Create your first trade above.</p>
          ) : (
            trades.map((trade) => {
              const youAreBuyer = trade.buyerId === user.id;
              return (
                <div
                  key={trade.id}
                  className="p2p-row p2p-card-compact"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {trade.cryptoAmount.toString()} {trade.assetSymbol} for{" "}
                      {trade.fiatAmount.toString()} {trade.fiatCurrency}
                    </p>
                    <p className="text-xs p2p-muted">
                      {youAreBuyer ? "Buyer" : "Seller"} | Counterparty:{" "}
                      {youAreBuyer ? trade.seller.walletAddress : trade.buyer.walletAddress}
                    </p>
                    <p className="text-xs p2p-muted">
                      Status: {trade.status} | Created {formatDate(trade.createdAt)}
                    </p>
                  </div>
                  <Link href={`/p2p/trade/${trade.id}`} className="p2p-btn-secondary">
                    Open Trade Room
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
