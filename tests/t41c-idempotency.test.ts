/**
 * T41C — một thao tác, một lần tính.
 *
 * Bốn đường ghi trong `storage.ts`/`readingEngine.ts` đều tự nhận "idempotent"
 * nhưng chỉ tầng bằng liệu là chống trùng thật:
 * · `recordQuestionAnswer` bỏ qua bằng liệu trùng nhưng vẫn cộng
 *   `totalQuestionsAnswered` + `skillMastery.attempts` + pushed `recentErrors`
 *   + tính quest lần hai;
 * · `ReadingEngine.applySession` cộng dồn số lượt của buổi đọc vào hồ sơ nên
 *   buổi đọc gửi hai lần nhân đôi `attempts` và kéo accuracy lệch đi;
 * · bước ngày của chuỗi thì ngược lại: `writeJSON` nuốt lỗi (Safari riêng tư /
 *   hết quota) nên cộng `streak` rồi ghi thất bại biến **mỗi lần đọc** thành
 *   một lần +1, và khiên bị tiêu theo;
 * · `recordTierReward` không có biên lai, nên cùng một lượt chơi hai cú gửi là
 *   hai lần cộng XP/Sao/`gamesPlayedCount`/quest — đúng tầng "completion/reward"
 *   mà NFR-R04 hứa nhưng chưa từng tồn tại.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let writable = true;
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      // Chế độ "hết quota / trình duyệt riêng tư": ghi luôn thất bại nhưng
      // không ném — đúng hợp đồng mà writeJSON dựa vào.
      if (!writable) throw new Error('QuotaExceededError');
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

// data/curriculum tự đăng ký catalogue vào StorageService (T39).
import '../src/data/curriculum';
import { StorageService } from '../src/services/storage';
import { ReadingEngine } from '../src/services/readingEngine';
import { localDateKey } from '../src/services/dateUtils';
import { getReadingQuestionById } from '../src/data/readingContent';
import { GameRewardStrip } from '../src/components/games/GameModalWrapper';
import type { ReadingResponse, SubjectType } from '../src/types';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

const SUBJECT: SubjectType = 'toan';

function answerTwice(evidenceId: string) {
  StorageService.recordQuestionAnswer('math_addition_10', true, 'q_t41c_1', '2 + 2 = 4', SUBJECT, {
    evidenceId,
  });
  StorageService.recordQuestionAnswer('math_addition_10', true, 'q_t41c_1', '2 + 2 = 4', SUBJECT, {
    evidenceId,
  });
}

function makeResponse(questionId: string, correct: boolean, responseTimeMs: number): ReadingResponse {
  const q = getReadingQuestionById(questionId)!;
  return {
    questionId: q.id,
    skillId: q.skillId,
    questionType: q.questionType,
    difficulty: q.difficulty,
    correct,
    responseTimeMs,
    wordsProcessed: correct ? 3 : 0,
    hesitation: responseTimeMs > 3000,
    answeredAt: Date.now(),
  };
}

function profileWithStreak(streak: number, lastActiveDate: string) {
  StorageService.saveChildProfile({
    ...StorageService.getChildProfile(),
    id: 'child_t41c',
    streak,
    lastActiveDate,
  });
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateKey(d);
}

function rawMotivation(): Record<string, unknown> | undefined {
  const raw = localStorage.getItem('kho_bau_motivation');
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : undefined;
}

beforeEach(() => {
  writable = true;
  localStorage.clear();
});

afterEach(() => {
  writable = true;
});

describe('T41C — phát lại câu trả lời không nhân đôi analytics', () => {
  it('evidenceId lặp chỉ tính một lần trên analytics và mastery', () => {
    answerTwice('ev_t41c_dupe');
    const analytics = StorageService.getAnalytics();
    expect(analytics.totalQuestionsAnswered).toBe(1);
    expect(analytics.totalCorrect).toBe(1);
    expect(analytics.skillMastery['math_addition_10'].attempts).toBe(1);
    expect(analytics.skillMastery['math_addition_10'].correctCount).toBe(1);
  });

  it('quest ngày cũng không nhận cú trả lời thứ hai', () => {
    answerTwice('ev_t41c_quest');
    const daily = StorageService.getMotivationState().daily;
    expect(daily.correctBySubject.toan).toBe(1);
    expect(daily.comboNow).toBe(1);
  });

  it('câu sai lặp không đẩy lần hai vào recentErrors', () => {
    StorageService.recordQuestionAnswer('math_addition_10', false, 'q_t41c_2', '3 + 4 = 8', SUBJECT, {
      evidenceId: 'ev_t41c_wrong',
    });
    StorageService.recordQuestionAnswer('math_addition_10', false, 'q_t41c_2', '3 + 4 = 8', SUBJECT, {
      evidenceId: 'ev_t41c_wrong',
    });
    const analytics = StorageService.getAnalytics();
    expect(analytics.recentErrors.length).toBe(1);
    expect(analytics.skillMastery['math_addition_10'].wrongCount).toBe(1);
  });

  it('hai id khác nhau vẫn tính hai lượt (không chặn quá mức)', () => {
    StorageService.recordQuestionAnswer('math_addition_10', true, 'q_a', '1 + 1', SUBJECT, {
      evidenceId: 'ev_t41c_a',
    });
    StorageService.recordQuestionAnswer('math_addition_10', true, 'q_b', '1 + 2', SUBJECT, {
      evidenceId: 'ev_t41c_b',
    });
    expect(StorageService.getAnalytics().totalQuestionsAnswered).toBe(2);
  });
});

describe('T41C — buổi đọc chỉ gập một lần vào hồ sơ', () => {
  const responses = [
    makeResponse('rq-01-1', true, 4000),
    makeResponse('rq-01-2', true, 5000),
    makeResponse('rq-01-3', false, 9000),
  ];

  it('finishSession trùng sessionId không nhân đôi attempts của bậc', () => {
    const first = ReadingEngine.finishSession('sess_t41c_1', 'ACCURACY', responses, 0, 18000, true);
    const attemptsAfterFirst = StorageService.getReadingProfile().stageStates.ACCURACY.attempts;
    const accuracyAfterFirst = StorageService.getReadingProfile().stageStates.ACCURACY.accuracy;

    ReadingEngine.finishSession('sess_t41c_1', 'ACCURACY', responses, 0, 18000, true);
    const after = StorageService.getReadingProfile();

    expect(attemptsAfterFirst).toBe(first.metrics.itemsProcessed);
    expect(after.stageStates.ACCURACY.attempts).toBe(attemptsAfterFirst);
    // Lần gập thứ hai từng kéo accuracy về giá trị trung bình của riêng nó —
    // tức điểm của bé thay đổi chỉ vì UI gửi lại.
    expect(after.stageStates.ACCURACY.accuracy).toBe(accuracyAfterFirst);
    expect(after.appliedSessionIds).toContain('sess_t41c_1');
  });

  it('buổi đọc mới vẫn được cộng dồn bình thường', () => {
    ReadingEngine.finishSession('sess_t41c_2', 'ACCURACY', responses, 0, 18000, true);
    ReadingEngine.finishSession('sess_t41c_3', 'ACCURACY', responses, 0, 18000, true);
    expect(StorageService.getReadingProfile().stageStates.ACCURACY.attempts).toBe(6);
    expect(StorageService.getReadingMetricsHistory().length).toBe(2);
  });

  it('danh sách id đã gập sống qua một lần đọc lại', () => {
    ReadingEngine.finishSession('sess_t41c_4', 'ACCURACY', responses, 0, 18000, true);
    // "Tải lại trang" = đọc lại hoàn toàn từ localStorage.
    expect(StorageService.getReadingProfile().appliedSessionIds).toContain('sess_t41c_4');
    const before = StorageService.getReadingProfile().stageStates.ACCURACY.attempts;
    ReadingEngine.finishSession('sess_t41c_4', 'ACCURACY', responses, 0, 18000, true);
    expect(StorageService.getReadingProfile().stageStates.ACCURACY.attempts).toBe(before);
  });
});

describe('T41C — chuỗi ngày không tăng khi không lưu được', () => {
  it('ghi thất bại ⇒ streak và lastActiveDate giữ nguyên sau nhiều lần đọc', () => {
    const yesterday = daysAgo(1);
    profileWithStreak(4, yesterday);

    writable = false;
    const a = StorageService.getChildProfile();
    const b = StorageService.getChildProfile();
    const c = StorageService.getChildProfile();

    expect(a.streak).toBe(4);
    expect(b.streak).toBe(4);
    expect(c.streak).toBe(4);
    expect(a.lastActiveDate).toBe(yesterday);
  });

  it('lưu được ⇒ cộng đúng một lần, đọc lại không cộng thêm', () => {
    profileWithStreak(4, daysAgo(1));

    const first = StorageService.getChildProfile();
    expect(first.streak).toBe(5);
    expect(first.lastActiveDate).toBe(localDateKey(new Date()));

    const second = StorageService.getChildProfile();
    expect(second.streak).toBe(5);
  });

  it('khiên chỉ bị tiêu sau khi bước ngày đã lưu chắc', () => {
    profileWithStreak(9, daysAgo(2));
    // Lần đọc này (lúc còn ghi được) chỉ để chắc là bé đang giữ khiên.
    expect(StorageService.getMotivationState().shields).toBeGreaterThan(0);

    writable = false;
    const blocked = StorageService.getChildProfile();
    expect(blocked.streak).toBe(9);
    expect(blocked.lastActiveDate).toBe(daysAgo(2));
    expect(Number(rawMotivation()?.shieldsUsedTotal ?? 0)).toBe(0);

    writable = true;
    const paid = StorageService.getChildProfile();
    expect(paid.streak).toBe(10);
    expect(Number(rawMotivation()?.shieldsUsedTotal ?? 0)).toBe(1);
  });
});

describe('T41C — biên lai thưởng cho một lượt chơi', () => {
  // Quest ngày xoay vòng theo mốc thời gian ⇒ số sao/XP nền không tất định.
  // Ghim một nhiệm vụ "chơi trò chơi" chưa gần mốc để mọi delta là của riêng
  // cú gửi đang được test.
  beforeEach(() => {
    StorageService.saveDailyQuests([
      {
        id: 'quest_game_2',
        title: 'Chơi 2 trò chơi thật giỏi',
        targetCount: 2,
        currentCount: 0,
        rewardStars: 3,
        rewardXp: 30,
        completed: false,
        type: 'play_game',
      },
    ]);
  });

  it('hai cú gửi của cùng một lượt chỉ trả một lần', () => {
    const before = StorageService.getChildProfile();
    const first = StorageService.recordTierReward('t41c_game', 2, 3, 20, 8, 0);
    const dup = StorageService.recordTierReward('t41c_game', 2, 3, 20, 8, 0);
    const after = StorageService.getChildProfile();

    expect(first.starsAwarded).toBe(3);
    expect(first.xpAwarded).toBe(20);
    expect(dup.isDuplicate).toBe(true);
    expect(dup.starsAwarded).toBe(0);
    expect(dup.xpAwarded).toBe(0);
    expect(after.stars - before.stars).toBe(3);
    expect(after.xp - before.xp).toBe(20);
    expect(StorageService.getAnalytics().gamesPlayedCount).toBe(1);
  });

  it('quest không nhận lượt chơi thứ hai từ một cú gửi trùng', () => {
    const playCount = () =>
      StorageService.getDailyQuests()
        .filter((q) => q.type === 'play_game')
        .reduce((s, q) => s + q.currentCount, 0);

    const before = playCount();
    StorageService.recordTierReward('t41c_game', 1, 2, 15, 4, 0);
    const afterFirst = playCount();
    StorageService.recordTierReward('t41c_game', 1, 2, 15, 4, 0);
    expect(afterFirst - before).toBe(1);
    expect(playCount()).toBe(afterFirst);
  });

  it('nonce mới = lượt chơi thật ⇒ vẫn trả thưởng', () => {
    StorageService.recordTierReward('t41c_game', 3, 1, 10, 2, 0);
    StorageService.bumpPlayNonce('t41c_game', 3);
    const replay = StorageService.recordTierReward('t41c_game', 3, 1, 10, 2, 1);
    expect(replay.isDuplicate).toBeUndefined();
    expect(replay.xpAwarded).toBe(2);
  });

  it('biên lai sống qua một lần đọc lại (whitelist của sanitizer)', () => {
    StorageService.recordTierReward('t41c_game', 4, 3, 12, 7, 0);
    const claims = StorageService.getMotivationState().rewardClaims;
    expect(claims.length).toBeGreaterThan(0);
    expect(StorageService.getMotivationState().rewardClaims).toEqual(claims);
  });

  it('lưu thất bại thì không ghi biên lai, để lần sau còn trả đúng', () => {
    writable = false;
    const blocked = StorageService.recordTierReward('t41c_game', 5, 3, 10, 5, 0);
    expect(blocked.starsAwarded).toBe(3);
    expect(StorageService.getMotivationState().rewardClaims).toEqual([]);

    writable = true;
    const same = StorageService.recordTierReward('t41c_game', 5, 3, 10, 5, 0);
    expect(same.isDuplicate).toBeUndefined();
  });
});

describe('T41C — hợp đồng nguồn', () => {
  it('phần trailing của recordQuestionAnswer đứng sau phép thử đã ghi được', () => {
    const src = read('src/services/storage.ts');
    const body = src.slice(src.indexOf('public static recordQuestionAnswer('));
    const gate = body.indexOf('if (!recorded) return;');
    expect(gate).toBeGreaterThan(-1);
    expect(gate).toBeLessThan(body.indexOf('analytics.totalQuestionsAnswered += 1'));
  });

  it('bước ngày chỉ hoàn tác khi saveChildProfile báo ghi hỏng', () => {
    const src = read('src/services/storage.ts');
    expect(src).toMatch(/public static saveChildProfile\(profile: ChildProfile\): boolean/);
    expect(src).toMatch(/if \(StorageService\.saveChildProfile\(sanitized\)\) \{/);
    expect(src).toMatch(/sanitized\.streak = streakBefore;/);
  });

  it('writeJSON trả về "đã lưu được chưa" thay vì im lặng nuốt lỗi', () => {
    const src = read('src/services/storage.ts');
    expect(src).toMatch(/export function writeJSON\(key: string, value: unknown\): boolean/);
  });
});

describe('T41C — màn kết quả không hứa "+0 Sao"', () => {
  /** Bỏ thẻ + marker xen kẻ của SSR để assertions khớp chữ bé nhìn thấy. */
  const visibleText = (props: {
    receipt: { stars: number; xp: number; duplicate?: boolean } | null;
    earnedStars: number;
    earnedXp: number;
    rewardsEnabled: boolean;
  }) =>
    renderToString(React.createElement(GameRewardStrip, { ...props, className: 'mb-5' })).replace(/<[^>]*>/g, '');

  it('biên lai thật thì in đúng số vừa vào túi', () => {
    const text = visibleText({ receipt: { stars: 2, xp: 8 }, earnedStars: 3, earnedXp: 20, rewardsEnabled: true });
    expect(text).toContain('+2 Sao');
    expect(text).toContain('+8 XP');
  });

  it('lượt chơi lại không phá kỷ lục: in XP luyện tập, giấu dòng Sao 0', () => {
    const text = visibleText({ receipt: { stars: 0, xp: 4 }, earnedStars: 3, earnedXp: 20, rewardsEnabled: true });
    expect(text).not.toMatch(/\+\d+ Sao/);
    expect(text).toContain('+4 XP');
  });

  it('hai cú gửi của một lượt (biên lai trùng) → không còn dải "+0 Sao +0 XP"', () => {
    const text = visibleText({
      receipt: { stars: 0, xp: 0, duplicate: true },
      earnedStars: 3,
      earnedXp: 20,
      rewardsEnabled: true,
    });
    expect(text).not.toMatch(/\+\d+ (Sao|XP)/);
    expect(text).toContain('đã nhận ở lượt trước');
  });

  it('ba mẹ tắt quỹ thưởng thì màn hình không kịp hứa Sao ở khung hình đầu', () => {
    const text = visibleText({ receipt: null, earnedStars: 3, earnedXp: 20, rewardsEnabled: false });
    expect(text).not.toMatch(/\+\d+ (Sao|XP)/);
    expect(text).toContain('đang tắt phần thưởng');
  });

  it('khung hình đầu (chưa có biên lai) vẫn in số đề xuất khi thưởng đang bật', () => {
    const text = visibleText({ receipt: null, earnedStars: 2, earnedXp: 25, rewardsEnabled: true });
    expect(text).toContain('+2 Sao+25 XP');
  });

  it('dải muted có data-testid để probe bắt được, không dựa vào màu', () => {
    const html = renderToString(
      React.createElement(GameRewardStrip, {
        receipt: { stars: 0, xp: 0, duplicate: true },
        earnedStars: 3,
        earnedXp: 20,
        rewardsEnabled: true,
        className: 'mb-5',
      })
    );
    expect(html).toContain('data-testid="game-rewards-muted"');
  });

  it('không còn công thức "receipt ?? phần thưởng đề xuất" trong wrapper', () => {
    const src = read('src/components/games/GameModalWrapper.tsx');
    expect(src).not.toContain('receipt?.stars ?? earnedStars');
    expect(src).not.toContain('receipt?.xp ?? earnedXp');
    expect(src).toMatch(/duplicate: r\.isDuplicate/);
    expect(src).toMatch(/const paid = StorageService\.areRewardsEnabled\(\);/);
  });
});
