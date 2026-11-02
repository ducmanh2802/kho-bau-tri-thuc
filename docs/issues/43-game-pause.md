# [feat] Trò chơi đếm giờ phải tạm dừng được — và lớp phủ "Chọn màn" phải thực sự đóng băng đồng hồ

**Key nội bộ:** KBT-ISSUE-43 · **Ngày mở:** 2026-11-02 · **Owner:** người giữ repo (`ducmanh2802`)
**Labels:** `enhancement`, `games`, `ux-grade1`, `dead-plumbing`
**Khu vực ảnh hưởng:** Trò chơi / Fun
**Branch:** `feature/43-game-pause`

> File này **mirror** `.github/ISSUE_TEMPLATE/feature_request.yml` (đủ 4 trường bắt buộc:
> problem · proposal · area · done). Lý do: máy làm việc này không có `gh` CLI
> (`gh --version` → `command not found`), nên chưa mở được Issue thật trên GitHub.
> **Số Issue GitHub = `NotRun`**, không phải "không có nhu cầu". Khi chạy
> `gh issue create` được thì dán nguyên văn hai mục dưới vào đó.

---

## 1. Vấn đề hoặc nhu cầu

Bốn trò chơi trong Kho Báu Tri Thức **chạy bằng đồng hồ**: bóng/số rơi xuống liên tục và
rớt khỏi màn hình là bé mất cơ hội trả lời. Bé 6 tuổi đang chơi thì có việc cắt ngang — mẹ gọi,
đi vệ sinh, hết pin tablet, hoặc bé chỉ cần nghĩ. Hiện tại **không có cách nào dừng lại**:
đồng hồ vẫn chạy, bóng vẫn rơi, bé quay lại thì cả màn đã trôi qua và điểm mất vì lý do
không liên quan tới kiến thức.

Tệ hơn, code **tỏ ra đã có** tính năng này nhưng chưa từng hoạt động:

- `GameModalWrapper.tsx:478-488` render nút `data-testid="game-pause"` khi `isRealtime === true`,
  và state `isPaused` (`:188`) **không được truyền cho bất kỳ ai** — bấm nút chỉ đổi state
  trong wrapper, bóng vẫn rơi.
- `isRealtime` có trong `GAMES_CATALOG` (3 trò) nhưng **không game nào truyền prop đó** cho
  wrapper ⇒ **nút không bao giờ render**. `grep -rn "game-pause" qa/` = 0 kết quả ⇒ chưa probe
  nào từng bắt được chuyện này.
- `onOverlayOpenChange` (`:71`, `:362`) sinh ra để "đồng hồ ngừng đếm khi lớp phủ *Chọn màn*
  che bảng chơi" — **chỉ một game dùng**: `MathSpeedRacingGame.tsx` nối nó vào `useState`
  riêng `pickerOpen` rồi dừng đếm ngược bằng `stage.phase !== 'playing' || pickerOpen`
  (điều kiện này `tests/t32-game-stage-reset.test.ts:93` giữ hợp đồng bằng regex). Ba trò bóng
  rơi **không truyền** ⇒ bé mở bảng chọn màn thì bóng vẫn rơi sau lớp phủ.
- `speed_racing` (Đường Đua Toán Học Thần Tốc) có đồng hồ đếm ngược `remainingMs` **trừ thẳng
  vào lỗi** khi về 0 (`MathSpeedRacingGame.tsx:29-43`) nhưng **không được gắn `isRealtime`**
  trong catalog ⇒ trò bị phạt thời gian nặng nhất lại là trò không có nút tạm.

Nợ này đã ghi ở `docs/plan/TASK_PLAN.md` §II ("Hệ quả chưa đóng của đợt T32") từ 2026-10-31.

## 2. Đề xuất (hành vi mong muốn)

1. Trò chơi có đồng hồ hiện một nút **Tạm dừng / Tiếp tục** ≥ 44 px ở header. Bấm lần 1: mọi
   chuyển động trong vùng chơi **dừng hẳn** (không spawn thêm, không rơi thêm, đồng hồ đếm
   ngược không trừ), vùng chơi phủ một lớp "⏸ Đang tạm dừng — bé bấm nút để chơi tiếp" và
   chạm bóng **không được tính điểm** (kẻo bé tạm rồi click hết màn). Bấm lần 2: chơi tiếp từ
   đúng vị trí cũ, không mất câu, không cộng thêm điểm.
2. Lớp phủ "Chọn Màn & Độ Khó" của wrapper cũng đóng băng đồng hồ theo cùng một cơ chế — mở
   bảng chọn là ngừng, đóng bảng chọn là chạy lại — và **không tự nhả** khi bé đang bấm tạm.
3. Nhãn nút, `aria-label` và `title` đổi theo trạng thái để bé lẫn bộ đọc màn hình biết đang
   ở trạng thái nào; `data-testid="game-pause"` giữ nguyên cho QA.
4. Trạng thái tạm dừng nằm ở **một nơi duy nhất** dùng cho mọi trò, không phải state riêng của
   wrapper — đó là lý do đường cũ chết.
5. 27 trò không có đồng hồ **không** được nhận nút (không có gì để dừng) — 31 trò trong
   `GAMES_CATALOG` trừ 4 trò có đồng hồ.

**Cách làm (quyết định thiết kế, không phải yêu cầu của người mở Issue):** `useGameStage` là
nơi sở hữu trạng thái, vì nó là hook duy nhất mà **cả game component lẫn vùng chơi** cùng đọc;
`GameModalWrapper` chỉ còn là điều khiển hiển thị (controlled). Lý do loại hai phương án khác
xem mục 4.

## 3. Tiêu chí hoàn thành (Definition of Done)

Mỗi tiêu chí là một **lệnh** hoặc một **bước bấm**, không phải tính từ:

| # | Tiêu chí | Lệnh / bước kiểm |
|---|---|---|
| DoD-1 | Hành vi mới có test, và test đó **đỏ trước khi sửa** | `npm run test:ci -- tests/t43-game-pause.test.ts` — chạy trên `main` phải đỏ, chạy trên nhánh phải xanh; số test ghi nguyên văn vào `evidence/` |
| DoD-2 | Nút thật sự render với trò có đồng hồ, không render với trò không có | test render + `node qa/run-one.mjs qa/game-pause.mjs` in `pauseButtonCount: 1` cho `catch_letters`/`falling_numbers`/`color_balloon`/`speed_racing` và `0` cho `memory_cards` |
| DoD-3 | Bấm tạm ⇒ đồng hồ đứng | probe đo `top` của 2 bóng đang rơi cách nhau 1 200 ms: **khi chạy** hai giá trị khác nhau, **khi tạm** bằng nhau từng ký tự; `remainingMs` của `speed_racing` không giảm khi tạm |
| DoD-4 | Bấm tạm ⇒ chạm bóng không tính điểm | test: `submitCorrect` không đổi `score` khi `isRunning === false` |
| DoD-5 | Lớp phủ "Chọn màn" đóng băng đồng hồ và không tự nhả state tạm của bé | test `setOverlayOpen(true/false)` + tổ hợp `paused && overlay` |
| DoD-6 | Không phá 4 bất biến đăng ký trò chơi | `npm run verify` (test `t08`/`t14c`/`t15`/`t16`/`t17a`/`t17b`/`t21` xanh) và `grep -c "id: '" src/data/gamesCatalog.ts` vẫn 31 |
| DoD-7 | Không phình lần tải đầu | `npm run check:budget` → main chunk ≤ 450 kB và boot graph không đổi (thay đổi nằm trong chunk game đã lazy) |
| DoD-8 | Có bằng chứng nhìn thấy được | `evidence/2026-11-02-KBT-ISSUE-43/` : log `verify` nguyên văn + JSON probe + **2 ảnh** trước/sau cú bấm tạm, 0 console error |
| DoD-9 | Tài liệu theo kịp code | `CHANGELOG.md` `[Unreleased]`; `docs/plan/TEST_CASES.md` thêm US/TC của lát cắt này; `docs/specs/RTM.md` §10 nối chuỗi; dòng mới trong `docs/plan/TASK_PLAN.md` §II; xoá đoạn "hệ quả chưa đóng" tương ứng |
| DoD-10 | Không còn đường chết nào trong nhóm này | `grep -rn "onOverlayOpenChange\|isPaused" src/` ⇒ mọi prop khai ra đều có chỗ truyền và chỗ đọc |

## 4. Ghi chú thiết kế (giai đoạn 2)

**Chốt một cách làm.** Hai phương án bị loại, nêu rõ vì sao để lần sau khỏi bàn lại:

| Phương án | Vì sao loại |
|---|---|
| (a) Đưa `isPaused` vào `GameFeedbackContext` để game đọc bằng `useGameFeedback()` | **Không tới được nơi cần dừng.** Hẹn giờ spawn/rơi nằm trong `useEffect` của *component cha* (`CatchFallingLettersGame.tsx:56-90`), tức là **bên ngoài** `<GameModalWrapper>` — nơi duy nhất có Provider. Con trỏ context chỉ đi xuống, không đi lên. |
| (b) Prop drilling `isPaused` từ wrapper xuống từng game | Wrapper render game qua `GAME_REGISTRY` ở **tầng cao hơn**, không phải con của nó; và 32 file game sẽ phải nhận thêm 2 prop rỗng. Không có chỗ đặt. |
| (c) Thêm `'paused'` vào union `GameStagePhase` | `phase` được 32 wrapper dùng để quyết định overlay kết quả; thêm một giá trị là bắt mọi nhánh `switch`/so sánh phải xét lại — rủi ro lớn hơn nhiều so với lợi ích. |

**Cách chọn — (d) sở hữu ở `useGameStage`, wrapper thành controlled:**

1. `useGameStage` thêm state `pausedByUser` + `overlayOpen`, trả về
   `isPaused: boolean`, `togglePause(): void`, `setOverlayOpen(open): void` và
   **`isRunning: boolean = phase === 'playing' && !locked && !pausedByUser && !overlayOpen`**.
   Một nguồn sự thật, mọi game đã quen đọc `stage.*`.
2. Vùng hẹn giờ của 4 trò đổi điều kiện `stage.phase !== 'playing'` → `!stage.isRunning`.
   `tests/t32-game-stage-reset.test.ts:85-102` là hợp đồng cũ buộc `speed_racing` giữ
   `pickerOpen` riêng — **đây là test duy nhất phải sửa** trong lát cắt này (xem mục 5.1).
3. `GameModalWrapper`: bỏ `useState(isPaused)` (nguồn kép), nhận `isPaused` + `onTogglePause`
   từ props; vẫn chỉ render nút khi `isRealtime`. `onOverlayOpenChange` được 4 trò truyền thật
   → hết chết. Vì `overlayOpen` của hook đã làm đúng việc `pickerOpen` từng làm cho riêng
   `speed_racing`, `useState` đó bị xoá theo — để lại hai nguồn sự thật song song cho cùng một
   lớp phủ thì vẫn còn nợ, và nút phương án của game khi đó không bị vô hiệu hoá lúc mở bảng chọn.
4. Khi `isPaused`: phủ lớp `data-testid="game-paused-veil"` lên vùng chơi và chặn điểm bằng
   cách đổi guard `handleBubbleClick` sang `stage.isRunning` — bé không "farm" được đáp án
   trong lúc tạm.
5. `gamesCatalog.ts`: gắn `isRealtime: true` cho `speed_racing` (trò bị phạt thời gian nặng
   nhất). Đây **không phải** sửa vặt ăn theo: cờ `isRealtime` nghĩa là "có đồng hồ", và đồng hồ
   của nó trừ thẳng vào lỗi — mục 1 của Issue mô tả đúng hành vi đó.
6. Không đụng `src/data/games/*` (builder vẫn tất định theo `(tier, nonce)`), không thêm
   dependency, không đổi API `StorageService`.

**Rủi ro đã thấy:** (i) `isRunning` gộp cả `locked` — nếu bé bấm tạm đúng lúc chờ chuyển câu
thì `advanceDelayMs` vẫn chạy (đó là hẹn giờ của state machine, không phải đồng hồ trò chơi);
chấp nhận, ghi rõ trong test. (ii) 27 trò khác không truyền props mới ⇒ chúng nhận
`isPaused === undefined`; wrapper phải coi đó là `false`, không được render nút.

## 5. Trạng thái theo dõi 6 giai đoạn

| Giai đoạn | Đầu ra | Trạng thái |
|---|---|---|
| 1 Đề bài | file này + DoD đo được | **XONG** (Issue GitHub: `NotRun` — không có `gh` CLI) |
| 2 Thiết kế | mục 4 | **XONG** |
| 3 Hiện thực | `feature/43-game-pause`, commit nhỏ | **XONG** — `verify` EXIT=0, 1270/1270 test |
| 4 Kiểm chứng | `verify` + probe + `evidence/` | đang chạy |
| 5 Rà soát | PR checklist + review 4 lớp | chờ (PR: push nhánh + link compare; CI `NotRun` trên máy này) |
| 6 Phát hành | squash vào `main` + `v1.1.0` | chờ luồng nghiệm thu xanh |

### 5.1 Hai chỗ phải sửa lại mô tả — ghi để không tô hồng

1. **Mục 1 từng nói sai.** Bản đầu viết "`onOverlayOpenChange` … không game nào truyền".
   `grep -rn "onOverlayOpenChange" src/` trên `main` cho thấy `MathSpeedRacingGame.tsx` có
   truyền, vào `useState` riêng `pickerOpen`, và điều kiện đó đang được
   `tests/t32-game-stage-reset.test.ts:93-96` giữ bằng regex. Đường chết thật nhỏ hơn một
   bậc so với mô tả ban đầu: prop có tác dụng với đúng 1/4 trò có đồng hồ.
2. **`pickerOpen` bị xoá, khác ghi chú thiết kế ở mục 4.** Bản đầu nói "không refactor ăn
   theo". Khi `overlayOpen` của hook thay đúng vai trò đó, giữ `pickerOpen` là giữ hai nguồn
   sự thật song song cho cùng một lớp phủ (vi phạm DoD-10) và các nút phương án của Đường Đua
   vẫn bấm được sau lớp phủ. Hệ quả: `tests/t32-game-stage-reset.test.ts` là **test cũ duy
   nhất phải đổi** trong lát cắt này, đổi sang hợp đồng mới (`stage.setOverlayOpen`,
   `!stage.isRunning`, deps `[budgetMs, stage.roundIdx, stage.isRunning]`) và chặn từ
   `pickerOpen` quay lại. Không có test cũ nào khác bị nới lỏng.
3. **Một lần sửa test không phải vì code sai.** Sau khi code xong, lần chạy xanh đầu tiên của
   `tests/t43-game-pause.test.ts` vẫn còn 1 fail: test đòi chuỗi `'isPaused,'` nguyên văn trong
   khi hook trả `isPaused: pausedByUser,`. Đã sửa **giả định của test**, không sửa code để
   chiều test — khác với việc đổi hợp đồng ở mục 2 (ở đó code đổi trước, test theo sau).
