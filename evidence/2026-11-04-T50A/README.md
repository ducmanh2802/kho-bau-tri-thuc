# T50A — màn Home vẽ "Cú Thông Thái" thành con thỏ (DEF-022a)

Ngày đo: **2026-11-04** · lát cắt bug-hunt tiếp theo sau **T49B** (`e969f1c` + docs `ce29905`).
Branch `main`, nội dung = `ce29905` + thay đổi của đợt này. Đóng **DEF-022(a)**; **DEF-022(b)** vẫn mở (probe bước D ghi lại, §7).

## 1. Defect

Hồ sơ cho phép **bốn** bạn mascot, nhưng màn Home chỉ biết **ba**:

```bash
grep -n "avatarBase" src/types/index.ts
#  src/types/index.ts:133:  avatarBase: 'bear' | 'fox' | 'rabbit' | 'owl';

git show HEAD:src/components/home/HomeScreen.tsx | grep -n "avatarBase"
#  254:  {profile.avatarBase === 'bear' ? '🐻' : profile.avatarBase === 'fox' ? '🦊' : '🐰'}
#        ↑ ba nhánh, nhánh cuối là "else" ⇒ `owl` rơi vào 🐰

git show HEAD:src/components/shop/AvatarShopScreen.tsx | grep -n "avatarBase ==="
#  181:  … : profile.avatarBase === 'rabbit' ? '🐰' : '🦉'}     ← tủ đồ thì đủ BỐN nhánh
```

Hai bản đồ emoji **độc lập** trong cùng một tính năng ⇒ bé bấm "Cú Thông Thái" trong tủ đồ, thấy 🦉,
quay về Home thì cú hóa thỏ. Đây là khuôn đã lặp ở `DEF-021`: một sự thật, hai chỗ khai.

## 2. Sửa (3 file `src/`, không thêm dependency)

* **`src/data/shopCatalog.ts`** — nguồn duy nhất:
  `MASCOT_EMOJI: Record<ChildProfile['avatarBase'], string>` và `SHOP_MASCOTS: readonly ShopMascot[]`
  (bỏ hẳn trường `emoji` khỏi danh sách chọn bạn để không còn hai chỗ khai).
  `Record` **không phải** `Partial`: thêm một `avatarBase` mới mà quên hình thì `tsc` đỏ, không chờ ai nhớ.
* **`src/components/home/HomeScreen.tsx`** — ô avatar đọc `MASCOT_EMOJI[profile.avatarBase]`.
  Home nằm trong entry nên nhập từ module **dữ liệu**, không nhập từ `AvatarShopScreen` (màn lazy) —
  kéo cả màn tủ đồ vào đồ thị khởi động để đổi một hằng số là một món nợ không cần thiết.
* **`src/components/shop/AvatarShopScreen.tsx`** — xoá `SHOP_MASCOTS` cục bộ (4 khai báo emoji thứ hai),
  preview và thẻ chọn bạn cùng đọc `MASCOT_EMOJI`; `handleSelectMascot(mId: ChildProfile['avatarBase'])`
  nên chỗ gọi bỏ được cast `m.id as typeof profile.avatarBase`.
* `tests/t49b-shop-tabs-cover-catalog.test.ts` đổi sang `SHOP_MASCOTS` từ `data/shopCatalog`
  (test vẫn đọc **danh sách thật**, chỉ khác nơi khai).

**Không đổi trong lượt này** (§7): Home vẫn không ghép các ô `equipped` — `grep -c equipped
src/components/home/HomeScreen.tsx` = **0**, và `EQUIP_LAYER` của tủ đồ được chỉnh theo ô `w-28` nên
chép nguyên sang Home sẽ vỡ bố cục.

## 3. Test viết **trước**, đã đỏ vì đúng nguyên nhân

`tests/t50a-home-mascot-single-source.test.ts` — 5 test (`a1`–`a5`), `renderToString` trên cả hai màn:

| Test | Khoá gì |
|---|---|
| a1 | `Object.keys(MASCOT_EMOJI)` đúng union `avatarBase` **và** bốn hình đôi một khác nhau |
| a2 | `SHOP_MASCOTS` ↔ `MASCOT_EMOJI` khớp id ⇒ không bạn nào không có hình |
| a3 | chọn `owl` ⇒ preview tủ đồ 🦉 **và** Home 🦉, đồng thời Home ≠ 🐰 |
| a4 | Home = tủ đồ cho **cả bốn** bạn, và bốn hình khác nhau |
| a5 | Home tham chiếu `MASCOT_EMOJI`, không còn ternary tự viết |

RED chạy trên chính trạng thái mang bệnh (`HomeScreen.tsx` khôi phục ternary 3 nhánh), log
`mutation-A-home-ternary-3-nhanh.txt` — đỏ vì đúng symptom chứ không vì thiếu import:

```
× a3  AssertionError: expected '🐰' to be '🦉'
× a4  owl: Home 🐰 ≠ tủ đồ 🦉: expected '🐰' to be '🦉'
× a5  expected '…' not to match /avatarBase === 'bear' \?/
Tests  3 failed | 2 passed (5)        a1 + a2 là characterization (xanh từ đầu, khoá nguồn)
```

GREEN: `Tests 5 passed (5)` và `tests/t49b-…` vẫn `8 passed` — lát cắt refactor trung gian
(trích hằng số ra module, chưa đổi hành vi) được chạy riêng để đỏ chỉ có một lý do.

## 4. Cổng + bằng chứng

| Lệnh | Kết quả |
|---|---|
| `npm run verify` | **EXIT=0** · **125 file / 1547 test** pass · `Duration 30.59s` · `Main chunk: index-BZswaFkc.js = 214 kB → PASS (meets 450 kB goal)` — `verify.txt` |
| boot graph | `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html \| sed 's#^#dist/#' \| sort -u \| xargs wc -c \| tail -1` ⇒ `438617 total` byte = **428.3 kB** |
| entry | `index-vYzkzZ5R.js` **213.7 kB** → `index-BZswaFkc.js` **214.0 kB** (219 142 byte) — `src/` đổi nên **đổi hash**; +0.3 kB là `MASCOT_EMOJI`/`SHOP_MASCOTS` vào entry, vẫn cách trần 600 và mục tiêu 450 một khoảng lớn |
| `npm run build && node qa/run-one.mjs evidence/2026-11-04-T50A/probe-t50a-home-mascot.mjs` | **`QA PASS — 3 step(s), 0 errors`** + 4 ảnh — `probe-PASS.txt` |
| `node qa/run-one.mjs qa/golden-path.mjs` | `QA PASS — 28 step(s), 0 errors` — `regression-probes.txt` |
| `node qa/run-one.mjs qa/mobile-home.mjs` | `QA PASS — 0 step(s), 0 errors` — `regression-probes.txt` |
| `node qa/run-one.mjs qa/parent-controls.mjs` | `QA PASS — 7 step(s), 0 errors` — `regression-probes.txt` |
| `node qa/run-one.mjs qa/responsive-a11y.mjs` | `QA PASS — 0 step(s), 0 errors` — `regression-probes.txt` |

Probe **không** đặt trong `qa/` ⇒ tổng probe vẫn **30** (`ls qa/*.mjs qa/*.cjs` trừ `lib.mjs`, `run-one.mjs`).

## 5. Ablation — bỏ guard, cả test **lẫn** probe phải đỏ

| Đột biến | Cấp | Kết quả |
|---|---|---|
| `HomeScreen.tsx` trở lại ternary 3 nhánh | test | `mutation-A-home-ternary-3-nhanh.txt` ⇒ **3 failed \| 2 passed (5)**, a3/a4 báo đích danh `🐰` vs `🦉` |
| cùng đột biến, `npm run build` rồi chạy probe trên `dist/` | probe | `probe-MUTATED-home-ternary-3-nhanh.txt` ⇒ **`QA FAIL — 4 error(s) at A-owl`**: `A-owl: Home vẽ "🐰" … mong "🦉"` · `B-owl: Home "🐰" ≠ tủ đồ "🦉"` · `C: Home vẽ trùng hình cho nhiều bạn (🐻 🦊 🐰)` · `C: cú vẫn hóa thỏ trên Home ⇒ ternary cũ còn sống`; `facts.homeSeen = bear=🐻 fox=🦊 rabbit=🐰 owl=🐰`, `distinctHomeShapes 3` |
| xoá khoá `owl` khỏi `MASCOT_EMOJI` | biên dịch | `mutation-B-mascot-emoji-thieu-owl.txt` ⇒ `error TS2741: Property 'owl' is missing … required in type 'Record<"bear" \| "fox" \| "owl" \| "rabbit", string>'` — guard mà một **mảng** runtime không bao giờ cho được |
| đặt `owl` = `rabbit` = cùng 🐰 | test | `mutation-C-hai-mascot-trung-emoji.txt` ⇒ **3 failed \| 2 passed (5)** với `emoji trùng nhau: 🐻 🦊 🐰 🐰: expected 3 to be 4`; log chụp **cả hai** cổng trong một lượt nên "`tsc` vẫn xanh" là số đo chứ không phải lập luận: `TYPECHECK_EXIT=0` rồi `VITEST_EXIT=1` ⇒ a1 là lớp duy nhất bắt được |

Bản sửa **đã** nằm trong HEAD `2852798` ⇒ mỗi đột biến hoàn tác bằng `git checkout -- src/<file>` và
`git status --short -- src/` phải in rỗng trước khi chạy cổng cuối (bốn lần đột biến trong bảng trên
đều đóng theo khuôn đó).

## 6. Vì sao probe có bước C và bước D

* **C (chống xanh rỗng):** a1/a4 chỉ so chuỗi emoji, nên một selector bám phải node tĩnh vẫn cho ra
  bốn giá trị "đúng". C đòi mỗi ô là **một** phần tử duy nhất, không rỗng, và giá trị phải **đổi khi
  đổi `avatarBase`**; bản đột biến làm C đỏ bằng `distinctHomeShapes 3` chứ không chỉ A/B.
* **D (DEF-022b, chỉ ghi sự thật):** dựng hồ sơ `equipped` đủ **7** ô + `unlockedItems` tương ứng rồi
  đo ô avatar Home ⇒ `innerHTML = "🦉"`, `equipLayers = 0`. Không assert, vì lát cắt này chưa sửa nửa đó;
  con số 0 là bằng chứng DEF-022(b) còn mở và sẽ đỏ tự nhiên khi có người ghép lớp.

## 7. Còn mở

* **DEF-022(b)** — Home không composite bất kỳ ô trang bị nào (đo ở §6D). Sửa đúng cần một component
  preview dùng chung có tỉ lệ responsive, không phải chép `EQUIP_LAYER` (class `text-3xl`, offset
  `-top-3`, `inset-0` đều chỉnh theo ô `w-28` của tủ đồ).
* `handleSelectMascot` và hai đường mặc/mua vẫn bỏ qua kết quả `StorageService.saveChildProfile`
  ⇒ cùng họ `DEF-020`; 70+ lời gọi `save…` khác cần một quyết định chính sách trước khi sửa.
* Nhãn `storage-unavailable` của tủ đồ chỉ được *đọc thành lời*, không hiện chữ.
* Lớp preview `aria-hidden`: bé thấy trang bị nhưng máy đọc màn hình thì không.
