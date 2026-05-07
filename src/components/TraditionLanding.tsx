import Link from "next/link";
import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { masterNames, masters, schools, temples } from "@/db/schema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  getSchoolDefinitions,
  type SchoolDefinition,
} from "@/lib/school-taxonomy";
import { isTier1Master } from "@/lib/editorial-tiers";
import { abs, breadcrumbSchema, jsonLdString } from "@/lib/seo/jsonld";
import { getSutraRegistry } from "@/lib/sutra-registry";

/**
 * Server component shared by /zen, /chan, /seon, /thien.
 *
 * For each tradition the page surfaces the editorial intro from
 * `school-taxonomy.ts` plus live counts pulled from the seed DB:
 * schools, masters, practice centres, earliest year. Featured
 * masters are tier-1 picks from the tradition, sorted by birth year.
 *
 * The four sūtra cards link out to /sutras pages — every Mahāyāna
 * tradition uses the same core texts so the same registry feeds all
 * four landing pages.
 */

export interface TraditionLandingProps {
  /** Display label as it appears in `school.tradition` (e.g. "Zen",
   *  "Chan", "Seon", "Thiền"). Drives every DB query on this page. */
  traditionLabel: string;
  /** URL slug for this tradition's landing page (e.g. "zen"). */
  slug: string;
  /** Page H2 — usually the same as `traditionLabel` plus "Zen". */
  title: string;
  /** Native-script rendering of the title (禅 / 禪 / 선 / Thiền). */
  nativeTitle: string;
  /** Optional `lang` attribute for the native title span. */
  nativeLang?: string;
  /** Editorial gloss for the hero — 2 to 3 short paragraphs. */
  heroIntro: string[];
  /** Optional shorter eyebrow ("Tradition · Japan" etc.). */
  eyebrow: string;
  /** Editor-curated intro of which sūtras matter to this tradition. */
  textsIntro: string;
  /** Sūtra slugs flagged as central to the tradition (subset of the
   *  registry). Order is rendered as the order on the page. */
  featuredSutraSlugs: string[];
}

export default async function TraditionLanding({
  traditionLabel,
  slug,
  title,
  nativeTitle,
  nativeLang,
  heroIntro,
  eyebrow,
  textsIntro,
  featuredSutraSlugs,
}: TraditionLandingProps) {
  // ── DB fetches ────────────────────────────────────────────────────
  const traditionSchools = await db
    .select({
      id: schools.id,
      slug: schools.slug,
      tradition: schools.tradition,
    })
    .from(schools)
    .where(eq(schools.tradition, traditionLabel))
    .orderBy(schools.slug);

  const traditionSchoolIds = traditionSchools.map((s) => s.id);

  // School names (English + native).
  const allSchoolNamesRows = await db
    .select({ schoolId: masterNames.masterId })
    .from(masterNames)
    .limit(0); // type prime; real query below
  void allSchoolNamesRows;

  const schoolNamesQuery =
    traditionSchoolIds.length > 0
      ? await db
          .select({
            schoolId: schools.id,
            slug: schools.slug,
            // only schools.id is keyed; names live on schoolNames table —
            // fetched via a join in the index page; here we re-use the
            // school-taxonomy registry which already has display names.
          })
          .from(schools)
          .where(inArray(schools.id, traditionSchoolIds))
      : [];
  void schoolNamesQuery;

  // Master count.
  const masterCountRow =
    traditionSchoolIds.length > 0
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(masters)
          .where(inArray(masters.schoolId, traditionSchoolIds))
      : [{ count: 0 }];
  const masterCount = masterCountRow[0]?.count ?? 0;

  // Earliest known birth year (for the "from the Nth century" line).
  const earliestRow =
    traditionSchoolIds.length > 0
      ? await db
          .select({
            min: sql<number | null>`MIN(${masters.birthYear})`,
          })
          .from(masters)
          .where(inArray(masters.schoolId, traditionSchoolIds))
      : [{ min: null as number | null }];
  const earliestYear = earliestRow[0]?.min ?? null;

  // Practice centre count (geocoded).
  const templeCountRow =
    traditionSchoolIds.length > 0
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(temples)
          .where(
            and(
              inArray(temples.schoolId, traditionSchoolIds),
              isNotNull(temples.lat)
            )
          )
      : [{ count: 0 }];
  const templeCount = templeCountRow[0]?.count ?? 0;

  // Featured masters: tier-1 within tradition, ordered by birth year,
  // capped at 8.
  const allTraditionMasters =
    traditionSchoolIds.length > 0
      ? await db
          .select({
            id: masters.id,
            slug: masters.slug,
            birthYear: masters.birthYear,
            deathYear: masters.deathYear,
          })
          .from(masters)
          .where(inArray(masters.schoolId, traditionSchoolIds))
      : [];

  const featuredMasterRows = allTraditionMasters
    .filter((m) => isTier1Master(m.slug))
    .sort((a, b) => (a.birthYear ?? 99999) - (b.birthYear ?? 99999))
    .slice(0, 8);

  const featuredMasterIds = featuredMasterRows.map((m) => m.id);
  const featuredMasterNamesRows =
    featuredMasterIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            value: masterNames.value,
            nameType: masterNames.nameType,
          })
          .from(masterNames)
          .where(
            and(
              inArray(masterNames.masterId, featuredMasterIds),
              eq(masterNames.locale, "en")
            )
          )
      : [];

  // Prefer dharma name; fall back to first available.
  const masterNameMap = new Map<string, string>();
  for (const row of featuredMasterNamesRows) {
    if (row.nameType === "dharma" && !masterNameMap.has(row.masterId)) {
      masterNameMap.set(row.masterId, row.value);
    }
  }
  for (const row of featuredMasterNamesRows) {
    if (!masterNameMap.has(row.masterId)) {
      masterNameMap.set(row.masterId, row.value);
    }
  }

  // Schools in this tradition — pull editorial entries from the
  // taxonomy so we get the rich descriptions / native titles, then
  // intersect with the DB-confirmed schools.
  const dbSchoolSlugs = new Set(traditionSchools.map((s) => s.slug));
  const traditionSchoolDefs = getSchoolDefinitions().filter(
    (def: SchoolDefinition) =>
      def.tradition === traditionLabel && dbSchoolSlugs.has(def.slug)
  );

  // Sūtras: filter the registry to the slugs flagged in props.
  const allSutras = getSutraRegistry();
  const featuredSutras = featuredSutraSlugs
    .map((s) => allSutras.find((entry) => entry.slug === s))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  // ── SEO breadcrumb ────────────────────────────────────────────────
  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: abs("/") },
    { name: title, url: abs(`/${slug}`) },
  ]);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString([breadcrumbLd]) }}
      />
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">{title}</h1>
      </header>
      <Breadcrumbs trail={[{ name: "Home", href: "/" }, { name: title }]} />

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">{eyebrow}</p>
          <h2 className="detail-title">{title}</h2>
          <p className="detail-native-names" lang={nativeLang}>
            {nativeTitle}
          </p>
          <div className="detail-summary">
            {heroIntro.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* At-a-glance counts */}
        <section className="detail-card">
          <h3 className="detail-section-title">At a glance</h3>
          <div className="tradition-stats-row">
            <div className="tradition-stat">
              <span className="tradition-stat-value">
                {traditionSchoolDefs.length}
              </span>
              <span className="tradition-stat-label">
                {traditionSchoolDefs.length === 1 ? "school" : "schools"}
              </span>
            </div>
            <div className="tradition-stat">
              <span className="tradition-stat-value">{masterCount}</span>
              <span className="tradition-stat-label">
                {masterCount === 1 ? "lineage master" : "lineage masters"}
              </span>
            </div>
            <div className="tradition-stat">
              <span className="tradition-stat-value">{templeCount}</span>
              <span className="tradition-stat-label">
                {templeCount === 1 ? "practice centre" : "practice centres"}
              </span>
            </div>
            {earliestYear !== null ? (
              <div className="tradition-stat">
                <span className="tradition-stat-value">
                  {earliestYear < 0 ? `${-earliestYear} BCE` : earliestYear}
                </span>
                <span className="tradition-stat-label">earliest master</span>
              </div>
            ) : null}
          </div>
        </section>

        {/* Schools in this tradition */}
        {traditionSchoolDefs.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Schools in this tradition</h3>
            <ul className="detail-link-list">
              {traditionSchoolDefs.map((def) => (
                <li key={def.slug}>
                  <Link href={`/schools/${def.slug}`}>
                    {def.name}
                    {def.nativeNames && Object.keys(def.nativeNames).length > 0 ? (
                      <span className="detail-list-meta">
                        {" "}
                        {Object.values(def.nativeNames).slice(0, 1).join("")}
                      </span>
                    ) : null}
                  </Link>
                  {def.summary ? (
                    <p
                      className="detail-source-excerpt"
                      style={{ marginTop: "0.4rem" }}
                    >
                      {def.summary.split(/\[\d+\]/).join("").slice(0, 220)}
                      {def.summary.length > 220 ? "…" : ""}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Featured masters */}
        {featuredMasterRows.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Featured masters</h3>
            <p className="detail-list-meta" style={{ marginBottom: "0.85rem" }}>
              Tier-1 figures of the tradition, sorted by birth year.
            </p>
            <ul className="detail-link-list">
              {featuredMasterRows.map((m) => (
                <li key={m.id}>
                  <Link href={`/masters/${m.slug}`}>
                    {masterNameMap.get(m.id) ?? m.slug}
                  </Link>
                  <span className="detail-list-meta">
                    {m.birthYear ?? "?"} – {m.deathYear ?? "?"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Sūtras the tradition leans on */}
        {featuredSutras.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">Texts at the centre</h3>
            <div className="detail-summary">
              <p>{textsIntro}</p>
            </div>
            <ul className="detail-link-list">
              {featuredSutras.map((s) => (
                <li key={s.slug}>
                  <Link href={`/sutras/${s.slug}`}>
                    {s.title}
                    <span className="detail-list-meta" lang="zh">
                      {" "}
                      {s.nativeTitle}
                    </span>
                  </Link>
                  <p
                    className="detail-source-excerpt"
                    style={{ marginTop: "0.4rem" }}
                  >
                    {s.gloss}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTAs out */}
        <section className="detail-card">
          <h3 className="detail-section-title">Continue</h3>
          <div className="detail-actions" style={{ justifyContent: "flex-start" }}>
            <Link className="detail-button" href="/lineage">
              See the lineage graph
            </Link>
            <Link
              className="detail-button detail-button-muted"
              href="/practice"
            >
              Find a practice centre
            </Link>
            <Link
              className="detail-button detail-button-muted"
              href="/sutras"
            >
              Read the sūtras
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
