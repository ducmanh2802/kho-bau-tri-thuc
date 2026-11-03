/**
 * T43/A — "Đặt lại tiến độ" phải quét **hết** dữ liệu của bé.
 *
 * `resetProgress()` (`src/services/storage.ts:2690`) liệt kê thủ công 13/17 khoá
 * `kho_bau_*` trong `STORAGE_KEYS` (`storage.ts:60`). Bốn khoá bị bỏ:
 * · `kho_bau_review_days` — số ngày bé hoàn thành ôn tập hằng ngày (`storage.ts:2337`);
 * · `kho_bau_game_first_seen` — ngày bé thấy mỗi trò chơi lần đầu (`storage.ts:2202`);
 * · `kho_bau_tree_water` — ngày tưới cây gần nhất (`storage.ts:1686`);
 * · `kho_bau_parent_settings` — thiết lập của người lớn, **cố ý giữ**.
 *
 * Ba khoá đầu làm lời hứa trên màn hình sai thật: nút báo "Đã đặt lại tiến độ về
 * dữ liệu mới tinh ban đầu!" (`ParentDashboardModal.tsx:280`) nhưng cây vẫn được
 * coi là đã tưới hôm nay (confetti/quest không bắn lại), nhãn "MỚI" của trò chơi
 * vẫn biến mất theo ngày cũ, và lịch sử ngày ôn tập vẫn cộng dồn sang "lần chơi
 * đầu tiên" của bé.
 *
 * Luật: danh sách khoá lấy **từ** `STORAGE_KEYS` trừ một allowlist có chủ đích,
 * nên thêm khoá mới bắt buộc phải quyết định quét hay giữ — không âm thầm sót.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../src/services/storage';

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

/**
 * Toàn bộ khoá app ghi xuống `localStorage`, viết tay ở đây (không nhập từ
 * `storage.ts`) để test là **mô tả hành vi**, không phải tấm gương của nguồn.
 */
const CHILD_DATA_KEYS = [
  'kho_bau_child_profile',
  'kho_bau_analytics',
  'kho_bau_daily_quests',
  'kho_bau_achievements',
  'kho_bau_competition_history',
  'kho_bau_learning_os_store',
  'kho_bau_reading_store',
  'kho_bau_kidbox_store',
  'kho_bau_english_mastery_store',
  'kho_bau_game_progress',
  'kho_bau_review_days',
  'kho_bau_game_nonce',
  'kho_bau_game_first_seen',
  'kho_bau_tree_water',
  'kho_bau_motivation',
  'kho_bau_cotuong_puzzles',
] as const;

/** Thiết lập của người lớn (đêm/sẩm/âm thanh) — reset tiến độ không được đụng vào. */
const KEEP_KEYS = ['kho_bau_parent_settings', 'kho_bau_cloud_session_hint'] as const;

function seedEveryKey(): void {
  for (const key of [...CHILD_DATA_KEYS, ...KEEP_KEYS]) {
    localStorage.setItem(key, key === 'kho_bau_cloud_session_hint' ? '1' : JSON.stringify({ seeded: key }));
  }
}

describe('T43/A — resetProgress quét sạch dữ liệu của bé', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('xoá mọi khoá dữ liệu bé, kể cả ba khoá vốn bị sót', () => {
    seedEveryKey();

    StorageService.resetProgress();

    for (const key of CHILD_DATA_KEYS) {
      expect(localStorage.getItem(key), `kho "${key}" phải bị xoá bởi resetProgress`).toBeNull();
    }
  });

  it('giữ thiết lập và phiên đăng nhập của người lớn', () => {
    seedEveryKey();

    StorageService.resetProgress();

    for (const key of KEEP_KEYS) {
      expect(localStorage.getItem(key), `kho "${key}" là của người lớn, phải còn`).not.toBeNull();
    }
  });

  it('lịch sử ngày ôn tập về trắng sau reset', () => {
    StorageService.saveReviewCompletedDays(['2026-11-01', '2026-11-02']);
    expect(StorageService.getReviewCompletedDays()).toEqual(['2026-11-01', '2026-11-02']);

    StorageService.resetProgress();

    expect(StorageService.getReviewCompletedDays()).toEqual([]);
  });

  it('cây trở lại trạng thái chưa tưới để bé nhận confetti của ngày mới', () => {
    StorageService.setTreeWateredDate('2026-11-03');
    expect(StorageService.getTreeWateredDate()).toBe('2026-11-03');

    StorageService.resetProgress();

    expect(StorageService.getTreeWateredDate()).toBeNull();
  });

  it('nhãn "MỚI" và ngày thấy lần đầu của trò chơi bị xoá theo hồ sơ', () => {
    StorageService.markGameSeen('ocean-count', '2026-09-01');
    expect(StorageService.getGameFirstSeen('ocean-count')).toBe('2026-09-01');

    StorageService.resetProgress();

    // Sau reset, app xử lý như cài mới: chưa có ngày thấy nào được ghi trước đó.
    expect(localStorage.getItem('kho_bau_game_first_seen')).toBeNull();
  });
});
