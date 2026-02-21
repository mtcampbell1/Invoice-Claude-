import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";

  // Convert relative file paths to absolute for libsql
  let resolvedUrl = dbUrl;
  if (dbUrl.startsWith("file:./") || dbUrl.startsWith("file:../")) {
    const relativePath = dbUrl.replace("file:", "");
    resolvedUrl = `file:${path.resolve(process.cwd(), relativePath)}`;
  }

  // PrismaLibSql accepts a config object directly
  const adapter = new PrismaLibSql({ url: resolvedUrl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
