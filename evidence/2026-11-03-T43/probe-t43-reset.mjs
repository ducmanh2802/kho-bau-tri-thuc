/**
 * Probe T43 — nghiệm thu "Đặt lại tiến độ" trên build thật (evidence, không phải qa/).
 *
 * đặt ở evidence/2026-11-03-T43/ thay vì qa/ vì qa/*.mjs được tài liệu đếm là probe;
 * chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-03-T43/probe-t43-reset.mjs
 * bằng chứng in ra: probe-t43-reset.txt (cùng thư mục).
 */
import { unlockParentDashboard } from '../../qa/lib.mjs';

export default async function run(page) {
  const errors = [];
  const out = { errors };
  const CLICK = { timeout: 12000 };

  const KEYS = {
    review: 'kho_bau_review_days',
    firstSeen: 'kho_bau_game_first_seen',
    tree: 'kho_bau_tree_water',
    parent: 'kho_bau_parent_settings',
  };

  const seed = () =>
    page.evaluate((k) => {
      localStorage.setItem(k.review, JSON.stringify(['2026-11-01', '2026-11-02']));
      localStorage.setItem(k.firstSeen, JSON.stringify({ rhyme_hunter: '2026-09-01' }));
      localStorage.setItem(k.tree, JSON.stringify('2026-11-03'));
      localStorage.setItem(k.parent, JSON.stringify({ nightMode: true, rewardsEnabled: true }));
    }, KEYS);

  const snapshot = () =>
    page.evaluate((k) => ({
      review: localStorage.getItem(k.review),
      firstSeen: localStorage.getItem(k.firstSeen),
      tree: localStorage.getItem(k.tree),
      parent: localStorage.getItem(k.parent),
    }), KEYS);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });

  await unlockParentDashboard(page);
  await page.getByRole('button', { name: /Cài Đặt & Thời Gian/ }).first().click(CLICK);
  await page.waitForTimeout(400);

  await seed();
  out.seeded = await snapshot();
  out.keysBefore = await page.evaluate(() =>
    Object.keys(localStorage).filter((x) => x.startsWith('kho_bau_')).sort()
  );

  await page.getByRole('button', { name: /Đặt lại tiến độ/ }).first().click(CLICK);
  await page.waitForSelector('text=Xác nhận đặt lại', { timeout: 10000 });
  await page.getByRole('button', { name: /Xác nhận đặt lại/ }).first().click(CLICK);

  const toast = await page
    .waitForFunction(
      () => document.body.innerText.includes('Đã đặt lại tiến độ về dữ liệu mới tinh ban đầu'),
      null,
      { timeout: 8000 }
    )
    .then(() => true)
    .catch(() => false);
  out.toastSeen = toast;
  if (!toast) {
    errors.push({ step: 'resetToast', failedAt: 'Xác nhận đặt lại', reason: 'thông báo không hiện' });
  }

  await page.waitForTimeout(1200);
  out.afterReset = await snapshot();

  out.childKeysCleared =
    out.afterReset.review === null &&
    out.afterReset.firstSeen === null &&
    out.afterReset.tree === null;
  out.parentSettingsKept =
    out.afterReset.parent !== null && out.afterReset.parent.includes('nightMode');

  if (!out.childKeysCleared) errors.push({ step: 'assertCleared', after: out.afterReset });
  if (!out.parentSettingsKept) errors.push({ step: 'assertParentKept', after: out.afterReset });

  const keysAfter = await page.evaluate(() =>
    Object.keys(localStorage).filter((x) => x.startsWith('kho_bau_')).sort()
  );
  out.keysAfter = keysAfter;
  out.valuesAfter = await page.evaluate(
    (ks) => ks.reduce((acc, k) => ({ ...acc, [k]: localStorage.getItem(k) }), {}),
    keysAfter
  );

  out.ok = errors.length === 0 && out.childKeysCleared && out.parentSettingsKept && out.toastSeen;
  return out;
}
