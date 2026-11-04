/**
 * T49B — mọi món trong catalogue quà phải **xuất hiện ở một tab**, và mặc vào phải
 * **thấy trên màn hình**.
 *
 * Phép đo (2026-11-04, chạy thật trên `src/data/shopCatalog.ts`):
 *   grep -c "id: '" src/data/shopCatalog.ts            ⇒ 41 món
 *   grep -o "type: '[a-z]*'" src/data/shopCatalog.ts   ⇒ hat 8 · pet 7 · shirt 6 ·
 *     background 6 · frame 5 · glasses 5 · backpack 4
 * còn `AvatarShopScreen.tsx:19` chỉ khai báo tab `mascot | hat | glasses | backpack | pet`
 * và `:97` render bằng `AVATAR_SHOP_ITEMS.filter((i) => i.type === activeTab)`
 * ⇒ **17** món (áo 6 + nền 6 + khung 5) không thuộc tab nào: bé có đủ sao và đủ cấp
 * cũng không bao giờ thấy nút "Mở khóa", dù `buyShopItem()` vẫn nhận id của chúng.
 *
 * Nửa còn lại của cùng một lời hứa: preview chỉ ghép `hat` · `glasses` · `backpack` ·
 * `pet` (`:130-152`). Nếu chỉ thêm tab mà không thêm ô preview thì bé bấm "Áo Choàng
 * Siêu Nhân", nút đổi thành "Đang mặc" mà nhân vật không đổi — một lời dối khác thay
 * chỗ lời dối cũ. Test b6 khoá đúng nửa đó, còn b8 khoá **cả họ** lỗi: mọi `type` phải
 * có một lớp preview, không riêng ba món mà b6 chọn.
 *
 * Chú thích "43 món" đầu `shopCatalog.ts` và ở `storage.ts:343` lệch với số đo 41 ⇒
 * b7 bắt chú thích khớp `SHOP_CATALOG.length`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ChildProfile } from '../src/types';

if (typeof (globalThis as Record<string, unknown>).localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: () => null,
    length: 0,
  } as unknown as Storage;
}
const ls = globalThis.localStorage;

import { AVATAR_SHOP_ITEMS, STORAGE_KEYS } from '../src/services/storage';
import { SHOP_CATALOG, SHOP_MASCOTS } from '../src/data/shopCatalog';
import {
  SHOP_TABS,
  EQUIP_OVERLAYS,
  AvatarShopScreen,
} from '../src/components/shop/AvatarShopScreen';

const here = dirname(fileURLToPath(import.meta.url));
const shopCatalogSrc = readFileSync(join(here, '..', 'src', 'data', 'shopCatalog.ts'), 'utf8');
const storageSrc = readFileSync(join(here, '..', 'src', 'services', 'storage.ts'), 'utf8');

const catalogTypes = [...new Set(AVATAR_SHOP_ITEMS.map((i) => i.type))];
const tabIds = SHOP_TABS.map((t) => t.id);
const screen = () =>
  renderToString(React.createElement(AvatarShopScreen, { onBack: () => {}, onProfileUpdate: () => {} }));

const seedProfile = (over: Record<string, unknown> = {}) => {
  ls.setItem(
    STORAGE_KEYS.CHILD_PROFILE,
    JSON.stringify({
      id: 'child-1',
      name: 'Bé Test',
      grade: 1,
      avatarBase: 'bear',
      equipped: {},
      xp: 0,
      stars: 120,
      gems: 0,
      tickets: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      unlockedItems: [],
      completedLessons: [],
      completedWeeklyChallenges: [],
      ...over,
    }),
  );
};

describe('T49B — catalogue quà và tab của tủ đồ', () => {
  it('b1: 41 món, chia theo type đúng như phép đo', () => {
    expect(SHOP_CATALOG.length).toBe(41);
    expect(AVATAR_SHOP_ITEMS.length).toBe(41);
    const byType: Record<string, number> = {};
    for (const i of AVATAR_SHOP_ITEMS) byType[i.type] = (byType[i.type] ?? 0) + 1;
    expect(byType).toEqual({
      hat: 8,
      pet: 7,
      shirt: 6,
      background: 6,
      frame: 5,
      glasses: 5,
      backpack: 4,
    });
  });

  it('b2: mọi type trong catalogue đều có một tab ⇒ không món nào mồ côi', () => {
    const orphans = catalogTypes.filter((t) => !tabIds.includes(t as never));
    expect(orphans).toEqual([]);
  });

  it('b3: không tab nào rỗng và không món nào rơi ngoài tab', () => {
    let covered = 0;
    for (const tab of SHOP_TABS) {
      const count =
        tab.id === 'mascot' ? SHOP_MASCOTS.length : AVATAR_SHOP_ITEMS.filter((i) => i.type === tab.id).length;
      expect(count, `tab "${tab.label}" mở ra màn trống`).toBeGreaterThan(0);
      if (tab.id !== 'mascot') covered += count;
    }
    expect(covered).toBe(AVATAR_SHOP_ITEMS.length);
  });

  it('b4: mọi type là một ô trang bị thật của hồ sơ ⇒ mặc vào có chỗ chứa', () => {
    // typecheck (`tsc --noEmit`) chặn key lạ; assertion này chặn ô thiếu.
    const slots: ChildProfile['equipped'] = {
      hat: 'hat_cap',
      glasses: 'glasses_nerd',
      shirt: 'shirt_yellow',
      backpack: 'bag_dino',
      pet: 'pet_cat',
      background: 'bg_sea',
      frame: 'frame_gold',
    };
    expect([...Object.keys(slots)].sort()).toEqual([...catalogTypes].sort());
  });

  it('b5: đủ tab hiện trên màn hình, nhãn tiếng Việt, không trùng id', () => {
    seedProfile();
    expect(new Set(tabIds).size).toBe(tabIds.length);
    expect(tabIds).toContain('mascot');
    // `renderToString` escape `&` trong "Mũ & Nón" ⇒ phải giải mã rồi mới so nhãn.
    const html = screen().replace(/&amp;/g, '&');
    for (const tab of SHOP_TABS) {
      expect(tab.label.length).toBeGreaterThan(0);
      expect(html, `tab ${tab.id} có trong danh sách nhưng không được render`).toContain(tab.label);
    }
  });

  it('b6: mặc áo / nền / khung thì nhân vật preview đổi thật', () => {
    // Chọn món có emoji **không trùng icon tab** (tab Nền là 🌊, tab Khung là 🖼️)
    // để phần "không mặc thì không hiện" đo đúng ô preview, không đo nhầm nhãn tab.
    const ids = ['shirt_super', 'bg_forest', 'frame_balloon'];
    seedProfile({
      unlockedItems: ids,
      equipped: { shirt: 'shirt_super', background: 'bg_forest', frame: 'frame_balloon' },
    });
    const emojiOf = (id: string) => AVATAR_SHOP_ITEMS.find((i) => i.id === id)!.emoji;
    const html = screen();
    for (const id of ids) expect(html, `món ${id} mặc vào mà preview không đổi`).toContain(emojiOf(id));

    seedProfile({ unlockedItems: [], equipped: {} });
    const plain = screen();
    for (const id of ids) expect(plain, `preview hiện ${id} dù bé chưa mặc`).not.toContain(emojiOf(id));
  });

  it('b7: chú thích số món trong nguồn khớp số đo (hết "43 món")', () => {
    const n = SHOP_CATALOG.length;
    const comments = [
      shopCatalogSrc.match(/Shop:\s*(\d+)\s*món/)?.[1],
      storageSrc.match(/Shop\s*(\d+)\s*món/)?.[1],
    ];
    for (const c of comments) {
      expect(c, 'thiếu chú thích số món để đối chiếu').toBeTruthy();
      expect(Number(c)).toBe(n);
    }
  });

  it('b8: mọi type có một **lớp preview**, không riêng ba món của b6', () => {
    // `EQUIP_LAYER` là `Record<ShopItemType, string>` nên typecheck đã bắt thiếu;
    // còn `EQUIP_OVERLAYS` là mảng thường ⇒ một `type` mới (hoặc một ô bị gỡ) lọt
    // qua cả `tsc` lẫn b6, đúng kiểu lỗi đang đóng. `background` vẽ làm lớp sau.
    const rendered = [...EQUIP_OVERLAYS, 'background'];
    const missing = catalogTypes.filter((t) => !rendered.includes(t as never));
    expect(missing, `mặc ${missing.join(', ')} vào thì bé không thấy gì trên nhân vật`).toEqual([]);
    expect(new Set(rendered).size).toBe(rendered.length);
    expect(rendered.length).toBe(catalogTypes.length);
  });
});
