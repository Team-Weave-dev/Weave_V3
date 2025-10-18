/**
 * NotificationBanner Component
 * DB 관리형 공지/알림 배너 UI
 */

'use client';

import React, { useState } from 'react';
import { X, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { notificationBanner } from '@/config/constants';
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

  const { type, message, webhook_url, webhook_button_text } = banner;
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
   * 웹훅 액션 핸들러
   */
  const handleWebhookAction = async () => {
    if (!webhook_url || !onWebhookAction) return;

    try {
      setIsLoading(true);

      // 기본 액션 타입: 'participate'
      // 추후 확장: 리뷰 모달, 확인 다이얼로그 등
      await onWebhookAction(banner.id, 'participate', {});
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

      {/* 메시지 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>

      {/* 액션 버튼 (웹훅이 있는 경우) */}
      {webhook_url && (
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
