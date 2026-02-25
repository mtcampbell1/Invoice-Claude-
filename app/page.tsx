import Link from "next/link";
import {
  FileText,
  Clock,
  Shield,
  Download,
  Check,
  Receipt,
  FileSpreadsheet,
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

const packs = [
  {
    id: "tokens_10",
    label: "Starter",
    tokens: "10 tokens",
    price: "$2.99",
    badge: null,
    highlight: false,
    perToken: "30¢ / token",
  },
  {
    id: "tokens_25",
    label: "Value",
    tokens: "25 tokens",
    price: "$5.99",
    badge: "Best Value",
    highlight: true,
    perToken: "24¢ / token",
  },
  {
    id: "tokens_50",
    label: "Pro",
    tokens: "50 tokens",
    price: "$9.99",
    badge: null,
    highlight: false,
    perToken: "20¢ / token",
  },
];

const packFeatures = [
  "Tokens never expire",
  "All document types",
  "Business logo on documents",
  "Unlimited saved contacts",
  "No subscription required",
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
      "3 tokens per week (resets weekly)",
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">InvoiceClaude</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
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
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-gray-900 sm:mb-6 sm:text-5xl lg:text-6xl">
          Professional invoices
          <br />
          <span className="text-indigo-600">in seconds</span>
        </h1>
        <p className="mx-auto mb-5 max-w-xl text-lg text-gray-500 sm:max-w-2xl sm:text-xl">
          Create professional invoices, receipts, and statements. Download a
          polished PDF instantly — no account required.
        </p>
        <p className="mb-7 text-sm font-medium uppercase tracking-wide text-gray-400">
          Start free — no credit card required
        </p>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link href="/create/invoice" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 sm:min-w-[150px]">
              <FileText className="h-4 w-4" />
              Invoice
            </Button>
          </Link>
          <Link href="/create/receipt" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 sm:min-w-[150px]">
              <Receipt className="h-4 w-4" />
              Receipt
            </Button>
          </Link>
          <Link href="/create/statement" className="w-full sm:w-auto">
            <Button size="lg" className="w-full gap-2 sm:min-w-[150px]">
              <FileSpreadsheet className="h-4 w-4" />
              Statement
            </Button>
          </Link>
        </div>
        <p className="mt-5 text-sm text-gray-400">
          or{" "}
          <Link href="#pricing" className="underline hover:text-gray-600">
            view pricing
          </Link>
        </p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900 sm:mb-12 sm:text-3xl">
            Everything you need
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="mb-1 font-semibold text-gray-900">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="mb-10 text-2xl font-bold text-gray-900 sm:mb-12 sm:text-3xl">
            How it works
          </h2>
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
              <div key={s.step}>
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
      <section id="pricing" className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="mb-3 text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Simple, transparent pricing
          </h2>
          <p className="mb-12 text-center text-gray-500">
            Start free. Pay only when you need more.
          </p>

          {/* ── Token packs (first) ── */}
          <div className="mb-16">
            <div className="mb-6 text-center">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                <Package className="h-3.5 w-3.5" />
                No subscription needed
              </div>
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">Token packs</h3>
              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Buy once, use whenever. Tokens never expire and unlock all paid features.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className={`relative rounded-xl border-2 bg-white p-5 shadow-sm sm:p-6 ${
                    pack.highlight
                      ? "border-indigo-500 shadow-indigo-100 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  {pack.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
                      {pack.badge}
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-500">{pack.label}</p>
                      <div className="mt-1 flex items-end gap-1">
                        <span className="text-3xl font-extrabold text-gray-900">
                          {pack.price}
                        </span>
                        <span className="mb-1 text-sm text-gray-400">one-time</span>
                      </div>
                    </div>
                    <div className="mt-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-center">
                      <p className="flex items-center gap-1 text-sm font-bold text-indigo-700">
                        <Zap className="h-3.5 w-3.5" />
                        {pack.tokens}
                      </p>
                      <p className="text-xs text-indigo-400">{pack.perToken}</p>
                    </div>
                  </div>

                  <ul className="my-5 space-y-2">
                    {packFeatures.map((f) => (
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
                      Buy {pack.label} Pack
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="mb-12 flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-sm font-medium text-gray-400">or subscribe monthly</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* ── Monthly plans ── */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border-2 bg-white p-5 shadow-sm sm:p-6 ${plan.color} ${
                  plan.highlight ? "shadow-indigo-100 shadow-md" : ""
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
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
                <p className="mb-5 text-sm font-medium text-indigo-600">
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500 sm:px-6">
          <p>&copy; {new Date().getFullYear()} InvoiceClaude.</p>
        </div>
      </footer>
    </div>
  );
}
