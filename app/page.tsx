import Link from "next/link";
import {
  FileText,
  Clock,
  Shield,
  Download,
  Check,
  Receipt,
  FileSpreadsheet,
  Image,
  Package,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Clock,
    title: "Fast & Simple",
    desc: "Fill in your details and get a print-ready PDF in seconds. No learning curve.",
  },
  {
    icon: FileText,
    title: "All Document Types",
    desc: "Create invoices, receipts, and statements with a single click.",
  },
  {
    icon: Download,
    title: "Instant PDF",
    desc: "Download print-ready, beautifully formatted PDFs instantly.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your data is encrypted and never shared with third parties.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "border-gray-200",
    badge: null,
    tokens: "3 tokens / week",
    features: [
      "3 tokens per week",
      "Invoices, receipts & statements",
      "Instant PDF download",
      "1 saved business profile",
      "Up to 3 saved contacts",
    ],
    cta: "Get Started Free",
    href: "/create/invoice",
    highlight: false,
  },
  {
    name: "Basic",
    price: "$2.99",
    period: "/ month",
    color: "border-gray-200",
    badge: null,
    tokens: "15 tokens / month",
    features: [
      "15 tokens per month",
      "Invoices, receipts & statements",
      "Instant PDF download",
      "Business logo on documents",
      "Unlimited saved contacts",
    ],
    cta: "Start Basic",
    href: "/sign-up?plan=basic",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$5.99",
    period: "/ month",
    color: "border-indigo-500",
    badge: "Most Popular",
    tokens: "30 tokens / month",
    features: [
      "30 tokens per month",
      "Invoices, receipts & statements",
      "Instant PDF download",
      "Business logo on documents",
      "Unlimited saved contacts",
      "Priority support",
    ],
    cta: "Start Pro",
    href: "/sign-up?plan=pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "$19.99",
    period: "/ month",
    color: "border-gray-200",
    badge: null,
    tokens: "100 tokens / month",
    features: [
      "100 tokens per month",
      "Invoices, receipts & statements",
      "Instant PDF download",
      "Business logo on documents",
      "Unlimited saved contacts",
      "Priority support",
    ],
    cta: "Start Business",
    href: "/sign-up?plan=business",
    highlight: false,
  },
];

const packs = [
  {
    id: "tokens_10",
    label: "Starter Pack",
    tokens: "10 tokens",
    price: "$2.99",
    badge: null,
    highlight: false,
  },
  {
    id: "tokens_25",
    label: "Value Pack",
    tokens: "25 tokens",
    price: "$5.99",
    badge: "Best Value",
    highlight: true,
  },
  {
    id: "tokens_50",
    label: "Pro Pack",
    tokens: "50 tokens",
    price: "$9.99",
    badge: null,
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">InvoiceClaude</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Professional invoices
          <br />
          <span className="text-indigo-600">in seconds</span>
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-xl text-gray-500">
          Create professional invoices, receipts, and statements. Download a
          polished PDF instantly — no account required.
        </p>
        <p className="mb-8 text-sm font-medium uppercase tracking-wide text-gray-400">
          Start free — no credit card required
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/create/invoice">
            <Button size="lg" className="min-w-[160px] gap-2">
              <FileText className="h-4 w-4" />
              Invoice
            </Button>
          </Link>
          <Link href="/create/receipt">
            <Button size="lg" className="min-w-[160px] gap-2">
              <Receipt className="h-4 w-4" />
              Receipt
            </Button>
          </Link>
          <Link href="/create/statement">
            <Button size="lg" className="min-w-[160px] gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Statement
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-gray-400">
          or{" "}
          <Link href="#pricing" className="underline hover:text-gray-600">
            view pricing
          </Link>
        </p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Everything you need
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">How it works</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Fill in the details",
                desc: "Enter your business info, client details, line items, and any notes.",
              },
              {
                step: "2",
                title: "Generate your document",
                desc: "Your document is formatted and totals are calculated automatically.",
              },
              {
                step: "3",
                title: "Download PDF",
                desc: "Get a print-ready, professional PDF in one click.",
              },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mb-12 text-center text-gray-500">
            Start free. Pay only when you need more.
          </p>

          {/* Monthly plans */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border-2 bg-white p-6 shadow-sm ${plan.color} ${
                  plan.highlight ? "shadow-indigo-100 shadow-md" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    {plan.badge}
                  </div>
                )}
                <p className="mb-1 font-semibold text-gray-500">{plan.name}</p>
                <div className="mb-1 flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="mb-1 text-sm text-gray-500">{plan.period}</span>
                </div>
                <p className="mb-6 text-sm font-medium text-indigo-600">
                  {plan.tokens}
                </p>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className="block">
                  <Button
                    variant={plan.highlight ? "default" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          {/* Token packs */}
          <div className="mt-16">
            <div className="mb-8 text-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                <Package className="h-3.5 w-3.5" />
                No subscription needed
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Token packs</h3>
              <p className="mt-2 text-gray-500">
                Buy tokens once and use them whenever. Tokens never expire and include all paid features — including your business logo.
              </p>
            </div>
            <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative rounded-xl border-2 bg-white p-6 shadow-sm ${
                    pack.highlight
                      ? "border-indigo-500 shadow-indigo-100 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      {pack.badge}
                    </div>
                  )}
                  <p className="mb-1 font-semibold text-gray-500">{pack.label}</p>
                  <div className="mb-1 flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {pack.price}
                    </span>
                    <span className="mb-1 text-sm text-gray-400">one-time</span>
                  </div>
                  <div className="mb-5 flex items-center gap-1.5 text-sm font-medium text-indigo-600">
                    <Zap className="h-3.5 w-3.5" />
                    {pack.tokens}
                  </div>
                  <ul className="mb-6 space-y-2">
                    {[
                      "Tokens never expire",
                      "All document types",
                      "Business logo included",
                      "No subscription",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                        <span className="text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up" className="block">
                    <Button
                      variant={pack.highlight ? "default" : "outline"}
                      className="w-full"
                    >
                      Buy {pack.label}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} InvoiceClaude.</p>
        </div>
      </footer>
    </div>
  );
}
