import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface DocumentData {
  type: "invoice" | "receipt" | "statement";
  number: string;
  date: string;
  dueDate?: string;
  from: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
  };
  to: {
    name: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
    email?: string;
  };
  items: LineItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  memo?: string;
}

function formatDateReadable(dateStr?: string): string {
  if (!dateStr) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function buildLocalDocument(rawData: Partial<DocumentData>, type: "invoice" | "receipt" | "statement"): DocumentData {
  const items = (rawData.items ?? []).map((item) => ({
    ...item,
    amount: item.quantity * item.rate,
  }));
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = rawData.taxRate ? subtotal * (rawData.taxRate / 100) : undefined;
  const total = subtotal + (taxAmount ?? 0) - (rawData.discountAmount ?? 0);

  const defaultNotes: Record<string, string> = {
    invoice: "Payment is due within 30 days of the invoice date. Thank you for your business.",
    receipt: "Thank you for your business! This receipt confirms payment received in full.",
    statement: "Please review this statement and contact us with any questions.",
  };

  const defaultPaymentTerms: Record<string, string> = {
    invoice: "Net 30",
    receipt: "Paid in full",
    statement: "Due upon receipt",
  };

  return {
    type,
    number: rawData.number ?? "",
    date: formatDateReadable(rawData.date),
    dueDate: rawData.dueDate ? formatDateReadable(rawData.dueDate) : undefined,
    from: rawData.from ?? { name: "" },
    to: rawData.to ?? { name: "" },
    items,
    subtotal,
    taxRate: rawData.taxRate,
    taxAmount,
    discountAmount: rawData.discountAmount,
    total,
    notes: rawData.notes || defaultNotes[type],
    paymentTerms: rawData.paymentTerms || defaultPaymentTerms[type],
    paymentMethod: rawData.paymentMethod,
    memo: rawData.memo,
  };
}

export async function generateDocument(
  rawData: Partial<DocumentData>,
  type: "invoice" | "receipt" | "statement"
): Promise<DocumentData> {
  // If no API key, use local formatting
  if (!anthropic) {
    return buildLocalDocument(rawData, type);
  }

  const prompt = `You are a professional document formatter. Given the following ${type} data, enhance and complete it into a professional, well-structured document.

Input data:
${JSON.stringify(rawData, null, 2)}

Your task:
1. Ensure all amounts are calculated correctly (subtotal = sum of items, total = subtotal + tax - discount)
2. Add professional notes/payment terms if missing (appropriate for the document type)
3. Format the document number professionally if not provided (e.g., INV-2024-001)
4. Ensure dates are in a readable format (e.g., "February 21, 2026")
5. Calculate any missing line item amounts (quantity × rate = amount)
6. For invoices: add standard payment terms if missing
7. For receipts: add "Thank you for your business" type message if no notes
8. For statements: add appropriate period and balance notes

Return ONLY valid JSON matching the DocumentData structure. No explanation, no markdown, just the JSON object.

Required JSON structure:
{
  "type": "${type}",
  "number": "string",
  "date": "string",
  "dueDate": "string or null",
  "from": { "name": "string", "address": "string or null", "city": "string or null", "state": "string or null", "zip": "string or null", "phone": "string or null", "email": "string or null", "website": "string or null", "taxId": "string or null" },
  "to": { "name": "string", "company": "string or null", "address": "string or null", "city": "string or null", "state": "string or null", "zip": "string or null", "phone": "string or null", "email": "string or null" },
  "items": [{ "description": "string", "quantity": number, "rate": number, "amount": number }],
  "subtotal": number,
  "taxRate": number or null,
  "taxAmount": number or null,
  "discountAmount": number or null,
  "total": number,
  "notes": "string or null",
  "paymentTerms": "string or null",
  "paymentMethod": "string or null",
  "memo": "string or null"
}`;

  const stream = anthropic.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "enabled", budget_tokens: 2000 },
    messages: [{ role: "user", content: prompt }],
  });

  const response = await stream.finalMessage();

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  let jsonText = textBlock.text.trim();

  // Strip markdown code fences if present
  jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  const result = JSON.parse(jsonText) as DocumentData;
  return result;
}
