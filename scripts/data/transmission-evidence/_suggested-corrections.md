# Suggested transmission corrections

Findings from the agent panel where an edge in `master_transmissions` appears
to need a topology change, not just better sources. A human reviews each
entry, decides whether to apply the change, and lands it as a normal PR
editing the relevant seed-data file. The orchestrator NEVER auto-applies
these.

---

## shunryu-suzuki → dainin-katagiri — WITHDRAWN

- **Date raised:** 2026-05-15
- **Status (2026-05-15):** **Withdrawn — current graph is already correct.**
- **Wave:** Wave-1B agent panel (3 independent researchers)

The agent panel correctly identified that **Suzuki did not confer shihō on
Katagiri**. However, the current DB already represents this correctly:

- The **primary** transmission edge is `daicho-hayashi → dainin-katagiri`
  (1949 denpō at Taizō-in, Fukui), already seeded with full notes citing
  the MZMC biography and Wikipedia.
- The `shunryu-suzuki → dainin-katagiri` edge in the DB is
  `type='secondary'`, `is_primary=0` — i.e., a "studied with"
  relationship documenting Katagiri's years assisting Suzuki at SFZC,
  not a transmission. This is the project's standard pattern (see
  Kwong, Weitsman, etc. in `deshimaru-lineage.ts`).

No action needed. The research the agents produced has been folded into
the tier-A evidence file at
`scripts/data/transmission-evidence/dainin-katagiri__daicho-hayashi.md`.

---

## shunryu-suzuki → kobun-chino-otogawa — needs primary edge added

- **Date raised:** 2026-05-15
- **Status:** **Action needed: seed Hozan Koei Chino + add primary edge.**
- **Wave:** Wave-1C agent panel (3 independent researchers, all high
  confidence)

### Finding

The current DB has `shunryu-suzuki → kobun-chino-otogawa` as
`type='secondary'`, `is_primary=0` — which correctly represents Kobun's
role as Suzuki's invited senior monk at Tassajara (1967–1970), NOT a
transmission. So far so good.

**However, Kobun has no primary transmission edge** because his actual
shihō teacher, **Hozan Koei Chino Roshi**, is not yet seeded as a master
in the DB. As a result, Kobun appears in the public graph as a
descendant of Suzuki via the secondary edge, which understates his
actual lineage.

### Cited sources (3 independent researchers converged)

- **Jikoji Zen Center** (Kobun's institution): *"He received dharma
  transmission from Koei Chino Roshi in Kamo in 1962."* —
  <https://www.jikojizencenter.org/biography>
- **Terebess** (academic): *"He received Dharma transmission from Koei
  Chino Roshi in Kamo in l962."* —
  <https://terebess.hu/zen/mesterek/otokawa.html>
- **Floating Zendo** (Kobun lineage sangha): *"He was ordained at age
  twelve, and adopted by a nearby priest in town, Hozan Koei Chino
  Roshi. The following year he was given dharma transmission by Chino
  Roshi."* — <https://floatingzendo.org/lineage/>
- **Jakkoan Kobun archive** (sangha): *"He received dharma transmission
  from Koei Chino Roshi in Kamo in 1962. He did his first Denpo
  transmission in 1989 at Jikoji."* — <http://www.kobun.jikoji.org/dbio.html>

### Proposed correction (paired edit)

1. **Add master `hozan-koei-chino`** to the canonical Sōtō seed data with:
   - Names: Hozan Koei Chino Roshi (法山宏文 知野), alias "Koei Chino"
   - Role: Sōtō priest at Kamo, Japan; adoptive father and shihō
     teacher of Kobun Chino Otogawa.
2. **Add primary edge** `hozan-koei-chino → kobun-chino-otogawa` with
   `shihoYear: 1962, notes: "Dharma transmission (shihō) 1962 at Kamo,
   Japan, from his adoptive father Hozan Koei Chino Roshi."`
3. **Keep** the existing `shunryu-suzuki → kobun-chino-otogawa`
   `secondary` edge — it documents the 1967–1970 collaboration at
   Tassajara/SFZC, which is real history.

This pattern mirrors the resolution of the Katagiri case above: the
secondary "studied with" edge stays, and a new primary edge anchors the
shihō lineage. After applying, regenerate
`tests/golden/transmission-edges.json` so the diff documents exactly
what changed.

### Note on Hozan Koei Chino himself

The agents did not turn up biographical details on Koei Chino Roshi
himself (dates, his own teacher, temple lineage). A follow-up
researcher pass would establish his upstream lineage so Kobun connects
back to the Shakyamuni root through Koei Chino rather than only via the
Suzuki secondary edge.

---

<!-- Wave-2 batch findings appended 2026-05-15 -->

## yuquan-shenxiu->jingzhong-wuxiang — flagged by Wave-2 agent panel

- Confidence: low
- Dissent: No source directly attests Shenxiu→Wuxiang transmission. The Lidai fabao ji traces Wuxiang's lineage through Zhishen and Chuji, NOT through Shenxiu. This edge may be mis-attributed in the DB.
- Sources searched:
  - Wikipedia — Kim Hwasang: <https://en.wikipedia.org/wiki/Kim_Ho-shang>

