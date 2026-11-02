import { GAMES_CATALOG } from '../data/gamesCatalog';
import { ACHIEVEMENT_MAP } from '../data/achievementCatalog';
import { QUEST_MAP } from '../data/questPool';
import { SHOP_MAP } from '../data/shopCatalog';
import { STICKER_MAP } from '../data/stickers';
import { READING_SKILLS } from '../data/readingTaxonomy';
import { findLessonById, findTopicById } from '../data/curriculum';
import type { RewardHistoryEntry } from '../types';

/**
 * T40 — "Lịch sử phần thưởng" trong bảng điều khiển Ba Mẹ hiển thị nguyên văn
 * `entry.description` do `storage.ts` sinh ra, mà các chuỗi đó gắn mã máy
 * (`vn-les-1`, `catch_letters_t2`, `ach_first_lesson`, `rf_rf_word_recognition`)
 * và cả nhãn tiếng Anh (`shop_item`, `level_reward`, `tier`). Bé lớp 1 và ba mẹ
 * không đọc được mã đó (§3 AGENTS.md). Resolution nằm ở tầng hiển thị — dữ liệu
 * vẫn giữ nguyên trong localStorage — nên mục cũ đã lưu cũng được sửa luôn.
 */

const GAME_MAP = new Map(GAMES_CATALOG.map((g) => [g.id, g.title]));

const TYPE_LABELS: Record<RewardHistoryEntry['type'], string> = {
  stars: 'sao',
  xp: 'điểm kinh nghiệm',
  tickets: 'vé',
  sticker: 'sticker',
  shop_item: 'đồ vật',
  level_reward: 'quà lên cấp',
  quest: 'nhiệm vụ',
  chest: 'rương',
  gacha: 'máy gắp',
};

/** Nhãn tiếng Việt cho loại phần thưởng; loại lạ (dữ liệu cũ) vẫn có chữ an toàn. */
export function rewardTypeLabel(type: RewardHistoryEntry['type'] | string): string {
  return TYPE_LABELS[type as RewardHistoryEntry['type']] ?? 'phần thưởng';
}

const GENERIC_TEXT: Record<RewardHistoryEntry['type'], string> = {
  stars: 'Nhận sao',
  xp: 'Nhận điểm kinh nghiệm',
  tickets: 'Nhận vé',
  sticker: 'Nhận sticker',
  shop_item: 'Đã mua một món quà',
  level_reward: 'Quà lên cấp độ',
  quest: 'Hoàn thành một nhiệm vụ',
  chest: 'Mở một rương kho báu',
  gacha: 'Nhận quà từ máy gắp',
};

/** Một chuỗi trông như mã máy: chữ/số nối nhau bằng `_` hoặc `-` (thí dụ `vn-les-1`). */
const ID_TOKEN = /[a-z0-9]+(?:[_-][a-z0-9]+)+/g;

/** `RF-WORD-RECOGNITION` → `rf_word_recognition` (khoá dùng trong Learning OS). */
const READING_KEY = new Map(
  READING_SKILLS.map((s) => [`rf_${s.skillId.toLowerCase().replace(/-/g, '_').replace(/^rf_/, '')}`, s.skillName])
);

function readingSkillName(token: string): string | null {
  return READING_KEY.get(`rf_${token.replace(/^(?:rf_)+/, '')}`) ?? null;
}

/** Tra tên tiếng Việt của một mã máy; `null` khi không thuộc catalogue nào. */
export function rewardNameForToken(token: string): string | null {
  const direct =
    GAME_MAP.get(token) ??
    ACHIEVEMENT_MAP.get(token)?.title ??
    QUEST_MAP.get(token)?.title ??
    SHOP_MAP.get(token)?.name ??
    STICKER_MAP.get(token)?.name ??
    findLessonById(token)?.title ??
    findTopicById(token)?.title ??
    null;
  if (direct) return direct;

  const gameTier = token.match(/^(.*)_t(\d+)$/);
  if (gameTier) {
    const title = GAME_MAP.get(gameTier[1]);
    if (title) return `${title} cấp ${gameTier[2]}`;
  }

  if (token === 'daily_chest') return 'rương kho báu';

  const level = token.match(/^level_(\d+)$/);
  if (level) return level[1];

  const weekly = token.match(/^weekly-challenge-week-(\d+)$/);
  if (weekly) return weekly[1];

  if (token.startsWith('rf_')) return readingSkillName(token);

  return null;
}

export interface HumanReward {
  /** Loại thưởng bằng tiếng Việt ('sao', 'vé', …) thay vì khoá máy `stars`. */
  label: string;
  /** Mô tả đã thay mã máy bằng tên tiếng Việt; không còn chuỗi id nào. */
  text: string;
}

/**
 * Đổi một mục lịch sử phần thưởng thành câu Ba Mẹ đọc được. Nếu vẫn còn mã máy
 * không tra được (nội dung mới chưa vào catalogue) thì thay bằng câu chung,
 * để đảm bảo screen tiếng Việt không bao giờ in id.
 */
export function humanizeReward(entry: RewardHistoryEntry): HumanReward {
  const label = rewardTypeLabel(entry.type);
  let text = entry.description ?? '';
  text = text.replace(ID_TOKEN, (token) => rewardNameForToken(token) ?? token);
  // Hai từ tiếng Anh trong mẫu câu cũ của storage: giữ đúng in hoa đầu câu.
  text = text.replace(/\bGame\b/, 'Trò chơi').replace(/\bgame\b/g, 'trò chơi');
  text = text.replace(/\bTier\b/, 'Cấp').replace(/\btier\b/g, 'cấp');
  if (text.match(ID_TOKEN)) text = GENERIC_TEXT[entry.type] ?? 'Nhận phần thưởng';
  return { label, text };
}
