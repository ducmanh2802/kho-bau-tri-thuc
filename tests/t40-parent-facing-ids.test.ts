import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { StorageService, STORAGE_SCHEMA_VERSION } from '../src/services/storage';
import { normalizeReadingSkillId } from '../src/services/readingEngine';
import { humanizeReward, rewardNameForToken, rewardTypeLabel } from '../src/services/rewardLabels';
import type { RewardHistoryEntry } from '../src/types';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

if (typeof globalThis.localStorage === 'undefined') {
  let store: Record<string, string> = {};
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      store = {};
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

/** Chuỗi trông như mã máy: `vn-les-1`, `catch_letters_t2`, `rf_rf_word_recognition`. */
const ID_LIKE = /[a-z0-9]+(?:[_-][a-z0-9]+)+/;

beforeEach(() => {
  localStorage.clear();
});

describe('T40 — id kỹ năng đọc', () => {
  it('normalizeReadingSkillId không còn nhân đôi tiền tố rf_', () => {
    expect(normalizeReadingSkillId('RF-WORD-RECOGNITION')).toBe('rf_word_recognition');
    expect(normalizeReadingSkillId('rf_word_recognition')).toBe('rf_word_recognition');
    expect(normalizeReadingSkillId('RF-READING-COMPREHENSION')).toBe('rf_reading_comprehension');
  });

  it('chuẩn hoá hai lần vẫn cho cùng một khoá', () => {
    const once = normalizeReadingSkillId('RF-PHRASE-FLUENCY');
    expect(normalizeReadingSkillId(once)).toBe(once);
    expect(once.startsWith('rf_rf_')).toBe(false);
  });

  it('migration P43-v1 gộp khoá rf_rf_* của dữ liệu cũ về rf_*', () => {
    localStorage.setItem(
      'kho_bau_learning_os_store',
      JSON.stringify({
        schemaVersion: 'P42-v3',
        knowledgeStates: {
          rf_rf_word_recognition: {
            skillId: 'rf_rf_word_recognition',
            skillName: 'rf_rf_word_recognition',
            subject: 'tieng-viet',
            attemptCount: 6,
            correctCount: 4,
            lastPracticedAt: 1_700_000_000_000,
          },
          vn_alphabet_vowel: { skillId: 'vn_alphabet_vowel', skillName: 'vn_alphabet_vowel', attemptCount: 2 },
        },
        recentEvidences: [],
        processedEvidenceIds: [],
      })
    );

    const states = StorageService.getKnowledgeStates();
    expect(Object.keys(states)).toContain('rf_word_recognition');
    expect(states['rf_rf_word_recognition']).toBeUndefined();
    expect(states['rf_word_recognition'].attemptCount).toBe(6);
    expect(states['rf_word_recognition'].correctCount).toBe(4);
    expect(StorageService.getLearningOSStore().schemaVersion).toBe(STORAGE_SCHEMA_VERSION);
  });
});

describe('T40 — tên kỹ năng không bị đóng băng thành mã máy', () => {
  it('chữa tên ở lượt đọc cho bản ghi cũ bị đóng băng thành id', async () => {
    // T39 biến ngân hàng đề thành nạp chậm, nên `recordLearningEvidence` từng lưu
    // `skillName = skillId`. Catalogue attach ngay khi module này được import, vì
    // vậy chỉ cần dựng lại payload cũ trong localStorage và đọc lên.
    await import('../src/data/curriculum');
    localStorage.setItem(
      'kho_bau_learning_os_store',
      JSON.stringify({
        schemaVersion: STORAGE_SCHEMA_VERSION,
        knowledgeStates: {
          vn_alphabet_vowel: { skillId: 'vn_alphabet_vowel', skillName: 'vn_alphabet_vowel', attemptCount: 3 },
          rf_word_recognition: { skillId: 'rf_word_recognition', skillName: 'rf_word_recognition', attemptCount: 2 },
        },
        recentEvidences: [],
        processedEvidenceIds: [],
      })
    );

    const states = StorageService.getKnowledgeStates();
    expect(states['vn_alphabet_vowel'].skillName).not.toBe('vn_alphabet_vowel');
    expect(ID_LIKE.test(states['vn_alphabet_vowel'].skillName)).toBe(false);
    expect(states['rf_word_recognition'].skillName).toBe('Đọc lưu loát: Nhận Diện Từ');
    // Số liệu học tập không đổi khi chữa tên.
    expect(states['vn_alphabet_vowel'].attemptCount).toBe(3);
  });

  it('kỹ năng đọc có tên tiếng Việt trong catalogue', async () => {
    const { getAllSkills } = await import('../src/data/curriculum');
    const byId = new Map(getAllSkills().map((s) => [s.skillId, s.skillName]));
    expect(byId.get('rf_word_recognition')).toBe('Đọc lưu loát: Nhận Diện Từ');
    expect(byId.get('rf_reading_comprehension')).toContain('Hiểu Nội Dung Đoạn Đọc');
    // Kid's Box vẫn là kỹ năng tiếng Anh, không bị mất khi thêm bảng kỹ năng đọc.
    expect(byId.size).toBeGreaterThan(10);
  });
});

describe('T40 — nhãn phần thưởng cho màn Ba Mẹ', () => {
  const entry = (over: Partial<RewardHistoryEntry>): RewardHistoryEntry => ({
    date: '2026-11-02',
    type: 'stars',
    amount: 3,
    description: '',
    ...over,
  });

  it('RewardHistoryEntry.type luôn có nhãn tiếng Việt', () => {
    const labels: Record<string, string> = {
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
    for (const [type, expected] of Object.entries(labels)) {
      expect(rewardTypeLabel(type as RewardHistoryEntry['type'])).toBe(expected);
    }
    expect(Object.keys(labels)).toHaveLength(9);
    expect(rewardTypeLabel('loai_ky_la' as RewardHistoryEntry['type'])).toBe('phần thưởng');
  });

  it('thay mã máy bằng tên thật trong mô tả', () => {
    expect(humanizeReward(entry({ type: 'stars', description: 'Sao bài học vn-les-1', itemId: 'vn-les-1' })).text).toBe(
      'Sao bài học Chữ A, B, C thân thương'
    );
    expect(rewardNameForToken('catch_letters')).toBe('Bắt Chữ Cái Bay');
    expect(rewardNameForToken('ach_first_lesson')).toBe('Bước Chân Đầu Tiên');
    expect(rewardNameForToken('vn-chu-cai')).toBe('Bảng Chữ Cái & Âm Đầu');
    expect(rewardNameForToken('rf_rf_word_recognition')).toBe('Nhận Diện Từ');
    expect(rewardNameForToken('catch_letters_t2')).toBe('Bắt Chữ Cái Bay cấp 2');
    expect(rewardNameForToken('weekly-challenge-week-1')).toBe('1');
    expect(rewardNameForToken('st_dino_3')).not.toBeNull();
    expect(rewardNameForToken('khong_ton_tai_xxx')).toBeNull();
  });

  it('dịch cả "game"/"tier" và không để mã máy nào lọt', () => {
    const game = humanizeReward(
      entry({ type: 'xp', description: 'Game catch_letters tier 2 lần đầu', itemId: 'catch_letters_t2' })
    );
    expect(game.text).toBe('Trò chơi Bắt Chữ Cái Bay cấp 2 lần đầu');
    expect(game.label).toBe('điểm kinh nghiệm');

    const ach = humanizeReward(
      entry({ type: 'xp', description: 'Mở khóa thành tựu: ach_first_lesson, ach_viet_master', itemId: 'ach_first_lesson' })
    );
    expect(ach.text).toBe('Mở khóa thành tựu: Bước Chân Đầu Tiên, Bé Giỏi Tiếng Việt');
  });

  it('mô tả có mã không tra được thì đổi thành câu chung', () => {
    const shown = humanizeReward(entry({ type: 'chest', description: 'Rương monh_mo_di_dong', itemId: 'monh_mo_di_dong' }));
    expect(shown.text).toBe('Mở một rương kho báu');
    expect(shown.text).not.toMatch(ID_LIKE);
  });

  it('mục cũ lưu sẵn (trước T40) cũng hiển thị sạch', () => {
    const legacy = entry({
      type: 'shop_item',
      description: 'Mua áo choàng (20 sao) item_shop_9',
      itemId: 'item_shop_9',
    });
    expect(humanizeReward(legacy).text).not.toMatch(ID_LIKE);
    expect(humanizeReward(legacy).label).toBe('đồ vật');
  });

  it('sản xuất thật từ StorageService -> không còn id máy trong danh sách', () => {
    StorageService.completeLesson('vn-les-1', 'tieng-viet', 20, 3);
    StorageService.recordGamePlayed(15, 1, 'catch_letters');
    StorageService.recordWeeklyChallengeCompleted('weekly-challenge-week-1');
    StorageService.checkAchievements();

    const history = StorageService.getParentSettings().rewardHistory;
    expect(history.length).toBeGreaterThan(3);
    for (const e of history) {
      const shown = humanizeReward(e);
      expect(shown.text).not.toMatch(ID_LIKE);
      expect(shown.label).not.toMatch(ID_LIKE);
    }
    // Dữ liệu gốc vẫn giữ nguyên — chỉ tầng hiển thị được Việt hoá.
    expect(history.some((e) => e.description.includes('vn-les-1'))).toBe(true);
  });

  it('mã lý do DecisionEngine được dịch khi hiển thị', async () => {
    const { describeDecisionMode, describeReasonCode, describeReasonCodes, REASON_LABEL_VI } = await import(
      '../src/services/decisionLabels'
    );
    expect(describeDecisionMode('BALANCED')).toBe('cân bằng');
    expect(describeReasonCode('ACCURACY_BEFORE_SPEED')).toBe('chính xác trước, tốc độ sau');
    expect(describeReasonCodes(['NOT_PRACTICED_RECENTLY'])).toBe('chưa luyện kỹ năng này gần đây');
    expect(describeReasonCode('MA_LA_MOI')).toBe('MA_LA_MOI');
    // Không nhãn nào còn là SCREAMING_SNAKE.
    for (const label of Object.values(REASON_LABEL_VI)) {
      expect(label).not.toMatch(/^[A-Z][A-Z_]+$/);
    }
  });

  it('khối chẩn đoán không in enum hay mã lý do nguyên văn', async () => {
    const [{ DecisionEngine }, { LearningOS }] = await Promise.all([
      import('../src/services/decisionEngine'),
      import('../src/services/learningOS'),
    ]);
    const now = Date.parse('2026-11-02T12:00:00.000Z');
    const skillId = 'math_subtraction_10';
    const state = {
      ...LearningOS.createInitialKnowledgeState(skillId, 'Trừ trong phạm vi 10', 'toan'),
      status: 'NEEDS_REVIEW' as const,
      mastery: 40,
      accuracy: 45,
      recentAccuracy: 30,
      attemptCount: 6,
      correctCount: 3,
      lastPracticedAt: now - 3600000,
    };
    const output = DecisionEngine.decide({
      knowledgeMap: { [skillId]: state },
      recentEvidences: [],
      fatigue: {
        sessionStartTime: now,
        questionsAnsweredThisSession: 6,
        sessionErrorsCount: 3,
        consecutiveErrorsInSession: 0,
        isFatigued: false,
      },
      trackActions: [],
      recommendationHistory: [],
      competitionReadiness: null,
      kidboxUnitLabel: null,
      now,
    });
    const text = output.recommendations.map((r) => r.explanation.evidenceLines.join('\n')).join('\n');
    expect(text).toContain('Trạng thái: cần ôn lại');
    expect(text).toContain('Khả năng mở: mở được');
    expect(text).not.toMatch(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/);
  });

  it('nguồn: thẻ Home và dashboard không in mã nguyên văn, Home không nạp DecisionEngine', () => {
    const card = read('src/components/learning/NextBestActionCard.tsx');
    expect(card).toContain('describeReasonCode(code)');
    expect(card).not.toContain('Mã lý do (phụ huynh)');
    // decisionLabels chỉ có type + bảng nhãn: import nó không được kéo decisionEngine.
    expect(card).not.toContain("from '../../services/decisionEngine'");
    expect(read('src/services/decisionLabels.ts')).not.toContain("from './decisionEngine'");
    const engine = read('src/services/decisionEngine.ts');
    expect(engine).not.toContain('Mã lý do:');
    expect(engine).not.toContain('reasonCodes.join(');
    expect(engine).toContain('describeKnowledgeStatus(skillState.status)');
    expect(engine).toContain('describeAvailability(availability)');

    const dashboard = read('src/components/parent/ParentDashboardModal.tsx');
    expect(dashboard).toContain('describeReasonCodes(n.reasonCodes)');
    expect(dashboard).toContain('describeDecisionMode(decisionReport.mode)');
    expect(dashboard).not.toContain('n.reasonCodes.join(');
  });

  it('nguồn: không còn in type thô hay dòng "ID:" cho ba mẹ', () => {
    const dashboard = read('src/components/parent/ParentDashboardModal.tsx');
    expect(dashboard).not.toContain('>{entry.type}<');
    expect(dashboard).not.toContain('ID: {entry.itemId}');
    expect(dashboard).toContain('humanizeReward(entry)');
    expect(dashboard).toContain('data-testid="parent-reward-history"');

    const storage = read('src/services/storage.ts');
    expect(storage).not.toContain('Thử Thách Tuần ${challengeId}');

    const app = read('src/App.tsx');
    expect(app).toContain("import('./data/curriculum').catch(");
  });
});
