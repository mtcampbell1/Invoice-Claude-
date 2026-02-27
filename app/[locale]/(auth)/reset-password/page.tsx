"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || t("resetFailed"));
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/sign-in"), 2000);
  };

  if (!token) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 shadow-sm text-center space-y-4">
          <p className="text-red-600 font-medium">{t("invalidResetLink")}</p>
          <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">
            {t("requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 shadow-sm text-center space-y-2">
          <div className="text-4xl">✓</div>
          <p className="font-medium text-green-800">{t("passwordResetSuccess")}</p>
          <p className="text-sm text-green-600">{t("redirectingToSignIn")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{t("resetPasswordTitle")}</h1>
        <p className="mb-6 text-sm text-gray-500">{t("resetPasswordSubtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("newPassword")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordMin")}
            required
            autoComplete="new-password"
          />
          <Input
            label={t("confirmPassword")}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={t("passwordMin")}
            required
            autoComplete="new-password"
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" className="w-full" loading={loading}>
            {t("resetPasswordButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}
