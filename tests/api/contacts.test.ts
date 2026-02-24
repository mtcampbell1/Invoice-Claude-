import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    contact: { findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { GET, POST } from "@/app/api/contacts/route";

const mockSession = vi.mocked(getServerSession);

function makeRequest(body: object) {
  return new Request("http://localhost/api/contacts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("GET /api/contacts", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns empty array for free plan users", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", plan: "free" } as any);

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns contacts for pro plan users", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", plan: "pro" } as any);
    vi.mocked(prisma.contact.findMany).mockResolvedValue([
      { id: "c1", name: "Client A", userId: "u1" },
    ] as any);

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].name).toBe("Client A");
  });
});

describe("POST /api/contacts", () => {
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

  it("returns 400 when name is missing", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", plan: "pro" } as any);

    const res = await POST(makeRequest({ email: "test@test.com" }));
    expect(res.status).toBe(400);
  });

  it("creates contact for pro plan users", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "u1", plan: "pro" } as any);
    vi.mocked(prisma.contact.create).mockResolvedValue({
      id: "c1",
      name: "New Client",
      email: "new@client.com",
      userId: "u1",
    } as any);

    const res = await POST(makeRequest({ name: "New Client", email: "new@client.com" }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.name).toBe("New Client");
  });
});
