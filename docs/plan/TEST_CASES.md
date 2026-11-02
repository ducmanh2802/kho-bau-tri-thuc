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
   Sáu TC đã kiểm chứng bằng cách tạm bỏ dòng kiểm (`§4`, sáu phép ablation M1…M6), không chỉ đoán.

---

## 1. Exit criteria — viết trước khi chạy

Áp cho lát cắt §2–§4. Ghi trước, không sửa sau khi thấy kết quả.

| # | Tiêu chí | Ngưỡng | Đo bằng |
|---|---|---|---|
| E-1 | Toàn bộ TC của lát cắt có verdict | 0 TC `NotRun` | đếm cột Verdict §3 |
| E-2 | Cổng chất lượng | `npm run verify` EXIT=0 | `evidence/2026-11-02-T41C/verify.txt` · `evidence/2026-11-02-KBT-ISSUE-43/verify.txt` |
| E-3 | Test đơn vị + hợp đồng nguồn của lát cắt | 25/25 pass (lát cắt 1) · 30/30 pass (lát cắt 2) | `evidence/2026-11-02-T41C/mutation-baseline-t41c.txt` · `evidence/2026-11-02-KBT-ISSUE-43/mutation-M3-clock-decision.txt` |
| E-4 | Probe Playwright trên `dist/` thật | 0 console error ở 4 probe | `evidence/2026-11-02-T41C/probe-*.json` · `evidence/2026-11-02-KBT-ISSUE-43/probe-game-pause.json` (12 bước, `errors: []`) |
| E-5 | Không chặn quá mức | có TC chứng minh hai lượt thật **vẫn** được tính 2 lần | TC-04, TC-13 · lát cắt 2: TC-40 (cùng cú chạm lúc **đang chạy** phải xoá bóng) |
| E-6 | Bằng chứng nhìn thấy được khi đổi UI | 2 ảnh trước/sau của cùng một màn | `game-rewards-on.png`, `game-rewards-off.png` · `b3-dang-tam-dung.png`, `d2-cho-tiep-tuc.png` |
| E-7 | Test bắt được lỗi | ≥1 phép ablation làm đỏ đúng test cần đỏ | §4, 6 phép (M1…M6) |

---

## 2. Tầng User Story (US) — hai lát cắt

Lát cắt 1 (US-01…05) chọn theo tiêu chí của khóa học: một hành trình dọc, đụng cả 5 tầng
idempotency (evidence id · first-seen · nonce · completion · reward) và có bằng chứng thật.
FR/NFR nguồn: `FR-G04`, `FR-G07`, `FR-R04`, `FR-R05`, `FR-M05`, `FR-P01`, `NFR-R04`, `NFR-M04`.

Lát cắt 2 (US-06, chạy đầy đủ 6 pha SDLC ngày 2026-11-02) là một hành trình dọc khác: một nút
điều khiển **đã có trong code nhưng chưa từng render**, phải đi từ đồng hồ thuần tuý → render
thật → hợp đồng nguồn → probe trên Chromium → ảnh. FR/NFR nguồn: `FR-G08`, `NFR-A03`, `NFR-A05`.

| US | Ai · Tôi muốn · Để | FR/NFR | AC nhánh chính | AC nhánh biên | AC nhánh lỗi |
|---|---|---|---|---|---|
| US-01 | Bé · chơi lại một màn đã đạt sao rồi · để lượt luyện vẫn có ý nghĩa mà không farm Sao. | FR-G04, FR-G07, NFR-R04 (reward) | Màn mới hoặc phá kỷ lục ⇒ cộng đúng phần chênh Sao + XP. | Chơi lại **không** phá kỷ lục ⇒ `+0 Sao` nhưng vẫn `+XP` luyện tập; hai id thưởng khác nhau không cộng dồn. | Cùng một lượt gửi hai lần ⇒ lần hai trả 0 và màn hình nói "đã nhận ở lượt trước". |
| US-02 | Bé · bấm đáp án hai lần vì lag hoặc vì hiệu ứng chạy hai lần · để tiến độ không bị tính hai lần. | FR-R05, NFR-R04 (evidence id) | Cú trả lời có `evidenceId` mới ⇒ analytics +1, mastery +1. | Hai `evidenceId` khác nhau ⇒ tính 2 lượt (không chặn quá mức). | `evidenceId` lặp ⇒ analytics, mastery, `recentErrors` đều đứng nguyên. |
| US-03 | Bé · mở lại bảng tổng kết giữa buổi đọc · để hồ sơ kỹ năng chỉ nhận buổi đọc **một** lần. | FR-R04, NFR-R04 (completion) | Buổi đọc có `sessionId` mới ⇒ cộng dồn attempts/accuracy bình thường. | Danh sách id đã gập bị trần ở `READING_POLICY.MAX_RECENT_SESSIONS` = 30 (`src/config/policy.ts:110`). | `sessionId` lặp ⇒ `applySession` trả nguyên hồ sơ cũ; id đã gập sống qua một lần đọc lại hồ sơ. |
| US-04 | Bé · máy hết chỗ lưu (Safari riêng tư) · để chuỗi ngày không nhảy lung tung và khiên không bị tiêu mất. | FR-M05, NFR-R01, NFR-R04 | Ghi được ⇒ bước ngày cộng đúng 1, đọc lại không cộng thêm. | Sau nhiều lần đọc vẫn chỉ 1 bước. | `setItem` ném ⇒ `writeJSON` trả `false`, bước ngày **hoàn tác**, khiên không bị tiêu, biên lai thưởng không ghi non. |
| US-05 | Ba mẹ · tắt quỹ thưởng · để con không nhận tín hiệu "được thưởng" khi nhà đã tắt. | FR-P01, NFR-M04 | Bật thưởng ⇒ dải kết quả in đúng số vừa vào túi. | Khung hình đầu (chưa có biên lai) vẫn in số đề xuất khi thưởng đang bật. | Tắt thưởng ⇒ màn hình không còn dòng `+N Sao`/`+N XP`, thay bằng dải giải thích có `data-testid`. |
| US-06 | Bé · đang chơi trò đếm giờ thì có việc cắt ngang · để đồng hồ đứng lại chứ không ăn điểm của bé vì lý do không liên quan bài học. | FR-G08, NFR-A03, NFR-A05 · [KBT-ISSUE-43](../issues/43-game-pause.md) — **SRS chưa có FR cấp riêng cho hành vi "Tạm dừng"** (ứng viên `FR-G10`, chưa cấp nên tổng FR/NFR trong `SRS.md` không đổi; ba ID dẫn ở đây chỉ khung được *chỗ đặt* của tính năng, Oracle thật của từng AC nằm ở cột bên) | Bấm Tạm dừng ⇒ mọi bóng/đồng hồ đứng nguyên, nút đổi thành "Tiếp tục", vùng chơi có lớp phủ "Đang tạm dừng". | Trò **không** có đồng hồ không có nút (27/31 trò); mở lớp phủ "Chọn màn" cũng đóng băng đồng hồ theo cùng một cơ chế; bấm tạm **đang lúc** mở lớp phủ thì đóng lớp phủ vẫn còn tạm. | Đang tạm mà chạm bóng ⇒ không xoá bóng, không nhích câu, không lời khen (`submitCorrect`/`submitWrong` trả sớm); trò không truyền props ⇒ `isPaused === false`, không render nút. |

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
| TC-30 | US-06 / chính | unit | `pausedByUser` ⇒ `isGameClockRunning` trả `false` | [`tests/t43-game-pause.test.ts:65`](../../tests/t43-game-pause.test.ts#L65) | bỏ `!s.pausedByUser` (`src/hooks/useGameStage.ts:24`) → **đã chứng minh §4 M3** | Pass |
| TC-31 | US-06 / biên | unit | lớp phủ "Chọn màn" đang mở ⇒ đồng hồ đứng | [`tests/t43-game-pause.test.ts:69`](../../tests/t43-game-pause.test.ts#L69) | bỏ `!s.overlayOpen` trong `isGameClockRunning` | Pass |
| TC-32 | US-06 / biên | unit | bấm tạm **đang lúc** mở lớp phủ ⇒ nhả lớp phủ vẫn còn tạm (không tự nhả hộ bé) | `tests/t43-game-pause.test.ts:83` | cho `overlayOpen` đè `pausedByUser` (trả `true` khi cả hai từng mở) | Pass |
| TC-33 | US-06 / chính | UI (SSR) | `isPaused` ⇒ nút đổi "Tiếp tục trò chơi" + có lớp phủ "Đang tạm dừng"; chưa tạm ⇒ không lớp phủ | [`tests/t43-game-pause.test.ts:145`](../../tests/t43-game-pause.test.ts#L145), `:138` | wrapper vẫn tự giữ state riêng nên `isPaused` không bao giờ tới từ game | Pass |
| TC-34 | US-06 / biên | UI (SSR) | trò **không** có đồng hồ ⇒ 0 nút tạm, 0 lớp phủ | [`tests/t43-game-pause.test.ts:154`](../../tests/t43-game-pause.test.ts#L154) | bỏ điều kiện `isRealtime` quanh nút | Pass |
| TC-35 | US-06 / hợp đồng | source-contract | wrapper không còn tự giữ `isPaused`; nút gọi thẳng `onTogglePause`; lớp phủ có `data-testid="game-paused-veil"` | `tests/t43-game-pause.test.ts:100`, `:107`, `:112` | thêm lại `const [isPaused, setIsPaused] = React.useState` ⇒ hai nguồn sự thật | Pass |
| TC-36 | US-06 / lỗi | unit | `submitCorrect`/`submitWrong` đều chặn theo `isRunning` (≥ 2 guard) | [`tests/t43-game-pause.test.ts:207`](../../tests/t43-game-pause.test.ts#L207) | xoá một guard `if (!isRunning) return;` → **đã chứng minh §4 M4** | Pass |
| TC-37 | US-06 / hợp đồng | source-contract | 4 trò có đồng hồ truyền đủ `isRealtime`/`isPaused`/`onTogglePause`/`onOverlayOpenChange` và mọi hẹn giờ đọc `stage.isRunning`, không còn so `phase !== 'playing'` trần | `tests/t43-game-pause.test.ts:170`, `:180` | bỏ `isPaused=` khỏi một trò, hoặc để lại phép so `phase` trần | Pass |
| TC-38 | US-06 / biên | unit | catalog: đúng 4 trò `isRealtime` (Đường Đua không bị bỏ quên), bất biến 31 trò không lệch | [`tests/t43-game-pause.test.ts:225`](../../tests/t43-game-pause.test.ts#L225), `:230` | bỏ `isRealtime: true` của `speed_racing` | Pass |
| TC-39 | US-06 / chính | e2e probe | trên `dist/` thật: chưa tạm bóng rơi `3.90391% → 20.5886%`; bấm tạm ⇒ 4 bóng đứng nguyên 1 200 ms + `aria-pressed="true"` + 1 lớp phủ; bấm tiếp ⇒ bóng rơi lại; đường đếm ngược của Đường Đua đứng rồi chạy lại | [`evidence/2026-11-02-KBT-ISSUE-43/probe-game-pause.json`](../../evidence/2026-11-02-KBT-ISSUE-43/probe-game-pause.json) — `ok:true`, 12 bước, 0 lỗi (`qa/game-pause.mjs`) | game giữ `requestAnimationFrame`/`setInterval` không đọc `stage.isRunning` | Pass |
| TC-40 | US-06 / lỗi | e2e probe | đang tạm mà chạm đúng bóng đích ⇒ bóng **còn** mount, nhãn câu không nhích, 0 lời khen — và **đối chứng**: cùng cú `dispatchEvent('click')` lúc đang chạy thì bóng đích biến mất khỏi DOM | probe steps C1 + C2 (cùng file evidence) | bỏ guard `submitCorrect` (chính là M4 nhưng ở build thật); probe hết đối chứng nếu cú chạm nào cũng vô hiệu | Pass |
| TC-41 | US-06 / biên | e2e probe | 0 nút cho "Lật Thẻ Trí Nhớ Vàng", đúng 1 nút cho mỗi 4 trò có đồng hồ, trên build thật | probe steps A1 + A2×4 | truyền `isRealtime` cho mọi trò / cờ catalog sai | Pass |
| TC-42 | US-06 / chính | e2e ảnh | lớp phủ "Đang tạm dừng" che bảng chơi; sau khi bấm tiếp nút trở lại ▶; Đường Đua đang tạm | `b3-dang-tam-dung.png` · `d2-cho-tiep-tuc.png` · `d3-duong-dua-tam-dung.png` | nhìn bằng mắt + TC-33 | Pass |

**Đếm** (đo bằng `grep -c "^| TC-" docs/plan/TEST_CASES.md` = 42):
42 TC — 29 của lát cắt "Chống ghi trùng & biên lai thưởng" (TC-01…29) + 13 của lát cắt
"Nút Tạm dừng trò chơi" (TC-30…42). Theo loại, cả hai lát cắt: 20 unit · 6 source-contract ·
8 UI (SSR) · 6 e2e probe · 2 e2e ảnh (đo bằng `grep -c` trên cột "Loại", không đếm tay).
Verdict: **42 Pass · 0 Fail · 0 Blocked · 0 NotRun** trong phạm vi hai lát cắt (vùng ngoài lát cắt ở §5).

---

## 4. Test có bắt được lỗi không — sáu phép ablation đã chạy

Không dùng điểm coverage làm chứng cứ. Cách kiểm: **tạm bỏ đúng dòng kiểm chứng**, chạy lại test,
test phải đỏ vì **đúng nguyên nhân**, rồi hoàn tác.

| # | Dòng bị bỏ | Test phải đỏ | Kết quả thật | Log |
|---|---|---|---|---|
| M1 | `src/services/readingEngine.ts:320` — guard `appliedSessionIds` | TC-05 `finishSession trùng sessionId không nhân đôi attempts của bậc` | `Tests 1 failed \| 24 skipped (25)` · EXIT=1 | [`mutation-M1-session-guard.txt`](../../evidence/2026-11-02-T41C/mutation-M1-session-guard.txt) |
| M2 | `src/services/storage.ts:2140` — guard `rewardClaims` | TC-11 + TC-12 | `Tests 2 failed \| 23 passed (25)` · EXIT=1 | [`mutation-M2-reward-claim-guard.txt`](../../evidence/2026-11-02-T41C/mutation-M2-reward-claim-guard.txt) |
| — | hoàn tác M1+M2 | toàn bộ lát cắt 1 | `Tests 25 passed (25)` · EXIT=0 | [`mutation-baseline-t41c.txt`](../../evidence/2026-11-02-T41C/mutation-baseline-t41c.txt) |
| M3 | `src/hooks/useGameStage.ts:24` — bỏ `!s.pausedByUser` khỏi `isGameClockRunning` | TC-30 và TC-32 (đỏ **hai** dòng: bảng sự thật *và* nhánh "tạm đang lúc mở lớp phủ") | `Tests 2 failed \| 28 passed (30)` · EXIT=1 | [`mutation-M3-clock-decision.txt`](../../evidence/2026-11-02-KBT-ISSUE-43/mutation-M3-clock-decision.txt) |
| M4 | `src/hooks/useGameStage.ts:139` — bỏ **một** guard `if (!isRunning) return;` trong `submitCorrect` | TC-36 | `Tests 1 failed \| 29 passed (30)` · EXIT=1 | [`mutation-M4-score-guard.txt`](../../evidence/2026-11-02-KBT-ISSUE-43/mutation-M4-score-guard.txt) |
| — | hoàn tác M3+M4 | `tests/t43-game-pause.test.ts` | `Tests 30 passed (30)` · EXIT=0 | lại bằng `npx vitest run tests/t43-game-pause.test.ts` |
| M5 | `src/hooks/useGameStage.ts` — **không bỏ** guard, chỉ **lùi** `if (!isRunning) return;` của `submitWrong` xuống **sau** `setMistakesInTier` (phép này do review 4 lớp sinh ra: trước khi siết, test chỉ đếm `guards.length >= 2` nên vẫn xanh với lỗi thật) | TC-36 | `Tests 1 failed \| 29 passed (30)` · EXIT=1 — đỏ vì "guard không nằm ngay đầu hàm" | [`mutation-M5-guard-position.txt`](../../evidence/2026-11-02-KBT-ISSUE-43/mutation-M5-guard-position.txt) |
| — | hoàn tác M5 + siết lại hợp đồng | `tests/t43-game-pause.test.ts` | `Tests 30 passed (30)` · EXIT=0 | `git checkout -- src/hooks/useGameStage.ts` rồi `npx vitest run tests/t43-game-pause.test.ts` |
| M6 | **cả file** `src/services/cloudSync.ts` + `src/services/firebase.ts` trở về HEAD (`git show HEAD:<file> > <file>`, không sửa tay) ⇒ mất hàng đợi, `authEpoch`, mute `kho_bau_storage_change`, `AuthChangeSource` | `tests/t41d-cloud-sync-race.test.ts` — đỏ **năm** dòng đúng năm hành vi: đăng xuất giữa lúc kéo · hai `syncNow` chồng nhau · tự nổ auto-sync sau khi áp cloud · SDK hỏng bị coi là đăng xuất · `setState` trả object cũ | `Tests 5 failed \| 7 passed (12)` · EXIT=1 | [`mutation-M6-cloud-sync-revert.txt`](../../evidence/2026-11-03-T41D/mutation-M6-cloud-sync-revert.txt) |
| — | hoàn tác M6 | hai file test T41D | `Tests 40 passed (40)` · EXIT=0 | [`t41d-tests-green.txt`](../../evidence/2026-11-03-T41D/t41d-tests-green.txt) |

Lệnh tái lập (chạy trên máy sạch, `git checkout -- <file>` ngay sau đó):

```bash
# M1 — bỏ dòng guard trong readingEngine.applySession
npx vitest run tests/t41c-idempotency.test.ts -t "finishSession trùng"   # phải EXIT=1
# M2 — đổi điều kiện ở storage.ts:2140 thành `if (false && …)`
npx vitest run tests/t41c-idempotency.test.ts                            # phải đỏ đúng TC-11 + TC-12
git checkout -- src/services/readingEngine.ts src/services/storage.ts
npx vitest run tests/t41c-idempotency.test.ts                            # phải EXIT=0, 25 passed

# M3 — sửa dòng useGameStage.ts:24 thành `return s.phase === 'playing' && !s.locked && !s.overlayOpen;`
npx vitest run tests/t43-game-pause.test.ts                              # phải đỏ đúng TC-30 + TC-32 (2 failed | 28 passed)
# M4 — xoá MỘT guard ở useGameStage.ts:139 (trong submitCorrect)
npx vitest run tests/t43-game-pause.test.ts                              # phải đỏ đúng TC-36 (1 failed | 29 passed)
git checkout -- src/hooks/useGameStage.ts
npx vitest run tests/t43-game-pause.test.ts                              # phải EXIT=0, 30 passed
node qa/run-one.mjs qa/game-pause.mjs                                    # phải QA PASS — 12 step(s), 0 errors

# M6 — lùi CẢ HAI file cloud về HEAD (phép này mạnh hơn: không sửa tay, chỉ dựng lại bản cũ)
# Bản T41D khi đó CHƯA nằm trong HEAD ⇒ phải sao lưu, đừng dùng `git checkout --` để "hoàn tác"
cp src/services/cloudSync.ts /tmp/t41d-keep-cloudSync.ts
cp src/services/firebase.ts  /tmp/t41d-keep-firebase.ts
git show HEAD:src/services/cloudSync.ts > src/services/cloudSync.ts
git show HEAD:src/services/firebase.ts  > src/services/firebase.ts
npx vitest run tests/t41d-cloud-sync-race.test.ts                        # phải đỏ 5 failed | 7 passed, EXIT=1
cp /tmp/t41d-keep-cloudSync.ts src/services/cloudSync.ts
cp /tmp/t41d-keep-firebase.ts  src/services/firebase.ts
npx vitest run tests/t41d-cloud-sync-race.test.ts                        # phải EXIT=0, 12 passed
```

**M4 nói được gì và không nói được gì:** TC-36 đếm số guard (`≥ 2`) nên nó đỏ khi bỏ một guard —
đó là **hợp đồng nguồn**, không phải hành vi. Bằng chứng hành vi "đang tạm mà chạm bóng không ăn
điểm" là TC-40, chạy trên `dist/` thật với cả hai chiều (bóng còn nguyên khi tạm, biến mất khi chạy).

---

## 5. Ngoài lát cắt — ghi rõ NotRun, không tô hồng

| Vùng | TC | Verdict | Lý do / điều kiện để chuyển Pass |
|---|---|---|---|
| Thi thử (FR-E01…E11) | chưa có US/TC riêng | `NotRun` | Đã có `tests/exam-fidelity.test.ts`, `qa/question-types.mjs` nhưng chưa tách AC thành 3 nhánh. Cần một phiên viết US cấp đề thi. |
| Cờ vua 3D / WebGL fallback (FR-C06) | chưa có US/TC riêng | `NotRun` | Có `tests/t38-webgl-fallback.test.ts` + ảnh; chưa có TC cho nhánh "người dùng tắt WebGL thật trên máy". |
| Tiếng Anh Kid's Box (FR-N04, FR-P08) | — | `Blocked` | Chặn ở **nguồn giáo trình**, không chặn ở code — xem `RTM.md` §8. |
| Quyền truy cập chéo giữa hai tài khoản (kiểu test A/B của khóa học) | chưa có | `NotRun` | App chạy 100% `localStorage`, chưa có server tài nguyên ⇒ không tồn tại "tài khoản B" để mà kiểm. Chỉ áp dụng được nếu bật `cloudSync` thật (T41D). |
| UAT Given/When/Then với phụ huynh thật | chưa có | `NotRun` | Cần người dùng thật; repo chưa có telemetry aggregate (BG-01, ADR-01). |
| 26 trò **không** có đồng hồ | chỉ 1 trò được bấm thật để chứng minh **không** có nút tạm (TC-41, "Lật Thẻ Trí Nhớ Vàng") | `NotRun` | TC-34 chứng minh quy tắc bằng SSR cho mọi trò; chưa probe 26/31 trên `dist/` thật. Điều kiện chuyển Pass: vòng lặp qua `GAME_TITLES` trong `qa/game-pause.mjs` (chi phí: ~26 lần mount game, mỗi lần ~1 s). |
| Nút tạm trên thiết bị chạm thật (iOS Safari / Android WebView) | chưa có | `NotRun` | Probe chạy Chromium desktop với viewport 390×844; chưa có thiết bị thật trong luồng này. |
| Bấm tạm **đúng cửa sổ 1,1 s** sau đáp án (`advanceDelayMs`, `useGameStage.ts:144`) | chưa có | `NotRun` | Review 4 lớp finding #2 (xem `docs/issues/43-game-pause.md` §6): hẹn giờ chuyển câu không theo trạng thái tạm, chưa có bước probe nào bấm vào cửa sổ đó. Điều kiện chuyển Pass: thêm bước "chạm đáp án đúng → bấm tạm trong 300 ms → chờ 1 500 ms → câu phải chưa đổi". |
| Bóng **đứng giữa màn** trong khoảnh `locked` (900–1200 ms sau đáp án) | chưa có | `NotRun` | Review finding #3: `isGameClockRunning` là cổng của cả effect animation ⇒ hành vi mới là cố ý (bé không bị phạt lúc chuyển câu) nhưng chưa có ảnh bằng chứng cho khoảnh đó. Điều kiện chuyển Pass: một step chụp ảnh tại `locked` trong `qa/game-pause.mjs`. |
| Lớp phủ được **bộ đọc màn hình** báo khi tạm (`role="status"` + `aria-live`) | chưa có | `NotRun` | Đã thêm thuộc tính ARIA + hợp đồng nguồn trong `tests/t43-game-pause.test.ts:112`, nhưng chưa từng bật NVDA/VoiceOver để nghe. Điều kiện chuyển Pass: một lượt kiểm tay với trình đọc màn hình thật. |

---

## 6. Cách cập nhật

1. Thêm FR/NFR trong `SRS.md` ⇒ thêm US ở §2 (đủ 3 nhánh AC) rồi mới thêm TC ở §3.
2. TC chỉ chuyển `NotRun` → `Pass` khi có **file bằng chứng thật** trong `tests/`, `qa/` hoặc `evidence/`.
3. Sửa code mà không TC nào đỏ ⇒ hoặc TC đó không bắt được lỗi, hoặc thay đổi không hành vi — phải nói rõ điều nào.
4. Số ở dòng "Đếm" chỉ được đổi sau khi chạy `grep -c "^| TC-" docs/plan/TEST_CASES.md`.
