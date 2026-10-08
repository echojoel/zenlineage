# Batch 28 West Europe practice map review

Reviewed 2026-10-08. Scope: records marked `check_first` in `/tmp/zen-practice-review-batch27c.csv` for Germany, Italy, Spain, the Netherlands, France, the UK, Portugal, Greece, and Turkey. The canonical country JSON files were reconciled against official or institutional sources where current evidence was sufficient. No record was removed: the sources reviewed did not establish a definite scope or status reason for exclusion. An unreachable or stale source is not evidence of inactivity.

## Resolved from current institutional or first-party evidence

- **Zen-Förderverein Cottbus e.V. (Germany):** Deutsche Buddhistische Union listing identifies the group, practice address (Leipziger Straße 4, Cottbus), and Tuesday zazen schedule: https://buddhismus-deutschland.de/?zentren=cottbuser-zen-gruppe-2 . `zen-places-de.json` now cites the DBU listing.
- **Lotus Zen Centra Arnhem, Den Bosch, Eemland, Groningen (Netherlands):** the network’s current official site describes its Zen meditation centres, courses, and retreats: https://www.lotuszencentra.nl/ . `zen-places-nl.json` cites the institutional network listing for these member centres.
- **Zen Center Athens / Saikenji (Greece):** current official practice programme lists weekday zazen, Zen Day, and retreats: https://www.zencenterathens.com/en/zen/zazen-practice-programme/ . Its venue notice gives Saikenji Athens, Agisilaou 76–80: https://www.zencenterathens.com/en/transition-to-saikenji-athens/ .
- **Western Chan Fellowship — Maenllwyd (UK):** the Fellowship’s current official site publishes a 2026 newsletter with a Maenllwyd memorial and practice day: https://westernchanfellowship.org/fileadmin/user_upload/publications/newsletters/wcf-newsletter-54.pdf . The place remains included as a retreat/practice venue.

The build source mapper and `TEMPLE_SOURCES` registry now map the Lotus Zen Centra and Zen Center Athens citations to institutional/primary source IDs. DBU and Western Chan Fellowship use existing registered sources. Generated `seed-temples-europe.ts` was not edited.

## Still unresolved

These remain in the review queue because current institutional evidence confirming the particular place, current practice, or location was not established in this pass. This is a sourcing limitation, not a claim of inactivity or misconduct.

- **Germany (7):** Zen Dojo Dô-Now e.V.; Zen-Dojo Ryosan Do Hannover; Zen-Dojo Weingarten; Zendo Hen Kai Pan; Zengemeinschaft Frankfurt; Zengemeinschaft des Stillen Wassers; Zenhof Rödental e.V.
- **Italy (8):** Casa Zen – Scuola delle Quattro Foglie; Centro Italiano Zen Sōtō; Centro Zen L’Arco; Stella del Mattino groups in Fano, Livorno, Torino, and Pescara; Tora Kan Zen Dōjō.
- **Spain (7):** AZC-AZI Grupo de Zen de Reus; Asai Dojo; Dojo Keisei-ji; Meditación Zen Alicante (IIZE); Meditación Zen Donostia (IIZE); Zendo Betania Barcelona; Zendo Betania Moià.
- **Netherlands (2):** Zen Heart Sangha and Zen Spirit Arnhem were not re-audited in this pass; their existing raw records already cite institutional/first-party evidence and retain their current source notes.
- **France (3):** Groupe Zen de Guadeloupe; Méditations Zen Sōtō Marseille (Uchiyama); Sé-un Zendo (Cambous).
- **United Kingdom (3):** Newcastle Serene Reflection Meditation Group; Nottingham Serene Reflection Meditation Group; Sheffield Zen.
- **Portugal (1):** Plum Village Porto Sangha.
- **Greece (1):** Tao’s Center.
- **Turkey (2):** Cem Şen Sangha; Istanbul Yun Hwa Dharma Sah.
