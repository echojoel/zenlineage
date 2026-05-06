import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  masterNames,
  masters,
  teachingContent,
  teachingMasterRoles,
  teachingThemes,
  teachings,
  themeNames,
  themes,
} from "@/db/schema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  abs,
  breadcrumbSchema,
  jsonLdString,
  type JsonLdNode,
} from "@/lib/seo/jsonld";

export async function generateStaticParams() {
  const all = await db.select({ slug: themes.slug }).from(themes);
  return all.map((t) => ({ slug: t.slug }));
}

async function loadTheme(slug: string) {
  const themeRows = await db
    .select({ id: themes.id, slug: themes.slug })
    .from(themes)
    .where(eq(themes.slug, slug))
    .limit(1);
  const theme = themeRows[0];
  if (!theme) return null;

  const nameRow = await db
    .select({ value: themeNames.value })
    .from(themeNames)
    .where(and(eq(themeNames.themeId, theme.id), eq(themeNames.locale, "en")))
    .limit(1);
  const themeName = nameRow[0]?.value ?? slug;

  const proverbRows = await db
    .select({
      id: teachings.id,
      slug: teachings.slug,
      type: teachings.type,
      authorId: teachings.authorId,
      era: teachings.era,
      title: teachingContent.title,
      content: teachingContent.content,
    })
    .from(teachings)
    .innerJoin(
      teachingThemes,
      and(
        eq(teachingThemes.teachingId, teachings.id),
        eq(teachingThemes.themeId, theme.id)
      )
    )
    .innerJoin(
      teachingContent,
      and(eq(teachingContent.teachingId, teachings.id), eq(teachingContent.locale, "en"))
    );

  // Citation gate — same publish rule used elsewhere.
  const teachingIds = proverbRows.map((p) => p.id);
  const cited =
    teachingIds.length > 0
      ? new Set(
          (
            await db
              .select({ entityId: citations.entityId })
              .from(citations)
              .where(
                and(
                  eq(citations.entityType, "teaching"),
                  inArray(citations.entityId, teachingIds)
                )
              )
          ).map((r) => r.entityId)
        )
      : new Set<string>();
  const published = proverbRows.filter((p) => cited.has(p.id));

  // Author names (for attribution lines + JSON-LD).
  const authorIds = Array.from(
    new Set(published.map((p) => p.authorId).filter((id): id is string => Boolean(id)))
  );
  const authorMap = new Map<string, { slug: string; name: string }>();
  if (authorIds.length > 0) {
    const masterRows = await db
      .select({ id: masters.id, slug: masters.slug })
      .from(masters)
      .where(inArray(masters.id, authorIds));
    const nameRows = await db
      .select({
        masterId: masterNames.masterId,
        nameType: masterNames.nameType,
        value: masterNames.value,
      })
      .from(masterNames)
      .where(and(inArray(masterNames.masterId, authorIds), eq(masterNames.locale, "en")));
    const dharmaName = new Map<string, string>();
    for (const r of nameRows) {
      if (r.nameType === "dharma" && !dharmaName.has(r.masterId)) {
        dharmaName.set(r.masterId, r.value);
      }
    }
    for (const r of nameRows) {
      if (!dharmaName.has(r.masterId)) dharmaName.set(r.masterId, r.value);
    }
    for (const m of masterRows) {
      authorMap.set(m.id, {
        slug: m.slug,
        name: dharmaName.get(m.id) ?? m.slug,
      });
    }
  }

  return { theme, themeName, published, authorMap };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadTheme(slug);
  if (!data) return {};
  const { themeName, published } = data;

  const description = `${published.length} Zen proverbs and sayings on the theme of ${themeName.toLowerCase()} — gathered from masters across the Chan, Zen, Sŏn, and Thiền traditions, each with attribution and source.`;
  const canonicalUrl = abs(`/proverbs/themes/${slug}`);
  return {
    title: `${themeName} — Zen proverbs and sayings`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${themeName} in Zen — proverbs and sayings`,
      description,
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${themeName} — Zen proverbs`,
      description,
    },
  };
}

export default async function ThemeProverbsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadTheme(slug);
  if (!data) notFound();
  const { themeName, published, authorMap } = data;

  const canonicalUrl = abs(`/proverbs/themes/${slug}`);

  const itemListLd: JsonLdNode = {
    "@type": "ItemList",
    "@id": `${canonicalUrl}#proverbs`,
    name: `${themeName} — Zen proverbs and sayings`,
    numberOfItems: published.length,
    itemListElement: published.slice(0, 100).map((p, i) => {
      const author = p.authorId ? authorMap.get(p.authorId) : null;
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Quotation",
          "@id": abs(`/teachings/${p.slug}`),
          url: abs(`/teachings/${p.slug}`),
          name: p.title ?? p.slug,
          ...(p.content ? { text: p.content } : {}),
          ...(author
            ? {
                spokenByCharacter: {
                  "@type": "Person",
                  name: author.name,
                  url: abs(`/masters/${author.slug}`),
                },
              }
            : {}),
        },
      };
    }),
  };

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: abs("/") },
    { name: "Proverbs", url: abs("/proverbs") },
    { name: themeName, url: canonicalUrl },
  ]);

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString([itemListLd, breadcrumbLd]) }}
      />
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <Link href="/proverbs" className="nav-link">
          Proverbs
        </Link>
        <h1 className="page-title">{themeName}</h1>
      </header>
      <Breadcrumbs
        trail={[
          { name: "Home", href: "/" },
          { name: "Proverbs", href: "/proverbs" },
          { name: themeName },
        ]}
      />

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">Theme</p>
          <h2 className="detail-title">{themeName}</h2>
          <p className="detail-subtitle">
            {published.length}{" "}
            {published.length === 1 ? "proverb" : "proverbs and sayings"} on the
            theme of {themeName.toLowerCase()}.
          </p>
        </section>

        <section className="detail-card">
          <ul className="detail-source-list">
            {published.map((p) => {
              const author = p.authorId ? authorMap.get(p.authorId) : null;
              return (
                <li key={p.id}>
                  <div className="detail-source-heading">
                    <Link
                      href={`/teachings/${p.slug}`}
                      className="detail-inline-link"
                    >
                      {p.title ?? p.slug}
                    </Link>
                    {author && (
                      <Link
                        href={`/masters/${author.slug}`}
                        className="detail-inline-link"
                      >
                        {author.name}
                      </Link>
                    )}
                  </div>
                  {p.content && (
                    <p
                      className="detail-source-excerpt"
                      style={{ fontStyle: "italic" }}
                    >
                      {p.content.length > 320
                        ? p.content.slice(0, 320) + "…"
                        : p.content}
                    </p>
                  )}
                  {p.era && (
                    <p className="detail-list-meta">{p.era}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
