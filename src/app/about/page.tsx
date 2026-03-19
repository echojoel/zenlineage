import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Zen — Zen Lineage",
  description:
    "What is Zen Buddhism? A precise introduction to the history, practice, and philosophy of Chan/Zen, with scholarly citations.",
};

export default function AboutPage() {
  return (
    <main className="detail-page">
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
          <h2 className="detail-title">What is Zen?</h2>
          <p className="detail-subtitle">
            A tradition of awakening through direct experience
          </p>
        </section>

        <section className="detail-card">
          <div className="detail-summary">
            <p>
              My name is Joel, and I&rsquo;m a student of Soto Zen. For years
              I sat on the cushion following the breath, trusting shikantaza, and
              yet I kept running into names and lineage charts I couldn&rsquo;t
              place &mdash; who was Shitou, and how did his teaching reach
              Dogen? Why does Korean Seon feel so different from Japanese
              Rinzai when they share the same Linji root? What happened in
              Vietnam, and why didn&rsquo;t I know about it?
            </p>
            <p>
              I built Zen Lineage to answer those questions for myself and for
              anyone else who has ever wondered how all the branches of this
              vast tradition connect. It is not a scholarly authority &mdash;
              it is a quiet place to explore, the way you might walk slowly
              through an old temple and read the names on the ancestor tablets.
              Every master, every transmission, every school page is sourced
              and open to correction. If you find an error, please open an
              issue &mdash; accuracy is a form of respect, and this project
              is a labor of that respect.
            </p>
            <p style={{ marginBottom: 0 }}>
              May it be useful to your practice.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Etymology</h3>
          <div className="detail-summary">
            <p>
              The word <em>Zen</em> (禅) is the Japanese reading of the Chinese
              character <em>Chán</em> (禪), itself a transliteration of the
              Sanskrit <em>dhyāna</em> (ध्यान), meaning &ldquo;meditative
              absorption&rdquo; or &ldquo;meditative state.&rdquo; The term
              entered Chinese Buddhism through early translations of Indian
              meditation texts; the monk Buddhabhadra (359&ndash;429 CE) and
              later <Link className="detail-inline-link" href="/masters/puti-damo">Bodhidharma</Link> are credited with transmitting dhyāna practice
              to China (Dumoulin, <em>Zen Buddhism: A History &mdash; India and
              China</em>, 2005, pp. 85&ndash;94). In Korean the tradition is
              called <em>Seon</em> (선/禪), and in Vietnamese, <em>Thiền</em>.
            </p>
          </div>
        </section>

        <section className="detail-card">
          <h3 className="detail-section-title">Definition</h3>
          <div className="detail-summary">
            <p>
              Zen is a school of Mahāyāna Buddhism that originated in China
              during the Tang dynasty (618&ndash;907 CE) and subsequently spread
              to Korea, Japan, and Vietnam. It emphasises meditation practice
              (<em>zuòchán</em> / <em>zazen</em>) and direct, experiential
              insight into one&rsquo;s own nature (<em>jiànxìng</em> 見性,
              Japanese <em>kenshō</em>) as the primary path to awakening, rather
              than sole reliance on doctrinal study or ritual observance
              (Dumoulin, <em>Zen Buddhism: A History &mdash; India and
              China</em>, 2005, pp. 7&ndash;12).
            </p>
            <p>
              A celebrated four-line verse, traditionally attributed to
              <Link className="detail-inline-link" href="/masters/puti-damo">Bodhidharma</Link> but likely compiled in the late Tang period, captures
              the school&rsquo;s self-understanding (McRae, <em>Seeing Through
              Zen</em>, 2003, pp. 12&ndash;13):
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
              A special transmission outside the scriptures,<br />
              Not dependent on words and letters;<br />
              Pointing directly at the human mind,<br />
              Seeing into one&rsquo;s nature and attaining Buddhahood.
            </blockquote>
            <p>
              As John McRae notes, these lines &ldquo;should not be understood
              as a historically accurate description of Chan&rsquo;s origins,
              but as a retrospective distillation of its identity&rdquo; (McRae,
              2003, p. 13). Zen has always been embedded in the broader
              Mahāyāna tradition: its monasteries follow the Vinaya, its
              liturgy draws on sutras, and its doctrinal vocabulary is shaped by
              Madhyamaka and Yogācāra philosophy (Faure, <em>The Rhetoric of
              Immediacy</em>, 1991, pp. 15&ndash;31).
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
              The central practice of Zen is seated meditation, known
              as <em>zazen</em> (坐禅, &ldquo;sitting dhyāna&rdquo;). In the
              Sōtō school, this takes the form of <em>shikantaza</em>
              (&ldquo;just sitting&rdquo;), a practice of objectless awareness
              in which the practitioner sits upright, following the breath
              without pursuing or suppressing thoughts. <Link className="detail-inline-link" href="/masters/dogen">Dōgen Zenji</Link>
              {" "}(1200&ndash;1253) described this in his <em>Fukanzazengi</em>
              (&ldquo;Universal Recommendations for Zazen&rdquo;): &ldquo;Think
              of not-thinking. How do you think of not-thinking? Non-thinking.
              This in itself is the essential art of zazen&rdquo; (Dōgen,
              tr. Tanahashi, <em>Treasury of the True Dharma Eye</em>,
              2010, p. 886).
            </p>
            <p>
              In the Rinzai (Linji) school, zazen is complemented by intensive
              engagement with <em>kōan</em> (公案) &mdash; paradoxical
              questions or dialogues drawn from the records of past masters. The
              practitioner holds the kōan in mind during meditation and in all
              daily activities, working to penetrate its meaning beyond
              conceptual thought. The classic kōan &ldquo;What is the sound of
              one hand?&rdquo; was formulated by <Link className="detail-inline-link" href="/masters/hakuin-ekaku">Hakuin Ekaku</Link>
              {" "}(1686&ndash;1769), who systematised kōan practice into a
              structured curriculum (Mohr, <em>Hakuin&rsquo;s Daruma</em>,
              in Heine &amp; Wright, eds., <em>The Kōan</em>, 2000,
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
              <strong>Buddha-nature</strong> (<em>foxìng</em> 佛性) &mdash; Zen
              inherits from the <em>Tathāgatagarbha</em> doctrine the
              assertion that all sentient beings possess the potential for
              awakening. The <em>Platform Sutra</em>, attributed to the Sixth
              Patriarch <Link className="detail-inline-link" href="/masters/dajian-huineng">Huìnéng</Link> (638&ndash;713), states: &ldquo;Good friends,
              the bodhi-nature is originally pure. By making use of this mind,
              one directly attains Buddhahood&rdquo; (Yampolsky, <em>The
              Platform Sutra of the Sixth Patriarch</em>, 1967, p. 130).
            </p>
            <p>
              <strong>Sudden and gradual awakening</strong> &mdash; The
              dialectic between sudden (<em>dùn</em> 頓) and gradual
              (<em>jiàn</em> 漸) enlightenment has shaped Zen since the
              traditional account of the rift between <Link className="detail-inline-link" href="/masters/dajian-huineng">Huìnéng</Link> and <Link className="detail-inline-link" href="/masters/yuquan-shenxiu">Shénxiù</Link>
              {" "}(606?&ndash;706). Modern scholarship has shown that this
              distinction was more polemical than practical: most Chan masters
              acknowledged both instantaneous insight and sustained cultivation
              (Gregory, <em>Sudden and Gradual: Approaches to Enlightenment in
              Chinese Thought</em>, 1987, pp. 1&ndash;35).
            </p>
            <p>
              <strong>Emptiness</strong> (<em>śūnyatā</em>, <em>kōng</em> 空)
              &mdash; Following the <em>Prajñāpāramitā</em> literature and
              <Link className="detail-inline-link" href="/masters/nagarjuna">Nāgārjuna</Link>&rsquo;s <em>Mūlamadhyamakakārikā</em>, Zen holds that
              all phenomena are empty of independent, inherent existence. This
              is not nihilism but the recognition that things arise
              interdependently. The <em>Heart Sutra</em>, chanted daily in Zen
              monasteries, declares: &ldquo;Form is emptiness; emptiness is
              form&rdquo; (Red Pine, <em>The Heart Sutra</em>, 2004,
              pp. 2&ndash;3).
            </p>
            <p>
              <strong>Transmission</strong> (<em>yìxīn chuánxīn</em>
              , &ldquo;mind-to-mind transmission&rdquo;) &mdash; Zen maintains
              an unbroken lineage of teacher-to-student dharma transmission
              stretching from <Link className="detail-inline-link" href="/masters/shakyamuni-buddha">Śākyamuni Buddha</Link> through the Indian patriarchs to
              <Link className="detail-inline-link" href="/masters/puti-damo">Bodhidharma</Link> and his Chinese successors. While modern historians
              recognise that portions of these lineage records were
              retrospectively constructed (Welter, <em>The Linji Lu and the
              Creation of Chan Orthodoxy</em>, 2008, pp. 29&ndash;55), the
              lineage principle remains central to Zen&rsquo;s institutional
              authority and its emphasis on the living relationship between
              teacher and student.
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
              <strong>Indian roots (c. 5th century CE)</strong> &mdash;
              <Link className="detail-inline-link" href="/masters/puti-damo">Bodhidharma</Link>, a semi-legendary figure traditionally said to have
              arrived in China around 520 CE, is regarded as the First Patriarch
              of Chan. The earliest reliable reference to him appears in
              Yángxuǎnzhī&rsquo;s <em>Record of the Buddhist Monasteries of
              Luoyang</em> (547 CE), which describes a Persian or Central Asian
              monk practising wall-gazing meditation at Yǒngníng Temple
              (Broughton, <em>The Bodhidharma Anthology</em>, 1999,
              pp. 2&ndash;8).
            </p>
            <p>
              <strong>Tang dynasty flourishing (7th&ndash;10th centuries)</strong>
              &mdash; Chan crystallised as a distinct school during the Tang
              dynasty, producing the great masters whose recorded sayings
              (<em>yǔlù</em>) would become the foundational texts of the
              tradition: <Link className="detail-inline-link" href="/masters/mazu-daoyi">Mǎzǔ Dàoyī</Link> (709&ndash;788), whose teaching style
              introduced shouts, blows, and iconoclastic gestures; <Link className="detail-inline-link" href="/masters/linji-yixuan">Línjì Yìxuán</Link>
              {" "}(d. 866), founder of the <Link className="detail-inline-link" href="/schools/linji">Linji</Link> school; and <Link className="detail-inline-link" href="/masters/dongshan-liangjie">Dòngshān Liángjié</Link>
              {" "}(807&ndash;869), founder of the <Link className="detail-inline-link" href="/schools/caodong">Caodong</Link> school. The great
              persecution of Buddhism in 845 under Emperor Wǔzōng destroyed
              much of the scholastic Buddhist establishment but largely spared
              Chan, which was less dependent on textual libraries and imperial
              patronage (Poceski, <em>Ordinary Mind as the Way</em>, 2007,
              pp. 21&ndash;40).
            </p>
            <p>
              <strong>Song dynasty maturation (10th&ndash;13th centuries)</strong>
              &mdash; During the Song dynasty, Chan became the dominant form of
              monastic Buddhism in China. This period produced the major kōan
              collections: the <em>Blue Cliff Record</em> (<em>Bìyán Lù</em>,
              1125), compiled by <Link className="detail-inline-link" href="/masters/yuanwu-keqin">Yuánwù Kèqín</Link> from <Link className="detail-inline-link" href="/masters/xuedou-chongxian">Xuědòu Zhòngxiǎn</Link>&rsquo;s
              verses; and the <em>Gateless Gate</em> (<em>Wúmén Guān</em>,
              1228) by <Link className="detail-inline-link" href="/masters/wumen-huikai">Wúmén Huìkāi</Link> (Cleary &amp; Cleary, <em>The Blue Cliff
              Record</em>, 1977, Introduction; Aitken, <em>The Gateless
              Barrier</em>, 1991, pp. ix&ndash;xxi).
            </p>
            <p>
              <strong>Transmission to Japan (12th&ndash;13th centuries)</strong>
              &mdash; Eisai (Myōan Yōsai, 1141&ndash;1215) introduced Rinzai
              Zen to Japan after studying in Song China; <Link className="detail-inline-link" href="/masters/dogen">Dōgen Zenji</Link> brought the
              <Link className="detail-inline-link" href="/schools/caodong">Caodong</Link> (<Link className="detail-inline-link" href="/schools/soto">Sōtō</Link>) lineage back in 1227 after receiving dharma
              transmission from <Link className="detail-inline-link" href="/masters/tiantong-rujing">Tiāntóng Rújìng</Link>. These two lineages shaped
              Japanese Zen and remain its principal branches (Dumoulin,
              <em>Zen Buddhism: A History &mdash; Japan</em>, 2005,
              pp. 7&ndash;23, 51&ndash;99).
            </p>
            <p>
              <strong>Modern era (19th century&ndash;present)</strong> &mdash;
              Zen entered Western awareness through the writings of D.T. Suzuki,
              whose <em>An Introduction to Zen Buddhism</em> (first English
              edition 1934; preface by C.G. Jung) presented Zen as a universal
              mystical experience transcending cultural boundaries. Later
              scholarship has emphasised that Suzuki&rsquo;s presentation was
              shaped by Japanese nationalism, Romanticism, and Protestant
              categories, and that Zen must also be understood in its full
              institutional, ritual, and ethical context (Sharf, &ldquo;The Zen
              of Japanese Nationalism,&rdquo; in <em>Curators of the
              Buddha</em>, ed. Lopez, 1995, pp. 107&ndash;160).
            </p>
            <p>
              The institutional transplantation of Zen to the West occurred
              through two parallel movements. In the United States, <Link className="detail-inline-link" href="/masters/shunryu-suzuki">Shunryū
              Suzuki</Link> (1904&ndash;1971) founded the San Francisco Zen Center in
              1962 and Tassajara Zen Mountain Center in 1967 &mdash; the first
              Sōtō Zen monastery outside Asia. His teaching, collected
              in <em>Zen Mind, Beginner&rsquo;s Mind</em> (1970), became one of
              the most widely read introductions to Zen practice in English
              (Chadwick, <em>Crooked Cucumber: The Life and Zen Teaching of
              Shunryu Suzuki</em>, 1999, pp. 247&ndash;265). In Europe,
              <Link className="detail-inline-link" href="/masters/taisen-deshimaru">Taisen Deshimaru</Link> (1914&ndash;1982), a dharma heir of <Link className="detail-inline-link" href="/masters/kodo-sawaki">Kōdō Sawaki</Link>,
              arrived in Paris in 1967 and established over a hundred dojos
              and the temple La Gendronnière, becoming the principal figure in
              the dissemination of Sōtō Zen across the European continent. His
              emphasis on <em>shikantaza</em> as the core of practice and his
              prolific teaching &mdash; recorded in works such as <em>The Zen
              Way to the Martial Arts</em> (1982) and <em>Sit: Zen Teachings of
              Master Taisen Deshimaru</em> (1996) &mdash; shaped a distinctly
              European Zen lineage that continues through the Association Zen
              Internationale and its successors (de Coulon, <em>Maître
              Deshimaru: Biographie</em>, 2009, pp. 135&ndash;180).
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
              Five major Chan lineages emerged during the late Tang and Five
              Dynasties period, of which two survived to the present day
              (Leighton, <em>Zen&rsquo;s Chinese Heritage</em>, 2000,
              pp. 3&ndash;7):
            </p>
          </div>
          <ul className="detail-link-list" style={{ marginTop: "0.75rem" }}>
            <li>
              <Link href="/schools/linji">Linji (Rinzai)</Link>
              <span className="detail-list-meta">
                Founded by <Link className="detail-inline-link" href="/masters/linji-yixuan">Línjì Yìxuán</Link> (d. 866). Emphasises kōan introspection
                and dynamic encounter dialogue. Transmitted to Japan by Eisai
                and later by Chinese émigrés during the Kamakura period.
              </span>
            </li>
            <li>
              <Link href="/schools/caodong">Caodong (Sōtō)</Link>
              <span className="detail-list-meta">
                Founded by <Link className="detail-inline-link" href="/masters/dongshan-liangjie">Dòngshān Liángjié</Link> (807&ndash;869) and <Link className="detail-inline-link" href="/masters/caoshan-benji">Cáoshān Běnjì</Link>
                {" "}(840&ndash;901). Known for &ldquo;silent illumination&rdquo;
                (<em>mòzhào</em>) and, in Japan, <em>shikantaza</em>.
                Transmitted to Japan by <Link className="detail-inline-link" href="/masters/dogen">Dōgen Zenji</Link> in 1227.
              </span>
            </li>
            <li>
              <Link href="/schools/obaku">Ōbaku</Link>
              <span className="detail-list-meta">
                Brought to Japan in 1654 by Yǐnyuán Lóngqí (Ingen Ryūki),
                blending Linji Chan with Pure Land elements. The smallest of
                the three extant Japanese Zen schools.
              </span>
            </li>
          </ul>
          <div className="detail-summary" style={{ marginTop: "0.75rem" }}>
            <p>
              The three extinct Tang-dynasty houses &mdash; Guiyang (潙仰),
              Yunmen (雲門), and Fayan (法眼) &mdash; were absorbed into the
              Linji lineage during the Song dynasty, though their distinctive
              teaching styles are preserved in the kōan literature.
            </p>
          </div>
        </section>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/masters/shunryu-suzuki.webp"
          alt="Shunryu Suzuki, who brought Soto Zen to America"
          className="about-section-image"
        />

        <section className="detail-card">
          <h3 className="detail-section-title">The Ensō</h3>
          <div className="detail-summary">
            <p>
              The image above is an <em>ensō</em> (円相), a circle drawn in a
              single brushstroke. It is one of the most recognisable symbols of
              Zen, expressing wholeness, the void (<em>śūnyatā</em>), and the
              beauty of imperfection. The practice of painting ensō belongs to
              the broader tradition of Zen calligraphy (<em>bokuseki</em>
              , &ldquo;ink traces&rdquo;), in which the spontaneous gesture of
              the brush is understood to reveal the state of mind of the
              practitioner at the moment of execution (Addiss, <em>The Art of
              Zen</em>, 1989, pp. 29&ndash;34).
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
                Addiss, Stephen. <em>The Art of Zen: Paintings and Calligraphy
                by Japanese Monks 1600&ndash;1925</em>. New York: Harry N.
                Abrams, 1989.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Aitken, Robert. <em>The Gateless Barrier: The Wu-Men Kuan
                (Mumonkan)</em>. San Francisco: North Point Press, 1991.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Broughton, Jeffrey L. <em>The Bodhidharma Anthology: The
                Earliest Records of Zen</em>. Berkeley: University of
                California Press, 1999.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Biography</span>
              </div>
              <p className="detail-source-excerpt">
                Chadwick, David. <em>Crooked Cucumber: The Life and Zen Teaching
                of Shunryu Suzuki</em>. New York: Broadway Books, 1999.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Cleary, Thomas, and J.C. Cleary, trans. <em>The Blue Cliff
                Record</em>. Boston: Shambhala, 1977.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Biography</span>
              </div>
              <p className="detail-source-excerpt">
                de Coulon, Jacques. <em>Maître Deshimaru: Biographie</em>.
                Paris: Éditions du Relié, 2009.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Dōgen Zenji. <em>Treasury of the True Dharma Eye: Zen Master
                Dōgen&rsquo;s Shōbōgenzō</em>. Edited by Kazuaki Tanahashi.
                Boston: Shambhala, 2010.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Dumoulin, Heinrich. <em>Zen Buddhism: A History. Vol. 1, India
                and China</em>. Translated by James W. Heisig and Paul Knitter.
                Bloomington: World Wisdom, 2005.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Dumoulin, Heinrich. <em>Zen Buddhism: A History. Vol. 2,
                Japan</em>. Translated by James W. Heisig and Paul Knitter.
                Bloomington: World Wisdom, 2005.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Faure, Bernard. <em>The Rhetoric of Immediacy: A Cultural
                Critique of Chan/Zen Buddhism</em>. Princeton: Princeton
                University Press, 1991.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Edited volume</span>
              </div>
              <p className="detail-source-excerpt">
                Gregory, Peter N., ed. <em>Sudden and Gradual: Approaches to
                Enlightenment in Chinese Thought</em>. Honolulu: University of
                Hawai&rsquo;i Press, 1987.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Chapter</span>
              </div>
              <p className="detail-source-excerpt">
                Mohr, Michel. &ldquo;Hakuin&rsquo;s Daruma: Negotiating Zen,
                Art and Iconography.&rdquo; In Steven Heine and Dale S. Wright,
                eds., <em>The Kōan: Texts and Contexts in Zen Buddhism</em>.
                Oxford: Oxford University Press, 2000, pp. 84&ndash;109.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Leighton, Taigen Dan. <em>Zen&rsquo;s Chinese Heritage: The
                Masters and Their Teachings</em>. Boston: Wisdom Publications,
                2000.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                McRae, John R. <em>Seeing Through Zen: Encounter,
                Transformation, and Genealogy in Chinese Chan Buddhism</em>.
                Berkeley: University of California Press, 2003.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Poceski, Mario. <em>Ordinary Mind as the Way: The Hongzhou
                School and the Growth of Chan Buddhism</em>. Oxford: Oxford
                University Press, 2007.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Red Pine (Bill Porter). <em>The Heart Sutra: The Womb of
                Buddhas</em>. Washington, DC: Shoemaker &amp; Hoard, 2004.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Chapter</span>
              </div>
              <p className="detail-source-excerpt">
                Sharf, Robert H. &ldquo;The Zen of Japanese
                Nationalism.&rdquo; In Donald S. Lopez Jr., ed., <em>Curators
                of the Buddha: The Study of Buddhism Under Colonialism</em>.
                Chicago: University of Chicago Press, 1995, pp. 107&ndash;160.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Suzuki, Shunryū. <em>Zen Mind, Beginner&rsquo;s Mind</em>.
                Edited by Trudy Dixon. New York: Weatherhill, 1970.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Monograph</span>
              </div>
              <p className="detail-source-excerpt">
                Welter, Albert. <em>The Linji Lu and the Creation of Chan
                Orthodoxy: The Development of Chan&rsquo;s Records of
                Sayings Literature</em>. Oxford: Oxford University Press, 2008.
              </p>
            </li>
            <li>
              <div className="detail-source-heading">
                <span>Translation</span>
              </div>
              <p className="detail-source-excerpt">
                Yampolsky, Philip B. <em>The Platform Sutra of the Sixth
                Patriarch</em>. New York: Columbia University Press, 1967.
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
