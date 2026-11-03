// T45 — bằng chứng nhìn thấy được cho 3 lát cắt sửa bug, chạy trên dist/ thật.
//   A (T45D) phím vẫn ăn khi bảng chơi bị lớp phủ "Chọn Màn & Độ Khó" che:
//      bản cũ game nghe `stage.locked` nên bé bấm phím 1–4/mũi tên là NỘP ĐÁP ÁN
//      dù không nhìn thấy bảng. Lớp phủ z-50 chặn chuột, không chặn `keydown` ở window.
//   B (T45C) hết giờ học: bé tự nới thêm 10 phút mà không qua cổng ba mẹ, và ghi
//      vĩnh viễn vào cài đặt. Bản mới chỉ mở cổng ba mẹ, không đụng `dailyLimitMinutes`.
//   C (T45A) ba mẹ đặt "0 lượt/ngày" = không giới hạn, bản cũ hiểu là 5 và chặn.
// Chạy: npm run build && node qa/run-one.mjs evidence/2026-11-03-T45/probe-t45-gating.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));

const TIER_TRIGGER = 'button[title="Bấm để chọn màn hoặc tăng độ khó"]';
const TIER_CLOSE = 'button[aria-label="Đóng bảng chọn màn"]';
const FROG = 'p:has-text("Ếch đang ở số")';
const GAME_TITLE = 'Ếch Nhảy Tia Số';
const SPEND_TICK_MS = 60000;

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
    // Lỗi ném giữa chừng (selector trượt, nút bị modal che) vẫn phải trả về
    // những gì đã đo được, kèm chỗ chết — không được để runner in RUNNER_ERROR trắng.
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

  const readLimitFromStorage = () =>
    page.evaluate(
      () => JSON.parse(localStorage.getItem('kho_bau_parent_settings') || '{}').dailyLimitMinutes ?? null
    );

  await page.setViewportSize({ width: 390, height: 844 });

  // ── A: phím bị che bởi lớp phủ "Chọn Màn" ───────────────────────────────
  const titles = titlesFromGamesProbe();
  const idx = titles.indexOf(GAME_TITLE);
  if (idx < 0) {
    fail('A', `không tìm thấy "${GAME_TITLE}" trong GAME_TITLES của qa/games.mjs`);
    return finish(out);
  }
  await page.goto(`${ui.origin}/?qa`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.locator('[data-testid="nav-games"]:visible').first().click(CLICK);
  await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });
  await page.getByRole('button', { name: /Chơi ngay/ }).nth(idx).click(CLICK);
  await page.waitForTimeout(1200);
  if (await page.getByText('Bắt đầu ▶').count()) await page.getByText('Bắt đầu ▶').click(CLICK);
  await page.waitForTimeout(700);

  const frog = () => page.locator(FROG).first().innerText();
  const roundLabel = () => page.locator(TIER_TRIGGER).first().innerText();

  if ((await page.locator(FROG).count()) === 0) {
    fail('A', 'không thấy bảng ếch ("Ếch đang ở số …") — không đo được phím');
    await shot('a0-khong-co-bang');
    return finish(out);
  }

  // Mũi tên, không phải Space: Space còn kích hoạt nút đang được focus nên
  // phép thử sẽ đổi trạng thái qua đường khác, không qua `window keydown`.
  const pressHops = async (times) => {
    for (let i = 0; i < times; i += 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(180);
    }
  };

  const baseA = await frog();
  await pressHops(2);
  await page.waitForTimeout(1700); // qua hết khoảng khoá 1 400 ms nếu ếch nhảy trúng đích
  // Nhảy trúng đích = cộng XP, có thể nổ màn "Chúc mừng lên cấp" phủ lên bảng.
  await dismissLevelUpCelebration(page, CLICK, 600);
  const afterA = await frog();
  out.facts.keyboardUncovered = { before: baseA, after: afterA };
  if (baseA === afterA) {
    fail('A-control', `chưa che gì mà 2 phím mũi tên không nhúc nhích ếch ("${baseA}") — phép thử che phủ vô nghĩa`);
    await shot('a1-phim-khong-an');
    return finish(out);
  }
  step(`A1 (đối chứng): bảng không bị che, 2 phím mũi tên → "${baseA}" thành "${afterA}" (phím còn ăn)`);

  await page.locator(TIER_TRIGGER).first().click(CLICK);
  await page.waitForSelector('text=Chọn Màn & Độ Khó', { timeout: 8000 });
  const cover = await page
    .locator(FROG)
    .first()
    .evaluate((board) => {
      const r = board.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const top = document.elementFromPoint(cx, cy);
      const dialog = [...document.querySelectorAll('div')].find(
        (d) => (d.textContent || '').includes('Chọn Màn & Độ Khó') && d.className.includes('inset-0')
      );
      const dr = dialog ? dialog.getBoundingClientRect() : null;
      return {
        topTag: top ? top.tagName.toLowerCase() : null,
        topText: top ? (top.getAttribute('aria-label') || top.textContent || '').trim().slice(0, 48) : null,
        mouseBlocked: !!(top && dialog && (top === dialog || dialog.contains(top))),
        dialogRect: dr ? { w: Math.round(dr.width), h: Math.round(dr.height) } : null,
      };
    });
  out.facts.overlay = cover;
  if (!cover.mouseBlocked) {
    // Không phải lỗi tính năng: nếu chuột còn đi tới bảng thì phép thử "phím bị chặn"
    // mất nghĩa, vì bé thật cũng bấm được — phải báo để lần sau đọc đúng.
    fail('A', `lớp phủ không che bảng bằng chuột (đỉnh điểm ảnh là <${cover.topTag}> "${cover.topText}") — A3 vô nghĩa`);
    await shot('a2-lop-phu-khong-che');
    return finish(out);
  }
  step(
    `A2: lớp phủ "Chọn Màn & Độ Khó" phủ ${cover.dialogRect?.w}×${cover.dialogRect?.h} px, chuột chạm bảng bị chặn ` +
      `(đỉnh điểm ảnh giữa bảng là <${cover.topTag}>) — bản cũ phím vẫn lọt qua lớp phủ này`
  );
  await shot('a2-lop-phu-che-bang');

  const coveredBefore = await frog();
  const roundBefore = await roundLabel();
  await pressHops(4);
  const coveredAfter = await frog();
  const roundAfter = await roundLabel();
  out.facts.keyboardCovered = { before: coveredBefore, after: coveredAfter, round: [roundBefore, roundAfter] };
  if (coveredBefore !== coveredAfter || roundBefore !== roundAfter) {
    fail(
      'A',
      `đang có lớp phủ che bảng mà phím vẫn thao tác bàn chơi: ếch "${coveredBefore}" → "${coveredAfter}", ` +
        `nhãn tiến độ "${roundBefore}" → "${roundAfter}"`
    );
  } else {
    step(`A3: 4 phím mũi tên lúc bị che → bảng đứng nguyên ("${coveredAfter}", ${roundAfter}) — bé không nộp đáp án hộ được`);
  }

  await page.locator(TIER_CLOSE).first().click(CLICK);
  await page.waitForTimeout(400);
  const closedBefore = await frog();
  await pressHops(2);
  await page.waitForTimeout(1700);
  const closedAfter = await frog();
  out.facts.keyboardAfterClose = { before: closedBefore, after: closedAfter };
  if (closedBefore === closedAfter) {
    fail('A-control', `đóng lớp phủ rồi mà phím vẫn không ăn ("${closedAfter}") — A3 có thể do phím chết, không phải do lớp phủ`);
  } else {
    step(`A4 (đối chứng): đóng lớp phủ, phím lại hoạt động → "${closedBefore}" thành "${closedAfter}" (chặn là do lớp phủ)`);
  }
  await shot('a4-sau-khi-dong-lop-phu');
  await page.locator('[data-testid="game-close"]').first().click(CLICK).catch(() => {});
  await page.waitForTimeout(700);

  // ── B: hết giờ học phải qua cổng ba mẹ ──────────────────────────────────
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      'kho_bau_child_profile',
      JSON.stringify({ id: 'qa-t45', name: 'Bé QA', xp: 0, stars: 0, tickets: 8, streak: 1 })
    );
    // dailyLimitMinutes = 1 ⇒ chỉ một nhịp 60 s là quá giờ. Không cần mồi
    // minutesToday: hồ sơ mới luôn bắt đầu ở 0 phút và chính nhịp đó cộng lên 1.
    localStorage.setItem('kho_bau_parent_settings', JSON.stringify({ dailyLimitMinutes: 1 }));
  });
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  const limitBefore = await readLimitFromStorage();
  out.facts.limitBefore = limitBefore;

  const BREAK_TITLE = 'GIỜ NGHỈ NGƠI CHO MẮT SÁNG!';
  const alertOpened = await page
    .waitForSelector(`text=${BREAK_TITLE}`, { timeout: SPEND_TICK_MS + 15000 })
    .then(() => true)
    .catch(() => false);
  if (!alertOpened) {
    fail('B', 'chờ 75 s mà màn nhắc nghỉ không hiện — không đo được B');
    await shot('b0-khong-co-man-nhac');
    return finish(out);
  }
  const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  const askParent = /Nhờ ba mẹ cho học thêm/.test(bodyText);
  const selfServe = /Cho phép học thêm 10 phút/.test(bodyText);
  out.facts.modalLabels = { askParent, selfServe };
  if (!askParent) fail('B', 'màn nhắc nghỉ không còn nút "Nhờ ba mẹ cho học thêm"');
  if (selfServe) fail('B', 'màn nhắc nghỉ vẫn còn nút tự nới "Cho phép học thêm 10 phút"');
  if (askParent && !selfServe) step('B1: màn nhắc nghỉ chỉ còn đường nhờ ba mẹ, không còn nút tự cộng 10 phút');
  await shot('b1-man-nhac-nghi');

  await page.getByRole('button', { name: /Nhờ ba mẹ cho học thêm/ }).first().click(CLICK);
  const gateVisible = await page
    .waitForSelector('text=Cổng Xác Nhận Phụ Huynh', { timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  const limitAfterAsk = await readLimitFromStorage();
  out.facts.gate = { gateVisible, limitBefore, limitAfterAsk };
  if (!gateVisible) fail('B', 'bấm "Nhờ ba mẹ cho học thêm" mà cổng ba mẹ không mở');
  if (limitAfterAsk !== limitBefore) {
    fail('B', `phim nhờ ba mẹ đã ghi cài đặt: dailyLimitMinutes ${limitBefore} → ${limitAfterAsk}`);
  } else {
    step(`B2: bấm nhờ → mở "Cổng Xác Nhận Phụ Huynh", cài đặt giờ học vẫn ${limitAfterAsk} phút (không tự nới)`);
  }

  // Cổng ĐANG mở (B2 vừa bấm nhờ), nên không dùng unlockParentDashboard của qa/lib:
  // helper đó bấm nút "Ba Mẹ" — thứ giờ nằm sau lớp phủ và sẽ timeout.
  const solveOpenGate = async () => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const gate = await page.evaluate(() => {
        const el = document.querySelector('.bg-slate-100.rounded-2xl');
        return el ? el.textContent.trim() : null;
      });
      const match = gate && gate.match(/(\d+)\s*\+\s*(\d+)/);
      if (!match) throw new Error('không đọc được đề cổng ba mẹ: ' + gate);
      await page.getByRole('spinbutton').fill(String(Number(match[1]) + Number(match[2])));
      await page.getByRole('button', { name: 'Mở Bảng Phụ Huynh' }).click(CLICK);
      const closed = await page
        .waitForFunction(() => !document.body.innerText.includes('Cổng Xác Nhận Phụ Huynh'), null, { timeout: 4000 })
        .then(() => true)
        .catch(() => false);
      if (closed) return attempt;
    }
    throw new Error('cổng ba mẹ không mở sau 3 lần nộp đáp án');
  };
  await solveOpenGate();
  const limitAfterGate = await readLimitFromStorage();
  const modalGone = await page.evaluate(
    (title) => !document.body.innerText.includes(title),
    BREAK_TITLE
  );
  out.facts.afterUnlock = { limitAfterGate, modalGone };
  if (limitAfterGate !== limitBefore) {
    fail('B', `vào được bảng ba mẹ rồi mà cài đặt đổi: ${limitBefore} → ${limitAfterGate}`);
  } else {
    step(`B3: vượt cổng ba mẹ xong, dailyLimitMinutes vẫn ${limitAfterGate} — ba mẹ chưa đồng ý thì giờ học không tăng`);
  }
  await shot('b3-bang-ba-me');

  // ── C: "0 lượt/ngày" nghĩa là không giới hạn ────────────────────────────
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      'kho_bau_child_profile',
      JSON.stringify({ id: 'qa-t45b', name: 'Bé QA', xp: 0, stars: 0, tickets: 8, streak: 1 })
    );
    // rewardsEnabled phải BẬT: lát cắt này đo trần lượt gắp, không đo quỹ thưởng
    // (ba mẹ tắt thưởng thì máy dừng vì lý do khác, sẽ lẫn hai phép thử).
    localStorage.setItem(
      'kho_bau_parent_settings',
      JSON.stringify({ maxGachaPerDay: 0, rewardsEnabled: true })
    );
  });
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.locator('button:has-text("Máy Gắp")').first().click(CLICK);
  await page.waitForSelector('[data-testid="gacha-pile"]', { timeout: 20000 });
  const gachaText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  const infinityShown = /\/\s*∞\s*lượt/.test(gachaText);
  const blockedLabel = /Hết Lượt Hôm Nay/.test(gachaText);
  out.facts.gachaLabels = { infinityShown, blockedLabel };
  if (!infinityShown) fail('C', `ba mẹ đặt 0 lượt mà máy gắp không hiện "/ ∞ lượt": "${gachaText.slice(0, 160)}"`);
  if (blockedLabel) fail('C', 'đặt 0 lượt (nghĩa là không giới hạn) mà máy báo "Hết Lượt Hôm Nay!"');
  if (infinityShown && !blockedLabel) step('C1: maxGachaPerDay = 0 → máy gắp hiện "/ ∞ lượt" và nút còn bấm được');
  await shot('c1-gacha-infinity');

  let draws = 0;
  for (let i = 0; i < 6; i += 1) {
    const btn = page.locator('[data-testid="gacha-draw"]').first();
    if (!(await btn.isEnabled().catch(() => false))) break;
    await btn.click(CLICK);
    const dialog = page.locator('[role="dialog"][aria-label="Kết quả máy gắp sticker"]:visible');
    const seen = await dialog.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
    if (!seen) {
      fail('C', `lượt gắp thứ ${i + 1} không ra kết quả`);
      break;
    }
    draws += 1;
    await dismissLevelUpCelebration(page);
    await dialog.locator('button:has-text("Tuyệt Vời!"), button:has-text("Hiểu Rồi")').first().click(CLICK);
    await page.waitForTimeout(400);
  }
  const afterDraws = await page.evaluate(() => {
    const t = document.body.innerText.replace(/\s+/g, ' ');
    return {
      limitLabel: (/Hôm nay: \d+ \/ \S+ lượt/.exec(t) || [null])[0],
      tickets: JSON.parse(localStorage.getItem('kho_bau_child_profile') || '{}').tickets,
      todayDraws: JSON.parse(localStorage.getItem('kho_bau_motivation') || '{}')?.daily?.gachaDraws,
    };
  });
  out.facts.afterSixDraws = { draws, ...afterDraws };
  if (draws < 6) fail('C', `chỉ gắp được ${draws}/6 lượt với maxGachaPerDay = 0 (vé còn ${afterDraws.tickets})`);
  else step(`C2: gắp liền 6 lượt (vượt trần cũ 5) → "${afterDraws.limitLabel}", vé còn ${afterDraws.tickets}`);
  await shot('c2-sau-6-luot');

  return finish(out);
}

function finish(out) {
  out.ok = out.errors.length === 0;
  return out;
}
