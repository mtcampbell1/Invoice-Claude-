import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders hero with three document-type buttons", async ({ page }) => {
    await page.goto("/");

    // Three CTA buttons
    await expect(page.getByRole("link", { name: /invoice/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /receipt/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /statement/i }).first()).toBeVisible();

    // Tagline text
    await expect(page.getByText(/start free/i)).toBeVisible();
  });

  test("Invoice button navigates to /create/invoice", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /invoice/i }).first().click();
    await expect(page).toHaveURL(/\/create\/invoice/);
  });

  test("Receipt button navigates to /create/receipt", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /receipt/i }).first().click();
    await expect(page).toHaveURL(/\/create\/receipt/);
  });

  test("Statement button navigates to /create/statement", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /statement/i }).first().click();
    await expect(page).toHaveURL(/\/create\/statement/);
  });

  test("View pricing link scrolls to pricing section", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /view pricing/i }).click();
    await expect(page.locator("#pricing")).toBeInViewport();
  });

  test("pricing section shows all four plans", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("$2.99")).toBeVisible();
    await expect(page.getByText("$5.99")).toBeVisible();
    await expect(page.getByText("$19.99")).toBeVisible();
  });

  test("nav has sign-in and get started links", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
  });

  test("features section renders all four features", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("AI-Powered")).toBeVisible();
    await expect(page.getByText("All Document Types")).toBeVisible();
    await expect(page.getByText("Instant PDF")).toBeVisible();
    await expect(page.getByText("Secure & Private")).toBeVisible();
  });

  test("how it works section shows three steps", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Fill in the details")).toBeVisible();
    await expect(page.getByText("Claude polishes it")).toBeVisible();
    await expect(page.getByText("Download PDF")).toBeVisible();
  });
});
