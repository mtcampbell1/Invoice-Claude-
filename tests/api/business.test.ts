import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    business: { findUnique: vi.fn(), upsert: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { GET, POST } from "@/app/api/business/route";

const mockSession = vi.mocked(getServerSession);

function makeRequest(body: object) {
  return new Request("http://localhost/api/business", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/business", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns business data for authenticated user", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.business.findUnique).mockResolvedValue({
      id: "b1",
      name: "Acme Corp",
      userId: "u1",
    } as any);

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Acme Corp");
  });

  it("returns null when no business saved", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.business.findUnique).mockResolvedValue(null);

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toBeNull();
  });
});

describe("POST /api/business", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ name: "Test" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for free plan users", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", plan: "free" } as any);

    const res = await POST(makeRequest({ name: "Test" }));
    expect(res.status).toBe(403);
  });

  it("returns 403 for basic plan users", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", plan: "basic" } as any);

    const res = await POST(makeRequest({ name: "Test" }));
    expect(res.status).toBe(403);
  });

  it("saves business for pro plan users", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", plan: "pro" } as any);
    vi.mocked(prisma.business.upsert).mockResolvedValue({
      id: "b1",
      name: "Pro Corp",
      userId: "u1",
    } as any);

    const res = await POST(makeRequest({ name: "Pro Corp", email: "pro@corp.com" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("Pro Corp");
  });

  it("saves business for business plan users", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", plan: "business" } as any);
    vi.mocked(prisma.business.upsert).mockResolvedValue({
      id: "b1",
      name: "Biz Corp",
      userId: "u1",
    } as any);

    const res = await POST(makeRequest({ name: "Biz Corp" }));
    expect(res.status).toBe(200);
  });
});
