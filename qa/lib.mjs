/**
 * T20A — shared helpers for the browser probes in this folder.
 *
 * Everything here exists because a probe must be able to REACH the screen it
 * wants to measure, no matter which responsive breakpoint the app picks.
 */

/** Wait for the app shell to paint (T01B/11 unified QA hook). */
export async function waitForAppShell(page, timeout = 20000) {
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout });
}

/** Click a nav destination; works on the top nav AND the bottom nav. */
export async function navTo(page, screen, click = { timeout: 12000 }) {
  const item = page.locator(`[data-testid="nav-${screen}"]:visible`).first();
  await item.click(click);
}

/**
 * T20A / bug B-01 (P0) — open the first lesson of the subject screen in front.
 *
 * The adventure path stacks its nodes when one topic carries many lessons
 * (SubjectScreen.tsx path geometry — see docs/opencode/reports/T20A_BUGS.md),
 * so a mouse click on an overlapped node is intercepted by a later sibling.
 * T20A must not fix that bug (T20B owns P0/P1), so this helper activates the
 * node with the keyboard — the exact same DOM path as a tap, without the
 * hit-test that the overlap breaks. When B-01 is fixed this stays correct.
 */
export async function openFirstLesson(page, click = { timeout: 12000 }) {
  const node = page.locator('[data-testid^="lesson-button-"]').first();
  await node.focus({ timeout: click.timeout ?? 12000 });
  await page.keyboard.press('Enter');
  const start = page.getByRole('button', { name: /Bắt đầu/ }).first();
  if (await start.count()) await start.click(click);
}

/**
 * T20A — why did a click fail? Report whatever sits on top of the point.
 * A timed-out `click()` in Playwright usually means another element
 * intercepts pointer events (a modal/backdrop) or the target is covered.
 */
export async function describeBlocker(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { target: null };
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const top = document.elementFromPoint(cx, cy);
    const stack = document.elementsFromPoint(cx, cy).slice(0, 4).map((e) => ({
      tag: e.tagName.toLowerCase(),
      cls: (e.className || '').toString().slice(0, 80),
      text: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 40),
    }));
    return {
      target: {
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        visible: !!(r.width && r.height),
      },
      topMost: top
        ? {
            tag: top.tagName.toLowerCase(),
            cls: (top.className || '').toString().slice(0, 80),
            text: (top.getAttribute('aria-label') || top.textContent || '').trim().slice(0, 40),
          }
        : null,
      stack,
      openDialogs: Array.from(document.querySelectorAll('[role="dialog"]'))
        .filter((d) => d.getBoundingClientRect().width > 0)
        .map((d) => (d.getAttribute('aria-label') || d.textContent || '').trim().slice(0, 60)),
    };
  }, selector);
}

/**
 * T20A — finishing a lesson can stack the level-up celebration on
 * top of the lesson result screen (both are dialogs). The celebration is
 * dismissible, so a probe must clear it before it can reach the screen below.
 *
 * Khớp theo tiền tố "Chúc mừng" thay vì cả nhãn: nhãn này là chữ tiếng Việt
 * hiển thị cho bé (AGENTS §3) và có thể đổi câu chữ — khớp tuyệt đối thì mỗi lần
 * đổi câu là cả đàn probe đỏ theo.
 *
 * Phải **chờ** chứ không được đếm tức thời: modal này nạp bằng `React.lazy`
 * (`src/App.tsx:80`) và mở trong effect theo `profile.xp` (`src/App.tsx:184-201`), nên
 * nó có thể xuất hiện **sau** vài trăm ms. `count()` hồi trước trả 0 ⇒ helper báo
 * "không có chúc mừng" ⇒ probe bấm tiếp và bị che. Đó chính là lỗi CI đo được ở
 * check-run 125463507371 (`commit 37fd35e`):
 * `<div role="dialog" aria-label="Chúc mừng bé lên cấp"> … intercepts pointer events`
 * khi bấm `Hoàn Tất`.
 */
export async function dismissLevelUpCelebration(page, click = { timeout: 8000 }, waitMs = 1500) {
  let dismissed = false;
  // Vòng lặp vì mỗi lượt cộng XP có thể mở tiếp một màn chúc mừng khác (lên nhiều cấp).
  for (let i = 0; i < 3; i += 1) {
    const dialog = page.locator('[role="dialog"][aria-label^="Chúc mừng"]').first();
    const appeared = await dialog
      .waitFor({ state: 'visible', timeout: dismissed ? 600 : waitMs })
      .then(() => true)
      .catch(() => false);
    if (!appeared) break;
    const done = dialog.getByRole('button', { name: /Tuyệt Vời/ }).first();
    if (await done.count()) await done.click(click).catch(() => {});
    else await dialog.click({ position: { x: 5, y: 5 }, timeout: 2000 }).catch(() => {});
    dismissed = true;
    await page.waitForTimeout(200);
  }
  return dismissed;
}

/**
 * T41F — mở "Cổng Xác Nhận Phụ Huynh" mà không tin một lần đọc đề.
 *
 * run 41508824890 chết ở dòng bấm "Đấu Trường Thi Thử": đề của cổng sinh trong
 * `useEffect` nên khung hình đầu tiên vẫn là đề mồi, và probe đọc đúng lúc ấy ⇒
 * nộp đáp án sai. Đo bằng MutationObserver trong trang: 9/9 lần mở vẽ đề mồi rồi
 * thay đề thật sau 5–114 ms. App đã sửa, nhưng probe vẫn phải tự vệ: đọc đề,
 * nộp, rồi **xác nhận cổng đã đóng**; nếu còn mở thì đọc lại và nộp lại.
 */
export async function unlockParentDashboard(page, click = { timeout: 12000 }, attempts = 3) {
  await page.getByRole('button', { name: /Ba Mẹ/ }).first().click(click);
  await page.waitForSelector('text=Cổng Xác Nhận Phụ Huynh', { timeout: click.timeout ?? 12000 });

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const gate = await page.evaluate(() => {
      const el = document.querySelector('.bg-slate-100.rounded-2xl');
      return el ? el.textContent.trim() : null;
    });
    const match = gate && gate.match(/(\d+)\s*\+\s*(\d+)/);
    if (!match) throw new Error('parent gate arithmetic not found');
    await page.getByRole('spinbutton').fill(String(Number(match[1]) + Number(match[2])));
    await page.getByRole('button', { name: 'Mở Bảng Phụ Huynh' }).click(click);
    const closed = await page
      .waitForFunction(() => !document.body.innerText.includes('Cổng Xác Nhận Phụ Huynh'), null, {
        timeout: 3000,
      })
      .then(() => true)
      .catch(() => false);
    if (closed) return attempt;
  }
  throw new Error(`parent gate did not open after ${attempts} attempt(s)`);
}

/**
 * T20A / bug B-04 — open the competition hub ("Đấu Trường").
 *
 * The hub has no entry in the main nav and none on the world map any more: the
 * only child-safe route is the Parent Dashboard's "Đấu Trường Thi Thử" button
 * (App.tsx). Until that entry point comes back, probes reach it the same way a
 * grown-up does, so the hub itself is still measured.
 */
export async function openCompetitionHub(page, click = { timeout: 12000 }) {
  await unlockParentDashboard(page, click);
  await page.getByRole('button', { name: 'Đấu Trường Thi Thử', exact: true }).click(click);
  await page.getByRole('button', { name: /Mở Đấu Trường Thi Thật/ }).click(click);
  await page.waitForSelector('text=Kho Báu Đấu Trường Tri Thức', { timeout: click.timeout ?? 12000 });
}
