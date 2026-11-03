# T48B — máy gắp không được hứa "Đã lưu" khi trình duyệt từ chối ghi (`DEF-020(a)`)

## 1. Bệnh đo được

`StorageService.drawGacha()` (`src/services/storage.ts:2632`) ghi phần thưởng rồi **bỏ qua** kết quả ghi:

```ts
StorageService.saveChildProfile(profile);
StorageService.saveMotivationState(motivation);
StorageService.recordQuestEvent({ kind: 'gacha' });
return { ok: true, reason: 'ok', stickerId, isNew, … };   // ← hứa, dù chưa có byte nào nằm xuống máy
```

`writeJSON` (`src/services/storage.ts:302`) **cố ý** trả `boolean` — `false` khi `setItem` ném, tức hai
tình huống thật: Safari/chế độ ẩn danh chặn `localStorage` và hết dung lượng. `saveChildProfile` (`:1162`)
và `saveMotivationState` (`:1583`) chuyển giá trị đó lên cho caller, nhưng caller duy nhất đọc nó tính
đến trước đợt này là một chỗ khác.

Phép đo (chạy trên `main` `258ec68`, **trước** khi sửa):

| Lệnh | Kết quả |
|---|---|
| `grep -rn "StorageService\.save" src \| wc -l` | **79** dòng |
| `grep -rho "StorageService\.save[A-Za-z]*(" src \| wc -l` | **78** lời gọi thật (dòng còn lại là chú thích ở `readingEngine.ts:536`) |
| `git grep -n "if (StorageService\.save" HEAD -- src` | **1** chỗ đọc kết quả — `storage.ts:1099` |

Hậu quả nguyên văn với bé lớp 1: bấm "Gắp Ngay" ⇒ hộp kết quả bắn confetti, chơi nhạc thắng, in
"Đã lưu vào Bộ Sưu Tập!", **tải lại trang** thì sticker lẫn vé đều về như cũ. Bé mất một lượt gắp mà
không nhận được gì, và còn được báo là đã nhận.

Cùng hộp kết quả còn một lời hứa sai thứ hai: nhãn `"Hôm nay bé đã gắp đủ 5 lượt."` là **hằng số**,
trong khi giới hạn thật lấy từ `StorageService.getGachaDailyLimit()` (`:2610`, `0` = không giới hạn).
T45A đã sửa *logic* cho đúng cài đặt của ba mẹ nhưng bỏ lại *câu chữ* — ba mẹ giới hạn 3 lượt thì bé bị
đoạn văn bản nói láo về số lượt của mình.

## 2. Cách sửa

Hai luật, một chỗ mỗi luật:

1. **Service**: `drawGacha` xét cả hai lượt ghi; hỏng bất kỳ ⇒ `return { ok: false, reason:
   'storage-unavailable' }` và **không** trả `stickerId`/`isNew` (không có sticker nào được sở hữu).
   `GachaResult['reason']` thêm thành viên `'storage-unavailable'` — lý do thuộc về **máy**, không phải
   về bé, nên không được nhập vào ba lý do kia (`no-ticket` · `daily-limit` · `rewards-off`).
2. **UI** (`src/components/motivation/GachaMachineScreen.tsx`): nhánh riêng cho `storage-unavailable`
   với nhãn "Máy không lưu được sticker vào máy này. Bé nhờ ba mẹ bật lại phần lưu nhé!". Gộp vào nhãn
   "hết lượt" sẽ là **lời dối thứ hai** — bé vẫn còn vé, vẫn còn lượt, chỉ là phần thưởng không nằm
   xuống máy được. Nhãn giới hạn đổi thành số thật: `đã gắp đủ ${dailyLimitLabel} lượt`.
3. **Thứ tự viết biên lai** (phát hiện khi sửa): `addRewardHistory` ghi vào khoá **cài đặt ba mẹ**
   (`PARENT_SETTINGS`), tức một khoá *không* bị chặn ghi. Bản cũ viết biên lai "5 sticker trùng tặng
   2 sao an ủi" **trước** khi biết lượt gắp có lưu được hay không ⇒ lịch sử phần thưởng kể một món quà
   chưa từng tồn tại. Nay mọi biên lai (`stars` an ủi, `sticker`, quest) đều nằm **sau** canh bảo ghi.

## 3. Lệnh tái lập

```bash
cd /d/trithuc/kho-bau-tri-thuc
npx vitest run tests/t48b-gacha-result-honest.test.ts      # 8 test
npm run build
node qa/run-one.mjs evidence/2026-11-04-T48B/probe-t48b-gacha-save-honest.mjs
node qa/run-one.mjs qa/gacha-machine.mjs                  # hồi quy cùng dist/
node qa/run-one.mjs qa/t33-feedback-timers.mjs            # hồi quy cùng dist/
npm run verify
```

Probe đi qua cổng ba mẹ bằng `unlockParentDashboard`/`dismissLevelUpCelebration` trong `qa/lib.mjs`, và
chặn ghi bằng `page.addInitScript` **trước khi** app chạy — bọc `Storage.prototype.setItem` để ném
`QuotaExceededError` cho đúng hai khoá `kho_bau_child_profile` + `kho_bau_motivation`, đồng thời đếm
`window.__t48bBlockedWrites`. App path là thật; chỉ năng lực nền tảng (dung lượng) là được mô phỏng, vì
không có cách tất định làm đầy `localStorage` của người dùng thật.

## 4. Kết quả

| Artifact | Nội dung |
|---|---|
| `probe-t48b-gacha-save-honest.mjs` | 3 bước A/B/C, `errors: []`, 2 ảnh |
| `probe-green.txt` | `QA PASS — 3 step(s), 0 errors` · A: vé 5→4, sao 50→56, sticker kinds 0→2, text có "Đã lưu vào Bộ Sưu Tập!" · B: text `😢 Không Thể Gắp — Máy không lưu được sticker vào máy này…`, `blockedWrites: 2`, `beforeB === afterB` · C: máy dựng nguyên trạng |
| `probe-result.json` | số liệu thô của ba bước |
| `01-A-luu-duoc.png` | màn hình khi máy **ghi được** (lời hứa thật) |
| `02-B-khong-luu-duoc.png` | màn hình khi máy **ghi hỏng** (nhãn nói thẳng) |
| `mutation-unit.txt` | đột biến 1 (tháo canh bảo ghi) ⇒ `Test Files 1 failed (1)` · `Tests 4 failed \| 4 passed (8)` |
| `mutation-2-consolation-receipt.txt` | đột biến 2 (viết biên lai sao **trước** canh bảo) ⇒ `1 failed \| 7 passed (8)`, đúng test 5, kèm payload nguyên văn `{"type":"stars","amount":2,"description":"5 sticker trùng tặng 2 sao an ủi","itemId":"st_dongvat_1"}` |
| `mutation-probe.txt` | đột biến 1 trên `dist/` ⇒ `QA FAIL — 2 error(s)`: (1) "máy KHÔNG ghi được mà vẫn hứa đã lưu", (2) "hộp kết quả không nói thẳng là không lưu được" — cả hai lấy nguyên văn text `⛵ Sticker Mới! … Đã lưu vào Bộ Sưu Tập!` |
| `probe-regression.txt` | `qa/gacha-machine.mjs` `QA PASS — 4 step(s)` (`GACHA_EXIT=0`) + `qa/t33-feedback-timers.mjs` `QA PASS — 6 step(s)` (`T33_EXIT=0`), cùng `dist/` của lượt build này |
| `verify.txt` | `npm run verify` **EXIT=0** · **122 file / 1521 test** · `Duration 27.98s` · `Main chunk: index-BO_jehy4.js = 211.1 kB → PASS (meets 450 kB goal)` |

## 5. Ablation

Đột biến = **tháo đúng guard** (`if (!profileSaved || !motivationSaved) return …`), không short-circuit
hằng số, vì bài học T47G: `if (false && …)` giết cả guard lẫn test.

| Vòng | thay đổi | unit test | probe |
|---|---|---|---|
| 1 — bỏ canh bảo ghi | xoá `if (!profileSaved \|\| !motivationSaved) return …` | `4 failed \| 4 passed (8)` | `QA FAIL — 2 error(s)` đúng bước B; **bước A vẫn xanh** |
| 1 — đặt lại | khôi phục nguyên văn | `8 passed (8)` | `QA PASS — 3 step(s), 0 errors` |
| 2 — biên lai sao trước canh bảo | dời `addRewardHistory({type:'stars'…})` lên **trên** guard | `1 failed \| 7 passed (8)` (đúng test 5) | không chạy — lưới unit đã bắt, guard vẫn còn nguyên |
| 2 — đặt lại | khôi phục thứ tự sau guard | `8 passed (8)` | — |

Bước A xanh ở vòng 1 là điều muốn thấy: lưới chỉ bắt lời dối, không bắt mọi thay đổi.

**Bài học lưới chết (vòng 2, lần chạy đầu):** đột biến 2 vẫn `8 passed` — test 5 không đỏ. Nguyên
nhân nằm ở dữ liệu dựng sẵn: seed `owned[s.id] = i < 5 ? 2 : 1` cho ra `dupes = 6`, mà `6 % 5 ≠ 0`,
nên nhánh "5 sticker trùng tặng 2 sao" **không bao giờ chạy** — test chỉ khẳng định trên một điều
kiện không bao giờ kích hoạt. Đổi thành `i < 4` (4 bản trùng + 1 sticker vừa gắp = đúng 5) thì đột
biến mới đỏ. Trước khi tin một test khoá, phải chứng minh **điều kiện nó khoá thực sự bật** được;
một test chỉ so sánh `=== 0` trên biến không bao giờ đổi là test trang trí.

Test nguồn 6–8 còn khoá *câu chữ* và *kiểu ghi* (UI không được chứa `gắp đủ 5 lượt` cứng; phải có chuỗi
`storage-unavailable` gần nhãn "không lưu được"; thân `drawGacha` phải gán kết quả save vào biến rồi xét),
vì repo không có jsdom/testing-library — probe giữ hành vi, test nguồn giữ cho probe không bị chữa cháy
bằng cách xoá luôn điều kiện.

## 6. Điều chưa làm

- **`DEF-020(b)` — hai anh-em cùng khuôn, chưa sửa để giữ phạm vi một commit**:
  `claimLevelRewards()` (`storage.ts:2702-2703`) và `buyShopItem()` (`:2730`, `:2733`) cũng bỏ qua kết quả
  ghi. Nặng hơn máy gắp: `buyShopItem` **đã trừ sao** và **đã mở khoá món** rồi mới trả `ok: true`, nên
  tải lại trang bé mất cả sao lẫn món. Điều kiện đóng: mỗi hàm trả lý do "máy không lưu được" + test
  RED-trước + probe chặn `setItem` trên `dist/`.
- 78 lời gọi `StorageService.save*` còn lại phần lớn nằm trong các đường ghi không có lời hứa nào trên
  màn hình (tiến độ học, phân tích). Không tự phong defect hàng loạt; lát cắt sau chọn theo **câu hứa
  của UI**, không theo số chỗ gọi.
- `speakBritish()` (`src/services/britishSpeech.ts:155`) vẫn export mà không có caller — `DEF-019` ghi
  lại, cần quyết định xoá hay nối (xoá là sửa `src/`, không tự làm ở lượt này).

## 7. Đơn vị đo — cạm bẫy ghi lại tại đây

`vite build` in dung lượng theo **kB thập phân**, `scripts/check-budget` chia **1024** (KiB) nhưng vẫn gắn
nhãn `kB`. Cùng một file `index` hiện ra `216.18` ở output build và `211.1` ở cổng (`216.18 / 1.024 =
211.1`). Vì vậy: **không có** chuyện bundle phình 5 kB ở đợt này — `src/` đổi nên entry **đổi hash**
(`l9C6a6LW` → `BO_jehy4`) còn **kB đứng nguyên**; boot graph vẫn 3 file và `435661 total` byte = 425.4 kB.
