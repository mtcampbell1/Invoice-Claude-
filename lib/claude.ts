import { formatDate } from "@/lib/utils";

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
  locale?: string;
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

function formatDateReadable(dateStr?: string, locale?: string): string {
  if (!dateStr) return formatDate(new Date(), locale);
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : formatDate(d, locale);
}

const defaultNotesByLocale: Record<string, Record<string, string>> = {
  en: {
    invoice:
      "Payment is due within 30 days of the invoice date. Thank you for your business.",
    receipt:
      "Thank you for your business! This receipt confirms payment received in full.",
    statement:
      "Please review this statement and contact us with any questions.",
  },
  es: {
    invoice:
      "El pago vence dentro de 30 días a partir de la fecha de la factura. Gracias por su preferencia.",
    receipt:
      "¡Gracias por su preferencia! Este recibo confirma el pago recibido en su totalidad.",
    statement:
      "Por favor revise este estado de cuenta y contáctenos si tiene alguna pregunta.",
  },
};

const defaultPaymentTermsByLocale: Record<string, Record<string, string>> = {
  en: {
    invoice: "Net 30",
    receipt: "Paid in full",
    statement: "Due upon receipt",
  },
  es: {
    invoice: "Neto 30 días",
    receipt: "Pagado en su totalidad",
    statement: "Vence al recibir",
  },
};

export async function generateDocument(
  rawData: Partial<DocumentData>,
  type: "invoice" | "receipt" | "statement",
  locale = "en"
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

  const defaultNotes = defaultNotesByLocale[locale] ?? defaultNotesByLocale.en;
  const defaultPaymentTerms =
    defaultPaymentTermsByLocale[locale] ?? defaultPaymentTermsByLocale.en;

  return {
    type,
    number: rawData.number ?? "",
    date: formatDateReadable(rawData.date, locale),
    dueDate: rawData.dueDate
      ? formatDateReadable(rawData.dueDate, locale)
      : undefined,
    locale,
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
