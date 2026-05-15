# Suggested transmission corrections

Findings from the agent panel that an existing transmission edge in
`master_transmissions` appears to be **wrong**, not just under-sourced.
A human reviews each entry, decides whether to apply the change, and
lands it as a normal PR editing the relevant seed-data file. The
orchestrator NEVER auto-applies these.

---

## shunryu-suzuki → dainin-katagiri

- **Date raised:** 2026-05-15
- **Wave:** Wave-1B agent panel (3 independent researchers)
- **Edge ID in DB:** `_dWSleTV3zOclZlg7eVVl`
- **Claim made by the DB:** Shunryū Suzuki conferred Dharma transmission on Dainin Katagiri.
- **Agent panel verdict:** All three researchers independently concluded this is **incorrect**.

### Agent dissent (verbatim quotes)

Researcher 1: *"No source found supporting a Dharma transmission from Shunryu Suzuki to Dainin Katagiri. All institutional, reference, and sangha sources consistently identify Daichō Hayashi at Taizo-in (Fukui) as Katagiri's transmission teacher."*

Researcher 2: *"The claim that Shunryu Suzuki conferred Dharma transmission on Dainin Katagiri is not supported by any source found. ... Suzuki's only Western Dharma heir was Zentatsu Richard Baker (shihō 1971); his only other listed successor is his son Hoitsu Suzuki."*

Researcher 3: *"All authoritative sources agree Katagiri's transmission lineage runs through Daichō Hayashi (ordination/dharma heir at Taizo-in) and Hashimoto Ekō (Eiheiji/Zuiōji), not through Suzuki."*

### Cited sources (all three researchers converged)

- Wikipedia — *Dainin Katagiri*: *"He was ordained a monk by and named a Dharma heir of Daichō Hayashi at Taizo-in in Fukui, and went on to study under Eko Hashimoto at Eiheiji for three years."* — <https://en.wikipedia.org/wiki/Dainin_Katagiri>
- Wikipedia — *Shunryū Suzuki* (Successors section): *"Two main successors: Zentatsu Richard Baker (born 1936) shihō 1971, and Hoitsu Suzuki (born 1939)."* — <https://en.wikipedia.org/wiki/Shunry%C5%AB_Suzuki>
- Minnesota Zen Meditation Center — Katagiri Project: *"After teaching at San Francisco Zen Center and Tassajara Zen Mountain Center as assistant to Shunryū Suzuki Roshi, he founded and taught at Minnesota Zen Meditation Center"* — <https://www.mnzencenter.org/katagiri-project.html>
- Terebess — *The Two Main Lineages of Modern Sōtō*: *"Hashimoto (Rendō) Ekō (1890-1965) – abbot of Zuiōji — teacher of Dainin Katagiri"* — <https://terebess.hu/zen/mesterek/lineage.html>
- Great Tree Temple — *Teachers Zen Lineage*: *"A disciple of Daichō Hayashi Roshi, he trained at Eiheiji Monastery for three years"* — <https://www.greattreetemple.org/teachers-zen-lineage>

### Proposed correction

1. **Remove** the `shunryu-suzuki → dainin-katagiri` row from
   `master_transmissions` by editing the appropriate seed-data file
   (likely `scripts/data/canonical-soto-lineage.ts` or a related
   manually-authored lineage source).
2. **Add** a `daicho-hayashi → dainin-katagiri` primary transmission edge
   (Daichō Hayashi at Taizo-in in Fukui). This may require seeding
   `daicho-hayashi` as a master if not already in the DB. Wikipedia
   gives the ceremony date as **24 November 1949** with the dharma
   name *Jikai Dainin*.
3. **Keep** the historical association between Suzuki and Katagiri at
   the bio / temple level — Katagiri served as Suzuki's assistant at
   Sōkō-ji and SFZC from c. 1965–1971 — but this is a working
   relationship, not a transmission lineage.

### Open question for the editor

The Sōtō shihō ceremony Katagiri performed for Sojun Mel Weitsman in
1984 (referenced by R3) is a separate event from Katagiri's own
transmission line and is not affected by this correction.

---
