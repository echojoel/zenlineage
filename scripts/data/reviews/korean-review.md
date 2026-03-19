# Korean Seon -- Scholar Review

## Changes Made

### Masters Added (17 new entries)

**Nine Mountain School Founders (8):**
1. **Hongcheok** (홍척, fl. 830) -- Silsangsan school founder, studied under Xitang Zhizang
2. **Hyecheol** (혜철, 785-861) -- Tongnisan school founder, studied under Xitang Zhizang
3. **Beomil** (범일, 810-889) -- Sagulsan school founder, studied under Yanguan Qian
4. **Hyeonuk** (현욱, 787-869) -- Pongnimsan school founder, Mazu Daoyi lineage (via Zhangjing Huaihui)
5. **Toyun** (도윤, 797-868) -- Sajasan school founder, Mazu Daoyi lineage
6. **Muyeom** (무염, c.800-888) -- Seongjusan school founder, Mazu lineage (via Magu Baozhe)
7. **Chiseon Doheon** (지선도헌, 824-882) -- Huiyangsan school founder, Mazu lineage
8. **Ieom** (이엄, 869-936) -- Sumisan school founder, Caodong lineage (via Yunju Daoying)

**Goryeo Dynasty (3):**
9. **Baegun Gyeonghan** (백운경한, 1298-1374) -- Author of Jikji (oldest extant movable-type printed book), studied under Shiwu Qinggong in China
10. **Muhak Jacho** (무학자초, 1327-1405) -- Naong's disciple, advisor to King Taejo, helped plan Joseon capital
11. **Hwanam Honsu** (환암혼수, 1320-1392) -- Naong's disciple, key link in Joseon-era lineage

**Chinese Master (1):**
12. **Pingshan Chulin** (平山處林, 1279-1361) -- Yuan-dynasty Linji master, Naong Hyegeun's dharma teacher

**Modern Lineage (5):**
13. **Suwol** (수월, 1855-1928) -- Gyeongheo's disciple, went to Manchuria
14. **Hyewol Hyemyeong** (혜월혜명, 1861-1937) -- Gyeongheo's disciple, established Busan lineage to Jinje
15. **Yongseong Chinjong** (용성진종, 1864-1940) -- Independence activist, one of 33 national representatives, Dongsan's teacher
16. **Dongsan Hyeil** (동산혜일, 1890-1965) -- Seongcheol's ordination master at Haeinsa
17. **Jinje** (진제, b.1934) -- 13th Supreme Patriarch of Jogye Order, 79th Patriarch in lineage

### Masters Corrected (2)

1. **Hyobong**: Corrected dharma name from "Hyobong Yeonghak" (효봉영학) to "Hyobong Haknul" (효봉학눌 / 曉峰學訥). Multiple sources including Wikipedia, Terebess, and the Jogye Order confirm Haknul as the correct dharma name. Added Hanja name.

2. **Gyeongheo Seongu**: Birth year confidence lowered from "high" to "medium". Sources disagree between 1846 (Jogye Order publications, Terebess) and 1849 (Wikipedia, some English sources). Kept 1846 as the existing value but flagged the uncertainty.

### Transmissions Added (17 new edges)

**Nine Mountain Founders to Chinese Teachers (9):**
- Xitang Zhizang -> Toui (secondary, supplementing existing Baizhang -> Toui)
- Xitang Zhizang -> Hongcheok (primary)
- Xitang Zhizang -> Hyecheol (primary)
- Yanguan Qian -> Beomil (primary)
- Mazu Daoyi -> Hyeonuk (secondary -- actual teacher was Zhangjing Huaihui, not in DB)
- Mazu Daoyi -> Toyun (secondary -- specific teacher uncertain)
- Mazu Daoyi -> Muyeom (secondary -- actual teacher was Magu Baozhe, not in DB)
- Mazu Daoyi -> Chiseon Doheon (secondary -- Mazu lineage through intermediate teachers)
- Yunju Daoying -> Ieom (primary -- Caodong lineage)

**Korean Internal Transmissions (8):**
- Gyeongheo -> Suwol (primary)
- Gyeongheo -> Hyewol (primary)
- Hyewol -> Jinje (secondary -- through intermediary Unbong/Woonbong)
- Dongsan Hyeil -> Seongcheol (primary -- replacing false Hyobong -> Seongcheol)
- Yongseong -> Dongsan (primary)
- Naong -> Hwanam Honsu (primary)
- Naong -> Muhak Jacho (primary)
- Shiwu Qinggong -> Baegun Gyeonghan (primary)

### Transmissions Corrected (5)

1. **Removed: Daman Hongren -> Wonhyo** -- False transmission. Wonhyo (617-686) never went to China and had no connection to the Fifth Patriarch Hongren. Wonhyo is pre-Seon and his famous skull-water enlightenment experience occurred during an aborted trip to China. He was a Yogacara/Hwaeom scholar, not a Chan lineage holder.

2. **Changed: Dahui Zonggao -> Bojo Jinul** -- Changed from implicit primary to `type: "dharma"`, `is_primary: false`. Jinul was profoundly inspired by reading Dahui's recorded sayings but they never met in person. This was a textual transmission across national boundaries, not a personal teacher-student relationship.

3. **Changed: Taego Bou -> Seosan Hyujeong** -- Changed to `type: "disputed"`, `is_primary: false`. There is a 138-year gap between Taego's death (1382) and Seosan's birth (1520). The Jogye Order claims a lineage through intermediaries (Hwanam Honsu, Gugok Gagun, Byeokgye Jeongsim, Byeoksong Jieom, Buyong Yeonggwan), but modern scholars dispute the veracity of this chain.

4. **Changed: Seosan Hyujeong -> Gyeongheo** -- Changed to `type: "disputed"`, `is_primary: false`. There is a 242-year gap. Gyeongheo succeeded the dharma of Yongam Hyeeon, who claimed descent from Seosan's lineage through multiple intermediaries (Hwanseong Jian, etc.). The chain is traditional rather than historically verifiable as direct transmission.

5. **Changed: Mangong -> Hyobong** -- Changed from primary to `type: "secondary"`, `is_primary: false`. Hyobong was ordained under Seoktu Sunim, not Mangong. While Mangong acknowledged Hyobong's awakening and gave him the nickname "wheat pounder," this was recognition rather than primary dharma transmission.

6. **Removed: Hyobong -> Seongcheol** -- Replaced with Dongsan Hyeil -> Seongcheol. Seongcheol was tonsured and ordained under Dongsan Hyeil at Haeinsa in 1936. The Yongseong-Dongsan-Seongcheol lineage is the established dharma flow.

7. **Changed: Zhongfeng Mingben -> Naong Hyegeun** -- Changed teacher to Pingshan Chulin. While Naong studied under the Indian monk Zhigong and received recognition, his formal dharma transmission was from Pingshan Chulin (1279-1361), a Yuan Linji master. Zhongfeng Mingben died in 1323 when Naong was only 3 years old.

### Practice Descriptions Updated

No changes to practice descriptions were needed. The existing descriptions for Seon, Jogye, Kwan Um, and Taego Order are accurate and well-written, correctly covering:
- Seon: Hwadu investigation, kyolche retreats, sudden awakening (dono)
- Jogye: Hwadu practice, kyolche system, seonbang (meditation hall)
- Kwan Um: Kong-an interviews, "What is this?", Yong Maeng Jong Jin retreats
- Taego Order: Hwadu practice with married clergy

### School Summaries Updated

No changes needed. The summaries are comprehensive and accurate.

### School Taxonomy Overrides Updated

- Added all 17 new masters to appropriate school override lists in `school-taxonomy.ts`
- Fixed "hyobong yeonghak" to "hyobong haknul" in Jogye overrides
- Added "pingshan chulin" to Yangqi line overrides

## Flagged for Human Review

1. **Gyeongheo's birth year**: Sources disagree between 1846 and 1849. The Jogye Order and Terebess use 1846; Wikipedia and some English sources use 1849. Current data retains 1846.

2. **Taego Bou -> Seosan lineage**: The traditional Jogye Order lineage claims a chain from Taego through five intermediaries to Seosan. Some modern scholars argue this is a retrospective construction. Currently marked "disputed." If the intermediaries (Gugok Gagun, Byeokgye Jeongsim, Byeoksong Jieom, Buyong Yeonggwan) are added to the database, this could be replaced with a proper chain.

3. **Seosan -> Gyeongheo lineage**: Similar issue. The traditional chain goes through Pyeonyang Eongi, Pungdam Uisim, Woldam Seoljye, Hwanseong Jian, Yongam Hyeeon, and others. Currently marked "disputed." Adding these intermediaries would resolve the temporal gap.

4. **Hyewol -> Jinje**: Jinje's dharma transmission was actually through Unbong Seongsu (student of Hyewol) and then Woonbong. Currently connected directly to Hyewol as secondary. Adding Unbong and Woonbong as intermediaries would be more accurate.

5. **Wonhyo as orphan**: Wonhyo is now correctly disconnected from the lineage graph since the false Hongren transmission was removed. He belongs in the encyclopedia as a foundational figure for Korean Buddhism, but he has no Chan/Seon lineage connection. Consider whether orphan status is acceptable for foundational figures.

6. **Naong -> Gihwa temporal overlap**: Gihwa was born in 1376, the year Naong died. While Gihwa is traditionally listed as inheriting Naong's dharma, it was likely through Naong's senior disciples rather than directly. Currently kept as-is since it matches traditional sources.

7. **Hwanam Honsu birth year**: Listed as 1320, same as Naong Hyegeun. Sources confirm they were contemporaries and neighbors on Mt. Odae. The same-year birth generates a validator warning but is historically accurate -- Hwanam came to Naong as an established practitioner, not a young student.

8. **Kusan Sunim birth year**: Sources vary between 1908, 1909, and 1910. Currently listed as 1908 in the database.

## School Balance Assessment

### Current State After Review
- **Seon** (general/historical): 11 masters (was 3, added 8 Nine Mountain founders + Baegun + Muhak + Hwanam)
- **Jogye**: 22 masters (was 14, added Suwol, Hyewol, Dongsan, Yongseong, Jinje + existing)
- **Kwan Um**: 1 master (Seung Sahn only)
- **Taego Order**: 1 master (Taego Bou only)
- **Total Korean cluster**: 36 masters (was 19)

### Assessment
The cluster has nearly doubled from 19 to 36 masters, which is a significant improvement. However, for a tradition spanning 1,200+ years that is the dominant Buddhist institution in modern South Korea (the Jogye Order alone has over 13,000 monks and nuns, 3,000+ temples), this is still a modest representation. Key gaps remain:

**Still Missing (candidates for future addition):**
- Joseon-era intermediary patriarchs (Pyeonyang Eongi, Pungdam Uisim, Hwanseong Jian, etc.)
- Uisang (625-702), Wonhyo's companion who founded Korean Hwaeom
- Additional modern Kwan Um teachers (Dae Kwang, Soeng Hyang, etc.)
- Songdam (b. 1929), "Songdam in the north, Jinje in the south"
- Unbong Seongsu (Hyewol's dharma heir, Jinje's lineage)
- Bowol and other Mangong disciples
- Byeoksong Jieom and other Joseon-era figures

A comprehensive Korean cluster would ideally have 50-70 masters to properly represent the tradition's depth. The current 36 covers the most essential figures.

## Cross-Tradition Observations

Korean Seon was shaped by multiple waves of transmission from Chinese Chan:

1. **Tang Dynasty (8th-9th c.)**: The Nine Mountain founders all studied in Tang China, primarily in the Mazu Daoyi lineage through disciples like Xitang Zhizang, Yanguan Qian, and Magu Baozhe. One school (Sumisan) transmitted Caodong through Yunju Daoying.

2. **Song Dynasty (12th c.)**: Bojo Jinul never went to China but was transformed by reading Dahui Zonggao's recorded sayings, introducing hwadu practice to Korea.

3. **Yuan Dynasty (14th c.)**: Three Goryeo masters -- Taego Bou, Naong Hyegeun, and Baegun Gyeonghan -- all traveled to Yuan China and studied under Shiwu Qinggong (Stonehouse) and Pingshan Chulin of the Linji/Yangqi lineage. This re-established direct Chinese-Korean transmission.

4. **Linji dominance**: Korean Seon is overwhelmingly Linji-derived. The single Caodong lineage (Sumisan/Ieom) did not survive as a distinct school. This means Korean Buddhism shares its deepest roots with Japanese Rinzai rather than Soto Zen.

5. **Chinese masters in the database connected to Korean students**: Baizhang Huaihai, Xitang Zhizang, Yanguan Qian, Mazu Daoyi, Yunju Daoying, Shiwu Qinggong, Pingshan Chulin, and (textually) Dahui Zonggao.

## Sources Consulted

- Nine mountain schools -- Wikipedia (https://en.wikipedia.org/wiki/Nine_mountain_schools)
- Korean Seon -- Wikipedia (https://en.wikipedia.org/wiki/Korean_Seon)
- Jogye Order -- Wikipedia (https://en.wikipedia.org/wiki/Jogye_Order)
- Jinul -- Wikipedia (https://en.wikipedia.org/wiki/Jinul)
- Gyeongheo -- Wikipedia (https://en.wikipedia.org/wiki/Gyeongheo)
- Seongcheol -- Wikipedia (https://en.wikipedia.org/wiki/Seongcheol)
- Seungsahn -- Wikipedia (https://en.wikipedia.org/wiki/Seungsahn)
- Taego Bou -- Wikipedia (https://en.wikipedia.org/wiki/Taego_Bou)
- Wonhyo -- Wikipedia (https://en.wikipedia.org/wiki/Wonhyo)
- Hyobong Hangnul -- Wikipedia (https://en.wikipedia.org/wiki/Hyobong_Hangnul)
- Daehaeng -- Wikipedia (https://en.wikipedia.org/wiki/Daehaeng)
- Beopjeong -- Wikipedia (https://en.wikipedia.org/wiki/Beopjeong)
- Hanam Jungwon -- Wikipedia (https://en.wikipedia.org/wiki/Hanam_Jungwon)
- Terebess Zen lineage charts (https://terebess.hu/zen/korean-lineage.html)
- Terebess master biographies (Gyeongheo, Hyobong, Seongcheol, Naong, Baegun, etc.)
- Jogye Order of Korean Buddhism official site (https://jokb.org)
- Jinje Seonsa official site (http://www.jinje.kr/eng/)
- Seon Buddhism organization (http://www.buddhism.org)
- Kwan Um School of Zen Europe lineage page
- Dale's Korean Temple Adventures (https://koreantempleguide.com)
- Encyclopedia of Buddhism (https://encyclopediaofbuddhism.org)
- Brill Journal of Chan Buddhism, Vol. 1, "Have a Korean Lineage and Transmit a Chinese One Too"
- Hanmaum Seon Center (https://hanmaumseoncenter.org)
