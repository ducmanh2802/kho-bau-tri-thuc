# Glossary — từ ngữ dùng thống nhất trong repo
## Pha 1 (Intake) · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày:** 2026-11-03
**Vì sao có file này:** `step-by-step-guidance.md` §A2 bắt đồng bộ thuật ngữ *trước* khi chạy prompt —
nếu không, mỗi phiên agent lại bịa một từ đồng nghĩa và chuỗi truy vết đứt. Mỗi dòng dưới đây phải mở
được tới **một nơi có thật** trong repo.

---

## 1. Thuật ngữ sư phạm / sản phẩm

| Term | Nghĩa | Nơi định nghĩa thật |
|---|---|---|
| Bậc (tier) | Độ khó 1…`MAX_TIER` của một trò chơi, bé mở dần bằng sao | `GAME_LEVEL_POLICY` (`src/config/policy.ts`), `useGameStage` (`src/hooks/useGameStage.ts`) |
| `unlockedTier` | Bậc cao nhất bé đã mở; **không** được tăng khi bé chỉ *chọn* màn chơi | `src/services/storage.ts` (`selectGameTier`), `src/components/games/GamesHubScreen.tsx` |
| Sao / XP | Phần thưởng một lượt đúng (tối đa 3 sao) và điểm kinh nghiệm tích luỹ | `src/services/storage.ts`, `src/services/levelEngine.ts` |
| nonce | Số hạt giống để xáo đề; đổi khi bé bấm "làm lại", **không** đổi khi chỉ mở màn | `src/services/storage.ts` (`kho_bau_game_nonce`), `useGameStage` |
| Tất định (deterministic) | Cùng `(tier, seed)` ⇒ cùng bộ đề; cấm `Math.random`/`Date.now` trong builder | `src/data/gameLevels.ts` (`seededRng`, `shuffleSeeded`, `pickDistinct`), `AGENTS.md` §2 |
| Ôn câu sai | Vòng lặp đưa lại câu bé từng sai vào phiên sau | `src/services/learningOS.ts`, key `kho_bau_review_days` |
| Learning OS | Máy trạng thái phiên học: bằng chứng, mệt, phiên có thể resume | `src/services/learningOS.ts`, `src/services/decisionEngine.ts` |
| Decision Engine | Bộ quyết định "bước tiếp theo tốt nhất" cho bé | `src/services/decisionEngine.ts`, thẻ `NextBestActionCard` |
| Cổng Xác Nhận Phụ Huynh | Phép tính đơn giản chặn bé vào màn ba mẹ | `src/components/parent/ParentDashboardModal.tsx:347` |
| Kid's Box | Nội dung Tiếng Anh theo giáo trình companion | `src/services/kidBoxEngine.ts`, `docs/ENGLISH_KIDBOX_COMPANION.md` |
| Trò chơi đăng ký đủ 4 nơi | Bất biến: catalog + registry + policy + `qa/games.mjs`, tên tiếng Việt khớp | `AGENTS.md` §2, `tests/t23-mcp-servers.test.ts` |

## 2. Thuật ngữ kỹ thuật / quy trình

| Term | Nghĩa | Nơi định nghĩa thật |
|---|---|---|
| Cổng (gate) | Chuỗi lệnh bắt buộc xanh trước khi nói "xong": `npm run verify` | `AGENTS.md` §1.1, `docs/SDLC.md` §4 |
| Entry chunk | `index-<hash>.js` tải ngay lần mở trang; có trần kB | `npm run check:budget`, `scripts/check-bundle-budget.mjs` |
| Boot graph | Tổng kB mọi asset mà `dist/index.html` nạp trước tương tác đầu | lệnh đo ghi ở `docs/lifecycle/README.md` §2 |
| Probe QA | Script Playwright trong `qa/` mở app thật và kiểm hành vi nhìn thấy được | `node qa/run-one.mjs qa/<probe>.mjs`; danh mục probe ở `docs/plan/TEST_PLAN.md` §6 |
| Ablation | Tắt/đổi đúng một dòng sửa ⇒ test phải **đỏ**; chứng minh test bắt được lỗi | `evidence/<đợt>/ablation-*.txt` |
| Bằng chứng mở được | File nằm trong `evidence/<đợt>/`, tái tạo lại bằng lệnh ghi trong đó | `evidence/README.md` §3, `step-by-step-guidance.md` §A6 |
| Baseline | Commit `main` (kèm tag) mà tài liệu/phase chốt theo | `docs/SDLC.md` §6 |
| Đợt (`T<NN>`) | Một thay đổi end-to-end: brief → test RED → sửa → cổng → evidence → docs → push | `docs/plan/TASK_PLAN.md` |
| Lane | Phiên làm việc dùng chung một working tree; ghi vùng mình đụng vào `.ai/CURRENT.md` | `AGENTS.md` §1.5 |
| `stateTouchedAt` | Mốc thời gian *dữ liệu thật* thay đổi, dùng làm đồng hồ hợp nhất cloud (khác `lastActiveDate`) | `src/types/index.ts`, `src/services/cloudMerge.ts` |
| LWW | Last-write-wins: bản ghi có mốc mới hơn thắng khi gộp cloud | `src/services/cloudMerge.ts`, `lwwFingerprint` trong `storage.ts` |

## 3. Quy ước viết

- Tên kỹ thuật để nguyên (`localStorage`, `chunk`, `probe`); **mô tả** bằng tiếng Việt có dấu.
- Số liệu chỉ được viết kèm **lệnh đo**; không có lệnh ⇒ tham chiếu về `docs/lifecycle/README.md` §2.
- Số kB trong tài liệu là **KiB** (`check:budget` chia 1024 nhưng in nhãn `kB`) — nói ra thì phải nói rõ.
- Khi cần trích dẫn chữ Hán/Nhật trong bug report, ghi **mã codepoint** (`U+5D29`), không dán glyph
  (kẻ soát chữ `vietnamese-text-integrity-check` sẽ báo đỏ).
