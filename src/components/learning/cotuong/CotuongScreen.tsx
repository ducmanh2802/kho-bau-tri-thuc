import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Gamepad2, Lightbulb, Play, Target } from 'lucide-react';
import { sound } from '../../../services/sound';
import { CotuongGame } from './CotuongGame';
import { CotuongPuzzlesView } from './CotuongPuzzlesView';
import { CotuongPieceSvg } from './CotuongPieceSvg';
import { CotuongMoveDemo } from './CotuongMoveDemo';
import type { PieceType } from './cotuongEngine';

interface PieceDetail {
  name: string;
  type: PieceType;
  redChar: string;
  blackChar: string;
  moves: string;
  desc: string;
  tactics: string;
}

const PIECES: PieceDetail[] = [
  {
    name: 'Tướng',
    type: 'k',
    redChar: '帥',
    blackChar: '將',
    moves: 'Đi 1 ô ngang hoặc dọc trong Cung cấm',
    desc: 'Vị vua tối cao của bàn cờ. Tướng bị chiếu hết là ván cờ kết thúc. Hai Tướng của 2 bên không bao giờ được nhìn thẳng mặt nhau trên cùng một cột mà không có quân cản.',
    tactics: 'Luôn bố trí Sĩ và Tượng che chắn cẩn thận, không để hở lộ Tướng.',
  },
  {
    name: 'Sĩ',
    type: 'a',
    redChar: '仕',
    blackChar: '士',
    moves: 'Đi chéo 1 ô trong Cung cấm',
    desc: 'Hộ vệ trung thành, chỉ di chuyển trong phạm vi Cung cấm 3×3. Hai Sĩ cùng với Tướng tạo nên thế phòng ngự vững chắc.',
    tactics: 'Giữ cặp Sĩ kết hợp để ngăn chặn các đòn tấn công thọc sâu của Xe và Pháo.',
  },
  {
    name: 'Tượng',
    type: 'e',
    redChar: '相',
    blackChar: '象',
    moves: 'Đi chéo 2 ô (ô 2×2), không qua sông',
    desc: 'Quân phòng thủ tầm xa ở sân nhà. Tượng không bao giờ được qua sông. Nếu có quân đứng ở giữa đường chéo (mắt Tượng) thì Tượng không nhảy được.',
    tactics: 'Tượng liên kết chéo bảo vệ toàn bộ tuyến đáy và hỗ trợ giữ chặt trung lộ.',
  },
  {
    name: 'Mã',
    type: 'h',
    redChar: '馬',
    blackChar: '馬',
    moves: 'Nhảy chữ L (1 ô thẳng + 1 ô chéo)',
    desc: 'Quân nhảy biến hóa khôn lường. Nếu có quân đứng cản ngay sát cạnh theo hướng di chuyển (chân Mã) thì Mã không thể nhảy qua.',
    tactics: 'Tránh để chân Mã bị cản bởi Tốt hoặc Xe của đối phương.',
  },
  {
    name: 'Xe',
    type: 'r',
    redChar: '車',
    blackChar: '車',
    moves: 'Đi ngang hoặc dọc không giới hạn ô',
    desc: 'Quân mạnh nhất và cơ động nhất trên bàn cờ, kiểm soát các hàng và cột thông suốt với sức công phá cực lớn.',
    tactics: 'Nhanh chóng xuất Xe sớm để chiếm các lộ quan trọng (lộ sườn, lộ 4, lộ 6).',
  },
  {
    name: 'Pháo',
    type: 'c',
    redChar: '炮',
    blackChar: '砲',
    moves: 'Đi như Xe, ăn quân phải nhảy qua 1 ngòi',
    desc: 'Khi di chuyển bình thường, Pháo đi dọc hoặc ngang tự do. Khi ăn quân đối phương, Pháo bắt buộc phải nhảy qua đúng một quân bất kỳ làm ngòi.',
    tactics: 'Pháo đầu uy hiếp trung lộ, Song Pháo giáp công có thể tạo thế chiếu bí cực hiểm.',
  },
  {
    name: 'Binh (Tốt)',
    type: 'p',
    redChar: '兵',
    blackChar: '卒',
    moves: 'Tiến 1 ô thẳng; qua sông được đi ngang',
    desc: 'Người lính dũng cảm không bao giờ đi lùi. Khi chưa qua sông chỉ tiến thẳng 1 ô. Khi đã qua sông, Binh có thể tiến hoặc đi ngang 1 ô.',
    tactics: 'Binh qua sông kiểm soát không gian và hỗ trợ Mã, Pháo công thành.',
  },
];

const RULES = [
  { icon: '🎯', title: 'Mục tiêu chiến thắng', text: 'Chiếu hết (hoặc vây chặt làm đối phương hết nước đi hợp lệ).' },
  { icon: '🏯', title: 'Cung cấm (Cửu cung)', text: 'Ô vuông 3×3 có đường chéo ở hai đầu sân; Tướng và Sĩ không bao giờ được bước ra ngoài.' },
  { icon: '🌊', title: 'Sông (Sở Hà - Hán Giới)', text: 'Tượng không qua sông; Binh (Tốt) khi đã qua sông sẽ có thêm quyền đi ngang.' },
  { icon: '💥', title: 'Quy tắc ngòi Pháo', text: 'Pháo muốn ăn quân bắt buộc phải có đúng một quân (bất kể của bên nào) đứng ở giữa làm ngòi.' },
  { icon: '🚫', title: 'Cản chân Mã & Chặn mắt Tượng', text: 'Nếu có quân đứng ngay cạnh chân Mã hoặc tâm chéo mắt Tượng thì nước đi bị khóa.' },
  { icon: '👀', title: 'Lộ diện Tướng (Mặt Tướng đối nhau)', text: 'Hai Tướng không được nằm trên cùng một cột mà không có quân cờ nào đứng giữa chắn.' },
  { icon: '🛡️', title: 'Bảo vệ Tướng', text: 'Không bao giờ được đi nước cờ tự đặt Tướng của mình vào thế bị đối phương chiếu.' },
];

const TABS = [
  { id: 'pieces' as const, label: 'Quân cờ', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'demo' as const, label: 'Nước đi mẫu', icon: <Play className="w-4 h-4" /> },
  { id: 'rules' as const, label: 'Luật chơi', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'play' as const, label: 'Chơi 3D', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'puzzles' as const, label: 'Luyện thế cờ', icon: <Target className="w-4 h-4" /> },
];

export const CotuongScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tab, setTab] = useState<'pieces' | 'demo' | 'rules' | 'play' | 'puzzles'>('pieces');

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-5 sm:py-6 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="px-4 py-2 bg-white/80 hover:bg-white rounded-xl font-bold text-slate-700 flex items-center gap-2 border-2 border-amber-200 shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <h1 className="text-xl sm:text-2xl font-black font-display text-slate-900 flex items-center gap-2">
          <span>♟️</span>
          <span>Vương Quốc Cờ Tướng 3D</span>
        </h1>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-rose-600 p-5 sm:p-7 text-white shadow-xl border-4 border-white/60">
        <div className="absolute -right-6 -top-8 text-[8.5rem] opacity-15 select-none font-serif" aria-hidden="true">
          帥
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-display">Học cờ chuẩn — Đấu trí 3D</h2>
        <p className="mt-1 max-w-xl text-sm sm:text-base font-bold text-white/95">
          Bàn cờ chuẩn giao điểm, quân cờ chạm nổi 3D, âm thanh sinh động, có minh họa nước đi,
          gợi ý nước cờ và thử thách 6 thế cờ kinh điển!
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm font-black">
          <span className="rounded-full bg-white/20 px-3 py-1">🎯 Bàn cờ chuẩn giao điểm</span>
          <span className="rounded-full bg-white/20 px-3 py-1">🪵 Bàn 3D xoay góc nhìn</span>
          <span className="rounded-full bg-white/20 px-3 py-1">🇻🇳 Song ngữ Hán - Việt</span>
          <span className="rounded-full bg-white/20 px-3 py-1">💡 Gợi ý & Đi lại</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              sound.playClick();
              setTab(t.id);
            }}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              tab === t.id
                ? 'bg-amber-500 text-white shadow-md scale-105'
                : 'bg-white/80 text-slate-700 border-2 border-amber-200 hover:bg-amber-50'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'pieces' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm font-bold text-amber-900">
            <span>✨ Mỗi quân cờ có mặt chữ riêng biệt cho phe Đỏ và phe Đen. Nhấp vào quân để xem demo nước đi.</span>
            <button
              onClick={() => {
                sound.playClick();
                setTab('demo');
              }}
              className="px-3 py-1 rounded-xl bg-amber-500 text-white font-black hover:bg-amber-600 transition-colors cursor-pointer"
            >
              Xem tất cả nước đi mẫu ▶
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 stagger">
            {PIECES.map((p) => (
              <div
                key={p.name}
                className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-slate-900">{p.name}</h3>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {p.redChar} / {p.blackChar}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-amber-700">{p.moves}</p>
                  </div>

                  {/* Cặp quân cờ Đỏ và Đen nổi 3D */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-center">
                      <CotuongPieceSvg type={p.type} color="red" size={46} labelMode="dual" />
                      <span className="text-[10px] font-black text-red-600 block mt-0.5">ĐỎ</span>
                    </div>
                    <div className="text-center">
                      <CotuongPieceSvg type={p.type} color="black" size={46} labelMode="dual" />
                      <span className="text-[10px] font-black text-slate-700 block mt-0.5">ĐEN</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {p.desc}
                </p>

                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-xs font-bold text-amber-900 flex items-center justify-between gap-2">
                  <span>💡 <em>{p.tactics}</em></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'demo' && <CotuongMoveDemo />}

      {tab === 'rules' && (
        <div className="p-4 sm:p-6 rounded-3xl bg-white border-2 border-amber-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">Luật chơi Cờ Tướng cơ bản cho bé</h3>
              <p className="text-xs sm:text-sm font-bold text-slate-500">
                Ghi nhớ 7 quy tắc vàng dưới đây để tự tin làm chủ bàn cờ!
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {RULES.map((r, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3"
              >
                <span className="text-2xl shrink-0 leading-none pt-0.5" aria-hidden="true">
                  {r.icon}
                </span>
                <div className="space-y-0.5">
                  <h4 className="font-black text-sm text-slate-900">{r.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    {r.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setTab('demo');
              }}
              className="px-5 py-2.5 rounded-2xl bg-amber-100 text-amber-900 font-black hover:bg-amber-200 transition-colors cursor-pointer"
            >
              Xem minh họa nước đi ▶
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setTab('play');
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all cursor-pointer"
            >
              Vào ván chơi 3D ngay ▶
            </button>
          </div>
        </div>
      )}

      {tab === 'play' && <CotuongGame embedded onBack={() => setTab('pieces')} />}
      {tab === 'puzzles' && <CotuongPuzzlesView />}
    </div>
  );
};

export default CotuongScreen;
