import React from 'react';
import type { Color, PieceType } from './cotuongEngine';
import { PIECE_CHAR, PIECE_VIET_NAME, type CotuongLabelMode } from './CotuongBoard3D';

interface CotuongPieceSvgProps {
  type: PieceType;
  color: Color;
  size?: number | string;
  className?: string;
  labelMode?: CotuongLabelMode;
}

/**
 * Quân cờ tướng vector chuẩn: dáng đĩa gỗ tròn chạm rãnh đồng tâm,
 * chữ thư pháp khắc chìm sơn son đỏ (Đỏ) hoặc sơn then đen (Đen).
 */
export const CotuongPieceSvg: React.FC<CotuongPieceSvgProps> = ({
  type,
  color,
  size = 56,
  className = '',
  labelMode = 'dual',
}) => {
  const isRed = color === 'red';
  const idPrefix = `ctp_${color}_${type}`;
  const char = PIECE_CHAR[`${color}-${type}`] || '';
  const vietName = PIECE_VIET_NAME[`${color}-${type}`] || '';

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none transition-transform ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${vietName} ${isRed ? 'đỏ' : 'đen'}`}
    >
      <defs>
        {/* Đĩa gỗ chính: gradient gỗ phong vàng ấm tự nhiên */}
        <radialGradient id={`${idPrefix}_wood`} cx="36%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor="#fdf3de" />
          <stop offset="68%" stopColor="#efd5a3" />
          <stop offset="100%" stopColor="#ce9d61" />
        </radialGradient>

        {/* Thành viền ngoài (đế gỗ) */}
        <linearGradient id={`${idPrefix}_rim`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a87439" />
          <stop offset="100%" stopColor="#673d17" />
        </linearGradient>

        {/* Bóng đổ tiếp đất */}
        <filter id={`${idPrefix}_shadow`} x="-20%" y="-10%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" floodColor="#3f1f06" floodOpacity="0.45" />
          <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#231003" floodOpacity="0.6" />
        </filter>

        {/* Khắc chìm cho chữ */}
        <filter id={`${idPrefix}_carve`}>
          <feDropShadow dx="0" dy="1" stdDeviation="0.4" floodColor="#ffffff" floodOpacity="0.85" />
          <feDropShadow dx="0" dy="-0.8" stdDeviation="0.4" floodColor={isRed ? '#701010' : '#0a0a0a'} floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Bóng đổ tiếp đất dưới chân quân */}
      <circle cx="50" cy="53" r="44" fill="#000000" opacity="0.22" filter={`url(#${idPrefix}_shadow)`} />

      {/* Khối đế gỗ */}
      <circle cx="50" cy="51" r="45" fill={`url(#${idPrefix}_rim)`} />

      {/* Mặt quân cờ gỗ */}
      <circle cx="50" cy="48" r="43.5" fill={`url(#${idPrefix}_wood)`} stroke="#a47238" strokeWidth="1.2" />

      {/* Vòng rãnh tròn đồng tâm khắc chìm */}
      <circle
        cx="50"
        cy="48"
        r="37"
        stroke="#8b5726"
        strokeWidth="1.2"
        strokeOpacity="0.5"
        fill="none"
      />
      <circle
        cx="50"
        cy="48"
        r="36"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeOpacity="0.75"
        fill="none"
      />

      {/* Nội dung chữ trên quân cờ */}
      {labelMode === 'viet' ? (
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill={isRed ? '#b91c1c' : '#1e293b'}
          fontSize="22"
          fontWeight="900"
          fontFamily="Nunito, sans-serif"
          letterSpacing="-0.03em"
          filter={`url(#${idPrefix}_carve)`}
        >
          {vietName}
        </text>
      ) : labelMode === 'dual' ? (
        <g filter={`url(#${idPrefix}_carve)`}>
          <text
            x="50"
            y="47"
            textAnchor="middle"
            fill={isRed ? '#b91c1c' : '#1e293b'}
            fontSize="32"
            fontWeight="900"
            fontFamily="'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', 'Kaiti SC', serif"
          >
            {char}
          </text>
          <rect
            x="24"
            y="56"
            width="52"
            height="15"
            rx="7.5"
            fill={isRed ? '#fee2e2' : '#f1f5f9'}
            stroke={isRed ? '#fca5a5' : '#cbd5e1'}
            strokeWidth="0.8"
          />
          <text
            x="50"
            y="67"
            textAnchor="middle"
            fill={isRed ? '#b91c1c' : '#1e293b'}
            fontSize="9.5"
            fontWeight="900"
            fontFamily="Nunito, sans-serif"
            letterSpacing="0.04em"
          >
            {vietName}
          </text>
        </g>
      ) : (
        <text
          x="50"
          y="59"
          textAnchor="middle"
          fill={isRed ? '#b91c1c' : '#1e293b'}
          fontSize="40"
          fontWeight="900"
          fontFamily="'Noto Serif SC', 'Songti SC', 'STSong', 'SimSun', 'Kaiti SC', serif"
          filter={`url(#${idPrefix}_carve)`}
        >
          {char}
        </text>
      )}
    </svg>
  );
};

export default CotuongPieceSvg;
