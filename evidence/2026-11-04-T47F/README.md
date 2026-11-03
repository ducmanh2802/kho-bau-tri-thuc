# T47F — "Chơi lại" phải xoá bảng: bất biến `stage.nonce` cho mọi hiệu ứng khởi tạo lại

Đóng `DEF-018(a)` (ghi trong `docs/plan/RISK_REGISTER.md`). Bệnh chung:
`useGameStage.restartGame()` reset `score` / `roundIdx` / `phase` và **bump `nonce`** nhưng
**không đổi `tier`** khi bé chơi lại đúng màn đang chơi ⇒ mọi `useEffect` chỉ keyed theo
`[stage.tier]` (hay `[stage.tier, stage.roundIdx]`) **không chạy** — đề mới được nạp, còn bảng
giữ nguyên hình của ván cũ.

Lệnh tái lập cả thư mục này:

```bash
cd /d/trithuc/kho-bau-tri-thuc
npx vitest run tests/t47f-restart-resets-board.test.ts    # đỏ với src hiện trên main, xanh với bản sửa
npm run build
node qa/run-one.mjs evidence/2026-11-04-T47F/probe-t47f-restart-clears-board.mjs
for p in games golden-path; do node qa/run-one.mjs qa/$p.mjs; done
npm run verify                                            # cổng, EXIT=0
```

## 1. Sáu chỗ sửa

| File | Dòng deps trước → sau | Vì sao bé thấy lỗi |
|---|---|---|
| `src/components/games/NumberTowerGame.tsx:25` | `[stage.tier]` → `[stage.tier, stage.nonce]` | chơi lại cùng màn ⇒ tháp vẫn đầy "Tầng 1 (+3), Tầng 2 (+5)…" trong khi điểm vừa về 0 |
| `src/components/games/SentenceScrambleGame.tsx:31` | `[stage.tier, stage.roundIdx]` → `…, stage.nonce]` | `setAssembledWords([])` **và** `setTrainDriving(false)` không chạy; `handleWordTap` có `if (stage.locked \|\| trainDriving) return;` ⇒ **soft-lock**: mọi cú chạm bị nuốt, trò chơi không chơi tiếp được |
| `src/components/games/ClockMoneyGame.tsx:36` | `…, stage.nonce]` | gợi ý (`showHint`) của ván cũ treo sang ván mới |
| `src/components/games/EnglishAnimalSoundGame.tsx:30` | `…, stage.nonce]` | đề mới mà không có tiếng đọc — mất luôn gợi ý chính |
| `src/components/games/ListenPickPhonicsGame.tsx:139` | `…, currentRound, stage.nonce]` | cùng họ; ở đây `currentRound` **che** lỗi (nó đổi theo `nonce` ở effect sinh đề) nên chỉ đỏ khi `nonce` đổi mà `currentRound` chưa kịp đổi — ghi thẳng khoá của ván vào deps |
| `src/components/games/ColoringCanvasGame.tsx:219` | `const restartGame = ()` → `(targetTier?: number)` + `stage.restartGame(targetTier)` | wrapper `onRestart` **duy nhất** trong repo bỏ tham số ⇒ `stage.restartGame()` lấy `unlockedTier` (màn khó nhất từng mở): bé đã mở Màn 3 mà bấm Màn 1 vẫn ở Màn 3 — đường sửa `DEF-017` lọt đúng trò này |

Khoá bởi `tests/t47f-restart-resets-board.test.ts` (5 test): một **scanner bất biến** quét mọi
dòng đóng hook trong `src/components/games/*.tsx` — deps có nhắc `stage.tier` / `stage.roundIdx`
thì **phải** nhắc `stage.nonce` — cộng các chốt đích danh, chốt ngoại lệ `stage.isRunning`, và
chứng minh điều kiện miễn của `ColoringCanvasGame` (mục 4).

## 2. RED trước khi sửa

`tests-RED-no-guard.txt` — `npx vitest run tests/t47f-restart-resets-board.test.ts` trên `src/`
**chưa** vá (`git stash push -m t47f-src -- src`): `Tests 3 failed | 2 passed (5)` —
`hiệu ứng không tái khởi động khi chơi lại: NumberTowerGame.tsx:25 [stage.tier] …`,
`expected … to contain '}, [stage.tier, stage.nonce]);'`, và `handler cục bộ phải gọi
stage.restartGame(targetTier) — không bỏ tham số`. Hai test còn lại (ngoại lệ `isRunning`, tiên
đề `restartGame` bump `nonce`) xanh từ đầu vì chúng mô tả nguyên liệu, không mô tả bản vá.

## 3. Ablation + bằng chứng nhìn thấy được trên `dist/`

| File | Lệnh | Verdict |
|---|---|---|
| `probe-t47f-restart-clears-board.mjs` → `probe-GREEN.txt` | `npm run build && node qa/run-one.mjs evidence/2026-11-04-T47F/probe-t47f-restart-clears-board.mjs` | **QA PASS — 5 bước / 0 lỗi**, `ok: true`. Số then chốt: `blocksBeforeRestart=3 → blocksAfterRestart=0` (A2), `carsBeforeRestart=1 → carsAfterRestart=0` (B2), `coverageBeforeReplay=2 → coverageAfterReplay=0` (C2), `templateAfterPickEasier="Ngôi Nhà Thân Thương"` (C3) |
| `probe-RED-no-guard.txt` | cùng probe, cùng build **không có** sáu bản vá (stash `src/`) | **QA FAIL — 3 lỗi, `failedAt: "A2"`**: A2 tháp còn 3 tầng, B2 toa tàu còn 1 từ, C3 tranh vẫn là mẫu Màn 3. **C0 và C2 vẫn PASS** ⇒ xem mục 4 |
| `probe-regression.txt` | `node qa/run-one.mjs qa/games.mjs` · `qa/golden-path.mjs` | cả hai **exit 0**: `QA PASS — 0 step(s), 0 errors` (`catalogCount: 31`) và `QA PASS — 28 step(s), 0 errors` — 6 component trò chơi đổi deps, một đổi chữ ký `onRestart` |
| `verify-exit0.txt` | `npm run verify` | **EXIT=0** · `Test Files 119 passed (119)` · `Tests 1502 passed (1502)` · `Main chunk: index-DbfbtGg4.js = 211.1 kB → PASS (meets 450 kB goal)` |
| Ảnh `a1`–`c3` (PNG, 390×844) | probe | `a1` tháp đã xây 3 tầng · `a2` sau "Chơi lại": tháp trống · `b1` một từ đã ghép lên toa · `b2` toa trống · `c1` tranh đã tô một nét (2%) · `c2` chơi lại **cùng màn**: trang trắng · `c3` bấm Màn 1 từ Màn 3: mẫu đổi thành "Ngôi Nhà Thân Thương" |

## 4. Ghi chú trung thực: một cáo buộc bị đo **phủ định**

Bản đầu của lát cắt này (và comment trong `src/`, và header của test) nói **ba** hậu quả, trong đó
có: *"`ColoringCanvasGame.tsx` — tranh đã tô vẫn nguyên màu, `coverage` vẫn > 0 ⇒ qua ải không cần
tô"*, kèm bản vá thêm `stage.nonce` vào hai deps `[stage.tier, missionTemplate]` và
`[selectedTemplate]`. Ablation chứng minh điều ngược lại: ở build **không có** bản vá nào, bước C2
vẫn cho `coverageAfterReplay = 0` và `canvasNodeReplaced = false` — tranh bị xoá **không** phải vì
hiệu ứng chạy lại, mà vì chính `restartGame()` của trò gọi `clearCanvas()` theo lệnh
(`ColoringCanvasGame.tsx:219-222`). Hệ quả ba lần sửa:

1. **Hai mảng deps của `ColoringCanvasGame.tsx` được trả về nguyên trạng** — thêm `stage.nonce`
   vào đó là code thừa dựa trên một premise sai.
2. Scanner cần một **ngoại lệ** cho trò này (`CLEARS_ON_RESTART`), và ngoại lệ đó không được để
   rỉn: test #3 đọc đúng source và đòi `onRestart={restartGame}` **và**
   `stage.restartGame(targetTier)` **và** `clearCanvas()` bên trong wrapper.
3. Defect **thật** của cùng đoạn mã hiện ra từ chính cơ chế đó: wrapper bỏ tham số `targetTier`.
   Nó được đo (C3 đỏ khi bỏ chốt), nên lát cắt vẫn có ba defect browser-verified — chỉ khác defect
   thứ ba là **`DEF-017` lọt lại**, không phải "tô màu không xoá".

## 5. Anti-tự-mạn

- Không có test cũ nào bị sửa hay xoá; `t47f` là file mới. Các test `t43-game-pause`, `t47e`
  vẫn xanh trong `verify-exit0.txt`.
- Ngoại lệ `stage.isRunning` (**bốn** file: `CatchFallingLettersGame`, `EnglishColorBalloonGame`,
  `FallingNumbersMathGame`, `MathSpeedRacingGame` — 7 dòng deps) **không** được nới thành "cứ thấy
  là bỏ qua": test #4 đòi ba file đầu có thật một dòng `[stage.isRunning, stage.tier…]`, còn chỗ
  của `MathSpeedRacingGame` chỉ là interval đếm giờ — state đồng hồ của nó đã reset theo
  `stage.nonce` ở effect ngay phía trên (`:27`).
- Không còn mutation dở: `git status --short src/` liệt kê đúng **6** file bảng mục 1;
  `grep -c ABLATION src/components/games/*.tsx` trả 0 cho mọi file. Ablation hoàn tác bằng
  `git stash apply stash@{0}` (entry `t47f-src` tạo và xoá trong cùng phiên), không dùng
  `git checkout --` lên file chưa commit.
- md5 bản GREEN của sáu file (trước khi commit): `NumberTowerGame 8084610360fc14dd7df941b0fb6d48e6` ·
  `SentenceScrambleGame a2ca22b42e45aaedc5b7c556433c9037` · `ClockMoneyGame c3d3d167c7f956c454ebecf155014d93` ·
  `EnglishAnimalSoundGame 58d074d3330423cace8f71af703ce878` · `ListenPickPhonicsGame 109eaa0d7c5f24df1f2d77115f948ee7` ·
  `ColoringCanvasGame 5bc55ee32c8b9db24a812decc568854e`.

## 6. Còn mở

- `DEF-018(b)` = **T47G**: năm trò gọi `playWrong()` mà không có phản hồi **hình ảnh** (trái
  `AGENTS.md` §3) — lát cắt riêng.
- Scanner chỉ quét `src/components/games/*.tsx` theo dòng deps **một** dòng. Effect nào viết
  deps trải nhiều dòng sẽ lọt — chưa xử lý, ghi ở đây để lần sau không tưởng là đã quét hết.
- `DEF-018(a)` giờ đóng **một phần**: sáu điểm đã sửa là sáu điểm **tìm thấy**, không phải bằng
  chứng không còn điểm nào khác; bất biến mục 1 là lớp phòng thủ cho các điểm chưa tìm thấy.
