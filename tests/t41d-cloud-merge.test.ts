import { describe, it, expect } from 'vitest';

import { mergeCloudState } from '../src/services/cloudMerge';
import { DEFAULT_CHILD_PROFILE } from '../src/services/storage';
import type { ChildProfile, LearningAnalytics, SkillMastery } from '../src/types';

/**
 * T41D — luật hợp nhất hồ sơ local với hồ sơ cloud.
 *
 * Mỗi test là một lỗi của công thức cũ (`Math.max` cho mọi số + spread một
 * chiều), nên chỉ cần đổi lại luật trong `cloudMerge.ts` là đỏ.
 */

function profile(over: Partial<ChildProfile> = {}): ChildProfile {
  return {
    ...DEFAULT_CHILD_PROFILE,
    unlockedItems: [...DEFAULT_CHILD_PROFILE.unlockedItems],
    completedLessons: [...DEFAULT_CHILD_PROFILE.completedLessons],
    completedWeeklyChallenges: [...DEFAULT_CHILD_PROFILE.completedWeeklyChallenges],
    lessonStars: {},
    chestState: {},
    equipped: { ...DEFAULT_CHILD_PROFILE.equipped },
    ...over,
  };
}

function analytics(over: Partial<LearningAnalytics> = {}): LearningAnalytics {
  return {
    totalMinutesSpent: 0,
    minutesToday: 0,
    todayDate: '2026-11-03',
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    lessonsCompletedCount: 0,
    gamesPlayedCount: 0,
    skillMastery: {},
    recentErrors: [],
    ...over,
  };
}

function mastery(skillId: string, over: Partial<SkillMastery> = {}): SkillMastery {
  return {
    skillId,
    skillName: `Kỹ năng ${skillId}`,
    subject: 'toan',
    attempts: 1,
    correctCount: 1,
    wrongCount: 0,
    status: 'LEARNING',
    lastPracticed: '2026-11-01T00:00:00.000Z',
    ...over,
  };
}

const merge = (local: ChildProfile, cloudProfile: Record<string, unknown> | null, cloudAnalytics: Record<string, unknown> | null = null, localAnalytics = analytics()) =>
  mergeCloudState({ local, localAnalytics, cloudProfile, cloudAnalytics });

describe('T41D — merge cloud sync: các trường chỉ tăng', () => {
  it('không có hồ sơ trên cloud thì giữ nguyên máy này, không bịa số', () => {
    const local = profile({ xp: 40, stars: 7 });
    const out = merge(local, null);
    expect(out.profile).toBe(local);
    expect(out.trace).toEqual(['cloud_absent']);
  });

  it('XP lấy lớn hơn vì mọi đường ghi XP đều là `+=`', () => {
    const out = merge(profile({ xp: 120 }), { xp: 300, lastActiveDate: '2026-10-01' });
    expect(out.profile.xp).toBe(300);
    expect(out.trace).toContain('xp:cloud_higher');
  });

  it('bộ đếm analytics cộng dồn lấy lớn hơn, không lấy tổng', () => {
    const out = merge(
      profile(),
      { lastActiveDate: '2026-11-01' },
      { totalQuestionsAnswered: 90, totalCorrect: 60, lessonsCompletedCount: 12 }
    );
    expect(out.analytics.totalQuestionsAnswered).toBe(90);
    expect(out.analytics.totalCorrect).toBe(60);
    expect(out.analytics.lessonsCompletedCount).toBe(12);
  });
});

describe('T41D — merge cloud sync: tài nguyên tiêu được KHÔNG được dùng max', () => {
  it('vé đã tiêu ở máy khác không quay lại vì máy này còn số cũ', () => {
    // Máy này còn 10 vé nhưng chạm lần cuối 2026-11-01; máy kia đã chơi hết còn 3
    // và chạm ngày 2026-11-03. `Math.max` cũ trả 10 vé = in tiền.
    const local = profile({ tickets: 10, lastActiveDate: '2026-11-01' });
    const out = merge(local, { tickets: 3, lastActiveDate: '2026-11-03' });
    expect(out.profile.tickets).toBe(3);
    expect(out.trace).toContain('tickets:from_cloud');
  });

  it('sao đã mua đồ ở máy khác không bị máy này hoàn lại', () => {
    const local = profile({ stars: 50, lastActiveDate: '2026-11-02' });
    const out = merge(local, { stars: 12, lastActiveDate: '2026-11-03' });
    expect(out.profile.stars).toBe(12);
  });

  it('may mắn bằng ngày thì máy này thắng — bé đang ngồi ở đây', () => {
    const local = profile({ stars: 50, lastActiveDate: '2026-11-03' });
    const out = merge(local, { stars: 12, lastActiveDate: '2026-11-03' });
    expect(out.profile.stars).toBe(50);
  });

  it('chuỗi ngày theo máy hoạt động muộn hơn, không max (chuỗi thật đã đứt vẫn bị kéo sống)', () => {
    const local = profile({ streak: 9, lastActiveDate: '2026-10-20' });
    const out = merge(local, { streak: 2, lastActiveDate: '2026-11-03' });
    expect(out.profile.streak).toBe(2);
  });

  it('công tắc "mở hết bài" của ba mẹ theo máy đổi muộn hơn, không bật lại vĩnh viễn', () => {
    const local = profile({ unlockAllLessons: true, lastActiveDate: '2026-11-01' });
    const out = merge(local, { unlockAllLessons: false, lastActiveDate: '2026-11-03' });
    expect(out.profile.unlockAllLessons).toBe(false);
    expect(out.trace).toContain('unlock_all_lessons:from_cloud');
  });

  it('trang bị và avatar theo máy dùng gần nhất', () => {
    const local = profile({ avatarBase: 'bear', equipped: { hat: 'hat_ninja' }, lastActiveDate: '2026-11-01' });
    const out = merge(local, {
      avatarBase: 'fox',
      equipped: { hat: 'hat_cap' },
      lastActiveDate: '2026-11-03',
    });
    expect(out.profile.avatarBase).toBe('fox');
    expect(out.profile.equipped).toEqual({ hat: 'hat_cap' });
  });
});

describe('T41D — merge cloud sync: tiến độ là tập hợp, không phải một chiều', () => {
  it('bài đã hoàn thành của hai máy được bù cho nhau và giữ thứ tự máy này', () => {
    const local = profile({ completedLessons: ['les-a', 'les-b'] });
    const out = merge(local, { completedLessons: ['les-b', 'les-c'] });
    expect(out.profile.completedLessons).toEqual(['les-a', 'les-b', 'les-c']);
    expect(out.trace).toContain('completed_lessons:cloud_added=1');
  });

  it('món đã mở khoá ở máy khác không biến mất khỏi tủ đồ', () => {
    const local = profile({ unlockedItems: ['item_a'] });
    const out = merge(local, { unlockedItems: ['item_b', 'item_c'] });
    expect(out.profile.unlockedItems).toEqual(['item_a', 'item_b', 'item_c']);
  });

  it('sao từng bài lấy cao hơn theo từng bài — luật cũ spread đè 3 sao của cloud bằng 2 sao local', () => {
    const local = profile({ lessonStars: { 'les-a': 2, 'les-b': 3 } });
    const out = merge(local, { lessonStars: { 'les-a': 3, 'les-c': 1 } });
    expect(out.profile.lessonStars).toEqual({ 'les-a': 3, 'les-b': 3, 'les-c': 1 });
  });

  it('rương đã mở ở máy khác không mở lại được lần hai', () => {
    const local = profile({ chestState: { 'top-toan': false, 'top-tieng-viet': true } });
    const out = merge(local, { chestState: { 'top-toan': true } });
    expect(out.profile.chestState).toEqual({ 'top-toan': true, 'top-tieng-viet': true });
    expect(out.trace).toContain('chest_state:cloud_claimed=1');
  });

  it('thành tích chu kỳ hàng tuần cũng là tập hợp', () => {
    const local = profile({ completedWeeklyChallenges: ['wk-1'] });
    const out = merge(local, { completedWeeklyChallenges: ['wk-2'] });
    expect(out.profile.completedWeeklyChallenges).toEqual(['wk-1', 'wk-2']);
  });

  it('khoá ngày mở rương lấy ngày muộn hơn để không mở lại rương hôm nay', () => {
    const local = profile({ dailyChestClaimedDate: '2026-11-01', lastActiveDate: '2026-11-03' });
    const out = merge(local, { dailyChestClaimedDate: '2026-11-03' });
    expect(out.profile.dailyChestClaimedDate).toBe('2026-11-03');
    expect(out.trace).toContain('daily_chest:from_cloud');
  });
});

describe('T41D — merge cloud sync: danh tính và tên', () => {
  it('id và lớp là của máy này, cloud không đổi được hồ sơ', () => {
    const local = profile({ id: 'child_1', grade: 1 });
    const out = merge(local, { id: 'child_9', grade: 5, lastActiveDate: '2026-12-01' });
    expect(out.profile.id).toBe('child_1');
    expect(out.profile.grade).toBe(1);
  });

  it('máy mới chưa đặt tên thì lấy tên thật trên cloud, không đè tên khởi tạo', () => {
    const local = profile({ name: DEFAULT_CHILD_PROFILE.name, lastActiveDate: '2026-11-03' });
    const out = merge(local, { name: 'Bé Gạo', lastActiveDate: '2026-10-01' });
    expect(out.profile.name).toBe('Bé Gạo');
    expect(out.trace).toContain('name:from_cloud');
  });

  it('ba mẹ đã đổi tên trên máy này thì cloud không kéo về tên cũ', () => {
    const local = profile({ name: 'Bé Gạo' });
    const out = merge(local, { name: DEFAULT_CHILD_PROFILE.name });
    expect(out.profile.name).toBe('Bé Gạo');
  });
});

describe('T41D — hàng rào dữ liệu demo', () => {
  it('số bịa của hồ sơ demo trên cloud không chảy vào hồ sơ thật của bé', () => {
    const local = profile({ xp: 30, stars: 4, completedLessons: ['les-a'], lastActiveDate: '2026-11-01' });
    const out = merge(local, {
      isDemoData: true,
      xp: 9999,
      stars: 999,
      completedLessons: ['les-demo-1', 'les-demo-2'],
      lastActiveDate: '2026-11-03',
    });
    expect(out.profile.xp).toBe(30);
    expect(out.profile.stars).toBe(4);
    expect(out.profile.completedLessons).toEqual(['les-a']);
    expect(out.trace).toEqual(['cloud_is_demo:ignored']);
  });

  it('máy đang mang dữ liệu demo thì hồ sơ thật trên cloud thắng và cờ demo tắt', () => {
    const local = profile({ isDemoData: true, xp: 9999, lastActiveDate: '2026-10-01' });
    const out = merge(local, { isDemoData: false, xp: 120, completedLessons: ['les-a'] });
    expect(out.profile.isDemoData).toBe(false);
    expect(out.profile.xp).toBe(120);
    expect(out.profile.completedLessons).toEqual(['les-a']);
    expect(out.trace).toContain('local_is_demo:replaced_by_cloud');
  });
});

describe('T41D — merge analytics', () => {
  it('hai máy cùng học hôm nay thì phút hôm nay được cộng, không lấy một chiều', () => {
    const local = analytics({ minutesToday: 12, todayDate: '2026-11-03' });
    const out = mergeCloudState({
      local: profile(),
      localAnalytics: local,
      cloudProfile: { lastActiveDate: '2026-11-03' },
      cloudAnalytics: { minutesToday: 8, todayDate: '2026-11-03' },
    });
    expect(out.analytics.minutesToday).toBe(20);
    expect(out.analytics.todayDate).toBe('2026-11-03');
  });

  it('ngày khác nhau thì lấy ngày mới, ngày cũ không cộng vào hôm nay', () => {
    const local = analytics({ minutesToday: 30, todayDate: '2026-11-01' });
    const out = mergeCloudState({
      local: profile(),
      localAnalytics: local,
      cloudProfile: { lastActiveDate: '2026-11-03' },
      cloudAnalytics: { minutesToday: 5, todayDate: '2026-11-03' },
    });
    expect(out.analytics.minutesToday).toBe(5);
    expect(out.analytics.todayDate).toBe('2026-11-03');
  });

  it('điểm kỹ năng theo bên luyện muộn hơn, kỹ năng chỉ có trên cloud vẫn còn', () => {
    const local = analytics({
      skillMastery: {
        'sk-add': mastery('sk-add', { attempts: 4, lastPracticed: '2026-11-01T00:00:00.000Z' }),
        'sk-old': mastery('sk-old'),
      },
    });
    const out = mergeCloudState({
      local: profile(),
      localAnalytics: local,
      cloudProfile: { lastActiveDate: '2026-11-03' },
      cloudAnalytics: {
        skillMastery: {
          'sk-add': mastery('sk-add', { attempts: 9, lastPracticed: '2026-11-03T00:00:00.000Z' }),
          'sk-new': mastery('sk-new'),
        },
      },
    });
    expect(out.analytics.skillMastery['sk-add'].attempts).toBe(9);
    expect(out.analytics.skillMastery['sk-old']).toBeDefined();
    expect(out.analytics.skillMastery['sk-new']).toBeDefined();
    expect(out.trace).toContain('skill_mastery:cloud_keys=1');
  });

  it('lỗi ghi của hai máy gộp theo dấu thời gian và vẫn giữ trần 20 bản ghi', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      questionId: `q-local-${i}`,
      subject: 'toan' as const,
      prompt: `Câu ${i}`,
      timestamp: `2026-10-${String(31 - i).padStart(2, '0')}T00:00:00.000Z`,
    }));
    const local = analytics({ recentErrors: many });
    const out = mergeCloudState({
      local: profile(),
      localAnalytics: local,
      cloudProfile: { lastActiveDate: '2026-11-03' },
      cloudAnalytics: {
        recentErrors: [
          many[0],
          { questionId: 'q-cloud-1', subject: 'tieng-viet', prompt: 'Con mèo', timestamp: '2026-11-03T01:00:00.000Z' },
        ],
      },
    });
    expect(out.analytics.recentErrors.length).toBe(20);
    expect(out.analytics.recentErrors.some((e) => e.questionId === 'q-cloud-1')).toBe(true);
    // bản trùng (same id + cùng dấu thời gian) chỉ xuất hiện một lần
    expect(out.analytics.recentErrors.filter((e) => e.questionId === 'q-local-0').length).toBe(1);
  });
});

describe('T41D — bất biến của phép hợp', () => {
  it('cùng đầu vào cho cùng đầu ra (không đọc đồng hồ, không xáo)', () => {
    const local = profile({ xp: 10, completedLessons: ['les-b'], lastActiveDate: '2026-11-02' });
    const cloud = { xp: 40, completedLessons: ['les-a'], unlockedItems: ['item_z'], lastActiveDate: '2026-11-03' };
    const first = mergeCloudState({ local, localAnalytics: analytics(), cloudProfile: cloud, cloudAnalytics: null });
    const second = mergeCloudState({ local, localAnalytics: analytics(), cloudProfile: cloud, cloudAnalytics: null });
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('không sửa hồ sơ và analytics của máy này (caller vẫn giữ bản gốc để so sánh)', () => {
    const local = profile({ xp: 10, stars: 3, completedLessons: ['les-a'] });
    const localAnalytics = analytics({ totalCorrect: 5 });
    mergeCloudState({
      local,
      localAnalytics,
      cloudProfile: { xp: 99, stars: 99, completedLessons: ['les-z'], lessonStars: { 'les-a': 3 } },
      cloudAnalytics: { totalCorrect: 77 },
    });
    expect(local.xp).toBe(10);
    expect(local.stars).toBe(3);
    expect(local.completedLessons).toEqual(['les-a']);
    expect(localAnalytics.totalCorrect).toBe(5);
  });

  it('vết hợp nhất chỉ nêu tên trường và chiều thắng, không chứa nội dung bài làm của bé', () => {
    const out = mergeCloudState({
      local: profile({ lessonStars: { 'les-a': 1 } }),
      localAnalytics: analytics({ recentErrors: [{ questionId: 'q1', subject: 'toan', prompt: '2 + 2', timestamp: 'x' }] }),
      cloudProfile: {
        lastActiveDate: '2026-11-03',
        stars: 20,
        completedLessons: ['les-b'],
        lessonStars: { 'les-a': 3 },
        name: 'Bé Gạo',
        dailyChestClaimedDate: '2026-11-03',
      },
      cloudAnalytics: { minutesToday: 4, todayDate: '2026-11-03' },
    });
    expect(out.trace.length).toBeGreaterThan(0);
    for (const entry of out.trace) {
      expect(entry).toMatch(/^[a-z_]+:[a-z_0-9]+(=[0-9]+)?$/);
    }
  });

  it('hồ sơ cloud rác (số âm, danh sách lẫn kiểu khác) không làm hỏng dữ liệu của bé', () => {
    const local = profile({ stars: 8, completedLessons: ['les-a'] });
    const out = merge(local, {
      stars: -50,
      xp: 'many',
      completedLessons: ['les-b', 42, null],
      lessonStars: { 'les-a': -1 },
      lastActiveDate: '2026-11-03',
    });
    expect(out.profile.stars).toBe(8);
    expect(out.profile.xp).toBe(local.xp);
    expect(out.profile.completedLessons).toEqual(['les-a', 'les-b']);
    expect(out.profile.lessonStars['les-a']).toBeUndefined();
  });
});
