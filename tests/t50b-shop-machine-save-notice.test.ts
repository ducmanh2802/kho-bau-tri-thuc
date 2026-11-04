/**
 * T50B — tủ đồ phải nói **bằng chữ** khi máy không lưu được, và không được hứa
 * những gì chưa nằm xuống máy (`DEF-023`).
 *
 * Phép đo trước khi sửa (2026-11-04, chạy thật trên `main` `6ce845f`):
 *   grep -n "saveChildProfile" src/components/shop/AvatarShopScreen.tsx
 *     ⇒ **3** lời gọi (dòng 68 · 90 · 111), **0** trong số đó đọc giá trị trả về
 *       (grep -cE "(const [a-zA-Z]+ = |if \\(!) *StorageService\\.saveChildProfile\\(" ⇒ **0**)
 *   grep -cE "role=\"alert\"|notice" src/components/shop/AvatarShopScreen.tsx ⇒ **0**
 *   grep -c "sound.speak(" src/components/shop/AvatarShopScreen.tsx          ⇒ **6**
 * `saveChildProfile(profile): boolean` (src/services/storage.ts:1162) trả **false** khi
 * trình duyệt chặn ghi (Safari chế độ ẩn danh) hoặc hết dung lượng — `writeJSON` cố ý trả
 * false thay vì ném. Nên ba chỗ sau hứa điều chưa xảy ra:
 * · chọn bạn mascot ⇒ vẫn đọc "Bé đã chọn bạn Cú Thông Thái!" trong khi tải lại trang bé
 *   vẫn là con gấu cũ;
 * · bấm món đã mở ⇒ `setProfile(updated)` làm nút đổi thành "Đang mặc" mà máy chưa ghi gì,
 *   bé tin mình đang mặc;
 * · mua thành công nhưng lần **mặc** ngay sau đó hỏng ⇒ bé đã thật sự mở khoá (đúng, không
 *   mất sao) nhưng chưa mặc, còn màn hình thì nói ngược lại.
 *
 * Hai ràng buộc của bản sửa, và lý do:
 * 1) Thất bại này là **của máy**, không phải của bé ⇒ lời thoại và chữ trên màn phải nói
 *    "máy không lưu được", tuyệt đối không được đổ cho "thiếu sao" (đã đóng ở `DEF-020`).
 * 2) Âm thanh không phải kênh duy nhất: `voiceEnabled` do ba mẹ tắt ⇒ bé điếc với toàn bộ
 *    phản hồi ⇒ phải có một node `role="alert"` nhìn thấy được.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';

if (typeof (globalThis as Record<string, unknown>).localStorage === 'undefined') {
  const store: Record<string, string> = {};
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: () => null,
    length: 0,
  } as unknown as Storage;
}

import { AvatarShopScreen, NOTICE_MACHINE_NOT_SAVED, NOTICE_UNLOCKED_NOT_EQUIPPED } from '../src/components/shop/AvatarShopScreen';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, '..', 'src', 'components', 'shop', 'AvatarShopScreen.tsx'), 'utf8');

const noop = () => {};

/** Mỗi chỗ gọi `saveChildProfile` + khối code ngay sau nó, để kiểm hành vi xử lý hỏng. */
const saveSites = (text: string) => {
  const out: { call: string; after: string }[] = [];
  const re = /( *)(const \w+ = )?StorageService\.saveChildProfile\([^;]*\);/g;
  for (const m of text.matchAll(re)) {
    out.push({ call: m[0].trim(), after: text.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 320) });
  }
  return out;
};

describe('T50B — tủ đồ không được hứa suông khi máy chặn ghi (DEF-023)', () => {
  it('n1: **3** chỗ ghi hồ sơ và **cả 3** đều đọc giá trị trả về (không còn lời gọi vứt kết quả)', () => {
    const sites = saveSites(src);
    expect(sites.length, 'số lời gọi saveChildProfile trong màn tủ đồ').toBe(3);
    const thrownAway = sites.filter((s) => !s.call.startsWith('const '));
    expect(thrownAway.map((s) => s.call), 'lời gọi vứt kết quả').toEqual([]);
  });

  it('n2: mỗi chỗ ghi có nhánh hỏng — hoàn tác state **và** đặt thông báo nhìn thấy được', () => {
    const sites = saveSites(src);
    for (const s of sites) {
      const failureHandled = /if \(!saved\)/.test(s.after) && /setNotice\(/.test(s.after) && /setProfile\(/.test(s.after);
      expect(failureHandled, `thiếu nhánh xử lý hỏng sau:\n${s.call}` ).toBe(true);
    }
  });

  it('n3: màn có một node báo lỗi **bằng chữ** (role="alert") do state điều khiển, không chỉ bằng tiếng', () => {
    expect(src, 'phải render khối thông báo từ state').toMatch(/\{\s*notice\s*&&\s*\(/);
    expect(src, 'phải có role="alert" để bé và ba mẹ **nhìn thấy**, không chỉ nghe').toMatch(/role="alert"/);
    expect((src.match(/setNotice\(/g) ?? []).length, 'số chỗ đặt thông báo').toBeGreaterThanOrEqual(4);
  });

  it('n4: lời báo lỗi nói **máy** chứ không đổ cho bé; không nhắc tới sao', () => {
    for (const [name, text] of [
      ['NOTICE_MACHINE_NOT_SAVED', NOTICE_MACHINE_NOT_SAVED],
      ['NOTICE_UNLOCKED_NOT_EQUIPPED', NOTICE_UNLOCKED_NOT_EQUIPPED],
    ] as const) {
      expect(text, name).toMatch(/máy/i);
      expect(text, `${name}: phải nói chuyện **lưu**`).toMatch(/lưu|mặc/);
      expect(text, `${name}: không được đổ lỗi thiếu sao`).not.toMatch(/sao/);
    }
  });

  it('n5: hồ sơ bình thường thì màn **không** hiện bóng cáo lỗi (chống đỏ do dựng sẵn)', () => {
    const ls = globalThis.localStorage;
    ls.clear();
    ls.setItem(
      'kho_bau_child_profile',
      JSON.stringify({
        id: 'child-1',
        name: 'Bé Test',
        grade: 1,
        avatarBase: 'fox',
        equipped: {},
        xp: 0,
        stars: 30,
        gems: 0,
        tickets: 0,
        streak: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
        unlockedItems: [],
        completedLessons: [],
        completedWeeklyChallenges: [],
      })
    );
    const html = renderToString(React.createElement(AvatarShopScreen, { onBack: noop, onProfileUpdate: noop }));
    expect(html).not.toMatch(/role="alert"/);
    expect(html).not.toMatch(/Máy không|chưa mặc được/);
    // màn vẫn dựng bình thường sau khi thêm khối thông báo
    expect(html).toMatch(/Số sao của bé/);
  });

  it('n6: thất bại "storage-unavailable" của buyShopItem cũng phải hiện bằng chữ (trước chỉ có tiếng)', () => {
    const branch = src.slice(src.indexOf("'storage-unavailable'"), src.indexOf("'storage-unavailable'") + 700);
    expect(branch, 'nhánh storage-unavailable phải đặt thông báo nhìn thấy được').toMatch(/setNotice\(/);
  });
});
