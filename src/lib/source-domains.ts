export type DomainClass =
  | "institutional"
  | "academic"
  | "sangha"
  | "reference"
  | "community"
  | "promotional";

export interface DomainEntry {
  /** Domain or domain + path prefix. Matched as a suffix on hostname; if it
   *  contains a "/", the part after must be a path prefix of the URL. */
  pattern: string;
  class: DomainClass;
  publisher: string;
  note?: string;
}

/** Hand-curated allow-list. Extend by PR as new sources are seen. The
 *  longest matching pattern wins so subdomains can override roots. */
export const SOURCE_DOMAINS: DomainEntry[] = [
  // --- institutional: traditions' own organisations ---
  { pattern: "global.sotozen-net.or.jp", class: "institutional", publisher: "Sōtōshū Shūmuchō (Soto Zen Buddhism)" },
  { pattern: "sotozen-net.or.jp", class: "institutional", publisher: "Sōtōshū Shūmuchō" },
  { pattern: "whiteplum.org", class: "institutional", publisher: "White Plum Asanga" },
  { pattern: "sanboji.org", class: "institutional", publisher: "Sanbō Zen International" },
  { pattern: "sanbo-zen.org", class: "institutional", publisher: "Sanbō Zen International" },
  { pattern: "azi.org", class: "institutional", publisher: "Association Zen Internationale" },
  { pattern: "kosenrinzaiji.fr", class: "institutional", publisher: "Kōsen Rinzai-ji" },
  { pattern: "templekanshoji.com", class: "institutional", publisher: "Temple Kanshōji" },
  { pattern: "zenroad.org", class: "institutional", publisher: "Zen Road" },
  { pattern: "abze.org", class: "institutional", publisher: "Asociación Budista Zen España" },
  { pattern: "plumvillage.org", class: "institutional", publisher: "Plum Village" },
  { pattern: "kwanumzen.org", class: "institutional", publisher: "Kwan Um School of Zen" },
  { pattern: "diamond-sangha.org", class: "institutional", publisher: "Diamond Sangha" },
  { pattern: "mro.org", class: "institutional", publisher: "Mountains and Rivers Order" },
  { pattern: "zmm.org", class: "institutional", publisher: "Zen Mountain Monastery" },
  { pattern: "sfzc.org", class: "institutional", publisher: "San Francisco Zen Center" },
  { pattern: "zcla.org", class: "institutional", publisher: "Zen Center of Los Angeles" },
  { pattern: "shasta-abbey.org", class: "institutional", publisher: "Shasta Abbey" },
  { pattern: "rinnou.net", class: "institutional", publisher: "Rinzai-Ōbaku Zen" },
  { pattern: "obakusan.or.jp", class: "institutional", publisher: "Ōbaku Mampuku-ji" },
  { pattern: "eiheiji.jp", class: "institutional", publisher: "Eihei-ji" },
  { pattern: "sojiji.jp", class: "institutional", publisher: "Sōji-ji" },
  { pattern: "myoshin-ji.or.jp", class: "institutional", publisher: "Myōshin-ji" },
  { pattern: "daihonzan-eiheiji.com", class: "institutional", publisher: "Eihei-ji" },

  // --- academic ---
  { pattern: "jstor.org", class: "academic", publisher: "JSTOR" },
  { pattern: "britannica.com", class: "academic", publisher: "Encyclopædia Britannica" },
  { pattern: "oxfordreference.com", class: "academic", publisher: "Oxford Reference" },
  { pattern: "cambridge.org", class: "academic", publisher: "Cambridge University Press" },
  { pattern: "academia.edu", class: "academic", publisher: "Academia.edu" },
  { pattern: "doi.org", class: "academic", publisher: "DOI" },
  { pattern: "muse.jhu.edu", class: "academic", publisher: "Project MUSE" },
  { pattern: "thezensite.com", class: "academic", publisher: "The Zen Site" }, // academic-leaning archive
  { pattern: "buddhistdoor.net", class: "academic", publisher: "Buddhistdoor Global" },
  { pattern: "press.uchicago.edu", class: "academic", publisher: "University of Chicago Press" },
  { pattern: "shambhala.com", class: "academic", publisher: "Shambhala (publisher)" }, // book pages w/o /buy
  { pattern: "wisdomexperience.org", class: "academic", publisher: "Wisdom Publications" },
  { pattern: "terebess.hu", class: "academic", publisher: "Terebess Asia Online" },

  // --- reference (cap on tier contribution) ---
  { pattern: "en.wikipedia.org", class: "reference", publisher: "Wikipedia (English)" },
  { pattern: "ja.wikipedia.org", class: "reference", publisher: "Wikipedia (Japanese)" },
  { pattern: "zh.wikipedia.org", class: "reference", publisher: "Wikipedia (Chinese)" },
  { pattern: "ko.wikipedia.org", class: "reference", publisher: "Wikipedia (Korean)" },
  { pattern: "vi.wikipedia.org", class: "reference", publisher: "Wikipedia (Vietnamese)" },

  // --- sangha (dharma centres / zendos) ---
  { pattern: "treeleaf.org", class: "sangha", publisher: "Treeleaf Zendo" },
  { pattern: "upaya.org", class: "sangha", publisher: "Upaya Zen Center" },
  { pattern: "everydayzen.org", class: "sangha", publisher: "Everyday Zen Foundation" },
  { pattern: "openheartzen.com", class: "sangha", publisher: "Open Heart Zen" },
  { pattern: "blueheronsangha.org", class: "sangha", publisher: "Blue Heron Zen Community" },
];

/** Deny-list patterns. Any source URL matching one of these is a hard
 *  audit error. Matched against the full URL. */
export const PROMOTIONAL_DENY: RegExp[] = [
  /(^|\.)amazon\.[a-z.]+\//i,
  /(^|\.)goodreads\.com\//i,
  /\/dp\/[A-Z0-9]+/i,
  /\/(buy|shop|store)(\/|$)/i,
  /(^|\.)substack\.com\/p\//i,
  /(^|\.)patreon\.com\//i,
  /(\?|&)tag=[^&]*-20(&|$)/i,            // amazon affiliate tag
  /(^|\.)bookshop\.org\//i,               // book retailer
  /(^|\.)abebooks\.[a-z.]+\//i,
];

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function pathnameOf(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

function patternMatches(entry: DomainEntry, host: string, path: string): boolean {
  const [domain, ...pathParts] = entry.pattern.split("/");
  if (host !== domain && !host.endsWith("." + domain)) return false;
  if (pathParts.length === 0) return true;
  const expected = "/" + pathParts.join("/");
  return path.startsWith(expected);
}

export function classifyUrl(url: string): {
  class: DomainClass | "unknown";
  publisher: string | null;
} {
  for (const re of PROMOTIONAL_DENY) {
    if (re.test(url)) return { class: "promotional", publisher: null };
  }
  const host = hostnameOf(url);
  const path = pathnameOf(url);
  if (!host) return { class: "unknown", publisher: null };

  let best: DomainEntry | null = null;
  for (const entry of SOURCE_DOMAINS) {
    if (!patternMatches(entry, host, path)) continue;
    if (best === null || entry.pattern.length > best.pattern.length) best = entry;
  }
  if (best) return { class: best.class, publisher: best.publisher };
  return { class: "unknown", publisher: null };
}
