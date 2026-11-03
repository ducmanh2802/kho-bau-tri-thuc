/**
 * T47A — đóng nốt `DEF-013`: `Esc` **vẫn thoát hẳn trò chơi** khi tấm che "Đang tạm dừng"
 * đang phủ lên bảng chơi.
 *
 * `GameModalWrapper.tsx:202` chỉ khai một lớp phủ với `useModalHistory`:
 * `overlayOpen: showTierModal`. Tấm che tạm dừng (`:556`, `isRealtime && isPaused`,
 * `absolute inset-0 z-20`) cũng che bảng y như vậy — nhưng `keydown` nghe trên `window`
 * (`useModalHistory.ts:53`) không biết nó tồn tại ⇒ Bé (hoặc người lớn) bấm `Esc` khi đang
 * tạm dừng bị đá ra khỏi màn chơi, **mất ván đang chơi** thay vì chỉ mở khoá.
 *
 * Đợt này: Esc đi theo **thứ tự lớp phủ từ trên xuống** — bảng "Chọn Màn & Độ Khó" (z-50)
 * trước, tấm che tạm dừng (z-20) sau; lần `Esc` kế tiếp (không còn lớp phủ nào) mới thoát.
 * Tấm che chỉ nhận Esc khi nơi gọi đưa được cách mở khoá: không có `onTogglePause` thì phím
 * phải đi tiếp tới `onExit`, tuyệt đối không nuốt phím của bé.
 *
 * Dòng **số 2** là dòng tái lập defect thật (thiếu khai báo lớp phủ trong options); các dòng
 * predicate sau đó khoá hành vi của helper mới `escapeOverlayKind`.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const wrapperSrc = read('src/components/games/GameModalWrapper.tsx');
const mod = await import('../src/hooks/useModalHistory');

type OverlayState = { tierPickerOpen: boolean; pauseVeilOpen: boolean };
function kind(): (s: OverlayState) => 'tierPicker' | 'pauseVeil' | null {
  const fn = (mod as unknown as Record<string, unknown>).escapeOverlayKind;
  if (typeof fn !== 'function') {
    throw new Error('useModalHistory.ts phải export escapeOverlayKind({ tierPickerOpen, pauseVeilOpen })');
  }
  return fn as (s: OverlayState) => 'tierPicker' | 'pauseVeil' | null;
}

const callSite = () => {
  const start = wrapperSrc.indexOf('useModalHistory(onExit');
  return wrapperSrc.slice(start, start + 700);
};

describe('T47A — Esc khi tấm che tạm dừng', () => {
  it('tấm che "Đang tạm dừng" chỉ dựng khi trò realtime và bé đang tạm dừng (characterization)', () => {
    expect(wrapperSrc).toContain('{isRealtime && isPaused && (');
    expect(wrapperSrc).toContain('data-testid="game-paused-veil"');
  });

  it('DEF-013 còn mở: options đưa cho useModalHistory phải kể tấm che tạm dừng, không chỉ bảng chọn màn', () => {
    const call = callSite();
    expect(call).toContain('overlayOpen');
    expect(call).toContain('onCloseOverlay');
    expect(call).toMatch(/overlayOpen:\s*[^,\n]*(topOverlay|pauseVeilOpen|isPaused)/);
    expect(call).toContain('onTogglePause');
  });

  it('"tấm che đang mở" chỉ đúng khi mở được khoá (thiếu onTogglePause ⇒ Esc đi tiếp tới onExit, không nuốt phím)', () => {
    expect(wrapperSrc).toMatch(/pauseVeilOpen\s*=\s*[^;]*isPaused[^;]*Boolean\(onTogglePause\)/);
  });

  it('Esc đóng theo thứ tự từ trên xuống: bảng chọn màn (z-50) trước tấm che (z-20)', () => {
    expect(kind()({ tierPickerOpen: true, pauseVeilOpen: true })).toBe('tierPicker');
    expect(kind()({ tierPickerOpen: true, pauseVeilOpen: false })).toBe('tierPicker');
  });

  it('chỉ có tấm che tạm dừng ⇒ Esc mở khoá, KHÔNG thoát ván', () => {
    expect(kind()({ tierPickerOpen: false, pauseVeilOpen: true })).toBe('pauseVeil');
  });

  it('không lớp phủ nào ⇒ Esc vẫn thoát game (lối thoát thật của bé không bị chặn)', () => {
    expect(kind()({ tierPickerOpen: false, pauseVeilOpen: false })).toBe(null);
  });

  it('wrapper dùng helper chung, không tự dựng listener keydown thứ hai (tránh Esc bắn đúp)', () => {
    expect(wrapperSrc).toContain('escapeOverlayKind({');
    expect((wrapperSrc.match(/addEventListener\(\s*'keydown'/g) ?? []).length).toBe(0);
  });
});
