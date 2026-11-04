// T50B — bằng chứng chạy thật cho `DEF-023`: màn tủ đồ **hứa suông** khi trình duyệt
// chặn ghi, và mọi phản hồi lỗi chỉ nằm ở **lời đọc** (6 `sound.speak`, 0 node nhìn thấy).
//
// Chặn `localStorage.setItem` đúng key hồ sơ ⇒ `writeJSON` bắt được và trả `false`
// (`src/services/storage.ts:302`), kéo theo `saveChildProfile` trả `false` (`:1162`) và
// `buyShopItem` trả `reason: 'storage-unavailable'`. Đó chính xác là những gì Safari chế độ
// ẩn danh / hết dung lượng gây ra — không phải tình huống bịa.
//
// Bốn bước:
//   A  chọn bạn Cú khi máy chặn ghi ⇒ phải **thấy bằng chữ** "máy không lưu được", mascot
//      preview vẫn là con cáo cũ, thẻ Cú vẫn ghi "Chọn bạn này", `localStorage` vẫn `fox`;
//   B  mặc một món đã sở hữu khi máy chặn ghi ⇒ nút KHÔNG được đổi thành "Tháo ra"
//      (đó là khẳng định "đang mặc" chưa xảy ra) và thông báo phải hiện;
//   C  **chống đỏ do dựng sẵn**: bỏ chặn rồi chọn lại ⇒ không còn thông báo nào, mascot
//      đổi thật và `localStorage` đổi thật ⇒ bước A/B không so với một hằng số luôn đỏ;
//   D  mua món đang khoá khi máy chặn ghi ⇒ trước T50B câu "máy không lưu" chỉ được **đọc**,
//      nay phải **hiện bằng chữ**; sao và `unlockedItems` nguyên.
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T50B/probe-t50b-shop-save-notice.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const PROFILE_KEY = 'kho_bau_child_profile';
const SHOP_BUTTON = '[aria-label="Tủ đồ thời trang và Linh thú"]';
const ALERT = '[role="alert"]';
const SHOP_AVATAR = 'div.w-28.h-28 span.relative';
const XP_LEVEL_20 = 3840;

const MASCOT_TAB = 'Chọn Bạn Mascot';
const HAT_TAB = 'Mũ & Nón';
const OWL_CARD = 'Cú Thông Thái';
const HAT_OWNED = 'Mũ Lưỡi Trai Năng Động';
const HAT_BUYABLE = 'Nón Lá Quê Em';

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

  // Chặn ghi **đúng một** key hồ sơ; các key khác vẫn viết bình thường. `addInitScript` chỉ
  // có tác dụng với lần điều hướng **tiếp theo**, mà runner đã tải trang rồi ⇒ cài luôn một
  // lần bằng evaluate (hàm idempotent, reload thì init script chạy lại từ đầu).
  const installer = () => {
    if (window.__t50bPatched) return;
    window.__t50bPatched = true;
    window.__blockedKeys = new Set();
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (window.__blockedKeys && window.__blockedKeys.has(String(k))) {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      }
      return orig.call(this, k, v);
    };
  };
  await page.addInitScript(installer);
  await page.evaluate(installer);
  const arm = () => page.evaluate((k) => window.__blockedKeys.add(k), PROFILE_KEY);
  const disarm = () => page.evaluate(() => window.__blockedKeys.clear());

  const seed = async (over = {}) => {
    await disarm();
    await page.evaluate(
      ([k, v]) => localStorage.setItem(k, JSON.stringify(v)),
      [
        PROFILE_KEY,
        {
          id: 'child-probe-t50b',
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
          unlockedItems: ['hat_cap', 'bag_dino'],
          completedLessons: [],
          completedWeeklyChallenges: [],
          ...over,
        },
      ]
    );
    await page.reload({ waitUntil: 'networkidle' });
    await dismissLevelUpCelebration(page);
  };

  const stored = () =>
    page.evaluate((k) => {
      try {
        return JSON.parse(localStorage.getItem(k) || 'null');
      } catch {
        return null;
      }
    }, PROFILE_KEY);

  const alertText = async () => {
    const box = page.locator(ALERT);
    const n = await box.count();
    if (n === 0) return null;
    if (n > 1) fail('alert-count', `có ${n} node role="alert" (mong ≤1)`);
    return (await box.first().innerText()).replace(/\s+/g, ' ').trim();
  };

  const mascotText = async () => (await page.locator(SHOP_AVATAR).first().innerText()).trim();
  const openTab = async (label) => {
    await page.locator(`button:has-text("${label}")`).first().click(CLICK);
    await page.waitForTimeout(300);
  };
  const openShop = async () => {
    await page.locator(SHOP_BUTTON).first().click(CLICK);
    await page.waitForTimeout(600);
  };

  /** Thẻ bạn mascot = chính cái `<button>` chứa `<h3>` tên bạn. */
  const mascotLabel = async (name) => {
    const card = page.locator(`button:has(h3:text-is("${name}"))`);
    if ((await card.count()) !== 1) {
      fail('card', `thẻ mascot "${name}" khớp ${await card.count()} phần tử (mong 1)`);
      return null;
    }
    return (await card.first().innerText()).replace(/\s+/g, ' ').trim();
  };
  const clickMascot = async (name) => {
    await page.locator(`button:has(h3:text-is("${name}"))`).first().click(CLICK);
    await page.waitForTimeout(500);
  };

  /**
   * Món đồ: thẻ là `div.p-4.rounded-2xl` (nhãn `src/components/shop/AvatarShopScreen.tsx:330`),
   * bên trong có một `h4` tên món và **một** nút. Dùng XPath `ancestor::…[last()]` thì thất bại:
   * trục `ancestor` trả ngược thứ tự tài liệu nên `[last()]` lại là **ông cố ngoài cùng**, và
   * `.last()` trên đó vớ phải nút điều hướng ở cuối trang.
   */
  const itemButton = (name) =>
    page.locator(`div.p-4.rounded-2xl:has(> div h4:text-is("${name}"))`).locator('button').last();
  const clickItem = async (name) => {
    const btn = itemButton(name);
    if ((await btn.count()) !== 1) {
      fail('card', `nút của món "${name}" khớp ${await btn.count()} phần tử (mong 1)`);
      return;
    }
    await btn.click(CLICK);
    await page.waitForTimeout(500);
  };

  // ---- A) chọn mascot khi máy chặn ghi ----------------------------------------
  await seed();
  await openShop();
  const avatarBefore = await mascotText();
  await arm();
  await clickMascot(OWL_CARD);
  const alertA = await alertText();
  const avatarA = await mascotText();
  const owlLabelA = await mascotLabel(OWL_CARD);
  const storedA = await stored();
  if (!alertA) fail('A', 'máy từ chối ghi mà màn hình **không hiện chữ** nào (chỉ có tiếng ⇒ bé tắt tiếng là mất hết phản hồi)');
  else if (!/máy/i.test(alertA)) fail('A', `thông báo không nêu chủ thể là máy: "${alertA}"`);
  if (avatarA !== avatarBefore) fail('A', `preview đổi thành "${avatarA}" dù máy chưa lưu gì ⇒ hình đang nói dối`);
  if (owlLabelA && !/Chọn bạn này/.test(owlLabelA)) fail('A', `thẻ Cú đổi thành "${owlLabelA}" dù máy không lưu được`);
  if (storedA && storedA.avatarBase !== 'fox') fail('A', `localStorage thành ${storedA.avatarBase} dù writeJSON trả false`);
  out.facts.A = { alert: alertA, avatarBefore, avatarAfter: avatarA, owlLabel: owlLabelA, storedAvatarBase: storedA && storedA.avatarBase };
  await shot('01-A-may-chan-ghi');
  step('A-avatar-blocked', out.facts.A);

  // ---- B) mặc món đã sở hữu khi máy chặn ghi ----------------------------------
  await openTab(HAT_TAB);
  await clickItem(HAT_OWNED);
  const alertB = await alertText();
  const hatButtonB = (await itemButton(HAT_OWNED).innerText()).trim();
  const storedB = await stored();
  if (!alertB) fail('B', 'mặc đồ thất bại mà không có thông báo nhìn thấy được');
  if (hatButtonB !== 'Mặc vào') fail('B', `nút đổi thành "${hatButtonB}" trong khi máy không lưu được ⇒ "Đang mặc" là lời hứa suông`);
  if (storedB && storedB.equipped && storedB.equipped.hat) fail('B', `equipped.hat=${storedB.equipped.hat} dù máy chặn ghi`);
  out.facts.B = { alert: alertB, hatButton: hatButtonB, storedEquipped: storedB && storedB.equipped };
  await shot('02-B-mac-do-bi-chan');
  step('B-equip-blocked', out.facts.B);

  // ---- C) chống đỏ do dựng sẵn: bỏ chặn ⇒ thành công thật ---------------------
  await disarm();
  await openTab(MASCOT_TAB);
  await clickMascot(OWL_CARD);
  const alertC = await alertText();
  const avatarC = await mascotText();
  const owlLabelC = await mascotLabel(OWL_CARD);
  const storedC = await stored();
  if (alertC) fail('C', `lưu thành công mà màn vẫn báo lỗi ("${alertC}") ⇒ thông báo bị dựng sẵn, A/B vô nghĩa`);
  if (avatarC !== '🦉') fail('C', `đường thành công hỏng: preview = "${avatarC}", mong 🦉`);
  if (owlLabelC && !/Đang chọn/.test(owlLabelC)) fail('C', `thẻ Cú không chuyển sang "Đang chọn": "${owlLabelC}"`);
  if (!storedC || storedC.avatarBase !== 'owl') fail('C', `localStorage = ${storedC && storedC.avatarBase}, mong owl`);
  out.facts.C = { alert: alertC, avatar: avatarC, owlLabel: owlLabelC, storedAvatarBase: storedC && storedC.avatarBase };
  await shot('03-C-luu-duoc-that');
  step('C-happy-path', out.facts.C);

  // ---- D) mua món khi máy chặn ghi ⇒ storage-unavailable phải hiện bằng chữ ----
  await arm();
  await openTab(HAT_TAB);
  const starsBeforeD = (await stored()).stars;
  await clickItem(HAT_BUYABLE);
  const alertD = await alertText();
  const hatButtonD = (await itemButton(HAT_BUYABLE).innerText()).trim();
  const storedD = await stored();
  if (!alertD) fail('D', '`buyShopItem` trả storage-unavailable nhưng bé chỉ **nghe** được, không **thấy**');
  if (hatButtonD !== 'Mở khóa') fail('D', `nút mua đổi thành "${hatButtonD}" dù máy không lưu được`);
  if (storedD && storedD.stars !== starsBeforeD) fail('D', `sao đổi ${starsBeforeD} → ${storedD.stars} dù máy chặn ghi`);
  if (storedD && storedD.unlockedItems.includes('hat_nonla')) fail('D', 'món vào unlockedItems dù lần ghi bị chặn');
  out.facts.D = { alert: alertD, hatButton: hatButtonD, starsBefore: starsBeforeD, starsAfter: storedD && storedD.stars };
  await shot('04-D-mua-bi-chan');
  step('D-buy-blocked', out.facts.D);

  await disarm();
  out.ok = out.errors.length === 0;
  return out;
}
