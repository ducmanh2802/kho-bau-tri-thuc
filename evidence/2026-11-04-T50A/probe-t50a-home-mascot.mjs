// T50A — bằng chứng chạy thật cho `DEF-022(a)`: hồ sơ cho phép **bốn** `avatarBase`
// nhưng màn Home từng vẽ bằng ternary **ba** nhánh ⇒ bé chọn "Cú Thông Thái" (🦉),
// quay về Home thì cú hóa thỏ (🐰). Sau T50A cả Home lẫn tủ đồ đọc cùng một
// `MASCOT_EMOJI` trong `src/data/shopCatalog.ts`.
//
// Chạy trên `dist/` (không phải renderToString) vì bệnh nằm ở **đúng màn bé nhìn thấy**:
// test đơn vị có thể bắt hằng số, nhưng chỉ trình duyệt mới trả lời "Home có còn vẽ
// 🦉 không".
//
// Bốn bước:
//   A  Home vẽ đúng một hình **khác nhau** cho cả bốn bạn (đo trực tiếp ô avatar);
//   B  Home và tủ đồ hiển thị **cùng một hình** cho cùng một hồ sơ;
//   C  **chống xanh rỗng**: mỗi ô phải là một phần tử duy nhất và đổi giá trị khi đổi
//      `avatarBase` — nếu selector bám phải node tĩnh thì A/B sẽ xanh vĩnh viễn;
//   D  DEF-022(b) — Home có ghép các ô `equipped` hay không — **chỉ ghi sự thật**,
//      không asserts, vì lát cắt này chưa sửa nửa đó.
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T50A/probe-t50a-home-mascot.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const PROFILE_KEY = 'kho_bau_child_profile';
const SHOP_BUTTON = '[aria-label="Tủ đồ thời trang và Linh thú"]';
/** Ô avatar Home: `w-20 h-20 sm:w-24 … md:w-28` — token `w-28` không đứng một mình nên không lẫn với preview tủ đồ. */
const HOME_AVATAR = 'div.w-20.h-20';
/** mascot trong ô preview tủ đồ: span `relative` duy nhất (các lớp trang bị đều `absolute aria-hidden`). */
const SHOP_AVATAR = 'div.w-28.h-28 span.relative';
/** XP để đạt cấp 20, đo bằng công thức nguồn `xpForLevel`. */
const XP_LEVEL_20 = 3840;

/** Ảnh chờverify cho **từng** `avatarBase` — lấy từ `MASCOT_EMOJI`, không phải từ code cũ. */
const EXPECT = { bear: '🐻', fox: '🦊', rabbit: '🐰', owl: '🦉' };
const BASES = ['bear', 'fox', 'rabbit', 'owl'];

/** Một bộ trang bị đầy đủ cho bước D (id + type lấy từ `src/data/shopCatalog.ts`). */
const FULL_EQUIP = {
  hat: 'hat_cap',
  glasses: 'glasses_nerd',
  shirt: 'shirt_yellow',
  backpack: 'bag_dino',
  pet: 'pet_cat',
  background: 'bg_sea',
  frame: 'frame_gold',
};
const FULL_UNLOCKED = Object.values(FULL_EQUIP);

export default async function run(page) {
  const out = { steps: [], errors: [], facts: {}, failedAt: null, shots: [] };
  const fail = (at, msg) => {
    out.errors.push(`${at}: ${msg}`);
    if (!out.failedAt) out.failedAt = at;
  };
  const step = (k, v) => out.steps.push({ step: k, ...v });
  const shot = async (name) => {
    const file = path.join(OUT, name + '.png');
    await page.screenshot({ path: file, fullPage: false });
    out.shots.push(path.basename(file));
  };

  const seed = async (over = {}) => {
    await page.evaluate(
      ([k, v]) => localStorage.setItem(k, JSON.stringify(v)),
      [
        PROFILE_KEY,
        {
          id: 'child-probe-t50a',
          name: 'Bé Probe',
          grade: 1,
          avatarBase: 'owl',
          equipped: {},
          xp: XP_LEVEL_20,
          stars: 200,
          gems: 0,
          tickets: 0,
          streak: 3,
          lastActiveDate: new Date().toISOString().slice(0, 10),
          unlockedItems: [],
          completedLessons: [],
          completedWeeklyChallenges: [],
          ...over,
        },
      ],
    );
    await page.reload({ waitUntil: 'networkidle' });
    await dismissLevelUpCelebration(page);
  };

  /** Đọc chữ trong một ô và **khai** vào errors nếu ô không phải là một phần tử duy nhất. */
  const readCell = async (at, selector, label) => {
    const box = page.locator(selector);
    const n = await box.count();
    if (n !== 1) {
      fail(at, `${label} khớp ${n} phần tử (mong 1, selector "${selector}") ⇒ phép đo vô nghĩa`);
      return null;
    }
    const text = (await box.first().innerText()).trim();
    if (!text) {
      fail(at, `${label} rỗng (selector "${selector}")`);
      return null;
    }
    return text;
  };

  // runner đã đưa page về origin của `dist/`
  // ---- A + B) Home vẽ đúng, và vẽ **giống** tủ đồ ------------------------------
  const homeSeen = {};
  const shopSeen = {};
  for (const base of BASES) {
    const at = `A-${base}`;
    await seed({ avatarBase: base, equipped: {}, unlockedItems: [] });
    const home = await readCell(at, HOME_AVATAR, `ô avatar Home (${base})`);
    if (home === null) continue;
    homeSeen[base] = home;
    if (home !== EXPECT[base]) {
      fail(at, `Home vẽ "${home}" cho avatarBase="${base}", mong "${EXPECT[base]}"`);
    }
    if (base === 'owl') await shot('01-home-owl');

    await page.locator(SHOP_BUTTON).first().click(CLICK);
    await page.waitForTimeout(600);
    const shop = await readCell(`B-${base}`, SHOP_AVATAR, `mascot trong preview tủ đồ (${base})`);
    if (shop === null) continue;
    shopSeen[base] = shop;
    if (shop !== EXPECT[base]) {
      fail(`B-${base}`, `tủ đồ vẽ "${shop}" cho avatarBase="${base}", mong "${EXPECT[base]}"`);
    }
    if (shop !== home) {
      fail(`B-${base}`, `Home "${home}" ≠ tủ đồ "${shop}" với cùng hồ sơ ${base}`);
    }
    if (base === 'owl') await shot('02-shop-owl');
  }
  out.facts.homeSeen = BASES.map((b) => `${b}=${homeSeen[b] ?? '?'}`).join(' ');
  out.facts.shopSeen = BASES.map((b) => `${b}=${shopSeen[b] ?? '?'}`).join(' ');
  step('AB-home-vs-shop', { home: homeSeen, shop: shopSeen, expect: EXPECT });

  // ---- C) chống xanh rỗng: bốn hình đôi một khác nhau, không có 🐰 giả ---------
  const distinct = [...new Set(BASES.map((b) => homeSeen[b]))];
  if (distinct.length !== BASES.length) {
    fail('C', `Home vẽ trùng hình cho nhiều bạn (${distinct.join(' ')}), hoặc bước nào đó không đo được`);
  }
  const owlSeen = homeSeen.owl;
  if (owlSeen !== undefined && owlSeen === homeSeen.rabbit) {
    fail('C', `cú vẫn hóa thỏ trên Home ⇒ ternary cũ còn sống`);
  }
  for (const b of BASES) {
    if (homeSeen[b] === undefined && !out.failedAt) fail('C', `không đo được bạn ${b}`);
  }
  out.facts.distinctHomeShapes = distinct.length;
  await shot('03-cuoi-vong-lap-o-tu-do');
  step('C-distinct', { distinct, home: homeSeen });

  // ---- D) DEF-022(b): Home có ghép các ô equipped không — CHỈ GHI SỰ THẬT ------
  await seed({ avatarBase: 'owl', equipped: { ...FULL_EQUIP }, unlockedItems: [...FULL_UNLOCKED] });
  const box = page.locator(HOME_AVATAR);
  const homeHtml = await box.first().innerHTML();
  const layerCount = await page.locator(`${HOME_AVATAR} span[aria-hidden]`).count();
  out.facts.homeWithEquipped = {
    innerHTML: homeHtml.trim(),
    mascotText: (await box.first().innerText()).trim(),
    equipLayers: layerCount,
  };
  out.facts.def022b =
    layerCount === 0
      ? 'MỞ — Home chỉ vẽ mascot: equipped có 7 ô mà Home không ghép lớp nào (DEF-022b)'
      : `Home đã ghép ${layerCount} lớp equipped`;
  await shot('04-home-with-equipped');
  step('D-equipped-fact', out.facts.homeWithEquipped);

  out.ok = out.errors.length === 0;
  return out;
}
