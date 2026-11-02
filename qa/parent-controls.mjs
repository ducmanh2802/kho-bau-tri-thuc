// T41A — bằng chứng nhìn thấy được cho quyền kiểm soát của ba mẹ + luồng "bài tiếp theo".
//
// Bốn điều phải thấy tận mắt trên bản build thật (viewport 1280×720 của run-one.mjs):
//  1) "Vì sao gợi ý này?" đưa ba mẹ tới đúng tab Phân Tích (trước đây bấm không xảy ra gì).
//  2) Công tắc "Toàn Bộ Phần Thưởng" tắt thật: màn kết quả bài học không hứa Sao/XP/Vé
//     và Tủ Đồ không tiêu được sao — dù túi sao của bé đang rất đầy.
//  3) Bật lại thì chính món đó mua được ngay: chứng minh thứ chặn bé là công tắc của ba mẹ.
//  4) CTA "Bắt đầu: …" trên trang Chủ phải đưa bé tới đích của gợi ý, không được kẹt ở trang Chủ.
//
// Chạy: npm run build && node qa/run-one.mjs qa/parent-controls.mjs
import fs from 'node:fs';
import path from 'node:path';
import {
  waitForAppShell,
  dismissLevelUpCelebration,
  describeBlocker,
  navTo,
  openFirstLesson,
} from './lib.mjs';

const OUT = path.resolve(process.env.TEMP || process.env.TMP || '.', 'shots-t41a');
fs.mkdirSync(OUT, { recursive: true });

const PROFILE_KEY = 'kho_bau_child_profile';
const SETTINGS_KEY = 'kho_bau_parent_settings';

export default async function run(page) {
  const out = { errors: [], shots: [], facts: {}, steps: [] };
  try {
    await body(page, out);
  } catch (e) {
    out.errors.push('EXCEPTION: ' + (e && e.message ? String(e.message).split('\n')[0] : String(e)));
    out.failedAt = String(out.facts.section || 'start');
    try {
      const file = path.join(OUT, 'zz-exception.png');
      await page.screenshot({ path: file, fullPage: false });
      out.shots.push(file);
    } catch {
      /* browser đã đóng */
    }
  }
  out.facts.viewport = page.viewportSize();
  out.ok = out.errors.length === 0;
  return out;
}

async function body(page, out) {
  const CLICK = { timeout: 15000 };
  // Nút CTA mang animate-pulse-subtle nên không bao giờ đạt tiêu chí "ổn định"
  // của Playwright; force vẫn bắn đúng sự kiện click vào đúng phần tử.
  const TAP = { ...CLICK, force: true };
  const go = (name) => {
    out.facts.section = name;
  };

  const shot = async (name) => {
    const file = path.join(OUT, name + '.png');
    await page.screenshot({ path: file, fullPage: false });
    out.shots.push(file);
  };
  const step = (name, detail) => out.steps.push({ step: name, ...detail });
  const readLS = (key) =>
    page.evaluate((k) => {
      try {
        return JSON.parse(localStorage.getItem(k));
      } catch {
        return null;
      }
    }, key);
  const wallet = async () => {
    const p = await readLS(PROFILE_KEY);
    return {
      stars: p?.stars ?? -1,
      xp: p?.xp ?? -1,
      tickets: p?.tickets ?? -1,
      owned: (p?.unlockedItems || []).length,
    };
  };
  /** Vượt cổng số học của bảng Phụ Huynh (mỗi lần mở bảng là một câu đố mới). */
  const passParentGate = async () => {
    const gateText = await page.locator('[role="dialog"]').first().innerText().catch(() => '');
    const sum = /(\d+)\s*\+\s*(\d+)/.exec(gateText);
    if (!sum) return false;
    await page
      .locator('input[type="number"], input[inputmode="numeric"]')
      .first()
      .fill(String(Number(sum[1]) + Number(sum[2])), CLICK);
    const openBtn = page.getByRole('button', { name: /Mở Bảng Phụ Huynh/i }).first();
    if (await openBtn.count()) await openBtn.click(CLICK);
    await page.waitForTimeout(800);
    return true;
  };
  // Tab "mascot" mặc định không có món nào để mua → phải sang tab mũ mới thấy "Mở khóa".
  const openShopAndHatTab = async () => {
    await navTo(page, 'home');
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: /Tủ đồ thời trang và Linh thú/ }).first().click(CLICK);
    await page.waitForTimeout(700);
    await page.getByRole('button', { name: /Mũ & Nón/ }).first().click(CLICK);
    await page.waitForTimeout(600);
  };

  await waitForAppShell(page);
  // DecisionEngine nạp động sau khi mount; CTA bị disable cho tới khi có gợi ý.
  await page.waitForTimeout(2000);

  // ---- 1) "Vì sao gợi ý này?" → tab Phân Tích ------------------------------
  go('1-why-insights');
  const why = page.getByRole('button', { name: /Xem lý do gợi ý này/ }).first();
  if (!(await why.count())) {
    out.errors.push('không thấy link "Vì sao gợi ý này?" trên trang Chủ');
  } else {
    await why.click(CLICK);
    await page.waitForTimeout(700);
    if (!(await passParentGate())) {
      out.errors.push('bảng Ba Mẹ không hiện câu đố cộng — không vào được tab Phân Tích');
    } else {
      const report = (await page.locator('[data-testid="parent-decision-report"]').count()) > 0;
      await shot('01-vi-sao-mo-insight');
      step('whyOpensInsights', { report });
      if (!report) out.errors.push('link "Vì sao gợi ý này?" không mở tới báo cáo Phân Tích');
    }
  }

  // ---- 2) Tắt toàn bộ phần thưởng trong tab Cài Đặt -------------------------
  go('2-toggle-off');
  const settingsTab = page.getByRole('button', { name: /Cài Đặt/ }).first();
  if (!(await settingsTab.count())) {
    out.errors.push('không thấy tab Cài Đặt của bảng Phụ Huynh');
    return;
  }
  await settingsTab.click(CLICK);
  await page.waitForTimeout(500);
  const rewardToggle = page.locator('[data-testid="parent-rewards-toggle"]').first();
  if (!(await rewardToggle.count())) {
    out.errors.push('không tìm thấy công tắc phần thưởng trong Cài Đặt');
  } else {
    await rewardToggle.click(CLICK);
    await page.waitForTimeout(400);
    const settings = await readLS(SETTINGS_KEY);
    await shot('02-tat-phan-thuong');
    step('rewardsSwitch', { rewardsEnabled: settings?.rewardsEnabled });
    if (settings?.rewardsEnabled !== false) {
      out.errors.push('bấm công tắc mà rewardsEnabled vẫn không tắt');
    }
  }
  const closeModal = page.getByRole('button', { name: /Đóng/ }).first();
  if (await closeModal.count()) await closeModal.click(CLICK);
  await page.waitForTimeout(500);

  // Cho bé một túi sao đầy: nếu vẫn mua được khi đã tắt thưởng thì lỗi lộ ra ngay,
  // và khi bật lại mà mua được mới chứng minh công tắc là thứ chặn bé.
  await page.evaluate(([key]) => {
    const p = JSON.parse(localStorage.getItem(key) || '{}');
    p.stars = 999;
    p.xp = 5000;
    localStorage.setItem(key, JSON.stringify(p));
  }, [PROFILE_KEY]);

  // ---- 3) Tủ Đồ: tắt thưởng thì không tiêu được sao ------------------------
  go('3-shop-off');
  await openShopAndHatTab();
  const beforeShop = await wallet();
  const unlockBtn = page.getByRole('button', { name: /^Mở khóa$/ }).first();
  if (!(await unlockBtn.count())) {
    out.errors.push('Tủ Đồ không còn món nào để mở khoá');
  } else {
    await unlockBtn.click(CLICK);
    await page.waitForTimeout(700);
    const afterShop = await wallet();
    await shot('03-shop-tat-thuong');
    step('shopWhileOff', { beforeShop, afterShop });
    if (afterShop.stars !== beforeShop.stars || afterShop.owned !== beforeShop.owned) {
      out.errors.push('ba mẹ đã tắt phần thưởng mà Tủ Đồ vẫn tiêu sao / mở khoá món');
    }
  }

  // ---- 4) Màn kết quả bài học không hứa Sao/XP/Vé khi thưởng tắt ------------
  go('4-lesson-off');
  await navTo(page, 'home');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /Tiếng Việt/ }).first().click(CLICK);
  await page.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 20000 });
  await openFirstLesson(page);
  if ((await page.locator('[data-testid="lesson-timer"]').count()) === 0) {
    out.errors.push('mở bài học đầu tiên của Tiếng Việt mà không vào được màn câu hỏi');
    return;
  }
  const beforeLesson = await wallet();
  let answered = 0;
  for (let i = 0; i < 15; i += 1) {
    const check = page.getByRole('button', { name: /Kiểm tra câu trả lời/ }).first();
    if (!(await check.count())) break;
    const opt = page.locator('[data-testid="answer-option"]').first();
    if (await opt.count()) await opt.click(CLICK);
    await check.click(CLICK);
    answered += 1;
    await page.waitForTimeout(200);
    const next = page.getByRole('button', { name: /Câu tiếp theo|Xem kết quả bài học/ }).first();
    if (await next.count()) await next.click(CLICK);
    await page.waitForTimeout(200);
    if ((await page.getByText('CHÚC MỪNG BÉ HOÀN THÀNH!').count()) > 0) break;
  }
  const reachedResult = (await page.getByText('CHÚC MỪNG BÉ HOÀN THÀNH!').count()) > 0;
  const rewardsOffBlock = page.locator('[data-testid="lesson-rewards-off"]');
  const rewardsOffVisible = (await rewardsOffBlock.count()) > 0;
  const rewardsOffText = rewardsOffVisible
    ? (await rewardsOffBlock.first().innerText().catch(() => '')).replace(/\s+/g, ' ')
    : '';
  const resultText = await page
    .locator('[role="dialog"]')
    .filter({ hasText: 'CHÚC MỪNG BÉ HOÀN THÀNH!' })
    .first()
    .innerText()
    .catch(() => '');
  await shot('04-ket-qua-khi-tat-thuong');
  const afterLesson = await wallet();
  step('lessonWhileOff', {
    answered,
    reachedResult,
    rewardsOffVisible,
    rewardsOffText,
    resultText: resultText.replace(/\s+/g, ' ').slice(0, 160),
    beforeLesson,
    afterLesson,
  });
  if (!reachedResult) out.errors.push('bài học không về tới màn kết quả khi thưởng đang tắt');
  if (!rewardsOffVisible) out.errors.push('tắt phần thưởng mà màn kết quả vẫn hứa Sao/XP/Vé');
  if (/\+\d+ (Sao|XP|Vé)/.test(resultText)) {
    out.errors.push('màn kết quả còn in dòng "+N Sao/XP/Vé" khi thưởng đã tắt');
  }
  if (afterLesson.stars !== beforeLesson.stars || afterLesson.tickets !== beforeLesson.tickets) {
    out.errors.push('thưởng đã tắt mà tài nguyên của bé vẫn đổi sau một bài học');
  }
  await dismissLevelUpCelebration(page);
  const back = page.getByRole('button', { name: /Về bản đồ/ }).first();
  if (await back.count()) await back.click(TAP);
  await page.waitForTimeout(500);

  // ---- 5) Bật lại thưởng: chính món vừa bị chặn giờ mua được ----------------
  go('5-shop-on');
  await page.getByRole('button', { name: /Khu vực dành cho Ba Mẹ/ }).first().click(CLICK);
  await page.waitForTimeout(700);
  if (await passParentGate()) {
    await settingsTab.click(CLICK);
    await page.waitForTimeout(400);
    await page.locator('[data-testid="parent-rewards-toggle"]').first().click(CLICK);
    await page.waitForTimeout(400);
    const backOn = await readLS(SETTINGS_KEY);
    step('rewardsBackOn', { rewardsEnabled: backOn?.rewardsEnabled });
    if (backOn?.rewardsEnabled !== true) {
      out.errors.push('không bật lại được phần thưởng — probe để lại trạng thái hỏng');
    }
  } else {
    out.errors.push('lượt hai: không đọc được câu đố cổng Ba Mẹ');
  }
  const close2 = page.getByRole('button', { name: /Đóng/ }).first();
  if (await close2.count()) await close2.click(CLICK);
  await page.waitForTimeout(500);

  await openShopAndHatTab();
  const beforeBuy = await wallet();
  const buyBtn = page.getByRole('button', { name: /^Mở khóa$/ }).first();
  if (!(await buyBtn.count())) {
    out.errors.push('bật lại phần thưởng rồi nhưng Tủ Đồ không còn nút "Mở khóa" để bấm');
  } else {
    await buyBtn.click(CLICK);
    await page.waitForTimeout(800);
    const afterBuy = await wallet();
    await shot('05-shop-sau-khi-bat');
    step('shopAfterReopen', { beforeBuy, afterBuy });
    if (afterBuy.owned <= beforeBuy.owned) {
      out.errors.push('bật lại phần thưởng rồi mà Tủ Đồ vẫn không cho mua — công tắc chặn sai chỗ');
    }
    // Mua món cộng XP (qua thành tựu) → màn ăn mừng cấp mới che hết điều hướng.
    await dismissLevelUpCelebration(page);
  }

  // ---- 6) CTA "Bắt đầu: …" phải đưa bé tới đích của gợi ý -------------------
  // Sau khi học xong một bài, engine thường gợi ý bài kế tiếp; đây là chỗ lộ ra
  // lỗi cũ: bấm CTA chỉ ra bản đồ môn rồi bé phải tự tìm lại bài.
  go('6-cta');
  await dismissLevelUpCelebration(page);
  await navTo(page, 'home');
  await page.waitForTimeout(1500);
  const cta = page.getByRole('button', { name: /^Bắt đầu:/ }).first();
  if (!(await cta.count())) {
    out.errors.push('trang Chủ không có CTA "Bắt đầu: …"');
  } else if (await cta.isDisabled()) {
    out.errors.push('CTA vẫn bị khoá — DecisionEngine không trả gợi ý nào');
  } else {
    const ctaLabel = (await cta.getAttribute('aria-label')) || '';
    const clicked = await cta
      .click(TAP)
      .then(() => true)
      .catch(async () => {
        out.facts.ctaBlocker = await describeBlocker(page, '[aria-label^="Bắt đầu:"]');
        return false;
      });
    if (!clicked) {
      out.errors.push('không bấm được CTA "Bắt đầu: …" (bị che)');
    } else {
      // Trò chơi là React.lazy → chunk có thể tải sau vài giây; chờ tối đa 12s.
      await page
        .waitForSelector(
          '[data-testid="lesson-timer"], [data-testid="game-close"], [data-testid="recommended-games"], [data-testid^="lesson-button-"]',
          { timeout: 12000 }
        )
        .catch(() => {});
      await page.waitForTimeout(600);
      const playerOpen = (await page.locator('[data-testid="lesson-timer"]').count()) > 0;
      const gameOpen = (await page.locator('[data-testid="game-close"]').count()) > 0;
      const gamesHub = (await page.locator('[data-testid="recommended-games"]').count()) > 0;
      const onSubjectMap = (await page.locator('[data-testid^="lesson-button-"]').count()) > 0;
      const stillHome =
        !playerOpen && !gameOpen && !gamesHub && !onSubjectMap;
      await shot('06-cta-mo-dich');
      step('ctaRouting', { ctaLabel, playerOpen, gameOpen, gamesHub, onSubjectMap });
      if (stillHome) {
        out.errors.push(`bấm "${ctaLabel}" nhưng vẫn đứng ở trang Chủ`);
      }
      if (onSubjectMap && !playerOpen) {
        // Bản đồ môn chỉ chấp nhận được khi gợi ý KHÔNG phải một bài học trên chính bản đồ đó.
        const title = ctaLabel.replace(/^Bắt đầu:\s*/, '').replace(/^Trò Chơi:\s*/, '');
        const nodeLabels = await page
          .locator('[data-testid^="lesson-button-"]')
          .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label') || ''));
        if (title && nodeLabels.some((t) => t.includes(title))) {
          out.errors.push(`CTA "${ctaLabel}" chỉ mở bản đồ môn, bài được gợi ý không tự bật`);
        }
      }
      if (playerOpen) {
        const closeLesson = page.getByRole('button', { name: /Đóng/ }).first();
        if (await closeLesson.count()) await closeLesson.click(TAP);
        await page.waitForTimeout(400);
      }
      if (gameOpen) {
        await page.locator('[data-testid="game-close"]').first().click(TAP).catch(() => {});
        await page.waitForTimeout(400);
      }
    }
  }
}
