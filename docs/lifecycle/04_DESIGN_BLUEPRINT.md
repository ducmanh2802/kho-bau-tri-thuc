# 04 — Design Blueprint
## 5 tầng thiết kế + threat model · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Chi tiết kiến trúc + 18 ADR:** [`ARCHITECTURE.md`](../specs/ARCHITECTURE.md) · file này chỉ giữ phần
*blueprint* và những gì khóa học yêu cầu mà ARCHITECTURE chưa có (state lỗi, threat model).

---

## Tầng 1 — Architecture driver (có nguồn, có số đo)

| Driver | Số đo | Nguồn | Ảnh hưởng thiết kế |
|---|---|---|---|
| Dùng được offline trên điện thoại gia đình | boot graph **418.5 kB**, entry **204.2 kB** | BG-04 · NFR-P01 | ADR-16/17/18: vendor lớn phải nằm sau `React.lazy`; `three`/`firebase` không được import thẳng entry |
| Không làm sai kiến thức lớp 1 | 0 lỗi validator, 18 WARNING đã xoá | BG-03 · NFR-C04 | ADR-05 nội dung là code tĩnh; ADR-06 deterministic theo `(tier, seed)` |
| Tiến độ không bị hỏng vì thao tác lặp | 5 tầng idempotency | BG-06 · NFR-R04 | sanitizer whitelist + khoá biên lai (`storage.ts:2139`) |
| Trẻ không bị thu thập dữ liệu | 0 API key, 0 lời gọi mạng bắt buộc | `SAFETY_PRIVACY.md` §1–2 · `.env.example` | ADR-01 local-first; ADR-16 cloud mirror tuỳ chọn |
| Thời lượng học hợp lứa tuổi | 15–20 phút/ngày | BG-01 · NFR-M01 | `policy.ts` 693 dòng giữ mọi trần số dùng chung |

## Tầng 2 — C4 / deployment

```
L1  Bối cảnh   Bé + Ba mẹ ──> [Ứng dụng web PWA] ──(tuỳ chọn, sau khi người lớn đăng nhập Google)──> Firebase
                                                          └─(mặc định)─> localStorage trên máy bé
L2  Container  Browser: React 19 SPA (Vite/rolldown) + Service Worker precache + WebAudio tổng hợp
               Cloud  : Firestore `users/{uid}` (mirror) — CHỈ khi `state.user != null` (cloudSync.ts:67,231)
               Build  : Vite → dist/ tĩnh; không có server app, không có API
L3  Component  App.tsx (router màn hình) → 95 component .tsx → 41 service → 104 module dữ liệu → storage.ts
```

Không có môi trường staging; `dist/` + `npm run preview` là môi trường "gần production" duy nhất,
và đó là nơi 29 probe Playwright chạy.

## Tầng 3 — ADR index (18 quyết định, 6 nhóm)

| Nhóm | ADR | Một dòng |
|---|---|---|
| Dữ liệu | 01, 02, 16 | local-first là nguồn thật · schema versioned + sanitizer · cloud là mirror tuỳ chọn |
| Đúng nội dung | 04, 05, 06, 15 | không dùng AI chấm điểm · nội dung là code · deterministic `(tier,seed)` · không bịa giáo trình |
| Kiến trúc | 03, 09, 11 | engine chấm, UI trình bày · bất biến đăng ký 4 nơi · 3D CSS mặc định, WebGL phải tách chunk |
| Ngân sách | 07, 08, 17, 18 | precache tại `writeBundle` · bundle là gate · dependency >200 kB phải lazy · ngân sách thật là boot graph |
| Quy trình | 12, 13 | `test:ci` trong tự động hoá · trunk-based + tag `vX.Y.Z` |
| Hạ tầng agent | 10, 14 | âm thanh tổng hợp không file media · MCP zero-dependency |

**Phương án đơn giản nhất đã cân nhắc và bị từ chối** (bắt buộc phải ghi cho mỗi ADR):
ADR-01 từng có phương án "backend + DB thật để đo BG-01" — từ chối vì đổi một mục tiêu đo lấy
rủi ro lộ dữ liệu trẻ; hậu quả không cân xứng.

## Tầng 4 — Sequence & state (kèm **state lỗi**)

Hành trình "bé hoàn thành một màn chơi và nhận thưởng" — mỗi mũi tên là một điểm có thể hỏng:

```
Bé bấm đáp án
  └─> useGameStage (nonce++)                 lỗi: StrictMode mount 2 lần ⇒ nonce nhảy 2 ⇒ lượt thật vẫn tính 1 (nonce nằm trong claimKey)
       └─> StorageService.recordQuestionAnswer(evidenceId)
            ├─ writeJSON thất bại (quota)    lỗi: trả false ⇒ DỪNG, không cộng analytics/streak  [TC-08, TC-16]
            └─ evidenceId đã có               lỗi: bỏ qua im lặng, không nhân đôi                  [TC-01, TC-03]
       └─> GameModalWrapper claim effect
            └─ recordTierReward(claimKey)
                 ├─ claimKey đã có            lỗi: trả isDuplicate=true ⇒ UI in dải "đã nhận rồi"  [TC-11, TC-21]
                 ├─ rewardsEnabled=false       lỗi: trả 0 ⇒ UI in dải giải thích, không hứa Sao    [TC-22]
                 └─ saveMotivation thất bại    lỗi: KHÔNG ghi biên lai non ⇒ lần sau còn trả đúng  [TC-15]
```

Bảng "mỗi nhánh lỗi một state trên màn hình" — vì app không có HTTP API, nhánh lỗi là nhánh storage/render:

| Nhánh lỗi | State người dùng thấy | Nơi render |
|---|---|---|
| Ghi hỏng / hết chỗ | tiến độ đứng nguyên, không có "+1 ngày" giả | `storage.ts` hoàn tác bước ngày; không có banner (không nói dối bằng thông báo) |
| Lượt trùng đã nhận thưởng | dải xanh "Lượt này Gấu ghi rồi nhưng không cộng thêm…" | `GameRewardStrip` (`GameModalWrapper.tsx:107`) |
| Ba mẹ tắt quỹ thưởng | dải xanh "Nhà mình đang tắt phần thưởng…" | cùng component trên, xem `game-rewards-off.png` |
| WebGL không có | bàn cờ 2D thay vì màn trắng | `ChessScreen` fallback, `tests/t38-webgl-fallback.test.ts` |
| Offline khi chưa đăng nhập | app chạy bình thường, mirror đứng yên | `cloudSync.ts:231` `if (!user)`, `tests/firebase-auth-sync.test.ts:86` |
| Có bản build mới | UpdateBanner "Tải bản mới" | `src/components/system/UpdateBanner.tsx`, `qa/offline-pwa.mjs` |

## Tầng 5 — ERD (kv-store) & "OpenAPI" tương đương

Không có HTTP API ⇒ hợp đồng là **type + hàm**, do typecheck enforce. Hai thứ cần ghi:

**Khoá `localStorage` (19):** 17 khoá trong `STORAGE_KEYS` (`storage.ts:74-…`) + 2 khoá cục bộ.

| Nhóm | Khoá | Chủ |
|---|---|---|
| Hồ sơ | `kho_bau_child_profile` (streak, `appliedSessionIds`, `rewardClaims` qua motivation) | `storage.ts` |
| Học | `kho_bau_analytics`, `kho_bau_learning_os_store`, `kho_bau_reading_store`, `kho_bau_kidbox_store`, `kho_bau_english_mastery_store`, `kho_bau_game_progress`, `kho_bau_review_days`, `kho_bau_cotuong_puzzles` | engine tương ứng |
| Động lực | `kho_bau_motivation`, `kho_bau_daily_quests`, `kho_bau_achievements`, `kho_bau_tree_water`, `kho_bau_game_nonce`, `kho_bau_game_first_seen` | `motivationEngine`, `useGameStage` |
| Hệ thống | `kho_bau_parent_settings`, `kho_bau_competition_history` | `ParentDashboardModal`, `competitionEngine` |
| ⚠ Ngoài registry | `kho_bau_ioe_store`, `kho_bau_cloud_session_hint` | DC-17, DC-19 — lỗ hổng thiết kế đang mở |

**Trần kích cỡ (chống DoS chính mình):** `recentEvidences` ≤ 200 · `rewardClaims` ≤ 60
(`storage.ts:1461`) · `appliedSessionIds` ≤ `READING_POLICY.MAX_RECENT_SESSIONS` = 30 (`policy.ts:110`).

**"OpenAPI" của lát cắt T41C** (hàm thuần, chữ ký là hợp đồng):

| Hàm | Vào | Ra | Lỗi |
|---|---|---|---|
| `StorageService.recordQuestionAnswer(skillId, correct, qid, text, subject, {evidenceId})` | như trên | `void` | im lặng khi `evidenceId` trùng hoặc `writeJSON` trả `false` |
| `StorageService.recordTierReward(gameId, tier, prev, stars, score)` | id + điểm | `{starsAwarded, xpAwarded, isFirstClear, isNewBest, isDuplicate?}` | `isDuplicate:true` khi claimKey đã có |
| `ReadingEngine.applySession(profile, metrics)` | profile thuần | profile mới | trả **nguyên bản** khi `sessionId` đã gập |
| `writeJSON(key, value)` | key + value | `boolean` | `false` khi `setItem` ném |

---

## 6. Threat model (STRIDE) theo luồng dữ liệu

Vẽ theo đường đi của *dữ liệu trẻ*, không theo danh sách tính năng.

| # | Chữ | Luồng bị đo | Nỗi | Kiểm soát đang có | Còn thiếu |
|---|---|---|---|---|---|
| T-1 | **S**poofing | `cloudSync` ghi `users/{uid}` | thiết bị khác mạo uid ghi vào | **enforcement point là `firestore.rules`** (`request.auth.uid == userId`), cộng với client chỉ ghi khi `state.user != null` sau Google login (`cloudSync.ts:231`); không có tài khoản trẻ em. API key web trong `firebase-applet-config.json` là public theo thiết kế Firebase (ADR-16) | chưa có test end-to-end với project Firebase thật — `tests/firebase-auth-sync.test.ts` dùng mock |
| T-2 | **T**ampering | `localStorage` sửa bằng DevTools | tiến độ/ba mẹ bị bẻ | sanitizer **whitelist** (`storage.ts:782`, `:1460`) — field lạ bị reset về mặc định; `schemaVersion` migration (ADR-02) | chưa có test "field lạ bị xoá" cho từng store |
| T-3 | **R**epudiation | nhật sử thay đổi | không truy được ai quyết định | git history + `commit-msg` bắt chuẩn + `CHANGELOG.md` | `.ai/CURRENT.md` nhiều lane ghi chồng |
| T-4 | **I**nformation disclosure | agent đọc repo, log, Issue | lộ bài làm của bé | `progress/` gitignore; `AGENTS.md` §1.7 cấm dán dữ liệu trẻ; `evidence/` dùng hồ sơ giả; `SAFETY_PRIVACY.md` | **chưa có gate tự động** quét chuỗi dữ liệu trẻ trước khi agent in ra — `CHECKLIST.md` C-07 |
| T-5 | **D**enial of service | `setItem` hết chỗ, mảng phình | app hỏng hoặc chậm vĩnh viễn | `writeJSON` trả `boolean` + hoàn tác bước ngày; 3 trần mảng ở Tầng 5 | chưa có probe "nhồi localStorage tới trần" |
| T-6 | **E**levation of privilege | bé tắt công tắc của ba mẹ | mất kiểm soát phần thưởng | `ParentDashboardModal` + `qa/parent-controls.mjs` (TC-27) | gate ba mẹ là UI-level, không phải OS-level — chấp nhận cho app học tại nhà |

## 7. Lethal trifecta — và điều kiện đã bị cắt

Ba điều kiện nguy hiểm cho một hệ thống có agent: **(1) chạm dữ liệu riêng tư + (2) ăn nội dung
không tin cậy + (3) có đường truyền ra ngoài.**

| Mặt | (1) dữ liệu riêng tư | (2) nội dung không tin cậy | (3) truyền ra ngoài | Đủ bộ ba? |
|---|---|---|---|---|
| **Sản phẩm** (app bé dùng) | Có — `localStorage` | Không — mọi nội dung là code tĩnh đã duyệt (ADR-05), không có input người khác | Không — mặc định 0 lời gọi mạng (`.env.example`) | **Không** — cắt ở (2) và (3) |
| **Đường mirror** (`cloudSync`) | Có | Không | Có — Firestore | **Không** — cắt ở (2); và (3) chỉ bật khi người lớn tự đăng nhập (ADR-16) |
| **Đường agent** (AI sửa repo) | Có *nếu* `progress/` tồn tại trên máy | Có — `docs/opencode/reports/*`, JSON import, ảnh/PDF tài liệu | Có — `git push`, Issue | **Gần đủ** ⇒ cắt ở (1): `kbt-progress` chỉ đọc file export, `AGENTS.md` §1.7 cấm đưa nội dung bài làm ra chat/Issue; `progress/` không bao giờ commit |

Đây là chỗ **nguy hiểm nhất còn lại** của quy trình, và nó được kiểm bằng rule + lời hứa chứ chưa
bằng gate. Hành động đóng nó nằm ở `CHECKLIST.md` C-07 (owner: người giữ repo, hạn: trước khi bật
`cloudSync` mặc định cho bất kỳ ai).
