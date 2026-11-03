/**
 * T45D — lớp phủ "Chọn Màn & Độ Khó" che bảng bằng CSS, còn `window` keydown thì
 * không che nổi: phím vẫn nộp đáp án sau lớp phủ.
 *
 * `GameModalWrapper.tsx:674` render lớp phủ `absolute inset-0 z-50` ⇒ **chuột**
 * không xuyên qua được, nhưng 10 trò lại nghe `window.addEventListener('keydown', …)`
 * và chỉ chặn bằng `if (stage.locked) return;`. `locked` (thời gian chờ sau một
 * lượt) không hề bật khi bảng đang che hoặc khi bé bấm Tạm dừng ⇒ bé gõ phím là
 * đáp án bị nộp âm thầm, mở lớp phủ ra đã thấy "Chưa đúng".
 *
 * KBT-ISSUE-43 đã dựng `isGameClockRunning(phase, locked, pausedByUser, overlayOpen)`
 * cho **đồng hồ** nhưng chưa ai dựng chốt cho **input**, và `overlayOpen` chỉ được
 * 4/30 trò nối vào (`onOverlayOpenChange`). Đợt này thêm `isGameInputBlocked` +
 * `stage.inputBlocked` và bắt mọi trò nghe phím phải khai báo lớp phủ.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, '..', rel), 'utf8');
const gamesDir = join(here, '..', 'src', 'components', 'games');

type InputState = { locked: boolean; pausedByUser: boolean; overlayOpen: boolean };

/** Đọc hàm mới qua namespace: khi chưa tồn tại thì test FAIL có thông điệp, không sập vì import lỗi. */
const stageModule = await import('../src/hooks/useGameStage');
function blockedFn(): (s: InputState) => boolean {
  const fn = (stageModule as unknown as Record<string, unknown>).isGameInputBlocked;
  if (typeof fn !== 'function') throw new Error('isGameInputBlocked chưa tồn tại ⇒ bảng chặn input chưa có');
  return fn as (s: InputState) => boolean;
}

const keyboardGames = readdirSync(gamesDir)
  .filter((f) => f.endsWith('.tsx'))
  .filter((f) => read(join('src', 'components', 'games', f)).includes("addEventListener('keydown'"));

describe('T45D — chốt input khi bảng bị che hoặc đang tạm dừng', () => {
  it('có trò chơi nghe window keydown để nộp đáp án (danh sách này là phạm vi của test)', () => {
    expect(keyboardGames.length).toBeGreaterThanOrEqual(10);
  });

  it('useGameStage phải export isGameInputBlocked', () => {
    expect(typeof (stageModule as unknown as Record<string, unknown>).isGameInputBlocked, 'chưa có hàm chặn input dùng chung').toBe('function');
  });

  it('bảng bị che (overlayOpen) hoặc đang tạm dừng ⇒ input bị chặn; chỉ locked=false và trống trải ⇒ được gõ', () => {
    const isGameInputBlocked = blockedFn();
    expect(isGameInputBlocked({ locked: false, pausedByUser: false, overlayOpen: true })).toBe(true);
    expect(isGameInputBlocked({ locked: false, pausedByUser: true, overlayOpen: false })).toBe(true);
    expect(isGameInputBlocked({ locked: true, pausedByUser: false, overlayOpen: false })).toBe(true);
    expect(isGameInputBlocked({ locked: false, pausedByUser: false, overlayOpen: false })).toBe(false);
  });

  it('stage trả về inputBlocked + overlayOpen cho linh kiện trò chơi dùng', () => {
    const src = read('src/hooks/useGameStage.ts');
    expect(src).toContain('export function isGameInputBlocked');
    const returned = src.slice(src.lastIndexOf('return {'));
    expect(returned).toMatch(/^\s*inputBlocked,/m);
    expect(returned).toMatch(/^\s*overlayOpen,/m);
  });

  it('mọi trò nghe phím phải chặn bằng stage.inputBlocked, không phải stage.locked trần', () => {
    const offender = keyboardGames.find((f) => {
      const src = read(join('src', 'components', 'games', f));
      return /if \(stage\.locked\)\s*return;/.test(src) || !src.includes('stage.inputBlocked');
    });
    expect(offender, `còn trò chặn phím bằng locked đơn thuần: ${offender}`).toBeUndefined();
  });

  it('mọi trò nghe phím phải khai báo lớp phủ "Chọn Màn" vào stage', () => {
    const missing = keyboardGames.filter((f) => {
      const src = read(join('src', 'components', 'games', f));
      return !/onOverlayOpenChange=\{stage\.setOverlayOpen\}/.test(src);
    });
    expect(missing, 'thiếu onOverlayOpenChange nên overlayOpen không bao giờ bật: ' + missing.join(', ')).toEqual([]);
  });

  it('số trò khai báo lớp phủ không tụt lại dưới 4/30 như lúc lập hồ sơ (hồi quy diện rộng)', () => {
    const wired = readdirSync(gamesDir)
      .filter((f) => f.endsWith('.tsx'))
      .filter((f) => read(join('src', 'components', 'games', f)).includes('onOverlayOpenChange={stage.setOverlayOpen}'));
    expect(wired.length).toBeGreaterThanOrEqual(keyboardGames.length);
    expect(wired.length).toBeGreaterThanOrEqual(4);
  });
});
