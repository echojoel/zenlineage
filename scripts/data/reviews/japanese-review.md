# Japanese Zen -- Scholar Review

## Changes Made

### Masters Added
1. **Suio Genro** (1717-1789) -- Rinzai. One of Hakuin Ekaku's two greatest disciples (alongside Torei Enji), known as the "two divine legs of Hakuin." Became second abbot of Shoinji after Hakuin's retirement. Important for continuity of Hakuin's teaching.
2. **Manzan Dohaku** (1636-1715) -- Soto. Key Edo-period reformer, dharma heir of Gesshu Soko. Led the isshi-injo reform movement that restored face-to-face dharma transmission as the standard for Soto succession (ruling issued 1703). Co-developed monastic regulations with Gesshu.
3. **Muan Xingtao / Mokuan Shoto** (1611-1684) -- Obaku. Second patriarch of the Obaku school, dharma heir of Ingen Ryuki. Cultivated the greatest number of Japanese Obaku disciples, enabling the sect's expansion throughout Japan. One of the "Three Brushes of Obaku."
4. **Jifei Ruyi / Sokuhi Nyoitsu** (1616-1671) -- Obaku. Dharma heir of Ingen Ryuki, one of the three founding leaders of Obaku in Japan. Followed Ingen from China to Nagasaki in 1657. One of the "Three Brushes of Obaku."
5. **Kubota Jiun** (b. 1932) -- Sanbo-Zen. Third abbot of Sanbo-Zen (1989-2004), dharma successor of Yamada Koun.
6. **Yamada Ryoun** (b. 1940) -- Sanbo-Zen. Fourth and current abbot of Sanbo-Zen (from 2004), son of Yamada Koun, dharma successor of Yamada Koun.
7. **Koryu Osaka** (1901-1985) -- Rinzai. Lay Rinzai master who taught Taizan Maezumi the Inzan koan curriculum. Gave Maezumi inka in 1972/73. Important link between Rinzai koan practice and the White Plum Asanga lineage.
8. **Gento Sokuchu** (1729-1807) -- Soto. 50th abbot of Eiheiji, continued the Manzan-Menzan reform movement. Compiled the Eihei Rules of Purity. Teacher of the famous poet-monk Ryokan.

### Masters Corrected
1. **Nanpo Jomyo (formerly Nanpu Shaoming)**
   - School: `Linji` -> `Rinzai` (he was Japanese, born in Suruga Province, 1235-1308)
   - Slug: `nanpu-shaoming` -> `nanpo-jomyo` (use Japanese name as primary since he was Japanese)
   - Added dates: birth 1235, death 1308 (both well-attested in historical sources)
   - Added names: "Nanpo Jomyo", "Daio Kokushi", "Nanpu Shaoming" (kept as alias), Chinese characters
   - Updated biography text
   - This is the founder of the O-To-Kan lineage, the sole surviving Rinzai lineage; he was miscategorized as Chinese Linji

### Transmissions Added
1. Hakuin Ekaku -> Suio Genro (primary)
2. Gesshu Soko -> Manzan Dohaku (primary)
3. Ingen Ryuki -> Muan Xingtao (primary)
4. Ingen Ryuki -> Jifei Ruyi (primary)
5. Yamada Koun -> Kubota Jiun (primary)
6. Yamada Koun -> Yamada Ryoun (primary)
7. Koryu Osaka -> Taizan Maezumi (secondary -- Maezumi had three teachers: his father Kuroda Hakujun in Soto, Yasutani Hakuun in Sanbo-Zen, and Koryu Osaka in Rinzai)
8. Menzan Zuiho -> Gento Sokuchu (dharma -- same reform lineage, not direct teacher-student)

### Transmissions Corrected
1. Removed duplicate Xutang Zhiyu -> Nanpo Jomyo transmission (one already existed in the dataset)

### Practice Descriptions Updated
No changes needed. The existing practice descriptions for Soto, Rinzai, Sanbo-Zen, and Obaku in school-taxonomy.ts are accurate and well-written.

### School Summaries Updated
No changes needed. The existing summaries are comprehensive and historically accurate.

### School Taxonomy Overrides Updated
1. Added Rinzai override names: nanpo jomyo, daio kokushi, suio genro, koryu osaka
2. Added Sanbo-Zen override names: kubota jiun, yamada ryoun
3. Added Obaku override names: muan xingtao, mokuan shoto, jifei ruyi, sokuhi nyoitsu

## Flagged for Human Review

1. **Eisai's lineage connection**: The existing transmission `Huanglong Huinan -> Myoan Eisai` is typed "dharma" which is appropriate since Eisai's actual teacher was Xuan Huaichang (Koan Esho), not Huanglong Huinan directly. However, Xuan Huaichang is not in the dataset. Consider adding him or updating the connection to a more precise intermediate master.

2. **Takuan Soho's teacher**: The existing transmission `Shuho Myocho -> Takuan Soho` is typed "dharma" representing the Daitokuji lineage. Takuan's actual teacher was Itto Shoteki (1539-1612), who is not in the dataset. Consider adding Itto Shoteki.

3. **Katagiri, Jiyu-Kennett, Kobun Chino lineage links**: These three modern Soto masters have "dharma" type transmissions from Keizan Jokin, spanning 600+ years. Their actual teachers were:
   - Katagiri: trained at Eiheiji, assisted Shunryu Suzuki at SFZC
   - Jiyu-Kennett: received dharma transmission from Koho Keido Chisan at Sojiji (1963)
   - Kobun Chino: trained at Eiheiji, assisted Suzuki Roshi at SFZC
   Consider adding their direct teachers or at minimum adding a note in their biographies.

4. **Philip Kapleau's status**: Kapleau is listed as Sanbo-Zen with a transmission from Yasutani. However, sources indicate he completed about half of the Harada-Yasutani koan curriculum and was authorized to teach but did not receive formal dharma transmission. This is a contested point.

5. **D.T. Suzuki's transmission from Soyen Shaku**: The existing "primary" transmission from Soyen Shaku to D.T. Suzuki may be overstated. Suzuki was a lay student and scholar, not a dharma heir in the formal sense. Consider changing this to "dharma" type.

6. **Suio Genro birth year**: Most sources say 1717, but one art catalogue lists 1716. I used 1717 as the consensus date.

7. **Gasan Jito's relationship to Hakuin**: Sources note Gasan "did not belong to the close circle of disciples and was probably not even one of Hakuin's dharma heirs," having completed his koan training with Torei Enji rather than Hakuin directly. The existing primary transmission from Hakuin to Gasan may need review.

8. **Manzan Dohaku birth year**: Terebess lists 1635, while academic sources use 1636. I used 1636 following the Bodiford academic source.

## School Balance Assessment

| School | Before | After | Notes |
|--------|--------|-------|-------|
| Soto | 88 | 90 | Added Manzan Dohaku, Gento Sokuchu |
| Rinzai | 62 | 65 | Added Suio Genro, Koryu Osaka; moved Nanpo Jomyo from Linji |
| Sanbo-Zen | 6 | 8 | Added Kubota Jiun, Yamada Ryoun |
| Obaku | 2 | 4 | Added Muan Xingtao, Jifei Ruyi |

**Assessment**: Soto and Rinzai are well-represented with comprehensive lineage chains. Obaku was significantly underrepresented (only Ingen and Tetsugen) and now includes the three founders. Sanbo-Zen now includes the institutional succession line through all four abbots. The most significant correction was reclassifying Nanpo Jomyo from Linji to Rinzai -- as the founder of the O-To-Kan lineage, he is arguably the single most important figure in Japanese Rinzai Zen history.

## Cross-Tradition Observations

1. **Caodong -> Soto bridge**: The transmission Tiantong Rujing (Caodong) -> Dogen (Soto) is the crucial cross-tradition link. Correctly represented.

2. **Yangqi line -> Rinzai bridge**: Xutang Zhiyu (Yangqi line) -> Nanpo Jomyo (Rinzai) is the key transmission bringing Linji Chan to Japan. Now correctly represented with Nanpo classified as Rinzai.

3. **Linji -> Obaku bridge**: Miyun Yuanwu (Linji) -> Ingen Ryuki (Obaku) represents the late-Ming Chinese Linji tradition arriving in Japan as a distinct school. Correctly represented.

4. **Soto-Rinzai-Sanbo synthesis**: The Harada-Yasutani lineage bridged Soto and Rinzai. Harada Daiun Sogaku received Soto training but also studied koans under Rinzai teachers (Dokutan Sosan, secondary transmission already in data). This cross-tradition synthesis is the defining feature of Sanbo-Zen.

5. **Maezumi's triple lineage**: Maezumi received transmission in three lines -- Soto (from his father), Rinzai/Inzan line (from Koryu Osaka, now added as secondary), and Sanbo-Zen (from Yasutani). This makes the White Plum Asanga one of the most cross-pollinated lineages in Zen history.

6. **Huanglong -> Rinzai early connection**: Eisai's Huanglong lineage (through Xuan Huaichang) was the first Rinzai transmission to Japan but did not survive. All modern Rinzai comes through the Yangqi line via Nanpo Jomyo.

## Sources Consulted

- Rinzai school -- Wikipedia (https://en.wikipedia.org/wiki/Rinzai_school)
- Otokan -- Wikipedia (https://en.wikipedia.org/wiki/Otokan)
- Terebess Zen collection (https://terebess.hu/zen/) -- individual master pages
- Soto Zen Net official history (https://www.sotozen.com/eng/about/history/)
- Sanbo-Zen official history (http://www.sanbo-zen.org/histry_e.html)
- Obaku -- Wikipedia (https://en.wikipedia.org/wiki/%C5%8Cbaku)
- TRUE IMAGE: Ingen and Obaku Zen Lineage (https://ingen.arizona.edu/)
- San Francisco Zen Center lineage (https://www.sfzc.org/about/San-Francisco-Zen-Center-Lineage)
- Taizan Maezumi -- Wikipedia (https://en.wikipedia.org/wiki/Taizan_Maezumi)
- Philip Kapleau -- Wikipedia (https://en.wikipedia.org/wiki/Philip_Kapleau)
- Sanbo Kyodan -- Wikipedia (https://en.wikipedia.org/wiki/Sanbo_Kyodan)
- Hakuin Ekaku -- Wikipedia (https://en.wikipedia.org/wiki/Hakuin_Ekaku)
- Bankei Yotaku -- Wikipedia (https://en.wikipedia.org/wiki/Bankei_Y%C5%8Dtaku)
- Bodiford, William M. "Dharma Transmission in Soto Zen: Manzan Dohaku's Reform Movement." Monumenta Nipponica 46:4 (1991)
- Riggs, David E. "The Life of Menzan Zuiho, Founder of Dogen Zen"
- Baroni, Helen J. Iron Eyes: The Life and Teachings of Obaku Zen Master Tetsugen Doko (SUNY Press)
- Daiyuzenji Rinzai Zen Temple lineage page (https://daiyuzenji.org/history)
