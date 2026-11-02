# 03 — Requirements Chain
## Chuỗi yêu cầu có hai cổng duyệt · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Đầu vào:** [`BRD.md`](../specs/BRD.md) → [`SRS.md`](../specs/SRS.md) → [`RTM.md`](../specs/RTM.md) →
[`TEST_CASES.md`](../plan/TEST_CASES.md) → [`evidence/`](../../evidence/README.md)

---

## 1. Chuỗi

```
BR (nghiệp vụ)          BG-01 … BG-06 + R-01 … R-08        docs/specs/BRD.md
   │  2 cổng duyệt: (1) BR vào được BRD, (2) FR/NFR vào được SRS
   ▼
FR / NFR / DC           88 FR · 25 NFR · 19 DC             docs/specs/SRS.md
   │
   ▼
US (câu chuyện)          US-01 … US-05, AC 3 nhánh          docs/plan/TEST_CASES.md §2
   │
   ▼
TC (ca kiểm thử)         TC-01 … TC-29 + verdict            docs/plan/TEST_CASES.md §3
   │
   ▼
evidence (bằng chứng)    test · probe · ảnh · log           evidence/2026-11-02-T41C/
```

Hai chiều ngược lại chạy ở `RTM.md` §6 (probe → yêu cầu) và §7 (test → yêu cầu): **0 probe vô chủ,
0 test mồ côi**.

## 2. Chín đặc tính của một yêu cầu tốt — tự kiểm

| Đặc tính | Đạt chưa | Cách kiểm trong repo |
|---|---|---|
| Có nguồn | Có | cột "Nguồn (`file:line`)" trong `RTM.md` §2 |
| Kiểm chứng được | Có | mỗi FR có cột Test hoặc Probe; không có ô "sẽ test" |
| Rõ, một nghĩa | Phần lớn | prose tiếng Việt ngắn; FR-N04/FR-P08 phải viết lại vì phụ thuộc nguồn giáo trình |
| Đủ (complete) | Có | 88 FR phủ 6 BR; BG-01 được ghi là *không đo được* thay vì bỏ trống |
| Nhất quán | Có | RTM §7 phát hiện test không phục vụ yêu cầu nào |
| Có thể thay đổi (modifiable) | Có | mỗi FR một dòng, sửa một dòng không kéo theo dòng khác |
| Có ưu tiên | Không | **thiếu** — SRS không có cột priority; xem `CHECKLIST.md` C-03 |
| Xác định được kích thước | Có | NFR có số đo (kB, ms, phút) |
| Traceable | Có (lát cắt) | chuỗi BR→FR→US→TC→evidence liền mạch ở `RTM.md` §10 |

## 3. Mẫu đặc tả đã dùng

**EARS cho hành vi hệ thống** (FR-R04, đo được, có nguồn):

> Khi bé hoàn thành một buổi đọc có `sessionId` chưa từng gập vào hồ sơ, hệ thống phải cộng
> attempts và accuracy của từng kỹ năng đúng một lần.

**AC ba nhánh** — ví dụ US-01, nguyên văn ở `TEST_CASES.md` §2:

| Nhánh | Nội dung | TC |
|---|---|---|
| Chính | màn mới hoặc phá kỷ lục ⇒ cộng đúng phần chênh Sao + XP | TC-19, TC-13 |
| Biên | chơi lại không phá kỷ lục ⇒ `+0 Sao` nhưng vẫn `+XP` | TC-20 |
| Lỗi | cùng một lượt gửi hai lần ⇒ lần hai trả 0 và màn hình nói "đã nhận ở lượt trước" | TC-11, TC-21 |

**NFR có số đo + căn cứ**:

| ID | Số đo | Căn cứ | Enforce |
|---|---|---|---|
| NFR-P01 | main chunk ≤ 600 kB, mục tiêu 450 kB; hiện **204.2 kB** | thiết bị gia đình 3G/4G yếu | `npm run check:budget` trong `verify` |
| NFR-M01 | một ngày học 15–20 phút | khung tập trung của trẻ lớp 1 | `src/config/policy.ts` (693 dòng, 17 export) |
| NFR-R04 | idempotency 5 tầng, làm lại thao tác không tăng thưởng | tiến độ sai làm phụ huynh mất niềm tin | 25 test trong `tests/t41c-idempotency.test.ts` |

## 4. Baseline & change request

- **Baseline hiện hành:** commit `d54f341` (2026-11-02). SRS/RTM/TEST_CASES chốt tại đây.
- **Change request:** một yêu cầu mới phải đi qua `impact analysis 6 chiều` trước khi code —
  mẫu và ví dụ thật ở [`08_MAINTENANCE_EVOLUTION.md`](08_MAINTENANCE_EVOLUTION.md) §2.
- **Ví dụ CR đã xảy ra thật:** T41C đổi hành vi đã ghi ở SRS (chấp nhận bản ghi trùng trước đây
  là "lượt thật") ⇒ phải sửa NFR-R04 và thêm 25 test trong cùng đợt, không sửa code trước.

## 5. Hai cổng duyệt — ai ký, ký cái gì

| Cổng | Người ký | Từ chối khi |
|---|---|---|
| **Cổng 1 — Requirements → Baseline** | người giữ repo | FR không có nguồn, không viết được thành lệnh/bước bấm, hoặc NFR không có số đo |
| **Cổng 2 — Spec → Plan/Tasks** | người giữ repo | chưa có TC nào trỏ tới AC; plan giao cho agent mà không có điểm khôi phục |

Cả hai cổng đều **không** delegate cho agent — đó là phần "quyết định" mà `02_AI_USAGE_CHARTER.md`
giao cho người.
