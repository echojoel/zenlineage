# Portraits CDEF — research notes

Hard rules followed:
- NO Wikimedia / Wikipedia / Commons URLs.
- imageUrl confirmed to return image bytes (jpg/png).
- Hosting page must clearly identify the master by name.
- Attribution recorded for every entry.

## Found (8 / 11)

| slug                          | host institution                                | source page                                                                            |
| ----------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| maria-teresa-shogetsu-avila   | Fundación Kannonji (Quito, Ecuador)             | https://www.fundacionkannonji.org/about-1 — captioned "Maestra Shogetsu Avila"         |
| ionut-koshin-nedelcu          | Mokushō Zen House Budapest                      | https://www.mokushozen.hu/en/sample-page/our-story/ (group "Dharma Transmissions" img) |
| laszlo-toryu-kalman           | Mokushō Zen House Budapest                      | https://www.mokushozen.hu/en/sample-page/our-story/ (group "Dharma Transmissions" img) |
| patrick-ferrieux              | Dojo Zen de Paris                               | https://dojozenparis.com/qui-sommes-nous/ — captioned "Patrick Ferrieux"               |
| robert-livingston             | New Orleans Zen Temple                          | https://www.neworleanszentemple.org/home — captioned founding abbot                    |
| richard-reishin-collins       | New Orleans Zen Temple                          | https://www.neworleanszentemple.org/home — shihō 2016 photo with Livingston            |
| tony-bland                    | Zen in Mississippi (Starkville Zen Dojo)        | https://zeninmississippi.org/aboutus/teacher.php — captioned "Tony Bland"              |
| monika-leibundgut             | Muijōji / Zen Dōjō Zürich                       | https://zen.ch/leadership-instruction/ — Eishuku Monika Leibundgut bio                 |
| dosho-saikawa                 | Centre Zen Barcelona (Sōtōshū-affiliated)       | https://zenbarcelona.org/about-us/a-brief-history-of-the-center/dosho-saikawa-roshi/   |

(That is 9; the table includes both Mokushō group-photo entries that share an image — Avila has her own individual portrait. So **9 of 11 slugs covered**.)

## Not found (2 / 11)

### konrad-tenkan-beck
Searched, in order:
- https://meditation-zen.org/de/konrad-tenkan-beck — only logos
- https://meditation-zen.org/en/node/307 — only logos
- https://meditation-zen.org/de/node/843 — only logos
- https://meditation-zen.org/en/the-teachers — has Wang-Genh, Saikawa, Deshimaru portraits but NO Tenkan Beck portrait
- https://meditation-zen.org/de/Nbg-BaWi (Nürnberg/Bad Windsheim dojo) — only a room banner
- https://meditation-zen.org/de/zen-dojo-bad-windsheim — only a banner
- https://meditation-zen.org/de/zen-dojo-nuernberg — only a banner
- https://meditation-zen.org/de/foerderkreis-ryumonji-de — only a banner
- https://www.zen-azi.org/en/node/527 (AZI Freiburg dojo entry) — only the AZI logo
- https://zendojostuttgart.de/event/zazentag-mit-konrad-beck/ — text-only event page
- https://buddhismus-aktuell.de/onlineartikel/eine-praxis-mehrere-generationen/ — has uncaptioned EIAB images, none identifiable as Tenkan Beck

Conclusion: every German institutional page that mentions Tenkan Beck is text-only. The only photographs that surface for him in image search are on third-party blogs and Facebook (out of scope under "institutional only" + "name-identifying caption" rules). **Skipped** rather than fabricate.

### kishigami-kojun
Searched:
- https://www.sanghasansdemeure.org/ — ECONNREFUSED at fetch time
- https://zen-road.org/en/ — listed but the kojun-kishigami-osho article URL did not return a fetchable portrait
- https://tenborin.org/event/session-kesa-2015/ — 404
- https://zenhalluin.org/textes-et-kusen/ — domain is now expired (redirects to expireddomains.com)
- https://zendojodetours.fr/kishigami-kojun/ — ECONNREFUSED
- https://www.izauk.org/gallery-items/interview-master-kojun-kishigami-sewing-kesa/ — page exists with text + interview but only the IZAUK logo is in the served HTML
- Lille dojo references are blogspot.com (not institutional)

Wikipedia / Wikidata have a portrait but those are excluded by rule. **Skipped** rather than use a non-vetted source.

## Verification record

For each Found entry above I issued a separate WebFetch directly to the
imageUrl (no page wrapping) and confirmed a `Binary content (image/jpeg)`
or `Binary content (image/png)` response, which is the file the seeder
will download.
