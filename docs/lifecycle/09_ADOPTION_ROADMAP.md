# 09 — Adoption Roadmap
## Lộ trình áp dụng AI 30/60/90 · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Baseline hôm nay** (mọi con số dưới đây là *điểm xuất phát*, đo bằng lệnh ghi ở cột):

| Chỉ số | Giá trị 2026-11-02 | Lệnh |
|---|---|---|
| Test file / test | 89 / 1280 | `npx vitest run` |
| Probe QA | 30 | `ls qa/*.mjs qa/*.cjs` (trừ `lib.mjs`, `run-one.mjs`) |
| FR có chuỗi tới TC + evidence | **2 lát cắt / 88 FR** | `RTM.md` §10 |
| Verdict `NotRun` còn mở | 6 vùng | `TEST_CASES.md` §5 |
| Release đã phát hành | **1** (`v1.1.0`) | `git tag \| wc -l` = 1 · `git ls-remote --tags origin` (đo 2026-11-03) |
| Thời gian `verify` | 21.88 s (phần test, đo 2026-11-03) | `evidence/2026-11-03-QA-RACE/verify-1280.txt` |
| Skill agent trong repo | 0 → **1** (`.qoder/skills/kho-bau-change`) | `find .qoder -name SKILL.md \| wc -l` = 1 — đợt T42 khai "2" là lệch: skill đo số liệu (`kho-bau-measure-sync`) nằm trong thư mục người dùng, **không** nằm trong repo |
| Sub-agent trong repo | 0 → **1** | `ls .qoder/agents` |

---

## 1. Playbook — ba dòng cho đội

1. **Không nói "xong" nếu chưa chạy cổng.** Output nguyên văn của `npm run verify` là đơn xin việc;
   kết quả MCP là manh mối, không phải bằng chứng.
2. **Người quyết expected, AI quyết cách đo.** AC 3 nhánh viết trước; test do AI sinh phải chứng minh
   biết đỏ bằng ablation trước khi được tin.
3. **Ba việc AI không tự làm:** thêm dependency, commit/push, tag/phát hành. Rule nào có hậu quả
   khó hoàn tác thì phải nằm ở hook/CI, không nằm trong lời dặn.

## 2. 30 ngày — đóng pha đang hở

| # | Việc | Owner | Kết quả đo được | Điều kiện dừng (viết trước) |
|---|---|---|---|---|
| 1.1 | Chạy phiên go/no-go thật, tag `v1.1.0`, để workflow 04 tạo Release | người giữ repo | `git tag` ≥ 1 · release note có nhãn AI | No-Go nếu còn P0/P1 mở hoặc `golden-path` có error |
| 1.2 | Restore drill R-1 (export → xoá → import) trên `dist/`, lưu ảnh | agent + người xem ảnh | `evidence/<ngày>-restore-drill/` có 2 ảnh | Dừng nếu import làm mất Sao/XP ⇒ mở bug P0, không đi tiếp |
| 1.3 | Đóng 4 nợ D-2…D-5 (T41E) | agent | 4 dòng biến mất khỏi `08` §5 | Không sửa nếu chưa có test tái hiện được lỗi |
| 1.4 | Đưa trần boot graph vào `verify` (NFR-P01 hết "một phần") | agent | `npm run check:budget` in 2 số đo và chặn | Không nâng trần để cho xanh |
| 1.5 | Gate quét chuỗi dữ liệu trẻ trước khi agent in ra (C-07) | người giữ repo | 1 test hoặc 1 hook mới | Nếu chưa làm được gate ⇒ giữ nguyên advisory và ghi rõ ở charter |

## 3. 60 ngày — nhân lát cắt ra các vùng khác

| # | Việc | Owner | Kết quả đo được | Điều kiện dừng |
|---|---|---|---|---|
| 2.1 | Viết US + TC cho 3 vùng: Thi thử (FR-E), Cờ vua 3D (FR-C), PWA offline (FR-Y) | agent, người duyệt AC | TC toàn repo ≥ 60, mỗi TC có verdict | Vùng nào không viết được AC 3 nhánh ⇒ coi như yêu cầu chưa rõ, quay lại SRS |
| 2.2 | Ablation cho **mọi** rule then chốt còn lại (quyền ba mẹ, migration, deterministic) | agent | ≥ 6 phép ablation có log trong `evidence/` | Không được bỏ bước hoàn tác — `git status` phải sạch `src/` |
| 2.3 | Chạy `verify` trên mọi commit, không chỉ commit cuối | người giữ repo | 100% commit merge có log | — |
| 2.4 | Dọn 2 lỗ hổng thiết kế DC-17/DC-19 vào registry | agent | `STORAGE_KEYS` = 19, RTM §4 hết dòng đỏ | Không đổi khoá mà không có migration (ADR-02) |

## 4. 90 ngày — từ "một người + agent" sang "đội"

| # | Việc | Owner | Kết quả đo được | Điều kiện dừng |
|---|---|---|---|---|
| 3.1 | Người thứ hai đọc diff theo 4 lớp và ký G-2 | người giữ repo + thành viên mới | ≥ 5 PR có 2 tên khác nhau | Không nới G-2 chỉ để merge nhanh |
| 3.2 | Nightly: full suite + 30 probe + ablation | người giữ repo | 1 workflow mới, chạy 7/7 đêm | Nếu probe flaky > 1 đêm/tuần ⇒ chẩn đoán, **không** tăng retry |
| 3.3 | UAT 5 phụ huynh thật | người giữ repo | biên bản Given/When/Then, 0 điểm nhãn tiêu cực | Dừng nếu phải thu dữ liệu cá nhân của trẻ ⇒ đụng `SAFETY_PRIVACY.md` |
| 3.4 | Quyết định có bật cloud-sync mặc định hay không | người giữ repo | ADR mới + threat model cập nhật | Mặc định là **không**; chỉ đảo khi có gate C-07 |

## 5. Đo đúng — output vs outcome

| Loại | Chỉ số | Baseline | Guardrail | Nhãn |
|---|---|---|---|---|
| Output | số test / số probe | 1240 / 29 | `verify` không vượt 90 s | **đo thật** |
| Output | số dòng AI sinh | chưa đo | — | **proxy** (dự án một người, không có đội để so) |
| Output | số PR/tuần | 0 PR thật (trunk-based) | — | **proxy** |
| Outcome | FR có chuỗi tới evidence | 1/88 lát cắt | không giảm | **đo thật** |
| Outcome | bug lọt tới phụ huynh | chưa có dữ liệu | — | **NotRun** — cần UAT 3.3 |
| Outcome | bé tự học 15–20 phút không cần người lớn | không đo được | — | **NotRun + proxy** — ADR-01 chặn telemetry (BG-01) |

Ba rule chống tự lừa: (a) số của dự án một người là **proxy**, ghi nhãn "proxy" cạnh số;
(b) không dùng "tỷ lệ code do AI viết" làm thành công — đó là output, không phải outcome;
(c) ô `NotRun` phải còn nguyên trong bảng, không xoá đi khi báo cáo.

## 6. Đường năng lực

```
Cá nhân (hôm nay)      : 1 người + agent, mọi rule enforce bằng hook/CI của repo này
→ Đội (90 ngày)        : 2 người ký G-2, playbook 3 dòng, nightly dùng chung
→ Tổ chức (nếu mở)     : playbook thành template, evidence/ thành chuẩn bắt buộc cho mọi dự án thiếu nhi
```

## 7. Công cụ & dữ liệu được phép

| Được dùng | Cấm / phải hỏi trước |
|---|---|
| `npm` + `package-lock.json` là nguồn thật | thêm dependency (ADR + `AGENTS.md` §1.4) · `bun.lock` để nguyên |
| MCP 5 server / 27 tool trong `mcp/` — chỉ đọc | dán nội dung bài làm của bé vào chat/Issue/tài liệu |
| `progress/` export để kiểm tiến độ | commit `progress/` (đã gitignore) · bật cloudSync mặc định |
| Google AI Studio cho **soạn nội dung** (`docs/GOOGLE_AI_STUDIO_RUNBOOK.md`) | dùng AI chấm điểm/mastery (ADR-04) |
| Playwright + probe trên `dist/` | sửa UI để chiều probe |
