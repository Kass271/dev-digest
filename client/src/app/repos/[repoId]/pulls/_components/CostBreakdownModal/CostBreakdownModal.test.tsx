/** CostBreakdownModal — per-run costs + latest vs all-runs totals (client/Specs/run-cost.md §3). */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { RunSummary, PrMeta } from "@devdigest/shared";
import messages from "../../../../../../../messages/en/prReview.json";

const state: { data?: RunSummary[]; isLoading: boolean; isError: boolean } = { isLoading: false, isError: false };
vi.mock("@/lib/hooks/reviews", () => ({ usePrRuns: () => state }));

import { CostBreakdownModal } from "./CostBreakdownModal";

afterEach(cleanup);

const PR = {
  id: "pr-1", number: 482, title: "Add rate limiter", author: "marisa", branch: "b", base: "main",
  head_sha: "x", additions: 1, deletions: 0, files_count: 1, status: "reviewed", cost_usd: 0.014,
} as PrMeta;

function run(o: Partial<RunSummary>): RunSummary {
  return {
    run_id: "r", agent_id: "a", agent_name: "Security Reviewer", provider: "openai", model: "gpt-4.1",
    status: "done", error: null, duration_ms: 1, tokens_in: 9100, tokens_out: 1200, cost_usd: 0.014,
    findings_count: 1, grounding: null, ran_at: "2026-11-27T18:00:00.000Z", score: 61, blockers: 0, ...o,
  };
}

function renderModal() {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <CostBreakdownModal pr={PR} onClose={() => {}} />
    </NextIntlClientProvider>,
  );
}

describe("CostBreakdownModal", () => {
  it("lists every run with its cost and shows latest-review vs all-runs totals", () => {
    state.data = [
      run({ run_id: "r1", cost_usd: 0.014 }),
      run({ run_id: "r2", agent_name: "Perf Reviewer", cost_usd: 0.02 }),
      run({ run_id: "r3", agent_name: "General Reviewer", status: "failed", cost_usd: null }),
    ];
    renderModal();
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Cost · #482")).toBeInTheDocument();
    expect(within(dialog).getByText("Perf Reviewer")).toBeInTheDocument();
    expect(within(dialog).getByText("$0.020")).toBeInTheDocument();
    // footer: latest review = PR cost, all runs = 0.014 + 0.020, 1 unknown
    expect(within(dialog).getByText("Latest review")).toBeInTheDocument();
    expect(within(dialog).getByText("$0.034")).toBeInTheDocument();
    expect(within(dialog).getByText(/3 runs · 1 with unknown cost/)).toBeInTheDocument();
  });

  it("shows empty and error states", () => {
    state.data = [];
    renderModal();
    expect(screen.getByText("No runs yet.")).toBeInTheDocument();
    cleanup();

    state.data = undefined;
    state.isError = true;
    renderModal();
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load runs.");
    state.isError = false;
  });
});
