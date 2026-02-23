import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, Receipt, BarChart3, Plus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const docActions = [
  { type: "invoice", label: "New Invoice", icon: FileText, href: "/create/invoice" },
  { type: "receipt", label: "New Receipt", icon: Receipt, href: "/create/receipt" },
  { type: "statement", label: "New Statement", icon: BarChart3, href: "/create/statement" },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const documents = session
    ? await prisma.document.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create a document</h1>
        <p className="text-sm text-gray-500">
          Fill in the details and download a professional PDF instantly
        </p>
      </div>

      {/* Quick actions */}
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
                    <p className="font-semibold text-gray-900">{action.label}</p>
                    <p className="text-xs text-gray-400">Free · Download PDF</p>
                  </div>
                  <Plus className="ml-auto h-4 w-4 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent documents (logged-in users only) */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent documents
        </h2>
        {!session ? (
          <Card>
            <CardContent className="py-10 text-center">
              <LogIn className="mx-auto mb-3 h-9 w-9 text-gray-300" />
              <p className="font-medium text-gray-700">Sign in to save your history</p>
              <p className="mt-1 text-sm text-gray-400">
                Your documents will be saved so you can access them anytime
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">Sign in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Create account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-gray-500">No documents yet</p>
              <p className="text-sm text-gray-400">Create your first invoice above</p>
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
