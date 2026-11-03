# Decommissioning — ngừng dùng / gỡ bỏ, và dữ liệu bé đi đâu
## Pha 11 (Decommissioning) · guide §A5 `docs/11-decommissioning/`

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày:** 2026-11-03 ·
**Trạng thái:** bản mô tả thủ tục + **phát hiện thật khi lập hồ sơ** (`DEF-001` đã sửa, `RISK-01` còn mở).
File này **chưa** có bằng chứng chạy một lần trên máy thật — điều kiện đóng ở §6.

> Guide §Phase 11 yêu cầu "evidence of data disposition and access revocation". Với một app **dữ liệu trẻ
> em**, đây không phải pha hình thức: nó trả lời câu hỏi "khi gia đình thôi dùng, bài làm của con tôi
> nằm ở đâu và ai xoá được". Câu trả lời trung thực: **phần lớn nằm trên máy của họ, một phần nằm
> ngoài tầm với của app.**

---

## 1. Kiểm kê nơi dữ liệu nằm — đo được, không phải liệt kê theo trí nhớ

Lệnh tái tạo bảng này:

```bash
sed -n '/^const STORAGE_KEYS = {/,/^};/p' src/services/storage.ts | grep -cE "^\s+[A-Z_]+: 'kho_bau"   # ⇒ 17
grep -n "kho_bau_cloud_session_hint\|kho_bau_storage_change" src/services/cloudSync.ts src/services/storage.ts | head
```

**17 khoá** đăng ký trong `STORAGE_KEYS` (`src/services/storage.ts:60`), cộng **1 cờ phiên**
(`kho_bau_cloud_session_hint`, `cloudSync.ts:9`) và **1 tên sự kiện** (`kho_bau_storage_change` —
*không* phải khoá lưu trữ, chỉ là `CustomEvent` nội bộ để các tab đồng bộ).

| Khoá | Chứa gì | "Đặt lại tiến độ" có xoá? | Ghi chú |
|---|---|---|---|
| `kho_bau_child_profile` | XP, sao, bài đã hoàn thành, vật phẩm đã mở, lịch sử thưởng | Có | nhân hồ sơ bé |
| `kho_bau_analytics` | thống kê lượt làm, `recentErrors`, `lastActiveDate`, `stateTouchedAt` | Có | nguồn của báo cáo phụ huynh |
| `kho_bau_daily_quests` | tiến độ nhiệm vụ ngày | Có | |
| `kho_bau_achievements` | huy hiệu đã đạt | Có | |
| `kho_bau_competition_history` | kết quả các lần thi thử | Có | |
| `kho_bau_learning_os_store` | máy trạng thái phiên học: bằng chứng, kỹ năng, mệt, phiên đang dở | Có | schema `P43-v1` |
| `kho_bau_reading_store` | tiến độ luyện đọc | Có | |
| `kho_bau_kidbox_store` | tiến độ Kid's Box (Tiếng Anh) | Có | |
| `kho_bau_english_mastery_store` | mastery từng kỹ năng tiếng Anh | Có | key khai ở `englishMasteryStore.ts:21` |
| `kho_bau_game_progress` | bậc đã mở, sao và điểm tốt nhất theo bậc, cho từng trò chơi | Có | |
| `kho_bau_review_days` | danh sách ngày bé hoàn thành ôn tập | **Có — từ đợt T43** | trước T43 **sót** (`DEF-001`) |
| `kho_bau_game_nonce` | số hạt giống xáo đề theo trò chơi | Có | |
| `kho_bau_game_first_seen` | ngày bé thấy mỗi trò chơi lần đầu (điều khiển nhãn "MỚI" 7 ngày) | **Có — từ đợt T43** | trước T43 **sót** (`DEF-001`) |
| `kho_bau_tree_water` | ngày tưới cây gần nhất (bắn confetti 1 lần/ngày) | **Có — từ đợt T43** | trước T43 **sót** (`DEF-001`) |
| `kho_bau_motivation` | kho động lực: sticker, khiên, số liệu ngày | Có | |
| `kho_bau_cotuong_puzzles` | id các thế cờ tướng bé đã giải | Có | |
| `kho_bau_parent_settings` | lựa chọn của **người lớn**: chế độ đêm, bật/tắt phần thưởng, âm thanh | **Không — cố ý giữ** | không phải dữ liệu học của bé; `RESET_KEEP_KEYS` (`storage.ts`) |

Bốn loại dữ liệu **không** nằm trong `localStorage`:

| Loại | Nơi nằm | Disposition khi gỡ bỏ |
|---|---|---|
| Ảnh/asset đã cache để chạy offline | Cache của service worker (`/sw.js`, `src/services/pwa.ts`) | xoá theo site data của trình duyệt; app **không** có API tự clear cache cho người dùng |
| Bản sao cloud (tuỳ chọn) | Firestore `/users/{uid}` — chỉ tồn tại nếu người lớn **tự** đăng nhập Google và bật sync | **Chưa có lối xoá nào trong app** ⇒ `RISK-01`; xem §3 |
| File báo cáo đã xuất | Máy người dùng (`kho_bau_tri_thuc_report_YYYY-MM-DD.json`, sinh từ `handleExportData`) | thuộc quyền người dùng; app không giữ bản nào |
| Ảnh screenshot/bài làm trong tài liệu repo | **Cấm** theo `AGENTS.md` §1.8 | nếu phát hiện lọt vào `docs/` hoặc Issue ⇒ coi là sự cố, ghi `incident-log.md`, xoá bằng commit và **không** để lại trong history nếu có dữ liệu nhận dạng được |

## 2. Thủ tục A — một gia đình thôi dùng app (phổ biến nhất)

1. **(Tuỳ chọn) Xuất báo cáo** nếu muốn giữ lại hồ sơ: màn Phụ huynh → "Xuất file (.json)".
   Lưu ý trung thực: file chỉ gồm `{profile, analytics, competitionHistory}` và **không nạp lại được**
   (`RISK-11`) — nó là bản in, không phải bản backup.
2. **Đăng xuất cloud** (nếu từng bật): bấm đăng nhập/ngắt trong màn Phụ huynh ⇒ `logOut()`
   (`src/services/firebase.ts`) ngắt phiên, cờ `kho_bau_cloud_session_hint` bị xoá
   (`cloudSync.ts:29`). **Không** xoá dữ liệu cloud — xem §3 bước 2.
3. **Xoá toàn bộ dữ liệu trên máy:** hoặc bấm "Đặt lại tiến độ" (quét 16/17 khoá, giữ
   `parent_settings` — từ T43), hoặc mạnh hơn và đầy đủ hơn: trình duyệt → xoá site data
   (xoá sạch 17 khoá + cache service worker). Đây là con đường **duy nhất** xoá được
   `parent_settings`.
4. **Gỡ khỏi màn hình chính** (PWA đã "cài" thì gỡ icon) — không ảnh hưởng dữ liệu.

Bằng chứng cần có (chưa có — §6): ảnh chụp trước/sau khi mở DevTools → Application → Local Storage
trên máy thật, hoặc output probe đọc `localStorage` sau thao tác.

## 3. Thủ tục B — gỡ bỏ khỏi dự án (repo/service bị ngừng)

| Bước | Ai | Việc | Điều kiện "đã làm" |
|---|---|---|---|
| 1 | `STK-004` | Ngừng tag mới, archive repo (hoặc thông báo ngừng trong `README.md`) | repo hiển thị đã archive |
| 2 | `STK-004` | **Xoá Firestore**: project/applet trong Firebase Console — xoá collection `users` hoặc xoá project | ảnh chụp console + ngày xoá; `firestore.rules` chỉ cho từng uid ghi, nên **chủ project phải làm**, không có lối tự động từ app |
| 3 | `STK-004` | Thu hồi quyền truy cập: xoá OAuth client / khoá applet dùng ở `firebase-applet-config.json`, tắt key CI (GitHub secrets) | ghi lại trong `runbook.md` §5 như một hàng incident/ops |
| 4 | `STK-004` | Xoá GitHub Release + asset zip (kèm tag) nếu không muốn bản cũ tải được nữa | `gh release list` rỗng |
| 5 | Agent | Cập nhật `docs/`: đánh dấu các cổng (pha 9–10) `Ngừng hoạt động`, ghi ngày và lý do; **không xoá lịch sử** (`step-by-step-guidance.md` §C2: gap thì ghi, không xoá hàng) | commit docs-only |

**Về phía bé:** nếu gia đình làm đúng §2 bước 3, dữ liệu học của bé **không còn** ở bất kỳ đâu do dự án
nắm — trừ khi họ từng bật sync và bước 2 của §3 chưa được thực hiện. Đó chính là `RISK-01`.

## 4. Access revocation — tắt các đường vào

| Đường vào | Cách thu hồi | Đã chứng minh? |
|---|---|---|
| GitHub repo (write) | đổi visibility / archive / xoá collaborator | chưa — quyền chủ repo |
| Actions + secrets | tắt workflow, xoá secrets | chưa |
| Firestore | `firestore.rules` (chặn chéo theo uid) + xoá project/collection | rules **có** (`cat firestore.rules`), xoá project **chưa** |
| App đang chạy trên máy người dùng | người dùng xoá site data / ngừng mở app | thủ tục §2, chưa chạy thật |

## 5. Điều **không** làm được hôm nay (ghi rõ để không ai tưởng đã xong)

1. Không có nút "xoá mọi thứ của con trên cloud" trong app ⇒ `RISK-01` + `OQ-04`.
2. Không có lối **nạp** file đã xuất ⇒ "sao lưu" trong `SAFETY_PRIVACY.md` §2 đang nói quá khả năng
   sản phẩm (`RISK-11` + `OQ-07`).
3. Không có API tự clear service worker cache cho người dùng; xoá sạch phải qua trình duyệt.
4. `resetProgress()` giữ `parent_settings` là **quyết định thiết kế** (`RESET_KEEP_KEYS`), không phải sót.
   Ai muốn "xoá trắng hoàn toàn" phải dùng đường trình duyệt (§2 bước 3).

## 6. Điều kiện để pha 11 được coi là ĐẠT

- [ ] Chạy §2 trên một máy thật, lưu ảnh/output vào `evidence/<ngày>-DECOM/` (guide §A6: evidence mở được).
- [ ] Chạy §3 bước 2–3 trên project Firebase thật **một lần** (project test cũng được) và ghi biên bản.
- [ ] `RISK-01` chuyển `ĐÃ SỬA` hoặc `CHẤP NHẬN CÓ LÝ DO` do người giữ repo quyết.
- [ ] `SAFETY_PRIVACY.md` được đối chiếu lại với §5 mục 2 (một trong hai bên phải sửa).
