# 07 — Release & Operations
## Phát hành & vận hành · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Trạng thái pha:** **`Đã phát hành`** — tag `v1.1.0` tồn tại trên `origin` (`git tag | wc -l` = **1**,
đo 2026-11-03; `git for-each-ref refs/tags/v1.1.0 --format='%(objectname) %(*objectname)'` trả tag
object `4f75f5d` đóng trên commit `77d90ce`) **và đối tượng GitHub Release thật đã tồn tại**
(`curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` ⇒ id
`431754261`, `draft false`, asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte — mục 3.4).
Tài liệu này mô tả cả quy trình *đã chạy* lẫn những gì **vẫn mở**: chữ ký Go/No-Go
của người giữ repo, nghiệm thu người dùng, và thực tế rằng `3. Browser QA` **xanh lần đầu trên `afb9eeb`
rồi đỏ lại trên `8e6f9f5` (docs-only), đỏ tiếp trên `80c7e39` (run 41508824890) — và cả hai lần commit mang
tag `v1.1.0` (`77d90ce`) đều chạy trước mọi bản sửa race** nên gate của chính bản phát hành vẫn đỏ (§3.4).
Đợt ba **đã đọc được nguyên nhân thật** và nó nằm ở app, không phải probe: đề cổng phụ huynh xuất hiện muộn
hơn khung hình đầu (`useEffect` chạy sau paint). Bản sửa đã merge (`1afda69`) và **`3. Browser QA` xanh trên
đúng commit chứa nó** (`2d2ca27`, run 41515106575, bước 7 "QA probe" `success` sau 66 s) — song `v1.1.0` vẫn
đóng ở `77d90ce`, tức commit *trước* mọi bản sửa race, nên điều kiện No-Go của chính bản phát hành **chưa đổi**.

**Cập nhật cùng ngày (hồ sơ bản `1.1.0` đã đóng trên nhánh):** ba điều kiện No-Go trong §3 mà hồ sơ
này tự chặn đã gỡ — `CHANGELOG.md` `[Unreleased]` **đã chuyển thành** `## [1.1.0] - 2026-11-02`
(kiểm bằng `node scripts/release-notes.mjs 1.1.0 | wc -l` = **875** dòng ghi chú release),
`package.json` và `package-lock.json` cùng `1.1.0` (kiểm bằng `npm install --package-lock-only
--dry-run` ⇒ `up to date`, EXIT=0 ⇒ `npm ci` của CI không lệch lock), và V&V xanh trên
`feature/43-game-pause` (mục 2). **Hai việc còn lại thuộc quyền người giữ repo:** mở PR + squash vào
`main`, rồi tag **đúng commit HEAD của `main`** — xem biên bản §3.4.

**Cập nhật sau đó trong cùng ngày (release đã đóng):** người dùng ra "tự động chọn khi tôi không ở
đây", nên hai bước kể trên agent làm thay phần *thao tác*: merge `--no-ff` `feature/43-game-pause` vào
`main` (commit `7365830`), sửa flake theo giờ làm cổng đỏ trên HEAD merge (`7d92246`), rồi tag
`v1.1.0` đúng HEAD đã xanh của `main` và đẩy cả `main` lẫn tag lên `origin`. **Không đổi mục trên —
nó là biên bản lúc chuẩn bị.** Phần agent *không* làm được: chữ ký Go/No-Go (§3, quyền duy nhất của
người giữ repo) và đọc to ≥1 bài/môn cho bé; vì vậy release này là **phát hành kỹ thuật**, nghiệm thu
người dùng vẫn `NotRun`.

**Đo lại 2026-11-03 — tag đã đổi chỗ, release thì có thật.** Tag `v1.1.0` đầu tiên đóng ở `7d92246`
bị **xoá khỏi `origin`** vì cả 4 workflow của nó đỏ ở bước Install (`npm ci` + lockfile lệch semantics
npm 10 — biên bản ở `evidence/2026-11-02-KBT-ISSUE-43/ci-install-red.txt`) và workflow `4. Release`
chết trước bước "Create GitHub Release" ⇒ tag tồn tại nhưng release thì không. Sau hai sửa
(`1b8dadd` regenerate lock bằng `npx --yes npm@10 install --package-lock-only`, `66e0fea` workflow 03
tự build `dist/` thay vì download artefact của run khác), tag được tạo lại trên HEAD **đã chạy lại
cổng máy** `77d90ce` và `4. Release` 41490669966 **success** ⇒ đối tượng release thật
(id `431754261`) hiện trên GitHub. Số đo đầy đủ: `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt`.

---

## 1. Release and Operate Loop — 6 trạm

| # | Trạm | Việc | Đã có | Còn thiếu |
|---|---|---|---|---|
| 1 | **RC commit** | chốt commit sẽ phát hành, tag `vX.Y.Z` trên **đúng** commit đã qua V&V gate | workflow `04-release.yml` trigger `push: tags v*.*.*` + `workflow_dispatch` | **đã tag** (2026-11-03): `77d90ce` mang `v1.1.0` = tag object `4f75f5d`; tag đầu `7d92246` bị xoá vì CI đỏ ở Install |
| 2 | **Verdict** | mọi AC của **hai** lát cắt ở `TEST_CASES.md` §2 (6 US × 3 nhánh) + toàn bộ exit criteria `TEST_PLAN.md` §10 | 42/42 TC Pass (`TEST_CASES.md` §3) | phần lớn FR chưa xuống tầng TC — **không ghi con số "còn 83 FR"**: tổng FR khai báo (88) lệch số dòng FR thật trong `SRS.md` (89), xem `RTM.md` §9 rule 5 |
| 3 | **Go/No-Go** | người chịu trách nhiệm ký; AI **không** ký | mục §3 dưới đây | chưa có phiên ký nào |
| 4 | **Sẵn sàng vận hành** | expand/contract migration, restore drill, SLI/SLO, incident | ADR-02 + `MIGRATIONS` chain (`storage.ts:111`) | §5, §6 |
| 5 | **Phát hành** | build → zip `dist/` → GitHub Release, note lấy từ `CHANGELOG.md` | workflow 04 làm đủ 3 bước | **đã chạy xanh lần đầu** (2026-11-03): run `41490669966` success 9 bước ⇒ release id `431754261` + asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte; còn thiếu: **0 lượt tải** và chưa ai mở zip trên máy thật |
| 6 | **Sau phát hành** | smoke, theo dõi SLI, kế hoạch rollback | `qa/golden-path.mjs` dùng được làm smoke | không có telemetry ⇒ chỉ theo dõi được ở máy người dùng |

## 2. Mọi bằng chứng gắn một commit

Quy tắc: một artifact chỉ chứng nhận cho commit nó được tạo ra. Đợt gần nhất:

| Commit | Ngày | Bằng chứng | Verdict |
|---|---|---|---|
| `d54f341` | 2026-11-02 | `evidence/2026-11-02-T41C/` — verify log, 3 probe JSON, 2 ảnh, 3 log ablation/baseline | **Pass** cho V&V · **NotRun** cho Release |
| `675be7e`+`af2d56a`+`494cce2`+`a61920b`+`fae661c`+`c8a3725`+tip review (nhánh `feature/43-game-pause`, chưa merge vào `main`) | 2026-11-02 | `evidence/2026-11-02-KBT-ISSUE-43/` — `red-before-fix.txt` (24 test FAIL), `verify.txt` (EXIT=0, 88 file / 1272 test / `Duration 21.55s`), `probe-game-pause.json` (12 bước, 0 lỗi), 3 ảnh, 3 log ablation M3/M4/M5 | **Pass** cho V&V · **NotRun** cho Release (CI chưa chạy — repo chưa có tag, `workflow_dispatch` chưa bật; xem §4) |
| `3d06930` (RC: `origin/main` `09511d3` merge vào tip nhánh) | 2026-11-02 | `evidence/2026-11-02-KBT-ISSUE-43/verify-rc.txt` (EXIT=0, 89 file / 1277 test / `Duration 23.85s`, entry `index-B6au8G63.js` 204.2 kB) + `probe-qa-smoke-rc.txt` + `probe-qa-games-rc.txt` + `probe-game-pause-rc.json` | **Pass** cho V&V trên RC · Release xem dòng §3.4 |
| `7365830` → `7d92246` (HEAD `main` lúc đóng tag `v1.1.0` **đầu tiên**) | 2026-11-02 | `evidence/2026-11-02-KBT-ISSUE-43/verify-main-1278.txt` (EXIT=0, 89 file / 1278 test / `Duration 23.64s`), `verify-release-head.txt` (chạy lại đúng HEAD tag, EXIT=0 / `22.57s`), `repro-fatigue-midnight.txt` (RED trước – GREEN sau khi sửa flake) | **Pass** cho V&V trên máy phát triển, **Fail** cho Release phía server: `npm ci` của CI (npm 10) đỏ ở Install ⇒ workflow `4. Release` chết trước bước "Create GitHub Release", tag có thật nhưng release thì không. **Tag này đã bị xoá khỏi `origin`** (`ci-install-red.txt`) |
| `77d90ce` (HEAD `main` mang tag `v1.1.0` **hiện hành** = tag object `4f75f5d`) | 2026-11-03 | `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt` — cổng máy chạy lại đúng commit được tag (EXIT=0, 89 file / 1278 test / `Duration 21.84s`, entry `index-B6au8G63.js` 204.2 kB) + 4 run CI phía server đọc qua API công khai + đối tượng release thật | **Pass** V&V **và** Pass Release kỹ thuật: `1. Quality` 41490451023 · `2. Build + artifact` 41490451085 · `4. Release` 41490669966 success ⇒ release id `431754261` có asset. **Vẫn mở:** `3. Browser QA` 41490451074 đỏ ở bước "QA probe" (nguyên nhân đã bắt và sửa trên `afb9eeb`, **sau** commit này), chữ ký Go/No-Go trống, nghiệm thu người dùng `NotRun` |
| `80c7e39` (test hợp đồng "annotation kể lại lần chạy THẤT BẠI") → working tree mang bản sửa đề cổng | 2026-11-03 | `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` (payload annotation của chính lần đỏ + số đo MutationObserver trước/sau) · `evidence/2026-11-03-QA-RACE/verify-1286.txt` (EXIT=0 · 90 file / 1286 test · `Duration 22.18s` · `index-TgwkX59u.js` 204.2 kB PASS) | **Fail** trên `80c7e39` (run 41508824890 · check-run 125495014729 · `failedAt: SNAP_afterReading`) nhưng lần này **đọc được nơi chết thật**, và nó là lỗi **app**: khung hình đầu của cổng phụ huynh vẽ một đề mồi, đề thật tới sau 5–114 ms (9/9). tại thời điểm đo chưa có run CI trên commit chứa bản sửa (đóng ở dòng dưới) ⇒ chưa bỏ `continue-on-error`, chưa đổi tag `v1.1.0` (vẫn ở `77d90ce`), chữ ký Go/No-Go vẫn trống |
| `2d2ca27` = `1afda69` (fix đề cổng) + `2d2ca27` (docs sync) — **commit đầu tiên chứa bản sửa app được CI chạy** | 2026-11-03 | `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §6 (payload API: `1. Quality` check-run 125516558154 · `2. Build + artifact` 125516557493 · `3. Browser QA` 125516556497 đều `success`; 66 s; bước 7 `QA probe` success, bước 8 skipped; 2 annotation chỉ là cảnh báo runner) + `verify-1286.txt` | **Pass** (V&V trên máy + CI cả ba cổng, lần đầu tiên trên commit có fix). **Không** phải bằng chứng cho `v1.1.0`: tag vẫn ở `77d90ce`, và mới **hai** lượt xanh cho "3. Browser QA" nên `continue-on-error` vẫn bật |
| `c9fd2b4` (docs/evidence ghi chính lượt xanh thứ hai; `src/` + `qa/` không đổi) | 2026-11-03 | `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §6 (run 41516820864 job 125522382222 `success` 127 s · run 41516820781 `typecheck + tests` success · run 41516821097 `build + bundle budget` success) + `npm run test:ci` trên máy: EXIT=0 · 90 file / 1286 test · `Duration 23.00s` | **Pass** — 3/9 lượt và **hai lượt liên tiếp**. Vẫn **không** phải bằng chứng cho `v1.1.0` (tag vẫn ở `77d90ce`); `continue-on-error` chỉ bỏ khi đủ chuỗi liên tiếp theo `03-qa-browser.yml:29` | 

Không được lấy log của `7c60066` để nói `d54f341` an toàn.

## 3. Go / No-Go

| Vai | Người | Quyền |
|---|---|---|
| Ký Go/No-Go | người giữ repo (`ducmanh2802`) | duy nhất |
| Chuẩn bị hồ sơ | agent | không ký, không tự tag |
| Chặn Go | bất kỳ ai thấy P0/P1 mở | quyền No-Go là kết quả tốt, không phải sự cố |

**Điều kiện No-Go ghi trước** (không biện luận sau): `npm run verify` đỏ · `qa/golden-path.mjs` có
error hoặc `failedAt` khác rỗng · còn ISSUE P0/P1 mở · chưa có người lớn đọc to ≥1 bài/môn ·
`CHANGELOG.md` `[Unreleased]` chưa chuyển thành mục version · có dữ liệu trẻ trong working tree.

**Biên mẫu (chưa ký lần nào):**

```
Phiên bản đề xuất : v1.1.0
Commit RC         : <sha> — phải là HEAD của main sau khi verify xanh
Người ký          : ................  Ngày: ......
Kết luận          : GO / NO-GO / GO-CÓ-ĐIỀU-KIỆN
Căn cứ            : <dán output verify + golden-path + số TC NotRun còn lại>
```

### 3.4 Hồ sơ chuẩn bị sẵn cho `v1.1.0` (điền số đo thật — người ký chỉ còn đọc và ghi tên)

| Mục | Nội dung | Lệnh tái lập |
|---|---|---|
| Phạm vi bản `1.1.0` | toàn bộ `[Unreleased]` cũ, tức từ baseline `1.0.0` tới nay; lát cắt đóng băng là **KBT-ISSUE-43 — nút Tạm dừng trò chơi** | `node scripts/release-notes.mjs 1.1.0 \| wc -l` ⇒ `875` |
| Cổng V&V trên nhánh | `npm run verify` **EXIT=0** · `Test Files 88 passed (88)` · `Tests 1272 passed (1272)` · `Duration 21.55s` · `Main chunk: index-qnZ3EVTS.js = 204.2 kB → PASS (meets 450 kB goal)` | `git checkout feature/43-game-pause && npm run hooks:install && npm ci && npm run verify` |
| Chạy lại sau khi chốt hồ sơ `1.1.0` (commit `b36f3bf`) | `npm run verify` **EXIT=0** · `88 file / 1272 test` · `Duration 33.43s` · **entry vẫn `index-qnZ3EVTS.js` 204.2 kB** — đổi `package.json`/`CHANGELOG` không lọt vào bundle nên artefact phát hành y hệt bản đã qua V&V (`evidence/2026-11-02-KBT-ISSUE-43/verify-release-prep.txt`) | `npm run verify` trên working tree có hồ sơ release |
| Smoke trên `dist/` | `npm run qa:smoke` ⇒ `QA PASS — 28 step(s), 0 errors` · `errors: []` · `removals: []` | `npm run build && npm run qa:smoke` |
| **Đo lại trên RC `3d06930`** (tip nhánh, sau merge `09511d3` của lane khác — engine cờ vua đổi hoàn toàn nên phải chạy lại cả ba probe) | `npm run verify` **EXIT=0** · `Test Files 89 passed (89)` · `Tests 1277 passed (1277)` · `Duration 23.85s` · `Main chunk: index-B6au8G63.js = 204.2 kB → PASS (meets 450 kB goal)`; `qa:smoke` `QA PASS — 28 step(s), 0 errors`; `qa:games` `catalogCount: 31` + 31/31 `mounted: true` + `overflowPx` max `0`; `qa/game-pause.mjs` `QA PASS — 12 step(s), 0 errors` `ok: true` | log + JSON lưu ở `evidence/2026-11-02-KBT-ISSUE-43/` (`verify-rc.txt`, `probe-qa-smoke-rc.txt`, `probe-qa-games-rc.txt`, `probe-game-pause-rc.json`) |
| Hồi quy 31 trò (wrapper dùng chung) | `npm run qa:games` ⇒ `catalogCount: 31`, `mountSmoke` 31/31 `mounted: true`, `overflowPx` max `0`, `errors: []` | `npm run qa:games` |
| Probe riêng của lát cắt | `node qa/run-one.mjs qa/game-pause.mjs` ⇒ `QA PASS — 12 step(s), 0 errors`, `ok: true` | như trên, sau `npm run build` |
| CI trên máy chủ, lần 1 (`7d92246` = tag `v1.1.0` đầu tiên) | `1. Quality` run 41485714651 · `2. Build + artifact` 41485714641 · `4. Release` 41486056746 **đỏ đúng bước Install** (`npm error code EUSAGE`, thiếu `@emnapi/core@1.11.3` + `@emnapi/runtime@1.11.3` trong lock); `3. Browser QA` 41485714640 báo `run success` nhưng job `failure` vì `continue-on-error`. `4. Release` dừng ở bước 5 ⇒ "Create GitHub Release" `skipped`, **chưa có release nào** | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/actions/runs/<id>/jobs` — bảng đầy đủ ở `evidence/2026-11-02-KBT-ISSUE-43/ci-runs.txt`, nguyên nhân + lệnh tái lập ở `ci-install-red.txt` |
| CI sau hai sửa (`1b8dadd` lockfile + `66e0fea` workflow 03) | `1. Quality` 41488045169 **success** (17:07:08→17:07:39) · `2. Build + artifact` 41488045172 **success** (→17:07:27) · `3. Browser QA` 41488045102: Install · Build · Install Chromium success, **bước 7 `QA probe` failure** — probe lần đầu thực chạy trên runner Linux; chưa đọc được dòng lỗi (log API trả `403 Must have admin rights to Repository`) | mở run 41488045102 → job "golden path trên Chromium" → bước 7 (chỉ người giữ repo xem được) |
| **CI trên commit được tag thật `77d90ce` + release đã tạo** | `1. Quality` 41490451023 **success** · `2. Build + artifact` 41490451085 **success** · `3. Browser QA` 41490451074 job failure ở bước 7 `QA probe` (run vẫn báo success vì `continue-on-error`) · **`4. Release` 41490669966 success** cả 9 bước (17:23:23Z→17:24:09Z) ⇒ đối tượng release thật: id `431754261` · tên "Kho Báu Tri Thức v1.1.0" · `draft false` · `prerelease false` · publish `2026-11-02T17:24:04Z` · ghi chú 80 435 byte sinh từ `scripts/release-notes.mjs` · asset `kho-bau-tri-thuc-1.1.0.zip` **1 369 166 byte**, **0 lượt tải**. Cũng trên commit này, `npm ci` + toàn bộ `npm run verify` **xanh trên Ubuntu runner** (bước 5+6 của workflow 04), không chỉ trên Windows | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` · `curl -s …/actions/runs/41490669966/jobs` — toàn bộ ở `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt` |
| **CI trên `afb9eeb` — bản sửa race, nằm SAU tag `v1.1.0`** | `1. Quality` run **41501753263** success (41 s) · `2. Build + artifact` **41501753512** success (33 s) · **`3. Browser QA` 41501753363 success (63 s)** ⇒ lần đầu tiên bước "QA probe" đi qua trên runner Linux sau bốn lần đỏ. Bằng chứng rằng đó là probe xanh chứ không phải `continue-on-error` che: `jobs[].steps[]` của job "golden path trên Chromium" — bước 7 `QA probe` `conclusion: success`, bước 8 chẩn đoán `skipped` — và check-run 125470717595 `conclusion: success`. *Đừng dùng "0 annotation `::error::`" làm bằng chứng:* nó chỉ chứng minh bước chẩn đoán không chạy, và bước đó (bản cũ) **chạy lại probe** nên annotation của một lần đỏ từng ghi "QA PASS" — xem dòng kế tiếp. `4. Release` không chạy lại (chỉ chạy theo tag) | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/commits/afb9eeb9a753949f0be4cfebabd6204f0b2eb6f8/check-runs` · `curl -s …/actions/runs/41501753363/jobs` · nguyên văn payload ở `evidence/2026-11-03-QA-RACE/ci-annotation-race.txt` |
| **CI trên `8e6f9f5` — docs-only, ĐỎ LẠI (probe intermittent)** | `3. Browser QA` run **41504913606** `conclusion: failure` ở cấp job: bước 7 `QA probe` **failure**, bước 8 "Đưa lỗi probe lên annotation" **success** — mà 3 annotation `level=failure` của check-run 125481620651 mang thông điệp trái nhau: hai cái phát từ bước chẩn đoán — `{"errors":[],"lastSteps":[…harnessGuard, persistenceAfterReload, noDuplicateRewards…]}` và `QA PASS — 2…` (bị cắt) — tức nó **chạy lại** probe và kể chuyện của lần thứ hai; cái thứ ba mới là dấu vết thật, `Process completed with exit code 1.`. Run này **không đổi `src/` lẫn `qa/`** (22 file tài liệu) ⇒ đỏ do flaky, không do hồi quy; và đỏ chỉ 20 phút sau lần xanh duy nhất ⇒ "xanh một lần là hết flaky" sai. Bản sửa trong đợt này: bước "QA probe" lưu `tee probe-run.log` và trả `PIPESTATUS[0]`, bước chẩn đoán chỉ chạy mới khi log trống (`[ -s probe-run.log ]`), khoá bằng 1 test hợp đồng trong `tests/t31-bug-hunt-fixes.test.ts`. `continue-on-error: true` **giữ nguyên** | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/check-runs/125481620651/annotations` (body là **mảng trần** ⇒ `jq length`) · payload ở `evidence/2026-11-03-QA-RACE/ci-flake-second-run.txt` |
| Điều kiện No-Go còn mở | **`Đã chạy`: CI trên GitHub** — cả ba cổng chặn merge `1. Quality` / `2. Build + artifact` / `4. Release` **success** trên `77d90ce` (mục trên); `3. Browser QA` **đỏ ở bước `QA probe` trên chính commit được tag** và vẫn không chặn (`continue-on-error: true`, `03-qa-browser.yml:30`). *Cập nhật 2026-11-03:* dòng lỗi **đã đọc được** (annotation public thay cho log `403`) và nguyên nhân đã sửa trên `afb9eeb` ⇒ `3. Browser QA` **xanh lần đầu** (run 41501753363, 63 s) — **rồi đỏ lại trên `8e6f9f5`, commit chỉ sửa docs** (run 41504913606, dòng trên) ⇒ cổng QA **intermittent**. Đợt ba tìm ra nguyên nhân thật ở **app** (đề cổng phụ huynh sinh sau paint) và `3. Browser QA` **xanh trên đúng commit chứa bản sửa** — `2d2ca27`, run 41515106575, 66 s ⇒ cổng đạt **3/9 lượt xanh** (sáu lượt trước đó đều đỏ ở bước "QA probe"; `2d2ca27` và `c9fd2b4` là **hai lượt xanh liên tiếp**, run 41515106575 / 41516820864); `continue-on-error: true` vẫn bật vì chưa đủ lượt tin. Thêm vào đó bản sửa nằm **sau** tag, nên điều kiện No-Go của `v1.1.0` vẫn mở cho tới khi đóng tag lại hoặc lên bản khác. **`NotRun`: chưa có người lớn đọc to ≥1 bài/môn** trên bản phát hành, và **chưa ai giải nén zip** `kho-bau-tri-thuc-1.1.0.zip` trên máy thật (0 lượt tải). Còn 2 ô `NotRun` nữa trong `docs/plan/TEST_CASES.md` §5 (ảnh khoảnh `locked`, kiểm bằng bộ đọc màn hình) | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/actions/runs?per_page=8` + tab Actions |
| Việc của người ký *(ghi trước khi ủy quyền — giữ nguyên làm biên bản)* | (1) mở PR `main` ← `feature/43-game-pause` (link ở `docs/issues/43-game-pause.md` §7), (2) squash-merge khi CI xanh, (3) tag **đúng HEAD của `main`** | `git fetch && git checkout main && git pull && git log -1 --format=%H && git tag -a v1.1.0 -m "Kho Báu Tri Thức — Lớp 1, bản 1.1.0 (KBT-ISSUE-43)" && git push origin v1.1.0` |
| Hai bước (2)(3) đã làm thay ai, và bằng chứng nào gánh | Người dùng ra "tự động chọn khi tôi không ở đây" ⇒ agent merge `--no-ff` vào `main` (`7365830`), sửa flake làm cổng đỏ trên HEAD merge (`7d92246`), tag lần đầu ở đó, rồi **xoá tag và tag lại** trên `77d90ce` sau khi hai sửa CI (`1b8dadd`, `66e0fea`) làm `4. Release` xanh. **Không đổi quyền ký:** §3 vẫn ghi người giữ repo là duy nhất ký Go/No-Go, mục "Biên mẫu (chưa ký lần nào)" vẫn trống. Release này là **phát hành kỹ thuật**: cổng máy xanh + `1`/`2` (hai job chặn merge) xanh + `4` (phát hành) xanh, phần nghiệm thu người dùng vẫn mở | `git tag \| wc -l` = **1** · `git for-each-ref refs/tags/v1.1.0 --format='%(objectname) %(*objectname)'` ⇒ `4f75f5d` / `77d90ce` · `git ls-remote --tags origin` |

## 4. Expand / Contract — đã có, đo được

Không có DB server, nhưng có **schema `localStorage`** — đường hỏng thật là người dùng mở bản mới
trên hồ sơ của bản cũ. Mô hình đang dùng (`storage.ts:105` `STORAGE_SCHEMA_VERSION = 'P43-v1'`):

| Bước | Cơ chế | Tính hoàn tác |
|---|---|---|
| Expand | thêm field mới với mặc định do sanitizer dựng; **không** đổi nghĩa field cũ | có — field lạ bị bỏ, field cũ giữ |
| Migrate | `MIGRATIONS` chain theo thứ tự, mỗi hàm *pure, defensive, idempotent* (`storage.ts:112`) | chạy lại không hỏng |
| Contract | chỉ bỏ field sau khi mọi bản đang chạy đều không đọc nó | **chưa có lịch contract** — nợ, xem `CHECKLIST.md` C-06 |

Test: `tests/t14c-storage.test.ts`, `tests/t41c-idempotency.test.ts:299` (field mới phải sống qua
một lần đọc lại — tức là phải có trong whitelist).

## 5. Restore drill — bản thay thế cho app không server

Khóa học đòi "restore drill kiểm cả quyền A và B". Ở đây tương đương là **khôi phục tiến độ của bé
từ file export**, và **quyền ba mẹ chặn đường ghi**:

| Kịch bản | Cách diễn | Đã chạy chưa |
|---|---|---|
| R-1 mất hồ sơ | xuất JSON (`FR-P04`) ⇒ xoá `localStorage` ⇒ nhập lại (`FR-P05`) | **Chưa chạy trên build thật** — mới có test mock: `tests/parent-and-demo.test.ts` (`NotRun`) |
| R-2 file rác | import file không đúng cấu trúc ⇒ bị từ chối, store hiện có không đổi | Có test trong `tests/parent-and-demo.test.ts` |
| R-3 quota đầy | `setItem` ném ⇒ không có streak giả, không tiêu khiên, không ghi biên lai non | Có — TC-08/09/10/15 + ablation M1/M2 |
| R-4 quyền ba mẹ | tắt quỹ thưởng ⇒ build thật không cộng Sao | Có — `qa/parent-controls.mjs`, TC-27 |
| R-5 quyền "tài khoản B" | — | **Không tồn tại** ở kiến trúc hiện hành (một hồ sơ, không có server) ⇒ chỉ kiểm được sau T41D |

Điều kiện để R-1 chuyển `Pass`: chạy tay trên `npm run build && npm run preview`, lưu ảnh trước/sau,
thả vào `evidence/<ngày>-restore-drill/`.

## 6. SLI / SLO — ngưỡng lấy từ NFR

App local-first **không có** server để đo latency/error rate (ADR-01 + `SAFETY_PRIVACY.md`).
Nên SLI chỉ đo được ở hai nơi: lúc build và lúc chạy probe.

| SLI | Định nghĩa | Ngưỡng (nguồn NFR) | Đo ở đâu | Trạng thái 2026-11-02 |
|---|---|---|---|---|
| Khối lượng tải tiên phong | tổng byte asset mà `dist/index.html` tham chiếu tĩnh | ≤ 600 kB cứng, ≤ 450 kB mục tiêu (NFR-P01) | `npm run check:budget` | 418.6 kB — **đạt** |
| Đường vào học được | `qa/golden-path.mjs` số console error | = 0 (BRD §8) | workflow 03 | 0 lỗi / 28 bước — **đạt** |
| Hồi quy hành vi | `npm run verify` | EXIT=0 (AGENTS.md §1.1) | mỗi push | 1240/1240 — **đạt** |
| Thời gian một phiên học | phút bé hoạt động thật | 15–20 phút (NFR-M01) | **không đo được** — không telemetry | `NotRun` |
| Tiến độ không sai | số lượt ghi trùng mỗi ngày | = 0 (NFR-R04) | chỉ đo được ở máy bé ⇒ test + probe thay thế | đạt ở máy chủ dev |

Guardrail khi tối ưu: giảm kB **không** được làm đỏ `qa/golden-path.mjs` hay `qa/focus.mjs`.

## 7. Incident — diễn tập, không chờ cháy

| Vai trong một sự cố | Ai | Việc |
|---|---|---|
| Người chỉ huy | người giữ repo | quyết rollback/patch, giữ quyền No-Go |
| Người chẩn đoán | agent | chạy lại lệnh, dán `errors[]` + `failedAt`, không suy đoán |
| Người liên lạc | người giữ repo | nói với phụ huynh qua kênh ngoài repo |
| Người ghi postmortem | agent viết, người duyệt | blameless, action item có owner + hạn |

Kịch bản đã diễn tập một phần: **hồi quy offline do `Vary: Origin`** (task #19 trong lịch sử repo) —
phát hiện bằng probe, sửa bằng precache manifest, đóng bằng test. Timeline/postmortem đầy đủ:
`docs/AUDIT_REPORT.md` (nhật sử nối theo phiên).

## 8. Runbook — 4 thành phần, đã chạy lại trên môi trường sạch

**RB-1 · Cổng đỏ sau khi merge**
1. *Trigger:* `npm run verify` EXIT≠0.
2. *Chẩn đoán:* chạy từng phần — `npm run typecheck` → `npm run test:ci` → `npm run build` → `npm run check:budget`; nếu đỏ ở test, chạy cô lập `npx vitest run tests/<file>` để phân biệt test O(n²) vượt timeout trong full suite với lỗi thật (`TEST_PLAN.md` §5).
3. *Hành động:* sửa hoặc revert; **không** tắt gate, **không** `--no-verify`.
4. *Xác minh:* `npm run verify` xanh nguyên văn + dán output; nếu đổi UI thì thêm ảnh vào `evidence/`.

**RB-2 · Bé mất tiến độ sau khi mở bản mới**
1. *Trigger:* phụ huynh báo mất sao/mất chuỗi.
2. *Chẩn đoán:* mở DevTools → Application → `kho_bau_child_profile`, so `schemaVersion` với `STORAGE_SCHEMA_VERSION`.
3. *Hành động:* import file export gần nhất (FR-P05); nếu file import bị từ chối, kiểm tra validator trong `tests/parent-and-demo.test.ts`.
4. *Xác minh:* screenshot dashboard trước/sau, ghi vào `evidence/`.

**RB-3 · Probe đỏ mà code không đổi**
1. *Trigger:* workflow 03 đỏ, local xanh.
2. *Chẩn đoán:* chạy lại **một** lần (timing); vẫn đỏ ⇒ dán `errors[]` + `failedAt`.
3. *Hành động:* nếu probe khớp chuỗi UI đã đổi tên ⇒ sửa probe theo `qa/games.mjs`/testid, không sửa UI để chiều probe.
4. *Xác minh:* `node qa/run-one.mjs qa/<probe>.mjs` exit 0.

**RB-4 · Cần rollback**
1. *Trigger:* No-Go sau khi tag, hoặc lỗi P0 trên bản đã phát hành.
2. *Chẩn đoán:* xác định commit/tag trước đó còn tốt (`git log --oneline`, tag gần nhất).
3. *Hành động:* revert commit hoặc publish lại tag cũ — **không** force-push `main`.
4. *Xác minh:* `npm run verify` trên commit rollback + `qa/golden-path.mjs` 0 lỗi.

## 9. Release note — nhãn AI bắt buộc

Mỗi mục trong `CHANGELOG.md` khi chuyển sang một version phải mang nhãn nguồn, vì người đọc là phụ
huynh chứ không phải reviewer:

```
## [1.1.0] - <ngày>
### Fixed
- storage: chặn ghi trùng cho bằng liệu, buổi đọc, bước ngày và biên lai thưởng (T41C)
  [AI nháp · người duyệt · verify EXIT=0 @ d54f341]
```

Nhãn dùng được: `[AI làm, dev kiểm]` · `[AI nháp · người duyệt]` · `[người viết]`.
Không có nhãn `[AI tự làm]` cho thay đổi khó hoàn tác — theo `02_AI_USAGE_CHARTER.md` §1.
