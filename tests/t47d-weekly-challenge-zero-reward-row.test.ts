/**
 * T47D — "Hoàn thành Thử Thách Tuần" +0 XP xuất hiện **mỗi lần** bấm, không phải mỗi tuần.
 *
 * `src/services/storage.ts:2420-2429` (recordWeeklyChallengeCompleted):
 *
 *   if (!profile.completedWeeklyChallenges.includes(challengeId)) { ...lưu tiến độ... }
 *   StorageService.recordQuestEvent({ kind: 'weekly' });
 *   StorageService.addRewardHistory({ type: 'xp', amount: 0, description: 'Hoàn thành Thử Thách Tuần', ... });
 *
 * Dòng cuối nằm **ngoài** nhánh "vừa hoàn thành lần đầu" ⇒ mỗi lần màn hình Challenge gọi
 * lại (bé mở lại bảng, bấm nút lần nữa, hay `WeeklyChallengeScreen.tsx:63` chạy theo effect)
 * là lịch sử phần thưởng của ba mẹ nhận thêm một dòng **+0 XP**:
 *
 *   - bảng "Phần thưởng" đầy rác lặp lại, 50 mục tối đa (`addRewardHistory`, dòng 2621) bị
 *     chèn bởi những dòng vô nghĩa ⇒ phần thưởng *thật* của bé bị đẩy ra khỏi danh sách;
 *   - vi phạm nguyên tắc T41C đã ghi ở `GameModalWrapper`: dải thưởng chỉ in đúng số thật
 *     sự vào túi bé. Ở đây số đó là 0 — tức không có phần thưởng nào để in.
 *
 * Phần thưởng thật của Thử Thách Tuần do engine nhiệm vụ ghi (`recordQuestEvent` →
 * `addRewardHistory({ type: 'quest', amount: q.rewardStars, ... })`, dòng 1629). Sửa: bỏ
 * dòng +0, không thêm dòng giả khác.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
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
const storageSrc = read('src/services/storage.ts');

const { StorageService } = await import('../src/services/storage');

const CHALLENGE = 'weekly-challenge-week-1';

function historyForChallenge() {
  return StorageService.getParentSettings().rewardHistory.filter((e) => e.itemId === CHALLENGE);
}

describe('T47D — Thử Thách Tuần không ghi dòng thưởng +0 lặp lại', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('bấm hoàn thành 3 lần ⇒ lịch sử không nhận 3 dòng về cùng một thử thách', () => {
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    expect(historyForChallenge().length).toBeLessThanOrEqual(1);
  });

  it('lần bấm lặp không làm lịch sử phần thưởng dài thêm', () => {
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    const afterFirst = StorageService.getParentSettings().rewardHistory.length;
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    expect(StorageService.getParentSettings().rewardHistory.length).toBe(afterFirst);
  });

  it('không còn dòng giả "+0 XP" cho thử thách (nguyên tắc T41C: chỉ in số thật vào túi bé)', () => {
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    const zero = historyForChallenge().filter((e) => e.type === 'xp' && e.amount === 0);
    expect(zero.length).toBe(0);
  });

  it('tiến độ vẫn đúng: id chỉ được ghi một lần vào completedWeeklyChallenges', () => {
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    StorageService.recordWeeklyChallengeCompleted(CHALLENGE);
    const done = StorageService.getChildProfile().completedWeeklyChallenges;
    expect(done.filter((id) => id === CHALLENGE).length).toBe(1);
  });

  it('đường ghi phần thưởng thật (engine nhiệm vụ) vẫn còn, không bị xoá kèm', () => {
    const at = storageSrc.indexOf('public static recordWeeklyChallengeCompleted');
    const body = storageSrc.slice(at, at + 900);
    expect(body).toContain("StorageService.recordQuestEvent({ kind: 'weekly' })");
  });

  it('hồi quy diện rộng: 50 mục lịch sử không bị dòng vô nghĩa chiếm chỗ', () => {
    for (let i = 0; i < 60; i += 1) StorageService.recordWeeklyChallengeCompleted(`${CHALLENGE}-${i}`);
    const history = StorageService.getParentSettings().rewardHistory;
    expect(history.length).toBeLessThanOrEqual(50);
    expect(history.filter((e) => e.amount === 0).length).toBe(0);
  });
});
