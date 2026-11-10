import React from 'react';
import type { Color, PieceType } from './chessEngine';

interface CartoonPieceSvgProps {
  type: PieceType;
  color: Color;
  className?: string;
  size?: number | string;
  isScared?: boolean;
}

/**
 * Bộ Sinh Động Hoạt Hình Cho Bé (con vật & đồ dùng đời sống siêu ngộ nghĩnh):
 * - Xe (r): Siêu xe địa hình G63 gầm cao đèn tròn 🚙
 * - Mã (n): Chú Ngựa con mắt to tròn, bờm tung bay 🐴
 * - Tượng (b): Chú Voi tai to vòi cong vui vẻ 🐘
 * - Hậu (q): Nữ Hoàng xinh xắn vương miện lấp lánh 👸
 * - Vua (k): Ông Vua uy nghiêm / Vua hoảng sợ mắt tròn xoe toát mồ hôi khi bị chiếu 👑😱
 * - Tốt (p): Chú lính nhỏ đội mũ lông dũng cảm 💂
 */
export const CartoonPieceSvg: React.FC<CartoonPieceSvgProps> = ({
  type,
  color,
  className = '',
  size = '100%',
  isScared = false,
}) => {
  const isWhite = color === 'w';
  const badgeBg = isWhite ? '#ffffff' : '#1e293b';
  const badgeBorder = isWhite ? '#38bdf8' : '#f43f5e';
  const badgeInner = isWhite ? '#f0f9ff' : '#0f172a';

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`drop-shadow-md select-none pointer-events-none transition-transform duration-300 ${
        isScared ? 'animate-bounce' : ''
      } ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={`car_sh_${color}_${type}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity={isWhite ? '0.25' : '0.45'} />
        </filter>
        <linearGradient id={`grad_g63_${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isWhite ? '#38bdf8' : '#ef4444'} />
          <stop offset="100%" stopColor={isWhite ? '#0284c7' : '#991b1b'} />
        </linearGradient>
        <linearGradient id={`grad_pony_${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isWhite ? '#fde047' : '#b45309'} />
          <stop offset="100%" stopColor={isWhite ? '#f59e0b' : '#78350f'} />
        </linearGradient>
        <linearGradient id={`grad_elephant_${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isWhite ? '#cbd5e1' : '#475569'} />
          <stop offset="100%" stopColor={isWhite ? '#94a3b8' : '#1e293b'} />
        </linearGradient>
      </defs>

      <g filter={`url(#car_sh_${color}_${type})`}>
        {/* Nền đĩa tròn phong cách huy hiệu cho quân cờ nổi bật trên bàn cờ */}
        <circle cx="50" cy="50" r="45" fill={badgeBg} stroke={badgeBorder} strokeWidth="3" />
        <circle cx="50" cy="50" r="41" fill={badgeInner} stroke={isWhite ? '#bae6fd' : '#334155'} strokeWidth="1.2" />

        {/* 1. XE (r) = Siêu xe G63 / Xe địa hình cực ngầu 🚙 */}
        {type === 'r' && (
          <g transform="translate(10, 18) scale(0.8)">
            {/* Giá nóc & lốp dự phòng */}
            <rect x="30" y="10" width="40" height="5" rx="2" fill="#334155" stroke="#0f172a" strokeWidth="2" />
            <circle cx="50" cy="7" r="6" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            {/* Thân trên xe / cabin kính */}
            <path d="M22 36 L30 16 L70 16 L78 36 Z" fill={isWhite ? '#7dd3fc' : '#f87171'} stroke="#0f172a" strokeWidth="3.5" />
            {/* Kính lái sáng bóng hoạt hình */}
            <polygon points="32,20 48,20 48,34 26,34" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
            <polygon points="52,20 68,20 74,34 52,34" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
            <path d="M34 22 L40 22 L36 32" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            {/* Thân xe vuông vức G63 */}
            <rect x="14" y="34" width="72" height="32" rx="7" fill={`url(#grad_g63_${color})`} stroke="#0f172a" strokeWidth="3.5" />
            {/* Đèn pha tròn to biểu cảm */}
            <circle cx="23" cy="48" r="7.5" fill="#fef08a" stroke="#0f172a" strokeWidth="3" />
            <circle cx="23" cy="48" r="4" fill="#ffffff" />
            <circle cx="77" cy="48" r="7.5" fill="#fef08a" stroke="#0f172a" strokeWidth="3" />
            <circle cx="77" cy="48" r="4" fill="#ffffff" />
            {/* Lưới tản nhiệt dọc đặc trưng AMG */}
            <rect x="34" y="42" width="32" height="15" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="40" y1="44" x2="40" y2="55" stroke="#94a3b8" strokeWidth="2" />
            <line x1="45" y1="44" x2="45" y2="55" stroke="#94a3b8" strokeWidth="2" />
            <line x1="50" y1="44" x2="50" y2="55" stroke="#94a3b8" strokeWidth="2" />
            <line x1="55" y1="44" x2="55" y2="55" stroke="#94a3b8" strokeWidth="2" />
            <line x1="60" y1="44" x2="60" y2="55" stroke="#94a3b8" strokeWidth="2" />
            {/* Huy hiệu G63 */}
            <rect x="36" y="2" width="28" height="11" rx="4" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            <text x="50" y="10" textAnchor="middle" fill="#78350f" fontSize="8" fontWeight="900" fontFamily="sans-serif">G63</text>
            <circle cx="50" cy="50" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            {/* Cản trước xe việt dã kim loại */}
            <rect x="22" y="62" width="56" height="8" rx="4" fill="#94a3b8" stroke="#0f172a" strokeWidth="2.5" />
            {/* Lốp xe việt dã địa hình to tròn */}
            <rect x="8" y="52" width="10" height="22" rx="4" fill="#0f172a" />
            <rect x="82" y="52" width="10" height="22" rx="4" fill="#0f172a" />
          </g>
        )}

        {/* 2. MÃ (n) = Chú Ngựa con dũng mãnh, mắt to tròn 🐴 */}
        {type === 'n' && (
          <g transform="translate(14, 12) scale(0.72)">
            {/* Thân và ức ngựa */}
            <path
              d="M26 84 C22 66 26 50 34 38 C42 26 54 20 66 22 C78 24 82 36 84 50 C86 64 78 76 74 84 Z"
              fill={`url(#grad_pony_${color})`}
              stroke="#451a03"
              strokeWidth="4"
            />
            {/* Bờm ngựa bồng bềnh */}
            <path
              d="M34 38 C28 26 24 30 20 20 C30 22 32 14 26 6 C36 10 44 8 48 18 C56 12 60 16 66 22"
              fill={isWhite ? '#ea580c' : '#451a03'}
              stroke="#451a03"
              strokeWidth="3.5"
            />
            {/* Tai vểnh tinh nghịch */}
            <polygon points="56,18 52,2 62,10" fill="#f59e0b" stroke="#451a03" strokeWidth="3" />
            <polygon points="54,14 53,5 59,10" fill="#fda4af" />
            <polygon points="68,22 72,6 78,16" fill="#f59e0b" stroke="#451a03" strokeWidth="3" />
            {/* Mõm ngựa bầu bĩnh dễ thương */}
            <ellipse cx="80" cy="50" rx="14" ry="14" fill={isWhite ? '#fde68a' : '#d97706'} stroke="#451a03" strokeWidth="3.5" />
            {/* Lỗ mũi hồng & nụ cười tươi */}
            <circle cx="82" cy="46" r="2.5" fill="#78350f" />
            <path d="M78 54 Q83 58 87 53" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Mắt to tròn long lanh phong cách hoạt hình */}
            <ellipse cx="54" cy="34" rx="8" ry="9" fill="#ffffff" stroke="#451a03" strokeWidth="3" />
            <circle cx="56" cy="34" r="5" fill="#1e293b" />
            <circle cx="58" cy="32" r="2" fill="#ffffff" />
            <circle cx="54" cy="36" r="1" fill="#ffffff" />
            {/* Dây cương đỏ gắn chuông vàng */}
            <path d="M46 42 L74 52" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
            <circle cx="62" cy="48" r="4.5" fill="#facc15" stroke="#78350f" strokeWidth="2" />
          </g>
        )}

        {/* 3. TƯỢNG (b) = Chú Voi thông thái tai to vòi cong 🐘 */}
        {type === 'b' && (
          <g transform="translate(13, 14) scale(0.74)">
            {/* Đôi tai voi khổng lồ hai bên */}
            <ellipse cx="20" cy="44" rx="16" ry="20" fill={`url(#grad_elephant_${color})`} stroke="#0f172a" strokeWidth="4" />
            <ellipse cx="20" cy="44" rx="10" ry="14" fill="#fda4af" />
            <ellipse cx="80" cy="44" rx="16" ry="20" fill={`url(#grad_elephant_${color})`} stroke="#0f172a" strokeWidth="4" />
            <ellipse cx="80" cy="44" rx="10" ry="14" fill="#fda4af" />
            {/* Đầu voi tròn trịa */}
            <ellipse cx="50" cy="46" rx="28" ry="26" fill={`url(#grad_elephant_${color})`} stroke="#0f172a" strokeWidth="4" />
            {/* Vòi voi cong vút vui nhộn */}
            <path
              d="M44 54 C44 70 36 82 48 85 C58 87 64 78 56 68 L56 54"
              fill={`url(#grad_elephant_${color})`}
              stroke="#0f172a"
              strokeWidth="4"
            />
            {/* Cặp ngà voi trắng muốt chóp tròn an toàn */}
            <path d="M38 60 C30 68 26 65 24 58 C28 57 34 57 38 60 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
            <path d="M62 60 C70 68 74 65 76 58 C72 57 66 57 62 60 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
            {/* Đôi mắt to tròn long lanh */}
            <circle cx="36" cy="38" r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="37" cy="38" r="3.5" fill="#0f172a" />
            <circle cx="38.5" cy="36.5" r="1.5" fill="#ffffff" />
            <circle cx="64" cy="38" r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="63" cy="38" r="3.5" fill="#0f172a" />
            <circle cx="64.5" cy="36.5" r="1.5" fill="#ffffff" />
            {/* Má ửng hồng */}
            <circle cx="30" cy="48" r="4" fill="#f43f5e" fillOpacity="0.5" />
            <circle cx="70" cy="48" r="4" fill="#f43f5e" fillOpacity="0.5" />
            {/* Chiếc mũ lễ hội / tri thức xinh xắn */}
            <polygon points="50,10 40,24 60,24" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="50" cy="10" r="3.5" fill="#ef4444" />
          </g>
        )}

        {/* 4. HẬU (q) = Nữ Hoàng quyền quý xinh đẹp 👸 */}
        {type === 'q' && (
          <g transform="translate(14, 12) scale(0.72)">
            {/* Mái tóc bồng bềnh */}
            <path
              d="M24 46 C18 30 30 18 50 18 C70 18 82 30 76 46 C84 56 80 76 74 78 C68 66 72 54 70 48 C64 44 36 44 30 48 C28 54 32 66 26 78 C20 76 16 56 24 46 Z"
              fill="#f59e0b"
              stroke="#7c2d12"
              strokeWidth="4"
            />
            {/* Khuôn mặt trái xoan */}
            <ellipse cx="50" cy="50" rx="23" ry="24" fill="#fed7aa" stroke="#7c2d12" strokeWidth="3.5" />
            {/* Vương miện lấp lánh đính ngọc */}
            <polygon points="30,24 36,8 50,16 64,8 70,24" fill="#facc15" stroke="#7c2d12" strokeWidth="3.5" />
            <circle cx="36" cy="8" r="3.5" fill="#ef4444" />
            <circle cx="50" cy="16" r="4" fill="#3b82f6" />
            <circle cx="64" cy="8" r="3.5" fill="#10b981" />
            {/* Đôi mắt long lanh có lông mi cong */}
            <circle cx="41" cy="48" r="5" fill="#0f172a" />
            <circle cx="42.5" cy="46" r="2" fill="#ffffff" />
            <circle cx="59" cy="48" r="5" fill="#0f172a" />
            <circle cx="60.5" cy="46" r="2" fill="#ffffff" />
            <path d="M36 43 L42 45" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
            <path d="M64 43 L58 45" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
            {/* Má hồng hào & Nụ cười duyên */}
            <circle cx="33" cy="56" r="4.5" fill="#fda4af" />
            <circle cx="67" cy="56" r="4.5" fill="#fda4af" />
            <path d="M44 58 Q50 65 56 58" stroke="#e11d48" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Vòng cổ ngọc trái tim */}
            <circle cx="50" cy="74" r="4" fill="#ec4899" stroke="#be185d" strokeWidth="1.5" />
          </g>
        )}

        {/* 5. VUA (k) = Ông Vua uy nghiêm / Hoảng sợ tột độ khi bị chiếu tướng 👑😱 */}
        {type === 'k' && (
          <g transform="translate(14, 10) scale(0.72)">
            {/* Khuôn mặt vua */}
            <ellipse cx="50" cy="52" rx="25" ry="25" fill={isScared ? '#fef08a' : '#fed7aa'} stroke="#7c2d12" strokeWidth="3.5" />
            {/* Vương miện vàng lớn uy quyền */}
            <polygon
              points="26,26 30,6 50,14 70,6 74,26"
              fill="#facc15"
              stroke="#7c2d12"
              strokeWidth="3.5"
              className={isScared ? 'animate-bounce' : ''}
            />
            <circle cx="50" cy="14" r="4.5" fill="#ef4444" />
            <circle cx="30" cy="6" r="4" fill="#3b82f6" />
            <circle cx="70" cy="6" r="4" fill="#10b981" />
            {/* Bộ râu quai nón quý tộc */}
            <path
              d="M28 56 C28 78 40 88 50 88 C60 88 72 78 72 56 C68 62 58 66 50 66 C42 66 32 62 28 56 Z"
              fill="#e2e8f0"
              stroke="#475569"
              strokeWidth="3"
            />

            {isScared ? (
              /* Biểu cảm HOẢNG SỢ TỘT ĐỘ (Mắt trợn tròn xoay xoáy, giọt mồ hôi bắn tung tóe, mồm há hốc hét AAAA) */
              <g>
                {/* Mắt lồi sợ hãi cực độ */}
                <ellipse cx="38" cy="45" rx="8" ry="9" fill="#ffffff" stroke="#7c2d12" strokeWidth="3" />
                <circle cx="38" cy="45" r="3" fill="#0f172a" />
                <ellipse cx="62" cy="45" rx="8" ry="9" fill="#ffffff" stroke="#7c2d12" strokeWidth="3" />
                <circle cx="62" cy="45" r="3" fill="#0f172a" />
                {/* Lông mày nhướng tột đỉnh */}
                <path d="M30 33 L44 38" stroke="#7c2d12" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M70 33 L56 38" stroke="#7c2d12" strokeWidth="3.5" strokeLinecap="round" />
                {/* Miệng há to hết cỡ hét lớn */}
                <ellipse cx="50" cy="63" rx="9" ry="11" fill="#991b1b" stroke="#7c2d12" strokeWidth="3.5" />
                <ellipse cx="50" cy="67" rx="5" ry="5" fill="#f87171" />
                {/* Giọt mồ hôi bắn ra hai bên trán */}
                <path d="M78 36 C78 32 84 26 84 26 C84 26 88 32 88 36 C88 40 84 42 78 36 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                <path d="M16 40 C16 36 22 30 22 30 C22 30 26 36 26 40 C26 44 22 46 16 40 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
                {/* Tia chớp hoảng hốt quanh đầu */}
                <path d="M18 18 L24 24" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
                <path d="M82 18 L76 24" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
              </g>
            ) : (
              /* Biểu cảm BÌNH THƯỜNG: Vua tươi cười hiền từ uy nghiêm */
              <g>
                <circle cx="40" cy="48" r="4" fill="#0f172a" />
                <circle cx="42" cy="46" r="1.5" fill="#ffffff" />
                <circle cx="60" cy="48" r="4" fill="#0f172a" />
                <circle cx="62" cy="46" r="1.5" fill="#ffffff" />
                <path d="M34 42 Q40 38 46 43" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M66 42 Q60 38 54 43" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M44 58 Q50 64 56 58" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {/* 6. TỐT (p) = Chú Lính nhỏ dũng cảm 💂 */}
        {type === 'p' && (
          <g transform="translate(14, 12) scale(0.72)">
            {/* Thân áo lính rực rỡ */}
            <rect x="30" y="60" width="40" height="28" rx="6" fill={isWhite ? '#ef4444' : '#1e40af'} stroke="#0f172a" strokeWidth="3.5" />
            {/* Đai thắt lưng vàng và cúc áo */}
            <rect x="30" y="74" width="40" height="7" fill="#0f172a" />
            <rect x="46" y="73" width="9" height="9" rx="2" fill="#eab308" />
            <circle cx="50" cy="66" r="2.5" fill="#facc15" />
            {/* Khuôn mặt chú lính tròn trĩnh */}
            <ellipse cx="50" cy="46" rx="21" ry="20" fill="#fed7aa" stroke="#7c2d12" strokeWidth="3.5" />
            {/* Mũ lông gác cổng cao quý tộc */}
            <path d="M26 38 C26 16 38 10 50 10 C62 10 74 16 74 38 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3.5" />
            <rect x="24" y="36" width="52" height="7" rx="3.5" fill="#475569" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="50" cy="22" r="4" fill="#f59e0b" />
            {/* Đôi mắt to tò mò, má ửng hồng */}
            <circle cx="42" cy="46" r="3.5" fill="#0f172a" />
            <circle cx="43.5" cy="44.5" r="1.2" fill="#ffffff" />
            <circle cx="58" cy="46" r="3.5" fill="#0f172a" />
            <circle cx="59.5" cy="44.5" r="1.2" fill="#ffffff" />
            <circle cx="36" cy="52" r="3.5" fill="#fda4af" />
            <circle cx="64" cy="52" r="3.5" fill="#fda4af" />
            {/* Nụ cười tự tin dũng cảm */}
            <path d="M46 54 Q50 58 54 54" stroke="#7c2d12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        )}
      </g>
    </svg>
  );
};
