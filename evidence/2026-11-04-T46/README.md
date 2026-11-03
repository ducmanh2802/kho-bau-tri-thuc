# T46 — bằng chứng đợt ba defect (2026-11-04)

Repo `D:\trithuc\kho-bau-tri-thuc`, HEAD trước đợt = `0c92915` (`main` = `origin/main`).
Ba defect này **đã được đo và liệt kê** ở đợt T45 (`docs/plan/RISK_REGISTER.md` §2) nhưng chủ động
để mở vì T45 dừng ở nhóm chạm quyền ba mẹ; đợt này sửa cả ba:

| lát | defect | file sửa | file hợp đồng | ablation |
|---|---|---|---|---|
| T46A | `getEncouragementPhrase()` trả **thay thế**: bé đã có streak (tức gần như mọi bé quay lại lần hai) không bao giờ nghe câu chào theo giờ, chỉ nghe lời khen | [src/components/common/Header.tsx](file:///D:/trithuc/kho-bau-tri-thuc/src/components/common/Header.tsx) (+6/−3) | `tests/t46a-header-greeting.test.ts` (6 test) | `ablation-C-header-greeting-RED.txt` |
| T46B | nút loa `ListenPickPhonicsGame.tsx` là icon-only (`<Volume2>`), **không** `aria-label`/`title` ⇒ screen reader đọc "button"; đồng thời lập quy ước quét *mọi* nút icon-only trong `src/components/games/**` | [src/components/games/ListenPickPhonicsGame.tsx](file:///D:/trithuc/kho-bau-tri-thuc/src/components/games/ListenPickPhonicsGame.tsx) (+1/−0, `aria-label="Nghe lại đề"`) | `tests/t46b-speaker-button-name.test.ts` (6 test) | `ablation-B-speaker-label-RED.txt` |
| T46C | `Esc` khi lớp phủ "Chọn Màn & Độ Khó" đang che bảng ⇒ `window` keydown đi thẳng tới `onExit`, **vừa** đóng lớp phủ vừa thoát luôn trò chơi (mất ván đang chơi). Hệ quả còn lại của `DEF-008` | [src/hooks/useModalHistory.ts](file:///D:/trithuc/kho-bau-tri-thuc/src/hooks/useModalHistory.ts) (+29/−1) · [src/components/games/GameModalWrapper.tsx](file:///D:/trithuc/kho-bau-tri-thuc/src/components/games/GameModalWrapper.tsx) (+6/−1) | `tests/t46c-escape-closes-overlay-first.test.ts` (7 test) | `ablation-A-escape-routing-RED.txt` + `probe-t46-escape-RED.txt` |

`src/` đổi **4** file, tổng **+42/−5** (`git diff --numstat HEAD -- src/`).

**Giới hạn còn lại của T46C (khai trước, không để người đọc tự phát hiện):** mới route lớp phủ
"Chọn Màn & Độ Khó". Màn **tạm dừng** (`GamePauseScreen`) và **biên lai phần thưởng** vẫn là overlay
mà `Esc` đi thẳng tới `onExit`; `LessonPlayerModal` gọi `useModalHistory(onExit)` một tham số nên
hành vi giữ nguyên (test khoá regression). Việc route nốt hai overlay đó nằm ở `K-05`.

## Lệnh tái lập

```bash
cd /d/trithuc/kho-bau-tri-thuc
npx vitest run tests/t46a-header-greeting.test.ts tests/t46b-speaker-button-name.test.ts \
               tests/t46c-escape-closes-overlay-first.test.ts      # → tests-GREEN.txt (19 passed)
npm run verify                                                     # → verify.txt (EXIT=0)
npm run build
node qa/run-one.mjs evidence/2026-11-04-T46/probe-t46-escape-a11y.mjs   # → probe-t46.txt + 5 PNG
for p in games golden-path focus parent-controls; do
  node qa/run-one.mjs qa/$p.mjs                                    # → qa/<p>.txt
done
grep -o "assets/[A-Za-z0-9_.-]*\.js" dist/index.html | sed "s#^#dist/#" | sort -u \
  | xargs wc -c | tail -1                                          # → 435718 total
```

`run-one.mjs` tự bật `vite preview` ở `PORT` (mặc định 4173, `--strictPort`); cổng bận thì thêm
`PORT=4187`. Probe đọc `dist/` nên **phải** build trước.

## Số đo hiện trạng của đợt này

- `npm run verify` → EXIT **0** · `Test Files 113 passed (113)` · `Tests 1460 passed (1460)` ·
  `Duration 24.58s` · `Main chunk: index-CprqGUdJ.js = 211.2 kB → PASS (meets 450 kB goal)`.
- Trước đợt (HEAD `0c92915`, bộ số T45 ở `../2026-11-03-T45/verify.txt`): 110 file / 1441 test
  ⇒ **+3 file / +19 test**. `src/` đổi nên entry **đổi hash** (`index-C5J1ceAM.js` →
  `index-CprqGUdJ.js`) còn **kB đứng nguyên** (211.2) — đúng khuôn đã ghi ở `kho-bau-measure-sync`
  rule 3: hash và kB là hai số liệu, lần này chỉ một trong hai đổi.
- Boot graph lần vẽ đầu: `435718 total` byte = **425.5 kB** theo nhãn docs (`check:budget` chia 1024),
  dưới trần 500 kB mà `tests/t39-first-load-graph.test.ts` giữ. So lượt T45: 435696 ⇒ **+22 byte**
  (thêm `aria-label` + tham số options, không thêm module).
- Kiểm kê **không đổi**: 42 service module (`ls src/services/*.ts | wc -l`), **30** probe QA
  (`ls qa/*.mjs qa/*.cjs` trừ `lib.mjs`/`run-one.mjs`), 31/31/31/31 trò ở bốn nơi đăng ký
  (`grep -c "id: '" src/data/gamesCatalog.ts` · `grep -c 'lazy(' src/components/games/registry.ts` ·
  `awk '/export const LAUNCHABLE_GAME_IDS/,/^\]/' src/config/policy.ts | grep -oE "'[a-z0-9_]+'" | wc -l` ·
  `awk '/^const GAME_TITLES = \[/,/^\];/' qa/games.mjs | grep -c "^  '"`), **105** file `src/data/**/*.ts`
  (`find src/data -name '*.ts' | wc -l`), **18** key trong `STORAGE_KEYS`
  (`awk '/export const STORAGE_KEYS/,/^}/' src/services/storage.ts | grep -c ":"`).
- `verify-postdocs.txt` — chạy lại `npm run verify` **sau** đợt sync docs (nội dung `src/` không đổi,
  kiểm bằng `git diff --numstat HEAD -- src/` trước/sau): vẫn `113 file / 1460 test` và
  `index-CprqGUdJ.js = 211.2 kB`, nhưng `Duration 24.30s` thay vì `24.58s`. `Duration` là số
  **phụ thuộc tải máy** ⇒ tài liệu lấy số của `verify.txt`, còn `24.30s` là bằng chứng lượt tái lập
  cũng xanh. **Không** lượt `Duration` nào nên được đọc như một ngưỡng.
- **Một cảnh báo harness không tái lập được trên tree này** (ghi để lần sau khỏi đi tìm lại): một hook
  trong phiên báo 3 file test "dùng regex có anchor tiếng Việt khớp chuỗi UI nguyên văn" —
  `tests/t26-learn-portal.test.ts:37,40,43` (`/Ô số .*chưa hợp lệ/`), `tests/t16-arcade-hints.test.ts:44`,
  `tests/t38b-math-sound.test.ts:42,43` — nhưng **cả ba file không tồn tại** (`ls tests | grep -E "t(26|16|38b)"`
  chỉ trả `t16-math-contract` · `t16-math-games` · `t26-cotuong-puzzles`) và `grep -rn "Ô số .*chưa hợp lệ" tests/`
  ⇒ **0 kết quả**. File thứ tư nó nêu (`tests/t41c-idempotency.test.ts`) **có** tồn tại nhưng cũng không có
  regex tiếng Việt. Kết luận: cảnh báo **không áp dụng** cho tree này, không có nợ nào phải trả ở đợt này.
  VI-TEXT thật chạy trong phiên: docs `files scanned=27 findings=0`, `src`+`tests` của đợt này
  `files scanned=7 findings=0`.

## RED → GREEN ở lớp unit (và vì sao RED log là *tái lập*)

`tests-RED.txt` chụp ở trạng thái **code chưa sửa**: `Test Files 3 failed (3)` ·
`Tests 12 failed | 7 passed (19)` — đỏ phân bố t46a 5 · t46b 2 · t46c 5, đỏ vì thiếu hành vi
(`shouldEscapeCloseOverlay` không tồn tại, `aria-label` không có, câu chào bị lời khen thay thế),
**không** đỏ vì cú pháp: các test đọc module qua namespace import và đọc source bằng chuỗi.
`tests-GREEN.txt`: `Test Files 3 passed (3)` · `Tests 19 passed (19)`.

Lần viết-test-trước-khi-sửa trong phiên cũng đỏ đúng 12 test, nhưng log của nó không được lưu, nên
`tests-RED.txt` được **chụp lại** bằng thao tác có chủ đích: sao lưu 4 file đã sửa,
`git checkout HEAD -- <4 file>`, chạy vitest, khôi phục. Tính nguyên vẹn của lần khôi phục chứng minh
bằng md5 **trước và sau**:

| file | md5 bản đã sửa (lưu trước) | md5 sau khi khôi phục |
|---|---|---|
| `src/components/common/Header.tsx` | `3d24ddfe98a54a0b4b2e1dd897fa3df2` | khớp |
| `src/components/games/GameModalWrapper.tsx` | `61293599147e396b4f3c6e93bb3a124a` | khớp |
| `src/components/games/ListenPickPhonicsGame.tsx` | `88137d199464b3168394a04d8a6de1a8` | khớp |
| `src/hooks/useModalHistory.ts` | `90902ea3ac00511e74aad011e7af7417` | khớp |

Bài học quy trình (đã ghi vào nhật sử): **không** dùng `git checkout --` cho file đang có sửa
chưa commit. Đầu đợt T46, chính lệnh này trong pha ablation đã xoá mất bản sửa chưa commit của
`useModalHistory.ts` (test rơi về 4 đỏ, phải viết lại tay). Từ đó mọi ablation restore từ bản sao
`/tmp/*.GREEN.*`, và lần tái lập RED trên có md5 đối chiếu.

## Ablation — bỏ từng chốt, test phải đỏ

| log | chốt đã bỏ | đỏ ở đâu |
|---|---|---|
| `ablation-A-escape-routing-RED.txt` | `shouldEscapeCloseOverlay()` trả `false` vĩnh viễn trong `useModalHistory` | `Tests 1 failed \| 6 passed (7)` — `t46c` |
| `ablation-B-speaker-label-RED.txt` | xoá `aria-label="Nghe lại đề"` khỏi nút loa | `Tests 2 failed \| 4 passed (6)` — `t46b` (một test nhắm đích, một test sweep toàn `games/**`) |
| `ablation-C-header-greeting-RED.txt` | trả lại `return phrases[khen]` kiểu thay thế | `Tests 2 failed \| 4 passed (6)` — `t46a` |

`probe-t46-escape-RED.txt` = **cùng probe** chạy trên build **không có** chốt T46C:
`QA FAIL — 2 error(s) at A`, exit 1, hai lỗi nguyên văn:

```
A:  Esc lần một đóng lớp phủ NHƯNG cũng thoát luôn trò chơi — hành vi cũ của DEF-013
A3: đóng bằng X rồi mở lại, Esc không còn đúng (lớp phủ 0, bảng ếch 0) — trạng thái bị bắt một lần
```

`failedAt: "A"` và `facts.esc1 = {overlayAfterEsc1: 0, boardAfterEsc1: 0}`: lớp phủ tắt **đồng thời**
bảng cũng biến mất — đúng mô tả defect. Lỗi thứ hai là do chính probe ở lượt RED đầu (đọc `offsetParent`
một lần rồi so), đã sửa thành **đọc trạng thái live** — nên A3 GREEN mới có giá trị.

## Probe trên `dist/` — 7 bước / 5 ảnh / exit 0

`probe-t46-escape-a11y.mjs` **nằm ngoài `qa/`** có chủ đích: `qa/*.mjs` được đếm là probe, đặt vào đó
số probe nhảy 31 mà không có probe học thật nào. Mỗi mục lấy từ `facts` trong `probe-t46.txt`:

| mục | đo gì | kết quả |
|---|---|---|
| A1 | lớp phủ **đang mở**, nhấn `Esc` lần một | `overlayAfterEsc1: 0`, `boardAfterEsc1: 1` — bảng ếch **vẫn còn** (ảnh `a1-lop-phu-dang-mo.png` → `a2-sau-esc-lan-mot.png`) |
| A2 đối chứng | `Esc` lần hai khi **không còn** lớp phủ | `boardAfterEsc2: 0` — thoát game bình thường; chốt mới không chặn đường thoát thật |
| A3 | mở → đóng bằng ✕ → **mở lại** → `Esc` | `overlayAfterReopen: 0`, `boardAfterReopen: 1` — bắt cờ bằng getter live, không bắt một lần (ảnh `a3-sau-mo-lai-dong-bang-esc.png`) |
| B1 | `getByRole('button', { name: 'Nghe lại đề' })` | `speakerByName: 1` — nút đã có tên truy cập được (ảnh `b1-nut-loa-co-ten.png`) |
| B2 | quét DOM **thật** trong `[role="dialog"]`: nút chỉ chứa icon + không `aria-label`/`title` | `liveUnnamed.offenders: []`, `noDialog: false` — sweep trên DOM, không phải trên source |
| B3 đối chứng | click nút đó, đếm lời đọc do `speechSynthesis.speak` | `speakerClick: {before: 3, after: 4, clicked: true}` — có tên mà vẫn là lối nghe lại thật |
| C1 | `streak = 4`, chặn `speechSynthesis.speak` bằng `addInitScript` **trước** app boot | `spoken: ["Tối rồi, bé nhớ ngủ sớm nhé! Bé học đều lắm, giỏi quá!"]` — câu chào theo giờ còn nguyên ở đầu, lời khen là phụ (ảnh `c1-loi-chao-header.png`) |

Ghi chú harness: (1) nút loa mang `animate-pulse-subtle` nên `locator.click()` báo
*element is not stable*; B3 dùng `click({ timeout: 15000, force: true })` bọc try/catch và báo
`clicked` ra `facts` — im lặng bỏ qua thì C1 không chạy được. (2) `page.mainWorld()` không tồn tại
trong API Playwright đang dùng; khả năng speech được đo bằng `page.evaluate(() => 'speechSynthesis' in window)`
⇒ `hasSpeech: true`. (3) `probe-t46.err.txt` giữ dòng cuối `QA PASS — 7 step(s), 0 errors` của stdout
để đối chiếu exit.

## Hồi quy trên `dist/` (log trong `qa/`)

T46C đổi hook mà **mọi** modal trò chơi dùng, T46B đổi một component trong `src/components/games/**`,
nên chạy tay bốn probe mà CI **không** chạy (một lượt CI chỉ chạy `qa/golden-path.mjs` — `RISK-18`):

| probe | log | kết quả |
|---|---|---|
| `qa/golden-path.mjs` | `qa/golden-path.txt` | `QA PASS — 28 step(s), 0 errors` (exit 0) |
| `qa/games.mjs` | `qa/games.txt` | `QA PASS — 0 step(s), 0 errors`, `catalogCount: 31`, `errors: []` ⇒ cả **31** trò mở–chơi–thoát với hook đã đổi chữ ký (exit 0) |
| `qa/focus.mjs` | `qa/focus.txt` | `QA PASS — 0 step(s), 0 errors` (exit 0) |
| `qa/parent-controls.mjs` | `qa/parent-controls.txt` | `QA PASS — 7 step(s), 0 errors` (exit 0) |

## CI (đo sau push)

Push `0c92915..cb56720` (hai commit trong **một** lệnh push: `8083b10` code + `cb56720` docs).
Pre-push hook chạy `npm run verify` nguyên suite trên tip ⇒ `Test Files 113 passed (113)` ·
`Tests 1460 passed (1460)` · `Duration 24.17s` · `✔ Pre-push: passed`.

| Workflow | run | job | commit được đo | kết quả | thời lượng | bước 7 "QA probe" | bước 8 |
|---|---|---|---|---|---|---|---|
| `1. Quality` | 41692600202 | — | `cb56720` (tip) | success | — | — | — |
| `2. Build + artifact` | 41692599879 | — | `cb56720` | success | — | — | — |
| **`3. Browser QA`** | **41692600066** | 126114749872 `golden path trên Chromium` | `cb56720` | **success** | `18:18:56Z→18:20:00Z` = **64 s** | `success` | `skipped` |

Commit docs `0c92915` (đẩy ở push trước, T45) có lượt #66 riêng: runs 41686215529 / 41686215385 /
41686215360 đều success.

**Commit code `8083b10` không có run nào**: `curl -s
https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/actions/runs?head_sha=8083b1062b9241de1a1d69773d42cd6cb67cbe54`
⇒ `total_count: 0`. Đây là lần **thứ ba** liên tiếp gặp khuôn này (`6a07883` T44, `c2a8626` T45,
`8083b10` T46) ⇒ `RISK-16` không những MỞ mà còn **tái diễn 100 %** với các push hai commit; hệ quả
đúng như lần trước: **không lượt CI nào chạy `qa/*` trên đúng bộ `src/` của T46** — mục "Hồi quy" ở
trên chỉ là bằng chứng cấp máy. Vòng kiểm kê §21 (`../2026-11-03-QA-RACE/ci-gate-race.txt`): toàn sổ
workflow `03` nay **30 lượt**, khoảng **không còn cờ** từ `3b0122c` = **17 lượt = 16 xanh + 1 cancelled
+ 0 đỏ**, chuỗi xanh tới tip = **6**; cấp job toàn sổ suy ra **20/30 xanh · 9 đỏ · 1 cancelled**. Ô 13
`docs/plan/TEST_PLAN.md` §16 **vẫn MỞ**.

## Ảnh

`a1-lop-phu-dang-mo.png`, `a2-sau-esc-lan-mot.png`, `a3-sau-mo-lai-dong-bang-esc.png`,
`b1-nut-loa-co-ten.png`, `c1-loi-chao-header.png` — chụp ở viewport 390×844 (iPhone giả lập trong probe).
