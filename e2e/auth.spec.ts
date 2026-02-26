import { test, expect } from "@playwright/test";

test.describe("Sign-in page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
  });

  test("renders email and password fields", async ({ page }) => {
    // Labels are now properly linked to inputs via useId in Input component
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });

  test("has a sign-in submit button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("has a link to sign-up page", async ({ page }) => {
    const link = page.getByRole("link", { name: /sign.?up|create.?account/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/sign-up/);
  });

  test("shows error with wrong credentials", async ({ page }) => {
    // This test requires a running database. Skip if DATABASE_URL is not set.
    test.skip(!process.env.DATABASE_URL, "Requires DATABASE_URL");
    await page.getByLabel(/^email$/i).fill("nobody@example.com");
    await page.getByLabel(/^password$/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Error text is "Invalid email or password"
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({ timeout: 10_000 });
  });

  test("no forgot password link currently exists", async ({ page }) => {
    // Documents a known gap — no forgot-password flow is implemented yet.
    await expect(page.getByRole("link", { name: /forgot.?password/i })).not.toBeVisible();
  });
});

test.describe("Sign-up page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-up");
  });

  test("renders name, email, and password fields", async ({ page }) => {
    await expect(page.getByLabel(/^name$/i)).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });

  test("has a create account submit button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /sign.?up|create.?account/i })).toBeVisible();
  });

  test("has a link back to sign-in", async ({ page }) => {
    const link = page.getByRole("link", { name: /sign.?in/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("shows error for password shorter than 8 characters", async ({ page }) => {
    await page.getByLabel(/^email$/i).fill("test@example.com");
    await page.getByLabel(/^password$/i).fill("short");
    await page.getByRole("button", { name: /sign.?up|create.?account/i }).click();
    // Client-side validation — exact error text is "Password must be at least 8 characters"
    await expect(page.getByText(/at least 8 characters/i)).toBeVisible({ timeout: 3_000 });
  });

  test("does NOT submit when email is missing", async ({ page }) => {
    await page.getByLabel(/^password$/i).fill("password123");
    await page.getByRole("button", { name: /sign.?up|create.?account/i }).click();
    // Browser native email validation blocks submission — page stays on sign-up
    await expect(page).toHaveURL(/\/sign-up/);
  });
});

test.describe("Auth redirects — pages accessible to guests", () => {
  test("dashboard shows sign-in prompt in recent docs section", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/sign in to save/i)).toBeVisible({ timeout: 8_000 });
  });

  test("settings shows Pro-feature upgrade prompt for guests", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText(/pro feature/i)).toBeVisible({ timeout: 8_000 });
  });

  test("contacts shows Pro-feature upgrade prompt for guests", async ({ page }) => {
    await page.goto("/contacts");
    await expect(page.getByText(/pro feature/i)).toBeVisible({ timeout: 8_000 });
  });
});
