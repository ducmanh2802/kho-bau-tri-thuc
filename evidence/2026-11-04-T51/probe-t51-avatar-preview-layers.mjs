// T51 — bằng chứng chạy thật cho `DEF-022(b)`: màn Home **không ghép** các ô `equipped`
// (đo ở T50A: hồ sơ mặc đủ 7 ô ⇒ `equipLayers: 0`, `evidence/2026-11-04-T50A/probe-PASS.txt`).
// Sau T51 Home và tủ đồ dùng chung `src/components/common/AvatarPreview.tsx`.
//
// Vì sao bắt buộc chạy trên `dist/` chứ không dừng ở renderToString: toàn bộ phần khó của
// lát cắt này là **định vị**. `test:router` chỉ thấy `data-equip="hat"`; nó không biết
// `cqi` có trình duyệt nào tính hay không, mũ có nằm trên đầu hay bay ra khỏi ô. Nếu
// Tailwind/CSS không sinh ra quy tắc đúng, bé vẫn thấy 7 ký tự emoji — sai vị trí, và chỉ
// browser mới đỏ.
//
// Bốn bước:
//   A  Home ở 375×812 với 7 ô `equipped` ⇒ **đủ 7 lớp**, mỗi lớp có `font-size` tính ra
//      px thật và **tỉ lệ theo bề rộng ô** đúng bản đồ `cqi` (±0.03).
//   B  Cùng hồ sơ trong tủ đồ (ô to hơn) ⇒ vẫn 7 lớp, `font-size` **khác** Home theo đúng
//      tỉ lệ bề rộng hai ô ⇒ một bộ số dùng được cho mọi kích cỡ, không phải hai bản sao.
//   C  **chống đỏ do dựng sẵn**: `equipped = {}` ⇒ 0 lớp ở cả hai màn, mascot vẫn 🦉.
//   D  `role="img"` + `aria-label` của hai màn **giống nhau từng ký tự** và kể đủ 7 món;
//      mọi lớp là `aria-hidden` (màn đọc không đọc rời từng emoji).
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T51/probe-t51-avatar-preview-layers.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const PROFILE_KEY = 'kho_bau_child_profile';
const SHOP_BUTTON = '[aria-label="Tủ đồ thời trang và Linh thú"]';
const XP_LEVEL_20 = 3840;

/** Bộ trang bị đủ **7** ô — id lấy từ `src/data/shopCatalog.ts`; id sai ⇒ đếm được < 7 và đỏ to. */
const FULL_EQUIP = {
  hat: 'hat_cap',
  glasses: 'glasses_nerd',
  shirt: 'shirt_yellow',
  backpack: 'bag_dino',
  pet: 'pet_cat',
  background: 'bg_sea',
  frame: 'frame_gold',
};
const TYPES = Object.keys(FULL_EQUIP);

/** Bản đồ `cqi` trong `src/index.css` — `font-size` tính bằng **phần trăm bề rộng ô**. */
const EXPECT_RATIO = {
  background: 0.45,
  hat: 0.29,
  glasses: 0.23,
  shirt: 0.29,
  backpack: 0.23,
  pet: 0.23,
  frame: 0.19,
};
const RATIO_TOLERANCE = 0.03;

/** Đọc từng lớp trong một preview: id lớp, emoji, `font-size` px, bề rộng content của ô. */
const readLayersInPreview = (preview) => {
  const rect = preview.getBoundingClientRect();
  const style = getComputedStyle(preview);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const borderX = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
  const inner = rect.width - padX - borderX;
  const layers = [...preview.querySelectorAll('[data-equip]')].map((el) => ({
    type: el.getAttribute('data-equip'),
    emoji: el.textContent.trim(),
    fontSize: parseFloat(getComputedStyle(el).fontSize),
    hidden: el.getAttribute('aria-hidden') === 'true',
    zeroSize: el.getBoundingClientRect().width === 0,
    inner,
  }));
  return layers.concat([{ type: '__container__', inner, containerType: style.containerType }]);
};

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
          id: 'child-probe-t51',
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
      ]
    );
    await page.reload({ waitUntil: 'networkidle' });
    await dismissLevelUpCelebration(page);
  };

  /** Preview đang nhìn thấy: Home = ô có class `w-20`, tủ đồ = ô `w-28`. */
  const readPreview = async (at, label, widthClass) => {
    const preview = page.locator(`[data-avatar-preview].${widthClass}`).first();
    if ((await page.locator(`[data-avatar-preview].${widthClass}`).count()) !== 1) {
      fail(at, `preview ${label} khớp ${await page.locator(`[data-avatar-preview].${widthClass}`).count()} ô (mong 1) ⇒ phép đo vô nghĩa`);
      return null;
    }
    const data = await preview.evaluate(readLayersInPreview);
    const mascot = (await preview.locator('[data-avatar-mascot]').count()) === 1
      ? (await preview.locator('[data-avatar-mascot]').innerText()).trim()
      : null;
    if (!mascot) fail(at, `${label}: không đọc được mascot trong preview`);
    const label_ = await preview.getAttribute('aria-label');
    const role = await preview.getAttribute('role');
    return { data, mascot, ariaLabel: label_, role, inner: data[data.length - 1].inner };
  };

  /** So từng lớp với bản đồ `cqi`; trả về danh sách lớp tìm thấy theo type. */
  const checkLayers = (at, label, read, expectTypes) => {
    if (!read) return null;
    const byType = {};
    for (const row of read.data) if (row.type !== '__container__') byType[row.type] = row;
    const missing = expectTypes.filter((t) => !byType[t]);
    if (missing.length) {
      fail(at, `${label} thiếu lớp [${missing.join(', ')}] — bé mặc thật mà màn không vẽ (DEF-022b)`);
    }
    const extra = Object.keys(byType).filter((t) => !expectTypes.includes(t));
    if (extra.length) fail(at, `${label} vẽ lớp lạ [${extra.join(', ')}]`);
    const ratios = {};
    for (const t of expectTypes) {
      const row = byType[t];
      if (!row) continue;
      if (row.zeroSize) fail(at, `${label}: lớp ${t} có bề rộng 0 ⇒ không render`);
      if (!row.hidden) fail(at, `${label}: lớp ${t} thiếu aria-hidden ⇒ màn đọc sẽ đọc rời từng emoji`);
      const ratio = row.fontSize / read.inner;
      ratios[t] = Number(ratio.toFixed(3));
      const d = Math.abs(ratio - EXPECT_RATIO[t]);
      if (d > RATIO_TOLERANCE) {
        fail(
          at,
          `${label}: lớp ${t} cỡ ${row.fontSize.toFixed(1)}px trong ô ${read.inner.toFixed(1)}px = ${ratio.toFixed(3)} ` +
            `(mong ${EXPECT_RATIO[t]} ±${RATIO_TOLERANCE}) ⇒ định vị không theo ô`
        );
      }
    }
    return { byType, ratios, mascot: read.mascot, ariaLabel: read.ariaLabel, inner: read.inner };
  };

  // ---- A) Home ở 375×812 ghép đủ 7 lớp, cỡ chữ **tỉ lệ theo ô ------------------
  await page.setViewportSize({ width: 375, height: 812 });
  await seed({ equipped: { ...FULL_EQUIP }, unlockedItems: Object.values(FULL_EQUIP) });
  const homeRead = await readPreview('A', 'màn Home', 'w-20');
  const home = checkLayers('A', 'Home', homeRead, TYPES);
  out.facts.homeInnerPx = homeRead ? Number(homeRead.inner.toFixed(1)) : null;
  out.facts.homeLayerRatios = home ? home.ratios : null;
  out.facts.homeEquipLayers = homeRead ? homeRead.data.length - 1 : 0;
  if (home) {
    if (home.mascot !== '🦉') fail('A', `Home vẽ mascot "${home.mascot}", mong "🦉"`);
    if ((await page.locator('[data-avatar-preview].w-20 [data-equip]').count()) !== TYPES.length) {
      fail('A', `selector đếm được ${await page.locator('[data-avatar-preview].w-20 [data-equip]').count()} lớp, mong ${TYPES.length}`);
    }
  }
  const containerType = homeRead ? homeRead.data[homeRead.data.length - 1].containerType : null;
  if (containerType !== 'inline-size') {
    fail('A', `preview phải là container truy vấn (container-type: inline-size), máy trả về "${containerType}" ⇒ cqi không có mốc`);
  }
  await shot('01-home-375-du-7-lop');
  step('A-home-375', { equipLayers: out.facts.homeEquipLayers, innerPx: out.facts.homeInnerPx, ratios: home && home.ratios });

  // ---- B) tủ đồ: ô **to hơn**, cùng bộ số ⇒ cỡ chữ to hơn **đúng tỉ lệ** -------
  await page.locator(SHOP_BUTTON).first().click(CLICK);
  await page.waitForTimeout(700);
  // `shrink-0` đổi cân bằng của hàng flex ⇒ phải đo **cả** tràn ngang, không chỉ đo ô preview.
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  out.facts.shopScrollVsViewport = `${overflow.scrollWidth}/${overflow.innerWidth}`;
  if (overflow.scrollWidth > overflow.innerWidth + 1) {
    fail('B', `hàng preview tràn ngang: scrollWidth ${overflow.scrollWidth} > innerWidth ${overflow.innerWidth}`);
  }
  const shopRead = await readPreview('B', 'tủ đồ', 'w-28');
  const shop = checkLayers('B', 'tủ đồ', shopRead, TYPES);
  out.facts.shopInnerPx = shopRead ? Number(shopRead.inner.toFixed(1)) : null;
  out.facts.shopLayerRatios = shop ? shop.ratios : null;
  if (home && shop) {
    if (!(shop.inner > home.inner)) {
      fail('B', `ô tủ đồ ${shop.inner.toFixed(1)}px không to hơn ô Home ${home.inner.toFixed(1)}px ⇒ phép so sánh vô nghĩa`);
    }
    for (const t of TYPES) {
      if (shop.ratios[t] === undefined || home.ratios[t] === undefined) continue;
      if (Math.abs(shop.ratios[t] - home.ratios[t]) > RATIO_TOLERANCE) {
        fail('B', `${t}: tỉ lệ Home ${home.ratios[t]} ≠ tủ đồ ${shop.ratios[t]} ⇒ hai màn dùng hai bản đồ khác nhau (đúng bệnh DEF-022)`);
      }
      const expectedPx = home.ratios[t] * shop.inner;
      const shopPx = shop.byType[t].fontSize;
      if (Math.abs(shopPx - expectedPx) > 1.5) {
        fail('B', `${t}: tủ đồ ${shopPx.toFixed(1)}px, mong ${expectedPx.toFixed(1)}px = tỉ lệ Home × bề rộng ô tủ đồ ⇒ không scale theo ô`);
      }
    }
    if (shop.mascot !== home.mascot) fail('B', `mascot Home "${home.mascot}" ≠ tủ đồ "${shop.mascot}"`);
    if (shop.ariaLabel !== home.ariaLabel) {
      fail('B', `hai màn mô tả khác nhau:\n  Home : "${home.ariaLabel}"\n  tủ đồ: "${shop.ariaLabel}"`);
    }
  }
  await shot('02-tu-do-du-7-lop');
  step('B-shop-vs-home', {
    homeInnerPx: out.facts.homeInnerPx,
    shopInnerPx: out.facts.shopInnerPx,
    sameLabel: home && shop ? home.ariaLabel === shop.ariaLabel : null,
  });

  // ---- C) chống đỏ do dựng sẵn: không mặc gì ⇒ **0** lớp ở cả hai màn ----------
  await seed({ equipped: {}, unlockedItems: [] });
  const emptyHome = await readPreview('C', 'màn Home (trống)', 'w-20');
  const emptyHomeLayers = checkLayers('C', 'Home trống', emptyHome, []);
  if (emptyHome && emptyHome.mascot !== '🦉') fail('C', `hồ sơ trống mà mascot đổi thành "${emptyHome.mascot}"`);
  if (emptyHomeLayers && Object.keys(emptyHomeLayers.byType).length !== 0) {
    fail('C', `Home không mặc gì mà vẫn vẽ ${Object.keys(emptyHomeLayers.byType).length} lớp ⇒ lưới đỏ do dựng sẵn`);
  }
  const emptyLabel = emptyHome ? emptyHome.ariaLabel : '';
  for (const t of TYPES) {
    if (emptyLabel && emptyLabel.includes(' · ')) {
      fail('C', 'hồ sơ trống nhưng aria-label vẫn liệt kê danh sách món');
      break;
    }
  }
  await shot('03-home-khong-mac-gi');
  step('C-empty', { layers: emptyHome ? emptyHome.data.length - 1 : null, ariaLabel: emptyLabel });

  // ---- D) nhãn truy cập kể đủ 7 món, emoji chỉ là trang trí -------------------
  await seed({ equipped: { ...FULL_EQUIP }, unlockedItems: Object.values(FULL_EQUIP) });
  const labeled = await page.evaluate(() => {
    const p = document.querySelector('[data-avatar-preview].w-20');
    return p ? { role: p.getAttribute('role'), label: p.getAttribute('aria-label') } : null;
  });
  if (!labeled) fail('D', 'không tìm thấy preview trên Home ở bước D');
  else {
    if (labeled.role !== 'img') fail('D', `preview có role="${labeled.role}", mong "img"`);
    const parts = (labeled.label || '').split(' · ');
    if (parts.length !== TYPES.length + 1) {
      fail('D', `aria-label "${labeled.label}" kể ${parts.length} mục, mong ${TYPES.length + 1} (bạn + 7 món)`);
    }
    if (!parts[0]) fail('D', 'aria-label không bắt đầu bằng tên bạn mascot');
    out.facts.ariaLabel = labeled.label;
    out.facts.labelParts = parts.length;
  }
  step('D-accessible-name', { role: labeled && labeled.role, parts: labeled && labeled.label.split(' · ').length });

  return out;
}
