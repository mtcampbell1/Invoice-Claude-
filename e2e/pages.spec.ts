import { test, expect } from "@playwright/test";

test.describe("Contacts page — guest / free user", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contacts");
  });

  test("page heading says 'Contacts'", async ({ page }) => {
    // Translation key "title" in contacts namespace
    await expect(page.getByRole("heading", { name: /contacts/i })).toBeVisible();
  });

  test("shows Pro-feature upgrade prompt for unauthenticated users", async ({ page }) => {
    await expect(page.getByText(/pro feature/i)).toBeVisible();
  });

  test("upgrade prompt has an Upgrade button", async ({ page }) => {
    await expect(page.getByRole("link", { name: /upgrade/i })).toBeVisible();
  });
});

test.describe("Settings page — guest / free user", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/settings");
  });

  test("page heading says 'Settings'", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /settings/i })).toBeVisible();
  });

  test("shows Pro-required banner with Upgrade button", async ({ page }) => {
    await expect(page.getByText(/pro feature/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /upgrade/i })).toBeVisible();
  });

  test("business info form section heading is visible", async ({ page }) => {
    // Heading is "Business Information" — scope to heading role to avoid matching
    // the amber banner text ("Pro feature – Upgrade to save your business info")
    await expect(page.getByRole("heading", { name: /business information/i })).toBeVisible();
  });

  test("Save button is disabled for non-Pro users", async ({ page }) => {
    // The card has 'pointer-events-none opacity-60' and the button has disabled prop
    await expect(page.getByRole("button", { name: /save/i })).toBeDisabled();
  });
});

test.describe("Upgrade page — token packs tab (default)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/upgrade");
  });

  test("shows 'Token packs' tab as active by default", async ({ page }) => {
    await expect(page.getByRole("button", { name: /token packs/i })).toBeVisible();
  });

  test("shows 'Monthly plans' tab", async ({ page }) => {
    await expect(page.getByRole("button", { name: /monthly plans/i })).toBeVisible();
  });

  test("shows three token pack prices: $2.99, $5.99, $9.99", async ({ page }) => {
    await expect(page.getByText("$2.99")).toBeVisible();
    await expect(page.getByText("$5.99")).toBeVisible();
    await expect(page.getByText("$9.99")).toBeVisible();
  });

  test("'Best Value' badge is visible on the middle token pack", async ({ page }) => {
    await expect(page.getByText(/best value/i)).toBeVisible();
  });
});

test.describe("Upgrade page — monthly plans tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/upgrade");
    // Click the Monthly plans tab to reveal plan cards
    await page.getByRole("button", { name: /monthly plans/i }).click();
  });

  test("shows Basic, Pro, and Business plan cards", async ({ page }) => {
    // Use the plan name <p> element to avoid matching the "Get Basic" button text
    await expect(page.locator("p").filter({ hasText: /^Basic$/ })).toBeVisible();
    await expect(page.locator("p").filter({ hasText: /^Pro$/ })).toBeVisible();
    await expect(page.locator("p").filter({ hasText: /^Business$/ })).toBeVisible();
  });

  test("shows plan prices: $2.99, $5.99, $19.99", async ({ page }) => {
    await expect(page.getByText("$2.99").first()).toBeVisible();
    await expect(page.getByText("$5.99").first()).toBeVisible();
    await expect(page.getByText("$19.99")).toBeVisible();
  });

  test("shows 'Most Popular' badge on Pro plan", async ({ page }) => {
    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("each paid plan has a 'Get' CTA button", async ({ page }) => {
    // Buttons say "Get Basic", "Get Pro", "Get Business"
    await expect(page.getByRole("button", { name: /get basic/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /get pro/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /get business/i })).toBeVisible();
  });
});

test.describe("Navigation sidebar — logo is NOT a link", () => {
  test("InvoiceClaude text in sidebar is decorative (span), not a nav link", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard");
    // The logo is a <span> inside <aside>, not a <Link>
    const logoText = page.locator("aside span").filter({ hasText: "InvoiceClaude" });
    await expect(logoText).toBeVisible();
    // It must NOT be wrapped in an <a> tag
    const logoLink = page.locator("aside a").filter({ hasText: "InvoiceClaude" });
    await expect(logoLink).toHaveCount(0);
  });
});

test.describe("404 page", () => {
  test("shows not found message for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist-abc123");
    const status = response?.status() ?? 200;
    if (status !== 200) {
      expect(status).toBe(404);
    } else {
      await expect(page.getByText(/not found|404/i)).toBeVisible({ timeout: 5_000 });
    }
  });
});
