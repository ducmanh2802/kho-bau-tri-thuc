/**
 * T41B — đồng hồ của DecisionEngine.
 *
 * Hai lỗi gốc đã được sửa và được ghim lại ở đây:
 *  (1) `computeSubjectBalanceBoost` tự đọc `Date.now()` dù `decide({ now })` đã
 *      nhận đồng hồ từ caller ⇒ cùng bằng liệu cho hai kết quả khác nhau theo
 *      giờ tường của máy, và mọi test dùng mốc cố định đều vô nghiệm.
 *  (2) Báo cáo Ba Mẹ lấy khoá ngày bằng `toISOString().slice(0, 10)` (UTC) trong
 *      khi `analytics.todayDate` và lịch của gia đình Việt Nam là ngày **địa
 *      phương** (UTC+7) ⇒ trước 07:00 sáng thì "phút học hôm nay" về 0 và hạn ôn
 *      in ra ngày hôm trước.
 *
 * Test ghim `process.env.TZ` sang Asia/Ho_Chi_Minh nên kết luận không phụ thuộc
 * máy chạy ở múi nào.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

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

const SAVED_TZ = process.env.TZ;
beforeAll(() => {
  process.env.TZ = 'Asia/Ho_Chi_Minh';
});
afterAll(() => {
  if (SAVED_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = SAVED_TZ;
});

import { DecisionEngine, computeSubjectBalanceBoost } from '../src/services/decisionEngine';
import { LearningOS } from '../src/services/learningOS';
import { localDateKey } from '../src/services/dateUtils';
import { P39_DECISION_POLICY } from '../src/config/policy';
import type { KnowledgeState, LearningEvidence } from '../src/types/learningOS';
import type { SubjectType } from '../src/types';

const DAY = 24 * 3600 * 1000;
const NOW = Date.parse('2026-10-06T12:00:00.000Z');

function makeState(overrides: Partial<KnowledgeState> & { skillId: string }): KnowledgeState {
  const base = LearningOS.createInitialKnowledgeState(
    overrides.skillId,
    overrides.skillName || overrides.skillId,
    (overrides.subject || 'tieng-viet') as SubjectType
  );
  return { ...base, ...overrides };
}

function vietEvidence(count: number, ts: number): LearningEvidence[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ev_vn_${i}`,
    learnerId: 'child_1',
    source: 'LESSON' as const,
    skillId: 'vn_alphabet',
    subject: 'tieng-viet' as SubjectType,
    timestamp: ts - i * 1000,
    correct: true,
  }));
}

/** Tiếng Việt saturate cửa sổ 14 ngày; ba môn kia chưa có lượt nào. */
function starvedMap(): Record<string, KnowledgeState> {
  const states = [
    makeState({ skillId: 'vn_alphabet', skillName: 'Bảng chữ cái', subject: 'tieng-viet', attemptCount: 9 }),
    makeState({
      skillId: 'math_subtraction_10',
      skillName: 'Trừ trong phạm vi 10',
      subject: 'toan',
      status: 'NEEDS_REVIEW',
      accuracy: 40,
      recentAccuracy: 30,
      attemptCount: 5,
      lastPracticedAt: NOW - 3 * DAY,
    }),
    makeState({
      skillId: 'en_alphabet',
      skillName: 'Chữ cái tiếng Anh',
      subject: 'english',
      status: 'NEEDS_REVIEW',
      accuracy: 45,
      recentAccuracy: 35,
      attemptCount: 4,
      lastPracticedAt: NOW - 3 * DAY,
    }),
    makeState({
      skillId: 'cs_personal_safety',
      skillName: 'An toàn bản thân',
      subject: 'cuoc-song',
      status: 'NEEDS_REVIEW',
      accuracy: 50,
      recentAccuracy: 40,
      attemptCount: 3,
      lastPracticedAt: NOW - 3 * DAY,
    }),
  ];
  return Object.fromEntries(states.map((s) => [s.skillId, s]));
}

describe('T41B — cửa sổ cân bằng môn theo đồng hồ của caller', () => {
  it('đếm lượt trong 14 ngày tính từ `now`, không tính từ giờ tường của máy', () => {
    const evidence = vietEvidence(8, NOW);
    const atNow = computeSubjectBalanceBoost(starvedMap(), evidence, undefined, NOW);
    expect(atNow.toan).toBe(P39_DECISION_POLICY.SUBJECT_BALANCE.BOOST);
    expect(atNow.english).toBe(P39_DECISION_POLICY.SUBJECT_BALANCE.BOOST);

    // Cùng bằng liệu, nhưng clock dời sang 30 ngày sau ⇒ dữ liệu đã ra khỏi cửa sổ.
    const later = computeSubjectBalanceBoost(starvedMap(), evidence, undefined, NOW + 30 * DAY);
    expect(later.toan).toBeUndefined();
    expect(later.english).toBeUndefined();
  });

  it('hẹp cửa sổ đúng 14 ngày: 13 ngày trước còn tính, 15 ngày trước thì không', () => {
    const fresh = vietEvidence(8, NOW - 13 * DAY);
    const stale = vietEvidence(8, NOW - 15 * DAY);
    expect(computeSubjectBalanceBoost(starvedMap(), fresh, undefined, NOW).toan).toBeGreaterThan(0);
    expect(computeSubjectBalanceBoost(starvedMap(), stale, undefined, NOW).toan).toBeUndefined();
  });

  it('`decide` gắn SUBJECT_BALANCE cho môn bị bỏ đói và tái lập từng byte', () => {
    const input = {
      knowledgeMap: starvedMap(),
      recentEvidences: vietEvidence(8, NOW),
      now: NOW,
    };
    const a = DecisionEngine.decide(input);
    const b = DecisionEngine.decide({ ...input });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));

    const balanced = a.recommendations.filter((r) => r.reasonCodes.includes('SUBJECT_BALANCE'));
    expect(balanced.length).toBeGreaterThan(0);
    expect(balanced.every((r) => r.subject !== 'tieng-viet')).toBe(true);

    // Clock 30 ngày sau ⇒ bằng liệu cũ ngoài cửa sổ ⇒ không còn lý do cân bằng môn.
    const aged = DecisionEngine.decide({ ...input, now: NOW + 30 * DAY });
    expect(aged.recommendations.some((r) => r.reasonCodes.includes('SUBJECT_BALANCE'))).toBe(false);
  });
});

describe('T41B — ngày địa phương trong báo cáo Ba Mẹ', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('`today` là ngày lịch máy, không phải ngày UTC (mốc 00:30 sáng VN)', () => {
    // 00:30 ngày 3/11 ở UTC+7 == 17:30 UTC ngày 2/11: code cũ in ra 2026-11-02.
    const earlyMorning = new Date(2026, 10, 3, 0, 30, 0).getTime();
    const output = DecisionEngine.decide({
      knowledgeMap: starvedMap(),
      recentEvidences: vietEvidence(8, earlyMorning),
      now: earlyMorning,
    });
    expect(output.parentReport.today).toBe('2026-11-03');
    expect(output.parentReport.today).toBe(localDateKey(new Date(earlyMorning)));
  });

  it('phút học hôm nay đọc từ analytics khi cùng ngày địa phương (dù UTC là hôm trước)', () => {
    const morning = new Date();
    morning.setHours(5, 0, 0, 0); // 05:00 VN ⇒ UTC vẫn là ngày hôm qua
    const todayKey = localDateKey(morning);
    expect(new Date(morning.getTime()).toISOString().slice(0, 10)).not.toBe(todayKey);

    localStorage.setItem(
      'kho_bau_analytics',
      JSON.stringify({ todayDate: todayKey, minutesToday: 25, totalQuestionsAnswered: 40 })
    );
    // Bằng liệu đều ở ngày hôm trước ⇒ phải rơi vào nhánh analytics.
    const output = DecisionEngine.decide({
      knowledgeMap: starvedMap(),
      recentEvidences: vietEvidence(6, morning.getTime() - DAY),
      now: morning.getTime(),
    });
    expect(output.parentReport.activityMinutesToday).toBe(25);
  });

  it('phiên học tối qua (theo lịch VN) không bị tính là phút của hôm nay', () => {
    const now = new Date(2026, 10, 3, 0, 30, 0).getTime(); // 00:30 ngày 3/11
    const lastNight = Date.parse('2026-11-02T16:30:00.000Z'); // 23:30 ngày 2/11 giờ VN
    const output = DecisionEngine.decide({
      knowledgeMap: starvedMap(),
      recentEvidences: vietEvidence(4, lastNight).map((e) => ({ ...e, responseTimeMs: 600000 })),
      now,
    });
    expect(output.parentReport.activityMinutesToday).toBe(0);
  });

  it('hạn ôn hiển thị cho ba mẹ dùng ngày địa phương', () => {
    const dueAt = Date.parse('2026-11-02T17:30:00.000Z'); // 00:30 ngày 3/11 giờ VN
    expect(new Date(dueAt).toISOString().slice(0, 10)).toBe('2026-11-02');
    const map: Record<string, KnowledgeState> = {
      math_subtraction_10: makeState({
        skillId: 'math_subtraction_10',
        skillName: 'Trừ trong phạm vi 10',
        subject: 'toan',
        status: 'NEEDS_REVIEW',
        accuracy: 45,
        recentAccuracy: 30,
        attemptCount: 6,
        consecutiveIncorrect: 3,
        lastPracticedAt: NOW - DAY,
        lastIncorrectAt: NOW - DAY,
        nextReviewAt: dueAt,
      }),
    };
    const output = DecisionEngine.decide({ knowledgeMap: map, recentEvidences: [], now: NOW });
    const top = output.recommendations.find((r) => r.skillId === 'math_subtraction_10');
    expect(top).toBeTruthy();
    const lines = top?.explanation.evidenceLines || [];
    expect(lines.some((l) => l.includes('Hạn ôn tiếp theo: 2026-11-03'))).toBe(true);
  });
});

describe('T41B — kế hoạch ngày cũng nghe đồng hồ của caller', () => {
  const dueMap = (): Record<string, KnowledgeState> => ({
    math_addition_10: makeState({
      skillId: 'math_addition_10',
      skillName: 'Cộng trong phạm vi 10',
      subject: 'toan',
      status: 'MASTERED',
      mastery: 90,
      confidence: 100,
      accuracy: 92,
      recentAccuracy: 93,
      attemptCount: 7,
      correctCount: 7,
      lastPracticedAt: NOW - 10 * DAY,
      nextReviewAt: NOW - DAY,
    }),
  });

  it('generatedAt đúng bằng `now` truyền vào, không phải giờ tường', () => {
    const plan = LearningOS.generateDailyPlan(dueMap(), '2026-10-06', undefined, 'test-policy', [], NOW);
    expect(plan.generatedFrom.generatedAt).toBe(NOW);
  });

  it('cùng `now` cho kế hoạch giống nhau từng byte; `now` quyết định phiếu ôn đến hạn', () => {
    const map = dueMap();
    const a = LearningOS.generateDailyPlan(map, '2026-10-06', undefined, 'test-policy', [], NOW);
    const b = LearningOS.generateDailyPlan(map, '2026-10-06', undefined, 'test-policy', [], NOW);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));

    // nextReviewAt = NOW − 1 ngày ⇒ tại NOW phiếu "Ôn Tập Định Kỳ" phải có…
    expect(a.items.some((i) => i.action.id === 'review_math_addition_10')).toBe(true);
    // …còn 9 ngày trước đó thì kỹ năng chưa tới hạn ôn.
    const early = LearningOS.generateDailyPlan(map, '2026-10-01', undefined, 'test-policy', [], NOW - 9 * DAY);
    expect(early.items.some((i) => i.action.id === 'review_math_addition_10')).toBe(false);
  });
});

describe('T41B — hợp đồng nguồn: không còn đọc đồng hồ tường trong pipeline', () => {
  const src = read('src/services/decisionEngine.ts');

  it('cửa sổ 14 ngày không còn tự đọc Date.now()', () => {
    expect(src).not.toMatch(/Date\.now\(\) - 14 \* DAY_MS/);
    expect(src).toMatch(/const windowStart = now - 14 \* DAY_MS;/);
  });

  it('không còn cắt khoá ngày bằng chuỗi UTC', () => {
    expect(src).not.toMatch(/toISOString\(\)\.slice\(0, 10\)/);
    expect(src).not.toMatch(/toISOString\(\)\.split\('T'\)\[0\]/);
  });

  it('LearningOS.generateDailyPlan không tự đọc giờ tường', () => {
    const os = read('src/services/learningOS.ts');
    expect(os).not.toMatch(/getNextBestActions\(knowledgeMap, fatigue, Date\.now\(\)/);
    expect(os).not.toMatch(/generatedAt: Date\.now\(\)/);
  });
});
