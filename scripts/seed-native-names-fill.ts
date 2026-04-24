/**
 * Add authenticated native-script names for Indian patriarchs + a handful
 * of other masters that the accuracy audit flagged as missing a native
 * script. Each addition is chosen because the Sanskrit (or Chinese) form is
 * attested in standard scholarly sources, not invented.
 *
 * Idempotent — re-insertion with the same ID is a no-op.
 *
 * Usage: npm run seed:names
 */

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masterNames, masters } from "@/db/schema";
import { NATIVE_NAMES_TO_ADD } from "./data/native-names-fill";

function hashShort(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

async function main() {
  let added = 0;
  let missing = 0;
  for (const entry of NATIVE_NAMES_TO_ADD) {
    const rows = await db
      .select({ id: masters.id })
      .from(masters)
      .where(eq(masters.slug, entry.masterSlug));
    const masterId = rows[0]?.id;
    if (!masterId) {
      console.warn(`  ⚠ master ${entry.masterSlug} not found`);
      missing++;
      continue;
    }
    for (const n of entry.names) {
      const id = `${masterId}__${n.locale}__${n.nameType}__${hashShort(n.value)}`;
      const existing = await db
        .select({ id: masterNames.id })
        .from(masterNames)
        .where(eq(masterNames.id, id));
      if (existing.length === 0) {
        await db.insert(masterNames).values({
          id,
          masterId,
          locale: n.locale,
          nameType: n.nameType,
          value: n.value,
        });
        added++;
      }
    }
  }
  console.log(`✓ ${added} native-script names added, ${missing} masters missing`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
