// T48A — bằng chứng chạy thật cho `DEF-019(d)`: `onerror` của bài đọc **không** được báo
// "đã đọc xong".
//
// Bệnh đo được: `src/hooks/useSpeak.ts` gán cùng một `setState('played')` cho `utterance.onend`
// (nói hết câu) **lẫn** `utterance.onerror` (không có tiếng). State đó lộ ra màn hình qua
// `data-audio-state` và `aria-label`, nên bé bấm loa mà thiết bị từ chối thì nhận nhãn
// "Đã đọc xong, chạm để nghe lại" — một lời hứa không có nội dung.
//
// `qa/audio.mjs` (probe chính thức) đã đo state trên Chromium thật **nhưng** không có cách tất
// định làm SpeechSynthesis hỏng ⇒ nhánh này chưa từng được đo. Ở đây dựng `window.speechSynthesis`
// giả *trước khi code app chạy* (`addInitScript`): apppath vẫn thật, chỉ khác năng lực nền tảng —
// cùng chính đáng như mô phỏng offline. Probe tự bắn `onend` / `onerror(reason)` rồi đọc nhãn.
//
// Bốn bước (mỗi bước nói rõ vì sao cần nó):
//   A1 bấm ⇒ `playing` (nếu không có bước này thì mọi kết luận "state đổi" đều vô nghĩa);
//   A2 `onend` ⇒ `played` + "Đã đọc xong" — **characterization**: nhánh đúng vẫn phải đúng,
//      bằng chứng là A2 xanh cả trước lẫn sau khi sửa;
//   B  `onerror('synthesis-failed')` ⇒ phải là `unavailable`, **không** được là `played`;
//   C  `onerror('interrupted')` (kênh bị giành, thiết bị vẫn nói được) ⇒ `idle` bấm lại được;
//      cần cả B lẫn C vì một hằng số "cứ báo unavailable" cũng làm đỏ B mà qua được C sai cách.
//
// Chạy:  npm run build && node qa/run-one.mjs evidence/2026-11-04-T48A/probe-t48a-speak-error-honest.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openFirstLesson } from '../../qa/lib.mjs';

const OUT = path.dirname(fileURLToPath(import.meta.url));
const CLICK = { timeout: 15000 };
const BTN = '[data-testid="question-audio"]';

const out = { steps: [], errors: [], facts: {}, failedAt: null, shots: [] };

let boundPage = null;

function fail(at, msg) {
  out.errors.push(`${at}: ${msg}`);
  if (!out.failedAt) out.failedAt = at;
}
const step = (k, v) => out.steps.push({ step: k, ...v });

async function shot(name) {
  const file = path.join(OUT, `${name}.png`);
  await boundPage.screenshot({ path: file });
  out.shots.push(file);
}

/** Trạng thái + nhãn truy cập được của nút loa đang hiển thị. */
async function readBtn() {
  const btn = boundPage.locator(BTN).first();
  return {
    btn,
    state: await btn.getAttribute('data-audio-state'),
    label: ((await btn.getAttribute('aria-label')) || '').trim(),
  };
}

/** Bắn một biến cố của SpeechSynthesis lên utterance mà app vừa gửi đi. */
async function settle(kind, reason) {
  return boundPage.evaluate(
    ([k, r]) => window.__qaSpeech.settle(k, r),
    [kind, reason],
  );
}

async function openLesson(origin) {
  await boundPage.goto(`${origin}/?qa`);
  await boundPage.waitForSelector('[data-testid="nav-home"]:visible', { timeout: 25000 });
  await boundPage.getByRole('button', { name: /Tiếng Việt/ }).first().click(CLICK);
  await boundPage.waitForSelector('text=Vương Quốc Tiếng Việt', { timeout: 25000 });
  await openFirstLesson(boundPage);
  await boundPage.waitForSelector(BTN, { timeout: 25000 });
  // cho autoplay của màn học settle — nếu không, bước A1 đo nhầm utterance của autoplay
  await boundPage.waitForTimeout(1600);
}

export default async function run(page, ui) {
  boundPage = page;

  // API giả phải tồn tại **trước** khi React đọc `synthesisAvailable()`.
  await page.addInitScript(() => {
    const record = { utterances: [], last: null };
    const api = {
      speaking: false,
      pending: false,
      onvoiceschanged: null,
      getVoices: () => [],
      pause() {},
      resume() {},
      cancel() {},
      speak(u) {
        record.utterances.push(u);
        record.last = u;
        api.speaking = true;
      },
    };
    window.__qaSpeech = {
      record,
      settle(kind, reason) {
        const u = record.last;
        if (!u) return false;
        api.speaking = false;
        if (kind === 'end') u.onend && u.onend({});
        else u.onerror && u.onerror({ error: reason });
        return true;
      },
      count: () => record.utterances.length,
    };
    Object.defineProperty(window, 'speechSynthesis', {
      value: api,
      configurable: true,
      writable: true,
    });
  });

  await page.goto(`${ui.origin}/?qa`);
  await page.evaluate(() => localStorage.clear());
  await openLesson(ui.origin);

  out.facts.speechApi = await page.evaluate(() => ({
    present: 'speechSynthesis' in window,
    isFake: typeof window.__qaSpeech?.settle === 'function',
  }));
  if (!out.facts.speechApi.present || !out.facts.speechApi.isFake) {
    fail('A0', `không dựng được speechSynthesis giả (${JSON.stringify(out.facts.speechApi)}) ⇒ phép thử vô nghĩa`);
    return out;
  }

  // ---- A1) bấm ⇒ playing --------------------------------------------------------------
  const before = await readBtn();
  out.facts.stateBeforePress = before.state;
  const spokenBefore = await page.evaluate(() => window.__qaSpeech.count());
  await before.btn.click(CLICK);
  await page.waitForTimeout(250);
  const playing = await readBtn();
  out.facts.statePlaying = playing.state;
  out.facts.utterancesAfterPress = await page.evaluate(() => window.__qaSpeech.count()) - spokenBefore;
  if (playing.state !== 'playing') {
    fail('A1', `bấm nút loa mà state là "${playing.state}" thay vì playing ⇒ không có gì để đo ở B/C`);
  } else if (out.facts.utterancesAfterPress !== 1) {
    fail('A1', `cú bấm gửi ${out.facts.utterancesAfterPress} utterance, phải là 1`);
  } else {
    step('A1: bấm ⇒ playing, đúng một utterance gửi đi');
  }

  // ---- A2) onend ⇒ played (characterization — nhánh ĐÚNG, đừng sửa luôn) --------------
  if (!out.failedAt) {
    if (!(await settle('end'))) fail('A2', 'không còn utterance để bắn onend');
    await page.waitForTimeout(300);
    const done = await readBtn();
    out.facts.stateAfterOnend = done.state;
    out.facts.labelAfterOnend = done.label;
    if (done.state !== 'played') {
      fail('A2', `onend cho state "${done.state}" thay vì played — nhánh thành công thật đã bị sửa hỏng`);
    } else if (!/Đã đọc xong/.test(done.label)) {
      fail('A2', `onend ⇒ played nhưng nhãn là "${done.label}" (thiếu "Đã đọc xong")`);
    } else {
      step('A2: onend ⇒ played + "Đã đọc xong" (characterization, xanh cả trước lẫn sau khi sửa)');
    }
    await shot('a2-onend-played');
  }

  // ---- B) onerror('synthesis-failed') ⇒ KHÔNG được là played ---------------------------
  const again = await readBtn();
  await again.btn.click(CLICK);
  await page.waitForTimeout(250);
  if (!(await settle('error', 'synthesis-failed'))) fail('B', 'không bắn được onerror');
  await page.waitForTimeout(350);
  const refused = await readBtn();
  out.facts.stateAfterRefusal = refused.state;
  out.facts.labelAfterRefusal = refused.label;
  await shot('b-onerror-synthesis-failed');
  if (refused.state === 'played') {
    fail(
      'B',
      `thiết bị báo lỗi "synthesis-failed" (không có tiếng) mà nút vẫn nói "${refused.label}" — ` +
        'đúng bệnh DEF-019(d): onerror bị gán chung state với onend',
    );
  } else if (refused.state !== 'unavailable') {
    fail('B', `lỗi từ chối phải ra "unavailable", nhận "${refused.state}"`);
  } else if (!/không đọc được/i.test(refused.label)) {
    fail('B', `state unavailable nhưng nhãn "${refused.label}" không nói cho ba mẹ đọc cùng bé`);
  } else {
    step(`B: onerror(synthesis-failed) ⇒ unavailable + "${refused.label}"`);
  }
  const dialogAlive = await boundPage.locator('[role="dialog"]').count();
  if (!dialogAlive) fail('B', 'bắn onerror làm màn học chết — handler phải im lặng, không được sập');

  // ---- C) onerror('interrupted') ⇒ idle, bấm lại được ----------------------------------
  // Cần một instance mới: state `unavailable` của B sống suốt đời component, mà interrupted thì
  // phải về idle trên chính nút bé đang nhìn.
  await boundPage.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await openLesson(ui.origin);
  const cBefore = await readBtn();
  out.facts.stateOnFreshLesson = cBefore.state;
  await cBefore.btn.click(CLICK);
  await page.waitForTimeout(250);
  if (!(await settle('error', 'interrupted'))) fail('C', 'không bắn được onerror(interrupted)');
  await page.waitForTimeout(350);
  const back = await readBtn();
  out.facts.stateAfterInterrupt = back.state;
  out.facts.labelAfterInterrupt = back.label;
  await shot('c-onerror-interrupted');
  if (back.state === 'played') {
    fail('C', `interrupted cũng bị gán played ("${back.label}") — cùng bệnh, khác lý do`);
  } else if (back.state === 'unavailable') {
    fail(
      'C',
      'mọi lỗi đều bị ép thành unavailable: ở đây kênh chỉ bị giành (interrupted), thiết bị vẫn nói ' +
        'được ⇒ phải về idle để bé bấm lại, đừng treo nhãn "thiết bị không đọc được"',
    );
  } else if (back.state !== 'idle') {
    fail('C', `interrupted phải cho "idle", nhận "${back.state}" (nút treo ở playing?)`);
  } else if (!/Đọc câu hỏi/.test(back.label)) {
    fail('C', `state idle nhưng nhãn "${back.label}" — bé không còn biết bấm để làm gì`);
  } else {
    step(`C: onerror(interrupted) ⇒ idle + "${back.label}" (bấm lại được, không báo hỏng)`);
  }

  return out;
}
