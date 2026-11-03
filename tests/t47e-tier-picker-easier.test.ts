/**
 * T47E — bảng "Chọn Màn & Độ Khó" hứa chọn được mọi màn, nhưng chọn màn **dễ hơn** thì
 * chỉ tổ mất điểm.
 *
 * `src/components/games/GameModalWrapper.tsx:226-241` (handleSelectTier):
 *   StorageService.selectGameTier(gameId, t)  // mở khoá — `Math.max`
 *   onRestart()                               // = stage.restartGame(), **không truyền t**
 *
 * `src/hooks/useGameStage.ts:215-235` (restartGame) lấy màn từ
 * `StorageService.getGameProgress(gameId).unlockedTier`, tức **màn cao nhất từng mở**.
 * Vì `selectGameTier` chỉ tăng không giảm, bé đang Màn 5 mà chọn Màn 1 thì:
 * unlockedTier vẫn 5 ⇒ bảng nạp lại đúng Màn 5, điểm vừa tích bị reset, không một lời giải
 * thích. Nút "Chọn →" ở mọi dòng (GameModalWrapper.tsx:707-751) thành mồi lừa ở các dòng
 * dưới. Bé lớp 1 đang bí thường đúng lúc cần quay lại màn dễ — đó là thao tác bị mất.
 *
 * `stage.jumpToTier` (useGameStage.ts:237-256) đã viết để làm việc này nhưng **không nơi
 * nào gọi** (grep: chỉ định nghĩa + khai báo type), còn prop `onSelectTier` thì chưa game
 * nào truyền. Sửa theo đường ít ma sát nhất: `restartGame(targetTier?)` nhận màn được chọn,
 * wrapper gọi `onRestart(t)`. Toàn bộ 30+ trò đang nối `onRestart={stage.restartGame}` nên
 * một thay đổi ở framework có tác dụng cho mọi trò, không phải sửa 31 file.
 *
 * Bất biến giữ nguyên: "chọn màn chỉ mở khoá, sao/điểm chỉ do lượt chơi thật ghi" (T42/A) —
 * `selectGameTier` vẫn `Math.max`, chọn màn dễ **không** tụt tiến độ đã mở.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
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

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: ReturnType<typeof createMockLocalStorage> }).localStorage =
    createMockLocalStorage();
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const wrapperSrc = read('src/components/games/GameModalWrapper.tsx');
const stageSrc = read('src/hooks/useGameStage.ts');

const { StorageService } = await import('../src/services/storage');

function sliceBody(src: string, marker: string, span: number) {
  const at = src.indexOf(marker);
  expect(at, `không tìm thấy "${marker}"`).toBeGreaterThan(-1);
  return src.slice(at, at + span);
}

describe('T47E — chọn màn dễ hơn phải đưa bảng về đúng màn đó', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('wrapper chuyển màn bé chọn xuống cho onRestart (không gọi cụt)', () => {
    const body = sliceBody(wrapperSrc, 'const handleSelectTier', 700);
    expect(body).toMatch(/onRestart\(\s*t\s*\)/);
    expect(body).not.toMatch(/onRestart\(\s*\)/);
  });

  it('restartGame nhận màn đích và kẹp (clamp) màn đó, không đọc unlockedTier một cách mù', () => {
    const body = sliceBody(stageSrc, 'const restartGame =', 600);
    expect(body).toMatch(/restartGame\s*=\s*\(\s*targetTier\?\s*:\s*number\s*\)/);
    expect(body).toMatch(/clampTier\(\s*targetTier\s*\?\?\s*StorageService\.getGameProgress/);
  });

  it('một đường duy nhất: không còn jumpToTier chết song song với restartGame(targetTier)', () => {
    expect(stageSrc).not.toContain('jumpToTier');
  });

  it('hồi quy T42/A: chọn màn dễ KHÔNG tụt tiến độ đã mở (chọn màn chỉ mở khoá)', () => {
    StorageService.selectGameTier('number_tower', 5);
    expect(StorageService.getGameProgress('number_tower').unlockedTier).toBe(5);
    StorageService.selectGameTier('number_tower', 1);
    expect(StorageService.getGameProgress('number_tower').unlockedTier).toBe(5);
    expect(StorageService.getGameProgress('number_tower').starsByTier).toEqual({});
  });

  it('hồi quy: chọn màn khó hơn vẫn mở khoá tới màn đó', () => {
    StorageService.selectGameTier('ocean_fishing', 2);
    StorageService.selectGameTier('ocean_fishing', 6);
    expect(StorageService.getGameProgress('ocean_fishing').unlockedTier).toBe(6);
  });

  it('premise của bản sửa: mọi trò nối onRestart thẳng vào restartGame của stage', () => {
    // Chữ ký prop phải chứa được màn đích ⇒ kiểu prop là (targetTier?: number) => void.
    expect(wrapperSrc).toContain('onRestart: (targetTier?: number) => void');
    const dir = join(root, 'src/components/games');
    const files = readdirSync(dir).filter((f) => f.endsWith('Game.tsx'));
    const wired = files.filter((f) => readFileSync(join(dir, f), 'utf8').includes('onRestart={stage.restartGame}'));
    // Không trò nào tự viết onRestart riêng ⇒ sửa framework có tác dụng cho cả ba mươi trò.
    expect(files.length).toBeGreaterThan(0);
    expect(wired.length + 1).toBeGreaterThanOrEqual(files.length);
    expect(wired.length).toBeGreaterThanOrEqual(25);
  });

  it('nút "Chơi lại" thường vẫn restart màn hiện hành (không vô tình đổi màn)', () => {
    const body = sliceBody(wrapperSrc, 'const handleRestart =', 200);
    expect(body).toMatch(/onRestart\(\s*\)/);
  });
});
