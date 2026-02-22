"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/create/invoice", label: "New Invoice", icon: FileText },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">InvoiceClaude</span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

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

      <div className="p-4 border-t border-gray-100 space-y-1">
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              Create account
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
