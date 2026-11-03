/**
 * T47G — mỗi lượt **sai** phải có phản hồi bằng **hình**, không chỉ bằng tiếng
 * (`AGENTS.md` §3: "mọi lượt đúng/sai có phản hồi âm thanh + hình ảnh").
 *
 * Bệnh đo được (không phải suy luận): trong `src/components/games/*.tsx` có **30** file bật
 * `sound.playWrong()` khi bé bấm sai, nhưng chỉ **16** file gọi tiếp `reportWrong()` của
 * `useGameContext`. `stage.submitWrong()` chỉ tăng `mistakesInTier` (`src/hooks/useGameStage.ts`),
 * còn mascot + lời khen nằm trong `showFeedback()` của `GameModalWrapper` — nên **14** file còn lại
 * bé chỉ *nghe* "tít": không emoji đổi, không toast, không chữ.
 *
 * Năm trong số 14 tự vẽ phản hồi riêng (nút chọn chuyển `bg-rose-500` ở `ClockMoneyGame`,
 * `PhonicsPopGame`, `SpellingDuelGame`, `WordStoryGame`; `SyllableBuilderGame` render `feedback`
 * do `setFeedback` đặt). Chín trò còn lại **không có gì trên màn hình**:
 * `EnglishAnimalSoundGame` · `EnglishColorBalloonGame` · `FallingNumbersMathGame` ·
 * `MathSpeedRacingGame` · `MemoryCardsGame` · `NumberTowerGame` · `OceanFishingGame` ·
 * `SentenceScrambleGame` · `ShapeSortingGame`.
 *
 * Cách sửa chọn đường **một chỗ trong framework**: `GameModalWrapper` nhận thêm `mistakes`
 * (là `stage.mistakesInTier`, thứ mà `submitWrong()` đã tăng sẵn), và khi số này **tăng** thì
 * dựng đúng cặp phản hồi mà `reportWrong()` vẫn dựng (mascot `wrong` + chữ ENCOURAGEMENT).
 * Vì vậy luật của test là "hoặc báo cho wrapper bằng `reportWrong`, hoặc cho wrapper *thấy*
 * bằng `mistakes={stage.mistakesInTier}`" — không có danh sách ngoại lệ, nên thêm trò mới
 * không lọt lưới.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const GAMES_DIR = path.resolve(__dirname, '..', 'src', 'components', 'games');
const WRAPPER = path.join(GAMES_DIR, 'GameModalWrapper.tsx');
const STAGE_HOOK = path.resolve(__dirname, '..', 'src', 'hooks', 'useGameStage.ts');

const SRC = fs.readFileSync(WRAPPER, 'utf8');

function gameFiles(): string[] {
  return fs
    .readdirSync(GAMES_DIR)
    .filter((f) => f.endsWith('.tsx'))
    .sort();
}

/** File nào beep khi sai mà không khai cho wrapper biết? */
function gamesBeepingWithoutVisualContract(): string[] {
  return gameFiles().filter((f) => {
    const src = fs.readFileSync(path.join(GAMES_DIR, f), 'utf8');
    if (!src.includes('sound.playWrong()')) return false;
    const reportsToWrapper = /reportWrong\(/.test(src);
    const showsMistakes = /mistakes=\{stage\.mistakesInTier\}/.test(src);
    return !(reportsToWrapper || showsMistakes);
  });
}

describe('T47G — lượt sai có phản hồi hình ở mọi trò chơi', () => {
  it('tiên đề: submitWrong() thật sự tăng mistakesInTier và hook lộ số đó ra ngoài', () => {
    const stageSrc = fs.readFileSync(STAGE_HOOK, 'utf8');
    expect(stageSrc).toMatch(/const submitWrong = \(\) => \{[\s\S]*?setMistakesInTier\(\(m\) => m \+ 1\)/);
    expect(stageSrc).toMatch(/\n    mistakesInTier,/);
  });

  it('không còn trò nào beep khi sai mà wrapper không thấy lượt sai', () => {
    const offenders = gamesBeepingWithoutVisualContract();
    expect(offenders, `bé chỉ nghe bíp, không thấy gì: ${offenders.join(', ')}`).toEqual([]);
  });

  it('mười bốn trò beep-trần nay đưa mistakesInTier vào wrapper', () => {
    // Con số là **kết quả đo** ở thời điểm lập hồ sơ (30 file beep, 16 file reportWrong),
    // không phải dự đoán. Nếu ai đó thêm `reportWrong()` cho một trò thì dòng này vẫn đúng
    // vì phép đo đếm *số file truyền prop*, còn bất biến ở test trên mới là luật.
    const beeping = gameFiles().filter((f) =>
      fs.readFileSync(path.join(GAMES_DIR, f), 'utf8').includes('sound.playWrong()')
    );
    expect(beeping.length).toBe(30);
    const withMistakes = beeping.filter((f) =>
      /mistakes=\{stage\.mistakesInTier\}/.test(fs.readFileSync(path.join(GAMES_DIR, f), 'utf8'))
    );
    expect(withMistakes.length).toBe(14);
  });

  it('wrapper dựng phản hồi hình khi số lượt sai TĂNG, và không bắn ở lần render đầu', () => {
    expect(SRC).toMatch(/mistakes\?: number/);
    // hiệu ứng đọc prop, so với ref giữ giá trị trước ⇒ chỉ chạy khi tăng
    const effect = /const prevMistakesRef = useRef[\s\S]*?useEffect\(\(\) => \{[\s\S]*?mistakes !== undefined[\s\S]*?\}, \[mistakes\]\);/.exec(
      SRC
    );
    expect(effect, 'không có hiệu ứng mistakes → phản hồi hình').not.toBeNull();
    const body = effect![0];
    expect(body).toMatch(/mistakes > prev/);
    expect(body).toMatch(/showFeedback\(getRandomReaction\('wrong'\)/);
    expect(body).toMatch(/'ENCOURAGEMENT'/);
    // Im lặng tuyệt đối khi vào màn mới (mistakes về 0) — không được "phản hồi" chiều giảm.
    expect(body).not.toMatch(/else\s*\{\s*showFeedback/);
    // Ablation 2026-11-04: chèn `if (false && …)` vào điều kiện thì **probe** đỏ ngay (A3/B3,
    // `evidence/2026-11-04-T47G/mutation-dead-guard.txt`) nhưng sáu test nguồn này vẫn xanh —
    // một guard chết không sửa chuỗi nào cả. Test nguồn không dựng được React (repo không có
    // jsdom/testing-library, thêm dependency phải hỏi trước ⇒ AGENTS.md §1.4), nên ít nhất
    // chặn đúng dạng đột biến đã đo: hằng số chặn đường nhánh.
    expect(body).not.toMatch(/\bif \(false\b|&&\s*false\b|\|\|\s*true\b/);
  });

  it('phản hồi hình là mascot + chữ, không phải một tiếng bíp khác (tránh đọc hai lần)', () => {
    // `(?:\r?\n)` vì làm việc trên Windows: `core.autocrlf` trả CRLF về working tree,
    // một regex `\n` cứng sẽ đỏ vì định dạng file chứ không vì hành vi.
    const effect = /const prevMistakesRef = useRef[\s\S]*?useEffect\(\(\) => \{\r?\n([\s\S]*?)\r?\n {2}\}, \[mistakes\]\);/.exec(SRC);
    expect(effect).not.toBeNull();
    expect(effect![1]).not.toMatch(/sound\.(playWrong|speak)/);
  });

  it('phản hồi hình đo được bằng probe: toast + mascot có data-testid', () => {
    expect(SRC).toMatch(/data-testid="praise-toast"/);
    expect(SRC).toMatch(/\{praiseText && \(/);
    // `testid` nằm trong **thẻ mở**, `{mascotReaction}` là nội dung sau `>` — vì vậy regex phải
    // vượt qua `>` của thẻ mở thay vì dùng `[^>]*` nối hai thứ (sẽ không bao giờ khớp).
    const mascot = /<span[^>]*data-testid="mascot-reaction"[^>]*>\s*\{mascotReaction\}<\/span>/.exec(SRC);
    expect(mascot, 'mascot header không có data-testid cạnh biểu cảm đang render').not.toBeNull();
  });
});
