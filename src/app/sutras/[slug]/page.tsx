import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  citations,
  sources,
  teachingContent,
  teachings,
} from "@/db/schema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import SutraReader, {
  type SutraTranslation,
} from "@/components/SutraReader";
import { abs, breadcrumbSchema, jsonLdString } from "@/lib/seo/jsonld";
import {
  getDefaultTranslationSlug,
  getSutraEntry,
  getSutraRegistry,
} from "@/lib/sutra-registry";

export async function generateStaticParams() {
  return getSutraRegistry().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getSutraEntry(slug);
  if (!entry) return {};
  const canonicalUrl = abs(`/sutras/${slug}`);
  const titleWithNative = `${entry.title} (${entry.nativeTitle})`;
  return {
    title: titleWithNative,
    description: entry.gloss,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${titleWithNative} — Zen sūtra`,
      description: entry.gloss,
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${titleWithNative} — Zen Lineage`,
      description: entry.gloss,
    },
  };
}

export default async function SutraDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getSutraEntry(slug);
  if (!entry) notFound();

  // Pull every translation of this sūtra in any locale — original
  // languages (zh-Hant, sa-Latn, ja-Latn) ride alongside the English
  // ones so a reader can flip between them.
  const rows = await db
    .select({
      teachingId: teachings.id,
      slug: teachings.slug,
      title: teachingContent.title,
      content: teachingContent.content,
      translator: teachingContent.translator,
      edition: teachingContent.edition,
      licenseStatus: teachingContent.licenseStatus,
      locale: teachingContent.locale,
    })
    .from(teachings)
    .innerJoin(
      teachingContent,
      eq(teachingContent.teachingId, teachings.id)
    )
    .where(
      and(
        eq(teachings.type, "sutra"),
        eq(teachings.collection, entry.collection)
      )
    );

  if (rows.length === 0) {
    return (
      <main className="detail-page">
        <header className="page-header">
          <Link href="/" className="nav-link">
            禅
          </Link>
          <Link href="/sutras" className="nav-link">
            Sūtras
          </Link>
          <h1 className="page-title">{entry.title}</h1>
        </header>
        <div className="detail-layout">
          <p className="detail-muted">
            No translations of {entry.title} have been seeded yet.
          </p>
        </div>
      </main>
    );
  }

  const teachingIds = rows.map((r) => r.teachingId);
  const sourceRows =
    teachingIds.length > 0
      ? await db
          .select({
            entityId: citations.entityId,
            sourceId: citations.sourceId,
            pageOrSection: citations.pageOrSection,
            sourceTitle: sources.title,
            sourceUrl: sources.url,
          })
          .from(citations)
          .innerJoin(sources, eq(sources.id, citations.sourceId))
          .where(
            and(
              eq(citations.entityType, "teaching"),
              inArray(citations.entityId, teachingIds),
              eq(citations.fieldName, "content"),
              isNotNull(sources.url)
            )
          )
      : [];

  const sourceByTeachingId = new Map<
    string,
    { title: string; url: string | null; locator: string }
  >();
  for (const row of sourceRows) {
    if (sourceByTeachingId.has(row.entityId)) continue;
    sourceByTeachingId.set(row.entityId, {
      title: row.sourceTitle ?? row.sourceId,
      url: row.sourceUrl ?? null,
      locator: row.pageOrSection ?? "",
    });
  }

  const rowBySlug = new Map(rows.map((r) => [r.slug, r]));
  const translations: SutraTranslation[] = entry.translations
    .map((order) => {
      const row = rowBySlug.get(order.slug);
      if (!row) return null;
      return {
        slug: row.slug,
        chipLabel: order.chipLabel,
        langLabel: order.langLabel,
        language: order.language,
        fullLabel: `${row.translator ?? "Unknown"} (${row.edition ?? ""})`,
        translator: row.translator ?? "Unknown",
        edition: row.edition ?? "",
        licenseStatus: row.licenseStatus ?? "public_domain",
        content: row.content,
        source:
          sourceByTeachingId.get(row.teachingId) ??
          { title: row.edition ?? "Edition", url: null, locator: "" },
      } satisfies SutraTranslation;
    })
    .filter((t): t is SutraTranslation => t !== null);

  const defaultTranslator =
    getDefaultTranslationSlug(entry) ??
    translations[0]?.slug ??
    rows[0].slug;
  const canonicalUrl = abs(`/sutras/${slug}`);

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", url: abs("/") },
    { name: "Sūtras", url: abs("/sutras") },
    { name: entry.title, url: canonicalUrl },
  ]);

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
        <Link href="/sutras" className="nav-link">
          Sūtras
        </Link>
        <h1 className="page-title">{entry.title}</h1>
      </header>
      <Breadcrumbs
        trail={[
          { name: "Home", href: "/" },
          { name: "Sūtras", href: "/sutras" },
          { name: entry.title },
        ]}
      />

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">Mahāyāna sūtra</p>
          <h2 className="detail-title">{entry.title}</h2>
          <p className="detail-native-names" lang="zh">
            {entry.nativeTitle}
          </p>
          <div className="detail-summary">
            <p>{entry.gloss}</p>
          </div>
        </section>

        <section className="detail-card sutra-reader-card">
          <SutraReader
            sutraTitle={entry.title}
            translations={translations}
            defaultTranslator={defaultTranslator}
          />
        </section>
      </div>
    </main>
  );
}
