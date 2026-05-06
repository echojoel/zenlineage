/**
 * Taizan Maezumi's full transmission neighborhood — his three teachers who
 * authorize his triple-transmission claim (Soto / Rinzai / Sanbo-Zen), and
 * the twelve White Plum dharma heirs through whom Maezumi's line became
 * the most widely-distributed single-master cluster in American Zen.
 *
 * Structured data file consumed by scripts/seed-maezumi-lineage.ts. Dates
 * and affiliations are drawn from the White Plum Asanga's canonical
 * founder page (whiteplum.org/founder/) and the Zen Center of Los Angeles
 * founder history (Water Wheel). Where dates are less well-publicized, the
 * entry uses precision="unknown"/confidence="low" rather than inventing a
 * year — the accuracy audit will flag these as honest gaps.
 */

import type { KVMaster, KVSource } from "./korean-vietnamese-masters";

export const MAEZUMI_SOURCES: KVSource[] = [
  {
    id: "src_whiteplum",
    type: "website",
    title: "White Plum Asanga — Founder and Dharma Heirs",
    author: "White Plum Asanga",
    url: "https://whiteplum.org/founder/",
    publicationDate: "2025",
    reliability: "authoritative",
  },
];

// Each entry anchors its biographical claims to either the White Plum
// founder page, the ZCLA Water Wheel founder history (already in the DB
// as src_zcla_maezumi_founders), or both.

export const MAEZUMI_MASTERS: KVMaster[] = [
  // ─── Teachers who authorize Maezumi's triple lineage ─────────────────
  {
    slug: "baian-hakujun-kuroda",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Baian Hakujun Kuroda" },
      { locale: "en", nameType: "alias", value: "Hakujun Kuroda" },
      { locale: "ja", nameType: "dharma", value: "黒田白雲" },
    ],
    birthYear: 1898,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1978,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Baian Hakujun Kuroda (黒田白雲, 1898–1978) was a leading mid-twentieth-century Sōtō priest, abbot of Kōshin-ji / Kirigaya-ji in Tokyo and of his family temple in Ōtawara, Tochigi, and the father and Sōtō dharma transmitter of Hakuyū Taizan Maezumi. Within Western Zen he is most often encountered as the 'Hakujun' of 'Baian Hakujun Daiosho,' the dharma name from which the White Plum Asanga (白梅花) — the lineage federation of Maezumi's twelve American heirs — takes its identity.\n\nKuroda was a working Sōtōshū abbot of the type that anchors mainstream Japanese Sōtō: he raised his family in the precincts of his own temple, sent his sons through both academic study and Sōji-ji training, and in due course transmitted his temple succession to one of them. Maezumi was born in his father's temple in Ōtawara in 1931, and after monastic training at Sōji-ji 'received shihō from his father in 1955, a standard procedure in the Soto-sect, where local temple-propriety is inherited from father to son.' That Sōtō transmission from Hakujun Kuroda — alongside Maezumi's later Rinzai inka from Koryū Osaka and his Harada-Yasutani inka from Hakuun Yasutani — is the formal Sōtō credential the entire White Plum line carries.\n\nHakujun Kuroda was thus the bridge between the Japanese Sōtōshū establishment and the new American Sōtō scene that would emerge through his son: where Maezumi's other two teachers were themselves reform figures within Japanese Zen, his father represented the conventional, parish-based, ordained-priesthood mainstream of the Sōtō school. When Maezumi founded the Zen Center of Los Angeles in 1967 and began giving Dharma transmission to American students in the 1970s, he chose to name the eventual federation of his heirs after his father: 'the White Plum Asanga was named after Maezumi's father Baian Hakujun Dai-osho.' The name (baika, 'plum blossom') evokes the Sōtō motif of the plum that flowers in cold — an allusion both to Dōgen's Plum Blossoms fascicle of the Shōbōgenzō and to Hakujun's own dharma name — and frames the American lineage explicitly as a continuation of Hakujun's Sōtō line, not as a break from it. Hakujun Kuroda died in 1978; his other Zen-priest sons, including Kōjun Kuroda and Junyū Kuroda, continued the family's Sōtō temple work in Japan, while his son Taizan carried his dharma name forward as the founding ancestor of the American White Plum.",
    citations: [
      { sourceId: "src_zcla_maezumi_founders", fieldName: "biography", pageOrSection: "ZCLA — Maezumi Roshi biography materials (Hakujun Kuroda)" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "White Plum Asanga — named after Maezumi's father Baian Hakujun Dai-osho" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Hakuyu Taizan Maezumi (Sōtō shihō from his father in 1955)" },
    ],
    transmissions: [],
  },
  {
    slug: "osaka-koryu",
    schoolSlug: "rinzai",
    names: [
      { locale: "en", nameType: "dharma", value: "Osaka Koryu" },
      { locale: "en", nameType: "alias", value: "Koryu Osaka Roshi" },
      { locale: "ja", nameType: "dharma", value: "大阪広隆" },
    ],
    birthYear: 1901,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 1985,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Kōryū Osaka (1901–1985), born Kōryū Matsumoto and later adopted into the Osaka family, was a Japanese lay Zen teacher in the Rinzai koan tradition and one of the three transmitters in the unusual triple-lineage of Taizan Maezumi Roshi, founder of the Zen Center of Los Angeles. From the 1930s onwards he directed the Hannya Dōjō (般若道場) in Tokyo — a lay zazen training hall founded by his own teacher Mushō Jōkō Roshi (1884–1949), a Shingon priest who had completed Rinzai koan study and who established the Shakyamuni-kai as a lay Rinzai community based at Hannya Dōjō with a mountain training centre, Hannya Fuji Dōjō, on Mt. Fuji. Jōkō Roshi instructed Kōryū never to take ordination, and Kōryū honoured that injunction throughout his life, becoming a leading figure in twentieth-century Japanese lay Rinzai practice.\n\nFrom the late 1960s Kōryū Roshi began travelling to Los Angeles for roughly three months each year at Maezumi's invitation, teaching the Rinzai koan system at the Zen Center of Los Angeles alongside Maezumi's own Sōtō and Sanbō Kyōdan training. The White Plum Asanga, the Maezumi-line lineage organisation, identifies him as one of three masters from whom Maezumi received final authorisation: Dharma transmission in the Sōtō line from his father Hakujun Kuroda Roshi (1955), Inka Shōmei in the Inzan-Rinzai line from Hakuun Yasutani Roshi (1970), and Inka Shōmei in the Takujū-Rinzai line from Kōryū Roshi (1973) — making Maezumi 'one of very few teachers to receive Inka in both the Inzan and Takuju Rinzai lineages, as well as Dharma Transmission in the Soto lineage'.\n\nKōryū Roshi's distinctive emphasis was uncompromising lay practice: he held that householders could pursue the full Rinzai koan curriculum to its conclusion without monastic ordination, and his Hannya-Dōjō community modelled this for decades. His American students at ZCLA included Maezumi himself, Robert Aitken (later of the Honolulu Diamond Sangha), Philip Kapleau, and Peter Matthiessen at various stages, so his teaching reached the English-language Zen world well before Maezumi's inka was widely known. He left no institutional Western successor lineage in his own name; his enduring influence in the West runs through Maezumi Roshi and the White Plum Asanga, where his Rinzai koan training gave the Sōtō-rooted ZCLA curriculum a working koan system. Detailed English-language documentation of his published writings is sparse — most of his teaching circulated as oral instruction at Hannya Dōjō and as transcribed dharma talks distributed within the Shakyamuni-kai.",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Koryū Osaka" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "Maezumi Roshi's three lineages — Takuju Rinzai inka 1973" },
      { sourceId: "src_zcla_maezumi_founders", fieldName: "teachers", pageOrSection: "ZCLA — Founders / Maezumi Roshi's teachers" },
    ],
    transmissions: [],
  },

  // ─── The twelve White Plum dharma heirs ───────────────────────────────
  // Ordered roughly by date of transmission; heirs who went on to found
  // major practice centers are given fuller biographies because their
  // historical footprint is larger.

  {
    slug: "bernie-tetsugen-glassman",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Bernie Tetsugen Glassman" },
      { locale: "en", nameType: "alias", value: "Bernie Glassman" },
      { locale: "en", nameType: "alias", value: "Tetsugen Bernard Glassman" },
      { locale: "ja", nameType: "alias", value: "哲玄" },
    ],
    birthYear: 1939,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2018,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Bernie Tetsugen Glassman (哲玄, January 18, 1939 – November 4, 2018) was born in Brighton Beach, Brooklyn, the son of Jewish immigrants from Eastern Europe. He took an engineering degree from Brooklyn Polytechnic Institute and a Ph.D. in applied mathematics from UCLA, and worked as an aeronautical engineer at McDonnell-Douglas — including on an early Mars-mission feasibility study — before turning fully to Zen. He had first encountered Zen in 1958 through Huston Smith's *The Religions of Man*, and in Los Angeles in the late 1960s he became one of the founding students of Taizan Maezumi at the Zen Center of Los Angeles. He received dharma transmission from Maezumi in 1976 as Maezumi's first American heir, and in 1979 he and his teacher informally conceived the White Plum Asanga that would gather Maezumi's later successors.\n\nIn 1980 Glassman moved east and founded the Zen Community of New York in Riverdale, then in Yonkers, where he set out to build what he called a Greyston Mandala — an interlocking set of social enterprises rooted in Zen practice. Greyston Bakery, opened in 1982, adopted an open-hiring policy that eventually supplied brownies to Ben & Jerry's; the Greyston Foundation followed in 1989 and grew to operate permanent supportive housing, an HIV/AIDS services arm, child-care, and job-training programs for residents of southwest Yonkers. In 1996, with his second wife Sandra Jishu Holmes, Glassman founded the Zen Peacemaker Order, which he later restructured as Zen Peacemakers International. The order is organised around three tenets — not-knowing, bearing witness to the joy and suffering of the world, and taking action that arises from not-knowing and bearing witness — enacted through street retreats among the homeless and the long-running Bearing Witness Retreat at the Auschwitz-Birkenau memorial.\n\nGlassman's books frame the contemplative ground of that engaged work. *Instructions to the Cook: A Zen Master's Lessons in Living a Life That Matters* (with Rick Fields, Bell Tower, 1996) reads Dōgen's *Tenzo Kyōkun* as a manual for social entrepreneurship; *Bearing Witness: A Zen Master's Lessons in Making Peace* (Bell Tower, 1998) sets out the three-tenet method through the Auschwitz retreats; *Infinite Circle: Teachings in Zen* (Shambhala, 2002) collects his commentaries on the Heart Sutra, the Identity of Relative and Absolute, and the bodhisattva precepts; *The Dude and the Zen Master* (Blue Rider, 2013), co-written with Jeff Bridges, became his most widely read title. He gave dharma transmission to a substantial succession that includes Eve Marko, Pat Enkyo O'Hara, Wendy Egyoku Nakao, Paco Lugovina, and Roshi Joan Halifax (parallel to her transmission from Thich Nhat Hanh), all of whom carry Zen Peacemakers' engaged-practice emphasis. Glassman died on November 4, 2018, in Springfield, Massachusetts, from complications of a stroke he had suffered two years earlier.",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Bernie Glassman" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "First American dharma heir of Maezumi (1976); co-conceiver of White Plum Asanga" },
      { sourceId: "src_zcla_maezumi_founders", fieldName: "teachers", pageOrSection: "ZCLA — Founders" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "First of Maezumi's American dharma heirs; transmission in 1976.",
      },
    ],
  },
  {
    slug: "charlotte-joko-beck",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Charlotte Joko Beck" },
      { locale: "en", nameType: "alias", value: "Joko Beck" },
      { locale: "ja", nameType: "alias", value: "常湖" },
    ],
    birthYear: 1917,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2011,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Charlotte Joko Beck (常湖, 27 March 1917 – 15 June 2011) was an American Zen teacher whose blunt, psychologically literate style produced one of the first distinctly Western Zen schools. Born in New Jersey, she trained as a classical pianist at the Oberlin Conservatory of Music, married, raised four children, and supported herself in turn as a piano teacher, secretary, and university department assistant before encountering Zen in her forties. She began practice with Hakuyu Taizan Maezumi at the Zen Center of Los Angeles, with additional study under Hakuun Yasutani and Soen Nakagawa, and received dharma transmission from Maezumi in 1978.\n\nDisturbed by the conduct scandals around Maezumi at ZCLA, Beck broke with Maezumi over his actions and in 1983 moved to California to lead what became the Zen Center of San Diego, which she headed until July 2006. In 1995, together with three of her dharma heirs, she founded the Ordinary Mind Zen School, formally separating her lineage from Maezumi's White Plum Asanga and giving her teaching its institutional home. Her two best-known books — *Everyday Zen: Love and Work* (HarperCollins, 1989) and *Nothing Special: Living Zen* (HarperCollins, 1993) — became foundational texts of late-twentieth-century American lay Zen; a posthumous collection, *Ordinary Wonder: Zen Life and Practice* (Shambhala Publications, 2021), was edited from her recorded talks.\n\nBeck's distinctive emphasis was the integration of Zen with contemporary psychology: she insisted that practice meant staying with the felt texture of ordinary life — anger, fear, intimate relationship, work — rather than retreating into transcendence, attracting students interested in the relationship between Zen and modern psychology. She authorized nine dharma heirs over her career, among them Ezra Bayda, Elizabeth Hamilton, and Diane Rizzetto; transmissions to Bayda and Hamilton were rescinded in 2006, and Gary Nafstad was announced as her final dharma successor in 2010.",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Charlotte Joko Beck" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "Maezumi heirs / Ordinary Mind Zen School split (1995)" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission from Maezumi; later established Ordinary Mind School independently.",
      },
    ],
  },
  {
    slug: "dennis-genpo-merzel",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Dennis Genpo Merzel" },
      { locale: "en", nameType: "alias", value: "Genpo Roshi" },
      { locale: "ja", nameType: "alias", value: "玄峰" },
    ],
    birthYear: 1944,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Dennis Paul Merzel (born 3 June 1944 in Brooklyn, New York), known by his Japanese dharma name Genpo (玄峰), is an American Sōtō / Sanbō-Kyōdan-influenced Zen teacher and one of the most prominent — and most controversial — of the twelve dharma successors of Hakuyū Taizan Maezumi Roshi. He grew up in Long Beach, California, and earned a master's degree in educational administration from the University of Southern California before turning to Zen practice. He met Maezumi at the Zen Center of Los Angeles in 1972, was ordained as an unsui (novice priest) in 1973, and in 1980 received dharma transmission, becoming Maezumi's second formal heir. He was a co-founder of the White Plum Asanga, the lineage organisation Maezumi created to gather his American successors, and after Tetsugen Bernard Glassman he served as its second president.\n\nIn 1984 Merzel founded the Kanzeon Sangha, an international network with its main centre eventually established in Salt Lake City, Utah (later renamed Big Heart Zen Sangha), and he led affiliated groups across the United States and Europe — particularly in the Netherlands, Germany, Poland, and France. His published books include *The Eye Never Sleeps: Striking to the Heart of Zen* (Shambhala, 1991), *Beyond Sanity and Madness: The Way of Zen Master Dōgen* (Tuttle, 1994), *24/7 Dharma* (Journey Editions, 2001), and *Big Mind, Big Heart: Finding Your Way* (Big Mind Publishing, 2007). Beginning in 1999 he developed the *Big Mind Process*, a hybrid of traditional kōan introspection with the Voice Dialogue method of Hal and Sidra Stone — a technique he marketed as a faster route to 'the experience commonly called enlightenment' and which became the signature, and most contested, feature of his teaching career. Over four decades he gave dharma transmission to roughly two dozen successors and inka (full teaching authorisation) to fifteen, seeding an extensive sub-lineage of his own.\n\nIn February 2011, after publicly admitting to a series of extramarital sexual relationships with students, Merzel announced he would disrobe as a Buddhist priest, resign as an elder of the White Plum Asanga, and step down from leadership of Kanzeon — a decision welcomed in an open letter signed by sixty-six American Buddhist teachers calling for him to stop teaching altogether. He subsequently reversed course, returning to teaching under the rebranded Big Heart Zen banner, and the White Plum Asanga formally separated itself from him; the episode remains one of the most extensively documented teacher-misconduct cases in American Zen and is regularly cited in subsequent literature on Buddhist ethics and institutional accountability.",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Dennis Genpo Merzel" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "Maezumi's second American dharma successor (1980); 2011 separation" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission 1980.",
      },
    ],
  },
  {
    slug: "john-daido-loori",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "John Daido Loori" },
      { locale: "en", nameType: "alias", value: "Daido Roshi" },
      { locale: "ja", nameType: "alias", value: "大道" },
    ],
    birthYear: 1931,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2009,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "John Daido Loori (大道, 14 June 1931 – 9 October 2009) was born in Jersey City, New Jersey, into an Italian-American Catholic family. He served in the United States Navy from 1947 to 1952, afterwards studied at Rutgers, and worked for two decades as a research chemist in the food industry; throughout that period he pursued serious black-and-white photography, eventually studying with Minor White, whose Zen-influenced approach to seeing strongly shaped Loori's later teaching on art practice. He began formal Zen practice in 1972 under the Rinzai master Soen Nakagawa Roshi at the New York Zendo Shoboji, then trained intensively in California with Taizan Maezumi at the Zen Center of Los Angeles. Maezumi ordained him as a Zen priest in 1983 and gave him Sōtō dharma transmission in 1986; he later received Rinzai inka in the Soen Nakagawa line in 1997, making him a holder of both major Japanese streams.\n\nIn 1980 Loori took possession of a former Catholic and Lutheran retreat property on 230 wooded acres along the Esopus Creek in Mt. Tremper, New York, and founded Zen Mountain Monastery, which became the head temple of the Mountains and Rivers Order he established the same year. The MRO's training matrix is the Eight Gates of Zen: zazen, study with a teacher, Buddhist study, liturgy, right action, art practice, body practice, and work practice — a structure designed, in Loori's words, to ensure that 'spiritual practice must move off the cushion' and to give equal dignity to formal sitting, the Zen arts, and engaged daily life. He also founded Dharma Communications, the order's not-for-profit publishing and media arm, which produces the quarterly *Mountain Record* and the books, audio, and film through which his teaching reached a wide audience.\n\nLoori's published works are unusually extensive for an American Zen teacher. They include *The Eight Gates of Zen: A Program of Zen Training* (Dharma Communications, 1992; Shambhala expanded edition, 2002), *The Heart of Being: Moral and Ethical Teachings of Zen Buddhism* (Tuttle, 1996), *Two Arrows Meeting in Mid-Air: The Zen Koan* (Tuttle, 1994), *Invoking Reality: The Moral and Ethical Teachings of Zen* (Shambhala, 2007), *Sitting with Koans* (Wisdom, 2006), *The Zen of Creativity: Cultivating Your Artistic Life* (Ballantine, 2004), *Riding the Ox Home: Stages on the Path of Enlightenment* (Shambhala, 2002), *Cave of Tigers: The Living Zen Practice of Dharma Combat* (Dharma Communications, 2008), the photographic monograph *Making Love with Light* (Dharma Communications, 2000), and his edition of Keizan's koan collection *The True Dharma Eye: Zen Master Dōgen's Three Hundred Koans* (Shambhala, 2005), translated with Kazuaki Tanahashi. He gave dharma transmission to Bonnie Myotai Treace (1996), Geoffrey Shugen Arnold (1997), and Konrad Ryushin Marchaj (2009); Shugen Arnold succeeded him as abbot of Zen Mountain Monastery and head of the Mountains and Rivers Order. Loori died of lung cancer at Zen Mountain Monastery on October 9, 2009.",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — John Daido Loori" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "Mountains and Rivers Order — Eight Gates of Training" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "Maezumi's twelve dharma heirs" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission c. 1986; also received inka from Tetsugen Glassman.",
      },
    ],
  },
  {
    slug: "jan-chozen-bays",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Jan Chozen Bays" },
      { locale: "en", nameType: "alias", value: "Chozen Bays Roshi" },
      { locale: "ja", nameType: "alias", value: "長善" },
    ],
    birthYear: 1945,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Jan Chozen Bays (長善, born 9 August 1945 in Chicago, Illinois) is an American Sōtō Zen teacher, pediatrician, and author — one of the twelve dharma heirs of Hakuyū Taizan Maezumi Roshi and the second woman to whom he gave transmission. By professional training a physician specialising in paediatrics, Bays spent much of her medical career as one of the United States' leading clinical experts on the medical evaluation of child abuse, conducting examinations of thousands of abused and murdered children and serving as an expert witness in court proceedings throughout the 1980s and 1990s — a body of work that continues to shape both her ethical voice as a teacher and her insistence on Zen as a practice of 'showing up' for suffering bodies in the actual world.\n\nShe began Zen practice in San Diego in the early 1970s and in 1977 moved to the Zen Center of Los Angeles, where she trained intensively under Maezumi Roshi until his death in 1995. Maezumi gave her dharma transmission in 1983, making her his fourth dharma successor and one of the earliest American women authorised to teach in the Sōtō tradition. From 1985 she taught at the Zen Community of Oregon in Portland together with her husband Laren Hōgen Bays — also a Maezumi-line teacher — and in 2002 the two of them co-founded Great Vow Zen Monastery in Clatskanie, Oregon, on the wooded hills above the Columbia River, today one of the most active residential Sōtō training monasteries on the West Coast and a centre for long-form sesshin, monastic ango, and a Jizō practice associated with mourning and child-loss that Bays is particularly known for.\n\nHer published works occupy an unusual middle ground between formal Zen teaching and contemporary mind-body health writing, and have given her a much wider readership than most American Sōtō teachers. They include *Jizo Bodhisattva: Guardian of Children, Travelers, and Other Voyagers* (Shambhala, 2003), *Mindful Eating: A Guide to Rediscovering a Healthy and Joyful Relationship with Food* (Shambhala, 2009), and *Mindfulness on the Go: Simple Meditation Practices You Can Do Anywhere* (Shambhala, 2014); *Mindful Eating* in particular helped to seed an entire clinical literature on mindfulness-based approaches to disordered eating. Her teaching emphasis — disciplined zazen and kōan practice, a strong monastic curriculum at Great Vow, and the explicit translation of Zen attention into the care of bodies, food, children, and the dying — represents a distinctive integration of Maezumi's lineage with the lived ethics of a paediatrician's career.",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Jan Chozen Bays" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "Maezumi's fourth dharma heir (1983); second woman to receive transmission from him" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission c. 1983.",
      },
    ],
  },
  {
    slug: "gerry-shishin-wick",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Gerry Shishin Wick" },
      { locale: "en", nameType: "alias", value: "Shishin Wick Roshi" },
      { locale: "ja", nameType: "alias", value: "支芯" },
    ],
    birthYear: 1943,
    birthPrecision: "circa",
    birthConfidence: "medium",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Gerry Shishin Wick (支芯, born 1943) is an American Sōtō Zen teacher, scientist, and author, and one of the twelve formal dharma heirs of Hakuyū Taizan Maezumi Roshi. Trained as a physicist, Wick earned a Ph.D. in physics from the University of California, Berkeley, and worked for years as a research oceanographer before devoting himself full-time to Zen — an unusual scientific pedigree that continues to colour his teaching style and his interest in the dialogue between Zen and the natural sciences. He undertook some twenty-four years of monastic and lay training under three Japanese teachers — Shunryū Suzuki Roshi at the San Francisco Zen Center, Sōchū Suzuki Roshi at Ryūtaku-ji in Mishima, and finally Maezumi Roshi at the Zen Center of Los Angeles — before receiving both dharma transmission (shihō) and the precept transmission (denkai) from Maezumi in 1990. He was acknowledged as a roshi by the White Plum Asanga in 2000 and served as the organisation's president from 2007 to 2014, a period in which the Asanga was working through the institutional aftermath of the Merzel affair.\n\nIn 1996, Wick founded the Great Mountain Zen Center, a residential training community on the Colorado Front Range at Berthoud, where he and his dharma heir and partner Ilia Shinko Perez Roshi have led zazen, sesshin, and kōan study for nearly three decades. His most enduring contribution, however, is textual. With his elder dharma brother John Daido Loori he produced a complete English translation and commentary on the Shōyōroku — the thirteenth-century Sōtō kōan collection compiled by Hongzhi Zhengjue and Wansong Xingxiu — published as *The Book of Equanimity: Illuminating Classic Zen Koans* (Wisdom Publications, 2005). Together with the Hekiganroku and Mumonkan it is one of the three classical kōan anthologies of the Chan/Zen tradition, and Wick's edition has become one of the standard English working texts for both Sanbō-Kyōdan-style and Sōtō kōan curricula in the West.\n\nAlongside the Shōyōroku, Wick co-authored *The Great Heart Way: How to Heal Your Life and Find Self-Fulfillment* with Ilia Shinko Perez (Wisdom Publications, 2006), which presents a method developed at Great Mountain for working with what they call 'hidden emotional pain' inside the framework of Zen practice — a distinctive synthesis of kōan introspection and contemporary psychotherapeutic insight. Within the broader Maezumi lineage Wick is known for a quietly rigorous, scholarship-inflected style: he holds Maezumi's transmission of both the kōan curriculum and the precept lineage, has trained successors of his own through Great Mountain, and is regularly cited as one of the senior figures of the post-Maezumi White Plum generation.",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "en.wikipedia.org — Gerry Shishin Wick" },
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "Maezumi's twelve dharma heirs / Great Mountain Zen Center" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
        notes: "Dharma transmission 1990.",
      },
    ],
  },
  {
    slug: "nicolee-jikyo-mccann",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Nicolee Jikyo McCann" },
      { locale: "en", nameType: "alias", value: "Jikyo Roshi" },
      { locale: "ja", nameType: "alias", value: "慈鏡" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Nicolee Jikyo McCann (慈鏡) is a White Plum dharma heir of Taizan Maezumi teaching in Southern California. She served as a senior teacher in the Maezumi line for many years and continues teaching in the White Plum tradition.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "william-nyogen-yeo",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "William Nyogen Yeo" },
      { locale: "en", nameType: "alias", value: "Nyogen Yeo Roshi" },
      { locale: "ja", nameType: "alias", value: "如幻" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "William Nyogen Yeo (如幻) is a White Plum dharma heir of Taizan Maezumi. Long associated with Zenshuji Soto Mission in Los Angeles, he has taught in the Maezumi line since his dharma transmission and continues as a senior teacher.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "susan-myoyu-andersen",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Susan Myoyu Andersen" },
      { locale: "ja", nameType: "alias", value: "妙裕" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: 2020,
    deathPrecision: "circa",
    deathConfidence: "medium",
    biography:
      "Susan Myoyu Andersen (妙裕) was a White Plum dharma heir of Taizan Maezumi who served for many years at the Zen Center of Los Angeles. She is remembered for steady teaching in the residential sangha during and after Maezumi's lifetime.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "john-tesshin-sanderson",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "John Tesshin Sanderson" },
      { locale: "ja", nameType: "alias", value: "徹心" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "John Tesshin Sanderson (徹心) is a White Plum dharma heir of Taizan Maezumi, one of the twelve senior students Maezumi authorized before his death in 1995.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "alfred-jitsudo-ancheta",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Alfred Jitsudo Ancheta" },
      { locale: "ja", nameType: "alias", value: "実道" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Alfred Jitsudo Ancheta (実道) is a White Plum dharma heir of Taizan Maezumi, authorized among the cohort of senior students who received transmission before Maezumi's death. He teaches in Southern California in the Maezumi line.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
  {
    slug: "anne-seisen-saunders",
    schoolSlug: "white-plum-asanga",
    names: [
      { locale: "en", nameType: "dharma", value: "Anne Seisen Saunders" },
      { locale: "en", nameType: "alias", value: "Seisen Saunders Roshi" },
      { locale: "ja", nameType: "alias", value: "正泉" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Anne Seisen Saunders (正泉) is a White Plum dharma heir of Taizan Maezumi and abbot of Sweetwater Zen Center in National City, California, which she founded as a residential training community. She continues to teach actively in the Maezumi line.",
    citations: [
      { sourceId: "src_whiteplum", fieldName: "biography", pageOrSection: "founder" },
    ],
    transmissions: [
      {
        teacherSlug: "taizan-maezumi",
        type: "primary",
        isPrimary: true,
        sourceIds: ["src_whiteplum"],
      },
    ],
  },
];

/**
 * Transmissions INTO Maezumi that we need to add (the Soto and Sanbo-Zen
 * branches of his triple lineage — the Rinzai branch we add via Osaka
 * Koryu above, whose slug is defined in the masters list).
 *
 * These run as a post-pass after Kuroda and Koryu have been seeded.
 */
export const MAEZUMI_INCOMING_TRANSMISSIONS: Array<{
  studentSlug: string;
  teacherSlug: string;
  type: "primary" | "secondary" | "dharma";
  isPrimary: boolean;
  notes: string;
  sourceIds: string[];
}> = [
  {
    studentSlug: "taizan-maezumi",
    teacherSlug: "baian-hakujun-kuroda",
    type: "primary",
    isPrimary: true,
    notes:
      "Primary Soto dharma transmission from his father, the abbot of Koshin-ji.",
    sourceIds: ["src_whiteplum", "src_zcla_maezumi_founders"],
  },
  {
    studentSlug: "taizan-maezumi",
    teacherSlug: "osaka-koryu",
    type: "dharma",
    isPrimary: false,
    notes: "Rinzai inka from lay master Osaka Koryu.",
    sourceIds: ["src_whiteplum"],
  },
  {
    studentSlug: "taizan-maezumi",
    teacherSlug: "yamada-koun",
    type: "dharma",
    isPrimary: false,
    notes: "Sanbo-Zen inka; the third of Maezumi's three dharma authorizations.",
    sourceIds: ["src_whiteplum"],
  },
];
