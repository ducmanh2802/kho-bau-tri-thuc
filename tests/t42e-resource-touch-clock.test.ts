/**
 * T42/E — tài nguyên tiêu được phải theo **mốc giờ thay đổi**, không theo ngày.
 *
 * T41D bỏ `Math.max` cho sao/vé/ngọc và thay bằng luật "máy nào chạm gần đây
 * nhất thắng" (`cloudMerge.ts` dùng `lastActiveDate`). Luật đó **không bao giờ
 * chạy được**: `getChildProfile()` chuẩn hoá `lastActiveDate` về hôm nay ngay
 * trong lần đọc (`storage.ts`), và `pullAndMergeCloudData` luôn đọc local sau
 * khi chờ mạng ⇒ `cloud.lastActiveDate > local.lastActiveDate` luôn sai vì hai
 * vế đều là hôm nay. Kết quả là bug T41D quay về đúng nguyên văn:
 *
 *   máy A còn 10 vé ⇒ B chơi hết còn 3 vé và đẩy lên cloud ⇒ A đồng bộ cùng
 *   ngày ⇒ local thắng ⇒ A vẫn 10 vé và **đẩy ngược 10 vé lên cloud**. Bé mất 7
 *   vé không bao giờ lấy lại được; cloud cũng thành số ảo.
 *
 * Fix: hồ sơ mang `stateTouchedAt` (ISO) — chỉ nhích khi một trường thuộc nhóm
 * "có tăng có giảm" (sao/vé/ngọc/avatar/trang bị/khoá điều khiển) thực sự đổi,
 * và **không** nhích khi lần ghi đến từ chính bộ đồng bộ. Hợp nhất so sánh mốc
 * đó; hai bên chưa có mốc (bản dữ liệu trước T42/E) thì mới dùng lại ngày.
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
import type { ChildProfile } from '../src/types';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

const T0 = '2026-11-03T00:00:00.000Z';
const LATER = '2026-11-03T09:30:00.000Z';

function local(patch: Partial<ChildProfile> = {}): ChildProfile {
  return { ...StorageService.getChildProfile(), id: 'child_t42e', ...patch };
}

function merge(localProfile: ChildProfile, cloudPatch: Record<string, unknown>, cloudProfilePresent = true) {
  return mergeCloudState({
    local: localProfile,
    localAnalytics: StorageService.getAnalytics(),
    cloudProfile: cloudProfilePresent ? { xp: 1, lastActiveDate: '2026-11-03', ...cloudPatch } : null,
    cloudAnalytics: null,
  });
}

beforeEach(() => {
  localStorage.clear();
});

describe('T42/E — mốc giờ thay đổi trạng thái do storage ghi', () => {
  it('tiêu vé làm mốc nhích lên', () => {
    StorageService.saveChildProfile(local({ tickets: 10, stateTouchedAt: T0 }));
    const after = local({ tickets: 3, stateTouchedAt: T0 });
    StorageService.saveChildProfile(after);
    const stored = StorageService.getChildProfile();
    expect(stored.tickets).toBe(3);
    expect(stored.stateTouchedAt).not.toBe(T0);
  });

  it('chỉ đổi XP hoặc ngày hoạt động thì mốc giữ nguyên (không được cướp quyền quyết)', () => {
    StorageService.saveChildProfile(local({ xp: 10, tickets: 10, stateTouchedAt: T0 }));
    StorageService.saveChildProfile(local({ xp: 999, tickets: 10, stateTouchedAt: T0, lastActiveDate: '2020-01-01' }));
    expect(StorageService.getChildProfile().stateTouchedAt).toBe(T0);
  });

  it('bộ đồng bộ ghi kết quả hợp nhất xuống máy thì mốc không nhích', () => {
    StorageService.saveChildProfile(local({ tickets: 10, stateTouchedAt: T0 }));
    StorageService.withoutStateTouch(() =>
      StorageService.saveChildProfile(local({ tickets: 3, stateTouchedAt: LATER }))
    );
    expect(StorageService.getChildProfile().stateTouchedAt).toBe(LATER);
  });
});

describe('T42/E — hợp nhất theo mốc, không theo max', () => {
  it('cùng một ngày nhưng cloud tiêu vé sau ⇒ cloud thắng (bug T41D sống lại)', () => {
    const out = merge(local({ tickets: 10, stars: 8, stateTouchedAt: T0 }), {
      tickets: 3,
      stars: 2,
      stateTouchedAt: LATER,
      lastActiveDate: '2026-11-03',
    });
    expect(out.profile.tickets).toBe(3);
    expect(out.profile.stars).toBe(2);
    expect(out.trace).toContain('tickets:from_cloud');
  });

  it('máy này vừa tiêu ⇒ local thắng dù cloud cùng ngày', () => {
    const out = merge(local({ tickets: 4, stateTouchedAt: LATER }), {
      tickets: 10,
      stateTouchedAt: T0,
      lastActiveDate: '2026-11-03',
    });
    expect(out.profile.tickets).toBe(4);
  });

  it('hợp nhất hai lần liên tiếp không in thêm vé (kết quả là bất động điểm)', () => {
    const cloudPatch = { tickets: 3, stateTouchedAt: LATER };
    const first = merge(local({ tickets: 10, stateTouchedAt: T0 }), cloudPatch);
    const second = merge(first.profile, cloudPatch);
    expect(second.profile.tickets).toBe(first.profile.tickets);
    expect(second.profile.stateTouchedAt).toBe(first.profile.stateTouchedAt);
    expect(second.trace).not.toContain('tickets:from_cloud');
  });

  it('hồ sơ cũ chưa có mốc thì vẫn dùng ngày hoạt động (luật T41D, không hồi quy)', () => {
    const out = merge(local({ tickets: 10, lastActiveDate: '2026-11-01' }), { tickets: 3 });
    expect(out.profile.tickets).toBe(3);
  });

  it('mốc thắng điều khiển trang bị và khoá của ba mẹ, avatar theo cùng luật', () => {
    const out = merge(local({ avatarBase: 'bear', unlockAllLessons: true, stateTouchedAt: T0 }), {
      avatarBase: 'owl',
      unlockAllLessons: false,
      stateTouchedAt: LATER,
    });
    expect(out.profile.avatarBase).toBe('owl');
    expect(out.profile.unlockAllLessons).toBe(false);
  });

  it('đọc bản cloud hợp nhất rồi ghi xuống máy (đường cloudSync) giữ nguyên mốc của bên thắng', () => {
    const out = merge(local({ tickets: 10, stateTouchedAt: T0 }), { tickets: 3, stateTouchedAt: LATER });
    expect(out.profile.stateTouchedAt).toBe(LATER);
    StorageService.withoutStateTouch(() => StorageService.saveChildProfile(out.profile));
    expect(StorageService.getChildProfile().stateTouchedAt).toBe(LATER);
    expect(StorageService.getChildProfile().tickets).toBe(3);
  });

  it('cloudSync phải ghi kết quả hợp nhất trong ô câm (không tự nhích mốc)', () => {
    expect(read('src/services/cloudSync.ts')).toMatch(
      /withMutedLocalWrites\(\(\) => StorageService\.saveChildProfile\(outcome\.profile\)\)/
    );
  });

  it('storage không được chuẩn hoá lastActiveDate rồi để cloudMerge tưởng là đồng hồ', () => {
    // Bất biến: cloudMerge phải có mốc giờ riêng; nếu nó còn chỉ nhìn
    // `lastActiveDate` thì luật "máy chạm muộn hơn thắng" vẫn chết.
    expect(read('src/services/cloudMerge.ts')).toMatch(/stateTouchedAt/);
  });
});
