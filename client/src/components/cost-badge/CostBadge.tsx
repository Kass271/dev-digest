/* CostBadge — compact spend display. Ported from the design's CostBadge
   (DevDigest Design: `usd == null` ⇒ em-dash; < $1 ⇒ 3 dp; otherwise 2 dp).
   With `onClick` it renders as a keyboard-accessible button. */
"use client";

import React from "react";

/** Design format: "$0.014" below $1, "$1.25" from $1 up; null/undefined ⇒ null. */
export function formatCost(usd: number | null | undefined): string | null {
  if (usd == null) return null;
  return usd < 1 ? `$${usd.toFixed(3)}` : `$${usd.toFixed(2)}`;
}

export function CostBadge({
  usd,
  size = "sm",
  muted,
  onClick,
  label = "Cost of this review",
}: {
  usd: number | null | undefined;
  size?: "sm" | "lg";
  muted?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Tooltip / accessible label. */
  label?: string;
}) {
  const text = formatCost(usd);
  if (text == null) {
    return (
      <span className="mono" style={{ fontSize: size === "lg" ? 13 : 12, color: "var(--text-muted)" }}>
        —
      </span>
    );
  }
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: size === "lg" ? 13 : 11.5,
    color: muted ? "var(--text-muted)" : "var(--text-secondary)",
    fontWeight: 500,
  };
  if (onClick) {
    return (
      <button
        type="button"
        className="mono tnum"
        title={label}
        aria-label={`${label}: ${text}`}
        onClick={onClick}
        style={{
          ...style,
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          textDecoration: "underline",
          textDecorationStyle: "dotted",
          textUnderlineOffset: 3,
        }}
      >
        {text}
      </button>
    );
  }
  return (
    <span className="mono tnum" title={label} style={style}>
      {text}
    </span>
  );
}
