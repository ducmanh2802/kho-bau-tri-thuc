# T49A — quà cấp độ và phòng thay đồ chỉ được ăn mừng những gì thật sự ghi được

Ngày đo: **2026-11-04** · lát cắt bug-hunt tiếp theo sau **T48B** (`3fad1b4`), đóng `DEF-020(b)`.
Branch `main`, nội dung = `origin/main` `06f8fa4` + thay đổi của đợt này.

## 1. Defect

Cùng khuôn với `drawGacha` đã đóng ở T48B, và **nặng hơn** vì bé đã mất tài nguyên:

| Hàm | Điều app hứa | Điều thật xảy ra khi trình duyệt chặn ghi |
|---|---|---|
| `StorageService.buyShopItem()` (`src/services/storage.ts`) | nút "Mua" bắn confetti, đọc *"Chúc mừng bé đã mở khóa …"* | `saveChildProfile` trả `false` **bị bỏ qua** ⇒ sao không trừ, món không mở khoá; tải lại trang mọi thứ nguyên như cũ, nhưng bé đã tin mình tiêu sao |
| `StorageService.claimLevelRewards()` | hộp **"Chúc mừng bé lên cấp"** + biên lai "Quà cấp độ …" trong lịch sử ba mẹ | cả hai phép ghi đều bị bỏ qua ⇒ hộp vẫn bật, **biên lai vẫn ghi được** (nó nằm ở key `kho_bau_parent_settings`, key này không bị chặn), còn sao thì không. Mỗi lần bé kiếm thêm XP là một lần nhận ảo mới |

`writeJSON` (`src/services/storage.ts:302`) **cố ý** trả `false` khi `setItem` ném (Safari
chế độ ẩn danh, hết dung lượng) — hai hàm trên vứt con số đó đi.

## 2. Phép đo trước khi sửa (chạy thật, không suy luận)

```bash
grep -rn "^\s*StorageService\.save[A-Za-z]*(" src --include=*.ts --include=*.tsx | wc -l   # 72
```

⇒ **72** lời gọi ghi ở dạng câu lệnh, tức **không đọc kết quả**. Hai chỗ trong sổ `DEF-020`
là phần hứa với bé. Sau khi sửa, số này **vẫn 72** vì phần lớn nằm ở đường không hứa
(demo seed, analytics, reading profile…); điều kiện đóng của cả họ được ghi ở §7.

## 3. Sửa (2 file `src/`, không thêm dependency)

* `claimLevelRewards`: `saveChildProfile` **trước**, hỏng ⇒ trả `claimed: []` và **không** chạm
  `saveMotivationState`, **không** `checkAchievements`, **không** viết biên lai. `claimed: []` là
  công tắc duy nhất của `App.tsx` (`result.claimed.length > 0`) và của
  `shouldCelebrateLevelUp` ⇒ không còn hộp ăn mừng ảo.
* `buyShopItem`: `saveChildProfile` hỏng ⇒ `reason: 'storage-unavailable'` (thêm vào hợp
  `ShopBuyResult['reason']`).
* `AvatarShopScreen`: **nhánh riêng** cho lý do mới — *"Máy không lưu được món quà này. Bé nhờ
  ba mẹ bật lại phần lưu của máy nhé!"*.

**Hai quyết định có lý do, không phải mặc định**

1. Hồ sơ ghi **trước** rồi mới xét. Chặn key hồ sơ ⇒ chưa ghi byte nào ⇒ level vẫn pending,
   máy lưu được trở lại thì bé nhận **đủ** quà (không mất, không dồn).
2. Chặn key **động lực** ⇒ sao đã nằm xuống máy còn dấu "đã nhận" thì chưa ⇒ chọn rủi ro
   *nhận trùng* (nhìn thấy được, tự khép) thay vì *mất quà* (âm thầm, không cách nào chuộc).
   Bộ đếm `shopBoughtTotal` **chủ đích** vẫn bỏ qua kết quả ghi: nó chỉ nuôi thành tựu, không
   được phép lật ngược một giao dịch đã thành.

## 4. Test viết **trước**, đã đỏ vì đúng nguyên nhân

`tests/t49a-reward-write-honest.test.ts` — 13 test, mock `localStorage` ném `QuotaExceededError`
trên từng key được chọn:

```
RED (trước khi sửa):  Test Files 1 failed · Tests 9 failed | 4 passed (13)
GREEN                : Tests 13 passed (13)
```

Bốn test xanh ngay từ đầu là **characterization** (đường lưu được, đường tắt phần thưởng, đường
"món về sao tiêu" khi chỉ hỏng bộ đếm) — chứng chỉ đỏ 9 test kia đỏ vì thiếu khoá bảo vệ chứ
không vì harness sai. Test chót là **bất biến quét vùng mã sửa**: mọi `StorageService.save…`
trong đường đổi sao/mở khoá phải đọc kết quả, kèm **đúng một** ngoại lệ có lý do
(`shopBoughtTotal`).

## 5. Cổng + bằng chứng

| Lệnh | Kết quả |
|---|---|
| `npm run verify` | **EXIT=0** · **123 file / 1534 test** pass · `Duration 27.99s` · `Main chunk: index-chzUu7ig.js = 213.7 kB → PASS (meets 450 kB goal)` — `verify.txt` |
| `npm run build && node qa/run-one.mjs evidence/2026-11-04-T49A/probe-t49a-reward-write-honest.mjs` | **`QA PASS — 5 step(s), 0 errors`** — `probe-GREEN.txt`, `probe-result.json`, 4 ảnh |
| `node qa/run-one.mjs qa/parent-controls.mjs` | EXIT=0 — `probe-regression-parent-controls.txt` |
| `node qa/run-one.mjs qa/gacha-machine.mjs` | EXIT=0 — `probe-regression-gacha.txt` |

Probe **không** đặt trong `qa/` ⇒ tổng probe vẫn **30**.

## 6. Ablation — bỏ guard, cả test **lẫn** probe phải đỏ

Đột biến: khôi phục đúng hành vi cũ (hai hàm vứt kết quả ghi + xoá nhánh UI). Build lại `dist/`
rồi chạy probe: `probe-RED-no-guard.txt` ⇒ **`QA FAIL — 6 error(s)`, `failedAt: B`**

```
B: máy KHÔNG ghi được mà vẫn hứa đã mua: "… Chúc mừng bé đã mở khóa Mũ Lưỡi Trai Năng Động!"
B: lời đọc không nói thẳng là máy không lưu được: "…"
B: biên lai "Mua …" xuất hiện dù giao dịch không nằm xuống máy (1 dòng)
C: hộp "Chúc mừng bé lên cấp" vẫn bật trong khi sao và dấu "đã nhận" không ghi được
C: lịch sử ba mẹ nhận thêm 2 biên lai "Quà cấp độ" ảo dù quà không nằm xuống máy
C: dấu "đã nhận cấp 6" nằm xuống máy trong khi sao thì không: [2,3,4,5,6]
```

Cùng lượt đột biến: `npx vitest run tests/t49a-…` ⇒ `9 failed | 4 passed` — **khớp** số đỏ ban đầu
(`tests-RED-no-guard.txt` lưu lần đột biến **riêng** `storage.ts`, tức bỏ cả hai guard nhưng giữ
nhánh UI ⇒ `8 failed | 5 passed`; hai con số khác nhau đúng vì một test trong bộ 13 là hợp đồng
chuỗi của UI).
Hoàn tác bằng bản sao `/c/tmp/t49a-backup/` (không dùng `git checkout --` vì bản sửa chưa nằm
trong HEAD), chạy lại `13 passed`, `git status --short -- src/` chỉ còn đúng hai file của đợt này.

**Bước D là gì và vì sao bắt buộc:** D dựng cùng mức XP ở C nhưng **không** chặn ghi và đòi hộp
"Chúc mừng bé lên cấp" **phải** bật. Không có D thì C xanh rỗng — một probe "không thấy gì" có
thể được viết lại thành "thấy lỗi" mà không ai biết.

**Điều đo được ngoài dự tính (ghi lại vì nó là sự thật, không phải vì nó đẹp):** ở bước A, món
giá 5 sao làm tổng sao trên máy đi từ 100 → **97**, tức app còn tự nhận **+2 "Quà cấp độ 2"**
trong cùng cửa sổ (boot award XP → level 2). Probe vì vậy **không** chốt đúng hiệu số giá món mà
chốt ba điều: sao giảm thật + món mở khoá thật + đúng 1 biên lai "Mua".

## 7. Còn mở

* **DEF-021 (phát hiện khi viết probe)** — bộ đếm catalogue: `grep -c "id: '" src/data/shopCatalog.ts`
  = **41** món (dòng chú thích đầu file vẫn ghi "43 món" — lệch), chia theo `type`:
  hat 8 · pet 7 · shirt 6 · background 6 · frame 5 · glasses 5 · backpack 4. Tab của
  `AvatarShopScreen` chỉ có `mascot|hat|glasses|backpack|pet` và màn render bằng
  `AVATAR_SHOP_ITEMS.filter(i => i.type === activeTab)` ⇒ **17** món (áo 6 + nền 6 + khung 5)
  **không xuất hiện ở bất kỳ tab nào**: bé không mua được, dù `buyShopItem` vẫn nhận id của chúng.
  Chưa sửa trong lượt này để giữ phạm vi một commit.
* Nhãn "máy không lưu được" của phòng thay đồ **chỉ có tiếng, chưa có chữ** (probe phải dựng
  `speechSynthesis` giả để đo được). Máy tắt tiếng thì bé chỉ nghe một tiếng bíp.
* 72 chỗ ghi bỏ qua kết quả: lần này khoá được **2** chỗ hứa với bé; số còn lại thuộc đường
  không hứa (analytics, reading profile, demo seed…) — cần một quyết định chính sách "chỗ nào
  phải đọc kết quả" hơn là sửa tuần tự.
* `handleSelectMascot` / đường mặc đồ (`AvatarShopScreen.tsx:33`, `:55`, `:76`) vẫn bỏ qua kết quả
  `saveChildProfile` — mức hại thấp (chỉ đổi trạng thái mặc), chưa đụng.
