// ─── Timeline editorial data ──────────────────────────────────────────
// Curated narrative content for the scrollytelling timeline.
// Masters and schools are referenced as { label, slug? } mentions.
// Slugs are resolved against the DB at render time; if absent or
// unresolved, the label renders as plain text.

export interface BibliographyEntry {
  key: string;
  author: string;
  title: string;
  year: number;
}

export interface EventCitation {
  key: string;
  pages?: string;
}

export interface Mention {
  label: string;
  slug?: string;
}

export interface TimelineEvent {
  id: string;
  yearStart: number;
  yearEnd?: number;
  precision: "exact" | "circa" | "century";
  title: string;
  description: string;
  masters: Mention[];
  schools: Mention[];
  citations: EventCitation[];
}

export interface TimelineEra {
  id: string;
  title: string;
  subtitle: string;
  yearStart: number;
  yearEnd: number;
  introduction: string;
  events: TimelineEvent[];
  citations: EventCitation[];
}

// ─── Shared bibliography ──────────────────────────────────────────────

export const BIBLIOGRAPHY: Record<string, BibliographyEntry> = {
  "dumoulin-china": {
    key: "dumoulin-china",
    author: "Dumoulin, Heinrich",
    title: "Zen Buddhism: A History — India and China",
    year: 2005,
  },
  "dumoulin-japan": {
    key: "dumoulin-japan",
    author: "Dumoulin, Heinrich",
    title: "Zen Buddhism: A History — Japan",
    year: 2005,
  },
  mcrae: {
    key: "mcrae",
    author: "McRae, John R.",
    title: "Seeing Through Zen",
    year: 2003,
  },
  broughton: {
    key: "broughton",
    author: "Broughton, Jeffrey L.",
    title: "The Bodhidharma Anthology",
    year: 1999,
  },
  yampolsky: {
    key: "yampolsky",
    author: "Yampolsky, Philip B.",
    title: "The Platform Sutra of the Sixth Patriarch",
    year: 1967,
  },
  poceski: {
    key: "poceski",
    author: "Poceski, Mario",
    title: "Ordinary Mind as the Way: The Hongzhou School and the Growth of Chan Buddhism",
    year: 2007,
  },
  welter: {
    key: "welter",
    author: "Welter, Albert",
    title: "The Linji Lu and the Creation of Chan Orthodoxy",
    year: 2008,
  },
  leighton: {
    key: "leighton",
    author: "Leighton, Taigen Dan",
    title: "Zen's Chinese Heritage: The Masters and Their Teachings",
    year: 2000,
  },
  cleary: {
    key: "cleary",
    author: "Cleary, Thomas & J.C. Cleary",
    title: "The Blue Cliff Record",
    year: 1977,
  },
  aitken: {
    key: "aitken",
    author: "Aitken, Robert",
    title: "The Gateless Barrier: The Wu-Men Kuan",
    year: 1991,
  },
  faure: {
    key: "faure",
    author: "Faure, Bernard",
    title: "The Rhetoric of Immediacy",
    year: 1991,
  },
  gregory: {
    key: "gregory",
    author: "Gregory, Peter N.",
    title: "Sudden and Gradual: Approaches to Enlightenment in Chinese Thought",
    year: 1987,
  },
  mohr: {
    key: "mohr",
    author: "Mohr, Michel",
    title: "Hakuin's Daruma: Negotiating Zen, Art and Iconography",
    year: 2000,
  },
  dogen: {
    key: "dogen",
    author: "Dōgen Zenji (ed. Tanahashi)",
    title: "Treasury of the True Dharma Eye: Shōbōgenzō",
    year: 2010,
  },
  chadwick: {
    key: "chadwick",
    author: "Chadwick, David",
    title: "Crooked Cucumber: The Life and Zen Teaching of Shunryu Suzuki",
    year: 1999,
  },
  sharf: {
    key: "sharf",
    author: "Sharf, Robert H.",
    title: "The Zen of Japanese Nationalism",
    year: 1995,
  },
  addiss: {
    key: "addiss",
    author: "Addiss, Stephen",
    title: "The Art of Zen",
    year: 1989,
  },
  "de-coulon": {
    key: "de-coulon",
    author: "de Coulon, Jacques",
    title: "Maître Deshimaru: Biographie",
    year: 2009,
  },
  "red-pine": {
    key: "red-pine",
    author: "Red Pine (Bill Porter)",
    title: "The Heart Sutra: The Womb of Buddhas",
    year: 2004,
  },
  "suzuki-beginner": {
    key: "suzuki-beginner",
    author: "Suzuki, Shunryū (ed. Dixon)",
    title: "Zen Mind, Beginner's Mind",
    year: 1970,
  },
};

// ─── Era content ──────────────────────────────────────────────────────

export const TIMELINE_ERAS: TimelineEra[] = [
  // ── Era 1: Indian Origins ───────────────────────────────────────────
  {
    id: "indian-origins",
    title: "Indian Origins",
    subtitle: "c. 500 BCE – 500 CE",
    yearStart: -500,
    yearEnd: 500,
    introduction:
      "The Zen tradition traces its lineage to Shakyamuni Buddha and the wordless transmission to Mahakashyapa — a founding narrative that, while largely legendary, established the principle of mind-to-mind awakening outside scripture. Through twenty-eight Indian patriarchs the dharma moved westward, culminating in Bodhidharma's crossing to China.",
    citations: [
      { key: "dumoulin-china", pages: "pp. 7–29" },
      { key: "mcrae", pages: "pp. 1–21" },
    ],
    events: [
      {
        id: "flower-sermon",
        yearStart: -500,
        precision: "circa",
        title: "The Flower Sermon",
        description:
          "According to tradition, the Buddha held up a flower before the assembled monks on Vulture Peak. Only Mahakashyapa smiled, receiving the wordless transmission that would define Zen's core claim: a direct pointing to the mind, beyond words and letters. While historically unverifiable, this narrative became the foundational myth of Chan lineage.",
        masters: [
          { label: "Shakyamuni Buddha", slug: "shakyamuni-buddha" },
          { label: "Mahakashyapa", slug: "mahakashyapa" },
        ],
        schools: [{ label: "Indian Patriarchs", slug: "indian-patriarchs" }],
        citations: [
          { key: "dumoulin-china", pages: "pp. 8–12" },
          { key: "mcrae", pages: "pp. 2–4" },
        ],
      },
      {
        id: "nagarjuna",
        yearStart: 150,
        precision: "circa",
        title: "Nagarjuna and the Madhyamaka",
        description:
          "Nagarjuna, counted as the fourteenth Indian patriarch, articulated the philosophy of emptiness (śūnyatā) that would profoundly shape Chan thought. His Madhyamaka dialectic — that neither existence nor non-existence can be ultimately affirmed — provided the intellectual foundation for Zen's insistence on transcending conceptual dualities.",
        masters: [{ label: "Nagarjuna", slug: "nagarjuna" }],
        schools: [{ label: "Indian Patriarchs", slug: "indian-patriarchs" }],
        citations: [
          { key: "dumoulin-china", pages: "pp. 38–48" },
          { key: "red-pine", pages: "pp. 23–35" },
        ],
      },
      {
        id: "bodhidharma-journey",
        yearStart: 480,
        yearEnd: 520,
        precision: "circa",
        title: "Bodhidharma's Journey East",
        description:
          "The twenty-eighth Indian patriarch departed for China, carrying the meditation lineage across the sea. Tradition places his arrival at Canton around 520 CE, though earlier sources suggest he may have been active in China from the late fifth century. His journey marks the legendary bridge between Indian dhyana and Chinese Chan.",
        masters: [{ label: "Bodhidharma", slug: "puti-damo" }],
        schools: [
          { label: "Indian Patriarchs", slug: "indian-patriarchs" },
          { label: "Early Chan", slug: "early-chan" },
        ],
        citations: [
          { key: "broughton", pages: "pp. 1–8" },
          { key: "dumoulin-china", pages: "pp. 85–94" },
        ],
      },
    ],
  },

  // ── Era 2: Arrival in China ─────────────────────────────────────────
  {
    id: "arrival-china",
    title: "Arrival in China",
    subtitle: "c. 520 – 700 CE",
    yearStart: 520,
    yearEnd: 700,
    introduction:
      "Bodhidharma's arrival initiated the transformation of Indian meditation practice into something distinctly Chinese. The early patriarchs — Huike, Sengcan, and their successors — synthesized Buddhist meditation with indigenous Daoist sensibility, laying the groundwork for a tradition that would eventually sweep East Asia. The pivotal figure of Huineng, the illiterate woodcutter who became the Sixth Patriarch, crystallized the movement's radical emphasis on sudden awakening.",
    citations: [
      { key: "broughton", pages: "pp. 1–54" },
      { key: "yampolsky", pages: "pp. 1–58" },
    ],
    events: [
      {
        id: "bodhidharma-wall",
        yearStart: 520,
        precision: "circa",
        title: "Wall-Gazing at Shaolin",
        description:
          "Bodhidharma reportedly spent nine years facing a wall at Shaolin monastery, embodying the practice of 'wall-gazing' (biguan). This austere image — the foreign monk sitting immovably — became an icon of Chan determination. The earliest sources, particularly the Two Entrances and Four Practices, present his teaching as 'entering by principle' through the realization that all beings share one true nature.",
        masters: [{ label: "Bodhidharma", slug: "puti-damo" }],
        schools: [{ label: "Early Chan", slug: "early-chan" }],
        citations: [
          { key: "broughton", pages: "pp. 8–21" },
          { key: "dumoulin-china", pages: "pp. 89–101" },
        ],
      },
      {
        id: "huike-transmission",
        yearStart: 528,
        precision: "circa",
        title: "Huike Receives the Dharma",
        description:
          "Huike, who according to legend severed his own arm to demonstrate his resolve, became Bodhidharma's dharma heir and the Second Patriarch of Chan. He carried the teaching forward through decades of obscurity, transmitting to Sengcan. These early patriarchs lived outside the established Buddhist institutions, practicing in small, itinerant communities.",
        masters: [
          { label: "Bodhidharma", slug: "puti-damo" },
          { label: "Huike", slug: "dazu-huike" },
          { label: "Sengcan", slug: "jianzhi-sengcan" },
        ],
        schools: [{ label: "Early Chan", slug: "early-chan" }],
        citations: [
          { key: "dumoulin-china", pages: "pp. 101–109" },
          { key: "mcrae", pages: "pp. 24–31" },
        ],
      },
      {
        id: "platform-sutra",
        yearStart: 677,
        precision: "circa",
        title: "Huineng and the Platform Sutra",
        description:
          "The Platform Sutra recounts how Huineng, an illiterate southerner, won the robe and bowl of the Fifth Patriarch over the learned Shenxiu. Whether historically accurate or not, the text crystallized Chan's defining claim: that awakening is sudden, immediate, and available to all regardless of learning or status. It became the only Chinese Buddhist text honored as a 'sutra.'",
        masters: [{ label: "Huineng", slug: "dajian-huineng" }],
        schools: [{ label: "Early Chan", slug: "early-chan" }],
        citations: [
          { key: "yampolsky", pages: "pp. 89–180" },
          { key: "mcrae", pages: "pp. 58–72" },
        ],
      },
      {
        id: "southern-northern",
        yearStart: 690,
        yearEnd: 730,
        precision: "circa",
        title: "The Southern–Northern Controversy",
        description:
          "The rivalry between the 'sudden enlightenment' school of Huineng and the 'gradual cultivation' school of Shenxiu shaped Chan's self-understanding for centuries. In reality, as McRae demonstrates, this was less a doctrinal dispute than a competition for imperial patronage and lineage authority. The 'southern' faction ultimately prevailed, establishing the model of sudden awakening that all subsequent Chan schools would claim.",
        masters: [{ label: "Huineng", slug: "dajian-huineng" }],
        schools: [{ label: "Chan", slug: "chan" }],
        citations: [
          { key: "mcrae", pages: "pp. 58–76" },
          { key: "gregory", pages: "pp. 1–35" },
        ],
      },
    ],
  },

  // ── Era 3: Tang Dynasty Golden Age ──────────────────────────────────
  {
    id: "tang-golden-age",
    title: "Tang Dynasty Golden Age",
    subtitle: "700 – 907 CE",
    yearStart: 700,
    yearEnd: 907,
    introduction:
      "Under the Tang, Chan exploded into a creative ferment unmatched in Buddhist history. From the Hongzhou school of Mazu Daoyi emerged the characteristic methods of shouting, striking, and paradoxical dialogue that define the tradition's popular image. Baizhang codified monastic rules, Linji and Dongshan founded the lineages that persist today, and Chan survived the catastrophic Huichang suppression of 845 — emerging as the dominant form of Chinese Buddhism precisely because it depended less on scriptural libraries and institutional wealth than other schools.",
    citations: [
      { key: "poceski", pages: "pp. 1–32" },
      { key: "dumoulin-china", pages: "pp. 152–293" },
    ],
    events: [
      {
        id: "mazu-hongzhou",
        yearStart: 750,
        precision: "circa",
        title: "Mazu and the Hongzhou School",
        description:
          "Mazu Daoyi transformed Chan from a meditation-centered practice into a dynamic engagement with daily life. His teaching that 'ordinary mind is the Way' (pingchang xin shi dao) liberated practice from formal sitting, while his use of shouts, blows, and seemingly irrational responses created the encounter-dialogue style. His community in Hongzhou trained over a hundred dharma heirs, making him the most influential figure in Tang Chan.",
        masters: [
          { label: "Mazu Daoyi", slug: "mazu-daoyi" },
          { label: "Nanyue Huairang", slug: "nanyue-huairang" },
        ],
        schools: [{ label: "Nanyue Line", slug: "nanyue-line" }],
        citations: [
          { key: "poceski", pages: "pp. 45–87" },
          { key: "leighton", pages: "pp. 147–158" },
        ],
      },
      {
        id: "baizhang-monastic",
        yearStart: 780,
        precision: "circa",
        title: "Baizhang's Monastic Code",
        description:
          "Baizhang Huaihai, Mazu's foremost student, established the first distinctively Chan monastic regulations. His famous principle, 'A day without work is a day without eating,' embedded manual labor into the contemplative life and gave Chan monasteries economic self-sufficiency. Though the historical 'pure rules' attributed to him may be a later compilation, his institutional vision shaped every Chan and Zen monastery that followed.",
        masters: [{ label: "Baizhang Huaihai", slug: "baizhang-huaihai" }],
        schools: [{ label: "Chan", slug: "chan" }],
        citations: [
          { key: "poceski", pages: "pp. 88–112" },
          { key: "dumoulin-china", pages: "pp. 169–176" },
        ],
      },
      {
        id: "linji-school",
        yearStart: 850,
        precision: "circa",
        title: "Linji Yixuan and the Linji School",
        description:
          "Linji Yixuan's ferocious teaching style — punctuated by shouts and blows — crystallized into the school that would become the most widespread Chan lineage. His recorded sayings, the Linji Lu, contain the famous 'four shouts,' the injunction to 'kill the Buddha,' and a radical insistence on the 'true person of no rank' within each practitioner. The Linji school later transmitted to Japan as Rinzai.",
        masters: [{ label: "Linji Yixuan", slug: "linji-yixuan" }],
        schools: [{ label: "Linji", slug: "linji" }],
        citations: [
          { key: "welter", pages: "pp. 1–45" },
          { key: "dumoulin-china", pages: "pp. 185–200" },
        ],
      },
      {
        id: "dongshan-caodong",
        yearStart: 860,
        precision: "circa",
        title: "Dongshan Liangjie and the Caodong School",
        description:
          "Dongshan Liangjie articulated the Five Ranks — a subtle dialectic of absolute and relative — and founded the Caodong lineage. Where Linji emphasized dynamic encounter, Caodong cultivated 'silent illumination' (mozhao), a mode of just sitting that required neither koan nor confrontation. This contemplative approach would later transmit to Japan as Soto Zen through Dōgen.",
        masters: [{ label: "Dongshan Liangjie", slug: "dongshan-liangjie" }],
        schools: [{ label: "Caodong", slug: "caodong" }],
        citations: [
          { key: "leighton", pages: "pp. 203–214" },
          { key: "dumoulin-china", pages: "pp. 213–223" },
        ],
      },
      {
        id: "five-houses",
        yearStart: 850,
        yearEnd: 950,
        precision: "circa",
        title: "The Five Houses of Chan",
        description:
          "Between the late Tang and early Song, Chan organized itself into five 'houses' or lineages: Linji, Caodong, Yunmen, Fayan, and Guiyang. Each developed distinctive teaching styles — Yunmen's single-word barriers, Guiyang's use of symbolic circles, Fayan's intellectual rigor. Of these, Linji and Caodong proved the most enduring, eventually absorbing the other three.",
        masters: [
          { label: "Yunmen Wenyan", slug: "yunmen-wenyan" },
          { label: "Guishan Lingyou", slug: "guishan-lingyou" },
          { label: "Fayan Wenyi", slug: "fayan-wenyi" },
        ],
        schools: [
          { label: "Yunmen", slug: "yunmen" },
          { label: "Guiyang", slug: "guiyang" },
          { label: "Linji", slug: "linji" },
          { label: "Caodong", slug: "caodong" },
        ],
        citations: [
          { key: "dumoulin-china", pages: "pp. 196–268" },
          { key: "leighton", pages: "pp. 180–260" },
        ],
      },
      {
        id: "huichang-persecution",
        yearStart: 845,
        precision: "exact",
        title: "The Huichang Suppression",
        description:
          "Emperor Wuzong's persecution of Buddhism destroyed thousands of monasteries and forced hundreds of thousands of monks and nuns to return to lay life. The text-dependent schools suffered most severely; Chan, with its emphasis on direct experience over scriptural study, survived and emerged as the dominant Buddhist tradition in China. The destruction paradoxically accelerated Chan's rise to cultural preeminence.",
        masters: [],
        schools: [{ label: "Chan", slug: "chan" }],
        citations: [{ key: "dumoulin-china", pages: "pp. 177–183" }],
      },
    ],
  },

  // ── Era 4: Song Dynasty Maturation ──────────────────────────────────
  {
    id: "song-maturation",
    title: "Song Dynasty Maturation",
    subtitle: "960 – 1279 CE",
    yearStart: 960,
    yearEnd: 1279,
    introduction:
      "The Song dynasty was Chan's age of literary and institutional maturation. The great koan collections — the Blue Cliff Record and the Gateless Gate — systematized the wild encounters of Tang masters into a structured curriculum. A fierce methodological debate emerged between Dahui Zonggao's 'koan introspection' (kanhua chan) and Hongzhi Zhengjue's 'silent illumination' (mozhao chan), a creative tension that continues to animate Zen practice today.",
    citations: [
      { key: "dumoulin-china", pages: "pp. 244–323" },
      { key: "cleary", pages: "pp. ix–xxiv" },
    ],
    events: [
      {
        id: "blue-cliff-record",
        yearStart: 1125,
        precision: "circa",
        title: "The Blue Cliff Record",
        description:
          "Yuanwu Keqin compiled his master Xuedou Chongxian's verse comments on one hundred koans into the Biyan Lu (Blue Cliff Record), the most celebrated anthology in Chan literature. Its layered structure — case, verse, commentary, and capping phrases — created a literary form of extraordinary depth that simultaneously preserved the spontaneity of encounter dialogue and made it available for systematic study.",
        masters: [
          { label: "Yuanwu Keqin", slug: "yuanwu-keqin" },
          { label: "Xuedou Chongxian", slug: "xuedou-chongxian" },
        ],
        schools: [{ label: "Linji", slug: "linji" }],
        citations: [
          { key: "cleary", pages: "pp. ix–xxiv" },
          { key: "dumoulin-china", pages: "pp. 252–261" },
        ],
      },
      {
        id: "gateless-gate",
        yearStart: 1228,
        precision: "exact",
        title: "The Gateless Gate",
        description:
          "Wumen Huikai compiled forty-eight koans with pithy commentaries and verse into the Wumenguan (Gateless Gate). More compact and accessible than the Blue Cliff Record, it became the most widely used koan collection in both Chinese and Japanese Zen. Its opening case — Zhaozhou's 'Mu' — remains the first koan assigned to countless practitioners.",
        masters: [{ label: "Wumen Huikai", slug: "wumen-huikai" }],
        schools: [{ label: "Linji", slug: "linji" }],
        citations: [
          { key: "aitken", pages: "pp. 1–12" },
          { key: "dumoulin-china", pages: "pp. 245–252" },
        ],
      },
      {
        id: "dahui-hongzhi",
        yearStart: 1130,
        yearEnd: 1160,
        precision: "circa",
        title: "Dahui vs Hongzhi: Koan and Silent Illumination",
        description:
          "The creative tension between Dahui Zonggao's 'keyword Chan' (kanhua chan) and Hongzhi Zhengjue's 'silent illumination' (mozhao chan) defined Song-era practice. Dahui championed intensive concentration on a koan's critical phrase; Hongzhi taught objectless sitting in luminous awareness. Despite their polemical exchanges, the two masters were personal friends — and their methodological dialogue continues to structure the Rinzai–Soto distinction.",
        masters: [
          { label: "Dahui Zonggao", slug: "dahui-zonggao" },
          { label: "Hongzhi Zhengjue", slug: "hongzhi-zhengjue" },
        ],
        schools: [
          { label: "Linji", slug: "linji" },
          { label: "Caodong", slug: "caodong" },
        ],
        citations: [
          { key: "dumoulin-china", pages: "pp. 267–283" },
          { key: "leighton", pages: "pp. 297–310" },
        ],
      },
      {
        id: "chan-dominance",
        yearStart: 1100,
        precision: "circa",
        title: "Chan Becomes China's Dominant Buddhism",
        description:
          "By the Northern Song, virtually all Chinese Buddhist monasteries operated under Chan institutional frameworks. The government's official monastery classification system recognized Chan as the leading school. This dominance was partly administrative — many monasteries became 'Chan' by designation rather than practice — but it reflected Chan's successful synthesis of meditation, literary culture, and monastic economy.",
        masters: [],
        schools: [{ label: "Chan", slug: "chan" }],
        citations: [
          { key: "mcrae", pages: "pp. 118–127" },
          { key: "welter", pages: "pp. 60–85" },
        ],
      },
    ],
  },

  // ── Era 5: Transmission to Japan ────────────────────────────────────
  {
    id: "transmission-japan",
    title: "Transmission to Japan",
    subtitle: "1191 – 1400 CE",
    yearStart: 1191,
    yearEnd: 1400,
    introduction:
      "Japanese monks traveling to Song China brought Chan back as 'Zen,' transplanting it into a very different cultural soil. Eisai introduced Rinzai forms with tea ceremony and Kamakura warrior patronage. Dōgen, dissatisfied with what he found in Kyoto, went to China himself and returned with a radically pure vision of 'just sitting' (shikantaza) that he elaborated in the monumental Shōbōgenzō. Keizan Jōkin then made Soto accessible to the common people, ensuring its spread throughout rural Japan.",
    citations: [
      { key: "dumoulin-japan", pages: "pp. 1–149" },
      { key: "dogen", pages: "pp. 1–24" },
    ],
    events: [
      {
        id: "eisai-rinzai",
        yearStart: 1191,
        precision: "exact",
        title: "Eisai Brings Rinzai to Japan",
        description:
          "After studying under Linji-lineage masters in China, Eisai returned to Japan and established Zen as an independent school for the first time on Japanese soil. He cultivated relationships with the Kamakura shogunate, linking Zen to warrior culture and political power. He also introduced tea cultivation, beginning the intimate connection between Zen and the Way of Tea.",
        masters: [{ label: "Eisai", slug: "senso-esai" }],
        schools: [{ label: "Rinzai", slug: "rinzai" }],
        citations: [{ key: "dumoulin-japan", pages: "pp. 9–30" }],
      },
      {
        id: "dogen-soto",
        yearStart: 1227,
        precision: "exact",
        title: "Dōgen Returns from China",
        description:
          "Dōgen Zenji returned from Song China having received dharma transmission in the Caodong lineage. He famously said he came back 'empty-handed,' having realized that practice and enlightenment are not two things. Over the next two decades he composed the Shōbōgenzō, a philosophical masterwork of extraordinary originality, and founded Eiheiji — the temple that remains Soto Zen's head monastery to this day.",
        masters: [{ label: "Dōgen Zenji", slug: "dogen" }],
        schools: [{ label: "Soto", slug: "soto" }],
        citations: [
          { key: "dumoulin-japan", pages: "pp. 51–120" },
          { key: "dogen", pages: "pp. 1–24" },
        ],
      },
      {
        id: "keizan-popularization",
        yearStart: 1300,
        precision: "circa",
        title: "Keizan Jōkin Popularizes Soto",
        description:
          "While Dōgen emphasized rigorous monastic practice, his fourth-generation successor Keizan Jōkin opened Soto Zen to a broader audience. He incorporated elements of esoteric Buddhism and folk religion, established Sōjiji (the second Soto head temple), and created an institutional framework that enabled Soto to become the largest Zen school in Japan — a position it still holds.",
        masters: [{ label: "Keizan Jōkin", slug: "keizan-jokin" }],
        schools: [{ label: "Soto", slug: "soto" }],
        citations: [{ key: "dumoulin-japan", pages: "pp. 120–140" }],
      },
      {
        id: "kamakura-patronage",
        yearStart: 1200,
        yearEnd: 1333,
        precision: "circa",
        title: "Kamakura Patronage and the Gozan System",
        description:
          "The Kamakura shogunate established the 'Five Mountains' (Gozan) system, ranking Zen monasteries in a hierarchy modeled on Song Chinese precedent. Zen monks served as cultural advisors, diplomats, and educators to the warrior elite. This period saw Zen become deeply embedded in Japanese governance, aesthetics, and the martial arts.",
        masters: [],
        schools: [
          { label: "Rinzai", slug: "rinzai" },
          { label: "Soto", slug: "soto" },
        ],
        citations: [{ key: "dumoulin-japan", pages: "pp. 137–175" }],
      },
    ],
  },

  // ── Era 6: Japanese Consolidation ───────────────────────────────────
  {
    id: "japanese-consolidation",
    title: "Japanese Consolidation",
    subtitle: "1400 – 1868 CE",
    yearStart: 1400,
    yearEnd: 1868,
    introduction:
      "After centuries of growth, Japanese Zen faced institutional stagnation. The Rinzai school had become associated with elite culture and political power but sometimes at the cost of genuine practice. It took the volcanic energy of Hakuin Ekaku in the eighteenth century to revive Rinzai through a systematized koan curriculum that remains standard today. Meanwhile, Soto expanded steadily through rural Japan under the temple-parish system of the Tokugawa era.",
    citations: [
      { key: "dumoulin-japan", pages: "pp. 175–412" },
      { key: "mohr", pages: "pp. 84–109" },
    ],
    events: [
      {
        id: "hakuin-reform",
        yearStart: 1720,
        precision: "circa",
        title: "Hakuin Ekaku's Rinzai Revival",
        description:
          "Hakuin Ekaku almost single-handedly revived the Rinzai school, systematizing koan practice into a graded curriculum that moved from initial breakthrough (kenshō) through deepening insight. His koan 'What is the sound of one hand clapping?' became iconic. He was also a prolific painter and calligrapher whose Zen art remains among the most celebrated in the tradition. Every living Rinzai lineage traces through Hakuin.",
        masters: [{ label: "Hakuin Ekaku", slug: "hakuin-ekaku" }],
        schools: [{ label: "Rinzai", slug: "rinzai" }],
        citations: [
          { key: "dumoulin-japan", pages: "pp. 366–412" },
          { key: "mohr", pages: "pp. 84–109" },
          { key: "addiss", pages: "pp. 73–91" },
        ],
      },
      {
        id: "bankei-unborn",
        yearStart: 1660,
        precision: "circa",
        title: "Bankei and the Unborn",
        description:
          "Bankei Yōtaku taught in the common language, rejecting the formality of koan study in favor of a direct appeal to the 'Unborn' (fushō) — the buddha-mind present in every being before thought arises. He attracted enormous crowds, including laypeople and women, making him one of the most popular Zen teachers of the Tokugawa period, though his lineage did not survive him.",
        masters: [{ label: "Bankei Yōtaku" }],
        schools: [{ label: "Rinzai", slug: "rinzai" }],
        citations: [{ key: "dumoulin-japan", pages: "pp. 337–365" }],
      },
      {
        id: "soto-institutional",
        yearStart: 1600,
        yearEnd: 1868,
        precision: "circa",
        title: "Soto Institutional Growth",
        description:
          "Under the Tokugawa temple-parish (danka) system, Soto Zen expanded to over fourteen thousand temples, primarily serving rural communities. Monks performed funeral rites, ancestral ceremonies, and local education. While critics later charged that this led to 'funeral Buddhism' devoid of meditation practice, the institutional network ensured Soto's survival as Japan's largest Buddhist denomination.",
        masters: [],
        schools: [{ label: "Soto", slug: "soto" }],
        citations: [{ key: "dumoulin-japan", pages: "pp. 302–335" }],
      },
    ],
  },

  // ── Era 7: Modern Encounters ────────────────────────────────────────
  {
    id: "modern-encounters",
    title: "Modern Encounters",
    subtitle: "1868 – 1970 CE",
    yearStart: 1868,
    yearEnd: 1970,
    introduction:
      "The Meiji Restoration opened Japan to the West, and Zen was among the first Buddhist traditions to cross the Pacific. D.T. Suzuki's English-language writings introduced Zen to Western intellectuals, though his presentation — emphasizing aesthetic experience and satori — was selective and sometimes misleading. The wartime period exposed troubling collaborations between Zen institutions and Japanese militarism, a reckoning that shaped post-war renewal.",
    citations: [
      { key: "sharf", pages: "pp. 107–160" },
      { key: "dumoulin-japan", pages: "pp. 413–463" },
    ],
    events: [
      {
        id: "dt-suzuki",
        yearStart: 1927,
        precision: "circa",
        title: "D.T. Suzuki and the Western Imagination",
        description:
          "D.T. Suzuki's Essays in Zen Buddhism, published from 1927 onward, introduced Zen to the English-speaking world with an emphasis on sudden enlightenment, artistic spontaneity, and freedom from convention. His work shaped the understanding of an entire generation — from Alan Watts to the Beat poets — though scholars later critiqued his romanticized, decontextualized presentation as 'Zen without Buddhism.'",
        masters: [{ label: "D.T. Suzuki" }],
        schools: [{ label: "Rinzai", slug: "rinzai" }],
        citations: [
          { key: "sharf", pages: "pp. 107–130" },
          { key: "faure", pages: "pp. 52–88" },
        ],
      },
      {
        id: "wartime-zen",
        yearStart: 1937,
        yearEnd: 1945,
        precision: "exact",
        title: "Zen and Wartime Japan",
        description:
          "During the Second World War, major Zen institutions — both Rinzai and Soto — supported Japanese militarism, framing warrior self-sacrifice in Zen terms. Prominent teachers provided spiritual legitimation for imperial expansion. The post-war reckoning with this complicity, particularly Brian Victoria's Zen at War (1997), forced the tradition to confront how non-attachment could be instrumentalized for violence.",
        masters: [],
        schools: [
          { label: "Rinzai", slug: "rinzai" },
          { label: "Soto", slug: "soto" },
        ],
        citations: [
          { key: "sharf", pages: "pp. 131–160" },
          { key: "dumoulin-japan", pages: "pp. 425–445" },
        ],
      },
      {
        id: "post-war-renewal",
        yearStart: 1945,
        yearEnd: 1962,
        precision: "circa",
        title: "Post-War Renewal",
        description:
          "The aftermath of defeat prompted deep self-examination within Japanese Zen. Reform movements emphasized lay practice, social engagement, and interfaith dialogue. Simultaneously, a new generation of teachers — many with experience of the war — began looking outward. The ground was being prepared for Zen's most consequential journey: its transmission to the West not as philosophy but as living practice.",
        masters: [],
        schools: [
          { label: "Rinzai", slug: "rinzai" },
          { label: "Soto", slug: "soto" },
        ],
        citations: [{ key: "dumoulin-japan", pages: "pp. 445–463" }],
      },
    ],
  },

  // ── Era 8: Global Zen ───────────────────────────────────────────────
  {
    id: "global-zen",
    title: "Global Zen",
    subtitle: "1962 – present",
    yearStart: 1962,
    yearEnd: 2025,
    introduction:
      "Beginning in the 1960s, Japanese masters established permanent Zen centers in the Americas and Europe, transforming Zen from an object of intellectual fascination into a practiced tradition on foreign soil. Shunryu Suzuki's San Francisco Zen Center, Taisen Deshimaru's Association Zen Internationale in Paris, and Taizan Maezumi's Zen Center of Los Angeles each represented distinct lineages adapting to Western culture while maintaining transmission integrity.",
    citations: [
      { key: "chadwick", pages: "pp. 1–42" },
      { key: "de-coulon", pages: "pp. 1–35" },
    ],
    events: [
      {
        id: "shunryu-suzuki-sf",
        yearStart: 1962,
        precision: "exact",
        title: "Shunryu Suzuki and San Francisco Zen Center",
        description:
          "Shunryu Suzuki arrived in San Francisco in 1959 to serve a Japanese-American congregation, but soon attracted American students drawn to his gentle, rigorous teaching. By 1962 the San Francisco Zen Center was established; in 1967 Tassajara became the first Zen monastery outside Asia. His Zen Mind, Beginner's Mind (1970) remains the most widely read introduction to Zen practice.",
        masters: [{ label: "Shunryu Suzuki", slug: "shunryu-suzuki" }],
        schools: [{ label: "Soto", slug: "soto" }],
        citations: [
          { key: "chadwick", pages: "pp. 193–255" },
          { key: "suzuki-beginner", pages: "pp. 21–35" },
        ],
      },
      {
        id: "deshimaru-europe",
        yearStart: 1967,
        precision: "exact",
        title: "Deshimaru Brings Zen to Europe",
        description:
          "Taisen Deshimaru traveled from Japan to Paris in 1967, initially with nothing but a zafu and his teacher Kodo Sawaki's instructions. Over the next fifteen years he founded over a hundred dojos across Europe and established the Association Zen Internationale. His direct, uncompromising teaching style and emphasis on shikantaza created the largest Zen organization in Europe.",
        masters: [{ label: "Taisen Deshimaru", slug: "taisen-deshimaru" }],
        schools: [{ label: "Soto", slug: "soto" }],
        citations: [{ key: "de-coulon", pages: "pp. 45–180" }],
      },
      {
        id: "maezumi-la",
        yearStart: 1967,
        precision: "circa",
        title: "Maezumi and the Zen Center of Los Angeles",
        description:
          "Taizan Maezumi Roshi, uniquely holding transmission in both Soto and Rinzai lineages, founded the Zen Center of Los Angeles and trained a generation of American teachers. His dharma heirs — including Bernie Glassman and Dennis Merzel — went on to establish their own centers, making Maezumi one of the most consequential figures in American Zen. His White Plum lineage continues to grow internationally.",
        masters: [{ label: "Taizan Maezumi", slug: "taizan-maezumi" }],
        schools: [
          { label: "Soto", slug: "soto" },
          { label: "Sanbo Zen", slug: "sanbo-zen" },
        ],
        citations: [{ key: "dumoulin-japan", pages: "pp. 455–463" }],
      },
      {
        id: "contemporary-adaptation",
        yearStart: 1990,
        yearEnd: 2025,
        precision: "circa",
        title: "Contemporary Adaptation",
        description:
          "Zen continues to adapt to new contexts: secular mindfulness movements draw on zazen techniques, prison dharma programs bring practice to incarcerated populations, and online sanghas extend teaching across continents. Meanwhile, scholarly research has deepened understanding of Zen's complex history, challenging romanticized narratives while revealing a tradition far richer than any simple story of 'direct transmission.' The encounter between ancient practice and modern life continues.",
        masters: [],
        schools: [
          { label: "Soto", slug: "soto" },
          { label: "Rinzai", slug: "rinzai" },
        ],
        citations: [
          { key: "mcrae", pages: "pp. 128–145" },
          { key: "faure", pages: "pp. 1–14" },
        ],
      },
    ],
  },

  // ── Era 9: This Moment ──────────────────────────────────────────────
  {
    id: "this-moment",
    title: "This Moment",
    subtitle: "Now",
    yearStart: 2026,
    yearEnd: 2026,
    introduction:
      "Twenty-five centuries of transmission have arrived at this breath. Every master in this timeline sat down once for the first time, not knowing what would come. The lineage is not behind you — it is the very act of paying attention.",
    citations: [],
    events: [
      {
        id: "your-seat",
        yearStart: 2026,
        precision: "exact",
        title: "Your Seat",
        description:
          "Zhaozhou was asked, 'What is the meaning of the patriarch's coming from the West?' He answered, 'The cypress tree in the garden.' The whole of Zen history is not a story about the past. It is an invitation to look directly at what is in front of you — right now, right here. You are not reading about the tradition. You are sitting in it.",
        masters: [],
        schools: [],
        citations: [],
      },
    ],
  },
];
