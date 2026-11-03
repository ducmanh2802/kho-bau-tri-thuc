/**
 * T46A — `DEF-010`: câu khen streak **thay thế** câu chào theo giờ trong Header.
 *
 * `src/components/common/Header.tsx:30-32`: `if (hasStreak) return 'Bé học đều lắm, giỏi quá!'`
 * nên một bé đã có streak (tức **đa số** bé quay lại lần hai trở đi) không bao giờ được
 * nghe "Chào buổi sáng/chiều/tối". `sound.speak(phrase)` (`:106`) chỉ nói **một** chuỗi,
 * vì vậy phần "chào" bị mất hẳn chứ không bị lùi lại.
 *
 * Hợp đồng: câu chào theo giờ luôn có mặt; lời khen streak là **phụ**, không phải bản
 * sao nhãng. Test đọc hàm qua namespace để RED vì *thiếu export*, không vì cú pháp import.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const headerSrc = readFileSync(join(here, '..', 'src', 'components', 'common', 'Header.tsx'), 'utf8');

const mod = await import('../src/components/common/Header');
function phraseFn(): (timeOfDay: 'sáng' | 'chiều' | 'tối', hasStreak: boolean) => string {
  const fn = (mod as unknown as Record<string, unknown>).getEncouragementPhrase;
  if (typeof fn !== 'function') {
    throw new Error('Header.tsx phải export getEncouragementPhrase để hành vi chào/testing được khoá');
  }
  return fn as (timeOfDay: 'sáng' | 'chiều' | 'tối', hasStreak: boolean) => string;
}

const GREETING: Record<'sáng' | 'chiều' | 'tối', string> = {
  sáng: 'Chào buổi sáng, bé ơi!',
  chiều: 'Chào buổi chiều, bé làm tốt lắm!',
  tối: 'Tối rồi, bé nhớ ngủ sớm nhé!',
};

describe('T46A — câu chào theo giờ không bị lời khen streak đè', () => {
  it('ca có streak: vẫn mở đầu bằng đúng câu chào của buổi', () => {
    for (const tod of ['sáng', 'chiều', 'tối'] as const) {
      const phrase = phraseFn()(tod, true);
      expect(phrase.startsWith(GREETING[tod])).toBe(true);
    }
  });

  it('ca không streak: chỉ có câu chào, không kèm lời khen', () => {
    for (const tod of ['sáng', 'chiều', 'tối'] as const) {
      expect(phraseFn()(tod, false)).toBe(GREETING[tod]);
    }
  });

  it('lời khen streak còn nguyên văn để nhận ra (không đổi giọng)', () => {
    const withStreak = phraseFn()('sáng', true);
    expect(withStreak).toContain('Bé học đều lắm, giỏi quá!');
    expect(withStreak.length).toBeGreaterThan(GREETING['sáng'].length);
  });

  it('chuỗi nói ra không quá dài cho bé lớp 1 (≤ 120 ký tự)', () => {
    for (const tod of ['sáng', 'chiều', 'tối'] as const) {
      expect(phraseFn()(tod, true).length).toBeLessThanOrEqual(120);
    }
  });

  it('hồi quy diện rộng: không còn `return` trần bỏ mất phrases[timeOfDay]', () => {
    const body = headerSrc.slice(
      headerSrc.indexOf('const getEncouragementPhrase'),
      headerSrc.indexOf('const NavLink'),
    );
    expect(body).toContain('phrases[timeOfDay]');
    // nhánh streak phải nối vào câu chào, không trả về chuỗi đứng một mình
    expect(/return\s+'Bé học đều lắm, giỏi quá!';/.test(body)).toBe(false);
  });

  it('vẫn chỉ có MỘT lời thoại mỗi lần gắn Header (một `sound.speak` trong hiệu ứng chào)', () => {
    const effect = headerSrc.slice(headerSrc.indexOf('Play contextual greeting'), headerSrc.indexOf('// Handle bear click reaction'));
    expect((effect.match(/sound\.speak\(/g) ?? []).length).toBe(1);
  });
});
