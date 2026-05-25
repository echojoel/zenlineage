---
student: osaka-koryu
teacher: linji-yixuan
tier: D
verified_at: 2026-05-22
sources:
  - publisher: "Wikipedia — Koryū Osaka"
    url: https://en.wikipedia.org/wiki/Kory%C5%AB_Osaka
    domain_class: reference
    retrieved_on: 2026-05-22
    quote: |
      Koryū Osaka studied the Rinzai koan-curriculum with Muso Joko Roshi
      (1884–1948, aka Hannyakutsu Joko Roshi), a Shingon priest who studied
      the koans with another Shingon priest, Muchaku Kaiko Roshi (1871–1928).
      The lineage chain given is: Shoju Rojin (1642–1721) → Hakuin Ekaku →
      Tōrei Enji → Gasan Jitō → Inzan Ien → Taigen Shigen → Gisan Zenrai →
      Ekkei Shuken → Kazan Genku → Muchaku Kaikō → Muso Jōkō → Musa Kōryū
      (1901–1985).
  - publisher: "Great Wave Zen Sangha — The Lineage of Teachers"
    url: https://greatwave.org/the-lineage-of-teachers/
    domain_class: sangha
    retrieved_on: 2026-05-22
    quote: |
      Koryu Roshi's teacher, Joko Roshi, empowered him to remain a lay teacher,
      and this emphasis on the validity and importance of lay practice continues
      at Great Wave today.
reducer_notes: |
  EDGE IS WRONG AS MODELED — confirmed D-tier. This is an intentional
  editorial ORPHAN_ANCHOR bridge, not a factual transmission claim.

  IDENTITY: Koryū Osaka (大阪孤柳, 1901–1985) is a Japanese lay Rinzai master.
  He taught the Inzan koan-curriculum and was one of Taizan Maezumi's three
  dharma teachers.

  TEMPORAL GAP: Linji Yixuan died in 866 CE; Koryū Osaka lived 1901–1985 — a
  gap of over 1,000 years. No source documents any direct teacher-student
  relationship between them.

  DIRECT TEACHER (confirmed 2026-05-25): Wikipedia (en.wikipedia.org/wiki/Koryū_Osaka)
  and multiple sangha sites (greatwave.org, hazymoon.com, zenpeacemakers.org)
  confirm that Koryū Osaka's direct teacher was Muso Jōkō Roshi (無相定光,
  also called Hannyakutsu Jōkō, 1884–1949), a Shingon priest who practiced
  the Inzan Rinzai koan curriculum. Wikipedia gives the full lineage chain:
  Shoju Rojin → Hakuin Ekaku → Tōrei Enji → Gasan Jitō → Inzan Ien →
  Taigen Shigen → Gisan Zenrai → Ekkei Shuken → Kazan Genku →
  Muchaku Kaikō → Muso Jōkō → Koryū Osaka (1901–1985).

  ORIGIN OF BRIDGE: The osaka-koryu→linji-yixuan edge is an intentional
  editorial bridge in scripts/seed-shiho-corrections.ts (ORPHAN_ANCHORS
  array) installed because the intermediate master muso-joko has not yet
  been seeded as a master entity.

  CORRECT EDGE: osaka-koryu → muso-joko (direct teacher).

  MUSO JOKO SEEDING RESEARCH (2026-05-25):
  To fix this edge properly, Muso Jōkō Roshi must be seeded as a master entity.
  Key facts for seeding:
    - Slug: muso-joko
    - Name: Muso Jōkō (無相定光); also known as Hannyakutsu Jōkō Roshi
    - Dates: 1884–1949 (note: Wikipedia evidence file quotes "1884–1948" in one
      source and "1884–1949" in another; use 1949 as the more commonly cited date)
    - School: rinzai (Inzan line)
    - His teacher: Muchaku Kaikō Roshi (1871–1928); slug would be muchaku-kaiko
    - Muchaku Kaikō's teacher: Kazan Genku; slug would be kazan-genku
    - Neither muso-joko, muchaku-kaiko, nor kazan-genku currently exist in the DB
    - gisan-zenrai (1802–1878) IS in the DB; ekkei-shuken and taigen-shigen
      are NOT in the DB (taigen-shigen IS in the DB: 1768–1837)

  DB STATE OF INZAN CHAIN (as of 2026-05-25):
    - gasan-jito (1727–1797)   ✓ in DB
    - inzan-ien (1751–1814)    ✓ in DB
    - taigen-shigen (1768–1837) ✓ in DB
    - gisan-zenrai (1802–1878)  ✓ in DB (slug: gisan-zenrai)
    - ekkei-shuken              ✗ NOT in DB
    - kazan-genku               ✗ NOT in DB
    - muchaku-kaiko             ✗ NOT in DB
    - muso-joko                 ✗ NOT in DB
    - osaka-koryu (1901–1985)   ✓ in DB

  WHAT WOULD BE NEEDED to properly seed this chain:
  1. Seed ekkei-shuken (Ekkei Shūken, fl. mid-19th c.) as rinzai master,
     teacher: gisan-zenrai
  2. Seed kazan-genku (Kazan Genku) as rinzai master, teacher: ekkei-shuken
  3. Seed muchaku-kaiko (Muchaku Kaikō, 1871–1928) as rinzai master,
     teacher: kazan-genku
  4. Seed muso-joko (Muso Jōkō, 1884–1949) as rinzai master,
     teacher: muchaku-kaiko
  5. Add primary edge: osaka-koryu → muso-joko
  6. Remove or dispute the osaka-koryu → linji-yixuan ORPHAN_ANCHOR edge
     (in scripts/seed-shiho-corrections.ts ORPHAN_ANCHORS array)

  ACTION REQUIRED: These seeding steps should be done in a future wave script
  or in scripts/seed-shiho-corrections.ts. No seed data has been modified
  for this edge — research only.
correction_applied: false
correction_date: 2026-05-25
correction_notes: |
  muso-joko does NOT exist in scripts/data/reconciled/canonical.json as of
  2026-05-25. The osaka-koryu→linji-yixuan editorial-bridge edge is defined
  in scripts/seed-shiho-corrections.ts (ORPHAN_ANCHORS array) and is
  intentional until Muso Joko is seeded. The osaka-koryu entry in
  maezumi-lineage.ts has transmissions: [] — no teacherSlug is set there.
  The Rinzai root anchor (linji-yixuan) comes from seed-shiho-corrections.ts.
human_review_needed: true
---
