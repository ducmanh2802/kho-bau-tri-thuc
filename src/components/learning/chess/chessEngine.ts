export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Color = 'w' | 'b';
export interface Piece { type: PieceType; color: Color; }
export type Board = (Piece | null)[][];
export interface Move { from: [number, number]; to: [number, number]; promotion?: PieceType; }

const VAL: Record<PieceType, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

export function initialBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const back: PieceType[] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: back[c], color: 'b' };
    b[1][c] = { type: 'p', color: 'b' };
    b[6][c] = { type: 'p', color: 'w' };
    b[7][c] = { type: back[c], color: 'w' };
  }
  return b;
}

export function cloneBoard(b: Board): Board {
  return b.map((row) => row.map((p) => (p ? { ...p } : null)));
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function pseudoMoves(b: Board, from: [number, number]): Move[] {
  const [r, c] = from;
  const p = b[r][c];
  if (!p) return [];
  const moves: Move[] = [];
  const opp = p.color === 'w' ? 'b' : 'w';
  const addSlide = (dr: number, dc: number) => {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const t = b[nr][nc];
      if (!t) { moves.push({ from, to: [nr, nc] }); }
      else { if (t.color === opp) moves.push({ from, to: [nr, nc] }); break; }
      nr += dr; nc += dc;
    }
  };
  switch (p.type) {
    case 'p': {
      const dir = p.color === 'w' ? -1 : 1;
      const start = p.color === 'w' ? 6 : 1;
      if (inBounds(r + dir, c) && !b[r + dir][c]) {
        moves.push({ from, to: [r + dir, c] });
        if (r === start && !b[r + 2 * dir][c]) moves.push({ from, to: [r + 2 * dir, c] });
      }
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (inBounds(nr, nc)) {
          const t = b[nr][nc];
          if (t && t.color === opp) moves.push({ from, to: [nr, nc] });
        }
      }
      break;
    }
    case 'n': {
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc)) {
          const t = b[nr][nc];
          if (!t || t.color === opp) moves.push({ from, to: [nr, nc] });
        }
      }
      break;
    }
    case 'b': {
      for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) addSlide(dr, dc);
      break;
    }
    case 'r': {
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) addSlide(dr, dc);
      break;
    }
    case 'q': {
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) addSlide(dr, dc);
      break;
    }
    case 'k': {
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        const nr = r + dr, nc = c + dc;
        if (inBounds(nr, nc)) {
          const t = b[nr][nc];
          if (!t || t.color === opp) moves.push({ from, to: [nr, nc] });
        }
      }
      break;
    }
  }
  // promotion
  for (const m of moves) {
    const [tr] = m.to;
    const pp = b[r][c];
    if (pp?.type === 'p' && (tr === 0 || tr === 7)) m.promotion = 'q';
  }
  return moves;
}

export function findKing(b: Board, color: Color): [number, number] | null {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p && p.type === 'k' && p.color === color) return [r, c];
    }
  return null;
}

export function isAttacked(b: Board, r: number, c: number, by: Color): boolean {
  // Knight attacks
  for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      const p = b[nr][nc];
      if (p && p.color === by && p.type === 'n') return true;
    }
  }

  // Pawn attacks
  const pRow = by === 'w' ? r + 1 : r - 1;
  if (pRow >= 0 && pRow < 8) {
    if (c > 0) {
      const p = b[pRow][c - 1];
      if (p && p.color === by && p.type === 'p') return true;
    }
    if (c < 7) {
      const p = b[pRow][c + 1];
      if (p && p.color === by && p.type === 'p') return true;
    }
  }

  // King attacks
  for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
    const nr = r + dr, nc = c + dc;
    if (inBounds(nr, nc)) {
      const p = b[nr][nc];
      if (p && p.color === by && p.type === 'k') return true;
    }
  }

  // Orthogonal rays (Rook / Queen)
  for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = b[nr][nc];
      if (p) {
        if (p.color === by && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }

  // Diagonal rays (Bishop / Queen)
  for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
    let nr = r + dr, nc = c + dc;
    while (inBounds(nr, nc)) {
      const p = b[nr][nc];
      if (p) {
        if (p.color === by && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      nr += dr; nc += dc;
    }
  }

  return false;
}

export function inCheck(b: Board, color: Color): boolean {
  const k = findKing(b, color);
  if (!k) return false;
  return isAttacked(b, k[0], k[1], color === 'w' ? 'b' : 'w');
}

export function legalMoves(b: Board, from: [number, number]): Move[] {
  const [r, c] = from;
  const p = b[r][c];
  if (!p) return [];
  const moves = pseudoMoves(b, from);
  const legals: Move[] = [];
  for (const m of moves) {
    const [tr, tc] = m.to;
    const captured = b[tr][tc];
    b[tr][tc] = m.promotion ? { type: m.promotion, color: p.color } : p;
    b[r][c] = null;
    const safe = !inCheck(b, p.color);
    b[r][c] = p;
    b[tr][tc] = captured;
    if (safe) legals.push(m);
  }
  return legals;
}

export function allLegalMoves(b: Board, color: Color): Move[] {
  const out: Move[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (p && p.color === color) out.push(...legalMoves(b, [r, c]));
    }
  return out;
}

export function applyMove(b: Board, m: Move): Board {
  const nb = cloneBoard(b);
  const p = nb[m.from[0]][m.from[1]]!;
  nb[m.to[0]][m.to[1]] = m.promotion ? { type: m.promotion, color: p.color } : p;
  nb[m.from[0]][m.from[1]] = null;
  return nb;
}

export function isGameOver(b: Board): { over: boolean; result: string } {
  for (const color of ['w', 'b'] as Color[]) {
    const moves = allLegalMoves(b, color);
    if (moves.length === 0) {
      if (inCheck(b, color)) {
        return { over: true, result: color === 'w' ? 'Đen thắng (chiếu hết)' : 'Trắng thắng (chiếu hết)' };
      }
      return { over: true, result: 'Hòa (bế tắc)' };
    }
  }
  return { over: false, result: '' };
}

const PST_PAWN = [
  [0,0,0,0,0,0,0,0],
  [50,50,50,50,50,50,50,50],
  [10,10,20,30,30,20,10,10],
  [5,5,10,25,25,10,5,5],
  [0,0,0,20,20,0,0,0],
  [5,-5,-10,0,0,-10,-5,5],
  [5,10,10,-20,-20,10,10,5],
  [0,0,0,0,0,0,0,0],
];
const PST_KNIGHT = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,0,0,0,0,-20,-40],
  [-30,0,10,15,15,10,0,-30],
  [-30,5,15,20,20,15,5,-30],
  [-30,0,15,20,20,15,0,-30],
  [-30,5,10,15,15,10,5,-30],
  [-40,-20,0,5,5,0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];
const PST_BISHOP = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,0,0,0,0,0,0,-10],
  [-10,0,5,10,10,5,0,-10],
  [-10,5,5,10,10,5,5,-10],
  [-10,0,10,10,10,10,0,-10],
  [-10,10,10,10,10,10,10,-10],
  [-10,5,0,0,0,0,5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

function evaluate(b: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = b[r][c];
      if (!p) continue;
      const sign = p.color === 'w' ? 1 : -1;
      score += sign * VAL[p.type];
      const rr = p.color === 'w' ? r : 7 - r;
      if (p.type === 'p') {
        score += (sign * PST_PAWN[rr][c]) / 10;
      } else if (p.type === 'n') {
        score += (sign * PST_KNIGHT[rr][c]) / 10;
      } else if (p.type === 'b') {
        score += (sign * PST_BISHOP[rr][c]) / 10;
      }
    }
  }
  return score;
}

function orderMoves(b: Board, moves: Move[]): void {
  moves.sort((a, bmv) => {
    const ta = b[a.to[0]][a.to[1]];
    const tb = b[bmv.to[0]][bmv.to[1]];
    const sa = ta ? VAL[ta.type] * 10 - VAL[b[a.from[0]][a.from[1]]!.type] : 0;
    const sb = tb ? VAL[tb.type] * 10 - VAL[b[bmv.from[0]][bmv.from[1]]!.type] : 0;
    return sb - sa;
  });
}

function minimax(
  b: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  deadline: number,
  state: { aborted: boolean; nodes: number }
): number {
  state.nodes++;
  if ((state.nodes & 1023) === 0) {
    if (Date.now() >= deadline) {
      state.aborted = true;
      return 0;
    }
  }

  if (depth <= 0) return evaluate(b);

  const color: Color = maximizing ? 'w' : 'b';
  const moves = allLegalMoves(b, color);

  if (moves.length === 0) {
    if (inCheck(b, color)) {
      return maximizing ? -100000 - depth : 100000 + depth;
    }
    return 0;
  }

  orderMoves(b, moves);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const m of moves) {
      const [fr, fc] = m.from;
      const [tr, tc] = m.to;
      const p = b[fr][fc]!;
      const cap = b[tr][tc];
      b[tr][tc] = m.promotion ? { type: m.promotion, color: p.color } : p;
      b[fr][fc] = null;

      const ev = minimax(b, depth - 1, alpha, beta, false, deadline, state);

      b[fr][fc] = p;
      b[tr][tc] = cap;

      if (state.aborted) return 0;

      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      const [fr, fc] = m.from;
      const [tr, tc] = m.to;
      const p = b[fr][fc]!;
      const cap = b[tr][tc];
      b[tr][tc] = m.promotion ? { type: m.promotion, color: p.color } : p;
      b[fr][fc] = null;

      const ev = minimax(b, depth - 1, alpha, beta, true, deadline, state);

      b[fr][fc] = p;
      b[tr][tc] = cap;

      if (state.aborted) return 0;

      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(
  b: Board,
  color: Color,
  depth: number,
  maxMs: number = 400,
  recentMoves: Array<{ from: [number, number]; to: [number, number] }> = []
): Move | null {
  const rootMoves = allLegalMoves(b, color);
  if (rootMoves.length === 0) return null;
  if (depth <= 0) return rootMoves[0];

  const deadline = Date.now() + maxMs;
  const maximizing = color === 'w';

  // Tính phạt nước đi lặp lại để đối thủ không đi đi lại lại 1 nước / kẹt quân
  const getRepetitionPenalty = (m: Move): number => {
    if (recentMoves.length === 0) return 0;
    const isCap = !!b[m.to[0]][m.to[1]];
    if (isCap) return 0; // Ăn quân là nước đi tiến triển, không phạt
    let pen = 0;
    const len = recentMoves.length;
    // Xét các nước đi gần nhất của bên này (lùi 2, 4, 6 nửa nước)
    for (let i = len - 2; i >= 0 && i >= len - 6; i -= 2) {
      const prev = recentMoves[i];
      // Đảo ngược nước vừa đi (từ A sang B rồi quay lại A)
      if (
        m.from[0] === prev.to[0] &&
        m.from[1] === prev.to[1] &&
        m.to[0] === prev.from[0] &&
        m.to[1] === prev.from[1]
      ) {
        pen += 950;
      }
      // Đi lặp lại cùng một nước đi trong vài lượt gần nhất
      if (
        m.from[0] === prev.from[0] &&
        m.from[1] === prev.from[1] &&
        m.to[0] === prev.to[0] &&
        m.to[1] === prev.to[1]
      ) {
        pen += 650;
      }
    }
    return pen;
  };

  orderMoves(b, rootMoves);

  let bestMove: Move = rootMoves[0];

  // Iterative deepening from d = 1 up to depth
  for (let d = 1; d <= depth; d++) {
    const state = { aborted: false, nodes: 0 };
    let currentBest: Move = rootMoves[0];
    let bestScore = maximizing ? -Infinity : Infinity;

    // Prioritize previous best move at the front
    const bestIdx = rootMoves.findIndex(
      (m) =>
        m.from[0] === bestMove.from[0] &&
        m.from[1] === bestMove.from[1] &&
        m.to[0] === bestMove.to[0] &&
        m.to[1] === bestMove.to[1]
    );
    if (bestIdx > 0) {
      const [top] = rootMoves.splice(bestIdx, 1);
      rootMoves.unshift(top);
    }

    let alpha = -Infinity;
    let beta = Infinity;

    for (const m of rootMoves) {
      const [fr, fc] = m.from;
      const [tr, tc] = m.to;
      const p = b[fr][fc]!;
      const cap = b[tr][tc];
      b[tr][tc] = m.promotion ? { type: m.promotion, color: p.color } : p;
      b[fr][fc] = null;

      const rawSc = minimax(b, d - 1, alpha, beta, !maximizing, deadline, state);

      b[fr][fc] = p;
      b[tr][tc] = cap;

      if (state.aborted) break;

      const penalty = getRepetitionPenalty(m);
      const sc = maximizing ? rawSc - penalty : rawSc + penalty;

      if (maximizing) {
        if (sc > bestScore) {
          bestScore = sc;
          currentBest = m;
        }
        alpha = Math.max(alpha, sc);
      } else {
        if (sc < bestScore) {
          bestScore = sc;
          currentBest = m;
        }
        beta = Math.min(beta, sc);
      }
    }

    if (!state.aborted) {
      bestMove = currentBest;
    } else {
      break;
    }

    if (Date.now() >= deadline) break;
  }

  return bestMove;
}
