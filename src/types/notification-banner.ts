/**
 * Notification Banner 시스템 타입 정의
 * DB 관리형 공지/알림 배너 시스템
 */

// =====================================================
// 기본 타입
// =====================================================

/**
 * 배너 타입
 * - notice: 일반 공지
 * - alert: 중요 알림
 * - urgent: 긴급 알림
 */
export type NotificationBannerType = 'notice' | 'alert' | 'urgent';

/**
 * 표시 규칙
 * - always: 항상 표시 (사용자가 닫을 때까지)
 * - user_action: 특정 사용자 행동 시 표시 (예: 페이지 방문)
 * - dwell_time: 특정 시간 체류 후 표시
 */
export type DisplayRule = 'always' | 'user_action' | 'dwell_time';

/**
 * 리셋 주기
 * - never: 한 번 닫으면 영구적으로 숨김
 * - daily: 매일 자정 이후 다시 표시
 * - weekly: 매주 월요일 다시 표시
 * - monthly: 매월 1일 다시 표시
 */
export type ResetPeriod = 'never' | 'daily' | 'weekly' | 'monthly';

/**
 * 웹훅 액션 타입
 * - review: 별점/리뷰 제출
 * - confirm: 확인/동의
 * - participate: 이벤트 참여
 */
export type WebhookActionType = 'review' | 'confirm' | 'participate';

// =====================================================
// Database 엔티티 타입
// =====================================================

/**
 * notification_banners 테이블 타입
 */
export interface NotificationBanner {
  id: string;
  type: NotificationBannerType;
  message: string;
  display_duration: number | null;
  display_rule: DisplayRule;
  trigger_action: string | null;
  dwell_time_seconds: number | null;
  webhook_url: string | null;
  webhook_button_text: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  priority: number;
  reset_period: ResetPeriod;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/**
 * notification_banner_views 테이블 타입
 */
export interface NotificationBannerView {
  id: string;
  banner_id: string;
  user_id: string | null;
  viewed_at: string;
  dismissed_at: string | null;
  interacted: boolean;
}

/**
 * notification_banner_webhook_logs 테이블 타입
 */
export interface NotificationBannerWebhookLog {
  id: string;
  banner_id: string;
  user_id: string | null;
  webhook_url: string;
  payload: Record<string, any>;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  created_at: string;
}

// =====================================================
// 웹훅 관련 타입
// =====================================================

/**
 * 웹훅 페이로드 베이스
 */
export interface WebhookPayloadBase {
  banner_id: string;
  banner_type: NotificationBannerType;
  user_id: string | null;
  action: WebhookActionType;
  timestamp: string;
}

/**
 * 리뷰 웹훅 데이터
 */
export interface ReviewWebhookData {
  rating: number; // 1-5
  review?: string; // 선택적 리뷰 텍스트
}

/**
 * 확인 웹훅 데이터
 */
export interface ConfirmWebhookData {
  confirmed: boolean;
  metadata?: Record<string, any>;
}

/**
 * 참여 웹훅 데이터
 */
export interface ParticipateWebhookData {
  event_id?: string;
  metadata?: Record<string, any>;
}

/**
 * 리뷰 웹훅 페이로드
 */
export interface ReviewWebhookPayload extends WebhookPayloadBase {
  action: 'review';
  data: ReviewWebhookData;
}

/**
 * 확인 웹훅 페이로드
 */
export interface ConfirmWebhookPayload extends WebhookPayloadBase {
  action: 'confirm';
  data: ConfirmWebhookData;
}

/**
 * 참여 웹훅 페이로드
 */
export interface ParticipateWebhookPayload extends WebhookPayloadBase {
  action: 'participate';
  data: ParticipateWebhookData;
}

/**
 * 통합 웹훅 페이로드
 */
export type WebhookPayload =
  | ReviewWebhookPayload
  | ConfirmWebhookPayload
  | ParticipateWebhookPayload;

// =====================================================
// 컴포넌트 Props 타입
// =====================================================

/**
 * NotificationBanner 컴포넌트 Props
 */
export interface NotificationBannerProps {
  banner: NotificationBanner;
  onDismiss: (bannerId: string) => void;
  onWebhookAction?: (bannerId: string, action: WebhookActionType, data: any) => Promise<void>;
}

/**
 * NotificationBannerContainer Props
 */
export interface NotificationBannerContainerProps {
  maxBanners?: number; // 최대 동시 표시 개수 (기본값: 3)
  position?: 'top' | 'bottom'; // 표시 위치 (기본값: 'top')
}

// =====================================================
// Hook 반환 타입
// =====================================================

/**
 * useNotificationBanner 훅 반환 타입
 */
export interface UseNotificationBannerReturn {
  /** 활성 배너 목록 */
  banners: NotificationBanner[];
  /** 로딩 상태 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;
  /** 배너 닫기 */
  dismissBanner: (bannerId: string) => Promise<void>;
  /** 웹훅 액션 실행 */
  triggerWebhook: (bannerId: string, action: WebhookActionType, data: any) => Promise<void>;
  /** 배너 새로고침 */
  refreshBanners: () => Promise<void>;
}

// =====================================================
// 유틸리티 타입
// =====================================================

/**
 * 배너 생성 입력 타입 (INSERT)
 */
export type CreateNotificationBannerInput = Omit<
  NotificationBanner,
  'id' | 'created_at' | 'updated_at'
>;

/**
 * 배너 업데이트 입력 타입 (UPDATE)
 */
export type UpdateNotificationBannerInput = Partial<
  Omit<NotificationBanner, 'id' | 'created_at' | 'updated_at'>
>;

/**
 * 조회 기록 생성 입력 타입
 */
export type CreateNotificationBannerViewInput = Omit<
  NotificationBannerView,
  'id' | 'viewed_at' | 'dismissed_at' | 'interacted'
>;

/**
 * 로컬 저장소 배너 상태
 */
export interface LocalBannerState {
  bannerId: string;
  dismissedAt: string | null;
  viewedAt: string;
}

/**
 * 배너 필터 옵션
 */
export interface BannerFilterOptions {
  type?: NotificationBannerType;
  displayRule?: DisplayRule;
  isActive?: boolean;
  currentPath?: string; // user_action 필터용
}

/**
 * 배너 표시 평가 결과
 */
export interface BannerDisplayEvaluation {
  banner: NotificationBanner;
  shouldDisplay: boolean;
  reason?: string; // 표시하지 않는 이유
}
