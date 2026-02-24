import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    document: { findMany: vi.fn(), findFirst: vi.fn(), deleteMany: vi.fn() },
  },
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { GET } from "@/app/api/documents/route";

const mockSession = vi.mocked(getServerSession);

describe("GET /api/documents", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns documents for authenticated user", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.document.findMany).mockResolvedValue([
      {
        id: "d1",
        type: "invoice",
        number: "INV-001",
        clientName: "Client Co",
        total: 500,
        status: "draft",
        createdAt: new Date(),
      },
    ] as any);

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].number).toBe("INV-001");
  });

  it("returns empty array when no documents", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.document.findMany).mockResolvedValue([]);

    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });
});
