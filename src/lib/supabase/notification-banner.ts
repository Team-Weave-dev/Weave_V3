/**
 * Notification Banner Supabase 클라이언트 헬퍼
 * DB 관리형 공지/알림 배너 시스템
 */

import { createClient } from './client';
import type {
  NotificationBanner,
  NotificationBannerView,
  NotificationBannerWebhookLog,
  CreateNotificationBannerViewInput,
  BannerFilterOptions,
} from '@/types/notification-banner';

// =====================================================
// 배너 조회
// =====================================================

/**
 * 활성 배너 목록 조회
 * - is_active = true
 * - 날짜 범위 내 (start_date <= now <= end_date)
 * - priority 순 정렬 (낮을수록 높은 우선순위)
 */
export async function getActiveBanners(
  filters?: BannerFilterOptions
): Promise<NotificationBanner[]> {
  const supabase = createClient();

  let query = supabase
    .from('notification_banners')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  // 타입 필터
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  // 표시 규칙 필터
  if (filters?.displayRule) {
    query = query.eq('display_rule', filters.displayRule);
  }

  // 날짜 범위 필터 (현재 시간 기준)
  const now = new Date().toISOString();
  query = query.or(`start_date.is.null,start_date.lte.${now}`);
  query = query.or(`end_date.is.null,end_date.gte.${now}`);

  const { data, error } = await query;

  if (error) {
    console.error('[getActiveBanners] Error:', error);
    throw new Error(`활성 배너 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 특정 배너 조회 (ID)
 */
export async function getBannerById(
  bannerId: string
): Promise<NotificationBanner | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_banners')
    .select('*')
    .eq('id', bannerId)
    .single();

  if (error) {
    console.error('[getBannerById] Error:', error);
    return null;
  }

  return data;
}

// =====================================================
// 조회 기록 관리
// =====================================================

/**
 * 배너 조회 기록 생성
 * - 사용자가 배너를 본 시점 기록
 * - 중복 방지: UNIQUE (banner_id, user_id)
 */
export async function createBannerView(
  input: CreateNotificationBannerViewInput
): Promise<NotificationBannerView | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_banner_views')
    .insert({
      banner_id: input.banner_id,
      user_id: input.user_id,
      viewed_at: new Date().toISOString(),
      interacted: false,
    })
    .select()
    .single();

  if (error) {
    // 중복 에러는 무시 (이미 조회 기록이 있음)
    if (error.code === '23505') {
      console.log('[createBannerView] View already exists');
      return null;
    }
    console.error('[createBannerView] Error:', error);
    throw new Error(`배너 조회 기록 생성 실패: ${error.message}`);
  }

  return data;
}

/**
 * 배너 닫기 (dismissed_at 업데이트)
 */
export async function dismissBanner(
  bannerId: string,
  userId: string | null
): Promise<void> {
  const supabase = createClient();

  // 조회 기록이 없으면 생성
  const { data: existingView } = await supabase
    .from('notification_banner_views')
    .select('id')
    .eq('banner_id', bannerId)
    .eq('user_id', userId)
    .single();

  if (!existingView) {
    // 조회 기록 생성
    await createBannerView({ banner_id: bannerId, user_id: userId });
  }

  // dismissed_at 업데이트
  const { error } = await supabase
    .from('notification_banner_views')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('banner_id', bannerId)
    .eq('user_id', userId);

  if (error) {
    console.error('[dismissBanner] Error:', error);
    throw new Error(`배너 닫기 실패: ${error.message}`);
  }
}

/**
 * 사용자가 닫은 배너 목록 조회
 * - dismissed_at이 NULL이 아닌 배너
 */
export async function getDismissedBannerIds(
  userId: string | null
): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_banner_views')
    .select('banner_id')
    .eq('user_id', userId)
    .not('dismissed_at', 'is', null);

  if (error) {
    console.error('[getDismissedBannerIds] Error:', error);
    return [];
  }

  return (data || []).map((view) => view.banner_id);
}

/**
 * 사용자가 닫은 배너 상세 정보 조회 (리셋 판단용)
 * - banner_id와 dismissed_at 반환
 */
export async function getDismissedBannersWithTime(
  userId: string | null
): Promise<Map<string, string>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_banner_views')
    .select('banner_id, dismissed_at')
    .eq('user_id', userId)
    .not('dismissed_at', 'is', null);

  if (error) {
    console.error('[getDismissedBannersWithTime] Error:', error);
    return new Map();
  }

  const map = new Map<string, string>();
  (data || []).forEach((view) => {
    if (view.dismissed_at) {
      map.set(view.banner_id, view.dismissed_at);
    }
  });

  return map;
}

/**
 * 배너 인터랙션 기록 업데이트 (웹훅 실행 시)
 */
export async function markBannerInteracted(
  bannerId: string,
  userId: string | null
): Promise<void> {
  const supabase = createClient();

  // 조회 기록이 없으면 생성
  const { data: existingView } = await supabase
    .from('notification_banner_views')
    .select('id')
    .eq('banner_id', bannerId)
    .eq('user_id', userId)
    .single();

  if (!existingView) {
    await createBannerView({ banner_id: bannerId, user_id: userId });
  }

  // interacted 업데이트
  const { error } = await supabase
    .from('notification_banner_views')
    .update({ interacted: true })
    .eq('banner_id', bannerId)
    .eq('user_id', userId);

  if (error) {
    console.error('[markBannerInteracted] Error:', error);
    throw new Error(`배너 인터랙션 기록 실패: ${error.message}`);
  }
}

// =====================================================
// 웹훅 로그 관리 (Server-side only, service_role 필요)
// =====================================================

/**
 * 웹훅 로그 생성
 * 주의: 이 함수는 API Route에서 service_role 키로만 호출해야 함
 */
export async function createWebhookLog(
  input: Omit<NotificationBannerWebhookLog, 'id' | 'created_at'>
): Promise<NotificationBannerWebhookLog | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_banner_webhook_logs')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('[createWebhookLog] Error:', error);
    return null;
  }

  return data;
}

// =====================================================
// 관리자 기능 (CRUD)
// =====================================================

/**
 * 배너 생성 (관리자)
 */
export async function createBanner(
  input: Omit<NotificationBanner, 'id' | 'created_at' | 'updated_at'>
): Promise<NotificationBanner | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_banners')
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error('[createBanner] Error:', error);
    throw new Error(`배너 생성 실패: ${error.message}`);
  }

  return data;
}

/**
 * 배너 업데이트 (관리자)
 */
export async function updateBanner(
  bannerId: string,
  input: Partial<Omit<NotificationBanner, 'id' | 'created_at' | 'updated_at'>>
): Promise<NotificationBanner | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('notification_banners')
    .update(input)
    .eq('id', bannerId)
    .select()
    .single();

  if (error) {
    console.error('[updateBanner] Error:', error);
    throw new Error(`배너 업데이트 실패: ${error.message}`);
  }

  return data;
}

/**
 * 배너 삭제 (관리자)
 */
export async function deleteBanner(bannerId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notification_banners')
    .delete()
    .eq('id', bannerId);

  if (error) {
    console.error('[deleteBanner] Error:', error);
    throw new Error(`배너 삭제 실패: ${error.message}`);
  }
}

/**
 * 배너 활성화/비활성화 (관리자)
 */
export async function toggleBannerActive(
  bannerId: string,
  isActive: boolean
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('notification_banners')
    .update({ is_active: isActive })
    .eq('id', bannerId);

  if (error) {
    console.error('[toggleBannerActive] Error:', error);
    throw new Error(`배너 활성화 토글 실패: ${error.message}`);
  }
}
