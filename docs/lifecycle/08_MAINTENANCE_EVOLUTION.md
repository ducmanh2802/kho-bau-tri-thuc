# 08 — Maintenance & Evolution
## Duy trì & tiến hoá · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Nhật sử:** [`../../CHANGELOG.md`](../../CHANGELOG.md) · [`../plan/TASK_PLAN.md`](../plan/TASK_PLAN.md) §II ·
39 báo cáo audit trong [`../opencode/reports/`](../opencode/reports/)

---

## 1. Characterization test — khoá hành vi *trước* khi sửa

Expected lấy từ **lần chạy thật trên code cũ**, không từ ý tưởng "nó nên thế nào". Đây là loại test
duy nhất cho phép refactor code mà không có đặc tả đầy đủ.

| Test đang làm vai trò đó | Hành vi nó khoá | Lấy expected từ đâu |
|---|---|---|
| `tests/t39-first-load-graph.test.ts` | đồ thị asset mà `dist/index.html` tham chiếu tĩnh phải ≤ ngưỡng đã đo | chạy `getBudgetReport()` trên build thật, chốt số ở `scripts/check-budget` |
| `tests/bundle-budget.test.ts` | entry ≤ 600 kB, mục tiêu 450 kB | số đo `npm run check:budget` tại thời điểm viết test |
| `tests/t23-mcp-servers.test.ts` | bốn danh sách đăng ký trò chơi phải bằng nhau | đếm từ 4 nguồn thật |
| `tests/t41c-idempotency.test.ts:318` (describe "hợp đồng nguồn") | *cấu trúc* code: thứ tự `if (!recorded) return;`, `writeJSON` trả boolean | đọc file nguồn bằng regex |

**Lệch so với chuẩn:** repo chưa từng *commit* một characterization test **trước** đợt refactor đầu
tiên của đợt đó — test T39 viết cùng commit với refactor. Cách bù: mỗi bước refactor một commit,
chạy `npx vitest run` sau từng commit; nếu suite đỏ giữa bước, dừng ở bước đó thay vì sửa tiếp.
Rule này ghi ở `CHECKLIST.md` C-04 cho tới khi có đợt refactor đầu tiên tuân thủ đúng thứ tự.

## 2. Change request + impact analysis 6 chiều

Một CR phải qua đủ 6 chiều **trước khi code**, có người ký. Mẫu:

| Chiều | Câu hỏi | Ví dụ thật — CR "chặn ghi trùng" (T41C) |
|---|---|---|
| 1 Dữ liệu | store/schema nào đổi? | `kho_bau_child_profile.appliedSessionIds` mới · `kho_bau_motivation.rewardClaims` mới · `STORAGE_SCHEMA_VERSION` không đổi (thêm field có mặc định) |
| 2 API/hợp đồng | hàm/signature nào đổi? | `writeJSON` `void → boolean` (lan ra mọi caller) · `recordTierReward` thêm `isDuplicate?` |
| 3 UI | màn nào đổi? | `GameModalWrapper` — hai bảng kết quả thay bằng `GameRewardStrip` |
| 4 Test | test nào cũ bị sai kỳ vọng? | `tests/game-rewards.test.ts` giữ nguyên; thêm 25 test mới |
| 5 Migration | hồ sơ cũ chạy được không? | có — sanitizer whitelist phải khai field mới, nếu không field bị reset mỗi lần đọc (chính là bug đã tránh, TC-07/TC-14) |
| 6 Rollback | lùi về commit trước thì sao? | an toàn: field mới bị sanitizer của bản cũ bỏ qua, không mất dữ liệu cũ |

**Quyết định có người ký:** chấp nhận đổi `writeJSON` sang trả `boolean` (rủi ro: mọi caller phải
đọc giá trị mới) thay vì thêm hàm mới song song (rủi ro: hai đường ghi, dễ bỏ sót). Người giữ repo
chọn đường thứ nhất vì nó bắt buộc các điểm ghi phải *nói* được chúng lưu được chưa.

## 3. Review PR của agent — 4 lớp

| Lớp | Câu hỏi | Cách kiểm trong repo |
|---|---|---|
| **Scope** | file có nằm trong phạm vi brief không? | `git status --short` + `git diff --stat` trước khi stage; không dùng `git add -A` |
| **Diff** | mỗi thay đổi đọc được theo commit không? | review theo commit, không đọc gộp; message theo Conventional Commits (`commit-msg` chặn) |
| **Test** | characterization test của nhánh chính có pass trên PR không? | `pre-push` chạy `verify:quick`; CI workflow 01 chạy full suite |
| **Evidence** | bằng chứng gắn đúng commit? | `evidence/README.md` §2 — mỗi dòng bảng ghi SHA mà lệnh đã chạy trên đó |

Reviewer chạy bằng sub-agent chỉ-quyền-đọc: [`.qoder/agents/kbt-reviewer.md`](../../.qoder/agents/kbt-reviewer.md).
Nguyên tắc: **ít nhất một người hiểu mỗi thay đổi trước khi merge**; finding phải được xác minh bằng
dòng code hoặc lệnh chạy lại, không chấp nhận "có vẻ sai".

## 4. Worktree cho agent

Agent làm việc trong `git worktree` riêng khi sửa đồng thời với lane khác — tránh hai loại hỏng:
(a) đè lên file đang dở của lane khác, (b) `git stash` chung làm mất work của nhau.
Repo này hiện **dùng chung một working tree** (`.ai/CURRENT.md` ghi lane), nên rule thực tế là:
stage **từng file một**, không `git add -A`, không `git stash` trần. Đã xảy ra: lane khác xoá
`package-lock.json` hai lần (`3727f04`, `fd3e7da`) trong khi cả 4 workflow chạy `npm ci`.

## 5. Nợ đã biết, có chủ, có hạn

| # | Nợ | Vì sao chưa sửa | Owner | Hạn |
|---|---|---|---|---|
| D-1 | `storage.ts` 2628 dòng | gom mọi ghi vào một chỗ là lựa chọn có chủ đích; tách sẽ đụng 41 service | người giữ repo | trước khi bật cloudSync mặc định (T41D) |
| D-2 | `getMotivationState` **mutate khi đọc** (weekly shield, trần 2) | đọc có ghi làm hỏng giả định "pure getter"; chưa có bug thật | agent T41E | 2026-11-30 |
| D-3 | `competitionEngine.ts:537` dùng `Date.now()` + `Math.random()` cho record id | vi phạm ADR-06 về deterministic *dữ liệu bài thi*; id bản ghi không ảnh hưởng đề | agent T41E | 2026-11-30 |
| D-4 | `tests/decision-engine-storage.test.ts` `console.log` dump | đã xoá 3 khối console.log dump (addition/core actions/recs); test vẫn xanh, output CI sạch | agent T41E | **ĐÃ XONG 2026-11-02** |
| D-5 | hồ sơ mới hiện "Tiến độ: 50%" với 0 Sao | dẫn chứng sai cho phụ huynh | agent T41E | 2026-11-30 |
| D-6 | DC-17 `kho_bau_ioe_store` · DC-19 `kho_bau_cloud_session_hint` ngoài registry | 2 lỗ hổng thiết kế, đã ghi ở `RTM.md` §4 | người giữ repo | 2026-12-31 |

## 6. Vòng bảo trì — khi nào một bug thành CR

```
Báo cáo (phụ huynh / probe đỏ / audit) 
  → tái hiện được bằng lệnh hoặc ảnh?      không ⇒ dừng, hỏi lại nguồn
  → có FR/NFR nào mô tả hành vi đúng?     không ⇒ viết FR trước (SRS), rồi mới tới CR
  → impact analysis 6 chiều (§2)          có người ký
  → characterization test khoá hành vi cũ (§1)
  → refactor từng bước, mỗi bước một commit, test pass sau mỗi commit
  → review 4 lớp (§3) → merge → CHANGELOG + evidence/
```
