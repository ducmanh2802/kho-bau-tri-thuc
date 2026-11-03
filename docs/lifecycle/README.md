# Lifecycle — một trang, toàn vòng đời
## Bảng bằng chứng (Evidence Board) · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Rule của bảng:** mỗi ô là **link tới artifact có thật** hoặc **số đo kèm lệnh**. Ô chưa có bằng
chứng thì để trống và ghi lý do ngay dưới bảng — không tô hồng, không viết "đang làm".

---

## 1. Tám artifact của vòng đời

| # | Artifact | Pha | Trạng thái | Bằng chứng / số đo |
|---|---|---|---|---|
| 01 | [Lifecycle Board](01_LIFECYCLE_BOARD.md) | cả 6 | Đủ, 1 pha **Pass một phần** | 6 pha × 5 lớp; ô Release đã có số đo (`git tag` = 1) nhưng còn 3 điều kiện mở, xem `01` §Pha 5 |
| 02 | [AI Usage Charter](02_AI_USAGE_CHARTER.md) | governance | Đạt | Rule of Two 4 lớp; 3 hook + 4 workflow + 1441 test |
| 03 | [Requirements Chain](03_REQUIREMENTS_CHAIN.md) | Requirements | Đạt cho lát cắt | 88 FR · 6 US · 42 TC · 0 test mồ côi (`RTM.md` §7) |
| 04 | [Design Blueprint](04_DESIGN_BLUEPRINT.md) | Design | Đạt, 1 lỗ hổng | 18 ADR · 6 driver có số đo · STRIDE 6 mục · lethal trifecta đã cắt 2/3 điều kiện |
| 05 | [Implementation Loop](05_IMPLEMENTATION_LOOP.md) | Implementation | Đạt | Guarded loop 6 bước có ví dụ thật T41C; merge gate 5 điều kiện, G-5 đang hở |
| 06 | [Verification & Validation](06_VERIFICATION_VALIDATION.md) | Verification | Đạt cho lát cắt | 42/42 TC Pass · 6 phép ablation M1…M6 + 1 ablation T43 (`evidence/2026-11-03-T43/ablation-t43a-reset-sweep-RED.txt`) · verdict 4 giá trị |
| 07 | [Release & Operations](07_RELEASE_OPERATIONS.md) | Release | **`Đã phát hành` một phần** | tag `v1.1.0` ở `origin` (`git tag \| wc -l` = 1), `CHANGELOG [1.1.0]`, `package.json` 1.1.0, cổng máy xanh trên HEAD được tag, `1. Quality` + `2. Build + artifact` success trên runner; **còn mở**: chữ ký go/no-go trống, `3. Browser QA` đỏ trên chính commit được tag (bản sửa ở `afb9eeb`, sau tag), chưa restore drill R-1 |
| 08 | [Maintenance & Evolution](08_MAINTENANCE_EVOLUTION.md) | Maintenance | Đạt một phần | 4 characterization-style test · impact analysis 6 chiều có ví dụ · 6 nợ có owner + hạn |
| 10 | [Ánh xạ `step-by-step-guidance.md`](10_SDLC_GUIDE_MAP.md) | governance | Đạt (chờ người duyệt 3 quyết định tailoring) | 11 pha → file thật của repo; **8/11** pha đã có sản phẩm, **3** pha (1/10/11) vừa được bổ sung hồ sơ; kit mà guide dẫn chiếu **không tồn tại** trong repo ⇒ chỉ dùng làm lớp ánh xạ |

Phụ lục: [`CHECKLIST.md`](CHECKLIST.md) · [`HARNESS.md`](HARNESS.md) ·
[`09_ADOPTION_ROADMAP.md`](09_ADOPTION_ROADMAP.md) · [`../prompts/`](../prompts/) ·
[`../../evidence/`](../../evidence/README.md) ·
hồ sơ pha mới: [`../01-intake/`](../01-intake/) (4 file) ·
[`../plan/RISK_REGISTER.md`](../plan/RISK_REGISTER.md) (11 RISK · 1 DEF · 7 OQ · 4 ASM) ·
[`../10-operations/`](../10-operations/) (2 file) ·
[`../11-decommissioning/`](../11-decommissioning/) (1 file)

## 2. Số đo hiện trạng (đo 2026-11-03 **lần chín**, nội dung = HEAD `main` `8d73ff1` cộng **T45** — năm defect (máy gắp bỏ qua `maxGachaPerDay`, "Tắt phần thưởng" bị thi đấu + thành tựu đi vòng, bé tự nới 10 phút không qua cổng, phím vẫn nộp đáp án khi lớp phủ che bảng, Thử Thách Tuần trùng id) + 5 file test `tests/t45a…t45e`; `npm run verify` trên working tree: EXIT=0 · **1441 test** · `Duration 25.82s` · 110 file · `index-C5J1ceAM.js` 211.2 kB (`evidence/2026-11-03-T45/verify.txt`); đợt tám cùng ngày là **T44** (năm lát cắt, 5 file test; số của lượt đó ở `evidence/2026-11-03-T44/verify.txt`); đợt bảy là **T43** (một sửa lỗi `resetProgress`, 1 file test; số của lượt đó ở `evidence/2026-11-03-T43/verify.txt`); đợt sáu là **T42** (tám sửa lỗi, 7 file test; số của lượt đó ở `evidence/2026-11-03-T42/verify.txt`); đợt năm là `1cac775` + **T41D** (1327 test · 22.32 s); đợt bốn là commit `3b0122c` (1287 test · 22.15 s); trước đó là đợt 2026-11-02 trên HEAD sau merge release `7365830` + bản sửa flake theo giờ)

| Hạng | Số | Lệnh |
|---|---|---|
| Cổng chất lượng | `npm run verify` EXIT=0 | `evidence/2026-11-03-T45/verify.txt` (lần đo gần nhất, 2026-11-03 **lần chín**) · `evidence/2026-11-03-T44/verify.txt` · `evidence/2026-11-03-T43/verify.txt` · `evidence/2026-11-03-T42/verify.txt` · `evidence/2026-11-03-T41D/verify-t41d.txt` · `evidence/2026-11-03-QA-RACE/verify-1287.txt` · `verify-1286.txt` · `verify-1281.txt` · `verify-1280.txt` · `evidence/2026-11-02-KBT-ISSUE-43/verify-main-1278.txt` · `verify-rc.txt` · `verify.txt` · `evidence/2026-11-02-T41C/verify.txt` |
| Test file / test | 113 / 1460 · suite 24.58 s (đo 2026-11-04 sau T46; đo 2026-11-03 lần chín: 1441 / 25.82 s ở T45, các lần đo trước cùng ngày: 1410 / 25.78 s ở T44, 1377 / 28.57 s ở T43, 1372 / 24.14 s ở T42, 1327 / 22.32 s ở T41D, 1287 / 22.15 s trên commit `3b0122c`, 1286 / 22.18 s, 1281 / 22.58 s và 1280 / 21.88 s, ngày 2026-11-02 là 1278 / 23.64 s) | `npx vitest run` |
| Probe QA | 30 (29 `.mjs` + 1 `.cjs`) | `ls qa/*.mjs qa/*.cjs` trừ `lib.mjs`, `run-one.mjs` |
| Entry chunk | **211.2 kB** `index-CprqGUdJ.js` | `npm run check:budget` |
| Boot graph | **425.5 kB** | `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html \| sed 's#^#dist/#' \| sort -u \| xargs wc -c \| tail -1` ⇒ `435718 total` (÷ 1024 = 425.5 KiB) |
| Trần | entry 600 kB cứng / 450 kB mục tiêu | `src/config/policy.ts` + `scripts/check-bundle-budget.mjs` |
| Trò chơi đăng ký đủ 4 nơi | 31 = 31 = 31 = 31 | `tests/t23-mcp-servers.test.ts` |
| Dependency runtime | 8 | `package.json → dependencies` |
| Artifact vòng đời | 13 file trong `docs/lifecycle/` (`01`…`10` + `README.md` + `CHECKLIST.md` + `HARNESS.md`) + 7 file hồ sơ pha (`docs/01-intake/` 4, `docs/10-operations/` 2, `docs/11-decommissioning/` 1) + `docs/plan/RISK_REGISTER.md` | `ls docs/lifecycle/*.md \| wc -l` · `ls docs/01-intake/*.md docs/10-operations/*.md docs/11-decommissioning/*.md \| wc -l` |
| Tag release | **1** (`v1.1.0` → tag object `4f75f5d` đóng trên `77d90ce`) | `git tag \| wc -l` · `git ls-remote --tags origin` |

## 3. Ô trống — và lý do

| Ô | Trạng thái | Lý do / điều kiện để đầy |
|---|---|---|
| Go/No-Go đã ký | `NotRun` | chưa có phiên ký nào; người giữ repo ký, AI không ký (`07` §3) |
| RC tag `vX.Y.Z` | **Đã tag** | `v1.1.0` = tag object `4f75f5d` đóng trên HEAD `main` `77d90ce` mà cổng máy xanh tại đó; người dùng ra "tự động chọn khi tôi không ở đây" nên agent thao tác merge + tag + push. Tag đầu ở `7d92246` đã **xoá và tạo lại** vì CI của nó đỏ ở Install (`07` §3.4). **Không** đồng nghĩa đã nghiệm thu: chữ ký Go/No-Go vẫn trống (hàng trên) và `3. Browser QA` đỏ ở bước `QA probe` trên runner Linux (`07` §3.4) |
| CI trên máy chủ | `1` + `2` + `4` **xanh** trên commit được tag; `3` **xanh lần đầu trên `afb9eeb` rồi đỏ lại trên `8e6f9f5` (docs-only) ⇒ intermittent**, cả hai đều sau tag | đo qua API công khai trên commit được tag `77d90ce`: `1. Quality` 41490451023 · `2. Build + artifact` 41490451085 · **`4. Release` 41490669966 success** (9/9 bước) ⇒ release thật id `431754261`, asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte, **0 lượt tải**; `3. Browser QA` 41490451074 job failure ở bước "QA probe" (`continue-on-error`) và **tái lập** — lần trước trên `66e0fea` (41488045102) cũng đỏ đúng bước đó. Lần tag đầu (`7d92246`) đỏ ở Install vì lockfile lệch semantics npm 10 — đã sửa ở `1b8dadd`. Bảng: `evidence/2026-11-02-KBT-ISSUE-43/ci-runs.txt` + `ci-release-green.txt`. **Cập nhật đợt bốn:** nguyên nhân đỏ thật là lỗi app (đề cổng phụ huynh vẽ sau khung hình đầu), đã sửa; `3. Browser QA` **xanh chín lượt liên tiếp** và tổng **10/16 lượt xanh** (tính tới `caff32a`; 6 đỏ) — `continue-on-error` **đã bị xoá** ở `3b0122c`, và **sáu lượt CI không còn lưới đều xanh** (run 41523226603 `3b0122c` 69 s · run 41526285381 `6e30794` 72 s (job 125554732285, bước 7 "QA probe" `success`, bước 8 `skipped`) · run 41527657645 `e961815` 57 s · run 41537247288 `06b8962` 62 s — **lượt đầu tiên không lưới trên commit đổi `src/`** · run 41538711482 `1deb859` 54 s (docs-only, §15) · run 41632118172 `caff32a` 76 s (T42, job 125904033974, bước 7 `success`, bước 8 `skipped`, §16 của `evidence/2026-11-03-QA-RACE/ci-gate-race.txt`)) ⇒ dòng "intermittent" ở trên **không còn là hiện trạng**, chỉ còn đúng cho các commit trước bản sửa. **Cập nhật kiểm kê 2026-11-03 (đợt T43):** bỏ cách đếm cộng dần, đo **toàn bộ** run `head_branch=main` của workflow `03` kể từ `66e0fea` bằng `jobs[].conclusion` ⇒ **18/28 lượt xanh, 9 đỏ, 1 `cancelled`** (đo lại 2026-11-04, §20 + `ci-census-main-wf03-round2.txt`); chuỗi xanh **tới tip `e171e6e`** = **bốn lượt liên tiếp** (`fc861f3`→`e171e6e`), **mười lăm lượt cuối không còn cờ** (`3b0122c`→`e171e6e`) = **14 xanh + 1 `cancelled`, 0 đỏ**, **ba** trong số đó trên commit đổi `src/` (`06b8962` 4 file · `caff32a` 10 · `3eb7d12` 1). Kiểm kê phát hiện cách đếm cũ bỏ sót ba lượt đỏ (`bd3f2a7`, `08eacc7`, `37fd35e`) và một lượt xanh (`1cac775`) — lệnh + output: `evidence/2026-11-03-QA-RACE/ci-census-main-wf03.txt`, luận bàn §17–§18 `ci-gate-race.txt` |
| GitHub Release thật | **Đã tạo** | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` ⇒ `draft false`, published 2026-11-02T17:24:04Z, ghi chú 80 435 byte sinh từ `scripts/release-notes.mjs`. **Chưa**: ai giải nén zip trên máy thật, và chữ ký Go/No-Go ở hàng đầu tiên của bảng này vẫn trống |
| Restore drill R-1 trên build thật | `NotRun` | cần chạy tay import/export trên `dist/` + ảnh trước/sau (`07` §5) |
| UAT với phụ huynh thật | `NotRun` | cần người dùng thật đồng ý; không có telemetry (ADR-01) |
| BG-01 "bé tự học 15–20 phút/ngày" | không đo được | local-first ⇒ không có aggregate; đây là đánh đổi đã ghi ở ADR-01, không phải lỗi code |
| TC cho các FR ngoài hai lát cắt | `NotRun` | cần phiên viết US cấp chức năng; lộ trình ở `09_ADOPTION_ROADMAP.md` 60 ngày. Không ghi con số "còn N FR": tổng FR tài liệu khai ("88") lệch số dòng FR thật trong `SRS.md` (89) — `RTM.md` §9 rule 5 |
| Mutation testing tự động | `NotRun` | thêm Stryker là thêm dependency ⇒ phải hỏi trước (`AGENTS.md` §1.4); hiện dùng ablation thủ công (6 phép, M1…M6) |

## 4. Đọc tiếp

- Muốn biết **cách làm việc**: [`../SDLC.md`](../SDLC.md) (nguồn chân lý quy trình).
- Muốn biết **ai được làm gì với AI**: [`02_AI_USAGE_CHARTER.md`](02_AI_USAGE_CHARTER.md).
- Muốn **chạy lại bằng chứng**: [`../../evidence/README.md`](../../evidence/README.md) §3.
- Muốn **giao việc lại cho agent**: [`../prompts/`](../prompts/).
