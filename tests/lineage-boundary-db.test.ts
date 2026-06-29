import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { masters } from "@/db/schema";

// Reads the seeded zen.db. Run `npm run boundary:compute` first if stale.
describe("lineage boundary (seeded DB)", () => {
  it("never publishes a living master", async () => {
    const rows = await db
      .select({ slug: masters.slug })
      .from(masters)
      .where(eq(masters.living, true));
    const published = await db
      .select({ slug: masters.slug, published: masters.published })
      .from(masters)
      .where(eq(masters.living, true));
    expect(rows.length).toBeGreaterThanOrEqual(30);
    expect(published.every((m) => m.published === false)).toBe(true);
  });

  it("publishes shakyamuni-buddha as a published root", async () => {
    const root = await db
      .select({ published: masters.published })
      .from(masters)
      .where(eq(masters.slug, "shakyamuni-buddha"));
    expect(root[0]?.published).toBe(true);
  });

  it("archives a known living European teacher and a post-founder successor", async () => {
    const samples = ["olivier-reigen-wang-genh", "bernie-tetsugen-glassman"];
    for (const slug of samples) {
      const row = await db
        .select({ published: masters.published })
        .from(masters)
        .where(eq(masters.slug, slug));
      expect(row[0]?.published).toBe(false);
    }
  });

  it("keeps published as the large majority and archives a bounded minority", async () => {
    // `published` spans ALL masters (not only graph-reachable ones): published =
    // total − archived. With ~91 archived of ~556, the published count sits well
    // above 400. The archived set is a bounded minority (the living + post-founder
    // successors), not an unbounded prune.
    const pub = await db.select({ slug: masters.slug }).from(masters).where(eq(masters.published, true));
    const archived = await db.select({ slug: masters.slug }).from(masters).where(eq(masters.published, false));
    expect(pub.length).toBeGreaterThan(430);
    expect(pub.length).toBeLessThan(510);
    expect(archived.length).toBeGreaterThan(60);
    expect(archived.length).toBeLessThan(130);
  });
});
