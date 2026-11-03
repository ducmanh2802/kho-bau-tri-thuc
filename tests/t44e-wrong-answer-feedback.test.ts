/**
 * T44/E — một lượt bị chặn phải có **lý do** bằng cả hai kênh: tiếng nói và chữ
 * trên màn hình (AGENTS.md §3: "mọi lượt đúng/sai có phản hồi âm thanh + hình
 * ảnh").
 *
 * Hai tầng lỗi đo được trong `src/components/subject/SubjectScreen.tsx`:
 *
 * 1. Nhánh `else` của `handleClaimChest` bật `sound.playWrong()` trần.
 *    `StorageService.claimTopicChest` (`src/services/storage.ts:1917`) trả 0 vì
 *    ba lý do khác nhau hẳn (đã mở rồi / chưa học đủ bài / kho dữ liệu chưa nạp)
 *    ⇒ bé nghe "tít" rồi không biết vì sao.
 * 2. Tầng này khiến tầng 1 **không bao giờ chạy**: nút bài học và nút rương mang
 *    `disabled={…}` khi bị khoá, nên cú chạm bị trình duyệt nuốt trước cả
 *    `onClick`. Rương khoá và bài khoá là hai phần tử bé chạm nhiều nhất trên bản
 *    đồ — chúng im lặng tuyệt đối (không tiếng, không chữ, không aria-label được
 *    đọc vì `disabled` loại nút khỏi cây khả năng tiếp cận).
 *
 * Luật của test: mọi đường "không được" đi qua `rejectTurn()` (đủ ba kênh
 * playWrong + speak + chữ), và hai nút khoá phải dùng `aria-disabled` chứ không
 * `disabled`.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.resolve(__dirname, '..', 'src', 'components', 'subject', 'SubjectScreen.tsx');
const SRC = fs.readFileSync(FILE, 'utf8');

function bodyOf(declaration: string): string {
  const start = SRC.indexOf(declaration);
  expect(start, `không tìm thấy "${declaration}" — hàm đã bị đổi tên?`).toBeGreaterThan(-1);
  const end = SRC.indexOf('\n  };', start);
  expect(end).toBeGreaterThan(start);
  return SRC.slice(start, end);
}

describe('T44/E — lượt bị chặn có giải thích bằng tiếng nói lẫn chữ', () => {
  it('rejectTurn phát đủ ba kênh: bíp sai + lời nói + chữ trên màn hình', () => {
    const helper = bodyOf('const rejectTurn = ');
    expect(helper).toContain('sound.playWrong()');
    expect(helper).toMatch(/sound\.speak\(message\)/);
    expect(helper).toMatch(/setHint\(message\)/);
  });

  it('không còn playWrong trần trong hai hàm xử lý chạm', () => {
    for (const declaration of ['const handleClaimChest = ', 'const handleLessonClick = ']) {
      const body = bodyOf(declaration);
      expect(body, `${declaration} gọi sound.playWrong() trực tiếp ⇒ bé chỉ nghe bíp`).not.toContain(
        'sound.playWrong()'
      );
      expect(body).toContain('rejectTurn(');
    }
  });

  it('rương phân biệt đủ ba lý do không mở được', () => {
    const body = bodyOf('const handleClaimChest = ');
    expect(body).toContain('đã mở rồi');
    expect(body).toContain('vẫn còn khoá');
    expect(body).toContain('tắt phần thưởng');
    expect(body).toMatch(/starsAwarded > 0/);
    expect(body).toContain('sound.playLevelUp()');
    expect(body).toContain('onProfileUpdate()');
  });

  it('bài bị khoá nói cho bé biết phải học bài trước', () => {
    const body = bodyOf('const handleLessonClick = ');
    expect(body).toMatch(/rejectTurn\(`Bài \$\{lesson\.title\} vẫn còn khoá/);
  });

  it('nút khoá dùng aria-disabled để cú chạm còn tới được handler', () => {
    expect(SRC).toMatch(/aria-disabled=\{status\.isLocked\}/);
    expect(SRC).toMatch(/aria-disabled=\{!chestStatus\.canClaim\}/);
    expect(SRC).not.toMatch(/(?<!aria-)disabled=\{status\.isLocked\}/);
    expect(SRC).not.toMatch(/(?<!aria-)disabled=\{!chestStatus\.canClaim\}/);
  });

  it('bản tin hint hiện bằng chữ, có role=status và tự biến mất', () => {
    expect(SRC).toMatch(/data-testid="subject-hint"/);
    expect(SRC).toMatch(/role="status"/);
    expect(SRC).toMatch(/aria-live="polite"/);
    expect(SRC).toMatch(/\{hint && \(/);
    expect(SRC).toMatch(/window\.setTimeout\(\(\) => setHint\(null\)/);
    expect(SRC).toMatch(/window\.clearTimeout\(hintTimer\.current\)/);
  });
});
