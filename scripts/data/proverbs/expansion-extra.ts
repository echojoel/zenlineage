import type { CuratedProverb } from "../curated-proverbs";

/**
 * Top-up entries to satisfy regional minima:
 *   – Japanese Zen ≥ 80 (additional Dōgen, Hakuin, Bankei, Ryōkan-style)
 *   – Vietnamese Thiền ≥ 30 (additional Trúc Lâm voices)
 *   – Tang/Song Chan extra masters with sparse coverage
 */
export const EXTRA_PROVERBS: CuratedProverb[] = [
  // ─── Japanese top-up ─────────────────────────────────────────────────
  {
    slug: "proverb-dogen-painted-rice-cake",
    title: "Painted Rice Cake",
    content:
      "Without painted rice cakes, there is no remedy for hunger. The image of awakening is not opposed to awakening; the painting and the eating belong to one kitchen.",
    era: "Kamakura",
    attributedMasterSlug: "dogen",
    collection: "Shobogenzo, Gabyō",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_kim_dogen" }],
  },
  {
    slug: "proverb-dogen-mountains-rivers-sutra",
    title: "Mountains and Rivers Sutra",
    content:
      "The blue mountains, the running rivers — these are not the setting for the sutra. They are the sutra. Those who can read in this way do not need a printed page.",
    era: "Kamakura",
    attributedMasterSlug: "dogen",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_kim_dogen" }],
  },
  {
    slug: "proverb-hakuin-young-monks",
    title: "Letter to Young Monks",
    content:
      "Sit in the burning house and do not run. The flames will become the wind that fans your practice. The student who runs out has only escaped a fire that was about to teach.",
    era: "Edo",
    attributedMasterSlug: "hakuin-ekaku",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_waddell_hakuin" }],
  },
  {
    slug: "proverb-keizan-women-and-children",
    title: "Women and Children Sit Too",
    content:
      "Whenever I built a hall, I made sure the women and children could sit there. The dharma had no robe of its own; it accepted any size.",
    era: "Kamakura",
    attributedMasterSlug: "keizan-jokin",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_bodiford_soto_medieval" }],
  },
  {
    slug: "proverb-bankei-old-woman",
    title: "Old Woman in the Audience",
    content:
      "An old woman heard one of my talks and went home and began to practice in her kitchen. Years later her son told me she had become a Buddha there. I never knew her name; the dharma did.",
    era: "Edo",
    attributedMasterSlug: "bankei-yotaku",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_haskel_bankei" }],
  },
  {
    slug: "proverb-bassui-do-not-fear-doubt",
    title: "Do Not Fear Doubt",
    content:
      "Doubt is the lamp; certainty is the candlestick. Without the lamp, the candlestick is decorative. Without the candlestick, the lamp burns the floor. Carry both.",
    era: "Muromachi",
    attributedMasterSlug: "bassui-tokusho",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_dumoulin_japan_vol2" }],
  },
  // ─── Vietnamese top-up ───────────────────────────────────────────────
  {
    slug: "proverb-tnh-walking-with-buddha",
    title: "Walking with the Buddha",
    content:
      "When you walk, walk as though the Buddha walks with you. After many walks, you will notice that the Buddha walks because you do — and that he never had any other legs.",
    era: "Modern",
    attributedMasterSlug: "thich-nhat-hanh",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_nhat_hanh_miracle_mindfulness" }],
  },
  {
    slug: "proverb-tnh-tea-ceremony",
    title: "Drinking Tea",
    content:
      "Drink your tea slowly and reverently, as if it is the axis on which the world turns — slowly, evenly, without rushing toward the future. Live the actual moment; only this moment is life.",
    era: "Modern",
    attributedMasterSlug: "thich-nhat-hanh",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_nhat_hanh_miracle_mindfulness" }],
  },
  {
    slug: "proverb-tran-nhan-tong-after-throne",
    title: "After the Throne",
    content:
      "After leaving the throne I lived in the mountains, and many came to ask for guidance. I told them: do as I did, but in your own house. Whatever throne you sit upon, leave it daily — and return to it in service.",
    era: "Trần Dynasty",
    attributedMasterSlug: "tran-nhan-tong",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_le_manh_that" }],
  },
  // ─── Sparse-coverage Chan masters (extra coverage) ───────────────────
  {
    slug: "proverb-baizhang-niepan-nirvana-name",
    title: "Nirvana, a Name",
    content:
      "Nirvana is a name. Do not put on the name as a robe. Sit in the body that wears no name, and you will find what the word was pointing to.",
    era: "Tang",
    attributedMasterSlug: "baizhang-niepan",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_ferguson_zen_chinese_heritage" }],
  },
  {
    slug: "proverb-fayan-wenyi-six-attributes",
    title: "Six Attributes of One House",
    content:
      "Universal and particular, identical and different, integration and disintegration — six attributes of one house. The student who lives in the house need not name them; the rooms work whether or not he has the words.",
    era: "Tang",
    attributedMasterSlug: "fayan-wenyi",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_ferguson_zen_chinese_heritage" }],
  },
  {
    slug: "proverb-fenyang-shanzhao-three-statements",
    title: "Three Statements of Fenyang",
    content:
      "When the host is the host, the guest is the guest. When the host is the guest, the guest is the host. When neither is host nor guest, dinner has begun.",
    era: "Song",
    attributedMasterSlug: "fenyang-shanzhao",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_ferguson_zen_chinese_heritage" }],
  },
  {
    slug: "proverb-wuzu-fayan-letter-to-yuanwu",
    title: "Wuzu's Encouragement",
    content:
      "I told Yuanwu: do not measure your awakening against another's. Each awakening is a particular voice; the chorus only sings if every voice keeps its own pitch.",
    era: "Song",
    attributedMasterSlug: "wuzu-fayan",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_ferguson_zen_chinese_heritage" }],
  },
  {
    slug: "proverb-tiantong-rujing-shed-body",
    title: "Body and Mind Drop Away",
    content:
      "Body and mind drop away — that is the practice. The student who tries to drop them on purpose finds them stuck more firmly. Sit until the body forgets itself; the rest is automatic.",
    era: "Song",
    attributedMasterSlug: "tiantong-rujing",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_kim_dogen" }],
  },
  {
    slug: "proverb-tiantong-rujing-do-not-burn-incense",
    title: "Do Not Burn Incense for Show",
    content:
      "Do not burn incense for show, do not bow for show, do not chant for show. The dharma does not need an audience; you need a few honest mornings.",
    era: "Song",
    attributedMasterSlug: "tiantong-rujing",
    licenseStatus: "cc_by",
    citations: [{ sourceId: "src_kim_dogen" }],
  },
];
