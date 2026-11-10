import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CotuongCartoonPieceSvg } from '../src/components/learning/cotuong/CotuongCartoonPieceSvg';
import { CotuongBoard3D } from '../src/components/learning/cotuong/CotuongBoard3D';
import * as E from '../src/components/learning/cotuong/cotuongEngine';

const here = dirname(fileURLToPath(import.meta.url));
const cotuongGameSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'cotuong', 'CotuongGame.tsx'),
  'utf8'
);
const cotuongBoardSrc = readFileSync(
  join(here, '..', 'src', 'components', 'learning', 'cotuong', 'CotuongBoard3D.tsx'),
  'utf8'
);

describe('T56 — Bộ quân Cờ Tướng hình minh họa hoạt hình 3D dễ thương cho bé lớp 1', () => {
  describe('CotuongCartoonPieceSvg — Minh họa 3D hoạt hình 7 loại quân', () => {
    it('quân Tượng (e) hiển thị chú voi nhỏ dễ thương và nhãn VOI', () => {
      const redElephant = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'e', color: 'red' }));
      expect(redElephant).toContain('VOI');
      // Đôi tai voi khổng lồ + vòi cong
      expect(redElephant).toContain('ellipse');
      expect(redElephant).toContain('svg');

      const blackElephant = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'e', color: 'black' }));
      expect(blackElephant).toContain('VOI');
    });

    it('quân Mã (h) hiển thị chú ngựa con với bờm và nhãn NGỰA', () => {
      const horse = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'h', color: 'red' }));
      expect(horse).toContain('NGỰA');
      expect(horse).toContain('svg');
    });

    it('quân Tướng (k) hiển thị vị tướng nhí và nhãn TƯỚNG', () => {
      const king = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'k', color: 'red' }));
      expect(king).toContain('TƯỚNG');
    });

    it('quân Sĩ (a) hiển thị chú quân sư tí hon và nhãn SĨ', () => {
      const advisor = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'a', color: 'red' }));
      expect(advisor).toContain('SĨ');
    });

    it('quân Xe (r) hiển thị chiến xa mini việt dã và nhãn XE', () => {
      const rook = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'r', color: 'red' }));
      expect(rook).toContain('XE');
    });

    it('quân Pháo (c) hiển thị đại pháo thần công chibi và nhãn PHÁO', () => {
      const cannon = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'c', color: 'red' }));
      expect(cannon).toContain('PHÁO');
    });

    it('quân Binh/Tốt (p) hiển thị chú lính nhỏ dũng cảm: Đỏ là BINH, Đen là TỐT', () => {
      const redPawn = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'p', color: 'red' }));
      expect(redPawn).toContain('BINH');

      const blackPawn = renderToString(React.createElement(CotuongCartoonPieceSvg, { type: 'p', color: 'black' }));
      expect(blackPawn).toContain('TỐT');
    });
  });

  describe('Tích hợp trong bàn cờ CotuongBoard3D và CotuongGame', () => {
    it('CotuongBoard3D render CotuongCartoonPieceSvg khi labelMode="cartoon"', () => {
      const board = E.initialBoard();
      const html = renderToString(
        React.createElement(CotuongBoard3D, {
          board,
          selected: null,
          legal: [],
          lastMove: null,
          checkAt: null,
          captureFx: null,
          flat: false,
          disabled: false,
          gameKey: 1,
          labelMode: 'cartoon',
          onSquareClick: () => {},
        })
      );
      // Bàn cờ ban đầu có Voi, Ngựa, Xe, Pháo, Binh...
      expect(html).toContain('VOI');
      expect(html).toContain('NGỰA');
      expect(html).toContain('XE');
      expect(html).toContain('PHÁO');
      expect(html).toContain('BINH');
      expect(html).toContain('TƯỚNG');
      expect(html).toContain('SĨ');
    });

    it('CotuongGame mặc định chế độ hoạt hình 3D và có nút chuyển đổi Hoạt hình 3D 🐘🐴', () => {
      expect(cotuongGameSrc).toContain("useState<CotuongLabelMode>('cartoon')");
      expect(cotuongGameSrc).toContain('Hoạt hình 3D 🐘🐴');
      expect(cotuongBoardSrc).toContain("labelMode = 'cartoon'");
    });
  });
});
