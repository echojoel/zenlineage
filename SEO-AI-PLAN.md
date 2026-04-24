# Zen Lineage — SEO & AI-Friendliness Plan

**Date:** March 20, 2026
**Current state:** Next.js 16 static export, Cloudflare Pages, no sitemap, no robots.txt, no structured data, no llms.txt

---

## Current State Audit

### What exists

| Feature | Status |
|---------|--------|
| `<html lang="en">` | ✅ Set in layout.tsx |
| Page `<title>` | ⚠️ Only 3 of 8 routes set per-page titles (About, Timeline, root layout default) |
| `<meta description>` | ⚠️ Only 3 of 8 routes have descriptions |
| OpenGraph tags | ❌ None |
| Twitter Card tags | ❌ None |
| Canonical URLs | ❌ None |
| Sitemap.xml | ❌ None |
| Robots.txt | ❌ None |
| JSON-LD structured data | ❌ None |
| BreadcrumbList | ❌ None (breadcrumb-style nav exists visually but not as structured data) |
| llms.txt | ❌ None |
| Alt text on images | ✅ Good — all images have descriptive alt text |
| Semantic HTML | ✅ Good — proper use of `<main>`, `<header>`, `<nav>`, `<section>`, `<h1>`-`<h4>`, `<blockquote>` |
| Internal linking | ✅ Good — masters link to schools, teachers, students, lineage graph |
| favicon.ico | ✅ Present |
| Mobile responsive | ✅ CSS handles responsive layouts |

### What's missing (by impact)

1. **Per-page metadata** — most pages inherit the generic "Zen Lineage" title
2. **Sitemap.xml** — search engines can't discover all 400+ master pages or 23 school pages
3. **Robots.txt** — no crawl guidance at all
4. **Structured data** — no JSON-LD for Person, Article, BreadcrumbList, or WebSite
5. **OpenGraph / Twitter cards** — no social sharing previews
6. **Canonical URLs** — no self-referencing canonicals
7. **llms.txt** — no AI-specific content summary
8. **Machine-readable API** — no JSON endpoints for programmatic access

---

## Implementation Plan

### Priority 1: HIGH — Foundational SEO (Effort: 1-2 days)

#### 1.1 Per-page metadata via Next.js Metadata API

Every route needs its own `export const metadata` or `generateMetadata()`. Currently only `about/page.tsx` and `timeline/page.tsx` export metadata. The dynamic routes (`masters/[slug]`, `schools/[slug]`) should use `generateMetadata()`.

**Files to change:**

- `src/app/layout.tsx` — Add `metadataBase`, default OG image, site-wide defaults
- `src/app/page.tsx` — Add home-specific metadata
- `src/app/masters/page.tsx` — Add list page metadata
- `src/app/masters/[slug]/page.tsx` — Add `generateMetadata()` with master name, dates, school, biography excerpt
- `src/app/schools/page.tsx` — Add list page metadata
- `src/app/schools/[slug]/page.tsx` — Add `generateMetadata()` with school name, tradition, master count
- `src/app/proverbs/page.tsx` — Add metadata
- `src/app/lineage/page.tsx` — Add metadata

**Example for `masters/[slug]/page.tsx`:**

```typescript
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const master = await db.select({ ... }).from(masters).where(eq(masters.slug, slug)).limit(1);
  if (!master[0]) return {};

  const name = /* resolve dharma name */;
  const description = /* first 160 chars of biography or fallback */;

  return {
    title: `${name} — Zen Lineage`,
    description,
    openGraph: {
      title: `${name} — Zen Buddhist Master`,
      description,
      type: "profile",
      url: `https://zenlineage.org/masters/${slug}`,
      images: publishedImage ? [`https://zenlineage.org${publishedImage.src}`] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Zen Lineage`,
      description,
    },
    alternates: {
      canonical: `https://zenlineage.org/masters/${slug}`,
    },
  };
}
```

**Effort:** ~3 hours

#### 1.2 Sitemap.xml

Next.js supports sitemap generation via `app/sitemap.ts`. This is critical — without it, search engines can't discover the 400+ dynamically generated master pages.

**Create `src/app/sitemap.ts`:**

```typescript
import type { MetadataRoute } from "next";
import { db } from "@/db";
import { masters, schools } from "@/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const allMasters = await db.select({ slug: masters.slug }).from(masters);
  const allSchools = await db.select({ slug: schools.slug }).from(schools);

  const staticPages = [
    { url: "https://zenlineage.org", changeFrequency: "weekly" as const, priority: 1.0 },
    { url: "https://zenlineage.org/masters", changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "https://zenlineage.org/schools", changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "https://zenlineage.org/lineage", changeFrequency: "weekly" as const, priority: 0.9 },
    { url: "https://zenlineage.org/proverbs", changeFrequency: "weekly" as const, priority: 0.8 },
    { url: "https://zenlineage.org/timeline", changeFrequency: "monthly" as const, priority: 0.8 },
    { url: "https://zenlineage.org/about", changeFrequency: "monthly" as const, priority: 0.7 },
  ];

  const masterPages = allMasters.map((m) => ({
    url: `https://zenlineage.org/masters/${m.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const schoolPages = allSchools.map((s) => ({
    url: `https://zenlineage.org/schools/${s.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...masterPages, ...schoolPages];
}
```

**Effort:** ~30 minutes

#### 1.3 Robots.txt

**Create `src/app/robots.ts`:**

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/data/"],
      },
    ],
    sitemap: "https://zenlineage.org/sitemap.xml",
  };
}
```

**Effort:** ~10 minutes

#### 1.4 Layout-level metadata defaults

**Update `src/app/layout.tsx`:**

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://zenlineage.org"),
  title: {
    default: "Zen Lineage",
    template: "%s — Zen Lineage",
  },
  description: "An interactive encyclopedia of Zen Buddhism — lineage explorer, masters, schools, and teachings across 2,500 years of Chan/Zen history.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zenlineage.org",
    siteName: "Zen Lineage",
    title: "Zen Lineage",
    description: "An interactive encyclopedia of Zen Buddhism — lineage explorer, masters, schools, and teachings across 2,500 years of Chan/Zen history.",
  },
  twitter: {
    card: "summary",
    title: "Zen Lineage",
    description: "An interactive encyclopedia of Zen Buddhism.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**Effort:** ~15 minutes

---

### Priority 2: HIGH — Structured Data / JSON-LD (Effort: 1 day)

JSON-LD enables rich results in Google, powers AI Overviews, and makes content machine-readable. This is the highest-value SEO + AI improvement.

#### 2.1 WebSite schema on home page

Add to `src/app/page.tsx`:

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Zen Lineage",
  url: "https://zenlineage.org",
  description: "An interactive encyclopedia of Zen Buddhism...",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://zenlineage.org/masters?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

// In the JSX:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
/>
```

#### 2.2 Person schema on master detail pages

Each `/masters/[slug]` page should emit a Person JSON-LD block. This is the most impactful structured data for this site — 400+ historical figures with dates, affiliations, teachers, and students.

```typescript
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: primaryName,
  alternateName: orderedNames.filter(n => n.value !== primaryName).map(n => n.value),
  url: `https://zenlineage.org/masters/${master.slug}`,
  image: publishedImage ? `https://zenlineage.org${publishedImage.src}` : undefined,
  birthDate: master.birthYear ? String(master.birthYear) : undefined,
  deathDate: master.deathYear ? String(master.deathYear) : undefined,
  description: publishedBiography?.slice(0, 200) ?? `${primaryName}, a Zen Buddhist master.`,
  memberOf: schoolRow ? {
    "@type": "Organization",
    name: schoolRow.name,
    url: `https://zenlineage.org/schools/${schoolRow.slug}`,
  } : undefined,
  knows: [
    ...teachers.map(t => ({
      "@type": "Person",
      name: nameMap.get(t.counterpartId) ?? t.counterpartSlug,
      url: `https://zenlineage.org/masters/${t.counterpartSlug}`,
    })),
    ...students.map(s => ({
      "@type": "Person",
      name: nameMap.get(s.counterpartId) ?? s.counterpartSlug,
      url: `https://zenlineage.org/masters/${s.counterpartSlug}`,
    })),
  ],
};
```

#### 2.3 BreadcrumbList on all pages

Every page has visual breadcrumbs (禅 → Masters → Dōgen). Add structured data to match:

```typescript
const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://zenlineage.org" },
    { "@type": "ListItem", position: 2, name: "Masters", item: "https://zenlineage.org/masters" },
    { "@type": "ListItem", position: 3, name: primaryName },
  ],
};
```

#### 2.4 Article schema on About page

The About page is a substantial article with scholarly citations — perfect for Article schema:

```typescript
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What is Zen Buddhism?",
  description: "A precise introduction to the history, practice, and philosophy of Chan/Zen...",
  url: "https://zenlineage.org/about",
  author: { "@type": "Person", name: "Joel" },
  publisher: { "@type": "Organization", name: "Zen Lineage" },
  datePublished: "2025-01-01",
  image: "https://zenlineage.org/about-enso.webp",
};
```

#### 2.5 ItemList schema on list pages

The Masters and Schools list pages should use `ItemList` schema so search engines understand these are navigational indexes:

```typescript
const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Zen Buddhist Masters",
  numberOfItems: items.length,
  itemListElement: items.slice(0, 50).map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `https://zenlineage.org/masters/${item.slug}`,
    name: item.primaryName,
  })),
};
```

**Effort:** ~6 hours total

---

### Priority 3: HIGH — AI-Friendliness (Effort: 0.5 days)

#### 3.1 Create `/llms.txt`

The llms.txt specification (proposed by Jeremy Howard / Answer.AI, adopted by 844K+ sites) provides AI assistants with a structured overview of your site in Markdown format.

**Create `public/llms.txt`:**

```markdown
# Zen Lineage

> An open-source interactive encyclopedia of Zen Buddhism covering 435+ masters,
> 23 schools, 436 lineage transmissions, 363 teachings, and 1,700+ scholarly
> citations across 2,500 years of Chan, Zen, Seon, and Thien Buddhist history.

Zen Lineage maps the dharma transmission lineages connecting Buddhist masters
from Shakyamuni Buddha through Bodhidharma to modern teachers. All content
requires item-level citations from scholarly sources before publication.

The project covers Chinese Chan, Japanese Zen (Rinzai, Soto, Obaku),
Korean Seon, and Vietnamese Thien traditions.

## Main Pages

- [Masters index](https://zenlineage.org/masters): Browse all 435+ masters chronologically with search
- [Schools index](https://zenlineage.org/schools): 23 school branches with master counts
- [Lineage graph](https://zenlineage.org/lineage): Interactive PixiJS visualization of transmission lineages
- [Proverbs](https://zenlineage.org/proverbs): Zen proverbs, koans, and sayings with attribution
- [Timeline](https://zenlineage.org/timeline): Chronological history from 500 BCE to present
- [About](https://zenlineage.org/about): Comprehensive introduction to Zen Buddhism with scholarly citations

## Data

- [Lineage graph data (JSON)](https://zenlineage.org/data/graph.json): Complete node/edge data for all masters and transmissions
- [Source code](https://github.com/echojoel/zenlineage): Full open-source repository

## Optional

- [About — etymology, practice, history](https://zenlineage.org/about): Detailed scholarly essay on Zen Buddhism
```

#### 3.2 Create `/llms-full.txt`

A build-time script that concatenates essential content into a single Markdown file. This should be generated during `prebuild` alongside `graph.json`.

**Create `scripts/generate-llms-full.ts`:**

This script should:
1. Query all masters with their names, dates, schools, biographies, teachers, and students
2. Query all schools with their descriptions and master lists
3. Query all published teachings/proverbs
4. Format everything as a single Markdown document
5. Write to `public/llms-full.txt`

Target size: under 100K tokens (roughly 400KB of text). For Zen Lineage with ~435 masters, this is achievable — each master entry would be ~200 words, totaling ~87K words.

**Structure:**

```markdown
# Zen Lineage — Complete Reference

> [site description]

## Masters

### Bodhidharma (Puti Damo)
- **School:** Early Chan
- **Dates:** c. 5th century CE
- **Teachers:** Prajñātāra
- **Students:** Dazu Huike
- **Biography:** [first paragraph of biography]

### Dazu Huike
[...]

## Schools

### Linji (Rinzai)
- **Tradition:** Chinese Chan / Japanese Zen
- **Founded by:** Linji Yixuan (d. 866)
- **Masters:** [list]
- **Practice:** [summary]

## Teachings & Proverbs

### "What is the sound of one hand?"
- **Attribution:** Hakuin Ekaku
- **Type:** Koan
[...]
```

**Effort:** ~4 hours

#### 3.3 Machine-readable JSON endpoints

The `public/data/graph.json` already exists and is excellent. Consider adding:

- `public/data/masters.json` — flat list of all masters with names, dates, school, slug
- `public/data/schools.json` — all schools with master counts

These can be generated alongside `graph.json` in the `generate-static-data.ts` script. They're useful for AI agents, researchers, and third-party integrations.

**Effort:** ~1 hour

---

### Priority 4: MEDIUM — Social Sharing & Discoverability (Effort: 0.5 days)

#### 4.1 OG Image generation

For social sharing to be compelling, each master page should have a unique OG image. Options:

**Option A — Static OG images at build time (recommended):**
Generate a simple branded image per master using `sharp` or `@vercel/og` during prebuild. Template: master name, dates, school, portrait (if available), on a branded background.

**Option B — Default OG image:**
A single `public/og-default.png` with the site logo and tagline. Lower effort but less compelling.

**Effort:** Option A: ~4 hours; Option B: ~30 minutes

#### 4.2 Favicon & Apple Touch Icon

Currently only `favicon.ico` exists. Add:
- `public/apple-touch-icon.png` (180x180)
- `public/favicon-32x32.png`
- `public/favicon-16x16.png`
- `public/site.webmanifest` (for PWA-lite)

Reference in layout.tsx via the `icons` metadata field.

**Effort:** ~1 hour

---

### Priority 5: MEDIUM — Content & Internal Linking (Effort: 1 day)

#### 5.1 "Related masters" section on detail pages

Currently each master page shows teachers and students but not "other masters in the same school" or "contemporaries (±50 years)." Adding these cross-links improves both SEO (internal link equity) and user discovery.

**Effort:** ~3 hours

#### 5.2 Footer with site-wide navigation

No page has a `<footer>` with links to all sections. A consistent footer improves crawlability and distributes link equity. Include: Masters, Schools, Lineage, Proverbs, Timeline, About, GitHub.

**Effort:** ~1 hour

#### 5.3 "Back to top" / next/prev navigation on master pages

For the 400+ master pages, add prev/next links (chronologically) to help crawlers discover adjacent pages. This creates a crawl chain that supplements the sitemap.

**Effort:** ~2 hours

---

### Priority 6: LOW — Performance & Core Web Vitals (Effort: 0.5 days)

#### 6.1 Image optimization

Currently `images: { unoptimized: true }` in next.config.ts (required for static export). The images are already WebP. Consider:
- Adding `width` and `height` attributes to all `<img>` tags to prevent CLS (Cumulative Layout Shift)
- Adding `loading="lazy"` to below-fold images
- The `eslint-disable @next/next/no-img-element` comments suggest native `<img>` is used instead of `<Image>`. Since this is static export, that's fine, but explicit dimensions would help CLS.

**Effort:** ~2 hours

#### 6.2 Font loading optimization

`Cormorant_Garamond` and `Inter` are loaded via `next/font/google` which inlines the font-face declarations. This is already optimized. Consider adding `display: "swap"` if not already set (Next.js defaults to swap for Google Fonts).

**Effort:** ~15 minutes to verify

#### 6.3 Preconnect hints

If any external resources are loaded (CDN fonts, analytics), add preconnect hints in the layout. Currently the site appears self-contained, so this may not be needed.

**Effort:** ~10 minutes

---

### Priority 7: LOW — Advanced AI Features (Effort: 1-2 days)

#### 7.1 Structured data for Quotations

The Proverbs page has 363 teachings with attribution. Each could use the `Quotation` schema type (or `CreativeWork` with `@type: "Quotation"`):

```json
{
  "@context": "https://schema.org",
  "@type": "Quotation",
  "text": "Before enlightenment, chop wood, carry water...",
  "author": {
    "@type": "Person",
    "name": "Traditional Zen",
    "url": "https://zenlineage.org/masters/..."
  },
  "isPartOf": {
    "@type": "WebPage",
    "url": "https://zenlineage.org/proverbs"
  }
}
```

**Effort:** ~2 hours

#### 7.2 FAQ schema on About page

The About page has clear Q&A-style sections ("What is Zen?", "Core Practice: Zazen", etc.). Adding `FAQPage` JSON-LD could trigger FAQ rich results and improve AI Overview inclusion.

**Effort:** ~1 hour

#### 7.3 Knowledge Graph alignment

Add `sameAs` properties to Person JSON-LD linking to Wikipedia/Wikidata URIs where available. This helps search engines and AI systems disambiguate historical figures. The scrapers already pull from Wikipedia, so the URLs may already be in the `sources` table.

```json
{
  "@type": "Person",
  "name": "Dōgen",
  "sameAs": [
    "https://en.wikipedia.org/wiki/D%C5%8Dgen",
    "https://www.wikidata.org/wiki/Q309290"
  ]
}
```

**Effort:** ~3 hours (need to map source URLs to sameAs)

---

## Summary Table

| # | Task | Priority | Effort | Impact |
|---|------|----------|--------|--------|
| 1.1 | Per-page metadata (title, description, OG, Twitter) | HIGH | 3h | Very High |
| 1.2 | Sitemap.xml via app/sitemap.ts | HIGH | 30m | Very High |
| 1.3 | Robots.txt via app/robots.ts | HIGH | 10m | High |
| 1.4 | Layout-level metadata defaults | HIGH | 15m | High |
| 2.1 | WebSite JSON-LD on home | HIGH | 30m | High |
| 2.2 | Person JSON-LD on 400+ master pages | HIGH | 2h | Very High |
| 2.3 | BreadcrumbList JSON-LD on all pages | HIGH | 1.5h | High |
| 2.4 | Article JSON-LD on About page | HIGH | 30m | Medium |
| 2.5 | ItemList JSON-LD on list pages | HIGH | 1h | Medium |
| 3.1 | llms.txt | HIGH | 30m | Medium |
| 3.2 | llms-full.txt (build-time generated) | HIGH | 4h | Medium |
| 3.3 | masters.json + schools.json endpoints | HIGH | 1h | Medium |
| 4.1 | OG image generation | MEDIUM | 4h | Medium |
| 4.2 | Favicon & Apple Touch Icon set | MEDIUM | 1h | Low |
| 5.1 | Related masters cross-links | MEDIUM | 3h | Medium |
| 5.2 | Site-wide footer navigation | MEDIUM | 1h | Medium |
| 5.3 | Prev/next master navigation | MEDIUM | 2h | Low |
| 6.1 | Image width/height + lazy loading | LOW | 2h | Medium |
| 6.2 | Font display verification | LOW | 15m | Low |
| 7.1 | Quotation schema on Proverbs | LOW | 2h | Low |
| 7.2 | FAQ schema on About page | LOW | 1h | Medium |
| 7.3 | sameAs links to Wikipedia/Wikidata | LOW | 3h | Medium |

**Total estimated effort:** ~4-5 days of focused work

## Recommended Implementation Order

**Sprint 1 (Day 1):** Items 1.1–1.4, 3.1 — Get the SEO foundation in place
**Sprint 2 (Day 2):** Items 2.1–2.5 — Add all JSON-LD structured data
**Sprint 3 (Day 3):** Items 3.2–3.3, 5.2 — AI-friendliness and navigation
**Sprint 4 (Day 4):** Items 4.1–4.2, 5.1, 6.1 — Social sharing and performance
**Sprint 5 (Day 5):** Items 5.3, 7.1–7.3 — Advanced features and polish
