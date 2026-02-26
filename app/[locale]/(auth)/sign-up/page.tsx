"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  // Only allow relative paths to prevent open-redirect abuse
  const rawRedirect = searchParams.get("redirect") || "";
  const redirectTo = rawRedirect.startsWith("/") ? rawRedirect : "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || t("registrationFailed"));
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    router.push(redirectTo);
  };

  const signInHref =
    redirectTo !== "/dashboard"
      ? `/sign-in?redirect=${encodeURIComponent(redirectTo)}`
      : "/sign-in";

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          {t("createYourAccount")}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {t("signUpSubtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t("name")}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
          <Input
            label={t("email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Input
            label={t("password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("passwordMin")}
            required
            autoComplete="new-password"
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" loading={loading}>
            {t("createAccountButton")}
          </Button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm text-gray-500">
        {t("hasAccount")}{" "}
        <Link
          href={signInHref}
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          {t("signInButton")}
        </Link>
      </p>
    </div>
  );
}
