---
student: daehaeng
teacher: seongcheol
tier: D
verified_at: "2026-05-20"
sources:
  - publisher: "Wikipedia — Daehaeng"
    url: https://en.wikipedia.org/wiki/Daehaeng
    domain_class: reference
    retrieved_on: "2026-05-20"
    quote: |
      She was formally ordained by Hanam Kun Sunim in around 1948, and received Dharma transmission from him at the same time.
  - publisher: "Hanmaum Seon Center — Biography of Daehaeng Kun Sunim"
    url: https://hanmaumseoncenter.org/daehaeng-kun-sunim/biography-of-daehaeng-kun-sunim/
    domain_class: institutional
    retrieved_on: "2026-05-20"
    quote: |
      Daehaeng never received dharma transmission, but rather bypassed traditional routes of monastic training and mentorship.
reducer_notes: |
  No credible source documents any teacher-student or dharma transmission
  relationship between Daehaeng Sunim (大行, 1927–2012) and Seongcheol.
  Wikipedia explicitly identifies Daehaeng's ordaining teacher as Hanam
  Jungwon (Hanam Kun Sunim, c. 1948), placing her in the Gyeongheo → Hanam
  lineage. Seongcheol is not mentioned anywhere in relation to Daehaeng.
  The Hanmaum Seon Center's own biography states she "never received dharma
  transmission" in the traditional sense, having attained enlightenment
  independently through years of solitary ascetic practice. Wikipedia
  also confirms this: "Daehaeng awakened herself through many years of ascetic
  practices rather than through teachers or going through formal Buddhist
  training." The proposed edge student=daehaeng, teacher=seongcheol has no
  supporting source. This edge should be removed from the graph; if a lineage
  connection for Daehaeng is needed, it would be daehaeng → hanam-jungwon
  (ordination teacher, not dharma transmission). Tier D maintained.
correction_applied: true
correction_date: "2026-05-20"
correction_notes: |
  The daehaeng entry in scripts/data/korean-vietnamese-masters.ts already has
  transmissions: [] with no seongcheol reference — confirmed 2026-05-20.
  The live zen.db still carries the edge (APvjG7UqWGBs95MAAlMnS) from a prior
  seed run, but it will be removed on the next full seed/deploy since the
  seed data is the source of truth. No further action needed in seed files.
  Hanam Jungwon (ordination teacher) is not yet seeded; once added, a
  daehaeng → hanam-jungwon ordination edge can be created.
human_review_needed: false
---
