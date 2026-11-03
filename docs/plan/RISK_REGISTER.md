# RISK / OQ / ASM — sổ theo dõi điều chưa đóng
## Cross-cutting (guide §C1–C2) · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày mở sổ:** 2026-11-03 ·
**Ánh xạ:** `docs/step-by-step-guidance.md` §A9 (`RISK-xxx` / `OQ-xxx` / `ASM-xxx`), §C1 (change
control), §C2 (traceability upkeep). **Rule của sổ:** mỗi dòng bắt buộc có **chủ nhiệm người** và
**điều kiện chuyển trạng thái đo được**; dòng nào không có thì để `FAIL` chứ không được viết "đang làm".

> Trước khi có file này, rủi ro nằm rải ở `BRD.md` §6, `ARCHITECTURE.md` §13 (nợ kỹ thuật),
> `TEST_PLAN.md` §16 (khoảng trống tự đánh giá, 13 mục) và `lifecycle/README.md` §3 (ô trống).
> Sổ này **không chép lại** các mục đó — nó đánh ID và nối chủ nhiệm, để cổng §A6 ("mọi `Partial`
> phải có owner + hạn") kiểm được bằng mắt.

---

## 1. `RISK-*` — rủi ro đang mở

| ID | Rủi ro | Ảnh hưởng | Chủ nhiệm | Hạn / điều kiện đóng | Trạng thái |
|---|---|---|---|---|---|
| `RISK-01` | Đăng xuất **không xoá** bản ghi cloud. `src/services/cloudSync.ts` chỉ có `start` / `getState` / `subscribe` / `syncNow` — không có hàm xoá `/users/{uid}`; `logOut()` ở `src/services/firebase.ts` chỉ ngắt phiên | Phụ huynh tưởng đã gỡ dữ liệu của con khỏi cloud, thực tế dữ liệu vẫn nằm trong Firestore tới khi tự xoá bằng Firebase Console (mà rules `firestore.rules` chỉ cho chính uid đó ghi) | người giữ repo | đóng khi: có một lối "xoá dữ liệu cloud" chạy được **hoặc** `docs/11-decommissioning/decommission.md` mô tả đúng thao tác xoá và được chạy thật một lần kèm bằng chứng | **MỞ** (phát hiện khi lập pha 11, 2026-11-03) |
| `RISK-02` | Tag `v1.1.0` vẫn đóng ở `77d90ce`, tức commit chạy **trước** các bản sửa race cổng QA ⇒ gate của chính bản phát hành đỏ | Bản phát hành đang publish không được chứng nhận bởi cổng mới nhất | người giữ repo | dịch tag là việc của chủ sở hữu repo (không tự làm); điều kiện đóng = tag mới trên HEAD xanh `3. Browser QA` + chữ ký Go/No-Go | **MỞ** — owner-only |
| `RISK-03` | 4 advisory `high` chưa vá (`firebase`, `@firebase/firestore`, `@firebase/firestore-compat`, `@grpc/grpc-js`); bản vá đề xuất là **hạ firebase xuống 9.14.0** (`isSemVerMajor: true`) | Hạ major SDK = đổi hành vi cloud-sync, đụng `cloudSync.ts`/`cloudMerge.ts`/bundle; không được tự làm (`AGENTS.md` §1.4) | người giữ repo | đo lại: `npm audit --json \| node -e "..."` ⇒ `metadata.vulnerabilities.total`; đóng khi chủ repo quyết *vá* hoặc *chấp nhận có ghi lý do* | **MỞ** (đo 2026-11-03: total = 4, severity high cả 4) |
| `RISK-04` | Lane dùng chung đã **hai lần** xoá `package-lock.json` (`3727f04`, `fd3e7da`) trong khi cả 4 workflow chạy `npm ci` | `npm ci` đỏ ở bước Install ở CI dù `verify` xanh trên máy — đúng tình huống làm tag `v1.1.0` đầu tiên phải xoá tạo lại | mọi phiên làm việc trên repo này | điều kiện đóng = một hook/check `git ls-files package-lock.json` chặn commit thiếu lockfile (hiện chỉ là thói quen) | **MỞ** — đã có rule quy trình, chưa có gate |
| `RISK-05` | Tài liệu dẫn **số dòng** (`file.ts:123`) làm bằng chứng; sửa source là đường dẫn trôi, và **không có gate nào** đối soát | Reader mở nhầm chỗ, hoặc tin một tham chiếu đã hỏng | người giữ repo | đóng khi: ưu tiên dẫn **tên symbol** khi viết mới, và rà lại một pass các ref trong `docs/specs` + `docs/plan` mỗi đợt đổi `src/` lớn | **MỞ** |
| `RISK-06` | Phần FR nằm ngoài hai lát cắt nghiệm thu vẫn chưa xuống đủ `US`/`TC`; tổng số FR khai trong tài liệu ("88") lệch số dòng FR thật trong `SRS.md` (89) | Cổng §A6 điều kiện 2 (truy vết hai chiều) chỉ đạt **cho lát cắt đã chọn**; nói "FR đều có test" là sai | người giữ repo + agent viết test | điều kiện đóng ghi ở `RTM.md` §9 rule 5 và `09_ADOPTION_ROADMAP.md` (60 ngày); **không** tự ý ghi con số "còn N FR" | **MỞ** |
| `RISK-07` | Cloud-sync mới test bằng mock, chưa có ca nào với project Firebase thật; mất-mạng-khi-đã-bật-sync chưa có probe | Tính năng đang quảng bá có thể hỏng im lặng trên máy người dùng | người giữ repo | `TEST_PLAN.md` §16 mục 8 + task `EP-G1` trong `TASK_PLAN.md` | **MỞ** |
| `RISK-08` | Không có visual regression, không có coverage gate cho `src/services/**`, quota `localStorage` đầy chưa có ca | Hồi quy CSS/persistence lộ ra ở máy gia đình chậm hơn ở CI | người giữ repo | `TEST_PLAN.md` §16 mục 1/4/6 (task C1/C4/B6) | **MỞ** |
| `RISK-09` | Bộ kit mà guide dẫn chiếu **không có trong repo** (`AI_SDLC-SOP.md`, `agentic-sdlc-process.md`, 5 thư mục prompt, `.xlsx`), và bản thân `docs/step-by-step-guidance.md` chưa được git theo dõi (`?? `) | "Triển khai theo guide" rất dễ bị hiểu thành *chép lại chữ guide*; người sau không mở được template gốc để đối chiếu | người giữ repo | đóng khi: hoặc commit `docs/step-by-step-guidance.md` vào repo (kèm ghi rõ là bản gốc của kit), hoặc import đủ kit vào `docs/00-kit/` rồi chạy adaptation log lần hai | **MỞ** |
| `RISK-10` | Ô 13 `TEST_PLAN.md` §16 còn **MỞ**: chưa từng thấy một lượt đỏ bị chặn thật (không cờ che) sau khi bỏ `continue-on-error` | Chưa chứng minh được cổng QA CI *cắt* được commit hỏng, mới chỉ chứng minh *xanh* nhiều lượt | người giữ repo | đóng khi ghi được một lượt `3. Browser QA` **đỏ** làm đỏ cả run, kèm run-id | **MỞ** (đo 2026-11-03, tỉ lệ xanh tính tới `caff32a`: xem `evidence/2026-11-03-QA-RACE/ci-gate-race.txt` §16) |
| `RISK-11` | "Sao lưu" là **một chiều**. `handleExportData` (`src/components/parent/ParentDashboardModal.tsx:242`) chỉ ghi `{ profile, analytics, competitionHistory}` ra file `.json`; **không có lối nhập nào** (đo: `grep -rn "type=\"file\"\|importData" src/components/parent/*.tsx` ⇒ rỗng) | `SAFETY_PRIVACY.md` §2 viết phụ huynh "có toàn quyền **sao lưu** … hoặc đặt lại tiến độ" — sau khi đặt lại hoặc đổi máy, file export **không** dựng lại được tiến độ, và 14 store còn lại không nằm trong file đó | người giữ repo | điều kiện đóng = hoặc sửa câu trong `SAFETY_PRIVACY.md` thành "xuất báo cáo", hoặc xây lối nhập + test vòng export→reset→import (kèm bằng chứng probe) | **MỞ** (phát hiện khi lập pha 10, 2026-11-03) |

## 2. `DEF-*` — defect tìm thấy khi lập hồ sơ (không phải rủi ro suýt)

| ID | Defect | Bằng chứng | Trạng thái |
|---|---|---|---|
| `DEF-001` | Nút "Đặt lại tiến độ" hứa trả về "dữ liệu mới tinh ban đầu" (`ParentDashboardModal.tsx:280`) nhưng `resetProgress()` chỉ xoá **13/17** khoá `kho_bau_*`: còn sót `kho_bau_review_days`, `kho_bau_game_first_seen`, `kho_bau_tree_water` (và `kho_bau_parent_settings`, cố ý giữ) | RED trước: `evidence/2026-11-03-T43/ablation-t43a-reset-sweep-RED.txt` (4 failed / 1 passed) · GREEN: `tests/t43a-reset-progress-sweeps-child-data.test.ts` (5 passed) trong `evidence/2026-11-03-T43/verify.txt` · UI thật: `evidence/2026-11-03-T43/probe-t43-reset.txt` (đi qua Parent Gate, `ok: true`, ba khoá con `null`, `parent_settings` còn nguyên) + `probe-golden-path.txt` (`QA PASS — 28 step(s), 0 errors`) | **ĐÃ SỬA** đợt T43 — danh sách khoá nay suy ra từ `STORAGE_KEYS` trừ `RESET_KEEP_KEYS` (`src/services/storage.ts`), nên thêm khoá mới buộc phải quyết quét-hay-giữ |

## 3. `OQ-*` — câu hỏi cần người trả lời (agent không tự quyết)

| ID | Câu hỏi | Vì sao mở | Người trả lời |
|---|---|---|---|
| `OQ-01` | Có thật sự cần `.drawio` cho từng sơ đồ, hay markdown/mermaid trong `ARCHITECTURE.md` được chấp nhận như "bản sửa được"? | guide §A5 bắt `.drawio`; đo: `find . -iname "*.drawio"` ⇒ 0 file | người giữ repo — quyết định ở `10_SDLC_GUIDE_MAP.md` §6 |
| `OQ-02` | `openapi.yaml` có áp dụng không khi app không tự định nghĩa HTTP API? | guide §Phase 4 liệt kê `openapi.yaml`; repo không có REST layer | người giữ repo (`K/A` đề xuất, đã ghi lý do) |
| `OQ-03` | Có baseline bằng tag cho tài liệu không (`requirements-v1`, `design-v1`), hay tag chỉ dùng cho release? | guide §A6 định nghĩa baseline = commit + tag; repo hiện chỉ có `v1.1.0` | người giữ repo (tag là quyền chủ repo) |
| `OQ-04` | "Xoá toàn bộ dữ liệu của con" có phải là một **lối riêng** trong màn Phụ huynh (khác "Đặt lại tiến độ"), gồm cả xoá cloud? | `DEF-001` sửa phần local; `RISK-01` cho thấy phần cloud chưa có lối nào | người giữ repo — quyết nghiệp vụ, không phải kỹ thuật |
| `OQ-05` | Có chấp nhận 4 advisory `high` của `firebase` (mua bằng việc không hạ major SDK)? | `AGENTS.md` §1.4 cấm tự đổi dependency | người giữ repo |
| `OQ-06` | `RISK_REGISTER.md` đặt ở `docs/plan/` là hợp lý, hay phải sang `docs/01-intake/`/`docs/10-operations/`? | guide xếp rủi ro "any phase"; repo giữ habit "kế hoạch ở `docs/plan/`" | người giữ repo |
| `OQ-07` | Chọn cách nào cho `RISK-11`: **xây lối nhập** (export→reset→import có test) hay **sửa tài liệu** thành "xuất báo cáo, không khôi phục"? | Hai lựa đổi chi phí rất khác nhau và không được tự quyết giùm người giữ repo | người giữ repo |

## 4. `ASM-*` — giả định đang gánh thiết kế (sai là đổ nhiều thứ)

| ID | Giả định | Nếu giả định sai | Nơi neo |
|---|---|---|---|
| `ASM-01` | Dữ liệu bé **mặc định** chỉ nằm `localStorage`; cloud chỉ bật sau khi người lớn tự đăng nhập | Toàn bộ cam kết quyền riêng (`SAFETY_PRIVACY.md`, `BG-05`) sụp | `AGENTS.md` §1.8, `src/services/cloudSync.ts` |
| `ASM-02` | Không có telemetry ⇒ mọi số liệu nghiệp vụ (`BG-01`) chỉ đọc được trên máy người dùng | Bảng "hiện trạng" của BRD phải viết lại thành số server-side | `ADR-01`, `lifecycle/README.md` §3 |
| `ASM-03` | `MAX_TIER` = 6 và mỗi trò chơi mở bậc bằng sao thật | Bộ đếm "bé đạt bậc" và ladder quà tặng sai | `src/config/policy.ts:610` |
| `ASM-04` | Người lớn dùng chung thiết bị với bé (một trình duyệt, một hồ sơ) | Reset/quyền phụ huynh phải tách theo hồ sơ, không theo máy | `storage.ts` (một `CHILD_PROFILE` mỗi máy) |

## 5. Cách dùng sổ này khi đóng cổng

1. Trước khi nói "xong" một đợt: thêm/bớt dòng theo **điều kiện đo được**, không theo cảm tính.
2. Không xoá dòng đã đóng — chuyển `ĐÃ SỬA`/`ĐÃ TRẢ LỜI` và để nguyên ID (§C2: gap thì ghi `GAP`,
   không xoá hàng).
3. Nếu một `OQ-*` bị agent "tự trả lời" để công việc chạy tiếp ⇒ ghi rõ trong `.ai/CURRENT.md` và đánh
   dấu `tự quyết, cần người xác nhận` — đó là loại lỗi §E của guide ("gate passed by inaction").
