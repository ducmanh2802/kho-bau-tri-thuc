import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * T52 — Home gọn và nhẹ hơn.
 *
 * Số đo thật (probe `evidence/2026-11-04-T52/probe-home-compact-load.mjs`, 375×667):
 * trang 3 781 → 3 349 px, DOM 399 → 365 node, animation vô hạn 5 → 3,
 * entry `index-*.js` 219 963 → 201 040 byte. Các test dưới đây khoá **nguyên nhân**,
 * vì chiều cao trang thì probe mới đo được.
 */
const here = dirname(fileURLToPath(import.meta.url));
const src = (p: string) => readFileSync(join(here, '..', p), 'utf8');

describe('Home: mỗi nhiệm vụ hiện một lần', () => {
  const home = src('src/components/home/HomeScreen.tsx');

  it('chỉ còn một chỗ vẽ danh sách nhiệm vụ (ô biểu tượng), không còn khối danh sách lặp', () => {
    expect(home.match(/quests\.slice\(0, 3\)\.map/g) ?? []).toHaveLength(1);
    // Chỉ xét chữ hiện trên màn (giữa hai thẻ), để comment giải thích không bị tính oan.
    expect(home).not.toMatch(/>\s*Danh Sách Nhiệm Vụ\s*</);
  });

  it('ô nhiệm vụ in tên đầy đủ trong 2 dòng, không cắt ở 10 ký tự + "…"', () => {
    expect(home).not.toMatch(/q\.title\.slice\(/);
    // `{q.title}` trần (không tính `${q.title}` trong aria-label) chỉ được xuất hiện một lần.
    expect(home.match(/[^$]\{q\.title\}/g) ?? []).toHaveLength(1);
    expect(home).toMatch(/line-clamp-2[^>]*>\s*\{q\.title\}/);
  });
});

describe('Home: không chạy animation trang trí vô hạn', () => {
  const home = src('src/components/home/HomeScreen.tsx');

  it('bỏ nền gradient chạy và nhấp nháy trên khối hero', () => {
    expect(home).not.toMatch(/className="[^"]*animate-gradient/);
    expect(home).not.toMatch(/className="[^"]*animate-pulse-slow/);
  });
});

describe('Home: code dưới màn hình đầu không nằm trong lượt tải đầu', () => {
  const home = src('src/components/home/HomeScreen.tsx');
  const banner = src('src/components/auth/CloudSyncBanner.tsx');

  it('thẻ "nên học gì tiếp theo" nạp động, không import tĩnh', () => {
    expect(home).not.toMatch(/^import .*NextBestActionCard/m);
    expect(home).toMatch(
      /const NextBestActionCard = lazy\(\(\) =>\s*import\('\.\.\/learning\/NextBestActionCard'\)/
    );
  });

  it('pháo giấy chỉ tải khi bé mở rương, không nằm trong entry', () => {
    expect(home).not.toMatch(/^import .*fireCelebrationConfetti/m);
    expect(home).toMatch(/import\('\.\.\/\.\.\/services\/confetti'\)/);
  });

  it('hộp đăng nhập của ba mẹ nạp động khi bấm banner', () => {
    expect(banner).not.toMatch(/^import \{ AccountModal \} from '\.\/AccountModal'/m);
    expect(banner).toMatch(/const AccountModal = lazy\(\(\) =>\s*import\('\.\/AccountModal'\)/);
  });
});
