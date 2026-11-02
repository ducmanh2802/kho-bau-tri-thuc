# TASK BRIEF — thẻ giao việc cho agent
**Owner:** người giữ repo (`ducmanh2802`) · **Cập nhật:** 2026-11-02 · dùng cho T41A/T41B/T41C

## 1. Khung (copy nguyên khối này)

```
VAI TRÒ
  Bạn là dev của repo Kho Báu Tri Thức — Lớp 1. Phạm vi sửa của bạn: <danh sách file/thư mục>.
  Ngoài phạm vi đó: chỉ đọc, không ghi.

CONTEXT
  Hành vi sai: <mô tả 2–4 câu, có file:dòng>.
  Yêu cầu nguồn: <FR/NFR id trong docs/specs/SRS.md> · AC: <US-xx trong docs/plan/TEST_CASES.md §2>.
  Bất biến đang buộc: <AGENTS.md §2 — vd "4 nơi đăng ký game", "main chunk ≤ 600 kB">.

NHIỆM VỤ
  1) Viết test mô tả hành vi ĐÚNG. Chạy, phải ĐỎ vì đúng nguyên nhân (không đỏ vì thiếu import).
  2) Sửa trong phạm vi tới khi test XANH.
  3) Chạy `npm run verify`, dán output nguyên văn.
  4) Nếu đổi UI/trò chơi: `npm run build` + probe hoặc screenshot — typecheck xanh không tính.

RÀNG BUỘC
  - Không thêm dependency. Không đổi public signature ngoài phạm vi.
  - Không commit, không push, không tag. Không đụng file của lane khác (kiểm `git status --short`).
  - Không dùng `npm test` (posttest ghi audit-state); dùng `npm run test:ci`.
  - Không dán nội dung bài làm của bé ra log/chat.

OUTPUT
  - Diff + `npm run verify` nguyên văn + số đo trước/sau (kB, số test, lỗi probe).
  - Danh sách: điều chưa làm được / rủi ro còn lại.
  - Điểm khôi phục nếu giữa đường hỏng: <file nào phải sạch, lệnh nào phải xanh>.

TIÊU CHÍ ĐẠT (viết trước khi chạy)
  - [ ] <lệnh 1> ⇒ <kết quả cụ thể>
  - [ ] <lệnh 2> ⇒ <kết quả cụ thể>
```

## 2. Ba brief đã dùng thật

### T41A — quyền kiểm soát và luồng học hiển thị sai

| Phần | Nội dung đã giao |
|---|---|
| Vai trò | dev, phạm vi `src/services/storage.ts`, `src/services/learningOS.ts`, `src/components/parent/`, `src/App.tsx` |
| Context | `completeLesson` trả con số *đề xuất* chứ không trả con số *đã cấp*; bốn đường tiêu tài nguyên (rương, gacha, shop, quà level) không nghe công tắc thưởng của ba mẹ; "Vì sao gợi ý này?" nhảy về trang Chủ |
| Nhiệm vụ | test từng đường vào ⇒ sửa ⇒ `verify` |
| Ràng buộc | không đổi schema động lực; không bỏ tính năng nào |
| Output | `tests/t41a-parent-controls.test.ts` — 14 test, 3 describe |
| Tiêu chí đạt | tắt thưởng ⇒ mọi đường vào trả 0 và **không** trừ vé/khoá ngày; bật ⇒ trả đúng số đã cấp |

### T41B — timezone và tính tất định của DecisionEngine

| Phần | Nội dung đã giao |
|---|---|
| Vai trò | dev, phạm vi `src/services/decisionEngine.ts`, `src/services/learningOS.ts`, `src/utils/dateUtils.ts` |
| Context | cửa sổ 14 ngày tự đọc `Date.now()` thay vì `now` của caller ⇒ cùng input khác output; nhãn ngày dùng UTC trong khi máy là UTC+7 ⇒ phiên 00:30 sáng VN bị tính về hôm trước |
| Nhiệm vụ | test biên 13/15 ngày ⇒ sửa ⇒ thêm **hợp đồng nguồn** cấm `Date.now()` trong pipeline |
| Output | `tests/t41b-decision-clock.test.ts` — 4 describe, gồm describe "hợp đồng nguồn" |
| Tiêu chí đạt | `decide` chạy hai lần cùng `now` cho kết quả **từng byte giống nhau**; mọi nhãn ngày dùng lịch địa phương |

### T41C — bốn đường ghi tính hai lần

| Phần | Nội dung đã giao |
|---|---|
| Vai trò | dev, phạm vi `storage.ts`, `readingEngine.ts`, `readingDefaults.ts`, `types/reading.ts`, `types/motivation.ts` |
| Context | UI mount lại / gửi trùng làm analytics, buổi đọc, bước ngày và biên lai thưởng cộng hai lần; `writeJSON` nuốt lỗi nên streak +1 dù không lưu được |
| Nhiệm vụ | test đỏ trước ⇒ `writeJSON` trả `boolean` ⇒ claimKey có nonce ⇒ hoàn tác bước ngày ⇒ UI không hứa `+0 Sao` |
| Ràng buộc | field mới phải vào whitelist sanitizer, nếu không bị reset mỗi lần đọc |
| Output | commit `d54f341`, 16 file, +688/−104 · `tests/t41c-idempotency.test.ts` 25 test · 2 phép ablation |
| Tiêu chí đạt | `verify` EXIT=0 · TC-11 đỏ khi bỏ guard (`mutation-M2`) · ảnh trước/sau dải thưởng |

## 3. Vì sao ba brief này chạy lại được ở nơi khác

Chúng không chứa tri thức ngầm: mỗi cái nêu **file:dòng**, **AC nguồn**, **lệnh kiểm**, và
**điểm khôi phục**. Người nhận việc không cần hỏi "ý anh là gì" — đó là định nghĩa của
"prompt tái dùng" trong tiêu chí nghiệm thu.
