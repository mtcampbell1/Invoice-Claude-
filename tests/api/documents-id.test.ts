import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    document: { findFirst: vi.fn(), deleteMany: vi.fn() },
  },
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { GET, DELETE } from "@/app/api/documents/[id]/route";

const mockSession = vi.mocked(getServerSession);

function makeParams(id: string) {
  return { params: { id } };
}

describe("GET /api/documents/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), makeParams("d1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when document not found", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.document.findFirst).mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), makeParams("missing"));
    expect(res.status).toBe(404);
  });

  it("returns document with parsed data", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    const docData = { type: "invoice", number: "INV-001", total: 100 };
    vi.mocked(prisma.document.findFirst).mockResolvedValue({
      id: "d1",
      userId: "u1",
      type: "invoice",
      number: "INV-001",
      total: 100,
      data: JSON.stringify(docData),
    } as any);

    const res = await GET(new Request("http://localhost"), makeParams("d1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.type).toBe("invoice");
    expect(body.data.total).toBe(100);
  });
});

describe("DELETE /api/documents/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost"), makeParams("d1"));
    expect(res.status).toBe(401);
  });

  it("deletes document and returns success", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.document.deleteMany).mockResolvedValue({ count: 1 } as any);

    const res = await DELETE(new Request("http://localhost"), makeParams("d1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(prisma.document.deleteMany).toHaveBeenCalledWith({
      where: { id: "d1", userId: "u1" },
    });
  });
});
