# BUG HUNT — thẻ rà lỗi một vùng chưa có probe
**Owner:** người giữ repo (`ducmanh2802`) · **Cập nhật:** 2026-11-02 · đã dùng cho T32 · T33 · T41

Dùng khi: một vùng UI/dịch vụ **chưa có** probe Playwright, hoặc probe đỏ mà không ai giải thích được.
Kết quả mong muốn không phải "đã sửa" mà là **một danh sách lỗi có xếp hạng** — sửa dần theo đợt.

## 1. Khung

```
VAI TRÒ
  Bạn là QA + dev của repo Kho Báu Tri Thức. Quyền: đọc toàn repo, chạy lệnh, ghi test/probe mới.
  KHÔNG ghi vào src/ trong lượt này — lượt rà lỗi chỉ lập danh sách.

CONTEXT
  Vùng nghi ngờ: <vd "các màn trò chơi chưa có probe", "luồng ba mẹ">.
  Nguồn thật: `qa/*.mjs` (29 probe), `tests/*.test.ts` (87 file), `docs/plan/TEST_PLAN.md` §5 (nguồn đỏ giả).
  Điều cấm: sửa UI để chiều probe; tăng retry để xoá flaky.

NHIỆM VỤ
  1) Lập danh sách màn hình/dịch vụ chưa có probe ⇒ `ls qa/` đối chiếu `src/components/`.
  2) Với từng vùng: đọc code tìm 6 loại lỗi kinh điển (xem §2) — mỗi lỗi phải chỉ ra file:dòng.
  3) Tái hiện được bằng lệnh hoặc ảnh ⇒ xếp hạng P0/P1/P2.
  4) Không tái hiện được ⇒ ghi "nghi ngờ + cách kiểm", không đếm thành bug.

RÀNG BUỘC
  - Không đổi hành vi trong lượt rà.
  - Chạy probe deep-flow **hai** lần trước khi gọi là lỗi (timing).
  - Không tạo file tạm trong `qa/` (probe sẽ bị đếm nhầm) — để ở thư mục gốc repo rồi xoá.

OUTPUT
  - Bảng: lỗi · file:dòng · mức · cách tái hiện · test/probe nào sẽ bắt nó.
  - Danh sách "đã kiểm mà sạch" — quan trọng ngang danh sách lỗi.

TIÊU CHÍ ĐẠT
  - [ ] Mỗi lỗi có ≥1 cách tái hiện chạy được.
  - [ ] Không lỗi nào chỉ dựa vào "đọc code thấy sai".
  - [ ] Cuối lượt `git status` sạch `src/`.
```

## 2. Sáu loại lỗi đã bắt được thật trong repo này

| # | Loại | Ví dụ đã xảy ra | Cách bắt |
|---|---|---|---|
| 1 | Lời hứa UI ≠ số thật | màn kết quả in `+0 Sao` | test SSR + probe (`TC-19…24`) |
| 2 | Ghi trùng khi mount lại | analytics/streak cộng hai lần | test gọi hai lần, so từng field |
| 3 | Đồng hồ tường | `Date.now()` trong pipeline làm `decide` không tái lập | hợp đồng nguồn grep `Date.now()` |
| 4 | Múi giờ | `toISOString()` cho nhãn ngày UTC+7 | test phiên 00:30 sáng VN |
| 5 | Probe đo sai | `qa/mobile.mjs` so cả chuỗi đồng hồ thay vì layout | đọc code probe, không chỉ đọc kết quả |
| 6 | Trần bộ nhớ | mảng phình làm `setItem` ném ⇒ hỏng vĩnh viễn | test nhồi + kiểm trần (`recentEvidences` ≤ 200) |

## 3. Ví dụ đã chạy

Đợt T41 (§60 trong lịch sử công việc) sinh ra danh sách 5 nhóm lỗi T41A…T41E, mỗi nhóm sau đó thành
một brief riêng ở [`TASK_BRIEF.md`](TASK_BRIEF.md). T41D/T41E vẫn mở — chứng tỏ thẻ hoạt động:
nó để lại việc chưa làm **có tên**, không để lại cảm giác "xong rồi".
