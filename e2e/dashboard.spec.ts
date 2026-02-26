import { test, expect } from "@playwright/test";

test.describe("Dashboard — guest view", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("shows 'Create a document' heading", async ({ page }) => {
    // Translation key "createDocument" = "Create a document"
    await expect(page.getByRole("heading", { name: /create a document/i })).toBeVisible();
  });

  test("shows three quick-action cards: New Invoice, New Receipt, New Statement", async ({ page }) => {
    // The sidebar also has a "New Invoice" link — scope to main content area
    const main = page.locator("main");
    await expect(main.getByText("New Invoice").first()).toBeVisible();
    await expect(main.getByText("New Receipt").first()).toBeVisible();
    await expect(main.getByText("New Statement").first()).toBeVisible();
  });

  test("clicking 'New Invoice' card navigates to invoice form", async ({ page }) => {
    const main = page.locator("main");
    await main.getByText("New Invoice").first().click();
    await expect(page).toHaveURL(/\/create\/invoice/);
  });

  test("clicking 'New Receipt' card navigates to receipt form", async ({ page }) => {
    const main = page.locator("main");
    await main.getByText("New Receipt").first().click();
    await expect(page).toHaveURL(/\/create\/receipt/);
  });

  test("clicking 'New Statement' card navigates to statement form", async ({ page }) => {
    const main = page.locator("main");
    await main.getByText("New Statement").first().click();
    await expect(page).toHaveURL(/\/create\/statement/);
  });

  test("Recent Documents section shows sign-in-to-save prompt for guests", async ({ page }) => {
    await expect(page.getByText(/sign in to save/i)).toBeVisible();
  });

  test("Sign-in prompt has Sign In and Create account links", async ({ page }) => {
    // Multiple "Sign in" links exist (sidebar + prompt) — .first() is fine
    await expect(page.getByRole("link", { name: /^sign in$/i }).first()).toBeVisible();
    // "Create account" also appears in sidebar and prompt — .first() is fine
    await expect(page.getByRole("link", { name: /create account/i }).first()).toBeVisible();
  });
});

test.describe("Dashboard — navigation sidebar", () => {
  test.beforeEach(async ({ page }) => {
    // Viewport wide enough to show the lg sidebar
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard");
  });

  test("sidebar shows InvoiceClaude brand name", async ({ page }) => {
    await expect(page.locator("aside").getByText("InvoiceClaude")).toBeVisible();
  });

  test("sidebar has Dashboard nav item", async ({ page }) => {
    await expect(page.locator("aside").getByRole("link", { name: /dashboard/i })).toBeVisible();
  });

  test("sidebar has New Invoice nav item", async ({ page }) => {
    await expect(page.locator("aside").getByRole("link", { name: /new invoice/i })).toBeVisible();
  });

  test("sidebar has Contacts nav item", async ({ page }) => {
    await expect(page.locator("aside").getByRole("link", { name: /contacts/i })).toBeVisible();
  });

  test("sidebar has Settings nav item", async ({ page }) => {
    await expect(page.locator("aside").getByRole("link", { name: /settings/i })).toBeVisible();
  });

  test("sidebar has Sign In link for guests", async ({ page }) => {
    await expect(page.locator("aside").getByRole("link", { name: /^sign in$/i })).toBeVisible();
  });

  test("sidebar has Create account link for guests", async ({ page }) => {
    await expect(page.locator("aside").getByRole("link", { name: /create account/i })).toBeVisible();
  });

  test("Contacts sidebar link navigates to /contacts", async ({ page }) => {
    await page.locator("aside").getByRole("link", { name: /contacts/i }).click();
    await expect(page).toHaveURL(/\/contacts/);
  });

  test("Settings sidebar link navigates to /settings", async ({ page }) => {
    await page.locator("aside").getByRole("link", { name: /settings/i }).click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
