"use client";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";

interface TokenStatus {
  tokens: number;
  plan: string;
  planName: string;
  maxTokens: number;
  resetPeriod: string;
}

export function TokenBadge() {
  const [status, setStatus] = useState<TokenStatus | null>(null);

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status) return null;

  const pct = (status.tokens / status.maxTokens) * 100;
  const low = status.tokens <= 1;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm sm:gap-3 sm:px-4 sm:py-2">
      <Zap className={`h-4 w-4 shrink-0 ${low ? "text-red-500" : "text-indigo-500"}`} />

      {/* Compact on mobile: just the count */}
      <p className={`text-sm font-semibold sm:hidden ${low ? "text-red-600" : "text-gray-900"}`}>
        {status.tokens}
        <span className="ml-0.5 text-xs font-normal text-gray-400"> tokens</span>
      </p>

      {/* Full on sm+ */}
      <div className="hidden sm:block">
        <p className="text-xs text-gray-500">
          {status.planName} · {status.resetPeriod}
        </p>
        <p className={`text-sm font-semibold ${low ? "text-red-600" : "text-gray-900"}`}>
          {status.tokens} / {status.maxTokens} tokens
        </p>
      </div>

      <div className="hidden h-2 w-16 rounded-full bg-gray-100 sm:block">
        <div
          className={`h-2 rounded-full transition-all ${
            low ? "bg-red-500" : pct > 50 ? "bg-indigo-500" : "bg-amber-500"
          }`}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>

      {status.tokens === 0 && (
        <Link
          href="/upgrade"
          className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
        >
          Buy
        </Link>
      )}
    </div>
  );
}
