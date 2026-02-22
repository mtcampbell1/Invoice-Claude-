import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  // LibSQL needs an absolute file path
  let resolvedUrl = dbUrl;
  if (dbUrl.startsWith("file:./") || dbUrl.startsWith("file:../")) {
    const relativePath = dbUrl.replace("file:", "");
    resolvedUrl = `file:${path.resolve(process.cwd(), relativePath)}`;
  }

  const adapter = new PrismaLibSql({ url: resolvedUrl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
