/**
 * T42/C — bẫy focus không được cướp con trỏ lúc ba mẹ đang gõ.
 *
 * `useFocusTrap` từng gọi `focus()` lên phần tử focus được **đầu tiên** của hộp
 * thoại ở ba thời điểm: ngay khi mount, +50 ms và +150 ms ("re-assert after
 * paint"). Hệ quả thật: mở Cổng Xác Nhận Phụ Huynh rồi bấm vào ô số và gõ
 * trong 150 ms ⇒ con trỏ bị kéo về nút ✕, chữ số biến mất, ba mẹ tưởng bàn phím
 * hỏng và phải gõ lại.
 *
 * Luật: hộp thoại chỉ được kéo focus về **khi focus còn đang ở ngoài nó**. Focus
 * đã nằm trong hộp thoại (do bé/ba mẹ tự bấm vào) là ý định hiện tại, không được
 * đè.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldMoveFocusIntoDialog } from '../src/hooks/useFocusTrap';

const inside = { id: 'inside' };
const outside = { id: 'outside' };
const container = {
  contains: (node: unknown) => node === inside,
} as unknown as HTMLElement;

describe('T42/C — chỉ kéo focus khi nó còn ở ngoài hộp thoại', () => {
  it('đang gõ trong hộp thoại ⇒ không cướp focus', () => {
    expect(shouldMoveFocusIntoDialog(inside as unknown as Element, container)).toBe(false);
  });

  it('focus nằm ngoài (hoặc chưa có) ⇒ kéo vào để chắn Tab', () => {
    expect(shouldMoveFocusIntoDialog(outside as unknown as Element, container)).toBe(true);
    expect(shouldMoveFocusIntoDialog(null, container)).toBe(true);
  });

  it('body / html đang nhận focus vẫn được coi là chưa vào hộp thoại', () => {
    const body = { id: 'body' };
    const root = { contains: () => false } as unknown as HTMLElement;
    expect(shouldMoveFocusIntoDialog(body as unknown as Element, root)).toBe(true);
  });

  it('hook chỉ focus khi quyết định là "di chuyển" (nguồn không còn focus vô điều kiện)', () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src/hooks/useFocusTrap.ts'), 'utf8');
    const body = source.slice(source.indexOf('const focusIntoDialog'));
    expect(body).toMatch(/if \(!shouldMoveFocusIntoDialog\(current, container\)\) return/);
  });
});
