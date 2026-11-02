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
| `2026-11-02-KBT-ISSUE-43` | `a61920b` (nguồn+test+probe) · `c8a3725` (merge giữ lockfile) · tip `feature/43-game-pause` (2 sửa review) | 2026-11-02 | Nút **Tạm dừng trò chơi** trên 4 trò có đồng hồ phạt sự chậm trễ: đồng hồ đứng, chạm lúc tạm không tính điểm, bấm tiếp chạy lại (KBT-ISSUE-43) | `verify.txt` · `red-before-fix.txt` · `probe-game-pause.json` · `probe-qa-smoke.txt` · `probe-qa-games.txt` · `verify-release-prep.txt` · `mutation-M3-clock-decision.txt` · `mutation-M4-score-guard.txt` · `mutation-M5-guard-position.txt` · `b3-dang-tam-dung.png` · `d2-cho-tiep-tuc.png` · `d3-duong-dua-tam-dung.png` | `npm run verify` rồi `sed 's/\x1b\[[0-9;]*m//g'`; `npm run build`; `node qa/run-one.mjs qa/game-pause.mjs`; `npm run qa:smoke` và `npm run qa:games` (đã cắt mã màu khi lưu); ablation: sửa `src/hooks/useGameStage.ts:24` / `:139` / lùi guard ở `:174` → `npx vitest run tests/t43-game-pause.test.ts` → `git checkout -- src/hooks/useGameStage.ts` | **Pass** |
| `2026-11-02-RELEASE-1.1.0` | chưa tag (đợi squash vào `main`) | 2026-11-02 | Hồ sơ phát hành `v1.1.0`: `[Unreleased]` → `[1.1.0] - 2026-11-02`, `package.json` + `package-lock.json` lên `1.1.0`, ghi chú release trích được bằng `scripts/release-notes.mjs` | `verify-release-prep.txt` · hồ sơ §3.4 trong `docs/lifecycle/07_RELEASE_OPERATIONS.md` | `node scripts/release-notes.mjs 1.1.0 \| wc -l` · `npm install --package-lock-only --dry-run` · `npm run verify` | **NotRun** cho Release — CI trên GitHub chưa chạy, chưa có chữ ký Go/No-Go, `git tag \| wc -l` = 0 |

Verdict chỉ nhận 4 giá trị: `Pass` · `Fail` · `Blocked` · `NotRun`. `NotRun` **không phải** `Pass` —
một ô `NotRun` vẫn phải ghi rõ vì sao chưa chạy.

---

## 3. Đọc từng artifact

### Đợt `2026-11-02-KBT-ISSUE-43` (nghiêng)

| File | Mở ra thấy gì | Số đo |
|---|---|---|
| `verify.txt` | `npm run verify` trên tip `feature/43-game-pause` — sau merge `c8a3725` và hai sửa review (guard theo vị trí + ARIA lớp phủ) | `88` test file passed · `1272` test passed · `Duration 21.55s` · `Main chunk: index-qnZ3EVTS.js = 204.2 kB → PASS (meets 450 kB goal)` |
| `red-before-fix.txt` | Log **trước** khi sửa source — chứng minh test bắt được bug thật, không viết ra sau khi code đã đúng | `30 tests \| 24 failed` · `Tests 24 failed \| 6 passed (30)` · EXIT=1 |
| `verify-release-prep.txt` | `npm run verify` **sau** khi chốt hồ sơ `1.1.0` (`CHANGELOG` đổi header, `package.json` + lock lên `1.1.0`) — để chắc bước chuẩn bị release không đổi artefact | `88` test file · `1272` test · `Duration 33.43s` · entry **vẫn** `index-qnZ3EVTS.js = 204.2 kB → PASS` (mã bundle không đọc `package.json.version`) |
| `probe-game-pause.json` | Playwright trên `dist/` thật: 4 trò đồng hồ có đúng 1 nút tạm, 1 trò không đồng hồ có 0 nút; tạm ⇒ bóng đứng nguyên 1 200 ms; chạm lúc tạm không nhích câu; bấm tiếp rơi lại; **C2 đối chứng**: cùng cú chạm lúc đang chạy thì xoá đúng bóng đích | `12` bước · `errors: []` · `ok: true` · `QA PASS — 12 step(s), 0 errors` |
| `probe-qa-smoke.txt` | `npm run qa:smoke` = `qa/golden-path.mjs` — luồng chính của bé từ trang chủ tới màn chơi, chạy lại sau hai sửa review để chắc không hồi quy | `QA PASS — 28 step(s), 0 errors` · `errors: []` · `removals: []` · `noDuplicateRewards`: `xpBefore 260 → xpAfter 260` |
| `probe-qa-games.txt` | `npm run qa:games` — mount **cả 31 trò** qua `GameModalWrapper` (file mà lát cắt này sửa), bắt hồi quy toàn bộ chứ không chỉ 4 trò có nút tạm | `QA PASS — 0 step(s), 0 errors` · `catalogCount: 31` · `mountSmoke` 31/31 `mounted: true` · `overflowPx` lớn nhất `0` · `rewards.mountOnlyAwardedNothing: true` |
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
git checkout feature/43-game-pause        # tip nhánh — 1272 test cần merge c8a3725 (thêm 2 test của lane kia)
npm run hooks:install && npm ci && npm run verify        # 88 file / 1272 test / 204.2 kB
sed 's/\x1b\[[0-9;]*m//g' <log> > evidence/2026-11-02-KBT-ISSUE-43/verify.txt
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

---

## 4. Việc còn treo

| Hạng mục | Trạng thái | Lý do / điều kiện dừng |
|---|---|---|
| Bằng chứng cho một **release** thật (RC tag + go/no-go) | `NotRun` | Repo chưa từng có tag nào (`git tag \| wc -l` = 0, đo lại 2026-11-02). **Hồ sơ đã đóng sẵn** ở `docs/lifecycle/07_RELEASE_OPERATIONS.md` §3.4: `CHANGELOG.md` đổi thành `[1.1.0] - 2026-11-02`, `package.json`/lock cùng `1.1.0`, cổng xanh trên nhánh `feature/43-game-pause`. Còn thiếu đúng hai bước thuộc quyền người giữ repo: mở PR + squash vào `main`, rồi tag **HEAD của `main`** (tag một commit chưa nằm trên `main` sẽ vi phạm định nghĩa RC ở §1 trạm 1). |
| Ảnh chụp cho T41A/T41B | `NotRun` | Hai đợt này sửa quyền hiển thị và timezone; đã đóng bằng test nguồn + test đơn vị, chưa có ảnh. Ghi ở `docs/lifecycle/README.md` Evidence Board. |
| `docs/opencode/reports/img/*.png` | không nằm ở đây | 39 ảnh do quy trình audit tự động ghi, là **nhật sử** của các phiên trước; số hiện trạng lấy từ `npm run verify` của phiên đang chạy. |
