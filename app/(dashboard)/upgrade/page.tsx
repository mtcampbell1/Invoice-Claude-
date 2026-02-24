"use client";
import { useState } from "react";
import { Check, Zap, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "$2.99",
    period: "/month",
    tokens: "15 tokens / month",
    highlight: false,
    badge: null,
    features: [
      "15 tokens per month",
      "Invoices, receipts & statements",
      "Instant PDF download",
      "Business logo on documents",
      "Unlimited saved contacts",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$5.99",
    period: "/month",
    tokens: "30 tokens / month",
    highlight: true,
    badge: "Most Popular",
    features: [
      "30 tokens per month",
      "Invoices, receipts & statements",
      "Instant PDF download",
      "Business logo on documents",
      "Unlimited saved contacts",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "$19.99",
    period: "/month",
    tokens: "100 tokens / month",
    highlight: false,
    badge: null,
    features: [
      "100 tokens per month",
      "Invoices, receipts & statements",
      "Instant PDF download",
      "Business logo on documents",
      "Unlimited saved contacts",
      "Priority support",
    ],
  },
];

const packs = [
  {
    id: "tokens_10",
    label: "Starter Pack",
    tokens: 10,
    price: "$2.99",
    highlight: false,
    badge: null,
  },
  {
    id: "tokens_25",
    label: "Value Pack",
    tokens: 25,
    price: "$5.99",
    highlight: true,
    badge: "Best Value",
  },
  {
    id: "tokens_50",
    label: "Pro Pack",
    tokens: 50,
    price: "$9.99",
    highlight: false,
    badge: null,
  },
];

const packFeatures = [
  "Tokens never expire",
  "Invoices, receipts & statements",
  "Instant PDF download",
  "Business logo on documents",
  "No subscription required",
];

export default function UpgradePage() {
  const [tab, setTab] = useState<"packs" | "plans">("packs");
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (body: object, id: string) => {
    setLoading(id);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Failed to start checkout");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Get more tokens</h1>
        <p className="mt-2 text-gray-500">
          Choose how you want to pay — one-time or monthly.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1">
          <button
            onClick={() => setTab("packs")}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              tab === "packs"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Package className="mr-1.5 inline h-4 w-4" />
            Token packs
            <span className="ml-1.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
              One-time
            </span>
          </button>
          <button
            onClick={() => setTab("plans")}
            className={`rounded-lg px-5 py-2 text-sm font-medium transition-colors ${
              tab === "plans"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Zap className="mr-1.5 inline h-4 w-4" />
            Monthly plans
          </button>
        </div>
      </div>

      {/* Token packs */}
      {tab === "packs" && (
        <div className="space-y-6">
          <p className="text-center text-sm text-gray-500">
            Pay once, use whenever. Tokens never expire and include logo support.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
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
                  {pack.tokens} tokens
                </div>
                <ul className="mb-6 space-y-2">
                  {packFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={pack.highlight ? "default" : "outline"}
                  loading={loading === pack.id}
                  onClick={() => handleCheckout({ pack: pack.id }, pack.id)}
                >
                  Buy {pack.label}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly plans */}
      {tab === "plans" && (
        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border-2 bg-white p-6 shadow-sm ${
                plan.highlight ? "border-indigo-500 shadow-indigo-100 shadow-md" : "border-gray-200"
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
                <span className="mb-1 text-sm text-gray-400">{plan.period}</span>
              </div>
              <div className="mb-5 flex items-center gap-1.5 text-sm font-medium text-indigo-600">
                <Zap className="h-3.5 w-3.5" />
                {plan.tokens}
              </div>
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.highlight ? "default" : "outline"}
                loading={loading === plan.id}
                onClick={() => handleCheckout({ plan: plan.id }, plan.id)}
              >
                Get {plan.name}
              </Button>
            </div>
          ))}
        </div>
      )}

      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="py-5 text-center">
          <p className="text-sm text-indigo-700">
            Monthly plans include a 30-day money-back guarantee and can be cancelled anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
