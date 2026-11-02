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
| C-01 | `npm run verify` xanh trên commit đang chốt | ĐẠT | `evidence/2026-11-03-QA-RACE/verify-1287.txt` (90 file / 1287 test / EXIT=0 / `Duration 22.09s`, đo 2026-11-03 **đợt bốn** trên working tree = HEAD `eb4b7b2` + bản bỏ cờ `continue-on-error` trong workflow `03` + 1 test hợp đồng `tests/t31-bug-hunt-fixes.test.ts` — **phép đo hiện hành**) · `verify-1286.txt` (90 file / 1286 test / `Duration 22.18s`, đợt ba: HEAD `80c7e39` + bản sửa đề cổng phụ huynh + `tests/t41f-parent-gate.test.ts`) · `verify-1281.txt` (89 file / 1281 test / 22.58 s trên HEAD `8e6f9f5` + test hợp đồng thứ 3, cùng ngày) · `verify-1280.txt` (1280 test / 21.88 s trên `afb9eeb`, cùng ngày) · `evidence/2026-11-02-KBT-ISSUE-43/verify-main-1278.txt` (89 file / 1278 test / EXIT=0 trên HEAD `main`, đo 2026-11-02 23:39 + chạy lại sau commit — SHA ghi ở `07_RELEASE_OPERATIONS.md` §3.4) · `verify-rc.txt` (89/1277 trên RC `3d06930`) · chạy lại ngay trước push `2d2ca27`: EXIT=0 · 90 file / 1286 test · `Duration 25.61s` (`Duration` dao động theo tải máy, còn số test và entry `index-TgwkX59u.js` 204.2 kB thì giữ nguyên) · pre-push `eb4b7b2`: `verify:quick` EXIT=0 · 90 file / 1286 test · `Duration 22.17s` | — |
| C-02 | Bundle dưới trần | ĐẠT | entry 204.2 kB ≤ 450 kB mục tiêu; boot graph 418.6 kB | — |
| C-03 | SRS có cột ưu tiên (priority) cho FR | **MỘT PHẦN** | `docs/specs/SRS.md` không có cột priority | người giữ repo · 2026-12-31 (cùng đợt rà FR) |
| C-04 | Characterization test commit **trước** đợt refactor đầu tiên | **MỘT PHẦN** | `tests/t39-first-load-graph.test.ts` viết cùng commit với refactor | agent · đợt refactor kế tiếp (90 ngày, mục 2.1) |
| C-05 | Nightly chạy full suite + probe + ablation | **CHƯA** | 4 workflow hiện chạy theo push/PR/tag | người giữ repo · 2027-01-31 (`09` §4 mục 3.2) |
| C-06 | Lịch contract cho field đã bỏ trong schema | **CHƯA** | `MIGRATIONS` chỉ có chiều expand | agent T41D · 2026-12-31 |
| C-07 | Gate tự động chặn chuỗi dữ liệu trẻ lọt ra output agent | **MỘT PHẦN** | hiện là advisory: `AGENTS.md` §1.7 + `progress/` gitignore + ảnh evidence dùng hồ sơ giả | người giữ repo · **trước khi** bật cloudSync mặc định |
| C-08 | Mutation testing tự động | **CHƯA** | mới có 5 phép ablation thủ công (`TEST_CASES.md` §4, M1…M4) | người giữ repo · cần quyết định thêm dependency |
| C-09 | Mọi FR có US + TC | **MỘT PHẦN** | 6 US / 42 TC cho **hai** lát cắt; các FR còn lại dừng ở cấp FR (xem `RTM.md` §9 rule 5 về lệch tổng FR) | agent · 60 ngày (`09` §3 mục 2.1) |
| C-10 | Đã phát hành ít nhất một release | **ĐÃ** | `git tag \| wc -l` = **1** (`4f75f5d` → `77d90ce`) **và** `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` ⇒ id `431754261`, `draft false`, asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte (đo 2026-11-03) | `v1.1.0` đóng trên HEAD `main` mà cổng máy + cổng CI chặn merge đều xanh; người dùng ra "tự động chọn khi tôi không ở đây" nên agent thao tác merge + tag. **Chữ ký Go/No-Go vẫn trống** (§3: quyền duy nhất của người giữ repo) và `3. Browser QA` đỏ ở bước `QA probe` **trên chính commit được tag** — race overlay chúc mừng đã sửa ở `afb9eeb` (gate xanh lần đầu, run 41501753363) nhưng bản sửa đến **sau** tag, và chính gate đó **đỏ lại** ở run 41504913606 trên `8e6f9f5` (docs-only) ⇒ **intermittent** ⇒ release kỹ thuật, chưa phải release nghiệm thu. **Đợt ba (cùng ngày):** nguyên nhân thật đã bắt được — `ParentDashboardModal` vẽ một **đề mồi cố định** ở khung hình đầu rồi mới sinh đề thật trong `useEffect` (chạy sau paint), nên ai đọc sớm trả lời sai và bảng phụ huynh không mở; sửa trong `src/` + helper `unlockParentDashboard` (probe phải xác nhận cổng đã đóng), khoá bằng `tests/t41f-parent-gate.test.ts`; trên máy, `golden-path` **4/4 lần liên tiếp** `QA PASS — 28 step(s), 0 errors`. **CI đã chạy lại trên đúng commit chứa bản sửa và xanh**: `2d2ca27` · run 41515106575 · check-run 125516556497 `success` (bước 7 "QA probe" success sau 66 s, bước 8 skipped); lượt thứ hai `c9fd2b4` run 41516820864 (job 125522382222, 127 s) và lượt thứ ba `eb4b7b2` run 41518983585 (job 125529796579, bước 7 success sau 69 s, bước 8 skipped) ⇒ **ba lượt xanh liên tiếp**, đủ điều kiện đã chốt ở `07` §2 để **bỏ `continue-on-error`** — cờ **đã bị xoá** trong commit `3b0122c` (kèm test hợp đồng trong `tests/t31-bug-hunt-fixes.test.ts` cấm cờ quay lại), và **hai lượt CI đầu tiên chạy không còn lưới đều xanh**: `3b0122c` · run 41523226603 · job 125544242836 `success` sau 69 s, rồi `6e30794` (chỉ docs) · run 41526285381 · job 125554732285 `success` sau 72 s, bước 7 "QA probe" `success`, bước 8 `skipped` ⇒ cổng đạt **6/12 lượt xanh**, năm lượt cuối liên tiếp — từ đây probe đỏ làm đỏ cả run. Xem `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §6–§12. Ô này chỉ thật sự đóng khi tag `v1.1.0` được chuyển tới commit đó (việc của người giữ repo). Tag đầu ở `7d92246` đã xoá vì `4. Release` chết ở Install — tag một mình **không** phải bằng chứng đã phát hành. Xem `07` §2 + §3.4 + `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt`. |
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
