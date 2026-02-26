"use client";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Plus,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  const navItems = [
    { href: "/dashboard" as const, label: t("dashboard"), icon: LayoutDashboard },
    { href: "/create/invoice" as const, label: t("newInvoice"), icon: FileText },
    { href: "/contacts" as const, label: t("contacts"), icon: Users },
    { href: "/settings" as const, label: t("settings"), icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">InvoiceClaude</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Strip locale prefix for matching: /es/dashboard → /dashboard
          const cleanPath = pathname.replace(/^\/(en|es)/, "") || "/";
          const isActive =
            cleanPath === item.href ||
            (item.href !== "/dashboard" && cleanPath.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center justify-between px-3 py-1">
          <LanguageSwitcher />
        </div>
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {tc("signOut")}
          </button>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              {tc("signIn")}
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              {tc("createAccount")}
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}

/** Fixed bottom navigation bar — shown only on mobile (hidden on lg+) */
export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  const bottomNavItems = [
    { href: "/dashboard" as const, label: t("home"), icon: LayoutDashboard },
    { href: "/create/invoice" as const, label: t("new"), icon: Plus },
    { href: "/contacts" as const, label: t("contacts"), icon: Users },
    { href: "/settings" as const, label: t("settings"), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-gray-200 bg-white lg:hidden">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const cleanPath = pathname.replace(/^\/(en|es)/, "") || "/";
        const isActive =
          cleanPath === item.href ||
          (item.href !== "/dashboard" && cleanPath.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium transition-colors",
              isActive ? "text-indigo-600" : "text-gray-400"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400")} />
            {item.label}
          </Link>
        );
      })}
      {session ? (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium text-gray-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {tc("signOut")}
        </button>
      ) : (
        <Link
          href="/sign-in"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-xs font-medium text-gray-400"
        >
          <LogIn className="h-5 w-5" />
          {tc("signIn")}
        </Link>
      )}
    </nav>
  );
}
