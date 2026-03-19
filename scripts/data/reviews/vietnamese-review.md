# Vietnamese Thien -- Scholar Review

## Changes Made

### Masters Added (5)

1. **Phap Hien** (`e3UYLRqagiOiewgpOxF7H`) -- School: Thien
   - Direct disciple of Vinitaruci, first patriarch of the Vinitaruci school after its founder
   - Death: c. 626 (low confidence)
   - Names: Phap Hien (vi), 法賢 (zh)

2. **Thao Duong** (`RTBARhH0Xlvny4w97eFva`) -- School: Thien
   - Founder of the third Thien school in Vietnam (11th century)
   - Student of Xuedou Chongxian (Yunmen lineage), came from China to Champa, captured as prisoner of war
   - Given title Quoc Su (National Teacher) by King Ly Thanh Tong (c. 1069)
   - Dates unknown

3. **Khuong Viet** (`SClw-VzlP2BT8RhelJAZf`) -- School: Thien
   - Birth name: Ngo Chan Luu (933--1011)
   - 4th generation of Vo Ngon Thong lineage
   - First Tang Thong (Sangharaja) of Vietnamese Buddhism (969 CE)
   - Advisor to Dinh and Early Le dynasties
   - Currently an orphan node (intermediate generations not in dataset)

4. **Tue Trung Thuong Si** (`rcf4tYiBHQbvNOVpWrxPX`) -- School: Thien
   - Birth name: Tran Tung (1230--1291)
   - Royal prince, military general who repelled Mongol invasions
   - Teacher of Tran Nhan Tong (founder of Truc Lam)
   - Lay practitioner in the Vo Ngon Thong lineage (studied under Thien master Tieu Dao)
   - Critical link explaining how Tran Nhan Tong came to Zen

5. **Minh Hai Phap Bao** (`ddOF2agwYznlYXgh350Ds`) -- School: Lam Te
   - 1670--1746, 34th generation of Linji school
   - Founded the Lam Te Chuc Thanh lineage at Chuc Thanh temple in Hoi An
   - Major figure in spreading Lam Te Buddhism in central Vietnam
   - Connected to Nguyen Thieu as dharma transmission

### Masters Corrected (multiple locale and data fixes)

1. **Vo Ngon Thong**: Added birth year 759 (circa, medium confidence). Changed dharma name locale from "en" to "vi".
2. **Vinitaruci**: Fixed locale for Vietnamese alias from "en" to "vi". Removed duplicate alias entry.
3. **Thich Thanh Tu**: Added birth name Tran Huu Phuoc. Changed dharma name locale from "en" to "vi".
4. **Van Hanh**: Changed dharma name locale from "en" to "vi".
5. **Lieu Quan**: Changed locale from "en" to "vi" for Vietnamese names.
6. **Nguyen Thieu**: Changed locale from "en" to "vi" for Vietnamese names (Sieu Bach).
7. **Minh Hoang Tu Dung**: Changed locale from "en" to "vi".
8. **Tran Nhan Tong**: Changed locale from "en" to "vi" for all Vietnamese names.
9. **Phap Loa**: Changed locale from "en" to "vi".
10. **Huyen Quang**: Changed locale from "en" to "vi".
11. **Nhat Dinh**: Changed locale from "en" to "vi".
12. **Thich Nhat Hanh**: Changed locale from "en" to "vi" for Vietnamese names.
13. **Chan Khong**: Changed locale from "en" to "vi" for Vietnamese names.
14. **Thich Chan That**: Changed locale from "en" to "vi".
15. **Remaining Lam Te masters** (Te An Luu Quang, Dai Tue Chieu Nhien, Dao Minh Pho Tinh, Hai Thieu Cuong Ky, Thich Tue Minh): Changed locale for diacritical Vietnamese names from "en" to "vi".

### Transmissions Added (5)

1. **Vinitaruci -> Phap Hien** (primary) -- Direct student, first patriarch after founder
2. **Tue Trung Thuong Si -> Tran Nhan Tong** (primary) -- Well-documented teacher-student relationship
3. **Xuedou Chongxian -> Thao Duong** (primary) -- Thao Duong studied under Xuedou before going to Champa
4. **Tran Nhan Tong -> Huyen Quang** (secondary) -- Huyen Quang studied with both Tran Nhan Tong and Phap Loa
5. **Nguyen Thieu -> Minh Hai Phap Bao** (dharma) -- Chuc Thanh lineage transmission

### Transmissions Corrected (3 removed)

1. **REMOVED: Vinitaruci -> Van Hanh** (`tx_vanhanh_vinitaruci_01`)
   - Reason: Van Hanh was the 12th generation of the Vinitaruci school, not a direct student. There are approximately 11 intermediate generations between Vinitaruci (d. 594) and Van Hanh (938--1018). The direct student was Phap Hien.
   - Van Hanh is now an orphan node -- connecting him properly requires adding ~11 intermediate masters.

2. **REMOVED: Vo Ngon Thong -> Tran Nhan Tong** (`tx_trannhantong_vongon_01`)
   - Reason: Vo Ngon Thong died in 826 CE; Tran Nhan Tong was born in 1258 CE -- a gap of over 400 years. Tran Nhan Tong's actual teacher was Tue Trung Thuong Si (1230--1291), a lay practitioner in the Vo Ngon Thong lineage. Replaced with Tue Trung -> Tran Nhan Tong.

3. **REMOVED: Tran Nhan Tong -> Thich Thanh Tu** (`SoDdTdQBG8UMnsVNuBaXW`)
   - Reason: Tran Nhan Tong died in 1308; Thich Thanh Tu was born in 1924 -- a gap of over 600 years. Thich Thanh Tu revived the Truc Lam tradition but was not a direct or dharma-lineage student. He was ordained by Thich Thien Hoa in the Lam Te lineage and independently chose to revive Truc Lam teachings.
   - Thich Thanh Tu is now an orphan node -- his actual lineage is in the Lam Te school (ordination by Thich Thien Hoa), but he chose to operate as a Truc Lam revivalist. This is a legitimate complexity.

### Practice Descriptions Updated

No changes to practice descriptions -- the existing descriptions for Thien, Lam Te, Truc Lam, and Plum Village are accurate, well-written, and historically grounded. They correctly capture:
- Thien: Combined meditation + Pure Land devotion
- Lam Te: thoai dau (huatou) practice, Lieu Quan line
- Truc Lam: Tran Nhan Tong's synthesis, Thich Thanh Tu revival, "tri tam kien tanh"
- Plum Village: Mindful walking/eating/breathing, Fourteen Mindfulness Trainings, Beginning Anew

### School Summaries Updated

No changes needed -- the existing summaries are comprehensive and historically accurate.

### School Taxonomy Overrides Updated

- Added to `thien` overrides: phap hien, thao duong, khuong viet, tue trung thuong si
- Added new `lam-te` override block: minh hai phap bao

## Flagged for Human Review

1. **Van Hanh orphan status**: Van Hanh (938--1018) was the 12th generation patriarch of the Vinitaruci school. Connecting him properly requires adding approximately 11 intermediate Vietnamese masters from the Vinitaruci lineage (generations 2--11). The complete list is documented in Vietnamese Buddhist histories but the intermediate figures are not well-known enough to merit individual encyclopedia entries. A human decision is needed: add intermediate masters as minimal entries, or accept Van Hanh as an orphan with a note about his lineage position.

2. **Thich Thanh Tu lineage ambiguity**: Thich Thanh Tu was ordained in the Lam Te lineage (by Thich Thien Hoa) but chose to revive the Truc Lam tradition. His school classification as "Truc Lam" is correct in terms of his teaching, but his formal lineage is Lam Te. This is historically accurate -- he deliberately positioned himself as continuing Tran Nhan Tong's work rather than his ordination lineage. He is currently an orphan node.

3. **Khuong Viet orphan status**: Khuong Viet was 4th generation Vo Ngon Thong lineage. Connecting him requires adding 2--3 intermediate masters (Cam Thanh, etc.). Same decision needed as for Van Hanh.

4. **Lieu Quan birth year**: Sources disagree -- a 1748 stele gives 1667, while other sources give 1670. The current value of 1670 with "circa" precision is a reasonable compromise. Consider updating to 1667 if the stele is accepted as the primary source.

5. **Huyen Quang / Phap Loa / Tran Nhan Tong temporal anomaly**: Huyen Quang (b. 1254) was born before both his teachers Tran Nhan Tong (b. 1258) and Phap Loa (b. 1284). This generates temporal warnings but is historically correct -- Huyen Quang was an older scholar who came to Buddhist practice later in life and studied under younger masters. The data is accurate; the temporal warnings should be accepted.

6. **Thao Duong dates**: No birth or death dates are known with certainty. He arrived in Vietnam c. 1069 (during the Ly dynasty's campaign against Champa). Consider adding approximate dates if better sources are found.

7. **Tuệ Trung Thượng Sĩ school classification**: Classified as "Thien" (generic Vietnamese Zen). He was a lay practitioner in the Vo Ngon Thong lineage -- not formally part of any of the four sub-schools. "Thien" is the correct classification.

## School Balance Assessment

The Vietnamese cluster grew from **19 to 24 masters** (+26%). While this is still smaller than the Chinese (Chan, ~200+) or Japanese (Zen, ~100+) clusters, it now better represents the key historical figures:

**Current coverage by school:**
- Thien (general): 7 masters (Vinitaruci, Vo Ngon Thong, Van Hanh, Phap Hien, Thao Duong, Khuong Viet, Tue Trung Thuong Si)
- Lam Te: 11 masters (Nguyen Thieu through Thich Chan That, plus Minh Hai Phap Bao)
- Truc Lam: 4 masters (Tran Nhan Tong, Phap Loa, Huyen Quang, Thich Thanh Tu)
- Plum Village: 2 masters (Thich Nhat Hanh, Chan Khong)

**What would be ideal (30--40 masters total):**
- The Vinitaruci lineage spanned 19 generations (580--1213). Adding even 3--5 key intermediate patriarchs (e.g., Phap Thuan, Ma Ha from gen 10; Thien Ong, Sung Pham from gen 11) would significantly improve coverage.
- The Vo Ngon Thong lineage lasted 17 generations. Adding Cam Thanh (early patriarch) and Da Bao (Khuong Viet's student) would help.
- The modern period could include Thich Tri Thu (1909--1984, prominent Lam Te master) and Thich Quang Duc (1897--1963, famous for self-immolation protest).
- The Plum Village tradition could include 1--2 senior dharma teachers (e.g., Sister Chan Duc, Brother Phap Dung).

## Cross-Tradition Observations

The Vietnamese Thien tradition is notable for its deep roots in Chinese Chan:

1. **Sengcan (3rd Chan Patriarch) -> Vinitaruci**: The earliest Thien school traces directly to the Chinese patriarchal lineage, predating most other transmissions outside China.

2. **Baizhang Huaihai -> Vo Ngon Thong**: The second Thien school connects to one of the most important Chan masters, through whom the Vo Ngon Thong lineage carried Mazu Daoyi's Hongzhou school teachings to Vietnam.

3. **Xuedou Chongxian -> Thao Duong**: The third school brought the Yunmen tradition to Vietnam, including its emphasis on poetry and Pure Land integration.

4. **Muchen Daomin -> Nguyen Thieu**: The Lam Te school in Vietnam traces to the late-Ming Linji revival through Miyun Yuanwu's lineage, the same lineage that produced the Japanese Obaku school via Ingen Ryuki.

5. **Linji school dual transmission**: Both the Vietnamese Lam Te school and the Japanese Obaku school descend from the same late-Ming Chinese Linji revival, making them dharma siblings separated by geography.

## Sources Consulted

- Wikipedia articles: Thien, Buddhism in Vietnam, Vinitaruci, Wu Yantong, Van Hanh, Tran Nhan Tong, Phap Loa, Huyen Quang, Lieu Quan, Thich Thanh Tu, Thich Nhat Hanh, Tue Trung, Khuong Viet
- Encyclopedia of Buddhism: Vietnamese Thien, Buddhism in Vietnam
- Quang Duc Buddhist site: Thao Duong Zen School, Minh Hai Phap Bao biography
- Terebess: Vietnamese Zen Masters collection
- Plum Village official site: Lineage information, Dharma Teachers
- Parallax Press / Mindfulness Bell: Our Patriarch Lieu Quan, Buddhism in Vietnam special section
- The Way of Zen in Vietnam (Nguyen Giac, 2020)
- MDPI Religions: "(Re-)invented Chan Lineage" article on Thich Thanh Tu's Truc Lam revival
- Yen Tu Tung Lam: Truc Lam Yen Tu history
- Dharma Wheel forums: About the Lieu Quan School of Thien
- Thich Nhat Hanh lineage documents (Order of Interbeing)
