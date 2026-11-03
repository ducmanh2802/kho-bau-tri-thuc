/**
 * T45C — "Giờ nghỉ cho mắt" là cổng an toàn, bé không được tự mở khoá.
 *
 * `ScreenTimeModal.tsx:29-32` nói rõ: **cố ý không cho Esc đóng**, vì "một lời
 * nhắc nghỉ mắt dễ bỏ qua là một đường vòng". Nhưng nút bên dưới lại là đường
 * vòng thật: `:68-74` gọi thẳng `onExtend`, còn `App.tsx:475-483` viết
 * `dailyLimitMinutes: settings.dailyLimitMinutes + 10` vào **cài đặt vĩnh viễn**.
 * ⇒ bé bấm nút có nhãn "Ba mẹ:" là tự nới giới hạn thêm 10 phút, mỗi lần bấm
 * thêm 10, và giá trị tràn ra ngoài danh mục 10/15/20/30/0 mà dashboard ba mẹ
 * (`ParentDashboardModal.tsx:1032`) vẫn chỉ render bốn con số đó.
 *
 * Hướng sửa bị khoá ở đây: lối "học thêm" phải **dẫn qua cổng phụ huynh**
 * (dashboard đã chặn bằng `!isAuthenticated ? (` ở dòng 341), không tự ghi settings.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');

describe('T45C — nới giờ học phải đi qua cổng xác nhận phụ huynh', () => {
  const app = read('src/App.tsx');
  const modal = read('src/components/parent/ScreenTimeModal.tsx');
  const dashboard = read('src/components/parent/ParentDashboardModal.tsx');

  it('App.tsx không còn tự cộng 10 phút vào giới hạn vĩnh viễn', () => {
    expect(app).not.toMatch(/dailyLimitMinutes:\s*settings\.dailyLimitMinutes\s*\+\s*10/);
  });

  it('ScreenTimeModal không được ghi cài đặt ba mẹ từ trong linh kiện', () => {
    expect(modal).not.toContain('saveParentSettings');
  });

  it('ScreenTimeModal đổi vai: xin ba mẹ (onAskParent), không tự cho phép (onExtend)', () => {
    expect(modal).not.toMatch(/\bonExtend\b/);
    expect(modal).toContain('onAskParent');
    // Nhãn cũ "Ba mẹ: Cho phép học thêm 10 phút" hứa một kết quả mà bé tự bấm là
    // có được ⇒ vừa sai với bé vừa vô hiệu cổng. Nhãn mới mô tả đúng hành động.
    expect(modal).toContain('Nhờ ba mẹ cho học thêm');
    expect(modal).not.toContain('Cho phép học thêm 10 phút');
  });

  it('App nối onAskParent vào dashboard ba mẹ (vùng đã có cổng xác nhận)', () => {
    const start = app.indexOf('<ScreenTimeModal');
    expect(start).toBeGreaterThan(-1);
    const block = app.slice(start, app.indexOf('/>', start) + 2);
    expect(block).toContain('onAskParent');
    expect(block).toContain('setIsParentModalOpen(true)');
    expect(block).not.toContain('saveParentSettings');
  });

  it('dashboard vẫn chặn toàn bộ bảng điều khiển sau cổng !isAuthenticated (chốt thật, không phải chuỗi dekor)', () => {
    expect(dashboard).toContain('{!isAuthenticated ? (');
  });

  it('lời nhắc nghỉ mắt vẫn không cho Esc thoát (giữ bất biến cũ của T45C)', () => {
    expect(modal).not.toMatch(/addEventListener\(\s*['"]keydown['"]/);
    expect(modal).toContain('Deliberately NO Escape-to-dismiss');
  });
});
