import { useEffect, useRef, useState } from 'react';
import { GAME_LEVEL_POLICY } from '../config/policy';
import { clampTier, getTierMeta, type GameTierMeta } from '../data/gameLevels';
import { StorageService } from '../services/storage';

export type GameStagePhase = 'playing' | 'tierComplete' | 'allComplete';

/** Những thứ quyết định đồng hồ của trò chơi có được chạy hay không. */
export interface GameClockState {
  phase: GameStagePhase;
  locked: boolean;
  /** Bé bấm nút Tạm dừng. */
  pausedByUser: boolean;
  /** Lớp phủ "Chọn Màn & Độ Khó" của wrapper đang che bảng chơi. */
  overlayOpen: boolean;
}

/**
 * KBT-ISSUE-43 — một chỗ duy nhất trả lời "bóng có được rơi nữa không".
 * Thuần tuý và không đọc đồng hồ: bảng sự thật test được, còn bug gốc là
 * `isPaused` nằm riêng trong wrapper nên không hẹn giờ nào của game nghe theo.
 */
export function isGameClockRunning(s: GameClockState): boolean {
  return s.phase === 'playing' && !s.locked && !s.pausedByUser && !s.overlayOpen;
}

/**
 * T45D — ba trạng thái **che bảng chơi** (lớp phủ "Chọn Màn", nút Tạm dừng, thời
 * gian chờ sau một lượt). Chuột thì lớp phủ `absolute inset-0 z-50` đã chặn,
 * nhưng `window.addEventListener('keydown', …)` của trò chơi nằm ngoài cây DOM đó
 * nên phím vẫn nộp đáp án sau lớp phủ ⇒ bé mở ra đã thấy "Chưa đúng".
 * Khác `isGameClockRunning`: đồng hồ phải **dừng hẳn** khi sang màn (`phase`), còn
 * phím thì vẫn được phép ở màn "VƯỢT QUA MÀN" (điều hướng), nên không lấy `phase`
 * làm chốt input.
 */
export interface GameInputBlockState {
  locked: boolean;
  pausedByUser: boolean;
  overlayOpen: boolean;
}

export function isGameInputBlocked(s: GameInputBlockState): boolean {
  return s.locked || s.pausedByUser || s.overlayOpen;
}

export interface UseGameStageOptions {
  gameId: string;
  /** Objectives/rounds inside each tier (index 0 = tier 1). Length = tier count. */
  roundsPerTier: number[];
  /** Pause between a correct answer and the next objective (ms). */
  advanceDelayMs?: number;
  /** Force the starting tier instead of the highest unlocked one. */
  startTier?: number;
}

export interface GameStage {
  tier: number;
  tierMeta: GameTierMeta;
  tierCount: number;
  roundIdx: number;
  roundNumber: number;
  roundTotal: number;
  score: number;
  mistakesInTier: number;
  isLastTier: boolean;
  phase: GameStagePhase;
  isGameOver: boolean;
  locked: boolean;
  starsEarned: number;
  xpEarned: number;
  /** Best stars BEFORE the current tier completion (T02/B2 replay delta). */
  prevBestStars: number;
  /** Play count for the current tier (T02/B5 replay shuffling). */
  nonce: number;
  /** Bé đang bấm tạm dừng — wrapper vẽ nút/lớp phủ theo cờ này. */
  isPaused: boolean;
  /** Đồng hồ của trò chơi có được chạy không (xem `isGameClockRunning`). */
  isRunning: boolean;
  /** Lớp phủ "Chọn Màn & Độ Khó" đang che bảng (wrapper báo qua `setOverlayOpen`). */
  overlayOpen: boolean;
  /** Lượt input (chuột **và** phím) phải bị bỏ qua — xem `isGameInputBlocked`. */
  inputBlocked: boolean;
  togglePause: () => void;
  /** Wrapper báo lớp phủ "Chọn màn" mở/đóng để game ngừng đếm khi bị che. */
  setOverlayOpen: (open: boolean) => void;
  submitCorrect: (starsOverride?: number) => void;
  submitWrong: () => void;
  startNextTier: () => void;
  /**
   * T47E — `targetTier` là màn bé **chọn** trong bảng "Chọn Màn & Độ Khó". Không truyền thì
   * chơi lại màn đang mở khoá cao nhất (hành vi cũ của nút "Chơi lại").
   */
  restartGame: (targetTier?: number) => void;
}

/** T02/B1 — stars from real performance (single source of truth). */
export function computeStars(mistakes: number): number {
  if (mistakes <= GAME_LEVEL_POLICY.STAR_THREE_MAX_MISTAKES) return 3;
  if (mistakes <= GAME_LEVEL_POLICY.STAR_TWO_MAX_MISTAKES) return 2;
  return 1;
}

/**
 * Level state machine shared by every arcade game. Handles the tier ladder
 * (easy -> super hard, unlock the next on finish), per-tier stars, XP rewards
 * and persistence through StorageService.
 */
export function useGameStage(options: UseGameStageOptions): GameStage {
  const { gameId, roundsPerTier, advanceDelayMs = 1100 } = options;
  const tierCount = roundsPerTier.length;

  const [tier, setTier] = useState(() =>
    clampTier(options.startTier ?? StorageService.getGameProgress(gameId).unlockedTier)
  );
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  // T02B/B16 — score inside the CURRENT tier only (best score is stored
  // per tier; the cumulative `score` above stays for HUD display).
  const [tierScore, setTierScore] = useState(0);
  const [mistakesInTier, setMistakesInTier] = useState(0);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<GameStagePhase>('playing');
  const [starsEarned, setStarsEarned] = useState(0);
  const [prevBestStars, setPrevBestStars] = useState(0);
  const [nonce, setNonce] = useState(0);
  // KBT-ISSUE-43 — trạng thái tạm dừng sống ở ĐÂY chứ không ở wrapper: chỉ
  // component gọi hook mới với tới được các hẹn giờ rơi bóng đang chạy.
  const [pausedByUser, setPausedByUser] = useState(false);
  const [overlayOpen, setOverlayOpenState] = useState(false);
  const timerRef = useRef<number | null>(null);

  // T01/B10 — never leave a pending advance timer running after unmount
  // (closing the game modal mid-delay previously leaked the timeout).
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const tierSafe = clampTier(tier);
  const roundTotal = roundsPerTier[Math.min(tierSafe - 1, roundsPerTier.length - 1)] ?? 1;
  const tierMeta = getTierMeta(tierSafe);
  const isLastTier = tierSafe >= Math.max(tierCount, 1);
  const xpEarned = GAME_LEVEL_POLICY.XP_PER_TIER[Math.min(tierSafe - 1, GAME_LEVEL_POLICY.XP_PER_TIER.length - 1)];
  const isRunning = isGameClockRunning({ phase, locked, pausedByUser, overlayOpen });
  const inputBlocked = isGameInputBlocked({ locked, pausedByUser, overlayOpen });

  const togglePause = () => setPausedByUser((v) => !v);
  const setOverlayOpen = (open: boolean) => setOverlayOpenState(open);

  // T02/B5 — every (re)play of a tier bumps its nonce so builders reshuffle.
  // Runs on mount and whenever the tier changes (startNextTier / restart).
  useEffect(() => {
    try {
      setNonce(StorageService.bumpPlayNonce(gameId, tierSafe));
    } catch {
      setNonce((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tierSafe]);

  const submitCorrect = (starsOverride?: number) => {
    if (!isRunning) return;
    setScore((s) => s + 1);
    setTierScore((s) => s + 1);
    setLocked(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setLocked(false);
      if (roundIdx + 1 < roundTotal) {
        setRoundIdx((i) => i + 1);
      } else {
        // T02B/B13 — explicit stars (e.g. ColoringCanvas coverage) win;
        // otherwise stars come from real mistakes in THIS tier.
        const stars =
          typeof starsOverride === 'number'
            ? Math.min(Math.max(Math.round(starsOverride), 1), 3)
            : computeStars(mistakesInTier);
        // T02/B2 — capture best BEFORE persisting so the reward receipt
        // can pay only the delta on replays.
        try {
          setPrevBestStars(StorageService.getGameProgress(gameId).starsByTier[tierSafe] ?? 0);
        } catch {
          setPrevBestStars(0);
        }
        // T02B/B16 — persist the PER-TIER score, never the cumulative total.
        StorageService.completeGameTier(gameId, tierSafe, stars, tierScore + 1);
        setStarsEarned(stars);
        // Màn đã chốt ⇒ không còn gì để tạm; để trạng thái tạm sống sang màn
        // kế tiếp sẽ che mất bảng "VƯỢT QUA MÀN".
        setPausedByUser(false);
        setPhase(isLastTier ? 'allComplete' : 'tierComplete');
      }
    }, advanceDelayMs);
  };

  const submitWrong = () => {
    if (!isRunning) return;
    setMistakesInTier((m) => m + 1);
  };

  const startNextTier = () => {
    if (phase !== 'tierComplete') return;
    setTier((t) => clampTier(t + 1));
    setRoundIdx(0);
    setTierScore(0);
    setMistakesInTier(0);
    setLocked(false);
    setPhase('playing');
    setPausedByUser(false);
    setStarsEarned(0);
    setPrevBestStars(0);
  };

  const restartGame = (targetTier?: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    // T47E: bảng chọn màn phải đưa bảng về **đúng** màn bé bấm. `selectGameTier` chỉ mở khoá
    // (`Math.max` trong `StorageService.selectGameTier`) nên đọc `unlockedTier` một cách mù luôn trả màn khó nhất
    // từng mở — bé đang bí ở Màn 5 mà chọn Màn 1 thì bảng nạp lại Màn 5, chỉ tổ mất điểm.
    const resumeTier = clampTier(targetTier ?? StorageService.getGameProgress(gameId).unlockedTier);
    setTier(resumeTier);
    setRoundIdx(0);
    setScore(0);
    setTierScore(0);
    setMistakesInTier(0);
    setLocked(false);
    setPhase('playing');
    setPausedByUser(false);
    setStarsEarned(0);
    setPrevBestStars(0);
    // T02/B5 — replaying the same tier counts as a new play for shuffling.
    try {
      setNonce(StorageService.bumpPlayNonce(gameId, resumeTier));
    } catch {
      setNonce((n) => n + 1);
    }
  };

  return {
    tier: tierSafe,
    tierMeta,
    tierCount,
    roundIdx,
    roundNumber: roundIdx + 1,
    roundTotal,
    score,
    mistakesInTier,
    isLastTier,
    phase,
    isGameOver: phase === 'allComplete',
    locked,
    starsEarned,
    xpEarned,
    prevBestStars,
    nonce,
    isPaused: pausedByUser,
    isRunning,
    overlayOpen,
    inputBlocked,
    togglePause,
    setOverlayOpen,
    submitCorrect,
    submitWrong,
    startNextTier,
    restartGame,
  };
}