/**
 * T41F — "Cổng Xác Nhận Phụ Huynh" không được vẽ một phương trình mồi.
 *
 * CI đo được: `qa/golden-path.mjs` chết ở `lib.mjs:130` với
 * `locator.click: Timeout … waiting for getByRole('button', { name: 'Đấu Trường Thi Thử' })`
 * (run 41508824890 trên `80c7e39`). Lý do: component khởi tạo
 * `useState({ a: 15, b: 18, ans: 33 })` rồi **mới** sinh đề trong `useEffect`,
 * mà effect chạy SAU paint ⇒ khung hình đầu tiên luôn là "15 + 18 = ?".
 * Đo bằng MutationObserver ngay trong trang: 9/9 lần mở đều vẽ "15 + 18",
 * đề thật xuất hiện sau đó 5–114 ms (CPU throttle 1×–20×) — `tmp-gate-race` đo
 * ngày 2026-11-03, số liệu ghi ở `evidence/2026-11-03-QA-RACE/ci-gate-race.txt`.
 * Người lớn đọc nhanh (hoặc probe đọc ngay khi selector hiện) trả lời 33 ⇒ sai ⇒
 * bảng phụ huynh không mở ⇒ không bao giờ có nút "Đấu Trường Thi Thử".
 * `renderToString` vẽ đúng khung hình đầu tiên ấy và không chạy effect, nên nó
 * là camera bắt lỗi — không cần bộ nhớ DOM.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

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
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
};

if (typeof (globalThis as Record<string, unknown>).localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: ReturnType<typeof createMockLocalStorage> }).localStorage =
    createMockLocalStorage();
}

import '../src/data/curriculum';
import { ParentDashboardModal } from '../src/components/parent/ParentDashboardModal';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

/** Bỏ comment đánh dấu text node của SSR rồi đọc phương trình đang hiển thị. */
function paintedEquation(html: string) {
  const text = html.replace(/<!--\s*-->/g, ' ');
  const m = text.match(/(\d+)\s*\+\s*(\d+)\s*=\s*\?/);
  return m ? { a: Number(m[1]), b: Number(m[2]) } : null;
}

function openGate() {
  return renderToString(
    React.createElement(ParentDashboardModal as never, {
      isOpen: true,
      initialTab: 'progress',
      onClose: () => {},
      onDataReset: () => {},
      onOpenCompetitionReal: () => {},
    } as unknown as object)
  );
}

describe('T41F — đề cổng phụ huynh có mặt ngay khung hình đầu tiên', () => {
  beforeEach(() => localStorage.clear());

  it('vẽ một đề trong khoảng đã quy định, không phải cặp mồi 15 + 18', () => {
    const seen: Array<{ a: number; b: number }> = [];
    for (let i = 0; i < 15; i += 1) {
      const eq = paintedEquation(openGate());
      expect(eq, 'cổng phải hiển thị một phép cộng khi mở').not.toBeNull();
      seen.push(eq!);
    }
    expect(seen.filter((s) => s.a === 15 && s.b === 18), 'đề mồi cứng 15 + 18').toEqual([]);
    const distinct = new Set(seen.map((s) => `${s.a}+${s.b}`));
    expect(distinct.size, 'mỗi lần mở phải là một đề khác nhau').toBeGreaterThan(1);
    for (const s of seen) {
      expect(s.a).toBeGreaterThanOrEqual(12);
      expect(s.a).toBeLessThanOrEqual(31);
      expect(s.b).toBeGreaterThanOrEqual(11);
      expect(s.b).toBeLessThanOrEqual(30);
    }
  });

  it('sinh đề trong lúc vẽ, và reset trạng thái cổng cũng trong lúc vẽ', () => {
    const src = read('src/components/parent/ParentDashboardModal.tsx');
    expect(src).toContain('const gateQuestion = useMemo(makeGateQuestion, [isOpen])');
    expect(src).not.toMatch(/setGateQuestion\(/);
    expect(src).not.toMatch(/useState\(\{\s*a: 15, b: 18/);
    expect(src).toMatch(
      /if \(gateWasOpen !== isOpen\) \{[\s\S]{0,220}?setIsAuthenticated\(false\);[\s\S]{0,10}?\}/
    );
  });
});

describe('T41F — probe không được tin một lần đọc đề', () => {
  it('lib.mjs xác nhận cổng đã ĐÓNG, nếu chưa thì đọc lại đề và nộp lại', () => {
    const src = read('qa/lib.mjs');
    expect(src).toMatch(/export async function unlockParentDashboard/);
    const helper = src.slice(src.indexOf('export async function unlockParentDashboard'));
    expect(helper).toMatch(/Cổng Xác Nhận Phụ Huynh/);
    expect(helper).toMatch(/for \(/);
    expect(helper).toMatch(/waitForFunction/);
  });

  it('openCompetitionHub và golden-path đi qua helper chung, không tự mò cổng', () => {
    const lib = read('qa/lib.mjs');
    const hub = lib.slice(lib.indexOf('export async function openCompetitionHub'));
    expect(hub).toMatch(/await unlockParentDashboard\(page/);
    const gp = read('qa/golden-path.mjs');
    expect(gp).toMatch(/await unlockParentDashboard\(page/);
    expect(gp).not.toContain("getByRole('button', { name: 'Mở Bảng Phụ Huynh' })");
  });

  it('focus và mobile-golden bỏ được giấc ngủ 400 ms che race', () => {
    for (const file of ['qa/focus.mjs', 'qa/mobile-golden.mjs']) {
      const src = read(file);
      expect(src).toMatch(/await unlockParentDashboard\(page/);
    }
  });
});
