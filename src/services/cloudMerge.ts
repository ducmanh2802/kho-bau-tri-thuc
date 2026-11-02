import { DEFAULT_CHILD_PROFILE } from './storage';
import type { ChildProfile, LearningAnalytics, SkillMastery } from '../types';

/**
 * T41D — luật hợp nhất hồ sơ máy này với hồ sơ đang nằm trên cloud.
 *
 * Lý do tồn tại: phép hợp cũ nằm trong `cloudSync.ts` và coi `Math.max` là
 * "merge thông minh" cho **mọi** số. Với `stars`/`tickets` — những trường bị
 * **trừ** khi tiêu (`storage.ts` `buyShopItem`, `drawSticker`) — max không phải
 * là hợp nhất mà là in tài nguyên: máy A còn 10 vé, máy B đã chơi hết còn 3,
 * max trả về 10 vé. Các trường còn lại (`unlockedItems`, `chestState`,
 * `lessonStars`, `analytics`) thì lại bị ghi đè một chiều nên tiến độ của máy
 * kia biến mất. Vì vậy mỗi trường cần luật riêng theo bản chất của nó, và luật
 * đó phải đọc được/test được mà không cần Firestore.
 *
 * Module thuần: không `Date.now()`, không `Math.random()`, không đọc
 * `localStorage` ⇒ cùng đầu vào luôn ra cùng đầu ra (bất biến §2 của AGENTS).
 */

/** Mã quyết định, chỉ tên trường + chiều thắng — không bao giờ chứa nội dung bài làm của bé. */
export type MergeTrace = string[];

export interface CloudMergeOutcome {
  profile: ChildProfile;
  analytics: LearningAnalytics;
  trace: MergeTrace;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback;
}

function asText(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asRecord<T>(value: unknown): Record<string, T> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, T>) : {};
}

/**
 * Hai danh sách cùng là sự thật: hợp và giữ thứ tự cục bộ trước để các chỗ đọc
 * "món mới mở gần nhất" không đổi hành vi; bản cloud chỉ bù phần máy này chưa có.
 */
function unionKeepingOrder(local: string[], cloud: string[], field: string, trace: MergeTrace): string[] {
  const missing = cloud.filter((item) => !local.includes(item));
  if (missing.length > 0) trace.push(`${field}:cloud_added=${missing.length}`);
  return missing.length === 0 ? local : [...local, ...missing];
}

/**
 * Số chỉ tăng (XP, tổng phút, tổng câu): max là luật đúng vì không có đường nào
 * trừ đi. Trả về đối thắng để trace nêu được ai đưa ra con số.
 */
function maxCounter(local: number, cloud: number, field: string, trace: MergeTrace): number {
  if (cloud > local) trace.push(`${field}:cloud_higher`);
  return Math.max(local, cloud);
}

/**
 * Số có tăng lẫn giảm (sao, vé, ngọc, chuỗi ngày, khoá điều khiển của ba mẹ):
 * ai **hoạt động muộn hơn** là ai đang giữ giá trị thật, vì bên đó đã trừ đi rồi.
 * Lấy max ở đây là in tài nguyên — lỗi gốc của T41D.
 */
function laterState<T>(localValue: T, cloudValue: T, field: string, trace: MergeTrace, cloudWins: boolean): T {
  if (cloudWins) {
    if (cloudValue !== localValue) trace.push(`${field}:from_cloud`);
    return cloudValue;
  }
  return localValue;
}

function starRecord(local: Record<string, number>, cloud: Record<string, number>, trace: MergeTrace): Record<string, number> {
  const merged: Record<string, number> = { ...local };
  for (const [lessonId, cloudStars] of Object.entries(cloud)) {
    const stars = asNumber(cloudStars);
    if (stars <= 0) continue;
    const known = asNumber(merged[lessonId]);
    // Hợp theo từng bài: cloud từng đạt 3 sao thì máy này chơi lại được 2 sao
    // không được phép kéo bài đó về 2 sao (luật cũ là spread một chiều).
    if (stars > known) {
      merged[lessonId] = stars;
      trace.push('lesson_stars:cloud_higher');
    }
  }
  return merged;
}

function chestRecord(local: Record<string, boolean>, cloud: Record<string, boolean>, trace: MergeTrace): Record<string, boolean> {
  const merged: Record<string, boolean> = { ...local };
  let revived = 0;
  for (const [chestId, opened] of Object.entries(cloud)) {
    if (opened && !merged[chestId]) {
      merged[chestId] = true;
      revived += 1;
    }
  }
  // Rương đã mở ở bất kỳ máy nào phải coi là đã mở: cho phép false thắng là
  // cho bé mở lại cùng một rương lấy lần hai phần thưởng.
  if (revived > 0) trace.push(`chest_state:cloud_claimed=${revived}`);
  return merged;
}

function masteryRecord(
  local: Record<string, SkillMastery>,
  cloud: Record<string, SkillMastery>,
  trace: MergeTrace
): Record<string, SkillMastery> {
  const merged: Record<string, SkillMastery> = { ...local };
  for (const [skillId, cloudMastery] of Object.entries(cloud)) {
    if (!cloudMastery || typeof cloudMastery !== 'object') continue;
    const localMastery = merged[skillId];
    const cloudNewer =
      !localMastery || (cloudMastery.lastPracticed || '') > (localMastery.lastPracticed || '');
    if (cloudNewer) merged[skillId] = cloudMastery;
  }
  const onlyCloud = Object.keys(cloud).filter((id) => !(id in local)).length;
  if (onlyCloud > 0) trace.push(`skill_mastery:cloud_keys=${onlyCloud}`);
  return merged;
}

/**
 * Bộ đếm ngày hôm nay của hai máy là hai khoảng thời gian thật khác nhau trong
 * cùng một ngày ⇒ cộng. Ngày khác ngày ⇒ ngày mới hơn thắng, ngày cũ không được
 * cộng vào "hôm nay".
 */
function minutesToday(
  local: Pick<LearningAnalytics, 'minutesToday' | 'todayDate'>,
  cloud: Partial<Pick<LearningAnalytics, 'minutesToday' | 'todayDate'>>,
  trace: MergeTrace
): { minutesToday: number; todayDate: string } {
  const cloudTodayDate = asText(cloud.todayDate);
  if (cloudTodayDate === undefined) {
    // Cloud không có analytics theo ngày ⇒ giữ nguyên máy này.
    return { minutesToday: asNumber(local.minutesToday), todayDate: local.todayDate };
  }
  if (cloudTodayDate === local.todayDate) {
    const sum = asNumber(local.minutesToday) + asNumber(cloud.minutesToday);
    if (sum !== asNumber(local.minutesToday)) trace.push('minutes_today:summed');
    return { minutesToday: sum, todayDate: local.todayDate };
  }
  if (cloudTodayDate > local.todayDate) {
    trace.push('minutes_today:from_cloud');
    return { minutesToday: asNumber(cloud.minutesToday), todayDate: cloudTodayDate };
  }
  return { minutesToday: asNumber(local.minutesToday), todayDate: local.todayDate };
}

/**
 * Hồ sơ demo (`src/services/demoSeed.ts`) là số **bịa** để ba mẹ xem thử báo cáo.
 * Types ghi rõ nó "must never be presented as real learner progress", nên nó
 * không được chảy vào một hồ sơ thật qua ngã cloud sync — `Math.max` cũ làm đúng
 * điều cấm đó: seed demo trên máy khác rồi đăng nhập là XP/Sao thật của bé nhảy
 * lên số không ai học mà có.
 */
export function isDemoCloudProfile(cloudProfile: Record<string, unknown>): boolean {
  return cloudProfile.isDemoData === true;
}

export interface CloudMergeInput {
  local: ChildProfile;
  localAnalytics: LearningAnalytics;
  cloudProfile: Record<string, unknown> | null;
  cloudAnalytics: Record<string, unknown> | null;
}

export function mergeCloudState({
  local,
  localAnalytics,
  cloudProfile: rawCloudProfile,
  cloudAnalytics: rawCloudAnalytics
}: CloudMergeInput): CloudMergeOutcome {
  const trace: MergeTrace = [];
  const localIsDemo = local.isDemoData === true;

  if (!rawCloudProfile || typeof rawCloudProfile !== 'object') {
    return { profile: local, analytics: localAnalytics, trace: ['cloud_absent'] };
  }

  const cloud = rawCloudProfile as Partial<ChildProfile>;

  if (isDemoCloudProfile(rawCloudProfile) && !localIsDemo) {
    // Hồ sơ cloud là số bịa ⇒ không được góp bất kỳ con số nào vào hồ sơ thật.
    trace.push('cloud_is_demo:ignored');
    return { profile: local, analytics: localAnalytics, trace };
  }
  if (!isDemoCloudProfile(rawCloudProfile) && localIsDemo) {
    // Máy này đang mang số bịa còn cloud là hồ sơ thật: cloud thắng **toàn bộ**,
    // không max — max giữ lại 9999 XP không ai học mà có. Trường cloud không có
    // thì lấy mặc định khởi tạo, không lấy lại giá trị demo của máy này.
    trace.push('local_is_demo:replaced_by_cloud');
    return {
      profile: takeCloudProfile(local, cloud),
      analytics: mergeAnalytics(localAnalytics, rawCloudAnalytics, trace),
      trace,
    };
  }

  return {
    profile: coerceCloudProfile(local, cloud, trace),
    analytics: mergeAnalytics(localAnalytics, rawCloudAnalytics, trace),
    trace,
  };
}

function coerceCloudProfile(local: ChildProfile, cloud: Partial<ChildProfile>, trace: MergeTrace): ChildProfile {
  // "Máy nào chạm gần đây nhất" là đồng hồ duy nhất có trong hồ sơ; hai bên bằng
  // ngày thì máy này thắng vì bé đang ngồi ở đây.
  const cloudLastActive = asText(cloud.lastActiveDate) || '';
  const cloudWinsTheClock = cloudLastActive > (local.lastActiveDate || '');

  const merged: ChildProfile = {
    ...local,
    // Hồ sơ là của một bé trên một thiết bị: id/lớp không đổi theo cloud.
    id: local.id,
    grade: local.grade,
    // Tên: cloud thắng khi máy này chưa hề đổi tên (vẫn là tên nhà sản xuất).
    name: resolveName(local, cloud, trace),
    avatarBase: laterState(local.avatarBase, cloud.avatarBase ?? local.avatarBase, 'avatar', trace, cloudWinsTheClock),
    equipped: laterState(local.equipped, cloud.equipped ?? local.equipped, 'equipped', trace, cloudWinsTheClock),
    // XP chỉ tăng (mọi đường ghi là `profile.xp +=`), nên max là luật đúng.
    xp: maxCounter(asNumber(local.xp), asNumber(cloud.xp, local.xp), 'xp', trace),
    // Sao/vé/ngọc/chuỗi: có đường trừ ⇒ theo đồng hồ, không theo max. Giá trị cloud
    // không hợp lệ (âm, chuỗi) bị bỏ chứ không kéo hồ sơ của bé về 0.
    stars: laterState(local.stars, asNumber(cloud.stars, local.stars), 'stars', trace, cloudWinsTheClock),
    tickets: laterState(local.tickets, asNumber(cloud.tickets, local.tickets), 'tickets', trace, cloudWinsTheClock),
    gems: laterState(local.gems, asNumber(cloud.gems, local.gems), 'gems', trace, cloudWinsTheClock),
    streak: laterState(local.streak, asNumber(cloud.streak, local.streak), 'streak', trace, cloudWinsTheClock),
    unlockedItems: unionKeepingOrder(local.unlockedItems, asStringList(cloud.unlockedItems), 'unlocked_items', trace),
    completedLessons: unionKeepingOrder(local.completedLessons, asStringList(cloud.completedLessons), 'completed_lessons', trace),
    completedWeeklyChallenges: unionKeepingOrder(
      local.completedWeeklyChallenges,
      asStringList(cloud.completedWeeklyChallenges),
      'weekly_challenges',
      trace
    ),
    lessonStars: starRecord(local.lessonStars, asRecord<number>(cloud.lessonStars), trace),
    chestState: chestRecord(local.chestState, asRecord<boolean>(cloud.chestState), trace),
    // Công tắc của ba mẹ là **trạng thái điều khiển**, không phải tiến độ: bên
    // thay đổi muộn hơn mới là ý định hiện tại. OR một chiều sẽ bật lại khoá
    // "mở hết bài" mà ba mẹ vừa tắt trên máy khác.
    unlockAllLessons: laterState(
      local.unlockAllLessons,
      typeof cloud.unlockAllLessons === 'boolean' ? cloud.unlockAllLessons : local.unlockAllLessons,
      'unlock_all_lessons',
      trace,
      cloudWinsTheClock
    ),
    lastActiveDate: (cloudLastActive > (local.lastActiveDate || '') ? cloudLastActive : local.lastActiveDate) || '',
    dailyChestClaimedDate: (() => {
      const cloudDate = asText(cloud.dailyChestClaimedDate);
      const localDate = asText(local.dailyChestClaimedDate);
      if (cloudDate && cloudDate > (localDate || '')) {
        trace.push('daily_chest:from_cloud');
        return cloudDate;
      }
      return local.dailyChestClaimedDate;
    })(),
    isDemoData: local.isDemoData,
  };

  return merged;
}

/**
 * Hồ sơ máy này đang là dữ liệu demo ⇒ không có quyền "góp" số vào hồ sơ thật
 * kéo từ cloud về. Lấy cloud làm chuẩn, trường nào cloud thiếu thì về mặc định
 * khởi tạo chứ không về con số bịa đang nằm trên máy.
 */
function takeCloudProfile(local: ChildProfile, cloud: Partial<ChildProfile>): ChildProfile {
  const base = DEFAULT_CHILD_PROFILE;
  return {
    ...base,
    equipped: cloud.equipped ?? { ...base.equipped },
    unlockedItems: cloud.unlockedItems ? asStringList(cloud.unlockedItems) : [...base.unlockedItems],
    completedLessons: cloud.completedLessons ? asStringList(cloud.completedLessons) : [...base.completedLessons],
    completedWeeklyChallenges: cloud.completedWeeklyChallenges
      ? asStringList(cloud.completedWeeklyChallenges)
      : [...base.completedWeeklyChallenges],
    lessonStars: asRecord<number>(cloud.lessonStars),
    chestState: asRecord<boolean>(cloud.chestState),
    // Hồ sơ vẫn là hồ sơ của máy này: danh tính không đổi theo nội dung.
    id: local.id,
    grade: local.grade,
    name: asText(cloud.name) || local.name,
    avatarBase: cloud.avatarBase ?? base.avatarBase,
    xp: asNumber(cloud.xp),
    stars: asNumber(cloud.stars),
    gems: asNumber(cloud.gems),
    tickets: asNumber(cloud.tickets),
    streak: asNumber(cloud.streak),
    lastActiveDate: asText(cloud.lastActiveDate) || local.lastActiveDate,
    dailyChestClaimedDate: asText(cloud.dailyChestClaimedDate),
    unlockAllLessons: cloud.unlockAllLessons === true,
    isDemoData: false,
  };
}

function resolveName(local: ChildProfile, cloud: Partial<ChildProfile>, trace: MergeTrace): string {
  const cloudName = asText(cloud.name);
  const localName = asText(local.name);
  if (!cloudName) return local.name;
  // Máy mới chưa đặt tên: đừng ghi tên khởi tạo "Bé Minh" của nhà sản xuất đè tên thật trên cloud.
  if (!localName || localName === DEFAULT_CHILD_PROFILE.name) {
    trace.push('name:from_cloud');
    return cloudName;
  }
  // Máy này đã tự đặt tên thì tên máy này là ý của ba mẹ, không bị cloud kéo về cũ.
  return local.name;
}

function mergeAnalytics(
  local: LearningAnalytics,
  rawCloudAnalytics: Record<string, unknown> | null,
  trace: MergeTrace
): LearningAnalytics {
  if (!rawCloudAnalytics || typeof rawCloudAnalytics !== 'object') return local;
  const cloud = rawCloudAnalytics as Partial<LearningAnalytics>;

  const counters = {
    totalMinutesSpent: maxCounter(local.totalMinutesSpent, asNumber(cloud.totalMinutesSpent), 'total_minutes', trace),
    totalQuestionsAnswered: maxCounter(
      local.totalQuestionsAnswered,
      asNumber(cloud.totalQuestionsAnswered),
      'total_questions',
      trace
    ),
    totalCorrect: maxCounter(local.totalCorrect, asNumber(cloud.totalCorrect), 'total_correct', trace),
    lessonsCompletedCount: maxCounter(
      local.lessonsCompletedCount,
      asNumber(cloud.lessonsCompletedCount),
      'lessons_count',
      trace
    ),
    gamesPlayedCount: maxCounter(local.gamesPlayedCount, asNumber(cloud.gamesPlayedCount), 'games_count', trace),
  };

  const day = minutesToday(local, cloud, trace);
  const skillMastery = masteryRecord(local.skillMastery, asRecord<SkillMastery>(cloud.skillMastery), trace);

  const cloudErrors = Array.isArray(cloud.recentErrors) ? cloud.recentErrors : [];
  const seen = new Set(local.recentErrors.map((entry) => `${entry.questionId}@${entry.timestamp}`));
  const freshErrors = cloudErrors.filter((entry) => entry && !seen.has(`${entry.questionId}@${entry.timestamp}`));
  if (freshErrors.length > 0) trace.push(`recent_errors:cloud_added=${freshErrors.length}`);
  // `recordQuestionAnswer` giữ danh sách **mới nhất ở đầu, trần 20**. Gộp hai máy
  // phải theo đúng thứ tự đó — nếu chỉ cộng vào đuôi thì bản của máy này đã đầy
  // 20 nên câu sai của máy kia bị vứt, và danh sách cần ôn mất bớt dữ liệu.
  const recentErrors = [...local.recentErrors, ...freshErrors]
    .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
    .slice(0, 20);

  return {
    ...local,
    ...counters,
    minutesToday: day.minutesToday,
    todayDate: day.todayDate,
    skillMastery,
    recentErrors,
  };
}
