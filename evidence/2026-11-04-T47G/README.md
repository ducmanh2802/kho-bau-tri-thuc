# T47G — lượt **sai** phải có phản hồi **hình**, không chỉ tiếng bíp

Đóng `DEF-018(b)` (ghi trong `docs/plan/RISK_REGISTER.md` §2). `AGENTS.md` §3 yêu cầu "mọi lượt
đúng/sai có phản hồi âm thanh + hình ảnh", nhưng phép đo trên `src/components/games/*.tsx` cho thấy
nửa sau của vế đó bị bỏ ở **14** trò.

## 1. Số đo (đo lại được, không suy luận)

```bash
cd /d/trithuc/kho-bau-tri-thuc
grep -l "sound.playWrong()" src/components/games/*.tsx | wc -l   # 30  (không tính GameModalWrapper)
grep -l "reportWrong(" src/components/games/*.tsx | wc -l         # 17 → 16 trò + chính wrapper
comm -13 <(grep -l "sound.playWrong()" src/components/games/*.tsx | xargs -n1 basename | sort) \
         <(grep -l "reportWrong(" src/components/games/*.tsx | xargs -n1 basename | sort) | wc -l  # 14
```

30 file beep − 16 file có `reportWrong()` = **14** file beep-trần. Trong 14 file đó, **5** tự vẽ
phản hồi riêng (nút chọn chuyển `bg-rose-500` ở `ClockMoneyGame` · `PhonicsPopGame` ·
`SpellingDuelGame` · `WordStoryGame`; `SyllableBuilderGame` render biến `feedback` do `setFeedback`
đặt) ⇒ **9** trò còn lại bé chỉ *nghe* "tít" mà màn hình không đổi gì:
`EnglishAnimalSoundGame` · `EnglishColorBalloonGame` · `FallingNumbersMathGame` ·
`MathSpeedRacingGame` · `MemoryCardsGame` · `NumberTowerGame` · `OceanFishingGame` ·
`SentenceScrambleGame` · `ShapeSortingGame`.

Vì sao 14 file lại không báo? Bảng chơi của chúng nằm **ngoài** subtree của `GameModalWrapper`, nên
`useGameFeedback()` — chỗ dựng mascot + lời khen — không dùng được ở đó (hook sẽ ném "must be used
within GameModalWrapper").

## 2. Cách sửa: một chỗ trong framework, không phải 14 lần sửa màn chơi

`stage.submitWrong()` **đã** tăng bộ đếm `mistakesInTier` cho mọi trò. Chỉ cần cho wrapper *nhìn thấy*
bộ đếm đó:

- `src/components/games/GameModalWrapper.tsx` — prop mới `mistakes?: number`, hiệu ứng keyed
  `[mistakes]` so với `prevMistakesRef` và chỉ bật khi số **tăng** (`mistakes > prev`), dựng đúng cặp
  phản hồi mà `reportWrong()` vẫn dựng: `showFeedback(getRandomReaction('wrong'), praise.text)` với
  `praise = resolvePraise({ subject: praiseSubject, outcome: 'ENCOURAGEMENT', seed })`. Header mascot
  có `data-testid="mascot-reaction"` để ảnh/probe đọc được biểu cảm đang render.
- **14** file trò chơi truyền `mistakes={stage.mistakesInTier}`.
- Hiệu ứng **không** gọi `sound.*` — tiếng bíp đã do trò chơi phát; gọi nữa là đọc hai lần.

Chiều giảm im lặng tuyệt đối: `startNextTier` và "Chơi lại" kéo `mistakesInTier` về 0, mà một màn
chưa chơi thì không có gì để "cố lên".

## 3. Lệnh tái lập cả thư mục này

```bash
cd /d/trithuc/kho-bau-tri-thuc
npx vitest run tests/t47g-wrong-turn-visual.test.ts        # 6 test
npm run build
node qa/run-one.mjs evidence/2026-11-04-T47G/probe-t47g-wrong-turn-visual.mjs
for p in games golden-path; do node qa/run-one.mjs qa/$p.mjs; done   # probe mới nằm NGOÀI qa/ ⇒ vẫn 30 probe
npm run verify                                            # cổng, EXIT=0
```

## 4. Kết quả

| Artifact | Nội dung |
|---|---|
| `verify.txt` | `npm run verify` **EXIT=0** · `Test Files 120 passed (120)` · `Tests 1508 passed (1508)` · `Duration 25.58s` · `Main chunk: index-oKg0XRrb.js = 211.1 kB → PASS` |
| `probe-t47g-wrong-turn-visual.mjs` | hai trò **thuộc nhóm 9** (`number_tower` 🏰 + `ocean_fishing` 🎣), mỗi trò 4 bước: mở màn không có bóng chữ · bấm **đúng** không được bật "cố lên" · bấm **sai** ⇒ toast + mascot đổi · sau 2,8 s bóng chữ tắt và mascot về mặc định |
| `probe-green.txt` | `QA PASS — 6 step(s), 0 errors` · `ok: true` · `failedAt: null` |
| `probe-red-mutated.txt` | `QA FAIL — 2 error(s) at A3` (A3 + B3) trên build có đột biến |
| `mutation-dead-guard.txt` | ba vòng ablation, xem §5 |
| `A-correct.png` `B-correct.png` | lượt đúng — màn hình không có bóng chữ |
| `A-wrong-visual.png` `B-wrong-visual.png` | lượt sai (vòng xanh) — mascot đổi + bóng chữ `🌈 …` |
| `A-wrong-no-visual.png` `B-wrong-no-visual.png` | lượt sai (vòng đỏ, guard bị chặn) — không thấy gì |
| `probe-games.txt` · `probe-golden-path.txt` | hồi quy: `catalogCount: 31`, `QA PASS — 28 step(s), 0 errors` |

## 5. Ablation — và một lỗ hổng của chính bộ test

Đột biến chọn là dạng hỏng tự nhiên nhất của một hiệu ứng "nhìn bộ đếm": chèn `false &&` vào điều
kiện (`mistakes > prev`) ⇒ code còn nguyên, chuỗi còn nguyên, chỉ nhánh không bao giờ chạy.

- **Vòng 1 (test chưa siết):** probe **ĐỎ** (`QA FAIL — 2 error(s) at A3`) nhưng cả **6** test nguồn
  vẫn **XANH**. `tests/t47g-wrong-turn-visual.test.ts` là test *hợp đồng mã nguồn* (đọc file, so
  chuỗi), còn repo **không** có jsdom/testing-library ⇒ không dựng được React để đo hành vi trong
  unit test (`AGENTS.md` §1.4: thêm dependency phải hỏi trước).
- **Vòng 2 (sau khi siết):** thêm luật `expect(body).not.toMatch(/\bif \(false\b|&&\s*false\b|\|\|\s*true\b/)`
  ⇒ cùng đột biến, `Tests 1 failed | 5 passed (6)`, đỏ đúng test 4.
- **Vòng 3:** hoàn tác ⇒ `6 passed (6)` và `QA PASS — 6 step(s), 0 errors`.

Hạn chế ghi thẳng vào test header: luật mới chặn **đúng dạng đột biến đã đo**, không thay được bằng
chứng hành vi; với thay đổi bàn phím/hình ảnh thì **probe là bằng chứng, test nguồn chỉ là hợp đồng**.

## 6. Điều chưa làm

- Chưa có behavioural unit test (thiếu jsdom/testing-library — cần người dùng duyệt dependency).
- Probe chỉ đi sâu **2** trong 14 trò; 12 trò còn lại được khoá bởi bất biến nguồn "beep thì wrapper
  phải thấy", không bởi trình duyệt.
