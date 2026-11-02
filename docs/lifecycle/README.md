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
| 02 | [AI Usage Charter](02_AI_USAGE_CHARTER.md) | governance | Đạt | Rule of Two 4 lớp; 3 hook + 4 workflow + 1287 test |
| 03 | [Requirements Chain](03_REQUIREMENTS_CHAIN.md) | Requirements | Đạt cho lát cắt | 88 FR · 6 US · 42 TC · 0 test mồ côi (`RTM.md` §7) |
| 04 | [Design Blueprint](04_DESIGN_BLUEPRINT.md) | Design | Đạt, 1 lỗ hổng | 18 ADR · 6 driver có số đo · STRIDE 6 mục · lethal trifecta đã cắt 2/3 điều kiện |
| 05 | [Implementation Loop](05_IMPLEMENTATION_LOOP.md) | Implementation | Đạt | Guarded loop 6 bước có ví dụ thật T41C; merge gate 5 điều kiện, G-5 đang hở |
| 06 | [Verification & Validation](06_VERIFICATION_VALIDATION.md) | Verification | Đạt cho lát cắt | 42/42 TC Pass · 5 phép ablation · verdict 4 giá trị |
| 07 | [Release & Operations](07_RELEASE_OPERATIONS.md) | Release | **`Đã phát hành` một phần** | tag `v1.1.0` ở `origin` (`git tag \| wc -l` = 1), `CHANGELOG [1.1.0]`, `package.json` 1.1.0, cổng máy xanh trên HEAD được tag, `1. Quality` + `2. Build + artifact` success trên runner; **còn mở**: chữ ký go/no-go trống, `3. Browser QA` đỏ trên chính commit được tag (bản sửa ở `afb9eeb`, sau tag), chưa restore drill R-1 |
| 08 | [Maintenance & Evolution](08_MAINTENANCE_EVOLUTION.md) | Maintenance | Đạt một phần | 4 characterization-style test · impact analysis 6 chiều có ví dụ · 6 nợ có owner + hạn |

Phụ lục: [`CHECKLIST.md`](CHECKLIST.md) · [`HARNESS.md`](HARNESS.md) ·
[`09_ADOPTION_ROADMAP.md`](09_ADOPTION_ROADMAP.md) · [`../prompts/`](../prompts/) ·
[`../../evidence/`](../../evidence/README.md)

## 2. Số đo hiện trạng (đo 2026-11-03 đợt bốn, trên working tree = HEAD `main` `eb4b7b2` + bản bỏ cờ `continue-on-error` của job QA; trước đó là đợt 2026-11-02 trên HEAD sau merge release `7365830` + bản sửa flake theo giờ)

| Hạng | Số | Lệnh |
|---|---|---|
| Cổng chất lượng | `npm run verify` EXIT=0 | `evidence/2026-11-03-QA-RACE/verify-1287.txt` (lần đo gần nhất, 2026-11-03 đợt bốn) · `verify-1286.txt` · `verify-1281.txt` · `verify-1280.txt` · `evidence/2026-11-02-KBT-ISSUE-43/verify-main-1278.txt` · `verify-rc.txt` · `verify.txt` · `evidence/2026-11-02-T41C/verify.txt` |
| Test file / test | 90 / 1287 · suite 22.09 s (đo 2026-11-03 đợt bốn; trước đó cùng ngày 1286 / 22.18 s, 1281 / 22.58 s và 1280 / 21.88 s, ngày 2026-11-02 là 1278 / 23.64 s) | `npx vitest run` |
| Probe QA | 30 (29 `.mjs` + 1 `.cjs`) | `ls qa/*.mjs qa/*.cjs` trừ `lib.mjs`, `run-one.mjs` |
| Entry chunk | **204.2 kB** `index-TgwkX59u.js` | `npm run check:budget` |
| Boot graph | **418.6 kB** | `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html \| sed 's#^#dist/#' \| sort -u \| xargs wc -c \| tail -1` ⇒ `428624 total` (÷ 1024 = 418.6 KiB) |
| Trần | entry 600 kB cứng / 450 kB mục tiêu | `src/config/policy.ts` + `scripts/check-bundle-budget.mjs` |
| Trò chơi đăng ký đủ 4 nơi | 31 = 31 = 31 = 31 | `tests/t23-mcp-servers.test.ts` |
| Dependency runtime | 8 | `package.json → dependencies` |
| Artifact vòng đời | 12 file (`01`…`09` + `README.md` + `CHECKLIST.md` + `HARNESS.md`) | `ls docs/lifecycle/*.md \| wc -l` |
| Tag release | **1** (`v1.1.0` → tag object `4f75f5d` đóng trên `77d90ce`) | `git tag \| wc -l` · `git ls-remote --tags origin` |

## 3. Ô trống — và lý do

| Ô | Trạng thái | Lý do / điều kiện để đầy |
|---|---|---|
| Go/No-Go đã ký | `NotRun` | chưa có phiên ký nào; người giữ repo ký, AI không ký (`07` §3) |
| RC tag `vX.Y.Z` | **Đã tag** | `v1.1.0` = tag object `4f75f5d` đóng trên HEAD `main` `77d90ce` mà cổng máy xanh tại đó; người dùng ra "tự động chọn khi tôi không ở đây" nên agent thao tác merge + tag + push. Tag đầu ở `7d92246` đã **xoá và tạo lại** vì CI của nó đỏ ở Install (`07` §3.4). **Không** đồng nghĩa đã nghiệm thu: chữ ký Go/No-Go vẫn trống (hàng trên) và `3. Browser QA` đỏ ở bước `QA probe` trên runner Linux (`07` §3.4) |
| CI trên máy chủ | `1` + `2` + `4` **xanh** trên commit được tag; `3` **xanh lần đầu trên `afb9eeb` rồi đỏ lại trên `8e6f9f5` (docs-only) ⇒ intermittent**, cả hai đều sau tag | đo qua API công khai trên commit được tag `77d90ce`: `1. Quality` 41490451023 · `2. Build + artifact` 41490451085 · **`4. Release` 41490669966 success** (9/9 bước) ⇒ release thật id `431754261`, asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte, **0 lượt tải**; `3. Browser QA` 41490451074 job failure ở bước "QA probe" (`continue-on-error`) và **tái lập** — lần trước trên `66e0fea` (41488045102) cũng đỏ đúng bước đó. Lần tag đầu (`7d92246`) đỏ ở Install vì lockfile lệch semantics npm 10 — đã sửa ở `1b8dadd`. Bảng: `evidence/2026-11-02-KBT-ISSUE-43/ci-runs.txt` + `ci-release-green.txt` |
| GitHub Release thật | **Đã tạo** | `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` ⇒ `draft false`, published 2026-11-02T17:24:04Z, ghi chú 80 435 byte sinh từ `scripts/release-notes.mjs`. **Chưa**: ai giải nén zip trên máy thật, và chữ ký Go/No-Go ở hàng đầu tiên của bảng này vẫn trống |
| Restore drill R-1 trên build thật | `NotRun` | cần chạy tay import/export trên `dist/` + ảnh trước/sau (`07` §5) |
| UAT với phụ huynh thật | `NotRun` | cần người dùng thật đồng ý; không có telemetry (ADR-01) |
| BG-01 "bé tự học 15–20 phút/ngày" | không đo được | local-first ⇒ không có aggregate; đây là đánh đổi đã ghi ở ADR-01, không phải lỗi code |
| TC cho các FR ngoài hai lát cắt | `NotRun` | cần phiên viết US cấp chức năng; lộ trình ở `09_ADOPTION_ROADMAP.md` 60 ngày. Không ghi con số "còn N FR": tổng FR tài liệu khai ("88") lệch số dòng FR thật trong `SRS.md` (89) — `RTM.md` §9 rule 5 |
| Mutation testing tự động | `NotRun` | thêm Stryker là thêm dependency ⇒ phải hỏi trước (`AGENTS.md` §1.4); hiện dùng ablation thủ công (5 phép, M1…M5) |

## 4. Đọc tiếp

- Muốn biết **cách làm việc**: [`../SDLC.md`](../SDLC.md) (nguồn chân lý quy trình).
- Muốn biết **ai được làm gì với AI**: [`02_AI_USAGE_CHARTER.md`](02_AI_USAGE_CHARTER.md).
- Muốn **chạy lại bằng chứng**: [`../../evidence/README.md`](../../evidence/README.md) §3.
- Muốn **giao việc lại cho agent**: [`../prompts/`](../prompts/).
