"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DocumentData } from "@/lib/claude";
import { generateDocumentNumber, formatCurrency } from "@/lib/utils";
import { Plus, Trash2, FileText, UserPlus, FlaskConical, ImageIcon, RefreshCw } from "lucide-react";

const DocumentShareButton = dynamic(
  () => import("@/components/document-pdf").then((m) => m.DocumentShareButton),
  { ssr: false }
);

const DocumentPDFViewer = dynamic(
  () => import("@/components/document-pdf").then((m) => m.DocumentPDFViewer),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-sm text-gray-400">Rendering PDF…</div> }
);

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Contact {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

interface Business {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  email?: string | null;
  taxId?: string | null;
  logoUrl?: string | null;
}

interface DocumentFormProps {
  type: "invoice" | "receipt" | "statement";
}

export function DocumentForm({ type }: DocumentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations("doc");
  const te = useTranslations("errors");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tokenResetMsg, setTokenResetMsg] = useState("");
  const [generated, setGenerated] = useState<DocumentData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);

  const typeLabel =
    type === "invoice"
      ? (locale === "es" ? "Factura" : "Invoice")
      : type === "receipt"
      ? (locale === "es" ? "Recibo" : "Receipt")
      : (locale === "es" ? "Estado de cuenta" : "Statement");

  // From (sender) info
  const [fromName, setFromName] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [fromState, setFromState] = useState("");
  const [fromZip, setFromZip] = useState("");
  const [fromPhone, setFromPhone] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromTaxId, setFromTaxId] = useState("");

  // To (client) info
  const [toName, setToName] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [toCity, setToCity] = useState("");
  const [toState, setToState] = useState("");
  const [toZip, setToZip] = useState("");
  const [toEmail, setToEmail] = useState("");

  // Document info
  const [docNumber, setDocNumber] = useState(() => generateDocumentNumber(type));
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState("");

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, rate: 0 },
  ]);

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((b) => {
        if (b && b.name) {
          setBusiness(b);
          setFromName(b.name);
          setFromAddress(b.address || "");
          setFromCity(b.city || "");
          setFromState(b.state || "");
          setFromZip(b.zip || "");
          setFromPhone(b.phone || "");
          setFromEmail(b.email || "");
          setFromTaxId(b.taxId || "");
        }
      })
      .catch(() => {});

    fetch("/api/contacts")
      .then((r) => r.json())
      .then(setContacts)
      .catch(() => {});
  }, []);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxAmount = taxRate ? subtotal * (parseFloat(taxRate) / 100) : 0;
  const total = subtotal + taxAmount;

  const fillFromContact = (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (contact) {
      setToName(contact.name);
      setToCompany(contact.company || "");
      setToEmail(contact.email || "");
      setToAddress(contact.address || "");
    }
  };

  const fillTestData = () => {
    setFromName("Acme Consulting LLC");
    setFromAddress("123 Main Street");
    setFromCity("Austin");
    setFromState("TX");
    setFromZip("78701");
    setFromPhone("+1 (512) 555-0100");
    setFromEmail("billing@acmeconsulting.com");
    setFromTaxId("12-3456789");
    setToName("Jane Smith");
    setToCompany("Globex Corp");
    setToAddress("456 Client Ave");
    setToCity("San Francisco");
    setToState("CA");
    setToZip("94105");
    setToEmail("jane.smith@globex.com");
    setDocDate(new Date().toISOString().split("T")[0]);
    if (type === "invoice") {
      const due = new Date();
      due.setDate(due.getDate() + 30);
      setDueDate(due.toISOString().split("T")[0]);
    }
    setItems([
      { description: "Web Design & Development", quantity: 1, rate: 2500 },
      { description: "SEO Optimization", quantity: 3, rate: 250 },
      { description: "Monthly Maintenance", quantity: 2, rate: 150 },
    ]);
    setTaxRate("8.25");
    setNotes("Payment due within 30 days. Please reference invoice number when paying. Thank you for your business!");
  };

  const resetTokens = async () => {
    const res = await fetch("/api/tokens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens: 10 }),
    });
    if (res.ok) {
      setTokenResetMsg("Tokens reset to 10!");
      router.refresh();
      setTimeout(() => setTokenResetMsg(""), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = {
      number: docNumber,
      date: docDate,
      dueDate: dueDate || undefined,
      from: {
        name: fromName,
        address: fromAddress || undefined,
        city: fromCity || undefined,
        state: fromState || undefined,
        zip: fromZip || undefined,
        phone: fromPhone || undefined,
        email: fromEmail || undefined,
        taxId: fromTaxId || undefined,
      },
      to: {
        name: toName,
        company: toCompany || undefined,
        address: toAddress || undefined,
        city: toCity || undefined,
        state: toState || undefined,
        zip: toZip || undefined,
        email: toEmail || undefined,
      },
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.quantity * item.rate,
      })),
      subtotal,
      taxRate: taxRate ? parseFloat(taxRate) : undefined,
      taxAmount: taxAmount || undefined,
      total,
      notes: notes || undefined,
    };

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data, locale }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || te("generateFailed"));
      return;
    }

    setGenerated(result.document);
  };

  if (generated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("generated", { type: typeLabel })}
            </h1>
            <p className="text-sm text-gray-500">
              {generated.number} · {generated.to.name}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setGenerated(null);
                setDocNumber(generateDocumentNumber(type));
              }}
            >
              {t("createAnother")}
            </Button>
            <DocumentShareButton data={generated} />
          </div>
        </div>

        {/* Guest upsell — single combined banner */}
        {!session && (
          <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4">
            <div>
              <p className="font-semibold text-indigo-900">{t("guestUpsellTitle")}</p>
              <p className="text-sm text-indigo-700">{t("guestUpsellDesc")}</p>
            </div>
            <a href="/sign-up">
              <Button size="sm" className="ml-4 shrink-0">
                <UserPlus className="mr-2 h-4 w-4" />
                {t("createFreeAccount")}
              </Button>
            </a>
          </div>
        )}

        {/* Logo upsell — only for signed-in users without a logo */}
        {session && !generated.logoUrl && (
          <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <div>
              <p className="font-semibold text-amber-900">{t("addLogoTitle")}</p>
              <p className="text-sm text-amber-700">{t("addLogoDesc")}</p>
            </div>
            <a href="/upgrade">
              <Button size="sm" variant="outline" className="ml-4 shrink-0 border-amber-300 text-amber-800 hover:bg-amber-100">
                <ImageIcon className="mr-2 h-4 w-4" />
                {t("upgradeToPro")}
              </Button>
            </a>
          </div>
        )}

        {/* PDF Preview */}
        <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm" style={{ height: "80vh" }}>
          <DocumentPDFViewer data={generated} />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("newType", { type: typeLabel })}
          </h1>
          <p className="text-sm text-gray-500">{t("downloadAsPdf")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={fillTestData}>
            <FlaskConical className="mr-2 h-3.5 w-3.5" />
            {t("fillTestData")}
          </Button>
          <div className="relative">
            <Button type="button" variant="outline" size="sm" onClick={resetTokens} title="Reset tokens to 10 (dev)">
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Reset Tokens
            </Button>
            {tokenResetMsg && (
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white">
                {tokenResetMsg}
              </span>
            )}
          </div>
          <Button type="submit" loading={loading} size="lg">
            <FileText className="mr-2 h-4 w-4" />
            {t("generateType", { type: typeLabel })}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          {error.includes("tokens") && (
            <a href="/upgrade" className="ml-2 font-semibold underline">
              {t("upgradeToPro")}
            </a>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* From section */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">{t("yourBusiness")}</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input label={t("businessName")} value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="Your Company Inc." required />
            <Input label={t("address")} value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} placeholder="123 Main St" />
            <div className="grid grid-cols-3 gap-2">
              <Input label={t("city")} value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="City" />
              <Input label={t("state")} value={fromState} onChange={(e) => setFromState(e.target.value)} placeholder="ST" />
              <Input label={t("zip")} value={fromZip} onChange={(e) => setFromZip(e.target.value)} placeholder="12345" />
            </div>
            <Input label={t("email")} type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="billing@yourcompany.com" />
            <Input label={t("phone")} value={fromPhone} onChange={(e) => setFromPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
            <Input label={t("taxId")} value={fromTaxId} onChange={(e) => setFromTaxId(e.target.value)} placeholder="XX-XXXXXXX" />
            {/* Logo upsell */}
            {!business?.logoUrl && (
              <div className="mt-1 flex items-center justify-between rounded-lg border border-dashed border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs text-indigo-700">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                  {t("addLogoHint")}
                </span>
                {!session ? (
                  <a href="/sign-up" className="ml-2 shrink-0 font-semibold underline">{t("addLogoSignUp")}</a>
                ) : !business ? (
                  <a href="/upgrade" className="ml-2 shrink-0 font-semibold underline">{t("addLogoUpgrade")}</a>
                ) : (
                  <a href="/settings" className="ml-2 shrink-0 font-semibold underline">{t("addLogoInSettings")}</a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* To section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">{t("clientBillTo")}</h2>
              {contacts.length > 0 && (
                <select
                  className="text-sm text-indigo-600 bg-transparent border-none cursor-pointer"
                  onChange={(e) => e.target.value && fillFromContact(e.target.value)}
                  defaultValue=""
                >
                  <option value="">{t("loadContact")}</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input label={t("clientName")} value={toName} onChange={(e) => setToName(e.target.value)} placeholder="John Smith" required />
            <Input label={t("company")} value={toCompany} onChange={(e) => setToCompany(e.target.value)} placeholder="Client Company LLC" />
            <Input label={t("email")} type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="client@company.com" />
            <Input label={t("address")} value={toAddress} onChange={(e) => setToAddress(e.target.value)} placeholder="456 Client Ave" />
            <div className="grid grid-cols-3 gap-2">
              <Input label={t("city")} value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="City" />
              <Input label={t("state")} value={toState} onChange={(e) => setToState(e.target.value)} placeholder="ST" />
              <Input label={t("zip")} value={toZip} onChange={(e) => setToZip(e.target.value)} placeholder="12345" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document details */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            {t("typeDetails", { type: typeLabel })}
          </h2>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Input label={t("typeNumber", { type: typeLabel })} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} />
            <Input label={t("date")} type="date" value={docDate} onChange={(e) => setDocDate(e.target.value)} required />
            {type === "invoice" && (
              <Input label={t("dueDate")} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            )}
          </div>

          {/* Line items */}
          <div className="mb-4">
            <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <span className="col-span-6">{t("description")}</span>
              <span className="col-span-2 text-center">{t("qty")}</span>
              <span className="col-span-2 text-right">{t("rateLabel")}</span>
              <span className="col-span-2 text-right">{t("amount")}</span>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder={t("descriptionPlaceholder")}
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-center focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-right focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium text-gray-700">
                    {formatCurrency(item.quantity * item.rate, "USD", locale)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-2 flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-4 w-4" />
              {t("addLineItem")}
            </button>
          </div>

          {/* Totals + tax */}
          <div className="flex items-end justify-between border-t border-gray-100 pt-4">
            <div className="w-32">
              <Input
                label={t("taxRate")}
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1 text-right text-sm">
              <div className="flex gap-8 text-gray-500">
                <span>{t("subtotal")}</span>
                <span>{formatCurrency(subtotal, "USD", locale)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex gap-8 text-gray-500">
                  <span>{t("tax")} ({taxRate}%)</span>
                  <span>{formatCurrency(taxAmount, "USD", locale)}</span>
                </div>
              )}
              <div className="flex gap-8 border-t border-gray-200 pt-1 font-bold text-gray-900">
                <span>{t("total")}</span>
                <span className="text-indigo-600">{formatCurrency(total, "USD", locale)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">{t("notesOptional")}</h2>
        </CardHeader>
        <CardContent>
          <textarea
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            placeholder={t("notesPlaceholder")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={loading} size="lg">
          <FileText className="mr-2 h-4 w-4" />
          {t("generateType", { type: typeLabel })}
        </Button>
      </div>
    </form>
  );
}
