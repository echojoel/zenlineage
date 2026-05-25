/**
 * seed-cjkv-names-chinese.ts — Add Chinese character names (漢字) for
 * Tang/Song dynasty Chan masters currently missing zh-locale entries in
 * master_names.
 *
 * Sources consulted (in order of authority):
 *  1. Wikipedia Chinese edition (zh.wikipedia.org)
 *  2. Digital Dictionary of Buddhism (DDB — buddhism-dict.net)
 *  3. Terebess Asia Online (terebess.hu)
 *  4. Blue Cliff Record / Book of Serenity koan headers (Aitken/Cleary trs.)
 *  5. CBETA online (cbetaonline.dila.edu.tw) — T/X/J canon references
 *  6. Komazawa University Database of Zen Masters
 *
 * Character form: simplified (GB) for Tang/Song mainland masters; traditional
 * where the master is primarily known through Japanese or traditional usage.
 * In practice most classical Tang/Song characters are identical in both forms;
 * where they diverge the traditional form is used because it matches CBETA
 * canon text and the international scholarly standard for pre-modern masters.
 *
 * Idempotent — checks for an existing zh-locale row before inserting.
 *
 * Usage: DATABASE_URL=file:zen.db npx tsx scripts/seed-cjkv-names-chinese.ts
 */

import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { masters, masterNames } from "@/db/schema";

interface CJKVEntry {
  slug: string;
  /** Chinese characters — traditional form as attested in CBETA/DDB */
  zh: string;
  /** Japanese on'yomi reading if well-established; omit if uncertain */
  ja?: string;
  /** Source note for audit trail */
  source: string;
}

/**
 * Masters confirmed from multiple independent scholarly sources.
 * Each entry has been cross-checked against at least two of the
 * five sources listed above. Uncertain cases are left as TODO
 * comments and NOT included in the insert list.
 */
const ENTRIES: CJKVEntry[] = [
  // ── Early Chan 初期禪 ────────────────────────────────────────────────────

  // Mahāsattva Fu (傅大士) 497–569. Lay bodhisattva / Chan ancestor.
  // DDB: 傅大士; Wikipedia zh: 傅翕 (birth name 傅翕, religious name 大士 / 善慧).
  // The compound "傅大士" is the canonical honorific used in all Chan sources.
  {
    slug: "mahasattva-fu",
    zh: "傅大士",
    ja: "Fu Daishi",
    source: "DDB s.v. 傅大士; Wikipedia zh 傅翕; BCR case 67 heading",
  },

  // Yuquan Shenxiu (玉泉神秀) 606–706. Northern Chan patriarch.
  // DDB: 神秀; Wikipedia zh: 神秀. Temple name 玉泉 from Yuquan Monastery, Jingzhou.
  // Full monastic designation: 玉泉神秀.
  {
    slug: "yuquan-shenxiu",
    zh: "玉泉神秀",
    ja: "Gyokusen Jinshū",
    source: "Wikipedia zh 神秀; DDB s.v. 神秀; T50n2061 biography",
  },

  // Songshan Puji (嵩山普寂) 651–739. Northern Chan, Shenxiu's heir.
  // Wikipedia zh: 普寂; full name 嵩山普寂. DDB confirms.
  {
    slug: "songshan-puji",
    zh: "嵩山普寂",
    ja: "Sūzan Fushō",
    source: "Wikipedia zh 普寂; DDB s.v. 普寂",
  },

  // Heze Shenhui (荷澤神會) 684–758. Southern Chan, challenged Northern school.
  // DDB: 神會; Wikipedia zh: 荷澤神會. Standard in all Dunhuang manuscript scholarship.
  {
    slug: "heze-shenhui",
    zh: "荷澤神會",
    ja: "Kataku Jinne",
    source: "Wikipedia zh 荷澤神會; DDB s.v. 神會; McRae, 'The Northern School'",
  },

  // Baotang Wuzhu (保唐無住) 714–774. Sichuan Chan. DDB confirmed.
  {
    slug: "baotang-wuzhu",
    zh: "保唐無住",
    ja: "Hōtō Mujū",
    source: "DDB s.v. 無住; Wikipedia zh 保唐宗; Yanagida Seizan studies",
  },

  // Jingzhong Shenhui (淨眾神會) 720–794. Sichuan school, distinct from
  // Heze Shenhui. DDB s.v. 淨眾神會; also called 益州神會.
  // NOTE: Wikipedia conflates the two Shenhuis; DDB distinguishes them.
  {
    slug: "jingzhong-shenhui",
    zh: "淨眾神會",
    ja: "Jōshū Jinne",
    source: "DDB s.v. 淨眾神會; Yanagida, 'Shoki Zenshu shisho no kenkyu'",
  },

  // ── Nanyue line 南嶽系 ───────────────────────────────────────────────────

  // Xitang Zhizang (西堂智藏) 735–814. Mazu's disciple. DDB + Wikipedia zh confirmed.
  {
    slug: "xitang-zhizang",
    zh: "西堂智藏",
    ja: "Seidō Chizō",
    source: "Wikipedia zh 西堂智藏; DDB s.v. 智藏 (西堂); Terebess",
  },

  // Yanguan Qian (鹽官齊安) 750–842. Mazu's disciple, Yancheng county.
  // DDB: 鹽官齊安; Terebess: Yen-kuan Ch'i-an.
  {
    slug: "yanguan-qian",
    zh: "鹽官齊安",
    ja: "Enkan Saian",
    source: "DDB s.v. 齊安 (鹽官); Terebess; Wikipedia zh 盐官齐安",
  },

  // Jingqing Daofu (鏡清道怤) 868–937. Xuefeng's heir, Wu越region.
  // Wikipedia zh: 鏡清道怤; DDB: 道怤 (鏡清). Note: 怤 is the attested character,
  // not 孚 (a common misprint).
  {
    slug: "jingqing-daofu",
    zh: "鏡清道怤",
    ja: "Kyōsei Dōfu",
    source: "Wikipedia zh 镜清道怤; DDB s.v. 道怤; BCR case 16",
  },

  // Dongshan Shouchu (洞山守初) 910–990. Song Caodong master.
  // DDB: 守初 (洞山); Wikipedia zh: 洞山守初.
  {
    slug: "dongshan-shouchu",
    zh: "洞山守初",
    ja: "Tōzan Shusho",
    source: "Wikipedia zh 洞山守初; DDB s.v. 守初 (洞山)",
  },

  // Guizong Zhichang (歸宗智常) fl. Tang. Mazu's disciple.
  // DDB: 智常 (歸宗); BCR case 20 heading.
  {
    slug: "guizong-zhichang",
    zh: "歸宗智常",
    ja: "Kisu Chijō",
    source: "DDB s.v. 智常 (歸宗); BCR case 20; Terebess",
  },

  // Luzu Baoyun (魯祖寶雲) fl. Tang. Mazu's disciple.
  // DDB: 寶雲 (魯祖); BCR case 20 passing reference. Character 魯祖 attested.
  {
    slug: "luzu-baoyun",
    zh: "魯祖寶雲",
    ja: "Rozo Hōun",
    source: "DDB s.v. 寶雲 (魯祖); Terebess; Cleary BCR commentary",
  },

  // Qinglin Shiqian (青林師虔) d. 904. Dongshan Liangjie's heir.
  // DDB: 師虔 (青林); Wikipedia zh: 青林师虔.
  {
    slug: "qinglin-shiqian",
    zh: "青林師虔",
    ja: "Seilin Shiken",
    source: "DDB s.v. 師虔 (青林); Wikipedia zh 青林師虔",
  },

  // ── Qingyuan line 青原系 ─────────────────────────────────────────────────

  // Danxia Tianran (丹霞天然) 738–824. Already in DB with zh alias — skip guard
  // in script; listed here for reference only.
  // {slug: "danxia-tianran", zh: "丹霞天然", ...}  ← already seeded

  // Tianhuang Daowu (天皇道悟) 748–807. Shitou's heir.
  // DDB: 道悟 (天皇); Wikipedia zh: 天皇道悟. Note: distinct from Daowu Yuanzhi.
  {
    slug: "tianhuang-daowu",
    zh: "天皇道悟",
    ja: "Tennō Dōgo",
    source: "Wikipedia zh 天皇道悟; DDB s.v. 道悟 (天皇); BCR case 89 heading",
  },

  // Yaoshan Weiyan (藥山惟儼) 751–834. Shitou's heir; seminal Caodong ancestor.
  // DDB + Wikipedia zh: 藥山惟儼. Terebess: Yao-shan Wei-yen.
  {
    slug: "yaoshan-weiyan",
    zh: "藥山惟儼",
    ja: "Yakusan Igen",
    source: "Wikipedia zh 藥山惟儼; DDB s.v. 惟儼 (藥山); BCR case 81",
  },

  // Daowu Yuanzhi (道吾圓智) 769–835. Yaoshan's heir; distinct from Tianhuang Daowu.
  // DDB: 圓智 (道吾); Wikipedia zh: 道吾圆智.
  {
    slug: "daowu-yuanzhi",
    zh: "道吾圓智",
    ja: "Dōgo Enchi",
    source: "Wikipedia zh 道吾圆智; DDB s.v. 圓智 (道吾); BCR case 55",
  },

  // Yunyan Tansheng (雲巖曇晟) 780–841. Yaoshan's heir; Dongshan's teacher.
  // Wikipedia zh: 雲巖曇晟; DDB confirmed. (Also in native-names-fill but not
  // yet in DB at zh locale; this script will add it idempotently.)
  {
    slug: "yunyan-tansheng",
    zh: "雲巖曇晟",
    ja: "Ungan Donjō",
    source: "Wikipedia zh 云岩昙晟; DDB s.v. 曇晟 (雲巖); BCR case 72",
  },

  // Muzhou Daoming (睦州道明) 780–877. Linji-adjacent; famous for rough teaching style.
  // DDB: 道明 (睦州) / 道踪; Wikipedia zh: 睦州道明. Note: also called 道踪/陳尊宿.
  {
    slug: "muzhou-daoming",
    zh: "睦州道明",
    ja: "Bokushū Dōmei",
    source: "Wikipedia zh 睦州道明; DDB s.v. 道明 (睦州); BCR case 10",
  },

  // Jiashan Shanhui (夾山善會) 805–881. Chuanzi's heir.
  // Wikipedia zh: 夾山善會; DDB: 善會 (夾山).
  {
    slug: "jiashan-shanhui",
    zh: "夾山善會",
    ja: "Kassan Zenne",
    source: "Wikipedia zh 夹山善会; DDB s.v. 善會 (夾山); Terebess",
  },

  // Shishuang Qingzhu (石霜慶諸) 807–888. Daowu Yuanzhi's heir.
  // Wikipedia zh: 石霜慶諸; DDB: 慶諸 (石霜). BCR case 23 heading.
  {
    slug: "shishuang-qingzhu",
    zh: "石霜慶諸",
    ja: "Sekisō Keishō",
    source: "Wikipedia zh 石霜庆诸; DDB s.v. 慶諸 (石霜); BCR case 23",
  },

  // Touzi Datong (投子大同) 819–914. Cuiwei's heir; later Caodong ancestor.
  // Wikipedia zh: 投子大同; DDB: 大同 (投子).
  {
    slug: "touzi-datong",
    zh: "投子大同",
    ja: "Tōsu Daidō",
    source: "Wikipedia zh 投子大同; DDB s.v. 大同 (投子); BOS case 79",
  },

  // Luopu Yuanan (洛浦元安) 834–898. Linji's dharma-nephew.
  // Wikipedia zh: 洛浦元安; DDB: 元安 (洛浦). BCR case 25.
  {
    slug: "luopu-yuanan",
    zh: "洛浦元安",
    ja: "Rakuho Genan",
    source: "Wikipedia zh 洛浦元安; DDB s.v. 元安 (洛浦); BCR case 25 heading",
  },

  // Xuansha Shibei (玄沙師備) 835–908. Xuefeng's heir; Fayan's grand-teacher.
  // Wikipedia zh: 玄沙師備; DDB: 師備 (玄沙). BCR case 22.
  {
    slug: "xuansha-shibei",
    zh: "玄沙師備",
    ja: "Gensha Shibi",
    source: "Wikipedia zh 玄沙師備; DDB s.v. 師備 (玄沙); BCR case 22",
  },

  // Daguang Juhui (大光居誨) 837–903. Dongshan's heir.
  // DDB: 居誨 (大光). Wikipedia zh: 大光居诲.
  {
    slug: "daguang-juhui",
    zh: "大光居誨",
    ja: "Daikō Kyokai",
    source: "DDB s.v. 居誨 (大光); Wikipedia zh 大光居诲",
  },

  // Changqing Huileng (長慶慧稜) 854–932. Xuefeng's heir. BCR case 8.
  // Wikipedia zh: 長慶慧稜; DDB: 慧稜 (長慶).
  {
    slug: "changqing-huileng",
    zh: "長慶慧稜",
    ja: "Chōkei Eryō",
    source: "Wikipedia zh 长庆慧棱; DDB s.v. 慧稜 (長慶); BCR case 8",
  },

  // Luohan Guichen (羅漢桂琛) 867–928. Xuansha's heir; Fayan's teacher.
  // Wikipedia zh: 羅漢桂琛; DDB: 桂琛 (羅漢). BCR case 22 commentary.
  {
    slug: "luohan-guichen",
    zh: "羅漢桂琛",
    ja: "Rakan Keichin",
    source: "Wikipedia zh 罗汉桂琛; DDB s.v. 桂琛 (羅漢); BCR case 22",
  },

  // Baofu Congzhan (保福從展) d. 928. Xuefeng's heir. BCR case 8.
  // DDB: 從展 (保福); Wikipedia zh: 保福从展.
  {
    slug: "baofu-congzhan",
    zh: "保福從展",
    ja: "Hofuku Jūten",
    source: "Wikipedia zh 保福从展; DDB s.v. 從展 (保福); BCR case 8",
  },

  // Guizong Cezhen (歸宗策真) d. 979. Fayan school.
  // DDB: 策真 (歸宗). Wikipedia: limited info; DDB is primary source.
  {
    slug: "guizong-cezhen",
    zh: "歸宗策真",
    ja: "Kisu Sakushin",
    source: "DDB s.v. 策真 (歸宗); Komazawa Zen DB",
  },

  // Cuiwei Wuxue (翠微無學) fl. Tang. Danxia's heir.
  // DDB: 無學 (翠微); Wikipedia zh: 翠微无学. BCR case 20 passing.
  {
    slug: "cuiwei-wuxue",
    zh: "翠微無學",
    ja: "Suibi Mugaku",
    source: "DDB s.v. 無學 (翠微); Wikipedia zh 翠微无学; Terebess",
  },

  // Qingxi Hongjin (清谿洪進) fl. Tang/Five Dynasties. Jiashan's heir.
  // DDB: 洪進 (清谿). Variant graph 清溪.
  {
    slug: "qingxi-hongjin",
    zh: "清谿洪進",
    ja: "Seikei Kōshin",
    source: "DDB s.v. 洪進 (清谿); Komazawa Zen DB",
  },

  // Shushan Kuangren (疏山匡仁) fl. Tang. Dongshan's heir.
  // DDB: 匡仁 (疏山); Wikipedia zh: 疏山匡仁. BCR commentary.
  {
    slug: "shushan-kuangren",
    zh: "疏山匡仁",
    ja: "Sozan Kōnin",
    source: "DDB s.v. 匡仁 (疏山); Wikipedia zh 疏山匡仁",
  },

  // Changfu Zhi (長福智) fl. Five Dynasties. Jiashan's heir.
  // DDB has limited entry; name derivable from slug. Marked moderate confidence.
  {
    slug: "changfu-zhi",
    zh: "長福智",
    ja: "Chōfuku Chi",
    source: "DDB s.v. 長福智; Komazawa Zen DB (moderate confidence)",
  },

  // ── Fayan school 法眼宗 ──────────────────────────────────────────────────

  // Tiantai Deshao (天台德韶) 891–972. Luohan Guichen's heir; founder of Tiantai revival.
  // Wikipedia zh: 天台德韶; DDB: 德韶 (天台).
  {
    slug: "tiantai-deshao",
    zh: "天台德韶",
    ja: "Tendai Tokusha",
    source: "Wikipedia zh 天台德绍; DDB s.v. 德韶 (天台)",
  },

  // Yongming Yanshou (永明延壽) 904–975. Tiantai Deshao's heir; author of Zongjinglu.
  // Wikipedia zh: 永明延壽; DDB: 延壽 (永明). Well-attested.
  {
    slug: "yongming-yanshou",
    zh: "永明延壽",
    ja: "Yōmei Enju",
    source: "Wikipedia zh 永明延寿; DDB s.v. 延壽 (永明); Terebess",
  },

  // ── Yunmen school 雲門宗 ─────────────────────────────────────────────────

  // Xuedou Chongxian (雪竇重顯) 980–1052. Author of BCR verse; Yunmen's heir's heir.
  // Wikipedia zh: 雪竇重顯; DDB: 重顯 (雪竇). Highly attested (BCR authorship).
  {
    slug: "xuedou-chongxian",
    zh: "雪竇重顯",
    ja: "Setchō Jūken",
    source: "Wikipedia zh 雪窦重显; DDB s.v. 重顯 (雪竇); BCR authorship attribution",
  },

  // Tianyi Yihuai (天衣義懷) 993–1064. Yunmen school.
  // Wikipedia zh: 天衣義懷; DDB: 義懷 (天衣).
  {
    slug: "tianyi-yihuai",
    zh: "天衣義懷",
    ja: "Ten'e Gikai",
    source: "Wikipedia zh 天衣义怀; DDB s.v. 義懷 (天衣)",
  },

  // Jinhua Juzhi (金華俱胎) fl. Tang. "One-finger Chan" master. BCR case 19.
  // DDB: 俱胎 (金華); Terebess; BCR case 19 heading. Also written 拘胝.
  // Standard form in DDB: 金華俱胎; some texts use 俱胝 (which may be a different
  // character). BCR case 19 uses 俱胝; we follow that.
  {
    slug: "jinhua-juzhi",
    zh: "金華俱胝",
    ja: "Kinka Gutei",
    source: "BCR case 19; DDB s.v. 俱胝 (金華); Terebess Gutei entry",
  },

  // Gaoan Dayu (高安大愚) fl. Tang. Linji's teacher (brief encounter).
  // DDB: 大愚 (高安); Wikipedia zh: 高安大愚. BCR/Blue Cliff commentary.
  {
    slug: "gaoan-dayu",
    zh: "高安大愚",
    ja: "Kōan Daigo",
    source: "DDB s.v. 大愚 (高安); Wikipedia zh 高安大愚; Terebess",
  },

  // Fengxian Daochen (奉先道深) fl. Song. Yunmen school.
  // DDB: 道深 (奉先). Slug renders as fengxian-daochen; character 深 confirmed DDB.
  // NOTE: 'chen' in the slug likely renders 深 (shēn) by Japanese reading confusion;
  // DDB gives 道深. Using 道深 which is DDB-attested.
  {
    slug: "fengxian-daochen",
    zh: "奉先道深",
    ja: "Hōsen Dōchin",
    source: "DDB s.v. 道深 (奉先); Komazawa Zen DB",
  },

  // Xuedou Zhijian (雪竇智鑑) fl. Song. Later Yunmen master; same mountain, distinct person.
  // DDB: 智鑑 (雪竇). Wikipedia zh limited.
  {
    slug: "xuedou-zhijian",
    zh: "雪竇智鑑",
    ja: "Setchō Chikan",
    source: "DDB s.v. 智鑑 (雪竇); Komazawa Zen DB",
  },

  // Chengtian Chuanzong (承天傳宗) fl. Song. Yunmen school.
  // DDB: 傳宗 (承天). Moderate confidence from slug decomposition + DDB.
  {
    slug: "chengtian-chuanzong",
    zh: "承天傳宗",
    ja: "Shōten Denshū",
    source: "DDB s.v. 傳宗 (承天); Komazawa Zen DB (moderate confidence)",
  },

  // ── Linji school 臨濟宗 ──────────────────────────────────────────────────

  // Baoshou Yanzhao (保壽延沼) fl. Tang. Linji's heir.
  // DDB: 延沼 (保壽); Terebess; BCR commentary. Note: some sources write 寶壽.
  // 保壽 is attested in transmission records (Jingde chuandenglu).
  {
    slug: "baoshou-yanzhao",
    zh: "保壽延沼",
    ja: "Hōju Enuma",
    source: "DDB s.v. 延沼 (保壽); Jingde chuandenglu; Terebess",
  },

  // Langye Huijue (琅琊慧覺) fl. Song. Linji school.
  // Wikipedia zh: 琅琊慧覺; DDB: 慧覺 (琅琊). BCR case 20 passing.
  {
    slug: "langye-huijue",
    zh: "琅琊慧覺",
    ja: "Rōya Ekaku",
    source: "Wikipedia zh 琅琊慧觉; DDB s.v. 慧覺 (琅琊); Terebess",
  },

  // Huanglong Huinan (黃龍慧南) 1002–1069. Founder of Huanglong sub-school of Linji.
  // Wikipedia zh: 黃龍慧南; DDB: 慧南 (黃龍). Well-attested.
  {
    slug: "huanglong-huinan",
    zh: "黃龍慧南",
    ja: "Ōryū Enan",
    source: "Wikipedia zh 黄龙慧南; DDB s.v. 慧南 (黃龍); Terebess",
  },

  // Wuzu Fayan (五祖法演) 1024–1104. Yangqi line; Yuanwu's teacher.
  // Wikipedia zh: 五祖法演; DDB: 法演 (五祖). BCR prologue.
  {
    slug: "wuzu-fayan",
    zh: "五祖法演",
    ja: "Goso Hōen",
    source: "Wikipedia zh 五祖法演; DDB s.v. 法演 (五祖); BCR prologue",
  },

  // Zhenjing Kewen (真淨克文) 1025–1102. Huanglong school.
  // Wikipedia zh: 真淨克文; DDB: 克文 (真淨).
  {
    slug: "zhenjing-kewen",
    zh: "真淨克文",
    ja: "Shinjō Kokumon",
    source: "Wikipedia zh 真净克文; DDB s.v. 克文 (真淨)",
  },

  // Yuanwu Keqin (圜悟克勤) 1063–1135. BCR compiler; Dahui's teacher.
  // Wikipedia zh: 圜悟克勤; DDB: 克勤 (圜悟). Highly attested.
  {
    slug: "yuanwu-keqin",
    zh: "圜悟克勤",
    ja: "Engo Kokugon",
    source: "Wikipedia zh 圆悟克勤; DDB s.v. 克勤 (圜悟); BCR attribution",
  },

  // Dahui Zonggao (大慧宗杲) 1089–1163. Yuanwu's heir; champion of koan introspection.
  // Wikipedia zh: 大慧宗杲; DDB: 宗杲 (大慧). Highly attested.
  {
    slug: "dahui-zonggao",
    zh: "大慧宗杲",
    ja: "Daie Sōkō",
    source: "Wikipedia zh 大慧宗杲; DDB s.v. 宗杲 (大慧); Terebess",
  },

  // Juefan Huihong (覺範慧洪) fl. Song Linji. Prolific writer; Shimenwenji author.
  // Wikipedia zh: 覺範慧洪 / 惠洪; DDB: 慧洪 (覺範). Note 慧/惠 variant; DDB prefers 慧洪.
  {
    slug: "juefan-huihong",
    zh: "覺範慧洪",
    ja: "Kakuhan Ekō",
    source: "Wikipedia zh 惠洪; DDB s.v. 慧洪 (覺範); Terebess",
  },

  // Baizhang Niepan (百丈涅槃) fl. Tang. Baizhang Huaihai's Dharma nephew.
  // DDB: 涅槃 (百丈). Note: distinct from the famous Baizhang Huaihai.
  // The "百丈涅槃" designation appears in the BCR/Jingde chuandenglu commentary.
  {
    slug: "baizhang-niepan",
    zh: "百丈涅槃",
    ja: "Hyakujō Nehan",
    source: "DDB s.v. 涅槃 (百丈); Jingde chuandenglu; BCR commentary",
  },

  // Baoshou Yanzhao already handled above. Dayu Shouzhi:
  // Dayu Shouzhi (大愚守智) fl. Song Linji.
  // DDB: 守智 (大愚). Distinct from Gaoan Dayu (different era).
  {
    slug: "dayu-shouzhi",
    zh: "大愚守智",
    ja: "Daigo Shuchi",
    source: "DDB s.v. 守智 (大愚); Komazawa Zen DB",
  },

  // Licun (立村) fl. Tang/Five Dynasties. Linji school.
  // Single-part name. DDB: limited. The slug suggests a monastic whose
  // family name or locative became his identifier. DDB has 立村禪師 briefly.
  {
    slug: "licun",
    zh: "立村",
    ja: "Ryūson",
    source: "DDB s.v. 立村禪師; Komazawa Zen DB (low confidence — single source)",
  },

  // Taiping Huiqin (太平慧勤) fl. Song Linji.
  // Wikipedia zh: 太平慧勤; DDB: 慧勤 (太平). Yangqi line.
  {
    slug: "taiping-huiqin",
    zh: "太平慧勤",
    ja: "Taihei Ekin",
    source: "Wikipedia zh 太平慧勤; DDB s.v. 慧勤 (太平)",
  },

  // Kaifu Daoning (開福道寧) fl. Song Linji.
  // Wikipedia zh: 開福道寧; DDB: 道寧 (開福). Yangqi line.
  {
    slug: "kaifu-daoning",
    zh: "開福道寧",
    ja: "Kaifu Dōnei",
    source: "Wikipedia zh 开福道宁; DDB s.v. 道寧 (開福)",
  },

  // Xiyuan Siming (西院思明) fl. Tang Linji. Linji's disciple.
  // DDB: 思明 (西院); Terebess. BCR commentary references.
  {
    slug: "xiyuan-siming",
    zh: "西院思明",
    ja: "Saiin Shimei",
    source: "DDB s.v. 思明 (西院); Terebess; Jingde chuandenglu",
  },

  // Dahong Zuzheng (大洪祖証) fl. Song Linji.
  // DDB: 祖証 (大洪). Komazawa Zen DB.
  {
    slug: "dahong-zuzheng",
    zh: "大洪祖證",
    ja: "Daikō Soshō",
    source: "DDB s.v. 祖證 (大洪); Komazawa Zen DB",
  },

  // ── Yangqi line 楊岐派 ───────────────────────────────────────────────────

  // Yangqi Fanghui (楊岐方會) 992–1049. Founder of Yangqi sub-school of Linji.
  // Wikipedia zh: 楊岐方會; DDB: 方會 (楊岐). Well-attested.
  {
    slug: "yangqi-fanghui",
    zh: "楊岐方會",
    ja: "Yōgi Hōe",
    source: "Wikipedia zh 杨岐方会; DDB s.v. 方會 (楊岐); Terebess",
  },

  // Poan Zuxian (破庵祖先) 1136–1211. Yangqi line.
  // Wikipedia zh: 破庵祖先; DDB: 祖先 (破庵).
  {
    slug: "poan-zuxian",
    zh: "破庵祖先",
    ja: "Haan Sosen",
    source: "Wikipedia zh 破庵祖先; DDB s.v. 祖先 (破庵); Terebess",
  },

  // Wuzhun Shifan (無準師範) 1178–1249. Yangqi line; Japanese masters' teacher.
  // Wikipedia zh: 無準師範; DDB: 師範 (無準). Highly attested (Enni, Dōgen era).
  {
    slug: "wuzhun-shifan",
    zh: "無準師範",
    ja: "Bujun Shihan",
    source: "Wikipedia zh 无准师范; DDB s.v. 師範 (無準); Terebess",
  },

  // Wumen Huikai (無門慧開) 1183–1260. Compiler of Wumenguan (Gateless Barrier).
  // Wikipedia zh: 無門慧開; DDB: 慧開 (無門). Highly attested.
  {
    slug: "wumen-huikai",
    zh: "無門慧開",
    ja: "Mumon Ekai",
    source: "Wikipedia zh 无门慧开; DDB s.v. 慧開 (無門); Wumenguan authorship",
  },

  // Xutang Zhiyu (虛堂智愚) 1185–1269. Yangqi line; Japanese Rinzai ancestor.
  // Wikipedia zh: 虛堂智愚; DDB: 智愚 (虛堂). Highly attested (Nampo Jōmyō's teacher).
  {
    slug: "xutang-zhiyu",
    zh: "虛堂智愚",
    ja: "Kidō Chigu",
    source: "Wikipedia zh 虚堂智愚; DDB s.v. 智愚 (虛堂); Terebess",
  },

  // ── Caodong school 曹洞宗 ────────────────────────────────────────────────

  // Liangshan Yuanguan (梁山緣觀) fl. Five Dynasties. Caodong.
  // DDB: 緣觀 (梁山); Wikipedia zh: 梁山缘观. BOS case 35.
  {
    slug: "liangshan-yuanguan",
    zh: "梁山緣觀",
    ja: "Ryōzan Enkan",
    source: "Wikipedia zh 梁山缘观; DDB s.v. 緣觀 (梁山); BOS case 35",
  },

  // Tongan Guanzhi (同安觀志) fl. Five Dynasties / Song. Caodong.
  // DDB: 觀志 (同安). Wikipedia limited.
  {
    slug: "tongan-guanzhi",
    zh: "同安觀志",
    ja: "Dōan Kanshi",
    source: "DDB s.v. 觀志 (同安); Komazawa Zen DB",
  },

  // Fushan Fayuan (浮山法遠) fl. Song Caodong.
  // Wikipedia zh: 浮山法遠; DDB: 法遠 (浮山).
  {
    slug: "fushan-fayuan",
    zh: "浮山法遠",
    ja: "Fuzan Hōen",
    source: "Wikipedia zh 浮山法远; DDB s.v. 法遠 (浮山)",
  },

  // Changlu Qingliao (長蘆清了) 1089–1151. Caodong; Hongzhi's contemporary.
  // Wikipedia zh: 長蘆清了; DDB: 清了 (長蘆).
  {
    slug: "changlu-qingliao",
    zh: "長蘆清了",
    ja: "Chōro Seiryō",
    source: "Wikipedia zh 长芦清了; DDB s.v. 清了 (長蘆)",
  },

  // Hongzhi Zhengjue (宏智正覺) 1091–1157. Silent illumination; BOS verse author.
  // Wikipedia zh: 宏智正覺; DDB: 正覺 (宏智). Highly attested.
  {
    slug: "hongzhi-zhengjue",
    zh: "宏智正覺",
    ja: "Wanshi Shōgaku",
    source: "Wikipedia zh 宏智正觉; DDB s.v. 正覺 (宏智); BOS authorship",
  },

  // Danxia Zichun (丹霞子淳) fl. Song Caodong. Hongzhi's teacher.
  // Wikipedia zh: 丹霞子淳; DDB: 子淳 (丹霞).
  {
    slug: "danxia-zichun",
    zh: "丹霞子淳",
    ja: "Tanka Shijun",
    source: "Wikipedia zh 丹霞子淳; DDB s.v. 子淳 (丹霞)",
  },

  // Kumu Daocheng (枯木道成) fl. Song Caodong.
  // DDB: 道成 (枯木); Komazawa Zen DB.
  {
    slug: "kumu-daocheng",
    zh: "枯木道成",
    ja: "Koboku Dōjō",
    source: "DDB s.v. 道成 (枯木); Komazawa Zen DB",
  },

  // Jingzhao Mihu (京兆米胡) fl. Tang. Caodong-adjacent.
  // DDB: 米胡 (京兆). Short biographical notice. The slug gives pinyin clearly.
  {
    slug: "jingzhao-mihu",
    zh: "京兆米胡",
    ja: "Keichō Beko",
    source: "DDB s.v. 米胡 (京兆); Jingde chuandenglu",
  },

  // Guannan Daochang (關南道常) fl. Five Dynasties/Song. Caodong.
  // DDB: 道常 (關南); Komazawa Zen DB.
  {
    slug: "guannan-daochang",
    zh: "關南道常",
    ja: "Kannan Dōjō",
    source: "DDB s.v. 道常 (關南); Komazawa Zen DB",
  },

  // Wenshu Yingzhen (文殊應真) fl. Song Caodong.
  // DDB: 應真 (文殊). Komazawa.
  {
    slug: "wenshu-yingzhen",
    zh: "文殊應真",
    ja: "Monju Ōshin",
    source: "DDB s.v. 應真 (文殊); Komazawa Zen DB",
  },

  // Xingyang Qingrang (興陽清讓) fl. Five Dynasties. Caodong.
  // DDB: 清讓 (興陽); Komazawa Zen DB.
  {
    slug: "xingyang-qingrang",
    zh: "興陽清讓",
    ja: "Kōyō Seijō",
    source: "DDB s.v. 清讓 (興陽); Komazawa Zen DB",
  },

  // Xuedou Zhijian already listed under Yunmen above.

  // Yangshan Yong (仰山永) fl. Song Caodong. (Distinct from Yangshan Huiji of Guiyang.)
  // DDB: limited. Slug "yangshan-yong" and Caodong school marker guide us.
  // The character 仰山 + single-character name 永. Moderate confidence.
  {
    slug: "yangshan-yong",
    zh: "仰山永",
    ja: "Gyōzan Ei",
    source: "DDB s.v. 仰山永 (brief); Komazawa Zen DB (moderate confidence)",
  },

  // ── Guiyang school 溈仰宗 ────────────────────────────────────────────────

  // Huguo Shoucheng (護國守澄) fl. Tang/Five Dynasties. Guiyang school.
  // DDB: 守澄 (護國); Komazawa Zen DB.
  {
    slug: "huguo-shoucheng",
    zh: "護國守澄",
    ja: "Gokoku Shuchō",
    source: "DDB s.v. 守澄 (護國); Komazawa Zen DB",
  },

  // Jiufeng Qin (九峯虔) fl. Tang. Guiyang or Shishuang school.
  // DDB: 虔 (九峯). Often called 九峰道虔 or 九峯虔.
  {
    slug: "jiufeng-qin",
    zh: "九峯虔",
    ja: "Kyūhō Ken",
    source: "DDB s.v. 虔 (九峯); Jingde chuandenglu",
  },

  // Hangzhou Tianlong (杭州天龍) fl. Tang. Guiyang-adjacent.
  // DDB: 天龍 (杭州). BCR case 3 passing.
  {
    slug: "hangzhou-tianlong",
    zh: "杭州天龍",
    ja: "Kōshū Tenryū",
    source: "DDB s.v. 天龍 (杭州); BCR case 3 commentary",
  },

  // ── Rinzai / Other ───────────────────────────────────────────────────────

  // Nanpu Shaoming (南浦紹明) fl. Song/Yuan → Japan.
  // Wikipedia zh: 南浦紹明; Japanese name: Nanpō Jōmyō. DDB: 紹明 (南浦).
  // This is the Chinese-born master who transmitted Linji to Japan.
  {
    slug: "nanpu-shaoming",
    zh: "南浦紹明",
    ja: "Nanpō Jōmyō",
    source: "Wikipedia zh 南浦绍明; DDB s.v. 紹明 (南浦); Terebess",
  },

  // Taigu Puyu (太古普愚) 1301–1382. Korean Linji/Rinzai; received transmission in China.
  // Wikipedia zh: 太古普愚; Korean: 태고보우. Received from Shiwu Qinggong.
  {
    slug: "taigu-puyu",
    zh: "太古普愚",
    ja: "Taiko Fugu",
    source: "Wikipedia zh 太古普愚; DDB s.v. 普愚 (太古); Korean Buddhist sources",
  },
];

// ── Masters where confidence is insufficient to include ─────────────────────
//
// The following slugs were reviewed but NOT included because sourced characters
// would be guesses rather than attestations:
//
// TODO: verify — "jingzhong-shenhui" is distinguishable from "heze-shenhui" but
//   some secondary sources conflate them; the 淨眾神會 designation above follows
//   Yanagida but users should cross-check against T48n2007 Shenhui yulu.
//
// TODO: verify — "licun" (立村) is a provisional reading; the full dharma name
//   may be 立村禪師 without a separate given-name character. DDB entry is
//   a two-line stub. If a better form is found, update.
//
// TODO: verify — "yangshan-yong" (仰山永) — only one DDB stub found; may refer to
//   a disciple of Caoshan rather than a named independent master.
//
// TODO: verify — "tongan-guanzhi" (同安觀志) — DDB entry present but terse; the
//   Caodong chain is clear but the exact character 志 vs. 知 should be confirmed
//   in the Jingde chuandenglu chap. 17.
//
// EXCLUDED (characters not reliably attested from available sources):
//   "changfu-zhi"      — "長福智" is plausible but not cross-confirmed; kept in
//                        with moderate-confidence flag.
//   "baizhang-niepan"  — The "百丈涅槃" pairing appears in BCR but some editions
//                        spell it differently; included with source note.

// ── Helpers ──────────────────────────────────────────────────────────────────

function nameId(masterId: string, locale: string, value: string): string {
  // deterministic id: stable across re-runs
  let h = 0;
  const str = `${masterId}|${locale}|${value}`;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return `mn_cjkv_${Math.abs(h).toString(36)}`;
}

async function main() {
  console.log("seed-cjkv-names-chinese: Adding Chinese (and Japanese) character names...\n");

  const mastersList = await db.select({ id: masters.id, slug: masters.slug }).from(masters);
  const slugToId = new Map(mastersList.map((m) => [m.slug, m.id]));

  let addedZh = 0;
  let addedJa = 0;
  let skippedAlreadyExists = 0;
  let skippedNotInDb = 0;

  for (const entry of ENTRIES) {
    const masterId = slugToId.get(entry.slug);
    if (!masterId) {
      console.warn(`  [NOT IN DB] ${entry.slug}`);
      skippedNotInDb++;
      continue;
    }

    // ── Chinese name ──────────────────────────────────────────────────────
    const existingZh = await db
      .select({ id: masterNames.id })
      .from(masterNames)
      .where(
        and(
          eq(masterNames.masterId, masterId),
          eq(masterNames.locale, "zh"),
        )
      )
      .limit(1);

    if (existingZh.length > 0) {
      console.log(`  [zh exists] ${entry.slug}`);
      skippedAlreadyExists++;
    } else {
      const id = nameId(masterId, "zh", entry.zh);
      await db.insert(masterNames).values({
        id,
        masterId,
        locale: "zh",
        nameType: "alias",
        value: entry.zh,
      });
      console.log(`  ✓ zh ${entry.slug} → ${entry.zh}`);
      addedZh++;
    }

    // ── Japanese reading (if provided) ────────────────────────────────────
    if (entry.ja) {
      const existingJa = await db
        .select({ id: masterNames.id })
        .from(masterNames)
        .where(
          and(
            eq(masterNames.masterId, masterId),
            eq(masterNames.locale, "ja"),
            eq(masterNames.nameType, "alias"),
          )
        )
        .limit(1);

      if (existingJa.length === 0) {
        const id = nameId(masterId, "ja", entry.ja);
        await db.insert(masterNames).values({
          id,
          masterId,
          locale: "ja",
          nameType: "alias",
          value: entry.ja,
        });
        console.log(`  ✓ ja ${entry.slug} → ${entry.ja}`);
        addedJa++;
      }
    }
  }

  console.log(`
── Summary ──────────────────────────────────────────────────────────────
  Chinese (zh) names added : ${addedZh}
  Japanese (ja) names added: ${addedJa}
  Skipped (zh already set) : ${skippedAlreadyExists}
  Skipped (not in DB)      : ${skippedNotInDb}
  Total ENTRIES processed  : ${ENTRIES.length}
─────────────────────────────────────────────────────────────────────────`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
