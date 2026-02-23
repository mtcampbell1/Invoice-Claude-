/**
 * Next.js instrumentation hook — runs once on server startup.
 * Used to ensure the database schema is up to date without requiring
 * a DB connection during the Vercel build step.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { prisma } = await import("@/lib/db");

      // Ensure GuestUsage table exists (added after initial schema was deployed)
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "GuestUsage" (
          "id"        TEXT        NOT NULL,
          "ip"        TEXT        NOT NULL,
          "tokens"    INTEGER     NOT NULL DEFAULT 3,
          "weekStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "GuestUsage_pkey" PRIMARY KEY ("id")
        )
      `);

      await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "GuestUsage_ip_key" ON "GuestUsage"("ip")
      `);
    } catch {
      // Non-fatal: app continues even if DB is temporarily unreachable
    }
  }
}
