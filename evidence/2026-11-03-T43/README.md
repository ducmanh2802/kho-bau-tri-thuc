# T43 — bằng chứng đợt sửa `resetProgress` (2026-11-03)

Mọi con số/dòng dưới đây do lệnh thật trong phiên này đo, repo `D:\trithuc\kho-bau-tri-thuc`,
HEAD trước đợt = `195a4be` (`main`). Defect `DEF-001` bị **hồ sơ pha 11**
[`docs/11-decommissioning/decommission.md`](../../docs/11-decommissioning/decommission.md) bắt ra,
không phải do người dùng báo.

## Lệnh tái lập

```bash
cd /d/trithuc/kho-bau-tri-thuc
npm run verify                                             # → verify.txt (EXIT=0)
npx vitest run tests/t43a-reset-progress-sweeps-child-data.test.ts   # → 5 passed (5)
# ablation (RED) — xem mục "Test red/green" bên dưới, có lệnh an toàn
npm run build
node qa/run-one.mjs evidence/2026-11-03-T43/probe-t43-reset.mjs     # → probe-t43-reset.txt
node qa/run-one.mjs qa/golden-path.mjs                              # → probe-golden-path.txt
grep -o "assets/[A-Za-z0-9_.-]*\.js" dist/index.html | sed "s#^#dist/#" | sort -u \
  | xargs wc -c | tail -1                                             # → boot-graph.txt
```

## Số đo hiện trạng

- `npm run verify` → EXIT **0**; typecheck `tsc --noEmit` không dòng `error TS`.
- `Test Files 100 passed (100)` · `Tests 1377 passed (1377)` · `Duration 28.57s`
  (trước đợt T43: 99 file / 1372 test ⇒ **+1 file / +5 test**, đúng phần t43a).
- `vite build` → `✓ built in 2.41s`.
- Main chunk: `index-BYLrQykB.js = 210.9 kB` → **PASS** (trần 600 kB, mục tiêu 450 kB).
  Entry trước đợt: `index-C7kpOu7n.js = 211.3 kB` ⇒ **−0.4 kB** (vòng lặp hard-code 13 dòng thay
  bằng một vòng `for…of`; hash đổi dù `src/` chỉ đổi một hàm).
- Boot graph (`dist/index.html` + mọi chunk nó nạp): `435446 total` byte = **425.2 KiB**
  (docs ghi nhãn `kB`; T42 là `435849` = 425.6 KiB ⇒ −0.4 KiB, cùng hướng với entry).
- `npm run verify` chạy **lại trên đúng nội dung commit** (`verify-precommit.txt`): EXIT **0** ·
  `Test Files 100 passed (100)` · `Tests 1377 passed (1377)` · `Duration 25.82s` ·
  `Main chunk: index-BYLrQykB.js = 210.9 kB → PASS` — **cùng hash, cùng kB** với lần đo đầu; khác
  nhau mỗi `Duration`. Lý do phải đo lại: sau `verify.txt` còn một sửa **comment** trong
  `storage.ts` (lưu dẫn `cloudSync.ts:9` → `:10` cho đúng dòng thật); comment bị minifier bỏ nên
  chunk không đổi — đo lại để chứng minh bằng số, không đoán.

## Kiểm kê khoá (nguồn của con số 13 → 16)

```bash
sed -n "/^const STORAGE_KEYS = {/,/^};/p" src/services/storage.ts | grep -oE "^ +[A-Z_0-9]+:" | tr -d ' :' | sort
# ⇒ 17 khoá
git show HEAD:src/services/storage.ts | sed -n '/public static resetProgress/,/^  }/p' \
  | grep -oE "STORAGE_KEYS\.[A-Z_0-9]+" | sed 's/STORAGE_KEYS\.//' | sort
# ⇒ 13 khoá bị xoá trước T43
comm -13 <(…cũ…) <(…registry…)
# ⇒ GAME_FIRST_SEEN · PARENT_SETTINGS · REVIEW_DAYS · TREE_WATER
```

Bốn khoá không nằm trong danh sách hard-code cũ: **ba** là dữ liệu của bé bị sót thật
(`kho_bau_review_days` lịch sử ngày ôn, `kho_bau_game_first_seen` nhãn "MỚI" + ngày thấy lần đầu,
`kho_bau_tree_water` cờ tưới cây hôm nay) và một (`kho_bau_parent_settings`) nay nằm trong
allowlist `RESET_KEEP_KEYS` **có chủ đích** vì đó là lựa chọn của người lớn.
Sau T43: `17 − 1 = 16` khoá con bị quét, và mọi khoá thêm vào `STORAGE_KEYS` sau này **buộc** người
viết code quyết định quét-hay-giữ tại đúng một chỗ (`src/services/storage.ts:94`).

## Test red/green (ablation)

`ablation-t43a-reset-sweep-RED.txt` — nguyên văn output khi revert riêng phần sửa trong `storage.ts`:

```bash
git diff src/services/storage.ts > /tmp/t43a-fix.patch
git checkout -- src/services/storage.ts
npx vitest run tests/t43a-reset-progress-sweeps-child-data.test.ts   # → Tests 4 failed | 1 passed (5)
git apply /tmp/t43a-fix.patch
npx vitest run tests/t43a-reset-progress-sweeps-child-data.test.ts   # → 5 passed (5)
```

RED = **4 failed / 1 passed**: bốn test về dữ liệu bé đỏ, test còn nguyên là
"giữ thiết lập và phiên đăng nhập của người lớn" — đúng vì hành vi giữ `parent_settings` chưa từng
tồn tại trong code cũ, nó tình cờ "đạt" khi không có gì bị xoá thêm. Dòng assertion:
`kho "kho_bau_review_days" phải bị xoá bởi resetProgress: expected '{"seeded":"kho_bau_review_days"}' to be null`.

## Bằng chứng nhìn thấy được (AGENTS §1.3)

`probe-t43-reset.txt` — probe **giữ lại tại đây** (`probe-t43-reset.mjs`, cùng thư mục) chứ không
đặt trong `qa/` vì `qa/*.mjs` được đếm là probe. Chạy trên `dist/` thật, đi hết luồng người lớn:
Parent Gate → tab "Cài Đặt & Thời Gian" → gieo 4 khoá → bấm "Đặt lại tiến độ" → "Xác nhận đặt lại".

- `ok: true`, `errors: []`, `toastSeen: true` (dòng "Đã đặt lại tiến độ về dữ liệu mới tinh ban đầu!"
  hiện thật trên màn hình).
- Sau reset: `kho_bau_review_days` = `null`, `kho_bau_game_first_seen` = `null`,
  `kho_bau_tree_water` = `null`; `kho_bau_parent_settings` còn `{"nightMode":true,"rewardsEnabled":true}`.
- Bốn khoá `kho_bau_*` còn lại **không** phải dữ liệu cũ: trang đang mở nên app ghi lại giá trị mặc
  định — `kho_bau_child_profile` khớp `DEFAULT_CHILD_PROFILE` (`src/services/storage.ts:353`,
  `xp: 0` / `stars: 0` / `completedLessons: []`), `kho_bau_daily_quests` là nhiệm vụ ngày
  `2026-11-03` với `currentCount: 0` cả 4 mục, `kho_bau_motivation` có `stickers: {}` và mọi
  trường tổng kết bằng `0`.
- Không có ảnh PNG: sửa đổi không đụng layout hay nhãn nào, thứ đổi là **dữ liệu nào bị xoá** —
  probe đọc thẳng `localStorage` nên bằng chứng là số, không phải pixel.
- Hồi quy: `probe-golden-path.txt` = `qa/golden-path.mjs` trên cùng build ⇒
  `QA PASS — 28 step(s), 0 errors`, exit 0.

## Verdict

`Pass` (cấp máy). **Chưa** có lượt CI trên commit chứa T43 tại thời điểm viết các file này;
SHA commit + các check-run ghi bổ sung ở dòng `2026-11-03-T43` của [`../README.md`](../README.md)
(tiền lệ: `195a4be` bổ sung SHA và lượt CI cho `2026-11-03-T42`).

## Khuyết liên quan, cố ý **để mở** (không sửa trong đợt này)

- `RISK-01` — không có đường xoá dữ liệu trên cloud: `resetProgress()` chỉ dọn `localStorage`, hồ sơ
  Firestore của tài khoản đã bật mirror vẫn còn. Người duyệt là chủ repo, không phải agent
  ([`docs/plan/RISK_REGISTER.md`](../../docs/plan/RISK_REGISTER.md)).
- `RISK-11` — `docs/SAFETY_PRIVACY.md` nói "sao lưu" nhưng export là một chiều (không có import);
  sửa thành hai chiều là quyết định sản phẩm, đã ghi thành câu hỏi mở `OQ-07`.
- Nhánh "giữ gì khi reset" là **lựa chọn sư phạm**: `kho_bau_child_profile` (tên bé, lớp, avatar)
  bị quét theo rule "không nằm trong allowlist". Nếu chủ repo muốn giữ tên bé, thêm
  `STORAGE_KEYS.CHILD_PROFILE` vào `RESET_KEEP_KEYS` và đổi test t43a + FR-P06 — đừng sửa code
  trước khi chốt.
