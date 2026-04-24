import type { BotState } from "../lib/types";

export function PortfolioPanel({
  bots,
  totalBudget,
  totalInvested,
  totalValue,
  returnPct,
}: {
  bots: Record<"phar" | "aero", BotState>;
  totalBudget: number;
  totalInvested: number;
  totalValue: number;
  returnPct: number;
}) {
  const pharPct = (bots.phar.budget / totalBudget) * 100;
  const aeroPct = (bots.aero.budget / totalBudget) * 100;
  const usdcPct = Math.max(
    0,
    ((totalBudget - totalInvested) / totalBudget) * 100,
  );

  return (
    <div className="tab-view active" id="tv-portfolio">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "var(--theme-accent)" }}>C</span> Capital Allocation
          </div>
          <div style={{ marginBottom: 14 }}>
            <div className="alloc-row">
              <div className="alloc-label" style={{ color: "#e84142" }}>
                PHAR (AVAX)
              </div>
              <div className="alloc-bar-bg">
                <div
                  className="alloc-bar-fill"
                  id="phar-alloc-bar"
                  style={{ width: `${pharPct}%`, background: "#e84142" }}
                ></div>
              </div>
              <div
                className="alloc-pct"
                id="phar-alloc-pct"
                style={{ color: "#e84142" }}
              >
                {pharPct.toFixed(0)}%
              </div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label" style={{ color: "var(--theme-accent)" }}>
                AERO (Base)
              </div>
              <div className="alloc-bar-bg">
                <div
                  className="alloc-bar-fill"
                  id="aero-alloc-bar"
                  style={{ width: `${aeroPct}%`, background: "var(--theme-primary)" }}
                ></div>
              </div>
              <div
                className="alloc-pct"
                id="aero-alloc-pct"
                style={{ color: "var(--theme-accent)" }}
              >
                {aeroPct.toFixed(0)}%
              </div>
            </div>
            <div className="alloc-row">
              <div className="alloc-label" style={{ color: "var(--text3)" }}>
                USDC Reserve
              </div>
              <div className="alloc-bar-bg">
                <div
                  className="alloc-bar-fill"
                  id="usdc-alloc-bar"
                  style={{ width: `${usdcPct}%`, background: "#10b981" }}
                ></div>
              </div>
              <div className="alloc-pct pos" id="usdc-alloc-pct">
                {usdcPct.toFixed(0)}%
              </div>
            </div>
          </div>
          <div className="sc-body">
            <span id="pf-phar-alloc-txt">
              <strong>${bots.phar.budget.toLocaleString()}</strong> allocated to
              PHAR - {bots.phar.nLevels} grid levels
            </span>
            <br />
            <span id="pf-aero-alloc-txt">
              <strong>${bots.aero.budget.toLocaleString()}</strong> allocated to
              AERO - {bots.aero.nLevels} grid levels
            </span>
            <br />
            <span id="pf-total-txt">
              <strong>${totalBudget.toLocaleString()}</strong> total budget
            </span>
            <br />
            <br />
            USDC reserve percentage updates in real time as grid orders fill.
          </div>
        </div>
        <div className="strat-card">
          <div className="sc-title">
            <span style={{ color: "#10b981" }}>P</span> Portfolio Performance
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div className="bst">
              <div className="bst-l">Current Value</div>
              <div className="bst-v" id="pf-val">
                ${totalValue.toFixed(2)}
              </div>
            </div>
            <div className="bst">
              <div className="bst-l">Total Return</div>
              <div className="bst-v" id="pf-ret">
                {returnPct.toFixed(2)}%
              </div>
            </div>
            <div className="bst">
              <div className="bst-l">PHAR Position</div>
              <div className="bst-v pos" id="pf-phar">
                ${(bots.phar.held * bots.phar.price).toFixed(2)}
              </div>
            </div>
            <div className="bst">
              <div className="bst-l">AERO Position</div>
              <div className="bst-v pos" id="pf-aero">
                ${(bots.aero.held * bots.aero.price).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="sc-body">
            <strong>Target at conservative exit:</strong>
            <br />
            PHAR: $1,500 -&gt; ~$2,010 (+34%)
            <br />
            AERO: $2,000 -&gt; ~$4,118 (+106% at $0.70)
            <br />
            <strong>Combined: $3,500 -&gt; ~$6,128 (+75%)</strong>
            <br />
            <br />
            Bull case: PHAR $500 + AERO $2.00 -&gt; portfolio ~$22,000 (+529%)
          </div>
        </div>
      </div>
    </div>
  );
}
