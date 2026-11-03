# Stakeholders — ai bị ảnh hưởng và ai có quyền chặn
## Pha 1 (Intake) · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày:** 2026-11-03
**Nguồn:** sao chép *ý* từ [`../specs/BRD.md`](../specs/BRD.md) §3 và thêm hai cột guide bắt
(`step-by-step-guidance.md` §A10: "Owner luôn là một con người có tên"; §A6: "author ≠ approver").
Nhu cầu đầy đủ của từng vai ở BRD §3 — file này chỉ phục vụ một câu hỏi: **ai được nói "không"**.

---

| ID | Vai | Lợi ích bị ảnh hưởng nhiều nhất | Quyền với cổng (§A6) | Đại diện thật |
|---|---|---|---|---|
| `STK-001` | Bé 6–7 tuổi (người dùng) | tiến độ, động lực, thời gian màn hình | **Không ký được gì** — nhưng mọi thay đổi phải chứng minh bằng test/probe nhìn thấy được, không bằng lời hứa | người giữ repo giữ vai "người phiên dịch" cho bé; nghiệm thu thật = đọc cùng bé |
| `STK-002` | Phụ huynh | dữ liệu của con, quyền xuất/xoá, giới hạn thời gian | Chủ sở hữu quyền **xoá dữ liệu** và **bật cloud**; không phải người duyệt code | `docs/PARENT_MODE.md` + `src/components/parent/` |
| `STK-003` | Giáo viên / trung tâm (thụ động) | file báo cáo nhận về | Không có quyền chặn; chỉ nhận `JSON` xuất từ app | BRD §3 |
| `STK-004` | Người giữ repo / kỹ sư | chất lượng `main`, chi phí bundle, chi phí vận hành | **Duyệt và ký Go/No-Go**; tag; merge `main`. Agent không thay được | `ducmanh2802` |
| `STK-005` | Agent AI (người sửa hộ) | phạm vi việc được làm | **Không** là approver, **không** tự tag, **không** tự thêm dependency, **không** dán dữ liệu của bé (§A10 + `AGENTS.md` §1) | phiên hiện tại, ghi vùng đụng trong `.ai/CURRENT.md` |
| `STK-006` | Nhà trường / cơ quan quản lý dữ liệu | tuân thủ quy định về dữ liệu trẻ em | Ngoài phạm vi bản 1.x (`K/A` — sản phẩm không gửi dữ liệu đi đâu nếu người lớn không bật) | [`../SAFETY_PRIVACY.md`](../SAFETY_PRIVACY.md) |

## 1. Hai quy tắc nối từ bảng này sang cổng

1. **Điều kiện 4 của cổng (§A6): author ≠ approver.** Agent là author của `docs/01-intake/*`,
   `docs/10-operations/*`, `docs/11-decommissioning/*` và của `10_SDLC_GUIDE_MAP.md` ⇒ người duyệt
   bắt buộc là `STK-004`. Bản nháp **không** được tính là đã chốt; baseline phải là commit + tag
   (`docs/SDLC.md` §6).
2. **`STK-001` không tự bảo vệ được mình.** Mọi rule ở `AGENTS.md` §1.8 (chỉ `localStorage`, cloud
   tự nguyện, không log bài của bé) đều là quyền của bé được người lớn thực thi hộ — vì vậy pha 11
   ([`../11-decommissioning/decommission.md`](../11-decommissioning/decommission.md)) là pha **bắt buộc**,
   không phải pha hình thức.

## 2. `SN-xxx` — nhu cầu dẫn tới yêu cầu

Guide §A9 nối `SN-xxx` → `BR-xxx`. Repo không đánh số nhu cầu riêng; BRD §3 đã có cột
"Nhu cầu cốt lõi" và chuỗi truy vết thật của repo chạy `FR-*/NFR-*` → `US-*` → `TC-*`
([`../specs/RTM.md`](../specs/RTM.md)). **Quyết định:** không cắm thêm một tầng ID; khi cần trích dẫn
một nhu cầu, dẫn `BRD.md` §3 kèm tên vai (`STK-00x`). Ghi chú này nằm trong adaptation log ở
[`../lifecycle/10_SDLC_GUIDE_MAP.md`](../lifecycle/10_SDLC_GUIDE_MAP.md) §2.
