# `evidence/` — bằng chứng gắn commit

**Owner:** người giữ repo (`ducmanh2802`) · **Áp dụng từ:** 2026-11-02

Thư mục này trả lời câu hỏi *"nói xong thật chưa?"* bằng thứ mở ra xem được, không bằng lời kể.
Một thay đổi chỉ được coi là đã kiểm chứng khi có **ít nhất một file ở đây**, và file đó nói được
ba điều: **commit nào**, **lệnh nào**, **kết quả ra sao**.

---

## 1. Quy ước

```
evidence/<YYYY-MM-DD>-<mốc>/
  verify.txt          # log cổng, đã bỏ mã màu ANSI để đọc được trong trình duyệt
  probe-<tên>.json    # output probe Playwright chạy trên dist/ thật
  *.png               # ảnh chụp màn hình tại thời điểm kiểm
  README.md           # (thư mục gốc này) bảng liệt kê mọi đợt
```

Ba rule, lấy từ `docs/SDLC.md` §1 giai đoạn 4 và `AGENTS.md` §1 mục 1 & 3:

1. **Gắn commit.** Mỗi dòng bảng dưới đây ghi SHA thật của commit mà lệnh được chạy trên đó.
   Bằng chứng của commit cũ không chứng nhận cho commit mới.
2. **Tái lập được.** Cột "Lệnh" phải copy-paste chạy lại được trên máy sạch
   (`npm run hooks:install` → `npm run build` trước các probe). Không có lệnh = không phải bằng chứng.
3. **Không có bí mật.** `.env`, API key, và **nội dung bài làm thật của bé** không bao giờ vào đây.
   Ảnh chụp dùng hồ sơ giả do probe tự dựng trong `localStorage`.
   `.gitignore` đã chặn `*.log` — vì vậy log lưu tên `.txt` hoặc `.json`.

---

## 2. Danh mục bằng chứng

| Đợt | Commit | Ngày | Nội dung cần chứng nhận | Artifact | Lệnh tái lập | Verdict |
|---|---|---|---|---|---|---|
| `2026-11-02-T41C` | `d54f341` | 2026-11-02 | Idempotency 5 tầng (T41C) + dải thưởng không còn hứa `+0 Sao` | `verify.txt` · `probe-t32-game-replay-evidence.json` · `probe-parent-controls.json` · `probe-golden-path.json` · `game-rewards-on.png` · `game-rewards-off.png` | `npm run verify` rồi `sed 's/\x1b\[[0-9;]*m//g'`; `node qa/run-one.mjs qa/<probe>.mjs` | **Pass** |

Verdict chỉ nhận 4 giá trị: `Pass` · `Fail` · `Blocked` · `NotRun`. `NotRun` **không phải** `Pass` —
một ô `NotRun` vẫn phải ghi rõ vì sao chưa chạy.

---

## 3. Đọc từng artifact của đợt `2026-11-02-T41C`

| File | Mở ra thấy gì | Số đo |
|---|---|---|
| `verify.txt` | Toàn bộ output `npm run verify` (typecheck → `test:ci` → build → `check:budget`) | `87` test file passed · `1240` test passed · `Duration 27.24s` · `Main chunk: index-C_mEaaUG.js = 204.2 kB → PASS (meets 450 kB goal)` |
| `probe-t32-game-replay-evidence.json` | Chơi lại cùng một màn không cộng thưởng hai lần | `ok: true` · `5` bước · `0` lỗi |
| `probe-parent-controls.json` | Ba mẹ tắt quỹ thưởng ⇒ hệ thống không tự cộng Sao | `ok: true` · `7` bước · `0` lỗi |
| `probe-golden-path.json` | Luồng chính của bé từ trang chủ tới màn chơi | `28` bước · `0` lỗi · `removals` (chuỗi bị loại khỏi DOM) rỗng. Probe này **không** in khoá `ok` — đọc `errors.length === 0` |
| `game-rewards-on.png` | Màn "VƯỢT QUA MÀN 1!" của *Đọc Câu Làm Theo* khi quỹ thưởng **bật** | Dải thưởng `+3 Sao` `+10 XP`, đúng số thực vào túi |
| `game-rewards-off.png` | Cùng màn đó khi ba mẹ **tắt** quỹ thưởng | Không còn dòng `+N Sao`/`+N XP`; thay bằng dải xanh "Nhà mình đang tắt phần thưởng nên lượt này không cộng Sao hay XP — Gấu vẫn ghi nhớ bài học của bé." |

Hai ảnh là phần "bằng chứng nhìn thấy được" mà `AGENTS.md` §1 mục 3 bắt buộc khi đổi UI:
typecheck xanh không chứng minh được rằng màn kết quả trước đây in `+0 Sao`.

### Tái lập ảnh

Ảnh chụp bằng Playwright trên bản build của `d54f341`, kịch bản: mở trò *Đọc Câu Làm Theo*
(index 8 trong `qa/games.mjs → GAME_TITLES`), trả lời đủ 5 câu của màn «Khởi Động» tới khi hiện
bảng kết quả, tắt/mở `kho_bau_motivation.rewardsEnabled` giữa hai lượt.
Probe tự động hoá tương đương đã có sẵn: `qa/t32-game-replay-evidence.mjs` và `qa/parent-controls.mjs`.

---

## 4. Việc còn treo

| Hạng mục | Trạng thái | Lý do / điều kiện dừng |
|---|---|---|
| Bằng chứng cho một **release** thật (RC tag + go/no-go) | `NotRun` | Repo chưa từng có tag nào (`git tag` rỗng, đo 2026-11-02). Cần người dùng chốt ngày phát hành — xem `docs/lifecycle/07_RELEASE_OPERATIONS.md`. |
| Ảnh chụp cho T41A/T41B | `NotRun` | Hai đợt này sửa quyền hiển thị và timezone; đã đóng bằng test nguồn + test đơn vị, chưa có ảnh. Ghi ở `docs/lifecycle/README.md` Evidence Board. |
| `docs/opencode/reports/img/*.png` | không nằm ở đây | 39 ảnh do quy trình audit tự động ghi, là **nhật sử** của các phiên trước; số hiện trạng lấy từ `npm run verify` của phiên đang chạy. |
