"use client";
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
import { Download } from "lucide-react";

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
    marginBottom: 32,
  },
  logo: {
    width: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
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
    marginBottom: 32,
    paddingBottom: 24,
    borderBottom: "1 solid #e5e7eb",
  },
  addressBlock: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  addressName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  addressLine: {
    color: "#4b5563",
    marginBottom: 2,
    lineHeight: 1.4,
  },
  table: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    padding: "8 12",
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    padding: "8 12",
    borderBottom: "1 solid #f3f4f6",
  },
  colDesc: { width: "48%" },
  colQty: { width: "12%", textAlign: "center" },
  colRate: { width: "20%", textAlign: "right" },
  colAmount: { width: "20%", textAlign: "right" },
  headerText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totals: {
    marginLeft: "auto",
    width: 240,
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTop: "2 solid #4f46e5",
    marginTop: 4,
  },
  totalLabel: { color: "#6b7280" },
  totalValue: { fontFamily: "Helvetica-Bold" },
  totalFinalLabel: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  totalFinalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#4f46e5" },
  footer: {
    marginTop: 32,
    paddingTop: 24,
    borderTop: "1 solid #e5e7eb",
  },
  footerLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
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
            <Text style={styles.addressName}>{data.from.name}</Text>
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
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.footerLabel}>{l.paymentTerms}</Text>
              <Text style={styles.footerText}>{data.paymentTerms}</Text>
            </View>
          )}
          {data.notes && (
            <View style={{ marginBottom: 12 }}>
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

export function DocumentPDFViewer({ data }: { data: DocumentData }) {
  return (
    <PDFViewer width="100%" height="100%" style={{ border: "none" }}>
      <InvoicePDF data={data} />
    </PDFViewer>
  );
}
