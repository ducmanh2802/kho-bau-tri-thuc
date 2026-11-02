# TEST_PLAN — Kế hoạch kiểm thử từ đầu đến cuối
## KHO BÁU TRI THỨC — LỚP 1 (mã tài liệu KBT-TEST-1.0)

> Tài liệu này quy định **kiểm thử cái gì, bằng lớp nào, chạy lệnh nào, và khi nào được
> coi là xanh**. Danh sách yêu cầu cần kiểm: [`SRS.md`](../specs/SRS.md); ánh xạ
> yêu cầu ↔ test ↔ probe ↔ gate: [`RTM.md`](../specs/RTM.md); quy trình: [`../SDLC.md`](../SDLC.md).
>
> **Số liệu chốt 2026-11-03 (đợt bốn trong ngày)** (đo lại sau **đợt bỏ cờ `continue-on-error` của job "3. Browser QA"** trong `.github/workflows/03-qa-browser.yml` + 1 test hợp đồng mới trong `tests/t31-bug-hunt-fixes.test.ts` — nội dung đó **đã commit thành `3b0122c` và đo lại đúng commit đó: `Duration 22.15s`**, so với `22.09s` đo trên working tree ngay trước khi commit; trước đó là **đợt sửa "đề cổng phụ huynh vẽ muộn hơn khung hình đầu"** — `ParentDashboardModal` khởi tạo state bằng một đề mồi cố định rồi mới sinh đề thật trong `useEffect([isOpen])`, mà effect chạy **sau** paint nên khung hình đầu luôn là `15 + 18 = ?`; MutationObserver trong Chromium đo **9/9** lần mở vẽ đề mồi, đề thật đến sau **5–114 ms**. Sửa = sinh đề bằng `useMemo` ngay lúc vẽ + reset trạng thái cổng lúc vẽ; 5 test mới `tests/t41f-parent-gate.test.ts` (camera là `renderToString` — chỉ vẽ khung hình đầu, không chạy effect) và helper `unlockParentDashboard` trong `qa/lib.mjs` (đọc đề → nộp → **chờ cổng đóng** → đọc lại, tối đa 3 lượt) mà 4 probe `golden-path` / `focus` / `mobile-golden` / `openCompetitionHub` đi qua. `src/` đổi nên entry đổi hash, kB không đổi. Đợt trước trong cùng ngày: **sửa race màn "Chúc mừng bé lên cấp" trong `qa/lib.mjs`** — `dismissLevelUpCelebration` đếm `count()` tức thời nên bỏ sót modal mount trễ, để lại overlay che nút; thêm 2 test hợp đồng trong `tests/t31-bug-hunt-fixes.test.ts`, rồi **1 test hợp đồng nữa** khoá bước "QA probe" của workflow `03` (phải `tee probe-run.log`, không cho bước chẩn đoán chạy lại probe). Đợt trước: **KBT-ISSUE-43 + merge `c8a3725` + 2 sửa review + merge `09511d3` + merge release `7365830` + bản sửa flake theo giờ trong `tests/fatigue-reset.test.ts`** — đồng hồ trò chơi gom về `useGameStage`, thêm `tests/t43-game-pause.test.ts` 30 test và probe `qa/game-pause.mjs`; đợt đo trước trong cùng ngày là T41C — bốn đường ghi tiến trình chỉ tính một lần: bằng liệu trùng chặn trước khi cộng, buổi đọc có dấu đã gập, bước ngày hoàn tác khi ghi hỏng, mỗi lượt chơi một biên lai; trước đó là T41B cửa sổ cân bằng môn và nhãn ngày trong báo cáo Ba Mẹ theo đồng hồ của caller + lịch địa phương, T41A công tắc phần thưởng chặn đúng tài nguyên, T40 sửa mã máy trên báo cáo Ba Mẹ + migration `P43-v1`, T39 cắt lần tải đầu): 90 file test / 1287 test ·
> 30 probe (29 `.mjs` + 1 `.cjs`) · 4 workflow CI · 3 git hook · main chunk `index-TgwkX59u.js`
> 204.2 kB / trần 600 kB / **mục tiêu 450 kB đã đạt**; đồ thị chặn lần vẽ đầu 418.6 kB (trần 500 kB
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
Lớp 1  Unit/integration Vitest (1287 test)        → §5    (npm run test:ci)
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

**Bố trí 90 file theo vai trò** (danh sách này **đủ** — kiểm bằng lệnh: mọi file trong `tests/`
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
| Persistence | `t14c-storage`, `date-utils`, `parent-and-demo`, `firebase-auth-sync` | sanitize, `isRealDateKey`, export/import, **trạng thái offline khi chưa đăng nhập**, hợp nhất `Math.max`/`Set` union (mock Firestore) |
| Âm thanh & giọng đọc | `question-audio-routing`, `voice-persona`, `t24-speech-math-operators` | nút "Đọc câu hỏi" luôn lấy canonical text (không rò rỉ đáp án/option/giải thích), persona + fallback en-GB, **phép tính `+ − =` đọc thành lời** mà không đổi chữ hiển thị |
| Hệ thống | `bundle-budget`, `pwa`, `sw-precache`, `mobile-layout`, `t02c-startup-split`, `p41-font-encoding`, `t31-bug-hunt-fixes` | ngân sách chunk, precache, layout, tách chunk, font/dấu, **hợp đồng tĩnh của 5 lỗi T31 + 7 probe đã sửa** |
| Cờ | `cotuong-engine`, `chess-3d`, `chess-engine-performance`, `t26-cotuong-puzzles`, `t30-cotuong-piece-depth`, `t34-chess-real-set`, `t38-webgl-fallback` | luật (mã/tượng/pháo/tốt/tướng đối mặt/tự bỏ chiếu), node budget, `applyMove`; mesh 12 quân có shadow, bàn 64 ô + hitbox, marker nước đi/chiếu, nước mở đầu hợp lệ với engine; **độ nổi của quân cờ tướng** (bóng tiếp đất tràn ra ngoài đĩa, thành quân thò dưới mặt quân, thứ tự 3 lớp); 6 thế chiếu bí thật; bộ cờ vua giống ngoài đời; màn cờ vẫn chơi được khi máy không có WebGL; **engine cờ vua nhanh** (`chess-engine-performance`, merge `09511d3`): bàn mở đầu hợp lệ, `isAttacked` nhận ra mã/tốt/trượt/tướng, `getBestMove(depth 4, deadline 400 ms)` xong trong **≤ 600 ms** (ngưỡng là **thời gian tường** ⇒ rủi ro flake khi CI máy chậm — đã ghi ở §10), `getBestMove` không mutate bàn vào, tìm được nước bắt quân/chiếu-bí-trong-1 |
| Ba mẹ & tiến trình (T40–T41F) | `t40-parent-facing-ids`, `t41a-parent-controls`, `t41b-decision-clock`, `t41c-idempotency`, `t41f-parent-gate` | báo cáo Ba Mẹ không lộ mã máy, công tắc thưởng chặn đúng tài nguyên, cửa sổ cân bằng môn + nhãn ngày theo đồng hồ caller, **chống ghi trùng** 5 tầng (evidence id · first-seen · nonce · completion · reward) + hoàn tác khi hết quota, **đề cổng phụ huynh có mặt ngay khung hình đầu** (`renderToString` 15 lần mở, không được vẽ đề mồi) + hợp đồng probe phải xác nhận cổng đã đóng |
| Vỏ UI & quy tắc React | `t01b-ui-fixes`, `t20a-hooks-order`, `t28-ui-polish`, `t36-viet-labels`, `t39-first-load-graph` | header không tràn, focus trap của popup bài học, hooks order, chuỗi Việt hoá còn sót, trần 500 kB cho đồ thị lần vẽ đầu |
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

**Số đo gần nhất (2026-11-03 đợt bốn, trên working tree = HEAD `main` `eb4b7b2` + bỏ cờ `continue-on-error` trong `.github/workflows/03-qa-browser.yml` + 1 test hợp đồng trong `tests/t31-bug-hunt-fixes.test.ts` — đã commit thành `3b0122c` và đo lại đúng commit đó: EXIT=0 · 90 file / 1287 test · `Duration 22.15s`):** `index-TgwkX59u.js = 204.2 kB` → PASS trần 600 kB và **đã đạt** mục tiêu 450 kB (T39). Boot graph: 418.6 kB (3 file). **Không có gì trong `src/` đổi nên cả hash lẫn kB đứng nguyên** — khác đợt đo thứ ba cùng ngày (`80c7e39` + bản sửa `src/components/parent/ParentDashboardModal.tsx` + `qa/lib.mjs` + 5 test `tests/t41f-parent-gate.test.ts`), khi đó **hash đổi mà kB không đổi**; đây đúng cặp hay bị sync lệch: `src/` đổi nên entry đổi tên file, còn dung lượng thì giữ nguyên; các lần đo trước đó trong ngày (`8e6f9f5` / `afb9eeb`, và đợt 2026-11-02) **không đổi tên file entry**
ở cùng dung lượng 204.2 kB vì những đợt đó chỉ đụng `qa/`, `tests/` và workflow — tên file của các
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
| 13 | **MỞ (đo lại 2026-11-03, đợt hai)**: `3. Browser QA` đỏ ở bước "QA probe" trên runner Linux bốn lần liên tiếp (41488045102 `66e0fea` · 41490451074 `77d90ce` · 41493791252 `2db8715` · 41496530836 `e777457`), mà log trả `403 Must have admin rights to Repository` ⇒ không ai đọc nổi dòng lỗi. Race overlay đã sửa và **xanh được một lần**, nhưng cùng ngày lại **đỏ trở lại trên `8e6f9f5`** (commit chỉ đổi tài liệu) ⇒ cổng QA CI vẫn **intermittent**, chưa đóng | 30 probe được quảng bá là "chạy trong CI" nhưng số lần xanh phía server vẫn đếm trên đầu ngón tay; `continue-on-error: true` che thành run success. Nhiều lần đỏ cùng một bước ⇒ tái lập, không phải trượt nhất thời | Đã mua được kênh đọc (annotation public — check-run 125463507371) và bắt được nguyên nhân thật: `dismissLevelUpCelebration` đếm `count()` tức thời nên bỏ sót modal "Chúc mừng bé lên cấp" mount trễ, overlay che nút (`intercepts pointer events`) — sửa trong `qa/lib.mjs` + 2 test hợp đồng `tests/t31-bug-hunt-fixes.test.ts`. **Xanh lần đầu:** run 41501753363 trên `afb9eeb` (job success, step 7 success, step 8 skipped). **Đỏ lại:** run 41504913606 trên `8e6f9f5` (job failure, step 7 failure) trong khi annotation in ra "QA PASS — 28 step(s), 0 errors" — hoá ra bước chẩn đoán **chạy lại** probe nên kể chuyện lần hai; `03-qa-browser.yml` nay để bước "QA probe" tự ghi `tee probe-run.log` + `exit "${PIPESTATUS[0]}"`, bước chẩn đoán chỉ đọc file đó, khoá bằng test hợp đồng thứ 3 (RED 1 failed / 20 passed → GREEN 21 passed). Hai suy luận phải bỏ: "0 annotation `::error::` ⇒ probe xanh" (bằng chứng bền là `jobs[].steps[].conclusion`, và endpoint annotations trả **mảng trần** chứ không có khoá `annotations`) và "xanh một lần là hết flaky". **Nơi chết thật đã đọc được** ngay lần đẩy kế tiếp (run 41508824890, check-run 125495014729): `locator.click: Timeout … waiting for getByRole('button', { name: 'Đấu Trường Thi Thử', exact: true })` ở `failedAt: SNAP_afterReading` ⇒ hoá ra **lỗi app**, không phải lỗi probe: `ParentDashboardModal` vẽ một **đề mồi cố định** ở khung hình đầu rồi mới sinh đề thật trong `useEffect([isOpen])` (effect chạy SAU paint) — MutationObserver đo 9/9 lần mở vẽ `15 + 18`, đề thật đến sau 5–114 ms; ai đọc đúng khoảnh khắc đó trả lời 33, cổng báo sai nên bảng không mở và nút "Đấu Trường Thi Thử" không tồn tại. Sửa = `useMemo(makeGateQuestion, [isOpen])` + reset trạng thái cổng ngay lúc vẽ, khoá bằng `tests/t41f-parent-gate.test.ts` (RED 5 failed → GREEN 5 passed; camera là `renderToString` vì nó chỉ vẽ khung hình đầu và **không** chạy effect) và helper `unlockParentDashboard` (probe phải **xác nhận cổng đã đóng**, tối đa 3 lượt đọc-nộp). Sau sửa: `golden-path` **4/4 lần liên tiếp** `QA PASS — 28 step(s), 0 errors`, `focus` + `mobile-golden` cũng PASS, `npm run verify` EXIT=0 (log `evidence/2026-11-03-QA-RACE/verify-1286.txt`). **Việc còn mở:** CI phía server chưa chạy lại trên commit chứa bản sửa ⇒ chưa bỏ `continue-on-error` cho tới khi thấy nhiều lượt xanh liên tiếp; commit mang tag `v1.1.0` vẫn là `77d90ce` (chạy trước **cả ba** bản sửa race) nên gate của chính bản phát hành vẫn đỏ. *(đo lại cùng ngày, sau khi push* `2d2ca27`: **vế đầu đã đóng** — run 41515106575 chạy trên đúng commit chứa bản sửa, check-run 125516556497 `success`, bước 7 "QA probe" `success` sau 66 s, bước 8 skipped, lỗi race không tái diễn trên runner Linux ⇒ tính cả cổng là **4/10 lượt xanh** (6 đỏ: 41488045102 · 41490451074 · 41493791252 · 41496530836 · 41504913606 · 41508824890 — 4 xanh: 41501753363 · 41515106575 · 41516820864 · 41518983585, **ba lượt cuối liên tiếp**). Vẫn còn: chưa đủ lượt để bỏ `continue-on-error`, và tag `v1.1.0` vẫn ở `77d90ce` — di chuyển tag đã publish là việc của người giữ repo. *(đo tiếp ngay sau đó: lượt xanh **thứ ba liên tiếp** trên `eb4b7b2` — run 41518983585, job 125529796579, bước 7 "QA probe" `success`, bước 8 skipped, 20:25:03Z→20:26:12Z = **69 s** ⇒ điều kiện trong `07_RELEASE_OPERATIONS.md` §2 đã đủ, `continue-on-error` **đã bị bỏ** trong commit `3b0122c`; từ đây probe đỏ làm đỏ cả run. **Lượt CI đầu tiên chạy mà không còn lưới cũng xanh:** run 41523226603 · job 125544242836 `success` 20:52:52Z→20:54:01Z = **69 s**, bước 7 "QA probe" `success`, bước 8 skipped ⇒ tổng **5/11 lượt xanh, bốn lượt cuối liên tiếp**. *(đo tiếp cùng ngày: lượt CI **thứ hai** không còn lưới trên `6e30794` — push chỉ `docs/` + `evidence/` + `.ai/` — run 41526285381 · job 125554732285 `success` `21:13:00Z`→`21:14:12Z` = **72 s**, bước 7 `success`, bước 8 skipped ⇒ **6/12 lượt xanh, năm lượt cuối liên tiếp**, bằng chứng ở §12 của cùng file evidence.)* Ô 13 vẫn **MỞ** cho tới khi thấy ít nhất một lượt ĐỎ bị chặn thật (không có cờ che) — và tag `v1.1.0` vẫn ở `77d90ce`.)* |

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
