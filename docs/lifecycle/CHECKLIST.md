# CHECKLIST — Audit cổng cuối khoá
## Không còn dòng FAIL; mọi "một phần" có owner + hạn · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Cách đọc:** `ĐẠT` = có bằng chứng mở được + lệnh tái lập. `MỘT PHẦN` / `CHƯA` = phải có owner
và hạn ở cột cuối. **Không có dòng `FAIL`** — một thứ *đang hỏng* thì hoặc đã sửa, hoặc được ghi
thành nợ có chủ (D-x ở [`08_MAINTENANCE_EVOLUTION.md`](08_MAINTENANCE_EVOLUTION.md) §5), không để
FAIL treo.

---

## 1. Sáu tiêu chí nghiệm thu cuối khoá

| # | Tiêu chí | Trọng số | Mức đạt | Kết quả | Cách kiểm (đã chạy) |
|---|---|---|---|---|---|
| A | Đủ artifact | 20% | 8/8 đúng thư mục, có owner + ngày | **ĐẠT** | `ls docs/lifecycle/*.md \| wc -l` = 12 — 9 file đánh số `01`…`09` + README + 2 phụ lục (`CHECKLIST`, `HARNESS`), mỗi file có dòng Owner/Ngày |
| B | Truy vết | 20% | BR → FR → US → TC → evidence liền mạch | **MỘT PHẦN** | `RTM.md` §10 (**hai** lát cắt liền mạch: 42 TC) + §2 (FR tới cấp FR) — các FR còn lại chưa xuống tầng TC; không ghi "còn 83 FR" vì tổng FR khai báo (88) lệch số dòng FR thật trong `SRS.md` (89), xem `RTM.md` §9 rule 5 |
| C | Checklist | 20% | 0 Fail; Partial có owner + hạn | **ĐẠT** | chính file này, §2 |
| D | Bằng chứng | 20% | log/ảnh mở được, tái lập được | **ĐẠT cho lát cắt** | [`evidence/README.md`](../../evidence/README.md) §3 — catalog hai đợt (`2026-11-02-T41C`, `2026-11-02-KBT-ISSUE-43`), mỗi file có lệnh tái lập |
| E | Prompt tái dùng | 10% | nằm trong repo, người khác chạy lại được | **ĐẠT** | [`../prompts/`](../prompts/) — 4 thẻ prompt + context pack |
| F | Harness | 10% | ≥1 skill, ≥1 sub-agent, memory gọn | **ĐẠT** | [`HARNESS.md`](HARNESS.md) — 2 skill + 1 sub-agent trong repo, memory 3 + 5 dòng |

## 2. Checklist chi tiết

| ID | Mục | Trạng thái | Bằng chứng | Owner · hạn (nếu chưa đạt hẳn) |
|---|---|---|---|---|
| C-01 | `npm run verify` xanh trên commit đang chốt | ĐẠT | `evidence/2026-11-02-KBT-ISSUE-43/verify.txt` (88 file / 1272 test / EXIT=0, đo 2026-11-02) · `evidence/2026-11-02-T41C/verify.txt` | — |
| C-02 | Bundle dưới trần | ĐẠT | entry 204.2 kB ≤ 450 kB mục tiêu; boot graph 418.5 kB | — |
| C-03 | SRS có cột ưu tiên (priority) cho FR | **MỘT PHẦN** | `docs/specs/SRS.md` không có cột priority | người giữ repo · 2026-12-31 (cùng đợt rà FR) |
| C-04 | Characterization test commit **trước** đợt refactor đầu tiên | **MỘT PHẦN** | `tests/t39-first-load-graph.test.ts` viết cùng commit với refactor | agent · đợt refactor kế tiếp (90 ngày, mục 2.1) |
| C-05 | Nightly chạy full suite + probe + ablation | **CHƯA** | 4 workflow hiện chạy theo push/PR/tag | người giữ repo · 2027-01-31 (`09` §4 mục 3.2) |
| C-06 | Lịch contract cho field đã bỏ trong schema | **CHƯA** | `MIGRATIONS` chỉ có chiều expand | agent T41D · 2026-12-31 |
| C-07 | Gate tự động chặn chuỗi dữ liệu trẻ lọt ra output agent | **MỘT PHẦN** | hiện là advisory: `AGENTS.md` §1.7 + `progress/` gitignore + ảnh evidence dùng hồ sơ giả | người giữ repo · **trước khi** bật cloudSync mặc định |
| C-08 | Mutation testing tự động | **CHƯA** | mới có 5 phép ablation thủ công (`TEST_CASES.md` §4, M1…M4) | người giữ repo · cần quyết định thêm dependency |
| C-09 | Mọi FR có US + TC | **MỘT PHẦN** | 6 US / 42 TC cho **hai** lát cắt; các FR còn lại dừng ở cấp FR (xem `RTM.md` §9 rule 5 về lệch tổng FR) | agent · 60 ngày (`09` §3 mục 2.1) |
| C-10 | Đã phát hành ít nhất một release | **CHƯA** | `git tag \| wc -l` = 0 (đo lại 2026-11-02) | người giữ repo · 30 ngày (`09` §2 mục 1.1). Người dùng đã đồng ý tag `v1.1.0`; **hồ sơ đóng sẵn** ở `07` §3.4, chỉ còn mở PR → squash vào `main` → tag HEAD của `main`. Agent không tự tag (§3: "không ký, không tự tag"). |
| C-11 | Restore drill R-1 trên build thật | **CHƯA** | mới có test mock trong `tests/parent-and-demo.test.ts` | agent + người xem ảnh · 30 ngày (`09` §2 mục 1.2) |
| C-12 | UAT với phụ huynh thật | **CHƯA** | `TEST_CASES.md` §5 ghi `NotRun` kèm lý do | người giữ repo · 90 ngày (`09` §4 mục 3.3) |
| C-13 | 0 test mồ côi / 0 probe vô chủ | ĐẠT | `RTM.md` §6–§7 | — |
| C-14 | Bất biến đăng ký trò chơi 4 nơi | ĐẠT | 31 = 31 = 31 = 31, khoá bằng `tests/t23-mcp-servers.test.ts` | — |
| C-15 | Hook cục bộ cài được bằng một lệnh | ĐẠT | `npm run hooks:install` · 3 hook trong `scripts/hooks/` | — |
| C-16 | Tài liệu không chứa số chưa đo | ĐẠT | `measure.mjs` exit 0 sau đợt này; số nào cũng kèm lệnh | — |
| C-17 | Tài liệu tiếng Việt không lẫn codepoint ngoại lai | ĐẠT | VI-TEXT exit 0 trên `docs/lifecycle`, `docs/plan`, `evidence` | — |
| C-18 | Không có secret trong repo | ĐẠT (có giải thích) | `.env.example` khai "không biến nào bắt buộc"; `firebase-applet-config.json` chứa **API key web public** theo thiết kế Firebase và được `firestore.rules` chặn `request.auth.uid == userId` (ADR-16) — **không** có service account / private key nào | — |
| C-19 | `package-lock.json` còn nguyên | ĐẠT | đo 2026-11-02 (lane khác từng xoá 2 lần: `3727f04`, `fd3e7da`) | người giữ repo · kiểm mỗi phiên |
| C-20 | AI không có quyền ký go/no-go | ĐẠT | `02` §1 + `07` §3 ghi rõ | — |

**Đếm:** 20 mục — **10 ĐẠT · 5 MỘT PHẦN · 5 CHƯA · 0 FAIL.**
Lệnh kiểm: `grep -c "^| C-" docs/lifecycle/CHECKLIST.md` = 20; `grep -c "FAIL" docs/lifecycle/CHECKLIST.md` đếm
cả phần hướng dẫn, nên đếm theo cột trạng thái.

## 3. Điều kiện để một dòng được chuyển ĐẠT

1. Có **file bằng chứng** trong `evidence/` hoặc test/probe chạy được, không mô tả suông.
2. Có **lệnh tái lập** ghi ngay cạnh số.
3. Người duyệt khác với người viết (rule G-2 ở `05` §4).
4. Không xoá dòng CHƯA khi báo cáo — để lại, vì bảng đầy đủ là thông điệp, bảng đẹp là trang điểm.
