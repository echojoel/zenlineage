import { createClient } from "@libsql/client";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import * as schema from "./schema";

type AppDb = ReturnType<typeof drizzleLibsql<typeof schema>>;

// Cache the libsql instance for local dev
let _localDb: AppDb | null = null;

function getLocalDb(): AppDb {
  if (!_localDb) {
    _localDb = drizzleLibsql(
      createClient({ url: process.env.DATABASE_URL ?? "file:zen.db" }),
      { schema }
    );
  }
  return _localDb;
}

/**
 * Get a database instance.
 *
 * - In Cloudflare Workers runtime: uses D1 binding
 * - In local dev / build / seed scripts: uses libsql (file:zen.db or DATABASE_URL)
 */
export async function getDb(): Promise<AppDb> {
  // If DATABASE_URL is set, always use libsql (local dev, build, CI)
  if (process.env.DATABASE_URL) {
    return getLocalDb();
  }

  // Try Cloudflare D1 — only works at request time in Workers runtime
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.DB) {
      return drizzleD1(ctx.env.DB as D1Database, { schema }) as unknown as AppDb;
    }
  } catch {
    // Not in Cloudflare Workers — fall through to local
  }

  return getLocalDb();
}

/**
 * Synchronous db export for seed scripts and local dev only.
 * NOT available in Cloudflare Workers — use getDb() instead.
 */
export const db = getLocalDb();
