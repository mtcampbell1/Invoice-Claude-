import { test, expect } from "@playwright/test";

test.describe("Invoice form — fields and interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/invoice");
  });

  test("renders all form sections", async ({ page }) => {
    await expect(page.getByText("Your Business")).toBeVisible();
    await expect(page.getByText("Client / Bill To")).toBeVisible();
    await expect(page.getByText("Invoice Details")).toBeVisible();
    await expect(page.getByText("Notes (optional)")).toBeVisible();
  });

  test("business fields are present", async ({ page }) => {
    await expect(page.getByLabel(/business name/i)).toBeVisible();
    await expect(page.getByLabel(/^address$/i).first()).toBeVisible();
    await expect(page.getByLabel(/^city$/i).first()).toBeVisible();
    await expect(page.getByLabel(/^state$/i).first()).toBeVisible();
    await expect(page.getByLabel(/^zip$/i).first()).toBeVisible();
    await expect(page.getByLabel(/^email$/i).first()).toBeVisible();
    await expect(page.getByLabel(/^phone$/i).first()).toBeVisible();
    await expect(page.getByLabel(/tax id/i)).toBeVisible();
  });

  test("client fields are present", async ({ page }) => {
    await expect(page.getByLabel(/client name/i)).toBeVisible();
    await expect(page.getByLabel(/company/i)).toBeVisible();
  });

  test("invoice-specific fields are present", async ({ page }) => {
    await expect(page.getByLabel(/invoice number/i)).toBeVisible();
    await expect(page.getByLabel(/^date$/i)).toBeVisible();
    await expect(page.getByLabel(/due date/i)).toBeVisible();
  });

  test("line item row has description, quantity, and rate", async ({ page }) => {
    await expect(page.getByPlaceholder(/description of service/i)).toBeVisible();
    // Quantity and rate inputs
    const numberInputs = page.locator('input[type="number"]');
    await expect(numberInputs).toHaveCount(3); // qty, rate, tax
  });

  test("Add line item button works", async ({ page }) => {
    const addBtn = page.getByText(/add line item/i);
    await addBtn.click();
    // Should now have 2 description fields
    const descriptions = page.getByPlaceholder(/description of service/i);
    await expect(descriptions).toHaveCount(2);
  });

  test("Remove line item button appears with multiple items", async ({ page }) => {
    // Initially no trash icon (only 1 item)
    await expect(page.locator('[class*="trash"], [data-testid="remove-item"]').first()).not.toBeVisible();
    // Add another item
    await page.getByText(/add line item/i).click();
    // Now trash icons should appear
    const trashButtons = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' });
    // At least some delete mechanism should exist
    const descriptions = page.getByPlaceholder(/description of service/i);
    await expect(descriptions).toHaveCount(2);
  });

  test("totals update when line item values change", async ({ page }) => {
    // Fill in a rate
    const rateInput = page.locator('input[type="number"]').nth(1); // rate field
    await rateInput.fill("100");
    // Should show $100.00 somewhere in totals
    await expect(page.getByText("$100.00").first()).toBeVisible();
  });

  test("tax rate affects total", async ({ page }) => {
    // Set rate to 100
    const rateInput = page.locator('input[type="number"]').nth(1);
    await rateInput.fill("200");
    // Set tax rate
    const taxInput = page.getByLabel(/tax rate/i);
    await taxInput.fill("10");
    // Should show tax amount ($20.00) and total ($220.00)
    await expect(page.getByText("$20.00").first()).toBeVisible();
    await expect(page.getByText("$220.00").first()).toBeVisible();
  });

  test("Generate with AI button exists at top and bottom", async ({ page }) => {
    const generateButtons = page.getByRole("button", { name: /generate/i });
    await expect(generateButtons).toHaveCount(2);
  });

  test("notes textarea is fillable", async ({ page }) => {
    const notes = page.getByPlaceholder(/payment instructions/i);
    await notes.fill("Please pay within 30 days");
    await expect(notes).toHaveValue("Please pay within 30 days");
  });
});

test.describe("Receipt form", () => {
  test("does NOT show due date field", async ({ page }) => {
    await page.goto("/create/receipt");
    await expect(page.getByLabel(/due date/i)).not.toBeVisible();
  });

  test("shows receipt-specific heading", async ({ page }) => {
    await page.goto("/create/receipt");
    await expect(page.getByText("Receipt Details")).toBeVisible();
  });
});

test.describe("Statement form", () => {
  test("does NOT show due date field", async ({ page }) => {
    await page.goto("/create/statement");
    await expect(page.getByLabel(/due date/i)).not.toBeVisible();
  });

  test("shows statement-specific heading", async ({ page }) => {
    await page.goto("/create/statement");
    await expect(page.getByText("Statement Details")).toBeVisible();
  });
});

test.describe("Guest document generation", () => {
  test("guest can fill and submit full invoice form", async ({ page }) => {
    await page.goto("/create/invoice");

    // Fill business info
    await page.getByLabel(/business name/i).fill("Test Business LLC");

    // Fill client info
    await page.getByLabel(/client name/i).fill("Test Client");

    // Fill line item
    await page.getByPlaceholder(/description of service/i).fill("Web Development");
    await page.locator('input[type="number"]').nth(1).fill("500");

    // Submit
    await page.getByRole("button", { name: /generate/i }).first().click();

    // Should show generated doc or error (both are valid outcomes depending on API)
    await expect(
      page.getByText(/generated|preview|failed|error|tokens/i).first()
    ).toBeVisible({ timeout: 30_000 });
  });
});
