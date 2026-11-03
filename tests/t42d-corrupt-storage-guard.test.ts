/**
 * T42/D — dữ liệu lạ trong `localStorage` không được xoá công sức của bé.
 *
 * Hai lỗ hiện ra khi đọc hồ sơ/phân tích:
 * · `lastActiveDate` chỉ bị kiểm tra `typeof === 'string'` (`storage.ts:1016`),
 *   nên một key hỏng ("03/11/2026", "2026-02-30", chuỗi cloud trôi về) làm
 *   `diffDateKeys` trả `null` ⇒ rơi vào nhánh "nghỉ quá 2 ngày" ⇒ **chuỗi 9 ngày
 *   của bé bị ép về 1** ngay lần đọc kế tiếp;
 * · `recentErrors` chỉ bị kiểm tra `Array.isArray` (`storage.ts:1216`) nên một
 *   phần tử `null` lọt vào mảng. `mergeCloudState`map/đọc `entry.questionId`
 *   (`cloudMerge.ts:346`) ⇒ cả lần đồng bộ crash, báo cáo mất dữ liệu ôn tập.
 *
 * Luật: bộ đếm và chuỗi chỉ tin định dạng thiết bị ghi ra; mục lạ bị **bỏ**,
 * không bị **đọc** và không được kéo dữ liệu thật về 0.
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

import '../src/data/curriculum';
import { StorageService } from '../src/services/storage';
import { mergeCloudState } from '../src/services/cloudMerge';
import { localDateKey } from '../src/services/dateUtils';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

function writeProfile(patch: Record<string, unknown>) {
  const stored = JSON.parse(localStorage.getItem('kho_bau_child_profile') || '{}');
  localStorage.setItem(
    'kho_bau_child_profile',
    JSON.stringify({ ...stored, id: 'child_t42d', streak: 9, ...patch })
  );
}

function writeAnalytics(recentErrors: unknown[]) {
  const stored = JSON.parse(localStorage.getItem('kho_bau_analytics') || '{}');
  localStorage.setItem('kho_bau_analytics', JSON.stringify({ ...stored, recentErrors }));
}

beforeEach(() => {
  localStorage.clear();
});

describe('T42/D — key ngày hỏng không phá chuỗi ngày', () => {
  it('ngày hôm qua hợp lệ vẫn cộng chuỗi lên 10', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    writeProfile({ lastActiveDate: localDateKey(yesterday) });
    expect(StorageService.getChildProfile().streak).toBe(10);
  });

  for (const bad of ['03/11/2026', '2026-02-30', 'hôm qua', '', '2026-13-01', 12345, null]) {
    it(`giá trị ${JSON.stringify(bad)} không được ép chuỗi 9 về 1`, () => {
      writeProfile({ lastActiveDate: bad });
      const profile = StorageService.getChildProfile();
      expect(profile.streak).toBe(9);
    });
  }

  it('key hỏng được sửa lại thành hôm nay nên lần đọc sau không lặp lại bước ngày', () => {
    writeProfile({ lastActiveDate: 'not-a-date' });
    const first = StorageService.getChildProfile();
    expect(first.lastActiveDate).toBe(localDateKey());
    const second = StorageService.getChildProfile();
    expect(second.streak).toBe(first.streak);
  });

  it('nguồn đọc hồ sơ phải kiểm tra định dạng ngày chứ không chỉ typeof', () => {
    expect(read('src/services/storage.ts')).toMatch(/isRealDateKey\(raw\.lastActiveDate\)/);
  });
});

describe('T42/D — mục lỗi trong danh sách câu sai', () => {
  it('mục null / thiếu trường bị loại chứ không làm crash bộ đồng bộ', () => {
    writeAnalytics([null, { questionId: 'q_ok', subject: 'toan', prompt: '1+1', timestamp: '2' }, 'chuỗi', {}]);
    const analytics = StorageService.getAnalytics();
    expect(analytics.recentErrors.map((e) => e.questionId)).toEqual(['q_ok']);
    expect(() => mergeCloudState({
      local: StorageService.getChildProfile(),
      localAnalytics: analytics,
      cloudProfile: { lastActiveDate: localDateKey(), xp: 1 },
      cloudAnalytics: { recentErrors: [null, { questionId: 'q_cloud', subject: 'tieng-viet', prompt: 'a', timestamp: '3' }] },
    })).not.toThrow();
  });

  it('mục lỗi từ cloud cũng bị chặn ở cửa hợp nhất', () => {
    const outcome = mergeCloudState({
      local: StorageService.getChildProfile(),
      localAnalytics: StorageService.getAnalytics(),
      cloudProfile: { lastActiveDate: localDateKey(), xp: 1 },
      cloudAnalytics: { recentErrors: [null, 7, 'x', { questionId: 'q_cloud', subject: 'toan', prompt: 'a', timestamp: '3' }] },
    });
    expect(outcome.analytics.recentErrors.map((e) => e.questionId)).toEqual(['q_cloud']);
  });
});
