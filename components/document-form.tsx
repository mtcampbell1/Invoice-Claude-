"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DocumentData } from "@/lib/claude";
import { generateDocumentNumber, formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Zap, UserPlus } from "lucide-react";

const DocumentDownloadButton = dynamic(
  () => import("@/components/document-pdf").then((m) => m.DocumentDownloadButton),
  { ssr: false }
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
}

interface DocumentFormProps {
  type: "invoice" | "receipt" | "statement";
}

export function DocumentForm({ type }: DocumentFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState<DocumentData | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);

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
    // Load saved business info and contacts for paid users
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
      body: JSON.stringify({ type, data }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "Failed to generate document");
      return;
    }

    setGenerated(result.document);
  };

  if (generated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {type} Generated!
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
              Create another
            </Button>
            <DocumentDownloadButton data={generated} />
          </div>
        </div>

        {/* Guest upsell */}
        {!session && (
          <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4">
            <div>
              <p className="font-semibold text-indigo-900">Skip re-typing next time</p>
              <p className="text-sm text-indigo-700">
                Save your business info, client contacts, and past invoices — free with an account.
              </p>
            </div>
            <a href="/sign-up">
              <Button size="sm" className="ml-4 shrink-0">
                <UserPlus className="mr-2 h-4 w-4" />
                Create free account
              </Button>
            </a>
          </div>
        )}

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold capitalize">{type} Preview</h2>
              <span className="text-2xl font-bold text-indigo-600">
                {formatCurrency(generated.total)}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">From</p>
                <p className="font-semibold">{generated.from.name}</p>
                {generated.from.address && <p className="text-gray-500">{generated.from.address}</p>}
                {generated.from.email && <p className="text-gray-500">{generated.from.email}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Bill To</p>
                <p className="font-semibold">{generated.to.name}</p>
                {generated.to.company && <p className="text-gray-500">{generated.to.company}</p>}
                {generated.to.email && <p className="text-gray-500">{generated.to.email}</p>}
              </div>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Description</th>
                  <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">Qty</th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Rate</th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {generated.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-center text-gray-500">{item.quantity}</td>
                    <td className="py-2 text-right text-gray-500">{formatCurrency(item.rate)}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="ml-auto w-48 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(generated.subtotal)}</span>
              </div>
              {generated.taxAmount && generated.taxAmount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax {generated.taxRate ? `(${generated.taxRate}%)` : ""}</span>
                  <span>{formatCurrency(generated.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
                <span>Total</span>
                <span className="text-indigo-600">{formatCurrency(generated.total)}</span>
              </div>
            </div>
            {generated.notes && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {generated.notes}
              </div>
            )}
            {generated.paymentTerms && (
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                <span className="font-medium">Payment Terms:</span> {generated.paymentTerms}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            New {type}
          </h1>
          <p className="text-sm text-gray-500">Free · Download as PDF</p>
        </div>
        <Button type="submit" loading={loading} size="lg">
          <Zap className="mr-2 h-4 w-4" />
          Generate with AI
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          {error.includes("tokens") && (
            <a href="/upgrade" className="ml-2 font-semibold underline">
              Upgrade now
            </a>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* From section */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Your Business</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              label="Business Name *"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Your Company Inc."
              required
            />
            <Input
              label="Address"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="123 Main St"
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="City"
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                placeholder="City"
              />
              <Input
                label="State"
                value={fromState}
                onChange={(e) => setFromState(e.target.value)}
                placeholder="ST"
              />
              <Input
                label="ZIP"
                value={fromZip}
                onChange={(e) => setFromZip(e.target.value)}
                placeholder="12345"
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="billing@yourcompany.com"
            />
            <Input
              label="Phone"
              value={fromPhone}
              onChange={(e) => setFromPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
            <Input
              label="Tax ID / EIN"
              value={fromTaxId}
              onChange={(e) => setFromTaxId(e.target.value)}
              placeholder="XX-XXXXXXX"
            />
          </CardContent>
        </Card>

        {/* To section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Client / Bill To</h2>
              {contacts.length > 0 && (
                <select
                  className="text-sm text-indigo-600 bg-transparent border-none cursor-pointer"
                  onChange={(e) => e.target.value && fillFromContact(e.target.value)}
                  defaultValue=""
                >
                  <option value="">Load contact…</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              label="Client Name *"
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="John Smith"
              required
            />
            <Input
              label="Company"
              value={toCompany}
              onChange={(e) => setToCompany(e.target.value)}
              placeholder="Client Company LLC"
            />
            <Input
              label="Email"
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="client@company.com"
            />
            <Input
              label="Address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="456 Client Ave"
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="City"
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                placeholder="City"
              />
              <Input
                label="State"
                value={toState}
                onChange={(e) => setToState(e.target.value)}
                placeholder="ST"
              />
              <Input
                label="ZIP"
                value={toZip}
                onChange={(e) => setToZip(e.target.value)}
                placeholder="12345"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document details */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 capitalize">
            {type} Details
          </h2>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Input
              label={`${type.charAt(0).toUpperCase() + type.slice(1)} Number`}
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
            />
            <Input
              label="Date"
              type="date"
              value={docDate}
              onChange={(e) => setDocDate(e.target.value)}
              required
            />
            {type === "invoice" && (
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            )}
          </div>

          {/* Line items */}
          <div className="mb-4">
            <div className="mb-2 grid grid-cols-12 gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <span className="col-span-6">Description</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-2 text-right">Rate ($)</span>
              <span className="col-span-2 text-right">Amount</span>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Description of service or product"
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
                    {formatCurrency(item.quantity * item.rate)}
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
              Add line item
            </button>
          </div>

          {/* Totals + tax */}
          <div className="flex items-end justify-between border-t border-gray-100 pt-4">
            <div className="w-32">
              <Input
                label="Tax Rate (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1 text-right text-sm">
              <div className="flex gap-8 text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {taxAmount > 0 && (
                <div className="flex gap-8 text-gray-500">
                  <span>Tax ({taxRate}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex gap-8 border-t border-gray-200 pt-1 font-bold text-gray-900">
                <span>Total</span>
                <span className="text-indigo-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Notes (optional)</h2>
        </CardHeader>
        <CardContent>
          <textarea
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            placeholder="Payment instructions, thank you message, or any other notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={loading} size="lg">
          <Zap className="mr-2 h-4 w-4" />
          Generate {type}
        </Button>
      </div>
    </form>
  );
}
