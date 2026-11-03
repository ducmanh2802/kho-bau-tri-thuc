/**
 * T42/A — bảng "Chọn Màn" không được tự viết tiến độ giả.
 *
 * `GameModalWrapper.handleSelectTier` từng gọi
 * `completeGameTier(gameId, t - 1, 3, 0)` chỉ để `unlockedTier` nhảy tới bậc bé
 * chọn. Hậu quả thật với bé lớp 1:
 * · màn bên dưới được đóng dấu **3 sao dù chưa chơi lần nào**;
 * · lượt chơi **thật** đầu tiên của màn đó đọc `prevBestStars = 3`
 *   (`useGameStage.ts:158`) ⇒ `isNewBest` sai ⇒ `starsAwarded = 0` và XP rơi về
 *   giá "luyện lại" (`Math.round(xpFull * 0.2)`), bé mất phần thưởng của chính
 *   mình;
 * · dashboard ba mẹ hiển thị sao không ai học mà có.
 *
 * Luật đúng: chọn màn chỉ được **mở khoá**, sao/điểm tốt nhất chỉ do lượt chơi
 * thật ghi (`useGameStage.submitCorrect` → `completeGameTier`).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

// data/curriculum tự đăng ký catalogue vào StorageService (T39).
import '../src/data/curriculum';
import { StorageService } from '../src/services/storage';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

const GAME = 'pixel_mosaic';

beforeEach(() => {
  localStorage.clear();
  StorageService.resetGameProgress(GAME);
});

describe('T42/A — chọn màn chỉ mở khoá, không in sao', () => {
  it('nhảy lên Màn 5 không để lại sao hay điểm nào', () => {
    const after = StorageService.selectGameTier(GAME, 5);
    expect(after.unlockedTier).toBe(5);
    expect(after.starsByTier).toEqual({});
    expect(after.bestScoreByTier).toEqual({});
  });

  it('màn đã mở rồi thì chọn màn thấp hơn không kéo tiến độ về sau', () => {
    StorageService.completeGameTier(GAME, 4, 2, 7);
    const after = StorageService.selectGameTier(GAME, 2);
    expect(after.unlockedTier).toBe(5);
    expect(after.starsByTier).toEqual({ 4: 2 });
    expect(after.bestScoreByTier).toEqual({ 4: 7 });
  });

  it('bậc ngoài 1..MAX_TIER bị kẹp, không mở khoá âm', () => {
    expect(StorageService.selectGameTier(GAME, 0).unlockedTier).toBe(1);
    expect(StorageService.selectGameTier(GAME, 99).unlockedTier).toBe(6);
    expect(StorageService.getGameProgress(GAME).starsByTier).toEqual({});
  });

  it('lượt chơi THẬT đầu tiên sau khi chọn màn vẫn được trả đủ XP + sao', () => {
    StorageService.selectGameTier(GAME, 5);
    const prevStars = StorageService.getGameProgress(GAME).starsByTier[5] ?? 0;
    const receipt = StorageService.recordTierReward(GAME, 5, 3, 100, 8, prevStars);
    expect(receipt.isFirstClear).toBe(true);
    expect(receipt.isNewBest).toBe(true);
    expect(receipt.xpAwarded).toBe(100);
    expect(receipt.starsAwarded).toBe(3);
  });

  it('wrapper không còn gọi completeGameTier, và không còn đường nào in sao khi chọn màn', () => {
    const wrapper = read('src/components/games/GameModalWrapper.tsx');
    expect(wrapper).not.toMatch(/completeGameTier\s*\(/);
    expect(wrapper).toMatch(/StorageService\.selectGameTier\(/);
  });

});
