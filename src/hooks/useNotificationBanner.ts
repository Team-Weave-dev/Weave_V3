/**
 * useNotificationBanner Hook
 * DB 관리형 공지/알림 배너 시스템
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  getActiveBanners,
  dismissBanner as dismissBannerApi,
  getDismissedBannersWithTime,
  createBannerView,
  markBannerInteracted,
} from '@/lib/supabase/notification-banner';
import { getNotificationBannerText } from '@/config/brand';
import type {
  NotificationBanner,
  BannerDisplayEvaluation,
  WebhookActionType,
  UseNotificationBannerReturn,
  ResetPeriod,
} from '@/types/notification-banner';

/**
 * 로컬 스토리지 키
 */
const LOCAL_STORAGE_KEY = 'notification-banner-dismissed';

/**
 * 리셋 주기에 따라 배너를 다시 표시할지 결정
 *
 * @param dismissedAt - 배너를 닫은 시간 (ISO 8601)
 * @param resetPeriod - 리셋 주기
 * @returns true이면 리셋되어 다시 표시해야 함
 */
function shouldResetBanner(dismissedAt: string | null, resetPeriod: ResetPeriod): boolean {
  // never: 영구적으로 숨김
  if (resetPeriod === 'never') {
    return false;
  }

  // 닫은 적이 없으면 표시
  if (!dismissedAt) {
    return true;
  }

  const now = new Date();
  const dismissed = new Date(dismissedAt);

  switch (resetPeriod) {
    case 'daily':
      // 날짜가 바뀌었으면 리셋
      return (
        now.getFullYear() !== dismissed.getFullYear() ||
        now.getMonth() !== dismissed.getMonth() ||
        now.getDate() !== dismissed.getDate()
      );

    case 'weekly':
      // 다음 주 월요일이 지났으면 리셋
      const nextMonday = new Date(dismissed);
      nextMonday.setDate(dismissed.getDate() + ((7 - dismissed.getDay() + 1) % 7 || 7));
      nextMonday.setHours(0, 0, 0, 0);
      return now >= nextMonday;

    case 'monthly':
      // 다음 달 1일이 지났으면 리셋
      const nextMonth = new Date(dismissed.getFullYear(), dismissed.getMonth() + 1, 1);
      return now >= nextMonth;

    default:
      return false;
  }
}

/**
 * 로컬 스토리지에서 닫힌 배너 ID 조회
 */
function getLocalDismissedBanners(): Set<string> {
  if (typeof window === 'undefined') return new Set();

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return new Set();
    const parsed = JSON.parse(stored);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    console.error('[useNotificationBanner] Failed to parse dismissed banners:', error);
    return new Set();
  }
}

/**
 * 로컬 스토리지에 닫힌 배너 ID 저장
 */
function saveLocalDismissedBanner(bannerId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const dismissed = getLocalDismissedBanners();
    dismissed.add(bannerId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...dismissed]));
  } catch (error) {
    console.error('[useNotificationBanner] Failed to save dismissed banner:', error);
  }
}

/**
 * 배너 표시 규칙 평가
 */
function evaluateBannerDisplay(
  banner: NotificationBanner,
  currentPath: string,
  dwellTime: number // 페이지 체류 시간 (초)
): BannerDisplayEvaluation {
  const { display_rule, trigger_action, dwell_time_seconds } = banner;

  switch (display_rule) {
    case 'always':
      // 항상 표시
      return { banner, shouldDisplay: true };

    case 'user_action':
      // 특정 경로 방문 시 표시
      if (!trigger_action) {
        return { banner, shouldDisplay: false, reason: 'trigger_action not configured' };
      }

      // trigger_action 형식: "page_visit:/dashboard"
      if (trigger_action.startsWith('page_visit:')) {
        const targetPath = trigger_action.replace('page_visit:', '');
        const matches = currentPath === targetPath || currentPath.startsWith(targetPath);
        return {
          banner,
          shouldDisplay: matches,
          reason: matches ? undefined : `Current path ${currentPath} does not match ${targetPath}`,
        };
      }

      return { banner, shouldDisplay: false, reason: 'Unknown trigger_action format' };

    case 'dwell_time':
      // 체류 시간 조건
      if (dwell_time_seconds === null || dwell_time_seconds === undefined) {
        return { banner, shouldDisplay: false, reason: 'dwell_time_seconds not configured' };
      }

      const shouldShow = dwellTime >= dwell_time_seconds;
      return {
        banner,
        shouldDisplay: shouldShow,
        reason: shouldShow ? undefined : `Dwell time ${dwellTime}s < required ${dwell_time_seconds}s`,
      };

    default:
      return { banner, shouldDisplay: false, reason: 'Unknown display_rule' };
  }
}

/**
 * useNotificationBanner Hook
 *
 * @example
 * ```tsx
 * const { banners, loading, dismissBanner, triggerWebhook } = useNotificationBanner();
 * ```
 */
export function useNotificationBanner(): UseNotificationBannerReturn {
  const pathname = usePathname();
  const { toast } = useToast();

  // 상태
  const [banners, setBanners] = useState<NotificationBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이지 체류 시간 추적
  const [dwellTime, setDwellTime] = useState(0);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 사용자 ID (Supabase Auth)
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * 배너 조회 및 평가
   */
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 활성 배너 조회
      const activeBanners = await getActiveBanners();

      // 닫힌 배너 정보 조회 (DB에서 dismissed_at 포함)
      const dismissedWithTime = await getDismissedBannersWithTime(userId);

      // 표시 규칙 평가
      const evaluatedBanners = activeBanners
        .map((banner) => evaluateBannerDisplay(banner, pathname, dwellTime))
        .filter((evaluation) => {
          const banner = evaluation.banner;

          // 닫힌 적이 있는지 확인
          const dismissedAt = dismissedWithTime.get(banner.id);
          if (dismissedAt) {
            // 리셋 주기에 따라 다시 표시할지 결정
            const shouldReset = shouldResetBanner(dismissedAt, banner.reset_period);
            if (!shouldReset) {
              console.log(`[useNotificationBanner] Banner ${banner.id} dismissed (reset_period: ${banner.reset_period})`);
              return false; // 리셋되지 않았으면 제외
            } else {
              console.log(`[useNotificationBanner] Banner ${banner.id} reset (reset_period: ${banner.reset_period})`);
            }
          }

          // 표시 조건 충족하지 않는 배너 제외
          if (!evaluation.shouldDisplay) {
            console.log(`[useNotificationBanner] Banner ${banner.id} hidden:`, evaluation.reason);
            return false;
          }
          return true;
        })
        .map((evaluation) => evaluation.banner);

      // 우선순위 정렬 (priority 낮을수록 높은 우선순위)
      evaluatedBanners.sort((a, b) => a.priority - b.priority);

      setBanners(evaluatedBanners);

      // 조회 기록 저장 (비인증 사용자도 가능)
      for (const banner of evaluatedBanners) {
        try {
          await createBannerView({ banner_id: banner.id, user_id: userId });
        } catch (err) {
          // 중복 에러는 무시
          console.log(`[useNotificationBanner] View already recorded for banner ${banner.id}`);
        }
      }
    } catch (err) {
      console.error('[useNotificationBanner] Failed to fetch banners:', err);
      setError(getNotificationBannerText.loadFailed());
      toast({
        title: getNotificationBannerText.loadFailed(),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pathname, dwellTime, userId, toast]);

  /**
   * 배너 닫기
   */
  const dismissBanner = useCallback(async (bannerId: string) => {
    try {
      // 로컬 저장
      saveLocalDismissedBanner(bannerId);

      // DB 업데이트
      await dismissBannerApi(bannerId, userId);

      // UI 업데이트
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
    } catch (err) {
      console.error('[useNotificationBanner] Failed to dismiss banner:', err);
      toast({
        title: getNotificationBannerText.dismissFailed(),
        variant: 'destructive',
      });
      throw err;
    }
  }, [userId, toast]);

  /**
   * 웹훅 트리거
   */
  const triggerWebhook = useCallback(async (
    bannerId: string,
    action: WebhookActionType,
    data: any
  ) => {
    try {
      // 인터랙션 기록
      await markBannerInteracted(bannerId, userId);

      // 웹훅 API Route로 POST
      const response = await fetch('/api/notification-banner/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          banner_id: bannerId,
          action,
          data,
        }),
      });

      if (!response.ok) {
        throw new Error('Webhook request failed');
      }

      // 성공 메시지
      if (action === 'review') {
        toast({
          title: getNotificationBannerText.reviewSubmitted(),
        });
      } else {
        toast({
          title: getNotificationBannerText.webhookSent(),
        });
      }

      // 배너 자동 닫기
      await dismissBanner(bannerId);
    } catch (err) {
      console.error('[useNotificationBanner] Failed to trigger webhook:', err);
      toast({
        title: getNotificationBannerText.webhookFailed(),
        variant: 'destructive',
      });
      throw err;
    }
  }, [userId, dismissBanner, toast]);

  /**
   * 배너 새로고침
   */
  const refreshBanners = useCallback(async () => {
    await fetchBanners();
  }, [fetchBanners]);

  /**
   * 초기 로드 및 페이지 변경 시 조회
   */
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  /**
   * 페이지 체류 시간 추적 (dwell_time 규칙용)
   */
  useEffect(() => {
    // 체류 시간 초기화
    setDwellTime(0);

    // 1초마다 증가
    dwellTimerRef.current = setInterval(() => {
      setDwellTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (dwellTimerRef.current) {
        clearInterval(dwellTimerRef.current);
      }
    };
  }, [pathname]);

  /**
   * dwell_time 변경 시 배너 재평가
   */
  useEffect(() => {
    // dwell_time 규칙을 사용하는 배너가 있으면 재평가
    if (dwellTime > 0 && dwellTime % 5 === 0) {
      // 5초마다 재평가 (성능 최적화)
      fetchBanners();
    }
  }, [dwellTime, fetchBanners]);

  /**
   * 사용자 ID 초기화 (Supabase Auth)
   */
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      } catch (err) {
        console.error('[useNotificationBanner] Failed to get user:', err);
        setUserId(null);
      }
    };

    initializeUser();
  }, []);

  return {
    banners,
    loading,
    error,
    dismissBanner,
    triggerWebhook,
    refreshBanners,
  };
}
