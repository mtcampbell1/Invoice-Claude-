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
  logoUrl?: string;
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
  if (!dateStr)
    return new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

export async function generateDocument(
  rawData: Partial<DocumentData>,
  type: "invoice" | "receipt" | "statement"
): Promise<DocumentData> {
  const items = (rawData.items ?? []).map((item) => ({
    ...item,
    amount: item.quantity * item.rate,
  }));
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  const taxAmount = rawData.taxRate
    ? subtotal * (rawData.taxRate / 100)
    : undefined;
  const total =
    subtotal + (taxAmount ?? 0) - (rawData.discountAmount ?? 0);

  const defaultNotes: Record<string, string> = {
    invoice:
      "Payment is due within 30 days of the invoice date. Thank you for your business.",
    receipt:
      "Thank you for your business! This receipt confirms payment received in full.",
    statement:
      "Please review this statement and contact us with any questions.",
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
