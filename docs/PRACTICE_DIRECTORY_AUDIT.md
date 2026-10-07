# Practice directory audit — 7 October 2026

This is a **triage pass**, not a claim that every place has been personally
verified. It combines a fresh seed of the canonical place records with a
read-only HTTP check of every distinct preferred URL. HTTP results do not
establish a group's current activity, lineage, or safeguarding.

## Coverage

| Check | Result |
|---|---:|
| Place records | 1,697 |
| Distinct preferred URLs checked | 1,331 |
| URLs returning 2xx/3xx | 1,083 |
| URLs returning 404/410 | 22 (used by 27 records) |
| URLs blocked or rate limited | 19 (used by 21 records) |
| URLs with inconclusive network/server results | 207 (used by 215 records) |
| Records with no preferred URL | 18 |
| Records with only a `popular`-class citation | 536 |
| Records queued to check first (overlapping signals combined) | 559 |
| City-level, approximate map pins | 873 |

Every remaining place has exactly one citation, currently attached to `coordinates`.
That citation alone cannot establish affiliation, an active schedule, or a
safeguarding process. The seed labels all 1,697 places `active`, but it has no
per-place last-checked date. The public map and exported JSON no longer expose
that seed status as a verified claim.

The 404/410 set needs human confirmation before changing or removing entries.
For example, the automated client received a 404 from the
[Sōtōshū Shōbōji page](https://www.sotozen.com/eng/temples/jp/shoboji.html),
which remains accessible in a browser and in search. Some other sites may behave
similarly. A failed URL is evidence about this check, not about the group.

## Corrections made during this pass

- The map no longer calls every preferred link an “Official website.” Some
  preferred links are Wikipedia pages or third-party directories. It now says
  “Website or listing.”
- The European and global research-note sources no longer cite the site's own
  practice page as if it were independent evidence. Their seed metadata is
  classified as `popular`, not `primary`.
- The coverage audit now counts “website/listing URLs,” not “official URLs.”
- The public JSON no longer exports the unverified `active` seed status.
- Kwan Um Europe's [Paris group page](https://www.kwanumeurope.org/locations/paris-zen-group/)
  says it is currently inactive as of January 2026. Its map listing was
  removed pending a current practice source.
- Three Hungarian Kwan Um links now lead to the group's
  [current center page](https://kvanumzen.hu/hu/budapesti-zen-kozpont/) or
  [events calendar](https://kvanumzen.hu/en/our-planned-events). An old
  teacher claim was removed from the raw research notes.
- The map can show optional visitor details with a source and check date.
  The first example uses Zen Mountain Monastery's
  [visitor information](https://zmm.org/visiting-the-monastery/).
- Guin-sa was removed because the temple's
  [own temple-stay listing](https://eng.templestay.com/en/MI000000000000000062/temple/introView.do?pageIndex=1&searchKeyword=guinsa&templeIdTmp=Guinsa)
  identifies it as the Cheontae Order's headquarters, outside this
  Zen/Seon directory's scope. This is a classification correction, not a
  safeguarding judgment.
- Heart of Wisdom Zen Temple now links to its
  [current temple page](https://zendust.org/heart-of-wisdom-zen-temple/).

## Next review work

Start with the 27 records whose preferred URL returned 404/410 and the 18
without a preferred URL. Then review the 536 `popular`-only citations against
the underlying group or institutional directories. For each correction, update
the canonical seed or raw place data, cite the direct source, and rerun the
seed and audit. Do not infer misconduct from missing websites or policies.

To reproduce the URL and priority reports locally:

```bash
python3 scripts/check-practice-links.py --output /tmp/practice-links.csv
python3 scripts/audit-practice-directory.py --links /tmp/practice-links.csv > /tmp/practice-review.csv
```
