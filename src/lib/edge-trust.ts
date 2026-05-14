import matter from "gray-matter";
import { classifyUrl, type DomainClass, PROMOTIONAL_DENY } from "@/lib/source-domains";

export type Tier = "A" | "B" | "C" | "D";

export interface EvidenceSource {
  publisher: string;
  url: string;
  domain_class: DomainClass | "unknown";
  retrieved_on: string;
  quote: string;
}

export interface ParsedEvidence {
  student: string;
  teacher: string;
  tier: Tier;
  verified_at: string | null;
  sources: EvidenceSource[];
  reducer_notes: string | null;
  reviewer_notes: string | null;
  human_review_needed: boolean;
}

export type ParseResult =
  | { ok: true; parsed: ParsedEvidence }
  | { ok: false; errors: string[] };

const TIERS: ReadonlySet<Tier> = new Set(["A", "B", "C", "D"]);
const VALID_CLASS: ReadonlySet<string> = new Set([
  "institutional",
  "academic",
  "sangha",
  "reference",
  "community",
  "promotional",
  "unknown",
]);
const MIN_QUOTE_LEN = 40;

export function parseEvidenceFile(raw: string): ParseResult {
  const errors: string[] = [];
  let fm: matter.GrayMatterFile<string>;
  try {
    fm = matter(raw);
  } catch (e) {
    return { ok: false, errors: [`invalid frontmatter: ${(e as Error).message}`] };
  }
  const data: Record<string, unknown> = fm.data ?? {};

  const req = (k: string) => {
    if (data[k] === undefined || data[k] === null || data[k] === "") {
      errors.push(`missing required field: ${k}`);
    }
  };
  req("student");
  req("teacher");
  req("tier");

  const tier = data.tier as string;
  if (tier && !TIERS.has(tier as Tier)) {
    errors.push(`tier must be one of A/B/C/D, got: ${tier}`);
  }

  const sourcesRaw = data.sources;
  const sources: EvidenceSource[] = [];
  if (sourcesRaw !== undefined && !Array.isArray(sourcesRaw)) {
    errors.push("sources must be a list");
  } else if (Array.isArray(sourcesRaw)) {
    sourcesRaw.forEach((s: Record<string, unknown>, i: number) => {
      const where = `sources[${i}]`;
      const requireSrc = (k: string) => {
        if (s[k] === undefined || s[k] === null || s[k] === "") {
          errors.push(`${where}.${k} is required`);
        }
      };
      requireSrc("publisher");
      requireSrc("url");
      requireSrc("domain_class");
      requireSrc("retrieved_on");
      requireSrc("quote");
      const dc = s.domain_class as string;
      if (dc && !VALID_CLASS.has(dc)) {
        errors.push(`${where}.domain_class invalid: ${dc}`);
      }
      const q = (s.quote as string) ?? "";
      if (q.length > 0 && q.length < MIN_QUOTE_LEN) {
        errors.push(`${where}.quote is ${q.length} chars, minimum ${MIN_QUOTE_LEN}`);
      }
      sources.push({
        publisher: String(s.publisher ?? ""),
        url: String(s.url ?? ""),
        domain_class: (dc as DomainClass | "unknown") ?? "unknown",
        retrieved_on: String(s.retrieved_on ?? ""),
        quote: q,
      });
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    parsed: {
      student: String(data.student),
      teacher: String(data.teacher),
      tier: tier as Tier,
      verified_at: (data.verified_at as string) ?? null,
      sources,
      reducer_notes: (data.reducer_notes as string) ?? null,
      reviewer_notes: (data.reviewer_notes as string) ?? null,
      human_review_needed: Boolean(data.human_review_needed),
    },
  };
}

/** Compute tier from sources alone, ignoring the declared tier. */
export function computeTier(sources: EvidenceSource[]): Tier {
  if (sources.length === 0) return "D";
  if (sources.some((s) => s.domain_class === "promotional")) return "D";
  // Any sources with deny-list URLs override class to D
  if (sources.some((s) => PROMOTIONAL_DENY.some((re) => re.test(s.url)))) return "D";

  const hosts = new Set(sources.map((s) => canonicalHost(s.url) || s.url));
  const independent = hosts.size;

  const counts: Record<DomainClass | "unknown", number> = {
    institutional: 0,
    academic: 0,
    sangha: 0,
    reference: 0,
    community: 0,
    promotional: 0,
    unknown: 0,
  };
  for (const s of sources) counts[s.domain_class]++;

  // Tier A: ≥1 institutional + ≥1 independent corroboration from anything
  // except promotional. Independence is approximated by distinct hostname.
  if (counts.institutional >= 1 && independent >= 2) return "A";

  // Tier B: ≥2 independent sources, ≥1 academic or institutional.
  if (independent >= 2 && counts.academic + counts.institutional >= 1) return "B";

  // Tier C: exactly one credible (non-promotional, non-community-only).
  // Community alone never reaches C (corroborative only) — bump to D.
  const nonCommunity =
    counts.institutional + counts.academic + counts.sangha + counts.reference;
  if (nonCommunity >= 1) return "C";

  return "D";
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** Collapse Wikipedia language editions to a single logical source.
 *  The spec rule: "Wikipedia counts as one source max, regardless of how
 *  many language editions cite it." e.g. en.wikipedia.org and
 *  ja.wikipedia.org both canonicalise to "wikipedia.org". */
function canonicalHost(url: string): string {
  const h = safeHost(url);
  if (/^[a-z-]+\.wikipedia\.org$/.test(h)) return "wikipedia.org";
  return h;
}

export interface ValidationIssue {
  kind:
    | "tier-mismatch"
    | "promotional-source"
    | "quote-too-short"
    | "unknown-domain"
    | "stale"
    | "missing-required";
  detail: string;
}

export function validateEvidence(p: ParsedEvidence): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const s of p.sources) {
    if (s.domain_class === "promotional") {
      issues.push({ kind: "promotional-source", detail: `${s.url} (${s.publisher})` });
    }
    if (PROMOTIONAL_DENY.some((re) => re.test(s.url))) {
      issues.push({ kind: "promotional-source", detail: `${s.url} matches deny pattern` });
    }
    if (s.quote.length < 40) {
      issues.push({ kind: "quote-too-short", detail: `${s.url} quote=${s.quote.length}ch` });
    }
    if (s.domain_class === "unknown") {
      issues.push({ kind: "unknown-domain", detail: `${s.url}` });
    } else {
      // Spot-check that domain_class agrees with classifyUrl
      const c = classifyUrl(s.url);
      if (c.class !== "unknown" && c.class !== s.domain_class) {
        issues.push({
          kind: "tier-mismatch",
          detail: `${s.url}: declared ${s.domain_class}, classifier says ${c.class}`,
        });
      }
    }
  }
  const computed = computeTier(p.sources);
  if (computed !== p.tier) {
    issues.push({
      kind: "tier-mismatch",
      detail: `declared tier ${p.tier} but computed ${computed}`,
    });
  }
  if (p.verified_at) {
    const ageDays = (Date.now() - Date.parse(p.verified_at)) / 86_400_000;
    if (ageDays > 547) issues.push({ kind: "stale", detail: `verified_at ${p.verified_at}` });
  }
  return issues;
}
