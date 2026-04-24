/**
 * Native-script names to fill known gaps surfaced by the accuracy audit.
 *
 * Only includes names that are attested in standard scholarly sources
 * (primarily the Buddhist Sanskrit encyclopedias and Lotus/Prajñāpāramitā
 * literature for Indian figures). We deliberately *do not* backfill
 * Devanagari for the semi-legendary Indian patriarchs whose names survive
 * only through later Chinese hagiographical transmission, where inventing
 * a Sanskrit form would be pseudo-scholarship. Those remain flagged by the
 * audit as honest gaps.
 */

export interface NativeNameAddition {
  masterSlug: string;
  names: Array<{ locale: string; nameType: "dharma" | "alias"; value: string }>;
}

export const NATIVE_NAMES_TO_ADD: NativeNameAddition[] = [
  // Shakyamuni Buddha — the historical Buddha; his Sanskrit name is the
  // best-attested in the entire corpus.
  {
    masterSlug: "shakyamuni-buddha",
    names: [
      { locale: "sa", nameType: "dharma", value: "शाक्यमुनि" },
      { locale: "sa", nameType: "alias", value: "सिद्धार्थ गौतम" },
    ],
  },
  // Mahākāśyapa — named in nearly every Mahāyāna sutra.
  {
    masterSlug: "mahakashyapa",
    names: [
      { locale: "sa", nameType: "dharma", value: "महाकाश्यप" },
    ],
  },
  // Ānanda — one of the ten great disciples; Sanskrit name is canonical.
  {
    masterSlug: "ananda",
    names: [
      { locale: "sa", nameType: "dharma", value: "आनन्द" },
    ],
  },
  // Nāgārjuna — second-century philosopher; Devanagari name standard in
  // Madhyamaka scholarship.
  {
    masterSlug: "nagarjuna",
    names: [
      { locale: "sa", nameType: "dharma", value: "नागार्जुन" },
    ],
  },
  // Āryadeva — Nāgārjuna's disciple and successor.
  {
    masterSlug: "aryadeva",
    names: [
      { locale: "sa", nameType: "dharma", value: "आर्यदेव" },
    ],
  },
  // Aśvaghoṣa — author of the Buddhacarita.
  {
    masterSlug: "ashvaghosha",
    names: [
      { locale: "sa", nameType: "dharma", value: "अश्वघोष" },
    ],
  },
  // Vasubandhu — Yogācāra master, author of the Abhidharmakośa.
  {
    masterSlug: "vasubandhu",
    names: [
      { locale: "sa", nameType: "dharma", value: "वसुबन्धु" },
    ],
  },
  // Upagupta — well-attested in the Ashokāvadāna.
  {
    masterSlug: "upagupta",
    names: [
      { locale: "sa", nameType: "dharma", value: "उपगुप्त" },
    ],
  },
  // Yunyan Tansheng — Tang Chan master; kanji name straightforward.
  {
    masterSlug: "yunyan-tansheng",
    names: [
      { locale: "zh", nameType: "alias", value: "雲巖曇晟" },
    ],
  },
];
