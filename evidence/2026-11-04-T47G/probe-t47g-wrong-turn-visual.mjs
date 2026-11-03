// T47G — bằng chứng **nhìn thấy được** cho `DEF-018(b)`: lượt sai phải có phản hồi HÌNH,
// không chỉ tiếng bíp (`AGENTS.md` §3 "mọi lượt đúng/sai có phản hồi âm thanh + hình ảnh").
//
// Bệnh đo được: 30 file trong `src/components/games/` bật `sound.playWrong()` khi bé bấm sai,
// nhưng chỉ 16 file gọi `reportWrong()` của `useGameContext` — mascot + bóng chữ lời khen
// sống trong `showFeedback()` của `GameModalWrapper` và wrapper chỉ biết lượt sai khi bảng
// chơi *báo về*. 14 trò còn lại (bảng chơi nằm ngoài subtree của wrapper) bé chỉ **nghe**
// "tít". Hai trò dưới đây thuộc nhóm chín trò không có một thay đổi nào trên màn hình.
//
// Cách đo: đọc phép tính ngay trên bảng ⇒ biết đáp án đúng ⇒ bấm được một phương án SAI
// chắc chắn sai, không cần `?qa` hook trong hai trò này.
//   A) Xây Tháp Số Lên Mây · B) Câu Cá Đại Dương Xanh, mỗi trò bốn bước:
//      1. mở màn: chưa có lời khuyến khích (hiệu ứng không được bắn ở lần render đầu);
//      2. chạm phương án ĐÚNG: vẫn không có bóng chữ — chứng minh hiệu ứng keyed theo
//         **bộ đếm lượt sai tăng lên**, không phải theo "mọi cú chạm" (characterization:
//         hai trò này thưởng lượt đúng bằng gạch/thả câu, không bằng toast);
//      3. chạm phương án SAI: `[data-testid="praise-toast"]` hiện + `[data-testid="mascot-reaction"]`
//         đổi khỏi emoji mặc định của trò;
//      4. sau 2,8 s: bóng chữ tự tắt và mascot về lại mặc định (`showFeedback` hẹn giờ
//         1500 ms / 2500 ms), để lỗi không "dán" vào cả màn.
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T47G/probe-t47g-wrong-turn-visual.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const TOAST = '[data-testid="praise-toast"]';
const MASCOT = '[data-testid="mascot-reaction"]';

/** Thứ tự trò chơi lấy từ `qa/games.mjs` — không hardcoded `nth` để khỏi lệch catalogue. */
function titlesFromGamesProbe() {
  const src = fs.readFileSync(new URL('../../qa/games.mjs', import.meta.url), 'utf8');
  const block = /const GAME_TITLES = \[([\s\S]*?)\];/.exec(src);
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}
const GAME_TITLES = titlesFromGamesProbe();

const GAMES = {
  tower: {
    id: 'number_tower',
    title: 'Xây Tháp Số Lên Mây',
    mascot: '🏰',
    // Bảng tháp vẽ "{part1} + ? = {total}"; banner hướng dẫn ghi cùng một đề.
    equation: /(\d+)\s*\+\s*\?\s*=\s*(\d+)/,
    answer: (m) => Number(m[2]) - Number(m[1]),
    // Viên gạch là nút chỉ chứa một con số. Header của wrapper (có nút chọn màn,
    // nút loa) nằm **ngoài** `<main>` ⇒ không lẫn.
    optionSelector: 'main button',
    optionFilter: /^\d+$/,
  },
  fishing: {
    id: 'ocean_fishing',
    title: 'Câu Cá Đại Dương Xanh',
    mascot: '🎣',
    equation: /(\d+)\s*-\s*(\d+)\s*=\s*\?/,
    answer: (m) => Number(m[1]) - Number(m[2]),
    // Nút cá gồm emoji + nhãn "Số N" + dòng "Chạm để câu": khớp theo dòng hướng dẫn
    // chạm rồi bóc con số, thay vì anchor cả chuỗi (nội dung nút không bắt đầu bằng "Số").
    optionSelector: 'main button:has-text("Chạm để câu")',
    optionFilter: /Số (\d+)/,
  },
};

const out = { steps: [], errors: [], facts: {}, failedAt: null, shots: [] };

let boundPage = null;

/** Đọc đề ngay trên màn chơi ⇒ biết đáp án đúng ⇒ bấm được phương án SAI chắc chắn sai. */
async function readTarget(game) {
  const text = await boundPage.evaluate(() => document.body.textContent || '');
  const m = game.equation.exec(text.replace(/\s+/g, ' '));
  return m ? game.answer(m) : null;
}

export default async function run(page, ui) {
  boundPage = page;
  try {
    await measure(page, ui);
  } catch (e) {
    out.errors.push(`EXCEPTION: ${e && e.message ? String(e.message).slice(0, 900) : String(e)}`);
    if (!out.failedAt) out.failedAt = out.steps.length ? out.steps[out.steps.length - 1] : 'start';
  }
  out.ok = out.errors.length === 0;
  return out;
}

async function measure(page, ui) {
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

  await page.setViewportSize({ width: 390, height: 844 });

  const toast = page.locator(TOAST);
  const mascot = page.locator(MASCOT).first();

  const openGame = async (game) => {
    const idx = GAME_TITLES.indexOf(game.title);
    if (idx < 0) throw new Error(`không tìm thấy "${game.title}" trong GAME_TITLES của qa/games.mjs`);
    await page.goto(`${ui.origin}/?qa`);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
    await page.locator('[data-testid="nav-games"]:visible').first().click(CLICK);
    await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });
    await page.getByRole('button', { name: /Chơi ngay/ }).nth(idx).click(CLICK);
    await page.waitForTimeout(1400);
    if (await page.getByText('Bắt đầu ▶').count()) await page.getByText('Bắt đầu ▶').click(CLICK);
    await page.waitForTimeout(600);
  };

  /** Phương án đúng + một phương án sai của vòng hiện tại, chọn từ chính đề bài trên màn. */
  const pickOptions = async (game) => {
    const target = await readTarget(game);
    if (target === null) return null;
    const buttons = page.locator(game.optionSelector).filter({ hasText: game.optionFilter });
    const count = await buttons.count();
    const values = [];
    for (let i = 0; i < count; i += 1) {
      const raw = (await buttons.nth(i).innerText()).replace(/\s+/g, ' ').trim();
      const m = game.optionFilter.exec(raw);
      const n = m ? Number(m[1] !== undefined ? m[1] : m[0]) : NaN;
      if (!Number.isNaN(n)) values.push({ n, button: buttons.nth(i) });
    }
    // Một phương án hiển thị con số ĐÚNG là điều kiện để phép thử có ý nghĩa; nếu đề và
    // lựa chọn lệch nhau thì báo "bối cảnh sai" thay vì để probe đỏ vì thiếu nút.
    const right = values.find((v) => v.n === target);
    const wrong = values.find((v) => v.n !== target);
    return right && wrong ? { right, wrong, target, total: values.length } : null;
  };

  const runGame = async (game, key) => {
    await openGame(game);

    // 1) Mở màn: chưa có lượt sai nào ⇒ không được có bóng chữ khuyến khích.
    out.facts[`${key}.toastAtOpen`] = await toast.isVisible().catch(() => false);
    out.facts[`${key}.mascotAtOpen`] = (await mascot.innerText().catch(() => '')).trim();
    if (out.facts[`${key}.toastAtOpen`]) {
      fail(
        `${key}1`,
        `vừa mở màn đã có ${TOAST} — hiệu ứng mistakes phải chỉ chạy khi bộ đếm TĂNG, ` +
          'nếu không mỗi lần vào màn là một lần "cố lên" vô nghĩa',
      );
    }
    if (out.facts[`${key}.mascotAtOpen`] !== game.mascot) {
      fail(
        `${key}1`,
        `mascot khi mở màn là "${out.facts[`${key}.mascotAtOpen`]}", phải là emoji mặc định ` +
          `"${game.mascot}" của ${game.title}`,
      );
      return;
    }

    const turn1 = await pickOptions(game);
    if (!turn1) {
      fail(`${key}1`, 'không đọc được đề + phương án đúng/sai trên màn ⇒ phép thử không có ý nghĩa');
      return;
    }

    // 2) Lượt ĐÚNG: bộ đếm lượt sai không đổi ⇒ đường phản hồi mới phải im lặng.
    await turn1.right.button.click(CLICK);
    await page.waitForTimeout(700);
    out.facts[`${key}.toastAfterCorrect`] = await toast.isVisible().catch(() => false);
    await shot(`${key}-correct`);
    if (out.facts[`${key}.toastAfterCorrect`]) {
      fail(
        `${key}2`,
        'bấm ĐÚNG mà bóng chữ khuyến khích hiện ⇒ hiệu ứng đã bị gắn vào mọi cú chạm chứ không ' +
          'phải vào bộ đếm lượt sai',
      );
    } else {
      step(`${key}2: lượt đúng không bật bóng chữ "cố lên" ⇒ phản hồi mới gắn với bộ đếm lượt sai, không gắn với mọi cú chạm`);
    }
    // chờ bảng sang vòng mới rồi hãy bấm tiếp — `submitCorrect` khoá bảng trong `advanceDelayMs`
    await page.waitForTimeout(1400);
    await dismissLevelUpCelebration(page, CLICK, 400);

    // 3) Lượt SAI: phải thấy **chữ** và **mascot**, không chỉ nghe bíp.
    const turn2 = await pickOptions(game);
    if (!turn2) {
      fail(`${key}3`, 'vòng thứ hai không đọc được phương án đúng/sai ⇒ phép thử không có ý nghĩa');
      return;
    }
    await turn2.wrong.button.click(CLICK);
    try {
      await toast.waitFor({ state: 'visible', timeout: 1200 });
    } catch {
      fail(
        `${key}3`,
        `bé bấm sai (đáp án ${turn2.wrong.n} ≠ ${turn2.target}) mà sau 1,2 s không có ` +
          'phản hồi hình nào trên màn — đây chính là DEF-018(b): chỉ có sound.playWrong()',
      );
      await shot(`${key}-wrong-no-visual`);
      return;
    }
    const praise = (await toast.innerText()).replace(/\s+/g, ' ').trim();
    const mascotAfter = (await mascot.innerText()).trim();
    out.facts[`${key}.praiseText`] = praise;
    out.facts[`${key}.mascotAfterWrong`] = mascotAfter;
    await shot(`${key}-wrong-visual`);
    if (praise.length < 4) {
      fail(`${key}3`, `bóng chữ hiện nhưng rỗng ("${praise}") — bé không đọc được lời nào`);
    }
    if (mascotAfter === game.mascot) {
      fail(
        `${key}3`,
        `mascot vẫn là "${mascotAfter}" sau lượt sai ⇒ chỉ có bóng chữ, thiếu phản hồi của linh vật`,
      );
    }
    if (!out.failedAt) step(`${key}3: lượt sai ⇒ mascot "${game.mascot}"→"${mascotAfter}" + bóng chữ "${praise}"`);

    // 4) Phản hồi phải TỰ TẮT, không dán cả màn.
    await page.waitForTimeout(2800);
    out.facts[`${key}.toastAfterClear`] = await toast.isVisible().catch(() => false);
    out.facts[`${key}.mascotAfterClear`] = (await mascot.innerText()).trim();
    if (out.facts[`${key}.toastAfterClear`]) {
      fail(`${key}4`, `sau 2,8 s bóng chữ vẫn còn (hẹn giờ 2500 ms đã mất?)`);
    }
    if (out.facts[`${key}.mascotAfterClear`] !== game.mascot) {
      fail(
        `${key}4`,
        `sau 2,8 s mascot vẫn là "${out.facts[`${key}.mascotAfterClear`]}" (hẹn giờ 1500 ms đã mất?)`,
      );
    }
    if (!out.failedAt) step(`${key}4: sau 2,8 s bóng chữ tắt, mascot về "${game.mascot}"`);
  };

  await runGame(GAMES.tower, 'A');
  await runGame(GAMES.fishing, 'B');
}
