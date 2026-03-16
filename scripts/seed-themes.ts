/**
 * Theme Seeding Script
 *
 * Reads scripts/data/themes.json and upserts themes + theme_names rows.
 * Idempotent — safe to re-run.
 *
 * Usage: npx tsx scripts/seed-themes.ts
 */

import fs from "fs";
import path from "path";
import { db } from "@/db";
import { themes, themeNames } from "@/db/schema";

interface RawTheme {
  slug: string;
  name: string;
  sortOrder: number;
}

const THEMES_FILE = path.join(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "data",
  "themes.json"
);

export default async function seedThemes(): Promise<void> {
  if (!fs.existsSync(THEMES_FILE)) {
    console.warn("⚠️  themes.json not found — skipping theme seeding");
    return;
  }

  const rawThemes: RawTheme[] = JSON.parse(fs.readFileSync(THEMES_FILE, "utf-8"));
  console.log(`Seeding ${rawThemes.length} themes...`);

  for (const t of rawThemes) {
    const themeId = t.slug;

    await db
      .insert(themes)
      .values({
        id: themeId,
        slug: t.slug,
        sortOrder: t.sortOrder,
      })
      .onConflictDoUpdate({
        target: themes.id,
        set: {
          slug: t.slug,
          sortOrder: t.sortOrder,
        },
      });

    const nameId = `${themeId}_en`;
    await db
      .insert(themeNames)
      .values({
        id: nameId,
        themeId,
        locale: "en",
        value: t.name,
      })
      .onConflictDoUpdate({
        target: themeNames.id,
        set: { value: t.name },
      });
  }

  console.log(`✓ Themes seeded`);
}

if (process.argv[1] && process.argv[1].endsWith("seed-themes.ts")) {
  seedThemes()
    .then(() => {
      console.log("\n=== Theme seeding complete ===");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Theme seeding failed:", err);
      process.exit(1);
    });
}
