import type {
  ActivityAvailability,
  DecisionMode,
  DecisionReasonCode,
  EvidenceFreshness,
  EvidenceQuality,
} from '../types/decisionEngine';
import type { KnowledgeStatus } from '../types/learningOS';

/**
 * T40 — nhãn tiếng Việt cho mã lý do của DecisionEngine, tách ra module riêng để
 * thẻ "Việc nên làm tiếp" trên Home (chunk khởi động) dịch được mã mà **không**
 * phải import DecisionEngine — kéo theo cả ngân hàng đề vào lần vẽ đầu (ADR-18).
 */
export const REASON_LABEL_VI: Record<DecisionReasonCode, string> = {
  SM2_DUE: 'đến hạn ôn tập định kỳ',
  REPEATED_ERRORS: 'có lỗi sai lặp lại',
  RECENT_ACCURACY_DROP: 'độ chính xác gần đây giảm',
  NEEDS_REVIEW: 'cần ôn lại kỹ năng',
  FOUNDATION_GAP: 'thiếu kiến thức nền',
  CURRENT_UNIT: 'thuộc Unit tiếng Anh hiện tại',
  LOW_FLUENCY: 'lưu loát còn thấp',
  LOW_COMPREHENSION: 'hiểu nội dung còn thấp',
  LOW_STABILITY: 'độ ổn định chính xác chưa đủ',
  COMPETITION_READINESS: 'cần chuẩn bị cho Đấu Trường',
  NOT_PRACTICED_RECENTLY: 'chưa luyện kỹ năng này gần đây',
  IMPROVEMENT_OPPORTUNITY: 'có dấu hiệu đang tiến bộ',
  RECOVERY_AFTER_ERROR: 'cần phục hồi sau lỗi',
  DISCOVERY_NEEDED: 'chưa đủ dữ liệu để xác định điểm yếu',
  CONTENT_SOURCE_REQUIRED: 'nội dung nguồn chưa sẵn sàng',
  SUBJECT_BALANCE: 'cân bằng giữa các môn',
  FATIGUE: 'bé đã mệt sau phiên học dài',
  OVERPRACTICE: 'đã luyện quá nhiều kỹ năng này',
  SPEED_SAFE: 'đã đủ chính xác để luyện tốc độ an toàn',
  FOUNDATION_BEFORE_DEPENDENT: 'nắm kỹ năng nền trước',
  ACCURACY_BEFORE_SPEED: 'chính xác trước, tốc độ sau',
  WEAK_BEFORE_MASTERED: 'luyện kỹ năng yếu trước',
  AVAILABILITY_OK: 'hoạt động sẵn sàng mở được',
  RECENT_REPETITION: 'vừa được khuyến nghị hoạt động tương tự',
};

/** Mã lý do → câu tiếng Việt; mã lạ (thêm sau này) hiển thị nguyên văn chứ không trống. */
export function describeReasonCode(code: string): string {
  return code in REASON_LABEL_VI ? REASON_LABEL_VI[code as DecisionReasonCode] : code;
}

export function describeReasonCodes(codes: readonly string[]): string {
  return codes.map(describeReasonCode).join(', ');
}

const STATUS_LABEL_VI: Record<KnowledgeStatus, string> = {
  NOT_STARTED: 'chưa bắt đầu',
  LEARNING: 'đang học',
  PRACTICING: 'đang luyện tập',
  MASTERED: 'đã thành thạo',
  NEEDS_REVIEW: 'cần ôn lại',
};

const QUALITY_LABEL_VI: Record<EvidenceQuality, string> = {
  VERIFIED: 'đủ tin cậy',
  PARTIAL: 'còn ít',
  STALE: 'đã cũ',
  UNAVAILABLE: 'chưa có',
};

const FRESHNESS_LABEL_VI: Record<EvidenceFreshness, string> = {
  RECENT: 'gần đây',
  OLDER: 'khá lâu trước',
  STALE: 'đã cũ',
  UNKNOWN: 'chưa rõ',
};

export function describeKnowledgeStatus(status: KnowledgeStatus): string {
  return STATUS_LABEL_VI[status];
}

export function describeEvidenceQuality(quality: EvidenceQuality): string {
  return QUALITY_LABEL_VI[quality];
}

export function describeEvidenceFreshness(freshness: EvidenceFreshness): string {
  return FRESHNESS_LABEL_VI[freshness];
}

export function describeAvailability(availability: ActivityAvailability): string {
  return availability === 'AVAILABLE' ? 'mở được' : 'chưa mở được';
}

const MODE_LABEL_VI: Record<DecisionMode, string> = {
  DISCOVERY: 'khám phá',
  REMEDIATION: 'củng cố',
  REVIEW: 'ôn tập',
  PROGRESS: 'tiến bộ',
  FATIGUE: 'nghỉ ngơi',
  BALANCED: 'cân bằng',
};

export function describeDecisionMode(mode: DecisionMode): string {
  return MODE_LABEL_VI[mode];
}
