/**
 * T44D + T44E — bằng chứng **nhìn thấy được** (AGENTS.md §1.3: "Sửa UI/trò chơi
 * phải có bằng chứng nhìn thấy được. Typecheck xanh ≠ tính năng đúng").
 *
 * `tests/t44d-tap-targets.test.ts` và `tests/t44e-wrong-answer-feedback.test.ts`
 * chỉ là ràng buộc **mã nguồn**: chúng đọc chuỗi class và không đảm bảo lớp phủ
 * CSS, `flex-wrap` hay animation của `KidButton` không làm hộp chạm thật co lại.
 * Probe này đo `getBoundingClientRect()` của chính các control đã sửa trên bản
 * build production ở 375×812, và đo luôn cả hai kênh phản hồi của một lượt bị
 * chặn: chữ (`[data-testid="subject-hint"]`) lẫn lời nói (bọc
 * `speechSynthesis.speak` để bắt đúng văn bản được đọc).
 *
 * Đặt ngoài `qa/` vì `qa/*.mjs` được đếm là probe trong `docs/plan/TEST_PLAN.md`
 * §6 — helper rơi vào đó sẽ làm số probe tăng thật.
 *
 * Chạy:
 *   npm run build
 *   node qa/run-one.mjs evidence/2026-11-03-T44/probe-t44-tap.mjs
 *   PORT=4179 node qa/run-one.mjs evidence/2026-11-03-T44/probe-t44-tap.mjs   # khi 4173 bận
 */

const CLICK = { timeout: 12000 };
const VIEWPORT = { width: 375, height: 812 };
const MIN_TAP = 44;

/** Control đã sửa trong T44D, chọn theo class để không phụ thuộc text hiển thị. */
const GAMES = [
  {
    title: 'Nối Số Tô Màu',
    controls: [{ label: 'chấm nối số', selector: '[data-testid="connect-dot"]' }],
  },
  {
    title: 'Bé Tập Vẽ & Tô Màu Diệu Kỳ',
    controls: [
      { label: 'ô màu bảng palette', selector: 'button[class*="w-11 h-11 rounded-full"]' },
      { label: 'con dấu (stamp)', selector: 'button[class*="w-11 h-11 rounded-lg"]' },
    ],
  },
  {
    title: 'Xưởng Ghép Tiếng Lớp 1',
    controls: [{ label: 'hàng thanh điệu', selector: 'button[class*="min-h-[44px]"]' }],
  },
];

async function measure(page, selector) {
  return page.evaluate(
    ({ selector, min }) => {
      const els = Array.from(document.querySelectorAll(selector));
      const boxes = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 && r.height > 0 };
      });
      const shown = boxes.filter((b) => b.visible);
      const small = shown.filter((b) => b.w < min || b.h < min).map((b) => `${b.w}x${b.h}`);
      return {
        count: shown.length,
        hidden: boxes.length - shown.length,
        minW: shown.length ? Math.min(...shown.map((b) => b.w)) : null,
        minH: shown.length ? Math.min(...shown.map((b) => b.h)) : null,
        small,
      };
    },
    { selector, min: MIN_TAP }
  );
}

/**
 * Mở đúng một trò chơi: thẻ game là `KidCard`, tựa đề nằm trong `<h3>`, nút
 * "Chơi ngay" ở cuối thẻ. Duyệt **ngược từ h3** và khớp tựa đề chính xác — tìm
 * theo "Chơi ngay" rồi xét tổ tiên thì tổ tiên cao nhất chứa mọi tựa nên luôn
 * trả về thẻ đầu tiên (chính là lỗi probe này vấp phải lần chạy đầu).
 */
async function openGameByTitle(page, title) {
  const opened = await page.evaluate((wanted) => {
    const heading = Array.from(document.querySelectorAll('h3')).find((el) => el.textContent.trim() === wanted);
    if (!heading) return false;
    let node = heading.parentElement;
    for (let depth = 0; depth < 8 && node; depth += 1) {
      const btn = Array.from(node.querySelectorAll('button')).find((b) => /Chơi ngay/.test(b.textContent || ''));
      if (btn) {
        btn.click();
        return true;
      }
      node = node.parentElement;
    }
    return false;
  }, title);
  if (!opened) throw new Error(`không mở được "${title}" — thẻ game hoặc nút "Chơi ngay" không tìm thấy`);
  await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
  await page.waitForTimeout(1200);
}

/** Bọc `speechSynthesis.speak` để chứng minh lời giải thích thật sự tới kênh tiếng. */
async function armSpeechCapture(page) {
  await page.evaluate(() => {
    window.__spoken = [];
    const ss = window.speechSynthesis;
    if (!ss || ss.__t44Armed) return;
    // `__t44Armed`: probe gọi hàm này nhiều lần trong một trang. Bọc chồng lên
    // lớp đã bọc thì một cú `speak` thật bị ghi hai lần ⇒ đọc nhầm thành "app
    // nói lặp".
    ss.__t44Armed = true;
    const original = ss.speak.bind(ss);
    ss.speak = (utterance) => {
      window.__spoken.push(String(utterance && utterance.text ? utterance.text : ''));
      try {
        return original(utterance);
      } catch {
        return undefined;
      }
    };
  });
}

async function readSpoken(page) {
  return page.evaluate(() => (Array.isArray(window.__spoken) ? window.__spoken.slice(-3) : []));
}

/**
 * Bấm một phần tử bị khoá rồi đòi cả chữ lẫn tiếng; trả về bản ghi cho JSON output.
 *
 * Thử **chuột thật** trước (`page.mouse.click` vào tâm hộp) vì đó đúng là những
 * gì ngón tay bé làm, và `locator.click()` từ chối phần tử `aria-disabled`
 * ("element is not enabled") — ràng buộc của harness, không phải của trình
 * duyệt. Nếu chuột thật không sinh phản hồi, probe ghi lại *phần tử nào nằm ở
 * điểm chạm đó* rồi bật sang bàn phím đúng như `openFirstLesson` vẫn làm.
 */
async function activateNode(page, node, hint) {
  // Bản đồ chủ đề cuộn dọc: phần tử cuối đường thường nằm ngoài viewport, và
  // `elementFromPoint` ở đó trả `null` chứ không phải "bị chặn" — phải cuộn vào
  // trước khi đo cú chạm.
  await node.scrollIntoViewIfNeeded();
  const box = await node.boundingBox();
  if (!box) throw new Error('nút bị khoá không có hộp render');
  await page.mouse.click(Math.round(box.x + box.width / 2), Math.round(box.y + box.height / 2));
  try {
    await hint.waitFor({ state: 'visible', timeout: 2500 });
    return { activation: 'mouse', clickError: null };
  } catch (e) {
    const hit = await page.evaluate(
      ({ x, y }) => {
        const el = document.elementFromPoint(x, y);
        if (!el) return null;
        return {
          tag: el.tagName.toLowerCase(),
          testid: el.getAttribute('data-testid'),
          label: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 46),
        };
      },
      { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) }
    );
    const clickError = `chuột thật vào tâm hộp ${Math.round(box.width)}x${Math.round(box.height)} không sinh phản hồi; ` +
      `phần tử nhận chạm = ${JSON.stringify(hit)}; ${String(e.message).split('\n')[0]}`;
    await node.focus();
    await page.keyboard.press('Enter');
    await hint.waitFor({ state: 'visible', timeout: 8000 });
    return { activation: 'keyboard', clickError };
  }
}

async function probeBlockedTap(page, label, selector, expectText) {
  const node = page.locator(selector).first();
  if (!(await node.count())) throw new Error(`${label}: không tìm thấy "${selector}"`);
  await armSpeechCapture(page);
  const hint = page.locator('[data-testid="subject-hint"]');
  // Bản tin 5 giây của cú bấm **trước** mà còn treo thì `waitFor(visible)` sẽ
  // cho điểm oan cú bấm này — phải chờ nó tự rút hẳn rồi mới đo.
  await hint.waitFor({ state: 'detached', timeout: 9000 });
  const { activation, clickError } = await activateNode(page, node, hint);
  const text = (await hint.innerText()).trim();
  const box = await hint.boundingBox();
  const spoken = await readSpoken(page);
  const record = {
    case: label,
    activation,
    clickError,
    hintVisible: true,
    hintText: text,
    hintBox: box ? { w: Math.round(box.width), h: Math.round(box.height) } : null,
    spoken,
  };
  if (!text.includes(expectText)) {
    throw new Error(`${label}: chữ trên màn không nói lý do mong đợi "${expectText}" — nhận được "${text}"`);
  }
  if (!spoken.some((s) => s.includes(expectText))) {
    throw new Error(`${label}: lời nói không phát qua speechSynthesis — spoken=${JSON.stringify(spoken)}`);
  }
  return record;
}

export default async function run(page) {
  let stage = 'boot';
  const out = { viewport: `${VIEWPORT.width}x${VIEWPORT.height}`, tap: [], blocked: [], errors: [], ok: false };

  try {
    await page.setViewportSize(VIEWPORT);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });

    // ── T44E: bản đồ chủ đề — bài khoá và rương khoá phải TỰ GIẢI THÍCH ───────
    stage = 'subject-map';
    await page.getByRole('button', { name: /Toán Học/ }).first().click(CLICK);
    await page.waitForSelector('text=Thành Phố Toán Học Lớp 1', { timeout: 20000 });

    out.blocked.push(
      await probeBlockedTap(
        page,
        'bài bị khoá',
        '[data-testid^="lesson-button-"][aria-label*="bị khoá"]',
        'vẫn còn khoá'
      )
    );
    out.blocked.push(
      await probeBlockedTap(
        page,
        'rương chưa đủ bài',
        '[data-testid^="topic-chest-"][aria-label*="chưa đủ điều kiện"]',
        'chưa học hết các bài'
      )
    );
    await page.screenshot({ path: 'evidence/2026-11-03-T44/img/subject-hint-375.png' });

    // ── T44D: kích cỡ hộp chạm thật của các control đã sửa ───────────────────
    await page.goto(new URL('/', page.url()).href);
    await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
    stage = 'games-hub';
    await page.locator('[data-testid="nav-games"]:visible').first().click(CLICK);
    await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });

    for (const game of GAMES) {
      const record = { screen: game.title };
      stage = `game:${game.title}`;
      await openGameByTitle(page, game.title);
      record.closeButton = await measure(page, '[role="dialog"] [data-testid="game-close"]');
      for (const control of game.controls) {
        record[control.label] = await measure(page, `[role="dialog"] ${control.selector}`);
      }
      out.tap.push(record);
      if (game.title === 'Nối Số Tô Màu') {
        await page.screenshot({ path: 'evidence/2026-11-03-T44/img/connect-dots-375.png' });
      }
      await page.getByRole('button', { name: 'Đóng trò chơi và quay lại' }).first().click(CLICK);
      await page.waitForTimeout(400);
    }

    // ── T44D mở rộng: quét MỌI hộp chạm trong mọi hộp thoại trò chơi ─────────
    // Test nguồn (`tests/t44d`) chỉ so được chuỗi class; nó không biết `flex-wrap`
    // co nút, một nhãn ngắn sinh nút 40px hay một lớp phủ che nút. Đây là phép đo
    // tổng quát, chạy sau vì mỗi trò mất một lượt mở/đóng.
    stage = 'sweep-all-games';
    // Lấy tựa đề **từ chính các thẻ có nút "Chơi ngay"** — `h3` trên trang này
    // còn gồm cả tiêu đề mục, mà tiêu đề mục thì không mở được.
    const allTitles = await page.evaluate(() => {
      const titles = [];
      for (const b of Array.from(document.querySelectorAll('button'))) {
        if (!/Chơi ngay/.test(b.textContent || '')) continue;
        let node = b.parentElement;
        for (let depth = 0; depth < 8 && node; depth += 1) {
          const heading = node.querySelector ? node.querySelector('h3') : null;
          if (heading) {
            titles.push(heading.textContent.trim());
            break;
          }
          node = node.parentElement;
        }
      }
      return titles;
    });
    out.sweep = { gamesInHub: allTitles.length, gamesChecked: 0, offenders: [] };
    for (const title of allTitles) {
      stage = `sweep:${title}`;
      try {
        await openGameByTitle(page, title);
      } catch (e) {
        out.sweep.offenders.push({ game: title, problem: String(e.message).split('\n')[0] });
        continue;
      }
      out.sweep.gamesChecked += 1;
      const bad = await page.evaluate(
        ({ min }) => {
          const rows = [];
          for (const el of Array.from(document.querySelectorAll('[role="dialog"] button'))) {
            const r = el.getBoundingClientRect();
            if (r.width <= 0 || r.height <= 0) continue;
            if (r.width >= min && r.height >= min) continue;
            rows.push({
              name: (el.getAttribute('aria-label') || el.textContent || el.tagName)
                .trim()
                .replace(/\s+/g, ' ')
                .slice(0, 40),
              cls: (el.className || '').toString().replace(/\s+/g, ' ').slice(0, 60),
              box: `${Math.round(r.width)}x${Math.round(r.height)}`,
            });
          }
          return rows;
        },
        { min: MIN_TAP }
      );
      for (const b of bad) out.sweep.offenders.push({ game: title, ...b });
      await page.getByRole('button', { name: 'Đóng trò chơi và quay lại' }).first().click(CLICK);
      await page.waitForTimeout(300);
    }
    if (out.sweep.offenders.length) {
      out.errors.push(
        `${out.sweep.offenders.length} hộp chạm < ${MIN_TAP}px trong ${out.sweep.gamesChecked}/${out.sweep.gamesInHub} trò: ` +
          out.sweep.offenders.map((o) => `${o.game}»${o.name || o.problem || '?'} ${o.box || ''}`).join('; ')
      );
    }

    // ── T44D: chấm phân trang của Bộ Sưu Tập ─────────────────────────────────
    stage = 'sticker-album';
    await page.locator('[data-testid="nav-home"]:visible').first().click(CLICK);
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /Bộ Sưu Tập Sticker/ }).first().click(CLICK);
    await page.waitForSelector('button[class*="-mx-2"]', { timeout: 20000 });
    const dots = await measure(page, 'button[class*="-mx-2"]');
    out.tap.push({ screen: 'Bộ Sưu Tập — chấm phân trang', dot: dots });
    await page.screenshot({ path: 'evidence/2026-11-03-T44/img/sticker-dots-375.png' });

    // Một hộp chạm dưới 44px là probe đỏ, kể cả khi test nguồn xanh.
    for (const record of out.tap) {
      for (const [key, value] of Object.entries(record)) {
        if (key === 'screen') continue;
        if (!value || typeof value.count !== 'number') continue;
        if (value.count === 0) out.errors.push(`${record.screen} / ${key}: selector không khớp phần tử nào`);
        else if (value.small.length) {
          out.errors.push(`${record.screen} / ${key}: ${value.small.length}/${value.count} hộp chạm < ${MIN_TAP}px`);
        }
      }
    }
    if (out.blocked.length !== 2) out.errors.push(`mong 2 lượt bị chặn, đo được ${out.blocked.length}`);

    out.ok = out.errors.length === 0;
  } catch (e) {
    const msg = String((e && e.message) || e).split('\n')[0];
    out.errors.push(`EXCEPTION: ${msg}`);
    out.failedAt = stage;
    // Không có "trên màn hình lúc đó là gì" thì một dòng Timeout sửa không được.
    out.diag = await page
      .evaluate(() => ({
        url: location.href,
        dialogs: Array.from(document.querySelectorAll('[role="dialog"]')).length,
        buttons: Array.from(document.querySelectorAll('button'))
          .map((b) => {
            const r = b.getBoundingClientRect();
            return {
              name: (b.getAttribute('aria-label') || b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 46),
              box: `${Math.round(r.width)}x${Math.round(r.height)}`,
              visible: r.width > 0 && r.height > 0,
            };
          })
          .filter((b) => b.name)
          .slice(0, 24),
      }))
      .catch((inner) => String(inner.message).split('\n')[0]);
    out.ok = false;
  }

  return out;
}
