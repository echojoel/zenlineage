/**
 * Branch D — Sangha Sans Demeure / Zen Road (Coupey branch)
 *
 * Owner: Agent D in the Deshimaru-completion sweep.
 *
 * Scope: formal shihō recipients of Philippe Reiryū Coupey (b. 1937),
 * a senior Deshimaru disciple who himself received shihō from Kishigami
 * Kōjun on 31 August 2008 at the Dojo Zen de Paris. Coupey leads the
 * "Sangha Sans Demeure" / Zen Road network.
 *
 * As of May 2026 the only publicly documented shihō recipient *from
 * Coupey* is Patrick Ferrieux (ordained 2000, shihō 2021). Other
 * long-term Coupey disciples teaching across the Sangha Sans Demeure
 * network (Stéphane Chevillard, Jonas Endres, et al.) lead dōjōs but
 * have not yet received formal dharma transmission and are therefore
 * out of scope for this branch (see branch-D-NOTES.md).
 *
 * This file additionally:
 *  1. Re-authors Coupey as a long-form `BiographyEntry` so he can be
 *     promoted by Agent G into `seed-biographies.ts` with the same
 *     paragraph-density citation conventions as other tier-1 figures.
 *  2. Carries a `BRANCH_D_MASTER_PATCHES` block that adds the missing
 *     secondary `dharma` transmission edge from Kishigami Kōjun → Coupey
 *     (2008). This is structural — Coupey's primary edge is from
 *     Deshimaru (ordination 1972), but his shihō came from Kishigami.
 *
 * Sources used:
 *   - src_wikipedia (fr.wikipedia / en.wikipedia "Philippe Coupey",
 *     "Kishigami Kojun")
 *   - src_zen_road / src_sangha_sans_demeure (own publications, dōjō
 *     directory, monthly schedule)
 *   - src_azi (AZI registry of teachers)
 *   - src_la_gendronniere (annual summer-session lineage page)
 *   - src_buddhachannel (long-form portrait of Coupey)
 *
 * IMPORTANT: Kishigami Kōjun's slug is *not yet present* in the repo
 * (verified via grep on 2026-05-11: only `scripts/seed-biographies.ts`
 * and `scripts/data/deshimaru-lineage.ts` mention "kishigami", and
 * neither defines a master). The patch below references
 * `kishigami-kojun` as the canonical slug; Agent G must either author
 * Kishigami as a parent figure on the Sōtō / Sawaki side first, or
 * the seeder must tolerate a forward-reference. See branch-D-NOTES.md.
 */

import type {
  KVMaster,
  KVTransmission,
  KVCitation,
} from "../korean-vietnamese-masters";
import type { BiographyEntry } from "../../seed-biographies";

// ─── New shihō recipients of Philippe Reiryū Coupey ────────────────────

export const BRANCH_D_MASTERS: KVMaster[] = [
  {
    slug: "patrick-ferrieux",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Patrick Ferrieux" },
    ],
    // Birth year not published by Coupey's sangha or by Ferrieux's own
    // bio pages as of May 2026. Marked unknown rather than guessed; the
    // public record establishes only that he met Coupey in 1995, was
    // ordained as a monk in 2000, and has been a "moine zen depuis plus
    // de 20 ans" (zen-road and dojozenparis biographical pages).
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "low",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "low",
    biography:
      "Patrick Ferrieux is a French Sōtō Zen monk in the lineage of Taisen Deshimaru and Kōdō Sawaki, and the only publicly documented dharma-transmission recipient of Philippe Reiryū Coupey to date. He encountered Coupey at the Dojo Zen de Paris in 1995, was ordained as a monk by him in 2000, and received the transmission of the Dharma (shihō) from Coupey in 2021 — completing a transmission line that runs Sawaki → Kishigami → Coupey → Ferrieux on the shihō side, alongside the older Sawaki → Deshimaru → Coupey ordination line (per the Dojo Zen de Paris teachers roster and the Sangha Sans Demeure publications).\n\nAn engineer by training, Ferrieux has long served on the administrative and spiritual councils of both the Dojo Zen de Paris and the Association Zen Internationale (AZI), and is a regular presence at the AZI mother temple of La Gendronnière in the Loir-et-Cher. He directs sesshins and journées de zazen across the Sangha Sans Demeure / Zen Road network — including a recurring \"journée de zazen\" he has led at the Dojo zen de Nantes (most recently announced for 12 April 2026) — and runs the Daruma-Boutique Zen association, which supplies kesa, rakusu, zafu, and other practice materials to AZI dōjōs across France.",
    citations: [
      {
        sourceId: "src_wikipedia",
        fieldName: "biography",
        pageOrSection: "Dojo Zen de Paris — Qui sommes-nous? (teachers roster)",
      },
      {
        sourceId: "src_zen_road",
        fieldName: "biography",
        pageOrSection: "Sangha Sans Demeure — flyer Patrick Ferrieux (2022)",
      },
      {
        sourceId: "src_azi",
        fieldName: "biography",
        pageOrSection: "AZI council & La Gendronnière instructors",
      },
    ],
    transmissions: [
      {
        teacherSlug: "philippe-reiryu-coupey",
        type: "dharma",
        isPrimary: true,
        sourceIds: ["src_wikipedia", "src_zen_road"],
        notes:
          "Ordained as a monk in 2000 by Philippe Reiryū Coupey; received dharma transmission (shihō) from him in 2021. Disciple since 1995.",
      },
    ],
  },
];

// ─── Deepened long-form biography for Coupey (for seed-biographies) ────
//
// This entry mirrors the paragraph-density conventions in
// scripts/seed-biographies.ts: every \n\n-separated paragraph carries
// at least one [N] marker that resolves to an entry in `footnotes`.
// Agent G should drop this into BIOGRAPHIES[] and remove the shorter
// inline `biography` string from the existing `philippe-reiryu-coupey`
// KVMaster in scripts/data/deshimaru-lineage.ts (or leave the KVMaster
// version in place as a short summary — both renderers cite the same
// underlying sources).

export const BRANCH_D_BIOGRAPHIES: BiographyEntry[] = [
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
  // Long-form bio for the new shihō recipient, mirroring the
  // paragraph-density convention so Agent G can land it directly into
  // BIOGRAPHIES[] alongside the master entry above.
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
        pageOrSection:
          "Sangha Sans Demeure — agenda; Daruma-Boutique Zen (boutiquezen.com)",
      },
    ],
  },
];

// ─── Patches to existing master entries owned by other branches ────────
//
// Coupey is currently authored as a `KVMaster` inside
// scripts/data/deshimaru-lineage.ts (around L60–L91) with a single
// `transmissions[]` entry pointing at Deshimaru. His shihō from
// Kishigami Kōjun (31 Aug 2008) is mentioned only in prose, not as
// a graph edge. Per branch instructions Agent D must not edit the
// existing file directly; instead we describe the additional edge
// here and Agent G is responsible for spreading it into the master.
//
// `isPrimary: false` because the Deshimaru ordination edge remains
// the canonical primary edge (it is the older relationship and the
// one through which the lineage graph reaches Coupey from
// shakyamuni-buddha via the Sawaki → Deshimaru chain). The Kishigami
// edge is a secondary `dharma` edge — it formalises shihō but does
// not displace the Deshimaru parentage that the existing graph relies
// on.

export const BRANCH_D_MASTER_PATCHES: {
  slug: string;
  addTransmissions?: KVTransmission[];
  addCitations?: KVCitation[];
}[] = [
  {
    slug: "philippe-reiryu-coupey",
    addTransmissions: [
      {
        teacherSlug: "kishigami-kojun",
        type: "dharma",
        isPrimary: false,
        notes:
          "Dharma transmission (shihō) received 31 August 2008 at the Dojo Zen de Paris. Independent of the older Deshimaru ordination edge.",
        sourceIds: ["src_wikipedia", "src_zen_road"],
      },
    ],
    addCitations: [
      {
        sourceId: "src_buddhachannel",
        fieldName: "transmission",
        pageOrSection: "Zen d'aujourd'hui par Philippe Coupey (2014)",
        excerpt:
          "Le 31 août 2008, au Dojo Zen de Paris, Philippe Coupey a reçu la transmission du Dharma de maître Kojun Kishigami.",
      },
    ],
  },
];
