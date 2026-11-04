import React from 'react';
import type { AvatarItem, ChildProfile } from '../../types';
import type { ShopItemType } from '../../types/motivation';
import { AVATAR_SHOP_ITEMS } from '../../services/storage';
import { MASCOT_EMOJI, SHOP_MASCOTS } from '../../data/shopCatalog';

/**
 * `background` là lớp *sau* bé, các ô còn lại đè lên trên ⇒ vẽ làm hai nhóm.
 * Danh sách này từng nằm trong `AvatarShopScreen` và **chỉ** màn đó dùng ⇒ màn Home
 * không ghép lớp nào (`DEF-022(b)`); chuyển về đây để cả hai màn cùng một nguồn.
 */
export const EQUIP_OVERLAYS: ShopItemType[] = ['hat', 'glasses', 'shirt', 'backpack', 'pet', 'frame'];

/** Tên món theo thứ tự vẽ, cho `aria-label` của preview. */
const equippedOf = (profile: ChildProfile, type: ShopItemType): AvatarItem | undefined => {
  const id = profile.equipped[type];
  if (!id) return undefined;
  return AVATAR_SHOP_ITEMS.find((item) => item.id === id && item.type === type);
};

interface AvatarPreviewProps {
  profile: ChildProfile;
  /**
   * Lớp Tailwind của **riêng khung ô**: mỗi màn giữ kích cỡ / nền / viền / animation của
   * mình (Home `w-20 sm:w-24 md:w-28`, tủ đồ `w-28 md:w-32`). Việc ghép lớp nằm ở đây,
   * không màn nào tự vẽ lại bản đồ lớp — đó chính là bệnh `DEF-022`.
   */
  frameClassName: string;
}

/**
 * Preview nhân vật của bé: mascot + đủ mọi ô `equipped`, dùng chung cho màn Home và tủ đồ.
 *
 * Định vị các lớp nằm trong `src/index.css` (`.kb-avatar-layer[data-equip=…]`) và tính bằng
 * `cqi` — phần trăm bề rộng **của chính ô** — nên một bản đồ lớp chạy được ở cả ô 80 px lẫn
 * ô 128 px. Bản đồ cũ của tủ đồ dùng offset tĩnh (`-top-3`, `text-3xl`) vốn chỉ đúng với ô
 * `w-28`; bê nguyên sang Home là mũ bay khỏi đầu (lý do `DEF-022(b)` để mở ở T50A).
 *
 * Preview mang `role="img"` + `aria-label` liệt kê bạn và từng món đang mặc: emoji là trang
 * trí nên `aria-hidden`, còn màn đọc thì nói được **mặc gì**, không chỉ "🦉".
 */
export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ profile, frameClassName }) => {
  const background = equippedOf(profile, 'background');
  const overlays = EQUIP_OVERLAYS.map((type) => ({ type, item: equippedOf(profile, type) })).filter(
    (layer): layer is { type: ShopItemType; item: AvatarItem } => Boolean(layer.item)
  );
  const mascotName = SHOP_MASCOTS.find((mascot) => mascot.id === profile.avatarBase)?.name ?? '';
  // `background` là một **món bé mặc**, không chỉ một lớp trang trí ⇒ nó phải có mặt trong
  // tên preview y như sáu món còn lại (`DEF-022(b)` đóng không chỉ nghĩa là vẽ ra).
  const wornNames = [background?.name, ...overlays.map((layer) => layer.item.name)].filter(Boolean);
  const label = [mascotName, ...wornNames].filter(Boolean).join(' · ');

  return (
    <div data-avatar-preview role="img" aria-label={label} className={`kb-avatar-preview ${frameClassName}`}>
      {background && (
        <span data-equip="background" aria-hidden="true" className="kb-avatar-layer">
          {background.emoji}
        </span>
      )}

      {/* `relative` là thứ khiến mascot vẽ **trên** lớp `background` (cùng hàng đợi với các
          lớp absolute nhưng đến sau trong DOM) — không phải class trình bày thừa. */}
      <span data-avatar-mascot aria-hidden="true" className="relative">
        {MASCOT_EMOJI[profile.avatarBase]}
      </span>

      {overlays.map(({ type, item }) => (
        <span key={type} data-equip={type} aria-hidden="true" className="kb-avatar-layer">
          {item.emoji}
        </span>
      ))}
    </div>
  );
};
