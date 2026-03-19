import { stripDiacritics } from "./search-tokens";

export interface SchoolDefinition {
  slug: string;
  name: string;
  tradition: string;
  parentSlug?: string;
  aliases: string[];
  summary: string;
  practice?: string;
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
  },
  {
    slug: "chan",
    name: "Chan",
    tradition: "Chan",
    aliases: ["chan", "zen"],
    summary:
      "Chan (禪) is the Chinese Buddhist meditation tradition that emerged from the encounter between Indian Buddhism and Chinese culture, becoming the most influential school of East Asian Buddhism. The word 'Chan' derives from the Sanskrit dhyana (meditation). Chan emphasizes direct experience of awakened mind over scriptural study, formalized by the motto attributed to Bodhidharma: 'A special transmission outside the scriptures; no dependence on words and letters; directly pointing to the human mind; seeing one's nature and becoming Buddha.' During the Tang and Song dynasties, Chan developed its characteristic methods—encounter dialogues, koan practice, intensive sitting, and the teacher-student relationship as the vehicle of transmission. The tradition crystallized into the Five Houses (Caodong, Linji, Yunmen, Guiyang, and Fayan), each with distinctive teaching styles. Chan was transmitted to Korea (as Seon), Japan (as Zen), and Vietnam (as Thien), profoundly shaping the religious, artistic, and philosophical culture of East Asia.",
    practice:
      "Chan encompasses a spectrum of meditation methods unified by the commitment to direct experiential realization over doctrinal study. The foundational practice is zuochan (sitting meditation), performed in lotus or half-lotus posture with regulated breathing and upright spine, complemented by distinctive methods within each school: silent illumination (mozhao) in Caodong, keyword investigation (huatou/kanhua) in Linji, and one-word barriers in Yunmen. Encounter dialogue between teacher and student in the private interview (sanshi/dokusan) serves as the primary vehicle for testing and deepening realization. Intensive group retreats (chanqi), typically lasting seven days with extended daily sitting, and the integration of manual labor (puqing) into practice, distinguish Chan's communal monastic training from other Buddhist traditions.",
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
      "Early Chan practice centered on Bodhidharma’s method of ‘wall-gazing’ (biguan)—sustained seated meditation aimed at directly perceiving the mind’s nature. Daoxin and Hongren’s East Mountain teaching systematized this into communal monastic sitting, emphasizing the ‘samadhi of one practice’ (yixing sanmei) and Hongren’s ‘maintaining awareness of the mind’ (shouyi). The Northern School under Shenxiu taught a graduated purification of mental defilements through the contemplative method outlined in his Guanxin Lun, while the Southern School championed by Huineng and Shenhui insisted on sudden recognition that mind is originally pure. The Oxhead (Niutou) school offered a third approach, emphasizing the emptiness of mind itself and the non-arising of thoughts, influenced by Madhyamaka philosophy.",
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
      "Practice in the Qingyuan line flows from Shitou Xiqian’s Sandokai, which describes the interpenetration of the absolute and relative as the ground of meditation. This lineage tends toward subtle contemplative investigation—sitting with the interplay of difference and unity rather than seeking dramatic breakthrough. This orientation gave rise to both the silent illumination of the Caodong school and the poetic precision of the Yunmen school.",
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
  },
  {
    slug: "caodong",
    name: "Caodong",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["caodong", "tsaodong", "曹洞"],
    summary:
      "The Caodong school (曹洞宗) is one of the Five Houses of Chan, founded in the ninth century by Dongshan Liangjie and his student Caoshan Benji—the school's name combines the first characters of their mountain names. Its central philosophical contribution is the Five Ranks (wuwei), a dialectical framework describing five modes of relationship between the absolute (emptiness) and the relative (form). Where the Linji school emphasized dramatic breakthrough through shouts and blows, the Caodong tradition developed a subtler approach centered on 'silent illumination' (mozhao chan)—objectless sitting in which awareness naturally illuminates itself without the pursuit of any particular experience. Hongzhi Zhengjue, the Song dynasty master at Tiantong Monastery, was the school's greatest literary voice, composing the verses for the Book of Serenity and articulating silent illumination as a formal practice. The Caodong school nearly went extinct during the Song dynasty before being revived through the extraordinary cross-lineage transmission from Dayang Jingxuan through the Linji master Fushan Fayuan to Touzi Yiqing. Through Furong Daokai and subsequent masters, the revived Caodong tradition reached Tiantong Rujing, who transmitted it to Dogen and thus to all of Japanese Soto Zen.",
    practice:
      "The Caodong school’s signature practice is silent illumination (mozhao chan), an objectless form of sitting meditation in which the practitioner rests in open, non-grasping awareness without pursuing any particular experience or state. Hongzhi Zhengjue described this as ‘the field of boundless emptiness’ where awareness naturally illuminates itself without effort. The Five Ranks of Dongshan Liangjie complement seated practice with a dialectical framework for understanding the interplay of absolute and relative in direct experience.",
  },
  {
    slug: "soto",
    name: "Soto",
    tradition: "Zen",
    parentSlug: "caodong",
    aliases: ["soto", "sōtō", "soto zen", "caodong/soto", "曹洞宗"],
    summary:
      "The Soto school (曹洞宗) is the Japanese continuation of the Chinese Caodong tradition, founded by Eihei Dogen (1200–1253) after his training with Tiantong Rujing in China. It is the largest Zen denomination in Japan. Soto's central practice is shikantaza ('just sitting')—zazen practiced without koans, without seeking enlightenment, and without any object or technique, understood not as a means to awakening but as awakening's direct expression. Dogen articulated this in his masterwork the Shobogenzo, one of the most profound philosophical texts in world religious literature, and in his practical manual the Fukanzazengi. The school's second great figure, Keizan Jokin (1264–1325), founded Sojiji Temple and made Soto practice accessible to a broad Japanese population through the integration of esoteric ritual and ancestor veneration. Together, Eiheiji (Dogen's temple) and Sojiji serve as the school's two head monasteries. In the modern era, the Soto tradition has been carried to the West by teachers including Shunryu Suzuki (San Francisco Zen Center), Taisen Deshimaru (Association Zen Internationale, Europe), Taizan Maezumi (Zen Center of Los Angeles), and Dainin Katagiri (Minnesota Zen Center), establishing vibrant practice communities across North America and Europe.",
    practice:
      "Soto Zen’s central practice is shikantaza (‘just sitting’)—zazen without koans, breath-counting, or any technique, understood not as a means to awakening but as its direct expression. Dogen articulated this in the Fukanzazengi, the school’s essential meditation manual, teaching that practice and realization are one (shusho ittō). Monastic life extends shikantaza into every activity through oryoki (formal meals), samu (work practice), and kinhin (walking meditation), treating each moment as complete practice.",
  },
  {
    slug: "linji",
    name: "Linji",
    tradition: "Chan",
    parentSlug: "nanyue-line",
    aliases: ["linji", "臨済"],
    summary:
      "The Linji school (臨済宗) is the most dynamic and influential of the Five Houses of Chan, founded by Linji Yixuan (d. 866) in the lineage of Mazu Daoyi through Baizhang Huaihai and Huangbo Xiyun. Linji's teaching is characterized by fierce directness—he used shouts (katsu), blows, and paradoxical exchanges to shatter students' conceptual thinking and precipitate immediate awakening. His 'True Person of No Rank' teaching and his four-fold classification of shouts became foundational for the school. During the Song dynasty, the Linji school divided into the Yangqi and Huanglong branches, with the Yangqi line eventually becoming dominant. The school produced the two greatest koan collections: the Blue Cliff Record (Yuanwu Keqin's commentary on Xuedou Chongxian's verses) and the Gateless Barrier (Wumen Huikai's forty-eight cases). Dahui Zonggao championed the huatou (keyword) method of koan practice—concentrating on a single critical phrase until all conceptual thinking is exhausted—which became the standard Linji approach. Through transmission to Japan, Korea, and Vietnam, the Linji school became the most geographically widespread form of Chan/Zen Buddhism.",
    practice:
      "The Linji school’s primary meditation method is huatou (話頭) practice, championed by Dahui Zonggao, in which the practitioner concentrates on a single critical phrase—such as ‘Mu’ or ‘What is this?’—sustaining ‘great doubt’ until conceptual thinking shatters entirely. This is complemented by encounter dialogue in sanshi (teacher interview), where the master tests the student’s understanding through unexpected exchanges. Linji Yixuan’s teaching urged students to find the ‘True Person of No Rank’ through fierce directness rather than gradual cultivation.",
  },
  {
    slug: "rinzai",
    name: "Rinzai",
    tradition: "Zen",
    parentSlug: "linji",
    aliases: ["rinzai", "linji/rinzai", "臨済宗"],
    summary:
      "The Rinzai school (臨済宗) is the Japanese form of the Chinese Linji tradition, transmitted to Japan through multiple lineages during the Kamakura period (1185–1333). The school's defining figure is Hakuin Ekaku (1686–1769), who single-handedly revived and systematized Rinzai practice after a period of decline. Hakuin developed the structured koan curriculum that remains standard today—beginning with the Mu koan or the sound of one hand clapping, then progressing through increasingly subtle layers of inquiry. His emphasis on 'great doubt, great faith, great determination' as the three pillars of practice became definitive. The modern Rinzai school is organized primarily through the O-To-Kan lineage: Nanpo Jomyo (Daio Kokushi) received transmission from the Chinese master Xutang Zhiyu, transmitted to Shuho Myocho (Daito Kokushi, founder of Daitokuji), who transmitted to Kanzan Egen (founder of Myoshinji). These two temple complexes—Daitokuji and Myoshinji—and their extensive branch networks form the institutional backbone of modern Rinzai Zen. The school profoundly influenced Japanese culture, including the tea ceremony, calligraphy, ink painting, garden design, and the martial arts.",
    practice:
      "Rinzai Zen is defined by Hakuin Ekaku’s systematized koan curriculum, in which practitioners work through a structured sequence of koans in private sanzen interviews, beginning with Mu or ‘the sound of one hand’ and progressing through increasingly subtle stages. Hakuin emphasized ‘great doubt, great faith, and great determination’ as the three pillars of practice. Intensive sesshin retreats, with many hours of daily zazen and frequent sanzen interviews, create the conditions for great doubt to ripen into kensho (seeing one’s true nature).",
  },
  {
    slug: "yangqi-line",
    name: "Yangqi line",
    tradition: "Chan",
    parentSlug: "linji",
    aliases: ["linji/yangqi", "yangqi", "yangqi line"],
    summary:
      "The Yangqi line is the dominant sub-branch of the Linji school, founded by Yangqi Fanghui (992–1049), a student of Shishuang Chuyuan. It emerged alongside the Huanglong branch when the Linji school divided in the Song dynasty, and eventually absorbed and superseded the Huanglong line to become the sole surviving Linji lineage. The Yangqi branch is characterized by an unpredictable, spontaneous teaching style—Yangqi himself was known for playful and surprising responses that kept students off balance. The line produced many of the most important figures in later Chan history: Wuzu Fayan, Yuanwu Keqin (compiler of the Blue Cliff Record), Dahui Zonggao (champion of huatou practice, who famously burned the Blue Cliff Record's printing blocks), and Wumen Huikai (compiler of the Gateless Barrier). Through Xutang Zhiyu's transmission to Nanpo Jomyo, the Yangqi line became the foundation of virtually all Japanese Rinzai Zen. The Song dynasty hermit-poet Shiwu Qinggong (Stonehouse) and the intense practitioner Gaofeng Yuanmiao also belong to this lineage.",
    practice:
      "The Yangqi line championed huatou meditation, in which the practitioner takes up a single critical phrase and investigates it with total concentration until conceptual thinking is exhausted. Dahui Zonggao, the line’s most influential master, promoted this ‘shortcut’ method (jiejing) as the most direct path to awakening, accessible to monastics and laypeople alike. The Yangqi teaching style valued spontaneity and unpredictability in encounters, using surprise to catalyze the student’s breakthrough.",
  },
  {
    slug: "yunmen",
    name: "Yunmen",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["yunmen", "雲門"],
    summary:
      "The Yunmen school (雲門宗) is one of the Five Houses of Chan, founded by Yunmen Wenyan (864–949), a student of Xuefeng Yicun. It is renowned for the extraordinary economy and precision of its teaching language—Yunmen's responses were often a single word or phrase that functioned as a complete teaching, known as 'one-word barriers.' His famous utterances include 'Every day is a good day,' 'A dried shit stick' (in response to 'What is Buddha?'), and 'The whole world is medicine—what is your self?' The Yunmen school valued linguistic virtuosity not as literary display but as a form of direct pointing: each word chosen to cut through the student's conceptual mind with surgical precision. Xuedou Chongxian, the school's greatest literary figure, selected and composed verses on the hundred cases that became the basis for the Blue Cliff Record, arguably the supreme literary achievement of the Chan tradition. Though the Yunmen school did not survive as an independent institution beyond the Song dynasty, its spirit permeated all subsequent Chan through the koan collections, and its emphasis on concise, powerful expression continues to shape Zen teaching style to this day.",
    practice:
      "The Yunmen school’s practice centered on the ‘one-word barrier’ (yizi guan), in which the master’s single-word or terse response functioned as both a wall blocking conceptual thought and a gate to direct realization. Practitioners meditated on these condensed utterances—such as ‘Dried shit stick’ or ‘Every day is a good day’—until the words dissolved into understanding beyond language. Yunmen called this ‘cutting off the myriad streams,’ using language with such precision that a single phrase could terminate all discursive thought.",
  },
  {
    slug: "fayan",
    name: "Fayan",
    tradition: "Chan",
    parentSlug: "qingyuan-line",
    aliases: ["fayan", "法眼"],
    summary:
      "The Fayan school (法眼宗) is one of the Five Houses of Chan, founded by Fayan Wenyi (885–958), a dharma heir of Luohan Guichen in the lineage of Xuefeng Yicun and Shitou Xiqian. The school is named after Fayan's monastery on Mount Qingliang in Jinling (modern Nanjing). During the Five Dynasties and Ten Kingdoms period, the Fayan school became the dominant Chan school in the Southern Tang and Wuyue kingdoms. Fayan Wenyi's teaching emphasized the harmony of the three teachings—Buddhism, Confucianism, and Daoism—and sought to place culture and learning in service of insight rather than rejecting them. His Ten Admonishments for the Lineage (Zongmen shigui lun) critiqued the decline of Chan practice in his era. Key figures include Tiantai Deshao (891–972), who served as national preceptor of Wuyue and revitalized the Tiantai school alongside his Chan teaching, and Yongming Yanshou (904–975), regarded as the third Fayan patriarch, who authored the monumental Zongjing lu (Records of the Mirror of the Source) and initiated the Chan-Pure Land synthesis that shaped all subsequent Chinese Buddhism. The Fayan school was the first Chan lineage to gain recognition at the Song court, but it did not survive as an independent institution beyond the early Song dynasty, its methods and insights absorbed into the Linji tradition.",
    practice:
      "The Fayan school's practice integrated doctrinal understanding with direct Chan realization, drawing on Huayan philosophy's vision of the mutual interpenetration of all phenomena. Fayan Wenyi taught students to see that 'the myriad dharmas return to the one'—and then to ask where the one returns. This dialectical questioning, rooted in both meditation and philosophical inquiry, distinguished the school from the more anti-intellectual tendencies of other Chan houses. Yongming Yanshou extended this synthetic approach by combining Chan meditation with Pure Land recitation, sutra study, and Huayan contemplation, creating a comprehensive practice framework.",
  },
  {
    slug: "guiyang",
    name: "Guiyang",
    tradition: "Chan",
    parentSlug: "nanyue-line",
    aliases: ["guiyang", "潙仰"],
    summary:
      "The Guiyang school (潙仰宗) was the earliest of the Five Houses of Chan to be formally recognized, founded by Guishan Lingyou (771–853) and his student Yangshan Huiji (807–883) in the lineage of Baizhang Huaihai. The school's name combines the first characters of their respective mountains. The Guiyang school was distinguished by its refined and indirect teaching methods, particularly the use of ninety-seven circular figures (yuan-xiang) to express the relationship between the absolute and relative—a sophisticated non-verbal language that complemented the verbal exchanges used by other schools. Where the Linji school employed shouts and blows, the Guiyang tradition favored subtle gestures, drawn symbols, and the interplay of 'host' and 'guest' as pedagogical tools. Key figures include Xiangyan Zhixian, who awakened at the sound of a pebble striking bamboo after burning all his scholarly notes, and Liu Tiemo ('Iron Grindstone Liu'), a formidable female dharma heir of Guishan whose sharp dialogues ground down all challengers. In the modern era, the Guiyang lineage was revived by the great master Xuyun (1840–1959), who transmitted it to Hsuan Hua. The Guiyang school did not survive as an independent institution beyond the Song dynasty, but its insights into symbolic communication and the non-verbal dimensions of transmission influenced the broader Chan tradition.",
    practice:
      "The Guiyang school employed ninety-seven circular figures (yuan-xiang) as contemplative tools—drawn symbols expressing the interplay of absolute and relative beyond verbal explanation. In practice encounters, master and student exchanged drawn figures and symbolic gestures rather than words, creating a non-verbal contemplative language. The school’s meditation also trained practitioners in the dynamic interplay of ‘host’ and ‘guest,’ recognizing how awakened mind and conditioned experience illuminate each other in every moment.",
  },
  {
    slug: "sanbo-zen",
    name: "Sanbo-Zen",
    tradition: "Zen",
    aliases: ["sanbo", "sanbo-zen", "sanbō-zen", "sanbo kyodan"],
    summary:
      "Sanbo-Zen (三宝禅, formerly Sanbo Kyodan, 'Three Treasures Association') is a modern Zen school founded by Yasutani Hakuun (1885–1973) that integrates Soto Zen's emphasis on shikantaza with the Rinzai tradition's systematic koan curriculum. Yasutani's teacher, Harada Daiun Sogaku, had pioneered this synthesis by combining his Soto training with extensive Rinzai koan study under several masters. The Sanbo-Zen approach offers practitioners both objectless sitting and a structured koan path, beginning with the Mu koan and progressing through the traditional Rinzai curriculum. Under the leadership of Yamada Koun (1907–1989), the school became one of the most important vehicles for transmitting Zen to the West. Yamada's radical openness—he trained Catholic priests and nuns, Protestant ministers, and practitioners of other faiths alongside traditional Buddhist students—transformed Zen from a Japanese cultural phenomenon into a genuinely international contemplative practice. Robert Aitken (Diamond Sangha, Hawaii) and Ruben Habito (Maria Kannon Zen Center, Dallas) are among the school's notable Western-based teachers. The school is headquartered in Kamakura, Japan.",
    practice:
      "Sanbo-Zen uniquely synthesizes Soto shikantaza with the Rinzai koan curriculum, as developed by Harada Daiun Sogaku and refined by Yasutani Hakuun. Practitioners alternate between periods of objectless sitting and intensive koan investigation, beginning with Mu and progressing through the traditional Rinzai sequence. Under Yamada Koun, the school adapted its methods for lay practitioners and non-Buddhist contemplatives, emphasizing that kensho is accessible regardless of religious affiliation.",
  },
  {
    slug: "thien",
    name: "Thiền",
    tradition: "Thiền",
    parentSlug: "chan",
    aliases: ["thien", "thiền", "vietnamese zen", "vietnamese chan"],
    summary:
      "Thiền (禪) is the Vietnamese tradition of Chan Buddhism, brought to Vietnam through multiple transmissions from China beginning as early as the sixth century. The first Thiền school was founded by Vinitaruci (d. 594), an Indian monk who had studied with the Third Patriarch Sengcan before traveling to Vietnam. The second school was established by Vô Ngôn Thông (d. 826), a Chinese disciple of Baizhang Huaihai. Vietnamese Thiền developed a distinctive character, readily combining meditation practice with Pure Land devotion, Confucian ethics, and indigenous Vietnamese spirituality. The tradition produced several uniquely Vietnamese developments, including the Trúc Lâm (Bamboo Forest) school founded by Emperor Trần Nhân Tông in 1299, and the Liễu Quán dharma line of the Lâm Tế school, which became the dominant lineage in central and southern Vietnam.",
    practice:
      "Vietnamese Thiền characteristically combines seated meditation with Pure Land devotion (niệm Phật), sutra chanting, and integration of practice into daily life—a synthesis reflecting Vietnam’s openness to multiple Buddhist streams. Rather than viewing this as dilution of ‘pure’ Chan, the tradition understands it as skillful integration of complementary methods suited to different temperaments. The relative emphasis on meditation versus devotional practice varies by lineage and teacher.",
  },
  {
    slug: "lam-te",
    name: "Lâm Tế",
    tradition: "Thiền",
    parentSlug: "linji",
    aliases: ["lam te", "lâm tế", "vietnamese linji", "linji vietnam"],
    summary:
      "The Lâm Tế school is the Vietnamese form of the Chinese Linji tradition, formally established in Vietnam during the seventeenth century by Chinese monks carrying the late-Ming Linji revival lineage of Miyun Yuanwu. The most important transmission was through Nguyên Thiều (1648–1728), a Chinese monk from Guangdong who arrived in Vietnam around 1665–1677 and established the Linji lineage in the central and southern regions. His dharma grandson Liễu Quán (1670–1742) became the first native Vietnamese to receive Linji dharma transmission, founding the Liễu Quán dharma line that 'Vietnamized' the tradition and remains the dominant Buddhist lineage in central Vietnam to this day. Thích Nhất Hạnh (1926–2022), the globally influential Zen teacher and peace activist, was the 42nd generation of the Lâm Tế school and 8th generation of the Liễu Quán line.",
    practice:
      "The Lâm Tế school practices huatou (thoại đầu) investigation in the tradition transmitted from late-Ming Chinese Linji Chan, adapted to Vietnamese monastic life. The Liễu Quán dharma line developed a practice integrating intensive meditation with sutra study, chanting, and community service. Thích Nhất Hạnh, as a 42nd-generation Lâm Tế master, drew on this tradition’s unity of contemplation and engagement as the foundation for his later development of socially engaged Buddhist practice.",
  },
  {
    slug: "truc-lam",
    name: "Trúc Lâm",
    tradition: "Thiền",
    parentSlug: "thien",
    aliases: ["truc lam", "trúc lâm", "bamboo forest", "竹林"],
    summary:
      "The Trúc Lâm (竹林, Bamboo Forest) school is the only indigenous Vietnamese Zen tradition, founded in 1299 by Trần Nhân Tông (1258–1308), the third emperor of the Trần dynasty who abdicated the throne to become a monk. After leading Vietnam to victory against two Mongol invasions, Trần Nhân Tông retired to Yên Tử Mountain and unified the three existing Vietnamese Thiền schools—the Vinitaruci, Vô Ngôn Thông, and Thảo Đường lineages—into a single school. The Trúc Lâm tradition was continued by two more patriarchs, Pháp Loa (1284–1330) and Huyền Quang (1254–1334), before gradually declining as a distinct school. It was revived in the twentieth century by Thích Thanh Từ as a modern Vietnamese contemplative movement with monasteries across the country.",
    practice:
      "The Trúc Lâm school, as revived by Thích Thanh Từ, emphasizes seated meditation rooted in Trần Nhân Tông’s synthesis of the three original Vietnamese Thiền lineages. Practitioners focus on ‘knowing the mind and seeing the nature’ (tri tâm kiến tánh), often working with the hwadu ‘Who is dragging this corpse around?’—attributed to the school’s founder. The modern revival stresses meditation-centered practice, distinguishing itself from the more ritualistic forms of Vietnamese Buddhism.",
  },
  {
    slug: "plum-village",
    name: "Plum Village",
    tradition: "Thiền",
    parentSlug: "lam-te",
    aliases: ["plum village", "lang mai", "làng mai", "order of interbeing"],
    summary:
      "The Plum Village tradition is a modern school of engaged Buddhism founded by Thích Nhất Hạnh (1926–2022) in the Lâm Tế (Vietnamese Linji) lineage. Named after Plum Village, the practice center established in the Dordogne region of France in 1982, the tradition emphasizes mindfulness in daily life, engaged social action, and the integration of meditation practice with ethical living. Thích Nhất Hạnh developed the practice of the Fourteen Mindfulness Trainings as the foundation of the Order of Interbeing (Tiếp Hiện), established in 1966 during the Vietnam War. The tradition's teaching methods—walking meditation, mindful eating, dharma sharing circles, and the practice of Beginning Anew—have made Zen practice accessible to millions worldwide. With monasteries and practice centers on five continents and hundreds of local sanghas, Plum Village is one of the largest Buddhist communities in the Western world.",
    practice:
      "Plum Village practice integrates mindfulness into every activity—walking meditation, mindful eating, mindful breathing, deep listening—making formal sitting one element within a comprehensive framework of engaged awareness. The Fourteen Mindfulness Trainings of the Order of Interbeing serve as both ethical guidelines and contemplative practices, addressing consumption, speech, anger, and social responsibility. Practitioners also engage in Beginning Anew ceremonies, dharma sharing circles, and ‘lazy days,’ creating a practice culture distinct from the intensive retreat model of traditional Zen.",
  },
  {
    slug: "seon",
    name: "Seon",
    tradition: "Seon",
    parentSlug: "chan",
    aliases: ["seon", "선", "korean zen", "korean chan"],
    summary:
      "Seon (禪, 선) is the Korean tradition of Chan Buddhism, introduced to the Korean peninsula beginning in the seventh century by monks who had studied in Tang dynasty China. The earliest transmissions came through figures like Toui, who received dharma transmission from Baizhang Huaihai's lineage and established the first Seon school upon returning to Korea. During the Goryeo dynasty, Bojo Jinul (1158–1210) became the tradition's most influential reformer, synthesizing Seon meditation with Hwaeom (Huayan) doctrinal study and establishing the Jogye Order, which remains the dominant Buddhist institution in Korea today. Korean Seon developed a distinctive character: it preserved the intensity of Tang dynasty Chan practice—particularly the hwadu (huatou) method of koan investigation—while integrating it with a broader Buddhist framework. The tradition also maintained a strong emphasis on extended silent retreat, culminating in the modern Korean practice of three-month intensive meditation seasons (kyolche). Major modern figures include Gyeongheo, who revived the dying Seon tradition in the late nineteenth century, and Seongcheol, who insisted on sudden awakening as the only authentic path.",
    practice:
      "Korean Seon preserves hwadu (話頭) investigation as its primary method: the practitioner sustains intense questioning of a single critical phrase—most commonly ‘What is this?’ (이뫓고)—until all conceptual discrimination is exhausted. The tradition’s kyolche (結制) system structures practice into three-month intensive retreat seasons held twice yearly, with monastics maintaining a demanding schedule of sitting and walking meditation from 3 AM to 9 PM. Korean Seon insists on sudden awakening (dono), rejecting gradual approaches and demanding total commitment to the hwadu.",
  },
  {
    slug: "jogye",
    name: "Jogye",
    tradition: "Seon",
    parentSlug: "seon",
    aliases: ["jogye", "jogye order", "조계종", "chogye"],
    summary:
      "The Jogye Order (조계종, 曹溪宗) is the largest and most influential Buddhist order in Korea, tracing its spiritual lineage to the Sixth Patriarch Huineng's mountain, Caoxi (Jogye in Korean). Founded in its original form by Bojo Jinul in the twelfth century and reconstituted in the twentieth century after Japanese colonial suppression, the Jogye Order represents the mainstream of Korean Seon practice. The order's distinctive approach combines rigorous hwadu (huatou) meditation with monastic discipline, seasonal intensive retreats (kyolche), and the integration of doctrinal study. The Jogye Order maintains over two thousand temples across South Korea and operates the country's major monastic training centers, including Haeinsa, Songgwangsa, and Tongdosa. In the modern era, the order has produced towering figures including Gyeongheo Seongu, who single-handedly revived Korean Seon practice; Mangong, Hyobong, and Gobong, who maintained rigorous meditation standards; and Seongcheol, whose uncompromising insistence on sudden awakening sparked nationwide debate about the nature of enlightenment.",
    practice:
      "The Jogye Order’s standard practice is hwadu investigation, typically working with ‘What is this?’ (이뫓고) under a seon master’s guidance in private interviews. Practice is structured around twice-yearly kyolche retreat seasons—summer and winter—during which monastics enter three months of intensive silent meditation in the seonbang (meditation hall). Monastic formation integrates sutra study, prostration practice, and chanting with the central hwadu method.",
  },
  {
    slug: "kwan-um",
    name: "Kwan Um",
    tradition: "Seon",
    parentSlug: "jogye",
    aliases: ["kwan um", "kwan um school", "kwan um school of zen"],
    summary:
      "The Kwan Um School of Zen is an international Seon organization founded in 1983 by the Korean master Seung Sahn (1927–2004), who was among the first Korean Zen teachers to establish a major presence in the West. The school's name refers to Gwaneum (Avalokiteshvara), the bodhisattva of compassion. Seung Sahn's teaching style combined the rigor of traditional Korean hwadu practice with a direct, humorous, and accessible approach adapted for Western students. His famous kong-an (koan) interviews, often beginning with 'What is this?', became the school's hallmark. The Kwan Um School maintains over a hundred Zen centers and groups across North America, Europe, Asia, and Africa, making it one of the most geographically widespread Zen organizations in the world.",
    practice:
      "Kwan Um practice centers on kong-an (公案) interviews, in which students face questions such as ‘What is this?’ or original compositions by Seung Sahn, cultivating ‘don’t-know mind’ as the essential orientation. Daily practice includes seated meditation with attention to ‘What am I?’, 108 prostrations, and chanting. Intensive retreats called Yong Maeng Jong Jin (‘valiant effort’) range from weekends to ninety-day sessions in the Korean kyolche tradition.",
  },
  {
    slug: "taego-order",
    name: "Taego Order",
    tradition: "Seon",
    parentSlug: "seon",
    aliases: ["taego", "taego order", "태고종"],
    summary:
      "The Taego Order (太古宗, 태고종) is the second largest Buddhist order in Korea, tracing its lineage to Taego Bou (1301–1382), a Goryeo dynasty master who received dharma transmission in the Linji lineage from the Chinese master Shiwu Qinggong (Stonehouse). Unlike the celibate Jogye Order, the Taego Order permits married clergy, a practice that became widespread during the Japanese colonial period (1910–1945) when Japanese Buddhist customs were imposed on Korean monastics. After Korean independence, the Buddhist community split over the issue of married clergy, with the celibate monks reconstituting as the Jogye Order and the married clergy organizing as the Taego Order. Despite this institutional distinction, both orders maintain the same fundamental Seon practice tradition rooted in hwadu meditation.",
    practice:
      "The Taego Order practices the same hwadu meditation as the Jogye Order, investigating a critical phrase under a teacher’s guidance until conceptual thought is exhausted. The order’s permission of married clergy means hwadu practice is adapted to temple life where monastics maintain families, integrating intensive meditation with pastoral and community responsibilities. The lineage traces its practice authority to Taego Bou’s dharma transmission from Shiwu Qinggong (Stonehouse), linking Korean Seon directly to the Linji tradition.",
  },
  {
    slug: "obaku",
    name: "Ōbaku",
    tradition: "Zen",
    parentSlug: "linji",
    aliases: ["obaku", "ōbaku", "obaku zen", "黄檗宗"],
    summary:
      "The Ōbaku school (黄檗宗) is the third major school of Japanese Zen, founded in 1661 by the Chinese Chan master Ingen Ryūki (Yinyuan Longqi, 1592–1673), who brought late-Ming Chinese Linji Chan to Japan. Named after Huangbo (Ōbaku) Mountain—the monastery of the great Tang dynasty master Huangbo Xiyun—the school established its headquarters at Manpuku-ji in Uji, near Kyoto. The Ōbaku school is distinctive for preserving Chinese liturgical forms, including the recitation of the nembutsu (nianfo) alongside Zen meditation, reflecting the syncretic Chan-Pure Land practice that had become standard in late-Ming China. The school also introduced Ming dynasty architectural styles, calligraphy, painting, and the sencha tea ceremony to Japan, profoundly influencing Japanese culture. Tetsugen Dōkō, Ingen's prominent disciple, is celebrated for his monumental project of carving the entire Chinese Buddhist canon (Ōbaku edition of the Tripitaka) in woodblock, a feat of devotion that took over a decade.",
    practice:
      "Ōbaku practice combines Chan-style zazen with recitation of the nembutsu (南無阿弥陀仏), reflecting the syncretic Chan-Pure Land method standard in late-Ming China. The nembutsu functions as a huatou when investigated with the question ‘Who is it that recites the Buddha’s name?’—making devotional recitation and meditation investigation a single practice. Ingen Ryūki brought this integrated approach to Japan along with Ming-era monastic regulations and liturgy, creating a Zen school with a distinctly Chinese character.",
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
    names: [
      "longji shaoxiu",
      "ruiyan shiyan",
      "yantou quanhuo",
      "nanyue daoxuan",
    ],
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
    names: [
      "huanglong huiji",
      "zhenjing kewen",
      "sansheng huiran",
      "xuan huaichang",
    ],
  },
  {
    schoolSlug: "yangqi-line",
    names: [
      "xutang zhiyu",
      "poan zuxian",
      "wuzhun shifan",
      "pingshan chulin",
    ],
  },
  {
    schoolSlug: "caodong",
    names: [
      "kumu daocheng",
      "changlu qingliao",
    ],
  },
  {
    schoolSlug: "guiyang",
    names: [
      "hsuan hua",
      "xuanhua",
      "lingyun zhiqin",
    ],
  },
  {
    schoolSlug: "fayan",
    names: [
      "fayan wenyi",
      "qingliang wenyi",
      "tiantai deshao",
      "yongming yanshou",
    ],
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
    names: [
      "kubota jiun",
      "kubota ji'un",
      "yamada ryoun",
      "yamada ryōun",
    ],
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
    names: [
      "seung sahn",
    ],
  },
  {
    schoolSlug: "taego-order",
    names: [
      "taego bou",
    ],
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
    names: [
      "tran nhan tong",
      "phap loa",
      "huyen quang",
    ],
  },
  {
    schoolSlug: "lam-te",
    names: [
      "minh hai phap bao",
    ],
  },
  {
    schoolSlug: "plum-village",
    names: [
      "thich nhat hanh",
      "chan khong",
    ],
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
  let current = getSchoolDefinition(slug);

  while (current) {
    chain.unshift(current);
    current = current.parentSlug ? getSchoolDefinition(current.parentSlug) : null;
  }

  return chain;
}
