/**
 * T44/D — nút chạm phải ≥ ~44px (AGENTS.md §3: "Nút ≥ ~44px, thao tác chạm đơn
 * giản"). Bé lớp 1 chấm bằng đầu ngón tay trên điện thoại, đích sai 8px là chạm
 * vào ô bên cạnh.
 *
 * Đợt quét T44 tìm thấy (đo bằng class trong chính thẻ `<button>`, không đoán):
 * · `ConnectDotsGame.tsx:147` `w-9 h-9` = **36px** — mà chấm số *chính là* đích
 *   trả lời của trò Nối Điểm;
 * · `ColoringCanvasGame.tsx:277` `w-8 h-8` (32px) khuôn dán hình và `:316`
 *   `w-7 h-7` (28px) ô màu;
 * · `SyllableBuilderGame.tsx:202` `py-1.5` ≈ 33px cho các nút thanh điệu;
 * · `GameModalWrapper.tsx:685` nút ✕ `w-8 h-8`;
 * · `AccountModal.tsx:131` + `CompetitionResultModal.tsx:100` nút ✕ `w-10 h-10`
 *   (40px), `CompetitionExamModal.tsx:409` điều hướng câu `min-w-[36px] h-9`;
 * · `StickerAlbumScreen.tsx:124` chấm chuyển bộ sticker `w-2.5 h-2.5` = **10px**
 *   ⇒ đã bọc vào vùng chạm 44px, chấm nhỏ chỉ còn là hình hiển thị.
 *
 * Test này quét **toàn bộ** `src/components`: thẻ `<button>` nào mang class
 * `w-6..w-10` / `h-6..h-10` / `size-6..10` mà không có `min-w-[44px]` /
 * `min-h-[44px]` là đỏ. Icon (`<Star className="w-6 h-6" />`) không bị tính vì
 * quy tắc chỉ đọc thẻ `<button>`.
 *
 * **Nhưng quét class không thấy hết.** Probe render (`evidence/2026-11-03-T44/
 * probe-t44-tap.mjs`, `getBoundingClientRect` thật ở 375×812, đi qua cả 31 trò)
 * bắt thêm hai họ lỗi mà rule trên mù:
 * · nút **không có class cỡ nào** nhưng nội dung làm nó tóp lại — dải "Màn 1 ▾"
 *   trong `GameModalWrapper.tsx` đo **152×14**;
 * · nút icon-only tự cỡ theo padding — loa "Nghe từ" `p-2` + `w-5` = **36×36**,
 *   loa "Nghe màu" `p-1.5` + `w-4` = **28×28**.
 * Vì vậy các hợp đồng bên dưới chốt đúng những chuỗi mà probe đã đo xanh.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const COMPONENTS = path.resolve(__dirname, '..', 'src', 'components');

function listTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsx(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

/** Cắt thẻ mở `<button …>` tới dấu `>` đóng thẻ (bỏ qua `=>` của arrow function). */
function openingButtonTags(text: string): string[] {
  const tags: string[] = [];
  const re = /<button\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const rest = text.slice(m.index, m.index + 900);
    const cut = rest.search(/(^|[^=>])>/);
    tags.push(cut >= 0 ? rest.slice(0, cut + 1) : rest);
  }
  return tags;
}

const SMALL_SIZE = /(?:^|[^-\w])(?:w|h|size)-(?:[6-9]|10)(?:\s|$|"|')/;
const HAS_MIN_44 = /min-(?:w|h)-\[4[4-9]/;

describe('T44/D — kích cỡ nút chạm', () => {
  it('không còn thẻ <button> nào nhỏ hơn 44px trong src/components', () => {
    const offenders: string[] = [];
    for (const file of listTsx(COMPONENTS)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const tag of openingButtonTags(text)) {
        if (SMALL_SIZE.test(tag) && !HAS_MIN_44.test(tag)) {
          offenders.push(`${path.relative(COMPONENTS, file)} ⇒ ${tag.replace(/\s+/g, ' ').slice(0, 120)}`);
        }
      }
    }
    expect(offenders, 'AGENTS §3: nút ≥ ~44px').toEqual([]);
  });

  it('quét đủ lớn để con số 0 có nghĩa (số thẻ <button> thực tế)', () => {
    let buttons = 0;
    for (const file of listTsx(COMPONENTS)) buttons += openingButtonTags(fs.readFileSync(file, 'utf8')).length;
    expect(buttons).toBeGreaterThan(150);
  });

  it('sáu đích vừa sửa giữ nguyên cỡ 44px trở lên', () => {
    const read = (rel: string) => fs.readFileSync(path.join(COMPONENTS, rel), 'utf8');
    expect(read(path.join('games', 'ConnectDotsGame.tsx'))).toContain('w-11 h-11 md:w-12 md:h-12');
    expect(read(path.join('games', 'ColoringCanvasGame.tsx'))).toContain('w-11 h-11 rounded-lg');
    expect(read(path.join('games', 'SyllableBuilderGame.tsx'))).toContain('min-h-[44px]');
    expect(read(path.join('competition', 'CompetitionExamModal.tsx'))).toContain('min-w-[44px] h-11');
    // Chấm chuyển bộ sticker: vùng chạm 44px, chấm nhỏ là span bên trong.
    const album = read(path.join('motivation', 'StickerAlbumScreen.tsx'));
    expect(album).toContain('w-11 h-11 -mx-2 flex items-center justify-center');
    expect(album).toMatch(/<button[\s\S]{0,400}?w-11 h-11[\s\S]{0,400}?<span/);
  });

  it('đích mà chỉ probe render mới thấy cũng giữ 44px', () => {
    const read = (rel: string) => fs.readFileSync(path.join(COMPONENTS, rel), 'utf8');
    // Dải "Màn {tier} ▾" không có class cỡ nào ⇒ quét class mù hoàn toàn; probe
    // đo nó 152×14 trước khi sửa.
    const wrapper = read(path.join('games', 'GameModalWrapper.tsx'));
    const strip = wrapper.slice(wrapper.indexOf('setShowTierModal(true)'), wrapper.indexOf('Màn {tier}/'));
    expect(strip).toContain('className="inline-flex min-h-[44px]');
    expect(strip).toContain('cursor-pointer');
    // Hai nút loa icon-only: cỡ sinh từ padding, không từ class w-/h-.
    for (const [rel, title] of [
      [path.join('games', 'SyllableBuilderGame.tsx'), 'Nghe từ'],
      [path.join('games', 'EnglishColorBalloonGame.tsx'), 'Nghe màu'],
    ] as const) {
      const src = read(rel);
      const start = src.indexOf(`title="${title}"`);
      expect(start, `${rel} mất nút "${title}"?`).toBeGreaterThan(-1);
      const tag = src.slice(src.lastIndexOf('<button', start), start);
      expect(tag, `nút "${title}" phải tự hứa 44px cả hai chiều`).toMatch(/min-w-\[44px\]/);
      expect(tag).toMatch(/min-h-\[44px\]/);
      expect(tag).toMatch(/items-center justify-center/);
    }
  });
});
