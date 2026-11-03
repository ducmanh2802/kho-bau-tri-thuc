// T48B — bằng chứng chạy thật cho `DEF-020`: hộp kết quả máy gắp không được hứa điều
// mà trình duyệt từ chối ghi.
//
// Bệnh đo được: `grep -rn "StorageService\.save" src | wc -l` = 79 dòng, `grep -rho
// "StorageService\.save[A-Za-z]*(" src | wc -l` = 78 lời gọi thật, và đúng 1 lời gọi
// đọc giá trị trả về (`storage.ts:1099`). `writeJSON` trả `false` khi trình duyệt chặn ghi (Safari
// private mode) hoặc hết dung lượng — `StorageService.drawGacha` bỏ qua con số đó và vẫn
// trả `ok: true`, nên màn gắp bắn confetti, chơi nhạc thắng và in "Đã lưu vào Bộ Sưu Tập!"
// trong khi không có byte nào nằm xuống máy: tải lại trang, sticker lẫn vé đều như cũ.
//
// `qa/gacha-machine.mjs` (probe chính thức, vẫn xanh) chỉ đo đường **lưu được**, nên lời
// hứa ở đường lưu hỏng chưa từng có bằng chứng. Ở đây chặn `Storage.prototype.setItem`
// cho đúng hai khoá phần thưởng *trước khi code app chạy* (`addInitScript`): đường vẽ,
// nút bấm, engine gắp đều thật, chỉ khác năng lực nền tảng — cùng chính đáng như mô phỏng
// offline ở T48A và T32.
//
// Ba bước:
//   A  storage lành ⇒ báo "Đã lưu"/"Đã cộng", vé giảm, sticker nằm xuống máy
//      — **characterization**: nhánh đúng vẫn phải đúng, A xanh cả trước lẫn sau khi sửa;
//   B  hai khoá bị chặn ⇒ hộp kết quả KHÔNG được chứa lời hứa nào ("Đã lưu vào Bộ Sưu
//      Tập", "Đã cộng vào số lượng", "Sticker Mới"), mà phải nói "không lưu được";
//   C  sau B, dữ liệu trên máy đứng nguyên (vé không bị trừ oan, sticker không tăng) —
//      chứng minh B là thất bại *được thừa nhận*, không phải thất bại *được che*.
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T48B/probe-t48b-gacha-save-honest.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dismissLevelUpCelebration } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const PROFILE_KEY = 'kho_bau_child_profile';
const MOTIVATION_KEY = 'kho_bau_motivation';
const DIALOG = '[role="dialog"][aria-label="Kết quả máy gắp sticker"]:visible';
/** Mọi câu chữ hứa rằng phần thưởng đã nằm lại máy. */
const PROMISE = /Đã lưu vào Bộ Sưu Tập|Đã cộng vào số lượng|Sticker Mới/;

export default async function run(page) {
  const out = { errors: [], shots: [], facts: {}, steps: [] };
  const shot = async (name) => {
    const file = path.join(OUT, name + '.png');
    await page.screenshot({ path: file, fullPage: false });
    out.shots.push(path.basename(file));
  };
  const step = (name, detail) => out.steps.push({ step: name, ...detail });

  const readState = () =>
    page.evaluate(
      ([profileKey, motivationKey]) => {
        const profile = JSON.parse(localStorage.getItem(profileKey) || '{}');
        const motivation = JSON.parse(localStorage.getItem(motivationKey) || '{}');
        return {
          tickets: profile.tickets,
          stars: profile.stars,
          stickerKinds: Object.keys(motivation.stickers || {}).length,
          drawsTotal: motivation.gachaDrawsTotal,
        };
      },
      [PROFILE_KEY, MOTIVATION_KEY]
    );

  const openMachine = async () => {
    await page.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 20000 });
    await page.locator('button:has-text("Máy Gắp"), [data-testid*="gacha"]').first().click(CLICK);
    await page.waitForSelector('[data-testid="gacha-pile"]', { timeout: 20000 });
  };

  const drawOnce = async () => {
    await page.locator('[data-testid="gacha-draw"]').first().click(CLICK);
    const dialog = page.locator(DIALOG);
    await dialog.waitFor({ state: 'visible', timeout: 15000 });
    const text = (await dialog.innerText()).replace(/\s+/g, ' ').trim();
    await dismissLevelUpCelebration(page);
    await dialog
      .locator('button:has-text("Tuyệt Vời!"), button:has-text("Hiểu Rồi")')
      .first()
      .click(CLICK);
    await page.waitForSelector(DIALOG, { state: 'hidden', timeout: 10000 });
    return text;
  };

  try {
    await page.setViewportSize({ width: 390, height: 844 });

    // ---------- A: đường lưu được (characterization) ----------
    await page.evaluate(
      ([profileKey, motivationKey]) => {
        localStorage.clear();
        localStorage.setItem(
          profileKey,
          JSON.stringify({ id: 'qa-t48b', name: 'Bé QA', xp: 0, stars: 50, tickets: 5, streak: 1 })
        );
        localStorage.setItem(motivationKey, JSON.stringify({ stickers: {}, daily: { gachaDraws: 0 } }));
      },
      [PROFILE_KEY, MOTIVATION_KEY]
    );
    await page.reload();
    await openMachine();
    const beforeA = await readState();
    const textA = await drawOnce();
    const afterA = await readState();
    step('A-lưu-được', { text: textA.slice(0, 150), beforeA, afterA });
    out.facts.A = { beforeA, afterA };
    if (!PROMISE.test(textA))
      out.errors.push(`A: storage ghi được mà hộp kết quả không khẳng định đã lưu: "${textA.slice(0, 120)}"`);
    if (afterA.tickets !== beforeA.tickets - 1)
      out.errors.push(`A: vé phải giảm 1 (${beforeA.tickets} → ${afterA.tickets})`);
    if (afterA.stickerKinds < 1) out.errors.push('A: sticker không nằm xuống localStorage');
    await shot('01-A-luu-duoc');

    // ---------- B: hai khoá phần thưởng bị trình duyệt từ chối ----------
    await page.addInitScript(
      ([profileKey, motivationKey]) => {
        const original = Storage.prototype.setItem;
        window.__t48bBlockedWrites = 0;
        Storage.prototype.setItem = function (key, value) {
          if (key === profileKey || key === motivationKey) {
            window.__t48bBlockedWrites += 1;
            const err = new Error('QuotaExceededError');
            err.name = 'QuotaExceededError';
            throw err;
          }
          return original.call(this, key, value);
        };
      },
      [PROFILE_KEY, MOTIVATION_KEY]
    );
    await page.reload();
    await openMachine();
    const beforeB = await readState();
    const textB = await drawOnce();
    const afterB = await readState();
    const blockedWrites = await page.evaluate(() => window.__t48bBlockedWrites);
    step('B-khong-luu-duoc', { text: textB.slice(0, 150), beforeB, afterB, blockedWrites });
    out.facts.B = { beforeB, afterB, blockedWrites };
    if (blockedWrites < 1)
      out.errors.push('B: không có lần ghi nào bị chặn ⇒ kịch bản đo hỏng, kết luận B vô nghĩa');
    if (PROMISE.test(textB))
      out.errors.push(`B: máy KHÔNG ghi được mà vẫn hứa đã lưu: "${textB.slice(0, 120)}"`);
    if (!/không lưu được/i.test(textB))
      out.errors.push(`B: hộp kết quả không nói thẳng là không lưu được: "${textB.slice(0, 120)}"`);
    await shot('02-B-khong-luu-duoc');

    // ---------- C: thất bại được thừa nhận, không được che ----------
    step('C-may-dung-nguyen', { beforeB, afterB });
    if (afterB.tickets !== beforeB.tickets)
      out.errors.push(`C: vé bị trừ ${beforeB.tickets} → ${afterB.tickets} dù phần thưởng không lưu được`);
    if (afterB.stickerKinds !== beforeB.stickerKinds)
      out.errors.push(`C: số sticker thay đổi ${beforeB.stickerKinds} → ${afterB.stickerKinds} dù ghi bị chặn`);
  } catch (e) {
    out.errors.push('EXCEPTION: ' + (e && e.message ? String(e.message).slice(0, 900) : String(e)));
    out.failedAt = out.steps.length ? out.steps[out.steps.length - 1].step : 'start';
    try {
      await page.screenshot({ path: path.join(OUT, '99-failure.png'), fullPage: false });
      out.shots.push('99-failure.png');
    } catch {
      /* page đã đóng */
    }
  }

  out.ok = out.errors.length === 0;
  fs.writeFileSync(path.join(OUT, 'probe-result.json'), JSON.stringify(out, null, 2));
  return out;
}
