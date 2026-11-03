# Incident log — sổ sự cố
## Pha 10 (Operations) · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Mở sổ:** 2026-11-03
**Rule:** một hàng = một sự cố **đã xảy ra thật**, không phải tình huống suýt. Bắt buộc đủ bốn cột:
bằng chứng mở được, nơi chết thật, bản sửa, và **cái gì giữ nó không tái diễn**. Guide §C1: sự cố không
được phép đi tắt change control.

---

## Mẫu ghi (copy khối này khi thêm hàng mới)

```
INC-<NN> · <YYYY-MM-DD> · phát hiện qua: <cổng CI | probe | người dùng | đọc code>
Bằng chứng: <đường dẫn evidence + lệnh đã chạy>
Nơi chết thật: <file:điều kiện, không phải nơi báo lỗi>
Ảnh hưởng lên bé/ba mẹ: <mất gì, sai gì, trong bao lâu>
Bản sửa: <commit + file>
Không tái diễn vì: <test/probe/hook nào nay chặn, tên test cụ thể>
```

---

## INC-01 · 2026-11-02 · phát hiện qua: cổng CI trên commit được tag

| Mục | Nội dung |
|---|---|
| Hiện tượng | Tag `v1.1.0` đầu tiên (commit `7d92246`) làm **cả 4 workflow** đỏ ở bước Install ⇒ workflow `4. Release` chết trước bước "Create GitHub Release": tag tồn tại nhưng **không có release nào** |
| Bằng chứng | `evidence/2026-11-02-KBT-ISSUE-43/ci-install-red.txt` (npm 10 trên runner `EUSAGE` với lock sinh bởi npm 11) · đối soát máy: `git archive HEAD \| tar -x -C /tmp/ci2 && cd /tmp/ci2 && npx --yes npm@10 ci --no-audit --no-fund` |
| Nơi chết thật | `package-lock.json` bị sinh bằng npm 11.6.2 (Node 24) — thiếu mục `@emnapi/*` mà npm 10 (Node 22 trong workflow) cần. **Không phải** lỗi code app: `npm run verify` trên Windows vẫn EXIT=0 song song với CI đỏ ⇒ `verify` cục bộ **không chứng nhận** bước Install của CI (`TEST_PLAN.md` §16 mục 12) |
| Ảnh hưởng | Bản phát hành không tới tay người dùng; phải **xoá tag và tạo lại** — việc chỉ chủ repo được làm |
| Bản sửa | `1b8dadd` (regenerate lock bằng `npx --yes npm@10 install --package-lock-only`) + `66e0fea` (workflow 03 tự build `dist/` thay vì tải artifact của run khác) |
| Không tái diễn vì | Tag lại trên `77d90ce` sau khi chạy lại cổng máy ⇒ `4. Release` run `41490669966` success 9 bước, release id `431754261`, asset `kho-bau-tri-thuc-1.1.0.zip` (`evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt`). **Chưa** có gate cục bộ nào so sánh lock với npm 10 — vẫn là bước kiểm tay trong [`runbook.md`](runbook.md) §1 |

## INC-02 · 2026-11-03 · phát hiện qua: cổng CI (đỏ lặp lại trên commit chỉ đổi tài liệu)

| Mục | Nội dung |
|---|---|
| Hiện tượng | `3. Browser QA` đỏ ở bước "QA probe" trên runner Linux, trong khi annotation in ra "QA PASS — 28 step(s), 0 errors" |
| Bằng chứng | `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` (chuỗi run 41488045102 → 41508824890 + check-run 125495014729) |
| Nơi chết thật | **Hai lớp.** (a) Bản thân bước chẩn đoán **chạy lại** probe nên kể chuyện lần hai, che mất kết quả lần một. (b) Lỗi nằm ở app: `ParentDashboardModal` vẽ một **đề mồi cố định** ở khung hình đầu rồi mới sinh đề thật trong `useEffect([isOpen])` (effect chạy **sau** paint) ⇒ người đọc đúng khoảnh khắc đó trả lời sai, cổng báo sai, bảng không mở,
nút "Đấu Trường Thi Thử" không tồn tại (`failedAt: SNAP_afterReading`) |
| Ảnh hưởng | Probe không mở được màn ba mẹ trên CI; nguy cơ lớn hơn: **phụ huynh thật** thấy một đề không đổi và có thể bấm sai |
| Bản sửa | `03-qa-browser.yml`: bước "QA probe" tự `tee probe-run.log` + `exit "${PIPESTATUS[0]}"`, bước chẩn đoán chỉ đọc file; app: `useMemo(makeGateQuestion, [isOpen])` + reset trạng thái cổng ngay lúc vẽ; helper `unlockParentDashboard` yêu cầu probe **xác nhận cổng đã đóng** (tối đa 3 lượt) |
| Không tái diễn vì | `tests/t41f-parent-gate.test.ts` (RED 5 failed → GREEN) + 3 test hợp đồng workflow trong `tests/t31-bug-hunt-fixes.test.ts`; `continue-on-error` **đã bỏ** (`3b0122c`) ⇒ từ đó probe đỏ làm đỏ cả run. **Ô 13 vẫn MỞ**: chưa ghi được một lượt đỏ bị chặn thật (`RISK-10`) |

## INC-03 · 2026-11-03 · phát hiện qua: đọc code khi lập hồ sơ pha 11

| Mục | Nội dung |
|---|---|
| Hiện tượng | Nút "Đặt lại tiến độ" báo "Đã đặt lại tiến độ về dữ liệu mới tinh ban đầu!" nhưng còn lại ba khoá dữ liệu của bé trong `localStorage` |
| Bằng chứng | `evidence/2026-11-03-T43/ablation-t43a-reset-sweep-RED.txt` (4 failed / 1 passed) · `tests/t43a-reset-progress-sweeps-child-data.test.ts` · danh mục khoá ở [`../11-decommissioning/decommission.md`](../11-decommissioning/decommission.md) §1 |
| Nơi chết thật | `resetProgress()` liệt kê **thủ công 13/17** khoá; khoá thêm dần theo từng đợt (T08 `GAME_FIRST_SEEN`, T01B `TREE_WATER`, T18A `MOTIVATION`, T26 `COTUONG_PUZZLES`) nhưng danh sách xoá không được cập nhật cùng nhịp |
| Ảnh hưởng | Sau "reset": cây vẫn ở trạng thái đã tưới hôm nay (bé không nhận lại confetti/quest), lịch sử ngày ôn tập cộng dồn sang "lần chơi đầu tiên", nhãn "MỚI" của trò chơi biến mất theo ngày cũ — tức **lời hứa trên màn hình sai**, và dữ liệu bé còn nằm trên máy người bán/ máy cho mượn |
| Bản sửa | Đợt **T43**: `src/services/storage.ts` — khoá cần quét nay **suy ra** từ `STORAGE_KEYS` trừ `RESET_KEEP_KEYS` (chỉ `PARENT_SETTINGS`, vì là lựa chọn của người lớn); `resetProgress()` lặp qua danh sách suy ra đó |
| Không tái diễn vì | `tests/t43a-…` liệt kê khoá **viết tay** (mô tả hành vi, không nhập từ nguồn) ⇒ thêm một key mới mà không quyết định quét/giữ là test đỏ ngay. **Còn mở:** phần cloud (INC-04 dưới đây, `RISK-01`) |

## INC-04 · 2026-11-03 · sự cố *kỹ thuật*, chưa phải sự cố người dùng

| Mục | Nội dung |
|---|---|
| Hiện tượng | Đăng xuất khỏi tài khoản Google **không xoá** tài liệu `/users/{uid}` đã đồng bộ; app không có hàm xoá nào (`cloudSync.ts` chỉ có `start`/`getState`/`subscribe`/`syncNow`) |
| Bằng chứng | `grep -n "setDoc\|getDoc" src/services/cloudSync.ts` ⇒ chỉ ghi, không có `deleteDoc`; `cat firestore.rules` ⇒ `allow read, write: if request.auth != null && request.auth.uid == userId` |
| Nơi chết thật | Thiếu *chức năng*, không phải bug: quyền "gỡ dữ liệu con khỏi cloud" chưa từng được thiết kế |
| Ảnh hưởng | Chỉ xảy ra với phụ huynh **tự bật** sync (mặc định không có dữ liệu trên cloud) |
| Bản sửa | Chưa sửa — ghi `RISK-01` + `OQ-04` ở [`../plan/RISK_REGISTER.md`](../plan/RISK_REGISTER.md); thủ tục xoá tạm thời mô tả ở [`../11-decommissioning/decommission.md`](../11-decommissioning/decommission.md) §3 |
| Không tái diễn vì | **Không có** — hàng này mở có chủ đích, để cửa sổ "quyền xoá dữ liệu của bé" không bị đóng bằng im lặng |

## INC-05 · 2026-11-02 · phát hiện qua: cổng đỏ không giải thích được (flake theo giờ)

| Mục | Nội dung |
|---|---|
| Hiện tượng | `npm run verify` đỏ vì một test liên quan đồng hồ mệt (`fatigue`) trượt vào một khung giờ nhất định, xanh khi chạy buổi khác |
| Bằng chứng | `docs/plan/TEST_PLAN.md` §16 mục 11 (kèm lệnh quét ứng viên: `grep -rln "Date.now()" tests/ \| xargs grep -Ln "useFakeTimers" \| wc -l`) · `tests/fatigue-reset.test.ts` |
| Nơi chết thật | Test lấy `Date.now()` làm mốc rồi so với ngưỡng, nên kết quả phụ thuộc **giờ trong ngày** của máy chạy |
| Ảnh hưởng | Mất niềm tin vào cổng: đỏ mà code không sai ⇒ người ta dễ bấm chạy lại cho qua |
| Bản sửa | `tests/fatigue-reset.test.ts` (2026-11-02) |
| Không tái diễn vì | **Chưa hẳn**: §16 mục 11 vẫn mở, còn ~10 file ứng viên chưa rà từng ca; hướng xử lý ghi rõ là `vi.setSystemTime(mốc giữa ngày)` cho mọi ca so với ngưỡng |

---

## Hàng cần thêm khi sự cố tiếp theo xảy ra

Chưa có hàng nào ghi từ **người dùng thật** (báo qua màn Phụ huynh) — vì sản phẩm chưa có kênh nhận báo
và không có telemetry (`ASM-02`). Đó là giới hạn của sổ này, không phải dấu hiệu hệ thống lành.
