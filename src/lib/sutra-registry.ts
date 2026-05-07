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
  /** Editorial coverage: `complete` for full-text editions (Heart
   *  Sūtra in any language), `selections` for partial editions
   *  shipping a curated subset of chapters. The reader surfaces a
   *  small badge near the source footer when set to `selections` so
   *  the reader knows the sūtra continues beyond what's on the
   *  page. Optional; defaults to `complete`. */
  coverage?:
    | { kind: "complete" }
    | { kind: "selections"; sections: string };
  /** Optional direct URL to a freely-licensed audio file (.ogg,
   *  .mp3, .wav, .m4a) of the chant. When set, the reader embeds an
   *  HTML5 audio player above the prose. Use only with PD or
   *  Creative Commons recordings — Internet Archive community
   *  uploads in the Buddhist.Chanting collection, Sōtōshū releases
   *  marked free, Plum Village publications, etc. */
  audioUrl?: string;
  /** Catalogue page where the audio lives, for the "Source" link
   *  underneath the player (e.g. the archive.org item page). */
  audioSourceUrl?: string;
  /** One-line attribution shown next to the player. */
  audioAttribution?: string;
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
        audioUrl:
          "https://archive.org/download/diamond_sutra_and_heart_sutra_2301_librivox/diamondheartsutra_01_unknown_64kb.mp3",
        audioSourceUrl:
          "https://archive.org/details/diamond_sutra_and_heart_sutra_2301_librivox",
        audioAttribution:
          "LibriVox audiobook — public-domain English Heart Sūtra reading (2 min)",
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
        audioUrl:
          "https://archive.org/download/Buddhist.Chanting/Japan-Japanese-Kyoto_Temples-Hannya_Shingyo-Heart_Sutra.ogg",
        audioSourceUrl: "https://archive.org/details/Buddhist.Chanting",
        audioAttribution:
          "Kyoto temples — Hannya Shingyō recording, Internet Archive Buddhist.Chanting collection",
      },
      {
        slug: "heart-sutra-sanskrit",
        chipLabel: "Sanskrit (Conze ed.)",
        language: "sa-Latn",
        langLabel: "SA",
      },
      {
        slug: "heart-sutra-feer-1866",
        chipLabel: "Feer · 1866",
        language: "fr",
        langLabel: "FR",
      },
      {
        slug: "heart-sutra-walleser-1914",
        chipLabel: "Walleser · 1914",
        language: "de",
        langLabel: "DE",
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
        coverage: { kind: "selections", sections: "§§ 1, 5, 10, 26, 32 of 32" },
      },
      {
        slug: "diamond-sutra-gemmell-1912",
        chipLabel: "Gemmell · 1912",
        language: "en",
        langLabel: "EN",
        coverage: { kind: "selections", sections: "§§ 1, 5, 10, 26, 32 of 32" },
        audioUrl:
          "https://archive.org/download/diamondsutra_2312_librivox/diamondsutra_00_unknown_64kb.mp3",
        audioSourceUrl:
          "https://archive.org/details/diamondsutra_2312_librivox",
        audioAttribution:
          "LibriVox audiobook — full reading of Gemmell's Diamond Sūtra (~25 min)",
      },
      {
        slug: "diamond-sutra-kumarajiva",
        chipLabel: "Kumārajīva · 401",
        language: "zh-Hant",
        langLabel: "漢",
        coverage: { kind: "selections", sections: "§§ 1, 5, 10, 26, 32 of 32" },
      },
      {
        slug: "diamond-sutra-sanskrit",
        chipLabel: "Sanskrit (Müller 1881)",
        language: "sa-Latn",
        langLabel: "SA",
        coverage: { kind: "selections", sections: "§§ 1, 5, 10, 26, 32 of 32" },
      },
      {
        slug: "diamond-sutra-deharlez-1892",
        chipLabel: "de Harlez · 1892",
        language: "fr",
        langLabel: "FR",
        coverage: { kind: "selections", sections: "§§ 1, 5, 10, 26, 32 of 32" },
      },
      {
        slug: "diamond-sutra-walleser-1914",
        chipLabel: "Walleser · 1914",
        language: "de",
        langLabel: "DE",
        coverage: { kind: "selections", sections: "§§ 1, 5, 10, 26, 32 of 32" },
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
        coverage: { kind: "selections", sections: "Chs. I, II, III, VI, X" },
      },
      {
        slug: "platform-sutra-goddard-1932",
        chipLabel: "Goddard · 1932",
        language: "en",
        langLabel: "EN",
        coverage: { kind: "selections", sections: "Chs. I, II, III, VI, X" },
      },
      {
        slug: "platform-sutra-zongbao",
        chipLabel: "Zongbao · 1291",
        language: "zh-Hant",
        langLabel: "漢",
        coverage: { kind: "selections", sections: "Chs. 1, 2, 3, 6, 10" },
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
        coverage: { kind: "selections", sections: "Ch. 25 (Universal Gate of Avalokiteśvara) of 28" },
        audioUrl:
          "https://archive.org/download/lotussutra_2403_librivox/lotussutra_26_64kb.mp3",
        audioSourceUrl:
          "https://archive.org/details/lotussutra_2403_librivox",
        audioAttribution:
          "LibriVox audiobook — Kern's Universal Gate chapter (ch. XXIV, 26 min)",
      },
      {
        slug: "lotus-sutra-kumarajiva",
        chipLabel: "Kumārajīva · 406 (觀世音菩薩普門品)",
        language: "zh-Hant",
        langLabel: "漢",
        coverage: { kind: "selections", sections: "觀世音菩薩普門品 (ch. 25) of 28" },
      },
      {
        slug: "lotus-sutra-japanese-chant",
        chipLabel: "Kannon-gyō (chanted)",
        language: "ja-Latn",
        langLabel: "日",
        coverage: { kind: "selections", sections: "Universal Gate (ch. 25) of 28" },
        // No verified-PD recording of the *full* Universal Gate
        // chapter is presently catalogued. The shorter Enmei Jukku
        // Kannon-gyō dharani (Ten-Phrase Life-Prolonging Sūtra) has
        // free recordings on Internet Archive but is a different
        // chant — leaving audio empty here rather than mislabel it.
      },
      {
        slug: "lotus-sutra-sanskrit",
        chipLabel: "Sanskrit (Nepalese mss.)",
        language: "sa-Latn",
        langLabel: "SA",
        coverage: { kind: "selections", sections: "Samantamukha-parivarta (ch. 24/25) of 27" },
      },
      {
        slug: "lotus-sutra-burnouf-1852",
        chipLabel: "Burnouf · 1852 (Porte universelle)",
        language: "fr",
        langLabel: "FR",
        coverage: { kind: "selections", sections: "Ch. XXIV (Porte universelle) of XXVII" },
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

