# T44 — bằng chứng đợt 5 lát cắt (2026-11-03)

Repo `D:\trithuc\kho-bau-tri-thuc`, HEAD trước đợt = `fc861f3` (`main`). Năm lát cắt đi kèm
bằng chứng ở đây:

| lát | defect | file hợp đồng |
|---|---|---|
| T44A | `kho_bau_ioe_store` nằm ngoài `STORAGE_KEYS` ⇒ escape pipeline sanitize; registry từ 17 lên **18** key | `tests/t44a-storage-key-coverage.test.ts` (6 test) |
| T44B | `generateDailyReview` và màn IOE chọn đề bằng `Math.random` trần (vi phạm `AGENTS.md` §2) | `tests/t44b-exercise-selection-seeded.test.ts` (10 test) |
| T44C | chuỗi máy / tiếng Anh còn lộ ra UI (`Colors`, `Numbers 1–10`, id kỹ năng) | `tests/t44c-ui-label-language.test.ts` (7 test) |
| T44D | **44** đích chạm dưới 44px trên màn chơi (`DEF-002`) | `tests/t44d-tap-targets.test.ts` (4 test) + `probe-t44-tap.mjs` |
| T44E | bài/rương khoá dùng `disabled` thật ⇒ lý do từ chối không tới được bé (`DEF-003`) | `tests/t44e-wrong-answer-feedback.test.ts` (6 test) + `probe-t44-tap.mjs` (khoá `blocked`) |

Sổ lỗi: `docs/plan/RISK_REGISTER.md` §2 `DEF-002`…`DEF-004` và §1 `RISK-11`…`RISK-15`.

## Lệnh tái lập

```bash
cd /d/trithuc/kho-bau-tri-thuc
npm run verify                                   # → verify.txt (EXIT=0, log đã bỏ mã ANSI)
npx vitest run tests/t44a-storage-key-coverage.test.ts tests/t44b-exercise-selection-seeded.test.ts \
               tests/t44c-ui-label-language.test.ts tests/t44d-tap-targets.test.ts \
               tests/t44e-wrong-answer-feedback.test.ts     # → 5 file / 33 test passed
npm run build
node qa/run-one.mjs evidence/2026-11-03-T44/probe-t44-tap.mjs        # → probe-t44-tap.txt (ok:true)
node qa/run-one.mjs qa/golden-path.mjs                              # → qa/golden-path.txt
node qa/run-one.mjs qa/games.mjs                                    # → qa/games.txt
node qa/run-one.mjs qa/mobile.mjs                                   # → qa/mobile.txt
node qa/run-one.mjs qa/focus.mjs                                    # → qa/focus.txt
node qa/run-one.mjs qa/parent-controls.mjs                          # → qa/parent-controls.txt
grep -o "assets/[A-Za-z0-9_.-]*\.js" dist/index.html | sed "s#^#dist/#" | sort -u \
  | xargs wc -c | tail -1                                            # → boot-graph.txt
```

`run-one.mjs` tự bật `vite preview` ở `PORT` (mặc định 4173, `--strictPort`); nếu một tiến trình
khác đang giữ cổng thì thêm `PORT=4187` trước mỗi lệnh. Probe đọc `dist/` nên **phải** chạy
`npm run build` trước.

## Số đo hiện trạng của đợt này

- `npm run verify` → EXIT **0** · `Test Files 105 passed (105)` · `Tests 1410 passed (1410)` ·
  `Duration 25.78s` · `✓ built in 1.77s` ·
  `Main chunk: index-tB3FJlbX.js = 211 kB → PASS (meets 450 kB goal)`
  (trước đợt T44: 100 file / 1377 test · `index-BYLrQykB.js` 210.9 kB ⇒ **+5 file / +33 test**,
  entry **đổi cả hash lẫn kB** vì `src/` đổi).
- Boot graph: `435536 total` byte = **425.3 KiB** (docs ghi nhãn `kB`; T43 là `435446` = 425.2 KiB
  ⇒ **+90 byte**, cùng hướng với entry).
- `npx vitest run` riêng 5 file T44 → `5 passed`, `33 passed`, `Duration 1.37s` — xác nhận
  33 test mới của đợt này nằm trọn trong 5 file đó (1410 − 1377 = 33).

## Probe T44D — vì sao phải render

`tests/t44d-tap-targets.test.ts` quét chuỗi class của mọi `<button>` trong `src/components`, và nó
**xanh** trong khi bé vẫn bấm phải ô 14px cao. Hai họ lỗi chỉ `getBoundingClientRect` nhìn thấy:

1. dải chọn màn/bước trong `GameModalWrapper.tsx` — phần tử không có class `w-*`/`h-*` nào, co theo
   nội dung ⇒ `152x14`, lặp ở **cả 31** trò.
2. nút icon-only (loa đọc từ / đọc màu) — chỉ có `p-2` / `p-1.5` ⇒ `36x36` và `28x28`.

Bốn file kết quả, theo thứ tự thời gian thật của phiên:

- `probe-t44-tap-RED-first-sweep.txt` — lượt quét **toàn bộ 31 trò** đầu tiên: `sweep.gamesChecked: 31`,
  `sweep.offenders` **44** dòng, `ok: false`. Phân bố (`grep -o '"box": "[^"]*"' … | sort | uniq -c`):
  `152x14` ×31, `36x24` ×5, rồi `28x28`, `36x36`, `58x34`, `46x40`, `42x44`, `38x40`, `35x24`,
  `131x32` mỗi thứ một dòng.
- `probe-t44-tap-RED-partial.txt` — giữa đợt, sau khi sửa các trò được nhắm đầu tiên: **2** offender
  còn lại đúng là hai nút loa (class `p-2 …` / `p-1.5 …`), `ok: false`.
- `probe-t44-tap.txt` — lượt cuối, sau khi patch `SyllableBuilderGame.tsx` + `EnglishColorBalloonGame.tsx`:
  `sweep: { gamesInHub: 31, gamesChecked: 31, offenders: [] }`, `errors: []`, `ok: true`
  (`probe-t44-tap.err.txt`: `QA PASS — 0 step(s), 0 errors`). Khoá `blocked` của file này là bằng
  chứng T44E — xem dưới.
- `ablation-t44d-tone-width-no-change.txt` — một lượt chạy **giữa** phiên, khi probe **chưa** có vòng quét
  31 trò (nên file không có khoá `sweep`), dùng để kiểm lớp `min-w-[44px]` có phải ràng buộc thật không.
  Kết quả `ok: true`, không thêm offender nào. **Lưu ý đọc file**: lượt đó `armSpeechCapture()` còn
  chưa chặn bọc-kép nên mỗi câu trong `spoken` bị **ghi hai lần**; lỗi bọc kép đã sửa bằng cờ
  `ss.__t44Armed` trước lượt `probe-t44-tap.txt`, nên các ca trong file cuối chỉ có **một** bản ghi.
  File này được giữ vì nó là ablation *âm tính* (không chứng minh được gì thêm) — đừng dùng làm
  bằng chứng GREEN.

## Probe T44E — bấm thật bằng chuột, không dùng `locator.click()`

`Playwright` từ chối click vào phần tử `aria-disabled`, nên `activateNode()` cuộn phần tử vào khung
hình rồi bấm bằng toạ độ `page.mouse.click(x, y)` và ghi lại `elementFromPoint` để chắc rằng điểm đó
rơi vào đúng nút. Mỗi ca phải có **cả** banner nhìn thấy **và** một câu đọc thành tiếng chứa lý do:

| ca | `activation` | `hintVisible` | `spoken` | `hintBox` |
|---|---|---|---|---|
| `bài bị khoá` | `mouse` | `true` | 1 bản ghi, khớp `hintText` = `Bài Đếm tiếp từ 6 đến 10 vẫn còn khoá. Bé học xong bài trước đó để mở nhé!` | `188x104` |
| `rương chưa đủ bài` | `mouse` | `true` | 1 bản ghi = `Bé chưa học hết các bài của chủ đề này nên rương vẫn còn khoá.` | `188x84` |

(đọc lại: `node -e "const j=JSON.parse(require('fs').readFileSync('evidence/2026-11-03-T44/probe-t44-tap.txt','utf8'));for(const c of j.blocked)console.log(c.case,c.activation,c.hintVisible,c.spoken.length,c.hintBox.w+'x'+c.hintBox.h)"`
⇒ đúng **2** ca, mỗi ca đúng **một** bản ghi `spoken`.)

Banner: `role="status" aria-live="polite" data-testid="subject-hint"`, `hintBox` đo được `188x84`,
tự ẩn sau 5 s (có cleanup nên rời màn không để lại hẹn giờ). Ảnh: `img/subject-hint-375.png`
(khung 375×812, lý do hiện rõ dưới lưới bài). `img/connect-dots-375.png` và `img/sticker-dots-375.png`
là hai màn từng có đích chạm 14px sau khi sửa.

## Cổng QA hiện trạng (cùng lượt build với `verify.txt`)

`qa/golden-path.txt` → `QA PASS — 28 step(s), 0 errors` · `qa/parent-controls.txt` →
`QA PASS — 7 step(s), 0 errors` · `qa/games.txt`, `qa/mobile.txt`, `qa/focus.txt` → `QA PASS —
0 step(s), 0 errors` (ba probe này in kết quả qua stdout, bộ đếm step của runner chỉ dành cho probe
viết bằng `step()`). File `.err.txt` tương ứng giữ nguyên văn dòng kết luận.

## Quét lệch số liệu

```bash
node "C:/Users/Windows/.qoder/skills/kho-bau-measure-sync/scripts/measure.mjs" --vitest-out - \
     < evidence/2026-11-03-T44/verify.txt
```

`LỆCH CẦN SỬA (vùng hiện trạng): 0`, exit **0**; các dòng `GIỮ NGUYÊN` (nhật sử trong
`CHANGELOG.md` / `TASK_PLAN §II`) không bị chạm tới. Lưu ý log phải **đã bỏ mã ANSI** —
`verify.txt` ở đây là bản `sed` bỏ escape màu, nếu đưa log có ANSI vào thì `test_total` không đọc được.

## Ảnh

`img/*.png` chụp ở viewport 375×812 bằng `page.screenshot` trong phiên probe; ba file, không có ảnh
nào khác trong thư mục này.
