import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ChessPieceSvg } from '../src/components/learning/chess/ChessPieceSvg';

const here = dirname(fileURLToPath(import.meta.url));
const cotuongSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'cotuong', 'CotuongGame.tsx'),
  'utf8'
);
const chessGameSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'chess', 'ChessGame.tsx'),
  'utf8'
);

describe('T54 — Giới hạn gợi ý Cờ Tướng và Bộ quân Hoạt hình Cờ Vua', () => {
  describe('Cờ Tướng: Nút gợi ý giới hạn lượt dùng mỗi ván', () => {
    it('định nghĩa giới hạn gợi ý MAX_HINTS = 3 và quản lý số lượt còn lại', () => {
      expect(cotuongSrc).toMatch(/const MAX_HINTS = 3;/);
      expect(cotuongSrc).toMatch(/const \[hintsLeft, setHintsLeft\] = useState\(MAX_HINTS\);/);
    });

    it('giảm số lượt gợi ý sau mỗi lần bấm và reset khi ván mới', () => {
      expect(cotuongSrc).toMatch(/setHintsLeft\(\(prev\) => prev - 1\);/);
      expect(cotuongSrc).toMatch(/setHintsLeft\(MAX_HINTS\);/);
    });

    it('hiển thị số lượt còn lại rõ ràng trên nhãn nút Gợi ý và vô hiệu hoá khi hết lượt', () => {
      expect(cotuongSrc).toContain('Gợi ý ({hintsLeft}/{MAX_HINTS})');
      expect(cotuongSrc).toContain('hintsLeft <= 0');
      expect(cotuongSrc).toContain('Đã hết lượt gợi ý trong ván này');
    });
  });

  describe('Cờ Vua: Bộ quân hoạt hình con vật và đồ dùng đời sống', () => {
    it('render đầy đủ các con vật / đồ dùng hoạt hình khi pieceSet="fun"', () => {
      // Xe = Siêu xe G63
      const carSvg = renderToString(React.createElement(ChessPieceSvg, { type: 'r', color: 'w', pieceSet: 'fun' }));
      expect(carSvg).toContain('G63');

      // Mã = Chú ngựa con
      const horseSvg = renderToString(React.createElement(ChessPieceSvg, { type: 'n', color: 'w', pieceSet: 'fun' }));
      expect(horseSvg).toContain('svg');

      // Tượng = Chú voi thông thái
      const elephantSvg = renderToString(React.createElement(ChessPieceSvg, { type: 'b', color: 'w', pieceSet: 'fun' }));
      expect(elephantSvg).toContain('svg');

      // Hậu = Nữ hoàng
      const queenSvg = renderToString(React.createElement(ChessPieceSvg, { type: 'q', color: 'w', pieceSet: 'fun' }));
      expect(queenSvg).toContain('svg');

      // Tốt = Anh lính nhỏ
      const pawnSvg = renderToString(React.createElement(ChessPieceSvg, { type: 'p', color: 'w', pieceSet: 'fun' }));
      expect(pawnSvg).toContain('svg');
    });

    it('Vua chuyển sang biểu cảm hoảng sợ khi bị chiếu tướng (isScared)', () => {
      const normalKingSvg = renderToString(
        React.createElement(ChessPieceSvg, { type: 'k', color: 'w', pieceSet: 'fun', isScared: false })
      );
      const scaredKingSvg = renderToString(
        React.createElement(ChessPieceSvg, { type: 'k', color: 'w', pieceSet: 'fun', isScared: true })
      );

      // Scared king has bounce animation class
      expect(scaredKingSvg).toContain('animate-bounce');
      expect(normalKingSvg).not.toContain('animate-bounce');
    });

    it('ChessGame hỗ trợ chuyển đổi bộ quân và truyền isScared cho Vua bị chiếu', () => {
      expect(chessGameSrc).toContain("pieceSet === 'classic'");
      expect(chessGameSrc).toContain("setPieceSet('fun')");
      expect(chessGameSrc).toContain('isScared={p.type === \'k\' && checkedColor === p.color}');
    });
  });
});
