/**
 * KBT-ISSUE-43 — trò chơi đếm giờ phải tạm dừng được.
 *
 * Bug gốc không phải "thiếu nút": nút đã có trong `GameModalWrapper` nhưng
 * `isRealtime` không game nào truyền ⇒ `data-testid="game-pause"` **chưa từng
 * render**, và `isPaused` là state riêng của wrapper nên bóng vẫn rơi sau khi
 * bấm. `onOverlayOpenChange` (đóng băng đồng hồ khi lớp phủ "Chọn màn" che
 * bảng chơi) cũng chết y như vậy. Vì hợp đồng "đồng hồ thuộc về ai" là thứ dễ
 * đổi lại nhất, test chia ba tầng: hàm quyết định chạy/ngừng là **thuần tuý**
 * (bảng sự thật), **render thật** chứng minh nút + lớp phủ tồn tại, và **hợp
 * đồng nguồn** buộc 4 trò có đồng hồ phải tiêu thụ `stage.isRunning`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

if (typeof (globalThis as Record<string, unknown>).localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: ReturnType<typeof createMockLocalStorage> }).localStorage =
    createMockLocalStorage();
}

import '../src/data/curriculum';
import { isGameClockRunning, type GameClockState } from '../src/hooks/useGameStage';
import { GameModalWrapper } from '../src/components/games/GameModalWrapper';
import { GAMES_CATALOG } from '../src/data/gamesCatalog';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

/** Bốn trò có đồng hồ phạt bé khi chậm: bóng/bóng số rơi, hoặc giấy giờ đếm ngược. */
const REALTIME_GAME_IDS = ['catch_letters', 'color_balloon', 'falling_numbers', 'speed_racing'];

const clock = (over: Partial<GameClockState> = {}): GameClockState => ({
  phase: 'playing',
  locked: false,
  pausedByUser: false,
  overlayOpen: false,
  ...over,
});

describe('KBT-43 — hàm quyết định đồng hồ chạy hay đứng (bảng sự thật)', () => {
  it('đang chơi, không khoá, không tạm, không lớp phủ ⇒ đồng hồ chạy', () => {
    expect(isGameClockRunning(clock())).toBe(true);
  });

  it('bé bấm tạm dừng ⇒ đồng hồ đứng', () => {
    expect(isGameClockRunning(clock({ pausedByUser: true }))).toBe(false);
  });

  it('lớp phủ "Chọn màn" đang mở ⇒ đồng hồ đứng (bé không bị trôi màn khi đang chọn)', () => {
    expect(isGameClockRunning(clock({ overlayOpen: true }))).toBe(false);
  });

  it('đợi chuyển câu (locked) ⇒ đồng hồ đứng, và nhả khoá thì chạy lại', () => {
    expect(isGameClockRunning(clock({ locked: true }))).toBe(false);
    expect(isGameClockRunning(clock({ locked: true, pausedByUser: false }))).toBe(false);
  });

  it('màn đã xong (tierComplete / allComplete) ⇒ đồng hồ đứng', () => {
    expect(isGameClockRunning(clock({ phase: 'tierComplete' }))).toBe(false);
    expect(isGameClockRunning(clock({ phase: 'allComplete' }))).toBe(false);
  });

  it('bấm tạm ĐANG LÚC mở lớp phủ thì nhả lớp phủ vẫn còn tạm (không tự nhả hộ bé)', () => {
    expect(isGameClockRunning(clock({ pausedByUser: true, overlayOpen: true }))).toBe(false);
    expect(isGameClockRunning(clock({ pausedByUser: true, overlayOpen: false }))).toBe(false);
    expect(isGameClockRunning(clock({ pausedByUser: false, overlayOpen: false }))).toBe(true);
  });

  it('hàm là thuần tuý: cùng đầu vào cho cùng kết quả, không đọc đồng hồ hay state ngoài', () => {
    const a = isGameClockRunning(clock({ pausedByUser: true }));
    const b = isGameClockRunning(clock({ pausedByUser: true }));
    expect(a).toBe(b);
    expect(isGameClockRunning.length).toBe(1);
  });
});

describe('KBT-43 — GameModalWrapper: một nguồn sự thật cho trạng thái tạm dừng', () => {
  const src = read('src/components/games/GameModalWrapper.tsx');

  it('wrapper không còn tự giữ state isPaused (đó chính là lý do đường cũ chết)', () => {
    expect(src).not.toMatch(/useState\((?:<boolean>)?\s*false\s*\)[^\n]*isPaused/);
    expect(src).not.toMatch(/const \[isPaused, setIsPaused\] = React\.useState/);
    expect(src).toContain('isPaused = false,');
    expect(src).toContain('onTogglePause,');
  });

  it('nút bấm gọi thẳng handler của game và không còn tự đảo state cục bộ', () => {
    expect(src).toContain('onClick={onTogglePause}');
    expect(src).not.toContain('setIsPaused((v) => !v)');
  });

  it('lớp phủ "Đang tạm dừng" có testid ổn định để probe không phụ thuộc câu chữ', () => {
    expect(src).toContain('data-testid="game-paused-veil"');
    // Review 4 lớp finding #6: lớp phủ trước đây chỉ là div trang trí ⇒ bộ đọc
    // màn hình không báo gì khi bé bấm tạm. Lớp phủ phải là một thông báo.
    expect(src, 'lớp phủ thiếu role="status"').toContain('role="status"');
    expect(src, 'lớp phủ thiếu aria-live').toContain('aria-live="polite"');
    expect(src, 'lớp phủ thiếu aria-label').toContain('aria-label="Đang tạm dừng"');
  });

  it('nhãn nút đổi theo trạng thái để bé và bộ đọc màn hình biết đang ở đâu', () => {
    expect(src).toContain("aria-label={isPaused ? 'Tiếp tục trò chơi' : 'Tạm dừng trò chơi'}");
  });

  it('đóng bảng chơi giữa lúc tạm thì báo về game để đồng hồ không bị treo vĩnh viễn', () => {
    expect(src).toMatch(/onOverlayOpenChange\?\.\\?\(showTierModal\\?\)/);
  });
});

describe('KBT-43 — render thật: nút chỉ xuất hiện với trò có đồng hồ', () => {
  const base = {
    title: 'Hứng Số Rơi Rộn Ràng',
    subtitle: 'chạm bóng số',
    mascotEmoji: '🦊',
    score: 0,
    isGameOver: false,
    onRestart: () => {},
    onExit: () => {},
    instructions: 'Bé chạm bóng số chẵn nhé!',
    children: React.createElement('div', { 'data-testid': 'play-area' }, 'vùng chơi'),
  };

  it('trò có đồng hồ ⇒ render đúng một nút game-pause', () => {
    const html = renderToString(React.createElement(GameModalWrapper, { ...base, isRealtime: true }));
    expect(html.match(/data-testid="game-pause"/g)).toHaveLength(1);
    expect(html).toContain('Tạm dừng trò chơi');
    expect(html).not.toContain('game-paused-veil');
  });

  it('trò có đồng hồ ĐANG tạm ⇒ nút thành "Tiếp tục" và vùng chơi có lớp phủ', () => {
    const html = renderToString(
      React.createElement(GameModalWrapper, { ...base, isRealtime: true, isPaused: true, onTogglePause: () => {} })
    );
    expect(html).toContain('Tiếp tục trò chơi');
    expect(html).toContain('data-testid="game-paused-veil"');
    expect(html).toContain('Đang tạm dừng');
  });

  it('trò KHÔNG có đồng hồ ⇒ không có nút tạm (không có gì để dừng)', () => {
    const html = renderToString(React.createElement(GameModalWrapper, base));
    expect(html).not.toContain('game-pause');
    expect(html).not.toContain('game-paused-veil');
  });
});

describe('KBT-43 — bốn trò có đồng hồ phải tiêu thụ stage.isRunning', () => {
  const FILES: Record<string, string> = {
    catch_letters: 'src/components/games/CatchFallingLettersGame.tsx',
    falling_numbers: 'src/components/games/FallingNumbersMathGame.tsx',
    color_balloon: 'src/components/games/EnglishColorBalloonGame.tsx',
    speed_racing: 'src/components/games/MathSpeedRacingGame.tsx',
  };

  for (const [gameId, file] of Object.entries(FILES)) {
    it(`${gameId}: truyền đủ isRealtime + trạng thái tạm + callback cho wrapper`, () => {
      const src = read(file);
      expect(src, `${file}: thiếu isRealtime`).toMatch(/^\s*isRealtime$/m);
      expect(src, `${file}: thiếu isPaused`).toContain('isPaused={stage.isPaused}');
      expect(src, `${file}: thiếu onTogglePause`).toContain('onTogglePause={stage.togglePause}');
      expect(src, `${file}: lớp phủ chọn màn vẫn chưa được nối`).toContain(
        'onOverlayOpenChange={stage.setOverlayOpen}'
      );
    });

    it(`${gameId}: mọi hẹn giờ và cú chạm đọc isRunning, không còn đọc phase trần`, () => {
      const src = read(file);
      expect(src, `${file}: hẹn giờ vẫn chạy khi tạm`).toContain('if (!stage.isRunning) return;');
      expect(src, `${file}: còn nhánh so phase trần (quên trạng thái tạm)`).not.toContain(
        "stage.phase !== 'playing'"
      );
      // Siết theo VỊ TRÍ (review 4 lớp, finding #1): guard phải nằm trong chính
      // useEffect tạo ra từng setInterval. Đếm guard suông thì bỏ guard ở effect
      // này, để lại ở effect khác vẫn xanh mà đồng hồ vẫn chạy khi tạm.
      const intervals = src.split('setInterval(').length - 1;
      expect(intervals, `${file}: trò có đồng hồ phải dùng setInterval`).toBeGreaterThan(0);
      let cursor = 0;
      let checked = 0;
      for (;;) {
        const at = src.indexOf('setInterval(', cursor);
        if (at === -1) break;
        const effectStart = src.lastIndexOf('useEffect(', at);
        expect(effectStart, `${file}: setInterval nằm ngoài useEffect nào`).toBeGreaterThan(-1);
        expect(
          /stage\.isRunning/.test(src.slice(effectStart, at)),
          `${file}: effect tạo hẹn giờ lúc ${at} không đọc stage.isRunning`
        ).toBe(true);
        checked += 1;
        cursor = at + 'setInterval('.length;
      }
      expect(checked).toBe(intervals);
    });
  }

  it('đường chạm của trò bắt bóng cũng bị chặn khi tạm (không farm đáp án lúc dừng)', () => {
    const src = read('src/components/games/CatchFallingLettersGame.tsx');
    expect(src).toMatch(/const handleBubbleClick = \(bubble: FallingBubble\) => \{\s*if \(!stage\.isRunning\) return;/);
  });
});

describe('KBT-43 — hook sở hữu đồng hồ và tự nhả tạm khi sang màn', () => {
  const src = read('src/hooks/useGameStage.ts');

  it('hook trả về isRunning/isPaused/togglePause/setOverlayOpen cho game đọc', () => {
    expect(src).toContain('isGameClockRunning({ phase, locked, pausedByUser, overlayOpen })');
    expect(src).toContain('const [pausedByUser, setPausedByUser] = useState(false);');
    expect(src).toContain('const [overlayOpen, setOverlayOpenState] = useState(false);');
    for (const key of ['isRunning,', 'isPaused: pausedByUser,', 'togglePause,', 'setOverlayOpen,']) {
      expect(src, `thiếu ${key} trong object trả về`).toContain(key);
    }
  });

  it('submitCorrect/submitWrong chặn theo isRunning — tạm là không tính điểm', () => {
    const guards = src.match(/if \(!isRunning\) return;/g) ?? [];
    expect(guards.length).toBeGreaterThanOrEqual(2);
    // Siết theo VỊ TRÍ (review 4 lớp, finding #1): guard phải là dòng ĐẦU của
    // chính hai hàm ghi điểm. Đếm suông thì chuyển guard xuống cuối thân hàm
    // (vẫn đủ 2, vẫn cộng điểm khi tạm) mà test không đỏ.
    for (const fn of ['submitCorrect', 'submitWrong']) {
      expect(
        new RegExp(`const ${fn} = [^=]*=> \\{\\s*if \\(!isRunning\\) return;`).test(src),
        `${fn}: guard không nằm ngay đầu hàm`
      ).toBe(true);
    }
  });

  it('sang màn / chơi lại đều nhả trạng thái tạm của bé', () => {
    const resets = src.match(/setPausedByUser\(false\);/g) ?? [];
    // togglePause + các đường đổi màn. T47E: `jumpToTier` (không nơi nào gọi) gộp vào
    // `restartGame(targetTier)` ⇒ đường đổi màn còn startNextTier + restartGame, không
    // phải ba; số chốt vẫn ≥ 3 để "mọi lối đổi màn đều nhả tạm" còn bị khoá.
    expect(resets.length).toBeGreaterThanOrEqual(3);
    expect(src).toContain('const restartGame = (targetTier?: number)');
    expect(src).toContain('const startNextTier = ');
  });

  it('hàm quyết định không đọc Date.now hay state ngoài (test phải tất định được)', () => {
    const body = src.slice(src.indexOf('export function isGameClockRunning'));
    expect(body.slice(0, 400)).not.toMatch(/Date\.now|Math\.random|localStorage/);
  });
});

describe('KBT-43 — catalog: cờ isRealtime phải chỉ đúng trò có đồng hồ', () => {
  it('đúng 4 trò có đồng hồ, và Đường Đua (bị trừ lỗi khi hết giờ) không bị bỏ quên', () => {
    const realtime = GAMES_CATALOG.filter((g) => g.isRealtime).map((g) => g.id).sort();
    expect(realtime).toEqual(REALTIME_GAME_IDS);
  });

  it('thêm cờ không làm lệch bất biến 4 danh sách đăng ký trò chơi', () => {
    expect(GAMES_CATALOG.length).toBe(31);
    expect(new Set(GAMES_CATALOG.map((g) => g.id)).size).toBe(31);
  });
});
