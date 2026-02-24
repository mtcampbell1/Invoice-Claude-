import { describe, it, expect } from "vitest";
import { cn, formatCurrency, formatDate, generateDocumentNumber } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatCurrency", () => {
  it("formats whole numbers", () => {
    expect(formatCurrency(100)).toBe("$100.00");
  });

  it("formats decimal amounts", () => {
    expect(formatCurrency(49.99)).toBe("$49.99");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats large amounts with comma separators", () => {
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });

  it("supports other currency codes", () => {
    const result = formatCurrency(10, "EUR");
    expect(result).toContain("10");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2026-02-24"));
    expect(result).toMatch(/February\s+24,\s+2026/);
  });

  it("formats a date string", () => {
    const result = formatDate("2025-12-25");
    expect(result).toMatch(/December\s+25,\s+2025/);
  });
});

describe("generateDocumentNumber", () => {
  it("generates invoice number with INV prefix", () => {
    const num = generateDocumentNumber("invoice");
    expect(num).toMatch(/^INV-\d{4}-\d{4}$/);
  });

  it("generates receipt number with REC prefix", () => {
    const num = generateDocumentNumber("receipt");
    expect(num).toMatch(/^REC-\d{4}-\d{4}$/);
  });

  it("generates statement number with STM prefix", () => {
    const num = generateDocumentNumber("statement");
    expect(num).toMatch(/^STM-\d{4}-\d{4}$/);
  });

  it("includes current year", () => {
    const year = new Date().getFullYear().toString();
    const num = generateDocumentNumber("invoice");
    expect(num).toContain(year);
  });

  it("generates unique numbers", () => {
    const numbers = new Set(Array.from({ length: 20 }, () => generateDocumentNumber("invoice")));
    // With 9000 possible random values, 20 should almost certainly be unique
    expect(numbers.size).toBeGreaterThan(15);
  });
});
