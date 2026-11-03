# BỘ TÀI LIỆU ĐẶC TẢ — KHO BÁU TRI THỨC LỚP 1

Bốn tài liệu ở `docs/specs/` + hai tài liệu kế hoạch ở `docs/plan/` mô tả **toàn bộ vòng đời**
của sản phẩm, từ nghiệp vụ tới từng test. Đọc theo thứ tự dưới đây nếu bạn mới vào repo.

| # | Tài liệu | Trả lời câu hỏi | Dài bao nhiêu |
|---|---|---|---|
| 1 | [`BRD.md`](BRD.md) | *Tại sao làm, làm gì, không làm gì, thành công đo thế nào?* | 6 mục tiêu BG, 8 rủi ro, Business DoD |
| 2 | [`SRS.md`](SRS.md) | *Phần mềm phải làm gì, đạt ngưỡng nào?* | 88 FR · 25 NFR · 19 DC · 11 IF |
| 3 | [`ARCHITECTURE.md`](ARCHITECTURE.md) | *Ghép như thế nào, dữ liệu đi đâu, vì sao chọn vậy?* | 18 ADR, sơ đồ tầng + luồng dữ liệu |
| 4 | [`RTM.md`](RTM.md) | *Yêu cầu nào được chứng minh ở đâu? Test nào không phục vụ gì?* | ma trận xuôi + ngược, tổng kết độ phủ |
| 5 | [`../plan/TASK_PLAN.md`](../plan/TASK_PLAN.md) | *Đã làm gì (P25→P43) và sẽ làm gì tiếp (EP-A…EP-F)?* | WBS 12 gói, 4 milestone |
| 6 | [`../plan/TEST_PLAN.md`](../plan/TEST_PLAN.md) | *Kiểm bằng lớp nào, chạy lệnh nào, khi nào xanh?* | 5 lớp, 30 probe, bảng "đổi gì → chạy gì" |
| 7 | [`../plan/TEST_CASES.md`](../plan/TEST_CASES.md) | *Ca kiểm thử nào, AC nguồn ở đâu, verdict gì?* | 6 US · 42 TC · 4 phép ablation · exit criteria viết trước |

## Quy ước chung của bộ tài liệu

1. **Chỉ số liệu đo được.** Mọi con số (31 trò chơi, 475 câu thi, 1377 test / 100 file,
   210.9 kB entry + 425.2 kB boot graph, 8 dependency runtime, 19 key…) đo ngày **2026-11-03** — lần cuối
   ngay sau **T43** (một defect: `resetProgress()` chỉ quét 13/17 khoá nên "Đặt lại tiến độ" để sót
   `review_days` + `game_first_seen` + `tree_water` — `DEF-001` trong `docs/plan/RISK_REGISTER.md`;
   1 file test mới `tests/t43a-reset-progress-sweeps-child-data.test.ts` (5 test; RED 4 failed → GREEN);
   không thêm key, không thêm service module (vẫn **42**); `src/services/storage.ts` đổi nên entry
   **đổi cả hash lẫn kB** — bằng chứng `evidence/2026-11-03-T43/`),
   đợt **T42** liền trước (tám defect một đợt, bảy file test: chọn màn không còn in sao "đã chơi", thẻ *Đôi Tai Thính* luôn giữ
   đáp án, bẫy focus không cướp con trỏ khi bé đang gõ, đọc `localStorage` hỏng không xoá cả danh sách ôn,
   hợp nhất cloud theo đồng hồ `stateTouchedAt` thay vì `lastActiveDate`, bài "cộng/trừ một chữ số trong
   phạm vi 100" bỏ phép có nhớ/có mượn, lưới đề dựng lại ngay khi đổi màn thay vì qua `useEffect`, và hẹn giờ
   của bài thi thử phải được xoá lúc rời màn:
   7 file test mới `tests/t42a-tier-picker-honest` (5) · `t42b-listen-pick-answer` (4) ·
   `t42c-focus-trap-typing` (4) · `t42d-corrupt-storage-guard` (12) · `t42e-resource-touch-clock` (11) ·
   `t42f-digit-lesson-no-carry` (5) · `t42g-late-state-timers` (4) ⇒ 45 test; **không** thêm service module,
   không thêm file trong `src/services/`; hash và kB của lượt đo đó **không trích lại ở đây** vì quy ước này
   chỉ giữ **một** bộ số hiện trạng — cần thì mở `evidence/2026-11-03-T42/verify.txt`);
   đợt **T41D** ngay trước đó (phép hợp nhất hồ sơ cloud với tiến độ của máy khác và race đăng xuất/đổi tài khoản
   giữa lúc kéo cloud: thêm `src/services/cloudMerge.ts` ⇒ **42** service module, entry và số test của
   lượt đo đó ghi ở `evidence/2026-11-03-T41D/` — không trích lại ở đây vì quy ước này chỉ giữ **một**
   bộ số hiện trạng),
   2 file test mới `tests/t41d-cloud-merge.test.ts` (28) + `tests/t41d-cloud-sync-race.test.ts` (12)); các đợt đo trước cùng ngày: bỏ cờ `continue-on-error` của job
   "3. Browser QA" (commit `3b0122c`, 1 test hợp đồng mới trong `tests/t31-bug-hunt-fixes.test.ts`
   ⇒ 1287 test, `src/` không đổi nên entry giữ nguyên hash), sửa "đề cổng phụ huynh vẽ muộn hơn khung
   hình đầu" (5 test mới `tests/t41f-parent-gate.test.ts` ⇒ 1286 test, `src/` đổi nên entry **đổi hash**
   dù kB không đổi), và
   sửa race màn chúc mừng lên cấp trong `qa/lib.mjs` rồi khoá bước
   "QA probe" của workflow `03` bằng `tee probe-run.log` (3 test hợp đồng mới trong
   `tests/t31-bug-hunt-fixes.test.ts`, khi đó `src/` không đổi nên hash entry giữ nguyên); lần đo
   trước đó là **2026-11-02**, ngay sau merge release `7365830` (nhánh KBT-ISSUE-43 vào `main`) kèm bản sửa flake theo giờ trong
   `tests/fatigue-reset.test.ts`: hai test "không reset" lấy `Date.now()` làm mốc nên khi suite chạy
   trong 30 phút trước nửa đêm, `now` rơi sang **ngày hôm sau** và quy tắc đổi ngày kích hoạt —
   code đúng, test đỏ; nay neo mốc giữa trưa + một ca mới chứng minh "đổi ngày là lý do reset độc lập")
   và merge `09511d3` (engine cờ vua tối ưu + `tests/chess-engine-performance.test.ts` 5 test) kế tiếp
   KBT-ISSUE-43 (nút Tạm dừng trò chơi: đồng hồ gom về `useGameStage`, thêm `tests/t43-game-pause.test.ts`
   30 test và probe `qa/game-pause.mjs`; entry đổi hash, **kB không đổi** vì thay đổi nằm trong chunk game đã lazy),
   T41C (bốn đường ghi `recordQuestionAnswer` / `applySession` / bước ngày chuỗi /
   `recordTierReward` chỉ tính một lần: bằng liệu trùng bị chặn trước khi cộng, buổi đọc
   có dấu đã gập, ghi thất bại thì hoàn tác, và mỗi lượt chơi có biên lai),
   T41B (DecisionEngine + LearningOS chỉ dùng đồng hồ do caller truyền: cửa sổ cân bằng
   môn 14 ngày tính từ `now`, báo cáo Ba Mẹ dùng ngày lịch địa phương thay vì ngày UTC),
   T41A (công tắc phần thưởng của ba mẹ chặn đúng tài nguyên ở tầng service, màn kết quả
   in đúng phần thưởng vừa cấp, CTA trang Chủ mở thẳng bài được gợi ý, "Vì sao gợi ý này?"
   tới tab Phân Tích, đồng hồ thời lượng màn hình không tính lúc tab ẩn),
   T40 (sửa mã máy lộ trên báo cáo Ba Mẹ, chuẩn hoá kỹ năng đọc và migration `P43-v1`),
   T39 (tối ưu đồ thị tải lần đầu: màn Cờ Tướng/IOE + ngân hàng đề ra khỏi chunk khởi động,
   Firebase chỉ nạp khi người lớn mở màn tài khoản), T38 (đường lùi WebGL cho bàn cờ 3D), T37 (kẻ đậm đường ô cờ vua), T36 (Việt hoá nhãn còn sót), T35 (đường kẻ ô + tương phản sáng/tối) và T34 (bộ cờ vua giống cờ gỗ thật), vòng soát bug T31 rồi T32 (bẫy focus popup bài học, header tràn nút "Ba Mẹ", thoại gấu lẫn chữ Hàn,
   cờ vua 3D thiếu fallback WebGL), sau khi đã sửa vòng bug T26/T27 và audit UI T28; trên nền
   hai merge `origin/main`
   (cloud-sync + cờ vua WebGL, rồi `3727f04` auth/chess) và merge `fd3e7da` — bằng
   `npx vitest run`, `npm run check:budget` hoặc `ls`. Các số mô tả nội dung học (31/475/1570
   câu) giữ nguyên từ đợt đo 2026-10-29: T42 chỉ đổi **dữ kiện** của 12 phép tính và một dòng mô tả
   trong `src/data/math/calcIn100.ts`, không thêm/bớt chủ đề, bài hay câu. Dấu ✚ trong `BRD.md`
   nghĩa là "đo trực tiếp từ repo".
2. **Code là nguồn chân lý.** Khi tài liệu cũ (`PRODUCT_SPEC.md`, `MASTER_ROADMAP.md`)
   lệch với `src/`, thì `src/` đúng và tài liệu này phải sửa theo.
3. **Không có yêu cầu treo.** Một FR không còn chứng cứ phải bị xoá hoặc gắn
   "KHÔNG CÒN ĐẠT" kèm lý do — xem `SRS.md` §11 và `RTM.md` §9.
4. **Không cam kết ngày.** Kế hoạch dùng độ lớn (S/M/L/XL) + tiền lệ có thật trong
   `docs/opencode/reports/`, không dùng "2 ngày".
5. **Bằng chứng là output lệnh.** Số liệu lấy qua MCP (`mcp/`) là manh mối; muốn tuyên bố
   "xanh" phải dán output `npm run verify` hoặc `QA PASS` (`AGENTS.md` §1, `docs/SDLC.md` §10).
6. **Prompt không phải tài liệu.** Brief AI của một phase chỉ là đầu vào: chạy xong thì chứng
   cứ là báo cáo/test, không phải prompt. Ngày 2026-10-30 đã gỡ 68 prompt đã dùng
   (`docs/MASTER_ROADMAP.md` §"Cấu trúc `docs/` sau khi gỡ prompt", khôi phục bằng
   `git show "99edd29:<đường-dẫn>"`). Còn giữ: 3 master prompt module (`cotuong.md`, `covua.md`,
   `olypictienganh.md`) vì chưa có mô tả thiết kế nào khác, và `docs/opencode/queue/05_T03B…md`
   vì task chưa làm.

## Khi nào phải cập nhật

| Bạn vừa… | Phải sửa |
|---|---|
| thêm trò chơi / tính năng | `SRS.md` (FR mới) → `RTM.md` (dòng mới) → `CHANGELOG.md` |
| đổi ngưỡng nghiệp vụ | `SRS.md` §5 hoặc §6 + test trong `tests/` |
| đổi kiến trúc (chunk, schema, tầng) | `ARCHITECTURE.md` + thêm hoặc sửa ADR |
| xong một phase | `../plan/TASK_PLAN.md` §II (lịch sử, chỉ thêm không sửa) |
| phát hiện lỗi mới | `../plan/TEST_PLAN.md` §12 (danh sách hồi quy) |
| đổi tên / di chuyển một file trong bộ này | 4 điểm trỏ tới ở mục "Bộ này được trỏ tới từ" |

## Bộ này được trỏ tới từ

Bốn điểm vào (sửa cùng một commit khi đổi tên file hoặc số liệu đầu mối):

- [`../../README.md`](../../README.md) — mục "Bộ tài liệu chuẩn"
- [`../SDLC.md`](../SDLC.md) §9 — tra cứu nhanh "yêu cầu nào chưa có test / việc kế tiếp"
- [`../MASTER_ROADMAP.md`](../MASTER_ROADMAP.md) — bảng "Tài liệu"
- [`../../CHANGELOG.md`](../../CHANGELOG.md) `[Unreleased]` — dòng Added của bộ đặc tả

## Tài liệu nền khác (không thuộc bộ đặc tả nhưng được tham chiếu nhiều)

[`../SDLC.md`](../SDLC.md) · [`../lifecycle/README.md`](../lifecycle/README.md) (8 artifact vòng đời +
Evidence Board + Checklist) · [`../prompts/README.md`](../prompts/README.md) (5 thẻ prompt tái dùng) ·
[`../../evidence/README.md`](../../evidence/README.md) (bằng chứng gắn commit) ·
[`../GAME_DESIGN.md`](../GAME_DESIGN.md) ·
[`../CURRICULUM_MAP.md`](../CURRICULUM_MAP.md) · [`../PARENT_MODE.md`](../PARENT_MODE.md) ·
[`../SAFETY_PRIVACY.md`](../SAFETY_PRIVACY.md) · [`../P30_RELIABILITY.md`](../P30_RELIABILITY.md) ·
[`../P31_PERFORMANCE_ACCESSIBILITY.md`](../P31_PERFORMANCE_ACCESSIBILITY.md) ·
[`../cotuong.md`](../cotuong.md) · [`../../mcp/README.md`](../../mcp/README.md) ·
[`../../AGENTS.md`](../../AGENTS.md)
