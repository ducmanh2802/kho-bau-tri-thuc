# T51 — Home ghép lớp trang bị: một component preview avatar chung (`DEF-022b`)

Ngày đo: **2026-11-04** · lát cắt bug-hunt tiếp theo sau **T50B** (code `1344796` + docs `d7c53e6`).
Branch `main`, nội dung = `d7c53e6` + thay đổi của đợt này. Đóng **DEF-022(b)** — điều kiện đóng
nguyên văn trong `docs/plan/RISK_REGISTER.md`: *"một **component preview avatar chung** có responsive
(tủ đồ dùng `w-28`, Home `w-20 sm:w-24 md:w-28`) kèm test so số lớp render với số ô `equipped` thật,
và probe chụp cả hai màn."*

## 1. Defect

T50A đã vá `DEF-022(a)` (Home vẽ sai bạn: chọn cú 🦉 mà về nhà thành thỏ 🐰) bằng một nguồn
`MASCOT_EMOJI`. Nhưng **lớp trang bị** vẫn chỉ tủ đồ vẽ:

```bash
git show d7c53e6:src/components/home/HomeScreen.tsx | grep -c "data-equip"          # 0
git show d7c53e6:src/components/shop/AvatarShopScreen.tsx | grep -c "equipped"      # 7 (bản đồ EQUIP_LAYER 7 ô)
git show d7c53e6:src/components/shop/AvatarShopScreen.tsx | grep -c "AvatarPreview" # 0 (chưa có component chung)
```

Hệ quả với bé: mua/mặc mũ, kính, áo, balo, thú cưng, khung, nền xong về Home thì **mất hết** —
chỉ còn con mascot trần. Tệ hơn, tủ đồ nói "Đang chọn ✓" nên bé tin đồ đang mặc thật.

Chặn đường bê nguyên bản đồ cũ sang Home: `EQUIP_LAYER` của tủ đồ dùng offset tuyệt đối
(`-top-3`, `text-3xl`) **chỉ đúng với ô `w-28`**; Home là `w-20 sm:w-24 md:w-28` ⇒ mũ 108.8 px
trong ô 73.3 px (đo được ở §5, đột biến M2).

## 2. Sửa — component dùng chung + CSS theo `cqi`, không thêm dependency

**`src/components/common/AvatarPreview.tsx` (mới).** Một chỗ duy nhất biết cách ghép lớp:

* `EQUIP_OVERLAYS = ['hat','glasses','shirt','backpack','pet','frame']` — mảng cũ được **chuyển**
  từ tủ đồ sang đây (T49B vẫn nhập nó từ đây, không định nghĩa lại).
* `background` vẽ **trước** mascot, sáu ô còn lại đè lên. Mỗi lớp là
  `<span data-equip={type} aria-hidden="true" className="kb-avatar-layer">`.
* `role="img"` + `aria-label` liệt kê **tên bạn + tên mọi món đang mặc** (kể cả `background`) ⇒
  trẻ dùng trình đọc màn hình biết mình mặc gì, không chỉ nghe "🦉". Emoji giữ `aria-hidden`.
* `frameClassName` do màn gọi truyền vào: Home `w-20 sm:w-24 md:w-28`, tủ đồ `w-28 md:w-32` ⇒
  hình dáng/khung/nền là của màn, cách ghép lớp là của component.

**`src/index.css`** — thêm 7 quy tắc `[data-equip='…']` + `.kb-avatar-preview`:

```css
.kb-avatar-preview { position: relative; display: flex; align-items: center;
                     justify-content: center; container-type: inline-size; }
.kb-avatar-layer { position: absolute; line-height: 1; }
[data-equip='hat'] { top: -11cqi; left: 50%; transform: translateX(-50%); font-size: 29cqi; }
…  /* glasses 31cqi/23cqi · shirt 4cqi/29cqi · backpack & pet -8cqi/23cqi · frame -12cqi/19cqi */
```

`cqi` = 1% bề rộng **của chính ô** (nhờ `container-type: inline-size`) ⇒ một bộ số chạy đúng cho
ô 73 px lẫn ô 104 px. Đây là chỗ duy nhất trong repo dùng container query unit; chọn nó thay vì
`vw` để ô Home (nhỏ) và ô tủ đồ (lớn) cùng đúng tỉ lệ trên **mọi** bề rộng màn hình.

**Hai màn** chỉ còn một dòng gọi component; `AvatarShopScreen` mất bản đồ `EQUIP_LAYER` (−52/+13),
`HomeScreen` đổi ô emoji thành `<AvatarPreview … />`. Thêm `shrink-0` cho khung tủ đồ: đo được
ô preview bị flex co còn **54.3 px** trên màn 375 px (ảnh hưởng sẵn có, bị probe bắt).

## 3. Test viết **trước**, đã đỏ vì đúng nguyên nhân

`tests/t51-avatar-preview-shared-layers.test.ts` — 7 test, **chỉ nhập module đã có** ở thời điểm
viết (nên đỏ là đỏ hành vi, không phải thiếu import/type). Dựng `renderToString` cho cả hai màn
với một hồ sơ mặc đủ 7 ô, đọc DOM bằng `data-equip` / `data-avatar-mascot`, đọc CSS bằng regex.

| Test | Khoá gì |
|---|---|
| v1 | Home mặc đủ 7 ô ⇒ vẽ **đủ 7** lớp, đúng emoji từng món |
| v2 | Home và tủ đồ render **cùng một tập lớp + cùng mascot** cho cùng hồ sơ ⇒ một nguồn |
| v3 | hồ sơ không mặc gì ⇒ **0** lớp ở cả hai màn, mascot vẫn nguyên (chống đỏ do dựng sẵn) |
| v4 | mọi `type` trong `AVATAR_SHOP_ITEMS` có **một quy tắc CSS** riêng ⇒ type mới không lọt lưới |
| v5 | thân quy tắc phải có `cqi` và **không** khớp `/\d(px|rem)\b/` ⇒ không quay lại offset tĩnh |
| v6 | cả hai màn `import { AvatarPreview` + `<AvatarPreview`, và **không** còn `EQUIP_LAYER`/`EQUIP_OVERLAYS` trong màn |
| v7 | `role="img"`, `aria-label` có tên bạn + **đủ 7** tên món ở cả hai màn; mọi `data-equip` đều `aria-hidden="true"` |

RED (`red-green-test.txt`): **`7 failed (7)`** — v1 `Home mặc 7 ô mà chỉ vẽ 0 lớp: expected {} to
deeply equal { hat: '🧢', … }`. GREEN: `12 passed (12)` (t51 + t50a).

Hai test cũ phải **đổi phép đo, không đổi ý**: `t50a` bám vào `animate-float …>🐻<` (markup Home cũ),
`t49b` nhập `EQUIP_OVERLAYS` từ tủ đồ. Cả hai đổi sang `data-avatar-mascot` / nhập từ component
chung; `t50a` a5 vẫn khẳng định "Home dùng một nguồn, không ternary".

## 4. Cổng + bằng chứng nhìn thấy được

| Lệnh | Kết quả |
|---|---|
| `npm run verify` | **EXIT=0** · **127 file / 1560 test** (T50B: 126/1553) · `Duration 38.22s` · `Main chunk: index-D4JIfahy.js = 214.8 kB → PASS` — `verify.txt` |
| boot graph | `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html \| sed 's#^#dist/#' \| sort -u \| xargs wc -c \| tail -1` ⇒ `439438 total` byte = **429.1 kB** (T50B: 438 617 = 428.3 kB) |
| CSS lần tải đầu | `index-BDsXnBR4.css` = **165 862 byte** = 161.97 kB — render-blocking, xem §7 |
| probe | **`QA PASS — 4 step(s), 0 errors`** — `probe-PASS.txt`, ảnh `01-home-375-du-7-lop.png` · `02-tu-do-du-7-lop.png` · `03-home-khong-mac-gi.png` |
| số đo trong trình duyệt | Home 375 px: ô **73.3 px**, **7** lớp, tỉ lệ `hat .29 · glasses .23 · shirt .29 · backpack .23 · pet .23 · background .45 · frame .19`; tủ đồ: ô **104 px**, cùng tỉ lệ; `shopScrollVsViewport = 375/375` (không tràn); `aria-label` **8** phần (bạn + 7 món) |

Probe đặt trong `evidence/` chứ **không** trong `qa/` ⇒ tổng probe vẫn **30**.

## 5. Ablation — bỏ guard, cả test **lẫn** probe phải đỏ

| Đột biến | Cấp | Kết quả |
|---|---|---|
| M1: tủ đồ tự vẽ mascot (`<span data-avatar-mascot>`), không dùng `<AvatarPreview>` | test | `mutation-M1-tu-do-tu-ve-mascot.txt` ⇒ `3 failed \| 4 passed (7)`, đỏ **đúng** v2 (hai màn lệch tập lớp) + v6 (không dùng component chung) + v7 (mất tên món). v4/v5 vẫn xanh vì CSS không đổi — lưới chỉ đo cái nó tuyên bố đo |
| M2: `container-type: inline-size` → `normal` | test | `mutation-M2-container-type-normal.txt` ⇒ **`7 passed (7)`** — **toàn bộ test vẫn xanh** |
| M2 (tiếp) | probe | cùng file ⇒ **`QA FAIL — 29 error(s) at A`**: `hat` **108.8 px trong ô 73.1 px = 1.488** (mong 0.29), `background` **168.8 px = 2.310** (mong 0.45), tủ đồ `hat 108.8 px trong ô 104 px = 1.046` ⇒ mũ to hơn cả đầu |
| M3: bỏ `background?.name` khỏi `aria-label` | test | `mutation-M3-aria-label-thieu-background.txt` ⇒ `1 failed \| 6 passed (7)`, đỏ **đúng** v7: `expected 'Cú Thông Thái · Mũ Lưỡi Trai…' to contain 'Nền Biển Xanh Rì Rào'` |

**M2 là bằng chứng quan trọng nhất của lát cắt này:** hình học của lớp trang bị là thứ mà test
`renderToString` **không nhìn thấy được** — bỏ `container-type` thì unit test vẫn 7/7 xanh trong khi
trình duyệt vẽ mũ 108.8 px trong ô 73.1 px. Chỉ probe mới là nhân chứng.

Hoàn tác sau mỗi đột biến: bản sửa **chưa** nằm trong HEAD nên **không** dùng `git checkout -- src/…`;
sửa lại đúng dòng, rồi chạy lại `npx vitest run tests/t51… tests/t50a… tests/t49b…` ⇒
`3 passed (3) · 20 passed (20)`. `git status` không còn dấu vết đột biến trong `src/`.

## 6. Vì sao probe viết như vậy

* **Bước A đo tỉ lệ, không đo "có vẽ hay không":** DOM có 7 lớp vẫn có thể là 7 lớp chồng đè lên
  nhau. Probe so `fontSize / ô` với bảng tỉ lệ mong đợi (±0.03) và đòi
  `getComputedStyle(preview).containerType === 'inline-size'`.
* **Bước B đổi cả kích cỡ lẫn vị trí đo:** nếu chỉ đo Home, một bản đồ `px` cứng vừa khít 73 px
  vẫn xanh. Đo thêm ô tủ đồ 104 px và tỉ lệ phải giữ nguyên ⇒ chứng minh "theo ô", không phải "may mắn đúng".
* **Bước C là bước chống đỏ do dựng sẵn:** hồ sơ trống ⇒ 0 lớp + mascot 🦉; thiếu C thì một bản sửa
  vẽ bừa 7 lớp cũng qua A/B.
* **Bước D đo kênh chữ:** `role="img"` và `aria-label.split(' · ').length === 8`; thiếu D thì
  bản sửa chỉ đúng cho người nhìn.
* Ảnh chụp lấy từ `dist/` thật (không phải dev server) qua `qa/run-one.mjs`; `run-one.mjs` luôn ghi
  ảnh vào thư mục probe nên lần chạy sau ghi đè — ảnh hiện tại là của lượt PASS cuối.

## 7. Còn mở

* **CSS lần tải đầu đang là 161.97 kB** (`index-BDsXnBR4.css`), render-blocking. Con số này lớn
  hơn cả phần tăng của `three-vendor` và là ứng viên số một của việc "load nhanh" trên trang chủ.
  Chưa đụng ở đây vì cắt CSS phải đo trước/sau bằng probe để không mất trạng thái hover/focus.
* **`DEF-024`** (66 lời gọi `save…` vứt kết quả, 13 trong `src/components`) — nguyên trạng.
* **`DEF-019(a)(b)(c)(e)`**, **`DEF-011`** — nguyên trạng.
* Probe T51 nằm ở `evidence/`, chưa có chỗ nào trong `qa/` chạy định kỳ ⇒ hồi quy chỉ bị bắt khi
  ai đó gọi tên probe (giống mọi probe bằng chứng khác của repo).
