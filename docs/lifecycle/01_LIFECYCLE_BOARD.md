# 01 — Lifecycle Board
## 6 pha × 5 lớp · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit tham chiếu: `d54f341`
**Cách kiểm:** mỗi ô phải trỏ tới một artifact có thật trong repo hoặc một lệnh đã chạy. Ô nào chưa có
thì để trống và ghi lý do — không viết "sẽ làm".

---

## 1. Bảng

### Pha 1 — Requirements (Yêu cầu)

| Lớp | Nội dung | Artifact / lệnh |
|---|---|---|
| Deliverable | BRD (6 mục tiêu nghiệp vụ + 8 rủi ro), SRS (88 FR · 25 NFR · 19 DC), RTM hai chiều | [`../specs/BRD.md`](../specs/BRD.md) · [`../specs/SRS.md`](../specs/SRS.md) · [`../specs/RTM.md`](../specs/RTM.md) |
| Quality gate | Không FR nào được ghi mà không trỏ được tới file; RTM §7 đếm **0 test mồ côi** | `grep -c "^\| FR-" docs/specs/SRS.md` = 88 · RTM §7 |
| AI Level | **Mức 2** — AI viết nháp toàn bộ đặc tả, người giữ repo duyệt và cắt yêu cầu | nhật sử: `docs/plan/TASK_PLAN.md` §II |
| RACI | R: agent viết spec · A: người giữ repo · C: giáo viên lớp 1 (nguồn dữ liệu nội dung) · I: phụ huynh thử | `BRD.md` §1 |
| Metrics | FR có bằng chứng tự động 82/88 · NFR đạt 24/25 · 1 yêu cầu không đo được (BG-01) | RTM §8 (đo 2026-11-02) |

### Pha 2 — Design (Thiết kế)

| Lớp | Nội dung | Artifact / lệnh |
|---|---|---|
| Deliverable | SAD 18 ADR, kiểm kê kiến trúc, ERD key `localStorage`, deployment topology | [`../specs/ARCHITECTURE.md`](../specs/ARCHITECTURE.md) · [`04_DESIGN_BLUEPRINT.md`](04_DESIGN_BLUEPRINT.md) |
| Quality gate | Bất biến đăng ký trò chơi 4 nơi phải bằng nhau; trần main chunk 600 kB (mục tiêu 450) | `npm run check:budget` · `tests/t23-mcp-servers.test.ts` |
| AI Level | **Mức 2** — AI đề xuất phương án, người quyết ADR; mỗi ADR có phương án đơn giản nhất làm đối chứng | `ARCHITECTURE.md` §ADR |
| RACI | R: agent · A: người giữ repo (chấp nhận ADR-01 local-first, ADR-16 lazy chunk) | — |
| Metrics | 18 ADR · 19 key lưu trữ có registry, **2 lỗ hổng thiết kế** (DC-17, DC-19) | RTM §4 |

### Pha 3 — Implementation (Hiện thực)

| Lớp | Nội dung | Artifact / lệnh |
|---|---|---|
| Deliverable | 171 module `.ts` + 97 `.tsx`, 42 service, 31 trò chơi đăng ký đủ 4 nơi | `find src -name '*.ts' \| wc -l` · `ARCHITECTURE.md` §12 |
| Quality gate | `pre-commit` typecheck · `commit-msg` chặn message sai chuẩn · `verify:quick` trước push | `scripts/hooks/` (3 hook) |
| AI Level | **Mức 3 trong giới hạn** — agent tự sửa code trong phạm vi allowed changes, nhưng không tự merge và không tự thêm dependency | `AGENTS.md` §1 mục 4–5 · [`.qoder/agents/kbt-reviewer.md`](../../.qoder/agents/kbt-reviewer.md) |
| RACI | R: agent · A: người giữ repo · C: reviewer lane khác | `.ai/CURRENT.md` |
| Metrics | entry 209.9 kB / boot graph 424.3 kB · 8 dependency runtime | `npm run check:budget` (đo 2026-11-03 lần năm, sau T41D) |

### Pha 4 — Verification (Kiểm chứng)

| Lớp | Nội dung | Artifact / lệnh |
|---|---|---|
| Deliverable | TEST_PLAN 10 lớp, TEST_CASES 42 TC có verdict (hai lát cắt) · catalog 6 phép ablation | [`../plan/TEST_PLAN.md`](../plan/TEST_PLAN.md) · [`../plan/TEST_CASES.md`](../plan/TEST_CASES.md) |
| Quality gate | `npm run verify` EXIT=0; UI đổi phải có ảnh/probe; test phải chứng minh bắt được lỗi | [`evidence/2026-11-02-T41C/`](../../evidence/README.md) · [`evidence/2026-11-02-KBT-ISSUE-43/`](../../evidence/README.md) |
| AI Level | **Mức 2** — AI sinh test, expected lấy từ AC do người duyệt. *Deviation:* ở các đợt sớm người duyệt không tách AC 3 nhánh ⇒ xem `06_VERIFICATION_VALIDATION.md` §4 | `TEST_CASES.md` §2 |
| RACI | R: agent · A: người giữ repo quyết oracle · C: — | — |
| Metrics | 92 test file / 1327 test / suite 22.32 s · 30 probe · 6 phép ablation làm đỏ đúng test | `evidence/2026-11-03-T41D/` (đo 2026-11-03 lần năm, mới nhất) · `verify-1287.txt` · `verify-1286.txt` · `verify-1281.txt` · `verify-1280.txt` · `verify-main-1278.txt` · `verify-rc.txt` · `mutation-M*.txt` |

### Pha 5 — Release (Phát hành)

| Lớp | Nội dung | Artifact / lệnh |
|---|---|---|
| Deliverable | Quy trình tag + workflow `04-release.yml` (build → zip → GitHub Release) + **hồ sơ `v1.1.0` đã điền số đo** | [`.github/workflows/04-release.yml`](../../.github/workflows/04-release.yml) · [`07_RELEASE_OPERATIONS.md`](07_RELEASE_OPERATIONS.md) §3.4 |
| Quality gate | Exit criteria: tag `vX.Y.Z` + golden-path 0 lỗi (`TEST_PLAN.md` §10) | — |
| AI Level | **Mức 1** — AI chạy lệnh, người ký go/no-go; AI **không** ký | `07_RELEASE_OPERATIONS.md` §3 |
| RACI | A: người giữ repo | — |
| Metrics | **Đo ngày 2026-11-03:** `git tag \| wc -l` = **1** (`4f75f5d` → `77d90ce`) **và release thật đã tồn tại** (`curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` ⇒ id `431754261`, `draft false`, asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte, 0 lượt tải) ⇒ pha này **Pass một phần**, không còn `NotRun`. Sáu điều kiện No-Go đã gỡ: `## [1.1.0] - 2026-11-02` trong `CHANGELOG.md`, `package.json` = `1.1.0`, cổng máy xanh trên chính commit được tag (`npm run verify` ⇒ EXIT=0 / `Duration 21.84s`), `npm ci` hết lệch semantics npm 10, `1. Quality` + `2. Build + artifact` **success trên runner**, và `4. Release` **success cả 9 bước** (run 41490669966). Còn mở: `3. Browser QA` **đỏ ở bước `QA probe` trên chính commit được tag** (bản sửa `afb9eeb` đến sau tag ⇒ release `v1.1.0` chưa được gate này chứng nhận; trên `afb9eeb` gate đã xanh lần đầu, run 41501753363 — rồi **đỏ lại** trên `8e6f9f5` docs-only, run 41504913606 ⇒ cổng QA **intermittent**), **trạng thái đợt bốn:** nguyên nhân đỏ thật đã bắt được (đề cổng phụ huynh sinh **sau** khung hình đầu — lỗi app, sửa trong `src/components/parent/ParentDashboardModal.tsx`) ⇒ gate **xanh năm lượt liên tiếp** (`2d2ca27` · `c9fd2b4` · `eb4b7b2` · `3b0122c`, tổng **7/13 lượt xanh** (tính tới `e961815`)) và `continue-on-error` **đã bị xoá** ở `3b0122c`, ba lượt CI đầu tiên không còn lưới cũng xanh (run 41523226603 `3b0122c` 69 s · run 41526285381 `6e30794` 72 s · run 41527657645 `e961815` 57 s, cả ba: bước 7 "QA probe" `success`, bước 8 `skipped`) **và lượt thứ tư** trên commit T41D `06b8962` (run 41537247288 · job 125592106681 `success` 62 s) — lượt cuối này là lượt **đầu tiên không lưới trên một commit đổi `src/`** ⇒ **8/14 lượt xanh** tính tới `06b8962` — chưa thấy một lần đỏ thật bị chặn nên ô 13 `docs/plan/TEST_PLAN.md` §16 vẫn MỞ; gate của **chính bản phát hành** vẫn chưa đóng vì commit được tag `77d90ce` chạy trước mọi bản sửa, chữ ký Go/No-Go trống, chưa có người lớn đọc to ≥1 bài/môn, chưa ai giải nén zip trên máy thật | `git tag \| wc -l` = 1 · `git for-each-ref refs/tags/v1.1.0 --format='%(objectname:short) %(*objectname:short)'` · `node scripts/release-notes.mjs 1.1.0 \| wc -l` = 875 · `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` · `curl -s …/actions/runs?per_page=6` |

### Pha 6 — Maintenance (Duy trì & tiến hoá)

| Lớp | Nội dung | Artifact / lệnh |
|---|---|---|
| Deliverable | CHANGELOG, AUDIT_REPORT, 39 báo cáo audit, quy trình CR | [`../../CHANGELOG.md`](../../CHANGELOG.md) · [`../opencode/reports/`](../opencode/reports/) · [`08_MAINTENANCE_EVOLUTION.md`](08_MAINTENANCE_EVOLUTION.md) |
| Quality gate | Mọi thay đổi hành vi phải kèm test; `npx vitest run` trước/sau khi refactor | `AGENTS.md` §2 |
| AI Level | **Mức 2** — agent sửa từng bước, người đọc diff theo 4 lớp | `08_MAINTENANCE_EVOLUTION.md` §3 |
| RACI | R: agent · A: người giữ repo | — |
| Metrics | `src/config/policy.ts` 693 dòng (17 export) là trần số dùng chung; `src/services/storage.ts` 2746 dòng là nợ thiết kế lớn nhất | `wc -l src/config/policy.ts src/services/storage.ts` (đo 2026-11-03 lần bảy, nội dung = HEAD `195a4be` + T43) |

---

## 2. Quyền No-Go

Người giữ repo giữ quyền **No-Go** ở 3 cổng: (a) FR vào SRS, (b) ADR được chấp nhận, (c) go/no-go
phát hành. Agent không có quyền ở cả ba — `AGENTS.md` §1 mục 4–5 cấm tự thêm dependency và tự
commit/push khi chưa được yêu cầu, tức là cấm luôn hai hành vi "tự cho Go" phổ biến nhất.

## 3. Tailoring — những gì khóa học yêu cầu mà repo này **cố ý không làm**

| Chuẩn gốc | Cắt | Lý do |
|---|---|---|
| OpenAPI spec cho mọi API | Cắt hẳn | Không có server. Toàn bộ "API" là hàm thuần trong `src/services/`; đặc tả nằm ở `src/types/*.ts` và được typecheck enforce. |
| Restore drill trên production DB | Thay bằng test quota | Không có DB. Rủi ro tương đương gần nhất là `setItem` ném (Safari riêng tư/hết chỗ) — đã có TC-08/09/10. |
| UAT với khách hàng | `NotRun` | Chưa có phụ huynh thật đồng ý thử; ghi ở `TEST_CASES.md` §5. |
| Telemetry aggregate BG-01 | Cắt | ADR-01 local-first + `SAFETY_PRIVACY.md` §1 — không gửi dữ liệu của trẻ đi đâu. |
