/**
 * T46B — `DEF-012`: nút loa của trò "Nghe và chọn âm" **không có tên truy cập được**.
 *
 * `src/components/games/ListenPickPhonicsGame.tsx:156-161`: phần tử con duy nhất là
 * `<Volume2>` (SVG, `aria-hidden` theo mặc định của lucide), không `aria-label`, không
 * `title`. Dòng "Bấm vào loa để nghe lại 🔊" ở `:163-165` là `<span>` **anh em**, không
 * gắn với nút ⇒ trình đọc màn hình chỉ nói "nút" (button), bé không dùng chuột mất luôn
 * lối nghe lại đề.
 *
 * Quét diện rộng: mọi `<button>` icon-only trong `src/components/games/*.tsx` phải có
 * `aria-label` **hoặc** `title` (theo HTML Accessibility API Molecule, `title` là nguồn
 * tên dự phòng). Hai nút `EnglishAnimalSoundGame.tsx:84` / `EnglishColorBalloonGame.tsx:155`
 * đã có `title` nên hợp lệ; riêng nút này thì không.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const gamesDir = join(root, 'src', 'components', 'games');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

type Offender = { file: string; line: number; icon: string };

/** Tên icon lucide = định danh bắt đầu bằng chữ hoa trong `import { … } from 'lucide-react'`. */
function lucideIcons(src: string): Set<string> {
  const m = src.match(/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/);
  if (!m) return new Set();
  return new Set(
    m[1]
      .split(',')
      .map((x) => x.trim().split(/\s+as\s+/)[0].trim())
      .filter(Boolean),
  );
}

/**
 * Trả về mọi `<button>` mà **toàn bộ** nội dung là một icon lucide tự đóng
 * (`<Volume2 className=… />`) và thẻ mở không có `aria-label` / `aria-labelledby` / `title`.
 */
function iconOnlyButtonsWithoutName(file: string, src: string): Offender[] {
  const icons = lucideIcons(src);
  if (icons.size === 0) return [];
  const out: Offender[] = [];
  let idx = 0;
  while ((idx = src.indexOf('<button', idx)) !== -1) {
    const gt = src.indexOf('>', idx);
    const close = gt === -1 ? -1 : src.indexOf('</button>', gt);
    if (gt === -1 || close === -1) break;
    const openTag = src.slice(idx, gt + 1);
    const children = src.slice(gt + 1, close).trim();
    const onlyIcon = children.match(/^<([A-Z][A-Za-z0-9]*)\b[\s\S]*\/>$/);
    if (onlyIcon && icons.has(onlyIcon[1])) {
      if (!/aria-label=|aria-labelledby=|title=/.test(openTag)) {
        out.push({ file, line: src.slice(0, idx).split('\n').length, icon: onlyIcon[1] });
      }
    }
    idx = close;
  }
  return out;
}

function sweepAllGames(): Offender[] {
  return readdirSync(gamesDir)
    .filter((f) => f.endsWith('.tsx'))
    .flatMap((f) => iconOnlyButtonsWithoutName(f, readFileSync(join(gamesDir, f), 'utf8')));
}

describe('T46B — nút icon-only phải có tên truy cập được', () => {
  it('máy quét bắt đúng ca thật (self-test): nút ListenPickPhonics chưa sửa là vi phạm', () => {
    const chưaSửa = `<button
  onClick={playVoice}
  disabled={stage.locked}
  className="w-24 h-24"
>
  <Volume2 className="w-12 h-12" />
</button>`;
    const src = `import { Volume2 } from 'lucide-react';\n${chưaSửa}`;
    expect(iconOnlyButtonsWithoutName('FixtureGame.tsx', src)).toHaveLength(1);
  });

  it('máy quét không báo oan: aria-label hoặc title đều được tính là có tên', () => {
    const src = `import { Volume2 } from 'lucide-react';
<button onClick={a} title="Nghe phát âm"><Volume2 className="w-6 h-6" /></button>
<button onClick={b} aria-label="Nghe lại đề"><Volume2 className="w-6 h-6" /></button>`;
    expect(iconOnlyButtonsWithoutName('FixtureGame.tsx', src)).toHaveLength(0);
  });

  it('máy quét bỏ qua nút có chữ (không icon-only)', () => {
    const src = `import { Volume2 } from 'lucide-react';
<button onClick={a}><Volume2 className="w-6 h-6" /><span>Nghe lại</span></button>
<button onClick={b} className="p-2">Bắt đầu</button>`;
    expect(iconOnlyButtonsWithoutName('FixtureGame.tsx', src)).toHaveLength(0);
  });

  it('ListenPickPhonicsGame: nút loa có aria-label tiếng Việt', () => {
    const src = read('src/components/games/ListenPickPhonicsGame.tsx');
    const handler = src.indexOf('onClick={playVoice}');
    expect(handler).toBeGreaterThan(-1);
    const open = src.lastIndexOf('<button', handler);
    expect(open).toBeGreaterThan(-1);
    const speaker = src.slice(open, src.indexOf('</button>', handler));
    expect(speaker).toContain('aria-label=');
    expect(/aria-label="Nghe lại đề"/.test(src)).toBe(true);
  });

  it('diện rộng: toàn bộ src/components/games không còn nút icon-only vô danh', () => {
    expect(sweepAllGames()).toEqual([]);
  });

  it('không đổi nhãn nhìn thấy — dòng "Bấm vào loa để nghe lại" còn nguyên (probe/reader khỏi lệch)', () => {
    expect(read('src/components/games/ListenPickPhonicsGame.tsx')).toContain('Bấm vào loa để nghe lại');
  });
});
