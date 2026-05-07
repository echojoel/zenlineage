import type { Metadata } from "next";
import TraditionLanding from "@/components/TraditionLanding";
import { abs } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Chan — Chinese tradition",
  description:
    "Chinese Chán (禪) — the meditation tradition that flowered in Tang and Song China and gave rise to Zen, Sŏn, and Thiền. The Five Houses, the Six Patriarchs, the encounter dialogues that founded everything that came after.",
  alternates: { canonical: abs("/chan") },
  openGraph: {
    title: "Chan — Chinese tradition · Zen Lineage",
    description:
      "Chinese Chán — the Tang and Song dynasty source of Zen, Sŏn, and Thiền.",
    url: abs("/chan"),
    type: "website",
  },
};

export default function ChanLandingPage() {
  return (
    <TraditionLanding
      traditionLabel="Chan"
      slug="chan"
      title="Chán"
      nativeTitle="禪"
      nativeLang="zh"
      eyebrow="Tradition · China"
      heroIntro={[
        "Chán (禪, from Sanskrit dhyāna — meditation) is the Chinese tradition out of which Zen, Sŏn, and Thiền all descend. It crystallised in the Tang dynasty around six legendary Chinese patriarchs from Bodhidharma to Huineng, then branched into the Five Houses of the Song dynasty: Linji, Caodong, Yunmen, Fayan, and Guiyang. The encounter dialogues, koan literature, and direct-pointing teaching style that define every later Zen tradition were forged here.",
        "The Sixth Patriarch Huineng's Platform Sūtra — the only sūtra composed in China and the closest thing the tradition has to a charter — fixes the southern Chan position: sudden awakening through seeing one's own nature, not the gradual cultivation of meditative absorption. From Huineng's two great heirs, Qingyuan Xingsi and Nanyue Huairang, the Five Houses emerge — and from them, in turn, every later Chan and Zen lineage.",
        "Chan persists in mainland China and Taiwan as the meditation strand of Mahāyāna Buddhism, often interwoven with Pure Land practice. The Linji and Caodong houses survive directly, and through their Japanese descendants (Rinzai, Sōtō) and Korean and Vietnamese counterparts (Sŏn, Thiền) Chan's influence on East Asian Buddhism is total.",
      ]}
      textsIntro="Chan canonises the prajñāpāramitā literature — the Heart Sūtra and the Diamond Sūtra — and treats Huineng's Platform Sūtra as a tradition-defining charter. The Lotus Sūtra is shared with the broader Mahāyāna; its Universal Gate chapter (普門品) is widely chanted."
      featuredSutraSlugs={["heart-sutra", "diamond-sutra", "platform-sutra", "lotus-sutra"]}
    />
  );
}
