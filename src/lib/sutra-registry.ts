/**
 * Editorial registry of the sūtras the site ships in /sutras/[slug].
 * Each entry maps a public URL slug to the `teachings.collection`
 * value used by the seed JSON, plus the chip ordering for the
 * translation switcher. v1 scope: Heart, Diamond, Platform, Lotus.
 *
 * Adding a new translation: append a `translations` entry here with
 * the new teaching slug + a chip label, language tag, and short
 * `langLabel` for the chip's gutter; land the matching
 * `teachings-sutra-*.json` seed file under
 * `scripts/data/raw-teachings/`. The reader page picks it up
 * automatically by slug.
 *
 * Languages currently in use:
 *   en       — English
 *   sa-Latn  — Sanskrit in IAST roman transliteration
 *   zh-Hant  — Chinese, traditional script
 *   ja-Latn  — Japanese in romaji (chanted readings)
 */

export interface SutraTranslationEntry {
  slug: string;
  /** Short label for the chip — translator surname + year, or
   *  "Sino-Japanese chant" for romaji editions, etc. */
  chipLabel: string;
  /** BCP-47-ish language tag matching the seed `locale` field. */
  language: string;
  /** Two- to three-character gutter tag rendered above chipLabel
   *  (EN, SA, 漢, 日). Lets the reader scan languages at a glance. */
  langLabel: string;
}

export interface SutraRegistryEntry {
  slug: string;
  title: string;
  nativeTitle: string;
  collection: string;
  /** One- to two-sentence gloss for the index card and metadata. */
  gloss: string;
  /** Ordering of the chip control. The first English entry is the
   *  default selection; the canonical original-language version sits
   *  alongside the English ones for parallel reading. */
  translations: SutraTranslationEntry[];
}

const SUTRAS: SutraRegistryEntry[] = [
  {
    slug: "heart-sutra",
    title: "Heart Sūtra",
    nativeTitle: "般若波羅蜜多心經",
    collection: "Heart Sūtra",
    gloss:
      "The shortest and most universally chanted Mahāyāna text — the prajñāpāramitā teaching of emptiness condensed to a single page. Daily liturgy in nearly every Zen, Chan, Sŏn, and Thiền hall.",
    translations: [
      {
        slug: "heart-sutra-mueller-1894",
        chipLabel: "Müller · 1894",
        language: "en",
        langLabel: "EN",
      },
      {
        slug: "heart-sutra-beal-1871",
        chipLabel: "Beal · 1871",
        language: "en",
        langLabel: "EN",
      },
      {
        slug: "heart-sutra-xuanzang",
        chipLabel: "Xuanzang · 649",
        language: "zh-Hant",
        langLabel: "漢",
      },
      {
        slug: "heart-sutra-japanese-chant",
        chipLabel: "Hannya Shingyō (chanted)",
        language: "ja-Latn",
        langLabel: "日",
      },
      {
        slug: "heart-sutra-sanskrit",
        chipLabel: "Sanskrit (Conze ed.)",
        language: "sa-Latn",
        langLabel: "SA",
      },
    ],
  },
  {
    slug: "diamond-sutra",
    title: "Diamond Sūtra",
    nativeTitle: "金剛般若波羅蜜經",
    collection: "Diamond Sūtra",
    gloss:
      "The Vajracchedikā Prajñāpāramitā — the sūtra Huineng heard recited at the marketplace, awakening on the line ‘a Bodhisattva should produce a thought attached to nothing.’",
    translations: [
      {
        slug: "diamond-sutra-mueller-1894",
        chipLabel: "Müller · 1894",
        language: "en",
        langLabel: "EN",
      },
      {
        slug: "diamond-sutra-gemmell-1912",
        chipLabel: "Gemmell · 1912",
        language: "en",
        langLabel: "EN",
      },
      {
        slug: "diamond-sutra-kumarajiva",
        chipLabel: "Kumārajīva · 401",
        language: "zh-Hant",
        langLabel: "漢",
      },
      {
        slug: "diamond-sutra-sanskrit",
        chipLabel: "Sanskrit (Müller 1881)",
        language: "sa-Latn",
        langLabel: "SA",
      },
    ],
  },
  {
    slug: "platform-sutra",
    title: "Platform Sūtra",
    nativeTitle: "六祖壇經",
    collection: "Platform Sūtra",
    gloss:
      "The Sixth Patriarch Huineng's autobiography and dharma talks — the only sūtra composed in China and the closest thing Chan/Zen has to a sectarian charter.",
    translations: [
      {
        slug: "platform-sutra-wong-1930",
        chipLabel: "Wong Mou-Lam · 1930",
        language: "en",
        langLabel: "EN",
      },
      {
        slug: "platform-sutra-goddard-1932",
        chipLabel: "Goddard · 1932",
        language: "en",
        langLabel: "EN",
      },
      {
        slug: "platform-sutra-zongbao",
        chipLabel: "Zongbao · 1291",
        language: "zh-Hant",
        langLabel: "漢",
      },
    ],
  },
  {
    slug: "lotus-sutra",
    title: "Lotus Sūtra",
    nativeTitle: "妙法蓮華經",
    collection: "Lotus Sūtra",
    gloss:
      "Saddharma Puṇḍarīka Sūtra — the Mahāyāna sūtra of the One Vehicle. The Universal Gate chapter (Kannon-gyō / Avalokiteśvara) is chanted daily in Sōtō, Rinzai, and Plum Village halls; the Daimoku 南無妙法蓮華經 is the practice of the Nichiren tradition.",
    translations: [
      {
        slug: "lotus-sutra-kern-1884",
        chipLabel: "Kern · 1884 (Universal Gate)",
        language: "en",
        langLabel: "EN",
      },
      {
        slug: "lotus-sutra-kumarajiva",
        chipLabel: "Kumārajīva · 406 (觀世音菩薩普門品)",
        language: "zh-Hant",
        langLabel: "漢",
      },
      {
        slug: "lotus-sutra-japanese-chant",
        chipLabel: "Kannon-gyō (chanted)",
        language: "ja-Latn",
        langLabel: "日",
      },
      {
        slug: "lotus-sutra-sanskrit",
        chipLabel: "Sanskrit (Nepalese mss.)",
        language: "sa-Latn",
        langLabel: "SA",
      },
    ],
  },
];

export function getSutraRegistry(): SutraRegistryEntry[] {
  return SUTRAS;
}

export function getSutraEntry(slug: string): SutraRegistryEntry | undefined {
  return SUTRAS.find((s) => s.slug === slug);
}

/**
 * Default chip slug for a sūtra: prefer the first English entry,
 * fall back to the first listed translation. Per the user's
 * requirement that English is the default reading.
 */
export function getDefaultTranslationSlug(
  entry: SutraRegistryEntry
): string | undefined {
  const en = entry.translations.find((t) => t.language === "en");
  return (en ?? entry.translations[0])?.slug;
}
