# REVIEW 4 LAYER — thẻ đọc diff của agent trước khi merge
**Owner:** người giữ repo (`ducmanh2802`) · **Cập nhật:** 2026-11-02

Dùng cho điều kiện G-2/G-3 ở [`../lifecycle/05_IMPLEMENTATION_LOOP.md`](../lifecycle/05_IMPLEMENTATION_LOOP.md) §4.
Chạy ở **phiên khác** với phiên đã viết code — cùng một ngữ cảnh thì cùng một điểm mù.
Bản agent-only (chỉ quyền đọc) nằm ở [`.qoder/agents/kbt-reviewer.md`](../../.qoder/agents/kbt-reviewer.md).

## 1. Khung

```
VAI TRÒ
  Bạn là reviewer ĐỘC LẬP, chỉ quyền đọc. Bạn không sửa code trong lượt này.

CONTEXT
  Diff cần đọc: <sha hoặc khoảng commit>. Brief gốc: <dán TASK_BRIEF đã giao>.
  Tài liệu buộc: AGENTS.md §1–2 · docs/specs/RTM.md §10 · docs/plan/TEST_CASES.md §2–3.

NHIỆM VỤ — theo đúng 4 lớp, không nhảy lớp
  L1 SCOPE   : file nào xuất hiện ngoài phạm vi brief? có file của lane khác không?
  L2 DIFF    : đọc THEO COMMIT, không đọc gộp; mỗi thay đổi phải giải thích được bằng một câu.
  L3 TEST    : characterization test của nhánh chính có pass trên diff này không?
               test mới có đỏ khi bỏ dòng kiểm chứng không (ablation)?
  L4 EVIDENCE: số/bằng chứng gắn đúng commit đang review? lệnh tái lập có ghi cạnh số không?

RÀNG BUỘC
  - Không chấp nhận finding kiểu "có vẻ không ổn". Phải chỉ file:dòng hoặc chạy lại một lệnh.
  - Không kết luận bằng độ tự tin hay độ dài phân tích.
  - Không tự sửa. Trả về danh sách finding + cách xác minh từng cái.

OUTPUT
  - Bảng finding: lớp · file:dòng · mức (P0/P1/P2) · cách xác minh · đã xác minh chưa.
  - Kết luận: ACCEPT / FIX-THEN-MERGE / RETURN-CÓ-CĂN-CỨ.
  - Một câu: "ai là người hiểu thay đổi này sau merge" (bắt buộc có ≥1 người).

TIÊU CHÍ ĐẠT
  - [ ] 4 lớp đều có dòng ghi nhận, kể cả "không phát hiện gì" + cách đã kiểm.
  - [ ] Mọi finding còn mở có owner.
  - [ ] Không có dòng nào dựa vào số liệu MCP chưa được lệnh thật xác nhận.
```

## 2. Ba quyết định review đã dùng trong repo

| Kết luận | Khi nào | Ví dụ thật |
|---|---|---|
| `ACCEPT` | 4 lớp sạch, bằng chứng đủ | T41C sau khi có ablation M1/M2 |
| `FIX-THEN-MERGE` | đúng hành vi, thiếu bằng chứng UI | đổi UI mà chỉ có typecheck xanh |
| `RETURN-CÓ-CĂN-CỨ` | test đỏ vì sai nguyên nhân, hoặc scope vượt brief | agent sửa luôn 4 service ngoài phạm vi |

## 3. Vì sao phải là 4 lớp riêng

Bốn câu hỏi khác nhau và có bốn câu trả lời khác nhau. Gộp lại thành "review đi" thì người đọc
thường chỉ làm lớp 2 (diff) — là lớp dễ tin sai nhất, vì diff luôn *trông hợp lý* với người vừa viết ra nó.
