# 07 — Release & Operations
## Phát hành & vận hành · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Trạng thái pha:** **`NotRun`** — `git tag` trả rỗng tính tới ngày chốt (`git tag | wc -l` = 0, đo 2026-11-02).
Không có release nào đã xảy ra. Tài liệu này mô tả quy trình *đã sẵn sàng* và những gì còn thiếu,
không kể chuyện đã phát hành.

---

## 1. Release and Operate Loop — 6 trạm

| # | Trạm | Việc | Đã có | Còn thiếu |
|---|---|---|---|---|
| 1 | **RC commit** | chốt commit sẽ phát hành, tag `vX.Y.Z` trên **đúng** commit đã qua V&V gate | workflow `04-release.yml` trigger `push: tags v*.*.*` + `workflow_dispatch` | chưa có commit nào được tag |
| 2 | **Verdict** | mọi AC của **hai** lát cắt ở `TEST_CASES.md` §2 (6 US × 3 nhánh) + toàn bộ exit criteria `TEST_PLAN.md` §10 | 42/42 TC Pass (`TEST_CASES.md` §3) | phần lớn FR chưa xuống tầng TC — **không ghi con số "còn 83 FR"**: tổng FR khai báo (88) lệch số dòng FR thật trong `SRS.md` (89), xem `RTM.md` §9 rule 5 |
| 3 | **Go/No-Go** | người chịu trách nhiệm ký; AI **không** ký | mục §3 dưới đây | chưa có phiên ký nào |
| 4 | **Sẵn sàng vận hành** | expand/contract migration, restore drill, SLI/SLO, incident | ADR-02 + `MIGRATIONS` chain (`storage.ts:111`) | §5, §6 |
| 5 | **Phát hành** | build → zip `dist/` → GitHub Release, note lấy từ `CHANGELOG.md` | workflow 04 làm đủ 3 bước | chạy lần đầu |
| 6 | **Sau phát hành** | smoke, theo dõi SLI, kế hoạch rollback | `qa/golden-path.mjs` dùng được làm smoke | không có telemetry ⇒ chỉ theo dõi được ở máy người dùng |

## 2. Mọi bằng chứng gắn một commit

Quy tắc: một artifact chỉ chứng nhận cho commit nó được tạo ra. Đợt gần nhất:

| Commit | Ngày | Bằng chứng | Verdict |
|---|---|---|---|
| `d54f341` | 2026-11-02 | `evidence/2026-11-02-T41C/` — verify log, 3 probe JSON, 2 ảnh, 3 log ablation/baseline | **Pass** cho V&V · **NotRun** cho Release |
| `675be7e`+`af2d56a`+`494cce2` (nhánh `feature/43-game-pause`, chưa merge) | 2026-11-02 | `evidence/2026-11-02-KBT-ISSUE-43/` — `red-before-fix.txt` (24 lời khai FAIL), `verify.txt` (EXIT=0, 88 file / 1270 test), `probe-game-pause.json` (12 bước, 0 lỗi), 3 ảnh, 2 log ablation M3/M4 | **Pass** cho V&V · **NotRun** cho Release (CI chưa chạy — repo chưa có tag, `workflow_dispatch` chưa bật; xem §4) |

Không được lấy log của `7c60066` để nói `d54f341` an toàn.

## 3. Go / No-Go

| Vai | Người | Quyền |
|---|---|---|
| Ký Go/No-Go | người giữ repo (`ducmanh2802`) | duy nhất |
| Chuẩn bị hồ sơ | agent | không ký, không tự tag |
| Chặn Go | bất kỳ ai thấy P0/P1 mở | quyền No-Go là kết quả tốt, không phải sự cố |

**Điều kiện No-Go ghi trước** (không biện luận sau): `npm run verify` đỏ · `qa/golden-path.mjs` có
error hoặc `failedAt` khác rỗng · còn ISSUE P0/P1 mở · chưa có người lớn đọc to ≥1 bài/môn ·
`CHANGELOG.md` `[Unreleased]` chưa chuyển thành mục version · có dữ liệu trẻ trong working tree.

**Biên mẫu (chưa ký lần nào):**

```
Phiên bản đề xuất : v1.1.0
Commit RC         : <sha> — phải là HEAD của main sau khi verify xanh
Người ký          : ................  Ngày: ......
Kết luận          : GO / NO-GO / GO-CÓ-ĐIỀU-KIỆN
Căn cứ            : <dán output verify + golden-path + số TC NotRun còn lại>
```

## 4. Expand / Contract — đã có, đo được

Không có DB server, nhưng có **schema `localStorage`** — đường hỏng thật là người dùng mở bản mới
trên hồ sơ của bản cũ. Mô hình đang dùng (`storage.ts:105` `STORAGE_SCHEMA_VERSION = 'P43-v1'`):

| Bước | Cơ chế | Tính hoàn tác |
|---|---|---|
| Expand | thêm field mới với mặc định do sanitizer dựng; **không** đổi nghĩa field cũ | có — field lạ bị bỏ, field cũ giữ |
| Migrate | `MIGRATIONS` chain theo thứ tự, mỗi hàm *pure, defensive, idempotent* (`storage.ts:112`) | chạy lại không hỏng |
| Contract | chỉ bỏ field sau khi mọi bản đang chạy đều không đọc nó | **chưa có lịch contract** — nợ, xem `CHECKLIST.md` C-06 |

Test: `tests/t14c-storage.test.ts`, `tests/t41c-idempotency.test.ts:299` (field mới phải sống qua
một lần đọc lại — tức là phải có trong whitelist).

## 5. Restore drill — bản thay thế cho app không server

Khóa học đòi "restore drill kiểm cả quyền A và B". Ở đây tương đương là **khôi phục tiến độ của bé
từ file export**, và **quyền ba mẹ chặn đường ghi**:

| Kịch bản | Cách diễn | Đã chạy chưa |
|---|---|---|
| R-1 mất hồ sơ | xuất JSON (`FR-P04`) ⇒ xoá `localStorage` ⇒ nhập lại (`FR-P05`) | **Chưa chạy trên build thật** — mới có test mock: `tests/parent-and-demo.test.ts` (`NotRun`) |
| R-2 file rác | import file không đúng cấu trúc ⇒ bị từ chối, store hiện có không đổi | Có test trong `tests/parent-and-demo.test.ts` |
| R-3 quota đầy | `setItem` ném ⇒ không có streak giả, không tiêu khiên, không ghi biên lai non | Có — TC-08/09/10/15 + ablation M1/M2 |
| R-4 quyền ba mẹ | tắt quỹ thưởng ⇒ build thật không cộng Sao | Có — `qa/parent-controls.mjs`, TC-27 |
| R-5 quyền "tài khoản B" | — | **Không tồn tại** ở kiến trúc hiện hành (một hồ sơ, không có server) ⇒ chỉ kiểm được sau T41D |

Điều kiện để R-1 chuyển `Pass`: chạy tay trên `npm run build && npm run preview`, lưu ảnh trước/sau,
thả vào `evidence/<ngày>-restore-drill/`.

## 6. SLI / SLO — ngưỡng lấy từ NFR

App local-first **không có** server để đo latency/error rate (ADR-01 + `SAFETY_PRIVACY.md`).
Nên SLI chỉ đo được ở hai nơi: lúc build và lúc chạy probe.

| SLI | Định nghĩa | Ngưỡng (nguồn NFR) | Đo ở đâu | Trạng thái 2026-11-02 |
|---|---|---|---|---|
| Khối lượng tải tiên phong | tổng byte asset mà `dist/index.html` tham chiếu tĩnh | ≤ 600 kB cứng, ≤ 450 kB mục tiêu (NFR-P01) | `npm run check:budget` | 418.5 kB — **đạt** |
| Đường vào học được | `qa/golden-path.mjs` số console error | = 0 (BRD §8) | workflow 03 | 0 lỗi / 28 bước — **đạt** |
| Hồi quy hành vi | `npm run verify` | EXIT=0 (AGENTS.md §1.1) | mỗi push | 1240/1240 — **đạt** |
| Thời gian một phiên học | phút bé hoạt động thật | 15–20 phút (NFR-M01) | **không đo được** — không telemetry | `NotRun` |
| Tiến độ không sai | số lượt ghi trùng mỗi ngày | = 0 (NFR-R04) | chỉ đo được ở máy bé ⇒ test + probe thay thế | đạt ở máy chủ dev |

Guardrail khi tối ưu: giảm kB **không** được làm đỏ `qa/golden-path.mjs` hay `qa/focus.mjs`.

## 7. Incident — diễn tập, không chờ cháy

| Vai trong một sự cố | Ai | Việc |
|---|---|---|
| Người chỉ huy | người giữ repo | quyết rollback/patch, giữ quyền No-Go |
| Người chẩn đoán | agent | chạy lại lệnh, dán `errors[]` + `failedAt`, không suy đoán |
| Người liên lạc | người giữ repo | nói với phụ huynh qua kênh ngoài repo |
| Người ghi postmortem | agent viết, người duyệt | blameless, action item có owner + hạn |

Kịch bản đã diễn tập một phần: **hồi quy offline do `Vary: Origin`** (task #19 trong lịch sử repo) —
phát hiện bằng probe, sửa bằng precache manifest, đóng bằng test. Timeline/postmortem đầy đủ:
`docs/AUDIT_REPORT.md` (nhật sử nối theo phiên).

## 8. Runbook — 4 thành phần, đã chạy lại trên môi trường sạch

**RB-1 · Cổng đỏ sau khi merge**
1. *Trigger:* `npm run verify` EXIT≠0.
2. *Chẩn đoán:* chạy từng phần — `npm run typecheck` → `npm run test:ci` → `npm run build` → `npm run check:budget`; nếu đỏ ở test, chạy cô lập `npx vitest run tests/<file>` để phân biệt test O(n²) vượt timeout trong full suite với lỗi thật (`TEST_PLAN.md` §5).
3. *Hành động:* sửa hoặc revert; **không** tắt gate, **không** `--no-verify`.
4. *Xác minh:* `npm run verify` xanh nguyên văn + dán output; nếu đổi UI thì thêm ảnh vào `evidence/`.

**RB-2 · Bé mất tiến độ sau khi mở bản mới**
1. *Trigger:* phụ huynh báo mất sao/mất chuỗi.
2. *Chẩn đoán:* mở DevTools → Application → `kho_bau_child_profile`, so `schemaVersion` với `STORAGE_SCHEMA_VERSION`.
3. *Hành động:* import file export gần nhất (FR-P05); nếu file import bị từ chối, kiểm tra validator trong `tests/parent-and-demo.test.ts`.
4. *Xác minh:* screenshot dashboard trước/sau, ghi vào `evidence/`.

**RB-3 · Probe đỏ mà code không đổi**
1. *Trigger:* workflow 03 đỏ, local xanh.
2. *Chẩn đoán:* chạy lại **một** lần (timing); vẫn đỏ ⇒ dán `errors[]` + `failedAt`.
3. *Hành động:* nếu probe khớp chuỗi UI đã đổi tên ⇒ sửa probe theo `qa/games.mjs`/testid, không sửa UI để chiều probe.
4. *Xác minh:* `node qa/run-one.mjs qa/<probe>.mjs` exit 0.

**RB-4 · Cần rollback**
1. *Trigger:* No-Go sau khi tag, hoặc lỗi P0 trên bản đã phát hành.
2. *Chẩn đoán:* xác định commit/tag trước đó còn tốt (`git log --oneline`, tag gần nhất).
3. *Hành động:* revert commit hoặc publish lại tag cũ — **không** force-push `main`.
4. *Xác minh:* `npm run verify` trên commit rollback + `qa/golden-path.mjs` 0 lỗi.

## 9. Release note — nhãn AI bắt buộc

Mỗi mục trong `CHANGELOG.md` khi chuyển sang một version phải mang nhãn nguồn, vì người đọc là phụ
huynh chứ không phải reviewer:

```
## [1.1.0] - <ngày>
### Fixed
- storage: chặn ghi trùng cho bằng liệu, buổi đọc, bước ngày và biên lai thưởng (T41C)
  [AI nháp · người duyệt · verify EXIT=0 @ d54f341]
```

Nhãn dùng được: `[AI làm, dev kiểm]` · `[AI nháp · người duyệt]` · `[người viết]`.
Không có nhãn `[AI tự làm]` cho thay đổi khó hoàn tác — theo `02_AI_USAGE_CHARTER.md` §1.
