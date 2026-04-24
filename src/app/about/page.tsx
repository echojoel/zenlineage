import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Zen",
  description:
    "What is Zen Buddhism? A precise introduction to the history, practice, and philosophy of Chan/Zen, with scholarly citations from Dumoulin, McRae, Faure, and others.",
  alternates: { canonical: "https://zenlineage.org/about" },
  openGraph: {
    title: "About Zen Buddhism — Zen Lineage",
    description:
      "What is Zen Buddhism? A precise introduction to Chan/Zen history, practice, and philosophy with scholarly citations.",
    url: "https://zenlineage.org/about",
    type: "article",
    images: [{ url: "/about-enso.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Zen Buddhism — Zen Lineage",
    description: "What is Zen? History, practice, and philosophy with scholarly citations.",
    images: ["/about-enso.webp"],
  },
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What is Zen Buddhism?",
  description:
    "A precise introduction to the history, practice, and philosophy of Chan/Zen Buddhism, with scholarly citations.",
  url: "https://zenlineage.org/about",
  image: "https://zenlineage.org/about-enso.webp",
  author: { "@type": "Person", name: "Joel" },
  publisher: {
    "@type": "Organization",
    name: "Zen Lineage",
    url: "https://zenlineage.org",
  },
  datePublished: "2025-01-01",
  inLanguage: "en",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://zenlineage.org" },
    { "@type": "ListItem", position: 2, name: "About Zen", item: "https://zenlineage.org/about" },
  ],
};

export default function AboutPage() {
  return (
    <main className="detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="page-header">
        <Link href="/" className="nav-link">
          禅
        </Link>
        <h1 className="page-title">About Zen</h1>
      </header>

      <div className="detail-layout">
        <section className="detail-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/about-enso.webp"
            alt="Ensō — a circle drawn in one brushstroke, symbolizing enlightenment, the universe, and the void in Zen"
            className="detail-hero-image"
          />
          <p className="detail-eyebrow">Introduction</p>
          <h2 className="detail-title">What is Zen Lineage?</h2>
          <p className="detail-subtitle">An open encyclopedia of Chan and Zen history</p>
        </section>

        <section className="detail-card">
          <div className="detail-summary">
            <p>
              My name is Joel. I practice zazen. I wanted to understand how the schools and lineages
              connect, so I built this. The project is{" "}
              <a
                href="https://github.com/echojoel/zenlineage"
                className="detail-inline-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                open source
              </a>{" "}
              and open to correction &mdash; if something is wrong, please open an issue.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">What is Zen?</h3>
          <div className="detail-summary">
            <p>
              Zen is the practice of sitting down and looking directly at what you are. No scripture
              can do it for you, no concept can replace it. You sit, you breathe, and sooner or
              later the distance between you and your life closes. That is all.
            </p>
            <p>
              What follows on this page is the history, the philosophy, the scholarship. It matters.
              But it comes second.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Etymology</h3>
          <div className="detail-summary">
            <p>
              The word <em>Zen</em> (禅) is the Japanese reading of the Chinese character{" "}
              <em>Chán</em> (禪), itself a transliteration of the Sanskrit <em>dhyāna</em> (ध्यान),
              meaning &ldquo;meditative absorption&rdquo; or &ldquo;meditative state.&rdquo; The
              term entered Chinese Buddhism through early translations of Indian meditation texts.
              Long before Chan emerged as a distinct school, Chinese Buddhists were already
              translating and practicing forms of <em>dhyāna</em>;{" "}
              <Link className="detail-inline-link" href="/masters/puti-damo">
                Bodhidharma
              </Link>{" "}
              later became the emblematic first patriarch of Chan in the tradition&rsquo;s lineage
              accounts (Dumoulin, <em>Zen Buddhism: A History &mdash; India and China</em>, 2005,
              pp. 85&ndash;94). In Korean the tradition is called <em>Seon</em> (선/禪), and in
              Vietnamese, <em>Thiền</em>.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Definition</h3>
          <div className="detail-summary">
            <p>
              Zen is a school of Mahāyāna Buddhism that originated in China during the Tang dynasty
              (618&ndash;907 CE) and subsequently spread to Korea, Japan, and Vietnam. It emphasises
              meditation practice (<em>zuòchán</em> / <em>zazen</em>) and direct, experiential
              insight into one&rsquo;s own nature (<em>jiànxìng</em> 見性, Japanese <em>kenshō</em>)
              as the primary path to awakening, rather than sole reliance on doctrinal study or
              ritual observance (Dumoulin, <em>Zen Buddhism: A History &mdash; India and China</em>,
              2005, pp. 7&ndash;12).
            </p>
            <p>
              A celebrated four-line verse, traditionally attributed to
              <Link className="detail-inline-link" href="/masters/puti-damo">
                Bodhidharma
              </Link>{" "}
              but likely compiled in the late Tang period, captures the school&rsquo;s
              self-understanding (McRae, <em>Seeing Through Zen</em>, 2003, pp. 12&ndash;13):
            </p>
            <blockquote
              style={{
                margin: "1rem 0",
                paddingLeft: "1.25rem",
                borderLeft: "2px solid rgba(122, 106, 85, 0.25)",
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.1rem",
                lineHeight: 1.8,
                color: "var(--ink)",
              }}
            >
              A special transmission outside the scriptures,
              <br />
              Not dependent on words and letters;
              <br />
              Pointing directly at the human mind,
              <br />
              Seeing into one&rsquo;s nature and attaining Buddhahood.
            </blockquote>
            <p>
              As John McRae notes, these lines &ldquo;should not be understood as a historically
              accurate description of Chan&rsquo;s origins, but as a retrospective distillation of
              its identity&rdquo; (McRae, 2003, p. 13). Zen has always been embedded in the broader
              Mahāyāna tradition: its monasteries follow the Vinaya, its liturgy draws on sutras,
              and its doctrinal vocabulary is shaped by Madhyamaka and Yogācāra philosophy (Faure,{" "}
              <em>The Rhetoric of Immediacy</em>, 1991, pp. 15&ndash;31).
            </p>
          </div>
        </section>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/masters/puti-damo.webp"
          alt="Bodhidharma (Puti Damo), the First Patriarch of Chan Buddhism"
          className="about-section-image"
        />

        <section className="detail-card">
          <h3 className="detail-section-title">Core Practice: Zazen</h3>
          <div className="detail-summary">
            <p>
              The central practice of Zen is seated meditation, known as <em>zazen</em> (坐禅,
              &ldquo;sitting dhyāna&rdquo;). In the Sōtō school, this takes the form of{" "}
              <em>shikantaza</em>
              (&ldquo;just sitting&rdquo;), a practice of objectless awareness in which the
              practitioner sits upright, following the breath without pursuing or suppressing
              thoughts.{" "}
              <Link className="detail-inline-link" href="/masters/dogen">
                Dōgen Zenji
              </Link>{" "}
              (1200&ndash;1253) described this in his <em>Fukanzazengi</em>
              (&ldquo;Universal Recommendations for Zazen&rdquo;): &ldquo;Think of not-thinking. How
              do you think of not-thinking? Non-thinking. This in itself is the essential art of
              zazen&rdquo; (Dōgen, tr. Tanahashi, <em>Treasury of the True Dharma Eye</em>, 2010, p.
              886).
            </p>
            <p>
              In the Rinzai (Linji) school, zazen is complemented by intensive engagement with{" "}
              <em>kōan</em> (公案) &mdash; paradoxical questions or dialogues drawn from the records
              of past masters. The practitioner holds the kōan in mind during meditation and in all
              daily activities, working to penetrate its meaning beyond conceptual thought. The
              classic kōan &ldquo;What is the sound of one hand?&rdquo; was formulated by{" "}
              <Link className="detail-inline-link" href="/masters/hakuin-ekaku">
                Hakuin Ekaku
              </Link>{" "}
              (1686&ndash;1769), who systematised kōan practice into a structured curriculum (Mohr,{" "}
              <em>Hakuin&rsquo;s Daruma</em>, in Heine &amp; Wright, eds., <em>The Kōan</em>, 2000,
              pp. 84&ndash;109).
            </p>
          </div>
        </section>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/masters/dogen.webp"
          alt="Dogen Zenji, founder of Soto Zen in Japan"
          className="about-section-image"
        />

        <section className="detail-card">
          <h3 className="detail-section-title">Key Concepts</h3>
          <div className="detail-summary">
            <p>
              <strong>Buddha-nature</strong> (<em>foxìng</em> 佛性) &mdash; Zen inherits from the{" "}
              <em>Tathāgatagarbha</em> doctrine the assertion that all sentient beings possess the
              potential for awakening. The <em>Platform Sutra</em>, attributed to the Sixth
              Patriarch{" "}
              <Link className="detail-inline-link" href="/masters/dajian-huineng">
                Huìnéng
              </Link>{" "}
              (638&ndash;713), states: &ldquo;Good friends, the bodhi-nature is originally pure. By
              making use of this mind, one directly attains Buddhahood&rdquo; (Yampolsky,{" "}
              <em>The Platform Sutra of the Sixth Patriarch</em>, 1967, p. 130).
            </p>
            <p>
              <strong>Sudden and gradual awakening</strong> &mdash; The dialectic between sudden (
              <em>dùn</em> 頓) and gradual (<em>jiàn</em> 漸) enlightenment has shaped Zen since the
              traditional account of the rift between{" "}
              <Link className="detail-inline-link" href="/masters/dajian-huineng">
                Huìnéng
              </Link>{" "}
              and{" "}
              <Link className="detail-inline-link" href="/masters/yuquan-shenxiu">
                Shénxiù
              </Link>{" "}
              (606?&ndash;706). Modern scholarship has shown that this distinction was more
              polemical than practical: most Chan masters acknowledged both instantaneous insight
              and sustained cultivation (Gregory,{" "}
              <em>Sudden and Gradual: Approaches to Enlightenment in Chinese Thought</em>, 1987, pp.
              1&ndash;35).
            </p>
            <p>
              <strong>Emptiness</strong> (<em>śūnyatā</em>, <em>kōng</em> 空) &mdash; Following the{" "}
              <em>Prajñāpāramitā</em> literature and
              <Link className="detail-inline-link" href="/masters/nagarjuna">
                Nāgārjuna
              </Link>
              &rsquo;s <em>Mūlamadhyamakakārikā</em>, Zen holds that all phenomena are empty of
              independent, inherent existence. This is not nihilism but the recognition that things
              arise interdependently. The <em>Heart Sutra</em>, chanted daily in Zen monasteries,
              declares: &ldquo;Form is emptiness; emptiness is form&rdquo; (Red Pine,{" "}
              <em>The Heart Sutra</em>, 2004, pp. 2&ndash;3).
            </p>
            <p>
              <strong>Transmission</strong> (<em>yìxīn chuánxīn</em>, &ldquo;mind-to-mind
              transmission&rdquo;) &mdash; Zen maintains an unbroken lineage of teacher-to-student
              dharma transmission stretching from{" "}
              <Link className="detail-inline-link" href="/masters/shakyamuni-buddha">
                Śākyamuni Buddha
              </Link>{" "}
              through the Indian patriarchs to
              <Link className="detail-inline-link" href="/masters/puti-damo">
                Bodhidharma
              </Link>{" "}
              and his Chinese successors. While modern historians recognise that portions of these
              lineage records were retrospectively constructed (Welter,{" "}
              <em>The Linji Lu and the Creation of Chan Orthodoxy</em>, 2008, pp. 29&ndash;55), the
              lineage principle remains central to Zen&rsquo;s institutional authority and its
              emphasis on the living relationship between teacher and student.
            </p>
          </div>
        </section>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/masters/dajian-huineng.webp"
          alt="Huineng, the Sixth Patriarch of Chan Buddhism"
          className="about-section-image"
        />

        <section className="detail-card">
          <h3 className="detail-section-title">Historical Development</h3>
          <div className="detail-summary">
            <p>
              Zen&rsquo;s lineage stretches from fifth-century India, through Tang-dynasty China,
              and onward into Korea (as <em>Seon</em>), Japan (as <em>Zen</em>), Vietnam (as{" "}
              <em>Thiền</em>), and &mdash; over the past century &mdash; the rest of the world. The
              tradition frames itself as a mind-to-mind transmission running from the historical
              Buddha through twenty-eight Indian patriarchs, the six patriarchs of early Chinese
              Chan, the Five Houses of the late Tang, and the national branches that followed.
            </p>
            <p>
              A full chronological walk-through &mdash; with dates, events, and the masters who
              carried the lineage at each turn &mdash; lives on the{" "}
              <Link className="detail-inline-link" href="/timeline">
                Timeline
              </Link>
              . This page stays with the <em>what</em> and the <em>why</em>; the{" "}
              <Link className="detail-inline-link" href="/timeline">
                Timeline
              </Link>{" "}
              is the <em>when</em>.
            </p>
          </div>
        </section>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/masters/hakuin-ekaku.webp"
          alt="Hakuin Ekaku, reviver of the Rinzai school"
          className="about-section-image"
        />

        <section className="detail-card">
          <h3 className="detail-section-title">The Major Schools</h3>
          <div className="detail-summary">
            <p>
              Five major Chan lineages emerged during the late Tang and Five Dynasties period, of
              which two survived to the present day (Leighton, <em>Zen&rsquo;s Chinese Heritage</em>
              , 2000, pp. 3&ndash;7):
            </p>
          </div>
          <ul className="detail-link-list" style={{ marginTop: "0.75rem" }}>
            <li>
              <Link href="/schools/linji">Linji (Rinzai)</Link>
              <span className="detail-list-meta">
                Founded by{" "}
                <Link className="detail-inline-link" href="/masters/linji-yixuan">
                  Línjì Yìxuán
                </Link>{" "}
                (d. 866). Emphasises kōan introspection and dynamic encounter dialogue. Transmitted
                to Japan by Eisai and later by Chinese émigrés during the Kamakura period.
              </span>
            </li>
            <li>
              <Link href="/schools/caodong">Caodong (Sōtō)</Link>
              <span className="detail-list-meta">
                Founded by{" "}
                <Link className="detail-inline-link" href="/masters/dongshan-liangjie">
                  Dòngshān Liángjié
                </Link>{" "}
                (807&ndash;869) and{" "}
                <Link className="detail-inline-link" href="/masters/caoshan-benji">
                  Cáoshān Běnjì
                </Link>{" "}
                (840&ndash;901). Known for &ldquo;silent illumination&rdquo; (<em>mòzhào</em>) and,
                in Japan, <em>shikantaza</em>. Transmitted to Japan by{" "}
                <Link className="detail-inline-link" href="/masters/dogen">
                  Dōgen Zenji
                </Link>{" "}
                in 1227.
              </span>
            </li>
            <li>
              <Link href="/schools/obaku">Ōbaku</Link>
              <span className="detail-list-meta">
                Brought to Japan in 1654 by Yǐnyuán Lóngqí (Ingen Ryūki), blending Linji Chan with
                Pure Land elements. The smallest of the three extant Japanese Zen schools.
              </span>
            </li>
            <li>
              <Link href="/schools/seon">Seon (선 · 禪)</Link>
              <span className="detail-list-meta">
                The Korean branch of the tradition, carried from Tang China beginning in the late
                eighth century and synthesized in the twelfth century by Bojo Jinul (1158&ndash;1210).
                The{" "}
                <Link className="detail-inline-link" href="/schools/jogye">
                  Jogye Order
                </Link>{" "}
                remains the dominant Buddhist institution in Korea today, with rigorous hwadu
                investigation still at the center of monastic training.
              </span>
            </li>
            <li>
              <Link href="/schools/thien">Thiền</Link>
              <span className="detail-list-meta">
                The Vietnamese branch. Transmitted as early as the sixth century, later synthesized
                into the indigenous{" "}
                <Link className="detail-inline-link" href="/schools/truc-lam">
                  Trúc Lâm
                </Link>{" "}
                school founded in 1299 by Emperor Trần Nhân Tông, and in the seventeenth century
                into the{" "}
                <Link className="detail-inline-link" href="/schools/lam-te">
                  Lâm Tế
                </Link>{" "}
                (Vietnamese Linji) lineage carried forward by Liễu Quán and, in our own time, by
                Thích Nhất Hạnh&rsquo;s{" "}
                <Link className="detail-inline-link" href="/schools/plum-village">
                  Plum Village
                </Link>{" "}
                community.
              </span>
            </li>
          </ul>
          <div className="detail-summary" style={{ marginTop: "0.75rem" }}>
            <p>
              The three extinct Tang-dynasty houses &mdash; Guiyang (潙仰), Yunmen (雲門), and Fayan
              (法眼) &mdash; were absorbed into the Linji lineage during the Song dynasty, though
              their distinctive teaching styles are preserved in the kōan literature.
            </p>
          </div>
        </section>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/masters/shunryu-suzuki.webp"
          alt="Shunryu Suzuki, who helped establish Soto Zen in the United States"
          className="about-section-image"
        />

        <section className="detail-card">
          <h3 className="detail-section-title">The Ensō</h3>
          <div className="detail-summary">
            <p>
              The image above is an <em>ensō</em> (円相), a circle drawn in a single brushstroke. It
              is one of the most recognisable symbols of Zen, expressing wholeness, the void (
              <em>śūnyatā</em>), and the beauty of imperfection. The practice of painting ensō
              belongs to the broader tradition of Zen calligraphy (<em>bokuseki</em>, &ldquo;ink
              traces&rdquo;), in which the spontaneous gesture of the brush is understood to reveal
              the state of mind of the practitioner at the moment of execution (Addiss,{" "}
              <em>The Art of Zen</em>, 1989, pp. 29&ndash;34).
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Explore This Encyclopedia</h3>
          <div className="detail-actions" style={{ justifyContent: "flex-start" }}>
            <Link className="detail-button" href="/lineage">
              Explore lineage
            </Link>
            <Link className="detail-button detail-button-muted" href="/masters">
              Browse masters
            </Link>
            <Link className="detail-button detail-button-muted" href="/schools">
              View schools
            </Link>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Sources Cited</h3>
          <ul className="detail-source-list">
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Addiss, Stephen.{" "}
                <em>The Art of Zen: Paintings and Calligraphy by Japanese Monks 1600&ndash;1925</em>
                . New York: Harry N. Abrams, 1989.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Aitken, Robert. <em>The Gateless Barrier: The Wu-Men Kuan (Mumonkan)</em>. San
                Francisco: North Point Press, 1991.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Broughton, Jeffrey L.{" "}
                <em>The Bodhidharma Anthology: The Earliest Records of Zen</em>. Berkeley:
                University of California Press, 1999.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Biography</span>
              </div>
              <p className="detail-source-excerpt">
                Chadwick, David.{" "}
                <em>Crooked Cucumber: The Life and Zen Teaching of Shunryu Suzuki</em>. New York:
                Broadway Books, 1999.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Cleary, Thomas, and J.C. Cleary, trans. <em>The Blue Cliff Record</em>. Boston:
                Shambhala, 1977.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Biography</span>
              </div>
              <p className="detail-source-excerpt">
                de Coulon, Jacques. <em>Maître Deshimaru: Biographie</em>. Paris: Éditions du Relié,
                2009.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Dōgen Zenji.{" "}
                <em>Treasury of the True Dharma Eye: Zen Master Dōgen&rsquo;s Shōbōgenzō</em>.
                Edited by Kazuaki Tanahashi. Boston: Shambhala, 2010.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Dumoulin, Heinrich. <em>Zen Buddhism: A History. Vol. 1, India and China</em>.
                Translated by James W. Heisig and Paul Knitter. Bloomington: World Wisdom, 2005.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Dumoulin, Heinrich. <em>Zen Buddhism: A History. Vol. 2, Japan</em>. Translated by
                James W. Heisig and Paul Knitter. Bloomington: World Wisdom, 2005.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Faure, Bernard.{" "}
                <em>The Rhetoric of Immediacy: A Cultural Critique of Chan/Zen Buddhism</em>.
                Princeton: Princeton University Press, 1991.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Edited volume</span>
              </div>
              <p className="detail-source-excerpt">
                Gregory, Peter N., ed.{" "}
                <em>Sudden and Gradual: Approaches to Enlightenment in Chinese Thought</em>.
                Honolulu: University of Hawai&rsquo;i Press, 1987.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Chapter</span>
              </div>
              <p className="detail-source-excerpt">
                Mohr, Michel. &ldquo;Hakuin&rsquo;s Daruma: Negotiating Zen, Art and
                Iconography.&rdquo; In Steven Heine and Dale S. Wright, eds.,{" "}
                <em>The Kōan: Texts and Contexts in Zen Buddhism</em>. Oxford: Oxford University
                Press, 2000, pp. 84&ndash;109.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Leighton, Taigen Dan.{" "}
                <em>Zen&rsquo;s Chinese Heritage: The Masters and Their Teachings</em>. Boston:
                Wisdom Publications, 2000.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                McRae, John R.{" "}
                <em>
                  Seeing Through Zen: Encounter, Transformation, and Genealogy in Chinese Chan
                  Buddhism
                </em>
                . Berkeley: University of California Press, 2003.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Poceski, Mario.{" "}
                <em>
                  Ordinary Mind as the Way: The Hongzhou School and the Growth of Chan Buddhism
                </em>
                . Oxford: Oxford University Press, 2007.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Red Pine (Bill Porter). <em>The Heart Sutra: The Womb of Buddhas</em>. Washington,
                DC: Shoemaker &amp; Hoard, 2004.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Chapter</span>
              </div>
              <p className="detail-source-excerpt">
                Sharf, Robert H. &ldquo;The Zen of Japanese Nationalism.&rdquo; In Donald S. Lopez
                Jr., ed., <em>Curators of the Buddha: The Study of Buddhism Under Colonialism</em>.
                Chicago: University of Chicago Press, 1995, pp. 107&ndash;160.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Suzuki, Shunryū. <em>Zen Mind, Beginner&rsquo;s Mind</em>. Edited by Trudy Dixon.
                New York: Weatherhill, 1970.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Welter, Albert.{" "}
                <em>
                  The Linji Lu and the Creation of Chan Orthodoxy: The Development of Chan&rsquo;s
                  Records of Sayings Literature
                </em>
                . Oxford: Oxford University Press, 2008.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Yampolsky, Philip B. <em>The Platform Sutra of the Sixth Patriarch</em>. New York:
                Columbia University Press, 1967.
              </p>
            </li>
          </ul>
        </section>
        <footer className="about-credit">
          Open source on{" "}
          <a
            href="https://github.com/echojoel/zenlineage"
            className="detail-inline-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}
