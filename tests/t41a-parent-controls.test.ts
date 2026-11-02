/**
 * T41A — quyền kiểm soát của ba mẹ và luồng học phải nói đúng một sự thật.
 *
 * Trước đợt này, công tắc "Tắt phần thưởng" chỉ chặn dòng lịch sử
 * (`rewardHistory`) trong khi sao/XP/vé/sticker vẫn chảy vào túi bé — ba mẹ
 * tưởng mình đã khoá mà bé vẫn tiêu được. Nút "Mở tất cả bài học" thì đọc
 * profile trực tiếp nên không hề đổi nhãn. Màn kết quả bài học hứa
 * `lesson.starReward` dù lượt học lại chỉ được +5 XP.
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

// data/curriculum tự đăng ký catalogue vào StorageService (T39) — claimTopicChest
// cần nó để biết một chủ đề đã học đủ bài chưa.
import '../src/data/curriculum';
import { StorageService } from '../src/services/storage';
import { getTopicsBySubject } from '../src/data/curriculum';
import { xpForLevel } from '../src/services/levelEngine';
import { seededRandom } from '../src/services/questEngine';
import { QUEST_MAP } from '../src/data/questPool';
import type { SubjectType } from '../src/types';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

function setRewards(enabled: boolean) {
  StorageService.saveParentSettings({ ...StorageService.getParentSettings(), rewardsEnabled: enabled });
}

function snapshot() {
  const p = StorageService.getChildProfile();
  return { stars: p.stars, xp: p.xp, tickets: p.tickets, unlocked: p.unlockedItems.length };
}

/**
 * Quest hôm nay và các thành tựu được "đậu" sẵn: nếu không, mỗi lần
 * completeLesson/claim còn trao thêm sao/XP của nhiệm vụ hoặc phần thưởng mở
 * khoá thành tựu, và các con số kiểm tra thành ngẫu nhiên theo ngày.
 */
function parkQuests() {
  StorageService.saveDailyQuests(
    StorageService.getDailyQuests().map((q) => ({ ...q, completed: true, currentCount: q.targetCount }))
  );
  StorageService.saveAchievements(StorageService.getAchievements().map((a) => ({ ...a, unlocked: true })));
}

describe('T41A — completeLesson trả về phần thưởng THẬT', () => {
  beforeEach(() => {
    localStorage.clear();
    setRewards(true);
    parkQuests();
  });

  it('lần đầu cấp đủ XP/Sao/Vé và báo đúng con số đó', () => {
    const award = StorageService.completeLesson('t41a_lesson_1', 'toan' as SubjectType, 20, 3);
    expect(award).toEqual({ firstTime: true, xpAwarded: 20, starsAwarded: 3, ticketsAwarded: 1 });
    const p = StorageService.getChildProfile();
    expect(p.xp).toBe(20);
    expect(p.stars).toBe(3);
    expect(p.tickets).toBe(1);
    expect(p.completedLessons).toContain('t41a_lesson_1');
    expect(p.lessonStars['t41a_lesson_1']).toBe(3);
  });

  it('học lại chỉ +5 XP, không cấp lại Sao/Vé', () => {
    StorageService.completeLesson('t41a_lesson_2', 'toan' as SubjectType, 20, 3);
    const before = StorageService.getChildProfile();
    const retake = StorageService.completeLesson('t41a_lesson_2', 'toan' as SubjectType, 20, 3);
    expect(retake).toEqual({ firstTime: false, xpAwarded: 5, starsAwarded: 0, ticketsAwarded: 0 });
    const after = StorageService.getChildProfile();
    expect(after.xp).toBe(before.xp + 5);
    expect(after.stars).toBe(before.stars);
    expect(after.tickets).toBe(before.tickets);
    // Sao bài học không bị lượt sau ghi đè thành tích đầu tiên.
    expect(after.lessonStars['t41a_lesson_2']).toBe(3);
  });

  it('tắt thưởng: vẫn ghi nhận bài đã học nhưng không đổi tài nguyên nào', () => {
    setRewards(false);
    const before = snapshot();
    const award = StorageService.completeLesson('t41a_lesson_3', 'tieng-viet' as SubjectType, 20, 3);
    expect(award).toEqual({ firstTime: true, xpAwarded: 0, starsAwarded: 0, ticketsAwarded: 0 });
    const after = StorageService.getChildProfile();
    expect(after.completedLessons).toContain('t41a_lesson_3');
    expect(after.lessonStars['t41a_lesson_3']).toBe(3);
    expect(after.xp).toBe(before.xp);
    expect(after.stars).toBe(before.stars);
    expect(after.tickets).toBe(before.tickets);
    // Tiến trình cũng là dữ liệu học: bộ đếm vẫn tăng.
    expect(StorageService.getAnalytics().lessonsCompletedCount).toBe(1);
  });
});

describe('T41A — mọi đường vào tài nguyên đều nghe công tắc của ba mẹ', () => {
  beforeEach(() => {
    localStorage.clear();
    setRewards(true);
    parkQuests();
  });

  it('rương chủ đề: tắt thì không cộng sao và chưa được tính là đã mở', () => {
    const topic = getTopicsBySubject('toan' as SubjectType)[0];
    const profile = StorageService.getChildProfile();
    profile.completedLessons = [...topic.lessons.map((l) => l.id), 'extra_lesson'];
    StorageService.saveChildProfile(profile);

    setRewards(false);
    expect(StorageService.claimTopicChest(topic.id, 'toan' as SubjectType, 3)).toBe(0);
    expect(StorageService.getChildProfile().chestState[topic.id]).toBeUndefined();

    // Bật lại: rương vẫn còn đó vì tắt thưởng không được "ăn gian" lượt mở.
    setRewards(true);
    expect(StorageService.claimTopicChest(topic.id, 'toan' as SubjectType, 3)).toBe(3);
    expect(StorageService.getChildProfile().chestState[topic.id]).toBe(true);
  });

  it('rương ngày: tắt thì không cộng sao/XP và không khoá ngày hôm nay', () => {
    setRewards(false);
    const before = snapshot();
    expect(StorageService.claimDailyChest(10, 50)).toBe(false);
    const after = StorageService.getChildProfile();
    expect(after.stars).toBe(before.stars);
    expect(after.xp).toBe(before.xp);
    expect(after.dailyChestClaimedDate).toBeUndefined();

    setRewards(true);
    expect(StorageService.claimDailyChest(10, 50)).toBe(true);
  });

  it('gacha: tắt thì từ chối và không trừ vé', () => {
    const profile = StorageService.getChildProfile();
    profile.tickets = 5;
    StorageService.saveChildProfile(profile);
    setRewards(false);
    const res = StorageService.drawGacha(seededRandom(5));
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('rewards-off');
    expect(StorageService.getChildProfile().tickets).toBe(5);
  });

  it('shop: tắt thì không tiêu sao, không mở khoá món', () => {
    const profile = StorageService.getChildProfile();
    profile.stars = 500;
    profile.xp = xpForLevel(30);
    StorageService.saveChildProfile(profile);
    setRewards(false);
    const res = StorageService.buyShopItem('shirt_yellow');
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('rewards-off');
    const after = StorageService.getChildProfile();
    expect(after.stars).toBe(500);
    expect(after.unlockedItems).not.toContain('shirt_yellow');
  });

  it('quà level: tắt thì đánh dấu đã nhận, bật lại không nhận dồn', () => {
    const profile = StorageService.getChildProfile();
    profile.xp = xpForLevel(6);
    StorageService.saveChildProfile(profile);
    setRewards(false);
    const empty = StorageService.claimLevelRewards(seededRandom(3));
    expect(empty.claimed).toEqual([]);
    const before = snapshot();
    setRewards(true);
    const late = StorageService.claimLevelRewards(seededRandom(4));
    expect(late.claimed).toEqual([]);
    const after = StorageService.getChildProfile();
    expect(after.stars).toBe(before.stars);
    expect(after.tickets).toBe(before.tickets);
  });

  it('quest: tiến độ vẫn chạy khi tắt thưởng nhưng không trao sao', () => {
    const mathQuest = QUEST_MAP.get('quest_math')!;
    StorageService.saveDailyQuests([
      {
        id: mathQuest.id,
        title: mathQuest.title,
        type: mathQuest.type,
        targetCount: mathQuest.targetCount,
        currentCount: 0,
        rewardStars: mathQuest.rewardStars,
        rewardXp: mathQuest.rewardXp,
        completed: false,
      },
    ]);
    setRewards(false);
    const before = snapshot();

    // UI không được ăn mừng phần thưởng khi ba mẹ đã tắt.
    expect(StorageService.recordQuestEvent({ kind: 'lesson', subject: 'toan' as SubjectType, stars: 3 })).toEqual([]);
    const after = StorageService.getChildProfile();
    expect(after.stars).toBe(before.stars);
    expect(after.xp).toBe(before.xp);
    // Tiến độ nhiệm vụ và bộ đếm động lực vẫn ghi nhận: đó là dữ liệu học.
    expect(StorageService.getDailyQuests()[0].completed).toBe(true);
    expect(StorageService.getMotivationState().questsCompletedTotal).toBe(1);
    expect(StorageService.getParentSettings().rewardHistory).toHaveLength(0);
  });
});

describe('T41A — UI đọc phần thưởng thật và nối đúng luồng', () => {
  const app = read('src/App.tsx');
  const home = read('src/components/home/HomeScreen.tsx');
  const subject = read('src/components/subject/SubjectScreen.tsx');
  const player = read('src/components/learning/LessonPlayerModal.tsx');
  const shop = read('src/components/shop/AvatarShopScreen.tsx');
  const gacha = read('src/components/motivation/GachaMachineScreen.tsx');

  it('nút "Bài tiếp theo" của trang Chủ được App nối tới đúng bài', () => {
    expect(home).toContain('onOpenLesson(nextBestAction.subject, nextBestAction.lessonId)');
    expect(app).toContain('onOpenLesson={handleOpenLesson}');
    expect(app).toContain('autoOpenLessonId={autoOpenLessonId}');
    expect(subject).toContain('autoOpenLessonId');
    expect(subject).toContain('setActiveLesson(point.lesson)');
    // Id cũ phải bị xoá để không bật lại mỗi lần vào môn.
    expect(subject).toContain('onAutoLessonConsumed?.()');
  });

  it('"Vì sao gợi ý này?" mở tab Insight của bảng ba mẹ, không nhảy về trang Chủ', () => {
    expect(home).toContain("onOpenParent('insights')");
    expect(app).toContain('initialTab={parentInitialTab}');
  });

  it('màn kết quả bài học in số vừa cấp, không in cấu trúc bài', () => {
    expect(player).toContain('setLastAward(StorageService.completeLesson(');
    expect(player).toContain('+{lastAward.starsAwarded} Sao');
    expect(player).not.toContain('+{lesson.starReward} Sao');
    expect(player).not.toContain('+1 Vé Chơi');
    expect(player).toContain('data-testid="lesson-rewards-off"');
  });

  it('shop đi qua buyShopItem và gacha nói khi nghỉ chơi', () => {
    expect(shop).toContain('StorageService.buyShopItem(item.id)');
    expect(shop).not.toContain('unlockedItems: [...fresh.unlockedItems, item.id]');
    expect(gacha).toContain("result.reason === 'rewards-off'");
    expect(gacha).toContain('rewardsEnabled && profile.tickets >= 1');
  });

  it('đồng hồ thời gian dùng máy không đếm khi tab ẩn và không bị khởi động lại', () => {
    const screenTime = app.slice(app.indexOf('Screen time interval tracker'));
    expect(screenTime).toContain('if (document.hidden) return;');
    expect(screenTime).toContain('}, []);');
    expect(screenTime).not.toContain('[isScreenTimeAlertOpen]');
  });
});
