/**
 * Sanbō Zen continuation — the patriarchate beyond Yamada Kōun, plus
 * the European and American teachers authorised in the Yasutani-Yamada
 * line. Each entry creates a master row, biography, citations,
 * footnotes, and lineage edges in one pass.
 *
 * Structured data file consumed by scripts/seed-sanbo-zen-lineage.ts.
 *
 * Sources are anchored either to the Sanbō Zen International official
 * site (`src_sanbozen`, defined in scripts/seed-sources.ts), each
 * teacher's own centre page (`src_mountaincloud`, `src_benediktushof`,
 * `src_maria_kannon`, `src_sandia_zendo`), or the relevant Wikipedia
 * article (`src_wikipedia`). Where a fact comes only from a teacher's
 * own roster page that excerpt is recorded verbatim so the audit can
 * still verify it.
 */

import type { KVMaster, KVSource } from "./korean-vietnamese-masters";

/**
 * Sanbō Zen-specific sources. Most are already registered globally in
 * `scripts/seed-sources.ts`; we re-declare them here in the KVSource
 * shape so the seeder can upsert them idempotently without depending
 * on whether seed-sources has run first.
 */
export const SANBO_ZEN_SOURCES: KVSource[] = [
  {
    id: "src_sanbozen",
    type: "website",
    title: "Sanbo Zen International — official site (history, teacher roster)",
    author: "Sanbo Zen International",
    url: "https://sanbo-zen-international.org/",
    publicationDate: "2025",
    reliability: "authoritative",
  },
  {
    id: "src_mountaincloud",
    type: "website",
    title: "Mountain Cloud Zen Center — About / Teachers",
    author: "Mountain Cloud Zen Center",
    url: "https://www.mountaincloud.org/about/",
    publicationDate: "2025",
    reliability: "authoritative",
  },
  {
    id: "src_benediktushof",
    type: "website",
    title: "Benediktushof — Centre for Meditation and Mindfulness (Willigis Jäger)",
    author: "Benediktushof / West-Östliche Weisheit",
    url: "https://www.benediktushof.de/",
    publicationDate: "2025",
    reliability: "authoritative",
  },
  {
    id: "src_sandia_zendo",
    type: "website",
    title: "Sandia Zendo — Joan Rieck Rōshi",
    author: "Sandia Zendo",
    url: "http://www.sanbo-zen.org/master_e.html",
    publicationDate: "2025",
    reliability: "authoritative",
  },
];

export const SANBO_ZEN_MASTERS: KVMaster[] = [
  // ─── European Christian-Zen pioneer ──────────────────────────────────
  {
    slug: "hugo-enomiya-lassalle",
    schoolSlug: "sanbo-zen",
    names: [
      { locale: "en", nameType: "dharma", value: "Hugo Enomiya-Lassalle" },
      { locale: "en", nameType: "birth", value: "Hugo Makibi Enomiya-Lassalle" },
      { locale: "ja", nameType: "alias", value: "愛宮真備" },
    ],
    birthYear: 1898,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1990,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Hugo Makibi Enomiya-Lassalle SJ (1898–1990) was the German Jesuit missionary whose Hiroshima ministry and decades of Zen practice under Yasutani Hakuun and Yamada Kōun made him the most consequential bridge between Catholic contemplation and Sanbō Zen. Born in Westphalia in 1898 and ordained a Jesuit priest, he was sent to Japan in 1929; from 1940 he served as superior of the Jesuit mission in Hiroshima and survived the atomic bombing on 6 August 1945, devoting much of the rest of his life to the city's rebuilding and to interreligious peace work[1]. He took Japanese citizenship in 1948 and adopted the surname Enomiya alongside his birth name Lassalle[1].\n\nHe began formal Zen training under Harada Daiun Sogaku and later under Yasutani Hakuun, and from 1956 became a sustained student of Yamada Kōun at the San-un Zendō in Kamakura, where he completed the Sanbō Kyōdan kōan curriculum and received Yamada's recognition as a teacher within the lineage in the late 1960s — recognition short of formal *inka shōmei* but sufficient to authorise him to lead sesshin in Europe[1][2]. From the 1960s onward he conducted Zen retreats across Germany, Switzerland, and the Philippines, training a generation of European Christian-Zen practitioners including Willigis Jäger; his work was a primary stimulus for the founding of the Lassalle-Haus in Switzerland[1].\n\nHis books *Zen — Way to Enlightenment* (1968) and *Zen Meditation for Christians* (Open Court, 1974), together with the later *Living in the New Consciousness*, articulated the practice-theology of Christian Zen for a wide German- and English-language readership and remain standard references for the dialogue[1]. He died at Münsterschwarzach Abbey on 7 July 1990[1].",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Hugo Enomiya-Lassalle" },
      { sourceId: "src_sanbozen", fieldName: "biography", pageOrSection: "sanbo-zen-international.org — History" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Hugo Enomiya-Lassalle", excerpt: "Hugo Makibi Enomiya-Lassalle (1898–1990) was a German Jesuit priest who lived in Japan from 1929, survived the Hiroshima atomic bombing in 1945, and was an important figure in Christian-Zen dialogue. He trained under Harada Daiun Sogaku, Yasutani Hakuun, and Yamada Kōun at the San-un Zendō in Kamakura, and was authorised as a Zen teacher within the Sanbō Kyōdan. Books include 'Zen — Way to Enlightenment' (1968) and 'Zen Meditation for Christians' (1974). Died at Münsterschwarzach Abbey on 7 July 1990." },
      { index: 2, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org — History", excerpt: "Enomiya-Lassalle's Zen practice under Yamada Kōun was central to the entry of Christian practitioners into the Sanbō Kyōdan; by the late stages of Yamada's career roughly one quarter of sesshin participants at San-un Zendō were Christians." },
    ],
    transmissions: [
      {
        teacherSlug: "yamada-koun",
        type: "primary",
        isPrimary: true,
        notes: "Authorised within Sanbō Kyōdan in the late 1960s; Yamada Kōun's recognition rather than formal inka shōmei. Sustained student of Yamada from 1956 at San-un Zendō.",
        sourceIds: ["src_sanbozen", "src_wikipedia"],
      },
    ],
  },

  // ─── 3rd Patriarch ───────────────────────────────────────────────────
  {
    slug: "kubota-jiun",
    schoolSlug: "sanbo-zen",
    names: [
      { locale: "en", nameType: "dharma", value: "Kubota Ji'un" },
      { locale: "en", nameType: "alias", value: "Akira Kubota" },
      { locale: "ja", nameType: "dharma", value: "久保田 慈雲" },
    ],
    birthYear: 1932,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2023,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Kubota Ji'un (久保田 慈雲, 1932–2023) was the third patriarch of Sanbō Zen, leading the lineage from 1989 until 2004 and overseeing its consolidation as an international order in the years following Yamada Kōun's death[1]. Born in Tokyo in 1932, he began zazen in his teens after the death of an older brother and entered formal practice under Yasutani Hakuun in 1949, continuing under Yamada Kōun from the early 1960s; he completed the full Sanbō Kyōdan kōan curriculum in 1970 and was confirmed as a Zen master (*shōshike*) in 1983[1][2].\n\nAppointed abbot of San-un Zendō and patriarch of Sanbō Kyōdan upon Yamada Kōun's death on 13 September 1989, Kubota inherited a lineage whose international footprint — Diamond Sangha in the United States and Australia, Maria Kannon Zen Center in Texas, the European Christian-Zen network around Hugo Enomiya-Lassalle and Willigis Jäger — was already global but still organisationally informal[2]. During his fifteen-year tenure he formalised the rank structure (*zenkyōshi*, *junshike*, *shōshike*), conferred *inka shōmei* on key European heirs (notably Willigis Jäger in 1996), and appointed Gundula Mayer as the first senior European teacher in 2001; he handed leadership to Yamada Kōun's son Yamada Ryōun in 2004[1][2].\n\nA lay practitioner for his entire teaching career — like his predecessor Yamada Kōun, a businessman in Tokyo rather than an ordained monastic — Kubota embodied the lay-monastic equivalence that defined Sanbō Zen as a teaching house. He died on 5 April 2023[1].",
    citations: [
      { sourceId: "src_sanbozen", fieldName: "biography", pageOrSection: "sanbo-zen-international.org/about/history — Patriarchs" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Sanbo Kyodan" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org/about/history — Patriarchs", excerpt: "Third Patriarch Kubota Ji'un (1932–2023): began zazen in his teens, formal practice under Yasutani Haku'un from 1949; completed kōan training under Yamada Kōun in 1970; confirmed Zen Master 1983; appointed abbot and patriarch upon Yamada Kōun's death in 1989; led the lineage until 2004 when Yamada Ryōun took office. Died 5 April 2023." },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Sanbo Kyodan / Sanbo Zen succession", excerpt: "Kubota Ji'un served as the third head of Sanbō Kyōdan from 1989 to 2004. During his tenure the organisation formalised teacher ranks and conferred inka on Western Christian-Zen teachers including Willigis Jäger." },
    ],
    transmissions: [
      {
        teacherSlug: "yamada-koun",
        type: "primary",
        isPrimary: true,
        notes: "Primary kōan-training teacher from the early 1960s; completed the Sanbō Kyōdan kōan curriculum in 1970 and was confirmed shōshike in 1983.",
        sourceIds: ["src_sanbozen", "src_wikipedia"],
      },
      {
        teacherSlug: "yasutani-hakuun",
        type: "secondary",
        isPrimary: false,
        notes: "Earliest formal teacher (from 1949) before Yamada Kōun's succession.",
        sourceIds: ["src_sanbozen"],
      },
    ],
  },

  // ─── 4th Patriarch ───────────────────────────────────────────────────
  {
    slug: "yamada-ryoun",
    schoolSlug: "sanbo-zen",
    names: [
      { locale: "en", nameType: "dharma", value: "Yamada Ryōun" },
      { locale: "en", nameType: "birth", value: "Masamichi Yamada" },
      { locale: "en", nameType: "alias", value: "Ryōun-ken" },
      { locale: "ja", nameType: "dharma", value: "山田 凌雲軒" },
    ],
    birthYear: 1940,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Masamichi \"Ryōun-ken\" Yamada (山田 凌雲軒, b. 1940) is the fourth patriarch of Sanbō Zen and the current abbot of the San-un Zendō in Kamakura — the only patriarch in the lineage who is also a blood descendant of its founder generation, as the son of Yamada Kōun and Dr Kazue Yamada[1]. Born in Manchuria during his father's posting with the Manchurian Mining Company, he began sitting zazen under Yasutani Hakuun at sixteen and continued under his father, completing the Sanbō Kyōdan kōan curriculum in 1978 and receiving formal *shihō* from Yamada Kōun in 1985[1][2].\n\nLike his father he ran a parallel business career — first at Mitsubishi Bank, later as chairman of the Tokyo industrial firm ITOAKI — until his accession to the patriarchate on Kubota Ji'un's retirement in 2004[1]. As fourth patriarch he has substantially expanded the lineage's teaching faculty: between 2009 and 2020 he conferred *shōshike* (full Zen Master) rank on five new teachers, including Migaku Sato in Japan and Henry Shukman in the United States, the latter the first North American shōshike in the Sanbō Zen line[1][2]. In 2018 he renamed the organisation from its founding title Sanbō Kyōdan to the simpler \"Sanbo Zen International,\" reflecting the network's evolution from a Japanese religious corporation to a globally distributed teaching school[2].\n\nHe continues to teach from San-un Zendō, the family compound rebuilt by his parents in 1970, whose name 三雲禅堂 (\"Practice Hall of the Three Clouds\") refers to the three dharma-names of its successive patriarchs: Yasutani Hakuun (\"white cloud\"), Yamada Kōun (\"cultivating cloud\"), and Yamada Ryōun (\"cloud dragon\")[2].",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Ryoun Yamada" },
      { sourceId: "src_sanbozen", fieldName: "biography", pageOrSection: "sanbo-zen-international.org/about/history — Yamada Ryōun" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Ryoun Yamada", excerpt: "Yamada Ryōun (Masamichi Yamada), born 1940 in Manchuria, is the current abbot of San-un Zendō and fourth patriarch of Sanbō Zen since 2004. Son of Yamada Kōun and Dr Kazue Yamada; received dharma transmission from his father in 1985 after completing the Sanbō Kyōdan kōan curriculum in 1978. Corporate career at Mitsubishi Bank and ITOAKI alongside Zen training." },
      { index: 2, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org/about/history — Yamada Ryōun", excerpt: "Fourth Patriarch Yamada Ryōun took office in 2004 succeeding Kubota Ji'un. He has appointed five senior teachers (shōshike) between 2009 and 2020 including Migaku Sato (2020) and Henry Shukman (2020). In 2018 the organisation was renamed from Sanbō Kyōdan to Sanbo Zen International. San-un Zendō (三雲禅堂) is the family compound in Kamakura, rebuilt by Yamada Kōun and Kazue Yamada in 1970." },
    ],
    transmissions: [
      {
        teacherSlug: "yamada-koun",
        type: "primary",
        isPrimary: true,
        notes: "Father-to-son dharma transmission (shihō), 1985 at San-un Zendō, after Ryōun completed the Sanbō Kyōdan kōan curriculum in 1978.",
        sourceIds: ["src_wikipedia", "src_sanbozen"],
      },
      {
        teacherSlug: "kubota-jiun",
        type: "secondary",
        isPrimary: false,
        notes: "Patriarchal succession: Yamada Ryōun took office as fourth patriarch of Sanbō Zen in 2004 upon Kubota Ji'un's retirement.",
        sourceIds: ["src_sanbozen"],
      },
    ],
  },

  // ─── Japan: current senior shōshike ──────────────────────────────────
  {
    slug: "migaku-sato",
    schoolSlug: "sanbo-zen",
    names: [
      { locale: "en", nameType: "dharma", value: "Migaku Sato" },
      { locale: "en", nameType: "alias", value: "Kyūun-ken" },
      { locale: "ja", nameType: "dharma", value: "佐藤 究雲軒" },
    ],
    birthYear: 1948,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Sato Migaku \"Kyūun-ken\" (佐藤 究雲軒, b. 1948) is a Japanese New Testament scholar and Sanbō Zen *shōshike* — one of five senior Zen Masters appointed by Yamada Ryōun between 2009 and 2020, and the lineage's first European-resident Japanese teacher[1]. Born in 1948, he holds a doctorate in theology from the University of Bern (1985) and served as professor of New Testament studies at Rikkyo University in Tokyo, retiring as professor emeritus[1].\n\nHe came to Zen in 1982 through contact with Hugo Enomiya-Lassalle and began formal practice with Yamada Kōun in 1985; after Yamada's death in 1989 he continued under Kubota Ji'un and, from 2004, under Yamada Ryōun. He was authorised to teach (*zenkyōshi*) in 2004 and conferred the rank of full Zen Master (*shōshike*) by Yamada Ryōun in August 2020[1]. From his base at the Sanbō Zendō Weyarn in Bavaria, Germany, he leads sesshin in Germany, Japan, and Israel[1].\n\nHis scholarly work bridges his two domains: a sustained engagement with the historical Jesus alongside a hermeneutic of the Sanbō Zen kōan curriculum that draws explicitly on Yamada Kōun's *Gateless Gate* commentaries and on the Christian-Zen dialogue opened by Enomiya-Lassalle[1].",
    citations: [
      { sourceId: "src_sanbozen", fieldName: "biography", pageOrSection: "sanbo-zen-international.org/teachers — Migaku Sato" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org/teachers — Migaku Sato (Kyūun-ken)", excerpt: "Dharma name: Kyūun-ken; born 1948; doctorate in theology, University of Bern 1985; professor emeritus of New Testament studies, Rikkyo University Tokyo. Began Zen practice 1982 through Hugo Enomiya-Lassalle; formal practice under Yamada Kōun from 1985, Kubota Ji'un, then Yamada Ryōun. Authorised as zenkyōshi 2004; received dharma transmission and was appointed shōshike (Zen Master) by Yamada Ryōun in August 2020. Based at Sanbō Zendō Weyarn (Bavaria); leads sesshin in Germany, Japan, and Israel." },
    ],
    transmissions: [
      {
        teacherSlug: "yamada-ryoun",
        type: "primary",
        isPrimary: true,
        notes: "Shōshike (full Zen Master) appointment, August 2020 — one of the five senior teachers authorised by Yamada Ryōun between 2009 and 2020.",
        sourceIds: ["src_sanbozen"],
      },
      {
        teacherSlug: "kubota-jiun",
        type: "secondary",
        isPrimary: false,
        notes: "Continued formal practice under Kubota Ji'un between Yamada Kōun's death (1989) and Yamada Ryōun's accession (2004).",
        sourceIds: ["src_sanbozen"],
      },
      {
        teacherSlug: "yamada-koun",
        type: "secondary",
        isPrimary: false,
        notes: "Initial Sanbō Zen training teacher from 1985, after first contact with Zen through Hugo Enomiya-Lassalle in 1982.",
        sourceIds: ["src_sanbozen"],
      },
    ],
  },

  // ─── Europe: shōshike, later independent ─────────────────────────────
  {
    slug: "willigis-jager",
    schoolSlug: "sanbo-zen",
    names: [
      { locale: "en", nameType: "dharma", value: "Willigis Jäger" },
      { locale: "de", nameType: "dharma", value: "Willigis Jäger" },
      { locale: "en", nameType: "alias", value: "Ko-un Ken" },
    ],
    birthYear: 1925,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2020,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Willigis Jäger OSB (1925–2020) was a German Benedictine monk of Münsterschwarzach Abbey whose 1980 authorisation as a Sanbō Kyōdan *shōshike* — and 1996 *inka shōmei* from Kubota Ji'un — made him one of Europe's most widely-known Zen masters in the Yasutani-Yamada line, before his 2009 separation from Sanbō Zen and continued independent teaching from the Benediktushof he founded in 2003[1].\n\nBorn on 7 March 1925 in Hörstein, Bavaria, he entered Münsterschwarzach Abbey in 1946 and was ordained a Catholic priest in 1952. He encountered Zen through his confrère Hugo Enomiya-Lassalle and began formal training under Yamada Kōun at San-un Zendō from 1975; Yamada authorised him as a teacher within Sanbō Kyōdan in 1980, and after Yamada's death his successor Kubota Ji'un conferred formal *inka shōmei* in 1996[1]. From 1983 Jäger led the meditation centre at Münsterschwarzach Abbey, and in 2003 founded the Benediktushof at Holzkirchen near Würzburg, the largest German-language interfaith contemplation centre[1].\n\nHis relationship with the Catholic Church grew increasingly strained: in 2002 the Congregation for the Doctrine of the Faith placed him under a teaching prohibition for positions on mystical experience perceived as drifting from Catholic doctrine. He resigned from priestly ministry in 2009 while remaining a Benedictine monk, and in the same year withdrew his teaching from the Sanbō Zen organisation, continuing independently under the West-Östliche Weisheit (\"West-East Wisdom\") foundation he had established[1][2]. His extensive German-language bibliography — including *Suche nach dem Sinn des Lebens* (1995), *Die Welle ist das Meer* (2000), and *Westöstliche Weisheit* (2007) — popularised the Sanbō Zen kōan curriculum for Catholic and post-confessional readerships across Europe. He died at Holzkirchen on 20 March 2020[1].",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Willigis Jäger" },
      { sourceId: "src_benediktushof", fieldName: "biography", pageOrSection: "benediktushof.de — Über uns" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Willigis Jäger", excerpt: "Willigis Jäger (7 March 1925 – 20 March 2020) was a German Benedictine monk and Zen master in the Sanbō Kyōdan lineage. Entered Münsterschwarzach Abbey 1946; ordained priest 1952. Began Zen training under Yamada Kōun 1975; authorised teacher (shōshike) within Sanbō Kyōdan 1980; received inka shōmei from Kubota Ji'un 1996. Founded Benediktushof at Holzkirchen 2003. Placed under teaching prohibition by the Congregation for the Doctrine of the Faith 2002; resigned priestly ministry 2009 while remaining a monk; in 2009 withdrew his teaching from Sanbō Zen and continued independently through the West-Östliche Weisheit foundation." },
      { index: 2, sourceId: "src_benediktushof", pageOrSection: "benediktushof.de — Über uns / Willigis Jäger", excerpt: "Benediktushof was founded in 2003 by Willigis Jäger as a centre for meditation and mindfulness in the West-Östliche Weisheit lineage. After 2009 the centre operated independently of Sanbō Zen." },
    ],
    transmissions: [
      {
        teacherSlug: "yamada-koun",
        type: "primary",
        isPrimary: true,
        notes: "Teaching authorisation as shōshike, 1980, after sustained training at San-un Zendō from 1975. Jäger later withdrew from Sanbō Zen in 2009 to teach independently.",
        sourceIds: ["src_wikipedia"],
      },
      {
        teacherSlug: "kubota-jiun",
        type: "secondary",
        isPrimary: false,
        notes: "Formal inka shōmei, 1996, conferred after Yamada Kōun's death. The institutional Sanbō Zen credential alongside the 1980 shōshike rank from Yamada.",
        sourceIds: ["src_wikipedia"],
      },
      {
        teacherSlug: "hugo-enomiya-lassalle",
        type: "secondary",
        isPrimary: false,
        notes: "Initial Zen mentor and Jesuit confrère; introduced Jäger to formal practice and to San-un Zendō in the early 1970s.",
        sourceIds: ["src_wikipedia"],
      },
    ],
  },

  // ─── USA: senior junshike (Shukman's primary teacher) ────────────────
  {
    slug: "joan-rieck",
    schoolSlug: "sanbo-zen",
    names: [
      { locale: "en", nameType: "dharma", value: "Joan Rieck" },
      { locale: "en", nameType: "alias", value: "Jyō'un-an" },
      { locale: "ja", nameType: "dharma", value: "浄雲庵" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Joan \"Jyō'un-an\" Rieck (浄雲庵) is an American Sanbō Zen *junshike* — one of the senior Western teachers authorised within the lineage to lead the full kōan curriculum — and the primary training teacher of Henry Shukman at Mountain Cloud Zen Center[1]. She trained directly under Yamada Kōun at the San-un Zendō in Kamakura from 1971 until his death in 1989, completing the Sanbō Kyōdan kōan curriculum across nearly two decades of seasonal residential training in Japan[1].\n\nAuthorised as a Zen teacher (*zenkyōshi*) in 1981 under Yamada Kōun, she was elevated to associate master (*junshike*) under Kubota Ji'un in 2001[1]. Her principal teaching bases are the Sandia Zendo in New Mexico and the Sonnenhof retreat centre in Germany's Black Forest, from which she has trained students across the United States and Central Europe over four decades[1][2].\n\nHer most visible scholarly contribution is the joint translation, with Henry Shukman, of Yamada Kōun's *Zen: The Authentic Gate* (Wisdom Publications, 2015) — a posthumous compilation of Yamada's introductory dharma talks and the closest thing to an authorised English-language statement of Sanbō Zen's curriculum[1]. She is widely described by her own students as a reclusive teacher whose work has been intentionally low-profile; she remains on Sanbō Zen International's active teacher roster[1].",
    citations: [
      { sourceId: "src_sanbozen", fieldName: "biography", pageOrSection: "sanbo-zen-international.org/teachers — Joan Rieck" },
      { sourceId: "src_sandia_zendo", fieldName: "biography", pageOrSection: "sanbo-zen.org/master_e.html" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org/teachers — Joan Rieck (Jyō'un-an)", excerpt: "Dharma name: Jyō'un-an. Trained under Yamada Kōun at San-un Zendō from 1971; authorised as zenkyōshi 1981; promoted to junshike 2001 under Kubota Ji'un. Active centres: Sandia Zendo (USA), Sonnenhof (Black Forest, Germany). Co-translator with Henry Shukman of Yamada Kōun's 'Zen: The Authentic Gate' (Wisdom Publications, 2015)." },
      { index: 2, sourceId: "src_sandia_zendo", pageOrSection: "sanbo-zen.org/master_e.html — Joan Rieck Rōshi", excerpt: "Joan Rieck Rōshi is the resident teacher of Sandia Zendo (Albuquerque/Cedar Crest, New Mexico) and conducts sesshin annually at the Sonnenhof retreat centre in the Black Forest, Germany." },
    ],
    transmissions: [
      {
        teacherSlug: "yamada-koun",
        type: "primary",
        isPrimary: true,
        notes: "Primary teacher 1971–1989; zenkyōshi 1981 under Yamada Kōun. Subsequently promoted to junshike (associate master) under Kubota Ji'un in 2001.",
        sourceIds: ["src_sanbozen"],
      },
      {
        teacherSlug: "kubota-jiun",
        type: "secondary",
        isPrimary: false,
        notes: "Conferred junshike (associate master) rank, 2001, after Yamada Kōun's death.",
        sourceIds: ["src_sanbozen"],
      },
    ],
  },

  // ─── USA: current Mountain Cloud Guiding Teacher ─────────────────────
  {
    slug: "valerie-forstman",
    schoolSlug: "sanbo-zen",
    names: [
      { locale: "en", nameType: "dharma", value: "Valerie Forstman" },
      { locale: "en", nameType: "alias", value: "Meikō-an" },
      { locale: "ja", nameType: "dharma", value: "明光庵" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Valerie \"Meikō-an\" Forstman (明光庵) is the current Guiding Teacher of Mountain Cloud Zen Center in Santa Fe, New Mexico, and a Sanbō Zen *junshike* authorised within the lineage of Rubén Habito's Maria Kannon Zen Center and the patriarchate of Yamada Ryōun[1]. A musician and theologian by training, she served on the faculty of Brite Divinity School at Texas Christian University, eventually as associate dean, before stepping into full-time Zen teaching[1].\n\nShe began formal practice with Rubén Habito at the Maria Kannon Zen Center in Dallas, completing the Sanbō Zen kōan curriculum under him and receiving authorisation as a Zen teacher (*zenkyōshi*) in 2005. In 2015, after additional training under Yamada Ryōun in Kamakura, she was elevated to *junshike* (associate master)[1]. She was appointed Guiding Teacher of Mountain Cloud Zen Center in 2015 following Henry Shukman's transition to emeritus status, and has since directed weekly zazen, residential sesshin, and the centre's affiliate sangha network across the United States[1][2].\n\nHer teaching emphasises the silent introspective dimension of kōan work and the Christian-contemplative resonances first explored within the lineage by Hugo Enomiya-Lassalle and Rubén Habito; she also leads programmes in Germany under the international Sanbō Zen network[1].",
    citations: [
      { sourceId: "src_sanbozen", fieldName: "biography", pageOrSection: "sanbo-zen-international.org/teachers — Valerie Forstman" },
      { sourceId: "src_mountaincloud", fieldName: "biography", pageOrSection: "mountaincloud.org — Valerie Forstman" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org/teachers — Valerie Forstman (Meikō-an)", excerpt: "Dharma name: Meikō-an. Trained under Rubén Habito at Maria Kannon Zen Center; later under Yamada Ryōun. Authorised as zenkyōshi 2005; promoted to junshike 2015. Current Guiding Teacher at Mountain Cloud Zen Center, Santa Fe, New Mexico." },
      { index: 2, sourceId: "src_mountaincloud", pageOrSection: "mountaincloud.org/about/teacher-valerie-forstman — Valerie Forstman Rōshi", excerpt: "Valerie Forstman is the Guiding Teacher of Mountain Cloud Zen Center, succeeding Henry Shukman in 2015. Former associate dean at Brite Divinity School (Texas Christian University). Trained under Ruben Habito and Yamada Ryōun in the Sanbō Zen lineage." },
    ],
    transmissions: [
      {
        teacherSlug: "ruben-habito",
        type: "primary",
        isPrimary: true,
        notes: "Founding teacher at Maria Kannon Zen Center; zenkyōshi authorisation 2005.",
        sourceIds: ["src_sanbozen", "src_mountaincloud"],
      },
      {
        teacherSlug: "yamada-ryoun",
        type: "secondary",
        isPrimary: false,
        notes: "Senior teacher under whom Forstman trained in Kamakura; junshike (associate master) promotion, 2015. Current Guiding Teacher at Mountain Cloud Zen Center.",
        sourceIds: ["src_sanbozen"],
      },
    ],
  },

  // ─── USA: shōshike (the original ask) ────────────────────────────────
  {
    slug: "henry-shukman",
    schoolSlug: "sanbo-zen",
    names: [
      { locale: "en", nameType: "dharma", value: "Henry Shukman" },
      { locale: "en", nameType: "alias", value: "Ryū'un-ken" },
      { locale: "ja", nameType: "dharma", value: "龍雲軒" },
    ],
    birthYear: 1962,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Henry \"Ryū'un-ken\" Shukman (龍雲軒, b. 1962) is a British-born poet, novelist, and Sanbō Zen *shōshike* — the highest rank in the lineage and, since his appointment by Yamada Ryōun in 2020, the first North-American-resident teacher to hold it in the Yasutani-Yamada line[1][2]. Born in Oxford in 1962, he had a spontaneous awakening experience at nineteen and pursued a literary career through his twenties and thirties — winning an Arts Council of England Award and a Guggenheim Fellowship for his poetry and fiction — before turning to formal Zen practice in his thirties[1].\n\nHis Zen training proceeded along three parallel teacher relationships: Joan Rieck Rōshi at Mountain Cloud Zen Center as his primary teacher, John Gaynor in the United Kingdom, and Rubén Habito at the Maria Kannon Zen Center in Dallas[1][2]. Within Sanbō Zen International he received progressive authorisations from Yamada Ryōun: *zenkyōshi* in 2011, *junshike* (associate master) in 2013, and full *shōshike* in 2020[2]. He served as Guiding Teacher of Mountain Cloud Zen Center from 2013 until 2015, when he stepped into the role of Spiritual Director Emeritus and Valerie Forstman succeeded him as Guiding Teacher[1].\n\nHis memoir *One Blade of Grass: Finding the Old Road of the Heart* (Counterpoint, 2019) — selected by *The New York Times* as one of the year's best spiritual books — traces this trajectory from early awakening through serious illness to formal Sanbō Zen training; *Original Love: The Four Inns on the Path of Awakening* (St. Martin's Essentials, 2024) develops his teaching framework for lay practice[1]. In 2024 he co-founded the contemplative app **The Way**, which presents the Sanbō Zen kōan curriculum in a structured digital format for general audiences and has become his principal teaching channel outside Mountain Cloud[1].",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Henry Shukman" },
      { sourceId: "src_sanbozen", fieldName: "biography", pageOrSection: "sanbo-zen-international.org/teachers — Henry Shukman" },
      { sourceId: "src_mountaincloud", fieldName: "biography", pageOrSection: "mountaincloud.org — Henry Shukman" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Henry Shukman", excerpt: "Henry Shukman (born 1962, Oxford) is a British-born Sanbō Zen teacher, poet, and novelist. Spontaneous awakening at age 19; trained under Joan Rieck, John Gaynor, and Ruben Habito, then Yamada Ryōun. Received zenkyōshi 2011, junshike 2013, shōshike (full Zen Master) 2020 from Yamada Ryōun. Guiding Teacher of Mountain Cloud Zen Center 2013–2015; Spiritual Director Emeritus from 2015. Memoir 'One Blade of Grass' (Counterpoint, 2019); 'Original Love' (St. Martin's Essentials, 2024). Co-founder of The Way meditation app (2024)." },
      { index: 2, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org/teachers — Henry Shukman (Ryū'un-ken)", excerpt: "Dharma name: Ryū'un-ken. Trained under Joan Rieck and Ruben Habito; authorisations from Yamada Ryōun — zenkyōshi 2011, junshike 2013, shōshike 2020. Mountain Cloud Zen Center, Santa Fe, NM; Spiritual Director Emeritus." },
    ],
    transmissions: [
      {
        teacherSlug: "joan-rieck",
        type: "primary",
        isPrimary: true,
        notes: "Primary training teacher at Mountain Cloud Zen Center across Shukman's formative Sanbō Zen practice.",
        sourceIds: ["src_wikipedia", "src_sanbozen"],
      },
      {
        teacherSlug: "ruben-habito",
        type: "secondary",
        isPrimary: false,
        notes: "Additional Sanbō Zen training teacher; kōan-curriculum work at Maria Kannon Zen Center.",
        sourceIds: ["src_wikipedia"],
      },
      {
        teacherSlug: "yamada-ryoun",
        type: "secondary",
        isPrimary: false,
        notes: "Formal Sanbō Zen authorisations conferred by the 4th Patriarch: zenkyōshi 2011, junshike 2013, shōshike (full Zen Master) 2020 — the highest US rank in the lineage.",
        sourceIds: ["src_wikipedia", "src_sanbozen"],
      },
    ],
  },
];
