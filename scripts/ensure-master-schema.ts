import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Idempotent in-place evolution of the `masters` table so a machine with an
 * existing zen.db does not need a separate `drizzle-kit migrate` step. SQLite
 * has no `ADD COLUMN IF NOT EXISTS`, so we attempt each ALTER and swallow the
 * "duplicate column" error — mirrors scripts/seed-temples.ts#ensureTempleSchema.
 * Canonical migration: drizzle/0006_lineage_boundary.sql.
 */
export async function ensureMasterSchema(): Promise<void> {
  const statements = [
    sql`ALTER TABLE masters ADD COLUMN living integer DEFAULT false NOT NULL`,
    sql`ALTER TABLE masters ADD COLUMN published integer DEFAULT true NOT NULL`,
  ];
  for (const statement of statements) {
    try {
      await db.run(statement);
    } catch {
      // Column already exists — fine.
    }
  }
}
