import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = "https://zenlineage.org";
const SITE_DESCRIPTION =
  "An interactive encyclopedia of Zen Buddhism — lineage explorer, masters, schools, and teachings across 2,500 years of Chan/Zen history.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zen Lineage",
    template: "%s — Zen Lineage",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Zen Lineage",
    title: "Zen Lineage",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "Zen Lineage",
    description: "An interactive encyclopedia of Zen Buddhism.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
