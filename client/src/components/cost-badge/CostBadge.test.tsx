/** CostBadge — design format (client/Specs/run-cost.md §2). */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CostBadge, formatCost } from "./CostBadge";

afterEach(cleanup);

describe("CostBadge", () => {
  it("formats like the design: em-dash for unknown, 3 dp below $1, 2 dp from $1", () => {
    expect(formatCost(null)).toBeNull();
    expect(formatCost(undefined)).toBeNull();
    expect(formatCost(0.014)).toBe("$0.014");
    expect(formatCost(0.0013)).toBe("$0.001");
    expect(formatCost(1.254)).toBe("$1.25");

    render(<CostBadge usd={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("is a clickable button when onClick is given, but never for an unknown cost", () => {
    const onClick = vi.fn();
    const { rerender } = render(<CostBadge usd={0.014} onClick={onClick} label="Cost of this review" />);
    fireEvent.click(screen.getByRole("button", { name: "Cost of this review: $0.014" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<CostBadge usd={null} onClick={onClick} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
