# Intent — tại sao dự án này tồn tại
## Pha 1 (Intake) · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày:** 2026-11-03 ·
**Ánh xạ:** `docs/step-by-step-guidance.md` §A5 (phase 1) + Phase 1 của Part B ·
**Không trùng lặp:** bản đầy đủ điều kiện nằm ở [`../specs/BRD.md`](../specs/BRD.md); file này chỉ ghi
**ý định** và **ranh giới** để một phiên mới đọc là hiểu, không phải đặc tả.

---

## 1. Mục tiêu nghiệp vụ — **không** lập sổ song song

`step-by-step-guidance.md` §A9 gọi nhóm này là `BO-xxx`. Repo đã có sổ rồi: **`BG-01`…`BG-06`** trong
[`../specs/BRD.md`](../specs/BRD.md) §2, kèm thước đo, ngưỡng chấp nhận và hiện trạng. Vì vậy bảng dưới
chỉ làm **phép ánh xạ prefix** (guide → repo), không chép lại nội dung — chép lại là tạo nguồn thứ hai,
và hai nguồn sẽ lệch nhau ngay ở lần sửa đầu tiên (§C2 của guide).

| Prefix guide §A9 | ID thật trong repo | Nơi khai báo |
|---|---|---|
| `BO-xxx` | `BG-01` … `BG-06` | [`../specs/BRD.md`](../specs/BRD.md) §2 |
| `STK-xxx` / `SN-xxx` | bảng "Vai trò / Nhu cầu cốt lõi" | [`../specs/BRD.md`](../specs/BRD.md) §3 + [`stakeholders.md`](stakeholders.md) (đánh số `STK-001`… cho Bên cần biết, vì BRD chưa có ID) |
| `BR-xxx` | mục §1 "Vấn đề nghiệp vụ" + §5 "Ràng buộc nghiệp vụ" (chưa đánh số) | [`../specs/BRD.md`](../specs/BRD.md) |
| `SRC-xxx` | — | [`sources.md`](sources.md) (Mới, đợt này) |

**Ba mục tiêu dễ hiểu nhầm khi đọc sang từ kit:**

1. `BG-01` ("bé tự học 15–20 phút/ngày") **không đo được từ xa** — `ADR-01` local-first, không telemetry.
   Guide §A6 đòi "evidence mở được"; evidence cho mục tiêu này là **test + probe trên máy**, không phải số liệu người dùng.
2. `BG-05` ("phụ huynh tin tưởng về dữ liệu") nghiệm thu bằng **cơ chế**: mặc định `localStorage`, cloud chỉ
   bật sau khi người lớn tự đăng nhập — xem [`../11-decommissioning/decommission.md`](../11-decommissioning/decommission.md).
3. `BG-04` ("dùng được trên điện thoại gia đình, offline") là mục tiêu **duy nhất** có cổng tự động
   (`qa/*.mjs` chạy trên `dist/` thật), nên nó là mục tiêu hay bị đỏ nhất khi sửa UI.

## 2. Trong phạm vi / ngoài phạm vi (cố ý)

**Trong:** một app học lớp 1 chạy trong trình duyệt — Toán, Tiếng Việt, Tiếng Anh (Kid's Box), luyện đọc,
thi thử, trò chơi có bậc độ khó, động lực (sao/XP/cây/sticker), màn hình ba mẹ.

**Ngoài phạm vi (cố ý loại, xem [`../specs/BRD.md`](../specs/BRD.md) §4.2):** phòng chat, người lạ, quảng
cáo, nạp tiền, bắt đăng nhập, backend riêng, telemetry tập trung, quản trị nhiều trường/lớp.

## 3. Ràng buộc không thương lượng

1. `AGENTS.md` §1: không nói "xong" khi chưa chạy `npm run verify`; sửa UI phải có bằng chứng nhìn thấy được.
2. `AGENTS.md` §2: một trò chơi phải xuất hiện đủ **4 nơi**; builder dữ liệu phải tất định theo `(tier, seed)`;
   main chunk ≤ 600 kB (mục tiêu 450 kB); không import `three`/`firebase` thẳng vào entry.
3. `AGENTS.md` §3: toàn bộ text tiếng Việt có dấu, câu ngắn, nút ≥ ~44 px, mọi lượt có phản hồi âm thanh + hình.
4. `ADR-01` (local-first, không telemetry) ⇒ mọi số liệu vận hành chỉ đọc được trên máy người dùng —
   điều này định hình cả pha 10 (xem [`../10-operations/runbook.md`](../10-operations/runbook.md)).

## 4. Vì sao một số artifact chuẩn quốc tế ở đây là K/A

| Artifact chuẩn | Lý do `K/A` (một dòng, theo `step-by-step-guidance.md` §A8) |
|---|---|
| `openapi.yaml` | sản phẩm không tự định nghĩa HTTP API; lớp cloud là Firestore SDK, shape do `src/services/cloudMerge.ts` quy định và có test |
| phỏng vấn `SRC-*` | một người lớn vừa là owner vừa là BA; không có vòng elicitation với khách hàng bên ngoài |
| dashboard/alerts inventory | `ADR-01` — không telemetry, không server riêng ⇒ không có SLO machine để canh |
| `diagrams/*.drawio` | sơ đồ viết bằng markdown/mermaid ngay trong `ARCHITECTURE.md` — review được bằng diff; quyết định tailoring ghi ở [`../lifecycle/10_SDLC_GUIDE_MAP.md`](../lifecycle/10_SDLC_GUIDE_MAP.md) §6 |

## 5. Điều kiện để file này được coi là đủ

Mỗi `BO-*` phải trỏ được tới một tài liệu hoặc một test mở được. Thêm mục tiêu mới ⇒ thêm dòng ở đây
**trước**, rồi mới xuống `BRD.md` → `SRS.md` → `RTM.md` (chuỗi truy vết đi xuống, không đi ngang).
