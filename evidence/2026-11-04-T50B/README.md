# T50B — tủ đồ báo "đã đổi" trong khi máy không lưu được (`DEF-023`)

Ngày đo: **2026-11-04** · lát cắt bug-hunt tiếp theo sau **T50A** (code `2852798` + docs `6ce845f`).
Branch `main`, nội dung = `6ce845f` + thay đổi của đợt này. Đóng **DEF-023** (riêng màn tủ đồ);
ghi mới **DEF-024** cho phần còn lại của app (§7, số đo ở đó).

## 1. Defect

Ba đường ghi hồ sơ trong `AvatarShopScreen` **vứt** giá trị trả về, và `writeJSON` cố ý trả `false`
khi trình duyệt chặn ghi (Safari private mode) hoặc hết dung lượng — nó không ném:

```bash
git show HEAD:src/components/shop/AvatarShopScreen.tsx | grep -cE "^\s+StorageService\.saveChildProfile"   # 3
git show HEAD:src/components/shop/AvatarShopScreen.tsx | grep -c "sound.speak"                              # 6
git show HEAD:src/components/shop/AvatarShopScreen.tsx | grep -c "role=\"alert\""                           # 0  (grep exit 1)
```

Ba hệ quả, cùng một khuôn với `DEF-020` (máy gắp, T48B) và `DEF-021` (quà cấp độ + mua món, T49A):

1. **Chọn bạn / mặc / cởi** — `setProfile(updated)` chạy vô điều kiện ⇒ giao diện nói "Bé đã chọn bạn
   Cú Thông Thái", tải lại trang thì hồ sơ vẫn `fox`. Bé tin mình đã đổi và không hiểu sao Home trả
   về con thỏ (chồng lên `DEF-022(a)` mà T50A vừa khép).
2. **Mua món** — sau `buyShopItem` trả `ok`, màn hình bắn confetti + `playLevelUp()` **trước** khi biết
   kết quả ghi hồ sơ; `buyShopItem` đã được T49A dạy nói thật, nhưng màn này vẫn không nghe.
3. **Thất bại `storage-unavailable`** — T49A đã gọi đúng tên (không đổ cho "bé thiếu sao") nhưng chỉ
   bằng `sound.speak`. Cả màn có **6** lời đọc và **0** node chữ nào nhìn thấy được ⇒ ba mẹ tắt tiếng
   (hoặc máy ở chế độ im lặng — mặc định của lớp 1) thì bé mất **toàn bộ** phản hồi.

## 2. Sửa — một file `src/`, không thêm dependency

`src/components/shop/AvatarShopScreen.tsx` (+66 / −6):

* Hai hằng số **export** đặt cạnh `EQUIP_OVERLAYS`, một nguồn cho cả banner lẫn giọng đọc:
  `NOTICE_MACHINE_NOT_SAVED` ("Máy không lưu được thay đổi này. Bé nhờ ba mẹ bật lại phần lưu của máy
  nhé!") và `NOTICE_UNLOCKED_NOT_EQUIPPED` ("Máy đã cất món quà nhưng chưa mặc được…"). Xuất khẩu để
  test đối soát được câu chữ, và để nhãn của **máy** không bị tái định nghĩa ở nơi khác.
* **Cả ba** chỗ ghi đổi thành `const saved = StorageService.saveChildProfile(…)` rồi
  `if (!saved) { setProfile(fresh …); setNotice(…); sound.playWrong(); sound.speak(…); return; }`.
  Hoàn tác về **đúng** hồ sơ đang nằm trên máy (`fresh` đọc lại từ `StorageService`), không phải về
  một bản tự viết lại — tránh trạng thái trong trí nhớ thành nguồn thật thứ hai.
* Nhánh mua: `sound.playLevelUp()` + `fireCelebrationConfetti()` chuyển xuống **sau** khi ghi được;
  nếu ghi hỏng thì rolled-back về `after` (sao đã tiêu, món đã về — T49A chọn rủi ro *thấy trùng*
  hơn *mất quà*) và báo `NOTICE_UNLOCKED_NOT_EQUIPPED`.
* Banner `{notice && (<div role="alert" aria-live="assertive" …>)}` kèm nút **Đã hiểu** `min-h-[44px]`
  — màn hình cho bé 6 tuổi không được phép chỉ biết dựa vào loa.

**Không đổi trong lượt này** (§7): 13 chỗ ghi `save…` vứt kết quả còn lại trong `src/components`,
và ba lời báo lỗi **của bé** (`rewards-off` / `level-locked` / `not-enough-stars`) vẫn chỉ có tiếng.

## 3. Test viết **trước**, đã đỏ vì đúng nguyên nhân

`tests/t50b-shop-machine-save-notice.test.ts` — 6 test, `renderToString` trên chính component +
mock `localStorage` chặn theo key (n5 dựng hồ sơ lành để chứng minh lưới không đỏ do dựng sẵn):

| Test | Khoá gì |
|---|---|
| n1 | màn có **đúng 3** lời gọi `saveChildProfile` và **cả 3** là `const saved = …` (không còn lời gọi vứt kết quả) |
| n2 | sau mỗi chỗ ghi, trong 320 ký tự phải có `if (!saved)` **và** `setNotice(` **và** `setProfile(` — hoàn tác + báo, thiếu một là đỏ |
| n3 | có node `{notice && (…}` với `role="alert"`; `setNotice(` xuất hiện ≥ 4 lần ⇒ mọi nhánh hỏng đều nói |
| n4 | nhãn nói **máy** và nói **lưu/mặc**, không được chứa chữ "sao" (không đổ lỗi cho bé) |
| n5 | hồ sơ bình thường ⇒ **không** có `role="alert"`, vẫn còn "Số sao của bé" (chống đỏ do dựng sẵn) |
| n6 | nhánh `storage-unavailable` của `buyShopItem` phải `setNotice(` — nửa T49A để ngỏ |

RED (`red-green-test.txt`): `4 failed | 2 passed (6)` — n1 báo đích danh ba dòng
`StorageService.saveChildProfile(updated);`, n2/n3/n6 báo thiếu nhánh hỏng / thiếu kênh chữ.
n4 + n5 **xanh ngay từ đầu là chủ đích**: hai hằng số được thêm vào file trước khi viết test, nên
phép đo không tự dối bằng cách so với code cũ. GREEN: `6 passed (6)`.

## 4. Cổng + bằng chứng

| Lệnh | Kết quả |
|---|---|
| `npm run verify` | **EXIT=0** · **126 file / 1553 test** pass (T50A: 125/1547) · `Duration 29.07s` · `Main chunk: index--gQhs43l.js = 214 kB → PASS (meets 450 kB goal)` — `verify.txt` |
| boot graph | `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html \| sed 's#^#dist/#' \| sort -u \| xargs wc -c \| tail -1` ⇒ `438617 total` byte = **428.3 kB** (không đổi so với T50A) |
| entry | `index-BZswaFkc.js` → `index--gQhs43l.js`, **214.0 kB = 219 142 byte** cả hai, gzip 62.81 → 62.80 kB. kB không đổi mà hash đổi là **bình thường**: hai câu notice nằm trong chunk lazy `AvatarShopScreen-B-c_Xglz.js` (8 887 byte), entry chỉ đổi **tên chunk tham chiếu**, và hai hash đều 8 ký tự nên độ dài entry bằng từng byte. |
| `npm run build && node qa/run-one.mjs evidence/2026-11-04-T50B/probe-t50b-shop-save-notice.mjs` | **`QA PASS — 4 step(s), 0 errors`** + 4 ảnh — `probe-PASS.txt` |
| `node qa/run-one.mjs qa/golden-path.mjs` | `QA PASS — 28 step(s), 0 errors` — `regression-probes.txt` |
| `node qa/run-one.mjs qa/parent-controls.mjs` | `QA PASS — 7 step(s), 0 errors` — `regression-probes.txt` |
| `node qa/run-one.mjs qa/mobile-home.mjs` · `qa/responsive-a11y.mjs` | `QA PASS — 0 step(s), 0 errors` — `regression-probes.txt` |
| `node qa/run-one.mjs evidence/2026-11-04-T49B/probe-t49b-shop-tabs.mjs` | `QA PASS — 5 step(s), 0 errors` — cùng màn tủ đồ, không hồi quy |

Probe đặt trong `evidence/` chứ **không** đặt trong `qa/` ⇒ tổng probe vẫn **30**
(`ls qa/*.mjs qa/*.cjs` trừ `lib.mjs`, `run-one.mjs`).

## 5. Ablation — bỏ guard, cả test **lẫn** probe phải đỏ

| Đột biến | Cấp | Kết quả |
|---|---|---|
| `if (!saved) {` đầu tiên → `if (false && !saved) {` | test | `mutation-A-guard-if-false.txt` ⇒ `1 failed \| 5 passed (6)`, đỏ **đúng** n2; n1 vẫn xanh vì chỗ ghi vẫn đọc kết quả — lưới chỉ đo cái nó tuyên bố đo |
| cùng đột biến, `npm run build` rồi chạy probe trên `dist/` | probe | vẫn trong `mutation-A-guard-if-false.txt` ⇒ **`QA FAIL — 3 error(s) at A`**: không hiện chữ · "preview đổi thành \"🦉\" dù máy chưa lưu gì ⇒ hình đang nói dối" · thẻ Cú đổi nhãn "Đang chọn ✓". Facts: `alert: null`, `avatarAfter: 🦉`, **`storedAvatarBase: fox`** — đúng lời hứa suông của DEF-023 |
| xoá cả khối JSX `{notice && ( … )}` | test | `mutation-B-khong-banner-jsx.txt` ⇒ `1 failed \| 5 passed (6)`, đỏ đúng n3 (state vẫn được đặt ⇒ chỉ mất **kênh chữ**) |
| xoá một dòng `setNotice(` trong nhánh `storage-unavailable` | test | `mutation-C-notice-bang-tieng.txt` ⇒ `1 failed \| 5 passed (6)`, đỏ đúng n6 — chính là chỗ T49A để ngỏ |
| `setNotice(NOTICE_MACHINE_NOT_SAVED)` → `setNotice(NOTICE_UNLOCKED_NOT_EQUIPPED)` | test | `mutation-D-t49a-guard-doi-hinh-dang.txt` ⇒ `1 failed \| 18 passed (19)`, đỏ **đúng** guard chữ của T49A |

Dòng cuối là **hồi quy thật của đợt này**, không phải đột biến trưng bày: cổng verify lần đầu chạy ra
`VERIFY_EXIT=1` (`Test Files 1 failed | 125 passed (126)` · `Tests 1 failed | 1552 passed (1553)`) vì
T49A khoá hành vi bằng `/storage-unavailable[\s\S]{0,400}không lưu được/` — hai chuỗi phải nằm cạnh
nhau, còn T50B chuyển câu chữ vào hằng số export cách nhánh ~110 dòng. Guard được viết lại **theo đúng
ý gốc** (tồn tại nhãn "máy không lưu được" · nhánh phải trỏ đúng tên nhãn · nhãn không được chứa chữ
"sao") chứ không nới và không xoá. Đây là khuôn "đổi hình dạng chớ đổi ý" mà `rename-visible-strings-breaks-probes`
đã cảnh báo, lần này người bị là **test của chính mình**.

Bản sửa **chưa** nằm trong HEAD khi chụp bốn đột biến ⇒ hoàn tác bằng node trên đúng một dòng đã đổi,
**không** dùng `git checkout -- src/…` (lệnh đó xoá luôn phần sửa của đợt); `git diff --stat -- src/`
sau mỗi lần hoàn tác trở lại đúng `1 file changed, 66 insertions(+), 6 deletions(-)`.

## 6. Vì sao probe viết như vậy

* **Bước C là bước chống đỏ do dựng sẵn:** A/B/D chỉ xanh nếu banner *thật sự* xuất hiện, còn C chạy
  **không chặn** gì và đòi `alert === null` + `storedAvatarBase` đổi `fox → owl`. Thiếu C thì một patch
  luôn bật banner vẫn qua cả ba bước kia.
* **Chặn ghi bằng `Storage.prototype.setItem`**, cài qua **cả** `addInitScript` lẫn `page.evaluate`
  idempotent: runner đã load page trước khi probe chạy nên init script không hồi tố — chỉ `evaluate`
  mới vá được navigation hiện tại.
* **Selector theo thẻ, không theo `ancestor`:** mẩu `[last()]` trên trục `ancestor` chọn **ngoài cùng**
  ⇒ bấm nhầm nút "Vườn Sao" trong nav ẩn. Đổi sang `div.p-4.rounded-2xl:has(> div h4:text-is("…"))` và
  `button.last()`.
* Probe đọc **cả** `localStorage` (`storedAvatarBase`, `storedEquipped`) chứ không chỉ DOM: bệnh của
  DEF-023 là DOM và máy nói khác nhau.

## 7. Còn mở

* **`DEF-024` (MỞ)** — phần còn lại của họ "hứa suông":
  `grep -rn "^\s*StorageService\.save[A-Za-z]*(" src --include=*.ts --include=*.tsx | wc -l` = **66**,
  trong đó `src/components` = **13** (`ParentDashboardModal.tsx` 11 × `saveParentSettings` ở dòng
  151→223 + 1 × `saveChildProfile` ở 237; `ReadingFluencyScreen.tsx:586` × `saveReadingParentRating`).
  Chưa sửa vì hai lý do có chủ đích: (a) đường của ba mẹ cần quyết định chính sách — báo lỗi *nhìn thấy*
  cho người lớn khác với báo cho bé 6 tuổi; (b) `saveParentSettings` còn dính `cloudSync` (T47C) nên
  phạm vi lớn hơn một lát cắt. Cùng đợt: ba nhãn **lỗi của bé** trong tủ đồ vẫn chỉ đọc bằng tiếng.
* **`DEF-022(b)`** — Home vẫn không ghép lớp `equipped` nào (`equipLayers = 0`, đo ở T50A §6D).
* Lớp trang bị trong preview tủ đồ vẫn `aria-hidden`: bé thấy đồ nhưng máy đọc màn hình thì không.
* Probe T50B nằm ở `evidence/`, chưa có chỗ nào trong `qa/` chạy nó định kỳ ⇒ hồi quy chỉ bị bắt khi
  ai đó gọi tên probe (giống mọi probe bằng chứng khác của repo).
