// KBT-ISSUE-43 — nút Tạm dừng phải dừng được thật, không chỉ đổi nhãn.
// Trước lát cắt này `isPaused` là state riêng của GameModalWrapper nên không hẹn giờ nào của
// game nghe theo: bấm tạm, bóng vẫn rơi. Probe đo trên dist/ thật:
//   A  nút render đúng chỗ — 4 trò có đồng hồ có 1 nút, trò không đồng hồ có 0 nút
//   B  bấm tạm ⇒ vị trí bóng đứng nguyên (đo `top` cách nhau 1 200 ms), lớp phủ hiện ra
//   C  bấm tạm ⇒ chạm bóng không xoá bóng, không tăng câu, không hiện lời khen (không farm điểm)
//   D  bấm tiếp ⇒ bóng rơi lại; đồng hồ Đường Đua đứng khi tạm và chạy khi tiếp
// Chạy: npm run build && node qa/run-one.mjs qa/game-pause.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'evidence', '2026-11-02-KBT-ISSUE-43');
fs.mkdirSync(OUT, { recursive: true });

const PAUSE_BTN = '[data-testid="game-pause"]';
const VEIL = '[data-testid="game-paused-veil"]';
const ITEM = '[data-testid="falling-item"]';
const TIER_TRIGGER = 'button[title="Bấm để chọn màn hoặc tăng độ khó"]';
const RACE_BAR = '[data-testid="race-timer"] div[style*="width"]';

const CLOCK_GAMES = ['Bắt Chữ Cái Bay', 'Hứng Số Rơi Rộn Ràng', 'Đập Bóng Màu', 'Đường Đua Thần Tốc'];
const NO_CLOCK_GAME = 'Lật Thẻ Trí Nhớ Vàng';

function titlesFromGamesProbe() {
  const src = fs.readFileSync(new URL('./games.mjs', import.meta.url), 'utf8');
  const block = /const GAME_TITLES = \[([\s\S]*?)\];/.exec(src);
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

export default async function run(page, ui) {
  const out = { steps: [], errors: [], facts: {}, failedAt: null, shots: [] };
  const titles = titlesFromGamesProbe();
  const step = (s) => out.steps.push(s);
  const fail = (at, msg) => {
    if (!out.failedAt) out.failedAt = at;
    out.errors.push(`${at}: ${msg}`);
  };
  const shot = async (name) => {
    const file = path.join(OUT, `${name}.png`);
    await page.screenshot({ path: file });
    out.shots.push(file);
  };

  page.on('console', (m) => {
    if (m.type() === 'error') out.errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => out.errors.push(`pageerror: ${e.message}`));

  const play = page.getByRole('button', { name: /Chơi ngay/ });
  const openGame = async (title) => {
    const i = titles.indexOf(title);
    if (i < 0) throw new Error('không tìm thấy trò trong hub: ' + title);
    await play.nth(i).click();
    await page.waitForTimeout(1200);
    if (await page.getByText('Bắt đầu ▶').count()) await page.getByText('Bắt đầu ▶').click();
    await page.waitForTimeout(600);
  };
  const closeGame = async () => {
    const c = page.locator('[data-testid="game-close"]');
    if (await c.count()) await c.first().click();
    await page.waitForTimeout(700);
  };
  // `top` của từng bóng đang rơi, lấy nguyên văn từ inline style để so chuỗi, không làm tròn.
  const tops = () =>
    page.locator(ITEM).evaluateAll((els) => els.map((e) => e.style.top));
  const barWidth = () => page.locator(RACE_BAR).first().getAttribute('style');
  const roundLabel = () => page.locator(TIER_TRIGGER).first().innerText();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${ui.origin}/?qa`);
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });

  // Màn 4 là bậc sớm nhất của Đường Đua có đồng hồ đếm ngược (3 bậc đầu cố ý không có).
  await page.evaluate(() => {
    const games = {};
    for (const id of ['catch_letters', 'falling_numbers', 'color_balloon', 'speed_racing', 'memory_cards']) {
      games[id] = {
        unlockedTier: 4,
        starsByTier: {},
        bestScoreByTier: {},
        updatedAt: new Date().toISOString(),
      };
    }
    localStorage.setItem(
      'kho_bau_game_progress',
      JSON.stringify({ version: 1, games, updatedAt: new Date().toISOString() })
    );
  });
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.locator('[data-testid="nav-games"]:visible').first().click();
  await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });

  // ── A: nút chỉ hiện ở trò có đồng hồ ────────────────────────────────────
  await openGame(NO_CLOCK_GAME);
  const noClockButtons = await page.locator(PAUSE_BTN).count();
  out.facts.pauseButtonCount = { [NO_CLOCK_GAME]: noClockButtons };
  if (noClockButtons !== 0) {
    fail('A', `"${NO_CLOCK_GAME}" không có đồng hồ mà vẫn có ${noClockButtons} nút tạm`);
  } else {
    step(`A1: trò không đồng hồ "${NO_CLOCK_GAME}" → 0 nút tạm (không có gì để dừng)`);
  }
  await closeGame();

  for (const title of CLOCK_GAMES) {
    await openGame(title);
    const n = await page.locator(PAUSE_BTN).count();
    out.facts.pauseButtonCount = { ...(out.facts.pauseButtonCount || {}), [title]: n };
    if (n !== 1) fail('A', `"${title}" có ${n} nút game-pause, mong 1`);
    else step(`A2: "${title}" render đúng 1 nút game-pause`);
    await closeGame();
  }
  if (out.failedAt === 'A') return finish(out);

  // ── B + C: bấm tạm trên "Bắt Chữ Cái Bay" ───────────────────────────────
  await openGame(CLOCK_GAMES[0]);
  await page.locator(ITEM).first().waitFor({ timeout: 8000 });
  const moving = await tops();
  await page.waitForTimeout(1200);
  const movingAfter = await tops();
  out.facts.running = { before: moving.slice(0, 2), after1200ms: movingAfter.slice(0, 2) };
  if (moving.join() === movingAfter.join()) {
    fail('B-control', 'bóng không rơi khi CHƯA bấm tạm — phép thử đứng-im-lại khi tạm sẽ vô nghĩa');
    await shot('b0-khong-nhung-duoc-vi-bong-khong-chay');
    return finish(out);
  }
  step(`B1 (control): chưa tạm, bóng đã rơi — ${moving[0]} → ${movingAfter[0]} sau 1 200 ms`);

  // C: chạm bóng lúc tạm phải không được tính — bóng không bị xoá, câu không tăng, không có lời khen.
  // dispatchEvent chứ không click thường: lớp phủ z-20 che bóng, nên cú click thật sẽ rơi vào
  // lớp phủ và phép thử này thành vô nghĩa. Đây là đo **guard trong code**, lớp phủ đã đo ở B2.
  const readTargetChar = async () => {
    for (const t of await page.locator('span').allInnerTexts()) {
      const m = /mang chữ: \[ (.+?) \]/.exec(t);
      if (m) return m[1].trim();
    }
    return null;
  };
  const targetChar = await readTargetChar();
  out.facts.targetChar = targetChar;
  // Chọn bóng đích đã rơi vào **giữa bảng** (20–70%): bóng vừa sinh nằm ở top -10%,
  // bị overflow-hidden cắt nên toạ độ click rơi ra ngoài bảng và cú click thật không tới nút.
  const idxOfTarget = () =>
    targetChar
      ? page
          .locator(ITEM)
          .evaluateAll(
            (els, ch) =>
              els.findIndex((e) => {
                const t = parseFloat(e.style.top);
                return (e.textContent || '').trim().startsWith(ch) && t >= 20 && t <= 70;
              }),
            targetChar
          )
      : Promise.resolve(-1);
  const countTarget = () =>
    targetChar
      ? page
          .locator(ITEM)
          .evaluateAll((els, ch) => els.filter((e) => (e.textContent || '').trim().startsWith(ch)).length, targetChar)
      : Promise.resolve(-1);
  // Bảng chữ đổi mỗi 2 câu, nên "bóng đích" có thể chưa rơi xuống. Chờ lúc ĐANG chạy cho đến
  // khi nó ở giữa bảng rồi mới bấm tạm — bóng bị cắt viền thì click thật không tới nút.
  const targetInBand = ([sel, ch]) =>
    [...document.querySelectorAll(sel)].some((e) => {
      const t = parseFloat(e.style.top);
      return (e.textContent || '').trim().startsWith(ch) && t >= 20 && t <= 70;
    });
  let targetVisible = false;
  if (!targetChar) {
    fail('C', 'không đọc được chữ đích từ banner "Hãy chạm vào các bóng bóng mang chữ: [ X ]" — phép thử C vô nghĩa');
  } else {
    await page.waitForFunction(targetInBand, [ITEM, targetChar], { timeout: 10000 }).catch(() => {});
    targetVisible = (await idxOfTarget()) >= 0;
    if (!targetVisible) fail('C', `10 giây không thấy bóng đích "${targetChar}" ở giữa bảng — không đo được C1`);
  }

  // ── B: bấm tạm ⇒ mọi chuyển động đứng lại ───────────────────────────────
  await page.locator(PAUSE_BTN).click();
  await page.waitForTimeout(200);
  const pressed = await page.locator(PAUSE_BTN).getAttribute('aria-pressed');
  const veilCount = await page.locator(VEIL).count();
  const frozenA = await tops();
  await page.waitForTimeout(1200);
  const frozenB = await tops();
  out.facts.paused = { ariaPressed: pressed, veilCount, count: frozenA.length, atPause: frozenA.slice(0, 2), after1200ms: frozenB.slice(0, 2) };
  if (pressed !== 'true') fail('B', `bấm tạm nhưng aria-pressed = ${pressed} (mong "true")`);
  if (veilCount !== 1) fail('B', `lớp phủ "Đang tạm dừng" xuất hiện ${veilCount} lần, mong 1`);
  if (frozenA.join() !== frozenB.join()) {
    fail('B', `đã bấm tạm mà bóng vẫn di chuyển: ${frozenA[0]} → ${frozenB[0]}`);
  } else {
    step(`B2: bấm tạm → ${frozenA.length} bóng đứng nguyên vị trí trong 1 200 ms, aria-pressed="true", lớp phủ hiện`);
  }
  await shot('b3-dang-tam-dung');

  if (targetVisible) {
    const countBefore = await page.locator(ITEM).count();
    const roundBefore = await roundLabel();
    // So **đúng bóng đó** còn hay mất (element handle + isConnected), không so tổng số bóng:
    // bóng mới sinh liên tục nên đếm số sẽ nói sai ở cả hai chiều.
    const bubble = await page.locator(ITEM).nth(await idxOfTarget()).elementHandle();
    await bubble.dispatchEvent('click');
    await page.waitForTimeout(500);
    const stillPaused = await bubble.evaluate((el) => el.isConnected);
    const countAfterClick = await page.locator(ITEM).count();
    const roundAfterClick = await roundLabel();
    const toastWhilePaused = await page.locator('[data-testid="praise-toast"]').count();
    out.facts.clickWhilePaused = {
      targetChar,
      countBefore,
      countAfterClick,
      bubbleStillMounted: stillPaused,
      roundBefore,
      roundAfterClick,
      praiseToast: toastWhilePaused,
    };
    if (!stillPaused) {
      fail(
        'C',
        `đang tạm mà chạm bóng đích "${targetChar}" vẫn bị xoá bóng (${countBefore} → ${countAfterClick}) ` +
          '— bé farm được đáp án khi màn dừng'
      );
    } else if (roundBefore !== roundAfterClick) {
      fail('C', `bấm tạm mà tiến độ vẫn nhảy: "${roundBefore}" → "${roundAfterClick}"`);
    } else if (toastWhilePaused > 0) {
      fail('C', `đang tạm, chạm bóng mà bảng lời khen vẫn hiện ${toastWhilePaused} lần`);
    } else {
      step(
        `C1: đang tạm, chạm đúng bóng đích "${targetChar}" → bóng còn nguyên trên màn, ` +
          `không nhích câu, 0 lời khen (${countBefore} bóng → ${countAfterClick} bóng)`
      );
    }
  }

  // D: bấm tiếp phải chạy lại — nếu không thì phép thử "đứng im" ở B chỉ là màn hình chết.
  await page.locator(PAUSE_BTN).click();
  await page.waitForTimeout(200);
  const resumedPressed = await page.locator(PAUSE_BTN).getAttribute('aria-pressed');
  const veilAfterResume = await page.locator(VEIL).count();
  const rA = await tops();
  await page.waitForTimeout(1200);
  const rB = await tops();
  out.facts.afterResume = { ariaPressed: resumedPressed, veil: veilAfterResume, before: rA.slice(0, 2), after1200ms: rB.slice(0, 2) };
  if (veilAfterResume !== 0) fail('D', 'bấm "Tiếp tục" mà lớp phủ "Đang tạm dừng" vẫn che bảng chơi');
  if (resumedPressed !== 'false') fail('D', `nút sau khi tiếp tục có aria-pressed = ${resumedPressed} (mong "false")`);
  if (rA.join() === rB.join()) fail('D', `tiếp tục rồi mà bóng vẫn bất động (${rA[0]}) — đồng hồ bị treo vĩnh viễn`);
  else step(`D1: bấm tiếp → ${veilAfterResume} lớp phủ, aria-pressed="false", bóng rơi lại ${rA[0]} → ${rB[0]}`);
  await shot('d2-cho-tiep-tuc');

  // Đối chứng cho C1: cùng cú chạm đó lúc ĐANG chạy phải ăn điểm. Đếm bóng mang chữ đích
  // chứ không đếm tổng — bóng mới sinh liên tục nên tổng số có thể tăng dù cú chạm hiệu quả.
  if (targetChar) {
    await page.waitForFunction(targetInBand, [ITEM, targetChar], { timeout: 10000 }).catch(() => {});
    const runningIdx = await idxOfTarget();
    if (runningIdx < 0) {
      fail('C-control', `lúc đang chạy không tìm thấy bóng đích "${targetChar}" ở giữa bảng — C1 thiếu đối chứng`);
    } else {
      const before = await countTarget();
      const bubble = await page.locator(ITEM).nth(runningIdx).elementHandle();
      // dispatchEvent, không click theo toạ độ: bóng rơi liên tục nên giữa lúc đo hộp và lúc
      // thả chuột nó đã dịch đi, cú click thật trượt. C1 và C2 phải **khác nhau đúng một thứ**
      // là trạng thái tạm — cùng một cơ chế bắn sự kiện thì so sánh mới có nghĩa.
      await bubble.dispatchEvent('click');
      await page.waitForTimeout(250);
      const gone = !(await bubble.evaluate((el) => el.isConnected));
      out.facts.controlClickWhileRunning = {
        targetChar,
        targetBubblesBefore: before,
        bubbleRemoved: gone,
        totalAfter: await page.locator(ITEM).count(),
      };
      if (!gone) {
        fail(
          'C-control',
          `chạm bóng đích "${targetChar}" lúc ĐANG CHẠY mà nó không bị xoá ` +
            '— lớp chặn đã chặn cả lúc không tạm, nên C1 không chứng minh được gì (hoặc game hỏng)'
        );
      } else {
        step(
          `C2 (đối chứng): cũng cú chạm ấy lúc đang chạy xoá đúng bóng đích "${targetChar}" ` +
            '(bóng đã mount biến mất khỏi DOM) — C1 là do trạng thái tạm, không phải bóng bấm không ăn'
        );
      }
    }
  }
  await closeGame();

  // ── D-race: đồng hồ đếm ngược của Đường Đua ─────────────────────────────
  await openGame(CLOCK_GAMES[3]);
  await page.locator(TIER_TRIGGER).first().click();
  await page.waitForTimeout(400);
  await page.locator('button:has-text("Màn 4: ")').first().click();
  await page.waitForTimeout(1000);
  if ((await page.locator(RACE_BAR).count()) === 0) {
    fail('D-race', 'Màn 4 của Đường Đua không hiện đồng hồ đếm ngược');
  } else {
    const liveA = await barWidth();
    await page.waitForTimeout(1500);
    const liveB = await barWidth();
    out.facts.raceRunning = { liveA, liveB };
    if (liveA === liveB) fail('D-race', `thanh đồng hồ không trôi khi chưa tạm (${liveA}) — phép thử dưới vô nghĩa`);
    await page.locator(PAUSE_BTN).click();
    await page.waitForTimeout(200);
    const pauseA = await barWidth();
    await page.waitForTimeout(1500);
    const pauseB = await barWidth();
    out.facts.racePaused = { pauseA, pauseB };
    if (pauseA !== pauseB) fail('D-race', `đang tạm mà đồng hồ vẫn lùi: ${pauseA} → ${pauseB}`);
    else step(`D2: Đường Đua bấm tạm → ${pauseA} giữ nguyên 1 500 ms (bé không bị trừ lỗi vì việc cắt ngang)`);
    await shot('d3-duong-dua-tam-dung');
    await page.locator(PAUSE_BTN).click();
    await page.waitForTimeout(1500);
    const resumedBar = await barWidth();
    out.facts.raceResumed = resumedBar;
    if (resumedBar === pauseB) fail('D-race', `đóng tạm rồi mà đồng hồ không chạy lại (${resumedBar})`);
    else step(`D3: bấm tiếp → đồng hồ chạy lại (${pauseB} → ${resumedBar})`);
  }
  await closeGame();

  return finish(out);
}

function finish(out) {
  out.ok = out.errors.length === 0;
  return out;
}
