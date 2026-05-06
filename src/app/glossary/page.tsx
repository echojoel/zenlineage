import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buildGlossary, termAnchorId } from "@/lib/glossary-data";
import GlossaryFilter from "@/components/GlossaryFilter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  abs,
  breadcrumbSchema,
  jsonLdString,
} from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "A reference glossary of Zen Buddhist terms — shikantaza, hwadu, kenshō, hishiryō, bokuseki, and dozens more — across the Chan, Zen, Seon, and Thiền traditions, each linked to the schools that use it.",
  alternates: { canonical: "https://zenlineage.org/glossary" },
  openGraph: {
    title: "Zen Glossary — Zen Lineage",
    description:
      "Definitions of core Zen / Chan / Seon / Thiền terms, grouped by tradition and linked to the schools that use them.",
    url: "https://zenlineage.org/glossary",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Zen Glossary — Zen Lineage",
    description:
      "Reference definitions of Zen Buddhist vocabulary, with tradition links.",
  },
};

const breadcrumbLd = breadcrumbSchema([
  { name: "Home", url: abs("/") },
  { name: "Glossary", url: abs("/glossary") },
]);

export default function GlossaryPage() {
  const glossary = buildGlossary();

  // Group by first letter for the alphabetical jump row.
  const byLetter = new Map<string, typeof glossary>();
  for (const entry of glossary) {
    const letter = entry.displayTerm.charAt(0).toUpperCase();
    const list = byLetter.get(letter) ?? [];
    list.push(entry);
    byLetter.set(letter, list);
  }
  const letters = Array.from(byLetter.keys()).sort();

  // DefinedTermSet structured data — every entry exposed as a
  // resolvable anchor URL with @id so external Schema-aware crawlers
  // (Google Rich Results, AI search) can dereference individual terms.
  const definedTermSetLd = {
    "@type": "DefinedTermSet",
    "@id": `${abs("/glossary")}#defined-term-set`,
    name: "Zen Lineage Glossary",
    inLanguage: "en",
    hasDefinedTerm: glossary.map((g) => {
      const url = `${abs("/glossary")}#${termAnchorId(g.termKey)}`;
      return {
        "@type": "DefinedTerm",
        "@id": url,
        url,
        name: g.displayTerm,
        ...(g.nativeTerm ? { alternateName: g.nativeTerm } : {}),
        description: g.description,
        inDefinedTermSet: `${abs("/glossary")}#defined-term-set`,
      };
    }),
  };

  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString([definedTermSetLd, breadcrumbLd]),
        }}
      />
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">Glossary</h1>
      </header>
      <Breadcrumbs
        trail={[{ name: "Home", href: "/" }, { name: "Glossary" }]}
      />

      <div className="detail-layout" data-glossary-root data-active-tradition="all">
        <section className="detail-hero" style={{ paddingBottom: "1rem" }}>
          <p className="detail-eyebrow">Vocabulary</p>
          <h2 className="detail-title">Glossary</h2>
          <p className="detail-subtitle">
            Core terms across the Chan, Zen, Seon, and Thiền traditions —
            each linked to the schools that use it.
          </p>
        </section>

        <section className="detail-card detail-card--wide glossary-controls">
          <Suspense fallback={null}>
            <GlossaryFilter />
          </Suspense>
          <nav aria-label="Jump to letter" className="glossary-jump">
            {letters.map((letter) => (
              <a key={letter} href={`#letter-${letter}`} className="glossary-jump-letter">
                {letter}
              </a>
            ))}
          </nav>
        </section>

        <section className="detail-card detail-card--wide">
          {letters.map((letter) => {
            const entries = byLetter.get(letter) ?? [];
            return (
              <div key={letter} className="glossary-section">
                <h3
                  id={`letter-${letter}`}
                  className="glossary-letter-heading"
                >
                  {letter}
                </h3>
                <dl className="glossary-list">
                  {entries.map((g) => {
                    const traditions = Array.from(
                      new Set(g.schools.map((s) => s.tradition))
                    ).join(",");
                    return (
                      <div
                        key={g.termKey}
                        id={termAnchorId(g.termKey)}
                        className="glossary-entry"
                        data-traditions={traditions}
                      >
                        <dt className="glossary-term">
                          <span className="glossary-term-en">
                            {g.displayTerm}
                          </span>
                          {g.nativeTerm && (
                            <span className="glossary-term-native">
                              {g.nativeTerm}
                            </span>
                          )}
                        </dt>
                        <dd className="glossary-definition">
                          <p className="glossary-description">
                            {g.description}
                          </p>
                          <p className="glossary-meta">
                            <span className="glossary-meta-label">
                              Used in:
                            </span>{" "}
                            {g.schools.map((s, i) => (
                              <span key={s.slug}>
                                {i > 0 ? ", " : ""}
                                <Link
                                  href={`/schools/${s.slug}`}
                                  className="detail-inline-link"
                                >
                                  {s.name}
                                </Link>
                              </span>
                            ))}
                            {g.externalUrl && (
                              <>
                                {" · "}
                                <a
                                  href={g.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="detail-inline-link"
                                >
                                  Read more ↗
                                </a>
                              </>
                            )}
                          </p>
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
