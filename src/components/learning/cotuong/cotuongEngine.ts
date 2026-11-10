/**
 * Cờ tướng (Xiangqi) rules + bot.
 *
 * Board coordinates: row 0 = black home rank (top), row 9 = red home rank.
 * Red moves toward row 0, black toward row 9.
 *
 * The bot is a small negamax with alpha-beta. Two things matter for it to be
 * usable in a children's app:
 *  - evaluation must be cheap (no move generation inside), and
 *  - attack detection must not scan the whole board for every candidate move.
 * Both are handled below; `getBestMove` also carries a node budget so the UI
 * thread can never be blocked for long.
 */

export type PieceType = 'k' | 'a' | 'e' | 'h' | 'r' | 'c' | 'p';
export type Color = 'red' | 'black';
export interface Piece {
  type: PieceType;
  color: Color;
  /** Stable identity used by the 3-D board to animate a piece across squares. */
  id?: number;
}
export type Board = (Piece | null)[][];
export interface Move {
  from: [number, number];
  to: [number, number];
}

export const BOARD_ROWS = 10;
export const BOARD_COLS = 9;
const ROWS = BOARD_ROWS;
const COLS = BOARD_COLS;

export const initialBoard = (): Board => {
  const b: Board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  const backB: PieceType[] = ['r', 'h', 'e', 'a', 'k', 'a', 'e', 'h', 'r'];
  let id = 0;
  for (let c = 0; c < COLS; c++) {
    b[0][c] = { type: backB[c], color: 'black', id: ++id };
    b[9][c] = { type: backB[c], color: 'red', id: ++id };
  }
  b[2][1] = { type: 'c', color: 'black', id: ++id };
  b[2][7] = { type: 'c', color: 'black', id: ++id };
  b[7][1] = { type: 'c', color: 'red', id: ++id };
  b[7][7] = { type: 'c', color: 'red', id: ++id };
  for (let c = 0; c < COLS; c += 2) {
    b[3][c] = { type: 'p', color: 'black', id: ++id };
    b[6][c] = { type: 'p', color: 'red', id: ++id };
  }
  return b;
};

export const cloneBoard = (b: Board): Board =>
  b.map((row) => row.map((p) => (p ? { ...p } : null)));

export const inBounds = (r: number, c: number): boolean =>
  r >= 0 && r < ROWS && c >= 0 && c < COLS;

const at = (b: Board, r: number, c: number): Piece | null =>
  inBounds(r, c) ? b[r][c] : null;

const opp = (color: Color): Color => (color === 'red' ? 'black' : 'red');

function inPalace(color: Color, r: number, c: number): boolean {
  if (c < 3 || c > 5) return false;
  if (color === 'red') return r >= 7 && r <= 9;
  return r >= 0 && r <= 2;
}

function sameSide(color: Color, r: number): boolean {
  // elephants may never cross the river
  if (color === 'red') return r >= 5;
  return r <= 4;
}

const ORTHO: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
const DIAG: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];
const HORSE: ReadonlyArray<readonly [number, number]> = [
  [-2, -1],
  [-2, 1],
  [2, -1],
  [2, 1],
  [-1, -2],
  [1, -2],
  [-1, 2],
  [1, 2],
];

export function pseudoMoves(b: Board, from: [number, number]): Move[] {
  const [r, c] = from;
  const p = b[r][c];
  if (!p) return [];
  const moves: Move[] = [];
  const enemy = opp(p.color);
  const add = (rr: number, cc: number) => {
    if (!inBounds(rr, cc)) return;
    const t = b[rr][cc];
    if (!t || t.color === enemy) moves.push({ from, to: [rr, cc] });
  };
  const slide = (dr: number, dc: number) => {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const t = b[nr][nc];
      if (!t) moves.push({ from, to: [nr, nc] });
      else {
        if (t.color === enemy) moves.push({ from, to: [nr, nc] });
        break;
      }
      nr += dr;
      nc += dc;
    }
  };
  switch (p.type) {
    case 'k':
      for (const [dr, dc] of ORTHO) {
        const nr = r + dr, nc = c + dc;
        if (inPalace(p.color, nr, nc)) add(nr, nc);
      }
      break;
    case 'a':
      for (const [dr, dc] of DIAG) {
        const nr = r + dr, nc = c + dc;
        if (inPalace(p.color, nr, nc)) add(nr, nc);
      }
      break;
    case 'e':
      for (const [dr, dc] of DIAG) {
        const nr = r + dr * 2, nc = c + dc * 2;
        if (inBounds(nr, nc) && sameSide(p.color, nr) && !b[r + dr][c + dc]) add(nr, nc);
      }
      break;
    case 'h':
      for (const [dr, dc] of HORSE) {
        const legR = r + (Math.abs(dr) === 2 ? dr / 2 : 0);
        const legC = c + (Math.abs(dc) === 2 ? dc / 2 : 0);
        if (inBounds(r + dr, c + dc) && !b[legR][legC]) add(r + dr, c + dc);
      }
      break;
    case 'r':
      for (const [dr, dc] of ORTHO) slide(dr, dc);
      break;
    case 'c': {
      for (const [dr, dc] of ORTHO) {
        let nr = r + dr, nc = c + dc;
        while (inBounds(nr, nc) && !b[nr][nc]) {
          moves.push({ from, to: [nr, nc] });
          nr += dr;
          nc += dc;
        }
        // the first piece is the screen; the next one can be captured
        if (inBounds(nr, nc)) {
          let sr = nr + dr, sc = nc + dc;
          while (inBounds(sr, sc)) {
            const t = b[sr][sc];
            if (t) {
              if (t.color === enemy) moves.push({ from, to: [sr, sc] });
              break;
            }
            sr += dr;
            sc += dc;
          }
        }
      }
      break;
    }
    case 'p': {
      const dir = p.color === 'red' ? -1 : 1;
      const crossed = p.color === 'red' ? r <= 4 : r >= 5;
      add(r + dir, c);
      if (crossed) {
        add(r, c - 1);
        add(r, c + 1);
      }
      break;
    }
  }
  return moves;
}

export function findKing(b: Board, color: Color): [number, number] | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (p && p.type === 'k' && p.color === color) return [r, c];
    }
  }
  return null;
}

export function kingsFace(b: Board): boolean {
  const rk = findKing(b, 'red');
  const bk = findKing(b, 'black');
  if (!rk || !bk || rk[1] !== bk[1]) return false;
  const col = rk[1];
  const from = Math.min(rk[0], bk[0]) + 1;
  const to = Math.max(rk[0], bk[0]);
  for (let r = from; r < to; r++) if (b[r][col]) return false;
  return true;
}

/**
 * Does `by` attack the square (r, c)? Reverse attack detection: instead of
 * generating every enemy move (O(90 × moves)) we look outward from the target
 * square — a handful of ray walks and jumps.
 */
export function isAttacked(b: Board, r: number, c: number, by: Color): boolean {
  // Pawns: red advances toward row 0, black toward row 9.
  const pawnFrom = by === 'red' ? at(b, r + 1, c) : at(b, r - 1, c);
  if (pawnFrom && pawnFrom.color === by && pawnFrom.type === 'p') return true;
  const pawnCrossed = by === 'red' ? r <= 4 : r >= 5;
  if (pawnCrossed) {
    for (const dc of [-1, 1]) {
      const p = at(b, r, c + dc);
      if (p && p.color === by && p.type === 'p') return true;
    }
  }

  // King / advisor, adjacent.
  for (const [dr, dc] of ORTHO) {
    const p = at(b, r + dr, c + dc);
    if (p && p.color === by && p.type === 'k') return true;
  }
  for (const [dr, dc] of DIAG) {
    const p = at(b, r + dr, c + dc);
    if (p && p.color === by && p.type === 'a') return true;
  }

  // Elephant, two diagonals away with a clear eye.
  for (const [dr, dc] of DIAG) {
    const p = at(b, r + dr * 2, c + dc * 2);
    if (p && p.color === by && p.type === 'e' && !at(b, r + dr, c + dc)) return true;
  }

  // Horse: attacker at (r + hr, c + hc), its leg square must be empty.
  for (const [hr, hc] of HORSE) {
    const p = at(b, r + hr, c + hc);
    if (!p || p.color !== by || p.type !== 'h') continue;
    const legR = r + hr - (Math.abs(hr) === 2 ? Math.sign(hr) : 0);
    const legC = c + hc - (Math.abs(hc) === 2 ? Math.sign(hc) : 0);
    if (!at(b, legR, legC)) return true;
  }

  // Rook / cannon / adjacent king along the four rays.
  for (const [dr, dc] of ORTHO) {
    let rr = r + dr, cc = c + dc, dist = 1;
    let screen: Piece | null = null;
    while (inBounds(rr, cc)) {
      const p = b[rr][cc];
      if (p) {
        if (!screen) {
          if (p.color === by) {
            if (p.type === 'r') return true;
            if (p.type === 'k' && dist === 1) return true;
          }
          screen = p;
        } else if (p.color === by && p.type === 'c') {
          return true;
        } else {
          break;
        }
      }
      rr += dr;
      cc += dc;
      dist++;
    }
  }
  return false;
}

export function inCheck(b: Board, color: Color): boolean {
  const k = findKing(b, color);
  if (!k) return true;
  if (isAttacked(b, k[0], k[1], opp(color))) return true;
  return kingsFace(b);
}

/** Pure helper: legal moves for the piece on `from` (never mutates `b`). */
export function legalMoves(b: Board, from: [number, number]): Move[] {
  const p = b[from[0]][from[1]];
  if (!p) return [];
  const work = cloneBoard(b);
  const piece = work[from[0]][from[1]]!;
  const out: Move[] = [];
  for (const m of pseudoMoves(work, from)) {
    const [fr, fc] = m.from;
    const [tr, tc] = m.to;
    const cap = work[tr][tc];
    work[tr][tc] = work[fr][fc];
    work[fr][fc] = null;
    if (!inCheck(work, p.color)) out.push(m);
    work[fr][fc] = piece;
    work[tr][tc] = cap;
  }
  return out;
}

function collectLegal(b: Board, color: Color, out: Move[]): void {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (!p || p.color !== color) continue;
      for (const m of pseudoMoves(b, [r, c])) {
        const [fr, fc] = m.from;
        const [tr, tc] = m.to;
        const cap = b[tr][tc];
        b[tr][tc] = b[fr][fc];
        b[fr][fc] = null;
        if (!inCheck(b, color)) out.push(m);
        b[fr][fc] = b[tr][tc];
        b[tr][tc] = cap;
      }
    }
  }
}

export function allLegalMoves(b: Board, color: Color): Move[] {
  const work = cloneBoard(b);
  const out: Move[] = [];
  collectLegal(work, color, out);
  return out;
}

export function applyMove(b: Board, m: Move): Board {
  const nb = cloneBoard(b);
  const p = nb[m.from[0]][m.from[1]];
  if (!p) return nb;
  nb[m.to[0]][m.to[1]] = p;
  nb[m.from[0]][m.from[1]] = null;
  return nb;
}

/** Result of a finished game. In xiangqi, no legal move = loss even without check. */
export function isGameOver(
  b: Board,
  sideToMove?: Color
): { over: boolean; result: string; winner?: Color } {
  const sides: Color[] = sideToMove ? [sideToMove] : ['red', 'black'];
  for (const color of sides) {
    if (allLegalMoves(b, color).length === 0) {
      const winner: Color = opp(color);
      return {
        over: true,
        winner,
        result: winner === 'red' ? 'Đỏ thắng — chiếu hết Tướng Đen!' : 'Đen thắng — chiếu hết Tướng Đỏ!',
      };
    }
  }
  return { over: false, result: '' };
}

// ---------------------------------------------------------------- evaluation

const VAL: Record<PieceType, number> = { k: 30000, r: 900, c: 450, h: 400, e: 220, a: 220, p: 100 };

/**
 * Advanced Xiangqi heuristic evaluation:
 * - Material values
 * - Central control for Cannons (Pháo đầu & Pháo sườn)
 * - Open files and enemy territory penetration for Chariots (Xe chiếm lộ thoáng)
 * - Mobility and unblocked legs for Horses (Mã thông thoáng)
 * - Infiltration depth and central palace threats for crossed Pawns (Tốt qua sông)
 * - Palace guard connectivity (Sĩ Tượng liên hoàn)
 */
export function evaluate(b: Board): number {
  let score = 0;
  // Pre-calculate column pawn occupancy to detect open files for Chariots
  const redPawnCols = new Uint8Array(COLS);
  const blackPawnCols = new Uint8Array(COLS);
  let redAdvisors = 0;
  let blackAdvisors = 0;
  let redElephants = 0;
  let blackElephants = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (!p) continue;
      if (p.type === 'p') {
        if (p.color === 'red') redPawnCols[c] = 1;
        else blackPawnCols[c] = 1;
      } else if (p.type === 'a') {
        if (p.color === 'red') redAdvisors++;
        else blackAdvisors++;
      } else if (p.type === 'e') {
        if (p.color === 'red') redElephants++;
        else blackElephants++;
      }
    }
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = b[r][c];
      if (!p) continue;
      const isRed = p.color === 'red';
      const sign = isRed ? 1 : -1;
      let v = VAL[p.type];

      switch (p.type) {
        case 'p': {
          const crossed = isRed ? r <= 4 : r >= 5;
          if (crossed) {
            const forward = isRed ? 9 - r : r;
            // Crossed pawn: becomes increasingly lethal near enemy palace
            v += 45 + forward * 8;
            if (c >= 3 && c <= 5) v += 20; // Palace corridor
          } else {
            const forward = isRed ? 9 - r : r;
            v += forward * 4;
            if (c === 4) v += 10; // Central pawn advance
          }
          break;
        }
        case 'h': {
          // Central activity
          v += (4 - Math.abs(c - 4)) * 6;
          v += (isRed ? 9 - r : r) * 2;
          // Penalize when horse leg is hobbled
          for (const [dr, dc] of HORSE) {
            const legR = r + (Math.abs(dr) === 2 ? dr / 2 : 0);
            const legC = c + (Math.abs(dc) === 2 ? dc / 2 : 0);
            if (!inBounds(legR, legC) || b[legR][legC]) {
              v -= 4; // slight drag for blocked legs
            }
          }
          break;
        }
        case 'r': {
          // Central rib control
          v += (4 - Math.abs(c - 4)) * 4;
          // Open or semi-open file bonus
          const oppPawns = isRed ? blackPawnCols[c] : redPawnCols[c];
          const ownPawns = isRed ? redPawnCols[c] : blackPawnCols[c];
          if (!oppPawns && !ownPawns) v += 24; // fully open file
          else if (!ownPawns) v += 14; // semi-open file
          // Throat or river patrol rank
          if (isRed && (r === 1 || r === 2 || r === 5)) v += 16;
          if (!isRed && (r === 8 || r === 7 || r === 4)) v += 16;
          break;
        }
        case 'c': {
          // Central Cannon (Pháo đầu) or Rib Cannon (Pháo sườn)
          if (c === 4) v += 32;
          else if (c === 3 || c === 5) v += 18;
          v += (4 - Math.abs(c - 4)) * 3;
          break;
        }
        case 'a':
        case 'e': {
          v += 10;
          break;
        }
        case 'k': {
          // King in palace center protection
          if (c === 4) v += 12;
          break;
        }
      }

      score += sign * v;
    }
  }

  // Coordinated palace guard bonus (Sĩ Tượng song toàn)
  if (redAdvisors >= 2 && redElephants >= 2) score += 35;
  if (blackAdvisors >= 2 && blackElephants >= 2) score -= 35;

  return score;
}

const MATE = 100000;

interface SearchState {
  nodes: number;
  maxNodes: number;
  aborted: boolean;
  killerMoves: (Move | null)[][];
  historyTable: number[][][][];
}

function initSearchState(maxNodes: number): SearchState {
  // Killer moves: 2 per ply up to depth 32
  const killerMoves: (Move | null)[][] = Array.from({ length: 32 }, () => [null, null]);
  // History table: [fromR][fromC][toR][toC]
  const historyTable: number[][][][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () =>
      Array.from({ length: ROWS }, () => Array(COLS).fill(0))
    )
  );
  return {
    nodes: 0,
    maxNodes,
    aborted: false,
    killerMoves,
    historyTable,
  };
}

function makeMove(b: Board, m: Move): Piece | null {
  const [fr, fc] = m.from;
  const [tr, tc] = m.to;
  const moving = b[fr][fc];
  const captured = b[tr][tc];
  b[tr][tc] = moving;
  b[fr][fc] = null;
  return captured;
}

function unmakeMove(b: Board, m: Move, captured: Piece | null): void {
  const [fr, fc] = m.from;
  const [tr, tc] = m.to;
  b[fr][fc] = b[tr][tc];
  b[tr][tc] = captured;
}

function movesEqual(a: Move | null, c: Move | null): boolean {
  if (!a || !c) return false;
  return (
    a.from[0] === c.from[0] &&
    a.from[1] === c.from[1] &&
    a.to[0] === c.to[0] &&
    a.to[1] === c.to[1]
  );
}

function scoreMove(
  b: Board,
  m: Move,
  ply: number,
  st: SearchState,
  pvMove: Move | null
): number {
  if (pvMove && movesEqual(m, pvMove)) return 2000000;

  const target = b[m.to[0]][m.to[1]];
  if (target) {
    const mover = b[m.from[0]][m.from[1]];
    // MVV-LVA: prefer high value victim taken by cheap attacker
    return 100000 + VAL[target.type] * 10 - (mover ? VAL[mover.type] : 0);
  }

  // Killer move heuristics
  if (ply < 32) {
    if (movesEqual(m, st.killerMoves[ply][0])) return 50000;
    if (movesEqual(m, st.killerMoves[ply][1])) return 40000;
  }

  // History heuristic for quiet moves
  return st.historyTable[m.from[0]][m.from[1]][m.to[0]][m.to[1]];
}

function orderMoves(
  b: Board,
  moves: Move[],
  ply: number = 0,
  st?: SearchState,
  pvMove: Move | null = null
): Move[] {
  if (!st) {
    return moves.sort((a, c) => {
      const targetC = b[c.to[0]][c.to[1]];
      const targetA = b[a.to[0]][a.to[1]];
      const scoreC = targetC ? VAL[targetC.type] * 10 : 0;
      const scoreA = targetA ? VAL[targetA.type] * 10 : 0;
      return scoreC - scoreA;
    });
  }

  return moves.sort(
    (a, c) =>
      scoreMove(b, c, ply, st, pvMove) - scoreMove(b, a, ply, st, pvMove)
  );
}

function evaluateFor(b: Board, color: Color): number {
  const red = evaluate(b);
  return color === 'red' ? red : -red;
}

/**
 * Quiescence search: evaluates tactical sequences (captures) beyond the horizon
 * to eliminate the horizon effect and prevent hanging critical pieces.
 */
function quiesce(
  b: Board,
  alpha: number,
  beta: number,
  color: Color,
  st: SearchState,
  qDepth: number
): number {
  st.nodes++;
  if (st.nodes >= st.maxNodes) {
    st.aborted = true;
    return evaluateFor(b, color);
  }

  const standPat = evaluateFor(b, color);
  if (qDepth <= 0 || standPat >= beta) return standPat;
  if (standPat > alpha) alpha = standPat;

  // Generate only captures
  const allMoves: Move[] = [];
  collectLegal(b, color, allMoves);
  const captures = allMoves.filter((m) => b[m.to[0]][m.to[1]] !== null);
  if (captures.length === 0) return standPat;

  orderMoves(b, captures, 0, st, null);

  for (const m of captures) {
    const target = b[m.to[0]][m.to[1]];
    if (!target) continue;

    // Delta pruning: skip captures that can't possibly raise alpha
    if (standPat + VAL[target.type] + 180 < alpha) continue;

    const cap = makeMove(b, m);
    const score = -quiesce(b, -beta, -alpha, opp(color), st, qDepth - 1);
    unmakeMove(b, m, cap);

    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
    if (st.aborted) break;
  }

  return alpha;
}

function negamax(
  b: Board,
  depth: number,
  alpha: number,
  beta: number,
  color: Color,
  st: SearchState,
  ply: number,
  pvMove: Move | null = null
): number {
  st.nodes++;
  if (st.nodes >= st.maxNodes) {
    st.aborted = true;
    return evaluateFor(b, color);
  }

  // Quiescence search at leaf nodes
  if (depth <= 0) {
    return quiesce(b, alpha, beta, color, st, 3);
  }

  const moves: Move[] = [];
  collectLegal(b, color, moves);
  if (moves.length === 0) return -MATE + ply; // mated or stalemated

  orderMoves(b, moves, ply, st, pvMove);
  let best = -Infinity;
  let bestMoveAtNode: Move | null = null;

  for (const m of moves) {
    const isCapture = b[m.to[0]][m.to[1]] !== null;
    const cap = makeMove(b, m);
    const score = -negamax(b, depth - 1, -beta, -alpha, opp(color), st, ply + 1, null);
    unmakeMove(b, m, cap);

    if (score > best) {
      best = score;
      bestMoveAtNode = m;
    }
    if (best > alpha) alpha = best;

    if (alpha >= beta) {
      // Beta cutoff: update killer moves & history table for quiet moves
      if (!isCapture && ply < 32 && bestMoveAtNode) {
        if (!movesEqual(st.killerMoves[ply][0], bestMoveAtNode)) {
          st.killerMoves[ply][1] = st.killerMoves[ply][0];
          st.killerMoves[ply][0] = bestMoveAtNode;
        }
        st.historyTable[bestMoveAtNode.from[0]][bestMoveAtNode.from[1]][bestMoveAtNode.to[0]][bestMoveAtNode.to[1]] += depth * depth;
      }
      break;
    }
    if (st.aborted) break;
  }
  return best;
}

export interface BotOptions {
  /** Hard cap on searched nodes — keeps the UI thread responsive. */
  maxNodes?: number;
  /**
   * Centipawn window: the bot picks randomly among root moves within this
   * distance of the best one. Used by easier levels so children can win.
   */
  softness?: number;
  random?: () => number;
  /** Lịch sử các nước đi gần nhất để tránh tình trạng máy đi đi lại lại 1 nước / kẹt nước. */
  recentMoves?: Array<{ from: [number, number]; to: [number, number] }>;
}

/**
 * Best move for `color` with iterative deepening:
 * Searches depth 1, 2, ..., depth while respecting node budget.
 * Guarantees crisp responsiveness and deepest possible tactical foresight.
 */
export function getBestMove(
  b: Board,
  color: Color,
  depth: number,
  opts: BotOptions = {}
): Move | null {
  const rootMoves = allLegalMoves(b, color);
  if (rootMoves.length === 0) return null;
  if (depth <= 0) return rootMoves[0];

  const work = cloneBoard(b);
  const st = initSearchState(opts.maxNodes ?? (depth >= 5 ? 380000 : depth >= 4 ? 220000 : 70000));

  // Tính phạt nước đi lặp lại để đối thủ không đi đi lại lại 1 nước / kẹt nước
  const getRepetitionPenalty = (m: Move): number => {
    const rm = opts.recentMoves;
    if (!rm || rm.length === 0) return 0;
    const isCap = !!b[m.to[0]][m.to[1]];
    if (isCap) return 0;
    let pen = 0;
    const len = rm.length;
    for (let i = len - 2; i >= 0 && i >= len - 6; i -= 2) {
      const prev = rm[i];
      if (
        m.from[0] === prev.to[0] &&
        m.from[1] === prev.to[1] &&
        m.to[0] === prev.from[0] &&
        m.to[1] === prev.from[1]
      ) {
        pen += 950;
      }
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

  let overallBestMove: Move = rootMoves[0];
  let lastScored: { move: Move; score: number }[] = [];

  // Iterative deepening from depth 1 up to target depth
  for (let d = 1; d <= depth; d++) {
    orderMoves(work, rootMoves, 0, st, overallBestMove);
    const scored: { move: Move; score: number }[] = [];
    let alpha = -Infinity;

    for (const m of rootMoves) {
      const cap = makeMove(work, m);
      const rawScore = -negamax(work, d - 1, -Infinity, -alpha, opp(color), st, 1, null);
      unmakeMove(work, m, cap);
      const penalty = getRepetitionPenalty(m);
      const score = rawScore - penalty;
      scored.push({ move: m, score });
      if (score > alpha) alpha = score;
      if (st.aborted) break;
    }

    if (!st.aborted && scored.length > 0) {
      scored.sort((a, c) => c.score - a.score);
      overallBestMove = scored[0].move;
      lastScored = scored;
    } else {
      break;
    }
  }

  const softness = opts.softness ?? 0;
  if (softness > 0 && lastScored.length > 1) {
    const top = lastScored[0].score;
    const pool = lastScored.filter((s) => s.score >= top - softness);
    const rng = opts.random ?? Math.random;
    const pick = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
    return pick.move;
  }

  return overallBestMove;
}

