"use client";
import { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { DocumentData } from "@/lib/claude";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, Share2, ChevronDown, MessageSquare } from "lucide-react";

// PDF labels by locale — can't use React hooks in PDF components,
// so we resolve from the data.locale field set during generation
const pdfLabels: Record<string, Record<string, string>> = {
  en: {
    invoice: "Invoice",
    receipt: "Receipt",
    statement: "Statement",
    from: "From",
    billTo: "Bill To",
    description: "Description",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "Tax",
    total: "Total",
    paymentTerms: "Payment Terms",
    notes: "Notes",
    memo: "Memo",
    date: "Date",
    due: "Due",
    taxId: "Tax ID",
    downloadPdf: "Download PDF",
    preparingPdf: "Preparing PDF...",
    share: "Share",
    sms: "SMS",
    whatsapp: "WhatsApp",
  },
  es: {
    invoice: "Factura",
    receipt: "Recibo",
    statement: "Estado de cuenta",
    from: "De",
    billTo: "Facturar a",
    description: "Descripción",
    qty: "Cant.",
    rate: "Precio",
    amount: "Monto",
    subtotal: "Subtotal",
    discount: "Descuento",
    tax: "Impuesto",
    total: "Total",
    paymentTerms: "Términos de pago",
    notes: "Notas",
    memo: "Memo",
    date: "Fecha",
    due: "Vencimiento",
    taxId: "RFC / ID Fiscal",
    downloadPdf: "Descargar PDF",
    preparingPdf: "Preparando PDF...",
    share: "Compartir",
    sms: "SMS",
    whatsapp: "WhatsApp",
  },
};

function getLabels(locale?: string) {
  return pdfLabels[locale ?? "en"] ?? pdfLabels.en;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
    backgroundColor: "#ffffff",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  logo: {
    width: 100,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#4f46e5",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  docInfo: {
    textAlign: "right",
  },
  docNumber: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  label: {
    color: "#6b7280",
    marginBottom: 2,
  },
  addresses: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1 solid #e5e7eb",
  },
  addressBlock: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  addressName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  addressLine: {
    color: "#4b5563",
    marginBottom: 1,
    lineHeight: 1.2,
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    padding: "6 10",
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: "7 10",
    borderBottom: "1 solid #f3f4f6",
  },
  colDesc: { width: "48%" },
  colQty: { width: "12%", textAlign: "center" },
  colRate: { width: "20%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },
  headerText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totals: {
    marginLeft: "auto",
    width: 220,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTop: "2 solid #4f46e5",
    marginTop: 4,
  },
  totalLabel: { color: "#6b7280" },
  totalValue: { fontFamily: "Helvetica-Bold" },
  totalFinalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  totalFinalValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#4f46e5" },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1 solid #e5e7eb",
  },
  footerLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  footerText: {
    color: "#4b5563",
    lineHeight: 1.5,
  },
});

export function InvoicePDF({ data }: { data: DocumentData }) {
  const l = getLabels(data.locale);
  const locale = data.locale;

  const title =
    data.type === "invoice"
      ? l.invoice
      : data.type === "receipt"
      ? l.receipt
      : l.statement;

  const fmtCurrency = (amount: number) => formatCurrency(amount, "USD", locale);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {data.logoUrl && (
              <Image src={data.logoUrl} style={styles.logo} />
            )}
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docNumber}>{data.number}</Text>
            <Text style={styles.label}>{l.date}: {data.date}</Text>
            {data.dueDate && (
              <Text style={styles.label}>{l.due}: {data.dueDate}</Text>
            )}
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addresses}>
          <View style={styles.addressBlock}>
            <Text style={styles.sectionLabel}>{l.from}</Text>
            <Text style={styles.addressName}>{data.from.name}</Text>
            {data.from.address && (
              <Text style={styles.addressLine}>{data.from.address}</Text>
            )}
            {(data.from.city || data.from.state) && (
              <Text style={styles.addressLine}>
                {[data.from.city, data.from.state, data.from.zip]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
            {data.from.phone && (
              <Text style={styles.addressLine}>{data.from.phone}</Text>
            )}
            {data.from.email && (
              <Text style={styles.addressLine}>{data.from.email}</Text>
            )}
            {data.from.taxId && (
              <Text style={styles.addressLine}>{l.taxId}: {data.from.taxId}</Text>
            )}
          </View>
          <View style={[styles.addressBlock, { textAlign: "right" }]}>
            <Text style={styles.sectionLabel}>{l.billTo}</Text>
            <Text style={styles.addressName}>{data.to.name}</Text>
            {data.to.company && (
              <Text style={styles.addressLine}>{data.to.company}</Text>
            )}
            {data.to.address && (
              <Text style={styles.addressLine}>{data.to.address}</Text>
            )}
            {(data.to.city || data.to.state) && (
              <Text style={styles.addressLine}>
                {[data.to.city, data.to.state, data.to.zip]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
            )}
            {data.to.email && (
              <Text style={styles.addressLine}>{data.to.email}</Text>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader} wrap={false}>
            <Text style={[styles.colDesc, styles.headerText]}>{l.description}</Text>
            <Text style={[styles.colQty, styles.headerText]}>{l.qty}</Text>
            <Text style={[styles.colRate, styles.headerText]}>{l.rate}</Text>
            <Text style={[styles.colAmount, styles.headerText]}>{l.amount}</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={[styles.colQty, { textAlign: "center" }]}>
                {item.quantity}
              </Text>
              <Text style={[styles.colRate, { textAlign: "right" }]}>
                {fmtCurrency(item.rate)}
              </Text>
              <Text style={[styles.colAmount, { textAlign: "right" }]}>
                {fmtCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{l.subtotal}</Text>
            <Text style={styles.totalValue}>{fmtCurrency(data.subtotal)}</Text>
          </View>
          {data.discountAmount && data.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{l.discount}</Text>
              <Text style={styles.totalValue}>
                -{fmtCurrency(data.discountAmount)}
              </Text>
            </View>
          )}
          {data.taxAmount && data.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                {l.tax} {data.taxRate ? `(${data.taxRate}%)` : ""}
              </Text>
              <Text style={styles.totalValue}>{fmtCurrency(data.taxAmount)}</Text>
            </View>
          )}
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalFinalLabel}>{l.total}</Text>
            <Text style={styles.totalFinalValue}>{fmtCurrency(data.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {data.paymentTerms && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.footerLabel}>{l.paymentTerms}</Text>
              <Text style={styles.footerText}>{data.paymentTerms}</Text>
            </View>
          )}
          {data.notes && (
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.footerLabel}>{l.notes}</Text>
              <Text style={styles.footerText}>{data.notes}</Text>
            </View>
          )}
          {data.memo && (
            <View>
              <Text style={styles.footerLabel}>{l.memo}</Text>
              <Text style={styles.footerText}>{data.memo}</Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export function DocumentDownloadButton({ data }: { data: DocumentData }) {
  const filename = `${data.number || data.type}-${data.to.name.replace(/\s+/g, "-")}.pdf`;
  const l = getLabels(data.locale);

  return (
    <PDFDownloadLink document={<InvoicePDF data={data} />} fileName={filename}>
      {({ loading }) => (
        <Button loading={loading} size="lg">
          <Download className="mr-2 h-4 w-4" />
          {loading ? l.preparingPdf : l.downloadPdf}
        </Button>
      )}
    </PDFDownloadLink>
  );
}

export function DocumentShareButton({ data }: { data: DocumentData }) {
  const [open, setOpen] = useState(false);
  const l = getLabels(data.locale);
  const filename = `${data.number || data.type}-${data.to.name.replace(/\s+/g, "-")}.pdf`;

  const docTitle = l[data.type as keyof typeof l] || data.type;
  const shareText = [
    `${docTitle}: ${data.number}`,
    `From: ${data.from.name}`,
    `To: ${data.to.name}${data.to.company ? ` / ${data.to.company}` : ""}`,
    `Total: ${formatCurrency(data.total, "USD", data.locale)}`,
    `Date: ${data.date}`,
  ].join("\n");

  const encodedText = encodeURIComponent(shareText);
  const smsUrl = `sms:?body=${encodedText}`;
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;

  return (
    <div className="relative">
      <Button size="lg" onClick={() => setOpen((v) => !v)}>
        <Share2 className="mr-2 h-4 w-4" />
        {l.share}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {/* PDF Download */}
            <PDFDownloadLink document={<InvoicePDF data={data} />} fileName={filename}>
              {({ loading }) => (
                <button
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  <Download className="h-4 w-4 text-indigo-500" />
                  {loading ? l.preparingPdf : l.downloadPdf}
                </button>
              )}
            </PDFDownloadLink>

            {/* SMS */}
            <a
              href={smsUrl}
              className="flex items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <MessageSquare className="h-4 w-4 text-blue-500" />
              {l.sms}
            </a>

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 border-t border-gray-100 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {/* WhatsApp icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {l.whatsapp}
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export function DocumentPDFViewer({ data }: { data: DocumentData }) {
  return (
    <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
      <InvoicePDF data={data} />
    </PDFViewer>
  );
}
