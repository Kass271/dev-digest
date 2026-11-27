/* CostBreakdownModal — opened from the PR list Cost cell. Lists every agent run
   of the PR with its cost and shows the latest-review vs all-runs totals.
   Not in the design (user request, client/Specs/run-cost.md §3). Reuses the
   existing GET /pulls/:id/runs via usePrRuns — no new endpoint. */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Modal, Skeleton } from "@devdigest/ui";
import type { PrMeta } from "@/lib/types";
import { usePrRuns } from "@/lib/hooks/reviews";
import { CostBadge } from "@/components/cost-badge";

const cell: React.CSSProperties = { padding: "8px 12px", fontSize: 12.5, whiteSpace: "nowrap" };
const head: React.CSSProperties = {
  ...cell,
  fontSize: 10.5,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.4,
  textAlign: "left",
};

function kTokens(n: number | null): string {
  return n == null ? "—" : `${(n / 1000).toFixed(1)}K`;
}

export function CostBreakdownModal({ pr, onClose }: { pr: PrMeta; onClose: () => void }) {
  const t = useTranslations("prReview");
  const { data: runs, isLoading, isError } = usePrRuns(pr.id);

  const list = runs ?? [];
  const known = list.filter((r) => r.cost_usd != null);
  const unknown = list.length - known.length;
  const total = known.reduce((sum, r) => sum + (r.cost_usd ?? 0), 0);

  return (
    <Modal
      width={640}
      title={t("cost.modal.title", { number: pr.number })}
      subtitle={pr.title}
      onClose={onClose}
      footer={
        list.length > 0 ? (
          <div style={{ display: "flex", gap: 18, fontSize: 12.5, alignItems: "center", flexWrap: "wrap" }}>
            <span>
              {t("cost.modal.latest")} <CostBadge usd={pr.cost_usd} />
            </span>
            <span>
              {t("cost.modal.allRuns")} <CostBadge usd={known.length > 0 ? total : null} />{" "}
              <span style={{ color: "var(--text-muted)" }}>
                {t("cost.modal.runsCount", { count: list.length })}
                {unknown > 0 ? ` · ${t("cost.modal.unknownCount", { count: unknown })}` : ""}
              </span>
            </span>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div style={{ padding: 20, display: "grid", gap: 8 }}>
          <Skeleton height={22} />
          <Skeleton height={22} />
        </div>
      ) : isError ? (
        <div role="alert" style={{ padding: 20, color: "var(--crit)", fontSize: 13 }}>
          {t("cost.modal.error")}
        </div>
      ) : list.length === 0 ? (
        <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13 }}>{t("cost.modal.empty")}</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={head}>{t("cost.modal.agent")}</th>
              <th style={head}>{t("cost.modal.model")}</th>
              <th style={head}>{t("cost.modal.ranAt")}</th>
              <th style={head}>{t("cost.modal.tokens")}</th>
              <th style={{ ...head, textAlign: "right" }}>{t("cost.modal.cost")}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.run_id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={cell}>{r.agent_name ?? "—"}</td>
                <td className="mono" style={{ ...cell, color: "var(--text-secondary)" }}>
                  {r.model ?? "—"}
                </td>
                <td style={{ ...cell, color: "var(--text-muted)" }}>
                  {r.ran_at ? new Date(r.ran_at).toLocaleTimeString() : "—"}
                </td>
                <td className="mono tnum" style={{ ...cell, color: "var(--text-secondary)" }}>
                  {kTokens(r.tokens_in)}→{kTokens(r.tokens_out)}
                </td>
                <td style={{ ...cell, textAlign: "right" }}>
                  <CostBadge usd={r.cost_usd} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}
