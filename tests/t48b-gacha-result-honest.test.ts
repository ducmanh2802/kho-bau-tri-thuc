/**
 * T48B — hộp kết quả máy gắp chỉ được hứa những gì thực sự xảy ra.
 *
 * Phép đo trước khi sửa: `grep -rn "StorageService\.save" src | wc -l` = **79** dòng,
 * nhưng `grep -rho "StorageService\.save[A-Za-z]*(" src | wc -l` = **78** lời gọi thật
 * (`readingEngine.ts:536` chỉ là chú thích), và đúng **1** lời gọi đọc giá trị trả về
 * (`storage.ts:1099`).
 * `writeJSON` cố tình trả `false` khi trình duyệt chặn ghi (private mode) hoặc
 * hết dung lượng — `drawGacha` bỏ qua con số đó và vẫn trả `ok: true`, nên màn
 * gắp bắn confetti và ghi "Đã lưu vào Bộ Sưu Tập!" trong khi không có byte nào
 * nằm xuống máy: tải lại trang, sticker lẫn vé đều như cũ.
 *
 * Cùng hộp thoại còn một hứa thứ hai sai: nhãn "Hôm nay bé đã gắp đủ 5 lượt"
 * là hằng số, trong khi giới hạn thật lấy từ cài đặt ba mẹ (`getGachaDailyLimit`,
 * đã sửa ở T45A cho **phần logic** nhưng **câu chữ** vẫn mang con số 5).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  const blocked = new Set<string>();
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      // Khúc mô phỏng Safari private mode / hết quota: ghi là ném, không im lặng.
      if (blocked.has(key)) throw new Error('QuotaExceededError');
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
      blocked.clear();
    },
    block: (keys: string[]) => keys.forEach((k) => blocked.add(k)),
  };
};

if (typeof (globalThis as Record<string, unknown>).localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: ReturnType<typeof createMockLocalStorage> }).localStorage =
    createMockLocalStorage();
}
const ls = globalThis.localStorage as unknown as ReturnType<typeof createMockLocalStorage>;

import { StorageService, STORAGE_KEYS } from '../src/services/storage';
import { STICKERS } from '../src/data/stickers';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

function giveTickets(count: number) {
  const profile = StorageService.getChildProfile();
  profile.tickets = count;
  StorageService.saveChildProfile(profile);
}

/** Số sticker thật nằm trong `localStorage`, đọc bằng đường của chính app. */
function savedStickerCount(): number {
  return Object.keys(StorageService.getMotivationState().stickers).length;
}

describe('T48B — máy gắp không được báo "đã lưu" khi trình duyệt từ chối ghi', () => {
  beforeEach(() => {
    ls.clear();
  });

  it('storage ghi được ⇒ ok, trừ vé, lưu sticker (characterization: hành vi tốt phải giữ nguyên)', () => {
    giveTickets(5);
    const before = StorageService.getChildProfile().tickets;
    const result = StorageService.drawGacha();
    expect(result.ok).toBe(true);
    expect(StorageService.getChildProfile().tickets).toBe(before - 1);
    expect(savedStickerCount()).toBe(1);
  });

  it('chặn ghi hồ sơ + động lực ⇒ không được trả ok (lỗi: ok:true, UI bắn confetti)', () => {
    giveTickets(5);
    ls.block([STORAGE_KEYS.CHILD_PROFILE, STORAGE_KEYS.MOTIVATION]);
    const result = StorageService.drawGacha();
    expect(result.ok, `writeJSON trả false mà vẫn báo thành công: ${JSON.stringify(result)}`).toBe(false);
    expect(result.reason).toBe('storage-unavailable');
  });

  it('khi không ghi được, kết quả không được kèm stickerId/isNew (nguồn của nhãn "Đã lưu")', () => {
    giveTickets(5);
    ls.block([STORAGE_KEYS.CHILD_PROFILE, STORAGE_KEYS.MOTIVATION]);
    const result = StorageService.drawGacha();
    expect(result.stickerId, 'sticker không nằm xuống máy ⇒ không có sticker để khoe').toBeUndefined();
    expect(!!result.isNew).toBe(false);
  });

  it('chặn riêng key động lực (sticker mất) ⇒ vẫn honest (lỗi: chỉ lo key hồ sơ)', () => {
    giveTickets(5);
    ls.block([STORAGE_KEYS.MOTIVATION]);
    const result = StorageService.drawGacha();
    expect(result.ok).toBe(false);
    expect(savedStickerCount()).toBe(0);
  });

  it('chặn riêng key hồ sơ (vé mất) ⇒ vẫn honest, không khoe "+2 sao an ủi" ảo', () => {
    giveTickets(5);
    // Sở hữu đủ 60 sticker; 4 bản trùng + 1 sticker vừa gắp ⇒ `dupes` của chính
    // drawGacha là 5, đủ để điều kiện "5 sticker trùng tặng 2 sao" bật.
    const motivation = StorageService.getMotivationState();
    const owned: Record<string, number> = {};
    STICKERS.forEach((s, i) => { owned[s.id] = i < 4 ? 2 : 1; });
    motivation.stickers = owned;
    StorageService.saveMotivationState(motivation);
    ls.block([STORAGE_KEYS.CHILD_PROFILE]);
    // rng = 0 ⇒ STICKERS[0], một sticker đã trùng ⇒isNew false, sao an ủi = 2.
    const result = StorageService.drawGacha(() => 0);
    expect(result.ok).toBe(false);
    expect(result.consolationStars || 0).toBe(0);
    // Lịch sử phần thưởng nằm ở key **cài đặt ba mẹ** (không bị chặn) ⇒ nếu biên lai
    // sao ghi trước khi phần thưởng nằm xuống máy thì nó kể một món quà chưa từng có.
    const history = StorageService.getParentSettings().rewardHistory ?? [];
    expect(
      history.some((h) => (h.description ?? '').includes('sao an ủi')),
      `biên lai sao an ủi xuất hiện dù lượt gắp không lưu được: ${JSON.stringify(history)}`
    ).toBe(false);
  });

  it('hộp kết quả nói số lượt theo cài đặt ba mẹ, không hardcode "5 lượt"', () => {
    const ui = read('src/components/motivation/GachaMachineScreen.tsx');
    expect(ui, 'câu chữ còn mang con số 5 trong khi trần thật lấy từ ba mẹ').not.toMatch(/gắp đủ 5 lượt/);
    expect(ui).toMatch(/gắp đủ[^\n]*\$\{(dailyLimit|dailyLimitLabel)\}/);
  });

  it('thất bại lưu trữ phải có nhãn riêng, không rơi vào nhãn "hết lượt"', () => {
    const ui = read('src/components/motivation/GachaMachineScreen.tsx');
    expect(ui).toContain("'storage-unavailable'");
    expect(ui).toMatch(/storage-unavailable[\s\S]{0,400}không lưu được/);
  });

  it('toàn bộ lời hứa của drawGacha đi qua một cửa: không còn chỗ nào bỏ qua writeJSON false', () => {
    const src = read('src/services/storage.ts');
    const drawBody = src.slice(src.indexOf('static drawGacha'), src.indexOf('static claimLevelRewards'));
    expect(drawBody).toMatch(/saveChildProfile\([^)]*\)/);
    expect(
      /(?:const|let)\s+\w*[Ss]aved\w*\s*=\s*StorageService\.save(?:ChildProfile|MotivationState)/.test(drawBody),
      'drawGacha phải đọc kết quả ghi trước khi hứa ok'
    ).toBe(true);
  });
});
