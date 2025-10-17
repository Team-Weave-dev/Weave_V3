/**
 * Rate Limiting 유틸리티
 *
 * @description
 * IP 및 식별자 기반 요청 속도 제한을 제공합니다.
 * - 메모리 기반 (서버 재시작 시 초기화)
 * - Sliding window 방식
 * - 자동 만료 및 정리
 * - DDoS 및 봇 공격 방지
 *
 * @security
 * - IP 기반: 동일 IP에서 과도한 요청 방지
 * - 식별자 기반: 동일 이메일/리소스에 대한 중복 요청 방지
 * - 메모리 누수 방지: 만료된 항목 자동 정리
 */

/**
 * Rate limit 항목 타입
 */
interface RateLimitEntry {
  count: number // 현재 요청 횟수
  resetTime: number // 리셋 시간 (Unix timestamp)
}

/**
 * Rate limiter 설정 타입
 */
export interface RateLimiterConfig {
  windowMs: number // 시간 윈도우 (밀리초)
  maxRequests: number // 윈도우 내 최대 요청 수
}

/**
 * Rate limit 체크 결과 타입
 */
export interface RateLimitResult {
  allowed: boolean // 요청 허용 여부
  remaining: number // 남은 요청 횟수
  resetTime: number // 리셋 시간
  retryAfter?: number // 재시도 가능 시간 (초)
}

/**
 * Rate Limiter 클래스
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry>
  private config: RateLimiterConfig
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config: RateLimiterConfig) {
    this.store = new Map()
    this.config = config

    // 5분마다 만료된 항목 정리
    this.startCleanup()
  }

  /**
   * 주기적으로 만료된 항목을 정리합니다
   */
  private startCleanup() {
    // 5분마다 정리
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        if (now >= entry.resetTime) {
          this.store.delete(key)
        }
      }
    }, 5 * 60 * 1000)

    // Node.js 프로세스가 종료될 때 cleanup interval도 정리
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  /**
   * Rate limit을 체크합니다
   *
   * @param identifier - 고유 식별자 (IP, 이메일 등)
   * @returns Rate limit 체크 결과
   */
  check(identifier: string): RateLimitResult {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // 첫 요청이거나 리셋 시간이 지난 경우
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + this.config.windowMs
      this.store.set(identifier, {
        count: 1,
        resetTime
      })

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime
      }
    }

    // 리셋 시간 이전인 경우
    if (entry.count < this.config.maxRequests) {
      // 요청 허용
      entry.count++
      this.store.set(identifier, entry)

      return {
        allowed: true,
        remaining: this.config.maxRequests - entry.count,
        resetTime: entry.resetTime
      }
    } else {
      // Rate limit 초과
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter
      }
    }
  }

  /**
   * 특정 식별자의 rate limit을 초기화합니다
   *
   * @param identifier - 초기화할 식별자
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * 모든 rate limit을 초기화합니다
   */
  resetAll(): void {
    this.store.clear()
  }

  /**
   * Cleanup interval을 중지합니다
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

/**
 * 뉴스레터 구독용 Rate Limiters
 */

// IP 기반 Rate Limiter: 5분당 3회
export const ipRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5분
  maxRequests: 3
})

// 이메일 기반 Rate Limiter: 1시간당 1회
export const emailRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1시간
  maxRequests: 1
})

/**
 * Next.js Request에서 클라이언트 IP를 추출합니다
 *
 * @param request - Next.js Request 객체
 * @returns 클라이언트 IP 주소
 */
export function getClientIP(request: Request): string {
  // Vercel, Cloudflare 등의 프록시 환경 고려
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for는 "client, proxy1, proxy2" 형식
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  // fallback (로컬 개발 환경)
  return '127.0.0.1'
}

/**
 * Rate limit 응답 헤더를 생성합니다
 *
 * @param result - Rate limit 체크 결과
 * @returns HTTP 헤더 객체
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.resetTime / 1000))
  }

  if (!result.allowed && result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter)
  }

  return headers
}
