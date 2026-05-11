/**
 * Branch F — American line + Lausanne (Bovay) + Évelyne Eko de Smedt
 *
 * Authored masters (new KVMaster rows):
 *   • robert-livingston           shihō from Taisen Deshimaru (Paris, pre-1982)
 *   • richard-reishin-collins     shihō from Robert Livingston Roshi (NOZT, 2016-01-01)
 *   • tony-bland                  shihō from Robert Livingston Roshi (2004)
 *   • monika-leibundgut           shihō from Yuko Okamoto Roshi (Teishoji, 2013);
 *                                 designated successor of Michel Bovay
 *
 * Long-form BiographyEntry items (paragraph-cited):
 *   • michel-reiku-bovay          existing KVMaster — deepening only
 *   • evelyne-eko-de-smedt        existing KVMaster — deepening only
 *   • robert-livingston           new
 *   • richard-reishin-collins     new
 *   • tony-bland                  new
 *   • monika-leibundgut           new
 *
 * See branch-F-NOTES.md for source decisions, especially Tony Bland (formal
 * shihō from Livingston in 2004 is documented at zeninmississippi.org) and
 * Monika Leibundgut (designated successor of Bovay; her own shihō was given
 * by Yuko Okamoto Roshi at Teishoji in 2013, paralleling Bovay's own pattern).
 */

import type { KVMaster } from "../korean-vietnamese-masters";
import type { BiographyEntry } from "../../seed-biographies";

export const BRANCH_F_MASTERS: KVMaster[] = [
  // ─── Robert Livingston Roshi (1933–2021) ──────────────────────────────
  {
    slug: "robert-livingston",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Robert Livingston Roshi" },
      { locale: "en", nameType: "birth", value: "Robert C. Livingston" },
      { locale: "en", nameType: "alias", value: "Robert Livingston" },
    ],
    birthYear: 1933,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: 2021,
    deathPrecision: "exact",
    deathConfidence: "high",
    biography:
      "Robert C. Livingston Roshi (28 January 1933 – 2 January 2021) was the senior American disciple of Taisen Deshimaru and the founder of the New Orleans Zen Temple — the principal Sōtō dōjō in the United States carrying the Deshimaru / AZI line. Born in New York City, educated at Cornell, and a U.S. Army veteran of the Japan-Korea theatre in the early 1950s, he spent more than a decade in Europe in international finance before retiring from business and becoming Deshimaru's close disciple in Paris in the 1970s. Before his death in 1982 Deshimaru asked Livingston to return to the United States and establish authentic Sōtō practice there; Livingston founded the American Zen Association in 1983 and opened the New Orleans Zen Temple at 748 Camp Street in 1991. He served as abbot until 2016, when he transmitted the dharma to Richard Reishin Collins; he had previously transmitted to Tony Bland in 2004[1].",
    citations: [
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "Robert Livingston (Zen teacher)" },
      { sourceId: "src_new_orleans_zen_temple", fieldName: "biography", pageOrSection: "About / Robert Livingston Roshi" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_new_orleans_zen_temple", pageOrSection: "New Orleans Zen Temple — biography" },
    ],
    transmissions: [
      {
        teacherSlug: "taisen-deshimaru",
        type: "primary",
        isPrimary: true,
        notes: "Close disciple of Deshimaru in Paris in the 1970s; ordained as Zen teacher; designated by Deshimaru before 1982 to bring Sōtō practice to the United States.",
        sourceIds: ["src_wikipedia", "src_new_orleans_zen_temple"],
      },
    ],
  },

  // ─── Richard Reishin Collins (b. 1952) ────────────────────────────────
  {
    slug: "richard-reishin-collins",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Richard Reishin Collins" },
      { locale: "en", nameType: "alias", value: "Richard Collins" },
      { locale: "en", nameType: "alias", value: "Reishin Collins" },
    ],
    birthYear: 1952,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Richard Reishin Collins (born 1952, Eugene, Oregon) is the second abbot of the New Orleans Zen Temple and the principal dharma successor of Robert Livingston Roshi. An academic by profession (English / comparative literature), he began Zen practice with Livingston in 2001, received monastic ordination in 2010, was given permission to teach in 2012, and received shihō (dharma transmission) from Livingston at midnight on 1 January 2016 in the dōjō at 748 Camp Street — the intimate ceremony in which Livingston handed over his kotsu (the curved teaching stick) as the symbol of transmitted authority. He has since served as abbot of the New Orleans Zen Temple while residing in Sewanee, Tennessee, where he directs the Stone Nest Dōjō and oversees the wider American Zen Association sangha. He is the author of *No Fear Zen: Discovering Balance in an Unbalanced World* (2015) among other writings[1].",
    citations: [
      { sourceId: "src_new_orleans_zen_temple", fieldName: "biography", pageOrSection: "About — Richard Reishin Collins, second abbot" },
      { sourceId: "src_wikipedia", fieldName: "biography", pageOrSection: "New Orleans Zen Temple" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_new_orleans_zen_temple", pageOrSection: "New Orleans Zen Temple — biography" },
    ],
    transmissions: [
      {
        teacherSlug: "robert-livingston",
        type: "primary",
        isPrimary: true,
        notes: "Shihō ceremony at midnight, 1 January 2016, in the dōjō of the New Orleans Zen Temple; Livingston handed over his kotsu as the symbol of transmitted authority. Collins succeeded as second abbot upon Livingston's retirement that year.",
        sourceIds: ["src_new_orleans_zen_temple", "src_wikipedia"],
      },
    ],
  },

  // ─── Tony Bland (b. 1946) ─────────────────────────────────────────────
  {
    slug: "tony-bland",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Tony Bland" },
    ],
    birthYear: 1946,
    birthPrecision: "exact",
    birthConfidence: "high",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Tony Bland (born 1946, Starkville, Mississippi) is a dharma heir of Robert Livingston Roshi and the founder of the Starkville Zen Dōjō. A counsellor and psychotherapist by profession, he began training with Livingston at the New Orleans Zen Temple in 1984, took lay ordination in 1985, monastic ordination in 1992, served as shusso (head trainee) in 1998, and received shihō (dharma transmission) from Livingston in 2004 — becoming a fully authorised lineage holder and an independent teacher in the Deshimaru–Livingston line. He returned to Mississippi in 1994 and established the Starkville Zen Dōjō, beginning regular teaching in 1995 and assuming full teaching autonomy after the 2004 transmission. With Richard Reishin Collins he is one of the two documented dharma successors of Livingston Roshi[1].",
    citations: [
      { sourceId: "src_new_orleans_zen_temple", fieldName: "biography", pageOrSection: "Lineage — Livingston's two successors: Tony Bland and Richard Collins" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_new_orleans_zen_temple", pageOrSection: "New Orleans Zen Temple — biography" },
    ],
    transmissions: [
      {
        teacherSlug: "robert-livingston",
        type: "primary",
        isPrimary: true,
        notes: "Lay ordination 1985, monastic ordination 1992, shusso 1998, shihō (dharma transmission) 2004 — making Bland a fully authorised lineage holder in the Deshimaru–Livingston line.",
        sourceIds: ["src_new_orleans_zen_temple"],
      },
    ],
  },

  // ─── Eishuku Monika Leibundgut (Swiss; designated successor of Bovay) ─
  {
    slug: "monika-leibundgut",
    schoolSlug: "soto",
    names: [
      { locale: "en", nameType: "dharma", value: "Eishuku Monika Leibundgut" },
      { locale: "en", nameType: "alias", value: "Monika Leibundgut" },
      { locale: "ja", nameType: "dharma", value: "Eishuku" },
    ],
    birthYear: null,
    birthPrecision: "unknown",
    birthConfidence: "medium",
    deathYear: null,
    deathPrecision: "unknown",
    deathConfidence: "high",
    biography:
      "Eishuku Monika Leibundgut is a Swiss Sōtō Zen nun in the Deshimaru lineage and the designated successor of Meihō Missen Michel Bovay at the Zen Dōjō Zürich. Bodhisattva-ordained in 1986 and ordained as a nun in 1988, she served as Bovay's assistant for more than two decades. After his serious illness in 2007 she took over leadership of the dōjō, supported by Bovay until his death in 2009. Her own dharma transmission follows the same pattern as her teacher's: Yūkō Okamoto Roshi of Teishōji invited her to perform the hossen-shiki at Teishōji in 2012 and conferred shihō in 2013, followed by zuise at Eihei-ji and Sōji-ji with the Zürich and Vienna sanghas in attendance. She continues to lead the Zen Dōjō Zürich (an AZI-affiliated dōjō originally founded by Deshimaru in 1975) and edited Bovay's posthumous memoir *Deshimaru — Histoires vécues avec un maître zen* (Le Relié, 2022)[1].",
    citations: [
      { sourceId: "src_dojo_lausanne", fieldName: "biography", pageOrSection: "Muijoji / zen.ch — Eishuku Monika Leibundgut, designated successor of Michel Bovay" },
      { sourceId: "src_azi", fieldName: "biography", pageOrSection: "Zen Dōjō Zürich (AZI-affiliated)" },
    ],
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "Association Zen Internationale — directory and biographies" },
    ],
    transmissions: [
      {
        teacherSlug: "michel-reiku-bovay",
        type: "primary",
        isPrimary: true,
        notes: "Designated successor of Bovay at Zen Dōjō Zürich (handover 2007; Bovay supported her until his death in 2009). Formal shihō was conferred by Yūkō Okamoto Roshi of Teishōji in 2013 — paralleling the route by which Bovay himself received shihō from Okamoto in 1998 — followed by zuise at Eihei-ji and Sōji-ji.",
        sourceIds: ["src_dojo_lausanne", "src_azi"],
      },
    ],
  },
];

export const BRANCH_F_BIOGRAPHIES: BiographyEntry[] = [
  // ─── Michel Reikū Bovay (existing KVMaster — long-form deepening) ─────
  {
    slug: "michel-reiku-bovay",
    content: `Michel Meihō Missen Reikū Bovay (1944–2009) was a Swiss Sōtō Zen monk in the Deshimaru lineage and one of the principal figures in the European AZI generation that took on the responsibility of carrying Taisen Deshimaru's mission forward after the founder's death in 1982. Born in Monthey in the Valais in 1944, he spent his youth as a working musician and composer — playing in Swiss rock groups including The Sevens — before encountering Deshimaru in Paris in 1972 and becoming one of his close disciples almost immediately[1].

For ten years, until Deshimaru's death in 1982, Bovay was part of the small inner circle around the founder: a close disciple, an intimate collaborator, and one of the principal organisers of the daily life and travel of the master's European mission. After Deshimaru's death he was identified, alongside three other senior disciples, as a candidate to receive the formal Sōtō transmission whose paperwork had been prepared from Eihei-ji; he ultimately received shihō in 1998 from Gu'en Yūkō Okamoto Roshi of Teishōji, the Japanese Sōtō temple that became one of the principal homes of formal transmission for European AZI teachers in the post-Deshimaru generation[2].

Returning to Switzerland in 1985, Bovay re-established his teaching at the Zen Dōjō Zürich — the dōjō originally founded by Deshimaru in 1975 — and from there extended the AZI network across German- and French-speaking Switzerland, training a generation of Swiss practitioners and animating dōjōs from Zürich westward into the Romandie. From 1995 to 2003 he served as president of the Association Zen Internationale, the federative body that holds together the European Deshimaru lineage, and during this period he became one of the most visible Francophone faces of AZI[2].

Bovay's most enduring contribution, however, is on the page. With co-authors Lucien Marchand and Laurent Strim he wrote the 1987 introductory volume *Zen* (in the "Bref" series of Éditions du Cerf), one of the very first comprehensive French-language presentations of the tradition's history, doctrine, and practice — a book that introduced an entire generation of French-speaking readers to AZI-style Sōtō. He continued for decades as one of the principal interpreters of Deshimaru's teaching for a Francophone lay audience, in books and in regular kusen at sesshin[3].

Following a serious illness, in 2007 Bovay handed responsibility for the Zen Dōjō Zürich to his eldest disciple, the Zen nun Eishuku Monika Leibundgut, whom he had trained for more than twenty years; he supported her in the role until his death in 2009[2]. In 2022, thirteen years after his death, Éditions Le Relié published *Deshimaru: Histoires vécues avec un maître zen* — a posthumous collection of his memoirs of life and training under Deshimaru, edited by Leibundgut and the Zürich sangha as the lifework of a chronicler completed by his successors[3].

Through these books — and through Leibundgut's continued teaching at Zürich — Bovay remains, alongside Pierre Dōkan Crépon and Évelyne Ekō de Smedt, one of the principal first-generation French-language witnesses to Deshimaru's mission. His teaching emphasised the simplicity of zazen as Deshimaru had transmitted it: in his characteristic phrase, "the experience in zazen of this original, eternally existing Buddha mind is much more important than thinking about everyday life" — a formulation that captured the priority of direct sitting over discursive doctrine that runs through the whole Sōtō tradition from Dōgen forward[2]. The institutional shape of his legacy is twofold: a Zürich-anchored line of formal Sōtō transmission carried on by Leibundgut, and a Francophone publishing legacy that, with de Smedt's Mokuonji and Crépon's AZI essays, constitutes the principal French-language record of the founder's mission. His eight-year tenure as AZI president (1995–2003) coincided with the federation's consolidation into the institutional form it still has today, federating dōjōs from Lisbon to Vienna under the umbrella of the Gendronnière temple[2].`,
    footnotes: [
      { index: 1, sourceId: "src_dojo_lausanne", pageOrSection: "Muijoji / zen.ch — Meiho Missen Michel Bovay (1944, Monthey)" },
      { index: 2, sourceId: "src_dojo_lausanne", pageOrSection: "zen.ch — shihō 1998 from Yūkō Okamoto Roshi (Teishōji); AZI presidency 1995–2003; 2007 handover to Eishuku Monika Leibundgut" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Bibliographie AZI — Bovay/Marchand/Strim, *Zen* (Cerf, 1987); *Deshimaru — Histoires vécues* (Le Relié, 2022)" },
    ],
  },

  // ─── Évelyne Ekō / Reikō de Smedt (existing KVMaster — long-form deepening) ──
  {
    slug: "evelyne-eko-de-smedt",
    content: `Évelyne Ekō / Reikō de Smedt (born 20 November 1945, Sologne) is a French Sōtō Zen nun in the Deshimaru lineage and one of Taisen Deshimaru's earliest and most consequential female disciples. She first encountered Deshimaru in January 1973 at a workshop in the 14th arrondissement of Paris and was drawn rapidly into his inner circle; she received the nun's ordination from him in March 1975 and remained at his side, as part of the small editorial and administrative core around the master, until his death in 1982[1].

Her most consequential contribution to Deshimaru's western mission was as a co-author and editor of his French œuvre. With Lucien Marchand she wrote *Zen, religion de la vie quotidienne* (Albin Michel, 1976) — among the very first French-language presentations of Zen as Deshimaru taught it, written contemporaneously with Deshimaru's own Paris mission and frequently reissued as a standard introductory text. She also collaborated with Deshimaru himself on *L'Anneau de la Voie* ("The Ring of the Way"), an early formal presentation of the kusen (oral teaching given during zazen) genre in French. Several of Deshimaru's most-cited posthumous books carry her preface — including the 1985 edition of *Zen et vie quotidienne* (Albin Michel), introduced by her — and she helped to edit and publish most of the master's works in French[2].

After Deshimaru's death she took her turn, as she has put it, in transmitting and developing the teaching. She has led zazen and sesshin for several decades at the Paris Zen Dōjō (founded by Deshimaru, of which she is vice-president) and at the Temple Zen Sōtō de la Gendronnière on the banks of the Loire (likewise founded by him), and she sits on the Association Zen Internationale teacher roster as Maître Évelyne Reiko de Smedt. With Pierre Dōkan Crépon she co-authored the wider survey *L'Esprit du Zen* (Hachette, 2005), one of the most widely-read French introductions to the tradition, and she is the author of *Zen et christianisme* (Albin Michel) and (with Bovay and Kaltenbach) the illustrated *Zen* album, *La Lumière du satori*, and *Les Patriarches du Zen*[3].

In 2005, on a preserved site in the Quercy blanc in southwest France, she founded the hermitage of Mokuon-Ji ("temple of silent compassion"), where she has since devoted herself to the study of texts and to a teaching cycle of three sesshin per year — summer, autumn, and spring — drawing students from the wider Francophone AZI network[1]. In May 2009 she performed the ceremonial role of shusso ("first monk" / head trainee) at Kongō-in in Japan with Genshū Imamura Roshi, a formal step on the Sōtō ceremonial path of teacher-recognition[4].

Within the AZI press her steady editorial presence over four decades is largely responsible for the way Deshimaru's spoken kusen became readable French text — and for the shape in which that teaching reached subsequent generations of European practitioners. With Pierre Dōkan Crépon she stands as one of the two principal Francophone biographer-editors of the founder; where Crépon's role has been the long historical essay (his canonical *Maître Taisen Deshimaru et l'arrivée du zen en Europe*), de Smedt's has been the editor's preface and the co-authored introductory volume — the genres that move a tradition from the inner circle to the general reader[2][3]. Her position as vice-president of the Paris Zen Dōjō, her decades of sesshin leadership at the Gendronnière, and her founding of Mokuon-Ji together place her at one of the principal continuity-points between the founder's lifetime and the present generation of European AZI practice. The dharma name pair Ekō (慧光, "luminous wisdom") and Reikō, by which she is known on the AZI roster, was given by Deshimaru in the same first generation of Western ordinations that produced Crépon, Bovay, Roland Yūnō Rech, and the other senior AZI teachers who would carry the post-1982 mission forward across the Francophone world[1].`,
    footnotes: [
      { index: 1, sourceId: "src_azi", pageOrSection: "Maître Évelyne Reiko de Smedt — biographie; founding of Mokuon-Ji (2005)" },
      { index: 2, sourceId: "src_wikipedia", pageOrSection: "Bibliographie de Taisen Deshimaru — préface d'Evelyn de Smedt; *Zen, religion de la vie quotidienne* (Albin Michel, 1976)" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Bibliographie AZI — *L'Esprit du Zen* (Hachette, 2005), *Zen et christianisme*, *La Lumière du satori*, *Les Patriarches du Zen*" },
      { index: 4, sourceId: "src_azi", pageOrSection: "shusso ceremony with Genshu Imamura Roshi at Kongō-in, May 2009" },
    ],
  },

  // ─── Robert Livingston Roshi (1933–2021) — long-form ──────────────────
  {
    slug: "robert-livingston",
    content: `Robert C. Livingston Roshi (28 January 1933 – 2 January 2021) was the senior American disciple of Taisen Deshimaru and the founder of the New Orleans Zen Temple — the principal Sōtō dōjō in the United States carrying the Deshimaru / Association Zen Internationale line. Born in New York City and raised between New York, California, and Texas, Livingston graduated from Cornell University, then served two years in the U.S. Army in Japan and Korea in the early 1950s — his first and formative exposure to East Asia[1]. After his Army discharge he travelled and studied in Europe, returned briefly to the United States as a registered representative of the New York Stock Exchange, and then went back to Europe for a decade as the head of an international financial services corporation[1].

He retired from the business world to begin sitting zazen with Master Taisen Deshimaru in Paris in the 1970s, becoming one of Deshimaru's close disciples and being made a Zen teacher by him. Deshimaru — who had always intended to take Sōtō to the United States before circumstances kept him in France — asked Livingston, before his death in 1982, to return to America and open a dōjō there to transmit authentic Zen practice[2]. Livingston founded the American Zen Association in 1983 as the institutional home for that mission, and in 1991 he opened the New Orleans Zen Temple in a historic building at 748 Camp Street in the city's Arts District. The temple became the southern anchor of AZI-style Sōtō in the United States and the publishing home of the American Zen Association, which supports Zen dōjōs across the country and republishes rare Buddhist texts[3].

Livingston transmitted the dharma to two named successors. The first was Tony Bland, a Mississippi-born psychotherapist who began training with him at the New Orleans Zen Temple in 1984, took monastic ordination in 1992, and received shihō from Livingston in 2004 — by which point Bland had already founded (1994) and been teaching at (from 1995) the Starkville Zen Dōjō[3]. The second was Richard Reishin Collins, an academic literary scholar who began practice with Livingston in 2001, received monastic ordination in 2010, and was given permission to teach in 2012; on the night of 31 December 2015 / 1 January 2016, in the dōjō at 748 Camp Street, Livingston met Collins for the intimate shihō ceremony in which the teacher hands over his kotsu — the spinal-curved teaching stick with the purple cord and tassel that is the symbol of the Sōtō teacher's authority — to acknowledge the student's transmission[1][3].

With that ceremony Livingston retired as abbot in 2016, succeeded by Collins as the second abbot of the New Orleans Zen Temple. Livingston died in the early morning of 2 January 2021 in New Orleans, age 87[1]. The American Zen Association now lists more than half a dozen affiliated dōjōs — Sewanee (Stone Nest, Collins), Starkville (Bland), Alexandria, Bakersfield, New York, Colorado, and others — that all trace their line back through Livingston to Deshimaru, Kōdō Sawaki, and the wider Sōtō school. Together with the Mount Baldy/Hosshin-ji Rinzai mission and the various Soto Zen Buddhist Association lines descending from Suzuki, Maezumi, and Aitken, Livingston's American Zen Association represents one of the principal first-generation routes by which Japanese Sōtō Zen took permanent institutional root in the United States.`,
    footnotes: [
      { index: 1, sourceId: "src_wikipedia", pageOrSection: "Robert Livingston (Zen teacher) — biography" },
      { index: 2, sourceId: "src_new_orleans_zen_temple", pageOrSection: "About — Robert Livingston Roshi; Deshimaru's request to open a U.S. dōjō" },
      { index: 3, sourceId: "src_new_orleans_zen_temple", pageOrSection: "About / Lineage — founding 1983; building at 748 Camp St 1991; shihō to Tony Bland 2004 and Richard Collins 1 Jan 2016" },
    ],
  },

  // ─── Richard Reishin Collins (b. 1952) — long-form ────────────────────
  {
    slug: "richard-reishin-collins",
    content: `Richard Reishin Collins (born 1952, Eugene, Oregon) is the second abbot of the New Orleans Zen Temple, the principal dharma successor of Robert Livingston Roshi, and one of the senior teachers of the American Zen Association — the U.S. wing of the Deshimaru / AZI Sōtō lineage. An academic by profession in English and comparative literature, Collins came to Zen in mid-life: he began Zen practice with Livingston at the New Orleans Zen Temple in 2001, received monastic ordination from him in 2010, and was given permission to teach in 2012[1].

His formal dharma transmission came at the changing of the year on 1 January 2016. Just after midnight, in the dōjō of the New Orleans Zen Temple at 748 Camp Street, Livingston Roshi met Collins for the intimate shihō ceremony in which the teacher acknowledges the student's transmission and physically hands over his kotsu — the spinal-curved teaching stick with the purple cord and tassel that is the Sōtō school's emblem of teaching authority. With that ceremony Livingston retired as abbot of the temple he had founded a quarter-century earlier, and Collins became the second abbot of the New Orleans Zen Temple and successor to its founding abbot[1].

In the years since, Collins has anchored two centres of practice. From New Orleans, he oversees the operations of the wider American Zen Association — a network that now includes affiliated dōjōs in Alexandria (Robert Savage), Bakersfield (Gary Enns), New York (Malik Walker), Colorado (Hobbie Regan), Starkville (Tony Bland, Livingston's other dharma heir), and elsewhere — and continues the temple's role as the southern American anchor of AZI-style Sōtō and as the publishing home of the American Zen Association[2]. He himself resides in Sewanee, Tennessee, where he founded and directs the Stone Nest Dōjō; he travels regularly to New Orleans to lead sesshin and to oversee the Camp Street temple.

He is the author of *No Fear Zen: Discovering Balance in an Unbalanced World* (Hohm Press, 2015) and a regular contributor to AZI publications; his broader academic work — on literature, Zen aesthetics, and the relation of contemplative practice to Western humanist disciplines — runs in parallel with his teaching role[3]. Together with Tony Bland (Starkville), Collins is one of the two named dharma successors of Livingston Roshi, and the line he carries — Sawaki → Deshimaru → Livingston → Collins — represents one of the principal North-American institutional continuations of Deshimaru's mission outside Europe.`,
    footnotes: [
      { index: 1, sourceId: "src_new_orleans_zen_temple", pageOrSection: "About — Richard Reishin Collins; ordination 2010, teaching 2012, shihō 1 January 2016, second abbot from 2016" },
      { index: 2, sourceId: "src_new_orleans_zen_temple", pageOrSection: "Affiliated dōjōs of the American Zen Association — Sewanee (Stone Nest), Starkville, Alexandria, Bakersfield, NY, Colorado" },
      { index: 3, sourceId: "src_wikipedia", pageOrSection: "*No Fear Zen* (Hohm Press, 2015) — Richard Collins" },
    ],
  },

  // ─── Tony Bland (b. 1946) — long-form ─────────────────────────────────
  {
    slug: "tony-bland",
    content: `Tony Bland (born 1946, Starkville, Mississippi) is a dharma heir of Robert Livingston Roshi, the founder of the Starkville Zen Dōjō, and — with Richard Reishin Collins — one of the two documented shihō recipients in the American line of the Deshimaru / Association Zen Internationale Sōtō lineage. Born and raised in Starkville and the nearby community of Cumberland, he earned his bachelor's degree from the University of Mississippi in 1968 and a master's degree in counselling from the University of Arkansas in 1980; his early working life moved through naval service, farm work, and carpentry before he settled into a long career as a counsellor and psychotherapist[1].

His path to Zen ran through the academy and through psychology. He first encountered Buddhism in a college course on world religions, and his interest deepened through his graduate studies in counselling, particularly his exposure to Gestalt therapy and its phenomenological vocabulary; a four-day Zen retreat in 1981 consolidated the commitment[1]. In 1984 he moved to New Orleans and began regular training under Robert Livingston Roshi at what would become the New Orleans Zen Temple, taking lay ordination in 1985 and monastic ordination from Livingston in 1992. He served as shusso (head trainee, the Sōtō ceremonial role of leading a practice period) under Livingston in 1998[1].

In 1994 Bland returned to Mississippi and established the Starkville Zen Dōjō — the first AZI-affiliated practice centre in the state — and began regular teaching there in 1995, while continuing to train annually with Livingston in New Orleans. The decisive ceremonial step came in 2004, when Livingston Roshi conferred shihō (formal dharma transmission) upon him, recognising him as a fully authorised lineage holder and an independent teacher in the Deshimaru–Livingston line. From that point Bland was a teacher in his own right within the American Zen Association, and the Starkville dōjō became one of the network's documented satellite practice centres[2].

He continues to lead the Starkville Zen Dōjō and to teach in the surrounding region from his home near Cumberland, about 25 miles from Starkville, where he and the small Mississippi sangha sit zazen, hold sesshin, and offer a workshop introduction to Zen practice for newcomers. His teaching is grounded in the simplicity Livingston received from Deshimaru, Deshimaru received from Kōdō Sawaki, and that Sōtō tradition (in the line of the thirteenth-century Japanese master Eihei Dōgen) treats as primary: "just sitting" (shikantaza) as the practice of awakening rather than as a means to it[2]. Together with Richard Reishin Collins (Sewanee / New Orleans), he represents one of the two named American successors of Livingston's dharma.`,
    footnotes: [
      { index: 1, sourceId: "src_new_orleans_zen_temple", pageOrSection: "Zen in Mississippi — Tony Bland: born 1946 Starkville; B.A. Ole Miss 1968; M.A. Arkansas 1980; lay ordination 1985, monastic 1992, shusso 1998" },
      { index: 2, sourceId: "src_new_orleans_zen_temple", pageOrSection: "Zen in Mississippi — Starkville Zen Dōjō founded 1994; shihō from Livingston-Roshi 2004; teaching independently from 2004" },
    ],
  },

  // ─── Eishuku Monika Leibundgut — long-form ────────────────────────────
  {
    slug: "monika-leibundgut",
    content: `Eishuku Monika Leibundgut is a Swiss Sōtō Zen nun in the Deshimaru lineage and the designated successor of Meihō Missen Michel Bovay (1944–2009) at the Zen Dōjō Zürich — the AZI-affiliated dōjō originally founded by Taisen Deshimaru in 1975 during the founder's expansion of the AZI network across German- and French-speaking Europe[1].

She came to Bovay's circle in the 1980s and rose quickly through the formal Sōtō stages of recognition: bodhisattva-ordination in 1986 and ordination as a nun in 1988. From the late 1980s onward she served as Bovay's principal assistant for more than two decades — leading zazen, organising sesshin, accompanying him to the Gendronnière and to AZI-affiliated centres across Switzerland and Austria, and progressively taking over more of the day-to-day teaching at the Zürich dōjō as the elder teacher's health declined[1].

In 2007, following a serious illness, Bovay formally handed responsibility for the Zen Dōjō Zürich to her as his eldest disciple, naming her his designated successor; he supported her in that role until his death two years later[1]. Her own dharma transmission followed the same Japanese route by which Bovay himself had received shihō: Yūkō Okamoto Roshi of Teishōji — the Japanese Sōtō temple that became one of the principal homes of formal transmission for European AZI teachers in the post-Deshimaru generation, and from whom Bovay had received shihō in 1998 — invited her to perform the hossen-shiki (dharma combat ceremony) at Teishōji in 2012, and conferred shihō on her the following year, 2013. The Zuise ceremonies at Eihei-ji and Sōji-ji that complete the Sōtō transmission cycle followed, attended by the Zürich and Vienna sanghas in support[2].

Since 2009 she has been the principal teacher at the Zen Dōjō Zürich and a regular leader of sesshin and ango (intensive practice periods) at affiliated venues across Switzerland — Walkringen and Flüeli-Ranft among others — and at the Zen Dōjō Wien in Vienna, the dōjō that Bovay had supported in its founding[2]. In 2022, with the Zürich sangha, she edited and published Bovay's posthumous memoir *Deshimaru — Histoires vécues avec un maître zen* (Éditions Le Relié), the lifework of a chronicler completed by his successor — a publication that consolidated her role not only as Bovay's institutional successor at Zürich but as the keeper of his written legacy in French[3].`,
    footnotes: [
      { index: 1, sourceId: "src_dojo_lausanne", pageOrSection: "Muijoji / zen.ch — Eishuku Monika Leibundgut: bodhisattva 1986, nun 1988, designated successor 2007" },
      { index: 2, sourceId: "src_dojo_lausanne", pageOrSection: "zen.ch — hossen-shiki at Teishōji 2012; shihō from Yūkō Okamoto Roshi 2013; zuise at Eihei-ji and Sōji-ji" },
      { index: 3, sourceId: "src_azi", pageOrSection: "Bovay/Leibundgut, *Deshimaru — Histoires vécues avec un maître zen* (Le Relié, 2022) — edited by the Zürich sangha" },
    ],
  },
];
