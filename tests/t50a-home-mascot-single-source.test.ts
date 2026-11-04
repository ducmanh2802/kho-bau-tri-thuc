/**
 * T50A — `DEF-022(a)`: mascot bé chọn ở tủ đồ phải là **đúng con vật đó** trên màn Home.
 *
 * Phép đo (2026-11-04, trước khi sửa):
 *   grep -n "avatarBase" src/components/home/HomeScreen.tsx
 *     ⇒ 254: {profile.avatarBase === 'bear' ? '🐻' : profile.avatarBase === 'fox' ? '🦊' : '🐰'}
 *   grep -n "avatarBase" src/components/shop/AvatarShopScreen.tsx
 *     ⇒ 181: ternary **4** nhánh (bear/fox/rabbit/owl), còn `src/types/index.ts:133`
 *        khai báo `avatarBase: 'bear' | 'fox' | 'rabbit' | 'owl'`.
 * Hai bản đồ **khác nhau** cho cùng một dữ liệu: bé bấm "Cú Thông Thái" 🦉 trong tủ đồ,
 * quay về màn Home thì cú vẽ thành thỏ 🐰 — và không test nào đỏ vì Home chưa có screen test.
 *
 * Nửa còn lại của `DEF-022` (màn Home không ghép các ô `equipped`) **không** nằm trong lát cắt
 * này — xem `docs/plan/RISK_REGISTER.md` `DEF-022(b)`; ở đây chỉ khoá "một nguồn duy nhất cho
 * hình mascot", tức phần đo được và sửa được mà không đổi layout màn Home.
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

import { STORAGE_KEYS } from '../src/services/storage';
import { MASCOT_EMOJI, SHOP_MASCOTS } from '../src/data/shopCatalog';
import { AvatarShopScreen } from '../src/components/shop/AvatarShopScreen';
import { HomeScreen } from '../src/components/home/HomeScreen';

const here = dirname(fileURLToPath(import.meta.url));
const homeSrc = readFileSync(join(here, '..', 'src', 'components', 'home', 'HomeScreen.tsx'), 'utf8');

const AVATAR_BASES: ChildProfile['avatarBase'][] = ['bear', 'fox', 'rabbit', 'owl'];

const seedProfile = (base: ChildProfile['avatarBase']) => {
  ls.setItem(
    STORAGE_KEYS.CHILD_PROFILE,
    JSON.stringify({
      id: 'child-1',
      name: 'Bé Test',
      grade: 1,
      avatarBase: base,
      equipped: {},
      xp: 0,
      stars: 0,
      gems: 0,
      tickets: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      unlockedItems: [],
      completedLessons: [],
      completedWeeklyChallenges: [],
    }),
  );
  return JSON.parse(ls.getItem(STORAGE_KEYS.CHILD_PROFILE) as string) as ChildProfile;
};

const noop = () => {};

const homeHtml = (base: ChildProfile['avatarBase']) =>
  renderToString(
    React.createElement(HomeScreen, {
      profile: seedProfile(base),
      onNavigate: noop,
      onSelectSubject: noop,
      onOpenGames: noop,
      onOpenDailyReview: noop,
      onOpenWeeklyChallenge: noop,
      onProfileUpdate: noop,
      onOpenParent: noop,
      onOpenLesson: noop,
    })
  );

const shopHtml = (base: ChildProfile['avatarBase']) => {
  seedProfile(base);
  return renderToString(React.createElement(AvatarShopScreen, { onBack: noop, onProfileUpdate: noop }));
};

/**
 * Emoji của bạn mascot **trong ô avatar** — T51 tách preview thành
 * `src/components/common/AvatarPreview.tsx` nên cả hai màn đọc cùng một móc
 * `data-avatar-mascot`, không đo bằng class layout nữa (class đổi là test chết oan).
 */
const avatarEmoji = (html: string, screen: string) => {
  const m = html.match(/data-avatar-mascot[^>]*>\s*([^<\s][^<]*)/);
  if (!m) throw new Error(`${screen}: không tìm thấy mascot trong preview (markup đã đổi? cập nhật phép đo, đừng bỏ test)`);
  return m[1].trim();
};

const homeAvatarEmoji = (html: string) => avatarEmoji(html, 'màn Home');
const shopAvatarEmoji = (html: string) => avatarEmoji(html, 'tủ đồ');

describe('T50A — một nguồn duy nhất cho hình mascot (DEF-022a)', () => {
  it('a1: MASCOT_EMOJI phủ đúng union avatarBase và bốn hình **đôi một khác nhau**', () => {
    expect(Object.keys(MASCOT_EMOJI).sort()).toEqual([...AVATAR_BASES].sort());
    const emojis = Object.values(MASCOT_EMOJI);
    // `DEF-022` đúng là hai bạn trùng hình nhau trên Home ⇒ tiêu chí "bốn bạn phân biệt được"
    // phải đo ở đây, không chỉ đo "Home có vẽ giống tủ đồ không".
    expect(new Set(emojis).size, `emoji trùng nhau: ${emojis.join(' ')}`).toBe(emojis.length);
  });

  it('a2: danh sách chọn bạn và bản đồ hình khớp nhau ⇒ không id nào không có hình', () => {
    const ids = SHOP_MASCOTS.map((m) => m.id);
    expect([...ids].sort()).toEqual([...AVATAR_BASES].sort());
    expect(new Set(ids).size).toBe(ids.length);
    for (const m of SHOP_MASCOTS) expect(MASCOT_EMOJI[m.id], `mascot ${m.id} không có hình`).toBeTruthy();
  });

  it('a3: bé chọn Cú Thông Thái thì màn Home vẽ con cú, không phải con thỏ', () => {
    expect(shopAvatarEmoji(shopHtml('owl'))).toBe('🦉');
    expect(homeAvatarEmoji(homeHtml('owl'))).toBe(MASCOT_EMOJI.owl);
    expect(homeAvatarEmoji(homeHtml('owl'))).not.toBe(MASCOT_EMOJI.rabbit);
  });

  it('a4: màn Home và tủ đồ hiển thị **cùng một hình** cho cả bốn bạn', () => {
    const pairs = AVATAR_BASES.map((base) => ({
      base,
      home: homeAvatarEmoji(homeHtml(base)),
      shop: shopAvatarEmoji(shopHtml(base)),
    }));
    for (const p of pairs) expect(p.home, `${p.base}: Home ${p.home} ≠ tủ đồ ${p.shop}`).toBe(p.shop);
    expect([...new Set(pairs.map((p) => p.home))].length, 'bạn nào cũng giống nhau thì bé không phân biệt được').toBe(4);
  });

  it('a5: Home không tự viết bản đồ emoji riêng — màn chỉ dùng preview chung', () => {
    // Ý gốc của ca này là "Home không có nguồn thứ hai". T51 move `MASCOT_EMOJI` vào
    // `AvatarPreview` ⇒ phép đo đổi **hình dạng** (Home phải *không* còn nhắc bản đồ), ý giữ nguyên.
    expect(homeSrc).toMatch(/<AvatarPreview/);
    expect(homeSrc).not.toMatch(/MASCOT_EMOJI/);
    expect(homeSrc).not.toMatch(/avatarBase === 'bear' \?/);
  });
});
