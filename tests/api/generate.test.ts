import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  prisma: {
    document: { create: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    guestUsage: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/tokens", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/tokens")>();
  return {
    ...original,
    deductToken: vi.fn(),
    deductGuestToken: vi.fn(),
  };
});

vi.mock("@/lib/claude", () => ({
  generateDocument: vi.fn().mockResolvedValue({
    type: "invoice",
    number: "INV-001",
    date: "February 24, 2026",
    from: { name: "Acme Corp" },
    to: { name: "Client Co" },
    items: [{ description: "Service", quantity: 1, rate: 100, amount: 100 }],
    subtotal: 100,
    total: 100,
    notes: "Thank you",
    paymentTerms: "Net 30",
  }),
}));

import { getServerSession } from "next-auth";
import { deductToken, deductGuestToken } from "@/lib/tokens";
import { prisma } from "@/lib/db";
import { POST } from "@/app/api/generate/route";

const mockSession = vi.mocked(getServerSession);
const mockDeductToken = vi.mocked(deductToken);
const mockDeductGuest = vi.mocked(deductGuestToken);

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/generate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", "x-forwarded-for": "1.2.3.4" },
  });
}

describe("POST /api/generate", () => {
  it("returns 400 for invalid document type", async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ type: "contract", data: {} }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when type is missing", async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ data: {} }));
    expect(res.status).toBe(400);
  });

  it("generates document for authenticated user with tokens", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    mockDeductToken.mockResolvedValue(true);
    vi.mocked(prisma.document.create).mockResolvedValue({ id: "doc-1" } as any);

    const res = await POST(makeRequest({ type: "invoice", data: {} }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.document.type).toBe("invoice");
    expect(body.id).toBe("doc-1");
  });

  it("returns 402 when authenticated user has no tokens", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    mockDeductToken.mockResolvedValue(false);

    const res = await POST(makeRequest({ type: "invoice", data: {} }));
    const body = await res.json();

    expect(res.status).toBe(402);
    expect(body.error).toMatch(/no tokens/i);
  });

  it("generates document for guest with tokens", async () => {
    mockSession.mockResolvedValue(null);
    mockDeductGuest.mockResolvedValue({ allowed: true, tokensRemaining: 2, resetsAt: new Date() });

    const res = await POST(makeRequest({ type: "receipt", data: {} }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.document).toBeDefined();
    // guests don't get an id saved
    expect(body.id).toBeUndefined();
  });

  it("returns 429 when guest has exhausted tokens", async () => {
    mockSession.mockResolvedValue(null);
    mockDeductGuest.mockResolvedValue({
      allowed: false,
      tokensRemaining: 0,
      resetsAt: new Date("2026-03-01"),
    });

    const res = await POST(makeRequest({ type: "invoice", data: {} }));
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.resetsAt).toBeDefined();
  });
});
