/**
 * Fetch Wikipedia pageimages for temples & training centres.
 *
 * Mirrors the pattern of scripts/fetch-kv-images.ts but is keyed by
 * temple slug. Source URL is the Wikipedia article in each case; the
 * underlying image is hosted on Wikimedia Commons under its own
 * licence (typically CC BY-SA / public-domain). One canonical
 * Commons URL per temple is hard-coded below after manual research.
 *
 * Idempotent — skips any temple that already has a committed .webp
 * under public/temples/ AND a media_assets row already pointing at
 * that file (the row is re-stamped each run so attribution stays
 * fresh).
 *
 * Usage:
 *   DATABASE_URL=file:zen.db npx tsx scripts/fetch-temple-images.ts
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fetch } from "undici";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { citations, temples, mediaAssets } from "@/db/schema";

const PUBLIC_TEMPLES_DIR = path.join(process.cwd(), "public", "temples");
const UA =
  "ZenEncyclopediaBot/1.0 (https://github.com/echojoel/zenlineage; educational project)";

interface TempleImage {
  /** Wikipedia article title (English). */
  title: string;
  /** Wikipedia article URL — used as the source citation. */
  article: string;
  /** Direct upload.wikimedia.org image URL. */
  imageUrl: string;
  /** One-sentence description for alt text and the popup caption. */
  alt: string;
}

const TARGETS: Record<string, TempleImage> = {
  // ─── Japan: Sōtō head temples & training houses ──────────────────────
  "eihei-ji": {
    title: "Eihei-ji",
    article: "https://en.wikipedia.org/wiki/Eihei-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Eiheiji08bs3200.jpg/960px-Eiheiji08bs3200.jpg",
    alt: "Eihei-ji — the Sōtō head temple founded by Dōgen in 1244 (Fukui).",
  },
  "soji-ji": {
    title: "Sōji-ji",
    article: "https://en.wikipedia.org/wiki/S%C5%8Dji-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/S%C5%8Djiji_Sanshokaku_2009.jpg/960px-S%C5%8Djiji_Sanshokaku_2009.jpg",
    alt: "Sōji-ji — the co-head temple of Sōtō (Yokohama).",
  },
  antaiji: {
    title: "Antai-ji",
    article: "https://en.wikipedia.org/wiki/Antai-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/53/Antaiji.jpg",
    alt: "Antai-ji — the small Sōtō training monastery in Hyōgo associated with Sawaki, Uchiyama, and Muhō Nölke.",
  },
  "buttsu-ji": {
    title: "Buttsū-ji",
    article: "https://en.wikipedia.org/wiki/Butts%C5%AB-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Butsuji_Butsuden.jpg/960px-Butsuji_Butsuden.jpg",
    alt: "Buttsū-ji — Rinzai training monastery in Hiroshima (Buttsū-ji-ha).",
  },
  "kokeizan-eiho-ji": {
    title: "Eihō-ji",
    article: "https://en.wikipedia.org/wiki/Eih%C5%8D-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Kokeizan-teien.jpg",
    alt: "Eihō-ji at Kokei-zan, Tajimi — Rinzai temple with a notable Musō Soseki garden.",
  },
  "gokokuzan-sogenji": {
    title: "Sōgen-ji",
    article: "https://en.wikipedia.org/wiki/S%C5%8Dgen-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Sogenji_Stone_Gate.jpg/960px-Sogenji_Stone_Gate.jpg",
    alt: "Sōgen-ji — Rinzai training temple in Okayama led by Shōdō Harada Rōshi.",
  },
  "shofuku-ji": {
    title: "Shōfuku-ji (Fukuoka)",
    article: "https://en.wikipedia.org/wiki/Sh%C5%8Dfuku-ji_(Fukuoka)",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Shoufukuji01.jpg/960px-Shoufukuji01.jpg",
    alt: "Shōfuku-ji in Fukuoka — the earliest Rinzai temple in Japan, founded by Eisai in 1195.",
  },
  "kogaku-ji": {
    title: "Kōgaku-ji",
    article: "https://en.wikipedia.org/wiki/K%C5%8Dgaku-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Kogakuji_temple.JPG/960px-Kogakuji_temple.JPG",
    alt: "Kōgaku-ji — Rinzai training monastery in Yamanashi (Bassui Tokushō's seat).",
  },
  "kokutai-ji": {
    title: "Kokutai-ji",
    article: "https://en.wikipedia.org/wiki/Kokutai-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Kokutai-ji_2.jpg/960px-Kokutai-ji_2.jpg",
    alt: "Kokutai-ji — Rinzai training monastery in Toyama Prefecture.",
  },
  "kakuozan-nittai-ji": {
    title: "Nittai-ji",
    article: "https://en.wikipedia.org/wiki/Nittai-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Nittaiji.jpg/960px-Nittaiji.jpg",
    alt: "Nittai-ji — Nagoya temple housing Japan's official enshrinement of Buddha relics gifted by Siam in 1900.",
  },
  "daihonzan-eihei-ji-betsuin-chokoku-ji": {
    title: "Chōkoku-ji",
    article: "https://en.wikipedia.org/wiki/Ch%C5%8Dkoku-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Ch%C5%8Dkoku-ji%2C_Gunma.JPG/960px-Ch%C5%8Dkoku-ji%2C_Gunma.JPG",
    alt: "Chōkoku-ji — Sōtō branch of Eihei-ji in Tokyo / Gunma.",
  },

  // ─── Japan: Rinzai head temples (Kyoto Gozan + Kamakura) ─────────────
  "daitoku-ji": {
    title: "Daitoku-ji",
    article: "https://en.wikipedia.org/wiki/Daitoku-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/090228_Daitoku-ji_Kyoto_Japan03s5.jpg/960px-090228_Daitoku-ji_Kyoto_Japan03s5.jpg",
    alt: "Daitoku-ji — the Kyoto Rinzai temple complex of Ikkyū, Sen no Rikyū, and twenty-three sub-temples.",
  },
  "nanzen-ji": {
    title: "Nanzen-ji",
    article: "https://en.wikipedia.org/wiki/Nanzen-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/251213_Nanzen-ji_Kyoto_Japan01s3.jpg/960px-251213_Nanzen-ji_Kyoto_Japan01s3.jpg",
    alt: "Nanzen-ji — Kyoto Rinzai head temple ranking above the Five Mountains.",
  },
  "kennin-ji": {
    title: "Kennin-ji",
    article: "https://en.wikipedia.org/wiki/Kennin-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/150124_Kenninji_Kyoto_Japan01s3.jpg/960px-150124_Kenninji_Kyoto_Japan01s3.jpg",
    alt: "Kennin-ji — the oldest Zen temple in Kyoto, founded by Eisai in 1202.",
  },
  "tofuku-ji": {
    title: "Tōfuku-ji",
    article: "https://en.wikipedia.org/wiki/T%C5%8Dfuku-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/TofukujiHondo.jpg/960px-TofukujiHondo.jpg",
    alt: "Tōfuku-ji — Kyoto Rinzai head temple founded 1236, famous for its autumn maples and modern Shigemori gardens.",
  },
  "tenryu-ji": {
    title: "Tenryū-ji",
    article: "https://en.wikipedia.org/wiki/Tenryu-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Tenryuji_Kyoto.jpg/960px-Tenryuji_Kyoto.jpg",
    alt: "Tenryū-ji — Rinzai head temple at Arashiyama with Musō Soseki's pond-and-stroll garden (UNESCO).",
  },
  "engaku-ji": {
    title: "Engaku-ji",
    article: "https://en.wikipedia.org/wiki/Engaku-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Stairs_to_Sanmon%2C_Engaku-ji.jpg/960px-Stairs_to_Sanmon%2C_Engaku-ji.jpg",
    alt: "Engaku-ji — Kamakura Five Mountains temple founded 1282, training seat of Shaku Sōen and the early Western lay sangha.",
  },
  "kencho-ji": {
    title: "Kenchō-ji",
    article: "https://en.wikipedia.org/wiki/Kencho-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Kenchoji_Sanmon_2009.jpg/960px-Kenchoji_Sanmon_2009.jpg",
    alt: "Kenchō-ji — the highest-ranked of the Kamakura Five Mountains, founded 1253.",
  },
  "shokoku-ji": {
    title: "Shōkoku-ji",
    article: "https://en.wikipedia.org/wiki/Shokoku-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/150815_Shokokuji_Kyoto_Japan02s3.jpg/960px-150815_Shokokuji_Kyoto_Japan02s3.jpg",
    alt: "Shōkoku-ji — Kyoto Rinzai head temple founded by Ashikaga Yoshimitsu in 1382.",
  },

  // ─── Japan: Ōbaku ────────────────────────────────────────────────────
  "manpuku-ji": {
    title: "Manpuku-ji",
    article: "https://en.wikipedia.org/wiki/Manpuku-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/260117_Manpuku-ji_Uji_Kyoto_pref_Japan01s3.jpg/960px-260117_Manpuku-ji_Uji_Kyoto_pref_Japan01s3.jpg",
    alt: "Manpuku-ji — the Ōbaku head temple at Uji, founded by the Chinese Chan master Yinyuan Longqi in 1661.",
  },
  "ryutaku-ji": {
    title: "Ryūtaku-ji",
    article: "https://en.wikipedia.org/wiki/Ryutaku-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/%E9%BE%8D%E6%BE%A4%E5%AF%BA.jpg/960px-%E9%BE%8D%E6%BE%A4%E5%AF%BA.jpg",
    alt: "Ryūtaku-ji — Hakuin's Mishima temple, later led by Yamamoto Gempō and Nakagawa Sōen.",
  },

  // ─── China: Chan temples ─────────────────────────────────────────────
  "shaolin-temple": {
    title: "Shaolin Monastery",
    article: "https://en.wikipedia.org/wiki/Shaolin_Monastery",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Shaolin_Temple_%2810199450903%29.jpg/960px-Shaolin_Temple_%2810199450903%29.jpg",
    alt: "Shaolin Monastery — the Songshan temple traditionally associated with Bodhidharma.",
  },
  "tiantong-temple": {
    title: "Tiantong Temple",
    article: "https://en.wikipedia.org/wiki/Tiantong_Temple",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Swiatynia_Tiantong_-_Ningbo.jpg/960px-Swiatynia_Tiantong_-_Ningbo.jpg",
    alt: "Tiantong-si on Mt. Taibai near Ningbo — Caodong stronghold where Dōgen trained under Rujing.",
  },
  "lingyin-temple": {
    title: "Lingyin Temple",
    article: "https://en.wikipedia.org/wiki/Lingyin_Temple",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Lingyin_Temple%2C_Hangzhou_20161003.jpg/960px-Lingyin_Temple%2C_Hangzhou_20161003.jpg",
    alt: "Lingyin-si in Hangzhou — major Chan monastery founded 328 CE, set against the Feilai Feng grottoes.",
  },
  "jingci-temple": {
    title: "Jingci Temple",
    article: "https://en.wikipedia.org/wiki/Jingci_Temple",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/%E5%87%80%E6%85%88%E5%AF%BA.jpg/960px-%E5%87%80%E6%85%88%E5%AF%BA.jpg",
    alt: "Jingci-si at West Lake, Hangzhou — Song-period seat of Yongming Yanshou and the Pure-Land / Chan synthesis.",
  },
  "guoqing-temple": {
    title: "Guoqing Temple",
    article: "https://en.wikipedia.org/wiki/Guoqing_Temple",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Guoqing_Temple%2C_2014-12-27_23.JPG/960px-Guoqing_Temple%2C_2014-12-27_23.JPG",
    alt: "Guoqing-si on Mt. Tiantai — birthplace of the Tiantai school and an early site of Korean / Japanese pilgrimage.",
  },
  "nanhua-temple": {
    title: "Nanhua Temple",
    article: "https://en.wikipedia.org/wiki/Nanhua_Temple",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Nanhua_Temple_gate.JPG/960px-Nanhua_Temple_gate.JPG",
    alt: "Nanhua-si at Caoxi — seat of Huineng, the Sixth Patriarch, whose mummified body is enshrined here.",
  },

  // ─── Korea: Seon temples ─────────────────────────────────────────────
  "songgwang-sa": {
    title: "Songgwang-sa",
    article: "https://en.wikipedia.org/wiki/Songgwang-sa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Korea-Songgwangsa-02.jpg/960px-Korea-Songgwangsa-02.jpg",
    alt: "Songgwang-sa — Jinul's training centre, one of the Three Jewel Temples of Korean Buddhism (Saṅgha jewel).",
  },
  "haein-sa": {
    title: "Haein-sa",
    article: "https://en.wikipedia.org/wiki/Haein-sa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/%ED%95%9C%EA%B5%AD_%EB%AC%B8%ED%99%94_%EC%97%AC%ED%96%89_%EC%9D%8C%EC%8B%9D_%ED%95%B4%EC%9D%B8%EC%82%AC003.jpg/960px-%ED%95%9C%EA%B5%AD_%EB%AC%B8%ED%99%94_%EC%97%AC%ED%96%89_%EC%9D%8C%EC%8B%9D_%ED%95%B4%EC%9D%B8%EC%82%AC003.jpg",
    alt: "Haein-sa — Three Jewel Temple (Dharma jewel) housing the 81,350-block Tripiṭaka Koreana since 1398.",
  },
  "tongdo-sa": {
    title: "Tongdo-sa",
    article: "https://en.wikipedia.org/wiki/Tongdo-sa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Korea-Tongdosa-01.jpg/960px-Korea-Tongdosa-01.jpg",
    alt: "Tongdo-sa — Three Jewel Temple (Buddha jewel); the 'temple without a Buddha image' founded in 646.",
  },
  "bulguk-sa": {
    title: "Bulguk-sa",
    article: "https://en.wikipedia.org/wiki/Bulguk-sa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Lotus_Flower_Bridge_and_Seven_Treasure_Bridge_at_Bulguksa_in_Gyeongju%2C_Korea.jpg/960px-Lotus_Flower_Bridge_and_Seven_Treasure_Bridge_at_Bulguksa_in_Gyeongju%2C_Korea.jpg",
    alt: "Bulguk-sa in Gyeongju — UNESCO-listed Silla masterpiece with the Seokga-tap and Dabo-tap stone pagodas.",
  },
  "magok-sa": {
    title: "Magoksa",
    article: "https://en.wikipedia.org/wiki/Magok-sa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Magoksa.JPG/960px-Magoksa.JPG",
    alt: "Magok-sa in Chungcheongnam-do — Jogye Order temple noted for its five-storey stone pagoda.",
  },
  "sudeok-sa": {
    title: "Sudeoksa",
    article: "https://en.wikipedia.org/wiki/Sudeoksa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Sudeoksa_01.JPG/960px-Sudeoksa_01.JPG",
    alt: "Sudeok-sa — home of South Korea's oldest wooden building, the 1308 Daeungjeon Hall.",
  },
  "jogye-sa-seoul": {
    title: "Jogyesa",
    article: "https://en.wikipedia.org/wiki/Jogye-sa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Jogyesa_Temple_%281509839597%29.jpg/960px-Jogyesa_Temple_%281509839597%29.jpg",
    alt: "Jogye-sa in central Seoul — chief temple of the Jogye Order and the visible face of contemporary Korean Seon.",
  },
  "beopju-sa": {
    title: "Beopjusa",
    article: "https://en.wikipedia.org/wiki/Beopjusa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Beopjusa_temple_grounds.jpg/960px-Beopjusa_temple_grounds.jpg",
    alt: "Beopju-sa on Songnisan — home to Palsangjeon, Korea's only surviving five-storey wooden pagoda.",
  },
  "woljeong-sa": {
    title: "Woljeongsa",
    article: "https://en.wikipedia.org/wiki/Woljeongsa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/%EC%9B%94%EC%A0%95%EC%82%AC1.jpg/960px-%EC%9B%94%EC%A0%95%EC%82%AC1.jpg",
    alt: "Woljeong-sa on Odaesan — Goryeo Jogye temple with a 12th-century octagonal stone pagoda.",
  },
  "jeondeung-sa": {
    title: "Jeondeungsa",
    article: "https://en.wikipedia.org/wiki/Jeondeungsa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Ganghwado_Jeondeungsa_Temple_20200718_039.jpg/960px-Ganghwado_Jeondeungsa_Temple_20200718_039.jpg",
    alt: "Jeondeung-sa on Ganghwa Island — reputedly the oldest extant temple on the peninsula, founded in 381.",
  },
  "buseok-sa": {
    title: "Buseoksa",
    article: "https://en.wikipedia.org/wiki/Buseoksa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/%EB%B6%80%EC%84%9D%EC%82%AC_%EB%AC%B4%EB%9F%89%EC%88%98%EC%A0%84.jpg/960px-%EB%B6%80%EC%84%9D%EC%82%AC_%EB%AC%B4%EB%9F%89%EC%88%98%EC%A0%84.jpg",
    alt: "Buseok-sa — home of Muryangsujeon, South Korea's second-oldest wooden building (1376 reconstruction).",
  },
  "daeheung-sa": {
    title: "Daeheungsa",
    article: "https://en.wikipedia.org/wiki/Daeheung-sa",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Daeheungsa_11-03878.JPG/960px-Daeheungsa_11-03878.JPG",
    alt: "Daeheung-sa on Duryunsan — historic Jeolla Jogye temple set in old-growth forest.",
  },

  // ─── Vietnam: Thiền & cultural temples ───────────────────────────────
  "thien-vien-truc-lam-yen-tu": {
    title: "Yên Tử",
    article: "https://en.wikipedia.org/wiki/Y%C3%AAn_T%E1%BB%AD",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/N%C3%BAi_Y%C3%AAn_T%E1%BB%AD.jpg/960px-N%C3%BAi_Y%C3%AAn_T%E1%BB%AD.jpg",
    alt: "Mt. Yên Tử — the mountain monastic complex that anchors the Trúc Lâm Thiền lineage of King Trần Nhân Tông.",
  },
  "chua-thien-mu": {
    title: "Thiên Mụ Temple",
    article: "https://en.wikipedia.org/wiki/Thi%C3%AAn_M%E1%BB%A5_Temple",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/ThienMuPagoda.jpg/960px-ThienMuPagoda.jpg",
    alt: "Chùa Thiên Mụ in Huế — the seven-storey octagonal Phước Duyên pagoda that has become the symbol of Vietnamese Buddhism.",
  },

  // ─── Western Zen centres ─────────────────────────────────────────────
  "green-gulch-farm": {
    title: "Green Gulch Farm Zen Center",
    article: "https://en.wikipedia.org/wiki/Green_Gulch_Farm_Zen_Center",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Green_Gulch_Farm_zendo_%28or%2C_Green_Dragon_Temple%29.jpg/960px-Green_Gulch_Farm_zendo_%28or%2C_Green_Dragon_Temple%29.jpg",
    alt: "Green Dragon Temple at Green Gulch Farm — SFZC's Marin residential practice centre.",
  },
  "great-vow-zen-monastery-daiganzenji": {
    title: "Great Vow Zen Monastery",
    article: "https://en.wikipedia.org/wiki/Great_Vow_Zen_Monastery",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Great_Vow_Zen_Monastery.jpg/960px-Great_Vow_Zen_Monastery.jpg",
    alt: "Great Vow Zen Monastery (Daigan-ji), Clatskanie, Oregon — White Plum residential monastery led by Jan Chozen Bays.",
  },
  "minnesota-zen-meditation-center-ganshoji": {
    title: "Minnesota Zen Meditation Center",
    article: "https://en.wikipedia.org/wiki/Minnesota_Zen_Meditation_Center",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/MN_Zen_Center-20121115.jpg/960px-MN_Zen_Center-20121115.jpg",
    alt: "Minnesota Zen Meditation Center (Ganshō-ji), Minneapolis — Dainin Katagiri's centre, the senior SFZC-line satellite in the Midwest.",
  },
  "zen-mountain-monastery": {
    title: "Zen Mountain Monastery",
    article: "https://en.wikipedia.org/wiki/Zen_Mountain_Monastery",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Zen_Mountain_Monastery2.jpg/960px-Zen_Mountain_Monastery2.jpg",
    alt: "Zen Mountain Monastery, Mt. Tremper, NY — White Plum centre founded by John Daido Loori (Mountains and Rivers Order).",
  },
  "zen-center-of-los-angeles": {
    title: "Zen Center of Los Angeles",
    article: "https://en.wikipedia.org/wiki/Zen_Center_of_Los_Angeles",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Zen_Center_of_Los_Angeles.jpg/960px-Zen_Center_of_Los_Angeles.jpg",
    alt: "Zen Center of Los Angeles — Taizan Maezumi Rōshi's founding seat of the White Plum Asanga (1967).",
  },
  "rochester-zen-center": {
    title: "Rochester Zen Center",
    article: "https://en.wikipedia.org/wiki/Rochester_Zen_Center",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Rochester_zen_center_front_entrance.jpg/960px-Rochester_zen_center_front_entrance.jpg",
    alt: "Rochester Zen Center — Philip Kapleau Rōshi's foundation (1966) and the seat of the Three Pillars of Zen line.",
  },
  "mt-baldy-zen-center": {
    title: "Mount Baldy Zen Center",
    article: "https://en.wikipedia.org/wiki/Mount_Baldy_Zen_Center",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d9/Mount_Baldy_Zen_Center_Mounatin_View.jpg",
    alt: "Mt. Baldy Zen Center, San Gabriel Mountains — Jōshū Sasaki Rōshi's Rinzai training monastery; Leonard Cohen practised here.",
  },
  "dai-bosatsu-zendo-kongo-ji": {
    title: "Dai Bosatsu Zendo Kongo-ji",
    article: "https://en.wikipedia.org/wiki/Dai_Bosatsu_Zendo_Kongo-ji",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Dai_Bosatsu_Zendo_Kongo-Ji.jpg/960px-Dai_Bosatsu_Zendo_Kongo-Ji.jpg",
    alt: "Dai Bosatsu Zendo Kongō-ji, Catskills, NY — the Zen Studies Society's Rinzai monastery in the Nakagawa Sōen line.",
  },
  "upaya-zen-center": {
    title: "Upaya Zen Center",
    article: "https://en.wikipedia.org/wiki/Upaya_Institute_and_Zen_Center",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e0/Upaya_Zen_Center_3.jpg",
    alt: "Upaya Zen Center, Santa Fe — Joan Halifax Rōshi's chaplaincy-training centre in the White Plum line.",
  },
  "shasta-abbey": {
    title: "Shasta Abbey",
    article: "https://en.wikipedia.org/wiki/Shasta_Abbey",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/22/ShastaAbbeyStupa.jpg",
    alt: "Shasta Abbey, Mt. Shasta, California — Jiyu-Kennett's foundational OBC training monastery (1970).",
  },
  "throssel-hole-abbey": {
    title: "Throssel Hole Buddhist Abbey",
    article: "https://en.wikipedia.org/wiki/Throssel_Hole_Buddhist_Abbey",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Throssel_Hole_Abbey.jpg/960px-Throssel_Hole_Abbey.jpg",
    alt: "Throssel Hole Buddhist Abbey, Northumberland — the OBC's principal European training monastery.",
  },
};

async function smartFetch(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429) {
      const wait = Math.min(60_000, 5_000 * (i + 1));
      console.warn(`    rate-limited (429), waiting ${wait}ms ...`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    return res as unknown as Response;
  }
  throw new Error(`smartFetch: exhausted ${retries} retries on ${url}`);
}

async function downloadToWebp(imageUrl: string, outPath: string): Promise<void> {
  const res = await smartFetch(imageUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${imageUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(800, null, { fit: "inside" })
    .webp({ quality: 82 })
    .toFile(outPath);
}

async function upsertTempleAsset(
  templeId: string,
  storagePath: string,
  ti: TempleImage
): Promise<void> {
  const existing = await db
    .select({ id: mediaAssets.id })
    .from(mediaAssets)
    .where(
      and(
        eq(mediaAssets.entityType, "temple"),
        eq(mediaAssets.entityId, templeId)
      )
    );
  const id = existing[0]?.id ?? `media_temple_${templeId}`;
  const values = {
    entityType: "temple",
    entityId: templeId,
    type: "image",
    storagePath,
    sourceUrl: ti.article,
    license: "Wikipedia pageimage (Wikimedia Commons — see article for per-image license)",
    attribution: `Wikipedia: ${ti.title}`,
    altText: ti.alt,
    width: null,
    height: null,
    createdAt: new Date().toISOString(),
  };
  if (existing.length === 0)
    await db.insert(mediaAssets).values({ id, ...values });
  else await db.update(mediaAssets).set(values).where(eq(mediaAssets.id, id));

  // Citation linking the temple media_asset back to its Wikipedia source.
  await db
    .delete(citations)
    .where(
      and(
        eq(citations.entityType, "media_asset"),
        eq(citations.entityId, id)
      )
    );
  await db.insert(citations).values({
    id: `cite_media_${templeId}`,
    sourceId: "src_wikipedia",
    entityType: "media_asset",
    entityId: id,
    fieldName: "storage_path",
    pageOrSection: ti.article,
    excerpt: ti.alt,
  });
}

async function main() {
  console.log("Fetching temple images from Wikipedia pageimages...\n");
  if (!fs.existsSync(PUBLIC_TEMPLES_DIR))
    fs.mkdirSync(PUBLIC_TEMPLES_DIR, { recursive: true });

  let fetched = 0;
  let skipped = 0;
  let missing: string[] = [];

  for (const [slug, ti] of Object.entries(TARGETS)) {
    const [templeRow] = await db
      .select({ id: temples.id })
      .from(temples)
      .where(eq(temples.slug, slug));
    if (!templeRow) {
      console.warn(`  ⚠ ${slug} not found in DB — skipping`);
      missing.push(slug);
      continue;
    }
    const outPath = path.join(PUBLIC_TEMPLES_DIR, `${slug}.webp`);

    if (fs.existsSync(outPath)) {
      // Already downloaded — re-stamp the DB attribution so it stays fresh.
      await upsertTempleAsset(templeRow.id, `/temples/${slug}.webp`, ti);
      skipped++;
      continue;
    }

    console.log(`  → ${slug} (${ti.title}) ...`);
    try {
      await downloadToWebp(ti.imageUrl, outPath);
      await upsertTempleAsset(templeRow.id, `/temples/${slug}.webp`, ti);
      fetched++;
    } catch (err) {
      console.warn(`    failed: ${err instanceof Error ? err.message : err}`);
      missing.push(slug);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(
    `\n${fetched} fetched, ${skipped} skipped (already have), ${missing.length} missing`
  );
  if (missing.length) console.log("missing:", missing.join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
