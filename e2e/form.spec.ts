import { test, expect } from "@playwright/test";

// ─── Invoice form ────────────────────────────────────────────────────────────

test.describe("Invoice form — structure", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/invoice");
  });

  test("page heading says 'New Invoice'", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /new invoice/i })).toBeVisible();
  });

  test("has 'Your Business' section", async ({ page }) => {
    await expect(page.getByText("Your Business")).toBeVisible();
  });

  test("has 'Client / Bill To' section", async ({ page }) => {
    await expect(page.getByText("Client / Bill To")).toBeVisible();
  });

  test("has 'Invoice Details' section", async ({ page }) => {
    await expect(page.getByText("Invoice Details")).toBeVisible();
  });

  test("has Notes field", async ({ page }) => {
    await expect(page.getByPlaceholder(/payment instructions/i)).toBeVisible();
  });
});

test.describe("Invoice form — business fields", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/invoice");
  });

  // After the useId fix, getByLabel works because label htmlFor is now set
  test("Business Name field is present", async ({ page }) => {
    await expect(page.getByLabel(/business name/i)).toBeVisible();
  });

  test("Address field is present", async ({ page }) => {
    await expect(page.getByLabel(/^address$/i).first()).toBeVisible();
  });

  test("City field is present", async ({ page }) => {
    await expect(page.getByLabel(/^city$/i).first()).toBeVisible();
  });

  test("State field is present", async ({ page }) => {
    await expect(page.getByLabel(/^state$/i).first()).toBeVisible();
  });

  test("Zip field is present", async ({ page }) => {
    await expect(page.getByLabel(/^zip$/i).first()).toBeVisible();
  });

  test("Email field is present", async ({ page }) => {
    await expect(page.getByLabel(/^email$/i).first()).toBeVisible();
  });

  test("Phone field is present", async ({ page }) => {
    await expect(page.getByLabel(/^phone$/i).first()).toBeVisible();
  });

  test("Tax ID field is present", async ({ page }) => {
    await expect(page.getByLabel(/tax id/i)).toBeVisible();
  });
});

test.describe("Invoice form — client fields", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/invoice");
  });

  test("Client Name field is present", async ({ page }) => {
    await expect(page.getByLabel(/client name/i)).toBeVisible();
  });

  test("Company field is present", async ({ page }) => {
    await expect(page.getByLabel(/^company$/i)).toBeVisible();
  });
});

test.describe("Invoice form — document detail fields", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/invoice");
  });

  test("Invoice Number field is present and auto-populated", async ({ page }) => {
    const field = page.getByLabel(/invoice number/i);
    await expect(field).toBeVisible();
    await expect(field).not.toHaveValue("");
  });

  test("Date field is present and auto-populated", async ({ page }) => {
    const field = page.getByLabel(/^date$/i);
    await expect(field).toBeVisible();
    await expect(field).not.toHaveValue("");
  });

  test("Due Date field is present (invoice-specific)", async ({ page }) => {
    await expect(page.getByLabel(/due date/i)).toBeVisible();
  });
});

test.describe("Invoice form — line items", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/invoice");
  });

  test("starts with one description field", async ({ page }) => {
    await expect(page.getByPlaceholder(/description of service/i)).toHaveCount(1);
  });

  test("has quantity, rate (per row) and tax rate number inputs — 3 for 1 row", async ({ page }) => {
    // 1 row × (qty + rate) + 1 tax rate = 3
    await expect(page.locator('input[type="number"]')).toHaveCount(3);
  });

  test("'Add line item' button adds a second row", async ({ page }) => {
    await page.getByText(/add line item/i).click();
    await expect(page.getByPlaceholder(/description of service/i)).toHaveCount(2);
    // 2 rows × 2 number inputs + 1 tax = 5
    await expect(page.locator('input[type="number"]')).toHaveCount(5);
  });

  test("remove button appears with two rows and removes a row", async ({ page }) => {
    await page.getByText(/add line item/i).click();
    await expect(page.getByPlaceholder(/description of service/i)).toHaveCount(2);
    // Click the first trash button (svg icon button)
    await page.locator("button").filter({ has: page.locator(".lucide-trash-2") }).first().click();
    await expect(page.getByPlaceholder(/description of service/i)).toHaveCount(1);
  });

  test("totals update when rate is entered", async ({ page }) => {
    const rateInput = page.locator('input[type="number"]').nth(1);
    await rateInput.fill("100");
    await expect(page.getByText("$100.00").first()).toBeVisible();
  });

  test("tax rate field changes total", async ({ page }) => {
    await page.locator('input[type="number"]').nth(1).fill("200");
    await page.getByLabel(/tax rate/i).fill("10");
    await expect(page.getByText("$20.00").first()).toBeVisible();
    await expect(page.getByText("$220.00").first()).toBeVisible();
  });
});

test.describe("Invoice form — actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/invoice");
  });

  test("has two Generate buttons (header and footer of form)", async ({ page }) => {
    // Button says "Generate Invoice" — one at the top header, one at the bottom
    await expect(page.getByRole("button", { name: /generate/i })).toHaveCount(2);
  });

  test("'Fill test data' button populates all fields", async ({ page }) => {
    await page.getByRole("button", { name: /fill test data/i }).click();
    await expect(page.getByLabel(/business name/i)).toHaveValue("Acme Consulting LLC");
    await expect(page.getByLabel(/client name/i)).toHaveValue("Jane Smith");
    // Three line items should now exist
    await expect(page.getByPlaceholder(/description of service/i)).toHaveCount(3);
  });

  test("notes textarea accepts input", async ({ page }) => {
    const notes = page.getByPlaceholder(/payment instructions/i);
    await notes.fill("Please pay within 30 days");
    await expect(notes).toHaveValue("Please pay within 30 days");
  });
});

// ─── Receipt form ─────────────────────────────────────────────────────────────

test.describe("Receipt form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/receipt");
  });

  test("page heading says 'New Receipt'", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /new receipt/i })).toBeVisible();
  });

  test("has 'Receipt Details' section", async ({ page }) => {
    await expect(page.getByText("Receipt Details")).toBeVisible();
  });

  test("does NOT show a Due Date field", async ({ page }) => {
    await expect(page.getByLabel(/due date/i)).not.toBeVisible();
  });

  test("Receipt Number field is auto-populated", async ({ page }) => {
    const field = page.getByLabel(/receipt number/i);
    await expect(field).toBeVisible();
    await expect(field).not.toHaveValue("");
  });
});

// ─── Statement form ───────────────────────────────────────────────────────────

test.describe("Statement form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/create/statement");
  });

  test("page heading says 'New Statement'", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /new statement/i })).toBeVisible();
  });

  test("has 'Statement Details' section", async ({ page }) => {
    await expect(page.getByText("Statement Details")).toBeVisible();
  });

  test("does NOT show a Due Date field", async ({ page }) => {
    await expect(page.getByLabel(/due date/i)).not.toBeVisible();
  });

  test("Statement Number field is auto-populated", async ({ page }) => {
    const field = page.getByLabel(/statement number/i);
    await expect(field).toBeVisible();
    await expect(field).not.toHaveValue("");
  });
});

// ─── Logo upsell on form ──────────────────────────────────────────────────────

test.describe("Form — logo upsell (guest)", () => {
  test("guest sees 'Add your logo' hint", async ({ page }) => {
    await page.goto("/create/invoice");
    await expect(page.getByText(/add your logo/i)).toBeVisible();
  });

  test("logo hint has a Sign up link", async ({ page }) => {
    await page.goto("/create/invoice");
    // The upsell shows a "Sign up free" link for guests
    await expect(page.getByRole("link", { name: /sign up free/i })).toBeVisible();
  });
});
