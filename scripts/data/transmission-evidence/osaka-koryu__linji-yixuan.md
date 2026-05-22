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
  EDGE IS WRONG AS MODELED — confirmed D-tier.

  IDENTITY: Koryū Osaka (大阪孤柳, 1901–1985) is a Japanese lay Rinzai master,
  not Korean or Vietnamese. He taught the Inzan koan-curriculum and was one of
  Taizan Maezumi's three dharma teachers.

  TEMPORAL GAP: Linji Yixuan died in 866 CE; Koryū Osaka lived 1901–1985 — a
  gap of over 1,000 years. No source documents any direct teacher-student
  relationship between them.

  DIRECT TEACHER: Wikipedia confirms Koryū Osaka's direct teacher was Muso Joko
  Roshi (夢窓成空 / Hannyakutsu Jōkō, 1884–1948), a Shingon priest who practiced
  the Rinzai koan curriculum. Muso Joko received from Muchaku Kaikō, who received
  from Kazan Genku, continuing the Inzan branch of Hakuin's lineage back to
  Shoju Rojin and ultimately to Linji.

  ORIGIN OF ERROR: The osaka-koryu→linji-yixuan edge is an intentional editorial
  bridge in scripts/seed-shiho-corrections.ts (ORPHAN_ANCHORS array) installed
  because the intermediate master muso-joko has not yet been seeded as a master
  entity. This is a placeholder, not a factual transmission claim.

  CORRECT EDGE: seosan-koryu → muso-joko (direct teacher).
  ACTION REQUIRED: Add Muso Joko Roshi (1884–1948) as a master entry, then
  replace the linji-yixuan ORPHAN_ANCHOR with a proper muso-joko edge in
  maezumi-lineage.ts.
correction_applied: false
correction_date: 2026-05-22
correction_notes: |
  muso-joko does NOT exist in scripts/data/reconciled/canonical.json as of
  2026-05-22. The osaka-koryu→linji-yixuan editorial-bridge edge is defined in
  scripts/seed-shiho-corrections.ts (ORPHAN_ANCHORS array) and is intentional
  until Muso Joko is seeded. The osaka-koryu entry in maezumi-lineage.ts has
  transmissions: [] — no teacherSlug is set there. The Rinzai root anchor
  (linji-yixuan) comes from seed-shiho-corrections.ts.
human_review_needed: true
---
