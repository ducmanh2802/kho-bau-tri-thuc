import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MATH_TOPICS } from '../src/data/mathCurriculum';
import { getAllQuestions, getTopicsBySubject } from '../src/data/curriculum';

const here = dirname(fileURLToPath(import.meta.url));
const lessonPlayerSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'LessonPlayerModal.tsx'),
  'utf8'
);
const subjectScreenSrc = readFileSync(
  join(here, '..', 'src', 'components', 'subject', 'SubjectScreen.tsx'),
  'utf8'
);

describe('T57 — Thêm bài học tư duy nâng cao, nâng độ khó và bỏ level cơ bản', () => {
  describe('Thêm các bài học mới (Toán Tư Duy & Quy Luật)', () => {
    it('thêm chủ đề Toán Tư Duy & Quy Luật vào ngân hàng Toán với 3 bài học', () => {
      const mathTopics = getTopicsBySubject('toan');
      const tuDuyTopic = mathTopics.find((t) => t.id === 'math-tu-duy');
      expect(tuDuyTopic).toBeDefined();
      expect(tuDuyTopic!.title).toBe('Toán Tư Duy & Quy Luật');
      expect(tuDuyTopic!.lessons.length).toBe(3);

      const lessonIds = tuDuyTopic!.lessons.map((l) => l.id);
      expect(lessonIds).toEqual(['math-les-tudu-1', 'math-les-tudu-2', 'math-les-tudu-3']);
    });

    it('các bài học mới đều có ít nhất 10 câu hỏi và ít nhất 3 loại câu hỏi khác nhau', () => {
      const tuDuyTopic = MATH_TOPICS.find((t) => t.id === 'math-tu-duy');
      expect(tuDuyTopic).toBeDefined();

      for (const lesson of tuDuyTopic!.lessons) {
        expect(lesson.questions.length).toBeGreaterThanOrEqual(10);
        const types = new Set(lesson.questions.map((q) => q.type));
        expect(types.size).toBeGreaterThanOrEqual(3);
      }
    });

    it('các bài học mới có nhiều câu hỏi độ khó cao (difficulty 2 và 3)', () => {
      const tuDuyTopic = MATH_TOPICS.find((t) => t.id === 'math-tu-duy');
      const questions = tuDuyTopic!.lessons.flatMap((l) => l.questions);
      const hardQuestions = questions.filter((q) => q.difficulty >= 2);
      expect(hardQuestions.length).toBeGreaterThanOrEqual(20);

      const difficulty3Questions = questions.filter((q) => q.difficulty === 3);
      expect(difficulty3Questions.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Nâng độ khó bài học và bỏ level cơ bản trong LessonPlayerModal', () => {
    it('mặc định chế độ Nâng cao (challenge) và hỗ trợ chế độ Chuyên sâu (expert)', () => {
      expect(lessonPlayerSrc).toContain("useState<'standard' | 'challenge' | 'expert'>('challenge')");
      expect(lessonPlayerSrc).toContain("startRun('challenge')");
      expect(lessonPlayerSrc).toContain("startRun('expert')");
    });

    it('lọc bỏ câu hỏi độ khó 1 (cơ bản) để bé chỉ học câu vận dụng và nâng cao', () => {
      expect(lessonPlayerSrc).toContain('lesson.questions.filter((q) => q.difficulty >= 2)');
      expect(lessonPlayerSrc).toContain('lesson.questions.filter((q) => q.difficulty === 3)');
      expect(lessonPlayerSrc).toContain('Đã bỏ mức cơ bản');
    });

    it('thưởng thêm điểm XP khi hoàn thành chế độ Nâng cao (+50%) và Chuyên sâu (+100%)', () => {
      expect(lessonPlayerSrc).toContain("difficultyMode === 'expert'");
      expect(lessonPlayerSrc).toContain('Math.round(lesson.xpReward * 2)');
      expect(lessonPlayerSrc).toContain('Math.round(lesson.xpReward * 1.5)');
      expect(lessonPlayerSrc).toContain('+100% Chuyên sâu');
    });

    it('hiển thị huy hiệu độ khó câu hỏi (⚡ Thử thách Chuyên sâu / 🔥 Nâng cao Vận dụng)', () => {
      expect(lessonPlayerSrc).toContain('⚡ Thử thách Chuyên sâu');
      expect(lessonPlayerSrc).toContain('🔥 Nâng cao Vận dụng');
    });

    it('SubjectScreen hiển thị huy hiệu Độ khó: Nâng cao và Đã bỏ mức cơ bản', () => {
      expect(subjectScreenSrc).toContain('Độ khó: Nâng cao 🔥');
      expect(subjectScreenSrc).toContain('Đã bỏ mức cơ bản');
    });
  });
});
