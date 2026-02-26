import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InvoiceClaude – AI-Powered Invoicing",
  description:
    "Create professional invoices, receipts, and statements in seconds with AI. Free tier available.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
