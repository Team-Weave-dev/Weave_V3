/**
 * Notification Banner Webhook API Route
 * 웹훅 프록시 및 로깅
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getBannerById } from '@/lib/supabase/notification-banner';
import type { WebhookPayload, NotificationBannerType, WebhookActionType } from '@/types/notification-banner';

/**
 * POST /api/notification-banner/webhook
 *
 * @description
 * 웹훅 프록시 엔드포인트
 * - 클라이언트에서 직접 웹훅 URL 노출 방지
 * - 웹훅 로그 저장
 * - 에러 처리
 *
 * @example
 * ```ts
 * fetch('/api/notification-banner/webhook', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     banner_id: 'uuid',
 *     action: 'review',
 *     data: { rating: 5, review: 'Great!' }
 *   })
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 인증 확인
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 비인증 사용자도 허용 (익명 피드백 가능)
    const userId = user?.id || null;

    // 2. 요청 바디 파싱
    const body = await request.json();
    const { banner_id, action, data } = body;

    // 3. 입력 검증
    if (!banner_id || typeof banner_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid banner_id' },
        { status: 400 }
      );
    }

    if (!action || !['review', 'confirm', 'participate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // 4. 배너 조회
    const banner = await getBannerById(banner_id);
    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    if (!banner.webhook_url) {
      return NextResponse.json(
        { error: 'Banner has no webhook configured' },
        { status: 400 }
      );
    }

    // 5. 웹훅 페이로드 구성
    const webhookPayload: WebhookPayload = {
      banner_id: banner.id,
      banner_type: banner.type as NotificationBannerType,
      user_id: userId,
      action: action as WebhookActionType,
      data: data || {},
      timestamp: new Date().toISOString(),
    };

    // 6. 외부 웹훅 URL로 POST
    let webhookResponse: Response;
    let responseStatus: number = 0;
    let responseBody: string = '';
    let errorMessage: string | null = null;

    try {
      webhookResponse = await fetch(banner.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Weave-NotificationBanner/1.0',
        },
        body: JSON.stringify(webhookPayload),
      });

      responseStatus = webhookResponse.status;
      responseBody = await webhookResponse.text();

      if (!webhookResponse.ok) {
        errorMessage = `Webhook returned status ${responseStatus}`;
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Webhook API] Failed to send webhook:', error);
    }

    // 7. 웹훅 로그 저장 (비동기, 실패해도 응답은 반환)
    try {
      await supabase.from('notification_banner_webhook_logs').insert({
        banner_id: banner.id,
        user_id: userId,
        webhook_url: banner.webhook_url,
        payload: webhookPayload,
        response_status: responseStatus || null,
        response_body: responseBody || null,
        error_message: errorMessage,
      });
    } catch (logError) {
      console.error('[Webhook API] Failed to save webhook log:', logError);
      // 로그 저장 실패는 무시
    }

    // 8. 응답 반환
    if (errorMessage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webhook delivery failed',
          details: errorMessage,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook sent successfully',
      response_status: responseStatus,
    });
  } catch (error) {
    console.error('[Webhook API] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET 요청은 허용하지 않음
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
