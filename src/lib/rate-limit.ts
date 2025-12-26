/**
 * Rate Limiting - 레거시 호환 레이어 (뉴스레터용)
 *
 * @deprecated 새 코드에서는 '@/lib/rate-limiter'를 직접 사용하세요.
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 *
 * @example
 * // 새로운 방식 (권장)
 * import { ipRateLimiter, emailRateLimiter, getClientIP } from '@/lib/rate-limiter'
 *
 * // 레거시 방식 (호환)
 * import { ipRateLimiter, emailRateLimiter, getClientIP } from '@/lib/rate-limit'
 */

import {
  ipRateLimiter as newIpRateLimiter,
  emailRateLimiter as newEmailRateLimiter,
  getClientIP,
  getRateLimitHeaders as newGetRateLimitHeaders,
  RateLimiter,
  type RateLimitResult,
  type RateLimiterConfig
} from './rate-limiter'

// 레거시 API 호환 래퍼
// 기존 코드는 check() 메서드와 { allowed, remaining, resetTime } 반환값 사용
class LegacyRateLimiterWrapper {
  private limiter: typeof newIpRateLimiter

  constructor(limiter: typeof newIpRateLimiter) {
    this.limiter = limiter
  }

  check(identifier: string): {
    allowed: boolean
    remaining: number
    resetTime: number
    retryAfter?: number
  } {
    const result = this.limiter.check(identifier)
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetTime: result.reset,
      retryAfter: result.retryAfter
    }
  }

  reset(identifier: string): void {
    this.limiter.reset(identifier)
  }
}

// 레거시 호환 인스턴스
export const ipRateLimiter = new LegacyRateLimiterWrapper(newIpRateLimiter)
export const emailRateLimiter = new LegacyRateLimiterWrapper(newEmailRateLimiter)

// 레거시 헤더 생성 함수 (allowed 대신 success 사용하는 버전)
export function getRateLimitHeaders(result: {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}): Record<string, string> {
  return newGetRateLimitHeaders({
    success: result.allowed,
    limit: result.remaining + (result.allowed ? 1 : 0),
    remaining: result.remaining,
    reset: result.resetTime,
    retryAfter: result.retryAfter
  })
}

// Re-exports
export { getClientIP, RateLimiter }
export type { RateLimitResult, RateLimiterConfig }
