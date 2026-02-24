import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/tokens", () => ({
  getTokenStatus: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { getTokenStatus } from "@/lib/tokens";
import { GET } from "@/app/api/tokens/route";

const mockSession = vi.mocked(getServerSession);
const mockGetStatus = vi.mocked(getTokenStatus);

describe("GET /api/tokens", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns token status for authenticated user", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    mockGetStatus.mockResolvedValue({
      tokens: 10,
      plan: "pro",
      planName: "Pro",
      maxTokens: 30,
      resetPeriod: "monthly",
      tokensResetAt: new Date(),
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.tokens).toBe(10);
    expect(body.plan).toBe("pro");
  });
});
