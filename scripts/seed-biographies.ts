/**
 * Biography Seeding Script
 *
 * Reads scripts/data/reconciled/canonical.json to build a slug→id map, then
 * upserts English biography entries into the master_biographies table.
 * Idempotent — safe to re-run.
 *
 * Usage:  npx tsx scripts/seed-biographies.ts
 */

import fs from "fs";
import path from "path";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { citations, masterBiographies } from "@/db/schema";
import { buildBiographyItemCitations } from "./biography-citations";
import { buildResolvedMasterSlugMap } from "./master-slugs";
import type { CanonicalCitation, CanonicalMaster } from "./reconcile";

const SQLITE_BUSY_RETRIES = 5;
const SQLITE_BUSY_BACKOFF_MS = 150;

// ---------------------------------------------------------------------------
// Biography data
// ---------------------------------------------------------------------------

interface BiographyEntry {
  slug: string;
  content: string;
}

const BIOGRAPHIES: BiographyEntry[] = [
  {
    slug: "shakyamuni-buddha",
    content: `Shakyamuni Buddha, born Siddhartha Gautama in the foothills of the Himalayas around the fifth century BCE, renounced his princely life at twenty-nine to seek liberation from suffering. After years of ascetic practice and contemplation, he attained complete awakening beneath the Bodhi tree at Bodh Gaya, becoming the Buddha, the Awakened One. His enlightenment, reached through the direct investigation of mind and reality, forms the unshakeable ground on which all subsequent Buddhist teaching rests.

For forty-five years the Buddha traveled the Gangetic plain, teaching the Dharma to monks, nuns, laypeople, and rulers. His discourses range from practical ethics to the profound analysis of dependent origination and the nature of consciousness. He established the Sangha, the community of practitioners, as the third jewel alongside the Buddha and Dharma. In the Chan tradition, his transmission to Mahakashyapa at Vulture Peak—raising a flower and smiling in silence—is regarded as the origin of mind-to-mind transmission beyond words.`,
  },
  {
    slug: "mahakashyapa",
    content: `Mahakashyapa was a senior disciple of Shakyamuni Buddha who became the first patriarch of the Chan lineage. Born into a wealthy brahmin family, he was known for his austere practice and mastery of the dhutanga disciplines, the ascetic purification practices. The Buddha singled him out as the foremost practitioner of these strict observances, and their relationship exemplified the directness and simplicity that would become hallmarks of Chan.

According to Chan tradition, at the Flower Sermon on Vulture Peak, the Buddha held up a golden lotus without speaking a word. Only Mahakashyapa smiled in understanding. The Buddha said: "I possess the true Dharma eye, the marvelous mind of nirvana, the true form of the formless, the subtle Dharma gate that does not rest on words or letters but is a special transmission outside the scriptures. This I entrust to Mahakashyapa." This wordless transmission is the fountainhead of the entire Chan lineage. After the Buddha's death, Mahakashyapa presided over the First Council, where Ananda recited the sutras and Upali recited the Vinaya.`,
  },
  {
    slug: "ananda",
    content: `Ananda served as the personal attendant of Shakyamuni Buddha for twenty-five years, accompanying him on his travels and memorizing his discourses with remarkable fidelity. He was renowned for his excellent memory, his compassion toward all beings, and his advocacy for the admission of women into the monastic order. The Buddha said that among his disciples Ananda was foremost in learning and in service to others.

Though Ananda had not attained full awakening during the Buddha's lifetime, the night before the First Council he sat in deep meditation and realized liberation. At the council, he recited all of the Buddha's discourses from memory, beginning each with "Thus have I heard." For this reason he is often called the Guardian of the Dharma Treasury. As the second Chan patriarch, he received the wordless transmission from Mahakashyapa and continued the unbroken thread of direct experience passed from teacher to student.`,
  },
  {
    slug: "shanakavasa",
    content: `Shanakavasa was the third Indian patriarch of Chan, receiving transmission from Ananda. According to traditional accounts, he was born wearing a robe of shana hemp, which was considered a miraculous sign. He was known as a powerful teacher who spread the Dharma throughout Kashmir and central Asia, establishing monastic communities along the ancient trade routes.

Shanakavasa trained many students and is particularly noted for recognizing the exceptional capacity of Upagupta and transmitting the essence of awakening to him. His legacy bridges the earliest disciples of the Buddha and the subsequent flowering of Indian Buddhism. The Chan tradition regards him as holding the flame of direct mind-to-mind transmission and passing it faithfully across generations.`,
  },
  {
    slug: "upagupta",
    content: `Upagupta, the fourth Chan patriarch, was a disciple of Shanakavasa and a great missionary of the Dharma in northwest India. He is traditionally said to have lived during the reign of Emperor Ashoka and to have played a role in spreading Buddhism across the Indian subcontinent. He was called "the Buddha without marks" because, though lacking the physical signs of a great being, he possessed the full inner realization.

Upagupta was celebrated for his skill in converting difficult students and pacifying demons. In one famous story, he subdued Mara the tempter not through force but through the gentle power of compassion, binding him with garlands of flowers representing the bones of those Mara had destroyed. His transmission to Dhritaka continued the lineage of direct awakening at a time when Buddhism was gaining institutional strength throughout India.`,
  },
  {
    slug: "dhritaka",
    content: `Dhritaka was the fifth Indian Chan patriarch, receiving transmission from Upagupta. Little biographical detail survives from historical sources, and his life sits in the legendary stratum of early Indian Buddhism. The Chan tradition credits him with maintaining the purity of the wordless transmission amid the growing complexity of scholastic Buddhism.

He is said to have recognized the depths of the Dharma beyond intellectual formulation and to have emphasized direct experience over doctrinal elaboration. His transmission to Michaka represents another link in the unbroken chain connecting the historical Buddha to the later flowering of Chan in China.`,
  },
  {
    slug: "michaka",
    content: `Michaka, the sixth patriarch in the Indian Chan lineage, inherited the transmission from Dhritaka. Traditional sources describe him as a teacher of exceptional clarity who could point directly to the nature of mind without relying on elaborate doctrinal frameworks. He is associated with the northwestern regions of India where Buddhism flourished in the early centuries of the Common Era.

Michaka's role in the lineage is primarily as a faithful guardian of the transmission. He recognized Vasumitra's capacity for awakening and passed on the wordless essence of the teaching. His life reminds practitioners that the heart of Chan—direct pointing to mind—does not depend on literary greatness or historical prominence, but on the unobstructed clarity of transmitted realization.`,
  },
  {
    slug: "vasumitra",
    content: `Vasumitra, the seventh patriarch of the Indian Chan lineage, is a name shared by several significant figures in Buddhist history. The Chan tradition identifies this Vasumitra as the direct disciple of Michaka and teacher of Buddhanandi. He is portrayed as an accomplished master who adapted his teaching to the capacities of his students.

The early Indian patriarchs collectively represent the transmission of awakening across the centuries following the Buddha's death, through periods of political upheaval and sectarian diversity. Vasumitra's link in this chain is characterized by the same quality that defines the entire Indian lineage: the capacity to recognize and transmit the self-nature of mind that transcends any particular time, place, or cultural form.`,
  },
  {
    slug: "buddhanandi",
    content: `Buddhanandi, the eighth patriarch, was a student of Vasumitra and teacher of Buddhamitra. His name means "Delight of the Buddha" or "Joy of Awakening," suggesting the quality of liberated ease that the tradition associated with him. He lived during a period of rich Buddhist activity in India, when monastic institutions and philosophical schools were proliferating.

According to Chan records, Buddhanandi possessed an innate understanding of the Buddha's teaching and transmitted that understanding directly to Buddhamitra without relying on textual elaboration. Each link in the Indian patriarchal chain affirms the possibility of carrying awakening forward across generations through the living encounter between teacher and student.`,
  },
  {
    slug: "buddhamitra",
    content: `Buddhamitra, the ninth Indian patriarch, received the transmission from Buddhanandi and passed it to Parshva. His name combines "Buddha" with "friend," evoking the Dharma friendship that is considered essential to genuine practice. The Chan tradition honors him as one who kept the direct transmission alive during a period when Buddhism in India was developing elaborate philosophical systems.

The Indian lineage as preserved in Chan is not primarily a scholastic lineage but a lineage of direct experience—of minds meeting in the recognition of the nature of awareness itself. Buddhamitra represents this principle: not the accumulation of doctrine but the direct pointing that dissolves the confusion between concepts about experience and experience itself.`,
  },
  {
    slug: "parshva",
    content: `Parshva, the tenth patriarch, was known for his great age and the power of his practice. Traditional accounts describe him as an elder of extraordinary presence who had practiced continuously from youth into advanced old age. He received the transmission from Buddhamitra and gave it to Punyayashas after recognizing that student's deep readiness.

The longevity and steadiness attributed to Parshva suggest a teacher whose realization had been tested and refined over a lifetime of practice. His transmission to Punyayashas carries the Dharma through another generation, maintaining the unbroken thread that would eventually cross the mountains and seas to reach East Asia and transform the world.`,
  },
  {
    slug: "punyayashas",
    content: `Punyayashas, the eleventh patriarch, was the teacher of Ashvaghosha, one of the most celebrated figures in the entire Buddhist tradition. Punyayashas is described as a skilled teacher who could identify the hidden depths of his students and awaken them through precisely suited instruction. His meeting with Ashvaghosha is recorded as a pivotal moment in which persistent philosophical debate was dissolved by direct pointing to the nature of mind.

According to Chan accounts, Ashvaghosha initially challenged Punyayashas with arguments and doctrinal questions, but Punyayashas responded with such directness and clarity that Ashvaghosha recognized his own fundamental error: he had been seeking the Dharma outside himself. The encounter transformed a brilliant intellectual into an awakened practitioner, and the transmission passed forward.`,
  },
  {
    slug: "ashvaghosha",
    content: `Ashvaghosha was one of the most renowned figures in the history of Indian Buddhism, celebrated both as the twelfth Chan patriarch and as a poet, playwright, and philosopher of exceptional talent. He is traditionally credited with composing the Buddhacarita, an epic Sanskrit poem about the life of the Buddha, as well as the Awakening of Faith, a foundational text of Mahayana Buddhism. Before his encounter with Punyayashas, he had been a master debater and opponent of Buddhism.

His conversion and awakening represent the transformation of brilliant intellectual capacity into the service of direct experience and compassionate teaching. Ashvaghosha transmitted the essence of awakening to Kapimala, and his legacy demonstrates that literary and philosophical gifts, when properly oriented, can become vehicles for pointing to the inexpressible. In the Chan tradition, he is honored both for his scholarship and for his place in the unbroken lineage.`,
  },
  {
    slug: "kapimala",
    content: `Kapimala, the thirteenth patriarch, was an accomplished master of Brahmanical lore before his conversion to Buddhism through an encounter with Ashvaghosha. He was skilled in philosophical argumentation and had led a community of followers when Ashvaghosha engaged him in dialogue. As with Ashvaghosha's own conversion, the encounter was not primarily a matter of winning an argument but of recognizing something beyond argument altogether.

After receiving transmission from Ashvaghosha, Kapimala became a tireless teacher and eventually recognized the exceptional capacity of Nagarjuna, one of the most influential thinkers in the history of Buddhism. Kapimala's meeting with Nagarjuna began not as a philosophical encounter but as a direct pointing to what lies beneath and beyond all philosophical positions.`,
  },
  {
    slug: "nagarjuna",
    content: `Nagarjuna, the fourteenth Indian patriarch and one of the most important figures in the entire Buddhist tradition, was the founder of the Madhyamaka school of philosophy. He lived in southern India around the second or third century CE and composed numerous treatises, including the Mulamadhyamakakarika, which systematically demonstrates the emptiness of all phenomena through rigorous logical analysis. His philosophical contribution cannot be overstated: the doctrine of sunyata, or emptiness, as he articulated it became the foundation of virtually all subsequent Mahayana philosophy.

In the Chan lineage, Nagarjuna holds a special place because his understanding of emptiness is seen as pointing directly to the nature of mind itself. Emptiness, in his analysis, is not nothingness but the absence of fixed, independent existence—which means that all phenomena arise in dynamic interdependence, free from the burden of intrinsic selfhood. This is precisely what direct experience in Chan meditation reveals. Nagarjuna received transmission from Kapimala and transmitted to Aryadeva, his foremost student, continuing the lineage through one of the most philosophically fertile periods in Buddhist history.`,
  },
  {
    slug: "aryadeva",
    content: `Aryadeva was the principal disciple of Nagarjuna and the fifteenth Indian patriarch of the Chan lineage. He was a master debater who encountered Nagarjuna after a series of remarkable encounters with Buddhist teachers and became his most capable student. His own philosophical works, particularly the Catuhsataka (Four Hundred Verses), extend and defend the Madhyamaka analysis of Nagarjuna with great precision and polemical force.

According to traditional accounts, Aryadeva had the physical characteristic of one eye, having offered it to an image of Kuan Yin in a past life. His debates with non-Buddhist philosophers were legendary, and his skill in articulating the view of emptiness contributed enormously to the spread of Mahayana in India. As the sixteenth link in the chain, he transmitted the essence of awakening to Rahulata, carrying the Indian lineage forward through another generation.`,
  },
  {
    slug: "rahulata",
    content: `Rahulata, the sixteenth patriarch, was a disciple of Aryadeva who continued the Indian lineage in the northwestern regions of the subcontinent. His name may evoke Rahula, the son of the historical Buddha, suggesting a sense of intimate inheritance. He is remembered as a teacher who transmitted the direct pointing of the Madhyamaka insight without reducing it to mere philosophical abstraction.

The Chan tradition values Rahulata as a bridge between the great philosophical figures of the Indian lineage and the less-documented teachers who maintained the transmission through periods of relative obscurity. He transmitted to Sanghanandi, and the lineage continued its journey through India and eventually toward China.`,
  },
  {
    slug: "sanghanandi",
    content: `Sanghanandi, the seventeenth patriarch, is described in Chan sources as a prince who renounced his royal inheritance upon realizing the fragility of worldly pleasures. He entered the homeless life, found Rahulata, and received the transmission after demonstrating the clarity of his understanding. His story parallels in some ways the story of Shakyamuni Buddha himself, grounding the lineage in the archetype of renunciation and awakening.

As a teacher, Sanghanandi was known for his patience and his ability to meet students wherever they were in their understanding. He recognized Gayashata's capacity and transmitted the essence of mind to him. His contribution to the lineage is the continuity of sincerity—the willingness to abandon worldly position in order to know the nature of reality directly.`,
  },
  {
    slug: "gayashata",
    content: `Gayashata, the eighteenth patriarch, was a student of Sanghanandi who is described in Chan texts as having a naturally luminous understanding. He is sometimes depicted as someone who arrived at the teacher's door already ripe, needing only the final touch of recognition to break through fully. His name is connected with a mountain, suggesting settledness and solidity of realization.

Gayashata transmitted the essence of awakening to Kumarata after recognizing his student's readiness through direct encounter. He represents another generation in which the transmission moved not through institutional structures but through the direct meeting of teacher and student in genuine inquiry.`,
  },
  {
    slug: "kumarata",
    content: `Kumarata, the nineteenth patriarch, was a student of Gayashata who is described as coming from a family of great learning. He was well-versed in the texts of various philosophical traditions before meeting his teacher. His encounter with Gayashata shifted his understanding from the mastery of conceptual systems to the direct recognition of what lies before and beyond all concepts.

He transmitted the essence of awakening to Jayata and continued the unbroken thread of the Indian lineage. Kumarata's name appears in the chronicles of the patriarchs as evidence that the transmission passed through central Asia at a time when Buddhism was beginning to spread along the Silk Road toward China.`,
  },
  {
    slug: "jayata",
    content: `Jayata, the twentieth patriarch, received transmission from Kumarata and transmitted it to Vasubandhu. He is described as an accomplished practitioner who understood the ground of awakening and could recognize it in others. His name, meaning "victorious," suggests the quality of a realization that has overcome the fundamental error of taking oneself to be a fixed, separate entity.

The records of Jayata are sparse, as is common for the later Indian patriarchs, but his place in the lineage is unquestioned within the Chan tradition. He represents the faithful handing down of direct experience across generations and across the gradual dissolution of Indian Buddhist civilization.`,
  },
  {
    slug: "vasubandhu",
    content: `Vasubandhu, the twenty-first patriarch of the Chan lineage, should be distinguished from the more historically prominent philosopher Vasubandhu of the Yogacara school, though their names and periods may overlap in complex ways within Buddhist chronology. The Chan Vasubandhu is the disciple of Jayata and teacher of Manorhita, positioned in the lineage as a faithful transmitter of direct experience.

As with many of the later Indian patriarchs, the historical details of his life are embedded within hagiographic tradition. The Chan lineage through these figures is not primarily a historical document but a living affirmation that the recognition of mind's true nature has been passed from person to person without break from the time of Shakyamuni to the present. Vasubandhu transmitted this recognition to Manorhita.`,
  },
  {
    slug: "manorhita",
    content: `Manorhita, the twenty-second patriarch, received the transmission from Vasubandhu. His name evokes brilliance of mind, and he is described as a teacher who could communicate the essence of awakening through both ordinary conversation and formal teaching. He is associated with a period of transmission in which the lineage was moving closer to the northwestern borders of India, the gateway to central Asia and eventually China.

Manorhita recognized in Haklena the qualities necessary to carry the transmission forward and transmitted the essence of awakening to him. His contribution to the lineage, like that of most of the middle Indian patriarchs, is the faithful preservation of a living experience that does not depend on the survival of texts or institutions but on the direct encounter between awake minds.`,
  },
  {
    slug: "haklena",
    content: `Haklena, the twenty-third patriarch, was a student of Manorhita who is described as having practiced for many years before meeting his teacher. He had explored various contemplative methods and philosophical systems, and his meeting with Manorhita resolved his long search not through the acquisition of new knowledge but through the recognition of what had always already been present.

He transmitted the essence of mind to Simha after a period of teaching that deepened both his realization and his capacity to recognize it in students. His name appears in Chan chronicles as Haklenayasha in some traditions, and his role in the lineage represents another link in the chain that would eventually reach Bodhidharma and cross to China.`,
  },
  {
    slug: "simha",
    content: `Simha, the twenty-fourth patriarch, was martyred for his faith and is one of the most dramatic figures in the Indian lineage. His name means "lion," a title sometimes applied to the Buddha himself. According to Chan records, he was beheaded by a king hostile to Buddhism, and at his death milk rather than blood flowed from his neck—a miracle interpreted as a sign of his complete purity and realization.

Simha represents the extreme test of the lineage: the willingness to give one's life rather than abandon the transmission. His death did not end the lineage but affirmed its indestructibility. He had already transmitted the essence of awakening to Vasasita before his martyrdom, and that transmission carried forward through the remaining Indian patriarchs to Prajnatara, who would become the teacher of Bodhidharma.`,
  },
  {
    slug: "vasasita",
    content: `Vasasita, the twenty-fifth patriarch, received the transmission from Simha and continued the lineage after the period of persecution that had claimed his teacher's life. He is remembered as a teacher who emphasized the indestructibility of the true Dharma—that no external force can destroy what is not a thing, what is the ground of all things.

His transmission to Punyamitra continued the chain through difficult circumstances, and his role in the lineage embodies the resilience that the Chan tradition identifies as a quality of genuine realization: not invulnerability to circumstances, but the freedom that does not depend on circumstances.`,
  },
  {
    slug: "punyamitra",
    content: `Punyamitra, the twenty-sixth patriarch, received the transmission from Vasasita and passed it to Prajnatara, who would become the teacher of Bodhidharma. His name means "friend of merit," and he is portrayed as a teacher of great warmth and accessibility. He is said to have traveled widely, teaching in various regions of India and maintaining contact with the diverse Buddhist communities of his time.

Punyamitra's significance lies above all in his recognition of Prajnatara, the last great figure of the Indian lineage before the transmission would cross to China. His ability to see through the forms of brilliance and accomplishment to the essential readiness of a student represents the highest function of the teacher in the Chan understanding.`,
  },
  {
    slug: "prajnatara",
    content: `Prajnatara, the twenty-seventh and final Indian patriarch before the transmission passed to China, was the teacher of Bodhidharma. He is described in Chan sources as an accomplished master of great depth who recognized Bodhidharma among the sons of a king and perceived immediately his extraordinary capacity. Prajnatara's teaching of Bodhidharma lasted many years, culminating in the full transmission of the patriarchal mind.

Prajnatara is said to have prophesied that Bodhidharma would travel to China and that his teaching there would bear great fruit, though not immediately. He instructed Bodhidharma to wait until his own death before departing, and the timing was precise: Bodhidharma's journey westward across the Himalayas and into China brought the direct transmission of the Chan lineage to East Asia. With Prajnatara, the Indian lineage of twenty-eight patriarchs reached its completion, and a new chapter in the history of awakening began.`,
  },
  {
    slug: "jianzhi-sengcan",
    content: `Jianzhi Sengcan was the third patriarch of Chinese Chan, receiving transmission from Dazu Huike and transmitting it to Dayi Daoxin. Almost nothing is known of his early life. He is said to have approached Huike as a layman, afflicted by a karmic illness, and to have asked for purification of his sins. Huike's response—"Bring me your sins and I will purify them"—launched an inquiry that culminated in Sengcan's awakening. He was subsequently ordained and received the robe and bowl that symbolized patriarchal transmission.

Sengcan lived during a period of intense Buddhist persecution under the Northern Zhou emperor and was forced to spend many years in hiding, moving between mountains and obscure regions to avoid detection. This life of concealment gave his practice a quality of radical simplicity and gave his famous poem, the Xinxin Ming (Faith in Mind), its particular gravity. The poem opens: "The Great Way is not difficult; just avoid picking and choosing." These lines have resonated through centuries of Chan and Zen practice as a direct pointing to the ease and naturalness of original mind. Sengcan died in 606 CE while giving a Dharma talk, bowing to a tree and passing away standing up.`,
  },
  {
    slug: "puti-damo",
    content: `Bodhidharma was the twenty-eighth Indian patriarch and the first Chinese patriarch of Chan, a figure who stands at the hinge between the Indian and East Asian traditions. He arrived in China around the late fifth or early sixth century, having crossed the seas from India. His encounter with Emperor Wu of Liang is one of the most celebrated exchanges in Chan history. The Emperor, who had built many temples and supported thousands of monks, asked what merit he had accumulated. Bodhidharma replied: "No merit whatsoever." When the Emperor asked about the highest sacred truth, Bodhidharma said: "Vast emptiness, nothing sacred." Asked who stood before him, Bodhidharma said: "I don't know."

After this exchange, Bodhidharma traveled north and spent nine years in seated meditation facing a wall at Shaolin Monastery. This period of wall-gazing became one of the defining images of the Chan tradition. He eventually accepted Dazu Huike as his disciple after Huike demonstrated his sincerity by standing in the snow and cutting off his own arm. Bodhidharma transmitted the Lankavatara Sutra along with the wordless transmission of mind. His teaching emphasized direct awakening through meditation practice rather than doctrinal study, and this emphasis became the defining characteristic of the Chan school he founded in China.`,
  },
  {
    slug: "dazu-huike",
    content: `Dazu Huike was the second patriarch of Chinese Chan, the successor of Bodhidharma and one of the most dramatic figures in the tradition. He first sought out Bodhidharma while the master was engaged in his nine years of wall-gazing, standing in the snow outside the meditation hall. When Bodhidharma refused to see him, Huike cut off his own arm at the elbow and presented it as evidence of his sincerity. Bodhidharma then agreed to teach him.

Huike's encounter with Bodhidharma is recorded as proceeding through a series of exchanges that paralleled Bodhidharma's famous encounter with Emperor Wu. When Huike said his mind was not at peace and asked Bodhidharma to put it at rest, Bodhidharma replied: "Bring me your mind and I will put it at rest." After a long search, Huike said: "I have searched for my mind and cannot find it." Bodhidharma replied: "There, I have put it at rest for you." This exchange remains one of the most celebrated encounters in Chan history and stands as a direct illustration of the method of investigating the nature of mind. Huike transmitted to Jianzhi Sengcan, continuing the lineage during a dangerous period of religious persecution.`,
  },
  {
    slug: "dayi-daoxin",
    content: `Dayi Daoxin, the fourth Chinese Chan patriarch, received transmission from Jianzhi Sengcan and became one of the most important figures in the development of Chan as a distinct Chinese Buddhist school. He was the first patriarch to establish a large settled community of practitioners, moving away from the wandering and hermit-like style of the earlier patriarchs. He founded a community on East Mountain (Dongshan) that numbered in the hundreds, and this represented a new institutional form for the transmission of awakening.

Daoxin's teaching integrated sitting meditation with practical monastic work, a combination that would become central to the Chan tradition. He insisted that awakening was not separate from everyday activity and that the cultivation of mind could occur through any task performed with complete attention. His emphasis on practice within community life rather than solitary wandering laid the groundwork for the great monasteries of the Tang dynasty Chan renaissance. He transmitted to Daman Hongren, who would carry this communal model to even greater development.`,
  },
  {
    slug: "daman-hongren",
    content: `Daman Hongren, the fifth Chinese Chan patriarch, continued and expanded the communal model of practice established by his teacher Dayi Daoxin on East Mountain. Under Hongren's leadership, the East Mountain community became the preeminent center of Chan practice in Tang dynasty China, drawing students from throughout the country. His teaching emphasized the direct recognition of original mind as the ground of all practice and all merit.

Hongren is particularly significant because among his many students he recognized the extraordinary capacity of Huineng, a young illiterate wood-seller from the south. The story of their encounter is pivotal in Chan history. Hongren tested all his students by asking them to demonstrate their understanding in verse. The head monk Shenxiu wrote: "The body is the Bodhi tree; the mind is like a bright mirror's stand. At all times we must strive to polish it and must not let the dust collect." Huineng had someone read this to him and then composed his own verse: "Bodhi originally has no tree; the bright mirror has no stand. Originally there is not a single thing; where could dust alight?" Hongren recognized Huineng's verse as the expression of a deeper understanding and secretly transmitted to him the patriarchal robe and bowl.`,
  },
  {
    slug: "dajian-huineng",
    content: `Dajian Huineng, the sixth and final patriarch of undivided Chinese Chan, was an illiterate wood-seller from Guangdong province who became the most influential figure in the entire Chan tradition. His story of recognition by Hongren and subsequent flight southward with the robe and bowl, pursued by monks who sought to reclaim the symbol of patriarchal authority, became one of the founding narratives of Chan. His teaching was eventually recorded in the Platform Sutra, the only Chinese Buddhist text accorded the status of a sutra.

Huineng's central teaching was the direct, sudden recognition of original mind, which he called the "no-thought" or "no-mind" approach. He insisted that awakening is not something achieved through gradual accumulation but is the immediate recognition of what one already fundamentally is. His famous exchanges, recorded in the Platform Sutra, demonstrate this direct pointing with extraordinary economy and power. Through his students—particularly Nanyue Huairang and Qingyuan Xingsi—virtually all subsequent Chinese Chan schools trace their lineage. The Rinzai and Soto schools of Japan, the Korean Seon tradition, and the Vietnamese Thien tradition all descend from Huineng through these two streams.`,
  },
  {
    slug: "shitou-xiqian",
    content: `Shitou Xiqian was one of the two great heirs of Huineng's dharma-grandson lineage—through Qingyuan Xingsi—and the founder of one of the two main streams from which all surviving Chan/Zen schools descend. He was born in Guangdong and was so precocious that as a child he reportedly disrupted local sacrificial rituals by releasing the animals. He became a student of Huineng and then, after Huineng's death, studied with Qingyuan Xingsi. Shitou's approach to Chan was quiet, vast, and deeply grounded in the Huayan teaching of the interpenetration of all phenomena.

His most famous text, the Sandokai (Merging of Difference and Unity), is one of the foundational liturgical texts of the Soto school of Zen, chanted daily in temples around the world. The poem articulates the relationship between the absolute and the relative, between emptiness and form, with extraordinary poetic precision. Shitou built a meditation platform on a flat rock on Nanyue Mountain—the name Shitou means "stone head"—and taught from there for decades. From his lineage descended Dongshan Liangjie and the Caodong/Soto tradition.`,
  },
  {
    slug: "mazu-daoyi",
    content: `Mazu Daoyi was the other great heir of the post-Huineng generation, descending through Nanyue Huairang, and one of the most dynamic and influential Chan masters in Chinese history. He was the teacher of hundreds of students and was renowned for his startling, unconventional teaching methods. Mazu introduced the "shout" (katsu/he) as a teaching device, sometimes shouting so forcefully that students experienced sudden awakening. He also employed physical gestures—grabbing noses, twisting ears, striking students unexpectedly—as direct interventions in the stream of conceptual thought.

Mazu's famous saying that "everyday mind is the Way" became one of the cornerstone teachings of the Chan tradition. By this he meant that awakening is not a special state separate from ordinary experience but is the direct recognition of experience as it actually is, before any overlay of conceptual construction. His students—including Baizhang Huaihai, Nanquan Puyuan, and Zhaozhou's teacher—spread throughout China and established the Hongzhou style of Chan that became the foundation of the Linji/Rinzai tradition.`,
  },
  {
    slug: "baizhang-huaihai",
    content: `Baizhang Huaihai was a disciple of Mazu Daoyi and one of the architects of Chan monastic culture. He is famous above all for establishing the first specifically Chan monastic code, the Baizhang Qinggui (Pure Rules of Baizhang). Before Baizhang, Chan monks lived in Vinaya monasteries designed for a different kind of practice. Baizhang created a distinctly Chan institution in which practice, work, and communal life were fully integrated. His famous dictum—"A day without work is a day without eating"—set the tone for a monasticism in which manual labor was understood as inseparable from spiritual practice.

Baizhang also created the formal Dharma hall where the abbot teaches the community publicly, a format that became standard in Chan and Zen monasteries worldwide. His awakening moment under Mazu is legendary: Mazu picked up a whisk and held it vertically. Baizhang asked the meaning. Mazu put it down. Later Mazu asked Baizhang to explain Chan. Baizhang picked up the whisk and held it vertically. Mazu snatched it and asked what he meant by that. Baizhang shouted—and Mazu's roar of laughter could be heard for miles. This encounter appears in several koan collections and illustrates the non-verbal quality of genuine dharma encounter.`,
  },
  {
    slug: "nanquan-puyuan",
    content: `Nanquan Puyuan was a disciple of Mazu Daoyi who spent thirty years on Nanquan Mountain without descending to the world below. He is known for his deeply unconventional teaching and for his famous student Zhaozhou Congshen, with whom he engaged in some of the most celebrated exchanges in Chan history. Nanquan's teaching style combined radical directness with apparent paradox, constantly undercutting any fixed view of practice or attainment.

The most famous story about Nanquan involves his cutting a cat in two to resolve a dispute among monks about ownership. He afterward asked Zhaozhou what he would have done. Zhaozhou put his sandals on his head and walked out. Nanquan said: "If you had been here, I could have saved the cat." This story, recorded as case 63 in the Blue Cliff Record, points to the impossibility of grasping reality through conceptual categories. Nanquan's life on the mountain and his Dharma encounters with his many students established him as one of the towering figures of the Tang Chan renaissance.`,
  },
  {
    slug: "huangbo-xiyun",
    content: `Huangbo Xiyun was a student of Baizhang Huaihai and the teacher of Linji Yixuan, the founder of the Linji school. He was a physically imposing man with a prominent lump on his forehead, said to have been acquired through years of prostrations. His teaching was famed for its bluntness and its stripping away of all concepts about Buddhism or practice. His famous "thirty blows" became an emblem of the immediacy of true Chan teaching.

Huangbo's teaching on the One Mind is recorded in the Transmission of Mind, compiled by his student Pei Xiu: "All buddhas and all sentient beings are nothing but the One Mind, beside which nothing exists. This mind, which is without beginning, is unborn and indestructible. It is not green nor yellow, and has neither form nor appearance. It does not belong to the categories of things which exist or do not exist." This description of mind as the ground of all appearance and the source of all experience represents the philosophical heart of the Linji teaching. Linji later said that it was through Huangbo's transmission that he had encountered the living Buddha.`,
  },
  {
    slug: "linji-yixuan",
    content: `Linji Yixuan founded one of the most dynamic and enduring of all Chan schools, the Linji school, which later became the Rinzai school of Japanese Zen. He was a student of Huangbo Xiyun who underwent an extremely severe training. Three times he asked Huangbo the fundamental meaning of Buddhism, and three times Huangbo struck him without speaking. Linji left in confusion, and Huangbo sent him to consult the master Dayu. When Linji told Dayu what had happened, Dayu said: "Huangbo was so grandmotherly for you!" At this moment Linji had a sudden awakening and said: "There's not much to Huangbo's Buddha Dharma!" When Dayu grabbed him and demanded an explanation, Linji struck Dayu three times in the ribs. This exchange is one of the most analyzed in the entire koan literature.

Linji's teaching was radical and uncompromising. His famous saying—"If you meet the Buddha, kill the Buddha; if you meet a patriarch, kill the patriarch"—is not a rejection of the tradition but an insistence on not becoming attached to any authority outside one's own true nature. He introduced the "Four Shouts" and the "Four Positions of Guest and Host" as systematic teaching methods. His Record (Linji Lu) became the foundational text of the Linji/Rinzai school, which through the Japanese transmission of Eisai and later Hakuin became the living backbone of formal koan practice.`,
  },
  {
    slug: "dongshan-liangjie",
    content: `Dongshan Liangjie was the founder of the Caodong school of Chinese Chan, the tradition that later became the Japanese Soto school through Dogen. He was a student of Yunyan Tansheng and is famous above all for his awakening experience while crossing a stream: seeing his reflection in the water, he suddenly understood the teaching that Yunyan had been pointing to. His verse on this moment begins: "Earnestly avoid seeking without, lest it recede far from you."

Dongshan developed the teaching of the Five Ranks (Wuwei), a sophisticated schema describing the relationship between the absolute (the dark, emptiness) and the relative (the bright, phenomena). The Five Ranks became the philosophical backbone of Caodong practice and have been studied and debated for twelve centuries. Unlike the Linji/Rinzai emphasis on sudden breakthrough through shock and paradox, Dongshan's approach was subtler and more gradualist, emphasizing the integration of emptiness and form in the stream of everyday activity. He founded the Caodong school together with his student Caoshan Benji, and the school's name combines their two mountain names.`,
  },
  {
    slug: "yunmen-wenyan",
    content: `Yunmen Wenyan was the founder of the Yunmen school, one of the Five Houses of Tang and Song dynasty Chan. He was a student of Xuefeng Yicun and is renowned for the extraordinary economy and precision of his teaching language. His responses were often one word, and these single-word responses—called "one-word barrier" answers—became some of the most studied koans in the tradition. His famous saying "Every day is a good day" appears as case 6 in the Blue Cliff Record and has been contemplated by practitioners for a thousand years.

Yunmen's teaching style was demanding and unsparing. He described three types of Dharma eye: "containing heaven and earth," "cutting off the myriad streams," and "following the waves." His one-word answers function as direct gestures toward reality that cannot be reasoned about but must be directly entered. The Yunmen school did not survive as a separate institution after the Song dynasty, but its spirit was preserved through the Blue Cliff Record, whose cases largely come from the Yunmen tradition, and continues to permeate all koan practice.`,
  },
  {
    slug: "zhaozhou-congshen",
    content: `Zhaozhou Congshen was one of the greatest Tang dynasty Chan masters and the subject of more koans than perhaps any other figure in the tradition. He was a student of Nanquan Puyuan and lived to the extraordinary age of one hundred and twenty, practicing and teaching for most of his long life. He is said to have first met Nanquan when he was a young monk and to have experienced his initial awakening in their first encounter.

Zhaozhou's most famous teaching is recorded in the first case of the Gateless Barrier (Wumenguan): a monk asked him whether a dog has Buddha nature, and Zhaozhou replied "Mu" (No, or Nothing). This single syllable became the gateway koan of the Rinzai tradition, the first koan given to most students beginning formal koan practice. His other famous exchanges—"Have you had breakfast? Then go wash your bowl." and "Does the oak tree have Buddha nature?" and his description of Zhaozhou bridge—demonstrate his ability to point to the ordinary as the sacred without making anything mystical or special. His collected sayings show a mind of inexhaustible patience and precision.`,
  },
  {
    slug: "deshan-xuanjian",
    content: `Deshan Xuanjian began his practice as a specialist in the Diamond Sutra within the traditional Buddhist educational system of the north, and he traveled south specifically to refute what he regarded as the dangerous claim that awakening could be direct and immediate. On his way he stopped at a roadside stand where an old woman was selling rice cakes. When he told her what he was carrying, she asked which mind he intended to refresh with her rice cakes—the past mind which cannot be got, the present mind which cannot be held, or the future mind which has not yet come. Deshan could not answer, and this encounter cracked open his certainty.

He subsequently studied with Longtan Chongxin and had his awakening when Longtan blew out a candle in the darkness. He burned all his commentaries on the Diamond Sutra, saying: "Exhausting learning is like a single hair in the vastness of space; all the world's wisdom is like a drop in a great ocean." He became famous for carrying a staff and striking any student who spoke and any student who did not speak, any student who answered quickly and any student who answered slowly. His famous saying—"Thirty blows whether you can say it or whether you cannot"—became a Chan archetype of the teaching that breaks through conceptual hesitation.`,
  },
  {
    slug: "xuefeng-yicun",
    content: `Xuefeng Yicun was a student of Deshan Xuanjian who traveled and practiced intensively for decades before his awakening, reportedly visiting his teacher Touzi Datong nine times and Dongshan Liangjie three times before his final awakening occurred with Deshan. He founded a large monastic community on Xuefeng Mountain that attracted hundreds of students and became one of the major centers of Chan in the late Tang dynasty.

Xuefeng was the teacher of both Yunmen Wenyan and Xuansha Shibei, two of the most significant figures of the next generation. His teaching featured powerful imagery drawn from the natural world, and his dialogues with students are marked by a quality of utter simplicity that breaks through discursive thinking. He once held up a wooden ball and asked the assembly: "When this universe is completely destroyed—sun, moon, mountains, rivers—what happens to this ball?" No student could answer. This kind of encounter, pointing to the unlocatable nature of awareness, characterizes his teaching.`,
  },
  {
    slug: "yunyan-tansheng",
    content: `Yunyan Tansheng was a student of Baizhang Huaihai and the teacher of Dongshan Liangjie, the founder of the Caodong/Soto school. He is particularly famous for one crucial exchange with Dongshan that planted the seed of Dongshan's awakening. Dongshan asked him what a non-sentient being preaches the Dharma with. Yunyan said: "Non-sentient beings always preach the Dharma." When Dongshan asked who hears this, Yunyan said: "The non-sentient beings hear." Dongshan asked: "And do you hear?" Yunyan said: "If I heard, you could not hear my teaching." Dongshan asked what scripture this teaching came from, and Yunyan said: "Have you not seen? In the Amitabha Sutra it says: 'Water birds, tree groves, all without exception proclaim the Buddha and the Dharma.'" This exchange led Dongshan to his famous awakening when crossing the stream.

Yunyan was known for making straw sandals, a simple craft that he employed as a teaching vehicle. His responses were often enigmatic, pointing to the Dharma-preaching of mountains and rivers and the non-sentient world—a teaching that resonates deeply with the Caodong emphasis on the pervasion of Buddha nature throughout all of reality.`,
  },
  {
    slug: "dogen",
    content: `Eihei Dogen was the founder of the Soto school of Zen in Japan and one of the most profound religious philosophers in world history. Born into a noble family in 1200, he entered the monastery as a child and came to question why, if all beings are originally endowed with Buddha nature, they still need to practice. Unable to find a satisfying answer in Japan, he traveled to China in 1223 and studied with Tiantong Rujing, under whom he experienced the moment of "dropping off body and mind." He returned to Japan in 1227 and spent the rest of his life teaching, writing, and establishing the Soto monastic tradition.

Dogen's masterwork, the Shobogenzo (Treasury of the True Dharma Eye), is a collection of fascicles that approach the fundamental questions of Buddhist philosophy—time, being, impermanence, the body, language, and awakening—with extraordinary depth and originality. His core teaching is that practice and realization are not separate: to sit in zazen is itself the expression of Buddha nature, not a means toward it. His instruction for zazen, the Fukanzazengi, remains the definitive guide to Soto sitting practice. The teaching of shikantaza—"just sitting"—points to a quality of wholehearted, non-striving presence that Dogen considered the complete expression of awakening itself.`,
  },
  {
    slug: "keizan-jokin",
    content: `Keizan Jokin, the fourth patriarch of Japanese Soto Zen, is sometimes called "the Great Popularizer" to complement Dogen's role as the school's philosophical founder. He lived from around 1264 to 1325 and was instrumental in making Soto practice accessible to a broad population, including laypeople and those outside the educated elite. He founded Sojiji Temple, which became one of the two head temples of Soto Zen in Japan, the other being Dogen's Eiheiji.

Keizan's Denkoroku (Transmission of the Lamp) records the awakening stories of each of the Indian and Chinese patriarchs, making the lineage narratively vivid for Japanese practitioners. He also integrated practices from esoteric Buddhism, including rituals for the protection of the state and memorial ceremonies for ancestors, into the Soto monastic framework. This integration made Soto Zen intimately connected with the social and ritual life of Japanese communities and contributed enormously to its eventual spread as the largest Buddhist school in Japan. His teaching emphasized the accessibility of awakening to all beings regardless of capacity.`,
  },
  {
    slug: "hakuin-ekaku",
    content: `Hakuin Ekaku, who lived from 1686 to 1769, is credited with single-handedly reviving and systematizing the Rinzai school of Zen after a period of significant decline. Through his own intense and prolonged practice—marked by repeated experiences of kensho and equally repeated disillusionment when he recognized deeper layers of his own confusion—Hakuin developed a curriculum of koan practice that moved systematically through progressively deeper layers of inquiry. This curriculum became the standard structure for Rinzai training that continues to this day.

Hakuin's own biography is written in his awakening autobiography Orategama and Wild Ivy, extraordinary documents of the psychological and physical extremes of intensive practice. He developed what he called "Zen sickness"—a dangerous energetic imbalance from excessive one-pointed effort—and was cured by the hermit Hakuyu, from whom he learned the practice of "soft butter" visualization for cultivating the body's energy. Hakuin was also a prolific and unconventional visual artist, creating thousands of brushwork paintings and calligraphies that expressed Dharma teachings through visceral imagery. His famous Circle of Emptiness paintings and his portraits of Bodhidharma are among the most iconic works of Japanese religious art. His restoration of Rinzai practice gave the Japanese Zen tradition a renewed vitality that has persisted to the modern period.`,
  },
  {
    slug: "yamada-koun",
    content: `Yamada Koun Roshi was one of the most influential Zen masters of the twentieth century, a lay teacher in the Sanbo Kyodan school who opened the Japanese Rinzai koan curriculum to students of all religious backgrounds, including Catholic and Protestant priests and nuns. Born in 1907 and dying in 1989, he was a student of Nakagawa Soen and Harada Daiun Sogaku, and he became the second teacher of the Sanbo Kyodan school.

Yamada's genius was his recognition that the experience of kensho, the initial glimpse of one's true nature, and the subsequent deepening through koan practice, were not the exclusive property of any religious tradition but were available to any sincere practitioner regardless of faith background. He trained many Western teachers—including Catholic priests who then brought koan practice into Christian contemplative communities—and helped transform Zen from a Japanese cultural phenomenon into a genuinely international practice. His commentaries on the Gateless Barrier and the Blue Cliff Record remain among the clearest and most accessible in the English-language Zen literature.`,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("=== Biography Seeding ===\n");

  try {
    const { default: seedSources } = await import("./seed-sources");
    if (typeof seedSources === "function") await seedSources();
  } catch {
    // Keep going if the source seeder cannot be loaded in this context.
  }

  // Load canonical.json and build slug → id map
  const canonicalPath = path.join(process.cwd(), "scripts/data/reconciled/canonical.json");
  const citationsPath = path.join(process.cwd(), "scripts/data/reconciled/citations.json");
  if (!fs.existsSync(canonicalPath)) {
    console.error("canonical.json not found. Run scripts/reconcile.ts first.");
    process.exit(1);
  }
  if (!fs.existsSync(citationsPath)) {
    console.error("citations.json not found. Run scripts/reconcile.ts first.");
    process.exit(1);
  }

  const canonicalMasters = JSON.parse(fs.readFileSync(canonicalPath, "utf-8")) as CanonicalMaster[];
  const canonicalCitations = JSON.parse(
    fs.readFileSync(citationsPath, "utf-8")
  ) as CanonicalCitation[];

  const resolvedSlugMap = buildResolvedMasterSlugMap(
    canonicalMasters.map((master) => ({ id: master.id, slug: master.slug }))
  );
  const slugToId = new Map<string, string>();
  const displayNameById = new Map<string, string>();
  for (const [masterId, slug] of resolvedSlugMap.entries()) {
    if (slug) {
      slugToId.set(slug, masterId);
    }
  }
  for (const master of canonicalMasters) {
    const displayName =
      master.names.find((name) => name.locale === "en" && name.name_type === "dharma")?.value ??
      master.names.find((name) => name.locale === "en")?.value ??
      master.slug;
    displayNameById.set(master.id, displayName);
  }

  const masterCitationsById = new Map<string, CanonicalCitation[]>();
  for (const citation of canonicalCitations) {
    if (citation.entity_type !== "master") continue;
    const existing = masterCitationsById.get(citation.entity_id) ?? [];
    existing.push(citation);
    masterCitationsById.set(citation.entity_id, existing);
  }

  console.log(`Loaded ${slugToId.size} masters from canonical.json`);
  console.log(`Upserting ${BIOGRAPHIES.length} biographies...\n`);

  let seeded = 0;
  let skipped = 0;
  let citationCount = 0;
  const biographyIds = BIOGRAPHIES.map((bio) => `bio_${bio.slug}_en`);

  await deleteBiographyCitationsWithRetry(biographyIds);

  for (const bio of BIOGRAPHIES) {
    const masterId = slugToId.get(bio.slug);
    if (!masterId) {
      console.warn(`WARNING: slug "${bio.slug}" not found in canonical.json — skipping`);
      skipped++;
      continue;
    }

    const bioId = `bio_${bio.slug}_en`;

    await upsertBiographyWithRetry({
      id: bioId,
      masterId,
      locale: "en",
      content: bio.content,
    });

    const displayName = displayNameById.get(masterId) ?? bio.slug;
    const biographyCitations = buildBiographyItemCitations({
      bioId,
      slug: bio.slug,
      displayName,
      masterCitations: masterCitationsById.get(masterId) ?? [],
    });

    for (const citation of biographyCitations) {
      await upsertBiographyCitationWithRetry(citation);
    }

    citationCount += biographyCitations.length;
    seeded++;
  }

  console.log("\n=== Biography seeding complete ===");
  console.log(`Seeded: ${seeded}, Skipped (slug not found): ${skipped}`);
  console.log(`Biography citations seeded: ${citationCount}`);
}

main().catch((err) => {
  console.error("Biography seeding failed:", err);
  process.exit(1);
});

function isSqliteBusyError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("SQLITE_BUSY");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function upsertBiographyWithRetry(input: {
  id: string;
  masterId: string;
  locale: string;
  content: string;
}): Promise<void> {
  for (let attempt = 0; attempt <= SQLITE_BUSY_RETRIES; attempt++) {
    try {
      await db
        .insert(masterBiographies)
        .values(input)
        .onConflictDoUpdate({
          target: masterBiographies.id,
          set: {
            content: input.content,
          },
        });
      return;
    } catch (error) {
      if (!isSqliteBusyError(error) || attempt === SQLITE_BUSY_RETRIES) {
        throw error;
      }

      await sleep(SQLITE_BUSY_BACKOFF_MS * (attempt + 1));
    }
  }
}

async function deleteBiographyCitationsWithRetry(biographyIds: string[]): Promise<void> {
  if (biographyIds.length === 0) return;

  for (let attempt = 0; attempt <= SQLITE_BUSY_RETRIES; attempt++) {
    try {
      await db
        .delete(citations)
        .where(
          and(
            eq(citations.entityType, "master_biography"),
            inArray(citations.entityId, biographyIds)
          )
        );
      return;
    } catch (error) {
      if (!isSqliteBusyError(error) || attempt === SQLITE_BUSY_RETRIES) {
        throw error;
      }

      await sleep(SQLITE_BUSY_BACKOFF_MS * (attempt + 1));
    }
  }
}

async function upsertBiographyCitationWithRetry(input: {
  id: string;
  sourceId: string;
  entityType: "master_biography";
  entityId: string;
  fieldName: string;
  excerpt: string;
  pageOrSection: string | null;
}): Promise<void> {
  for (let attempt = 0; attempt <= SQLITE_BUSY_RETRIES; attempt++) {
    try {
      await db
        .insert(citations)
        .values(input)
        .onConflictDoUpdate({
          target: citations.id,
          set: {
            sourceId: input.sourceId,
            fieldName: input.fieldName,
            excerpt: input.excerpt,
            pageOrSection: input.pageOrSection,
          },
        });
      return;
    } catch (error) {
      if (!isSqliteBusyError(error) || attempt === SQLITE_BUSY_RETRIES) {
        throw error;
      }

      await sleep(SQLITE_BUSY_BACKOFF_MS * (attempt + 1));
    }
  }
}
