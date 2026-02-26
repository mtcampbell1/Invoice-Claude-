"use client";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTransition } from "react";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = {
  en: "EN",
  es: "ES",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5 text-xs font-medium">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          disabled={isPending}
          className={`rounded-md px-2 py-1 transition-colors ${
            locale === loc
              ? "bg-indigo-600 text-white"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {labels[loc]}
        </button>
      ))}
    </div>
  );
}
