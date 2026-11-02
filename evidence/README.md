# `evidence/` — bằng chứng gắn commit

**Owner:** người giữ repo (`ducmanh2802`) · **Áp dụng từ:** 2026-11-02

Thư mục này trả lời câu hỏi *"nói xong thật chưa?"* bằng thứ mở ra xem được, không bằng lời kể.
Một thay đổi chỉ được coi là đã kiểm chứng khi có **ít nhất một file ở đây**, và file đó nói được
ba điều: **commit nào**, **lệnh nào**, **kết quả ra sao**.

---

## 1. Quy ước

```
evidence/<YYYY-MM-DD>-<mốc>/
  verify.txt          # log cổng, đã bỏ mã màu ANSI để đọc được trong trình duyệt
  probe-<tên>.json    # output probe Playwright chạy trên dist/ thật
  *.png               # ảnh chụp màn hình tại thời điểm kiểm
  README.md           # (thư mục gốc này) bảng liệt kê mọi đợt
```

Ba rule, lấy từ `docs/SDLC.md` §1 giai đoạn 4 và `AGENTS.md` §1 mục 1 & 3:

1. **Gắn commit.** Mỗi dòng bảng dưới đây ghi SHA thật của commit mà lệnh được chạy trên đó.
   Bằng chứng của commit cũ không chứng nhận cho commit mới.
2. **Tái lập được.** Cột "Lệnh" phải copy-paste chạy lại được trên máy sạch
   (`npm run hooks:install` → `npm run build` trước các probe). Không có lệnh = không phải bằng chứng.
3. **Không có bí mật.** `.env`, API key, và **nội dung bài làm thật của bé** không bao giờ vào đây.
   Ảnh chụp dùng hồ sơ giả do probe tự dựng trong `localStorage`.
   `.gitignore` đã chặn `*.log` — vì vậy log lưu tên `.txt` hoặc `.json`.

---

## 2. Danh mục bằng chứng

| Đợt | Commit | Ngày | Nội dung cần chứng nhận | Artifact | Lệnh tái lập | Verdict |
|---|---|---|---|---|---|---|
| `2026-11-02-T41C` | `d54f341` | 2026-11-02 | Idempotency 5 tầng (T41C) + dải thưởng không còn hứa `+0 Sao` | `verify.txt` · `probe-t32-game-replay-evidence.json` · `probe-parent-controls.json` · `probe-golden-path.json` · `game-rewards-on.png` · `game-rewards-off.png` | `npm run verify` rồi `sed 's/\x1b\[[0-9;]*m//g'`; `node qa/run-one.mjs qa/<probe>.mjs` | **Pass** |
| `2026-11-02-KBT-ISSUE-43` | `a61920b` (nguồn+test+probe) · `c8a3725` (merge giữ lockfile) · `a4e98e7` (2 sửa review) | 2026-11-02 | Nút **Tạm dừng trò chơi** trên 4 trò có đồng hồ phạt sự chậm trễ: đồng hồ đứng, chạm lúc tạm không tính điểm, bấm tiếp chạy lại (KBT-ISSUE-43) | `verify.txt` · `red-before-fix.txt` · `probe-game-pause.json` · `probe-qa-smoke.txt` · `probe-qa-games.txt` · `verify-release-prep.txt` · `mutation-M3-clock-decision.txt` · `mutation-M4-score-guard.txt` · `mutation-M5-guard-position.txt` · `b3-dang-tam-dung.png` · `d2-cho-tiep-tuc.png` · `d3-duong-dua-tam-dung.png` | `npm run verify` rồi `sed 's/\x1b\[[0-9;]*m//g'`; `npm run build`; `node qa/run-one.mjs qa/game-pause.mjs`; `npm run qa:smoke` và `npm run qa:games` (đã cắt mã màu khi lưu); ablation: sửa `src/hooks/useGameStage.ts:24` / `:139` / lùi guard ở `:174` → `npx vitest run tests/t43-game-pause.test.ts` → `git checkout -- src/hooks/useGameStage.ts` | **Pass** |
| `2026-11-02-RELEASE-1.1.0` | `b36f3bf` — log đo trên working tree **đúng bằng** nội dung commit này (trước khi nó tồn tại trong `git log`); chưa tag, đợi squash vào `main` | 2026-11-02 | Hồ sơ phát hành `v1.1.0`: `[Unreleased]` → `[1.1.0] - 2026-11-02`, `package.json` + `package-lock.json` lên `1.1.0`, ghi chú release trích được bằng `scripts/release-notes.mjs` | `verify-release-prep.txt` · hồ sơ §3.4 trong `docs/lifecycle/07_RELEASE_OPERATIONS.md` | `node scripts/release-notes.mjs 1.1.0 \| wc -l` · `npm install --package-lock-only --dry-run` · `npm run verify` | **NotRun** cho Release — CI trên GitHub chưa chạy, chưa có chữ ký Go/No-Go, `git tag \| wc -l` = 0 |
| `2026-11-03-RELEASE-1.1.0-tag` | `77d90ce` mang tag `v1.1.0` hiện hành (tag object `4f75f5d`, `git for-each-ref refs/tags/v1.1.0 --format='%(objectname) %(*objectname)'`); tag đầu ở `7d92246` (`6687667`) đã xoá vì CI đỏ, `1b8dadd` + `66e0fea` là hai sửa nằm giữa | 2026-11-02→03 | Release thật đã đóng: `main` đẩy `09511d3..77d90ce` (merge `--no-ff` `7365830`, sửa flake theo giờ, đồng bộ lock với npm 10, workflow 03 tự build `dist/`), tag annotated đẩy lên `origin`, workflow `4. Release` tạo đối tượng release thật | `verify-release-head.txt` · `ci-install-red.txt` · `ci-runs.txt` · `ci-release-green.txt` · `verify-main-1278.txt` · `repro-fatigue-midnight.txt` | `npm run verify` ⇒ EXIT=0 · 89 file / 1278 test · `index-B6au8G63.js` 204.2 kB · `git tag \| wc -l` = 1 · `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` | **Đã phát hành một phần** — trên `77d90ce`: `1. Quality` 41490451023 + `2. Build + artifact` 41490451085 + **`4. Release` 41490669966 success** ⇒ release id `431754261`, asset 1 369 166 byte, 0 lượt tải; `3. Browser QA` 41490451074 đỏ ở bước `QA probe` (job có `continue-on-error` nên run vẫn báo success); chữ ký Go/No-Go trống |
| `2026-11-03-QA-RACE` | `08eacc7` + `37fd35e` (kênh chẩn đoán) · `afb9eeb` (bản sửa race) | 2026-11-03 | `3. Browser QA` chuyển từ đỏ sang xanh: tìm ra kênh đọc được lỗi CI, bắt đúng race overlay "Chúc mừng lên cấp", và chứng minh lỗi thuộc **tooling của probe** chứ không phải ứng dụng | `ci-annotation-race.txt` · `verify-1280.txt` | `node qa/run-one.mjs qa/golden-path.mjs` ⇒ exit 0 · `QA PASS — 28 step(s), 0 errors` (cùng đợt: `parent-controls` 7 · `lesson-smooth` 8 · `gacha-machine` 4, đều exit 0) · `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/check-runs/125470717595/annotations` · `npm run verify` ⇒ EXIT=0 · 89 file / **1280** test · `index-B6au8G63.js` 204.2 kB · `Duration 21.88s` | **Pass** (cấp probe, **một lần**) — run 41501753363 success 63 s; bằng chứng lấy từ `jobs[].steps[].conclusion` (bước 7 `success`, bước 8 `skipped`) chứ **không** phải "0 annotation `::error::`" — suy luận đó đã bị đợt hai bác. **Không** phải Pass cho release: bản sửa nằm **sau** tag `v1.1.0` |
| `2026-11-03-QA-RACE` — đợt hai (flake) | HEAD `main` `8e6f9f5` (docs-only) + sửa `03-qa-browser.yml`/`t31` trong working tree | 2026-11-03 | Cùng một probe **đỏ lại** ngay sau lần xanh ⇒ cổng QA **intermittent**, chưa đóng; và bước chẩn đoán từng **che** lần chết thật bằng cách chạy lại probe | `ci-flake-second-run.txt` · `verify-1281.txt` | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/check-runs/125481620651/annotations` (body là mảng trần ⇒ `jq length`) · `curl -s …/actions/runs/41504913606/jobs` · `npx vitest run tests/t31-bug-hunt-fixes.test.ts` ⇒ 21 passed · `npm run verify` ⇒ EXIT=0 · 89 file / **1281** test · `Duration 22.58s` · `index-B6au8G63.js` 204.2 kB | **Fail** (cấp cổng) — run 41504913606 job `failure` ở bước 7 "QA probe", `src/` và `qa/` không đổi. Đã sửa **cách đo**, chưa sửa **nguyên nhân flaky**: annotation của lần đỏ ghi `QA PASS` vì bước chẩn đoán chạy lại probe ⇒ nay giữ `probe-run.log` của lần thật + 1 test hợp đồng. `continue-on-error: true` vẫn để nguyên |
| `2026-11-03-QA-RACE` — đợt ba (nguyên nhân thật) | HEAD `main` `80c7e39` + bản sửa `src/components/parent/ParentDashboardModal.tsx` và helper `unlockParentDashboard` trong `qa/lib.mjs` (working tree) | 2026-11-03 | Annotation của lần đỏ **đọc được nơi chết thật** ⇒ race nằm ở **ứng dụng**: đề cổng phụ huynh tới muộn hơn khung hình đầu (`useEffect` chạy sau paint). Probe từng che bằng `waitForTimeout(400)` — nay bỏ, đi qua helper xác nhận cổng đã đóng | `ci-gate-race.txt` · `verify-1286.txt` · `ci-flake-second-run.txt` | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/check-runs/125495014729/annotations` (mảng trần) · `npx vitest run tests/t41f-parent-gate.test.ts` ⇒ RED 5 failed / GREEN 5 passed · `node qa/run-one.mjs qa/golden-path.mjs` ×4 ⇒ 4/4 `QA PASS — 28 step(s), 0 errors` · `npm run verify` ⇒ EXIT=0 · 90 file / **1286** test · `Duration 22.18s` · `index-TgwkX59u.js` 204.2 kB | **Pass** (cấp máy, cho bản sửa) · **Blocked** (cấp CI — chưa có run trên commit chứa bản sửa) |

Verdict chỉ nhận 4 giá trị: `Pass` · `Fail` · `Blocked` · `NotRun`. `NotRun` **không phải** `Pass` —
một ô `NotRun` vẫn phải ghi rõ vì sao chưa chạy.

---

## 3. Đọc từng artifact

### Đợt `2026-11-02-KBT-ISSUE-43` (nghiêng)

| File | Mở ra thấy gì | Số đo |
|---|---|---|
| `verify.txt` | `npm run verify` trên tip `feature/43-game-pause` — sau merge `c8a3725` và hai sửa review (guard theo vị trí + ARIA lớp phủ) | `88` test file passed · `1272` test passed · `Duration 21.55s` · `Main chunk: index-qnZ3EVTS.js = 204.2 kB → PASS (meets 450 kB goal)` |
| `verify-rc.txt` | `npm run verify` trên **RC commit** `3d06930` (tip nhánh sau khi merge `09511d3` của lane khác vào) — phép đo chốt để tag `v1.1.0` | `89` test file passed · `1277` test passed · `Duration 23.85s` · `Main chunk: index-B6au8G63.js = 204.2 kB → PASS (meets 450 kB goal)` |
| `verify-main-1278.txt` | `npm run verify` trên HEAD `main` sau merge release **và** bản sửa flake theo giờ trong `tests/fatigue-reset.test.ts` — phép đo chốt để đóng tag | `89` test file · `1278` test · `Duration 23.64s` · `Main chunk: index-B6au8G63.js = 204.2 kB → PASS` (hash **không đổi** so với RC: fix chỉ đụng `tests/`, không vào bundle) |
| `repro-fatigue-midnight.txt` | Hai lượt `npx vitest run tests/fatigue-reset.test.ts` **cô lập** trong khung 23:45 +07: lượt 1 với bản test cũ (mốc phiên = `Date.now()`), lượt 2 với bản đã neo `NOON_ANCHOR` — chứng minh đỏ là do thời điểm chạy, không phải hồi quy hành vi | cũ: `Tests 1 failed \| 6 passed (7)` EXIT=1 · mới: `Tests 8 passed (8)` EXIT=0 · `Duration 504ms` |
| `red-before-fix.txt` | Log **trước** khi sửa source — chứng minh test bắt được bug thật, không viết ra sau khi code đã đúng | `30 tests \| 24 failed` · `Tests 24 failed \| 6 passed (30)` · EXIT=1 |
| `verify-release-head.txt` | `npm run verify` chạy lại **ngay trên commit được tag** (HEAD `main` lúc đóng `v1.1.0`) — log nguyên văn, đã bỏ mã màu ANSI | `EXIT=0` · `89` test file · `1278` test · `Duration 22.57s` · `Main chunk: index-B6au8G63.js = 204.2 kB → PASS` (cùng entry hash với `verify-main-1278.txt`) |
| `ci-install-red.txt` | Vì sao **cả 4 workflow đỏ ở bước Install** lần CI đầu tiên, và lệnh tái lập lỗi trên máy không cần server | `npx --yes npm@10 ci` trên bản sao tree ⇒ `EXIT=1` `EUSAGE` + `Missing: @emnapi/core@1.11.3` / `@emnapi/runtime@1.11.3` · cùng tree với npm 11.6.2 ⇒ `EXIT=0` (158 packages) |
| `ci-runs.txt` | Bảng trạng thái CI đọc qua API công khai, 3 mốc: `7d92246` (tag đầu, đỏ Install) → `1b8dadd` (lock sửa, 01+02 xanh) → `66e0fea` (workflow 03 sửa, probe thật sự chạy rồi đỏ ở bước 7) | `1. Quality` 41488045169 success · `2. Build + artifact` 41488045172 success · `3. Browser QA` 41488045102 job failure ở "QA probe" (job có `continue-on-error`) · `4. Release` 41486056746 failure ở Install |
| `ci-release-green.txt` | Chuỗi bằng chứng **đóng release**: tag hiện hành `4f75f5d`→`77d90ce` (tag đầu đã xoá), cổng máy đo lại đúng commit được tag, 4 run CI trên `77d90ce`, và đối tượng GitHub Release thật đọc từ API — kèm mục "những gì release này chưa có" | `npm run verify` ⇒ EXIT=0 · `89` test file · `1278` test · `Duration 21.84s` · `index-B6au8G63.js = 204.2 kB → PASS` · `1. Quality` 41490451023 + `2. Build + artifact` 41490451085 + `4. Release` 41490669966 **success** (9/9 bước) · release id `431754261`, body 80 435 byte, asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte, downloads 0 · `3. Browser QA` 41490451074 vẫn đỏ bước `QA probe` |
| `verify-release-prep.txt` | `npm run verify` **sau** khi chốt hồ sơ `1.1.0` (`CHANGELOG` đổi header, `package.json` + lock lên `1.1.0`) — để chắc bước chuẩn bị release không đổi artefact | `88` test file · `1272` test · `Duration 33.43s` · entry **vẫn** `index-qnZ3EVTS.js = 204.2 kB → PASS` (mã bundle không đọc `package.json.version`) |
| `probe-game-pause.json` | Playwright trên `dist/` thật: 4 trò đồng hồ có đúng 1 nút tạm, 1 trò không đồng hồ có 0 nút; tạm ⇒ bóng đứng nguyên 1 200 ms; chạm lúc tạm không nhích câu; bấm tiếp rơi lại; **C2 đối chứng**: cùng cú chạm lúc đang chạy thì xoá đúng bóng đích | `12` bước · `errors: []` · `ok: true` · `QA PASS — 12 step(s), 0 errors` |
| `probe-qa-smoke.txt` | `npm run qa:smoke` = `qa/golden-path.mjs` — luồng chính của bé từ trang chủ tới màn chơi, chạy lại sau hai sửa review để chắc không hồi quy | `QA PASS — 28 step(s), 0 errors` · `errors: []` · `removals: []` · `noDuplicateRewards`: `xpBefore 260 → xpAfter 260` |
| `probe-qa-games.txt` | `npm run qa:games` — mount **cả 31 trò** qua `GameModalWrapper` (file mà lát cắt này sửa), bắt hồi quy toàn bộ chứ không chỉ 4 trò có nút tạm | `QA PASS — 0 step(s), 0 errors` · `catalogCount: 31` · `mountSmoke` 31/31 `mounted: true` · `overflowPx` lớn nhất `0` · `rewards.mountOnlyAwardedNothing: true` |
| Ba file `-rc` (`probe-qa-smoke-rc.txt`, `probe-qa-games-rc.txt`, `probe-game-pause-rc.json`) | Ba probe trên chạy **lại** trên RC `3d06930` (sau merge `09511d3` — engine cờ vua đổi hoàn toàn, phải chứng minh không hồi quy) | `qa:smoke` `QA PASS — 28 step(s), 0 errors` · `qa:games` `catalogCount: 31`, 31/31 `mounted: true`, `overflowPx` max `0`, `errors: []` · `game-pause` `ok: true`, 12 bước, `errors: []`, `failedAt: null` |
| `mutation-M3-clock-decision.txt` | Bỏ đúng `&& !s.pausedByUser` ở `src/hooks/useGameStage.ts:24` | `Tests 2 failed \| 28 passed (30)` · EXIT=1 · đã `git checkout --` và kiểm tra lại dòng 24 |
| `mutation-M4-score-guard.txt` | Bỏ `if (!isRunning) return;` ở `useGameStage.ts:139` (một trong hai bản) | `Tests 1 failed \| 29 passed (30)` · EXIT=1 · `grep -c` lại guard = 2 |
| `mutation-M5-guard-position.txt` | **Không bỏ** dòng nào — chỉ lùi guard của `submitWrong` xuống **sau** `setMistakesInTier` (lỗi mà review 4 lớp chỉ ra: test cũ chỉ đếm guard nên vẫn xanh) | `Tests 1 failed \| 29 passed (30)` · EXIT=1 · đỏ đúng dòng "guard không nằm ngay đầu hàm" |
| `b3-dang-tam-dung.png` | *Đập Bóng Màu* đang tạm | 5 bóng đứng yên sau 1 200 ms (`62.9%` / `82.9%` không đổi), `aria-pressed="true"`, lớp phủ "Đang tạm dừng" che bàn chơi |
| `d2-cho-tiep-tuc.png` | Cùng màn, sau khi bấm "Chơi tiếp" | Không còn lớp phủ, `aria-pressed="false"`, bóng rơi lại `65.65% → 82.15%` |
| `d3-duong-dua-tam-dung.png` | *Đường Đua Thần Tốc* đang tạm | Hai thanh tiến trình đóng băng cùng `width: 83.3333%` sau 1 500 ms — bé không bị trừ lỗi vì việc cắt ngang; bấm tiếp thì chạy lại (`73.3333%`) |

Ba ảnh là phần "bằng chứng nhìn thấy được" mà `AGENTS.md` §1 mục 3 bắt buộc khi đổi UI:
typecheck xanh không chứng minh được rằng đồng hồ vẫn chạy khi bé bấm tạm dừng.

`red-before-fix.txt` và hai log mutation trả lời câu hỏi mà `docs/plan/TEST_CASES.md` rule 3 đặt ra
("một TC phải bắt được lỗi"): **3** phép ablation đã chạy trong đợt này (M3, M4, M5), cả ba đều đỏ
rồi được hoàn tác; tính cả hai phép của đợt T41C thì tổng là **5** (M1…M5).

### Tái lập đợt `2026-11-02-KBT-ISSUE-43`

```bash
git checkout main                          # HEAD `main` sau merge release (mang bản sửa flake theo giờ)
# muốn tái lập đúng RC của Pha 4–5: git checkout 3d06930  → 89 file / 1277 test / 23.85s (`verify-rc.txt`)
npm run hooks:install && npm ci && npm run verify        # 89 file / 1278 test / 204.2 kB `index-B6au8G63.js`
sed 's/\x1b\[[0-9;]*m//g' <log> > evidence/2026-11-02-KBT-ISSUE-43/verify-main-1278.txt
npm run build
node qa/run-one.mjs qa/game-pause.mjs > evidence/2026-11-02-KBT-ISSUE-43/probe-game-pause.json
# phải in QA PASS — 12 step(s), 0 errors (dòng đó nằm ngoài JSON, đã cắt khi lưu)
npm run qa:smoke 2>&1 | sed 's/\x1b\[[0-9;]*m//g' > evidence/2026-11-02-KBT-ISSUE-43/probe-qa-smoke.txt   # QA PASS — 28 step(s), 0 errors
npm run qa:games 2>&1 | sed 's/\x1b\[[0-9;]*m//g' > evidence/2026-11-02-KBT-ISSUE-43/probe-qa-games.txt   # catalogCount 31, errors []
```

Ba ảnh `b3/d2/d3` ghi thẳng vào `evidence/2026-11-02-KBT-ISSUE-43/` bởi chính probe
(`qa/game-pause.mjs:13` đặt `OUT` = thư mục này, `:41` gọi `page.screenshot`); JSON là stdout,
vì vậy phải redirect như trên. Mỗi lần chạy lại, ảnh và JSON được ghi đè — số `%` trong hai file
đó luôn cùng một lượt chụp.

### Đợt `2026-11-02-T41C`

| File | Mở ra thấy gì | Số đo |
|---|---|---|
| `verify.txt` | Toàn bộ output `npm run verify` (typecheck → `test:ci` → build → `check:budget`) | `87` test file passed · `1240` test passed · `Duration 27.24s` · `Main chunk: index-C_mEaaUG.js = 204.2 kB → PASS (meets 450 kB goal)` |
| `probe-t32-game-replay-evidence.json` | Chơi lại cùng một màn không cộng thưởng hai lần | `ok: true` · `5` bước · `0` lỗi |
| `probe-parent-controls.json` | Ba mẹ tắt quỹ thưởng ⇒ hệ thống không tự cộng Sao | `ok: true` · `7` bước · `0` lỗi |
| `probe-golden-path.json` | Luồng chính của bé từ trang chủ tới màn chơi | `28` bước · `0` lỗi · `removals` (chuỗi bị loại khỏi DOM) rỗng. Probe này **không** in khoá `ok` — đọc `errors.length === 0` |
| `game-rewards-on.png` | Màn "VƯỢT QUA MÀN 1!" của *Đọc Câu Làm Theo* khi quỹ thưởng **bật** | Dải thưởng `+3 Sao` `+10 XP`, đúng số thực vào túi |
| `game-rewards-off.png` | Cùng màn đó khi ba mẹ **tắt** quỹ thưởng | Không còn dòng `+N Sao`/`+N XP`; thay bằng dải xanh "Nhà mình đang tắt phần thưởng nên lượt này không cộng Sao hay XP — Gấu vẫn ghi nhớ bài học của bé." |

Hai ảnh là phần "bằng chứng nhìn thấy được" mà `AGENTS.md` §1 mục 3 bắt buộc khi đổi UI:
typecheck xanh không chứng minh được rằng màn kết quả trước đây in `+0 Sao`.

### Tái lập ảnh

Ảnh chụp bằng Playwright trên bản build của `d54f341`, kịch bản: mở trò *Đọc Câu Làm Theo*
(index 8 trong `qa/games.mjs → GAME_TITLES`), trả lời đủ 5 câu của màn «Khởi Động» tới khi hiện
bảng kết quả, tắt/mở `kho_bau_motivation.rewardsEnabled` giữa hai lượt.
Probe tự động hoá tương đương đã có sẵn: `qa/t32-game-replay-evidence.mjs` và `qa/parent-controls.mjs`.

### Đợt `2026-11-03-QA-RACE`

| File | Mở ra thấy gì | Số đo |
|---|---|---|
| `ci-annotation-race.txt` | Sáu khối theo đúng thứ tự điều tra: bảng kênh đọc log CI (log API trả `403 Must have admin rights to Repository`, `$GITHUB_STEP_SUMMARY` ⇒ `output.summary` 0 byte, annotation ⇒ `HTTP 200` không cần token), payload đỏ lần đọc 1, payload đỏ lần đọc 2 giữ được Call log Playwright, phân tích một nguyên nhân duy nhất, bản dựng lại race bằng modal mở trễ 600 ms, và bốn lần probe chạy lại cục bộ | đỏ: check-run `125458270068` (trên `08eacc7`) và `125463507371` (trên `37fd35e`) · xanh lần đầu: run `41501753363` trên `afb9eeb`, 63 s, check-run `conclusion=success` · môi trường runner `Linux 7.0.0-1017-azure`, `node=v22.23.4`, `npm=10.9.9`, `playwright=Version 1.64.1` · probe cục bộ: golden-path `28 step(s)`, parent-controls `7`, lesson-smooth `8`, gacha-machine `4` — đều exit 0 |
| `verify-1280.txt` | output `npm run verify` nguyên văn trên HEAD `afb9eeb`, đã cắt mã màu nên `measure.mjs --vitest-out -` đọc được | EXIT=0 · 89 file / **1280** test pass · `Duration 21.88s` · `index-B6au8G63.js` **204.2 kB** PASS (hash không đổi vì `src/` không bị đụng) |
| `ci-flake-second-run.txt` | Sáu khối của **đợt hai**: job `failure` và từng bước của run 41504913606, 5 annotation của check-run đỏ (2 cái phát từ bước chẩn đoán: một in `{"errors":[],"lastSteps":[…]}`, một in `QA PASS — 2…` bị cắt vì probe đã chạy lại và ăn may; chỉ `Process completed with exit code 1.` là dấu vết thật), check-run xanh `afb9eeb` để đối chứng, và lệnh `curl` tái lập | run 41504913606: bước 7 `QA probe` `conclusion=failure`, bước 8 `success` · check-run 125481620651 `conclusion=failure` @ `2026-11-02T18:55:37Z` so với 125470717595 `conclusion=success` @ `2026-11-02T18:34:48Z` · annotation count=5 (body **mảng trần**, `JSON.parse(t).annotations` ⇒ `undefined`) |
| `verify-1281.txt` | output `npm run verify` nguyên văn trên working tree = HEAD `8e6f9f5` + bản sửa `03-qa-browser.yml` và test hợp đồng thứ 3, đã cắt mã màu | EXIT=0 · 89 file / **1281** test pass · `Duration 22.58s` · `index-B6au8G63.js` **204.2 kB** PASS (vẫn không đổi — chỉ đụng `qa/`, `.github/`, `tests/`, docs) |
| `ci-gate-race.txt` | Payload annotation của chính lần đỏ (run 41508824890), chuỗi nhân quả paint-vs-effect, và **số đo MutationObserver hai chiều**: trước sửa `total=9 paintedDefault15plus18=9` với đề thật đến sau 5–114 ms; sau sửa `paintedDefault15plus18=0`, mỗi lần mở đúng một đề | Lệnh đo + diễn giải trace ghi ngay trong file; script đo là `tmp-gate-race.mjs` đặt ở **gốc repo** và **đã xoá** (không bỏ vào `qa/` vì `qa/*.mjs` bị đếm là probe) |
| `verify-1286.txt` | output `npm run verify` nguyên văn trên working tree = HEAD `80c7e39` + bản sửa đề cổng + `tests/t41f-parent-gate.test.ts`, đã cắt mã màu | EXIT=0 · 90 file / **1286** test pass · `Duration 22.18s` · `index-TgwkX59u.js` **204.2 kB** PASS (**hash đổi vì `src/` đổi**, kB không đổi) |

---

## 4. Việc còn treo

| Hạng mục | Trạng thái | Lý do / điều kiện dừng |
|---|---|---|
| Bằng chứng cho một **release** thật (RC tag + go/no-go) | `Đã có tag + release`, `chưa có chữ ký` | Tag `v1.1.0` (`4f75f5d` → `77d90ce`) ở `origin` (`git tag \| wc -l` = 1, đo 2026-11-03) kèm `verify-release-head.txt` + `ci-release-green.txt`; workflow `4. Release` run 41490669966 **success cả 9 bước** ⇒ đối tượng release thật id `431754261` với asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte (**0 lượt tải**, chưa ai giải nén để kiểm). Ba ô vẫn treo: **chữ ký Go/No-Go** (quyền duy nhất của người giữ repo, `07` §3); **`3. Browser QA` đỏ ở bước `QA probe`** trên Linux qua bốn run liên tiếp — *cập nhật 2026-11-03:* nguyên nhân đã đọc được qua annotation và đã sửa trên `afb9eeb` (xanh lần đầu, run 41501753363) — **rồi đỏ lại** trên `8e6f9f5` (run 41504913606, commit chỉ đổi tài liệu) ⇒ cổng QA **intermittent**, `continue-on-error` chưa bỏ; thêm vào đó bản sửa **nằm sau** tag `v1.1.0` nên ô này chỉ đóng khi đổi tag hoặc lên bản khác; và **nghiệm thu người dùng** (đọc to ≥1 bài/môn). |
| Ảnh chụp cho T41A/T41B | `NotRun` | Hai đợt này sửa quyền hiển thị và timezone; đã đóng bằng test nguồn + test đơn vị, chưa có ảnh. Ghi ở `docs/lifecycle/README.md` Evidence Board. |
| `docs/opencode/reports/img/*.png` | không nằm ở đây | 39 ảnh do quy trình audit tự động ghi, là **nhật sử** của các phiên trước; số hiện trạng lấy từ `npm run verify` của phiên đang chạy. |
