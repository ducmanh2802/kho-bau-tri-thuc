// T47F — bằng chứng nhìn thấy được cho `DEF-018`: nút chơi lại **cùng một màn** không xoá
// trạng thái bảng.
//
// Bệnh cũ: `restartGame` chỉ bump `nonce` (đề mới) chứ không đổi `tier`, nên các hiệu ứng
// reset state cục bộ theo `[stage.tier]` / `[stage.tier, stage.roundIdx]` không chạy ⇒
//   A) "Xây Tháp Số Lên Mây": tháp vẫn đầy "Tầng 1 (+3)…" trong khi điểm vừa về 0;
//   B) "Đoàn Tàu Xếp Câu": từ đã ghép nằm lại trên toa của **câu mới** (và `trainDriving`
//      mà còn true thì mọi cú chạm bị nuốt — xem test t47f).
//
// C) "Bé Tập Vẽ & Tô Màu Diệu Kỳ" — hai chuyện, một trong số đó **đo ra ngược** với nghi ngờ
//    ban đầu. Nghi ngờ cũ là "tranh đã tô vẫn nguyên màu khi chơi lại" và bản **không có** bản
//    vá deps vẫn cho `coverage` về 0%: trò này là trò **duy nhất** có wrapper `onRestart` cục bộ
//    và wrapper đó gọi `clearCanvas()` theo lệnh ⇒ bảng sạch là nhờ lệnh xoá, không nhờ hiệu
//    ứng. Probe giữ nguyên phép đo (C2) làm **characterization**: nó là lý do test t47f được miễn
//    trò này khỏi bất biến `stage.nonce`, và nếu ai đó sửa wrapper mà quên `clearCanvas()` thì
//    phép đo này đỏ.
//    Defect **thật** của cùng wrapper đó: nó bỏ tham số `targetTier`, nên `stage.restartGame()`
//    tự lấy `unlockedTier` (màn khó nhất từng mở) — đường sửa `DEF-017` lọt đúng trò này ⇒
//    C1: bé đã mở Màn 3, bấm Màn 1 trong bảng chọn, bức tranh vẫn là mẫu của Màn 3.
//
// Đường chơi lại KHÔNG cần chơi xong màn: bảng "Chọn Màn & Độ Khó" gọi
// `onRestart(t)` ngay cả khi bé bấm đúng màn đang chơi (`GameModalWrapper.tsx`
// `handleSelectTier`), nên probe bấm dòng "Màn 1:" để có một ván mới y hệt.
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T47F/probe-t47f-restart-clears-board.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const TIER_TRIGGER = 'button[title="Bấm để chọn màn hoặc tăng độ khó"]';
const TIER_PANEL = 'text=Chọn Màn & Độ Khó';

/** Vị trí trò chơi theo đúng thứ tự `qa/games.mjs` — không hardcoded k cho khỏi lệch thứ tự catalogue. */
function titlesFromGamesProbe() {
  const src = fs.readFileSync(new URL('../../qa/games.mjs', import.meta.url), 'utf8');
  const block = /const GAME_TITLES = \[([\s\S]*?)\];/.exec(src);
  return [...block[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
}
const GAME_TITLES = titlesFromGamesProbe();
const GAMES = {
  tower: { title: 'Xây Tháp Số Lên Mây' },
  train: { title: 'Đoàn Tàu Xếp Câu' },
  canvas: { title: 'Bé Tập Vẽ & Tô Màu Diệu Kỳ', gameId: 'coloring_canvas' },
};

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

async function measure(page, ui, log) {
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

  /** Vào một trò chơi từ hub, bỏ màn chào "Bắt đầu ▶". `seed` dựng tiến độ giả (màn đã mở). */
  const openGame = async (game, seed) => {
    const idx = GAME_TITLES.indexOf(game.title);
    if (idx < 0) throw new Error(`không tìm thấy "${game.title}" trong GAME_TITLES của qa/games.mjs`);
    await page.goto(`${ui.origin}/?qa`);
    await page.evaluate(() => localStorage.clear());
    if (seed) {
      // Bé đã chơi tới màn `seed.unlockedTier` — bối cảnh thật của bug chọn màn dễ hơn.
      await page.evaluate(
        ([gameId, unlockedTier]) => {
          localStorage.setItem(
            'kho_bau_game_progress',
            JSON.stringify({
              version: 1,
              games: {
                [gameId]: {
                  unlockedTier,
                  starsByTier: { 1: 3, 2: 3 },
                  bestScoreByTier: { 1: 20, 2: 18 },
                  updatedAt: new Date().toISOString(),
                },
              },
              updatedAt: new Date().toISOString(),
            }),
          );
        },
        [seed.gameId, seed.unlockedTier],
      );
    }
    await page.reload();
    await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
    await page.locator('[data-testid="nav-games"]:visible').first().click(CLICK);
    await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });
    await page.getByRole('button', { name: /Chơi ngay/ }).nth(idx).click(CLICK);
    await page.waitForTimeout(1400);
    if (await page.getByText('Bắt đầu ▶').count()) await page.getByText('Bắt đầu ▶').click(CLICK);
    await page.waitForTimeout(600);
  };

  /** Bấm một dòng trong bảng "Chọn Màn & Độ Khó" — đường này gọi `onRestart(t)`. */
  const pickTierRow = async (rowName, at) => {
    await page.locator(TIER_TRIGGER).first().click({ ...CLICK, force: true });
    await page.waitForSelector(TIER_PANEL, { timeout: 10000 });
    const row = page.getByRole('button', { name: rowName }).first();
    if (!(await row.count())) {
      fail(at, `bảng chọn màn không có dòng ${rowName} để bấm`);
      return false;
    }
    await row.click(CLICK);
    await page.waitForTimeout(1000);
    await dismissLevelUpCelebration(page, CLICK, 400);
    return true;
  };

  /** Chơi lại **đúng màn đang chơi** (Màn 1) — đường làm `nonce` đổi, `tier` không đổi. */
  const replaySameTier = (at) => pickTierRow(/Màn 1:/, at);

  // ── A) Xây Tháp Số Lên Mây: tháp có bị gỡ hết khi chơi lại? ─────────────
  await openGame(GAMES.tower);

  const readEquation = async () => {
    const txt = (await page.locator('span:has-text("+")').first().innerText()).replace(/\s+/g, ' ');
    const m = /(\d+)\s*\+\s*\?\s*=\s*(\d+)/.exec(txt);
    return m ? { missing: Number(m[2]) - Number(m[1]) } : null;
  };

  let answered = 0;
  for (let i = 0; i < 3; i += 1) {
    const q = await readEquation();
    if (!q) {
      fail('A0', 'không đọc được phép tính "a + ? = b" trên bảng tháp số');
      break;
    }
    const brick = page.getByRole('button', { name: String(q.missing), exact: true }).first();
    if (!(await brick.count())) {
      fail('A0', `không thấy viên gạch số ${q.missing} trong các lựa chọn`);
      break;
    }
    await brick.click(CLICK);
    await page.waitForTimeout(1600);
    await dismissLevelUpCelebration(page, CLICK, 300);
    answered += 1;
  }
  // Đếm gạch bằng textContent đã cắt khoảng trắng: mỗi tầng là một `div` lá có dạng
  // "Tầng N (+x)"; selector của Playwright so regex trên text **chưa** chuẩn hoá nên
  // `^Tầng` không bao giờ khớp (dòng chữ nằm sau newline trong JSX).
  const towerBlocks = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('div')]
        .filter((d) => d.children.length === 0 && /^Tầng \d+ \(\+\d+\)$/.test((d.textContent || '').trim()))
        .length,
    );
  out.facts.towerAnswered = answered;
  out.facts.blocksBeforeRestart = await towerBlocks();
  await shot('a1-thap-da-xay');
  if (out.facts.blocksBeforeRestart < 1) {
    fail('A1', `chưa xây được viên gạch nào (blocks=${out.facts.blocksBeforeRestart}) ⇒ phép thử không có ý nghĩa`);
  }

  if (out.facts.blocksBeforeRestart >= 1 && (await replaySameTier('A2'))) {
    out.facts.blocksAfterRestart = await towerBlocks();
    await shot('a2-sau-choi-lai');
    if (out.facts.blocksAfterRestart !== 0) {
      fail(
        'A2',
        `chơi lại cùng màn mà tháp vẫn còn ${out.facts.blocksAfterRestart} tầng (điểm đã về 0) — ` +
          'hành vi cũ của DEF-018: reset chỉ keyed theo `stage.tier`',
      );
    } else {
      step('A2: chơi lại cùng màn ⇒ tháp về 0 tầng');
    }
  }

  // ── B) Đoàn Tàu Xếp Câu: từ đã ghép có nằm lại trên câu mới? ────────────
  await openGame(GAMES.train);
  const poolWord = page
    .locator('text=Chạm vào các từ bên dưới:')
    .locator('xpath=../div[1]/button[1]');
  if (!(await poolWord.count())) {
    fail('B1', 'không tìm thấy bảng từ để chạm trong trò Đoàn Tàu Xếp Câu');
  } else {
    await poolWord.click(CLICK);
    await page.waitForTimeout(400);
    out.facts.carsBeforeRestart = await page.locator('button[title="Chạm để gỡ từ này"]').count();
    await shot('b1-tu-da-ghep');
    if (out.facts.carsBeforeRestart !== 1) {
      fail('B1', `chạm một từ phải ghép đúng 1 toa, thực đo ${out.facts.carsBeforeRestart}`);
    }

    if (out.facts.carsBeforeRestart === 1 && (await replaySameTier('B2'))) {
      out.facts.carsAfterRestart = await page.locator('button[title="Chạm để gỡ từ này"]').count();
      await shot('b2-sau-choi-lai');
      if (out.facts.carsAfterRestart !== 0) {
        fail(
          'B2',
          `chơi lại cùng màn mà toa tàu vẫn giữ ${out.facts.carsAfterRestart} từ của ván trước — ` +
            'cùng nút nguồn với lỗi soft-lock (`trainDriving` cũng không đổi)',
        );
      } else {
        step('B2: chơi lại cùng màn ⇒ mọi toa trống, bé chạm lại được từ đầu');
      }
    }
  }

  // ── C) Bé Tập Vẽ & Tô Màu: tranh xoá bằng **lệnh**, còn bảng chọn màn thì lọt ─
  // Bối cảnh: bé đã mở tới Màn 3 (mẫu "Bông Hoa Rực Rỡ"), đang tô dở.
  await openGame(GAMES.canvas, { gameId: GAMES.canvas.gameId, unlockedTier: 3 });

  const canvas = page.locator('canvas').first();
  if (!(await canvas.count())) {
    fail('C0', 'không tìm thấy canvas trong trò tô màu');
  } else {
    const readCoverage = async () => {
      const label = await page.locator('span:text-matches("Hoàn thành tranh")').first().innerText();
      const m = /\((\d+)%\)/.exec(label.replace(/\s+/g, ' '));
      return m ? Number(m[1]) : null;
    };
    const inkPixels = () =>
      page.evaluate(() => {
        const c = document.querySelector('canvas');
        if (!c) return null;
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let ink = 0;
        for (let i = 0; i < d.length; i += 4) {
          if (Math.abs(d[i] - 255) > 12 || Math.abs(d[i + 1] - 255) > 12 || Math.abs(d[i + 2] - 255) > 12) ink += 1;
        }
        return ink;
      });
    // `subtitle` của trò nằm trong `.sr-only` ⇒ không chắc `innerText` thấy; lấy textContent
    // của cả body và bóc tên mẫu tranh — đây là chuỗi **thay đổi theo tier** rõ nhất trên màn.
    const readMissionTemplate = () =>
      page.evaluate(() => {
        const m = /màn này: "([^"]+)"/.exec(document.body.textContent || '');
        return m ? m[1] : null;
      });
    const paintStroke = async () => {
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      for (let i = 1; i <= 8; i += 1) await page.mouse.move(box.x + 20 + i * 25, box.y + 60 + i * 12);
      await page.mouse.up();
      await page.waitForTimeout(700);
    };

    out.facts.headerAtOpen = (await page.locator(TIER_TRIGGER).first().innerText()).replace(/\s+/g, ' ').trim();
    out.facts.templateAtOpen = await readMissionTemplate();
    if (!/Màn 3\//.test(out.facts.headerAtOpen) || out.facts.templateAtOpen !== 'Bông Hoa Rực Rỡ') {
      fail(
        'C0',
        `bối cảnh sai: unlockedTier=3 phải mở Màn 3 với mẫu "Bông Hoa Rực Rỡ", thực đo ` +
          `header="${out.facts.headerAtOpen}" mẫu="${out.facts.templateAtOpen}" ⇒ phép thử không có ý nghĩa`,
      );
    } else {
      step('C0: tiến độ Màn 3 ⇒ bảng mở đúng Màn 3, mẫu tranh đúng "Bông Hoa Rực Rỡ"');
    }

    // Dấu vết để biết tranh được vẽ lại vì **node canvas bị mount lại** hay vì cùng node bị
    // clear: thuộc tính gắn lên element sẽ biến mất nếu React dựng lại canvas.
    await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (c) c.dataset.t47fTag = 'before';
    });
    await paintStroke();
    out.facts.coverageBeforeReplay = await readCoverage();
    out.facts.canvasInkBeforeReplay = await inkPixels();
    await shot('c1-da-to-mau');
    if (!out.facts.coverageBeforeReplay) {
      fail('C1', `tô một nét mà coverage vẫn ${out.facts.coverageBeforeReplay}% ⇒ phép thử không có ý nghĩa`);
    }

    // C2 — **characterization của ngoại lệ**: cùng màn (Màn 3), bảng phải sạch nhờ
    // `clearCanvas()` trong wrapper `onRestart`, không nhờ deps của hiệu ứng.
    if (out.facts.coverageBeforeReplay && (await pickTierRow(/Màn 3:/, 'C2'))) {
      out.facts.canvasNodeReplaced = await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return !c || c.dataset.t47fTag !== 'before';
      });
      out.facts.coverageAfterReplay = await readCoverage();
      out.facts.canvasInkAfterReplay = await inkPixels();
      out.facts.templateAfterReplay = await readMissionTemplate();
      await shot('c2-sau-choi-lai-cung-man');
      if (out.facts.coverageAfterReplay !== 0) {
        fail(
          'C2',
          `chơi lại cùng màn mà tranh vẫn giữ ${out.facts.coverageAfterReplay}% màu cũ — lệnh ` +
            'xoá trong wrapper `onRestart` đã mất, ngoại lệ `CLEARS_ON_RESTART` của test t47f không còn đúng',
        );
      } else {
        step(
          `C2: chơi lại cùng màn ⇒ coverage về 0% (ink ${out.facts.canvasInkBeforeReplay}→` +
            `${out.facts.canvasInkAfterReplay}, node canvas thay thế=${out.facts.canvasNodeReplaced}) ` +
            '— tranh sạch theo LỆNH, không cần stage.nonce',
        );
      }
    }

    // C3 — defect thật của cùng wrapper: **bỏ `targetTier`** ⇒ `stage.restartGame()` lấy
    // `unlockedTier` (3), bé bấm Màn 1 vẫn ở Màn 3. Đây là đường `DEF-017` lọt trò này.
    await paintStroke();
    out.facts.coverageBeforePickEasier = await readCoverage();
    if (out.facts.coverageBeforePickEasier && (await pickTierRow(/Màn 1:/, 'C3'))) {
      out.facts.templateAfterPickEasier = await readMissionTemplate();
      out.facts.coverageAfterPickEasier = await readCoverage();
      await shot('c3-sau-khi-chon-man-1');
      if (out.facts.templateAfterPickEasier !== 'Ngôi Nhà Thân Thương') {
        fail(
          'C3',
          `bé đã mở Màn 3 rồi bấm Màn 1 mà tranh vẫn là "${out.facts.templateAfterPickEasier}" — ` +
            'wrapper `onRestart` bỏ tham số `targetTier` (DEF-017 lọt lại trên trò này)',
        );
      } else {
        step('C3: bấm Màn 1 từ Màn 3 ⇒ mẫu tranh đúng về "Ngôi Nhà Thân Thương" của Màn 1');
      }
    }
  }
}
