# Accuracy Audit Report

Field-level correctness gaps — uncited facts, missing uncertainty markers, unattributed teachings. Produced by `scripts/audit-accuracy.ts`. Regenerate with `npm run audit:accuracy`.

## Summary

| severity | count | tier-1 count |
|---|---:|---:|
| CRITICAL | 0 | 0 |
| WARNING | 29 | 29 |
| INFO | 223 | — |
| **total** | **252** | — |

**No CRITICAL issues.** Tier-1 masters have citations for the claims that are hardest to correct after-the-fact.

## Issues by category

### native-script-missing (251)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| WARNING | tier1 | `master/ananda` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/aryadeva` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/ashvaghosha` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/buddhamitra` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/buddhanandi` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/dhritaka` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/gayashata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/haklena` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/jayata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/kapimala` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/kumarata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/mahakashyapa` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/manorhita` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/michaka` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/nagarjuna` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/parshva` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/prajnatara` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/punyamitra` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/punyayashas` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/rahulata` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/sanghanandi` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/shakyamuni-buddha` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/shanakavasa` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/simha` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/upagupta` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/vasasita` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/vasubandhu` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/vasumitra` | names:devanagari | School=indian-patriarchs expects a name in [devanagari] but no name contains characters in those ranges. |
| WARNING | tier1 | `master/yunyan-tansheng` | names:cjk | School=qingyuan-line expects a name in [cjk] but no name contains characters in those ranges. |
| INFO | other | `master/baiyun-shouduan` | names:cjk | School=yangqi-line expects a name in [cjk] but no name contains characters in those ranges. |

_…and 221 more. See `accuracy-report.csv` for the complete list._

### source-popular (1)

| severity | tier | entity | field | detail |
|---|---|---|---|---|
| INFO | — | `source/Wikipedia — temple articles with infobox coordinates` | — | Source reliability='popular'. Consider replacing with a scholarly source or downgrading claims that depend on it. |
