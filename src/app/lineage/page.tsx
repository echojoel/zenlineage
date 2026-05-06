import Link from "next/link";
import { db } from "@/db";
import { schoolNames, schools } from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import LineageGraphClient from "./LineageGraphClient";

export default async function LineagePage() {
  // Top-level schools — those without a parent. The lineage tree
  // descends from these. Server-rendered as a static <ul> so crawlers
  // and zero-JS readers see the structure even though the interactive
  // graph hydrates client-side. Hidden visually once the client island
  // mounts, so the rendered surface stays the D3 canvas.
  const rootSchools = await db
    .select({
      id: schools.id,
      slug: schools.slug,
      tradition: schools.tradition,
      name: schoolNames.value,
    })
    .from(schools)
    .leftJoin(
      schoolNames,
      and(eq(schoolNames.schoolId, schools.id), eq(schoolNames.locale, "en"))
    )
    .where(isNull(schools.parentId))
    .orderBy(schools.tradition, schools.slug);

  return (
    <main className="lineage-page">
      <nav className="lineage-nav">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <span className="lineage-nav-title">Lineage</span>
      </nav>

      {/* Crawler-visible content — collapsed once the D3 canvas takes
          over. Carries the descriptive intro and the top-level branch
          list so the page is meaningful to text-only readers, search
          engines, and screen readers landing here directly. */}
      <div className="lineage-seo-intro">
        <h1>Zen lineage</h1>
        <p>
          A traversable map of dharma transmission across 2,500 years of
          Chan, Sŏn, Thiền, and Zen. Each line connects a teacher to a
          student through whom the teaching passed. The graph descends
          from Shakyamuni Buddha through Bodhidharma into the major
          regional and sectarian branches.
        </p>
        <p>
          Click any node to focus that master&rsquo;s neighborhood, or
          jump straight to a school below.
        </p>
        <h2>Branches</h2>
        <ul>
          {rootSchools.map((s) => (
            <li key={s.id}>
              <Link href={`/schools/${s.slug}`}>{s.name ?? s.slug}</Link>
              {s.tradition && <span> — {s.tradition}</span>}
            </li>
          ))}
        </ul>
      </div>

      <LineageGraphClient />
    </main>
  );
}
