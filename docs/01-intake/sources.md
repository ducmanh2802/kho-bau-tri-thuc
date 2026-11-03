# Sources — nguồn thật của mọi tuyên bố (`SRC-xxx`)
## Pha 1 (Intake) · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày:** 2026-11-03
**Vì sao có file này:** `step-by-step-guidance.md` §A6 buộc mỗi tuyên bố trỏ tới "evidence mở được",
và §A9 định nghĩa `SRC-xxx` là nguồn của `BR-xxx`. Repo chưa từng liệt kê nguồn ra một chỗ — nguồn
nằm rải trong 30+ file `docs/`. File này là **danh mục trỏ**, không chép nội dung.

---

## 1. Nguồn trong repo (mở được bằng lệnh, không cần mạng)

| ID | Nguồn | Dùng cho | Cách mở |
|---|---|---|---|
| `SRC-001` | [`../../AGENTS.md`](../../AGENTS.md) | mệnh lệnh bắt buộc, bất biến kiến trúc, cam kết dữ liệu trẻ | `cat AGENTS.md` |
| `SRC-002` | [`../SDLC.md`](../SDLC.md) | quy trình 6 giai đoạn, gate tự động, DoD, phát hành, MCP | `sed -n '1,60p' docs/SDLC.md` |
| `SRC-003` | [`../specs/BRD.md`](../specs/BRD.md) | `BG-01`…`BG-06`, phạm vi, ràng buộc, rủi ro nghiệp vụ, chi phí vận hành | mở file |
| `SRC-004` | [`../specs/SRS.md`](../specs/SRS.md) | `FR-*` / `NFR-*`, khung ISO/IEC/IEEE 29148 (khai ở đầu file) | mở file |
| `SRC-005` | [`../specs/ARCHITECTURE.md`](../specs/ARCHITECTURE.md) | SAD + ADR inline + bảng chunk và nợ kỹ thuật | mở file |
| `SRC-006` | [`../specs/RTM.md`](../specs/RTM.md) | truy vết hai chiều FR→US→TC, §9 rule (kể cả rule về số FR lệch nhau) | mở file |
| `SRC-007` | [`../CURRICULUM_MAP.md`](../CURRICULUM_MAP.md) | 12 chủ điểm Tiếng Việt + 12 chủ điểm Toán (nền của mọi nội dung) | mở file |
| `SRC-008` | [`../CONTENT_GUIDE.md`](../CONTENT_GUIDE.md) | chuẩn chính tả/dấu thanh/định dạng đề, mốc GDPT | mở file |
| `SRC-009` | [`../SAFETY_PRIVACY.md`](../SAFETY_PRIVACY.md) | nguyên tắc child-first, không quảng cáo, không IAP, local-first | `cat docs/SAFETY_PRIVACY.md` |
| `SRC-010` | [`../PARENT_MODE.md`](../PARENT_MODE.md) + [`../ENGLISH_KIDBOX_PARENT_MODE.md`](../ENGLISH_KIDBOX_PARENT_MODE.md) | quyền phụ huynh: gate, xuất, đặt lại, giới hạn thời gian | mở file |
| `SRC-011` | [`../LEARNING_ENGINE.md`](../LEARNING_ENGINE.md) + [`../P39_LEARNING_OS_DECISION_ENGINE.md`](../P39_LEARNING_OS_DECISION_ENGINE.md) | machine trạng thái phiên học + bộ quyết định | mở file |
| `SRC-012` | [`../GAME_DESIGN.md`](../GAME_DESIGN.md) + [`../cotuong.md`](../cotuong.md) + [`../covua.md`](../covua.md) + [`../olypictienganh.md`](../olypictienganh.md) | thiết kế trò chơi và ba màn chuyên sâu | mở file |
| `SRC-013` | [`../MASTER_BASELINE.md`](../MASTER_BASELINE.md) (2026-10-05) | ba lỗi P0 gốc rễ và trạng thái baseline **trước khi sửa** — bằng chứng lịch sử, không phải hiện trạng | `sed -n '1,30p' docs/MASTER_BASELINE.md` |
| `SRC-014` | [`../MASTER_ROADMAP.md`](../MASTER_ROADMAP.md) · [`../PRODUCT_SPEC.md`](../PRODUCT_SPEC.md) | lộ trình và đặc tả sản phẩm cấp cao | mở file |
| `SRC-015` | [`../plan/TASK_PLAN.md`](../plan/TASK_PLAN.md) · [`../plan/TEST_PLAN.md`](../plan/TEST_PLAN.md) · [`../plan/TEST_CASES.md`](../plan/TEST_CASES.md) | WBS/mã `T<NN>`, năm lớp test, `TC-xx` | mở file |
| `SRC-016` | [`../lifecycle/`](../lifecycle/README.md) (10 file) + [`../prompts/`](../prompts/README.md) (6 file) | bảng bằng chứng, charter AI, harness, thẻ prompt tái dùng | `ls docs/lifecycle docs/prompts` |
| `SRC-017` | [`../../evidence/`](../../evidence/README.md) | output lệnh nguyên văn + ablation `*-RED.txt` + screenshot theo đợt | `ls evidence` |
| `SRC-018` | `../../firestore.rules` + `../../firebase-applet-config.json` | luật chắn chéo tài khoản và config applet cloud | `cat firestore.rules` |
| `SRC-019` | [`../step-by-step-guidance.md`](../step-by-step-guidance.md) | **guide 11 pha** đang được triển khai — bản của kit, lane khác thả vào, chưa được git theo dõi | `git status --short` ⇒ `?? docs/step-by-step-guidance.md` |

## 2. Nguồn ngoài repo

| ID | Nguồn | Status trong dự án này |
|---|---|---|
| `SRC-101` | ISO/IEC/IEEE 29148 (requirements writing) | `SRS.md` khai lấy khung mục 4–6; **không** có bản chuẩn trong repo ⇒ đối chiếu theo trí nhớ tài liệu, cần người duyệt khi tuyên bố "tuân thủ" |
| `SRC-102` | IEEE 829 / ISO/IEC/IEEE 29119 (test documentation) | khung của `TEST_PLAN.md`; cùng hạn chế như `SRC-101` |
| `SRC-103` | IEEE 1028 (review) | review 4 lớp trong `docs/prompts/REVIEW_4LAYER.md` |
| `SRC-104` | Chương trình GDPT 2018 lớp 1 (Việt Nam) | nền của `SRC-007`/`SRC-008`; văn bản chuẩn **không** cất trong repo |
| `SRC-105` | Appendix C của [`../step-by-step-guidance.md`](../step-by-step-guidance.md) — bộ chuẩn guide liệt kê (IEEE 1016-2009, ISO/IEC/IEEE 24748-5, ISO 21511, ISO/IEC 42010, 25010, UML 2.0) | chưa một file nào trong repo trích dẫn từng điều khoản ⇒ ghi `K/A` cho tới khi có người đối chiếu (đừng viết "đạt chuẩn" chỉ vì dùng đúng template) |

## 3. Ba điều cấm (nguồn nào **không** được dùng)

1. **Không trích kết quả MCP làm bằng chứng.** `mcp/` là manh mối; chỉ lệnh chạy thật trong phiên mới
   được ghi (`AGENTS.md` §1.7).
2. **Không dùng dữ liệu bài làm của bé** (kể cả ảnh chụp màn hình có tên/diễn biến) trong tài liệu,
   Issue hay chat (`AGENTS.md` §1.8).
3. **Không dùng số của một build hỏng** làm số hiện trạng, và **không đổi số trong dòng lịch sử** —
   số hiện trạng sống ở dòng mới (`kho-bau-measure-sync` rule 1; `SRC-013` là ví dụ một hồ sơ quá khứ
   phải để nguyên).
