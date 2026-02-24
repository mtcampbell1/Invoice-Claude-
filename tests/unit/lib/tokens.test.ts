import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    guestUsage: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import {
  checkAndResetTokens,
  deductToken,
  deductGuestToken,
  PLANS,
} from "@/lib/tokens";

const u = vi.mocked(prisma.user);
const g = vi.mocked(prisma.guestUsage);

describe("PLANS", () => {
  it("free plan has 3 weekly tokens", () => {
    expect(PLANS.free.tokens).toBe(3);
    expect(PLANS.free.resetPeriod).toBe("weekly");
  });

  it("pro plan can save contacts and business", () => {
    expect(PLANS.pro.canSaveContacts).toBe(true);
    expect(PLANS.pro.canSaveBusiness).toBe(true);
  });

  it("basic plan cannot save contacts", () => {
    expect(PLANS.basic.canSaveContacts).toBe(false);
  });
});

describe("checkAndResetTokens", () => {
  const baseUser = {
    id: "user-1",
    email: "test@test.com",
    password: "hashed",
    name: null,
    plan: "free",
    tokens: 3,
    tokensResetAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  };

  it("returns user unchanged when no reset needed", async () => {
    u.findUnique.mockResolvedValue(baseUser as any);

    const result = await checkAndResetTokens("user-1");

    expect(result).toEqual(baseUser);
    expect(u.update).not.toHaveBeenCalled();
  });

  it("resets free (weekly) tokens after 7 days", async () => {
    const staleUser = {
      ...baseUser,
      tokens: 0,
      tokensResetAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    };
    const updatedUser = { ...staleUser, tokens: 3 };
    u.findUnique.mockResolvedValue(staleUser as any);
    u.update.mockResolvedValue(updatedUser as any);

    await checkAndResetTokens("user-1");

    expect(u.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { tokens: 3, tokensResetAt: expect.any(Date) },
    });
  });

  it("resets pro (monthly) tokens in a new calendar month", async () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const staleUser = {
      ...baseUser,
      plan: "pro",
      tokens: 0,
      tokensResetAt: lastMonth,
    };
    const updatedUser = { ...staleUser, tokens: 30 };
    u.findUnique.mockResolvedValue(staleUser as any);
    u.update.mockResolvedValue(updatedUser as any);

    await checkAndResetTokens("user-1");

    expect(u.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { tokens: 30, tokensResetAt: expect.any(Date) },
    });
  });

  it("throws when user not found", async () => {
    u.findUnique.mockResolvedValue(null);
    await expect(checkAndResetTokens("missing")).rejects.toThrow("User not found");
  });
});

describe("deductToken", () => {
  const baseUser = {
    id: "user-1",
    plan: "free",
    tokens: 2,
    tokensResetAt: new Date(),
    email: "",
    password: "",
    name: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    stripeCustomerId: null,
    stripeSubscriptionId: null,
  };

  it("returns true and decrements when tokens available", async () => {
    u.findUnique.mockResolvedValue(baseUser as any);
    u.update.mockResolvedValue({ ...baseUser, tokens: 1 } as any);

    const result = await deductToken("user-1");

    expect(result).toBe(true);
    expect(u.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { tokens: { decrement: 1 } },
    });
  });

  it("returns false when no tokens remaining", async () => {
    u.findUnique.mockResolvedValue({ ...baseUser, tokens: 0 } as any);

    const result = await deductToken("user-1");

    expect(result).toBe(false);
    expect(u.update).not.toHaveBeenCalled();
  });
});

describe("deductGuestToken", () => {
  const weekStart = (() => {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = now.getUTCDate() - day;
    const ws = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff));
    ws.setUTCHours(0, 0, 0, 0);
    return ws;
  })();

  it("allows first-time guest and creates record", async () => {
    g.findUnique.mockResolvedValue(null);
    g.create.mockResolvedValue({ ip: "1.2.3.4", tokens: 2, weekStart } as any);

    const result = await deductGuestToken("1.2.3.4");

    expect(result.allowed).toBe(true);
    expect(result.tokensRemaining).toBe(2);
    expect(g.create).toHaveBeenCalledWith({
      data: { ip: "1.2.3.4", tokens: 2, weekStart: expect.any(Date) },
    });
  });

  it("allows guest with remaining tokens", async () => {
    g.findUnique.mockResolvedValue({ ip: "1.2.3.4", tokens: 2, weekStart } as any);
    g.update.mockResolvedValue({ ip: "1.2.3.4", tokens: 1, weekStart } as any);

    const result = await deductGuestToken("1.2.3.4");

    expect(result.allowed).toBe(true);
    expect(result.tokensRemaining).toBe(1);
  });

  it("blocks guest with 0 tokens", async () => {
    g.findUnique.mockResolvedValue({ ip: "1.2.3.4", tokens: 0, weekStart } as any);

    const result = await deductGuestToken("1.2.3.4");

    expect(result.allowed).toBe(false);
    expect(result.tokensRemaining).toBe(0);
    expect(g.update).not.toHaveBeenCalled();
  });

  it("resets tokens for guest in a new week", async () => {
    const oldWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    g.findUnique.mockResolvedValue({ ip: "1.2.3.4", tokens: 0, weekStart: oldWeekStart } as any);
    g.update.mockResolvedValue({ ip: "1.2.3.4", tokens: 2, weekStart } as any);

    const result = await deductGuestToken("1.2.3.4");

    expect(result.allowed).toBe(true);
    expect(result.tokensRemaining).toBe(2);
  });
});
