# Suggested transmission corrections

Findings from the agent panel where an edge in `master_transmissions` appears
to need a topology change, not just better sources. A human reviews each
entry, decides whether to apply the change, and lands it as a normal PR
editing the relevant seed-data file. The orchestrator NEVER auto-applies
these.

---

## shunryu-suzuki → dainin-katagiri — WITHDRAWN

- **Date raised:** 2026-05-15
- **Status (2026-05-15):** **Withdrawn — current graph is already correct.**
- **Wave:** Wave-1B agent panel (3 independent researchers)

The agent panel correctly identified that **Suzuki did not confer shihō on
Katagiri**. However, the current DB already represents this correctly:

- The **primary** transmission edge is `daicho-hayashi → dainin-katagiri`
  (1949 denpō at Taizō-in, Fukui), already seeded with full notes citing
  the MZMC biography and Wikipedia.
- The `shunryu-suzuki → dainin-katagiri` edge in the DB is
  `type='secondary'`, `is_primary=0` — i.e., a "studied with"
  relationship documenting Katagiri's years assisting Suzuki at SFZC,
  not a transmission. This is the project's standard pattern (see
  Kwong, Weitsman, etc. in `deshimaru-lineage.ts`).

No action needed. The research the agents produced has been folded into
the tier-A evidence file at
`scripts/data/transmission-evidence/dainin-katagiri__daicho-hayashi.md`.

---

## shunryu-suzuki → kobun-chino-otogawa — needs primary edge added

- **Date raised:** 2026-05-15
- **Status:** **Action needed: seed Hozan Koei Chino + add primary edge.**
- **Wave:** Wave-1C agent panel (3 independent researchers, all high
  confidence)

### Finding

The current DB has `shunryu-suzuki → kobun-chino-otogawa` as
`type='secondary'`, `is_primary=0` — which correctly represents Kobun's
role as Suzuki's invited senior monk at Tassajara (1967–1970), NOT a
transmission. So far so good.

**However, Kobun has no primary transmission edge** because his actual
shihō teacher, **Hozan Koei Chino Roshi**, is not yet seeded as a master
in the DB. As a result, Kobun appears in the public graph as a
descendant of Suzuki via the secondary edge, which understates his
actual lineage.

### Cited sources (3 independent researchers converged)

- **Jikoji Zen Center** (Kobun's institution): *"He received dharma
  transmission from Koei Chino Roshi in Kamo in 1962."* —
  <https://www.jikojizencenter.org/biography>
- **Terebess** (academic): *"He received Dharma transmission from Koei
  Chino Roshi in Kamo in l962."* —
  <https://terebess.hu/zen/mesterek/otokawa.html>
- **Floating Zendo** (Kobun lineage sangha): *"He was ordained at age
  twelve, and adopted by a nearby priest in town, Hozan Koei Chino
  Roshi. The following year he was given dharma transmission by Chino
  Roshi."* — <https://floatingzendo.org/lineage/>
- **Jakkoan Kobun archive** (sangha): *"He received dharma transmission
  from Koei Chino Roshi in Kamo in 1962. He did his first Denpo
  transmission in 1989 at Jikoji."* — <http://www.kobun.jikoji.org/dbio.html>

### Proposed correction (paired edit)

1. **Add master `hozan-koei-chino`** to the canonical Sōtō seed data with:
   - Names: Hozan Koei Chino Roshi (法山宏文 知野), alias "Koei Chino"
   - Role: Sōtō priest at Kamo, Japan; adoptive father and shihō
     teacher of Kobun Chino Otogawa.
2. **Add primary edge** `hozan-koei-chino → kobun-chino-otogawa` with
   `shihoYear: 1962, notes: "Dharma transmission (shihō) 1962 at Kamo,
   Japan, from his adoptive father Hozan Koei Chino Roshi."`
3. **Keep** the existing `shunryu-suzuki → kobun-chino-otogawa`
   `secondary` edge — it documents the 1967–1970 collaboration at
   Tassajara/SFZC, which is real history.

This pattern mirrors the resolution of the Katagiri case above: the
secondary "studied with" edge stays, and a new primary edge anchors the
shihō lineage. After applying, regenerate
`tests/golden/transmission-edges.json` so the diff documents exactly
what changed.

### Note on Hozan Koei Chino himself

The agents did not turn up biographical details on Koei Chino Roshi
himself (dates, his own teacher, temple lineage). A follow-up
researcher pass would establish his upstream lineage so Kobun connects
back to the Shakyamuni root through Koei Chino rather than only via the
Suzuki secondary edge.

---

<!-- Wave-2 batch findings appended 2026-05-15 -->

## yuquan-shenxiu->jingzhong-wuxiang — flagged by Wave-2 agent panel

- Confidence: low
- Dissent: No source directly attests Shenxiu→Wuxiang transmission. The Lidai fabao ji traces Wuxiang's lineage through Zhishen and Chuji, NOT through Shenxiu. This edge may be mis-attributed in the DB.
- Sources searched:
  - Wikipedia — Kim Hwasang: <https://en.wikipedia.org/wiki/Kim_Ho-shang>


<!-- Wave-3 mass-research findings appended 2026-05-15 -->

## Wave-3 mass-research mis-attribution summary

The 14-agent Wave-3 batch surfaced numerous additional likely mis-attributions
in the existing `master_transmissions` table. Listed below for human review.
Each remains as `tier: D` in its evidence file with `human_review_needed: true`.

### Chronologically impossible (cross-millennium)

- `linji-yixuan -> osaka-koryu` — Linji died 866 CE, Koryū lived 1901–1985.
  Edge encodes school-membership, not transmission. Koryū's actual teacher
  was **Muso Joko Roshi** (Myōshin-ji line).
- `linji-yixuan -> baizhang-niepan` — Baizhang Niepan was a student of
  Baizhang Huaihai (a generation before Linji), died ~828 CE; Linji died
  866 CE. Direction reversed at minimum.
- `shishuang-qingzhu -> dingzhou-shizang` — Dingzhou Shizang dates (714-800)
  predate Shishuang Qingzhu (807-888) by over a century.
- `wuzhun-shifan -> yuelin-shiguan` — Yuelin (1143-1217) predates Wuzhun
  (1178-1249); direction reversed.

### Wrong teacher (real student, but different transmission teacher)

- `dongshan-liangjie -> wenshu-yingzhen` — no source attests Wenshu Yingzhen
  as Dongshan's student.
- `shishuang-qingzhu -> nanta-guangyong` — Nanta Guangyong's actual teacher
  was **Yangshan Huiji** (Guiyang school).
- `tongan-daopi -> yangshan-yong` — no source attests this disciple.
- `yangshan-huiji -> jingzhao-mihu` — Jingzhao Mihu's actual teacher was
  **Guishan Lingyou** (Yangshan's master), not Yangshan himself.
- `puti-damo -> mahasattva-fu` — no Chan source places Mahāsattva Fu as
  Bodhidharma's dharma heir; the "Three Mahāsattvas of the Liang Dynasty"
  grouping is honorific, not lineage.
- `yuquan-shenxiu -> jingzhong-wuxiang` — Wuxiang's actual teacher was
  **Zizhou Chuji** (Lidai fabao ji lineage), not Shenxiu.
- `xitang-zhizang -> wufeng-changguan` — Wufeng's actual teacher was
  **Baizhang Huaihai**, not Xitang Zhizang.
- `yunmen-wenyan -> baoen-xuanze` — Baoen Xuanze's actual teacher was
  **Fayan Wenyi**.
- `zhaozhou-congshen -> qinglin-shiqian` — Qinglin Shiqian's actual teacher
  was **Dongshan Liangjie** (Caodong founder).
- `changqing-huileng -> wang-yanbin` — Wang Yanbin was the governor / lay
  patron who built Changqing's stūpa, not a dharma heir.
- `cuiwei-wuxue -> longji-shaoxiu` — Longji Shaoxiu's actual teacher was
  **Luohan Guichen**, not Cuiwei Wuxue.
- `nanyue-daoxuan -> danyuan-yingzhen` — Danyuan's actual teacher was
  **Nanyang Huizhong** (National Teacher). "Nanyue Daoxuan" appears to be
  a name confusion or non-existent figure.
- `shitou-xiqian -> nanyue-daoxuan` — "Nanyue Daoxuan" doesn't appear in
  any standard Chan reference as Shitou's heir. May be a conflation of
  Shitou's Mt. Nanyue location with a personal name.
- `shushan-kuangren -> taiyuan-fu` — Taiyuan Fu is described as a disciple
  of **Xuefeng Yicun** (tenzo enlightenment story), not Shushan Kuangren.
- `xuefeng-yicun -> luoshan-daoxian` — Luoshan's actual transmission was
  from **Yantou Quanhuo** (Xuefeng's dharma brother).
- `xuefeng-yicun -> mingzhao-deqian` — Mingzhao's actual teacher was
  **Luoshan Daoxian** (two generations below Xuefeng via Yantou).
- `xuefeng-yicun -> qingxi-hongjin` — Qingxi's actual teacher was
  **Luohan Guichen** (Dizang); Xuefeng is great-grandteacher.
- `gisan-zenrai -> sohan-genyo` — Sohan Genyō's actual teacher was
  **Kasan Zenryō** (Takuju line); Gisan Zenrai was in the parallel
  Inzan line.
- `keido-chisan -> baian-hakujun-kuroda` — Kuroda's actual teacher per
  ZenHub was **Guhaku Daiōshō** (died 1928), not Keido Chisan.
- `keido-chisan -> dosho-saikawa` — no source attests this edge.
- `etienne-mokusho-zeisler -> vincent-keisen-vuillemin` — Zeisler gave
  Vuillemin **monk ordination** (1987); Vuillemin's actual shihō was
  from **Yvon Myōken Bec** (4 June 2007).

### Peer relationships mis-coded as transmission

- `dongshan-shouchu -> deshan-yuanmi` — both were dharma heirs of
  **Yunmen Wenyan**; siblings, not teacher-student.
- `baling-haojian -> dongshan-shouchu` — both were Yunmen heirs.
- `gaoan-dayu -> deshan-xuanjian` — different lineage branches (Mazu vs
  Shitou); edge may be inverted.

### Generation-skip / school-affiliation (not direct transmission)

- `myoan-eisai -> huanglong-huinan` — Eisai received inka from
  **Xu'an Huaichang** (8th-generation Huanglong heir), not directly from
  Huinan who died over a century before Eisai was born.
- `nguyen-thieu -> linji-yixuan` and `ingen-ryuki -> linji-yixuan` —
  ~30 generations removed; encodes school affiliation, not direct edge.
- `keizan-jokin -> keido-chisan` — ~15 generations apart; direct
  teacher of Keido Chisan was **Koho Hakugan**.

### Unverifiable in English-language sources

- `xuefeng-yicun -> changfu-zhi`
- `cuiwei-wuxue -> longji-shaoxiu`
- `jiashan-shanhui -> shanglan-lingchao`
- `jiashan-shanhui -> shaoshan-huanpu`
- `shishuang-qingzhu -> yungai-zhiyuan`
- `xiangyan-zhixian -> baofeng-weizhao`
- `xiangyan-zhixian -> huguo-shoucheng`
- `yunmen-wenyan -> jiufeng-qin`
- `xutang-zhiyu -> wuzhun-shifan` — direction may be inverted
- `dayu-shouzhi -> guishan-lingyou`
- `licun -> linji-yixuan`
- `furong-daokai -> yang-wuwei`
- `xuefeng-yicun -> lianhua-fengxiang` — Lianhua was 2 generations below

These edges may exist in Chinese-language lamp records (Jingde Chuandeng
Lu, etc.) but are not surfaced in accessible English-language reference
sources. A future pass with native-language sources would be needed.

---
