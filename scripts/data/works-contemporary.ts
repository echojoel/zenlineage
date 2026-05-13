/**
 * Contemporary masters' works — books, dharma-talk archives, meditation
 * apps, podcasts, and personal/centre websites — modelled as `WorkSeed`
 * entries so they render in the "Works" section of each master's detail
 * page alongside the canonical classical texts.
 *
 * Scope of this batch: Sanbō Zen contemporary teachers (Shukman and the
 * rest of his neighbourhood) and the three Sōtō lines flagged for
 * expansion — SFZC/Suzuki line, Deshimaru/AZI line, and Jiyu-Kennett/OBC
 * line. Authoring is restricted to masters whose slugs already exist in
 * canonical.json; figures like Norman Fischer, Edward Espe Brown, and
 * Daishin Morgan need master records before their works can land.
 *
 * Every entry's `description` is a short factual summary written for
 * this encyclopedia (no excerpts from book content). Where `excerpt`
 * appears it cites a brief institutional/publisher catalogue note
 * verified by the cited source — kept short.
 *
 * `licenseStatus: "unknown"` is used for contemporary commercial books
 * (all rights reserved by publisher) where the existing taxonomy doesn't
 * include a "copyrighted-commercial" value.
 *
 * Imported and spread into the canonical WORKS array in works.ts.
 */
import type { WorkSeed } from "./works";

export const CONTEMPORARY_WORKS: WorkSeed[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // SANBŌ ZEN — Henry Shukman
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "shukman-one-blade-of-grass",
    authorSlug: "henry-shukman",
    collection: "Spiritual memoir",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "One Blade of Grass: Finding the Old Road of the Heart, A Zen Memoir",
    description:
      "Shukman's spiritual memoir recounting his early awakening at nineteen, decades of severe eczema and depression, and the long path through Sanbō Zen training that became formal study under Joan Rieck, Rubén Habito, and Yamada Ryōun. Named a Times Literary Supplement Book of the Year on UK publication.",
    edition: "Counterpoint, 2019 (US) / Hodder & Stoughton, 2019 (UK)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Henry Shukman § Writing career",
    excerpt:
      "In 2019 Shukman published the spiritual memoir One Blade of Grass (Counterpoint / Hodder) which was a Times Literary Supplement Book of the Year.",
  },
  {
    slug: "shukman-original-love",
    authorSlug: "henry-shukman",
    collection: "Practice handbook",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Original Love: The Four Inns on the Path of Awakening",
    description:
      "Shukman's structured introduction to the Sanbō Zen path organised around four progressive stages — Mindfulness, Support, Absorption, and Awakening. Develops the curriculum behind the Original Love meditation programme he began articulating in 2021.",
    edition: "HarperOne, 9 July 2024",
    licenseStatus: "unknown",
    sourceId: "src_henryshukman_site",
    locator: "henryshukman.com — books",
  },
  {
    slug: "shukman-the-way-app",
    authorSlug: "henry-shukman",
    collection: "Meditation app",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "The Way — meditation app",
    description:
      "A subscription meditation app co-founded and led by Shukman, released in February 2024 on iOS and Android. Structured around a single curriculum that takes practitioners from breath counting through kōan introspection in the Sanbō Zen style, with a free introductory course of twelve sessions.",
    edition: "The Way, February 2024 — thewaymeditation.com",
    licenseStatus: "unknown",
    sourceId: "src_thewayapp",
    locator: "thewaymeditation.com",
  },
  {
    slug: "shukman-in-dr-nos-garden",
    authorSlug: "henry-shukman",
    collection: "Poetry",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "In Dr No's Garden",
    description:
      "Shukman's first poetry collection. Won the Jerwood Aldeburgh First Collection Prize; shortlisted for the Forward First Collection Prize; The Times and Guardian Book of the Year.",
    edition: "Jonathan Cape, 2002",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Henry Shukman § Poetry",
    excerpt:
      "In 2003 his first poetry collection, In Dr No's Garden, published by Cape, won the Jerwood Aldeburgh Poetry Prize.",
  },
  {
    slug: "shukman-archangel",
    authorSlug: "henry-shukman",
    collection: "Poetry",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Archangel",
    description:
      "A poetry collection centred on a long sequence about Anglo-Jewish men sent from Britain back to Russia in 1917 to fight in the First World War — based on research by his father, the historian Harold Shukman.",
    edition: "Jonathan Cape / Random House, 2013",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Henry Shukman § Poetry",
  },
  {
    slug: "shukman-sandstorm",
    authorSlug: "henry-shukman",
    collection: "Fiction",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Sandstorm",
    description:
      "Shukman's first novel; won the UK Authors' Club Best First Novel Award.",
    edition: "Jonathan Cape / Random House, 2005",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Henry Shukman § Fiction",
  },
  {
    slug: "shukman-the-lost-city",
    authorSlug: "henry-shukman",
    collection: "Fiction",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "The Lost City",
    description:
      "Shukman's second novel; a Guardian and Times Book of the Year, and a National Geographic Book of the Month in the US.",
    edition: "Little, Brown / Knopf, 2007",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Henry Shukman § Fiction",
  },
  {
    slug: "shukman-henryshukman-com",
    authorSlug: "henry-shukman",
    collection: "Teacher website",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "henryshukman.com — official site",
    description:
      "Shukman's personal website carrying his book list, retreat schedule, the Notes from Henry newsletter, and a media archive of podcast interviews and press features.",
    edition: "Henry Shukman, ongoing",
    licenseStatus: "unknown",
    sourceId: "src_henryshukman_site",
    locator: "henryshukman.com",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SANBŌ ZEN — Rubén Habito
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "habito-living-zen-loving-god",
    authorSlug: "ruben-habito",
    collection: "Christian-Zen practice",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Living Zen, Loving God",
    description:
      "Habito's first major statement of the Christian-Zen path as a single integrated practice rather than two parallel disciplines. Draws on his completed Sanbō Zen kōan training under Yamada Kōun and his Jesuit theological formation.",
    edition: "Wisdom Publications, 2004 (ISBN 0-86171-383-4)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Ruben Habito § Books",
  },
  {
    slug: "habito-healing-breath",
    authorSlug: "ruben-habito",
    collection: "Christian-Zen practice",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Healing Breath: Zen for Christians and Buddhists in a Wounded World",
    description:
      "A practice handbook for breath-based meditation framed through both Sanbō Zen kōan introspection and Christian contemplative theology; addresses social and ecological dimensions of practice.",
    edition: "Wisdom Publications, revised ed. 2006 (orig. Orbis 1993; ISBN 0-86171-508-X)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Ruben Habito § Books",
  },
  {
    slug: "habito-experiencing-buddhism",
    authorSlug: "ruben-habito",
    collection: "Comparative religion",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Experiencing Buddhism: Ways of Wisdom and Compassion",
    description:
      "An introductory survey of Buddhist traditions written for graduate religious-studies audiences; reflects Habito's joint career as Perkins School of Theology faculty and Sanbō Zen junshike.",
    edition: "Orbis Books, 2005",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Ruben Habito",
  },
  {
    slug: "habito-zen-spiritual-exercises",
    authorSlug: "ruben-habito",
    collection: "Christian-Zen practice",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Zen and the Spiritual Exercises: Paths of Awakening and Transformation",
    description:
      "Habito's most sustained dialogue between Sanbō Zen kōan introspection and the Ignatian Spiritual Exercises — the Jesuit retreat curriculum he himself completed before leaving the Society of Jesus in 1989.",
    edition: "Orbis Books, 2013 (ISBN 978-1-62698-046-4)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Ruben Habito § Books",
  },
  {
    slug: "habito-be-still-and-know",
    authorSlug: "ruben-habito",
    collection: "Christian-Zen practice",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Be Still and Know: Zen and the Bible",
    description:
      "A reading of selected Biblical passages through Sanbō Zen contemplative method; aimed at Christian practitioners encountering Zen practice for the first time.",
    edition: "Orbis Books, 2017 (ISBN 978-1-62698-215-4)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Ruben Habito § Books",
  },
  {
    slug: "habito-total-liberation",
    authorSlug: "ruben-habito",
    collection: "Engaged Buddhism",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Total Liberation: Zen Spirituality and the Social Dimension",
    description:
      "Habito's earliest book-length treatment of the social-ethical dimension of Sanbō Zen — bodhisattva compassion as economic, ecological, and political solidarity.",
    edition: "Wipf & Stock, 2006 (orig. Orbis Books, 1989)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Ruben Habito § Books",
  },
  {
    slug: "habito-maria-kannon-youtube",
    authorSlug: "ruben-habito",
    collection: "Dharma-talk archive",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Maria Kannon Zen Center — YouTube channel",
    description:
      "The Maria Kannon Zen Center YouTube channel (@ZenNDCity) publishes Habito's dharma talks, chanting recordings, and orientation sessions for the Dallas sangha.",
    edition: "Maria Kannon Zen Center, ongoing",
    licenseStatus: "unknown",
    sourceId: "src_maria_kannon",
    locator: "youtube.com/@ZenNDCity",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SANBŌ ZEN — Joan Rieck
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "rieck-zen-authentic-gate",
    authorSlug: "joan-rieck",
    collection: "Translation — Yamada Kōun teisho",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Zen: The Authentic Gate (Yamada Kōun) — co-translation",
    description:
      "Rieck's co-translation, with Henry Shukman, Paul Shepherd, and Migaku Sato, of Yamada Kōun's posthumously compiled introductory dharma talks — the closest thing to an authorised English-language statement of the Sanbō Zen curriculum.",
    edition: "Wisdom Publications, 2015 (ISBN 9781614292500)",
    licenseStatus: "unknown",
    sourceId: "src_sanbozen",
    locator: "Wisdom Publications — Zen: The Authentic Gate",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SANBŌ ZEN — Valerie Forstman (Mountain Cloud guiding teacher)
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "forstman-mountain-cloud-youtube",
    authorSlug: "valerie-forstman",
    collection: "Dharma-talk archive",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Mountain Cloud Zen Center — YouTube channel",
    description:
      "The Mountain Cloud Zen Center YouTube channel publishes weekly Thursday-evening dharma talks led by Forstman as Guiding Teacher, plus occasional sesshin teisho and orientation sessions.",
    edition: "Mountain Cloud Zen Center, ongoing",
    licenseStatus: "unknown",
    sourceId: "src_mountaincloud",
    locator: "youtube.com — Mountain Cloud Zen Center channel",
  },
  {
    slug: "forstman-in-the-cloud-podcast",
    authorSlug: "valerie-forstman",
    collection: "Podcast",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "In the Cloud — Mountain Cloud Zen Center podcast",
    description:
      "Weekly teisho podcast from Mountain Cloud Zen Center, hosted by Forstman with periodic Path(less) guest-conversation episodes. Distributes the centre's dharma talks beyond the Santa Fe sangha.",
    edition: "Mountain Cloud Zen Center, ongoing (Apple Podcasts + Spotify)",
    licenseStatus: "unknown",
    sourceId: "src_mountaincloud",
    locator: "podcasts.apple.com — In the Cloud",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SANBŌ ZEN — Migaku Sato
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "sato-zazen-introduction",
    authorSlug: "migaku-sato",
    collection: "Practice handbook",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "ZAZEN: Eine Einführung in Zen / An Introduction to Zen",
    description:
      "A bilingual German–English introduction to zazen practice in the Sanbō Zen lineage, drawn from Sato's teisho at the Sanbō Zendō Weyarn (Domicilium) retreat centre in Bavaria.",
    edition: "Domicilium Verlag, 2025 (236 pp.; ISBN 978-3-911539-01-2; bilingual de/en)",
    licenseStatus: "unknown",
    sourceId: "src_domicilium",
    locator: "domicilium.de — ZAZEN bilingual edition",
  },
  {
    slug: "sato-q-und-prophetie",
    authorSlug: "migaku-sato",
    collection: "New Testament scholarship",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Q und Prophetie: Studien zur Gattungs- und Traditionsgeschichte der Quelle Q",
    description:
      "Sato's University of Bern doctoral monograph on the synoptic sayings-source (Q) — a standard reference in German New Testament scholarship that pre-dates his Sanbō Zen teaching career.",
    edition: "Mohr Siebeck (WUNT II/29), in German",
    licenseStatus: "unknown",
    sourceId: "src_domicilium",
    locator: "domicilium.de — Migaku Sato Rōshi (academic profile)",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SANBŌ ZEN — Hugo Enomiya-Lassalle
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "enomiya-zen-way-to-enlightenment",
    authorSlug: "hugo-enomiya-lassalle",
    collection: "Christian-Zen pioneer text",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Zen — Way to Enlightenment",
    description:
      "The book that introduced a generation of European Catholics to Zen practice as a discipline compatible with Christian contemplation. Reflects Lassalle's training under Harada, Yasutani, and Yamada Kōun.",
    edition: "Taplinger Publishing Co., 1968",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Hugo Enomiya-Lassalle § Books",
  },
  {
    slug: "enomiya-zen-meditation-for-christians",
    authorSlug: "hugo-enomiya-lassalle",
    collection: "Christian-Zen pioneer text",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Zen Meditation for Christians",
    description:
      "The most widely-translated of Lassalle's Christian-Zen handbooks; gave practical sitting instruction within a Catholic frame at a moment when no other Western Catholic priest had completed full Sanbō Zen training.",
    edition: "Open Court, 1974 (175 pp.; ISBN 0-87548-151-7)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Hugo Enomiya-Lassalle § Books",
  },
  {
    slug: "enomiya-living-in-the-new-consciousness",
    authorSlug: "hugo-enomiya-lassalle",
    collection: "Christian-Zen pioneer text",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Living in the New Consciousness",
    description:
      "A late-career synthesis weaving Zen non-duality with Jean Gebser's structures-of-consciousness framework — the most philosophically expansive of Lassalle's English-language books.",
    edition: "Shambhala, 1988",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Hugo Enomiya-Lassalle § Books",
  },
  {
    slug: "enomiya-zen-und-christliche-mystik",
    authorSlug: "hugo-enomiya-lassalle",
    collection: "Christian-Zen pioneer text (German)",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Zen und christliche Mystik",
    description:
      "Lassalle's sustained German-language essay on the structural parallels between Zen kenshō and the apophatic strand of Catholic mystical theology (Meister Eckhart, John of the Cross).",
    edition: "Aurum / Kamphausen Verlag, 1986",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Hugo Enomiya-Lassalle § Books",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SANBŌ ZEN — Willigis Jäger
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "jager-way-to-contemplation",
    authorSlug: "willigis-jager",
    collection: "Christian contemplative",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "The Way to Contemplation: Encountering God Today",
    description:
      "Jäger's first English-language book; introduces silent contemplation as practiced at Münsterschwarzach Abbey to a Catholic readership, drawing on his Sanbō Zen training under Yamada Kōun.",
    edition: "Paulist Press, 1987",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Willigis Jäger § Books",
  },
  {
    slug: "jager-contemplation-christian-path",
    authorSlug: "willigis-jager",
    collection: "Christian contemplative",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Contemplation: A Christian Path",
    description:
      "Shorter practice handbook on silent prayer and zazen as complementary disciplines; remains widely used in German-speaking Catholic retreat programmes.",
    edition: "Liguori, 1994 (ISBN 0-89243-690-5)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Willigis Jäger § Books",
  },
  {
    slug: "jager-search-for-meaning",
    authorSlug: "willigis-jager",
    collection: "Christian contemplative",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Search for the Meaning of Life: Essays and Reflections on the Mystical Experience",
    description:
      "Essay collection mapping the contemplative life across Christian and Zen registers; the English translation of his German *Suche nach dem Sinn des Lebens*.",
    edition: "Liguori, 1995 (rev. 2003)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Willigis Jäger § Books",
  },
  {
    slug: "jager-mysticism-modern-times",
    authorSlug: "willigis-jager",
    collection: "Interview / dialogue",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Mysticism for Modern Times: Conversations with Willigis Jäger",
    description:
      "Long-form interview series with Christoph Quarch covering Jäger's break with institutional Catholic teaching authority (2002) and the founding of the Benediktushof.",
    edition: "ed. Christoph Quarch, Liguori, 2005",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Willigis Jäger § Books",
  },
  {
    slug: "jager-westoestliche-weisheit",
    authorSlug: "willigis-jager",
    collection: "German prose",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Westöstliche Weisheit: Visionen einer integralen Spiritualität",
    description:
      "Jäger's manifesto for an integral contemplative spirituality drawing on both Christian mysticism and Zen; gave the name to the West-Östliche Weisheit foundation he established in 2007.",
    edition: "Herder, 2007",
    licenseStatus: "unknown",
    sourceId: "src_west_oestliche_weisheit",
    locator: "west-oestliche-weisheit.de — Willigis Jäger Stiftung",
  },
  {
    slug: "jager-benediktushof",
    authorSlug: "willigis-jager",
    collection: "Retreat centre / institution",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Benediktushof — Centre for Meditation and Mindfulness",
    description:
      "The Holzkirchen retreat centre Jäger founded in 2003 after leaving Münsterschwarzach Abbey; the largest German-language interfaith contemplation centre. Operated as a Sanbō Zen-affiliated facility until 2009, then independently.",
    edition: "Benediktushof, Holzkirchen, founded 2003",
    licenseStatus: "unknown",
    sourceId: "src_benediktushof",
    locator: "benediktushof.de",
  },
  {
    slug: "jager-west-oestliche-weisheit",
    authorSlug: "willigis-jager",
    collection: "Foundation / archive",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "West-Östliche Weisheit Willigis Jäger Stiftung — foundation & archive",
    description:
      "The foundation Jäger established in 2007 to carry forward his teaching beyond his 2020 death; maintains the canonical archive of his written and recorded teisho and curates the Benediktushof's training programme.",
    edition: "West-Östliche Weisheit Stiftung, founded 2007",
    licenseStatus: "unknown",
    sourceId: "src_west_oestliche_weisheit",
    locator: "west-oestliche-weisheit.de",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SFZC — Shunryū Suzuki
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "suzuki-zen-mind-beginners-mind",
    authorSlug: "shunryu-suzuki",
    collection: "Dharma-talks collection",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Zen Mind, Beginner's Mind",
    description:
      "The founding text of American Sōtō Zen as a popular tradition. A collection of Suzuki Rōshi's dharma talks at the Los Altos zendo, edited by Trudy Dixon and Richard Baker after Suzuki's transcribed teisho and informal Q&A. Has remained in print continuously since 1970 and is the single most widely-read Zen book in English.",
    edition: "Weatherhill, 1970 (ISBN 0-8348-0079-9); Shambhala reissue with foreword by Huston Smith",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Zen Mind, Beginner's Mind",
  },
  {
    slug: "suzuki-branching-streams",
    authorSlug: "shunryu-suzuki",
    collection: "Dharma-talks collection",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Branching Streams Flow in the Darkness: Zen Talks on the Sandokai",
    description:
      "Suzuki's sustained 1970 lecture series on Sekitō Kisen's Sandōkai (Identity of Relative and Absolute), edited from transcript by Mel Weitsman and Michael Wenger and published posthumously.",
    edition: "University of California Press, 1999 (ISBN 0-520-21982-1)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Shunryū Suzuki § Works",
  },
  {
    slug: "suzuki-not-always-so",
    authorSlug: "shunryu-suzuki",
    collection: "Dharma-talks collection",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Not Always So: Practicing the True Spirit of Zen",
    description:
      "A second posthumous collection of Suzuki's dharma talks, edited by Edward Espe Brown, covering his later years at Tassajara and San Francisco.",
    edition: "HarperCollins, 2002 (ISBN 0-06-095754-9)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Shunryū Suzuki § Works",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SFZC — Dainin Katagiri
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "katagiri-returning-to-silence",
    authorSlug: "dainin-katagiri",
    collection: "Dharma-talks collection",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Returning to Silence: Zen Practice in Daily Life",
    description:
      "Katagiri's first published collection of dharma talks, drawn from his teaching at the Minnesota Zen Meditation Center; introduces his characteristic emphasis on the koan of ordinary daily activity.",
    edition: "Shambhala, 1988 (ISBN 0-87773-431-4)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Dainin Katagiri § Books",
  },
  {
    slug: "katagiri-you-have-to-say-something",
    authorSlug: "dainin-katagiri",
    collection: "Dharma-talks collection",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "You Have to Say Something: Manifesting Zen Insight",
    description:
      "Posthumous collection edited by Steve Hagen of Katagiri's teisho on the necessity of articulating realisation within ordinary life and language.",
    edition: "Wisdom Publications, 1998 (ISBN 1-57062-462-9)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Dainin Katagiri § Books",
  },
  {
    slug: "katagiri-each-moment-universe",
    authorSlug: "dainin-katagiri",
    collection: "Dharma-talks collection",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Each Moment Is the Universe: Zen and the Way of Being Time",
    description:
      "Posthumous collection edited by Andrea Martin focused on Katagiri's reading of Dōgen's Uji (Being-Time) and the practice of being-in-time.",
    edition: "Shambhala, 2007 (ISBN 1-59030-607-4)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Dainin Katagiri § Books",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SFZC — Reb Anderson
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "anderson-being-upright",
    authorSlug: "reb-anderson",
    collection: "Dharma teaching",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Being Upright: Zen Meditation and the Bodhisattva Precepts",
    description:
      "Anderson's most widely-used book; teaches zazen and the sixteen bodhisattva precepts as a single integrated practice — the framework of jukai ceremonies at San Francisco Zen Center.",
    edition: "Rodmell Press, 2001 (ISBN 1-93048-501-3)",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Tenshin Reb Anderson",
  },
  {
    slug: "anderson-warm-smiles-cold-mountains",
    authorSlug: "reb-anderson",
    collection: "Dharma-talks collection",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Warm Smiles from Cold Mountains: Dharma Talks on Zen Meditation",
    description:
      "A collection of Anderson's teisho on zazen at SFZC and the Green Gulch Farm Zen Center, edited by Susan Moon.",
    edition: "Rodmell Press, 2005",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Tenshin Reb Anderson",
  },
  {
    slug: "anderson-third-turning",
    authorSlug: "reb-anderson",
    collection: "Sutra commentary",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "The Third Turning of the Wheel: Wisdom of the Samdhinirmocana Sutra",
    description:
      "A teisho-based commentary on the Samdhinirmocana Sutra, the foundational Yogācāra scripture of Mahāyāna Buddhism; Anderson's most scholarly book.",
    edition: "Rodmell Press, 2012",
    licenseStatus: "unknown",
    sourceId: "src_wikipedia",
    locator: "en.wikipedia.org — Tenshin Reb Anderson",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // Deshimaru / AZI line
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "deshimaru-zen-way-to-martial-arts",
    authorSlug: "taisen-deshimaru",
    collection: "Dharma teaching",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "The Zen Way to the Martial Arts",
    description:
      "Deshimaru's most-translated book; develops the relationship between zazen, the bushidō tradition, and the somatic discipline of the Japanese martial arts. Originally published in French as *Zen et arts martiaux* (Seghers, 1977).",
    edition: "Dutton, 1982 (Eng.); Arkana / Penguin, 1991 (ISBN 0-09-151981-0)",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "zen-deshimaru.com — bibliographie",
  },
  {
    slug: "deshimaru-la-pratique-du-zen",
    authorSlug: "taisen-deshimaru",
    collection: "Dharma teaching (French)",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "La pratique du Zen",
    description:
      "The most accessible French-language introduction to zazen as taught by Deshimaru — drawn from his Paris dōjō teisho of the 1970s.",
    edition: "Albin Michel, 1981 (ISBN 2-226-01287-7)",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "zen-deshimaru.com — bibliographie",
  },
  {
    slug: "deshimaru-mushotoku-mind",
    authorSlug: "taisen-deshimaru",
    collection: "Dharma teaching",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Mushotoku Mind",
    description:
      "Posthumous English-language collection of Deshimaru's teisho on the Hokyo Zanmai, transcribed and edited by Philippe Reiryū Coupey.",
    edition: "Hohm Press, revised ed. 2012",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "zen-deshimaru.com — bibliographie",
  },
  {
    slug: "deshimaru-questions-to-zen-master",
    authorSlug: "taisen-deshimaru",
    collection: "Dharma teaching",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Questions to a Zen Master",
    description:
      "Question-and-answer format collection drawn from Deshimaru's Paris dōjō sessions; the format that most preserves his characteristic spoken voice in English translation.",
    edition: "Penguin / Arkana, 1991",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "zen-deshimaru.com — bibliographie",
  },
  {
    slug: "coupey-sit",
    authorSlug: "philippe-reiryu-coupey",
    collection: "Dharma teaching (editor)",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Sit: Zen Teachings of Master Taisen Deshimaru",
    description:
      "Coupey's compiled and edited edition of Deshimaru's English-language dharma talks — the most-used reference for the Deshimaru lineage's English-language students.",
    edition: "Hohm Press, 1996 (ISBN 0-934252-61-4)",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "zen-deshimaru.com — bibliographie",
  },
  {
    slug: "azi-zen-azi-org",
    authorSlug: "taisen-deshimaru",
    collection: "Institutional site",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Association Zen Internationale — zen-azi.org",
    description:
      "The official site of the Association Zen Internationale, the federation Deshimaru founded in Paris in 1970; carries the dōjō directory, teaching schedule, and a substantial archive of Deshimaru's teisho transcripts.",
    edition: "AZI, ongoing",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "zen-azi.org",
  },
  {
    slug: "rech-abzen-eu",
    authorSlug: "roland-rech",
    collection: "Institutional site",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Association Bouddhiste Zen d'Europe (ABZE) — abzen.eu",
    description:
      "The European Buddhist Zen Association founded by Roland Yuno Rech as the umbrella organisation for the dōjōs in his branch of the AZI federation; carries his teisho archive and the network's calendar.",
    edition: "ABZE, ongoing",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "abzen.eu",
  },
  {
    slug: "thibaut-kanshoji",
    authorSlug: "stephane-kosen-thibaut",
    collection: "Temple / institution",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Kanshōji Zen Buddhist Monastery — kanshoji.org",
    description:
      "Kanshōji, founded by Stéphane Kōsen Thibaut in 2002 in the Dordogne, the principal residential training centre of the Kōsen Sangha branch of AZI. Site carries the daily ango schedule and Kōsen-line teisho archive.",
    edition: "Kanshōji, founded 2002",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "kanshoji.org",
  },
  {
    slug: "coupey-dojo-zen-paris",
    authorSlug: "philippe-reiryu-coupey",
    collection: "Dōjō / institution",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Dōjō Zen de Paris — dojozen.fr",
    description:
      "The Paris dōjō founded by Deshimaru in 1972 at 175 rue de Tolbiac, which Coupey led from the late 1990s until his 2024 death; the historical seat of the AZI's English-language sangha.",
    edition: "Dōjō Zen de Paris, founded 1972",
    licenseStatus: "unknown",
    sourceId: "src_zen_deshimaru_history",
    locator: "dojozen.fr",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // OBC — Jiyu-Kennett
  // ═══════════════════════════════════════════════════════════════════════
  {
    slug: "kennett-selling-water-by-the-river",
    authorSlug: "jiyu-kennett",
    collection: "Dharma manual",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Selling Water by the River: A Manual of Zen Training",
    description:
      "Kennett's first major book; the foundational manual of the Order of Buddhist Contemplatives' Sōtō training. Later reissued under the title *Zen is Eternal Life* (Shasta Abbey Press) after her break with the institutional Sōtōshū.",
    edition: "Pantheon Books, 1972",
    licenseStatus: "unknown",
    sourceId: "src_obcon_founding_teachers",
    locator: "obcon.org — founding teachers / publications",
  },
  {
    slug: "kennett-roar-of-the-tigress",
    authorSlug: "jiyu-kennett",
    collection: "Dharma-talks collection",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Roar of the Tigress (Vols. I–II)",
    description:
      "Two-volume posthumous collection of Kennett's dharma talks at Shasta Abbey, transcribed and edited by her OBC successors after her 1996 death.",
    edition: "Shasta Abbey Press",
    licenseStatus: "unknown",
    sourceId: "src_obcon_founding_teachers",
    locator: "obcon.org — founding teachers / publications",
  },
  {
    slug: "kennett-how-to-grow-a-lotus-blossom",
    authorSlug: "jiyu-kennett",
    collection: "Spiritual autobiography",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "How to Grow a Lotus Blossom: Or How a Zen Buddhist Prepares for Death",
    description:
      "Kennett's account of the extended visionary experience she went through in 1976–77 during a serious illness, framed as preparation for death and a sustained meditation on Buddhist eschatology.",
    edition: "Shasta Abbey Press",
    licenseStatus: "unknown",
    sourceId: "src_obcon_founding_teachers",
    locator: "obcon.org — founding teachers / publications",
  },
  {
    slug: "obc-shasta-abbey",
    authorSlug: "jiyu-kennett",
    collection: "Institutional site",
    era: "Contemporary",
    attributionStatus: "verified",
    title: "Shasta Abbey — shastaabbey.org",
    description:
      "The Shasta Abbey monastic training centre in Mount Shasta, California, which Jiyu-Kennett founded in 1970 as the head temple of the Order of Buddhist Contemplatives; carries the abbey's training schedule and the Shasta Abbey Press catalogue.",
    edition: "Shasta Abbey / OBC, founded 1970",
    licenseStatus: "unknown",
    sourceId: "src_obcon_founding_teachers",
    locator: "shastaabbey.org",
  },
];
