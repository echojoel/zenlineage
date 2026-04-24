# Editorial policy

This document governs how we cite, translate, and communicate uncertainty in
the data shown on zenlineage.org. It is the reference every contributor works
from. The accuracy audit (`npm run audit:accuracy`) enforces the mechanical
parts.

The core commitment: **every claim on the site is either cited, or is
explicitly marked as uncertain.** We prefer showing "unknown" over showing a
confident-looking fabrication. This is a reference work about living religious
traditions and the people they rest on — being wrong misleads readers in ways
that matter.

## 1. Provenance

### Sources

All sources live in the `sources` table with a `reliability` field:

| reliability | meaning | examples |
|---|---|---|
| `authoritative` | primary, canonical, or definitive | Taishō Tripiṭaka; official monastery records |
| `scholarly` | peer-reviewed or university-press monograph | Dumoulin, Buswell, Faure, McRae |
| `primary` | original-source text (sutras, recorded sayings, master's own writings) | _Shōbōgenzō_, _Record of Linji_ |
| `secondary` | general-interest non-fiction held to a scholarly standard | Addiss, Aitken, Leighton |
| `editorial` | material we wrote for the project, sourced from the above | the taxonomy prose in `src/lib/school-taxonomy.ts` |
| `popular` | Wikipedia, blogs, popular magazine articles | flagged by the audit; should be replaced where possible |

Aim for **two independent sources** for Tier-1 masters on every substantive
claim. `popular` sources are acceptable for discovery but should be backed by
at least one non-popular source for every fact we publish.

### Citations

The `citations` table connects `(entityType, entityId, fieldName?) → sourceId`.
Use `fieldName` whenever the claim is narrower than "the whole record" —
e.g., a citation specifically supporting `birth_year` rather than the master's
existence in general.

**Whenever you add or change a field with an uncertain fact, add a citation
for that field.**

### Assertions and disputes

Contested facts go in the `assertions` table with `status` ∈ {accepted,
disputed, rejected}. Examples of claims that should be modeled this way:

- Bodhidharma's traditional arrival year (520 CE)
- Huineng's literal authorship of the _Platform Sutra_
- The twenty-eight Indian patriarchs as a historical chain (vs. a retroactive
  Chinese construction)
- Any master whose dates are attested only in hagiography

When the same fact has multiple plausible values, record each as a separate
assertion with its own citation. The UI should surface the dispute rather
than silently pick one.

## 2. Uncertainty markers

Every date field has two companions: `*_precision` and `*_confidence`.

### Precision

| value | meaning |
|---|---|
| `exact` | year attested in reliable sources (e.g., Dōgen 1200–1253) |
| `circa` | year approximate (±5 years); render with "c." prefix |
| `century` | only the century is known (e.g., "6th century") |
| `unknown` | date is unknown; render as "dates unknown" |

**Use `unknown` liberally.** When both birth and death are null, set
`birth_precision='unknown'` and `death_precision='unknown'` — the accuracy
audit flags silent gaps (null dates without an `unknown` marker) as warnings
for other masters, critical for Tier-1.

### Confidence

| value | meaning |
|---|---|
| `high` | attested across multiple authoritative/scholarly sources |
| `medium` | one authoritative source, or agreement between two scholarly |
| `low` | contested, or based on hagiography / popular sources only |

A `low` confidence date published without a citation is an accuracy risk —
readers see "1243" and believe it. The audit flags these as critical for
Tier-1.

## 3. Names and romanization

Every master has a record in `master_names(masterId, locale, nameType, value)`.
`nameType` is one of `dharma` / `birth` / `honorific` / `alias`.

### Expected scripts by tradition

The accuracy audit checks that at least one name for each master contains
characters in the script native to that master's tradition:

| tradition | school slugs | expected script |
|---|---|---|
| Indian | `indian-patriarchs` | Devanagari (Sanskrit) |
| Chinese Chan | `chan`, `early-chan`, `qingyuan-line`, `nanyue-line`, `caodong`, `linji`, `yunmen`, `fayan`, `guiyang`, `yangqi-line` | CJK ideographs |
| Japanese Zen | `soto`, `rinzai`, `obaku`, `sanbo-zen` | CJK ideographs (kanji) |
| Korean Seon | `seon`, `jogye`, `kwan-um`, `taego-order` | Hangul or Hanja (CJK) |
| Vietnamese Thiền | `thien`, `lam-te`, `truc-lam`, `plum-village` | Latin with Vietnamese tone marks |

### Romanization schemes

Use these schemes consistently when creating English aliases:

| language | scheme | notes |
|---|---|---|
| Chinese | Hanyu Pinyin (no tone marks in slugs, optional in display names) | Wade-Giles may appear as a secondary alias |
| Japanese | Modified Hepburn (with long-vowel macrons in the canonical name) | kunrei-shiki not used in this project |
| Korean | Revised Romanization (RR); McCune–Reischauer as a secondary alias | RR is the canonical form |
| Vietnamese | Full tone marks required (e.g., Thích Nhất Hạnh, not Thich Nhat Hanh) | ASCII-only Vietnamese names are a data bug |
| Sanskrit | IAST for primary names; simplified ASCII aliases acceptable as secondary | Devanagari preferred as the canonical script |

### Locale tagging

The `locale` column on `master_names` identifies the language of the
surrounding romanization (`en`, `sa`, `zh`, `ja`, `ko`, `vi`). A Japanese
master's name in kanji should be tagged `ja`, not `zh` — even though the
characters overlap with Chinese. The audit is permissive on this
(it checks script presence, not locale tag), but the tagging should be
corrected opportunistically.

## 4. Attribution of teachings

`teachings.attribution_status` takes three values:

| status | meaning | citation requirement |
|---|---|---|
| `verified` | a named master historically demonstrated or transmitted this teaching | citation at the teaching level |
| `traditional` | the tradition attributes this to the named master, but historical authorship is unclear | citation at `attribution_status` explaining the traditional attribution |
| `unresolved` | authorship or attribution is unknown or contested | citation explaining the unresolved status |

**Never quietly mark an attribution as `verified` to avoid the citation
requirement.** The `traditional` category is honorable — most of the Tang
masters' most famous sayings are traditionally attributed, not historically
verified. Our job is to be transparent about which is which.

## 5. Licensing of translations

Every `teaching_content` row must set `license_status`:

| status | meaning |
|---|---|
| `public_domain` | pre-1928 translations, or explicitly PD releases |
| `cc_by` | CC-BY; credit the translator |
| `cc_by_sa` | CC-BY-SA; downstream must share alike |
| `fair_use` | short excerpts used under fair use; flag for review |
| `unknown` | flagged by the audit; must be resolved |

**Prefer public-domain or CC-licensed translations.** When no usable
translation exists, commission or write one and record it as `cc_by` with
explicit author credit.

## 6. Tiering and review priority

`src/lib/editorial-tiers.ts` classifies 65 Tier-1 masters by `reason`:
patriarch / founder / major_lineage_bridge / historically_central_teacher /
modern_transmitter. The accuracy audit reports Tier-1 issues at a higher
severity.

Review priority:
1. Tier-1 masters, by `reason` order as above
2. Masters who appear on the Timeline or in the About page narrative
3. Masters whose authored teachings appear on the site
4. All other masters

## 7. The audit

`npm run audit:accuracy` produces `reports/accuracy-report.md` +
`reports/accuracy-report.csv`. Commit changes to the baseline reports when
they improve; CI gates on the CRITICAL count (0 must remain 0).

Categories reported:

| category | what it flags |
|---|---|
| `dates-silent-gap` | both birth/death null, no `unknown` precision marker |
| `date-uncited` | non-null birth/death with no citation |
| `low-confidence-uncited` | low-confidence date without a supporting citation |
| `school-uncited` | school affiliation with no citation |
| `native-script-missing` | no name in the expected native script |
| `transmission-uncited` | transmission edge with no citation |
| `attribution-uncited` | traditional/unresolved teaching with no citation |
| `license-unset` | teaching translation with no license status |
| `teaching-unattributed` | teaching with no author and no master_role |
| `source-popular` | source with `reliability='popular'` |

## 8. When in doubt

- If you can't find a source for a claim, either find one or mark the claim
  with appropriate precision/confidence. Don't publish it as certain.
- If two sources disagree, record it as an `assertion` with `status='disputed'`.
- If a teaching's traditional attribution is the standard lineage story but
  modern scholarship doubts it, use `attribution_status='traditional'` and
  cite both the traditional source and the scholarly doubt.
- If a master has no native-script name available, add a note explaining why
  (e.g., the master is attested only in later Chinese translations).

The site is built in public and open to correction. Readers will email.
Log their corrections against the record and cite the correspondence where
useful.
