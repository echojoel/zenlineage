# Transmission Evidence — Agent Panel Recipe

Reproducible procedure for verifying transmission edges. Run via
`npx tsx scripts/run-evidence-panel.ts [--school <slug>] [--edges <file>] [--tier <X>] [--wave-size <N>]`.

## Inputs per edge

The orchestrator hands each researcher exactly:

- `{ student_slug, teacher_slug, student_label, teacher_label, dates, school, native_names, existing_notes }`
- The current `src/lib/source-domains.ts` allow-list (printed as JSON).
- The deny-list patterns from `src/lib/source-domains.ts#PROMOTIONAL_DENY`.

Researchers MUST NOT receive:

- Other researchers' output.
- The edge's existing `citations` row(s) — those go to the reducer only.

## Researcher prompt

> You are verifying whether {teacher_label} ({teacher_native_name}) conferred
> Dharma transmission on {student_label} ({student_native_name}) in the
> {school} tradition. Their dates: teacher {teacher_dates}, student
> {student_dates}.
>
> Find sources that explicitly attest this teacher→student relation. For
> each source, return: publisher (human-readable name), URL, the
> `domain_class` from the allow-list below, the date you retrieved it, and
> a verbatim quote (≥40 characters) from the page that supports the
> relation. Do not paraphrase.
>
> ALLOW-LIST (use only these classes): {JSON of SOURCE_DOMAINS}
> DENY-LIST (never cite): {JSON of PROMOTIONAL_DENY patterns}
>
> If a candidate source is not in the allow-list, mark its
> `domain_class: "unknown"` so it can be classified later.
>
> Return STRICT JSON only:
> ```
> { "sources": [...], "confidence": "low|medium|high", "dissent_note": "..." }
> ```
> Do not invent sources. If you cannot find a credible source, return an
> empty `sources` array and explain in `dissent_note`.

## Reducer prompt

> You have three independent research envelopes for the transmission
> {teacher_label} → {student_label}. Merge them.
>
> 1. Dedupe sources by canonicalised URL.
> 2. Compute the tier using the rules in `src/lib/edge-trust.ts`
>    (see the typed `computeTier` function).
> 3. Set `human_review_needed: true` IF the researchers contradict on a
>    SUBSTANTIVE point: different teacher named, different year of
>    transmission attested, claim of "no transmission given." Otherwise
>    `false`. Capture the disagreement verbatim in `reducer_notes`.
> 4. Write the evidence file to
>    `scripts/data/transmission-evidence/<student>__<teacher>.md` using
>    the schema in the design spec.
>
> Never invent a source. Never modify the URL or quote a researcher
> provided.

## Reviewer prompt

> Read the merged evidence file and the URLs it references. For each
> source, verify:
>
> - The URL still resolves (or note it does not).
> - The verbatim quote actually appears on the page as written.
> - The quote describes the same transmission claimed by the edge (not
>   a different transmission for the same people, e.g. the teacher's
>   own teacher).
>
> You may DOWNGRADE the tier (e.g. A → B) by editing the frontmatter.
> You may set `human_review_needed: true` and add concerns to
> `reviewer_notes`.
> You may NEVER upgrade the tier. You may NEVER modify the `sources`
> array.

## Suggested corrections

If a researcher or reviewer concludes that the edge itself is wrong
(not just under-sourced) — wrong teacher, wrong direction, wrong
person entirely — they append a record to
`scripts/data/transmission-evidence/_suggested-corrections.md`:

```
## {teacher_slug} → {student_slug}
- date: 2026-05-14
- agent: researcher-2 / reviewer
- claim: "Source X actually says the transmission was from Y, not Z."
- urls: [...]
```

A human reviews these and lands them as a normal PR editing the
canonical seed-data files. The orchestrator NEVER auto-applies them.
