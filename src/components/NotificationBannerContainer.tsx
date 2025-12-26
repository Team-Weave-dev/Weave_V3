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
  position: _position = 'top',
}: NotificationBannerContainerProps = {}) {
  const { banners, loading, dismissBanner, triggerWebhook } = useNotificationBanner();

  // 최대 개수 제한
  const visibleBanners = banners.slice(0, maxBanners);

  // 배너가 없어도 Header 공간은 확보
  const hasBanners = !loading && visibleBanners.length > 0;

  return (
    <div
      className={cn(
        // Static positioning - 컨텐츠를 밀어냄
        'w-full',
        // Fixed Header 아래 배치 (Header는 fixed, h-14 sm:h-16)
        'pt-14 sm:pt-16',
        // 하단 간격
        hasBanners ? 'pb-2' : 'pb-0',
      )}
      role="region"
      aria-label="Notification Banners"
    >
      {/* 배너가 있을 때만 컨텐츠 렌더링 */}
      {hasBanners && (
        <div
          className={cn(
            'mx-auto px-4',
            // 최대 폭 (Tailwind 클래스 직접 사용)
            'max-w-7xl',
            // 배너 간 간격
            notificationBanner.layout.containerGap,
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
      )}
    </div>
  );
}
