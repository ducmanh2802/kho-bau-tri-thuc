# CHANGELOG

Mọi thay đổi đáng chú ý của **Kho Báu Tri Thức — Lớp 1** đều được ghi ở đây.
Format: [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/), version theo
[Semantic Versioning](https://semver.org/lang/vi/). Mục `Added / Changed / Fixed /
Tests` giữ tên tiếng Anh cho tooling đọc được; nội dung viết tiếng Việt.

Quy trình tạo ra các mục này: xem `docs/SDLC.md` §6.

## [Unreleased]

*(**Có mục mới sau bản `1.1.0`** — xem `### Fixed` bên dưới. Phần ghi chú này nói về các mục cũ: toàn bộ mục cũ đã chốt cho bản `1.1.0`, **đã tag và đẩy `v1.1.0` lên `origin`
ngày 2026-11-02/03**, và workflow `4. Release` đã tạo đối tượng release thật
(`curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/releases/tags/v1.1.0` ⇒ id `431754261`,
asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte, 0 lượt tải). Tag hiện hành `4f75f5d` đóng trên
`77d90ce`; tag đầu `6687667` ở `7d92246` đã xoá vì CI đỏ ở Install. Chữ ký Go/No-Go của người giữ repo
và UAT người đọc to vẫn chưa có, xem `docs/lifecycle/07_RELEASE_OPERATIONS.md` §3.)*

### Changed
- **`RISK-16`: điều kiện thứ hai nay có dữ liệu — commit code T47F khép đủ ba run vì lượt docs chờ lượt CI khép.**
  `4e47ff7033b7fbb28b29811793c05f2a059e2287` (code) push lúc `21:32:00Z`, ba run `completed success` lúc
  `21:33:09Z`; commit docs `5b361a7` (số liệu kiểm kê + §25) chỉ được đẩy sau `21:40Z` — khoảng cách **≈ 8
  phút** thay vì **47 s** như lượt T47 (§24). `total_count: 3` và **không** run nào bị `cancel-in-progress`
  cắt: `1. Quality` job 126219168193 `success` **40 s** · `2. Build + artifact` 126219168185 `success`
  **28 s** · `3. Browser QA` 126219168895 `success` `21:32:03Z→21:33:08Z` = **65 s**, bước "QA probe"
  `success`, bước 8 `skipped` vì không có lỗi. Docs `789520e` (§24) cũng có đủ ba run, QA job 126190556353
  **64 s**. **Phát biểu phải có phạm vi:** đây **không** phải lần đầu một commit code xanh cả ba workflow —
  `caff32a` (T42, §16) và `3eb7d12` (T43, §17) đã làm được; đúng là *lượt đầu sau `3eb7d12`* vì khoảng
  T44→T47 commit code luôn đi chung lệnh push với docs (`total_count: 0`) rồi `198a6d9` bị hủy. Kiểm kê
  chốt: workflow `03` trên `main` = **37 lượt** (`#37` `66e0fea` → `#74` `4e47ff7`), **cấp job 26/37 xanh ·
  9 đỏ · 2 cancelled** (§24: 24/35), chuỗi xanh tới tip **3 lượt** (`#72`→`#74`; đứt ở `#71` *bị hủy*, không
  vì đỏ). **Cạm bẫy mới cho người đọc sổ:** `workflow_runs[].conclusion` là **attempt mới nhất**, nên cấp run
  hôm nay báo `{"success":35,"cancelled":2}` — **chín lượt đỏ** mà §18 kiểm kê trực tiếp bằng
  `jobs[].conclusion` biến mất khỏi cái nhìn cấp run; chỉ đọc cấp run sẽ kết luận sai "chưa từng có lượt đỏ".
  **§25 thành mục hiện trạng**, thay §24; `docs/SDLC.md` §CI thôi *chép số* (§23 đã cảnh báo số chép sẽ lệch
  theo từng commit docs) và dẫn `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §25 kèm "tính tới tip
  `4e47ff7`". Ô 13 `docs/plan/TEST_PLAN.md` §16 **vẫn MỞ**: 26 lượt xanh chưa có một lần đỏ *thật* bị cổng chặn sau `3b0122c`.
- **Cách né `RISK-16` có hiệu lực nhưng chỉ một nửa — điều kiện thứ hai vừa bị chính phiên T47 lộ ra.**
  Commit code `198a6d9a2ff787669394da4349d277c1990acb6f` được push **một mình một lệnh** ⇒
  `curl -s https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/actions/runs?head_sha=$(git rev-parse 198a6d9)`
  trả `total_count: 3` (`1. Quality` job 126181318638 `success` **38 s** · `2. Build + artifact`
  126181318505 `success` **32 s** · `3. Browser QA` 126181317728 **`cancelled`** ở giây **61**). Đây là
  **mẫu code đầu tiên** trong lịch sử sổ này có run của chính nó (ba commit code liền trước
  `6a07883e…`/`c2a8626e…`/`8083b106…` đều `total_count: 0`). Nhưng run bị hủy vì lượt docs `e0fcb6f…`
  được đẩy **47 s** sau đó, cùng ref nên chen vào đúng nhóm `concurrency` của workflow (group
  `ci-qa-…`, `cancel-in-progress: true` — `.github/workflows/03-qa-browser.yml:17-19`). Đọc từng bước của job bị hủy
  (`actions/runs/41711756710/jobs`) thì **bước 7 "QA probe" đã `success`** — phần mất chỉ là bước 8
  (annotation, vốn `skipped` khi không có lỗi) ⇒ hệ quả với bằng chứng *nhẹ*, nhưng nếu probe đỏ thì
  bằng chứng đỏ đã bay cùng lệnh hủy. ⇒ Điều kiện đóng (a) của `RISK-16` nay đọc là **hai** vế: mỗi
  commit code một lệnh push riêng **VÀ** chờ lượt CI khép (≈ 90 s cho cả ba workflow) rồi mới push tiếp;
  hoặc dùng (b) `cancel-in-progress: false` cho `ci-qa-*`. Kiểm kê chốt (§23 + ba lượt mới đo trực tiếp):
  workflow `03` trên `main` = **35 lượt** (`#37` `66e0fea` → `#72` `e0fcb6f`), **cấp job 24/35 xanh ·
  9 đỏ · 2 cancelled**, chuỗi xanh tới tip **1** (`e0fcb6f`) và chuỗi ngắn lần này **không** phải tín
  hiệu chất lượng. **§24 thành mục hiện trạng**, thay §23; các file khác dẫn đường dẫn tới
  `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §24 và không đo lại cho commit docs-only. Đã trỏ
  `docs/plan/RISK_REGISTER.md` `RISK-10` + `RISK-16`, `docs/plan/TEST_PLAN.md` §16 ô 13, `evidence/README.md`,
  `.ai/CURRENT.md` về §24. Ô 13 **vẫn MỞ**: chưa có đỏ *thật* bị cổng chặn sau `3b0122c`.
- **Vòng kiểm kê chốt §23, kèm quy tắc để hồ sơ hiện trạng không phải đổi theo từng commit docs.**
  `a6c472b` (chính commit hồ sơ §22, **không đổi `src/`**) được push **một mình** ⇒ tra bằng SHA đủ
  `40` ký tự `a6c472b4c69a774dd08aac1dfb5b321d909f562d` ⇒ `total_count: 3` (`1. Quality` 41696285737 ·
  `2. Build + artifact` 41696285812 · **`3. Browser QA` 41696285755**, job 126127579573 `success`
  `18:42:03Z→18:43:30Z` = **87 s**, bước 7 `success`, bước 8 `skipped`). Đây là **phép đối chứng một
  biến** đầu tiên của `RISK-16`: đặt cạnh `8083b106…` (commit code T46, đi chung lệnh push với docs
  ⇒ `total_count: 0`), biến số duy nhất là **số commit trong một lệnh push**. Kiểm kê chốt: workflow
  `03` trên `main` = **32 lượt**, cấp run `{"success":31,"cancelled":1}` (không dùng làm tỷ lệ),
  khoảng không còn cờ = **19 lượt = 18 xanh + 1 `cancelled` + 0 đỏ**, **cấp job suy ra 22/32 xanh ·
  9 đỏ · 1 cancelled**, chuỗi xanh tới tip = **8**. Vì **mỗi commit docs lại thêm đúng một lượt CI**,
  dán số tuyệt đối ở nhiều file làm hồ sơ lệch vĩnh viễn sau mỗi commit ⇒ ba quy tắc ghi trong §23:
  (1) mục hiện trạng là §23, các file khác **dẫn đường dẫn**, nếu chép số thì **kèm "tính tới tip
  `<sha>`"**; (2) **chỉ đo lại khi có commit code mới**; (3) không kết luận "không có lượt CI" từ SHA
  ngắn. Đã trỏ `docs/SDLC.md` §4, `docs/specs/BRD.md` R-04, `docs/lifecycle/README.md`,
  `docs/lifecycle/HARNESS.md`, `docs/lifecycle/07_RELEASE_OPERATIONS.md`, `docs/plan/TEST_PLAN.md`
  ô 13, `docs/plan/RISK_REGISTER.md` `RISK-10` + `RISK-16`, `.ai/CURRENT.md` về §23
  (`evidence/2026-11-03-QA-RACE/ci-gate-race.txt`). Ô 13 **vẫn MỞ**: 22 lượt xanh vẫn chưa có một lần
  đỏ *thật* bị cổng chặn sau `3b0122c`.
  Tra `https://api.github.com/repos/ducmanh2802/kho-bau-tri-thuc/actions/runs?head_sha=<7 ký tự>` trả
  `total_count: 0` cho **mọi** commit — GitHub so khớp nguyên SHA 40 ký tự. Bằng chứng ngay trên commit
  vừa push `4659d99`: dạng ngắn ⇒ `0`, dạng đủ ⇒ **3 lượt** `run_number` 68 tất cả `completed success`
  (`1. Quality` 41693925966 · `2. Build + artifact` 41693925955 · **`3. Browser QA` 41693926095**, job
  126119341251 `golden path trên Chromium` `success` `18:27:07Z→18:28:29Z` = **82 s**, bước 7 `success`).
  Nghĩa là khuôn "commit code không có lượt CI nào" trước đây **có thể** chỉ là sản phẩm của cú pháp.
  Đo lại ba commit code bằng SHA đủ (`6a07883e093d3a0f9013dde4650a029b8b6a5b27` ·
  `c2a8626ee766762c39bba93f2584a57b3651ccb2` · `8083b1062b9241de1a1d69773d42cd6cb67cbe54`) ⇒ cả ba vẫn
  `total_count: 0` ⇒ `RISK-16` **đứng**, còn các *lệnh dẫn chứng* thì sai và đã sửa
  (`evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §20, `ci-census-main-wf03-round2.txt`,
  `evidence/2026-11-03-T45/README.md`, `evidence/README.md`, `docs/plan/TASK_PLAN.md` §II,
  `.ai/CURRENT.md`). Vòng kiểm kê **ba-b** (một request vì khoảng đang xét không còn cờ
  `continue-on-error`): workflow `03` trên `main` = **31 lượt** (`#37` `66e0fea` → `#68` `4659d99`), cấp
  run `{"success":30,"cancelled":1}` **không** dùng làm tỷ lệ, khoảng không còn cờ = **18 lượt** =
  **17 xanh + 1 `cancelled` + 0 đỏ**, **cấp job toàn sổ suy ra 21/31 xanh · 9 đỏ · 1 cancelled**, chuỗi
  xanh tới tip = **7**. Phát hiện phụ có giá trị nghiệp vụ: lượt `#68` là commit **chỉ sửa
  docs/evidence** mà vẫn chạy đủ ba cổng và xanh ⇒ trigger **không** lọc theo loại file, nên cách né
  `RISK-16` là **push commit code riêng một lượt**, không phải "đẩy kèm docs cho tiện". Đóng một nợ cũ:
  quy tắc treo ở vòng kiểm kê một ("không viết CI xanh cho `c7e9a00` cho tới khi tra được") nay tra
  được `c7e9a00cf47fc1c987ad5467d630096d8b762350` ⇒ `total_count: 3`, cả ba success (`#60`). Vùng hiện
  trạng cập nhật: `docs/SDLC.md` §4, `docs/specs/BRD.md` R-04, `docs/plan/RISK_REGISTER.md` `RISK-10` +
  `RISK-16`, `docs/plan/TEST_PLAN.md` §16 ô 13, `docs/lifecycle/README.md` — và **hai chỗ sót** từ đợt
  §20 (`docs/lifecycle/HARNESS.md`, `docs/lifecycle/07_RELEASE_OPERATIONS.md` vẫn ghi **13/22**). Ô 13
  **vẫn MỞ**: 21 lượt xanh chưa chứng minh cổng *cắt* được commit hỏng. Dòng lịch sử giữ nguyên số theo
  quy ước `docs/specs/README.md` §"Quy ước chung" 1. Bằng chứng: §22 `evidence/2026-11-03-QA-RACE/ci-gate-race.txt`.
- **Tỷ lệ cổng QA chuyển từ "đếm cộng dần" sang kiểm kê — và kiểm kê bắt ba chỗ hồ sơ sai.**
  Cách đếm cũ ("4/10", "8/14", "10/16") là *số đã công bố + lượt mới*, nên không có lệnh nào tái tạo
  ra nó và mỗi lượt bị bỏ quên làm lệch vĩnh viễn. Đo lại một lượt, lấy **mọi** run
  `head_branch=main` của workflow `03` kể từ `66e0fea` rồi đọc `jobs[].conclusion` (không đọc
  `workflow_runs[].conclusion`: trước `3b0122c` cờ `continue-on-error` khiến run luôn `success` dù job
  đỏ — 50/50 run cấp run đều `success`) ⇒ **13/22 lượt xanh, 9 đỏ**: bảy lượt đỏ liên tiếp đầu
  (`66e0fea`→`37fd35e`) ⇒ xanh đầu `afb9eeb` ⇒ hai lượt đỏ cuối (`8e6f9f5`, `80c7e39`) ⇒ **mười hai
  lượt xanh liên tiếp** (`2d2ca27`→`3eb7d12`, T43). **Chín lượt cuối không còn lưới**, ba lượt trong số
  đó trên commit đổi `src/` (`06b8962` 4 file · `caff32a` 10 · `3eb7d12` 1 — đếm file bắt đầu `src/`
  trong `git show --name-only` của từng commit). Ba chỗ sai bị bắt: (a) cụm "đỏ ở bước QA probe
  **bốn lần liên tiếp**" thật ra là **bảy** — `bd3f2a7` (41494831619), `08eacc7` (41498110362),
  `37fd35e` (41499645998) chưa từng được ghi, và `bd3f2a7` nằm *giữa* `2db8715` với `e777457` nên chuỗi
  bốn chưa bao giờ liền mạch; (b) lượt `1cac775` (41528603801, job 125562681976 `success` 63 s) xanh mà
  chưa từng được ghi; (c) run 41523541700 `af19a22` bị tính là lượt `main` trong khi nó là
  `pull_request` trên `dependabot/github_actions/actions/checkout-7`. Một số đổi ý nghĩa: `afb9eeb`
  "63 s" là **cấp run**, **cấp job 59 s**. Vòng đo tốn 23 request trên hạn mức chưa-token 60/giờ ⇒ mỗi
  giờ chạy được ~2 lần. Refresh **vùng hiện trạng** (`docs/SDLC.md` §4, năm file trong
  `docs/lifecycle/` gồm `README`, `HARNESS`, `CHECKLIST`, `01_LIFECYCLE_BOARD`,
  `07_RELEASE_OPERATIONS`, `docs/specs/BRD.md` R-04,
  `docs/plan/TEST_PLAN.md` ô 13); **dòng lịch sử giữ nguyên số** theo quy ước `docs/specs/README.md`
  §"Quy ước chung" 1. Bằng chứng: `evidence/2026-11-03-QA-RACE/ci-census-main-wf03.txt` (lệnh + output
  + bảng run→commit), chỉ-số 22 dòng `…-raw.txt` (`grep -c failure` ⇒ 9, `grep -c success` ⇒ 13),
  luận bàn §17–§18 `ci-gate-race.txt`. **Ô 13 vẫn MỞ** — chưa có probe đỏ *giả* nào bị chặn oan, và sau
  khi bỏ cờ cũng chưa có đỏ *thật* nào xảy ra. Không đổi `src/`, `qa/`, `tests/`, không thêm dependency.
- **Đã xoá cờ `continue-on-error` của job `qa-smoke` — `3. Browser QA` từ đây là cổng chặn thật.**
  Điều kiện bỏ cờ ghi ngay trong comment của `.github/workflows/03-qa-browser.yml` ("xanh liên tiếp
  vài lần trên main") và trong `docs/lifecycle/07_RELEASE_OPERATIONS.md` §2; cổng đạt **ba lượt xanh
  liên tiếp**: `2d2ca27` run 41515106575 (66 s) · `c9fd2b4` run 41516820864 (127 s) · `eb4b7b2`
  run 41518983585 (job 125529796579, `2026-11-02T20:25:03Z` → `20:26:12Z` = **69 s**, bước 7 "QA
  probe" `success` / bước 8 chẩn đoán `skipped`) ⇒ tổng **4/10 lượt xanh**. Test hợp đồng viết
  **trước** bản sửa: `tests/t31-bug-hunt-fixes.test.ts` đọc YAML, cắt riêng khối job `qa-smoke` và
  cấm khoá `continue-on-error:` ở đầu dòng (RED `1 failed \| 21 passed (22)`); vì thế assertion là
  regex khoá YAML chứ không phải chuỗi trần — comment mới vẫn *kể tên* cờ để giải thích lịch sử.
  Sửa net **+1 dòng** nên con trỏ annotation `line=59` phải thành `line=60`; đã in lại dòng 59–61
  để xác nhận nó vẫn chỉ đúng bước `tee probe-run.log` (annotation chỉ sai dòng còn hại hơn không
  có annotation). **Chưa chứng minh được:** chưa từng thấy một lần probe đỏ *thật* bị cổng chặn,
  nên ô 13 của `docs/plan/TEST_PLAN.md` §16 vẫn MỞ; lượt CI chạy trên chính commit bỏ cờ là lần đầu
  probe đi không có lưới — **và lượt đó xanh**: `3b0122c` · run 41523226603 · job 125544242836
  `success` sau **69 s** (bước 7 "QA probe" `success`, bước 8 `skipped`; `1. Quality` run 41523226401
  và `2. Build + artifact` run 41523226400 cũng success) ⇒ cổng đạt **5/11 lượt xanh**, bốn lượt cuối
  liên tiếp, và đây là kết luận success **không còn cờ che**. `npm run verify` đo lại đúng nội dung
  commit: EXIT=0 · 90 file / **1287** test · `Duration 22.15s` (lượt pre-push: `22.36s`). Bằng chứng:
  `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §9–§13 và
  `evidence/2026-11-03-QA-RACE/verify-1287.txt` (`npm run verify` EXIT=0 · 90 file / **1287** test ·
  `Duration 22.09s` · `Main chunk: index-TgwkX59u.js = 204.2 kB → PASS`, `src/` không đổi nên cả hash
  lẫn kB đứng nguyên). **Lượt thứ hai không còn lưới cũng xanh:** push docs `6e30794` · run 41526285381 · job 125554732285 `success` sau **72 s** (bước 7 "QA probe" `success`, bước 8 `skipped`; `1. Quality` run 41526285257 và `2. Build + artifact` run 41526285281 cũng success) ⇒ tỷ lệ hiện trạng **6/12 lượt xanh, năm lượt cuối liên tiếp**; một push thuần tài liệu đi qua đủ ba cổng chặn merge nên kết quả xanh không đến từ sửa code. Cổng máy trên working tree docs: `npm run verify` EXIT=0 · 90 file / **1287** test · `Duration 22.26s` (pre-push hook: `22.24s`). **Lượt thứ ba không còn lưới cũng xanh:** `e961815` · run 41527657645 · job 125559437705 `success` `21:21:54Z`→`21:22:51Z` = **57 s**, bước 7 "QA probe" `success`, bước 8 `skipped` ⇒ **7/13 lượt xanh** *tính tới `e961815`* (sáu lượt cuối liên tiếp, **ba** lượt cuối chạy không còn cờ). Vì **mọi** push vào `main` đều thêm một mẫu mới, tỷ lệ từ đây ghi **kèm mốc commit đã đo** — quy tắc dừng ở §13 `ci-gate-race.txt`.

### Fixed
- **T47F — "Chơi lại" cùng màn không dựng lại bảng chơi ở năm trò, và bảng chọn màn của trò tô màu vẫn không về được màn dễ (`DEF-018(a)`).**
  Nút "Chơi lại" (cả ở biên lai phần thưởng) gọi `stage.restartGame()`, hàm này bump `nonce`
  (`StorageService.bumpPlayNonce`) nhưng **không đổi** `tier` khi bé chơi lại đúng màn hiện tại ⇒
  mọi hiệu ứng khởi tạo chỉ keyed `[stage.tier]` (hoặc `[stage.tier, stage.roundIdx]`) sẽ
  **không chạy lại**, và năm trò rơi đúng vào đó: `NumberTowerGame.tsx` — tháp vẫn đầy
  "Tầng 1 (+3), Tầng 2 (+5)…" trong khi điểm vừa về 0, bé tưởng mình đã xây lại xong;
  `SentenceScrambleGame.tsx` — `setAssembledWords([])` cùng `setTrainDriving(false)` đều bị bỏ, mà
  `handleWordTap` có `if (stage.locked || trainDriving) return;` ⇒ ván trước kết thúc ở round 1 thì
  tàu chữ **đang chạy mãi mãi**, mọi cú chạm bị nuốt (soft-lock, nặng hơn lỗi mỹ thuật);
  `ClockMoneyGame.tsx` — gợi ý của ván cũ treo sang ván mới; `EnglishAnimalSoundGame.tsx` +
  `ListenPickPhonicsGame.tsx` — đề mới mà không có tiếng đọc, mất luôn gợi ý chính của trò
  "Nghe và chọn". Năm chỗ sửa cùng khuôn: thêm `stage.nonce` vào deps.
  **Một nghi oan đã đo lại**: `ColoringCanvasGame` **không** cần `nonce` — `onRestart` của nó là
  wrapper riêng gọi `clearCanvas()` theo lệnh, và probe chạy trên `dist/` **trước khi sửa** cho thấy
  tranh vốn đã bị xoá (`coverageAfterReplay: 0`, `canvasNodeReplaced: false`). Defect **thật** của
  đúng wrapper đó là bỏ tham số `targetTier` ⇒ `stage.restartGame()` fallback `unlockedTier` (màn khó
  nhất từng mở), tức đường sửa `DEF-017` lọt lại trên trò duy nhất có wrapper — giờ
  `restartGame = (targetTier?: number) => { stage.restartGame(targetTier); clearCanvas(); }`.
  Bằng chứng `evidence/2026-11-04-T47F/`: probe `probe-t47f-restart-clears-board.mjs` chạy **hai lần**
  trên `dist/` (bản bỏ guard — QA FAIL 3 lỗi A2/B2/C3; bản có guard — QA PASS 5 bước / 0 lỗi / 7 ảnh;
  C0 + C2 đứng nguyên giữa hai lần chạy, tức lời "nghi oan" là số đo chứ không phải lập luận),
  `tests-RED-no-guard.txt` (`3 failed | 2 passed (5)`), hồi quy `qa/games.mjs` (vòng qua cả 31 tựa,
  `errors: []`) + `qa/golden-path.mjs` (28 bước, 0 lỗi) trong `probe-regression.txt`, và
  `verify-exit0.txt` (**119 file / 1502 test**, `Duration 24.79s`, entry `index-DbfbtGg4.js`
  **211.1 kB** — `src/` đổi nên entry **đổi hash** còn **kB đứng nguyên**, boot graph vẫn
  `435603 total` byte).
- **T47 — năm defect: một phím vẫn xoá ván khi đang tạm dừng, "Không giới hạn" của ba mẹ bị tính ra 20 phút, quyền ba mẹ không lên cloud, dòng thưởng 0 XP, bảng chọn màn không về được màn dễ.**
  (a) **`DEF-013` phần còn lại — `Esc` lúc đang tạm dừng **thoát luôn ván****: tấm che
  "Đang tạm dừng" (`absolute inset-0 z-20`, dựng khi `isRealtime && isPaused`) là một lớp phủ thật mà
  `useModalHistory` chỉ khai `overlayOpen: showTierModal`, nên `Esc` rơi thẳng xuống `history.back()`.
  `GameOverlayState` + `escapeOverlayKind()` xếp lớp theo **z-order** (bảng "Chọn Màn & Độ Khó" `z-50`
  trước, tấm che `z-20` sau) và `pauseVeilOpen` đòi `Boolean(onTogglePause)` — trò không có đồng hồ thì
  không có tấm che, nên `Esc` không bị nuốt. Probe trên `dist/` (`evidence/2026-11-04-T47/probe-t47-escape-pause.mjs`,
  4 bước / 5 ảnh, exit 0) chứng minh cả bốn chiều: tạm dừng → `Esc` **mở khoá, ván còn**; `Esc` lần hai
  vẫn thoát; trò không đồng hồ một lần `Esc` thoát ngay; và hồi quy T46C (bảng chọn màn vẫn là ưu tiên
  số một). (b) **ba mẹ chọn "Không giới hạn" (`dailyLimitMinutes: 0`) bị ngân sách hoá thành 20 phút**:
  `decisionEngine` tính `input.budgetMinutes ?? (dailyLimitMinutes || DEFAULT_BUDGET_MINUTES)` nên `0` —
  giá trị *có nghĩa* — bị `||` nuốt. Sửa bằng `resolveDailyBudgetMinutes()` thuần (test được) +
  `P39_DECISION_POLICY.UNLIMITED_BUDGET_MINUTES: 240`; dùng **số hữu hạn** vì `JSON.stringify(Infinity)`
  ra `null` nên một lần persist là hỏng vĩnh viễn. **Bài học đỏ giả:** test đầu tiên so `dailyPlan` qua
  `decide()` xanh *cả trước lẫn sau* khi sửa — kế hoạch tự sinh ngắn hơn cả trần 20 phút nên hiệu số
  20/240 không hiện ra ở tầng đó; phép thử phải đặt ở `buildDailyPlan` với `fiveRecs` 5 × 12 = 60 phút. (c) **`saveParentSettings()` ghi
  `localStorage.setItem` thô**: `writeJSON` là chỗ **duy nhất** phát `kho_bau_storage_change` mà
  `cloudSync.ts` nghe để hẹn giờ auto-sync ⇒ giờ học / phần thưởng / độ khó bé vừa cài không bao giờ rời
  khỏi máy đang gõ, kể cả khi người lớn đã bật đồng bộ. Đổi sang `writeJSON`. (d) **Thử Thách Tuần ghi
  thêm dòng thưởng `xp=0`**: `recordWeeklyChallengeCompleted` vừa gọi `recordQuestEvent` (đường thưởng
  thật) vừa `addRewardHistory({ amount: 0, … })`, nên mỗi tuần lại thêm một dòng vô nghĩa vào lịch sử
  **50** phần thưởng — bé xem dashboard thấy "Hoàn thành Thử Thách Tuần +0" lặp lại và các phần thưởng
  thật bị đẩy ra khỏi cửa sổ. Bỏ `addRewardHistory`. (e) **bảng "Chọn Màn & Độ Khó" không về được màn
  *dễ* hơn**: `selectGameTier` **chỉ mở khoá** (`Math.max`), còn `restartGame()` đọc `unlockedTier` một
  cách mù ⇒ bé đang bí ở Màn 5 mà bấm Màn 1 thì bảng nạp lại Màn 5, chỉ tổ mất điểm. `restartGame(targetTier?)`
  nhận đúng màn bé bấm; `jumpToTier` (không nơi nào gọi) bị **xoá** để chỉ còn **một** đường đổi màn.
  Ablation: `mutation-1-veil-declared.txt` (đặt `pauseVeilOpen = false`) chỉ làm đỏ **1** test vì hợp
  đồng nguồn vẫn nhìn thấy tên identifier ⇒ **probe mới là bằng chứng hành vi**, không phải regex;
  `mutation-2-hook-guard.txt` đỏ đúng test chốt `Boolean(onTogglePause)`; cả hai probe chạy trên build
  bỏ chốt đều `QA FAIL` (`probe-t47-RED-no-guard.txt`, `probe-t47e-RED-no-guard.txt`), và file sửa được
  hoàn tác có **md5 đối chiếu**. `tests/t47a…t47e` = **37** test; cổng `npm run verify` **EXIT=0** ·
  `118 file / 1497 test` · `Duration 27.64s` · entry `index-vqb0Kx4n.js` **211.1 kB**.
  **Còn mở:** `T47F` ("Chơi lại" không xoá trạng thái bảng ở trò tháp/tàu chữ) và `T47G` (lượt sai của
  năm trò chưa có phản hồi hình ảnh). Bằng chứng: `evidence/2026-11-04-T47/`.
  (a) **`DEF-010` câu chào theo giờ biến mất với bé đã có streak**: `getEncouragementPhrase()`
  `return` chuỗi **khen** khi `hasStreak`, tức câu chào `Chào buổi sáng/chiều/Tối rồi…` chỉ vang lên
  ở lần chơi đầu tiên — mà lần chơi đầu chỉ có một. Sửa: câu chào luôn đứng trước, lời khen nối làm
  phụ (`${greeting} Bé học đều lắm, giỏi quá!`). Đo bằng probe mục **C1**, chặn `speechSynthesis.speak`
  bằng `addInitScript` **trước** lúc app boot (nếu cài sau mount thì lời chào đã nói xong):
  `streak = 4` ⇒ chuỗi duy nhất được nói là `"Tối rồi, bé nhớ ngủ sớm nhé! Bé học đều lắm, giỏi quá!"`.
  (b) **`DEF-012` nút loa icon-only không có tên truy cập được**: `<button onClick={playVoice}>` chỉ
  chứa `<Volume2>` nên screen reader đọc "button" giữa lúc bé đang làm bài *Nghe & Chọn* — đúng trò
  mà âm thanh là đầu vào. Thêm `aria-label="Nghe lại đề"`, kèm **quy ước quét** mọi nút icon-only trong
  `src/components/games/**` (test nguồn) và một sweep **DOM thật** trong `[role="dialog"]` (probe B2).
  Hai ứng viên từng bị nghi hoá ra **đúng** vì chúng có `title` — HTML AAM cho phép `title` làm tên dự
  phòng — nên luật test viết là "`aria-label` **hoặc** `title`", không phải "bắt buộc `aria-label`".
  (c) **`DEF-013` `Esc` làm mất ván đang chơi**: `keydown` gắn trên `window`, lớp phủ "Chọn Màn & Độ
  Khó" chỉ chặn bằng CSS, nên một phím vừa đóng bảng vừa gọi `onExit` ⇒ bé mất cả ván chỉ vì muốn tắt
  bảng chọn. `useModalHistory(onExit, { overlayOpen, onCloseOverlay })` + `shouldEscapeCloseOverlay()`:
  khi có lớp phủ, `Esc` **đóng lớp phủ và không bóc entry history của modal** (dialog lồng nhau).
  Ablation ở cả ba lát: `ablation-A-escape-routing-RED.txt` `1 failed | 6 passed (7)` ·
  `ablation-B-speaker-label-RED.txt` `2 failed | 4 passed (6)` ·
  `ablation-C-header-greeting-RED.txt` `2 failed | 4 passed (6)`; và **cùng probe** chạy trên build
  không có chốt (c) ⇒ `QA FAIL — 2 error(s) at A`. `tests/t46a…t46c` = **19** test; cổng
  `npm run verify` **EXIT=0** · `113 file / 1460 test`. **Chưa route** màn tạm dừng và biên lai phần
  thưởng — hai overlay đó vẫn để `Esc` đi thẳng tới `onExit` (`K-05`).
  Bằng chứng: `evidence/2026-11-04-T46/`.
- **T45 — năm defect: hai quyền của ba mẹ bị code bỏ qua, một lớp phủ không chặn bàn phím, một thành tựu không thể đạt.**
  (a) **`maxGachaPerDay` chỉ dashboard đọc, máy gắp thì bỏ qua**: `GachaMachineScreen.tsx` tự đặt
  `MAX_DAILY_DRAWS = 5` còn `drawGacha()` quy `0 → 5`, trong khi chính UI ba mẹ và `tests/t18a` ghi
  "0 nghĩa là không giới hạn" ⇒ ba mẹ cho 10 lượt thì bé vẫn dừng ở lượt 5, ba mẹ mở ∞ thì màn vẫn
  in "x / 5". Thêm `StorageService.getGachaDailyLimit()` (`null` = không giới hạn) dùng chung cho
  **service lẫn màn**, nhãn `∞` thay cho `Infinity`. Bằng chứng (probe
  `evidence/2026-11-03-T45/probe-t45-gating.mjs`, mục C): `maxGachaPerDay = 0` ⇒ "Hôm nay: 6 / ∞ lượt",
  vé 8 còn 2, không hiện "Hết Lượt Hôm Nay".
  (b) **"Tắt phần thưởng" vẫn rò hai đường**: `checkAchievements()` và `recordCompetitionResult()` cộng
  XP/sao mà không hỏi `areRewardsEnabled()` — 4 nơi gọi thì 2 nơi có chốt, 2 nơi không. Chuyển chốt vào
  **trong hàm** để không phụ thuộc người gọi, và giữ nguyên việc lưu kết quả thi + phân tích vì đó là dữ
  liệu học chứ không phải phần thưởng.
  (c) **bé tự nới giờ học không cần người lớn**: nút nhãn "Ba mẹ: Cho phép học thêm 10 phút" gọi
  `onExtend`, và `App.tsx` ghi thẳng `dailyLimitMinutes + 10` vào cài đặt vĩnh viễn. Prop đổi thành
  `onAskParent`; lối này chỉ mở bảng Ba Mẹ ở tab Cài đặt, giới hạn chỉ đổi sau cổng phép tính. Probe mục
  B: `dailyLimitMinutes` **vẫn 1** khi chưa trả lời cổng.
  (d) **lớp phủ "Chọn Màn & Độ Khó" che bảng nhưng không chặn phím**: màn che là `absolute inset-0 z-50`
  nên chuột bị chặn thật (hit-test `elementFromPoint` trả `<div>`, phủ 390×844 px), còn `keydown` gắn trên
  `window` nằm ngoài cây DOM đó ⇒ bé bấm phím là nộp đáp án sau lớp phủ, mở ra đã thấy "Chưa đúng". Thêm
  `isGameInputBlocked()` + `stage.inputBlocked` trong `src/hooks/useGameStage.ts`, **10** trò chơi bàn phím
  dùng chốt này. Probe mục A có hai bước đối chứng: không che ⇒ 2 phím làm đổi ô ếch, che ⇒ 4 phím đứng
  nguyên kể cả nhãn "Câu 2/5", đóng lớp phủ ⇒ phím lại ăn.
  (e) **Thử Thách Tuần phát id cố định** `weekly-challenge-week-1`, mà `completedWeeklyChallenges` là một
  **tập id** ⇒ hoàn thành tuần thứ hai không thêm phần tử nào, stat `weeklyChallenges` kẹt ở 1 và thành
  tựu `ach_weekly_3` ("Vượt qua 3 Thử Thách Tuần") là điều kiện không thể đạt. Nay `weeklyChallengeIdOf()`
  sinh id theo `weekKeyOf(localDateKey())` (`src/services/streakEngine.ts`), nhãn đổi thành "Thử Thách
  Tuần Này". **Chưa sửa**: pool câu vẫn lấy từ `getAllQuestions()` nên mọi tuần cùng một đề — ghi ở
  `docs/plan/RISK_REGISTER.md`.
- **T44 — bốn lỗi người dùng chạm tới, trong đó một lỗi chỉ probe render mới thấy.**
  (a) **`disabled` làm lời giải thích không bao giờ tới bé**: ô bài bị khoá và rương chủ đề trên
  `src/components/subject/SubjectScreen.tsx` dùng `disabled`, nên cú chạm bị trình duyệt chặn ngay
  tại đó — hai thông điệp đã viết sẵn ("đã mở rồi" / "chưa học hết bài") là code chết. Đổi sang
  `aria-disabled` + một lối `rejectTurn()` duy nhất phát **ba kênh** (bíp sai + `sound.speak()` +
  banner `role="status" aria-live="polite"`, tự ẩn sau 5 s) và tách rõ **bốn** lý do rương không mở
  (phần thưởng bị tắt · đã mở rồi · chưa hết bài · kho dữ liệu chưa nạp). Probe `page.mouse.click`
  thật ở 375×812 xác nhận cả chữ lẫn tiếng tới bé: `evidence/2026-11-03-T44/probe-t44-tap.txt`
  mục `blocked[]`. (b) **44 hộp chạm dưới 44px** (`AGENTS.md` §3) trong **31/31** trò — nặng nhất là
  dải "Màn {tier} ▾" dùng chung **152×14** ở `GameModalWrapper.tsx` và hai nút loa icon-only
  36×36 / 28×28 (`SyllableBuilderGame.tsx`, `EnglishColorBalloonGame.tsx`); `tests/t44d` quét class
  trong source báo **0** vì cỡ sinh từ nội dung/padding chứ không từ `w-*`/`h-*`. Danh sách RED:
  `evidence/2026-11-03-T44/probe-t44-tap-RED-first-sweep.txt`, trạng thái hiện tại: **0** offender.
  (c) `kho_bau_ioe_store` vẫn là literal riêng ngoài `STORAGE_KEYS` ⇒ `resetProgress` (đợt T43)
  không quét được tiến độ IOE; nay về registry — **18** key tập trung, tổng **19**.
  (d) `Math.random`/`Date.now` còn lọt trong đường sinh đề của `src/services/adaptive.ts` và màn
  IOE, trái bất biến tất định `AGENTS.md` §2 ⇒ `seedForLocalDay` (hash FNV) + `shuffleSeeded`, phần
  lựa câu rơi xuống module dữ liệu mới `src/data/englishIoe/selection.ts`.
- **T43 — "Đặt lại tiến độ" nay quét đủ khoá dữ liệu của bé (`DEF-001`).** Hồ sơ pha 11
  (`docs/11-decommissioning/decommission.md`) bắt đầu liệt kê từng khoá bằng lệnh
  `sed -n '/^const STORAGE_KEYS = {/,/^};/p' src/services/storage.ts | grep -cE "^[[:space:]]+[A-Z_]+: 'kho_bau"`
  ⇒ **17** khoá, trong khi `StorageService.resetProgress()` liệt kê tay **13** — ba khoá
  `kho_bau_review_days` (danh sách ôn), `kho_bau_game_first_seen` (dấu "đã chơi" trên bảng chọn màn)
  và `kho_bau_tree_water` (cờ tưới cây hôm nay) **sống sót** sau khi bấm reset, trái đúng lời hứa UI
  "Đã đặt lại tiến độ về dữ liệu mới tinh ban đầu!" (`ParentDashboardModal`). Cách sửa không phải
  thêm ba dòng `removeItem` cho đủ, mà đổi **cơ chế**: `childDataResetKeys()` sinh danh sách **từ**
  `STORAGE_KEYS` trừ allowlist `RESET_KEEP_KEYS`, nên lần sau thêm một khoá dữ liệu mới buộc người
  viết phải quyết định quét-hay-giữ ngay tại allowlist — không âm thầm sót nữa. Allowlist chỉ có
  `PARENT_SETTINGS`: đó là lựa chọn của người lớn trên thiết bị (chế độ đêm, âm thanh, phần thưởng),
  xoá nó khiến ba mẹ phải cấu hình lại chỉ vì bé muốn chơi lại từ đầu; cờ phiên đăng nhập cloud
  `kho_bau_cloud_session_hint` nằm ngoài `STORAGE_KEYS` nên đương nhiên không bị quét. Mỗi vòng
  `removeItem` bọc `try/catch` vì `localStorage` có thể bị chặn (private mode) — khi đó coi như đã trắng.
  **Test viết trước:** `tests/t43a-reset-progress-sweeps-child-data.test.ts` (5) ⇒ RED
  `Tests 4 failed | 1 passed (5)` (`evidence/2026-11-03-T43/ablation-t43a-reset-sweep-RED.txt`), restore
  nguồn ⇒ `5 passed (5)`. Cổng: `npm run verify` **EXIT=0** · `100 passed (100)` / `1377 passed (1377)` ·
  `Duration 28.57s` · `index-BYLrQykB.js` **210.9 kB → PASS (meets 450 kB goal)** · boot graph
  **425.2 kB** (`435446 total` byte, `evidence/2026-11-03-T43/boot-graph.txt`) · **bằng chứng nhìn thấy
  được** (`AGENTS.md` §1.3): `npm run build` rồi `node qa/run-one.mjs evidence/2026-11-03-T43/probe-t43-reset.mjs`
  trên `dist/` ⇒ exit 0, `ok: true` — đi thật qua Parent Gate → tab "Cài Đặt & Thời Gian" → gieo 4 khoá
  → bấm "Đặt lại tiến độ" → "Xác nhận đặt lại", sau reset ba khoá con `null`,
  `kho_bau_parent_settings` còn `{"nightMode":true,"rewardsEnabled":true}`, `toastSeen: true`
  (`probe-t43-reset.txt`); `qa/golden-path.mjs` vẫn `QA PASS — 28 step(s), 0 errors`
  (`probe-golden-path.txt`). Probe giữ trong `evidence/`, **không** trong `qa/` vì `qa/*.mjs` bị đếm
  là probe (giữ số probe 30 đúng). Không có ảnh PNG: sửa không đổi layout, thứ đổi là dữ liệu bị xoá.
  · không thêm dependency,
  không thêm service module (vẫn 42). **Hai việc hồ sơ bắt ra nhưng cố ý KHÔNG tự sửa** (cần người
  duyệt, chủ đích để mở): `RISK-01` — không có đường xoá bản ghi cloud cho dù phụ huynh muốn rút dữ
  liệu; `RISK-11` — `docs/SAFETY_PRIVACY.md` §2 nói "sao lưu" trong khi export là **một chiều**
  (`grep -rn 'type="file"\|importData' src/components/parent/*.tsx` ⇒ exit 1).
- **T42 — tám defect: chọn màn không còn in sao, thẻ *Đôi Tai Thính* luôn có đáp án, bẫy focus
  không cướp con trỏ khi bé gõ, một mục hỏng không xoá cả danh sách ôn, đồng hồ hợp nhất cloud
  thật sự chạy, bài Toán lớp 1 bỏ phép có nhớ/có mượn, lưới đề sạch dấu ngay khung hình đầu, hẹn
  giờ bị xoá lúc rời màn.** Người dùng: "check bug và fix". Hai nhánh Explore lập 18 ứng viên,
  từng chỗ được mở ra đọc lại; giữ **8 defect xác nhận được** và sửa cả tám:
  (A) bảng "Chọn Màn & Độ Khó" trong `GameModalWrapper.tsx` gọi `completeGameTier(gameId, t−1, 3, 0)`
  nên màn bé **chưa chơi** bị đóng dấu 3 sao, và vì `useGameStage` đọc `prevBestStars = 3` lượt thật
  đầu tiên bị tính là "luyện lại" — bé mất sao và chỉ nhận 20 % XP. Thêm `StorageService.selectGameTier`
  (chỉ nâng `unlockedTier` bằng `Math.max`, kẹp 1…`GAME_LEVEL_POLICY.MAX_TIER`, **không** đụng
  `starsByTier`/`bestScoreByTier`) và bỏ hẳn đường gọi cũ, có comment chặn quay lại.
  (B) `ListenPickPhonicsGame.tsx` `slice(0, 4)` trên mảng đã xáo nên **đáp án có vòng bị cắt mất**,
  bé không thể trả lời đúng — thay bằng `pickCardOptions(options, answer, seed)` luôn giữ đáp án, xáo
  phương án nhiễu tất định theo `hashText(item.id) + seed·7919`, `LISTEN_PICK_CARD_COUNT = 4`.
  (C) `useFocusTrap.ts` focus vào hộp thoại **vô điều kiện** ⇒ mỗi lần mở là con trỏ bị cướp, bé đang
  gõ thì mất chỗ gõ — tách vị từ thuần `shouldMoveFocusIntoDialog(activeElement, container)` và chỉ
  focus khi nó trả `true`. (D) `getAnalytics` chỉ kiểm tra **cả mảng** `recentErrors`: một mục
  `null` lọt qua `JSON.parse` là xuống tới `cloudMerge.ts:359`, nơi dựng khoá chống trùng bằng
  `${entry.questionId}@${entry.timestamp}` ⇒ `TypeError` đánh sập **toàn bộ** lần đồng bộ và danh sách
  ôn mất trắng; nay lọc **từng phần tử** theo shape ở cả hai đầu — `storage.ts:1290` cho dữ liệu máy
  này, `usableErrors` (`cloudMerge.ts:363`) cho dữ liệu cloud.
  (E) T41D đã đề ra luật "tài nguyên **tiêu được** lấy theo hồ sơ hoạt động sau nhất", nhưng luật đó
  **không bao giờ kích hoạt**: `getChildProfile()` chuẩn hoá `lastActiveDate` về *hôm nay* ở **mọi** lần
  đọc nên hai máy luôn bằng nhau. Thêm `ChildProfile.stateTouchedAt` (`src/types/index.ts`) chỉ nhích
  khi một trường LWW thật sự đổi (so `lwwFingerprint`), và `StorageService.withoutStateTouch` mute
  đúng cú ghi của chính bộ đồng bộ; `cloudMerge` dùng mốc mới với fallback `lastActiveDate` cho hồ sơ cũ.
  (F) bài "Số hai chữ số cộng/trừ một chữ số" trong `src/data/math/calcIn100.ts` nhét 12 phép **có nhớ /
  có mượn** (`45 + 7`, `52 − 8`) trái chương trình lớp 1 (GDPT 2018 dạy không nhớ trước) — đổi sang cặp
  không nhớ/không mượn và sửa luôn dòng mô tả in trên đề.
  (G+H) `RhymeHunterGame.tsx` đồng bộ `roundsState` bằng `useEffect` ⇒ một khung hình vẫn vẽ **đề của
  màn cũ** với dấu "đã hái" còn nguyên (nhìn như đã làm xong), nay đối chiếu `sourceRef` ngay ở thì
  render; `MockExam` trong `EnglishIoeScreen.tsx` hẹn giờ 600 ms bằng `window.setTimeout` trần không cất
  vào ref ⇒ `setState` sau unmount, nay là `advanceTimer` ref + cleanup.
  Bằng chứng nhìn thấy được (`evidence/2026-11-03-T42/`): probe tạm chạy trên `dist/` mở *Săn Vần*,
  chọn Màn 4 ⇒ `headerAfterPick: "Màn 4/6 ▾"`, `kho_bau_game_progress.rhyme_hunter =
  {unlockedTier: 4, starsByTier: {}, bestScoreByTier: {}}`, `profileStarsAfterPick: 0`,
  `noStarsMinted: true`, lưới quả dựng lại 4 → 10; *Đôi Tai Thính* ra `listenUnique: 4` thẻ và đáp án
  `"sách vở"` luôn nằm trong danh sách; ảnh `t42a-tier4-no-stars.png` + `t42b-listen-pick-cards.png`.
  Hồi quy `qa/focus.mjs`, `qa/games.mjs` (`catalogCount: 31`, `mountOnlyAwardedNothing: true`),
  `qa/tier6-ladder-evidence.mjs` đều `QA PASS`, `errors: []`. Cổng: `npm run verify` **EXIT=0** ·
  `99 passed (99)` / `1372 passed (1372)` · `Duration 24.14s` · `index-C7kpOu7n.js` **211.3 kB → PASS
  (meets 450 kB goal)** · boot graph **425.6 kB** · T42 không thêm service module (vẫn 42), không thêm
  dependency; chạy lại cổng trên **đúng nội dung commit** trước khi commit: EXIT=0 · `99 passed (99)` /
  `1372 passed (1372)` · `Duration 21.38s` (thời gian tường thuật dao động, hash và kB entry không đổi) —
  `evidence/2026-11-03-T42/verify-precommit.txt`. **Chưa sửa, đã ghi rõ ở `docs/plan/TASK_PLAN.md`:** `buildRoundsFromGameItems` gán cùng một
  `item.emoji` cho cả 4 thẻ nên hình không phân biệt được (thiên về quyết định sư phạm, có ảnh bằng chứng).
- **T41D — hợp nhất hồ sơ cloud không còn in tài nguyên, và kết quả của phiên đăng nhập cũ không
  đè lên phiên mới.** Người dùng yêu cầu "check tất cả các bug, liệt kê ra đã, fix dần"; ô T41D
  được ghi lịch ở `.ai/CURRENT.md`, `docs/lifecycle/CHECKLIST.md` C-06 và `HARNESS.md` H-3 nhưng
  **không có danh sách hạng mục ở bất kỳ đâu** ⇒ đọc lại `src/services/cloudSync.ts` và lập 9 defect,
  sửa cả chín:
  (1) luật hợp nhất dùng `Math.max` cho **mọi** bộ đếm, kể cả tài nguyên **tiêu được** — vé (`profile.tickets -= 1`),
  sao đổi quà (`profile.stars -= item.priceStars`), ngọc, trang bị, chuỗi ngày — nên hai máy cùng sync là
  tiền và sao tự nhân đôi; nay bộ đếm luỹ kế (XP, số bài đã làm) vẫn lấy `max`, còn tài nguyên tiêu được
  lấy theo hồ sơ có `lastActiveDate` **sau nhất**, hoà thì giữ máy này.
  (2) hồ sơ trình diễn (`isDemoData: true`) trên cloud bị trộn vào tài khoản thật — nay có firewall:
  cloud-demo không đóng góp gì vào hồ sơ thật, local-demo + cloud-thì nhận nguyên hồ sơ cloud và
  tắt cờ demo. (3) bé đăng xuất hoặc đổi tài khoản **giữa lúc** `pullAndMerge` còn chờ mạng ⇒ trạng thái
  `synced` + `lastSyncedAt` của tài khoản A bị áp cho tài khoản B, UI báo "đã lưu an toàn" khi không còn
  ai đăng nhập, và hồ sơ máy A lọt sang máy B — nay mỗi lần auth đổi là một `authEpoch` mới, kết quả
  thuộc epoch cũ bị bỏ. (4) nút "Đồng bộ ngay", auto-sync sau 2 s và pull lúc đăng nhập chạy song song:
  hai `setDoc` đọc hai bản local khác rồi tranh ghi, bản sau đè bản vừa hợp nhất — nay mọi thao tác cloud
  đi qua **một hàng đợi**. (5) chính lần áp dữ liệu cloud cũng ghi `localStorage` và phát
  `kho_bau_storage_change` y hệt một lượt bé học ⇒ hẹn giờ auto-sync đẩy ngược dữ liệu vừa kéo về, nổ một
  vòng lặp mỗi lần đăng nhập; vì `getAnalytics()` **đọc** cũng phát event, phải bọc cả đoạn đọc lẫn đoạn
  ghi local (chỉ khi thao tác của máy này, không chặn thao tác thật của bé trong lúc chờ mạng).
  (6) SDK Firebase nạp thất bại (mất mạng, chunk bị chặn) bị `onAuthChange` báo như "đăng xuất" ⇒
  app quên phiên và mất nút "Tiếp tục đồng bộ"; nay `AuthChangeSource` phân biệt `'sdk_unavailable'`
  với `'state'`, chỉ `'state'` không user mới xoá session hint. (7) `syncNow()` nuốt lỗi — người lớn bấm
  "Đồng bộ ngay" và vẫn thấy "Đã lưu"; nay lỗi nổi lên `status: 'error'` + thông báo
  "Không lưu được lên cloud". (8) bản đẩy lên cloud sau khi hợp nhất chỉ có **profile**, thiếu analytics
  vừa gộp ⇒ máy khác kéo về mất lịch sử câu sai; nay đẩy đủ cả hai. (9) `setState` sửa object đang phát
  cho React ⇒ `useSyncExternalStore` không thấy đổi, UI trạng thái đơ; nay mỗi lần đổi là một object mới.
  Toàn bộ luật hợp nhất tách sang module thuần `src/services/cloudMerge.ts` (364 dòng, **42** service
  module) để test được trong môi trường node không DOM; `cloudSync.ts` 277 → 338 dòng, `firebase.ts`
  133 → 144, `storage.ts` xuất `DEFAULT_CHILD_PROFILE` để luật "đổi tên" so với tên mặc định thật thay
  vì tự viết lại chuỗi. `mergeTrace` chỉ ghi nhãn quy tắc (`stars:from_cloud`, `cloud_is_demo:ignored`,
  `recent_errors:merged=20`) — test khoá dạng `/^[a-z_]+:[a-z_0-9]+(=[0-9]+)?$/` để **không bao giờ**
  lộ nội dung bài làm của bé vào log hay tài liệu. Số liệu: `npm run verify` **EXIT=0** ·
  **92 file / 1327 test** · `Duration 22.32s` · entry `index-3QHywPiW.js` **209.9 kB** (+5.7 kB vì
  luật hợp nhất vào entry qua `AuthButton → cloudSync`; mục tiêu 450 kB vẫn đạt) · boot graph
  **424.3 kB** (trần 500 kB do `tests/t39-first-load-graph.test.ts` giữ).
- **Đề của "Cổng Xác Nhận Phụ Huynh" sinh sau khi vẽ — lỗi ứng dụng thật, không phải của probe.**
  Run 41508824890 (`80c7e39`) chết ở dòng bấm "Đấu Trường Thi Thử" trong `qa/lib.mjs`, timeout 12 s.
  Lần này đọc được payload thật (nhờ `tee probe-run.log` ở mục dưới). Nguyên nhân:
  `src/components/parent/ParentDashboardModal.tsx` khởi tạo state bằng một đề mồi cố định và sinh đề
  thật trong `useEffect` — effect chạy **sau** paint, nên khung hình đầu luôn hiện "15 + 18 = ?".
  Đo bằng MutationObserver ghi ngay trong trang: **9/9 lần mở** vẽ đề mồi rồi thay đề thật sau
  **5–114 ms** (`evidence/2026-11-03-QA-RACE/ci-gate-race.txt`). Probe vừa thấy selector là đọc đề
  ⇒ nộp 33 ⇒ cổng báo sai ⇒ bảng phụ huynh không mở. Ba mẹ gõ nhanh cũng dính đúng khoảng đó.
  Sửa ứng dụng: `const gateQuestion = useMemo(makeGateQuestion, [isOpen])` (sinh đề **trong** render,
  `makeGateQuestion` rút ngẫu nhiên `a ∈ [12,31]`, `b ∈ [11,30]`), cộng khối reset trạng thái cổng
  **tại render** khi `isOpen` đổi thay cho effect. Sửa probe (tự vệ, không tin một lần đọc):
  `unlockParentDashboard` trong `qa/lib.mjs` đọc đề → nộp → **chờ cổng đóng hẳn**
  (`waitForFunction`), chưa đóng thì đọc lại, tối đa 3 lần; `openCompetitionHub` gọi helper này, còn
  `qa/golden-path.mjs`, `qa/focus.mjs`, `qa/mobile-golden.mjs` bỏ đoạn đọc-gate-tức-thời của riêng
  chúng và dùng chung helper. Sau sửa, đo lại: `{"total":9,"paintedDefault15plus18":0,
  "repaintedAfterFirstFrame":9}` — đề mồi biến mất, mỗi lần mở vẫn đổi đề.
  **Ô CI đã đóng:** `3. Browser QA` chạy trên đúng commit chứa bản sửa (`2d2ca27`, run 41515106575,
  job 125516556497) — `check-run.conclusion = success`, bước 7 "QA probe" `success` sau 66 s, bước
  chẩn đoán `skipped` vì không có lỗi; 2 annotation chỉ là cảnh báo runner. Lượt thứ ba trên `c9fd2b4`
  (run 41516820864, job 125522382222) cũng `success` sau 127 s ⇒ cổng đạt **3/9 lượt xanh và là 2 lượt
  liên tiếp đầu tiên**; `continue-on-error: true` vẫn giữ theo `03-qa-browser.yml:29` ("xanh liên tiếp
  vài lần") — dự kiến bỏ ở đợt push kế tiếp nếu vẫn xanh.
  *(Bổ sung đợt bốn: vế "**vẫn giữ**" **đã lỗi thời** — lượt thứ ba `eb4b7b2` (run 41518983585, 69 s)
  khép chuỗi **ba lượt liên tiếp** nên cờ **đã bị xoá** ngay sau commit đó `3b0122c`, và lượt CI
  không còn cờ cũng xanh (run 41523226603, 69 s) ⇒ **5/11 lượt xanh**, bốn lượt cuối
  liên tiếp, không phải 3/9 hay 4/10. Xem mục `### Changed` đầu file và
  `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §9–§13; lượt thứ hai không lưới (`6e30794`, run 41526285381, 72 s) đưa cổng lên **6/12 lượt xanh, năm lượt cuối liên tiếp**.)*
- **`3. Browser QA` chưa từng xanh trên CI — nguyên nhân thật là race overlay, không phải app.**
  Bốn lần chạy đỏ ở bước "QA probe" (41488045102 `66e0fea` · 41490451074 `77d90ce` ·
  41493791252 `2db8715` · 41496530836 `e777457`) và không ai đọc được dòng lỗi vì
  `GET …/jobs/<id>/logs` trả `403 Must have admin rights to Repository`. Kênh chẩn đoán mới
  (annotation, đọc public — đo ở `evidence/2026-11-03-QA-RACE/ci-annotation-race.txt`) bắt được
  `locator.click: Timeout 12000ms exceeded` trên `getByRole('button', { name: 'Hoàn Tất' })` với
  `<div role="dialog" aria-label="Chúc mừng bé lên cấp"> … intercepts pointer events`.
  `dismissLevelUpCelebration` trong `qa/lib.mjs` kiểm tra tức thời `count()` trong khi modal lên cấp
  nạp `React.lazy` (`src/App.tsx:80`) và mở theo effect `profile.xp` (`src/App.tsx:184-201`):
  đếm sớm ⇒ 0 ⇒ "không có chúc mừng" ⇒ probe bấm xuyên overlay. Helper này **chờ** modal xuất hiện
  (mặc định 1500 ms) rồi dọn, lặp 3 lần cho trường hợp lên nhiều cấp; `qa/golden-path.mjs` cũng dọn
  overlay trước khi mở Đấu Trường (đúng chỗ run 41496530836 chết). Hành vi ứng dụng giữ nguyên:
  bé thật thấy màn chúc mừng và bấm "Tuyệt Vời!" — đây là bug của probe.
  **Lần đầu xanh: run 41501753363 trên `afb9eeb` (63 s, 0 annotation lỗi).** Hệ quả còn mở: tag
  `v1.1.0` đóng ở `77d90ce` tức là *trước* bản sửa, nên gate QA của chính bản phát hành vẫn đỏ.
  *(Bổ sung cùng ngày: câu "0 annotation lỗi" **không còn là bằng chứng** — xem mục "annotation của
  một lần đỏ ghi QA PASS" dưới đây; và run đó là **lần xanh duy nhất cho tới hiện tại**, vì cổng đã
  đỏ lại ở commit kế tiếp.)*
- **Probe tự làm mù chẩn đoán.** `qa/golden-path.mjs` cắt `split('\n')[0]` của exception nên CI chỉ
  còn "Timeout 12000ms exceeded" mà không biết nút nào; nay giữ cả đầu lẫn đuôi "Call log" của
  Playwright (≤6 dòng mỗi phía) và workflow `03` nâng trần mỗi annotation lên 3000 ký tự.
- **Cổng QA là intermittent, và bước chẩn đoán từng kể chuyện sai.** `3. Browser QA` xanh trên
  `afb9eeb` (run 41501753363) rồi **đỏ lại trên `8e6f9f5`** (run 41504913606) — commit đó chỉ sửa 22
  file tài liệu, `src/` và `qa/` không đổi ⇒ không có hồi quy nào để tìm; đỏ là flaky. Điều tra
  (`evidence/2026-11-03-QA-RACE/ci-flake-second-run.txt`) cho thấy chính bước "Đưa lỗi probe lên
  annotation" gây mù: nó **chạy lại** probe, lần hai ăn may, nên annotation của một job `failure`
  in ra `{"errors":[]}` và `QA PASS — 28 step(s)`; chỉ dòng `Process completed with exit code 1.`
  là thật. Sửa: bước "QA probe" lưu output của **chính lần chạy** bằng `tee probe-run.log` và trả
  `PIPESTATUS[0]` (GitHub Actions mặc định `bash -eo pipefail`, nên `| tee` nuốt exit code), còn bước
  chẩn đoán chỉ chạy mới khi log trống (`[ -s probe-run.log ]`). Không đổi assertions của probe.
  `continue-on-error: true` **giữ nguyên** vì mới có một lần xanh.

### Tests
- **T45 — 5 file / 31 test mới, ablation từng chốt và một probe gating đặt *ngoài* `qa/`.**
  `tests/t45a-gacha-parent-limit.test.ts` (5): `maxGachaPerDay = 3` chặn lượt 4 (baseline giữ hành vi cũ),
  `0` ⇒ 12 lượt liên tiếp đều ăn, `10` ⇒ chặn đúng lượt 11, `getGachaDailyLimit()` trả `null` khi `0`, và
  hợp đồng mã nguồn cấm `GachaMachineScreen.tsx` tự đặt trần. `t45b-rewards-off-competition` (6): khi
  **TẮT** phần thưởng, đề thi không cộng xp/sao **nhưng kết quả + phân tích vẫn lưu**; `checkAchievements`
  không cộng XP và không mở thành tựu; khi **BẬT** lại thì thành tựu vẫn mở (chốt không thành cửa chết);
  hai hợp đồng mã nguồn bắt chốt nằm *trong* hàm và phần thưởng thi đấu nằm trong nhánh có điều kiện.
  `t45c-screen-time-parent-gate` (6): `App.tsx` không còn tự cộng 10 phút, `ScreenTimeModal` không được ghi
  cài đặt ba mẹ từ trong linh kiện, prop là `onAskParent` chứ không `onExtend`, dashboard vẫn chặn sau
  `!isAuthenticated`, và Esc không thoát được lời nhắc nghỉ mắt. `t45d-overlay-blocks-keyboard` (7):
  `isGameInputBlocked()` chặn theo `overlayOpen`/`pausedByUser`, `stage` phải trả `inputBlocked`, **mọi** trò
  nghe phím phải dùng `stage.inputBlocked` (không phải `stage.locked` trần) và khai báo lớp phủ "Chọn Màn",
  kèm chốt hồi quy diện rộng trên 30 trò. `t45e-weekly-challenge-rotation` (7): id xoay theo
  `weekKeyOf` (hai ngày cùng tuần ⇒ cùng id, tuần sau ⇒ khác), ba tuần liên tiếp cho `weeklyChallenges = 3`
  và mở `ach_weekly_3`, hai lần trong **cùng** tuần chỉ tính một (chống farm), màn không còn hard-code id.
  Ablation từng chốt — bỏ guard, chạy file test tương ứng, log nguyên văn trong `evidence/2026-11-03-T45/`:
  A1 `checkAchievements` → `2 failed | 4 passed (6)` · A2 nhánh thưởng thi đấu → `2 failed | 4 passed (6)` ·
  A3 `drawGacha` đổi `0 → 5` → `2 failed | 3 passed (5)` · A4 `inputBlocked` bỏ `overlayOpen` →
  `1 failed | 6 passed (7)` · A5 id tuần cố định → `4 failed | 3 passed (7)`; mỗi lần hoàn tác ngay bằng
  `git checkout --` nên `git status` không còn `src/` modified.
- **T43 — 1 file / 5 test mới, ablation đúng một hàm.** `tests/t43a-reset-progress-sweeps-child-data.test.ts`:
  hai test **cấu trúc** ("xoá mọi khoá dữ liệu bé, kể cả ba khoá vốn bị sót" — danh sách xoá phải lấy
  từ `STORAGE_KEYS` trừ allowlist; "giữ thiết lập và phiên đăng nhập của người lớn" —
  `kho_bau_parent_settings` và cờ phiên cloud phải còn nguyên) và ba test **hành vi người dùng thấy**
  (`saveReviewCompletedDays` → sau reset `getReviewCompletedDays()` = `[]`;
  `setTreeWateredDate('2026-11-03')` → `getTreeWateredDate()` = `null`; `markGameSeen('ocean-count', …)`
  → raw key `null`), môi trường `node` + polyfill `localStorage` in-memory theo tiền lệ
  `decision-engine-storage.test.ts`. Ablation: `git diff src/services/storage.ts > /tmp/t43a-fix.patch`
  → `git checkout -- src/services/storage.ts` → `npx vitest run tests/t43a-…` ⇒ đỏ **4** test, đúng một
  test "giữ thiết lập… của người lớn" xanh (vì bản cũ cũng không đụng hai khoá đó) → `git apply` →
  `5 passed (5)`; không để lại file tạm trong `qa/` hay `scripts/` (thư mục `qa/*.mjs` được đếm là probe).
- **T42 — 7 file / 45 test mới, ablation từng defect, và bằng chứng nhìn thấy được cho hai lỗi UI.**
  `t42a-tier-picker-honest` (5): `selectGameTier` chỉ nâng `unlockedTier` (kẹp 1…6), **không** ghi vào
  `starsByTier`/`bestScoreByTier`, lượt chơi thật đầu tiên sau khi chọn màn vẫn trả đủ XP + sao, và hợp
  đồng nguồn cấm `GameModalWrapper` gọi `completeGameTier`. `t42b-listen-pick-answer` (4): `pickCardOptions`
  luôn giữ đáp án trong 4 thẻ, tất định theo `(item.id, seed)`, không trùng phương án.
  `t42c-focus-trap-typing` (4): `shouldMoveFocusIntoDialog` trả `false` khi focus đã ở trong hộp thoại,
  `true` khi ở `body`/`html`/ngoài, và hook chỉ `.focus()` bên trong nhánh `if (!shouldMove…)`.
  `t42d-corrupt-storage-guard` (12): mục `null`/thiếu trường bị loại **từng phần tử** thay vì làm sập cả mảng,
  `lastActiveDate` rác rơi về hôm nay, `cloudMerge` lọc cả phía cloud. `t42e-resource-touch-clock` (11):
  mốc `stateTouchedAt` nhích đúng một lần khi trường LWW đổi, không nhích khi chỉ chuẩn hoá `lastActiveDate`,
  `withoutStateTouch` mute cú ghi của bộ đồng bộ, và hợp nhất hai máy chọn bên **hoạt động sau nhất** chứ
  không lấy `max`. `t42f-digit-lesson-no-carry` (5): mọi phép trong `calcIn100` không nhớ/không mượn + đề
  in ra khớp lời dạy. `t42g-late-state-timers` (4, gồm hai nhóm `T42/G` và `T42/H`): `roundsState` dựng lại
  ở thì render, `advanceTimer` nằm trong ref + cleanup, không còn `window.setTimeout` trần gọi `setState`.
  **Ablation từng cái** (`git checkout HEAD --` đúng nguồn bị sửa rồi chạy riêng file): t42a `1 failed |
  4 passed (5)` · t42b `4 failed (4)` · t42c `4 failed (4)` · t42d `7 failed | 5 passed (12)` · t42e
  `4 failed | 7 passed (11)` · t42f `2 failed | 3 passed (5)` · t42g `4 failed (4)`; restore ⇒
  `7 passed (7)` / `45 passed (45)` (`evidence/2026-11-03-T42/ablation-*-RED.txt`, `t42-tests-green.txt`).
  **Bằng chứng nhìn thấy được:** probe tạm `evidence/2026-11-03-T42/probe-t42-ui.mjs` chạy trên `dist/`
  qua `node qa/run-one.mjs ./tmp-t42-ui.mjs` (đặt ở gốc repo, **đã xoá** sau khi đo — không bỏ trong `qa/`
  vì `qa/*.mjs` được đếm là probe) ⇒ `ok: true`, `errors: []`, kèm 2 ảnh chụp. Tổng cổng: **99 file /
  1372 test**, `npm run verify` EXIT=0 · `Duration 24.14s` · `index-C7kpOu7n.js = 211.3 kB PASS`
  (`evidence/2026-11-03-T42/verify.txt`, `check-budget.txt`).
- **T41D — 40 test mới, kèm bằng chứng phép thử thật (ablation).**
  `tests/t41d-cloud-merge.test.ts` (28) kiểm luật hợp nhất như hàm thuần: bộ đếm luỹ kế lấy `max`;
  **sao/vé/ngọc/trang bị/chuỗi không được dùng `max`** (kịch bản in tiền: máy A còn 9 sao, máy B đã tiêu
  còn 2 ⇒ kết quả phải là 2 của máy hoạt động sau nhất, không phải 9); union tiến độ giữ thứ tự máy này;
  `lessonStars` so từng khoá; `skillMastery` theo `lastPracticed`; `recentErrors` chống trùng
  `questionId@timestamp`, sắp theo thời gian giảm dần rồi cắt 20 (bản cũ cắt **trước** khi sắp nên mất
  câu sai mới); firewall hồ sơ demo ở cả hai chiều; số rác từ cloud rơi về giá trị máy này; hàm **không
  mutate đầu vào** và **tất định**; `mergeTrace` khớp regex nhãn.
  `tests/t41d-cloud-sync-race.test.ts` (12) dựng `window` + `localStorage` giả và mock Firestore bằng
  một `getDoc` **tạm dừng được bằng cổng**: đăng xuất giữa lúc kéo ⇒ trạng thái cuối `offline` / user
  `null` / `lastSyncedAt` `null`; kết quả uid cũ không áp cho uid mới (vết ghi đếm được
  `['users/uid-a','users/uid-b']`); hai `syncNow()` chồng nhau ⇒ `maxInFlight === 1`; áp dữ liệu cloud
  xong không tự nổ auto-sync (một vết ghi, tính cả sau +5 s); bé sửa bài thật vẫn đồng bộ (hai vết ghi);
  SDK hỏng thì session hint còn `'1'` và `start()` lần sau đăng ký lại listener; đăng xuất thật xoá hint;
  mỗi lần đổi trạng thái là object mới; chưa đăng nhập mà bấm "Đồng bộ ngay" ⇒ **không ghi gì**;
  `setDoc` hỏng ⇒ `status: 'error'` đúng thông báo.
  **Ablation:** hoàn tác `cloudSync.ts` + `firebase.ts` về HEAD rồi chạy file race ⇒ **5 failed / 7
  passed** (suite không xanh nhờ test rỗng), khôi phục ⇒ xanh lại. Hai test còn lại cho kết quả giống
  nhau ở cả hai bản là bất biến phòng vệ ("không có `synced` khi user `null`", "uid cũ không được áp").
  Log đỏ và log xanh lưu ở `evidence/2026-11-03-T41D/`.
- **`tests/t41f-parent-gate.test.ts` — 5 test, RED đo trước khi sửa, GREEN sau khi sửa.** Ba test
  đầu là "buồng quay camera" deterministic: `renderToString` chỉ vẽ khung hình đầu và **không chạy
  effect**, nên 15 lần mở liên tiếp không được chứa `15 + 18`, đề phải khác nhau giữa các lần
  (`distinct.size > 1`) và `a`/`b` phải nằm trong khoảng đã chốt. Hai test sau là hợp đồng nguồn:
  `ParentDashboardModal.tsx` phải có `useMemo(makeGateQuestion, [isOpen])`, **không** được quay lại
  `setGateQuestion(` hay state khởi tạo bằng đề mồi; bốn probe (`lib.mjs`, `golden-path.mjs`,
  `focus.mjs`, `mobile-golden.mjs`) phải gọi `unlockParentDashboard` và `golden-path.mjs` không được
  tự bấm "Mở Bảng Phụ Huynh" nữa. RED đo trước khi sửa: `5 failed (5)`. GREEN: `5 passed (5)`.
  *Chèn giữa hai lần đo là một bài đắt:* sau khi sửa app, cổng vẫn `1 failed | 4 passed (5)` vì
  `not.toMatch(/useState\(\{\s*a: 15, b: 18/)` khớp cả **dòng comment** giải thích bug — phải viết
  lại comment. Và `<!-- -->`: SSR chèn chuỗi đó giữa các text node kề nhau, regex đọc đề phải bỏ.
- Test hợp đồng thứ ba trong `tests/t31-bug-hunt-fixes.test.ts` ("CI: annotation kể lại lần chạy
  THẤT BẠI, không chạy lại probe lần hai") khoá cả hai đầu: bước "QA probe" phải có `| tee
  probe-run.log` + `PIPESTATUS[0]`, bước chẩn đoán phải có `[ -s probe-run.log ]`. RED đo trước khi
  sửa: `1 failed | 20 passed (21)`; GREEN: `21 passed (21)`.
- Hai test hợp đồng nguồn trong `tests/t31-bug-hunt-fixes.test.ts` khoá lại hai điều vừa học:
  `qa/lib.mjs` phải dùng `waitFor({ state: 'visible' })` chứ không `count()` tức thời, và
  `qa/golden-path.mjs` phải dọn overlay trước `openCompetitionHub(page)`. Tổng cổng:
  **89 file / 1280 test**, `npm run verify` EXIT=0 · `Duration 21.88s` ·
  `index-B6au8G63.js = 204.2 kB PASS` (`evidence/2026-11-03-QA-RACE/verify-1280.txt`).

## [1.1.0] - 2026-11-02

### Added
- **Hồ sơ vòng đời theo `docs/step-by-step-guidance.md` (11 pha Agentic SDLC).** Người dùng yêu cầu
  "triển khai dự án theo guide". **Đo trước khi làm:** bộ kit mà guide dẫn chiếu **không có trong repo**
  (`find . -path ./node_modules -prune -o \( -iname "AI_SDLC-SOP.md" -o -iname "agentic-sdlc-process.md" -o -iname "*.xlsx" \) -print` ⇒ rỗng),
  nên guide chỉ dùng được làm **lớp ánh xạ + log tailoring** — hệ quả là **không** dời `docs/specs/`,
  `docs/plan/`, `qa/`, `evidence/` (bốn đường dẫn đó được `AGENTS.md`, `docs/specs/README.md` và skill
  `kho-bau-measure-sync` dẫn tên; dời là gãy gate). Artifact mới, toàn bộ là docs:
  `docs/lifecycle/10_SDLC_GUIDE_MAP.md` (11 pha → file thật, adaptation log, cổng 5 điều kiện, vai trò
  là con người có tên, **3 quyết định tailoring cần người duyệt**: `.drawio` / `openapi.yaml` / ADR thành
  file riêng — cả ba đề xuất `K/A` kèm lý do), `docs/01-intake/{intent,glossary,stakeholders,sources}.md`
  (4 file — `intent` map `BO-xxx` sang `BG-01…BG-06` **đã có** thay vì lập sổ thứ hai, theo §C2 của guide;
  `sources` ghi 19 nguồn trong repo + 5 chuẩn ngoài, kèm cảnh báo "repo không trích điều khoản nào của
  chuẩn ⇒ không được viết 'tuân thủ'"), `docs/plan/RISK_REGISTER.md` (**11** RISK · **1** DEF ·
  **7** OQ · **4** ASM), `docs/10-operations/{runbook,incident-log}.md` (runbook không có dashboard vì
  app **không server, không telemetry** — SLI chỉ đo tại máy; 5 incident INC-01…INC-05 dẫn bằng chứng
  `evidence/`), `docs/11-decommissioning/decommission.md` (kiểm kê 17 khoá bằng lệnh tái lập + disposal
  cho 4 lớp dữ liệu ngoài `localStorage` + hai quy trình A/B). Kiểm đếm trước/sau: repo đã có sản phẩm
  cho **8/11 pha**; ba pha 1/10/11 và register RISK/OQ/ASM là chỗ trống thật — nay đã có hồ sơ.
  **Chính bộ hồ sơ này sinh ra `DEF-001`** (xem `### Fixed`) và giữ lại hai rủi ro **không** tự sửa vì
  cần người duyệt: `RISK-01` (không có đường xoá dữ liệu cloud), `RISK-11` (export một chiều, trái
  mô tả "sao lưu" trong `docs/SAFETY_PRIVACY.md` §2).
- Trò chơi mới cho bé lớp 1 (tab Fun), mỗi trò có data pack deterministic 6 bậc +
  component + đăng ký đủ 4 nơi (`gamesCatalog`, `GAME_REGISTRY`, `LAUNCHABLE_GAME_IDS`,
  `qa/games.mjs`):
  - `connect_dots` — **Nối Số Tô Màu**: nối 1→N theo chấm, khép thành hình rồi tô màu
    (10 hình: con diều, ngôi nhà, ngọn núi, chiếc lá, con thuyền, con cá, trái tim,
    cái cây, ngôi sao, mặt trời).
  - `shadow_match` — **Đoán Bóng Hình**: 24 ảnh/danh từ, chọn 1 trong 4 bóng; nghiêng
    từ bậc 3, lật gương từ bậc 5.
  - `pixel_mosaic` — **Bé Xếp Hình Mosaic**: ghép ô màu 3×3 → 5×5 theo mẫu, có ô ma
    trận mờ gợi ý ở bậc 1–2.
- Bàn cờ tướng 3D `src/components/learning/cotuong/CotuongBoard3D.tsx` — phối cảnh CSS
  (`perspective`, `rotateX`, `preserve-3d`), quân cờ có `id` ổn định để trượt giữa các ô.
- Quy trình phát triển: `docs/SDLC.md`, `CONTRIBUTING.md`, `AGENTS.md`, `README.md`.
- Cổng chất lượng: git hooks trong `scripts/hooks/` (`pre-commit` typecheck + chặn
  `.env*`, `commit-msg` Conventional Commits, `pre-push` `verify:quick`) và 4 workflow
  GitHub Actions: `1. Quality`, `2. Build + artifact`, `3. Browser QA`, `4. Release`.
- Template cộng tác: `.github/pull_request_template.md` (kèm checklist bất biến đăng ký
  trò chơi), `.github/ISSUE_TEMPLATE/{bug_report,feature_request,content_request}.yml`,
  `.github/dependabot.yml`.
- Scripts npm mới: `test:ci`, `verify:quick`, `verify`, `qa:smoke`, `qa:games`,
  `hooks:install`, `prepare`.
- `package-lock.json` — để CI cài đặt tái lập được bằng `npm ci` (npm là package manager
  thật của repo; `bun.lock` cũ không còn phản ánh `node_modules`).
- Lớp MCP cho agent trong `mcp/` — 5 server stdio **zero-dependency** (tự viết JSON-RPC,
  không thêm package npm): `kbt-quality-gates` (chạy gate + probe QA + báo cáo bundle),
  `kbt-curriculum` (danh mục trò chơi, kiểm 4 danh sách đăng ký, số liệu chương trình),
  `kbt-game-scaffold` (sinh khung game mới, mặc định dry-run), `kbt-progress` (đọc file
  export tiến độ cục bộ, che PII của bé), `kbt-docs` (tra toàn bộ tài liệu Markdown + trạng
  thái hiện tại). Kèm `mcp/lib/{server,repo}.mjs`, `mcp/devclient.mjs` để smoke-test,
  `mcp/sample-export.json` (dữ liệu giả định) và `mcp/README.md`.
- `.gitignore`: loại `progress/` ra khỏi VCS vì file export chứa dữ liệu cá nhân của trẻ.
- Bộ tài liệu chuẩn đo từ repo (mọi số liệu đều có lệnh kiểm chứng lại), **đo lại ngày
  2026-10-30 sau merge**: `docs/specs/BRD.md` (mục tiêu · phạm vi · thước đo · 8 rủi ro),
  `docs/specs/SRS.md` (88 FR + 25 NFR + 17 DC + 11 IF, mỗi dòng có nghiệm thu và gate),
  `docs/specs/ARCHITECTURE.md` (tầng, luồng dữ liệu, chunk, PWA, ADR-01…ADR-17, nợ kỹ
  thuật), `docs/specs/RTM.md` (yêu cầu → test → probe → gate, 0 test mồ côi),
  `docs/plan/TASK_PLAN.md` (WBS WP-01…WP-12, lịch sử P25→P44, Definition of Ready, backlog
  EP-A…EP-G, milestone M1–M4), `docs/plan/TEST_PLAN.md` (5 tầng kiểm thử, ma trận
  "đổi gì → chạy gì", 20 probe, tiêu chí vào/ra) và `docs/specs/README.md` làm chỉ mục.
- **Merge `fd3e7da`** (lane khác): chế độ **challenge** trong `LessonPlayerModal`, chọn bậc
  (tier) ngay trong modal trò chơi — `GameModalWrapper` + `useGameStage.jumpToTier(targetTier)`
  (additive, không đổi hành vi mặc định), quân cờ vua SVG độ phân giải cao
  `src/components/learning/chess/ChessPieceSvg.tsx`, và **6 thế cờ tướng** có sẵn cho bé
  (`CotuongPuzzlesView.tsx` + `cotuongPuzzles.ts`: Ngọa Tào Mã, Song Pháo, Thiết Môn Khảm,
  Binh Nhập Cung, Mã Hậu Pháo, Song Xe Tảo Cung).
- **Bộ artifact vòng đời `docs/lifecycle/`** (T42) — 8 artifact đánh số theo 6 pha, mỗi file có
  owner + ngày + gate result: `01_LIFECYCLE_BOARD` (6 pha × 5 lớp), `02_AI_USAGE_CHARTER`
  (phân quyền AI Level + Rule of Two + advisory vs enforced), `03_REQUIREMENTS_CHAIN`
  (BR → FR → US → TC + hai cổng duyệt), `04_DESIGN_BLUEPRINT` (driver có số đo, C4, ADR index,
  sequence **kèm state lỗi**, ERD 19 key, STRIDE 6 mục, lethal trifecta), `05_IMPLEMENTATION_LOOP`
  (Guarded Build Loop 6 bước + merge gate 5 điều kiện), `06_VERIFICATION_VALIDATION` (oracle,
  verdict 4 giá trị, ablation), `07_RELEASE_OPERATIONS` (RC/go-no-go, expand-contract, SLI/SLO từ
  NFR, runbook 4 phần), `08_MAINTENANCE_EVOLUTION` (characterization test, impact analysis 6 chiều,
  review 4 lớp). Kèm `README.md` (Evidence Board một trang), `CHECKLIST.md` (20 mục, 0 FAIL),
  `HARNESS.md` (Guide × Sensor × Memory), `09_ADOPTION_ROADMAP.md` (30/60/90 + Playbook 3 dòng).
- **`docs/plan/TEST_CASES.md`** — tầng US + TC đầu tiên của repo: 5 user story AC 3 nhánh,
  29 ca kiểm thử có verdict, 7 exit criteria viết trước khi chạy.
- **`docs/prompts/`** — 5 thẻ prompt tái dùng (TASK_BRIEF · BUG_HUNT · MEASURE_SYNC ·
  REVIEW_4LAYER · CONTEXT_PACK), mỗi thẻ đủ 5 phần + tiêu chí đạt là lệnh.
- **`evidence/`** — bằng chứng gắn commit: `2026-11-02-T41C/` gồm log `verify` (17.533 byte),
  3 probe JSON, 2 ảnh trước/sau dải thưởng, 3 log ablation/baseline.
- Harness nằm trong repo: `.qoder/skills/kho-bau-change/SKILL.md` (quy trình 7 bước) và
  `.qoder/agents/kbt-reviewer.md` (reviewer chỉ-đọc, 4 lớp).
- **Nút Tạm dừng trò chơi (KBT-ISSUE-43)** — đồng hồ chạy/đứng giờ có một chủ:
  `useGameStage` giữ trạng thái `pausedByUser` và hàm thuần `isGameClockRunning(s)`
  (`src/hooks/useGameStage.ts:24`) làm cổng duy nhất cho cả nhịp tick lẫn hai đường ghi điểm
  (`submitCorrect` / `submitWrong`); `GameModalWrapper` bỏ state riêng, chỉ hiện nút cho trò bị
  đồng hồ phạt (`REALTIME_GAME_IDS` = 4 trò *Bắt Chữ Cái Bay*, *Hứng Số Rơi Rộn Ràng*,
  *Đập Bóng Màu*, *Đường Đua Thần Tốc* — gắn cờ `isRealtime: true` trong `gamesCatalog`,
  `grep -c` = 4). Probe mới `qa/game-pause.mjs` (probe thứ **30**) chụp 3 ảnh nghiệm thu vào
  `evidence/2026-11-02-KBT-ISSUE-43/`; Issue mirror `docs/issues/43-game-pause.md`; ba màn bóng/số
  rơi thêm `data-testid="falling-item"` để probe chọn được vật thể thật thay vì đoán toạ độ.

### Changed
- **Hồ sơ phát hành `1.1.0` (giai đoạn 6):** `[Unreleased]` chuyển thành `## [1.1.0] - 2026-11-02`,
  `package.json` và `package-lock.json` cùng lên `1.1.0` (kiểm bằng `npm install --package-lock-only
  --dry-run` ⇒ `up to date`, EXIT=0, nên `npm ci` của CI không lệch lock), ghi chú release trích được
  bằng `node scripts/release-notes.mjs 1.1.0` ⇒ **875** dòng. `docs/lifecycle/07_RELEASE_OPERATIONS.md`
  thêm §3.4 "Hồ sơ chuẩn bị sẵn" — điền số đo thật của từng cổng kèm lệnh tái lập. **Chưa tag:**
  `git tag | wc -l` vẫn `0`; tag chỉ hợp lệ trên HEAD của `main` sau khi PR được merge, và quyền ký
  Go/No-Go thuộc người giữ repo (`07` §3).
  lane khác (`1338ca2`) xoá `package-lock.json` (3331 dòng) trong khi cả 4 workflow vẫn chạy
  `npm ci --no-audit --no-fund` — kiểm bằng `git ls-tree --name-only origin/main | grep lock`
  (chỉ còn `bun.lock`) ⇒ CI chết ngay bước cài đặt; và `"build": "NODE_ENV=production vite build"`
  là cú pháp `cmd.exe` không nhận trên Windows — kiểm bằng
  `cmd //c 'NODE_ENV=production node -e "console.log(1)"'` ⇒ `'NODE_ENV' is not recognized as an
  internal or external command` ⇒ `npm run build`/`npm run verify` hỏng trên máy phát triển.
  Merge giữ lại lockfile và trả build về `vite build` (Vite tự đặt mode production khi build).
  **Hệ quả đo được:** số test tăng **1270 → 1272** (hai test của lane kia trong
  `tests/t31-bug-hunt-fixes.test.ts`), entry đổi hash vì `GameModalWrapper` đổi CSS.
- **Đối soát số liệu dẫn trong docs (T42):** `README.md` khai **17 ADR** trong khi
  `grep -ohE "ADR-[0-9]+" docs/specs/ARCHITECTURE.md | sort -u | wc -l` = **18**, và ghi dấu đo
  **2026-10-30** trong khi toàn bộ số hiện trạng là của đợt đo sau T41C (commit `d54f341`, ngày
  2026-11-02) ⇒ sửa hai chỗ, thêm 4 dòng bảng tài liệu trỏ tới `docs/plan/TEST_CASES.md`,
  `docs/lifecycle/`, `docs/prompts/`, `evidence/`. `docs/specs/README.md` thêm dòng 7 cho tầng
  US/TC.
- **Cắt lần tải đầu (đợt T39 — perf):** người dùng yêu cầu "tiếp tục tối ưu bundle xuống 450 kB".
  Đo trước khi sửa: `npm run check:budget` chỉ nhìn chunk entry nên T38 vẫn PASS ở **534.3 kB**,
  trong khi `dist/index.html` tham chiếu **tĩnh** cả `firebase-vendor` 537.9 kB, `english-bank`
  186.0 kB, `math-bank` 124.1 kB và toàn bộ ngân hàng đề nằm trong entry ⇒ payload thật chặn lần
  vẽ đầu là **1527.4 kB**. Ba cạnh phụ thuộc tĩnh bị cắt (không chuyển dữ liệu sang chunk khác chỉ
  để đẹp số đo):
  1. `src/App.tsx` — `CotuongScreen` và `EnglishIoeScreen` (hai màn tĩnh cuối cùng) sang
     `React.lazy` + `Suspense fallback={<ScreenFallback label="…" />}`, khớp kiểu các màn khác.
  2. `src/services/storage.ts` → `src/data/curriculum.ts` — thay `import` tĩnh bằng cơ chế
     **tự đăng ký**: `data/curriculum.ts` gọi `StorageService.attachCurriculum({ getAllSkills,
     getTopicsBySubject })` ở cuối file; API đồng bộ của storage giữ nguyên, chưa có catalogue thì
     cư xử như "chưa có dữ liệu" thay vì ném. `App.tsx` prefetch catalogue ngay sau khi mount nên
     dashboard ba mẹ vẫn seed đủ kỹ năng.
  3. `src/services/firebase.ts` — bỏ khởi tạo ở tầng module; `loadFirebaseSdk()` dynamic-import
     `firebase/app|auth|firestore`, cache promise và **reset promise khi lỗi** (lần bấm sau được
     thử lại), kiểu chỉ dùng `import type`. `src/services/cloudSync.ts` thêm hint
     `kho_bau_cloud_session_hint` (boolean `'1'`, **không chứa dữ liệu hay bài làm của bé**) và
     `start()` idempotent: thiết bị chưa từng đăng nhập không nối `onAuthChange` ⇒ không tải
     `firebase-vendor`; `AccountModal` gọi `CloudSyncService.start()` khi người lớn mở màn.
  Số đo sau khi sửa (`npm run verify` **EXIT=0**): entry `index-DQjDqEw-.js` **199.2 kB** →
  `PASS (meets 450 kB goal)`; **boot graph 413.5 kB** = index 199.2 + `react-vendor` 213.6 +
  `rolldown-runtime` 0.7 (từ 1527.4 kB); Home vẽ sau **163 ms** (lần đo lại trên dist mới; **125 ms** ở lần đo đầu) khi CPU throttle 4×.
  `firebase-vendor` đổi số đo 537.9 → **723.0 kB** khi biên chuyển từ tĩnh sang động (số đo thật
  của `npm run check:budget`, nguyên nhân chính xác chưa khảo sát) nhưng nó **không còn** nằm trên
  đường tải tiên phong nên người chưa đăng nhập không tải nữa. Quyết định ghi thành **ADR-18** trong
  `docs/specs/ARCHITECTURE.md`.
- **Kẻ đậm đường ô cờ vua (đợt T37):** ảnh chụp bàn 3D cho thấy rãnh 0.07 của đợt T35 gần như
  biến mất khi nhìn nghiêng, nên đường kẻ được vẽ thẳng lên mặt bàn thay vì chỉ dựa vào khe gỗ.
  `src/components/learning/chess/chess3d/boardBuilder.ts`: mặt lát `0.93 → 0.9` trên pitch 1.0
  (khe 0.1), thêm tấm lưới `board_grid_lines` 8×8 đặt **sát dưới đỉnh ô** (`tileHeight − 0.001`,
  vẫn thấp hơn mặt ô nên test chống-che-bàn còn nguyên) với `CanvasTexture` vẽ 9+9 nét
  `#241609` rộng 0.14 — nằm cùng mặt phẳng với ô nên phối cảnh không làm mảnh nữa; mảng phủ
  nước đi `0.9 → 0.86` để không đè lên nét kẻ. Bàn 2D (`ChessGame`), demo nước đi
  (`ChessMoveDemo`) và bảng minh họa (`ChessScreen`) đổi đường kẻ ô từ
  `inset_0_0_0_2px rgba(47,29,16,0.9)` sang `inset_0_0_0_3px rgba(36,22,9,1)` (dày hơn, đặc 100%),
  khung `border-2 #2f1d10 → border-[3px] #241609`, minh họa `gap/p-[2px] → [3px]`.
- **Việt hoá các chuỗi còn sót (đợt T36):** toàn bộ nhãn hiển thị cho bé/ba mẹ đổi sang tiếng
  Việt — 186 dòng trong 34 file `src/`. Nhãn đảo & bài học (`Đảo Phiêu Lưu Tiếng Anh`,
  `Chữ Cái ABC`, `Những Con Số 1 – 10`, `Dạng Bài Mới`), tên linh vật `Thỏ Tiếng Anh`,
  `Bộ Sưu Tập Sticker`, nhóm trò chơi `Tư Duy & Khoa Học`, hai trò đổi tên `Đập Bóng Màu` /
  `Safari Tiếng Anh — Loài Vật` (đủ 4 nơi đăng ký), huy hiệu `Nhà Khám Phá Tiếng Anh` /
  `Siêu Sao Tiếng Anh`, 24 `skillName` bảng kỹ năng + 7 kỹ năng đấu trường, đề thi
  `Thử Tài Tiếng Anh`. Dọn mã máy lộ ra màn hình: `(DISCOVERY)` → `(khám phá)`,
  `CONTENT_SOURCE_REQUIRED` → `Chưa có nội dung sách`, tiêu đề hoạt động không còn
  `picture to word`, nhãn phương pháp nói đổi sang tiếng Việt, `Đạt level 5` → `Đạt cấp độ 5`.
  `ChessTutorial` (màn chết, chưa được import) viết lại cho đúng 6 quân cờ vua thay vì lẫn
  tên cờ tướng. **Không đổi** nội dung dạy học tiếng Anh có chủ đích: từ vựng/mẫu câu/`hint`
  trong `englishCurriculum`, tên Unit sách Kid's Box, ngân hàng lời khen EN/VI, `British English`.
  Nhãn đảo còn được đẩy lên `z-20` để không bị rương/mascot che mất chữ.
- **Kẻ đường ô + tăng tương phản sáng/tối cho dễ theo dõi (đợt T35):** bàn 3D giờ ghép 64 mặt
  lát 0.93 trên pitch 1.0 nên tấm lát tối `board_inlay` bên dưới lộ ra thành 14 đường rãnh
  (ô vẫn liền mạch, hitbox giữ nguyên 1.0 nên bé bấm không khó hơn); ô sáng `#f5e6c8` / ô tối
  `#7b4a26` (trước là `#efd6ae` / `#9c6a40`) để phân biệt hai tông khi nhìn nghiêng; bàn 2D,
  demo "Nước đi mẫu" và lưới "Minh họa" mỗi ô có viền kẻ 2 px `rgba(47,29,16,0.9)` vẽ bằng
  inset shadow nên không làm lệch các overlay đặt theo %, ô đánh dấu nước đi đậm hơn
  (`/45 → /55–60` + viền xanh lá) và 3D bỏ mảng phủ tràn qua rãnh (`0.96 → 0.9`).
  Đo lại sau đợt: `npm run verify` **EXIT=0**, **80 file / 1145 test** (+2 test `t34`: rãnh kẻ
  và góc a1 tối / h1 sáng), main chunk `index-CoDA-Iqy.js` **534 kB PASS**, `three-vendor`
  **572.6 kB** (không đổi), `ChessScreen` **52.8 kB**; `qa/games.mjs` `QA PASS` `catalogCount: 31`;
  ảnh chụp 3D iso/top, 2D trước–sau nước đi, demo và minh họa.
- **Bộ cờ vua đổi sang cờ gỗ thật (đợt T34, theo yêu cầu "giống bộ cờ ngoài đời"):** bàn 3D
  bỏ toàn bộ kim loại vàng — ô cờ hai tông phong/gụ có vân gỗ tiện, viền óc chó 4 thanh,
  khắc a–h / 1–8; quân Staunton tiện lại bằng `ExtrudeGeometry` + bevel, mọi `metalness` về
  0, đai trang trí tối một bậc theo rãnh tiện thay cho vòng vàng; bàn 2D khung `#3f2817` /
  nền `#5b3a21` kèm dải nhãn hạng 8→1 và cột a→h; thẻ "Quân cờ", panel chi tiết và demo
  "Nước đi mẫu" thay ký tự Unicode ♜♞♝♛♚♟ bằng `ChessPieceSvg` — sửa luôn lỗi tương phản
  quân trắng Unicode gần như vô hình trên ô kem. Đo lại sau đợt: `npm run verify` **EXIT=0**,
  **80 file / 1143 test** (+9 test `tests/t34-chess-real-set.test.ts`), main chunk
  `index-CDvYH0Li.js` **534 kB PASS** (trần 600), `three-vendor` **572.6 kB** (từ 545.4, do
  `ExtrudeGeometry`), `ChessScreen` **52.3 kB** (từ 43.5). Bằng chứng nhìn thấy: screenshot
  bàn 3D (top/iso/POV), bàn 2D có khung gỗ và ô chọn, thẻ quân, tab Minh họa.
- Engine cờ tướng viết lại: negamax + alpha-beta kèm **node budget** để không bao giờ
  chặn UI thread của bé, evaluation tách khỏi move generation, quân cờ mang `id`.
- `qa/run-one.mjs`: không còn phụ thuộc đường dẫn Chromium hardcode trên Windows —
  thứ tự ưu tiên `PW_CHROME` → cache máy dev → Chromium do Playwright quản lý; thêm
  `--no-sandbox` khi chạy trong CI; in `QA PASS`/`QA FAIL` và chỉ exit 1 khi probe thực
  sự có lỗi (trước đây `!state.ok` làm probe sạch cũng trả exit 1).
- `qa/games.mjs`: bổ sung 3 title trò chơi mới (bắt buộc — 4 test đối chiếu catalog).
- `README.md`, `docs/SDLC.md` §9, `docs/MASTER_ROADMAP.md`: thêm liên kết tới bộ `docs/specs/`
  và `docs/plan/`.
- **Đo lại toàn bộ số liệu sau merge `75d364e`** (lane khác đưa Firebase cloud-sync + bàn cờ
  vua WebGL vào `main`): `npm run verify` **EXIT=0** với **69 file / 993 test**, build 8.92 s,
  main chunk `index-DGxWhyYx.js` **508.2 kB PASS** (trần 600, mục tiêu 450); dependency runtime
  **5 → 8** (`firebase ^13.1.0`, `three ^0.186.1`, `@types/three ^0.186.0`).
  Kèm theo: `AGENTS.md` §2 thu hẹp bất biến "không WebGL" thành "không WebGL ngoài màn cờ vua
  lazy" và ghi rõ cloud-sync là tuỳ chọn; `README.md` thêm mục dữ liệu; SRS lên **88 FR / 11 IF**
  (FR-Y08 viết lại, thêm FR-Y09 + FR-C06); ARCHITECTURE thêm **ADR-16** (sync opt-in) và
  **ADR-17** (vendor >200 kB phải ở chunk lazy), sửa ADR-01/ADR-11/ADR-13 và bảng kiểm kê §12;
  RTM thêm dòng FR-Y09/FR-C06, đổi tên `firebase-cloud-sync` → `firebase-auth-sync`;
  BRD sửa BG-01/BG-05/§4.2/R-02 và thêm **R-08** (dữ liệu trẻ trên cloud, chưa có UI xoá);
  TEST_PLAN thêm ca `chess-3d` + 2 khoảng trống mới (§16 #8, #9); TASK_PLAN thêm **§2.6 P44**
  và epic **EP-G (G1…G6)** cho nợ phát sinh.
- Bỏ con số hardcode "166 tài liệu Markdown" trong `README.md`, `docs/SDLC.md`, `mcp/README.md` —
  `kbt-docs` đếm lại lúc chạy nên con số cố định luôn sai theo thời gian; BRD ghi số đo được.
- **Nâng trần độ khó toàn catalog (T25)** theo phản hồi "các trò đang quá dễ" của phụ huynh;
  chuẩn mới là giữa–cuối lớp 1, tính 0–100 không nhớ/không mượn. Một bậc thang phương án dùng
  chung `TIER_OPTION_COUNT = [4, 4, 5, 5, 6, 6]` trong `src/data/gameLevels.ts` thay cho việc
  mỗi trò tự hardcode 4 đáp án.
  - Toán: `speed_racing` / `number_line_hop` / `number_tower` / `ocean_fishing` /
    `ten_frame_market` / `falling_numbers` lên trần 100, trộn phép hai bước ở bậc ≥5,
    giấy giờ chỉ bật từ bậc 4 và giảm dần còn 9 s ở bậc 6, chuỗi bóng Hứng Số tất định theo
    `(bậc, nonce)`, chợ Khung 10 thêm nút "Thêm 10" và hỏi theo chục.
  - Ngoài Toán: `shadow_match` / `animal_safari` / `listen_pick` lấy 6 phương án ở bậc 5–6
    (pool xoay trọn theo nonce), `rhyme_hunter` 4 → 12 trái/câu và chuyển sang builder riêng
    `buildRhymeRounds` thay vì cạo `options` từ ngân hàng câu hỏi (options của bank có chuỗi
    dài không phải một từ, hiển thị lên quả rất khó đọc), `syllable_builder` theo đúng
    `ROUNDS_PER_TIER` (8 câu ở bậc 6).
  - Puzzle: `memory_cards` 3 → 12 cặp (24 thẻ, lưới tự chuyển 3/4/5 cột thay vì ép 3 cột),
    `pixel_mosaic` 3×3 → 6×6 với 5 mẫu mới, `connect_dots` tới 18 chấm (thêm hoa 9 cánh,
    sao 8 cánh, bánh xe 14 tăm), `treasure_coding` bàn 4×4 → 8×8 với chương trình tới 18 lệnh
    (`MAX_TOKENS` 20) và đá chặn đường nhiều hơn.
- **Số liệu kiểm kê đo lại sau merge `fd3e7da`**: `README.md`, `docs/SDLC.md`,
  `docs/specs/{ARCHITECTURE,BRD,README,RTM,SRS}.md`, `docs/plan/{TASK_PLAN,TEST_PLAN}.md` cập
  nhật **71 file / 1035 test** và main chunk **531.2 kB** (thay cho 1034 / 512 kB đo trước
  merge); TEST_PLAN ghi 21 probe (20 `.mjs` + 1 `.cjs`).
- **T26 — Luyện thế cờ tướng có chấm bằng engine:** mỗi nước đi được kiểm bằng chính luật cờ
  (`inCheck(đen) && allLegalMoves(đen).length === 0` mới là chiếu bí), đi sai hiện phản hồi
  "Nước này chưa chiếu Tướng Đen. Bé thử quân khác nhé!", có nút gợi ý, lưu thế đã giải vào
  `kho_bau_cotuong_puzzles` (`StorageService.getCotuongSolvedPuzzles()` /
  `markCotuongPuzzleSolved()`, thưởng 25 XP đúng một lần), 6 tab thế cờ đủ 44 px.
- **T27 — Học hấp dẫn hơn:** chuỗi câu đúng liên tiếp (`lesson-combo`, âm thanh
  `sound.playCombo()`, confetti ở mốc 3 và 5), đồng hồ học (`lesson-timer`, dừng ở màn kết
  quả), xếp hạng 3 sao theo tỉ lệ đúng (`src/components/learning/lessonEngagement.ts`), danh
  sách câu chưa đúng kèm đáp án + nút "Ôn lại N câu" (lượt ôn chỉ gồm các câu sai, combo
  chạy lại từ 0), thẻ thống kê thời gian / chuỗi dài nhất / số câu đúng. Header bài học tách
  hai hàng để nút đóng luôn nằm trong màn 390 px.
- **T27 — Bằng chứng trình duyệt:** `qa/lesson-engagement.mjs` (2 lượt @390×844: lượt 1 học
  từ phản hồi của app rồi ôn lại) → `QA PASS — 3 step(s), 0 errors` (2/11 → 1 sao, 9 câu sai;
  ôn 9/9 → 3 sao, `maxCombo 9`, hàng sao trong màn hình, `overflowPx: 0`);
  `qa/cotuong-puzzles.mjs` → `QA PASS — 5 step(s), 0 errors` (giải 2 thế → `2/6 thế`, reload
  còn tiến độ, ô bấm ≥ 44 px).

### Removed
- **68 prompt đã dùng xong trong `docs/` (358 kB)**, gỡ ngày 2026-10-30: 11 prompt phase ở gốc
  (`KHO BÁU TRI THỨC — P34/P36/P38/P39/P40…`, `MASTER AUTONOMOUS PROMPT — P27.5…`,
  `Prompt OpenCode — Adaptive Learning Upgrade`), `p41.md`, `skill.md` (prompt của dự án khác —
  VN-STOCK-AI-PRO), `docs/opencode/UI.txt` (bản paste tài liệu Claude Code), 20 brief
  `docs/opencode/T01…T20.md` và 34 task `docs/opencode/queue/` (mỗi task đều đã có báo cáo).
  **Giữ lại:** 3 master prompt module còn là mô tả thiết kế duy nhất (`cotuong.md`, `covua.md`,
  `olypictienganh.md`), `queue/05_T03B_linh_vat_minh_hoa.md` (task Mascot **chưa làm**), toàn bộ
  `docs/opencode/reports/` (41 mục: 39 `.md` + `_metrics.json` + `img/` — `qa/t01-hotfix.mjs`
  và `qa/t02-smoke.mjs` vẫn ghi ảnh vào `reports/img/`), `00_RULES.md` + runner `run-all.ps1`
  + 4 file `.bat`.
  Báo cáo cũ vẫn nhắc tên brief đã gỡ — không sửa tài liệu đã chứng nhận. Khôi phục:
  `git show "99edd29:<đường-dẫn>"` (xem `docs/MASTER_ROADMAP.md` §"Cấu trúc docs/ sau khi gỡ prompt").

### Fixed
- **`npm ci` đỏ trên cả 4 workflow — lockfile lệch theo cách npm 10 kiểm:** push `main` + tag
  `v1.1.0` đầu tiên (commit `7d92246`) làm `1. Quality` / `2. Build + artifact` / `4. Release` chết
  đúng bước Install với `npm error code EUSAGE · Missing: @emnapi/core@1.11.3, @emnapi/runtime@1.11.3
  from lock file`. Máy phát triển không thấy lỗi vì npm 11.6.2 tự suy hai gói còn thiếu
  (`npm ci` ⇒ EXIT=0, 158 packages). Sửa bằng `npx --yes npm@10 install --package-lock-only
  --no-audit --no-fund` ⇒ thêm hai mục `inBundle` dưới `@tailwindcss/oxide-wasm32-wasi`, bỏ
  `@emnapi/wasi-threads` đứng độc lập (21 insertions / 18 deletions, `package.json` và `src/` không
  đổi). Đối soát: `git archive HEAD | tar -x` rồi `npx --yes npm@10 ci --no-audit --no-fund` ⇒ **EXIT=0**
  (157 packages, 24s); `npm ci --dry-run` với npm 11 ⇒ EXIT=0. Vì `4. Release` dừng ở Install nên
  "Create GitHub Release" bị `skipped` — lần tag đầu **không** tạo release nào.
  Bằng chứng: `evidence/2026-11-02-KBT-ISSUE-43/ci-install-red.txt`.
- **"3. Browser QA" chưa từng chạy probe trên CI:** sau khi Install xanh, job chuyển sang đỏ ở bước
  `Download dist artifact` — `actions/download-artifact@v4` chỉ thấy artefact của **cùng một**
  workflow run, còn `dist-<sha>` do `2. Build + artifact` upload ở run khác. Thay bước đó bằng
  `npm run build --silent` trong chính job (`qa/run-one.mjs` đã sẵn cho Linux: `DEFAULT_CHROME` là
  đường dẫn Windows nên `executablePath` để ngỏ, playwright tự tìm chromium vừa install, `--no-sandbox`
  bật khi `CI=true`). Kết quả đo trên `66e0fea`: Install · Build · Install Chromium đều success, job
  chạy 61 s thay vì 12 s, và **bước 7 `QA probe` là chỗ đỏ mới** — probe thật sự chạy trên runner
  Linux lần đầu tiên. Chưa đọc được dòng lỗi (API log trả `403 Must have admin rights to Repository`).
  `continue-on-error: true` vẫn giữ nguyên theo ghi chú trong file: cần nó xanh liên tiếp vài lần
  trên `main` trước khi cho phép chặn merge. Bằng chứng: `evidence/2026-11-02-KBT-ISSUE-43/ci-runs.txt`.
- **Tag `v1.1.0` treo trên commit mà CI đỏ:** lần tag đầu đóng ở `7d92246`, tức commit mà cả 4 workflow
  vừa chết ở Install — `git tag` tồn tại dễ bị đọc nhầm thành "bản này phát hành được" trong khi chưa
  có release nào. Xoá tag ở cả `origin` và máy cục bộ, chạy lại cổng trên HEAD mới, rồi tag lại:
  `npm run verify` trên `77d90ce` ⇒ **EXIT=0** · `89` test file · `1278` test · `Duration 21.84s` ·
  `index-B6au8G63.js = 204.2 kB → PASS` (cùng entry hash với `7d92246` — hai commit chỉ khác tài liệu).
  `4. Release` run 41490669966 **success cả 9 bước** ⇒ release thật id `431754261`, ghi chú 80 435 byte,
  asset `kho-bau-tri-thuc-1.1.0.zip` 1 369 166 byte, **0 lượt tải**. Cũng trên commit này `npm ci` +
  toàn bộ gate chạy **xanh trên Ubuntu runner**, không chỉ Windows. Tag hiện hành:
  `git for-each-ref refs/tags/v1.1.0 --format='%(objectname) %(*objectname)'` ⇒ `4f75f5d` / `77d90ce`.
  Vẫn mở: `3. Browser QA` đỏ ở `QA probe` (lần thứ hai, cùng bước ⇒ tái lập chứ không trượt nhất thời),
  chữ ký Go/No-Go trống, chưa ai giải nén zip trên máy thật. Bằng chứng:
  `evidence/2026-11-02-KBT-ISSUE-43/ci-release-green.txt`.
- **Lớp phủ "Đang tạm dừng" không nói gì với bộ đọc màn hình (review 4 lớp, finding #6):** màn che
  chỉ là `div` trang trí ⇒ bé dùng trình đọc màn hình bấm tạm rồi không biết mình đang ở trạng thái
  nào. Thêm `role="status"` + `aria-live="polite"` + `aria-label="Đang tạm dừng"`
  (`GameModalWrapper.tsx:550`), và ba assertion vào hợp đồng nguồn trong
  `tests/t43-game-pause.test.ts` (`grep -c 'role="status"'` trong file = 1 nên không khớp nhầm).
- **Nút "Tạm dừng" bấm không dừng được gì (KBT-ISSUE-43):** `data-testid="game-pause"` tồn tại
  từ T32 nhưng là ống nước chết — `GameModalWrapper` giữ `isPaused` trong state riêng, không prop
  nào truyền xuống `useGameStage`, nên bé bấm tạm mà đồng hồ vẫn chạy, vẫn trừ điểm chậm, vẫn
  nhận câu trả lời, và lớp phủ "Đang tạm dừng" che mất bàn chơi trong khi ván vẫn trôi. Nay
  `isGameClockRunning` là cổng duy nhất: `pausedByUser` (hoặc `locked`, `overlayOpen`, không còn
  `playing`) ⇒ không tick, không đổi câu, không Sao/XP, không lời khen; *Đường Đua* đóng băng cả
  hai thanh tiến trình (`width` không đổi sau 1 500 ms) nên việc cắt ngang không bị phạt; bấm
  "Chơi tiếp" thì đồng hồ chạy lại và `aria-pressed` về `false`.
- **Cờ vua mức Kiện tướng (expert) suy nghĩ quá lâu làm lag / đứng trình duyệt:**
  Thuật toán tìm nước đi ở mức 4 trước đây gọi hàm tạo nước đi và kiểm tra kết thúc trò chơi lặp đi lặp lại ở từng nút lá, liên tục sao chép toàn bộ bàn cờ (`cloneBoard`) và tính độ linh động bằng cách sinh nước đi hợp lệ cho cả hai bên. Khắc phục bằng cách:
  (1) Thay thế kiểm tra bị chiếu `isAttacked` bằng cơ chế raycast trực tiếp O(1) không cấp phát mảng.
  (2) Đi và thu hồi nước cờ trực tiếp trên bàn cờ (`in-place make/unmake move`), triệt tiêu 100% chi phí phân bổ mảng và giảm áp lực GC.
  (3) Đơn giản hóa hàm đánh giá vị trí `evaluate`, loại bỏ việc sinh nước đi ở nút lá.
  (4) Sắp xếp nước đi theo MVV-LVA (ăn quân giá trị cao bằng quân giá trị thấp) để tối đa hóa hiệu quả cắt tỉa Alpha-Beta.
  (5) Áp dụng tìm kiếm sâu dần (Iterative Deepening) với trần ngân sách thời gian (deadline 400ms) đảm bảo AI luôn phản hồi mượt mà dưới 500ms mà không làm đơ giao diện.
- **Trò chơi thời gian thực (Bắt Chữ Cái Bay, Hứng Số Rơi, Đập Bóng Màu) bị co hẹp thành một vạch chỉ giữa màn hình:**
  Do container `GameModalWrapper` có `items-center` và các trò chơi rơi bóng chỉ chứa phần tử `position: absolute` (không có phần tử in-flow để tính kích thước nội tại), trình duyệt co chiều ngang của sân chơi về 0px khiến chỉ còn thấy viền xanh (4px) ở chính giữa. Sửa bằng cách thêm `self-stretch min-w-full` vào `CatchFallingLettersGame`, `FallingNumbersMathGame`, `EnglishColorBalloonGame` và `self-stretch` vào container con của `GameModalWrapper.tsx`.
- **Bốn đường ghi tiến trình tự nhận "idempotent" nhưng chỉ tầng bằng liệu chống trùng thật
  (đợt T41C):**
  (1) `writeJSON` nuốt mọi lỗi ghi (chế độ riêng tư của Safari / hết quota) nên bước ngày của
  chuỗi trong `getChildProfile` cộng `streak +1` rồi ghi thất bại ⇒ **mỗi lần đọc** lại thêm một
  lần, và khiên giữ ngày bị tiêu theo. `writeJSON`/`saveChildProfile`/`saveMotivationState` nay
  trả `boolean`; bước ngày chỉ giữ kết quả khi ghi được, ngược lại hoàn tác `streak` +
  `lastActiveDate` và chỉ tiêu khiên **sau khi** bước ngày đã nằm chắc trong bộ nhớ.
  (2) `recordQuestionAnswer` bỏ qua bằng liệu trùng (`recordLearningEvidence` trả `false`) nhưng
  lời gọi bị bỏ qua nên vẫn chạy tiếp ⇒ `totalQuestionsAnswered`, `skillMastery.attempts`,
  `recentErrors` và quest đều bị nhân đôi khi một câu được gửi hai lần. Nay có `if (!recorded)
  return;` chắn trước toàn bộ phần thưởng.
  (3) `ReadingEngine.applySession` cộng dồn lượt của buổi đọc vào hồ sơ trong khi
  `saveReadingMetrics`/bằng liệu đã chống trùng ⇒ buổi gửi hai lần nhân đôi `attempts` và kéo
  `accuracy` lệch đi. Hồ sơ đọc nay mang `appliedSessionIds` (whitelist trong sanitizer, cắt theo
  `MAX_RECENT_SESSIONS`) và `applySession` trả nguyên trạng thái khi đã thấy `sessionId`.
  (4) `recordTierReward` không có biên lai ⇒ hai cú gửi của **cùng một lượt chơi** cộng Sao/XP/
  `gamesPlayedCount`/quest hai lần — đúng tầng "completion/reward" mà NFR-R04 hứa nhưng chưa từng
  tồn tại. Mỗi lượt có khoá `game:t<tier>:n<nonce>:<sao cũ>→<sao mới>:s<điểm>` (`nonce` là số
  lần mở màn, nên lượt chơi lại thật vẫn được trả XP luyện tập) ghi vào `rewardClaims` newest-first
  60 bản; trùng thì trả `isDuplicate: true` và không ghi biên lai khi lưu thất bại.
- **Màn kết quả trò chơi hứa phần thưởng không tồn tại (đợt T41C):** hai bảng "VƯỢT QUA MÀN" và
  "HOÀN THÀNH TẤT CẢ MÀN" in `+{(receipt?.stars ?? earnedStars)} Sao`, nên cả ba trường hợp trả 0
  (chơi lại không phá kỷ lục, ba mẹ tắt quỹ thưởng, biên lai trùng) vẫn hiện "+0 Sao" — và ở khung
  hình đầu, khi chưa kịp có biên lai, hiện trọn số đề xuất `+2 Sao` dù thưởng đã tắt. Tách thành
  `GameRewardStrip`: chỉ in từng dòng khi số lớn hơn 0, số fallback bị chặn bằng
  `areRewardsEnabled()`, và 0/0 chuyển sang dòng `data-testid="game-rewards-muted"` nói rõ lý do.
- **Đồng hồ của DecisionEngine/LearningOS đọc giờ tường và UTC thay vì đồng hồ caller + lịch
  địa phương (đợt T41B):** ba chỗ hỏng cùng một họ.
  (1) `computeSubjectBalanceBoost` tự gọi `Date.now()` để cắt cửa sổ 14 ngày trong khi
  `decide({ now })` đã nhận `now` từ caller ⇒ hợp đồng tất định (§32) bị phá: cùng một bộ bằng
  liệu cho hai kết quả khác nhau ở hai thời điểm đọc, và test khoá `now` cố định thành ra vô nghĩa.
  Nay hàm nhận `now: number` (và được `export` để test đồng hồ gọi trực tiếp), `decide()` truyền
  `now` xuống.
  (2) Báo cáo Ba Mẹ đóng khoá ngày bằng `new Date(now).toISOString().slice(0, 10)` — tức **UTC**,
  trong khi `analytics.todayDate` do `storage.ts` ghi bằng `localDateKey`. Ở UTC+7 đồng hồ UTC
  sang ngày mới lúc 07:00 giờ Việt Nam, nên bé học lúc 06:30 thì báo cáo vẫn tính vào hôm trước,
  và "phút hôm nay" rơi về 0 dù vừa học xong (nhánh fallback `getAnalytics()` cũng so sai khoá).
  `buildParentReport` và trường `today` nay dùng `localDateKey`, cùng quy tắc T01/B8 mà
  `dateUtils.ts` đã ghi.
  (3) Dòng "Hạn ôn tiếp theo:" trong phần giải thích cũng in `toISOString().slice(0, 10)` ⇒ một
  hạn ôn buổi sáng hiển thị thành ngày hôm trước; đã đổi sang `localDateKey`.
  Ngoài ra `LearningOS.generateDailyPlan` nhận `dateString` là ngày địa phương nhưng lại chấm
  điểm và ghi `generatedAt` bằng `Date.now()` tự đọc ⇒ thêm tham số `now` (mặc định `Date.now()`),
  `StorageService.refreshDailyPlan` đọc đồng hồ **một lần** rồi truyền cho cả nhãn ngày lẫn điểm
  kỹ năng đến hạn, để kế hoạch tái lập được từng byte khi test cùng `now`.
- **Công tắc "Toàn Bộ Phần Thưởng" của ba mẹ chặn không đều, và màn kết quả hứa sai (đợt T41A):**
  tắt quỹ thưởng mà bé vẫn tiêu được sao ở một số đường vào. `storage.ts` nay kiểm tra
  `areRewardsEnabled()` ở **mọi** chỗ phát tài nguyên — `completeLesson` (bài mới + luyện lại +5 XP),
  rương theo chủ đề, rương ngày, quà theo cấp, phần thưởng trò chơi, quest và `checkAchievements()`
  — còn tiến độ học (`completedLessons`, `lessonStars`, số lượt chơi, lịch sử bài làm) vẫn ghi bình
  thường vì đó là dữ liệu học, không phải tài nguyên tiêu được. `recordQuestEvent` vẫn đếm tiến trình
  quest nhưng trả về danh sách phần thưởng rỗng khi đang tắt, để bật lại sau không bị nhận dồn.
  Shop thì đi vòng qua tầng dịch vụ: `AvatarShopScreen` tự cộng `unlockedItems` và tự trừ sao, nên bỏ
  qua khoá theo cấp độ, không ghi lịch sử thưởng và **vẫn tiêu được sao khi ba mẹ đã tắt** — nay gọi
  `StorageService.buyShopItem()` rồi đọc lý do từ chối (`rewards-off` / `level-locked` / `not-enough-stars`)
  để nói rõ với bé bằng âm thanh; nút "Mở khóa" cũng không còn sáng xanh trên món chưa tới cấp.
  Màn kết quả bài học in lại `lesson.xpReward`/`lesson.starReward` nên hứa "+10 Sao +1 Vé" dù lượt
  luyện lại chỉ được +5 XP và dù thưởng đã tắt — `completeLesson` trả về `LessonAward` (số thật vừa cấp)
  và UI chỉ in dòng thưởng khi có thưởng, ngược lại hiện `lesson-rewards-off` nói với bé là lượt học
  không cộng Sao/XP/Vé. Máy kéo Gacha cũng dừng ở tầng giao diện, không chỉ bị từ chối âm thầm bên
  trong dịch vụ.
- **Luồng "bài tiếp theo" trên trang Chủ đứt hai đoạn (đợt T41A):** CTA "Bắt đầu: …" chỉ mở bản đồ môn
  nên bé phải tự lần tìm bài được gợi ý — `App.tsx` nay giữ `autoOpenLessonId` và `SubjectScreen` mở
  thẳng bài khi id còn hợp lệ (đã mở khoá); id lạ hoặc đã bị khoá dịch thì dừng ở bản đồ và **luôn** báo
  `onAutoLessonConsumed` để lần sau không bật lại oan. Link "Vì sao gợi ý này?" bấm không xảy ra gì —
  `handleOpenParent(tab)` truyền tab và `ParentDashboardModal` nhận `initialTab`, nên link mở đúng tab
  Phân Tích & Lời Khuyên.
- **Đồng hồ thời gian dùng máy cộng phút cả khi tab bị ẩn (đợt T41A):** `useEffect` trong `App.tsx` có
  `isScreenTimeAlertOpen` trong deps nên mỗi lần cảnh báo bật–tắt là interval bị huỷ và tạo lại, đồng hồ
  phút bị trôi; Android/iOS treo tab nền hàng giờ vẫn bị tính "học 60 phút" và chặn bé oan. Interval giờ
  tạo một lần, bỏ qua tick khi `document.hidden`, và trạng thái cảnh báo cập nhật qua function-form.
  Xoá luôn `useEffect` chết trong `Header.tsx` (tính `daysSinceLastPlay` rồi bỏ kết quả, kéo theo import
  `StorageService` không cần thiết).
- **Hai thành tựu quest không bao giờ mở khoá (đợt T41A):** `sanitizeMotivation` có whitelist khoá được
  giữ lại khi đọc, và `questsCompletedTotal` nằm ngoài whitelist — bộ đếm bị đưa về 0 sau mỗi lần đọc,
  nên rule "7/30 nhiệm vụ ngày" không bao giờ đạt. Thêm vào whitelist, có test ghim lại.
- **Mã máy và tiếng Anh lộ trên báo cáo Ba Mẹ (đợt T40):** lịch sử phần thưởng từng in trực tiếp
  `vn-les-1`, `catch_letters tier 2`, `shop_item`, `xp` và dòng `ID: …`; nay `rewardLabels.ts`
  quy đổi id bài học/trò chơi/thành tựu/đồ vật thành tên tiếng Việt ngay lúc hiển thị, không viết
  lại lịch sử cũ. `decisionLabels.ts` dùng chung cho Home + dashboard để Việt hoá lý do, trạng thái
  kỹ năng, chất lượng/độ mới bằng chứng, khả năng mở và chế độ quyết định; mã enum vẫn giữ trong
  dữ liệu có cấu trúc và `data-*` cho QA. Sửa thêm `normalizeReadingSkillId` nhân đôi `rf_`, thêm
  migration `P43-v1` gộp an toàn khoá `rf_rf_* → rf_*`, đưa kỹ năng đọc vào catalogue và chữa tên
  kỹ năng bị lưu thành id ở lượt đọc; prefetch catalogue trong `App.tsx` nay bắt lỗi và thử lại một
  lần thay vì tạo unhandled rejection. `npm run verify` **EXIT=0**: **84 file / 1188 test**, entry
  `index-D9UEuKwe.js` **202.3 kB PASS**, boot graph **416.6 kB**; probe T40 trên `dist/` →
  `QA PASS — 6 step(s), 0 errors`, `qa/decision-engine.mjs` → `QA PASS — 12 step(s), 0 errors`.
- **Test chống trùng đề đỏ vì timing, không vì nội dung (đợt T39):** `tests/content-quality.test.ts`
  mục *"never has two semantically duplicated prompts"* chạy một mình hết **4.17 s** (`npx vitest run
  tests/content-quality.test.ts` → 16 test pass) nhưng khi 8 worker tranh CPU thì vượt trần 20 s mặc
  định và ném `Test timed out in 20000ms` ⇒ `npm run verify` **EXIT=1** ở lần chạy đầu của đợt này. Cấp ngân sách
  thời gian riêng `it(..., 120_000)` cho đúng test O(n²) này (không đổi assertion, không nới trần
  toàn suite); chạy lại `npm run verify` **EXIT=0**, 83 file / 1173 test.
- **Probe `qa/t01b-fixes.mjs` đỏ từ ba đợt trước vì chuỗi cũ (đợt T39):** mục 10 khớp nguyên văn
  `"Mini-Game"` trong khi đợt T36 (commit `81784a9` — "Việt hoá các chuỗi còn sót") đã đổi nhãn của
  `WorldMapScreen` thành `` `${GAMES_CATALOG.length} trò chơi trí tuệ bổ ích` ``; `git log -S"Mini-Game" -- src/`
  xác nhận không còn chuỗi đó trong `src/` nữa. Cập nhật regex sang `trò chơi trí tuệ` và thay
  `waitForTimeout(600)` cố định bằng `waitForFunction` — màn Bản đồ giờ là chunk lazy nên nhịp chờ
  cứng dễ đỏ vì timing. Probe PASS với `worldMapCount: "31"`. **Đây là lỗi để lọt từ T36**, không phải
  hồi quy do T39: bài học là **đổi chuỗi hiển thị thì phải grep `qa/` lẫn `tests/` trong cùng đợt sửa**.
- **Bàn cờ vua 3D không còn để bé gặp màn trắng (EP-G3, đợt T38):** `Chess3DCanvas` đã có thăm dò
  WebGL nhưng còn ba lỗ hổng — (1) mỗi lần mở màn cờ tạo **hai** canvas thăm dò và không nhả
  context nào, mà trình duyệt chỉ giữ ~16 context sống, nên vào/ra vài lần là
  `new THREE.WebGLRenderer()` ném; (2) không bắt `webglcontextlost`, nên khi driver reset hoặc máy
  bật tiết kiệm pin thì canvas đứng hình vĩnh viễn giữa ván; (3) bé bị đá sang bàn 2D **im lặng**,
  ba mẹ tưởng ứng dụng hỏng. Nay phép thăm dò nằm trong module thuần
  `src/components/learning/chess/chess3d/webglSupport.ts` (`probeWebGL`: một canvas, thử `webgl2`
  rồi `webgl`, luôn nhả context ở `finally`, không import `three` nên bàn 2D không phải tải
  `three-vendor`), renderer mới được `forceContextLoss()` khi rút bàn, và `ChessGame` hiện banner
  `role="status"` (`data-testid="chess-3d-fallback"`) nói rõ bé đang chơi bàn 2D vì máy không vẽ
  được 3D + cách thử lại bằng nút "3D Sống Động".
- Luật cờ tướng được khoá lại bằng test (cản chân Mã, mắt Tượng, Pháo phải có đúng một
  screen khi ăn, tốt chỉ ngang sau khi qua hà, hai Tướng không đối mặt, không tự bỏ
  chiếu, `applyMove` cập nhật bàn cờ).
- Lỗi hiển thị bàn cờ 3D: cạnh dưới bàn cờ bị cắt (thêm padding `.ct-scene`) và nhãn
  "sông" bị nhoè (chuyển sang lớp HTML thay vì text trong CSS-3D).
- **Màn kết quả bài học che hàng sao (T27, bắt được bằng screenshot 390 px):** container
  dùng `justify-center` + `overflow-y-auto` nên khi danh sách câu sai dài, hàng sao bị cắt ở
  đầu và không cuộn tới được; nút "Về bản đồ" còn `autoFocus` khiến trình duyệt tự cuộn
  xuống đáy ngay khi mở. Sửa: wrapper `my-auto` (ngắn thì căn giữa, dài thì cuộn từ trên) và
  thay `autoFocus` bằng effect đưa tiêu điểm vào khung cuộn với `scrollTop = 0`.
- **Header bài học tràn ở 390 px (T27):** khi thêm bộ chọn độ khó + cụm điểm vào cùng hàng,
  nút đóng (X) bị đẩy ra ngoài màn hình; tách header thành hai hàng (tên bài + đồng hồ +
  đóng / độ khó + điểm), `min-w-[44px] min-h-[44px]` cho nút đóng, đo lại `overflowPx: 0`.
- **Vòng sửa bug T26/T27 (soát lại sau khi có bằng chứng trình duyệt), 5 lỗi thật:**
  - Bàn cờ tướng vẫn nhận thao tác khi đang hiện nước chiếu suông: bé bấm quân trong 1,1 s
    "bàn cờ tạm" rồi bàn cờ trả về sẽ giữ `selected`/`legal` tính trên thế cờ khác. Chặn mọi
    thao tác khi `status !== 'playing'`, và timer trả bàn cờ xoá sạch quân đang chọn.
  - Đã xoá lời nhắc "Nước này chưa chiếu" ngay sau nước **chiếu suông**: trước đây `misses`
    tăng nên sau khi bàn cờ trả về bé vừa đọc "Chiếu rồi!" lại thấy "chưa chiếu"; tách cờ
    `missNotice` và tắt trong timer trả bàn cờ.
  - Overlay thế cờ giải lại vẫn ghi "+25 XP" dù `markCotuongPuzzleSolved` trả `false` và
    không cộng XP; giờ hiện "Đã giải trước đó — ôn lại không thêm XP" (probe đọc XP trước/sau
    để chắc không đổi).
  - Đổi độ khó (Chuẩn/Thử thách) ở **màn kết quả** chỉ reset điểm: bé kẹt ở màn kết quả với
    "0 / N" và 1 sao. Gom mọi reset vào `startRun()`, dùng chung cho học lại, ôn câu sai và
    đổi độ khó.
  - Lượt **ôn câu sai** vẫn hiện khối thưởng "+Sao / +XP / +1 Vé" dù `completeLesson` chỉ
    cộng 5 XP luyện lại; giờ hiện khối `lesson-review-reward` nói đúng "+5 XP" và ghi rõ
    không thêm Sao/Vé.
- **Audit UI T28 — sửa các lỗi nhìn thấy được từ ảnh chụp của bé:**
  - **Bàn cờ tướng lệch quân:** lưới, cung Tướng và dấu mốc được vẽ từ `(0,0)` trong khi
    quân đặt theo lề `M = 0.95` ô, nên mỗi quân lệch gần một ô và hàng/cột biên nằm ngoài
    đường bao. Bọc toàn bộ lưới trong `<g transform="translate(M M)">`; probe đo lại 10
    đường ngang + 16 đường dọc khớp tọa độ quân.
  - **Máy gắp sticker dồn cục:** 8 sticker được xoay quanh tâm cửa kính với bán kính 60 px
    (lại tính bằng `Date.now()` mỗi lần render nên không hề quay), trên khung ngang chúng
    chụm thành một cục. Xếp 10 sticker theo % khung (2 lớp đống ở đáy kính), thêm hiệu ứng
    `gacha-jumble` + `claw-drop`, và đưa nút "Gắp Ngay" xuống **dưới** máy thay vì đè lên
    đống sticker.
  - **9 lớp `animate-*` chưa từng khai báo CSS** (`fade-in`, `slide-down`, `pop-in`,
    `pulse-slow`, `float-slow`, `bounce-subtle`, `spin-slow`, `pulse-ring`, `claw-drop`):
    modal tài khoản/lên cấp/kết quả và máy gắp đứng im vì Tailwind không sinh class tuỳ
    biến. Khai báo đủ trong `src/index.css`, kèm guard `tests/t28-ui-polish.test.ts` quét
    mọi `animate-*` trong `src/**/*.tsx`.
- **Hồi quy offline (FR-Y03 / NFR-R01):** chunk lazy (`SubjectScreen`,
  `LessonPlayerModal`, `praiseEngine`, `questionAudio`…) chết `net::ERR_FAILED` khi tắt
  mạng, bé không mở được môn học nào — `qa/offline-pwa.mjs` đỏ 2/2 lần chạy. Nguyên nhân
  đo được bằng probe tạm: `vite preview` trả asset kèm `vary: Origin`, khoản precache lưu
  theo request *không* có header `Origin` trong khi request script của trang *có*
  `Origin: http://localhost:4173` ⇒ `cache.match()` mặc định trượt dù `dist/sw.js` đã
  precache đủ 98/98 URL (`assetCount: 86`). Sửa trong `public/sw.js`: nhánh same-origin
  match với `{ ignoreVary: true }` (tên file đã hash nội dung), fallback navigation dùng
  `ignoreSearch + ignoreVary`, cross-origin vẫn tôn trọng Vary. Probe chạy lại **3 lần đều
  `QA PASS — 10 step(s), 0 errors`**, học và trả lời câu hỏi được khi offline; hợp đồng
  khoá lại bằng test mới trong `tests/pwa.test.ts`.
- **Đỏ CI do thiếu lockfile:** lane `3727f04` push lên `main` kèm việc **xoá
  `package-lock.json`** (3331 dòng) dù message chỉ nói `feat(auth,chess)`; cả 4 workflow đều
  chạy `npm ci --no-audit --no-fund` nên `npm ci` từ chối cài đặt, và `AGENTS.md` §1.6 coi
  lockfile là nguồn thật. Merge commit `b123fe9` giữ lại lockfile (package.json giữa hai lane
  không đổi nên không cần `npm install` lại). Số liệu kiểm kê trong `docs/specs` +
  `docs/plan` đo lại sau merge: **70 file / 1013 test**, entry `index-_TMkcsWv.js` **512 kB**,
  `three-vendor` 545.4 / `firebase-vendor` 537.9 / `ChessScreen` 43.5.
  **Tái diễn ở `fd3e7da`:** lane đó lại xoá `package-lock.json` (3331 dòng) trong merge nên
  merge lần này chạy `git merge --no-commit` rồi khôi phục lockfile trước khi commit;
  `package.json` vẫn không đổi giữa hai lane nên không cần `npm install` lại.
- **`origin/main` đỏ vì dữ liệu thế cờ tướng, không phải vì code:** test
  `tests/cotuong-engine.test.ts > validates COTUONG_PUZZLES integrity` fail ngay sau khi merge
  `fd3e7da`, vì 3/6 thế cờ tác giả đặt sai luật nên engine trả `legalMoves = []` và bé không
  chơi được: `ct-pz-1` hai Tướng cùng cột 4 thông (luật "tướng đối mặt" — `kingsFace()`
  ở `src/components/learning/cotuong/cotuongEngine.ts:201` — vô hiệu hoá **mọi** nước Đỏ),
  `ct-pz-2` Pháo sau có **hai** ngòi trên cột 4 (`b[1][4]` Sĩ + Pháo trước) nên không được
  phép bắn, `ct-pz-3` Xe bị Sĩ của chính mình ở `b[1][3]` chắn ngay trước mặt. Sửa trong dữ
  liệu: Tướng Đỏ `b[9][4]` → `b[9][3]`, Sĩ Đen `b[1][4]` → `b[1][3]`, Sĩ Đen `b[1][3]` →
  `b[1][4]`; hint `ct-pz-2` cập nhật toạ độ `[2, 4]` → `[6, 4]` cho khớp bàn cờ. Test cũ
  chạy lại **18/18 pass**.
- **Bé lớp 1 không nghe được phép tính (FR-Y02):** đề thi viết ký hiệu — `Tính: 6 + 4 = ?`,
  `Điền số: ... + 27 = 60` — nhưng giọng tiếng Việt của nền tảng bỏ qua `+`, `−`, `=` nên bé
  chỉ nghe "sáu bốn" và mất ngữ cảnh. Đo 2026-10-30: **24/475** câu trong kho thi mang ký
  hiệu trong văn bản đọc (260 câu Toán của curriculum đã có `audioPrompt` viết bằng lời nên
  không bị). Thêm lớp phát âm `src/services/speechText.ts` (`toSpeechText`): nối
  "cộng / trừ / bằng mấy / bằng bao nhiêu" vào đúng văn bản giao cho
  `SpeechSynthesisUtterance` ở **cả hai** đường đọc (`sound.speak`, `useSpeak.speak`).
  Chữ hiển thị, assert routing trong `questionAudio.ts` và `data-last-spoken` giữ nguyên văn
  đề; dãy trong ngoặc vuông (`[1 - 3 - 5]`), khoảng en dash (`1–3`), tên file
  (`add-sub-10`) và số âm đứng một mình không bị đọc thành phép trừ. `qa/audio.mjs` có bước
  mới ghi lại văn bản thật sự vào utterance và **FAIL nếu còn ký hiệu thô**:
  `QA PASS — 9 step(s), 0 errors` (2/2 lần chạy, `symbolicSeen: 4`, `symbolicSpoken: 4`,
  `rawSpoken: []`).
- **Luồng học chưa mượt (T29) — 5 lỗi thật, sửa sau khi đo bằng probe trình duyệt:**
  - **Mất thanh "Kiểm tra câu trả lời" khi cuộn:** thanh hành động nằm *trong* vùng
    `overflow-y-auto`, nên đề dài (hoặc khi mở bàn phím) đẩy nút xuống dưới đáy và bé phải
    cuộn ngược lên mới bấm được. Tách thanh thành anh em `shrink-0` nằm ngoài vùng cuộn;
    probe đo `barInsideScroller: false`, thanh đứng yên `barTop 714..766` khi cuộn hết đề.
  - **Câu mới mở ở giữa:** `scrollTop` dính lại từ câu trước nên đề tiếp theo xuất hiện
    không ở đầu. Reset `scrollTop = 0` khi đổi câu, trong `startRun()` (học lại / ôn câu sai
    / đổi độ khó) và cuộn lên đầu khi "Thử lại câu này".
  - **Banner chuỗi câu đúng làm nhảy đề:** banner `combo` chèn thêm một hàng vào luồng nên
    toàn bộ đề dịch xuống mỗi khi tạo/thoát chuỗi. Đặt vào slot cố định `h-6`
    (`data-testid="lesson-combo-slot"`) luôn chiếm chỗ; probe đo `comboSlotHeight: 24`,
    `comboShift: 0`, `barShift: 0`.
  - **Không thấy phản hồi đúng/sai:** với đề dài, phản hồi nằm dưới đáy vùng cuộn nên bé
    trả lời xong không thấy kết quả. Thêm `feedbackRef.scrollIntoView({ block: 'nearest',
    behavior: 'smooth' })` sau khi chấm; probe đo `feedbackVisible: true`.
  - **Cả modal render lại mỗi giây:** `setInterval` đặt state đồng hồ ở component cha nên
    toàn bộ đề/ảnh/nút render lại 1 lần/giây. Tách `<LessonClock startedAt paused>` riêng,
    `elapsedSec` chỉ tính một lần lúc kết thúc bài.
- **Quân cờ tướng trông "dán phẳng" lên mặt bàn (T30, bé báo bằng ảnh chụp):** đo trên build thật
  cho thấy hai nguyên nhân CSS, không phải lỗi thứ tự vẽ (`elementsFromPoint` trả mặt quân #4
  so với lưới #9 — quân đã nằm trên lưới). (1) Bóng tiếp đất khai `inset: 16% 8% -2% 8%` nên nằm
  lọt hoàn toàn trong lòng quân, không bao giờ nhìn thấy; (2) `.ct-piece__base` cùng kích thước
  với mặt quân nên không có thành, quân chỉ là một hình tròn in trên gỗ. Sửa: bóng đổ tràn dưới
  quân (`top: 54%`, `bottom: -24%`, đậm hơn, ở `translateZ(0.6px)`); đế `inset: 2% 2% -6% 2%`
  thò 6% dưới mặt quân với gradient gỗ tối dần (thành quân); mặt quân nâng `translateZ(14px)`
  và thêm bóng thường `0 2px 0` làm mép thành. Chế độ "Góc 2D" (`perspective: none`) vẫn giữ
  được khối vì toàn bộ hiệu ứng nằm trong mặt phẳng, không phụ thuộc `translateZ`.
- **Vòng soát bug T31 (5 lỗi thật, mỗi lỗi tái hiện bằng probe trước khi sửa):**
  - **Popup giới thiệu bài học không bẫy focus** (`qa/focus.mjs` đỏ): `SubjectScreen` mở
    `role="dialog"` nhưng Tab đi xuyên xuống bản đồ phía sau, không có nhãn cho trình đọc
    màn hình và không đóng được bằng Esc. Dùng `useFocusTrap`, `aria-label`, `tabIndex={-1}`,
    bấm nền để đóng, Esc để đóng; focus trả về đúng nút đã mở popup.
  - **Header tràn, nút "Ba Mẹ" ra ngoài màn hình** (`qa/mobile-home.mjs` + `qa/t01b-fixes.mjs`
    đỏ): nút đăng nhập Google chiếm chỗ nên ở 375/768/1024 px khu vực phụ huynh bị đẩy khỏi
    viewport (đo 10/42/90 px). Chữ nút auth chỉ hiện từ `xl`, giữ icon + `aria-label`.
  - **Thoại gấu lẫn chữ Hàn và câu vô nghĩa** (`Header.tsx`): một câu còn nguyên chữ Hàn,
    các câu "Bouncing!", "Hết lâu rưỡi!", lời chào "bé oir"; TTS đọc các từ đệm
    vô nghĩa. Viết lại 5 câu tiếng Việt trọn nghĩa, đọc đúng cả câu qua `sound.speak(...,
    'vi-VN')`, sửa lời chào theo buổi và câu khen chuỗi ngày học.
  - **Bàn cờ vua 3D trắng màn khi máy không có WebGL:** không có `ErrorBoundary` nên tạo
    `WebGLRenderer` thất bại là sập cả tab. `Chess3DCanvas` dò context trước, bắt exception
    khi tạo renderer và báo `onUnsupported`; `ChessGame` tự chuyển sang bàn 2D.
  - **Rò rỉ GPU khi đổi bàn cờ:** mỗi lần cập nhật thế cờ, mesh cũ bị bỏ khỏi scene nhưng
    `geometry` không `dispose()`; dọn kèm geometry của mọi mesh con.
- **Vòng soát bug T32 (khung trò chơi — lỗi nào cũng có bằng chứng trên build thật):**
  - **Chơi lại không xoá lượt cũ, bảng bị khoá mềm:** 13 trò reset trạng thái vòng theo
    `current.id`, nhưng builder sinh **id lặp lại ở cùng chỉ số** khi `nonce` đổi (đo trực tiếp
    trên `buildRounds` của `read_and_do` và `clock_builder`), nên sau khi bấm "Chơi lại" hoặc
    chọn lại màn, đồ vật đã chọn / đã đặt / số đã chạm vẫn treo nguyên và bé không chơi tiếp
    được. Đổi khoá reset sang `[current.id, stage.nonce]` (10 trò) và remount theo
    `key={`${current.id}-${stage.nonce}`}` (3 trò Nối Số Tô Màu, Bé Xếp Hình Mosaic, Đoán Bóng Hình).
  - **Chọn lại màn làm mất phần thưởng đã hứa:** `claimedKeys`, `receipt`, combo và dấu câu sai
    không được xoá trong `handleSelectTier`, nên lượt chơi mới ở cùng màn không còn được ghi
    sao/XP. Thêm `resetRewardState()` dùng chung cho đổi màn và "Chơi lại".
  - **Đồng hồ vẫn đếm khi bảng chơi bị che:** Đường Đua Thần Tốc trừ giờ của bé trong lúc lớp
    phủ "Chọn Màn & Độ Khó" đang mở. `GameModalWrapper` báo `onOverlayOpenChange`, game dừng
    tick khi bị che (bằng chứng: 15s → 15s sau 3 giây mở lớp phủ, rồi 15s → 12s sau khi đóng).
  - **Lời khen của gấu vang ở màn hình khác:** phản hồi đúng/sai hẹn giờ 250–900 ms bằng
    `setTimeout(() => sound.speak(...))` và không ai huỷ khi bé tắt trò chơi. Thêm
    `sound.speakLater()` + `sound.stopSpeaking()`, cắt tiếng khi `GameModalWrapper` và
    `KidBoxActivityPlayer` unmount; 12 chỗ gọi hẹn giờ chuyển sang `speakLater`.
  - **Nút chỉ có icon, không tên truy cập:** lớp phủ chọn màn, bảng điều khiển phụ huynh và bảng
    kết quả bài thi dùng nút ✕ không nhãn → bàn phím và máy đọc màn hình không đóng được.
    Thêm `aria-label` + `title="Đóng"`.
  - **Chữ Anh lẫn trong giao diện của bé (AGENTS §3):** "Đọc fluently" và bốn chuỗi
    `Level …` trong hộp chúc mừng lên cấp → viết lại tiếng Việt có dấu.
  - **Bắt Chữ Cái Bay đổi chữ đích lung tung:** hai effect cùng ghi `targetChar`, effect thứ hai
    đọc pool trước khi pool kịp nạp. Gộp thành một effect, chữ đầu tiên lấy thẳng pool vừa sinh.
  - **Nhận đủ mọi bước của câu thay vì theo thứ tự (Đọc Câu Làm Theo):** `isCorrectDrop` so khớp
    toàn bộ danh sách bước, nên câu nhiều bước cho phép làm bước sau trước. Siết lại thành
    "chỉ bước kế tiếp". Dữ liệu hiện tại mới có một bước mỗi vòng nên đây là phòng ngừa, chưa
    phải lỗi quan sát được trên màn hình.
  - **Hồi quy do chính đợt sửa:** đổi `aria-label` hộp chúc mừng lên cấp làm
    `dismissLevelUpCelebration()` khớp tuyệt đối trong `qa/lib.mjs` (và `qa/cotuong-puzzles.mjs`)
    bị lệch, kéo `qa/golden-path.mjs` đỏ vì hộp thoại chặn điều hướng. Probe chuyển sang khớp tiền tố.
  - **`qa/p41-font-visual.mjs` đỏ vì race trong chính probe:** sau `reload` probe chỉ *đếm* hộp mừng
    lên cấp một lần rồi bấm tiếp, nhưng hộp mount muộn hơn `[data-testid="nav-home"]` nên cú click
    bị chặn tới timeout 12 s (3 lần chạy đều đỏ — không phải lỗi may rủi của app). Probe giờ chờ hộp
    hiện (5 s) và đóng lặp lại tối đa 3 hộp; `tests/t31-bug-hunt-fixes.test.ts` đổi hợp đồng sang
    `dismissLevelUpCelebration(page)`.

- **Vòng soát bug T33 (hẹn giờ phản hồi sống lâu hơn lượt chơi):**
  - **Lời khen và gấu bị lượt trước xoá:** `GameModalWrapper` hẹn 1.500 ms (nhãn gấu) và
    2.500 ms (bóng lời khen) bằng `setTimeout` trần, nên bé trả lời liên tiếp trong vòng
    2,5 s thì hẹn giờ của lượt cũ vẫn chạy và làm phản hồi của lượt mới biến mất giữa
    chừng. Gom vào `showFeedback()` dùng hai ref, cắt khi lên lịch mới, khi đóng bảng chơi
    và khi sang màn/chơi lại.
  - **Lật Thẻ Trí Nhớ bị màn cũ "úp hộ":** id thẻ đánh số 1..2N nên **trùng nhau giữa mọi
    màn**; hẹn giờ 900 ms úp lại thẻ của Màn 1 còn sống khi bé đã nhảy sang Màn 4 sẽ úp
    luôn hai thẻ bé vừa lật, mất lượt (bằng chứng probe: lật hai thẻ ở màn mới mà bộ đếm
    "Đã thử" vẫn là 0). Hẹn giờ giờ nằm trong ref và bị cắt khi đổi màn/vòng.
  - **Luyện đọc có hai chuỗi highlight cùng chạy:** bấm "Đọc cả câu" lần hai là thêm một
    chuỗi `setTimeout` thứ hai (và hẹn giờ dò `onboundary` không nằm trong ref nào) ⇒ ô
    sáng nhảy lùi về đầu, bé không theo kịp chữ nào đang được đọc. Cả chuỗi lẫn hẹn giờ
    dò boundary giờ ở trong `karaokeTimersRef` và bị cắt khi bấm lại / sang đoạn / rời màn.
  - **Bấm "Thoát" mà đoạn văn vẫn được đọc:** `backToLobby()` chỉ đổi `phase` nên giọng
    đọc và chuỗi highlight vẫn chạy trên thang luyện đọc. Nay cắt `speechSynthesis` và
    chuỗi hẹn giờ ngay khi thoát (probe: `speakingDuringRead: true` → `speakingAfterExit: false`).
  - **Tiếng hò reo ăn mừng chết âm thầm:** mỗi lần bắn confetti mở một `new AudioContext()`
    (Chrome chỉ cho ~6 context mỗi tab) ⇒ sau vài lần ăn mừng lớn, lời reo không phát nữa
    dù hình vẫn bay. Một context dùng chung, tôn trọng công tắc tắt tiếng của Ba Mẹ.
  - **Nhạc nền thành tiếng rè:** `playBgMusicLoop` tự gọi lại bằng `requestAnimationFrame`
    (restart cùng một nốt G4 mỗi frame), sáu nốt của chuỗi đều `start(currentTime)` thay vì
    nối tiếp nhau, và `stopBgMusic` chỉ `suspend()` nên không giải phóng context. Chuỗi nốt
    giờ nối tiếp (`start` lệch theo trường độ), vòng lặp hẹn bằng `setTimeout` đúng lúc chuỗi
    kết thúc, và `close()` khi tắt.
  - **Bấm sai liên tiếp làm mất highlight và tụt sao (6 trò):** Phonics Pop, Đấu Trường Chính
    Tả, Chuyện Kể Toán Học, Thám Hiểm Giờ & Tiền, Xưởng Ghép Tiếng, Câu Cá Đại Dương tắt
    highlight bằng `setTimeout` trần, mà đáp án **sai thì không khoá bàn chơi** — lần bấm sau
    trong 900 ms bị hẹn giờ của lần trước xoá phản hồi, bé tưởng app chưa nhận nên bấm tiếp,
    mỗi lần bấm cộng thêm một lỗi và sao tụt 3→2→1 trên cùng một câu. Hook mới
    `src/hooks/useRoundFeedbackTimer.ts` bảo mỗi lượt chỉ có một hẹn giờ còn sống.
  - **Máy Gắp kéo vé và nổ confetti trên trang chủ:** vòng quay 2 s là chuỗi
    `requestAnimationFrame` không huỷ ⇒ bé bấm "Về Trang Chủ" giữa lúc quay vẫn bị trừ vé,
    tiếng "lên cấp" và confetti bắn ngay trên màn hình khác (rAF còn bị treo khi tab ẩn nên
    phần thưởng giật ra lúc bé quay lại). chu kỳ quay giờ lưu id frame và `cancelAnimationFrame`
    khi rời màn (probe: vé 5→5, 0 canvas).
  - **Cảnh báo "số liệu mẫu" chết sau ~1 s:** `ParentDashboardModal` cho hai thao tác dùng
    chung một trạng thái với hẹn giờ 3 s/6 s; bấm nạp dữ liệu thử nghiệm ngay sau khi đặt lại
    thì hẹn giờ 3 s của thao tác trước xoá cảnh báo sớm. Gom vào `showResetNotice()` một hẹn giờ.
  - **Điểm neo cho probe (không đổi câu chữ tiếng Việt):** thêm `data-testid="praise-toast"`,
    `memory-card`, `karaoke-read-all` và `answer-option` + `data-correct` cho `spelling_duel`.

### Tests
- **Đo lại cổng sau hai sửa review (Pha 5):** `npm run verify` **EXIT=0** — **88 file / 1272 test**,
  `Duration 21.55s`, main chunk `index-qnZ3EVTS.js = 204.2 kB → PASS (meets 450 kB goal)`;
  `node qa/run-one.mjs qa/game-pause.mjs` ⇒ `QA PASS — 12 step(s), 0 errors`. Log và 3 ảnh chụp lại
  tại `evidence/2026-11-02-KBT-ISSUE-43/`; số hiện trạng trong `docs/specs` + `docs/lifecycle`
  đổi theo (1270 → 1272, hash entry, `Duration 30.69s` → `21.55s`).
- **Đo lại cổng + 3 probe trên RC `3d06930` (Pha 6, sau merge `09511d3` của lane khác):** `npm run verify`
  **EXIT=0** — **89 file / 1277 test** (`tests/chess-engine-performance.test.ts` của lane kia thêm 5 test),
  `Duration 23.85s`, main chunk `index-B6au8G63.js = 204.2 kB → PASS (meets 450 kB goal)`; vì engine cờ vua
  bị viết lại toàn bộ nên chạy lại cả ba probe: `qa:smoke` `QA PASS — 28 step(s), 0 errors`, `qa:games`
  `catalogCount: 31` + 31/31 `mounted: true` + `overflowPx` max `0`, `game-pause` `QA PASS — 12 step(s), 0 errors`
  (`ok: true`, `failedAt: null`). Bằng chứng: `evidence/2026-11-02-KBT-ISSUE-43/verify-rc.txt` và ba file hậu tố `-rc`.
- **Sửa flake theo giờ trong `tests/fatigue-reset.test.ts` (đỏ ngay trên HEAD `main` lúc 23:36):** hai ca
  "không reset" lấy `Date.now()` làm mốc phiên, nên khi suite chạy trong **30 phút trước nửa đêm**,
  `now = mốc + FATIGUE_SESSION_GAP_MS - 1` rơi sang **ngày hôm sau** và quy tắc *đổi ngày* của
  `resetStaleFatigue` kích hoạt — `Tests 1 failed | 6 passed (7)` EXIT=1 **cả khi chạy cô lập**, code đúng vẫn đỏ.
  Cách sửa: neo `sessionStartTime` vào `NOON_ANCHOR` (giữa trưa, không phụ thuộc giờ chạy) và thêm một ca mới
  khoá đúng hành vi vượt nửa đêm (23:50 → 00:05: dưới ngưỡng gap nhưng **phải** reset vì đổi ngày).
  Không đổi `src/`. Tổng test **1277 → 1278**; `npm run verify` **EXIT=0** · `89 file` · `Duration 23.64s` ·
  entry **vẫn** `index-B6au8G63.js = 204.2 kB` (bundle không đọc `tests/`). Tái lập: `evidence/2026-11-02-KBT-ISSUE-43/repro-fatigue-midnight.txt`.
- **Siết hợp đồng nguồn theo VỊ TRÍ (review 4 lớp, finding #1 → phép ablation M5):** hai test
  "chặn guard" của `tests/t43-game-pause.test.ts` trước đây chỉ **đếm** (`toContain` một chuỗi,
  `guards.length >= 2`), nên lùi guard xuống **sau** phép ghi điểm — lỗi thật, điểm vẫn cộng khi
  đang tạm — vẫn xanh. Nay test hook đòi `const submitCorrect/submitWrong = … => {` rồi dòng đầu
  là `if (!isRunning) return;`, và test từng trò duyệt **từng** `setInterval(` để chắc `useEffect`
  chứa nó đã đọc `stage.isRunning`. Chứng minh bằng **M5**: đổi đúng kiểu lùi guard ⇒
  `Tests 1 failed | 29 passed (30)` EXIT=1, hoàn tác ⇒ `30 passed`
  (`evidence/2026-11-02-KBT-ISSUE-43/mutation-M5-guard-position.txt`).
- `tests/t43-game-pause.test.ts` — **30 test** cho nút Tạm dừng (KBT-ISSUE-43): bảng sự thật
  `isGameClockRunning` 7 ô (đang chơi / tạm / `overlayOpen` / `locked` / màn xong / tạm-đang-lúc-mở-lớp-phủ
  / tính thuần tuý không đọc đồng hồ), hợp đồng `GameModalWrapper` 5 (không còn state riêng,
  `aria-pressed`, testid lớp phủ ổn định, nhãn nút, đóng bảng giữa lúc tạm), `renderToString` 3
  (trò có đồng hồ ⇒ đúng một nút; đang tạm ⇒ nút thành "Tiếp tục" + lớp phủ; trò không đồng hồ ⇒
  0 nút), hợp đồng nguồn 4 trò × 2 + 1 đường chạm bóng = 9, hợp đồng hook 4 (guard
  `if (!isRunning) return;` có ở **cả hai** đường ghi điểm), catalog 2. **RED trước GREEN**:
  trên source chưa đổi, `npx vitest run tests/t43-game-pause.test.ts` ⇒
  `Tests 24 failed | 6 passed (30)` EXIT=1 (log `evidence/2026-11-02-KBT-ISSUE-43/red-before-fix.txt`).
  Trên `dist/`: `node qa/run-one.mjs qa/game-pause.mjs` ⇒ `QA PASS — 12 step(s), 0 errors`, `ok: true`,
  trong đó bước **C2 đối chứng** chứng minh cú chạm bị bỏ qua ở C1 là do trạng thái tạm chứ không
  phải bóng bấm không ăn. **Hai phép ablation M3/M4** (log cùng thư mục): bỏ `&& !s.pausedByUser`
  ở `useGameStage.ts:24` ⇒ `2 failed | 28 passed` EXIT=1; bỏ `if (!isRunning) return;` ở `:139`
  ⇒ `1 failed | 29 passed` EXIT=1; hoàn tác ⇒ `30 passed`. Tổng cổng sau đợt: `npm run verify`
  EXIT=0 với **88 file / 1270 test**, `Duration 30.69s`, main chunk `index-ChC_Vk9W.js` **204.2 kB**
  → PASS mục tiêu 450 kB.
- **`tests/decision-engine-storage.test.ts` dọn 3 khối `console.log` dump** (nợ D-4): test
  golden-path C in `knowledgeStates.math_addition_10`, danh sách hành động của `LearningOS` và
  `reasonCodes` của từng gợi ý ra output CI — dữ liệu suy luận của bé không có việc gì nằm trong
  log, và nó làm đỏ mọi lần chạy gate. Bỏ ba khối + bỏ luôn import `LearningOS` thành không dùng;
  assertion `toContain('SM2_DUE')` giữ nguyên, test vẫn xanh (`npm run verify` **EXIT=0**,
  **87 file / 1240 test**).
- `tests/t41c-idempotency.test.ts` — **25 test** cho "một thao tác, một lần tính", với mock
  `localStorage` có công tắc `writable` để mô phỏng hết quota (`setItem` ném): phát lại một câu
  trả lời không nhân đôi `totalQuestionsAnswered`/`skillMastery`/`daily.correctBySubject`/combo,
  không push `recentErrors` lần hai, hai id khác nhau vẫn tính 2; `finishSession` cùng
  `sessionId` chỉ gập một lần vào `stageStates` (khác id vẫn gập, và sống qua một lần đọc lại);
  ba lần đọc liên tiếp khi ghi hỏng vẫn giữ `streak` và khiên nguyên vẹn, khi hết hỏng thì tiến
  đúng một bậc; `recordTierReward` một lượt chơi chỉ trả một lần (`isDuplicate: true` ở cú thứ
  hai, `gamesPlayedCount` +1 đúng một, quest `play_game` nhích đúng 1), `bumpPlayNonce` rồi gửi
  lại vẫn được trả XP luyện tập, biên lai sống qua whitelist của sanitizer và không ghi khi lưu
  thất bại. Dải thưởng mới kiểm bằng `renderToString` trên `GameRewardStrip` (bỏ thẻ HTML để khớp
  đúng chữ bé nhìn thấy): biên lai thật in `+2 Sao +8 XP`, lượt chơi lại in XP và giấu dòng Sao 0,
  biên lai trùng và thưởng tắt đều rơi về dòng muted **không** có `+\d+ (Sao|XP)`, kèm ba hợp đồng
  nguồn (`if (!recorded) return;` đứng trước phép cộng, `saveChildProfile(...): boolean` + hoàn
  tác `streakBefore`, `writeJSON(...): boolean`, không còn `receipt?.stars ?? earnedStars`).
- **Hai phép ablation chứng minh test bắt được lỗi** (2026-11-02, log trong
  `evidence/2026-11-02-T41C/`): bỏ guard `appliedSessionIds` ở `readingEngine.ts:320` ⇒
  `1 failed | 24 skipped`, EXIT=1 (đỏ đúng TC-05); bỏ guard `rewardClaims` ở `storage.ts:2140` ⇒
  `2 failed | 23 passed`, EXIT=1 (đỏ đúng TC-11 + TC-12); hoàn tác cả hai ⇒ `25 passed`, EXIT=0.
- `tests/t41b-decision-clock.test.ts` — **12 test** cho đồng hồ, ghim `process.env.TZ =
  'Asia/Ho_Chi_Minh'` trong `beforeAll` (khôi tạo ở `afterAll`) để ngày địa phương có nghĩa:
  cửa sổ 14 ngày của `computeSubjectBalanceBoost` tính từ `now` của caller (30 ngày trước ⇒ không
  tăng cờ; mốc 13 vs 15 ngày biên giới cửa sổ), `decide` chạy lại hai lần cho kết quả từng byte
  giống nhau và chỉ gắn `SUBJECT_BALANCE` cho môn bị bỏ đói, `parentReport.today` của mốc
  00:30 sáng Việt Nam là ngày máy chứ không phải ngày UTC trước đó, "phút hôm nay" lấy được từ
  `analytics` khi cùng ngày địa phương **dù** UTC còn là hôm trước, phiên tối qua (lịch VN) không
  bị tính vào hôm nay, dòng "Hạn ôn tiếp theo:" in ngày địa phương, `plan.generatedFrom.generatedAt`
  đúng bằng `now` truyền vào và một phiếu ôn đến hạn biến mất khi lùi `now` 9 ngày, cùng ba hợp
  đồng nguồn chặn `Date.now() - 14 * DAY_MS`, `toISOString().slice(0, 10)`/`.split('T')[0]` và
  `generateDailyPlan` tự đọc giờ tường.
- `tests/decision-engine.test.ts` — thay test tautology của P39 (`expect(hasBalance === true ||
  hasBalance === false)`) bằng **2 test thật**: một môn bị bỏ đói phải nhận `SUBJECT_BALANCE` khi
  `now` rơi trong cửa sổ, và **không** nhận khi `now` tiến 30 ngày so với timestamp của bằng liệu. Test cũ luôn xanh vì mốc
  `now = 2026-10-06` đã nằm ngoài cửa sổ 14 ngày tính theo giờ tường của máy.
- `tests/t41a-parent-controls.test.ts` — **14 test** cho quyền kiểm soát của ba mẹ và luồng học:
  `completeLesson` trả `LessonAward` đúng tài nguyên thật (bài mới đủ XP/Sao/Vé, học lại chỉ +5 XP,
  không cấp lại Sao/Vé), **mọi** đường vào tài nguyên đều tôn trọng công tắc (bài học, rương chủ đề, rương
  ngày, gacha, shop, quà theo cấp, quest) trong khi tiến độ học vẫn ghi và bộ đếm quest sống qua lần đọc
  (`questsCompletedTotal` từng bị whitelist đưa về 0), `buyShopItem` từ chối
  theo lý do `rewards-off` / `level-locked` / `not-enough-stars`, whitelist `sanitizeMotivation` giữ
  `questsCompletedTotal`, và hợp đồng nguồn của UI (màn kết quả đọc `lastAward.*`, CTA trang Chủ gọi
  `onOpenLesson`, `ParentDashboardModal` nhận `initialTab`, shop không tự cộng `unlockedItems`, đồng hồ
  thời gian bỏ qua tick khi tab ẩn và không có deps khởi động lại).
  Cập nhật hợp đồng nguồn trong `tests/t27-lesson-engagement.test.ts` và `tests/lesson-completion.test.ts`
  sang `LessonAward`. Probe mới `qa/parent-controls.mjs` (bằng chứng nhìn thấy được trên `dist/`,
  viewport 1280×720): 7 bước 0 lỗi — CTA mở thẳng đích, "Vì sao gợi ý này?" vào tab Phân Tích
  (`parent-decision-report`), tắt thưởng thì Tủ Đồ không tiêu sao (999→999, 3→3 món), màn kết quả in
  `lesson-rewards-off` và không còn dòng `+N Sao/XP/Vé`, ví của bé không đổi sau một bài, bật lại thì
  cùng món mua được ngay (3→4 món). `npm run verify` **EXIT=0**: **85 file / 1202 test**, entry
  `index-NKVSigwn.js` **203.4 kB PASS**, boot graph **417.8 kB**.
- `tests/t40-parent-facing-ids.test.ts` — **15 test** cho nhãn phần thưởng/quyết định tiếng Việt,
  chuẩn hoá id kỹ năng đọc, migration `P43-v1` có gộp khoá va chạm, chữa tên kỹ năng từ catalogue,
  các producer phần thưởng thật của `StorageService` và hợp đồng không kéo `decisionEngine`/
  `data/curriculum` vào đồ thị khởi động. Bằng chứng đo lại sau T40: `npm run verify` **EXIT=0**,
  **84 file / 1188 test**, entry `index-D9UEuKwe.js` **202.3 kB**, boot graph **416.6 kB**.
- `tests/t39-first-load-graph.test.ts` — **9 test** cho lần tải đầu (đợt T39): entry đạt mục tiêu
  450 kB; `dist/index.html` **không** còn tham chiếu tĩnh `firebase-vendor`/`three-vendor`/
  `math-bank`/`english-bank`; tổng boot graph ≤ 500 kB; `src/services/firebase.ts` không còn một
  `import` runtime nào từ `firebase/*` (chỉ `import type`); hợp đồng nguồn của hint
  `kho_bau_cloud_session_hint` + `CloudSyncService.start()` + lời gọi trong `AccountModal`;
  **hành vi thật** của `loadFirebaseSdk()` với `vi.mock('firebase/app'|'firebase/auth'|'firebase/firestore')`:
  thiết bị mới → `sdkCalls.app === 0` (không chạm SDK), thiết bị có hint + `window` giả → app/auth/firestore
  khởi tạo **đúng một lần** và chỉ đăng ký **1** listener `kho_bau_storage_change`; `await
  import('src/data/curriculum')` làm `StorageService.getAnalytics().skillMastery` đi từ 0 key →
  >10 key có `skillName` và `attempts === 0` (chứng minh tự đăng ký catalogue hàn lại đường seed
  dashboard ba mẹ); hợp đồng `lazy`/`Suspense`/prefetch trong `App.tsx`.
- `tests/t38-webgl-fallback.test.ts` — **9 test** cho đường lùi WebGL: `probeWebGL` chạy được
  trong node nên test được bằng canvas giả (không WebGL; `webgl2` hỏng nhưng `webgl` được — phải
  là **cùng một canvas**; GPU SwiftShader/llvmpipe/Basic Render → `software`; luôn gọi
  `WEBGL_lose_context.loseContext()`; `getContext` ném → coi như không hỗ trợ), cộng hợp đồng nguồn
  khoá `try/catch` quanh `WebGLRenderer`, `webglcontextlost` + `forceContextLoss` và banner fallback.
  Hai assertion cũ trong `tests/t31-bug-hunt-fixes.test.ts` đổi sang `probeWebGL` (nội dung test
  T31 vẫn giữ ý "có đường lùi", chỉ chuỗi nguồn đã bị refactor).
- Đo lại sau đợt T38 (`npm run verify` **EXIT=0**): **82 file / 1164 test**, main chunk
  `index-DX4Q6eIH.js` **534.3 kB PASS**, 80 file `.ts` + 2 `.tsx`, 28 probe, 39 service,
  95 component `.tsx`, 31 trò chơi khớp 4 nơi đăng ký.
- `tests/t34-chess-real-set.test.ts` — **12 test** (thêm 1 cho đợt T37): test mới khoá tấm lưới
  `board_grid_lines` phải 8×8, nằm dưới mặt lát không quá 0.002 và `transparent`; test rãnh kẻ
  siết thêm điều kiện **khe ≥ 0.1 pitch** (trước chỉ buộc "hẹp hơn 1"); test đường kẻ 2D đổi hằng
  `LINE` sang `inset_0_0_0_3px_rgba(36,22,9,1)` và chặn ngược chuỗi `inset_0_0_0_2px` để nét mờ
  đợt cũ không quay lại.
- Đo lại sau đợt T37 (`npm run verify` **EXIT=0**): **81 file / 1155 test**, main chunk
  `index-BdiF4Xw9.js` **534.3 kB PASS**, `ChessScreen` 53.3 kB (từ 52.8), `three-vendor` 572.6 kB
  không đổi, 28 probe, 39 service, 95 component `.tsx`, 31 trò chơi khớp 4 nơi đăng ký.
- `tests/t36-viet-labels.test.ts` — 9 test khoá đợt Việt hoá: nhãn `GAMES_CATALOG` /
  huy hiệu / kỹ năng đấu trường / bảng kỹ năng tiếng Anh phải có dấu và không lẫn từ đã có
  từ Việt; 12 nhãn đảo + tiêu đề bài học của `ENGLISH_TOPICS` (trừ Unit sách Kid's Box) cũng
  phải là tiếng Việt; không còn chuỗi "English" trong nhãn hiển thị ở 13 file (đã bỏ comment);
  `ChessTutorial` đủ 6 quân và không còn tên cờ tướng.
- Hai test mới trong `tests/t34-chess-real-set.test.ts` cho đợt kẻ ô: (1) 64 mặt lát phải hẹp
  hơn pitch (còn khe) nhưng > 0.85 (không rời thành ô rời), tâm hai ô kề nhau cách đúng 1.0,
  và `board_inlay` phủ 8×8 nằm **dưới** mặt ô; (2) góc a1 tối – h1 sáng theo quy tắc bàn thật
  "trắng ở tay phải", mọi cặp ô kề nhau đổi tông, tương phản giữa hai tông > 0.2. Test hợp
  đồng 2D đổi sang cặp màu mới và bắt buộc có class kẻ đường ô ở `ChessGame` + `ChessMoveDemo`.
  Đã kiểm test góc không vô nghĩa: đảo `isDark` sang `(r + c) % 2 === 0` thì test đỏ đúng 1.
- `tests/t34-chess-real-set.test.ts` — 9 test cho bộ cờ vua gỗ: chiều cao quân tăng dần
  tốt < xe < mã < tượng < hậu (và hậu < 0.88 vua) đo bằng `Box3` thật, footprint mọi quân
  < 0.8 ô; không còn hex vàng (`0xfde047`/`0xf59e0b`/`0xd97706`/`0xb45309`) và không còn
  `goldMat` trong `pieceGeometries.ts` + `ChessPieceSvg.tsx`, mọi `metalness` bằng 0;
  phím bàn 3D in a–h thường; **guard hình học**: không mesh nào footprint ≥ 8×8 đơn vị
  nằm cao hơn mặt ô (chống lặp lại lỗi viền đặc che kín bàn cờ); hợp đồng bàn 2D
  (`border-[#3f2817]`, dải 8→1 và a→h, ô `#efd6ae`/`#9c6a40`, hết `ring-yellow-400`);
  tab Quân cờ và Nước đi mẫu không còn ký tự Unicode quân cờ, bắt buộc vẽ bằng
  `ChessPieceSvg`.
- `tests/t24-speech-math-operators.test.ts` — 18 test cho lớp phát âm phép tính: cộng/trừ/
  bằng và `= ?` → "bằng mấy", U+2212, chuỗi `12 + 3 + 2 = ?`, mệnh đề có kết quả
  (`"6 + 4 = 11."`), `= ...` → "bằng bao nhiêu", **chỗ chấm đứng trước** dấu phép
  (`... + 27 = 60`, `... - 3 = 7` — bằng chứng từ thiết bị thật), không bịa lời cho chỗ chấm
  so sánh (`8 + 2 ... 9`), giữ dãy trong `[...]` / en dash `1–3` / `add-sub-10` / `-5 độ`,
  giới hạn đã biết (`30-10` đọc thành "30 trừ 10"), idempotency, tiếng Anh dùng
  plus/minus/equals, và test nguồn buộc **cả hai** đường đọc đi qua `toSpeechText` trong khi
  `questionAudio.ts` không được chạm tới nó.
- `tests/pwa.test.ts` — test hợp đồng `sw.js`: same-origin match dùng `{ ignoreVary: true }`,
  navigation fallback `ignoreSearch + ignoreVary`, cross-origin vẫn tôn trọng Vary.
- `tests/t21-fun-games.test.ts` — 14 test: hình well-formed, số chấm tăng theo bậc,
  đánh số 1..N và trong ngưỡng 7..93, determinism + xáo theo seed, pool bóng hình không
  trùng, 4 phương án duy nhất chứa đáp án, cổng nghiêng/lật theo bậc, mosaic chữ nhật +
  màu khai báo + ≥5 ô tô + ≥2 màu, số round theo bậc, ánh xạ `null`, bảng chân lý
  `isMosaicComplete`, và parity đăng ký của 3 id mới.
- `tests/t23-mcp-servers.test.ts` — 18 test cho lớp MCP: đủ 5 server, mỗi file `.mjs`
  parse bằng Node trần, **không import package ngoài** (giữ cam kết zero-dependency),
  `readRegistration()` trả 4 danh sách khớp nhau, fixture `mcp/sample-export.json` mang
  cờ `isDemoData`, và `progress/` nằm trong `.gitignore`.
- `tests/t25-difficulty-ladder.test.ts` — 18 test khoá bậc thang độ khó cả catalog: trần số
  `TIER_MAX_VALUE = [10, 20, 30, 50, 70, 100]`, không nhớ/không mượn ở mọi bước, ≥20% phép hai
  bước từ bậc 5, giấy giờ chỉ từ bậc 4 và giảm dần, chuỗi bóng Hứng Số tất định + bóng nhiễu
  sát ngưỡng, `TIER_OPTION_COUNT` áp cho cả nhóm ảnh/nghe (shadow/safari/listen-pick),
  `RHYME_FRUIT_CAP_BY_TIER = [4, 6, 8, 10, 12, 12]` kèm bất biến "không có hai quả đúng",
  trần nhóm Puzzle (24 thẻ lật, mosaic 6×6, 18 chấm, bàn coding 8×8 + chương trình ≤18 lệnh),
  và test nguồn quét 100% file `src/data/games/*.ts` cấm `Math.random` / `Date.now`.
- `qa/tier6-ladder-evidence.mjs` — probe bằng chứng nhìn thấy được: mở 9 trò Ngôn ngữ/Puzzle ở
  Màn 6 trên viewport 390×844, đếm số phương án/thẻ/ô/chấm **thực sự render trong DOM**,
  bắt tràn ngang (`overflowPx > 2`), phương án nằm ngoài màn hình mà vùng chơi không cuộn,
  ô bấm nhỏ hơn 44px, rồi chụp 9 ảnh màn hình. `node qa/run-one.mjs qa/tier6-ladder-evidence.mjs`
  → `QA PASS — 0 step(s), 0 errors`.
- Cập nhật test cũ theo bậc thang mới: `t16-math-games`, `t17b-coding` (`TIERS` 4→8,
  `MAX_STEPS` 8→18, bậc 6 dài hơn bậc 4), `t21-fun-games` (bậc thang bóng hình, kích thước
  mosaic, trần số chấm + khoảng cách chấm ≥12 đơn vị), `games-all` và `games-content`
  (pool xoay theo bậc, 12 con vật đều xuất hiện, pool vần ≥1.5× số câu).
- **Đo lại sau T25**: `npm run verify` **EXIT=0** — typecheck sạch, **71 file / 1034 test**
  passed, build 1.92 s, main chunk `index-B2ct57KD.js` **512 kB PASS** (trần 600).
- **Đo lại sau merge `fd3e7da` + sửa thế cờ tướng**: `npm run verify` **EXIT=0** — typecheck
  sạch, **71 file / 1035 test** passed, main chunk `index-Gnw1Zwiz.js` **531.2 kB PASS**
  (trần 600). Bằng chứng nhìn thấy được chạy trên bản merge: `node qa/run-one.mjs qa/games.mjs`
  và `node qa/run-one.mjs qa/tier6-ladder-evidence.mjs` đều `QA PASS — 0 step(s), 0 errors`,
  `npm run qa:smoke` `QA PASS — 28 step(s), 0 errors`.
- `tests/t26-cotuong-puzzles.test.ts` — khoá dữ liệu 6 thế cờ hợp luật, mỗi thế có lời giải
  chiếu bí đúng 1 nước và engine chấm được, cùng lớp lưu tiến độ thế đã giải.
- `tests/t27-lesson-engagement.test.ts` — `formatElapsed`, xếp hạng sao theo tỉ lệ đúng,
  nhãn tiếng Việt, cùng các hợp đồng nguồn: combo + âm thanh + confetti, đồng hồ dừng ở màn
  kết quả, danh sách câu sai không lặp, lượt ôn chỉ chứa câu sai và reset combo.
- **Đo lại sau T26/T27**: `npm run verify` **EXIT=0** — typecheck sạch, **73 file / 1052 test**
  passed, main chunk `index-B0-nRwl6.js` **533.6 kB PASS** (trần 600; con số script in nhãn
  `kB` nhưng chia 1024). Probe mới `qa/cotuong-puzzles.mjs` (5 step) và
  `qa/lesson-engagement.mjs` (3 step) đều `QA PASS`, 0 lỗi.
- **Đo lại sau vòng sửa bug T26/T27**: `npm run verify` **EXIT=0** — typecheck sạch,
  **73 file / 1058 test** passed (+6 test hồi quy cho 5 bug), main chunk
  `index-Z0QUlAuF.js` **533.8 kB PASS**. Probe mở rộng: `qa/cotuong-puzzles.mjs` (7 step:
  chặn thao tác khi bàn cờ tạm, không thưởng XP khi giải lại) và `qa/lesson-engagement.mjs`
  (5 step: khối thưởng lượt ôn "+5 XP", đổi độ khó ở màn kết quả mở lượt mới) đều
  `QA PASS — 0 errors`; `lesson-completion.test.ts` chuyển sang kiểm `startRun()`.
- **Đo lại sau audit UI T28**: `npm run verify` **EXIT=0** — typecheck sạch,
  **74 file / 1062 test** passed (+4 test: 1 lưới bàn cờ ở `t26`, 3 test chống hồi quy UI ở
  `t28`), main chunk
  `index-PGWPiTgJ.js` **533.8 kB PASS** (nhãn script là `kB` nhưng chia 1024). Probe:
  `qa/cotuong-puzzles.mjs` (8 step, thêm `gridAlignment` + ảnh bàn cờ đầy đủ) và probe mới
  `qa/gacha-machine.mjs` (4 step: 10 sticker trải 68% bề ngang kính, `claw-drop` +
  `gacha-jumble` chạy khi gắp, vé 5 → 4, lịch sử hiện sticker) đều `QA PASS`;
  `qa/golden-path.mjs` (28 step), `qa/games.mjs` (31/31) và `qa/lesson-engagement.mjs`
  (5 step) cũng `QA PASS`.
- `tests/t29-lesson-smooth.test.ts` — 6 test khoá cấu trúc màn học: vùng cuộn đóng **trước**
  thanh hành động (đếm độ sâu `<div>`), thanh là sibling `shrink-0` có viền trên, đúng 2 chỗ
  reset `scrollTop = 0`, có `feedbackRef.scrollIntoView({ block: 'nearest' })`, slot combo
  `h-6` đứng trước banner và banner đứng trước nút gửi, không còn banner ngoài luồng cũ, và
  `LessonClock` là component riêng với chữ ký `{ startedAt, paused }`.
- `qa/lesson-smooth.mjs` — probe mới (8 step) đo trên trình duyệt 390×844: thanh không nằm
  trong scroller, cuộn hết đề vẫn thấy thanh, tạo được chuỗi ≥2 câu đúng, `comboShift` /
  `barShift` ≤ 2 px, `scrollTop ≤ 4` sau mỗi "Câu tiếp theo", phản hồi hiện trong tầm nhìn,
  0 tràn ngang; chụp 4 ảnh (`01-question-open` … `04-next-question`).
- **Đo lại sau T29**: `npm run verify` **EXIT=0** — typecheck sạch, **75 file / 1068 test**
  passed (+6 test `t29`), main chunk `index-AUAPmuH2.js` **533.8 kB PASS** (nhãn script là
  `kB` nhưng chia 1024). Probe: `qa/lesson-smooth.mjs` **8 step** và
  `qa/lesson-engagement.mjs` (5 step, đồng hồ chạy 0:07 rồi đứng yên, lượt ôn 9/9 → 3 sao),
  `qa/golden-path.mjs` (28 step) đều `QA PASS — 0 errors`.
- `tests/t30-cotuong-piece-depth.test.ts` — 7 test khoá khối CSS của quân: bóng đổ tràn dưới quân
  (`top: 54%` / `bottom: -24%`, không còn `inset: 16% 8% -2% 8%`), đế có `inset` đáy âm (lộ thành
  quân) và `translateZ` thấp hơn mặt quân, mặt quân có bóng thường `0 2px 0` + viền `128, 86, 36`,
  trạng thái chọn nâng cao hơn 14px và giữ viền vàng, thứ tự render shadow → base → face, cùng
  hợp đồng của probe (đo pixel bằng `zlib.inflateSync`, có đo cả "Góc 2D").
- `qa/cotuong-depth.mjs` — probe mới (3 step): đo thứ tự vẽ 3 lớp quân so với lưới
  (`elementsFromPoint`, tạm bật `pointer-events` cho quân vì mặc định là `none`), đo đế thò dưới
  mặt quân (`rimBelowFacePx`), và **giải mã PNG** ảnh chụp để so độ sáng nền bàn ngay dưới quân
  với phía trên (`contactShadowDelta`). `node qa/run-one.mjs qa/cotuong-depth.mjs` →
  `QA PASS — 3 step(s), 0 errors` (`rimBelowFacePx: 3`, `contactShadowDelta: 11` ở 3D / `12` ở 2D,
  `faceLuma: 191`).
- **Đo lại sau T30**: `npm run verify` **EXIT=0** — typecheck sạch, **76 file / 1075 test** passed
  (+7 test `t30`), main chunk `index-BJHmn7nJ.js` **533.9 kB PASS**. `qa/cotuong-puzzles.mjs`
  (8 step) vẫn `QA PASS — 0 errors`.
- `tests/t31-bug-hunt-fixes.test.ts` — 16 test khoá lại các lỗi T31: `SubjectScreen` có
  `useFocusTrap`/`aria-label`/Esc/bấm nền; `AuthButton` không còn nhãn hiện ở `min-[420px]`/
  `min-[480px]` mà chỉ từ `xl`; thoại gấu không có Hangul, không còn "Bouncing!" /
  "Hết lâu rưỡi!", TTS đi qua `sound.speak(phrase` và không tự tạo
  `SpeechSynthesisUtterance` với từ đệm; `Chess3DCanvas` dò WebGL, bọc `try/catch` khi tạo
  renderer, gọi `onUnsupported` và `child.geometry.dispose()`; cùng hợp đồng của 7 probe vừa
  sửa (focus/mobile/golden-path/t01b/offline/p41-curriculum/p41-font).
- **7 probe đo sai được sửa để QA nói đúng sự thật:** `qa/focus.mjs` so `data-testid` thay vì
  nhãn nút cũ ("Vào học"/"Học lại"); `qa/mobile.mjs` bỏ chuỗi đồng hồ đang chạy khỏi đề khi so
  sánh; `qa/golden-path.mjs` chờ card `decision-engine-card` (chunk nạp lười); `qa/t01b-fixes.mjs`
  nhận nút CTA nhà "Học tiếp|Bắt đầu:"; `qa/offline-pwa.mjs` poll trạng thái service worker từ
  Node thay vì `waitForFunction` với predicate async (Playwright trả về ngay); 
  `qa/p41-curriculum-quality.mjs` chấp nhận màn kết quả còn mở sau câu cuối (T20A/B-03);
  `qa/p41-font-visual.mjs` đóng hộp mừng lên level trước khi bấm tiếp.
- **Đo lại sau T31**: `npm run verify` **EXIT=0** — typecheck sạch, **77 file / 1091 test** passed
  (+16 test `t31`), main chunk `index-hJ50GmCf.js` **533.5 kB PASS**. 24 probe trên đúng dist đó
  đều `QA PASS — 0 errors`: `games` 31/31 mount + thưởng `0→0→1→2`, `mobile-home`
  `headerOffscreen: 0` ở 8 bề rộng, `focus` `focusRestoredToTrigger: true`, `offline-pwa` 10 step
  (`active: true, controller: true`), `p41-font-visual` 13 step, `p41-curriculum-quality` 5 step,
  `lesson-types` 137 step, `golden-path` 28 step, `decision-engine` 12 step, `audio` 9 step,
  `question-types` 9 step, `lesson-smooth` 8 step, `cotuong-puzzles` 8 step, `lesson-engagement` /
  `gacha-machine` / `cotuong-depth` / `responsive-a11y` / `mobile` / `mobile-golden` /
  `kidbox-focus` / `decision-engine-a11y` / `t01-hotfix` / `t01b-fixes` / `tier6-ladder-evidence`.
- `tests/t33-feedback-timers.test.ts` — 23 test cho vòng soát bug T33: deck mọi màn của
  Lật Thẻ trùng id 1..6 (nguyên nhân khiến hẹn giờ cũ úp nhầm thẻ màn mới); hẹn giờ úp thẻ
  phải nằm trong ref và bị cắt khi sang màn/chơi lại/unmount; `GameModalWrapper` không còn
  `setTimeout` trần cho `mascotReaction`/`praiseText`; chuỗi karaoke chỉ một nguồn sáng, có
  boundary thì chuỗi tự chạy bị tắt, rời màn thì cắt tiếng; `backToLobby` cắt cả hai; sáu trò
  phải dùng `useRoundFeedbackTimer` (đo bằng fake `window`/fake timer: mười lần ăn mừng lớn
  chỉ một `AudioContext`, sáu nốt nhạc nền sáu thời điểm khác nhau, tắt nhạc là `close()`).
- `tests/t32-game-stage-reset.test.ts` — 20 test cho vòng soát bug T32: 13 trò phải reset theo
  `stage.nonce` (quét nguồn, chặn `}, [current.id]);` và `key={current.id}` còn sót), đo id va
    chạm thật của builder `read_and_do` / `clock_builder`, hợp đồng `resetRewardState` khi đổi
  màn, khoá `pickerOpen` của đồng hồ đua, thứ tự bước của Đọc Câu Làm Theo, một effect cấp đích
  của Bắt Chữ Cái Bay, `sound.speakLater` / `stopSpeaking` bằng fake timer, không còn
  `setTimeout` gọi thẳng `sound.speak`, `aria-label` cho nút icon-only và chữ tiếng Việt trong
  `HomeScreen` / `LevelUpCelebrationModal`.
- `qa/t32-game-replay-evidence.mjs` — probe thứ 27: bằng chứng trên build thật cho ba lỗi khung
  trò chơi (chơi lại xoá lượt dở, đồng hồ đứng khi bị lớp phủ che rồi chạy tiếp, ✕ đóng lớp phủ
  chọn màn) + 4 ảnh chụp, chạy với `?qa` để DOM lộ bước hợp lệ.
- **Sửa probe do đổi nhãn:** `dismissLevelUpCelebration()` (`qa/lib.mjs`) và
  `qa/cotuong-puzzles.mjs` khớp `aria-label` tuyệt đối của hộp chúc mừng lên cấp, đổi câu chữ
  tiếng Việt là cả `qa/golden-path.mjs` đỏ; chuyển sang khớp tiền tố `aria-label^="Chúc mừng"`.
- **Đo lại sau T32**: `npm run verify` **EXIT=0** — typecheck sạch, **78 file / 1111 test** passed
  (+20 test `t32`), main chunk `index-BNbdkwuO.js` **533.8 kB PASS** (trần 600). Quét lại **toàn bộ
  27 probe** trên đúng dist đó: 25 probe chạy qua `qa/run-one.mjs` in `QA PASS — 0 errors`
  (`t32-game-replay-evidence` 5 step, `golden-path` 28, `lesson-types` 137, `p41-font-visual` 13,
  `p41-curriculum-quality` 5, `question-types` 9, `offline-pwa` 10, `audio` 9, `decision-engine` 12,
  `games` 31/31 mount + thưởng `0→0→1→2`, `cotuong-puzzles` 8, `cotuong-depth` 3, `lesson-smooth` 8,
  `lesson-engagement` 5, `gacha-machine` 4, `tier6-ladder-evidence`, `focus`, `mobile`, `mobile-home`,
  `mobile-golden`, `responsive-a11y`, `kidbox-focus`, `decision-engine-a11y`, `t01-hotfix`,
  `t01b-fixes`), `qa/t02-smoke.mjs` chạy trực tiếp `ERRORS: []` exit 0; **riêng
  `qa/p38-browser-probe.cjs` exit 1 vì `require('puppeteer')` mà repo không có dependency đó**
  (không tự thêm theo `AGENTS.md` §1.4) — xem ghi chú nợ ở `docs/plan/TEST_PLAN.md` §6.
- **Đo lại sau T33**: `npm run verify` **EXIT=0** — typecheck sạch, **79 file / 1134 test** passed
  (+23 test `t33`), main chunk `index-RJBSh_JH.js` **534 kB PASS** (trần 600; `check:budget` chia
  1024 nên bản chất là 534 KiB, log `vite build` in 546.84 kB thập phân). Quét lại **toàn bộ
  28 probe** trên đúng dist đó (build 16:14): 26 probe chạy qua `qa/run-one.mjs` in
  `QA PASS — 0 errors` (`t33-feedback-timers` 6 step, `t32-game-replay-evidence` 5, `lesson-types`
  137, `golden-path` 28, `p41-font-visual` 13, `decision-engine` 12, `offline-pwa` 10, `audio` 9,
  `question-types` 9, `cotuong-puzzles` 8, `lesson-smooth` 8, `lesson-engagement` 5,
  `p41-curriculum-quality` 5, `gacha-machine` 4, `cotuong-depth` 3, `games` (`catalogCount` 31),
  `tier6-ladder-evidence`, `focus`, `mobile`, `mobile-home`, `mobile-golden`, `responsive-a11y`,
  `kidbox-focus`, `decision-engine-a11y`, `t01-hotfix`, `t01b-fixes`), `qa/t02-smoke.mjs` chạy trực
  tiếp `play buttons: 31` / `dialog buttons: 8` / `ERRORS: []` exit 0; **riêng
  `qa/p38-browser-probe.cjs` vẫn exit 1 vì `require('puppeteer')` mà repo không có dependency đó**
  (không tự thêm theo `AGENTS.md` §1.4).

## [1.0.0] - baseline

- Toàn bộ ứng dụng trước đợt SDLC này: lộ trình Tiếng Việt / Toán / Tiếng Anh / Em &
  Cuộc sống, 28 trò chơi giáo dục, Games Hub + registry lazy, luyện đọc karaoke,
  Competition Engine, Learning OS + Decision Engine, Praise Engine, sticker/shop/quest,
  PWA offline, Parent Mode, đồng bộ Google account.
- 971 unit test (67 file), cổng bundle main chunk ≤ 600 kB, audit tăng dần bằng
  `scripts/audit-snapshot.mjs`.

[Unreleased]: https://github.com/ducmanh2802/kho-bau-tri-thuc/commits/main
[1.1.0]: https://github.com/ducmanh2802/kho-bau-tri-thuc/releases/tag/v1.1.0
[1.0.0]: https://github.com/ducmanh2802/kho-bau-tri-thuc
