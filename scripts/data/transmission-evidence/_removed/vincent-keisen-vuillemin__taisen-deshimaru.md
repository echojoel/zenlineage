---
student: vincent-keisen-vuillemin
teacher: taisen-deshimaru
tier: D
verified_at: "2026-05-22"
sources:
  - publisher: "Zen-Deshimaru.com — Maître Keisen Vuillemin"
    url: https://www.zen-deshimaru.com/fr/zen/maitre-keisen-vuillemin
    domain_class: institutional
    retrieved_on: "2026-05-22"
    quote: |
      Vincent Keisen Vuillemin was ordained as a monk by Master Etienne
      Mokusho Zeisler in 1987 at the Temple of La Gendronnière in France.
      He is a Zen master in the tradition of Taisen Deshimaru who introduced
      Zen to Europe.
  - publisher: "Mokushō Zen House Budapest — Our Story"
    url: https://www.mokushozen.hu/en/sample-page/our-story/
    domain_class: sangha
    retrieved_on: "2026-05-22"
    quote: |
      In 2007, master Myoken gave Dharma transmission to Vincent Keisen
      Vuillemin, from Geneve, disciple of master Zeisler.
  - publisher: "Terebess — Étienne Zeisler and disciples"
    url: https://terebess.hu/zen/mesterek/zeisler.html
    domain_class: reference
    retrieved_on: "2026-05-22"
    quote: |
      Maître Keisen est moine depuis 1987. Il est à l'origine l'un des
      disciples d'Etienne Mokusho Zeisler qui lui donna l'ordination.
  - publisher: "Ryu Kai — Maître Keisen Vuillemin (zen-deshimaru.ch)"
    url: https://zen-deshimaru.ch/maitre-keisen-vuillemin/
    domain_class: institutional
    retrieved_on: "2026-05-22"
    quote: |
      A la mort de celui-ci il rejoint la sangha de Maître Kosen. Il reçoit
      de Maître Yvon Myoken Bec la transmission du dharma le 4 juin 2007 au
      Temple de Taisen-ji et de Hobo-ji, près de Budapest.
reducer_notes: |
  EDGE DOWNGRADED TO TIER D — CHRONOLOGICAL IMPOSSIBILITY + FOUR CONTRADICTING
  SOURCES.

  The seed data in deshimaru-lineage.ts claims Vuillemin "was ordained by Taisen
  Deshimaru in the late 1970s," but this claim is refuted on two independent grounds:

  1. CHRONOLOGICAL IMPOSSIBILITY: Taisen Deshimaru died on April 30, 1982.
     Vuillemin's monastic ordination (tokudo) took place in 1987 — five years after
     Deshimaru's death. A dead teacher cannot ordain a student.

  2. FOUR INDEPENDENT SOURCES NAME ZEISLER, NOT DESHIMARU, AS ORDAINER:
     - zen-deshimaru.com (official Kosen Sangha / Deshimaru organisation site):
       "ordained as a monk by Master Etienne Mokusho Zeisler in 1987 at the Temple
       of La Gendronnière in France."
     - terebess.hu (independent reference database): "Il est à l'origine l'un des
       disciples d'Etienne Mokusho Zeisler qui lui donna l'ordination."
     - mokushozen.hu (Mokushō Zen House Budapest — Zeisler's own lineage sangha):
       "disciple of master Zeisler."
     - zen-deshimaru.ch (Vuillemin's own dojo website, Ryu Kai): describes him as
       a monk "depuis 1987" who joined Kosen's sangha after Zeisler's death in 1990.

  No source found anywhere attributes a direct, personal ordination or dharma
  transmission from Deshimaru to Vuillemin. The phrase "in the tradition of Taisen
  Deshimaru" (zen-deshimaru.com) expresses lineage-school membership, not a direct
  teacher–student ordination event. The seed data conflated tradition-affiliation
  with direct personal ordination.

  The duplicate sources[2] entry from the previous version of this file was a
  circular self-citation (quoting the deshimaru-lineage.ts seed file's own text
  while attributing it to the zen-deshimaru.com URL). It has been removed.

  The correct direct-teacher edge for Vuillemin is Étienne Mokushō Zeisler
  (documented at tier B in vincent-keisen-vuillemin__etienne-mokusho-zeisler.md).
  The seed data transmission record in deshimaru-lineage.ts assigning
  teacherSlug: "taisen-deshimaru" for Vuillemin should be corrected to
  teacherSlug: "etienne-mokusho-zeisler".
human_review_needed: true
---
