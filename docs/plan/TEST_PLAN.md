# TEST_PLAN — Kế hoạch kiểm thử từ đầu đến cuối
## KHO BÁU TRI THỨC — LỚP 1 (mã tài liệu KBT-TEST-1.0)

> Tài liệu này quy định **kiểm thử cái gì, bằng lớp nào, chạy lệnh nào, và khi nào được
> coi là xanh**. Danh sách yêu cầu cần kiểm: [`SRS.md`](../specs/SRS.md); ánh xạ
> yêu cầu ↔ test ↔ probe ↔ gate: [`RTM.md`](../specs/RTM.md); quy trình: [`../SDLC.md`](../SDLC.md).
>
> **Số liệu chốt 2026-11-04** (đo lại sau **T50B — một defect, một file test**: `src/components/shop/AvatarShopScreen.tsx` có **3** đường ghi hồ sơ vứt kết quả `saveChildProfile` trong khi `writeJSON` cố ý trả `false` lúc Safari private mode / hết quota ⇒ máy chưa lưu gì mà màn hình vẫn báo "bé đã chọn bạn Cú"; cả ba nay đọc `const saved`, khi `false` thì hoàn tác về đúng bản đang nằm trên máy **và** hiện banner `role="alert"` — trước đó màn có **6** lời `sound.speak` mà **0** node chữ nhìn thấy được nên tắt tiếng là bé mất hết phản hồi (`DEF-023`); **1** file test mới `tests/t50b-shop-machine-save-notice.test.ts` (6) ⇒ **126 file / 1553 test**, suite **29.07 s**; entry **đổi hash nhưng không đổi độ dài** (`index--gQhs43l.js`, vẫn 214 kB = 219 142 byte — hai nhãn mới nằm trong chunk lazy `AvatarShopScreen-B-c_Xglz.js` 8 887 byte), boot graph giữ `438617` byte = **428.3 kB**; service module / component / hook / probe / trò chơi **không đổi**; probe + 4 log đột biến ở `evidence/2026-11-04-T50B/`; ghi mới **`DEF-024` (MỞ)**: **66** lời gọi `save…` vẫn vứt kết quả trong `src`, **13** ở `src/components`; mô tả lượt **T50A — một defect, một file test**: `src/data/shopCatalog.ts` thêm `MASCOT_EMOJI: Record<ChildProfile['avatarBase'], string>` + `SHOP_MASCOTS` — **một nguồn hình duy nhất** cho cả `HomeScreen` lẫn `AvatarShopScreen`; phép đo trước khi sửa — `avatarBase` có **4** giá trị (`src/types/index.ts`) nhưng `HomeScreen` vẽ mascot bằng ternary **3** nhánh có `else` ⇒ bé chọn Cú Thông Thái thì Home hiện con thỏ (`DEF-022a`); **1** file test mới `tests/t50a-home-mascot-single-source.test.ts` (5); `src/` đổi nên entry **đổi cả hash lẫn kB** (`vYzkzZ5R` → `BZswaFkc`, **213.7 → 214 kB**) và boot graph `438305` → `438617` byte = **428.3 kB**; service module / component / hook / probe / trò chơi **không đổi**; probe + 4 log đột biến ở `evidence/2026-11-04-T50A/`; mô tả lượt **T49B — một defect, một file test**: `grep -c "id: '" src/data/shopCatalog.ts` = **41** món chia theo 7 `type` (mũ 8 · thú 7 · áo 6 · nền 6 · khung 5 · kính 5 · ba lô 4) nhưng `AvatarShopScreen` chỉ khai **5** tab ⇒ **17** món (áo 6 + nền 6 + khung 5) không thuộc tab nào — bé không bao giờ thấy thẻ lẫn nút "Mở khóa" dù `buyShopItem()` vẫn nhận id của chúng; nửa thứ hai nặng hơn vì bé **đã trả sao**: ô preview chỉ ghép 4 lớp nên thêm tab mà không thêm lớp thì mặc áo/nền/khung vào nhân vật đứng nguyên ⇒ `SHOP_TABS` 8 tab (id kiểu `'mascot' | ShopItemType`, bỏ luôn cast `as typeof activeTab`) + `EQUIP_LAYER` khai là `Record<ShopItemType, string>` (thêm một `type` mới thiếu lớp là đỏ `tsc`, không chờ ai nhớ) + `EQUIP_OVERLAYS`/`SHOP_MASCOTS` xuất khẩu để test đọc danh sách thật; chú thích "43 món" sửa về số đo thật **41**; **1 file test mới** `tests/t49b-shop-tabs-cover-catalog.test.ts` (8) = **+8 test** (bộ số của lượt **T49B** — tổng test / `Duration` / hash lẫn kB entry / boot graph — **không trích lại đây**, xem `evidence/2026-11-04-T49B/verify.txt`) (probe 5 bước trên `dist/` — sao trừ thật `284→278→263→253`, preview lớn dần `🦊` → `🦊👕` → `🌊🦊👕` → `🌊🦊👕⭐` — và **QA FAIL 6 lỗi ở `failedAt: A`** khi đột biến về bản cũ, 3 log đột biến, tất cả ở `evidence/2026-11-04-T49B/`; **DEF-022** phát hiện khi review: `HomeScreen.tsx:254` vẽ 🐰 cho cả `owl` và không ghép ô trang bị nào); mô tả lượt **T49A — một defect, một file test**; mô tả lượt **T48B — một defect, một file test**; mô tả lượt **T47F — một defect, một file test**: bấm "Chơi lại" **cùng màn** không dựng lại bảng chơi — deps của hiệu ứng khởi tạo chỉ keyed `stage.tier` / `stage.roundIdx` nên bỏ mất `stage.nonce` (tín hiệu duy nhất khi màn không đổi) ⇒ tháp số vẫn đầy "Tầng 1 (+3)…" dù điểm vừa về 0, tàu chữ **soft-lock** (`setTrainDriving(false)` thiếu ⇒ `handleWordTap` có `|| trainDriving` nên nuốt **mọi** cú chạm), gợi ý của ván cũ treo sang ván mới, hai trò "Nghe và chọn" mất tiếng đọc đề ⇒ thêm `stage.nonce` vào **5** deps; **một nghi oan** đã đo lại: `ColoringCanvasGame` **không** cần `nonce` vì `onRestart` của nó là wrapper riêng gọi `clearCanvas()` theo lệnh, defect thật là wrapper **bỏ tham số `targetTier`** ⇒ `stage.restartGame()` fallback `unlockedTier` và đường sửa `DEF-017` lọt lại đúng trò này (probe đo cả hai); **1 file test mới** `tests/t47f-restart-resets-board.test.ts` (5) = **+5 test** (bộ số của lượt T47F **không** trích lại đây — vùng hiện trạng chỉ giữ một bộ số, xem `evidence/2026-11-04-T47F/verify-exit0.txt`); **cộng T47G**: lượt **sai** chỉ có tiếng bíp ở **14** trò — đo, không suy luận: 30 file `src/components/games/*.tsx` gọi `sound.playWrong()` nhưng chỉ 16 gọi `reportWrong()`, 5 trong 14 tự vẽ phản hồi riêng, **9** còn lại không có gì trên màn hình ⇒ `GameModalWrapper` nhận thêm prop `mistakes` (= `stage.mistakesInTier` mà `submitWrong()` đã tăng) và dựng mascot + bóng chữ ENCOURAGEMENT khi bộ đếm **tăng**, 14 trò truyền prop thay vì dựng lại 14 màn chơi; **1 file test mới** `tests/t47g-wrong-turn-visual.test.ts` (6) = **+6 test**; **cộng T48A**: bé nhấn nút loa, máy **không đọc được** mà màn hình vẫn báo "Đã đọc xong" — `onerror` của `SpeechSynthesisUtterance` rơi vào đúng nhánh `setState('played')` của `onend`, dù `onerror` là bằng chứng **không có tiếng nào** đi tới tai; `src/hooks/useSpeak.ts` nay phân loại lý do (`canceled` · `interrupted` · `rejected` · `audio-busy` ⇒ `idle` để bé bấm lại, lý do hỏng thật ⇒ `unavailable` nói thẳng với bé) và `played` **chỉ** còn đến từ `onend`; **1 file test mới** `tests/t48a-speak-error-not-played.test.ts` (5) = **+5 test**; **cộng T48B**: bé bấm "Gắp Ngay", máy báo "Đã lưu vào Bộ Sưu Tập!" và bắn confetti trong khi **không có byte nào nằm xuống máy** — `StorageService.drawGacha()` bỏ qua giá trị `false` của `writeJSON` (phép đo: `grep -rn "StorageService\.save" src` in ra **79** dòng, **78** lời gọi thật, trước đợt này đúng **1** chỗ đọc kết quả), mà `writeJSON` trả `false` đúng khi trình duyệt chặn ghi (Safari private mode) hoặc hết dung lượng ⇒ `drawGacha` nay trả `reason: 'storage-unavailable'` khi ghi hỏng, `GachaMachineScreen.tsx` có nhãn riêng cho thất bại *của máy* thay vì rơi vào nhãn "hết lượt", và câu "đã gắp đủ 5 lượt" thành "đã gắp đủ N lượt" lấy N từ `getGachaDailyLimit()` của ba mẹ (T45A đã sửa phần logic cho đúng cài đặt nhưng **câu chữ** vẫn mang hằng số 5); **1 file test mới** `tests/t48b-gacha-result-honest.test.ts` (8) = **+8 test** (bộ số của lượt **T48B** — tổng test, `Duration`, hash và kB của entry — **không trích lại đây** vì vùng hiện trạng chỉ giữ một bộ số, xem `evidence/2026-11-04-T48B/verify-merged.txt`; bằng chứng `evidence/2026-11-04-T47F/`: probe chạy trên `dist/` **trước** khi gắn guard đỏ 3 lỗi A2/B2/C3, sau đó 5 bước 0 lỗi); đợt **T47** liền trước — năm defect, năm file test: (A) Esc lúc đang tạm dừng **xoá luôn ván** vì tấm che "Đang tạm dừng" không được khai là lớp phủ ⇒ `GameOverlayState` + `escapeOverlayKind()` route `Esc` theo z-order (bảng `z-50` trước, tấm che `z-20` sau), **đóng `DEF-013`**; (B) ba mẹ chọn "Không giới hạn" (`dailyLimitMinutes: 0`) bị ngân sách hoá thành 20 phút ⇒ `resolveDailyBudgetMinutes()` + `UNLIMITED_BUDGET_MINUTES: 240`; (C) `saveParentSettings()` ghi `setItem` thô ⇒ không phát `kho_bau_storage_change`, `cloudSync` không hẹn giờ auto-sync ⇒ đổi sang `writeJSON`; (D) Thử Thách Tuần ghi dòng thưởng `xp=0` trùng mô tả ⇒ bỏ `addRewardHistory`, phần thưởng thật đã có `recordQuestEvent` ghi; (E) bảng "Chọn Màn & Độ Khó" không về được màn **dễ** hơn ⇒ `restartGame(targetTier)` và xoá `jumpToTier` không nơi nào gọi; **5 file test mới** `tests/t47a-escape-resumes-pause-veil.test.ts` (7) · `t47b-unlimited-daily-budget.test.ts` (10) · `t47c-parent-settings-broadcast.test.ts` (7) · `t47d-weekly-challenge-zero-reward-row.test.ts` (6) · `t47e-tier-picker-easier.test.ts` (7) = **+37 test**; bộ số của lượt T47 (test file / tổng test / `Duration` / entry / boot graph) **không trích lại ở đây** — vùng hiện trạng chỉ giữ một bộ số, xem `evidence/2026-11-04-T47/verify.txt`; vẫn 42 service module, vẫn **30** probe QA — hai probe bằng chứng `evidence/2026-11-04-T47/probe-t47-escape-pause.mjs` (4 bước, 5 ảnh, exit 0) và `evidence/2026-11-04-T47/probe-t47e-tier-picker.mjs` (4 bước, 2 ảnh, exit 0) đặt ngoài `qa/`; mỗi guard then chốt đều được ablation (`mutation-1-veil-declared.txt`, `mutation-2-hook-guard.txt`). Trước đó là **T46 — ba defect, ba file test**: (A) `Header.tsx` lấy lời khen streak **thay thế** câu chào theo giờ ⇒ câu chào luôn đứng trước, lời khen nối phụ; (B) nút loa của `ListenPickPhonicsGame.tsx` là icon-only không tên ⇒ `aria-label="Nghe lại đề"` kèm quét toàn bộ `src/components/games/**`; (C) Esc thoát luôn trò chơi khi lớp phủ "Chọn Màn & Độ Khó" còn che bảng ⇒ `useModalHistory(onExit, { overlayOpen, onCloseOverlay })` + `shouldEscapeCloseOverlay()`, Esc đối xử như dialog lồng nhau; **3 file test mới** `tests/t46a-header-greeting.test.ts` (6) · `t46b-speaker-button-name.test.ts` (6) · `t46c-escape-closes-overlay-first.test.ts` (7) = **+19 test**; `Duration`, tên entry và kB của riêng đợt **T46** **không trích lại ở đây** (một vùng hiện trạng chỉ giữ một bộ số) — xem `evidence/2026-11-04-T46/verify.txt`; bài học giữ lại: `src/` đổi nên entry **đổi hash** còn kB đứng nguyên; vẫn 42 service module, vẫn **30** probe QA — probe bằng chứng `evidence/2026-11-04-T46/probe-t46-escape-a11y.mjs` (7 bước, 5 ảnh, exit 0) đặt ngoài `qa/`. Trước đó là **T45 — năm defect, năm file test**: (A) `maxGachaPerDay` bị máy gắp bỏ qua ⇒ `StorageService.getGachaDailyLimit()` (`0` = không giới hạn) + nhãn `∞` trên `GachaMachineScreen.tsx`; (B) "Tắt phần thưởng" bị `checkAchievements()`/`recordCompetitionResult()` đi vòng qua ⇒ hai guard trong `src/services/storage.ts`, kết quả thi + phân tích vẫn lưu vì đó là dữ liệu học; (C) bé tự nới 10 phút không qua cổng ba mẹ ⇒ `ScreenTimeModal` đổi `onExtend` → `onAskParent`, `App.tsx` mở dashboard tab cài đặt, không ghi `dailyLimitMinutes`; (D) phím vẫn thao tác bàn chơi khi lớp phủ "Chọn Màn & Độ Khó" che bảng ⇒ `useGameStage` thêm `isGameInputBlocked()`/`inputBlocked`, mười game bàn phím dùng `stage.inputBlocked` và nối `onOverlayOpenChange`; (E) Thử Thách Tuần phát id cố định nên mọi tuần trùng nhau ⇒ `weeklyChallengeIdOf()` theo `weekKeyOf` trong `src/services/streakEngine.ts`, thành tựu "3 tuần" mới đạt được; **5 file test mới** `tests/t45a-gacha-parent-limit.test.ts` (5) · `t45b-rewards-off-competition.test.ts` (6) · `t45c-screen-time-parent-gate.test.ts` (6) · `t45d-overlay-blocks-keyboard.test.ts` (7) · `t45e-weekly-challenge-rotation.test.ts` (7) = **+31 test** cho riêng đợt đó (số hiện trạng của T45 chỉ nằm trong `evidence/2026-11-03-T45/verify.txt` — một vùng hiện trạng giữ **một** bộ số); không thêm service module (vẫn 42), vẫn **30** probe QA — probe bằng chứng `evidence/2026-11-03-T45/probe-t45-gating.mjs` (9 bước, 6 ảnh, exit 0) đặt ngoài `qa/` để không đếm thành probe. Trước đó là **T44 — năm lát cắt, năm file test**: (A) `kho_bau_ioe_store` được đưa vào `STORAGE_KEYS` ⇒ **18** key tập trung (tổng `localStorage` vẫn 19), nên `resetProgress` sinh danh sách từ registry và không thể sót màn IOE; (B) đường sinh đề **hết** `Math.random`/`Date.now` — `seedForLocalDay` (hash FNV) + `shuffleSeeded` trong `src/services/adaptive.ts`, lựa câu IOE rơi xuống module dữ liệu mới `src/data/englishIoe/selection.ts` (⇒ **105** file `src/data/*.ts`); (C) chuỗi máy/nhãn Anh còn lộ trên UI bị Việt hoá; (D) **44 hộp chạm < 44px** mà probe render (`evidence/2026-11-03-T44/probe-t44-tap.mjs`, `getBoundingClientRect` ở 375×812, đi qua **31/31** trò) bắt được còn quét class trong source thì mù — nặng nhất là dải "Màn {tier} ▾" **152×14** dùng chung trong `GameModalWrapper.tsx`, rồi nút ✕, ô màu/khuôn dán, chấm nối số, chấm phân trang, hai nút loa icon-only `36×36`/`28×28`; (E) lượt sai phải có **lý do**: `SubjectScreen.tsx` thêm `rejectTurn()` (bíp + `speak` + banner `role="status" aria-live="polite"`) và đổi `disabled` → `aria-disabled` vì `disabled` chặn luôn cú click nên hai lời giải thích không bao giờ chạy tới; **5 file test mới** `tests/t44a-storage-key-coverage.test.ts` (6) · `t44b-exercise-selection-seeded.test.ts` (10) · `t44c-ui-label-language.test.ts` (7) · `t44d-tap-targets.test.ts` (4) · `t44e-wrong-answer-feedback.test.ts` (6) = **+33 test**; `Duration` và bộ số entry của lượt đo đó **không** trích lại ở đây — một vùng hiện trạng chỉ giữ **một** bộ số, xem `evidence/2026-11-03-T44/verify.txt`; không thêm service module (vẫn 42). Trước đó là **T43 — một defect `resetProgress`**: `StorageService.resetProgress()` liệt kê thủ công 13 trong 17 khoá nên "Đặt lại tiến độ" để sót `kho_bau_review_days`, `kho_bau_game_first_seen`, `kho_bau_tree_water` — sửa bằng cách sinh danh sách **từ** `STORAGE_KEYS` trừ allowlist `RESET_KEEP_KEYS`; **1 file test mới** `tests/t43a-reset-progress-sweeps-child-data.test.ts` (5 test, RED `4 failed | 1 passed` trước khi sửa) = +5 test — `Duration` và bộ số của lượt đo đó **không** trích lại ở đây (một vùng hiện trạng chỉ giữ một bộ số), xem `evidence/2026-11-03-T43/verify.txt`. Trước đó là **T42 — tám defect một đợt, bảy file test**: chọn màn trong bảng độ khó chỉ **mở khoá** thay vì in sao (`StorageService.selectGameTier` mới, `GameModalWrapper` không gọi `completeGameTier` nữa), `pickCardOptions` mới giữ đáp án luôn có mặt trong 4 thẻ *Đôi Tai Thính*, `shouldMoveFocusIntoDialog` mới để bẫy focus không cướp con trỏ khi bé đang gõ, `getAnalytics` lọc **từng phần tử** hỏng thay vì bỏ cả mảng, đồng hồ hợp nhất cloud đổi sang trường mới `ChildProfile.stateTouchedAt` (kèm fallback `lastActiveDate`) và lượt ghi của chính bộ đồng bộ bị mute qua `StorageService.withoutStateTouch`, bài Toán "một chữ số trong phạm vi 100" bỏ 12 phép có nhớ/có mượn trong `src/data/math/calcIn100.ts`, *Săn Vần* + `MockExam` dựng lại state/hẹn giờ ở thì render thay vì `useEffect`/`setTimeout` trần; **7 file test mới** `tests/t42a…` → `tests/t42g…` = +45 test; `src/` đổi nên entry **đổi cả hash lẫn kB**, không thêm service module (vẫn 42) — còn `Duration`, tên hash và kB của lượt đo đó **chỉ** ghi ở `evidence/2026-11-03-T42/verify.txt` (một vùng hiện trạng chỉ giữ một bộ số). Trước đó là **T41D — hợp nhất hồ sơ cloud + race đăng nhập**: module mới [src/services/cloudMerge.ts](file:///D:/trithuc/kho-bau-tri-thuc/src/services/cloudMerge.ts) (364 dòng) tách luật hợp nhất ra khỏi `cloudSync.ts` — tài nguyên **tiêu được** (sao đổi quà, vé, ngọc, trang bị) không còn lấy `Math.max` vì sẽ in tiền, hồ sơ `isDemoData` trên cloud bị firewall chặn, mọi thao tác cloud đi qua một hàng đợi + `authEpoch`; `firebase.ts` thêm `AuthChangeSource` để phân biệt "SDK không nạp được" với "đăng xuất thật"; 2 file test mới `tests/t41d-cloud-merge.test.ts` (28) + `tests/t41d-cloud-sync-race.test.ts` (12), `Duration` và entry của lượt đo đó ghi trong `evidence/2026-11-03-T41D/` (một vùng hiện trạng chỉ giữ một bộ số). Trước đó nữa là **đợt bỏ cờ `continue-on-error` của job "3. Browser QA"** trong `.github/workflows/03-qa-browser.yml` + 1 test hợp đồng mới trong `tests/t31-bug-hunt-fixes.test.ts` — nội dung đó **đã commit thành `3b0122c` và đo lại đúng commit đó: `Duration 22.15s`**, so với `22.09s` đo trên working tree ngay trước khi commit; trước đó là **đợt sửa "đề cổng phụ huynh vẽ muộn hơn khung hình đầu"** — `ParentDashboardModal` khởi tạo state bằng một đề mồi cố định rồi mới sinh đề thật trong `useEffect([isOpen])`, mà effect chạy **sau** paint nên khung hình đầu luôn là `15 + 18 = ?`; MutationObserver trong Chromium đo **9/9** lần mở vẽ đề mồi, đề thật đến sau **5–114 ms**. Sửa = sinh đề bằng `useMemo` ngay lúc vẽ + reset trạng thái cổng lúc vẽ; 5 test mới `tests/t41f-parent-gate.test.ts` (camera là `renderToString` — chỉ vẽ khung hình đầu, không chạy effect) và helper `unlockParentDashboard` trong `qa/lib.mjs` (đọc đề → nộp → **chờ cổng đóng** → đọc lại, tối đa 3 lượt) mà 4 probe `golden-path` / `focus` / `mobile-golden` / `openCompetitionHub` đi qua. `src/` đổi nên entry đổi hash, kB không đổi. Đợt trước trong cùng ngày: **sửa race màn "Chúc mừng bé lên cấp" trong `qa/lib.mjs`** — `dismissLevelUpCelebration` đếm `count()` tức thời nên bỏ sót modal mount trễ, để lại overlay che nút; thêm 2 test hợp đồng trong `tests/t31-bug-hunt-fixes.test.ts`, rồi **1 test hợp đồng nữa** khoá bước "QA probe" của workflow `03` (phải `tee probe-run.log`, không cho bước chẩn đoán chạy lại probe). Đợt trước: **KBT-ISSUE-43 + merge `c8a3725` + 2 sửa review + merge `09511d3` + merge release `7365830` + bản sửa flake theo giờ trong `tests/fatigue-reset.test.ts`** — đồng hồ trò chơi gom về `useGameStage`, thêm `tests/t43-game-pause.test.ts` 30 test và probe `qa/game-pause.mjs`; đợt đo trước trong cùng ngày là T41C — bốn đường ghi tiến trình chỉ tính một lần: bằng liệu trùng chặn trước khi cộng, buổi đọc có dấu đã gập, bước ngày hoàn tác khi ghi hỏng, mỗi lượt chơi một biên lai; trước đó là T41B cửa sổ cân bằng môn và nhãn ngày trong báo cáo Ba Mẹ theo đồng hồ của caller + lịch địa phương, T41A công tắc phần thưởng chặn đúng tài nguyên, T40 sửa mã máy trên báo cáo Ba Mẹ + migration `P43-v1`, T39 cắt lần tải đầu): 126 file test / 1553 test ·
> 30 probe (29 `.mjs` + 1 `.cjs`) · 4 workflow CI · 3 git hook · main chunk `index--gQhs43l.js`
> 214 kB / trần 600 kB / **mục tiêu 450 kB đã đạt**; đồ thị chặn lần vẽ đầu 428.3 kB (trần 500 kB
> do `tests/t39-first-load-graph.test.ts` giữ); vendor ngoài entry và ngoài boot graph: `three-vendor` 572.6 kB, `firebase-vendor` 723.0 kB.

---

## 1. Triết lý kiểm thử của dự án này

1. **Bằng chứng là output lệnh, không phải mô tả.** `AGENTS.md` §1.1: không nói "xong"
   khi chưa chạy cổng. Số liệu từ MCP (`mcp/`) chỉ là *manh mối* — muốn "xanh" phải dán
   output `npm run verify` hoặc `QA PASS` thật.
2. **Máy không thay con người.** Có đúng hai việc máy không làm được: (a) đọc to câu hỏi
   xem bé 6 tuổi có hiểu không, (b) nhìn bàn cờ 3D có dễ chịu không. Hai việc đó nằm ở
   §11, không nằm ở test tự động.
3. **Test không phụ thuộc may rủi.** Dữ liệu đề thi/game deterministic theo `(tier, seed)`
   ⇒ cùng seed là cùng đề ⇒ probe so sánh được. Cấm `Math.random`/`Date.now` trong
   builder (`AGENTS.md` §2).
4. **Mỗi lớp chỉ làm việc của mình.** Unit test chứng minh *logic*; probe chứng minh
   *tính năng chạy trên build thật*; thiết bị thật chứng minh *trải nghiệm*; không lớp nào
   được gánh việc của lớp khác.

---

## 2. Năm lớp kiểm thử

```
Lớp 5  Người lớn đọc to + beta trẻ thật          → §11   (2 phiên/milestone, không tự động)
Lớp 4  Thiết bị thật: Android/iOS, offline, audio → §7    (qa/mobile.mjs + tay người)
Lớp 3  Probe trình duyệt trên dist/ (30 probe)    → §6    (npm run qa:smoke)
Lớp 2  Build + ngân sách + precache               → §9    (npm run build && npm run check:budget)
Lớp 1  Unit/integration Vitest (1553 test)        → §5    (npm run test:ci)
────────────────────────────────────────────────────────────────────────────────────────────
              npm run verify = typecheck + Lớp 1 + Lớp 2   ← cổng duy nhất
```

**Thứ tự bắt buộc khi kiểm:** Lớp 1 → 2 → 3 → 4 → 5. Không nhảy lớp: probe trên `dist/` mà
`dist/` chưa build từ code xanh thì kết quả vô nghĩa.

---

## 3. Ma trận "thay đổi gì → phải chạy gì"

| Vùng thay đổi | Bắt buộc chạy | Cần thêm |
|---|---|---|
| `src/services/**` (logic) | `npm run verify` | probe liên quan nếu logic ra UI (`qa/decision-engine.mjs`, `qa/question-types.mjs`) |
| `src/data/**` (nội dung) | `npm run verify` | `qa/p41-curriculum-quality.mjs`; nếu đổi kho thi → `qa/question-types.mjs` |
| Thêm/đổi trò chơi | `npm run verify` | `npm run qa:games`; tick đủ 4 nơi đăng ký (`docs/SDLC.md` §3.1) |
| `src/components/**` (UI) | `npm run verify` | `npm run qa:smoke` **hoặc** probe riêng + screenshot |
| Layout/responsive | `npm run verify` | `qa/responsive-a11y.mjs` + `qa/mobile.mjs` + `qa/games.mjs` @195 px |
| `public/sw.js`, `scripts/sw-precache.mjs` | `npm run verify` | `qa/offline-pwa.mjs` (bắt buộc, gồm cache-wipe survival) |
| `src/services/storage.ts`, schema | `npm run verify` | test migration mới (mọi bump phải có hàm migrate) |
| `vite.config.ts`, chunking | `npm run verify` | `npm run check:budget` trước/sau, dán hai số đo vào PR |
| `mcp/**` | `npm run verify` | `node mcp/devclient.mjs <server> <tool>` cho tool đổi schema |
| Tài liệu `docs/**` | — (không chặn) | cập nhật RTM nếu thêm/sửa yêu cầu |

---

## 4. Yêu cầu kiểm thử (test basis)

| Nguồn | Dùng làm cơ sở | Ghi chú |
|---|---|---|
| `SRS.md` §4 (88 FR) | mỗi FR phải có ≥ 1 ô Test **hoặc** Probe | FR không chứng minh được → gắn "CHƯA ĐẠT", không xoá |
| `SRS.md` §5 (25 NFR) | ngưỡng đo được (kB, viewport, quota, từ cấm) | NFR chỉ đạt khi **đo**, không đạt vì "hợp lý" |
| `SRS.md` §6 (17 DC) | schema + migration + sanitizer | xem §8 |
| `BRD.md` §8 (Business DoD) | tiêu chí phát hành | xem §10 |
| `docs/AUDIT_REPORT.md` | hồi quy: lỗi từng phát hiện phải có test khoá | 3 lỗi P0 của P43 đã có test (§12) |

---

## 5. Lớp 1 — Unit & integration (Vitest)

**Chạy:** `npm run test:ci` (bản CI). **Không** dùng `npm test` trong tự động hoá vì
`posttest` gọi `scripts/audit-snapshot.mjs` ghi `docs/audit-state.json` và nối
`docs/AUDIT_REPORT.md` (`AGENTS.md` §1.2).

**Bố trí 100 file theo vai trò** (danh sách này **đủ** — kiểm bằng lệnh: mọi file trong `tests/`
phải xuất hiện ở một dòng bảng; lần đồng bộ gần nhất 2026-11-03):

| Nhóm | File | Kiểm gì |
|---|---|---|
| Engine học tập | `answerCheck`, `learning-engine`, `session-composer`, `adaptive-difficulty`, `decision-engine`, `decision-engine-storage`, `personas-and-learning-os`, `lesson-completion`, `lesson-matching`, `fatigue-reset`, `t07-subject-path`, `t27-lesson-engagement`, `t29-lesson-smooth` | chấm đúng/sai, bằng chứng idempotent, NBA deterministic, profile phiên, reset fatigue, đường môn học, độ mượt luồng bài (offsetHeight/layout shift) |
| Thi thử | `competition-bank`, `competition-engine`, `competition-p36`, `exam-fidelity`, `competition-readiness` | size bank, assemble + `shortfall`, 7 dạng chấm được, seed ổn định, đáp án không trùng, readiness |
| Nội dung | `content-quality`, `content-validator-t02c`, `curriculum-quality-p41`, `vietnamese-curriculum`, `vietnamese-rhymes`, `math-curriculum`, `math-t11c`, `math-typography`, `english-curriculum`, `life-curriculum`, `t12b-english-units`, `t02d-content-fixes` | số lượng chủ đề/bài/câu, dấu chuẩn GDPT, U+2212, không mojibake, không near-duplicate |
| Trò chơi | `games-all`, `games-content`, `game-content`, `game-rewards`, `t08-games-hub`, `t15-viet-games`, `t16-math-games`, `t16-math-contract`, `t17a-english-games`, `t17b-coding`, `t17b-scientist`, `t21-fun-games`, `t25-difficulty-ladder`, `t32-game-stage-reset`, `t33-feedback-timers`, `t43-game-pause` | builder deterministic 6 bậc, thưởng 1 lần/vòng, hợp đồng câu hỏi, BFS màn lập trình, **bậc thang độ khó toàn catalog** (trần số 0–100, số phương án, trần nhóm Puzzle, cấm `Math.random`/`Date.now`), đồng hồ/locked/sang màn gom về `useGameStage`, **nút Tạm dừng + lớp phủ "Đang tạm dừng"** |
| Luyện đọc | `reading-fluency` | 5 bậc, công thức chỉ số, parent rating không đè điểm đo |
| Tiếng Anh | `kidbox-curriculum`, `kidbox-activities`, `kidbox-learning-os`, `kidbox-bridge-practice`, `english-ioe`, `p32-english-mastery`, `voice-persona`, `english-curriculum` | **0 unit bịa** + 7 nhóm cần nguồn, en-GB fallback, mastery key riêng |
| Động lực | `t18a-motivation`, `t01-achievements`, `praise-engine`, `t14c-logic`, `t14c-storage`, `t20a-levelup-hooks` | sticker/quest/streak/level, lời khen không từ cấm, hooks order |
| Persistence & cloud | `t14c-storage`, `date-utils`, `parent-and-demo`, `firebase-auth-sync`, `t41d-cloud-merge`, `t41d-cloud-sync-race` | sanitize, `isRealDateKey`, export/import, **trạng thái offline khi chưa đăng nhập**; `t41d-cloud-merge` = luật hợp nhất thuần (bộ đếm luỹ kế lấy `max`, **tài nguyên tiêu được** theo hồ sơ hoạt động sau nhất, `Set` union, firewall hồ sơ demo, `trace` không lộ bài làm của bé); `t41d-cloud-sync-race` = hàng đợi một luồng ghi, `authEpoch` bỏ kết quả phiên cũ, không tự kích hoạt auto-sync vòng lặp, resume khi SDK hỏng |
| Âm thanh & giọng đọc | `question-audio-routing`, `voice-persona`, `t24-speech-math-operators` | nút "Đọc câu hỏi" luôn lấy canonical text (không rò rỉ đáp án/option/giải thích), persona + fallback en-GB, **phép tính `+ − =` đọc thành lời** mà không đổi chữ hiển thị |
| Hệ thống | `bundle-budget`, `pwa`, `sw-precache`, `mobile-layout`, `t02c-startup-split`, `p41-font-encoding`, `t31-bug-hunt-fixes` | ngân sách chunk, precache, layout, tách chunk, font/dấu, **hợp đồng tĩnh của 5 lỗi T31 + 7 probe đã sửa** |
| Cờ | `cotuong-engine`, `chess-3d`, `chess-engine-performance`, `t26-cotuong-puzzles`, `t30-cotuong-piece-depth`, `t34-chess-real-set`, `t38-webgl-fallback` | luật (mã/tượng/pháo/tốt/tướng đối mặt/tự bỏ chiếu), node budget, `applyMove`; mesh 12 quân có shadow, bàn 64 ô + hitbox, marker nước đi/chiếu, nước mở đầu hợp lệ với engine; **độ nổi của quân cờ tướng** (bóng tiếp đất tràn ra ngoài đĩa, thành quân thò dưới mặt quân, thứ tự 3 lớp); 6 thế chiếu bí thật; bộ cờ vua giống ngoài đời; màn cờ vẫn chơi được khi máy không có WebGL; **engine cờ vua nhanh** (`chess-engine-performance`, merge `09511d3`): bàn mở đầu hợp lệ, `isAttacked` nhận ra mã/tốt/trượt/tướng, `getBestMove(depth 4, deadline 400 ms)` xong trong **≤ 600 ms** (ngưỡng là **thời gian tường** ⇒ rủi ro flake khi CI máy chậm — đã ghi ở §10), `getBestMove` không mutate bàn vào, tìm được nước bắt quân/chiếu-bí-trong-1 |
| Ba mẹ & tiến trình (T40–T41F) | `t40-parent-facing-ids`, `t41a-parent-controls`, `t41b-decision-clock`, `t41c-idempotency`, `t41f-parent-gate` | báo cáo Ba Mẹ không lộ mã máy, công tắc thưởng chặn đúng tài nguyên, cửa sổ cân bằng môn + nhãn ngày theo đồng hồ caller, **chống ghi trùng** 5 tầng (evidence id · first-seen · nonce · completion · reward) + hoàn tác khi hết quota, **đề cổng phụ huynh có mặt ngay khung hình đầu** (`renderToString` 15 lần mở, không được vẽ đề mồi) + hợp đồng probe phải xác nhận cổng đã đóng |
| Tám defect T42 (bảy file test) | `t42a-tier-picker-honest`, `t42b-listen-pick-answer`, `t42c-focus-trap-typing`, `t42d-corrupt-storage-guard`, `t42e-resource-touch-clock`, `t42f-digit-lesson-no-carry`, `t42g-late-state-timers` | bảng chọn màn chỉ **mở khoá** (`selectGameTier` không in sao/điểm, lượt thật đầu vẫn nhận đủ XP + `isFirstClear`); *Đôi Tai Thính* luôn giữ đáp án trong 4 thẻ và thứ tự xáo tất định theo seed; `shouldMoveFocusIntoDialog` không cướp con trỏ khi bé đang gõ trong hộp thoại; một phần tử `null`/sai shape trong `recentErrors` chỉ bị bỏ, không xoá cả danh sách ôn và không làm crash `cloudMerge`; hợp nhất cloud theo đồng hồ `stateTouchedAt` (có `lastActiveDate` làm fallback), lượt ghi của chính bộ đồng bộ không nhích đồng hồ; mọi phép tính của bài "một chữ số trong phạm vi 100" **không nhớ / không mượn** và đáp số khớp `a op b`; lưới quả *Săn Vần* dựng lại ở thì render (không qua `useEffect`) và hẹn giờ 600 ms của `MockExam` nằm trong ref + cleanup lúc unmount |
| Vỏ UI & quy tắc React | `t01b-ui-fixes`, `t20a-hooks-order`, `t28-ui-polish`, `t36-viet-labels`, `t39-first-load-graph` | header không tràn, focus trap của popup bài học, hooks order, chuỗi Việt hoá còn sót, trần 500 kB cho đồ thị lần vẽ đầu |
| Dọn dữ liệu bé (T43) | `t43a-reset-progress-sweeps-child-data` | "Đặt lại tiến độ" phải quét **đủ** khoá con của `STORAGE_KEYS` (16/17 — `kho_bau_parent_settings` cố ý giữ vì là lựa chọn của người lớn; cờ phiên cloud nằm ngoài registry): danh sách khoá lấy **từ** registry chứ không liệt kê tay, nên thêm một khoá dữ liệu mới buộc người viết quyết định quét-hay-giữ tại `RESET_KEEP_KEYS`; hành vi cụ thể: `review_days` trắng, `tree_water` về `null`, `game_first_seen` mất dấu, và `save`/`get` vẫn chạy sau reset. Ngoài unit test còn một probe trên `dist/` giữ trong `evidence/2026-11-03-T43/probe-t43-reset.mjs` (đặt ngoài `qa/` để không đổi số probe) bấm thật luồng Parent Gate ⇒ `ok: true` |
| Tooling | `t23-mcp-servers` | 5 server tồn tại, `node --check`, 0 import ngoài, `progress/` gitignored, 4 danh sách đăng ký khớp |

**Quy tắc viết test (bắt buộc):**

1. Tên file `tests/t<NN>-<chủ đề>.test.ts` hoặc `<chủ-đề>.test.ts`; hành vi mới ⇒ test mới,
   cùng PR.
2. Test **engine thuần** không import React. Test component dùng `.tsx` (tiền lệ
   `math-t11c.test.tsx`, `t20a-levelup-hooks.test.tsx`).
3. Không mock `localStorage` nếu đang test persistence — dùng storage thật trong
   `beforeEach` reset (tiền lệ `decision-engine-storage.test.ts`).
4. Không assertion kiểu `length ≥ N` thay cho kiểm hành vi. Các ngưỡng `≥ 45`/`≥ 30` hiện có
   là **sàn chống hồi quy**, phải đi kèm test hành vi thật (`tests/exam-fidelity.test.ts`).
5. Mọi ngưỡng nghiệp vụ khi test phải đọc từ `src/config/policy.ts`, không hard-code con số
   trùng lặp.

**Coverage (mục tiêu, chưa phải gate):** ≥ 80% dòng cho `src/services/**`; UI không tính.
Task hiện thực: `TASK_PLAN.md` C4.

---

## 6. Lớp 3 — Probe trình duyệt (Playwright)

**Runner:** `node qa/run-one.mjs <probe>` — không build gì thêm, boot `vite preview`
(cổng `PORT`, mặc định 4173), nạp Chromium theo thứ tự `PW_CHROME` → cache máy dev →
registry của Playwright, cộng `--no-sandbox` khi `CI` được set.
**Hợp đồng exit code:** in `QA PASS`/`QA FAIL` và **chỉ** exit khác 0 khi probe ghi `errors[]`
hoặc tự khai `ok: false` (nhiều probe không set `ok` ⇒ thiếu `ok` **không** phải lỗi).

**Danh mục 30 probe:**

| Probe | Kịch bản | Tiêu chí xanh | Chạy khi |
|---|---|---|---|
| `golden-path.mjs` | home → bé mới → bài học → luyện đọc → thi → xem lại → phụ huynh → reload; 25 log point | 0 `errors[]`, `failedAt` trống, XP/`evidence`/`readingStore` tăng thật | mọi PR đổi UI, bắt buộc trước release |
| `responsive-a11y.mjs` | 6 viewport: 360×800, 390×844, 768×1024, 1024×768, 1280×800, 1440×900 | 0 tràn ngang, role/label đạt, reduced motion tôn trọng | đổi layout |
| `mobile.mjs` | 4 viewport 360/375/390/412 + xoay + background/resume | không nút nào < ngưỡng chạm, không mất phiên khi resume | đổi mobile |
| `mobile-golden.mjs` | 7 chặng @390 px và @195 px (zoom 200%), so XP | XP không đổi giữa hai mức zoom; 0 tràn | đổi mobile/game |
| `games.mjs` | 31 game mount/đóng + thưởng chỉ 1 lần/vòng; cả @195 px | 31/31; overflow ≤ 2 px; không farming | thêm/đổi game |
| `focus.mjs` | focus trap + khôi phục focus mọi dialog (kể `ScreenTimeModal`) | focus trở về phần tử mở; ESC đúng ngữ nghĩa | đổi modal |
| `kidbox-focus.mjs` | trap + restore cho activity player Kid's Box | như trên | đổi track Anh |
| `decision-engine.mjs` | NBA hiện trên màn, bấm dẫn tới hoạt động đúng | thẻ NBA đúng action từ engine | đổi decision engine |
| `decision-engine-a11y.mjs` | semantics + focus của vùng NBA | 0 lỗi a11y vùng NBA | đổi UI NBA |
| `lesson-types.mjs` | 8 kiểu câu hỏi bài học, mỗi kiểu trả lời được | không kiểu nào treo/không chấm | đổi LessonPlayer/data |
| `question-types.mjs` | 7 dạng bài thi thật: đủ dạng, mọi dạng trả lời + chấm được | `shortfall = 0`, đáp án vào `errorAnalysis` | đổi kho thi |
| `offline-pwa.mjs` | SW install, precache, tắt mạng vẫn học, icon decode, xoá cache vẫn còn tiến độ | app chạy offline; dữ liệu còn nguyên | đổi SW/PWA |
| `audio.mjs` | trạng thái TTS, chống stacked utterance, cổng autoplay, audio đoạn đọc, **phép tính `+ − =` đọc thành lời** (ghi âm văn bản thật đưa vào `SpeechSynthesisUtterance`, còn ký hiệu thô là FAIL) | không 2 utterance đồng thời | đổi sound/speak |
| `p41-curriculum-quality.mjs` | quét chất lượng nội dung trên build | 0 lỗi nội dung | đổi `src/data/**` |
| `p41-font-visual.mjs` | font/dấu hiển thị không vỡ | glyph đúng, không mojibake | đổi CSS/font |
| `mobile-home.mjs` | màn home trên mobile | phần tử chính đủ lớn, không tràn | đổi Home |
| `t01-hotfix.mjs` | achievements (P42/T01) | rule mở thành tựu đúng | đổi motivation |
| `t01b-fixes.mjs` | header/Esc/back/touch target | như ticket T01B | đổi UI shell |
| `t02-smoke.mjs` | startup split + network sạch | chunk tách đúng, không request ngoài | đổi chunking |
| `tier6-ladder-evidence.mjs` | mở 9 trò Ngôn ngữ/Puzzle ở **Màn 6** @390×844, đếm phương án/thẻ/ô/chấm render trong DOM + 9 screenshot | đúng bậc thang (6 phương án, 24 thẻ, mosaic 6×6, 18 chấm, bàn 8×8), 0 tràn ngang, không có phương án ngoài màn hình mà vùng chơi không cuộn, ô bấm ≥ 44 px | đổi bậc thang độ khó / UI lưới chọn đáp án |
| `cotuong-puzzles.mjs` | mở Cờ Tướng → Luyện thế cờ, đi sai (phải báo "chưa chiếu"), giải 2 thế chiếu bí rồi reload kiểm tiến độ + huy hiệu đã giải | 6 tab thế cờ, tiến độ `1/6 thế` → `2/6 thế`, localStorage `kho_bau_cotuong_puzzles`, sau reload còn 2 thế đã giải, 0 tràn ngang, ô bấm ≥ 44 px | đổi `cotuongPuzzles.ts` / view cờ tướng |
| `lesson-engagement.mjs` | 2 lượt bài học đầu tiên @390×844: lượt 1 chọn sai để ghi lại đáp án đúng, kiểm sao/đồng hồ/danh sách câu sai, bấm "Ôn lại" rồi trả lời đúng từng câu | sao khớp tỉ lệ đúng, đồng hồ đứng yên ở màn kết quả, combo tăng (`data-combo`), lượt ôn 9/9 → 3 sao + 0 câu sai, 0 tràn ngang | đổi `LessonPlayerModal` / `lessonEngagement.ts` |
| `p38-browser-probe.cjs` | hồi quy praise/parity (P38) | 0 lỗi console vùng đã đổi | đổi praise |
| `gacha-machine.mjs` | Máy Gắp @390×844: đo đống sticker trong cửa kính, bấm gắp, xem kết quả + lịch sử | 10 sticker trải ≥ 55% bề ngang kính, không tràn khung, `claw-drop` + `gacha-jumble` chạy khi gắp, trừ 1 vé, lịch sử hiện sticker, 0 tràn ngang | đổi `GachaMachineScreen` / hoạt ảnh UI |
| `lesson-smooth.mjs` | Luồng học @390×844: đo thanh hành động, vị trí cuộn sau mỗi câu, ô combo và phản hồi | thanh "Kiểm tra/Câu tiếp theo" **ngoài** vùng cuộn và luôn thấy, `scrollTop = 0` khi sang câu mới, ô combo cao 24 px nên dải hiện không đẩy đề (shift ≤ 2 px), phản hồi nằm trong tầm nhìn, 0 tràn ngang | đổi `LessonPlayerModal` / combo / đồng hồ |
| `cotuong-depth.mjs` | Độ nổi của quân cờ tướng @900×1100, đo cả chế độ 3D lẫn "Góc 2D": thứ tự vẽ 3 lớp quân so với lưới, đế thò dưới mặt quân, **giải mã PNG** ảnh chụp để so độ sáng nền bàn ngay dưới quân với phía trên | mặt quân vẽ **trên** lưới, `rimBelowFacePx ≥ 2`, nền dưới quân tối hơn nền trên ≥ 8 mức sáng (có bóng tiếp đất), mặt quân sáng ≥ 150 | đổi `src/index.css` khối `.ct-piece*` / `CotuongBoard3D.tsx` |
| `t32-game-replay-evidence.mjs` | Khung trò chơi @390×844 với `?qa`: Đọc Câu Làm Theo - chạm đồ vật rồi chọn lại Màn 1, đếm số ô được đánh dấu "bước hợp lệ" trong 8 lượt ở Màn 4; Đường Đua Thần Tốc Màn 4 - mở lớp phủ "Chọn Màn" giữ 3 giây rồi đóng | lựa chọn dở bị xoá sau khi chơi lại, mỗi lúc đúng 1 bước hợp lệ, đồng hồ đứng yên khi bị che (15s → 15s) và chạy tiếp khi đóng (15s → 12s), nút ✕ đóng lớp phủ có tên truy cập | đổi `GameModalWrapper` / `useGameStage` / `sound.ts` |
| `t33-feedback-timers.mjs` | Hẹn giờ phản hồi @390×844 với `?qa`: Ếch Nhảy Tia Số — bấm đúng rồi bấm sai trong 2,5 s; Lật Thẻ Trí Nhớ — đang hẹn giờ úp thẻ ở Màn 1 thì nhảy sang Màn 4 rồi lật tiếp hai thẻ; Luyện Đọc — bấm "Đọc cả câu" hai lần rồi bấm "Thoát" giữa lúc đọc; Đấu Trường Chính Tả — bấm hai phương án sai cách nhau ~0,5 s; Máy Gắp — bấm gắp rồi về Trang Chủ sau 300 ms | bóng lời khen của lượt mới còn nguyên tới mẫu 2.300 ms, Màn 4 vẫn tính 1 lượt, ô sáng karaoke đi một chiều và `speechSynthesis.speaking` về `false` khi bấm "Thoát", phương án bấm sau vẫn tô đỏ qua mốc 900 ms của lượt trước (đối chứng trên bản lỗi: `red` tụt 1→0 tại 1.104 ms), rời máy gắp giữa vòng quay không mất vé và không bắn confetti trên trang chủ | đổi `GameModalWrapper` / `useRoundFeedbackTimer` / karaoke `ReadingFluencyScreen` / `confetti.ts` / `sound.ts` |
| `parent-controls.mjs` | Quyền kiểm soát của ba mẹ trên build thật @1280×720, 6 chặng: "Vì sao gợi ý này?" → tab Phân Tích; tắt công tắc **Toàn Bộ Phần Thưởng** (đọc `kho_bau_parent_settings`); Tủ Đồ với 999 sao bấm "Mở khóa"; học hết một bài Tiếng Việt; bật lại rồi mua chính món đó; bấm CTA "Bắt đầu: …" | `parent-decision-report` hiện ra, `rewardsEnabled` đổi `true→false→true`, ví sao **không đổi** khi thưởng tắt, màn kết quả có `lesson-rewards-off` và **không** còn dòng `+N Sao/XP/Vé`, sau khi bật lại thì `unlockedItems` tăng, CTA không còn đứng ở trang Chủ (nếu rơi vào bản đồ môn thì bài được gợi ý phải tự bật) | đổi `ParentDashboardModal` / `storage.ts` gate / `LessonPlayerModal` kết quả / `HomeScreen` CTA |
| `game-pause.mjs` | Nút Tạm dừng trò chơi (KBT-ISSUE-43) trên `dist/` @390×844 với `?qa`: đếm nút `game-pause` ở 1 trò không đồng hồ + 4 trò có đồng hồ; chưa tạm ⇒ bóng rơi, bấm tạm ⇒ `aria-pressed="true"` + lớp phủ `game-paused-veil` + 4 bóng đứng nguyên 1 200 ms; **đang tạm** chạm đúng bóng đích; bấm tiếp ⇒ bóng rơi lại; Đường Đua — width của `[data-testid="race-timer"]` đứng rồi chạy lại | `errors[]` rỗng, `ok: true`, 12 bước; **đối chứng bắt buộc**: cùng cú `dispatchEvent('click')` lúc **đang chạy** phải làm bóng đích biến mất khỏi DOM (nếu không, C1 vô nghĩa — bóng bấm hỏng chứ chẳng liên quan tạm dừng) | đổi `useGameStage` (đồng hồ), `GameModalWrapper` (nút + lớp phủ) hoặc 4 trò `catch_letters`/`color_balloon`/`falling_numbers`/`speed_racing` |

**Chính sách probe đỏ vì timing (đã ghi `AGENTS.md` §1.3):** chạy lại **một** lần;
nếu vẫn đỏ ⇒ là lỗi thật; khi báo cáo phải dán `errors[]` + `failedAt`, không chỉ exit code.
Nợ đã biết: selector `qa/games.mjs` từng khiến probe `SKIPPED` ở một số phiên — khắc phục
ở `TASK_PLAN.md` C2; khi C2 chưa xong, **không** được dùng "games.mjs skip" làm bằng chứng xanh.

**Nợ ghi ngày 2026-11-01 (vòng T32):** `qa/p38-browser-probe.cjs` nằm trong danh mục probe ở §6
nhưng `require('puppeteer')` — dependency này **không** có trong `package.json` (và `AGENTS.md`
§1.4 cấm tự thêm), nên probe chết ngay khi chạy: `Cannot find module 'puppeteer'`, exit 1. Nó
không còn là bằng chứng xanh cho vùng praise/parity; muốn dùng lại phải port sang Playwright
(`qa/run-one.mjs`) chứ không thêm puppeteer. Hai probe tự chạy `qa/t02-smoke.mjs` và
`qa/p38-browser-probe.cjs` cũng **không** có `export default` ⇒ gọi qua `node qa/run-one.mjs` sẽ
`RUNNER_ERROR`; chạy trực tiếp `node qa/t02-smoke.mjs` (đã kiểm: `ERRORS: []`, exit 0).

---

## 7. Lớp 4 — Thiết bị thật (không tự động hoá được)

| # | Thiết bị / điều kiện | Kiểm | Kết quả ghi ở đâu |
|---|---|---|---|
| 1 | Android (Chrome), màn 390 px | cài PWA, icon 192/512 + maskable, offline bật máy bay vẫn học, TTS tiếng Việt | `docs/FINAL_QA.md` |
| 2 | iPhone Safari | apple-touch icon, audio cần gesture, không vỡ layout dọc/ngang | `docs/FINAL_QA.md` |
| 3 | Máy yếu / 3G mô phỏng | thời gian tải màn đầu,hoạt ảnh không giật, nước cờ không treo UI | `docs/P31_PERFORMANCE_ACCESSIBILITY.md` |
| 4 | Thiết bị không có giọng `en-GB` | app **nhãn trung thực** thay vì giả vờ đọc chuẩn Anh | `qa/audio.mjs` + tay người |
| 5 | Bé thật (3 bé × 3 phiên, khi có nguồn Kid's Box) | bước nào bé tự làm được; từ nào bé không nhận diện | `docs/ENGLISH_KIDBOX_TEST_REPORT.md` (task A3) |

**Gate:** E3 trong `TASK_PLAN.md` chỉ đạt khi 1, 2, 4 có kết luận bằng mắt người.

---

## 8. Kiểm thử dữ liệu & persistence

| Loại | Ca kiểm | Tự động ở |
|---|---|---|
| Parse hỏng | `localStorage` chứa `{`, `null`, chuỗi, JSON thiếu dấu phẩy ⇒ không ném, trả store mặc định | `tests/decision-engine-storage.test.ts` |
| Field lạ | payload có key không có trong schema ⇒ sanitizer loại bỏ, phần hợp lệ giữ nguyên | `tests/kidbox-learning-os.test.ts`, `tests/t14c-storage.test.ts` |
| Migration | `P28-v1` và `P29-v2` đọc lên `P43-v1`; `schemaVersion` được ghi lại đúng; **không** tính lại mastery; khoá `rf_rf_*` được gộp an toàn về `rf_*` | `tests/exam-fidelity.test.ts:84`+, `tests/t18a-motivation.test.ts`, `tests/reading-fluency.test.ts`, `tests/t40-parent-facing-ids.test.ts` |
| Ngày ảo | `2026-13-99` bị `isRealDateKey` loại (first-seen / tree-water / review-days) | `tests/t14c-storage.test.ts` |
| Đồng hồ & tất định | cửa sổ 14 ngày của cân bằng môn tính theo `now` của caller (13 ngày ⇒ không tăng cờ, 15 ngày ⇒ có); `decide` lặp lại cho kết quả từng byte giống nhau; mọi nhãn ngày dùng lịch địa phương (UTC+7), không `toISOString()` | `tests/t41b-decision-clock.test.ts` |
| Idempotency 5 tầng | evidence id lặp; first-seen; nonce; completion; reward delta — buổi đọc có `sessionId` chỉ gập một lần, biên lai thưởng một lượt chơi (`rewardClaims`) | `tests/personas-and-learning-os.test.ts`, `tests/lesson-completion.test.ts`, `tests/game-rewards.test.ts`, `tests/t41c-idempotency.test.ts` |
| Cap bộ nhớ | `recentEvidences` ≤ 200; `examResults` có trần | `tests/fatigue-reset.test.ts`, `tests/competition-readiness.test.ts` |
| Quota đầy | `setItem` ném (Safari riêng tư / hết chỗ) ⇒ `writeJSON` trả `false`, bước ngày của chuỗi **hoàn tác** thay vì +1 mỗi lần đọc, khiên không bị tiêu, biên lai thưởng không ghi non | `tests/t41c-idempotency.test.ts` |
| Export/import | file rác bị từ chối, store hiện có không đổi; tên file `kho_bau_tri_thuc_report_*` | `tests/parent-and-demo.test.ts` |

---

## 9. Lớp 2 — Build, ngân sách, precache

| Kiểm | Lệnh | Ngưỡng | Hành vi khi đỏ |
|---|---|---|---|
| Ngân sách entry | `npm run check:budget` | entry ≤ **600 kB** (trần cứng); mục tiêu 450 kB chỉ báo | exit 1 ⇒ `verify` đỏ ⇒ không merge |
| Đúng file entry | script đọc `dist/index.html` để tìm `index-*.js` | không cộng nhầm chunk | — |
| Test dùng chung hàm | `tests/bundle-budget.test.ts` gọi `getBudgetReport()` | gate và test không thể lệch | — |
| Tách chunk | `math-bank`, `english-bank`, `react-vendor`, `three-vendor`, `firebase-vendor` | entry không phình theo nội dung **và** không mang vendor nặng | đo trước/sau, dán 2 số đo; nếu entry nhảy >50 kB sau một thay đổi, nghi ngờ có import thẳng `three`/`firebase` vào `App.tsx` |
| Precache | `tests/sw-precache.test.ts`, `qa/offline-pwa.mjs` | manifest đủ `/assets/*`; placeholder dev ⇒ danh sách rỗng nhưng SW vẫn sống | — |
| Loại trừ | `node_modules`, `.git`, `dist` không vào manifest | — | — |

**Số đo gần nhất (2026-11-04, nội dung = HEAD `main` **`1344796` — T50B**: `src/components/shop/AvatarShopScreen.tsx` có **3** đường ghi hồ sơ vứt kết quả `saveChildProfile` trong khi `writeJSON` cố ý trả `false` lúc Safari private mode / hết quota ⇒ máy chưa lưu gì mà màn hình vẫn báo "bé đã chọn bạn Cú"; cả ba nay đọc `const saved`, khi `false` thì hoàn tác về đúng bản đang nằm trên máy **và** hiện banner `role="alert"` — trước đó màn có **6** lời `sound.speak` mà **0** node chữ nhìn thấy được nên tắt tiếng là bé mất hết phản hồi (`DEF-023`); **1** file test mới `tests/t50b-shop-machine-save-notice.test.ts` (6) ⇒ **126 file / 1553 test**, suite **29.07 s**; entry **đổi hash nhưng không đổi độ dài** (`index--gQhs43l.js`, vẫn 214 kB = 219 142 byte, vì hai nhãn mới nằm trong chunk lazy `AvatarShopScreen-B-c_Xglz.js` 8 887 byte còn tham chiếu tên chunk trong entry dài đúng 8 ký tự như cũ), boot graph giữ `438617` byte = **428.3 kB**; service module / component / hook / probe / trò chơi **không đổi**; ghi mới **`DEF-024` (MỞ)**: **66** lời gọi `save…` vẫn vứt kết quả trong `src` (`grep -rn "^\s*StorageService\.save[A-Za-z]*(" src --include=*.ts --include=*.tsx | wc -l`), **13** ở `src/components`; probe + 4 log đột biến ở `evidence/2026-11-04-T50B/`; mô tả lượt **T50A**: `src/data/shopCatalog.ts` thêm `MASCOT_EMOJI: Record<ChildProfile['avatarBase'], string>` + `SHOP_MASCOTS` — **một nguồn hình duy nhất** cho cả `HomeScreen` lẫn `AvatarShopScreen`; phép đo trước khi sửa — `avatarBase` có **4** giá trị (`src/types/index.ts`) nhưng `HomeScreen` vẽ mascot bằng ternary **3** nhánh có `else` ⇒ bé chọn Cú Thông Thái thì Home hiện con thỏ (`DEF-022a`); **1** file test mới `tests/t50a-home-mascot-single-source.test.ts` (5); `src/` đổi nên entry **đổi cả hash lẫn kB** (`vYzkzZ5R` → `BZswaFkc`, **213.7 → 214 kB**) và boot graph `438305` → `438617` byte = **428.3 kB**; service module / component / hook / probe / trò chơi **không đổi**; mô tả lượt **T49B**: `src/components/shop/AvatarShopScreen.tsx` (`SHOP_TABS` 8 tab phủ mọi `ShopItemType` + `EQUIP_LAYER` khai là `Record<ShopItemType, string>` nên preview ghép đủ 7 ô trang bị) + chú thích catalogue sửa từ "43 món" về số đo thật **41** + **1** file test mới `tests/t49b-shop-tabs-cover-catalog.test.ts` (8) (bộ số của lượt **T49B** không trích lại đây — xem `evidence/2026-11-04-T49B/verify.txt`); probe 5 bước trên `dist/` ở `evidence/2026-11-04-T49B/` + **ba** log đột biến (gỡ tab ⇒ b2+b3 đỏ · gỡ lớp `shirt` ⇒ b6 đỏ · gỡ `glasses` khỏi `EQUIP_OVERLAYS` ⇒ b8 đỏ, `tsc` **không** bắt được vì đó là mảng thường) và khôi phục bản cũ ⇒ `QA FAIL — 6 error(s)` ở `failedAt: A`; đợt **T49A** `f4a7c21` liền trước (`claimLevelRewards` ghi hồ sơ **trước**, hỏng ⇒ trả `claimed: []`; `buyShopItem` ⇒ `reason: 'storage-unavailable'`; 1 file test `tests/t49a-reward-write-honest.test.ts` (13) = **+13 test** — bộ số của lượt đó **không** trích lại đây vì vùng hiện trạng chỉ giữ một bộ số, xem `evidence/2026-11-04-T49A/verify.txt`); đợt liền trước = HEAD **ngay sau merge `487cddb`** — `origin/main` `d6771f5` (lane khác thêm `src/services/sound.ts` + `CotuongMoveDemo.tsx` + `CotuongPieceSvg.tsx`, và **xoá `package-lock.json`** lần thứ ba ⇒ khôi phục ở `5753844`) nhập vào cùng **T48B** `3fad1b4`; trước đó là HEAD `258ec68` — đã gồm T48A `647916d` — cộng T48B trên working tree — năm hiệu ứng **dựng lại bảng chơi** thiếu `stage.nonce` trong deps (`NumberTowerGame` · `SentenceScrambleGame` · `ClockMoneyGame` · `EnglishAnimalSoundGame` · `ListenPickPhonicsGame`) và wrapper `onRestart` của `ColoringCanvasGame` bỏ `targetTier`; đợt **T47** liền trước — năm defect chạm `src/hooks/useModalHistory.ts` + `src/components/games/GameModalWrapper.tsx` (Esc không xoá ván khi tấm che "Đang tạm dừng" còn mở; `escapeOverlayKind()` route theo z-order), `src/config/policy.ts` + `src/services/decisionEngine.ts` (`resolveDailyBudgetMinutes` + `UNLIMITED_BUDGET_MINUTES`), `src/services/storage.ts` (`saveParentSettings` → `writeJSON`; Thử Thách Tuần bỏ dòng `xp=0`) + `src/hooks/useGameStage.ts` (`restartGame(targetTier)`); `STORAGE_KEYS` vẫn **18** key, **không** thêm service module nào · **5** file test của đợt T47 `tests/t47a…t47e` (7 + 10 + 7 + 6 + 7 = 37) + **1** file test của đợt T47F `tests/t47f-restart-resets-board.test.ts` (5) + **1** file test của đợt T47G `tests/t47g-wrong-turn-visual.test.ts` (6) + **1** file test của đợt T48A `tests/t48a-speak-error-not-played.test.ts` (5) + **1** file test của đợt T48B `tests/t48b-gacha-result-honest.test.ts` (8) — chạy `npm run verify` trên working tree: EXIT=0 · **42** service module (`ls src/services/*.ts | wc -l`) · **16** file `src/data/math/*.ts` (`ls src/data/math/*.ts | wc -l`):** `index--gQhs43l.js = 214 kB` → PASS trần 600 kB và **đã đạt** mục tiêu 450 kB (T39). Boot graph: 428.3 kB (3 file: index 214.0 + `react-vendor` 213.6 + `rolldown-runtime` 0.7; `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html | sed 's#^#dist/#' | sort -u | xargs wc -c | tail -1` ⇒ `438617 total`) — vẫn dưới trần 500 kB mà `tests/t39-first-load-graph.test.ts` giữ (chạy riêng file đó: `9 passed`). Bằng chứng nhìn thấy được của T48B là probe `evidence/2026-11-04-T48B/probe-t48b-gacha-save-honest.mjs` chạy trên `dist/`: A — máy ghi được ⇒ vé 5→4, sticker 0→2, đúng có hứa "Đã lưu"; B — chặn `Storage.prototype.setItem` của `kho_bau_child_profile` + `kho_bau_motivation` ⇒ màn hình nói "máy không lưu được", số vé **trước = sau** (không mất lượt vì lỗi của máy), `blockedWrites: 2`; bỏ guard ⇒ `QA FAIL — 2 error(s)` đúng bước B (`mutation-probe.txt`), đặt lại ⇒ `QA PASS — 3 step(s), 0 errors` (`probe-green.txt`). Hồi quy cùng `dist/`: `qa/gacha-machine.mjs` QA PASS 4 bước, `qa/t33-feedback-timers.mjs` QA PASS 6 bước (`probe-regression.txt`). Trước đó, bằng chứng nhìn thấy được của T47 là hai probe `evidence/2026-11-04-T47/probe-t47-escape-pause.mjs` (4 bước / 5 ảnh / exit 0: tạm dừng → `Esc` mở khoá mà ván còn nguyên, `Esc` lần hai vẫn thoát như cũ, trò không đồng hồ thì một lần `Esc` thoát ngay, và bảng "Chọn Màn & Độ Khó" vẫn là ưu tiên số một — hồi quy T46C) và `evidence/2026-11-04-T47/probe-t47e-tier-picker.mjs` (4 bước / 2 ảnh / exit 0: Màn 5 đang mở ⇒ bấm Màn 2 ⇒ bảng về **đúng** Màn 2, `unlockedTier` vẫn 5). Bằng chứng nhìn thấy được của T47F là probe `evidence/2026-11-04-T47F/probe-t47f-restart-clears-board.mjs` chạy **hai lần** trên `dist/` — bản **không** guard: QA FAIL, 3 lỗi ở đúng A2 (tháp vẫn đầy "Tầng 1 (+3)" dù điểm về 0), B2 (tàu chữ vẫn "đang chạy", `handleWordTap` nuốt mọi cú chạm) và C3 (chọn Màn 1 nhưng bảng vẫn Màn 3 ⇒ `DEF-017` lọt lại); bản **có** guard: QA PASS 5 bước / 0 lỗi / 7 ảnh. Hai bước C0 + C2 đứng nguyên giữa hai lần chạy, đó là bằng chứng trò tô màu **không** cần `stage.nonce` — tranh vốn đã bị wrapper `onRestart` xoá. Hồi quy sau sửa: `qa/games.mjs` (vòng qua **cả 31** tựa trong `GAME_TITLES`, `errors: []` → exit 0) và `qa/golden-path.mjs` (**28 bước**, 0 lỗi) — log `evidence/2026-11-04-T47F/probe-regression.txt`. Bộ số của lượt **T46** (test file / tổng test / `Duration` / tên entry / boot graph) **không trích lại ở đây** — một vùng hiện trạng chỉ giữ một bộ số; xem `evidence/2026-11-04-T46/verify.txt`. Bằng chứng nhìn thấy được của T45 là probe mới `evidence/2026-11-03-T45/probe-t45-gating.mjs` — 9 bước / 6 ảnh / exit 0, phủ (D) "lớp phủ che bảng thì phím phải chết" kèm hai bước đối chứng (bỏ lớp phủ ⇒ phím ăn lại), (C) nới giờ học bắt buộc qua cổng ba mẹ và `dailyLimitMinutes` không đổi nếu chưa qua cổng, (A) `maxGachaPerDay = 0` ⇒ nhãn `∞` và gắp liền 6 lượt; probe đặt **ngoài** `qa/` nên vẫn **30** probe. Probe `evidence/2026-11-03-T44/probe-t44-tap.mjs` của đợt liền trước đi qua **31/31** trò ở 375×812: lượt đầu đo **44** hộp chạm < 44px (`probe-t44-tap-RED-first-sweep.txt`), sau khi sửa còn **0** (`probe-t44-tap.txt`, `ok: true`). T45 **tăng 0.2 kB** entry; `Duration`, tên entry và kB của riêng đợt **T44** không trích lại ở đây (một vùng hiện trạng chỉ giữ một bộ số) — xem `evidence/2026-11-03-T44/verify.txt`. Đợt **T43** liền trước: `src/services/storage.ts` sửa `resetProgress` + **1** file test (5), `Duration` và bộ số của lượt đó **không** trích lại ở đây (một vùng hiện trạng chỉ giữ một bộ số) — xem `evidence/2026-11-03-T43/verify.txt`. Đợt **T42** (nội dung = HEAD `1deb859` cộng T42 — tám sửa lỗi chạm `src/services/storage.ts` + `cloudMerge.ts` + `cloudSync.ts` + `GameModalWrapper.tsx` + `ListenPickPhonicsGame.tsx` + `RhymeHunterGame.tsx` + `useFocusTrap.ts` + `EnglishIoeScreen.tsx` + `src/data/math/calcIn100.ts` + `types/index.ts`, **7** file test `tests/t42a-tier-picker-honest.test.ts` (5) … `tests/t42g-late-state-timers.test.ts` (4) = +45 test) đo trên đúng nội dung commit: EXIT=0 · phần tăng khi ấy **1.4 kB** cho toàn bộ tám sửa lỗi; số của lượt đó (test file / tổng test / `Duration` / tên entry / boot graph) **để nguyên trong** `evidence/2026-11-03-T42/verify.txt`, không trích lại vì vùng hiện trạng chỉ giữ một bộ số. Đợt **T41D** ngay trước đó: số đo của lượt đó (test, entry, boot graph, `Duration`) ghi trong `evidence/2026-11-03-T41D/verify-t41d.txt`, không trích lại để vùng hiện trạng chỉ giữ một bộ số; phần tăng khi ấy **5.7 kB** cho luật hợp nhất cloud (module mới nằm trong entry vì `AuthButton → cloudSync` nhập thẳng). Đợt đo thứ tư cùng ngày (`3b0122c`) **không đụng `src/`** nên hash lẫn kB đứng nguyên; đợt thứ ba (`80c7e39` + `ParentDashboardModal.tsx` + `qa/lib.mjs` + 5 test `tests/t41f-parent-gate.test.ts`) **đổi hash mà kB không đổi**; đây đúng cặp hay bị sync lệch: `src/` đổi nên entry đổi tên file, còn dung lượng thì giữ nguyên; các lần đo trước đó trong ngày (`8e6f9f5` / `afb9eeb`, và đợt 2026-11-02) **không đổi tên file entry**
ở cùng dung lượng vì những đợt đó chỉ đụng `qa/`, `tests/` và workflow — tên file của các
đợt đó khác tên hiện tại là hệ quả của đúng một commit đụng `src/` (`1afda69`).

---

## 10. Tiêu chí vào / ra (entry & exit criteria)

**Entry của một chu kỳ kiểm thử:** `npm run verify:quick` xanh tại máy; `dist/` được build từ
đúng commit đang test; không có file dữ liệu trẻ trong working tree (`progress/` gitignored).

**Exit cho PR:** `npm run verify` xanh nguyên văn output + probe tương thích §3 xanh +
`CHANGELOG.md` `[Unreleased]` có dòng + RTM được cập nhật nếu yêu đổi.

**Exit cho release (Business DoD — `BRD.md` §8):**

1. `npm run verify` xanh, dán output.
2. `qa/golden-path.mjs` trên build thật: 0 error, `failedAt` trống.
3. Không còn ISSUE P0/P1 mở; nợ ghi `docs/AUDIT_REPORT.md`.
4. Người lớn đã đọc to ≥ 1 bài/môn và xác nhận hợp trẻ 6 tuổi (§11).
5. `CHANGELOG.md` có mục version; tag `vX.Y.Z` → workflow `04-release` tạo Release + zip `dist/`.
6. Không có dữ liệu cá nhân của bé trong repo (`git status` sạch `progress/`).

---

## 11. Kiểm bằng người, không bằng máy (bắt buộc, không được bỏ)

| Việc | Cách làm | Thước đo |
|---|---|---|
| Đọc to nội dung | người lớn đọc ≥ 1 bài mỗi môn + 7 dạng câu thi; câu nào người lớn phải đọc 2 lần ⇒ sửa | biên bản ngắn trong `docs/CONTENT_GUIDE.md` hoặc `docs/AUDIT_REPORT.md` |
| Ngôn ngữ với bé | tìm chỗ nào vô tình mang nhãn tiêu cực ("chậm", "kém", "so với bạn") | 0 điểm; grep + cảm nhận |
| Thẩm mỹ bàn cờ 3D | nhìn thật trên 390 px và 1440 px | không cắt cạnh, nhãn "sông" rõ |
| Nút có đủ to không | bé thật bấm thử (hoặc găng tay để mô phỏng vận động tinh) | không lần nào trượt nút |

---

## 12. Danh sách hồi quy bắt buộc (lỗi từng xảy ra ⇒ test khoá vĩnh viễn)

| Lỗi lịch sử | Fix | Test khoá |
|---|---|---|
| Ordering chấm sai vì đáp án là chuỗi `'a\|b\|c'` | `toPipeText` trong `src/services/answerCheck.ts` | `tests/answerCheck.test.ts` (+4 ca) |
| Fatigue kẹt vĩnh viễn (chỉ `+= 1`) | `resetStaleFatigue()` + `FATIGUE_SESSION_GAP_MS` | `tests/fatigue-reset.test.ts` (8/8) |
| **Test fatigue đỏ chỉ vì đồng hồ tường**: hai ca "không reset" lấy `Date.now()` làm mốc phiên, suite chạy trong 30 phút trước nửa đêm đẩy `now` sang ngày hôm sau ⇒ quy tắc **đổi ngày** reset, code đúng vẫn đỏ (đỏ thật lúc 23:36, 2026-11-02, khi merge release vào `main`) | neo `sessionStartTime` vào `NOON_ANCHOR` (giữa trưa) + thêm ca khoá hành vi vượt nửa đêm | `tests/fatigue-reset.test.ts` — ca "đổi ngày là lý do reset ĐỘC LẬP với ngưỡng gap"; tái lập: `git show HEAD~:tests/fatigue-reset.test.ts > tests/fatigue-reset.test.ts && npx vitest run tests/fatigue-reset.test.ts` trong khung 23:30–00:00 ⇒ 1 failed |
| Word Safari không thể thắng (mọi item `isCorrect`) | 1 target + decoy, vị trí hash-seed | `tests/kidbox-learning-os.test.ts` |
| Matching LessonPlayer không bao giờ nối được cặp | sửa `handleMatch` | `tests/lesson-matching.test.ts` |
| `Math.random` làm đề không tái lập | `seededRng`/`shuffleSeeded`/`pickDistinct` | `tests/game-content.test.ts` |
| Đáp án MC luôn nằm ở `options[0]` (exploit "chọn A") | `placeAnswer` round-robin (`P36`) | `tests/competition-p36.test.ts` |
| Đọc số 70 sai ("muoi" → "mươi") | sửa data Toán | `tests/math-t11c.test.tsx`, `tests/math-typography.test.ts` |
| Ngày ảo `2026-13-99` lọt vào first-seen/tree/review | `isRealDateKey` | `tests/t14c-storage.test.ts` |
| Hạn ôn và ngày báo cáo Ba Mẹ lệch một ngày vì `toISOString().split('T')[0]` (ở UTC+7, ngày mới bắt đầu từ 07:00); cửa sổ cân bằng môn đọc giờ tường nên `decide({now})` không tái lập | `localDateKey` + tham số `now` của caller xuyên qua `decisionEngine.ts` / `learningOS.ts` | `tests/t41b-decision-clock.test.ts` |
| `run-one.mjs` exit 1 cả khi probe sạch | chỉ exit khi `errors[]`/`ok:false` | chạy thật `node qa/run-one.mjs qa/t02-smoke.mjs` |
| Cạnh dưới bàn cờ 3D bị cắt, nhãn "sông" nhoè | padding `.ct-scene`, nhãn ra lớp HTML | screenshot + `docs/cotuong.md` |

---

## 13. Phân mức lỗi & phản ứng

| Mức | Định nghĩa | Phản ứng |
|---|---|---|
| **P0** | mất/khoá dữ liệu của bé; app không mở được; nội dung sai kiến thức; bé bị gọi là "dở" | chặn merge; sửa trong phiên; thêm test khoá; ghi `docs/AUDIT_REPORT.md` |
| **P1** | một tính năng chính không đi hết đường (thi, đọc, game); tràn màn hình; TTS không hoạt động | phải xong trước release |
| **P2** | lỗi thẩm mỹ, label chưa nhất quán, hiệu năng chưa tối ưu | đưa backlog `TASK_PLAN.md`, không chặn release |

**Không có "P0 sẽ sửa sau".** Một PR để hở P0 thì CI phải đỏ (đó là lý do tồn tại
`tests/content-quality.test.ts`, `tests/p41-font-encoding.test.ts`, `check:budget`).

---

## 14. Môi trường kiểm thử

| Môi trường | Cách dựng | Dùng cho |
|---|---|---|
| Local | `npm ci` → `npm run verify` → `npm run qa:smoke` | mọi thay đổi |
| CI | `01-quality` (typecheck+`test:ci`) → `02-build-artifact` (build+budget+upload `dist/`) → `03-qa-browser` (download `dist/`, `npx playwright install --with-deps chromium`, `node qa/run-one.mjs ${probe}`) → `04-release` (tag `vX.Y.Z`, `npm run verify`, `scripts/release-notes.mjs`, zip) | gate chính thức |
| Fresh env | `docs/GOOGLE_AI_STUDIO_RUNBOOK.md` (P32 đã chứng minh) | phát hiện phụ thuộc ẩn |
| Offline | tắt mạng + reload, hoặc xoá cache qua DevTools | `qa/offline-pwa.mjs` |

**Lưu ý CI:** dùng `test:ci`, **không** dùng `npm test` (xem §5).

---

## 15. MCP trong kiểm thử: được và không được

| Được | Không được |
|---|---|
| `kbt-quality-gates` liệt kê probe, chạy gate đã whitelist | coi output MCP là bằng chứng phát hành |
| `kbt-curriculum` đếm catalog/chương trình nhanh | bỏ qua `npm run verify` |
| `kbt-game-scaffold` sinh khung game (mặc định **dry-run**) | tự ý ghi file khi chưa duyệt |
| `kbt-progress` đọc file export cục bộ để điều tra | dán dữ liệu thật của bé vào chat/PR (PII) |
| `kbt-docs` tra 171 tài liệu Markdown | tin số liệu MCP khi nó khác output lệnh thật |

---

## 16. Khoảng trống đã biết của chính bộ test (self-assessment)

| # | Khoảng trống | Rủi ro | Xử lý |
|---|---|---|---|
| 1 | Không có visual regression | đổi CSS âm thầm vỡ layout ở màn không nằm trong golden path | task C1 |
| 2 | Không có lab thiết bị thật | §7 phụ thuộc tay người, dễ quên | E3 là gate release |
| 3 | `qa/games.mjs` có thể SKIPPED do selector | 31 game không được chứng minh đủ mỗi PR | task C2 |
| 4 | Chưa có coverage gate cho `src/services/**` | test mới tập trung vào tính năng đang sửa | task C4 |
| 5 | BG-01 (% phiên bé tự học) không đo được | cloud-sync là tuỳ chọn nên vẫn không có aggregate server-side (ADR-01/ADR-16) | chỉ đo được sau E3/M4 bằng báo cáo phụ huynh |
| 8 | Cloud sync mới test bằng mock, chưa có ca nào với project Firebase thật; chưa có test "mất mạng ⇒ app vẫn học được khi đã bật sync" | tính năng đang quảng bá có thể hỏng im lặng trên máy người dùng | thêm smoke manual theo checklist + probe `qa/cloud-sync.mjs` (task EP-G1 trong TASK_PLAN) |
| 9 | Bàn cờ vua WebGL không có ca fallback khi context creation thất bại | máy cấu hình thấp chỉ thấy màn trống | test + fallback CSS (nợ #7 ARCHITECTURE §13) |
| 6 | Quota `localStorage` đầy chưa có ca | mất tiến độ ở máy dùng lâu | task B6 |
| 7 | Không có test đổi ngưỡng ⇒ đổi hành vi cho cả 17 policy block | ngưỡng bị "đóng băng" sai | task C5 |
| 10 | `tests/chess-engine-performance.test.ts:43` đo `getBestMove(depth 4)` bằng **thời gian tường** (`expect(duration).toBeLessThanOrEqual(600)`, engine tự giới hạn 400 ms) | flake trên máy CI chậm hoặc lúc máy bận — đỏ mà code không sai; trong suite đầy đủ (23.64 s) chưa quan sát thấy đỏ | khi đỏ, chạy cô lập `npx vitest run tests/chess-engine-performance.test.ts` để phân biệt flake/thật; ngưỡng nới thành `deadline + buffer` nếu CI chứng minh hụt |
| 11 | **Chưa có gate nào** quét test phụ thuộc đồng hồ tường (`Date.now()` làm mốc rồi so với ngưỡng), nên lớp lỗi này chỉ lộ ra khi suite chạy vào khung giờ unlucky (đã gặp: `tests/fatigue-reset.test.ts`, sửa 2026-11-02) | flake theo giờ trong ngày, khó tái lập khi người báo chạy lại buổi sáng | grep định kỳ `grep -rln "Date.now()" tests/ \| xargs grep -Ln "useFakeTimers" \| wc -l` ⇒ **10** file ứng viên (đo 2026-11-02, chưa rà từng ca); ưu tiên `vi.setSystemTime(mốc giữa ngày)` cho mọi ca so với ngưỡng thời gian |
| 12 | `npm run verify` trên máy phát triển **không chứng nhận** bước Install của CI, vì npm 11.6.2 (Node 24) dung được lock thiếu mục `@emnapi/*` còn npm 10 (Node 22 trong workflow) thì `EUSAGE` | `verify` EXIT=0 trên Windows song song với 4/4 workflow đỏ ở Install — đúng tình huống đã xảy ra với tag `v1.1.0` đầu tiên (`7d92246`) | trước khi đóng release, đối soát bằng `git archive HEAD \| tar -x -C /tmp/ci2 && cd /tmp/ci2 && npx --yes npm@10 ci --no-audit --no-fund` (đo 2026-11-02: EXIT=1 → sau sửa `1b8dadd` EXIT=0); bằng chứng `evidence/2026-11-02-KBT-ISSUE-43/ci-install-red.txt` |
| 13 | **MỞ (đo lại 2026-11-03, đợt hai)**: `3. Browser QA` đỏ ở bước "QA probe" trên runner Linux **bảy lượt liên tiếp** (41488045102 `66e0fea` · 41490451074 `77d90ce` · 41493791252 `2db8715` · 41494831619 `bd3f2a7` · 41496530836 `e777457` · 41498110362 `08eacc7` · 41499645998 `37fd35e`; bản đợt hai ghi "bốn lần" vì bỏ sót ba run chen giữa — kiểm kê §18), mà log trả `403 Must have admin rights to Repository` ⇒ không ai đọc nổi dòng lỗi. Race overlay đã sửa và **xanh được một lần**, nhưng cùng ngày lại **đỏ trở lại trên `8e6f9f5`** (commit chỉ đổi tài liệu) ⇒ cổng QA CI vẫn **intermittent**, chưa đóng. **Kiểm kê toàn bộ 2026-11-03 (đợt T43):** 22 lượt `main` của workflow `03` kể từ `66e0fea`, đọc `jobs[].conclusion` ⇒ **13 xanh / 9 đỏ**; **mười hai lượt xanh liên tiếp** tới `3eb7d12`, **chín lượt cuối không còn lưới** đều xanh, ba lượt trong số đó trên commit đổi `src/` (`06b8962` 4 file · `caff32a` 10 · `3eb7d12` 1). Ô này **vẫn MỞ** — chưa có probe đỏ *giả* nào bị chặn oan, và sau khi bỏ cờ cũng chưa có đỏ *thật* nào xảy ra. Lệnh + output: `evidence/2026-11-03-QA-RACE/ci-census-main-wf03.txt`, luận bàn §17–§18 `ci-gate-race.txt`. **Cập nhật 2026-11-04 (vòng chốt §23)**: kiểm kê lại **toàn bộ** bằng `jobs[].conclusion` ⇒ **22/32 lượt xanh · 9 đỏ · 1 `cancelled`** tính tới tip `a6c472b`, **tám lượt xanh liên tiếp tới tip**, **mười chín lượt cuối không còn cờ** = 18 xanh + 1 `cancelled` + 0 đỏ (vòng ba-b §22 là 21/31 tới `4659d99`) — ô này **vẫn MỞ** vì chưa có đỏ *thật* nào sau `3b0122c`; kèm phát hiện về **cú pháp lệnh**: `runs?head_sha=` chỉ nhận **SHA đủ 40 ký tự**, SHA 7 ký tự trả `total_count: 0` cho **mọi** commit nên không được dùng để kết luận "commit không được CI chạy" (§22) | 30 probe được quảng bá là "chạy trong CI" nhưng số lần xanh phía server vẫn đếm trên đầu ngón tay; `continue-on-error: true` che thành run success. Nhiều lần đỏ cùng một bước ⇒ tái lập, không phải trượt nhất thời | Đã mua được kênh đọc (annotation public — check-run 125463507371) và bắt được nguyên nhân thật: `dismissLevelUpCelebration` đếm `count()` tức thời nên bỏ sót modal "Chúc mừng bé lên cấp" mount trễ, overlay che nút (`intercepts pointer events`) — sửa trong `qa/lib.mjs` + 2 test hợp đồng `tests/t31-bug-hunt-fixes.test.ts`. **Xanh lần đầu:** run 41501753363 trên `afb9eeb` (job success, step 7 success, step 8 skipped). **Đỏ lại:** run 41504913606 trên `8e6f9f5` (job failure, step 7 failure) trong khi annotation in ra "QA PASS — 28 step(s), 0 errors" — hoá ra bước chẩn đoán **chạy lại** probe nên kể chuyện lần hai; `03-qa-browser.yml` nay để bước "QA probe" tự ghi `tee probe-run.log` + `exit "${PIPESTATUS[0]}"`, bước chẩn đoán chỉ đọc file đó, khoá bằng test hợp đồng thứ 3 (RED 1 failed / 20 passed → GREEN 21 passed). Hai suy luận phải bỏ: "0 annotation `::error::` ⇒ probe xanh" (bằng chứng bền là `jobs[].steps[].conclusion`, và endpoint annotations trả **mảng trần** chứ không có khoá `annotations`) và "xanh một lần là hết flaky". **Nơi chết thật đã đọc được** ngay lần đẩy kế tiếp (run 41508824890, check-run 125495014729): `locator.click: Timeout … waiting for getByRole('button', { name: 'Đấu Trường Thi Thử', exact: true })` ở `failedAt: SNAP_afterReading` ⇒ hoá ra **lỗi app**, không phải lỗi probe: `ParentDashboardModal` vẽ một **đề mồi cố định** ở khung hình đầu rồi mới sinh đề thật trong `useEffect([isOpen])` (effect chạy SAU paint) — MutationObserver đo 9/9 lần mở vẽ `15 + 18`, đề thật đến sau 5–114 ms; ai đọc đúng khoảnh khắc đó trả lời 33, cổng báo sai nên bảng không mở và nút "Đấu Trường Thi Thử" không tồn tại. Sửa = `useMemo(makeGateQuestion, [isOpen])` + reset trạng thái cổng ngay lúc vẽ, khoá bằng `tests/t41f-parent-gate.test.ts` (RED 5 failed → GREEN 5 passed; camera là `renderToString` vì nó chỉ vẽ khung hình đầu và **không** chạy effect) và helper `unlockParentDashboard` (probe phải **xác nhận cổng đã đóng**, tối đa 3 lượt đọc-nộp). Sau sửa: `golden-path` **4/4 lần liên tiếp** `QA PASS — 28 step(s), 0 errors`, `focus` + `mobile-golden` cũng PASS, `npm run verify` EXIT=0 (log `evidence/2026-11-03-QA-RACE/verify-1286.txt`). **Việc còn mở:** CI phía server chưa chạy lại trên commit chứa bản sửa ⇒ chưa bỏ `continue-on-error` cho tới khi thấy nhiều lượt xanh liên tiếp; commit mang tag `v1.1.0` vẫn là `77d90ce` (chạy trước **cả ba** bản sửa race) nên gate của chính bản phát hành vẫn đỏ. *(đo lại cùng ngày, sau khi push* `2d2ca27`: **vế đầu đã đóng** — run 41515106575 chạy trên đúng commit chứa bản sửa, check-run 125516556497 `success`, bước 7 "QA probe" `success` sau 66 s, bước 8 skipped, lỗi race không tái diễn trên runner Linux ⇒ tính cả cổng là **4/10 lượt xanh** (6 đỏ: 41488045102 · 41490451074 · 41493791252 · 41496530836 · 41504913606 · 41508824890 — 4 xanh: 41501753363 · 41515106575 · 41516820864 · 41518983585, **ba lượt cuối liên tiếp**). Vẫn còn: chưa đủ lượt để bỏ `continue-on-error`, và tag `v1.1.0` vẫn ở `77d90ce` — di chuyển tag đã publish là việc của người giữ repo. *(đo tiếp ngay sau đó: lượt xanh **thứ ba liên tiếp** trên `eb4b7b2` — run 41518983585, job 125529796579, bước 7 "QA probe" `success`, bước 8 skipped, 20:25:03Z→20:26:12Z = **69 s** ⇒ điều kiện trong `07_RELEASE_OPERATIONS.md` §2 đã đủ, `continue-on-error` **đã bị bỏ** trong commit `3b0122c`; từ đây probe đỏ làm đỏ cả run. **Lượt CI đầu tiên chạy mà không còn lưới cũng xanh:** run 41523226603 · job 125544242836 `success` 20:52:52Z→20:54:01Z = **69 s**, bước 7 "QA probe" `success`, bước 8 skipped ⇒ tổng **5/11 lượt xanh, bốn lượt cuối liên tiếp**. *(đo tiếp cùng ngày: lượt CI **thứ hai** không còn lưới trên `6e30794` — push chỉ `docs/` + `evidence/` + `.ai/` — run 41526285381 · job 125554732285 `success` `21:13:00Z`→`21:14:12Z` = **72 s**, bước 7 `success`, bước 8 skipped ⇒ **6/12 lượt xanh, năm lượt cuối liên tiếp**, bằng chứng ở §12 của cùng file evidence. *Lượt **thứ ba** không còn lưới cũng xanh* — `e961815` · run 41527657645 · job 125559437705 `success` `2026-11-02T21:21:54Z`→`21:22:51Z` = **57 s** (bước 7 "QA probe" `success`, bước 8 `skipped`) ⇒ **7/13 lượt xanh, sáu lượt cuối liên tiếp** (tính tới `e961815`; từ đây tỷ lệ ghi **kèm mốc commit**, xem §13 của file evidence đó: mỗi push đều sinh một lượt mới nên con số truồng sẽ lệch ngay).)* Ô 13 vẫn **MỞ** cho tới khi thấy ít nhất một lượt ĐỎ bị chặn thật (không có cờ che) — và tag `v1.1.0` vẫn ở `77d90ce`.)* *Đo lại 2026-11-03 sau T44 (§19 của `evidence/2026-11-03-QA-RACE/ci-gate-race.txt`): kiểm kê theo `jobs[].conclusion` trên mọi run `main` của workflow `03` kể từ `66e0fea` ⇒ **26 lượt = 16 xanh · 9 đỏ · 1 `cancelled`**. Bốn lượt mới: #60 `c7e9a00` success (56 s, bước 7 "QA probe" success) · #61 `8e27cd5` **cancelled** (bước 7 `skipped` — bị push `fc861f3` chen lúc đang chạy) · #62 `fc861f3` success (56 s) · #63 `58020e5` (tip của push T44) success (63 s). Commit code `6a07883` **không có run riêng** (`actions/runs?head_sha=6a07883e093d3a0f9013dde4650a029b8b6a5b27` ⇒ `total_count: 0`) vì hai commit đi trong **một** lệnh push — ghi thành `RISK-16` trong `RISK_REGISTER.md`.* *Đo lại 2026-11-04 sau T45 (§20 của `evidence/2026-11-03-QA-RACE/ci-gate-race.txt`, số đo + lệnh nguyên văn ở `ci-census-main-wf03-round2.txt`): kiểm kê lại **toàn bộ** bằng `jobs[].conclusion` ⇒ **28 lượt = 18 xanh · 9 đỏ · 1 `cancelled`** (`grep -c` trên `-round2-raw.txt` 28 dòng: 18/9/1). Hai lượt mới đều xanh: #64 41666323856 `8d73ff1` 57 s (job 126022497816, bước 7 success) · #65 41683815872 `e171e6e` (tip push T45) 60 s (job 126084122217, bước 7 success, bước 8 skipped) ⇒ chuỗi xanh **tới tip = bốn lượt liên tiếp** #62→#65, và **mười lăm lượt cuối không còn cờ** = **14 xanh + 1 cancelled + 0 đỏ**. Commit code T45 `c2a8626` lặp lại đúng khuôn cũ: `total_count: 0` ⇒ `RISK-16` có bằng chứng lần **hai**. Ô này **vẫn MỞ** — 18 lượt xanh vẫn chưa chứng minh cổng *cắt* được commit hỏng vì chưa từng có đỏ *thật* sau `3b0122c`.* *Cập nhật 2026-11-04 (§24 — **mục hiện trạng** của kiểm kê, thay §23): commit code T47 `198a6d9` push **một mình** ⇒ `total_count: 3` — mẫu *code* đầu tiên trong sổ có run của chính nó — nhưng `3. Browser QA` của nó bị lượt docs (`e0fcb6f`, đẩy sau **47 s**) chen vào cùng `concurrency` group `ci-qa-*` và hủy (`cancel-in-progress: true`, `.github/workflows/03-qa-browser.yml:17-19`); kiểm tra `jobs[].steps[]` thì **bước 7 "QA probe" đã `success`** trước lúc hủy. Kiểm kê chốt tới tip `e0fcb6f`: **24/35 lượt xanh cấp job · 9 đỏ · 2 cancelled**, chuỗi xanh tới tip **1**. Ô này **vẫn MỞ** — lượt bị hủy **không phải** lượt đỏ, và sau `3b0122c` vẫn chưa có đỏ *thật* nào bị cổng chặn.* |

---

## 17. Phụ lục — bộ lệnh đầy đủ

```bash
npm ci                       # cài đúng theo package-lock.json
npm run hooks:install        # một lần sau khi clone

npm run verify               # cổng duy nhất: typecheck + test:ci + build + check:budget
npm run verify:quick         # typecheck + test:ci (pre-push)
npm run test:ci              # chỉ test (CI dùng cái này)
npm run build
npm run check:budget

npm run qa:smoke             # = node qa/run-one.mjs qa/golden-path.mjs
npm run qa:games
node qa/run-one.mjs qa/responsive-a11y.mjs
node qa/run-one.mjs qa/mobile.mjs
node qa/run-one.mjs qa/mobile-golden.mjs
node qa/run-one.mjs qa/offline-pwa.mjs
node qa/run-one.mjs qa/question-types.mjs
node qa/run-one.mjs qa/lesson-types.mjs
node qa/run-one.mjs qa/decision-engine.mjs
node qa/run-one.mjs qa/audio.mjs
node qa/run-one.mjs qa/focus.mjs
node qa/run-one.mjs qa/kidbox-focus.mjs

# MCP (manh mối, không phải bằng chứng)
node mcp/devclient.mjs mcp/quality-gates.mjs list_qa_probes
```

Cần biến môi trường: `PORT` (preview, mặc định 4173), `PW_CHROME` (đường dẫn Chromium),
`CI` (thêm `--no-sandbox`).
