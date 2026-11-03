/**
 * T47C — ba mẹ đổi cài đặt xong, máy khác không bao giờ thấy.
 *
 * `src/services/storage.ts:1268-1274` (saveParentSettings) ghi thẳng
 * `localStorage.setItem(...)` trong khi mọi kho dữ liệu của bé đều đi qua
 * `writeJSON` (`src/services/storage.ts:305-312`). `writeJSON` là chỗ **duy nhất**
 * phát `CustomEvent('kho_bau_storage_change')`, và `src/services/cloudSync.ts:106`
 * nghe đúng event đó để hẹn giờ auto-sync. Hệ quả:
 *
 *   - thay đổi trong tab/máy khác không tự cập nhật (`useParentSettings`-style listeners
 *     bỏ qua key này),
 *   - ba mẹ đã đăng nhập đồng bộ đám mây thì quyền kiểm soát (giờ học, phần thưởng,
 *     độ khó) **không bao giờ được đẩy lên** — bé vẫn học theo cài đặt cũ ở máy khác,
 *     và người lớn tưởng mình đã chặn.
 *
 * Sửa trong phạm vi một writer: `saveParentSettings` dùng `writeJSON` như các kho khác.
 * (Còn vài chỗ `setItem` thô khác trong `StorageService`; đợt này không đổi hàng loạt để
 * mỗi lần đổi cơ chế phát event chỉ có một nghi phạm.)
 */
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
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

const { StorageService, STORAGE_KEYS } = await import('../src/services/storage');
const { writeJSON } = await import('../src/services/storage');

type Dispatched = { type: string; detail?: { key?: string } };

const hadWindow = typeof (globalThis as unknown as { window?: unknown }).window !== 'undefined';
let dispatched: Dispatched[] = [];

function installFakeWindow() {
  dispatched = [];
  (globalThis as unknown as { window: unknown }).window = {
    dispatchEvent: (event: Dispatched) => {
      dispatched.push(event);
      return true;
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

function settingsWith(dailyLimitMinutes: number) {
  return {
    ...StorageService.getParentSettings(),
    dailyLimitMinutes,
  } as unknown as Parameters<typeof StorageService.saveParentSettings>[0];
}

describe('T47C — saveParentSettings phải phát kho_bau_storage_change', () => {
  beforeEach(() => {
    localStorage.clear();
    installFakeWindow();
  });

  afterEach(() => {
    if (!hadWindow) delete (globalThis as unknown as { window?: unknown }).window;
    vi.restoreAllMocks();
  });

  it('kho khác (child profile) đã phát event — chứng minh bộ giả window bắt đúng', () => {
    StorageService.saveChildProfile({ ...StorageService.getChildProfile(), name: 'Bé Tí' } as never);
    expect(dispatched.some((e) => e.type === 'kho_bau_storage_change')).toBe(true);
  });

  it('lưu cài đặt ba mẹ ⇒ phát kho_bau_storage_change với đúng key', () => {
    StorageService.saveParentSettings(settingsWith(15));
    const keys = dispatched
      .filter((e) => e.type === 'kho_bau_storage_change')
      .map((e) => e.detail?.key);
    expect(keys).toContain(STORAGE_KEYS.PARENT_SETTINGS);
  });

  it('dữ liệu vẫn ghi xuống và đọc lại đúng (sửa không làm hỏng round-trip)', () => {
    StorageService.saveParentSettings(settingsWith(10));
    expect(localStorage.getItem(STORAGE_KEYS.PARENT_SETTINGS)).toContain('10');
    expect(StorageService.getParentSettings().dailyLimitMinutes).toBe(10);
  });

  it('không còn `localStorage.setItem` thô trong saveParentSettings', () => {
    const at = storageSrc.indexOf('public static saveParentSettings');
    const body = storageSrc.slice(at, at + 260);
    expect(body).toContain('writeJSON(STORAGE_KEYS.PARENT_SETTINGS');
    expect(body).not.toMatch(/localStorage\.setItem\(/);
  });

  it('hồi quy: localStorage hỏng (private mode / hết chỗ) ⇒ không ném, bé vẫn dùng tiếp', () => {
    StorageService.saveParentSettings(settingsWith(20));
    localStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };
    expect(() => StorageService.saveParentSettings(settingsWith(30))).not.toThrow();
  });

  it('writer mà màn Ba Mẹ dùng chính là hàm này (không phải setItem ở UI)', () => {
    const ui = read('src/components/parent/ParentDashboardModal.tsx');
    expect(ui).toMatch(/StorageService\.saveParentSettings\(/);
    expect(ui).not.toMatch(/localStorage\.setItem\(\s*['"]kho_bau_parent_settings/);
  });

  it('writeJSON giữ nguyên hành vi làm tham chiếu (kéo được từ cùng source)', () => {
    expect(storageSrc).toMatch(
      /window\.dispatchEvent\(new CustomEvent\('kho_bau_storage_change'/
    );
    expect(typeof writeJSON).toBe('function');
  });
});
