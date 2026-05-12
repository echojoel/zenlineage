# Branch B portraits — research notes

**Branch:** Roland Yuno Rech / AZI mainline (Deshimaru lineage).
**Scope:** 21 formal shihō recipients of Yuno Rech, 2010–2024.
**Result:** 21 / 21 portraits found and verified.

## Method

The single richest source turned out to be the **ABZE** (Association
Bouddhiste Zen d'Europe) Wordpress media library at `abzen.eu`. The public
"Les enseignants" page is JS-rendered so direct grep of links yielded
nothing, but each shihō recipient has

  * a per-master page at `https://abzen.eu/<slug>/`
  * a headshot in `/wp-content/uploads/2023/08/<Name>.jpg` (early batch
    of shihō recipients) or `/wp-content/uploads/2025/06/<Name>.jpg`
    (the 2024 cohort, plus a few late re-uploads dated 2023-09).

I discovered the Wordpress slugs by probing
`HEAD https://abzen.eu/<candidate>/` and the image filenames via the WP
REST media endpoint
`https://abzen.eu/wp-json/wp/v2/media?search=<surname>`.

For each master I then verified the image URL with

```
curl -sI -A "Mozilla/5.0" <imageUrl>
```

and confirmed `200` + `image/jpeg|png` content-type. All 21 passed on
2026-05-12.

## Source-page choices

Where ABZE has a per-master page, I used it as `sourcePageUrl`. For
masters who maintain their own dōjō with a stronger biographical page,
I preferred that institutional page even when the image itself is hosted
on ABZE — this gives the citation a stronger institutional identification:

| slug | sourcePageUrl chosen | reason |
|---|---|---|
| `pascal-olivier-reynaud` | meditation-zen-narbonne.fr/.../p-o-kyosei-reynaud/ | ABZE has the image but no dedicated `/<slug>/` page; his own dōjō has the canonical bio |
| `konrad-kosan-maquestieau` | shododojo.be/fr/kosan-konrad-maquestieau/ | Same — own dōjō (Halle) has the canonical teacher page |
| `lluis-nansen-salas` | zenkannon.org/en/nansen-salas-keiko-barenys/ | ABZE has no `/<slug>/` page for him; user-supplied URL is the institution he directs |

All other 18 use `https://abzen.eu/<slug>/` as the source page.

## Slugs found vs URL-pattern variations

Most slugs follow `firstname-surname` (no Buddhist names, no diacritics,
ASCII-fold). A few non-obvious ones to flag:

| master | ABZE slug |
|---|---|
| Heinz-Jürgen Metzger | `hj-metzger` (not `heinz-jurgen-metzger`) |
| Konrad Kōsan Maquestieau | (no per-master ABZE page; image lives at `Konrad-Maquestieau.jpeg`, **note `.jpeg`**) |
| Lluís Nansen Salas | `lluis-salas` (no `nansen` prefix) |
| Beppe Mokuza Signoritti | `beppe-signoritti` (no `mokuza`) |
| Pascal-Olivier Reynaud | (no ABZE page; image is `P-O-Kyosei-Reynaud.jpg`) |

## URLs searched but rejected (with reason)

* `https://www.zen-azi.org/en/<master>` — AZI's per-master pages exist
  for some, 404 for others; the ones that work do have portraits at
  `/sites/default/files/styles/xlarge/public/images/pages/<Name>.png`
  (e.g. Roland Yuno Rech). I did not use them because (a) AZI is not
  consistently updated and (b) ABZE turned out to have the same headshots
  for everyone in this cohort under a uniform path.
* `https://www.nuageeteau.fr/wp-content/uploads/2015/02/Patrick-171x300.jpg`
  — returns 200 with referer set to nuageeteau.fr, but 403 to a bare
  curl, which is fragile for the build-time fetch. ABZE-hosted version
  preferred.
* `http://www.zen-mulhouse.fr/fr/30,biographie-de-claude-emon-cannizzo-...`
  — page 404'd at fetch time; site appears restructured.
* `https://www.dojo-zen-soto-poitiers.com/qui-sommes-nous` — Wix-served
  but no headshot of Fabra found in the rendered HTML; ABZE preferred.
* `http://www.zendoaachen.de/dojo.htm` — only meditation-posture stock
  photos, no portrait of Pascal or Leyer.
* Any `commons.wikimedia.org` / `upload.wikimedia.org` URL — explicitly
  banned by the brief.

## Existing AZI-hosted portraits the parent file (`portraits-A.ts`,
`portraits-CDEF.ts`, `fetch-kv-images.ts`) already covers

These shihō-of-Yuno-Rech masters were **not** part of the 21 (because
they belong to other branches of the user's already-seeded data), but
their AZI directory pages were inspected during this research:
Olivier Reigen Wang-Genh, Jean-Pierre Taiun Faure, Évelyne Reiko de
Smedt, Raphaël Dōkō Triet, Gérard Chinrei Pilet, Laure Hosetsu Scemama,
Guy Mokuhō Mercier, Katia Kōren Robel, Philippe Coupey. No collision.

## Final coverage

**21 / 21**:

| slug | image host |
|---|---|
| patrick-pargnien | abzen.eu |
| heinz-juergen-metzger | abzen.eu |
| sengyo-van-leuven | abzen.eu |
| emanuela-dosan-losi | abzen.eu |
| pascal-olivier-reynaud | abzen.eu |
| michel-jigen-fabra | abzen.eu |
| konrad-kosan-maquestieau | abzen.eu |
| lluis-nansen-salas | zenkannon.org |
| claude-emon-cannizzo | abzen.eu |
| antonio-taishin-arana | abzen.eu |
| alonso-taikai-ufano | abzen.eu |
| antoine-charlot | abzen.eu |
| marc-chigen-esteban | abzen.eu |
| eveline-kogen-pascual | abzen.eu |
| beppe-mokuza-signoritti | abzen.eu |
| huguette-moku-myo-sirejol | abzen.eu |
| jean-pierre-reiseki-romain | abzen.eu |
| sergio-gyoho-gurevich | abzen.eu |
| luc-sojo-bordes | abzen.eu |
| silvia-hoju-leyer | abzen.eu |
| claus-heiki-bockbreder | abzen.eu |

No fabricated URLs. No Wikimedia / Wikipedia / Commons sources.
