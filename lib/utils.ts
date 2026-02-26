import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const localeMap: Record<string, string> = {
  en: "en-US",
  es: "es-MX",
};

function resolveLocale(locale?: string): string {
  return localeMap[locale ?? "en"] ?? "en-US";
}

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale?: string
): string {
  return new Intl.NumberFormat(resolveLocale(locale), {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string, locale?: string): string {
  return new Intl.DateTimeFormat(resolveLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatNumber(amount: number, locale?: string): string {
  return new Intl.NumberFormat(resolveLocale(locale)).format(amount);
}

export function generateDocumentNumber(
  type: "invoice" | "receipt" | "statement"
): string {
  const prefix =
    type === "invoice" ? "INV" : type === "receipt" ? "REC" : "STM";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `${prefix}-${year}-${random}`;
}
