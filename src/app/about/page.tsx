import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { FootnoteList, FootnoteRef, type FootnoteRef as FN } from "@/lib/footnotes";

/**
 * Wikipedia-style footnotes for the /about page. Each `<FootnoteRef n={N} scope="about" />`
 * in the JSX below resolves to the entry in this array whose `index` matches.
 * Authors: order is irrelevant — the renderer sorts by index for the printed list.
 */
const ABOUT_FOOTNOTES: FN[] = [
  {
    index: 1,
    sourceTitle: "Zen Buddhism: A History — Volume 1: India and China",
    author: "Heinrich Dumoulin (trans. James W. Heisig & Paul Knitter)",
    pageOrSection: "pp. 85–94",
    sourceUrl: "https://wisdomexperience.org/product/zen-buddhism-a-history-volume-1/",
  },
  {
    index: 2,
    sourceTitle: "Zen Buddhism: A History — Volume 1: India and China",
    author: "Heinrich Dumoulin",
    pageOrSection: "pp. 132–141",
  },
  {
    index: 3,
    sourceTitle: "Seeing through Zen: Encounter, Transformation, and Genealogy in Chinese Chan Buddhism",
    author: "John R. McRae",
    pageOrSection: "pp. 12–13",
    sourceUrl: "https://www.ucpress.edu/book/9780520237988/seeing-through-zen",
  },
  {
    index: 4,
    sourceTitle: "Seeing through Zen",
    author: "John R. McRae",
    pageOrSection: "p. 13",
    excerpt:
      "These lines should not be understood as a historically accurate description of Chan; rather, they encode how the tradition came to articulate its own identity.",
  },
  {
    index: 5,
    sourceTitle: "Chan Insights and Oversights: An Epistemological Critique of the Chan Tradition",
    author: "Bernard Faure",
    pageOrSection: "ch. 5",
  },
  {
    index: 6,
    sourceTitle: "The Kōan: Texts and Contexts in Zen Buddhism",
    author: "Steven Heine & Dale S. Wright (eds.)",
    pageOrSection: "Mohr, \"Hakuin's Daruma\" (ch. 8)",
  },
];

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
  author: { "@type": "Person", name: "Joel Pestana" },
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
          <figure className="detail-hero-figure">
            <Image
              src="/about-enso.webp"
              alt="Ensō — a circle drawn in one brushstroke, symbolizing enlightenment, the universe, and the void in Zen"
              width={400}
              height={400}
              className="detail-hero-image"
              priority
            />
            <figcaption className="figure-credit">
              Ensō — brushstroke study, public domain via Wikimedia Commons.
            </figcaption>
          </figure>
          <p className="detail-eyebrow">Introduction</p>
          <h2 className="detail-title">What is Zen Lineage?</h2>
          <p className="detail-subtitle">An open encyclopedia of Chan and Zen history</p>
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
              The longer answer &mdash; the one the rest of this page is for &mdash; has three
              parts: what the word means and where it comes from, how the same tradition wears
              four different names across Asia, and the three pillars of meditation /
              transmission / awakening.
            </p>

            <h4 className="detail-subsection-title">One word, five languages</h4>
            <p>
              Zen, Chán, Seon, Thiền, dhyāna &mdash; these are the same word, refracted across the
              languages the tradition travelled through. The Sanskrit <em>dhyāna</em> (ध्यान,
              &ldquo;meditative absorption&rdquo;) was transliterated into Chinese as{" "}
              <em>chánnà</em> (禪那), shortened to <em>chán</em> (禪), and then read in Korean as{" "}
              <em>Seon</em> (선/禪), in Vietnamese as <em>Thiền</em>, and in Japanese as{" "}
              <em>Zen</em> (禅). The English word &ldquo;Zen&rdquo; is the Japanese reading,
              which is why the English-speaking world tends to assume the tradition is Japanese
              when it is, in fact, Chinese in origin and pan-Asian in scope (Dumoulin,{" "}
              <em>Zen Buddhism: A History, Vol. 1</em>, 2005, pp. 9&ndash;13).
            </p>

            <h4 className="detail-subsection-title">One tradition, four schools, four names</h4>
            <p>
              <strong>Chán</strong>, <strong>Seon</strong>, <strong>Thiền</strong>, and{" "}
              <strong>Zen</strong> are the same tradition as it took root in China, Korea,
              Vietnam, and Japan. The doctrinal core is identical: direct pointing at the mind,
              transmission outside the scriptures, awakening as recognition of one&rsquo;s own
              nature. What diverges is style. Chinese{" "}
              <Link className="detail-inline-link" href="/schools">
                Chán
              </Link>{" "}
              kept its Tang-dynasty diversity longest. Korean{" "}
              <Link className="detail-inline-link" href="/schools/seon">
                Seon
              </Link>{" "}
              centred on <em>hwadu</em> investigation under{" "}
              <Link className="detail-inline-link" href="/masters/jinul">
                Jinul
              </Link>
              . Vietnamese{" "}
              <Link className="detail-inline-link" href="/schools/thien">
                Thiền
              </Link>{" "}
              produced the indigenous{" "}
              <Link className="detail-inline-link" href="/schools/truc-lam">
                Trúc Lâm
              </Link>{" "}
              school in 1299 and, in our own time,{" "}
              <Link className="detail-inline-link" href="/masters/thich-nhat-hanh">
                Thích Nhất Hạnh
              </Link>
              &rsquo;s engaged-Buddhism reformulation. Japanese{" "}
              <Link className="detail-inline-link" href="/schools">
                Zen
              </Link>{" "}
              split into the kōan-driven{" "}
              <Link className="detail-inline-link" href="/schools/linji">
                Rinzai
              </Link>{" "}
              and the silent-illumination{" "}
              <Link className="detail-inline-link" href="/schools/caodong">
                Sōtō
              </Link>
              , and is the form that travelled to the West first. Treating any one of these as
              the &ldquo;real&rdquo; Zen and the others as variants is a category error.
            </p>

            <h4 className="detail-subsection-title">Meditation, transmission, awakening</h4>
            <p>
              Three things hold the tradition together across all four regional forms. The
              first is <strong>meditation</strong> &mdash; <em>zazen</em> in Japanese, ordinary
              seated practice with a straight back and a bare attention to what is. Sōtō calls
              it <em>shikantaza</em> (&ldquo;just sitting&rdquo;); Rinzai pairs it with{" "}
              <em>kōan</em> introspection; Korean Seon uses <em>hwadu</em>; the underlying act
              is the same. The second is <strong>transmission</strong> &mdash; not a doctrine
              passed in books but a relationship between teacher and student, ratified when the
              teacher recognises in the student what the teacher&rsquo;s own teacher recognised
              in them. Modern scholarship has shown the lineage charts to be partly
              retrospective constructions (Welter, <em>The Linji Lu</em>, 2008, pp. 29&ndash;55),
              but the principle &mdash; that awakening is verified, not self-declared &mdash;
              remains the spine of the institution. The third is <strong>awakening</strong>{" "}
              itself: <em>kenshō</em> (見性, &ldquo;seeing one&rsquo;s nature&rdquo;), the moment
              the practitioner recognises that the buddha-nature being sought has been the one
              looking the whole time.
            </p>

          </div>
        </section>

        <figure className="about-figure">
          <Image
            src="/masters/thich-nhat-hanh.webp"
            alt="Thích Nhất Hạnh, twentieth-century teacher of Vietnamese Thiền"
            width={320}
            height={320}
            className="about-section-image"
          />
          <figcaption className="figure-credit">
            Thích Nhất Hạnh (1926–2022) — modern teacher of Vietnamese Thiền and founder
            of Plum Village (photo via Wikimedia Commons).
          </figcaption>
        </figure>

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
              accounts<FootnoteRef n={1} scope="about" />. In Korean the tradition is called{" "}
              <em>Seon</em> (선/禪), and in Vietnamese, <em>Thiền</em>.
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
              ritual observance<FootnoteRef n={2} scope="about" />.
            </p>
            <p>
              A celebrated four-line verse, traditionally attributed to
              <Link className="detail-inline-link" href="/masters/puti-damo">
                Bodhidharma
              </Link>{" "}
              but likely compiled in the late Tang period, captures the school&rsquo;s
              self-understanding<FootnoteRef n={3} scope="about" />:
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
              its identity&rdquo;<FootnoteRef n={4} scope="about" />. Zen has always been embedded
              in the broader Mahāyāna tradition: its monasteries follow the Vinaya, its liturgy
              draws on sutras, and its doctrinal vocabulary is shaped by Madhyamaka and Yogācāra
              philosophy<FootnoteRef n={5} scope="about" />.
            </p>
          </div>
        </section>

        <figure className="about-figure">
          <Image
            src="/masters/puti-damo.webp"
            alt="Bodhidharma (Puti Damo), the First Patriarch of Chan Buddhism"
            width={320}
            height={320}
            className="about-section-image"
          />
          <figcaption className="figure-credit">
            Bodhidharma — ink portrait attributed to Yi Yuanji, 11th c. (Wikimedia Commons,
            public domain).
          </figcaption>
        </figure>

        <figure className="about-figure">
          <Image
            src="/about-zendo.webp"
            alt="Zendō at Tōfuku-ji — long parallel meditation platforms running the length of the hall"
            width={480}
            height={259}
            className="about-section-image about-section-image--wide"
          />
          <figcaption className="figure-credit">
            Zendō at Tōfuku-ji, Kyoto — the meditation hall where zazen is sat in unison
            (Wikimedia Commons).
          </figcaption>
        </figure>

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
            <figure className="about-figure">
              <Image
                src="/about-zazen.webp"
                alt="Kōdō Sawaki seated in zazen — full lotus posture, hands in the cosmic mudra"
                width={320}
                height={457}
                className="about-section-image"
              />
              <figcaption className="figure-credit">
                Kōdō Sawaki (1880–1965) seated in zazen — the form Dōgen describes in the{" "}
                <em>Fukanzazengi</em> (Wikimedia Commons).
              </figcaption>
            </figure>
            <p>
              In the Rinzai (Linji) school, zazen is complemented by intensive engagement with{" "}
              <em>kōan</em> (公案) &mdash; paradoxical questions or dialogues drawn from the records
              of past masters. The practitioner holds the kōan in mind during meditation and in all
              daily activities, working to penetrate its meaning beyond conceptual thought. The
              classic kōan &ldquo;What is the sound of one hand?&rdquo; was formulated by{" "}
              <Link className="detail-inline-link" href="/masters/hakuin-ekaku">
                Hakuin Ekaku
              </Link>{" "}
              (1686&ndash;1769), who systematised kōan practice into a structured curriculum<FootnoteRef n={6} scope="about" />.
            </p>
          </div>
        </section>

        <figure className="about-figure">
          <Image
            src="/masters/dogen.webp"
            alt="Dogen Zenji, founder of Soto Zen in Japan"
            width={320}
            height={320}
            className="about-section-image"
          />
          <figcaption className="figure-credit">
            Dōgen Zenji (1200–1253) — historical portrait via Wikimedia Commons, public domain.
          </figcaption>
        </figure>

        <figure className="about-figure">
          <Image
            src="/about-eiheiji.webp"
            alt="Eihei-ji, the principal Sōtō temple in Fukui prefecture — wooden cloisters and stone steps among cedars"
            width={480}
            height={320}
            className="about-section-image about-section-image--wide"
          />
          <figcaption className="figure-credit">
            Eihei-ji, Fukui — founded by Dōgen Zenji in 1244 and still the head temple of Sōtō
            Zen (Wikimedia Commons).
          </figcaption>
        </figure>

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
            <figure className="about-figure">
              <Image
                src="/about-ten-bulls.webp"
                alt="A panel from the Ten Bulls (Oxherding) sequence — ink and colour on silk, depicting one stage of the path"
                width={320}
                height={427}
                className="about-section-image"
              />
              <figcaption className="figure-credit">
                From the <em>Ten Bulls</em> (Oxherding) sequence — a classical visual narrative
                of the gradual path of awakening, Edo-period silk handscroll (Met Museum /
                Wikimedia Commons, public domain).
              </figcaption>
            </figure>
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
            <figure className="about-figure">
              <Image
                src="/about-ryoanji.webp"
                alt="The karesansui rock garden at Ryōan-ji, Kyoto — fifteen stones arranged in raked white gravel"
                width={480}
                height={323}
                className="about-section-image about-section-image--wide"
              />
              <figcaption className="figure-credit">
                Ryōan-ji (15th c.), Kyoto — the karesansui rock garden gives form to the doctrine
                of emptiness: the gravel and stones hold weight only against the absences they
                describe (Wikimedia Commons).
              </figcaption>
            </figure>
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

        <figure className="about-figure">
          <Image
            src="/masters/dajian-huineng.webp"
            alt="Huineng, the Sixth Patriarch of Chan Buddhism"
            width={320}
            height={320}
            className="about-section-image"
          />
          <figcaption className="figure-credit">
            Dajian Huineng (638–713), the Sixth Patriarch — silk hanging scroll, 13th c.
            (Wikimedia Commons, public domain).
          </figcaption>
        </figure>

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
              The full chronological account &mdash; Bodhidharma&rsquo;s arrival, the Tang
              masters, the Song-dynasty kōan collections, the transmission to Japan, the
              twentieth-century opening to the West &mdash; lives on the Timeline page. This
              page is the <em>what</em> and the <em>why</em>; the Timeline is the <em>when</em>.
            </p>
          </div>
          <div className="detail-actions" style={{ justifyContent: "flex-start", marginTop: "1rem" }}>
            <Link className="detail-button" href="/timeline">
              Open the Timeline →
            </Link>
          </div>
        </section>

        <figure className="about-figure">
          <Image
            src="/masters/hakuin-ekaku.webp"
            alt="Hakuin Ekaku, reviver of the Rinzai school"
            width={320}
            height={320}
            className="about-section-image"
          />
          <figcaption className="figure-credit">
            Hakuin Ekaku (1686–1769), self-portrait — ink on paper (Wikimedia Commons,
            public domain).
          </figcaption>
        </figure>

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

        <figure className="about-figure">
          <Image
            src="/masters/shunryu-suzuki.webp"
            alt="Shunryu Suzuki, who helped establish Soto Zen in the United States"
            width={320}
            height={320}
            className="about-section-image"
          />
          <figcaption className="figure-credit">
            Shunryū Suzuki (1904–1971), founding teacher of San Francisco Zen Center
            (photo via Wikimedia Commons, fair use / educational).
          </figcaption>
        </figure>

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
          <FootnoteList refs={ABOUT_FOOTNOTES} scope="about" title="Notes" />
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Bibliography</h3>
          <p className="detail-list-meta" style={{ marginBottom: "1rem" }}>
            Full literature list — every work referenced in the inline notes above plus the
            general scholarly background.
          </p>
          <ul className="detail-source-list">
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Addiss, Stephen.{" "}
                <em><a href="https://en.wikipedia.org/wiki/Zen_painting" className="detail-inline-link" target="_blank" rel="noopener noreferrer">The Art of Zen: Paintings and Calligraphy by Japanese Monks 1600&ndash;1925</a></em>
                . New York: Harry N. Abrams, 1989.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Aitken, Robert. <em><a href="https://en.wikipedia.org/wiki/Robert_Baker_Aitken" className="detail-inline-link" target="_blank" rel="noopener noreferrer">The Gateless Barrier: The Wu-Men Kuan (Mumonkan)</a></em>. San
                Francisco: North Point Press, 1991.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Broughton, Jeffrey L.{" "}
                <em><a href="https://en.wikipedia.org/wiki/Bodhidharma" className="detail-inline-link" target="_blank" rel="noopener noreferrer">The Bodhidharma Anthology: The Earliest Records of Zen</a></em>. Berkeley:
                University of California Press, 1999.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Biography</span>
              </div>
              <p className="detail-source-excerpt">
                Chadwick, David.{" "}
                <em><a href="https://en.wikipedia.org/wiki/Shunry%C5%AB_Suzuki" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Crooked Cucumber: The Life and Zen Teaching of Shunryu Suzuki</a></em>. New York:
                Broadway Books, 1999.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Cleary, Thomas, and J.C. Cleary, trans. <em><a href="https://en.wikipedia.org/wiki/The_Blue_Cliff_Record" className="detail-inline-link" target="_blank" rel="noopener noreferrer">The Blue Cliff Record</a></em>. Boston:
                Shambhala, 1977.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Biography</span>
              </div>
              <p className="detail-source-excerpt">
                de Coulon, Jacques. <em><a href="https://en.wikipedia.org/wiki/Taisen_Deshimaru" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Maître Deshimaru: Biographie</a></em>. Paris: Éditions du Relié,
                2009.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Dōgen Zenji.{" "}
                <em><a href="https://www.shambhala.com/treasury-of-the-true-dharma-eye-1450.html" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Treasury of the True Dharma Eye: Zen Master Dōgen&rsquo;s Shōbōgenzō</a></em>.
                Edited by Kazuaki Tanahashi. Boston: Shambhala, 2010.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Dumoulin, Heinrich. <em><a href="https://wisdomexperience.org/product/zen-buddhism-a-history-volume-1/" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Zen Buddhism: A History. Vol. 1, India and China</a></em>.
                Translated by James W. Heisig and Paul Knitter. Bloomington: World Wisdom, 2005.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Dumoulin, Heinrich. <em><a href="https://wisdomexperience.org/product/zen-buddhism-a-history-volume-2/" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Zen Buddhism: A History. Vol. 2, Japan</a></em>. Translated by
                James W. Heisig and Paul Knitter. Bloomington: World Wisdom, 2005.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Faure, Bernard.{" "}
                <em><a href="https://en.wikipedia.org/wiki/Bernard_Faure" className="detail-inline-link" target="_blank" rel="noopener noreferrer">The Rhetoric of Immediacy: A Cultural Critique of Chan/Zen Buddhism</a></em>.
                Princeton: Princeton University Press, 1991.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Edited volume</span>
              </div>
              <p className="detail-source-excerpt">
                Gregory, Peter N., ed.{" "}
                <em><a href="https://en.wikipedia.org/wiki/Subitism" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Sudden and Gradual: Approaches to Enlightenment in Chinese Thought</a></em>.
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
                <em><a href="https://global.oup.com/academic/product/the-koan-9780195117486" className="detail-inline-link" target="_blank" rel="noopener noreferrer">The Kōan: Texts and Contexts in Zen Buddhism</a></em>. Oxford: Oxford University
                Press, 2000, pp. 84&ndash;109.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Leighton, Taigen Dan.{" "}
                <em><a href="https://wisdomexperience.org/product/zens-chinese-heritage/" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Zen&rsquo;s Chinese Heritage: The Masters and Their Teachings</a></em>. Boston:
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
                  <a href="https://www.ucpress.edu/book/9780520237988/seeing-through-zen" className="detail-inline-link" target="_blank" rel="noopener noreferrer">
                    Seeing Through Zen: Encounter, Transformation, and Genealogy in Chinese Chan
                    Buddhism
                  </a>
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
                  <a href="https://en.wikipedia.org/wiki/Hongzhou_school" className="detail-inline-link" target="_blank" rel="noopener noreferrer">
                    Ordinary Mind as the Way: The Hongzhou School and the Growth of Chan Buddhism
                  </a>
                </em>
                . Oxford: Oxford University Press, 2007.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Red Pine (Bill Porter). <em><a href="https://en.wikipedia.org/wiki/Heart_Sutra" className="detail-inline-link" target="_blank" rel="noopener noreferrer">The Heart Sutra: The Womb of Buddhas</a></em>. Washington,
                DC: Shoemaker &amp; Hoard, 2004.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Chapter</span>
              </div>
              <p className="detail-source-excerpt">
                Sharf, Robert H. &ldquo;The Zen of Japanese Nationalism.&rdquo; In Donald S. Lopez
                Jr., ed., <em><a href="https://en.wikipedia.org/wiki/Robert_H._Sharf" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Curators of the Buddha: The Study of Buddhism Under Colonialism</a></em>.
                Chicago: University of Chicago Press, 1995, pp. 107&ndash;160.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Suzuki, Shunryū. <em><a href="https://en.wikipedia.org/wiki/Zen_Mind,_Beginner%27s_Mind" className="detail-inline-link" target="_blank" rel="noopener noreferrer">Zen Mind, Beginner&rsquo;s Mind</a></em>. Edited by Trudy Dixon.
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
                  <a href="https://en.wikipedia.org/wiki/Linji_Yixuan" className="detail-inline-link" target="_blank" rel="noopener noreferrer">
                    The Linji Lu and the Creation of Chan Orthodoxy: The Development of Chan&rsquo;s
                    Records of Sayings Literature
                  </a>
                </em>
                . Oxford: Oxford University Press, 2008.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Yampolsky, Philip B. <em><a href="https://en.wikipedia.org/wiki/Platform_Sutra" className="detail-inline-link" target="_blank" rel="noopener noreferrer">The Platform Sutra of the Sixth Patriarch</a></em>. New York:
                Columbia University Press, 1967.
              </p>
            </li>
          </ul>
        </section>
        <footer className="about-credit">
          <p>
            Created by{" "}
            <a
              href="https://github.com/echojoel"
              className="detail-inline-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Joel Pestana
            </a>
            , student of{" "}
            <Link className="detail-inline-link" href="/masters/yves-shoshin-crettaz">
              Yves Shoshin Crettaz
            </Link>
            . A study of the Zen patriarchs —{" "}
            <a
              href="https://github.com/echojoel/zenlineage"
              className="detail-inline-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              open source
            </a>
            ; corrections welcome via{" "}
            <a
              href="https://github.com/echojoel/zenlineage/issues"
              className="detail-inline-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub issues
            </a>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}
