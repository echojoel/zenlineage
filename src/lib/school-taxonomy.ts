import { stripDiacritics } from "./search-tokens";

export interface SchoolKeyText {
  /** English title of the text (e.g. "Shōbōgenzō"). */
  title: string;
  /** Native orthography (Japanese / Chinese / Korean / Vietnamese). */
  nativeTitle?: string;
  /** Author or compiler, if known. */
  attributedTo?: string;
  /** Short period / date context ("1231–1253", "13th c."). */
  period?: string;
  /** One- to two-sentence gloss of what the text is and why it matters. */
  description: string;
  /** Authoritative URL — prefer the school's own site (e.g. Sōtōshū),
   * then an academic/reference site (Stanford SHS, Wikipedia). */
  url?: string;
}

export interface SchoolKeyConcept {
  /** Romanized term (e.g. "Shikantaza"). */
  term: string;
  /** Native orthography (e.g. "只管打坐"). */
  nativeTerm?: string;
  /** Short gloss — translated term and meaning in context. */
  description: string;
  /** Authoritative URL; Sōtōshū / Wikipedia preferred. */
  url?: string;
}

export interface SchoolDefinition {
  slug: string;
  name: string;
  tradition: string;
  parentSlug?: string;
  aliases: string[];
  summary: string;
  practice?: string;
  /** Canonical writings of this school — Shōbōgenzō, Linji Lu, etc.
   * Rendered in a dedicated section on the school detail page. */
  keyTexts?: SchoolKeyText[];
  /** Technical terms that readers will encounter when studying the
   * school — shikantaza, hishiryō, huatou, etc. */
  keyConcepts?: SchoolKeyConcept[];
  /**
   * Additional names in non-English locales, keyed by BCP-47-ish tag
   * (`zh`, `ja`, `ko`, `vi`, etc.). Seeded into `school_names` so that
   * detail pages can surface native orthography.
   */
  nativeNames?: Record<string, string>;
}

const SCHOOL_DEFINITIONS: SchoolDefinition[] = [
  {
    slug: "indian-patriarchs",
    name: "Indian Patriarchs",
    tradition: "Zen",
    aliases: [
      "indian patriarchs",
      "indian patriarch lineage",
      "indian lineage",
      "indian patriarchs lineage",
    ],
    summary:
      "The twenty-eight Indian patriarchs form the traditional lineage from Shakyamuni Buddha to Bodhidharma, tracing the mind-to-mind transmission of awakening across roughly a thousand years of Indian Buddhism. The lineage begins with the Flower Sermon: the Buddha held up a flower before the assembly on Vulture Peak, and only Mahakashyapa smiled in understanding. This wordless exchange is regarded as the origin of the entire Chan/Zen transmission. The chain passes through major figures in Indian Buddhist history—including Nagarjuna, Ashvaghosha, and Vasubandhu—before reaching Prajnatara, who recognized Bodhidharma and sent him east to China. While modern historians question the historical accuracy of this lineage as a literal chain of teacher-student relationships, the tradition treats it as a sacred genealogy affirming that the awakening transmitted in Zen is identical to the Buddha's own realization.",
    practice:
      "The Indian patriarchs transmitted dhyana—meditative absorption rooted in the Buddha’s own practice of seated contemplation and direct mind-to-mind transmission (yixin chuanxin). Their methods encompassed the full range of early Buddhist samatha-vipassana practice as well as Mahayana prajna contemplation, from Upagupta’s rigorous Sarvastivada meditation discipline to Nagarjuna’s Madhyamaka investigation of emptiness. The lineage’s defining claim is that an awakening identical to the Buddha’s was passed wordlessly from teacher to student across twenty-eight generations, establishing the paradigm of direct transmission that became the hallmark of all Chan and Zen schools.",
    keyTexts: [
      {
        title: "Denkōroku (Transmission of the Light)",
        nativeTitle: "伝光録",
        attributedTo: "Keizan Jōkin",
        period: "1300",
        description:
          "The Sōtō tradition's own narrative of the 53 ancestors — 28 Indian patriarchs from Śākyamuni through Bodhidharma, then 23 Chinese and 2 Japanese masters to Dōgen. The canonical source for stories of the Indian lineage as the Zen tradition remembers it.",
        url: "https://en.wikipedia.org/wiki/Denk%C5%8Droku",
      },
      {
        title: "Flower Sermon",
        nativeTitle: "拈華微笑",
        attributedTo: "Śākyamuni Buddha (traditional attribution)",
        period: "case recorded Song dynasty",
        description:
          "The Buddha holds up a flower before the assembly on Vulture Peak; only Mahākāśyapa smiles. Case 6 of the Mumonkan and the foundational scene of the entire Chan/Zen mind-to-mind transmission mythology.",
        url: "https://en.wikipedia.org/wiki/Flower_Sermon",
      },
      {
        title: "Mūlamadhyamakakārikā",
        nativeTitle: "中論",
        attributedTo: "Nāgārjuna",
        period: "c. 2nd c. CE",
        description:
          "'Root Verses on the Middle Way.' Nāgārjuna, the 14th Indian patriarch in the Zen lineage, systematized the Mahayana teaching of emptiness — the philosophical ground on which all later Chan and Zen thought rests.",
        url: "https://en.wikipedia.org/wiki/M%C5%ABlamadhyamakak%C4%81rik%C4%81",
      },
    ],
    keyConcepts: [
      {
        term: "Twenty-Eight Patriarchs",
        nativeTerm: "二十八祖",
        description:
          "The canonical genealogy from Mahākāśyapa to Bodhidharma, as recorded in the Jingde-era Transmission of the Lamp (1004) and earlier Chan texts. A sacred charter rather than strict history.",
        url: "https://en.wikipedia.org/wiki/Twenty-Eight_Patriarchs",
      },
      {
        term: "Yixin chuanxin",
        nativeTerm: "以心傳心",
        description:
          "'Transmitting mind with mind.' The characteristic description of how awakening passed between the Indian ancestors — not through scripture but through a direct, silent recognition between teacher and disciple.",
        url: "https://en.wikipedia.org/wiki/Chan_Buddhism",
      },
      {
        term: "Dhyāna",
        nativeTerm: "禪",
        description:
          "The Sanskrit word from which 'Chan' and 'Zen' directly descend — meditative absorption, the sustained collected attention in which the awakening transmitted through the patriarchs is realized.",
        url: "https://en.wikipedia.org/wiki/Dhy%C4%81na_in_Buddhism",
      },
    ],
  },
  {
    slug: "chan",
    name: "Chan",
    tradition: "Chan",
    aliases: ["chan", "zen"],
    summary:
      "Chan (禪) is the Chinese Buddhist meditation tradition that emerged from the encounter between Indian Buddhism and Chinese culture, becoming the most influential school of East Asian Buddhism. The word 'Chan' derives from the Sanskrit dhyana (meditation). Chan emphasizes direct experience of awakened mind over scriptural study, formalized by the motto attributed to Bodhidharma: 'A special transmission outside the scriptures; no dependence on words and letters; directly pointing to the human mind; seeing one's nature and becoming Buddha.' During the Tang and Song dynasties, Chan developed its characteristic methods—encounter dialogues, koan practice, intensive sitting, and the teacher-student relationship as the vehicle of transmission. The tradition crystallized into the Five Houses (Caodong, Linji, Yunmen, Guiyang, and Fayan), each with distinctive teaching styles. Chan was transmitted to Korea (as Seon), Japan (as Zen), and Vietnam (as Thien), profoundly shaping the religious, artistic, and philosophical culture of East Asia.",
    practice:
      "Chan encompasses a spectrum of meditation methods unified by the commitment to direct experiential realization over doctrinal study. The foundational practice is zuochan (sitting meditation), performed in lotus or half-lotus posture with regulated breathing and upright spine, complemented by distinctive methods within each school: silent illumination (mozhao) in Caodong, keyword investigation (huatou/kanhua) in Linji, and one-word barriers in Yunmen. Encounter dialogue between teacher and student in the private interview (rushi/dokusan) serves as the primary vehicle for testing and deepening realization. Intensive group retreats (chanqi), typically lasting seven days with extended daily sitting, and the integration of manual labor (puqing) into practice, distinguish Chan's communal monastic training from other Buddhist traditions.",
    keyTexts: [
      {
        title: "Platform Sutra of the Sixth Patriarch",
        nativeTitle: "六祖壇經",
        attributedTo: "Dajian Huineng (compiled by Fahai)",
        period: "8th c.",
        description:
          "The only Chinese Buddhist text to be called a 'sutra.' Contains Huineng's autobiography, his poetry contest with Shenxiu, and the core teaching of sudden awakening. The foundational charter of mature Chan, treated by every later school as non-negotiable.",
        url: "https://en.wikipedia.org/wiki/Platform_Sutra",
      },
      {
        title: "Jingde-Era Record of the Transmission of the Lamp",
        nativeTitle: "景德傳燈錄",
        attributedTo: "Daoyuan (compiler)",
        period: "1004",
        description:
          "The first and largest of the classical Chan 'lamp records' — thirty fascicles of biographies and encounter dialogues covering 1,700 masters from the seven Buddhas of antiquity down to the early Song. The primary source for nearly every Tang-dynasty Chan story still told today.",
        url: "https://en.wikipedia.org/wiki/Transmission_of_the_Lamp",
      },
      {
        title: "Record of Linji",
        nativeTitle: "臨濟錄",
        attributedTo: "Linji Yixuan (compiled by Sansheng Huiran)",
        period: "9th c.",
        description:
          "The sayings of Linji Yixuan — 'true person of no rank,' the four shouts, the famous 'If you meet the Buddha, kill the Buddha.' The single most influential Chan yulu (recorded sayings) and the beating heart of the Linji/Rinzai tradition.",
        url: "https://en.wikipedia.org/wiki/Record_of_Linji",
      },
      {
        title: "Blue Cliff Record",
        nativeTitle: "碧巖錄",
        attributedTo: "Xuedou Chongxian (cases & verses), Yuanwu Keqin (commentary)",
        period: "1125",
        description:
          "One hundred paradigmatic koans selected by Xuedou (Yunmen school) and unpacked by Yuanwu (Linji school) — each case framed by a pointer, main story, verse, and extensive commentary. The summit of Song-dynasty Chan literature.",
        url: "https://en.wikipedia.org/wiki/Blue_Cliff_Record",
      },
      {
        title: "Gateless Barrier",
        nativeTitle: "無門關",
        attributedTo: "Wumen Huikai",
        period: "1228",
        description:
          "Forty-eight kōans — including Zhaozhou's 'Mu,' 'The flag is moving,' and 'Nansen kills the cat' — each with a brief pointing verse. Lighter and more portable than the Blue Cliff Record; the standard entry point for koan practice in every subsequent Chan/Zen school.",
        url: "https://en.wikipedia.org/wiki/The_Gateless_Barrier",
      },
    ],
    keyConcepts: [
      {
        term: "Zuochan",
        nativeTerm: "坐禪",
        description:
          "'Sitting Chan' — the foundational posture practice. Upright spine, regulated breath, eyes half-open; all Chan/Zen schools build their distinctive methods on top of zuochan rather than replacing it.",
        url: "https://en.wikipedia.org/wiki/Zazen",
      },
      {
        term: "Jianxing",
        nativeTerm: "見性",
        description:
          "'Seeing [one's] nature.' The second half of Bodhidharma's four-line motto and the explicit aim of Chan: a direct, non-conceptual apprehension that the awakened mind is one's own original face.",
        url: "https://en.wikipedia.org/wiki/Kensh%C5%8D",
      },
      {
        term: "Jiaowai biechuan",
        nativeTerm: "教外別傳",
        description:
          "'A special transmission outside the scriptures.' The signature self-description of Chan — not a rejection of sutras but a claim that the awakening they describe is transmitted mind-to-mind in encounter, not by text alone.",
        url: "https://en.wikipedia.org/wiki/Chan_Buddhism",
      },
      {
        term: "Gong'an",
        nativeTerm: "公案",
        description:
          "'Public case' (Japanese kōan, Korean kongan) — a recorded encounter or saying taken up as a live point of meditation. The characteristic Chan pedagogical instrument from the late Tang onward.",
        url: "https://en.wikipedia.org/wiki/K%C5%8Dan",
      },
      {
        term: "Five Houses",
        nativeTerm: "五家",
        description:
          "Caodong, Linji, Yunmen, Fayan, and Guiyang — the five distinct teaching lineages that crystallized in late-Tang and early-Song Chan. Each has its own signature pedagogy; together they define the classical period.",
        url: "https://en.wikipedia.org/wiki/Five_Houses_of_Chan",
      },
      {
        term: "Puqing",
        nativeTerm: "普請",
        description:
          "'Universal invitation' — the Chan monastic labor system codified by Baizhang Huaihai. 'A day without work, a day without eating': manual work in the fields and kitchens is treated as no less awakening than seated meditation.",
        url: "https://en.wikipedia.org/wiki/Baizhang_Huaihai",
      },
    ],
  },
  {
    slug: "early-chan",
    name: "Early Chan",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["early chan"],
    summary:
      "Early Chan encompasses the formative period from Bodhidharma's arrival in China (traditionally c. 520 CE) through the Sixth Patriarch Huineng and his immediate successors, before the tradition divided into distinct house lineages. This era includes the six patriarchs—Bodhidharma, Huike, Sengcan, Daoxin, Hongren, and Huineng—as well as precursor figures like Mahasattva Fu and independent lineages such as the Oxhead (Niutou) school and the Jingzhong school of Sichuan. The period's defining crisis was the Northern-Southern School controversy: Shenxiu's gradualist approach versus Huineng's sudden awakening, with Heze Shenhui's polemical advocacy eventually establishing the Southern School as orthodox. Huineng's Platform Sutra became the foundational text, and his two principal students—Qingyuan Xingsi and Nanyue Huairang—gave rise to the two great branches from which all subsequent Chan schools descend.",
    practice:
      "Early Chan practice centered on Bodhidharma’s method of ‘wall-gazing’ (biguan)—sustained seated meditation aimed at directly perceiving the mind’s nature. Daoxin and Hongren’s East Mountain teaching systematized this into communal monastic sitting, emphasizing the ‘samadhi of one practice’ (yixing sanmei) and Hongren’s ‘guarding the one’ (shouyi, 守一). The Northern School under Shenxiu taught a graduated purification of mental defilements through the contemplative method outlined in the Guanxin Lun (attributed to his school), while the Southern School championed by Huineng and Shenhui insisted on sudden recognition that mind is originally pure. The Oxhead (Niutou) school offered a third approach, emphasizing the emptiness of mind itself and the non-arising of thoughts, influenced by Madhyamaka philosophy.",
    keyTexts: [
      {
        title: "Two Entrances and Four Practices",
        nativeTitle: "二入四行論",
        attributedTo: "Bodhidharma (traditional attribution)",
        period: "6th c.",
        description:
          "The earliest text of the Chan tradition, framing practice as two entrances — the entrance by principle (liru) and the entrance by practice (xingru) — and describing four attitudes to daily life: accepting karma, adapting to conditions, seeking nothing, and according with the Dharma.",
        url: "https://en.wikipedia.org/wiki/Bodhidharma",
      },
      {
        title: "Inscription on Faith in Mind",
        nativeTitle: "信心銘",
        attributedTo: "Sengcan (traditional attribution)",
        period: "7th c.",
        description:
          "'Xinxin Ming' — a 146-line poem on the non-dual mind, traditionally credited to the Third Patriarch. Its opening ('The great way is not difficult for those who have no preferences') is among the most quoted lines in all Zen literature.",
        url: "https://en.wikipedia.org/wiki/Xinxin_Ming",
      },
      {
        title: "Platform Sutra of the Sixth Patriarch",
        nativeTitle: "六祖壇經",
        attributedTo: "Dajian Huineng (compiled by Fahai)",
        period: "8th c.",
        description:
          "The defining document of the Southern School. Huineng's autobiography, the verse contest with Shenxiu, and the sudden-awakening teaching that settled the Northern/Southern controversy and became the charter of mature Chan.",
        url: "https://en.wikipedia.org/wiki/Platform_Sutra",
      },
      {
        title: "Song of Enlightenment",
        nativeTitle: "證道歌",
        attributedTo: "Yongjia Xuanjue",
        period: "early 8th c.",
        description:
          "'Zhengdao Ge' — a lyrical summary of Southern-School awakening in 267 lines, written by Huineng's short-lived but brilliant dharma heir. Memorized in Korean and Japanese monasteries as a concise statement of Chan understanding.",
        url: "https://en.wikipedia.org/wiki/Song_of_Enlightenment",
      },
    ],
    keyConcepts: [
      {
        term: "Biguan",
        nativeTerm: "壁觀",
        description:
          "'Wall-gazing' — the meditative posture attributed to Bodhidharma during his nine-year sit at Shaolin. Paradigmatic of the unmoving, non-seeking quality of Chan zazen.",
        url: "https://en.wikipedia.org/wiki/Bodhidharma",
      },
      {
        term: "Dunwu",
        nativeTerm: "頓悟",
        description:
          "'Sudden awakening.' Huineng's and Shenhui's core claim against the Northern School: awakening is not a gradual accumulation but the recognition that mind is originally pure.",
        url: "https://en.wikipedia.org/wiki/Subitism",
      },
      {
        term: "Yixing sanmei",
        nativeTerm: "一行三昧",
        description:
          "'Samādhi of one practice' — the meditative absorption taught by Daoxin and Hongren at East Mountain: unbroken recollection of a single contemplative object until it becomes the whole field of awareness.",
        url: "https://en.wikipedia.org/wiki/East_Mountain_Teaching",
      },
      {
        term: "Shouyi",
        nativeTerm: "守一",
        description:
          "'Guarding the one' — Hongren's distilled instruction: keep awareness gathered on the mind itself, without dispersal, without grasping, until its original nature is recognized.",
        url: "https://en.wikipedia.org/wiki/Daman_Hongren",
      },
    ],
  },
  {
    slug: "qingyuan-line",
    name: "Qingyuan line",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["qingyuan line"],
    summary:
      "The Qingyuan line descends from Qingyuan Xingsi, a student of the Sixth Patriarch Huineng, and constitutes one of the two great branches of Chan. Through Qingyuan's student Shitou Xiqian—author of the Sandokai (Harmony of Difference and Equality)—this line gave rise to three of the Five Houses: the Caodong school (through Dongshan Liangjie), the Yunmen school (through Yunmen Wenyan), and the Fayan school (through Fayan Wenyi). The Qingyuan branch is broadly characterized by a more contemplative and subtle approach compared to the Nanyue line's dramatic directness, though individual masters varied widely. Key figures in the early Qingyuan line include Yaoshan Weiyan, who bridged the Shitou and Mazu traditions; Tianhuang Daowu and Longtan Chongxin, through whom the Deshan-Xuefeng lineage developed; and Chuanzi Decheng, the beloved Boat Monk. The line's emphasis on the interpenetration of the absolute and relative, expressed through Shitou's Sandokai and Dongshan's Five Ranks, became a defining contribution to Chan philosophy.",
    practice:
      "Practice in the Qingyuan line flows from Shitou Xiqian’s Sandokai, which describes the interpenetration of the absolute and relative as the ground of meditation and daily conduct. This branch tends toward subtle contemplative inquiry rather than dramatic confrontation: seated meditation, poetic and philosophical reflection, and close attention to how difference and equality appear together in ordinary experience. That orientation later flowered in the silent illumination of Caodong, the linguistic precision of Yunmen, and the more synthetic contemplative style of Fayan.",
    keyTexts: [
      {
        title: "Sandokai",
        nativeTitle: "參同契",
        attributedTo: "Shitou Xiqian",
        period: "8th c.",
        description:
          "'Harmony of Difference and Equality' — Shitou's 44-line verse on the non-duality of the one and the many. The root poem of the whole Qingyuan branch, chanted daily in Caodong/Sōtō monasteries.",
        url: "https://en.wikipedia.org/wiki/Sandokai",
      },
      {
        title: "Song of the Grass-Roof Hermitage",
        nativeTitle: "草庵歌",
        attributedTo: "Shitou Xiqian",
        period: "8th c.",
        description:
          "Shitou's long poem on the eremitic life — built a grass hut on Mount Nanyue, watched the world pass through. The template for generations of hermit Chan masters in this line.",
        url: "https://en.wikipedia.org/wiki/Shitou_Xiqian",
      },
    ],
    keyConcepts: [
      {
        term: "Absolute and relative",
        nativeTerm: "理事",
        description:
          "Shitou's diagnostic pair — li (absolute/principle) and shi (relative/phenomena). The Qingyuan line studies how these interpenetrate; Dongshan's Five Ranks and Hongzhi's silent illumination are direct developments.",
        url: "https://en.wikipedia.org/wiki/Sandokai",
      },
    ],
  },
  {
    slug: "nanyue-line",
    name: "Nanyue line",
    tradition: "Chan",
    parentSlug: "chan",
    aliases: ["nanyue line"],
    summary:
      "The Nanyue line descends from Nanyue Huairang, a student of the Sixth Patriarch Huineng, and constitutes the second of the two great branches of Chan. Through Nanyue's student Mazu Daoyi—one of the most influential Chan masters in history—this line gave rise to the Linji and Guiyang schools and profoundly shaped the character of Chinese Chan. Mazu's Hongzhou school developed the use of shouts, blows, and spontaneous gestures as teaching methods, famously declaring 'This very mind is Buddha' and 'No mind, no Buddha.' The Nanyue branch is broadly associated with dynamic, forceful, and unpredictable teaching styles. Nanyue is best remembered for his encounter with the young Mazu: seeing Mazu practicing intensive sitting meditation, Nanyue began polishing a tile nearby. When Mazu asked why, Nanyue said he was making a mirror. Mazu protested that polishing a tile cannot make a mirror, and Nanyue replied, 'How can sitting in meditation make a Buddha?' This exchange shattered Mazu's attachment to the form of practice and became one of the foundational teaching stories of Chan.",
    practice:
      "The Nanyue line, through Mazu Daoyi’s Hongzhou school, extended meditation beyond the hall into every activity of daily life. Mazu’s radical teaching that ‘this very mind is Buddha’ collapsed the distinction between formal sitting and ordinary activity. The line’s characteristic methods—shouts, blows, unexpected gestures, and paradoxical dialogue—were designed to shatter conceptual thought and trigger sudden awakening in the midst of engaged encounter.",
    keyTexts: [
      {
        title: "Record of Mazu Daoyi",
        nativeTitle: "馬祖道一禪師廣錄",
        attributedTo: "Mazu Daoyi (compiled by students)",
        period: "8th c.",
        description:
          "The yulu of the master who is the single most influential figure in Chan after Huineng — 'this very mind is Buddha,' 'no mind, no Buddha,' the polishing-a-tile encounter with Nanyue. The template for all later encounter-dialogue literature.",
        url: "https://en.wikipedia.org/wiki/Mazu_Daoyi",
      },
      {
        title: "Record of Baizhang",
        nativeTitle: "百丈廣錄",
        attributedTo: "Baizhang Huaihai (compiled by students)",
        period: "9th c.",
        description:
          "The sayings of Mazu's principal heir who codified Chan monastic life — 'Pure Rules of Baizhang' and 'A day without work, a day without eating.' Source of the Chan monastic institution all subsequent schools inherit.",
        url: "https://en.wikipedia.org/wiki/Baizhang_Huaihai",
      },
    ],
    keyConcepts: [
      {
        term: "This very mind is Buddha",
        nativeTerm: "即心即佛",
        description:
          "Mazu's signature teaching: ordinary mind, right now, with nothing added or subtracted, is buddha-mind. The philosophical heart of the Nanyue branch and of all later 'sudden' schools.",
        url: "https://en.wikipedia.org/wiki/Mazu_Daoyi",
      },
      {
        term: "Hongzhou school",
        nativeTerm: "洪州宗",
        description:
          "The name of Mazu's own teaching community at Hongzhou — used in later Chan historiography as a synonym for the 'everyday mind' style that the Nanyue branch made dominant after the mid-Tang.",
        url: "https://en.wikipedia.org/wiki/Hongzhou_school",
      },
    ],
  },
  {
    slug: "caodong",
    name: "Caodong",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["caodong", "tsaodong", "曹洞"],
    nativeNames: { zh: "曹洞宗" },
    summary:
      "The Caodong school (曹洞宗) is one of the Five Houses of Chan, founded in the ninth century by Dongshan Liangjie and his student Caoshan Benji—the school's name combines the first characters of their mountain names. Its central philosophical contribution is the Five Ranks (wuwei), a dialectical framework describing five modes of relationship between the absolute (emptiness) and the relative (form). Where the Linji school emphasized dramatic breakthrough through shouts and blows, the Caodong tradition developed a subtler approach centered on 'silent illumination' (mozhao chan)—objectless sitting in which awareness naturally illuminates itself without the pursuit of any particular experience. Hongzhi Zhengjue, the Song dynasty master at Tiantong Monastery, was the school's greatest literary voice, composing the verses for the Book of Serenity and articulating silent illumination as a formal practice. The Caodong school nearly went extinct during the Song dynasty before being revived through the extraordinary cross-lineage transmission from Dayang Jingxuan through the Linji master Fushan Fayuan to Touzi Yiqing. Through Furong Daokai and subsequent masters, the revived Caodong tradition reached Tiantong Rujing, who transmitted it to Dogen and thus to all of Japanese Soto Zen.",
    practice:
      "The Caodong school’s signature practice is silent illumination (mozhao chan), an objectless form of sitting meditation in which the practitioner rests in open, non-grasping awareness without chasing visions, insights, or altered states. Hongzhi Zhengjue described this as a luminous field in which stillness and knowing are not two different things. The school’s discipline is therefore less about forcing breakthrough than about stabilizing clear, upright presence until absolute and relative are experienced as mutually inclusive. Dongshan Liangjie’s Five Ranks complement seated practice by giving practitioners a framework for understanding how emptiness and phenomena, host and guest, silence and activity interpenetrate in lived realization.",
    keyTexts: [
      {
        title: "Book of Serenity",
        nativeTitle: "從容錄",
        attributedTo: "Hongzhi Zhengjue (cases & verses), Wansong Xingxiu (commentary)",
        period: "1223",
        description:
          "The Caodong counterpart to the Blue Cliff Record — one hundred kōans with Hongzhi's verses and Wansong's commentary. The essential Song-dynasty literary monument of the silent-illumination tradition.",
        url: "https://en.wikipedia.org/wiki/Book_of_Serenity",
      },
      {
        title: "Silent Illumination Inscription",
        nativeTitle: "默照銘",
        attributedTo: "Hongzhi Zhengjue",
        period: "12th c.",
        description:
          "'Mozhao Ming' — Hongzhi's programmatic poem on objectless sitting, answering Dahui Zonggao's polemic and articulating silent illumination as a formal meditative discipline rather than mere quietism.",
        url: "https://en.wikipedia.org/wiki/Silent_illumination",
      },
      {
        title: "Song of the Jewel Mirror Samādhi",
        nativeTitle: "寶鏡三昧歌",
        attributedTo: "Dongshan Liangjie",
        period: "9th c.",
        description:
          "'Baojing Sanmei Ge' — Dongshan's founding poem on the interpenetration of absolute and relative, chanted daily in Caodong and Sōtō monasteries as a continuous meditation on the tradition's metaphysics.",
        url: "https://en.wikipedia.org/wiki/Song_of_the_Jewel_Mirror_Samadhi",
      },
      {
        title: "Sandokai (Harmony of Difference and Equality)",
        nativeTitle: "參同契",
        attributedTo: "Shitou Xiqian",
        period: "8th c.",
        description:
          "Shitou's 44-line verse on the non-duality of the one and the many — the philosophical headwater of the Caodong/Sōtō stream. Chanted daily alongside the Jewel Mirror Samādhi.",
        url: "https://en.wikipedia.org/wiki/Sandokai",
      },
    ],
    keyConcepts: [
      {
        term: "Mozhao chan",
        nativeTerm: "默照禪",
        description:
          "'Silent illumination Chan' — Hongzhi Zhengjue's signature meditation: objectless sitting in which clarity and stillness are one undivided awareness. The doctrinal ancestor of Dōgen's shikantaza.",
        url: "https://en.wikipedia.org/wiki/Silent_illumination",
      },
      {
        term: "Five Ranks",
        nativeTerm: "五位",
        description:
          "Dongshan Liangjie's dialectical framework describing five modes of relationship between the absolute (zheng, 'upright') and the relative (pian, 'bent'). Used across later Chan and Zen as a diagnostic of where a practitioner is standing in their realization.",
        url: "https://en.wikipedia.org/wiki/Five_Ranks",
      },
      {
        term: "Host and Guest",
        nativeTerm: "主賓",
        description:
          "A paired contemplative image in Caodong texts: host = absolute / essence, guest = relative / phenomenon. Training is to hold neither exclusively but to see their reciprocal dance in every moment.",
        url: "https://en.wikipedia.org/wiki/Caodong_school",
      },
    ],
  },
  {
    slug: "soto",
    name: "Sōtō",
    tradition: "Zen",
    parentSlug: "caodong",
    aliases: ["soto", "sōtō", "soto zen", "caodong/soto", "曹洞宗"],
    nativeNames: { ja: "曹洞宗" },
    summary:
      "The Soto school (曹洞宗) is the Japanese continuation of the Chinese Caodong tradition, founded by Eihei Dogen (1200–1253) after his training with Tiantong Rujing in China. It is the largest Zen denomination in Japan. Soto's central practice is shikantaza ('just sitting')—zazen practiced as the direct expression of awakening itself, not as a means to attain enlightenment. Dogen articulated this in his masterwork the Shobogenzo—which is itself largely composed of koan commentary and philosophical inquiry—and in his practical manual the Fukanzazengi. The school's second great figure, Keizan Jokin (1264–1325), founded Sojiji Temple and made Soto practice accessible to a broad Japanese population through the integration of esoteric ritual and ancestor veneration. Together, Eiheiji (Dogen's temple) and Sojiji serve as the school's two head monasteries. In the modern era, the Soto tradition has been carried to the West by teachers including Shunryu Suzuki (San Francisco Zen Center), Taisen Deshimaru (Association Zen Internationale, Europe), Taizan Maezumi (Zen Center of Los Angeles), and Dainin Katagiri (Minnesota Zen Center), establishing vibrant practice communities across North America and Europe.",
    practice:
      "Soto Zen’s central practice is shikantaza (‘just sitting’)—zazen as the direct expression of awakening rather than a technique aimed at producing it. Dogen’s Fukanzazengi (‘Universally Recommended Instructions for Zazen’), written soon after his return from China, is not just a slogan for sitting: it is a concise manual that explains why zazen matters and how to do it. In line with Soto practice as presented by Sotoshu, it emphasizes a clean and quiet sitting place, an upright stable posture, full- or half-lotus if possible, the cosmic mudra, eyes kept open, natural breathing through the nose, and the instruction not to chase thoughts or suppress them but to let them arise and fall away while returning to posture and wakefulness. This is the practical side of Dogen’s teaching that practice and realization are one (shusho ittō). Koans are also integral to the Soto tradition—Dogen compiled the Shinji Shobogenzo (300 cases) and his Shobogenzo is largely koan commentary—but they are generally approached as expressions of realized truth rather than used as concentration devices during zazen in the Rinzai manner. Monastic life extends the same discipline into kinhin (walking meditation), oryoki (formal meals), samu (work practice), chanting, and temple ritual, so that sitting and everyday activity are treated as one continuous field of practice.",
    keyTexts: [
      {
        title: "Shōbōgenzō",
        nativeTitle: "正法眼蔵",
        attributedTo: "Eihei Dōgen",
        period: "1231–1253",
        description:
          "Dōgen’s masterwork — 95 fascicles (in the standard Honzan edition) of philosophical prose and koan commentary that is the foundational text of Japanese Sōtō. Titled ‘Treasury of the True Dharma Eye’ after the phrase used to name what the Buddha transmitted to Mahākāśyapa. Essays like Genjōkōan, Bendōwa, Uji, and Busshō articulate how practice and realization are one in moment-to-moment zazen.",
        url: "https://en.wikipedia.org/wiki/Sh%C5%8Db%C5%8Dgenz%C5%8D",
      },
      {
        title: "Fukan Zazengi",
        nativeTitle: "普勧坐禅儀",
        attributedTo: "Eihei Dōgen",
        period: "1227 (first draft)",
        description:
          "‘Universally Recommended Instructions for Zazen.’ Dōgen’s concise practical manual: how to arrange the sitting place, fold the legs, hold the cosmic mudrā, regulate the breath, and meet thoughts without pursuing or suppressing them. The Sōtō school treats it as the canonical description of how to sit zazen.",
        url: "https://global.sotozen-net.or.jp/eng/library/dogenzenji/023.html",
      },
      {
        title: "Shinji Shōbōgenzō",
        nativeTitle: "真字正法眼蔵",
        attributedTo: "Eihei Dōgen",
        period: "1235",
        description:
          "The ‘300-case Shōbōgenzō’ — Dōgen’s own compilation of 300 classical koans in Chinese, collected early in his teaching career. Evidence that koan study is integral to Sōtō, not a Rinzai monopoly; many of these cases are unpacked in the longer Kana Shōbōgenzō fascicles.",
        url: "https://en.wikipedia.org/wiki/Sh%C5%8Db%C5%8Dgenz%C5%8D",
      },
      {
        title: "Eihei Shingi",
        nativeTitle: "永平清規",
        attributedTo: "Eihei Dōgen",
        period: "1237–1249",
        description:
          "‘Eihei Pure Standards’ — Dōgen’s monastic rule for Eihei-ji, including the Tenzo Kyōkun (‘Instructions for the Cook’) and Bendōhō (procedures for the monks’ hall). Establishes the Sōtō conviction that meals, work, and ritual are themselves practice-realization.",
        url: "https://en.wikipedia.org/wiki/Eihei_Shingi",
      },
      {
        title: "Denkōroku",
        nativeTitle: "伝光録",
        attributedTo: "Keizan Jōkin",
        period: "1300 (lectures)",
        description:
          "‘Record of the Transmission of the Light’ — Keizan’s 53 chapters narrating the awakening of each ancestor from Śākyamuni through Eihei Dōgen. Alongside the Shōbōgenzō, it is the Sōtō school’s foundational teaching text; Keizan is the ‘Great Ancestor’ (Tai-so) whose Sōji-ji became the school’s second head temple.",
        url: "https://en.wikipedia.org/wiki/Denk%C5%8Droku",
      },
    ],
    keyConcepts: [
      {
        term: "Shikantaza",
        nativeTerm: "只管打坐",
        description:
          "‘Just sitting.’ Zazen practiced as the full expression of awakening itself — not a technique aimed at producing a future insight. The defining Sōtō meditation method, inherited from the Caodong master Tiantong Rujing.",
        url: "https://en.wikipedia.org/wiki/Shikantaza",
      },
      {
        term: "Hishiryō",
        nativeTerm: "非思量",
        description:
          "‘Non-thinking’ — the mental attitude of zazen as Dōgen defines it in Fukanzazengi. Neither thinking (shiryō) nor not-thinking (fushiryō), but the field in which both arise and pass. Often rendered ‘beyond thinking.’",
        url: "https://en.wikipedia.org/wiki/Hishiryo",
      },
      {
        term: "Shushō-ittō",
        nativeTerm: "修証一等",
        description:
          "‘Practice and realization are one.’ Dōgen’s central axiom: sitting zazen is not a means to some later enlightenment — it is the actualization of awakening in this very moment. The ground of shikantaza.",
        url: "https://global.sotozen-net.or.jp/eng/library/dogenzenji/023.html",
      },
      {
        term: "Genjōkōan",
        nativeTerm: "現成公案",
        description:
          "‘The kōan of manifest reality’ — the title and subject of the opening fascicle of the Shōbōgenzō. The world as it appears is already the koan; to study the self is to forget the self, and to forget the self is to be actualized by the ten-thousand things.",
        url: "https://en.wikipedia.org/wiki/Genj%C5%8Dk%C5%8Dan",
      },
      {
        term: "Uji",
        nativeTerm: "有時",
        description:
          "‘Being-time.’ The Shōbōgenzō fascicle in which Dōgen argues that time and being are the same event — every being is a time, and every time is a being. The philosophical heart of Dōgen’s treatment of impermanence.",
        url: "https://en.wikipedia.org/wiki/Uji_(Being-Time)",
      },
      {
        term: "Ikka-myōju",
        nativeTerm: "一顆明珠",
        description:
          "‘One bright pearl.’ A Shōbōgenzō fascicle (and a line from Xuansha Shibei) used by Dōgen to teach that the whole universe is one luminous jewel — an image Sōtō practitioners use to point at non-dual realization.",
        url: "https://en.wikipedia.org/wiki/Sh%C5%8Db%C5%8Dgenz%C5%8D",
      },
    ],
  },
  {
    slug: "white-plum-asanga",
    name: "White Plum Asanga",
    tradition: "Zen",
    parentSlug: "soto",
    aliases: ["white plum asanga", "white plum", "hakubai"],
    nativeNames: { ja: "白梅" },
    summary:
      "The White Plum Asanga (白梅, 'white plum blossom') is the lineage sangha of Taizan Maezumi Roshi (1931–1995) and his Dharma successors. It is not a Japanese Sōtōshū-registered sub-school but a Western Zen order that inherits Maezumi's tri-lineage authorization: Sōtō shihō from his father Baian Hakujun Kuroda, Rinzai inka from the lay teacher Kōryū Osaka, and Sanbō-Zen inka from Hakuun Yasutani. Maezumi named twelve American Dharma heirs — including Bernie Tetsugen Glassman, Charlotte Joko Beck, Dennis Genpo Merzel, John Daido Loori, Jan Chozen Bays, and Gerry Shishin Wick — and through their own transmissions the White Plum now has several hundred authorized teachers and roughly a thousand affiliated practice places worldwide. Because the order combines shikantaza with the Harada-Yasutani koan curriculum, and because it operates outside Sōtōshū registration, most White Plum heirs teach under the Asanga's own name rather than as Sōtō priests.",
    practice:
      "White Plum practice reflects Maezumi's triple authorization: shikantaza in the Sōtō sense (zazen as the direct expression of awakening) combined with a formal koan curriculum derived from Harada Daiun Sogaku and Hakuun Yasutani — beginning with the Mu koan, moving through breakthrough koans, and continuing into the Shōyōroku, Mumonkan, Denkōroku, and Hekiganroku. Formal face-to-face interview (dokusan) is central. Many White Plum centers also integrate the social-action emphasis of the Zen Peacemaker Order, which Glassman founded in 1996 within Maezumi's line.",
    keyTexts: [
      {
        title: "On Zen Practice",
        attributedTo: "Taizan Maezumi & Bernie Glassman (eds.)",
        period: "1976 / 2002 revised",
        description:
          "The foundational White Plum teaching volume — Maezumi and senior students on zazen, the kōan curriculum, ritual, and lineage. Reissued by Wisdom Publications as the canonical introduction to the Asanga's approach.",
        url: "https://wisdomexperience.org/product/on-zen-practice/",
      },
      {
        title: "The Hazy Moon of Enlightenment",
        attributedTo: "Taizan Maezumi & Bernie Glassman (eds.)",
        period: "1977 / 2007 revised",
        description:
          "Companion volume to On Zen Practice, gathering Maezumi's teachings on the Five Ranks, emptiness, and the post-awakening integration work that distinguishes the White Plum's path after initial kenshō.",
        url: "https://wisdomexperience.org/product/hazy-moon-enlightenment/",
      },
      {
        title: "Appreciate Your Life",
        attributedTo: "Taizan Maezumi (ed. Wendy Egyoku Nakao)",
        period: "2002",
        description:
          "A posthumous collection of Maezumi's talks edited by his Dharma heir Wendy Egyoku Nakao (Zen Center of Los Angeles). The clearest single volume of Maezumi's own voice.",
        url: "https://www.shambhala.com/appreciate-your-life-1499.html",
      },
    ],
    keyConcepts: [
      {
        term: "Three Tenets",
        description:
          "'Not-knowing, bearing witness, taking action' — Bernie Glassman's distillation of Maezumi's teaching into a social-action practice. The working framework of the Zen Peacemaker Order and many White Plum lineage groups.",
        url: "https://zenpeacemakers.org/three-tenets/",
      },
      {
        term: "Tri-lineage inheritance",
        description:
          "The defining White Plum inheritance: each authorized teacher carries Maezumi's Sōtō shihō (via Baian Hakujun Kuroda), Rinzai inka (via Kōryū Osaka), and Sanbō-Zen inka (via Hakuun Yasutani). Most heirs transmit only the Sōtō and Harada-Yasutani koan streams.",
        url: "https://whiteplum.org/founder/",
      },
    ],
  },
  {
    slug: "linji",
    name: "Linji",
    tradition: "Chan",
    parentSlug: "nanyue-line",
    aliases: ["linji", "臨済"],
    nativeNames: { zh: "臨濟宗" },
    summary:
      "The Linji school (臨済宗) is the most dynamic and influential of the Five Houses of Chan, founded by Linji Yixuan (d. 866) in the lineage of Mazu Daoyi through Baizhang Huaihai and Huangbo Xiyun. Linji's teaching is characterized by fierce directness—he used shouts (katsu), blows, and paradoxical exchanges to shatter students' conceptual thinking and precipitate immediate awakening. His 'True Person of No Rank' teaching and his four-fold classification of shouts became foundational for the school. During the Song dynasty, the Linji school divided into the Yangqi and Huanglong branches, with the Yangqi line eventually becoming dominant. The school produced the two greatest koan collections: the Blue Cliff Record (Yuanwu Keqin's commentary on Xuedou Chongxian's verses) and the Gateless Barrier (Wumen Huikai's forty-eight cases). Dahui Zonggao championed the huatou (keyword) method of koan practice—concentrating on a single critical phrase until all conceptual thinking is exhausted—which became the standard Linji approach. Through transmission to Japan, Korea, and Vietnam, the Linji school became the most geographically widespread form of Chan/Zen Buddhism.",
    practice:
      "The Linji school’s primary meditation method is huatou (話頭) practice, championed by Dahui Zonggao, in which the practitioner takes up a single critical phrase—such as ‘Mu’ or ‘What is this?’—and returns to it with gathering intensity until discursive mind is exhausted in great doubt. This is not mere repetition: the phrase becomes a living point of inquiry that absorbs body and mind. Practice is then tested and deepened in rushi (face-to-face encounter), where the master may respond with shouts, paradoxes, blows, or abrupt questions intended to expose whether realization is embodied or merely conceptual. Linji training therefore combines seated investigation with high-pressure personal interview aimed at discovering the ‘True Person of No Rank’ directly.",
    keyTexts: [
      {
        title: "Record of Linji",
        nativeTitle: "臨濟錄",
        attributedTo: "Linji Yixuan (compiled by Sansheng Huiran)",
        period: "9th c.",
        description:
          "The sayings of the school's founder — four shouts, the True Person of No Rank, the four processes of 'guest and host.' The single most-studied yulu in the Chan/Zen corpus; every later Linji/Rinzai teacher pivots off these pages.",
        url: "https://en.wikipedia.org/wiki/Record_of_Linji",
      },
      {
        title: "Blue Cliff Record",
        nativeTitle: "碧巖錄",
        attributedTo: "Xuedou Chongxian & Yuanwu Keqin",
        period: "1125",
        description:
          "One hundred cases with Xuedou's verses and Yuanwu's commentary, assembled at a Linji monastery. Dahui famously burned the blocks so students would meet the koans directly rather than through literary polish; the text has shaped Chan and Zen koan study ever since.",
        url: "https://en.wikipedia.org/wiki/Blue_Cliff_Record",
      },
      {
        title: "Gateless Barrier",
        nativeTitle: "無門關",
        attributedTo: "Wumen Huikai",
        period: "1228",
        description:
          "Forty-eight koans — Zhaozhou's Mu, 'The flag is moving,' 'One hand,' and more — each with a pointing verse. Compiled at a Linji monastery and the standard entry curriculum for huatou practice.",
        url: "https://en.wikipedia.org/wiki/The_Gateless_Barrier",
      },
      {
        title: "Letters of Dahui",
        nativeTitle: "大慧書",
        attributedTo: "Dahui Zonggao",
        period: "12th c.",
        description:
          "Dahui's correspondence with officials and lay practitioners in which he articulates kanhua chan (huatou practice) as the core Linji method and polemicizes against 'dead' silent illumination. The founding manifesto of koan-as-meditation.",
        url: "https://en.wikipedia.org/wiki/Dahui_Zonggao",
      },
    ],
    keyConcepts: [
      {
        term: "Huatou",
        nativeTerm: "話頭",
        description:
          "'The head of a saying' — a single critical phrase (Mu, 'What is this?', 'Who drags this corpse?') taken up as the sole object of meditation. The defining Linji method as systematized by Dahui Zonggao.",
        url: "https://en.wikipedia.org/wiki/Hua_Tou",
      },
      {
        term: "Kanhua chan",
        nativeTerm: "看話禪",
        description:
          "'Observing-the-phrase Chan' — Dahui's name for the formalized huatou method. Deliberately contrasted with Hongzhi's silent-illumination style, though modern practice increasingly unites them.",
        url: "https://en.wikipedia.org/wiki/K%C5%8Dan",
      },
      {
        term: "True Person of No Rank",
        nativeTerm: "無位真人",
        description:
          "Linji's famous pointing: 'On this lump of red flesh there is a true person of no rank, constantly going in and out of the faces of every one of you.' The invitation to recognize awakened mind as already operative in perception.",
        url: "https://en.wikipedia.org/wiki/Linji_Yixuan",
      },
      {
        term: "Great Doubt",
        nativeTerm: "大疑",
        description:
          "The intense, body-pervading questioning that the huatou is meant to produce. Later codified (especially by Hakuin) as one of the Three Essentials: great faith, great doubt, great determination.",
        url: "https://en.wikipedia.org/wiki/Hakuin_Ekaku",
      },
      {
        term: "Four Shouts",
        nativeTerm: "四喝",
        description:
          "Linji's typology of katsu: sometimes it cuts like a sword, sometimes it crouches like a lion, sometimes it probes like a pole, sometimes it does not function as a shout at all. The prototype for all later pedagogical use of shouts and blows.",
        url: "https://en.wikipedia.org/wiki/Linji_Yixuan",
      },
    ],
  },
  {
    slug: "rinzai",
    name: "Rinzai",
    tradition: "Zen",
    parentSlug: "linji",
    aliases: ["rinzai", "linji/rinzai", "臨済宗"],
    nativeNames: { ja: "臨済宗" },
    summary:
      "The Rinzai school (臨済宗) is the Japanese form of the Chinese Linji tradition, transmitted to Japan through multiple lineages during the Kamakura period (1185–1333). The school's defining figure is Hakuin Ekaku (1686–1769), who single-handedly revived and systematized Rinzai practice after a period of decline. Hakuin developed the structured koan curriculum that remains standard today—beginning with the Mu koan or the sound of one hand clapping, then progressing through increasingly subtle layers of inquiry. His emphasis on 'great doubt, great faith, great determination' as the three pillars of practice became definitive. The modern Rinzai school is organized primarily through the O-To-Kan lineage: Nanpo Jomyo (Daio Kokushi) received transmission from the Chinese master Xutang Zhiyu, transmitted to Shuho Myocho (Daito Kokushi, founder of Daitokuji), who transmitted to Kanzan Egen (founder of Myoshinji). These two temple complexes—Daitokuji and Myoshinji—and their extensive branch networks form the institutional backbone of modern Rinzai Zen. The school profoundly influenced Japanese culture, including the tea ceremony, calligraphy, ink painting, garden design, and the martial arts.",
    practice:
      "Rinzai Zen is defined by Hakuin Ekaku’s systematized koan curriculum, in which practitioners work through a graded sequence of koans in private sanzen interviews, often beginning with Mu or ‘the sound of one hand’ and moving through breakthrough, integration, and embodiment cases. Hakuin made ‘great doubt, great faith, and great determination’ the engine of practice, and he paired koan work with strong posture, concentrated breath-energy, and demanding retreat discipline. Intensive sesshin, with many hours of zazen and repeated sanzen, is the classic environment in which doubt ripens into kensho (seeing one’s true nature). After initial breakthrough, training continues through further koans, literary study, and continued interview so that insight is refined rather than romanticized.",
    keyTexts: [
      {
        title: "Song of Zazen",
        nativeTitle: "坐禅和讃",
        attributedTo: "Hakuin Ekaku",
        period: "18th c.",
        description:
          "'Zazen Wasan' — Hakuin's verse opening ('All beings by nature are Buddha, as ice by nature is water'). Chanted in every Rinzai zendo to end the day, it compresses the school's teaching into 44 lines.",
        url: "https://en.wikipedia.org/wiki/Hakuin_Ekaku",
      },
      {
        title: "Orategama",
        nativeTitle: "遠羅天釜",
        attributedTo: "Hakuin Ekaku",
        period: "1749",
        description:
          "Hakuin's most important letters to lay students — diagnostics of Zen sickness, the importance of post-kensho training, the 'sound of one hand' koan, and energy-work (naikan). The clearest single statement of mature Rinzai pedagogy.",
        url: "https://en.wikipedia.org/wiki/Hakuin_Ekaku",
      },
      {
        title: "Wild Ivy",
        nativeTitle: "藪柑子",
        attributedTo: "Hakuin Ekaku",
        period: "1766",
        description:
          "'Itsumadegusa' — Hakuin's spiritual autobiography. The source for his three great kenshōs, the 'Zen sickness' episode cured by Master Hakuyū's soft-butter meditation, and the emotional temperature of Rinzai training.",
        url: "https://en.wikipedia.org/wiki/Hakuin_Ekaku",
      },
      {
        title: "Record of Kyōun-shū",
        nativeTitle: "狂雲集",
        attributedTo: "Ikkyū Sōjun",
        period: "15th c.",
        description:
          "'Crazy Cloud Anthology' — over a thousand poems by the iconoclastic Daitoku-ji master Ikkyū Sōjun, a reminder that Rinzai tradition carries, alongside Hakuin's rigor, a line of wild, irreverent, and deeply lyrical Zen expression.",
        url: "https://en.wikipedia.org/wiki/Ikky%C5%AB",
      },
    ],
    keyConcepts: [
      {
        term: "Sanzen / Dokusan",
        nativeTerm: "参禅／独参",
        description:
          "The one-on-one interview between student and rōshi in which koan understanding is tested. The pedagogical heart of Rinzai training; insight that cannot be shown in sanzen is treated as not yet real.",
        url: "https://en.wikipedia.org/wiki/Dokusan",
      },
      {
        term: "Three Essentials",
        nativeTerm: "三要",
        description:
          "Hakuin's formula: great faith (daishinkon), great doubt (daigidan), great determination (daifunshi). All three must be present, or koan work goes slack. The engine of Rinzai practice.",
        url: "https://en.wikipedia.org/wiki/Hakuin_Ekaku",
      },
      {
        term: "Kenshō",
        nativeTerm: "見性",
        description:
          "'Seeing [one's] nature' — the initial breakthrough experience toward which the first koan curriculum is aimed. Rinzai treats kenshō as necessary but not sufficient: it must be deepened through years of post-kenshō koan work.",
        url: "https://en.wikipedia.org/wiki/Kensh%C5%8D",
      },
      {
        term: "Sesshin",
        nativeTerm: "接心",
        description:
          "'Gathering the mind' — the multi-day intensive retreat that is the characteristic environment for Rinzai koan practice. Long zazen, repeated sanzen, minimal sleep, and the conditions under which great doubt ripens.",
        url: "https://en.wikipedia.org/wiki/Sesshin",
      },
      {
        term: "The Sound of One Hand",
        nativeTerm: "隻手音声",
        description:
          "'Sekishu onjō' — the first koan Hakuin invented and the one that supplements or substitutes for Mu in many modern Rinzai curricula. 'You know the sound of two hands clapping; what is the sound of one hand?'",
        url: "https://en.wikipedia.org/wiki/One_hand_clapping",
      },
    ],
  },
  {
    slug: "yangqi-line",
    name: "Yangqi line",
    tradition: "Chan",
    parentSlug: "linji",
    aliases: ["linji/yangqi", "yangqi", "yangqi line"],
    nativeNames: { zh: "楊岐派" },
    summary:
      "The Yangqi line is the dominant sub-branch of the Linji school, founded by Yangqi Fanghui (992–1049), a student of Shishuang Chuyuan. It emerged alongside the Huanglong branch when the Linji school divided in the Song dynasty, and eventually absorbed and superseded the Huanglong line to become the sole surviving Linji lineage. The Yangqi branch is characterized by an unpredictable, spontaneous teaching style—Yangqi himself was known for playful and surprising responses that kept students off balance. The line produced many of the most important figures in later Chan history: Wuzu Fayan, Yuanwu Keqin (compiler of the Blue Cliff Record), Dahui Zonggao (champion of huatou practice, who famously burned the Blue Cliff Record's printing blocks), and Wumen Huikai (compiler of the Gateless Barrier). Through Xutang Zhiyu's transmission to Nanpo Jomyo, the Yangqi line became the foundation of virtually all Japanese Rinzai Zen. The Yuan dynasty hermit-poet Shiwu Qinggong (Stonehouse) and the intense practitioner Gaofeng Yuanmiao also belong to this lineage.",
    practice:
      "The Yangqi line championed huatou meditation, in which the practitioner takes up a single critical phrase and investigates it with total concentration until the questioning itself becomes more important than any verbal answer. Dahui Zonggao promoted this kanhua chan (看話禪, ‘observing the phrase’) as a portable and rigorous practice suitable for monks, officials, and laypeople alike. Practice in this line therefore centers on concentrated inquiry, repeated return to the live point of doubt, and dynamic teacher-student testing. Its teaching style prizes spontaneity and compression, using surprise to keep students from settling into secondhand understanding.",
    keyTexts: [
      {
        title: "Blue Cliff Record",
        nativeTitle: "碧巖錄",
        attributedTo: "Xuedou Chongxian & Yuanwu Keqin",
        period: "1125",
        description:
          "Yuanwu — the Yangqi-line master at Jiashan — composed the monumental commentary on Xuedou's 100 cases that became the literary summit of Chan. Dahui later burned the printing blocks to break students' attachment to its prose.",
        url: "https://en.wikipedia.org/wiki/Blue_Cliff_Record",
      },
      {
        title: "Gateless Barrier",
        nativeTitle: "無門關",
        attributedTo: "Wumen Huikai",
        period: "1228",
        description:
          "Compiled by a Yangqi-line master for the training of his students — 48 kōans with pointing verses. Lighter and more didactic than the Blue Cliff Record; the standard koan entry text in every subsequent school.",
        url: "https://en.wikipedia.org/wiki/The_Gateless_Barrier",
      },
      {
        title: "Letters of Dahui",
        nativeTitle: "大慧書",
        attributedTo: "Dahui Zonggao",
        period: "12th c.",
        description:
          "Dahui's correspondence with scholar-officials and lay practitioners, making the case for huatou meditation against 'dead sitting.' The manifesto that made kanhua chan the dominant Song practice.",
        url: "https://en.wikipedia.org/wiki/Dahui_Zonggao",
      },
    ],
    keyConcepts: [
      {
        term: "Kanhua chan",
        nativeTerm: "看話禪",
        description:
          "'Observing the phrase' Chan — Dahui Zonggao's systematization of huatou meditation. The Yangqi line's signature export, inherited in modified form by Korean Seon and Japanese Rinzai.",
        url: "https://en.wikipedia.org/wiki/K%C5%8Dan",
      },
      {
        term: "Huanglong / Yangqi split",
        nativeTerm: "黃龍／楊岐",
        description:
          "The mid-Song division of the Linji school into two sub-branches founded by fellow students of Shishuang Chuyuan. Yangqi eventually absorbed Huanglong and became the sole surviving Linji lineage.",
        url: "https://en.wikipedia.org/wiki/Yangqi_school",
      },
    ],
  },
  {
    slug: "yunmen",
    name: "Yunmen",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["yunmen", "雲門"],
    nativeNames: { zh: "雲門宗" },
    summary:
      "The Yunmen school (雲門宗) is one of the Five Houses of Chan, founded by Yunmen Wenyan (864–949), a student of Xuefeng Yicun. It is renowned for the extraordinary economy and precision of its teaching language—Yunmen's responses were often a single word or phrase that functioned as a complete teaching, known as 'one-word barriers.' His famous utterances include 'Every day is a good day,' 'A dried shit stick' (in response to 'What is Buddha?'), and 'The whole world is medicine—what is your self?' The Yunmen school valued linguistic virtuosity not as literary display but as a form of direct pointing: each word chosen to cut through the student's conceptual mind with surgical precision. Xuedou Chongxian, the school's greatest literary figure, selected and composed verses on the hundred cases that became the basis for the Blue Cliff Record, arguably the supreme literary achievement of the Chan tradition. Though the Yunmen school did not survive as an independent institution beyond the Song dynasty, its spirit permeated all subsequent Chan through the koan collections, and its emphasis on concise, powerful expression continues to shape Zen teaching style to this day.",
    practice:
      "The Yunmen school’s practice centered on the ‘one-word barrier’ (yizi guan), in which the master’s single word or abrupt phrase functions both as a block to analysis and as a gate to realization. Rather than encouraging long explanation, Yunmen training compresses the field of practice into an utterance so exact that it cuts off discursiveness on contact. Students contemplate phrases such as ‘Dried shit stick’ or ‘Every day is a good day’ until language stops behaving as commentary and starts acting as direct revelation. This style of practice trains immediacy, precision, and the ability to meet the whole situation without interpretive delay.",
    keyTexts: [
      {
        title: "Extensive Record of Yunmen",
        nativeTitle: "雲門匡真禪師廣錄",
        attributedTo: "Yunmen Wenyan (compiled by Shoujian)",
        period: "10th c.",
        description:
          "The complete sayings of the school's founder — the 'one-word barriers' ('Dried shit stick,' 'Every day is a good day'), the three statements, and encounter dialogues that set the template for Chan's compressed style.",
        url: "https://en.wikipedia.org/wiki/Yunmen_Wenyan",
      },
      {
        title: "Blue Cliff Record",
        nativeTitle: "碧巖錄",
        attributedTo: "Xuedou Chongxian (cases & verses)",
        period: "1125",
        description:
          "Xuedou — a Yunmen-school master — selected and versified the hundred cases that Yuanwu Keqin would later gloss into the Blue Cliff Record. The literary peak of Chan, and the main vehicle through which Yunmen's style survived after the school itself dissolved.",
        url: "https://en.wikipedia.org/wiki/Blue_Cliff_Record",
      },
    ],
    keyConcepts: [
      {
        term: "One-word barrier",
        nativeTerm: "一字關",
        description:
          "Yunmen's signature pedagogy: a single word or phrase that is simultaneously an obstruction to conceptual answer and a direct pointing to the mind. The most compressed form of koan in the Chan tradition.",
        url: "https://en.wikipedia.org/wiki/Yunmen_Wenyan",
      },
      {
        term: "Three Statements of Yunmen",
        nativeTerm: "雲門三句",
        description:
          "'Covering heaven and earth' (the absolute), 'cutting off all streams' (the function that stops conceptual mind), 'following the waves and pursuing the currents' (responsive activity). A compact diagnostic of any Chan teaching.",
        url: "https://en.wikipedia.org/wiki/Yunmen_school",
      },
    ],
  },
  {
    slug: "fayan",
    name: "Fayan",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["fayan", "法眼"],
    nativeNames: { zh: "法眼宗" },
    summary:
      "The Fayan school (法眼宗) is one of the Five Houses of Chan, founded by Fayan Wenyi (885–958), a dharma heir of Luohan Guichen in the lineage of Xuefeng Yicun and Shitou Xiqian. The school is named after Fayan's monastery on Mount Qingliang in Jinling (modern Nanjing). During the Five Dynasties and Ten Kingdoms period, the Fayan school became the dominant Chan school in the Southern Tang and Wuyue kingdoms. Fayan Wenyi's teaching emphasized the harmony of the three teachings—Buddhism, Confucianism, and Daoism—and sought to place culture and learning in service of insight rather than rejecting them. His Ten Admonishments for the Lineage (Zongmen shigui lun) critiqued the decline of Chan practice in his era. Key figures include Tiantai Deshao (891–972), who served as national preceptor of Wuyue and revitalized the Tiantai school alongside his Chan teaching, and Yongming Yanshou (904–975), regarded as the third Fayan patriarch, who authored the monumental Zongjing lu (Records of the Mirror of the Source) and initiated the Chan-Pure Land synthesis that shaped all subsequent Chinese Buddhism. The Fayan school was the first Chan lineage to gain recognition at the Song court, but it did not survive as an independent institution beyond the early Song dynasty, its methods and insights absorbed into the Linji tradition.",
    practice:
      "The Fayan school integrated doctrinal understanding with direct Chan realization, drawing on Huayan philosophy’s vision of the mutual interpenetration of all phenomena. Practice was not reduced to scholasticism, but it refused the anti-intellectual pose of treating study as an obstacle: meditation, scriptural reflection, and dialectical questioning belonged together. Fayan Wenyi’s question ‘the myriad dharmas return to the one; where does the one return?’ exemplifies this training, in which conceptual inquiry is pushed until it opens into contemplative insight. Yongming Yanshou extended the same synthetic method by combining Chan meditation with Pure Land recitation and broader Mahayana study, creating a practice culture in which contemplation, devotion, and doctrine reinforce one another.",
    keyTexts: [
      {
        title: "Ten Admonishments for the Lineage",
        nativeTitle: "宗門十規論",
        attributedTo: "Fayan Wenyi",
        period: "10th c.",
        description:
          "'Zongmen shigui lun' — Fayan's critique of ten characteristic failings of Chan monks of his era, from shallow imitation of encounter-dialogue style to neglect of scripture. The founder's own manual for preventing the school's decline.",
        url: "https://en.wikipedia.org/wiki/Fayan_Wenyi",
      },
      {
        title: "Records of the Mirror of the Source",
        nativeTitle: "宗鏡錄",
        attributedTo: "Yongming Yanshou",
        period: "961",
        description:
          "A hundred-fascicle synthesis in which the third Fayan patriarch reconciles Chan with Huayan, Tiantai, Yogācāra, and Pure Land thought. Initiated the Chan–Pure Land synthesis that dominated later Chinese Buddhism.",
        url: "https://en.wikipedia.org/wiki/Yongming_Yanshou",
      },
    ],
    keyConcepts: [
      {
        term: "Interpenetration of dharmas",
        nativeTerm: "事事無礙",
        description:
          "'Shi-shi wu-ai' — the Huayan doctrine of the mutual non-obstruction of all phenomena, made the contemplative horizon of Fayan practice. Every moment interpenetrates every other; realization is the non-conceptual seeing of this.",
        url: "https://en.wikipedia.org/wiki/Huayan",
      },
      {
        term: "Chan–Pure Land synthesis",
        nativeTerm: "禪淨雙修",
        description:
          "'Practicing Chan and Pure Land together' — the dual discipline codified by Yongming Yanshou: seated meditation paired with nianfo recitation, treating them as two entry points into one awakened mind. The inheritance that later shaped Ōbaku Zen.",
        url: "https://en.wikipedia.org/wiki/Yongming_Yanshou",
      },
    ],
  },
  {
    slug: "guiyang",
    name: "Guiyang",
    tradition: "Chan",
    parentSlug: "nanyue-line",
    aliases: ["guiyang", "潙仰"],
    nativeNames: { zh: "潙仰宗" },
    summary:
      "The Guiyang school (潙仰宗) was the earliest of the Five Houses of Chan to be formally recognized, founded by Guishan Lingyou (771–853) and his student Yangshan Huiji (807–883) in the lineage of Baizhang Huaihai. The school's name combines the first characters of their respective mountains. The Guiyang school was distinguished by its refined and indirect teaching methods, particularly the use of ninety-seven circular figures (yuan-xiang) to express the relationship between the absolute and relative—a sophisticated non-verbal language that complemented the verbal exchanges used by other schools. Where the Linji school employed shouts and blows, the Guiyang tradition favored subtle gestures, drawn symbols, and the interplay of 'host' and 'guest' as pedagogical tools. Key figures include Xiangyan Zhixian, who awakened at the sound of a pebble striking bamboo after burning all his scholarly notes, and Liu Tiemo ('Iron Grindstone Liu'), a formidable female dharma heir of Guishan whose sharp dialogues ground down all challengers. In the modern era, the Guiyang lineage was revived by the great master Xuyun (1840–1959), who transmitted it to Hsuan Hua. The Guiyang school did not survive as an independent institution beyond the Song dynasty, but its insights into symbolic communication and the non-verbal dimensions of transmission influenced the broader Chan tradition.",
    practice:
      "The Guiyang school employed ninety-seven circular figures (yuan-xiang) as contemplative tools, using drawn forms, symbolic gestures, and subtle exchanges to express relationships that ordinary explanation cannot capture. In practice encounters, master and student might work with a figure or gesture rather than a sentence, making non-verbal communication itself part of the training. This did not replace sitting meditation; it refined the practitioner’s sensitivity to how absolute and relative, host and guest, presence and response shift within a living encounter. The school’s distinctive contribution is therefore a contemplative pedagogy of symbolic form rather than blunt confrontation.",
    keyTexts: [
      {
        title: "Guishan's Admonitions",
        nativeTitle: "潙山警策",
        attributedTo: "Guishan Lingyou",
        period: "9th c.",
        description:
          "'Guishan jingce' — the founder's pungent warnings to monks about laxity, scholarly conceit, and the waste of one's life. Still chanted and studied in Chan and Zen monasteries as a call to practice seriousness.",
        url: "https://en.wikipedia.org/wiki/Guishan_Lingyou",
      },
    ],
    keyConcepts: [
      {
        term: "Ninety-seven Circular Figures",
        nativeTerm: "九十七圓相",
        description:
          "Yangshan Huiji's collection of drawn circular forms used as non-verbal teaching devices — a sophisticated symbolic language that complemented the school's subtle encounter-dialogue style.",
        url: "https://en.wikipedia.org/wiki/Guiyang_school",
      },
      {
        term: "Host and Guest",
        nativeTerm: "主賓",
        description:
          "The pedagogical pair Yangshan used to analyze encounter dynamics: who meets whom as absolute (host) and who as relative (guest), and how those roles interpenetrate in the moment of exchange.",
        url: "https://en.wikipedia.org/wiki/Yangshan_Huiji",
      },
    ],
  },
  {
    slug: "sanbo-zen",
    name: "Sanbo-Zen",
    tradition: "Zen",
    aliases: ["sanbo", "sanbo-zen", "sanbō-zen", "sanbo kyodan"],
    nativeNames: { ja: "三宝禅" },
    summary:
      "Sanbo-Zen (三宝禅, formerly Sanbo Kyodan, 'Three Treasures Association') is a modern Zen school founded by Yasutani Hakuun (1885–1973) that integrates Soto Zen's emphasis on shikantaza with the Rinzai tradition's systematic koan curriculum. Yasutani's teacher, Harada Daiun Sogaku, had pioneered this synthesis by combining his Soto training with extensive Rinzai koan study under several masters. The Sanbo-Zen approach offers practitioners both objectless sitting and a structured koan path, beginning with the Mu koan and progressing through the traditional Rinzai curriculum. Under the leadership of Yamada Koun (1907–1989), the school became one of the most important vehicles for transmitting Zen to the West. Yamada's radical openness—he trained Catholic priests and nuns, Protestant ministers, and practitioners of other faiths alongside traditional Buddhist students—transformed Zen from a Japanese cultural phenomenon into a genuinely international contemplative practice. Robert Aitken (Diamond Sangha, Hawaii) and Ruben Habito (Maria Kannon Zen Center, Dallas) are among the school's notable Western-based teachers. The school is headquartered in Kamakura, Japan.",
    practice:
      "Sanbo-Zen uniquely synthesizes Soto shikantaza with the Rinzai koan curriculum, as developed by Harada Daiun Sogaku and refined by Yasutani Hakuun. Training typically alternates between periods of objectless sitting and intensive koan investigation, with practitioners often beginning with Mu and then progressing through a streamlined Rinzai-style sequence in dokusan. The school is notable for treating kensho as a concrete experiential aim while still insisting that insight be stabilized through continued sitting, ethical life, and teacher verification. Under Yamada Koun, these methods were adapted for lay people and for practitioners from other religions, making Sanbo-Zen one of the most portable modern formats of formal Zen training.",
    keyTexts: [
      {
        title: "The Three Pillars of Zen",
        attributedTo: "Philip Kapleau",
        period: "1965",
        description:
          "The first English-language book to present Yasutani Hakuun's Sanbō-Zen pedagogy in full — Yasutani's introductory lectures, verbatim dokusan transcripts, and contemporary enlightenment accounts. The book that introduced serious Zen training to a generation of Western practitioners.",
        url: "https://en.wikipedia.org/wiki/The_Three_Pillars_of_Zen",
      },
      {
        title: "Flowers Fall: A Commentary on Dōgen's Genjōkōan",
        attributedTo: "Yamada Kōun (trans. Paul Jaffe)",
        period: "1992",
        description:
          "The second Sanbō-Zen patriarch's teishō on Dōgen's foundational fascicle — a model of how the school reads Sōtō texts through a koan lens without losing their shikantaza weight.",
        url: "https://www.shambhala.com/flowers-fall.html",
      },
      {
        title: "Approach to Zen",
        attributedTo: "Yasutani Hakuun",
        period: "1967",
        description:
          "Yasutani's own short introduction to Sanbō practice — the Five Varieties of Zen, the aim of kenshō, and the integration of zazen with koan work. The clearest statement of the school's founding vision.",
        url: "https://en.wikipedia.org/wiki/Hakuun_Yasutani",
      },
    ],
    keyConcepts: [
      {
        term: "Five Varieties of Zen",
        nativeTerm: "五種禪",
        description:
          "Yasutani's typology (drawn from Guifeng Zongmi): bompu (ordinary), gedō (outside-way), shōjō (small-vehicle), daijō (great-vehicle), and saijōjō (supreme-vehicle) Zen. Used to locate what Sanbō-Zen is actually teaching.",
        url: "https://en.wikipedia.org/wiki/Hakuun_Yasutani",
      },
      {
        term: "Miki koan curriculum",
        description:
          "The streamlined koan sequence used in Sanbō-Zen, derived from Hakuin's Rinzai curriculum but reorganized by Harada Daiun and refined by Yasutani. Begins with Mu and moves through around 500 cases for full training.",
        url: "https://en.wikipedia.org/wiki/Sanbo_Kyodan",
      },
    ],
  },
  {
    slug: "thien",
    name: "Thiền",
    tradition: "Thiền",
    parentSlug: "chan",
    aliases: ["thien", "thiền", "vietnamese zen", "vietnamese chan"],
    nativeNames: { vi: "Thiền", zh: "禪" },
    summary:
      "Thiền (禪) is the Vietnamese tradition of Chan Buddhism, brought to Vietnam through multiple transmissions from China beginning as early as the sixth century. The first Thiền school was founded by Vinitaruci (d. 594), an Indian monk who had studied with the Third Patriarch Sengcan before traveling to Vietnam. The second school was established by Vô Ngôn Thông (d. 826), a Chinese disciple of Baizhang Huaihai. Vietnamese Thiền developed a distinctive character, readily combining meditation practice with Pure Land devotion, Confucian ethics, and indigenous Vietnamese spirituality. The tradition produced several uniquely Vietnamese developments, including the Trúc Lâm (Bamboo Forest) school founded by Emperor Trần Nhân Tông in 1299, and the Liễu Quán dharma line of the Lâm Tế school, which became the dominant lineage in central and southern Vietnam.",
    practice:
      "Vietnamese Thiền characteristically combines seated meditation with Pure Land devotion (niệm Phật), sutra chanting, repentance liturgies, and practical mindfulness in daily life. Rather than treating these as competing methods, the tradition typically understands them as mutually supportive disciplines suited to different capacities and circumstances. A practitioner may therefore move between silent sitting, recitation of the Buddha’s name, doctrinal study, and ritual observance without feeling that one invalidates the others. The relative balance varies by lineage and teacher, but the hallmark of Thiền is this integrated rather than exclusionary practice culture.",
    keyTexts: [
      {
        title: "Thiền Uyển Tập Anh",
        nativeTitle: "禪苑集英",
        attributedTo: "Kim Sơn (compiler)",
        period: "1337",
        description:
          "'Outstanding Figures of the Zen Garden' — the principal historical source for early Vietnamese Thiền. Biographies and sayings of 68 monks from the three oldest Vietnamese Thiền lineages (Vinītaruci, Vô Ngôn Thông, Thảo Đường).",
        url: "https://en.wikipedia.org/wiki/Thi%E1%BB%81n_Uy%E1%BB%83n_T%E1%BA%ADp_Anh",
      },
      {
        title: "Khóa Hư Lục",
        nativeTitle: "課虛錄",
        attributedTo: "Trần Thái Tông",
        period: "13th c.",
        description:
          "'Instructions on Emptiness' — Emperor Trần Thái Tông's essays and verses on Thiền practice. One of the earliest sustained expressions of Vietnamese Buddhist thought, combining meditation instruction with imperial ethics.",
        url: "https://en.wikipedia.org/wiki/Tr%E1%BA%A7n_Th%C3%A1i_T%C3%B4ng",
      },
      {
        title: "Tuệ Trung Thượng Sĩ Ngữ Lục",
        nativeTitle: "慧中上士語錄",
        attributedTo: "Tuệ Trung Thượng Sĩ (recorded by students)",
        period: "13th c.",
        description:
          "The recorded sayings of the lay master Tuệ Trung — elder brother of the national hero Trần Hưng Đạo and teacher of Trần Nhân Tông. The purest expression of Thiền's iconoclastic strain in Vietnamese literature.",
        url: "https://en.wikipedia.org/wiki/Tu%E1%BB%87_Trung_Th%C6%B0%E1%BB%A3ng_S%C4%A9",
      },
    ],
    keyConcepts: [
      {
        term: "Thoại đầu",
        nativeTerm: "話頭",
        description:
          "The Vietnamese pronunciation of the Chinese huatou — the single critical phrase used in Thiền meditation, particularly in the Lâm Tế line. 'Who drags this corpse around?' is a classical Vietnamese choice.",
        url: "https://en.wikipedia.org/wiki/Hua_Tou",
      },
      {
        term: "Niệm Phật",
        nativeTerm: "念佛",
        description:
          "'Buddha-recollection' — the Pure Land recitation of the Buddha's name (usually Amitābha). Integrated into Thiền practice rather than treated as a separate path, reflecting the tradition's inclusive character.",
        url: "https://en.wikipedia.org/wiki/Nianfo",
      },
      {
        term: "Tam Giáo Đồng Nguyên",
        nativeTerm: "三教同源",
        description:
          "'The three teachings share one source' — the Vietnamese commitment to the compatibility of Buddhism, Confucianism, and Daoism. A characteristic backdrop for Thiền's willingness to integrate diverse practices.",
        url: "https://en.wikipedia.org/wiki/Three_teachings",
      },
    ],
  },
  {
    slug: "lam-te",
    name: "Lâm Tế",
    tradition: "Thiền",
    parentSlug: "linji",
    aliases: ["lam te", "lâm tế", "vietnamese linji", "linji vietnam"],
    nativeNames: { vi: "Lâm Tế", zh: "臨濟宗" },
    summary:
      "The Lâm Tế school is the Vietnamese form of the Chinese Linji tradition, formally established in Vietnam during the seventeenth century by Chinese monks carrying the late-Ming Linji revival lineage of Miyun Yuanwu. The most important transmission was through Nguyên Thiều (1648–1728), a Chinese monk from Guangdong who arrived in Vietnam around 1665–1677 and established the Linji lineage in the central and southern regions. His dharma grandson Liễu Quán (1670–1742) became the first native Vietnamese to receive Linji dharma transmission, founding the Liễu Quán dharma line that 'Vietnamized' the tradition and remains the dominant Buddhist lineage in central Vietnam to this day. Thích Nhất Hạnh (1926–2022), the globally influential Zen teacher and peace activist, was the 42nd generation of the Lâm Tế school and 8th generation of the Liễu Quán line.",
    practice:
      "The Lâm Tế school practices huatou (thoại đầu) investigation in the tradition transmitted from late-Ming Chinese Linji Chan, but adapted to Vietnamese monastic life where chanting, liturgy, and community obligations remain prominent. In the Liễu Quán line especially, meditation is joined to sutra study, repentance ceremonies, devotional chanting, and forms of service rather than isolated from them. This means that insight is cultivated through both concentrated inquiry and a broader temple discipline shaped by Vietnamese Mahayana culture. Thích Nhất Hạnh later drew on this inherited unity of contemplation and engagement when developing his own modern teaching.",
    keyTexts: [
      {
        title: "Record of Linji",
        nativeTitle: "臨濟錄",
        attributedTo: "Linji Yixuan",
        period: "9th c. (Chinese); transmitted to Vietnam 17th c.",
        description:
          "The founding text of the whole Linji/Lâm Tế tradition. Vietnamese Lâm Tế monasteries study the same yulu that shapes Chinese and Japanese Linji/Rinzai practice, read in classical Chinese with Vietnamese commentary.",
        url: "https://en.wikipedia.org/wiki/Record_of_Linji",
      },
      {
        title: "Liễu Quán Transmission Verse",
        attributedTo: "Liễu Quán",
        period: "18th c.",
        description:
          "The dharma-name generation verse composed by Liễu Quán that standardizes the names of all subsequent masters in his line. The structural backbone of Vietnamese Lâm Tế genealogy to this day.",
        url: "https://en.wikipedia.org/wiki/Li%E1%BB%85u_Qu%C3%A1n",
      },
    ],
    keyConcepts: [
      {
        term: "Thoại đầu",
        nativeTerm: "話頭",
        description:
          "The Vietnamese form of huatou — the keyword-meditation method inherited from Chinese Linji. In the Liễu Quán line, 'Who drags this corpse around?' is a characteristic phrase.",
        url: "https://en.wikipedia.org/wiki/Hua_Tou",
      },
      {
        term: "Liễu Quán line",
        description:
          "The Vietnamese dharma line established by Liễu Quán (1670–1742), the first native Vietnamese to receive Lâm Tế transmission. Dominant in central and southern Vietnam; Thích Nhất Hạnh is its 8th-generation heir.",
        url: "https://en.wikipedia.org/wiki/Li%E1%BB%85u_Qu%C3%A1n",
      },
    ],
  },
  {
    slug: "truc-lam",
    name: "Trúc Lâm",
    tradition: "Thiền",
    parentSlug: "thien",
    aliases: ["truc lam", "trúc lâm", "bamboo forest", "竹林"],
    nativeNames: { vi: "Trúc Lâm", zh: "竹林" },
    summary:
      "The Trúc Lâm (竹林, Bamboo Forest) school is the only indigenous Vietnamese Zen tradition, founded in 1299 by Trần Nhân Tông (1258–1308), the third emperor of the Trần dynasty who abdicated the throne to become a monk. After personally leading Vietnam to victory in the second and third Mongol invasions (1285 and 1288), Trần Nhân Tông retired to Yên Tử Mountain and unified the three existing Vietnamese Thiền schools—the Vinitaruci, Vô Ngôn Thông, and Thảo Đường lineages—into a single school. The Trúc Lâm tradition was continued by two more patriarchs, Pháp Loa (1284–1330) and Huyền Quang (1254–1334), before gradually declining as a distinct school. It was revived in the twentieth century by Thích Thanh Từ as a modern Vietnamese contemplative movement with monasteries across the country.",
    practice:
      "The Trúc Lâm school, as revived by Thích Thanh Từ, emphasizes meditation-centered training rooted in Trần Nhân Tông’s synthesis of the older Vietnamese Thiền streams. Practitioners are directed toward ‘knowing the mind and seeing the nature’ (tri tâm kiến tánh), often through seated meditation and direct questioning practices such as ‘Who is dragging this corpse around?’ In its modern form, Trúc Lâm intentionally re-centers contemplative discipline within a Buddhist landscape often dominated by ritual and devotional forms, while still remaining fully Mahayana in ethical and monastic orientation. Its ideal is a distinctly Vietnamese Zen life in which clarity of mind, simplicity, and disciplined sitting are the foundation.",
    keyTexts: [
      {
        title: "Cư Trần Lạc Đạo Phú",
        nativeTitle: "居塵樂道賦",
        attributedTo: "Trần Nhân Tông",
        period: "late 13th c.",
        description:
          "'Living in the World, Joyful in the Way' — the founder's rhyme-prose in the Vietnamese Nôm script. A vernacular manifesto for lay practice: awakening happens here, in ordinary life, not only in the mountains.",
        url: "https://en.wikipedia.org/wiki/Tr%E1%BA%A7n_Nh%C3%A2n_T%C3%B4ng",
      },
      {
        title: "Đắc Thú Lâm Tuyền Thành Đạo Ca",
        nativeTitle: "得趣林泉成道歌",
        attributedTo: "Trần Nhân Tông",
        period: "late 13th c.",
        description:
          "'Song of Attaining the Delight of Forests and Streams and Realizing the Way' — Trần Nhân Tông's meditation poem composed at Yên Tử. A lyrical map of the practitioner's progress from retreat to realization.",
        url: "https://en.wikipedia.org/wiki/Tr%C3%BAc_L%C3%A2m",
      },
      {
        title: "Thánh Đăng Ngữ Lục",
        nativeTitle: "聖燈語錄",
        attributedTo: "(compiled Trần dynasty)",
        period: "14th c.",
        description:
          "'Record of the Sacred Lamp' — the sayings and deeds of the three Trúc Lâm patriarchs (Trần Nhân Tông, Pháp Loa, Huyền Quang). The canonical internal history of the school.",
        url: "https://en.wikipedia.org/wiki/Tr%C3%BAc_L%C3%A2m",
      },
    ],
    keyConcepts: [
      {
        term: "Tri tâm kiến tánh",
        nativeTerm: "知心見性",
        description:
          "'Know the mind, see the nature' — the core Trúc Lâm instruction as re-articulated by Thích Thanh Từ. Zazen is not for producing states but for letting the mind's own clear nature be recognized.",
        url: "https://en.wikipedia.org/wiki/Th%C3%ADch_Thanh_T%E1%BB%AB",
      },
      {
        term: "Yên Tử mountain practice",
        description:
          "The retreat ideal embodied by Trần Nhân Tông on Mount Yên Tử after his abdication — disciplined sitting, forest simplicity, and the refusal of royal luxury. The school's paradigmatic setting.",
        url: "https://en.wikipedia.org/wiki/Y%C3%AAn_T%E1%BB%AD_Mountain",
      },
      {
        term: "Unification of three lineages",
        description:
          "Trúc Lâm's founding act: Trần Nhân Tông absorbed the Vinītaruci, Vô Ngôn Thông, and Thảo Đường schools into a single Vietnamese Thiền. The only indigenous Zen tradition in East Asia.",
        url: "https://en.wikipedia.org/wiki/Tr%C3%BAc_L%C3%A2m",
      },
    ],
  },
  {
    slug: "plum-village",
    name: "Plum Village",
    tradition: "Thiền",
    parentSlug: "lam-te",
    aliases: ["plum village", "lang mai", "làng mai", "order of interbeing"],
    nativeNames: { vi: "Làng Mai", zh: "梅村" },
    summary:
      "The Plum Village tradition is a modern school of engaged Buddhism founded by Thích Nhất Hạnh (1926–2022) in the Lâm Tế (Vietnamese Linji) lineage. Named after Plum Village, the practice center established in the Dordogne region of France in 1982, the tradition emphasizes mindfulness in daily life, engaged social action, and the integration of meditation practice with ethical living. Thích Nhất Hạnh developed the practice of the Fourteen Mindfulness Trainings as the foundation of the Order of Interbeing (Tiếp Hiện), established in 1966 during the Vietnam War. The tradition's teaching methods—walking meditation, mindful eating, dharma sharing circles, and the practice of Beginning Anew—have made Zen practice accessible to millions worldwide. With monasteries and practice centers on five continents and hundreds of local sanghas, Plum Village is one of the largest Buddhist communities in the Western world.",
    practice:
      "Plum Village practice integrates mindfulness into every activity—walking meditation, mindful eating, conscious breathing, deep listening, and careful speech—so that formal sitting becomes one part of a whole ecology of awareness. The tradition is highly structured but not monastically severe in the classical Zen sense: bells of mindfulness, guided meditations, communal chanting, and dharma sharing circles repeatedly return practitioners to embodied presence. The Fourteen Mindfulness Trainings of the Order of Interbeing function as both ethical commitments and contemplative exercises, linking inner transformation to nonviolence, right consumption, and compassionate social action. Beginning Anew, total relaxation, and ‘lazy days’ further mark Plum Village as a school in which healing, community, and engagement are integral to practice rather than secondary to it.",
    keyTexts: [
      {
        title: "The Miracle of Mindfulness",
        attributedTo: "Thích Nhất Hạnh",
        period: "1975",
        description:
          "Originally a long letter of instruction to a young monk during the Vietnam War. Introduced 'mindfulness' as a practicable discipline to Western readers and remains the canonical short introduction to Plum Village practice.",
        url: "https://plumvillage.org/books/the-miracle-of-mindfulness",
      },
      {
        title: "The Heart of the Buddha's Teaching",
        attributedTo: "Thích Nhất Hạnh",
        period: "1998",
        description:
          "Plum Village's definitive presentation of the Four Noble Truths, Noble Eightfold Path, and the Three Dharma Seals — the tradition's own claim that its mindfulness practice is classical Buddhism, not a secular derivative.",
        url: "https://plumvillage.org/books/heart-of-the-buddhas-teaching",
      },
      {
        title: "Interbeing: Fourteen Guidelines for Engaged Buddhism",
        attributedTo: "Thích Nhất Hạnh",
        period: "1987 / rev. 2020",
        description:
          "The charter of the Order of Interbeing — the Fourteen Mindfulness Trainings with extended commentary. Functions as both ethical code and contemplative manual for engaged practitioners.",
        url: "https://plumvillage.org/mindfulness-practice/the-14-mindfulness-trainings",
      },
      {
        title: "Old Path White Clouds",
        attributedTo: "Thích Nhất Hạnh",
        period: "1991",
        description:
          "Thích Nhất Hạnh's life of the Buddha, drawn from the Pali canon and classical Mahayana texts. The narrative core of Plum Village's self-understanding as a Buddha-centered tradition.",
        url: "https://plumvillage.org/books/old-path-white-clouds",
      },
    ],
    keyConcepts: [
      {
        term: "Interbeing",
        nativeTerm: "相即",
        description:
          "Thích Nhất Hạnh's English neologism for the Avataṃsaka / Huayan doctrine that nothing exists by itself — every phenomenon 'inter-is' with every other. The philosophical heart of Plum Village practice and ethics.",
        url: "https://plumvillage.org/articles/interbeing",
      },
      {
        term: "Fourteen Mindfulness Trainings",
        description:
          "The ethical and contemplative commitments of the Order of Interbeing, founded in 1966 — openness, non-attachment to views, freedom of thought, awareness of suffering, simple and healthy living, and so on. Both vows and practice instructions.",
        url: "https://plumvillage.org/mindfulness-practice/the-14-mindfulness-trainings",
      },
      {
        term: "Walking meditation",
        description:
          "'Kinh hành' in Vietnamese, kinhin in Japanese — at Plum Village, walking is a central and distinct practice, not a mere break between sittings. Each step is coordinated with breath and the recognition that arrival is here.",
        url: "https://plumvillage.org/mindfulness/walking-meditation",
      },
      {
        term: "Bell of mindfulness",
        description:
          "The recurring sound-anchor of Plum Village life. Phone rings, clocks, and temple bells are all treated as invitations to return to the breath; the practice trains attention through environmental cues rather than willpower.",
        url: "https://plumvillage.org/mindfulness/mindfulness-practice",
      },
      {
        term: "Beginning Anew",
        description:
          "A four-part reconciliation practice (flower watering, expressing regret, expressing hurt, asking for support) central to sangha life. The community dimension of individual mindfulness: clearing interpersonal sediment so that practice can continue.",
        url: "https://plumvillage.org/mindfulness/beginning-anew",
      },
    ],
  },
  {
    slug: "seon",
    name: "Seon",
    tradition: "Seon",
    parentSlug: "chan",
    aliases: ["seon", "선", "korean zen", "korean chan"],
    nativeNames: { ko: "선", zh: "禪" },
    summary:
      "Seon (禪, 선) is the Korean tradition of Chan Buddhism, introduced to the Korean peninsula beginning in the seventh century by monks who had studied in Tang dynasty China. The earliest transmissions came through figures like Toui, who received dharma transmission from Baizhang Huaihai's lineage and established the first Seon school upon returning to Korea. During the Goryeo dynasty, Bojo Jinul (1158–1210) became the tradition's most influential reformer, synthesizing Seon meditation with Hwaeom (Huayan) doctrinal study and establishing the Jogye Order, which remains the dominant Buddhist institution in Korea today. Korean Seon developed a distinctive character: it preserved the intensity of Tang dynasty Chan practice—particularly the hwadu (huatou) method of koan investigation—while integrating it with a broader Buddhist framework. The tradition also maintained a strong emphasis on extended silent retreat, culminating in the modern Korean practice of three-month intensive meditation seasons (kyolche). Major modern figures include Gyeongheo, who revived the dying Seon tradition in the late nineteenth century, and Seongcheol, who insisted on sudden awakening as the only authentic path.",
    practice:
      "Korean Seon preserves hwadu (話頭) investigation as its defining method: the practitioner takes up a living question—most often ‘What is this?’ (이뭣고)—and sustains it through sitting, walking, chanting, and daily activity until the questioning penetrates beneath conceptual thought. The hallmark of Seon training is intensity over discursiveness, especially in the kyolche (結制) retreat system, where monastics enter long seasonal periods of near-continuous meditation under strict discipline. Yet Seon has never been only technique: the tradition also frames practice through the long debate over sudden awakening and subsequent cultivation, from Jinul’s dono jeomsu to Seongcheol’s insistence on pure sudden awakening. In this way, Korean Seon combines rigorous meditative inquiry with sustained reflection on what awakening actually means.",
    keyTexts: [
      {
        title: "Secrets on Cultivating the Mind",
        nativeTitle: "修心訣",
        attributedTo: "Bojo Jinul",
        period: "late 12th c.",
        description:
          "'Susim Gyeol' — Jinul's concise manual arguing that all beings already possess buddha-nature and that practice is to recognize it and then cultivate that recognition. The foundational Korean Seon pedagogical text.",
        url: "https://en.wikipedia.org/wiki/Jinul",
      },
      {
        title: "Excerpts from the Dharma Collection and Special Practice Record",
        nativeTitle: "法集別行錄節要並入私記",
        attributedTo: "Bojo Jinul",
        period: "1209",
        description:
          "Jinul's systematic synthesis of Huayan doctrine, Heze Shenhui's sudden-awakening teaching, and Dahui's hwadu method. The single most important text for understanding the distinctive Korean Seon synthesis.",
        url: "https://en.wikipedia.org/wiki/Jinul",
      },
      {
        title: "Mirror of Seon",
        nativeTitle: "禪家龜鑑",
        attributedTo: "Seosan Hyujeong",
        period: "1564",
        description:
          "'Seonga Gwigam' — the most widely studied Korean Seon text after Jinul. A distilled manual of Seon practice that shaped centuries of monastic training and remains standard reading today.",
        url: "https://en.wikipedia.org/wiki/Hyujeong",
      },
      {
        title: "Sermons of Seongcheol",
        nativeTitle: "백일법문",
        attributedTo: "Seongcheol",
        period: "1967 (delivered)",
        description:
          "'One Hundred Days of Dharma Talks' — Seongcheol's uncompromising argument that dono jeomsu (sudden awakening–gradual cultivation) is incorrect and that only sudden-awakening–sudden-cultivation (dono donsu) matches the orthodox Chan tradition. Reshaped modern Korean Seon.",
        url: "https://en.wikipedia.org/wiki/Seongcheol",
      },
    ],
    keyConcepts: [
      {
        term: "Hwadu",
        nativeTerm: "話頭",
        description:
          "The Korean pronunciation of huatou. The central meditative instrument of Korean Seon — a critical phrase taken up until it becomes an irreducible point of questioning.",
        url: "https://en.wikipedia.org/wiki/Hua_Tou",
      },
      {
        term: "Imwotgo",
        nativeTerm: "이뭣고",
        description:
          "'What is this?' — the characteristic Korean hwadu, a pure-vernacular rendering that avoids classical-Chinese baggage. Jinul-derived and used across modern Seon halls.",
        url: "https://en.wikipedia.org/wiki/Seon_Buddhism",
      },
      {
        term: "Dono jeomsu vs. dono donsu",
        nativeTerm: "頓悟漸修／頓悟頓修",
        description:
          "The central doctrinal debate of Korean Seon: 'sudden awakening, gradual cultivation' (Jinul's orthodoxy) versus 'sudden awakening, sudden cultivation' (Seongcheol's reform). Still actively contested.",
        url: "https://en.wikipedia.org/wiki/Seongcheol",
      },
      {
        term: "Kyolche",
        nativeTerm: "結制",
        description:
          "The three-month 'gathering the bonds' retreat held twice a year (summer and winter) in Korean Seon monasteries — the characteristic institutional form of Korean intensive practice.",
        url: "https://en.wikipedia.org/wiki/Seon_Buddhism",
      },
    ],
  },
  {
    slug: "jogye",
    name: "Jogye",
    tradition: "Seon",
    parentSlug: "seon",
    aliases: ["jogye", "jogye order", "조계종", "chogye"],
    nativeNames: { ko: "조계종", zh: "曹溪宗" },
    summary:
      "The Jogye Order (조계종, 曹溪宗) is the largest and most influential Buddhist order in Korea, tracing its spiritual lineage to the Sixth Patriarch Huineng's mountain, Caoxi (Jogye in Korean). Founded in its original form by Bojo Jinul in the twelfth century and reconstituted in the twentieth century after Japanese colonial suppression, the Jogye Order represents the mainstream of Korean Seon practice. The order's distinctive approach combines rigorous hwadu (huatou) meditation with monastic discipline, seasonal intensive retreats (kyolche), and the integration of doctrinal study. The Jogye Order maintains over two thousand temples across South Korea and operates the country's major monastic training centers, including Haeinsa, Songgwangsa, and Tongdosa. In the modern era, the order has produced towering figures including Gyeongheo Seongu, who single-handedly revived Korean Seon practice; Mangong, Hyobong, and Gobong, who maintained rigorous meditation standards; and Seongcheol, whose uncompromising insistence on sudden awakening sparked nationwide debate about the nature of enlightenment.",
    practice:
      "The Jogye Order’s standard practice is hwadu investigation, typically working with ‘What is this?’ (이뭣고) or another critical phrase under a seon master’s guidance. This unfolds most intensely in the seonbang during the twice-yearly summer and winter kyolche, when monastics commit to three months of highly disciplined sitting, walking meditation, and silence. Outside retreat, Jogye training still integrates chanting, bowing, repentance, sutra study, and communal temple labor, so the order does not treat hwadu as a freestanding exercise divorced from monastic formation. The result is a practice culture that joins hard meditative inquiry to the rhythms of large Korean monastic institutions.",
    keyTexts: [
      {
        title: "Admonitions to Beginners",
        nativeTitle: "誡初心學人文",
        attributedTo: "Bojo Jinul",
        period: "1205",
        description:
          "'Gye chosim hak-in mun' — the short instruction Jinul wrote for new monks. Read aloud in Jogye monasteries to every new ordinand; the canonical entry to the order.",
        url: "https://en.wikipedia.org/wiki/Jinul",
      },
      {
        title: "Treatise on the Complete and Sudden Attainment of Buddhahood",
        nativeTitle: "圓頓成佛論",
        attributedTo: "Bojo Jinul",
        period: "c. 1200",
        description:
          "Jinul's doctrinal synthesis showing how Huayan's perfect-interpenetration teaching grounds Seon's sudden awakening. The theoretical charter of the order's 'ssangsu' (dual-cultivation) approach.",
        url: "https://en.wikipedia.org/wiki/Jinul",
      },
      {
        title: "Song of Realizing the Way",
        nativeTitle: "오도송",
        attributedTo: "Gyeongheo Seongu",
        period: "late 19th c.",
        description:
          "'Odo song' — the awakening verses of the master who single-handedly revived Korean Seon after centuries of Joseon-dynasty suppression. The tradition treats Gyeongheo as the spiritual grandfather of every major 20th-century Jogye teacher.",
        url: "https://en.wikipedia.org/wiki/Gyeongheo",
      },
    ],
    keyConcepts: [
      {
        term: "Ssangsu",
        nativeTerm: "雙修",
        description:
          "'Dual cultivation' — Jinul's formula for combining meditation (samādhi) and wisdom (prajñā), against the tendency to treat them as alternatives. The distinctive Jogye synthesis of Seon practice with Huayan scholarship.",
        url: "https://en.wikipedia.org/wiki/Jinul",
      },
      {
        term: "Samādhi–Prajñā Society",
        nativeTerm: "定慧結社",
        description:
          "Jinul's reform community, founded in 1190 and relocated to Mount Jogye in 1200. The historical origin of the Jogye Order as a meditation-centered reform of medieval Korean Buddhism.",
        url: "https://en.wikipedia.org/wiki/Jinul",
      },
      {
        term: "Seonbang",
        nativeTerm: "禪房",
        description:
          "The dedicated meditation hall within a Jogye training temple where kyolche retreats happen. Separated from public temple life; entry is reserved for monks and nuns formally committed to the three-month retreat.",
        url: "https://en.wikipedia.org/wiki/Jogye_Order",
      },
    ],
  },
  {
    slug: "kwan-um",
    name: "Kwan Um",
    tradition: "Seon",
    parentSlug: "jogye",
    aliases: ["kwan um", "kwan um school", "kwan um school of zen"],
    nativeNames: { ko: "관음선종", zh: "觀音禪宗" },
    summary:
      "The Kwan Um School of Zen is an international Seon organization founded in 1983 by the Korean master Seung Sahn (1927–2004), who was among the first Korean Zen teachers to establish a major presence in the West. The school's name refers to Gwaneum (Avalokiteshvara), the bodhisattva of compassion. Seung Sahn's teaching style combined the rigor of traditional Korean hwadu practice with a direct, humorous, and accessible approach adapted for Western students. His famous kong-an (koan) interviews, often beginning with 'What is this?', became the school's hallmark. The Kwan Um School maintains over a hundred Zen centers and groups across North America, Europe, Asia, and Africa, making it one of the most geographically widespread Zen organizations in the world.",
    practice:
      "Kwan Um practice centers on kong-an (公案) interviews and Seung Sahn’s teaching of ‘don’t-know mind,’ which reframes traditional hwadu intensity in simple, portable language. Students work with questions such as ‘What is this?’ or ‘What am I?’ in seated practice, but their understanding is regularly tested in kong-an interviews where responsiveness matters more than conceptual explanation. Daily forms usually include zazen, chanting, and 108 prostrations, while Yong Maeng Jong Jin retreats reproduce the concentrated atmosphere of Korean intensive practice in formats accessible to lay communities. The school’s distinctiveness lies in combining traditional Seon rigor with unusually direct and global teaching forms.",
    keyTexts: [
      {
        title: "Dropping Ashes on the Buddha",
        attributedTo: "Seung Sahn (ed. Stephen Mitchell)",
        period: "1976",
        description:
          "The book that introduced Seung Sahn's teaching to English-reading practitioners — letters, kong-an exchanges, and stories in his characteristic blunt, playful style. The classic entry to Kwan Um.",
        url: "https://kwanumzen.org/compass-of-zen",
      },
      {
        title: "The Compass of Zen",
        attributedTo: "Seung Sahn",
        period: "1997",
        description:
          "Seung Sahn's systematic overview — the Three Essentials, the Ten Gates of Kwan Um kong-an training, and his 'great question, great doubt, great courage' formula. The school's definitive textbook.",
        url: "https://kwanumzen.org/compass-of-zen",
      },
      {
        title: "Only Don't Know",
        attributedTo: "Seung Sahn",
        period: "1999",
        description:
          "Seung Sahn's teaching letters to students around the world — a generous sampler of how the school applies 'don't-know mind' to everyday life, relationship, work, and illness.",
        url: "https://kwanumzen.org",
      },
    ],
    keyConcepts: [
      {
        term: "Don't-know mind",
        description:
          "Seung Sahn's signature phrase — the non-conceptual openness before a kong-an resolves into an answer. Treated as identical to buddha-mind, and as the one thing every Kwan Um student is asked to keep.",
        url: "https://kwanumzen.org/teaching-letters",
      },
      {
        term: "Ten Gates",
        description:
          "Seung Sahn's simplified koan curriculum — ten representative kong-ans that unfold the school's core insights. A student's path moves systematically through these gates in teacher interview.",
        url: "https://kwanumzen.org",
      },
      {
        term: "Yong Maeng Jong Jin",
        nativeTerm: "용맹정진",
        description:
          "'Fierce, courageous, sustained practice' — the school's intensive retreat form (typically 3 or 7 days), adapted from Korean kyolche for a lay Western sangha. Early-rising, long zazen, kong-an interviews, 108 prostrations.",
        url: "https://kwanumzen.org",
      },
    ],
  },
  {
    slug: "taego-order",
    name: "Taego Order",
    tradition: "Seon",
    parentSlug: "seon",
    aliases: ["taego", "taego order", "태고종"],
    nativeNames: { ko: "태고종", zh: "太古宗" },
    summary:
      "The Taego Order (太古宗, 태고종) is the second largest Buddhist order in Korea, tracing its lineage to Taego Bou (1301–1382), a Goryeo dynasty master who received dharma transmission in the Linji lineage from the Chinese master Shiwu Qinggong (Stonehouse). Unlike the celibate Jogye Order, the Taego Order permits married clergy, a practice that became widespread during the Japanese colonial period (1910–1945) when Japanese Buddhist customs were imposed on Korean monastics. After Korean independence, the Buddhist community split over the issue of married clergy, with the celibate monks reconstituting as the Jogye Order and the married clergy organizing as the Taego Order. Despite this institutional distinction, both orders maintain the same fundamental Seon practice tradition rooted in hwadu meditation.",
    practice:
      "The Taego Order practices the same core hwadu meditation as the Jogye Order, investigating a critical phrase under a teacher’s guidance until discriminating thought weakens and direct knowing becomes possible. Its distinctive feature is not a different meditation method but a different institutional setting: because married clergy are permitted, rigorous Seon practice is often integrated with parish life, ritual duties, and family responsibilities. This gives Taego training a more visibly pastoral and public form while retaining the same Linji-derived contemplative backbone. The order therefore preserves classical Korean Seon methods in a clergy model that differs sharply from Jogye celibate monasticism.",
    keyTexts: [
      {
        title: "Record of Taego",
        nativeTitle: "太古和尚語錄",
        attributedTo: "Taego Bou",
        period: "14th c.",
        description:
          "The sayings and poems of the Goryeo master who carried the Chinese Linji lineage of Shiwu Qinggong into Korea. The founding document of the order that takes his name.",
        url: "https://en.wikipedia.org/wiki/Taego_Bou",
      },
    ],
    keyConcepts: [
      {
        term: "Married clergy",
        description:
          "The institutional feature that distinguishes the Taego Order from the celibate Jogye Order: permissible since Korean Buddhism reorganized after the Japanese colonial period, during which Japanese household-priest norms had spread.",
        url: "https://en.wikipedia.org/wiki/Taego_Order",
      },
      {
        term: "Taego–Shiwu lineage",
        description:
          "The direct Linji transmission from Shiwu Qinggong (Stonehouse) in China to Taego Bou in 14th-century Korea. Treated by the Taego Order as the orthodox line of Korean Seon.",
        url: "https://en.wikipedia.org/wiki/Taego_Bou",
      },
    ],
  },
  {
    slug: "obaku",
    name: "Ōbaku",
    tradition: "Zen",
    parentSlug: "linji",
    aliases: ["obaku", "ōbaku", "obaku zen", "黄檗宗"],
    nativeNames: { ja: "黄檗宗" },
    summary:
      "The Ōbaku school (黄檗宗) is the third major school of Japanese Zen, founded in 1661 by the Chinese Chan master Ingen Ryūki (Yinyuan Longqi, 1592–1673), who brought late-Ming Chinese Linji Chan to Japan. Named after Huangbo (Ōbaku) Mountain—the monastery of the great Tang dynasty master Huangbo Xiyun—the school established its headquarters at Manpuku-ji in Uji, near Kyoto. The Ōbaku school is distinctive for preserving Chinese liturgical forms, including the recitation of the nembutsu (nianfo) alongside Zen meditation, reflecting the syncretic Chan-Pure Land practice that had become standard in late-Ming China. The school also introduced Ming dynasty architectural styles, calligraphy, painting, and the sencha tea ceremony to Japan, profoundly influencing Japanese culture. Tetsugen Dōkō, a prominent figure in the early Ōbaku school (dharma heir of Muan Xingtao), is celebrated for his monumental project of carving the entire Chinese Buddhist canon (Ōbaku edition of the Tripitaka) in woodblock, a feat of devotion that took over a decade.",
    practice:
      "Ōbaku practice combines Chan-style zazen with recitation of the nembutsu (南無阿弥陀仏), preserving the Chan-Pure Land synthesis common in late-Ming Chinese Buddhism rather than the more sharply differentiated Japanese Zen style. Recitation is not treated as merely devotional: it can become a contemplative pivot when joined to the question ‘Who is it that recites the Buddha’s name?’ so that nembutsu and meditative inquiry reinforce each other. The school also maintains a distinctive liturgical, musical, and monastic culture inherited from Ming China, giving practice a strongly communal and ceremonial character. In Ōbaku, seated meditation, chanting, ritual form, and Pure Land invocation belong to one integrated discipline.",
    keyTexts: [
      {
        title: "Ōbaku Shingi",
        nativeTitle: "黄檗清規",
        attributedTo: "Ingen Ryūki",
        period: "1672",
        description:
          "'Ōbaku Pure Standards' — the founder's monastic rule for Manpuku-ji. Codifies the Chinese-style liturgy, chanting, and monastic organization that distinguishes Ōbaku from Rinzai and Sōtō.",
        url: "https://en.wikipedia.org/wiki/%C5%8Cbaku",
      },
      {
        title: "Ōbaku Edition of the Tripiṭaka",
        nativeTitle: "黄檗版大蔵経",
        attributedTo: "Tetsugen Dōkō",
        period: "1678",
        description:
          "The first complete Chinese Buddhist canon printed in Japan — 7,334 fascicles on roughly 60,000 woodblocks, carved under Tetsugen's leadership. Based on the Ming-dynasty Jiaxing edition; an extraordinary feat of devotion and scholarship still printed at Manpuku-ji today.",
        url: "https://en.wikipedia.org/wiki/Tetsugen_D%C5%8Dk%C5%8D",
      },
      {
        title: "Tetsugen's Three Lives Sermon",
        nativeTitle: "鐵眼説法",
        attributedTo: "Tetsugen Dōkō",
        period: "17th c.",
        description:
          "The famous teaching story in which Tetsugen, having twice used the money collected for the Tripiṭaka to feed famine victims, finally completes the canon on his third try. Ōbaku's paradigm for practice as compassionate engagement.",
        url: "https://en.wikipedia.org/wiki/Tetsugen_D%C5%8Dk%C5%8D",
      },
    ],
    keyConcepts: [
      {
        term: "Nembutsu kōan",
        nativeTerm: "念仏公案",
        description:
          "The characteristic Ōbaku combination: recite the Buddha's name while holding the question 'Who is it that recites?' The Chan–Pure Land synthesis turned into a concrete meditative exercise.",
        url: "https://en.wikipedia.org/wiki/%C5%8Cbaku",
      },
      {
        term: "Fucha ryōri",
        nativeTerm: "普茶料理",
        description:
          "The vegetarian 'universal tea cuisine' Ōbaku monks developed, blending Ming Chinese monastic cooking with Japanese ingredients. A living part of the school's culture — still served to retreat guests at Manpuku-ji.",
        url: "https://en.wikipedia.org/wiki/Fucha_ry%C5%8Dri",
      },
      {
        term: "Ming-style liturgy",
        description:
          "Ōbaku preserves Ming Chinese sutra-chanting melodies, instruments (especially the mokugyo wooden fish), and ritual forms largely unchanged since Ingen brought them in 1654. The school functions as a living museum of 17th-century Chinese Chan practice.",
        url: "https://en.wikipedia.org/wiki/Manpuku-ji",
      },
    ],
  },
  {
    slug: "other",
    name: "Other",
    tradition: "Zen",
    aliases: ["other"],
    summary:
      "This category includes significant figures in Chan and Zen history who do not fit neatly into the major school classifications. Among them are Layman Pang Yun, one of the greatest lay practitioners in Chan history, whose dialogues with Mazu Daoyi and Shitou Xiqian demonstrate that awakening is not confined to the monastic institution. Other figures include precursors and contemporaries of the Five Houses whose lineages developed independently or whose school affiliation is ambiguous in the historical sources.",
  },
];

const SCHOOL_BY_SLUG = new Map(
  SCHOOL_DEFINITIONS.map((definition) => [definition.slug, definition])
);

const SCHOOL_ALIAS_INDEX = new Map<string, SchoolDefinition>();

function normalizeKey(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

for (const definition of SCHOOL_DEFINITIONS) {
  SCHOOL_ALIAS_INDEX.set(normalizeKey(definition.name), definition);
  SCHOOL_ALIAS_INDEX.set(normalizeKey(definition.slug), definition);
  for (const alias of definition.aliases) {
    SCHOOL_ALIAS_INDEX.set(normalizeKey(alias), definition);
  }
}

const MASTER_SCHOOL_OVERRIDES: Array<{
  schoolSlug: string;
  names: string[];
}> = [
  {
    schoolSlug: "soto",
    names: ["dogen", "dōgen", "eihei dogen", "eihei dōgen", "yongping daoyuan"],
  },
  {
    schoolSlug: "indian-patriarchs",
    names: [
      "shakyamuni buddha",
      "mahakashyapa",
      "ananda",
      "shanakavasa",
      "upagupta",
      "dhritaka",
      "michaka",
      "vasumitra",
      "buddhanandi",
      "buddhamitra",
      "parshva",
      "punyayashas",
      "ashvaghosha",
      "kapimala",
      "nagarjuna",
      "aryadeva",
      "rahulata",
      "sanghanandi",
      "gayashata",
      "kumarata",
      "jayata",
      "vasubandhu",
      "manorhita",
      "haklena",
      "vasasita",
      "punyamitra",
      "prajnatara",
      "simha",
    ],
  },
  {
    schoolSlug: "other",
    names: ["pang yun", "layman pang", "taigu puyu", "taigo pou"],
  },
  {
    schoolSlug: "early-chan",
    names: [
      "mahasattva fu",
      "niutou farong",
      "guifeng zongmi",
      "zizhou zhishen",
      "zizhou chuji",
      "jingzhong wuxiang",
      "baotang wuzhu",
      "heze shenhui",
      "yuquan shenxiu",
      "nanyang huizhong",
      "yongjia xuanjue",
      "cizhou faru",
      "songshan puji",
      "jingzhong shenhui",
      "suizhou daoyuan",
      "shengshou nanyin",
      "songshan huian",
      "laoan",
      "niutou zhiyan",
    ],
  },
  {
    schoolSlug: "qingyuan-line",
    names: ["longji shaoxiu", "ruiyan shiyan", "yantou quanhuo", "nanyue daoxuan"],
  },
  {
    schoolSlug: "nanyue-line",
    names: [
      "nanyue huairang",
      "mazu daoyi",
      "baizhang huaihai",
      "xitang zhizang",
      "yanguan qian",
      "wufeng changguan",
      "nanquan puyuan",
      "guizong zhichang",
      "damei fachang",
      "panshan baoji",
      "luzu baoyun",
      "mayu baoche",
      "wujiu youxuan",
      "zhangjing huaiyun",
      "guishan daan",
      "dasui fazhen",
      "fenzhou wuye",
    ],
  },
  {
    schoolSlug: "linji",
    names: ["huanglong huiji", "zhenjing kewen", "sansheng huiran", "xuan huaichang"],
  },
  {
    schoolSlug: "yangqi-line",
    names: ["xutang zhiyu", "poan zuxian", "wuzhun shifan", "pingshan chulin"],
  },
  {
    schoolSlug: "caodong",
    names: ["kumu daocheng", "changlu qingliao"],
  },
  {
    schoolSlug: "guiyang",
    names: ["hsuan hua", "xuanhua", "lingyun zhiqin"],
  },
  {
    schoolSlug: "fayan",
    names: ["fayan wenyi", "qingliang wenyi", "tiantai deshao", "yongming yanshou"],
  },
  {
    schoolSlug: "rinzai",
    names: [
      "nanpo jomyo",
      "nampo jōmyō",
      "daio kokushi",
      "suio genro",
      "suiō genro",
      "koryu osaka",
      "koryū osaka",
      "mingan rongxi",
      "myōan eisai",
      "myoan eisai",
    ],
  },
  {
    schoolSlug: "sanbo-zen",
    names: ["kubota jiun", "kubota ji'un", "yamada ryoun", "yamada ryōun"],
  },
  {
    schoolSlug: "seon",
    names: [
      "toui",
      "wonhyo",
      "naong hyegeun",
      "hongcheok",
      "hyecheol",
      "beomil",
      "hyeonuk",
      "toyun",
      "muyeom",
      "chiseon doheon",
      "ieom",
      "baegun gyeonghan",
      "baegun",
      "muhak jacho",
      "muhak",
      "hwanam honsu",
    ],
  },
  {
    schoolSlug: "jogye",
    names: [
      "bojo jinul",
      "chinak hyesim",
      "chinul hyesim",
      "chin'gak hyesim",
      "gihwa",
      "seosan hyujeong",
      "samyeongdang yujeong",
      "samyeongdang",
      "gyeongheo seongu",
      "gyeongheo",
      "mangong wolmyeon",
      "mangong",
      "hanam jungwon",
      "hanam",
      "hyobong haknul",
      "hyobong",
      "gobong gyeonguk",
      "gobong",
      "seongcheol",
      "kusan sunim",
      "daehaeng",
      "beopjeong",
      "jinje",
      "suwol",
      "hyewol hyemyeong",
      "hyewol",
      "dongsan hyeil",
      "dongsan",
      "yongseong chinjong",
      "yongseong",
    ],
  },
  {
    schoolSlug: "kwan-um",
    names: ["seung sahn"],
  },
  {
    schoolSlug: "taego-order",
    names: ["taego bou"],
  },
  {
    schoolSlug: "obaku",
    names: [
      "ingen ryuki",
      "ingen ryūki",
      "tetsugen doko",
      "tetsugen dōkō",
      "muan xingtao",
      "mokuan shōtō",
      "jifei ruyi",
      "sokuhi nyoitsu",
    ],
  },
  {
    schoolSlug: "thien",
    names: [
      "vinitaruci",
      "vo ngon thong",
      "van hanh",
      "phap hien",
      "thao duong",
      "khuong viet",
      "tue trung thuong si",
    ],
  },
  {
    schoolSlug: "truc-lam",
    names: ["tran nhan tong", "phap loa", "huyen quang"],
  },
  {
    schoolSlug: "lam-te",
    names: ["minh hai phap bao"],
  },
  {
    schoolSlug: "plum-village",
    names: ["thich nhat hanh", "chan khong"],
  },
];

export function getSchoolDefinition(slug: string): SchoolDefinition | null {
  return SCHOOL_BY_SLUG.get(slug) ?? null;
}

export function getSchoolDefinitions(): SchoolDefinition[] {
  return SCHOOL_DEFINITIONS;
}

export function normalizeSchoolLabel(raw: string | null | undefined): SchoolDefinition | null {
  if (!raw || !raw.trim()) return null;
  return SCHOOL_ALIAS_INDEX.get(normalizeKey(raw)) ?? null;
}

export function determineSchoolDefinition(input: {
  rawLabel?: string | null;
  names?: string[];
}): SchoolDefinition | null {
  const normalizedNames = (input.names ?? []).map(normalizeKey);

  for (const override of MASTER_SCHOOL_OVERRIDES) {
    if (override.names.some((name) => normalizedNames.includes(normalizeKey(name)))) {
      return getSchoolDefinition(override.schoolSlug);
    }
  }

  return normalizeSchoolLabel(input.rawLabel ?? null);
}

export function getSchoolAncestors(slug: string): SchoolDefinition[] {
  const chain: SchoolDefinition[] = [];
  const visited = new Set<string>();
  let current = getSchoolDefinition(slug);

  while (current && !visited.has(current.slug)) {
    visited.add(current.slug);
    chain.unshift(current);
    current = current.parentSlug ? getSchoolDefinition(current.parentSlug) : null;
  }

  return chain;
}
