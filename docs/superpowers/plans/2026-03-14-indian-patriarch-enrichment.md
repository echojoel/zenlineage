# Indian Patriarch Data Enrichment Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the major data gaps for all 28 Indian patriarchs (Shakyamuni through Prajnatara) plus Bodhidharma — dates, CJK/Sanskrit names, images, and school assignment — so every Tier 1 patriarch page looks complete.

**Architecture:** Extend the date parser to handle BCE dates, enrich the raw curated data with traditional dates and CJK names, enhance the image pipeline with alternative search terms for Indian names, and re-run the full pipeline.

**Tech Stack:** TypeScript, Drizzle ORM, SQLite, Sharp (image processing), Wikipedia/Wikimedia Commons API, Vitest

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `scripts/reconcile.ts` | Modify (parseDates) | Add BCE date parsing |
| `src/lib/date-format.ts` | Modify | Display negative years as "X BCE" |
| `tests/reconcile.test.ts` | Modify | Add BCE parseDates test cases |
| `tests/date-format.test.ts` | Modify | Add BCE formatting test cases |
| `scripts/data/raw/originals-curated.json` | Modify | Add dates, CJK names, school for 28 patriarchs |
| `scripts/seed-images.ts` | Modify | Add alt search terms + Wikimedia Commons direct search fallback |

---

## Task 1: Extend parseDates for BCE dates

**Files:**
- Modify: `scripts/reconcile.ts:374-445` (parseDates function)
- Test: `tests/reconcile.test.ts`

The current `parseDates` function handles CE dates only. Indian patriarchs need BCE support. Dates are stored as negative integers (e.g., 563 BCE → -563).

- [ ] **Step 1: Write failing tests for BCE date patterns**

In `tests/reconcile.test.ts`, inside the existing `describe("parseDates", ...)` block, add:

```typescript
it("parses 'c. 563-483 BCE' as circa BCE range", () => {
  const result = parseDates("c. 563-483 BCE");
  expect(result.birth).toEqual({ year: -563, precision: "circa", confidence: "medium" });
  expect(result.death).toEqual({ year: -483, precision: "circa", confidence: "medium" });
});

it("parses '563-483 BCE' as exact BCE range", () => {
  const result = parseDates("563-483 BCE");
  expect(result.birth).toEqual({ year: -563, precision: "exact", confidence: "high" });
  expect(result.death).toEqual({ year: -483, precision: "exact", confidence: "high" });
});

it("parses 'c. 150-250 CE' as circa CE range", () => {
  const result = parseDates("c. 150-250 CE");
  expect(result.birth).toEqual({ year: 150, precision: "circa", confidence: "medium" });
  expect(result.death).toEqual({ year: 250, precision: "circa", confidence: "medium" });
});

it("parses 'c. 150-250' as circa range (CE implied)", () => {
  const result = parseDates("c. 150-250");
  expect(result.birth).toEqual({ year: 150, precision: "circa", confidence: "medium" });
  expect(result.death).toEqual({ year: 250, precision: "circa", confidence: "medium" });
});

it("parses 'd. 569 BCE' as exact BCE death", () => {
  const result = parseDates("d. 569 BCE");
  expect(result.birth).toBeNull();
  expect(result.death).toEqual({ year: -569, precision: "exact", confidence: "high" });
});

it("parses 'fl. 2nd c. BCE' as flourished BCE century", () => {
  const result = parseDates("fl. 2nd c. BCE");
  expect(result.birth).toEqual({ year: -150, precision: "century", confidence: "low" });
  expect(result.death).toBeNull();
});

it("parses 'c. 3rd c. BCE' as circa BCE century", () => {
  const result = parseDates("c. 3rd c. BCE");
  expect(result.birth).toEqual({ year: -250, precision: "century", confidence: "low" });
  expect(result.death).toBeNull();
});

it("parses '4th-5th c. CE' as century range", () => {
  const result = parseDates("4th-5th c. CE");
  expect(result.birth).toEqual({ year: 350, precision: "century", confidence: "low" });
  expect(result.death).toEqual({ year: 450, precision: "century", confidence: "low" });
});

it("parses 'trad. 5th c. BCE' as traditional century", () => {
  const result = parseDates("trad. 5th c. BCE");
  expect(result.birth).toEqual({ year: -450, precision: "century", confidence: "low" });
  expect(result.death).toBeNull();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/reconcile.test.ts --reporter=verbose 2>&1 | tail -30`
Expected: New BCE tests fail, existing tests still pass.

- [ ] **Step 3: Implement BCE parsing in parseDates**

In `scripts/reconcile.ts`, add these patterns to `parseDates` BEFORE the existing fallback return. Insert them after the `fl.` pattern (line 417) and before the existing `BIRTH-DEATH` range pattern (line 428):

```typescript
// "c. NNN-NNN BCE" — circa BCE range
const circaBCERange = s.match(/^c\.\s*(\d+)-(\d+)\s*BCE$/i);
if (circaBCERange) {
  return {
    birth: { year: -parseInt(circaBCERange[1], 10), precision: "circa", confidence: "medium" },
    death: { year: -parseInt(circaBCERange[2], 10), precision: "circa", confidence: "medium" },
  };
}

// "NNN-NNN BCE" — exact BCE range
const exactBCERange = s.match(/^(\d+)-(\d+)\s*BCE$/i);
if (exactBCERange) {
  return {
    birth: { year: -parseInt(exactBCERange[1], 10), precision: "exact", confidence: "high" },
    death: { year: -parseInt(exactBCERange[2], 10), precision: "exact", confidence: "high" },
  };
}

// "c. NNN-NNN CE" or "c. NNN-NNN" — circa CE range
const circaCERange = s.match(/^c\.\s*(\d+)-(\d+)(?:\s*CE)?$/i);
if (circaCERange) {
  return {
    birth: { year: parseInt(circaCERange[1], 10), precision: "circa", confidence: "medium" },
    death: { year: parseInt(circaCERange[2], 10), precision: "circa", confidence: "medium" },
  };
}

// "d. NNN BCE" — exact BCE death
const dBCE = s.match(/^d\.\s*(\d+)\s*BCE$/i);
if (dBCE) {
  return {
    birth: null,
    death: { year: -parseInt(dBCE[1], 10), precision: "exact", confidence: "high" },
  };
}

// "fl. Nth c. BCE" — flourished BCE century
const flBCECentury = s.match(/^fl\.\s*(\d+)(?:th|st|nd|rd)\s*c\.\s*BCE$/i);
if (flBCECentury) {
  const centuryNum = parseInt(flBCECentury[1], 10);
  const midpoint = -((centuryNum - 1) * 100 + 50);
  return {
    birth: { year: midpoint, precision: "century", confidence: "low" },
    death: null,
  };
}

// "c. Nth c. BCE" or "trad. Nth c. BCE" — circa/traditional BCE century
const circaBCECentury = s.match(/^(?:c\.|trad\.)\s*(\d+)(?:th|st|nd|rd)\s*c\.\s*BCE$/i);
if (circaBCECentury) {
  const centuryNum = parseInt(circaBCECentury[1], 10);
  const midpoint = -((centuryNum - 1) * 100 + 50);
  return {
    birth: { year: midpoint, precision: "century", confidence: "low" },
    death: null,
  };
}

// "Nth-Nth c. CE" or "Nth-Nth c." — century range
const centuryRange = s.match(/^(\d+)(?:th|st|nd|rd)-(\d+)(?:th|st|nd|rd)\s*c\.(?:\s*CE)?$/i);
if (centuryRange) {
  const birthCentury = parseInt(centuryRange[1], 10);
  const deathCentury = parseInt(centuryRange[2], 10);
  return {
    birth: { year: (birthCentury - 1) * 100 + 50, precision: "century", confidence: "low" },
    death: { year: (deathCentury - 1) * 100 + 50, precision: "century", confidence: "low" },
  };
}
```

**IMPORTANT:** The `circaCERange` pattern (`c. NNN-NNN`) must go AFTER the `circaBCERange` pattern so "c. 563-483 BCE" doesn't get caught by the CE pattern first.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/reconcile.test.ts --reporter=verbose 2>&1 | tail -30`
Expected: All tests pass including new BCE tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/reconcile.ts tests/reconcile.test.ts
git commit -m "feat(dates): extend parseDates to handle BCE dates and century ranges"
```

---

## Task 2: Extend date formatting for BCE display

**Files:**
- Modify: `src/lib/date-format.ts`
- Test: `tests/date-format.test.ts`

Currently `formatDateWithPrecision` displays negative years as literal negative numbers. We need "563 BCE" display.

- [ ] **Step 1: Write failing tests for BCE formatting**

In `tests/date-format.test.ts`, add:

```typescript
import { formatDateWithPrecision, formatLifeRange } from "@/lib/date-format";

describe("BCE date formatting", () => {
  it("formats negative year as BCE", () => {
    expect(formatDateWithPrecision(-563, "exact")).toBe("563 BCE");
  });

  it("formats negative circa year as BCE", () => {
    expect(formatDateWithPrecision(-563, "circa")).toBe("c. 563 BCE");
  });

  it("formats negative century year as BCE century", () => {
    expect(formatDateWithPrecision(-250, "century")).toBe("3rd c. BCE");
  });

  it("formats positive year with CE suffix when era context needed", () => {
    expect(formatDateWithPrecision(150, "circa")).toBe("c. 150");
  });

  it("formats life range with BCE dates", () => {
    expect(formatLifeRange({
      birthYear: -563,
      birthPrecision: "circa",
      deathYear: -483,
      deathPrecision: "circa",
    })).toBe("c. 563 BCE – c. 483 BCE");
  });

  it("formats life range with mixed BCE/CE", () => {
    expect(formatLifeRange({
      birthYear: -50,
      birthPrecision: "circa",
      deathYear: 30,
      deathPrecision: "circa",
    })).toBe("c. 50 BCE – c. 30");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/date-format.test.ts --reporter=verbose 2>&1 | tail -20`
Expected: FAIL — negative years render as "-563" not "563 BCE".

- [ ] **Step 3: Implement BCE-aware formatting**

Replace the contents of `src/lib/date-format.ts`:

```typescript
export interface DateFormatOptions {
  unknown?: string | null;
}

export interface LifeRangeInput {
  birthYear: number | null;
  birthPrecision: string | null;
  deathYear: number | null;
  deathPrecision: string | null;
}

function centuryOrdinal(n: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  const suffix = lastTwo >= 11 && lastTwo <= 13 ? "th" : (suffixes[lastDigit] ?? "th");
  return `${n}${suffix}`;
}

export function formatDateWithPrecision(
  year: number | null,
  precision: string | null,
  options: DateFormatOptions = {}
): string | null {
  const unknown = options.unknown === undefined ? "Unknown" : options.unknown;
  if (year == null) return unknown;

  const isBCE = year < 0;
  const absYear = Math.abs(year);
  const suffix = isBCE ? " BCE" : "";

  if (precision === "circa") return `c. ${absYear}${suffix}`;
  if (precision === "century") {
    const centuryNum = Math.ceil(absYear / 100);
    return `${centuryOrdinal(centuryNum)} c.${suffix}`;
  }
  return `${absYear}${suffix}`;
}

export function formatLifeRange(input: LifeRangeInput, options: DateFormatOptions = {}): string {
  const unknown = options.unknown === undefined ? "Unknown" : options.unknown;
  const birth = formatDateWithPrecision(input.birthYear, input.birthPrecision, {
    unknown,
  });
  const death = formatDateWithPrecision(input.deathYear, input.deathPrecision, {
    unknown,
  });

  if (birth === unknown && death === unknown) {
    return "Dates uncertain";
  }

  return `${birth} – ${death}`;
}
```

Key change: `year == null` (not `!year`) so that `0` and negative numbers pass through. Negative years display as `absYear + " BCE"`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/date-format.test.ts --reporter=verbose 2>&1 | tail -20`
Expected: All tests pass.

- [ ] **Step 5: Run full test suite to check for regressions**

Run: `npm test 2>&1 | tail -5`
Expected: All 207+ tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/date-format.ts tests/date-format.test.ts
git commit -m "feat(dates): display BCE dates correctly in UI"
```

---

## Task 3: Enrich originals-curated.json with dates, CJK names, and school

**Files:**
- Modify: `scripts/data/raw/originals-curated.json` (gitignored — edit in place)

Add traditional dates, Sanskrit names (stored in `names_cjk` field), and school assignment for all 28 Indian patriarchs. Dates use the formats parseDates now supports. Confidence is encoded in the format choice (circa vs exact vs century).

**Historical tier treatment:**
- **Well-documented** (Shakyamuni, Ashvaghosha, Nagarjuna, Aryadeva, Vasubandhu): use scholarly circa dates
- **Semi-historical** (Mahakashyapa, Ananda, Upagupta, Parshva, Simha): use traditional dates with "trad." prefix
- **Legendary/transmission-list** (the rest): use century-level dates from Chan transmission records

- [ ] **Step 1: Add dates and names for all 28 patriarchs**

Update each patriarch entry in `scripts/data/raw/originals-curated.json`. The exact data:

| # | Name | dates | names_cjk | school |
|---|------|-------|-----------|--------|
| 1 | Shakyamuni Buddha | `c. 563-483 BCE` | `釋迦牟尼佛` | `Indian Patriarchs` |
| 2 | Mahakashyapa | `trad. 5th c. BCE` | `摩訶迦葉` | `Indian Patriarchs` |
| 3 | Ananda | `trad. 5th c. BCE` | `阿難` | `Indian Patriarchs` |
| 4 | Shanakavasa | `trad. 5th c. BCE` | `商那和修` | `Indian Patriarchs` |
| 5 | Upagupta | `trad. 3rd c. BCE` | `優婆掬多` | `Indian Patriarchs` |
| 6 | Dhritaka | `trad. 3rd c. BCE` | `提多迦` | `Indian Patriarchs` |
| 7 | Michaka | `trad. 3rd c. BCE` | `彌遮迦` | `Indian Patriarchs` |
| 8 | Vasumitra | `trad. 2nd c. BCE` | `婆須蜜` | `Indian Patriarchs` |
| 9 | Buddhanandi | `trad. 2nd c. BCE` | `佛陀難提` | `Indian Patriarchs` |
| 10 | Buddhamitra | `trad. 2nd c. BCE` | `伏馱蜜多` | `Indian Patriarchs` |
| 11 | Parshva | `trad. 1st c. BCE` | `脇尊者` | `Indian Patriarchs` |
| 12 | Punyayashas | `trad. 1st c. BCE` | `富那夜奢` | `Indian Patriarchs` |
| 13 | Ashvaghosha | `c. 80-150 CE` | `馬鳴` | `Indian Patriarchs` |
| 14 | Kapimala | `trad. 2nd c. CE` | `迦毘摩羅` | `Indian Patriarchs` |
| 15 | Nagarjuna | `c. 150-250 CE` | `龍樹` | `Indian Patriarchs` |
| 16 | Aryadeva | `c. 170-270 CE` | `提婆` | `Indian Patriarchs` |
| 17 | Rahulata | `trad. 3rd c. CE` | `羅睺羅多` | `Indian Patriarchs` |
| 18 | Sanghanandi | `trad. 3rd c. CE` | `僧伽難提` | `Indian Patriarchs` |
| 19 | Gayashata | `trad. 3rd c. CE` | `伽耶舍多` | `Indian Patriarchs` |
| 20 | Kumarata | `trad. 4th c. CE` | `鳩摩羅多` | `Indian Patriarchs` |
| 21 | Jayata | `trad. 4th c. CE` | `闍夜多` | `Indian Patriarchs` |
| 22 | Vasubandhu | `c. 316-396 CE` | `世親` | `Indian Patriarchs` |
| 23 | Manorhita | `trad. 4th c. CE` | `摩拏羅` | `Indian Patriarchs` |
| 24 | Haklena | `trad. 4th c. CE` | `鶴勒那` | `Indian Patriarchs` |
| 25 | Simha | `trad. 5th c. CE` | `師子尊者` | `Indian Patriarchs` |
| 26 | Vasasita | `trad. 5th c. CE` | `婆舍斯多` | `Indian Patriarchs` |
| 27 | Punyamitra | `trad. 5th c. CE` | `不如蜜多` | `Indian Patriarchs` |
| 28 | Prajnatara | `trad. 5th c. CE` | `般若多羅` | `Indian Patriarchs` |

For each patriarch entry, update these three fields:
- `"dates": ""` → `"dates": "<value from table>"`
- `"names_cjk": ""` → `"names_cjk": "<value from table>"`
- `"school": ""` → `"school": "Indian Patriarchs"`

**NOTE:** Also update Bodhidharma (Puti Damo). His entry already has some data but ensure:
- `"dates"` is `"c. 440-536 CE"` (if not already set)
- `"names_cjk"` is `"菩提達摩"` (if not already set)
- `"school"` is `"Chan"` (he bridges Indian and Chinese)

- [ ] **Step 2: Validate JSON is well-formed**

Run: `node -e "const d = JSON.parse(require('fs').readFileSync('scripts/data/raw/originals-curated.json','utf-8')); console.log(d.length + ' entries, valid JSON')"`

- [ ] **Step 3: Verify parseDates handles all new date strings**

Run: `node -e "const {parseDates} = require('./scripts/reconcile'); const dates = ['c. 563-483 BCE','trad. 5th c. BCE','c. 80-150 CE','c. 150-250 CE','trad. 3rd c. BCE','c. 440-536 CE','trad. 2nd c. CE','4th-5th c. CE']; dates.forEach(d => console.log(d, '=>', JSON.stringify(parseDates(d))))"`

Expected: All dates parse to non-null values with appropriate precision/confidence.

Note: This file is gitignored so no git commit needed. Changes take effect when reconcile runs.

---

## Task 4: Register "Indian Patriarchs" school in taxonomy

**Files:**
- Modify: `src/lib/school-taxonomy.ts` (check if "Indian Patriarchs" mapping exists)
- Possibly modify: `scripts/seed-db.ts` (if school must be explicitly seeded)

- [ ] **Step 1: Check if "Indian Patriarchs" is recognized**

Read `src/lib/school-taxonomy.ts` and search for "Indian" or "Patriarch". If the school taxonomy already handles this label, skip this task. If not, add it.

- [ ] **Step 2: Add school mapping if needed**

If "Indian Patriarchs" is not in the taxonomy, add it to the appropriate lookup so that `determineSchoolDefinition({ rawLabel: "Indian Patriarchs", names: [...] })` returns a valid school definition.

- [ ] **Step 3: Verify reconcile picks up the school**

Run: `npx tsx scripts/reconcile.ts 2>&1 | tail -10`
Check that patriarchs now have a school assignment.

- [ ] **Step 4: Commit if changes were made**

```bash
git add src/lib/school-taxonomy.ts
git commit -m "feat(taxonomy): add Indian Patriarchs school classification"
```

---

## Task 5: Enhance seed-images.ts with alternative search terms

**Files:**
- Modify: `scripts/seed-images.ts`

The current script searches Wikipedia using the English dharma name only. Many Indian patriarchs have Wikipedia pages under different names (e.g., "Ānanda" not "Ananda", "Aśvaghoṣa" not "Ashvaghosha"). We need a fallback search strategy.

- [ ] **Step 1: Add an image search override map**

Add after the imports in `scripts/seed-images.ts`:

```typescript
/**
 * Override search terms for masters whose Wikipedia pages use different names
 * than their primary dharma name in our database. Each entry is an array of
 * search terms to try in order.
 */
const IMAGE_SEARCH_OVERRIDES: Record<string, string[]> = {
  "shakyamuni-buddha": ["Gautama Buddha", "Buddha", "Siddhartha Gautama"],
  "mahakashyapa": ["Mahākāśyapa", "Mahakasyapa"],
  "ananda": ["Ānanda", "Ananda (Buddhist)"],
  "ashvaghosha": ["Aśvaghoṣa", "Ashvaghosha"],
  "nagarjuna": ["Nāgārjuna", "Nagarjuna"],
  "aryadeva": ["Āryadeva", "Aryadeva"],
  "vasubandhu": ["Vasubandhu"],
  "upagupta": ["Upagupta"],
  "parshva": ["Pārśva", "Parshva (Buddhist)"],
  "kapimala": ["Kapimala"],
  "simha": ["Aryasimha", "Simha (Buddhist patriarch)"],
  "prajnatara": ["Prajñātāra", "Prajnatara"],
  "puti-damo": ["Bodhidharma"],
  "dajian-huineng": ["Huineng"],
  "dogen": ["Dōgen", "Dogen Zenji"],
  "hakuin-ekaku": ["Hakuin Ekaku", "Hakuin"],
};
```

- [ ] **Step 2: Modify the search logic to try overrides first**

Replace the search name resolution block (around lines 110-122) with:

```typescript
// Get search names — try overrides first, then fall back to dharma name
const overrideTerms = IMAGE_SEARCH_OVERRIDES[master.slug];
const names = await db
  .select()
  .from(masterNames)
  .where(
    and(
      eq(masterNames.masterId, master.id),
      eq(masterNames.locale, "en"),
      eq(masterNames.nameType, "dharma")
    )
  );
const dharmaName = names.length > 0 ? names[0].value : master.slug.replace(/-/g, " ");
const searchTerms = overrideTerms ? [...overrideTerms, dharmaName] : [dharmaName];
```

- [ ] **Step 3: Wrap the Wikipedia API call in a loop over search terms**

Replace the single search attempt with a loop that tries each term:

```typescript
console.log(`\nSearching image for: ${master.slug} (terms: ${searchTerms.join(", ")})`);

let imageUrl: string | null = null;
let originalImageName = "unknown";
let usedSearchName = dharmaName;

for (const searchName of searchTerms) {
  try {
    const wpUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|imageinfo&pithumbsize=800&titles=${encodeURIComponent(searchName)}&format=json`;
    const res = await smartFetch(wpUrl);

    if (!res.ok) continue;

    const data = (await res.json()) as any;
    const pages = data.query?.pages;
    if (!pages || pages["-1"]) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (page.thumbnail?.source) {
      imageUrl = page.thumbnail.source;
      originalImageName = page.pageimage || "unknown";
      usedSearchName = searchName;
      console.log(`  -> Found via "${searchName}": ${imageUrl}`);
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch {
    continue;
  }
}

if (!imageUrl) {
  console.log(`  -> No image found for ${master.slug} (tried: ${searchTerms.join(", ")})`);
  skipCount++;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  continue;
}
```

Then continue with the existing download/optimize/save logic using `imageUrl`, `originalImageName`, and `usedSearchName` in place of the old `searchName`.

- [ ] **Step 4: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed-images.ts
git commit -m "feat(images): add alternative search terms for Indian patriarch images"
```

---

## Task 6: Run pipeline and verify

**Files:** None (execution only)

- [ ] **Step 1: Run reconcile to pick up new dates/names/schools**

Run: `npx tsx scripts/reconcile.ts`
Expected: 231 canonical masters, Indian patriarchs now have dates and CJK names.

- [ ] **Step 2: Run seed-db to update the database**

Run: `npx tsx scripts/seed-db.ts`
Expected: All masters seeded with updated dates.

- [ ] **Step 3: Verify dates landed in the database**

Run: `sqlite3 zen.db "SELECT slug, birth_year, birth_precision, death_year, death_precision FROM masters WHERE slug IN ('shakyamuni-buddha','nagarjuna','mahakashyapa','ashvaghosha') ORDER BY slug;"`
Expected: Non-null years with appropriate precision values.

- [ ] **Step 4: Run seed-images to fetch new images**

Run: `npx tsx scripts/seed-images.ts`
Expected: New images downloaded for patriarchs with Wikipedia pages. Expect success for at least Shakyamuni, Mahakashyapa, Ashvaghosha, Nagarjuna, Vasubandhu, Bodhidharma.

- [ ] **Step 5: Run seed-biographies and seed-teachings**

Run: `npx tsx scripts/seed-biographies.ts && npx tsx scripts/seed-teachings.ts`
Expected: All biographies and teachings re-seeded cleanly.

- [ ] **Step 6: Run coverage audit**

Run: `npx tsx scripts/check-exit-criteria.ts 2>&1 | head -40`
Verify: Indian patriarchs now show dates, more images, school assignments.

- [ ] **Step 7: Run full test suite**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 8: Build the application**

Run: `npx next build`
Expected: Build succeeds with no errors.

---

## Task 7: Visual verification via browser

**Files:** None (manual verification)

- [ ] **Step 1: Start dev server**

Run: `npx next dev -p 3000`

- [ ] **Step 2: Check Shakyamuni Buddha**

Navigate to `http://localhost:3000/masters/shakyamuni-buddha`
Verify: Image present, dates show "c. 563 BCE – c. 483 BCE" (not "Dates uncertain"), biography present, CJK name visible in names section.

- [ ] **Step 3: Check Nagarjuna**

Navigate to `http://localhost:3000/masters/nagarjuna`
Verify: Image present, dates show "c. 150 – c. 250", biography present.

- [ ] **Step 4: Check a legendary patriarch (Shanakavasa)**

Navigate to `http://localhost:3000/masters/shanakavasa`
Verify: Dates show century-level estimate (e.g., "5th c. BCE"), school shows "Indian Patriarchs".

- [ ] **Step 5: Check Mahakashyapa**

Navigate to `http://localhost:3000/masters/mahakashyapa`
Verify: Dates show century-level estimate, CJK name 摩訶迦葉 visible.

- [ ] **Step 6: Spot-check 2-3 more patriarchs across the lineage**

Check Upagupta, Parshva, Prajnatara — confirm dates/names rendered.

---

## Verification Summary

After all tasks complete:

```bash
npx tsx scripts/run-pipeline.ts
```

Expected outcomes:
- All 28 Indian patriarchs have non-null dates with appropriate precision
- All 28 have CJK (Chinese transliteration) names
- All 28 have school = "Indian Patriarchs"
- Image count for Indian patriarchs increases from 4 to ~8-12 (depending on Wikipedia coverage)
- "Dates uncertain" no longer appears for any Indian patriarch
- All existing tests pass
- Application builds successfully
