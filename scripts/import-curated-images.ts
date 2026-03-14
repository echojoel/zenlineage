/**
 * Import curated images from the zazen mobile project.
 * These replace auto-fetched images with hand-picked, higher quality ones.
 *
 * Usage: npx tsx scripts/import-curated-images.ts
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { masters, schools, mediaAssets, citations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

const MASTERS_DIR = path.join(process.cwd(), "public", "masters");
const SCHOOLS_DIR = path.join(process.cwd(), "public", "schools");
const ZAZEN_DIR = "/Users/basket/workspace/zazen/mobile/assets/images";

interface CuratedImage {
  source: string;
  slug: string;
  entityType: "master" | "school";
  attribution: string;
  altText: string;
}

const IMAGES: CuratedImage[] = [
  {
    source: path.join(ZAZEN_DIR, "shakyamuni-buddha.jpg"),
    slug: "shakyamuni-buddha",
    entityType: "master",
    attribution: "Wikimedia Commons: Stone Buddha statue",
    altText: "Stone statue of Shakyamuni Buddha in meditation",
  },
  {
    source: path.join(ZAZEN_DIR, "mahakashyapa.jpg"),
    slug: "mahakashyapa",
    entityType: "master",
    attribution: "Wikimedia Commons: Kizil Caves mural of Mahakashyapa, carbon dated 422-529 CE",
    altText: "Kizil Caves mural depicting Mahakashyapa, 5th century CE",
  },
  {
    source: path.join(ZAZEN_DIR, "bodhidharma.jpg"),
    slug: "puti-damo",
    entityType: "master",
    attribution: "Wikimedia Commons: Bodhidharma by Yoshitoshi, 1887",
    altText: "Woodblock print of Bodhidharma in red robe by Yoshitoshi",
  },
  {
    source: path.join(ZAZEN_DIR, "huineng.jpg"),
    slug: "dajian-huineng",
    entityType: "master",
    attribution: "Wikimedia Commons: Statue of the Sixth Patriarch Huineng",
    altText: "Lacquered statue of the Sixth Patriarch Huineng",
  },
  {
    source: path.join(ZAZEN_DIR, "keizan-jokin.jpg"),
    slug: "keizan-jokin",
    entityType: "master",
    attribution: "Wikimedia Commons: Portrait scroll of Keizan Jōkin",
    altText: "Traditional portrait of Keizan Jōkin, co-founder of Japanese Soto Zen",
  },
  {
    source: "/Users/basket/Downloads/Taisen-Deshimaru-1-1.webp",
    slug: "taisen-deshimaru",
    entityType: "master",
    attribution: "Wikimedia Commons: Photograph of Taisen Deshimaru",
    altText: "Photograph of Taisen Deshimaru in Zen robes",
  },
  {
    source: "/Users/basket/Downloads/Michael_Hofmann,__Sawaki_Kodo_Roshi,__from_The_Zen_Teaching_of_Homeless_Kodo,_Wisdom_Publications_(2014).jpg",
    slug: "kodo-sawaki",
    entityType: "master",
    attribution: "Michael Hofmann, from The Zen Teaching of Homeless Kodo, Wisdom Publications (2014)",
    altText: "Ink drawing portrait of Kodo Sawaki Roshi",
  },
  {
    source: "/Users/basket/Downloads/Shunryu_Suzuki_by_Robert_Boni.jpg",
    slug: "shunryu-suzuki",
    entityType: "master",
    attribution: "Photograph by Robert Boni, Wikimedia Commons",
    altText: "Black and white photograph of Shunryu Suzuki Roshi",
  },
  {
    source: "/Users/basket/Downloads/indian_patriarchs.webp",
    slug: "indian-patriarchs",
    entityType: "school",
    attribution: "Gandhara relief, World History Encyclopedia",
    altText: "Gandhara stone relief depicting Buddhist monks and devotees",
  },
  {
    source: "/tmp/qingyuan-line.jpg",
    slug: "qingyuan-line",
    entityType: "school",
    attribution: "Wikimedia Commons: Jingju Temple (净居寺), Mount Qingyuan, Ji'an, Jiangxi, 2018",
    altText: "Aerial view of Jingju Temple on Mount Qingyuan, founded by Qingyuan Xingsi in 705 CE",
  },
  {
    source: "/tmp/yangqi-fanghui.jpg",
    slug: "yangqi-line",
    entityType: "school",
    attribution: "Wikimedia Commons: Traditional portrait of Yangqi Fanghui, public domain",
    altText: "Traditional ink portrait of Yangqi Fanghui, founder of the Yangqi branch of Linji Chan",
  },
  {
    source: "/tmp/patriarch-dhritaka.jpg",
    slug: "dhritaka",
    entityType: "master",
    attribution: "Wikimedia Commons: Tang Stone Statue of Buddhist Arhat, CC0",
    altText: "Tang dynasty stone statue of a Buddhist arhat",
  },
  {
    source: "/tmp/patriarch-michaka.jpg",
    slug: "michaka",
    entityType: "master",
    attribution: "Wikimedia Commons: Arhat, Ming dynasty, Honolulu Museum of Art, CC0",
    altText: "Ming dynasty wooden arhat statue, Honolulu Museum of Art",
  },
  {
    source: "/tmp/patriarch-punyayashas.jpg",
    slug: "punyayashas",
    entityType: "master",
    attribution: "Wikimedia Commons: Xixia Museum arhat, CC BY-SA 3.0",
    altText: "Arhat statue from the Xixia Museum",
  },
  {
    source: "/tmp/patriarch-parshva.jpg",
    slug: "parshva",
    entityType: "master",
    attribution: "Wikimedia Commons: Seated Arhat, China c. 1300-1450, Kimbell Art Museum, CC0",
    altText: "Cast iron seated arhat statue, Yuan-Ming dynasty, Kimbell Art Museum",
  },
  {
    source: "/tmp/patriarch-kapimala.jpg",
    slug: "kapimala",
    entityType: "master",
    attribution: "Wikimedia Commons: Painted Clay Arhat, CC BY-SA 4.0",
    altText: "Painted clay arhat statue",
  },
  {
    source: "/tmp/patriarch-gayashata.jpg",
    slug: "gayashata",
    entityType: "master",
    attribution: "Wikimedia Commons: Luohan Laundering, Lin Tinggui, 1178 AD, Public domain",
    altText: "Song dynasty painting of a luohan by Lin Tinggui, 1178",
  },
  {
    source: "/tmp/patriarch-rahulata.jpg",
    slug: "rahulata",
    entityType: "master",
    attribution: "Wikimedia Commons: Seated Arhat statue, Liebieghaus, Public domain",
    altText: "Seated arhat statue, Liebieghaus Museum",
  },
  {
    source: "/tmp/patriarch-sanghanandi.jpg",
    slug: "sanghanandi",
    entityType: "master",
    attribution: "Wikimedia Commons: Southern Song arhat with assistants, c. 1290, CC BY 3.0",
    altText: "Southern Song dynasty painting of an arhat with two assistants, c. 1290",
  },
  {
    source: "/tmp/patriarch-manorhita.jpg",
    slug: "manorhita",
    entityType: "master",
    attribution: "Wikimedia Commons: Arashiyama Arhat stone statue, CC BY-SA 4.0",
    altText: "Stone arhat statue at Arashiyama, Kyoto",
  },
  {
    source: "/tmp/patriarch-punyamitra.jpg",
    slug: "punyamitra",
    entityType: "master",
    attribution: "Wikimedia Commons: Arhat, 11th-12th c., National Museum of Korea, CC BY 2.0",
    altText: "Arhat statue, 11th-12th century, National Museum of Korea",
  },
  {
    source: "/tmp/patriarch-vasasita.jpg",
    slug: "vasasita",
    entityType: "master",
    attribution: "Wikimedia Commons: Gohyaku Rakan stone statues, CC BY-SA 3.0",
    altText: "Stone rakan (arhat) statue from a Japanese temple",
  },
  {
    source: "/Users/basket/Downloads/Sanavasa,_Tay_Phuong_pagoda,_Ha_Tay_province,_1794_AD,_lacquered_wood_-_Vietnam_National_Museum_of_Fine_Arts_-_Hanoi,_Vietnam_-_DSC05055.JPG",
    slug: "shanakavasa",
    entityType: "master",
    attribution: "Wikimedia Commons: Sanavasa statue, Tay Phuong pagoda, 1794 AD, Vietnam National Museum of Fine Arts",
    altText: "Lacquered wood statue of Shanakavasa from Tay Phuong pagoda, 1794",
  },
  {
    source: "/Users/basket/Downloads/Yves-Shoshin-Crettaz-1.jpg",
    slug: "yves-shoshin-crettaz",
    entityType: "master",
    attribution: "Photograph of Yves Shoshin Crettaz",
    altText: "Photograph of Yves Shoshin Crettaz",
  },
  {
    source: "/Users/basket/Desktop/Screenshot 2026-03-14 at 20.11.49.png",
    slug: "raphael-dokio-triet",
    entityType: "master",
    attribution: "Photograph of Raphael Dokio Triet",
    altText: "Photograph of Raphael Dokio Triet in Zen robes",
  },
  {
    source: "/Users/basket/Downloads/Roland_Yuno-Rech.png",
    slug: "roland-rech",
    entityType: "master",
    attribution: "Photograph of Roland Yuno Rech",
    altText: "Photograph of Roland Rech in Zen robes",
  },
];

async function main() {
  for (const img of IMAGES) {
    if (!fs.existsSync(img.source)) {
      console.log(`skip: ${img.slug} — source file not found: ${img.source}`);
      continue;
    }

    // Resolve entity ID
    let entityId: string;
    if (img.entityType === "master") {
      const row = (await db.select().from(masters).where(eq(masters.slug, img.slug)))[0];
      if (!row) { console.log(`skip: ${img.slug} — not in DB`); continue; }
      entityId = row.id;
    } else {
      const row = (await db.select().from(schools).where(eq(schools.slug, img.slug)))[0];
      if (!row) { console.log(`skip: ${img.slug} — not in DB`); continue; }
      entityId = row.id;
    }

    // Delete existing image + citation
    const existing = await db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.entityId, entityId), eq(mediaAssets.entityType, img.entityType)));

    for (const ma of existing) {
      await db.delete(citations).where(
        and(eq(citations.entityType, "media_asset"), eq(citations.entityId, ma.id))
      );
      await db.delete(mediaAssets).where(eq(mediaAssets.id, ma.id));
    }

    // Delete old file
    const dir = img.entityType === "master" ? MASTERS_DIR : SCHOOLS_DIR;
    const oldPath = path.join(dir, `${img.slug}.webp`);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    // Convert and save
    const outputPath = path.join(dir, `${img.slug}.webp`);
    const info = await sharp(img.source)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const mediaId = crypto.randomUUID();
    await db.insert(mediaAssets).values({
      id: mediaId,
      entityType: img.entityType,
      entityId,
      type: "image",
      storagePath: `/${img.entityType === "master" ? "masters" : "schools"}/${img.slug}.webp`,
      sourceUrl: null,
      license: "Public Domain / CC (Wikimedia)",
      attribution: img.attribution,
      altText: img.altText,
      width: info.width,
      height: info.height,
      createdAt: new Date().toISOString(),
    });

    await db.insert(citations).values({
      id: crypto.randomUUID(),
      entityType: "media_asset",
      entityId: mediaId,
      sourceId: "src_wikipedia",
      fieldName: "storage_path",
      excerpt: `Curated image: ${img.attribution}`,
      pageOrSection: "Wikimedia Commons (curated)",
    });

    console.log(`✓ ${img.slug} — ${info.width}x${info.height} — ${img.altText}`);
  }
}

main().catch(console.error);
