# TEST_CASES — Catalog ca kiểm thử
## KHO BÁU TRI THỨC — LỚP 1 (mã tài liệu KBT-TC-1.0)

> **Owner:** người giữ repo (`ducmanh2802`) · **Ngày chốt:** 2026-11-02 · commit đo: `d54f341`
> Nguồn yêu cầu: [`SRS.md`](../specs/SRS.md) · truy vết: [`RTM.md`](../specs/RTM.md) §10 ·
> kế hoạch kiểm thử: [`TEST_PLAN.md`](TEST_PLAN.md) · bằng chứng: [`evidence/`](../../evidence/README.md)

Ba rule của tài liệu này (từ `docs/SDLC.md` §1 giai đoạn 4 và `docs/lifecycle/06_VERIFICATION_VALIDATION.md`):

1. **Oracle là của người, không của máy.** Expected của mỗi TC lấy từ AC trong bảng US ở §2,
   do người giữ repo duyệt; code chỉ là *nơi đo*, không được dùng để tự định nghĩa đúng.
2. **Verdict chỉ có sau khi chạy.** Bốn giá trị: `Pass` · `Fail` · `Blocked` · `NotRun`.
   `NotRun` **không phải** `Pass` và phải kèm lý do.
3. **Một TC phải bắt được lỗi.** TC nào cũng phải nói được "sửa sai chỗ nào thì dòng này đỏ".
   Hai TC đã kiểm chứng bằng cách tạm bỏ dòng kiểm (`§4`), không chỉ đoán.

---

## 1. Exit criteria — viết trước khi chạy

Áp cho lát cắt §2–§4. Ghi trước, không sửa sau khi thấy kết quả.

| # | Tiêu chí | Ngưỡng | Đo bằng |
|---|---|---|---|
| E-1 | Toàn bộ TC của lát cắt có verdict | 0 TC `NotRun` | đếm cột Verdict §3 |
| E-2 | Cổng chất lượng | `npm run verify` EXIT=0 | `evidence/2026-11-02-T41C/verify.txt` |
| E-3 | Test đơn vị + hợp đồng nguồn của lát cắt | 25/25 pass | `evidence/2026-11-02-T41C/mutation-baseline-t41c.txt` |
| E-4 | Probe Playwright trên `dist/` thật | 0 console error ở 3 probe | `evidence/2026-11-02-T41C/probe-*.json` |
| E-5 | Không chặn quá mức | có TC chứng minh hai lượt thật **vẫn** được tính 2 lần | TC-04, TC-13 |
| E-6 | Bằng chứng nhìn thấy được khi đổi UI | 2 ảnh trước/sau của cùng một màn | `game-rewards-on.png`, `game-rewards-off.png` |
| E-7 | Test bắt được lỗi | ≥1 phép ablation làm đỏ đúng test cần đỏ | §4, 2 phép |

---

## 2. Tầng User Story (US) — lát cắt "Chống ghi trùng & biên lai thưởng"

Lát cắt chọn theo tiêu chí của khóa học: một hành trình dọc, đụng cả 5 tầng idempotency
(evidence id · first-seen · nonce · completion · reward) và có bằng chứng thật.
FR/NFR nguồn: `FR-G04`, `FR-G07`, `FR-R04`, `FR-R05`, `FR-M05`, `FR-P01`, `NFR-R04`, `NFR-M04`.

| US | Ai · Tôi muốn · Để | FR/NFR | AC nhánh chính | AC nhánh biên | AC nhánh lỗi |
|---|---|---|---|---|---|
| US-01 | Bé · chơi lại một màn đã đạt sao rồi · để lượt luyện vẫn có ý nghĩa mà không farm Sao. | FR-G04, FR-G07, NFR-R04 (reward) | Màn mới hoặc phá kỷ lục ⇒ cộng đúng phần chênh Sao + XP. | Chơi lại **không** phá kỷ lục ⇒ `+0 Sao` nhưng vẫn `+XP` luyện tập; hai id thưởng khác nhau không cộng dồn. | Cùng một lượt gửi hai lần ⇒ lần hai trả 0 và màn hình nói "đã nhận ở lượt trước". |
| US-02 | Bé · bấm đáp án hai lần vì lag hoặc vì hiệu ứng chạy hai lần · để tiến độ không bị tính hai lần. | FR-R05, NFR-R04 (evidence id) | Cú trả lời có `evidenceId` mới ⇒ analytics +1, mastery +1. | Hai `evidenceId` khác nhau ⇒ tính 2 lượt (không chặn quá mức). | `evidenceId` lặp ⇒ analytics, mastery, `recentErrors` đều đứng nguyên. |
| US-03 | Bé · mở lại bảng tổng kết giữa buổi đọc · để hồ sơ kỹ năng chỉ nhận buổi đọc **một** lần. | FR-R04, NFR-R04 (completion) | Buổi đọc có `sessionId` mới ⇒ cộng dồn attempts/accuracy bình thường. | Danh sách id đã gập bị trần ở `READING_POLICY.MAX_RECENT_SESSIONS` = 30 (`src/config/policy.ts:110`). | `sessionId` lặp ⇒ `applySession` trả nguyên hồ sơ cũ; id đã gập sống qua một lần đọc lại hồ sơ. |
| US-04 | Bé · máy hết chỗ lưu (Safari riêng tư) · để chuỗi ngày không nhảy lung tung và khiên không bị tiêu mất. | FR-M05, NFR-R01, NFR-R04 | Ghi được ⇒ bước ngày cộng đúng 1, đọc lại không cộng thêm. | Sau nhiều lần đọc vẫn chỉ 1 bước. | `setItem` ném ⇒ `writeJSON` trả `false`, bước ngày **hoàn tác**, khiên không bị tiêu, biên lai thưởng không ghi non. |
| US-05 | Ba mẹ · tắt quỹ thưởng · để con không nhận tín hiệu "được thưởng" khi nhà đã tắt. | FR-P01, NFR-M04 | Bật thưởng ⇒ dải kết quả in đúng số vừa vào túi. | Khung hình đầu (chưa có biên lai) vẫn in số đề xuất khi thưởng đang bật. | Tắt thưởng ⇒ màn hình không còn dòng `+N Sao`/`+N XP`, thay bằng dải giải thích có `data-testid`. |

---

## 3. Catalog ca kiểm thử (TC)

Cột "Bằng chứng" trỏ tới file chạy được. Cột "Giết bởi" trả lời rule 3: đổi gì thì TC đỏ.

| TC | US / AC | Loại | Oracle (expected) | Bằng chứng | Giết bởi | Verdict |
|---|---|---|---|---|---|---|
| TC-01 | US-02 / chính | unit | `evidenceId` lặp chỉ tính 1 lần trên analytics + mastery | [`tests/t41c-idempotency.test.ts:118`](../../tests/t41c-idempotency.test.ts#L118) | bỏ khoá `evidenceId` trong `recordQuestionAnswer` | Pass |
| TC-02 | US-02 / lỗi | unit | quest ngày không nhận cú trả lời thứ hai | `tests/t41c-idempotency.test.ts:127` | ghi quest trước phép thử đã lưu | Pass |
| TC-03 | US-02 / lỗi | unit | câu sai lặp không đẩy lần hai vào `recentErrors` | `tests/t41c-idempotency.test.ts:134` | bỏ điều kiện chặn bản ghi trùng | Pass |
| TC-04 | US-02 / biên | unit | hai id khác nhau vẫn tính 2 lượt | `tests/t41c-idempotency.test.ts:146` | chặn theo nội dung thay vì theo id | Pass |
| TC-05 | US-03 / lỗi | unit | `finishSession` trùng `sessionId` không nhân đôi attempts | [`tests/t41c-idempotency.test.ts:164`](../../tests/t41c-idempotency.test.ts#L164) | bỏ guard `src/services/readingEngine.ts:320` → **đã chứng minh §4 M1** | Pass |
| TC-06 | US-03 / chính | unit | buổi đọc mới vẫn cộng dồn bình thường | `tests/t41c-idempotency.test.ts:180` | guard chặn mọi session (kể cả id mới) | Pass |
| TC-07 | US-03 / biên | unit | danh sách id đã gập sống qua một lần đọc lại | `tests/t41c-idempotency.test.ts:187` | xoá `appliedSessionIds` khỏi whitelist sanitizer `src/services/storage.ts:782` | Pass |
| TC-08 | US-04 / lỗi | unit | ghi thất bại ⇒ streak + `lastActiveDate` giữ nguyên sau nhiều lần đọc | `tests/t41c-idempotency.test.ts:198` | bỏ hoàn tác khi `saveChildProfile` trả `false` | Pass |
| TC-09 | US-04 / chính | unit | lưu được ⇒ cộng đúng 1 lần, đọc lại không cộng thêm | `tests/t41c-idempotency.test.ts:213` | so ngày bằng chuỗi UTC thay vì lịch địa phương | Pass |
| TC-10 | US-04 / lỗi | unit | khiên chỉ bị tiêu sau khi bước ngày đã lưu chắc | `tests/t41c-idempotency.test.ts:224` | tiêu khiên trước khi ghi | Pass |
| TC-11 | US-01 / lỗi | unit | hai cú gửi của cùng một lượt chỉ trả một lần | [`tests/t41c-idempotency.test.ts:261`](../../tests/t41c-idempotency.test.ts#L261) | bỏ guard `src/services/storage.ts:2140` → **đã chứng minh §4 M2** | Pass |
| TC-12 | US-01 / lỗi | unit | quest không nhận lượt chơi thứ hai từ một cú gửi trùng | `tests/t41c-idempotency.test.ts:277` | như TC-11 | Pass |
| TC-13 | US-01 / biên | unit | nonce mới = lượt chơi thật ⇒ vẫn trả thưởng | `tests/t41c-idempotency.test.ts:291` | khoá biên lai bỏ hẳn `nonce` | Pass |
| TC-14 | US-01 / biên | unit | biên lai sống qua một lần đọc lại (whitelist của sanitizer) | `tests/t41c-idempotency.test.ts:299` | xoá `rewardClaims` khỏi whitelist `src/services/storage.ts:1460` | Pass |
| TC-15 | US-01 / lỗi | unit | lưu thất bại thì không ghi biên lai non | `tests/t41c-idempotency.test.ts:306` | ghi `rewardClaims` trước khi biết `writeJSON` thành công | Pass |
| TC-16 | US-02 / hợp đồng | source-contract | phần trailing của `recordQuestionAnswer` đứng sau phép thử đã ghi được | `tests/t41c-idempotency.test.ts:319` | đảo thứ tự `if (!recorded) return;` (`src/services/storage.ts:1686`) | Pass |
| TC-17 | US-04 / hợp đồng | source-contract | bước ngày chỉ hoàn tác khi `saveChildProfile` báo ghi hỏng | `tests/t41c-idempotency.test.ts:327` | đổi `writeJSON` thành `void` | Pass |
| TC-18 | US-04 / hợp đồng | source-contract | `writeJSON` trả "đã lưu được chưa" thay vì nuốt lỗi | `tests/t41c-idempotency.test.ts:334` | bỏ `return false` trong khối `catch` | Pass |
| TC-19 | US-01 / chính | UI (SSR) | biên lai thật in đúng số vừa vào túi (`+2 Sao`, `+8 XP`) | [`tests/t41c-idempotency.test.ts:350`](../../tests/t41c-idempotency.test.ts#L350) | cho dải thưởng fallback `earnedStars` khi có biên lai | Pass |
| TC-20 | US-01 / biên | UI (SSR) | chơi lại không phá kỷ lục: in XP, **giấu** dòng Sao 0 | `tests/t41c-idempotency.test.ts:356` | `stars > 0 \|\| xp > 0` đổi thành `xp >= 0` | Pass |
| TC-21 | US-01 / lỗi | UI (SSR) | biên lai trùng ⇒ không còn dải `+0 Sao +0 XP` | `tests/t41c-idempotency.test.ts:362` | bỏ cờ `duplicate` trong `GameRewardReceipt` | Pass |
| TC-22 | US-05 / lỗi | UI (SSR) | tắt quỹ thưởng ⇒ không kịp hứa Sao ở khung hình đầu | `tests/t41c-idempotency.test.ts:373` | bỏ `rewardsEnabled` khỏi `GameRewardStrip` (`src/components/games/GameModalWrapper.tsx:107`) | Pass |
| TC-23 | US-05 / biên | UI (SSR) | khung hình đầu chưa có biên lai vẫn in số đề xuất khi thưởng bật | `tests/t41c-idempotency.test.ts:379` | luôn chờ biên lai ⇒ mất phản hồi tức thì | Pass |
| TC-24 | US-05 / hợp đồng | UI (SSR) | dải muted có `data-testid="game-rewards-muted"` để probe không dựa vào màu | `tests/t41c-idempotency.test.ts:384` | đổi `data-testid` | Pass |
| TC-25 | US-01 / hợp đồng | source-contract | không còn công thức `receipt?.stars ?? earnedStars` trong wrapper | `tests/t41c-idempotency.test.ts:397` | viết lại công thức fallback cũ | Pass |
| TC-26 | US-01 / lỗi | e2e probe | chơi lại màn đã đạt trên `dist/` thật không cộng thưởng hai lần | [`evidence/2026-11-02-T41C/probe-t32-game-replay-evidence.json`](../../evidence/2026-11-02-T41C/probe-t32-game-replay-evidence.json) — `ok:true`, 5 bước, 0 lỗi | `qa/t32-game-replay-evidence.mjs` | Pass |
| TC-27 | US-05 / lỗi | e2e probe | công tắc thưởng của ba mẹ chặn tiêu Sao trên build thật | [`evidence/2026-11-02-T41C/probe-parent-controls.json`](../../evidence/2026-11-02-T41C/probe-parent-controls.json) — `ok:true`, 7 bước, 0 lỗi | `qa/parent-controls.mjs` | Pass |
| TC-28 | US-01…05 / hồi quy | e2e probe | luồng chính của bé không vỡ sau đợt sửa | [`evidence/2026-11-02-T41C/probe-golden-path.json`](../../evidence/2026-11-02-T41C/probe-golden-path.json) — 28 bước, 0 lỗi, `removals: []` | `qa/golden-path.mjs` | Pass |
| TC-29 | US-01 / chính | e2e ảnh | màn "VƯỢT QUA MÀN 1!" bật thưởng in `+3 Sao` `+10 XP`; tắt thưởng in dải xanh không hứa Sao | `game-rewards-on.png` · `game-rewards-off.png` (cùng thư mục evidence) | nhìn bằng mắt + TC-19/22 | Pass |

**Đếm** (đo bằng `grep -c "^| TC-" docs/plan/TEST_CASES.md` = 29):
29 TC — 15 unit · 4 source-contract · 6 UI (SSR) · 3 e2e probe · 1 e2e ảnh.
Verdict: **29 Pass · 0 Fail · 0 Blocked · 0 NotRun** trong phạm vi lát cắt.

---

## 4. Test có bắt được lỗi không — hai phép ablation đã chạy

Không dùng điểm coverage làm chứng cứ. Cách kiểm: **tạm bỏ đúng dòng kiểm chứng**, chạy lại test,
test phải đỏ vì **đúng nguyên nhân**, rồi hoàn tác.

| # | Dòng bị bỏ | Test phải đỏ | Kết quả thật | Log |
|---|---|---|---|---|
| M1 | `src/services/readingEngine.ts:320` — guard `appliedSessionIds` | TC-05 `finishSession trùng sessionId không nhân đôi attempts của bậc` | `Tests 1 failed \| 24 skipped (25)` · EXIT=1 | [`mutation-M1-session-guard.txt`](../../evidence/2026-11-02-T41C/mutation-M1-session-guard.txt) |
| M2 | `src/services/storage.ts:2140` — guard `rewardClaims` | TC-11 + TC-12 | `Tests 2 failed \| 23 passed (25)` · EXIT=1 | [`mutation-M2-reward-claim-guard.txt`](../../evidence/2026-11-02-T41C/mutation-M2-reward-claim-guard.txt) |
| — | hoàn tác cả hai | toàn bộ lát cắt | `Tests 25 passed (25)` · EXIT=0 | [`mutation-baseline-t41c.txt`](../../evidence/2026-11-02-T41C/mutation-baseline-t41c.txt) |

Lệnh tái lập (chạy trên máy sạch, `git checkout -- <file>` ngay sau đó):

```bash
# M1 — bỏ dòng guard trong readingEngine.applySession
npx vitest run tests/t41c-idempotency.test.ts -t "finishSession trùng"   # phải EXIT=1
# M2 — đổi điều kiện ở storage.ts:2140 thành `if (false && …)`
npx vitest run tests/t41c-idempotency.test.ts                            # phải đỏ đúng TC-11 + TC-12
git checkout -- src/services/readingEngine.ts src/services/storage.ts
npx vitest run tests/t41c-idempotency.test.ts                            # phải EXIT=0, 25 passed
```

---

## 5. Ngoài lát cắt — ghi rõ NotRun, không tô hồng

| Vùng | TC | Verdict | Lý do / điều kiện để chuyển Pass |
|---|---|---|---|
| Thi thử (FR-E01…E11) | chưa có US/TC riêng | `NotRun` | Đã có `tests/exam-fidelity.test.ts`, `qa/question-types.mjs` nhưng chưa tách AC thành 3 nhánh. Cần một phiên viết US cấp đề thi. |
| Cờ vua 3D / WebGL fallback (FR-C06) | chưa có US/TC riêng | `NotRun` | Có `tests/t38-webgl-fallback.test.ts` + ảnh; chưa có TC cho nhánh "người dùng tắt WebGL thật trên máy". |
| Tiếng Anh Kid's Box (FR-N04, FR-P08) | — | `Blocked` | Chặn ở **nguồn giáo trình**, không chặn ở code — xem `RTM.md` §8. |
| Quyền truy cập chéo giữa hai tài khoản (kiểu test A/B của khóa học) | chưa có | `NotRun` | App chạy 100% `localStorage`, chưa có server tài nguyên ⇒ không tồn tại "tài khoản B" để mà kiểm. Chỉ áp dụng được nếu bật `cloudSync` thật (T41D). |
| UAT Given/When/Then với phụ huynh thật | chưa có | `NotRun` | Cần người dùng thật; repo chưa có telemetry aggregate (BG-01, ADR-01). |

---

## 6. Cách cập nhật

1. Thêm FR/NFR trong `SRS.md` ⇒ thêm US ở §2 (đủ 3 nhánh AC) rồi mới thêm TC ở §3.
2. TC chỉ chuyển `NotRun` → `Pass` khi có **file bằng chứng thật** trong `tests/`, `qa/` hoặc `evidence/`.
3. Sửa code mà không TC nào đỏ ⇒ hoặc TC đó không bắt được lỗi, hoặc thay đổi không hành vi — phải nói rõ điều nào.
4. Số ở dòng "Đếm" chỉ được đổi sau khi chạy `grep -c "^| TC-" docs/plan/TEST_CASES.md`.
