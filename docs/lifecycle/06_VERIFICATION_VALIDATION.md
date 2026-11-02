# 06 — Verification & Validation
## Kiểm chứng & nghiệm thu · Kho Báu Tri Thức — Lớp 1

**Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit `d54f341`
**Kế hoạch:** [`../plan/TEST_PLAN.md`](../plan/TEST_PLAN.md) (10 lớp) · **ca kiểm thử:**
[`../plan/TEST_CASES.md`](../plan/TEST_CASES.md) · **bằng chứng:** [`evidence/`](../../evidence/README.md)

---

## 1. Oracle — người quyết "đúng là gì"

Expected của mỗi TC lấy từ **AC trong `TEST_CASES.md` §2**, không lấy từ kết quả chạy code.
Ba rule đang áp:

1. AC viết trước, gồm đủ 3 nhánh (chính / biên / lỗi). Nhánh *lỗi* là nhánh hay bị bỏ nhất và cũng
   là nhánh đã tìm ra bug thật trong T41C (UI hứa `+0 Sao`).
2. AI được phép **sinh** test từ AC đã duyệt, không được phép **đặt** expected.
3. Khi không có AC (refactor, đổi tên), dùng characterization test (§4 ở `08_MAINTENANCE_EVOLUTION.md`).

## 2. Ngưỡng kết luận — viết trước khi chạy

Bảy exit criteria của lát cắt hiện hành ghi tại `TEST_CASES.md` §1, chốt **trước** khi chạy.
Không sửa ngưỡng sau khi thấy số.

## 3. Verdict — 4 giá trị, `NotRun` không phải `Pass`

| Verdict | Nghĩa | Đếm trong lát cắt | Đếm toàn repo |
|---|---|---|---|
| `Pass` | đã chạy, đạt ngưỡng, có file bằng chứng | 42 (hai lát cắt) | 86/88 FR · 24/25 NFR |
| `Fail` | đã chạy, không đạt | 0 | 2 FR (FR-N04, FR-P08 — cùng nguyên nhân: thiếu nguồn giáo trình) |
| `Blocked` | không chạy được vì điều kiện ngoài code | 1 vùng (Kid's Box) | — |
| `NotRun` | chưa chạy | 6 vùng (`TEST_CASES.md` §5) | **Pha Release cả pha** — `git tag` rỗng |

Bảng FR/NFR đầy đủ: `RTM.md` §8.

## 4. Bộ test có bắt được lỗi không

Không dùng % coverage làm chứng cứ. Cách kiểm đã chạy thật: **ablation** — tạm bỏ dòng kiểm chứng,
test phải đỏ vì đúng nguyên nhân, rồi hoàn tác.

| Phép | Dòng bỏ | Test phải đỏ | Kết quả | Log |
|---|---|---|---|---|
| M1 | `readingEngine.ts:320` guard `appliedSessionIds` | TC-05 | `1 failed \| 24 skipped`, EXIT=1 | `mutation-M1-session-guard.txt` |
| M2 | `storage.ts:2140` guard `rewardClaims` | TC-11, TC-12 | `2 failed \| 23 passed`, EXIT=1 | `mutation-M2-reward-claim-guard.txt` |
| — | hoàn tác M1+M2 | toàn bộ lát cắt 1 | `25 passed`, EXIT=0 | `mutation-baseline-t41c.txt` |
| M3 | `useGameStage.ts:24` bỏ `!s.pausedByUser` | TC-30, TC-32 | `2 failed \| 28 passed`, EXIT=1 | `mutation-M3-clock-decision.txt` |
| M4 | `useGameStage.ts:139` bỏ một guard `if (!isRunning) return;` | TC-36 | `1 failed \| 29 passed`, EXIT=1 | `mutation-M4-score-guard.txt` |
| — | hoàn tác M3+M4 | lát cắt 2 | `30 passed`, EXIT=0 | chạy lại `npx vitest run tests/t43-game-pause.test.ts` |
| M5 | `useGameStage.ts` — **lùi** guard của `submitWrong` xuống sau `setMistakesInTier` (không bỏ dòng nào; sinh ra từ review 4 lớp vì test cũ chỉ đếm guard `>= 2`) | TC-36 | `1 failed \| 29 passed`, EXIT=1 | `mutation-M5-guard-position.txt` |
| — | hoàn tác M5 + siết hợp đồng theo vị trí | lát cắt 2 | `30 passed`, EXIT=0 | chạy lại `npx vitest run tests/t43-game-pause.test.ts` |
| M6 | `cloudSync.ts` + `firebase.ts` **trở về HEAD** (git show, không sửa tay) — tức bỏ hàng đợi + `authEpoch` + mute + `AuthChangeSource` | `tests/t41d-cloud-sync-race.test.ts` — **5** test đỏ đúng năm hành vi: đăng xuất giữa lúc kéo, hai thao tác cloud chồng nhau, tự nổ auto-sync vòng lặp, SDK hỏng bị hiểu là đăng xuất, `setState` trả object cũ | `Tests 5 failed \| 7 passed (12)` · EXIT=1 | [`mutation-M6-cloud-sync-revert.txt`](../../evidence/2026-11-03-T41D/mutation-M6-cloud-sync-revert.txt) |
| — | hoàn tác M6 (khôi phục bản T41D) | hai file test T41D | `Tests 40 passed (40)` · EXIT=0 | [`t41d-tests-green.txt`](../../evidence/2026-11-03-T41D/t41d-tests-green.txt) |

Hai test cho kết quả **giống nhau ở cả hai bản** ("không có `synced` khi user rỗng", "kết quả uid cũ
không được gán cho uid mới") là bất biến phòng vệ, không phải bằng chứng ablation — ghi rõ để lần sau
không tưởng nhầm cả 12 test đều biết đỏ.

Công cụ mutation chạy tự động (Stryker…) **chưa** được tích hợp — thêm dependency phải hỏi trước
(`AGENTS.md` §1.4), nên dùng ablation thủ công cho các rule then chốt. Số phép ablation đã chạy: **6**
(M1…M6, ba lát cắt).

## 5. Test ở đâu trong pipeline

| Tầng | Chạy khi | Nội dung | Mất bao lâu |
|---|---|---|---|
| Pre-commit | mỗi commit | typecheck | giây |
| Pre-push | mỗi push | `verify:quick` | ~1 phút |
| PR/push (workflow 01) | mỗi push/PR | typecheck + `test:ci` (1327 test) | 22.32 s cho phần test (`evidence/2026-11-03-T41D/verify-t41d.txt`) |
| Build (workflow 02) | mỗi push/PR | build + `check:budget` | phút |
| Browser (workflow 03) | mỗi push/PR | probe Playwright trên `dist/` | phút |
| Release (workflow 04) | tag `v*.*.*` | build artifact + zip + GitHub Release | **chưa từng chạy** (không có tag) |
| Nightly / E2E dài / eval / mutation định kỳ | — | **chưa có** | xem `CHECKLIST.md` C-05 |

## 6. Eval — phần chưa làm và vì sao ghi rõ

Khóa học đòi eval báo `pass^k` và judge phải hiệu chỉnh với người chấm. Repo này **không có**
đường eval đó, và đó là lựa chọn có chủ đích ở giai đoạn này:

| Hạng | Trạng thái | Lý do |
|---|---|---|
| AI chấm điểm bài của bé | **Cấm** (ADR-04) | một model không được quyết đáp án đúng/sai của kiến thức lớp 1 |
| Golden set nội dung | có một phần | `tests/content-quality.test.ts`, `qa/p41-curriculum-quality.mjs`, `tests/exam-fidelity.test.ts` — validator tất định, không phải LLM judge |
| `pass^k` cho output AI | `NotRun` | chỉ áp dụng khi bật đường sinh nội dung bằng AI (docs/GOOGLE_AI_STUDIO_RUNBOOK.md) — chưa nằm trong phạm vi phát hành |
| Judge hiệu chỉnh với người | `NotRun` | cần ≥2 người chấm thật; chưa có |

## 7. Validation — kiểm bằng người

Máy không nghiệm thu được phần "hợp với trẻ 6 tuổi". Bảng bắt buộc ở `TEST_PLAN.md` §11
(đọc to ≥1 bài/môn, tìm nhãn tiêu cực, nút đủ to, thẩm mỹ bàn cờ ở 390 px và 1440 px).
Kết quả các phiên audit người: `docs/opencode/reports/` (39 báo cáo) và `docs/AUDIT_REPORT.md`.

**UAT Given/When/Then** — mẫu cho lát cắt hiện hành, chưa có người thật chạy:

```gherkin
Feature: Biên lai thưởng của một lượt chơi
  Scenario: Bé chơi lại màn đã đạt đủ sao
    Given  bé đã đạt 3 sao ở màn «Khởi Động» của trò Đọc Câu Làm Theo
    When   bé chơi lại và không phá kỷ lục
    Then   màn kết quả không hiện dòng "+0 Sao"
    And    vẫn hiện "+<n> XP" cho lượt luyện tập
    And    số Sao trong túi không đổi
```

## 8. Flaky — chẩn đoán, không tăng retry

`TEST_PLAN.md` §5 ghi hai nguồn đỏ giả đã bắt được: (a) probe deep-flow thỉnh thoảng đỏ vì timing
⇒ chạy lại **một** lần rồi mới kết luận, và phải dán `errors[]` + `failedAt`; (b) test O(n²) xanh khi
chạy cô lập nhưng vượt 20 s trong full suite ⇒ đo riêng rồi cấp timeout cho **đúng test đó**, không
nâng timeout toàn cục. Không có `retry` tự động trong `verify`.
