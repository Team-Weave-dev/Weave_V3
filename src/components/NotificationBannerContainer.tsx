/**
 * NotificationBannerContainer Component
 * 여러 배너를 관리하고 표시하는 컨테이너
 */

'use client';

import React from 'react';
import { NotificationBanner } from './ui/notification-banner';
import { useNotificationBanner } from '@/hooks/useNotificationBanner';
import { notificationBanner } from '@/config/constants';
import { cn } from '@/lib/utils';
import type { NotificationBannerContainerProps } from '@/types/notification-banner';

/**
 * NotificationBannerContainer Component
 *
 * @description
 * - 상단 고정 배너 컨테이너
 * - 최대 3개까지 동시 표시
 * - 우선순위 순 정렬
 *
 * @example
 * ```tsx
 * // layout.tsx에 추가
 * <NotificationBannerContainer />
 * ```
 */
export function NotificationBannerContainer({
  maxBanners = notificationBanner.limits.maxSimultaneous,
  position = 'top',
}: NotificationBannerContainerProps = {}) {
  const { banners, loading, dismissBanner, triggerWebhook } = useNotificationBanner();

  // 최대 개수 제한
  const visibleBanners = banners.slice(0, maxBanners);

  // 배너가 없으면 렌더링하지 않음
  if (loading || visibleBanners.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        // 위치
        'fixed left-0 right-0',
        position === 'top' ? 'top-0' : 'bottom-0',
        // Z-index
        `z-[${notificationBanner.layout.zIndex}]`,
        // 여백 (헤더 높이 고려)
        position === 'top' ? 'mt-16' : 'mb-4',
        // 포인터 이벤트
        'pointer-events-none'
      )}
      role="region"
      aria-label="Notification Banners"
    >
      {/* 중앙 정렬 컨테이너 */}
      <div
        className={cn(
          'mx-auto px-4',
          // 최대 폭
          `max-w-[${notificationBanner.layout.maxWidth}]`,
          // 배너 간 간격
          notificationBanner.layout.containerGap,
          // 포인터 이벤트 활성화
          'pointer-events-auto'
        )}
      >
        {visibleBanners.map((banner) => (
          <NotificationBanner
            key={banner.id}
            banner={banner}
            onDismiss={dismissBanner}
            onWebhookAction={triggerWebhook}
          />
        ))}
      </div>
    </div>
  );
}
