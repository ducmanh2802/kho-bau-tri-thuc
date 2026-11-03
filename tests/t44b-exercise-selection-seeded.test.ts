/**
 * T44/B — đường **chọn đề** phải tất định theo seed (AGENTS.md §2: builder theo
 * `(tier, seed)`, không `Math.random` / `Date.now`).
 *
 * Ba chỗ chọn nội dung học bằng `Math.random` trần:
 * · `AdaptiveService.generateDailyReview()` (`src/services/adaptive.ts:56`) xáo
 *   câu hỏi bằng `private static shuffle` (`:338`, `Math.random` ở `:342`) ⇒
 *   bé tải lại trang là bị đổi bộ câu hỏi đang làm dở, và "ôn câu sai" không
 *   tái hiện được để debug;
 * · màn IOE xáo đề luyện (`EnglishIoeScreen.tsx:293`) và đề thi thử (`:431`)
 *   bằng `shuffle` nội bộ (`:39`) ⇒ cùng một lần bấm không dựng lại được đề;
 *   hai hàm này còn nằm trong component nên không test được.
 *
 * Luật của test: cùng seed ⇒ **cùng một danh sách id theo đúng thứ tự**; muốn đề
 * khác thì caller phải tăng seed (không có chuyện ẩn danh theo đồng hồ).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { AdaptiveService } from '../src/services/adaptive';
import { pickIoePracticeQuestions, pickIoeMockQuestions } from '../src/data/englishIoe/selection';

const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

if (typeof (globalThis as unknown as Record<string, unknown>).localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: ReturnType<typeof createMockLocalStorage> }).localStorage =
    createMockLocalStorage();
}

const idsOf = (questions: { id: string }[]) => questions.map((q) => q.id).join(',');
const reviewIds = (seed?: number) => idsOf(AdaptiveService.generateDailyReview(seed).questions);

describe('T44/B — chọn đề tất định theo seed', () => {
  beforeEach(() => localStorage.clear());

  describe('AdaptiveService.generateDailyReview', () => {
    it('cùng seed ⇒ cùng bộ câu hỏi, cùng thứ tự', () => {
      const a = AdaptiveService.generateDailyReview(20261103);
      expect(a.questions.length).toBeGreaterThan(0);
      expect(reviewIds(20261103)).toBe(idsOf(a.questions));
    });

    it('không truyền seed ⇒ ổn định trong cùng một ngày', () => {
      // Hành vi làm hỏng "Ôn Tập Thông Minh Hôm Nay": mỗi lần mở lại màn là một
      // bộ đề khác dù bé chưa làm câu nào. Mặc định phải lấy theo ngày.
      expect(reviewIds()).toBe(reviewIds());
    });

    it('seed khác nhau ⇒ bộ câu hỏi khác nhau (đề vẫn đổi khi bé bấm "đề khác")', () => {
      const seen = new Set([reviewIds(1), reviewIds(2), reviewIds(3), reviewIds(4)]);
      expect(seen.size).toBeGreaterThan(1);
    });

    it('không bao giờ trả câu trùng id', () => {
      for (const seed of [7, 99, 12345]) {
        const ids = AdaptiveService.generateDailyReview(seed).questions.map((q) => q.id);
        expect(new Set(ids).size, `seed ${seed} sinh đề trùng câu`).toBe(ids.length);
      }
    });
  });

  describe('kho đề IOE (helper tách từ màn hình)', () => {
    it('đề luyện 8 câu: cùng seed ⇒ cùng thứ tự', () => {
      const a = pickIoePracticeQuestions(20261103);
      const b = pickIoePracticeQuestions(20261103);
      expect(a).toHaveLength(8);
      expect(idsOf(b)).toBe(idsOf(a));
    });

    it('đề thi thử 15 câu: cùng seed ⇒ cùng thứ tự', () => {
      const a = pickIoeMockQuestions(20261103);
      const b = pickIoeMockQuestions(20261103);
      expect(a).toHaveLength(15);
      expect(idsOf(b)).toBe(idsOf(a));
    });

    it('tăng seed ⇒ đổi đề', () => {
      expect(idsOf(pickIoeMockQuestions(101))).not.toBe(idsOf(pickIoeMockQuestions(102)));
    });

    it('đề không có câu trùng', () => {
      for (const seed of [1, 2, 3]) {
        const picked = pickIoeMockQuestions(seed);
        expect(new Set(picked.map((q) => q.id)).size).toBe(picked.length);
      }
    });
  });

  describe('hợp đồng nguồn: đường sinh đề không dùng Math.random', () => {
    const root = path.resolve(__dirname, '..', 'src');
    const files = [
      path.join('services', 'adaptive.ts'),
      path.join('data', 'englishIoe', 'selection.ts'),
    ];
    for (const rel of files) {
      it(`${rel} không gọi Math.random`, () => {
        const text = fs.readFileSync(path.join(root, rel), 'utf8');
        expect(text).not.toMatch(/Math\.random\s*\(/);
      });
    }
  });
});
