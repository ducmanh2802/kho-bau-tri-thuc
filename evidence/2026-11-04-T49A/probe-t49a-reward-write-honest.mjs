// T49A — bằng chứng chạy thật cho `DEF-020(b)`: quà cấp độ và món đồ mua phải **nằm
// xuống máy** trước khi app ăn mừng.
//
// Bệnh đo được (2026-11-04): `grep -rn "^\s*StorageService\.save[A-Za-z]*(" src
// --include=*.ts --include=*.tsx | wc -l` = **72** lời gọi ghi bỏ qua giá trị trả về.
// Hai chỗ trong số đó hứa với bé:
// · `buyShopItem()` trừ sao + mở khoá món rồi **vứt** kết quả ghi ⇒ nút "Mua" bắn
//   confetti và đọc "Chúc mừng bé đã mở khóa …" trong khi tải lại trang món vẫn khoá,
//   sao vẫn nguyên (bé tin mình đã tiêu sao);
// · `claimLevelRewards()` cộng sao + đánh dấu "đã nhận" rồi bỏ qua kết quả ghi ⇒ hộp
//   "Chúc mừng bé lên cấp" vẫn bật, biên lai "Quà cấp độ …" vẫn vào lịch sử ba mẹ
//   (key cài đặt ba mẹ **không** bị chặn nên nó ghi được!), còn sao thì không.
//
// `qa/parent-controls.mjs` và probe T48B chỉ đo đường **lưu được**, nên chưa lần nào
// có bằng chứng cho đường lưu hỏng. Ở đây chặn `Storage.prototype.setItem` theo từng
// key: danh sách key chặn đặt trong **sessionStorage** để init script đọc được ngay
// khi tài liệu bắt đầu (muốn chặn cả lần ghi lúc boot của `claimLevelRewards`), và
// mỗi bước **đọc lại localStorage** ⇒ kết luận dựa trên byte nằm trên máy, không dựa
// vào state trong React.
//
// Bốn bước (mỗi bước nói rõ vì sao cần nó):
//   A  storage lành ⇒ mua được món, sao giảm thật, có biên lai "Mua …" —
//      **characterization**: nhánh đúng vẫn phải đúng, A xanh cả trước lẫn sau khi sửa;
//   B  key hồ sơ bị chặn ⇒ sao KHÔNG giảm, món KHÔNG mở khoá, lời đọc phải nói thẳng
//      "không lưu được", nhãn "Số sao của bé" trên màn không được đổi, và không được
//      có biên lai "Mua …" mới;
//   D  storage lành ⇒ đạt cấp 6 bật hộp "Chúc mừng bé lên cấp" + biên lai "Quà cấp độ"
//      — **characterization cho C**: nếu D không bật hộp thì C xanh rỗng, vô nghĩa;
//   C  key hồ sơ bị chặn, cùng mức XP ⇒ KHÔNG bật hộp ăn mừng, KHÔNG có biên lai "Quà
//      cấp độ" mới (level vẫn pending ⇒ máy lưu được trở lại thì bé nhận đủ quà).
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T49A/probe-t49a-reward-write-honest.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const PROFILE_KEY = 'kho_bau_child_profile';
const MOTIVATION_KEY = 'kho_bau_motivation';
const PARENT_KEY = 'kho_bau_parent_settings';
/** XP để đạt cấp 6. Đo bằng chính công thức nguồn, không đoán:
 *  node -e 'const l=6; console.log(Math.round((40*Math.pow(l-1,1.55))/5)*5)'  => 485. */
const XP_LEVEL_6 = 485;
const SHOP_BUTTON = '[aria-label="Tủ đồ thời trang và Linh thú"]';
const HAT_TAB = 'button:has-text("Mũ & Nón")';
const BUY_BUTTON = 'button:has-text("Mở khóa")';
const CELEBRATION = '[role="dialog"][aria-label="Chúc mừng bé lên cấp"]';

const out = { steps: [], errors: [], facts: {}, failedAt: null, shots: [] };
let page = null;

function fail(at, msg) {
  out.errors.push(`${at}: ${msg}`);
  if (!out.failedAt) out.failedAt = at;
}
const step = (k, v) => out.steps.push({ step: k, ...v });

async function shot(name) {
  const file = path.join(OUT, name + '.png');
  await page.screenshot({ path: file, fullPage: false });
  out.shots.push(path.basename(file));
}

/** Đọc thẳng localStorage của trình duyệt — nguồn thật, không phải state React. */
async function readKey(key) {
  return page.evaluate((k) => localStorage.getItem(k), key);
}

async function profileOnDisk() {
  return JSON.parse((await readKey(PROFILE_KEY)) || '{}');
}

async function claimedOnDisk() {
  const raw = JSON.parse((await readKey(MOTIVATION_KEY)) || '{}');
  return (raw.claimedLevelRewards ?? []).slice().sort((a, b) => a - b);
}

async function receiptRows(limit = 6) {
  const raw = JSON.parse((await readKey(PARENT_KEY)) || '{}');
  return (raw.rewardHistory ?? []).slice(0, limit).map((h) => `${h.type}+${h.amount}|${h.description ?? ''}`);
}

async function receipts(matching) {
  const raw = JSON.parse((await readKey(PARENT_KEY)) || '{}');
  return (raw.rewardHistory ?? [])
    .map((h) => `${h.type}|${h.description ?? ''}`)
    .filter((r) => r.includes(matching)).length;
}

/** Seed **trước khi** đặt khoá chặn (nếu đặt trước thì chính phép seed bị từ chối),
 *  rồi đặt danh sách chặn để `reload()` sau đó áp dụng ngay từ đầu tài liệu. */
async function seed(state, blockKeys = []) {
  await page.evaluate(
    ([profileKey, motivationKey, payload, blocked]) => {
      sessionStorage.setItem('__kbtBlock', '[]');
      localStorage.setItem(
        profileKey,
        JSON.stringify({
          id: 'qa-t49a',
          name: 'Bé QA',
          xp: payload.xp,
          stars: payload.stars,
          tickets: 0,
          streak: 1,
          unlockedItems: payload.unlockedItems ?? [],
          equipped: {},
        })
      );
      localStorage.setItem(
        motivationKey,
        JSON.stringify({ stickers: {}, daily: { gachaDraws: 0 }, claimedLevelRewards: payload.claimed ?? [] })
      );
      sessionStorage.setItem('__kbtBlock', JSON.stringify(blocked));
    },
    [PROFILE_KEY, MOTIVATION_KEY, state, blockKeys]
  );
}

async function blockedWrites() {
  return page.evaluate(() => window.__kbtWrites || 0);
}

async function speechTail() {
  return page.evaluate(() => (window.__kbtSpoken || []).slice(-4).join(' / '));
}

async function openShop() {
  await page.waitForSelector(SHOP_BUTTON, { timeout: 20000 });
  await page.locator(SHOP_BUTTON).first().click(CLICK);
  await page.waitForSelector(HAT_TAB, { timeout: 20000 });
  await page.locator(HAT_TAB).first().click(CLICK);
  // Cấp 1 nên chỉ một món (Mũ Lưỡi Trai, minLevel 1) có nhãn "Mở khóa"; đo chứ không tin.
  const count = await page.locator(BUY_BUTTON).count();
  if (count !== 1) fail('openShop', `mong đúng 1 nút "Mở khóa" trong tab Mũ & Nón, thấy ${count}`);
}

async function starLabel() {
  return (await page.locator('text=/Số sao của bé:/').first().innerText()).replace(/\s+/g, ' ').trim();
}

export default async function run(target) {
  page = target;

  await page.addInitScript(() => {
    // (1) Bộ chặn ghi theo key, chỉ áp cho **localStorage** (sessionStorage giữ danh
    //     sách chặn, phải ghi được), đọc ngay lúc tài liệu bắt đầu ⇒ chặn được cả
    //     lần ghi của effect `claimLevelRewards` chạy khi app vừa mount.
    window.__kbtWrites = 0;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      let blocked = [];
      try {
        blocked = JSON.parse(sessionStorage.getItem('__kbtBlock') || '[]');
      } catch {
        blocked = [];
      }
      if (this === localStorage && blocked.includes(key)) {
        window.__kbtWrites += 1;
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
      return original.call(this, key, value);
    };
    // (2) Máy ghi lại những gì app *nói* với bé — nhánh thất bại của phòng thay đồ chỉ
    //     có tiếng, nên đây là kênh duy nhất để đo bằng chữ cái lời hứa.
    window.__kbtSpoken = [];
    const api = {
      speaking: false,
      pending: false,
      onvoiceschanged: null,
      getVoices: () => [],
      pause() {},
      resume() {},
      cancel() {},
      speak(u) {
        window.__kbtSpoken.push(String(u && u.text ? u.text : u));
        api.speaking = true;
      },
    };
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: api });
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
  });

  try {
    await page.setViewportSize({ width: 390, height: 844 });

    // ---------------- A: mua khi máy lưu được (characterization) ----------------
    await seed({ xp: 0, stars: 100 }, []);
    await page.reload();
    await openShop();
    const beforeA = await profileOnDisk();
    const receiptsBeforeA = await receipts('Mua');
    await page.locator(BUY_BUTTON).first().click(CLICK);
    await page.waitForTimeout(1500);
    const afterA = await profileOnDisk();
    const receiptsAfterA = await receipts('Mua');
    const rowsA = await receiptRows();
    step('A-mua-duoc', {
      starsBefore: beforeA.stars,
      starsAfter: afterA.stars,
      unlockedAfter: afterA.unlockedItems,
      receiptsMua: receiptsAfterA - receiptsBeforeA,
      rows: rowsA,
      spoken: (await speechTail()).slice(0, 160),
    });
    out.facts.A = {
      stars: [beforeA.stars, afterA.stars],
      unlocked: afterA.unlockedItems,
      receiptsMua: receiptsAfterA - receiptsBeforeA,
      rows: rowsA,
    };
    if (!(afterA.unlockedItems ?? []).includes('hat_cap'))
      fail('A', `máy lưu được mà món không mở khoá: ${JSON.stringify(afterA.unlockedItems)}`);
    // Không chốt đúng hiệu số giá món (5): **thành tựu** cũng cộng sao trong cùng
    // cửa sổ — đo 2026-11-04: 100 → 97 cho món giá 5, tức +2 sao thành tựu. Điều
    // phải giữ là "sao thật sự bị tiêu" + "món thật sự về" + "đúng 1 biên lai Mua".
    if (!(afterA.stars < beforeA.stars))
      fail('A', `mua thành công mà sao trên máy không giảm (${beforeA.stars} → ${afterA.stars})`);
    if (receiptsAfterA - receiptsBeforeA !== 1)
      fail('A', `mua thành công phải để lại đúng 1 biên lai, thấy ${receiptsAfterA - receiptsBeforeA}`);
    await shot('01-A-mua-duoc');

    // ---------------- B: key hồ sơ bị trình duyệt từ chối ----------------
    await seed({ xp: 0, stars: 100 }, [PROFILE_KEY]);
    await page.reload();
    await openShop();
    const beforeB = await profileOnDisk();
    const receiptsBeforeB = await receipts('Mua');
    const labelBeforeB = await starLabel();
    const writesBeforeB = await blockedWrites();
    await page.locator(BUY_BUTTON).first().click(CLICK);
    await page.waitForTimeout(1500);
    const afterB = await profileOnDisk();
    const receiptsAfterB = await receipts('Mua');
    const labelAfterB = await starLabel();
    const blockedDelta = (await blockedWrites()) - writesBeforeB;
    const spokenB = await speechTail();
    step('B-may-choi-ghi', {
      starsBefore: beforeB.stars,
      starsAfter: afterB.stars,
      unlockedAfter: afterB.unlockedItems,
      blockedWrites: blockedDelta,
      labelBefore: labelBeforeB,
      labelAfter: labelAfterB,
      receiptsMua: receiptsAfterB - receiptsBeforeB,
      spoken: spokenB.slice(0, 200),
    });
    out.facts.B = { blockedWrites: blockedDelta, spoken: spokenB.slice(0, 200), receiptsMua: receiptsAfterB - receiptsBeforeB };
    if (blockedDelta < 1) fail('B', 'không có lần ghi nào bị chặn ⇒ kịch bản đo hỏng, kết luận B vô nghĩa');
    if (/mở khóa|đã mua|chúc mừng/i.test(spokenB))
      fail('B', `máy KHÔNG ghi được mà vẫn hứa đã mua: "${spokenB.slice(0, 140)}"`);
    if (!/không lưu được/i.test(spokenB))
      fail('B', `lời đọc không nói thẳng là máy không lưu được: "${spokenB.slice(0, 140)}"`);
    if (afterB.stars !== beforeB.stars)
      fail('B', `sao bị trừ oan ${beforeB.stars} → ${afterB.stars} dù hồ sơ không ghi được`);
    if ((afterB.unlockedItems ?? []).includes('hat_cap'))
      fail('B', 'món hiện là đã mở khoá trong khi hồ sơ không ghi được');
    if (receiptsAfterB - receiptsBeforeB !== 0)
      fail('B', `biên lai "Mua …" xuất hiện dù giao dịch không nằm xuống máy (${receiptsAfterB - receiptsBeforeB} dòng)`);
    if (labelAfterB !== labelBeforeB)
      fail('B', `nhãn sao trên màn đổi (${labelBeforeB} → ${labelAfterB}) dù máy chưa lưu được gì`);
    await shot('02-B-may-choi-ghi');

    // ---------------- D: đạt cấp, máy lưu được ⇒ ăn mừng (characterization cho C) ----------------
    await seed({ xp: XP_LEVEL_6, stars: 10, claimed: [] }, []);
    await page.reload();
    await page.waitForSelector(CELEBRATION, { timeout: 20000 });
    const celebrationText = (await page.locator(CELEBRATION).first().innerText()).replace(/\s+/g, ' ').trim();
    await shot('03-D-len-cap-luu-duoc');
    await dismissLevelUpCelebration(page);
    const claimedD = await claimedOnDisk();
    const receiptsD = await receipts('Quà cấp độ');
    step('D-len-cap-luu-duoc', { celebration: celebrationText.slice(0, 140), claimed: claimedD, receiptsQuaCapDo: receiptsD });
    out.facts.D = { claimed: claimedD, receiptsQuaCapDo: receiptsD };
    if (!claimedD.includes(6)) fail('D', `đường lưu được phải đánh dấu đã nhận cấp 6: ${JSON.stringify(claimedD)}`);
    if (receiptsD < 1) fail('D', 'đường lưu được phải để lại biên lai "Quà cấp độ …"');

    // ---------------- C: cùng mức XP nhưng máy từ chối ghi hồ sơ ----------------
    await seed({ xp: XP_LEVEL_6, stars: 10, claimed: [] }, [PROFILE_KEY]);
    const receiptsBeforeC = await receipts('Quà cấp độ');
    await page.reload();
    const celebrated = await page
      .locator(CELEBRATION)
      .first()
      .waitFor({ state: 'visible', timeout: 6000 })
      .then(() => true)
      .catch(() => false);
    await page.waitForTimeout(600);
    const claimedC = await claimedOnDisk();
    const receiptsC = (await receipts('Quà cấp độ')) - receiptsBeforeC;
    step('C-may-choi-ghi', { celebrated, claimed: claimedC, receiptsQuaCapDoMoi: receiptsC });
    out.facts.C = { celebrated, claimed: claimedC, receiptsQuaCapDoMoi: receiptsC };
    if (celebrated)
      fail('C', 'hộp "Chúc mừng bé lên cấp" vẫn bật trong khi sao và dấu "đã nhận" không ghi được');
    if (receiptsC > 0)
      fail('C', `lịch sử ba mẹ nhận thêm ${receiptsC} biên lai "Quà cấp độ" ảo dù quà không nằm xuống máy`);
    if (claimedC.includes(6))
      fail('C', `dấu "đã nhận cấp 6" nằm xuống máy trong khi sao thì không: ${JSON.stringify(claimedC)}`);
    if (!claimedC.length && !celebrated) step('C-pending-giu-nguyen', { note: 'level 2..6 vẫn pending ⇒ máy lưu được là nhận đủ' });
    await shot('04-C-may-choi-ghi');
  } catch (e) {
    out.errors.push('EXCEPTION: ' + (e && e.message ? String(e.message).slice(0, 900) : String(e)));
    if (!out.failedAt) out.failedAt = out.steps.length ? out.steps[out.steps.length - 1].step : 'start';
    try {
      await page.screenshot({ path: path.join(OUT, '99-failure.png'), fullPage: false });
      out.shots.push('99-failure.png');
    } catch {
      /* page đã đóng */
    }
  }

  const result = {
    ok: out.errors.length === 0,
    failedAt: out.failedAt,
    errors: out.errors,
    steps: out.steps,
    facts: out.facts,
    shots: out.shots,
  };
  fs.writeFileSync(path.join(OUT, 'probe-result.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}
