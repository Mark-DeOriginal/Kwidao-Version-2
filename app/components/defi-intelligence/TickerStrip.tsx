import {
  formatCurrency,
  formatPct,
  tone,
  type TickerItem,
} from "@/lib/defiIntelligence";

function TickerCell({ item }: { item: TickerItem }) {
  const t = tone(item.change24h);
  const toneClass =
    t === "up"
      ? "text-[var(--theme-positive)]"
      : t === "down"
        ? "text-[var(--theme-danger)]"
        : "text-[var(--theme-text-soft)]";

  return (
    <div className="flex min-w-max items-center gap-3 border-r border-[color:var(--theme-border-subtle)] px-6 py-3 text-sm">
      <span className="h-2 w-2 rounded-full bg-[var(--theme-primary)]" />
      <span className="font-semibold uppercase tracking-[0.14em] text-[var(--theme-primary)]">
        {item.symbol}
      </span>
      <span className="font-medium text-[var(--theme-text-strong)]">
        {formatCurrency(item.price)}
      </span>
      <span className={`font-semibold ${toneClass}`}>
        {formatPct(item.change24h)}
      </span>
    </div>
  );
}

export default function TickerStrip({ items }: { items: TickerItem[] }) {
  const visibleItems =
    items.length > 0
      ? items
      : [
          { id: "btc", symbol: "BTC", price: 0, change24h: 0 },
          { id: "eth", symbol: "ETH", price: 0, change24h: 0 },
          { id: "avax", symbol: "AVAX", price: 0, change24h: 0 },
          { id: "sol", symbol: "SOL", price: 0, change24h: 0 },
        ];

  return (
    <div className="theme-panel-solid relative w-full overflow-hidden rounded-none mb-5">
      <div className="defi-ticker-mask">
        <div className="defi-ticker-track">
          {visibleItems.concat(visibleItems).map((item, idx) => (
            <TickerCell key={`${item.id}-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
