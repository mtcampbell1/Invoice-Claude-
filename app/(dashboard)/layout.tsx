import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar, BottomNav } from "@/components/nav";
import { TokenBadge } from "@/components/token-badge";
import { FileText } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // Treat as guest if auth check fails
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo — visible on mobile only (sidebar is hidden on mobile) */}
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">InvoiceClaude</span>
          </Link>

          {/* Welcome text — desktop only */}
          <p className="hidden text-sm text-gray-500 lg:block">
            {session ? (
              <>
                Welcome back,{" "}
                <span className="font-medium text-gray-900">
                  {session.user.name || session.user.email}
                </span>
              </>
            ) : (
              <span className="font-medium text-gray-700">
                Create professional invoices instantly — no sign-up required
              </span>
            )}
          </p>

          {session && <TokenBadge />}
        </header>

        {/* Main content — pb-24 on mobile to clear the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation bar */}
      <BottomNav />
    </div>
  );
}
