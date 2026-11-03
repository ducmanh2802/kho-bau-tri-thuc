/**
 * T44/A — mọi khoá `kho_bau_*` của dữ liệu bé phải khai **một lần duy nhất** ở
 * `STORAGE_KEYS` (`src/services/storage.ts:60`).
 *
 * Lý do kiểm kê: DEF-001 (`resetProgress` liệt kê tay 13/17 khoá) đã sửa bằng
 * allowlist, nhưng phép quét đó chỉ nhìn `STORAGE_KEYS`. Một màn hình tự viết
 * literal riêng thì **vô hình** với mọi thứ lấy danh sách từ map:
 * · `src/components/learning/englishIoe/EnglishIoeScreen.tsx:6` khai
 *   `kho_bau_ioe_store` tại chỗ ⇒ "Đặt lại tiến độ" để nguyên cả tiến độ IOE
 *   (câu đã làm, điểm đúng, `examScores`), cloud sync và file export cũng không
 *   bao giờ thấy khoá này;
 * · `src/services/kidBoxStore.ts:35` và `src/services/englishMasteryStore.ts:21`
 *   **Nhân đôi** hai khoá đã có trong map ⇒ đổi tên trong map là kho dữ liệu âm
 *   thầm tách đôi (code mới đọc khoá trống, dữ liệu cũ nằm ở khoá cô đơn).
 *
 * Luật của test (không phải tấm gương của nguồn — nó soi cả file chưa viết):
 * 1. literal `kho_bau_*` chỉ được xuất hiện ở `storage.ts`, trừ hai khoá của
 *    người lớn đã liệt kê tường minh ở `NON_CHILD_KEYS`;
 * 2. mọi literal tìm thấy phải **có mặt** trong `STORAGE_KEYS` ⇒ thêm khoá mới
 *    mà quên khai là đỏ;
 * 3. `resetProgress` phải xoá được khoá dữ liệu bé, kể cả kho IOE.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { StorageService, STORAGE_KEYS } from '../src/services/storage';

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const KEY_OWNER = path.join('services', 'storage.ts');

/**
 * Hai khoá không phải dữ liệu bài làm của bé: cờ phiên đăng nhập
 * (`cloudSync.ts:10`) và **tên event** phát khi storage đổi
 * (`cloudSync.ts:106`, `storage.ts:303`). Ghi tường minh ở đây để ai thêm khoá
 * dữ liệu mới mà né map là test đỏ.
 */
const NON_CHILD_KEYS = ['kho_bau_cloud_session_hint', 'kho_bau_storage_change'] as const;

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listSourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Literal `kho_bau_*` trong code (bỏ dòng comment — chúng ghi hướng dẫn, không khai khoá). */
function keyLiteralsOf(file: string): string[] {
  const found = new Set<string>();
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const code = line.replace(/^\s*(\/\/|\*|\/\*).*$/, '');
    for (const m of code.matchAll(/['"](kho_bau_[a-z0-9_]+)['"]/g)) found.add(m[1]);
  }
  return [...found];
}

const knownKeys = new Set<string>([...Object.values(STORAGE_KEYS), ...NON_CHILD_KEYS]);
const scanned = listSourceFiles(SRC_DIR);

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

if (typeof (globalThis as unknown as Record<string, unknown>).localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: ReturnType<typeof createMockLocalStorage> }).localStorage =
    createMockLocalStorage();
}

describe('T44/A — khoá localStorage khai báo một nơi', () => {
  it('quét được nhiều file hơn không (bảo vệ chính test này)', () => {
    expect(scanned.length).toBeGreaterThan(100);
  });

  it('literal `kho_bau_*` chỉ sống trong storage.ts', () => {
    const offenders: string[] = [];
    for (const file of scanned) {
      if (path.relative(SRC_DIR, file) === KEY_OWNER) continue;
      for (const key of keyLiteralsOf(file)) {
        if (!NON_CHILD_KEYS.includes(key as (typeof NON_CHILD_KEYS)[number])) {
          offenders.push(`${path.relative(SRC_DIR, file)} ⇒ ${key}`);
        }
      }
    }
    expect(offenders, 'khai khoá ở nơi khác thì mọi danh sách lấy từ STORAGE_KEYS đều bỏ sót nó').toEqual([]);
  });

  it('mọi literal tìm thấy đều có trong STORAGE_KEYS', () => {
    const unknown: string[] = [];
    for (const file of scanned) {
      for (const key of keyLiteralsOf(file)) {
        if (!knownKeys.has(key)) unknown.push(`${path.relative(SRC_DIR, file)} ⇒ ${key}`);
      }
    }
    expect(unknown, 'khoá mới phải thêm vào STORAGE_KEYS thì reset/cloud/export mới nhìn thấy').toEqual([]);
  });

  describe('resetProgress với khoá khai trong map', () => {
    beforeEach(() => localStorage.clear());

    it('xoá tiến độ IOE của bé (khoá từng nằm ngoài map)', () => {
      localStorage.setItem(
        'kho_bau_ioe_store',
        JSON.stringify({ answeredIds: ['w1q1'], correctIds: ['w1q1'], bySkill: {}, examScores: [{ at: '2026-11-01', score: 9, total: 10 }] }),
      );

      StorageService.resetProgress();

      expect(localStorage.getItem('kho_bau_ioe_store'), 'IOE là dữ liệu học của bé ⇒ reset phải xoá').toBeNull();
    });

    it('giữ nguyên thiết lập người lớn khi quét', () => {
      localStorage.setItem('kho_bau_ioe_store', '{}');
      localStorage.setItem('kho_bau_parent_settings', JSON.stringify({ nightMode: true }));

      StorageService.resetProgress();

      expect(localStorage.getItem('kho_bau_parent_settings')).toContain('nightMode');
    });

    it('kho IOE nằm trong danh sách quét của resetProgress', () => {
      expect(Object.values(STORAGE_KEYS)).toContain('kho_bau_ioe_store');
    });
  });
});
