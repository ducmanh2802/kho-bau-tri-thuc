# T52 — Trang chủ gọn hơn và nhẹ hơn khi tải lần đầu

Ngày đo: **2026-11-04** · lát cắt sau **T51** (Home ghép lớp trang bị). Branch `main`, nội dung =
`HEAD` + thay đổi của đợt này. Yêu cầu nguyên văn: *"tối ưu trang chủ cho gọn và load nhanh"*.

Mọi con số dưới đây đo trên **`dist/` thật** (không phải dev server) bằng
`evidence/2026-11-04-T52/probe-home-compact-load.mjs` qua `qa/run-one.mjs`, hai lượt: `truoc`
(dựng lại 2 file từ `HEAD`, build, đo) và `sau` (bản T52, build, đo). Cùng máy, cùng cỡ màn.

## 1. Đo trước — cái gì đang phình

| Chỉ tiêu | 375×667 | 1280×800 |
|---|---|---|
| Chiều cao trang | **3 781 px** (5.67 màn) | **3 109 px** (3.89 màn) |
| Node DOM trong `<main>` | 399 | 399 |
| Animation CSS vô hạn đang chạy | **5** (`bounce`, `float`, `gradient-pan`, `pulse-slow`, `pulse-subtle`) | 5 |
| Entry `index-D4JIfahy.js` | **219 963 byte** (214.8 kB) | như trên |
| Mỗi việc hôm nay hiện **hai lần** | 3/3 (ô biểu tượng + khối "Danh Sách Nhiệm Vụ") | 3/3 |

Bảng khối ở 375 px (probe đo từng con trực tiếp của thân Home):

```
357 hero | 124 banner đăng nhập | 430 thẻ môn | 253 nhiệm vụ | 360 lối tắt
185 hệ thống động lực | 1425 thẻ "nên học gì" | 334 khối danh sách nhiệm vụ lặp
```

Hai nguồn lãng phí rõ nhất: **334 px vẽ lặp lại đúng 3 việc đã có ô biểu tượng**, và
**entry 214.8 kB** chứa cả thẻ gợi ý dưới màn hình đầu, pháo giấy, hộp đăng nhập.

## 2. Sửa

**`src/components/home/HomeScreen.tsx`**

* **Bỏ hẳn khối "Danh Sách Nhiệm Vụ"** (`quests.map` thứ hai). Ô biểu tượng giờ in **đủ tên việc**
  trong 2 dòng (`line-clamp-2` + `[overflow-wrap:anywhere]`) thay vì cắt `slice(0, 10) + '…'` —
  nếu không, bỏ danh sách là bé mất chỗ đọc tên việc.
* **Bỏ 2 animation vô hạn**: `animate-gradient` trên khối hero (nền gradient chạy suốt, một khối
  lớn) và `animate-pulse-slow` trên emoji ✨.
* **Thẻ "nên học gì tiếp theo" nạp động** (`lazy(() => import('../learning/NextBestActionCard'))`)
  bọc `Suspense fallback={null}`. Nó nằm dưới màn hình đầu ở **cả** 375 px lẫn 1280 px, và tự dựng
  skeleton trong lúc chờ DecisionEngine.
* **Pháo giấy nạp động trong `handleClaimChest`** — chỉ chạy khi bé mở được rương (một lần/ngày).
* Khoảng cách gọn lại: `py-3 md:py-5 space-y-3.5 sm:space-y-4`, hero `p-3.5 sm:p-4 md:p-5`,
  ô môn `min-h-[120px] md:min-h-[132px]` (trước 140/150), ô lối tắt/động lực `min-h-[88px]`.

**`src/components/auth/CloudSyncBanner.tsx`** — `AccountModal` (hộp đăng nhập Google của ba mẹ)
nạp động, chỉ mount khi `isModalOpen`; nó chỉ mở khi ba mẹ bấm banner nên không có lý do nằm trong
lượt tải đầu.

Không thêm dependency, không đổi dữ liệu, không đổi chuỗi nhãn nào mà `qa/*.mjs` đang bám vào.

## 3. Đo sau

| Chỉ tiêu | Trước | Sau | Đổi |
|---|---|---|---|
| Trang 375×667 | 3 781 px (5.67 màn) | **3 349 px (5.02 màn)** | **−432 px, −11.4 %** |
| Trang 1280×800 | 3 109 px (3.89 màn) | **2 665 px (3.33 màn)** | **−444 px, −14.3 %** |
| DOM trong `<main>` | 399 | **365** | −34 node |
| Animation vô hạn | 5 | **3** (`bounce`, `float`, `pulse-subtle`) | −2 |
| Việc hiện hai lần | 3 | **0** | −3 |
| Entry `index-91ZWxzIR.js` | 219 963 B (214.8 kB) | **201 040 B (196.3 kB)** | **−18 923 B, −8.6 %** |
| Nhóm JS lần tải đầu | 439 438 B | **420 515 B** | −18 923 B (−4.3 %) |
| CSS lần tải đầu | 165 862 B | 166 222 B | +360 B (Tailwind sinh thêm class mới) |

Bảng khối sau: `353 hero | 124 banner | 430 thẻ môn | 251 nhiệm vụ | 336 lối tắt | 181 động lực |
1425 thẻ "nên học gì"` — khối lặp 334 px đã biến mất, phần còn lại là cắt khoảng cách.

**Không** dùng FCP làm bằng chứng: hai lượt chạy ra 544 ms và 920 ms, đảo chiều so với thứ tự
trước/sau ⇒ đây là nhiễu máy, không phải cải thiện. Probe cố ý không assert thời gian paint.

**Về đánh đổi của việc tách chunk:** số request tăng 27 → 36 và `NextBestActionCard-B6zanhpO.js`
vẫn được tải ngay sau hydrate (nó ở dưới màn hình đầu nhưng vẫn render). Cái được là **entry nhẹ
hơn 18.9 kB** và đường tới first paint không phải parse/khởi tạo phần đó (M3 đo lại: trả về import
tĩnh thì entry **213 087 B**). Mạng chậm vẫn phải tải phần đó — nhưng không chặn màn hình đầu.

## 4. Test viết **trước**, đã đỏ vì đúng nguyên nhân

`tests/t52-home-compact.test.ts` — 6 test, đọc mã nguồn hai màn (chiều cao trang thì chỉ probe đo
được nên test khoá **nguyên nhân**, probe khoá **kết quả**).

| Test | Khoá gì |
|---|---|
| 1 | `quests.slice(0, 3).map` chỉ còn **một** chỗ; không còn chữ `Danh Sách Nhiệm Vụ` giữa hai thẻ |
| 2 | không `q.title.slice(`; `{q.title}` trần đúng **một** lần và nằm trong `line-clamp-2` |
| 3 | không `className="…animate-gradient"` / `animate-pulse-slow` |
| 4 | `NextBestActionCard` **không** import tĩnh, phải `lazy(() => import('../learning/…'))` |
| 5 | pháo giấy không import tĩnh, phải `import('../../services/confetti')` |
| 6 | `AccountModal` không import tĩnh trong banner, phải `lazy(() => import('./AccountModal'))` |

RED (`red-green-test.txt`): `git checkout HEAD --` 2 file ⇒ **`6 failed (6)`**, mỗi test đỏ đúng
chuỗi bị đột biến (`Danh Sách Nhiệm Vụ`, `q.title.slice(`, `animate-gradient`, import tĩnh
`NextBestActionCard`, `fireCelebrationConfetti`, `AccountModal`). GREEN: **`6 passed (6)`**.
Bản test đầu tiên bị **3 test đỏ oan** trên mã đã sửa vì khớp chữ trong comment và `${q.title}`
trong `aria-label`; đã siết lại thành `className="…"` và `[^$]\{q\.title\}` trước khi chốt.

## 5. Cổng + bằng chứng nhìn thấy được

| Lệnh | Kết quả |
|---|---|
| `npm run verify` | **EXIT=0** · **128 file / 1566 test** (T51: 127/1560) · `Duration 38.73s` · `Main chunk: index-91ZWxzIR.js = 196.3 kB → PASS (meets 450 kB goal)` — `verify.txt` |
| probe trước | **`QA FAIL — 9 error(s) at vp375`** — `probe-truoc-FAIL.txt`, ảnh `01-home-375-truoc.png` · `02-home-1280-truoc.png` |
| probe sau | **`QA PASS — 2 step(s), 0 errors`** — `probe-sau-PASS.txt`, ảnh `01-home-375-sau.png` · `02-home-1280-sau.png` |

Probe đặt trong `evidence/` chứ **không** trong `qa/` ⇒ tổng probe vẫn **30**.

## 6. Ablation — bỏ guard thì probe phải đỏ

| Đột biến | Kết quả |
|---|---|
| **M1**: khôi phục khối "Danh Sách Nhiệm Vụ" (`quests.map` thứ hai) | `QA FAIL — 5 error(s)`: `mỗi việc hiện hai lần [cả 3 việc]`, `391 node > 380`, `3697 px > 3400`, `3027 px > 2700` — `mutation-M1-khoi-danh-sach-lap.txt` |
| **M2**: trả `animate-gradient` về hero | `QA FAIL — 2 error(s)`: `4 animation vô hạn [bounce, float, gradient-pan, pulse-subtle]` ở cả hai cỡ màn — `mutation-M2-animation-vo-han.txt` |
| **M3**: `NextBestActionCard` import tĩnh (bỏ `lazy`) | `QA FAIL — 2 error(s)`: `entry 213087 byte > 209920 byte`; build in `index-mM_4xnvp.js = 213.08 kB` — `mutation-M3-import-tinh-next-best-action.txt` |

M3 cũng là phép thử cho **cách đo**: nếu chỉ tin `check:budget` (trần 600 kB, mục tiêu 450 kB) thì
213 kB vẫn "qua"; trần 205 kB của probe mới là thứ bắt được việc tách chunk bị gỡ.

Hoàn tác: 2 file T52 giữ bản sao ở `%TEMP%`, `cp` lại rồi build lại; `git status` không còn dấu vết
đột biến trong `src/` (kiểm ở lượt `verify` cuối).

## 7. Vì sao probe viết như vậy

* **Tắt cache HTTP trước lượt đo** (`Network.setCacheDisabled`): `run-one.mjs` đã mở trang một lần
  trước khi gọi probe, nên lượt đo thấy cache ấm và Resource Timing trả `encodedBodySize = 0`.
  Lượt đo đầu tiên đọc ra `entryBytes = null` vì đúng lý do này.
* **Dùng `decodedBodySize`, không `encodedBodySize`**: 62 791 B (gzip) nói về đường truyền, còn
  lượng JS máy bé phải parse là 219 963 B. Trần 209 920 B đặt trên con số parse được.
* **Đếm việc lặp bằng cách bỏ cây con `[data-testid="decision-engine-card"]`**: thẻ gợi ý **được
  phép** nhắc lại tên việc (đó là mục đích của nó); so khớp nguyên chuỗi chứ không so tiền tố, vì cả
  3 việc đều mở đầu bằng "Học 2 bài". Bản probe đầu tiên so tiền tố 8 ký tự nên báo nhầm 3 việc trùng.
* **Animation đếm theo `iterations === Infinity` và `playState === 'running'`**, không đếm theo tên
  class — Tailwind có thể sinh class mới, nhưng cái máy phải vẽ mỗi frame mới là thứ tốn pin.
* **Chiều cao trang có trần riêng cho từng cỡ màn** (3 400 / 2 700 px) chứ không so tỉ lệ: "gọn" là
  số màn phải cuộn, và ở 1280 px một thay đổi 50 px đổi số màn nhiều hơn ở 375 px.

## 8. Còn mở

* **Thẻ "nên học gì tiếp theo" chiếm 1 425 px = 42 % trang mobile** — lớn hơn cả 6 khối còn lại
  cộng lại. Không cắt trong đợt này: `qa/decision-engine.mjs` đọc toàn bộ node `decision-recommendation`
  và các bước B/C phụ thuộc đúng thẻ nào được render ⇒ cắt phải sửa probe đó cùng lúc.
* **CSS lần tải đầu 166.22 kB** (render-blocking) — vẫn là ứng viên số một cho "load nhanh", chưa đụng.
* **Thẻ môn đang vẽ vòng tiến độ giả "50 %"** cho mọi môn (quan sát khi đo, chưa sửa — cần biết
  tiến độ thật theo môn từ đâu).
* **`DEF-024`** (66 lời gọi `save…` vứt kết quả), **`DEF-019(a)(b)(c)(e)`**, **`DEF-011`** — nguyên trạng.
