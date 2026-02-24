// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { TokenBadge } from "@/components/token-badge";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

function mockFetch(data: object) {
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve(data),
  } as any);
}

describe("TokenBadge", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing before fetch resolves", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<TokenBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("displays token count and plan name", async () => {
    mockFetch({ tokens: 10, plan: "pro", planName: "Pro", maxTokens: 30, resetPeriod: "monthly" });

    render(<TokenBadge />);

    await waitFor(() => {
      expect(screen.getByText("10 / 30 tokens")).toBeInTheDocument();
      expect(screen.getByText(/Pro/)).toBeInTheDocument();
    });
  });

  it("shows upgrade link when tokens are 0", async () => {
    mockFetch({ tokens: 0, plan: "free", planName: "Free", maxTokens: 3, resetPeriod: "weekly" });

    render(<TokenBadge />);

    await waitFor(() => {
      const link = screen.getByRole("link", { name: /upgrade/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/upgrade");
    });
  });

  it("does not show upgrade link when tokens remain", async () => {
    mockFetch({ tokens: 2, plan: "free", planName: "Free", maxTokens: 3, resetPeriod: "weekly" });

    render(<TokenBadge />);

    await waitFor(() => {
      expect(screen.getByText("2 / 3 tokens")).toBeInTheDocument();
    });

    expect(screen.queryByRole("link", { name: /upgrade/i })).toBeNull();
  });

  it("applies red styling when tokens are critically low (≤1)", async () => {
    mockFetch({ tokens: 1, plan: "free", planName: "Free", maxTokens: 3, resetPeriod: "weekly" });

    render(<TokenBadge />);

    await waitFor(() => {
      const tokenText = screen.getByText("1 / 3 tokens");
      expect(tokenText).toHaveClass("text-red-600");
    });
  });
});
