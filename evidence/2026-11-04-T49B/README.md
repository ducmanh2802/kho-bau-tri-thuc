# T49B — 17 món quà trong catalogue không có tab nào, và preview không ghép đủ ô trang bị

Ngày đo: **2026-11-04** · lát cắt bug-hunt tiếp theo sau **T49A** (`f4a7c21` + docs `0f0af84`), đóng `DEF-021`.
Branch `main`, nội dung = `origin/main` `0f0af84` + thay đổi của đợt này.

## 1. Defect (hai nửa, cùng một lời hứa)

`AvatarShopScreen` là màn duy nhất bé dùng để đổi diện mạo. Nửa thứ nhất là **đường vào**:

| | |
|---|---|
| Catalogue (`src/data/shopCatalog.ts`) | **41** món, 7 `type` |
| Tab cũ (`AvatarShopScreen.tsx`, state `activeTab`) | `mascot \| hat \| glasses \| backpack \| pet` = **5** tab, 4 `type` |
| Màn render | `AVATAR_SHOP_ITEMS.filter((i) => i.type === activeTab)` |
| ⇒ | **17** món (`shirt` 6 + `background` 6 + `frame` 5) **không thuộc tab nào** — bé không bao giờ thấy thẻ, không có nút "Mở khóa", dù `buyShopItem()` vẫn nhận id của chúng và `ChildProfile.equipped` đã có đủ 7 ô |

Nửa thứ hai **nặng hơn** vì nó là lời hứa sau khi bé đã trả sao: ô preview chỉ ghép 4 lớp
(`hat` · `glasses` · `backpack` · `pet`). Nếu chỉ thêm tab mà không thêm lớp preview thì bé bấm
"Mở khóa" → nút đổi thành "Mặc vào" → **nhân vật đứng nguyên**, và bộ đồ bé vừa mua bằng sao
biến mất sau một lần tải lại. Đây đúng là khuôn `DEF-020` (app ăn mừng điều nó không ghi được)
nhưng ở tầng *hiển thị*.

## 2. Phép đo trước khi sửa (chạy thật, không suy luận)

```bash
grep -c "id: '" src/data/shopCatalog.ts                 # 41
grep -o "type: '[a-z]*'" src/data/shopCatalog.ts | sort | uniq -c
#   8 hat · 7 pet · 6 shirt · 6 background · 5 frame · 5 glasses · 4 backpack
grep -c "id: 'mascot'\|'hat'\|'glasses'\|'backpack'\|'pet'" src/components/shop/AvatarShopScreen.tsx
```

Chú thích đầu `shopCatalog.ts` và ở `storage.ts` đều ghi **"43 món"** — lệch với số đo ⇒ sửa
thành 41 và khoá bằng test b7 (chú thích phải khớp `SHOP_CATALOG.length`).
Bốn con số trên là `b1` của `tests/t49b-shop-tabs-cover-catalog.test.ts`, chạy lại được bằng
`npx vitest run tests/t49b-shop-tabs-cover-catalog.test.ts`.

## 3. Sửa (3 file `src/`, không thêm dependency)

* **`SHOP_TABS`** (module level, exported) — 8 tab phủ `mascot` + **mọi** `ShopItemType`;
  `activeTab` đổi kiểu từ union thủ công 5 nhánh sang `'mascot' | ShopItemType`, nên
  `setActiveTab(tab.id)` không còn `as typeof activeTab` (một con đường casts-che-lỗi đã mất).
* **`SHOP_MASCOTS`** (module level, exported) — 4 bạn mascot, kéo ra khỏi body component để
  test đọc được danh sách thật mà không dựng DOM.
* **`EQUIP_LAYER: Record<ShopItemType, string>`** — mỗi `type` một lớp. `Record` (không phải
  `Partial`/`Map`) là **rào chắn lúc biên dịch**: thêm một `type` mới mà chưa có lớp thì `tsc` đỏ, không cần
  ai nhớ. `background` vẽ làm lớp *sau* bé (`inset-0 … opacity-25`), 6 ô còn lại đè lên trước
  theo `EQUIP_OVERLAYS`.
* **`equippedItem(type)`** — tra `profile.equipped[type]` rồi đòi `i.id === id && i.type === type`:
  một hồ sơ hỏng (id áo nằm ở ô nền, ví dụ do cloud merge) chỉ khiến ô đó trống, không kéo emoji
  sai lên mặt bé.
* Nhãn tab giữ nguyên văn ba tab cũ (`Mũ & Nón` · `Kính Mắt` · `Ba Lô` · `Thú Cưng` ·
  `Chọn Bạn Mascot`) vì `qa/*.mjs` khớp chuỗi UI nguyên văn; ba nhãn mới là `Áo & Trang Phục` ·
  `Nền` · `Khung`.

**Không đổi trong lượt này** (giữ phạm vi một commit, ghi ở §7): đường mặc/mở mascot vẫn bỏ qua
kết quả `saveChildProfile`; `HomeScreen.tsx:254` vẫn vẽ 🐰 cho cả `rabbit` **và** `owl`.

## 4. Test viết **trước**, đã đỏ vì đúng nguyên nhân

`tests/t49b-shop-tabs-cover-catalog.test.ts` — 8 test. RED lần đầu (`tests-RED-before-fix.txt`)
chạy trên bản **đã trích** `SHOP_TABS`/`SHOP_MASCOTS` ra module level nhưng **chưa** thêm tab mới
(làm bước trích này trước để đỏ không phải đỏ vì thiếu import):

```
RED   : Tests 4 failed | 3 passed (7)     ← b2 mồ côi ['shirt','background','frame'] · b3 24≠41
                                            · b6 preview không đổi · b7 chú thích "43"
GREEN : Tests 8 passed (8)
```

Bốn test xanh ngay từ đầu (`b1`, `b4`, `b5`, một phần `b6`) là **characterization**: chúng khoá
số đo và hợp đồng "tab render thật", để bốn test đỏ kia chắc chắn đỏ vì thiếu khoá bảo vệ.
`b8` thêm sau review: `EQUIP_OVERLAYS ∪ {background}` phải phủ **mọi** `type` — `b6` chỉ chấm ba
món nên một ô bị gỡ (đo bằng `mutation-C`) lọt qua cả `tsc` lẫn `b6`.

## 5. Cổng + bằng chứng

| Lệnh | Kết quả |
|---|---|
| `npm run verify` | **EXIT=0** · **124 file / 1542 test** pass · `Duration 28.39s` · `Main chunk: index-vYzkzZ5R.js = 213.7 kB → PASS (meets 450 kB goal)` — `verify.txt` |
| boot graph | `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html \| sed 's#^#dist/#' \| sort -u \| xargs wc -c \| tail -1` ⇒ `438305 total` byte = **428.0 kB** — `src/` đổi nên entry **đổi hash** (`index-chzUu7ig` → `index-vYzkzZ5R`), **kB và boot graph đứng nguyên** |
| `npm run build && node qa/run-one.mjs evidence/2026-11-04-T49B/probe-t49b-shop-tabs.mjs` | **`QA PASS — 5 step(s), 0 errors`** — `probe-GREEN.txt`, 5 ảnh |
| `node qa/run-one.mjs qa/gacha-machine.mjs` | `QA PASS — 4 step(s), 0 errors` — `probe-regression.txt` |
| `node qa/run-one.mjs qa/parent-controls.mjs` | `QA PASS — 7 step(s), 0 errors` — `probe-regression.txt` |
| `node qa/run-one.mjs qa/golden-path.mjs` | `QA PASS — 28 step(s), 0 errors` — `probe-regression.txt` |

Probe **không** đặt trong `qa/` ⇒ tổng probe vẫn **30**.

## 6. Ablation — bỏ guard, cả test **lẫn** probe phải đỏ

| Đột biến | Kết quả |
|---|---|
| khôi phục `AvatarShopScreen.tsx` bằng `git show HEAD:…` (5 tab, 4 lớp preview), build lại, chạy probe | `probe-RED-no-guard.txt` ⇒ **`QA FAIL — 6 error(s)`, `failedAt: A`**: `A: tab "Áo & Trang Phục" / "Nền" / "Khung" không tồn tại trên màn hình` ×3 và `B/C/D: tab … không tồn tại` ×3. Số thẻ đo được ở bản cũ: mascot 4 · mũ 8 · kính 5 · ba lô 4 · thú 7 (28 món hiện ra, 13 món ẩn) |
| gỡ `'shirt'` khỏi `EQUIP_OVERLAYS` | `mutation-A-preview-drop-shirt.txt` ⇒ **b6 đỏ** (`Tests 1 failed \| 6 passed (7)`) — chứng minh b6 thật sự đo ô preview chứ không đo tab |
| gỡ tab `'shirt'` khỏi `SHOP_TABS` | `mutation-B-no-shirt-tab.txt` ⇒ **b2 + b3 đỏ** (`orphans = ["shirt"]`, `covered 35 ≠ 41`) — chứng minh b2/b3 đỏ vì món mồ côi chứ không vì harness |
| gỡ `'glasses'` khỏi `EQUIP_OVERLAYS` | `mutation-C-preview-drop-glasses.txt` ⇒ **b8 đỏ** (`missing = ["glasses"]`, `Tests 1 failed \| 7 passed (8)`) — `tsc` **không** bắt được vì đây là mảng thường, nên lời hứa "mọi type có lớp" cần một test riêng |

Bản sửa chưa nằm trong HEAD ⇒ hoàn tác bằng bản sao `/c/tmp/`, **không** dùng `git checkout --`;
sau mỗi đột biến `git status --short -- src/` chỉ còn đúng ba file của đợt này.

**Vì sao bước E bắt buộc:** E dựng cùng hồ sơ nhưng `unlockedItems: []`, `equipped: {}` và đòi
ô preview **không** chứa 👕 🌊 ⭐. Không có E thì B/C/D chỉ cần "có emoji nào đó hiện ra" là xanh —
icon tab 🌊 từng làm đúng trò đó trong lần viết đầu tiên (b6 đỏ vì khớp cả nhãn tab).

**Số đo thật từ probe (`facts`)**, không phải số kỳ vọng: mỗi tab đều có món
(mascot 4 · mũ 8 · kính 5 · áo 6 · ba lô 4 · thú 7 · nền 6 · khung 5 = **41**); nút "Mở khóa"
đếm được ở từng tab (mũ 7 · kính 4 · áo 6 · ba lô 3 · thú 7 · nền 6 · khung 5 — mũ/kính/ba lô
ít hơn số thẻ vì bản seed đã mở sẵn `hat_cap`/`glasses_nerd`/`bag_dino`); sao trừ thật
`284→278` (áo 6), `278→263` (nền 15), `263→253` (khung 10); preview lớn dần đúng lớp:
`🦊` → `🦊👕` → `🌊🦊👕` → `🌊🦊👕⭐`.

## 7. Còn mở

* **DEF-022 (đo được khi review)** — `src/components/home/HomeScreen.tsx:254` vẽ mascot bằng
  chuỗi ba nhánh `bear ? 🐻 : fox ? 🦊 : 🐰`, nên bé chọn **Cú Thông Thái** (`owl`, 🦉 trong tủ đồ)
  thì màn nhà hiện **con thỏ**. Cùng chỗ đó không ghép bất kỳ ô trang bị nào ⇒ "bộ đồ đã mua" chỉ thấy
  được trong tủ đồ. Chưa sửa để giữ phạm vi một commit.
* Lớp preview mới `aria-hidden` ⇒ bé nhìn thấy nhưng máy đọc màn hình không đọc; đường mặc đồ
  chỉ phát `playClick`, không `speak(tên món)` như đường mua.
* `handleSelectMascot` / mặc–tháo đồ vẫn bỏ qua kết quả `saveChildProfile`: preview đổi theo
  state React trong khi byte có thể không nằm xuống máy — cùng họ `DEF-020`, mức hại thấp hơn.
* 70+ chỗ `StorageService.save…` vẫn bỏ qua kết quả (đếm ở T49A §2): cần một quyết định chính sách
  "chỗ nào phải đọc kết quả" hơn là sửa tuần tự.
