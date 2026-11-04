/**
 * T51 — `DEF-022(b)`: **màn Home không ghép lớp trang bị.**
 *
 * Phép đo trên `HEAD` trước khi sửa (2026-11-04):
 *   grep -c equipped src/components/home/HomeScreen.tsx  ⇒ **0**
 *   bước D của probe T50A trên `dist/`, hồ sơ mặc đủ **7** ô ⇒
 *     {"innerHTML":"🦉","mascotText":"🦉","equipLayers":0}
 *   (`evidence/2026-11-04-T50A/probe-PASS.txt`)
 *
 * Hệ quả với bé 6 tuổi: bé mặc mũ, đeo kính, dắt linh thú — nhưng màn bé nhìn **nhiều
 * nhất** (Home) thì nhân vật trụi đồ, còn đồ chỉ hiện ở tủ đồ. Đây là họ "hai màn tự
 * viết một bản đồ riêng" của `DEF-022(a)` (T50A) cộng thêm **phạm vi** chứ không chỉ
 * hình mascot: tủ đồ có `EQUIP_LAYER` + `EQUIP_OVERLAYS`, Home không có gì.
 *
 * Vì sao không bê nguyên `EQUIP_LAYER` sang Home: bản đồ đó định vị bằng offset và cỡ
 * chữ **tĩnh** (`-top-3`, `text-3xl`) cộng hưởng với ô `w-28` của tủ đồ; ô Home là
 * `w-20 sm:w-24 md:w-28`. Ở v-test **v5** nên lớp phải định vị bằng đơn vị **tương đối
 * theo ô** — điều kiện đóng `DEF-022(b)` đã ghi trong `docs/plan/RISK_REGISTER.md`.
 *
 * Test chỉ đi qua **hai màn đã tồn tại** (`HomeScreen`, `AvatarShopScreen`) và hai file
 * nguồn, không import module chưa có ⇒ đỏ vì hành vi thiếu, không đỏ vì thiếu import.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ChildProfile } from '../src/types';
import type { ShopItemType } from '../src/types/motivation';

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
import { SHOP_MASCOTS } from '../src/data/shopCatalog';
import { HomeScreen } from '../src/components/home/HomeScreen';
import { AvatarShopScreen } from '../src/components/shop/AvatarShopScreen';

const here = dirname(fileURLToPath(import.meta.url));
const homeSrc = readFileSync(join(here, '..', 'src', 'components', 'home', 'HomeScreen.tsx'), 'utf8');
const shopSrc = readFileSync(join(here, '..', 'src', 'components', 'shop', 'AvatarShopScreen.tsx'), 'utf8');
const cssSrc = readFileSync(join(here, '..', 'src', 'index.css'), 'utf8');

const noop = () => {};

/** Một món mỗi `type`, lấy theo thứ tự catalogue ⇒ deterministic (không `Math.random`). */
const oneItemPerType = (): Record<string, string> => {
  const picked: Record<string, string> = {};
  for (const item of AVATAR_SHOP_ITEMS) if (!picked[item.type]) picked[item.type] = item.id;
  return picked;
};

const emojiOf = (id: string) => AVATAR_SHOP_ITEMS.find((i) => i.id === id)!.emoji;
const nameOf = (id: string) => AVATAR_SHOP_ITEMS.find((i) => i.id === id)!.name;
const TYPES = Object.keys(oneItemPerType()) as ShopItemType[];

const seedProfile = (equipped: Record<string, string>): ChildProfile => {
  const profile = {
    id: 'child-1',
    name: 'Bé Test',
    grade: 1,
    avatarBase: 'owl',
    equipped,
    xp: 0,
    stars: 30,
    gems: 0,
    tickets: 0,
    streak: 1,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    unlockedItems: Object.values(equipped),
    completedLessons: [],
    completedWeeklyChallenges: [],
  };
  ls.setItem(STORAGE_KEYS.CHILD_PROFILE, JSON.stringify(profile));
  return profile as unknown as ChildProfile;
};

const homeHtml = (equipped: Record<string, string>) =>
  renderToString(
    React.createElement(HomeScreen, {
      profile: seedProfile(equipped),
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

const shopHtml = (equipped: Record<string, string>) => {
  seedProfile(equipped);
  return renderToString(React.createElement(AvatarShopScreen, { onBack: noop, onProfileUpdate: noop }));
};

/** Các lớp trang bị **nhìn thấy được** trong một màn: `type` + emoji vẽ ra. */
const layersOf = (html: string) => {
  const out: Record<string, string> = {};
  for (const m of html.matchAll(/data-equip="([a-z]+)"[^>]*>\s*([^<\s][^<]*)/g)) out[m[1]] = m[2].trim();
  return out;
};

const mascotOf = (html: string) => {
  const m = html.match(/data-avatar-mascot[^>]*>\s*([^<\s][^<]*)/);
  if (!m) throw new Error('không tìm thấy mascot trong preview (markup đã đổi? cập nhật phép đo, đừng bỏ test)');
  return m[1].trim();
};

const previewOf = (html: string) => {
  const m = html.match(/<div[^>]*data-avatar-preview[^>]*>/);
  return m ? m[0] : null;
};

describe('T51 — một preview avatar chung ghép đủ lớp trang bị (DEF-022b)', () => {
  it('v1: hồ sơ mặc đủ 7 ô thì **màn Home** vẽ đủ 7 lớp đúng emoji của món', () => {
    const equipped = oneItemPerType();
    const layers = layersOf(homeHtml(equipped));
    const expected: Record<string, string> = {};
    for (const t of TYPES) expected[t] = emojiOf(equipped[t]);
    expect(Object.keys(expected).length, 'catalogue phải có đủ 7 type để đo').toBe(7);
    expect(layers, `Home mặc ${Object.keys(equipped).length} ô mà chỉ vẽ ${Object.keys(layers).length} lớp`).toEqual(expected);
  });

  it('v2: Home và tủ đồ render **cùng một tập lớp** cho cùng một hồ sơ ⇒ một nguồn duy nhất', () => {
    const equipped = oneItemPerType();
    expect(layersOf(homeHtml(equipped))).toEqual(layersOf(shopHtml(equipped)));
    expect(mascotOf(homeHtml(equipped))).toBe(mascotOf(shopHtml(equipped)));
  });

  it('v3: chống đỏ do dựng sẵn — hồ sơ không mặc gì thì **cả hai** màn không có lớp nào, mascot vẫn nguyên', () => {
    for (const html of [homeHtml({}), shopHtml({})]) {
      expect(layersOf(html)).toEqual({});
      expect(mascotOf(html)).toBe('🦉');
      expect(html).toMatch(/Số sao của bé|Chào|Học tiếp/);
    }
  });

  it('v4: mọi type trong catalogue có **một quy tắc CSS** riêng ⇒ type mới không lọt qua lưới', () => {
    for (const t of TYPES) {
      expect(cssSrc, `type ${t} không có quy tắc lớp trong src/index.css`).toMatch(
        new RegExp(`\\[data-equip=("|')${t}("|')\\]`)
      );
    }
  });

  it('v5: lớp định vị bằng đơn vị **theo ô** (cqi), không px ⇒ ô Home nhỏ hơn ô tủ đồ vẫn đúng tỉ lệ', () => {
    for (const t of TYPES) {
      const rule = cssSrc.match(new RegExp(`\\[data-equip=(?:"|')${t}(?:"|')\\]\\s*\\{([^}]*)\\}`));
      expect(rule, `thiếu quy tắc CSS cho ${t}`).toBeTruthy();
      const body = rule![1];
      expect(body, `lớp ${t} phải định vị/cỡ chữ theo ô (cqi)`).toMatch(/cqi/);
      expect(body, `lớp ${t} dùng px ⇒ sẽ lệch khi ô đổi kích cỡ`).not.toMatch(/\d(px|rem)\b/);
    }
  });

  it('v6: hai màn không tự viết lớp riêng — cùng dùng một component preview', () => {
    expect(homeSrc).toMatch(/import\s+\{?\s*AvatarPreview/);
    expect(shopSrc).toMatch(/import\s+\{?\s*AvatarPreview/);
    expect(homeSrc).toMatch(/<AvatarPreview/);
    expect(shopSrc).toMatch(/<AvatarPreview/);
    // `EQUIP_LAYER`/`EQUIP_OVERLAYS` chỉ được sống ở **một** file, không phải bản sao thứ hai
    const owners = [homeSrc, shopSrc].filter((s) => /EQUIP_LAYER|EQUIP_OVERLAYS/.test(s));
    expect(owners, 'một màn tự giữ bản đồ lớp riêng ⇒ hai màn lại lệch nhau như DEF-022(a)').toEqual([]);
  });

  it('v7: bé dùng màn đọc vẫn biết mình mặc gì — preview có tên, còn lớp trang trí thì im', () => {
    const equipped = oneItemPerType();
    for (const [screen, html] of [
      ['Home', homeHtml(equipped)],
      ['tủ đồ', shopHtml(equipped)],
    ] as const) {
      const tag = previewOf(html);
      expect(tag, `${screen}: preview avatar phải là một node có thuộc tính (role/aria-label)`).toBeTruthy();
      expect(tag, `${screen}: preview phải có role="img"`).toMatch(/role="img"/);
      const label = /aria-label="([^"]*)"/.exec(tag!)![1];
      const mascot = SHOP_MASCOTS.find((m) => m.id === 'owl')!.name;
      expect(label, `${screen}: tên preview phải nói bé đang dùng bạn nào`).toContain(mascot);
      for (const t of TYPES) {
        expect(label, `${screen}: ${t} mặc thật nhưng màn đọc không nói ⇒ bé mù không biết mình mặc gì`).toContain(
          nameOf(equipped[t])
        );
      }
      expect(html).toMatch(/data-avatar-mascot/);
    }
    // các span lớp/mascot là trang trí: **không** được để màn đọc đọc rời từng emoji
    for (const html of [homeHtml(equipped)]) {
      for (const m of html.matchAll(/<(span|div)[^>]*data-equip="[^"]+"[^>]*>/g)) {
        expect(m[0], 'lớp trang bị phải aria-hidden (tên đã nằm ở aria-label của preview)').toMatch(/aria-hidden="true"/);
      }
    }
  });
});
