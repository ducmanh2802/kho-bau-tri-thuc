# CURRENT — KHO BÁU TRI THỨC (Lớp 1)

**Updated:** 2026-11-03 — luồng SDLC 6 pha cho KBT-ISSUE-43 đã đóng tới Pha 6: tag `v1.1.0` + GitHub Release thật;
**`3. Browser QA` từng xanh lần đầu** trên `afb9eeb` (bản sửa race overlay chúc mừng) rồi **đỏ lại** trên `8e6f9f5`
docs-only ⇒ cổng QA **intermittent**, đang sửa cách đo để lần đỏ sau đọc được nguyên nhân thật.
Cập nhật trước đó: 2026-10-14 — P42/T01 hotfix certified.

## P42

- T01 (p42/T01): hero gradient + localDateKey + review/weekly achievement rules + nav lg-breakpoint + self-host fonts + tree/game-count — typecheck/test(409)/build PASS, xem `docs/opencode/reports/T01_REPORT.md`.
- T02 (p42/T02): sửa đáp án/sai phạm 10 game + thưởng delta/20% + coloring 30% + memory-seen + playNonce — typecheck/test(435)/build PASS, smoke 0 console error, xem `docs/opencode/reports/T02_REPORT.md`.
- T02B (p42/T02B): tách 18 game sang src/data/games + sửa 16 lỗi B1–B16 + test phủ 18 game — typecheck/test(471)/build PASS, xem `docs/opencode/reports/T02B_REPORT.md`.
- T01B (p42/T01B): header game 1 dòng + Esc/Back + sticky bài học + menu icon-only + scroll-top + font @theme + banner ≥4,5:1 + UpdateBanner + loa riêng + touch 44px + đếm game động + tưới 1/ngày + nav testid — typecheck/test(496)/build PASS, probe QA 30/30, xem `docs/opencode/reports/T01B_REPORT.md`.
- T02D (p42/T02D): bỏ câu "ạ cụ" → "Con dế mèn", "Nón lá 👒" → "Ngọn núi ⛰️", sót 110cm → 10cm, RED → CRAB blend — typecheck/test(504)/build PASS, xem `docs/opencode/reports/T02D_REPORT.md`.
- T02C (p42/T02C): tách competition/reading/KidBox khỏi chunk chính (727→253 kB, react-vendor riêng), SW kho-bau-v3 + precache build-generated, validator giữ dấu 1679ms→35ms (2000 câu 56ms), CONTENT_GUIDE — typecheck/test(523)/build/check:budget/offline-pwa PASS, xem `docs/opencode/reports/T02C_REPORT.md`.
- T07 (p42/T07): SubjectScreen thành con đường phiêu lưu (nút 72px, SVG path, rương, popup, gating/cuộn, storage sao/rương/unlock), WorldMapScreen bản đồ kéo/vuốt + dotted route + badge %, storage sanitizer/migration+test, QA scripts migrate "Vào học" → lesson-button/"Bắt đầu", parent toggle mở hết — typecheck/test(599)/build PASS, xem `docs/opencode/reports/T07_REPORT.md`.
- T08 (p42/T08): GamesHub registry lazy ở src/components/games/registry.ts, catalog chỉ dữ liệu + skillIds + storage first-seen "MỚI", LAUNCHABLE đồng bộ 18 game, tabs cố định 5 cột, gợi ý cho bé, pause chỉ real-time, qa/games.mjs cập nhật 18 game — typecheck/test(601)/build PASS.
- T09A (p42/T09A): luyện đọc: parent grading 😀/😐/🙁 storage+sanitizer+engine, adapter reading→Question + T05 ChoiceQuestion, karaoke từ/cả câu, Bé tự đọc chấm nhanh — typecheck/test(601)/build PASS.
- T09B (p42/T09B): CompetitionHub 5 tab→3, chế độ Bé/Thi thật; Bé ẩn bot leaderboard/countdown và hiện huy chương + lời khen — typecheck/test(601)/build PASS.
- T14A (p42/T14A): them SubjectType 'cuoc-song', CompetitionSubject giu 3 gia tri, WorldMap/Home/Subject mo mon Em & Cuoc song, storage sanitizer, adaptive/decision/praise/contentValidator ho tro, them 2 bai mau (24 cau) — typecheck/test(601)/build PASS.
- T14B (p42/T14B): 14 chu de / 26 bai / 264 cau Em & Cuoc song (180 cau moi viet tay, xoa placeholder makeQ), sua 5 loi nho (speak/classmates/om/Sợ hãi/Khóc), sua loi matching LessonPlayer (handleMatch khong bao gio noi duoc cap) + 15 test moi — typecheck/test(616)/build/check:budget PASS, golden-path Chromium Home→bai life-les-1→3 sao PASS, xem `docs/opencode/reports/T14B_REPORT.md`.
- T14C (p42/T14C): 35 test moi cho T07/T08/T09A/T09B/T14A (616→651 PASS), sua 3 loi that (isRealDateKey loai ngay ao 2026-13-99 o first-seen/tree-water/review-days; recordParentRating idempotent; subjectDifficulty guard), xoa 2 alias readingAdapter thua — typecheck/test(651)/build PASS, xem `docs/opencode/reports/T14C_REPORT.md`.
- T18A (p42/T18A): he thong dong luc du lieu — 60 sticker/6 bo, shop 43 mon, pool 31 quest (3 hoc + 1 vui/ngay, tat dinh), level XP 1-50 + 10 danh hieu, khien giu chuoi 1/tuan, 35 thanh tuu co rule test duoc, schema P42-v2 + sanitizer + khong mat tien do cu — typecheck/test(679)/build/check:budget PASS, xem `docs/opencode/reports/T18A_REPORT.md`.
- T13 (p42/T13): 24 truyen luyen doc moi (6 chu de x 4, cap 8/9/7, moi truyen 6 cau, 5-6 loai cau) + theme/targetVowels/getPassagesByTheme + 9 test T13 — typecheck/test(693)/build/check:budget PASS, xem `docs/opencode/reports/T13_REPORT.md`.
- T15 (p42/T15): 3 game Tieng Viet moi (tone_paint/rhyme_train/read_and_do: 3 data pack 6 cap + component + dang ky 3 noi + 23 test) + sua crash P0 useGameFeedback o 3 game cu (rhyme_hunter/listen_pick/catch_letters) — typecheck/test(716)/build/check:budget PASS, probe 390px 0 console error, xem `docs/opencode/reports/T15_REPORT.md`.
- T17A (p42/T17A): 2 game Tieng Anh moi (simon_says/word_builder_train: 2 data pack 6 cap + component + dang ky 3 noi + 19 test; 1 buoc -> 2 buoc -> bay Wait, CVC -> 4 chu -> sh/ch, GREY British) — typecheck/test(735)/build/check:budget PASS, probe 390px 0 console error, qa/games.mjs SKIPPED (selector stale co san), xem `docs/opencode/reports/T17A_REPORT.md`.
- T12B (p42/T12B): Tieng Anh unit 7-12 (6 chu de, 12 bai, 137 cau) + competition English +40 (version 6), bank 162 EN; metric 24 topics/40 lessons/326 cau/~620 tu — typecheck/test(767)/build PASS, xem `docs/opencode/reports/T12B_REPORT.md`.
- T11C (p42/T11C): noi 5 file math/*.ts vao mathCurriculum (applyT11CUnits, giu id): Toan 49→192 cau, 16/16 bai muc 1–5 du 10 cau/≥3 loai cau, 100 calc khong-nho 0–100, 15 visual; sua loi doc so 70 (muoi→mươi theo GDPT), "Ban mai"→"Ban Mai"; chunk math-bank (entry 626,7→546,3 kB); CURRICULUM_MAP 12 chu diem — typecheck/test(771)/build PASS, xem `docs/opencode/reports/T11C_REPORT.md`.
- T16 (p42/T16): 3 game Toan moi (ten_frame_market/number_line_hop/clock_builder: 3 data pack 6 cap + component + dang ky 3 noi + 27 test; dap an 0–9, khong nho/muon, gio dung, ngay 1–28) — typecheck/test(797)/build PASS, probe 390px 0 console error, qa/games.mjs SKIPPED (selector stale co san), xem `docs/opencode/reports/T16_REPORT.md`.
- T17B (p42/T17B): 2 game Logic & Khoa hoc (treasure_coding/little_scientist: 2 data pack 6 cap + component + GameCategory 'logic' + tab Hub + dang ky 4 noi + 25 test; BFS kiem 100% man lap trinh co loi giai, chia khoa T4+/x2 T5+, 5 luat khoa hoc co giai thich doc to) — typecheck/test(822)/build/check:budget PASS, 26→28 game, xem `docs/opencode/reports/T17B_REPORT.md`.
- T20B (p42/T20B): sua loi P0/P1 + auto-fix 18 curriculum WARNING (16 hint leak + 2 near-duplicate) — typecheck/test(843)/build PASS, xem `docs/opencode/reports/T20B_REPORT.md`.
## Phase states (real, evidence-backed)

| Phase | State | Evidence |
|---|---|---|
| P25–P33, P34, P35, P36, P37 | Preserved (not regressed) | full suite green (330/330) |
| P38 Praise Engine + language/TTS parity | **PASS** | `docs/P38_PRAISE_ENGINE_CERTIFICATION.md` |
| **P39 Learning OS Decision Engine** | **PASS** | `docs/P39_LEARNING_OS_DECISION_ENGINE.md` |

## P39 summary

- New canonical pipeline: `src/services/decisionEngine.ts` +
  `src/types/decisionEngine.ts` + `P39_DECISION_POLICY` in `src/config/policy.ts`.
- Consumes Learning OS evidence only (read-only); mastery/SM-2/state untouched.
- Outputs: mode, recommendations with reason codes, NBA, `ÔN TẬP HÔM NAY` daily plan
  (3–5), session plan (QUICK/STANDARD/FULL/RECOVERY/DISCOVERY), parent decision report.
- UI: `NextBestActionCard` (child + "Vì sao?" codes) and
  `ParentDashboardModal` insights (`parent-decision-report`, `parent-next-best`).
- Tests: 21 files / 330 pass. Typecheck + production build pass.
- Real Chromium proof: golden paths A–G PASS; mobile 375px + ~200% zoom + a11y probe;
  0 console errors; 0 failed requests.
- Rerun: `npm run build && npm run preview -- --port 4173`, then
  `node <browser-skill>/browser.mjs http://127.0.0.1:4173/ --script qa/decision-engine.mjs`.

## KBT-ISSUE-43 — luồng SDLC 6 pha đầy đủ (2026-11-02, lane này)

Nhánh `feature/43-game-pause` — đã push tới `origin`, **đã merge vào `main` bằng `--no-ff`**
(`7365830`, giữ lịch sử để `evidence/` còn dẫn được từng commit) và **đã tag `v1.1.0`**. Người dùng ra
"tự động chọn khi tôi không ở đây" nên lane này thao tác luôn phần merge + tag + push; **quyền ký
Go/No-Go vẫn thuộc người giữ repo** (`docs/lifecycle/07_RELEASE_OPERATIONS.md` §3 — biên mẫu còn trống).

| Pha | Đầu ra | Trạng thái |
|---|---|---|
| 1–2 | `docs/issues/43-game-pause.md` §1–2 (Issue mirror + DoD đo được + ghi chú thiết kế) | XONG |
| 3 | `useGameStage.pausedByUser` + `isGameClockRunning`, nút tạm cho 4 trò `REALTIME_GAME_IDS` | XONG — RED `24 failed \| 6 passed` trước, `30 passed` sau |
| 4 | `evidence/2026-11-02-KBT-ISSUE-43/` — `verify.txt` + `verify-release-prep.txt`, 3 ảnh, 3 log ablation M3/M4/M5 (M1–M2 ở đợt T41C), `probe-game-pause.json` + `probe-qa-smoke.txt` + `probe-qa-games.txt`, `red-before-fix.txt` | XONG |
| 5 | Review 4 lớp §6 + thân PR đã điền số đo §7 | XONG — CI đã chạy trên `main` (xem §6 dưới); không có PR object vì máy không có `gh` CLI |
| 6 | `CHANGELOG [1.1.0] - 2026-11-02`, `package.json`/lock `1.1.0`, tag `v1.1.0` đẩy lên `origin` | **ĐÃ LÀM** — merge `--no-ff` `7365830`, tag hiện hành `4f75f5d` → `77d90ce`; `4. Release` 41490669966 success ⇒ release id `431754261` + asset 1 369 166 byte; **chưa ký Go/No-Go**. `3. Browser QA` từng đỏ ở bước `QA probe` trên Linux qua bốn run; đã bắt đúng nguyên nhân (probe đếm tức thời một modal `React.lazy` chưa mount) và sửa trên `afb9eeb` ⇒ xanh **lần đầu** run 41501753363 (`check-run conclusion=success`, bước 7 "QA probe" `conclusion=success`) — nhưng **đỏ lại** run 41504913606 trên `8e6f9f5` (đợt docs-only, `src/` và `qa/` không đổi) ⇒ probe **intermittent**, chưa đóng. Bản sửa nằm **sau** tag nên điều kiện No-Go của `v1.1.0` vẫn mở |

Số hiện trạng lane này để lại (đo 2026-11-03 trên working tree = HEAD `8e6f9f5` + sửa `03-qa-browser.yml`/`t31`): `npm run verify` EXIT=0 · 89 file / **1281** test · entry
`index-B6au8G63.js` 204.2 kB · `Duration 22.58s` (log `evidence/2026-11-03-QA-RACE/verify-1281.txt`;
các lần đo trước đó: `Duration 21.88s` trên `afb9eeb` ở
`evidence/2026-11-03-QA-RACE/verify-1280.txt`, `Duration 22.57s` trên `7d92246` ở
`evidence/2026-11-02-KBT-ISSUE-43/verify-release-head.txt`, `27.57s` trên `1b8dadd` chỉ đổi lock,
`21.84s` trên chính commit được tag `77d90ce` ở `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt`
— entry hash không đổi qua cả năm lần vì `src/` không bị đụng) · 30 probe · 31/31/31/31 đăng ký trò chơi · `git tag | wc -l` = 1
(`4f75f5d` → `77d90ce`). CI phía server trên `77d90ce`: `1. Quality` + `2. Build + artifact` + `4. Release` success,
`3. Browser QA` job failure ở bước "QA probe" (non-blocking) — xem `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt`.
**Trên `afb9eeb` cả ba job chặn merge đều xanh và `3. Browser QA` xanh thật lần đầu** (run 41501753363, 63 s;
bằng chứng là `jobs[].steps[].conclusion` / `check-run.conclusion = success`, **không phải** "0 annotation `::error::`"
— annotation chỉ sinh ra khi bước chẩn đoán chạy, mà bước đó từng **chạy lại** probe nên annotation của một lần đỏ
từng ghi "QA PASS"; xem `evidence/2026-11-03-QA-RACE/ci-flake-second-run.txt`). Lần đỏ tiếp theo trên `8e6f9f5`
(run 41504913606, bước 7 failure / bước 8 success) đã bị chính cái bẫy đó che — bản sửa trong working tree lưu
`probe-run.log` của lần thật. Việc còn mở của repo (không thuộc lát
cắt này): T41D (merge cloud sync + race đăng nhập), T41E (cổng QA + service worker — `3. Browser QA`
mới xanh **một** lần và đỏ lại **một** lần nên `continue-on-error: true` vẫn để nguyên, và service worker chưa kiểm sau đổi probe),
8 item "Hệ quả
chưa đóng" ở `docs/plan/TASK_PLAN.md`.

## Tree hygiene note (2026-10-06)

P36, P38, P39 sessions share this working tree concurrently. Each lane left its
changes uncommitted. Do not sweep other lanes' files into a single commit.
