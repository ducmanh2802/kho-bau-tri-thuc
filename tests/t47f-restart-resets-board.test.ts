/**
 * T47F — đóng `DEF-018`: nút **"Chơi lại"** không xoá trạng thái bảng.
 *
 * `useGameStage.restartGame()` reset `roundIdx` / `score` / `phase` và **bump `nonce`**
 * (`src/hooks/useGameStage.ts`, khối "T02/B5 — replaying the same tier counts as a new play"),
 * nhưng **không đổi `tier`** khi bé bấm chơi lại đúng màn đang chơi. Hệ quả: mọi
 * `useEffect` chỉ reset state cục bộ theo `[stage.tier]` (hay `[stage.tier, stage.roundIdx]`)
 * sẽ **không chạy** — đề mới (do `nonce` mới) được nạp, còn bảng thì giữ nguyên hình của ván
 * cũ. Bốn hậu quả dưới đây chứng minh bằng mã; (1) và (2) còn được **đo trên `dist/`** bằng
 * `evidence/2026-11-04-T47F/probe-t47f-restart-clears-board.mjs` (bước A2, B2):
 *
 * (1) `NumberTowerGame.tsx:21` — `setTowerBlocks([])` only on tier change ⇒ tháp vẫn đầy
 *     "Tầng 1 (+3), Tầng 2 (+5)…" trong khi điểm vừa về 0 ⇒ bé tưởng mình đã xây lại xong.
 * (2) `SentenceScrambleGame.tsx:25` — `setAssembledWords([])` **và** `setTrainDriving(false)`;
 *     `handleWordTap` có `if (stage.locked || trainDriving) return;` ⇒ nếu ván trước kết thúc
 *     ở round 1 (`roundIdx` vẫn 0) thì tàu chữ vẫn "đang chạy" **mãi mãi**, mọi cú chạm đều bị
 *     nuốt ⇒ trò chơi không chơi tiếp được nữa (soft-lock, nặng hơn một lỗi mỹ thuật).
 * (3) `ClockMoneyGame.tsx:33` — `setShowHint(false)`: gợi ý của ván cũ treo sang ván mới.
 * (4) hai hiệu ứng voice timer (`EnglishAnimalSoundGame.tsx:23`, `ListenPickPhonicsGame.tsx:134`):
 *     đề mới mà không có tiếng đọc ⇒ bé lớp 1 mất luôn gợi ý chính của trò "Nghe và chọn".
 *
 * Trò "Bé Tập Vẽ & Tô Màu Diệu Kỳ" bị **nghi oan** ở đây và đã được đo lại: nó **không** cần
 * `stage.nonce` vì `onRestart` của trò là một wrapper riêng gọi `clearCanvas()` theo lệnh. Defect
 * thật của đúng wrapper đó là **bỏ tham số** `targetTier` ⇒ bảng chọn màn của `DEF-017` lọt lại
 * trên trò này — test cuối file này khoá cả điều kiện miễn lẫn defect đó.
 *
 * Ba mảng `rounds = useMemo(..., [stage.tier, stage.nonce])` đã đúng khuôn — chỉ các hiệu ứng
 * *khởi tạo lại* thứ bé nhìn/nghe là bị bỏ.
 *
 * **Bất biến** (scanner ở dưới): trong `src/components/games/*.tsx`, mọi mảng dependency của
 * hook có nhắc `stage.tier` hoặc `stage.roundIdx` **phải** nhắc `stage.nonce`. Hai ngoại lệ,
 * mỗi ngoại lệ đều có test riêng chứng minh điều kiện miễn còn đúng:
 * · hiệu ứng có `stage.isRunning` — nó tắt->bật lại trên mọi lần chơi lại (nút "Chơi lại" chỉ
 *   hiện trên màn receipt, khi `phase` đã là `tierComplete`/`gameOver`), nên `isRunning` tự nó
 *   đã là tín hiệu "ván mới";
 * · `ColoringCanvasGame.tsx` — bảng bị xoá **theo lệnh** trong chính handler chơi lại.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const GAMES_DIR = join(root, 'src/components/games');

/**
 * Trò xoá bảng **theo lệnh** ngay trong handler chơi lại ⇒ hiệu ứng không cần chạy lại.
 * Điều kiện miễn được `tests` bên dưới chứng minh; thêm tên trò vào đây mà không đáp ứng điều
 * kiện thì test đỏ.
 */
const CLEARS_ON_RESTART = ['ColoringCanvasGame.tsx'];

/**
 * Mọi dòng đóng hook (`}, [deps]);` hoặc `}, [deps])`) chạm tới khoá của ván.
 * `stage.isRunning` = ngoại lệ có chủ đích (xem header).
 */
function playKeyEffectsMissingNonce(): string[] {
  const violations: string[] = [];
  for (const file of readdirSync(GAMES_DIR).filter((f) => f.endsWith('.tsx'))) {
    if (CLEARS_ON_RESTART.includes(file)) continue;
    readFileSync(join(GAMES_DIR, file), 'utf8')
      .split('\n')
      .forEach((line, index) => {
        const m = /^\s*(\},\s*)?\[([^\]]*)\]\s*\);?\s*$/.exec(line);
        if (!m) return;
        const deps = m[2];
        if (!/stage\.(tier|roundIdx)/.test(deps)) return;
        if (deps.includes('stage.isRunning')) return;
        if (deps.includes('stage.nonce')) return;
        violations.push(`${file}:${index + 1}  [${deps.trim()}]`);
      });
  }
  return violations;
}

describe('T47F — "Chơi lại" (nonce mới) phải xoá trạng thái bảng', () => {
  it('không còn hiệu ứng nào reset theo tier/roundIdx mà thiếu stage.nonce', () => {
    const violations = playKeyEffectsMissingNonce();
    expect(violations, `hiệu ứng không tái khởi động khi chơi lại:\n${violations.join('\n')}`).toEqual([]);
  });

  it('năm điểm đã báo cáo mang đúng stage.nonce trong deps', () => {
    const sites: { file: string; needle: string; why: string }[] = [
      {
        file: 'NumberTowerGame.tsx',
        needle: '}, [stage.tier, stage.nonce]);',
        why: 'tháp số phải về 0 tầng khi chơi lại cùng màn',
      },
      {
        file: 'SentenceScrambleGame.tsx',
        needle: '}, [stage.tier, stage.roundIdx, stage.nonce]);',
        why: 'từ đã ghép + cờ trainDriving phải xoá khi chơi lại (trainDriving chặn mọi cú chạm)',
      },
      {
        file: 'ClockMoneyGame.tsx',
        needle: '}, [stage.tier, stage.roundIdx, stage.nonce]);',
        why: 'gợi ý (showHint) không được sống sót sang ván mới',
      },
      {
        file: 'EnglishAnimalSoundGame.tsx',
        needle: '}, [stage.tier, stage.roundIdx, stage.nonce]);',
        why: 'đề mới phải được đọc lại thành lời',
      },
      {
        file: 'ListenPickPhonicsGame.tsx',
        needle: '}, [stage.tier, stage.roundIdx, currentRound, stage.nonce]);',
        why: 'voice timer khoá theo nonce (hiện đang được `currentRound` che — xem header)',
      },
    ];
    for (const site of sites) {
      const src = read(`src/components/games/${site.file}`);
      expect(src, `${site.file}: ${site.why}`).toContain(site.needle);
    }
  });

  it('ngoại lệ "xoá bảng theo lệnh trong onRestart" còn đúng cho từng trò được miễn', () => {
    // Mỗi trò trong CLEARS_ON_RESTART được scanner bỏ qua, nên điều kiện miễn phải được chứng
    // minh ở đây — nếu ai đó sửa wrapper mà quên clearCanvas(), bảng lại dính ván cũ mà test
    // quét deps không còn thấy gì.
    for (const file of CLEARS_ON_RESTART) {
      const src = read(`src/components/games/${file}`);
      expect(src, `${file}: onRestart phải trỏ tới handler cục bộ của trò`).toMatch(/onRestart=\{restartGame\}/);
      expect(src, `${file}: handler cục bộ phải gọi stage.restartGame(targetTier) — không bỏ tham số`).toMatch(
        /const restartGame = \(targetTier\?: number\) => \{[\s\S]*?stage\.restartGame\(targetTier\);/,
      );
      expect(src, `${file}: handler cục bộ phải xoá bảng theo lệnh (clearCanvas())`).toMatch(
        /const restartGame = \(targetTier\?: number\) => \{[\s\S]*?clearCanvas\(\);/,
      );
    }
  });

  it('ngoại lệ isRunning vẫn còn đúng: các hiệu ứng đó chỉ chạy khi ván thật sự bật lại', () => {
    const gated = ['CatchFallingLettersGame.tsx', 'EnglishColorBalloonGame.tsx', 'FallingNumbersMathGame.tsx'];
    for (const file of gated) {
      const src = read(`src/components/games/${file}`);
      expect(src, `${file}: hiệu ứng spawn/anim phải khoá theo stage.isRunning`).toMatch(/\[stage\.isRunning, stage\.tier[^\]]*\]/);
    }
  });

  it('tiên đề: chơi lại cùng màn đổi nonce nhưng không đổi tier', () => {
    const hook = read('src/hooks/useGameStage.ts');
    const restart = hook.slice(hook.indexOf('const restartGame'), hook.indexOf('const restartGame') + 1800);
    expect(restart, 'restartGame phải bump nonce (đây là tín hiệu duy nhất của "ván mới")').toContain('setNonce(');
    expect(restart).toContain('setTier(resumeTier)');
    expect(restart).toContain('setRoundIdx(0)');
  });
});
