"use client";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DocumentData } from "@/lib/claude";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const DocumentDownloadButton = dynamic(
  () => import("@/components/document-pdf").then((m) => m.DocumentDownloadButton),
  { ssr: false }
);

export function ReprintView({ data }: { data: DocumentData }) {
  const t = useTranslations("pdf");
  const locale = useLocale();

  const typeLabel =
    data.type === "invoice" ? t("invoice") : data.type === "receipt" ? t("receipt") : t("statement");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {typeLabel}
            </h1>
            <p className="text-sm text-gray-500">
              {data.number} · {data.to.name}
            </p>
          </div>
        </div>
        <DocumentDownloadButton data={data} />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{typeLabel}</h2>
            <span className="text-2xl font-bold text-indigo-600">
              {formatCurrency(data.total, "USD", locale)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t("from")}</p>
              <p className="font-semibold">{data.from.name}</p>
              {data.from.address && <p className="text-gray-500">{data.from.address}</p>}
              {data.from.email && <p className="text-gray-500">{data.from.email}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{t("billTo")}</p>
              <p className="font-semibold">{data.to.name}</p>
              {data.to.company && <p className="text-gray-500">{data.to.company}</p>}
              {data.to.email && <p className="text-gray-500">{data.to.email}</p>}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">{t("description")}</th>
                <th className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">{t("qty")}</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">{t("rate")}</th>
                <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">{t("amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-center text-gray-500">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-500">{formatCurrency(item.rate, "USD", locale)}</td>
                  <td className="py-2 text-right font-medium">{formatCurrency(item.amount, "USD", locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ml-auto w-48 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>{t("subtotal")}</span>
              <span>{formatCurrency(data.subtotal, "USD", locale)}</span>
            </div>
            {data.taxAmount && data.taxAmount > 0 && (
              <div className="flex justify-between text-gray-500">
                <span>{t("tax")} {data.taxRate ? `(${data.taxRate}%)` : ""}</span>
                <span>{formatCurrency(data.taxAmount, "USD", locale)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-1 font-bold">
              <span>{t("total")}</span>
              <span className="text-indigo-600">{formatCurrency(data.total, "USD", locale)}</span>
            </div>
          </div>
          {data.notes && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              <span className="font-medium">{t("notes")}:</span> {data.notes}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
