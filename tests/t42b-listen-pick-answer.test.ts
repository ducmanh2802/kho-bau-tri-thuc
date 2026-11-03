/**
 * T42/B — Đôi Tai Thính không được đưa ra một vòng **không thể trả lời**.
 *
 * `buildRoundsFromGameItems` cắt `item.options.slice(0, 4)` trong khi
 * `getGameItems` đã xáo phương án theo seed (`gameContent.ts:112`) và câu thật
 * có 5–6 phương án (`src/data/vietnamese/tones.ts`). Đáp án vì vậy có thể rơi
 * ngoài 4 thẻ hiển thị ⇒ `handlePick` không bao giờ khớp
 * `card.word === currentRound.targetWord` ⇒ bé bấm hết 4 thẻ, ăn 4 lần "sai",
 * và không có đường ra nào ngoài chơi lại màn.
 *
 * Luật: thẻ hiển thị **luôn chứa đáp án**, không quá số phương án của bậc, và
 * vị trí đáp án không được khoá ở một chỗ (bé chưa đọc thạo sẽ bấm theo quán tính).
 */
import { describe, it, expect } from 'vitest';
import { buildRoundsFromGameItems, pickCardOptions } from '../src/components/games/ListenPickPhonicsGame';
import type { GameItem } from '../src/services/gameContent';

function item(overrides: Partial<GameItem>): GameItem {
  return {
    id: 'q_t42b',
    prompt: 'Nghe và chọn con vật',
    answer: 'Con vịt',
    options: ['Con mèo', 'Con chó', 'Con gà', 'Con vịt', 'Con thỏ', 'Cá'],
    emoji: '🦆',
    audioText: 'Con vịt',
    kind: 'word-picture',
    subject: 'tieng-viet',
    ...overrides,
  } as GameItem;
}

describe('T42/B — thẻ chọn phải chứa đáp án', () => {
  it('đáp án ở vị trí 5/6 vẫn nằm trong các thẻ', () => {
    for (const seed of [1, 7, 42, 99, 2026]) {
      const shown = pickCardOptions(item({}).options, item({}).answer, seed);
      expect(shown).toContain('Con vịt');
      expect(shown.length).toBeLessThanOrEqual(4);
      expect(new Set(shown).size).toBe(shown.length);
    }
  });

  it('vị trí đáp án thay đổi theo seed chứ không cố định một chỗ', () => {
    const idx = [1, 2, 3, 4, 5, 6, 7, 8].map((s) => pickCardOptions(item({}).options, 'Con vịt', s).indexOf('Con vịt'));
    expect(new Set(idx).size).toBeGreaterThan(1);
    expect(idx.every((i) => i >= 0)).toBe(true);
  });

  it('phương án ít hơn trần thì giữ nguyên, không bịa thêm', () => {
    const three = ['Con mèo', 'Con chó', 'Con vịt'];
    const shown = pickCardOptions(three, 'Con vịt', 9);
    expect(shown.sort()).toEqual([...three].sort());
  });

  it('toàn bộ đáp án của mọi item đều xuất hiện trong cards của round', () => {
    const rounds = buildRoundsFromGameItems([item({}), item({ id: 'q2', answer: 'Cá', emoji: '🐟' })], 5, 12345);
    expect(rounds).toHaveLength(2);
    for (const round of rounds) {
      expect(round.cards.map((c) => c.word)).toContain(round.targetWord);
    }
  });
});
