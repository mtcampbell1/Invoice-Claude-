import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("landing page loads with sign-in link", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/invoice/i);
    // Should have a CTA to sign in or get started
    const signIn = page.getByRole("link", { name: /sign.?in|get.?started|log.?in/i }).first();
    await expect(signIn).toBeVisible();
  });

  test("sign-up page renders form", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /password/i }).first()).toBeVisible();
  });

  test("sign-up shows error for short password", async ({ page }) => {
    await page.goto("/sign-up");
    await page.getByRole("textbox", { name: /email/i }).fill("test@example.com");
    await page.getByRole("textbox", { name: /password/i }).first().fill("short");
    await page.getByRole("button", { name: /sign.?up|create.?account/i }).click();
    // Expect a validation error to appear
    await expect(page.getByText(/8|password/i)).toBeVisible();
  });

  test("sign-in page renders form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("textbox", { name: /password/i })).toBeVisible();
  });

  test("sign-in shows error with wrong credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("textbox", { name: /email/i }).fill("nobody@example.com");
    await page.getByRole("textbox", { name: /password/i }).fill("wrongpassword");
    await page.getByRole("button", { name: /sign.?in|log.?in/i }).click();
    await expect(page.getByText(/invalid|incorrect|wrong|error/i)).toBeVisible({ timeout: 5000 });
  });
});
