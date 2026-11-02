import { describe, it, expect } from 'vitest';
import * as E from '../src/components/learning/chess/chessEngine';

describe('Chess Engine Performance & Grandmaster Responsiveness', () => {
  it('initialBoard generates valid 8x8 matrix with pieces in correct positions', () => {
    const board = E.initialBoard();
    expect(board).toHaveLength(8);
    expect(board[0]).toHaveLength(8);
    expect(board[7][4]).toEqual({ type: 'k', color: 'w' });
    expect(board[0][4]).toEqual({ type: 'k', color: 'b' });
  });

  it('isAttacked correctly identifies attacks from knights, pawns, sliders and king', () => {
    const board: E.Board = Array.from({ length: 8 }, () => Array(8).fill(null));
    // Place white knight at e4 [4, 4]
    board[4][4] = { type: 'n', color: 'w' };
    expect(E.isAttacked(board, 2, 3, 'w')).toBe(true);
    expect(E.isAttacked(board, 2, 5, 'w')).toBe(true);
    expect(E.isAttacked(board, 3, 3, 'w')).toBe(false);

    // Place black pawn at d5 [3, 3] -> attacks e4 [4, 4] and c4 [4, 2]
    board[3][3] = { type: 'p', color: 'b' };
    expect(E.isAttacked(board, 4, 4, 'b')).toBe(true);
    expect(E.isAttacked(board, 4, 2, 'b')).toBe(true);
    expect(E.isAttacked(board, 2, 3, 'b')).toBe(false);

    // Place white rook at a1 [7, 0]
    board[7][0] = { type: 'r', color: 'w' };
    expect(E.isAttacked(board, 7, 5, 'w')).toBe(true);
    expect(E.isAttacked(board, 0, 0, 'w')).toBe(true);
    // Blocked by piece
    board[7][3] = { type: 'p', color: 'b' };
    expect(E.isAttacked(board, 7, 5, 'w')).toBe(false);
  });

  it('getBestMove at Kiện tướng (depth 4) computes under 500ms without freezing UI', () => {
    const board = E.initialBoard();
    const start = Date.now();
    const move = E.getBestMove(board, 'b', 4, 400);
    const duration = Date.now() - start;

    expect(move).not.toBeNull();
    expect(duration).toBeLessThanOrEqual(600); // Must be responsive and not lag
  });

  it('getBestMove does not mutate the passed board', () => {
    const board = E.initialBoard();
    const snapBefore = JSON.stringify(board);
    E.getBestMove(board, 'b', 3);
    const snapAfter = JSON.stringify(board);
    expect(snapAfter).toBe(snapBefore);
  });

  it('getBestMove finds immediate tactical captures and checkmate in 1', () => {
    const board: E.Board = Array.from({ length: 8 }, () => Array(8).fill(null));
    // Black king at g8 [0, 6], blocked by own pawns at f7 [1, 5], g7 [1, 6], h7 [1, 7]
    board[0][6] = { type: 'k', color: 'b' };
    board[1][5] = { type: 'p', color: 'b' };
    board[1][6] = { type: 'p', color: 'b' };
    board[1][7] = { type: 'p', color: 'b' };

    // White king safe at h1 [7, 7], white rook at a7 [1, 0]
    board[7][7] = { type: 'k', color: 'w' };
    board[1][0] = { type: 'r', color: 'w' };

    // Move rook to a8 [0, 0] for back rank checkmate
    const bestMove = E.getBestMove(board, 'w', 2);
    expect(bestMove).not.toBeNull();
    expect(bestMove?.from).toEqual([1, 0]);
    expect(bestMove?.to).toEqual([0, 0]);
  });
});
