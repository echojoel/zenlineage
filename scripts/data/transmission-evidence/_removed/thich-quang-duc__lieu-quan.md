---
student: thich-quang-duc
teacher: lieu-quan
tier: D
verified_at: 2026-05-22
sources:
  - publisher: "Wikipedia — Thích Quảng Đức"
    url: https://en.wikipedia.org/wiki/Thích_Quảng_Đức
    domain_class: reference
    retrieved_on: 2026-05-22
    quote: |
      At the age of seven, he left to study Buddhism under Hòa thượng Thích Hoằng Thâm, who was his maternal uncle and spiritual master. At age 15, he took the samanera (novice) vows and was ordained as a monk at age 20 under the dharma name Thích Quảng Đức.
  - publisher: "Namu Wiki — Thích Quảng Đức"
    url: https://en.namu.wiki/w/%ED%8B%B1%EA%BD%9D%EB%93%9D
    domain_class: reference
    retrieved_on: 2026-05-22
    quote: |
      At the age of 7, Thích Quảng Đức entered the Vietnamese Lâm Tế tông Order and began studying Buddhism under his maternal uncle Thích Hoằng Thâm.
  - publisher: "Wikipedia — Liễu Quán"
    url: https://en.wikipedia.org/wiki/Liễu_Quán
    domain_class: reference
    retrieved_on: 2026-05-22
    quote: |
      Liễu Quán (1667–1742) was a prominent Vietnamese Zen master of the 35th generation of the Linji school. The Liễu Quán Zen lineage became the dominant Zen school in central Vietnam, rooted in Vietnamese culture rather than Chinese forms.
reducer_notes: |
  EDGE IS WRONG AS MODELED — downgraded to D.

  TEMPORAL GAP: Liễu Quán died in 1742; Thích Quảng Đức (釋廣德) was born in
  1897 — a gap of 155 years, spanning at least 5–7 intermediate generations.
  This is not a direct personal transmission.

  DIRECT TEACHER: Wikipedia and Namu Wiki both confirm Thích Quảng Đức's actual
  direct teacher was Thích Hoằng Thâm (his maternal uncle and spiritual master),
  with whom he studied from age 7. He was ordained by Thích Hoằng Thâm at age 20.
  The correct direct-transmission edge is thich-quang-duc → thich-hoang-tham.

  SCHOOL AFFILIATION: Namu Wiki confirms he "entered the Vietnamese Lâm Tế tông
  Order," placing him in the broader school that includes the Liễu Quán sub-branch
  as its dominant form in central Vietnam. The edge encodes a school-membership
  label as a fictitious direct personal transmission to Liễu Quán himself.

  NOTE: Thích Hoằng Thâm's own position within the Liễu Quán generation chain
  has not been documented in any retrieved source, so the lineage affiliation via
  the Liễu Quán school remains possible but unverified at the individual level.

  CORRECT EDGE: thich-quang-duc → thich-hoang-tham. If thich-hoang-tham is not
  yet a seeded master, the edge should be held until that master is added.
human_review_needed: true
---
