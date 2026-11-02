# HARNESS — Guide × Sensor × Memory
## Danh mục rào chắn quanh AI · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Câu hỏi của tài liệu này:** *điều gì thật sự chặn được một quyết định sai*, chứ không phải
*điều gì được ghi trong tài liệu*. Rule quan trọng phải **enforced**, không chỉ advisory
(`02_AI_USAGE_CHARTER.md` §0.2).

---

## 1. Guide — cái dẫn đường (advisory)

| Lớp | Ở đâu | Bao nhiêu | Kiểm |
|---|---|---|---|
| README cho agent | [`../AGENTS.md`](../AGENTS.md) | 4 phần: mệnh lệnh · bất biến · ngôn ngữ · commit | đọc tự động mỗi phiên |
| Skill trong repo | [`.qoder/skills/kho-bau-change/SKILL.md`](../.qoder/skills/kho-bau-change/SKILL.md) | **1** — quy trình 7 bước một thay đổi | đã đăng ký (agent thấy trong danh sách skill) |
| Skill ngoài repo | `~/.qoder/skills/` | **4** — `kho-bau-measure-sync` · `kho-bau-mini-game-integration` · `vietnamese-text-integrity-check` · `zero-dep-mcp-stdio-server` | `ls ~/.qoder/skills` |
| Sub-agent | [`.qoder/agents/kbt-reviewer.md`](../.qoder/agents/kbt-reviewer.md) | **1** — reviewer chỉ-đọc, 4 lớp | `ls .qoder/agents` |
| Thẻ prompt | [`../prompts/`](../prompts/) | **5** thẻ + index, mỗi thẻ có tiêu chí đạt | `ls docs/prompts/*.md` |
| Quy trình | [`SDLC.md`](SDLC.md) (298 dòng) · [`../specs/`](../specs/) | 6 giai đoạn + DoD + cách tag | `wc -l docs/SDLC.md` |
| MCP cho repo | [`../mcp/`](../mcp/) | **5 server / 27 tool**, zero-dependency | `ls mcp/*.mjs` |

## 2. Sensor — cái chặn thật (enforced)

| Tầng | Sensor | Chặn gì | Đã chạy thật chưa |
|---|---|---|---|
| Editor | typecheck `tsc --noEmit` | type sai | mỗi commit |
| Git | `scripts/hooks/pre-commit` | commit khi typecheck đỏ | có |
| Git | `scripts/hooks/commit-msg` | message ngoài Conventional Commits | có |
| Git | `scripts/hooks/pre-push` | push khi `verify:quick` đỏ | có |
| CI | workflow `01-quality` | typecheck + 1278 test | có, mỗi push/PR |
| CI | workflow `02-build-artifact` | build + `check:budget` (entry ≤ 600 kB) | có |
| CI | workflow `03-qa-browser` | 30 probe Playwright trên `dist/` | **có mặt nhưng chưa từng chặn gì**: job đặt `continue-on-error: true` (`03-qa-browser.yml:30`), và tới `66e0fea` probe mới thật sự chạy trên runner (trước đó chết ở bước Install / Download artefact chéo run). Lần chạy đầu 41488045102 ⇒ job failure ở "QA probe" |
| CI | workflow `04-release` | tag sai dạng `vX.Y.Z` bị từ chối | **1 lần, đỏ**: run 41486056746 trên tag `v1.1.0` đóng ở `7d92246` — chết ở bước Install (`npm ci` + lock lệch npm 10) nên "Create GitHub Release" bị skip, chưa từng có release nào được tạo |
| Test | **source-contract test** | cấu trúc code đổi (vd `writeJSON` mất `return false`) | có — `tests/t41c-idempotency.test.ts:318` |
| Test | bất biến 4 danh sách game | game đăng ký thiếu nơi thứ 4 | có — `tests/t23-mcp-servers.test.ts` |
| Test | đồng hồ trò chơi | bé bấm tạm dừng mà bóng vẫn rơi / vẫn tính điểm | có — `tests/t43-game-pause.test.ts` (30 test, ablation M3/M4) + `qa/game-pause.mjs` |
| Test | trần bộ nhớ / deterministic | `Math.random` trong data builder | có — `TEST_PLAN.md` §5 |
| Runtime | sanitizer **whitelist** | field lạ trong `localStorage` | có — `storage.ts:782`, `:1460` |
| Runtime | `writeJSON → boolean` | ghi hỏng bị im lặng | có — T41C |
| Cloud | `firestore.rules` | đọc/ghi hồ sơ của uid khác | có file, **chưa test end-to-end** (mock thôi) |

**Đếm sensor:** 3 hook · 4 workflow · 89 test file / 1278 test · 30 probe · 1 rules file.

## 3. Memory — cái nhớ giữa các phiên (và vì sao nó gọn)

| Bộ nhớ | Đường | Số dòng index | Nội dung |
|---|---|---|---|
| User-scope | `~/.qoder/memory/MEMORY.md` | **3** | cách làm việc cá nhân: push sau cổng xanh · số phải đo lại · "chưa mượt" = lỗi luồng tương tác |
| Project-scope | `~/.qoder/projects/…/memory/MEMORY.md` | **5** | hazard lane chung (xoá lockfile) · đổi chuỗi UI làm probe đỏ · `measure.mjs` cần log không ANSI · docs dẫn số dòng bị trôi · verify đỏ vì timeout giả |

Rule gọn: **memory không chứa thứ suy ra được từ code**. Không ghi kiến trúc, không ghi đường dẫn file,
không ghi bài fix đã commit. Ghi ba loại: *thói quen của người*, *cái bẫy đã đau*, *cái sẽ sai sau 3 tháng*.

## 4. Khoảng trống đã biết (không dấu)

| # | Hổng | Rủi ro | Đang chặn bằng | Đóng ở |
|---|---|---|---|---|
| H-1 | Không có gate chặn **nội dung trẻ** lọt ra output agent | lộ dữ liệu cá nhân | advisory `AGENTS.md` §1.7 + `progress/` gitignore + evidence dùng hồ sơ giả | `CHECKLIST.md` C-07 · `09` §2 mục 1.5 |
| H-2 | Không có PR thật ⇒ G-2 "review ở phiên độc lập" dựa vào người, không vào nền tảng | một người vừa viết vừa duyệt | sub-agent `kbt-reviewer` chỉ-đọc | `09` §4 mục 3.1 |
| H-3 | `firestore.rules` chưa được test end-to-end | quyền chỉ chắn trên giấy một nửa | mock test + đọc rules | T41D |
| H-4 | Probe deep-flow flaky vì timing | bỏ sót lỗi hoặc tốn công vô ích | chạy lại 1 lần + dán `errors[]`/`failedAt` (`TEST_PLAN.md` §5) | `09` §4 mục 3.2 (nightly) |
| H-5 | Không có mutation tự động | test không bắt được lỗi tinh vi | ablation thủ công cho rule then chốt (5 phép đã chạy: M1…M5) | `CHECKLIST.md` C-08 |

## 5. Mapping khi sang công cụ khác

Tiêu chí nghiệm thu của khóa học kiểm `.claude/`. Repo này chạy trên Qoder, nên cơ chế tương đương
nằm ở `.qoder/`:

| Khóa học dùng | Repo này | Cùng vai trò |
|---|---|---|
| `.claude/skills/<name>/SKILL.md` | `.qoder/skills/kho-bau-change/SKILL.md` | Guide — quy trình đóng gói |
| `.claude/agents/<name>.md` | `.qoder/agents/kbt-reviewer.md` | Sensor mềm — reviewer chỉ-đọc |
| `.claude/CLAUDE.md` | `AGENTS.md` | README cho agent, nạp tự động |
| memory file | `~/.qoder/memory` + `~/.qoder/projects/…/memory` | nhớ giữa phiên |
