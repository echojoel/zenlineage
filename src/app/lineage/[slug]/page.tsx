import type { Metadata } from "next";
import Link from "@/components/Link";
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
import {
  getLineageGraph,
  successionChain,
  type LineageMaster,
  type LineageTeaching,
} from "@/lib/lineage-context";

const ANCESTOR_DEPTH = 12; // walk up the entire chain — Zen lineages
                           // are deep but finite (~28 patriarchs)
const DESCENDANT_DEPTH = 3; // tree expands fast going down; cap to 3

export async function generateStaticParams() {
  const all = await db.select({ slug: masters.slug }).from(masters).where(eq(masters.published, true));
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
    .where(and(eq(masters.slug, slug), eq(masters.published, true)))
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
    .where(and(inArray(masters.id, ids), eq(masters.published, true)));
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

/**
 * A generation of the walk. `depth` is the true distance from the subject,
 * carried explicitly because empty generations are dropped from the list:
 * traversal continues through masters outside the published set, but they
 * must not appear, so array position no longer equals generation number.
 */
interface Generation {
  depth: number;
  masters: MasterRow[];
}

async function walkAncestors(rootId: string, maxDepth: number): Promise<Generation[]> {
  // Returns generations: [direct teachers, grand-teachers, ...]. BFS up the
  // graph through master_transmissions where root is the student.
  const layers: Generation[] = [];
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
    // Keep walking past a generation with nothing published — an unpublished
    // teacher between two published ones must not truncate the chain — but
    // never emit the empty generation itself, which rendered as a bare
    // "N generations above" heading with no names beneath it.
    if (masters.length > 0) layers.push({ depth: depth + 1, masters });
    frontier = nextIds;
  }
  return layers;
}

async function walkDescendants(rootId: string, maxDepth: number): Promise<Generation[]> {
  const layers: Generation[] = [];
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
    if (masters.length > 0) layers.push({ depth: depth + 1, masters });
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
    for (const m of layer.masters) allIds.add(m.id);
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

  const graph = await getLineageGraph();
  const chain = successionChain(graph, master.id);
  const teachingList = graph.teachingsByAuthor.get(master.id) ?? [];
  const successorsOutOfScope = graph.successorsBeyondScope.has(master.id);

  return {
    master,
    ancestorLayers,
    descendantLayers,
    nameMap,
    schoolInfo,
    chain,
    teachingList,
    successorsOutOfScope,
  };
}

/**
 * A sentence naming the actual people in this master's line.
 *
 * These 466 pages previously shared one templated skeleton and ~143 words,
 * which reads to a search engine as near-duplicate boilerplate at scale.
 * Naming the immediate teacher, the depth of the succession and the root it
 * descends from makes each page's prose genuinely about its own subject.
 */
function successionSentence(
  name: string,
  chain: LineageMaster[],
  schoolName: string | null
): string | null {
  if (chain.length === 0) return null;

  const root = chain[0];
  const teacher = chain[chain.length - 1];
  const school = schoolName ? ` in the ${schoolName} line` : "";

  if (chain.length === 1) {
    return `${name} received transmission from ${root.name}${school}.`;
  }
  return (
    `${name} stands ${chain.length} generation${chain.length === 1 ? "" : "s"} ` +
    `from ${root.name}${school}, receiving transmission from ${teacher.name}` +
    `${formatDates(teacher) ? ` (${formatDates(teacher)})` : ""}. ` +
    `The line above runs back through ${chain
      .slice(1, -1)
      .slice(-3)
      .map((m) => m.name)
      .join(", ")}${chain.length > 4 ? " and their predecessors" : ""} to ${root.name}.`
  );
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

  const ancestorCount = ancestorLayers.reduce((n, l) => n + l.masters.length, 0);
  const descendantCount = descendantLayers.reduce((n, l) => n + l.masters.length, 0);
  const dates = formatDates(master);
  const teacher = data.chain.length > 0 ? data.chain[data.chain.length - 1] : null;
  // Naming the teacher keeps these 466 descriptions distinct from one
  // another and matches how people actually search ("<master> lineage",
  // "who was <master>'s teacher").
  const description =
    `Dharma lineage of ${name}${dates ? ` (${dates})` : ""}${
      schoolInfo ? `, ${schoolInfo.name}` : ""
    }${teacher ? ` — transmission received from ${teacher.name}` : ""}. ` +
    `${ancestorCount} teachers and ancestors, ${descendantCount} students and descendants traced through transmission.`;

  const canonicalUrl = abs(`/lineage/${slug}`);
  return {
    // `absolute` rather than a plain string: the parent /lineage layout sets
    // its own title, and the root template was not reaching this route (built
    // pages emitted a bare "Lineage of X"). Stating the final string outright
    // means the brand is present without risking a doubled suffix.
    title: { absolute: `Lineage of ${name} — Zen Lineage` },
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
  const {
    master,
    ancestorLayers,
    descendantLayers,
    nameMap,
    schoolInfo,
    chain,
    teachingList,
    successorsOutOfScope,
  } = data;
  const name = nameMap.get(master.id) ?? master.slug;
  const prose = successionSentence(name, chain, schoolInfo?.name ?? null);

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
            {ancestorLayers.reduce((n, l) => n + l.masters.length, 0)} teachers and
            ancestors,{" "}
            {descendantLayers.reduce((n, l) => n + l.masters.length, 0)} students and
            descendants traced
            through transmission.
          </p>
          {prose && <p className="detail-prose">{prose}</p>}
          {schoolInfo && (
            <p className="detail-prose">
              This line belongs to{" "}
              <Link href={`/schools/${schoolInfo.slug}`}>{schoolInfo.name}</Link>.
              Every name below links to that master&rsquo;s own record, with the
              sources for each transmission.
            </p>
          )}
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

        {chain.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">
              Line of succession to {name}
            </h3>
            <p className="detail-muted">
              The single line of formal transmission, root first. Where a master
              had several teachers this follows the one carrying the succession;
              the fuller set of ancestors is listed below.
            </p>
            <ol className="detail-link-list lineage-succession">
              {chain.map((m, i) => (
                <li key={m.id}>
                  <span className="detail-list-meta">{i + 1}.</span>{" "}
                  <Link href={`/masters/${m.slug}`}>{m.name}</Link>
                  <span className="detail-list-meta">{formatDates(m)}</span>
                </li>
              ))}
              <li>
                <span className="detail-list-meta">{chain.length + 1}.</span>{" "}
                <strong>{name}</strong>
                <span className="detail-list-meta">{formatDates(master)}</span>
              </li>
            </ol>
          </section>
        )}

        {teachingList.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">
              Teachings attributed to {name}
            </h3>
            <ul className="detail-link-list">
              {teachingList.map((t: LineageTeaching) => (
                <li key={t.slug}>
                  <Link href={`/teachings/${t.slug}`}>{t.title}</Link>
                  {t.type && <span className="detail-list-meta">{t.type}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {ancestorsTopDown.length > 0 && (
          <section className="detail-card">
            <h3 className="detail-section-title">
              Ancestors of {name}
            </h3>
            <ol className="detail-link-list">
              {ancestorsTopDown.map((layer) => (
                <li key={`anc-${layer.depth}`}>
                  <p className="detail-list-meta">
                    {layer.depth} generation
                    {layer.depth === 1 ? "" : "s"} above
                  </p>
                  <ul className="detail-link-list" style={{ marginTop: "0.4rem" }}>
                    {layer.masters
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
              {descendantLayers.map((layer) => (
                <li key={`desc-${layer.depth}`}>
                  <p className="detail-list-meta">
                    {layer.depth} generation{layer.depth === 1 ? "" : "s"} below
                  </p>
                  <ul className="detail-link-list" style={{ marginTop: "0.4rem" }}>
                    {layer.masters
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

        {descendantLayers.length === 0 && successorsOutOfScope && (
          <section className="detail-card">
            <h3 className="detail-section-title">
              Successors of {name}
            </h3>
            <p className="detail-muted">
              {name} transmitted the dharma onward, but this atlas charts the
              ancestral lineage up to the teachers who carried these traditions
              out of Asia. Their successors continue a living tradition we do
              not attempt to chart here, so no descendants are shown.
            </p>
          </section>
        )}

        {ancestorLayers.length === 0 &&
          descendantLayers.length === 0 &&
          !successorsOutOfScope && (
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
