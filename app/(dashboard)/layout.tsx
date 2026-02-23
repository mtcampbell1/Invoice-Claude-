import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/nav";
import { TokenBadge } from "@/components/token-badge";

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
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <p className="text-sm text-gray-500">
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
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
