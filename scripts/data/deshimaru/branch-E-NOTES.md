# Branch E — Notes

Scope: Kanshōji (Faure / Dordogne) + Kōsan Ryūmon-ji (Wang-Genh / Alsace).

**Sourcing standard for this branch (per direct user instruction; output
will be reviewed by a member of the Deshimaru lineage):**

- Every dated biographical claim carries a URL-grounded inline `[N]`
  citation.
- Every footnote `pageOrSection` includes the URL + the verbatim quoted
  phrase that supports the claim + an `accessed 2026-05-11` datestamp.
- No candidate is promoted to a master row without a primary-source
  confirmation of formal shihō. Senior monk / godo / tantō / hossenshiki
  do **not** entail shihō and are NOT sufficient.

All web sources below were fetched on **2026-05-11**.

---

## Authored masters (this branch)

| Slug | Role | Sources verified |
|---|---|---|
| `konrad-tenkan-beck` | Wang-Genh's senior dharma heir (shihō June 2011); founder Zen-Dōjō Freiburg; tantō at Kōsan Ryūmon-ji | THREE primary sources confirm 2011 shihō from Wang-Genh: (1) [meditation-zen.org/de/konrad-tenkan-beck](https://meditation-zen.org/de/konrad-tenkan-beck) — Beck's own bio page on the Ryūmon-ji site, German verbatim quoted in the footnotes; (2) [meditation-zen.org/en/master-reigen-wangh-genh](https://meditation-zen.org/en/master-reigen-wangh-genh) — Wang-Genh's master-bio page; (3) [meditation-zen.org/en/the-teachers](https://meditation-zen.org/en/the-teachers) — Ryūmon-ji teachers page |

## Authored long-form biographies (BiographyEntry — for Agent G to merge into `seed-biographies.ts`)

All three biographies use **paragraph-density Wikipedia-style inline `[N]` markers**, with each footnote's `pageOrSection` containing the source URL + verbatim supporting quote + `accessed 2026-05-11`.

- `jean-pierre-genshu-faure` — 5 paragraphs, 6 footnotes. Sources:
  - [kanshoji.org/kanshoji/?lang=en](https://www.kanshoji.org/kanshoji/?lang=en) — temple's "About" page (1981 ordination, 2011 abbot, Minamisawa shihō)
  - [zen-azi.org/fr/book/taiun-jean-pierre-faure](https://www.zen-azi.org/fr/book/taiun-jean-pierre-faure) — AZI directory
  - [kanshoji.org/news/interview-about-transmission-for-sagesses-bouddhistes-magazine-january-2025/](https://www.kanshoji.org/news/interview-about-transmission-for-sagesses-bouddhistes-magazine-january-2025/) — Faure interview, Jan 2025, French + English (THE source for "two disciples" claim)
  - [kanshoji.org/ligneage/?lang=en](https://www.kanshoji.org/ligneage/?lang=en) — temple lineage page (Minamisawa→Faure 2003, Minamisawa→Scemama 2008)
  - [kanshoji.org/en/big-ceremonies/hossenshiki-22-fevrier-2014/](https://www.kanshoji.org/en/big-ceremonies/hossenshiki-22-fevrier-2014/) — Yushin Guillet hossenshiki
  - [kanshoji.org/grandes_ceremonies/les-grandes-celebrations-de-mars-2013/](https://www.kanshoji.org/grandes_ceremonies/les-grandes-celebrations-de-mars-2013/) — Jifu Pressac hossenshiki

- `olivier-reigen-wang-genh` — 5 paragraphs, 4 footnotes (used multiple times). Sources:
  - [zen-azi.org/en/olivier-reigen-wang-genh](https://www.zen-azi.org/en/olivier-reigen-wang-genh) — AZI master profile
  - [meditation-zen.org/en/master-reigen-wangh-genh](https://meditation-zen.org/en/master-reigen-wangh-genh) — temple's master-bio page
  - [meditation-zen.org/en/the-teachers](https://meditation-zen.org/en/the-teachers) — temple's teachers page (also Saikawa biographical info)
  - Sōtōshū Europe Office — directory entry

- `konrad-tenkan-beck` — 4 paragraphs, 3 footnotes. Sources:
  - [meditation-zen.org/de/konrad-tenkan-beck](https://meditation-zen.org/de/konrad-tenkan-beck) — Beck's own bio page (German)
  - [meditation-zen.org/en/master-reigen-wangh-genh](https://meditation-zen.org/en/master-reigen-wangh-genh) — Wang-Genh's bio page
  - [meditation-zen.org/en/the-teachers](https://meditation-zen.org/en/the-teachers) — Ryūmon-ji teachers page

---

## CRITICAL — Saikawa edge

Wang-Genh received **shihō from Master Dōshō Saikawa in 2001**. The 2001 date is verified across **three independent primary sources** (all accessed 2026-05-11):

1. [meditation-zen.org/en/master-reigen-wangh-genh](https://meditation-zen.org/en/master-reigen-wangh-genh) — verbatim: "In 2001, Olivier Reigen Wang-Genh received the Dharma transmission from Master Dôshô Saikawa."
2. [meditation-zen.org/en/the-teachers](https://meditation-zen.org/en/the-teachers) — verbatim: "In 2001, he received Dharma transmission from Master Dōshō Saikawa."
3. [zen-azi.org/en/olivier-reigen-wang-genh](https://www.zen-azi.org/en/olivier-reigen-wang-genh) — verbatim: "In 2001, he received the Dharma transmission from Master Dôshô Saikawa."

Patch IS authored in `BRANCH_E_MASTER_PATCHES`, with all three URLs cited verbatim in the patch's `notes` and `addCitations[]`.

**Slug verification (2026-05-11)**: `grep -in "saikawa" scripts/` shows the string only as **prose** in (a) Wang-Genh's existing biography paragraph in `scripts/data/deshimaru-lineage.ts` and (b) the Brazilian Daissen-ji lineage label in `seed-temples-europe.ts:1812` — `"Sōtō (Sōtōshū; Saikawa Rōshi / Gensho Rōshi)"`. **There is NO `dosho-saikawa` master slug in the repo.** The patch will fail to resolve until Agent G acts on one of:

1. **Author `dosho-saikawa`** as a Sōtōshū master entry. Verified-source sketch (all from `meditation-zen.org/en/the-teachers`, accessed 2026-05-11):
   - Dharma name: Dōshō Saikawa (西川大相 — orthography to verify against a Sōtōshū roster)
   - Aliases: Dōshō Saikawa Rōshi
   - School: `soto`
   - Roles, verbatim from the source: *"Master Dōshō Saikawa is the abbot of Hossen-ji Temple in Yamagata Prefecture, in the northwest of Japan. For several years, he was in charge of welcoming foreign visitors at Sōji-ji Temple. He spent nearly ten years in the United States, serving in various temples. He is now the abbot of Kasuisai, one of the largest monastic training temples in Japan."*
   - Confirmed transmissions he conferred: **Olivier Reigen Wang-Genh** (2001) — this branch.
     - The Brazilian Daissen-ji is also listed at sotozen.com under "Saikawa Rōshi / Gensho Rōshi" (see `seed-temples-europe.ts:1812`), suggesting at least one Brazilian dharma successor as well, but that is outside Branch E's scope and not yet verified to a primary URL.
2. **Or skip the patch** entirely and leave the Saikawa transmission represented only in the Wang-Genh bio prose (it is already present there).

**Recommendation**: option (1). Saikawa is a documented Sōtōshū prelate with at least one — possibly two — non-Japanese transmissions; he belongs in the roster as a "secondary teacher of European Zen" node, even if the branch is small.

## Faure secondary teacher (Minamisawa)

Faure has no documented second teacher in the same sense. **Dōnin Minamisawa Zenji** (his primary shihō-conferrer) is **also not yet a master slug** — confirmed by `grep -in "minamisawa\|minamizawa" scripts/`. The existing Faure prose names "Minamizawa Rōshi" but no master row exists.

Source bundle for Agent G to author `donin-minamisawa` (all accessed 2026-05-11):

- [kanshoji.org/ligneage/?lang=en](https://www.kanshoji.org/ligneage/?lang=en) — verbatim: "In the days following the inauguration of the monastery in 2003, at Kanshoji he gave transmission of the Dharma to his first European disciple Taiun Faure, who became abbot in 2011… In 2008, he gave the transmission of the Dharma to Hosetsu Laure Scemama, his second European disciple, in charge of the Limoges Zen Center, who helped found Kanshoji, of which she is currently vice abbess."
- [kanshoji.org/news/interview-about-transmission-for-sagesses-bouddhistes-magazine-january-2025/](https://www.kanshoji.org/news/interview-about-transmission-for-sagesses-bouddhistes-magazine-january-2025/) — "In 2003, he received the transmission of the Dharma from Minamizawa Zenji, a high authority in Zen and abbot of Eiheiji temple in Japan."

**No patch in this branch** — Faure's existing transmission edge already covers his Deshimaru ordination, and the Minamisawa edge would belong as a secondary "dharma" edge once Minamisawa exists. **Agent G's call.**

---

## Kanshōji disciples NOT promoted to master rows

Faure stated in the **January 2025 Sagesses Bouddhistes interview** ([kanshoji.org/news/interview-about-transmission-for-sagesses-bouddhistes-magazine-january-2025/](https://www.kanshoji.org/news/interview-about-transmission-for-sagesses-bouddhistes-magazine-january-2025/), accessed 2026-05-11), verbatim French: *"Bien plus tard, j'ai transmis le Shihō à deux disciples qui m'avaient loyalement suivi et aidé"*. The recipients are **not publicly named** on the Kanshōji site or in the published interview text.

Senior Kanshōji monks who have done **hossenshiki (the canonical pre-shihō ceremony)** under Faure — but for whom shihō from Faure is NOT sourced anywhere I could find:

| Slug-candidate | Documented role | Hossenshiki | Source URL | Promoted? |
|---|---|---|---|---|
| `yusho-valerie-gueneau` (Yashō Valérie Guéneau) | Senior nun resident at Kanshōji; ~30 years monastic; public face of community in Sagesses Bouddhistes archives | not documented as having done hossenshiki publicly | n/a | **NO — no shihō source** |
| `yushin-christophe-guillet` | Resident monk since 2002; samu director | hossenshiki 22 Feb 2014 (Igarashi Takuzō Rōshi presiding — note: not Faure) | [kanshoji.org/en/big-ceremonies/hossenshiki-22-fevrier-2014/](https://www.kanshoji.org/en/big-ceremonies/hossenshiki-22-fevrier-2014/) | **NO — hossenshiki ≠ shihō** |
| `jifu-olivier-pressac` | Senior monk; leads Angoulême dōjō; ordained 1993 | hossenshiki 5–6 March 2013 (Minamisawa presiding — note: not Faure) | [kanshoji.org/grandes_ceremonies/les-grandes-celebrations-de-mars-2013/](https://www.kanshoji.org/grandes_ceremonies/les-grandes-celebrations-de-mars-2013/) | **NO — hossenshiki ≠ shihō** |
| `kosen-carole-servan` | Nun at Kanshōji | hossenshiki 18 Dec 2017 at Chuō-ji in Japan (Minamisawa presiding) | (page redirect lost; documented in search results) | **NO — hossenshiki ≠ shihō** |
| `ninkai-(?)` | Senior monk, Limoges dōjō (mentioned at 20th-anniversary 2023) | n/a | [kanshoji.org/news/kanshojis-20th-anniversary-celebrations/?lang=en](https://www.kanshoji.org/news/kanshojis-20th-anniversary-celebrations/?lang=en) | **NO — surname unknown** |

**Decision rationale**: hossenshiki (法戦式) is the "dharma combat" ritual of a shuso during ango — it certifies a monk as "first among the monks" of that training period, but is decisively **not** shihō. None of these candidates is on record in any public source as having received Faure's shihō. Adding any of them as a transmission target would violate the user's "no fabrication" rule. Agent G can revisit once Kanshōji updates its lineage page or after direct correspondence with `secretariat@kanshoji.org`.

## Hosetsu Laure Scemama (vice-abbess of Kanshōji) — peer of Faure, not heir

Per [kanshoji.org/ligneage/?lang=en](https://www.kanshoji.org/ligneage/?lang=en) (accessed 2026-05-11) verbatim: *"In 2008, he [Minamisawa] gave the transmission of the Dharma to Hosetsu Laure Scemama, his second European disciple, in charge of the Limoges Zen Center, who helped found Kanshoji, of which she is currently vice abbess."*

Scemama is therefore institutionally **a sister-heir of Faure within Minamisawa's European line**, not a Faure shihō recipient. She would belong, in lineage-graph terms, as a peer node off `donin-minamisawa` once that master exists — not in this branch. Agent G can decide whether to author her separately once Minamisawa exists.

## Wang-Genh's other heirs

Both [meditation-zen.org/en/master-reigen-wangh-genh](https://meditation-zen.org/en/master-reigen-wangh-genh) and the user-search-engine summary of that page assert in the plural — *"In June 2011, he passed on the Dharma transmission to his oldest disciple, Konrad Tenkan Beck and then to several of his close disciples"* — but the additional recipients are **not named** in any source I located. I did not invent any. Likely candidates from the Ryūmon-ji and German-side practice records (Stuttgart, Mannheim, Karlsruhe, Mulhouse dōjō leaders) but no confirmed names. Branch deferred.

---

## Sources searched but not yielding additional named heirs

- [ryumonji.org](https://ryumonji.org/) and its `/teachers/` and `/history/` subpages — **wrong Ryūmon-ji**: this is the Iowa USA monastery of Shoken Winecoff (Katagiri Roshi line), unrelated to Wang-Genh.
- [kosanryumonji.org](https://kosanryumonji.org/), [kosan-ryumon-ji.com](https://kosan-ryumon-ji.com/) — both DNS / connection refused.
- [www.kanshoji.org/le-monastere/](https://www.kanshoji.org/le-monastere/), `/the-monastery/`, `/le-monastere`, `/teachings/?lang=en` — 404 or no heir names beyond what is captured above.
- [www.kanshoji.org/news/kanshojis-20th-anniversary-celebrations/?lang=en](https://www.kanshoji.org/news/kanshojis-20th-anniversary-celebrations/?lang=en) — names Yashō, Yushin, Ninkai, Hosetsu in passing but not as shihō recipients of Faure.
- [fr.wikipedia.org/wiki/Olivier_Wang-Genh](https://fr.wikipedia.org/wiki/Olivier_Wang-Genh) — no list of Wang-Genh's heirs beyond Beck.
- [archive-abze.eu/en/abze-teachers](https://archive-abze.eu/en/abze-teachers) — 404.
- Searches for "Yashô Guéneau shihō", "Konrad Tenkan Beck born 195/196", "Wang-Genh disciples Frédéric/Daishin/Tenshin" — no additional named heirs.

---

## Image plan

- `jean-pierre-genshu-faure` — Kanshōji has multiple group photographs of Faure on lineage and news pages, but no single individual portrait suitable for `EXTERNAL_PORTRAITS` was located in this pass. **Falls back to placeholder.**
- `olivier-reigen-wang-genh` — Wikimedia Commons category `Olivier Wang-Genh` exists; **manual review required** per `memory/feedback_image_quality_validation.md` before adding to `EXTERNAL_PORTRAITS`. Best automated path: Wikipedia pageimage from `fr.wikipedia.org/wiki/Olivier_Wang-Genh`. **Re-runs of `fetch-kv-images.ts` should pick this up if `TARGETS` includes the slug.**
- `konrad-tenkan-beck` — no public Wikimedia portrait found; meditation-zen.org Beck biography page has a portrait but **not safe to scrape automatically** (project image-quality rule). **Falls back to placeholder.**

## Source IDs used

All source IDs cited in `branch-E.ts` (`src_kanshoji`, `src_ryumonji_alsace`, `src_sotozen_europe`, `src_azi`, `src_wikipedia`) are taken from the available pre-registered set provided in the Branch-E brief. No new source IDs are introduced by this branch — Agent G should ensure these source rows exist in `scripts/seed-sources.ts` (they should, given they appear in existing Branch-E master citations in `scripts/data/deshimaru-lineage.ts`).
