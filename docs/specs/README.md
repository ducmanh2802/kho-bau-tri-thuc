# BỘ TÀI LIỆU ĐẶC TẢ — KHO BÁU TRI THỨC LỚP 1

Bốn tài liệu ở `docs/specs/` + hai tài liệu kế hoạch ở `docs/plan/` mô tả **toàn bộ vòng đời**
của sản phẩm, từ nghiệp vụ tới từng test. Đọc theo thứ tự dưới đây nếu bạn mới vào repo.

| # | Tài liệu | Trả lời câu hỏi | Dài bao nhiêu |
|---|---|---|---|
| 1 | [`BRD.md`](BRD.md) | *Tại sao làm, làm gì, không làm gì, thành công đo thế nào?* | 6 mục tiêu BG, 8 rủi ro, Business DoD |
| 2 | [`SRS.md`](SRS.md) | *Phần mềm phải làm gì, đạt ngưỡng nào?* | 88 FR · 25 NFR · 19 DC · 11 IF |
| 3 | [`ARCHITECTURE.md`](ARCHITECTURE.md) | *Ghép như thế nào, dữ liệu đi đâu, vì sao chọn vậy?* | 18 ADR, sơ đồ tầng + luồng dữ liệu |
| 4 | [`RTM.md`](RTM.md) | *Yêu cầu nào được chứng minh ở đâu? Test nào không phục vụ gì?* | ma trận xuôi + ngược, tổng kết độ phủ |
| 5 | [`../plan/TASK_PLAN.md`](../plan/TASK_PLAN.md) | *Đã làm gì (P25→P43) và sẽ làm gì tiếp (EP-A…EP-F)?* | WBS 12 gói, 4 milestone |
| 6 | [`../plan/TEST_PLAN.md`](../plan/TEST_PLAN.md) | *Kiểm bằng lớp nào, chạy lệnh nào, khi nào xanh?* | 5 lớp, 30 probe, bảng "đổi gì → chạy gì" |
| 7 | [`../plan/TEST_CASES.md`](../plan/TEST_CASES.md) | *Ca kiểm thử nào, AC nguồn ở đâu, verdict gì?* | 6 US · 42 TC · 4 phép ablation · exit criteria viết trước |

## Quy ước chung của bộ tài liệu

1. **Chỉ số liệu đo được.** Mọi con số (31 trò chơi, 475 câu thi, 1542 test / 124 file,
   213.7 kB entry + 428.0 kB boot graph, 8 dependency runtime, 19 key…) đo ngày **2026-11-04** — lần cuối
   ngay sau **T49B** `e969f1c` (đóng `DEF-021`: **hai nửa của cùng một lời hứa**. Nửa đường vào —
   `grep -c "id: '" src/data/shopCatalog.ts` = **41** món chia theo 7 `type` (mũ 8 · thú 7 · áo 6 · nền 6 ·
   khung 5 · kính 5 · ba lô 4) trong khi tab của `AvatarShopScreen` chỉ khai 5 nhánh
   `mascot|hat|glasses|backpack|pet` ⇒ **17** món (áo 6 + nền 6 + khung 5) không thuộc tab nào, bé không
   bao giờ thấy thẻ lẫn nút "Mở khóa" dù `buyShopItem()` vẫn nhận id của chúng. Nửa thứ hai nặng hơn vì
   bé **đã trả sao**: ô preview chỉ ghép 4 lớp, nên nếu chỉ thêm tab thì mặc áo/nền/khung vào nhân vật vẫn
   đứng nguyên. `SHOP_TABS` (8 tab, id kiểu `'mascot' | ShopItemType`) + `EQUIP_LAYER` khai là
   `Record<ShopItemType, string>` chứ không phải mảng — thêm một `type` mới mà chưa có lớp thì `tsc` đỏ,
   không chờ ai nhớ; **1** file test mới `tests/t49b-shop-tabs-cover-catalog.test.ts` (8) ⇒ +8 test; probe
   trên `dist/` **QA PASS 5 bước** (sao trừ thật `284→278→263→253`, preview lớn dần `🦊` → `🦊👕` →
   `🌊🦊👕` → `🌊🦊👕⭐`) và **QA FAIL 6 lỗi ở `failedAt: A`** khi đột biến về bản cũ, đặt cùng 3 log đột
   biến trong `evidence/2026-11-04-T49B/` (5 ảnh) ⇒ vẫn **30** probe QA, vẫn **42** service module; `src/`
   đổi nên entry **đổi hash** (`chzUu7ig` → `vYzkzZ5R`) còn **kB và boot graph đứng nguyên**
   (213.7 kB · `438305` byte),
   đợt **T49A** `f4a7c21` liền trước (đóng `DEF-020(b)`: cùng khuôn với máy gắp nhưng **nặng hơn** vì bé mất tài
   nguyên — `grep -rn "^\s*StorageService\.save[A-Za-z]*(" src --include=*.ts --include=*.tsx | wc -l`
   in ra **72** lời gọi ghi kiểu câu lệnh, tức **không đọc** giá trị `false` mà `writeJSON`
   (`storage.ts:302`) trả về khi `setItem` ném; `claimLevelRewards` và `buyShopItem` nằm trong số đó,
   nên hộp "Chúc mừng bé lên cấp" vẫn bật và biên lai "Quà cấp độ" vẫn ghi được (biên lai nằm ở key
   `kho_bau_parent_settings`, key không bị chặn) trong khi sao không nằm xuống máy, còn nút "Mua" bắn
   confetti dù sao chưa trừ và món chưa mở khoá. `claimLevelRewards` nay ghi hồ sơ **trước** và trả
   `claimed: []` khi bản ghi hỏng; `buyShopItem` trả `reason: 'storage-unavailable'` và
   `AvatarShopScreen` có nhánh nói thẳng đó là lỗi *của máy*. **1** file test mới
   `tests/t49a-reward-write-honest.test.ts` (13) ⇒ +13 test; probe chặn `Storage.prototype.setItem`
   trên `dist/` đặt trong `evidence/2026-11-04-T49A/` (4 ảnh, 5 bước) ⇒ vẫn **30** probe QA, vẫn **42**
   service module; `src/` đổi nên entry **đổi cả hash lẫn kB** (`B-vz_G_Z` → `chzUu7ig`,
   213.6 → **213.7**),
   đợt **T48B cộng merge `487cddb`** liền trước (nội dung `origin/main` `d6771f5` vào thêm `src/services/sound.ts` +
   2 component cờ tướng ⇒ `src/` đổi nên entry **đổi cả hash lẫn kB**: `BO_jehy4` → `B-vz_G_Z`,
   211.1 → **213.6**, component `.tsx` **95 → 97**, trong khi **test / service / probe / game không đổi**;
   cũng merge đó **xoá `package-lock.json`** — lần thứ ba (`3727f04`, `fd3e7da`, `d6771f5` — nên khôi phục ở
   `5753844`, vì cả 4 workflow chạy `npm ci`. Máy gắp **hứa** những gì nó chưa làm được: `StorageService.drawGacha()` bỏ qua giá trị
   `false` của `writeJSON` — phép đo `grep -rn "StorageService\.save" src` in ra **79** dòng nhưng chỉ **78**
   là lời gọi thật (`readingEngine.ts:536` là chú thích), và đúng **1** lời gọi đọc kết quả (`storage.ts:1099`) — nên khi trình duyệt chặn ghi (Safari private mode) hoặc hết dung lượng, hộp kết quả vẫn bắn
   confetti và in "Đã lưu vào Bộ Sưu Tập!" rồi tải lại trang sticker lẫn vé đều như cũ; `drawGacha` nay trả
   `reason: 'storage-unavailable'` và `GachaMachineScreen` có nhãn riêng cho thất bại *của máy*, đồng thời
   câu "đã gắp đủ 5 lượt" được thay bằng số lượt **thật** theo cài đặt ba mẹ (`dailyLimitLabel`, phần logic
   đã sửa ở T45A nhưng câu chữ vẫn mang hằng số 5). **1** file test mới `tests/t48b-gacha-result-honest.test.ts`
   (8) ⇒ +8 test; probe dựng `Storage.prototype.setItem` ném trên `dist/` đặt trong `evidence/2026-11-04-T48B/`
   ⇒ vẫn **30** probe QA, vẫn **42** service module; entry **đổi hash** (`l9C6a6LW` → `BO_jehy4`) còn
   **kB đứng nguyên** 211.1),
   đợt **T48A** liền trước (đóng `DEF-019(d)`: `src/hooks/useSpeak.ts` gán **cùng một** state `played` cho cả
   `utterance.onend` *lẫn* `utterance.onerror`, mà hai biến cố là hai bằng chứng ngược nhau ⇒ bé bấm loa,
   không nghe thấy gì, nút vẫn hứa "Đã đọc xong, chạm để nghe lại" (`aria-label` của `LessonPlayerModal`).
   Sửa theo lý do: `canceled`/`interrupted`/`rejected`/`audio-busy` (kênh bị giành) ⇒ `idle` bấm lại được;
   lỗi từ chối thật ⇒ `unavailable`. **1** hook đổi, **1** file test mới `tests/t48a-speak-error-not-played.test.ts`
   (5) ⇒ +5 test; probe mới đặt trong `evidence/2026-11-04-T48A/` ⇒ vẫn **30** probe QA, vẫn **42** service
   module; entry **đổi hash** (`oKg0XRrb` → `l9C6a6LW`) còn **kB đứng nguyên** 211.1),
   đợt **T47G** liền trước (đóng `DEF-018(b)`: lượt **sai** chỉ có tiếng bíp ở **14** trò chơi — đo, không suy
   luận: 30 file `src/components/games/*.tsx` gọi `sound.playWrong()` nhưng chỉ 16 gọi `reportWrong()`;
   5 trong 14 tự vẽ phản hồi riêng, **9** không có gì trên màn hình. Sửa một chỗ trong framework:
   `GameModalWrapper` nhận thêm prop `mistakes` (= `stage.mistakesInTier` mà `submitWrong()` đã tăng) và
   khi số này **tăng** thì dựng đúng cặp mascot + bóng chữ mà `reportWrong()` vẫn dựng; 14 trò truyền prop,
   không phải viết lại 14 màn chơi. **1** file test mới `tests/t47g-wrong-turn-visual.test.ts` (6) ⇒ +6 test;
   vẫn **42** service module, vẫn **30** probe QA (bằng chứng đặt trong `evidence/2026-11-04-T47G/`);
   `src/` đổi nên entry **đổi hash** (`DbfbtGg4` → `oKg0XRrb`) trong khi **kB đứng nguyên** 211.1),
   đợt **T47F** trước đó (đóng `DEF-018(a)`: **sáu** chỗ mà nút "Chơi lại" không xoá trạng thái bảng —
   `NumberTowerGame.tsx:25`, `SentenceScrambleGame.tsx:31`, `ClockMoneyGame.tsx:36`,
   `EnglishAnimalSoundGame.tsx:30`, `ListenPickPhonicsGame.tsx:139` đều thiếu `stage.nonce` trong deps
   (chơi lại cùng màn chỉ bump `nonce`, không đổi `tier` ⇒ đề mới mà bảng cũ, nhẹ nhất là gợi ý cũ treo
   lại, nặng nhất là soft-lock tàu chữ vì `trainDriving` không reset); chỗ thứ sáu là
   `ColoringCanvasGame.tsx:219` — wrapper `onRestart` **duy nhất** trong repo bỏ tham số nên
   `stage.restartGame()` lấy `unlockedTier`, tức `DEF-017` lọt lại đúng trò này; **1** file test mới
   `tests/t47f-restart-resets-board.test.ts` (5) ⇒ +5 test; vẫn **42** service module, vẫn **30** probe QA
   (probe bằng chứng đặt trong `evidence/2026-11-04-T47F/`, không tính vào `qa/`); `src/` đổi nên entry
   **đổi hash** (đuôi `vqb0Kx4n` → `DbfbtGg4`) trong khi **kB đứng nguyên** 211.1 và boot graph vẫn
   `435603 total` byte — bằng chứng `evidence/2026-11-04-T47F/`),
   đợt **T47** liền trước (năm defect một đợt, đều là phần *còn hở* của sổ săn bug: `Esc` lúc đang tạm dừng
   **thoát luôn ván** vì tấm che "Đang tạm dừng" không được khai là lớp phủ — đóng `DEF-013`; ba mẹ chọn
   "Không giới hạn" (`dailyLimitMinutes: 0`) bị ép thành ngân sách 20 phút; `saveParentSettings()` ghi
   `setItem` thô nên không phát `kho_bau_storage_change` ⇒ quyền kiểm soát của ba mẹ không bao giờ rời
   khỏi máy đang gõ, kể cả khi đã bật đồng bộ; Thử Thách Tuần ghi thêm dòng thưởng `xp=0` trùng lặp làm
   đầy lịch sử 50 phần thưởng; và bảng "Chọn Màn & Độ Khó" không về được màn **dễ** hơn vì `selectGameTier`
   chỉ mở khoá (`Math.max`) ⇒ `restartGame(targetTier)`; **5** file test mới
   `tests/t47a-escape-resumes-pause-veil` (7) · `t47b-unlimited-daily-budget` (10) ·
   `t47c-parent-settings-broadcast` (7) · `t47d-weekly-challenge-zero-reward-row` (6) ·
   `t47e-tier-picker-easier` (7) ⇒ 37 test; vẫn **42** service module, vẫn **30** probe QA
   (probe bằng chứng đặt trong `evidence/2026-11-04-T47/`, không tính vào `qa/`); `src/` đổi nên entry
   **đổi cả hash lẫn kB** (đuôi `CprqGUdJ` → `vqb0Kx4n`, 211.2 → 211.1 kB) — bằng chứng
   `evidence/2026-11-04-T47/`),
   đợt **T46** liền trước (ba defect còn lại của đợt săn bug mà code tự sửa được, không phải quyết nội dung: câu
   chào theo giờ bị lời khen streak **thay thế** nên bé đã có streak không bao giờ được chào, nút loa của
   "Đôi Tai Thính — Nghe & Chọn" là icon-only **không tên truy cập** (không `aria-label` lẫn `title`), và
   **Esc thoát luôn trò chơi** khi lớp phủ "Chọn Màn & Độ Khó" còn đang che bảng; **3** file test mới
   `tests/t46a-header-greeting` (6) · `t46b-speaker-button-name` (6) ·
   `t46c-escape-closes-overlay-first` (7) ⇒ 19 test; vẫn **42** service module, vẫn **30** probe QA
   (probe bằng chứng đặt trong `evidence/2026-11-04-T46/`, không tính vào `qa/`); `src/` đổi nên entry
   **đổi hash** (đuôi entry từ `C5J1ceAM` lên `CprqGUdJ`) trong khi **kB đứng nguyên** 211.2 —
   bằng chứng `evidence/2026-11-04-T46/`),
   đợt **T45** liền trước (năm defect một đợt: máy gắp bỏ qua trần `maxGachaPerDay` nên ba mẹ đặt **0** (= không
   giới hạn) bị hiểu thành 5 lượt, "Tắt phần thưởng" vẫn để thi đấu + thành tựu cộng XP/Sao, hết giờ học bé
   tự nới thêm 10 phút mà không qua cổng ba mẹ, phím vẫn thao tác bàn chơi khi lớp phủ "Chọn Màn & Độ Khó"
   đã che bảng, và Thử Thách Tuần phát id cứng `weekly-challenge-week-1` nên mọi tuần trùng nhau ⇒ thành tựu
   3 tuần không thể đạt; **5** file test mới
   `tests/t45a-gacha-parent-limit` (5) · `t45b-rewards-off-competition` (6) ·
   `t45c-screen-time-parent-gate` (6) · `t45d-overlay-blocks-keyboard` (7) ·
   `t45e-weekly-challenge-rotation` (7) ⇒ 31 test; vẫn **42** service module, vẫn **30** probe QA
   (probe bằng chứng đặt trong `evidence/2026-11-03-T45/`, không tính vào `qa/`); `src/` đổi nên entry
   **đổi cả hash lẫn kB** — bằng chứng `evidence/2026-11-03-T45/`),
   đợt **T44** liền trước (năm lát cắt: `kho_bau_ioe_store` được đưa vào `STORAGE_KEYS` ⇒ **18** key trong registry
   (tổng vẫn **19** vì `kho_bau_cloud_session_hint` nằm ngoài), đường sinh đề hết `Math.random`, chuỗi máy/Anh
   còn lộ trên UI, **44** hộp chạm < 44px mà probe render đo được ở 375×812 dù quét class trong source không thấy,
   và lượt sai phải có **lý do** bằng chữ + tiếng chứ không chỉ một tiếng bíp; **5** file test mới
   `tests/t44a-storage-key-coverage` (6) · `t44b-exercise-selection-seeded` (10) · `t44c-ui-label-language` (7) ·
   `t44d-tap-targets` (4) · `t44e-wrong-answer-feedback` (6) ⇒ 33 test; thêm **1** file dữ liệu
   `src/data/englishIoe/selection.ts` ⇒ **105** file `src/data/*.ts`, vẫn **42** service module;
   `src/` đổi nên entry **đổi cả hash lẫn kB** — bằng chứng `evidence/2026-11-03-T44/`),
   đợt **T43** liền trước (một defect: `resetProgress()` chỉ quét 13/17 khoá nên "Đặt lại tiến độ" để sót
   `review_days` + `game_first_seen` + `tree_water` — `DEF-001` trong `docs/plan/RISK_REGISTER.md`;
   1 file test mới `tests/t43a-reset-progress-sweeps-child-data.test.ts` (5 test; RED 4 failed → GREEN);
   không thêm key, không thêm service module (vẫn **42**); `src/services/storage.ts` đổi nên entry
   **đổi cả hash lẫn kB** — bằng chứng `evidence/2026-11-03-T43/`),
   đợt **T42** liền trước (tám defect một đợt, bảy file test: chọn màn không còn in sao "đã chơi", thẻ *Đôi Tai Thính* luôn giữ
   đáp án, bẫy focus không cướp con trỏ khi bé đang gõ, đọc `localStorage` hỏng không xoá cả danh sách ôn,
   hợp nhất cloud theo đồng hồ `stateTouchedAt` thay vì `lastActiveDate`, bài "cộng/trừ một chữ số trong
   phạm vi 100" bỏ phép có nhớ/có mượn, lưới đề dựng lại ngay khi đổi màn thay vì qua `useEffect`, và hẹn giờ
   của bài thi thử phải được xoá lúc rời màn:
   7 file test mới `tests/t42a-tier-picker-honest` (5) · `t42b-listen-pick-answer` (4) ·
   `t42c-focus-trap-typing` (4) · `t42d-corrupt-storage-guard` (12) · `t42e-resource-touch-clock` (11) ·
   `t42f-digit-lesson-no-carry` (5) · `t42g-late-state-timers` (4) ⇒ 45 test; **không** thêm service module,
   không thêm file trong `src/services/`; hash và kB của lượt đo đó **không trích lại ở đây** vì quy ước này
   chỉ giữ **một** bộ số hiện trạng — cần thì mở `evidence/2026-11-03-T42/verify.txt`);
   đợt **T41D** ngay trước đó (phép hợp nhất hồ sơ cloud với tiến độ của máy khác và race đăng xuất/đổi tài khoản
   giữa lúc kéo cloud: thêm `src/services/cloudMerge.ts` ⇒ **42** service module, entry và số test của
   lượt đo đó ghi ở `evidence/2026-11-03-T41D/` — không trích lại ở đây vì quy ước này chỉ giữ **một**
   bộ số hiện trạng),
   2 file test mới `tests/t41d-cloud-merge.test.ts` (28) + `tests/t41d-cloud-sync-race.test.ts` (12)); các đợt đo trước cùng ngày: bỏ cờ `continue-on-error` của job
   "3. Browser QA" (commit `3b0122c`, 1 test hợp đồng mới trong `tests/t31-bug-hunt-fixes.test.ts`
   ⇒ 1287 test, `src/` không đổi nên entry giữ nguyên hash), sửa "đề cổng phụ huynh vẽ muộn hơn khung
   hình đầu" (5 test mới `tests/t41f-parent-gate.test.ts` ⇒ 1286 test, `src/` đổi nên entry **đổi hash**
   dù kB không đổi), và
   sửa race màn chúc mừng lên cấp trong `qa/lib.mjs` rồi khoá bước
   "QA probe" của workflow `03` bằng `tee probe-run.log` (3 test hợp đồng mới trong
   `tests/t31-bug-hunt-fixes.test.ts`, khi đó `src/` không đổi nên hash entry giữ nguyên); lần đo
   trước đó là **2026-11-02**, ngay sau merge release `7365830` (nhánh KBT-ISSUE-43 vào `main`) kèm bản sửa flake theo giờ trong
   `tests/fatigue-reset.test.ts`: hai test "không reset" lấy `Date.now()` làm mốc nên khi suite chạy
   trong 30 phút trước nửa đêm, `now` rơi sang **ngày hôm sau** và quy tắc đổi ngày kích hoạt —
   code đúng, test đỏ; nay neo mốc giữa trưa + một ca mới chứng minh "đổi ngày là lý do reset độc lập")
   và merge `09511d3` (engine cờ vua tối ưu + `tests/chess-engine-performance.test.ts` 5 test) kế tiếp
   KBT-ISSUE-43 (nút Tạm dừng trò chơi: đồng hồ gom về `useGameStage`, thêm `tests/t43-game-pause.test.ts`
   30 test và probe `qa/game-pause.mjs`; entry đổi hash, **kB không đổi** vì thay đổi nằm trong chunk game đã lazy),
   T41C (bốn đường ghi `recordQuestionAnswer` / `applySession` / bước ngày chuỗi /
   `recordTierReward` chỉ tính một lần: bằng liệu trùng bị chặn trước khi cộng, buổi đọc
   có dấu đã gập, ghi thất bại thì hoàn tác, và mỗi lượt chơi có biên lai),
   T41B (DecisionEngine + LearningOS chỉ dùng đồng hồ do caller truyền: cửa sổ cân bằng
   môn 14 ngày tính từ `now`, báo cáo Ba Mẹ dùng ngày lịch địa phương thay vì ngày UTC),
   T41A (công tắc phần thưởng của ba mẹ chặn đúng tài nguyên ở tầng service, màn kết quả
   in đúng phần thưởng vừa cấp, CTA trang Chủ mở thẳng bài được gợi ý, "Vì sao gợi ý này?"
   tới tab Phân Tích, đồng hồ thời lượng màn hình không tính lúc tab ẩn),
   T40 (sửa mã máy lộ trên báo cáo Ba Mẹ, chuẩn hoá kỹ năng đọc và migration `P43-v1`),
   T39 (tối ưu đồ thị tải lần đầu: màn Cờ Tướng/IOE + ngân hàng đề ra khỏi chunk khởi động,
   Firebase chỉ nạp khi người lớn mở màn tài khoản), T38 (đường lùi WebGL cho bàn cờ 3D), T37 (kẻ đậm đường ô cờ vua), T36 (Việt hoá nhãn còn sót), T35 (đường kẻ ô + tương phản sáng/tối) và T34 (bộ cờ vua giống cờ gỗ thật), vòng soát bug T31 rồi T32 (bẫy focus popup bài học, header tràn nút "Ba Mẹ", thoại gấu lẫn chữ Hàn,
   cờ vua 3D thiếu fallback WebGL), sau khi đã sửa vòng bug T26/T27 và audit UI T28; trên nền
   hai merge `origin/main`
   (cloud-sync + cờ vua WebGL, rồi `3727f04` auth/chess) và merge `fd3e7da` — bằng
   `npx vitest run`, `npm run check:budget` hoặc `ls`. Các số mô tả nội dung học (31/475/1570
   câu) giữ nguyên từ đợt đo 2026-10-29: T42 chỉ đổi **dữ kiện** của 12 phép tính và một dòng mô tả
   trong `src/data/math/calcIn100.ts`, không thêm/bớt chủ đề, bài hay câu. Dấu ✚ trong `BRD.md`
   nghĩa là "đo trực tiếp từ repo".
2. **Code là nguồn chân lý.** Khi tài liệu cũ (`PRODUCT_SPEC.md`, `MASTER_ROADMAP.md`)
   lệch với `src/`, thì `src/` đúng và tài liệu này phải sửa theo.
3. **Không có yêu cầu treo.** Một FR không còn chứng cứ phải bị xoá hoặc gắn
   "KHÔNG CÒN ĐẠT" kèm lý do — xem `SRS.md` §11 và `RTM.md` §9.
4. **Không cam kết ngày.** Kế hoạch dùng độ lớn (S/M/L/XL) + tiền lệ có thật trong
   `docs/opencode/reports/`, không dùng "2 ngày".
5. **Bằng chứng là output lệnh.** Số liệu lấy qua MCP (`mcp/`) là manh mối; muốn tuyên bố
   "xanh" phải dán output `npm run verify` hoặc `QA PASS` (`AGENTS.md` §1, `docs/SDLC.md` §10).
6. **Prompt không phải tài liệu.** Brief AI của một phase chỉ là đầu vào: chạy xong thì chứng
   cứ là báo cáo/test, không phải prompt. Ngày 2026-10-30 đã gỡ 68 prompt đã dùng
   (`docs/MASTER_ROADMAP.md` §"Cấu trúc `docs/` sau khi gỡ prompt", khôi phục bằng
   `git show "99edd29:<đường-dẫn>"`). Còn giữ: 3 master prompt module (`cotuong.md`, `covua.md`,
   `olypictienganh.md`) vì chưa có mô tả thiết kế nào khác, và `docs/opencode/queue/05_T03B…md`
   vì task chưa làm.

## Khi nào phải cập nhật

| Bạn vừa… | Phải sửa |
|---|---|
| thêm trò chơi / tính năng | `SRS.md` (FR mới) → `RTM.md` (dòng mới) → `CHANGELOG.md` |
| đổi ngưỡng nghiệp vụ | `SRS.md` §5 hoặc §6 + test trong `tests/` |
| đổi kiến trúc (chunk, schema, tầng) | `ARCHITECTURE.md` + thêm hoặc sửa ADR |
| xong một phase | `../plan/TASK_PLAN.md` §II (lịch sử, chỉ thêm không sửa) |
| phát hiện lỗi mới | `../plan/TEST_PLAN.md` §12 (danh sách hồi quy) |
| đổi tên / di chuyển một file trong bộ này | 4 điểm trỏ tới ở mục "Bộ này được trỏ tới từ" |

## Bộ này được trỏ tới từ

Bốn điểm vào (sửa cùng một commit khi đổi tên file hoặc số liệu đầu mối):

- [`../../README.md`](../../README.md) — mục "Bộ tài liệu chuẩn"
- [`../SDLC.md`](../SDLC.md) §9 — tra cứu nhanh "yêu cầu nào chưa có test / việc kế tiếp"
- [`../MASTER_ROADMAP.md`](../MASTER_ROADMAP.md) — bảng "Tài liệu"
- [`../../CHANGELOG.md`](../../CHANGELOG.md) `[Unreleased]` — dòng Added của bộ đặc tả

## Tài liệu nền khác (không thuộc bộ đặc tả nhưng được tham chiếu nhiều)

[`../SDLC.md`](../SDLC.md) · [`../lifecycle/README.md`](../lifecycle/README.md) (8 artifact vòng đời +
Evidence Board + Checklist) · [`../prompts/README.md`](../prompts/README.md) (5 thẻ prompt tái dùng) ·
[`../../evidence/README.md`](../../evidence/README.md) (bằng chứng gắn commit) ·
[`../GAME_DESIGN.md`](../GAME_DESIGN.md) ·
[`../CURRICULUM_MAP.md`](../CURRICULUM_MAP.md) · [`../PARENT_MODE.md`](../PARENT_MODE.md) ·
[`../SAFETY_PRIVACY.md`](../SAFETY_PRIVACY.md) · [`../P30_RELIABILITY.md`](../P30_RELIABILITY.md) ·
[`../P31_PERFORMANCE_ACCESSIBILITY.md`](../P31_PERFORMANCE_ACCESSIBILITY.md) ·
[`../cotuong.md`](../cotuong.md) · [`../../mcp/README.md`](../../mcp/README.md) ·
[`../../AGENTS.md`](../../AGENTS.md)
