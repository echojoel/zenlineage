---
student: osaka-koryu
teacher: linji-yixuan
tier: D
verified_at: 2026-05-20
sources:
  - publisher: "Wikipedia — Koryū Osaka"
    url: https://en.wikipedia.org/wiki/Kory%C5%AB_Osaka
    domain_class: reference
    retrieved_on: "2026-05-20"
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
    retrieved_on: "2026-05-20"
    quote: |
      Koryu Roshi's teacher, Joko Roshi, empowered him to remain a lay teacher,
      and this emphasis on the validity and importance of lay practice continues
      at Great Wave today.
reducer_notes: |
  This edge is incorrect as a direct transmission. Linji Yixuan died in 866 CE;
  Koryū Osaka lived 1901–1985. No source documents a direct teacher-student
  relationship between them. Wikipedia's article on Koryū Osaka gives his
  documented direct teacher as Muso Joko Roshi (1884–1948), who transmitted
  the Inzan koan-curriculum. The full transmission chain runs: Linji Yixuan
  → … → Shoju Rojin → Hakuin Ekaku → Tōrei Enji → Gasan Jitō → Inzan Ien
  → Taigen Shigen → Gisan Zenrai → Ekkei Shuken → Kazan Genku → Muchaku
  Kaikō → Muso Jōkō → Koryū Osaka. The edge in the database likely encodes
  Osaka's ultimate nominal affiliation with the Linji/Rinzai tradition rather
  than a direct transmission. The correct immediate teacher is Muso Joko
  (slug: muso-joko). Tier D maintained; data correction required.
correction_applied: false
correction_date: "2026-05-20"
correction_notes: |
  muso-joko does NOT exist in scripts/data/reconciled/canonical.json as of
  2026-05-20. The osaka-koryu→linji-yixuan editorial-bridge edge is defined in
  scripts/seed-shiho-corrections.ts (ORPHAN_ANCHORS array, line 614) and is
  intentional until Muso Joko is seeded.
  The osaka-koryu entry in maezumi-lineage.ts has transmissions: [] — no
  teacherSlug is set there. The Rinzai root anchor (linji-yixuan) comes from
  seed-shiho-corrections.ts.
  Action required: add Muso Joko Roshi (1884-1948/1949, Shingon-Rinzai, lay
  teacher, founder of Hannya Dojo) as a master entry. Once muso-joko exists in
  the DB, replace the linji-yixuan ORPHAN_ANCHOR in seed-shiho-corrections.ts
  with a proper muso-joko edge in maezumi-lineage.ts transmissions array.
human_review_needed: true
---
