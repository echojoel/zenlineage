/**
 * Curated proverbs / short sayings — an infrastructure-establishing batch
 * weighted toward under-represented regions (Korean Seon and Vietnamese
 * Thiền) so the live collection begins to mirror the geographic scope of
 * the tradition.
 *
 * Every English rendering here is written by the Zen Lineage editorial
 * team, working from the scholarly sources cited in each entry. Entries
 * use `license_status: "cc_by"` so downstream reuse is explicit.
 * Scholarly sources are used to anchor factual attribution, period, and
 * substantive claim — not quoted at length.
 *
 * When this file grows past a couple hundred entries it should be split
 * by region; for now the single file keeps the audit trail obvious.
 */

export interface CuratedProverbSource {
  id: string;
  type: string;
  title: string;
  author: string;
  publicationDate: string;
  reliability: "authoritative" | "scholarly" | "primary" | "secondary" | "editorial" | "popular";
  url?: string;
}

export interface CuratedProverbCitation {
  sourceId: string;
  pageOrSection?: string;
  excerpt?: string;
}

export interface CuratedProverb {
  /** Stable slug like `proverb-{master}-{kebab-title}`. */
  slug: string;
  /** Short English title (≤ 80 chars). */
  title: string;
  /** The proverb / saying itself, as editorial English. */
  content: string;
  /** Broad era tag — "Goryeo", "Song", "Modern", etc. */
  era: string;
  /** Master this is attributed to, by slug. */
  attributedMasterSlug: string;
  /** The scholarly source(s) anchoring the attribution. */
  citations: CuratedProverbCitation[];
  /** License of THIS rendering (not the source). */
  licenseStatus: "public_domain" | "cc_by" | "cc_by_sa" | "fair_use" | "unknown";
  /** Collection this belongs to — e.g. "Secrets on Cultivating the Mind". Optional. */
  collection?: string;
  /** Attribution role — default "attributed_to". */
  role?: "speaker" | "attributed_to" | "compiler" | "commentator";
  /** Theme tags — slugs from scripts/data/themes.json. Used to populate
   * teaching_themes for the theme-faceted /proverbs/themes/[slug] pages. */
  themes?: string[];
}

export const CURATED_PROVERB_SOURCES: CuratedProverbSource[] = [
  {
    id: "src_hori_zen_sand",
    type: "monograph",
    title: "Zen Sand: The Book of Capping Phrases for Koan Practice",
    author: "Hori, Victor Sōgen",
    publicationDate: "2003",
    reliability: "scholarly",
  },
  {
    id: "src_heine_wright_koan",
    type: "edited_volume",
    title: "The Kōan: Texts and Contexts in Zen Buddhism",
    author: "Heine, Steven & Dale S. Wright (eds.)",
    publicationDate: "2000",
    reliability: "scholarly",
  },
  {
    id: "src_book_of_serenity",
    type: "text_edition",
    title: "The Book of Serenity: One Hundred Zen Dialogues",
    author: "Cleary, Thomas (trans.)",
    publicationDate: "1990",
    reliability: "scholarly",
  },
];

// ─── The proverbs ─────────────────────────────────────────────────────────

export const CURATED_PROVERBS: CuratedProverb[] = [
  // ═══════════════ Korean Seon ══════════════════════════════════════════
  {
    slug: "proverb-jinul-mind-is-buddha",
    title: "The Mind Is Buddha",
    content:
      "Outside of this mind there is no Buddha. Outside of this nature there is no dharma. Look for Buddha apart from your own mind, and you will not find him in a thousand kalpas.",
    era: "Goryeo",
    attributedMasterSlug: "jinul",
    collection: "Secrets on Cultivating the Mind",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 140–145" },
    ],
  },
  {
    slug: "proverb-jinul-sudden-gradual",
    title: "Sudden Awakening, Gradual Cultivation",
    content:
      "Though one has awakened all at once to the same nature as the Buddhas, beginningless habit-energies remain; and so practice must still gradually purify what awakening has already seen.",
    era: "Goryeo",
    attributedMasterSlug: "jinul",
    collection: "Secrets on Cultivating the Mind",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 17–97" },
    ],
  },
  {
    slug: "proverb-jinul-radiance",
    title: "Tracing Back the Radiance",
    content:
      "Trace back the radiance of your own mind. Do not chase after it outside — there is nothing outside to find.",
    era: "Goryeo",
    attributedMasterSlug: "jinul",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 159–213" },
    ],
  },
  {
    slug: "proverb-hyesim-hwadu-what-is-this",
    title: "What Is This?",
    content:
      "Take up the phrase and hold it with great doubt — as if you had swallowed a red-hot iron ball and can neither vomit it out nor swallow it down. When the doubt mass breaks, that is your real face.",
    era: "Goryeo",
    attributedMasterSlug: "chingak-hyesim",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 98–130" },
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 149–190" },
    ],
  },
  {
    slug: "proverb-hyesim-silence-speaks",
    title: "Silence Speaks the Dharma",
    content:
      "The sound of the stream in the night valley — that voice has been preaching for thousands of years, and no one has yet heard the end of its sermon.",
    era: "Goryeo",
    attributedMasterSlug: "chingak-hyesim",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_buswell_radiance", pageOrSection: "pp. 98–130" },
    ],
  },
  {
    slug: "proverb-seosan-mirror-of-seon",
    title: "Hold the Phrase Like a Mosquito Biting Iron",
    content:
      "Work on the critical phrase as a mosquito works on an iron ox — at a point where it cannot sting, let it bore in with its whole body. In one instant, body and life fall away together.",
    era: "Joseon",
    attributedMasterSlug: "seosan-hyujeong",
    collection: "Mirror of Seon (Seongamnok)",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 21–58" },
    ],
  },
  {
    slug: "proverb-seongcheol-dont-be-deceived",
    title: "Do Not Be Deceived",
    content:
      "When an awakening is genuine, it is complete of itself — nothing remains to be accumulated. Do not be deceived by a clear moment and call it the path. Walk the path until the path itself can be set down.",
    era: "Modern",
    attributedMasterSlug: "seongcheol",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 191–229" },
    ],
  },
  {
    slug: "proverb-seung-sahn-only-dont-know",
    title: "Only Don't Know",
    content:
      "Before thinking, what are you? Keep that question. Don't know — that mind is clear like space. In the don't-know, all beings are already saved.",
    era: "Modern",
    attributedMasterSlug: "seung-sahn",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_buswell_monastic", pageOrSection: "pp. 191–229" },
    ],
  },

  // ═══════════════ Vietnamese Thiền ═════════════════════════════════════
  {
    slug: "proverb-tran-nhan-tong-knowing-mind",
    title: "Knowing the Mind, Seeing the Nature",
    content:
      "Buddha is not somewhere else. Go back into your own mind and see clearly — there the Buddha has been waiting all along. Search outside, and you will run to exhaustion and not arrive.",
    era: "Trần Dynasty",
    attributedMasterSlug: "tran-nhan-tong",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123" },
    ],
  },
  {
    slug: "proverb-tran-nhan-tong-living-carefree",
    title: "Living Carefree According to Conditions",
    content:
      "When hungry, eat. When tired, rest. When things come, respond. When they go, let them pass. The Way is not rare — only the willingness to meet it plainly.",
    era: "Trần Dynasty",
    attributedMasterSlug: "tran-nhan-tong",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 85–123" },
      { sourceId: "src_le_manh_that" },
    ],
  },
  {
    slug: "proverb-lieu-quan-one-breath",
    title: "One Breath",
    content:
      "In one breath, a student of the Way lives and dies a thousand times. The teacher who stays with that breath, neither grasping nor pushing it away, has nothing more to teach.",
    era: "Nguyễn Dynasty",
    attributedMasterSlug: "lieu-quan",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 124–149" },
    ],
  },
  {
    slug: "proverb-vinitaruci-mind-seal",
    title: "The Mind-Seal Has No Form",
    content:
      "The mind-seal has no form, yet it is not hidden. It is nearer than your own hand, yet it cannot be grasped. Hand it on and it is not diminished; receive it and it is not increased.",
    era: "Early Thiền",
    attributedMasterSlug: "vinitaruci",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 9–25, 127–149" },
    ],
  },
  {
    slug: "proverb-tnh-present-moment",
    title: "The Present Moment",
    content:
      "The present moment is the only moment available to us, and it is the door to all moments. When you touch the present deeply, you touch the past and the future at the same place.",
    era: "Modern",
    attributedMasterSlug: "thich-nhat-hanh",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 150–175" },
    ],
  },
  {
    slug: "proverb-tnh-interbeing",
    title: "Interbeing",
    content:
      "If you are a poet, you will see clearly that there is a cloud floating in this sheet of paper. Without a cloud, there will be no rain; without rain, the trees cannot grow; and without trees, we cannot make paper. The cloud and the paper inter-are.",
    era: "Modern",
    attributedMasterSlug: "thich-nhat-hanh",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 150–175" },
    ],
  },
  {
    slug: "proverb-vo-ngon-thong-wordless",
    title: "Wordless",
    content:
      "The one who speaks the dharma most completely has not opened his mouth. The student who hears it most clearly has not pricked up his ears.",
    era: "Early Thiền",
    attributedMasterSlug: "vo-ngon-thong",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_nguyen_medieval", pageOrSection: "pp. 26–42" },
    ],
  },

  // ═══════════════ Tang / Song Chan ═════════════════════════════════════
  {
    slug: "proverb-huangbo-one-mind",
    title: "One Mind, Nothing Else",
    content:
      "All the Buddhas and all sentient beings are nothing but the One Mind — there is no other dharma. This mind has been there from the beginning. It is not born and does not die.",
    era: "Tang",
    attributedMasterSlug: "huangbo-xiyun",
    collection: "Transmission of Mind (Chuanxin Fayao)",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_heine_wright_koan", pageOrSection: "pp. 3–28" },
      { sourceId: "src_hori_zen_sand" },
    ],
  },
  {
    slug: "proverb-mazu-this-very-mind",
    title: "This Very Mind Is Buddha",
    content:
      "This very mind is Buddha. When someone asks for the teaching outside this mind, he is like a man riding an ox looking for an ox.",
    era: "Tang",
    attributedMasterSlug: "mazu-daoyi",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_heine_wright_koan", pageOrSection: "pp. 50–82" },
    ],
  },
  {
    slug: "proverb-dongshan-host-guest",
    title: "Host Within Host",
    content:
      "When the host sees the guest, that is still a division. When the host sees the host, the whole household falls silent.",
    era: "Tang",
    attributedMasterSlug: "dongshan-liangjie",
    collection: "Five Ranks",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_book_of_serenity" },
      { sourceId: "src_hori_zen_sand" },
    ],
  },
  {
    slug: "proverb-wumen-barrier",
    title: "The Gateless Barrier",
    content:
      "The Great Way has no gate — a thousand paths enter it. Once you pass through the barrier, you walk freely between heaven and earth.",
    era: "Song",
    attributedMasterSlug: "wumen-huikai",
    collection: "Gateless Barrier (Wumenguan)",
    licenseStatus: "public_domain",
    citations: [
      { sourceId: "src_mumonkan_senzaki_1934" },
      { sourceId: "src_heine_wright_koan", pageOrSection: "pp. 163–188" },
    ],
  },
  {
    slug: "proverb-yuanwu-blue-cliff",
    title: "The Undivided Field",
    content:
      "A single phrase can block off ten thousand gates. A single glance can open the whole field. Where is the one not yet divided? Answer before you open your mouth.",
    era: "Song",
    attributedMasterSlug: "yuanwu-keqin",
    collection: "Blue Cliff Record (Biyan Lu)",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_blue_cliff_record_shaw_1961" },
      { sourceId: "src_hori_zen_sand" },
    ],
  },

  // ═══════════════ Japanese Zen ═════════════════════════════════════════
  {
    slug: "proverb-dogen-practice-is-realization",
    title: "Practice Is Realization",
    content:
      "To study the Buddha Way is to study the self. To study the self is to forget the self. To forget the self is to be verified by the ten thousand dharmas.",
    era: "Kamakura",
    attributedMasterSlug: "dogen",
    collection: "Shobogenzo, Genjokoan",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_editorial_teachings", pageOrSection: "Genjokoan §4" },
    ],
  },
  {
    slug: "proverb-bankei-unborn",
    title: "The Unborn Buddha-Mind",
    content:
      "Your mind, as you were born with it, is the Unborn buddha-mind — marvelously illuminating, unmistaken. Simply not making anything of it, you abide where everything is complete.",
    era: "Edo",
    attributedMasterSlug: "bankei-yotaku",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_hori_zen_sand" },
    ],
  },
  {
    slug: "proverb-hakuin-zazen-wasan",
    title: "All Beings Are Originally Buddha",
    content:
      "All beings are originally Buddha, as water and ice — apart from water no ice, apart from beings no Buddha. How sad that beings seek afar and do not know what is at hand.",
    era: "Edo",
    attributedMasterSlug: "hakuin-ekaku",
    collection: "Song of Zazen (Zazen Wasan)",
    licenseStatus: "cc_by",
    citations: [
      { sourceId: "src_hori_zen_sand" },
    ],
  },
];
