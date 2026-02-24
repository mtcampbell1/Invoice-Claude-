import Link from "next/link";
import { FileText, Zap, Shield, Download, Check, Receipt, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "AI-Powered",
    desc: "Claude AI generates professional, polished documents from your input in seconds.",
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
      "3 free tokens per week",
      "Invoices, receipts & statements",
      "Instant PDF download",
      "AI-enhanced formatting",
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
      "AI-enhanced formatting",
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
      "AI-enhanced formatting",
      "Save client contacts",
      "Save business info",
      "Upload business logo",
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
      "AI-enhanced formatting",
      "Save client contacts",
      "Save business info",
      "Upload business logo",
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
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              InvoiceClaude
            </span>
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
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
          <Zap className="h-3.5 w-3.5" />
          Powered by Claude AI
        </div>
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Professional invoices
          <br />
          <span className="text-indigo-600">in seconds</span>
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-xl text-gray-500">
          Create beautiful, AI-enhanced invoices, receipts, and statements.
        </p>
        <p className="mb-8 text-sm font-medium text-gray-400 uppercase tracking-wide">
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
                  className="rounded-xl bg-white p-6 shadow-sm border border-gray-100"
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
          <h2 className="mb-12 text-3xl font-bold text-gray-900">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Fill in the details",
                desc: "Enter your client info, line items, and any notes.",
              },
              {
                step: "2",
                title: "Claude polishes it",
                desc: "AI enhances formatting, calculates totals, and adds professional language.",
              },
              {
                step: "3",
                title: "Download PDF",
                desc: "Get a print-ready, branded PDF in one click.",
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
            Start free. Upgrade when you need more tokens or features.
          </p>
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
                  <span className="mb-1 text-sm text-gray-500">
                    {plan.period}
                  </span>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} InvoiceClaude. Built with Claude
            AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
