"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";
import type { DocumentData } from "@/lib/claude";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colRate: { flex: 1.5, textAlign: "right" },
  colAmount: { flex: 1.5, textAlign: "right" },
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

function InvoicePDF({ data }: { data: DocumentData }) {
  const title =
    data.type === "invoice"
      ? "Invoice"
      : data.type === "receipt"
      ? "Receipt"
      : "Statement";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.addressName}>{data.from.name}</Text>
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docNumber}>{data.number}</Text>
            <Text style={styles.label}>Date: {data.date}</Text>
            {data.dueDate && (
              <Text style={styles.label}>Due: {data.dueDate}</Text>
            )}
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addresses}>
          <View style={styles.addressBlock}>
            <Text style={styles.sectionLabel}>From</Text>
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
              <Text style={styles.addressLine}>Tax ID: {data.from.taxId}</Text>
            )}
          </View>
          <View style={[styles.addressBlock, { textAlign: "right" }]}>
            <Text style={styles.sectionLabel}>Bill To</Text>
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
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.headerText]}>Description</Text>
            <Text style={[styles.colQty, styles.headerText]}>Qty</Text>
            <Text style={[styles.colRate, styles.headerText]}>Rate</Text>
            <Text style={[styles.colAmount, styles.headerText]}>Amount</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={[styles.colQty, { textAlign: "center" }]}>
                {item.quantity}
              </Text>
              <Text style={[styles.colRate, { textAlign: "right" }]}>
                ${item.rate.toFixed(2)}
              </Text>
              <Text style={[styles.colAmount, { textAlign: "right" }]}>
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${data.subtotal.toFixed(2)}</Text>
          </View>
          {data.discountAmount && data.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>
                -${data.discountAmount.toFixed(2)}
              </Text>
            </View>
          )}
          {data.taxAmount && data.taxAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                Tax {data.taxRate ? `(${data.taxRate}%)` : ""}
              </Text>
              <Text style={styles.totalValue}>${data.taxAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.totalRowFinal}>
            <Text style={styles.totalFinalLabel}>Total</Text>
            <Text style={styles.totalFinalValue}>${data.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {data.paymentTerms && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.footerLabel}>Payment Terms</Text>
              <Text style={styles.footerText}>{data.paymentTerms}</Text>
            </View>
          )}
          {data.notes && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.footerLabel}>Notes</Text>
              <Text style={styles.footerText}>{data.notes}</Text>
            </View>
          )}
          {data.memo && (
            <View>
              <Text style={styles.footerLabel}>Memo</Text>
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

  return (
    <PDFDownloadLink document={<InvoicePDF data={data} />} fileName={filename}>
      {({ loading }) => (
        <Button loading={loading} size="lg">
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Preparing PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
