/**
 * T44/C — chuỗi máy / tiếng Anh còn lộ ra màn hình của bé (AGENTS.md §3: "Text
 * toàn tiếng Việt có dấu, câu ngắn"; tiền lệ: T36 Việt hoá chuỗi UI, T40 lộ id
 * máy trên dashboard ba mẹ).
 *
 * Bốn chỗ đo được trong đợt quét T44:
 * · `KidBoxParentPanel.tsx:264` in nguyên giá trị enum `READY` /
 *   `CONTENT_SOURCE_REQUIRED` của `getKidBoxContentReadiness()`
 *   (`src/data/kidBoxCurriculum.ts:138`);
 * · `SubjectScreen.tsx:500` hiển thị mã locale `British English · en-GB` cho bé;
 * · `ReadingFluencyScreen.tsx:954` `map[skillId] ?? skillId` in id kebab
 *   `RF-…` khi thiếu nhãn — trong khi `READING_SKILLS`
 *   (`src/data/readingTaxonomy.ts`) đã có sẵn `skillName` tiếng Việt;
 * · `englishIoe/index.ts` tuần 1–5 liệt kê chủ đề thuần Anh (`Colors`,
 *   `Numbers 1–10`, …) còn tuần 6–8 lại tiếng Việt ⇒ cùng một màn hình hai thứ
 *   tiếng.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { IOE_WEEKS } from '../src/data/englishIoe';
import { kidBoxContentStatusLabel, getKidBoxContentReadiness } from '../src/data/kidBoxCurriculum';
import { READING_SKILLS } from '../src/data/readingTaxonomy';

/** Có dấu tiếng Việt (không kể các ký tự chuẩn GDPT như ă ê ô … đã nằm trong dải này). */
const VI_DIACRITIC = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

/**
 * Ngữ pháp tiếng Anh **là nội dung cần dạy**, nên các mẫu câu vẫn giữ nguyên bản
 * Anh. Danh sách này tường minh: thêm chủ đề mới bằng tiếng Anh thuần mà không
 * nằm ở đây là test đỏ.
 */
const ENGLISH_TARGET_PATTERNS = ['I am', 'You are', 'He/She/It is', 'This is a…', 'It is a/an…', 'I have…'] as const;

describe('T44/C — nhãn tiếng Việt trên màn của bé', () => {
  it('chủ đề IOE có nhãn Việt (hoặc đúng là mẫu câu Anh cần dạy)', () => {
    const offenders = IOE_WEEKS.flatMap((w) => w.topics).filter(
      (topic) => !VI_DIACRITIC.test(topic) && !ENGLISH_TARGET_PATTERNS.includes(topic as (typeof ENGLISH_TARGET_PATTERNS)[number])
    );
    expect(offenders, 'chủ đề hiện thẳng cho phụ huynh phải có nhãn Việt đi trước').toEqual([]);
  });

  it('trạng thái nội dung KidBox dịch sang tiếng Việt', () => {
    expect(kidBoxContentStatusLabel('READY')).toBe('Đủ nội dung');
    expect(kidBoxContentStatusLabel('PARTIAL')).toBe('Đủ một phần');
    expect(kidBoxContentStatusLabel('CONTENT_SOURCE_REQUIRED')).toBe('Cần nguồn nội dung từ giáo viên');
  });

  it('nhãn trạng thái không bao giờ trùng giá trị enum', () => {
    const status = getKidBoxContentReadiness().status;
    const label = kidBoxContentStatusLabel(status);
    expect(label).not.toBe(status);
    expect(VI_DIACRITIC.test(label)).toBe(true);
  });

  it('mọi kỹ năng đọc đều có tên tiếng Việt trong taxonomy', () => {
    for (const skill of READING_SKILLS) {
      expect(VI_DIACRITIC.test(skill.skillName), `${skill.skillId} ⇒ "${skill.skillName}" không có dấu Việt`).toBe(true);
    }
  });

  describe('hợp đồng nguồn: không in id/mã locale ra màn bé', () => {
    const src = path.resolve(__dirname, '..', 'src');
    const read = (rel: string) => fs.readFileSync(path.join(src, rel), 'utf8');

    it('SubjectScreen: en-GB chỉ còn là tham số giọng đọc, không phải chữ hiện trên màn', () => {
      const text = read(path.join('components', 'subject', 'SubjectScreen.tsx'));
      expect(text).not.toContain('British English · en-GB');
      // `sound.speak(…, 'en-GB')` là locale của TTS — hợp lệ. Chuỗi hiển thị thì
      // không được chứa mã locale (đó chính là chỗ T44 bắt được).
      const linesWithCode = text
        .split(/\r?\n/)
        .filter((line) => line.includes('en-GB'))
        .map((line) => line.trim());
      expect(linesWithCode.length).toBeGreaterThan(0);
      for (const line of linesWithCode) {
        expect(line, `dòng này in mã locale ra UI: ${line}`).toMatch(/speak|lang|locale/);
      }
    });

    it('ReadingFluencyScreen không còn in nguyên skillId khi thiếu nhãn', () => {
      expect(read(path.join('components', 'reading', 'ReadingFluencyScreen.tsx'))).not.toMatch(/\?\?\s*skillId/);
    });

    it('KidBoxParentPanel dùng nhãn đã dịch, không in enum trần', () => {
      const text = read(path.join('components', 'parent', 'KidBoxParentPanel.tsx'));
      expect(text).toMatch(/kidBoxContentStatusLabel/);
      expect(text).not.toMatch(/<strong>\{contentSummary\.status\}<\/strong>/);
    });
  });
});
