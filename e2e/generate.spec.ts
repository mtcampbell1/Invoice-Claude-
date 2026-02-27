import { test, expect } from "@playwright/test";

// Tests that call /api/generate require a live Anthropic API key.
// Tag: [api] — skipped automatically when ANTHROPIC_API_KEY is unset.
const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

test.describe("Form pages load without API key", () => {
  test("invoice form renders", async ({ page }) => {
    await page.goto("/create/invoice");
    await expect(page.getByRole("heading", { name: /new invoice/i })).toBeVisible();
  });

  test("receipt form renders", async ({ page }) => {
    await page.goto("/create/receipt");
    await expect(page.getByRole("heading", { name: /new receipt/i })).toBeVisible();
  });

  test("statement form renders", async ({ page }) => {
    await page.goto("/create/statement");
    await expect(page.getByRole("heading", { name: /new statement/i })).toBeVisible();
  });
});

test.describe("Post-generation result page — upsell banners (guest)", () => {
  test.skip(!hasApiKey, "Requires ANTHROPIC_API_KEY");

  test.beforeEach(async ({ page }) => {
    await page.goto("/create/invoice");
    await page.getByRole("button", { name: /fill test data/i }).click();
    await page.getByRole("button", { name: /generate/i }).click();
    await page.waitForSelector('h1:has-text("Generated")', { timeout: 40_000 });
  });

  test("guest sees exactly ONE upsell banner (combined, not two)", async ({ page }) => {
    // Guest should see the combined indigo banner only — NOT the amber logo banner too
    await expect(page.locator(".bg-indigo-50").filter({ has: page.getByRole("link") })).toHaveCount(1);
    await expect(page.locator(".bg-amber-50").filter({ has: page.getByRole("link") })).toHaveCount(0);
  });

  test("guest banner CTA says 'Create free account', NOT 'Upgrade to Pro'", async ({ page }) => {
    await expect(page.getByRole("link", { name: /create free account/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /upgrade to pro/i })).not.toBeVisible();
  });

  test("PDF viewer is visible", async ({ page }) => {
    await expect(page.locator("iframe")).toBeVisible({ timeout: 10_000 });
  });

  test("Download PDF button is visible (exactly once — no redundant bar)", async ({ page }) => {
    await expect(page.getByRole("button", { name: /download pdf/i })).toHaveCount(1, { timeout: 10_000 });
  });

  test("'Create Another' button returns to the blank form", async ({ page }) => {
    await page.getByRole("button", { name: /create another/i }).click();
    await expect(page.getByRole("heading", { name: /new invoice/i })).toBeVisible();
  });
});

test.describe("Receipt and Statement generation", () => {
  test.skip(!hasApiKey, "Requires ANTHROPIC_API_KEY");

  test("receipt generates and shows 'Receipt Generated'", async ({ page }) => {
    await page.goto("/create/receipt");
    await page.getByRole("button", { name: /fill test data/i }).click();
    await page.getByRole("button", { name: /generate/i }).click();
    await expect(page.getByText(/receipt generated/i)).toBeVisible({ timeout: 40_000 });
  });

  test("statement generates and shows 'Statement Generated'", async ({ page }) => {
    await page.goto("/create/statement");
    await page.getByRole("button", { name: /fill test data/i }).click();
    await page.getByRole("button", { name: /generate/i }).click();
    await expect(page.getByText(/statement generated/i)).toBeVisible({ timeout: 40_000 });
  });
});
