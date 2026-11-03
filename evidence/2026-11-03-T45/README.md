# T45 — bằng chứng đợt năm defect (2026-11-03)

Repo `D:\trithuc\kho-bau-tri-thuc`, HEAD trước đợt = `8d73ff1` (`main`). Năm defect đi kèm bằng
chứng ở đây:

| lát | defect | file hợp đồng | ablation |
|---|---|---|---|
| T45A | `maxGachaPerDay` của ba mẹ bị máy gắp bỏ qua: màn tự đặt `MAX_DAILY_DRAWS = 5`, `drawGacha()` quy `0 → 5` trong khi UI dashboard ghi "0 = không giới hạn" | `tests/t45a-gacha-parent-limit.test.ts` (5 test) | `ablation-A3-gacha-zero-means-five-RED.txt` |
| T45B | "Tắt phần thưởng" bị `checkAchievements()` và `recordCompetitionResult()` đi vòng qua (4 nơi gọi, 2 nơi có chốt) | `tests/t45b-rewards-off-competition.test.ts` (6 test) | `ablation-A1-checkAchievements-guard-RED.txt`, `ablation-A2-competition-reward-guard-RED.txt` |
| T45C | bé bấm nút "Ba mẹ: Cho phép học thêm 10 phút" ⇒ `App.tsx` ghi thẳng `dailyLimitMinutes + 10`, không qua cổng nào | `tests/t45c-screen-time-parent-gate.test.ts` (6 test) | — (đóng bằng probe mục B, xem §"vì sao mục B cần 3 bước") |
| T45D | lớp phủ "Chọn Màn & Độ Khó" che bảng chặn chuột nhưng **không** chặn `keydown` trên `window` ⇒ bé nộp đáp án sau lớp phủ | `tests/t45d-overlay-blocks-keyboard.test.ts` (7 test) | `ablation-A4-input-ignores-overlay-RED.txt` |
| T45E | Thử Thách Tuần phát id cố định `weekly-challenge-week-1`; `completedWeeklyChallenges` là **tập id** ⇒ stat kẹt ở 1, thành tựu `ach_weekly_3` không thể đạt | `tests/t45e-weekly-challenge-rotation.test.ts` (7 test) | `ablation-A5-weekly-id-constant-RED.txt` |

Sổ lỗi: `docs/plan/RISK_REGISTER.md` §2 `DEF-005`…`DEF-009`; hệ quả chưa sửa (pool câu của Thử
Thách Tuần vẫn cố định theo `getAllQuestions()`) ghi ở §1 `RISK-17`.

## Lệnh tái lập

```bash
cd /d/trithuc/kho-bau-tri-thuc
npm run verify                                   # → verify.txt (EXIT=0, log đã bỏ mã ANSI)
npx vitest run tests/t45a-gacha-parent-limit.test.ts tests/t45b-rewards-off-competition.test.ts \
               tests/t45c-screen-time-parent-gate.test.ts tests/t45d-overlay-blocks-keyboard.test.ts \
               tests/t45e-weekly-challenge-rotation.test.ts        # → 5 file / 31 test passed
npm run build
node qa/run-one.mjs evidence/2026-11-03-T45/probe-t45-gating.mjs  # → probe-t45-gating.txt + .json + 6 PNG
node qa/run-one.mjs qa/games.mjs                                 # → 31 trò, hồi quy T45D
node qa/run-one.mjs qa/golden-path.mjs
node qa/run-one.mjs qa/parent-controls.mjs
node qa/run-one.mjs qa/mobile.mjs
node qa/run-one.mjs qa/focus.mjs
grep -o "assets/[A-Za-z0-9_.-]*\.js" dist/index.html | sed "s#^#dist/#" | sort -u \
  | xargs wc -c | tail -1                                            # → 435696 total
```

`run-one.mjs` tự bật `vite preview` ở `PORT` (mặc định 4173, `--strictPort`); nếu tiến trình khác
đang giữ cổng thì thêm `PORT=4187` trước mỗi lệnh. Probe đọc `dist/` nên **phải** build trước.

## Số đo hiện trạng của đợt này

- `npm run verify` → EXIT **0** · `Test Files 110 passed (110)` · `Tests 1441 passed (1441)` ·
  `Duration 25.82s` · `Main chunk: index-C5J1ceAM.js = 211.2 kB → PASS (meets 450 kB goal)`.
  Trước đợt T45 (HEAD `8d73ff1`, đo ở `evidence/2026-11-03-T44/verify.txt`): 105 file / 1410 test
  ⇒ **+5 file / +31 test**; `src/` đổi nên entry **đổi cả hash lẫn kB**.
- Boot graph lần vẽ đầu: `435696 total` byte = **425.5 KiB** (docs giữ nhãn `kB`, vì
  `check:budget` chia cho 1024), dưới trần 500 kB mà `tests/t39-first-load-graph.test.ts` giữ.
- `verify-postdocs.txt` — chạy lại `npm run verify` **sau** đợt sync docs (nội dung `src/` không đổi):
  vẫn `110 file / 1441 test` và `index-C5J1ceAM.js = 211.2 kB`, nhưng `Duration 31.18s` thay vì
  `25.82s`. `Duration` là số **phụ thuộc tải máy** (lượt này chạy song song năm probe Playwright) ⇒
  tài liệu lấy số của `verify.txt`, còn `31.18s` chỉ là bằng chứng lượt tái lập cũng xanh.
- Kiểm kê không đổi: **42** service module (`ls src/services/*.ts | wc -l`), **30** probe QA
  (`ls qa/*.mjs qa/*.cjs` trừ `lib.mjs`/`run-one.mjs`), **31/31/31/31** trò ở bốn nơi đăng ký.

## Ablation — bỏ từng chốt, test phải đỏ

Mỗi lần: sửa guard thành `if (false && …)` (hoặc trả lại hằng số cũ), chạy **một** file test,
rồi `git checkout -- src/<file>.ts` ngay. Log nguyên văn, đã bỏ mã ANSI.

| log | chốt đã bỏ | đỏ ở đâu | sau khi hoàn tác |
|---|---|---|---|
| `ablation-A1-checkAchievements-guard-RED.txt` | `if (!areRewardsEnabled()) return;` trong `checkAchievements()` | `Tests 2 failed \| 4 passed (6)` | `t45b` xanh lại |
| `ablation-A2-competition-reward-guard-RED.txt` | nhánh `if (rewardsEnabled)` bọc cộng xp/sao khi ghi kết quả thi | `Tests 2 failed \| 4 passed (6)` | `t45b` xanh lại |
| `ablation-A3-gacha-zero-means-five-RED.txt` | `getGachaDailyLimit()` trả `5` khi `0` (hành vi bản cũ) | `Tests 2 failed \| 3 passed (5)` | `t45a` xanh lại |
| `ablation-A4-input-ignores-overlay-RED.txt` | `isGameInputBlocked()` bỏ `overlayOpen` | `Tests 1 failed \| 6 passed (7)` | `t45d` xanh lại |
| `ablation-A5-weekly-id-constant-RED.txt` | `weeklyChallengeIdOf()` trả lại id cố định | `Tests 4 failed \| 3 passed (7)` | `t45e` xanh lại |

## Probe gating — vì sao phải có bước đối chứng

`probe-t45-gating.mjs` **nằm ngoài `qa/`** có chủ đích: `qa/*.mjs` được đếm là probe, đặt vào đó sẽ
làm số probe nhảy lên 31 mà không ai thêm probe học thật. Chạy:
`node qa/run-one.mjs evidence/2026-11-03-T45/probe-t45-gating.mjs` ⇒ `QA PASS — 9 step(s), 0 errors`,
`probe-t45-gating-rc.txt` (exit 0 ở **lượt 3**; lượt 1–2 đỏ là lỗi của chính probe — `document.querySelector`
không hiểu `:has-text()` của Playwright, và `unlockParentDashboard` bấm nút "Ba Mẹ" bị lớp phủ chặn —
**không** phải lỗi sản phẩm).

| mục | nội dung đo | kết quả (`facts` trong `.json`) |
|---|---|---|
| A1 đối chứng | 2 phím mũi tên khi **không** có lớp phủ | `🐸 Ếch đang ở số 1` → `… số 0` (chứng minh phím còn ăn, A3 không đỏ vì bàn phím chết) |
| A2 | hit-test `elementFromPoint` giữa bảng khi mở "Chọn Màn & Độ Khó" | `topTag: "div"`, `mouseBlocked: true`, `dialogRect 390×844` (ảnh `a2-lop-phu-che-bang.png`) |
| A3 | 4 phím mũi tên **sau** lớp phủ | `keyboardCovered.before == after` = `🐸 Ếch đang ở số 0`, nhãn `🐣\nMàn 1/6 ▾\n· 🚀 Câu 2/5` không nhảy câu |
| A4 đối chứng | đóng lớp phủ rồi bấm lại | `số 0` → `số 2` (chặn là **do lớp phủ**, không phải do vô hiệu hoá vĩnh viễn; ảnh `a4-sau-khi-dong-lop-phu.png`) |
| B1 | nhãn màn nhắc nghỉ | `askParent: true`, `selfServe: false` — không còn nút tự cộng 10 phút (`b1-man-nhac-nghi.png`) |
| B2 | bấm "Nhờ ba mẹ cho học thêm" | mở `Cổng Xác Nhận Phụ Huynh`, `dailyLimitMinutes` **vẫn 1** |
| B3 | tự giải cổng phép tính (tối đa 3 lượt) | `limitAfterGate: 1`, `modalGone: true` — qua cổng không tự nới giờ; người lớn phải sửa trong tab Cài đặt (`b3-bang-ba-me.png`) |
| C1 | `maxGachaPerDay = 0`, rewards **bật** | `infinityShown: true`, `blockedLabel: false` (`c1-gacha-infinity.png`) |
| C2 | gắp liền 6 lượt (vượt trần cũ 5) | `Hôm nay: 6 / ∞ lượt`, vé `8 → 2` (`c2-sau-6-luot.png`) |

Mục B cần **ba** bước vì một mình bước "mở cổng" không phân biệt được hai thiết kế sai: bản cũ cũng
mở được dashboard. Điều kiện đo được là giới hạn giờ **không đổi** khi bé tự đi hết đường (B2 *và* B3),
và `rewardsEnabled` phải bật ở mục C — nếu tắt thì máy gắp chặn vì một lý do khác và C2 không còn
đo `maxGachaPerDay`.

## Hồi quy trên `dist/` (log trong `qa/`)

T45D đổi chốt bàn phím ở **10** component trò chơi và T45C đổi một luồng cha mẹ, nên chạy tay năm
probe mà CI **không** chạy (một lượt CI chỉ chạy `qa/golden-path.mjs` — ghi là `RISK-18`):

| probe | log | kết quả |
|---|---|---|
| `qa/golden-path.mjs` | `qa/golden-path.txt` | `QA PASS — 28 step(s), 0 errors` (exit 0) |
| `qa/games.mjs` | `qa/games.txt` | `QA PASS — 0 step(s), 0 errors`, `catalogCount: 31`, `errors: []` ⇒ cả **31** trò mở–chơi–thoát bình thường với chốt `inputBlocked` mới (exit 0) |
| `qa/parent-controls.mjs` | `qa/parent-controls.txt` | `QA PASS — 7 step(s), 0 errors` (exit 0) |
| `qa/focus.mjs` | `qa/focus.txt` | `QA PASS — 0 step(s), 0 errors` (exit 0) |
| `qa/mobile.mjs` | `qa/mobile.txt` | `QA PASS — 0 step(s), 0 errors` (exit 0) |

## CI (đo sau push)

Push `8d73ff1..e171e6e` (hai commit một lượt). Pre-push hook chạy `npm run verify` trên tip:
`Test Files 110 passed (110)` · `Tests 1441 passed (1441)` · `Duration 26.51s` · `✔ Pre-push: passed`.

| Workflow | run | job | commit được đo | kết quả | thời lượng | bước 7 "QA probe" | bước 8 |
|---|---|---|---|---|---|---|---|
| `1. Quality` | 41683815885 | — | `e171e6e` (tip) | success | — | — | — |
| `2. Build + artifact` | 41683815929 | — | `e171e6e` | success | — | — | — |
| **`3. Browser QA`** | **41683815872** | 126084122217 `golden path trên Chromium` | `e171e6e` | **success** | `17:23:44Z→17:24:44Z` = **60 s** | `success` | `skipped` |

`c2a8626` (commit **code** của đợt này) **không có run nào**: `curl -s
https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/actions/runs?head_sha=c2a8626` ⇒
`total_count: 0`. Đây là lần **thứ hai** gặp khuôn "hai commit một push ⇒ chỉ tip được probe" (lần đầu
`6a07883` của T44) nên `RISK-16` vẫn MỞ; hệ quả thật: **không lượt CI nào chạy `qa/*` trên đúng bộ
`src/` của T45**, phần hồi quy 31 trò ở mục trên chỉ có ở cấp máy.

Kiểm kê lại toàn bộ workflow `03` trên `main` (vòng hai, `../2026-11-03-QA-RACE/ci-census-main-wf03-round2.txt`):
**28 lượt = 18 xanh · 9 đỏ · 1 `cancelled`**, chuỗi xanh tới tip = **4**, mười lăm lượt cuối không còn
cờ = **14 xanh + 1 cancelled + 0 đỏ**. Ô 13 `docs/plan/TEST_PLAN.md` §16 **vẫn MỞ** — chưa có probe đỏ
*thật* nào xảy ra sau khi bỏ `continue-on-error`, nên 18 lượt xanh mới chứng minh cổng *chạy*, chưa
chứng minh cổng *cắt*.

## Ảnh

`a2-lop-phu-che-bang.png`, `a4-sau-khi-dong-lop-phu.png`, `b1-man-nhac-nghi.png`,
`b3-bang-ba-me.png`, `c1-gacha-infinity.png`, `c2-sau-6-luot.png` — chụp lúc 390×844 (thiết bị
giả lập iPhone trong probe).
