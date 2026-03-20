import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lineage",
  description:
    "Interactive visualization of Zen Buddhist lineage transmissions — explore how dharma was passed from teacher to student across 2,500 years of Chan/Zen history.",
  alternates: { canonical: "https://zenlineage.org/lineage" },
  openGraph: {
    title: "Zen Lineage Graph — Zen Lineage",
    description:
      "Interactive visualization of dharma transmission lineages across 435+ Zen Buddhist masters.",
    url: "https://zenlineage.org/lineage",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Zen Lineage Graph — Zen Lineage",
    description: "Interactive visualization of Zen dharma transmission lineages.",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://zenlineage.org" },
    { "@type": "ListItem", position: 2, name: "Lineage", item: "https://zenlineage.org/lineage" },
  ],
};

export default function LineageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
