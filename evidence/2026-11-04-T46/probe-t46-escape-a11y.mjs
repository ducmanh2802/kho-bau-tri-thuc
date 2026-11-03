// T46 — bằng chứng nhìn thấy được cho ba defect còn lại của đợt săn bug, chạy trên dist/ thật.
//   A (DEF-013) Esc khi lớp phủ "Chọn Màn & Độ Khó" đang che bảng: bản cũ thoát luôn trò
//     chơi vì `useModalHistory` nghe keydown trên `window` — ngoài cây DOM của lớp phủ.
//     Bản mới Esc lồng nhau: lần một tắt bảng chọn màn, lần hai mới ra khỏi game.
//   B (DEF-012) nút loa của "Đôi Tai Thính — Nghe & Chọn" là icon-only, không `aria-label`
//     lẫn `title` ⇒ trình đọc màn hình chỉ nói "nút".
//   C (DEF-010) Header chỉ nói MỘT chuỗi, và bản cũ chọn "Bé học đều lắm, giỏi quá!" whenever
//     streak > 0 ⇒ câu chào theo giờ biến mất với mọi bé quay lại lần hai.
// Chạy: npm run build && node qa/run-one.mjs evidence/2026-11-04-T46/probe-t46-escape-a11y.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));

const TIER_TRIGGER = 'button[title="Bấm để chọn màn hoặc tăng độ khó"]';
const TIER_PANEL = 'text=Chọn Màn & Độ Khó';
const TIER_CLOSE = 'button[aria-label="Đóng bảng chọn màn"]';
const FROG = 'p:has-text("Ếch đang ở số")';
const GAME_TITLE_FROG = 'Ếch Nhảy Tia Số';
const GAME_TITLE_EARS = 'Đôi Tai Thính — Nghe & Chọn';
const STREAK_PRAISE = 'Bé học đều lắm, giỏi quá!';

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

  // C cần thấy lờiพูด mà Header gọi: gắn móc vào speechSynthesis TRƯỚC khi app boot.
  await page.addInitScript(() => {
    window.__kbtSpoken = [];
    try {
      if (!('speechSynthesis' in window)) return;
      const orig = window.speechSynthesis.speak.bind(window.speechSynthesis);
      window.speechSynthesis.speak = (u) => {
        try {
          window.__kbtSpoken.push(String(u && u.text ? u.text : ''));
        } catch {
          /* bỏ qua: chỉ để đo */
        }
        // Không phát tiếng thật trong headless — giữ API sống để app không lỗi.
      };
    } catch {
      /* trình duyệt không cho ghi đè thì C sẽ tự báo không đo được */
    }
  });

  const openGame = async (title) => {
    const titles = titlesFromGamesProbe();
    const idx = titles.indexOf(title);
    if (idx < 0) throw new Error(`không tìm thấy "${title}" trong GAME_TITLES của qa/games.mjs`);
    await page.locator('[data-testid="nav-games"]:visible').first().click(CLICK);
    await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });
    await page.getByRole('button', { name: /Chơi ngay/ }).nth(idx).click(CLICK);
    await page.waitForTimeout(1200);
    if (await page.getByText('Bắt đầu ▶').count()) await page.getByText('Bắt đầu ▶').click(CLICK);
    await page.waitForTimeout(700);
  };

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${ui.origin}/?qa`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });

  // ── A: Esc phải đóng lớp phủ trước, không xoá ván ───────────────────────
  await openGame(GAME_TITLE_FROG);
  if ((await page.locator(FROG).count()) === 0) {
    fail('A', 'không mở được bảng ếch — không đo được Esc');
    await shot('a0-khong-mo-duoc-game');
    return finish(out);
  }

  await page.locator(TIER_TRIGGER).first().click(CLICK);
  await page.waitForSelector(TIER_PANEL, { timeout: 8000 });
  await dismissLevelUpCelebration(page, CLICK, 400);
  await shot('a1-lop-phu-dang-mo');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const overlayAfterEsc1 = await page.locator(TIER_PANEL).count();
  const boardAfterEsc1 = await page.locator(FROG).count();
  out.facts.esc1 = { overlayAfterEsc1, boardAfterEsc1 };
  if (overlayAfterEsc1 !== 0) {
    fail('A', `Esc lần một không đóng lớp phủ (còn ${overlayAfterEsc1} khối "Chọn Màn & Độ Khó")`);
  } else if (boardAfterEsc1 === 0) {
    fail('A', 'Esc lần một đóng lớp phủ NHƯNG cũng thoát luôn trò chơi — hành vi cũ của DEF-013');
  } else {
    step('A1: lớp phủ đang mở ⇒ Esc lần một TẮT bảng chọn màn, ván chơi còn nguyên (bảng ếch vẫn có)');
  }
  await shot('a2-sau-esc-lan-mot');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  const boardAfterEsc2 = await page.locator(FROG).count();
  out.facts.esc2 = { boardAfterEsc2 };
  if (boardAfterEsc2 !== 0) {
    fail('A-control', `Esc lần hai (không còn lớp phủ) vẫn không thoát game — phím bị nuốt, bé kẹt lại`);
  } else {
    step('A2 (đối chứng): không còn lớp phủ ⇒ Esc lần hai thoát game bình thường (entry history còn nguyên)');
  }

  // A3: trạng thái lớp phủ phải ĐỌC LIVE, không bắt một lần lúc mount.
  await openGame(GAME_TITLE_FROG);
  await page.locator(TIER_TRIGGER).first().click(CLICK);
  await page.waitForSelector(TIER_PANEL, { timeout: 8000 });
  await page.locator(TIER_CLOSE).first().click(CLICK);
  await page.waitForTimeout(500);
  const closedByX = await page.locator(TIER_PANEL).count();
  await page.locator(TIER_TRIGGER).first().click(CLICK);
  await page.waitForSelector(TIER_PANEL, { timeout: 8000 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const overlayAfterReopen = await page.locator(TIER_PANEL).count();
  const boardAfterReopen = await page.locator(FROG).count();
  out.facts.reopen = { closedByX, overlayAfterReopen, boardAfterReopen };
  if (closedByX !== 0) {
    fail('A3', `nút "Đóng bảng chọn màn" không đóng được lớp phủ (còn ${closedByX})`);
  } else if (overlayAfterReopen !== 0 || boardAfterReopen === 0) {
    fail('A3', `đóng bằng X rồi mở lại, Esc không còn đúng (lớp phủ ${overlayAfterReopen}, bảng ếch ${boardAfterReopen}) — trạng thái bị bắt một lần`);
  } else {
    step('A3: mở ⇒ đóng bằng X ⇒ mở lại ⇒ Esc vẫn chỉ tắt lớp phủ (đọc trạng thái live, ván còn nguyên)');
  }
  await shot('a3-sau-mo-lai-dong-bang-esc');

  // ── B: nút loa phải có tên truy cập được ────────────────────────────────
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await openGame(GAME_TITLE_EARS);
  const byName = await page.getByRole('button', { name: 'Nghe lại đề' }).count();
  out.facts.speakerByName = byName;
  if (byName === 0) {
    fail('B', 'không tìm thấy nút theo tên "Nghe lại đề" — trình đọc màn hình vẫn chỉ nói "nút"');
  } else {
    step(`B1: query getByRole(button, name="Nghe lại đề") trả ${byName} kết quả — nút loa đã có tên`);
  }

  const liveUnnamed = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { noDialog: true, offenders: [] };
    const offenders = [...dialog.querySelectorAll('button')]
      .map((b) => {
        const text = (b.textContent || '').trim();
        const named = (b.getAttribute('aria-label') || b.getAttribute('title') || text).trim();
        const iconOnly = !!b.querySelector('svg') && text === '';
        return { iconOnly, named, label: b.getAttribute('aria-label') || null, cls: (b.className || '').slice(0, 48) };
      })
      .filter((x) => x.iconOnly && !x.named);
    return { noDialog: false, offenders };
  });
  out.facts.liveUnnamed = liveUnnamed;
  if (liveUnnamed.noDialog) {
    fail('B', 'không thấy [role="dialog"] của trò chơi — quét nút vô danh không có nghĩa');
  } else if (liveUnnamed.offenders.length > 0) {
    fail('B', `còn ${liveUnnamed.offenders.length} nút icon-only không tên trong DOM: ${JSON.stringify(liveUnnamed.offenders).slice(0, 300)}`);
  } else {
    step('B2: quét DOM thật của [role="dialog"] — không còn nút icon-only nào thiếu aria-label/title');
  }
  await shot('b1-nut-loa-co-ten');

  // B3 (đối chứng): bấm đúng nút đó thì loa nói lại được (không phải nút chết sau khi thêm label).
  // Nút có `animate-pulse-subtle` chạy vô hạn ⇒ Playwright báo "not stable", phải force click.
  const before = await page.evaluate(() => (window.__kbtSpoken || []).length);
  let clicked = true;
  try {
    await page.getByRole('button', { name: 'Nghe lại đề' }).first().click({ timeout: 15000, force: true });
  } catch (e) {
    clicked = false;
    out.facts.speakerClickError = String(e && e.message ? e.message : e).slice(0, 200);
  }
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => (window.__kbtSpoken || []).length);
  out.facts.speakerClick = { before, after, clicked };
  if (!clicked) {
    fail('B-control', 'không bấm được nút "Nghe lại đề" (kể cả force) — không đo được lối nghe lại');
  } else if (after <= before) {
    fail('B-control', `bấm "Nghe lại đề" không phát lời nào (${before} → ${after}) — tên mới nhưng nút hỏng`);
  } else {
    step(`B3 (đối chứng): bấm nút đó tạo ${after - before} lời đọc — có tên mà vẫn là lối nghe lại thật`);
  }
  await page.locator('[data-testid="game-close"]').first().click(CLICK).catch(() => {});
  await page.waitForTimeout(700);

  // ── C: câu chào theo giờ không bị lời khen streak đè ────────────────────
  const expectedGreeting = await page.evaluate(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return 'Chào buổi sáng, bé ơi!';
    if (h >= 11 && h < 18) return 'Chào buổi chiều, bé làm tốt lắm!';
    return 'Tối rồi, bé nhớ ngủ sớm nhé!';
  });
  out.facts.hour = await page.evaluate(() => new Date().getHours());
  out.facts.expectedGreeting = expectedGreeting;

  await page.evaluate(
    ([praise]) => {
      localStorage.clear();
      localStorage.setItem(
        'kho_bau_child_profile',
        JSON.stringify({ id: 'qa-t46', name: 'Bé QA', xp: 120, stars: 3, tickets: 2, streak: 4, completedLessons: [], wrongAnswerBook: [] })
      );
      void praise;
    },
    [STREAK_PRAISE]
  );
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.waitForTimeout(1500);
  const spoken = await page.evaluate(() => (window.__kbtSpoken || []).slice(0));
  const greetings = spoken.filter((s) => /Chào buổi|Tối rồi/.test(s));
  out.facts.spoken = spoken.slice(0, 6);
  out.facts.greetings = greetings;
  const hasSpeech = await page.evaluate(() => 'speechSynthesis' in window);
  out.facts.hasSpeech = hasSpeech;
  if (!hasSpeech) {
    fail('C', 'không có speechSynthesis — không đo được lời chào');
  } else if (greetings.length === 0) {
    fail('C', `Header không nói lời chào nào (${JSON.stringify(spoken).slice(0, 240)}) — móc đo lời nói hỏng hoặc greeting bị chặn`);
  } else {
    const greet = greetings[0];
    const startsWithGreeting = greet.startsWith(expectedGreeting);
    const hasPraise = greet.includes(STREAK_PRAISE);
    out.facts.firstGreeting = greet;
    if (!startsWithGreeting) {
      fail('C', `lời chào không mở đầu bằng "${expectedGreeting}" mà là "${greet}" — bản cũ chỉ nói lời khen streak`);
    } else if (!hasPraise) {
      fail('C', `bé có streak=4 mà lời nói "${greet}" không kèm lời khen streak`);
    } else {
      step(`C1: streak=4 ⇒ Header nói "${greet}" — câu chào theo giờ còn nguyên, lời khen là phụ`);
    }
  }
  await shot('c1-loi-chao-header');

  return finish(out);
}

function finish(o) {
  o.ok = o.errors.length === 0;
  return o;
}
