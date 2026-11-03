# T42 — bằng chứng đợt sửa bug (2026-11-03)

Mọi con số/dòng dưới đây do lệnh thật trong phiên này đo, repo `D:\trithuc\kho-bau-tri-thuc`,
HEAD trước đợt = `1deb859` (main), các sửa đổi chưa commit khi viết file này.

## Lệnh tái lập

```bash
cd /d/trithuc/kho-bau-tri-thuc
npm run verify                                   # → verify.txt (EXIT=0)
node scripts/check-bundle-budget.mjs             # → check-budget.txt
npx vitest run tests/t42a-tier-picker-honest.test.ts tests/t42b-listen-pick-answer.test.ts \
  tests/t42c-focus-trap-typing.test.ts tests/t42d-corrupt-storage-guard.test.ts \
  tests/t42e-resource-touch-clock.test.ts tests/t42f-digit-lesson-no-carry.test.ts \
  tests/t42g-late-state-timers.test.ts           # → t42-tests-green.txt (7 passed / 45 test)
node qa/run-one.mjs qa/focus.mjs                 # → probe-focus.txt
node qa/run-one.mjs qa/games.mjs                 # → probe-games.txt
node qa/run-one.mjs qa/tier6-ladder-evidence.mjs # → probe-tier6-ladder-evidence.txt
```

## Số đo hiện trạng

- `npm run verify` → EXIT **0**; typecheck `tsc --noEmit` không dòng `error TS`.
- `Test Files 99 passed (99)` · `Tests 1372 passed (1372)` · `Duration 24.14s`
  (trước đợt T42: 92 file / 1327 test ⇒ +7 file / +45 test).
- `vite build` → `✓ built in 1.79s`.
- Main chunk: `index-C7kpOu7n.js = 211.3 kB` → **PASS** (trần 600 kB, mục tiêu 450 kB).
  Entry trước đợt: `index-3QHywPiW.js = 209.9 kB` ⇒ +1.4 kB cho tám sửa đổi.
- `npm run verify` chạy **lại trên đúng nội dung commit** (`verify-precommit.txt`): EXIT **0** ·
  `Test Files 99 passed (99)` · `Tests 1372 passed (1372)` · `Duration 21.38s` ·
  `Main chunk: index-C7kpOu7n.js = 211.3 kB → PASS` — cùng hash và cùng kB, chỉ thời gian tường thuật
  khác lần đo đầu (`24.14s`).

## Test red/green (ablation)

Mỗi file `ablation-*-RED.txt` = chạy **một** test T42 sau khi `git checkout HEAD --` đúng
nguồn mà sửa đó chạm tới, rồi khôi phục từ bản sao. Không có bẫy focus ⇒ test đỏ:

| Ablation | Nguồn tạm revert | Kết quả |
|---|---|---|
| `ablation-t42a-tier-picker-honest-RED.txt` | `GameModalWrapper.tsx` | Failed Tests 1 |
| `ablation-t42b-listen-pick-answer-RED.txt` | `ListenPickPhonicsGame.tsx` | Failed Tests 4 |
| `ablation-t42c-focus-trap-typing-RED.txt` | `useFocusTrap.ts` | Failed Tests 4 |
| `ablation-t42d-corrupt-storage-guard-RED.txt` | `storage.ts` | Failed Tests 7 |
| `ablation-t42e-resource-touch-clock-RED.txt` | `cloudMerge.ts` | Failed Tests 4 |
| `ablation-t42f-digit-lesson-no-carry-RED.txt` | `calcIn100.ts` | Failed Tests 2 |
| `ablation-t42g-late-state-timers-RED.txt` | `RhymeHunterGame.tsx` + `EnglishIoeScreen.tsx` | Failed Tests 4 |

`t42-tests-green.txt` = 7 file T42 chạy lại sau khi khôi phục: `7 passed (7)` / `45 passed (45)`.

## Bằng chứng nhìn thấy được (AGENTS §1.3)

`probe-t42-ui.txt` + hai ảnh PNG, đo bằng trình duyệt thật trên `dist/`.
Probe giữ lại tại `probe-t42-ui.mjs` (đặt **ngoài** `qa/` để không lọt vào phép đếm probe);
chạy lại: `cp evidence/2026-11-03-T42/probe-t42-ui.mjs ./tmp-t42-ui.mjs && npm run build && node qa/run-one.mjs ./tmp-t42-ui.mjs && rm tmp-t42-ui.mjs`

- **T42/A** — mở *Săn Vần*, bấm `Màn 1/6 ▾` → chọn *Màn 4*: header thành `Màn 4/6 ▾`,
  `kho_bau_game_progress.rhyme_hunter = { unlockedTier: 4, starsByTier: {}, bestScoreByTier: {} }`
  và `kho_bau_child_profile.stars = 0`. Trước sửa, đường cũ in 3 sao cho màn 3 mà bé chưa chơi.
  Lưới quả dựng lại theo bậc mới (4 quả → 10 quả). Ảnh: `t42a-tier4-no-stars.png`.
- **T42/B** — *Đôi Tai Thính* render đúng 4 thẻ, 4 nhãn khác nhau, đáp án luôn còn trong thẻ.
  Ảnh: `t42b-listen-pick-cards.png`.
- **Probe hồi quy**: `qa/focus.mjs` (bẫy focus 4 hộp thoại, `focusEnteredDialog: true`),
  `qa/games.mjs` (`catalogCount: 31`, `mountOnlyAwardedNothing: true`), 
  `qa/tier6-ladder-evidence.mjs` (`ok: true`) — đều PASS, `errors: []`.

## Khuyết còn mở (ghi lại, chưa sửa trong đợt này)

- *Đôi Tai Thính* gắn `item.emoji` cho **cả 4 thẻ**: với phương án là biến thể chính tả
  (`sách vở / xách vở / sách vởx / sáck vở` — nguồn `src/data/vietnameseCurriculum.ts:1180`)
  bé thấy bốn hình giống hệt nhau trong khi hướng dẫn ghi "chọn hình đúng". Cần quyết định
  thiết kế (tra emoji theo từng phương án, hay đổi hướng dẫn thành "chọn từ viết đúng"),
  không phải sửa một dòng an toàn.
- `minutes_today:summed` phồng khi cộng dồn hai máy (cần mô hình đóng góp theo thiết bị).
- `Math.random` còn trong `CatchFallingLettersGame` / `EnglishColorBalloonGame` (đi ngược
  bất biến tất định, nhưng đổi builder sẽ làm đề khác đi — cần test nội dung mới).
- Âm thanh lời khen bị lời hướng dẫn tự đọc đè (sửa có thể làm hỏng mechanic nghe).
- 5 hộp thoại chưa có `useFocusTrap`; `useModalHistory` cleanup order; engine cờ vua/cờ tướng.
- Bài toán lớp 1 "có nhớ / có mượn" (`math-les-100-two`, `math-les-100-column`) còn trong
  chương trình — quyết định sư phạm thuộc chủ repo.
