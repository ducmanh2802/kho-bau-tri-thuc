# T47 — bug hunt đợt 3: Esc/lớp phủ, quyền ba mẹ, lịch sử phần thưởng, bảng chọn màn

**Năm** defect sửa trong một đợt, mỗi cái có test **đỏ trước khi sửa** và (nơi sửa UI) có
**bằng chứng nhìn thấy được trên `dist/`** theo `AGENTS.md` §1.3.

Lệnh tái lập cả thư mục này:

```bash
cd /d/trithuc/kho-bau-tri-thuc
npx vitest run tests/t47a-escape-resumes-pause-veil.test.ts      # từng bước RED/GREEN
npm run build
node qa/run-one.mjs evidence/2026-11-04-T47/probe-t47-escape-pause.mjs
node qa/run-one.mjs evidence/2026-11-04-T47/probe-t47e-tier-picker.mjs
for p in games focus golden-path parent-controls; do node qa/run-one.mjs qa/$p.mjs; done   # hồi quy §4.1
npm run verify                                                   # cổng, EXIT=0
```

`verify.txt` là lần chạy trên nội dung T47; `verify-final.txt` là lần chạy **ngay trước khi commit**,
sau khi chỉ sửa chú thích/số dòng trong `src/`, test và docs. Hai lần khớp nhau ở mọi chỉ tiêu
(`Test Files 118 passed (118)` · `Tests 1497 passed (1497)` · `Main chunk: index-vqb0Kx4n.js =
211.1 kB → PASS`), chỉ khác `Duration` — **27.64s** và **29.25s** — vì đó là thời gian thực của máy,
không phải số liệu kiểm kê. Hash entry **không đổi** giữa hai lần ⇒ bản `dist/` dùng cho hai probe
ở §3 là đúng bản đang commit (chú thích bị minifier cắt, nên byte code không lệch).

## 1. Năm defect

| # | Bệnh (đọc được từ nguồn) | Sửa | Khoá bởi |
|---|---|---|---|
| T47A | `useModalHistory` nghe `keydown` trên `window`, chỉ khai lớp phủ "Chọn Màn & Độ Khó" ⇒ bé bấm **Esc lúc đang Tạm dừng** là mất luôn ván (`DEF-013` phần còn lại) | `GameModalWrapper.tsx:202-215` khai thêm tấm che "Đang tạm dừng" (chỉ khi `isRealtime && isPaused && onTogglePause` tồn tại); `escapeOverlayKind()` xếp thứ tự z: bảng chọn (z-50) trước tấm che (z-20) | `tests/t47a-escape-resumes-pause-veil.test.ts` (7) + `tests/t46c-escape-closes-overlay-first.test.ts` (7) + probe `probe-t47-escape-pause.mjs` |
| T47B | nhánh tính `budgetMinutes` trong `DecisionEngine.decide()` (`decisionEngine.ts:1160`, trước đó `input.budgetMinutes ?? (dailyLimitMinutes \|\| DEFAULT_BUDGET_MINUTES)`) ⇒ ba mẹ chọn **"Không giới hạn" (0)** bị ép thành **20 phút**, trong khi `App.tsx:167-168` vẫn hiểu 0 là không chặn (`overLimit = settings.dailyLimitMinutes > 0`) — cùng một quyền, hai ngữ nghĩa | `resolveDailyBudgetMinutes()` mới (export) + `P39_DECISION_POLICY.UNLIMITED_BUDGET_MINUTES: 240` (hữu hạn, vì `JSON.stringify(Infinity)` ra `null`); trần phiên `FULL_MAX_MINUTES: 20` giữ nguyên | `tests/t47b-unlimited-daily-budget.test.ts` (10) |
| T47C | `StorageService.saveParentSettings` gọi `localStorage.setItem` thô, bỏ qua `writeJSON` — mà `writeJSON` là chỗ **duy nhất** phát `kho_bau_storage_change`, thứ `cloudSync.ts:106` nghe để hẹn giờ auto-sync ⇒ cài đặt của ba mẹ (giờ học, phần thưởng, độ khó) không bao giờ rời khỏi máy đang gõ | `storage.ts:1274-1276` ghi qua `writeJSON(STORAGE_KEYS.PARENT_SETTINGS, settings)` | `tests/t47c-parent-settings-broadcast.test.ts` (7) |
| T47D | `recordWeeklyChallengeCompleted` nối `addRewardHistory({ type:'xp', amount:0, … })` **ngoài** nhánh "lần đầu" ⇒ mỗi lần mở lại bảng, lịch sử phần thưởng của ba mẹ nhận thêm một dòng +0 và trần 50 mục (`addRewardHistory` định nghĩa ở `storage.ts:2618`, cắt ở `:2624`) bị số vô nghĩa chiếm chỗ (phạm nguyên tắc T41C "chỉ in số thật sự vào túi bé") | bỏ dòng +0 (phần thưởng thật do engine nhiệm vụ ghi ở `storage.ts:1629`) | `tests/t47d-weekly-challenge-zero-reward-row.test.ts` (6) + hồi quy `t01`, `t18a`, `t40`, `t45e` |
| T47E | bảng "Chọn Màn & Độ Khó" vẽ nút "Chọn →" cho **mọi** màn, nhưng `handleSelectTier` chỉ ghi mở khoá (`selectGameTier` = `Math.max`) rồi gọi `onRestart()` cụt; `restartGame` lấy màn từ `unlockedTier` ⇒ bé ở Màn 5 chọn Màn 2 thì **mất điểm mà bảng vẫn Màn 5**. `stage.jumpToTier` đã viết để làm việc này nhưng không nơi nào gọi | `restartGame(targetTier?)` (`useGameStage.ts:218`, khai kiểu ở `:93`), wrapper truyền `onRestart(t)`; xoá `jumpToTier` chết để chỉ còn **một** đường đổi màn | `tests/t47e-tier-picker-easier.test.ts` (7) + probe `probe-t47e-tier-picker.mjs` |

## 2. RED trước khi sửa (bất buộc — `docs/lifecycle/05_IMPLEMENTATION_LOOP.md`)

| File log | Lệnh | Kết quả |
|---|---|---|
| `tests-RED-initial.txt` | `npx vitest run tests/t47a-…test.ts` (trước GREEN) | `Tests 6 failed \| 1 passed (7)` — đỏ vì chốt Esc chưa khai tấm che |
| `tests-RED-t47b.txt` | `npx vitest run tests/t47b-…test.ts` | `Tests 9 failed \| 1 passed (10)` |
| `tests-RED-t47c.txt` | `npx vitest run tests/t47c-…test.ts` | `Tests 2 failed \| 5 passed (7)` — đỏ thật: `expected [] to include 'kho_bau_parent_settings'` |
| `tests-RED-t47d.txt` | `npx vitest run tests/t47d-…test.ts` | `Tests 4 failed \| 2 passed (6)` — `expected 3 to be less than or equal to 1` (ba dòng +0 cho một lần chơi) |
| `tests-RED-t47e.txt` | `npx vitest run tests/t47e-…test.ts` | `Tests 4 failed \| 3 passed (7)` |

Ghi chú trung thực về **loại đỏ**: T47B và T47E chủ yếu đỏ vì *hợp đồng nguồn/chữ ký chưa tồn
tại* (`resolveDailyBudgetMinutes` chưa export, `restartGame` chưa nhận `targetTier`). Repo chạy
test ở môi trường node, không jsdom, không render hook ⇒ với hai defect đó bằng chứng hành vi
nằm ở tầng khác: T47B dùng `buildDailyPlan` thật (20 phút cắt còn <5 hoạt động, "Không giới hạn"
giữ đủ 5) và T47E dùng probe trên `dist/` (mục 4).

## 3. Ablation — bỏ chốt thì test có đỏ không?

| Log | Bỏ gì | Kết quả | Nhận xét |
|---|---|---|---|
| `mutation-1-veil-declared.txt` | `GameModalWrapper.tsx:205` → `const pauseVeilOpen = false;` | `Tests 1 failed \| 13 passed (14)` | Chỉ **một** test bắt được: khuôn `overlayOpen: …topOverlay…` vẫn khớp vì cái tên còn nguyên trong nguồn. Bài học: test nguồn khoá *khai báo*, không khoá *hành vi* ⇒ phải có probe (mục 4). |
| `mutation-2-hook-guard.txt` | `useModalHistory.ts` → `shouldEscapeCloseOverlay` trả `false` | `Tests 2 failed \| 12 passed (14)` | Đỏ ở cả T47A và T46C — đúng hai test hành vi. |

## 4. Bằng chứng nhìn thấy được trên `dist/` (UI/game ⇒ bắt buộc)

| File | Lệnh | Verdict |
|---|---|---|
| `probe-t47-escape-pause.mjs` → `probe-t47-GREEN.txt` | `npm run build && node qa/run-one.mjs evidence/2026-11-04-T47/probe-t47-escape-pause.mjs` | **QA PASS — 4 bước / 0 lỗi**, `ok: true`. Số then chốt: `veilAfterPause=1` → `esc1={veilAfterEsc:0, stillInGame:1}` (Esc mở khoá, ván còn nguyên), `esc2.inGameAfterTwoEsc=0` (Esc thứ hai vẫn thoát — phím không bị nuốt), `noClockAfterEsc=0` (trò không đồng hồ thoát ngay lần một), `tierAfterEsc={panelAfterEsc:0, gameAfterTierEsc:1}` (bảng chọn vẫn ưu tiên số một) |
| `probe-t47-RED-no-guard.txt` | cùng probe trên build **bỏ chốt** (`pauseVeilOpen = false`) | **QA FAIL — 3 lỗi, `failedAt: "A"`**: `esc1.stillInGame=0` ⇒ đúng hành vi cũ của `DEF-013`. Hai lỗi còn lại là hệ quả dây chuyền (hết ván nên không còn nút Tạm dừng để bấm) |
| `probe-t47e-tier-picker.mjs` → `probe-t47e-GREEN.txt` | build lại, chạy probe | **QA PASS — 4 bước / 0 lỗi**: `headerBefore="🌟 Màn 5/6 ▾ · 🚀 Câu 1/8"` → bấm Màn 2 → `headerAfterPick="🐥 Màn 2/6 ▾ · 🚀 Câu 1/6"`, `progressAfterPick.unlockedTier=5` (chọn màn dễ **không** tụt tiến độ — bất biến T42/A), `inGameAfterEsc=0` |
| `probe-t47e-RED-no-guard.txt` | cùng probe trên build **bỏ chốt** (`onRestart(t)` → `onRestart()`) | **QA FAIL — 1 lỗi tại D2**: `headerAfterPick` vẫn `"🌟 Màn 5/6 ▾"` ⇒ chứng minh bệnh thật trên máy chủ |
| Ảnh | `a1-…a3`, `b1`, `c1`, `d1`, `d2` (PNG, màn 390×844) | `a1` tấm che "Đang tạm dừng" phủ bảng · `a2` Esc lần một: bảng hiện lại, ván còn · `a3` sau Esc lần hai: đã thoát · `b1` trò không đồng hồ · `c1` bảng "Chọn Màn & Độ Khó" mở · `d1` bảng chọn đang mở ở Màn 5 · `d2` sau khi chọn Màn 2, header thành Màn 2/6 |

## 4.1 Hồi quy chạy tay trên đúng build cuối (`RISK-18`: một lượt CI chỉ chạy `golden-path`)

Bốn probe trong `qa/`, output lưu nguyên văn (đã bỏ mã màu) ở `qa/` của thư mục này —
`node qa/run-one.mjs qa/<probe>.mjs`, cả bốn **exit 0**:

| File log | Verdict | Vì sao phải chạy tay ở đợt này |
|---|---|---|
| `qa/games.txt` | `QA PASS — 0 step(s), 0 errors`, `catalogCount: 31` | `useGameStage` + `GameModalWrapper` đổi chữ ký (`restartGame(targetTier?)`, `onRestart(t)`) mà **mọi** modal trò chơi dùng |
| `qa/golden-path.txt` | `QA PASS — 28 step(s), 0 errors` | luồng chính chạm tab Cài đặt ba mẹ (`saveParentSettings` nay đi qua `writeJSON`) |
| `qa/focus.txt` | `QA PASS — 0 step(s), 0 errors` | thêm lớp phủ route Esc không được phá bẫy focus |
| `qa/parent-controls.txt` | `QA PASS — 7 step(s), 0 errors` | `dailyLimitMinutes: 0` đổi ngữ nghĩa trong `decisionEngine` |

## 5. Anti-tự-mạn: test nào phải đổi vì bản sửa, và vì sao

- `tests/t46c-escape-closes-overlay-first.test.ts` #5: trước đây tìm `showTierModal` trong 400 ký
  tự sau `useModalHistory(onExit`; T47A moved state lên **trên** nơi gọi (vì `escapeOverlayKind`
  cần cả hai lớp phủ) ⇒ cập nhật thành đối chứng `tierPickerOpen: showTierModal`, **giữ nguyên
  bất biến** (nguồn trạng thái vẫn đúng một biến `showTierModal`, vẫn không dựng listener thứ hai).
- `tests/t43-game-pause.test.ts` "sang màn / chơi lại / nhảy màn đều nhả tạm": đếm
  `setPausedByUser(false)` ≥ 4 vì có **ba** đường đổi màn. T47E gộp `jumpToTier` (code chết, chưa
  từng được gọi) vào `restartGame(targetTier)` ⇒ còn hai đường, cập nhật thành ≥ 3 và khoá thêm
  chữ ký `const restartGame = (targetTier?: number)`. Không hạ thấp chốt: vẫn yêu cầu *mọi* lối
  đổi màn nhả trạng thái tạm.
- **Không** có test cũ nào bị xoá. `tests/t40-parent-facing-ids.test.ts` và `t01`, `t18a`, `t45e`
  vẫn xanh nguyên sau khi bỏ dòng +0 (đã chạy lại — `tests-GREEN-t47d.txt`, `73 passed`).

## 6. Bảng md5 trước/sau của file chốt (phòng mất bản chưa commit — bài học `git checkout --`)

Bản GREEN được sao ra `/tmp/*.GREEN.*` **trước** khi ablation, hoàn tác bằng `cp` (không dùng
`git checkout --` cho file đang có sửa chưa commit). Đối chiếu cuối đợt:

| File | md5 bản GREEN đã ablation | md5 cuối (sau `cp` trả về) | Khớp |
|---|---|---|---|
| `src/hooks/useModalHistory.ts` | `df4f252b4a16574db93e137bc1600efa` | `df4f252b4a16574db93e137bc1600efa` | ✅ |
| `src/components/games/GameModalWrapper.tsx` (T47A) | `64fbe3d91ccabf8a11449be998a6ea16` | khớp sau `cp /tmp/GameModalWrapper.GREEN.tsx` | ✅ |
| `src/components/games/GameModalWrapper.tsx` (sau T47E) | `5382dd9fb825b8d52cd0f7ccbfd553ca` | `md5sum -c /tmp/T47E.GREEN.md5` → `OK` | ✅ |

Còn lại là các file sửa trong đợt (không ablation): `src/hooks/useGameStage.ts`
`03470ab71eaf782ddcd052f7dbf1f1c2` · `src/services/decisionEngine.ts`
`a2e10f9df851de8c57b209c396305887` · `src/services/storage.ts` `6db3f73966e033b8d42557f2e9ce7062`
· `src/config/policy.ts` `14c6c27066f3c31eb22c52a5cb4697d4`.
Kiểm tra nhanh không còn mutation dở: `grep -c ABLATION src/**/*.ts*` ⇒ **0**,
`git status --short src` chỉ liệt kê 6 file sửa có chủ đích.

## 7. Chưa làm trong đợt này (ghi để khỏi mất dấu)

Ba defect do sub-agent săn game báo, **đã đối chiếu nguồn, xác nhận thật**, nhưng chưa sửa vì
mỗi cái cần quyết định thiết kế riêng (không nhét thêm vào một commit đã có 5 defect):

1. **T47F — "Chơi lại" không xoá trạng thái bảng.** `NumberTowerGame.tsx:21-23` reset
   `towerBlocks` chỉ theo `[stage.tier]`, không theo `stage.nonce` ⇒ chơi lại cùng màn thì chồng
   gạch cũ vẫn nằm trên tháp của đề mới (đếm không khớp hình). `SentenceScrambleGame.tsx:25-28`
   cùng họ lỗi (có `roundIdx` trong deps nên thường tự lành, vẫn còn ca bấm chơi lại giữa vòng).
2. **T47G — lượt sai của 5 trò chỉ có âm thanh.** `ShapeSortingGame.tsx:25-29`,
   `OceanFishingGame.tsx:33-36`, `NumberTowerGame.tsx:32-35`, `MathSpeedRacingGame.tsx:53-56`,
   `SentenceScrambleGame.tsx:51-54` gọi `sound.playWrong()` + `stage.submitWrong()` mà không qua
   `useGameFeedback`/`reportWrong` ⇒ mascot buồn, praise toast và cơ chế "sai 2 lần hiện đáp án"
   (`GameModalWrapper.handleWrong`) **không bao giờ chạy** ở 5 trò này; vi phạm `AGENTS.md` §3
   "mọi lượt đúng/sai có phản hồi âm thanh + hình ảnh". `t44e-wrong-answer-feedback.test.ts` chỉ
   khoá `SubjectScreen.tsx` nên không bắt được. Đo: `grep -L useGameFeedback src/components/games/*.tsx`
   = **17** file, `grep -l playWrong` = **30** file.
3. **Độ khó màn 5-6 không tăng như policy.** `src/data/games/phonics_pop.ts:93-100` chỉ xáo 3
   phương án hard-code, không gọi `tierOptionCount` (`PhonicsPopGame.tsx:86` đóng khung
   `grid-cols-3`), trong khi `TIER_OPTION_COUNT = [4,4,5,5,6,6]` ⇒ Màn 5-6 vẫn 3 lựa chọn, sao dễ
   kiếm hơn policy. `src/data/games/shape_sorting.ts:68-75` `SHAPE_POOL.slice(0, 10)` cho Màn 1-2
   chỉ chứa `tron`/`vuong` ⇒ 2 trong 4 rổ không bao giờ có đồ, đáp án đúng đoán được bằng loại trừ.

Một defect phụ phát hiện khi viết probe (chưa sửa, chỉ ghi): `GameModalWrapper.tsx:618` in
"Màn tiếp theo đã mở **khóa**". Đo 2026-11-04: `grep -rn "mở khóa" src/ | wc -l` ⇒ **5** (trải trên
5 file: `AchievementsGardenScreen`, `CompetitionHubScreen`, `GameModalWrapper`, `GamesHubScreen`,
`AvatarShopScreen`) trong khi `grep -rn "mở khoá" src/ | wc -l` ⇒ **14** — tức biến thể "khóa" là
một nhóm chuỗi, không phải một chỗ lệch duy nhất, và `GameModalWrapper.tsx` dùng **cả hai** trong
cùng một file (1 × "khóa", 3 × "khoá"). Thuộc nhóm chuỗi hiển thị ⇒ sửa phải grep `qa/*.mjs` trước
(bài học "đổi chuỗi UI làm probe đỏ").
