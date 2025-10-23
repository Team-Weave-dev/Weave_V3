/**
 * 뉴스레터 구독 API 엔드포인트
 *
 * @route POST /api/newsletter/subscribe
 *
 * @security
 * - IP 기반 Rate Limiting: 5분당 3회
 * - Email 기반 Rate Limiting: 1시간당 1회
 * - Email validation
 * - Honeypot field 체크
 * - Input sanitization
 *
 * @description
 * 사용자가 뉴스레터 구독을 요청하면:
 * 1. Rate limit 체크
 * 2. Email 유효성 검증
 * 3. Honeypot 필드 체크 (봇 방지)
 * 4. 외부 웹훅으로 전송
 * 5. 성공/실패 응답
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateEmail } from '@/lib/validation/email'
import {
  ipRateLimiter,
  emailRateLimiter,
  getClientIP,
  getRateLimitHeaders
} from '@/lib/rate-limit'

/**
 * 요청 바디 타입
 */
interface SubscribeRequestBody {
  email: string
  honeypot?: string // 봇 방지용 필드 (사람은 비워둠)
  source?: string // 구독 출처 (기본값: website_footer)
}

/**
 * 웹훅 페이로드 타입
 */
interface WebhookPayload {
  email: string
  timestamp: string
  source: string
  userAgent?: string
}

/**
 * POST /api/newsletter/subscribe
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 클라이언트 IP 추출
    const clientIP = getClientIP(request)

    // 2. IP 기반 Rate Limiting 체크
    const ipRateLimit = ipRateLimiter.check(clientIP)
    if (!ipRateLimit.allowed) {
      console.warn(`[Newsletter] Rate limit exceeded for IP: ${clientIP}`)
      return NextResponse.json(
        {
          error: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: ipRateLimit.retryAfter
        },
        {
          status: 429,
          headers: getRateLimitHeaders(ipRateLimit)
        }
      )
    }

    // 3. 요청 바디 파싱
    let body: SubscribeRequestBody
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      )
    }

    // 4. Honeypot 필드 체크 (봇 방지)
    if (body.honeypot && body.honeypot.trim().length > 0) {
      // 봇으로 의심되는 경우: 성공 응답을 보내지만 실제로는 처리하지 않음
      console.warn(`[Newsletter] Honeypot triggered for IP: ${clientIP}`)
      return NextResponse.json(
        { message: '구독 신청이 완료되었습니다!' },
        { status: 200 }
      )
    }

    // 5. Email 유효성 검증
    const emailValidation = validateEmail(body.email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error || '올바른 이메일 주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    const normalizedEmail = emailValidation.normalized!

    // 6. Email 기반 Rate Limiting 체크
    const emailRateLimit = emailRateLimiter.check(normalizedEmail)
    if (!emailRateLimit.allowed) {
      console.warn(`[Newsletter] Email rate limit exceeded: ${normalizedEmail}`)
      return NextResponse.json(
        {
          error: '이미 구독 신청하셨습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: emailRateLimit.retryAfter
        },
        {
          status: 429,
          headers: getRateLimitHeaders(emailRateLimit)
        }
      )
    }

    // 7. 웹훅 URL 확인
    const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL
    if (!webhookUrl) {
      // 웹훅이 설정되지 않은 경우: 로컬 로깅만
      console.log(`[Newsletter] Subscription request (no webhook): ${normalizedEmail}`)
      return NextResponse.json(
        { message: '구독 신청이 완료되었습니다!' },
        {
          status: 200,
          headers: getRateLimitHeaders(ipRateLimit)
        }
      )
    }

    // 8. 웹훅 페이로드 생성
    const payload: WebhookPayload = {
      email: normalizedEmail,
      timestamp: new Date().toISOString(),
      source: body.source || 'website_footer',
      userAgent: request.headers.get('user-agent') || undefined
    }

    // 9. 웹훅으로 전송
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Weave-Newsletter-Service/1.0'
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000) // 5초 타임아웃
      })

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed with status: ${webhookResponse.status}`)
      }

      console.log(`[Newsletter] Successfully sent to webhook: ${normalizedEmail}`)

      return NextResponse.json(
        { message: '구독 신청이 완료되었습니다!' },
        {
          status: 200,
          headers: getRateLimitHeaders(ipRateLimit)
        }
      )
    } catch (webhookError) {
      // 웹훅 실패는 로그만 기록하고 사용자에게는 성공 응답
      // (사용자 경험 우선, 내부 시스템 문제로 사용자를 혼란시키지 않음)
      console.error('[Newsletter] Webhook error:', webhookError)
      console.log(`[Newsletter] Failed to send webhook but logging: ${normalizedEmail}`)

      return NextResponse.json(
        { message: '구독 신청이 완료되었습니다!' },
        {
          status: 200,
          headers: getRateLimitHeaders(ipRateLimit)
        }
      )
    }
  } catch (error) {
    // 예상치 못한 서버 에러
    console.error('[Newsletter] Unexpected error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
