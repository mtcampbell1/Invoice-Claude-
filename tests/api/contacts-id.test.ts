import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    contact: { deleteMany: vi.fn(), updateMany: vi.fn() },
  },
}));

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { DELETE, PUT } from "@/app/api/contacts/[id]/route";

const mockSession = vi.mocked(getServerSession);

function makeParams(id: string) {
  return { params: { id } };
}

function makeRequest(body: object) {
  return new Request("http://localhost/api/contacts/c1", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("DELETE /api/contacts/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);
    const res = await DELETE(new Request("http://localhost"), makeParams("c1"));
    expect(res.status).toBe(401);
  });

  it("deletes contact scoped to user", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.contact.deleteMany).mockResolvedValue({ count: 1 } as any);

    const res = await DELETE(new Request("http://localhost"), makeParams("c1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(prisma.contact.deleteMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "u1" },
    });
  });
});

describe("PUT /api/contacts/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    mockSession.mockResolvedValue(null);
    const res = await PUT(makeRequest({ name: "Updated" }), makeParams("c1"));
    expect(res.status).toBe(401);
  });

  it("updates contact scoped to user", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } } as any);
    vi.mocked(prisma.contact.updateMany).mockResolvedValue({ count: 1 } as any);

    const res = await PUT(makeRequest({ name: "Updated Client", email: "updated@test.com" }), makeParams("c1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(prisma.contact.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", userId: "u1" },
      data: expect.objectContaining({ name: "Updated Client", email: "updated@test.com" }),
    });
  });
});
