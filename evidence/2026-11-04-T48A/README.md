# T48A — `onerror` của bài đọc không được báo "đã đọc xong" (`DEF-019(d)`)

## 1. Bệnh đo được

`src/hooks/useSpeak.ts` gán **cùng một** `setState('played')` cho cả `utterance.onend` lẫn
`utterance.onerror` (mặc định trên `main` `a13da9a`):

```ts
utterance.onerror = () => {
  if (utteranceRef.current === utterance) {
    utteranceRef.current = null;
    setState('played');          // ⇒ "Đã đọc xong, chạm để nghe lại"
  }
};
```

Hai biến cố là hai bằng chứng ngược nhau: `onend` = nói hết câu, `onerror` = **không có tiếng**
(thiết bị từ chối, bị giành kênh, hết quyền phát âm thanh). State lộ ra màn hình qua
`data-audio-state` + `aria-label` ở **ba** màn (`LessonPlayerModal` · `CompetitionExamModal` ·
`ReadingFluencyScreen`), nên hậu quả với bé lớp 1 là nguyên văn: bấm loa, chẳng nghe thấy gì,
nút hứa "Đã đọc xong, chạm để nghe lại".

`qa/audio.mjs` (probe chính thức, 9 bước) **không** chốt được nhánh này: Chromium headless không
có giọng nên chỉ đi được đường "không có API ⇒ `unavailable`", còn `onerror` thì không có cách tất
định làm SpeechSynthesis hỏng. Đo lại trước khi sửa: `grep -rn "onerror" src/` ⇒ **4** dòng = **3** chỗ
gán handler (`useSpeak.ts`, `britishSpeech.ts:175`, `britishSpeech.ts:342`) + **1** dòng khai báo kiểu
(`britishSpeech.ts:205`, không phải handler). Chỉ `useSpeak.ts:90` (dòng **trước** khi sửa; nay là `:108`)
là nói dối ngay trên nhãn; `src/services/britishSpeech.ts:175`
gộp `onerror` vào `onEnd` ⇒ caller coi như bé đã nghe (cùng họ, nhưng không hứa câu chữ nào với bé —
ghi lại cho lát cắt sau, chưa tự phong là defect có test), còn `:342` `recognition.onerror ⇒ finish(null)`
là im lặng có fallback. Hai chỗ sau **không** phải defect cùng loại.

## 2. Cách sửa

Phân nhánh theo **ý nghĩa lý do**, không theo "cho xong":

| Lý do `event.error` | Ý nghĩa | State mới | Nhãn bé thấy |
|---|---|---|---|
| `canceled` · `interrupted` · `rejected` · `audio-busy` | kênh bị giành/hoãn, thiết bị vẫn nói được | `idle` | "Đọc câu hỏi" (bấm lại được) |
| `synthesis-failed` · `not-allowed` · `network` · `audio-hardware` · `voice-unavailable` … | từ chối thật | `unavailable` | "Thiết bị không đọc được, hãy đọc cùng ba mẹ nhé" |

Nhóm đầu đặt tên `SPEAK_INTERRUPT_REASONS` (kiểu `Set<string>` vì lib DOM không liệt kê đủ
`rejected` / `audio-busy` mà Chromium thật vẫn bắn). `onend` vẫn trả `played` — nhánh đúng, đừng
"sửa" luôn.

## 3. Lệnh tái lập

```bash
cd /d/trithuc/kho-bau-tri-thuc
npx vitest run tests/t48a-speak-error-not-played.test.ts   # 5 test
npm run build
node qa/run-one.mjs evidence/2026-11-04-T48A/probe-t48a-speak-error-honest.mjs
node qa/run-one.mjs qa/audio.mjs        # hồi quy: speechSynthesis THẬT
node qa/run-one.mjs qa/games.mjs        # hồi quy: catalog 31 trò
node qa/run-one.mjs qa/golden-path.mjs  # hồi quy: 28 bước
npm run verify
```

## 4. Kết quả

| Artifact | Nội dung |
|---|---|
| `probe-t48a-speak-error-honest.mjs` | dựng `window.speechSynthesis` giả bằng `addInitScript` **trước** khi app đọc `synthesisAvailable()`; probe tự bắn `onend` / `onerror(reason)`. App path thật, chỉ năng lực nền tảng khác — cùng chính đáng như mô phỏng offline. |
| `probe-GREEN.txt` | `QA PASS — 4 step(s), 0 errors` · A1 `playing` (1 utterance) · A2 `played`+"Đã đọc xong" · B `unavailable`+"Thiết bị không đọc được…" · C `idle`+"Đọc câu hỏi" |
| `probe-RED-no-guard.txt` | `QA FAIL — 2 error(s) at B` (B + C) trên build đột biến; **A1/A2 vẫn xanh** ⇒ characterization đứng vững, chỉ nhánh nói dối bị đỏ |
| `probe-regression.txt` | `qa/audio.mjs` `QA PASS — 9 step(s), 0 errors` (kèm `voicelessButton state: unavailable`) + `qa/games.mjs` `QA PASS — 0 step(s), 0 errors`, `catalogCount: 31` + `qa/golden-path.mjs` `QA PASS — 28 step(s), 0 errors` — cả ba chạy trên **cùng** `dist/` của lượt build này |
| 3 ảnh `*-onerror-claims-played.png` | màn hình **trước** khi sửa: nút hứa "Đã đọc xong…" sau một cú lỗi |
| 3 ảnh `a2-onend-played.png` / `b-…` / `c-…` | màn hình **sau** khi sửa, đúng ba state |

## 5. Ablation (bài học T47G được dùng ngay)

Đột biến = **đúng code cũ** (khôi phục `onerror ⇒ setState('played')`), vì đó là dạng hỏng thực tế
nhất của chỗ này.

| Vòng | test nguồn | probe |
|---|---|---|
| Đột biến | `2 failed \| 3 passed (5)` — đỏ **đúng** hai test luật | `QA FAIL — 2 error(s) at B` |
| Đã sửa | `5 passed (5)` | `QA PASS — 4 step(s), 0 errors` |

Test 4 của `tests/t48a-speak-error-not-played.test.ts` chặn hằng số ngắn mạch
(`if (false` / `&& false` / `\|\| true`) — lỗ hổng mà vòng 1 ablation T47G lộ ra. Giới hạn vẫn còn
nguyên và được ghi thẳng trong header test: repo không có jsdom/testing-library nên không dựng được
React trong unit test, hành vi do **probe** giữ.

## 6. Điều chưa làm

- `sound.speak()` (`src/services/sound.ts:308`) không đổi: nó `return` sớm khi bị tắt tiếng
  (`:313`) và không gắn state nào lên màn hình ⇒ không có chỗ để nói dối.
- `DEF-019(a)(b)(c)` vẫn chờ quyết định sản phẩm; `DEF-019(e)` (chính tả "khóa" 17 chỗ vs "khoá"
  61 chỗ trong `src/`) là lát cắt riêng, cần chốt chuẩn viết trước khi sweep chuỗi UI (probe `qa/`
  khớp chuỗi nguyên văn).

## 7. CI của commit code (`647916d`) — đo sau khi ba run khép

Lượt này thực thi đủ **hai** điều kiện né `RISK-16`: commit **code** push một mình lúc `22:59:05Z`
(`a13da9a..647916d`), commit docs chỉ push sau khi ba run `completed` (`23:00:15Z`).

| Run | Workflow | Kết quả | Thời gian |
|---|---|---|---|
| `#78` | `2. Build + artifact` (41735415349) | `success` | `22:59:06Z → 22:59:27Z` = **21 s** |
| `#78` | `1. Quality` (41735415292) | `success` | `22:59:06Z → 22:59:47Z` = **41 s** |
| `#78` | `3. Browser QA` (41735415266) | `success` | `22:59:06Z → 23:00:15Z` = **69 s**; job 126263245862 "golden path trên Chromium" **65 s** |

`total_count: 3` ⇒ **không** run nào bị `cancel-in-progress` cắt. Lệnh tái lập:
`SHA=$(git rev-parse 647916d)` → `curl -s "…/actions/runs?head_sha=$SHA"` →
`curl -s "…/actions/runs/41735415266/jobs"`.
