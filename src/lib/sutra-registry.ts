/**
 * Editorial registry of the sūtras the site ships in /sutras/[slug].
 * Each entry maps a public URL slug to the `teachings.collection`
 * value used by the seed JSON, plus the chip ordering for the
 * translation switcher. v1 scope: Heart, Diamond, Platform.
 *
 * Adding a new translation: append a `translatorOrder` entry here
 * with the new teaching slug + a short chip label, and land the
 * matching `teachings-sutra-*.json` seed file under
 * `scripts/data/raw-teachings/`. The reader page will pick it up
 * automatically.
 */

export interface SutraRegistryEntry {
  slug: string;
  title: string;
  nativeTitle: string;
  collection: string;
  /** One- to two-sentence gloss for the index card and metadata. */
  gloss: string;
  /** Slug-based ordering of the chip control. First entry is the
   * default translation. */
  translatorOrder: { slug: string; chipLabel: string }[];
}

const SUTRAS: SutraRegistryEntry[] = [
  {
    slug: "heart-sutra",
    title: "Heart Sūtra",
    nativeTitle: "般若波羅蜜多心經",
    collection: "Heart Sūtra",
    gloss:
      "The shortest and most universally chanted Mahāyāna text — the prajñāpāramitā teaching of emptiness condensed to a single page. Daily liturgy in nearly every Zen, Chan, Sŏn, and Thiền hall.",
    translatorOrder: [
      { slug: "heart-sutra-mueller-1894", chipLabel: "Müller · 1894" },
      { slug: "heart-sutra-beal-1871", chipLabel: "Beal · 1871" },
    ],
  },
  {
    slug: "diamond-sutra",
    title: "Diamond Sūtra",
    nativeTitle: "金剛般若波羅蜜經",
    collection: "Diamond Sūtra",
    gloss:
      "The Vajracchedikā Prajñāpāramitā — the sūtra Huineng heard recited at the marketplace, awakening on the line ‘a Bodhisattva should produce a thought attached to nothing.’",
    translatorOrder: [
      { slug: "diamond-sutra-mueller-1894", chipLabel: "Müller · 1894" },
      { slug: "diamond-sutra-gemmell-1912", chipLabel: "Gemmell · 1912" },
    ],
  },
  {
    slug: "platform-sutra",
    title: "Platform Sūtra",
    nativeTitle: "六祖壇經",
    collection: "Platform Sūtra",
    gloss:
      "The Sixth Patriarch Huineng's autobiography and dharma talks — the only sūtra composed in China and the closest thing Chan/Zen has to a sectarian charter.",
    translatorOrder: [
      { slug: "platform-sutra-wong-1930", chipLabel: "Wong Mou-Lam · 1930" },
      { slug: "platform-sutra-goddard-1932", chipLabel: "Goddard · 1932" },
    ],
  },
];

export function getSutraRegistry(): SutraRegistryEntry[] {
  return SUTRAS;
}

export function getSutraEntry(slug: string): SutraRegistryEntry | undefined {
  return SUTRAS.find((s) => s.slug === slug);
}
