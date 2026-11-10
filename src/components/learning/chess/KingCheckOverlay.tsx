import React, { useEffect } from 'react';
import { ShieldAlert, Sparkles, X } from 'lucide-react';

interface KingCheckOverlayProps {
  show: boolean;
  onDismiss: () => void;
}

export const KingCheckOverlay: React.FC<KingCheckOverlayProps> = ({ show, onDismiss }) => {
  // Bấm phím Escape để đóng nhanh lớp phủ
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Cảnh báo vua bị chiếu tướng"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-sm rounded-[32px] bg-gradient-to-b from-amber-50 via-white to-orange-50 border-4 border-amber-400 p-6 shadow-2xl text-center flex flex-col items-center gap-4 overflow-hidden transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng góc phải */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
          aria-label="Đóng cảnh báo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Huy hiệu cảnh báo */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500 text-white font-black text-sm tracking-wide shadow-md animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          <span>CHIẾU TƯỚNG! NGUY HIỂM!</span>
        </div>

        {/* Hình minh họa hoạt hình Ông Vua hoảng sợ cực ngộ nghĩnh */}
        <div className="relative w-36 h-36 flex items-center justify-center my-1">
          {/* Vòng hào quang rung động */}
          <div className="absolute inset-0 rounded-full bg-rose-200/50 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-amber-100 border-2 border-dashed border-amber-300" />

          <svg
            viewBox="0 0 100 100"
            className="w-32 h-32 relative z-10 select-none animate-bounce"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Tia sét hoảng hốt xung quanh */}
            <path d="M12 24 L20 32 L15 36 L25 44" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M88 24 L80 32 L85 36 L75 44" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Giọt mồ hôi bắn ra từ hai thái dương */}
            <path d="M16 48 C16 44 22 38 22 38 C22 38 26 44 26 48 C26 51 22 53 16 48 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <path d="M84 48 C84 44 78 38 78 38 C78 38 74 44 74 48 C74 51 78 53 84 48 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />

            {/* Mặt vua hoảng sợ */}
            <circle cx="50" cy="56" r="28" fill="#fef08a" stroke="#78350f" strokeWidth="3.5" />

            {/* Vương miện vàng lệch một bên do giật mình */}
            <g transform="rotate(-6 50 25)">
              <polygon points="26,28 30,10 50,18 70,10 74,28" fill="#facc15" stroke="#78350f" strokeWidth="3.5" />
              <circle cx="50" cy="18" r="4" fill="#ef4444" />
              <circle cx="30" cy="10" r="3.5" fill="#3b82f6" />
              <circle cx="70" cy="10" r="3.5" fill="#10b981" />
            </g>

            {/* Bộ râu quý tộc xù lên vì sợ */}
            <path
              d="M26 62 C26 84 38 92 50 92 C62 92 74 84 74 62 C70 68 60 72 50 72 C40 72 30 68 26 62 Z"
              fill="#e2e8f0"
              stroke="#64748b"
              strokeWidth="3"
            />

            {/* Mắt trợn tròn trố ra */}
            <ellipse cx="38" cy="50" rx="9" ry="10" fill="#ffffff" stroke="#78350f" strokeWidth="3" />
            <circle cx="38" cy="50" r="3.5" fill="#0f172a" />
            <circle cx="40" cy="48" r="1.5" fill="#ffffff" />

            <ellipse cx="62" cy="50" rx="9" ry="10" fill="#ffffff" stroke="#78350f" strokeWidth="3" />
            <circle cx="62" cy="50" r="3.5" fill="#0f172a" />
            <circle cx="64" cy="48" r="1.5" fill="#ffffff" />

            {/* Lông mày nhướng cao ngơ ngác */}
            <path d="M28 38 L42 43" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M72 38 L58 43" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />

            {/* Miệng há hốc chữ O to đùng đang kêu cứu */}
            <ellipse cx="50" cy="68" rx="10" ry="12" fill="#991b1b" stroke="#78350f" strokeWidth="3" />
            <ellipse cx="50" cy="73" rx="6" ry="5" fill="#f87171" />

            {/* Hai bàn tay ôm má kinh ngạc */}
            <circle cx="22" cy="62" r="6" fill="#fed7aa" stroke="#78350f" strokeWidth="2.5" />
            <circle cx="78" cy="62" r="6" fill="#fed7aa" stroke="#78350f" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Lời thoại của Vua cầu cứu bé */}
        <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-3.5 text-slate-800 text-sm font-bold shadow-2xs">
          <p className="text-amber-900 font-extrabold text-base mb-1">
            &ldquo;Ôi nguy quá, Tướng quân ơi!&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
            Quân địch đang uy hiếp chiếu tướng trẫm! Mau tìm nước đi an toàn để bảo vệ Vua ngay nhé!
          </p>
        </div>

        {/* Nút hành động giải cứu Vua */}
        <button
          onClick={onDismiss}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-amber-200" />
          <span>Giải Cứu Vua Mau! 🛡️</span>
        </button>
      </div>
    </div>
  );
};
