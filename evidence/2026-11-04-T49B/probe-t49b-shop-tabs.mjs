// T49B — bằng chứng chạy thật cho `DEF-021`: mọi món trong catalogue quà phải mở ra
// thấy ở một tab, và mặc vào phải **thấy trên nhân vật**.
//
// Bệnh đo được (2026-11-04):
//   grep -c "id: '" src/data/shopCatalog.ts  ⇒ 41 món, nhưng tab của `AvatarShopScreen`
//   chỉ có mascot|hat|glasses|backpack|pet ⇒ 17 món (áo 6 · nền 6 · khung 5) không có
//   tab nào, bé không bao giờ thấy nút "Mở khóa".
// Nửa thứ hai: preview chỉ ghép 4 ô, nên nếu chỉ thêm tab thì bé bấm "Mở khóa", nút
// đổi thành "Mặc vào" mà nhân vật đứng nguyên ⇒ thêm ba bước B/C/Đ đo thẳng ô preview.
//
// Năm bước:
//   A  8 tab, tab nào cũng có món (tab trống = một lời hứa kiểu khác);
//   B  tab Áo mua "Áo Thun Vàng Nắng" ⇒ sao trừ thật + món mở khoá thật + 👕 hiện trên
//      ô preview;
//   C  tab Nền mua "Nền Biển Xanh Rì Rào" ⇒ 🌊 hiện trên ô preview;
//   D  tab Khung mua "Khung Vàng Lấp Lánh" ⇒ ⭐ hiện trên ô preview;
//   E  **characterization chống xanh rỗng**: hồ sơ không mặc gì thì ô preview **không**
//      được chứa 👕 🌊 ⭐. Không có E, bốn bước trên chỉ cần emoji nào đó xuất hiện là
//      xanh, kể cả khi nó tới từ icon tab.
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T49B/probe-t49b-shop-tabs.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const PROFILE_KEY = 'kho_bau_child_profile';
const SHOP_BUTTON = '[aria-label="Tủ đồ thời trang và Linh thú"]';
/** Ô preview nhân vật: `w-28 h-28` là class của chính ô đó, không phải của tab nào. */
const PREVIEW = 'div.w-28.h-28';
/** XP để đạt cấp 20, đo bằng công thức nguồn `xpForLevel` (`Math.round(40*(l-1)^1.55/5)*5`). */
const XP_LEVEL_20 = 3840;

const TABS = [
  { label: 'Chọn Bạn Mascot', kind: 'mascot' },
  { label: 'Mũ & Nón', kind: 'item' },
  { label: 'Kính Mắt', kind: 'item' },
  { label: 'Áo & Trang Phục', kind: 'item' },
  { label: 'Ba Lô', kind: 'item' },
  { label: 'Thú Cưng', kind: 'item' },
  { label: 'Nền', kind: 'item' },
  { label: 'Khung', kind: 'item' },
];

const BUYS = [
  { tab: 'Áo & Trang Phục', name: 'Áo Thun Vàng Nắng', id: 'shirt_yellow', slot: 'shirt', price: 6, emoji: '👕', step: 'B' },
  { tab: 'Nền', name: 'Nền Biển Xanh Rì Rào', id: 'bg_sea', slot: 'background', price: 15, emoji: '🌊', step: 'C' },
  { tab: 'Khung', name: 'Khung Vàng Lấp Lánh', id: 'frame_gold', slot: 'frame', price: 10, emoji: '⭐', step: 'D' },
];
const ORPHAN_EMOJIS = ['👕', '🌊', '⭐'];

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

  /** Nguồn thật là byte trên máy, không phải state React. */
  const diskProfile = () =>
    page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), PROFILE_KEY);

  const seed = async (over = {}) => {
    await page.evaluate(
      ([k, v]) => localStorage.setItem(k, JSON.stringify(v)),
      [
        PROFILE_KEY,
        {
          id: 'child-probe',
          name: 'Bé Probe',
          grade: 1,
          avatarBase: 'fox',
          equipped: {},
          xp: XP_LEVEL_20,
          stars: 200,
          gems: 0,
          tickets: 0,
          streak: 3,
          lastActiveDate: new Date().toISOString().slice(0, 10),
          unlockedItems: ['hat_cap', 'glasses_nerd', 'bag_dino'],
          completedLessons: [],
          completedWeeklyChallenges: [],
          ...over,
        },
      ],
    );
    await page.reload({ waitUntil: 'networkidle' });
    await dismissLevelUpCelebration(page);
  };

  /** Tab không tồn tại ⇒ **khai** vào errors, đừng để `click()` timeout giết cả phép đo. */
  const openTab = async (label, at = 'A') => {
    const tab = page.getByRole('button', { name: label }).first();
    if (!(await tab.count())) {
      fail(at, `tab "${label}" không tồn tại trên màn hình`);
      return false;
    }
    await tab.click(CLICK);
    await page.waitForTimeout(400);
    return true;
  };

  // runner đã đưa page về origin của `dist/`
  // ---- A) 8 tab, tab nào cũng có món ------------------------------------------
  await seed();
  await page.locator(SHOP_BUTTON).first().click(CLICK);
  await page.waitForTimeout(800);
  const tabCounts = {};
  for (const t of TABS) {
    const present = await page.getByRole('button', { name: t.label }).count();
    if (!present) {
      fail('A', `tab "${t.label}" không tồn tại trên màn hình`);
      continue;
    }
    await openTab(t.label);
    const cards =
      t.kind === 'mascot'
        ? await page.locator('button.p-5.rounded-3xl').count()
        : await page.locator('div.p-4.rounded-2xl.border-2').count();
    tabCounts[t.label] = cards;
    if (cards === 0) fail('A', `tab "${t.label}" mở ra màn trống (${cards} món)`);
    const buyable = await page.getByRole('button', { name: 'Mở khóa' }).count();
    out.facts[`mởKhóa_${t.label}`] = buyable;
    if (t.kind === 'item' && buyable === 0) fail('A', `tab "${t.label}" không có nút "Mở khóa" nào`);
  }
  await shot('01-A-tam-tab');
  step('A-tabs', tabCounts);

  // ---- B/C/D) ba món mồ côi: mua được và mặc vào là thấy ----------------------
  for (const b of BUYS) {
    const before = await diskProfile();
    if (!(await openTab(b.tab, b.step))) continue;
    const card = page
      .locator(`xpath=//h4[normalize-space()='${b.name}']/ancestor::div[contains(concat(' ', @class, ' '), ' rounded-2xl ')]`)
      .first();
    if (!(await card.count())) {
      fail(b.step, `món "${b.name}" (${b.id}) không có thẻ nào trên tab "${b.tab}"`);
      continue;
    }
    const buy = card.getByRole('button', { name: 'Mở khóa' });
    if (!(await buy.count())) {
      fail(b.step, `thẻ món "${b.name}" không có nút "Mở khóa" (nhãn hiện: ${(await card.innerText()).replace(/\s+/g, ' ')})`);
      continue;
    }
    await buy.first().click(CLICK);
    await page.waitForTimeout(700);

    const after = await diskProfile();
    if (!after.unlockedItems?.includes(b.id)) fail(b.step, `mua xong mà ${b.id} vẫn chưa mở khoá trên máy`);
    if (after.stars !== before.stars - b.price)
      fail(b.step, `sao phải giảm đúng ${b.price}: ${before.stars} → ${after.stars}`);
    const preview = await page.locator(PREVIEW).innerText();
    if (!preview.includes(b.emoji))
      fail(b.step, `món "${b.name}" đã mặc mà ô preview không đổi (preview = "${preview.replace(/\s+/g, '')}")`);
    if (after.equipped?.[b.slot] !== b.id)
      fail(b.step, `equipped.${b.slot} không nhận ${b.id}: ${JSON.stringify(after.equipped)}`);
    out.facts[`${b.step}_stars`] = `${before.stars}→${after.stars}`;
    await shot(`${b.step}-${b.id}`);
    step(b.step, { id: b.id, before: before.stars, after: after.stars, preview: preview.replace(/\s+/g, '') });
  }

  // ---- E) chống xanh rỗng: không mặc gì thì preview phải sạch ------------------
  await seed({ unlockedItems: [], equipped: {} });
  await page.locator(SHOP_BUTTON).first().click(CLICK);
  await page.waitForTimeout(800);
  await openTab('Chọn Bạn Mascot');
  const plainPreview = await page.locator(PREVIEW).innerText();
  for (const e of ORPHAN_EMOJIS) {
    if (plainPreview.includes(e)) fail('E', `preview chứa ${e} dù bé không mặc gì ⇒ phép đo B/C/D vô nghĩa`);
  }
  out.facts.plainPreview = plainPreview.replace(/\s+/g, '');
  await shot('02-E-khong-mac-gi');
  step('E-empty-preview', { preview: out.facts.plainPreview });

  out.ok = out.errors.length === 0;
  return out;
}
