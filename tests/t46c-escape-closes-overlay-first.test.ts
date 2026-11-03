/**
 * T46C — `DEF-013`: Esc **thoát hẳn trò chơi** khi lớp phủ "Chọn Màn & Độ Khó" đang che bảng.
 *
 * `src/hooks/useModalHistory.ts:31-45` nghe `keydown` trên **`window`** — nằm ngoài cây
 * DOM của lớp phủ `absolute inset-0 z-50` (`src/components/games/GameModalWrapper.tsx:675`)
 * ⇒ Esc luôn đi thẳng tới `onExit` (`GameModalWrapper.tsx:202`), bỏ qua lớp phủ đang mở.
 * Bé (đặc biệt bé dùng bàn phím) bấm Esc để tắt bảng chọn màn thì mất luôn ván đang chơi.
 *
 * Đợt này: `useModalHistory(onExit, { overlayOpen, onCloseOverlay })`. Khi lớp phủ đang
 * mở, Esc **chỉ đóng lớp phủ** và **không** bóc entry history của modal (entry còn nguyên
 * để lần Esc sau mới thoát game — đúng khuôn dialog lồng nhau).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const hookSrc = read('src/hooks/useModalHistory.ts');
const wrapperSrc = read('src/components/games/GameModalWrapper.tsx');

const mod = await import('../src/hooks/useModalHistory');
function route(): (overlayOpen: boolean, hasCloseHandler: boolean) => boolean {
  const fn = (mod as unknown as Record<string, unknown>).shouldEscapeCloseOverlay;
  if (typeof fn !== 'function') {
    throw new Error('useModalHistory.ts phải export shouldEscapeCloseOverlay(overlayOpen, hasCloseHandler)');
  }
  return fn as (overlayOpen: boolean, hasCloseHandler: boolean) => boolean;
}

describe('T46C — Esc ưu tiên lớp phủ đang mở', () => {
  it('bảng chọn màn đang mở ⇒ Esc thuộc về lớp phủ', () => {
    expect(route()(true, true)).toBe(true);
  });

  it('không có lớp phủ ⇒ Esc vẫn thoát game (hành vi cũ, không nuốt phím)', () => {
    expect(route()(false, true)).toBe(false);
    expect(route()(false, false)).toBe(false);
  });

  it('lớp phủ mở nhưng nơi gọi không đưa lối đóng ⇒ Esc không bị mất (không có handler thì không chặn)', () => {
    expect(route()(true, false)).toBe(false);
  });

  it('hook nhận options và gọi quyết định này TRƯỚC khi đụng history.back()', () => {
    const escapeBranch = hookSrc.slice(hookSrc.indexOf("event.key === 'Escape'"), hookSrc.indexOf("window.addEventListener('popstate'"));
    expect(escapeBranch).toContain('shouldEscapeCloseOverlay');
    expect(escapeBranch.indexOf('shouldEscapeCloseOverlay')).toBeLessThan(escapeBranch.indexOf('history.back()'));
  });

  it('GameModalWrapper nối đúng nguồn trạng thái lớp phủ (showTierModal) vào hook', () => {
    const atCall = wrapperSrc.indexOf('useModalHistory(onExit');
    // T47A refactor: bảng chọn màn đi vào hook qua `escapeOverlayKind` chứ không còn là
    // `overlayOpen: showTierModal` trực tiếp — bất biến "trạng thái bảng chọn phải tới được Esc"
    // vẫn khoá, chỉ đổi chỗ khai báo.
    const wiring = wrapperSrc.slice(wrapperSrc.indexOf('escapeOverlayKind({'), atCall + 400);
    expect(wiring).toContain('tierPickerOpen: showTierModal');
    const call = wrapperSrc.slice(atCall, atCall + 400);
    expect(call).toContain('overlayOpen');
    expect(call).toContain('onCloseOverlay');
    expect(call).toContain('setShowTierModal(false)');
  });

  it('không dựng một listener keydown thứ hai cho lớp phủ (tránh Esc bắn đúp)', () => {
    expect((wrapperSrc.match(/addEventListener\(\s*'keydown'/g) ?? []).length).toBe(0);
  });

  it('hồi quy diện rộng: caller khác của useModalHistory không truyền options rỗng làm đổi hành vi', () => {
    const lesson = read('src/components/learning/LessonPlayerModal.tsx');
    const call = lesson.slice(lesson.indexOf('useModalHistory('), lesson.indexOf('useModalHistory(') + 120);
    // LessonPlayer không có lớp phủ chọn màn ⇒ vẫn một tham số
    expect(call).toMatch(/useModalHistory\([^,)]+[,)]/);
  });
});
