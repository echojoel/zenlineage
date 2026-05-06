import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, inArray, and } from "drizzle-orm";
import { db } from "@/db";
import {
  masterNames,
  masterTransmissions,
  masters,
  schoolNames,
  schools,
} from "@/db/schema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  abs,
  breadcrumbSchema,
  jsonLdString,
} from "@/lib/seo/jsonld";

const ANCESTOR_DEPTH = 12; // walk up the entire chain — Zen lineages
                           // are deep but finite (~28 patriarchs)
const DESCENDANT_DEPTH = 3; // tree expands fast going down; cap to 3

export async function generateStaticParams() {
  const all = await db.select({ slug: masters.slug }).from(masters);
  return all.map((m) => ({ slug: m.slug }));
}

type MasterRow = {
  id: string;
  slug: string;
  birthYear: number | null;
  deathYear: number | null;
};

async function getMasterBySlug(slug: string): Promise<MasterRow | null> {
  const row = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      birthYear: masters.birthYear,
      deathYear: masters.deathYear,
    })
    .from(masters)
    .where(eq(masters.slug, slug))
    .limit(1);
  return row[0] ?? null;
}

async function getMastersByIds(ids: string[]): Promise<MasterRow[]> {
  if (ids.length === 0) return [];
  return db
    .select({
      id: masters.id,
      slug: masters.slug,
      birthYear: masters.birthYear,
      deathYear: masters.deathYear,
    })
    .from(masters)
    .where(inArray(masters.id, ids));
}

async function getDharmaNames(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({
      masterId: masterNames.masterId,
      nameType: masterNames.nameType,
      value: masterNames.value,
    })
    .from(masterNames)
    .where(and(inArray(masterNames.masterId, ids), eq(masterNames.locale, "en")));
  const out = new Map<string, string>();
  for (const r of rows) {
    if (r.nameType === "dharma" && !out.has(r.masterId)) out.set(r.masterId, r.value);
  }
  for (const r of rows) {
    if (!out.has(r.masterId)) out.set(r.masterId, r.value);
  }
  return out;
}

async function walkAncestors(rootId: string, maxDepth: number): Promise<MasterRow[][]> {
  // Returns layers: [direct teachers, grand-teachers, ...]. BFS up the
  // graph through master_transmissions where root is the student.
  const layers: MasterRow[][] = [];
  let frontier = [rootId];
  const seen = new Set<string>([rootId]);
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const edges = await db
      .select({ teacherId: masterTransmissions.teacherId })
      .from(masterTransmissions)
      .where(inArray(masterTransmissions.studentId, frontier));
    const nextIds = Array.from(
      new Set(edges.map((e) => e.teacherId).filter((id) => !seen.has(id)))
    );
    if (nextIds.length === 0) break;
    nextIds.forEach((id) => seen.add(id));
    const masters = await getMastersByIds(nextIds);
    layers.push(masters);
    frontier = nextIds;
  }
  return layers;
}

async function walkDescendants(rootId: string, maxDepth: number): Promise<MasterRow[][]> {
  const layers: MasterRow[][] = [];
  let frontier = [rootId];
  const seen = new Set<string>([rootId]);
  for (let depth = 0; depth < maxDepth && frontier.length > 0; depth++) {
    const edges = await db
      .select({ studentId: masterTransmissions.studentId })
      .from(masterTransmissions)
      .where(inArray(masterTransmissions.teacherId, frontier));
    const nextIds = Array.from(
      new Set(edges.map((e) => e.studentId).filter((id) => !seen.has(id)))
    );
    if (nextIds.length === 0) break;
    nextIds.forEach((id) => seen.add(id));
    const masters = await getMastersByIds(nextIds);
    layers.push(masters);
    frontier = nextIds;
  }
  return layers;
}

function formatDates(m: MasterRow): string {
  if (m.birthYear && m.deathYear) return `${m.birthYear}–${m.deathYear}`;
  if (m.deathYear) return `d. ${m.deathYear}`;
  if (m.birthYear) return `b. ${m.birthYear}`;
  return "";
}

async function loadLineage(slug: string) {
  const master = await getMasterBySlug(slug);
  if (!master) return null;

  const [ancestorLayers, descendantLayers] = await Promise.all([
    walkAncestors(master.id, ANCESTOR_DEPTH),
    walkDescendants(master.id, DESCENDANT_DEPTH),
  ]);

  const allIds = new Set<string>([master.id]);
  for (const layer of [...ancestorLayers, ...descendantLayers]) {
    for (const m of layer) allIds.add(m.id);
  }
  const nameMap = await getDharmaNames(Array.from(allIds));

  const schoolRows = await db
    .select({
      id: masters.id,
      schoolId: masters.schoolId,
    })
    .from(masters)
    .where(eq(masters.id, master.id));
  const schoolId = schoolRows[0]?.schoolId ?? null;

  let schoolInfo: { slug: string; name: string } | null = null;
  if (schoolId) {
    const sRow = (
      await db
        .select({
          slug: schools.slug,
          name: schoolNames.value,
        })
        .from(schools)
        .leftJoin(
          schoolNames,
          and(eq(schoolNames.schoolId, schools.id), eq(schoolNames.locale, "en"))
        )
        .where(eq(schools.id, schoolId))
        .limit(1)
    )[0];
    if (sRow) {
      schoolInfo = { slug: sRow.slug, name: sRow.name ?? sRow.slug };
    }
  }

  return { master, ancestorLayers, descendantLayers, nameMap, schoolInfo };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadLineage(slug);
  if (!data) return {};
  const { master, ancestorLayers, descendantLayers, nameMap, schoolInfo } = data;
  const name = nameMap.get(master.id) ?? master.slug;

  const ancestorCount = ancestorLayers.flat().length;
  const descendantCount = descendantLayers.flat().length;
  const dates = formatDates(master);
  const description = `Dharma lineage of ${name}${dates ? ` (${dates})` : ""}${
    schoolInfo ? `, ${schoolInfo.name}` : ""
  } — ${ancestorCount} teachers and ancestors, ${descendantCount} students and descendants traced through transmission.`;

  const canonicalUrl = abs(`/lineage/${slug}`);
  return {
    title: `Lineage of ${name}`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Lineage of ${name} — Zen Lineage`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Lineage of ${name}`,
      description,
    },
  };
}

export default async function MasterLineagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadLineage(slug);
  if (!data) notFound();
  const { master, ancestorLayers, descendantLayers, nameMap, schoolInfo } = data;
  const name = nameMap.get(master.id) ?? master.slug;

  const canonicalUrl = abs(`/lineage/${slug}`);

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: abs("/") },
    { name: "Lineage", url: abs("/lineage") },
    { name: `Lineage of ${name}`, url: canonicalUrl },
  ]);

  // Show ancestors top-down: deepest ancestor first, then walk down to
  // the master. The walkAncestors result is in [direct teachers,
  // grand-teachers, ...] order — reverse for display.
  const ancestorsTopDown = ancestorLayers.slice().reverse();

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
        <Link href="/lineage" className="nav-link">
          Lineage
        </Link>
        <h1 className="page-title">Lineage of {name}</h1>
      </header>
      <Breadcrumbs
        trail={[
          { name: "Home", href: "/" },
          { name: "Lineage", href: "/lineage" },
          { name: `Lineage of ${name}` },
        ]}
      />

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">Dharma transmission</p>
          <h2 className="detail-title">Lineage of {name}</h2>
          <p className="detail-subtitle">
            {ancestorLayers.flat().length} teachers and ancestors,{" "}
            {descendantLayers.flat().length} students and descendants traced
            through transmission.
          </p>
          <div className="detail-actions">
            <Link
              className="detail-button"
              href={`/lineage?focus=${master.slug}${
                schoolInfo ? `&school=${schoolInfo.slug}` : ""
              }`}
            >
              Show in interactive graph
            </Link>
            <Link
              className="detail-button detail-button-muted"
              href={`/masters/${master.slug}`}
            >
              About {name}
            </Link>
          </div>
        </section>

        {ancestorsTopDown.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">
              Ancestors of {name}
            </h3>
            <ol className="detail-link-list">
              {ancestorsTopDown.map((layer, i) => (
                <li key={`anc-${i}`}>
                  <p className="detail-list-meta">
                    {ancestorsTopDown.length - i} generation
                    {ancestorsTopDown.length - i === 1 ? "" : "s"} above
                  </p>
                  <ul className="detail-link-list" style={{ marginTop: "0.4rem" }}>
                    {layer
                      .slice()
                      .sort((a, b) => (a.birthYear ?? 9999) - (b.birthYear ?? 9999))
                      .map((m) => (
                        <li key={m.id}>
                          <Link href={`/masters/${m.slug}`}>
                            {nameMap.get(m.id) ?? m.slug}
                          </Link>
                          <span className="detail-list-meta">{formatDates(m)}</span>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        )}

        {descendantLayers.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">
              Disciples and descendants of {name}
            </h3>
            <ol className="detail-link-list">
              {descendantLayers.map((layer, i) => (
                <li key={`desc-${i}`}>
                  <p className="detail-list-meta">
                    {i + 1} generation{i === 0 ? "" : "s"} below
                  </p>
                  <ul className="detail-link-list" style={{ marginTop: "0.4rem" }}>
                    {layer
                      .slice()
                      .sort((a, b) => (a.birthYear ?? 9999) - (b.birthYear ?? 9999))
                      .map((m) => (
                        <li key={m.id}>
                          <Link href={`/masters/${m.slug}`}>
                            {nameMap.get(m.id) ?? m.slug}
                          </Link>
                          <span className="detail-list-meta">{formatDates(m)}</span>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        )}

        {ancestorLayers.length === 0 && descendantLayers.length === 0 && (
          <section className="detail-card">
            <p className="detail-muted">
              No transmission edges recorded for {name} yet — this master
              appears in the encyclopedia but their lineage links are not
              yet in the dataset.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
