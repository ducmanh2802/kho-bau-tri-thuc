# Runbook vận hành — Kho Báu Tri Thức — Lớp 1
## Pha 10 (Operations) · guide §A5 `docs/10-operations/`

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày:** 2026-11-03 · **Trạng thái:** bản mô tả thủ tục,
**chưa chạy lần nào trên máy thật** — điều kiện đóng cổng của file này ghi ở §6.

> **Ba sự thật định hình pha 10 của sản phẩm này** (không phải sản phẩm web thông thường):
> 1. **Không có server riêng, không có telemetry** (`ADR-01`) ⇒ không có dashboard, không có alert,
>    không có SLI phía server. Guide §A5 liệt kê "dashboards/alerts inventory" ⇒ **`K/A`** với lý do này.
> 2. **Phát hành = file tĩnh.** Workflow `4. Release` build `dist/`, gói
>    `kho-bau-tri-thuc-<version>.zip` (`(cd dist && zip -qr …)` ở `.github/workflows/04-release.yml:63`)
>    rồi tạo GitHub Release. Không có bước deploy nào — người dùng tự phục vụ zip
>    (xem [`../GOOGLE_AI_STUDIO_RUNBOOK.md`](../GOOGLE_AI_STUDIO_RUNBOOK.md)).
> 3. **Người vận hành cũng là người viết code.** Bảng vai trò ở
>    [`../01-intake/stakeholders.md`](../01-intake/stakeholders.md) — `STK-004` vừa là release owner vừa
>    là approver.

---

## 1. Phát hành một bản (rollout)

| Bước | Lệnh / thao tác | Kiểm gì sau bước |
|---|---|---|
| 1 | `git status --short` ⇒ working tree sạch; `git ls-files package-lock.json` ⇒ **có** file lock (`RISK-04`) | rỗng / in ra `package-lock.json` |
| 2 | `npm run verify` trên HEAD sẽ tag | EXIT=0, output lưu vào `evidence/<ngày>-REL/verify.txt` |
| 3 | `node scripts/release-notes.mjs <version> \| wc -l` | số dòng note > 0 và đọc được |
| 4 | `package.json` và `package-lock.json` **cùng** version: `npm install --package-lock-only --dry-run` | `up to date`, EXIT=0 (lệch ⇒ CI chết ở Install, đã xảy ra với tag `v1.1.0` đầu tiên) |
| 5 | Người giữ repo **ký Go/No-Go** (§3) rồi tag `vX.Y.Z` trên **đúng** commit HEAD đã xanh | `git for-each-ref refs/tags/vX.Y.Z --format='%(objectname) %(*objectname)'` |
| 6 | `git push origin main --follow-tags` | workflow `4. Release` chạy; 9 bước success; release có asset zip thật |
| 7 | Mở release trên trình duyệt, tải zip, giải nén, chạy `npm run preview` hoặc serve tĩnh | app mở được **offline** (service worker), golden path không lỗi console |

**Rollout một phát, không canary.** Vì không có server ⇒ không có % traffic để tăng dần. Điều kiện
duy nhất chặn rollout là cổng máy (§1 bước 2) và chữ ký §3.

## 2. Lùi một bản (rollback)

Không có `deploy` để bấm lùi. Ba lối, theo thứ tự ưu tiên:

1. **Phục vụ bản cũ.** Asset của release cũ vẫn còn trên GitHub (`kho-bau-tri-thuc-<cũ>.zip`) — người
   dùng tải lại và serve. Chi phí: 0 thao tác code.
2. **Commit revert + tag mới.** `git revert <sha>` (không `reset --hard` trên `main` đã push), chạy
   §1, tag bản **lớn hơn** (`v1.1.1`) chứ không xoá tag cũ.
3. **Sửa nóng trên `main`** nếu lỗi nằm ở một file dữ liệu/nội dung — đi hết §1, không tắt cổng.

**Cấm:** xoá tag đã publish, `git push --force` lên `main`, và "sửa nhanh không test" với dữ liệu của
bé (`AGENTS.md` §1.5). Dữ liệu đã xuống `localStorage` của người dùng **không lùi được** — vì vậy mọi
thay đổi schema phải đi kèm migration + sanitizer có test (`BG-06`, chuỗi `MIGRATIONS` trong
`src/services/storage.ts`).

## 3. Điều kiện con người (máy không ký thay được)

| Điều kiện | Ai | Ghi |
|---|---|---|
| Ký Go/No-Go | `STK-004` | agent không ký (`step-by-step-guidance.md` §A6 điều kiện 4) |
| Đọc to ≥1 bài/môn cùng bé | `STK-002` | `TEST_PLAN.md` §11; nghiệm thu người dùng vẫn `NotRun` |
| Quyết định dịch tag `v1.1.0` | `STK-004` | `RISK-02` |
| Quyết định vá/hạ `firebase` | `STK-004` | `RISK-03` + `OQ-05` |

## 4. Theo dõi sau phát hành (thay cho dashboard)

Không telemetry ⇒ "theo dõi" = **đọc trên máy người dùng**. Ba kênh có thật:

1. **Probe QA trên build thật** — `npm run build` rồi `node qa/run-one.mjs qa/golden-path.mjs`;
   dán nguyên văn `errors[]` + `failedAt`, không chỉ kể exit code (`AGENTS.md` §1.3).
2. **Cổng CI trên commit** — 4 workflow; đọc qua API công khai khi không có quyền admin
   (`HARNESS.md` §2b).
3. **Người dùng báo** — màn Phụ huynh: báo cáo kỹ năng, lịch sử giải thưởng; file `…_report_YYYY-MM-DD.json`
   xuất từ `handleExportData` (một chiều, xem `RISK-11`).

Chỉ số tại máy (không có ngưỡng server-side, chỉ có trần repo):

| Chỉ số | Lệnh đo | Trần |
|---|---|---|
| entry chunk | `npm run check:budget` | ≤ 600 kB cứng / ≤ 450 kB mục tiêu (`AGENTS.md` §2) |
| boot graph | `grep -o 'assets/[A-Za-z0-9_.-]*\.js' dist/index.html \| sed 's#^#dist/#' \| sort -u \| xargs wc -c \| tail -1` | không có trần chính thức — chỉ so với lần đo trước |
| lỗi console khi chạy probe | `node qa/run-one.mjs qa/<probe>.mjs` ⇒ `errors: []` | 0 |
| trò chơi đăng ký đủ 4 nơi | `tests/t23-mcp-servers.test.ts` | 4 số bằng nhau |

## 5. Sự cố — khi nào ghi, ghi gì

Mọi lỗi **người dùng gặp** hoặc **cổng chặn mà không giải thích được** ⇒ thêm một hàng vào
[`incident-log.md`](incident-log.md) theo mẫu ở đầu file đó, kèm: commit, lệnh, output nguyên văn,
đường dẫn `evidence/`, và **một dòng "vì sao không tái diễn"** (test/probe/hook nào nay giữ).
Guide §C1: thay đổi phát sinh từ sự cố đi qua change control như mọi thay đổi khác — không có đường tắt
"hotfix không hồ sơ".

## 6. Điều kiện để file này được coi là ĐẠT

- [ ] Chạy thật §1 từ đầu tới cuối trên một bản mới (kèm run-id + output), hiện mới chỉ có bản mô tả.
- [ ] Restore drill: export → đặt lại → khôi phục. **Đang không làm được** vì không có lối nhập
      (`RISK-11`, `OQ-07`) ⇒ ô `lifecycle/README.md` §3 "Restore drill R-1" vẫn `NotRun`.
- [ ] Ít nhất một hàng trong `incident-log.md` có "vì sao không tái diễn" trỏ tới một test mở được.
