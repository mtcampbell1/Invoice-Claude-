import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FileText, Receipt, BarChart3, Plus, LogIn, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("common");
  const locale = await getLocale();

  const documents = session
    ? await prisma.document.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  const docActions = [
    { type: "invoice", label: t("newInvoice"), icon: FileText, href: "/create/invoice" as const },
    { type: "receipt", label: t("newReceipt"), icon: Receipt, href: "/create/receipt" as const },
    { type: "statement", label: t("newStatement"), icon: BarChart3, href: "/create/statement" as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("createDocument")}</h1>
        <p className="text-sm text-gray-500">
          {t("createDocumentDesc")}
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
                    <p className="text-xs text-gray-400">{t("freeDownload")}</p>
                  </div>
                  <Plus className="ml-auto h-4 w-4 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent documents */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t("recentDocuments")}
        </h2>
        {!session ? (
          <Card>
            <CardContent className="py-10 text-center">
              <LogIn className="mx-auto mb-3 h-9 w-9 text-gray-300" />
              <p className="font-medium text-gray-700">{t("signInToSave")}</p>
              <p className="mt-1 text-sm text-gray-400">
                {t("signInToSaveDesc")}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">{tc("signIn")}</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">{tc("createAccount")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-gray-500">{t("noDocuments")}</p>
              <p className="text-sm text-gray-400">{t("noDocumentsDesc")}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-gray-50">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}` as "/dashboard"}
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
                        {doc.clientName} · {formatDate(doc.createdAt, locale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {doc.total ? formatCurrency(doc.total, "USD", locale) : "—"}
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
                    <Download className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
