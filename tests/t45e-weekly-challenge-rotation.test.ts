/**
 * T45E — Thử Thách Tuần phải xoay theo tuần, nếu không lời hứa "3 Thử Thách Tuần"
 * là thành tựu không thể đạt.
 *
 * `WeeklyChallengeScreen.tsx:36/47/56` dùng **một id cố định**
 * `'weekly-challenge-week-1'`, còn `StorageService.recordWeeklyChallengeCompleted`
 * (`storage.ts:2418-2421`) chỉ đẩy id **mới** vào `completedWeeklyChallenges`.
 * ⇒ bé có làm 52 lần thì mảng vẫn chỉ có MỘT phần tử, trong khi
 * `buildMotivationStats().weeklyChallenges = profile.completedWeeklyChallenges.length`
 * (`storage.ts:1670`) và `achievementCatalog.ts:43` ra điều kiện
 * `ach_weekly_3 … { stat: 'weeklyChallenges', atLeast: 3 }`. Nút "Thi Lại Lấy Điểm
 * Cao" (dòng 105) càng chứng minh chủ ý là làm lại hằng tuần.
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
const ls = globalThis.localStorage as ReturnType<typeof createMockLocalStorage>;

import { StorageService } from '../src/services/storage';
import { weekKeyOf } from '../src/services/streakEngine';
import { evaluateNewAchievements } from '../src/services/achievementEngine';
import { ACHIEVEMENT_CATALOG } from '../src/data/achievementCatalog';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

const streakModule = await import('../src/services/streakEngine');
function idFn(): (day: string) => string {
  const fn = (streakModule as unknown as Record<string, unknown>).weeklyChallengeIdOf;
  if (typeof fn !== 'function') throw new Error('weeklyChallengeIdOf chưa tồn tại ⇒ các test hành vi T45E chưa chạy được');
  return fn as (day: string) => string;
}

describe('T45E — id Thử Thách Tuần xoay theo tuần ISO', () => {
  beforeEach(() => {
    ls.clear();
  });

  it('streakEngine phải export weeklyChallengeIdOf (nơi sinh id duy nhất)', () => {
    expect(typeof (streakModule as unknown as Record<string, unknown>).weeklyChallengeIdOf, 'chưa có hàm sinh id theo tuần').toBe('function');
  });

  it('hai ngày cùng tuần ⇒ cùng id; tuần sau ⇒ id khác', () => {
    const weeklyChallengeIdOf = idFn();
    expect(weeklyChallengeIdOf('2026-11-02')).toBe(weeklyChallengeIdOf('2026-11-08'));
    expect(weeklyChallengeIdOf('2026-11-09')).not.toBe(weeklyChallengeIdOf('2026-11-02'));
    expect(weeklyChallengeIdOf('2026-11-02')).toContain(weekKeyOf('2026-11-02') ?? '');
  });

  it('id sinh ra không phải hằng số cũ', () => {
    const weeklyChallengeIdOf = idFn();
    expect(weeklyChallengeIdOf('2026-11-03')).not.toBe('weekly-challenge-week-1');
  });

  it('làm ba tuần liên tiếp ⇒ completedWeeklyChallenges có 3 mục và stat weeklyChallenges = 3', () => {
    const weeklyChallengeIdOf = idFn();
    const id1 = weeklyChallengeIdOf('2026-11-02');
    const id2 = weeklyChallengeIdOf('2026-11-09');
    const id3 = weeklyChallengeIdOf('2026-11-16');
    StorageService.recordWeeklyChallengeCompleted(id1);
    StorageService.recordWeeklyChallengeCompleted(id2);
    StorageService.recordWeeklyChallengeCompleted(id3);
    expect(StorageService.getChildProfile().completedWeeklyChallenges).toHaveLength(3);
    expect(StorageService.buildMotivationStats().weeklyChallenges).toBe(3);
  });

  it('hai lần trong CÙNG tuần chỉ tính một (chống farm)', () => {
    const weeklyChallengeIdOf = idFn();
    StorageService.recordWeeklyChallengeCompleted(weeklyChallengeIdOf('2026-11-02'));
    StorageService.recordWeeklyChallengeCompleted(weeklyChallengeIdOf('2026-11-05'));
    expect(StorageService.buildMotivationStats().weeklyChallenges).toBe(1);
  });

  it('thành tựu ach_weekly_3 đạt được trên số liệu thật (đo bằng engine, không đoán)', () => {
    const weeklyChallengeIdOf = idFn();
    const rule = ACHIEVEMENT_CATALOG.find((a) => a.id === 'ach_weekly_3');
    expect(rule, 'rule ach_weekly_3 phải còn trong catalogue').toBeTruthy();
    expect(rule?.rule).toEqual({ stat: 'weeklyChallenges', atLeast: 3 });

    StorageService.recordWeeklyChallengeCompleted(weeklyChallengeIdOf('2026-11-02'));
    StorageService.recordWeeklyChallengeCompleted(weeklyChallengeIdOf('2026-11-09'));
    StorageService.recordWeeklyChallengeCompleted(weeklyChallengeIdOf('2026-11-16'));
    const stats = StorageService.buildMotivationStats();
    expect(evaluateNewAchievements(stats, [])).toContain('ach_weekly_3');
  });

  it('màn Thử Thách Tuần không còn hard-code id tuần 1', () => {
    const src = read('src/components/challenge/WeeklyChallengeScreen.tsx');
    expect(src).not.toContain("'weekly-challenge-week-1'");
    expect(src).toContain('weeklyChallengeIdOf');
  });
});
