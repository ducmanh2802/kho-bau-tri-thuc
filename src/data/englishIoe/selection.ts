import { seededRng, shuffleSeeded } from '../gameLevels';
import { getAllIoeQuestions, type IoeQuestion } from './index';

/**
 * Chọn đề VO-iOE theo seed (AGENTS.md §2).
 *
 * Trước T44B hai lần chọn nằm trong `EnglishIoeScreen.tsx` và dùng
 * `Math.random` trần, nên cùng một seed không dựng lại được đề — không thể
 * kiểm thử, và bé bấm "đề khác" rồi quay lại là mất đúng bộ câu đang làm dở.
 * Tách ra đây để test được mà không cần dựng component.
 */
export const IOE_PRACTICE_COUNT = 8;
export const IOE_MOCK_COUNT = 15;

function pickSeeded(count: number, seed: number): IoeQuestion[] {
  return shuffleSeeded(getAllIoeQuestions(), seededRng(seed)).slice(0, count);
}

/** 8 câu luyện — mỗi lần bấm "đề khác" caller tăng `seed`, không đổi đồng hồ. */
export function pickIoePracticeQuestions(seed: number, count = IOE_PRACTICE_COUNT): IoeQuestion[] {
  return pickSeeded(count, seed);
}

/** 15 câu thi thử mô phỏng — cùng seed ⇒ cùng đề và cùng thứ tự. */
export function pickIoeMockQuestions(seed: number, count = IOE_MOCK_COUNT): IoeQuestion[] {
  return pickSeeded(count, seed);
}
