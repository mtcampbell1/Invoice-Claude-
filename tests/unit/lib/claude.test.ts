import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
  };
});

describe("generateDocument", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("uses local fallback when no API key is set", async () => {
    // Ensure no API key
    delete process.env.ANTHROPIC_API_KEY;
    const { generateDocument } = await import("@/lib/claude");

    const result = await generateDocument(
      {
        number: "INV-001",
        date: "2026-02-24",
        from: { name: "Acme Corp" },
        to: { name: "Client Co" },
        items: [{ description: "Service", quantity: 2, rate: 50, amount: 100 }],
        subtotal: 100,
        total: 100,
      },
      "invoice"
    );

    expect(result.type).toBe("invoice");
    expect(result.from.name).toBe("Acme Corp");
    expect(result.to.name).toBe("Client Co");
    expect(result.total).toBe(100);
    expect(result.notes).toBeTruthy();
    expect(result.paymentTerms).toBeTruthy();
  });

  it("local fallback calculates amounts correctly", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { generateDocument } = await import("@/lib/claude");

    const result = await generateDocument(
      {
        items: [
          { description: "A", quantity: 3, rate: 10, amount: 30 },
          { description: "B", quantity: 1, rate: 50, amount: 50 },
        ],
        taxRate: 10,
        from: { name: "Seller" },
        to: { name: "Buyer" },
      },
      "receipt"
    );

    expect(result.subtotal).toBe(80);
    expect(result.taxAmount).toBe(8);
    expect(result.total).toBe(88);
    expect(result.type).toBe("receipt");
  });

  it("local fallback uses document-type-specific defaults", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { generateDocument } = await import("@/lib/claude");

    const invoice = await generateDocument({ from: { name: "A" }, to: { name: "B" } }, "invoice");
    expect(invoice.notes).toMatch(/payment/i);

    const receipt = await generateDocument({ from: { name: "A" }, to: { name: "B" } }, "receipt");
    expect(receipt.notes).toMatch(/thank you/i);

    const statement = await generateDocument({ from: { name: "A" }, to: { name: "B" } }, "statement");
    expect(statement.notes).toMatch(/statement/i);
  });

  it("local fallback formats dates readably", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const { generateDocument } = await import("@/lib/claude");

    const result = await generateDocument(
      { date: "2026-02-24", from: { name: "A" }, to: { name: "B" } },
      "invoice"
    );

    expect(result.date).toMatch(/February\s+24,\s+2026/);
  });
});
