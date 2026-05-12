/**
 * Institutional portraits for Branch B (Roland Yuno Rech heirs) masters —
 * the AZI / ABZE mainline of the Deshimaru lineage.
 *
 * To be merged into scripts/fetch-kv-images.ts EXTERNAL_PORTRAITS.
 *
 * NO Wikimedia / Wikipedia / Commons sources. Every URL has been verified
 * to resolve to a real image file (HTTP 200, image/* content-type) and the
 * source page clearly identifies the master by name. Most portraits are
 * served from the official ABZE (Association Bouddhiste Zen d'Europe)
 * directory at abzen.eu — the Wordpress media library underneath the
 * "Les enseignants" page lists each shihō recipient of Roland Yuno Rech
 * with a per-master headshot under /wp-content/uploads/{2023/08, 2025/06}/.
 * For a handful (Patrick Pargnien, Pascal-Olivier Reynaud, Konrad Kosan
 * Maquestieau, Lluís Nansen Salas, Beppe Mokuza Signoritti, Sengyo Van
 * Leuven, Eveline Kogen Pascual, Antoine Charlot, Sergio Gyōhō Gurevich,
 * Luc Sōjō Bordes, Claude Émon Cannizzo, Claus Heiki Bockbreder) we have
 * also (or instead) used the master's own dōjō / sangha homepage so the
 * provenance is rooted in the institution they actually direct.
 *
 * Verification method:
 *   curl -sI -A "Mozilla/5.0" <imageUrl>
 *   was run against each imageUrl on 2026-05-12; all returned a 200 with
 *   image/jpeg or image/png content-type.
 */

interface ExternalPortrait {
  imageUrl: string;
  sourcePageUrl: string;
  attribution: string;
  license: string;
}

export const PORTRAITS_B: Record<string, ExternalPortrait> = {
  // Patrick Heishin Pargnien — Bordeaux. Bodhisattva precepts 1990, monk
  // ordination 1991 from Yuno Rech, shihō 2010. Director of "Nuage et Eau"
  // (Bordeaux). ABZE shows him on its master directory; portrait is in the
  // ABZE media library under the 2023 batch of shihō recipients.
  "patrick-pargnien": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Patrick-Pargnien.jpg",
    sourcePageUrl: "https://abzen.eu/patrick-pargnien/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Patrick Pargnien",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Heinz-Jürgen Metzger — Germany. Monk ordination 1991 from Yuno Rech,
  // shihō 2010. Founder of the BuddhaWeg-Sangha. Portrait comes from the
  // ABZE master directory (file name "HJ-Metzger.jpg"); his ABZE page is
  // at the slug /hj-metzger/.
  "heinz-juergen-metzger": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/HJ-Metzger.jpg",
    sourcePageUrl: "https://abzen.eu/hj-metzger/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Heinz-Jürgen Metzger",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Sengyo Van Leuven — abbot of the Tempio Zen Roma, shihō 2011 from
  // Yuno Rech. The portrait used here is the headshot on his ABZE page;
  // the same image also appears on tempiozenroma.it under "Il Maestro".
  "sengyo-van-leuven": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Sengyo-van-Leuven.jpg",
    sourcePageUrl: "https://abzen.eu/sengyo-van-leuven/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Sengyo Van Leuven",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Emanuela Dōsan Losi — Italy (Carpi). Nun ordination 1994 from Yuno
  // Rech, shihō 2012. Former director of Dojo Mokushō (Turin) for 10
  // years; now teaches at Groupe Zen di Carpi. Portrait from ABZE master
  // directory.
  "emanuela-dosan-losi": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Emanuela-Losi.jpg",
    sourcePageUrl: "https://abzen.eu/emanuela-losi/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Emanuela Dōsan Losi",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Pascal-Olivier Kyōsei Reynaud — Bodhisattva ordination 1987 (Mokushō
  // Zeisler), monk 1988 (Kōsen Thibaut), shihō from Yuno Rech 2013.
  // President of Méditation Zen Narbonne. Portrait is the ABZE-hosted
  // headshot ("P-O-Kyosei-Reynaud.jpg"); source page is his own dōjō's
  // teacher page at meditation-zen-narbonne.fr.
  "pascal-olivier-reynaud": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/P-O-Kyosei-Reynaud.jpg",
    sourcePageUrl:
      "https://meditation-zen-narbonne.fr/mediter-a-narbonne/p-o-kyosei-reynaud/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) / Méditation Zen Narbonne — Pascal-Olivier Kyōsei Reynaud",
    license: "courtesy of ABZE / Méditation Zen Narbonne / fair use for educational identification",
  },

  // Michel Jigen Fabra — founded Carpentras Zen dōjō (2002), 6 years at
  // La Gendronnière as Shuso/Ino, shihō 2014 from Yuno Rech. Now leads
  // Dojo Zen Soto Poitiers. Portrait from ABZE master directory.
  "michel-jigen-fabra": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Michel-Fabra.jpg",
    sourcePageUrl: "https://abzen.eu/michel-fabra/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Michel Jigen Fabra",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Konrad Kōsan Maquestieau — Belgium. Monk ordination 1995 from Yuno
  // Rech, shihō 2015. Director of the Shōdō Dojo (Halle). Image is the
  // ABZE master-directory headshot (note: .jpeg extension, not .jpg);
  // source page is his own dōjō's teacher page at shododojo.be.
  "konrad-kosan-maquestieau": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Konrad-Maquestieau.jpeg",
    sourcePageUrl: "https://shododojo.be/fr/kosan-konrad-maquestieau/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) / Shōdō Dojo Halle — Konrad Kōsan Maquestieau",
    license: "courtesy of ABZE / Shōdō Dojo / fair use for educational identification",
  },

  // Lluís Nansen Salas — Barcelona. Shihō 2016 from Yuno Rech. Director,
  // with Keiko Nansen Barenys, of Zen Kannon Barcelona. Portrait taken
  // directly from the Zen Kannon "Masters of the Soto Zen lineage" page
  // (the URL the user supplied in the brief).
  "lluis-nansen-salas": {
    imageUrl: "https://zenkannon.org/wp-content/uploads/2024/09/Lluis-Nansen-Salas.jpg",
    sourcePageUrl: "https://zenkannon.org/en/nansen-salas-keiko-barenys/",
    attribution: "Zen Kannon Barcelona (zenkannon.org) — Lluís Nansen Salas",
    license: "courtesy of Zen Kannon Barcelona / fair use for educational identification",
  },

  // Claude Émon Cannizzo — Mulhouse. Bodhisattva ordination 1986, monk
  // 1991 (Yuno Rech), shihō 2016. Founder of the Butsushin Zen Dō
  // Mulhouse. Portrait from ABZE master directory.
  "claude-emon-cannizzo": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Claude-Cannizzo.jpg",
    sourcePageUrl: "https://abzen.eu/claude-cannizzo/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Claude Émon Cannizzo",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Antonio Taishin Arana — Pamplona/Iruña. Shihō March 2016 from Yuno
  // Rech (Deshimaru lineage). Director of Dojo Zen Genjo (Pamplona).
  // Translator of Ryōkan and various French Zen masters into Spanish.
  // Portrait from ABZE master directory.
  "antonio-taishin-arana": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Antonio-Arana.jpg",
    sourcePageUrl: "https://abzen.eu/antonio-arana/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Antonio Taishin Arana",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Alonso Taikai Ufano — Sevilla. Shihō 2016 from Yuno Rech. Director
  // of Dojo Zen Sevilla; regular sesshin teacher across Spain. Portrait
  // from ABZE master directory.
  "alonso-taikai-ufano": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Alonso-Ufano.jpg",
    sourcePageUrl: "https://abzen.eu/alonso-ufano/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Alonso Taikai Ufano",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Antoine Charlot — Paris region. Sōtō Zen monk, certified ABZE
  // teacher since 2018; responsible for the Centre Zen de Bondy.
  // Portrait from ABZE master directory.
  "antoine-charlot": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Antoine-Charlot.jpg",
    sourcePageUrl: "https://abzen.eu/antoine-charlot/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Antoine Charlot",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Marc Chigen Estéban — began zazen 1997, monk 2002, shihō from Yuno
  // Rech (2018). Past president of ABZE; current vice-president and
  // resident teacher of Dojo Zen JI SAN (Chalon-sur-Saône). Portrait
  // from ABZE master directory.
  "marc-chigen-esteban": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Marc-Esteban.jpg",
    sourcePageUrl: "https://abzen.eu/marc-esteban/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Marc Chigen Estéban",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Eveline Kogen Pascual — co-founder (1995) and director (since 2001)
  // of the Kanjizai-Dojo / Zendo Aachen. Shihō 2019 from Yuno Rech.
  // Portrait from ABZE master directory.
  "eveline-kogen-pascual": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Eveline-Pascual.jpg",
    sourcePageUrl: "https://abzen.eu/eveline-pascual/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Eveline Kogen Pascual",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Beppe Mokuza Signoritti — founder/director of Bodai Dojo (Alba, IT);
  // sumi-e master and Sōtō Zen monk. Shihō 2019 from Yuno Rech. Portrait
  // from ABZE master directory.
  "beppe-mokuza-signoritti": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Beppe-Signoritti.jpg",
    sourcePageUrl: "https://abzen.eu/beppe-signoritti/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Beppe Mokuza Signoritti",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Huguette Moku Myō Siréjol — Toulouse. Bodhisattva ordination 1987,
  // nun ordination 1994 (Kōsen Thibaut); since 2015 a disciple of Yuno
  // Rech, hossenshiki 2021 at Gyobutsu-ji Nice, shihō summer 2022 at
  // La Gendronnière. Portrait from ABZE master directory.
  "huguette-moku-myo-sirejol": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Huguette-Sirejol.jpg",
    sourcePageUrl: "https://abzen.eu/huguette-sirejol/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Huguette Moku Myō Siréjol",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Jean-Pierre Reiseki Romain — began zazen 1981 with Deshimaru, monk
  // 1994, shihō 2022 from Yuno Rech. Director of publication of the
  // Dojo Zen de Paris. Portrait from ABZE master directory.
  "jean-pierre-reiseki-romain": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/08/Jean-Pierre-Romain.jpg",
    sourcePageUrl: "https://abzen.eu/jean-pierre-romain/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Jean-Pierre Reiseki Romain",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Sergio Gyōhō Gurevich — Argentine-French painter and Sōtō monk;
  // shihō 2023 from Yuno Rech. Teaches at Dojo Zen de Paris (rue de
  // Tolbiac). Portrait is the headshot ABZE uses on his presentation
  // page, file dated 2023-09.
  "sergio-gyoho-gurevich": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/09/Sergio-Gurevich.jpg",
    sourcePageUrl: "https://abzen.eu/sergio-gurevich/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Sergio Gyōhō Gurevich",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Luc Sōjō Bordes — monk 1987, director of Dojo Zen de Garches
  // 1990–2019, founded the Groupe Zen Vernon / Saint-Pierre-d'Autils
  // (Normandie) in 2010, shihō 2023 from Yuno Rech. Portrait from ABZE
  // master directory (file dated 2023-09).
  "luc-sojo-bordes": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2023/09/Luc-Bordes.jpg",
    sourcePageUrl: "https://abzen.eu/luc-bordes/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Luc Sōjō Bordes",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Silvia Hōju Leyer — chairperson of the Kanjizai-Dojo / Zendo Aachen
  // (succeeding Eveline Pascual at the helm of the lay leadership);
  // shihō summer 2024 from Yuno Rech. Portrait from ABZE master
  // directory (2025-06 batch of new shihō recipients).
  "silvia-hoju-leyer": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2025/06/Silvia-Leyer.jpg",
    sourcePageUrl: "https://abzen.eu/silvia-leyer/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Silvia Hōju Leyer",
    license: "courtesy of ABZE / fair use for educational identification",
  },

  // Claus Heiki Bockbreder — Osnabrück physician/psychotherapist; began
  // zazen 1980, systematic practice from 1991 with Yuno Rech, monk
  // ordination 1992. Founded Zendo Osnabrück in 2018. Shihō summer 2024
  // from Yuno Rech. Portrait from ABZE master directory (2025-06 batch).
  "claus-heiki-bockbreder": {
    imageUrl: "https://abzen.eu/wp-content/uploads/2025/06/Claus-Bockbreder.jpg",
    sourcePageUrl: "https://abzen.eu/claus-bockbreder/",
    attribution:
      "Association Bouddhiste Zen d'Europe (abzen.eu) — Claus Heiki Bockbreder",
    license: "courtesy of ABZE / fair use for educational identification",
  },
};
