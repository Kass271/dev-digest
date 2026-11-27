/** PRRow — Cost column: latest review cost; click opens the breakdown, not the PR. */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { PrMeta } from "@devdigest/shared";
import messages from "../../../../../../../messages/en/prReview.json";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/lib/hooks/reviews", () => ({ usePrRuns: () => ({ data: [], isLoading: false, isError: false }) }));

import { PRRow } from "./PRRow";

afterEach(() => {
  cleanup();
  push.mockClear();
});

const PR = {
  id: "pr-1", number: 482, title: "Add rate limiter", author: "marisa", branch: "b", base: "main",
  head_sha: "x", additions: 10, deletions: 2, files_count: 1, status: "reviewed", score: 61,
  updated_at: "2026-11-27T10:00:00.000Z",
} as PrMeta;

function renderRow(pr: PrMeta) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <PRRow pr={pr} repoId="repo-1" />
    </NextIntlClientProvider>,
  );
}

describe("PRRow — Cost column", () => {
  it("shows the latest review cost; clicking it opens the breakdown without navigating", () => {
    renderRow({ ...PR, cost_usd: 0.014 });
    fireEvent.click(screen.getByRole("button", { name: /\$0\.014/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Cost · #482")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    // close the breakdown; clicking the row itself still opens the PR
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Add rate limiter"));
    expect(push).toHaveBeenCalledWith("/repos/repo-1/pulls/482");
  });

  it("shows an em-dash (not clickable) when the cost is unknown", () => {
    renderRow({ ...PR, cost_usd: null });
    expect(screen.queryByRole("button", { name: /cost of this review/i })).not.toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });
});
