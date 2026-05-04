/**
 * Canonical "works" — first-class teaching rows that represent entire texts
 * (Shōbōgenzō, Fukanzazengi, the Linji Lu, the Platform Sutra, etc.) rather
 * than individual koans, sermons, or sayings inside them.
 *
 * Each work seeds a row in `teachings` with `type = 'work'`, an English
 * `teaching_content` row, and at least one citation. The `author_slug` MUST
 * match an existing `masters.slug` — see `seed-works.ts` for the resolution
 * step.
 *
 * Adding a work? Cite a real edition or institutional source for the
 * description, set a `license_status` on the content row, and keep slugs
 * lowercase-with-dashes.
 */
export interface WorkSeed {
  slug: string;
  authorSlug: string;
  collection: string | null;
  era: string | null;
  attributionStatus: "verified" | "traditional" | "unresolved";
  title: string;
  /** Native-language title (kept in `original_title` content row when set). */
  originalTitle?: string;
  /** Compact description: what it is, when, why it matters, how to read it. */
  description: string;
  translator?: string;
  edition?: string;
  licenseStatus:
    | "public_domain"
    | "cc_by"
    | "cc_by_sa"
    | "fair_use"
    | "editorial"
    | "unknown";
  /** Which of the existing seeded `sources` rows backs the description. */
  sourceId: string;
  /** Where in that source the claim lives — page, section, URL fragment. */
  locator: string;
  /** Brief excerpt from the source supporting the description. */
  excerpt: string;
}

export const WORKS: WorkSeed[] = [
  // ─── Dōgen (Sōtō, Kamakura) ──────────────────────────────────────────────
  {
    slug: "shobogenzo",
    authorSlug: "dogen",
    collection: "Shobogenzo",
    era: "Kamakura",
    attributionStatus: "verified",
    title: "Shōbōgenzō (Treasury of the True Dharma Eye)",
    originalTitle: "正法眼蔵",
    description:
      "Dōgen's central work: a collection of 95 fascicles composed between 1231 and 1253, written in vernacular Japanese rather than classical Chinese. Each fascicle is a stand-alone meditation on practice, perception, language, or doctrine — Genjōkōan, Bendōwa, Uji, Sansuikyō, Busshō, and others have circulated independently for centuries. The text is the foundational scripture of Sōtō Zen and one of the most commented-on works of medieval Japanese Buddhism.",
    translator: "Kazuaki Tanahashi (ed. & trans.)",
    edition: "Treasury of the True Dharma Eye, Shambhala 2010 (2 vols.)",
    licenseStatus: "fair_use",
    sourceId: "src_cleary_shobogenzo",
    locator: "Editor's introduction, vol. 1",
    excerpt:
      "Shōbōgenzō, the masterwork of Eihei Dōgen (1200–1253), is widely recognized as one of the profoundest expressions of Zen wisdom and the founding text of Japan's Sōtō Zen school.",
  },
  {
    slug: "fukanzazengi",
    authorSlug: "dogen",
    collection: "Fukanzazengi",
    era: "Kamakura",
    attributionStatus: "verified",
    title: "Fukanzazengi (Universal Recommendation for Zazen)",
    originalTitle: "普勧坐禅儀",
    description:
      "Dōgen's earliest extant work and his foundational practice manual, drafted in 1227 shortly after his return from China and revised in 1233. In a few hundred characters it lays out the rationale, posture, breathing, and inner orientation of zazen — the seated meditation he treats not as a means to enlightenment but as its very expression. Read in Sōtō zendos worldwide as the canonical \"how-to\" of shikantaza.",
    translator: "Sōtōshū Shūmuchō",
    edition: "Sōtō Zen Text Project — Fukanzazengi (Universal Recommendation for Zazen)",
    licenseStatus: "fair_use",
    sourceId: "src_dogen_fukanzazengi",
    locator: "Sōtōshū global website, Fukanzazengi page",
    excerpt:
      "Fukan Zazengi (Universal Recommendation for Zazen) is the first known writing on Zazen by Dōgen Zenji, founder of the Sōtō Zen school in Japan. He wrote it in 1227, the year of his return from Sung China.",
  },
  {
    slug: "eihei-koroku",
    authorSlug: "dogen",
    collection: "Eihei Koroku",
    era: "Kamakura",
    attributionStatus: "verified",
    title: "Eihei Kōroku (Dōgen's Extensive Record)",
    originalTitle: "永平広録",
    description:
      "A ten-volume record of Dōgen's later teaching at Eihei-ji, compiled by his successors. It collects formal jōdō (Dharma hall discourses), shōsan (informal talks), kōan commentaries, and Chinese-style verse — the documentary counterpart to Shōbōgenzō. The Leighton & Okumura translation makes the full Chinese-language record available in English for the first time.",
    translator: "Taigen Dan Leighton & Shohaku Okumura",
    edition: "Dōgen's Extensive Record, Wisdom Publications 2004",
    licenseStatus: "fair_use",
    sourceId: "src_leighton_okumura_eihei_koroku",
    locator: "Translators' introduction",
    excerpt:
      "The Eihei Kōroku is the major collection of the formal Dharma hall discourses, informal talks, and other writings of Eihei Dōgen, the thirteenth-century founder of the Japanese Sōtō Zen tradition.",
  },
  {
    slug: "tenzo-kyokun",
    authorSlug: "dogen",
    collection: "Tenzo Kyokun",
    era: "Kamakura",
    attributionStatus: "verified",
    title: "Tenzo Kyōkun (Instructions for the Cook)",
    originalTitle: "典座教訓",
    description:
      "Dōgen's 1237 essay on the vocation of the monastery cook, drawing on encounters with two old tenzos he met in China. Although the surface subject is kitchen work, the text develops Dōgen's account of how attentiveness in everyday tasks is itself the unfolding of practice — and is widely read today outside the monastic context.",
    translator: "Sōtōshū Shūmuchō",
    edition: "Sōtō Zen Text Project — Tenzo Kyōkun",
    licenseStatus: "fair_use",
    sourceId: "src_sotoshu_global",
    locator: "Sōtōshū canonical texts index",
    excerpt:
      "Tenzo Kyōkun is one of Dōgen's most widely read short writings. It treats the role of the monastery cook (tenzo) as a complete ground for practice and realization.",
  },
  {
    slug: "gakudo-yojinshu",
    authorSlug: "dogen",
    collection: "Gakudo Yojinshu",
    era: "Kamakura",
    attributionStatus: "verified",
    title: "Gakudō Yōjinshū (Points to Watch in Buddhist Practice)",
    originalTitle: "学道用心集",
    description:
      "Ten short admonitions for practitioners, composed around 1234. Each point — arousing the way-seeking mind, taking refuge, reading sutras, sitting zazen — is presented as an instruction to be turned over and embodied rather than merely understood. One of the most accessible entry points into Dōgen for new practitioners.",
    translator: "Sōtōshū Shūmuchō",
    edition: "Sōtō Zen Text Project — Gakudō Yōjinshū",
    licenseStatus: "fair_use",
    sourceId: "src_sotoshu_global",
    locator: "Sōtōshū canonical texts index",
    excerpt:
      "Gakudō Yōjinshū collects ten short pieces of advice on the cultivation of the way, written by Dōgen for his students.",
  },
  // ─── Hakuin (Rinzai, Edo) ────────────────────────────────────────────────
  {
    slug: "orategama",
    authorSlug: "hakuin-ekaku",
    collection: "Orategama",
    era: "Edo",
    attributionStatus: "verified",
    title: "Orategama (The Embossed Tea-Kettle)",
    originalTitle: "遠羅天釜",
    description:
      "A three-part collection of letters by Hakuin (1751) addressed to a daimyō, a nun, and a fellow Zen master. The Orategama lays out Hakuin's mature account of kōan introspection (kanna-zen), naijikan energy practice, and the necessity of post-satori cultivation — the framework that shapes modern Rinzai training to this day.",
    translator: "Philip B. Yampolsky",
    edition: "The Zen Master Hakuin: Selected Writings, Columbia University Press 1971",
    licenseStatus: "fair_use",
    sourceId: "src_dumoulin_japan",
    locator: "Volume 2, chapter on Hakuin Ekaku",
    excerpt:
      "Hakuin's letters in the Orategama are among the most important programmatic statements of Rinzai Zen in the Edo period and have shaped its training methods up to the present.",
  },
  {
    slug: "zazen-wasan",
    authorSlug: "hakuin-ekaku",
    collection: "Zazen Wasan",
    era: "Edo",
    attributionStatus: "verified",
    title: "Zazen Wasan (Song of Zazen)",
    originalTitle: "坐禅和讃",
    description:
      "Hakuin's short verse-hymn in the vernacular, chanted at the close of zazen sessions in Rinzai temples worldwide. \"All beings by nature are Buddha, as ice by nature is water\" — its forty-four lines compress Hakuin's teaching that practice and realization are not separate, intended to be memorised by lay practitioners.",
    translator: "Trevor Leggett (after several earlier renderings)",
    edition: "Public-domain English translation; original c. 1750",
    licenseStatus: "public_domain",
    sourceId: "src_wikisource",
    locator: "Wikisource — Zazen Wasan",
    excerpt:
      "Zazen Wasan, the Song of Zazen, is a verse hymn by Hakuin that is chanted at the close of zazen in many Rinzai temples.",
  },
  {
    slug: "keiso-dokuzui",
    authorSlug: "hakuin-ekaku",
    collection: "Keiso Dokuzui",
    era: "Edo",
    attributionStatus: "verified",
    title: "Keisō Dokuzui (Poison-Stamens of a Thicket of Thorns)",
    originalTitle: "荊叢毒蘂",
    description:
      "Hakuin's most demanding kōan-commentary collection: dense, allusive verses and prose responses to traditional cases. The title — \"poison-stamens\" — flags Hakuin's view that genuine kōan study demands the ingestion of something dangerous to the conventional self. Selectively translated; remains a touchstone for Rinzai kōan curriculum.",
    edition: "Hakuin Zenji's Complete Works (Hakuin Oshō Zenshū), 1934 ed.",
    licenseStatus: "fair_use",
    sourceId: "src_dumoulin_japan",
    locator: "Volume 2, Hakuin's writings",
    excerpt:
      "Keisō Dokuzui contains Hakuin's most extensive kōan commentaries and is a primary source for the kōan curriculum that he and his successors established.",
  },
  // ─── Keizan (Sōtō, Kamakura) ─────────────────────────────────────────────
  {
    slug: "denkoroku",
    authorSlug: "keizan-jokin",
    collection: "Denkoroku",
    era: "Kamakura",
    attributionStatus: "verified",
    title: "Denkōroku (The Record of the Transmission of the Light)",
    originalTitle: "傳光録",
    description:
      "Keizan's record of the lineage from Śākyamuni through fifty-two generations of Indian, Chinese, and Japanese ancestors down to Ejō, his teacher. Each chapter pairs an awakening dialogue with Keizan's commentary and verse. Together with the Shōbōgenzō it forms one of the two foundational texts of Sōtō Zen.",
    translator: "Francis H. Cook",
    edition: "The Record of Transmitting the Light, Wisdom Publications 2003",
    licenseStatus: "fair_use",
    sourceId: "src_sotoshu_global",
    locator: "Sōtōshū canonical texts index",
    excerpt:
      "The Denkōroku, compiled by Keizan Jōkin around 1300, narrates the awakening of fifty-two ancestors of the Sōtō Zen lineage.",
  },
  {
    slug: "zazen-yojinki",
    authorSlug: "keizan-jokin",
    collection: "Zazen Yojinki",
    era: "Kamakura",
    attributionStatus: "verified",
    title: "Zazen Yōjinki (Notes on What to Be Aware of in Zazen)",
    originalTitle: "坐禅用心記",
    description:
      "Keizan's practical complement to Dōgen's Fukanzazengi: a detailed handbook on posture, attention, the management of drowsiness and distraction, and the integration of zazen into daily life. Often the second text a Sōtō student is given after the Fukanzazengi.",
    translator: "Sōtōshū Shūmuchō",
    edition: "Sōtō Zen Text Project — Zazen Yōjinki",
    licenseStatus: "fair_use",
    sourceId: "src_sotoshu_global",
    locator: "Sōtōshū canonical texts index",
    excerpt:
      "Zazen Yōjinki, by Keizan Jōkin, is the principal Sōtō Zen handbook on the practical conduct of seated meditation.",
  },
  // ─── Huineng (Chan, Tang) ────────────────────────────────────────────────
  {
    slug: "platform-sutra",
    authorSlug: "dajian-huineng",
    collection: "Platform Sutra",
    era: "Tang",
    attributionStatus: "traditional",
    title: "Platform Sutra of the Sixth Patriarch (Liùzǔ Tánjīng)",
    originalTitle: "六祖壇經",
    description:
      "The only Chinese text outside the imported Indian canon to be called a sūtra. Framed as Huineng's autobiography and sermons at Dafan-si, surviving in a Dunhuang manuscript (~780 CE) and a longer Yuan-dynasty redaction. It establishes the Southern School's signature teachings — sudden awakening, the inseparability of meditation and wisdom, and the seeing of one's own nature — and is the single most influential Chan text after the canonical sūtras.",
    translator: "Philip B. Yampolsky",
    edition: "The Platform Sutra of the Sixth Patriarch, Columbia University Press 1967",
    licenseStatus: "fair_use",
    sourceId: "src_platform_sutra_yampolsky_1967",
    locator: "Translator's introduction",
    excerpt:
      "The Platform Sutra of the Sixth Patriarch is one of the most popular and influential of Zen texts. It purports to record sermons given by the great Chan master Huineng at the Dafan temple in Shaozhou.",
  },
  // ─── Linji (Linji/Rinzai, Tang) ──────────────────────────────────────────
  {
    slug: "linji-lu",
    authorSlug: "linji-yixuan",
    collection: "Linji Lu",
    era: "Tang",
    attributionStatus: "traditional",
    title: "Linji Lu (Record of Linji)",
    originalTitle: "臨濟錄",
    description:
      "Compiled by Linji's heirs and reaching its present form under Yuanjue Zongyan in 1120, the Linji Lu collects the master's discourses, encounter dialogues, and travel records. It is the source text for the four shouts, the four classifications of subject and object, and \"the true person of no rank\" — the rhetorical devices around which the entire Linji/Rinzai school subsequently organised itself.",
    translator: "Burton Watson",
    edition: "The Zen Teachings of Master Lin-chi, Columbia University Press 1993",
    licenseStatus: "fair_use",
    sourceId: "src_dumoulin_india_china",
    locator: "Volume 1, chapter on Linji Yixuan",
    excerpt:
      "The Linji Lu is the foundational scripture of the Linji school, compiled by Linji's followers and reaching its standard form in the Song.",
  },
  // ─── Huangbo (Hongzhou, Tang) ────────────────────────────────────────────
  {
    slug: "chuanxin-fayao",
    authorSlug: "huangbo-xiyun",
    collection: "Chuanxin Fayao",
    era: "Tang",
    attributionStatus: "traditional",
    title: "Chuánxīn Fǎyào (Essentials of Mind Transmission)",
    originalTitle: "傳心法要",
    description:
      "Huangbo's teachings as recorded by the Tang official and lay disciple Pei Xiu in 857. The text is a sustained treatise on the One Mind that is identical with all buddhas — no graduated practice, no entry from outside, only direct seeing. Read together with Huangbo's later \"Wanling Record,\" it became one of the most concise statements of Hongzhou-school teaching to enter the standard Chan canon.",
    translator: "John Blofeld",
    edition: "The Zen Teaching of Huang Po: On the Transmission of Mind, Grove Press 1958",
    licenseStatus: "fair_use",
    sourceId: "src_dumoulin_india_china",
    locator: "Volume 1, chapter on Huangbo Xiyun",
    excerpt:
      "The Chuanxin fayao, recorded by Pei Xiu around 857, is the principal record of Huangbo's teaching and a central text of the Hongzhou school.",
  },
  // ─── Yuanwu (Linji, Song) ────────────────────────────────────────────────
  {
    slug: "blue-cliff-record",
    authorSlug: "yuanwu-keqin",
    collection: "Blue Cliff Record",
    era: "Song",
    attributionStatus: "verified",
    title: "Blue Cliff Record (Bìyán Lù)",
    originalTitle: "碧巖錄",
    description:
      "A Song-dynasty kōan collection: 100 cases originally selected and versed by Xuedou Chongxian (980–1052), each surrounded by Yuanwu's pointer, capping phrases, and prose commentary (compiled c. 1125). Its dense layering of citation and poetry is the model for the entire kōan-commentary genre. Reportedly burned by Yuanwu's heir Dahui Zonggao to discourage formulaic study, then reconstructed in 1300.",
    translator: "Thomas Cleary & J. C. Cleary",
    edition: "The Blue Cliff Record, Shambhala 1977 (3 vols.)",
    licenseStatus: "fair_use",
    sourceId: "src_blue_cliff_record_shaw_1961",
    locator: "Translator's introduction",
    excerpt:
      "The Blue Cliff Record is the classical collection of Chan kōan commentaries: one hundred cases with Xuedou's verses, set off by Yuanwu's prose introductions, capping phrases, and notes.",
  },
  // ─── Wumen (Linji, Song) ─────────────────────────────────────────────────
  {
    slug: "wumenguan",
    authorSlug: "wumen-huikai",
    collection: "Wumenguan",
    era: "Song",
    attributionStatus: "verified",
    title: "Wúménguān (The Gateless Barrier / Mumonkan)",
    originalTitle: "無門關",
    description:
      "Wumen Huikai's 1228 collection of forty-eight kōans, each followed by his prose comment and a verse. Compact, demotic, and unornamented compared with the Blue Cliff Record, it became the standard kōan textbook of the Japanese Rinzai school and remains the entry point for most Western kōan curricula. Cases 1 (\"Zhaozhou's dog\"), 7 (\"Zhaozhou's bowl\"), and 19 (\"Ordinary mind is the way\") are among the best-known.",
    translator: "Nyogen Senzaki & Paul Reps",
    edition: "Public-domain Senzaki/Reps translation, 1934",
    licenseStatus: "public_domain",
    sourceId: "src_mumonkan_senzaki_1934",
    locator: "Wikisource — The Gateless Gate",
    excerpt:
      "The Mumonkan or Wumenguan, compiled by Wumen Huikai in 1228, contains forty-eight kōans, each accompanied by his commentary and verse, and has become the most widely used kōan textbook in the Rinzai tradition.",
  },
  // ─── Hongzhi (Caodong, Song) ─────────────────────────────────────────────
  {
    slug: "book-of-serenity",
    authorSlug: "hongzhi-zhengjue",
    collection: "Book of Serenity",
    era: "Song",
    attributionStatus: "traditional",
    title: "Book of Serenity (Cóngróng Lù)",
    originalTitle: "從容錄",
    description:
      "Hongzhi Zhengjue (1091–1157) selected and versed 100 kōans; a generation later Wansong Xingxiu added prose commentary, producing the Caodong/Sōtō counterpart to the Blue Cliff Record. The collection emphasises silent illumination (mòzhào) and the subtle dialectic of Caodong rather than dramatic encounter, and circulates today as the standard kōan curriculum on the Sōtō side of the lineage.",
    translator: "Thomas Cleary",
    edition: "Book of Serenity: One Hundred Zen Dialogues, Lindisfarne Press 1990",
    licenseStatus: "fair_use",
    sourceId: "src_dumoulin_india_china",
    locator: "Volume 1, chapter on Hongzhi Zhengjue",
    excerpt:
      "Hongzhi Zhengjue's 100 verses on classical kōans, with Wansong's commentary, became the Cóngróng Lù — the Caodong school's parallel to the Blue Cliff Record.",
  },
  // ─── Shitou (Caodong root, Tang) ─────────────────────────────────────────
  {
    slug: "sandokai",
    authorSlug: "shitou-xiqian",
    collection: "Sandokai",
    era: "Tang",
    attributionStatus: "verified",
    title: "Sandōkai (Harmony of Difference and Equality)",
    originalTitle: "參同契",
    description:
      "Shitou Xiqian's short Tang-dynasty verse on the interpenetration of the relative and the absolute — \"the spiritual source shines clear in the light; the branching streams flow on in the dark.\" Forty-four lines, chanted daily in Sōtō zendos along with Dongshan's Jewel Mirror Samādhi, and one of the doctrinal seeds of the Caodong/Sōtō \"five ranks.\"",
    translator: "Sōtōshū Shūmuchō",
    edition: "Sōtō Zen Text Project — Sandōkai",
    licenseStatus: "public_domain",
    sourceId: "src_sotoshu_global",
    locator: "Sōtōshū canonical texts index",
    excerpt:
      "Sandōkai, by Shitou Xiqian, is one of the classical Chan verses chanted in Sōtō Zen liturgy and a doctrinal source for the five ranks teaching.",
  },
  {
    slug: "song-of-grass-roof-hermitage",
    authorSlug: "shitou-xiqian",
    collection: "Cao'an Ge",
    era: "Tang",
    attributionStatus: "traditional",
    title: "Song of the Grass-Roof Hermitage (Cǎo'ān Gē)",
    originalTitle: "草庵歌",
    description:
      "A Tang-dynasty hermit-song attributed to Shitou: thirty-two lines that describe a grass-thatched hut as both a literal dwelling and the unhoused Mind. Re-introduced into the modern Sōtō repertoire largely through Daniel Leighton's translation work; quietly influential on the contemporary American \"hermit\" practice imaginary.",
    translator: "Taigen Dan Leighton",
    edition: "Cultivating the Empty Field, Tuttle 1991 (revised 2000)",
    licenseStatus: "fair_use",
    sourceId: "src_dumoulin_india_china",
    locator: "Volume 1, chapter on Shitou Xiqian",
    excerpt:
      "The Song of the Grass-Roof Hermitage is a Tang-dynasty verse traditionally attributed to Shitou Xiqian, describing a small hut as the place of the unhoused Mind.",
  },
  // ─── Dongshan (Caodong founder, Tang) ────────────────────────────────────
  {
    slug: "five-ranks",
    authorSlug: "dongshan-liangjie",
    collection: "Five Ranks",
    era: "Tang",
    attributionStatus: "verified",
    title: "Five Ranks of Lord and Vassal (Wǔwèi Jūnchén)",
    originalTitle: "五位君臣",
    description:
      "Dongshan's dialectical schema of the relationship between the absolute (zhèng, \"upright\") and the relative (piān, \"inclined\"). The five positions — relative within the absolute, absolute within the relative, coming from the absolute, going within both, arriving in both — became the doctrinal backbone of Caodong/Sōtō and a major kōan-curriculum object in later Rinzai training.",
    edition: "Original Tang text; widely re-translated",
    licenseStatus: "fair_use",
    sourceId: "src_dumoulin_india_china",
    locator: "Volume 1, chapter on Dongshan Liangjie",
    excerpt:
      "Dongshan Liangjie's five ranks of lord and vassal articulate the interplay of absolute and relative and form the doctrinal core of the Caodong school.",
  },
  {
    slug: "song-of-jewel-mirror-samadhi",
    authorSlug: "dongshan-liangjie",
    collection: "Baojing Sanmei",
    era: "Tang",
    attributionStatus: "verified",
    title: "Song of the Jewel Mirror Samādhi (Bǎojìng Sānmèi Gē)",
    originalTitle: "寶鏡三昧歌",
    description:
      "Dongshan's verse compendium, transmitted from his teacher Yunyan, that compresses the entire Caodong account of practice into ninety-six lines. Chanted in Sōtō morning service worldwide alongside the Sandōkai. Notable for its treatment of the relationship between teacher and student as a single mirror reflecting itself.",
    translator: "Sōtōshū Shūmuchō",
    edition: "Sōtō Zen Text Project — Hōkyō Zanmai",
    licenseStatus: "public_domain",
    sourceId: "src_sotoshu_global",
    locator: "Sōtōshū canonical texts index",
    excerpt:
      "The Song of the Jewel Mirror Samādhi is a verse text by Dongshan Liangjie, chanted daily in Sōtō Zen liturgy.",
  },
  // ─── Jinul (Korean Seon, Goryeo) ─────────────────────────────────────────
  {
    slug: "susimgyeol",
    authorSlug: "jinul",
    collection: "Susimgyeol",
    era: "Goryeo",
    attributionStatus: "verified",
    title: "Susimgyŏl (Secrets on Cultivating the Mind)",
    originalTitle: "修心訣",
    description:
      "A short tract by Pojo Chinul (1158–1210) framed as a question-and-answer manual for the new practitioner. It introduces the formula \"sudden awakening followed by gradual cultivation\" (頓悟漸修) that became the doctrinal signature of the Korean Jogye order. Read today as the first text any Korean Seon student studies.",
    translator: "Robert E. Buswell Jr.",
    edition: "The Korean Approach to Zen: The Collected Works of Chinul, Univ. of Hawaii 1983",
    licenseStatus: "fair_use",
    sourceId: "src_jinul_susimkyol",
    locator: "Susimkyŏl, full text",
    excerpt:
      "The Susimkyŏl, by Pojo Chinul, is the foundational primer of Korean Seon, expounding sudden awakening followed by gradual cultivation.",
  },
  {
    slug: "excerpts-from-dharma-collection",
    authorSlug: "jinul",
    collection: "Beopjip Byeorhaengnok Jeoryo",
    era: "Goryeo",
    attributionStatus: "verified",
    title: "Excerpts from the Dharma Collection and Special Practice Record",
    originalTitle: "法集別行錄節要",
    description:
      "Chinul's substantial commentary on Zongmi's Chan-doctrinal compendium, the longest of his works. It systematises the relationship between Hwaŏm philosophy and Seon practice, defending kanhwa (kōan) practice in the lineage of Dahui while preserving the Korean integration of doctrinal study with meditative cultivation.",
    translator: "Robert E. Buswell Jr.",
    edition: "Tracing Back the Radiance: Chinul's Korean Way of Zen, Univ. of Hawaii 1991",
    licenseStatus: "fair_use",
    sourceId: "src_princeton_dict_buddhism",
    locator: "Entry: Chinul",
    excerpt:
      "Chinul's Pŏpchip pyŏrhaengnok chŏryo systematises the relationship between Hwaŏm doctrine and Seon practice and remains the longest of his extant works.",
  },
  // ─── Seosan (Korean Seon, Joseon) ────────────────────────────────────────
  {
    slug: "mirror-of-seon",
    authorSlug: "seosan-hyujeong",
    collection: "Seonga Gwigam",
    era: "Joseon",
    attributionStatus: "verified",
    title: "Sŏn'ga Kwigam (Mirror of Seon)",
    originalTitle: "禪家龜鑑",
    description:
      "Seosan Hyujeong's 1564 anthology — short passages drawn from sūtras and Chan masters and stitched together with his own commentary — designed as a complete Seon training manual for monks during the Joseon suppression. It is the most-read Korean Buddhist primer of the early-modern period and shaped the curriculum of the Jogye order down to the present.",
    translator: "Boep Joeng (modern Korean), various English partials",
    edition: "Sŏn'ga kwigam (1564); modern bilingual editions widely available",
    licenseStatus: "fair_use",
    sourceId: "src_seosan_mirror_of_seon",
    locator: "Seosan, Sŏn'ga kwigam",
    excerpt:
      "The Sŏn'ga kwigam (Mirror of Seon) is Seosan Hyujeong's 1564 training manual, the standard primer of Korean Seon Buddhism in the Joseon era.",
  },
  // ─── Thích Nhất Hạnh (Vietnamese Thiền, modern) ──────────────────────────
  {
    slug: "miracle-of-mindfulness",
    authorSlug: "thich-nhat-hanh",
    collection: null,
    era: "Modern",
    attributionStatus: "verified",
    title: "The Miracle of Mindfulness",
    description:
      "Originally a long letter (1974) from Thích Nhất Hạnh to Brother Quang of the School of Youth for Social Service in Saigon, written during the Vietnam War. Translated by Mobi Ho and published by Beacon Press in 1975, it became the seminal English-language introduction to mindfulness practice — its descriptions of washing dishes, drinking tea, and walking shaped the secular mindfulness movement that followed.",
    translator: "Mobi Ho",
    edition: "Beacon Press, 1975 (revised 1987)",
    licenseStatus: "fair_use",
    sourceId: "src_plumvillage_books",
    locator: "Plum Village — Books index",
    excerpt:
      "The Miracle of Mindfulness, Thich Nhat Hanh's first widely-translated work, originated as a 1974 manual for Vietnamese social workers and became the principal Western introduction to engaged mindfulness practice.",
  },
  {
    slug: "zen-keys",
    authorSlug: "thich-nhat-hanh",
    collection: null,
    era: "Modern",
    attributionStatus: "verified",
    title: "Zen Keys: A Guide to Zen Practice",
    description:
      "Thích Nhất Hạnh's 1973 introduction to Vietnamese Thiền, originally published in French as Clés pour le Zen. Distinct from his later mindfulness writings, it situates his teaching in the lineage of Linji and the Trúc Lâm tradition, and remains his clearest book-length account of kōan practice as a Mahāyāna inheritance.",
    translator: "Albert Low & Jean Low",
    edition: "Anchor Press / Doubleday, 1974",
    licenseStatus: "fair_use",
    sourceId: "src_plumvillage_books",
    locator: "Plum Village — Books index",
    excerpt:
      "Zen Keys is Thich Nhat Hanh's introduction to Vietnamese Thiền, situating his teaching within the lineage of Linji and the Trúc Lâm tradition.",
  },
];
