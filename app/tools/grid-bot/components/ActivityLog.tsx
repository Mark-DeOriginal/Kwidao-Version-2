"use client";

import type { MouseEvent } from "react";
import type { LogEntry } from "../lib/types";

const iconMap: Record<string, string> = {
  buy: "v",
  info: "i",
  warn: "!",
  trail: "^",
  scalp: "$",
  sell: "^",
};

const classMap: Record<string, string> = {
  buy: "li-buy",
  info: "li-info",
  warn: "li-warn",
  trail: "li-trail",
  scalp: "li-scalp",
  sell: "li-sell",
};

export function ActivityLog({
  logs,
  onClear,
  onOpenFill,
}: {
  logs: LogEntry[];
  onClear: () => void;
  onOpenFill: (botId: "phar" | "aero", levelIdx: number) => void;
}) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target?.tagName === "A") {
      const data = target.getAttribute("data-fill");
      if (data) {
        const [botId, idx] = data.split(":");
        onOpenFill(botId as "phar" | "aero", Number(idx));
        event.preventDefault();
      }
    }
  };

  return (
    <div id="actbox">
      <div className="act-hdr">
        <div className="act-title">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--theme-accent)"
            strokeWidth="2"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Activity Log
        </div>
        <button className="clr-btn" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="loglist" id="loglist" onClick={handleClick}>
        {logs.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text3)", fontSize: 12 }}>
            Scanning grid levels...
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={`${log.t}-${idx}`} className="logitem">
              <div className={`li-ic ${classMap[log.type] || "li-info"}`}>
                {iconMap[log.type] || "*"}
              </div>
              <span className="li-t">{log.t}</span>
              <span
                className="li-m"
                dangerouslySetInnerHTML={{ __html: log.msg }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
