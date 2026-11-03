# CURRENT — KHO BÁU TRI THỨC (Lớp 1)

**Cập nhật 2026-11-03 (đợt sáu) — lát cắt này là của T42, lane khác không bị đụng:** người dùng nói
"check bug và fix"; hai nhánh Explore lập 18 ứng viên, soát lại từng chỗ trong source và giữ **8 defect
thật** ⇒ **7 file test mới / 45 test** (`tests/t42a…` → `tests/t42g…`, mô tả `T42/G` + `T42/H` cùng nằm
trong `t42g-late-state-timers.test.ts`). Sửa: `StorageService.selectGameTier` mới thay cho
`completeGameTier(gameId, t−1, 3, 0)` trong `GameModalWrapper` (chọn màn chỉ **mở khoá**, không in sao,
lượt thật đầu không bị tính "luyện lại" 20 % XP); `pickCardOptions` mới giữ đáp án luôn có mặt trong 4
thẻ *Đôi Tai Thính*; `shouldMoveFocusIntoDialog` mới để `useFocusTrap` không cướp con trỏ khi bé đang
gõ; lọc **từng phần tử** `recentErrors` ở cả `storage.ts:1290` và `usableErrors` (`cloudMerge.ts:363`)
thay cho kiểm tra cả mảng; đồng hồ hợp nhất cloud chuyển sang `ChildProfile.stateTouchedAt` mới (kèm
`StorageService.withoutStateTouch` mute cú ghi của chính bộ đồng bộ) vì `lastActiveDate` bị chuẩn hoá về
hôm nay ở mọi lần đọc nên luật T41D không bao giờ chạy; 12 phép có nhớ/có mượn bỏ khỏi
`src/data/math/calcIn100.ts`; *Săn Vần* dựng lại lưới đề ở thì render và `MockExam` cất hẹn giờ vào
`advanceTimer` ref + cleanup. Ablation **từng defect**: t42a `1 failed | 4 passed (5)` · t42b `4 failed
(4)` · t42c `4 failed (4)` · t42d `7 failed | 5 passed (12)` · t42e `4 failed | 7 passed (11)` · t42f
`2 failed | 3 passed (5)` · t42g `4 failed (4)`, restore ⇒ `7 passed (7)` / `45 passed (45)`.
Bằng chứng nhìn thấy được: probe tạm `evidence/2026-11-03-T42/probe-t42-ui.mjs` (chạy qua
`node qa/run-one.mjs ./tmp-t42-ui.mjs` rồi **xoá**, không nằm trong `qa/`) ⇒ `ok: true`, `errors: []`,
`headerAfterPick "Màn 4/6 ▾"` với `starsByTier: {}` + `profileStarsAfterPick: 0`, `listenUnique: 4`; cộng
hồi quy `qa/focus.mjs` / `qa/games.mjs` / `qa/tier6-ladder-evidence.mjs` và 2 ảnh. Cổng máy
`npm run verify` **EXIT=0** · **99 file / 1372 test** · `Duration 24.14s`, đo lại trên đúng nội dung
commit: **EXIT=0** · `99 passed (99)` / `1372 passed (1372)` · `Duration 21.38s` (`verify-precommit.txt`) ·
`index-C7kpOu7n.js`
**211.3 kB** (boot graph **425.6 kB**, `435849 total`) · vẫn **42** service module, không thêm dependency.
Bằng chứng `evidence/2026-11-03-T42/`. **Commit + cổng server:** `caff32a` (46 file, **+2670/−76**),
push `1deb859..caff32a`, `HEAD == origin/main`; trên chính commit cả ba workflow xanh — `1. Quality`
41632118293 · `2. Build + artifact` 41632118234 · **`3. Browser QA` 41632118172** job 125904033974
`success` `12:00:44Z`→`12:02:00Z` = **76 s** (bước 7 "QA probe" `success`, bước 8 `skipped`) ⇒
**10/16 lượt xanh, chín lượt cuối liên tiếp, sáu lượt cuối không còn cờ** *(tính tới `caff32a`; lượt
của `1deb859` — docs-only, 54 s — chưa được ghi lúc nó chạy, nay bổ ở §15)* — §15–§16
`evidence/2026-11-03-QA-RACE/ci-gate-race.txt`. **Không stage:** 6 ảnh `docs/opencode/reports/img/*.png` và
`docs/step-by-step-guidance.md` (của lane khác) vẫn để nguyên trong working tree; `package-lock.json`
còn nguyên. Ô 13 `docs/plan/TEST_PLAN.md` §16 **vẫn MỞ**; tag `v1.1.0` vẫn ở `77d90ce`; chữ ký Go/No-Go
vẫn trống — việc của người giữ repo.


**Cập nhật 2026-11-03 (đợt năm) — lát cắt này là của T41D, lane khác không bị đụng:** 9 defect hợp
nhất hồ sơ cloud + race đăng nhập đã sửa và commit thành `06b8962` (32 file, +2243/−219), push
`1cac775..06b8962`, `HEAD == origin/main`. Module mới `src/services/cloudMerge.ts` (364 dòng, luật
hợp nhất thuần: luỹ kế → `max`, **tài nguyên tiêu được** → hồ sơ hoạt động sau nhất, bài đã học →
`Set` union, firewall hồ sơ demo); `cloudSync.ts` 277 → 338 (một hàng đợi + `authEpoch`, tự lặng
`kho_bau_storage_change` do mình gõ); `firebase.ts` 133 → 144 (`AuthChangeSource` phân biệt SDK
nạp thất bại với đăng xuất thật). 40 test mới (`tests/t41d-cloud-merge.test.ts` 28 +
`tests/t41d-cloud-sync-race.test.ts` 12), ablation M6 = 5 failed / 7 passed trên code cũ.
Cổng máy `npm run verify` **EXIT=0** · **92 file / 1327 test** · `Duration 22.42s` ·
`index-3QHywPiW.js` **209.9 kB** · boot graph **424.3 kB**; cổng server trên đúng commit:
`3. Browser QA` run 41537247288 · job 125592106681 **success** 62 s (bước 7 `success`, bước 8
`skipped`) ⇒ **8/14 lượt xanh, bảy lượt cuối liên tiếp, bốn lượt cuối không còn cờ** *(tính tới
`06b8962`)* — lượt đầu tiên không lưới trên commit đổi `src/`. Bằng chứng
`evidence/2026-11-03-T41D/` + §14 `evidence/2026-11-03-QA-RACE/ci-gate-race.txt`. **Không stage:**
6 ảnh `docs/opencode/reports/img/*.png` (sửa dở của lane khác) vẫn ` M` trong working tree.
Ô 13 `docs/plan/TEST_PLAN.md` §16 **vẫn MỞ** (chưa thấy probe đỏ thật bị chặn); tag `v1.1.0` vẫn ở
`77d90ce`; chữ ký Go/No-Go vẫn trống — việc của người giữ repo.

**Updated:** 2026-11-03 (đợt bốn) — sau đợt ba (`3. Browser QA` đỏ trên `80c7e39`, đọc được payload
thật ⇒ hoá ra **lỗi ứng dụng**: đề "Cổng Xác Nhận Phụ Huynh" sinh trong `useEffect` nên khung hình
đầu vẽ đề mồi "15 + 18", MutationObserver 9/9 lần mở, đề thật đến sau 5–114 ms; đã sửa
`ParentDashboardModal.tsx` (`useMemo` + reset tại render) và cho probe tự vệ
(`unlockParentDashboard` trong `qa/lib.mjs` — nộp rồi **chờ cổng đóng**). `3. Browser QA` **xanh bốn
lượt liên tiếp trên đúng các commit chứa bản sửa**: `2d2ca27` run 41515106575 (66 s) · `c9fd2b4` run
41516820864 (127 s) · `eb4b7b2` run 41518983585 (69 s) — ba lượt đầu là điều kiện đã chốt ⇒
`continue-on-error` **đã bị xoá** khỏi job `qa-smoke` trong `3b0122c` (`ci(qa)`, kèm test hợp đồng
trong `tests/t31-bug-hunt-fixes.test.ts` cấm cờ quay lại); lượt thứ tư **chính là run đầu tiên chạy
không còn lưới**: `3b0122c` run 41523226603 · job 125544242836 **success** 69 s, bước 7 "QA probe"
`success` / bước 8 `skipped`; **lượt thứ hai và thứ ba không lưới cũng xanh** — `6e30794` run 41526285381 · job 125554732285 **success** 72 s, rồi `e961815` run 41527657645 · job 125559437705 **success** 57 s ⇒ **7/13 lượt xanh, sáu lượt cuối liên tiếp, ba lượt cuối chạy khi không còn cờ che** (tính tới `e961815`). Từ đây probe đỏ làm đỏ cả run.
Cập nhật trước đó: 2026-11-03 (đợt hai) — xanh lần đầu trên `afb9eeb` rồi đỏ lại trên `8e6f9f5`
docs-only ⇒ cổng QA intermittent; (đợt một) P42/T01 hotfix certified 2026-10-14.

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
| 6 | `CHANGELOG [1.1.0] - 2026-11-02`, `package.json`/lock `1.1.0`, tag `v1.1.0` đẩy lên `origin` | **ĐÃ LÀM** — merge `--no-ff` `7365830`, tag hiện hành `4f75f5d` → `77d90ce`; `4. Release` 41490669966 success ⇒ release id `431754261` + asset 1 369 166 byte; **chưa ký Go/No-Go**. `3. Browser QA` từng đỏ ở bước `QA probe` trên Linux qua bốn run; đã bắt đúng nguyên nhân (probe đếm tức thời một modal `React.lazy` chưa mount) và sửa trên `afb9eeb` ⇒ xanh **lần đầu** run 41501753363 (`check-run conclusion=success`, bước 7 "QA probe" `conclusion=success`) — nhưng **đỏ lại** run 41504913606 trên `8e6f9f5` (đợt docs-only, `src/` và `qa/` không đổi) ⇒ probe **intermittent**, chưa đóng. **Cập nhật đợt ba:** nguyên nhân thật là lỗi app (đề cổng phụ huynh sinh sau paint), đã sửa trong `1afda69` và `3. Browser QA` **xanh trên `2d2ca27`** (run 41515106575) ⇒ ô này đóng. Bản sửa nằm **sau** tag nên điều kiện No-Go của `v1.1.0` vẫn mở |

Số hiện trạng lane này để lại (đo 2026-11-03 **đợt bốn**, nội dung đã commit thành `3b0122c`: HEAD
`eb4b7b2` + bỏ cờ
`continue-on-error` khỏi job `qa-smoke` trong `.github/workflows/03-qa-browser.yml` + 1 test hợp đồng mới
trong `tests/t31-bug-hunt-fixes.test.ts`): `npm run verify` EXIT=0 · 90 file / **1287** test · entry
`index-TgwkX59u.js` 204.2 kB · `Duration 22.09s` (log `evidence/2026-11-03-QA-RACE/verify-1287.txt`;
**`src/` không đổi nên cả hash lẫn kB đứng nguyên**; chạy lại đúng nội dung đó ngay trước commit
`3b0122c`: cũng EXIT=0 · 1287 test · `Duration 22.15s` — `Duration` là số duy nhất khác, còn hook
pre-push in `Duration 22.36s` ở lượt push ⇒ tám lượt đo `Duration` trong ngày, mọi con số test/entry
đều khớp). Các lần đo trước —
đợt ba trên working tree `80c7e39` + sửa `src/components/parent/ParentDashboardModal.tsx` +
`qa/lib.mjs`/`golden-path.mjs`/`focus.mjs`/`mobile-golden.mjs` + test mới `tests/t41f-parent-gate.test.ts`:
1286 test · `Duration 22.18s` (log `evidence/2026-11-03-QA-RACE/verify-1286.txt`; `src/` đổi nên entry
**đổi hash** dù kB vẫn 204.2), rồi `1281` test
(`Duration 22.58s`, `evidence/2026-11-03-QA-RACE/verify-1281.txt`), `1280` test
(`Duration 21.88s` trên `afb9eeb` ở
`evidence/2026-11-03-QA-RACE/verify-1280.txt`, `Duration 22.57s` trên `7d92246` ở
`evidence/2026-11-02-KBT-ISSUE-43/verify-release-head.txt`, `27.57s` trên `1b8dadd` chỉ đổi lock,
`21.84s` trên chính commit được tag `77d90ce` ở `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt`)
— cả năm lần dùng chung entry `index-B6au8G63.js` vì `src/` không bị đụng · 30 probe · 31/31/31/31 đăng ký trò chơi · `git tag | wc -l` = 1
(`4f75f5d` → `77d90ce`). CI phía server trên `77d90ce`: `1. Quality` + `2. Build + artifact` + `4. Release` success,
`3. Browser QA` job failure ở bước "QA probe" (non-blocking) — xem `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt`.
**Trên `afb9eeb` cả ba job chặn merge đều xanh và `3. Browser QA` xanh thật lần đầu** (run 41501753363, 63 s;
bằng chứng là `jobs[].steps[].conclusion` / `check-run.conclusion = success`, **không phải** "0 annotation `::error::`"
— annotation chỉ sinh ra khi bước chẩn đoán chạy, mà bước đó từng **chạy lại** probe nên annotation của một lần đỏ
từng ghi "QA PASS"; xem `evidence/2026-11-03-QA-RACE/ci-flake-second-run.txt`). Lần đỏ tiếp theo trên `8e6f9f5`
(run 41504913606, bước 7 failure / bước 8 success) đã bị chính cái bẫy đó che; bản sửa `tee probe-run.log` +
`PIPESTATUS[0]` đã merge thành `80c7e39` và **lập tức ăn tiền**: run 41508824890 giao payload thật, nhờ đó tìm ra
lỗi ứng dụng "đề cổng phụ huynh vẽ muộn" (mục trên đầu file này) — chi tiết ở
`evidence/2026-11-03-QA-RACE/ci-gate-race.txt`. **CI đã xanh trên commit chứa bản sửa** (`2d2ca27`,
run 41515106575, bước 7 "QA probe" `success` 66 s) — xem §6 của chính file evidence đó. **Đợt bốn:** `c9fd2b4` (run 41516820864, 127 s) và `eb4b7b2` (run 41518983585, 69 s) khép chuỗi **ba lượt
liên tiếp**, đủ điều kiện đã chốt trong `docs/lifecycle/07_RELEASE_OPERATIONS.md` §2 nên
`continue-on-error` **đã bị xoá** trong `3b0122c`; lượt CI sau đó — `3b0122c` run 41523226603,
job 125544242836, **69 s**, bước 7 `success` / bước 8 `skipped` — là **lần đầu probe chạy không còn
lưới và xanh**, nâng cổng lên **5/11 lượt xanh (bốn lượt cuối liên tiếp)**. Xem §8–§13 của file evidence đó (§12–§13 = hai lượt sau không còn lưới: `6e30794` run 41526285381 success 72 s và `e961815` run 41527657645 success 57 s ⇒ **7/13 lượt xanh**, kèm **quy tắc dừng** để tỷ lệ không thành cuộc đua đuổi theo CI).
Việc còn mở của repo (không thuộc lát
cắt này): T41D (merge cloud sync + race đăng nhập), T41E (cổng QA + service worker — `3. Browser QA`
nay **7/13 lượt xanh** (tính tới `e961815`: 6 đỏ · 7 xanh, **sáu lượt cuối liên tiếp**; **ba lượt cuối chạy khi không còn cờ**) ⇒ `continue-on-error: true` **đã bị xoá**
khỏi job `qa-smoke`, kèm test hợp đồng cấm cờ quay lại; service worker đã kiểm lại sau đổi probe —
`qa/offline-pwa.mjs` QA PASS 10 step / 0 errors),
8 item "Hệ quả chưa đóng" ở `docs/plan/TASK_PLAN.md`.

## GUIDE-MAP + T43 — hồ sơ pha 1/10/11 + sửa `resetProgress` (2026-11-03, lane này)

Yêu cầu: "sử dụng file `docs/step-by-step-guidance.md` rồi triển khai dự án theo guide". **File guide
đó thuộc lane khác và đang untracked** — lane này không sửa, không stage nó. Kit của guide
(`AI_SDLC-SOP.md`, `agentic-sdlc-process.md`, spreadsheet) **không tồn tại trong repo**:

```bash
find . -path ./node_modules -prune -o \( -iname "AI_SDLC-SOP.md" -o -iname "agentic-sdlc-process.md" -o -iname "*.xlsx" \) -print   # ⇒ rỗng
```

Nên "triển khai theo guide" = **lớp ánh xạ + artifact thật**, không phải dời thư mục:

- `docs/lifecycle/10_SDLC_GUIDE_MAP.md` — 11 pha của guide × layout repo, adaptation log, 3 quyết
  định tailoring cần người duyệt (`.drawio` / `openapi.yaml` / ADR thành file riêng).
- `docs/01-intake/` (4 file), `docs/10-operations/` (2 file), `docs/11-decommissioning/` (1 file),
  `docs/plan/RISK_REGISTER.md` (11 `RISK-*` · 7 `OQ-*` · `DEF-001`).
- Giấy tờ pha 10/11 **lòi ra bug thật**: `DEF-001` = `resetProgress()` liệt kê tay 13/17 khoá
  (`STORAGE_KEYS` có 17) ⇒ "Đặt lại tiến độ" bỏ sót `kho_bau_review_days`,
  `kho_bau_game_first_seen`, `kho_bau_tree_water`. Đã sửa test-first bằng allowlist
  `RESET_KEEP_KEYS` (`src/services/storage.ts:94`) + `tests/t43a-…` (5 test), ablation
  `4 failed | 1 passed (5)`, cổng `EXIT=0` · **100 file / 1377 test** · `Duration 28.57s` ·
  `index-BYLrQykB.js` **210.9 kB** · boot graph `435446 total` = 425.2 kB. Bằng chứng UI
  (AGENTS §1.3): `evidence/2026-11-03-T43/probe-t43-reset.mjs` chạy trên `dist/` ⇒ `ok: true`
  (3 khoá con `null`, `kho_bau_parent_settings` còn nguyên), `qa/golden-path.mjs` vẫn
  `QA PASS — 28 step(s), 0 errors`.
- **Tỷ lệ cổng QA chuyển sang kiểm kê, không đếm cộng dần.** Đo mọi run `head_branch=main` của
  workflow `03` từ `66e0fea` bằng `jobs[].conclusion` ⇒ **13/22 lượt xanh, 9 đỏ**; **mười hai lượt xanh
  liên tiếp** (`2d2ca27`→`3eb7d12`), **chín lượt cuối không còn lưới**, ba lượt trong số đó đổi `src/`.
  Kiểm kê bắt ba lỗi hồ sơ: chuỗi đỏ đầu là **bảy** lượt chứ không phải bốn (sót `bd3f2a7`, `08eacc7`,
  `37fd35e`), một lượt xanh chưa từng ghi (`1cac775`), và `af19a22` (41523541700) bị tính nhầm là lượt
  `main` trong khi `event` là `pull_request` trên nhánh dependabot. Các con số "7/13", "8/14", "10/16"
  ở những dòng dated phía trên **giữ nguyên** (nhật sử từng lát cắt) — vùng hiện trạng trong
  `docs/SDLC.md` §4, `docs/lifecycle/{README,HARNESS,CHECKLIST,01_LIFECYCLE_BOARD,07_RELEASE_OPERATIONS}`,
  `docs/specs/BRD.md` R-04, `docs/plan/TEST_PLAN.md` ô 13 nay dẫn `evidence/2026-11-03-QA-RACE/ci-census-main-wf03.txt`
  (§17–§18 `ci-gate-race.txt`). Lưu ý đơn vị: `afb9eeb` từng ghi 63 s là **cấp run**, cấp **job** 59 s.
  Unauthenticated API chỉ 60 request/giờ ⇒ vòng kiểm kê tốn 23 request, mỗi giờ chạy được ~2 lần.
- **Ba commit docs-only nối tiếp đã push** (`c7e9a00` → `ec7505a` → `8e27cd5`, `origin/main`): bằng
  chứng T43 + kiểm kê, rồi ràng buộc hạn mức API ghi trong file kiểm kê. `npm run verify` trên
  `8e27cd5`: **EXIT=0** · `Test Files 100 passed (100)` · `Tests 1377 passed (1377)` ·
  `Duration 25.67s` · `index-BYLrQykB.js` **210.9 kB PASS** (hash/kB đứng nguyên vì ba commit chỉ đụng
  `evidence/`, `.ai/`). **Lượt CI của ba commit này chưa đo** — hạn mức còn `0 / 60` tới `14:12:48Z`;
  ai đo sau đó dùng `runs?head_sha=` (1 request/lượt) và cập nhật kiểm kê nếu cần — cộng ba lượt thì
  **mẫu số thành 25**, tử số chỉ tăng với lượt xanh (cả ba xanh ⇒ 16/25).
- **Cố ý để mở, cần người duyệt — agent không tự đóng**: `RISK-01` (không có đường xoá dữ liệu
  cloud; `resetProgress` chỉ dọn `localStorage`), `RISK-11` + `OQ-07` (`docs/SAFETY_PRIVACY.md` nói
  "sao lưu" nhưng export một chiều), và quyết định sư phạm "tên bé có được giữ khi reset không"
  (hiện `kho_bau_child_profile` bị quét vì không nằm trong allowlist).

Số hiện trạng đã sync lần bảy trong ngày (BRD §7/Phụ lục A, `ARCHITECTURE.md` §12, SRS §11 + FR-P06,
RTM, `TEST_PLAN.md` header/§4/§9, `TASK_PLAN.md` `K-03` + hai hàng §II, `docs/lifecycle/*`,
`CHANGELOG.md`, `evidence/README.md` + `evidence/2026-11-03-T43/`). **Hygiene:** 6 file
`docs/opencode/reports/img/*.png` đang modified **không phải của lane này** — không stage.

## T44 + T45 — hai lát cắt bug hunt liên tiếp (2026-11-03 → 11-04, lane này)

Người dùng: "push code và check bug tiếp" ⇒ chạy skill `kho-bau-change` trên `main`, hai đợt liền.

- **T44** (năm lát cắt — registry key, sinh đề tất định, chuỗi UI, 44 đích chạm < 44px, lượt sai có
  lý do) đã commit `6a07883` + docs `58020e5`, số đo ở `evidence/2026-11-03-T44/`, sổ lỗi
  `DEF-002`…`DEF-004`.
- **T45** (năm defect: `DEF-005` máy gắp bỏ qua `maxGachaPerDay` · `DEF-006` "Tắt phần thưởng" bị
  đường thi đấu/thành tựu đi vòng · `DEF-007` bé tự nới 10 phút không qua cổng · `DEF-008` phím vẫn
  nộp đáp án khi lớp phủ "Chọn Màn & Độ Khó" che bảng · `DEF-009` Thử Thách Tuần trùng id) +
  5 file test `tests/t45a…t45e` = **+31 test**. Vùng `src/` lane này đang giữ:
  `src/services/{storage,streakEngine}.ts`, `src/hooks/useGameStage.ts`, `src/App.tsx`,
  `src/components/{parent/ScreenTimeModal,motivation/GachaMachineScreen,challenge/WeeklyChallengeScreen}.tsx`,
  10 file `src/components/games/*.tsx` (ClockBuilder, LittleScientist, NumberHop, ReadAndDo,
  RhymeTrain, SimonSays, TenFrameMarket, TonePaint, TreasureCoding, WordTrain).
- Cổng: `npm run verify` **EXIT=0** · `110 file / 1441 test` · `Duration 25.82s` ·
  `index-C5J1ceAM.js` **211.2 kB** · boot graph `435696 total` byte (log `evidence/2026-11-03-T45/verify.txt`).
- Bằng chứng UI: `node qa/run-one.mjs evidence/2026-11-03-T45/probe-t45-gating.mjs` ⇒ 9 bước / 0 lỗi /
  exit 0 / 6 ảnh PNG. **Probe này đặt ngoài `qa/`** để không bị đếm thành probe thứ 31; nếu cần chạy
  lại, chạy qua `run-one.mjs` và nhớ `npm run build` trước. Ablation năm log cùng thư mục. Hồi quy
  chạy tay **năm** probe vì CI chỉ chạy golden-path (`RISK-18`): `games` (`catalogCount: 31`, 0 errors),
  `golden-path` (28 bước), `parent-controls` (7 bước), `focus`, `mobile` — tất cả exit 0,
  log ở `evidence/2026-11-03-T45/qa/`.
- **CI phía server (đo 2026-11-04, §20)**: push `8d73ff1..e171e6e` xanh cả ba cổng trên tip `e171e6e`
  (`1. Quality` 41683815885 · `2. Build + artifact` 41683815929 · **`3. Browser QA` 41683815872**, job
  126084122217 `golden path trên Chromium` success `17:23:44Z→17:24:44Z` = **60 s**, bước 7 `success`,
  bước 8 `skipped`). Commit code `c2a8626` **không có run nào** (`actions/runs?head_sha=c2a8626ee766762c39bba93f2584a57b3651ccb2` ⇒
  `total_count: 0`) — lần **thứ hai** gặp khuôn này (`6a07883` của T44 là lần đầu) ⇒ `RISK-16` có thêm
  bằng chứng. Kiểm kê lại **toàn bộ** workflow `03` trên `main` bằng `jobs[].conclusion` ⇒ **28 lượt =
  18 xanh · 9 đỏ · 1 `cancelled`**; chuỗi xanh tới tip = **4**; mười lăm lượt cuối không còn cờ = **14
  xanh + 1 cancelled + 0 đỏ** (`evidence/2026-11-03-QA-RACE/ci-census-main-wf03-round2.txt` +
  `-round2-raw.txt`; luận bàn §20 `ci-gate-race.txt`; 29 request, hạn mức 60/giờ). Ô 13 `TEST_PLAN.md`
  §16 **vẫn MỞ**: chưa có đỏ *thật* nào sau khi bỏ cờ ⇒ cổng chưa *chứng minh* được nó cắt commit hỏng.
- Số hiện trạng đã sync **lần chín trong ngày** (BRD §7/Phụ lục A, `ARCHITECTURE.md` §12, SRS §11 +
  NFR-M04, RTM §3/§7, `TEST_PLAN.md` header/§2/§9, `TASK_PLAN.md` `K-03` + một hàng §II,
  `CHANGELOG.md`, `evidence/README.md` + `evidence/2026-11-03-T45/`); `measure.mjs` **exit 0**.
- **Cố ý để mở, cần người duyệt**: `RISK-17` (đề Thử Thách Tuần vẫn là 8 câu cố định — sửa là đổi
  nội dung học, không phải lỗi kỹ thuật) và `RISK-18` (một lượt CI chỉ chạy `qa/golden-path.mjs`,
  29 probe còn lại phải chạy tay; `qa:smoke` cũng chỉ một probe).
- **Backlog đã đo mà chưa sửa** (kế tiếp picking up): `DEF-010` câu chào theo giờ bị streak chặn
  (`src/components/common/Header.tsx:24-33`) · `DEF-011` `bySkill.total` đếm theo lượt làm, không
  theo câu ⇒ tỉ lệ "theo kỹ năng" báo thấp (`EnglishIoeScreen.tsx:269-286`) · `DEF-012` nút loa
  `ListenPickPhonicsGame.tsx:156` không `aria-label`/`title` · `DEF-013` `Esc` thoát hẳn trò chơi khi
  lớp phủ "Chọn Màn & Độ Khó" đang che (`useModalHistory.ts:32-45`, hệ quả còn lại của `DEF-008`).
  Hàng `K-05` trong `docs/plan/TASK_PLAN.md` §3.8. **Đã loại hai ứng viên vì code đúng**: submit cộng
  hai lần khi hết giờ (`submittedRef`, `CompetitionExamModal.tsx:142`) và `starsByTier`/`shields`
  không kẹp biên (đều có `Math.min/Math.max` ở `storage.ts:1540-1541`, `:2060`).
- **Hygiene:** 6 file `docs/opencode/reports/img/*.png` modified **không phải của lane này** — không
  stage; `docs/step-by-step-guidance.md` là file untracked của lane khác (`?? `) — không đụng, không
  commit; `package-lock.json` vẫn được theo dõi (kiểm trước mỗi commit).

## T46 — ba defect còn lại của sổ K-05 (2026-11-04, lane này)

Người dùng: "push code và check bug tiếp" (lát cắt thứ 9 của bug hunt, HEAD `0c92915`).
**`src/` đổi 4 file, +42/−5** (`git diff --numstat HEAD -- src/`), **3 file test mới / 19 test**:

- **T46A `DEF-010`** — `getEncouragementPhrase()` trả **thay thế**: có streak là mất câu chào theo giờ.
  `tests/t46a-header-greeting.test.ts` (6).
- **T46B `DEF-012`** — nút loa `ListenPickPhonicsGame.tsx` icon-only không tên ⇒ `aria-label="Nghe lại đề"`.
  `tests/t46b-speaker-button-name.test.ts` (6) gồm cả **sweep nguồn** mọi file `src/components/games/**`.
  Luật test: `aria-label` **hoặc** `title` (HTML AAM cho phép `title` làm tên dự phòng) — nhờ vậy 5/6
  ứng viên quét được bị loại đúng, không sửa nhầm.
- **T46C `DEF-013`** — `Esc` khi lớp phủ "Chọn Màn & Độ Khó" đang che vừa tắt bảng vừa **thoát trò chơi**:
  `keydown` gắn trên `window`. `useModalHistory(onExit, { overlayOpen, onCloseOverlay })` +
  `shouldEscapeCloseOverlay()`; `GameModalWrapper.tsx:202` khai báo `overlayOpen: showTierModal`.
  `tests/t46c-escape-closes-overlay-first.test.ts` (7: bảng quyết định, **thứ tự** chốt trước
  `history.back()`, wiring, không `keydown` thứ hai, regression `LessonPlayerModal` một tham số).
  **Còn mở:** màn tạm dừng + biên lai phần thưởng vẫn để `Esc` đi thẳng tới `onExit` — đưa lại vào `K-05`.
- Cổng: `npm run verify` **EXIT=0** · `113 file / 1460 test` · `Duration 24.58s` ·
  `index-CprqGUdJ.js` **211.2 kB** (hash **đổi**, kB **đứng nguyên** so với T45 — hai số liệu độc lập);
  boot graph `435718 total` byte = **425.5 kB** (+22 byte). Kiểm kê không đổi: 42 service, 30 probe QA,
  31/31/31/31 trò, 105 file `src/data/**/*.ts`, 18 key `STORAGE_KEYS`. Log `evidence/2026-11-04-T46/verify.txt`.
- Bằng chứng UI thật: `node qa/run-one.mjs evidence/2026-11-04-T46/probe-t46-escape-a11y.mjs` ⇒
  `QA PASS — 7 step(s), 0 errors`, exit 0, 5 ảnh 390×844; **cùng probe** trên build không có chốt T46C
  ⇒ `QA FAIL — 2 error(s) at A`. Ablation: A `1 failed | 6 passed (7)` · B `2 failed | 4 passed (6)` ·
  C `2 failed | 4 passed (6)`. Probe đặt **ngoài** `qa/` ⇒ số probe vẫn **30**.
- Hồi quy chạy tay (CI chỉ chạy một probe — `RISK-18`): `qa/games.mjs` `catalogCount: 31` 0 errors ·
  `golden-path` 28 bước 0 errors · `focus` 0 errors · `parent-controls` 7 bước 0 errors (`qa/` trong evidence).
- **CI đo sau push** (`0c92915..cb56720`, hai commit `8083b10` code + `cb56720` docs đi trong **một**
  lệnh push; pre-push hook chạy `npm run verify` trên tip ⇒ `113 file / 1460 test`, `Duration 24.17s`):
  tip `cb56720` có đủ ba lượt xanh — `1. Quality` 41692600202 · `2. Build + artifact` 41692599879 ·
  **`3. Browser QA` 41692600066** (job 126114749872 `golden path trên Chromium` success
  `18:18:56Z→18:20:00Z` = **64 s**, bước 7 `success`, bước 8 `skipped`). **Commit code `8083b10`
  không có run nào** (`actions/runs?head_sha=8083b1062b9241de1a1d69773d42cd6cb67cbe54` ⇒ `total_count: 0`) ⇒ khuôn "push hai commit
  thì commit code không được probe lượt nào" tái diễn **lần thứ ba** (`6a07883` T44 · `c2a8626` T45 ·
  `8083b10` T46) ⇒ `RISK-16` vẫn MỞ, và vì CI chỉ chạy `qa/golden-path.mjs` (`RISK-18`) nên **không**
  lượt CI nào chạm chốt T46C. Vòng kiểm kê §21 (`evidence/2026-11-03-QA-RACE/ci-gate-race.txt`): toàn
  sổ workflow `03` = **30 lượt**; khoảng không còn cờ từ `3b0122c` = **17 lượt = 16 xanh + 1 cancelled
  + 0 đỏ**; chuỗi xanh tới tip = **6**; cấp job toàn sổ suy ra **20/30 xanh · 9 đỏ · 1 cancelled**.
  Ô 13 `docs/plan/TEST_PLAN.md` §16 **vẫn MỞ** — chưa có đỏ *thật* nào sau khi bỏ cờ ⇒ cổng chưa
  *chứng minh* được nó cắt commit hỏng.
- **§22 — lệnh đo CI trong hồ sơ sai cú pháp (phát hiện ngay trên commit `4659d99` vừa push)**:
  `actions/runs?head_sha=<7 ký tự>` trả `total_count: 0` cho **mọi** commit — GitHub so khớp nguyên SHA
  40 ký tự. Đối chứng trên đúng `4659d99`: dạng ngắn ⇒ `0`, dạng đủ ⇒ **3 lượt** #68 đều success
  (`3. Browser QA` run 41693926095, job 126119341251 `success` **82 s**, bước 7 `success`). ⇒ Mọi kết
  luận "commit không được CI chạy" ghi bằng SHA ngắn **mất giá trị chứng minh**; đã tra lại ba commit
  code bằng SHA đủ (`6a07883e…b27` · `c2a8626e…cb2` · `8083b106…e54`) ⇒ cả ba vẫn `0`, **`RISK-16` đứng**;
  đã sửa lệnh dẫn chứng ở `ci-gate-race.txt` §20, `ci-census-main-wf03-round2.txt`,
  `evidence/2026-11-03-T45/README.md`, `evidence/README.md`, `TASK_PLAN.md` §II, file này.
  **Số hiện trạng *tính riêng cho vòng ba-b* (tip `4659d99`)**: workflow `03` trên `main` = **31 lượt** (`#37` `66e0fea` → `#68`
  `4659d99`); khoảng không còn cờ = **18 lượt = 17 xanh + 1 cancelled + 0 đỏ**; **cấp job toàn sổ suy ra
  21/31 xanh · 9 đỏ · 1 cancelled**; chuỗi xanh tới tip = **7**; đóng nợ cũ của vòng một: `c7e9a00` có
  đủ **3** lượt success (#60) ⇒ không còn "chưa tra được". Hệ quả nghiệp vụ: vì commit docs-only vẫn
  chạy đủ ba cổng, cách né `RISK-16` là **push commit code riêng một lượt** — đã ghi vào `RISK-16`.
  **Hai chỗ lệch bị phát hiện khi quét**: `docs/lifecycle/HARNESS.md` và
  `docs/lifecycle/07_RELEASE_OPERATIONS.md` vẫn ghi **13/22** (đợt §20 quên quét `docs/lifecycle/`).
- **§23 — vòng chốt, và mục hiện trạng không còn nằm ở file nào khác**: `a6c472b` (hồ sơ §22, push
  **một mình**) có đủ ba run lượt #69, `3. Browser QA` run 41696285755 job 126127579573 `success`
  **87 s** ⇒ phép đối chứng một biến của `RISK-16`. Kiểm kê chốt: **32 lượt**, cấp job suy ra
  **22/32 xanh · 9 đỏ · 1 cancelled** *tính tới tip `a6c472b`*, chuỗi xanh tới tip **8**, khoảng không
  còn cờ **19 lượt = 18 xanh + 1 cancelled + 0 đỏ**. Từ đây **số này sống ở §23**
  (`evidence/2026-11-03-QA-RACE/ci-gate-race.txt`); `SDLC.md` / `BRD.md` R-04 / `lifecycle/README.md`
  / `HARNESS.md` / `07_RELEASE_OPERATIONS.md` / `TEST_PLAN.md` ô 13 / `RISK-10` đã trỏ §23.
  **Không đo lại cho một commit docs** — chỉ khi có commit **code** mới hoặc khi ô 13 cần đỏ *thật*.
- **Bài học quy trình (lần đầu trả giá thật):** `git checkout -- <file>` trong pha ablation đã **xoá mất
  bản sửa chưa commit** của `useModalHistory.ts` ⇒ phải viết lại tay. Từ đó: ablation restore từ
  `/tmp/*.GREEN.*`, và `tests-RED.txt` (RED **tái lập** bằng `git checkout HEAD --` đúng 4 file) có bảng
  **md5 trước/sau** đối chiếu trong `evidence/2026-11-04-T46/README.md`. Không dùng `git checkout --`
  cho file đang có sửa chưa commit.
- Harness ghi lại: nút loa mang `animate-pulse-subtle` nên `locator.click()` báo *not stable* ⇒
  `click({ timeout: 15000, force: true })` bọc try/catch và báo `clicked` ra `facts`; `page.mainWorld()`
  **không tồn tại** trong Playwright đang dùng ⇒ đo khả năng speech bằng
  `page.evaluate(() => 'speechSynthesis' in window)`.
- **Hygiene:** vẫn **không** stage 6 file `docs/opencode/reports/img/*.png` và
  `docs/step-by-step-guidance.md` (untracked, của lane khác); `package-lock.json` còn nguyên.

## T47 — năm lát cắt, `DEF-013` đóng, và một lần "xanh giả" (2026-11-04, lane này)

Người dùng: "push code và check bug tiếp" (lát cắt thứ 10 của bug hunt, HEAD `f1764f7`).
**`src/` đổi 6 file** (`GameModalWrapper.tsx` · `useModalHistory.ts` · `useGameStage.ts` ·
`policy.ts` · `decisionEngine.ts` · `storage.ts`), **5 file test mới / 37 test**.

- **T47A `DEF-013` ĐÓNG** — T46 mới route lớp phủ "Chọn Màn & Độ Khó"; **tấm che tạm dừng** vẫn để
  `Esc` đi thẳng `onExit` ⇒ bé bấm Esc để xem lại tấm che thì bị đá khỏi ván. `useModalHistory` nhận
  `escapeOverlayKind({ tierPickerOpen, pauseVeilOpen })` route theo **z-order thật** (`z-50` bảng chọn
  trước `z-20` tấm che); `pauseVeilOpen = isRealtime && isPaused && Boolean(onTogglePause)` để trò
  **không có đồng hồ** không nuốt Esc. `tests/t47a-escape-resumes-pause-veil.test.ts` (7).
- **T47B `DEF-014`** — ba mẹ chọn "Không giới hạn" (`dailyLimitMinutes: 0`) bị ngân sách hoá thành
  **20 phút** vì `?? (dailyLimitMinutes || DEFAULT_BUDGET_MINUTES)` nuốt `0`; tách
  `resolveDailyBudgetMinutes()` thuần + `P39_DECISION_POLICY.UNLIMITED_BUDGET_MINUTES: 240`
  (**hữu hạn**, vì `JSON.stringify(Infinity)` ⇒ `null`, một lần persist là hỏng vĩnh viễn).
  `tests/t47b-unlimited-daily-budget.test.ts` (10).
  **Bài học đỏ giả:** test đầu tiên so `dailyPlan` qua `decide()` **xanh cả trước lẫn sau** khi sửa —
  kế hoạch tự sinh ngắn hơn cả trần 20 phút nên hiệu số 20/240 không hiện ra ⇒ phép thử phải đặt ở
  **cấp hàm thuần** và ở `buildDailyPlan` với `fiveRecs` 5 × `estimatedMinutes: 12` = 60 phút. Đây là
  lần đầu một test tự viết **không đỏ** khi phá code cũ.
- **T47C `DEF-015`** — `saveParentSettings()` ghi `localStorage.setItem` trần, bỏ qua `writeJSON` là
  ngã rẽ **duy nhất** phát `CustomEvent('kho_bau_storage_change')` mà `cloudSync.ts:106` nghe để hẹn
  đồng bộ ⇒ cài đặt ba mẹ đổi trên máy này không bao giờ sang máy khác, im lặng.
  `tests/t47c-parent-settings-broadcast.test.ts` (7).
- **T47D `DEF-016`** — `recordWeeklyChallengeCompleted()` vừa gọi `recordQuestEvent` (thưởng thật) vừa
  tự đẩy `addRewardHistory({ type: 'xp', amount: 0 })` ⇒ lịch sử phần thưởng đầy dòng "0 XP" mỗi tuần.
  `tests/t47d-weekly-challenge-zero-reward-row.test.ts` (6).
- **T47E `DEF-017`** — `handleSelectTier` gọi `selectGameTier` (chỉ **tăng**, `Math.max`) rồi
  `onRestart()` **không truyền** số màn, còn `restartGame()` đọc `unlockedTier` = màn cao nhất từng mở
  ⇒ Màn 5 chọn Màn 1 thì bảng **nạp lại đúng Màn 5**, điểm vừa tích **mất**; `stage.jumpToTier` viết
  sẵn nhưng **không nơi nào gọi**. Sửa: `restartGame(targetTier?)` + wrapper gọi `onRestart(t)` — một
  thay đổi ở framework phủ **31** trò. `tests/t47e-tier-picker-easier.test.ts` (7); xoá luôn `jumpToTier`
  chết. **Tham chiếu dòng trong comment/test đổi sang tên symbol** (`Math.max` trong
  `StorageService.selectGameTier`) vì `storage.ts` dài ra làm số dòng trôi.
- Cổng: `npm run verify` **EXIT=0** · `118 file / 1497 test` · `Duration 27.64s` ·
  `index-vqb0Kx4n.js` **211.1 kB** · boot graph `435603 total` byte = **425.4 kB** (−115 byte so với
  `435718` của T46). Kiểm kê không đổi: 42 service, **30** probe QA, 31/31/31/31 trò, 105 file
  `src/data/**/*.ts`, 16 file `src/data/math/*.ts`, 18 key `STORAGE_KEYS`. Log
  `evidence/2026-11-04-T47/verify.txt`.
- Bằng chứng UI thật: **hai** probe đặt ngoài `qa/` (số probe vẫn **30**) —
  `probe-t47-escape-pause.mjs` ⇒ `QA PASS — 4 step(s), 0 errors`, 5 ảnh; `probe-t47e-tier-picker.mjs`
  ⇒ `QA PASS — 4 step(s), 0 errors`, 2 ảnh, `headerBefore "🌟 Màn 5/6 ▾"` → `headerAfterPick "🐥 Màn 2/6 ▾"`
  mà `unlockedTier` vẫn **5**. **Mỗi chốt có bước đối chứng** (A1 Esc mở tấm che + A3 Esc kế vẫn thoát
  thật + B1 trò không tấm che thoát ngay) — thiếu chúng thì mục A chỉ chứng minh "phím bị chết".
- Ablation: `mutation-1-veil-declared.txt` (đặt `pauseVeilOpen = false`) chỉ đỏ **1** test trong t47a ·
  `mutation-2-hook-guard.txt` (bỏ chốt trong hook) đỏ **2** file (t46c + t47a) ⇒ **ablation cấp unit
  không đủ cho hành vi bàn phím**; bằng chứng thật là `probe-t47-RED-no-guard.txt` = cùng probe trên
  build bỏ chốt ⇒ `QA FAIL — 3 error(s) at A`, exit 1. RED ban đầu của 5 file test: `tests-RED-initial.txt`
  + `tests-RED-t47{b,c,d,e}.txt`.
- **Sổ:** `DEF-013` **đóng hoàn toàn**; `DEF-014`…`DEF-017` mới; `DEF-018` (**MỞ** — T47F "Chơi lại"
  không xoá trạng thái bảng ở trò tháp/tàu chữ, T47G lượt sai của 5 trò không có phản hồi **hình ảnh**;
  trong cùng ô ghi rõ **một ứng viên đã bị bác** — "tắt phần thưởng làm mất thưởng theo cấp" — vì
  `tests/t41a-parent-controls.test.ts:178-192` đã khoá đúng hành vi đó, và danh sách chỉ nhận sau khi
  đối chiếu **từng chỗ** với source); `DEF-019` ghi năm chỗ lệch chính sách chưa thành defect có test
  (bốn công tắc ba mẹ chỉ trang trí, `getChildProfile()` tiến streak khi đọc, `getAnalytics()` đóng dấu
  `lastPracticed`, `useSpeak` báo `'played'` ở `onerror`, chuỗi "mở khóa" lệch chính tả).
  `DEF-011` tiếp tục MỞ (chờ người giữ repo chốt "total" đếm theo lượt hay câu).
- **CI (đo 2026-11-04, hồ sơ §24 — mục hiện trạng mới, thay cho §23):** commit code `198a6d9…` push
  **một mình một lệnh** ⇒ `total_count: 3`, lần đầu một commit **code** của sổ săn bug có run của chính
  nó (T44/T45/T46 đều `0`). `1. Quality` job 126181318638 success **38 s** · `2. Build` 126181318505
  success **32 s** · `3. Browser QA` 126181317728 **cancelled** ở giây 61 — nhưng **bước 7 "QA probe" đã
  `success`**, lệnh hủy rơi vào phần teardown. Nguyên nhân: lệnh push docs thứ hai đến sau **47 s** trong
  khi `golden path` cần 61–87 s, và `03-qa-browser.yml:17-19` đặt `cancel-in-progress: true`. Commit docs
  `e0fcb6f…` (cùng tree code) thì **3/3 success**, QA job 126181882876 **67 s**. Kiểm kê: **24/35 lượt
  xanh · 9 đỏ · 2 cancelled**, chuỗi xanh tới tip **1** (đứt vì *bị hủy*, không vì đỏ). **Cách né
  `RISK-16` rút gọn còn hai điều kiện:** một commit code một lệnh push **và chờ lượt CI khép (~90 s)**
  trước khi push lượt sau.
- **T47F (2026-11-04, ngay sau mục trên) — lát cắt thứ 11, và là lát cắt đầu tiên mà *danh sách bug*
  bị phép đo sửa.** Người dùng: "tự động chọn khi tôi không ở đây" + "xong thì push code". Mở bằng
  `DEF-018(a)`: bấm "Chơi lại" **cùng màn** chỉ bump `stage.nonce` (không đổi `tier`/`roundIdx`) ⇒ mọi
  hiệu ứng khởi tạo keyed `[stage.tier]` / `[stage.tier, stage.roundIdx]` **không chạy lại**. Sửa **5**
  deps: `NumberTowerGame.tsx:25` (tháp vẫn "Tầng 1 (+3)"), `SentenceScrambleGame.tsx:31` (`trainDriving`
  không reset ⇒ `handleWordTap` có `|| trainDriving` **nuốt mọi cú chạm** — soft-lock, nặng nhất),
  `ClockMoneyGame.tsx:36` (gợi ý ván cũ treo sang ván mới), `EnglishAnimalSoundGame.tsx:30` +
  `ListenPickPhonicsGame.tsx:139` (đề mới không có tiếng đọc). **Chỗ thứ sáu trong danh sách bị bác
  bằng số**: `ColoringCanvasGame` có wrapper `onRestart` riêng gọi `clearCanvas()`, probe trên `dist/` ở
  cây **không** guard trả `coverageAfterReplay: 0` + `canvasNodeReplaced: false` ⇒ "tranh giữ nguyên
  màu" là lời **bịa theo suy luận**, đã phải viết lại trong test header / probe header / comment source.
  Defect **thật** của wrapper đó: bỏ tham số `targetTier` ⇒ `stage.restartGame()` fallback
  `unlockedTier` tức `DEF-017` **lọt lại** đúng trò duy nhất có wrapper — sửa ở
  `ColoringCanvasGame.tsx:219`, probe thêm bước C3 để đo đúng điều đó.
  Test: `tests/t47f-restart-resets-board.test.ts` (5) — scanner bất biến mọi deps dựng lại bảng trong
  `src/components/games/*.tsx` + **hai test bắt điều kiện miễn còn đúng** (ngoại lệ không ghi chết) +
  tiên đề "chơi lại cùng màn đổi nonce không đổi tier". **Hạn chế của scanner đã ghi rõ**: chỉ đọc deps
  viết trên **một** dòng. RED: `3 failed | 2 passed (5)`; probe RED (bỏ guard) = QA FAIL 3 lỗi A2/B2/C3;
  probe GREEN = QA PASS 5 bước / 0 lỗi / 7 ảnh; C0 + C2 đứng nguyên giữa hai lần chạy.
  Cổng: `npm run verify` **EXIT=0** · `119 file / 1502 test` · `Duration 24.79s` ·
  `index-DbfbtGg4.js` **211.1 kB** — `src/` đổi nên entry **đổi hash** còn **kB đứng nguyên**, boot graph
  vẫn `435603 total` byte (đúng cặp lỗi mà quy ước "hash ≠ kB" cảnh báo). Hồi quy `qa/games.mjs`
  (`errors: []`, vòng qua 31 tựa) + `qa/golden-path.mjs` (28 bước). Kiểm kê: 42 service, **30** probe
  (probe mới đặt trong `evidence/2026-11-04-T47F/`), 31/31/31/31 trò.
  Sổ: `DEF-018(a)` **ĐÓNG**, `DEF-018(b)` = **T47G vẫn MỞ** (5 trò `playWrong()` không phản hồi hình
  ảnh), `DEF-019` vẫn MỞ. **Việc của lane sau**: docs sync đã xong trong phiên này (`measure.mjs` exit
  0), commit tách **code** (6 file `src/` + test + `evidence/2026-11-04-T47F/`) rồi push **một mình**,
  chờ ~90 s hãy push commit docs (`RISK-16`).



P36, P38, P39 sessions share this working tree concurrently. Each lane left its
changes uncommitted. Do not sweep other lanes' files into a single commit.
