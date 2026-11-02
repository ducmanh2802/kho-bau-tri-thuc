# CONTEXT PACK — 6 mục phải có trước khi giao việc
**Owner:** người giữ repo (`ducmanh2802`) · **Cập nhật:** 2026-11-02 · chốt tại `d54f341`

Context pack là **phần CONTEXT** của mọi thẻ prompt. Nó trả lời ba câu mà agent luôn tự đoán sai:
*tôi đang ở phiên bản nào*, *ai được tin hơn ai*, *cái gì không được đưa vào đầu tôi*.

## 1. Sáu mục

```
1) PHIÊN BẢN
   commit HEAD      : d54f341 (2026-11-02)
   schema lưu trữ   : STORAGE_SCHEMA_VERSION = 'P43-v1'  (src/services/storage.ts:105)
   node / npm       : v24.x · package manager = npm, package-lock.json là nguồn thật
   policy           : src/config/policy.ts — 693 dòng, 17 export, mọi trần số dùng chung

2) NGUỒN THEO THẨM QUYỀN (trên → dưới; trên thắng)
   a. AGENTS.md                 — mệnh lệnh + bất biến kiến trúc
   b. docs/SDLC.md              — quy trình, "nguồn chân lý duy nhất cho cách làm việc"
   c. docs/specs/{BRD,SRS,ARCHITECTURE,RTM}.md  — yêu cầu & kiến trúc HIỆN TRẠNG (số đo được)
   d. docs/lifecycle/*          — artifact vòng đời, checklist, charter
   e. docs/plan/{TASK_PLAN,TEST_PLAN,TEST_CASES}.md — kế hoạch & ca kiểm thử
   f. docs/*.md còn lại (P27…P43, AUDIT_REPORT)  — CERTIFICATION của các đợt cũ
   g. docs/opencode/reports/*   — nhật sử phiên, KHÔNG dùng làm nguồn quyết định

3) HIỆU LỰC
   Còn áp dụng      : a–e
   Chỉ là lịch sử   : f–g, và mọi dòng trong CHANGELOG.md / TASK_PLAN.md §II
   Mâu thuẫn        : nếu f hoặc g trái với c/e ⇒ c/e đúng, ghi lại thành nợ chứ không sửa f/g

4) PHẠM VI SỬA ĐƯỢC
   Cho phép         : file nêu trong brief; test mới trong tests/; probe mới trong qa/
   Cấm              : package.json (thêm dependency) · src/data của lane khác khi không được giao
                      · scripts/hooks · .github/workflows · bất kỳ file nào của lane khác ở .ai/CURRENT.md
   Phải hỏi trước   : tag/release · xoá file lạ · force-push · bật cloudSync mặc định

5) LỆNH & MÔI TRƯỜNG
   npm run hooks:install · npm run verify (= typecheck + test:ci + build + check:budget)
   npm run test:ci       · npm run verify:quick
   npm run build && npm run qa:smoke · node qa/run-one.mjs qa/<probe>.mjs
   Cấm trong tự động hoá : `npm test` (posttest ghi docs/audit-state.json + nối docs/AUDIT_REPORT.md ⇒ bẩn diff)

6) PHẦN LOẠI BỎ — không bao giờ đưa vào context
   .env / .env.* (repo này không biến nào bắt buộc — xem .env.example)
   API key, token, service account
   progress/           — tiến độ THẬT của bé, đã .gitignore
   nội dung bài làm của bé (câu hỏi + đáp án + ảnh) — kể cả để "minh hoạ lỗi"
   node_modules/ · dist/ · coverage/
   dữ liệu nhân thân (họ tên đầy đủ, trường, số điện thoại) — SAFETY_PRIVACY.md §1
```

## 2. Cách dùng

Dán nguyên khối trên vào phần `CONTEXT` của [`TASK_BRIEF.md`](TASK_BRIEF.md), sau đó **cắt** những
mục không liên quan tới nhiệm vụ — context càng dài không càng tốt, nó chỉ cần **đúng thẩm quyền**.

| Tình huống | Cắt gì | Giữ gì |
|---|---|---|
| Sửa service thuần | mục 2 f/g, ảnh, probe | 1, 2a–c, 4, 5, 6 |
| Rà lỗi UI | mục 1 chi tiết policy | 2, 4, 5 (probe), 6 |
| Đồng bộ số liệu docs | 4 (chỉ ghi docs) | 1, 2, 3, 5, 6 + [`MEASURE_SYNC.md`](MEASURE_SYNC.md) |

## 3. Compact vs Clear

| Khi nào | Làm gì |
|---|---|
| **Compact** — đang chuyển việc, ngữ cảnh còn sạch | tóm tắt 5 dòng: commit · phạm vi · lệnh · ràng buộc · tiêu chí đạt |
| **Clear** — context đã lẫn thông tin sai (số cũ, file đã đổi tên, kết luận của báo cáo cũ) | **xoá và dựng lại** từ mục 2a–e, không "sửa tiếp trong ngữ cảnh bẩn" — vì cái sai đã nằm trong suy luận rồi |

Dấu hiệu phải Clear: agent trích một con số/số dòng không tái tạo được bằng lệnh.
Ví dụ thật: docs dẫn `file.ts:NNN` bị trôi sau khi sửa source — khoảng 15 ref hỏng cùng lúc,
remap một pass riêng chứ không chữa từng chỗ trong cuộc trò chuyện đang lệch.
