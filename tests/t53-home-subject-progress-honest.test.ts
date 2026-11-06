/**
 * T53 — thẻ môn trên Home báo **"Tiến độ: 50%"** cứng cho cả bốn môn.
 *
 * Phép đo (2026-11-04, trước khi sửa):
 *   grep -n "50%" src/components/home/HomeScreen.tsx
 *     ⇒ 438: `50%` trong vòng tròn · 445: `style={{ width: '50%' }}` · 448: `Tiến độ: 50%`
 *   Cùng một `strokeDashoffset="37.7"` (nửa chu vi 75.4) cho Tiếng Việt, Toán, Tiếng Anh,
 *   Em & Cuộc Sống — bất kể hồ sơ có 0 hay 40 bài đã xong. Hồ sơ trống vẫn "50%".
 *
 * Vì sao đây là lỗi chứ không phải trang trí: màn Home là nơi bé và ba mẹ nhìn nhiều
 * nhất, và con số đó không lấy từ dữ liệu nào. Test này đòi con số **đếm được** từ
 * `profile.completedLessons` theo tiền tố mã bài (`vn-` · `math-` · `eng-` · `life-`),
 * nên thêm/bớt bài trong hồ sơ là con số phải đổi.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import type { ChildProfile } from '../src/types';

if (typeof (globalThis as Record<string, unknown>).localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: () => null,
    length: 0,
  } as unknown as Storage;
}
const ls = globalThis.localStorage;

import { STORAGE_KEYS } from '../src/services/storage';
import { HomeScreen } from '../src/components/home/HomeScreen';

const here = dirname(fileURLToPath(import.meta.url));
const homeSrc = readFileSync(join(here, '..', 'src', 'components', 'home', 'HomeScreen.tsx'), 'utf8');

const noop = () => {};

const homeHtml = (completedLessons: string[]) => {
  ls.setItem(
    STORAGE_KEYS.CHILD_PROFILE,
    JSON.stringify({
      id: 'child-1',
      name: 'Bé Test',
      grade: 1,
      avatarBase: 'bear',
      equipped: {},
      xp: 0,
      stars: 0,
      gems: 0,
      tickets: 0,
      streak: 1,
      lastActiveDate: new Date().toISOString().slice(0, 10),
      unlockedItems: [],
      completedLessons,
      completedWeeklyChallenges: [],
    }),
  );
  const profile = JSON.parse(ls.getItem(STORAGE_KEYS.CHILD_PROFILE) as string) as ChildProfile;
  return renderToString(
    React.createElement(HomeScreen, {
      profile,
      onNavigate: noop,
      onSelectSubject: noop,
      onOpenGames: noop,
      onOpenDailyReview: noop,
      onOpenWeeklyChallenge: noop,
      onProfileUpdate: noop,
      onOpenParent: noop,
      onOpenLesson: noop,
    })
  );
};

describe('T53 — thẻ môn trên Home không báo tiến độ giả', () => {
  it('đếm bài đã xong theo từng môn thay vì in 50% cho tất cả', () => {
    const html = homeHtml(['vn-les-1', 'vn-les-2', 'vn-les-3', 'math-les-1']);
    expect(html).toContain('3 bài đã học');
    expect(html).toContain('1 bài đã học');
    expect(html).not.toContain('50%');
    expect(html).not.toContain('Tiến độ:');
  });

  it('mỗi môn chỉ đếm bài của chính nó', () => {
    const html = homeHtml(['vn-les-1', 'math-les-1', 'eng-les-1', 'life-les-1']);
    const singles = html.match(/1 bài đã học/g) ?? [];
    expect(singles.length).toBe(4);
  });

  it('hồ sơ trống nói thật là chưa học bài nào', () => {
    const html = homeHtml([]);
    expect(html).toContain('Chưa học bài nào');
    expect(html).not.toContain('0 bài đã học');
    expect(html).not.toContain('50%');
  });

  it('mã nguồn không còn vòng tiến độ giả', () => {
    expect(homeSrc).not.toMatch(/Tiến độ: 50%/);
    expect(homeSrc).not.toMatch(/width:\s*'50%'/);
    expect(homeSrc).not.toMatch(/strokeDashoffset="37\.7"/);
    expect(homeSrc).not.toMatch(/progressColor/);
  });
});
