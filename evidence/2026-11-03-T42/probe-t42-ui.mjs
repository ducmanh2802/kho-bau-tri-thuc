/**
 * Probe tạm cho đợt T42 — không commit, đặt ở gốc repo để không lọt vào phép đếm
 * probe trong qa/. Chạy: npm run build && node qa/run-one.mjs tmp-t42-ui.mjs
 */
export default async function run(page, ui) {
  const errors = [];
  const out = { errors };
  const CLICK = { timeout: 12000 };

  const readProgress = (gameId) =>
    page.evaluate((id) => {
      try {
        const store = JSON.parse(localStorage.getItem('kho_bau_game_progress') || '{}');
        return store.games?.[id] ?? null;
      } catch {
        return { parseError: true };
      }
    }, gameId);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
  await page.locator('[data-testid="nav-games"]:visible').first().click(CLICK);
  await page.waitForSelector('text=Đấu Trường Trò Chơi Trí Tuệ', { timeout: 20000 });

  const play = page.getByRole('button', { name: /Chơi ngay/ });

  // ---- T42/A + RhymeHunter render: chọn màn không in sao, lưới quả dựng lại ----
  await play.nth(2).click(CLICK);
  await page.waitForTimeout(1000);
  out.rhymeHeader = await page.evaluate(() => document.body.innerText.match(/Màn \d\/\d ▾/)?.[0] ?? null);
  out.rhymeFruits = await page.locator('[role="dialog"] button', { hasText: 'Bấm để hái' }).count();
  out.progressBeforePick = await readProgress('rhyme_hunter');

  await page.getByText(/Màn \d\/\d ▾/).first().click(CLICK);
  await page.waitForSelector('text=Chọn Màn & Độ Khó', { timeout: 10000 });
  await page.getByRole('button', { name: /Màn 4:/ }).first().click(CLICK);
  await page.waitForTimeout(1500);
  out.headerAfterPick = await page.evaluate(() => document.body.innerText.match(/Màn \d\/\d ▾/)?.[0] ?? null);
  out.progressAfterPick = await readProgress('rhyme_hunter');
  out.fruitsAfterPick = await page.locator('[role="dialog"] button', { hasText: 'Bấm để hái' }).count();
  out.profileStarsAfterPick = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('kho_bau_child_profile') || '{}').stars ?? null;
    } catch {
      return 'parse-error';
    }
  });
  const p = out.progressAfterPick || {};
  out.noStarsMinted = Object.keys(p.starsByTier || {}).length === 0;
  out.noBestScoreMinted = Object.keys(p.bestScoreByTier || {}).length === 0;
  out.unlockedTierAfterPick = p.unlockedTier;
  if (!out.noStarsMinted) errors.push('chọn màn 4 mà starsByTier vẫn bị ghi sao');
  if (!out.noBestScoreMinted) errors.push('chọn màn 4 mà bestScoreByTier vẫn bị ghi điểm');
  if (out.headerAfterPick !== 'Màn 4/6 ▾') errors.push(`header sau khi chọn = ${out.headerAfterPick}`);
  if (out.fruitsAfterPick < 4) errors.push(`lưới quả sau khi đổi màn chỉ có ${out.fruitsAfterPick} quả`);
  await page.screenshot({ path: 'evidence/2026-11-03-T42/t42a-tier4-no-stars.png' });

  await page.getByRole('button', { name: 'Đóng trò chơi và quay lại' }).first().click(CLICK);
  await page.waitForTimeout(700);

  // ---- T42/B: Đôi Tai Thính — thẻ đáp án luôn có đủ 4, từ không trùng ----
  await play.nth(4).click(CLICK);
  await page.waitForTimeout(1500);
  const wordsOf = () =>
    page.evaluate(() => {
      const dlg = document.querySelector('[role="dialog"]');
      if (!dlg) return [];
      return Array.from(dlg.querySelectorAll('span.font-display'))
        .map((s) => (s.textContent || '').trim())
        .filter(Boolean);
    });
  out.listenCards = await wordsOf();
  out.listenUnique = new Set(out.listenCards).size;
  if (out.listenCards.length !== 4) errors.push(`Đôi Tai Thính render ${out.listenCards.length} thẻ, mong 4`);
  await page.screenshot({ path: 'evidence/2026-11-03-T42/t42b-listen-pick-cards.png' });

  const replay = page.getByRole('button', { name: /Chơi lại|Chơi tiếp/ }).first();
  if (await replay.count()) {
    await replay.click(CLICK);
    await page.waitForTimeout(1200);
    out.listenAfterReplay = await wordsOf();
    out.replayStillFour = out.listenAfterReplay.length === 4;
    if (!out.replayStillFour) errors.push('sau khi chơi lại số thẻ khác 4');
  }
  out.ok = errors.length === 0;
  return out;
}
