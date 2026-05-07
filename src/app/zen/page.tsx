import type { Metadata } from "next";
import TraditionLanding from "@/components/TraditionLanding";
import { abs } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Zen — Japanese tradition",
  description:
    "Japanese Zen — Sōtō, Rinzai, Ōbaku, Sanbō-Zen, the White Plum Asanga, and the Western lineages descended from them. Lineage graph, schools, masters, and the sūtras chanted in Japanese halls.",
  alternates: { canonical: abs("/zen") },
  openGraph: {
    title: "Zen — Japanese tradition · Zen Lineage",
    description:
      "Japanese Zen — Sōtō, Rinzai, Ōbaku, and the Western lineages descended from them.",
    url: abs("/zen"),
    type: "website",
  },
};

export default function ZenLandingPage() {
  return (
    <TraditionLanding
      traditionLabel="Zen"
      slug="zen"
      title="Zen"
      nativeTitle="禅"
      nativeLang="ja"
      eyebrow="Tradition · Japan"
      heroIntro={[
        "Zen (禅) is the Japanese flowering of Chan, the Chinese meditation tradition that arrived in Japan in the late twelfth century with Eisai (Rinzai) and the early thirteenth century with Dōgen (Sōtō). What had been a Tang-dynasty Chinese movement of forest hermitages and monastic encounter dialogues became, in Japan, a tradition deeply integrated with court culture, samurai patronage, the tea ceremony, ink painting, and the great training monasteries of Kyoto, Eihei-ji, and Sōji-ji.",
        "Two schools dominate: Sōtō, with its emphasis on shikantaza — just sitting — as the direct expression of awakening; and Rinzai, with its kōan curriculum from the Mumonkan and Hekiganroku and its lineage of fierce teachers from Hakuin onward. A third, smaller stream, Ōbaku, was transmitted from Ming-dynasty China by Ingen in the seventeenth century and preserves a more Pure-Land-inflected style.",
        "Most Western Zen — Shunryū Suzuki's San Francisco Zen Center, Taisen Deshimaru's Association Zen Internationale, the White Plum Asanga descended from Maezumi, the Sanbō-Zen synthesis of Yasutani and Yamada — descends from these Japanese houses. Today the practice is global: every continent, dozens of languages.",
      ]}
      textsIntro="Japanese Zen halls chant the Heart Sūtra (Hannya Shingyō) daily and the Kannon-gyō (Universal Gate of the Lotus) regularly. The Diamond Sūtra is studied; the Platform Sūtra is the closest thing the tradition has to a sectarian charter."
      featuredSutraSlugs={["heart-sutra", "diamond-sutra", "platform-sutra", "lotus-sutra"]}
    />
  );
}
