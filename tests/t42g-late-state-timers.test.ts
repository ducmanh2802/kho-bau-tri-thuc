/**
 * T42/G + T42/H — hai lỗi "hẹn giờ/trạng thái muộn" nhìn được từ test thuần.
 *
 * T42/G · `RhymeHunterGame` cất bản round "đã hái" vào `useState` rồi đồng bộ
 * bằng `useEffect([rounds])`. Hệ quả: một khung hình sau khi sang màn hoặc bấm
 * "Chơi lại", bảng vẫn là đề của lần trước; bé bấm nhanh thì cú hái ghi vào mảng
 * sắp bị vứt và biến mất không dấu vết. Sửa bằng cách đổi trạng thái **ngay lần
 * render** khi `rounds` thay đổi (pattern chính thức của React cho "state dẫn từ
 * props"), nên không còn khung hình nào mang đề cũ.
 *
 * T42/H · `MockExam` của bài thi thử Tiếng Anh hẹn giờ 600 ms "tự sang câu"
 * bằng `window.setTimeout` trần, không ref không cleanup. Bé bấm đáp án rồi thoát
 * màn trong 600 ms ⇒ `finish()` vẫn chạy ⇒ `onScore` ghi điểm của một lượt đã bỏ
 * vào hồ sơ, ba mẹ thấy bài đã làm dù bé mới bấm một câu rồi tắt.
 *
 * Repo này không có DOM renderer (thêm jsdom là đổi dependency — phải xin phép),
 * nên phần "không còn hiệu ứng muộn" được khoá bằng guard trên nguồn, đúng kiểu
 * `tests/t20a-hooks-order.test.ts`; phần dẫn xuất thuần thì test hành vi thật.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resetRhymeRounds } from '../src/components/games/RhymeHunterGame';
import type { RhymeRound } from '../src/data/games/rhyme_hunter';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

function round(target: string, picked: boolean[]): RhymeRound {
  return {
    targetRhyme: target,
    targetDescription: target,
    fruits: picked.map((p, i) => ({
      id: `f${i}`,
      word: `${target}${i}`,
      emoji: '🍎',
      hasRhyme: true,
      picked: p,
    })),
  } as unknown as RhymeRound;
}

describe('T42/G — round mới phải sạch dấu "đã hái" ngay lần render', () => {
  it('resetRhymeRounds sao chép và vứt mọi dấu đã hái', () => {
    const source = [round('oa', [true, true]), round('ai', [false, true])];
    const reset = resetRhymeRounds(source);
    expect(reset.map((r) => r.fruits.map((f) => f.picked))).toEqual([
      [false, false],
      [false, false],
    ]);
    // Không được mutate bản gốc — bản gốc là đầu ra của useMemo.
    expect(source[0].fruits[0].picked).toBe(true);
    expect(reset[0]).not.toBe(source[0]);
  });

  it('không còn đồng bộ rounds qua useEffect (khung hình đề cũ)', () => {
    const src = read('src/components/games/RhymeHunterGame.tsx');
    expect(src).not.toMatch(/useEffect\(\s*\(\)\s*=>\s*\{?\s*setRoundsState/);
    expect(src).toMatch(/if \(sourceRef\.current !== rounds\) \{/);
  });
});

describe('T42/H — hẹn giờ sang câu của bài thi thử phải bị xoá khi rời màn', () => {
  it('hẹn giờ nằm trong ref và có cleanup unmount', () => {
    const src = read('src/components/learning/englishIoe/EnglishIoeScreen.tsx');
    expect(src).toMatch(/const advanceTimer = useRef<number \| null>\(null\)/);
    expect(src).toMatch(/advanceTimer\.current = window\.setTimeout/);
    expect(src).toMatch(/\(\) => \(\) => \{\s*\n\s*if \(advanceTimer\.current !== null\) window\.clearTimeout/);
  });

  it('không còn setTimeout trần trong MockExam', () => {
    const src = read('src/components/learning/englishIoe/EnglishIoeScreen.tsx');
    expect(src).not.toMatch(/[^.]window\.setTimeout\(\(\) => \{\s*\n\s*if \(idx \+ 1/);
  });
});
