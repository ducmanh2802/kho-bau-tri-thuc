# 05 — Implementation Loop
## Vòng build có rào chắn · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Quy trình gốc:** [`../SDLC.md`](../SDLC.md) §1–2 · file này ghi *cách vòng lặp đã chạy thật* và
những chỗ nó lệch khỏi chuẩn.

---

## 1. Guarded Build Loop — 6 bước

| # | Bước | Ai | Đầu ra | Rào chắn |
|---|---|---|---|---|
| 1 | **Brief** | người giữ repo | task brief 5 phần (§2) | không có brief ⇒ agent hỏi lại, không đoán |
| 2 | **Plan** | agent | danh sách file sẽ sửa + điểm khôi phục | không đụng file lane khác; plan trước khi sửa |
| 3 | **Red** | agent | test mô tả hành vi còn thiếu, **chạy và đỏ đúng nguyên nhân** | `npx vitest run tests/<file>` phải FAIL trước |
| 4 | **Green** | agent | sửa trong allowed changes | `pre-commit` typecheck |
| 5 | **Review** | người (+ sub-agent đọc diff) | finding đã xác minh, không "có vẻ ổn" | 4 lớp ở `08_MAINTENANCE_EVOLUTION.md` §3 |
| 6 | **Merge** | người | commit theo Conventional Commits | merge gate 5 điều kiện (§4) |

**Ví dụ thật, nguyên văn theo từng bước (T41C — chặn ghi trùng):**

| Bước | Đã làm |
|---|---|
| Brief | "Bốn đường ghi tiến trình (câu trả lời, buổi đọc, bước ngày, biên lai thưởng) đang tính hai lần khi UI mount lại hoặc khi gửi trùng." |
| Plan | đụng 5 file: `storage.ts`, `readingEngine.ts`, `readingDefaults.ts`, `types/reading.ts`, `types/motivation.ts` + 1 file test mới |
| Red | `tests/t41c-idempotency.test.ts` — 25 test, chạy trước khi sửa source |
| Green | `writeJSON` trả `boolean`; `claimKey` có nonce; `appliedSessionIds`; hoàn tác bước ngày; `GameRewardStrip` |
| Review | đọc diff theo commit, chạy lại `verify` |
| Merge | commit `d54f341`, 16 file, +688/−104, push `7c60066..d54f341` |

## 2. Task brief 5 phần — mẫu dùng lại được

Bản copy nằm ở [`../prompts/TASK_BRIEF.md`](../prompts/TASK_BRIEF.md). Khung:

```
Vai trò      : bạn là dev của repo này, chỉ quyền sửa <phạm vi>
Context      : hành vi sai ở <file:dòng>, bằng chứng là <log/ảnh>
Nhiệm vụ     : làm cho <TC-xx> chuyển từ Fail → Pass
Ràng buộc    : không thêm dependency · không đổi public type ngoài phạm vi · không commit
Output       : diff + output `npx vitest run <file>` nguyên văn + số đo trước/sau
```

## 3. Test double — dùng loại nào, ở đâu

| Loại | Trong repo | Vì sao chọn |
|---|---|---|
| **fake** | mock `localStorage` trong node env của Vitest (`tests/*.test.ts`) | test cần hành vi thật của kho khoá-giá-trị mà không cần trình duyệt |
| **stub** | `makeResponse()` trong `tests/t41c-idempotency.test.ts:73` | dựng dữ liệu vào, không quan tâm hành vi |
| **spy** | `setItem` ném để đo quota (`tests/t41c-idempotency.test.ts:198`) | cần *đếm* và *đổi* hành vi để kiểm nhánh lỗi |
| **mock** | gần như không dùng | service chính là hàm static thuần; mock chúng sẽ test luôn cả đối tượng giả |
| **thật** | 30 probe Playwright trên `dist/` | typecheck không chứng minh được UI đúng (`AGENTS.md` §1.3) |

## 4. Merge gate — 5 điều kiện, áp cho từng PR

| # | Điều kiện | Kiểm bằng | Trạng thái repo 2026-11-02 |
|---|---|---|---|
| G-1 | CI xanh **trên commit cuối** | workflow 01 + 02 | chạy thật trên push/PR; chưa từng chạy trên tag (chưa có tag) |
| G-2 | Review ở **phiên độc lập** | reviewer khác lane đọc diff | mới thành quy trình + sub-agent `.qoder/agents/kbt-reviewer.md` |
| G-3 | Mỗi finding **đã được xác minh** | agent phải chỉ ra dòng code hoặc chạy lại lệnh | đang áp, ghi ở `AGENTS.md` §1.1 |
| G-4 | Test chạy trên **baseline của nhánh chính** | `npm run verify` sau khi rebase | có, qua `pre-push` (`verify:quick`) |
| G-5 | Scope đúng: không file ngoài phạm vi, không đụng lane khác | `git status --short` trước khi stage | **đang hở** — lane khác đã 2 lần xoá `package-lock.json` (`3727f04`, `fd3e7da`) |

## 5. Harness: Guide × Sensor

| Guide (dặn dò) | Sensor (chặn) |
|---|---|
| `AGENTS.md` (mệnh lệnh + bất biến) | `scripts/hooks/pre-commit` (typecheck), `commit-msg` (chuẩn message), `pre-push` (`verify:quick`) |
| skill `kho-bau-mini-game-integration`, `kho-bau-measure-sync` | 4 workflow `.github/workflows/01…04` |
| 5 MCP server trong `mcp/` (27 tool) | 1286 test, trong đó có **source-contract test** đọc file nguồn bằng regex |
| bộ docs `docs/specs` + `docs/lifecycle` | `npm run check:budget` chặn hồi quy dung lượng |

Danh mục đầy đủ và cách chạy: [`HARNESS.md`](HARNESS.md).

## 6. Deviation đã ghi, không ẩn

- **Red trước Green không phải lúc nào cũng đúng.** Ở các đợt sớm (T01…T30) agent viết code và test
  gần như cùng lúc. Hệ quả: test chỉ chứng minh code khớp chính nó. Cách bù đang dùng:
  (a) hợp đồng nguồn (§5) khoá *cấu trúc* code, (b) **ablation** chứng minh test biết đỏ
  (`TEST_CASES.md` §4, 2 phép), (c) từ lát cắt T41C trở đi viết test trước.
- **Không có PR thật cho các commit đã merge.** Repo push thẳng `main` theo trunk-based;
  G-2/G-3 vì vậy đang dựa vào *phiên review khác lane* chứ không dựa vào nền tảng PR.
  Template có sẵn ở `.github/pull_request_template.md`.
