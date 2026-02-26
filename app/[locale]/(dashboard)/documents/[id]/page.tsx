import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ReprintView } from "./reprint-view";
import type { DocumentData } from "@/lib/claude";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/sign-in");

  const doc = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!doc) notFound();

  const data = JSON.parse(doc.data) as DocumentData;

  return <ReprintView data={data} />;
}
