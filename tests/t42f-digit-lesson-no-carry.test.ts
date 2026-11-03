/**
 * T42/F — bài "Số hai chữ số cộng trừ một chữ số" phải đúng lời nó dạy.
 *
 * Lời dẫn của bài (`calcIn100.ts:294`) là **"giữ nguyên hàng chục, chỉ tính hàng
 * đơn vị"** — tức phép cộng/trừ **không nhớ, không mượn**, đúng quy luật lớp 1 mà
 * `src/data/games/mathUtils.ts:3` ghi thành định danh ("Lớp 1 (GDPT 2018):
 * cộng/trừ trong phạm vi 100, KHÔNG nhớ, KHÔNG mượn"). Nhưng ngân hàng đề của bài
 * lại toàn phép **có nhớ/có mượn**: 48 + 5, 36 + 7, 57 + 4, 65 + 8, 29 + 5 và
 * 43 − 6, 62 − 8, 86 − 3… Bé học theo lời dạy sẽ làm sai **mọi** câu trong bài.
 *
 * Phạm vi test này chỉ là sự nhất quán nội tại của một bài. Việc hai bài
 * "…cộng trừ hai chữ số" và "Đặt tính rồi tính" dạy *có nhớ/có mượn* (vốn là
 * chương trình **lớp 2**) là quyết định sư phạm của chủ dự án — ghi ở
 * `docs/plan/TASK_PLAN.md` §"Hệ quả chưa đóng", không tự sửa hàng loạt.
 */
import { describe, it, expect } from 'vitest';
import { LESSONS } from '../src/data/math/calcIn100';
import { isNoBorrowSub, isNoCarryAdd } from '../src/data/games/mathUtils';

const digitLesson = LESSONS.find((l) => l.id === 'math-les-100-digit');

function calcs(lesson: typeof LESSONS[number]) {
  return lesson.questions
    .map((q) => q.calc)
    .filter((c): c is NonNullable<typeof c> => !!c);
}

describe('T42/F — lời dạy và đề bài phải khớp nhau', () => {
  it('bài tồn tại và có đề sinh từ calc', () => {
    expect(digitLesson).toBeDefined();
    const items = calcs(digitLesson!);
    expect(items.length).toBeGreaterThan(0);
  });

  it('mọi phép cộng trong bài đều KHÔNG nhớ', () => {
    for (const c of calcs(digitLesson!).filter((c) => c.op === '+')) {
      expect(isNoCarryAdd(c.a, c.b), `${c.a} + ${c.b}`).toBe(true);
    }
  });

  it('mọi phép trừ trong bài đều KHÔNG mượn', () => {
    for (const c of calcs(digitLesson!).filter((c) => c.op === '-')) {
      expect(isNoBorrowSub(c.a, c.b), `${c.a} − ${c.b}`).toBe(true);
    }
  });

  it('đáp số của mỗi câu vẫn đúng theo a op b', () => {
    for (const question of digitLesson!.questions) {
      if (!question.calc) continue;
      const { a, op, b } = question.calc;
      const expected = String(op === '+' ? a + b : a - b);
      if (question.type === 'fill-blank' || question.type === 'multiple-choice') {
        expect(question.correctAnswer, question.id).toBe(expected);
      }
    }
  });

  it('cả bài vẫn có đủ phép cộng lẫn phép trừ', () => {
    const ops = new Set(calcs(digitLesson!).map((c) => c.op));
    expect(ops.has('+')).toBe(true);
    expect(ops.has('-')).toBe(true);
  });
});
