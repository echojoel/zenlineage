import type { Metadata } from "next";
import { db } from "@/db";
import {
  teachings,
  teachingContent,
  teachingMasterRoles,
  teachingThemes,
  themes,
  themeNames,
  masters,
  masterNames,
  schoolNames as schoolNamesTable,
  citations,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import ProverbsClient from "@/components/ProverbsClient";
import { buildCitationKeySet, isPublishedTeaching } from "@/lib/publishable-content";

export interface ProverbListItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  era: string | null;
  attributedSlug: string | null;
  attributedName: string | null;
  schoolId: string | null;
  themes: { slug: string; name: string }[];
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const metadata: Metadata = {
  title: "Proverbs",
  description:
    "Zen proverbs, koans, and sayings with attribution — from Bodhidharma and Huineng to Dōgen, Hakuin, and modern teachers.",
  alternates: { canonical: "https://zenlineage.org/proverbs" },
  openGraph: {
    title: "Zen Proverbs & Teachings — Zen Lineage",
    description:
      "Zen proverbs, koans, and sayings with attribution across the Chan and Zen tradition.",
    url: "https://zenlineage.org/proverbs",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Zen Proverbs & Teachings — Zen Lineage",
    description: "Zen proverbs, koans, and sayings with attribution.",
  },
};

export default async function ProverbsPage({
  searchParams,
}: {
  searchParams: Promise<{ highlight?: string }>;
}) {
  const { highlight } = await searchParams;
  // 1. Fetch all proverb teachings with content
  const proverbRows = await db
    .select({
      id: teachings.id,
      slug: teachings.slug,
      era: teachings.era,
      authorId: teachings.authorId,
      attributionStatus: teachings.attributionStatus,
      title: teachingContent.title,
      content: teachingContent.content,
    })
    .from(teachings)
    .innerJoin(
      teachingContent,
      and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
    )
    .where(eq(teachings.type, "proverb"));

  // 2. Check citation-based publishability
  const citationRows = await db
    .select({
      entityType: citations.entityType,
      entityId: citations.entityId,
    })
    .from(citations)
    .where(eq(citations.entityType, "teaching"));
  const citationKeys = buildCitationKeySet(citationRows);

  const publishedProverbs = proverbRows.filter((p) =>
    isPublishedTeaching({ id: p.id }, citationKeys)
  );

  const proverbIds = publishedProverbs.map((p) => p.id);

  // 3. Fetch all masters (for author lookups)
  const masterRows = await db
    .select({
      id: masters.id,
      slug: masters.slug,
      schoolId: masters.schoolId,
    })
    .from(masters);
  const masterMap = new Map(masterRows.map((m) => [m.id, m]));

  // 4. Fetch master names
  const masterNameRows = await db
    .select({
      masterId: masterNames.masterId,
      value: masterNames.value,
      nameType: masterNames.nameType,
    })
    .from(masterNames)
    .where(eq(masterNames.locale, "en"));

  const masterNameMap = new Map<string, string>();
  for (const n of masterNameRows) {
    if (n.nameType === "dharma" && !masterNameMap.has(n.masterId)) {
      masterNameMap.set(n.masterId, n.value);
    }
  }
  for (const n of masterNameRows) {
    if (!masterNameMap.has(n.masterId)) {
      masterNameMap.set(n.masterId, n.value);
    }
  }

  // Build slug→masterId reverse map
  const slugToMasterId = new Map<string, string>();
  for (const m of masterRows) {
    slugToMasterId.set(m.slug, m.id);
  }

  // 5. Fetch master_roles for proverbs
  const roleRows = await db
    .select({
      teachingId: teachingMasterRoles.teachingId,
      masterId: teachingMasterRoles.masterId,
      role: teachingMasterRoles.role,
    })
    .from(teachingMasterRoles);

  const proverbRoles = new Map<string, { masterId: string; role: string }[]>();
  for (const r of roleRows) {
    if (!proverbIds.includes(r.teachingId)) continue;
    const list = proverbRoles.get(r.teachingId) ?? [];
    list.push({ masterId: r.masterId, role: r.role });
    proverbRoles.set(r.teachingId, list);
  }

  // 6. Fetch themes for each proverb
  const themeJoinRows = await db
    .select({
      teachingId: teachingThemes.teachingId,
      themeSlug: themes.slug,
      themeName: themeNames.value,
    })
    .from(teachingThemes)
    .innerJoin(themes, eq(themes.id, teachingThemes.themeId))
    .innerJoin(themeNames, and(eq(themeNames.themeId, themes.id), eq(themeNames.locale, "en")));

  const themeMap = new Map<string, { slug: string; name: string }[]>();
  for (const row of themeJoinRows) {
    const list = themeMap.get(row.teachingId) ?? [];
    list.push({ slug: row.themeSlug, name: row.themeName });
    themeMap.set(row.teachingId, list);
  }

  // 7. Fetch all themes for filter UI
  const allThemes = await db
    .select({
      slug: themes.slug,
      name: themeNames.value,
      sortOrder: themes.sortOrder,
    })
    .from(themes)
    .innerJoin(themeNames, and(eq(themeNames.themeId, themes.id), eq(themeNames.locale, "en")))
    .orderBy(themes.sortOrder);

  // 8. Fetch school names for filter UI
  const schoolNameRows = await db
    .select({
      schoolId: schoolNamesTable.schoolId,
      value: schoolNamesTable.value,
    })
    .from(schoolNamesTable)
    .where(eq(schoolNamesTable.locale, "en"));

  const schoolNameRecord: Record<string, string> = Object.fromEntries(
    schoolNameRows.map((s) => [s.schoolId, s.value])
  );

  // Placeholder author slugs that should show as "Traditional"
  const placeholderSlugs = new Set(["shakyamuni-buddha"]);

  // 9. Assemble items
  const items: ProverbListItem[] = publishedProverbs.map((p) => {
    const roles = proverbRoles.get(p.id) ?? [];
    const master = p.authorId ? masterMap.get(p.authorId) : null;

    // Resolve attributed master:
    // 1. Check master_roles for an "attributed_to" or "speaker" entry
    // 2. Fall back to authorId if it's not a placeholder
    let attributedSlug: string | null = null;
    let attributedName: string | null = null;
    let schoolId: string | null = null;

    if (roles.length > 0) {
      const role = roles[0];
      const roleMaster = masterMap.get(role.masterId);
      if (roleMaster) {
        attributedSlug = roleMaster.slug;
        attributedName = masterNameMap.get(role.masterId) ?? roleMaster.slug;
        schoolId = roleMaster.schoolId;
      }
    } else if (master && !placeholderSlugs.has(master.slug)) {
      attributedSlug = master.slug;
      attributedName = masterNameMap.get(p.authorId!) ?? master.slug;
      schoolId = master.schoolId;
    }

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      content: p.content,
      era: p.era,
      attributedSlug,
      attributedName,
      schoolId,
      themes: themeMap.get(p.id) ?? [],
    };
  });

  // 10. Shuffle the proverbs, then float the highlighted slug to the
  // top so a click from the homepage lands on its proverb without the
  // user having to scroll or search.
  let shuffled = shuffle(items);
  const highlightSlug = highlight && items.some((p) => p.slug === highlight)
    ? highlight
    : null;
  if (highlightSlug) {
    shuffled = [
      ...shuffled.filter((p) => p.slug === highlightSlug),
      ...shuffled.filter((p) => p.slug !== highlightSlug),
    ];
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zenlineage.org" },
      {
        "@type": "ListItem",
        position: 2,
        name: "Proverbs",
        item: "https://zenlineage.org/proverbs",
      },
    ],
  };

  return (
    <div style={{ background: "var(--paper)", minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">Proverbs</h1>
      </header>
      <ProverbsClient
        proverbs={shuffled}
        allThemes={allThemes}
        schoolNames={schoolNameRecord}
        highlightSlug={highlightSlug}
      />
    </div>
  );
}
