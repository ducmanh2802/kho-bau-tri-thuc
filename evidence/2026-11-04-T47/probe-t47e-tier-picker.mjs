// T47E — bằng chứng nhìn thấy được: bảng "Chọn Màn & Độ Khó" phải đưa bảng chơi về ĐÚNG
// màn bé bấm, kể cả màn **dễ hơn**.
//
// Bệnh cũ (src/components/games/GameModalWrapper.tsx handleSelectTier): chọn màn chỉ ghi
// `StorageService.selectGameTier` (mở khoá, `Math.max`) rồi gọi `onRestart()` cụt, mà
// `useGameStage.restartGame` lấy màn từ `unlockedTier` = màn khó nhất từng mở ⇒ bé ở Màn 5
// bấm Màn 2 thì điểm mất, bảng vẫn Màn 5.
//
// Probe: nạp tiến độ giả unlockedTier=5, mở "Xây Tháp Số Lên Mây", đọc nhãn Màn trên header,
// bấm dòng "Màn 2" trong bảng chọn, đọc lại header. Bản cũ: header vẫn "Màn 5/6" ⇒ FAIL.
// Kèm hồi quy: unlockedTier vẫn 5 (chọn màn dễ KHÔNG tụt tiến độ — bất biến T42/A).
// Chạy: npm run build && node qa/run-one.mjs evidence/2026-11-04-T47/probe-t47e-tier-picker.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));

const GAME_TITLE = 'Xây Tháp Số Lên Mây';
const GAME_ID = 'number_tower';
const TIER_TRIGGER = 'button[title="Bấm để chọn màn hoặc tăng độ khó"]';
const TIER_PANEL = 'text=Chọn Màn & Độ Khó';

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
  const idx = titles.indexOf(GAME_TITLE);
  if (idx < 0) throw new Error(`không tìm thấy "${GAME_TITLE}" trong GAME_TITLES của qa/games.mjs`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${ui.origin}/?qa`);
  await page.evaluate(() => localStorage.clear());

  // Bé đã chơi tới Màn 5: mở khoá 5, sao các màn dưới đã có (bối cảnh thật của bug).
  await page.evaluate(
    ([gameId]) => {
      localStorage.setItem(
        'kho_bau_game_progress',
        JSON.stringify({
          version: 1,
          games: {
            [gameId]: {
              unlockedTier: 5,
              starsByTier: { 1: 3, 2: 3, 3: 2, 4: 3 },
              bestScoreByTier: { 1: 20, 2: 18, 3: 15, 4: 16 },
              updatedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date().toISOString(),
        })
      );
    },
    [GAME_ID]
  );

  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });

  await page.locator('[data-testid="nav-games"]:visible').first().click(CLICK);
  await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });
  await page.getByRole('button', { name: /Chơi ngay/ }).nth(idx).click(CLICK);
  await page.waitForTimeout(1200);
  if (await page.getByText('Bắt đầu ▶').count()) await page.getByText('Bắt đầu ▶').click(CLICK);
  await page.waitForTimeout(700);

  // ── D1: bảng mở đúng Màn 5 như tiến độ đã lưu ───────────────────────────
  const headerBefore = await page.locator(TIER_TRIGGER).first().innerText();
  out.facts.headerBefore = headerBefore.replace(/\s+/g, ' ').trim();
  if (!out.facts.headerBefore.includes('Màn 5/')) {
    fail('D1', `bảng phải bắt đầu ở Màn 5 (unlockedTier=5) nhưng header là "${out.facts.headerBefore}"`);
  } else {
    step('D1: tiến độ Màn 5 ⇒ bảng đúng mở Màn 5');
  }

  // ── D2: bé bấm Màn 2 trong bảng chọn ⇒ header phải thành Màn 2 ──────────
  await page.locator(TIER_TRIGGER).first().click({ ...CLICK, force: true });
  await page.waitForSelector(TIER_PANEL, { timeout: 10000 });
  await shot('d1-bang-chon-man-dang-mo');
  const row = page.getByRole('button', { name: /Màn 2:/ }).first();
  if (!(await row.count())) {
    fail('D2', 'bảng chọn màn không có dòng "Màn 2:" để bé bấm');
  } else {
    await row.click(CLICK);
    await page.waitForTimeout(1200);
    await dismissLevelUpCelebration(page, CLICK, 400);
    const headerAfter = await page.locator(TIER_TRIGGER).first().innerText();
    out.facts.headerAfterPick = headerAfter.replace(/\s+/g, ' ').trim();
    await shot('d2-sau-khi-chon-man-2');
    if (!out.facts.headerAfterPick.includes('Màn 2/')) {
      fail('D2', `bé chọn Màn 2 mà bảng vẫn ở "${out.facts.headerAfterPick}" — hành vi cũ của T47E`);
    } else {
      step('D2: chọn Màn 2 ⇒ bảng về đúng Màn 2 (bản cũ vẫn Màn 5, chỉ mất điểm)');
    }
  }

  // ── D3: bất biến T42/A — chọn màn dễ KHÔNG tụt tiến độ đã mở ────────────
  const unlocked = await page.evaluate(
    ([gameId]) => {
      const raw = JSON.parse(localStorage.getItem('kho_bau_game_progress') || '{}');
      const g = (raw.games || {})[gameId] || {};
      return { unlockedTier: g.unlockedTier, stars: Object.keys(g.starsByTier || {}).length };
    },
    [GAME_ID]
  );
  out.facts.progressAfterPick = unlocked;
  if (unlocked.unlockedTier !== 5) {
    fail('D3', `tiến độ mở khoá bị tụt từ 5 xuống ${unlocked.unlockedTier} chỉ vì bé chọn màn dễ`);
  } else {
    step('D3: unlockedTier vẫn 5 — chọn màn dễ không phạt mất tiến độ');
  }

  // ── D4: sau khi bảng chọn đã đóng, Esc vẫn phải thoát ván ───────────────
  // (chốt T47A chỉ giữ Esc cho lớp phủ *đang mở*; nếu không còn lớp phủ nào thì phím
  //  không được thành phím chết — bé vẫn phải thoát được bằng bàn phím.)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  const inGameAfterEsc = await page.locator('[data-testid="game-close"]').count();
  out.facts.inGameAfterEsc = inGameAfterEsc;
  if (inGameAfterEsc !== 0) {
    fail('D4', `Esc không còn lớp phủ nào che nhưng cũng không thoát ván (game-close=${inGameAfterEsc})`);
  } else {
    step('D4: hết lớp phủ ⇒ Esc vẫn thoát ván, lối thoát bàn phím còn nguyên');
  }
}
