/**
 * T47B — ba mẹ chọn "Không giới hạn" (`dailyLimitMinutes: 0`), máy con vẫn bị nhốt 20 phút.
 *
 * `src/services/decisionEngine.ts` đọc cài đặt bằng
 * `StorageService.getParentSettings().dailyLimitMinutes || DEFAULT_BUDGET_MINUTES`.
 * Phép `||` coi `0` là "không có giá trị" ⇒ **0 (Không giới hạn, ghi rõ ở
 * `src/types/index.ts:194`) bị ép thành 20**. Cùng lúc `src/App.tsx:167-168` lại chặn màn hình
 * theo `settings.dailyLimitMinutes > 0` ⇒ app hiểu 0 là "không chặn", engine hiểu 0 là
 * "20 phút": hai nửa của cùng một quyền phụ huynh nói hai ngữ nghĩa khác nhau.
 *
 * Hệ quả nhìn thấy được: kế hoạch "ÔN TẬP HÔM NAY" bị cắt hoạt động theo trần 20 phút
 * (`buildDailyPlan`, các dòng `if (total + rec.estimatedMinutes > opts.budgetMinutes) continue`)
 * dù ba mẹ đã cho phép cả ngày.
 *
 * Sửa: tách quyết định thành `resolveDailyBudgetMinutes()` — 0 là giá trị **có nghĩa**,
 * không phải giá trị khuyết. Trần phiên nội tại của engine (`SESSION.FULL_MAX_MINUTES`)
 * giữ nguyên: "Không giới hạn" là quyền về *tổng thời gian trong ngày*, không phải giấy
 * phép cho một phiên dài vô hạn (bé lớp 1 không ngồi 60 phút một lần).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
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

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: ReturnType<typeof createMockLocalStorage> }).localStorage =
    createMockLocalStorage();
}

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const engineSrc = read('src/services/decisionEngine.ts');
const policySrc = read('src/config/policy.ts');

const mod = await import('../src/services/decisionEngine');
const { DecisionEngine } = mod as unknown as {
  DecisionEngine: typeof import('../src/services/decisionEngine').DecisionEngine;
};

type Fatigue = Parameters<typeof DecisionEngine.buildDailyPlan>[1]['fatigue'];
type Mode = Parameters<typeof DecisionEngine.buildDailyPlan>[1]['mode'];
type Rec = Parameters<typeof DecisionEngine.buildDailyPlan>[0][number];

function resolver(): (input: number | undefined, parentDailyLimit: number) => number {
  const fn = (mod as unknown as Record<string, unknown>).resolveDailyBudgetMinutes;
  if (typeof fn !== 'function') {
    throw new Error(
      'decisionEngine.ts phải export resolveDailyBudgetMinutes(inputBudgetMinutes, parentDailyLimitMinutes)'
    );
  }
  return fn as (input: number | undefined, parentDailyLimit: number) => number;
}

const NOW = Date.parse('2026-10-06T12:00:00.000Z');
const DAY = 24 * 3600 * 1000;

const fatigue = (): Fatigue =>
  ({
    sessionStartTime: NOW,
    questionsAnsweredThisSession: 0,
    sessionErrorsCount: 0,
    consecutiveErrorsInSession: 0,
    isFatigued: false,
  }) as Fatigue;

/**
 * Một hoạt động 12 phút: ngân sách 20 chỉ chứa **1** hoạt động, ngân sách "Không giới hạn"
 * chứa cả 5 ⇒ phép thử phân biệt được hai ngữ nghĩa của `0`.
 */
function rec(i: number): Rec {
  return {
    id: `rec_${i}`,
    recommendationId: `rec_${i}`,
    title: `Hoạt động ${i}`,
    description: `mô tả ${i}`,
    childExplanation: `bé làm hoạt động ${i}`,
    estimatedMinutes: 12,
    reasonCodes: ['NEEDS_REVIEW'],
    explanation: { why: 'cần ôn', evidence: [], confidence: 80, alternatives: [] },
    launchRoute: null,
    type: 'GAME',
    activityType: 'GAME',
    skillId: `skill_${i}`,
    skillName: `Kỹ năng ${i}`,
    subject: 'toan',
    badgeEmoji: '⭐',
    priority: 50,
    priorityScore: 50,
    tier: 1,
    difficulty: 'easy',
  } as unknown as Rec;
}

const fiveRecs = [1, 2, 3, 4, 5].map(rec);

function planWithBudget(budgetMinutes: number) {
  return DecisionEngine.buildDailyPlan(fiveRecs, {
    now: NOW,
    budgetMinutes,
    insufficientEvidence: false,
    mode: 'BALANCED' as Mode,
    fatigue: fatigue(),
  });
}

/**
 * Ghi chú phép thử (đo thật ngày 2026-11-04): bản đầu so `dailyPlan` sinh bởi `decide()` và **xanh
 * cả trước lẫn sau khi sửa** — kế hoạch tự sinh chỉ gồm vài hoạt động ngắn nên tổng phút nằm dưới
 * cả hai trần 20 và 240, phép so sánh không phân biệt được hành vi (cảm giác an toàn giả). Ngân
 * sách vì thế chứng minh ở tầng `buildDailyPlan`: `fiveRecs` = 5 × `estimatedMinutes: 12` = 60 phút,
 * nên 20 phút buộc cắt (test khẳng định `< 5`, không khẳng định còn bao nhiêu) còn 240 giữ đủ 5.
 */
describe('T47B — "Không giới hạn" không được biến thành 20 phút', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('0 = Không giới hạn ⇒ ngân sách lớn hơn trần 20 phút của DEFAULT_BUDGET_MINUTES', () => {
    expect(resolver()(undefined, 0)).toBeGreaterThan(20);
  });

  it('0 không rơi vào nhánh "thiếu cài đặt" (mặc định chỉ dành cho cài đặt hỏng)', () => {
    const resolve = resolver();
    expect(resolve(undefined, 0)).not.toBe(resolve(undefined, Number.NaN));
  });

  it('ba mẹ giới hạn cụ thể vẫn được tôn trọng nguyên số', () => {
    const resolve = resolver();
    expect(resolve(undefined, 10)).toBe(10);
    expect(resolve(undefined, 15)).toBe(15);
    expect(resolve(undefined, 30)).toBe(30);
  });

  it('phiên gọi trực tiếp (input.budgetMinutes) thắng cài đặt chung', () => {
    const resolve = resolver();
    expect(resolve(5, 0)).toBe(5);
    expect(resolve(8, 30)).toBe(8);
  });

  it('cài đặt hỏng (âm / NaN / thiếu) ⇒ về DEFAULT_BUDGET_MINUTES, không phải 0', () => {
    const resolve = resolver();
    expect(resolve(undefined, -5)).toBe(20);
    expect(resolve(undefined, Number.NaN)).toBe(20);
    expect(resolve(undefined, undefined as unknown as number)).toBe(20);
  });

  it('hồi quy diện rộng: không còn phép `|| DEFAULT_BUDGET_MINUTES` nuốt số 0', () => {
    expect(engineSrc).not.toMatch(/dailyLimitMinutes\s*\|\|[\s\S]{0,90}DEFAULT_BUDGET_MINUTES/);
    // Khoá **nơi gọi** (không phải định nghĩa): cài đặt của ba mẹ phải đi qua resolver.
    expect(engineSrc).toMatch(
      /resolveDailyBudgetMinutes\(\s*input\.budgetMinutes,\s*StorageService\.getParentSettings\(\)\.dailyLimitMinutes\s*,?\s*\)/
    );
  });

  it('số "không giới hạn" phải hữu hạn (JSON.stringify(Infinity) ⇒ null, lưu hỏng không ai báo)', () => {
    const unlimited = resolver()(undefined, 0);
    expect(Number.isFinite(unlimited)).toBe(true);
    expect(JSON.parse(JSON.stringify({ b: unlimited })).b).toBe(unlimited);
  });

  it('sống thật qua buildDailyPlan: Không giới hạn xếp đủ 5 hoạt động, 20 phút thì cắt', () => {
    const resolve = resolver();
    expect(planWithBudget(resolve(undefined, 20)).items.length).toBeLessThan(5);
    expect(planWithBudget(resolve(undefined, 0)).items.length).toBe(5);
  });

  it('trần phiên của engine không bị nới theo: FULL vẫn ≤ FULL_MAX_MINUTES', () => {
    expect(policySrc).toMatch(/FULL_MAX_MINUTES:\s*20/);
    const plan = DecisionEngine.planSession(fiveRecs, {
      now: NOW,
      budgetMinutes: resolver()(undefined, 0),
      mode: 'BALANCED' as Mode,
      insufficientEvidence: false,
      fatigue: fatigue(),
      nextBest: fiveRecs[0],
    } as unknown as Parameters<typeof DecisionEngine.planSession>[1]);
    expect(plan.budgetMinutes).toBeLessThanOrEqual(20);
  });

  it('hồi quy: App.tsx vẫn coi 0 là "không chặn màn hình" (hai nửa phải cùng ngữ nghĩa)', () => {
    const app = read('src/App.tsx');
    expect(app).toMatch(/dailyLimitMinutes\s*>\s*0/);
  });
});
