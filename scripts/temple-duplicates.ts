/**
 * Detect the same place of practice seeded twice.
 *
 * The atlas is assembled from two kinds of list: the hand-curated rows in
 * `scripts/data/seed-temples.ts`, and the rows generated from the research
 * extracts in `scripts/data/raw-places/*.json` by
 * `scripts/build-europe-temples.ts`. Nothing reconciles the two — slugs are
 * the DB primary key, and `templo-seikyuji` and `seikyuji-sevilla` are
 * different slugs — so a temple that appears in both lists is pinned twice.
 *
 * That is not merely cosmetic. The duplicate almost always carries the worse
 * coordinate: the curated row is written from a description ("near Seville")
 * while the generated row geocodes a street address, or the reverse when the
 * extract's address is malformed and Nominatim falls back to a city centroid.
 * The reader then sees one temple in its olive grove and a second copy of it
 * downtown, 57 km away.
 *
 * `DUP_PATTERNS` in the builder is the fix for a *known* collision. This
 * module is what finds the unknown ones, so the list can be extended before a
 * duplicate ships.
 *
 * Usage:
 *   npx tsx scripts/check-temple-duplicates.ts
 */

import type { TempleSeed } from "./data/seed-temples";

export type DuplicateSignal = "same-name" | "same-host" | "shared-doorstep";

export interface DuplicateCluster {
  signal: DuplicateSignal;
  /** Human-readable reason, e.g. `same-name:Spain::seikyuji`. */
  detail: string;
  slugs: string[];
  /** Greatest pairwise distance within the cluster, metres. */
  spreadMeters: number;
}

/**
 * Words that carry no identifying force in a temple name. Stripped before
 * comparison so "Templo Zen Seikyūji" and "Templo Seikyuji" collapse onto
 * the same key, while "Zen Center of Los Angeles" and "Zen Center of San
 * Diego" stay apart on the part that actually names them.
 */
const GENERIC_WORDS = new Set([
  "templo", "temple", "tempel", "tempio", "zen", "chan", "seon", "thien",
  "dojo", "dojos", "centro", "center", "centre", "zentrum", "senter",
  "zendo", "zendos", "monastery", "monasterio", "monastero", "kloster",
  "sangha", "group", "grupo", "gruppe", "groupe", "groep", "community",
  "comunidad", "comunita", "association", "asociacion", "associazione",
  "buddhist", "budista", "buddhista", "buddhistisch", "meditation",
  "meditacion", "meditazione", "practice", "practica", "of", "the", "de",
  "del", "della", "di", "la", "le", "les", "el", "los", "las", "und", "and",
  "et", "y", "e", "a", "van", "der", "den", "im", "in",
]);

/** Hosts that many unrelated sanghas link because they are directories or
 * umbrella bodies, not the place's own site. A shared host among these
 * proves nothing about identity. */
const DIRECTORY_HOSTS = new Set([
  "sotozen.com", "sotozen.es", "sotozen.no", "kwanumzen.org",
  "americas.kwanumzen.org", "sanbo-zen.org", "sanbo-zen-international.org",
  "plumvillage.org", "wkup.org", "szba.org", "diamondsangha.org",
  "iriz.hanazono.ac.jp", "zen.rinnou.net", "buddhanet.info",
  "bouddhisme-france.org", "abzen.eu", "zenpeacemakers.org",
  "vi.wikipedia.org", "en.wikipedia.org", "ja.wikipedia.org",
  "giacngo.vn", "phatgiao.org.vn", "thegioiphatgiao.net", "ctworld.org",
]);

/**
 * Pairs the audit has already looked at and confirmed to be genuinely two
 * places. Each needs a reason: the point of the guard is that a collision is
 * suspicious until somebody checks, and an unexplained entry here is
 * indistinguishable from a duplicate somebody silently muted.
 */
const VERIFIED_DISTINCT: { pair: [string, string]; reason: string }[] = [
  {
    pair: ["shofuku-ji", "shofuku-ji-nagasaki"],
    reason:
      "Different temples that collide only in romanisation: 祥福寺 (Rinzai, Kobe) and 聖福寺 (Ōbaku, Nagasaki).",
  },
  // ── One organisation, several venues ────────────────────────────────
  {
    pair: ["dojo-zen-de-quimper", "association-zen-cornouailles"],
    reason:
      "Two AZI groups under one Finistère site: the Quimper dōjō at 18 rue du Couëdic, and the Bénodet cell 13km south.",
  },
  {
    pair: ["shodo-dojo", "shodo-dojo-halle"],
    reason:
      "shododojo.be/waar-beoefenen lists both: Tour à Plomb in central Brussels, and the Halle pavilion 17km south-west.",
  },
  {
    pair: [
      "zenboeddhistisch-centrum-wolk-en-water-brugge",
      "zenboeddhistisch-centrum-wolk-en-water-oostende",
    ],
    reason:
      "Wolk en Water runs two weekly dōjōs with separate street addresses: Zuienkerke near Bruges, and Stuiverstraat in Ostend.",
  },
  {
    pair: [
      "zen-dogen-sangha-belgique-la-hulpe",
      "zen-dogen-sangha-belgique-louvain-la-neuve",
    ],
    reason:
      "One small association, two rented rooms 12km apart: Centre Oxyzen in La Hulpe and Centre Reliance in Louvain-la-Neuve.",
  },
  {
    pair: ["su-bong-zen-monastery", "gak-su-temple-international-zen-center"],
    reason:
      "Both Kwan Um Hong Kong, but Su Bong is the Causeway Bay city monastery and Gak Su the Lantau retreat temple, 28km apart.",
  },
  // ── Coincidental name collisions ────────────────────────────────────
  {
    pair: ["montreal-zen-center-centre-zen-de-montreal", "association-zen-de-montreal"],
    reason:
      "Unrelated Montréal organisations sharing only the city name: Parc-Stanley (Kapleau line) and rue Gilford (AZI).",
  },
  {
    pair: ["toronto-zen-centre", "zen-buddhist-temple-toronto"],
    reason: "Distinct Toronto organisations: 33 High Park Gardens (Sanbō Zen) and 86 Vaughan Road.",
  },
  {
    pair: ["toronto-zen-centre", "toronto-zendo"],
    reason: "Distinct Toronto organisations grouped only by the city name.",
  },
  {
    pair: ["zen-buddhist-temple-toronto", "toronto-zendo"],
    reason: "Distinct Toronto organisations grouped only by the city name.",
  },
  {
    pair: ["centre-zen-de-limoges", "zendo-de-limoges"],
    reason:
      "Two Limoges groups: different domains, teachers and contacts. Centre Zen names Hosetsu Laure Scemama and a street address; Zendo de Limoges names neither.",
  },
  {
    pair: ["oxford-zen-centre", "oxford-sangha"],
    reason:
      "Oxford Zen Centre is Sanbō Zen; Oxford Sangha is a Plum Village group. Neither publishes a venue, so both hold the city pin.",
  },
  {
    pair: ["sfzc-city-center", "beginner-s-mind-zen-center"],
    reason:
      "SFZC's City Center is nicknamed Beginner's Mind Temple; the Northridge centre of that name is unrelated and 530km south.",
  },
  {
    pair: ["morning-star-zen-center", "morning-star-zendo"],
    reason:
      "'Morning Star' is common Zen naming (Buddha's enlightenment at the morning star). Fayetteville AR and Jersey City NJ are unrelated.",
  },
  {
    pair: ["ryoan-ji", "daishu-in"],
    reason:
      "Daishū-in is a sub-temple inside the Ryōan-ji precinct. 110m apart is the true relationship, not a duplicate pin.",
  },
  {
    pair: ["po-lin-monastery", "lotus-pond-temple"],
    reason:
      "Separate institutions sharing the Ngong Ping plateau on Lantau: the 1906 Chan monastery, and Plum Village's Asian Institute of Applied Buddhism.",
  },
  {
    pair: ["bo-hyun-sa", "south-florida-zen-group"],
    reason:
      "Bo Hyun Sa is a Jogye-order temple building in Southwest Ranches; the Kwan Um group is a sangha that sits there twice a week and at a Dania Beach venue on a third night.",
  },
  {
    pair: ["birmingham-chan-group", "birmingham-sangha"],
    reason:
      "Western Chan Fellowship at the Edgbaston Quaker Meeting House, and a Community of Interbeing sangha at Kings Heath — opposite sides of the city.",
  },
];

const verifiedKeys = new Set(
  VERIFIED_DISTINCT.map(({ pair }) => [...pair].sort().join("|"))
);

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/** Identifying core of a name: diacritics folded, generic words dropped,
 * remaining words sorted so word order does not matter. */
export function nameKey(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter((word) => word.length > 0 && !GENERIC_WORDS.has(word))
    .sort()
    .join(" ");
}

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/** Great-circle distance in metres. */
export function distanceMeters(a: TempleSeed, b: TempleSeed): number {
  const R = 6_371_000;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** A shared website among a handful of entries suggests one organisation;
 * among dozens it is a national network whose branches are distinct. */
const MAX_HOST_CLUSTER = 6;
/** Two branches of one network in different towns are distinct places. Only
 * same-host entries this close are worth flagging as possibly one place. */
const HOST_SPREAD_LIMIT_M = 30_000;
/** Two `exact` pins this close are on the same doorstep. Two `city` pins
 * sharing a town centroid is expected and never flagged. */
const DOORSTEP_LIMIT_M = 120;

export function findDuplicateSuspects(seeds: TempleSeed[]): DuplicateCluster[] {
  const clusters: DuplicateCluster[] = [];
  const claimed = new Set<string>();

  const pairKey = (a: TempleSeed, b: TempleSeed) =>
    [a.slug, b.slug].sort().join("|");

  const spreadOf = (members: TempleSeed[]) =>
    Math.round(
      Math.max(
        0,
        ...members.flatMap((a, i) =>
          members.slice(i + 1).map((b) => distanceMeters(a, b))
        )
      )
    );

  const claimAll = (members: TempleSeed[]) => {
    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        claimed.add(pairKey(members[i], members[j]));
      }
    }
  };

  const allVerified = (members: TempleSeed[]) =>
    members.every((a, i) =>
      members.slice(i + 1).every((b) => verifiedKeys.has(pairKey(a, b)))
    );

  // ── Signal 1: the same identifying name inside one country ───────────
  const byName = new Map<string, TempleSeed[]>();
  for (const seed of seeds) {
    for (const name of seed.names) {
      const key = nameKey(name.value);
      if (key.length < 4) continue;
      const bucket = `${seed.country}::${key}`;
      const members = byName.get(bucket) ?? [];
      if (!members.some((m) => m.slug === seed.slug)) members.push(seed);
      byName.set(bucket, members);
    }
  }
  for (const [bucket, members] of byName) {
    if (members.length < 2 || allVerified(members)) continue;
    clusters.push({
      signal: "same-name",
      detail: bucket,
      slugs: members.map((m) => m.slug).sort(),
      spreadMeters: spreadOf(members),
    });
    claimAll(members);
  }

  // ── Signal 2: one website, a handful of entries, all in one locality ──
  const byHost = new Map<string, TempleSeed[]>();
  for (const seed of seeds) {
    const host = hostOf(seed.url);
    if (!host || DIRECTORY_HOSTS.has(host)) continue;
    byHost.set(host, [...(byHost.get(host) ?? []), seed]);
  }
  for (const [host, members] of byHost) {
    if (members.length < 2 || members.length > MAX_HOST_CLUSTER) continue;
    const spread = spreadOf(members);
    if (spread > HOST_SPREAD_LIMIT_M) continue;
    const fresh = members.some((a, i) =>
      members.slice(i + 1).some((b) => !claimed.has(pairKey(a, b)))
    );
    if (!fresh || allVerified(members)) continue;
    clusters.push({
      signal: "same-host",
      detail: host,
      slugs: members.map((m) => m.slug).sort(),
      spreadMeters: spread,
    });
    claimAll(members);
  }

  // ── Signal 3: two street-level pins on the same doorstep ─────────────
  const byLatitude = [...seeds].sort((a, b) => a.lat - b.lat);
  for (let i = 0; i < byLatitude.length; i += 1) {
    for (
      let j = i + 1;
      j < byLatitude.length && byLatitude[j].lat - byLatitude[i].lat < 0.002;
      j += 1
    ) {
      const a = byLatitude[i];
      const b = byLatitude[j];
      // A town centroid standing in for an unknown address is allowed to
      // coincide with anything; only claimed-exact pins assert a doorstep.
      if ((a.geoPrecision ?? "exact") !== "exact") continue;
      if ((b.geoPrecision ?? "exact") !== "exact") continue;
      if (claimed.has(pairKey(a, b)) || verifiedKeys.has(pairKey(a, b))) continue;
      const distance = distanceMeters(a, b);
      if (distance > DOORSTEP_LIMIT_M) continue;
      clusters.push({
        signal: "shared-doorstep",
        detail: `${Math.round(distance)}m apart`,
        slugs: [a.slug, b.slug].sort(),
        spreadMeters: Math.round(distance),
      });
      claimed.add(pairKey(a, b));
    }
  }

  return clusters.sort(
    (a, b) => a.signal.localeCompare(b.signal) || a.detail.localeCompare(b.detail)
  );
}
