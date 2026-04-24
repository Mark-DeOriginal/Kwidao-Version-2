export function StrategyPanel() {
  return (
    <div className="tab-view active" id="tv-strategy">
      <div className="strat-grid">
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "var(--theme-accent)" }}>A</span> Arithmetic Grid
          </div>
          <div className="sc-body">
            <strong>Even spacing</strong> between all levels.
            <br />
            <br />
            Best for: <strong>Stable, sideways markets</strong> with predictable
            oscillation.
            <br />
            <br />
            Spacing: Fixed $X or fixed % between each level.
            <br />
            <br />
            Example: PHAR at $180, $172, $164, $157... evenly spaced $7-8 apart.
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK More fills in tight range
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
              }}
            >
              Note Less efficient in strong trends
            </span>
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "#f59e0b" }}>G</span> Geometric Grid
          </div>
          <div className="sc-body">
            <strong>Wider gaps as price falls</strong> - percentage-based
            spacing.
            <br />
            <br />
            Best for: <strong>Volatile or trending markets</strong> with larger
            swings.
            <br />
            <br />
            Spacing: Each level is X% below the previous, so lower levels are
            farther apart.
            <br />
            <br />
            Example: AERO at $0.31, $0.28 (-10%), $0.25 (-10%), $0.22 (-12%)...
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK Higher profit per fill
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
              }}
            >
              Note Fewer fills overall
            </span>
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "var(--theme-primary)" }}>F</span> Fibonacci Grid
          </div>
          <div className="sc-body">
            <strong>Levels placed at Fibonacci retracement zones</strong> -
            aligns with natural market psychology.
            <br />
            <br />
            Best for: <strong>Post-rally dip accumulation</strong> from known
            ATH or cycle high.
            <br />
            <br />
            Levels: 23.6%, 38.2%, 50%, 61.8%, 78.6% retracement from ATH.
            <br />
            <br />
            AERO ATH $2.32 -&gt; Fib levels: $1.77, $1.43, $1.16, $0.89, $0.50
            <br />
            Current price $0.34 is already below 78.6% fib - deep value zone.
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "var(--theme-primary-soft)",
                color: "var(--theme-primary)",
              }}
            >
              OK Aligns with support zones
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK Strong for accumulation
            </span>
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "#10b981" }}>T</span> Trailing Up
          </div>
          <div className="sc-body">
            When <strong>enabled</strong>: if the price breaks above the highest
            grid level, the entire grid shifts up automatically - new buy levels
            are placed above the old range.
            <br />
            <br />
            When <strong>disabled</strong>: grid stays fixed within the defined
            range.
            <br />
            <br />
            <strong>Best practice:</strong> Enable when you want to keep
            accumulating even during breakouts - the bot follows the price
            upward and continues buying dips at higher levels.
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK Captures breakout entries
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
              }}
            >
              Note Can increase avg cost
            </span>
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "#ef4444" }}>E</span> Expansion Down
          </div>
          <div className="sc-body">
            When <strong>enabled</strong>: if price drops below the lowest grid
            level, the bot automatically adds new buy levels below - protecting
            against inactivity during sharp drops.
            <br />
            <br />
            When <strong>disabled</strong>: bot stops placing orders if price
            drops below the low.
            <br />
            <br />
            <strong>Best practice:</strong> Set a reasonable floor - e.g., $0.05
            for AERO - to prevent buying into a liquidity death spiral. Combine
            with a maximum budget cap per expansion.
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK Never misses a dip
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
              }}
            >
              Note Set a floor limit
            </span>
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "var(--theme-accent)" }}>V</span> Adaptive Spacing Logic
          </div>
          <div className="sc-body">
            The bot monitors <strong>ATR (Average True Range)</strong> to detect
            volatility in real time.
            <br />
            <br />
            <strong>Low volatility (&lt;3% ATR):</strong> Tighten grids -&gt;
            more fills, smaller profit per trade.
            <br />
            <strong>Moderate (3-7% ATR):</strong> Default medium spacing -
            balanced approach.
            <br />
            <strong>High volatility (&gt;7% ATR):</strong> Widen grids -&gt;
            fewer fills, larger profit per trade.
            <br />
            <br />
            The volatility meters on the Dashboard show current ATR and
            recommend spacing automatically.
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "var(--theme-primary-soft)",
                color: "var(--theme-accent)",
              }}
            >
              OK Self-optimizing
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK Adapts to market regime
            </span>
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "#10b981" }}>Z</span> Zone Filter (RSI + MA)
          </div>
          <div className="sc-body">
            When <strong>enabled</strong>: the bot only places buy orders when
            the market is in a <strong>low area</strong> - two conditions must
            both be met:
            <br />
            <br />
            <strong>RSI &lt; threshold</strong> (default 45): RSI below this
            level signals the asset is oversold or cooling off.
            <br />
            <strong>Price &lt; MA20</strong>: price is trading below the
            20-period moving average - a classic mean-reversion entry signal.
            <br />
            <br />
            <strong>Click the RSI value</strong> on each bot card to cycle the
            threshold: 30 / 35 / 40 / 45 / 50 / 55 / 60 / 70
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK Avoids buying tops
            </span>
            <span
              className="tag"
              style={{
                background: "var(--theme-primary-soft)",
                color: "var(--theme-accent)",
              }}
            >
              OK Concentrates buys in dips
            </span>
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "var(--theme-primary)" }}>S</span> Scalping Module
          </div>
          <div className="sc-body">
            When <strong>enabled</strong>: after each grid buy fills, the bot
            automatically registers a <strong>partial sell target</strong> above
            it.
            <br />
            <br />
            <strong>Scalp %</strong> (default 3%): when price rises 3% above the
            fill price, the bot sells.
            <br />
            <strong>Sell qty</strong> (default 50%): only 50% of the tokens from
            that fill are sold - the rest stays accumulated.
            <br />
            <br />
            Example: buy 10 PHAR @ $150 -&gt; when price hits $154.50 (+3%),
            sell 5 PHAR -&gt; lock in ~$22.50 profit while keeping 5 PHAR.
            <br />
            <br />
            <strong>Click Scalp % / qty</strong> on each bot card to cycle
            presets.
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "var(--theme-primary-soft)",
                color: "var(--theme-primary)",
              }}
            >
              OK Books partial profits
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK Keeps long exposure
            </span>
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "#f59e0b" }}>L</span> Spend Limits &amp;
            Intervals
          </div>
          <div className="sc-body">
            <strong>Daily limit</strong>: cap total $ deployed per calendar day.
            Resets at midnight. Prevents the bot from deploying all capital in a
            single-day crash.
            <br />
            <br />
            <strong>Weekly limit</strong>: cap total $ for the full week. Resets
            each Sunday. Useful for DCA pacing over time.
            <br />
            <br />
            <strong>Min interval</strong>: minimum minutes between any two fills
            on the same bot (3 / 5 / 10 / 15 / 30 / 60 / 120 min). Spreads buys
            over time even during fast drops.
            <br />
            <br />
            <strong>Click the values</strong> in each bot's settings row to
            cycle through presets. Set to Off for unlimited.
            <br />
            <br />
            <span
              className="tag"
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
              }}
            >
              OK Controls capital velocity
            </span>
            <span
              className="tag"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
              }}
            >
              OK Protects against flash crashes
            </span>
          </div>
        </div>
      </div>
      <div className="strat-card" style={{ marginBottom: 16 }}>
          <div className="sc-title">
          <span style={{ color: "var(--theme-accent)" }}>X</span> Exit Strategy
        </div>
        <div
          className="sc-body"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <strong>PHAR exit targets:</strong>
            <br />
            Conservative: $250 (34% gain from current)
            <br />
            Base case: $300-$350 (60-87% gain)
            <br />
            Bull case: $500+ (168% gain) - trail stop from here
            <br />
            Intelligent trailing: lock 50% at $300, trail remaining with 15%
            trailing stop
          </div>
          <div>
            <strong>AERO exit targets:</strong>
            <br />
            Conservative: $0.70 (2x from $0.34)
            <br />
            Base case: $1.00-$1.20 (~3x) - partial take profit
            <br />
            Bull case: $2.00+ (~6x) - trail remaining position
            <br />
            Trigger: Q2 2026 unified Aero platform launch catalyst
          </div>
        </div>
      </div>
    </div>
  );
}
