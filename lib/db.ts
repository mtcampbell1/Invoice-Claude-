import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  let pool: import("pg").Pool;

  if (process.env.DATABASE_PASSWORD) {
    // Use DATABASE_PASSWORD directly to avoid URL-encoding issues with special characters
    const url = new URL(process.env.DATABASE_URL);
    const { Pool } = require("pg");
    pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: decodeURIComponent(url.username),
      password: process.env.DATABASE_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });
  } else {
    const { Pool } = require("pg");
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });
}

let _client: PrismaClient | undefined;

function getClient(): PrismaClient {
  if (!_client) {
    _client = globalForPrisma.prisma ?? createPrismaClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _client;
  }
  return _client;
}

// Lazy proxy so the Prisma client is only created when first accessed at runtime,
// not during Next.js build-time module evaluation.
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
