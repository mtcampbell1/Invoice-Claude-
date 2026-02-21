import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PLANS } from "@/lib/tokens";
import Link from "next/link";
import { FileText, Receipt, BarChart3, Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const docActions = [
  { type: "invoice", label: "New Invoice", icon: FileText, href: "/create/invoice" },
  { type: "receipt", label: "New Receipt", icon: Receipt, href: "/create/receipt" },
  { type: "statement", label: "New Statement", icon: BarChart3, href: "/create/statement" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [user, documents] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.document.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const plan = PLANS[user?.plan as keyof typeof PLANS] ?? PLANS.free;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Create and manage your documents</p>
      </div>

      {/* Token status card */}
      <Card className="bg-gradient-to-br from-indigo-50 to-white">
        <CardContent className="flex items-center justify-between py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <Zap className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{plan.name} Plan</p>
              <p className="text-2xl font-bold text-gray-900">
                {user?.tokens ?? 0}
                <span className="text-base font-normal text-gray-400">
                  {" "}/{plan.tokens} tokens
                </span>
              </p>
              <p className="text-xs text-gray-400">
                Resets {plan.resetPeriod}
              </p>
            </div>
          </div>
          {user?.plan === "free" && (
            <Link href="/upgrade">
              <Button size="sm">Upgrade for more</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Create a document
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {docActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.type} href={action.href}>
                <Card className="cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all">
                  <CardContent className="flex items-center gap-4 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-400">Uses 1 token</p>
                    </div>
                    <Plus className="ml-auto h-4 w-4 text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent documents */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent documents
        </h2>
        {documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-gray-500">No documents yet</p>
              <p className="text-sm text-gray-400">
                Create your first invoice above
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-gray-50">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {doc.number || "—"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {doc.clientName} · {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {doc.total ? formatCurrency(doc.total) : "—"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        doc.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : doc.status === "sent"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {doc.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
