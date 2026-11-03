/**
 * T48A — `onerror` của bài đọc không được báo "đã đọc xong" (`DEF-019(d)` trong
 * `docs/plan/RISK_REGISTER.md`, mục "năm chỗ lệch chính sách chưa thành defect có test").
 *
 * Bệnh đo được, không suy luận: `src/hooks/useSpeak.ts` gán **cùng một** `setState('played')`
 * cho cả `utterance.onend` **lẫn** `utterance.onerror`. Hai biến cố đó là hai bằng chứng ngược nhau:
 * `onend` = nói hết câu, `onerror` = **không có tiếng** (thiết bị từ chối, hết quyền phát âm
 * thanh, giọng nói bị giành mất kênh). Vì `state` được lộ ra màn hình qua
 * `data-audio-state` và `aria-label`, hệ quả tới bé lớp 1 là nguyên văn:
 * `LessonPlayerModal.tsx` render nhãn `Đã đọc xong, chạm để nghe lại` cho state `played`
 * — bé vừa **không nghe thấy gì**, vừa được mời bấm lại một thứ không tồn tại.
 *
 * `qa/audio.mjs` đã đo state trên Chromium thật nhưng **không** kích hoạt được `onerror`
 * (không có cách tất định làm SpeechSynthesis hỏng) ⇒ chưa chốt được nhánh này, chỉ chốt
 * "thiết bị không có API ⇒ `unavailable`". Nên ở đây khoá bằng hợp đồng nguồn *và* một probe
 * dựng `speechSynthesis` giả bắn `onerror` từng lý do (`evidence/2026-11-04-T48A/`).
 *
 * Luật của test (rõ hơn "sửa cho hết chữ played"): chia theo **ý nghĩa của lý do** —
 *  - `canceled` · `interrupted` · `rejected` · `audio-busy`: kênh bị giành/hoãn, thiết bị vẫn
 *    nói được ⇒ `idle` (nút bấm lại được, không báo hỏng);
 *  - còn lại (`synthesis-failed` · `not-allowed` · `network` · `audio-hardware` …): từ chối ⇒
 *    `unavailable` — đúng nhãn "Thiết bị không đọc được, hãy đọc cùng ba mẹ nhé".
 * Test cũng giữ **characterization**: `onend` vẫn phải cho `played` (nhánh đúng, đừng sửa luôn).
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const HOOK = path.resolve(__dirname, '..', 'src', 'hooks', 'useSpeak.ts');
const SRC = fs.readFileSync(HOOK, 'utf8');
const LEARN_DIR = path.resolve(__dirname, '..', 'src', 'components');

/** `(?:\r?\n)` — làm việc trên Windows, `core.autocrlf` trả CRLF về working tree. */
function block(handler: 'onend' | 'onerror'): string | null {
  const re = new RegExp(`utterance\\.${handler} = \\([^)]*\\) => \\{([\\s\\S]*?)\\n {8}\\};`);
  const m = re.exec(SRC);
  return m ? m[1] : null;
}

function stateCalls(b: string): string[] {
  return [...b.matchAll(/setState\(\s*'(\w+)'\s*\)/g)].map((m) => m[1]);
}

/** File nào lộ state của `useSpeak` ra màn hình, và lộ bằng thuộc tính gì? */
function screensUsingHook(): { file: string; src: string }[] {
  const out: { file: string; src: string }[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.tsx') && fs.readFileSync(p, 'utf8').includes('useSpeak(')) {
        out.push({ file: p, src: fs.readFileSync(p, 'utf8') });
      }
    }
  };
  walk(LEARN_DIR);
  return out;
}

describe('T48A — onerror là bằng chứng "không có tiếng", không phải "đã đọc xong"', () => {
  it('tiên đề: hai handler tồn tại và onend vẫn cho `played` (đừng "sửa" cả nhánh đúng)', () => {
    const onend = block('onend');
    expect(onend, 'không đọc được utterance.onend trong useSpeak.ts').not.toBeNull();
    expect(stateCalls(onend!)).toEqual(['played']);
    expect(block('onerror'), 'không đọc được utterance.onerror trong useSpeak.ts').not.toBeNull();
  });

  it('onerror không được đặt `played` — đó chính là lời dối với bé', () => {
    const onerror = block('onerror')!;
    expect(stateCalls(onerror), `onerror đang gán ${JSON.stringify(stateCalls(onerror))}`).not.toContain('played');
  });

  it('onerror chia theo LÝ DO: gián đoạn ⇒ bấm lại được, từ chối ⇒ báo thiết bị không đọc được', () => {
    const onerror = block('onerror')!;
    const states = stateCalls(onerror);
    expect(states, 'onerror phải đặt lại state, không được để nút treo ở "playing"').toHaveLength(2);
    expect(states).toContain('idle');
    expect(states).toContain('unavailable');
    // đọc lý do từ event, không đoán mò: `event.error` mới phân biệt được hai nhóm
    expect(onerror).toMatch(/event\.error|\.error\b/);
    const group = /SPEAK_INTERRUPT\w*|RECOVERABLE\w*/.exec(SRC);
    expect(group, 'nhóm lý do "bị giành kênh" phải có tên, không viết chuỗi trần trong nhị phân').not.toBeNull();
    for (const reason of ['canceled', 'interrupted', 'rejected', 'audio-busy']) {
      expect(SRC, `thiếu lý do ${reason} trong nhóm gián đoạn`).toContain(`'${reason}'`);
    }
  });

  it('không có guard chết kiểu hằng số chặn nhánh (bài học ablation T47G)', () => {
    // Vòng 1 ablation T47G: chèn `false &&` vào điều kiện ⇒ probe đỏ ngay còn test nguồn vẫn
    // xanh. Test nguồn không dựng được React (repo không có jsdom/testing-library, thêm
    // dependency phải hỏi trước — AGENTS.md §1.4) nên ít nhất chặn đúng dạng đột biến đã đo.
    const onerror = block('onerror')!;
    expect(onerror).not.toMatch(/\bif \(false\b|&&\s*false\b|\|\|\s*true\b/);
  });

  it('mọi màn dùng useSpeak đều để state nhìn thấy được và có nhãn trung thực', () => {
    const screens = screensUsingHook();
    expect(screens.length, 'không tìm thấy màn nào gọi useSpeak()').toBeGreaterThan(0);
    for (const { file, src } of screens) {
      expect(src, `${path.basename(file)} không lộ state qua data-audio-state ⇒ probe không đo được`).toMatch(
        /data-audio-state=\{/,
      );
      expect(src, `${path.basename(file)} thiếu nhãn khi thiết bị không đọc được`).toMatch(/unavailable/);
    }
    // Nhãn `played` trong LessonPlayerModal là chỗ lời dối lộ ra chữ — giữ lại để nếu ai đổi
    // sang "đã đọc xong" cho cả onerror thì vẫn thấy câu này nằm ở đâu.
    const lesson = screens.find((s) => s.file.endsWith('LessonPlayerModal.tsx'));
    expect(lesson?.src).toMatch(/played[\s\S]*Đã đọc xong/);
  });
});
