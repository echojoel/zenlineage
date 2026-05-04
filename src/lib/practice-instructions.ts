/**
 * Curated mapping of school slug → teaching slugs to surface as
 * practice-instructions on /practice/[schoolSlug].
 *
 * Restricted to Tier-1 masters of the school in question (as classified
 * by `editorial-tiers.ts`), so the practice page stays curated rather
 * than exhaustive. Each slug must resolve to a row in `teachings` with
 * a citation; the per-school page enforces this gate.
 *
 * Maintenance:
 *  - Add 2–4 entries per school where Tier-1 practice teachings exist
 *  - Reuse existing teaching slugs wherever possible. New practice
 *    instructions for schools that lack them go in
 *    `scripts/data/raw-teachings/teachings-practice-instructions.json`
 *    and are picked up by the standard seed-teachings pipeline.
 */

export const SCHOOL_PRACTICE_TEACHINGS: Record<string, string[]> = {
  // Indian patriarchs — no living practice manual; map to the seminal
  // Bodhidharma-Huike encounter that the lineage treats as the first
  // pacifying-the-mind instruction.
  "indian-patriarchs": ["huike-mind-not-at-peace"],

  // Chan — generic Chinese Chan parent. Foundational sayings and
  // dialogues that every later school presupposes.
  chan: [
    "huike-mind-not-at-peace",
    "huineng-think-neither-good-nor-evil",
    "platform-sutra-no-thought",
    "xinxinming-faith-in-mind",
  ],

  // Early Chan (Bodhidharma → Hongren).
  "early-chan": [
    "huike-mind-not-at-peace",
    "xinxinming-faith-in-mind",
    "platform-sutra-self-nature",
  ],

  // Caodong — silent illumination.
  caodong: [
    "hongzhi-silent-illumination",
    "proverb-hongzhi-silence-clarity",
    "yaoshan-thinking-of-not-thinking",
  ],

  // Sōtō — Dōgen + Keizan, the two Japanese ancestors.
  soto: [
    "practice-dogen-fukanzazengi-opening",
    "practice-keizan-zazen-yojinki-summary",
    "dogen-practice-is-enlightenment",
    "proverb-dogen-continuous-practice",
  ],

  // White Plum Asanga — Maezumi's lineage in the Sōtō current; surfaces
  // the same Dōgen practice manual it explicitly inherits.
  "white-plum-asanga": [
    "practice-dogen-fukanzazengi-opening",
    "dogen-practice-is-enlightenment",
  ],

  // Linji (Chinese) — the great-doubt / shout / blow line.
  linji: [
    "linji-true-person-of-no-rank",
    "linji-four-shouts",
    "linji-be-the-master",
    "linji-kill-the-buddha",
  ],

  // Rinzai (Japanese) — Hakuin's revival; kōan + zazen.
  rinzai: [
    "zazen-wasan-song-of-zazen",
    "hakuin-orategama-butter-meditation",
    "proverb-hakuin-meditation-activity",
    "linji-true-person-of-no-rank",
  ],

  // Yangqi line — Linji branch; reuse Linji core.
  "yangqi-line": [
    "linji-true-person-of-no-rank",
    "linji-four-shouts",
  ],

  // Yunmen — one-word barriers.
  yunmen: [
    "yunmen-one-word-barriers",
    "yunmen-every-day-good-day",
    "yunmen-body-exposed-golden-wind",
  ],

  // Fayan — "not knowing is most intimate" as practice attitude.
  fayan: ["luohan-not-knowing-most-intimate"],

  // Guiyang — round-circle teaching is rare in extant text; surface the
  // Bodhidharma-Huike pacification as the foundational sit.
  guiyang: ["huike-mind-not-at-peace"],

  // Qingyuan / Nanyue lines — broad Tang umbrella; surface their two
  // most representative practice-shaping anecdotes.
  "qingyuan-line": ["yaoshan-thinking-of-not-thinking"],
  "nanyue-line": ["proverb-huangbo-cease-opinions", "huangbo-one-mind"],

  // Sanbō Zen — Yasutani / Yamada lay kōan school. Reuse Hakuin + Dōgen.
  "sanbo-zen": [
    "hakuin-orategama-butter-meditation",
    "practice-dogen-fukanzazengi-opening",
  ],

  // Ōbaku — late Ming-influenced Japanese branch of Linji; reuse Linji.
  obaku: ["linji-true-person-of-no-rank", "huangbo-one-mind"],

  // Korean Seon — Jinul's tono chŏmsu is the school's defining instruction.
  seon: [
    "practice-jinul-sudden-gradual",
    "practice-seosan-hwadu",
    "practice-seongcheol-only-dont-know",
  ],

  // Jogye Order — modern unified Korean Seon order; same Jinul/Seosan core.
  jogye: [
    "practice-jinul-sudden-gradual",
    "practice-seosan-hwadu",
    "practice-seongcheol-only-dont-know",
  ],

  // Kwan Um — Seung Sahn's Western transmission.
  "kwan-um": [
    "practice-seung-sahn-dont-know",
    "practice-jinul-sudden-gradual",
  ],

  // Taego Order — Korean married-clergy lineage.
  "taego-order": ["practice-seosan-hwadu"],

  // Vietnamese Thiền parent.
  thien: [
    "practice-tran-nhan-tong-mind-only-buddha",
    "practice-thich-nhat-hanh-mindful-breathing",
  ],

  // Trúc Lâm — Trần Nhân Tông's distinctly Vietnamese synthesis.
  "truc-lam": ["practice-tran-nhan-tong-mind-only-buddha"],

  // Lâm Tế — Vietnamese Linji line.
  "lam-te": ["linji-true-person-of-no-rank"],

  // Plum Village — Thích Nhất Hạnh's mindfulness.
  "plum-village": ["practice-thich-nhat-hanh-mindful-breathing"],
};

/** Convenience: every teaching slug referenced by any school. */
export const ALL_PRACTICE_TEACHING_SLUGS: string[] = Array.from(
  new Set(Object.values(SCHOOL_PRACTICE_TEACHINGS).flat())
);

export function getPracticeTeachingSlugs(schoolSlug: string): string[] {
  return SCHOOL_PRACTICE_TEACHINGS[schoolSlug] ?? [];
}
