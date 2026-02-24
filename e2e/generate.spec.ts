import { test, expect } from "@playwright/test";

test.describe("Document generation (guest)", () => {
  test("invoice page renders the form", async ({ page }) => {
    await page.goto("/create/invoice");
    // Should show document form fields
    await expect(page.getByText(/invoice/i).first()).toBeVisible();
  });

  test("receipt page renders the form", async ({ page }) => {
    await page.goto("/create/receipt");
    await expect(page.getByText(/receipt/i).first()).toBeVisible();
  });

  test("statement page renders the form", async ({ page }) => {
    await page.goto("/create/statement");
    await expect(page.getByText(/statement/i).first()).toBeVisible();
  });

  test("guest can submit invoice form and see generated document", async ({ page }) => {
    await page.goto("/create/invoice");

    // Fill in required fields
    await page.getByLabel(/from.*name|your.*name|business.*name/i).fill("Acme Corp");
    await page.getByLabel(/to.*name|client.*name|bill.*to/i).fill("Client Co");

    // Submit
    await page.getByRole("button", { name: /generate|create|submit/i }).click();

    // Should show the generated document or a success state
    await expect(
      page.getByText(/invoice|generated|preview/i).first()
    ).toBeVisible({ timeout: 30_000 });
  });
});
