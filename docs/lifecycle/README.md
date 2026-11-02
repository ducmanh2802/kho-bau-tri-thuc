# Lifecycle — một trang, toàn vòng đời
## Bảng bằng chứng (Evidence Board) · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Rule của bảng:** mỗi ô là **link tới artifact có thật** hoặc **số đo kèm lệnh**. Ô chưa có bằng
chứng thì để trống và ghi lý do ngay dưới bảng — không tô hồng, không viết "đang làm".

---

## 1. Tám artifact của vòng đời

| # | Artifact | Pha | Trạng thái | Bằng chứng / số đo |
|---|---|---|---|---|
| 01 | [Lifecycle Board](01_LIFECYCLE_BOARD.md) | cả 6 | Đủ, 1 pha `NotRun` | 6 pha × 5 lớp; ô Release trống vì `git tag` = 0 |
| 02 | [AI Usage Charter](02_AI_USAGE_CHARTER.md) | governance | Đạt | Rule of Two 4 lớp; 3 hook + 4 workflow + 1272 test |
| 03 | [Requirements Chain](03_REQUIREMENTS_CHAIN.md) | Requirements | Đạt cho lát cắt | 88 FR · 6 US · 42 TC · 0 test mồ côi (`RTM.md` §7) |
| 04 | [Design Blueprint](04_DESIGN_BLUEPRINT.md) | Design | Đạt, 1 lỗ hổng | 18 ADR · 6 driver có số đo · STRIDE 6 mục · lethal trifecta đã cắt 2/3 điều kiện |
| 05 | [Implementation Loop](05_IMPLEMENTATION_LOOP.md) | Implementation | Đạt | Guarded loop 6 bước có ví dụ thật T41C; merge gate 5 điều kiện, G-5 đang hở |
| 06 | [Verification & Validation](06_VERIFICATION_VALIDATION.md) | Verification | Đạt cho lát cắt | 42/42 TC Pass · 5 phép ablation · verdict 4 giá trị |
| 07 | [Release & Operations](07_RELEASE_OPERATIONS.md) | Release | **`NotRun`** | quy trình + workflow 04 đã có; chưa tag, chưa go/no-go, chưa restore drill R-1 |
| 08 | [Maintenance & Evolution](08_MAINTENANCE_EVOLUTION.md) | Maintenance | Đạt một phần | 4 characterization-style test · impact analysis 6 chiều có ví dụ · 6 nợ có owner + hạn |

Phụ lục: [`CHECKLIST.md`](CHECKLIST.md) · [`HARNESS.md`](HARNESS.md) ·
[`09_ADOPTION_ROADMAP.md`](09_ADOPTION_ROADMAP.md) · [`../prompts/`](../prompts/) ·
[`../../evidence/`](../../evidence/README.md)

## 2. Số đo hiện trạng (đo 2026-11-02, sau T41C @ `d54f341`)

| Hạng | Số | Lệnh |
|---|---|---|
| Cổng chất lượng | `npm run verify` EXIT=0 | `evidence/2026-11-02-KBT-ISSUE-43/verify.txt` (lần đo gần nhất) · `evidence/2026-11-02-T41C/verify.txt` |
| Test file / test | 88 / 1272 · suite 21.55 s | `npx vitest run` |
| Probe QA | 30 (29 `.mjs` + 1 `.cjs`) | `ls qa/*.mjs qa/*.cjs` trừ `lib.mjs`, `run-one.mjs` |
| Entry chunk | **204.2 kB** `index-qnZ3EVTS.js` | `npm run check:budget` |
| Boot graph | **418.5 kB** | `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html \| sort -u` + `stat -c%s` |
| Trần | entry 600 kB cứng / 450 kB mục tiêu | `src/config/policy.ts` + `scripts/check-bundle-budget.mjs` |
| Trò chơi đăng ký đủ 4 nơi | 31 = 31 = 31 = 31 | `tests/t23-mcp-servers.test.ts` |
| Dependency runtime | 8 | `package.json → dependencies` |
| Artifact vòng đời | 12 file (`01`…`09` + `README.md` + `CHECKLIST.md` + `HARNESS.md`) | `ls docs/lifecycle/*.md \| wc -l` |
| Tag release | **0** | `git tag \| wc -l` |

## 3. Ô trống — và lý do

| Ô | Trạng thái | Lý do / điều kiện để đầy |
|---|---|---|
| Go/No-Go đã ký | `NotRun` | chưa có phiên ký nào; người giữ repo ký, AI không ký (`07` §3) |
| RC tag `vX.Y.Z` | `NotRun` | cần quyết định phát hành từ người dùng — **không tự tag** |
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
