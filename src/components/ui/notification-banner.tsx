/**
 * NotificationBanner Component
 * DB 관리형 공지/알림 배너 UI
 */

'use client';

import React, { useState, useMemo } from 'react';
import { X, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Textarea } from './textarea';
import { StarRating } from './star-rating';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { notificationBanner, reviewContexts } from '@/config/constants';
import { getNotificationBannerText } from '@/config/brand';
import { cn } from '@/lib/utils';
import type { NotificationBannerProps } from '@/types/notification-banner';

/**
 * 타입별 아이콘 매핑
 */
const ICON_MAP = {
  notice: Info,
  alert: AlertTriangle,
  urgent: AlertCircle,
} as const;

/**
 * NotificationBanner Component
 *
 * @example
 * ```tsx
 * <NotificationBanner
 *   banner={bannerData}
 *   onDismiss={handleDismiss}
 *   onWebhookAction={handleWebhook}
 * />
 * ```
 */
export function NotificationBanner({
  banner,
  onDismiss,
  onWebhookAction,
}: NotificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Review 전용 상태
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');

  /**
   * 페이지 컨텍스트 추출
   * trigger_action에서 페이지 식별자를 추출하여 reviewContexts 조회
   */
  const reviewContext = useMemo(() => {
    if (!banner.trigger_action || banner.action_type !== 'review') {
      return null;
    }

    // trigger_action 형식: "page_visit:/dashboard" → "dashboard"
    const match = banner.trigger_action.match(/^page_visit:\/(.+)$/);
    if (!match) return null;

    const page = match[1]; // "dashboard" or "projects"
    return reviewContexts[page] || null;
  }, [banner.trigger_action, banner.action_type]);

  const { type, message, webhook_url, webhook_button_text, action_type } = banner;
  const styles = notificationBanner.types[type];
  const Icon = ICON_MAP[type];

  /**
   * 닫기 핸들러
   */
  const handleDismiss = async () => {
    try {
      // 퇴장 애니메이션
      setIsVisible(false);

      // 애니메이션 완료 후 onDismiss 호출
      setTimeout(async () => {
        await onDismiss(banner.id);
      }, 300); // notificationBanner.animation.duration과 동기화
    } catch (error) {
      console.error('[NotificationBanner] Failed to dismiss:', error);
      setIsVisible(true); // 실패 시 다시 표시
    }
  };

  /**
   * 리뷰 제출 핸들러
   */
  const handleReviewSubmit = async () => {
    if (!webhook_url || !onWebhookAction) return;

    // 별점 미선택 시 경고
    if (rating === 0) {
      alert('별점을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      // 페이지 정보 추출 (reviewContext가 있으면 페이지 식별자 포함)
      const page = reviewContext ? banner.trigger_action?.match(/^page_visit:\/(.+)$/)?.[1] : undefined;

      // 리뷰 데이터 전송 (context 포함)
      await onWebhookAction(banner.id, 'review', {
        rating,
        review: reviewText.trim() || undefined,
        context: page
          ? {
              page,
              selectedOption: selectedOption || undefined,
            }
          : undefined,
      });
    } catch (error) {
      console.error('[NotificationBanner] Failed to submit review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 일반 웹훅 액션 핸들러 (participate, confirm)
   */
  const handleWebhookAction = async () => {
    if (!webhook_url || !onWebhookAction || !action_type) return;

    try {
      setIsLoading(true);

      // 액션 타입에 따라 데이터 전송
      await onWebhookAction(banner.id, action_type, {});
    } catch (error) {
      console.error('[NotificationBanner] Failed to trigger webhook:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 아리아 라벨 가져오기
   */
  const getAriaLabel = () => {
    switch (type) {
      case 'notice':
        return getNotificationBannerText.noticeAriaLabel();
      case 'alert':
        return getNotificationBannerText.alertAriaLabel();
      case 'urgent':
        return getNotificationBannerText.urgentAriaLabel();
      default:
        return 'Notification Banner';
    }
  };

  return (
    <div
      role="alert"
      aria-live={type === 'urgent' ? 'assertive' : 'polite'}
      aria-label={getAriaLabel()}
      className={cn(
        // 기본 레이아웃
        'flex items-start border rounded-lg shadow-sm',
        notificationBanner.layout.padding,
        notificationBanner.layout.gap,
        // 타입별 스타일
        styles.bg,
        styles.border,
        styles.text,
        // 애니메이션
        notificationBanner.animation.transition,
        isVisible ? notificationBanner.animation.slideIn : notificationBanner.animation.slideOut,
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* 아이콘 */}
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={cn('h-5 w-5', styles.icon)} aria-hidden="true" />
      </div>

      {/* 메시지 및 콘텐츠 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed mb-2">{message}</p>

        {/* 리뷰 액션 (별점 + 선택형 필드 + 텍스트) */}
        {webhook_url && action_type === 'review' && (
          <div className="space-y-3 mt-3">
            {/* 별점 선택 */}
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="md"
                disabled={isLoading}
              />
              {rating > 0 && (
                <span className="text-xs text-gray-600">{rating}점</span>
              )}
            </div>

            {/* 페이지별 선택형 필드 (위젯/기능 선택) */}
            {reviewContext && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  {reviewContext.label}
                </label>
                <Select
                  value={selectedOption}
                  onValueChange={setSelectedOption}
                  disabled={isLoading}
                >
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue placeholder={reviewContext.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {reviewContext.options.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 리뷰 텍스트 (선택) */}
            <Textarea
              placeholder="간단한 리뷰를 남겨주세요 (선택사항)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={isLoading}
              className="text-sm resize-none h-16"
              maxLength={200}
            />

            {/* 제출 버튼 */}
            <Button
              size="sm"
              onClick={handleReviewSubmit}
              disabled={isLoading || rating === 0}
              className={cn(
                'w-full text-xs font-medium',
                notificationBanner.animation.transition
              )}
            >
              {isLoading ? '제출 중...' : '리뷰 제출'}
            </Button>
          </div>
        )}
      </div>

      {/* 일반 액션 버튼 (participate, confirm) */}
      {webhook_url && action_type && action_type !== 'review' && (
        <div className="flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleWebhookAction}
            disabled={isLoading}
            className={cn(
              'text-xs font-medium',
              styles.button,
              notificationBanner.animation.transition
            )}
          >
            {isLoading
              ? getNotificationBannerText.webhookSending()
              : webhook_button_text || getNotificationBannerText.defaultButton()}
          </Button>
        </div>
      )}

      {/* 닫기 버튼 */}
      <button
        type="button"
        onClick={handleDismiss}
        className={cn(
          'flex-shrink-0 rounded-md p-1.5',
          'hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
          styles.icon,
          notificationBanner.animation.transition
        )}
        aria-label={getNotificationBannerText.closeAriaLabel()}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
