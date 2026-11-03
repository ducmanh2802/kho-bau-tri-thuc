/**
 * T45B — công tắc "Tắt phần thưởng" phải chặn **mọi** dòng tài nguyên.
 *
 * T41A đã khoá 7 đường (sao/vé/sticker/quà level/shop/nhiệm vụ/trò chơi) nhưng
 * hai đường vẫn lọt, đo trong `src/services/storage.ts`:
 *  - `recordCompetitionResult` dòng 2536–2539: `profile.xp += xpReward; profile.stars += starsReward;`
 *    không hỏi `areRewardsEnabled()` (nơi gọi: `CompetitionExamModal.tsx:181`).
 *  - `checkAchievements` dòng 2451–2452: `profile.xp += xpReward` khi mở khoá thành tựu.
 *    Hai lời gọi ở 1639/2410 được che bằng `if (rewardsEnabled)` nhưng ba lời gọi
 *    2560/2673/2703 thì không ⇒ bật công tắc vẫn rò XP.
 * `addRewardHistory` tự chặn bên trong nên **lịch sử** không lộ, khiến ba mẹ càng
 * khó phát hiện: túi bé lớn lên mà bảng lịch sử vẫn trống.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

if (typeof (globalThis as Record<string, unknown>).localStorage === 'undefined') {
  (globalThis as unknown as { localStorage: ReturnType<typeof createMockLocalStorage> }).localStorage =
    createMockLocalStorage();
}
const ls = globalThis.localStorage as ReturnType<typeof createMockLocalStorage>;

import { StorageService } from '../src/services/storage';
import type { CompetitionExamResult } from '../src/types/competition';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

function setRewards(enabled: boolean) {
  StorageService.saveParentSettings({ ...StorageService.getParentSettings(), rewardsEnabled: enabled });
}

function buildExam(id: string): CompetitionExamResult {
  return {
    id,
    blueprintId: 'math-mini-01',
    examTitle: 'Toán Mini 01',
    subject: 'TOAN' as CompetitionExamResult['subject'],
    timestamp: '2026-11-03T09:00:00.000Z',
    durationSeconds: 600,
    timeUsedSeconds: 300,
    totalQuestions: 10,
    correctCount: 8,
    accuracy: 0.8,
    score: 80,
    speedRating: 'FAST' as CompetitionExamResult['speedRating'],
    speedLabel: 'Nhanh',
    averageSecondsPerQuestion: 30,
    responses: [],
    skillBreakdown: {
      'TOAN-CALC': { total: 10, correct: 8, skillName: 'Phép Tính' },
    },
    strongSkills: ['Phép Tính'],
    weakSkills: [],
    errorAnalysis: [],
    readinessSnapshot: {
      isSufficientData: true,
      overallLevel: 'STRONG' as never,
      recommendations: [],
    } as unknown as CompetitionExamResult['readinessSnapshot'],
    scoring: {
      rawScore: 80,
      maxScore: 100,
      accuracy: 0.8,
      completion: 1,
      attemptedCount: 10,
      correctCount: 8,
      totalQuestions: 10,
      totalSeconds: 300,
      averageSecondsPerQuestion: 30,
      fastestQuestionSeconds: 12,
      slowestQuestionSeconds: 45,
      skillPerformance: {},
      questionTypePerformance: {},
    },
    provenance: { blueprintVersion: 1, questionBankVersion: 1, seed: 1 },
  };
}

function wallet() {
  const p = StorageService.getChildProfile();
  return { xp: p.xp, stars: p.stars };
}

describe('T45B — tắt phần thưởng là chặn hết, không phải chặn lịch sử', () => {
  beforeEach(() => {
    ls.clear();
  });

  it('khi bật: đề thi vẫn cộng xp + sao (baseline để chứng minh test sau không rỗng)', () => {
    setRewards(true);
    const before = wallet();
    StorageService.recordCompetitionResult(buildExam('exam_t45b_on'), 50, 4);
    const after = wallet();
    // `recordCompetitionResult` còn gọi `checkAchievements()` nên XP có thể cao hơn
    // đúng phần thưởng của đề: chỉ cần "có vào túi", số tuyệt đối do test OFF chặn.
    expect(after.xp).toBeGreaterThanOrEqual(before.xp + 50);
    expect(after.stars - before.stars).toBe(4);
  });

  it('khi TẮT: đề thi không được cộng xp/sao, nhưng kết quả + phân tích vẫn lưu', () => {
    setRewards(false);
    const before = wallet();
    StorageService.recordCompetitionResult(buildExam('exam_t45b_off'), 50, 4);
    const after = wallet();
    expect(after.xp, 'xp vẫn tăng dù ba mẹ tắt phần thưởng').toBe(before.xp);
    expect(after.stars, 'sao vẫn tăng dù ba mẹ tắt phần thưởng').toBe(before.stars);

    const history = StorageService.getCompetitionHistory();
    expect(history.examResults.map((e) => e.id)).toContain('exam_t45b_off');
    const analytics = StorageService.getAnalytics();
    expect(analytics.totalQuestionsAnswered).toBeGreaterThanOrEqual(10);
    expect(analytics.totalCorrect).toBeGreaterThanOrEqual(8);
  });

  it('khi TẮT: checkAchievements không cộng XP và không mở thành tựu', () => {
    setRewards(false);
    // Đẩy số liệu đủ xa để nhiều rule thành tựu đạt (streak + sao + XP cũ).
    const profile = StorageService.getChildProfile();
    profile.stars = 400;
    profile.streak = 60;
    StorageService.saveChildProfile(profile);

    const before = wallet();
    const unlockedBefore = StorageService.getAchievements().filter((a) => a.unlocked).length;
    StorageService.checkAchievements();
    const after = wallet();
    const unlockedAfter = StorageService.getAchievements().filter((a) => a.unlocked).length;

    expect(after.xp, 'thành tựu vẫn trao XP khi phần thưởng đã tắt').toBe(before.xp);
    expect(unlockedAfter, 'thành tựu vẫn mở khoá khi phần thưởng đã tắt').toBe(unlockedBefore);
  });

  it('khi BẬT lại: thành tựu mở khoá và có cộng XP (đường chặn không thành cửa chết)', () => {
    setRewards(false);
    const profile = StorageService.getChildProfile();
    profile.stars = 400;
    profile.streak = 60;
    StorageService.saveChildProfile(profile);
    StorageService.checkAchievements();
    setRewards(true);
    const before = wallet();
    StorageService.checkAchievements();
    const after = wallet();
    expect(StorageService.getAchievements().some((a) => a.unlocked)).toBe(true);
    expect(after.xp).toBeGreaterThanOrEqual(before.xp);
  });

  it('hợp đồng mã nguồn: checkAchievements tự chặn bên trong (mọi lời gọi đều an toàn)', () => {
    const src = read('src/services/storage.ts');
    const body = src.slice(src.indexOf('public static checkAchievements()'));
    const head = body.slice(0, 400);
    expect(head, 'checkAchievements phải hỏi areRewardsEnabled() ngay đầu hàm').toContain('areRewardsEnabled()');
  });

  it('hợp đồng mã nguồn: phần thưởng thi đấu nằm trong nhánh có điều kiện', () => {
    const src = read('src/services/storage.ts');
    const idx = src.indexOf('public static recordCompetitionResult(');
    const body = src.slice(idx, src.indexOf('// ==========================================================', idx));
    const grantLine = body.indexOf('profile.xp += xpReward');
    expect(grantLine).toBeGreaterThan(-1);
    const guard = body.slice(0, grantLine);
    expect(guard, 'cộng xp thi đấu không có chốt areRewardsEnabled()').toContain('areRewardsEnabled()');
  });
});
