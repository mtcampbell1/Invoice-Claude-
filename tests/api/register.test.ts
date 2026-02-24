import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn().mockResolvedValue("hashed_pw") },
}));

import { prisma } from "@/lib/db";
import { POST } from "@/app/api/auth/register/route";

const u = vi.mocked(prisma.user);

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/register", () => {
  it("registers a new user", async () => {
    u.findUnique.mockResolvedValue(null);
    u.create.mockResolvedValue({ id: "u1", email: "test@test.com" } as any);

    const res = await POST(makeRequest({ email: "Test@test.com", password: "password123" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.email).toBe("test@test.com");
    // email was lowercased
    expect(u.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: "test@test.com" }) })
    );
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(makeRequest({ password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(makeRequest({ email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const res = await POST(makeRequest({ email: "a@b.com", password: "short" }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/8 characters/);
  });

  it("returns 400 when email already in use", async () => {
    u.findUnique.mockResolvedValue({ id: "existing" } as any);

    const res = await POST(makeRequest({ email: "taken@test.com", password: "password123" }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error).toMatch(/already in use/i);
  });
});
