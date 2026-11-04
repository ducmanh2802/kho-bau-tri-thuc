/**
 * T49A — quà cấp độ và món đồ mua phải **nằm xuống máy** trước khi app ăn mừng.
 *
 * Đây là anh-em cùng khuôn của `drawGacha` đã đóng ở T48B. Phép đo (2026-11-04,
 * chạy thật, không suy luận):
 *   grep -rn "^\s*StorageService\.save[A-Za-z]*(" src --include=*.ts --include=*.tsx | wc -l  ⇒ **72**
 * lời gọi ghi **bỏ qua** giá trị trả về. `writeJSON` cố ý trả `false` khi trình
 * duyệt chặn ghi (Safari private mode) hoặc hết dung lượng, nên hai chỗ sau hứa
 * những điều chưa xảy ra:
 * · `claimLevelRewards()` cộng sao + đánh dấu "đã nhận" rồi **vứt** kết quả ghi,
 *   vẫn bắn confetti và vẫn ghi biên lai "Quà cấp độ …" vào lịch sử ba mẹ (biên
 *   lai nằm ở key **cài đặt ba mẹ** — key đó ghi được!). Tải lại trang: sao về
 *   như cũ, level lại pending ⇒ mỗi lần bé kiếm thêm XP là một biên lai ảo mới.
 * · `buyShopItem()` trừ sao + mở khoá món rồi bỏ qua kết quả ghi ⇒ nút "Mua" bắn
 *   confetti và đọc "Chúc mừng bé đã mở khóa …" trong khi tải lại trang món vẫn
 *   khoá và sao vẫn nguyên. Nặng hơn máy gắp vì bé tin mình đã tiêu sao.
 *
 * Hai quyết định thiết kế có **lý do**, không phải mặc định:
 * 1) Hồ sơ (sao + món mở khoá) ghi **trước** rồi mới xét. Chặn key hồ sơ ⇒ chưa
 *    ghi gì cả ⇒ lần sau nhận lại đúng quà, không mất, không dồn.
 * 2) Chặn key động lực ⇒ sao đã nằm xuống máy nhưng dấu "đã nhận" thì không ⇒
 *    chọn rủi ro **nhận trùng** (inflation, nhìn thấy được, tự khép khi ghi được)
 *    thay vì **mất quà** (âm thầm, không cách nào chuộc).
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
import { xpForLevel } from '../src/services/levelEngine';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

/** Bé đã đạt tới `level` (chưa nhận thưởng level nào). */
function grantXpToLevel(level: number) {
  const profile = StorageService.getChildProfile();
  profile.xp = xpForLevel(level);
  StorageService.saveChildProfile(profile);
}

function giveStars(count: number) {
  const profile = StorageService.getChildProfile();
  profile.stars = count;
  StorageService.saveChildProfile(profile);
}

/** Biên lai phần thưởng sống ở key **cài đặt ba mẹ** ⇒ bị chặn mới thấy nó ghi thật. */
function receipts(): string[] {
  return (StorageService.getParentSettings().rewardHistory ?? []).map((h) => `${h.type}|${h.description ?? ''}`);
}

function savedStars(): number {
  return StorageService.getChildProfile().stars;
}

function savedClaimedLevels(): number[] {
  return StorageService.getMotivationState().claimedLevelRewards;
}

describe('T49A — quà cấp độ: không ăn mừng và không ghi biên lai khi máy từ chối ghi', () => {
  beforeEach(() => {
    ls.clear();
  });

  it('ghi được ⇒ nhận quà, cộng sao, đánh dấu đã nhận, có biên lai (characterization)', () => {
    grantXpToLevel(6);
    const result = StorageService.claimLevelRewards();
    expect(result.claimed.length).toBeGreaterThan(0);
    expect(result.claimed).toContain(6);
    expect(savedStars()).toBeGreaterThanOrEqual(result.stars);
    expect(savedClaimedLevels()).toContain(6);
    expect(receipts().some((r) => r.includes('Quà cấp độ')), JSON.stringify(receipts())).toBe(true);
  });

  it('chặn hồ sơ + động lực ⇒ claimed rỗng (nguồn của confetti + hộp ăn mừng)', () => {
    grantXpToLevel(6);
    ls.block([STORAGE_KEYS.CHILD_PROFILE, STORAGE_KEYS.MOTIVATION]);
    const result = StorageService.claimLevelRewards();
    expect(result.claimed, `máy không ghi được byte nào mà vẫn báo đã nhận: ${JSON.stringify(result)}`).toEqual([]);
    expect(result.stars).toBe(0);
    expect(result.tickets).toBe(0);
    expect(result.stickerIds).toEqual([]);
  });

  it('khi không ghi được thì biên lai "Quà cấp độ" cũng không được viết (lịch sử ba mẹ là bằng chứng)', () => {
    grantXpToLevel(6);
    ls.block([STORAGE_KEYS.CHILD_PROFILE, STORAGE_KEYS.MOTIVATION]);
    StorageService.claimLevelRewards();
    expect(
      receipts().some((r) => r.includes('Quà cấp độ')),
      `biên lai quà cấp độ xuất hiện dù quà không nằm xuống máy: ${JSON.stringify(receipts())}`
    ).toBe(false);
  });

  it('chặn riêng key hồ sơ ⇒ không đánh dấu "đã nhận" (lỗi: bé mất quà vĩnh viễn, âm thầm)', () => {
    grantXpToLevel(6);
    ls.block([STORAGE_KEYS.CHILD_PROFILE]);
    const before = savedStars();
    const result = StorageService.claimLevelRewards();
    expect(result.claimed).toEqual([]);
    expect(savedStars()).toBe(before);
    expect(savedClaimedLevels(), 'level vẫn phải pending để bé nhận lại khi máy lưu được').not.toContain(6);
  });

  it('chặn riêng key động lực ⇒ không khoe "+N sao" ảo và không viết biên lai', () => {
    grantXpToLevel(6);
    ls.block([STORAGE_KEYS.MOTIVATION]);
    const result = StorageService.claimLevelRewards();
    expect(result.claimed).toEqual([]);
    expect(receipts().some((r) => r.includes('Quà cấp độ'))).toBe(false);
  });

  it('nhận lại sau khi hết chặn vẫn đủ quà (phép thử tự khép của hai đường hỏng)', () => {
    grantXpToLevel(6);
    ls.block([STORAGE_KEYS.CHILD_PROFILE, STORAGE_KEYS.MOTIVATION]);
    expect(StorageService.claimLevelRewards().claimed).toEqual([]);
    ls.clear(); // bỏ chặn + giữ nguyên những gì đã nằm xuống máy
    grantXpToLevel(6);
    const recovered = StorageService.claimLevelRewards();
    expect(recovered.claimed).toContain(6);
  });

  it('tắt phần thưởng: vẫn đánh dấu đã nhận và trả claimed rỗng (characterization, không đổi)', () => {
    const profile = StorageService.getChildProfile();
    profile.xp = xpForLevel(6);
    StorageService.saveChildProfile(profile);
    StorageService.saveParentSettings({ ...StorageService.getParentSettings(), rewardsEnabled: false });
    const result = StorageService.claimLevelRewards();
    expect(result.claimed).toEqual([]);
    expect(receipts()).toEqual([]);
  });
});

describe('T49A — phòng thay đồ: nút "Mua" chỉ được ăn mừng khi sao và món thật sự đổi', () => {
  beforeEach(() => {
    ls.clear();
  });

  it('ghi được ⇒ ok, trừ đúng giá, món mở khoá, có biên lai (characterization)', () => {
    giveStars(1000);
    const bought = StorageService.buyShopItem('shirt_yellow');
    expect(bought.ok, JSON.stringify(bought)).toBe(true);
    const after = StorageService.getChildProfile();
    expect(after.stars).toBeLessThan(1000);
    expect(after.unlockedItems).toContain('shirt_yellow');
    expect(receipts().some((r) => r.includes('Mua')), JSON.stringify(receipts())).toBe(true);
  });

  it('chặn ghi hồ sơ ⇒ reason storage-unavailable, không phải ok (lỗi: confetti + "đã mở khóa")', () => {
    giveStars(1000);
    ls.block([STORAGE_KEYS.CHILD_PROFILE]);
    const bought = StorageService.buyShopItem('shirt_yellow');
    expect(bought.ok, `sao không bị trừ, món không mở khoá mà vẫn báo thành công: ${JSON.stringify(bought)}`).toBe(false);
    expect(bought.reason).toBe('storage-unavailable');
    const after = StorageService.getChildProfile();
    expect(after.stars).toBe(1000);
    expect(after.unlockedItems).not.toContain('shirt_yellow');
  });

  it('chặn ghi hồ sơ ⇒ không viết biên lai "Mua …"', () => {
    giveStars(1000);
    ls.block([STORAGE_KEYS.CHILD_PROFILE]);
    StorageService.buyShopItem('shirt_yellow');
    expect(receipts().some((r) => r.includes('Mua')), JSON.stringify(receipts())).toBe(false);
  });

  it('hồ sơ ghi được nhưng bộ đếm động lực thì hỏng ⇒ vẫn giữ lời hứa (món về, sao tiêu)', () => {
    giveStars(1000);
    ls.block([STORAGE_KEYS.MOTIVATION]);
    const bought = StorageService.buyShopItem('shirt_yellow');
    expect(bought.ok).toBe(true);
    expect(StorageService.getChildProfile().unlockedItems).toContain('shirt_yellow');
  });
});

describe('T49A — hợp đồng chữ: UI và vùng mã sửa', () => {
  it('phòng thay đồ có nhãn riêng cho thất bại **của máy**, không im lặng', () => {
    const ui = read('src/components/shop/AvatarShopScreen.tsx');
    expect(ui).toContain("'storage-unavailable'");
    // T50B — câu chữ chuyển vào một hằng số **export dùng chung** (banner nhìn thấy +
    // giọng đọc), nên "nhãn nằm cạnh nhánh if" không còn là hình dạng đúng của hợp
    // đồng. Giữ nguyên ý: phải có một nhãn "máy không lưu được", nhánh này phải **dùng**
    // nó, và nó phải không phải nhãn "bé thiếu sao".
    const label = ui.match(/export const (NOTICE_\w+)\s*=\s*'([^']*không lưu được[^']*)'/);
    const [, noticeName, noticeText] = label ?? ['', '', ''];
    expect(noticeName, 'phải có nhãn "máy không lưu được" trong một hằng số export').not.toBe('');
    const branch = ui.slice(ui.indexOf("'storage-unavailable'"), ui.indexOf("'storage-unavailable'") + 400);
    expect(branch, `nhánh storage-unavailable không đọc nhãn ${noticeName}`).toContain(noticeName);
    expect(noticeText, 'nhãn của máy lẫn sang chuyện bé thiếu sao').not.toMatch(/sao/);
  });

  it('đường đổi sao/mở khoá không còn bỏ qua kết quả ghi', () => {
    const src = read('src/services/storage.ts');
    const grant = src.slice(
      src.indexOf('for (const level of pending)'),
      src.indexOf('public static resetProgress'),
    );
    const checked = grant.match(
      /(?:const|let)\s+\w*[Ss]aved\w*\s*=\s*StorageService\.save(?:ChildProfile|MotivationState)/g,
    );
    expect(
      (checked ?? []).length,
      'cả hai hàm phải đọc kết quả ghi trước khi hứa (claim: 2, buy: 1)',
    ).toBeGreaterThanOrEqual(3);
    const bare = grant.split('\n').map((l) => l.trim()).filter((l) => /^StorageService\.save[A-Za-z]*\(/.test(l));
    // **Một** ngoại lệ có chủ đích, ghi rõ ở mã nguồn: `shopBoughtTotal` chỉ là bộ
    // đếm nuôi thành tựu, không phải thứ bé nhận được ⇒ nó không được phép lật
    // ngược lời hứa "sao đã tiêu, món đã về" của hồ sơ.
    expect(bare, `chỗ ghi bỏ qua kết quả: ${JSON.stringify(bare)}`).toEqual([
      'StorageService.saveMotivationState(motivation);',
    ]);
  });
});
