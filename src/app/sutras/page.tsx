import type { Metadata } from "next";
import Link from "next/link";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { teachingContent, teachings } from "@/db/schema";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getSutraRegistry } from "@/lib/sutra-registry";
import { abs } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Sūtras",
  description:
    "The core Mahāyāna sūtras of Zen practice — Heart, Diamond, Platform, and Lotus — read side-by-side in English, Sanskrit, Chinese, and the Sino-Japanese chant. Every translation public domain or CC-licensed.",
  alternates: { canonical: abs("/sutras") },
  openGraph: {
    title: "Sūtras — Zen Lineage",
    description:
      "Read the Heart, Diamond, Platform, and Lotus sūtras side-by-side in English, Sanskrit, Chinese, and the chanted Japanese form.",
    url: abs("/sutras"),
    type: "website",
  },
};

export default async function SutrasIndexPage() {
  const registry = getSutraRegistry();

  const counts = await db
    .select({
      collection: teachings.collection,
      count: sql<number>`count(*)`,
    })
    .from(teachings)
    .innerJoin(
      teachingContent,
      eq(teachingContent.teachingId, teachings.id)
    )
    .where(eq(teachings.type, "sutra"))
    .groupBy(teachings.collection);

  const countByCollection = new Map<string, number>();
  for (const c of counts) {
    countByCollection.set(c.collection ?? "", c.count);
  }

  return (
    <main className="detail-page">
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">Sūtras</h1>
      </header>
      <Breadcrumbs
        trail={[
          { name: "Home", href: "/" },
          { name: "Sūtras" },
        ]}
      />

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">Core Mahāyāna canon</p>
          <h2 className="detail-title">The texts at the centre of practice</h2>
          <div className="detail-summary">
            <p>
              A <em>sūtra</em> (Sanskrit{" "}
              <span lang="sa-Latn">sūtra</span>, literally{" "}
              <em>thread</em>) is a Buddhist scripture: a discourse
              traditionally attributed to the Buddha, transmitted orally
              for centuries before being written down. Mahāyāna sūtras
              took shape between the 1st century BCE and the 6th century
              CE, were translated from Sanskrit into Chinese during the
              great translation period (2nd–8th c.), and from Chinese
              radiated into Korean, Japanese, and Vietnamese practice.
            </p>
            <p>
              The four gathered here circulate through nearly every Zen,
              Chan, Sŏn, and Thiền hall. The Heart and Diamond carry the
              prajñāpāramitā teaching of emptiness; the Platform Sūtra
              records the dharma of the Sixth Patriarch Huineng — the
              only sūtra composed in China; the Lotus, especially its
              Universal Gate chapter (Kannon-gyō), is the most-chanted
              passage in Sōtō and Rinzai daily liturgy.
            </p>
            <p>
              Each is offered here in multiple editions: the original
              Sanskrit, the canonical Chinese (Xuanzang, Kumārajīva,
              Zongbao), the Sino-Japanese chant, and several
              translations into European languages. The switcher above
              each text keeps the reader anchored at the same passage
              when you flip between languages.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">The four core sūtras</h3>
          <ul className="detail-link-list">
            {registry.map((s) => {
              const count = countByCollection.get(s.collection) ?? 0;
              return (
                <li key={s.slug}>
                  <Link href={`/sutras/${s.slug}`}>
                    {s.title}
                    <span className="detail-list-meta" lang="zh">
                      {" "}
                      {s.nativeTitle}
                    </span>
                  </Link>
                  <span className="detail-list-meta">
                    {count > 0
                      ? `${count} ${count === 1 ? "translation" : "translations"}`
                      : "Coming soon"}
                  </span>
                  <p className="detail-source-excerpt" style={{ marginTop: "0.4rem" }}>
                    {s.gloss}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Practical: how to chant</h3>
          <div className="detail-summary">
            <p>
              The Sino-Japanese chant (Hannya Shingyō, Kannon-gyō)
              sits as a chip on each sūtra's page — alongside the
              translations. If you're new to chanting, the{" "}
              <Link className="detail-inline-link" href="/sutras/how-to-chant">
                how-to-chant guide
              </Link>{" "}
              walks through breath, tempo, the <em>mokugyō</em>, and
              what to do when you don't know the words yet.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">A note on translations</h3>
          <div className="detail-summary">
            <p>
              Every edition on this site is in the public domain or
              under a permissive Creative Commons licence (CC BY,
              CC BY-SA). Modern copyrighted renderings — Conze, Red
              Pine, Thich Nhat Hanh, Yampolsky, Burton Watson, the
              84000 collection — are deliberately excluded so the texts
              can be read, quoted, and re-circulated freely.
            </p>
            <p>
              The Heart Sūtra is given in full in every language. The
              Diamond, Platform, and Lotus are presented as faithful
              selections from the canonical public-domain editions
              (Müller's SBE for Sanskrit; the Taishō Tripiṭaka for
              Chinese; Kern–Nanjio's Bibliotheca Buddhica for the Lotus
              Sanskrit), with each section linked back to the
              authoritative full text on the Internet Archive.
            </p>
            <p>
              French and German coverage rests on three nineteenth-century
              orientalists whose work is now in the public domain: Eugène
              Burnouf's <em>Lotus de la Bonne Loi</em> (1852, the first
              Western Lotus), Léon Feer's <em>L'essence de la science
              transcendante</em> (1866) and Charles de Harlez's{" "}
              <em>Vajracchedikā</em> (1892), and Max Walleser's{" "}
              <em>Prajñāpāramitā</em> (1914). Spanish, Portuguese,
              Vietnamese, Korean, and modern East-Asian vernacular
              renderings of these sūtras are nearly all under copyright;
              we will land them as public-domain or CC-BY contributions
              become available.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
