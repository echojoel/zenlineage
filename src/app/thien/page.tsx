import type { Metadata } from "next";
import TraditionLanding from "@/components/TraditionLanding";
import { abs } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Thiền — Vietnamese tradition",
  description:
    "Vietnamese Thiền (禪) — the Vietnamese continuation of Chan, from the Tỳ-ni-đa-lưu-chi line of the sixth century through Trúc Lâm and Lâm Tế to Plum Village and Thích Nhất Hạnh's engaged Buddhism in the modern era.",
  alternates: { canonical: abs("/thien") },
  openGraph: {
    title: "Thiền — Vietnamese tradition · Zen Lineage",
    description:
      "Vietnamese Thiền — from the sixth-century Vinītaruci line through Trúc Lâm to Plum Village.",
    url: abs("/thien"),
    type: "website",
  },
};

export default function ThienLandingPage() {
  return (
    <TraditionLanding
      traditionLabel="Thiền"
      slug="thien"
      title="Thiền"
      nativeTitle="禪 · Thiền"
      nativeLang="vi"
      eyebrow="Tradition · Vietnam"
      heroIntro={[
        "Thiền (禪) is the Vietnamese continuation of Chan, transmitted earlier than to either Korea or Japan. The first Thiền lineage, founded by the Indian monk Tỳ-ni-đa-lưu-chi (Vinītaruci) in 580 CE, reached Vietnam from Bodhidharma's third Chinese patriarch Sengcan and persisted for nearly two centuries. A second line, the Vô Ngôn Thông school, was brought from China around 820 CE; a third, the Thảo Đường, arrived in the eleventh century.",
        "The defining moment of Vietnamese Thiền is the founding of the Trúc Lâm (Bamboo Grove) school in 1299 by King Trần Nhân Tông, who abdicated his throne to ordain. Trần Nhân Tông, his successor Pháp Loa, and the third patriarch Huyền Quang produced a self-consciously Vietnamese synthesis — Trúc Lâm became the state Buddhism of the Trần dynasty and shaped Vietnamese religious culture for centuries.",
        "Modern Vietnamese Thiền is dominated by two figures: Thích Thanh Từ, who revived Trúc Lâm Sŏn at Trúc Lâm Đà Lạt in the 1960s and re-established the lineage's discipline, and Thích Nhất Hạnh, whose Plum Village community in southern France has carried Thiền to the global sangha as 'engaged Buddhism' — practice that holds meditation and social compassion as a single thing.",
      ]}
      textsIntro="Thiền shares the Chan canon — Heart, Diamond, Platform — and adds two Vietnamese-specific instructional traditions: the recorded sayings of the Trúc Lâm patriarchs (13th–14th c.) and Thích Nhất Hạnh's modern teaching corpus. The Lotus Sūtra is central to Plum Village daily liturgy."
      featuredSutraSlugs={["heart-sutra", "diamond-sutra", "platform-sutra", "lotus-sutra"]}
    />
  );
}
