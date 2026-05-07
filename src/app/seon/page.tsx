import type { Metadata } from "next";
import TraditionLanding from "@/components/TraditionLanding";
import { abs } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Sŏn — Korean tradition",
  description:
    "Korean Sŏn (선) — the Korean continuation of Chan, with its hwadu kanhwa-Sŏn investigation, the Jogye Order, the dual cultivation of Sŏn and the doctrinal study of Hwaŏm. Lineage from Toŭi through Chinul, Taego, Hyujeong, Seongcheol, and Seung Sahn.",
  alternates: { canonical: abs("/seon") },
  openGraph: {
    title: "Sŏn — Korean tradition · Zen Lineage",
    description:
      "Korean Sŏn — kanhwa-Sŏn hwadu investigation, the Jogye Order, and the lineage from Chinul to Seongcheol.",
    url: abs("/seon"),
    type: "website",
  },
};

export default function SeonLandingPage() {
  return (
    <TraditionLanding
      traditionLabel="Seon"
      slug="seon"
      title="Sŏn"
      nativeTitle="선 · 禪"
      nativeLang="ko"
      eyebrow="Tradition · Korea"
      heroIntro={[
        "Sŏn (선, hanja 禪) is the Korean continuation of Chan. It arrived from Tang China through the Nine Mountain Schools (九山禪門) of the late Silla period — Toŭi's Kajisan, Hyech'ol's Tongnisan, and seven others established between the eighth and ninth centuries. By the Goryeo dynasty Sŏn had absorbed the doctrinal Hwaŏm tradition into a single integrated practice, articulated in Pojo Chinul's twelfth-century synthesis: sudden awakening, gradual cultivation; the dual study of Sŏn meditation and Hwaŏm philosophy.",
        "The Korean signature practice is hwadu (話頭) — a tightly compressed kōan phrase, often a single word like 'mu' or 'what is this?', held continuously through every activity until the great doubt resolves. This kanhwa-Sŏn method, formalised by Hyesim and Taego in the thirteenth and fourteenth centuries and revived by Seosan Hyujeong after the Imjin War, remains the heart of Jogye Order training today.",
        "Modern Korean Sŏn is centred on the Jogye Order — the unified school established in 1962 — with the Taego Order representing a married-clergy alternative. Twentieth-century masters Seongcheol (1912–1993) and Seung Sahn (1927–2004) reshaped the tradition: Seongcheol re-establishing the strict Goryeo-era forest hermitage discipline, Seung Sahn carrying Sŏn to the West through the Kwan Um School.",
      ]}
      textsIntro="Korean Sŏn shares the Chan canon — the Heart, Diamond, and Platform sūtras. Chinul's Susimkyŏl (Secrets on Cultivating the Mind, 1209) and Seosan's Sŏn'ga kwigam (Mirror of Sŏn, 1564) sit alongside as the two great Korean instructional texts. The Lotus Sūtra is shared with the broader Mahāyāna."
      featuredSutraSlugs={["heart-sutra", "diamond-sutra", "platform-sutra", "lotus-sutra"]}
    />
  );
}
