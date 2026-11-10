import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { KingCheckOverlay } from '../src/components/learning/chess/KingCheckOverlay';
import * as ChessEngine from '../src/components/learning/chess/chessEngine';
import * as CotuongEngine from '../src/components/learning/cotuong/cotuongEngine';

const here = dirname(fileURLToPath(import.meta.url));
const chessGameSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'chess', 'ChessGame.tsx'),
  'utf8'
);
const cotuongGameSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'cotuong', 'CotuongGame.tsx'),
  'utf8'
);
const chessEngineSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'chess', 'chessEngine.ts'),
  'utf8'
);
const cotuongEngineSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'cotuong', 'cotuongEngine.ts'),
  'utf8'
);

describe('T55 — Lớp phủ Vua bị chiếu tướng, Ô cờ đẹp và Cơ chế chống lặp nước đi', () => {
  describe('Lớp phủ hoạt hình Vua hoảng sợ khi bị chiếu tướng', () => {
    it('render modal cảnh báo khi show=true với hình ảnh ông vua hoảng sợ', () => {
      const html = renderToString(
        React.createElement(KingCheckOverlay, { show: true, onDismiss: () => {} })
      );
      expect(html).toContain('CHIẾU TƯỚNG! NGUY HIỂM!');
      expect(html).toContain('Tướng quân ơi!');
      expect(html).toContain('Giải Cứu Vua Mau! 🛡️');
      expect(html).toContain('animate-bounce');
    });

    it('không render gì khi show=false', () => {
      const html = renderToString(
        React.createElement(KingCheckOverlay, { show: false, onDismiss: () => {} })
      );
      expect(html).toBe('');
    });

    it('ChessGame tích hợp KingCheckOverlay và nút xem lại cảnh báo', () => {
      expect(chessGameSrc).toContain('<KingCheckOverlay');
      expect(chessGameSrc).toContain("turn === 'w' && checkedColor === 'w' && !status && !dismissedCheck");
      expect(chessGameSrc).toContain('setDismissedCheck(true)');
      expect(chessGameSrc).toContain('👑 Vua bị chiếu!');
    });
  });

  describe('Cải thiện ô cờ 2D đẹp và sống động', () => {
    it('hiển thị hào quang nguy hiểm khi Vua bị chiếu và chấm tròn mục tiêu phát sáng', () => {
      expect(chessGameSrc).toContain('from-rose-600/70 via-red-500/35 to-transparent animate-pulse');
      expect(chessGameSrc).toContain('bg-emerald-500 ring-4 ring-emerald-300/70 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse');
      expect(chessGameSrc).toContain('border-rose-500 bg-rose-500/25 ring-2 ring-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse');
    });
  });

  describe('Cơ chế chống đối thủ đi đi lại lại 1 nước (Anti-Repetition)', () => {
    it('Cờ Vua: chessEngine hỗ trợ recentMoves và tính điểm phạt cho nước đi lặp lại / đảo ngược', () => {
      expect(chessEngineSrc).toContain('getRepetitionPenalty');
      expect(chessEngineSrc).toContain('recentMoves');
      expect(chessGameSrc).toContain('E.getBestMove(board, \'b\', DEPTH[difficulty], 400, recentMoves)');

      // Kiểm tra thực tế: Khi quân vừa đi từ [0, 6] tới [2, 5], bot không được đảo ngược lại [0, 6] nếu có nước phát triển khác
      const b = ChessEngine.initialBoard();
      // Thực hiện nước đi: Đen vừa đi mã từ [0,6] sang [2,5]
      const recent = [
        { from: [6, 4] as [number, number], to: [4, 4] as [number, number] }, // Trắng e4
        { from: [0, 6] as [number, number], to: [2, 5] as [number, number] }, // Đen Nf6
        { from: [7, 6] as [number, number], to: [5, 5] as [number, number] }, // Trắng Nf3
      ];
      // Bây giờ là lượt Đen: Đen đang ở [2, 5]. Nếu không có phạt, nó có thể nhảy lại [0, 6].
      // Cập nhật bàn cờ với mã ở [2, 5]
      b[2][5] = b[0][6];
      b[0][6] = null;
      const best = ChessEngine.getBestMove(b, 'b', 2, 400, recent);
      expect(best).not.toBeNull();
      // Nước đi tốt nhất không được là nhảy lùi về lại [0,6]
      const isReverseJump = best!.from[0] === 2 && best!.from[1] === 5 && best!.to[0] === 0 && best!.to[1] === 6;
      expect(isReverseJump).toBe(false);
    });

    it('Cờ Tướng: cotuongEngine hỗ trợ recentMoves và không lặp lại nước đi gần nhất', () => {
      expect(cotuongEngineSrc).toContain('getRepetitionPenalty');
      expect(cotuongEngineSrc).toContain('recentMoves?: Array<{ from: [number, number]; to: [number, number] }>;');
      expect(cotuongGameSrc).toContain('recentMoves');

      const b = CotuongEngine.initialBoard();
      // Giả lập Đen vừa đi Pháo từ [2, 1] sang [2, 4]
      const recent = [
        { from: [6, 4] as [number, number], to: [5, 4] as [number, number] },
        { from: [2, 1] as [number, number], to: [2, 4] as [number, number] },
        { from: [6, 6] as [number, number], to: [5, 6] as [number, number] },
      ];
      b[2][4] = b[2][1];
      b[2][1] = null;
      const best = CotuongEngine.getBestMove(b, 'black', 2, { recentMoves: recent });
      expect(best).not.toBeNull();
      // Không được đi ngược lại ngay từ [2, 4] về [2, 1]
      const isReverseMove = best!.from[0] === 2 && best!.from[1] === 4 && best!.to[0] === 2 && best!.to[1] === 1;
      expect(isReverseMove).toBe(false);
    });
  });
});
