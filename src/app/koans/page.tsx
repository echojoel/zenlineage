import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import {
  teachings,
  teachingContent,
  teachingMasterRoles,
  masters,
  masterNames,
  citations,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { buildCitationKeySet, isPublishedTeaching } from "@/lib/publishable-content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { abs, breadcrumbSchema, jsonLdString } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Koans & Encounter Dialogues — Zen Lineage",
  description:
    "Browse 48 Mumonkan koans and classical Zen encounter dialogues from the Blue Cliff Record, Denkoroku, and Jingde Chuandenglu — indexed by featured masters.",
  alternates: { canonical: "https://zenlineage.org/koans" },
  openGraph: {
    title: "Koans & Encounter Dialogues — Zen Lineage",
    description:
      "The Mumonkan (Gateless Gate), Blue Cliff Record, Denkoroku, and Jingde Chuandenglu — classical koan collections with attributed masters.",
    url: "https://zenlineage.org/koans",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Koans & Encounter Dialogues — Zen Lineage",
    description: "Classical koan collections indexed by master — Mumonkan, Blue Cliff Record, Denkoroku, Jingde Chuandenglu.",
  },
};

interface CollectionMeta {
  altName: string;
  compiler: string;
  era: string;
  description: string;
}

const COLLECTION_ORDER = [
  "Mumonkan",
  "Blue Cliff Record",
  "Denkoroku",
  "Jingde Chuandenglu",
];

const COLLECTION_META: Record<string, CollectionMeta> = {
  Mumonkan: {
    altName: "The Gateless Gate",
    compiler: "Wumen Huikai",
    era: "Song dynasty, 1228",
    description:
      "Forty-eight koans compiled by Wumen Huikai with verse and prose commentary. The most widely studied koan collection in Western Zen.",
  },
  "Blue Cliff Record": {
    altName: "Biyanlu 碧巖錄",
    compiler: "Yuanwu Keqin",
    era: "Song dynasty, 1125",
    description:
      "One hundred cases from the Tang masters, with verse by Xuedou Chongxian and commentary by Yuanwu Keqin. The oldest major koan anthology.",
  },
  Denkoroku: {
    altName: "Record of Transmitting the Light",
    compiler: "Keizan Jōkin",
    era: "Kamakura period, c. 1300",
    description:
      "Fifty-two transmission cases from the Indian and Chinese patriarchs, compiled by Keizan Jōkin as a Sōtō Zen awakening record.",
  },
  "Jingde Chuandenglu": {
    altName: "Transmission of the Lamp 景德傳燈錄",
    compiler: "Daoyuan",
    era: "Song dynasty, 1004",
    description:
      "Thirty volumes documenting over 1,700 Chan masters. The foundational genealogical text of the Chan tradition.",
  },
};

const breadcrumbLd = breadcrumbSchema([
  { name: "Home", url: abs("/") },
  { name: "Koans", url: abs("/koans") },
]);

export default async function KoansPage() {
  // Fetch all koan/dialogue teachings from the featured collections
  const teachingRows = await db
    .select({
      id: teachings.id,
      slug: teachings.slug,
      type: teachings.type,
      collection: teachings.collection,
      caseNumber: teachings.caseNumber,
      title: teachingContent.title,
    })
    .from(teachings)
    .leftJoin(
      teachingContent,
      and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
    )
    .where(
      and(
        inArray(teachings.collection, COLLECTION_ORDER),
        inArray(teachings.type, ["koan", "dialogue"])
      )
    );

  // Citation-gate
  const citationRows = await db
    .select({ entityType: citations.entityType, entityId: citations.entityId })
    .from(citations)
    .where(eq(citations.entityType, "teaching"));
  const citationKeys = buildCitationKeySet(citationRows);

  const published = teachingRows.filter((t) => isPublishedTeaching({ id: t.id }, citationKeys));

  // Fetch master roles for these teachings
  const publishedIds = published.map((t) => t.id);
  const roleRows =
    publishedIds.length > 0
      ? await db
          .select({
            teachingId: teachingMasterRoles.teachingId,
            masterId: teachingMasterRoles.masterId,
            role: teachingMasterRoles.role,
          })
          .from(teachingMasterRoles)
          .where(inArray(teachingMasterRoles.teachingId, publishedIds))
      : [];

  // Fetch master names
  const masterIds = Array.from(new Set(roleRows.map((r) => r.masterId)));
  const masterNameRows =
    masterIds.length > 0
      ? await db
          .select({
            masterId: masterNames.masterId,
            slug: masters.slug,
            value: masterNames.value,
            nameType: masterNames.nameType,
          })
          .from(masterNames)
          .innerJoin(masters, eq(masters.id, masterNames.masterId))
          .where(
            and(
              inArray(masterNames.masterId, masterIds),
              eq(masterNames.locale, "en")
            )
          )
      : [];

  // Build master label map: prefer dharma name
  const masterLabel = new Map<string, string>();
  const masterSlugById = new Map<string, string>();
  for (const n of masterNameRows) {
    if (n.nameType === "dharma" && !masterLabel.has(n.masterId))
      masterLabel.set(n.masterId, n.value);
    if (!masterSlugById.has(n.masterId)) masterSlugById.set(n.masterId, n.slug);
  }
  for (const n of masterNameRows) {
    if (!masterLabel.has(n.masterId)) masterLabel.set(n.masterId, n.value);
  }

  // Group roles by teachingId — only keep "speaker" / "questioner" / "respondent" / "attributed_to"
  // as featured masters; "commentator" is secondary
  const FEATURED_ROLES = new Set(["speaker", "questioner", "respondent", "attributed_to"]);
  const rolesByTeaching = new Map<string, { masterId: string; role: string }[]>();
  for (const r of roleRows) {
    const list = rolesByTeaching.get(r.teachingId) ?? [];
    list.push({ masterId: r.masterId, role: r.role });
    rolesByTeaching.set(r.teachingId, list);
  }

  // Group by collection, sort Mumonkan by case number
  const byCollection = new Map<string, typeof published>();
  for (const t of published) {
    if (!t.collection) continue;
    const list = byCollection.get(t.collection) ?? [];
    list.push(t);
    byCollection.set(t.collection, list);
  }

  for (const [col, list] of byCollection) {
    if (col === "Mumonkan") {
      list.sort((a, b) => parseInt(a.caseNumber ?? "999") - parseInt(b.caseNumber ?? "999"));
    }
  }

  const totalCount = published.length;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(breadcrumbLd) }}
      />
      <div className="detail-layout" style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <Breadcrumbs
          trail={[
            { name: "Home", href: "/" },
            { name: "Koans & Dialogues" },
          ]}
        />

        <h1
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2rem",
            fontWeight: 400,
            letterSpacing: "0.04em",
            color: "var(--ink)",
            marginBottom: "0.25rem",
          }}
        >
          Koans &amp; Encounter Dialogues
        </h1>
        <p
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.75rem",
            color: "var(--ink-light)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "2.5rem",
          }}
        >
          {totalCount} entries across {COLLECTION_ORDER.filter((c) => byCollection.has(c)).length} collections
        </p>

        {/* Collection jump links */}
        <nav
          style={{
            display: "flex",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginBottom: "2.5rem",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.06em",
          }}
        >
          {COLLECTION_ORDER.filter((c) => byCollection.has(c)).map((col) => (
            <a
              key={col}
              href={`#${col.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ color: "var(--ink-light)", textDecoration: "none" }}
            >
              {col}
            </a>
          ))}
        </nav>

        {/* Collections */}
        {COLLECTION_ORDER.filter((c) => byCollection.has(c)).map((col) => {
          const meta = COLLECTION_META[col];
          const entries = byCollection.get(col) ?? [];
          const anchor = col.toLowerCase().replace(/\s+/g, "-");

          return (
            <section
              key={col}
              id={anchor}
              className="detail-card"
              style={{ marginBottom: "2rem" }}
            >
              <h2
                className="detail-section-title"
                style={{ marginBottom: "0.25rem" }}
              >
                {col}
              </h2>
              {meta && (
                <>
                  <p
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "0.7rem",
                      color: "var(--ink-light)",
                      marginBottom: "0.15rem",
                    }}
                  >
                    {meta.altName}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: "0.68rem",
                      color: "var(--ink-light)",
                      opacity: 0.75,
                      marginBottom: "0.75rem",
                    }}
                  >
                    Compiled by {meta.compiler} · {meta.era}
                  </p>
                  <p
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.8rem",
                      lineHeight: 1.65,
                      color: "var(--ink)",
                      marginBottom: "1.25rem",
                      opacity: 0.85,
                    }}
                  >
                    {meta.description}
                  </p>
                </>
              )}

              <ul className="detail-source-list">
                {entries.map((entry) => {
                  const roles = rolesByTeaching.get(entry.id) ?? [];
                  const featured = roles.filter((r) => FEATURED_ROLES.has(r.role));
                  const badge =
                    entry.caseNumber
                      ? `Case ${entry.caseNumber}`
                      : null;

                  return (
                    <li key={entry.slug}>
                      <div className="detail-source-heading">
                        {badge && <span>{badge}</span>}
                        <Link
                          href={`/teachings/${entry.slug}`}
                          className="detail-inline-link"
                        >
                          {entry.title ?? entry.slug}
                        </Link>
                      </div>
                      {featured.length > 0 && (
                        <p className="detail-list-meta">
                          {featured.map((r, i) => {
                            const slug = masterSlugById.get(r.masterId);
                            const name = masterLabel.get(r.masterId) ?? r.masterId;
                            return (
                              <span key={`${r.masterId}-${r.role}`}>
                                {i > 0 && ", "}
                                {slug ? (
                                  <Link
                                    href={`/masters/${slug}`}
                                    className="detail-inline-link"
                                  >
                                    {name}
                                  </Link>
                                ) : (
                                  name
                                )}
                              </span>
                            );
                          })}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
