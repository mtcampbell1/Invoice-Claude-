// Runs the initial migration SQL against the database using pg directly.
// Uses DATABASE_PASSWORD (if set) to avoid URL-encoding issues with special characters.
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL set, skipping migrations");
    return;
  }

  let pool;
  try {
    const url = new URL(process.env.DATABASE_URL);
    const password =
      process.env.DATABASE_PASSWORD || decodeURIComponent(url.password);

    pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: decodeURIComponent(url.username),
      password,
      ssl: { rejectUnauthorized: false },
    });

    const sqlPath = path.join(
      __dirname,
      "..",
      "prisma",
      "migrations",
      "20260221204603_init",
      "migration.sql"
    );

    const sql = fs.readFileSync(sqlPath, "utf8");
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log("✓ Database migration completed successfully");
    } finally {
      client.release();
    }
  } catch (err) {
    // Non-fatal: log and continue so the build doesn't fail if DB is unreachable
    console.error("⚠ Migration error (build will continue):", err.message);
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}

runMigrations();
