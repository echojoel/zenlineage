import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { abs } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "How to chant",
  description:
    "A short practical guide to chanting in a Zen meditation hall — breath, tempo, the mokugyō and inkin, syllable boundaries in Sino-Japanese readings, and how to follow along when you're new.",
  alternates: { canonical: abs("/sutras/how-to-chant") },
  openGraph: {
    title: "How to chant — Zen Lineage",
    description:
      "Practical guidance for chanting Zen sūtras — breath, tempo, instruments, and how to follow along in a meditation hall.",
    url: abs("/sutras/how-to-chant"),
    type: "article",
  },
};

export default function HowToChantPage() {
  return (
    <main className="detail-page">
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <Link href="/sutras" className="nav-link">
          Sūtras
        </Link>
        <h1 className="page-title">How to chant</h1>
      </header>
      <Breadcrumbs
        trail={[
          { name: "Home", href: "/" },
          { name: "Sūtras", href: "/sutras" },
          { name: "How to chant" },
        ]}
      />

      <div className="detail-layout">
        <section className="detail-hero">
          <p className="detail-eyebrow">Practical guide</p>
          <h2 className="detail-title">Breath, tempo, instruments</h2>
          <div className="detail-summary">
            <p>
              You don't need to read Chinese characters to chant in a
              Zen meditation hall. The texts are sounded, not parsed.
              The practice is more like rowing in a crew than
              reciting a poem: everyone keeps the same beat, breathes
              at the same places, and the boat moves.
            </p>
            <p>
              This guide is for visitors and beginners. It assumes
              you've found a hall (the practice directory under{" "}
              <Link className="detail-inline-link" href="/practice">
                /practice
              </Link>{" "}
              lists 1,600+ centres) and want to know what to expect
              when the bell rings and the chanting starts. The
              chanted forms of the sūtras themselves live alongside
              their translations on each sūtra page — the Hannya
              Shingyō chip on the{" "}
              <Link
                className="detail-inline-link"
                href="/sutras/heart-sutra?translator=heart-sutra-japanese-chant"
              >
                Heart Sūtra
              </Link>
              , the Kannon-gyō on the{" "}
              <Link
                className="detail-inline-link"
                href="/sutras/lotus-sutra?translator=lotus-sutra-japanese-chant"
              >
                Lotus Sūtra
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Breath and pace</h3>
          <div className="detail-summary">
            <p>
              The chant moves on a single tone, at a steady tempo.
              Most halls land somewhere between 120 and 160 syllables
              per minute — fast enough to feel like one continuous
              line of breath, slow enough to articulate every
              syllable. The breath flows down through the lower
              belly (<em lang="ja-Latn">hara</em>); shoulders stay
              relaxed; the sound comes from there, not from the
              throat.
            </p>
            <p>
              You take a breath where you need to, but most chanters
              learn to inhale at the natural pause between <em>shōji</em>{" "}
              (sentence) units. In the Heart Sūtra those are the
              short lines like <em lang="ja-Latn">"shiki soku ze kū"</em>{" "}
              (form is precisely emptiness): a quick breath in, then
              ride the next phrase out on the exhale.
            </p>
            <p>
              When you don't know the words, the rule is simple — keep
              the beat with the rest of the room and hum or move your
              lips. Don't try to chase a phrase you've missed; pick
              up at the next clear word.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">The instruments</h3>
          <div className="detail-summary">
            <p>
              The <em lang="ja-Latn">mokugyō</em> (木魚, "wooden
              fish") is the round wooden drum struck with a padded
              mallet. It carries the beat under the chant — one
              strike per syllable, at the pace the lead chanter sets.
              When you're new, listen to the <em>mokugyō</em> first;
              the words come second.
            </p>
            <p>
              The <em lang="ja-Latn">inkin</em> (引磬, hand-bell) and
              the larger <em lang="ja-Latn">keisu</em> (磬子, sitting
              bowl-bell) mark structural breaks: the start of a
              chant, the end of a chant, dedications, and bows. A
              long ringing tone usually means "stop chanting" or
              "bow now"; a short crisp strike usually means "begin"
              or "next section."
            </p>
            <p>
              Visitors are not expected to play any of these. The{" "}
              <em>jisha</em> (attendant) or appointed <em>doan</em>{" "}
              handles them. Your only job is to chant when the room
              chants and bow when the room bows.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Reading the romaji</h3>
          <div className="detail-summary">
            <p>
              The chanted forms on this site are written in Hepburn
              romanisation. A few rules will get you 90% of the way
              there:
            </p>
            <ul className="detail-link-list" style={{ marginTop: "0.5rem" }}>
              <li>
                <strong lang="ja-Latn">a, i, u, e, o</strong> — pure
                Italian-style vowels. <em lang="ja-Latn">"a"</em> as
                in <em>father</em>, never as in <em>cat</em>.
              </li>
              <li>
                <strong lang="ja-Latn">ō, ū</strong> — the same vowel
                held twice as long. <em lang="ja-Latn">"hō"</em> is
                "ho-o," not a different sound.
              </li>
              <li>
                <strong lang="ja-Latn">double consonants (kk, ss,
                tt)</strong> — held a beat. <em lang="ja-Latn">"is-sai"</em>{" "}
                is "iss—sai," with a tiny silence between the
                consonants.
              </li>
              <li>
                <strong lang="ja-Latn">n at the end of a syllable</strong>{" "}
                — held briefly, like the n in "sing." <em lang="ja-Latn">"shin"</em>{" "}
                is one full beat, not the English word "shin."
              </li>
              <li>
                <strong lang="ja-Latn">hyphens</strong> in the
                transcription mark syllable boundaries inside a
                Sino-Japanese compound:{" "}
                <em lang="ja-Latn">"hannya haramita shingyō"</em> is
                four units, not one breath.
              </li>
            </ul>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">A note on understanding</h3>
          <div className="detail-summary">
            <p>
              When you start out, the chants will sound like syllables
              in a language you don't speak — because that's exactly
              what they are. The Sino-Japanese reading is a stylised
              pronunciation of medieval Chinese; even native Japanese
              speakers don't parse it as ordinary Japanese. The
              translations on this site are how you learn what the
              words mean.
            </p>
            <p>
              Most Zen practitioners cycle between the two: chant the
              text many times until it sits in the body, then read a
              translation, then return to the chant a few months
              later and find that the meaning has crept in
              underneath the syllables. That's the practice working
              on you.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
