/**
 * T45A — máy gắp sticker phải nghe cài đặt "Số lượt gắp mỗi ngày" của ba mẹ.
 *
 * Hai đường lệch nhau đã đo trong source:
 *  - `GachaMachineScreen.tsx` tự giữ `const MAX_DAILY_DRAWS = 5` nên bé bị chặn
 *    ở lượt 5 dù ba mẹ đặt 10, và màn hình in "x / 5" dù ba mẹ đặt ∞ (0).
 *  - `StorageService.drawGacha` đổi `0 → 5`, trong khi UI ba mẹ render `0` thành
 *    "∞" và `t18a` ghi rõ "maxGachaPerDay=0 nghĩa là không giới hạn".
 * Test `t18a` chỉ assert **giá trị lưu** nên hành vi thật chưa từng bị khoá.
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

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

function setLimit(value: number) {
  StorageService.saveParentSettings({ ...StorageService.getParentSettings(), maxGachaPerDay: value });
}

function giveTickets(count: number) {
  const profile = StorageService.getChildProfile();
  profile.tickets = count;
  StorageService.saveChildProfile(profile);
}

describe('T45A — giới hạn gắp lấy từ cài đặt ba mẹ, không phải hằng số của UI', () => {
  beforeEach(() => {
    ls.clear();
  });

  it('đặt 3 lượt/ngày ⇒ lượt thứ 4 bị chặn (hành vi đã đúng, giữ làm baseline)', () => {
    setLimit(3);
    giveTickets(20);
    for (let i = 0; i < 3; i += 1) {
      expect(StorageService.drawGacha().ok).toBe(true);
    }
    expect(StorageService.drawGacha().reason).toBe('daily-limit');
  });

  it('đặt 0 = KHÔNG giới hạn ⇒ 12 lượt liên tiếp đều ăn (lỗi: drawGacha ép 0 thành 5)', () => {
    setLimit(0);
    giveTickets(30);
    for (let i = 0; i < 12; i += 1) {
      const result = StorageService.drawGacha();
      expect(result.ok, `lượt ${i + 1} bị chặn oan: ${result.reason}`).toBe(true);
    }
  });

  it('đặt 10 lượt ⇒ được đúng 10, chặn lượt 11', () => {
    setLimit(10);
    giveTickets(30);
    for (let i = 0; i < 10; i += 1) {
      expect(StorageService.drawGacha().ok).toBe(true);
    }
    expect(StorageService.drawGacha().reason).toBe('daily-limit');
  });

  it('getGachaDailyLimit(): null khi 0 (∞), đúng số khi > 0', () => {
    const withNull = (StorageService as unknown as Record<string, unknown>).getGachaDailyLimit;
    expect(typeof withNull, 'StorageService phải lộ getGachaDailyLimit cho UI dùng chung một nguồn thật').toBe('function');
    setLimit(0);
    expect((StorageService as unknown as { getGachaDailyLimit: () => number | null }).getGachaDailyLimit()).toBeNull();
    setLimit(7);
    expect((StorageService as unknown as { getGachaDailyLimit: () => number | null }).getGachaDailyLimit()).toBe(7);
  });

  it('màn máy gắp không còn tự đặt trần 5, mà đọc getGachaDailyLimit + in ∞ khi không giới hạn', () => {
    const ui = read('src/components/motivation/GachaMachineScreen.tsx');
    expect(ui).not.toMatch(/const MAX_DAILY_DRAWS\s*=\s*5/);
    expect(ui).toContain('getGachaDailyLimit');
    expect(ui).toContain('∞');
  });
});
