"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t("resetFailed"));
      return;
    }

    setSubmitted(true);
    if (data.resetUrl) {
      setResetUrl(data.resetUrl);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm text-center space-y-4">
          {resetUrl ? (
            <>
              <div className="text-4xl">🔑</div>
              <h1 className="text-2xl font-bold text-gray-900">{t("resetPasswordButton")}</h1>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-700">
                Email service not configured — use the button below to reset your password directly.
              </div>
              <a
                href={resetUrl}
                className="block w-full rounded-lg bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-700"
              >
                {t("resetPasswordButton")}
              </a>
              <p className="text-xs text-gray-400">{t("linkExpiresHour")}</p>
            </>
          ) : (
            <>
              <div className="text-4xl">📧</div>
              <h1 className="text-2xl font-bold text-gray-900">{t("checkYourEmail")}</h1>
              <p className="text-sm text-gray-500">{t("resetEmailSent")}</p>
            </>
          )}
          <Link href="/sign-in" className="block text-sm text-indigo-600 hover:text-indigo-700">
            {t("backToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{t("forgotPassword")}</h1>
        <p className="mb-6 text-sm text-gray-500">{t("forgotPasswordSubtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" className="w-full" loading={loading}>
            {t("sendResetLink")}
          </Button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-700">
          {t("backToSignIn")}
        </Link>
      </p>
    </div>
  );
}
