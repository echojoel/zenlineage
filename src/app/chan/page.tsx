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
        "Chán (禪, from Sanskrit dhyāna — meditation) is the Chinese tradition out of which Zen, Sŏn, and Thiền developed. It crystallised during the Tang dynasty around the traditional line of six Chinese patriarchs from Bodhidharma to Huineng. The Five Houses — Linji, Caodong, Yunmen, Fayan, and Guiyang — took shape in the late Tang and Five Dynasties periods. Encounter dialogues, kōan literature, and direct-pointing teaching became hallmarks of Chan and many later Zen traditions.",
        "The Platform Sūtra, traditionally attributed to the Sixth Patriarch Huineng, is a Chinese Chan text that became a charter for the tradition. It presents awakening through seeing one's own nature as central to southern Chan. The later Five Houses trace their lineages through Huineng's disciples Qingyuan Xingsi and Nanyue Huairang.",
        "Chan persists in mainland China and Taiwan as the meditation strand of Mahāyāna Buddhism, often interwoven with Pure Land practice. The Linji and Caodong houses survive directly, and through their Japanese descendants (Rinzai, Sōtō) and Korean and Vietnamese counterparts (Sŏn, Thiền) Chan's influence on East Asian Buddhism is total.",
      ]}
      textsIntro="Chan canonises the prajñāpāramitā literature — the Heart Sūtra and the Diamond Sūtra — and treats Huineng's Platform Sūtra as a tradition-defining charter. The Lotus Sūtra is shared with the broader Mahāyāna; its Universal Gate chapter (普門品) is widely chanted."
      featuredSutraSlugs={["heart-sutra", "diamond-sutra", "platform-sutra", "lotus-sutra"]}
    />
  );
}
