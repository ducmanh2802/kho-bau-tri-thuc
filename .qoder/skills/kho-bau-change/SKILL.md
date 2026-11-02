---
name: kho-bau-change
description: Quy trình một thay đổi end-to-end trong Kho Báu Tri Thức (D:\trithuc\kho-bau-tri-thuc) — từ brief tới merge gate và bằng chứng. Dùng khi được yêu cầu sửa bug / thêm tính năng / đổi UI trò chơi, khi chuẩn bị commit, hoặc khi câu trả lời sắp tới chứa "xong". Buộc đúng thứ tự test-trước, đủ 4 lớp review, evidence gắn commit và đồng bộ số liệu docs. Không dùng cho câu hỏi giải thích code thuần tuý.
---

# Một thay đổi, từ brief tới bằng chứng

## Overview

Repo này không thiếu test (1240) mà thiếu **quy trình ra quyết định**. Skill này dựng lại đúng thứ
tự đã chốt ở `docs/lifecycle/05_IMPLEMENTATION_LOOP.md` và `docs/SDLC.md` §1. Ba chỗ hay bị bỏ nhất:
**test đỏ trước khi sửa**, **bằng chứng gắn commit**, **số liệu docs cập nhật sau cổng**.

Repo: `D:\trithuc\kho-bau-tri-thuc` · Hiến chương AI: `docs/lifecycle/02_AI_USAGE_CHARTER.md` ·
Thẻ prompt: `docs/prompts/TASK_BRIEF.md`.

## Khi nào chạy

- Bất kỳ thay đổi hành vi nào trong `src/`, `src/data/`, `qa/`, `docs/specs/`.
- **Không** khi chỉ trả lời câu hỏi đọc-hiểu.

## Bảy bước — không nhảy bước

### 0. Brief (5 phần) + Context pack (6 mục)

Thiếu một trong năm phần (vai trò · context · nhiệm vụ · ràng buộc · output) ⇒ **hỏi lại**, đừng đoán.
Mẫu: `docs/prompts/CONTEXT_PACK.md` §1.

### 1. Plan trước khi ghi

Liệt kê file sẽ đụng. Kiểm tra lane khác:

```bash
git status --short          # có file lạ đang modified?
cat .ai/CURRENT.md          # lane nào đang giữ vùng nào
```

### 2. RED — test viết trước, phải đỏ **vì đúng nguyên nhân**

```bash
npx vitest run tests/<file-mới>.test.ts        # phải FAIL
```
Đỏ vì thiếu import / sai type **không** tính là đỏ. Nếu hành vi cũ chưa có test nào khoá,
chụp **characterization test** trước (expected lấy từ lần chạy thật trên code cũ) —
`docs/lifecycle/08_MAINTENANCE_EVOLUTION.md` §1.

### 3. GREEN — sửa trong phạm vi

Rào chắn thật là hook, không phải lời dặn: `pre-commit` typecheck, `commit-msg` chuẩn Conventional.
Không `--no-verify`. Không tự thêm dependency (`AGENTS.md` §1.4).

### 4. Cổng + bằng chứng nhìn thấy được

```bash
npm run verify                    # typecheck + test:ci + build + check:budget
# đổi UI / trò chơi ⇒ bắt buộc một trong hai:
npm run qa:smoke
node qa/run-one.mjs qa/<probe>.mjs
```
**Typecheck xanh ≠ tính năng đúng.** Probe deep-flow đỏ vì timing ⇒ chạy lại **một** lần,
vẫn đỏ mới là lỗi, và khi báo cáo dán `errors[]` + `failedAt` chứ không chỉ exit code.

### 5. Ablation cho rule then chốt

Với mỗi guard mới viết, tạm bỏ nó và chứng minh test đỏ:

```bash
# sửa tạm: đổi điều kiện guard thành `if (false && …)`
npx vitest run tests/<file>.test.ts     # phải FAIL đúng test
git checkout -- src/<file>.ts           # hoàn tác NGAY
npx vitest run tests/<file>.test.ts     # phải EXIT=0
```
Lưu log vào `evidence/<YYYY-MM-DD>-<mốc>/mutation-<tên>.txt` (bỏ ANSI:
`sed 's/\x1b\[[0-9;]*m//g'`). **Không để lại mutation dở** — `git status` phải sạch `src/`.

### 6. Review 4 lớp rồi mới merge

`SCOPE → DIFF → TEST → EVIDENCE`, chạy ở phiên khác với phiên viết code
(`docs/prompts/REVIEW_4LAYER.md`, hoặc sub-agent `kbt-reviewer`).

### 7. Đóng hồ sơ

- `evidence/<ngày>-<mốc>/README`-row: commit + lệnh + verdict (`docs/lifecycle/README.md` §2).
- `CHANGELOG.md` `[Unreleased]` một dòng, **thêm mới**, không sửa dòng lịch sử.
- Đồng bộ số liệu: chạy skill `kho-bau-measure-sync` (verify EXIT=0 xong mới đo).
- VI-TEXT: `node C:/Users/Windows/.qoder/skills/vietnamese-text-integrity-check/scripts/check_vi_text.mjs docs/... `

## Bốn điều cấm

| Cấm | Vì sao |
|---|---|
| `npm test` trong tự động hoá | `posttest` ghi `docs/audit-state.json` + nối `docs/AUDIT_REPORT.md` ⇒ bẩn diff |
| `git add -A` | lane khác đang sửa `docs/opencode/reports/img/*.png`; đã 2 lần xoá `package-lock.json` |
| đặt file tạm trong `qa/` | `qa/*.mjs` được **đếm là probe** ⇒ số probe tăng thật, docs sync báo đỏ |
| tự tag / push / tạo PR khi chưa được yêu cầu | go/no-go là quyền người, AI không ký (`07` §3) |

## Nghiệm thu nhanh (tự hỏi trước khi nói "xong")

```
[ ] verify EXIT=0, output nguyên văn đã dán
[ ] test mới đã TỪNG đỏ vì đúng nguyên nhân
[ ] guard then chốt đã ablation, log nằm trong evidence/
[ ] UI đổi ⇒ có ảnh hoặc probe trên dist/
[ ] CHANGELOG có dòng mới, docs số liệu đã sync (measure.mjs exit 0)
[ ] VI-TEXT exit 0
[ ] git status: không file lạ, package-lock còn nguyên
```
