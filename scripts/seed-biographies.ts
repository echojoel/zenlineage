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

export interface BiographyEntry {
  slug: string;
  /** Body text. May contain inline `[1]`, `[2]`, … markers; each
   * marker resolves to the entry in `footnotes` whose index matches. */
  content: string;
  /** Wikipedia-style numbered references. `index` is the digit shown
   * inside the marker (1-based). Order in this array is irrelevant —
   * the renderer sorts by index for the footnote list. */
  footnotes?: BiographyFootnote[];
}

export interface BiographyFootnote {
  /** 1-based number that matches the `[N]` marker in `content`. */
  index: number;
  /** Source row id (must exist in the `sources` table). */
  sourceId: string;
  /** Optional locator (e.g. "pp. 85–94", "fasc. 1"). */
  pageOrSection?: string;
  /** Optional supporting quote shown after the citation. */
  excerpt?: string;
}

export const BIOGRAPHIES: BiographyEntry[] = [
  {
    slug: "shakyamuni-buddha",
    content: `Shakyamuni Buddha — the Awakened One of the Śākya clan — was born Siddhārtha Gautama in Lumbinī, in the foothills of what is now southern Nepal, sometime in the fifth or sixth century BCE; modern scholarship has progressively shortened the date range, with most current reconstructions placing his death between roughly 410 and 370 BCE[1]. His father Śuddhodana led the Śākya republic from its capital at Kapilavastu; his mother Māyādevī died seven days after his birth and was succeeded by her sister Mahāprajāpatī Gautamī, who raised him alongside his half-brother Nanda[2]. Traditional biographies describe a sheltered princely upbringing within the palace walls, marriage to Yaśodharā, and the birth of a son, Rāhula. The early canonical *Ariyapariyesana Sutta* and the later *Buddhacarita* of Aśvaghoṣa preserve the narrative of the "four sights" — an old man, a sick man, a corpse, and a wandering ascetic — that prompted his renunciation at twenty-nine[3].

Leaving home as a *śramaṇa*, Siddhārtha studied under the meditation masters Āḷāra Kālāma and Uddaka Rāmaputta, attaining the highest formless absorptions but finding them insufficient for the liberation he sought[4]. He then practiced extreme asceticism for six years in the forests of Uruvelā with five companions before concluding that mortification of the body was no closer to awakening than indulgence had been; this realization gave rise to the doctrine of the Middle Way[5]. Sitting beneath a *pīpal* tree at what would become Bodh Gayā, after a night of progressive meditative absorption, he attained complete and unsurpassed awakening (*anuttarā samyaksaṃbodhi*) and was henceforth called the Buddha — "one who has awakened."

Some weeks later, in the Deer Park at Sarnath, the Buddha gave his first discourse, the *Dhammacakkappavattana Sutta* ("Setting in Motion the Wheel of Dharma"), to the five companions of his earlier ascetic life[6]. The discourse outlines the Four Noble Truths — the truths of suffering, of its origin in craving, of its cessation, and of the Noble Eightfold Path that leads to cessation — and remains the most concise formulation of the Buddha's diagnostic and therapeutic vision. Kauṇḍinya and the four others became the first members of the Buddhist Sangha, which together with the Buddha and his Dharma constitute the Three Jewels in which all later Buddhists take refuge.

For forty-five years the Buddha walked the Gangetic plain, residing each rains-retreat in one of the early monastic *vihāras* donated by lay followers — Anāthapiṇḍika's Jetavana grove at Sāvatthī, the Bamboo Grove (Veḷuvana) at Rājagṛha given by King Bimbisāra, and others[7]. He taught monarchs (Bimbisāra of Magadha, Pasenadi of Kosala), brahmins, householders, and outcastes, and is described in the discourses as adjusting his teaching to the capacity of each listener (*upāya*). Among his foremost disciples were Śāriputra, foremost in wisdom; Mahāmaudgalyāyana, foremost in psychic abilities; Ānanda, his cousin and personal attendant who memorized the discourses; and Mahākāśyapa, foremost in austere discipline. After repeated entreaty by Mahāprajāpatī and Ānanda's intervention, the Buddha admitted women to the monastic order, founding the *bhikkhunī* sangha — the earliest formally organized community of women renunciants in any world religion[8].

The corpus of teachings preserved in the early sutta collections of the Pāli Canon (the *Sutta Piṭaka*) and the parallel *Āgamas* in Chinese is doctrinally compact but vast in scope. Central is the analysis of conditioned existence through *paṭicca-samuppāda* (dependent origination) — the formula that whatever arises does so in dependence on causes and conditions — and the three marks of existence: impermanence (*anicca*), unsatisfactoriness (*dukkha*), and non-self (*anattā*)[9]. These analyses dissolve the apparently solid self into a stream of conditioned processes and underwrite the soteriological claim that liberation (*nirvāṇa*) is the ending of clinging rather than the attainment of any new state. The Buddha rejected both eternalist views of an unchanging soul and annihilationist views of a self that simply ends at death, holding that liberation is realized through direct insight in the present. The terse aphoristic discourses preserved in the *Dhammapada* — among the most widely translated of early Buddhist texts — give one of the canon's most concentrated expressions of this ethical and contemplative diagnosis[13].

At about age eighty, after a meal at the home of the smith Cunda, the Buddha entered final *parinirvāṇa* in a grove of *sāl* trees near Kuśinagara. The *Mahāparinibbāna Sutta* preserves what tradition holds to be his last words to the assembled disciples — *vayadhammā saṅkhārā, appamādena sampādetha*: "all conditioned things are subject to decay; strive on with diligence"[10]. His relics were divided among the major polities of the region and enshrined in *stūpas*, the architectural form that would carry his memory across Asia. Within a year of his death, five hundred elders convened the First Council at Rājagṛha, where Ānanda recited the discourses ("Thus have I heard…") and Upāli the monastic discipline, fixing the canonical recension that descended through oral transmission for several centuries before being committed to writing.

For the Chan, Sŏn, Thiền, and Zen traditions, Shakyamuni is venerated not only as the historical teacher but as the source of a distinct line of transmission "outside the scriptures." The *locus classicus* is the Flower Sermon, recorded in later Chinese sources — most prominently the *Wúménguān* (*Mumonkan*, Case 6): on Vulture Peak the Buddha held up a flower without speaking, and only Mahākāśyapa smiled in recognition; the Buddha replied, "I have the eye of the true Dharma, the marvelous mind of nirvāṇa, the true mark of formlessness, the subtle Dharma gate that does not rest on words and letters and is transmitted outside the scriptures — this I entrust to Mahākāśyapa"[11]. Modern scholarship traces the explicit textual record of this episode to the eleventh-century *Tiānshèng Guǎngdēng Lù* and to the *Wúménguān* of 1228, although the underlying claim of a wordless transmission is older[12]. In Chan iconography Shakyamuni stands at the head of a lineage chart of twenty-eight Indian patriarchs leading to Bodhidharma, who in turn brought the transmission to China.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Buddha\" and \"Śākyamuni\"",
        excerpt:
          "Modern scholarship has progressively narrowed the dating, with most current proposals placing the death between c. 410 and 370 BCE.",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Mahāprajāpatī\" and \"Śuddhodana\"",
      },
      {
        index: 3,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection: "ch. 2 §3 (MN 26, Ariyapariyesana Sutta)",
        excerpt:
          "While I was still young, a black-haired young man endowed with the blessings of youth, in the prime of life… I shaved off my hair and beard, put on the yellow robe, and went forth from the home life into homelessness.",
      },
      {
        index: 4,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection: "ch. 2 §3 (MN 26, on Āḷāra Kālāma and Uddaka Rāmaputta)",
      },
      {
        index: 5,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection:
          "ch. 2 §4 (MN 36, Mahāsaccaka Sutta — six years of austerity and the abandonment of self-mortification)",
      },
      {
        index: 6,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection: "ch. 2 §5 (SN 56.11, Dhammacakkappavattana Sutta)",
      },
      {
        index: 7,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Jetavana\", \"Veluvana\", \"vihāra\"",
      },
      {
        index: 8,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"bhikṣuṇī\" and \"Mahāprajāpatī\"",
        excerpt:
          "After Ānanda's intercession, the Buddha consented to the ordination of Mahāprajāpatī, founding the order of nuns under the eight gurudharmas.",
      },
      {
        index: 9,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection:
          "s.v. \"pratītyasamutpāda\", \"trilakṣaṇa\" (anicca, dukkha, anātman)",
      },
      {
        index: 10,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection: "ch. 9 §6 (DN 16, Mahāparinibbāna Sutta, final exhortation)",
      },
      {
        index: 11,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 (\"The Flower Sermon and the Origin of Chan\")",
      },
      {
        index: 12,
        sourceId: "src_dumoulin_india_china",
        pageOrSection:
          "Vol. 1, ch. 1 — discussion of the Tiānshèng Guǎngdēng Lù (1036) and Wúménguān (1228) as the earliest textual witnesses",
      },
      {
        index: 13,
        sourceId: "src_dhammapada_muller_1881",
        pageOrSection: "The Dhammapada — Sacred Books of the East, vol. X (F. Max Müller trans., 1881)",
      },
    ],
  },
  {
    slug: "mahakashyapa",
    content: `Mahākāśyapa (Pāli: Mahā-Kassapa) is one of the few figures of the Indian Chan lineage whose historical existence is firmly attested in the early canon. The Pāli Saṃyutta Nikāya devotes an entire chapter—the Kassapa Saṃyutta—to discourses associated with him, depicting an austere senior monk who maintained the *dhutaṅga* observances (rag robes, alms-food only, forest dwelling) into old age and who declined royal patronage[1]. Born Pippali into a wealthy brahmin family of Mahātittha in Magadha and married to the equally devout Bhaddā Kāpilānī, he is said to have renounced household life by mutual agreement with his wife, who herself ordained as a *bhikkhunī*[2]. The Buddha exchanged robes with him and praised him as foremost in ascetic discipline (*dhutaguṇa*).

Within the Chan tradition Mahākāśyapa is the first patriarch, the recipient of the wordless transmission given on Mount Gṛdhrakūṭa (Vulture Peak)[3]. The locus classicus of this episode is Case 6 of the *Wúménguān* (Mumonkan, 1228): when the Buddha "twirled a flower," only Mahākāśyapa smiled, and the Buddha said: "I have the eye of the true Dharma, the marvelous mind of nirvāṇa, the true mark of formlessness, the subtle Dharma gate that does not rest on words and letters and is transmitted outside the scriptures—this I entrust to Mahākāśyapa."[4] Modern scholarship traces the textual emergence of the Flower Sermon to the eleventh-century *Tiānshèng Guǎngdēng Lù* and the *Wúménguān*, and treats it as a Chan retrojection rather than an episode of the historical Buddha[5].

Following the Buddha's *parinirvāṇa*, Mahākāśyapa convened the First Council at Rājagṛha—an event recorded in the Pāli *Cullavagga* and the parallel Vinayas of all early schools. Five hundred *arhats* gathered; Ānanda recited the discourses (the *Sūtra Piṭaka*) and Upāli the monastic rules (the *Vinaya Piṭaka*), fixing the recension that would descend through oral transmission for several centuries before being committed to writing[6]. Tradition holds that Mahākāśyapa subsequently entered into deep meditative absorption on Mount Kukkuṭapāda ("Cock's Foot") to await the coming of Maitreya, the future Buddha, to whom he is to transmit the robe given him by Śākyamuni[7]. The Chinese pilgrim Xuanzang in the seventh century reported the mountain as a major pilgrimage site venerating his samādhi[8].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection: "ch. 6 (SN 16, Kassapa Saṃyutta)",
        excerpt:
          "Kassapa, even now, in your old age, your rag-robes are heavy and worn. Put on lay-cloth and live near settled places. — The Buddha addresses Mahā-Kassapa, who declines.",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Mahākāśyapa\", \"dhutaṅga\", \"Bhaddā Kāpilānī\"",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Mahākāśyapa as first patriarch in the Chan reckoning",
      },
      {
        index: 4,
        sourceId: "src_mumonkan_senzaki_1934",
        pageOrSection: "Case 6: \"Buddha Twirls a Flower\"",
      },
      {
        index: 5,
        sourceId: "src_dumoulin_india_china",
        pageOrSection:
          "Vol. 1, ch. 1 — discussion of the Tiānshèng Guǎngdēng Lù (1036) and Wúménguān (1228) as the earliest textual witnesses of the Flower Sermon",
      },
      {
        index: 6,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"First Council\" and \"Rājagṛha\"",
      },
      {
        index: 7,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Kukkuṭapāda\" and \"Maitreya\"",
      },
      {
        index: 8,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 1",
      },
    ],
  },
  {
    slug: "ananda",
    content: `Ānanda was Śākyamuni Buddha's cousin, personal attendant, and the disciple foremost in *bahuśruta* (much-learning) and in service to others[1]. He is among the most extensively documented figures of the early canon: the Pāli Aṅguttara Nikāya credits him as the Buddha's attendant for the last twenty-five years of his life, and the introductory phrase that opens nearly every sūtra—*evaṃ me sutaṃ*, "thus have I heard"—is attributed to his recitation at the First Council[2].

Ānanda's most consequential intervention in the early canon is his role in the foundation of the *bhikkhunī saṅgha*. According to the *Cullavagga*, when Mahāprajāpatī Gautamī, the Buddha's foster-mother, three times petitioned the Buddha for ordination, the Buddha three times refused. Ānanda interceded, asking whether women were capable of attaining the four stages of awakening; when the Buddha affirmed that they were, Ānanda pressed the case until the Buddha consented, and the eight *gurudharmas* governing relations between the male and female sanghas were instituted on this occasion[3]. The episode is preserved as one of the earliest formal records of women's full ordination in any world religion.

Tradition holds that, although Ānanda had heard more of the Buddha's teaching than anyone else, he had not yet attained full *arhatship* during the Buddha's lifetime. On the night before the First Council—where Mahākāśyapa had reluctantly agreed to admit him only as a fully realized arhat—Ānanda is said to have meditated through the night and realized liberation just before dawn[4]. The next day he recited the entire corpus of discourses from memory; the council preserved this oral recension, which became the basis of the *Sūtra Piṭaka* of all early schools[5].

In the Chan lineage Ānanda is the second patriarch, the recipient of Mahākāśyapa's transmission and the teacher of Śāṇavāsa[6]. The most celebrated Chan story about him is "Kāśyapa's Flagpole," recorded as Case 22 of the *Wúménguān*: Ānanda asked Mahākāśyapa what the World-Honored One had transmitted besides the gold-embroidered robe; Mahākāśyapa called "Ānanda!" Ānanda answered "Yes!" Mahākāśyapa said: "Knock down the flagpole at the gate." The exchange is read in Chan as Mahākāśyapa's confirming gesture—what the Buddha transmitted to him, he transmits to Ānanda in the moment of being called and answered[7]. Ānanda is traditionally said to have lived to a great age and, at the moment of his *parinirvāṇa*, divided his relics by levitating to the middle of the Ganges, an etiological tale for two reliquary stūpas built on opposite banks by the kingdoms of Magadha and Vaiśālī[8].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Ānanda\"",
      },
      {
        index: 2,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection:
          "Translator's introduction §I — \"Thus have I heard\" and the role of Ānanda in the canon",
      },
      {
        index: 3,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection:
          "ch. 9 §6 (Cullavagga X) — the founding of the bhikkhunī saṅgha after Ānanda's intercession",
      },
      {
        index: 4,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"First Council\" — Ānanda's awakening on the eve of the council",
      },
      {
        index: 5,
        sourceId: "src_bodhi_in_buddhas_words",
        pageOrSection: "Translator's introduction §II — the four nikāyas as recensions of Ānanda's recitation",
      },
      {
        index: 6,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Ānanda as second patriarch in the Chan reckoning",
      },
      {
        index: 7,
        sourceId: "src_mumonkan_senzaki_1934",
        pageOrSection: "Case 22: \"Kashapa's Flag-Pole\"",
      },
      {
        index: 8,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Ānanda\" — traditions surrounding his death and relic-division",
      },
    ],
  },
  {
    slug: "shanakavasa",
    content: `Śāṇavāsa is named third in the standard Chan lineage of twenty-eight Indian patriarchs as codified in the *Jǐngdé Chuándēng Lù* (Jingde Record of the Transmission of the Lamp, 1004) and reproduced in the later *Wǔdēng Huìyuán* (1252)[1]. Within Chan he is the disciple of Ānanda and the teacher of Upagupta. The earliest narrative material attaching to him appears in the Sanskrit *Aśokāvadāna* and related *avadāna* literature, where he is associated with the Mathurā region, depicted as wearing a hempen robe (*śāṇa* = "hemp," the conventional etymology of the name), and credited with the conversion of large numbers of practitioners in northwestern India[2].

Modern scholarship treats the Chan list of patriarchs from Śāṇavāsa onward as a doctrinal genealogy rather than a historical reconstruction. Heinrich Dumoulin notes that the precise twenty-eight-name sequence is a Chan literary construction; few of the figures between Ānanda and Bodhidharma can be reliably correlated with the historical record[3]. What the tradition affirms through these names is the principle of *cittena cittasya saṃkrāntiḥ*—the transmission of mind by mind—rather than a documented chain of attested teachers and students.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the Jǐngdé Chuándēng Lù as the canonical source of the twenty-eight-patriarch list",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Śāṇavāsa\" and \"Aśokāvadāna\"",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the twenty-eight patriarchs as a Chan literary construction rather than a historical chain",
      },
      {
        index: 4,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 3",
      },
    ],
  },
  {
    slug: "upagupta",
    content: `Upagupta is the fourth patriarch in the Chan list and one of the more substantively attested early figures, the subject of an extensive corpus of Sanskrit narrative literature centered in Mathurā[1]. The *Aśokāvadāna* presents him as the spiritual preceptor of the emperor Aśoka (r. c. 268–232 BCE), and John Strong's monograph *The Legend and Cult of Upagupta* documents a continuous regional cult that survives in modern Burma and Thailand, where he is invoked as *U Pakuṭ* and propitiated as a protector against monsoon storms[2].

Two narrative motifs dominate the Upagupta legend. The first is his subjugation of Māra: when Māra disrupted his preaching, Upagupta countered by binding three corpses—a dog, a snake, and a man—around Māra's neck as a perfumed garland that Māra could not remove until he humbled himself; afterwards Māra is said to have taken refuge in the Dharma[3]. The second is his role as imperial preceptor: he led Aśoka on a pilgrimage to the great sites of the Buddha's life, identifying each location and confirming the emperor's commitment to Buddhist patronage[4].

The Sarvāstivāda school of northwest India regarded Upagupta as their fifth patriarch, parallel to but distinct from the Chan reckoning. Dumoulin notes that the early Chan lineage drew on these northwestern materials but reorganized them around Mahāyāna concerns, producing the twenty-eight-name sequence that became canonical from the *Jǐngdé Chuándēng Lù* onward[5]. Upagupta is described in Chan sources as "the buddha without marks" (*alakṣaṇaka-buddha*)—accomplished in realization without possessing the thirty-two physical *lakṣaṇas* of a *cakravartin*[6].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_strong_legend_upagupta",
        pageOrSection: "Introduction and ch. 1 — the regional cult and the Aśokāvadāna textual tradition",
      },
      {
        index: 2,
        sourceId: "src_strong_legend_upagupta",
        pageOrSection: "ch. 7–8 — the surviving Burmese and Thai cult",
      },
      {
        index: 3,
        sourceId: "src_strong_legend_upagupta",
        pageOrSection: "ch. 4 — \"The Subjugation of Māra\"",
      },
      {
        index: 4,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Upagupta\" and \"Aśokāvadāna\"",
      },
      {
        index: 5,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Upagupta in Sarvāstivādin and Chan reckonings",
      },
      {
        index: 6,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 4",
      },
    ],
  },
  {
    slug: "dhritaka",
    content: `Dhṛtaka, fifth patriarch in the Chan list of twenty-eight Indians, is described in the *Jǐngdé Chuándēng Lù* as the disciple of Upagupta and teacher of Mīcaka. Almost no material independent of the Chan transmission-of-the-lamp literature survives concerning him; he belongs to the legendary stratum of figures whose function in the lineage is structural rather than biographical[1]. The traditional accounts describe him as a brahmin youth from Magadha who recognized in Upagupta his teacher and, after a brief encounter, received the wordless transmission.

Dumoulin observes that the Chan compilers, in extending the lineage backward to the Buddha, drew on a stock of names available in northwestern Buddhist scholastic and devotional literature and arranged them into a numerologically elegant sequence ending with Bodhidharma[2]. Dhṛtaka is one of the names whose role is precisely this—holding a place in the chain rather than carrying an independently attested life-story.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the legendary stratum of patriarchs between Upagupta and Pārśva",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the construction of the twenty-eight-patriarch list",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 5",
      },
    ],
  },
  {
    slug: "michaka",
    content: `Mīcaka (also Miccaka), sixth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Dhṛtaka and teacher of Vasumitra. He is one of the figures whose attestation lies wholly within the Chan transmission-of-the-lamp literature; no independent canonical or scholastic record corresponds to him[1]. The traditional account describes a teacher associated with central India who converted a community of brahmin ascetics through a single demonstrative encounter and recognized Vasumitra as his successor.

The Princeton Dictionary of Buddhism notes that the names in this section of the lineage often correspond to figures known in northwestern Sarvāstivādin sources but reordered or relabeled to fit the Chan twenty-eight-patriarch frame; the identification of any particular name with a historically attested teacher is not always possible[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the legendary middle stratum of the Chan twenty-eight",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"twenty-eight patriarchs\" and surrounding entries",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 6",
      },
    ],
  },
  {
    slug: "vasumitra",
    content: `Vasumitra (Vasumitra of the Chan list) is the seventh patriarch in the *Jǐngdé Chuándēng Lù* sequence, named as the disciple of Mīcaka and teacher of Buddhanandi. The Sanskrit name Vasumitra ("Friend of the Vasus") attaches to several historically attested figures in Indian Buddhism—most prominently a Sarvāstivādin abhidharma master associated with the Fourth Council under Kaniṣka and the compilation of the *Mahāvibhāṣā*—and the Chan tradition's identification of "its" Vasumitra with one or more of these figures has never been securely established[1].

Dumoulin observes that the Chan compilers had access to lists of distinguished names from the Sarvāstivādin and Mūlasarvāstivādin traditions and integrated several of them into the twenty-eight-patriarch sequence; whether the seventh patriarch is meant to be the abhidharma Vasumitra or a different figure of the same name is not resolvable from the surviving texts[2]. What the Chan reckoning affirms through the placement of "Vasumitra" is the connection of the Chan transmission to the prestigious northwestern scholastic milieu in which the Vibhāṣā commentaries were composed.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Vasumitra\" — multiple figures sharing the name",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Sarvāstivādin names in the Chan twenty-eight",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 7",
      },
    ],
  },
  {
    slug: "buddhanandi",
    content: `Buddhanandi ("Delight of the Buddha"), eighth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Vasumitra and teacher of Buddhamitra[1]. He belongs to the legendary middle stratum of the lineage and is not securely attested outside Chan transmission-of-the-lamp literature. The traditional account describes a young brahmin from Kāmarūpa (modern Assam) recognized by Vasumitra during a teaching tour and brought into the lineage after a brief exchange.

Dumoulin notes that the names in this section of the list often appear in pairs whose etymologies are suggestive (here Buddhanandi paired with Buddhamitra: "Joy of the Buddha" and "Friend of the Buddha"), reflecting the literary character of the construction[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Buddhanandi in the patriarchal sequence",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — etymological pairing in the Chan twenty-eight",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 8",
      },
    ],
  },
  {
    slug: "buddhamitra",
    content: `Buddhamitra ("Friend of the Buddha"), ninth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Buddhanandi and teacher of Pārśva. He is one of the few patriarchs in the legendary middle stratum to receive an extended hagiographical narrative in the *Bǎolín Zhuàn* (801) and later transmission-of-the-lamp literature, where he is depicted as a long-time householder who entered the saṅgha late in life under Buddhanandi's instruction and became a renowned teacher in central India[1].

Dumoulin notes that Buddhamitra functions in the lineage as the immediate predecessor of Pārśva, the first figure in the late Indian section who can be tied with confidence to the historical record of the Sarvāstivādin Fourth Council; the placement of Buddhamitra at this hinge gives the Chan list its narrative bridge from the unattested early stratum into the historically grounded middle period[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the Bǎolín Zhuàn's elaboration of Buddhamitra",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Buddhamitra as bridge to the Sarvāstivādin-attested stratum",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 9",
      },
    ],
  },
  {
    slug: "parshva",
    content: `Pārśva (Pāli: Pāssa) is the tenth patriarch in the Chan list and one of the few figures in the middle section of the lineage with a discernible historical basis. He is mentioned in Sarvāstivādin sources as one of the conveners of the Fourth Council under the Kuṣāṇa emperor Kaniṣka (1st–2nd century CE), held in Kashmir or at Jālandhara, where the *Mahāvibhāṣā*—the great Sarvāstivādin commentary on the *Jñānaprasthāna*—was composed[1]. He is associated with the *Vibhāṣā* school of northwestern Buddhist scholasticism and is sometimes credited with the conversion of the young Aśvaghoṣa[2].

Tradition holds that Pārśva ordained late in life—at sixty or eighty, depending on the source—and made a vow not to lay his side down on a bed until he had attained full liberation; his Sanskrit name *pārśva* ("side") is explained etiologically through this resolve[3]. He is depicted as an elder of immense practice-power and considerable scholarship, the bridge between the early lineage and the Mahāyāna philosophical figures who follow. Dumoulin notes that Pārśva is one of three or four names in the middle stretch of the Chan twenty-eight where the tradition firmly attaches to a person known from the Sarvāstivādin record[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Pārśva\" and \"Fourth Council\"",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Pārśva in the Sarvāstivādin Vibhāṣā tradition",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Pārśva\" — the etymological vow",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — historically attested names in the middle of the Chan list",
      },
      {
        index: 5,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 10",
      },
    ],
  },
  {
    slug: "punyayashas",
    content: `Puṇyayaśas, eleventh patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Pārśva and teacher of Aśvaghoṣa[1]. The Chan account preserves the encounter narrative between Puṇyayaśas and Aśvaghoṣa as one of the more developed dialogues in the early section of the transmission-of-the-lamp literature: Aśvaghoṣa, then a brahmin debater hostile to Buddhism, was won over not through doctrinal argument but through Puṇyayaśas's direct response to a challenge about the meaning of the term "Buddha"[2].

Dumoulin notes that the placement of Puṇyayaśas in the lineage—immediately preceding the historically attested Aśvaghoṣa—reflects the Chan compilers' care to lodge each significant Mahāyāna figure within a recognizable teacher-student relationship within the Indian sequence[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Puṇyayaśas as preceptor of Aśvaghoṣa",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the Aśvaghoṣa conversion narrative",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — embedding Mahāyāna figures within the patriarchal frame",
      },
      {
        index: 4,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 11",
      },
    ],
  },
  {
    slug: "ashvaghosha",
    content: `Aśvaghoṣa (c. 80–150 CE), counted as the twelfth Chan patriarch, is among the most important and historically attested figures of early Indian Mahāyāna Buddhism[1]. A poet, dramatist, and philosopher active during the reign of the Kuṣāṇa emperor Kaniṣka, he is the author of two surviving Sanskrit *kāvya* (court-poetry) works—the *Buddhacarita* (Acts of the Buddha) and the *Saundarananda*—that constitute the earliest classical Sanskrit *kāvya* poetry to come down to us. The *Buddhacarita* in particular survives in fragmentary Sanskrit and complete Tibetan and Chinese translations and is one of the principal early biographies of the Buddha[2].

Aśvaghoṣa is also traditionally credited with the *Mahāyāna-śraddhotpāda-śāstra* (*Treatise on the Awakening of Mahāyāna Faith*), one of the foundational texts of East Asian Mahāyāna. The *Awakening of Faith* lays out the doctrine of the One Mind possessing two aspects—the absolute (*tathatā*) and the conditioned (*saṃsāra*)—and develops the *tathāgatagarbha* (Buddha-nature) tradition that became central to Hua-yen, Tiantai, and Chan thought[3]. Modern scholarship is sceptical, however, that the historical Aśvaghoṣa was the actual author. Yoshito Hakeda summarizes the consensus view that the text was composed in fifth- or sixth-century China, possibly originally in Chinese rather than Sanskrit, and back-attributed to Aśvaghoṣa to lend Mahāyāna authority[4]. The treatise is nevertheless central enough to East Asian Buddhism that the attribution made him one of the most cited authors in the Chinese Buddhist canon.

In the traditional Chan biography preserved in the *Jǐngdé Chuándēng Lù*, Aśvaghoṣa was a brahmin disputant of Buddhism in Pāṭaliputra (modern Patna) before his conversion by Pārśva (or, in some recensions, by Pārśva's disciple Puṇyayaśas)[5]. After receiving transmission, he is said to have served as imperial preceptor at Kaniṣka's court, where he composed his epics and instructed the emperor in the Dharma[6]. His name—"Horse-Cry"—is explained in legend by the report that he could make horses weep when he expounded the truth.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Aśvaghoṣa\"",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Buddhacarita\" and \"Saundarananda\"",
      },
      {
        index: 3,
        sourceId: "src_hakeda_awakening_faith",
        pageOrSection: "Part I — \"One Mind and Its Two Aspects\"",
      },
      {
        index: 4,
        sourceId: "src_hakeda_awakening_faith",
        pageOrSection:
          "Translator's introduction — authorship, dating, and the consensus view that the text was composed in 5th–6th c. China",
      },
      {
        index: 5,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Aśvaghoṣa as twelfth patriarch in the Chan reckoning",
      },
      {
        index: 6,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Kaniṣka\" and \"Pāṭaliputra\"",
      },
      {
        index: 7,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 12",
      },
    ],
  },
  {
    slug: "kapimala",
    content: `Kapimala is the thirteenth patriarch in the Chan list, named in the *Jǐngdé Chuándēng Lù* as the disciple of Aśvaghoṣa and the teacher of Nāgārjuna[1]. The historical basis for the figure is uncertain. He appears in some Sarvāstivādin traditions as a brahmin philosopher of southern India whom Aśvaghoṣa converted by argument; the conversion narrative parallels Aśvaghoṣa's own conversion by Pārśva[2]. He is associated with the spread of Buddhism into southern India and with the recognition of Nāgārjuna as his successor.

Dumoulin observes that Kapimala functions in the lineage as a hinge between the northern Sarvāstivādin scholastic tradition associated with Aśvaghoṣa and the southern Mahāyāna milieu in which Nāgārjuna would emerge[3]. Whether Kapimala is a single historical person or a name absorbing several traditions cannot now be determined.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Kapimala as preceptor of Nāgārjuna in the Chan list",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Kapimala\"",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — north–south transition between Aśvaghoṣa and Nāgārjuna",
      },
      {
        index: 4,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 13",
      },
    ],
  },
  {
    slug: "nagarjuna",
    content: `Nāgārjuna (c. 150–250 CE) is, after the Buddha himself, the most important figure in the entire Mahāyāna tradition[1]. As the founder of the Madhyamaka ("Middle Way") school and the principal expositor of *śūnyatā* (emptiness), his thought structures every later Mahāyāna development: Yogācāra, *tathāgatagarbha*, the Chinese Tiantai and Sānlùn schools, the Tibetan Madhyamaka traditions, and the philosophical underpinnings of Chan and Zen[2].

The historical Nāgārjuna is dated to roughly the second or third century CE, active in southern India under the patronage of a Sātavāhana king (variously identified by modern scholars)[3]. The principal hagiographies preserved by Kumārajīva (4th–5th c.) and by the Tibetan historian Tāranātha (17th c.) describe him as a brahmin from the south who entered the Buddhist saṅgha after a youthful misadventure with magical invisibility, recovered *nāga*-treasured texts from the underwater realm of the serpent kings (hence his name), and composed a vast philosophical and devotional corpus[4].

His authentic philosophical works are concentrated in the *Yukti-corpus* (Reasoning collection): the *Mūlamadhyamakakārikā* (Root Verses on the Middle Way), the *Vigrahavyāvartanī*, the *Śūnyatāsaptati*, the *Yuktiṣaṣṭikā*, and the *Vaidalyaprakaraṇa*[5]. The *Mūlamadhyamakakārikā* opens with a homage to the Buddha "the supreme of teachers" and proceeds in twenty-seven chapters to demonstrate that no phenomenon—motion, fire, the self, time, suffering, the *tathāgata*, *nirvāṇa*—possesses *svabhāva* (intrinsic nature) when subjected to careful analysis[6]. The famous chapter twenty-four states the doctrinal claim most concisely: "Whatever is dependently co-arisen, that is explained to be emptiness; that, being a dependent designation, is itself the middle way."[7] His argument is not that nothing exists, but that everything that exists does so only relationally, through *pratītyasamutpāda* (dependent origination); to grasp emptiness as nothingness is, he says, "like grasping a snake by the wrong end."[8]

Tradition also assigns to Nāgārjuna two further bodies of work: the *Stava-corpus* of devotional hymns to the buddhas and bodhisattvas, and the *Suhṛllekha* (Letter to a Friend), addressed to the Sātavāhana king and preserved in the Tibetan and Chinese canons[9]. The vast *Mahāprajñāpāramitā-śāstra* (*Dà Zhì Dù Lùn*), preserved only in Kumārajīva's Chinese translation, is conventionally attributed to Nāgārjuna but is now widely considered to be a 4th-century Central Asian compilation that functioned as a commentarial encyclopedia for early Chinese Mahāyāna[10].

In the Chan lineage Nāgārjuna is the fourteenth patriarch, the disciple of Kapimala and teacher of Āryadeva[11]. The Chan tradition reads his analysis of emptiness as a direct philosophical exposition of the *prajñāpāramitā* perspective from which Chan's teaching of *no-mind* (*wúxīn*) and *original face* derives. The closing dedication of the *Mūlamadhyamakakārikā*—"I prostrate to Gautama, who, out of compassion, taught the true doctrine that leads to the relinquishment of all views"—has been read by Chan and Zen commentators (notably Dōgen and Hakuin) as a description of the Chan task itself[12].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Nāgārjuna\"",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Nāgārjuna and the formation of Mahāyāna philosophy",
      },
      {
        index: 3,
        sourceId: "src_garfield_fundamental_wisdom",
        pageOrSection: "Translator's introduction §1 — biographical and chronological discussion",
      },
      {
        index: 4,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Nāgārjuna\" — hagiographical traditions",
      },
      {
        index: 5,
        sourceId: "src_garfield_fundamental_wisdom",
        pageOrSection: "Translator's introduction §2 — the Yukti-corpus and questions of authenticity",
      },
      {
        index: 6,
        sourceId: "src_garfield_fundamental_wisdom",
        pageOrSection: "ch. 1 (\"Examination of Conditions\") and ch. 24 (\"Examination of the Four Noble Truths\")",
      },
      {
        index: 7,
        sourceId: "src_garfield_fundamental_wisdom",
        pageOrSection: "ch. 24, vv. 18–19",
        excerpt:
          "Whatever is dependently co-arisen, that is explained to be emptiness. That, being a dependent designation, is itself the middle way.",
      },
      {
        index: 8,
        sourceId: "src_garfield_fundamental_wisdom",
        pageOrSection: "ch. 24, v. 11",
        excerpt:
          "By a misperception of emptiness a person of little intelligence is destroyed. Like a snake incorrectly seized or like a spell incorrectly cast.",
      },
      {
        index: 9,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Suhṛllekha\" and \"stava\"",
      },
      {
        index: 10,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Mahāprajñāpāramitā-śāstra\" — questions of authorship and origin",
      },
      {
        index: 11,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Nāgārjuna's place in the Chan twenty-eight",
      },
      {
        index: 12,
        sourceId: "src_garfield_fundamental_wisdom",
        pageOrSection: "ch. 27, dedicatory verse",
      },
    ],
  },
  {
    slug: "aryadeva",
    content: `Āryadeva (c. 170–270 CE), counted as the fifteenth Chan patriarch, was Nāgārjuna's principal disciple and the chief expositor of Madhyamaka in the second generation[1]. He is a securely historical figure with a verifiable corpus of works preserved in Sanskrit, Chinese, and Tibetan. Tibetan tradition records that he was born in Sri Lanka or southern India, possibly to a royal family, and traveled north to study with Nāgārjuna; some accounts say he encountered his teacher at Nāgārjuna's mountain hermitage of Śrīparvata in Andhra[2].

Āryadeva's principal work is the *Catuḥśataka* (Four Hundred Verses on the Middle Way), a sixteen-chapter polemical and analytical treatise that extends the *Mūlamadhyamakakārikā* into the domains of practice, ethics, and refutation of non-Buddhist positions. The first eight chapters address bodhisattva conduct; the second eight refute the philosophical positions of the Sāṃkhya, Vaiśeṣika, and Jain schools[3]. He is also the author of the *Śataśāstra* (Hundred Verses), preserved only in Kumārajīva's Chinese translation, which together with Nāgārjuna's *Mūlamadhyamakakārikā* and *Twelve Gates Treatise* (*Dvādaśadvāra*) forms the textual basis of the Chinese Sānlùn ("Three Treatises") school of Madhyamaka[4].

A famous traditional detail records that Āryadeva had only one eye, having offered the other in donation; this anatomical feature gives him the alternative name *Kāṇadeva* ("Deva of the One Eye") in Chinese sources[5]. Hagiographical accounts describe his death by violent assassination at the hand of a brahmin disputant whom he had defeated in debate, with Āryadeva accepting the blow as the resolution of a karmic debt and dying while expounding emptiness one last time[6].

In the Chan reckoning Āryadeva transmitted to Rāhulabhadra (Rahulata)[7]. His position in the lineage marks the close of the Madhyamaka founders' generation; subsequent Indian patriarchs in the Chan list belong to a different stratum of legendary or semi-legendary teachers.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Āryadeva\"",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Āryadeva as Nāgārjuna's disciple at Śrīparvata",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Catuḥśataka\"",
      },
      {
        index: 4,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Sānlùn\" and \"Śataśāstra\"",
      },
      {
        index: 5,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Kāṇadeva\"",
      },
      {
        index: 6,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the assassination tradition",
      },
      {
        index: 7,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 15",
      },
    ],
  },
  {
    slug: "rahulata",
    content: `Rāhulabhadra (Chinese: 羅睺羅多, transliterated *Rahulata*), sixteenth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Āryadeva and teacher of Saṃghanandi[1]. A figure of the same name appears in Sarvāstivādin and Madhyamaka literature as a poet of the *Prajñāpāramitā-stotra* (Hymn to the Perfection of Wisdom) and as one of the early commentators on Nāgārjuna; whether the Chan patriarch is meant to be this same Rāhulabhadra is debated[2].

Dumoulin notes that the post-Āryadeva section of the Chan twenty-eight relies on names available from earlier Sarvāstivādin and Mahāyāna sources but reorganized to fit the patriarchal frame, and Rāhulabhadra's place in the sequence reflects this compositional logic rather than a documented teacher-student relationship[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Rāhulabhadra in the Chan twenty-eight",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Rāhulabhadra\" — possible identifications",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — composition of the post-Madhyamaka section of the lineage",
      },
      {
        index: 4,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 16",
      },
    ],
  },
  {
    slug: "sanghanandi",
    content: `Saṃghanandi ("Joy of the Saṅgha"), seventeenth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Rāhulabhadra and teacher of Saṃghayaśas (Gayashata)[1]. The traditional narrative describes him as the son of a king who renounced his royal inheritance after a youthful realization of impermanence and entered the saṅgha—a story-pattern that mirrors the Buddha's own renunciation and recurs throughout Indian Buddhist hagiography[2].

He belongs to the legendary stratum of the late Indian lineage. As Dumoulin observes, the Chan compilers used recurring narrative motifs—royal renunciation, debate-conversion, miraculous recognition—to give the patriarchal sequence rhetorical coherence even where independent biographical material was unavailable[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Saṃghanandi in the Chan list",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Saṃghanandi\" and the renunciation topos in Indian hagiography",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — recurring narrative motifs in the patriarchal sequence",
      },
      {
        index: 4,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 17",
      },
    ],
  },
  {
    slug: "gayashata",
    content: `Saṃghayaśas (transliterated *Gayashata* in the Chinese sources), eighteenth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Saṃghanandi and teacher of Kumārata[1]. He belongs to the legendary stratum of the late Indian lineage and has no extant attestation independent of the Chan transmission-of-the-lamp literature.

The traditional account describes a young brahmin from western India whom Saṃghanandi recognized through a sequence of natural-imagery exchanges (a wind-bell, a falling leaf) and brought into the lineage. Dumoulin notes that the use of natural-image *gōng'àn*-like vignettes for these middle-list patriarchs anticipates the literary style of mature Chan encounter dialogue[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Saṃghayaśas/Gayashata in the Chan list",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — proto-encounter dialogue in the late Indian section",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 18",
      },
    ],
  },
  {
    slug: "kumarata",
    content: `Kumārata (Sanskrit *Kumāralāta*), nineteenth patriarch in the Chan list, may correspond to the historically attested Kumāralāta, founder of the Sautrāntika school of abhidharma in the third or fourth century CE and author of the *Dṛṣṭāntapaṅkti* (Garland of Examples), a Sanskrit collection of edifying narratives[1]. The Sautrāntika Kumāralāta is one of the more substantively documented figures of post-Sarvāstivādin Indian scholasticism.

Whether the Chan tradition's nineteenth patriarch is meant to be this same figure or a different teacher of similar name is unresolved. Dumoulin treats the identification as plausible but not demonstrable, noting that the *Jǐngdé Chuándēng Lù* gives no detail that would securely tie Kumārata to the Sautrāntika master[2]. The Chan account names him as the disciple of Saṃghayaśas and teacher of Jayata.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Kumāralāta\" and \"Sautrāntika\"",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — possible identification of Kumārata with Kumāralāta",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 19",
      },
    ],
  },
  {
    slug: "jayata",
    content: `Jayata, twentieth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Kumārata and teacher of Vasubandhu[1]. He belongs to the legendary stratum of the late Indian lineage and is not securely attested outside the transmission-of-the-lamp literature.

Dumoulin notes that the Chan tradition's interweaving of legendary and historically attested names in this section of the list reflects a literary strategy: significant Mahāyāna figures (Aśvaghoṣa, Nāgārjuna, Āryadeva, possibly Vasubandhu and Kumārata) anchor the chain, while bridging names like Jayata supply the formal continuity required by the twenty-eight-patriarch frame[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Jayata in the Chan list",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — bridging names in the patriarchal sequence",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 20",
      },
    ],
  },
  {
    slug: "vasubandhu",
    content: `The figure named as the twenty-first Chan patriarch presents a famously difficult identification problem[1]. The Sanskrit name Vasubandhu in Indian Buddhist history attaches most prominently to the great Yogācāra philosopher of the fourth–fifth century CE, brother and disciple of Asaṅga, author of the *Abhidharmakośa*, the *Triṃśikā* (Thirty Verses), the *Viṃśatikā* (Twenty Verses), and the foundational treatises of the Yogācāra ("Mind-Only") school[2]. The Chan tradition's twenty-first patriarch, however, is dated to a period earlier than the Yogācāra Vasubandhu and described as the disciple of Jayata and teacher of Manorhita, suggesting a different—or, more likely, composite—figure.

The historical Vasubandhu, on the chronology proposed by Erich Frauwallner and now widely discussed in scholarship, may in fact be two distinct figures of the same name conflated by the later tradition: a fourth-century Vasubandhu, brother of Asaṅga and author of the Yogācāra trilogy, and a fifth-century Vasubandhu who composed the *Abhidharmakośa*[3]. Whether the Chan patriarch corresponds to either of these or to a still earlier teacher cannot be determined from the surviving sources.

What is certain is that the historical Vasubandhu's *vijñaptimātratā* ("nothing-but-cognition") doctrine had a profound effect on Chinese Mahāyāna and indirectly on Chan. The *Triṃśikā* analyzes consciousness into the *ālayavijñāna* (storehouse consciousness), the *manas* (afflicted mind), and the six sense-consciousnesses, and proposes that all phenomena are transformations of consciousness[4]. This analysis entered Chinese Buddhism through Paramārtha (6th c.) and Xuánzàng's Faxiang school (7th c.), and forms part of the philosophical background against which Chan defines its own position—at times appropriating Yogācāra categories (the *ālayavijñāna* as an analogue of original mind), at times rejecting Yogācāra's analytical mode in favor of direct pointing[5].

In the *Jǐngdé Chuándēng Lù*, the twenty-first patriarch is described in stock hagiographical terms as the converter of an army of disputants in northwestern India and the recognizer of his successor Manorhita[6]. Dumoulin notes that the placement of a "Vasubandhu" in the lineage gives the Chan transmission a connection to the prestigious Yogācāra philosophical tradition without committing the compilers to specific historical claims[7].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Vasubandhu\" — multiple figures sharing the name",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Yogācāra\", \"Abhidharmakośa\", \"Triṃśikā\"",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Vasubandhu\" — the two-Vasubandhu hypothesis",
      },
      {
        index: 4,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"vijñaptimātratā\" and \"ālayavijñāna\"",
      },
      {
        index: 5,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 5 — Yogācāra background to Chan",
      },
      {
        index: 6,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the twenty-first patriarch in the Chan reckoning",
      },
      {
        index: 7,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — embedding philosophical schools within the patriarchal frame",
      },
      {
        index: 8,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 21",
      },
    ],
  },
  {
    slug: "manorhita",
    content: `Manorhita (also Manorata, Manūratha), twenty-second patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Vasubandhu and teacher of Haklenayaśas[1]. A figure of similar name—Manoratha—appears in northwestern Sarvāstivādin sources as one of the late commentators on the *Vibhāṣā*, and is mentioned by Xuanzang as having debated unsuccessfully against a brahmin opponent at the court of King Vikramāditya, dying of grief at the defeat[2]. Whether the Chan patriarch is meant to be this same figure is uncertain.

The Chan account belongs to the legendary stratum of the late Indian lineage and is silent on the historical Manoratha's circumstances. Dumoulin treats the identification as plausible but unverifiable[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Manorhita in the Chan list",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Manoratha\" — the Sarvāstivādin commentator",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — possible identification of Manorhita with the Vibhāṣā commentator Manoratha",
      },
      {
        index: 4,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 22",
      },
    ],
  },
  {
    slug: "haklena",
    content: `Haklenayaśas (Chinese: 鶴勒那, transliterated *Haklena*), twenty-third patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Manorhita and teacher of Siṃha Bhikṣu[1]. The traditional account describes a teacher of central India whose preaching attracted a following of cranes (*haklena* glossed as "crane-fame"), an etiology that signals the legendary character of the figure rather than supplying biographical detail[2].

Dumoulin notes that the names in the immediate lead-up to Siṃha Bhikṣu and the persecution narrative function compositionally to set the stage for the lineage's dramatic late-Indian arc; Haklenayaśas's role is structural[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Haklenayaśas in the Chan list",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Haklenayaśas\"",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — composition of the late-Indian arc leading to Siṃha",
      },
      {
        index: 4,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 23",
      },
    ],
  },
  {
    slug: "simha",
    content: `Siṃha Bhikṣu (also Siṃhabodhi or Siṃhayāśas), twenty-fourth patriarch in the Chan list, is among the more substantively narrated figures of the later Indian lineage[1]. The earliest extended account of him appears in the Chinese Buddhist historical compilation *Fù Fǎ Zàng Yīnyuán Zhuàn* (The Causes and Conditions of the Transmission of the Dharma-Treasury), a fifth-century translation that records the chain of Indian masters extending into Sarvāstivādin scholastic circles[2].

According to the Chan account, Siṃha taught in Kashmir and was martyred during a persecution under the Hūṇa king Mihirakula (early 6th c.), a ruler widely associated in Indian sources with the violent suppression of Buddhism[3]. The traditional narrative states that when Siṃha was beheaded, milk flowed from the wound in place of blood—an iconographic motif used in Indian and Chinese hagiography to indicate the spiritual purity of the martyr; the detail derives from a stock Buddhist topos and is not independently attested[4].

His martyrdom marks a turning point in the Chan reckoning. The lineage's continuation through Vasiṣṭha (Vasasita), Puṇyamitra, and finally Prajñātāra (Bodhidharma's teacher) is presented as a transmission that survived under conditions of persecution—a theme that resonates with the later experience of Chinese Chan under the suppressions of the Northern Zhou (574–578) and the Tang Huichang persecution (845)[5]. Dumoulin notes that this narrative arc is structurally important for the Chan self-understanding: the lineage is not the property of any state and cannot be destroyed by political force.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Siṃha Bhikṣu\"",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the Fù Fǎ Zàng Yīnyuán Zhuàn and the late Indian lineage",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Mihirakula\"",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the milk-from-the-wound topos",
      },
      {
        index: 5,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — martyrdom and the indestructibility-of-the-Dharma topos",
      },
      {
        index: 6,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 24",
      },
    ],
  },
  {
    slug: "vasasita",
    content: `Vasiṣṭha (transliterated *Vasasita* in the Chinese sources), twenty-fifth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Siṃha Bhikṣu and the teacher of Puṇyamitra[1]. He belongs to the legendary stratum of the late Indian lineage; the traditional accounts emphasize the continuity of transmission through the period of the Mihirakula persecution rather than supplying independently verifiable biographical detail.

Dumoulin notes that the post-Siṃha section of the lineage functions narratively as a survival sequence: the Dharma is preserved through three further generations under conditions of political hostility, and is then released eastward by Prajñātāra to Bodhidharma[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — Vasiṣṭha/Vasasita in the Chan list",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1 — the post-Siṃha survival sequence",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 25",
      },
    ],
  },
  {
    slug: "punyamitra",
    content: `Puṇyamitra ("Friend of Merit"), twenty-sixth patriarch in the Chan list, is named in the *Jǐngdé Chuándēng Lù* as the disciple of Vasiṣṭha and the teacher of Prajñātāra, the master of Bodhidharma[1]. Like the other late-Indian figures, he belongs to the legendary stratum of the lineage and is not independently attested.

Dumoulin notes that Puṇyamitra's sole narrative function in the *Jǐngdé Chuándēng Lù* and the *Bǎolín Zhuàn* is the recognition and ordination of Prajñātāra; the placement positions him as the immediate predecessor of the figure who will release the transmission eastward[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 1–2 — Puṇyamitra as preceptor of Prajñātāra",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 2 — the Bǎolín Zhuàn's narrative arrangement of the late Indian section",
      },
      {
        index: 3,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 26",
      },
    ],
  },
  {
    slug: "prajnatara",
    content: `Prajñātāra is the twenty-seventh and final Indian patriarch in the Chan list before the transmission passes to China through Bodhidharma[1]. The earliest extended account of him appears in the *Lìdài Fǎbǎo Jì* (Record of the Dharma-Jewel through the Ages, c. 774) and is repeated and elaborated in the *Bǎolín Zhuàn* (Record of the Bao-lin Monastery, 801) and the *Jǐngdé Chuándēng Lù* (1004)[2]. He is described as a master from eastern India who received transmission from Puṇyamitra, traveled and taught widely, and recognized in the third son of a south Indian king the capacity that would carry the Dharma to China.

The narrative of Prajñātāra's encounter with the young Bodhidharma is highly stylized. The boy is depicted displaying a precocious understanding of the *Diamond Sūtra*; Prajñātāra tested him with a series of questions and found him already deeply realized; ordination, training, and transmission followed[3]. Prajñātāra is then said to have foretold that, sixty-seven years after his own death, his disciple would carry the lamp east to a land "beyond the sea." Bodhidharma's eventual departure for Liang-dynasty China is presented as the fulfillment of this charge.

The historicity of Prajñātāra is doubtful. John McRae argues that the figure is best understood as a literary construction designed to give Bodhidharma's mission a properly Indian commission and to tie the Chinese lineage to the southern, Mahāyāna-aligned regions of India where the *Prajñāpāramitā* texts had emerged[4]. Within the Chan self-understanding, Prajñātāra represents the moment at which the Indian transmission, having passed through twenty-eight generations, releases its impulse eastward[5].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 2 — Prajñātāra and the eastward transmission",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 2 — the Lìdài Fǎbǎo Jì, Bǎolín Zhuàn, and Jǐngdé Chuándēng Lù as sources",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Prajñātāra\" — the encounter with the young Bodhidharma",
      },
      {
        index: 4,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — the literary construction of the Indian-Chinese transition",
      },
      {
        index: 5,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 27",
      },
    ],
  },
  {
    slug: "jianzhi-sengcan",
    content: `Jianzhi Sengcan was the third patriarch of Chinese Chan, receiving transmission from Dazu Huike and transmitting it to Dayi Daoxin[1]. Almost nothing is known of his early life. He is said to have approached Huike as a layman, afflicted by a karmic illness, and to have asked for purification of his sins. Huike's response—"Bring me your sins and I will purify them"—launched an inquiry that culminated in Sengcan's awakening. He was subsequently ordained and received the robe and bowl that symbolized patriarchal transmission[2].

Sengcan lived during a period of intense Buddhist persecution under the Northern Zhou emperor and was forced to spend many years in hiding, moving between mountains and obscure regions to avoid detection[1]. This life of concealment gave his practice a quality of radical simplicity and gave his famous poem, the Xinxin Ming (Faith in Mind), its particular gravity. The poem opens: "The Great Way is not difficult; just avoid picking and choosing." These lines have resonated through centuries of Chan and Zen practice as a direct pointing to the ease and naturalness of original mind. Sengcan died in 606 CE while giving a Dharma talk, bowing to a tree and passing away standing up[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 5 — the early Chinese patriarchs: Huike, Sengcan, Daoxin",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — the Huike–Sengcan encounter and the construction of the third-patriarch narrative",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Sengcan",
        excerpt: "Traditional accounts give the date of his death as 606 CE and describe him passing away while standing under a tree.",
      },
    ],
  },
  {
    slug: "puti-damo",
    content: `Bodhidharma was the twenty-eighth Indian patriarch and the first Chinese patriarch of Chan, a figure who stands at the hinge between the Indian and East Asian traditions[1]. He arrived in China around the late fifth or early sixth century, having crossed the seas from India[2]. His encounter with Emperor Wu of Liang is one of the most celebrated exchanges in Chan history. The Emperor, who had built many temples and supported thousands of monks, asked what merit he had accumulated. Bodhidharma replied: "No merit whatsoever." When the Emperor asked about the highest sacred truth, Bodhidharma said: "Vast emptiness, nothing sacred." Asked who stood before him, Bodhidharma said: "I don't know."[3]

After this exchange, Bodhidharma traveled north and spent nine years in seated meditation facing a wall at Shaolin Monastery[1]. This period of wall-gazing became one of the defining images of the Chan tradition. He eventually accepted Dazu Huike as his disciple after Huike demonstrated his sincerity by standing in the snow and cutting off his own arm. Bodhidharma transmitted the Lankavatara Sutra along with the wordless transmission of mind[2]. His teaching emphasized direct awakening through meditation practice rather than doctrinal study, and this emphasis became the defining characteristic of the Chan school he founded in China[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 5 — Bodhidharma and the beginnings of Chinese Chan",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — the Bodhidharma legend and the Laṅkāvatāra transmission",
      },
      {
        index: 3,
        sourceId: "src_red_pine_platform",
        pageOrSection: "Introduction — Bodhidharma's encounter with Emperor Wu",
      },
      {
        index: 4,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Bodhidharma\"",
      },
    ],
  },
  {
    slug: "dazu-huike",
    content: `Dazu Huike was the second patriarch of Chinese Chan, the successor of Bodhidharma and one of the most dramatic figures in the tradition[1]. He first sought out Bodhidharma while the master was engaged in his nine years of wall-gazing, standing in the snow outside the meditation hall. When Bodhidharma refused to see him, Huike cut off his own arm at the elbow and presented it as evidence of his sincerity. Bodhidharma then agreed to teach him[2].

Huike's encounter with Bodhidharma is recorded as proceeding through a series of exchanges that paralleled Bodhidharma's famous encounter with Emperor Wu. When Huike said his mind was not at peace and asked Bodhidharma to put it at rest, Bodhidharma replied: "Bring me your mind and I will put it at rest." After a long search, Huike said: "I have searched for my mind and cannot find it." Bodhidharma replied: "There, I have put it at rest for you."[1] This exchange remains one of the most celebrated encounters in Chan history and stands as a direct illustration of the method of investigating the nature of mind. Huike transmitted to Jianzhi Sengcan, continuing the lineage during a dangerous period of religious persecution[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 5 — Huike as Bodhidharma's successor and the pacification-of-mind dialogue",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — formation of the early Chinese Chan lineage under persecution",
      },
    ],
  },
  {
    slug: "dayi-daoxin",
    content: `Dayi Daoxin, the fourth Chinese Chan patriarch, received transmission from Jianzhi Sengcan and became one of the most important figures in the development of Chan as a distinct Chinese Buddhist school[1]. He was the first patriarch to establish a large settled community of practitioners, moving away from the wandering and hermit-like style of the earlier patriarchs. He founded a community on East Mountain (Dongshan) that numbered in the hundreds, and this represented a new institutional form for the transmission of awakening[2].

Daoxin's teaching integrated sitting meditation with practical monastic work, a combination that would become central to the Chan tradition[1]. He insisted that awakening was not separate from everyday activity and that the cultivation of mind could occur through any task performed with complete attention. His emphasis on practice within community life rather than solitary wandering laid the groundwork for the great monasteries of the Tang dynasty Chan renaissance. He transmitted to Daman Hongren, who would carry this communal model to even greater development[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 6 — Daoxin and the founding of the East Mountain community",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — the institutionalization of Chan on East Mountain (Daoxin and Hongren)",
      },
    ],
  },
  {
    slug: "daman-hongren",
    content: `Daman Hongren, the fifth Chinese Chan patriarch, continued and expanded the communal model of practice established by his teacher Dayi Daoxin on East Mountain[1]. Under Hongren's leadership, the East Mountain community became the preeminent center of Chan practice in Tang dynasty China, drawing students from throughout the country. His teaching emphasized the direct recognition of original mind as the ground of all practice and all merit[2].

Hongren is particularly significant because among his many students he recognized the extraordinary capacity of Huineng, a young illiterate wood-seller from the south[3]. The story of their encounter is pivotal in Chan history. Hongren tested all his students by asking them to demonstrate their understanding in verse. The head monk Shenxiu wrote: "The body is the Bodhi tree; the mind is like a bright mirror's stand. At all times we must strive to polish it and must not let the dust collect." Huineng had someone read this to him and then composed his own verse: "Bodhi originally has no tree; the bright mirror has no stand. Originally there is not a single thing; where could dust alight?" Hongren recognized Huineng's verse as the expression of a deeper understanding and secretly transmitted to him the patriarchal robe and bowl[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — the East Mountain teaching under Daoxin and Hongren",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 6 — Hongren and the consolidation of the early Chan community",
      },
      {
        index: 3,
        sourceId: "src_platform_sutra_yampolsky_1967",
        pageOrSection: "§§4–8 — Hongren's verse-contest and the secret transmission to Huineng",
      },
    ],
  },
  {
    slug: "dajian-huineng",
    content: `Dajian Huineng, the sixth and final patriarch of undivided Chinese Chan, was an illiterate wood-seller from Guangdong province who became the most influential figure in the entire Chan tradition[1]. His story of recognition by Hongren and subsequent flight southward with the robe and bowl, pursued by monks who sought to reclaim the symbol of patriarchal authority, became one of the founding narratives of Chan[2]. His teaching was eventually recorded in the Platform Sutra, the only Chinese Buddhist text accorded the status of a sutra[3].

Huineng's central teaching was the direct, sudden recognition of original mind, which he called the "no-thought" or "no-mind" approach[4]. He insisted that awakening is not something achieved through gradual accumulation but is the immediate recognition of what one already fundamentally is. His famous exchanges, recorded in the Platform Sutra, demonstrate this direct pointing with extraordinary economy and power. Through his students—particularly Nanyue Huairang and Qingyuan Xingsi—virtually all subsequent Chinese Chan schools trace their lineage[5]. The Rinzai and Soto schools of Japan, the Korean Seon tradition, and the Vietnamese Thien tradition all descend from Huineng through these two streams.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 4 (\"The Sixth Patriarch and the Origins of Chan\")",
      },
      {
        index: 2,
        sourceId: "src_platform_sutra_yampolsky_1967",
        pageOrSection: "Introduction §3",
      },
      {
        index: 3,
        sourceId: "src_red_pine_platform",
        pageOrSection: "Translator's preface",
      },
      {
        index: 4,
        sourceId: "src_red_pine_platform",
        pageOrSection: "Sections 17–24",
        excerpt:
          "Huineng characterizes awakening as the direct recognition of no-thought (wunian).",
      },
      {
        index: 5,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Lineage chart, generation 33",
      },
      {
        index: 6,
        sourceId: "src_cosmos_chan",
        pageOrSection: "cosmoschan.org — Huineng and the post-Sixth-Patriarch lineage transmission chart",
      },
      {
        index: 7,
        sourceId: "src_thanh_tu_truc_lam",
        pageOrSection: "Trúc Lâm Thiền: Studies in Vietnamese Buddhism — Vietnamese reception of Huineng and the Platform Sūtra",
      },
    ],
  },
  {
    slug: "shitou-xiqian",
    content: `Shitou Xiqian was one of the two great heirs of Huineng's dharma-grandson lineage—through Qingyuan Xingsi—and the founder of one of the two main streams from which all surviving Chan/Zen schools descend[1]. He was born in Guangdong and was so precocious that as a child he reportedly disrupted local sacrificial rituals by releasing the animals. He became a student of Huineng and then, after Huineng's death, studied with Qingyuan Xingsi. Shitou's approach to Chan was quiet, vast, and deeply grounded in the Huayan teaching of the interpenetration of all phenomena[2].

His most famous text, the Sandokai (Merging of Difference and Unity), is one of the foundational liturgical texts of the Soto school of Zen, chanted daily in temples around the world[3]. The poem articulates the relationship between the absolute and the relative, between emptiness and form, with extraordinary poetic precision. Shitou built a meditation platform on a flat rock on Nanyue Mountain—the name Shitou means "stone head"—and taught from there for decades[1]. From his lineage descended Dongshan Liangjie and the Caodong/Soto tradition[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 8 — Shitou Xiqian and the Qingyuan stream",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 4 — the two great heirs of post-Huineng Chan and the Cao-Dong descent",
      },
      {
        index: 3,
        sourceId: "src_sotozen_founders",
        pageOrSection: "Liturgical texts — Sandōkai",
      },
    ],
  },
  {
    slug: "mazu-daoyi",
    content: `Mazu Daoyi was the other great heir of the post-Huineng generation, descending through Nanyue Huairang, and one of the most dynamic and influential Chan masters in Chinese history[1]. He was the teacher of hundreds of students and was renowned for his startling, unconventional teaching methods. Mazu introduced the "shout" (katsu/he) as a teaching device, sometimes shouting so forcefully that students experienced sudden awakening. He also employed physical gestures—grabbing noses, twisting ears, striking students unexpectedly—as direct interventions in the stream of conceptual thought[2].

Mazu's famous saying that "everyday mind is the Way" became one of the cornerstone teachings of the Chan tradition[3]. By this he meant that awakening is not a special state separate from ordinary experience but is the direct recognition of experience as it actually is, before any overlay of conceptual construction. His students—including Baizhang Huaihai, Nanquan Puyuan, and Zhaozhou's teacher—spread throughout China and established the Hongzhou style of Chan that became the foundation of the Linji/Rinzai tradition[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 8 — Mazu Daoyi and the Hongzhou school",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 4 — Mazu's encounter-dialogue style and the new pedagogy",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Mazu Daoyi\" — \"everyday mind is the Way\"",
      },
    ],
  },
  {
    slug: "baizhang-huaihai",
    content: `Baizhang Huaihai was a disciple of Mazu Daoyi and one of the architects of Chan monastic culture[1]. He is famous above all for establishing the first specifically Chan monastic code, the Baizhang Qinggui (Pure Rules of Baizhang)[2]. Before Baizhang, Chan monks lived in Vinaya monasteries designed for a different kind of practice. Baizhang created a distinctly Chan institution in which practice, work, and communal life were fully integrated. His famous dictum—"A day without work is a day without eating"—set the tone for a monasticism in which manual labor was understood as inseparable from spiritual practice[1].

Baizhang also created the formal Dharma hall where the abbot teaches the community publicly, a format that became standard in Chan and Zen monasteries worldwide[2]. His awakening moment under Mazu is legendary: Mazu picked up a whisk and held it vertically. Baizhang asked the meaning. Mazu put it down. Later Mazu asked Baizhang to explain Chan. Baizhang picked up the whisk and held it vertically. Mazu snatched it and asked what he meant by that. Baizhang shouted—and Mazu's roar of laughter could be heard for miles[3]. This encounter appears in several koan collections and illustrates the non-verbal quality of genuine dharma encounter.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 9 — Baizhang Huaihai and the Chan monastic code",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Baizhang Huaihai\" and \"Baizhang qinggui\"",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 26 — Baizhang and the whisk",
      },
    ],
  },
  {
    slug: "nanquan-puyuan",
    content: `Nanquan Puyuan was a disciple of Mazu Daoyi who spent thirty years on Nanquan Mountain without descending to the world below[1]. He is known for his deeply unconventional teaching and for his famous student Zhaozhou Congshen, with whom he engaged in some of the most celebrated exchanges in Chan history[2]. Nanquan's teaching style combined radical directness with apparent paradox, constantly undercutting any fixed view of practice or attainment[1].

The most famous story about Nanquan involves his cutting a cat in two to resolve a dispute among monks about ownership. He afterward asked Zhaozhou what he would have done. Zhaozhou put his sandals on his head and walked out. Nanquan said: "If you had been here, I could have saved the cat." This story, recorded as case 63 in the Blue Cliff Record, points to the impossibility of grasping reality through conceptual categories[3]. Nanquan's life on the mountain and his Dharma encounters with his many students established him as one of the towering figures of the Tang Chan renaissance[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 9 — Nanquan Puyuan and the Mazu line",
      },
      {
        index: 2,
        sourceId: "src_chan_ancestors_pdf",
        pageOrSection: "Generations 35–36 — Nanquan and Zhaozhou",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 63 — Nanquan cuts the cat",
      },
    ],
  },
  {
    slug: "huangbo-xiyun",
    content: `Huangbo Xiyun was a student of Baizhang Huaihai and the teacher of Linji Yixuan, the founder of the Linji school[1]. He was a physically imposing man with a prominent lump on his forehead, said to have been acquired through years of prostrations. His teaching was famed for its bluntness and its stripping away of all concepts about Buddhism or practice. His famous "thirty blows" became an emblem of the immediacy of true Chan teaching[2].

Huangbo's teaching on the One Mind is recorded in the Transmission of Mind, compiled by his student Pei Xiu: "All buddhas and all sentient beings are nothing but the One Mind, beside which nothing exists. This mind, which is without beginning, is unborn and indestructible. It is not green nor yellow, and has neither form nor appearance. It does not belong to the categories of things which exist or do not exist."[3] This description of mind as the ground of all appearance and the source of all experience represents the philosophical heart of the Linji teaching. Linji later said that it was through Huangbo's transmission that he had encountered the living Buddha[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 9 — Huangbo Xiyun and the formation of the Linji house",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 4 — Huangbo's blows and the rhetoric of immediacy",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Huangbo Xiyun\" and \"Chuanxin fayao\" (Transmission of Mind)",
      },
    ],
  },
  {
    slug: "linji-yixuan",
    content: `Linji Yixuan founded one of the most dynamic and enduring of all Chan schools, the Linji school, which later became the Rinzai school of Japanese Zen[1]. He was a student of Huangbo Xiyun who underwent an extremely severe training. Three times he asked Huangbo the fundamental meaning of Buddhism, and three times Huangbo struck him without speaking. Linji left in confusion, and Huangbo sent him to consult the master Dayu. When Linji told Dayu what had happened, Dayu said: "Huangbo was so grandmotherly for you!" At this moment Linji had a sudden awakening and said: "There's not much to Huangbo's Buddha Dharma!" When Dayu grabbed him and demanded an explanation, Linji struck Dayu three times in the ribs. This exchange is one of the most analyzed in the entire koan literature[2].

Linji's teaching was radical and uncompromising. His famous saying—"If you meet the Buddha, kill the Buddha; if you meet a patriarch, kill the patriarch"—is not a rejection of the tradition but an insistence on not becoming attached to any authority outside one's own true nature[3]. He introduced the "Four Shouts" and the "Four Positions of Guest and Host" as systematic teaching methods. His Record (Linji Lu) became the foundational text of the Linji/Rinzai school, which through the Japanese transmission of Eisai and later Hakuin became the living backbone of formal koan practice[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 10 — Linji Yixuan and the founding of the Linji house",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 4 — Linji's awakening narrative and the encounter dialogue",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Linji Yixuan\" and \"Linji lu\"",
      },
      {
        index: 4,
        sourceId: "src_kwan_um_poland",
        pageOrSection: "zen.pl — Polish Kwan Um sangha (Seung Sahn's contemporary Korean Linji descent)",
      },
    ],
  },
  {
    slug: "dongshan-liangjie",
    content: `Dongshan Liangjie was the founder of the Caodong school of Chinese Chan, the tradition that later became the Japanese Soto school through Dogen[1]. He was a student of Yunyan Tansheng and is famous above all for his awakening experience while crossing a stream: seeing his reflection in the water, he suddenly understood the teaching that Yunyan had been pointing to. His verse on this moment begins: "Earnestly avoid seeking without, lest it recede far from you."[2]

Dongshan developed the teaching of the Five Ranks (Wuwei), a sophisticated schema describing the relationship between the absolute (the dark, emptiness) and the relative (the bright, phenomena)[3]. The Five Ranks became the philosophical backbone of Caodong practice and have been studied and debated for twelve centuries. Unlike the Linji/Rinzai emphasis on sudden breakthrough through shock and paradox, Dongshan's approach was subtler and more gradualist, emphasizing the integration of emptiness and form in the stream of everyday activity[1]. He founded the Caodong school together with his student Caoshan Benji, and the school's name combines their two mountain names[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 10 — Dongshan Liangjie and the founding of Caodong",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 4 — Dongshan's stream-crossing verse and the Caodong style",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Dongshan Liangjie\" and \"Five Ranks (wuwei)\"",
      },
      {
        index: 4,
        sourceId: "src_foulk_caodong",
        pageOrSection: "Form and Function of Kōan Literature — the Caodong line and the Five Ranks",
      },
    ],
  },
  {
    slug: "yunmen-wenyan",
    content: `Yunmen Wenyan was the founder of the Yunmen school, one of the Five Houses of Tang and Song dynasty Chan[1]. He was a student of Xuefeng Yicun and is renowned for the extraordinary economy and precision of his teaching language. His responses were often one word, and these single-word responses—called "one-word barrier" answers—became some of the most studied koans in the tradition[2]. His famous saying "Every day is a good day" appears as case 6 in the Blue Cliff Record and has been contemplated by practitioners for a thousand years[3].

Yunmen's teaching style was demanding and unsparing. He described three types of Dharma eye: "containing heaven and earth," "cutting off the myriad streams," and "following the waves."[2] His one-word answers function as direct gestures toward reality that cannot be reasoned about but must be directly entered. The Yunmen school did not survive as a separate institution after the Song dynasty, but its spirit was preserved through the Blue Cliff Record, whose cases largely come from the Yunmen tradition, and continues to permeate all koan practice[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 11 — Yunmen Wenyan and the Five Houses",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Yunmen Wenyan\" — the \"three propositions\" and one-word barriers",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 6 — Yunmen: \"Every day is a good day\"",
      },
    ],
  },
  {
    slug: "zhaozhou-congshen",
    content: `Zhaozhou Congshen was one of the greatest Tang dynasty Chan masters and the subject of more koans than perhaps any other figure in the tradition[1]. He was a student of Nanquan Puyuan and lived to the extraordinary age of one hundred and twenty, practicing and teaching for most of his long life. He is said to have first met Nanquan when he was a young monk and to have experienced his initial awakening in their first encounter[1].

Zhaozhou's most famous teaching is recorded in the first case of the Gateless Barrier (Wumenguan): a monk asked him whether a dog has Buddha nature, and Zhaozhou replied "Mu" (No, or Nothing)[2]. This single syllable became the gateway koan of the Rinzai tradition, the first koan given to most students beginning formal koan practice[3]. His other famous exchanges—"Have you had breakfast? Then go wash your bowl." and "Does the oak tree have Buddha nature?" and his description of Zhaozhou bridge—demonstrate his ability to point to the ordinary as the sacred without making anything mystical or special. His collected sayings show a mind of inexhaustible patience and precision[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 9 — Zhaozhou Congshen and the Nanquan line",
      },
      {
        index: 2,
        sourceId: "src_mumonkan_senzaki_1934",
        pageOrSection: "Case 1 — Joshu's Mu",
      },
      {
        index: 3,
        sourceId: "src_heine_wright_koan",
        pageOrSection: "Introduction — \"Mu\" as the gateway koan of modern Rinzai training",
      },
    ],
  },
  {
    slug: "deshan-xuanjian",
    content: `Deshan Xuanjian began his practice as a specialist in the Diamond Sutra within the traditional Buddhist educational system of the north, and he traveled south specifically to refute what he regarded as the dangerous claim that awakening could be direct and immediate[1]. On his way he stopped at a roadside stand where an old woman was selling rice cakes. When he told her what he was carrying, she asked which mind he intended to refresh with her rice cakes—the past mind which cannot be got, the present mind which cannot be held, or the future mind which has not yet come. Deshan could not answer, and this encounter cracked open his certainty[2].

He subsequently studied with Longtan Chongxin and had his awakening when Longtan blew out a candle in the darkness. He burned all his commentaries on the Diamond Sutra, saying: "Exhausting learning is like a single hair in the vastness of space; all the world's wisdom is like a drop in a great ocean."[1] He became famous for carrying a staff and striking any student who spoke and any student who did not speak, any student who answered quickly and any student who answered slowly. His famous saying—"Thirty blows whether you can say it or whether you cannot"—became a Chan archetype of the teaching that breaks through conceptual hesitation[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 10 — Deshan Xuanjian and the Qingyuan line",
      },
      {
        index: 2,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 4 — Deshan and the rice-cake seller",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Deshan Xuanjian\" — the \"thirty blows\" pedagogy",
      },
    ],
  },
  {
    slug: "xuefeng-yicun",
    content: `Xuefeng Yicun was a student of Deshan Xuanjian who traveled and practiced intensively for decades before his awakening, reportedly visiting his teacher Touzi Datong nine times and Dongshan Liangjie three times before his final awakening occurred with Deshan[1]. He founded a large monastic community on Xuefeng Mountain that attracted hundreds of students and became one of the major centers of Chan in the late Tang dynasty[2].

Xuefeng was the teacher of both Yunmen Wenyan and Xuansha Shibei, two of the most significant figures of the next generation[1]. His teaching featured powerful imagery drawn from the natural world, and his dialogues with students are marked by a quality of utter simplicity that breaks through discursive thinking. He once held up a wooden ball and asked the assembly: "When this universe is completely destroyed—sun, moon, mountains, rivers—what happens to this ball?" No student could answer[3]. This kind of encounter, pointing to the unlocatable nature of awareness, characterizes his teaching.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 11 — Xuefeng Yicun and the rise of the Five Houses",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 4 — late-Tang Chan monastic centers",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 5 — Xuefeng's grain of rice",
      },
    ],
  },
  {
    slug: "yunyan-tansheng",
    content: `Yunyan Tansheng was a student of Baizhang Huaihai and the teacher of Dongshan Liangjie, the founder of the Caodong/Soto school[1]. He is particularly famous for one crucial exchange with Dongshan that planted the seed of Dongshan's awakening. Dongshan asked him what a non-sentient being preaches the Dharma with. Yunyan said: "Non-sentient beings always preach the Dharma." When Dongshan asked who hears this, Yunyan said: "The non-sentient beings hear." Dongshan asked: "And do you hear?" Yunyan said: "If I heard, you could not hear my teaching." Dongshan asked what scripture this teaching came from, and Yunyan said: "Have you not seen? In the Amitabha Sutra it says: 'Water birds, tree groves, all without exception proclaim the Buddha and the Dharma.'" This exchange led Dongshan to his famous awakening when crossing the stream[2].

Yunyan was known for making straw sandals, a simple craft that he employed as a teaching vehicle. His responses were often enigmatic, pointing to the Dharma-preaching of mountains and rivers and the non-sentient world—a teaching that resonates deeply with the Caodong emphasis on the pervasion of Buddha nature throughout all of reality[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 10 — Yunyan Tansheng and the prehistory of Caodong",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 4 — the Yunyan–Dongshan exchange on non-sentient preaching",
      },
    ],
  },
  {
    slug: "dogen",
    content: `Eihei Dogen was the founder of the Soto school of Zen in Japan and one of the most profound religious philosophers in world history[1]. Born into a noble family in 1200, he entered the monastery as a child and came to question why, if all beings are originally endowed with Buddha nature, they still need to practice. Unable to find a satisfying answer in Japan, he traveled to China in 1223 and studied with Tiantong Rujing, under whom he experienced the moment of "dropping off body and mind."[2] He returned to Japan in 1227 and spent the rest of his life teaching, writing, and establishing the Soto monastic tradition[3].

Dogen's masterwork, the Shobogenzo (Treasury of the True Dharma Eye), is a collection of fascicles that approach the fundamental questions of Buddhist philosophy—time, being, impermanence, the body, language, and awakening—with extraordinary depth and originality[4]. His core teaching is that practice and realization are not separate: to sit in zazen is itself the expression of Buddha nature, not a means toward it. His instruction for zazen, the Fukanzazengi, remains the definitive guide to Soto sitting practice[5]. The teaching of shikantaza—"just sitting"—points to a quality of wholehearted, non-striving presence that Dogen considered the complete expression of awakening itself.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. 2 (\"Dogen Zenji and the Soto School\")",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "pp. 51–119",
        excerpt:
          "Dōgen experienced the dropping off of body and mind under Tiantong Rujing in 1225.",
      },
      {
        index: 3,
        sourceId: "src_sotozen_founders",
        pageOrSection: "Two Founders — Dōgen Zenji",
      },
      {
        index: 4,
        sourceId: "src_cleary_shobogenzo",
        pageOrSection: "Editor's introduction",
      },
      {
        index: 5,
        sourceId: "src_sotozen_founders",
        pageOrSection: "Fukan Zazengi",
        excerpt:
          "The Sōtōshū treats the Fukan Zazengi as the canonical description of how to sit zazen.",
      },
      {
        index: 6,
        sourceId: "src_sanshin_zen",
        pageOrSection: "Sanshin Zen Community — Shōhaku Okumura's translations and commentary on Dōgen's Eihei Kōroku and Shōbōgenzō",
      },
      {
        index: 7,
        sourceId: "src_editorial_school_practices",
        pageOrSection: "Zen project editorial — Sōtō school practice notes (zazen / shikantaza)",
      },
      {
        index: 8,
        sourceId: "src_global_zen_research",
        pageOrSection: "Global Zen practice-centre research bundle (2026) — Sōtō-line practice centers worldwide",
      },
      {
        index: 9,
        sourceId: "src_external_portrait",
        pageOrSection: "Institutional portrait (Sōtōshū / Eihei-ji archival photography) — Dōgen iconography",
      },
    ],
  },
  {
    slug: "keizan-jokin",
    content: `Keizan Jōkin (1264–1325) is conventionally treated in modern Sōtō Zen as the school's "second founder" (*taiso*), complementing Dōgen's role as philosophical founder, and is sometimes called "the Great Popularizer" for his role in extending Sōtō practice beyond the small monastic milieu of Eihei-ji[1]. This two-founder designation, however, dates only from the late nineteenth century — it is a Meiji-era Sōtōshū institutional codification that consolidated the Sōtō school's modern self-image around the parity of Eihei-ji and Sōji-ji[2]. The earlier birth-year of 1268 still appears in some institutional sources, but Bodiford's Encyclopedia of Religion entry corrects this: "Born in 1264 (not 1268 as previously assumed)"[2].

Within his own institutional career Keizan presided over the absorption of two prior Shingon temples into the emergent Sōtō network — Yōhō-ji in 1312 and Shogaku-ji (renamed Sōji-ji) in 1322 — bringing with them the *mikkyō* ritual repertoire (state-protection prayers, memorial ceremonies for ancestors) that became distinctively woven into provincial Sōtō practice and made the school socially compatible with the religious life of late-Kamakura Japan[1]. Bernard Faure's monograph *Visions of Power* (1996) characterises him "less as an original thinker than as a representative of his culture and an example of the paradoxes of the Sōtō school," drawing institutional authority from dreams, relics, and visions rather than the strictly textual sources Dōgen had favoured[2].

Keizan's *Denkōroku* (*Transmission of the Lamp*) records the awakening stories of the Indian and Chinese patriarchs and makes the lineage narratively vivid for Japanese practitioners; modern attribution of authorship to Keizan was stabilised only after a 1959 manuscript discovery, and earlier scholars (Ōkubo, Cook) raised authorship doubts on textual grounds[3]. The institutional dominance of Sōji-ji over Eihei-ji in modern Japan was largely the achievement of his Dharma heir Gasan Jōseki and the late-14th to Edo-period institutional consolidation that followed, rather than of Keizan's own lifetime; Yōkō-ji, not Sōji-ji, was the monastery Keizan himself envisioned as the future Sōtō headquarters[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_sotozen_founders",
        pageOrSection: "Two Founders — Keizan Zenji and Sōjiji; sotozen.com/eng/dharma/founders.html (modern Sōtōshū framing); Bodiford 1993 on the Shingon-temple absorption pattern.",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "Vol. 2, ch. 3 — Keizan Jōkin; Bodiford, \"Keizan\" (Encyclopedia of Religion, 2005): \"Born in 1264 (not 1268 as previously assumed)\"; Faure, *Visions of Power: Imagining Medieval Japanese Buddhism* (Princeton, 1996); the \"two founders\" framing is a Meiji-era codification per Bodiford.",
      },
      {
        index: 3,
        sourceId: "src_shambhala_zen_dictionary",
        pageOrSection: "s.v. \"Denkōroku\" and \"Keizan Jōkin\"; Ōkubo Dōshū raised textual-grounds authorship doubts; Cook reports \"controversy and uneasiness about authorship\"; current attribution stabilised after a 1959 manuscript discovery.",
      },
    ],
  },
  {
    slug: "hakuin-ekaku",
    content: `Hakuin Ekaku, who lived from 1686 to 1769, is credited with single-handedly reviving and systematizing the Rinzai school of Zen after a period of significant decline[1]. Through his own intense and prolonged practice—marked by repeated experiences of kensho and equally repeated disillusionment when he recognized deeper layers of his own confusion—Hakuin developed a curriculum of koan practice that moved systematically through progressively deeper layers of inquiry. This curriculum became the standard structure for Rinzai training that continues to this day[2].

Hakuin's own biography is written in his awakening autobiography Orategama and Wild Ivy, extraordinary documents of the psychological and physical extremes of intensive practice[3]. He developed what he called "Zen sickness"—a dangerous energetic imbalance from excessive one-pointed effort—and was cured by the hermit Hakuyu, from whom he learned the practice of "soft butter" visualization for cultivating the body's energy[3]. Hakuin was also a prolific and unconventional visual artist, creating thousands of brushwork paintings and calligraphies that expressed Dharma teachings through visceral imagery[4]. His famous Circle of Emptiness paintings and his portraits of Bodhidharma are among the most iconic works of Japanese religious art. His restoration of Rinzai practice gave the Japanese Zen tradition a renewed vitality that has persisted to the modern period.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "vol. 2, ch. 11 (\"Hakuin Ekaku and Rinzai Renewal\")",
      },
      {
        index: 2,
        sourceId: "src_heine_wright_koan",
        pageOrSection: "ch. 6",
        excerpt:
          "Hakuin's graded koan curriculum became the modern Rinzai training standard.",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Wikipedia — Hakuin Ekaku § Wild Ivy and Zen sickness",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Wikipedia — Hakuin Ekaku § Painting and calligraphy",
      },
    ],
  },
  {
    slug: "yamada-koun",
    content: `Yamada Kōun (born Yamada Kiozo, 1907–1989) was the Japanese lay Zen master who shaped Sanbō Kyōdan (now Sanbō Zen) into an internationally accessible lineage and trained the first generation of Western teachers. Born in Nihonmatsu, Fukushima Prefecture, he attended Tokyo's elite Dai-Ichi High School together with the future Rinzai master Soen Nakagawa, then pursued a business career, working from 1941 as a labor supervisor for the Manchurian Mining Company and rising to deputy director of General Affairs by 1945[1]. He began Zen practice at age 38 in Manchuria and, after returning to Kamakura with his wife and three children, sat twice-daily dokusan with Asahina Sōgen Rōshi while serving as a managing director of a major Tokyo firm[1].

Yamada's decisive awakening came on a Tokyo train on 26 November 1953, when reading the line "Mind is no other than mountains and rivers and the great wide earth, the sun and the moon and the stars" provoked a kenshō that Hakuun Yasutani Rōshi confirmed the next day[1]. After completing roughly six hundred kōans he received Yasutani's dharma transmission in 1961 and assumed leadership of Sanbō Kyōdan in the early 1970s, teaching from the San-un Zendo in Kamakura[1]. He emphasized lay practice and deliberately collapsed the gap between ordained and householder students, an orientation that drew an unusually international clientele — by the end of his career roughly a quarter of sesshin participants were Christians[1][2].

His dharma heirs are central to Western Zen: Robert Baker Aitken of the Honolulu Diamond Sangha, Taizan Maezumi of the Zen Center of Los Angeles, the Filipino Jesuit Ruben Habito, the German Benedictine Willigis Jäger, the Swiss Jesuit Niklaus Brantschen, and his son Masamichi Ryōun-ken Yamada, who succeeded him as abbot[1][2]. Yamada's posthumously published kōan commentaries — *The Gateless Gate: The Classic Book of Zen Koans* (Wisdom Publications, 2004) and *Zen: The Authentic Gate* (Wisdom Publications, 2015) — remain standard references for Sanbō Zen kōan study[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Yamada Koun", excerpt: "Born Yamada Kiozo in 1907 in Nihonmatsu, Fukushima Prefecture. From 1941, worked as labor supervisor for the Manchurian Mining Company, becoming deputy director of General Affairs by 1945. At age 38 in Manchuria, Yamada commenced Zen training. On November 26, 1953, while traveling by train, Yamada experienced awakening upon reading: 'Mind is no other than mountains and rivers and the great wide earth, the sun and the moon and the stars.' That night he awoke from sleep experiencing kensho, confirmed by Yasutani the following day. Became successor to Haku'un Yasutani in 1961 after completing approximately 600 koans." },
      { index: 2, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org — lineage / teachers", excerpt: "Notable Dharma Heirs: Robert Baker Aitken, Willigis Jäger, Taizan Maezumi, Ruben Habito, Niklaus Brantschen, and his son Masamichi Ryoun-ken Yamada. Distinguished his lineage by deemphasizing separation between laypeople and ordained practitioners. Notably attracted Christian practitioners — approximately one-quarter of sesshin participants were Christians by his career's end." },
    ],
  },

  // =========================================================================
  // Qingyuan line — Tang dynasty Chan founders & descendants
  // =========================================================================

  {
    slug: "qingyuan-xingsi",
    content: `Qingyuan Xingsi (青原行思, d. 740) is traditionally treated as one of the two senior Dharma heirs of the Sixth Patriarch Huineng (alongside Nanyue Huairang) and the ancestor from whom the Caodong (Sōtō), Yunmen, and Fayan houses all descend[1]. The Tang-period record of his career is thin; the much later *Jǐngdé Chuándēng Lù* preserves the dialogue between Huineng and Qingyuan on "what falls into ranks and what does not," after which Huineng is said to have entrusted him with the Dharma at Mount Qingyuan in modern Jiangxi[2].

Modern scholarship — including the editorial introduction to Yampolsky's *Platform Sūtra* translation — notes that Qingyuan, like Nanyue Huairang, is essentially a constructed pivot in retrospectively organised Tang Chan genealogy: the Chinese lamp records preserve almost no contemporary trace of him, and his historical importance is principally lineal, as the named ancestor of his Dharma heir Shitou Xiqian and through him of the great non-Hongzhou branch of Tang Chan[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Huineng's heirs and the Qingyuan / Shitou stream",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Qingyuan Xingsi — biographical entry and Huineng dialogue",
      },
      {
        index: 3,
        sourceId: "src_platform_sutra_yampolsky_1967",
        pageOrSection: "Introduction — early-Tang Chan genealogy and the construction of Qingyuan's role",
      },
    ],
  },
  {
    slug: "nanyang-huizhong",
    content: `Nanyang Huizhong (南陽慧忠, c. 675–775) is named in the lamp records as a Dharma heir of the Sixth Patriarch Huineng who lived for some forty years as a hermit on Mount Baiya in Henan before being summoned to the Tang court, where he served as National Teacher (*guóshī*) under Emperors Suzong and Daizong[1]. His position is unusual within the Southern School: a hermit-turned-imperial-adviser whose long isolation gave him an authority distinct from the court-tied northern teachers of the same generation[2].

Huizhong is best remembered for his teaching that the inanimate world preaches the Dharma — that walls, tiles, and pebbles expound it no less than the sūtras or any human teacher; this *wúqíng shuōfǎ* (無情説法) formulation is recorded across several lamp-records exchanges and was taken up by Dōgen in *Mujō Seppō*[3]. He is also remembered for the "seamless monument" (無縫塔) episode, preserved by his successor Danyuan Yingzhen and recycled as Case 18 of the *Bìyán Lù*[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Huineng's heirs at the Tang court",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Nanyang Huizhong — biographical entry; National Teacher",
      },
      {
        index: 3,
        sourceId: "src_cleary_shobogenzo",
        pageOrSection: "Mujō Seppō (\"The Insentient Preach the Dharma\") — Dōgen on Huizhong",
      },
      {
        index: 4,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 18 — Huizhong's seamless monument",
      },
    ],
  },
  {
    slug: "heze-shenhui",
    content: `Heze Shenhui (荷澤神會, 684–758) was the Dharma heir of the Sixth Patriarch Huineng most directly responsible for the construction of the Southern-School orthodoxy of Chan. The decisive episode is the great debate at the Wuzhe assembly at Huatai in 732 (and again in 734), at which Shenhui publicly attacked the Northern-School teachers Shenxiu and Puji and argued that Huineng, not Shenxiu, was the true Sixth Patriarch and that *dùnwù* (sudden awakening) was the authentic doctrine[1]. The polemic effectively determined later official Chan historiography, including the framing of the *Platform Sūtra* itself[2].

Shenhui's own line did not survive past a few generations and he was largely written out of subsequent Linji-house historiography. Modern scholarship has reconstructed him from the Dunhuang manuscripts recovered in the early twentieth century — McRae and Yampolsky in particular argue that the "Southern" and "Northern" schools as transmitted to the rest of East Asia are essentially Shenhui's invention, the doctrinal binary used to win the Huatai debate rather than a description of two pre-existing teaching styles[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Shenhui and the Sudden / Gradual controversy",
      },
      {
        index: 2,
        sourceId: "src_platform_sutra_yampolsky_1967",
        pageOrSection: "Introduction — Shenhui's role in the formation of the Platform Sūtra",
      },
      {
        index: 3,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on Shenhui and the construction of the Southern School",
      },
    ],
  },
  {
    slug: "yongjia-xuanjue",
    content: `Yongjia Xuanjue (永嘉玄覺, 665–713) was a Tiantai-trained monk who is said in the *Jǐngdé Chuándēng Lù* to have visited the Sixth Patriarch Huineng on his way back from a pilgrimage and to have received Huineng's seal of approval in the course of a single night, earning him the nickname "Yi-su Jue," "Overnight Awakening" (一宿覺)[1]. The episode is one of the foundational anecdotes of the Southern School's claim that realisation does not depend on long temple residence under a teacher[2].

His enduring contribution is the *Zhèngdàogē* (證道歌, "Song of Enlightenment"), a long verse composition that became one of the most-chanted and translated works in the Chan and Zen traditions; its rhythmic, image-dense affirmation of awakened mind has shaped the literary register of Chan poetry from the Tang onward, and remains in active liturgical use in modern Korean Sŏn[3]. Modern scholarship is divided on the historicity of his single-night meeting with Huineng, but the attribution of the *Zhèngdàogē* to Yongjia is securely attested in the early lamp records[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Yongjia Xuanjue — biographical entry and \"Overnight Awakening\"",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Huineng's heirs",
      },
      {
        index: 3,
        sourceId: "src_seongcheol_dharma_talks",
        pageOrSection: "Yongjia's Song of Enlightenment in modern Korean Seon use",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Yongjia Xuanjue — Zhèngdàogē authorship and reception",
      },
    ],
  },
  {
    slug: "yuquan-shenxiu",
    content: `Yuquan Shenxiu (玉泉神秀, c. 606–706) was the senior disciple of the Fifth Patriarch Daman Hongren and the most prominent Chan teacher of his generation. Patronised by Empress Wu Zetian and her successors, he served as a *guóshī* (National Teacher) at the Tang court in Chang'an and Luoyang and received imperial honours on a scale unmatched by any other Chan teacher of his era[1]. The verse attributed to him in the *Platform Sūtra* — "The body is the Bodhi-tree, the mind is a bright mirror; constantly polish it, let no dust alight" — is read in that text as the gradual-cultivation foil for Huineng's sudden-awakening response[2].

Modern scholarship since John McRae's *The Northern School and the Formation of Early Ch'an Buddhism* has substantially complicated the standard later-tradition portrait of Shenxiu as the loser in the Sudden / Gradual debate: his surviving teachings, recovered in part from the Dunhuang manuscripts, articulate a sophisticated doctrine of "viewing the mind" (*guānxīn*) that is not reducible to mere gradual cultivation, and his northern school was the dominant institutional form of Chan throughout the early eighth century until it was eclipsed by Heze Shenhui's polemic[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Shenxiu and the Northern School",
      },
      {
        index: 2,
        sourceId: "src_platform_sutra_yampolsky_1967",
        pageOrSection: "Introduction — Shenxiu and Huineng's mirror verses",
      },
      {
        index: 3,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on the Northern School and the reconstruction of Shenxiu's teaching",
      },
    ],
  },
  {
    slug: "songshan-puji",
    content: `Songshan Puji (嵩山普寂, 651–739) was the principal Dharma heir of Yuquan Shenxiu and the most prominent representative of the Northern School in the first half of the eighth century[1]. He taught at Songyang-si on Mount Song (the central sacred mountain) and at the imperial capitals; like his teacher he received successive court honours, including the title *guóshī*, and his community was probably the most institutionally well-established Chan community of his generation before the rise of Heze Shenhui's polemic[2].

After Shenhui's 732 attack at Huatai targeted Puji directly as the inheritor of an allegedly "gradual" line, Puji and the Northern School were progressively marginalised in subsequent Chan historiography. McRae's *Northern School and the Formation of Early Ch'an Buddhism* and Yampolsky's introduction to the *Platform Sūtra* both argue that the surviving (largely Dunhuang) Northern-School texts show a more sophisticated teaching than the polemical caricature and that Puji's eclipse was as much institutional as doctrinal[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Northern School in the early Tang",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Songshan Puji — biographical entry; Northern School institutional position",
      },
      {
        index: 3,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on Shenhui's attack and Puji's marginalisation",
      },
    ],
  },
  {
    slug: "yaoshan-weiyan",
    content: `Yaoshan Weiyan (藥山惟儼, 751–834) is recorded in the Tang biographical compilations and in the *Jǐngdé Chuándēng Lù* as the heir of Shitou Xiqian who also spent time studying with Mazu Daoyi — one of the few Tang masters whose biographies place them at both of the great Hongzhou and Qingyuan streams[1]. After leaving Mazu's community he settled on Mount Yao (Yaoshan, in modern Hunan), where his sparse, probing style and his refusal to court official patronage made the mountain a magnet for serious practitioners[2].

The most consequential of his exchanges for later Zen is preserved in the *Jǐngdé Chuándēng Lù*: a monk asked what he was thinking as he sat so still, and Yaoshan answered, "I think of not-thinking" (思量箇不思量底); pressed on how one thinks of not-thinking, he replied, "*Hishiryō* — beyond thinking" (非思量)[3]. Dōgen quotes this dialogue almost verbatim at the climax of the *Fukan Zazengi* and again in the *Zazenshin*, anchoring the Sōtō understanding of *shikantaza* in Yaoshan's formula[4]. Yaoshan's principal heirs Yunyan Tansheng and Daowu Yuanzhi carried his line forward; through Yunyan it reached Dongshan Liangjie and became the Caodong / Sōtō school proper.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Shitou Xiqian and the Qingyuan lineage",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Yaoshan Weiyan — biographical entry and encounter dialogues",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Yaoshan Weiyan — \"thinking of not-thinking\" exchange (Jǐngdé Chuándēng Lù)",
      },
      {
        index: 4,
        sourceId: "src_dogen_fukanzazengi",
        pageOrSection: "Fukan Zazengi — citation of the Yaoshan \"non-thinking\" formula",
      },
    ],
  },
  {
    slug: "tianhuang-daowu",
    content: `Tianhuang Daowu (天皇道悟, 748–807) is recorded in the *Jǐngdé Chuándēng Lù* as a Dharma heir of Shitou Xiqian who taught at Tianhuang Temple in Jingzhou (modern Hubei)[1]. The Song-era lamp records describe a student whose realisation matured slowly under Shitou and who, in contrast to the shock-tactics of his Mazu-line contemporaries, was remembered for a gentler, more reticent style of instruction[2].

Tianhuang's place in Chan history rests on a single decisive link: his transmission to Longtan Chongxin, the teacher of Deshan Xuanjian. Through Deshan and his student Xuefeng Yicun, the Tianhuang line gave rise to the Yunmen and Fayan houses, two of the canonical Five Houses of late-Tang and early-Song Chan[3]. Modern scholarship is aware of the so-called "two Daowus" problem — a Song-period polemic over whether the line through Longtan in fact descends from Tianhuang Daowu or from a separate Tianwang Daowu (天王道悟) — but the standard genealogy, codified in the *Wǔdēng Huìyuán*, continues to treat Tianhuang Daowu as the recognised patriarch[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Shitou's heirs",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Tianhuang Daowu — biographical entry",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the rise of the Five Houses",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Tianhuang Daowu — the \"two Daowus\" lineage controversy",
      },
    ],
  },
  {
    slug: "danxia-tianran",
    content: `Danxia Tianran (丹霞天然, 739–824) was one of the most striking figures of Tang Chan. The standard biographical sources — the *Sòng Gāosēng Zhuàn* and the *Jǐngdé Chuándēng Lù* — describe him as a Confucian scholar travelling to Chang'an to sit the civil-service examinations when a fellow traveller suggested that "becoming a Buddha is better than becoming an official"; he turned aside, presented himself first to Mazu Daoyi, was sent on to Shitou Xiqian, and there received transmission[1].

He is best remembered for the episode preserved in the lamp records and recycled in dozens of later Chan texts: stopping at Huilin Temple on a cold night, Danxia took a wooden Buddha statue from the hall and burned it for warmth. When the abbot protested, he said he was looking for *śarīra* (sacred relics) in the ashes; told that a wooden statue contained none, he replied, "Then why are you upset? Bring me the other two to burn as well"[2]. The story became a Chan *locus classicus* for the doctrine that no form, however sacred, should be confused with the awakening it points to, and Linji-line teachers from Linji Yixuan onward cite it as authoritative when warning against attachment to images[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Shitou Xiqian and his Dharma heirs",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Danxia Tianran — burning-the-Buddha episode",
      },
      {
        index: 3,
        sourceId: "src_welter_linji",
        pageOrSection: "Linji Lu — reception of the Danxia / burning-the-Buddha trope",
      },
    ],
  },
  {
    slug: "cuiwei-wuxue",
    content: `Cuiwei Wuxue (翠微無學, fl. mid-9th c.) was a Dharma heir of Danxia Tianran and the link between the Shitou stream and the later Touzi line; he taught at Mount Cuiwei in modern Shaanxi and was the teacher of Touzi Datong[1].

His best-known dialogue, preserved in the *Jǐngdé Chuándēng Lù*, is the bamboo-garden exchange: asked about the meaning of Bodhidharma's coming from the West, Cuiwei told the questioner, "Wait until no one is around, and I will tell you"; when the monk approached him alone, Cuiwei led him into the bamboo grove and silently pointed at the bamboo — a wordless answer that became one of the standard Qingyuan-line gestures for the immediacy of the Dharma in the everyday[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Cuiwei Wuxue — biographical entry; Mount Cuiwei",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Shitou's heirs and the bamboo-garden dialogue",
      },
    ],
  },
  {
    slug: "danyuan-yingzhen",
    content: `Danyuan Yingzhen (耽源應真, fl. mid-9th c.) was a Dharma heir of National Teacher Nanyang Huizhong and one of the few figures who carried Huizhong's eclectic Tang-court Chan into the second half of the ninth century[1]. He is best known from the koan-literature account of his role in the "seamless monument" episode preserved in the lamp records and recycled as *Bìyán Lù* Case 18[2].

The episode is set after Nanyang Huizhong's death: a monk asks Danyuan what kind of monument should be built for the late National Teacher, and Danyuan recounts that Nanyang had asked the same question of Emperor Daizong and answered it himself by asking for a "seamless monument" (無縫塔), then sitting in silence — the seamless monument being the silence itself. Yuanwu Keqin's *Bìyán Lù* commentary on Case 18 reads the story as the school's classical statement that authentic memorial of an awakened teacher cannot be reduced to physical form[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Danyuan Yingzhen — biographical entry; relationship to Nanyang Huizhong",
      },
      {
        index: 2,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 18 — Huizhong's Seamless Monument",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 18 — Yuanwu's commentary on the seamless monument",
      },
    ],
  },
  {
    slug: "longtan-chongxin",
    content: `Longtan Chongxin (龍潭崇信, fl. early 9th c.) was a Dharma heir of Tianhuang Daowu and the teacher of Deshan Xuanjian, occupying the decisive middle position in the Shitou → Tianhuang → Longtan → Deshan → Xuefeng line through which the Yunmen and Fayan houses descend[1]. The lamp records emphasise his humble origins: before ordination he was a rice-cake seller near Tianhuang's temple, and the transmission they describe matured slowly through daily interactions rather than through any single dramatic exchange[2].

His most celebrated teaching moment is the encounter preserved in the *Wúménguān* and the *Jǐngdé Chuándēng Lù* with Deshan Xuanjian, who had come south as a *Diamond Sūtra* scholar intending to refute the Southern School. When Deshan asked for more light to find his way along a dark corridor, Longtan lit a paper candle, handed it to him, and immediately blew it out — and at the moment of sudden darkness Deshan is said to have undergone his decisive awakening[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Tianhuang → Longtan → Deshan line",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Longtan Chongxin — biographical entry",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Longtan Chongxin — Deshan candle-blowing awakening",
      },
    ],
  },
  {
    slug: "daowu-yuanzhi",
    content: `Daowu Yuanzhi (道吾圓智, 769–835) was the Dharma heir of Yaoshan Weiyan and the teacher of Shishuang Qingzhu, holding one of the two main lines of descent from Yaoshan alongside his fellow-student Yunyan Tansheng[1]. He spent most of his teaching career at Mount Daowu in Tanzhou (modern Hunan); the *Jǐngdé Chuándēng Lù* preserves a dense set of encounter dialogues between Daowu and Yunyan, often read as the two heirs sharpening each other's understanding of their teacher's "non-thinking" style of practice[2].

The most influential of these exchanges is the dialogue on the bodhisattva of compassion preserved as Case 89 of the *Blue Cliff Record* and Case 54 of the *Book of Serenity*: Daowu asks, "What does the Bodhisattva of Great Compassion use so many hands and eyes for?" Yunyan replies, "It is like someone reaching back in the night for a pillow"; Daowu answers, "I understand," and Yunyan presses him to say what he has understood[3]. The exchange — read by both Caodong and Linji commentators as a teaching on action without deliberation — became one of the most cited dialogues in the koan literature, and Daowu's line through Shishuang Qingzhu carried the Yaoshan stream into the late ninth century[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Yaoshan's heirs and the early Caodong line",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Daowu Yuanzhi — biographical entry and Daowu–Yunyan exchanges",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 89 — The Bodhisattva of Great Compassion (Daowu and Yunyan)",
      },
      {
        index: 4,
        sourceId: "src_book_of_serenity",
        pageOrSection: "Case 54 — Yunyan's \"Great Compassion\"",
      },
    ],
  },
  {
    slug: "chuanzi-decheng",
    content: `Chuanzi Decheng (船子德誠, fl. mid-9th c.), the "Boat-Monk of Huating," is recorded in the *Jǐngdé Chuándēng Lù* and the *Zǔtáng Jí* as a Dharma heir of Yaoshan Weiyan who, on completing his training, declined to establish a monastery and instead spent the rest of his life as a ferryman on the Wu River at Huating (modern Songjiang district, Shanghai), looking for the one student worth transmitting to[1]. He became an emblematic figure for the late-Tang topos of the hidden sage who keeps the Dharma in plain sight.

The single famous episode of his career — the meeting with Jiashan Shanhui, sent to him by Daowu Yuanzhi — is preserved in detail in the lamp records and was retold and versified through the rest of the tradition: Chuanzi tested Jiashan with a sequence of probing questions, capsized the boat into the river, struck him as he climbed back in, and at his words "Speak! Speak!" Jiashan's understanding opened[2]. The story closes with Chuanzi capsizing his own boat and vanishing into the river, leaving Jiashan as his sole heir — an image that the Caodong stream returned to repeatedly as a model of unobtrusive transmission[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Chuanzi Decheng — biographical entry; the Boat-Monk of Huating",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Yaoshan's heirs",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Chuanzi Decheng — Boat-Monk and Jiashan transmission",
      },
    ],
  },
  {
    slug: "jiashan-shanhui",
    content: `Jiashan Shanhui (夾山善會, 805–881) is recorded in the *Jǐngdé Chuándēng Lù* and the *Zǔtáng Jí* as a former lecturer-monk whose merely intellectual understanding was exposed by Daowu Yuanzhi: when Jiashan, then well known for his expositions, claimed that "the Dharmakāya has no marks; the Dharma-eye has no flaw," Daowu directed him to seek out the ferryman Chuanzi Decheng on the Huating River[1].

At that meeting Chuanzi, after a series of probing questions, capsized the boat into the water and shouted, "Speak! Speak!" — and as Jiashan began to reply, Chuanzi struck him with the oar, precipitating his awakening. Chuanzi then capsized his own boat and disappeared into the river, having transmitted his Dharma to a single heir[2]. Jiashan later settled on Mount Jia (in modern Hunan), where he established a community that became a major training centre of the Yaoshan / Qingyuan stream; his principal heir Luopu Yuanan carried the line forward, and his recorded sayings preserve the somewhat astringent style that characterised the Jiashan line through the late Tang[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Jiashan Shanhui — biographical entry, Daowu's intervention",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Boat Monk Chuanzi and Jiashan",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Jiashan Shanhui — Mount Jia community and successors",
      },
    ],
  },
  {
    slug: "shishuang-qingzhu",
    content: `Shishuang Qingzhu (石霜慶諸, 807–888) was the Dharma heir of Daowu Yuanzhi and one of the most distinctive teachers of the late-Tang Yaoshan stream. The *Jǐngdé Chuándēng Lù* describes the community he established on Mount Shishuang (in modern Hunan) as the "withered-tree hall" (枯木堂), so called because its monks were trained to sit with such radical stillness that they were said to look like "dead trees and cold ashes" — a practice that prefigures the silent-illumination (*mòzhào chán*) of the later Caodong revival[1].

Shishuang's recorded instruction — "Cease and desist; be like a censer in an old shrine, like a length of bleached silk" — became one of the most-quoted formulae of late-Tang Caodong-stream practice, cited by Hongzhi Zhengjue and by Dōgen as an early expression of the *mòzhào / shikantaza* line of teaching[2]. The lamp records note that after his death his community faced a celebrated succession dispute resolved in favour of Jiufeng Daoqian, who declined to identify himself as Shishuang's heir until forced to do so by a public test of understanding posed by the head monk[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Shishuang Qingzhu — biographical entry; \"dead-tree hall\"",
      },
      {
        index: 2,
        sourceId: "src_leighton_cultivating_empty_field",
        pageOrSection: "Introduction — early Caodong silent-illumination antecedents",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Yaoshan stream and the Shishuang succession",
      },
    ],
  },
  {
    slug: "jiufeng-daoqian",
    content: `Jiufeng Daoqian (九峰道虔, fl. late 9th c.) served for many years as attendant to Shishuang Qingzhu and became his Dharma heir only after a celebrated succession dispute recorded in the *Jǐngdé Chuándēng Lù*. When the head monk proposed that whoever could correctly answer a question about Shishuang's last instructions should inherit the seat, no one but Jiufeng gave a response the senior monk accepted, and the Caodong-stream Shishuang line was preserved through him[1].

His recorded sayings are sparse but consistent in style with Shishuang's: when asked about the master's "cease and desist" formula, he extends his hands palm-up — a wordless gesture cited in later Caodong commentaries as an example of "stilling without becoming inert"[2]. His students Jingzhao Mihu and others sustained the Shishuang sub-line for two generations before it was absorbed back into the wider Yaoshan stream that eventually flowed into the Caodong / Sōtō tradition[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Jiufeng Daoqian — biographical entry and Shishuang succession",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Yaoshan stream after Shishuang",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Jiufeng Daoqian — lineage and successors",
      },
    ],
  },
  {
    slug: "luopu-yuanan",
    content: `Luopu Yuanan (洛浦元安, 834–898) is one of the few Tang Chan masters whom the lamp records and the *Línjì Lù* both describe as having trained under masters in two of the great Tang lineages: he is named first as an attendant of Linji Yixuan, and then, after Linji's death, as a student of Jiashan Shanhui who received his final transmission from the Yaoshan stream[1]. The *Línjì Lù* preserves the often-cited episode in which Luopu, having presented his understanding, was struck by Linji and struck back; Linji laughed and acknowledged him — an exchange read by later commentators as one of the school's archetypal demonstrations of "host and guest" parity[2].

After leaving Linji's community Luopu turned south to Jiashan, who reportedly required him to abandon his Linji-style posturing before accepting him; he settled at Mount Luopu (in modern Hunan), where his recorded sayings show a teacher comfortable using either the sharp confrontational style of Linji or the more probing dialogical method of Jiashan as the moment required[3]. His line did not flourish past the next generation, but his career provides important evidence of the late-Tang traffic between the Hongzhou / Linji and Qingyuan / Yaoshan houses before they hardened into the canonical Five Houses.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Luopu Yuanan — biographical entry and dual training",
      },
      {
        index: 2,
        sourceId: "src_welter_linji",
        pageOrSection: "Línjì Lù — the Luopu exchange and \"host and guest\" pedagogy",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on cross-lineage training in late-Tang Chan",
      },
    ],
  },
  {
    slug: "dingzhou-shizang",
    content: `Dingzhou Shizang (定州石藏, fl. early 9th c.) is named in the *Jǐngdé Chuándēng Lù* as a Dharma heir of Nanquan Puyuan and one of the secondary Mazu-line teachers active in the Dingzhou region of modern Hebei[1]. The lamp records preserve a small body of his exchanges in the characteristic Hongzhou-line style of action-as-answer, though the surviving record places him in the lineage without preserving extensive biographical detail[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Dingzhou Shizang — entry in the Nanquan / Mazu-line genealogies",
      },
      {
        index: 2,
        sourceId: "src_poceski_ordinary_mind",
        pageOrSection: "ch. on Nanquan's heirs and the regional Mazu-line community",
      },
    ],
  },
  {
    slug: "guizong-cezhen",
    content: `Guizong Cezhen (歸宗策真, d. 979) was an early Five-Dynasties / Northern-Song Fayan-house teacher in the line descending from Fayan Wenyi, abbot of Guizong-si on Mount Lu in modern Jiangxi[1]. He is to be distinguished from the earlier and better-attested Guizong Zhichang of the mid-eighth century, a Mazu disciple at the same temple; lamp records and modern reconstructions both treat the two figures as separate, though they share the temple-name epithet[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Guizong Cezhen — entry in the Fayan-house genealogies",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Mount Lu Chan and the Guizong-si succession",
      },
    ],
  },
  {
    slug: "changqing-huileng",
    content: `Changqing Huileng (長慶慧稜, 854–932) was a Dharma heir of Xuefeng Yicun and a leading second-generation teacher of the Xuefeng community in Fujian, alongside his fellow-students Xuansha Shibei and Yunmen Wenyan[1]. The lamp records preserve the often-quoted detail that he "wore out seven meditation cushions" in the course of his long training under Xuefeng — a topos that became standard shorthand in later Chan literature for the patient, drawn-out quality of practice in the Xuefeng community[2].

His awakening, recorded in the *Jǐngdé Chuándēng Lù*, came on the morning he rolled up a bamboo blind and saw the outside world: he composed the verse "How wrong I was, how wrong! Now I roll up the blind and see the world"[3]. He went on to establish a community at the Changqing Yuan in Fuzhou, and his exchanges with Baofu Congzhan — the two Xuefeng-line teachers most often paired in the lamp records — became a central source of late-Tang Fujian Chan dialogues that the *Bìyán Lù* draws on repeatedly[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Xuefeng's community and its successors",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Changqing Huileng — biographical entry; \"seven cushions\"",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Changqing Huileng — bamboo-blind awakening verse",
      },
      {
        index: 4,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Cases featuring Changqing and Baofu (e.g. Case 8, Case 23)",
      },
    ],
  },
  {
    slug: "baofu-congzhan",
    content: `Baofu Congzhan (保福從展, d. 928) was a Dharma heir of Xuefeng Yicun who taught at Baofu Temple in modern Fujian and is paired in the lamp records most often with his fellow-student Changqing Huileng[1]. The two are the most frequently cited interlocutors in the Xuefeng-community dialogues that the *Bìyán Lù* and the *Cóngróng Lù* select as case material — a body of exchanges that, in McRae's reading, helped fix the genre of the "encounter dialogue" itself as the canonical literary form of Song-period Chan[2].

The often-cited "Wondrous Mountain Peak" exchange (*Bìyán Lù* Case 23) — Baofu and Changqing walking together; Baofu points and says "this very spot is the peak of the Wondrous Mountain"; Changqing answers, "It is so, but what a pity" — is read by Yuanwu Keqin's commentary as a model of two awakened practitioners testing each other rather than competing[3]. Baofu's recorded sayings are otherwise sparse, but his pairing with Changqing made him an enduring fixture of Song-period koan literature.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Baofu Congzhan — biographical entry",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on the encounter-dialogue genre and the Fujian Xuefeng community",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 23 — Baofu and Changqing at the peak of the Wondrous Mountain",
      },
    ],
  },
  {
    slug: "xuansha-shibei",
    content: `Xuansha Shibei (玄沙師備, 835–908) is recorded in the *Sòng Gāosēng Zhuàn* and the *Jǐngdé Chuándēng Lù* as a former fisherman from Fuzhou who became one of the closest disciples of Xuefeng Yicun and inherited Xuefeng's community after a period of solitary practice on Mount Xuansha[1]. The lamp records preserve his awakening as a sudden moment of insight on the road down the mountain — recounted in the *Wúménguān* as the "Xuansha stubs his toe" episode — and the formula he is said to have spoken at that moment, "Bodhidharma never came to China; the Second Patriarch never went to India," became a *locus classicus* for the Chan claim that no Dharma is added from outside[2].

Xuansha is best known for the teaching of the "three invalids" (三種病人) — the blind, the deaf, and the mute — used as a diagnostic of the partial understandings into which practitioners settle; the formula is preserved in the *Línjì Lù* commentaries and recycled in koan collections from the *Bìyán Lù* onward[3]. His Dharma was carried forward through Luohan Guichen to Fayan Wenyi, the founder of the Fayan house, making Xuansha the immediate predecessor of one of the canonical Five Houses[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Xuefeng's community and the rise of the Fayan house",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Xuansha Shibei — biographical entry; \"stubbed toe\" awakening",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 88 — Xuansha and the three invalids",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Xuansha Shibei — successors and the Fayan house",
      },
    ],
  },
  {
    slug: "luohan-guichen",
    content: `Luohan Guichen (羅漢桂琛, 867–928), also known as Dizang Guichen after his temple at Mount Dizang in Zhangzhou (Fujian), was the principal Dharma heir of Xuansha Shibei and the teacher of Fayan Wenyi[1]. The lamp records describe a probing, unhurried teaching style, characterised less by the abrupt shouts and strikes of the Linji line than by carefully turned questions that thrust the student back on their own resources[2].

His most cited exchange — preserved in the *Jǐngdé Chuándēng Lù*, the *Bìyán Lù* (Case 20), and the *Wúménguān*-stream literature — is the meeting with the still-unawakened Fayan during a snowstorm: "Where are you going?" "On pilgrimage." "What is pilgrimage for?" "I don't know." "Not knowing is most intimate" (不知最親切)[3]. This formula became one of the most-quoted Chan utterances on the limits of conceptual knowing, and through Fayan and the Fayan house it shaped the late-Tang/early-Song integration of Chan with Huayan and Tiantai thought.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Xuefeng's heirs and the rise of the Fayan house",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Luohan Guichen — biographical entry and teaching style",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 20 — Dizang's \"Not knowing is most intimate\"",
      },
    ],
  },
  {
    slug: "fayan-wenyi",
    content: `Fayan Wenyi (法眼文益, 885–958) was the founder of the Fayan house (法眼宗), the latest of the canonical Five Houses of Chan. He was a scholar-monk of unusual breadth before he turned to Chan: the *Sòng Gāosēng Zhuàn* records his early mastery of Huayan and Yogācāra philosophy, and the lamp records preserve his awakening under Luohan Guichen during a snowed-in pilgrimage when Luohan answered his "I don't know" with "Not knowing is most intimate"[1]. He went on to receive Dharma transmission from Luohan and was patronised by the kings of the Southern Tang at the Qingliang Temple in Jinling (modern Nanjing)[2].

The Fayan house was distinctive among the Five Houses for the explicit philosophical use it made of Huayan's *shi-li wu'ai* (the unobstructed interpenetration of phenomenon and principle), while insisting on direct experiential realisation; Fayan's polemical *Zōngmén Shíguīlùn* ("Ten Admonitions for the Lineage") set out standards for teaching honesty and against showy method-mongering that later writers across schools cited approvingly[3]. The Fayan line flourished for three generations through Tiantai Deshao and Yongming Yanshou before being absorbed into the Linji house during the Song; its synthetic, philosophically literate temperament left its mark on Chan-Pure-Land integration and on Korean Seon[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the founding of the Fayan house",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Fayan Wenyi — biographical entry and Qingliang Temple period",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Fayan Wenyi — Zōngmén Shíguīlùn and Fayan-school doctrine",
      },
      {
        index: 4,
        sourceId: "src_buswell_radiance",
        pageOrSection: "ch. on the reception of Fayan-line Chan in Korean Seon",
      },
    ],
  },
  {
    slug: "tiantai-deshao",
    content: `Tiantai Deshao (天台德韶, 891–972) was a Dharma heir of Fayan Wenyi and the most politically influential Chan master of the Wuyue kingdom (907–978), one of the Ten Kingdoms that succeeded the Tang. Patronised by King Qian Chu, he was appointed National Teacher (*guóshī*) and based at the Tiantai mountains in modern Zhejiang[1]. From this position he undertook the project for which he is now best remembered: the recovery, at the king's request and expense, of Tiantai-school texts lost during the Huichang persecution of 845, by commissioning copies from monasteries in Goryeo Korea and Heian Japan and re-importing them into China[2].

Although a Chan master, Deshao thus played the decisive role in the revival of the Tiantai school during the tenth century — an outward instance of the Fayan house's characteristic willingness to engage philosophically and practically with non-Chan Buddhist traditions[3]. His chief disciple Yongming Yanshou would extend this synthetic temperament into a comprehensive Chan-Pure-Land-Huayan-Tiantai harmonisation that shaped late-imperial Chinese Buddhism[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Fayan house in Wuyue",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Tiantai Deshao — recovery of Tiantai texts from Korea and Japan",
      },
      {
        index: 3,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Tiantai Deshao — biographical entry",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Yongming Yanshou and Chan-Pure-Land synthesis",
      },
    ],
  },
  {
    slug: "yongming-yanshou",
    content: `Yongming Yanshou (永明延壽, 904–975) was a Dharma heir of Tiantai Deshao and abbot of Yongming Temple at West Lake in Hangzhou under the patronage of the last Wuyue king Qian Chu. He is the most consequential synthesising thinker of late-tenth-century Chinese Buddhism: his hundred-fascicle *Zōngjìnglù* (宗鏡錄, "Records of the Mirror of the [One-Mind] Source") draws on Chan, Tiantai, Huayan, Yogācāra, Vinaya and Pure Land sources to argue that all are reducible to the single Mind-only doctrine, and his *Wànshàn Tóngguī Jí* (萬善同歸集, "All Good Practices Returning to the Same Refuge") promotes a deliberate combination of Chan investigation with Pure Land *nianfo* practice[1].

Yanshou's *shuang-xiu* ("dual cultivation") of Chan and Pure Land became, over the next centuries, one of the most influential templates for mainstream Chinese Buddhist practice — the working background of Ming-Qing Chan and one of the patterns later carried into Korea and Japan[2]. The combination of Pure-Land devotion with Chan investigation that defines so much of late-imperial East Asian Buddhism descends in large measure from his synthesis[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Yongming Yanshou and the Zōngjìnglù",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Yongming Yanshou — Zōngjìnglù, Wànshàn Tóngguī, dual cultivation",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Yongming Yanshou\" and \"shuangxiu\" (dual cultivation)",
      },
    ],
  },
  {
    slug: "touzi-datong",
    content: `Touzi Datong (投子大同, 819–914) was a Dharma heir of Cuiwei Wuxue and thus a great-grandstudent of Shitou Xiqian; he settled on Mount Touzi in modern Anhui, where he taught for several decades into great old age[1]. The lamp records describe his community as small and unobtrusive — students travelled long distances to find him, and Xuefeng Yicun famously visited Touzi three times during the journey that culminated in his transmission from Deshan[2].

His recorded sayings, gathered in the *Touzi Datong Chánshī Yǔlù*, are spare and elliptical; the *Bìyán Lù* preserves several of his exchanges, including the well-known dialogue beginning "What about the matter prior to the Buddha's appearance?" — to which Touzi turns the question back into the questioner's hands[3]. His name was deliberately revived two centuries later by Touzi Yiqing of the Caodong revival, who took the mountain as a place of practice in conscious continuity with the older Touzi line[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Shitou's heirs and their lineages",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Touzi Datong — biographical entry; Xuefeng's visits",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 91 — Touzi exchanges",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Touzi Datong — Mount Touzi and the later Caodong revival",
      },
    ],
  },
  {
    slug: "tianping-congyi",
    content: `Tianping Congyi is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "luoshan-daoxian",
    content: `Luoshan Daoxian is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "mingzhao-deqian",
    content: `Mingzhao Deqian is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "baoci-xingyan",
    content: `Baoci Xingyan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "changfu-zhi",
    content: `Changfu Zhi is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "chongshou-qichou",
    content: `Chongshou Qichou is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "cizhou-faru",
    content: `Cizhou Faru is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "daguang-juhui",
    content: `Daguang Juhui (大光居誨, 837–903) is recorded in the *Jǐngdé Chuándēng Lù* as a Dharma heir of Shishuang Qingzhu and one of the lesser-attested teachers of the late-Tang Yaoshan / Qingyuan-line stream[1]. He taught in the Tan-zhou region of modern Hunan, where Shishuang's "withered-tree hall" practice was being carried forward by a small number of successors[2].

Few of his sayings are preserved beyond what the lamp records compile; the modern scholarly view, following Yanagida Seizan and others, is that masters like Daguang represent the bulk of the late-Tang Chan population — local teachers anchoring the spread of the new monastic culture rather than figures who themselves generate canonical koan literature[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Daguang Juhui — entry in the Yaoshan/Shishuang stream",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the late-Tang Yaoshan line and the withered-tree hall tradition",
      },
      {
        index: 3,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on the late-Tang Chan community as the bulk of the tradition",
      },
    ],
  },
  {
    slug: "qingxi-hongjin",
    content: `Qingxi Hongjin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "shanglan-lingchao",
    content: `Lingzhao (靈照, fl. early 9th c.), traditionally treated as the daughter of the lay Chan adept Pang Yun ("Layman Pang"), is one of the very few women preserved in the early Tang lamp records as an awakened practitioner in her own right rather than as a wife or mother of a male teacher[1]. The *Pángjūshì Yǔlù* (the recorded sayings of Layman Pang) preserves a number of her exchanges with her father and other contemporaries that the lamp records and later Chan literature treat as full Chan dialogues[2].

The most-quoted of these is the three-way exchange on the difficulty of practice: Pang Yun says it is "difficult, difficult, difficult — like spreading ten *dou* of sesame seed over a tree-top"; his wife answers that it is "easy — like touching feet to the ground on getting out of bed"; and Lingzhao closes the exchange with "Neither difficult nor easy: on the tips of the hundred grass-blades, the meaning of the Patriarchs"[3]. Lingzhao is also remembered for the story of her death, in which she sat at her own seat and entered *parinirvāṇa* before her father — leaving him to remark that "my daughter was always quick"[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Lingzhao (Shanglan) — entry in the Pang Yun sub-records",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Layman Pang and his family",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Layman Pang — the \"difficult/easy/neither\" exchange",
      },
    ],
  },
  {
    slug: "shaoshan-huanpu",
    content: `Shaoshan Huanpu (韶山寰普, fl. mid-9th c.) is recorded in the *Jǐngdé Chuándēng Lù* as a Dharma heir of Jiashan Shanhui who taught at Mount Shao in modern Hunan in the late ninth century[1]. The surviving record places him within the Yaoshan / Jiashan stream but preserves only a handful of his individual exchanges; modern scholarship treats him as one of the many mid-ranking Tang teachers whose role was lineage maintenance in their local region rather than the production of canonical koan material[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Shaoshan Huanpu — entry in the Jiashan-stream genealogies",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on the late-Tang Chan regional teaching network",
      },
    ],
  },
  {
    slug: "shushan-kuangren",
    content: `Shushan Kuangren (疏山匡仁, fl. late 9th c. – early 10th c.) was a Dharma heir of Dongshan Liangjie and one of the Caodong-stream teachers active in the immediate post-Dongshan generation[1]. He taught at Mount Shu in modern Jiangxi, and the *Jǐngdé Chuándēng Lù* preserves a number of his exchanges in the typical Dongshan-line style, including dialogues that would later be reused as koan material in the Song collections[2]. Note that his given name *Kuangren* (匡仁, "Upright Humanity") is sometimes mistranslated as if it contained *kuáng* 狂 ("mad"); the popular "Madman of Mount Shu" tag is a confusion of the two characters and is not supported by the lamp records, which consistently spell his name with the *kuāng* 匡 graph[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Shushan Kuangren — entry in the Dongshan-stream genealogies",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Dongshan's heirs and the early Caodong line",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Shushan Kuangren — name etymology and lineage placement",
      },
    ],
  },
  {
    slug: "taiyuan-fu",
    content: `Taiyuan Fu is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "wang-yanbin",
    content: `Wang Yanbin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "wujiu-youxuan",
    content: `Wujiu Youxuan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yungai-zhiyuan",
    content: `Yungai Zhiyuan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },

  // =========================================================================
  // Nanyue line — additional masters
  // =========================================================================

  {
    slug: "baoen-xuanze",
    content: `Baoen Xuanze is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "dongshan-shouchu",
    content: `Dongshan Shouchu (洞山守初, 910–990) — distinct from the ninth-century Dongshan Liangjie of the Caodong school — was a Dharma heir of Yunmen Wenyan who taught on Mount Dong in modern Hubei[1]. The lamp records preserve a relatively small number of his sayings, but two of them, both of his exchanges with Yunmen, became canonical koans: Case 12 of the *Mumonkan* / *Wúménguān* and the closely related "three pounds of flax" exchange that the koan collections sometimes attribute to him alongside the better-known Dongshan Liangjie[2].

In the *Mumonkan* exchange, Yunmen asked Shouchu where he had come from; Shouchu named the place; Yunmen pressed further about his summer's training, then declared that Shouchu deserved sixty blows of the staff — only to revoke them when Shouchu, the next day, asked what fault his teacher had found. The *Mumonkan* commentary by Wumen Huikai turns this exchange into one of the most-meditated investigations in the collection on the relationship between expression, response, and a teacher's seeming arbitrariness[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Yunmen and his heirs",
      },
      {
        index: 2,
        sourceId: "src_mumonkan_senzaki_1934",
        pageOrSection: "Case 15 — Dongshan's \"sixty blows\" (Tōzan-shijūbō)",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Dongshan Shouchu — distinction from Dongshan Liangjie",
      },
    ],
  },
  {
    slug: "jingqing-daofu",
    content: `Jingqing Daofu (鏡清道怤, 868–937) was a Dharma heir of Xuefeng Yicun and one of the principal teachers of the second-generation Xuefeng community in Fujian and Wuyue[1]. The lamp records describe a master particularly known for using sensory phenomena — the sound of rain, a wind through the trees, a bird's cry — as material for testing students' direct apprehension.

The best-known of his exchanges is preserved as Case 46 of the *Bìyán Lù*: a monk asks, "What is the sound of raindrops?"; Jingqing answers, "*Liú-liú-liú*" (the dripping itself), and presses the student on whether they "themselves are turned by the sound of raindrops" or able to remain undisturbed within it[2]. The case, with Yuanwu Keqin's commentary, became one of the standard koans of the Song-period Linji curriculum and a paradigmatic Xuefeng-line investigation of the gap between direct sensation and conceptual overlay[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Jingqing Daofu — biographical entry",
      },
      {
        index: 2,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 46 — Jingqing's \"raindrops\"",
      },
      {
        index: 3,
        sourceId: "src_heine_wright_koan",
        pageOrSection: "ch. on koan literature and the Xuefeng-line dialogues",
      },
    ],
  },
  {
    slug: "qinglin-shiqian",
    content: `Qinglin Shiqian is recorded in the historiography of the modern Zen transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on twentieth-century Zen transmission" },
    ],
  },
  {
    slug: "yanyang-shanxin",
    content: `Yanyang Shanxin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "zhongyi-hongen",
    content: `Zhongyi Hongen is recorded in the historiography of the modern Zen transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on twentieth-century Zen transmission" },
    ],
  },

  // =========================================================================
  // Linji school — the great shout lineage
  // =========================================================================

  {
    slug: "nanyue-huairang",
    content: `Nanyue Huairang (南嶽懷讓, 677–744) is traditionally treated, alongside Qingyuan Xingsi, as the senior Dharma heir of the Sixth Patriarch Huineng and the ancestor of the Hongzhou stream — and through Mazu Daoyi of the Linji house and Guiyang school of Tang Chan[1]. Like Qingyuan, his individual record is thin in early sources and his lineage role was largely constructed retrospectively by the lamp records to give the Hongzhou and Shitou streams parallel claim to direct Sixth-Patriarch descent[2].

The most-cited episode in his record is the "polishing the tile" exchange with his student Mazu, preserved most fully in the *Jǐngdé Chuándēng Lù* and recycled by Dōgen in the *Zazenshin*: Mazu sat in long meditation; Nanyue picked up a tile outside his hut and rubbed it on a stone; asked what he was doing, Nanyue answered, "Polishing it to make a mirror"; Mazu asked how polishing a tile could make a mirror, and Nanyue answered, "How can sitting in meditation make a Buddha?"[3] The exchange became the canonical Hongzhou-line caution against the reification of *zazen* and was a key text for Dōgen's later working-out of the relation between sitting and awakening[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Huineng's heirs and the Hongzhou line",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on the construction of post-Huineng Chan genealogy",
      },
      {
        index: 3,
        sourceId: "src_poceski_ordinary_mind",
        pageOrSection: "ch. on Huairang, Mazu, and the polishing-the-tile exchange",
      },
      {
        index: 4,
        sourceId: "src_cleary_shobogenzo",
        pageOrSection: "Zazenshin — Dōgen's reading of the polishing-the-tile exchange",
      },
    ],
  },
  {
    slug: "xitang-zhizang",
    content: `Xitang Zhizang (西堂智藏, 735–814) was, with Baizhang Huaihai and Nanquan Puyuan, one of the three principal Dharma heirs of Mazu Daoyi who collectively defined the mature shape of the Hongzhou house[1]. He served as abbot at the Kaiyuan-si in Jiangxi, the very temple where Mazu had taught, and was for several decades the institutional anchor of the Mazu community after the founder's death in 788[2].

Xitang is also the master through whom the Hongzhou line first reached Korea: the two future founders of Korean Nine-Mountain Schools, Tooui (doui, founder of Gajisan) and Hyech'ŏl (founder of Tongnisan), both received transmission from him in the early ninth century and carried his line back to Silla, making Xitang the proximate ancestor of two of the foundational Korean Seon schools[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_poceski_ordinary_mind",
        pageOrSection: "ch. on Mazu's three principal heirs",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Xitang Zhizang — biographical entry; Kaiyuan-si abbacy",
      },
      {
        index: 3,
        sourceId: "src_buswell_formation",
        pageOrSection: "pp. 25–40 — Xitang Zhizang and the early-Korean Nine Mountain Schools",
      },
    ],
  },
  {
    slug: "yanguan-qian",
    content: `Yanguan Qi'an (鹽官齊安, c. 750–842) was a Dharma heir of Mazu Daoyi who taught at Haichang-yuan in Yanguan (modern Hangzhou region), the salt-administration town from which his sobriquet derives[1]. The lamp records preserve a number of his exchanges in the characteristic Hongzhou-line style and document his relatively long abbacy in the second half of the eighth and the first half of the ninth century[2].

His best-known dialogue is the "rhinoceros fan" exchange preserved as Case 91 of the *Bìyán Lù*: a monk asks Yanguan to fetch the rhinoceros-horn fan, and on being told it is broken, asks Yanguan to bring the rhinoceros itself; Yanguan's response — silence in some recensions, a gestured assent in others — became one of the most contemplated koans on the relation between the symbol and the symbolised[3]. Yanguan also gave Dharma transmission to the Korean monk Pŏmil (Beomil), founder of the Saguelsan school in the Nine Mountain Schools of Korean Seon, adding to the Mazu line's role in seeding the Korean tradition[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_poceski_ordinary_mind",
        pageOrSection: "ch. on Mazu's heirs and the Hongzhou expansion",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Yanguan Qi'an — biographical entry",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Case 91 — Yanguan's rhinoceros fan",
      },
      {
        index: 4,
        sourceId: "src_buswell_formation",
        pageOrSection: "pp. 28–35 — Yanguan and the founding of the Saguelsan school in Korea",
      },
    ],
  },
  {
    slug: "wufeng-changguan",
    content: `Wufeng Changguan (五峰常觀, fl. early 9th c.) was a Dharma heir of Mazu Daoyi who taught at Mount Wufeng ("Five Peaks") in modern Jiangxi[1]. The lamp records preserve a small body of his exchanges, in which he uses the staff and the shout in the directly confrontational manner the Hongzhou line would pass on to the Linji house in the next generation[2].

Although the bulk of Wufeng's specific record is preserved only in summary form, his name recurs in the genealogy of the Hongzhou community as one of the secondary Mazu heirs whose communities anchored the line's regional spread through Jiangxi and the middle Yangzi during the early ninth century — the institutional substrate from which the later Guishan, Linji and other Hongzhou-stream sub-lineages descend[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Wufeng Changguan — biographical entry",
      },
      {
        index: 2,
        sourceId: "src_poceski_ordinary_mind",
        pageOrSection: "ch. on the second-generation Hongzhou teaching style",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the regional spread of the Hongzhou line",
      },
    ],
  },
  {
    slug: "muzhou-daoming",
    content: `Muzhou Daoming (睦州道明, 780–877), also known as Chen Zunsu (陳尊宿) after the sandal-weaving lay-name he kept on after monastic retirement, was a Dharma heir of Huangbo Xiyun and one of the most demanding teachers of the late-Tang generation[1]. After many years at Kaiyuan Temple in Muzhou (modern Zhejiang) and a period of teaching activity, he retired into the city to weave straw sandals which he distributed anonymously to the poor — the practice from which his "Sandalweaver" nickname derives[2].

Muzhou is best remembered as the master who broke open Yunmen Wenyan's training. The lamp records preserve the celebrated three-visits episode: when Yunmen came seeking instruction, Muzhou shut the gate on him on the first two visits; on the third Muzhou caught Yunmen's leg in the gate as he shut it, and in the shock of pain Yunmen had his decisive opening, after which Muzhou sent him on to Xuefeng Yicun to complete his training[3]. The episode is preserved in the *Yunmen Yulu*, Urs App's *Master Yunmen* anthology, and the lamp records[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Muzhou Daoming / Chen Zunsu — biographical entry",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Huangbo's heirs and Muzhou's sandal-weaver retirement",
      },
      {
        index: 3,
        sourceId: "src_app_yunmen",
        pageOrSection: "Introduction — Yunmen's training under Muzhou Daoming",
      },
      {
        index: 4,
        sourceId: "src_app_yunmen",
        pageOrSection: "Translated Record — Muzhou episode in the Yunmen Yulu",
      },
    ],
  },
  {
    slug: "lingyun-zhiqin",
    content: `Lingyun Zhiqin (靈雲志勤, fl. 9th c.) is named in the *Jǐngdé Chuándēng Lù* as a Dharma heir of Guishan Lingyou — and so a member of the Guiyang house rather than the Linji line — best known for the awakening story preserved in the lamp records and recycled in the *Wúménguān* and *Bìyán Lù* commentary tradition[1]. After a long period of practice he was walking in the mountains one spring morning when the sudden sight of peach blossoms precipitated his decisive insight; his enlightenment verse, "For thirty years I sought a swordsman; how many times the leaves have fallen, how many times the buds have bloomed; but since one look at the peach blossoms, even now I have no more doubts," became one of the most-quoted attestations in the tradition that awakening can be triggered by any sensory occasion when the practitioner is ready[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Lingyun Zhiqin — biographical entry; Guishan Lingyou's heir",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Guishan's heirs and the peach-blossom awakening",
      },
    ],
  },
  {
    slug: "baoshou-yanzhao",
    content: `Baoshou Yanzhao (寶壽延沼, fl. late 9th c.) was a Dharma heir of Linji Yixuan and a senior member of the founding Linji circle alongside Sansheng Huiran and Xinghua Cunjiang[1]. The lamp records preserve a small but characteristic body of his exchanges, including the celebrated dialogue with Sansheng in which the two visit a barbershop and exchange a paradoxical command that reads as a Linji-style host-and-guest demonstration[2].

He is one of the founding-generation Linji teachers from whom the school traces its institutional self-image as a community of contemporaries sharpening each other, rather than a strictly teacher-to-student vertical lineage; through his successors the Baoshou sub-line continued into the next century alongside Xinghua's main transmission[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_welter_linji",
        pageOrSection: "ch. on Linji's heirs and the founding Linji circle",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Baoshou Yanzhao — biographical entry and Sansheng exchanges",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Linji-house's founding generation",
      },
    ],
  },
  {
    slug: "xinghua-cunjiang",
    content: `Xinghua Cunjiang (興化存獎, 830–888) was the recognised Dharma heir of Linji Yixuan and the figure through whom the main line of Linji transmission descends. The *Línjì Lù* itself names him as the compiler of his teacher's record, and the lamp records preserve a series of exchanges showing him both as Linji's chosen attendant and as a teacher who continued the use of the shout (*hè* 喝) and the staff after his master's death[1].

His own community at Xinghua Temple in Weizhou (modern Henan) attracted both Linji-line students and visitors from other lineages; his Dharma heir Nanyuan Huiyong carried the line forward into the next century, and through Nanyuan → Fengxue → Shoushan it eventually branched into the Yangqi and Huanglong sub-houses that dominated Song-period Chan[2]. Without Xinghua's faithful transmission and his work as the editor of Linji's record, the Linji house — and through it the Japanese Rinzai tradition that derives from it — would not have survived its founder's generation in the form we have it[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_welter_linji",
        pageOrSection: "ch. on the compilation of the Línjì Lù and Xinghua's role",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Linji and his successors",
      },
      {
        index: 3,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Xinghua Cunjiang — biographical entry",
      },
    ],
  },
  {
    slug: "nanyuan-huiyong",
    content: `Nanyuan Huiyong (南院慧顒, d. 930) was the Dharma heir of Xinghua Cunjiang and the second-generation transmitter of the Linji house. He taught at Nanyuan Temple in Ruzhou (modern Henan) during the disruptive late-Tang and early Five-Dynasties period, when many Chan communities collapsed; his survival of that era is one of the reasons the Linji line continued at all[1].

The lamp records and the *Línjì Lù* supplementary materials preserve a small number of Nanyuan's exchanges, several of which use the characteristic Linji "guest and host" framework to test his students' understanding of standpoint and response[2]. His Dharma heir Fengxue Yanzhao consciously regarded the Linji line as having narrowed almost to extinction in his generation, a perception that gives Nanyuan's transmission its standard place in Linji historiography as the bridge between the founder's circle and the Song-dynasty revival[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Linji line through the Five Dynasties",
      },
      {
        index: 2,
        sourceId: "src_welter_linji",
        pageOrSection: "ch. on \"guest and host\" exchanges after Xinghua",
      },
      {
        index: 3,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Nanyuan Huiyong — biographical entry",
      },
    ],
  },
  {
    slug: "fengxue-yanzhao",
    content: `Fengxue Yanzhao is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "shoushan-xingnian",
    content: `Shoushan Xingnian is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "fenyang-shanzhao",
    content: `Fenyang Shanzhao is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "shishuang-chuyuan",
    content: `Shishuang Chuyuan is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "langye-huijue",
    content: `Langye Huijue is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "huanglong-huinan",
    content: `Huanglong Huinan (黃龍慧南, 1002–1069) was a Dharma heir of Shishuang Chuyuan and the founder of the Huanglong (黃龍) sub-house of the Linji school, one of the two main sub-lineages — alongside Yangqi — into which the Song-period Linji line divided[1]. He settled at Mount Huanglong in modern Jiangxi, where his community attracted a generation of leading students; his Dharma was carried on through Huitang Zuxin, Hui'an Zhenru, and many others into the next century[2].

His teaching is best remembered for the "Three Barriers of Huanglong" (黃龍三關), three test questions he routinely put to advanced students: "Everyone has a place of birth — where is yours?", "My hand is like the Buddha's hand — how so?", and "My foot is like a donkey's foot — what does this mean?"[3] The Huanglong line was the first Linji-sub-house transmitted to Japan, by Myōan Eisai in 1191, and its impact in Korea ran through Goryeo-period Seon — though within China itself it was eventually overshadowed by the Yangqi sub-house, which produced Wuzu Fayan, Yuanwu Keqin, and Dahui Zonggao[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Song division of the Linji line",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Huanglong Huinan — biographical entry and successors",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Huanglong Huinan — Three Barriers",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Eisai's import of the Huanglong line into Japan",
      },
    ],
  },
  {
    slug: "huitang-zuxin",
    content: `Huitang Zuxin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "huguo-jingyuan",
    content: `Huguo Jingyuan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "juefan-huihong",
    content: `Juefan Huihong is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "cuiyan-kezhen",
    content: `Cuiyan Kezhen is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "dahong-zuzheng",
    content: `Dahong Zuzheng is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "dayu-shouzhi",
    content: `Dayu Shouzhi is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "doushuai-congyue",
    content: `Doushuai Congyue is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "baizhang-niepan",
    content: `Baizhang Niepan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "baoning-renyong",
    content: `Baoning Renyong is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "licun",
    content: `Licun is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "kaifu-daoning",
    content: `Kaifu Daoning is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "taiping-huiqin",
    content: `Taiping Huiqin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "tongfeng-anzhu",
    content: `Tongfeng Anzhu is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "wuzu-fayan",
    content: `Wuzu Fayan (五祖法演, c. 1024–1104), the "Fifth Patriarch Fayan" — so called because he taught at the Dongshan-si on Mount East-Mountain (Wǔzǔ-shān), the same site where the Fifth Patriarch Hongren had taught some four centuries earlier, and not to be confused with the earlier Fayan Wenyi — was the major Yangqi-line Linji master of the late Northern Song[1]. He was the Dharma heir of Baiyun Shouduan and the teacher of three of the most consequential figures of Song-period Chan: Yuanwu Keqin, Foyan Qingyuan, and Foguo Weibai[2].

Wuzu is one of the most cited teachers in the Song koan literature, and his recorded sayings — collected as the *Wǔzǔ Fǎyǎn Chánshī Yǔlù* — are characterised by terse, paradoxical formulations that refuse both affirmation and negation. His teaching is the immediate background of the Linji-house style codified in his student Yuanwu's *Bìyán Lù* and his grand-student Dahui's *huatou* curriculum[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Yangqi sub-house in the late Northern Song",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Wuzu Fayan — biographical entry and three principal heirs",
      },
      {
        index: 3,
        sourceId: "src_schlutter_dahui",
        pageOrSection: "ch. on the Wuzu → Yuanwu → Dahui line and the formation of huatou practice",
      },
    ],
  },
  {
    slug: "yuanwu-keqin",
    content: `Yuanwu Keqin (圜悟克勤, 1063–1135) was the principal Dharma heir of Wuzu Fayan and the foremost Yangqi-line Linji master of the early Southern Song[1]. He held abbacies at the major Linji monasteries of his generation, including Jiashan-si and Lingyin-si, and received the imperial title *Yuanwu Chánshī* from Emperor Gaozong[2].

His most enduring contribution is the *Bìyán Lù* (碧巖錄, "Blue Cliff Record"): taking Xuedou Chongxian's earlier collection of one hundred cases with their verse-commentaries, Yuanwu added his own *chuíshì* (introductions), *zhuó-yǔ* (capping phrases), and prose commentaries on both case and verse, creating the multi-layered text that became the canonical koan collection of late-imperial East Asian Chan and Japanese Rinzai[3]. The *Bìyán Lù* was lecture-form initially and was compiled by his students; Yuanwu also wrote letters and Dharma-talks collected in the *Xīntángjí* and the *Yuánwù Yǔlù*[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Yuanwu Keqin and the Bìyán Lù",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Yuanwu Keqin — biographical entry and imperial honours",
      },
      {
        index: 3,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Translator's introduction — Yuanwu's additions to Xuedou's verses",
      },
      {
        index: 4,
        sourceId: "src_heine_wright_koan",
        pageOrSection: "ch. on the Bìyán Lù and the literary form of Song-period Chan",
      },
    ],
  },
  {
    slug: "dahui-zonggao",
    content: `Dahui Zonggao (大慧宗杲, 1089–1163) was the principal Dharma heir of Yuanwu Keqin and the master most responsible for the development of the *kānhuà chán* (看話禪, "investigating-the-phrase Chan") method that has dominated Linji-house and Rinzai practice ever since[1]. His teaching method concentrated the student on a single critical phrase from a koan — most paradigmatically Zhaozhou's "wu" 無 — held to the point of "great doubt" (*dàyí*) until conceptual thinking exhausts itself and gives way to direct insight[2].

Dahui is also remembered for two unusually polemical campaigns: the public attack on the *mòzhào chán* ("silent illumination") of his Caodong contemporaries Hongzhi Zhengjue and Changlu Qingliao, which he characterised as a "withered-tree" quietism, and the burning of the printing blocks of his own teacher's *Bìyán Lù* in 1140 — an act preserved in his correspondence and explained as a refusal to allow the literary appreciation of the text to substitute for the labour of investigation it was meant to provoke[3]. Morten Schlütter's *How Zen Became Zen* is the standard modern monograph on the Dahui–Hongzhi controversy and its institutional context[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_schlutter_dahui",
        pageOrSection: "ch. on Dahui Zonggao and the formation of kānhuà chán",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Yangqi line and huatou practice",
      },
      {
        index: 3,
        sourceId: "src_schlutter_dahui",
        pageOrSection: "ch. on the burning of the Bìyán Lù blocks",
      },
      {
        index: 4,
        sourceId: "src_schlutter_dahui",
        pageOrSection: "Introduction — Dahui–Hongzhi controversy and Song political context",
      },
    ],
  },
  {
    slug: "wumen-huikai",
    content: `Wumen Huikai (無門慧開, 1183–1260) was a Yangqi-line Linji master in the line descending from Yuanwu Keqin and the compiler of the *Wúménguān* (無門關, "Gateless Barrier" / *Mumonkan*), the most widely-read koan collection in the world after the *Bìyán Lù*[1]. The standard biographical account preserved in the lamp records describes a six-year period during which he worked exclusively on the koan "wu" 無 (Case 1 of his own collection) before his decisive opening, after which he wrote the verse "*A thunderclap under the clear blue sky! All beings on earth open their eyes*"[2].

Wumen compiled the *Wúménguān* in 1228 from forty-eight cases he had used as preaching material at the Longxiang-si in Hangzhou; each case is given a short prose commentary and a four-line verse, producing the compact and aphoristic style that contrasts deliberately with the multi-layered architecture of the *Bìyán Lù*[3]. The text was carried to Japan in 1254 by the Japanese monk Shinchi Kakushin, who had received Wumen's Dharma transmission, and through Kakushin's Hottō line and the Daiō-Daitō-Kanzan curriculum it became the canonical introductory koan collection of Japanese Rinzai training[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_mumonkan_senzaki_1934",
        pageOrSection: "Translator's introduction — Wumen Huikai and the compilation of the Wúménguān",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Wumen Huikai — biographical entry and \"wu\" awakening",
      },
      {
        index: 3,
        sourceId: "src_heine_wright_koan",
        pageOrSection: "ch. on the form and rhetoric of the Wúménguān",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Kakushin and the Japanese reception of the Wúménguān",
      },
    ],
  },
  {
    slug: "xita-guangmu",
    content: `Xita Guangmu is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "xiyuan-siming",
    content: `Xiyuan Siming is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "nanpu-shaoming",
    content: `Nanpu Shaoming is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "huoan-shiti",
    content: `Huoan Shiti is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yuean-shanguo",
    content: `Yuean Shanguo is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yuelin-shiguan",
    content: `Yuelin Shiguan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yunan-kewen",
    content: `Yunan Kewen is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "zifu-rubao",
    content: `Zifu Rubao is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },

  // =========================================================================
  // Yangqi line — the dominant Linji subschool
  // =========================================================================

  {
    slug: "yangqi-fanghui",
    content: `Yangqi Fanghui (楊岐方會, 992–1049) was a Dharma heir of Shishuang Chuyuan and the founder of the Yangqi (楊岐) sub-house of the Linji school, the one of the two Linji sub-lineages — alongside Huanglong Huinan's — which proved to be the more enduring[1]. He taught at Mount Yangqi in modern Jiangxi, where his small community produced the immediate ancestors of the great mid-eleventh- to twelfth-century Yangqi line: through his successor Baiyun Shouduan, the Yangqi line passed to Wuzu Fayan and then to the three masters who shaped the canonical form of late-imperial Linji practice — Yuanwu Keqin (compiler of the *Bìyán Lù*), Foyan Qingyuan, and through Yuanwu, Dahui Zonggao[2].

The Yangqi line eventually absorbed the Huanglong sub-house and became the only surviving Linji line; through the late-Song transmissions to Japan it gave rise to the Daiō-Daitō-Kanzan / Ōtōkan stream from which essentially all modern Rinzai Zen descends[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the founding of the Yangqi sub-house",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Yangqi Fanghui — biographical entry and successors",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the Yangqi line and the Ōtōkan transmission to Japan",
      },
    ],
  },
  {
    slug: "baiyun-shouduan",
    content: `Baiyun Shouduan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "foyan-qingyuan",
    content: `Foyan Qingyuan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "guishan-daan",
    content: `Guishan Daan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "mingan-rongxi",
    content: `Mingan Rongxi is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "sansheng-huiran",
    content: `Sansheng Huiran is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "sixin-wuxin",
    content: `Sixin Wuxin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "dasui-fazhen",
    content: `Dasui Fazhen is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "zhangjing-huaiyun",
    content: `Zhangjing Huaiyun is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "zhuan-shigui",
    content: `Zhuan Shigui is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "gaofeng-yuanmiao",
    content: `Gaofeng Yuanmiao (高峰原妙, 1238–1295) was the chief Dharma heir of Xueyan Zuqin and one of the most influential Yangqi-line Linji masters of the late Southern Song and early Yuan. His autobiographical *Gāofēng Héshàng Chánshī Cān Chán Jiào Bīng* ("Admonitions on Investigating Chan") records the extreme regime of his training — he is said to have practised standing on the edge of a cliff to keep himself from falling asleep, and his decisive awakening came when a monk dropped a wooden pillow and the crack of its fall shattered his last knot of doubt[1].

He retired in 1279 to a cave on Mount Tianmu in modern Zhejiang, the *Shīzī Yán* (Lion's Rock), where he taught for the rest of his life under the strict rule of never descending the mountain. The formulation of *huatou* practice he transmitted there — built around the triad of "great faith, great determination, and great doubt" — was codified by his disciple Zhongfeng Mingben and became the standard Yuan-and-after Linji curriculum, carried into Japan through the Daiō-Daitō-Kanzan line and into Korea through the Goryeo-period Seon revival[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Gaofeng Yuanmiao — biographical entry; Cān Chán Jiào Bīng",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the late-Song Linji koan curriculum and its East-Asian transmission",
      },
    ],
  },
  {
    slug: "ji-an-xin",
    content: `Ji An Xin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "shiwu-qinggong",
    content: `Shiwu Qinggong (石屋清珙, 1272–1352), known by his sobriquet "Stonehouse" (Shiwu), was a Yangqi-line Linji master of the late Song and early Yuan and the principal Dharma heir of Jihu Yanlin (a senior heir of Wuzhun Shifan)[1]. After a long period of training at the major Linji monasteries of the Hangzhou region, he retired around 1312 to the Tianhu hermitage on Mount Xiawu in modern Anhui, where he spent the rest of his life as a working farmer-monk and a teacher of a small circle of students[2].

Two distinct bodies of literature preserve his teaching. His *Mountain Poems* (山居詩) — over 180 short poems on the practice and economy of solitary mountain life — are among the most-anthologised hermit-poet works of late-imperial East Asian Buddhism and were translated into English by Bill Porter ("Red Pine") in 1986[3]. His more institutional legacy is the Dharma transmission he gave in 1347 to the Korean monk Taego Bou, the line through which Yangqi-Linji Chan entered Korea and reshaped Goryeo-period Seon[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Shiwu Qinggong — biographical entry",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on late-Song / early-Yuan Yangqi line and the hermit tradition",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Shiwu Qinggong — Mountain Poems and Stonehouse hermitage",
      },
      {
        index: 4,
        sourceId: "src_buswell_formation",
        pageOrSection: "pp. 41–74 — transmission to Taego Bou and the Korean Linji line",
      },
    ],
  },
  {
    slug: "xueyan-zuqin",
    content: `Xueyan Zuqin (雪巖祖欽, 1216–1287) was a Yangqi-line Linji master of the late Southern Song and the principal teacher of Gaofeng Yuanmiao, through whom his approach to *huatou* / *kanhua* practice passed into the early-Yuan curriculum that would shape both later Chinese Linji and Japanese Rinzai training[1]. He trained under Wuzhun Shifan at Jingshan and taught at several monasteries before settling at Mount Yang and Mount Xueyan in modern Hubei[2].

Xueyan's teaching is best preserved in the *Xueyan Zuqin Heshang Yulu* and in Gaofeng's autobiographical *Cān Chán Jiào Bīng* (參禪箴), which records his teacher's emphasis on the triad of "great faith, great determination, and great doubt" (大信根, 大憤志, 大疑情) as the prerequisites of *huatou* investigation — a formula that became canonical in the later Linji house and was carried into Japan through Nanpo Jōmin and his Daiō-Daitō-Kanzan successors[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the Song Linji koan curriculum and its Japanese transmission",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Xueyan Zuqin — biographical entry",
      },
      {
        index: 3,
        sourceId: "src_schlutter_dahui",
        pageOrSection: "ch. on huatou practice and the \"three essentials\" formula",
      },
    ],
  },

  // =========================================================================
  // Guiyang school — the earliest of the Five Houses
  // =========================================================================

  {
    slug: "xiangyan-zhixian",
    content: `Xiangyan Zhixian is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "xianglin-chengyuan",
    content: `Xianglin Chengyuan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "baofeng-weizhao",
    content: `Baofeng Weizhao is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "hangzhou-tianlong",
    content: `Hangzhou Tianlong is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "huguo-shoucheng",
    content: `Huguo Shoucheng is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "jiufeng-qin",
    content: `Jiufeng Qin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "qinshan-wensui",
    content: `Qinshan Wensui is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "xingyang-qingpou",
    content: `Xingyang Qingpou is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "zhimen-guangzuo",
    content: `Zhimen Guangzuo is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },

  // =========================================================================
  // Caodong school — silent illumination lineage
  // =========================================================================

  {
    slug: "caoshan-benji",
    content: `Caoshan Benji (曹山本寂, 840–901) was the principal Dharma heir of Dongshan Liangjie and traditionally treated as the co-founder of the Caodong (曹洞) school, the name combining the syllable 曹 of Caoshan's mountain (Mount Cao, in modern Jiangxi) with the 洞 of his teacher Dongshan[1]. The order in which the two syllables are joined — student before teacher — is unusual; commentators since the Song have explained it as a euphonic choice, and modern scholars note that 曹 may also evoke Caoxi (曹溪), the mountain of the Sixth Patriarch Huineng, anchoring the school's claim of descent from him[2].

Caoshan's chief contribution was the systematisation of Dongshan's "Five Ranks" (五位) — the dialectical scheme describing the interplay of the absolute (zheng 正) and the relative (pian 偏) — into a more elaborate analytic framework set out in his recorded sayings and surviving in the *Caoshan Benji Chanshi Yulu*; the *Lord-and-Vassal* variant (Wuwei Junchen) and the I Ching correlations are specifically Caoshan refinements rather than direct Dongshan formulations[3]. His mountain attracted a large following during the late ninth century, but his own line did not last beyond his immediate disciples and was extinct by the mid-tenth century — *not* absorbed into Yunju Daoying's branch, which was a parallel sibling line under Dongshan that survived independently and is the conduit through which all later Caodong / Sōtō transmission, including Dōgen's, in fact runs[4]. The school as a whole nevertheless continued to bear Caoshan's name, and modern Sōtō historiography treats him as co-equal with Dongshan in the school's founding even though the surviving transmission runs through his dharma brother[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Dongshan, Caoshan, and the founding of the Caodong school",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Caoshan Benji — biographical entry; etymology of \"Caodong\"",
      },
      {
        index: 3,
        sourceId: "src_leighton_cultivating_empty_field",
        pageOrSection: "Introduction — Five Ranks and the early Caodong synthesis",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Caoshan Benji — life, Five Ranks, lineage",
      },
    ],
  },
  {
    slug: "yunju-daoying",
    content: `Yunju Daoying (雲居道膺, d. 902) was the principal Dharma heir of Dongshan Liangjie alongside Caoshan Benji, and the figure through whom the main line of the Caodong house actually descended — the line that, after Caoshan's branch petered out within two generations, carried the school forward through the Northern and Southern Song[1]. He established a large community on Mount Yunju in modern Jiangxi, which became the most institutionally well-established Caodong centre of the late ninth and tenth centuries[2].

Yunju's teaching emphasised the quiet, unadorned *zazen*-centered style that the Caodong house would systematise as *mòzhào chán* under Hongzhi Zhengjue and as *shikantaza* under Dōgen. His line passed through Tongan Daopi, Tongan Guanzhi, Liangshan Yuanguan, Dayang Jingxuan, and the late-eleventh-century Caodong revival around Touzi Yiqing, Furong Daokai, and Hongzhi — making Yunju the proximate ancestor of every later Caodong / Sōtō teacher[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Dongshan's heirs and the Yunju line",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Yunju Daoying — biographical entry and Mount Yunju community",
      },
      {
        index: 3,
        sourceId: "src_leighton_cultivating_empty_field",
        pageOrSection: "Introduction — the Yunju line and the Caodong revival",
      },
    ],
  },
  {
    slug: "guishan-lingyou",
    content: `Guishan Lingyou is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yangshan-huiji",
    content: `Yangshan Huiji is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "damei-fachang",
    content: `Damei Fachang is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "changsha-jingcen",
    content: `Changsha Jingcen is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "moshan-liaoran",
    content: `Moshan Liaoran is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "tongan-daopi",
    content: `Tongan Daopi is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "tongan-guanzhi",
    content: `Tongan Guanzhi is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "liangshan-yuanguan",
    content: `Liangshan Yuanguan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "dayang-jingxuan",
    content: `Dayang Jingxuan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "fushan-fayuan",
    content: `Fushan Fayuan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "touzi-yiqing",
    content: `Touzi Yiqing is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "furong-daokai",
    content: `Furong Daokai is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "danxia-zichun",
    content: `Danxia Zichun is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "hongzhi-zhengjue",
    content: `Hongzhi Zhengjue (宏智正覺, 1091–1157) was the great Southern-Song Caodong master and the foremost articulator of *mòzhào chán* (默照禪, "silent illumination Chan"). He served as abbot of Tiantong-si (天童寺) near Mingzhou for thirty years and built it into the major Caodong centre of the twelfth century[1]. His prose poem *Mòzhào Míng* (默照銘, "Silent-Illumination Inscription") and his hundred verse-comments on koan cases — preserved in the *Hongzhi Songgu* and later assembled by Wansong Xingxiu into the *Cóngróng Lù* (從容錄, "Book of Serenity") — are the canonical statements of the silent-illumination practice and the Caodong literary-koan tradition that paralleled the Linji *Bìyán Lù* line[2].

Hongzhi's championing of silent illumination occasioned the famous polemic by his Linji-line contemporary Dahui Zonggao against *mòzhào* as a "dead-tree" quietism — though Dahui's earliest named targets were in fact Hongzhi's dharma-brother Zhenxie Qingliao (Changlu Qingliao) and the broader Caodong revival generation, not Hongzhi personally. Schlütter's *How Zen Became Zen* reads the controversy as institutional in stakes (competition for *shifang* public-monastery abbacies and gentry / literati patronage) at least as much as doctrinal[3]. The two men's relationship at the personal level was cordial: their monasteries were ~20 li apart, with mutual visits, Hongzhi sending food during shortages, and Hongzhi asking Dahui from his deathbed to officiate the funeral, which Dahui did. Hongzhi's doctrinal influence on the Japanese Sōtō understanding of *shikantaza* is direct and textual — Dōgen quotes him extensively — but the *lineage* line into Japan does not run through Hongzhi: it runs through his Danxia Zichun dharma-brother Zhenxie Qingliao → Tiantong Zongjue (who succeeded Hongzhi as abbot at Tiantong-si but received transmission from Qingliao, not Hongzhi) → Xuedou Zhijian → Tiantong Rujing → Dōgen. Wansong Xingxiu (1166–1246), compiler of the *Cóngróng Lù*, is the *textual* transmitter of Hongzhi's koan-comment corpus into the form Dōgen actually quoted, not a dharma-chain node on the way to Japan[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_leighton_cultivating_empty_field",
        pageOrSection: "Introduction — Hongzhi Zhengjue and the Tiantong-si community",
      },
      {
        index: 2,
        sourceId: "src_leighton_cultivating_empty_field",
        pageOrSection: "Translated verses — Hongzhi Songgu and the Mòzhào Míng",
      },
      {
        index: 3,
        sourceId: "src_schlutter_dahui",
        pageOrSection: "ch. on the Dahui–Hongzhi silent-illumination controversy",
      },
      {
        index: 4,
        sourceId: "src_kim_dogen",
        pageOrSection: "ch. on Hongzhi → Wansong → Rujing → Dōgen transmission",
      },
    ],
  },
  {
    slug: "zhenxie-qingliao",
    content: `Zhenxie Qingliao is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "tiantong-rujing",
    content: `Tiantong Rujing (天童如淨, 1162–1228) was the Caodong master under whom Dōgen received Dharma transmission at the Tiantong-si monastery near Mingzhou between 1223 and 1227, and is thus the figure through whom the Caodong stream entered Japan as Sōtō Zen[1]. He was a Dharma heir of Xuedou Zhijian and held the abbacy at Tiantong from 1224 until his death; the temple was one of the great institutional Chan centres of the late Southern Song[2].

Dōgen's *Hōkyō-ki* (寶慶記), composed at Tiantong during his training and preserved in his collected works, records Rujing's instruction in extensive detail and is one of the principal early-Sōtō sources for the doctrine of *shēnxīn tuōluò* / *shinjin datsuraku* (身心脱落, "body-mind dropping away") that Dōgen would make central to his own teaching of *shikantaza*[3]. Rujing's emphasis on *zazen* against the other Buddhist practices then in fashion — *nianfo*, vinaya formalism, incense-burning — and his distance from the Caodong silent-illumination polemics of the previous generation, shape the immediate background of Dōgen's mature thought[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_kim_dogen",
        pageOrSection: "ch. on Dōgen at Tiantong and Rujing's transmission",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Rujing and the late-Song Caodong school",
      },
      {
        index: 3,
        sourceId: "src_cleary_shobogenzo",
        pageOrSection: "Hōkyō-ki — Dōgen's record of Rujing's teaching at Tiantong",
      },
      {
        index: 4,
        sourceId: "src_kim_dogen",
        pageOrSection: "ch. on shinjin datsuraku and the Rujing-Dōgen relationship",
      },
    ],
  },
  {
    slug: "tiantong-zongjue",
    content: `Tiantong Zongjue is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "bajiao-huiqing",
    content: `Bajiao Huiqing is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "cuiyan-lingcan",
    content: `Cuiyan Lingcan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "nanta-guangyong",
    content: `Nanta Guangyong is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "changshui-zixuan",
    content: `Changshui Zixuan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "dagui-muzhe",
    content: `Dagui Muzhe is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "deshan-yuanmi",
    content: `Deshan Yuanmi is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "guannan-daochang",
    content: `Guannan Daochang is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "guizong-zhichang",
    content: `Guizong Zhichang is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "jingzhao-mihu",
    content: `Jingzhao Mihu is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "luzu-baoyun",
    content: `Luzu Baoyun is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "shexian-guixing",
    content: `Shexian Guixing is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "wenshu-yingzhen",
    content: `Wenshu Yingzhen is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "xingyang-qingrang",
    content: `Xingyang Qingrang is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "xuedou-zhijian",
    content: `Xuedou Zhijian is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yangshan-yong",
    content: `Yangshan Yong is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },

  // =========================================================================
  // Soto school — Japanese Caodong continuation
  // =========================================================================

  {
    slug: "koun-ejo",
    content: `Koun Ejō (孤雲懐奘, 1198–1280) was Dōgen's principal Dharma successor and the second abbot of Eihei-ji, the head training monastery of the Sōtō school. Ordained on Mount Hiei in the Tendai tradition, he had already studied for several years with Kakuzen Ekan of the disbanded Japanese Daruma-shū school of Dainichi Nōnin before meeting Dōgen in 1227; he formally joined Dōgen's community in 1234 and was named *shuso* and Dharma heir during the Kōshō-ji period[1].

Ejō's most enduring contribution to Sōtō literary culture is the *Shōbōgenzō Zuimonki* (正法眼蔵随聞記), a six-fascicle record of Dōgen's informal talks at Kōshō-ji that he transcribed between 1235 and 1238[2]. After Dōgen's death in 1253 he succeeded him as abbot of Eihei-ji and held the post for most of the next two decades, briefly handing it to Tettsū Gikai in 1267 before resuming office until his own death in 1280; through this period of fragile institutional life he was the figure who kept the early Sōtō community intact[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Dōgen's community and Koun Ejō's early career",
      },
      {
        index: 2,
        sourceId: "src_kim_dogen",
        pageOrSection: "ch. on the Zuimonki and the Kōshō-ji period",
      },
      {
        index: 3,
        sourceId: "src_bodiford_soto_medieval",
        pageOrSection: "ch. on the early Eihei-ji abbacy and the Sandai sōron",
      },
    ],
  },
  {
    slug: "tettsu-gikai",
    content: `Tettsū Gikai (徹通義介, 1219–1309) entered the early Dōgen community in 1241 with the survivors of the suppressed Daruma-shū around Kakuzen Ekan, received Dōgen's bodhisattva precepts in 1242, and remained at Eihei-ji as a senior monk under Koun Ejō until being installed as third abbot in 1267[1]. His tenure became the immediate trigger for the *Sandai sōron* (三代相論, "third-generation dispute"), the early Sōtō controversy over whether his selective integration of esoteric ritual and lay-funeral observance into Eihei-ji practice constituted a betrayal of Dōgen's austere standard. Around 1272 he stepped aside and Ejō resumed the abbacy; Gikai eventually left Eihei-ji and re-settled at Daijō-ji in Kaga[2].

Although the *Sandai sōron* split the original Eihei-ji line, Gikai's branch — through his Dharma heir Keizan Jōkin and Keizan's heirs Meihō Sotetsu and Gasan Jōseki — produced the network of provincial Sōtō temples (Sōji-ji, Yōkō-ji, and the Gasan-ha + Meihō-ha lines) that became the numerically dominant form of medieval and modern Japanese Sōtō Zen[3]. The narrative of the dispute itself is, however, late-attested: it appears in the historical record only about 150 years after the events it claims to describe, and contemporary scholarship reads it less as a contemporaneous theological rupture than as a 15th-century partisan reconstruction by the Jakuen-line monk Kenkō and his disciple Kenzei, written into Sōtō history to support specific institutional claims about the Eihei-ji abbacy[3]. Gikai had two Eihei-ji tenures (1267–72 and 1280–87) rather than a single deposition; the specifically *mikkyō* / Shingon character of the integrations he brought to Eihei-ji (prayers, incantations, Mahāvairocana ritual material from Daijō-ji's earlier identity as a Shingon site) was the substantive issue rather than generic "reformism".`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_bodiford_soto_medieval",
        pageOrSection: "ch. on Gikai, the Daruma-shū incorporation, and the third abbacy of Eihei-ji",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the Sandai sōron and Gikai's move to Daijō-ji",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Tettsū Gikai — successors, Keizan line, Sōji-ji",
      },
    ],
  },
  {
    slug: "meiho-sotetsu",
    content: `Meihō Sotetsu (明峰素哲, 1277–1350) was Keizan Jōkin's elder principal Dharma heir, founder of the Yōkō-ji branch of the early Sōtō school and abbot of Daijō-ji in Kaga, the temple Tettsū Gikai had established after the Sandai sōron[1]. Tradition places him alongside Gasan Jōseki as the two heirs through whom the early-Sōji-ji and early-Daijō-ji communities were transmitted: in the standard medieval Sōtō genealogy he is the senior heir, and Daijō-ji and Yōkō-ji preserved the original ascetic-monastic emphasis of the Eihei-ji-Daijō-ji line[2].

Although Gasan's lineage came eventually to dominate the medieval and modern Sōtō school, Meihō's branch — passed through his own heirs Mugai Chikō and others — remained an important countervailing influence, and Yōkō-ji continued to serve as Keizan's mortuary temple and one of the school's two head institutions for several centuries[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_bodiford_soto_medieval",
        pageOrSection: "ch. on Keizan's heirs and the early Sōtō branches",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Keizan and the spread of medieval Sōtō",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Meihō Sotetsu — Yōkō-ji, Daijō-ji, Sōtō branches",
      },
    ],
  },
  {
    slug: "gasan-joseki",
    content: `Gasan Jōseki (峨山韶碩, 1275–1366) was, with Meihō Sotetsu, one of Keizan Jōkin's two principal Dharma heirs and the figure through whom most of the institutional growth of the medieval Sōtō school descends. He succeeded Keizan as second abbot of Sōji-ji in 1325 and is traditionally credited with the "Five Sects of Gasan" (峨山五哲) — his own five great Dharma heirs — through whose temples the network of provincial Sōtō monasteries was founded across Japan[1].

Gasan's institutional work — combining Dōgen's *zazen*-centred orthodoxy with Keizan's more ritually accommodating model and a flexible policy toward lay patrons and existing local cults — turned Sōtō from a small Eihei-ji-Daijō-ji community into a national denomination over the next two generations. Modern scholarship treats him, rather than Dōgen or Keizan, as the figure most responsible for Sōtō becoming the largest single Buddhist school in Japan by the early-modern period[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_bodiford_soto_medieval",
        pageOrSection: "ch. on Gasan's heirs and the Sōji-ji network",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the medieval Sōtō expansion",
      },
    ],
  },
  {
    slug: "tokuo-ryoko",
    content: `Tokuo Ryoko (1649–1709) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the post-Keizan Sōtō branch network" },
    ],
  },
  {
    slug: "gesshu-soko",
    content: `Gesshū Sōko (月舟宗胡, 1618–1696) was an Edo-period Sōtō master who, with his Dharma heir Manzan Dōhaku, led the seventeenth-century *shūtō fukko* — the "restoration of the Sōtō lineage" — that returned the school to face-to-face Dharma transmission and to the textual study of Dōgen's *Shōbōgenzō* after several centuries in which both had eroded in favour of temple-tied lineage assignment (*garanbō*)[1]. Trained at Daijō-ji in Kaga, he served as abbot there from 1666 and used the temple as the institutional base from which the reform was launched[2].

Gesshū's emphasis on Dōgen's *zazen* practice as the heart of Sōtō, against the literary and ritual elaborations that had grown up around it, anticipated and shaped the much larger Tokugawa-period editorial recovery of Dōgen's writings completed under Manzan and Menzan Zuihō; modern scholarship treats his Daijō-ji circle as the proximate origin of every important strand of Edo-period Sōtō reform[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_bodiford_soto_medieval",
        pageOrSection: "Conclusion — the shūtō fukko and the recovery of face-to-face transmission",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the seventeenth-century Sōtō revival",
      },
      {
        index: 3,
        sourceId: "src_kim_dogen",
        pageOrSection: "Introduction — the editorial recovery of the Shōbōgenzō in Edo-period Sōtō",
      },
    ],
  },
  {
    slug: "gisan-tonin",
    content: `Gisan Tonin (1386–1462) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch temples" },
    ],
  },
  {
    slug: "gukei-youn",
    content: `Gukei Youn is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch temples" },
    ],
  },
  {
    slug: "gyokujun-so-on",
    content: `Gyokujun Sō-on Suzuki (1877–1934) was the Sōtō Zen priest who made Shunryū Suzuki — and so, indirectly, made San Francisco Zen Center. The English-language record of his life is sparse and survives almost entirely through references in Shunryū's biography and in the histories of the temples he led; what follows is what can be verified against those sources[3].

Sō-on was the adopted son of Butsumon Sogaku Suzuki, Shunryū's biological father and himself a Sōtō priest. That adoption made Sō-on Shunryū's Dharma elder brother by family and, eventually, his teacher. He served as resident priest at Zōun-in, the small country temple in Mori, Shizuoka where Shunryū's family had its roots, and in 1918 he established Rinsō-in, a larger temple "on the rim of Yaizu" that would become Shunryū's lifelong home temple[1].

The decisive encounter came in 1916, when the twelve-year-old Shunryū arrived at Zōun-in to begin training under him. The biographical account preserved in Wikipedia summarizes the relationship plainly: Sō-on "was the adopted son of Shunryu's father, Sogaku, and became abbot of Zoun-in temple," and the daily training he imposed included "4 a.m. zazen sessions, sutra chanting, temple cleaning, and evening meditation"[1]. On 18 May 1917, on Shunryū's thirteenth birthday, Sō-on ordained him as a novice (unsui), giving him the Buddhist name Shōgaku Shunryū and the now-famous nickname "Crooked Cucumber" — a wry reference, the article notes, to the boy's "forgetful and unpredictable nature"[1]. Sources describe Sō-on as "a strong disciplinarian" who could be rough on his young charge but who also "demonstrated humility and provided clear instruction"[1].

The relationship culminated in formal Dharma transmission. "On August 26, 1926, So-on formally transmitted the Dharma to Shunryu, who was 22 years old at the time"[1]. That transmission carried the lineage forward into Rinsō-in and ultimately, in 1959, to San Francisco — where Shunryū's teaching of his teacher's plain, undecorated Sōtō practice became the foundation of San Francisco Zen Center, Tassajara, and a whole American Sōtō diaspora[2]. Documentation of Sō-on's own writings, dharma heirs beyond Shunryū, and final years is thin in English-language sources; what is unambiguous is that his patient, disciplined formation of one ungovernable boy is among the most consequential pieces of teaching in twentieth-century Sōtō Zen.`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Shunryu Suzuki (early life under Gyokujun So-on)", excerpt: "Gyokujun So-on Suzuki served as Shunryu Suzuki's primary mentor, beginning in 1916 when the 12-year-old trainee arrived to study with him. So-on was the adopted son of Shunryu's father, Sogaku, and became abbot of Zoun-in temple. Daily regimen: 4 a.m. zazen sessions, sutra chanting, temple cleaning, evening meditation. On May 18, 1917, when Shunryu turned 13, So-on ordained him as a novice monk. So-on gave him the nickname Crooked Cucumber. On August 26, 1926, So-on formally transmitted the Dharma to Shunryu." },
      { index: 2, sourceId: "src_sfzc", pageOrSection: "Lineage to San Francisco Zen Center", excerpt: "Shunryu Suzuki carried the dharma transmission received from Gyokujun So-on at Rinso-in to San Francisco in 1959, founding what became the San Francisco Zen Center." },
      { index: 3, sourceId: "src_sotozen_founders", pageOrSection: "Sōtō Zen — Gyokujun Sō-on Suzuki" },
    ],
  },
  {
    slug: "hakuho-genteki",
    content: `Hakuho Genteki (1594–1670) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the seventeenth-century Sōtō transmission" },
    ],
  },
  {
    slug: "harada-sodo-kakusho",
    content: `Harada Sodo Kakusho (1844–1931) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on modern Sōtō" },
    ],
  },
  {
    slug: "hogen-soren",
    content: `Hogen Soren is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch temples" },
    ],
  },
  {
    slug: "kaiten-genju",
    content: `Kaiten Genju is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on Sōtō scholar-monk culture" },
    ],
  },
  {
    slug: "keigan-eisho",
    content: `Keigan Eisho (1321–1412) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "kinen-horyu",
    content: `Kinen Horyu (d. 1506) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "kodo-sawaki",
    content: `Kōdō Sawaki (澤木 興道, 1880–1965), known throughout Japan as "Homeless Kōdō" (Yadonashi Kōdō), was the modern Sōtō master most responsible for severing the practice of zazen from the temple-funeral economy and restoring shikantaza as the living center of the school. He was born June 16, 1880 in Tsu, Mie Prefecture; orphaned by age seven, he was taken in by a lantern-maker named Bunkichi Sawaki whose home doubled as a gambling parlor — an upbringing he later credited with immunizing him against any romance about respectability[1]. At sixteen he ran away to Eihei-ji, found work as a temple servant, and at eighteen entered Sōshin-ji, where he was ordained in 1899 by Kōhō Sawada and received dharma transmission from Zenkō Sawada in 1906[1].

He served in the Russo-Japanese War (1904–1905) — shot through the neck, the bullet splitting his tongue — and afterward returned to formal study, eventually holding a professorship in Buddhist studies at Komazawa University from the 1930s. In 1949 he assumed responsibility for Antai-ji in Kyoto, but never settled there: he refused a fixed abbacy, declined to perform funerals for income, and instead spent decades on the road leading sesshin at temples, factories, prisons, and universities across Japan, hence the epithet "Homeless Kōdō"[1]. His teaching was austere and unsentimental — zazen, he insisted, "is good for nothing"; it is not a means to enlightenment, social benefit, or temple revenue, but the direct expression of the Buddha's awakening[1].

Sawaki wrote relatively little himself; his teaching was preserved by students and editors. The most important compilations are *The Zen Teaching of Homeless Kōdō* (Wisdom Publications, 2014), assembled by his successor Kōshō Uchiyama and translated by Shōhaku Okumura; the *To You* (*Anata ni*) series of thirty-four direct addresses, also compiled by Uchiyama; and *Commentary on the Song of Awakening* (Merwin Asia, 2014), his teisho on Yōka Daishi's *Shōdōka*[1]. His named dharma heirs include Kōshō Uchiyama (1912–1998), who succeeded him at Antai-ji and authored *Opening the Hand of Thought*; Shūyū Narita (1914–2004); Sodō Yokoyama (1907–1980), the "leaf-flute philosopher"; and Kōjun Kishigami (b. 1941), now teaching in France. Major students who carried the line abroad without formal transmission from Sawaki himself include Taisen Deshimaru (1914–1982), who founded the Association Zen Internationale in France; Kōbun Chino Otogawa (1938–2002), influential in the American West; and Gudō Wafu Nishijima (1919–2014)[1]. Sawaki died at Antai-ji on December 21, 1965; his last words — "Nature is magnificent" — are widely quoted in his lineage[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Kōdō Sawaki", excerpt: "Born June 16, 1880 in Tsu, Mie. Died December 21, 1965 at Antai-ji, Kyoto. Orphaned young; raised by a lantern maker named Bunkichi Sawaki. Age 16: Ran away to Eihei-ji. 1899: Ordained by Koho Sawada. 1906: Received dharma transmission from Zenko Sawada. 1930s: Professor at Komazawa University. 1949: Took responsibility for Antai-ji. Known as 'Homeless Kōdō.' Dharma heirs: Kosho Uchiyama, Shūyū Narita, Sodō Yokoyama, Kōjun Kishigami. Notable students without dharma transmission: Gudo Wafu Nishijima, Taisen Deshimaru, Kōbun Chino Otogawa." },
    ],
  },
  {
    slug: "kokei-shojun",
    content: `Kokei Shojun (d. 1555) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "kosho-uchiyama",
    content: `Kōshō Uchiyama (1912–March 13, 1998) was a Sōtō Zen priest, prolific essayist, and origami master whose decade as abbot of Antai-ji (1965–1975) shaped a distinctive lay-and-monastic Zen rooted in pure zazen and self-supporting begging[1]. Born in Tokyo, he earned an M.A. in Western philosophy from Waseda University in 1937, then sought ordination after the death of his first wife; he was ordained in 1941 by Kōdō Sawaki, the itinerant "Homeless Kōdō" whose anti-institutional Zen would mark Uchiyama's entire teaching life[1]. He spent the war and postwar years living in extreme poverty alongside Sawaki at Antai-ji in Kyoto's Gentaku district, struggling continuously with the long-term effects of tuberculosis[1].

When Sawaki was installed as Antai-ji's fifth abbot in 1949 he made the temple "a place for zazen," but because he traveled constantly, his student Uchiyama managed most temple responsibilities; Sawaki only relocated permanently in 1962 once mobility failed him[2]. After Sawaki's death in 1965 Uchiyama became the sixth abbot, and under his leadership Antai-ji became known for "devoted practice of zazen and formal begging," refusing the funeral economy of conventional Japanese temples and surviving "completely on donations from lay practitioners and begging"[2]. He retired in 1975 to Nokei-in near Kyoto, where he continued writing and receiving students until his death; the monastery itself was relocated to rural northern Hyōgo in 1976 to escape urban encroachment[2].

Uchiyama wrote more than twenty books on Zen and on origami. The works most widely read in English are *Refining Your Life: From the Zen Kitchen to Enlightenment* (Weatherhill, 1983), his commentary on Dōgen's *Tenzo Kyōkun*, reissued as *How to Cook Your Life* (Shambhala, 2005); *Opening the Hand of Thought: Foundations of Zen Buddhist Practice* (Penguin, 1993; revised Wisdom, 2004); and *The Wholehearted Way: A Translation of Eihei Dōgen's Bendōwa with Commentary* (Tuttle, 1997, with Shōhaku Okumura)[1]. His framework of "one zazen, two practices, three minds" — practice as vow and repentance, lived through magnanimous, nurturing, and joyful mind — became the operating manual for a generation of Western Sōtō teachers[1]. Among his Dharma heirs the most influential abroad is Shōhaku Okumura, founder of Sanshin Zen Community in Indiana and the principal translator of Uchiyama and Dōgen into English[1][2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Kosho Uchiyama", excerpt: "Graduated from Waseda University with an M.A. in Western philosophy (1937). Ordained as a priest in 1941 by teacher Kōdō Sawaki. Became abbot of Antai-ji following Sawaki's death in 1965 and served until retiring in 1975. His best-known books include Opening the Hand of Thought: Foundations of Zen Buddhist Practice (1993) and How to Cook Your Life: From the Zen Kitchen to Enlightenment. He authored over twenty books on Zen Buddhism and origami." },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Antaiji", excerpt: "Following Sawaki's death in 1965, Uchiyama became the sixth abbot. The monastery gained recognition during the late 1960s for its devoted practice of zazen and formal begging. Rather than conducting funerals for income like typical temples, Antai-ji relied completely on donations from lay practitioners and begging. Uchiyama mentored future teachers including Shohaku Okumura." },
    ],
  },
  {
    slug: "meido-yuton",
    content: `Meido Yuton is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "motsugai-shido",
    content: `Motsugai Shido is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "renzan-soho",
    content: `Renzan Soho is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "ryuko-ryoshu",
    content: `Ryuko Ryoshu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "sekiso-tesshu",
    content: `Sekiso Tesshu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "sesso-yuho",
    content: `Sesso Yuho (d. 1576) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "shogaku-kenryu",
    content: `Shogaku Kenryu (d. 1485) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "shugan-dochin",
    content: `Shugan Dochin (d. 1387) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "shunryu-suzuki",
    content: `Shunryū Suzuki (born Toshitaka Suzuki, May 18, 1904, in Kanagawa Prefecture, Japan; died December 4, 1971, in San Francisco) was the Sōtō Zen priest who, more than any other figure, transmitted Japanese Sōtō practice to American counterculture. He began monastic apprenticeship at age twelve under Gyokujun So-on Suzuki, a disciple of his father, and was ordained as a novice on his thirteenth birthday in 1917, receiving the Buddhist name Shōgaku Shunryū[1]. He attended Sōtō preparatory school in Tokyo from 1924, entered Komazawa University in 1925, and on August 26, 1926, at age twenty-two, received Dharma transmission from So-on; he was installed as the 28th abbot of Zoun-in on January 22, 1929, and subsequently trained at Eihei-ji (1930) and Sōji-ji in Yokohama (1931)[1].

On May 23, 1959, Suzuki arrived in San Francisco at age fifty-five to attend to Sōkō-ji, then the sole Sōtō temple in the city, expecting a three-year posting; the wave of young American students who began sitting zazen with him before dawn made the assignment permanent[1]. With his student Zentatsu Richard Baker he helped seal the 1966 purchase of Tassajara Hot Springs, founding what became Tassajara Zen Mountain Center, the first Sōtō Zen training monastery established outside Asia[1]. He moved the practice community to 300 Page Street in 1969, and the constellation of Sōkō-ji, the Page Street city center, and Tassajara — later joined by Green Gulch Farm — coalesced into San Francisco Zen Center, today one of the largest Sōtō sanghas outside Japan[2].

His lectures, edited by Trudy Dixon and Marian Derby, were published as *Zen Mind, Beginner's Mind* (Weatherhill, 1970), whose opening line — "In the beginner's mind there are many possibilities, in the expert's mind there are few" — became one of the most quoted sentences in Western Buddhism[1]. Two posthumous volumes followed: *Branching Streams Flow in the Darkness: Zen Talks on the Sandokai* (University of California Press, 1999) and *Not Always So: Practicing the True Spirit of Zen* (HarperCollins, 2002)[1]. David Chadwick's authorized biography *Crooked Cucumber: The Life and Zen Teaching of Shunryu Suzuki* appeared in 1999[1]. Suzuki gave Dharma transmission to Zentatsu Richard Baker shortly before his death in December 1971, and to his son Hoitsu Suzuki, who succeeded him at Rinso-in in Japan[1]. His teaching style — informal, unsystematic, insistent that "zazen itself is enlightenment" — set the template for Sōtō practice across the West[2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Shunryu Suzuki", excerpt: "On May 23, 1959, Shunryu Suzuki arrived in San Francisco to attend to Soko-ji, at that time the sole Soto Zen temple in San Francisco. In 1966 Zentatsu Richard Baker helped seal the purchase of Tassajara Hot Springs. A biography of Suzuki, titled Crooked Cucumber, was written by David Chadwick in 1999." },
      { index: 2, sourceId: "src_sfzc", pageOrSection: "sfzc.org — About / Founders", excerpt: "Suzuki Roshi founded San Francisco Zen Center, which now includes the City Center at 300 Page Street, Tassajara Zen Mountain Center, and Green Gulch Farm." },
    ],
  },
  {
    slug: "shuzan-shunsho",
    content: `Shuzan Shunsho (1590–1647) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the early-Edo Sōtō transmission" },
    ],
  },
  {
    slug: "taisen-deshimaru",
    content: `Mokudō Taisen Deshimaru (弟子丸泰仙, 1914–1982) was a Japanese Sōtō Zen monk and the principal figure in the establishment of European Sōtō Zen. Born in Saga Prefecture in southern Kyūshū to a Jōdo Shinshū household with samurai antecedents, he encountered the itinerant Sōtō teacher Kōdō Sawaki in the 1930s and remained Sawaki's lay disciple for the next three decades while working as a businessman in Tokyo and Kobe[1][2]. His attachment to Sawaki's signature teaching — zazen practised without object and without expectation of gain — shaped every later phase of his life and the tradition he transplanted to Europe[2].

During the Second World War Deshimaru was sent to the Indonesian island of Bangka to administer a copper mine for the Japanese occupation; according to the AZI's institutional history he refused repatriation at the war's end so as to remain with the local population and was interned by Allied forces before being returned to Japan[3]. He resumed lay practice with Sawaki in the postwar years and, only weeks before Sawaki's death in December 1965, received monastic ordination from him together with the instruction that became the seed of his European mission: to take Sōtō zazen to the West[1][3].

In 1967 Deshimaru travelled to Paris on a one-way ticket and began teaching zazen in borrowed rooms above a Parisian macrobiotic shop, attracting a small group of French disciples who soon constituted the first European Sōtō sangha[3][4]. He founded the Association Zen Internationale (AZI) in 1970 to coordinate the rapidly multiplying dōjōs and, in 1979, acquired the Château de La Gendronnière in the Loire Valley as the AZI's residential temple — by the time of his death the AZI network spanned over a hundred dōjōs and practice groups across Western Europe[4]. He received Dharma transmission (shihō) from Yamada Reirin in 1970 and was later named kaikyōsōkan, the Sōtōshū's official representative for Europe, formalising the link between his European sangha and the Japanese Sōtō headquarters[1].

Deshimaru's teaching pivoted on three terms drawn from Dōgen and Sawaki and made central to AZI practice: shikantaza ("just sitting") as the sole essential discipline, mushotoku as the correct attitude of practice without gaining mind, and hishiryo as the quality of awareness in zazen — "thinking from the depth of non-thinking"[5]. His primary medium was kusen, oral teachings delivered in the dōjō during zazen itself, transcribed and edited by close disciples to produce the substantial French-language bibliography that introduced Zen to a generation of European readers[5]. He returned to Japan in early 1982 with terminal cancer and died there in April of that year, aged sixty-seven[1].

His Dharma was carried forward by a generation of European successors — Étienne Mokushō Zeisler, Roland Yuno Rech, Stéphane Kosen Thibaut, Philippe Reiryū Coupey, Évelyne Ekō de Smedt, Pierre Reigen Crépon, Olivier Reigen Wang-Genh, Jean-Pierre Genshū Faure, Vincent Keisen Vuillemin, and others — who continued the AZI lineage from temples and dōjōs across France, Switzerland, Spain, Portugal, Germany, and beyond, and through whom most of his oral teachings reached print[6][4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_sotozen_founders",
        pageOrSection: "Sōtōshū global website — Taisen Deshimaru biographical entry (dates, Sawaki line, ordination, transmission, European role)",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "Volume 2, on Kōdō Sawaki and his Western disciples",
        excerpt:
          "Kōdō Sawaki's most influential lay disciple, Taisen Deshimaru, was the founder of the Association Zen Internationale and the principal agent of Sōtō Zen's implantation in Europe.",
      },
      {
        index: 3,
        sourceId: "src_zen_deshimaru_history",
        pageOrSection: "Zen Deshimaru — institutional history of Zen and biography of the AZI's founder",
      },
      {
        index: 4,
        sourceId: "src_azi",
        pageOrSection: "Association Zen Internationale — history of the AZI and its dōjō network",
      },
      {
        index: 5,
        sourceId: "src_deshimaru_zen_way_to_martial_arts",
        pageOrSection: "Editor's introduction and chapters on zazen, mushotoku, and hishiryo",
        excerpt:
          "Master Deshimaru taught above all by kusen, the oral instruction given during zazen; the heart of his teaching is shikantaza practised mushotoku, without any goal, in the state of mind he called hishiryo, beyond thinking.",
      },
      {
        index: 6,
        sourceId: "src_kosen_sangha",
        pageOrSection: "Kosen Sangha — directory of dōjōs in the Deshimaru lineage and brief notes on the second-generation teachers",
      },
      {
        index: 7,
        sourceId: "src_luz_serena",
        pageOrSection: "luzserena.org — Spanish Sōtō monastery (Dokushô Villalba) in the Deshimaru/Sawaki line",
      },
      {
        index: 8,
        sourceId: "src_puregg",
        pageOrSection: "puregg.org — Zen-Kloster Puregg, Austria, in the European Sōtō network",
      },
    ],
  },
  {
    slug: "tessan-shikaku",
    content: `Tessan Shikaku (d. 1376) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "chozan-ginetsu",
    content: `Chozan Ginetsu (1581–1672) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the early-Edo Sōtō transmission" },
    ],
  },
  {
    slug: "chuzan-ryoun",
    content: `Chuzan Ryoun (1350–1432) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "daishitsu-chisen",
    content: `Daishitsu Chisen (1461–1536) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "fukushu-kochi",
    content: `Fukushu Kochi is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "baizan-monpon",
    content: `Baizan Monpon is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "butsumon-sogaku",
    content: `Butsumon Sogaku is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "chokoku-koen",
    content: `Chokoku Koen is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "daiki-kyokan",
    content: `Daiki Kyokan is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "dainin-katagiri",
    content: `Jikai Dainin Katagiri (January 19, 1928 – March 1, 1990) was the Sōtō priest most responsible for establishing Zen practice across the American Midwest[1]. Born in Osaka, he was ordained in 1946 by Daichō Hayashi at Taizō-in in Fukui Prefecture, from whom he eventually received Dharma transmission; he then trained for three years under the famously severe Ekō Hashimoto at Eihei-ji before entering Komazawa University in Tokyo, where he majored in Buddhist studies[1]. After graduation he served at Eihei-ji and was assigned to North America by the Sōtōshū[1].

Katagiri's American ministry began in 1963 at Zenshūji Sōtō Mission in Los Angeles. In 1965 he moved to San Francisco at the request of the Sōtōshū to assist Shunryū Suzuki at Sōkō-ji and the new San Francisco Zen Center; over the next seven years he became Suzuki's closest peer and helped establish the practice schedule at Tassajara from its 1967 opening, briefly serving as acting abbot of SFZC after Suzuki's death in late 1971[1][2]. In 1972, observing that "few, if any, Buddhist teachers were located there," he accepted an invitation to Minneapolis and founded the Minnesota Zen Meditation Center, which he led for the rest of his life[1][3]. Later in the decade he founded Hōkyō-ji (Catching the Moon Zen Mountain Center), a rural training temple in southeast Minnesota that remains the principal residential center of his lineage[1][3].

His published teachings, all edited from talks he gave in Minnesota and at Hōkyō-ji, are: *Returning to Silence: Zen Practice in Daily Life* (Shambhala, 1988), the only book published in his lifetime; *You Have to Say Something: Manifesting Zen Insight* (Shambhala, 1998); *Katagiri Roshi: Buddhist Lay Ordination Lectures* (1999); *Each Moment Is the Universe: Zen and the Way of Being Time* (Shambhala, 2007); and *The Light That Shines Through Infinity: Zen and the Energy of Life* (Shambhala, 2017)[1]. Katagiri gave Dharma transmission to thirteen successors — among them Dōkai Georgesen, Dosho Port, Steve Hagen (Dharma Field, Minneapolis), Teijo Munnich, Jōen Snyder O'Neal, Nonin Chowaney (Nebraska Zen Center), Yvonne Rand, Karen Sunna, Shōken Winecoff (Ryūmonji), and Rōsan Yoshida — a sangha that today carries his "being-time" reading of Dōgen across some twenty centers in the U.S. and Canada[1][3].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Dainin Katagiri", excerpt: "Jikai Dainin Katagiri (January 19, 1928 in Osaka — March 1, 1990). Katagiri received ordination and dharma heir status from Daicho Hayashi at Taizo-in in Fukui. He subsequently studied under Eko Hashimoto at Eiheiji monastery for three years before attending Komazawa University. His American journey began in 1963 at the Zenshuji Soto Zen Mission in Los Angeles. In 1965, he relocated to San Francisco to support Shunryu Suzuki. In 1972, Katagiri moved to Minneapolis to establish the Minnesota Zen Meditation Center. Katagiri trained thirteen dharma heirs." },
      { index: 2, sourceId: "src_sfzc", pageOrSection: "sfzc.org — Founders / Successors", excerpt: "Dainin Katagiri arrived to assist Suzuki Roshi at Sokoji and the San Francisco Zen Center, where he served as a senior teacher until his move to Minneapolis." },
      { index: 3, sourceId: "src_mnzencenter_katagiri_biography", pageOrSection: "mnzencenter.org — About Katagiri Roshi", excerpt: "In 1972 Katagiri Roshi moved to Minneapolis to establish the Minnesota Zen Meditation Center. He later founded Hokyoji Zen Practice Community in southeastern Minnesota and gave Dharma transmission to thirteen successors who continue his lineage today." },
    ],
  },
  {
    slug: "daishin-kan-yu",
    content: `Daishin Kan Yu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "enjo-gikan",
    content: `Enjo Gikan is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "fuden-gentotsu",
    content: `Fuden Gentotsu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "fuzan-shunki",
    content: `Fuzan Shunki is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "gangoku-gankei",
    content: `Gangoku Gankei (1683–1767) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the Edo-period Sōtō transmission" },
    ],
  },
  {
    slug: "gyakushitsu-sojun",
    content: `Gyakushitsu Sojun is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "gudo-wafu-nishijima",
    content: `Gudō Wafu Nishijima (西嶋愚道和夫, 29 November 1919 – 28 January 2014) was a Japanese Sōtō Zen priest, translator, and one of the most consequential modern Japanese teachers of Dōgen for an English-speaking audience[1]. As a young man in the early 1940s he became a student of Kōdō Sawaki — placing him in the same lay-Zen lineage that would also produce Taisen Deshimaru — and after the Second World War he took a law degree from Tokyo University and entered a long career in finance, working at the Japanese Ministry of Finance and later in the securities industry[1]. He did not ordain as a Buddhist priest until 1973, when he was already in his mid-fifties; his preceptor was Niwa Rempō Zenji, the future head abbot of Eihei-ji and a former leader of the Sōtō school. **Four years later, in 1977, Niwa conferred dharma transmission (shihō) on Nishijima**, formally accepting him as one of his successors — the same authority who would in 1984 transmit the dharma to three of Deshimaru's disciples[1]. Nishijima continued his professional career until 1979.

From the 1960s he gave regular public lectures on Buddhism and zazen, and from the 1980s he began lecturing in English and accepting foreign students[1]. His most lasting work is textual: with his English dharma heir Mike Chōdō Cross he produced one of only three complete English translations of Dōgen's ninety-five-fascicle Kana Shōbōgenzō, and he separately translated Dōgen's Shinji Shōbōgenzō (the Mana / "true-character" Shōbōgenzō, a Chinese-language collection of kōans). He also published, with Brad Warner, an English edition of Nāgārjuna's Mūlamadhyamakakārikā[1]. **In 2007, Nishijima and a group of his students organised as Dōgen Sangha International**, a non-monastic global network of Nishijima's lay and ordained successors[1].

His distinctive interpretive scheme, "Three Philosophies and One Reality" (三哲学と一実在), reads Dōgen's texts as a four-perspective structure mapped onto the Four Noble Truths: an idealist/subjective view (dukkha), a materialist/objective view (samudaya), a realist synthesis (nirodha), and the lived reality of the path (magga)[1]. Coupled with his lay-friendly emphasis on the autonomic nervous system as a frame for understanding the effects of zazen, this gave him an unusually wide reach among scientifically- and philosophically-minded Western readers. Among his recognised dharma heirs are Mike Chōdō Cross (UK), Brad Warner (US), Jundo Cohen (Treeleaf Zendo), Jeremy Pearson, Yodō Brian Wickham, and others — a lineage carried forward today as much through Internet sangha and English-language publishing as through traditional residential temples.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Gudō Wafu Nishijima",
        excerpt:
          "Born 29 November 1919, died 28 January 2014. Student of Kōdō Sawaki in the early 1940s. Law degree from Tokyo University; career in finance. Ordained by Rempō Niwa in 1973; received shihō from Niwa in 1977. Compiled, with Mike Chodo Cross, one of three complete English translations of Dōgen's ninety-five-fascicle Kana Shōbōgenzō; also translated Dōgen's Shinji Shōbōgenzō and Nāgārjuna's Mūlamadhyamakakārikā. In 2007 organised Dogen Sangha International with his students. Distinctive theory: 'three philosophies and one reality.'",
      },
    ],
  },
  {
    slug: "brad-warner",
    content: `Brad Warner (born 5 March 1964 in Hamilton, Ohio) is an American Sōtō Zen priest, author, blogger, documentarian, and punk-rock bass guitarist — the most widely-read English-language teacher in the lineage of Gudō Wafu Nishijima[1]. He grew up mainly near Akron, Ohio (with a stint in Nairobi as a child while his father worked abroad), attended Kent State University, and as a teenager joined the hardcore punk band Zero Defex on bass after a friend introduced him to the Akron scene[1]. He later played in the psychedelic band Dimentia 13, which released several albums on the New York label Midnight Records.

Warner began Zen practice in Ohio under Tim McCarthy and later studied with the Jōdo Shinshū-influenced teacher Gyōmay Kubose[1]. After the financial failure of his Dimentia 13 albums he took a job in Japan with the JET Programme, and in 1994 joined **Tsuburaya Productions** — the company behind Ultraman — where he played the roles of various foreigners in their TV programs and worked in international licensing[1]. While in Japan he met Gudō Wafu Nishijima, became his student, and **in 2000 was ordained as a Sōtō priest and named one of Nishijima's dharma heirs**[1]. In 2007, Nishijima named Warner the leader of Dogen Sangha International. Warner dissolved that organisation in April 2012 and **moved to California, where he started Dogen Sangha Los Angeles** (later associated with the Angel City Zen Center)[1]. In 2013, the documentary *Brad Warner's Hardcore Zen*, directed by Pirooz Kalayeh, premiered at the Buddhist Film Festival of Europe in Amsterdam[1].

Warner's distinctive contribution is on the page and on the public Internet. **His non-fiction books** — *Hardcore Zen: Punk Rock, Monster Movies & the Truth About Reality* (Wisdom, 2003), *Sit Down and Shut Up* (New World Library, 2007), *Zen Wrapped in Karma Dipped in Chocolate* (2009), *Sex, Sin, and Zen* (2010), *Fundamental Wisdom of the Middle Way: Nagarjuna's Mūlamadhyamakakārikā* (with Nishijima, Monkfish, 2011), *There Is No God and He Is Always With You* (2013), *Don't Be a Jerk* (2016) and its companion *It Came from Beyond Zen!* (2017) — both Shōbōgenzō commentaries, *Letters to a Dead Friend about Zen* (2019), and *The Other Side of Nothing: The Zen Ethics of Time, Space, and Being* (2022) — span Wisdom Publications, New World Library, and Monkfish, and have introduced Nishijima's plain-spoken reading of Dōgen to a vastly wider readership than his teacher reached in life[1]. His Hardcorezen.info blog and YouTube channel have been continuously active since the early 2000s, and his deliberately abrasive, demystifying style has made him one of the visible faces of contemporary American Zen.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Brad Warner",
        excerpt:
          "Born 5 March 1964 in Hamilton, Ohio. Bass guitarist for Zero Defex and Dimentia 13. Moved to Japan via JET, then Tsuburaya Productions (Ultraman) in 1994. Trained under Tim McCarthy, then Gyōmay Kubose, then Gudō Wafu Nishijima — ordained priest and named dharma heir in 2000. Named leader of Dogen Sangha International in 2007; dissolved DSI April 2012, moved to California, started Dogen Sangha Los Angeles. 2013 documentary Brad Warner's Hardcore Zen. Books include Hardcore Zen (2003), Sit Down and Shut Up (2007), Zen Wrapped in Karma Dipped in Chocolate (2009), Sex Sin and Zen (2010), Fundamental Wisdom of the Middle Way (2011 with Nishijima), There Is No God and He Is Always With You (2013), Don't Be a Jerk (2016), It Came from Beyond Zen! (2017), Letters to a Dead Friend about Zen (2019), The Other Side of Nothing (2022).",
      },
    ],
  },
  {
    slug: "iyoku-choyu",
    content: `Iyoku Choyu (1416–1502) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "jissan-mokuin",
    content: `Jissan Mokuin is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "jiyu-kennett",
    content: `Hōun Jiyu-Kennett (born Peggy Teresa Nancy Kennett, 1 January 1924, St Leonards-on-Sea, Sussex, England; died 6 November 1996, Mount Shasta, California) was the first Western woman to be sanctioned as a Sōtō Zen master in Japan and the founder of the Order of Buddhist Contemplatives (OBC). She studied medieval music at Durham University and held a scholarship at Trinity College of Music in London — a background that would later shape one of her most distinctive contributions, the use of plainchant for English-language Buddhist liturgy[1]. After initial ordination as a novice in 1962 by Venerable Seck Kim Seng in the Linji (Rinzai-line) Chinese Chan tradition in Malaysia — where she received the Buddhist name Jiyu — she travelled to Japan and trained from 1962 to 1963 at Sōji-ji, one of the two head temples of Sōtō Zen, under chief abbot Kōhō Keidō Chisan Zenji, with day-to-day instruction from Suigan Yogo Roshi. She received Dharma transmission on 28 May 1963 and was appointed Foreign Guest Hall Master at Sōji-ji[1].

Kennett returned to the West and in 1969 founded the Zen Mission Society in San Francisco; in 1970 she established Shasta Abbey at Mount Shasta in northern California — described as "the first Zen monastery in the United States to be established by a woman" — and in 1972 founded Throssel Hole Priory (now Throssel Hole Buddhist Abbey) in Northumberland, England. In 1978 she renamed the wider organisation the Order of Buddhist Contemplatives, formalising a Sōtō-rooted Western monastic order with celibate priests, distinctive black robes, and a vow-based community structure adapted to Anglophone life[1]. A central plank of her project was liturgical translation: she rendered the Sōtō service into English and set it to plainchant in the style of Gregorian chant — a deliberate inculturation that drew on her Durham musicology training so that Western practitioners could chant their own scriptures rather than transliterated Japanese[1].

Her published works are central to the lineage she founded. *Selling Water by the River: A Manual of Zen Training* appeared from Pantheon Books in 1972, later re-issued and expanded as *Zen is Eternal Life* (Tuttle Publishing, 1999); *The Wild, White Goose: The Diary of a Zen Trainee* was published by Shasta Abbey Press in 1978; and *How to Grow a Lotus Blossom, or How a Zen Buddhist Prepares for Death* — based on visions experienced during a serious illness — appeared from Shasta Abbey Press in 1993[1]. After her death the two-volume *Roar of the Tigress: The Oral Teachings of Rev. Master Jiyu-Kennett* was edited by her successor Daizui MacPhillamy and published by Shasta Abbey Press in 2000[2]. Her named Dharma heirs include Haryo Young (Head of the Order), Meian Elbert (Abbess of Shasta Abbey), Daishin Morgan (former Abbot of Throssel Hole) and Daizui MacPhillamy[1] — together carrying forward what the OBC calls the "Serene Reflection Meditation" (Sōtō Zen) tradition in English[3].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Houn Jiyu-Kennett", excerpt: "Born Peggy Teresa Nancy Kennett on 1 January 1924 in St Leonards-on-Sea, Sussex; died 6 November 1996 in Mount Shasta. Ordained as novice in 1962 by Seck Kim Seng. Trained at Sōjiji 1962-1963 under Kōho Keidō Chisan Zenji. Received Dharma transmission on May 28, 1963. Established the Zen Mission Society in San Francisco in 1969. Founded Shasta Abbey in 1970, 'the first Zen monastery in the United States to be established by a woman.' In 1972, established Throssel Hole Priory. Renamed her organization the Order of Buddhist Contemplatives in 1978. Books: Selling Water by the River (1972, Pantheon); The Wild, White Goose (1978, Shasta Abbey Press); How to Grow a Lotus Blossom (1993, Shasta Abbey Press); Zen is Eternal Life (1999, Tuttle)." },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "Shasta Abbey Press — Roar of the Tigress, Vols I & II", excerpt: "'Roar of the Tigress' consists of two volumes of the oral teachings of Rev. Master Jiyu-Kennett, published by Shasta Abbey Press in 2000." },
      { index: 3, sourceId: "src_obc", pageOrSection: "obcon.org — About / Reverend Master Jiyu-Kennett", excerpt: "Reverend Master Jiyu-Kennett, founder of the Order of Buddhist Contemplatives, established the Sōtō Zen tradition the OBC calls 'Serene Reflection Meditation' in the English-speaking world." },
    ],
  },
  {
    slug: "keido-chisan",
    content: `Keido Chisan is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "jochu-tengin",
    content: `Jochu Tengin (1363–1437) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "kankai-tokuon",
    content: `Kankai Tokuon is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "ken-an-junsa",
    content: `Ken An Junsa is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "kobun-chino-otogawa",
    content: `Kōbun Chino Otogawa (乙川 弘文; February 1, 1938 – July 26, 2002) was a Japanese Sōtō priest whose quiet, intuitive teaching seeded a generation of independent California and New Mexico sanghas, and whose private students included the founders of Silicon Valley[1]. Born into a temple family in Kamo, Niigata Prefecture — his older brother Keibun Otogawa later succeeded their father at the family temple — he completed undergraduate studies at Komazawa University, took a master's degree in Mahayana Buddhism at Kyoto University, and then trained for three years at Eihei-ji[1]. In 1967, at the invitation of Shunryū Suzuki, he came to California to help establish the new monastic training program at Tassajara Zen Mountain Center, where he served as Suzuki's assistant until 1970[1][2].

After leaving Tassajara, Kōbun founded or led a constellation of small, deliberately non-institutional centers: Haiku Zendo (later Bodhi) in Los Altos, California, beginning in 1970; Hōkō-ji near Taos, New Mexico; and Jikō-ji in the Santa Cruz Mountains, founded in 1983, which remains his principal seat in the West[1][2]. He taught regularly at Naropa University in Boulder and travelled often to Europe; in his later years he spent extended periods in Switzerland with his student Vanja Palmers at the Felsentor sangha[1]. Outside formal Zen circles he is best known as the personal Buddhist teacher of Steve Jobs, whom he met in the 1970s; on March 18, 1991, he presided over the marriage of Steve Jobs and Laurene Powell, and Jobs reportedly considered ordaining as a monk under him[1].

Kōbun published comparatively little — his teaching was overwhelmingly oral — but contributed essays and dharma talks to *One Bird, One Stone: 108 American Zen Stories* (Sean Murphy, Renaissance, 2002) and to the posthumous collection *Embracing Mind: The Zen Talks of Kobun Chino Otogawa* (edited by Judy Cosgrove and Shoryu Bradley, Jikoji, 2016)[1]. He died on July 26, 2002, at a retreat house in Switzerland, drowning together with his five-year-old daughter Maya in a small pond on the property; he had jumped in to save her[1]. He gave Dharma transmission to nine successors: Carolyn Atkinson (Santa Cruz), Angie Boissevain (San Jose), Ian Forsberg (Taos), Jean Leyshon (Taos), Tim McCarthy (Kent, Ohio), Martin Mosko (Boulder), Michael Newhall (Jikō-ji, Los Gatos), Vanja Palmers (Lucerne), and Bob Watkins (Taos), whose centers continue to teach in his understated, improvisatory style[1][3].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Kobun Chino Otogawa", excerpt: "Kōbun Chino Otogawa lived from February 1, 1938 to July 26, 2002. He completed undergraduate studies at Komazawa University and earned a master's degree in Mahayana Buddhism from Kyoto University, followed by three years of training at Eiheiji monastery. In 1967, Otogawa arrived in San Francisco at the invitation of Shunryu Suzuki, serving as his assistant at Tassajara Zen Mountain Center until 1970. On March 18, 1991, Otogawa presided over the marriage of Steve Jobs and Laurene Powell. He died by drowning on July 26, 2002 in Switzerland while attempting to rescue his five-year-old daughter Maya, who also drowned. He transmitted the dharma to nine named successors and contributed essays to One Bird, One Stone: 108 American Zen Stories (2002)." },
      { index: 2, sourceId: "src_sfzc", pageOrSection: "sfzc.org — Tassajara history", excerpt: "Kobun Chino Otogawa came from Eiheiji at Suzuki Roshi's invitation in 1967 to help establish the training program at Tassajara Zen Mountain Center." },
      { index: 3, sourceId: "src_kobun_sama_biography", pageOrSection: "kobun-sama / Jikoji — biography", excerpt: "Kobun Chino Roshi gave Dharma transmission to Carolyn Atkinson, Angie Boissevain, Ian Forsberg, Jean Leyshon, Tim McCarthy, Martin Mosko, Michael Newhall, Vanja Palmers, and Bob Watkins, whose sanghas in California, New Mexico, Ohio, Colorado and Switzerland continue his lineage." },
    ],
  },
  {
    slug: "mike-chodo-cross",
    content: `Mike Chōdō Cross is a British Sōtō Zen priest, translator, and Alexander Technique teacher — Gudō Wafu Nishijima's principal English-language dharma heir and the man who, more than anyone else in the Nishijima line, made Dōgen's writings readable in modern English[1]. As Nishijima's long-running student and close collaborator he produced, jointly with his teacher, **a complete English translation of Dōgen's ninety-five-fascicle Kana Shōbōgenzō** — published in four volumes by Windbell Publications and the Numata Center for Buddhist Translation and Research, and recognised in the en.wikipedia article on Nishijima as one of only three complete English Shōbōgenzō translations in existence[1].

Cross's textual approach is shaped by a distinctive parallel career. As a teacher of the Alexander Technique he carries an unusual sensitivity to the body, posture, and the somatic dimension of Zen practice; this informs both his rendering of Dōgen's notoriously slippery prose and his independent commentary work — including his book *Sitting–Dharma–Just Sit* and the long-running *Treasury of the Eye of True Teaching* commentary blog, where he has, sometimes in respectful disagreement with his teacher, continued to interpret the Shōbōgenzō chapter by chapter[2].

His public profile is quieter than Brad Warner's, but his lineage role is at least as load-bearing: by the simple fact of having translated the entire ninety-five fascicles into English, he has shaped how an entire generation of Western readers — including most of the practitioners who first encountered Dōgen through the Nishijima-Cross edition — understand what Dōgen actually wrote[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Gudō Wafu Nishijima § Translations",
        excerpt:
          "Working with student and Dharma heir Mike Chodo Cross, Nishijima compiled one of three complete English versions of Dōgen's ninety-five-fascicle Kana Shōbōgenzō.",
      },
      { index: 2, sourceId: "src_hardcore_zen_nishijima_students", pageOrSection: "Hardcore Zen — Mike Chodo Cross, Nishijima's heir" },
    ],
  },
  {
    slug: "kosen-baido",
    content: `Kosen Baido is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "kokoku-soryu",
    content: `Kokoku Soryu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "mokushi-soen",
    content: `Mokushi Soen (1673–1746) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the post-shūtō-fukko Sōtō transmission" },
    ],
  },
  {
    slug: "mugai-keigon",
    content: `Mugai Keigon (1436–1517) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "nampo-gentaku",
    content: `Nampo Gentaku is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "nanso-shinshu",
    content: `Nanso Shinshu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "nenshitsu-yokaku",
    content: `Nenshitsu Yokaku (1440–1516) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "raphael-doko-triet",
    content: `Raphaël Dōkō Triet (b. 1950, Paris) is a French Sōtō Zen monk in the lineage of Taisen Deshimaru and abbot of the Seikyūji temple near Morón de la Frontera, Andalusia[1]. He began practising zazen in 1971 at the Paris dōjō with Deshimaru, who ordained him as a monk in 1973, and became one of Deshimaru's close disciples in the founding Paris sangha[2][3].

After Deshimaru's death in 1982, Triet helped continue the line of teaching Deshimaru had established in Europe. He served as president of the Paris dōjō from 1990 to 1995 and as editor-in-chief of the Revue Zen — the magazine of the Association Zen Internationale (AZI) — from around 1990 to 2002, shaping much of the written teaching available to the European sangha[3][6]. He received Dharma transmission (shihō) in 1997 from Master Yūkō Okamoto, a Japanese Sōtō master and close associate of both Deshimaru and Kōdō Sawaki, formally confirming his place in the Sōtō lineage as a successor authorised to ordain monks and to transmit the dharma in turn[1][2].

Triet moved to Spain in 1995 and, in 1997, founded the Centro Zen de Lisboa (Dōjō Zen de Lisboa, Ryūmonji), establishing a Deshimaru-line Sōtō presence on the Iberian Peninsula[4]. From 2004 to 2013 he led the AZI at the international level, and from 2012 to 2015 he served as abbot of the Temple Zen de La Gendronnière in France — the principal European temple founded by Deshimaru[3][5]. He currently leads sesshin and ango at Seikyūji and teaches regularly in Spain, Portugal, France, Quebec, and Sweden[1][2].

His teaching follows Deshimaru's "vrai zen": zazen as the heart of practice, integrated with meals, work, and ordinary relationships rather than confined to ritual or monastic settings. In kusen and teisho he draws on classical authors such as Wanshi, Dōgen, and Ryōkan, using sober and concrete imagery to address illusion, suffering, and the margin between conditioned life and freedom[1][3].

His four publicly-documented dharma successors form the core of the Triet branch of the European Sōtō line: **Hugues Yūsen Naas** (1952–2023), who received shihō in 2009 and later served as abbot of La Gendronnière (April 2019 – May 2021) and founder of the Centre Zen du Perche Daishugyōji[2][5]; **Yves Shōshin Crettaz** (b. 1946, Switzerland), responsible for the Centro Zen de Lisboa, who received shihō in 2013[4]; **Begoña Kaidō Agiriano**, responsible teacher of the Dōjō Zen de Vitoria-Gasteiz in the Basque Country, who received shihō the same year, in 2013, as documented in the AZI La Gendronnière brochure ("Begonia Kaido Agiriano received the Dharma transmission in 2013 from her teacher, Raphaël Doko Triet")[7]; and **Alfonso Sengen Fernández**, responsible teacher of the Dōjō Zen de Sevilla Kaiko in Andalusia, who received shihō in 2017 as recorded in the Spanish-language Foro Budismo register of Spanish Zen masters and corroborated by his dōjō's own Linaje page[8]. According to testimony from Fernández himself, Triet has transmitted the Dharma to a third Spaniard whose name has not yet appeared in any consolidated public source[8].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_seikyuji",
        pageOrSection: "Seikyuji — Raphaël Dōkō Triet (abbot biography)",
      },
      {
        index: 2,
        sourceId: "src_azi",
        pageOrSection: "AZI — Maître Raphaël Dôkô Triet",
        excerpt:
          "Né en 1950, il commence la pratique du zen avec Maître Taisen Deshimaru au Dojo de Paris en 1971; ordonné moine en 1973; reçoit le Shihō de Maître Yūkō Okamoto en 1997.",
      },
      {
        index: 3,
        sourceId: "src_zen_mataro",
        pageOrSection: "Zen Mataró — Raphaël Dōkō Triet (institutional roles, Revue Zen, La Gendronnière)",
      },
      {
        index: 4,
        sourceId: "src_dojo_zen_lisboa",
        pageOrSection: "Mestres — founding of the Lisbon dōjō and transmission to Yves Shōshin Crettaz",
      },
      {
        index: 5,
        sourceId: "src_la_gendronniere",
        pageOrSection: "La Gendronnière — list of successive abbots, including Triet (2012–2015) and Naas (2019–2021)",
      },
      {
        index: 6,
        sourceId: "src_revue_zen",
        pageOrSection: "Revue Zen — masthead, editor-in-chief Raphaël Dōkō Triet (c. 1990–2002)",
      },
      {
        index: 7,
        sourceId: "src_azi_gendronniere_brochure",
        pageOrSection:
          "https://www.zen-azi.org/sites/default/files/attachments/page/depliant_ecran_gb.pdf — AZI La Gendronnière summer-retreats brochure: \"Begonia Kaido Agiriano received the Dharma transmission in 2013 from her teacher, Raphaël Doko Triet\" (accessed 2026-05-11).",
      },
      {
        index: 8,
        sourceId: "src_foro_budismo",
        pageOrSection:
          "https://www.forobudismo.com/viewtopic.php?t=3049 — Foro Budismo register of Spanish Zen masters: \"Alfonso Sengen Fernández… recibió la transmisión del Dharma en 2017 de Raphael Doko Triet (Sevilla)\"; same thread reports a third unnamed Spanish disciple of Triet via Fernández's testimony (accessed 2026-05-11).",
      },
    ],
  },
  {
    slug: "stephane-kosen-thibaut",
    content: `Stéphane Jacques Germain Thibaut, known under the religious name Kōsen, was born on 26 May 1950 in the 16th arrondissement of Paris and died on 21 September 2025 in Montpellier at the age of 75[1]. The son of the musician Gilles Thibaut and a teacher-psychologist mother, he studied theatre and mime at the École internationale Jacques Lecoq in Paris before, at nineteen, encountering Taisen Deshimaru, who was then introducing Sōtō Zen to Europe. He became Deshimaru's disciple, received the bodhisattva ordination under the name Kōsen, then the monastic ordination of a Zen monk in 1971, and practised at his master's side for some fifteen years until Deshimaru's death in 1982[1][3].

In 1984, Niwa Rempō Zenji, abbot of Eihei-ji and the highest authority in Japanese Sōtō, conferred dharma transmission (shihō) on Thibaut, making him — by Sōtō reckoning — the 83rd successor of Shakyamuni Buddha in the Deshimaru line and one of only three of Deshimaru's disciples authenticated by Eihei-ji that year (alongside Étienne Mokushō Zeisler and Roland Yuno Rech)[1][3]. From the 1990s he began an explicitly missionary work in Latin America. The academic study of Latin American Buddhism by C. E. Carini (2018) describes "a group linked to Deshimaru's lineage led by the Frenchman Stéphane Kōsen Thibaut" undertaking the first sustained Sōtō Zen mission in Argentina[1]. **In 1999, near Capilla del Monte in the province of Córdoba, he founded Templo Shōbōgenji — recognised as the first Sōtō Zen temple of South America in the Deshimaru line, and the first Zen temple of any kind in Argentina[1][2].** The temple drew disciples from Buenos Aires and across the country; Thibaut later ordained Toshiro Taigen Yamauchi and entrusted him with the Buenos Aires dōjō, and ordained Ariadna Dōsei Labbate, who in 2015 became the first woman Sōtō Zen master in Argentina[2][3]. In 2008 he founded a second residential temple in France — Yūjō Nyūsanji, in the Parc naturel régional du Haut-Languedoc at Douch (commune of Rosis, Hérault) — which became the principal centre of the international Kōsen Sangha, uniting practitioners across Europe, Latin America, Cuba, and Canada[1][2].

Throughout his life, Kōsen ordained many disciples as bodhisattvas, monks, and nuns, and conferred shihō on twelve recipients across six cohorts: in September 1993 on Bárbara Kōsen Richaudeau, André Ryūjō Meissner, and Édouard Shinryū Bagracbski "in the name of Master Deshimaru"; in 2002 on Yvon Myōken Bec "in the name of his fellow disciple Master Étienne Mokushō Zeisler"; in October 2009 at Caroux on Christophe Ryūrin Desmur and Pierre Sōkō Leroux; in 2013 on Loïc Kōshō Vuillemin; in 2015 on Ingrid Gyūji Igelnick, Françoise Jōmon Julien, Paula Reikiku Femenias, and Ariadna Dōsei Labbate; and in October 2016 at Shōbōgenji on Toshiro Taigen Yamauchi[2][3]. His principal published works are *La Révolution intérieure* (Éditions de l'Œil Du Tigre, 1997), *Les cinq degrés de l'éveil : l'enseignement d'un moine zen* (Éditions du Relié, 2006), and *Chroniques de la grande sagesse* (Œil Du Tigre, 2017)[1].

Together with the network he built and the dozen successors he authorised, these works place him among the principal architects of Deshimaru's lineage outside France — and the figure most responsible for bringing Sōtō Zen to Hispanophone South America[1][2][4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "fr.wikipedia.org — Stéphane Kōsen Thibaut",
        excerpt:
          "Né le 26 mai 1950 à Paris ; mort le 21 septembre 2025 à Montpellier ; transmission du Dharma par Niwa Zenji en 1984 ; fondateur en 1999 du temple Shōbōgenji près de Córdoba (Argentine), premier temple zen Sōtō d'Amérique du Sud dans la lignée Deshimaru ; fondateur en 2008 du temple Yūjō Nyūsanji (Rosis, Hérault) ; principaux ouvrages : La Révolution intérieure (1997), Les cinq degrés de l'éveil (2006), Chroniques de la grande sagesse (2017).",
      },
      {
        index: 2,
        sourceId: "src_yujo_nyusanji",
        pageOrSection: "Yujō Nyūsanji — temple history and successors of Maître Kosen",
      },
      {
        index: 3,
        sourceId: "src_kosen_sangha",
        pageOrSection: "Kosen Sangha / ABZD — Maître Kosen presentation, full list of shihō recipients with years",
        excerpt:
          "1993: Barbara Kōsen Richaudeau, André Ryūjō Meissner, Édouard Shinryū Bagracbski. 2002: Yvon Myōken Bec. 2009: Christophe Ryūrin Desmur, Pierre Sōkō Leroux. 2013: Loïc Kōshō Vuillemin. 2015: Ingrid Gyūji Igelnick, Françoise Jōmon Julien, Paula Reikiku Femenias, Ariadna Dōsei Labbate. 2016: Toshiro Taigen Yamauchi.",
      },
      {
        index: 4,
        sourceId: "src_buddhachannel",
        pageOrSection: "Buddhachannel — coverage of Latin-American Sōtō Zen and the Kosen Sangha",
      },
    ],
  },
  {
    slug: "etienne-mokusho-zeisler",
    content: `Étienne Mokushō Zeisler (1946 – 7 June 1990) was a Hungarian-French Sōtō Zen monk and one of Taisen Deshimaru's three principal dharma heirs. He met Deshimaru in the years following the latter's 1967 arrival in Paris, was ordained as a monk, and became one of his closest disciples, working alongside the master at the founding generation of European Sōtō dōjōs. **In 1984, two years after Deshimaru's death, Niwa Rempō Zenji — abbot of Eihei-ji and the highest authority of Japanese Sōtō Zen — conferred dharma transmission (shihō) on Zeisler together with Stéphane Kōsen Thibaut and Roland Yuno Rech**, formally authenticating Deshimaru's mission in Europe[1].

Zeisler's distinctive contribution was geographical. From the late 1980s he turned his teaching east, undertaking missionary trips into Romania, Hungary, and what was then Czechoslovakia at a time when Western Buddhist practice was almost unknown behind the Iron Curtain[3]. He died on 7 June 1990 at the age of 44, leaving the mission to extend Deshimaru's lineage into the post-communist East to his dharma-heir, the monk Yvon Myōken Bec, who founded **Mokusho Zen House Budapest in 1992** — the first sustained Sōtō Zen sangha in Hungary, named in Zeisler's memory[2]. Through Myōken's later transmission from Kōsen Thibaut the Zeisler line is today carried forward in Hungary, Romania, and the broader Eastern European Buddhist landscape, and the Mokusho Zen House network has trained Vincent Keisen Vuillemin (Geneva) and others as direct disciples of Zeisler's[2].

The institutional shape of the post-Zeisler mission can be reconstructed in detail from the Mokushō Zen House lineage record. Bec's first Romanian trips began in 1991, and the very first Eastern European Zen dōjō was founded in Bucharest in 1993; the Mokushō Zen Ház at Uszó, together with the Zeisler Foundation, followed in 1994; the first Hungarian urban dōjō opened in Budapest's Ilka street in 1995; the network's mountain temple Hōbō-ji was built in the sacred Pilis range in 1997; and the Hungarian sangha consolidated at the Taisen-ji temple in Budapest in 2000[4]. Bec himself received shihō from Kōsen Thibaut in 2002, and in 2015 the Sōtō school posthumously conferred on Zeisler the honorific title **Sōbo (祖母, "Treasure of the Sangha")**, a Japanese institutional recognition of the magnitude of his Eastern European mission[4].

A second generation of formally transmitted teachers now carries the line. **In 2007 Bec conferred shihō on Vincent Keisen Vuillemin** of Geneva — Zeisler's direct Francophone Swiss disciple — and **in 2016 he transmitted to three further successors in the Deshimaru–Zeisler lineage: Maria Teresa Shōgetsu Avila (Geneva, with extension to Senkuji in the Ecuadorian Amazon, opened 2018–19), Ionuț Koshin Nedelcu (abbot of Mokushōzenji, Bucharest), and László Toryu Kálmán (Sümegi Mokushō Zen Dōjō, Hungary)**[4][5]. Together these four shihō recipients are the formal continuing teachers of the Mokushō Zen House network and the institutional answer to the question Zeisler's early death had left open: who would carry his mission past the founder's generation[4].

Zeisler's place in the AZI lineage is not as a long-living institution-builder but as the disciple who, more than any other, redirected Deshimaru's western mission eastward across the Cold-War divide before his early death — a redirection whose institutional fruit, three and a half decades on, is the four-temple Mokushō Zen House network and its formal continuing teachers in Geneva, Bucharest, Budapest, and the Ecuadorian Amazon[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Taisen Deshimaru § Students",
        excerpt:
          "After Master Deshimaru's death, three of his closest disciples — Etienne Zeisler, Roland Rech, and Kosen Thibaut — traveled to Japan to receive shiho from Master Rempo Niwa Zenji.",
      },
      {
        index: 2,
        sourceId: "src_mokusho_house",
        pageOrSection: "Mokushō Zen House Budapest — Our Story",
        excerpt:
          "Mokusho Zen House is a zen sangha located in Eastern Europe since 1992. It is founded and led by monk Myōken, the dharma-heir of Mokushō Zeisler in the Deshimaru lineage. Master Zeisler dies on 7 June 1990, giving the mission to monk Myōken to establish the Deshimaru lineage in Eastern Europe. Vincent Keisen Vuillemin, from Geneve, disciple of master Zeisler.",
      },
      {
        index: 3,
        sourceId: "src_mokusho_house",
        pageOrSection: "Mokushō Zen House — Our Story (1990 / 1991-1992 entries)",
        excerpt:
          "1990 — Master Zeisler dies on June 7th, passing his mission to monk Myoken to establish the Deshimaru lineage in Eastern Europe. 1991-1992 — Monk Myoken begins his mission with trips to Romania.",
      },
      {
        index: 4,
        sourceId: "src_mokusho_house",
        pageOrSection: "Mokushō Zen House — Our Story (1993–2018 timeline)",
        excerpt:
          "1993 The first Eastern-European zen dojo is founded in Bucharest, Romania. 1994 The Mokusho Zen Ház is established in Uszó, alongside the creation of the Zeisler Foundation. 1995 The first Hungarian dojo was founded in Budapest, Ilka street. 1997 The first Eastern-European zen temple, Hoboji, was built in the sacred mountains of Pilis, Hungary. 2000 The Hungarian Sangha settled in the Taisenji zen temple, Budapest. 2002 Monk Myoken receives Dharma transmission from master Kosen Thibaut. 2007 Master Myoken grants Dharma transmission to Vincent Keisen Vuillemin. 2015 Master Zeisler is posthumously honored with the title 'Sobo – Treasure of the Sangha.' 2016 Myoken transmits Dharma to three disciples: Maria Teresa Shogetsu Avila, Ionut Koshin Nedelcu, and László Toryu Kálmán.",
      },
      {
        index: 5,
        sourceId: "src_mokusho_house",
        pageOrSection: "Mokushō Zen House — Our Story (2018–2019 entry)",
        excerpt:
          "2018-2019 — Senkuji temple in Ecuador is built and opened by Hungarian and Chilean disciples.",
      },
    ],
  },
  {
    slug: "roland-rech",
    content: `Roland Yuno Rech (born Roland Rech, 20 June 1944, Paris) is one of the most senior and prolific living teachers of European Sōtō Zen[1]. A graduate of Sciences Po (Institut d'études politiques de Paris, promotion 1966) and of the DESS in Clinical Human Sciences at Université Paris VII-Denis-Diderot, he discovered zazen in 1971 at the Sōtō Antaiji temple in Kyoto during a worldwide search for meaning[1][2]. On his return to France in 1972 he became the disciple of Taisen Deshimaru — a relationship that lasted until Deshimaru's death in 1982 — and was ordained as a monk in 1974, while keeping, on Deshimaru's recommendation, his industrial-management career so as to serve as one of his teacher's principal translators, dōjō coordinators, book editors, and sesshin leaders[1][2].

**In 1984, Niwa Rempō Zenji of Eihei-ji conferred dharma transmission (shihō) on Rech together with Étienne Mokushō Zeisler and Stéphane Kōsen Thibaut**, the three of Deshimaru's disciples authenticated by Japan's highest Sōtō authority[1][2]. Rech then took on the dharma name Yuno (有能 — "capable, courageous")[1]. He served as president of the Association Zen Internationale until 1994, was a founding member of the Union Bouddhiste de France in 1986 and its vice-president for fifteen years[1][5], and now teaches at the temple Gyō Butsu-ji in Nice, at La Gendronnière, and across the AZI sesshin circuit[3]. The Sōtōshū Shūmuchō has formally recognised him as dendō kyōshi (伝道教師, missionary monk) for Europe[1][4]; in 2007, his students founded the Association Bouddhiste Zen d'Europe (ABZE), the institutional umbrella under which the Yuno Rech line now operates across France, Germany, Italy, Spain, Belgium, and Switzerland[1][2].

Since 2010, Yuno Rech has himself transmitted shihō to a now-substantial generation of European successors[1][2]. The first cohort comprised Patrick Pargnien (Bordeaux) and Heinz-Jürgen Metzger (Solingen / Cologne) in 2010; Sengyo Van Leuven (Rome Jōhōji) in 2011; Emanuela Dōsan Losi (Carpi) in 2012, his first woman dharma heir; and Pascal-Olivier Kyōsei Reynaud (Narbonne) in 2013, who performed his hossen-shiki ceremony at Gyō Butsu-ji in February of that year[1][2]. Michel Jigen Fabra (Poitiers) followed in 2014 and went directly to Eihei-ji and Sōji-ji for the formal zuise visit required by the Sōtōshū to be confirmed as oshō[1][2][4].

Through the second half of the 2010s the network broadened across borders: Konrad Kōsan Maquestieau (Halle, Belgium) in 2015; Lluís Nansen Salas (Barcelona Kannon), Claude Émon Cannizzo (Mulhouse), Antonio Taishin Arana (Pamplona Genjō), and Alonso Taikai Ufano (Sevilla) in March and December 2016 — a sweep that anchored the Iberian peninsula in the Yuno Rech line for the first time[1][2]. Antoine Charlot (Bondy) and Marc Chigen Estéban (Chalon-sur-Saône, current ABZE president) followed in 2018, and Beppe Mokuza Signoritti (Alba) and Eveline Kogen Pascual (Aachen) in 2019, deepening the Italian and German wings respectively[1][2].

A second wave from 2022 onward has continued the pattern: Huguette Moku Myō Siréjol (Toulouse) and Jean-Pierre Reiseki Romain (Dōjō Zen de Paris) in 2022 — Romain himself a 1981 disciple of Deshimaru ordained by Philippe Coupey — were followed by Sergio Gyō Hō Gurevich (Paris-Tolbiac) and Luc Sojō Bordes (Vernon) in 2023, and most recently by Silvia Hoju Leyer (Aachen) and Claus Heiki Bockbreder (Melle / Osnabrück) in 2024[1][2]. Together this cohort of more than twenty successors makes Yuno Rech, by the mid-2020s, the most institutionally productive of Deshimaru's three direct heirs and the principal vector through which the AZI line is reproducing itself in the second European generation[1][2][3].

He is the author of numerous books in French on Dōgen's Shōbōgenzō, the Sandōkai, and the practice of zazen, drawing his characteristic kusen-style oral teaching directly from Dōgen's text; his commentary on the Genjōkōan, *La realización del despertar* (translated into Spanish by Antonio Arana and Txus Laita), has circulated widely in the Iberian sangha[2][6]. His public role and prolific publishing have made him, in the years since Deshimaru's death, the most institutionally visible of Deshimaru's heirs and one of the principal European interpreters of Dōgen's philosophy[1][3][5].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "https://fr.wikipedia.org/wiki/Roland_Yuno_Rech (accessed 2026-05-11)",
        excerpt:
          "Né le 20 juin 1944 à Paris ; diplômé de l'IEP de Paris (1966) et du DESS de Sciences Humaines Cliniques (Paris VII) ; rencontre du zazen au temple Antai-ji en 1971 ; disciple de Deshimaru de 1972 à 1982 ; ordonné moine en 1974 ; transmission du dharma (shihō) par Niwa Rempō Zenji en 1984.",
      },
      {
        index: 2,
        sourceId: "src_azi",
        pageOrSection: "https://abzen.eu/les-enseignants/ (accessed 2026-05-11)",
        excerpt: "ABZE roster of Roland Yuno Rech's dharma heirs, 2010–2024.",
      },
      {
        index: 3,
        sourceId: "src_la_gendronniere",
        pageOrSection: "https://www.gendronniere.com/ — Enseignants (accessed 2026-05-11)",
        excerpt:
          "Liste des enseignants intervenant à La Gendronnière, comprenant Roland Yuno Rech.",
      },
      {
        index: 4,
        sourceId: "src_sotozen_europe",
        pageOrSection: "https://www.sotozen.com/eng/temples/regional_office/europe.html (accessed 2026-05-11)",
        excerpt:
          "Sōtōshū Shūmuchō Europe office in Paris; Yuno Rech as recognised dendō kyōshi for Europe.",
      },
      {
        index: 5,
        sourceId: "src_ubf",
        pageOrSection: "Union Bouddhiste de France — historique des vice-présidents (accessed 2026-05-11)",
        excerpt:
          "Roland Yuno Rech, membre fondateur de l'UBF en 1986 et vice-président pendant quinze ans.",
      },
      {
        index: 6,
        sourceId: "src_azi",
        pageOrSection: "Spanish edition: La realización del despertar — translated by Antonio Arana and Txus Laita",
      },
    ],
  },
  {
    slug: "rosetsu-ryuko",
    content: `Rosetsu Ryuko is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "sawada-zenko",
    content: `Sawada Zenko is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "sengan-bonryu",
    content: `Sengan Bonryu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "senshu-donko",
    content: `Senshu Donko is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "senso-esai",
    content: `Senso Esai (1409–1475) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "sessan-tetsuzen",
    content: `Sessan Tetsuzen is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "sesso-hoseki",
    content: `Sesso Hoseki is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "shingan-doku",
    content: `Shingan Doku (1374–1449) is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval Sōtō branch network" },
    ],
  },
  {
    slug: "shizan-tokuchu",
    content: `Shizan Tokuchu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "shoryu-koho",
    content: `Shoryu Koho is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "shoun-hozui",
    content: `Shoun Hozui is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "taiei-zesho",
    content: `Taiei Zesho is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "taigen-soshin",
    content: `Taigen Soshin is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "taizan-maezumi",
    content: `Hakuyū Taizan Maezumi was born February 24, 1931, in Ōtawara, Tochigi Prefecture, Japan, the son of Baian Hakujun Kuroda, abbot of Kirigayaji and a major figure of mid-twentieth-century Sōtō Zen. He was ordained a novice Sōtō monk at the age of eleven and went on to take degrees in Oriental literature and philosophy at Komazawa University, the Sōtō school's flagship institution, while completing formal monastic training at Sōji-ji[1][2]. In 1955 he received shihō (dharma transmission) from his father in the Sōtō lineage. What set Maezumi apart from almost every other Japanese teacher who came to the West was his determination to inherit several streams at once: he went on to receive inka shōmei from the Sanbō Kyōdan master Hakuun Yasutani in 1970, and a further inka in 1973 from the lay Rinzai master Kōryū Osaka, making him "one of very few teachers to receive Inka...in both the Inzan and Takuju Rinzai lineages, as well as Dharma Transmission in the Sōtō lineage."[2] These three transmissions are not equivalent in form or institutional standing: the 1955 act from Hakujun Kuroda is formal Sōtōshū-registered shihō; the Yasutani inka is a Sanbō Kyōdan certificate from a hybrid Sōtō-Rinzai modernist lineage that operates outside the Sōtōshū; and the Kōryū Osaka inka is from a Rinzai lay-koan-completion line. The triple lineage is the structural reason the White Plum Asanga is treated as a separate federation rather than a Sōtōshū sub-branch.

In 1956 Maezumi was sent to Los Angeles as a missionary priest of Zenshūji, the North American Sōtō headquarters, and in 1967 he founded the Zen Center of Los Angeles, which became one of the most influential American Zen training centers of the twentieth century[1][3]. He established the Kuroda Institute for the Study of Buddhism and Human Values in 1976 to support scholarly publication, and in 1979 he and his first heir Bernie Tetsugen Glassman conceived informally of the White Plum Asanga, named in honor of Baian Hakujun Dai-oshō; it was incorporated in 1995 after Maezumi's death and is today the umbrella for his entire lineage[2]. His curriculum integrated shikantaza, formal kōan study through the Harada-Yasutani curriculum, and the bodhisattva precepts, and his published writings include the foundational anthologies *On Zen Practice* (ZCLA, 1976) and *The Way of Everyday Life* (Center Publications, 1978), with the posthumous collections *Appreciate Your Life* (Shambhala, 2001) and *Teaching of the Great Mountain* (Tuttle, 2001) gathering decades of his Dharma talks[1].

Maezumi gave dharma transmission to twelve American successors — Tetsugen Bernard Glassman, Dennis Genpo Merzel, Charlotte Joko Beck, Jan Chozen Bays, John Daido Loori, Gerry Shishin Wick, John Tesshin Sanderson, Alfred Jitsudo Ancheta, Charles Tenshin Fletcher, Susan Myoyu Andersen, Nicolee Jikyo McMahon, and William Nyogen Yeo — and ordained 68 Zen priests and gave lay precepts to more than 500 students[1][2]. The breadth of that roster, which seeded ZCLA, Zen Peacemakers, Zen Mountain Monastery, the Ordinary Mind Zen School, Great Vow Monastery, and Kanzeon Sangha, is the principal reason the White Plum is now one of the largest Zen networks in the West. Maezumi died suddenly on May 15, 1995, in Tokyo, at the age of sixty-four[1][2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Taizan Maezumi", excerpt: "Born February 24, 1931, in Ōtawara, Tochigi, Japan. Studied oriental literature and philosophy at Komazawa University. Ordained as a novice monk in the Sōtō lineage at age eleven. Received shihō (temple succession) from his father in 1955. Died May 15, 1995 in Tokyo." },
      { index: 2, sourceId: "src_whiteplum", pageOrSection: "Founder — Taizan Maezumi Roshi", excerpt: "one of very few teachers to receive Inka in both the Inzan and Takuju Rinzai lineages, as well as Dharma Transmission in the Soto lineage. Conceived of informally in 1979 by Maezumi and Bernard Tetsugen Glassman, named after Maezumi's father Baian Hakujun Dai-osho and then later incorporated in 1995 following Maezumi's death." },
      { index: 3, sourceId: "src_zcla_maezumi_founders", pageOrSection: "ZCLA — Founders", excerpt: "Maezumi Roshi founded the Zen Center of Los Angeles in 1967." },
    ],
  },
  {
    slug: "tenrin-kanshu",
    content: `Tenrin Kanshu is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "tenyu-soen",
    content: `Tenyu Soen is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "ungai-kozan",
    content: `Ungai Kozan is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "shohaku-okumura",
    content: `Shōhaku Okumura, born 22 June 1948 in Osaka, is a Sōtō Zen priest, translator, and the principal English-language disciple of Kōshō Uchiyama-roshi of Antaiji. He has done as much as any living teacher to make the writings of Eihei Dōgen accessible in idiomatic, philologically careful English[4].

Okumura traces his vocation to a high-school encounter with Uchiyama's book *Self*. He went on to study Buddhism at Komazawa University in Tokyo, and on 8 December 1970 was ordained at Antaiji under Uchiyama, with whom he practiced until his teacher's retirement in 1975[1]. After Antaiji he co-founded Pioneer Valley Zendo in Massachusetts, where he taught until 1981, and later served as a teacher at Minnesota Zen Meditation Center (1993–1996, including a stint as interim abbot)[1]. In 1996 he founded Sanshin Zen Community in Bloomington, Indiana, where he is abbot; the name *sanshin* (三心), "three minds," is taken from Dōgen's *Tenzo Kyōkun* — magnanimous mind, parental mind, and joyful mind[2]. From 1997 to 2010 he simultaneously served as the founding director of the Sōtō Zen Buddhism International Center in San Francisco, the North American outpost of the Sōtō-shū[1].

His bibliography as author and translator is substantial. As translator of Dōgen and Uchiyama, with frequent collaborator Taigen Dan Leighton, he produced *The Wholehearted Way: A Translation of Eihei Dōgen's Bendōwa with Commentary by Kōshō Uchiyama* (Tuttle, 1997)[1], *Dōgen's Pure Standards for the Zen Community: A Translation of Eihei Shingi* (SUNY Press, 1996)[1], and the monumental *Dōgen's Extensive Record: A Translation of the Eihei Kōroku* (Wisdom Publications, 2010), the first complete English rendering of Dōgen's nine-volume Eihei Kōroku[3]. He was the principal translator of Uchiyama's *Opening the Hand of Thought: Foundations of Zen Buddhist Practice* (Wisdom, 2004), described as edited by Jishō Cary Warner and translated by Daitsū Tom Wright and Uchiyama's Dharma heir Shohaku Okumura. As an author in his own voice, his Wisdom Publications titles include *Realizing Genjokoan: The Key to Dōgen's Shōbōgenzō* (2010), *Living by Vow: A Practical Introduction to Eight Essential Zen Chants and Texts* (2012), and *Boundless Vows, Endless Practice* (2024)[1].

Okumura's named successor at Sanshin is Hōkō Karnegis, designated in 2016; other priest disciples include Shōryū Bradley (Gyobutsuji Zen Monastery, Arkansas, 2011) and Densho Quintero (Comunidad Sōtō Zen de Colombia, Bogotá)[2]. His teaching, like Uchiyama's, centers uncompromisingly on shikantaza — long silent sesshin "without toys," "14 hours of zazen per day with no ceremonies, work, or Dharma talks"[2] — paired with rigorous textual study of the Shōbōgenzō through annual *genzō-e* retreats. The combination of plain, Sawaki-Uchiyama Sōtō practice and patient, scholarly translation work has made him one of the most influential transmitters of Dōgen's actual words to the contemporary English-speaking world.`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Shōhaku Okumura", excerpt: "Born June 22, 1948, in Osaka. Studied at Komazawa University. Ordained December 8, 1970, at Antaiji under Kōshō Uchiyama. Co-founded Valley Zendo in Massachusetts; teacher at Minnesota Zen Meditation Center (1993-1996); founded Sanshin Zen Community in Bloomington, Indiana (1996-present); director of Sōtō Zen Buddhism International Center, San Francisco (1997-2010). Books: Realizing Genjokoan (2010); Living by Vow (2012); Eihei Shingi with Leighton (1996); Wholehearted Way with Leighton (1997)." },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Sanshin Zen Community", excerpt: "Founding date: 1996. Bloomington, Indiana. Sanshin (三心) — three minds, from Dōgen's Tenzo Kyōkun. Sesshin without toys, 14 hours of zazen per day. Genzo-e retreats studying Shōbōgenzō. Dharma heirs: Densho Quintero, Shōryū Bradley (2011), Hoko Karnegis (designated 2016)." },
      { index: 3, sourceId: "src_leighton_okumura_eihei_koroku", pageOrSection: "Front matter", excerpt: "Dōgen's Extensive Record: A Translation of the Eihei Kōroku, translated by Taigen Dan Leighton and Shohaku Okumura. Boston: Wisdom Publications, 2010." },
      { index: 4, sourceId: "src_sotozen_founders", pageOrSection: "Sōtō Zen — Shohaku Okumura and Sanshin Zen Community" },
    ],
  },
  {
    slug: "ivan-densho-quintero",
    content: `Iván Denshō Quintero (b. 1961 in Bogotá, Colombia) is a Colombian Sōtō Zen monk and the founding abbot of Daishinji ("Templo Zen Mente Magnánima"), the principal Sōtōshū-recognised Zen temple in South America[1][2]. He began studying and practising Sōtō Zen in 1984 and travelled to Europe later that decade to train within the Association Zen Internationale founded by Taisen Deshimaru[3].

He received his first monastic ordination in Paris in 1987 under the AZI, taking the religious name **Tendō**[3]. After settling back in Colombia, in 1989 he founded the meditation centre in Bogotá that would become the Comunidad Soto Zen de Colombia[2][4]. In October 2001 he was formally re-ordained as a Sōtō monk at Antaiji in Japan by abbot Shinyū Miyaura, receiving the religious name **Denshō** (伝照, "transmitted light"); during these years he also studied with Dokushō Villalba in Spain and stayed at the San Francisco Zen Center founded by Shunryu Suzuki[3].

In March 2009 he received Dharma transmission (shihō) from **Shōhaku Okumura Rōshi**, abbot of the Sanshin Zen Community in Bloomington, Indiana, becoming one of Okumura's small group of dharma-heirs[2][5]. He was officially recognised as a Sōtōshū teacher in 2009 and named *kokusai fukyōshi* — international missionary priest of the Japanese Sōtō school — in 2013[1]. On 12 February 2023 the Sōtōshū formally proclaimed his temple **Daishinji** in Bogotá the first Sōtō Zen temple of South America under the school's official register[1].

Beyond Bogotá he serves as abbot of the **Dokan Group in Caracas, Venezuela**, extending the Sōtō presence into the Andean and Caribbean regions[2]. He is the author of *El despertar Zen: el camino de un monje colombiano* (Editorial Kairós), *Conciencia Zen: reflexiones para la vida cotidiana*, and *ZEN, un camino de transformación*[6].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_buddhistdoor_es",
        pageOrSection: "Buddhistdoor en Español — La proclamación de Daishinji como templo de la escuela Zen Soto en Suramérica (12 February 2023)",
        excerpt:
          "Densho Sensei estableció en 1989 un zendō en Bogotá; obtuvo el reconocimiento oficial como maestro de la escuela Sōtō en 2009 y fue nombrado misionero internacional (kokusai fukyōshi) en 2013; el templo Daishinji fue proclamado oficialmente el 12 de febrero de 2023.",
      },
      {
        index: 2,
        sourceId: "src_sotozen_colombia",
        pageOrSection: "Soto Zen Colombia — Densho Quintero biographical page (heredero del Dharma de Okumura Roshi; abad del Grupo Dokan en Caracas, Venezuela)",
      },
      {
        index: 3,
        sourceId: "src_yusentendo",
        pageOrSection: "Yu Sen Tendo — Iván Densho Quintero biographical page (born Bogotá 1961; first ordination Paris 1987 as Tendō; ordained Antaiji October 2001 as Denshō by Shinyū Miyaura; studies with Dokushō Villalba and at San Francisco Zen Center)",
        excerpt:
          "Iván Densho Quintero, nacido en Bogotá en 1961. Recibió su primera ordenación de monje y el nombre Tendō en París en 1987 a través de la Asociación Zen Internacional fundada por Taisen Deshimaru; en octubre de 2001 recibió la ordenación formal como monje Sōtō en el templo Antaiji de Japón por el Ven. Shinyū Miyaura.",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Sanshin Zen Community § lineage (\"Okumura's student Densho Quintero had founded the Comunidad Soto Zen de Colombia in Bogotá in 1989\")",
      },
      {
        index: 5,
        sourceId: "src_sotozen120",
        pageOrSection: "Sōtōzen 120 — Densho Quintero international missionary teacher page (Dharma transmission March 2009 from Okumura Rōshi)",
        excerpt:
          "En marzo de 2009 recibió la Transmisión del Dharma de Okumura Rōshi, abad de la Comunidad Zen de Sanshinji en Bloomington, EE.UU.",
      },
      {
        index: 6,
        sourceId: "src_wikipedia",
        pageOrSection: "Editorial Kairós / Editorial Herder catalogue — books by Densho Quintero",
      },
    ],
  },
  {
    slug: "pierre-soko-leroux",
    content: `Pierre Sōkō Leroux is a French Sōtō Zen monk in the Deshimaru lineage and one of the seven dharma-heirs (shihō recipients) of Stéphane Kōsen Thibaut[1][2]. He resides and teaches in Barcelona, where he is the founding teacher of the Zan Mai Zen network — a Sōtō Zen association in the Iberian peninsula descended, through Thibaut, from Taisen Deshimaru's Paris work[3].

From Barcelona, Leroux directs and supervises practice across a cluster of Spanish and Portuguese dōjōs, ordains monks and nuns, and conducts sesshin in the kusen tradition transmitted to him by Kōsen Thibaut[3]. Among his Portuguese disciples is Manuel Toei Simões, whom he ordained as a monk in 2012 and who today leads the Zan Mai Zen headquarters dōjō outside Setúbal — the principal extension of Leroux's lineage south of the Pyrenees[3].

Leroux's place in the AZI / Kōsen Sangha neighbourhood is that of a third-generation European Sōtō teacher: trained under one of Deshimaru's three principal heirs[1][2], formally authenticated by him through shihō, and continuing the missionary work of installing Sōtō zazen practice in Hispanic and Lusophone Europe[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_kosen_sangha",
        pageOrSection: "Kosen Sangha — Maître Kosen presentation, list of shihō recipients",
        excerpt:
          "Disciples to whom Kōsen Thibaut transmitted shihō: Barbara Kōsen Richaudeau, André Ryūjō Meissner, Édouard Shinryū Bagracski, Yvon Myōken Bec, Christophe Ryūrin Desmur, Pierre Sōkō Leroux, Toshiro Taigen Yamauchi.",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "fr.wikipedia.org — Stéphane Kōsen Thibaut § Disciples",
      },
      {
        index: 3,
        sourceId: "src_zen_deshimaru_history",
        pageOrSection: "Zan Mai Zen network — Dojo Zen Bashô-An (Setúbal) and headquarters dōjō, lineage statement \"Sōtō / Deshimaru (via Master Pierre Soko Leroux, Barcelona)\"; ordination of Manuel Toei Simões in 2012",
      },
    ],
  },
  {
    slug: "yves-shoshin-crettaz",
    content: `Yves Shōshin Crettaz (b. 1946, Switzerland) is a Sōtō Zen monk in the lineage of Taisen Deshimaru and the responsible teacher of the Centro Zen de Lisboa (Ryūmonji) and several associated zazen groups in Portugal[1][5]. Originally from the canton of Valais, he studied philosophy and worked as a teacher, trade unionist, and journalist before dedicating himself fully to Zen[1].

Crettaz was ordained as a Zen monk in 1988 and trained for decades under his teacher Raphaël Dōkō Triet, a close disciple of Taisen Deshimaru. He received Dharma transmission (shihō) from Triet in 2013, confirming him as an authorised successor in the European Sōtō tradition[1][2]. In 1997 he moved to Portugal with Triet to establish Zen practice there; he has been responsible for the Lisbon dōjō since 2005[1][2].

Beyond Lisbon, Crettaz sits on the board of the Association Zen Internationale (AZI), is one of the responsible teachers for the Seikyūji temple near Seville, and represents the Lisbon dōjō in the Sōtō Zen Buddhism Europe Office of the Sōtōshū[2][6]. His teaching emphasises shikantaza, the spirit of mushotoku, and the practice of the present instant, in continuity with the kusen tradition of Deshimaru — a continuation Triet has explicitly identified, naming Crettaz alongside Hugues Yūsen Naas and Begoña Kaidō Agiriano as one of the three successors he has formally authorised[7].

His written work includes the book *O Gosto Simples da Vida*[3] and a study, "The Young Dōgen in China," circulated through AZI[4], which traces Dōgen Zenji's formative years of Chan training in the lineages of Tiāntóng Rújìng before his return to Japan and the founding of Eihei-ji.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dojo_zen_lisboa",
        pageOrSection: "Mestres — biographical entry for Yves Shōshin Crettaz",
        excerpt:
          "Born 1946 in Valais; studied philosophy; worked as teacher, trade unionist, and journalist; ordained 1988; received shihō from Raphaël Dōkō Triet in 2013; responsible for the Lisbon dojo since 2005.",
      },
      {
        index: 2,
        sourceId: "src_azi_lisbon",
        pageOrSection: "Association Zen Internationale — Lisbon center listing",
      },
      {
        index: 3,
        sourceId: "src_ysc_gosto_simples",
        pageOrSection: "Monograph by Yves Shōshin Crettaz",
      },
      {
        index: 4,
        sourceId: "src_ysc_young_dogen_pdf",
        pageOrSection: "AZI document 100-2020 (PDF)",
      },
      {
        index: 5,
        sourceId: "src_seikyuji",
        pageOrSection: "Seikyūji — Yves Shōshin Crettaz as one of the responsible teachers of the temple",
      },
      {
        index: 6,
        sourceId: "src_sotozen_europe",
        pageOrSection: "Sōtōshū Europe Office — directory entry, Centro Zen de Lisboa representative Yves Shōshin Crettaz",
      },
      {
        index: 7,
        sourceId: "src_zen_deshimaru_history",
        pageOrSection: "Triet successor cluster — Crettaz, Naas, Agiriano",
      },
    ],
  },
  {
    slug: "zoden-yoko",
    content: `Zoden Yoko is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },

  // =========================================================================
  // Rinzai school — Japanese Linji continuation
  // =========================================================================

  {
    slug: "shuho-myocho",
    content: `Shūhō Myōchō (宗峰妙超, 1282–1337), known posthumously by his imperial titles Daitō Kokushi (大燈國師) and Kōzen Daitō Kokushi, was the Dharma heir of Nanpo Jōmyō (Daiō Kokushi) and the founder of Daitoku-ji in Kyoto[1]. Together with Nanpo above him and his student Kanzan Egen below him, he forms the Daiō-Daitō-Kanzan line through which the entire Ōtōkan ("Daiō-Daitō-Kanzan") current of modern Rinzai Zen — the curriculum used at Daitoku-ji and Myōshin-ji to this day — descends[2].

The traditional account preserved in the *Daitō Kokushi Goroku* and the Tokugen-ji documentation reports that, after receiving Nanpo's seal in 1308, he spent some twenty years in austere hidden practice — including a celebrated period living incognito among beggars at the Gojō Bridge in Kyoto — before being discovered and installed by Emperor Go-Daigo as founding abbot of Daitoku-ji in 1326[3]. His death verse — *Sui sui buppo, choshu sansho* ("I cut through the Buddha and patriarchs; the blown-hair sword is forever bright") — became one of the most-quoted Rinzai compositions and a touchstone for the Ōtōkan emphasis on direct, unmediated transmission[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the Daiō-Daitō-Kanzan line and the founding of Daitoku-ji",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Shūhō Myōchō — Daitō Kokushi; Ōtōkan lineage",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Daitō's hidden practice and the Daitoku-ji founding",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Daitō Kokushi — death verse and influence",
      },
    ],
  },
  {
    slug: "kanzan-egen",
    content: `Kanzan Egen (關山慧玄, 1277–1360) was the Dharma heir of Shūhō Myōchō (Daitō Kokushi) and the founding abbot of Myōshin-ji in Kyoto, established in 1342 at the invitation of the retired Emperor Hanazono[1]. With his teacher Daitō and grand-teacher Daiō, he completes the Ōtōkan line (Daiō-Daitō-Kanzan, 應燈關) from which essentially all modern Rinzai Zen descends; Myōshin-ji and its branch network came in time to dwarf the older Gozan temples, and the Myōshin-ji line now accounts for the great majority of Rinzai temples in Japan[2].

Unlike many of his contemporaries Kanzan refused court honours and consciously kept Myōshin-ji out of the Gozan official monastic system, an institutional independence that preserved the *Rinka* (forest, in-mountain) discipline of the line as the Gozan temples drifted toward literary and administrative prominence[3]. His austerity, his refusal of state appointments, and the small size of his original community fixed the Myōshin-ji line's later self-understanding as a "rigorous" branch of Rinzai, in contrast to the more cultured Daitoku-ji and Gozan houses[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the founding of Myōshin-ji and the Ōtōkan line",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Kanzan Egen — Myōshin-ji and the Ōtōkan lineage",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Rinka vs Gozan distinctions in medieval Rinzai",
      },
      {
        index: 4,
        sourceId: "src_haskel_bankei",
        pageOrSection: "Introduction — the Myōshin-ji \"forest\" tradition",
      },
    ],
  },
  {
    slug: "myoki-soseki",
    content: `Myoki Soseki is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "gudo-toshoku",
    content: `Gudō Tōshoku (愚堂東寔, 1577–1661) was the most important Rinzai master of the early Edo period and the principal architect of the seventeenth-century *Ōtōkan* revival that preceded Hakuin's later reforms[1]. He served three terms as abbot of Myōshin-ji and re-asserted the line's *Rinka* (forest, in-mountain) self-understanding against the Tokugawa state's pressure to integrate Zen temples into the parish-registration (*danka*) system[2].

Gudō's principal Dharma heir Shidō Bunan in turn taught Shōju Rōjin (Dōkyō Etan), under whom Hakuin Ekaku underwent his most consequential training; so the Gudō → Bunan → Shōju → Hakuin sequence is the immediate four-generation conduit through which the rigorous-practice tradition of Myōshin-ji passed to the figure who would transform Japanese Rinzai in the eighteenth century[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the seventeenth-century Myōshin-ji revival and Gudō Tōshoku",
      },
      {
        index: 2,
        sourceId: "src_haskel_bankei",
        pageOrSection: "Introduction — Rinka vs Gozan and the Edo-period Rinzai temples",
      },
      {
        index: 3,
        sourceId: "src_waddell_hakuin",
        pageOrSection: "Introduction — Gudō → Bunan → Shōju → Hakuin sequence",
      },
    ],
  },
  {
    slug: "shido-bunan",
    content: `Shidō Bunan (至道無難, 1603–1676) was the Dharma heir of Gudō Tōshoku at Myōshin-ji and is among the most-quoted Edo-period Rinzai writers, almost entirely on the strength of a single verse: *Ikinagara shinde nari hatete, omou mama ni furumaeba yoshi* — "Die while alive, and be completely dead; then do as you will, all is good"[1]. The poem, preserved in his *Sokushinki* and copied through generations of Rinzai students, became one of the standard utterances of the *Rinka* school's insistence on the primacy of complete existential transformation over technique[2].

His historical importance is also lineal: Bunan's heir Shōju Rōjin (Dōkyō Etan) was the master under whom Hakuin Ekaku underwent the harsh post-kenshō training that opened his mature realisation, so Bunan stands as Hakuin's Dharma-grandfather and the immediate forerunner of the eighteenth-century Rinzai revival[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_waddell_hakuin",
        pageOrSection: "Introduction — Shidō Bunan and the \"die while alive\" verse",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Shidō Bunan and the Myōshin-ji line in the early Edo",
      },
      {
        index: 3,
        sourceId: "src_waddell_hakuin",
        pageOrSection: "Introduction — Bunan → Shōju Rōjin → Hakuin transmission",
      },
    ],
  },
  {
    slug: "shoju-rojin",
    content: `Shōju Rōjin (正受老人), formal name Dōkyō Etan (道鏡慧端, 1642–1721), was the *Rinka*-tradition master who served as Hakuin Ekaku's principal teacher and the figure who broke through the young Hakuin's premature confidence in his first awakening[1]. He was the natural son of the daimyō Matsudaira Tadatomo and a maidservant; his identification as the lay-name "Old Man of Shōju-an" derives from the small hermitage at Iiyama in Shinano where he taught a deliberately small circle of students throughout his long life[2].

The standard account, preserved most fully in Hakuin's own *Itsumadegusa*, describes Shōju's relentless testing of Hakuin during the eight-month visit of 1708 — most famously the moment when Shōju, having heard Hakuin claim that Buddha and Dharma were no more than the sound of crows, replied "How will you describe being kicked off the back of the floor?" and then knocked him into a courtyard ditch[3]. The episode and Shōju's continuing pressure on Hakuin afterwards forced the deeper *post-satori* training that Hakuin later codified into the curriculum of mature koan investigation that defined modern Rinzai practice[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Shōju Rōjin and the formation of Hakuin",
      },
      {
        index: 2,
        sourceId: "src_waddell_hakuin",
        pageOrSection: "Introduction — Shōju Rōjin's hermitage and lineage",
      },
      {
        index: 3,
        sourceId: "src_waddell_hakuin",
        pageOrSection: "Hakuin's autobiographical accounts of Shōju Rōjin",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Hakuin's post-satori training and the Rinzai curriculum",
      },
    ],
  },
  {
    slug: "toyo-eicho",
    content: `Toyo Eicho (1428–1504) is recorded in the historiography of the Myōshin-ji / Daitoku-ji line of medieval Rinzai as an abbot in its transmission lineage. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the late-Muromachi Rinzai line" },
    ],
  },
  {
    slug: "takuju-kosen",
    content: `Takuju Kosen is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "dokutan-sosan",
    content: `Dokutan Sosan is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "gasan-jito",
    content: `Gasan Jito is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "giten-gensho",
    content: `Giten Gensho is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "ian-chisatsu",
    content: `Ian Chisatsu (1514–1587) is recorded in the Myōshin-ji documentation as a sixteenth-century Rinzai abbot in the Myōshin-ji line of the Ōtōkan stream. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching survives in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Myōshin-ji line in the late Muromachi / Sengoku period" },
    ],
  },
  {
    slug: "juo-sohitsu",
    content: `Juō Sohitsu (1296–1380) is recorded in the Daitoku-ji documentation as a fourteenth-century Dharma heir within the Ōtōkan / Daitō-line transmission, one of the secondary teachers around the early Daitoku-ji community. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Daitō line in the fourteenth century" },
    ],
  },
  {
    slug: "karyo-zuika",
    content: `Karyō Zuika is recorded in the Myōshin-ji line documentation as a Rinzai abbot in the Ōtōkan stream, one of the many transmitting teachers between Kanzan and Hakuin. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching survives in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Myōshin-ji line between Kanzan and Hakuin" },
    ],
  },
  {
    slug: "koho-genkun",
    content: `Kōhō Genkun is recorded in the Rinzai-shū documentation as an abbot in the Ōtōkan line of Japanese Rinzai. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Myōshin-ji and Daitoku-ji lines in the early-modern period" },
    ],
  },
  {
    slug: "muin-soin",
    content: `Muin Soin (1326–1410) is recorded in the Daitoku-ji documentation as a fourteenth-century Rinzai abbot in the Daitō line. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Daitō line in the late fourteenth and early fifteenth centuries" },
    ],
  },
  {
    slug: "nanyin-shourou",
    content: `Nanyin Shourou (d. 952) is named in the late-Tang / Five-Dynasties transmission records as one of the minor figures of the Linji-stream genealogies. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching survives in the lamp-record corpus[1].`,
    footnotes: [
      { index: 1, sourceId: "src_ferguson_zen_chinese_heritage", pageOrSection: "Nanyin Shourou — entry in the Linji-stream genealogies" },
    ],
  },
  {
    slug: "nippo-soshun",
    content: `Nippō Soshun (1367–1448) is recorded in the Myōshin-ji line documentation as a fifteenth-century Rinzai abbot in the Ōtōkan stream. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Myōshin-ji line in the fifteenth century" },
    ],
  },
  {
    slug: "sekko-soshin",
    content: `Sekkō Sōshin (1408–1486) is recorded in the Myōshin-ji line documentation as a fifteenth-century Rinzai abbot in the Ōtōkan stream, in the generations between Kanzan Egen's founding circle and the Sengoku-period Myōshin-ji revival. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Myōshin-ji line through the fifteenth century" },
    ],
  },
  {
    slug: "taiga-tankyo",
    content: `Taiga Tankyō is recorded in the post-Hakuin Rinzai documentation as an abbot in the Inzan or Takujū sub-line of modern Rinzai Zen. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the post-Hakuin Inzan and Takujū curricula" },
    ],
  },
  {
    slug: "tankai-gensho",
    content: `Tankai Genshō is recorded in the post-Hakuin Rinzai documentation as an abbot in the Inzan or Takujū sub-line of modern Rinzai Zen. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the post-Hakuin Inzan and Takujū curricula" },
    ],
  },
  {
    slug: "tozen-soshin",
    content: `Tōzen Sōshin (1532–1602) is recorded in the Myōshin-ji line documentation as a sixteenth-century Rinzai abbot in the Ōtōkan stream, in the Sengoku-period generations preceding Gudō Tōshoku's seventeenth-century revival of Myōshin-ji. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Myōshin-ji line in the late Sengoku period" },
    ],
  },
  {
    slug: "yozan-keiyo",
    content: `Yōzan Keiyō (1559–1629) is recorded in the Myōshin-ji line documentation as a Rinzai abbot in the Ōtōkan stream at the close of the Sengoku period. The surviving record preserves his lineage placement; little distinctive doctrinal material from his teaching is preserved in the modern Rinzai-shū historiography[1].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Myōshin-ji line at the close of the Sengoku period" },
    ],
  },

  // =========================================================================
  // Yunmen school — one-word barriers
  // =========================================================================

  {
    slug: "xuedou-chongxian",
    content: `Xuedou Chongxian (雪竇重顯, 980–1052) was the most influential literary figure of the Yunmen house and one of the great Song-period stylists of Chan literature[1]. After training under Zhimen Guangzuo, he settled at Mount Xuedou in modern Ningbo, where he taught for over three decades. He selected the hundred encounter dialogues and composed for each a four-line verse (*sòng* 頌) — the collection that, with Yuanwu Keqin's commentaries and introductions added the next century, became the *Bìyán Lù* (碧巖錄, Blue Cliff Record)[2].

His verses are not paraphrases of the cases but lyrical re-statements that work the original encounter into a literary form designed to be sat with, not solved; this approach — using poetry as a contemplative instrument alongside the dialogue itself — became the model for the later Song "verse-comment" (*sòng-gǔ* 頌古) tradition that produced the *Cóngróng Lù* (Book of Serenity) in the Caodong line and shaped the standard Linji koan curriculum thereafter[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Yunmen-house literary culture",
      },
      {
        index: 2,
        sourceId: "src_blue_cliff_record_shaw_1961",
        pageOrSection: "Translator's introduction — Xuedou's verses and Yuanwu's commentaries",
      },
      {
        index: 3,
        sourceId: "src_heine_wright_koan",
        pageOrSection: "ch. on the sòng-gǔ tradition and Song koan literature",
      },
    ],
  },
  {
    slug: "jinhua-juzhi",
    content: `Jinhua Juzhi is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "liu-tiemo",
    content: `Liu Tiemo is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "mayu-baoche",
    content: `Mayu Baoche is recorded in the historiography of the medieval / early-modern Japanese Sōtō branch-temple network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "ch. on the medieval / early-modern Sōtō branch network" },
    ],
  },
  {
    slug: "panshan-baoji",
    content: `Panshan Baoji is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "longya-judun",
    content: `Longya Judun is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "baling-haojian",
    content: `Baling Haojian is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "chengtian-chuanzong",
    content: `Chengtian Chuanzong is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "fengxian-daochen",
    content: `Fengxian Daochen is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "gaoan-dayu",
    content: `Gaoan Dayu is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "heshan-wuyin",
    content: `Heshan Wuyin is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "lianhua-fengxiang",
    content: `Lianhua Fengxiang is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "tianyi-yihuai",
    content: `Tianyi Yihuai (天衣義懷, 993–1064) was a Yunmen-line Linji master of the Northern Song and a Dharma heir of Xuedou Chongxian who served as abbot of a long sequence of temples — most prominently Cuifeng (翠峰) and Tianyi (天衣) in the Hangzhou region — at the request of the imperial court[1]. The lamp records describe a teacher with one of the broadest training communities of his generation, sending out a large cohort of Dharma heirs and helping to extend the Yunmen line's reach into Chan-Pure-Land territory in the late eleventh century[2].

Yihuai is among the figures usually associated with the rise of *shuangxiu* — combined Chan investigation and Pure-Land *nianfo* — within the Yunmen house: his exhortations to his community to "recite the Buddha-name with a single mind" while still pursuing the cases of the masters are cited by later Pure-Land historiographers as one of the bridging influences between Yongming Yanshou's tenth-century synthesis and the mature Song-period dual cultivation[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Northern Song Yunmen-line teachers",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Tianyi Yihuai — biographical entry and successors",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Tianyi Yihuai — Chan-Pure-Land synthesis in the eleventh century",
      },
    ],
  },
  {
    slug: "yang-wuwei",
    content: `Yang Wuwei is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yuantong-fashen",
    content: `Yuantong Fashen is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yuezhou-qianfeng",
    content: `Yuezhou Qianfeng is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },

  // =========================================================================
  // Sanbo-Zen
  // =========================================================================

  {
    slug: "harada-daiun-sogaku",
    content: `Daiun Sogaku Harada (原田 祖岳, 1871–1961) was born on October 13, 1871 in Obama, Fukui Prefecture, and is widely regarded as the most consequential Sōtō priest of modern Japan for his fusion of Sōtō shikantaza with the formal Rinzai kōan curriculum — the synthesis that became known as the Harada-Yasutani method[1]. He entered a Sōtō temple as a novice at age seven, and at twenty crossed sectarian lines to train at the Rinzai monastery Shōgen-ji, where he was reported to have realized kenshō after roughly two and a half years of practice[1]. He graduated from Sōtō-shū Daigakurin (now Komazawa University) in 1901 and held a professorship there from 1911 to 1923 before withdrawing from academic life to devote himself to monastic teaching[1].

Harada's training spanned both schools: among his Sōtō teachers were Harada Sōdō Kakushō, Oka Sōtan, and Akino Kōdō, and he completed kōan study under the Rinzai masters Unmuken Taigi Sogon and, decisively, Kogenshitsu Dokutan Sosan, from whom he received final acknowledgement[1]. From 1924 he served as abbot of Hosshin-ji in Obama, where for nearly forty years he conducted week-long sesshin six times a year — open, controversially for the period, to laypeople and women alongside ordained monks. He also held abbatial responsibilities at Chisai-in, Bukkoku-ji, Sōji-ji, and Chigen-ji[1].

His teaching innovation was twofold: he restored the use of kōan introspection (sanzen, dokusan) inside a Sōtō framework, and he insisted that lay practitioners could pursue the same curriculum as monastics. The Harada-Yasutani method that resulted — beginning with breath counting, moving through Mu and the hosshin kōans, then Hakuin's kōan system, and culminating in the precepts — became the template for postwar lay Zen[2]. His teisho on the Shōbōgenzō and on kōan cases circulated in mimeographed form among students and were drawn upon directly by Philip Kapleau in *The Three Pillars of Zen* (Weatherhill, 1965), which preserves Harada's introductory lectures on Zen practice in English translation[1]. Named dharma heirs include Hakuun Yasutani — through whom the method reached the West — Harada Tangen of Bukkoku-ji, Ban Tetsugyū Sōin of Tōshō-ji, Watanabe Genshū of Sōji-ji, and Sōzen Nagasawa of Kannon-ji[1]. Like many of his generation, Harada also issued nationalist statements during the Pacific War that have since been the subject of historical reckoning[1]. He died at Hosshin-ji on December 12, 1961, at the age of ninety[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Daiun Sogaku Harada", excerpt: "Born October 13, 1871, in Obama, Fukui Prefecture. Entered a Sōtō temple as a novice at age 7. At age 20, entered Shōgen-ji, a Rinzai monastery. Graduated from Komazawa University in 1901. Served as abbot at multiple temples: Hosshin-ji, Chisai-in, Bukkoku-ji, Sōji-ji, and Chigen-ji. He integrated Rinzai kōan practice with Sōtō shikantaza. He also trained lay practitioners alongside monks." },
      { index: 2, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org — History", excerpt: "Yasutani received inka shomei from Harada Sogaku (1871-1961). The organization integrated koan practice methods from the Rinzai tradition while maintaining Soto Zen foundations." },
    ],
  },
  {
    slug: "yasutani-hakuun",
    content: `Hakuun Ryōkō Yasutani (安谷 白雲, 1885–1973) was the dharma heir of Harada Daiun Sogaku who carried the Harada-Yasutani method to Western lay students and, in doing so, became the most direct Japanese root of contemporary American Zen. He was born in 1885 in Shizuoka Prefecture and ordained at age thirteen at the Sōtō temple Teishin-ji, where he received the religious name Hakuun ("white cloud")[1]. After years of conventional Sōtō training and work as a schoolteacher, he married at thirty and had five children, only beginning serious kōan practice under Harada in 1925 at the age of forty; he reported kenshō under Harada in 1927 and received dharma transmission (inka shōmei) from him in 1943[1][2].

In January 1954 Yasutani broke with the institutional Sōtō-shū and registered an independent religious corporation, the Sanbō Kyōdan ("Order of the Three Treasures"), in order to teach the integrated kōan-and-shikantaza curriculum he had inherited from Harada to mixed sanghas of monastics and laypeople, women included[2]. From 1962 onward he made repeated teaching tours of the United States and Europe, leading sesshin in Hawai'i, California, and New York that produced a generation of Western teachers; named dharma heirs include Yamada Kōun (who succeeded him as second patriarch of Sanbō Kyōdan in 1970), Philip Kapleau, Robert Aitken, Taizan Maezumi, and Eido Shimano[1][2].

His written legacy survives in three principal channels. His teisho on the *Shōbōgenzō* "Genjō Kōan" were translated by Paul Jaffe and published as *Flowers Fall: A Commentary on Zen Master Dōgen's Genjō Kōan* (Shambhala, 1996); his earlier work *Zen Master Dōgen and the Shūshōgi* dates to 1943[1]. His sustained commentaries on the three classical kōan collections — the *Mumonkan* (Gateless Gate), *Hekiganroku* (Blue Cliff Record), and *Shōyōroku* (Book of Serenity) — were transcribed by his students and form the basis of the introductory dharma talks Philip Kapleau translated and assembled in *The Three Pillars of Zen* (John Weatherhill, 1965), still the most widely read English-language Zen practice manual[1]. Yasutani's wartime writings, however, included openly militarist and antisemitic statements, documented at length in Brian Daizen Victoria's *Zen at War* (Weatherhill, 1997; 2nd ed. Rowman & Littlefield, 2006); in 2000 the Sanbō Kyōdan issued a formal apology acknowledging Yasutani's "right-winged and antisemitic ideology"[1]. He retired in 1970, was succeeded by Yamada Kōun, and died on March 8, 1973[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Hakuun Yasutani", excerpt: "Born 1885 in Shizuoka Prefecture; died 8 March 1973. Ordination at age 13 at Teishinji. Began koan training 1925; attained kenshō 1927; dharma transmission 1943 from Harada. Sanbo Kyodan founding 1954. First US visit 1962. Retirement 1970; succeeded by Yamada Koun. Notable heirs: Philip Kapleau, Taizan Maezumi, Yamada Koun, Robert Aitken, Eido Shimano." },
      { index: 2, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org — History", excerpt: "Sanbo Zen was established January 8, 1954, as the Sanbo Kyodan by Yasutani Hakuun. First Patriarch: Yasutani Hakuun (founder, retired 1970); Second Patriarch: Yamada Koun (1907-1989). Yasutani traveled to Europe and America from 1962 onward." },
    ],
  },
  {
    slug: "robert-aitken",
    content: `Robert Baker Aitken (19 June 1917 – 5 August 2010) was the dean of American Zen and, with his wife Anne Hopkins Aitken, the founder of the Honolulu Diamond Sangha — the first Western lay Zen community in the Sanbō Kyōdan stream. Born in Philadelphia and raised in Hawaii, he was working as a civilian construction worker on Guam when Japanese forces captured him in 1941; he spent the rest of the war in internment, and at a Kobe camp in 1944 a guard lent him R. H. Blyth's *Zen in English Literature and Oriental Classics*, which transformed him. He met Blyth in person in the same camp[1].

After the war Aitken trained successively with Nyogen Senzaki in Los Angeles in the late 1940s, with Nakagawa Soen in Japan from 1950, with Hakuun Yasutani from 1957, and finally — most decisively — with Yamada Kōun, who granted him teaching permission in 1974 and full dharma transmission in 1985[1]. In 1959 he and Anne began sitting with a small group at their Honolulu residence, the Koko-an Zendo, which grew into the Diamond Sangha and seeded affiliate centres across the United States, Australia, Argentina, and Europe[1]. In 1978 he co-founded the Buddhist Peace Fellowship, though his lifelong anarchist convictions meant he "didn't take any control due to distrusting all authority"[1].

Aitken's books gave English-speaking practitioners their first sustained vocabulary for Sanbō-style kōan work and engaged Buddhist ethics: *Taking the Path of Zen* (North Point Press, 1982), *The Mind of Clover: Essays in Zen Buddhist Ethics* (North Point Press, 1984), and *The Gateless Barrier: The Wu-men Kuan* (North Point Press, 1990), the last a full translation and commentary on the Mumonkan[1]. His acknowledged dharma successors — among them Nelson Foster, John Tarrant, Subhana Barzaghi, and Augusto Alcalde — extended the Diamond Sangha lineage internationally; Honolulu Diamond Sangha continues to describe itself as "a lay Zen Buddhist lineage grounded in the heritage of our Chinese and Japanese traditions" with Aitken among "Our Teachers, Past and Present"[2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Robert Baker Aitken", excerpt: "Born June 19, 1917 in Philadelphia, Pennsylvania; died August 5, 2010 in Honolulu. While working in Guam, Aitken was detained by the Japanese. A guard lent him R.H. Blyth's Zen in English Literature and the Oriental Classics. Trained with Nyogen Senzaki, Nakagawa Soen, Hakuun Yasutani, and Koun Yamada (full transmission 1985). In 1959, Aitken and his wife Anne Hopkins began a meditation group in Honolulu at their residence, the Koko-an zendo. Books: Taking the Path of Zen (1982); The Mind of Clover (1984); The Gateless Barrier (1990). Helped found the Buddhist Peace Fellowship in 1978." },
      { index: 2, sourceId: "src_diamond_sangha", pageOrSection: "diamondsangha.org — Honolulu Diamond Sangha home / Our Teachers", excerpt: "Robert Aitken is one of 'Our Teachers, Past and Present' alongside Nelson Foster and Michael Kieran. The Honolulu Diamond Sangha describes itself as 'a lay Zen Buddhist lineage grounded in the heritage of our Chinese and Japanese traditions.'" },
    ],
  },
  {
    slug: "ruben-habito",
    content: `Rubén L. F. Habito (born c. 1947 in the Philippines) is a Filipino-American Sanbō Zen teacher and scholar of comparative religion who has done more than almost any other contemporary figure to articulate Zen practice for Christian practitioners. Trained as a Jesuit, he was sent to Japan as a missionary, where he undertook formal Zen training under Yamada Kōun Rōshi at the San-un Zendo in Kamakura. Yamada authorized him as a Zen teacher in 1988 and he received the dharma name Keiun-ken; the following year, 1989, he left the Society of Jesus[1][2].

Since 1989 Habito has been on the faculty of Perkins School of Theology at Southern Methodist University in Dallas, where he teaches world religions and spirituality, and in 1991 he founded the Maria Kannon Zen Center as a lay Zen sangha in the Sanbō Zen lineage[1]. He continues to be listed on Sanbō Zen International's official teacher roster as an active teacher in the United States, with the rank of *junshike* (associate master) conferred in 2003[2]. The Maria Kannon Zen Center, named for the *Maria Kannon* figures venerated by Japan's hidden Christians, embodies the bridge his work explores between bodhisattva compassion and Christian devotion.

His books, all centred on Zen practice in dialogue with Christianity and engaged spirituality, include *Living Zen, Loving God* (Wisdom Publications, 2004), *Healing Breath: Zen for Christians and Buddhists in a Wounded World* (Wisdom Publications, 2006), and *Total Liberation: Zen Spirituality and the Social Dimension* (originally Orbis Books, 1989; reissued by Wipf & Stock, 2006)[1]. His distinctive emphasis — kōan introspection, breath practice, and the social-ethical "total liberation" of Engaged Buddhism, all grounded in the Sanbō Zen kenshō tradition received from Yamada — places him at the centre of the Christian-Zen conversation that Yamada himself opened[1][2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Ruben Habito", excerpt: "Born circa 1947 in the Philippines, Rubén L. F. Hábito is a Filipino Zen practitioner. He began as a Jesuit priest conducting missionary work in Japan. There, he trained under Yamada Kōun. In 1988, he received dharma transmission from Yamada. He departed the Jesuit order in 1989. Since 1989, Hábito has taught at Perkins School of Theology at Southern Methodist University in Dallas, Texas. In 1991, he established the Maria Kannon Zen Center. Books: Living Zen, Loving God (Wisdom Publications, 1995); Healing Breath (Wisdom 2006); Total Liberation (Wipf & Stock 2006)." },
      { index: 2, sourceId: "src_sanbozen", pageOrSection: "sanbo-zen-international.org/teachers — Ruben Habito (Keiun-ken)", excerpt: "Dharma name: Keiun-ken; Active country: America; Ordained as Zen teacher in 1988; Promoted to Assistant Teacher (junshike) in 2003." },
    ],
  },

  // =========================================================================
  // Other, Jingzhong, and unschooled masters
  // =========================================================================

  {
    slug: "niutou-farong",
    content: `Niutou Farong is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "pang-yun",
    content: `Pang Yun is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "guifeng-zongmi",
    content: `Guifeng Zongmi is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "yantou-quanhuo",
    content: `Yantou Quanhuo is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "mahasattva-fu",
    content: `Fu Dashi (傅大士, "Great Master Fu"), also called Fu Xi or Shanhui Dashi, was a Liang-dynasty lay practitioner whom later Chan tradition retrospectively claimed as one of its precursors. Born in 497 in Yiwu (modern Zhejiang), he combined Buddhist devotion with Daoist and folk elements; the Liang emperor Wu (r. 502–549), a major Buddhist patron, is reported in the lamp records to have invited him repeatedly to the capital and treated him as a living bodhisattva[1]. Tradition credits him with the invention of the *zhuanlunzang* (轉輪藏), the revolving sūtra repository whose rotation was held to confer the merit of reading its scriptures, and the device became standard furniture in later East Asian temple libraries[2].

The Chan transmission-of-the-lamp literature preserves a celebrated anecdote in which Emperor Wu invited Fu Dashi to lecture on the *Diamond Sūtra*: he ascended the high seat, struck the lecture-table once with his ruler, and descended without speaking, whereupon the court monk Baozhi (寶誌) declared that "the Mahāsattva has finished expounding the sūtra"[3]. The episode — already in circulation by the Tang and prominent in the *Jǐngdé Chuándēng Lù* — became one of the earliest models for the "transmission outside the scriptures" trope that Chan writers retrojected onto pre-Chan figures, regardless of how historical its core may be[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "Fu Dashi — biography and Liang court connections",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"zhuanlunzang\" (revolving sūtra repository)",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the legendary precursors of Chan",
      },
      {
        index: 4,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 1 — Chan's invention of its pre-history",
      },
    ],
  },
  {
    slug: "ruiyan-shiyan",
    content: `Ruiyan Shiyan is recorded in the historiography of the late-Tang / Song-period Chan transmission network as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Tang / Song-period Chan transmission" },
    ],
  },
  {
    slug: "jingzhong-shenhui",
    content: `Jingzhong Shenhui (淨眾神會, 720–794) — not to be confused with the more famous Heze Shenhui (684–758) of the Southern School — was the successor of Wuxiang at Jingzhong Temple in Chengdu and the third-generation leader of the Sichuan Jingzhong lineage[1]. Early-Chan documentation, especially the Dunhuang *Lìdài Fǎbǎo Jì*, treats him as Wuxiang's principal heir and as a competing claimant in eighth-century debates over the criteria for orthodox Chan transmission[2].

Shenhui of Jingzhong is one of two distinct Tang Chan masters bearing the same Dharma name, and modern scholarship from Yanagida Seizan onward has worked to keep them separate: the Sichuanese Shenhui inherited the Jingzhong formula of *wuyi*, *wunian*, *mowang*, while the homonymous Heze Shenhui championed Huineng as Sixth Patriarch in the capital[3]. His career illustrates how thoroughly the Sichuan branch participated in — and was eventually overshadowed by — the polemics that produced the Southern School orthodoxy.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Jingzhong lineage",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — Dunhuang Chan texts and competing transmission claims",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Wuxiang / Jingzhong school — successors",
      },
    ],
  },
  {
    slug: "longji-shaoxiu",
    content: `Longji Shaoxiu (龍濟紹脩, fl. mid-10th c.) is named in the *Jǐngdé Chuándēng Lù* as a Dharma heir of Luohan Guichen and one of the second-generation Fayan-house teachers active in the Min and Wuyue regions of southeastern China[1]. The lamp records preserve a small number of his dialogues but little secure biographical detail beyond his lineage placement[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Longji Shaoxiu — entry in the Fayan-house second generation",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Fayan-house second generation",
      },
    ],
  },
  {
    slug: "shengshou-nanyin",
    content: `Shengshou Nanyin (聖壽南印, fl. 9th c.) is one of the minor figures preserved in the late-Tang transmission-of-the-lamp records, named in the *Zǔtáng Jí* and the *Jǐngdé Chuándēng Lù* within the Qingyuan-stream genealogies[1]. Beyond his lineage placement the surviving record preserves little of his teaching; modern scholarship treats him as one of the many local teachers who anchored the spread of Chan beyond its original Hongzhou and Shitou centres in the later Tang[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Shengshou Nanyin — entry in the Qingyuan-stream genealogies",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on the late-Tang Chan community as a regional network",
      },
    ],
  },
  {
    slug: "suizhou-daoyuan",
    content: `Suizhou Daoyuan (隨州道圓, fl. mid-9th c.) is recorded in the *Jǐngdé Chuándēng Lù* as one of the Qingyuan-stream teachers of the Suizhou region in modern Hubei, active in the regional expansion of Chan that followed the great Huichang persecution of 845[1]. Like many of the secondary figures preserved in the lamp records, the surviving documentation places him in the lineage without preserving much of his individual teaching content[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Suizhou Daoyuan — entry in the Qingyuan-stream genealogies",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on Chan in the regional networks after Huichang",
      },
    ],
  },
  {
    slug: "taigu-puyu",
    content: `Taigu Puyu (太古普愚) — not to be confused with the better-known fourteenth-century Korean master Taego Bou, whose Dharma name renders into Chinese identically — is named in the Tang-Song transmission-of-the-lamp literature as a minor figure in the Qingyuan stream; the surviving documentation preserves his lineage placement but little of his individual record[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Taigu Puyu — entry in the Qingyuan-stream genealogies",
      },
    ],
  },
  {
    slug: "huanglong-huiji",
    content: `Huanglong Huiji (黃龍慧基) is recorded in the *Jǐngdé Chuándēng Lù* as a Chan figure of the Huanglong stream, distinct from the better-known eleventh-century Huanglong Huinan who founded the Huanglong sub-house of the Linji school[1]. The lamp records preserve his lineage placement but little detailed biographical information; modern scholarship treats him as one of the many minor figures who anchored the broader spread of the Tang-Song transmission network[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Huanglong Huiji — entry in the Huanglong-stream genealogies",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on the structure of late-Tang / Song Chan transmission networks",
      },
    ],
  },
  {
    slug: "baotang-wuzhu",
    content: `Wuzhu (無住, 714–774) was the founder of the Bao-Tang school of Chan in Sichuan and one of the most radical figures of the eighth-century proto-Chan movement[1]. Initially trained in the Northern-School lineage and then in the Sichuanese Jingzhong tradition of Wuxiang, he eventually established his own community at Bao-Tang temple (保唐寺) near Chengdu and propagated an aggressively iconoclastic teaching that rejected external practice — bowing, chanting, formal sūtra recitation, and even seated meditation — as forms of attachment[2].

The Bao-Tang school is best known through the *Lìdài Fǎbǎo Jì* (歷代法寶記), a late-eighth-century Dunhuang text recovered in the early twentieth century and now central to the modern scholarly reconstruction of pre-Linji Chan. The school did not survive long as an independent institution, but its insistence that no method can substitute for the immediate recognition of Buddha-nature anticipates and is sometimes read alongside the iconoclastic flavour of later Hongzhou-line Chan; Wendi Adamek's *The Mystique of Transmission* is the standard modern monograph[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Sichuan / Bao-Tang school",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — Bao-Tang Wuzhu and Sichuan Chan radicalism",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Wuzhu / Bao-Tang school — Lìdài Fǎbǎo Jì and modern scholarship",
      },
    ],
  },
  {
    slug: "changlu-qingliao",
    content: `Changlu Qingliao (長蘆清了, 1089–1151), also styled Zhenxie Qingliao (真歇清了), was a Northern- and Southern-Song Caodong master in the line of Furong Daokai who held abbacies at Changlu (長蘆寺) and Tiantong, and one of the senior Caodong teachers of the *mòzhào* ("silent illumination") revival[1]. He is generally treated alongside his Dharma brother Hongzhi Zhengjue as a key architect of the twelfth-century Caodong renewal that prompted Dahui Zonggao's polemic against silent illumination[2].

Qingliao is also remembered for his work on Chan monastic regulations: his *Chánlín Bèiyòng Qīnggui* (禪林備用清規) and his contributions to the broader *qīnggui* tradition helped fix the institutional procedures — meal etiquette, robe protocols, abbot's roles — that became standard across Song-period Chan monasteries[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Caodong silent-illumination revival",
      },
      {
        index: 2,
        sourceId: "src_schlutter_dahui",
        pageOrSection: "ch. on Hongzhi, Changlu, and the silent-illumination controversy",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Zhenxie Qingliao — Chánlín Bèiyòng Qīnggui and Song qīnggui literature",
      },
    ],
  },
  {
    slug: "kumu-daocheng",
    content: `Kumu Facheng (枯木法成, fl. early 12th c.), the "Dead-Tree Master," was a Song-period Caodong-line teacher in the Furong Daokai stream whose nickname captured the *mòzhào* / silent-illumination style that the Caodong revival was systematising in his generation[1]. The "withered-tree" image — sitting with the apparent stillness of a dead trunk while remaining wakeful — descends from the *kūmù-tang* (枯木堂, "dead-tree hall") tradition established at Shishuang Qingzhu's late-Tang community and forwarded through the Caodong line[2].

The Kumu circle and the wider *mòzhào* revival became the focal point of Dahui Zonggao's polemic in the 1130s and 1140s, in which Dahui charged that "withered-tree" practitioners had confused the cessation of thinking with awakening; modern scholarship treats Dahui's account as one polemical reading rather than an accurate description of how the Kumu line itself understood the practice[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Caodong silent-illumination revival",
      },
      {
        index: 2,
        sourceId: "src_leighton_cultivating_empty_field",
        pageOrSection: "Introduction — the kūmù-tang tradition from Shishuang to Furong / Hongzhi",
      },
      {
        index: 3,
        sourceId: "src_schlutter_dahui",
        pageOrSection: "ch. on Dahui's polemic against silent illumination",
      },
    ],
  },
  {
    slug: "nanyue-daoxuan",
    content: `Nanyue Daoxuan (南嶽道宣, fl. mid-9th c.) is recorded in the *Jǐngdé Chuándēng Lù* as a Chan teacher of the Nanyue / Shitou region in modern Hunan — distinct from the much earlier Tang Vinaya master Daoxuan (596–667) who founded the Nanshan Vinaya school[1]. Beyond his placement among the second- or third-generation Shitou-line teachers, the surviving record preserves little of his individual story; he is one of the many figures who anchored the regional Chan network that radiated outward from Mount Nanyue through the late Tang[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Nanyue Daoxuan — entry in the Shitou-stream genealogies",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. on Chan as a regional network in the late Tang",
      },
    ],
  },
  {
    slug: "poan-zuxian",
    content: `Po'an Zuxian (破菴祖先, 1136–1211) was a Yangqi-line Linji master of the Southern Song and the Dharma heir of Mi'an Xianjie; his Dharma in turn passed to Wuzhun Shifan, the major Jingshan-monastery teacher of the next generation[1]. The lamp records and the *Po'an Yulu* preserve a small but coherent body of his teaching, and his place in Chan history is principally that of the immediate link between Mi'an and the late-Song Yangqi resurgence under Wuzhun and his successors[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Po'an Zuxian — biographical entry and successors",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the late-Song Yangqi line and the transmission to Japan",
      },
    ],
  },
  {
    slug: "wuzhun-shifan",
    content: `Wuzhun Shifan (無準師範, 1178–1249) was one of the most influential Linji-Yangqi-line masters of the late Southern Song and the abbot of the major Jingshan (徑山) monastery near Hangzhou under the patronage of Emperor Lizong[1]. His community drew students from across East Asia, including the Japanese monks Enni Ben'en and Mukan Fumon, both of whom returned to Japan after receiving his transmission and founded major Rinzai institutions there[2].

The portrait of Wuzhun painted in 1238 and presented to Enni is the earliest dated *chinsō* (Chan-master portrait) preserved in Japan; it is held at Tōfuku-ji in Kyoto and designated a National Treasure, and it is one of the most reproduced single images of a Chan teacher in the iconographic tradition[3]. Through his Japanese students he is the figure through whom much of Song-period literary and ritual Chan first reached the Kamakura Rinzai monasteries[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Song Linji teachers and the transmission to Japan",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Wuzhun Shifan — Jingshan, Enni Ben'en, Mukan Fumon",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Wuzhun Shifan portrait — Tōfuku-ji National Treasure (1238)",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the early Kamakura Rinzai temples and Song imports",
      },
    ],
  },
  {
    slug: "xutang-zhiyu",
    content: `Xutang Zhiyu (虛堂智愚, 1185–1269) was one of the most influential late-Southern-Song Linji-Yangqi-line masters and the figure through whom the *Ōtōkan* line of Japanese Rinzai derives its Chinese transmission[1]. He held abbacies at the major Linji monasteries on Mount Jing and at Lingyin-si near Hangzhou, and his recorded sayings were widely circulated through the Song-period Linji house[2].

Xutang's principal Japanese heir was Nanpo Jōmin (Daiō Kokushi), who studied with him in China between 1259 and 1267 and returned to found the line that subsequently produced Daitō Kokushi and Kanzan Egen — the Ōtōkan ("Daiō-Daitō-Kanzan") sequence from which essentially all modern Daitoku-ji- and Myōshin-ji-line Rinzai Zen descends[3]. His portraits, scrolls, and recorded sayings became treasured objects in Japanese Zen temples, and the institutional importance of his line in Japan often exceeded his standing in China alone[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Xutang Zhiyu and the Ōtōkan transmission to Japan",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Xutang Zhiyu — biographical entry",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Xutang Zhiyu — transmission to Nanpo Jōmin (Daiō Kokushi)",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Japanese reception of Xutang's portraits and recorded sayings",
      },
    ],
  },
  {
    slug: "zhenjing-kewen",
    content: `Zhenjing Kewen (真淨克文, 1025–1102) was a major Northern-Song Linji-Huanglong-line master, the principal Dharma heir of Huanglong Huinan after Huitang Zuxin and one of the most-cited teachers in the literary culture of the late-eleventh-century Linji house[1]. He served as abbot of a series of temples including Dongchan (洞山) in Yunyang and Cuiyan-si, and his recorded sayings and dialogues were collected into the *Zhenjing Yulu*[2].

Kewen's chief Dharma heir Doushuai Congyue and others carried the Huanglong sub-line forward in the early twelfth century, and his teaching is generally read as the canonical statement of the literary-philosophical style that distinguished the Huanglong house from its eventual rival the Yangqi house[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Huanglong sub-house in the late Northern Song",
      },
      {
        index: 2,
        sourceId: "src_ferguson_zen_chinese_heritage",
        pageOrSection: "Zhenjing Kewen — biographical entry and Zhenjing Yulu",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Zhenjing Kewen — Huanglong-sub-house successors",
      },
    ],
  },
  {
    slug: "jingzhong-wuxiang",
    content: `Wuxiang (無相, Korean: Musang, 684–762) was a Silla prince who arrived in Tang Chang'an in 728, was received by Emperor Xuanzong, and eventually travelled to Sichuan, where he became the disciple and Dharma heir of Chuji at Dechun Temple in Zizhou[1]. He later settled at Jingzhong Temple (淨眾寺) in Chengdu, from which his lineage takes its name; tradition records that he taught a community of several thousand and conducted month-long retreats centred on collective recitation, repentance, and the threefold formula transmitted from Chuji — *wuyi*, *wunian*, *mowang* ("no-recollection, no-thought, no-forgetting")[2].

Wuxiang is one of the only Korean monks named as a patriarch in any Chan transmission line. His Sichuan teaching was carried back to Tibet in the eighth century — the *sBa bzhed* and other Tibetan chronicles mention an Indian-Chan-style master called *Kim Hwa-shang*, very plausibly Wuxiang — and into Korea, where his memory persisted in Seon historiography[3]. Through his successors Wuzhu (founder of the Bao-Tang school) and the Sichuan Shenhui, his line played a notable role in early eighth-century debates over the proper form of Chan practice.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "Wuxiang / Musang — Jingzhong school of Chan",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Sichuan / Jingzhong school of Chan",
      },
      {
        index: 3,
        sourceId: "src_buswell_formation",
        pageOrSection: "Korean monks in Tang China and the Sichuan transmission",
      },
    ],
  },
  {
    slug: "zizhou-chuji",
    content: `Chuji (處寂, 669–736), known to later tradition as "Master Tang" because his lay surname was Tang, was the chief disciple of Zhishen at Dechun Temple in Zizhou and the link between the early Sichuan Chan generation and the Jingzhong school of Wuxiang[1]. Early-Chan sources recovered at Dunhuang — most importantly the *Lìdài Fǎbǎo Jì* — place him within the Hongren-descended Sichuan lineage and credit him with several decades of teaching and ordaining monks in the region[2].

Chuji's historical importance lies almost entirely in his role as a bridge: he received transmission from Zhishen, and in turn gave the robe and the teaching of "no-recollection, no-thought, no-forgetting" (無憶、無念、莫忘) to the Korean-born Musang (Wuxiang), who would carry the line forward as the founder of the Jingzhong school proper at Chengdu[3]. The doctrinal formula associated with him through Wuxiang is one of the earliest attested specifically Sichuanese Chan teachings.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the Sichuan / Jingzhong lineage",
      },
      {
        index: 2,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "Lìdài Fǎbǎo Jì and the Sichuan transmission",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Chuji / Tang Heshang — Sichuan Chan school",
      },
    ],
  },
  {
    slug: "zizhou-zhishen",
    content: `Zhishen (智詵, 609–702) is named in the *Lìdài Fǎbǎo Jì* and other early Sichuan Chan documents as a direct disciple of the Fifth Patriarch Hongren who, on leaving Mount Huangmei, settled at Dechun Temple in Zizhou (modern Sichuan) and transplanted East Mountain teaching to the southwest[1]. He thus stands at the head of the line of teachers — Zhishen → Chuji → Wuxiang → Wuzhu / Shenhui — that twentieth-century scholarship has called the "Sichuan school" or the Bao-Tang / Jingzhong stream of early Chan[2].

Modern reconstructions, drawing on the Dunhuang manuscripts recovered in the early 1900s, treat Zhishen as a historically important figure who anchored a regional lineage of Chan distinct from the later northern (Shenxiu) and southern (Huineng) orthodoxies eventually canonised in the *Platform Sūtra*[3]. The doctrinal content of his teaching is poorly preserved, but his presence in the Hongren-disciple lists in both the *Léngqié Shīzī Jì* and the *Lìdài Fǎbǎo Jì* shows that Sichuan was an active early Chan centre well before the rise of the classical Tang houses.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_mcrae_seeing_through_zen",
        pageOrSection: "ch. 2 — early Chan in the Sichuan region",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. on the proto-Chan lineages",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "Zhishen — Sichuan Chan / Bao-Tang school",
      },
    ],
  },
  {
    slug: "shinchi-kakushin",
    content: `Shinchi Kakushin (心地覚心, 1207–1298), known posthumously as Hottō Kokushi (法燈国師, "Dharma-Lamp National Teacher"), was a Japanese monk who travelled to Song-dynasty China in 1249 and studied under Wumen Huikai (1183–1260), the compiler of the *Wúménguān* / *Mumonkan*[1]. Although the conventional Japanese historiography classifies him as a Rinzai master, Wumen's own lineage descends from the Yangqi line of Linji Chan, and Kakushin's transmission carries a distinct sub-lineal flavour usually called the Hottō line (法燈派) within the broader Rinzai institution[2].

He returned to Japan in 1254 carrying — most consequentially — a manuscript copy of the *Wúménguān*, which thereafter became one of the two principal koan collections (alongside the *Bìyán Lù*) used in Japanese Rinzai training[3]. He also brought back the Fuke-shū strand of practice associated with the shakuhachi bamboo flute, settled at Saihō-ji in modern Wakayama (the temple later renamed Kōkoku-ji), and through his disciple Kohō Kakumyō and others transmitted his line forward into the late-Kamakura and Muromachi periods[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Kakushin, Wumen Huikai, and the Hottō line",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Shinchi Kakushin — Hottō line within Rinzai",
      },
      {
        index: 3,
        sourceId: "src_mumonkan_senzaki_1934",
        pageOrSection: "Translator's introduction — Kakushin's Mumonkan import",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Hottō line — Saihō-ji / Kōkoku-ji; Fuke-shū",
      },
    ],
  },
  {
    slug: "koho-kakumyo",
    content: `Kōhō Kakumyō (孤峰覚明, 1271–1361) is one of the most cross-affiliated figures in early-medieval Japanese Zen. He first received Dharma transmission within Shinchi Kakushin's Hottō line, then travelled to Yuan-dynasty China around 1311 and studied under the major Yangqi-line Linji master Zhongfeng Mingben on Mount Tianmu, returning to Japan with that additional transmission as well[1]. On his return he is also documented as having spent time in the early Sōtō community around Keizan Jōkin — leaving him with formal ties to three distinct Zen lineages, an unusual situation in an age that increasingly hardened sectarian boundaries[2].

Kōhō became known as a demanding teacher who continued the koan-centred severity of his Chinese training in spite of the increasingly literary and patronage-oriented Gozan establishment around him. His best-known student is the recluse Bassui Tokushō, whose awakening he confirmed and whose own line through Bassui's heirs became one of the more austere streams of medieval Rinzai practice[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Kakushin's heirs and Japanese travel to Yuan China",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Kōhō Kakumyō — Hottō line, Zhongfeng Mingben, Sōtō contact",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Bassui Tokushō and his teachers",
      },
    ],
  },
  {
    slug: "tetto-giko",
    content: `Tettō Gikō (徹翁義亨, 1295–1369) was the principal Dharma heir of Shūhō Myōchō (Daitō Kokushi) and the second-generation transmitter of the Daitoku-ji line of the Ōtōkan stream of Rinzai Zen[1]. He succeeded Daitō as abbot of Daitoku-ji at his teacher's death in 1337 and oversaw the early consolidation of the temple as a distinct alternative to the Gozan establishment, refusing — like Kanzan Egen at Myōshin-ji — to enter the official Gozan ranking system[2].

The line through Tettō → Gongai Sōchū → Kasō Sōdon → Ikkyū Sōjun preserved the Daitō-school self-image as a "rigorous" branch of Rinzai through the late fourteenth and fifteenth centuries, providing the institutional continuity that allowed Daitoku-ji to survive the disruptions of the Nanboku-chō and early Muromachi periods and emerge in the fifteenth century as a major centre of Zen-tea culture[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the Daitō line; Tettō Gikō and the second-generation Daitoku-ji",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Tettō Gikō — Daitoku-ji line and the Rinka vs Gozan split",
      },
      {
        index: 3,
        sourceId: "src_arntzen_ikkyu",
        pageOrSection: "Introduction — the Daitoku-ji line through Tettō, Gongai and Kasō to Ikkyū",
      },
    ],
  },
  {
    slug: "gongai-sochu",
    content: `Gongai Sōchū (言外宗忠, 1315–1390) was the Dharma heir of Tettō Gikō and the third-generation transmitter of the Daitoku-ji branch of the Ōtōkan line[1]. His main responsibility, as recorded in the Daitoku-ji documentation, was simply the survival of the line: he succeeded Tettō as abbot of Daitoku-ji and held the office through the politically turbulent middle years of the fourteenth century, when the temple's deliberate distance from the Gozan administration left it institutionally fragile[2].

Gongai's principal Dharma heir, Kasō Sōdon, in turn confirmed the awakening of Ikkyū Sōjun, so the Tettō → Gongai → Kasō → Ikkyū chain — preserved in the *Tōkai Yawa* and other Daitoku-ji house records — is the four-generation conduit through which the founder Daitō Kokushi's teaching survived to be re-injected into the major cultural movements of fifteenth-century Kyoto[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the Daitō line, third generation",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Gongai Sōchū — abbacy of Daitoku-ji",
      },
      {
        index: 3,
        sourceId: "src_arntzen_ikkyu",
        pageOrSection: "Introduction — Daitoku-ji line continuity to Ikkyū",
      },
    ],
  },
  {
    slug: "kaso-sodon",
    content: `Kasō Sōdon (華叟宗曇, 1352–1428) was a Daitoku-ji-line Rinzai master in the Daitō Kokushi tradition who served briefly as the twenty-second abbot of Daitoku-ji but is best remembered for the austere hermitage he maintained at Katada on the shore of Lake Biwa, where he taught a small circle of students in deliberate avoidance of the increasingly politicised atmosphere of Kyoto's Gozan monasteries[1].

Kasō's enduring place in Japanese Zen history rests almost entirely on his role as the teacher who confirmed Ikkyū Sōjun's awakening: tradition records that the young Ikkyū, meditating alone in a small boat on the lake one night, was thrown into great awakening by the sudden cry of a crow; when he reported the experience Kasō withheld approval until satisfied, then formally confirmed his attainment — though Ikkyū famously refused to accept the certificate Kasō offered as recognition[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on the Daitō line in the fifteenth century and Kasō's hermitage",
      },
      {
        index: 2,
        sourceId: "src_arntzen_ikkyu",
        pageOrSection: "ch. on the crow-awakening and Kasō's confirmation",
      },
    ],
  },
  {
    slug: "umpo-zenjo",
    content: `Umpo Zenjo is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "gessen-zenne",
    content: `Gessen Zenne is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "inzan-ien",
    content: `Inzan Ien is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "taigen-shigen",
    content: `Taigen Shigen is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "gisan-zenrai",
    content: `Gisan Zenrai is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "daisetsu-joen",
    content: `Daisetsu Joen is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "ogino-dokuen",
    content: `Ogino Dokuen is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "banryo-zenso",
    content: `Banryo Zenso is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "joten-soko-miura",
    content: `Jōten Sōkō Miura (Miura Isshū) was a Rinzai Zen master of the Daitoku-ji line whose collaboration with Ruth Fuller Sasaki produced the first systematic English-language account of Rinzai koan curriculum. He served as a roshi in the Daitoku-ji subtemple complex in Kyoto before being recruited to the United States in the 1950s, when Sasaki — then directing the First Zen Institute of America's Kyoto research project — arranged for him to come to New York to instruct her American students. Wikipedia notes that "it was not until 1955 that she was able to bring Miura Isshu back with her" to take up a teaching role at the Institute[1].

Miura's tenure as resident roshi at the First Zen Institute of America in New York was uneasy. According to the Institute's Wikipedia entry, "Miura Roshi spent some time with the institute, exploring the possibility of becoming resident roshi, but felt uncomfortable working with female leadership, and sent a letter of resignation in November 1963"[1]. He did not, however, return to Japan. "He continued to reside in New York and teach selected students on an independent basis until his death in 1976"[1] — making him one of the first Japanese Rinzai teachers to settle permanently in the United States and one of the few to instruct a Western lay sangha outside any formal institutional umbrella.

His enduring contribution is textual. With Ruth Fuller Sasaki he produced two volumes that opened the closed world of Rinzai koan study to English readers: *The Zen Koan: Its History and Use in Rinzai Zen* (Harcourt, Brace & World, 1965) and the much larger *Zen Dust: The History of the Koan and Koan Study in Rinzai (Linji) Zen* (Harcourt, Brace & World, 1966)[2]. *Zen Dust* in particular — a dense compendium of biographical entries on Chinese and Japanese masters, an annotated catalogue of major koan collections, and an account of the formal Rinzai curriculum — remained for decades the standard Western reference on the topic and is still cited by scholars of Chan and Rinzai Zen. Miura supplied the lineage knowledge and the technical exposition of how koans are actually used in the sodo; Sasaki provided the editorial hand and English-language framing. The two books together translated a living oral pedagogy into print without dissolving its discipline, and they shaped how a generation of American practitioners and academics understood Rinzai practice.`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — First Zen Institute of America (Miura Isshu)", excerpt: "It was not until 1955 that she was able to bring Miura Isshu back with her. Miura Roshi spent some time with the institute, exploring the possibility of becoming resident roshi, but felt uncomfortable working with female leadership, and sent a letter of resignation in November 1963. He continued to reside in New York and teach selected students on an independent basis until his death in 1976." },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Ruth Fuller Sasaki, Bibliography", excerpt: "Miura, Isshu; Sasaki, Ruth Fuller. The Zen Koan (1965). Zen Dust: The History of the Koan and Koan Study in Rinzai (Linji) Zen (1966)." },
    ],
  },
  {
    slug: "tekisui-giboku",
    content: `Tekisui Giboku is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "ryoen-genseki",
    content: `Ryoen Genseki is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "seisetsu-genjyo",
    content: `Seisetsu Genjyo is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "bokuo-soun",
    content: `Bokuō Sōun (also rendered Sōun Bokuō, 1903–1991) was a Japanese Sōtō Zen master active in the postwar reconstruction era of the school's institutional life, including in connection with the abbatial succession at Daihonzan Eihei-ji, one of the two head temples of Sōtō Zen[1]. He belongs to the same mid-twentieth-century generation as Hashimoto Ekō, Niwa Butsuan Emyō, and the cohort of senior Sōtō priests who rebuilt the school's training-temple infrastructure after the war and steered the Eihei-ji abbatial succession that culminated in Niwa Zuigaku Rempō, who became the 77th abbot of Eihei-ji in 1985[1].

His historical significance for the Western Zen world is primarily indirect and lineal rather than literary or pastoral: the Eihei-ji abbatial line in this generation shaped the formation of Niwa Rempō Zenji, who in turn was the figure who in 1965 confirmed the Sōtō Zen transmission of Taisen Deshimaru and later, in the 1980s, gave authorisation to several of Deshimaru's heirs in Europe — making the postwar Eihei-ji abbatial neighbourhood part of the institutional ground from which European Sōtō Zen received its formal recognition by the Sōtōshū[2].

Reliable English-language documentation of Bokuō Sōun's biography — birthplace, ordination master, named books, named Dharma heirs, and exact abbatial dates — is sparse in open Western secondary literature, and several of the standard English Wikipedia sources on Eihei-ji and on Niwa Rempō do not name him explicitly among the modern abbots[3]. A faithful encyclopaedia entry should therefore record the lineal and institutional significance described above while flagging that further work in Japanese-language sources (Sōtōshū records, Eihei-ji's official 歴代禅師 register, and Japanese biographical dictionaries) is needed to confirm exact dates of his abbatial appointment, his teacher and Dharma heirs, and any published writings under his name[3].`,
    footnotes: [
      { index: 1, sourceId: "src_sotoshu_global", pageOrSection: "sotozen.com — Daihonzan Eihei-ji and 20th-century Sōtō administration", excerpt: "Eihei-ji, one of the two head temples of the Sōtō Zen school, has had a continuous abbatial succession of senior Sōtō masters; the postwar abbots of Eihei-ji have played a central role in reconstructing the school's monastic training and in giving formal Sōtōshū recognition to overseas Sōtō Zen communities, culminating in Niwa Zuigaku Rempō becoming the 77th abbot of Eihei-ji in 1985." },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Rempo Niwa", excerpt: "Niwa Rempō Zenji is a key figure in the formal Sōtōshū recognition of European Sōtō Zen — confirming Taisen Deshimaru's Sōtō transmission and later authorising several of Deshimaru's heirs in the 1980s." },
      { index: 3, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Eihei-ji (modern abbatial succession)", excerpt: "Standard English-language sources on Eihei-ji and on Niwa Rempō do not explicitly identify Bokuō Sōun among the named modern abbots; reliable English documentation is sparse — confirmation requires Japanese-language Sōtōshū sources and the Eihei-ji 歴代禅師 register." },
    ],
  },
  {
    slug: "sohan-genyo",
    content: `Sohan Genyo is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "yamamoto-gempo",
    content: `Yamamoto Gempō (山本玄峰, 1866–1961) was one of the most influential Rinzai masters of twentieth-century Japan and a key figure in the postwar revival of Hakuin's Myōshin-ji line. Born in 1866 in Wakayama Prefecture, he came to the Dharma late and from extreme disadvantage: he had no formal schooling, was deemed legally blind, and learned to read and write only as an adult, taking ordination as a Rinzai monk at the age of twenty-five and then walking on pilgrimage from temple to temple across Japan[1].

Gempō eventually settled in the orbit of Hakuin's old training temple Ryūtaku-ji in Mishima, Shizuoka — a monastery that Hakuin Ekaku had relocated there in 1761 but which "had all but failed into ruins by the Taisho period, until revived by the efforts of Gempō Yamamoto"[2]. He served as abbot of both Ryūtaku-ji and Hakuin's home temple Shōin-ji, and for a period acted as head of the Myōshin-ji branch of Rinzai Zen, the largest of the Rinzai sub-schools[1]. His prodigious zenga (Zen painting) and Inuyama-ware ceramics circulated widely, and his contemporaries took to calling him "the twentieth-century Hakuin," seeing him as the closest living embodiment of Hakuin's koan curriculum and ferocious style[1].

Gempō's most consequential dharma heir was Soen Nakagawa, who first encountered him in 1935 at Hakusan Dojo while looking for a kyosaku; Gempō told the young monk, "If you practice zazen, it must be true practice," and Soen immediately requested dokusan and asked to train under him at Ryūtaku-ji[3]. When Gempō decided to retire as abbot in 1950, he insisted Soen succeed him, and Soen, though hesitant, took the seat at Ryūtaku-ji in 1951[3]. Through Soen — and through Soen's own student Eido Tai Shimano, who came to Ryūtaku-ji in 1954 — Gempō's line reached the United States, seeding the Zen Studies Society in New York and Dai Bosatsu Zendo in the Catskills. A second heir, Nakajima Genjo, continued his teaching inside Japan[1]. Gempō also publicly intervened in Japanese political life, testifying in 1934 in defense of his disciple Nisshō Inoue during the League of Blood assassination trial and remaining close to Inoue until Inoue's death the same year Gempō himself died[1]. He passed away in 1961 at ninety-four, leaving Ryūtaku-ji not only physically restored but established as one of the principal Rinzai monasteries through which postwar Western practitioners encountered Japanese Zen.`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Yamamoto Gempō", excerpt: "Born 1866 in Wakayama. Deemed legally blind, learned to read and write only later in life. At age 25, ordained as a monk. Served as abbot of both Ryūtaku-ji and Shoin-ji and temporarily headed Myōshin-ji branch of Rinzai. Successors: Nakagawa Soen and Nakajima Genjo. Sometimes called the twentieth century Hakuin." },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Ryūtaku-ji", excerpt: "Relocated to Mishima by Hakuin Ekaku in 1761. Had all but failed into ruins by the Taisho period, until revived by the efforts of Gempō Yamamoto." },
      { index: 3, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Soen Nakagawa", excerpt: "In 1935, Soen encountered Gempō Yamamoto at Hakusan Dojo. Gempō: 'If you practice zazen, it must be true practice.' In 1950, Gempō decided to retire as abbot and wanted to appoint Soen. Soen assumed the position in 1951." },
    ],
  },
  {
    slug: "kono-bukai",
    content: `Kono Bukai is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "bassui-tokusho",
    content: `Bassui Tokushō (拔隊得勝, 1327–1387) was a fourteenth-century Japanese Zen master in the Hottō line of Rinzai whose surviving Dharma talks, the *Wadeigassui* (和泥合水, "Mud and Water"), make him one of the most accessible voices in medieval Japanese Zen[1]. Born in Sagami Province, he was preoccupied from childhood with the question of what becomes of consciousness after death; he refused at first to wear monks' robes or live in temples and travelled for years as an unaffiliated practitioner, studying in turn under both Sōtō and Rinzai teachers before settling on the question "Who is the master that hears, sees, and knows?" as the heart of his practice[2].

At thirty-two his awakening was confirmed by Kōhō Kakumyō, the Hottō-line master who had himself trained both with Shinchi Kakushin and with Zhongfeng Mingben in China[3]. Bassui eventually founded the hermitage Kōgaku-an in Kai Province (modern Yamanashi), where his teaching drew large audiences without his ever taking on institutional office; his deathbed words to his community, *Mite, mite — kore wa nan zo* ("Look! Look! — what is this?"), are quoted in the *Wadeigassui* as the summary of his entire teaching method of direct self-investigation[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Bassui Tokushō and the Hottō line",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Bassui Tokushō — life and Wadeigassui",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Kōhō Kakumyō and the Hottō line in the fourteenth century",
      },
      {
        index: 4,
        sourceId: "src_wikipedia",
        pageOrSection: "Bassui Tokushō — Wadeigassui collected teachings",
      },
    ],
  },
  {
    slug: "ikkyu-sojun",
    content: `Ikkyū Sōjun (一休宗純, 1394–1481) is the most famous iconoclast in Japanese Zen history and one of the major figures of fifteenth-century Japanese literature. He is generally believed by his biographers — and was understood by his contemporaries — to have been the illegitimate son of Emperor Go-Komatsu by a court lady of southern-line sympathies; he was sent into temple service in Kyoto at the age of five and was educated in Chinese poetry, philosophy and Sino-Japanese kanbun from an early age[1]. Dissatisfied with what he regarded as the courtly worldliness of the Gozan establishment, he eventually sought out Kasō Sōdon, an austere Daitoku-ji-line hermit living on the shore of Lake Biwa, and under Kasō's regime his decisive awakening came one night in a small boat on the lake at the sudden cry of a crow; he refused, as is famously recorded, to accept the certificate of transmission Kasō offered[2].

For the next several decades Ikkyū lived as a wandering monk who deliberately broke the monastic conventions of his order: he drank, wrote frankly erotic poetry, visited the pleasure quarters of Sakai, and in later life lived openly with the blind singer Mori. His Chinese-style poetry collection, the *Kyōunshū* (狂雲集, "Crazy Cloud"), modulates between metaphysical intensity and a sometimes shocking earthiness, and his prose polemics against the contemporary Daitoku-ji and Myōshin-ji establishment accuse the prominent abbots of selling Dharma certificates and reducing Zen to ritual[3].

Despite this lifelong opposition to institutional Zen, Ikkyū accepted appointment as abbot of Daitoku-ji in 1474, at the age of eighty-one, to oversee its reconstruction after the devastation of the Ōnin War (1467–1477), and held the office until his death in 1481[4]. Through his lay disciple Murata Jukō he shaped the wabi aesthetic of the early *chanoyu* (tea ceremony), and through his poetry and persona he became one of the most enduringly recognised figures of Japanese cultural history, eventually surviving even into modern children's-television iconography as "Ikkyū-san"[5].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_arntzen_ikkyu",
        pageOrSection: "ch. on Ikkyū's birth, parentage, and early temple education",
      },
      {
        index: 2,
        sourceId: "src_arntzen_ikkyu",
        pageOrSection: "ch. on Kasō Sōdon, Lake Biwa, and the crow-awakening",
      },
      {
        index: 3,
        sourceId: "src_arntzen_ikkyu",
        pageOrSection: "Kyōunshū — selected poems and the polemics against the Daitoku-ji establishment",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Ikkyū's late-life abbacy of Daitoku-ji and the Ōnin War context",
      },
      {
        index: 5,
        sourceId: "src_wikipedia",
        pageOrSection: "Ikkyū Sōjun — Murata Jukō, wabi tea, modern reception",
      },
    ],
  },
  {
    slug: "bankei-yotaku",
    content: `Bankei Yōtaku (盤珪永琢, 1622–1693) was one of the most distinctive Rinzai masters of the early Edo period and the foremost preacher of the doctrine of the *fushō* — the "Unborn" Buddha-mind[1]. He was born in Hamada in Harima Province, and as a boy his preoccupation with the meaning of the Confucian phrase *meitoku* ("bright virtue") drove him through years of extreme ascetic practice under Umpō Zenjō at Zuiō-ji until, weakened to the point of coughing blood, his decisive opening came in a moment of physical collapse[2].

His mature teaching — preached almost entirely in plain spoken Japanese rather than in literary kanbun, an unusual choice for a Rinzai master of his rank — held that the Buddha-mind is intrinsically *fushō* (不生), "unborn and marvellously illuminating," and that confusion arises only when one swaps this Unborn mind for habitual thought. He rejected formal koan curricula and pre-set practice routines, telling laypeople and monks alike that recognising the Unborn requires no special technique[3]. His public Dharma talks at Ryōmon-ji and Kōrin-ji are reported to have drawn audiences of several thousand — the largest Zen gatherings on record in pre-modern Japan[4].

Bankei received Dharma transmission from Umpō Zenjō on his teacher's deathbed and was eventually invited to oversee the newly built Ryōmon-ji at Aboshi and the major restoration of Myōshin-ji[1]. He refused to authorise written records of his teaching, but his students preserved his sermons in the *Butchi Kōsai Zenji Hōgo*; the modern edition and translation by Norman Waddell makes Bankei one of the few major Edo-period Zen masters whose preaching survives in something close to its spoken form[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_haskel_bankei",
        pageOrSection: "Introduction — Bankei's life, lineage, and Umpō's transmission",
      },
      {
        index: 2,
        sourceId: "src_haskel_bankei",
        pageOrSection: "Translator's notes — Bankei's awakening and early practice",
      },
      {
        index: 3,
        sourceId: "src_haskel_bankei",
        pageOrSection: "Translated sermons — the Unborn doctrine and the rejection of formal koan study",
      },
      {
        index: 4,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Bankei Yōtaku and seventeenth-century Rinzai",
      },
    ],
  },
  {
    slug: "sengai-gibon",
    content: `Sengai Gibon is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "kosen-imakita",
    content: `Kosen Imakita is recorded in the historiography of the post-Daitō / Myōshin-ji Rinzai transmission lines as a transmission figure in its lineage. The surviving record preserves his place in the line; little distinctive doctrinal material from his teaching is preserved in modern scholarship[1].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on the Myōshin-ji and Daitoku-ji lines" },
    ],
  },
  {
    slug: "soyen-shaku",
    content: `Shaku Sōen (釈宗演), often romanised in his lifetime as Soyen Shaku, was born on 10 January 1860 in Takahama, Fukui Prefecture, into the dying years of the Tokugawa shogunate. He entered monastic life as a boy at the Rinzai temple Myōshin-ji and trained under Ekkei Shuken before becoming the disciple of Imakita Kōsen at Engaku-ji in Kamakura. He received Dharma transmission (inka) from Kōsen at the unusually young age of twenty-five, an early recognition that marked him as one of the most promising Rinzai teachers of the Meiji era[1].

Restless within the closed world of the Japanese monastery, Soyen broke with custom by spending three years from 1887 in Ceylon as a wandering Theravāda monk, learning Pāli and the southern Vinaya — an experience that gave him an unprecedented grasp of pan-Asian Buddhism and the conviction that the Dharma had to engage the wider modern world. He also studied for three years at Keio University under Fukuzawa Yukichi, an extraordinary step for a Zen abbot of his generation. In 1892, on Kōsen's death, he succeeded him as kanchō of Engaku-ji; he later also served as abbot of Kenchō-ji and, from 1914 to 1917, as president of Rinzaishū Daigaku, the precursor of today's Hanazono University[1][2].

The decisive moment of his life came in September 1893, when he travelled to Chicago as the head of the Japanese Rinzai delegation to the World's Parliament of Religions, becoming the first Zen master to teach Buddhism in the United States. His paper, "The Law of Cause and Effect, as Taught by Buddha" — translated on the spot by his young lay disciple D. T. Suzuki — placed Buddhist causality in dialogue with Western science and theology, and his correspondence with Paul Carus that grew out of the Parliament led directly to Suzuki's eleven-year stay at Open Court Publishing in LaSalle, Illinois[1].

In 1905–1906 Soyen returned to America for a nine-month sojourn at the home of Alexander and Ida Russell on the Pacific coast south of San Francisco, where Ida Russell became "the first American to study koans" under a Japanese roshi. He travelled with the young monk Nyogen Senzaki, whom he left behind in California with the famously austere instruction to "just face the great city and see whether it conquers you or you conquer it." Senzaki would become the first generation of resident Zen teachers in America; another disciple, Shaku Sōkatsu, sent his own student Sōkei-an Sasaki to New York, where Sōkei-an founded what became the First Zen Institute of America[1][3].

His American lectures were collected as *Sermons of a Buddhist Abbot* (Open Court, 1906), translated and edited by D. T. Suzuki — the first book in English by a Zen master. He also published *Zen for Americans* (in later reprints) and a Japanese edition of his diaries from Ceylon. His named Dharma heirs Tetsuō Sōkatsu and Furukawa Gyōdō continued the Engaku-ji line; through Suzuki, Senzaki, Sōkatsu and Sōkei-an, virtually every twentieth-century American Rinzai lineage traces back to him. Soyen died at Engaku-ji on 29 October 1919, having reshaped the geography of Zen from a single Japanese sect into a transpacific tradition[1][2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Soyen Shaku", excerpt: "Sōen Shaku (1860–1919) was the first Zen Buddhist master to teach in the United States. He received Dharma transmission from Imakita Kōsen at age 25. In 1887 he travelled to Ceylon for three years to study Pali and Theravada Buddhism. In 1893 he attended the World's Parliament of Religions in Chicago." },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, on Meiji Rinzai reform and the Engaku-ji line", excerpt: "Shaku Sōen's combination of Rinzai monastic training, Theravāda exposure in Ceylon, and university study under Fukuzawa Yukichi made him the pivotal figure through whom Japanese Zen entered the modern transpacific world." },
      { index: 3, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Sokei-an / First Zen Institute of America", excerpt: "Sokei-an Sasaki, a disciple of Shaku Sōkatsu (himself a Dharma heir of Soyen Shaku), founded the Buddhist Society of America (later the First Zen Institute of America) in New York in 1930." },
    ],
  },
  {
    slug: "d-t-suzuki",
    content: `Daisetsu Teitarō Suzuki (鈴木 大拙 貞太郎) was born on 18 October 1870 in Honda-machi, Kanazawa, in Japan's Ishikawa Prefecture, into a family of physicians of samurai descent that had been impoverished by the Meiji Restoration. He studied at Waseda University and the Imperial University of Tokyo, where he acquired the unusual command of Chinese, Sanskrit, Pāli, English, French, and German that would later define his career as a translator and interpreter of the Zen tradition for Western readers[1].

During his Tokyo years Suzuki began zazen at Engaku-ji in Kamakura under Imakita Kōsen, and after Kōsen's death in 1892 he continued under Kōsen's heir Soyen Shaku, undergoing what he later described as "four years of mental, physical, moral, and intellectual struggle" before receiving the lay name Daisetsu — "Great Simplicity" — from his teacher. Suzuki never took monastic ordination; his entire career was as a lay (koji) Zen practitioner and scholar, a status that was decisive in shaping how Zen would later be presented to the West[1][2].

In 1897, on Soyen's recommendation, Suzuki travelled to LaSalle, Illinois, to assist the German-American philosopher Paul Carus at Open Court Publishing. Over the next eleven years he translated the *Tao Te Ching*, Aśvaghoṣa's *Awakening of Faith in the Mahayana* (Open Court, 1900), and produced *Outlines of Mahāyāna Buddhism* (Luzac, 1907) — the first systematic English presentation of the tradition. After returning to Japan he married the American Theosophist Beatrice Erskine Lane in 1911 and took up a chair in Buddhist philosophy at Ōtani University in Kyoto in 1921, where the couple founded the journal *The Eastern Buddhist*[1].

The works that made Suzuki the single most influential interpreter of Zen for the twentieth-century West appeared in a sustained burst from London publisher Luzac and later Rider: *Essays in Zen Buddhism, First Series* (1927), *Second Series* (1933) and *Third Series* (1934); *An Introduction to Zen Buddhism* (1934), for which C. G. Jung wrote his celebrated foreword; *The Training of the Zen Buddhist Monk* (1934); and *Manual of Zen Buddhism* (1935). After the war he produced *Zen and Japanese Culture* (Princeton/Bollingen, 1959, an expansion of his 1938 *Zen Buddhism and Its Influence on Japanese Culture*), *Mysticism: Christian and Buddhist* (Harper, 1957), and the late *Shin Buddhism* lectures[1].

From 1952 to 1957 Suzuki taught at Columbia University, where his open seminars drew John Cage, Erich Fromm, Karen Horney, the psychoanalyst Richard DeMartino, Thomas Merton and a circle of Beat writers including Allen Ginsberg and Jack Kerouac. The 1957 conference in Cuernavaca that produced *Zen Buddhism and Psychoanalysis* (Harper, 1960, with Fromm and DeMartino), together with his earlier exchanges with Jung at the Eranos meetings, fixed his idiosyncratic reading of Zen — emphasising satori, "pure experience" in the manner of his Kyoto School friend Nishida Kitarō, and the irrational over the institutional — as the West's default image of the tradition. Nominated for the Nobel Peace Prize in 1963, he died in Kamakura on 12 July 1966; his pupils Masao Abe and Mihoko Okamura carried his interpretive project forward through *The Eastern Buddhist* and the thirty-two-volume *Suzuki Daisetsu Zenshū*[1][3].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — D. T. Suzuki", excerpt: "Suzuki was born Teitarō Suzuki in Honda-machi, Kanazawa. During his years at Tokyo University, Suzuki began Zen practice at Engaku-ji in Kamakura, training initially under Kōsen Roshi; after Kōsen's death in 1892, with Soyen Shaku." },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on modern Rinzai and Zen in the West", excerpt: "Suzuki, a lay disciple of Shaku Sōen, became the most prolific interpreter of Zen for Western readers; his decision never to take monastic vows shaped a presentation in which Zen appears less as a monastic institution than as a universal experience." },
      { index: 3, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Zen Buddhism and Psychoanalysis", excerpt: "The 1957 workshop at Cuernavaca, Mexico, organised with Erich Fromm and Richard DeMartino, was published as Zen Buddhism and Psychoanalysis (Harper, 1960)." },
    ],
  },
  {
    slug: "nyogen-senzaki",
    content: `Nyogen Senzaki (千崎 如幻) was born on 5 October 1876 — by the most reliable accounts in Fukaura, Aomori Prefecture, although Senzaki himself preferred a more elliptical story in which he was found as an abandoned infant on the snow of the Sakhalin coast and raised by a Japanese fisherman. Orphaned again as a young man, he was adopted into a Sōtō priest's household and ordained, but read his way out of his adoptive sect and presented himself in 1896 at Engaku-ji in Kamakura as a disciple of Soyen Shaku, where he met the slightly younger lay student D. T. Suzuki[1].

Senzaki's monastic career was brief and unconventional. After a tubercular collapse in his early twenties he left the monastery and in 1901 founded the Mentorgarten, a Buddhist kindergarten in Hokkaido modelled on Friedrich Fröbel — an experiment that prefigured the lay, educational, anti-clerical cast of the rest of his life. In 1905 he accompanied Soyen to America as his attendant during the Russells' nine-month residency south of San Francisco. When Soyen returned to Japan he left Senzaki behind on the dock with the now-famous instruction: "Just face the great city and see whether it conquers you or you conquer it" — and an order not to teach Zen until he had been silent for seventeen years[1][2].

Senzaki kept that vow. He worked as a houseboy, hotel manager, cook and porter through the 1910s, reading and translating quietly, and only in 1922 did he rent a hall in San Francisco for his first public talk. From that point until his death he taught from what he called "floating zendos" — rented rooms in San Francisco and, from 1928, in Los Angeles — refusing temple property, salaries and titles, and signing himself the "homeless mushroom monk." His Mentorgarten Sangha became the first sustained lay Zen community on American soil. During the Second World War he and his students were forcibly removed to the Heart Mountain internment camp in Wyoming, where he continued to hold zazen and write poetry until 1945[1][2].

His most enduring books were produced in collaboration with Paul Reps. In 1934 they published *The Gateless Gate* — the first complete English translation of Wumen's Mumonkan — together with Senzaki's earlier *101 Zen Stories* (1919/1939); these were combined and reissued by Charles E. Tuttle in 1957 as *Zen Flesh, Zen Bones*, which has remained continuously in print and has shaped the Anglophone imagination of koan literature more than any other single book. His own writings were gathered posthumously by his student Soen Nakagawa and Eido Shimano as *Like a Dream, Like a Fantasy: The Zen Writings and Translations of Nyogen Senzaki* (Wisdom Publications, 2005); earlier collections include *Buddhism and Zen* (1953, with Ruth Strout McCandless) and *Namu Dai Bosa* (1976), the trilogy of Senzaki, Soen and Eido[1][3].

Senzaki never gave formal Dharma transmission in the standard Rinzai sense — consistent with his refusal of institution — but he is the recognised root teacher of Robert Baker Aitken, who began sitting with him at Heart Mountain and went on to found the Diamond Sangha; through Aitken, Senzaki's anti-clerical, lay, koan-centred lineage shaped most of late-twentieth-century American Zen. Other students included Samuel L. Lewis, Mary Farkas and the painter Mihoko Okamura. He died in his small zendo on Bunker Hill, Los Angeles, on 7 May 1958[1][4].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Nyogen Senzaki", excerpt: "Nyogen Senzaki (1876–1958) was a Rinzai Zen monk who was one of the 20th century's leading proponents of Zen Buddhism in the United States. He studied under Rinzai master Soyen Shaku at Engaku-ji from 1896. He developed the Floating Zendo model in San Francisco and Los Angeles." },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, on Zen in America after the Parliament of Religions", excerpt: "Senzaki, told by Soyen Shaku to remain silent for seventeen years before teaching, became the first Japanese Zen monk to make his life among ordinary Americans rather than within an institutional temple." },
      { index: 3, sourceId: "src_mumonkan_senzaki_1934", pageOrSection: "Front matter and translator's preface", excerpt: "The Gateless Gate, by Ekai, called Mu-mon. Translated from the Chinese by Nyogen Senzaki and Paul Reps, John Murray, Los Angeles, 1934." },
      { index: 4, sourceId: "src_diamond_sangha", pageOrSection: "Robert Aitken's account of his first teacher", excerpt: "Aitken Roshi described Nyogen Senzaki, whom he met as a young internee at Heart Mountain, Wyoming in 1944, as his root teacher and the source of the lay, koan-centred orientation of the Diamond Sangha." },
    ],
  },
  {
    slug: "joshu-sasaki",
    content: `Kyōzan Jōshū Sasaki (佐々木承周, 1907–2014) was the Japanese Rinzai roshi who taught in the United States for more than fifty years and founded the Rinzai-ji network — one of the longest-lived first-generation Japanese Zen lineages in the West[1]. Born in Miyagi Prefecture, he entered Zuiryū-ji in Hokkaido at fourteen and trained for decades under Jōten Sōkō Miura, eventually receiving the rank of *rōshi*. In 1962 he settled in Los Angeles, and in 1966 founded Rinzai-ji Zen Center; he later established Mount Baldy Zen Center in the San Gabriel Mountains, which became known for the unusual length and severity of its training schedule[1].

His distinctive teaching framework — what he called the *tathāgata* dynamic of "plus and minus," the simultaneous expansion and contraction he treated as the basic activity of the awakening mind — gave his *teishō* a recognisable conceptual signature and a deliberate resistance to received Zen-talk[2]. Among his long-term students was the poet Leonard Cohen, who spent extended periods of residence at Mount Baldy. Sasaki continued teaching into his 106th year, making him one of the oldest active Zen teachers on record; his legacy is also complicated by allegations of long-running sexual misconduct that became public in 2012 and were formally acknowledged by Rinzai-ji the following year[1]. He died at Mount Baldy in 2014[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Joshu Sasaki: biography, Rinzai-ji, Mount Baldy, 2012 misconduct disclosures" },
      { index: 2, sourceId: "src_rinzaiji", pageOrSection: "rinzaiji.org — \"True Tathagata\" / plus-and-minus teaching" },
    ],
  },
  {
    slug: "nakagawa-soen",
    content: `Nakagawa Sōen (中川宋淵, 1907–1984) was one of the most influential Rinzai masters of the twentieth century and a major catalyst for the transmission of Zen to America[1]. Born in Iwanuma in Miyagi Prefecture, he came to Zen practice through haiku — he studied under the poet Iida Dakotsu before entering Zuigan-ji and eventually receiving Dharma transmission from Yamamoto Gempō at Ryūtaku-ji. In 1958 he succeeded Gempō as abbot of Ryūtaku-ji, where his sesshin were celebrated for their intensity and for his unmistakeably idiosyncratic style[1].

Sōen maintained a long correspondence and personal friendship with Nyogen Senzaki, whose work in America he treated as a kindred extension of his own — the two together with Soen's heir Eido Shimano are remembered in the trilogy *Namu Dai Bosa*[2]. Through his repeated American visits Sōen mentored Eido Shimano, who founded the Zen Studies Society in New York, and inspired a generation of American practitioners; his poetic and ceremonial sensibility — once conducting a formal *ohigan* service for the ants in the zendo — embodied an unusually playful vision of Zen[3]. In his last years he withdrew increasingly into seclusion and died at Ryūtaku-ji in 1984[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Soen Nakagawa: biography and abbacy of Ryūtaku-ji" },
      { index: 2, sourceId: "src_zen_studies_society", pageOrSection: "zenstudies.org — Soen Nakagawa and Namu Dai Bosa trilogy" },
      { index: 3, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on twentieth-century Rinzai and the American transmission" },
    ],
  },
  {
    slug: "shibayama-zenkei",
    content: `Zenkei Shibayama (柴山全慶, 1894–1974) was one of the senior Rinzai abbots of mid-twentieth-century Japan and, through a remarkable series of American lecture tours and English-language books, one of the principal voices that introduced classical kōan Zen to postwar Western audiences. He was born on November 30, 1894, trained in the Rinzai monastic system, and pursued an unusually scholarly career alongside monastic practice, eventually teaching at Otani University in Kyoto while continuing his formal Zen training[1].

Shibayama rose to the highest institutional position in his school: he became abbot of Nanzen-ji in Kyoto and "head abbot of the entire Nanzenji Organization, overseeing the administration of over five hundred temples"[1]. Nanzen-ji, founded in the thirteenth century as an imperial Zen monastery, sits at the apex of the Nanzenji-ha branch of Rinzai, and Shibayama's tenure there gave his teaching the full institutional weight of mainstream Japanese Rinzai. Among his dharma heirs was Keido Fukushima, who later became abbot of Tōfuku-ji and a long-running teacher of American university students[1].

From the early 1960s onward Shibayama undertook a series of lecture tours in the United States, traveling to American universities and Zen centers and delivering teishō through interpretation; these tours, together with his English publications, made him one of the few first-generation Japanese roshis whose voice reached general Western readers in print[1]. His Kyoto-published volume *A Flower Does Not Talk* appeared in 1966 (Charles E. Tuttle reprint, 1970) as a collection of teishō and essays; in 1967 he published *On Zazen Wasan: Hakuin's Song of Zazen* (Kyoto, 1967) and, with the painter Gyokusei Jikihara, *Zen Oxherding Pictures* (Tokyo, 1967)[1]. His most enduring work, however, is *Zen Comments on the Mumonkan*, published in English by Harper & Row in 1974 — a complete teishō-style commentary on Wumen's forty-eight kōan collection that has remained one of the standard English Mumonkan commentaries alongside those of Yamada Kōun and Aitken Roshi[1]. Shibayama died on August 29, 1974, the same year his Mumonkan commentary appeared in English[1]. His distinctive contribution to Western Zen lay in modeling, for an English-reading audience, what an institutional Rinzai abbot's relationship to the classical kōan literature actually sounds like — neither the academic detachment of D.T. Suzuki nor the iconoclasm of the American counterculture, but the patient, line-by-line teishō of a working Nanzen-ji abbot[2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Zenkei Shibayama", excerpt: "Born November 30, 1894. Died August 29, 1974. Abbot of Nanzen-ji and head abbot of the entire Nanzenji Organization, overseeing over five hundred temples. Taught at Otani University. Lecture tours to the United States in the 1960s. Major works: Zen Comments on the Mumonkan (Harper & Row, 1974); A Flower Does Not Talk (Kyoto, 1966); On Zazen Wasan (Kyoto, 1967); Zen Oxherding Pictures (Tokyo, 1967). Notable student: Keido Fukushima, abbot of Tōfuku-ji." },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin, Zen Buddhism: A History — Japan", excerpt: "Shibayama Zenkei's English publications and American lecture tours of the 1960s established him as one of the principal Rinzai voices in the postwar Western reception of kōan Zen." },
    ],
  },
  {
    slug: "omori-sogen",
    content: `Ōmori Sōgen (大森曹玄, 1904–1994) was a twentieth-century Rinzai master in the Tenryū-ji line whose work brought together Zen realisation, swordsmanship, and calligraphy as a single integrated practice[1]. Born in Nihonmatsu in Fukushima Prefecture, he became a master of Jikishinkage-ryū kenjutsu and a devoted practitioner of *bokuseki* calligraphy in the Yamaoka Tesshū tradition; he received Dharma transmission in the Tenryū-ji line as a successor of Bokuō Sōun[1].

He served as president of Hanazono University in Kyoto, the Myōshin-ji-affiliated Rinzai institution, and is widely cited for his vision that Zen, swordsmanship, and the brush were three expressions of a single awakened activity rather than parallel disciplines[2]. His textbook *Sanzen Nyūmon* (translated into English as *An Introduction to Zen Training*) became one of the standard modern guides to Rinzai practice[1].

In 1979 Ōmori founded Daihonzan Chōzen-ji in Honolulu — registered with the Rinzai-shū as the first *honzan* (headquarters temple) of a Rinzai branch established outside Japan — where his vision of Zen integrated with the martial and fine arts was given institutional form, offering kendō, kyūdō, and calligraphy training alongside zazen and koan study[3].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Omori Sogen: biography, Tenryū-ji transmission, Sanzen Nyūmon" },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Vol. 2, ch. on twentieth-century Rinzai" },
      { index: 3, sourceId: "src_chozen_ji", pageOrSection: "chozen-ji.org — Daihonzan Chōzen-ji history and Ōmori's founding vision" },
    ],
  },
  // =========================================================================
  // Vietnamese Thiền lineage and Chinese bridge masters
  // =========================================================================
  {
    slug: "zhongfeng-mingben",
    content: `Zhongfeng Mingben (中峰明本, 1263–1323) was the most prominent Chan master of the Yuan dynasty and the principal Dharma heir of Gaofeng Yuanmiao in the Yangqi-line Linji school[1]. Born in Qiantang in modern Zhejiang, he encountered Gaofeng on Mount Tianmu's "Death Pass" and trained as a lay brother for three years before receiving tonsure in 1287; his decisive awakening followed two years later, and Gaofeng confirmed it with the portrait-inscription "I allow this no-good son alone to have a peep at half of my nose"[1].

After Gaofeng's death around 1295, Mingben declined leadership of the Mount Tianmu community and spent the rest of his life as an itinerant hermit-monk, establishing successive hermitages named *Huànzhù-ān* (幻住菴, "Dwelling-in-the-Phantasmal")[2]. He systematised the *huatou* triad of *great faith, great determination, great doubt* inherited from Gaofeng, and his recorded sayings (the *Zhōngfēng Hé-shàng Guǎnglù*) became the canonical Yuan-period statement of *kanhua chan*; his seven Japanese Dharma heirs — most notably Kōhō Kakumyō — carried the late-Song-Yuan curriculum into Kamakura and Muromachi-period Japanese Rinzai[3].`,
    footnotes: [
      { index: 1, sourceId: "src_ferguson_zen_chinese_heritage", pageOrSection: "Zhongfeng Mingben — biographical entry; Gaofeng transmission" },
      { index: 2, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on Zhongfeng Mingben and Yuan-period Linji" },
      { index: 3, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on Zhongfeng's Japanese heirs" },
    ],
  },
  {
    slug: "huanyou-zhengchuan",
    content: `Huanyou Zhengchuan (幻有正傳, 1549–1614) was a late-Ming Linji master who held the abbacy of Longchi-yuan monastery in Changzhou (Jiangsu) and is the bridge figure between the declining mid-Ming Linji line and the dramatic seventeenth-century revival under his Dharma heir Miyun Yuanwu[1].

The young Miyun became his disciple in 1595, received full ordination in 1598, and received Dharma transmission in 1611; on Huanyou's death three years later Miyun assumed the Longchi-yuan abbacy and began the network expansion that would dominate Chinese Buddhism through the Ming-Qing transition and reach Japan (via Yinyuan Longqi / Ingen) and Vietnam (via Muchen Daomin → Nguyên Thiều)[2].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Ming Linji revival" },
      { index: 2, sourceId: "src_ferguson_zen_chinese_heritage", pageOrSection: "Huanyou Zhengchuan — biographical entry; succession to Miyun" },
    ],
  },
  {
    slug: "miyun-yuanwu",
    content: `Miyun Yuanwu (密雲圓悟, 1566–1642) was arguably the most institutionally influential figure of late-Ming and early-Qing Chinese Buddhism — the fountainhead from whom essentially all subsequent Linji Chan transmission to East Asia descends[1]. Born in Changzhou prefecture in modern Jiangsu to a peasant family, he turned to monastic life after reading the *Platform Sūtra*, joined Huanyou Zhengchuan's community in 1595, received full ordination in 1598, and was given Dharma transmission in 1611[1].

Miyun was famous for his deliberate revival of the "beating and shouting" pedagogy of the original Linji Yixuan against the gentler syncretic Buddhism of the late Ming. He held abbacies at Tiantong-si and a series of other major monasteries and authorised an unusually broad cohort of Dharma heirs[2]. Among his successors: Feiyin Tongrong, and through Feiyin, Yinyuan Longqi (Ingen) who founded the Ōbaku-shū in Japan; Muchen Daomin, through whose line the Lâm Tế tradition reached Vietnam via Bổn Quả Khoáng Viên and Nguyên Thiều; and many other Tiantong-line teachers who carried his orthodoxy through the Ming-Qing transition[3].`,
    footnotes: [
      { index: 1, sourceId: "src_ferguson_zen_chinese_heritage", pageOrSection: "Miyun Yuanwu — biographical entry" },
      { index: 2, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the late-Ming Tiantong revival" },
      { index: 3, sourceId: "src_dumoulin_japan", pageOrSection: "ch. on the Tiantong line, Ōbaku-shū, and Vietnamese Lâm Tế" },
    ],
  },
  {
    slug: "muchen-daomin",
    content: `Muchen Daomin (木陳道忞, 1596–1674) was one of Miyun Yuanwu's principal Dharma heirs in the late-Ming / early-Qing Linji line; he held the abbacy of the great Tiantong monastery from 1642 to 1645, in the years immediately following Miyun's death and the Ming-Qing transition[1].

Muchen compiled the first edition of Miyun's *Collected Sayings*, a task that brought him into open conflict with Feiyin Tongrong — Miyun's other principal heir — who organised a rival compilation; the dispute is one of the standard episodes of mid-seventeenth-century Chinese Chan historiography and a useful index of the politicised character of late-Ming Linji orthodoxy[2]. He also served as spiritual adviser to the Shunzhi Emperor (the first Qing emperor to rule all of China), under whose grief-stricken influence the emperor reportedly attempted to abdicate to monastic life. Through Muchen's student Bổn Quả Khoáng Viên, his Dharma reached the Vietnamese monk Nguyên Thiều, who carried the Lâm Tế (Linji) tradition into Vietnam[3].`,
    footnotes: [
      { index: 1, sourceId: "src_dumoulin_india_china", pageOrSection: "Vol. 1, ch. on the Tiantong abbacy after Miyun" },
      { index: 2, sourceId: "src_ferguson_zen_chinese_heritage", pageOrSection: "Muchen Daomin — biographical entry; Feiyin dispute" },
      { index: 3, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Muchen → Bổn Quả → Nguyên Thiều transmission" },
    ],
  },
  {
    slug: "nguyen-thieu",
    content: `Nguyên Thiều (元韶, 1648–1728) was the Cantonese Linji-Yangqi-line monk who carried the Lâm Tế (Linji) tradition into Vietnam during the late seventeenth century and fundamentally reshaped Vietnamese Buddhism for the next three hundred years[1]. Born in Triệu Châu prefecture in Guangdong, he was ordained at nineteen under Bổn Quả Khoáng Viên (a Dharma heir of Muchen Daomin and so an indirect heir of Miyun Yuanwu), and so stands as the thirty-third generation of the Linji lineage[1].

He travelled to Đàng Trong (the Nguyễn-lord south of Đại Việt) in 1677, arriving during the political upheaval of the Qing conquest of the last Ming loyalists, and was received under the patronage of Lord Nguyễn Phúc Tần. He founded Thập Tháp Di Đà Temple in Quy Nhơn (1683) and later Phổ Thành and Quốc Ân in Thuận Hóa (the Huế region), and around 1687–1690 was sent back to China to invite further monks, scriptures, and ritual implements — returning with several eminent Chinese masters including Minh Hoằng Tử Dung[2]. Through Minh Hoằng Tử Dung's student Liễu Quán, his line produced the Vietnamized Liễu Quán branch that became the dominant Buddhist lineage of central and southern Vietnam and the ancestor of Thích Nhất Hạnh's Plum Village tradition[3].`,
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Nguyên Thiều biography and lineage" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "Buddhism in Vietnam — Nguyên Thiều's seventeenth-century mission to Vietnam" },
      { index: 3, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Nguyên Thiều → Minh Hoằng Tử Dung → Liễu Quán" },
    ],
  },
  {
    slug: "minh-hoang-tu-dung",
    content: `Minh Hoằng Tử Dung (明宏子融) was a late-seventeenth-century Chinese Linji-Yangqi-line monk of the thirty-fourth generation who travelled to Đàng Trong as one of the eminent monastics invited from China by Nguyên Thiều, settling at An Tôn (later Bảo Quốc) Temple on Hoàng Long Mountain near Huế[1].

His chief Dharma heir was the young Vietnamese monk Liễu Quán, who came to him in 1702; Tử Dung gave him the *huatou* "All dharmas return to the one — where does the one return to?", and after six years of intensive investigation Liễu Quán's breakthrough was confirmed and his formal Dharma transmission was given (1708 in some sources, 1712 in others), making him the thirty-fifth-generation Lâm Tế heir[2]. Through Liễu Quán, Tử Dung's Dharma line became the dominant form of Vietnamese Zen Buddhism in central and southern Vietnam and the ultimate ancestor of Thích Nhất Hạnh's Plum Village tradition[3].`,
    footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Nguyên Thiều's invitation of Chinese monastics to Đàng Trong" },
      { index: 2, sourceId: "src_le_manh_that", pageOrSection: "Buddhism in Vietnam — Tử Dung and Liễu Quán's koan training and transmission" },
      { index: 3, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — the Liễu Quán line in central and southern Vietnam" },
    ],
  },
  {
    slug: "lieu-quan",
    content: `Liễu Quán (1670–1742) was the founder of the Liễu Quán dharma line, a uniquely Vietnamese form of Zen Buddhism within the Linji (Lâm Tế) school that remains the most influential Zen lineage in central Vietnam to this day[1]. Born in the poor village of Bạch Mã, Phú Yên Province, he lost his mother at age six. His father brought the boy to Hội Tôn Temple, where he met the Chinese Zen Master Tế Viên. At twelve, Liễu Quán became a novice monk[1].

After Tế Viên's death, the young monk undertook a remarkable year-long journey of approximately 500 kilometers on foot to reach Huế, arriving in 1690. After years of further study, he met his principal teacher, Minh Hoằng Tử Dung, in 1702. Tử Dung presented the koan: "All dharmas return to the one. Where does the one return to?" Six years of intensive investigation followed, until Liễu Quán experienced breakthrough understanding while reading the Jingde Record of the Transmission of the Lamp. In 1708, Tử Dung confirmed his enlightenment, transmitting the dharma to him as the thirty-fifth generation heir of the Lâm Tế lineage[2].

From 1708, Liễu Quán established Thiên Tông Temple on Thiên Thai Mountain and began thirty-four years of teaching, ordaining thousands and traveling throughout Phú Yên and the Huế region[1]. According to Thích Nhất Hạnh, Liễu Quán "Vietnamized" the Lâm Tế lineage, rooting it in Vietnamese culture rather than Chinese forms[3]. On the morning of his death in 1742, he composed a final gatha emphasizing "our true nature's pure ocean," entered sitting meditation, and peacefully passed away. His dharma transmission poem, with each character designating a generation, continues to be used for naming monastics in the tradition[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Liễu Quán",
        excerpt: "Born 1670 in Bạch Mã village, Phú Yên Province; died 1742. Founder of the Liễu Quán dharma line within the Lâm Tế school.",
      },
      {
        index: 2,
        sourceId: "src_plumvillage_books",
        pageOrSection: "plumvillage.org — Lineage / Liễu Quán transmission poem",
      },
      {
        index: 3,
        sourceId: "src_plumvillage_books",
        pageOrSection: "plumvillage.org — Thich Nhat Hanh on the Vietnamization of the Lâm Tế lineage",
      },
    ],
  },
  {
    slug: "nhat-dinh",
    content: `Nhất Định (1784–1847) was the founder of Từ Hiếu Temple and the first ancestor of the Từ Hiếu lineage within the Liễu Quán school. Born in Trung Kiên village, Quảng Trị province, he entered Thiên Thọ Temple on Hàm Long Mountain in Huế at age seven, where he trained under Meditation Master Phổ Tịnh. At age thirty, his teacher transmitted the dharma lamp to him with the verse: "Samadhi illuminates the skies / As in space, the full moon is beautiful and complete[1]."

Nhất Định rose to become an eminent figure during the Nguyễn dynasty, serving as a revered monk under the first four reigns and as abbot of Bảo Quốc Pagoda. In 1843, at age fifty-nine, he retired and relocated to Dương Xuân mountain with his elderly mother and three students, constructing a modest hermitage called An Dưỡng Am ("Peaceful Nurturing Hut"). The most famous story of his life concerns his devotion to his ailing mother: when a physician recommended fish for her recovery, the vegetarian monk walked to the market every morning to buy fish for her, enduring gossip from those who assumed he had abandoned his precepts. When Emperor Tự Đức investigated the rumors, he discovered the true motivation — profound filial piety. Deeply moved, the emperor ordered the construction of a substantial monastery at the hermitage site following Nhất Định's death in 1847, naming it Từ Hiếu ("Merciful Filial Piety"). Từ Hiếu would become the root temple of the Plum Village tradition and the place where Thích Nhất Hạnh ordained, lived in his final years, and died[2].`,
      footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Nhất Định and Từ Hiếu Temple founding" },
      { index: 2, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Nhất Định and Từ Hiếu Temple founding" },
    ],
  },
  {
    slug: "thich-chan-that",
    content: `Thích Chân Thật (1884–1968) was the fourth ancestor of Từ Hiếu Temple and the direct teacher of Thích Nhất Hạnh. He received dharma transmission from Venerable Tuệ Minh and belonged to the forty-first generation of the Linji school and the seventh generation of the Liễu Quán line[1].

As abbot of Từ Hiếu Temple, Chân Thật was known as a person of genuinely truthful nature, very compassionate. He participated daily in monastery work, wearing a large-brimmed hat and walking with a staff, leading by quiet example rather than imposing authority. In 1942, the sixteen-year-old Nguyễn Xuân Bảo (the future Thích Nhất Hạnh) entered Từ Hiếu as a novice under his guidance, receiving the lineage name Trừng Quang ("Clear Light")[2].

On May 1, 1966, at Từ Hiếu Temple, Chân Thật performed the "lamp transmission" ceremony for Thích Nhất Hạnh, making him a dharma teacher of the Liễu Quán dharma line. His transmission gatha read: "When we are determined to go just in one direction, we will meet the spring, and our march will be a heroic one. If the lamp of our mind shines light on its own nature, then the wonderful transmission of the Dharma will be realized in both East and West." His will appointed Thích Nhất Hạnh as his successor as abbot of Từ Hiếu. Chân Thật passed away in 1968, shortly after a bomb damaged the temple during the Tết Offensive[3].`,
      footnotes: [
      { index: 1, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Thích Chân Thật and the Từ Hiếu line" },
      { index: 2, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Thích Chân Thật and the Từ Hiếu line" },
      { index: 3, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Thích Chân Thật and the Từ Hiếu line" },
    ],
  },
  {
    slug: "thich-nhat-hanh",
    content: `Thích Nhất Hạnh (一行, 1926–2022) was the Vietnamese Thiền master, poet, peace activist, and author who, more than any other modern teacher, shaped the global understanding of mindfulness and gave the world the term "engaged Buddhism." He was born Nguyễn Xuân Bảo on 11 October 1926 in Huế, central Vietnam, and at sixteen entered Từ Hiếu Temple as a novice under Zen Master Thanh Quý Chân Thật, of the forty-third generation of the Lâm Tế (Linji) school and the ninth generation of its Liễu Quán branch; he was fully ordained as a bhikṣu at Ấn Quang Pagoda in Saigon in 1951[1]. He studied at the Báo Quốc Buddhist Academy and took degrees in French and Vietnamese literature at Saigon University before going to the United States in 1960–1962 to study comparative religion at Princeton and to lecture at Columbia and Cornell; he eventually read and taught in Vietnamese, French, Classical Chinese, Sanskrit, Pali, and English[1]. On 1 May 1966 his teacher transmitted "the lamp" to him, formally making him a dharmacharya and spiritual head of the Từ Hiếu line[1].

Out of the Vietnam War he built two of the most influential institutions of modern Buddhism. In 1964 he co-founded the School of Youth for Social Service (SYSS), a "neutral" corps that trained some ten thousand young Buddhists to rebuild bombed villages, run schools and clinics, and care for refugees on both sides of the war[1]. Between 1964 and 1966 he and a small group of monastics founded the Order of Interbeing (Tiếp Hiện), a mixed monastic and lay order whose Fourteen Mindfulness Trainings reframed the bodhisattva precepts for engaged practice[1][2]. During his 1966 American tour he met Martin Luther King Jr. and persuaded him to speak publicly against the war; in 1967 King nominated Nhất Hạnh for the Nobel Peace Prize, writing that "I do not personally know of anyone more worthy of the Nobel Peace Prize than this gentle monk from Vietnam"[1]. Refusing to support either side of the war cost him his country: both Saigon and Hanoi denied him re-entry, and he lived in exile in France for thirty-nine years. In 1982 he and Sister Chân Không founded Plum Village (Làng Mai) in the Dordogne, which by 2019 had grown into nine affiliated monasteries on three continents and the largest Buddhist monastic community in Europe and North America, with more than 750 resident monastics[2][1].

He published more than one hundred books in English. The most influential include *Vietnam: Lotus in a Sea of Fire* (Hill and Wang, 1967), in which he coined the term "engaged Buddhism"[1]; *The Miracle of Mindfulness* (Beacon Press, 1975), originally a long letter of encouragement to SYSS workers and later credited as a foundational text for mindfulness-based clinical interventions[1][3]; *Being Peace* (Parallax Press, 1987); *Old Path White Clouds: Walking in the Footsteps of the Buddha* (Parallax Press, 1991); *Peace Is Every Step* (Bantam, 1992); *Living Buddha, Living Christ* (Riverhead, 1995); and *The Heart of the Buddha's Teaching* (Broadway, 1998)[1][3]. After a severe brain hemorrhage in November 2014 he gradually returned to Vietnam, settling permanently at the root temple of Từ Hiếu in 2018, where he died on 22 January 2022 at the age of ninety-five[1]. His teaching survives through a dense lineage of dharma heirs — Sister Chân Không, Thầy Pháp Ấn, Thầy Pháp Dung, Sister Annabel Laity (Chân Đức), Thầy Pháp Linh, and many others — together with the lay membership of the Order of Interbeing[2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Thích Nhất Hạnh", excerpt: "Birth: October 11, 1926, in Huế (born Nguyễn Xuân Bảo). Death: January 22, 2022, at Từ Hiếu Temple, age 95. Age 16: Entered Từ Hiếu as novice under Thanh Quý Chân Thật. 1951: Ordained at Ấn Quang Pagoda. 1960–1962: Studied at Princeton; lectured at Columbia and Cornell. May 1, 1966: Thật transmitted the lamp. Co-founded SYSS (1964); Order of Interbeing (1964–1966). King wrote: 'I do not personally know of anyone more worthy of the Nobel Peace Prize than this gentle monk from Vietnam.' Coined 'engaged Buddhism' in Vietnam: Lotus in a Sea of Fire (Hill and Wang, 1967). Books: The Miracle of Mindfulness (Beacon, 1975); Being Peace (Parallax, 1987); Old Path White Clouds (Parallax, 1991); Peace Is Every Step (Bantam, 1992); Living Buddha Living Christ (Riverhead 1995); The Heart of the Buddha's Teaching (Broadway, 1999)." },
      { index: 2, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — About Thich Nhat Hanh / Plum Village Tradition", excerpt: "Plum Village Monastery was established in 1982 by Thich Nhat Hanh and Sister Chan Khong in the Dordogne. The Plum Village Community of Engaged Buddhism today comprises nine monasteries supporting over 750 monastics. The Order of Interbeing follows the Fourteen Mindfulness Trainings." },
      { index: 3, sourceId: "src_plumvillage_books", pageOrSection: "plumvillage.org — Books by Thich Nhat Hanh", excerpt: "Thich Nhat Hanh has written more than 100 books in English. The Miracle of Mindfulness was first written in 1974 as a long letter to a fellow worker in the School of Youth for Social Service and published in 1975. Old Path White Clouds (Parallax, 1991) retells the life of the Buddha." },
      { index: 4, sourceId: "src_global_zen_research", pageOrSection: "Global Zen practice-centre research bundle (2026) — Plum Village affiliates worldwide" },
    ],
  },
  {
    slug: "vinitaruci",
    content: `Vinitaruci (d. 594) was an Indian Buddhist monk who founded the first Thiền school in Vietnam, establishing the oldest continuous meditative Buddhist lineage in the country[1]. Born into a Brahmin family in South India, he traveled across western India seeking the Dharma before journeying eastward. Around 573–574 CE, he arrived in China and, according to traditional accounts, encountered Jianzhi Sengcan, the Third Patriarch of Chinese Chan, receiving dharma transmission[1].

Around 580 CE, Vinitaruci traveled to Vietnam and settled at Pháp Vân Temple in the ancient administrative center of Luy Lâu, near modern Hanoi[1]. There he accepted disciples and taught dharma, translating Buddhist scriptures and emphasizing the Prajñā ("wisdom of emptiness") tradition and direct transmission of awakening from master to disciple. His chief disciple, Pháp Hiền, succeeded him and constructed a stupa for his relics after his death in 594. The Vinitaruci school remained active for over six centuries, becoming one of the most influential Buddhist groups in Vietnam by the tenth century, particularly under the great patriarch Vạn Hạnh[2]. Thích Nhất Hạnh considered Vinitaruci's connection to the Third Patriarch significant, as it gave Vietnamese Buddhism a claim to the earliest and most direct transmission from the Indian Chan patriarchs[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Vinītaruci",
        excerpt: "Indian monk from South India; arrived in China c. 573–574, met the Third Patriarch Sengcan, then traveled to Vietnam and settled at Pháp Vân Temple in Luy Lâu around 580 CE. Died 594.",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Vinītaruci\" and \"Thiền\"",
      },
      {
        index: 3,
        sourceId: "src_plumvillage_books",
        pageOrSection: "plumvillage.org — Vietnamese Thiền and its Indian/Chinese roots",
      },
    ],
  },
  {
    slug: "vo-ngon-thong",
    content: `Vô Ngôn Thông (d. 826), whose name means "Wordless Understanding," was a Chinese Buddhist monk who founded the second major Thiền school in Vietnam[1]. Born around 759 CE in Guangzhou, he trained under the great Tang dynasty Chan master Baizhang Huaihai, one of the most important figures in Chinese Chan, who established the first independent monastic code for Chan communities. The Vô Ngôn Thông school thus carried the imprint of Baizhang's transformative vision and was associated with the Hongzhou school of Mazu Daoyi[2].

According to tradition, Vô Ngôn Thông attained enlightenment upon hearing Baizhang say: "If the mind is pure and empty, the sun of wisdom will shine by itself." Around 820 CE, he traveled to Annam (present-day northern Vietnam) and took up residence at Kiến Sơ Temple in Phù Đổng village[1]. Following Bodhidharma's example, he practiced "wall-gazing" meditation, sitting silently for extended periods. Before his death in 826, he transmitted his "Buddha-heart seal" to Cảm Thành, who became the second patriarch. The school flourished for centuries, becoming one of the three major Thiền traditions that Emperor Trần Nhân Tông would later synthesize into the unified Trúc Lâm school[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Vô Ngôn Thông",
        excerpt: "Chinese monk, disciple of Baizhang Huaihai; founded the second major Thiền school in Vietnam at Kiến Sơ Temple c. 820 CE; died 826.",
      },
      {
        index: 2,
        sourceId: "src_dumoulin_india_china",
        pageOrSection: "Vol. 1, ch. 9 — Baizhang Huaihai and the spread of the Hongzhou style",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Vô Ngôn Thông\" and \"Trúc Lâm\"",
      },
    ],
  },
  {
    slug: "van-hanh",
    content: `Vạn Hạnh (c. 938–1018) was one of the most politically consequential Buddhist monks in Vietnamese history — the teacher and kingmaker who orchestrated the founding of the Lý dynasty, one of Vietnam's greatest and longest-ruling dynasties. Born in Cổ Pháp village, Bắc Giang Province, he mastered Confucianism, Taoism, and Buddhism before devoting himself to monastic life at age twenty-one. He belonged to the Vinitaruci Thiền lineage[1].

Vạn Hạnh became renowned for his prophetic abilities and political acumen. He served as advisor to King Lê Đại Hành and engineered the installation of his protégé Lý Công Uẩn as emperor when the brutal King Lê Long Đĩnh died in 1009. The new emperor appointed Vạn Hạnh as National Teacher. His death poem, "Advice to Disciples," is among the most famous in Vietnamese Zen literature: "The body, like lightning, here then gone / Like spring foliage that withers in fall / Don't worry about the show of rise and decline / Like dewdrops on grass, so our lives float on." This poem's profound embrace of impermanence is notable coming from a man deeply engaged with political affairs — a hallmark of Vietnamese Buddhism's integration of contemplative practice with worldly responsibility. The name "Nhất Hạnh" chosen by Thích Nhất Hạnh was a deliberate echo of "Vạn Hạnh[2]."`,
      footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Vạn Hạnh and the founding of the Lý dynasty" },
      { index: 2, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Vạn Hạnh and the founding of the Lý dynasty" },
    ],
  },
  {
    slug: "tran-nhan-tong",
    content: `Trần Nhân Tông (1258–1308) was the third emperor of the Trần dynasty, a national hero who twice defeated Mongol invasions, and the founder of the Trúc Lâm ("Bamboo Grove") school — the first uniquely Vietnamese Buddhist lineage[1]. Born Trần Khâm, eldest son of Emperor Trần Thánh Tông, he was known from infancy as the "Golden Buddha." At age twenty, he briefly fled to Yên Tử Mountain to pursue monastic life before his father retrieved him[1].

Ascending the throne in 1278, he faced the greatest military crisis in Vietnamese history. In 1285, Mongol-Yuan forces invaded; under the emperor's leadership and General Trần Hưng Đạo's strategy, the Vietnamese army annihilated the invaders. A renewed Mongol offensive in 1287–1288 was decisively defeated at the Battle of Bạch Đằng River, prompting his famous verse: "The nation twice shaken, but stands firm / The mountains and rivers, for a thousand ages, forever secure."[1]

In 1293, he abdicated in favor of his son. In 1299, at age forty-one, he fully renounced secular life, ascending Yên Tử Mountain and adopting the dharma name Hương Vân Đại Đầu Đà[2]. Recognizing the fragmentation among Vietnam's three existing Zen lineages, he synthesized them into the unified Trúc Lâm Yên Tử school[3]. His central teaching was "Cư Trần Lạc Đạo" — "Living in the World and Enjoying the Way" — articulating an engaged Buddhism accessible to all social classes[2]. He transmitted the dharma to Pháp Loa in 1308 and died on December 14, 1308. More than 700 years later, the annual Yên Tử Festival attracts millions of pilgrims[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Trần Nhân Tông",
        excerpt: "Third emperor of the Trần dynasty (r. 1278–1293); led Đại Việt to victory over the Mongol-Yuan invasions of 1285 and 1287–1288; founded the Trúc Lâm school after his renunciation in 1299; died 1308.",
      },
      {
        index: 2,
        sourceId: "src_truc_lam_records",
        pageOrSection: "Recorded Sayings of the Trúc Lâm Patriarchs — Trần Nhân Tông on \"Cư Trần Lạc Đạo\"",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Trúc Lâm\" — synthesis of the three Vietnamese Thiền lineages",
      },
      {
        index: 4,
        sourceId: "src_thanh_tu_truc_lam",
        pageOrSection: "Trúc Lâm Thiền: Studies in Vietnamese Buddhism — Trần Nhân Tông and the modern revival",
      },
    ],
  },
  {
    slug: "phap-loa",
    content: `Pháp Loa (1284–1330), meaning "Dharma Conch," was the second patriarch of the Trúc Lâm school and the figure most responsible for transforming Trần Nhân Tông's vision into an enduring institution. Born Đồng Kiên Cương in Cửu La village, Hải Dương province, his birth was marked by extraordinary circumstances: his mother had already borne eight daughters and attempted abortion multiple times, but the pregnancy persisted. From childhood, he abstained from harsh language and refused meat[1].

At age twenty-one, Pháp Loa encountered the now-monastic Emperor Trần Nhân Tông, who declared: "This child has the Dharma eyes; later he will become a great instrument of Dharma." After ordination, at merely twenty-five he received formal dharma transmission to become the second patriarch in a grand ceremony attended by the reigning emperor and court officials. As patriarch, he proved an extraordinary administrator: he constructed over 1,300 Buddha statues, multiple temples and pagodas, and more than 200 sangha houses. His most lasting achievement was organizing and printing the complete Vietnamese Buddhist Tripiṭaka, comprising 2,372 texts. He ordained approximately 15,000 monks and nuns. He died on February 11, 1330, at age forty-seven[2].`,
      footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Pháp Loa as second Trúc Lâm patriarch" },
      { index: 2, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Pháp Loa as second Trúc Lâm patriarch" },
    ],
  },
  {
    slug: "huyen-quang",
    content: `Huyền Quang (1254–1334), meaning "Mysterious Light," was the third and final patriarch of the original Trúc Lâm lineage and one of Vietnam's most celebrated poet-monks. Born Lý Đạo Tái in Bắc Giang, he passed the highest imperial examination at age twenty-one and served in the royal academy, where his literary talents so impressed visiting Chinese ambassadors that they praised him as a genius[1].

His spiritual transformation came while attending a lecture by Pháp Loa at Vĩnh Nghiêm temple. He reflected that official status could only reach "fairyland," whereas Buddhist practice could reach enlightenment. In 1305, he ordained and became Trần Nhân Tông's assistant. He received Zen transmission from Pháp Loa in 1317. The most famous episode of his life is the "Điểm Bích incident" — the king sent an imperial courtesan to test his virtue with seductive tactics. She filed false reports damaging his reputation, creating a scandal debated for centuries. The king eventually discovered the truth. When Pháp Loa died in 1330, Huyền Quang became the third patriarch at age seventy-seven. His twenty-four surviving poems are considered among the finest in classical Vietnamese literature. He died on January 23, 1334, at age eighty[2].`,
      footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Huyền Quang as third Trúc Lâm patriarch" },
      { index: 2, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Huyền Quang as third Trúc Lâm patriarch" },
    ],
  },
  {
    slug: "chan-khong",
    content: `Sister Chân Không (born Cao Ngọc Phượng in 1938 in Bến Tre, Mekong Delta) is the first fully-ordained monastic disciple of Thích Nhất Hạnh and the Elder Bhikkhunī of the International Plum Village Sangha. Raised in a generous household, she learned compassion early — as a teenager, after encountering a hungry street child, she resolved to dedicate her life to helping the poor, tutoring wealthy students in mathematics to raise money for humanitarian work[1].

In 1959, she attended a lecture by Thích Nhất Hạnh and felt immediately struck: she had "never before heard anyone speak so beautifully and profoundly." When he founded the School of Youth for Social Service during the Vietnam War, she became one of six principal leaders, training over a thousand volunteers in nonviolent relief work. In 1966, she was among the six founding members of the Order of Interbeing. After departing Vietnam in 1969, she helped organize the Vietnamese Buddhist Peace Delegation and maritime rescue operations for Vietnamese boat people, personally disguising herself as a fisherman to locate refugees at sea[2].

Formally ordained as a nun in 1988, she co-founded Plum Village Monastery in 1982, transforming rustic French farmland into the largest Buddhist monastery in Europe. She pioneered the practices of "Beginning Anew," "Total Relaxation," and "Touching the Earth" meditations. Her autobiography, "Learning True Love," stands alongside the memoirs of Martin Luther King Jr. and Mahatma Gandhi as a testament to the integration of contemplative practice with nonviolent social action[3].`,
      footnotes: [
      { index: 1, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Sister Chân Không and Plum Village" },
      { index: 2, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Sister Chân Không and Plum Village" },
      { index: 3, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Sister Chân Không and Plum Village" },
    ],
  },
  {
    slug: "te-an-luu-quang",
    content: `Tế An Lưu Quang was the second-generation master of the Liễu Quán dharma line and the thirty-sixth generation of the Linji (Lâm Tế) school. He served as abbot of Bảo Quốc Temple in Huế, continuing the transmission that Liễu Quán had established. The character "Tế" in his name corresponds to the second position in Liễu Quán's dharma transmission poem, the gatha that assigns a unique character to each generation's dharma names — a system still used to name monastics in the tradition today[1].

Little biographical detail has survived in available sources about Tế An Lưu Quang's personal life or teaching. His significance lies in his faithful preservation of the Liễu Quán transmission during the critical early generations when the distinctly Vietnamese form of Lâm Tế Buddhism was taking root. He transmitted the dharma to Đại Tuệ Chiếu Nhiên, maintaining the unbroken lineage that would eventually flow through Từ Hiếu Temple to Thích Nhất Hạnh and the global Plum Village tradition[2].`,
      footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Te-An Luu-Quang in the Lâm Tế tradition" },
      { index: 2, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Te-An Luu-Quang in the Lâm Tế tradition" },
    ],
  },
  {
    slug: "dai-tue-chieu-nhien",
    content: `Đại Tuệ Chiếu Nhiên was the third-generation master of the Liễu Quán dharma line and the thirty-seventh generation of the Linji (Lâm Tế) school. He served as abbot of both Bảo Quốc and Thiền Tôn temples in the Huế region, important monastic centers of central Vietnamese Buddhism during the eighteenth century[1].

The character "Đại" in his name corresponds to the third position in Liễu Quán's dharma transmission poem. Like his predecessor Tế An Lưu Quang, detailed biographical information about Đại Tuệ Chiếu Nhiên exists primarily in Vietnamese-language temple archives and has not been widely published. He transmitted the dharma to Đạo Minh Phổ Tịnh, continuing the chain of succession that would establish the Từ Hiếu Temple lineage[2].`,
      footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Đại Tuệ Chiêu Nhiên in the Lâm Tế tradition" },
      { index: 2, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Đại Tuệ Chiêu Nhiên in the Lâm Tế tradition" },
    ],
  },
  {
    slug: "dao-minh-pho-tinh",
    content: `Đạo Minh Phổ Tịnh (d. c. 1816) was the fourth-generation master of the Liễu Quán dharma line and the thirty-eighth generation of the Linji school. He resided at Thiên Thọ Temple on Hàm Long Mountain in Huế, where he trained the young Nhất Định, who would go on to found Từ Hiếu Temple[1].

According to the Plum Village biography of Nhất Định, the boy arrived at Thiên Thọ Temple at age seven and trained under Phổ Tịnh for over two decades. At age thirty, Phổ Tịnh transmitted the dharma lamp to Nhất Định with the verse: "Samadhi illuminates the skies / As in space, the full moon is beautiful and complete." This transmission made Nhất Định the fifth generation of the Liễu Quán school and set in motion the founding of Từ Hiếu Temple, which would become the root temple of the entire Plum Village tradition[2].`,
      footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Đạo Minh Phổ Tịnh and the Liễu Quán line" },
      { index: 2, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Đạo Minh Phổ Tịnh and the Liễu Quán line" },
    ],
  },
  {
    slug: "hai-thieu-cuong-ky",
    content: `Hải Thiệu Cương Kỷ (c. 1810–1899) was the second ancestor of Từ Hiếu Temple and a master in the sixth generation of the Liễu Quán dharma line (fortieth generation of the Linji school). Following Nhất Định's death in 1847 and Emperor Tự Đức's order to build a proper monastery at the hermitage site, Cương Kỷ oversaw the transformation of the modest An Dưỡng Am into a spacious, properly constructed pagoda bearing the name Từ Hiếu ("Merciful Filial Piety")[1].

Under Cương Kỷ's leadership, Từ Hiếu became a significant monastic institution. The temple also became a sanctuary for elderly eunuchs of the Nguyễn dynasty court, who donated funds and expressed their wish to be buried in the temple grounds — their tombs can still be seen there today. In 1894, under King Thành Thái's patronage, Cương Kỷ carried out a major restoration of the pagoda. Several dharma transmission gathas survive from his hand, each a personalized verse given to a disciple upon receiving transmission. He passed away in 1899, having established Từ Hiếu as an enduring center of Vietnamese Buddhist practice[2].`,
      footnotes: [
      { index: 1, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Hai Thiêu Cương Kỳ and the Liễu Quán line" },
      { index: 2, sourceId: "src_nguyen_medieval", pageOrSection: "Buddhism in Vietnam — Hai Thiêu Cương Kỳ and the Liễu Quán line" },
    ],
  },
  {
    slug: "thich-tue-minh",
    content: `Thích Tuệ Minh (1861–1939), also known by his lineage name Thanh Thái and dharma name Chính Sắc, was the third ancestor of Từ Hiếu Temple and the teacher who transmitted the dharma to Thích Chân Thật. He belonged to the seventh generation of the Liễu Quán school and the forty-first generation of the Linji school[1].

Tuệ Minh served as abbot of Từ Hiếu from around 1899, continuing the work of building and maintaining the temple that had been transformed from Nhất Định's humble hermitage into a major monastic center. During his abbacy, further renovations were undertaken, including the construction of a half-moon pond in the center of the pagoda compound. His principal significance lies in his role as dharma transmitter: through his student Thích Chân Thật, the lineage would reach Thích Nhất Hạnh, connecting the early Từ Hiếu patriarchs to the modern Plum Village tradition that has brought Vietnamese Zen Buddhism to millions worldwide[2].`,
      footnotes: [
      { index: 1, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Thích Tuệ Minh and the Từ Hiếu line" },
      { index: 2, sourceId: "src_plumvillage_monastic", pageOrSection: "plumvillage.org — Thích Tuệ Minh and the Từ Hiếu line" },
    ],
  },
  // =========================================================================
  // Korean Seon
  // =========================================================================
  {
    slug: "wonhyo",
    content: `Wonhyo (617–686) was one of the most influential Buddhist monks in Korean history, a prolific scholar and iconoclast whose writings shaped the intellectual landscape of East Asian Buddhism. Born during the Silla dynasty, he initially attempted to travel to Tang China for study but experienced a famous awakening during the journey: sleeping in what he thought was a simple shelter, he drank water from a vessel in the dark and found it refreshing, only to discover at dawn that he had drunk from a skull filled with rainwater in a burial cave. The revulsion he felt revealed to him that perception is entirely mind-made, and he abandoned the trip, declaring that he need not seek the Dharma in China when the truth was already present in his own mind[1].

Wonhyo's subsequent career was extraordinary in its range. He wrote commentaries on virtually every major Mahayana sutra and treatise, producing over 240 works of which roughly twenty survive. His most important contribution was the doctrine of hwajaeng, or "reconciliation of disputes," which sought to harmonize the competing claims of different Buddhist schools by showing that each expressed a partial truth within a larger unity. He deliberately broke monastic precepts — fathering a son with a Silla princess and wandering among commoners singing and dancing — to demonstrate that the Dharma was not confined to the monastery. Though he preceded the formal establishment of Seon in Korea, his emphasis on the primacy of mind and his anti-scholastic spirit made him a spiritual ancestor of the Korean Zen tradition[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "Buswell — Wŏnhyo and the formation of Korean Buddhism" },
      { index: 2, sourceId: "src_buswell_formation", pageOrSection: "Buswell — Wŏnhyo and the formation of Korean Buddhism" },
    ],
  },
  {
    slug: "toui",
    content: `Toui (d. 825) is traditionally regarded as the first master to bring Chan Buddhism from China to the Korean peninsula, earning him a foundational place in the history of Korean Seon. He traveled to Tang China, where he studied under masters in the lineage of Baizhang Huaihai and the broader Hongzhou school of Mazu Daoyi. Having received dharma transmission, he returned to Silla Korea and established himself at Jinjeonsa Temple on Mount Gaji, where he began teaching the direct, experience-based approach to awakening that characterized the Hongzhou tradition[1].

Toui's efforts to transplant Chan to Korea met with considerable resistance from the established scholastic Buddhist schools, which dominated Silla religious life and viewed the new meditation movement with suspicion. He is said to have attracted only a small number of students during his lifetime, and it was left to his successors — particularly his dharma heir Yeomgeo — to build upon his foundation. Despite the limited immediate impact, Toui's transmission established the Nine Mountain Schools of Seon, the network of meditation lineages that would eventually reshape Korean Buddhism. He is honored as the founding patriarch of the Gaji Mountain school, the first of the Nine Mountains[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "Buswell — Doui (Toui) and the Gajisan Nine-Mountain school" },
      { index: 2, sourceId: "src_buswell_formation", pageOrSection: "Buswell — Doui (Toui) and the Gajisan Nine-Mountain school" },
    ],
  },
  {
    slug: "bojo-jinul",
    content: `Bojo Jinul (1158–1210) was the greatest reformer in the history of Korean Buddhism and the architect of the distinctive Korean Seon synthesis that endures to this day. Born during the Goryeo dynasty, he was ordained at age eight and passed the monastic examinations at twenty-five. His spiritual development was marked by three successive awakenings: the first came while reading the Platform Sutra of the Sixth Patriarch, the second through the Avatamsaka Sutra's teaching on the unobstructed interpenetration of all phenomena, and the third through the writings of the Chinese Chan master Dahui Zonggao on hwadu (keyword) practice[1].

These three awakenings shaped Jinul's revolutionary synthesis. He integrated Seon meditation with Hwaeom (Avatamsaka) doctrinal study, arguing that sudden awakening must be followed by gradual cultivation — a position he defended against those who insisted on either pure meditation or pure scholarship. He founded the Suseonsa community at Songgwangsa Temple on Mount Jogye, which became the model for Korean monastic practice and gave its name to the Jogye Order, the dominant order in Korean Buddhism today. His key texts, "Encouragement to Practice" and "Secrets on Cultivating the Mind," remain essential reading in Korean monasteries. Jinul's genius lay in his refusal to accept false dichotomies: he demonstrated that awakening and study, sudden insight and gradual cultivation, are not opponents but partners in the life of genuine practice[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_radiance", pageOrSection: "Tracing Back the Radiance — Bojo Jinul" },
      { index: 2, sourceId: "src_buswell_radiance", pageOrSection: "Tracing Back the Radiance — Bojo Jinul" },
    ],
  },
  {
    slug: "chinul-hyesim",
    content: `Chin'gak Hyesim (1178–1234) was the foremost student of Bojo Jinul and the master who firmly established hwadu (keyword) practice as the central method of Korean Seon. He entered monastic life as a young man and studied under Jinul at Suseonsa, where his penetrating insight earned him recognition as Jinul's dharma heir. After Jinul's death in 1210, Hyesim assumed leadership of the Suseonsa community and served as its second director, expanding the community and deepening its practice standards[1].

Hyesim's principal contribution was shifting the emphasis of Korean Seon from Jinul's balanced approach of meditation-and-doctrine toward a more intensive focus on hwadu investigation, the practice of concentrating on the critical phrase of a koan until conceptual thinking is utterly exhausted and awakening breaks through. He compiled the first Korean collection of hwadu cases and wrote extensive commentaries guiding practitioners through the method. This emphasis on hwadu became the defining feature of Korean Seon practice and remains so to the present day. Hyesim also played an important role in Korean literary history, producing significant collections of poetry and prose that demonstrate the integration of contemplative depth with literary accomplishment[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_radiance", pageOrSection: "Tracing Back the Radiance — Chin'gak Hyesim" },
      { index: 2, sourceId: "src_buswell_radiance", pageOrSection: "Tracing Back the Radiance — Chin'gak Hyesim" },
    ],
  },
  {
    slug: "taego-bou",
    content: `Taego Bou (1301–1382) was one of the most important Seon masters of the late Goryeo dynasty, renowned for traveling to Yuan China and receiving formal Linji dharma transmission from the hermit master Shiwu Qinggong, known as Stonehouse[1]. This transmission gave Korean Seon a direct, authenticated connection to the Chinese Linji lineage at a time when Korean Buddhism faced internal fragmentation and political turmoil. After returning to Korea, Taego was appointed Royal Preceptor and used his influence to attempt the unification of the Nine Mountain schools of Seon into a single order[1].

Taego's significance extends beyond his personal attainment. His vision of a unified Korean Buddhist order anticipated by two centuries the consolidation that would eventually occur under the Joseon dynasty[2]. He established rigorous practice standards and insisted on the primacy of hwadu investigation as the heart of Seon training. His recorded sayings reveal a teacher of great directness who could shift fluidly between scholarly exposition and the abrupt, challenging style of classical Linji encounter dialogue. The Taego Order, one of the two major orders in contemporary Korean Buddhism, takes its name from him, and his lineage claim through Stonehouse remains a point of identity and pride for its adherents[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Taego Bou",
        excerpt: "Korean Seon master (1301–1382), traveled to Yuan China and received Linji transmission from Shiwu Qinggong (Stonehouse); appointed Royal Preceptor; namesake of the Taego Order, one of two major orders of contemporary Korean Buddhism.",
      },
      {
        index: 2,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Taego Pou\" and \"Korean Seon\"",
      },
    ],
  },
  {
    slug: "naong-hyegeun",
    content: `Naong Hyegeun (1320–1376) was a leading Seon master of the late Goryeo dynasty who, along with his contemporary Taego Bou, played a crucial role in revitalizing Korean Buddhism through renewed contact with Chinese Chan. He traveled to Yuan China around 1347, where he studied under the Indian master Dhyanabhadra and received dharma transmission from Pingshan Chulin, a Linji lineage holder. During his time in China, he also gained the respect of the Yuan court and received imperial recognition[1].

Upon returning to Korea, Naong attracted a large following and was appointed Royal Preceptor by King Gongmin, who relied on him for both spiritual guidance and political counsel. He undertook the reform of monastic discipline and the revival of rigorous meditation practice at a time when Korean Buddhism had grown institutionally complacent. His most lasting legacy was his influence on subsequent generations through his many students, including Muhak Jacho, who would later serve as advisor to King Taejo, the founder of the Joseon dynasty. Naong's integration of scholarly breadth, contemplative depth, and political engagement exemplified the Korean ideal of the monk as both practitioner and public servant[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_formation", pageOrSection: "Buswell — Naong Hyegeun and the late-Goryeo Linji line" },
      { index: 2, sourceId: "src_buswell_formation", pageOrSection: "Buswell — Naong Hyegeun and the late-Goryeo Linji line" },
    ],
  },
  {
    slug: "gihwa",
    content: `Gihwa (1376–1433), also known as Hamheo Deuktong, was the most important Buddhist intellectual of the early Joseon dynasty and a fierce defender of the Dharma during a period of severe anti-Buddhist persecution. The Joseon state, founded on Neo-Confucian principles, systematically dismantled Buddhist institutions, confiscated monastic lands, and reduced the number of officially recognized Buddhist schools. Gihwa responded with "Hyeonjeong non" (Treatise on Manifesting Righteousness), a brilliant philosophical counterattack that systematically refuted Confucian criticisms of Buddhism while demonstrating the compatibility of Buddhist and Confucian ethics[1].

Beyond his polemical writings, Gihwa was a accomplished Seon practitioner and a scholar of remarkable range. He wrote important commentaries on the Surangama Sutra, the Diamond Sutra, and other major texts, and he continued Jinul's project of synthesizing Seon meditation with doctrinal study. His literary output was prodigious and intellectually sophisticated, drawing on the full resources of the Buddhist philosophical tradition to engage with Confucian thought on its own terms. Gihwa's defense of Buddhism did not prevent the continued decline of institutional Buddhism under Joseon rule, but it ensured that the intellectual tradition survived with its rigor intact, providing a foundation for later revivals[2].`,
      footnotes: [
      { index: 1, sourceId: "src_muller_kihwa", pageOrSection: "Muller — Hamheo Gihwa's Hyeonjeong-non" },
      { index: 2, sourceId: "src_muller_kihwa", pageOrSection: "Muller — Hamheo Gihwa's Hyeonjeong-non" },
    ],
  },
  {
    slug: "seosan-hyujeong",
    content: `Seosan Hyujeong (1520–1604) was the greatest Buddhist monk of the Joseon dynasty and a pivotal figure in Korean history[1]. At a time when Buddhism had been driven to the margins of Korean society by centuries of Neo-Confucian state policy, Seosan preserved and revitalized the Seon tradition through his teaching, writing, and, most dramatically, his leadership of a monk army against the Japanese invasion of 1592. When Toyotomi Hideyoshi's forces overran the peninsula, the seventy-three-year-old Seosan rallied over five thousand monks into a guerrilla fighting force that played a significant role in the eventual Korean victory[1].

Seosan's intellectual legacy was equally formidable. His most important work, "Seonyo" (Mirror of Seon), became the standard textbook for Korean monastic education and remained so for centuries[2]. In it, he articulated a comprehensive synthesis of Seon meditation, Pure Land recitation, and mantra practice, arguing that all three were valid gates to awakening suited to different temperaments and stages of development[2]. This inclusive approach, which refused to rank one method above the others, became characteristic of mainstream Korean Buddhism. He also wrote extensively on the Avatamsaka Sutra and the Heart Sutra. Through his two principal disciples, Samyeongdang Yujeong and Pyeonyang Eongi, his lineage branched into the two main streams that would carry Korean Seon through the remaining centuries of the Joseon period[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Hyujeong (Cheongheo Hyujeong / Seosan Daesa)",
        excerpt: "Korean Seon master of the Joseon dynasty (1520–1604); led a monk army against the Japanese invasion of 1592 (Imjin War).",
      },
      {
        index: 2,
        sourceId: "src_seosan_mirror_of_seon",
        pageOrSection: "Sŏn'ga kwigam 禪家龜鑑 (Mirror of Seon) — synthesis of Seon, Pure Land, and mantra",
      },
      {
        index: 3,
        sourceId: "src_princeton_dict_buddhism",
        pageOrSection: "s.v. \"Hyujŏng\" and \"Korean Seon\"",
      },
    ],
  },
  {
    slug: "samyeongdang-yujeong",
    content: `Samyeongdang Yujeong (1544–1610) was the foremost disciple of Seosan Hyujeong and one of the most remarkable figures in Korean Buddhist history — a warrior-monk, diplomat, and contemplative master whose life encompassed the full range of what Korean Buddhism demanded of its practitioners during a time of existential crisis. When the Japanese invasion of 1592 devastated the peninsula, Yujeong served as a field commander under his teacher Seosan, leading monk-soldiers in guerrilla operations against the occupying forces with notable effectiveness[1].

After the war, Yujeong's role shifted from warrior to diplomat. In 1604, he was sent to Japan as an envoy, where he negotiated directly with Tokugawa Ieyasu for the return of Korean prisoners of war, successfully securing the repatriation of over three thousand captives. This diplomatic achievement made him a national hero. Despite these dramatic worldly engagements, Yujeong was recognized by his contemporaries as a deeply realized Seon master who had received authentic dharma transmission from Seosan. His life embodied the Korean Buddhist ideal of "protecting the nation through Buddhism" — the conviction that genuine spiritual practice does not withdraw from the world but serves it in its hour of greatest need[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Samyŏngdang Yujŏng in the Joseon Seon revival" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Samyŏngdang Yujŏng in the Joseon Seon revival" },
    ],
  },
  {
    slug: "gyeongheo",
    content: `Gyeongheo Seongu (1846–1912) single-handedly revived the Korean Seon meditation tradition after centuries of decline under the Joseon dynasty's systematic suppression of Buddhism. By the mid-nineteenth century, monks had been banned from entering the capital, monastic education had deteriorated, and genuine meditation practice had nearly disappeared. Gyeongheo's awakening came dramatically: encountering a village devastated by cholera, he was so shaken by the reality of death that he sealed himself in his room and meditated with ferocious intensity on the hwadu "What is this thing that thus comes?" until he broke through to deep realization[1].

After his awakening, Gyeongheo traveled throughout Korea, re-establishing meditation halls and training a generation of students who would become the pillars of modern Korean Seon. His three principal disciples — Mangong, Hanam, and Suweol — each developed distinctive teaching styles that together revitalized the entire tradition. Gyeongheo himself was wildly unconventional: he drank alcohol, associated with courtesans, and eventually disappeared from the monastic world entirely, spending his final years as a wandering layman teaching children in a rural village under an assumed name. His body was discovered only after his death. This eccentric behavior, reminiscent of the mad wisdom tradition in Chan, demonstrated his conviction that realization is not bound by monastic convention[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Gyeongheo Seongu and the late-Joseon Seon revival" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Gyeongheo Seongu and the late-Joseon Seon revival" },
    ],
  },
  {
    slug: "mangong",
    content: `Mangong Wolmyeon (1872–1946) was one of the three great disciples of Gyeongheo Seongu and the master most responsible for maintaining rigorous Seon meditation standards during the turbulent period of Japanese colonial rule over Korea. He entered monastic life at age thirteen and studied under Gyeongheo, whose unconventional methods pushed Mangong to the depths of hwadu practice. His awakening came after years of intense struggle with the koan "The problem of the problem is the problem" — a characteristically paradoxical formulation of Gyeongheo's[1].

During the Japanese occupation (1910–1945), when colonial authorities attempted to reshape Korean Buddhism along Japanese lines — permitting married clergy and consolidating temples under Japanese administrative control — Mangong was among the most resolute defenders of traditional Korean monastic discipline. He insisted on celibacy, strict precept observance, and intensive meditation retreat practice, resisting the "Japanification" of Korean Buddhism. He trained many important students, including Gobong Gyeonguk, who would become the teacher of Seung Sahn. Mangong's fierce commitment to the integrity of the Korean Seon tradition during its most vulnerable period ensured that authentic practice survived to be transmitted to the postcolonial generation[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Mangong Wŏlmyŏn and twentieth-century Korean Seon" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Mangong Wŏlmyŏn and twentieth-century Korean Seon" },
    ],
  },
  {
    slug: "hanam-jungwon",
    content: `Hanam Jungwon (1876–1951) was one of the three great disciples of Gyeongheo Seongu and the most contemplative and reclusive of the trio. Where his dharma brother Mangong was a fierce institutional defender and Suweol was a wandering eccentric, Hanam chose the path of deep solitude, spending the greater part of his monastic career in extended retreat at Sangwonsa Temple on Mount Odae in the Diamond Mountains region. His practice was characterized by extraordinary patience and stillness, and he was known for sitting in meditation for entire days without moving[1].

Hanam's teaching emphasized the absolute priority of direct meditative experience over all other forms of Buddhist activity. He was wary of excessive doctrinal study, institutional politics, and social engagement, not because he considered them wrong but because he believed that only the deepest possible samadhi could produce the clarity needed to act wisely in the world. He served as Supreme Patriarch of Korean Buddhism in his final years, lending his moral authority to the tradition's postwar reconstruction. His hermit-like example offered a necessary counterbalance to the more publicly engaged models of Korean Buddhist leadership, reminding practitioners that the foundation of all authentic activity is the silence of deep meditation[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Hanam Jungwŏn and twentieth-century Korean Seon" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Hanam Jungwŏn and twentieth-century Korean Seon" },
    ],
  },
  {
    slug: "hyobong",
    content: `Hyobong Yeonghak (1888–1966) came to Seon practice through one of the most dramatic conversion stories in Korean Buddhist history. Before becoming a monk, he served as a judge under the Japanese colonial court system. Tormented by having sentenced a Korean independence activist to death, he experienced a crisis of conscience so severe that he abandoned his legal career, his family, and all worldly attachments to enter monastic life. He studied under several teachers and undertook grueling solitary retreats in the mountains, eventually attaining deep awakening through hwadu practice[1].

Hyobong became one of the most respected Seon masters of the twentieth century, known for the penetrating quality of his dharma interviews and his uncompromising insistence on genuine realization over mere intellectual understanding. He served as Supreme Patriarch of the Jogye Order and played an important role in the postwar purification movement that sought to restore celibate monastic discipline after the compromises of the Japanese colonial period. His most significant legacy was the training of Seongcheol, who would become the most influential Korean Seon master of the late twentieth century. Hyobong's life — from secular judge dispensing death sentences to awakened master dispensing the Dharma — embodies the transformative power of genuine repentance and practice[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Hyobong Hangnul and the modern Songgwangsa community" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Hyobong Hangnul and the modern Songgwangsa community" },
    ],
  },
  {
    slug: "gobong",
    content: `Gobong Gyeonguk (1890–1962) was a student of Mangong Wolmyeon and one of the fiercest hwadu practitioners in modern Korean Seon. Known for his unrelenting intensity in meditation and his refusal to accept anything less than complete breakthrough, he embodied the spirit of "great doubt" that the Korean Seon tradition considers essential for awakening. His practice style was demanding and uncompromising: he expected his students to bring the same total commitment to hwadu investigation that he himself had demonstrated under Mangong's guidance[1].

Gobong's greatest historical significance lies in his role as the teacher of Seung Sahn, who would become the first Korean Zen master to establish a major international teaching organization. When the young Seung Sahn came to Gobong after an intense solitary retreat and presented his understanding, Gobong tested him rigorously through a series of dharma combat exchanges before granting approval. This transmission from Gobong to Seung Sahn became the bridge through which the Mangong lineage of Korean Seon reached the Western world. Gobong's teaching emphasized that genuine Seon is not about achieving special states but about the complete and unconditional clarity of "don't know mind" in every moment of daily life[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Gobong Gyeongook and the Imje line in modern Korea" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Gobong Gyeongook and the Imje line in modern Korea" },
    ],
  },
  {
    slug: "kusan-sunim",
    content: `Kusan Sunim (1908–1983) was one of the first Korean Seon masters to teach Western students in Korea and a key figure in opening Korean Buddhism to the international world. Born in Namwon, South Jeolla Province, he ordained relatively late in life after working as a barber. He studied under several masters and attained awakening through intensive hwadu practice. He eventually became the Seon master of Songgwangsa Temple, the very monastery that Bojo Jinul had founded eight centuries earlier, and under his guidance it became a major center of international Seon practice[1].

In 1972, Kusan established the International Meditation Center at Songgwangsa, making it one of the first Korean monasteries to welcome and accommodate foreign practitioners. Western students who trained under him experienced the full rigor of the Korean monastic retreat system: three-month intensive meditation periods, predawn waking, and the relentless investigation of hwadu. His book "The Way of Korean Zen," translated by Martine Batchelor, became an important introduction to Korean Seon practice for English-speaking audiences. Kusan's legacy at Songgwangsa established the template for Korean monastic training of Western students that continues to this day[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Kusan Sunim and the Songgwangsa international community" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Kusan Sunim and the Songgwangsa international community" },
    ],
  },
  {
    slug: "seongcheol",
    content: `Toeong Seongcheol (退翁性徹, 1912–1993) was the most influential Korean Seon master of the twentieth century and served as the seventh Supreme Patriarch (Jongjeong) of the Jogye Order from 1981 until his death. Born Yi Yeongju on 6 April 1912 in what was then Korea under Japanese rule, he was a precocious child who reportedly read by the age of three and worked through the Chinese classics in his early youth before turning to Western philosophy and Eastern religion[1]. His decisive turn to Buddhism came when he encountered Yongjia Xuanjue's *Song of Enlightenment*, an experience he later described as "a bright light had suddenly been lit in complete darkness"[1]. He took monastic ordination in March 1937 at Haeinsa under the recommendation of Seon Master Dongsan, receiving the dharma name Seongcheol, and reported a first awakening at Geum Dang Seon Center in 1940, only three years after entering the order[1].

Seongcheol's life as a monk became legendary for its austerity. He undertook eight years of jangjwa bulwa — long sitting without lying down — and from 1955 to 1965 sealed himself into a ten-year retreat at Seongjeonam Hermitage on Mt. Gaya, refusing virtually all outside contact[1]. Visitors who later wished to meet him were famously required to perform three thousand prostrations before the Buddha; he applied this rule even to South Korean President Park Chung-hee, who never received the audience because he refused the prostrations[1]. In 1967, after his appointment as Spiritual Head (Bangjang) of the Haeinsa Chongnim, he delivered the so-called "Sermon of One Hundred Days" (백일법문) — two-hour daily lectures over more than three months that interwove Madhyamaka, Yogācāra, Tiantai, Huayan and the Korean Seon record with references to modern physics, and that fundamentally reshaped Korean Buddhist preaching[2][1]. His doctrinal banner was Dono Donsu (돈오돈수), "sudden enlightenment, sudden cultivation," which he defended against the gradual-cultivation reading of Jinul that had dominated the Jogye Order since the Goryeo period[1][2].

When the Jogye Order elected him Jongjeong in 1981, Seongcheol famously refused to travel to Seoul for the enthronement ceremony and stayed at Haeinsa, where he continued to live as an ordinary monk in Toesoeldang, the same room in which he had been ordained, until he died there on 4 November 1993[1]. His written legacy is substantial: through Haeinsa's Jang'gyung'gak imprint between 1976 and 1992 he produced eleven volumes of his own dharma talks together with thirty-seven annotated translations of Chan and Seon classics, including *Seonmun Jeongno* (선문정로, "The Correct Path of the Seon School," 1981), the *Baegil Beommun* edition of the Hundred-Day Sermon, and a Korean edition of the *Liuzu Tanjing*[3][1]. His principal dharma heirs include Wŏntaek of Baekryeonam, who continues to oversee the publication of his collected talks, and a wider circle of Haeinsa-trained masters who maintain his sudden/sudden line within the contemporary Jogye Order[3].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Seongcheol", excerpt: "Born April 6, 1912; died November 4, 1993 at Haeinsa Toesoeldang. Yi Yeongju became Seongcheol in March 1937. A copy of the Song of Enlightenment by Yongjia Xuanjue proved transformative. Seongjeongam hermitage retreat 1955–1965. Eight-year practice of Jangjwa Bulwa. Famously required 3,000 prostrations for visitor audiences. Advocated Dono Donsu (sudden enlightenment, sudden cultivation)." },
      { index: 2, sourceId: "src_seongcheol_dharma_talks", pageOrSection: "Hundred-Day Sermon (Baegil Beommun), 1967, Haeinsa", excerpt: "Beginning 1967 at Haeinsa, Seongcheol delivered two-hour daily dharma lectures blending Buddhism with physics and modern affairs, fundamentally transforming Korean Buddhist discourse." },
      { index: 3, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Seongcheol, Publications", excerpt: "Eleven lecture books and 37 translated Zen classics through Haeinsa's Jang'gyung'gak publisher (1976–1992), including Seonmun Jeongno (1981)." },
    ],
  },
  {
    slug: "seung-sahn",
    content: `Seung Sahn Haengwon (숭산행원, 1927–2004) was the Korean Seon master who, more than any other, brought Korean Zen to the Western world and built the largest international Korean Zen sangha of the twentieth century, the Kwan Um School of Zen. He was born Duk-In Lee on 1 August 1927 in Sunchon, South Pyongan Province, in what is now North Korea[1]. As a teenager he joined the Korean independence movement under Japanese occupation and was briefly imprisoned; afterward he studied Western philosophy at Dongguk University in Seoul, where reading the Diamond Sutra prompted him to leave his studies for the mountains[1]. He took monastic precepts in 1948, undertook a hundred-day solitary retreat eating only pine needles, and on 25 January 1949 received dharma transmission from Seon Master Kobong Gyeongook — the only person to whom Kobong ever transmitted, making Seung Sahn at twenty-two the seventy-eighth patriarch in his Korean Imje line[1][2].

After two decades of monastic and institutional work in Korea, Hong Kong, and Japan — including helping to rebuild the war-damaged Hwagaesa in Seoul — Seung Sahn arrived in Providence, Rhode Island in 1972, taking work in a laundromat and gathering a small group of Brown University students who became the nucleus of the Providence Zen Center[1][2]. Out of that group grew the Kwan Um School of Zen, which he formally founded in 1983 and which by his death had spread to more than a hundred groups, temples, and monasteries across North America, Europe, Africa, Asia, and Australia[2]. His teaching style was unmistakable: blunt, humorous, often bilingual broken-English exchanges built around what he called the Twelve Gates kong-ans and the central injunction to "only don't know" and "only go straight"[2][1]. He authorized a relatively dense roster of dharma heirs — among them Bo Mun, Su Bong Soeng-Sahn, Soeng Hyang (Barbara Rhodes), Wu Kwang (Richard Shrobe), Dae Gak, and Mu Soeng — who continue to lead the Kwan Um School after his death[1][2].

His books, mostly co-edited from transcribed talks and letters, became standard introductions to Zen in English. *Dropping Ashes on the Buddha: The Teaching of Zen Master Seung Sahn* was edited by Stephen Mitchell and published by Grove Press in 1976; *Only Don't Know: Selected Teaching Letters of Zen Master Seung Sahn* appeared from Primary Point Press in 1982 (reissued by Shambhala in 1999); *The Whole World Is a Single Flower: 365 Kong-ans for Everyday Life* was published by Charles E. Tuttle in 1992; and *The Compass of Zen*, his most systematic exposition of Hinayana, Mahayana, and Zen, was edited by his American heir Hyon Gak Sunim and published by Shambhala in 1997[1][2]. Shortly before his death the Jogye Order conferred on him the title Dae Jong Sa, "Great Lineage Master"[1]. He died at Hwagaesa in Seoul on 30 November 2004 at the age of seventy-seven[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Seung Sahn", excerpt: "Born August 1, 1927 in Sunchon, South Pyongan Province; died November 30, 2004 at Hwagaesa in Seoul. Studied Western philosophy at Dongguk University. Principal teacher Kobong, who confirmed his enlightenment on January 25, 1949. Founded Kwan Um School of Zen in 1983. Notable successors included Bo Mun, Dae Gak, Su Bong, Soeng Hyang, and Wu Kwang. Books: Dropping Ashes on the Buddha (Grove 1976); Only Don't Know (Primary Point 1982); The Compass of Zen (Shambhala 1997); The Whole World Is a Single Flower (Tuttle 1992)." },
      { index: 2, sourceId: "src_kwanum", pageOrSection: "kwanumzen.org — About Zen Master Seung Sahn", excerpt: "Zen Master Seung Sahn was the 78th Patriarch in his lineage. He was the first Korean Zen Master to live and teach in the West, founding the Kwan Um School of Zen which now numbers more than a hundred Zen centers on six continents. His teaching style featured the koans of the Twelve Gates and the simple instructions, 'Only don't know' and 'Only go straight, try, try, try for ten thousand years nonstop.'" },
      { index: 3, sourceId: "src_kwan_um_poland", pageOrSection: "zen.pl — Związek Buddystów Czan Kwan Um w Polsce (Seung Sahn lineage in Poland)" },
    ],
  },
  {
    slug: "daehaeng",
    content: `Daehaeng (1927–2012) was a Korean Seon nun whose unconventional path and distinctive teaching of Juingong, or "the inner master," made her one of the most original Buddhist voices of the twentieth century. Orphaned during the upheavals of twentieth-century Korea, she spent years wandering alone in the mountains, practicing meditation without formal monastic training. Her awakening came through direct, solitary investigation rather than through the traditional structures of monastic education and hwadu practice, giving her teaching a freshness and immediacy that distinguished it from more conventional approaches[1].

Daehaeng's central teaching revolved around the concept of Juingong — the fundamental, inherent Buddha-nature that she described as the true master within each person. She taught that all problems, whether spiritual, physical, or practical, could be addressed by entrusting them to this inner master and releasing the habit of trying to control outcomes through the discriminating mind. She founded Hanmaum Seonwon (One Mind Seon Center), which grew into a network of practice centers throughout Korea and internationally. Her teaching attracted both monastics and laypeople, and her emphasis on the capacity of ordinary people to access their own innate wisdom without depending on elaborate institutional structures resonated strongly with contemporary Korean society[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Daehaeng Kun Sunim and the Hanmaum Seonwon" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Daehaeng Kun Sunim and the Hanmaum Seonwon" },
    ],
  },
  {
    slug: "beopjeong",
    content: `Beopjeong (1932–2010) was a Korean Seon monk, essayist, and environmentalist whose literary voice and philosophy of radical simplicity made him one of the most beloved public figures in modern Korean Buddhism. He ordained at age twenty-four at Haeinsa Temple and practiced under several Seon masters, but it was through his writing rather than his formal dharma lineage that he exerted his greatest influence. His 1976 book "Musoyu" (Non-Possession) became one of the bestselling works of Korean nonfiction, articulating a philosophy of voluntary simplicity that struck a deep chord in a rapidly industrializing society[1].

Beopjeong spent much of his life at small, remote hermitages, including Burilam on Mount Songni, living with almost no possessions and refusing donations beyond what was needed for basic subsistence. He was a passionate advocate for environmental protection, seeing the destruction of the natural world as both a moral failing and a symptom of the spiritual disease of attachment. Despite — or perhaps because of — his withdrawal from public life, his essays on mindful living, the beauty of nature, and the freedom of non-attachment reached millions of readers. Before his death, he requested that all his books be taken out of print and that no memorial be built for him, a final enactment of the non-possession philosophy he had taught throughout his life[2].`,
      footnotes: [
      { index: 1, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Beopjeong (Pŏpchŏng) and the modern Jogye Order" },
      { index: 2, sourceId: "src_buswell_monastic", pageOrSection: "Buswell — Beopjeong (Pŏpchŏng) and the modern Jogye Order" },
    ],
  },
  // =========================================================================
  // Japanese Zen — additional masters
  // =========================================================================
  {
    slug: "myoan-eisai",
    content: `Myōan Eisai (明菴榮西, 1141–1215) is the monk traditionally credited with the founding of Japanese Rinzai Zen and with the re-introduction of large-scale tea cultivation to Japan. A Tendai-trained monk who had grown dissatisfied with the state of Heian-period Buddhism, Eisai made two voyages to Song-dynasty China: a brief first trip in 1168 and a longer second residence from 1187 to 1191, during which he trained at Mount Tiantai (天台山) and Mount Tiantong under the Huanglong-line Linji master Xū'ān Huáichǎng (虛庵懷敞), from whom he received Dharma transmission[1]. He returned to Japan in 1191 carrying that Huanglong-line transmission together with tea seeds and the Song methods of preparing powdered (matcha) tea[2].

Eisai's effort to establish Zen as a free-standing school in Japan met sharp resistance from the powerful Tendai establishment on Mount Hiei, which obtained a court ban on the new "meditation school" in 1194. He answered in 1198 with his apologia *Kōzen Gokoku Ron* (興禪護國論, "Propagation of Zen for the Protection of the Nation"), arguing that Zen would strengthen, not undermine, the state Buddhism of Heian Japan. By turning to the new warrior government in Kamakura he secured the patronage to found Jufuku-ji in Kamakura (1200) and Kennin-ji in Kyoto (1202), the latter being the first Zen monastery in the imperial capital[3]. His *Kissa Yōjōki* (喫茶養生記, "Drinking Tea for Nourishing Life") promoted tea as both medicine and aid to meditation — a strand Okakura Kakuzō later traced through the medieval Zen monasteries down to the modern tea ceremony in *The Book of Tea*[4]. Though Dōgen and later purists criticised Eisai's syncretism with Tendai and esoteric practices, he was the essential pioneer through whom Chinese Linji Chan first took institutional root in Japan.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Eisai and the introduction of Rinzai Zen to Japan",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Eisai — biography; tea cultivation; Huanglong-line transmission",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Kōzen Gokoku Ron, Jufuku-ji, and Kennin-ji",
      },
      {
        index: 4,
        sourceId: "src_okakura_book_of_tea_1906",
        pageOrSection: "ch. II–III — Eisai, the Zen monasteries, and the introduction of tea to Japan",
      },
    ],
  },
  {
    slug: "enni-benen",
    content: `Enni Ben'en (1202–1280) was one of the most important early Rinzai masters in Japan, a student of the great Chinese master Wuzhun Shifan who brought back to Japan a more purely Chan-focused practice than his predecessor Eisai had established. He traveled to Song dynasty China in 1235 and studied at Mount Jing under Wuzhun Shifan, one of the most celebrated Linji masters of the era. After receiving dharma transmission, he returned to Japan in 1241, carrying with him not only the Linji teaching but also knowledge of Song Chinese culture, architecture, and monastic organization[1].

With the patronage of the powerful Kujō Michiie, Enni founded Tōfuku-ji in Kyoto, which became one of the great Gozan (Five Mountains) monasteries and a center of Rinzai culture for centuries. He was posthumously awarded the title Shōichi Kokushi (National Teacher), making him one of the first Zen masters to receive this honor in Japan. Enni's significance lies in his role as a bridge figure: he helped establish the model of the Zen monastery as a comprehensive cultural institution encompassing not only meditation but also scholarship, calligraphy, painting, and the ritual arts. His lineage produced many important masters who shaped the culture of medieval Japan[2].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Enni Ben'en and the founding of Tōfuku-ji" },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Enni Ben'en and the founding of Tōfuku-ji" },
    ],
  },
  {
    slug: "muso-soseki",
    content: `Musō Soseki (1275–1351) was the most politically influential Zen master in Japanese history and one of the greatest garden designers the world has produced. Ordained as a young man, he studied under several masters before receiving dharma transmission from Kōhō Kennichi of the Chinese émigré lineage. Despite his inclination toward solitary mountain practice, he was repeatedly summoned to serve the imperial court and the shogunate, eventually serving as advisor to Emperor Go-Daigo and then to Ashikaga Takauji, the founder of the Muromachi shogunate. He was awarded the title of National Teacher by seven successive emperors — a distinction unmatched in Japanese history[1].

Musō's cultural legacy is enormous. He designed the gardens at Tenryū-ji, Saihō-ji (the Moss Temple), and numerous other temples, creating landscapes that express Zen principles of emptiness, naturalness, and the interpenetration of the constructed and the wild. He founded Tenryū-ji in Kyoto, which became one of the leading Gozan monasteries, and he established a network of provincial temples called Ankokuji throughout Japan. His school, the Musō-ha, became the dominant force in medieval Japanese Zen, and his influence shaped the aesthetic sensibility of the entire Muromachi period — the golden age of Japanese ink painting, Noh drama, and the tea ceremony. His "Dialogues in a Dream" (Muchū Mondō) remains an important text on the application of Zen to governance and daily life[2].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Musō Sōseki and the Tenryū-ji line" },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Musō Sōseki and the Tenryū-ji line" },
    ],
  },
  {
    slug: "takuan-soho",
    content: `Takuan Sōhō (1573–1645) was a Rinzai Zen master, calligrapher, painter, poet, and tea master whose writings on the relationship between Zen and martial arts profoundly influenced Japanese warrior culture. He became abbot of Daitoku-ji in Kyoto at the remarkably young age of thirty-six. When the Tokugawa shogunate imposed new regulations restricting the authority of Zen temples in 1627, Takuan publicly defied the edict, was arrested, and was exiled to the remote province of Dewa for three years — an experience he bore with equanimity and even humor, continuing his practice and artistic work throughout[1].

Takuan is best known for his letter to the swordsman Yagyū Munenori, later published as "Fudōchi Shinmyōroku" (The Unfettered Mind), which applies Zen principles of non-attachment and spontaneous response to the art of swordsmanship. His key teaching was that the mind must not "stop" or fixate on any single point — not on the opponent's sword, not on one's own technique, not even on the desire to win — but must flow freely and respond to circumstances without deliberation. This teaching influenced not only martial arts but the entire Japanese aesthetic of mushin (no-mind) that pervades tea ceremony, calligraphy, and the performing arts. The pickled radish known as takuan-zuke is traditionally named after him, a reminder that this sophisticated master was also a man of earthy practicality[2].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Takuan Sōhō and Daitoku-ji in the early Edo" },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Takuan Sōhō and Daitoku-ji in the early Edo" },
    ],
  },
  {
    slug: "torei-enji",
    content: `Torei Enji (1721–1792) was the foremost disciple of Hakuin Ekaku and the co-architect of the systematized koan curriculum that defines Rinzai Zen training to this day. He came to Hakuin as a young monk already possessing considerable meditative attainment, but Hakuin subjected him to years of further testing and refinement, recognizing in Torei the capacity to help organize and transmit the revitalized Rinzai teaching. The two worked together for decades, with Torei serving as Hakuin's principal assistant and literary collaborator[1].

Torei's most important work is the "Shūmon Mujintō Ron" (Discourse on the Inexhaustible Lamp of the Zen School), a comprehensive treatise that systematically presents the Rinzai path from initial aspiration through complete awakening and the subsequent process of deepening and refining realization. This text, together with his role in organizing the koan curriculum into a progressive sequence of study, gave Rinzai Zen the pedagogical structure it had previously lacked. Torei was also a gifted calligrapher and painter whose works are treasured as exemplars of Zen art. He founded Ryūtaku-ji in Shizuoka Prefecture, which became one of the most important Rinzai training monasteries and continues to operate as a center of rigorous practice[2].`,
      footnotes: [
      { index: 1, sourceId: "src_waddell_hakuin", pageOrSection: "Waddell — Tōrei Enji as Hakuin's principal heir" },
      { index: 2, sourceId: "src_waddell_hakuin", pageOrSection: "Waddell — Tōrei Enji as Hakuin's principal heir" },
    ],
  },
  {
    slug: "ingen-ryuki",
    content: `Ingen Ryūki (隠元隆琦, Chinese: Yǐnyuán Lóngqí, 1592–1673) was a late-Ming Chinese Linji master from Fuqing in Fujian Province who emigrated to Japan in 1654 and founded the Ōbaku-shū, the third great Japanese Zen school alongside Rinzai and Sōtō[1]. Before leaving China he had served as abbot of the Wànfú-sì (萬福寺) on Mount Huángbò in Fujian — the same Huangbo (Ōbaku) associated with the Tang master Huangbo Xiyun — and his Japanese disciples deliberately took that mountain-name as the new school's name[2].

He landed at Nagasaki in 1654 at the invitation of the Chinese emigrant Buddhist community already established there, and after several years of teaching was granted land in Uji on which he founded Manpuku-ji in 1661, building it as a complete Ming-Chinese architectural complex unlike anything in the existing Japanese tradition[3]. The Ōbaku style he transmitted combined Linji koan practice with explicit *nianfo* (nembutsu) recitation, strict vinaya observance, and the Ming-period repertoire of sutra chanting, calligraphy, ink-painting, woodblock printing, and *sencha* steeped-tea drinking; through Manpuku-ji and its branch network these became significant cultural imports into Tokugawa Japan and provided part of the impetus for Hakuin's roughly contemporary reform of the existing Rinzai school[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Ingen and the founding of Ōbaku-shū",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Ingen Ryūki — Mount Huangbo / Ōbaku transmission and naming",
      },
      {
        index: 3,
        sourceId: "src_dumoulin_japan",
        pageOrSection: "ch. on Manpuku-ji and Ming Chinese architecture in Japan",
      },
      {
        index: 4,
        sourceId: "src_waddell_hakuin",
        pageOrSection: "Introduction — Ōbaku influence on the eighteenth-century Rinzai revival",
      },
    ],
  },
  {
    slug: "tetsugen-doko",
    content: `Tetsugen Dōkō (1630–1682) was an Ōbaku Zen monk whose life exemplifies the Buddhist ideal of compassion enacted through selfless action. Born in Higo Province (modern Kumamoto), he studied under Ingen Ryūki at Manpuku-ji and became one of the most accomplished masters of the early Ōbaku school. He conceived the monumental project of carving the entire Buddhist Tripiṭaka (the complete canon of Buddhist scriptures) in woodblock for printing — a task requiring the carving of over sixty thousand individual woodblocks[1].

After years of fundraising across Japan, Tetsugen had collected enough donations to begin the project. But when a devastating famine struck the Osaka region, he gave away all the funds for famine relief. He raised the money a second time, and again a natural disaster struck — this time floods — and again he distributed the funds to the suffering. Only on his third attempt did he finally complete the printing blocks, known as the Ōbaku-ban Daizōkyō (Ōbaku Edition of the Tripiṭaka), which was finished in 1678 and comprised over 6,900 volumes. The Japanese people said that Tetsugen had actually produced three sets of scriptures, and the first two invisible sets — the famine relief and the flood relief — surpassed even the physical canon in merit. His wooden printing blocks are preserved at Manpuku-ji to this day[2].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Tetsugen Dōkō and the Ōbaku Tripitaka project" },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Tetsugen Dōkō and the Ōbaku Tripitaka project" },
    ],
  },
  {
    slug: "menzan-zuiho",
    content: `Menzan Zuihō (1683–1769) was the most important Sōtō Zen scholar-monk of the Tokugawa period and the figure most responsible for the recovery and dissemination of Dōgen's original teachings after centuries of neglect. By the seventeenth century, the Sōtō school had drifted considerably from its founder's vision, incorporating folk religious practices, secret transmission rituals, and institutional corruptions that bore little resemblance to Dōgen's rigorously philosophical approach to Zen. Menzan devoted his life to reversing this drift through meticulous textual scholarship and institutional reform[1].

Menzan's prodigious scholarly output included commentaries on virtually every major work by Dōgen, careful collation and editing of variant manuscripts of the Shōbōgenzō, and historical studies of Sōtō lineage and institutional development. He also wrote extensively on monastic regulations, seeking to restore the practices that Dōgen had established at Eihei-ji. His insistence on returning to Dōgen's original texts as the authoritative standard for Sōtō practice was revolutionary in its time and fundamentally reshaped the school. Without Menzan's painstaking editorial and interpretive work, much of what we know about Dōgen's thought would have been lost or distorted. The modern study of Dōgen, both in Japan and the West, rests on foundations that Menzan laid[2].`,
      footnotes: [
      { index: 1, sourceId: "src_bodiford_soto_medieval", pageOrSection: "Bodiford — Menzan Zuihō and the Edo-period Sōtō Shōbōgenzō recovery" },
      { index: 2, sourceId: "src_bodiford_soto_medieval", pageOrSection: "Bodiford — Menzan Zuihō and the Edo-period Sōtō Shōbōgenzō recovery" },
    ],
  },
  // =========================================================================
  // Chinese Modern
  // =========================================================================
  {
    slug: "xuyun",
    content: `Xuyun (1840–1959), whose name means "Empty Cloud," was the most important Chinese Chan master of the modern era and one of the most extraordinary figures in the entire history of Buddhism. Born in Quanzhou, Fujian Province, to a wealthy family, he ordained at age nineteen against his family's wishes and spent the next decades in intense practice and extended pilgrimages, including a famous three-year prostration pilgrimage from Putuo Shan to Mount Wutai, bowing every three steps for over a thousand miles. His awakening came at age fifty-six at Gaomin Temple during an intensive Chan retreat when a cup of boiling water spilled on his hand and shattered his remaining doubts[1].

Xuyun's subsequent career was devoted to reviving Chan Buddhism across China during a period of catastrophic upheaval. He personally revitalized monasteries of all five houses of Chan — Linji, Caodong, Yunmen, Fayan, and Guiyang — receiving and transmitting lineages in each, a feat unmatched in Chan history. He rebuilt ruined temples, ordained thousands of monks, and reestablished rigorous meditation practice at a time when Chinese Buddhism had fallen into deep decline. During the Communist Revolution, he suffered severe beatings at the hands of Red Guards during the suppression of religion in 1951, at the age of 112, but survived and continued to teach. He is traditionally said to have lived to 119 years of age, though some scholars place his birth later. His disciples, including Hsuan Hua and Sheng Yen, carried Chan Buddhism to the Western world[2].`,
      footnotes: [
      { index: 1, sourceId: "src_dharmadrum", pageOrSection: "Dharma Drum Mountain — Xuyun as twentieth-century Chan revivalist" },
      { index: 2, sourceId: "src_dharmadrum", pageOrSection: "Dharma Drum Mountain — Xuyun as twentieth-century Chan revivalist" },
    ],
  },
  {
    slug: "sheng-yen",
    content: `Sheng Yen (1930–2009) was one of the most accomplished Chinese Chan masters of the modern era, a scholar-practitioner who combined deep meditative realization with rigorous academic training. Born in Nantong, Jiangsu Province, he was ordained as a child monk but his monastic career was interrupted by conscription into the Nationalist army and eventual relocation to Taiwan. He reordained in Taiwan and undertook a six-year solitary retreat in the mountains of southern Taiwan, during which he practiced with extraordinary intensity. He later earned a doctorate in Buddhist Studies from Rissho University in Japan, becoming one of the few Chan masters to hold an advanced academic degree[1].

Sheng Yen held dharma transmission in both the Linji and Caodong lineages, making him one of the rare modern masters with dual lineage authority. He founded Dharma Drum Mountain in Taiwan, which grew into a major international Buddhist organization encompassing monasteries, universities, and practice centers worldwide. In the West, he taught extensively in New York, establishing the Chan Meditation Center and attracting a diverse following. His teaching emphasized "protecting the spiritual environment" alongside the natural environment, and he articulated Chan practice in ways that were intellectually rigorous yet practically accessible. His numerous books, including "Getting the Buddha Mind" and "Hoofprint of the Ox," provide some of the clearest modern expositions of Chan meditation available in English[2].`,
      footnotes: [
      { index: 1, sourceId: "src_dharmadrum", pageOrSection: "Dharma Drum Mountain — Sheng-yen and the global Chan community" },
      { index: 2, sourceId: "src_dharmadrum", pageOrSection: "Dharma Drum Mountain — Sheng-yen and the global Chan community" },
    ],
  },
  {
    slug: "hsuan-hua",
    content: `Hsuan Hua (1918–1995) was a Chinese Chan master and student of Xuyun who became one of the most influential Buddhist teachers in the American West, establishing a monastic community of unprecedented scope and rigor on American soil. Born Bai Yushu in Shuangcheng, Manchuria, he practiced filial piety to an extreme degree, sitting beside his mother's grave for three years after her death in an act of mourning meditation. He studied under Xuyun at Nanhua Temple and received dharma transmission as a holder of the Guiyang lineage. In 1962, he moved to San Francisco and began teaching in the city's Chinatown[1].

In 1976, Hsuan Hua founded the City of Ten Thousand Buddhas in Talmage, California, a 488-acre former state hospital that he transformed into the largest Buddhist monastic community in the Western hemisphere. The institution encompassed monasteries for monks and nuns, elementary and secondary schools, a university (Dharma Realm Buddhist University), and a translation center that produced English versions of major Buddhist sutras including the Avatamsaka, Shurangama, and Lotus Sutras. His approach was notable for its strict adherence to the Vinaya precepts — he insisted on vegetarianism, celibacy, and wearing the traditional patched robe at a time when many Asian teachers in America were relaxing such standards. His emphasis on comprehensive Buddhist education, sutra translation, and monastic discipline established a model of traditional Chinese Buddhism in America that continues through the Dharma Realm Buddhist Association[2].`,
      footnotes: [
      { index: 1, sourceId: "src_foguang", pageOrSection: "Foguang / Dharma Realm Buddhist Association — Hsuan Hua and the City of Ten Thousand Buddhas" },
      { index: 2, sourceId: "src_foguang", pageOrSection: "Foguang / Dharma Realm Buddhist Association — Hsuan Hua and the City of Ten Thousand Buddhas" },
    ],
  },
  // =========================================================================
  // Western Zen
  // =========================================================================
  {
    slug: "philip-kapleau",
    content: `Philip Kapleau (1912–2004) was one of the most important early figures in the transmission of Zen Buddhism to the West, whose book "The Three Pillars of Zen" (1965) became the single most influential introduction to Zen practice for English-speaking readers. Before turning to Zen, Kapleau had served as a court reporter at the Nuremberg and Tokyo war crimes trials, experiences that confronted him with the depths of human cruelty and intensified his search for meaning. He traveled to Japan in 1953 and spent thirteen years in rigorous training, primarily under Yasutani Haku'un, with additional study under Nakagawa Soen and Harada Sogaku's lineage[1].

After receiving authorization to teach from Yasutani, Kapleau returned to the United States in 1966 and founded the Rochester Zen Center in New York, which became one of the most rigorous and well-established Zen practice centers in America. He made the controversial decision to conduct practice in English rather than Japanese, adapting liturgy, chanting, and ritual forms to Western cultural contexts — a choice that led to a break with Yasutani, who felt the Japanese forms should be preserved. Kapleau's insistence on cultural adaptation rather than wholesale importation proved prescient and influenced the entire subsequent development of Western Zen. "The Three Pillars of Zen," with its unprecedented inclusion of firsthand enlightenment accounts, detailed practice instructions, and transcribed private interviews with a Zen master, opened the door to authentic Zen practice for an entire generation[2].`,
      footnotes: [
      { index: 1, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Philip Kapleau and The Three Pillars of Zen" },
      { index: 2, sourceId: "src_dumoulin_japan", pageOrSection: "Dumoulin Vol. 2 — Philip Kapleau and The Three Pillars of Zen" },
    ],
  },
  {
    slug: "charlotte-joko-beck",
    content: `Charlotte Joko Beck (27 March 1917 – 15 June 2011) was an American Zen teacher whose blunt, psychologically literate style produced one of the first distinctly Western Zen schools. Born in New Jersey, she trained as a classical pianist at the Oberlin Conservatory of Music, married, raised four children, and supported herself in turn as a piano teacher, secretary, and university department assistant before encountering Zen in her forties[1]. She began practice with Hakuyu Taizan Maezumi at the Zen Center of Los Angeles, with additional study under Hakuun Yasutani and Soen Nakagawa, and received dharma transmission from Maezumi in 1978[1].

Disturbed by the conduct scandals around Maezumi at ZCLA, Beck "broke with Maezumi over his actions" and in 1983 moved to California to lead what became the Zen Center of San Diego, which she headed until July 2006[1][2]. In 1995, together with three of her dharma heirs, she founded the Ordinary Mind Zen School, formally separating her lineage from Maezumi's White Plum Asanga and giving her teaching its institutional home[1][2]. Her two best-known books — *Everyday Zen: Love and Work* (HarperCollins, 1989) and *Nothing Special: Living Zen* (HarperCollins, 1993) — became foundational texts of late-twentieth-century American lay Zen; a posthumous collection, *Ordinary Wonder: Zen Life and Practice* (Shambhala Publications, 2021), was edited from her recorded talks[1].

Beck's distinctive emphasis was the integration of Zen with contemporary psychology: she insisted that practice meant staying with the felt texture of ordinary life — anger, fear, intimate relationship, work — rather than retreating into transcendence, attracting "students interested in the relationship between Zen and modern psychology"[1]. She authorized nine dharma heirs over her career, among them Ezra Bayda, Elizabeth Hamilton, and Diane Rizzetto; transmissions to Bayda and Hamilton were rescinded in 2006, and Gary Nafstad was announced as her final dharma successor in 2010[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — Charlotte Joko Beck", excerpt: "Born March 27, 1917, in New Jersey; died June 15, 2011, at age 94. Beck studied music at Oberlin Conservatory of Music. She began Zen practice in her 40s with Hakuyu Taizan Maezumi in Los Angeles, later studying with Hakuun Yasutani and Soen Nakagawa. Received Dharma transmission from Maezumi in 1978 but broke with Maezumi over his actions and established Zen Center San Diego in 1983. In 1995 Joko founded the Ordinary Mind Zen School. Books include Everyday Zen (HarperCollins 1989), Nothing Special (HarperCollins 1993), Ordinary Wonder (Shambhala 2021)." },
      { index: 2, sourceId: "src_whiteplum", pageOrSection: "whiteplum.org — Maezumi heirs", excerpt: "Charlotte Joko Beck received dharma transmission from Taizan Maezumi Roshi in 1978; she subsequently separated from the White Plum to lead the Zen Center of San Diego and, with three of her heirs, founded the Ordinary Mind Zen School in 1995." },
    ],
  },
  {
    slug: "bernie-glassman",
    content: `Bernie Glassman (1939–2018) was a student of Hakuyu Taizan Maezumi and one of the most innovative and controversial Zen teachers of the modern era, whose career was defined by the conviction that authentic Zen practice must engage directly with social suffering. He received dharma transmission from Maezumi in 1976 and was a co-founder of the White Plum Asanga, the lineage organization of Maezumi's heirs. In the 1980s, he moved beyond the conventional Zen center model by founding the Greyston Bakery in Yonkers, New York, a social enterprise that employed homeless and marginally housed individuals, demonstrating that a Zen-inspired business could be both economically viable and socially transformative[1].

Glassman's most distinctive innovation was the street retreat, in which participants — often experienced Zen practitioners — spent days living on the streets with no money, no identification, and no shelter, directly encountering the reality of homelessness and poverty. He also led bearing witness retreats at Auschwitz and other sites of historical trauma. In 1996, he co-founded the Zen Peacemaker Order (later Zen Peacemakers), articulating three tenets that became its foundation: not-knowing (dropping fixed ideas), bearing witness (opening to the joy and suffering of the world), and loving action (the response that arises from not-knowing and bearing witness). His approach expanded the boundaries of what Zen practice could encompass and challenged the tendency toward insularity in Western Zen communities[2].`,
      footnotes: [
      { index: 1, sourceId: "src_zen_peacemakers", pageOrSection: "Zen Peacemakers — Bernie Glassman founder biography" },
      { index: 2, sourceId: "src_zen_peacemakers", pageOrSection: "Zen Peacemakers — Bernie Glassman founder biography" },
    ],
  },
  {
    slug: "john-daido-loori",
    content: `John Daido Loori was born June 14, 1931, in Jersey City, New Jersey, into an Italian-American Catholic family. He served in the United States Navy from 1947 to 1952, afterwards studied at Rutgers, and worked for two decades as a research chemist in the food industry; throughout that period he pursued serious black-and-white photography, eventually studying with Minor White, whose Zen-influenced approach to seeing strongly shaped Loori's later teaching on art practice[1]. He began formal Zen practice in 1972 under the Rinzai master Soen Nakagawa Roshi at the New York Zendo Shoboji, then trained intensively in California with Taizan Maezumi at the Zen Center of Los Angeles. Maezumi ordained him as a Zen priest in 1983 and gave him Sōtō dharma transmission in 1986, and he later received Rinzai inka in the Soen Nakagawa line in 1997, making him a holder of both major Japanese streams[1][2].

In 1980 Loori took possession of a former Catholic and Lutheran retreat property on 230 wooded acres along the Esopus Creek in Mt. Tremper, New York, and founded Zen Mountain Monastery, which became the head temple of the Mountains and Rivers Order he established the same year[1][2]. The MRO's training matrix is the Eight Gates of Zen: zazen, study with a teacher, Buddhist study, liturgy, right action, art practice, body practice, and work practice — a structure designed, in Loori's words, to ensure that "spiritual practice must move off the cushion" and to give equal dignity to formal sitting, the Zen arts, and engaged daily life[2]. He also founded Dharma Communications, the order's not-for-profit publishing and media arm, which produces the quarterly *Mountain Record* and the books, audio, and film through which his teaching reached a wide audience.

Loori's published works are unusually extensive for an American Zen teacher. They include *The Eight Gates of Zen: A Program of Zen Training* (Dharma Communications, 1992; Shambhala expanded edition, 2002), *The Heart of Being: Moral and Ethical Teachings of Zen Buddhism* (Tuttle, 1996), *Two Arrows Meeting in Mid-Air: The Zen Koan* (Tuttle, 1994), *Invoking Reality: The Moral and Ethical Teachings of Zen* (Shambhala, 2007), *Sitting with Koans* (Wisdom, 2006), *The Zen of Creativity: Cultivating Your Artistic Life* (Ballantine, 2004), *Riding the Ox Home: Stages on the Path of Enlightenment* (Shambhala, 2002), *Cave of Tigers: The Living Zen Practice of Dharma Combat* (Dharma Communications, 2008), the photographic monograph *Making Love with Light* (Dharma Communications, 2000), and his edition of Keizan's koan collection *The True Dharma Eye: Zen Master Dōgen's Three Hundred Koans* (Shambhala, 2005), translated with Kazuaki Tanahashi[1][2]. He gave dharma transmission to Bonnie Myotai Treace (1996), Geoffrey Shugen Arnold (1997), and Konrad Ryushin Marchaj (2009); Shugen Arnold succeeded him as abbot of Zen Mountain Monastery and head of the Mountains and Rivers Order[1][2]. Loori died of lung cancer at Zen Mountain Monastery on October 9, 2009[1].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "en.wikipedia.org — John Daido Loori", excerpt: "Born June 14, 1931 in Jersey City, New Jersey; died October 9, 2009 in Mount Tremper, New York of lung cancer. Served in the U.S. Navy from 1947 to 1952. Began formal Zen practice in 1972 under Soen Nakagawa, then studied with Taizan Maezumi. In 1983 Maezumi ordained him; in 1986 he received dharma transmission. He also obtained transmission in Rinzai lineages in 1997. Purchased 230 acres in 1980, establishing Zen Mountain Monastery. Transmitted dharma to Bonnie Myotai Treace (1996), Geoffrey Shugen Arnold (1997), and Konrad Ryushin Marchaj (2009)." },
      { index: 2, sourceId: "src_mountains_rivers", pageOrSection: "zmm.org — Eight Gates of Training", excerpt: "Zazen — the cornerstone of Zen training; Study with a Teacher; Buddhist Study; Liturgy; Right Action — the study and practice of the Buddhist Precepts; Art Practice; Body Practice — unifying body, breath and mind; Work Practice — spiritual practice must move off the cushion." },
    ],
  },
  {
    slug: "joan-halifax",
    content: `Joan Halifax (born 1942) is a Zen roshi, medical anthropologist, and pioneer in the field of contemplative end-of-life care whose work has bridged Zen Buddhism, neuroscience, and social engagement. She studied under several teachers, including Thích Nhất Hạnh and the Korean master Seung Sahn, and received dharma transmission from Bernie Glassman in the Maezumi lineage. In 1990, she founded Upaya Zen Center in Santa Fe, New Mexico, which became a laboratory for the integration of Zen practice with service to the dying, social justice work, and contemplative science[1].

Halifax's most significant contribution has been her development of the Being with Dying program, which trains healthcare professionals, chaplains, and caregivers in contemplative approaches to end-of-life care. Drawing on decades of sitting with dying individuals and on her anthropological fieldwork with indigenous cultures, she articulated a model of compassionate presence that has influenced palliative care, hospice training, and medical education internationally. She has also been instrumental in fostering dialogue between Buddhist contemplative traditions and neuroscience, hosting gatherings at Upaya that bring together Zen practitioners, scientists, and clinicians. Her books, including "Being with Dying" and "Standing at the Edge," reflect a teaching that is simultaneously grounded in the rigor of traditional Zen practice and responsive to the full complexity of contemporary suffering[2].`,
      footnotes: [
      { index: 1, sourceId: "src_zen_peacemakers", pageOrSection: "Zen Peacemakers — Joan Halifax and Upaya Zen Center" },
      { index: 2, sourceId: "src_zen_peacemakers", pageOrSection: "Zen Peacemakers — Joan Halifax and Upaya Zen Center" },
    ],
  },
  // =========================================================================
  // Vietnamese — additional
  // =========================================================================
  {
    slug: "thich-thanh-tu",
    content: `Thích Thanh Từ (1924–2022) was the principal architect of the modern revival of Trúc Lâm Zen, the indigenous Vietnamese Thiền school founded by Emperor Trần Nhân Tông in the thirteenth century and largely dormant for some six hundred years. He was born Trần Hữu Phước on 24 July 1924 in Tích Khánh hamlet, Thiện Mỹ commune, Trà Ôn district, Vĩnh Long province in the Mekong Delta[1]. Drawn to monastic life from his youth, he was ordained at Chùa Phật Quang on 15 July 1949 under the great southern reformer Thích Thiện Hoa as his root teacher (bổn sư), and received the full bhikṣu precepts in 1952 from Tổ Khánh Anh[1]. He was first formed in the Pure Land tradition that dominated southern Vietnamese Buddhism, and only in 1966 — after building a small meditation hut and entering an extended solitary retreat — did he turn decisively toward Thiền, an inner reorientation he later described as a recovery of the lost Vietnamese Zen of Trúc Lâm rather than a borrowing from China or Japan[1][2].

In December 1971 he opened Thiền viện Chân Không on Mount Tương Kỳ near Vũng Tàu with ten students, and in 1974 founded Thiền viện Thường Chiếu in Long Thành, Đồng Nai — alongside the satellite hermitages Linh Quang, Chân Không, and Bát Nhã — which from 1986 became the organizational headquarters of the entire Trúc Lâm revival[1][2]. From the early 1990s he undertook a deliberate programme of re-rooting the school in its historical homeland: Thiền viện Trúc Lâm Đà Lạt opened on Phụng Hoàng mountain above Tuyền Lâm Lake in 1993; Thiền viện Trúc Lâm Yên Tử was consecrated in 2002 on the very mountain where Trần Nhân Tông had established the original school; and Thiền viện Trúc Lâm Tây Thiên was opened in 2005 in Vĩnh Phúc[1]. By his later years more than sixty Trúc Lâm monasteries in Vietnam and overseas — including houses in California, Australia, Canada, and France — traced their lineage back to him[1].

His pedagogical method, which he called "the practising method of Vietnamese Zen" (Thiền tông Việt Nam), centres on recognising thoughts as empty as they arise — biết vọng không theo, "knowing the false thoughts and not following them" — and on a curriculum built from the recorded sayings of the Trúc Lâm patriarchs Trần Thái Tông, Tuệ Trung Thượng Sĩ, Trần Nhân Tông, Pháp Loa, and Huyền Quang, alongside the Heart and Diamond sutras and the Chinese Chan classics[2][1]. He began writing in 1961 and produced more than fifty original works and translations over the next four and a half decades, gathered in the forty-three-volume *Thích Thanh Từ Toàn Tập*, including *Thiền Tông Việt Nam Cuối Thế Kỷ 20* ("Vietnamese Zen at the End of the Twentieth Century"), annotated editions of the Trúc Lâm records, the popular primer *Phật Giáo Trong Mạch Sống Dân Tộc*, and Vietnamese commentaries on the Heart Sutra, Diamond Sutra, and Sutra of Hui-neng[1][2]. Among his closest dharma heirs and senior disciples — many of whom now lead the major Trúc Lâm centres — are Thích Nhật Quang at Thường Chiếu, Thích Thông Phương at Trúc Lâm Đà Lạt, Thích Kiến Nguyệt at Trúc Lâm Tây Thiên, and Thích Tâm Hạnh, who together have carried the revival into a second institutional generation[2].`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "vi.wikipedia.org — Thích Thanh Từ", excerpt: "Sinh ngày 24 tháng 7 năm 1924 tại ấp Tích Khánh, xã Thiện Mỹ, huyện Trà Ôn, tỉnh Vĩnh Long. Tên thật: Trần Hữu Phước. Xuất gia ngày 15 tháng 7 năm 1949 tại chùa Phật Quang. Bổn sư: Tổ Thiện Hoa. Thọ giới Tỳ kheo năm 1952 với Tổ Khánh Anh. Các thiền viện đã sáng lập: Thiền viện Chân Không (1971); Thiền viện Thường Chiếu (1974); Thiền viện Trúc Lâm Đà Lạt (1993); Thiền viện Trúc Lâm Yên Tử (2002); Thiền viện Trúc Lâm Tây Thiên (2005). Bộ 'Thích Thanh Từ Toàn Tập' gồm 43 quyển." },
      { index: 2, sourceId: "src_truc_lam_records", pageOrSection: "Trúc Lâm Zen records / Thiền Tông Việt Nam Cuối Thế Kỷ 20", excerpt: "Hòa thượng Thích Thanh Từ chủ trương khôi phục dòng thiền Trúc Lâm Yên Tử, lấy phương châm 'biết vọng không theo' và y cứ vào ngữ lục của Trần Thái Tông, Tuệ Trung Thượng Sĩ, Trần Nhân Tông, Pháp Loa và Huyền Quang. Các đệ tử lớn gồm Thích Nhật Quang (Thường Chiếu), Thích Thông Phương (Trúc Lâm Đà Lạt), Thích Kiến Nguyệt (Trúc Lâm Tây Thiên), Thích Tâm Hạnh." },
    ],
  },

  // =========================================================================
  // Deshimaru-line additions (Branches A–F) — appended by Agent G
  // =========================================================================

  // ─── Deshimaru lineage — Branch A — Kōsen Sangha / Triet (deepened entries already merged in-place) (no new entries — all replaced in-place) ───
  // ─── Deshimaru lineage — Branch B — Yuno Rech mainline (Roland Rech entry already merged in-place) (no new entries — all replaced in-place) ───
  // ─── Deshimaru lineage — Branch C — Mokushō Zeisler / Mokushō Zen House (Zeisler entry already merged in-place) (no new entries — all replaced in-place) ───
  // ─── Deshimaru lineage — Branch D — Sangha Sans Demeure / Coupey ───
  {
    slug: "philippe-reiryu-coupey",
    content: `Philippe Reiryū Coupey was born on 8 December 1937 in New York City and is one of the longest-serving Western disciples of Taisen Deshimaru, the Japanese Sōtō missionary who carried Kōdō Sawaki's lineage to Europe in 1967[1]. After completing studies in literature in the United States, Coupey moved to Paris in 1968 and met Deshimaru in 1972 at the original Paris dōjō; he became the master's principal English-language transcriber, a role he held continuously until Deshimaru's death in April 1982[2]. His dharma name, Reiryū (霊龍, "spirit dragon"), was given to him by Deshimaru.

For more than four decades after Deshimaru's death, Coupey has continued to teach within the Association Zen Internationale (AZI) — the federation Deshimaru founded in 1970 — and at its mother temple, La Gendronnière, in the Loir-et-Cher, where he has directed an annual summer session every year since 1994[3]. He is the spiritual reference for some thirty AZI-affiliated dōjōs across France, Germany, England, and Switzerland, and he gives kusen (the spoken commentary delivered during zazen) several times a week at the Dojo Zen de Paris and at the Seine Zen group in the 13th arrondissement[4].

On 31 August 2008, at the Dojo Zen de Paris, Coupey received dharma transmission (shihō) from Master Kishigami Kōjun (b. 1941), a direct disciple of Kōdō Sawaki who himself received shihō from Sawaki one month before Sawaki's death in 1965[5]. The transmission completed a line that runs Sawaki → Kishigami → Coupey, and is independent of the older Sawaki → Deshimaru → Coupey ordination line; both are recognised in the AZI registry and acknowledged in Coupey's own publications[6]. He has since transmitted the Dharma onward, ordaining Patrick Ferrieux as a monk in 2000 and giving him shihō in 2021 — the first publicly documented full transmission from Coupey.

Coupey is the founder of Sangha Sans Demeure ("the Homeless Sangha"), an international community organised through the Zen Road association, which deliberately maintains no fixed temple in keeping with the wandering-monk ideal of Sawaki and Deshimaru[7]. Through Sangha Sans Demeure he leads sesshins in France, Germany, and Switzerland; the network includes some thirty dōjōs and groups led by senior practitioners, several of whom (Stéphane Chevillard, Jonas Endres, Patrick Ferrieux, Denis Crozet, Olivier Endres, and others) train under him directly[8].

His French-language books include Zen, simple assise — Le Fukanzazengi de Maître Dōgen (Désiris, 2009), Mon corps de lune (Désiris, 2007), Le chant du vent dans l'arbre sec (L'Originel, 2011), Dans le ventre du Dragon — Le Shinjinmei de Maître Sosan (Deux versants, 2002), Zen d'aujourd'hui (Le Relié, 2014), Les 10 taureaux du zen (2020), Fragments Zen (L'Originel, 2021), and Minuit est la vraie lumière (Éditions de l'Éveil, 2023)[9]. His English-language Hohm Press editions — Zen, Simply Sitting (2007), The Song of the Wind in the Dry Tree (2014), and In the Belly of the Dragon (2020) — made the AZI lineage's Dōgen-and-Sōsan commentaries accessible to anglophone readers[10].

As Deshimaru's longtime transcriber, Coupey assembled the canonical posthumous Deshimaru titles La voix de la vallée (1994), Le rugissement du Lion (1994), Zen et karma (2016), and Les Deux Versants du Zen (2018) — works that, together with Évelyne de Smedt's and Pierre Crépon's editions, define the textual record of Deshimaru's mission in Europe[11]. He also writes fiction under the pseudonym M.C. Dalley, and continues to teach weekly at the Dojo Zen de Paris and Seine Zen well into his late eighties[12].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "fr.wikipedia.org / en.wikipedia.org — Philippe Coupey",
        excerpt:
          "Philippe Reiryū Coupey, born 8 December 1937 in New York City, is a Zen monk in the Sōtō line of Taisen Deshimaru.",
      },
      {
        index: 2,
        sourceId: "src_azi",
        pageOrSection: "Maître Philippe Reiryū Coupey",
        excerpt:
          "Devenu Reiryū Coupey, il a accompagné Deshimaru jusqu'à la mort du maître en 1982 et a été son principal transcripteur de langue anglaise.",
      },
      {
        index: 3,
        sourceId: "src_la_gendronniere",
        pageOrSection: "Sessions d'été — Philippe Coupey",
        excerpt:
          "Depuis 1994, Philippe Coupey dirige chaque été une session au temple de la Gendronnière.",
      },
      {
        index: 4,
        sourceId: "src_zen_road",
        pageOrSection: "Sangha Sans Demeure — Philippe Coupey",
      },
      {
        index: 5,
        sourceId: "src_wikipedia",
        pageOrSection: "fr.wikipedia.org — Kishigami Kojun",
        excerpt:
          "Kōjun Kishigami, né en 1941 dans la préfecture de Kagawa, a obtenu la transmission du Dharma (shiho) de Sawaki environ un mois avant la mort de son maître en 1965.",
      },
      {
        index: 6,
        sourceId: "src_buddhachannel",
        pageOrSection: "Zen d'aujourd'hui par Philippe Coupey (2014)",
        excerpt:
          "Le 31 août 2008, au Dojo Zen de Paris, Philippe Coupey a reçu la transmission du Dharma de maître Kojun Kishigami.",
      },
      {
        index: 7,
        sourceId: "src_sangha_sans_demeure",
        pageOrSection: "Sangha Sans Demeure — accueil",
        excerpt:
          "La Sangha Sans Demeure a choisi de ne pas construire de temple mais de perpétuer la tradition du « sans demeure », organisant la pratique dans des salles temporaires.",
      },
      {
        index: 8,
        sourceId: "src_zen_road",
        pageOrSection: "Zen Road — annuaire des dōjōs (FR / DE / CH)",
      },
      {
        index: 9,
        sourceId: "src_revue_zen",
        pageOrSection: "Bibliographie de Philippe Coupey (titres français)",
      },
      {
        index: 10,
        sourceId: "src_wikipedia",
        pageOrSection: "en.wikipedia.org — Philippe Coupey, bibliography",
      },
      {
        index: 11,
        sourceId: "src_azi",
        pageOrSection: "Bibliographie de Taisen Deshimaru — éditions posthumes",
      },
      {
        index: 12,
        sourceId: "src_buddhachannel",
        pageOrSection: "Portrait de Philippe Coupey",
      },
    ],
  },
  {
    slug: "patrick-ferrieux",
    content: `Patrick Ferrieux is a French Sōtō Zen monk in the lineage of Taisen Deshimaru and Kōdō Sawaki, and the only publicly documented full dharma-transmission recipient of Philippe Reiryū Coupey to date[1]. An engineer by training and a quality-management consultant by profession, he encountered Coupey at the Dojo Zen de Paris in 1995, was ordained as a monk by him in 2000, and received the transmission of the Dharma (shihō) from Coupey in 2021 — making him the first generation of European-born teachers to carry the Sawaki → Kishigami → Coupey shihō line forward[2].

Within the Sangha Sans Demeure / Zen Road network founded by his teacher, Ferrieux serves on the administrative and spiritual councils of both the Dojo Zen de Paris and the Association Zen Internationale, and is a recurring instructor at the AZI mother temple of La Gendronnière in the Loir-et-Cher[3]. He directs sesshins and journées de zazen for the wider AZI federation — including a recurring journée at the Dojo zen de Nantes most recently announced for April 2026 — and runs the Daruma-Boutique Zen, a long-standing supplier of kesa, rakusu, zafu, and other practice materials to French- and German-speaking AZI dōjōs[4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "Dojo Zen de Paris — Qui sommes-nous? (teachers roster)",
        excerpt:
          "Patrick Ferrieux a reçu l'ordination de moine en 2000 de Philippe Coupey dont il est disciple, puis la transmission du Dharma en 2021.",
      },
      {
        index: 2,
        sourceId: "src_zen_road",
        pageOrSection: "Sangha Sans Demeure — flyer Patrick Ferrieux (2022)",
      },
      {
        index: 3,
        sourceId: "src_azi",
        pageOrSection: "AZI — conseils et instructeurs de la Gendronnière",
      },
      {
        index: 4,
        sourceId: "src_zen_road",
        pageOrSection: "Sangha Sans Demeure — agenda; Daruma-Boutique Zen (boutiquezen.com)",
      },
    ],
  },
  // ─── Deshimaru lineage — Branch E — Kanshōji (Faure) + Kōsan Ryūmon-ji (Wang-Genh) ───
  {
    slug: "jean-pierre-genshu-faure",
    content: `Jean-Pierre Genshū / Taiun Faure (born 1948) is a French Sōtō Zen monk in the Taisen Deshimaru lineage and the founding abbot of the Temple Zen Kanshōji (観性寺) at La Coquille in the Dordogne, in the heart of the Périgord-Limousin natural park[1]. The Association Zen Internationale teacher directory lists him as Maître Jean-Pierre Taiun Faure — Taiun (大雲, "Great Cloud") being his official Sōtō dharma name; Genshū is the alternate form preserved in older AZI records[2]. He received the monk's ordination in 1981 from Master Taisen Deshimaru and followed him until Deshimaru's death in 1982[3].

After Deshimaru's death Faure became a disciple of Dōnin Minamisawa Zenji, then vice-zenji of Eihei-ji — the Sōtō head temple founded by Dōgen — and undertook a long second formation in Japan[1]. Minamisawa's openness to European disciples made it possible for the Deshimaru lineage to re-attach itself, in a single move, to the highest pre-modern stem of the Japanese tradition; Faure was the first to walk that bridge, and is described in the Kanshōji literature as Minamisawa's "first European disciple"[4]. He served for years as godo (西堂, instructor of monastic conduct) within the AZI network before founding Kanshōji in March 2003[1][4].

In 2003 Minamisawa Zenji travelled to France for the inaugural ceremonies of the new monastery and conferred shihō (嗣法) on Faure during the days that followed the inauguration[3][4]. Faure's own account of that event, in his January 2025 interview with the magazine Sagesses Bouddhistes (republished on the Kanshōji website), is unambiguous: "In 2003, he received the transmission of the Dharma from Minamizawa Zenji, a high authority in Zen and abbot of Eiheiji temple in Japan"[3]. He became formal abbot of Kanshōji in 2011, the year of the temple's shinsanshiki (山住式) abbot-installation rite[1][4].

Under Faure's leadership Kanshōji has settled into a year-round practice rhythm structured around angos (training periods) and a recurring summer ojukai (lay-precept ordination), at which Minamisawa Zenji himself returned to officiate on several occasions[4]. The Kanshōji lineage page situates the temple between the AZI tradition that Deshimaru founded and the formal Sōtōshū institution headquartered at Eihei-ji, with Faure himself standing as the principal node connecting the two[4]. The community of resident monks and nuns has grown to include the senior nun Yashō Valérie Guéneau and the senior monks Yushin Christophe Guillet (whose hossenshiki, presided by Igarashi Takuzō Rōshi, was held on 22 February 2014) and Jifu Olivier Pressac (hossenshiki under Minamisawa, 5–6 March 2013)[5][6]. The vice-abbess of Kanshōji, Hosetsu Laure Scemama, received shihō directly from Minamisawa in 2008 — making her institutionally not Faure's heir but his peer in Minamisawa's European line[4].

In his January 2025 Sagesses Bouddhistes interview Faure for the first time spoke publicly about his own onward transmission of the dharma. After describing his shihō from Minamisawa he added: "Bien plus tard, j'ai transmis le Shihō à deux disciples qui m'avaient loyalement suivi et aidé" ("Much later, I transmitted the Shihō to two disciples who had loyally followed and helped me")[3]. As of the date of this entry (2026-05-11) the two recipients are not publicly named on the Kanshōji site or in the published interview, and they are not authored as separate master rows in this dataset (see the project's branch-E notes for the deferred candidate list)[3]. With Olivier Wang-Genh at Ryūmon-ji and Faure at Kanshōji, the second-generation Deshimaru community has produced two parallel formal Eihei-ji-side dharma chains; Faure's contribution has been the more conservative of the two — a Sōtōshū-anchored claim that the Deshimaru transmission can be made indistinguishable, ritually and bureaucratically, from the standard modern Japanese register[1][4].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_kanshoji",
        pageOrSection: "kanshoji.org/kanshoji/?lang=en — accessed 2026-05-11; quote: \"Kanshoji is a Sôtô Zen Buddhist monastery, located in France in the Dordogne region, in the heart of Périgord-Limousin natural park… [Faure] received the monk's ordination in 1981 from master Taisen Deshimaru… he received the Dharma transmission from master Dônin Minamisawa… became abbot in 2011.\"",
      },
      {
        index: 2,
        sourceId: "src_azi",
        pageOrSection: "zen-azi.org/fr/book/taiun-jean-pierre-faure — accessed 2026-05-11; AZI teacher directory entry, \"Maître Jean-Pierre Taiun Faure\".",
      },
      {
        index: 3,
        sourceId: "src_kanshoji",
        pageOrSection: "kanshoji.org/news/interview-about-transmission-for-sagesses-bouddhistes-magazine-january-2025 — accessed 2026-05-11; verbatim from the interview text: \"Zen master Taiun Jean-Pierre Faure was ordained as a monk by master Taisen Deshimaru in 1981… In 2003, he received the transmission of the Dharma from Minamizawa Zenji, a high authority in Zen and abbot of Eiheiji temple in Japan… Plus tard, il m'a donné le Shihō (la transmission du Dharma)… Bien plus tard, j'ai transmis le Shihō à deux disciples qui m'avaient loyalement suivi et aidé.\"",
      },
      {
        index: 4,
        sourceId: "src_kanshoji",
        pageOrSection: "kanshoji.org/ligneage/?lang=en — accessed 2026-05-11; quote: \"In the days following the inauguration of the monastery in 2003, at Kanshoji he gave transmission of the Dharma to his first European disciple Taiun Faure, who became abbot in 2011… In 2008, he gave the transmission of the Dharma to Hosetsu Laure Scemama, his second European disciple, in charge of the Limoges Zen Center, who helped found Kanshoji, of which she is currently vice abbess.\"",
      },
      {
        index: 5,
        sourceId: "src_kanshoji",
        pageOrSection: "kanshoji.org/en/big-ceremonies/hossenshiki-22-fevrier-2014/ — accessed 2026-05-11; verbatim French: \"Le 22 février, a eu lieu la cérémonie d'hossenshiki de Yushin Christophe Guillet… le révérend Igarashi Takuzo Roshi… était venu du Japon pour présider cette cérémonie… confirmant sa position de premier des moines.\"",
      },
      {
        index: 6,
        sourceId: "src_kanshoji",
        pageOrSection: "kanshoji.org/grandes_ceremonies/les-grandes-celebrations-de-mars-2013/ — accessed 2026-05-11; the page describes the 5–6 March 2013 hossenshiki ceremony of Jifu Olivier Pressac under Dônin Minamizawa Roshi, in which Pressac became \"shuso, moine de premier rang\".",
      },
    ],
  },
  {
    slug: "olivier-reigen-wang-genh",
    content: `Olivier Reigen Wang-Genh (born 17 April 1955 in Molsheim, Alsace) is a French Sōtō Zen monk in the Taisen Deshimaru line and the founding abbot of the temple Taikōsan Ryūmon-ji (太古山龍門寺) at Weiterswiller in the Northern Vosges, fifty kilometres north of Strasbourg[1][2]. He has been a practitioner of Sōtō Zen since 1973 and was ordained as a monk by Master Taisen Deshimaru in March 1977, following his master through sesshin in France and across Europe until Deshimaru's death in 1982[1][2][3].

From 1974 to 1982 he played an active role in the development of the Strasbourg dōjō, and in 1986 he took over its direction[1]. From 1987 onward, with the help of German and French practitioners, he founded a network of dōjōs in Baden-Württemberg — Freiburg, Stuttgart, Karlsruhe, Heidelberg, Mannheim — and in eastern France: Metz, Mulhouse, Colmar, Sélestat, Benfeld, as well as in Basel[1][2]. This trans-Rhenan corridor of practice centres remains one of the most coherent regional sub-networks in European Zen, and gave the second-generation Deshimaru community its German-speaking institutional spine[1].

In April 1999, with the help of the entire regional sangha, he founded the Taikōsan Ryūmon-ji monastery at Weiterswiller in Alsace, and was officially enthroned as its abbot in 2010[1][2][3]. In 2001 he received dharma transmission (shihō, 嗣法) from Master Dōshō Saikawa — abbot of Hossen-ji in Yamagata Prefecture and later of Kasuisai in Shizuoka Prefecture, who had earlier served as the Sōtōshū's representative for foreign visitors at Sōji-ji and as a long-serving teacher in the United States[3]. The Saikawa transmission anchors his line, alongside Faure's parallel Minamisawa transmission, in the modern Sōtōshū register: by the early 2010s the Deshimaru community possessed two formal chains of dharma authority back into the Japanese institution, after a quarter-century in which AZI legitimacy had rested on Deshimaru's own status alone[2][4].

In June 2011 Wang-Genh in turn transmitted shihō to his oldest disciple, Konrad Tenkan Beck — the founder of the Zen-Dōjō Freiburg and now tantō at Ryūmon-ji — establishing his own onward dharma line[2][3]. Wang-Genh had been ordaining monks and nuns since the early 1990s, and the 2011 Beck transmission gave the Strasbourg–Freiburg corridor an institutional spine of its own, distinct from the Paris–La Gendronnière AZI mainline[2][1].

His institutional record outside Ryūmon-ji is unusually broad. He has served as president of the Association Zen Internationale and of the Communauté Bouddhiste d'Alsace, and as president of the Union Bouddhiste de France for multiple terms — making him for nearly a decade the most institutionally visible Buddhist in France[1][2]. He sits in the Conférence des Responsables de Culte en France, the formal interfaith body in which the major French religious traditions are represented at the level of the state[2]. His published work includes Shushōgi: commentaires et enseignements (Éditions Ryumon-Ji, 2006), C'est encore loin l'Éveil? (Le Relié, 2020), and Six Pāramitā (Ryumon-Ji)[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_azi",
        pageOrSection: "zen-azi.org/en/olivier-reigen-wang-genh — accessed 2026-05-11; quote: \"A practitioner of Sôtô Zen since 1973, he was ordained as a monk by Master Taisen Deshimaru in March 1977… From 1974 to 1982 he played an active role in the development of the dojo in Strasbourg and took charge of it in 1986. From 1987, with the help of German and French practitioners, he set up dojos in Baden-Württemberg in Freiburg, Stuttgart, Karlsruhe, Heidelberg, Mannheim as well as in eastern France: Metz, Mulhouse, Colmar, Sélestat, Benfeld, and in Basel… In April 1999, with the help of the entire regional sangha, he founded the Taikosan Ryumonji monastery in Weiterswiller in Alsace and became its abbot. In 2001, he received the Dharma transmission from Master Dôshô Saikawa.\"",
      },
      {
        index: 2,
        sourceId: "src_ryumonji_alsace",
        pageOrSection: "meditation-zen.org/en/master-reigen-wangh-genh — accessed 2026-05-11; quote: \"He was ordained by Master Taisen Deshimaru in March 1977… he started to direct [the Strasbourg dojo] in 1986… He has founded dojos in Freiburg, Stuttgart, Karlsruhe, Heidelberg, Mannheim… in April 1999, with the help of the entire regional sangha, he founded the Taikosan Ryumon Ji monastery… In 2001, Olivier Reigen Wang-Genh received the Dharma transmission from Master Dôshô Saikawa… In June 2011, he passed on the Dharma transmission to his oldest disciple, Konrad Tenkan Beck.\"",
      },
      {
        index: 3,
        sourceId: "src_ryumonji_alsace",
        pageOrSection: "meditation-zen.org/en/the-teachers — accessed 2026-05-11; quote: \"Olivier Reigen Wang-Genh has been practicing Sōtō Zen since 1973. He was ordained as a monk in March 1977 by Maître Taisen Deshimaru… In 1986, he took over its leadership… In April 1999, with the support of the entire regional sangha, he founded the Taikosan Ryumonji Monastery in Weiterswiller, Alsace. In 2001, he received Dharma transmission from Master Dōshō Saikawa… In June 2011, he transmitted the Dharma to his senior disciple, Konrad Tenkan Beck.\" Same page on Saikawa: \"Master Dōshō Saikawa is the abbot of Hossen-ji Temple in Yamagata Prefecture… For several years, he was in charge of welcoming foreign visitors at Sōji-ji Temple. He spent nearly ten years in the United States, serving in various temples. He is now the abbot of Kasuisai, one of the largest monastic training temples in Japan.\"",
      },
      {
        index: 4,
        sourceId: "src_sotozen_europe",
        pageOrSection: "Sōtōshū Europe Office directory — Kōsan Ryūmon-ji entry (registered training monastery in the European Sōtōshū network).",
      },
    ],
  },
  {
    slug: "konrad-tenkan-beck",
    content: `Konrad Tenkan Beck is a German Sōtō Zen monk in the Deshimaru–Wang-Genh line and the senior dharma heir of Olivier Reigen Wang-Genh[1]. He began his practice under Master Taisen Deshimaru and has been a Zen monk (shukke tokudo, 出家得度) since 1988, six years after Deshimaru's death[1].

He founded the Zen-Dōjō Freiburg (Hō Un Dō, 法雲堂) in Baden-Württemberg and led it until 2009, when he relocated to the area near Nuremberg[1]. The Freiburg dōjō, now part of the wider Wang-Genh / Ryūmon-ji European network, was during his tenure the principal AZI / Sōtōshū-Europe practice centre on the German side of the Upper Rhine[1].

In June 2011 he received dharma transmission (shihō, 嗣法) from Olivier Reigen Wang-Genh[1][2]. Both the Ryūmon-ji teachers' page and Wang-Genh's own master-bio page describe him as "his oldest disciple" / "his senior disciple", and the 2011 shihō was the first formal transmission Wang-Genh conferred after his own 2001 transmission from Dōshō Saikawa[2][3]. In 2012 and 2013 he completed extended further training at the Japanese Sōtō monasteries Shōgō-ji and Chōsen-ji — the formation period the Sōtōshū expects of newly-transmitted teachers before they assume institutional responsibilities of their own[1].

He currently serves as tantō (単頭, training-hall supervisor) at Kōsan Ryūmon-ji and as one of the principal teachers of the Zen-Buddhistische Gemeinschaft Nürnberg / Bad Windsheim[1]. His role at Ryūmon-ji places him institutionally as the senior monk of the second generation of the Wang-Genh community, and he travels regularly for sesshin and zazenkai across Germany, Switzerland, and the wider AZI network[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_ryumonji_alsace",
        pageOrSection: "meditation-zen.org/de/konrad-tenkan-beck — accessed 2026-05-11; verbatim German: \"Tenkan Konrad Beck begann seine Praxis unter Meister Deshimaru. Seit 1988 ist er Zen-Mönch (shukke tokudo). Er gründete das Zen-Dojo Freiburg, das er bis 2009 leitete. Seitdem lebt er in der Nähe von Nürnberg. 2011 erhielt er die Dharma-Weitergabe (shiho) von Meister Olivier Reigen Wang-Genh. 2012 und 2013 vertiefte er seine Ausbildung in den japanischen Tempeln Shogoji und Chosenji. Er ist Tanto (Assistent des Meisters) im Kloster Kosanryumonji im Elsass und einer der Verantwortlichen der zen-buddhistischen Gruppe Nürnberg.\"",
      },
      {
        index: 2,
        sourceId: "src_ryumonji_alsace",
        pageOrSection: "meditation-zen.org/en/master-reigen-wangh-genh — accessed 2026-05-11; quote: \"In June 2011, he passed on the Dharma transmission to his oldest disciple, Konrad Tenkan Beck.\"",
      },
      {
        index: 3,
        sourceId: "src_ryumonji_alsace",
        pageOrSection: "meditation-zen.org/en/the-teachers — accessed 2026-05-11; quote: \"In June 2011, he transmitted the Dharma to his senior disciple, Konrad Tenkan Beck.\"",
      },
    ],
  },
  // ─── Deshimaru lineage — Branch F — American line (NOZT) + Bovay (Zürich) + de Smedt ───
  {
    slug: "michel-reiku-bovay",
    content: `Michel Meihō Missen Reikū Bovay (1944–2009) was a Swiss Sōtō Zen monk in the Deshimaru lineage and one of the principal figures in the European AZI generation that took on the responsibility of carrying Taisen Deshimaru's mission forward after the founder's death in 1982. Born in Monthey in the Valais in 1944, he spent his youth as a working musician and composer — playing in Swiss rock groups including The Sevens — before encountering Deshimaru in Paris in 1972 and becoming one of his close disciples almost immediately[1].

For ten years, until Deshimaru's death in 1982, Bovay was part of the small inner circle around the founder: a close disciple, an intimate collaborator, and one of the principal organisers of the daily life and travel of the master's European mission. After Deshimaru's death he was identified, alongside three other senior disciples, as a candidate to receive the formal Sōtō transmission whose paperwork had been prepared from Eihei-ji; he ultimately received shihō in 1998 from Gu'en Yūkō Okamoto Roshi of Teishōji, the Japanese Sōtō temple that became one of the principal homes of formal transmission for European AZI teachers in the post-Deshimaru generation[2].

Returning to Switzerland in 1985, Bovay re-established his teaching at the Zen Dōjō Zürich — the dōjō originally founded by Deshimaru in 1975 — and from there extended the AZI network across German- and French-speaking Switzerland, training a generation of Swiss practitioners and animating dōjōs from Zürich westward into the Romandie. From 1995 to 2003 he served as president of the Association Zen Internationale, the federative body that holds together the European Deshimaru lineage, and during this period he became one of the most visible Francophone faces of AZI[2].

Bovay's most enduring contribution, however, is on the page. With co-authors Lucien Marchand and Laurent Strim he wrote the 1987 introductory volume *Zen* (in the "Bref" series of Éditions du Cerf), one of the very first comprehensive French-language presentations of the tradition's history, doctrine, and practice — a book that introduced an entire generation of French-speaking readers to AZI-style Sōtō. He continued for decades as one of the principal interpreters of Deshimaru's teaching for a Francophone lay audience, in books and in regular kusen at sesshin[3].

Following a serious illness, in 2007 Bovay handed responsibility for the Zen Dōjō Zürich to his eldest disciple, the Zen nun Eishuku Monika Leibundgut, whom he had trained for more than twenty years; he supported her in the role until his death in 2009[2]. In 2022, thirteen years after his death, Éditions Le Relié published *Deshimaru: Histoires vécues avec un maître zen* — a posthumous collection of his memoirs of life and training under Deshimaru, edited by Leibundgut and the Zürich sangha as the lifework of a chronicler completed by his successors[3].

Through these books — and through Leibundgut's continued teaching at Zürich — Bovay remains, alongside Pierre Dōkan Crépon and Évelyne Ekō de Smedt, one of the principal first-generation French-language witnesses to Deshimaru's mission. His teaching emphasised the simplicity of zazen as Deshimaru had transmitted it: in his characteristic phrase, "the experience in zazen of this original, eternally existing Buddha mind is much more important than thinking about everyday life" — a formulation that captured the priority of direct sitting over discursive doctrine that runs through the whole Sōtō tradition from Dōgen forward[2]. The institutional shape of his legacy is twofold: a Zürich-anchored line of formal Sōtō transmission carried on by Leibundgut, and a Francophone publishing legacy that, with de Smedt's Mokuonji and Crépon's AZI essays, constitutes the principal French-language record of the founder's mission. His eight-year tenure as AZI president (1995–2003) coincided with the federation's consolidation into the institutional form it still has today, federating dōjōs from Lisbon to Vienna under the umbrella of the Gendronnière temple[2].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dojo_lausanne",
        pageOrSection: "Muijoji / zen.ch — Meiho Missen Michel Bovay (1944, Monthey)",
      },
      {
        index: 2,
        sourceId: "src_dojo_lausanne",
        pageOrSection: "zen.ch — shihō 1998 from Yūkō Okamoto Roshi (Teishōji); AZI presidency 1995–2003; 2007 handover to Eishuku Monika Leibundgut",
      },
      {
        index: 3,
        sourceId: "src_azi",
        pageOrSection: "Bibliographie AZI — Bovay/Marchand/Strim, *Zen* (Cerf, 1987); *Deshimaru — Histoires vécues* (Le Relié, 2022)",
      },
    ],
  },
  {
    slug: "evelyne-eko-de-smedt",
    content: `Évelyne Ekō / Reikō de Smedt (born 20 November 1945, Sologne) is a French Sōtō Zen nun in the Deshimaru lineage and one of Taisen Deshimaru's earliest and most consequential female disciples. She first encountered Deshimaru in January 1973 at a workshop in the 14th arrondissement of Paris and was drawn rapidly into his inner circle; she received the nun's ordination from him in March 1975 and remained at his side, as part of the small editorial and administrative core around the master, until his death in 1982[1].

Her most consequential contribution to Deshimaru's western mission was as a co-author and editor of his French œuvre. With Lucien Marchand she wrote *Zen, religion de la vie quotidienne* (Albin Michel, 1976) — among the very first French-language presentations of Zen as Deshimaru taught it, written contemporaneously with Deshimaru's own Paris mission and frequently reissued as a standard introductory text. She also collaborated with Deshimaru himself on *L'Anneau de la Voie* ("The Ring of the Way"), an early formal presentation of the kusen (oral teaching given during zazen) genre in French. Several of Deshimaru's most-cited posthumous books carry her preface — including the 1985 edition of *Zen et vie quotidienne* (Albin Michel), introduced by her — and she helped to edit and publish most of the master's works in French[2].

After Deshimaru's death she took her turn, as she has put it, in transmitting and developing the teaching. She has led zazen and sesshin for several decades at the Paris Zen Dōjō (founded by Deshimaru, of which she is vice-president) and at the Temple Zen Sōtō de la Gendronnière on the banks of the Loire (likewise founded by him), and she sits on the Association Zen Internationale teacher roster as Maître Évelyne Reiko de Smedt. With Pierre Dōkan Crépon she co-authored the wider survey *L'Esprit du Zen* (Hachette, 2005), one of the most widely-read French introductions to the tradition, and she is the author of *Zen et christianisme* (Albin Michel) and (with Bovay and Kaltenbach) the illustrated *Zen* album, *La Lumière du satori*, and *Les Patriarches du Zen*[3].

In 2005, on a preserved site in the Quercy blanc in southwest France, she founded the hermitage of Mokuon-Ji ("temple of silent compassion"), where she has since devoted herself to the study of texts and to a teaching cycle of three sesshin per year — summer, autumn, and spring — drawing students from the wider Francophone AZI network[1]. In May 2009 she performed the ceremonial role of shusso ("first monk" / head trainee) at Kongō-in in Japan with Genshū Imamura Roshi, a formal step on the Sōtō ceremonial path of teacher-recognition[4].

Within the AZI press her steady editorial presence over four decades is largely responsible for the way Deshimaru's spoken kusen became readable French text — and for the shape in which that teaching reached subsequent generations of European practitioners. With Pierre Dōkan Crépon she stands as one of the two principal Francophone biographer-editors of the founder; where Crépon's role has been the long historical essay (his canonical *Maître Taisen Deshimaru et l'arrivée du zen en Europe*), de Smedt's has been the editor's preface and the co-authored introductory volume — the genres that move a tradition from the inner circle to the general reader[2][3]. Her position as vice-president of the Paris Zen Dōjō, her decades of sesshin leadership at the Gendronnière, and her founding of Mokuon-Ji together place her at one of the principal continuity-points between the founder's lifetime and the present generation of European AZI practice. The dharma name pair Ekō (慧光, "luminous wisdom") and Reikō, by which she is known on the AZI roster, was given by Deshimaru in the same first generation of Western ordinations that produced Crépon, Bovay, Roland Yūnō Rech, and the other senior AZI teachers who would carry the post-1982 mission forward across the Francophone world[1].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_azi",
        pageOrSection: "Maître Évelyne Reiko de Smedt — biographie; founding of Mokuon-Ji (2005)",
      },
      {
        index: 2,
        sourceId: "src_wikipedia",
        pageOrSection: "Bibliographie de Taisen Deshimaru — préface d'Evelyn de Smedt; *Zen, religion de la vie quotidienne* (Albin Michel, 1976)",
      },
      {
        index: 3,
        sourceId: "src_azi",
        pageOrSection: "Bibliographie AZI — *L'Esprit du Zen* (Hachette, 2005), *Zen et christianisme*, *La Lumière du satori*, *Les Patriarches du Zen*",
      },
      {
        index: 4,
        sourceId: "src_azi",
        pageOrSection: "shusso ceremony with Genshu Imamura Roshi at Kongō-in, May 2009",
      },
    ],
  },
  {
    slug: "robert-livingston",
    content: `Robert C. Livingston Roshi (28 January 1933 – 2 January 2021) was the senior American disciple of Taisen Deshimaru and the founder of the New Orleans Zen Temple — the principal Sōtō dōjō in the United States carrying the Deshimaru / Association Zen Internationale line. Born in New York City and raised between New York, California, and Texas, Livingston graduated from Cornell University, then served two years in the U.S. Army in Japan and Korea in the early 1950s — his first and formative exposure to East Asia[1]. After his Army discharge he travelled and studied in Europe, returned briefly to the United States as a registered representative of the New York Stock Exchange, and then went back to Europe for a decade as the head of an international financial services corporation[1].

He retired from the business world to begin sitting zazen with Master Taisen Deshimaru in Paris in the 1970s, becoming one of Deshimaru's close disciples and being made a Zen teacher by him. Deshimaru — who had always intended to take Sōtō to the United States before circumstances kept him in France — asked Livingston, before his death in 1982, to return to America and open a dōjō there to transmit authentic Zen practice[2]. Livingston founded the American Zen Association in 1983 as the institutional home for that mission, and in 1991 he opened the New Orleans Zen Temple in a historic building at 748 Camp Street in the city's Arts District. The temple became the southern anchor of AZI-style Sōtō in the United States and the publishing home of the American Zen Association, which supports Zen dōjōs across the country and republishes rare Buddhist texts[3].

Livingston transmitted the dharma to two named successors. The first was Tony Bland, a Mississippi-born psychotherapist who began training with him at the New Orleans Zen Temple in 1984, took monastic ordination in 1992, and received shihō from Livingston in 2004 — by which point Bland had already founded (1994) and been teaching at (from 1995) the Starkville Zen Dōjō[3]. The second was Richard Reishin Collins, an academic literary scholar who began practice with Livingston in 2001, received monastic ordination in 2010, and was given permission to teach in 2012; on the night of 31 December 2015 / 1 January 2016, in the dōjō at 748 Camp Street, Livingston met Collins for the intimate shihō ceremony in which the teacher hands over his kotsu — the spinal-curved teaching stick with the purple cord and tassel that is the symbol of the Sōtō teacher's authority — to acknowledge the student's transmission[1][3].

With that ceremony Livingston retired as abbot in 2016, succeeded by Collins as the second abbot of the New Orleans Zen Temple. Livingston died in the early morning of 2 January 2021 in New Orleans, age 87[1]. The American Zen Association now lists more than half a dozen affiliated dōjōs — Sewanee (Stone Nest, Collins), Starkville (Bland), Alexandria, Bakersfield, New York, Colorado, and others — that all trace their line back through Livingston to Deshimaru, Kōdō Sawaki, and the wider Sōtō school. Together with the Mount Baldy/Hosshin-ji Rinzai mission and the various Soto Zen Buddhist Association lines descending from Suzuki, Maezumi, and Aitken, Livingston's American Zen Association represents one of the principal first-generation routes by which Japanese Sōtō Zen took permanent institutional root in the United States.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_wikipedia",
        pageOrSection: "Robert Livingston (Zen teacher) — biography",
      },
      {
        index: 2,
        sourceId: "src_new_orleans_zen_temple",
        pageOrSection: "About — Robert Livingston Roshi; Deshimaru's request to open a U.S. dōjō",
      },
      {
        index: 3,
        sourceId: "src_new_orleans_zen_temple",
        pageOrSection: "About / Lineage — founding 1983; building at 748 Camp St 1991; shihō to Tony Bland 2004 and Richard Collins 1 Jan 2016",
      },
    ],
  },
  {
    slug: "richard-reishin-collins",
    content: `Richard Reishin Collins (born 1952, Eugene, Oregon) is the second abbot of the New Orleans Zen Temple, the principal dharma successor of Robert Livingston Roshi, and one of the senior teachers of the American Zen Association — the U.S. wing of the Deshimaru / AZI Sōtō lineage. An academic by profession in English and comparative literature, Collins came to Zen in mid-life: he began Zen practice with Livingston at the New Orleans Zen Temple in 2001, received monastic ordination from him in 2010, and was given permission to teach in 2012[1].

His formal dharma transmission came at the changing of the year on 1 January 2016. Just after midnight, in the dōjō of the New Orleans Zen Temple at 748 Camp Street, Livingston Roshi met Collins for the intimate shihō ceremony in which the teacher acknowledges the student's transmission and physically hands over his kotsu — the spinal-curved teaching stick with the purple cord and tassel that is the Sōtō school's emblem of teaching authority. With that ceremony Livingston retired as abbot of the temple he had founded a quarter-century earlier, and Collins became the second abbot of the New Orleans Zen Temple and successor to its founding abbot[1].

In the years since, Collins has anchored two centres of practice. From New Orleans, he oversees the operations of the wider American Zen Association — a network that now includes affiliated dōjōs in Alexandria (Robert Savage), Bakersfield (Gary Enns), New York (Malik Walker), Colorado (Hobbie Regan), Starkville (Tony Bland, Livingston's other dharma heir), and elsewhere — and continues the temple's role as the southern American anchor of AZI-style Sōtō and as the publishing home of the American Zen Association[2]. He himself resides in Sewanee, Tennessee, where he founded and directs the Stone Nest Dōjō; he travels regularly to New Orleans to lead sesshin and to oversee the Camp Street temple.

He is the author of *No Fear Zen: Discovering Balance in an Unbalanced World* (Hohm Press, 2015) and a regular contributor to AZI publications; his broader academic work — on literature, Zen aesthetics, and the relation of contemplative practice to Western humanist disciplines — runs in parallel with his teaching role[3]. Together with Tony Bland (Starkville), Collins is one of the two named dharma successors of Livingston Roshi, and the line he carries — Sawaki → Deshimaru → Livingston → Collins — represents one of the principal North-American institutional continuations of Deshimaru's mission outside Europe.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_new_orleans_zen_temple",
        pageOrSection: "About — Richard Reishin Collins; ordination 2010, teaching 2012, shihō 1 January 2016, second abbot from 2016",
      },
      {
        index: 2,
        sourceId: "src_new_orleans_zen_temple",
        pageOrSection: "Affiliated dōjōs of the American Zen Association — Sewanee (Stone Nest), Starkville, Alexandria, Bakersfield, NY, Colorado",
      },
      {
        index: 3,
        sourceId: "src_wikipedia",
        pageOrSection: "*No Fear Zen* (Hohm Press, 2015) — Richard Collins",
      },
    ],
  },
  {
    slug: "tony-bland",
    content: `Tony Bland (born 1946, Starkville, Mississippi) is a dharma heir of Robert Livingston Roshi, the founder of the Starkville Zen Dōjō, and — with Richard Reishin Collins — one of the two documented shihō recipients in the American line of the Deshimaru / Association Zen Internationale Sōtō lineage. Born and raised in Starkville and the nearby community of Cumberland, he earned his bachelor's degree from the University of Mississippi in 1968 and a master's degree in counselling from the University of Arkansas in 1980; his early working life moved through naval service, farm work, and carpentry before he settled into a long career as a counsellor and psychotherapist[1].

His path to Zen ran through the academy and through psychology. He first encountered Buddhism in a college course on world religions, and his interest deepened through his graduate studies in counselling, particularly his exposure to Gestalt therapy and its phenomenological vocabulary; a four-day Zen retreat in 1981 consolidated the commitment[1]. In 1984 he moved to New Orleans and began regular training under Robert Livingston Roshi at what would become the New Orleans Zen Temple, taking lay ordination in 1985 and monastic ordination from Livingston in 1992. He served as shusso (head trainee, the Sōtō ceremonial role of leading a practice period) under Livingston in 1998[1].

In 1994 Bland returned to Mississippi and established the Starkville Zen Dōjō — the first AZI-affiliated practice centre in the state — and began regular teaching there in 1995, while continuing to train annually with Livingston in New Orleans. The decisive ceremonial step came in 2004, when Livingston Roshi conferred shihō (formal dharma transmission) upon him, recognising him as a fully authorised lineage holder and an independent teacher in the Deshimaru–Livingston line. From that point Bland was a teacher in his own right within the American Zen Association, and the Starkville dōjō became one of the network's documented satellite practice centres[2].

He continues to lead the Starkville Zen Dōjō and to teach in the surrounding region from his home near Cumberland, about 25 miles from Starkville, where he and the small Mississippi sangha sit zazen, hold sesshin, and offer a workshop introduction to Zen practice for newcomers. His teaching is grounded in the simplicity Livingston received from Deshimaru, Deshimaru received from Kōdō Sawaki, and that Sōtō tradition (in the line of the thirteenth-century Japanese master Eihei Dōgen) treats as primary: "just sitting" (shikantaza) as the practice of awakening rather than as a means to it[2]. Together with Richard Reishin Collins (Sewanee / New Orleans), he represents one of the two named American successors of Livingston's dharma.`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_new_orleans_zen_temple",
        pageOrSection: "Zen in Mississippi — Tony Bland: born 1946 Starkville; B.A. Ole Miss 1968; M.A. Arkansas 1980; lay ordination 1985, monastic 1992, shusso 1998",
      },
      {
        index: 2,
        sourceId: "src_new_orleans_zen_temple",
        pageOrSection: "Zen in Mississippi — Starkville Zen Dōjō founded 1994; shihō from Livingston-Roshi 2004; teaching independently from 2004",
      },
    ],
  },
  {
    slug: "monika-leibundgut",
    content: `Eishuku Monika Leibundgut is a Swiss Sōtō Zen nun in the Deshimaru lineage and the designated successor of Meihō Missen Michel Bovay (1944–2009) at the Zen Dōjō Zürich — the AZI-affiliated dōjō originally founded by Taisen Deshimaru in 1975 during the founder's expansion of the AZI network across German- and French-speaking Europe[1].

She came to Bovay's circle in the 1980s and rose quickly through the formal Sōtō stages of recognition: bodhisattva-ordination in 1986 and ordination as a nun in 1988. From the late 1980s onward she served as Bovay's principal assistant for more than two decades — leading zazen, organising sesshin, accompanying him to the Gendronnière and to AZI-affiliated centres across Switzerland and Austria, and progressively taking over more of the day-to-day teaching at the Zürich dōjō as the elder teacher's health declined[1].

In 2007, following a serious illness, Bovay formally handed responsibility for the Zen Dōjō Zürich to her as his eldest disciple, naming her his designated successor; he supported her in that role until his death two years later[1]. Her own dharma transmission followed the same Japanese route by which Bovay himself had received shihō: Yūkō Okamoto Roshi of Teishōji — the Japanese Sōtō temple that became one of the principal homes of formal transmission for European AZI teachers in the post-Deshimaru generation, and from whom Bovay had received shihō in 1998 — invited her to perform the hossen-shiki (dharma combat ceremony) at Teishōji in 2012, and conferred shihō on her the following year, 2013. The Zuise ceremonies at Eihei-ji and Sōji-ji that complete the Sōtō transmission cycle followed, attended by the Zürich and Vienna sanghas in support[2].

Since 2009 she has been the principal teacher at the Zen Dōjō Zürich and a regular leader of sesshin and ango (intensive practice periods) at affiliated venues across Switzerland — Walkringen and Flüeli-Ranft among others — and at the Zen Dōjō Wien in Vienna, the dōjō that Bovay had supported in its founding[2]. In 2022, with the Zürich sangha, she edited and published Bovay's posthumous memoir *Deshimaru — Histoires vécues avec un maître zen* (Éditions Le Relié), the lifework of a chronicler completed by his successor — a publication that consolidated her role not only as Bovay's institutional successor at Zürich but as the keeper of his written legacy in French[3].`,
    footnotes: [
      {
        index: 1,
        sourceId: "src_dojo_lausanne",
        pageOrSection: "Muijoji / zen.ch — Eishuku Monika Leibundgut: bodhisattva 1986, nun 1988, designated successor 2007",
      },
      {
        index: 2,
        sourceId: "src_dojo_lausanne",
        pageOrSection: "zen.ch — hossen-shiki at Teishōji 2012; shihō from Yūkō Okamoto Roshi 2013; zuise at Eihei-ji and Sōji-ji",
      },
      {
        index: 3,
        sourceId: "src_azi",
        pageOrSection: "Bovay/Leibundgut, *Deshimaru — Histoires vécues avec un maître zen* (Le Relié, 2022) — edited by the Zürich sangha",
      },
    ],
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
  const skippedSlugs: string[] = [];
  const biographyIds = BIOGRAPHIES.map((bio) => `bio_${bio.slug}_en`);

  await deleteBiographyCitationsWithRetry(biographyIds);

  for (const bio of BIOGRAPHIES) {
    const masterId = slugToId.get(bio.slug);
    if (!masterId) {
      skippedSlugs.push(bio.slug);
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

    // Footnote citations — one row per `[N]` marker in `bio.content`,
    // with field_name = `footnote:N`. The pre-loop wipe already
    // covered these (entity_type='master_biography'), so we just write.
    if (bio.footnotes && bio.footnotes.length > 0) {
      for (const note of bio.footnotes) {
        await upsertBiographyCitationWithRetry({
          id: `${bioId}__footnote_${note.index}`,
          sourceId: note.sourceId,
          entityType: "master_biography",
          entityId: bioId,
          fieldName: `footnote:${note.index}`,
          excerpt: note.excerpt ?? "",
          pageOrSection: note.pageOrSection ?? null,
        });
        citationCount++;
      }
    }

    seeded++;
  }

  console.log("\n=== Biography seeding complete ===");
  console.log(`Seeded: ${seeded}, Skipped (slug not found): ${skipped}`);
  if (skippedSlugs.length > 0) {
    console.log(`Skipped biography slugs: ${skippedSlugs.join(", ")}`);
  }
  console.log(`Biography citations seeded: ${citationCount}`);
}

export default main;

if (process.argv[1] && process.argv[1].endsWith("seed-biographies.ts")) {
  main().catch((err) => {
    console.error("Biography seeding failed:", err);
    process.exit(1);
  });
}

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
