"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const rawRedirect = searchParams.get("redirect") || "";
  const redirectTo = rawRedirect.startsWith("/") ? rawRedirect : "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t("invalidCredentials"));
    } else {
      router.push(redirectTo);
    }
  };

  const signUpHref =
    redirectTo !== "/dashboard"
      ? `/sign-up?redirect=${encodeURIComponent(redirectTo)}`
      : "/sign-up";

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">{t("welcomeBack")}</h1>
        <p className="mb-6 text-sm text-gray-500">
          {t("signInSubtitle")}
        </p>

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
          <div className="space-y-1">
            <Input
              label={t("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700">
                {t("forgotPassword")}
              </Link>
            </div>
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" loading={loading}>
            {t("signInButton")}
          </Button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        {t("noAccount")}{" "}
        <Link
          href={signUpHref}
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          {t("signUpFree")}
        </Link>
      </p>
    </div>
  );
}
