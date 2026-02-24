// Runs all migration SQL files (in timestamp order) against the database.
// Each migration uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS so re-runs are safe.
// Uses DATABASE_PASSWORD (if set) to avoid URL-encoding issues with special chars.
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

    const migrationsDir = path.join(__dirname, "..", "prisma", "migrations");

    // Collect all migration SQL files sorted by directory name (chronological)
    const migrationDirs = fs
      .readdirSync(migrationsDir)
      .filter((entry) => {
        const full = path.join(migrationsDir, entry);
        return (
          fs.statSync(full).isDirectory() &&
          fs.existsSync(path.join(full, "migration.sql"))
        );
      })
      .sort();

    const client = await pool.connect();
    try {
      for (const dir of migrationDirs) {
        const sqlPath = path.join(migrationsDir, dir, "migration.sql");
        const sql = fs.readFileSync(sqlPath, "utf8");
        await client.query(sql);
        console.log(`✓ Applied migration: ${dir}`);
      }
      console.log("✓ All migrations applied successfully");
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
