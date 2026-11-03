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

## Tree hygiene note (2026-10-06)

P36, P38, P39 sessions share this working tree concurrently. Each lane left its
changes uncommitted. Do not sweep other lanes' files into a single commit.
