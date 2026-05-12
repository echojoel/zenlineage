/**
 * Institutional portraits for Branch A (Kōsen Sangha / Triet) masters.
 * To be merged into scripts/fetch-kv-images.ts EXTERNAL_PORTRAITS.
 *
 * NO Wikimedia / Wikipedia / Commons sources. All URLs verified to
 * resolve to a real image file hosted on the institution's own site,
 * with the master clearly identified on the source page.
 *
 * Verification method:
 *   curl -sL <imageUrl> -o /tmp/x -w "%{size_download} %{content_type} %{http_code}"
 *   was run against each imageUrl; all returned a non-trivial body and
 *   image/* content-type. Each sourcePageUrl was fetched and the master's
 *   name confirmed in the page heading or caption near the photo.
 */

interface ExternalPortrait {
  imageUrl: string;
  sourcePageUrl: string;
  attribution: string;
  license: string;
}

export const PORTRAITS_A: Record<string, ExternalPortrait> = {
  // Bárbara Kosen Richaudeau — born Paris 1951, Deshimaru disciple,
  // founder of the Shōrin-ji temple under the Sierra de Gredos (Spain)
  // and the Mokusan dojo / Asociación Zen Taisen Deshimaru in Madrid.
  // Portrait is the lead biographical image on her sangha's "Linaje"
  // (lineage) page at zenkan.com.
  "barbara-kosen-richaudeau": {
    imageUrl: "https://zenkan.com/3/wp-content/uploads/2016/10/barbara-linaje.jpg",
    sourcePageUrl: "https://zenkan.com/en/linaje/barbara-kosen-en/",
    attribution: "Zenkan / Sangha Zen de Bárbara Kosen (zenkan.com) — Bárbara Kosen lineage page",
    license: "courtesy of Zenkan / Sangha Zen de Bárbara Kosen / fair use for educational identification",
  },

  // Yvon Myōken Bec — French-born, Sorbonne-trained Deshimaru-line monk;
  // dharma heir of Mokushō Zeisler, later took shihō from Stéphane Kōsen
  // Thibaut (autumn 2002). Founding abbot of Mokusho Zen House Budapest
  // and its affiliate temples (Taisen-ji, Hōbō-ji, Mokushōzen-ji).
  // Portrait from his sangha's "Mokusho & Myoken" presentation page.
  "yvon-myoken-bec": {
    imageUrl: "https://www.mokushozen.hu/wptest/wp-content/uploads/2016/10/myoken-300x200.jpeg",
    sourcePageUrl: "https://www.mokushozen.hu/en/sample-page/mokusho-myoken/",
    attribution: "Mokusho Zen House Budapest (mokushozen.hu) — Master Myōken page",
    license: "courtesy of Mokusho Zen House / fair use for educational identification",
  },

  // Christophe Ryūrin Desmur — born Lyon 1971, ordained 1989 by Yuno
  // Rech, joined Kōsen's sangha 1993, took shihō from Kōsen on 8 Oct
  // 2009. Calligrapher of the Kōsen sangha and current resident teacher
  // at the Lyon dojo. Portrait from the Kōsen sangha's official teacher
  // roster page on zen-deshimaru.com.
  "christophe-ryurin-desmur": {
    imageUrl:
      "https://medias.zen-deshimaru.com/photos/teachers/master-ryurin-desmur/master-ryurin-desmur-256w.webp",
    sourcePageUrl:
      "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-ryurin-desmur/",
    attribution:
      "Kōsen Sangha / Association Bouddhiste Zen Deshimaru (zen-deshimaru.com) — Maître Ryūrin Desmur",
    license: "courtesy of Kōsen Sangha / fair use for educational identification",
  },

  // Pierre Sōkō Leroux — Deshimaru-line monk ordained by Kōsen at La
  // Gendronnière 1991, took shihō from Kōsen at Yujō Nyūsanji October
  // 2009 (85th successor of Shakyamuni in the Kōsen line). Co-founder
  // of the Barcelona Zen Dojo (1999), teaches in Mexico, Chile and
  // Argentina. Portrait from the Kōsen sangha's official teacher page.
  "pierre-soko-leroux": {
    imageUrl:
      "https://medias.zen-deshimaru.com/photos/teachers/master-soko-leroux/master-soko-leroux-256w.webp",
    sourcePageUrl:
      "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-soko-leroux/",
    attribution:
      "Kōsen Sangha / Association Bouddhiste Zen Deshimaru (zen-deshimaru.com) — Maître Sōkō Leroux",
    license: "courtesy of Kōsen Sangha / fair use for educational identification",
  },

  // Hugues Yūsen Naas (1952–2023) — Deshimaru disciple ordained 1977,
  // Strasbourg dōjō teacher for 25 years, took shihō from Raphaël Dōkō
  // Triet in 2009. Former abbot of La Gendronnière; founder of Centre
  // zen du Perche Daishugyōji in Normandy. Portrait from his AZI
  // memorial / teacher page; the page is titled "Master Hugues Yusen
  // Naas (1952-2023)" and the image is the lead photo.
  "hugues-yusen-naas": {
    imageUrl:
      "https://www.zen-azi.org/sites/default/files/styles/xlarge/public/images/pages/Hugues-Yusen-Naas.png",
    sourcePageUrl: "https://www.zen-azi.org/en/hugues-yusen-naas",
    attribution: "Association Zen Internationale (zen-azi.org) — Master Hugues Yūsen Naas (1952-2023)",
    license: "courtesy of AZI / fair use for educational identification",
  },

  // Loïc Kōshō Vuillemin — son of Vincent Keisen Vuillemin; took shihō
  // from Kōsen in November 2013 (84th patriarch in the Kōsen line).
  // Co-founded Yujō Nyūsanji temple near Béziers (2008) where he served
  // as steward for nine years. Portrait from the Kōsen sangha's
  // official teacher page.
  "loic-kosho-vuillemin": {
    imageUrl:
      "https://medias.zen-deshimaru.com/photos/teachers/master-kosho-vuillemin/master-kosho-vuillemin-256w.webp",
    sourcePageUrl:
      "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-kosho-vuillemin/",
    attribution:
      "Kōsen Sangha / Association Bouddhiste Zen Deshimaru (zen-deshimaru.com) — Maître Kōshō Vuillemin",
    license: "courtesy of Kōsen Sangha / fair use for educational identification",
  },

  // Ingrid Gyū-ji Igelnick — Deshimaru disciple from 1978, ordained nun
  // by Kōsen 1984, took shihō from Kōsen in 2015. Long-time personal
  // secretary of Kōsen, founder of the Soi-Zen kesa / kolomo workshop.
  // Portrait from the Kōsen sangha's official teacher page.
  "ingrid-gyuji-igelnick": {
    imageUrl:
      "https://medias.zen-deshimaru.com/photos/teachers/master-gyu-ji-igelnick/master-gyu-ji-igelnick-256w.webp",
    sourcePageUrl:
      "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-gyu-ji-igelnick/",
    attribution:
      "Kōsen Sangha / Association Bouddhiste Zen Deshimaru (zen-deshimaru.com) — Maître Gyū-ji Igelnick",
    license: "courtesy of Kōsen Sangha / fair use for educational identification",
  },

  // Françoise Jōmon Julien — began zen with Deshimaru 1979 (bodhisattva
  // ordination from him). Founded the Dijon Zen dōjō 1982 and remains
  // its responsible teacher. Took shihō from Kōsen in 2015 alongside
  // Igelnick, Femenias and Labbate. Portrait from the Kōsen sangha's
  // official teacher page.
  "francoise-jomon-julien": {
    imageUrl:
      "https://medias.zen-deshimaru.com/photos/teachers/master-jomon-julien/master-jomon-julien-256w.webp",
    sourcePageUrl:
      "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-jomon-julien/",
    attribution:
      "Kōsen Sangha / Association Bouddhiste Zen Deshimaru (zen-deshimaru.com) — Maître Jōmon Julien",
    license: "courtesy of Kōsen Sangha / fair use for educational identification",
  },

  // Paula Reikiku Femenias — Kōsen shihō (2015). Portrait from the
  // Kōsen sangha's official teacher page. (Slug uses "rei-kiku" in the
  // sangha's URL convention.)
  "paula-reikiku-femenias": {
    imageUrl:
      "https://medias.zen-deshimaru.com/photos/teachers/master-rei-kiku-femenias/master-rei-kiku-femenias-256w.webp",
    sourcePageUrl:
      "https://www.zen-deshimaru.com/fr/association-abzd/nos-enseignants-zen/maitre-rei-kiku-femenias/",
    attribution:
      "Kōsen Sangha / Association Bouddhiste Zen Deshimaru (zen-deshimaru.com) — Maître Rei Kiku Femenias",
    license: "courtesy of Kōsen Sangha / fair use for educational identification",
  },

  // Ariadna Dōsei Labbate — born Buenos Aires 1969, practising zen
  // since 1988. Founded the Montevideo dōjō (1993) and the Florida /
  // Buenos Aires dōjō (2001); current resident teacher at Templo
  // Shōbōgenji (Capilla del Monte, Córdoba, Argentina). Took shihō
  // from Kōsen at Yujō Nyūsanji in 2015 — first woman Sōtō Zen master
  // in Argentina. Portrait is the lead bio image on her temple's
  // official site (shobogenji.org).
  "ariadna-dosei-labbate": {
    imageUrl: "https://shobogenji.org/wp-content/uploads/2025/03/Dosei.webp",
    sourcePageUrl: "https://shobogenji.org/",
    attribution: "Templo Zen Shōbōgenji (shobogenji.org) — Maestra Dōsei Labbate, dharma successor of Master Kōsen",
    license: "courtesy of Templo Shōbōgenji / fair use for educational identification",
  },

  // Toshirō Taigen Yamauchi — born Buenos Aires 27 October 1962;
  // Argentine Kōsen-line teacher, responsible since 2002 for the Zen
  // Dōjō of Buenos Aires. Portrait is the lead biographical image on
  // his dōjō's "maestros zen" page (note: img is hosted on the
  // adjacent dojozenbuenosaires.com.ar domain run by the same sangha
  // — verified by reading the bio page HTML).
  "toshiro-taigen-yamauchi": {
    imageUrl: "https://dojozenbuenosaires.com.ar/wp-content/uploads/kosen-taigen.jpg",
    sourcePageUrl: "https://www.zen-buenosaires.com.ar/maestros-zen/maestro-taigen-yamauchi/",
    attribution: "Dōjō Zen de Buenos Aires (zen-buenosaires.com.ar) — Maestro Taigen Yamauchi bio page",
    license: "courtesy of Dōjō Zen de Buenos Aires / fair use for educational identification",
  },

  // Begoña Kaidō Agiriano — Spanish (Vitoria-Gasteiz, Basque Country)
  // Sōtō Zen nun since 1990; teaching coordinator and resident teacher
  // at the Centro Zen de Vitoria-Gasteiz, in the Triet line. Portrait
  // from her dōjō's official "Linaje" page where she is captioned
  // "Begoña Kaiko" alongside Deshimaru and Triet portraits.
  "begona-kaido-agiriano": {
    imageUrl: "https://zenvitoriagasteiz.com/wp-content/uploads/2022/06/Bego-3.jpeg",
    sourcePageUrl: "https://zenvitoriagasteiz.com/linaje/",
    attribution: "Centro Zen de Vitoria-Gasteiz (zenvitoriagasteiz.com) — Linaje page, Begoña Kaidō",
    license: "courtesy of Centro Zen de Vitoria-Gasteiz / fair use for educational identification",
  },
};
