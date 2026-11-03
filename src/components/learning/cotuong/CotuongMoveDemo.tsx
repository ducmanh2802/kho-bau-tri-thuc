import React, { useState, useEffect } from 'react';
import type { PieceType } from './cotuongEngine';
import { CotuongPieceSvg } from './CotuongPieceSvg';

interface DemoItem {
  type: PieceType;
  title: string;
  desc: string;
  ruleNote: string;
  from: [number, number];
  to: [number, number];
  targetPiece?: { type: PieceType; color: 'red' | 'black' };
  screenPiece?: { type: PieceType; color: 'red' | 'black'; pos: [number, number] };
  blockPiece?: { type: PieceType; color: 'red' | 'black'; pos: [number, number] };
}

const DEMOS: DemoItem[] = [
  {
    type: 'r',
    title: 'Xe — Quân cơ động và mạnh nhất',
    desc: 'Xe đi ngang hoặc dọc bao nhiêu ô tùy ý miễn là trên đường đi không có quân cản.',
    ruleNote: '💡 Khi đường thông, Xe có thể quét sạch một hàng hoặc một cột!',
    from: [9, 0],
    to: [3, 0],
  },
  {
    type: 'c',
    title: 'Pháo — Bắn phá cự ly xa',
    desc: 'Khi di chuyển bình thường, Pháo đi như Xe. Khi ăn quân, Pháo bắt buộc phải nhảy qua đúng 1 quân làm ngòi.',
    ruleNote: '💡 Quân ngòi có thể là quân của mình hoặc quân của đối phương!',
    from: [7, 1],
    to: [0, 1],
    screenPiece: { type: 'p', color: 'black', pos: [3, 1] },
    targetPiece: { type: 'r', color: 'black' },
  },
  {
    type: 'h',
    title: 'Mã — Nhảy chữ L biến hóa',
    desc: 'Mã đi 1 ô thẳng rồi 1 ô chéo (hình chữ L). Nếu có quân đứng ngay cạnh chặn ở "chân Mã" thì không nhảy được.',
    ruleNote: '💡 Chú ý tránh để quân đối phương chặn chân Mã của mình nhé!',
    from: [7, 1],
    to: [5, 2],
  },
  {
    type: 'e',
    title: 'Tượng — Phòng thủ cánh gà',
    desc: 'Tượng bay chéo đúng 2 ô (ô 2×2). Tượng không bao giờ qua sông và không thể nhảy nếu bị chặn "mắt Tượng".',
    ruleNote: '💡 Tượng giữ vai trò bảo vệ thành lũy và cung tướng bên mình.',
    from: [9, 2],
    to: [7, 4],
  },
  {
    type: 'a',
    title: 'Sĩ — Hộ vệ trung thành',
    desc: 'Sĩ chỉ đi chéo 1 ô và không bao giờ rời khỏi Cung cấm (khu vực 3×3 có đường chéo).',
    ruleNote: '💡 Hai Sĩ tạo thành lá chắn che chở cho Tướng khỏi Pháo và Xe!',
    from: [9, 3],
    to: [8, 4],
  },
  {
    type: 'k',
    title: 'Tướng — Vị vua tối thượng',
    desc: 'Tướng chỉ đi 1 ô ngang hoặc dọc trong Cung cấm. Hai Tướng của 2 bên không bao giờ được nhìn thẳng mặt nhau.',
    ruleNote: '💡 Tướng bị chiếu hết là ván cờ kết thúc!',
    from: [9, 4],
    to: [8, 4],
  },
  {
    type: 'p',
    title: 'Binh (Tốt) — Dũng sĩ không lùi bước',
    desc: 'Trước khi qua sông, Binh chỉ tiến 1 ô thẳng. Khi đã sang sông, Binh được đi ngang hoặc tiến, không bao giờ đi lùi.',
    ruleNote: '💡 Tốt qua sông mạnh mẽ tựa như một nửa quân Xe!',
    from: [6, 4],
    to: [5, 4],
  },
];

export const CotuongMoveDemo: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          return 0;
        }
        return prev + 0.025;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [isPaused, activeIdx]);

  const item = DEMOS[activeIdx];
  const currR = item.from[0] + (item.to[0] - item.from[0]) * progress;
  const currC = item.from[1] + (item.to[1] - item.from[1]) * progress;

  // Board viewBox coordinates: 8 columns (width=8), 9 rows (height=9)
  const M = 0.6;
  const VW = 8 + M * 2;
  const VH = 9 + M * 2;
  const xPct = (c: number) => ((M + c) / VW) * 100;
  const yPct = (r: number) => ((M + r) / VH) * 100;

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-amber-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center gap-2">
          <span>🎬 Minh Họa Nước Đi:</span>
          <span className="text-amber-700">{item.title}</span>
        </h3>
        <div className="flex gap-1.5 flex-wrap">
          {DEMOS.map((d, i) => (
            <button
              key={d.type}
              onClick={() => {
                setActiveIdx(i);
                setProgress(0);
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeIdx === i
                  ? 'bg-amber-500 text-white shadow-xs scale-105'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              {d.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4 items-center">
        {/* Bàn cờ minh họa chuẩn */}
        <div className="relative mx-auto rounded-2xl border-4 border-amber-800 bg-[#f7e6c4] shadow-md p-2 w-full max-w-[280px]">
          <div className="relative aspect-[9.2/10.2] w-full overflow-hidden rounded-lg">
            {/* SVG bàn cờ */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${VW} ${VH}`}
            >
              <g transform={`translate(${M} ${M})`} stroke="#8a5424" strokeWidth="0.04" fill="none">
                {/* Đường ngang */}
                {Array.from({ length: 10 }).map((_, r) => (
                  <line key={`h${r}`} x1={0} y1={r} x2={8} y2={r} strokeWidth={r === 0 || r === 9 ? 0.07 : 0.04} />
                ))}
                {/* Đường dọc */}
                {Array.from({ length: 9 }).map((_, c) =>
                  c === 0 || c === 8 ? (
                    <line key={`v${c}`} x1={c} y1={0} x2={c} y2={9} strokeWidth={0.07} />
                  ) : (
                    <React.Fragment key={`v${c}`}>
                      <line x1={c} y1={0} x2={c} y2={4} />
                      <line x1={c} y1={5} x2={c} y2={9} />
                    </React.Fragment>
                  )
                )}
                {/* Cung Tướng */}
                <path d="M3,0 L5,2 M5,0 L3,2" />
                <path d="M3,7 L5,9 M5,7 L3,9" />
              </g>
              {/* Chữ Sông */}
              <text x={M + 2} y={M + 4.6} textAnchor="middle" fill="#8a5424" fontSize="0.45" fontWeight="bold" opacity="0.6">
                楚 河
              </text>
              <text x={M + 6} y={M + 4.6} textAnchor="middle" fill="#8a5424" fontSize="0.45" fontWeight="bold" opacity="0.6">
                漢 界
              </text>
            </svg>

            {/* Vị trí xuất phát */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-dashed border-amber-600 bg-amber-400/25 pointer-events-none animate-pulse"
              style={{ left: `${xPct(item.from[1])}%`, top: `${yPct(item.from[0])}%` }}
            />

            {/* Vị trí đích đến */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-emerald-500 bg-emerald-400/30 pointer-events-none"
              style={{ left: `${xPct(item.to[1])}%`, top: `${yPct(item.to[0])}%` }}
            />

            {/* Quân làm ngòi (nếu có - vd Pháo) */}
            {item.screenPiece && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none"
                style={{ left: `${xPct(item.screenPiece.pos[1])}%`, top: `${yPct(item.screenPiece.pos[0])}%` }}
              >
                <CotuongPieceSvg type={item.screenPiece.type} color={item.screenPiece.color} size="100%" labelMode="han" />
              </div>
            )}

            {/* Quân mục tiêu bị ăn (nếu có) */}
            {item.targetPiece && (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none"
                style={{
                  left: `${xPct(item.to[1])}%`,
                  top: `${yPct(item.to[0])}%`,
                  opacity: progress > 0.85 ? Math.max(0, (1 - progress) / 0.15) : 1,
                  transform: `translate(-50%, -50%) scale(${progress > 0.85 ? 1 + (progress - 0.85) * 2 : 1})`,
                }}
              >
                <CotuongPieceSvg type={item.targetPiece.type} color={item.targetPiece.color} size="100%" labelMode="han" />
              </div>
            )}

            {/* Quân đang di chuyển */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none drop-shadow-md"
              style={{ left: `${xPct(currC)}%`, top: `${yPct(currR)}%` }}
            >
              <CotuongPieceSvg type={item.type} color="red" size="100%" labelMode="dual" />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-amber-900 px-1">
            <span>🔴 Xuất phát</span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-2 py-0.5 rounded bg-amber-200/80 hover:bg-amber-300 font-black cursor-pointer"
            >
              {isPaused ? '▶ Tiếp tục' : '⏸ Tạm dừng'}
            </button>
            <span>🟢 Đích đến</span>
          </div>
        </div>

        {/* Giải thích chi tiết */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
            <h4 className="font-black text-amber-900 text-sm sm:text-base flex items-center gap-2">
              <span>Cách di chuyển & Quy tắc:</span>
            </h4>
            <p className="text-sm font-bold text-slate-700 leading-relaxed">{item.desc}</p>
            <div className="p-2.5 rounded-xl bg-amber-100/70 text-xs sm:text-sm font-black text-amber-900">
              {item.ruleNote}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveIdx((prev) => (prev - 1 + DEMOS.length) % DEMOS.length);
                setProgress(0);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-xs text-slate-700 cursor-pointer"
            >
              ◀ Quân trước
            </button>
            <button
              onClick={() => {
                setActiveIdx((prev) => (prev + 1) % DEMOS.length);
                setProgress(0);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-black text-xs text-white shadow-xs cursor-pointer"
            >
              Quân tiếp theo ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CotuongMoveDemo;
