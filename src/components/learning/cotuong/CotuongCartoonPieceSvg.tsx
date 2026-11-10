import React from 'react';
import type { Color, PieceType } from './cotuongEngine';

interface CotuongCartoonPieceSvgProps {
  type: PieceType;
  color: Color;
  size?: number | string;
  className?: string;
}

/**
 * Bộ Quân Cờ Tướng Hoạt Hình 3D Chibi Siêu Dễ Thương Cho Học Sinh Lớp 1:
 * - Tướng (k): Vị Tướng Nhí uy phong đội mũ giáp đính ngọc, áo choàng rồng
 * - Sĩ (a): Chú Quân Sư tí hon thông thái cầm quạt thần
 * - Tượng (e): Chú Voi Con tai to vòi cong vui vẻ, cặp ngà an toàn (ví dụ: tượng là chú voi nhỏ)
 * - Mã (h): Chú Ngựa Con mắt to tròn long lanh, bờm bồng bềnh, lục lạc vàng (ví dụ: mã là chú ngựa con)
 * - Xe (r): Chiến Xa Hoàng Gia / Thiết Giáp Thần Tốc bánh to hầm hố
 * - Pháo (c): Khẩu Đại Pháo Thần Công tròn trịa bắn đạn sao lấp lánh
 * - Tốt / Binh (p): Chú Lính Nhỏ dũng cảm cầm khiên ngôi sao
 */
export const CotuongCartoonPieceSvg: React.FC<CotuongCartoonPieceSvgProps> = ({
  type,
  color,
  size = '100%',
  className = '',
}) => {
  const isRed = color === 'red';

  // Nhãn chữ Việt ngắn gọn cho bé nhận biết ngay tên quân cờ
  const BADGE_LABEL: Record<PieceType, string> = {
    k: 'TƯỚNG',
    a: 'SĨ',
    e: 'VOI',
    h: 'NGỰA',
    r: 'XE',
    c: 'PHÁO',
    p: isRed ? 'BINH' : 'TỐT',
  };

  const id = `ct_3d_${color}_${type}`;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none pointer-events-none drop-shadow-md transition-transform duration-200 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Đổ bóng 3D mềm mại */}
        <filter id={`${id}_drop`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#000000" floodOpacity={isRed ? '0.28' : '0.4'} />
        </filter>

        {/* Gradient nền đĩa ngọc 3D */}
        <radialGradient id={`${id}_plate`} cx="38%" cy="30%" r="70%">
          <stop offset="0%" stopColor={isRed ? '#fff5f5' : '#f0f9ff'} />
          <stop offset="65%" stopColor={isRed ? '#fee2e2' : '#e0f2fe'} />
          <stop offset="100%" stopColor={isRed ? '#fca5a5' : '#bae6fd'} />
        </radialGradient>

        {/* Gradient vành viền nổi 3D */}
        <linearGradient id={`${id}_rim`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isRed ? '#f87171' : '#60a5fa'} />
          <stop offset="50%" stopColor={isRed ? '#ef4444' : '#3b82f6'} />
          <stop offset="100%" stopColor={isRed ? '#b91c1c' : '#1d4ed8'} />
        </linearGradient>

        {/* Gradient da voi */}
        <linearGradient id={`${id}_elephant`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isRed ? '#fed7aa' : '#cbd5e1'} />
          <stop offset="100%" stopColor={isRed ? '#fb923c' : '#64748b'} />
        </linearGradient>

        {/* Gradient ngựa con */}
        <linearGradient id={`${id}_horse`} x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor={isRed ? '#fde047' : '#93c5fd'} />
          <stop offset="100%" stopColor={isRed ? '#f59e0b' : '#3b82f6'} />
        </linearGradient>

        {/* Gradient đại pháo */}
        <linearGradient id={`${id}_cannon`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={isRed ? '#fb7185' : '#94a3b8'} />
          <stop offset="50%" stopColor={isRed ? '#e11d48' : '#475569'} />
          <stop offset="100%" stopColor={isRed ? '#9f1239' : '#1e293b'} />
        </linearGradient>

        {/* Gradient chiến xa */}
        <linearGradient id={`${id}_tank`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isRed ? '#fbbf24' : '#38bdf8'} />
          <stop offset="100%" stopColor={isRed ? '#d97706' : '#0284c7'} />
        </linearGradient>
      </defs>

      <g filter={`url(#${id}_drop)`}>
        {/* Đĩa tròn ngọc 3D bóng bẩy */}
        <circle cx="50" cy="50" r="46" fill={`url(#${id}_plate)`} stroke={`url(#${id}_rim)`} strokeWidth="3.5" />
        <circle cx="50" cy="50" r="41.5" stroke={isRed ? '#fecaca' : '#bfdbfe'} strokeWidth="1.2" strokeDasharray="3 2" />

        {/* 1. TƯỢNG (e) = Chú Voi Nhỏ Tai To Vòi Cong 🐘 */}
        {type === 'e' && (
          <g transform="translate(10, 8) scale(0.8)">
            {/* Đôi tai voi khổng lồ màu hồng cam / xanh bạc */}
            <ellipse cx="22" cy="46" rx="15" ry="18" fill={`url(#${id}_elephant)`} stroke="#334155" strokeWidth="2.5" />
            <ellipse cx="22" cy="46" rx="9" ry="12" fill="#fda4af" />
            <ellipse cx="78" cy="46" rx="15" ry="18" fill={`url(#${id}_elephant)`} stroke="#334155" strokeWidth="2.5" />
            <ellipse cx="78" cy="46" rx="9" ry="12" fill="#fda4af" />

            {/* Đầu voi tròn trịa ú nần */}
            <circle cx="50" cy="48" r="26" fill={`url(#${id}_elephant)`} stroke="#334155" strokeWidth="2.5" />

            {/* Vòi voi cong vút vui vẻ phun ngôi sao */}
            <path
              d="M44 54 C44 70 34 82 46 84 C56 86 64 76 56 66 L56 54"
              fill={`url(#${id}_elephant)`}
              stroke="#334155"
              strokeWidth="2.5"
            />

            {/* Cặp ngà voi trắng muốt chóp tròn an toàn */}
            <path d="M38 58 C32 64 28 62 26 56 C30 55 35 55 38 58 Z" fill="#ffffff" stroke="#334155" strokeWidth="2" />
            <path d="M62 58 C68 64 72 62 74 56 C70 55 65 55 62 58 Z" fill="#ffffff" stroke="#334155" strokeWidth="2" />

            {/* Đôi mắt to tròn long lanh phong cách hoạt hình */}
            <ellipse cx="38" cy="40" rx="5.5" ry="6.5" fill="#ffffff" stroke="#334155" strokeWidth="2" />
            <circle cx="39" cy="40" r="3.5" fill="#0f172a" />
            <circle cx="40.5" cy="38.5" r="1.5" fill="#ffffff" />

            <ellipse cx="62" cy="40" rx="5.5" ry="6.5" fill="#ffffff" stroke="#334155" strokeWidth="2" />
            <circle cx="61" cy="40" r="3.5" fill="#0f172a" />
            <circle cx="62.5" cy="38.5" r="1.5" fill="#ffffff" />

            {/* Má hồng hào */}
            <circle cx="31" cy="50" r="4" fill="#f43f5e" fillOpacity="0.45" />
            <circle cx="69" cy="50" r="4" fill="#f43f5e" fillOpacity="0.45" />

            {/* Chiếc mũ cử nhân / tri thức nhỏ xinh trên đầu */}
            <polygon points="50,14 40,26 60,26" fill={isRed ? '#dc2626' : '#2563eb'} stroke="#0f172a" strokeWidth="2" />
            <circle cx="50" cy="14" r="3.5" fill="#facc15" />
          </g>
        )}

        {/* 2. MÃ (h) = Chú Ngựa Con Tinh Nghịch Mắt Long Lanh 🐴 */}
        {type === 'h' && (
          <g transform="translate(11, 7) scale(0.78)">
            {/* Cổ và thân ngựa bo tròn */}
            <path
              d="M28 84 C24 66 28 48 36 38 C44 26 56 20 68 22 C78 24 82 36 84 50 C86 64 78 76 74 84 Z"
              fill={`url(#${id}_horse)`}
              stroke="#451a03"
              strokeWidth="2.8"
            />

            {/* Bờm ngựa lượn sóng đáng yêu */}
            <path
              d="M36 38 C30 26 26 30 20 20 C30 22 34 14 28 6 C38 10 46 8 50 18 C58 12 62 16 68 22"
              fill={isRed ? '#dc2626' : '#1d4ed8'}
              stroke="#451a03"
              strokeWidth="2.5"
            />

            {/* Đôi tai vểnh tinh anh */}
            <polygon points="58,18 54,4 64,12" fill={isRed ? '#f59e0b' : '#60a5fa'} stroke="#451a03" strokeWidth="2" />
            <polygon points="56,15 55,6 61,11" fill="#fda4af" />
            <polygon points="70,22 74,6 80,16" fill={isRed ? '#f59e0b' : '#60a5fa'} stroke="#451a03" strokeWidth="2" />

            {/* Mõm ngựa bầu bĩnh dễ thương */}
            <ellipse cx="80" cy="48" rx="13" ry="13" fill={isRed ? '#fef08a' : '#dbeafe'} stroke="#451a03" strokeWidth="2.5" />
            <circle cx="82" cy="45" r="2.2" fill="#78350f" />
            <path d="M78 52 Q83 56 86 52" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Đôi mắt to tròn long lanh có tia sáng */}
            <ellipse cx="54" cy="34" rx="7.5" ry="8.5" fill="#ffffff" stroke="#451a03" strokeWidth="2.2" />
            <circle cx="56" cy="34" r="4.8" fill="#0f172a" />
            <circle cx="58" cy="32" r="1.8" fill="#ffffff" />
            <circle cx="54" cy="36" r="0.9" fill="#ffffff" />

            {/* Dây cương gắn lục lạc vàng */}
            <path d="M46 42 L74 52" stroke={isRed ? '#b91c1c' : '#1e3a8a'} strokeWidth="3" strokeLinecap="round" />
            <circle cx="62" cy="48" r="4.2" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />
          </g>
        )}

        {/* 3. TƯỚNG (k) = Vị Tướng Nhí Uy Phong Lẫm Liệt 👑⚔️ */}
        {type === 'k' && (
          <g transform="translate(10, 8) scale(0.8)">
            {/* Áo giáp vai rồng hai bên */}
            <path d="M20 78 C20 62 30 52 50 52 C70 52 80 62 80 78 Z" fill={isRed ? '#b91c1c' : '#1e3a8a'} stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="28" cy="64" r="8" fill="#facc15" stroke="#78350f" strokeWidth="2" />
            <circle cx="72" cy="64" r="8" fill="#facc15" stroke="#78350f" strokeWidth="2" />

            {/* Khuôn mặt tròn phúc hậu */}
            <circle cx="50" cy="46" rx="22" ry="22" fill="#fed7aa" stroke="#78350f" strokeWidth="2.5" />

            {/* Mũ chiến giáp kim loại lấp lánh có lông mao */}
            <path d="M28 36 C28 16 38 12 50 12 C62 12 72 16 72 36 Z" fill={isRed ? '#f59e0b' : '#38bdf8'} stroke="#78350f" strokeWidth="2.5" />
            <polygon points="50,2 45,14 55,14" fill={isRed ? '#ef4444' : '#2563eb'} />
            <circle cx="50" cy="22" r="5" fill="#ef4444" stroke="#78350f" strokeWidth="1.8" />
            <rect x="26" y="32" width="48" height="6" rx="3" fill="#facc15" stroke="#78350f" strokeWidth="2" />

            {/* Đôi mắt dũng cảm quyết đoán */}
            <ellipse cx="40" cy="45" rx="5" ry="6" fill="#ffffff" stroke="#78350f" strokeWidth="2" />
            <circle cx="41" cy="45" r="3.2" fill="#0f172a" />
            <circle cx="42.5" cy="43.5" r="1.3" fill="#ffffff" />

            <ellipse cx="60" cy="45" rx="5" ry="6" fill="#ffffff" stroke="#78350f" strokeWidth="2" />
            <circle cx="59" cy="45" r="3.2" fill="#0f172a" />
            <circle cx="60.5" cy="43.5" r="1.3" fill="#ffffff" />

            {/* Lông mày tướng quân */}
            <path d="M34 38 L45 41" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M66 38 L55 41" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />

            {/* Nụ cười tự tin hào sảng */}
            <path d="M44 54 Q50 60 56 54" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="34" cy="50" r="3.5" fill="#fda4af" />
            <circle cx="66" cy="50" r="3.5" fill="#fda4af" />
          </g>
        )}

        {/* 4. SĨ (a) = Chú Quân Sư Tí Hon Cầm Quạt Bí Kíp 🪭📜 */}
        {type === 'a' && (
          <g transform="translate(10, 8) scale(0.8)">
            {/* Áo quan văn nhã nhặn */}
            <path d="M22 78 C22 62 32 54 50 54 C68 54 78 62 78 78 Z" fill={isRed ? '#f43f5e' : '#6366f1'} stroke="#0f172a" strokeWidth="2.5" />
            {/* Cổ áo giao lĩnh trắng */}
            <polygon points="44,54 50,66 56,54" fill="#ffffff" stroke="#0f172a" strokeWidth="1.8" />

            {/* Mặt tròn thông minh */}
            <circle cx="50" cy="44" r="21" fill="#fed7aa" stroke="#78350f" strokeWidth="2.5" />

            {/* Mũ cánh chuồn quan văn */}
            <path d="M32 30 C32 16 40 14 50 14 C60 14 68 16 68 30 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
            <ellipse cx="18" cy="28" rx="10" ry="3.5" fill="#334155" stroke="#0f172a" strokeWidth="1.8" />
            <ellipse cx="82" cy="28" rx="10" ry="3.5" fill="#334155" stroke="#0f172a" strokeWidth="1.8" />
            <circle cx="50" cy="22" r="3.5" fill="#facc15" />

            {/* Mắt to tròn đeo kính tri thức */}
            <circle cx="41" cy="44" r="7" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="59" cy="44" r="7" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <line x1="48" y1="44" x2="52" y2="44" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="41" cy="44" r="3" fill="#0f172a" />
            <circle cx="42" cy="42.5" r="1.2" fill="#ffffff" />
            <circle cx="59" cy="44" r="3" fill="#0f172a" />
            <circle cx="60" cy="42.5" r="1.2" fill="#ffffff" />

            {/* Nụ cười hiền hậu */}
            <path d="M46 54 Q50 58 54 54" stroke="#78350f" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Chiếc quạt lông vũ thần kỳ */}
            <path d="M68 56 C78 52 84 62 76 72 Z" fill="#fef08a" stroke="#78350f" strokeWidth="1.8" />
          </g>
        )}

        {/* 5. XE (r) = Chiến Xa / Xe Tăng Thiết Giáp Mini Siêu Ngầu 🚙🛡️ */}
        {type === 'r' && (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Cờ lệnh trên nóc */}
            <line x1="50" y1="6" x2="50" y2="24" stroke="#0f172a" strokeWidth="2.5" />
            <polygon points="50,8 68,14 50,20" fill={isRed ? '#ef4444' : '#3b82f6'} stroke="#0f172a" strokeWidth="1.8" />

            {/* Tháp pháo cabin trên */}
            <rect x="32" y="22" width="36" height="18" rx="6" fill={isRed ? '#dc2626' : '#2563eb'} stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="50" cy="30" r="5" fill="#fef08a" stroke="#0f172a" strokeWidth="1.8" />

            {/* Thân chiến xa việt dã */}
            <rect x="18" y="38" width="64" height="26" rx="8" fill={`url(#${id}_tank)`} stroke="#0f172a" strokeWidth="3" />

            {/* Đèn pha tròn chiếu sáng ban đêm */}
            <circle cx="28" cy="50" r="6" fill="#fef08a" stroke="#0f172a" strokeWidth="2" />
            <circle cx="28" cy="50" r="3" fill="#ffffff" />
            <circle cx="72" cy="50" r="6" fill="#fef08a" stroke="#0f172a" strokeWidth="2" />
            <circle cx="72" cy="50" r="3" fill="#ffffff" />

            {/* Lưới tản nhiệt mạnh mẽ */}
            <rect x="40" y="46" width="20" height="10" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="45" y1="47" x2="45" y2="55" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="50" y1="47" x2="50" y2="55" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="55" y1="47" x2="55" y2="55" stroke="#94a3b8" strokeWidth="1.5" />

            {/* Bánh xích / bánh xe địa hình hầm hố */}
            <rect x="12" y="62" width="76" height="16" rx="8" fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
            {[22, 36, 50, 64, 78].map((bx, idx) => (
              <circle key={idx} cx={bx} cy="70" r="4.5" fill="#94a3b8" stroke="#0f172a" strokeWidth="1.5" />
            ))}
          </g>
        )}

        {/* 6. PHÁO (c) = Đại Pháo Thần Công Chibi Bắn Sao 💣✨ */}
        {type === 'c' && (
          <g transform="translate(10, 10) scale(0.8)">
            {/* Chùm sao lửa nòng pháo bay ra */}
            <polygon points="76,14 78,20 84,21 79,25 81,31 75,27 70,30 73,24 68,21 74,19" fill="#facc15" stroke="#d97706" strokeWidth="1.5" />
            <circle cx="82" cy="16" r="2.5" fill="#ef4444" />

            {/* Nòng đại pháo thần công nghiêng góc 25 độ */}
            <g transform="rotate(-18 48 50)">
              <rect x="30" y="32" width="46" height="20" rx="6" fill={`url(#${id}_cannon)`} stroke="#0f172a" strokeWidth="2.8" />
              <rect x="72" y="30" width="8" height="24" rx="4" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
              {/* Đai gia cố nòng vàng */}
              <rect x="42" y="31" width="5" height="22" fill="#facc15" />
              <rect x="56" y="31" width="5" height="22" fill="#facc15" />
            </g>

            {/* Thân bệ pháo bo tròn */}
            <ellipse cx="42" cy="54" rx="14" ry="12" fill={isRed ? '#dc2626' : '#2563eb'} stroke="#0f172a" strokeWidth="2.5" />

            {/* Hai bánh xe gỗ cổ điển to tròn */}
            <circle cx="42" cy="66" r="16" fill="#78350f" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="42" cy="66" r="10" fill="#fed7aa" stroke="#0f172a" strokeWidth="2" />
            <circle cx="42" cy="66" r="4" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
            {/* Nan hoa bánh xe */}
            <line x1="42" y1="50" x2="42" y2="82" stroke="#78350f" strokeWidth="2" />
            <line x1="26" y1="66" x2="58" y2="66" stroke="#78350f" strokeWidth="2" />
          </g>
        )}

        {/* 7. TỐT / BINH (p) = Chú Lính Nhỏ Dũng Cảm Cầm Khiên Ngôi Sao 💂🛡️ */}
        {type === 'p' && (
          <g transform="translate(10, 8) scale(0.8)">
            {/* Thân áo chiến binh */}
            <rect x="30" y="54" width="40" height="26" rx="6" fill={isRed ? '#dc2626' : '#2563eb'} stroke="#0f172a" strokeWidth="2.5" />
            <rect x="30" y="66" width="40" height="6" fill="#0f172a" />
            <rect x="46" y="65" width="8" height="8" rx="2" fill="#facc15" />

            {/* Mặt tròn bụ bẫm */}
            <circle cx="50" cy="42" r="21" fill="#fed7aa" stroke="#78350f" strokeWidth="2.5" />

            {/* Mũ nồi chiến binh tròn có huy hiệu ngôi sao */}
            <path d="M28 32 C28 16 38 10 50 10 C62 10 72 16 72 32 Z" fill={isRed ? '#ef4444' : '#3b82f6'} stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="50" cy="22" r="4.5" fill="#facc15" stroke="#78350f" strokeWidth="1.5" />

            {/* Đôi mắt tròn xoe ngây thơ */}
            <circle cx="41" cy="42" r="3.8" fill="#0f172a" />
            <circle cx="42.5" cy="40.5" r="1.3" fill="#ffffff" />
            <circle cx="59" cy="42" r="3.8" fill="#0f172a" />
            <circle cx="60.5" cy="40.5" r="1.3" fill="#ffffff" />

            {/* Má hồng chúm chím */}
            <circle cx="34" cy="48" r="3.5" fill="#fda4af" />
            <circle cx="66" cy="48" r="3.5" fill="#fda4af" />

            {/* Nụ cười vui tươi */}
            <path d="M45 50 Q50 55 55 50" stroke="#78350f" strokeWidth="2.2" fill="none" strokeLinecap="round" />

            {/* Chiếc khiên ngôi sao bảo vệ dũng cảm */}
            <ellipse cx="22" cy="62" rx="10" ry="14" fill="#facc15" stroke="#78350f" strokeWidth="2" />
            <polygon points="22,55 24,60 29,60 25,63 27,68 22,65 17,68 19,63 15,60 20,60" fill="#dc2626" />
          </g>
        )}

        {/* Nhãn chữ Việt bo góc chân đế giúp bé nhận biết cả hình lẫn chữ */}
        <g transform="translate(24, 77)">
          <rect
            x="0"
            y="0"
            width="52"
            height="15"
            rx="7.5"
            fill={isRed ? '#b91c1c' : '#1e3a8a'}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <text
            x="26"
            y="10.8"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="Nunito, sans-serif"
            letterSpacing="0.05em"
          >
            {BADGE_LABEL[type]}
          </text>
        </g>
      </g>
    </svg>
  );
};
