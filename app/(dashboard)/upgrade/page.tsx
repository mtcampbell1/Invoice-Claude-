"use client";
import { useState } from "react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

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
      "AI-enhanced formatting",
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
      "AI-enhanced formatting",
      "Save client contacts",
      "Save business info",
      "Upload business logo",
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
      "AI-enhanced formatting",
      "Save client contacts",
      "Save business info",
      "Upload business logo",
      "Priority support",
    ],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    setLoading(planId);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
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
        <h1 className="text-3xl font-bold text-gray-900">Upgrade your plan</h1>
        <p className="mt-2 text-gray-500">
          Get more tokens and unlock powerful features
        </p>
      </div>

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
              onClick={() => handleUpgrade(plan.id)}
            >
              Get {plan.name}
            </Button>
          </div>
        ))}
      </div>

      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="py-5 text-center">
          <p className="text-sm text-indigo-700">
            All plans include a 30-day money-back guarantee. Cancel anytime.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
