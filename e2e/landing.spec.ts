import { test, expect } from "@playwright/test";

test.describe("Landing page — hero", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page title contains 'invoice'", async ({ page }) => {
    await expect(page).toHaveTitle(/invoice/i);
  });

  test("hero has three document-type CTA buttons", async ({ page }) => {
    await expect(page.getByRole("link", { name: /^invoice$/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^receipt$/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^statement$/i }).first()).toBeVisible();
  });

  test("tagline says 'Start free'", async ({ page }) => {
    // Two elements match /start free/i — use the first (hero tagline)
    await expect(page.getByText(/start free/i).first()).toBeVisible();
  });

  test("Invoice button navigates to /create/invoice", async ({ page }) => {
    await page.getByRole("link", { name: /^invoice$/i }).first().click();
    await expect(page).toHaveURL(/\/create\/invoice/);
  });

  test("Receipt button navigates to /create/receipt", async ({ page }) => {
    await page.getByRole("link", { name: /^receipt$/i }).first().click();
    await expect(page).toHaveURL(/\/create\/receipt/);
  });

  test("Statement button navigates to /create/statement", async ({ page }) => {
    await page.getByRole("link", { name: /^statement$/i }).first().click();
    await expect(page).toHaveURL(/\/create\/statement/);
  });

  test("'View pricing' link scrolls to pricing section", async ({ page }) => {
    await page.getByRole("link", { name: /view pricing/i }).click();
    await expect(page.locator("#pricing")).toBeInViewport();
  });
});

test.describe("Landing page — nav", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("nav has Sign in link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("nav has 'Get Started' button", async ({ page }) => {
    // Scope to the header to avoid matching the free-plan CTA in pricing
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Get Started", exact: true })).toBeVisible();
  });

  test("Sign in link navigates to sign-in page", async ({ page }) => {
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("Get Started button navigates to sign-up page", async ({ page }) => {
    const header = page.locator("header");
    await header.getByRole("link", { name: "Get Started", exact: true }).click();
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

test.describe("Landing page — features section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders 'Fast & Simple' feature", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Fast & Simple" })).toBeVisible();
  });

  test("renders 'All Document Types' feature", async ({ page }) => {
    // Use role=heading to disambiguate from plan feature-list spans
    await expect(page.getByRole("heading", { name: "All Document Types" })).toBeVisible();
  });

  test("renders 'Instant PDF' feature", async ({ page }) => {
    // Use role=heading to disambiguate from plan feature-list spans
    await expect(page.getByRole("heading", { name: "Instant PDF" })).toBeVisible();
  });

  test("renders 'Secure & Private' feature", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Secure & Private" })).toBeVisible();
  });
});

test.describe("Landing page — how it works section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows step 1: Fill in the details", async ({ page }) => {
    await expect(page.getByText("Fill in the details")).toBeVisible();
  });

  test("shows step 2: Generate your document", async ({ page }) => {
    await expect(page.getByText("Generate your document")).toBeVisible();
  });

  test("shows step 3: Download PDF", async ({ page }) => {
    await expect(page.getByText("Download PDF")).toBeVisible();
  });
});

test.describe("Landing page — pricing section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("#pricing").scrollIntoViewIfNeeded();
  });

  test("shows free plan ($0)", async ({ page }) => {
    await expect(page.getByText("$0")).toBeVisible();
  });

  test("shows basic plan ($2.99)", async ({ page }) => {
    await expect(page.getByText("$2.99").first()).toBeVisible();
  });

  test("shows pro plan ($5.99)", async ({ page }) => {
    await expect(page.getByText("$5.99").first()).toBeVisible();
  });

  test("shows business plan ($19.99)", async ({ page }) => {
    await expect(page.getByText("$19.99")).toBeVisible();
  });

  test("'Most Popular' badge is visible on Pro plan", async ({ page }) => {
    await expect(page.getByText("Most Popular")).toBeVisible();
  });

  test("token packs section is visible", async ({ page }) => {
    await expect(page.getByText(/token packs/i).first()).toBeVisible();
  });
});
