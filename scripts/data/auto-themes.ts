/**
 * Heuristic theme tagger for teachings (proverbs, koans, sermons, etc.).
 *
 * The seeders fall back to this when the source data does not carry an
 * explicit `themes` array. Themes correspond to slugs in
 * `scripts/data/themes.json` — the facets on `/proverbs/themes/[slug]`.
 *
 * Each rule scans the lowercased title + content for word-boundary
 * matches against a phrase list and emits one theme. Multiple rules can
 * fire — the result is deduplicated. If nothing matches we default to
 * `practice`, since virtually every teaching in the corpus is, at root,
 * about how to practise.
 */

export type ThemeSlug =
  | "emptiness"
  | "non-duality"
  | "impermanence"
  | "practice"
  | "daily-life"
  | "enlightenment"
  | "mind"
  | "nature"
  | "letting-go"
  | "paradox"
  | "patriarchs"
  | "lineage"
  | "study";

interface ThemeRule {
  theme: ThemeSlug;
  phrases: RegExp[];
}

// Each phrase is matched as a case-insensitive substring with rough
// word-boundary semantics. A phrase like "mind" deliberately matches
// "no-mind" and "mind-to-mind" as well — broader is better here than
// pedantic, given that we're tagging poetic prose.
const word = (s: string): RegExp => new RegExp(`\\b${s}\\b`, "i");
const sub = (s: string): RegExp => new RegExp(s, "i");

const RULES: ThemeRule[] = [
  {
    theme: "emptiness",
    phrases: [
      word("empty"),
      word("emptiness"),
      word("void"),
      word("vast"),
      word("hollow"),
      sub("no-thing"),
      word("śūnyatā"),
      word("sunyata"),
      sub("no self"),
      sub("no-self"),
      word("anatman"),
      word("formless"),
    ],
  },
  {
    theme: "non-duality",
    phrases: [
      sub("not two"),
      sub("not-two"),
      sub("non-dual"),
      sub("nondual"),
      word("neither"),
      sub("self and other"),
      sub("subject and object"),
      sub("host and guest"),
      sub("inside and outside"),
      sub("self nor other"),
      sub("one and many"),
      sub("are one"),
      sub("the same"),
    ],
  },
  {
    theme: "impermanence",
    phrases: [
      word("impermanence"),
      word("impermanent"),
      word("transient"),
      word("fleeting"),
      word("ephemeral"),
      sub("passes"),
      sub("passing"),
      sub("comes and goes"),
      sub("born and die"),
      sub("birth and death"),
      sub("life and death"),
      word("autumn"),
      sub("withers"),
      sub("fades"),
      sub("snow melt"),
      sub("leaves fall"),
      sub("falling petal"),
      sub("dewdrop"),
      word("dew"),
      word("dream"),
      sub("a single moment"),
    ],
  },
  {
    theme: "practice",
    phrases: [
      word("practice"),
      word("practise"),
      word("practising"),
      word("zazen"),
      word("shikantaza"),
      word("hwadu"),
      word("huatou"),
      word("kōan"),
      word("koan"),
      word("kongan"),
      word("hwadu"),
      word("doubt"),
      word("samadhi"),
      word("samādhi"),
      word("meditation"),
      word("meditate"),
      sub("seated"),
      sub("sit upright"),
      sub("the cushion"),
      word("sesshin"),
      word("kinhin"),
      word("ango"),
      sub("walking meditation"),
      word("retreat"),
      word("training"),
      word("discipline"),
      sub("hold the phrase"),
    ],
  },
  {
    theme: "daily-life",
    phrases: [
      word("eat"),
      word("eating"),
      word("rice"),
      word("tea"),
      word("sweep"),
      word("sweeping"),
      word("wash"),
      word("washing"),
      word("chop"),
      word("chopping"),
      word("cook"),
      word("cooking"),
      word("kitchen"),
      word("everyday"),
      word("ordinary"),
      sub("daily"),
      sub("carrying water"),
      sub("chopping wood"),
      sub("draw water"),
      word("broom"),
      word("bowl"),
      word("oryoki"),
      word("dishes"),
      word("garden"),
      word("plough"),
      sub("the fields"),
      sub("at the door"),
    ],
  },
  {
    theme: "enlightenment",
    phrases: [
      word("awaken"),
      word("awakening"),
      word("awakened"),
      word("enlighten"),
      word("enlightenment"),
      word("enlightened"),
      word("kenshō"),
      word("kensho"),
      word("satori"),
      sub("buddha-nature"),
      sub("buddha nature"),
      sub("true nature"),
      sub("great matter"),
      word("liberation"),
      word("liberate"),
      word("realize"),
      word("realise"),
      word("realization"),
      word("realisation"),
      sub("see your nature"),
      sub("seeing your nature"),
      sub("seeing one's nature"),
      sub("the great death"),
    ],
  },
  {
    theme: "mind",
    phrases: [
      word("mind"),
      word("consciousness"),
      word("thought"),
      word("thoughts"),
      word("thinking"),
      sub("no-mind"),
      sub("no mind"),
      sub("original face"),
      sub("ordinary mind"),
      sub("this very mind"),
      sub("mind-to-mind"),
      sub("mind to mind"),
    ],
  },
  {
    theme: "nature",
    phrases: [
      word("mountain"),
      word("mountains"),
      word("river"),
      word("rivers"),
      word("moon"),
      word("cloud"),
      word("clouds"),
      word("tree"),
      word("trees"),
      word("flower"),
      word("flowers"),
      word("blossom"),
      word("petal"),
      word("petals"),
      word("bird"),
      word("birds"),
      word("stream"),
      word("valley"),
      word("rain"),
      word("wind"),
      word("snow"),
      word("stone"),
      word("rock"),
      word("pine"),
      word("bamboo"),
      word("plum"),
      word("ocean"),
      word("sea"),
      word("sky"),
      word("forest"),
      word("frost"),
      word("ice"),
      word("sun"),
      word("star"),
      word("stars"),
    ],
  },
  {
    theme: "letting-go",
    phrases: [
      sub("let go"),
      sub("letting go"),
      sub("drop off"),
      sub("dropping off"),
      sub("drop body and mind"),
      sub("drops away"),
      sub("fell away"),
      sub("falls away"),
      sub("set down"),
      sub("put down"),
      sub("throw away"),
      word("release"),
      word("releasing"),
      word("abandon"),
      word("surrender"),
      sub("free of"),
      sub("free from"),
      sub("nothing to grasp"),
      sub("not holding"),
      word("renounce"),
    ],
  },
  {
    theme: "paradox",
    phrases: [
      sub("iron ox"),
      sub("wooden man"),
      sub("wooden horse"),
      sub("stone woman"),
      sub("stone tiger"),
      sub("mute"),
      sub("blind donkey"),
      sub("one hand"),
      sub("sound of one"),
      sub("before your parents"),
      sub("before you were born"),
      sub("neither yes nor no"),
      sub("no tongue"),
      sub("eyebrows"),
      sub("snake's leg"),
      sub("flower without"),
      sub("the dog has"),
      sub("a dog has"),
      sub("east mountain walks"),
      sub("a flag"),
      sub("painted cake"),
    ],
  },
  {
    theme: "patriarchs",
    phrases: [
      word("patriarch"),
      word("patriarchs"),
      word("ancestor"),
      word("ancestors"),
      word("bodhidharma"),
      word("mahākāśyapa"),
      word("mahakashyapa"),
      word("kasyapa"),
      word("huineng"),
      word("hongren"),
      word("daoxin"),
      word("sengcan"),
      word("huike"),
      sub("first ancestor"),
      sub("sixth patriarch"),
      sub("sixth ancestor"),
      sub("first patriarch"),
      sub("from the west"),
      sub("came from the west"),
      word("linji"),
      word("mazu"),
      word("zhaozhou"),
      word("joshu"),
      word("yunmen"),
      word("dongshan"),
      word("nanyue"),
      word("qingyuan"),
    ],
  },
  {
    theme: "lineage",
    phrases: [
      word("lineage"),
      word("transmission"),
      word("transmit"),
      word("transmitted"),
      word("transmits"),
      word("inka"),
      word("inheritance"),
      word("inherited"),
      sub("dharma heir"),
      sub("dharma heirs"),
      sub("dharma transmission"),
      sub("teacher to student"),
      sub("teacher and student"),
      sub("master and disciple"),
      sub("robe and bowl"),
      sub("robe was passed"),
      sub("the robe"),
      sub("the bowl"),
      word("successor"),
      word("predecessor"),
      sub("generation to generation"),
      sub("from teacher"),
    ],
  },
  {
    theme: "study",
    phrases: [
      word("sutra"),
      word("sutras"),
      word("scripture"),
      word("scriptures"),
      word("text"),
      word("texts"),
      word("study"),
      word("studied"),
      word("studying"),
      word("read"),
      word("reading"),
      word("letters"),
      word("words"),
      word("scholar"),
      word("scholarly"),
      word("book"),
      word("books"),
      word("discourse"),
      word("doctrine"),
      word("commentary"),
      word("treatise"),
      sub("the sūtra"),
      sub("the scripture"),
      sub("the canon"),
      sub("learning"),
      word("instruction"),
      word("instructions"),
      sub("written"),
      sub("recorded"),
    ],
  },
];

export interface ThemeableTeaching {
  title?: string | null;
  content?: string | null;
}

export function themesForTeaching(t: ThemeableTeaching): ThemeSlug[] {
  const haystack = `${t.title ?? ""}\n${t.content ?? ""}`;
  const matched = new Set<ThemeSlug>();
  for (const rule of RULES) {
    if (rule.phrases.some((re) => re.test(haystack))) {
      matched.add(rule.theme);
    }
  }
  // Practice is the default fallback when nothing matches — the
  // /proverbs/themes/practice page is the broadest catch-all.
  if (matched.size === 0) matched.add("practice");
  return Array.from(matched);
}
