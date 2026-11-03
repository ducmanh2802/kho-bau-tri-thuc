// T47A — bằng chứng nhìn thấy được cho phần CÒN LẠI của `DEF-013`, chạy trên dist/ thật.
//   A  tấm che "Đang tạm dừng" phủ khung chơi (`absolute inset-0 z-20`, dựng khi
//      `isRealtime && isPaused`) nhưng `useModalHistory` chỉ khai `overlayOpen: showTierModal`
//      ⇒ bản cũ: bấm `Esc` lúc đang tạm dừng **thoát luôn ván**. Bản mới: Esc mở khoá, ván còn.
//   A3 đối chứng: Esc lần hai (không còn lớp phủ nào) vẫn phải thoát — chốt mới không được
//      biến `Esc` thành phím chết.
//   B  trò không có đồng hồ ⇒ không có tấm che ⇒ một lần Esc vẫn thoát ngay (không nuốt phím).
//   C  hồi quy T46C trên build thật: lớp phủ "Chọn Màn & Độ Khó" vẫn là ưu tiên số một.
// Chạy: npm run build && node qa/run-one.mjs evidence/2026-11-04-T47/probe-t47-escape-pause.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));

const PAUSE_BTN = '[data-testid="game-pause"]';
const VEIL = '[data-testid="game-paused-veil"]';
const GAME_CLOSE = '[data-testid="game-close"]';
const TIER_TRIGGER = 'button[title="Bấm để chọn màn hoặc tăng độ khó"]';
const TIER_PANEL = 'text=Chọn Màn & Độ Khó';

const CLOCK_GAME = 'Bắt Chữ Cái Bay';
const NO_CLOCK_GAME = 'Lật Thẻ Trí Nhớ Vàng';

function titlesFromGamesProbe() {
  const src = fs.readFileSync(new URL('../../qa/games.mjs', import.meta.url), 'utf8');
  const block = /const GAME_TITLES = \[([\s\S]*?)\];/.exec(src);
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

const out = { steps: [], errors: [], facts: {}, failedAt: null, shots: [] };

export default async function run(page, ui) {
  try {
    await measure(page, ui, out);
  } catch (e) {
    out.errors.push(`EXCEPTION: ${e && e.message ? String(e.message).slice(0, 900) : String(e)}`);
    if (!out.failedAt) out.failedAt = out.steps.length ? out.steps[out.steps.length - 1] : 'start';
  }
  out.ok = out.errors.length === 0;
  return out;
}

async function measure(page, ui, out) {
  const CLICK = { timeout: 15000 };
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

  const titles = titlesFromGamesProbe();
  const openGame = async (title) => {
    const idx = titles.indexOf(title);
    if (idx < 0) throw new Error(`không tìm thấy "${title}" trong GAME_TITLES của qa/games.mjs`);
    await page.locator('[data-testid="nav-games"]:visible').first().click(CLICK);
    await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });
    await page.getByRole('button', { name: /Chơi ngay/ }).nth(idx).click(CLICK);
    await page.waitForTimeout(1200);
    if (await page.getByText('Bắt đầu ▶').count()) await page.getByText('Bắt đầu ▶').click(CLICK);
    await page.waitForTimeout(700);
  };
  const clickPause = async () => {
    try {
      await page.locator(PAUSE_BTN).first().click({ ...CLICK, force: true });
    } catch (e) {
      fail('A', `không bấm được nút Tạm dừng: ${String(e && e.message).slice(0, 160)}`);
    }
    await page.waitForTimeout(500);
  };

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${ui.origin}/?qa`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });

  // ── A: Esc lúc đang tạm dừng phải MỞ KHOÁ, không xoá ván ────────────────
  await openGame(CLOCK_GAME);
  const pauseButtons = await page.locator(PAUSE_BTN).count();
  out.facts.pauseButtonsOnClockGame = pauseButtons;
  if (pauseButtons !== 1) {
    fail('A', `"${CLOCK_GAME}" phải có đúng 1 nút Tạm dừng, đo được ${pauseButtons} — không đo được Esc`);
    await shot('a0-khong-co-nut-tam-dung');
    return finish(out);
  }
  await clickPause();
  const veilOpen = await page.locator(VEIL).count();
  out.facts.veilAfterPause = veilOpen;
  if (veilOpen !== 1) {
    fail('A', `bấm Tạm dừng mà tấm che "Đang tạm dừng" không hiện (đo ${veilOpen})`);
    return finish(out);
  }
  await dismissLevelUpCelebration(page, CLICK, 400);
  await shot('a1-dang-tam-dung');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  const veilAfterEsc = await page.locator(VEIL).count();
  const stillInGame = await page.locator(GAME_CLOSE).count();
  out.facts.esc1 = { veilAfterEsc, stillInGame };
  if (veilAfterEsc !== 0) {
    fail('A', `Esc lần một không mở khoá tấm che tạm dừng (còn ${veilAfterEsc} khối)`);
  } else if (stillInGame === 0) {
    fail('A', 'Esc lần một mở khoá NHƯNG cũng thoát luôn trò chơi — hành vi cũ của DEF-013');
  } else {
    step('A1: tấm che đang phủ ⇒ Esc MỞ KHOÁ (veil 1→0) mà ván chơi còn nguyên (còn nút đóng)');
  }
  await shot('a2-sau-esc-lan-mot');

  // ── A3 (đối chứng): Esc lần hai khi không còn lớp phủ vẫn phải thoát ─────
  await clickPause();
  const veilAgain = await page.locator(VEIL).count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const veilAfterSecondPauseEsc = await page.locator(VEIL).count();
  const inGameAfterOneEsc = await page.locator(GAME_CLOSE).count();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const inGameAfterTwoEsc = await page.locator(GAME_CLOSE).count();
  out.facts.esc2 = { veilAgain, veilAfterSecondPauseEsc, inGameAfterOneEsc, inGameAfterTwoEsc };
  if (veilAfterSecondPauseEsc !== 0) {
    fail('A3', `Esc không mở khoá ở lượt thứ hai (còn ${veilAfterSecondPauseEsc} tấm che)`);
  } else if (inGameAfterOneEsc !== 1) {
    fail('A3', `Esc chỉ mở khoá mà ván đã bị thoát (game-close = ${inGameAfterOneEsc})`);
  } else if (inGameAfterTwoEsc !== 0) {
    fail('A3', `Esc lần hai (không còn lớp phủ) vẫn không thoát — chốt mới nuốt phím thoát của bé`);
  } else {
    step('A3: đối chứng — Esc kế tiếp khi không còn lớp phủ vẫn thoát thật (ván 1→0)');
  }
  await shot('a3-da-thoat-game');

  // ── B: trò không có đồng hồ ⇒ một lần Esc thoát ngay (không có gì để đóng) ─
  await openGame(NO_CLOCK_GAME);
  const noClockPause = await page.locator(PAUSE_BTN).count();
  out.facts.pauseButtonsOnNoClockGame = noClockPause;
  if (noClockPause !== 0) {
    fail('B', `"${NO_CLOCK_GAME}" không có đồng hồ mà vẫn có ${noClockPause} nút Tạm dừng`);
  }
  await dismissLevelUpCelebration(page, CLICK, 300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const noClockAfterEsc = await page.locator(GAME_CLOSE).count();
  out.facts.noClockAfterEsc = noClockAfterEsc;
  if (noClockAfterEsc !== 0) {
    fail('B', `trò không có lớp phủ mà Esc không thoát (còn ${noClockAfterEsc} modal) — phím bị nuốt`);
  } else {
    step('B1: trò không tấm che ⇒ một lần Esc thoát ngay, lối thoát bằng bàn phím còn nguyên');
  }
  await shot('b1-khong-co-tam-che');

  // ── C: hồi quy T46C trên dist — bảng chọn màn vẫn là ưu tiên số một ───────
  await openGame(CLOCK_GAME);
  const tierTrigger = page.locator(TIER_TRIGGER).first();
  if ((await tierTrigger.count()) === 0) {
    fail('C', 'không thấy nút mở bảng "Chọn Màn & Độ Khó" — không đo được thứ tự lớp phủ');
    return finish(out);
  }
  await tierTrigger.click({ ...CLICK, force: true });
  await page.waitForSelector(TIER_PANEL, { timeout: 8000 });
  await dismissLevelUpCelebration(page, CLICK, 400);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  const panelAfterEsc = await page.locator(TIER_PANEL).count();
  const gameAfterTierEsc = await page.locator(GAME_CLOSE).count();
  out.facts.tierAfterEsc = { panelAfterEsc, gameAfterTierEsc };
  if (panelAfterEsc !== 0) {
    fail('C', `Esc không đóng bảng chọn màn (còn ${panelAfterEsc} khối) — hồi quy T46C trên build`);
  } else if (gameAfterTierEsc === 0) {
    fail('C', 'Esc đóng bảng chọn màn nhưng thoát luôn trò chơi — hồi quy T46C');
  } else {
    step('C1: còn bảng chọn màn thì Esc thuộc về bảng (z-50), không đụng tấm che cũng không thoát ván');
  }
  await shot('c1-bang-chon-man-dong-truoc');

  return finish(out);
}

function finish(o) {
  o.ok = o.errors.length === 0;
  return o;
}
