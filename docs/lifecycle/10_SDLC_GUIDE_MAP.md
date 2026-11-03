# 10 — Bản đồ hướng dẫn triển khai dự án theo guide 11 pha
## `docs/step-by-step-guidance.md` × Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Người soạn:** agent (bản nháp, cần người duyệt) ·
**Ngày:** 2026-11-03 · **Nguồn:** [`../step-by-step-guidance.md`](../step-by-step-guidance.md) (1046 dòng)

> **Vì sao có file này.** `step-by-step-guidance.md` là **sổ tay của một kit** (bộ prompt + checklist
> IEEE), không phải tài liệu của repo này. Ba sự thật phải nói rõ trước khi "triển khai theo guide":
>
> 1. **Kit không có trong repo.** Guide dẫn chiếu `AI_SDLC-SOP.md`, `agentic-sdlc-process.md`, `README.md`
>    của kit và năm thư mục prompt/checklist (`requirements/`, `analysis/`, `design/`, `development/`,
>    `verification/` — gồm các file `.xlsx`). Kiểm kê bằng lệnh, không bằng cảm giác:
>    `find . -path ./node_modules -prune -o \( -iname "AI_SDLC-SOP.md" -o -iname "agentic-sdlc-process.md" -o -iname "*.xlsx" \) -print`
>    ⇒ **rỗng**. Vì vậy không thể chạy theo nghĩa đen cú pháp `@<kit>/<phase>/<template>.md` (§A7).
> 2. **Guide tự nó bảo phải sửa trước khi dùng.** §A1: "mọi thứ trong repo này là template"; §A2:
>    "cập nhật mọi prompt và checklist theo chuẩn của tổ chức **trước khi** áp dụng". Repo này **có**
>    chuẩn của nó: `AGENTS.md`, `docs/SDLC.md`, `docs/lifecycle/*`, `docs/prompts/*`, `docs/specs/*`,
>    `docs/plan/*`. Nên phép đúng là **ánh xạ + thế chỗ**, không phải chép đè.
> 3. **Dời thư mục đã theo dõi là rủi ro không cần thiết.** §A5 yêu cầu `docs/01-intake/ … docs/11-decommissioning/`.
>    `docs/specs/` và `docs/plan/` đã được dẫn tên bằng đường dẫn cụ thể ở `AGENTS.md` §0, `docs/SDLC.md`,
>    `docs/specs/README.md` quy ước 1, và skill đồng bộ số liệu (`kho-bau-measure-sync` quét đúng
>    `README.md docs/specs docs/plan`). Đổi chỗ = hỏng ~hàng chục tham chiếu và toàn bộ quy trình đo.
>    **Quyết định:** giữ layout hiện có cho pha đã có artifact; **mở thư mục mới chỉ cho pha còn trống**
>    (1 Intake, 10 Operations, 11 Decommissioning).

---

## 1. Bản đồ 11 pha → artifact thật của repo

`Có sẵn` = artifact tồn tại, mở được, không phải tạo mới. `Mới` = tạo trong đợt này.
`N/A` = guide yêu cầu nhưng sản phẩm này không có đối tượng tương ứng; lý do đi kèm (bắt buộc theo §A8).

| Pha (guide) | Artifact guide yêu cầu | Nơi nằm thật trong repo | Trạng thái |
|---|---|---|---|
| 1 Intake | `intent.md`, `glossary.md`, `stakeholders.md`, `sources.md` | `docs/01-intake/` | **Mới** (4 file) |
| 2 Requirements | `BRD.md`, `interviews/SRC-*.md`, `brd-audit.md` | [`../specs/BRD.md`](../specs/BRD.md) (8 mục, có §6 rủi ro nghiệp vụ) | Có sẵn; phỏng vấn `SRC-*` **N/A** — một người lớn giữ repo, không có vòng elicitation với khách hàng; nguồn thay thế ghi ở `docs/01-intake/sources.md` |
| 3 Analysis | `PRD.md`/`SRS.md`, `USER_STORIES.md`, `traceability.md`, `prd-audit.md` | [`../specs/SRS.md`](../specs/SRS.md) · [`../specs/RTM.md`](../specs/RTM.md) (chứa US + tầng truy vết) · [`../plan/TEST_CASES.md`](../plan/TEST_CASES.md) | Có sẵn; audit gộp vào [`CHECKLIST.md`](CHECKLIST.md) |
| 4 Design | `SAD.md`, `ADR-*.md`, `blueprint.md`, `diagrams/*.drawio`, `openapi.yaml`, `data/model.md`, `UI_UX_design/` | [`../specs/ARCHITECTURE.md`](../specs/ARCHITECTURE.md) (SAD + ADR inline + bảng chunk) · [`04_DESIGN_BLUEPRINT.md`](04_DESIGN_BLUEPRINT.md) · `src/types/index.ts` (model) | Có sẵn một phần; `ADR-*.md` tách file **N/A** (ADR đánh số inline trong `ARCHITECTURE.md`, đã có ID ổn định để RTM dẫn); `openapi.yaml` **N/A** (PWA không có REST API — cloud-sync là SDK Firestore, xem `docs/01-intake/intent.md` §4); `.drawio` **quyết định không áp dụng**, xem §6 dưới |
| 5 Planning | `Software_Development_Plan.md`, `WBS.md`, `tasks/<task-id>.md` | [`../plan/TASK_PLAN.md`](../plan/TASK_PLAN.md) (WBS + thẻ việc T-xx) · [`../prompts/TASK_BRIEF.md`](../prompts/TASK_BRIEF.md) (thẻ giao việc) | Có sẵn, dưới dạng **một file** thay vì ba |
| 6 Implementation | mã nguồn + test + cập nhật `traceability.md` | `src/`, `tests/`, PR/work item | Có sẵn |
| 7 Verification | `TEST_PLAN.md`, `TEST_CASES.md`, `RTM.md`, `TEST_REPORT.md`, `evidence/<run-id>/` | [`../plan/TEST_PLAN.md`](../plan/TEST_PLAN.md) · [`../plan/TEST_CASES.md`](../plan/TEST_CASES.md) · [`../specs/RTM.md`](../specs/RTM.md) · [`../../evidence/README.md`](../../evidence/README.md) + `evidence/<ngày>-<mã>/` | Có sẵn; cách đặt run-id của repo là `YYYY-MM-DD-T<NN>` thay vì commit+env — chấp nhận, vì tên thư mục nào cũng phải mở được và chứa output lệnh |
| 8 Review | PR + review record + approval | [`../prompts/REVIEW_4LAYER.md`](../prompts/REVIEW_4LAYER.md) + 4 lớp review + CI checks | Có sẵn (review ghi trong commit/PR, không có file riêng — đúng ý guide "phase 8 không có thư mục") |
| 9 Release | release record, release notes, rollout & rollback plan | [`07_RELEASE_OPERATIONS.md`](07_RELEASE_OPERATIONS.md) · `scripts/release-notes.mjs` · `CHANGELOG.md` · workflow `04-release.yml` | Có sẵn; **rollout/rollback** nằm ở `docs/10-operations/runbook.md` (Mới) |
| 10 Operations | runbooks, dashboards/alerts inventory, incident records | `docs/GOOGLE_AI_STUDIO_RUNBOOK.md` (runbook môi trường) — **thiếu** runbook vận hành app, sổ sự cố | **Mới**: `docs/10-operations/runbook.md` + `incident-log.md`; dashboard/alerts **N/A** — local-first, không telemetry (ADR-01), chỉ số chỉ đọc được trên máy người dùng |
| 11 Decommissioning | decommissioning record, evidence of data disposition & access revocation | **không có gì** | **Mới**: `docs/11-decommissioning/decommission.md` — với app dữ liệu trẻ em, đây là pha **bắt buộc**, không phải phụ lục |
| Cross-cutting (C1–C5) | change control, traceability upkeep, prompt versioning, evidence & data handling, agent controls | `docs/SDLC.md` §2/§5/§8 · `RTM.md` §9 · `docs/prompts/*` có version · `evidence/` + `AGENTS.md` §1.8 (dữ liệu trẻ) · `02_AI_USAGE_CHARTER.md` + `HARNESS.md` | Có sẵn; sổ **RISK/OQ/ASM** là chỗ trống thật duy nhất ⇒ [`../plan/RISK_REGISTER.md`](../plan/RISK_REGISTER.md) (Mới) |

**Kết luận đo được:** guide có 11 pha + 5 mục cross-cutting. Repo đã phủ **8/11 pha** (2, 3, 4, 5, 6, 7,
8, 9) và cả 5 mục cross-cutting; còn **3 pha trống** (1 Intake mới hoàn toàn, 10 và 11 thiếu một nửa)
và **1 register trống** (RISK/OQ/ASM — chưa có file nào, dù `BRD.md` §6 đã liệt kê rủi ro bằng văn xuôi).
Đợt này bổ sung đúng bốn chỗ đó.

---

## 2. Adaptation log (§A2 của guide — bắt buộc ghi lại mọi chỗ lệch chuẩn)

| Document | Thay đổi so với guide | Lý do / nguồn | Owner | Ngày |
|---|---|---|---|---|
| `docs/step-by-step-guidance.md` | Không đổi một chữ; dùng làm **chiếu** chứ không chạy `@template` | File của lane khác, chưa được theo dõi trong git (`git status --short` ⇒ `?? docs/step-by-step-guidance.md`); sửa nó là phá bản gốc của kit | người giữ repo | 2026-11-03 |
| §A5 layout | Giữ `docs/specs` + `docs/plan` + `docs/lifecycle` + `evidence/`; **chỉ thêm** `docs/01-intake`, `docs/10-operations`, `docs/11-decommissioning` | `AGENTS.md` §0 và `docs/specs/README.md` quy ước 1 dẫn đường dẫn cũ; skill đo số liệu quét đúng các thư mục đó | người giữ repo | 2026-11-03 |
| §A7 chạy prompt | Thay `@kit/<phase>/<template>.md` bằng `@docs/prompts/<THẺ>.md` (`TASK_BRIEF`, `BUG_HUNT`, `REVIEW_4LAYER`, `MEASURE_SYNC`, `CONTEXT_PACK`) | Repo đã có 5 thẻ prompt tự chứa (role/inputs/task/rules/output/self-check); kit không có file nào trong repo | người giữ repo | 2026-11-03 |
| §A8 cột checklist | `CHECKLIST.md` dùng `Trạng thái | Bằng chứng | Owner/Hạn` — tương ứng `Status | Evidence | Owner` | Đã có sẵn, không cần đổi; cột `Cổng` (Gate) được thay bằng cách nối **mỗi dòng** về §4 của file này | người giữ repo | 2026-11-03 |
| §A8 từ vựng | `ĐẠT` = Pass · `MỘT PHẦN` = Partial (buộc owner + hạn) · `FAIL` = chặn cổng · `K/A` = N/A kèm một dòng lý do; **cấm `ĐANG LÀM` khi chốt cổng** |_guide cấm `Pending` tại cổng_ | người giữ repo | 2026-11-03 |
| §A9 ID | **Không** đổi ID đã có (`FR-Sxx`, `NFR-P01`, `ADR-xx`, `US-xx`, `TC-xx`, `T<NN>`) — chỉ **thêm** prefix còn thiếu: `SRC`, `STK`, `SN`, `BO`, `RISK`, `OQ`, `ASM`, `DEF` | ID cũ đã được RTM, SRS, CHANGELOG dẫn bằng chuỗi cụ thể; đánh số lại = đứt truy vết hàng loạt | người giữ repo | 2026-11-03 |
| §"diagrams phải là `.drawio`" | Không áp dụng — sơ đồ viết bằng markdown/mermaid inline trong `ARCHITECTURE.md` | Xem §6 | người giữ repo | 2026-11-03 |
| §A6 baseline = commit + tag | Với repo này: baseline **yêu cầu/design** = commit `main` được tag `requirements-vN`/`design-vN` — **chưa tạo**, vì tag là quyền người giữ repo (`AGENTS.md` §1.5) | `v1.1.0` là tag duy nhất hiện có | người giữ repo | 2026-11-03 |

---

## 3. Loop năm bước (§A4) khớp vào lệnh thật của repo

| Bước guide | Lệnh/thao tác thật ở repo | Điều kiện dừng |
|---|---|---|
| 1. Specify | Viết brief theo [`../prompts/TASK_BRIEF.md`](../prompts/TASK_BRIEF.md); ghi thẻ vào `TASK_PLAN.md` (mã `T<NN>`) | Input đã baseline; brief không còn placeholder |
| 2. Generate | Test **trước**: `npx vitest run tests/t<NN>*.test.ts` phải **RED**, output lưu vào `evidence/<ngày>-T<NN>/` | Có RED chứng minh test bắt đúng hành vi |
| 3. Audit | Phiên sạch hoặc sub-agent đọc diff theo [`../prompts/REVIEW_4LAYER.md`](../prompts/REVIEW_4LAYER.md) (4 lớp); scored trong [`CHECKLIST.md`](CHECKLIST.md) | Không dòng `FAIL`; mọi `MỘT PHẦN` có owner + hạn |
| 4. Fix | `npm run verify` (= `verify:quick` + `build` + `check:budget`) rồi `npm run test:ci` | EXIT=0, output nguyên văn vào `evidence/` |
| 5. Approve | Người giữ repo duyệt + ký Go/No-Go; agent commit + push theo thoả thuận phiên; **agent không ký, không tự tag** | §4 dưới đây thoả |

**Rule ba vòng (§A4):** generate → audit → fix tối đa **3 vòng**. Vòng thứ tư red = vấn đề nằm ở yêu
cầu hoặc brief, không phải ở artifact ⇒ dừng và ghi `OQ-xx` vào [`RISK_REGISTER.md`](../plan/RISK_REGISTER.md),
đừng cố thêm.

**Bằng chứng nhìn thấy được:** với UI/trò chơi, cổng xanh **không** đủ — phải chạy probe
(`node qa/run-one.mjs qa/<probe>.mjs`) hoặc screenshot thật, theo `AGENTS.md` §1.3. Đây chính là
điều kiện "evidence mở được" của §A6.

---

## 4. Cổng năm điều kiện (§A6) — trạng thái hiện tại

| Điều kiện | Nghiệm thu bằng lệnh/nơi | Trạng thái 2026-11-03 |
|---|---|---|
| 1. Checklist 0 `FAIL` | [`CHECKLIST.md`](CHECKLIST.md) | `MỘT PHẦN` còn mở, không `FAIL` — xem §3 của `lifecycle/README.md` |
| 2. Truy vết hai chiều | `RTM.md` §7 + `tests/t23-mcp-servers.test.ts` (bất biến 4 nơi của game) | Đạt cho **hai lát cắt** đã chọn; phần FR ngoài lát cắt còn `TC` trống (ghi `K/A` + lộ trình ở `09_ADOPTION_ROADMAP.md`) |
| 3. Evidence mở được | `evidence/` + output lệnh nguyên văn | Đạt; mỗi đợt có `verify.txt` và file ablation `*-RED.txt` |
| 4. Người duyệt ≠ người viết | Người giữ repo ký Go/No-Go | **Mở** — chưa có phiên ký nào (`NotRun`, `lifecycle/README.md` §3) |
| 5. Handoff | `.ai/CURRENT.md` (lane của phiên) + `CHANGELOG.md` + `TASK_PLAN.md` §II | Đạt về mặt thao tác; chữ ký vẫn thuộc điều kiện 4 |

---

## 5. Vai trò (§A10) — ai là con người thật

| Vai trò guide | Người/thoả thuận trong repo | Ghi chú |
|---|---|---|
| BA / product owner | người giữ repo `ducmanh2802` | quyết định phạm vi, độ khó, sư phạm |
| Human owner / engineer | người giữ repo; agent chỉ soạn bản nháp | agent **không** phải owner (guide: "Owner luôn là một con người có tên") |
| Reviewer | người giữ repo + CI checks (`1. Quality`, `2. Build + artifact`, `3. Browser QA`, `4. Release`) | review 4 lớp bắt buộc trước merge |
| Tech lead / architect | người giữ repo (ADR inline trong `ARCHITECTURE.md`) | ADR-01 (local-first, không telemetry) ràng buộc cả pha 10 |
| Security / privacy | người giữ repo, theo `docs/SAFETY_PRIVACY.md` + `AGENTS.md` §1.8 | dữ liệu trẻ: chỉ `localStorage`, cloud là tuỳ chọn, không dán bài của bé ra chat/Issue |
| Release owner | người giữ repo | tag + ký Go/No-Go; agent không tự làm hai việc này |

---

## 6. Ba quyết định tailoring cần người duyệt (không phải bug, là lựa chọn)

1. **`.drawio` thay cho sơ đồ text.** Guide (§A5) bắt mỗi sơ đồ là file `.drawio` sửa được. Repo có 0 file
   `.drawio` (đo: `find . -path ./node_modules -prune -o -iname "*.drawio" -print` ⇒ rỗng) và vẽ sơ đồ
   bằng markdown/mermaid trong `ARCHITECTURE.md`. **Đề xuất: giữ nguyên**, vì mục tiêu của rule
   ("export ảnh không được là nguồn duy nhất") đã thoả — markdown diff review được và **tốt hơn** XML
   drawio cho code review. Nếu người giữ repo muốn đúng chữ chuẩn, việc cần làm là xuất thêm
   `docs/04-design/diagrams/*.drawio` từ sơ đồ hiện có, không phải sửa code.
2. **`openapi.yaml`** — `K/A`: sản phẩm không có HTTP API do mình định nghĩa; lớp cloud là Firestore SDK
   với shape do `src/services/cloudMerge.ts` quy định và đã có test. Đối tượng "interface operation
   `API-xxx`" trong repo này là các hàm service, không phải endpoint.
3. **ADR thành file riêng** — `K/A` ở dạng file, **đạt** ở dạng nội dung: mỗi quyết định có ID
   (`ADR-01`…`ADR-18`) và được RTM dẫn. Tách thành 18 file chỉ để khớp chữ guide là chi phí không
   đổi lấy bằng chứng nào.

---

## 7. Việc còn mở sau bản đồ này

Không tô hồng: bản đồ này **làm cho** guide chạy được, nó không tự đóng các cổng đang mở. Theo dõi
tập trung tại [`../plan/RISK_REGISTER.md`](../plan/RISK_REGISTER.md) — mỗi dòng có owner và hạn;
điều kiện để một dòng chuyển `ĐẠT` ghi ở [`CHECKLIST.md`](CHECKLIST.md) §3.

- [ ] Người giữ repo duyệt §6 (ba quyết định tailoring) và §2 (adaptation log).
- [ ] Baseline bằng tag (`requirements-v1`, `design-v1`) — quyền của người giữ repo, agent không tự tag.
- [ ] Pha 10: chạy thật một lượt restore drill và ghi kết quả vào `docs/10-operations/runbook.md` (đang
      `NotRun` ở `lifecycle/README.md` §3).
- [ ] Pha 11: `docs/11-decommissioning/decommission.md` mới chỉ là bản mô tả thủ tục; cần chạy một lần
      trên máy thật để có bằng chứng "mở được".
- [ ] `package-lock.json` là nguồn thật (`AGENTS.md` §1.6) — lane dùng chung đã hai lần xoá file này;
      kiểm trước khi commit: `git ls-files package-lock.json`.
