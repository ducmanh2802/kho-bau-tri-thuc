# MEASURE SYNC — thẻ đồng bộ số liệu sau khi chạy cổng
**Owner:** người giữ repo (`ducmanh2802`) · **Cập nhật:** 2026-11-02

Dùng ngay sau `npm run verify` / `npm run build` / merge `origin/main`. Hai lỗi đã xảy ra thật mà
thẻ này sinh ra để chặn: (a) sửa **cả dòng lịch sử** khi thay số hàng loạt, (b) đổi **kB mà quên hash**.

## 1. Khung

```
VAI TRÒ
  Bạn giữ cho tài liệu chỉ khai số ĐO ĐƯỢC (docs/specs/README.md §"Quy ước chung" rule 1).
  Phạm vi ghi: README.md, docs/specs/*, docs/plan/*, CHANGELOG.md. KHÔNG ghi vào src/, qa/, dist/.

CONTEXT
  Vừa chạy: <lệnh + EXIT>. Nguồn số thật: `npm run check:budget`, `npx vitest run`, `ls | wc -l`.
  Ba rule sống còn:
    1) Số hiện trạng ≠ nhật sử. CHANGELOG.md và TASK_PLAN.md §II là LỊCH SỬ ⇒ chỉ THÊM dòng.
    2) Cụ thể trước, chung sau — nếu vẫn dùng sed để tìm: anchor dài chạy trước bare number.
       Mặc định an toàn: grep để TÌM, Edit để GHI từng dòng.
    3) Hash và kB là hai số liệu, đổi cùng nhau, ở cả ba nơi khai báo.

NHIỆM VỤ
  1) Chạy script đo (chỉ đọc, không ghi file).
  2) Sửa đúng vùng hiện trạng theo bản đồ metric → file.
  3) Thêm một dòng mới vào CHANGELOG [Unreleased] và một hàng vào TASK_PLAN §II.
  4) Cập nhật dấu ngày ("đo 2026-11-02, sau T41C").
  5) Quét lại tới khi script exit 0, rồi chạy VI-TEXT.

RÀNG BUỘC
  - Không đoán số. Không lấy số từ MCP làm kết quả cuối (manh mối thôi).
  - Không đặt helper tạm trong `qa/` (bị đếm là probe ⇒ số probe tăng thật).
  - `npm run test:ci`, không `npm test` (posttest làm bẩn diff).

OUTPUT
  - `git diff --stat` chỉ có file docs, không dist/, không src/.
  - Kết quả script đo + kết quả VI-TEXT.

TIÊU CHÍ ĐẠT
  - [ ] `node …/measure.mjs --vitest-out - < /tmp/verify.log` in "docs khớp số đo hiện trạng" (exit 0).
  - [ ] `grep -rn "<số cũ>" README.md docs/specs docs/plan` trả rỗng.
  - [ ] VI-TEXT exit 0.
```

## 2. Bản đồ metric → nơi khai báo

| Metric | Lệnh đo | Nơi phải đổi |
|---|---|---|
| Test file / tổng test | output `npx vitest run` | `README.md` · `ARCHITECTURE.md` §12 · `SRS.md` NFR-M04 · `RTM.md` §8 · `TEST_PLAN.md` header/§2/§5 · `TASK_PLAN.md` K-03 |
| Entry hash + kB | `npm run check:budget` | `ARCHITECTURE.md` bảng chunk + ADR-08/16/18 + §12 · `SRS.md` NFR-P01 · `BRD.md` §Thành công · `TEST_PLAN.md` header/§9 · `evidence/README.md` §2 |
| Boot graph | `grep -o 'assets/…\.js' dist/index.html \| sort -u` + `stat -c%s` | `ARCHITECTURE.md` §12 · `01_LIFECYCLE_BOARD.md` · `lifecycle/README.md` §2 |
| Service module / component / data / type / hook | `ls … \| wc -l` | `ARCHITECTURE.md` §12 (**dễ quên nhất**) |
| Trò chơi (4 nơi) | `grep -c "id: '" src/data/gamesCatalog.ts` · `grep -c 'lazy(' registry.ts` · `LAUNCHABLE_GAME_IDS` · `GAME_TITLES` | `docs/specs/*` · `docs/GAME_DESIGN.md` — **4 số phải bằng nhau** |
| Probe QA | `ls qa/*.mjs qa/*.cjs` trừ `lib.mjs`, `run-one.mjs` | `docs/specs/README.md` · `BRD.md` BG-04 · `TEST_PLAN.md` §6 · `RTM.md` §8 |
| Workflow / deps runtime / policy dòng / key localStorage | `ls .github/workflows` · `package.json` · `wc -l src/config/policy.ts` · khối `STORAGE_KEYS` | `ARCHITECTURE.md` §12 · `SRS.md` §10 · `RTM.md` §4 |

## 3. Bẫy đã gặp

| Triệu chứng | Nguyên nhân |
|---|---|
| `entry_hash` đỏ nhưng kB khớp | lần trước chỉ đổi size |
| CHANGELOG/TASK_PLAN §II bị đổi số | sed chạy rule chung trước rule cụ thể ⇒ hoàn tác, sửa tay |
| Tổng test nhảy mà mình không thêm test | lane khác merge; số đúng là số của **verify hiện tại** |
| Probe tăng 1 không lý do | có file `.mjs` lạc trong `qa/` |
| `check:budget` in `FAIL: no-dist` | chưa `npm run build` |
| Script không đọc được `test_total` | log còn mã màu ANSI ⇒ `sed 's/\x1b\[[0-9;]*m//g'` trước |
| Docs dẫn `file.ts:NNN` bị trôi | sửa source làm hỏng ~15 ref — remap một pass riêng |
