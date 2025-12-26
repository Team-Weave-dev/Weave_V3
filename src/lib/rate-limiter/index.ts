/**
 * 통합 Rate Limiting 시스템
 *
 * @description
 * IP 및 식별자 기반 요청 속도 제한을 제공합니다.
 * 메모리 기반 구현과 Redis 어댑터 인터페이스를 포함합니다.
 *
 * @architecture
 * - RateLimiterAdapter: 스토리지 백엔드 추상화 (Memory, Redis)
 * - RateLimiter: 핵심 Rate Limiting 로직
 * - Pre-configured instances: auth, api, newsletter 용도별 인스턴스
 *
 * @migration
 * Redis 전환 시: MemoryAdapter → RedisAdapter 교체
 * 코드 변경 없이 어댑터만 교체하면 됨
 *
 * @security
 * - IP 기반: 동일 IP에서 과도한 요청 방지
 * - 식별자 기반: 동일 이메일/리소스에 대한 중복 요청 방지
 * - 메모리 누수 방지: 만료된 항목 자동 정리
 */

// ============================================
// Types
// ============================================

/**
 * Rate limit 항목 타입
 */
export interface RateLimitEntry {
  count: number
  resetTime: number
  lastAttempt?: number
}

/**
 * Rate limiter 설정 타입
 */
export interface RateLimiterConfig {
  /** 시간 윈도우 (밀리초) */
  windowMs: number
  /** 윈도우 내 최대 요청 수 */
  maxRequests: number
  /** 키 프리픽스 (Redis 사용 시) */
  prefix?: string
}

/**
 * Rate limit 체크 결과 타입
 */
export interface RateLimitResult {
  /** 요청 허용 여부 */
  success: boolean
  /** 최대 허용 요청 수 */
  limit: number
  /** 남은 요청 횟수 */
  remaining: number
  /** 리셋 시간 (Unix timestamp ms) */
  reset: number
  /** 재시도 가능 시간 (초) - 실패 시에만 */
  retryAfter?: number
}

// ============================================
// Adapter Interface (Redis 전환 준비)
// ============================================

/**
 * Rate Limiter 스토리지 어댑터 인터페이스
 *
 * @description
 * Redis 전환을 위한 추상화 레이어
 * 구현체: MemoryAdapter (현재), RedisAdapter (향후)
 */
export interface RateLimiterAdapter {
  /**
   * 식별자에 대한 현재 상태 조회
   */
  get(key: string): Promise<RateLimitEntry | null>

  /**
   * 식별자 상태 업데이트
   */
  set(key: string, entry: RateLimitEntry, ttlMs: number): Promise<void>

  /**
   * 식별자 상태 삭제
   */
  delete(key: string): Promise<void>

  /**
   * 카운터 증가 (atomic operation)
   */
  increment(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult>
}

// ============================================
// Memory Adapter Implementation
// ============================================

/**
 * 메모리 기반 Rate Limiter 어댑터
 *
 * @note 서버 재시작 시 초기화됨
 * @note 단일 서버 환경에 적합
 */
export class MemoryAdapter implements RateLimiterAdapter {
  private store: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    this.startCleanup()
  }

  private startCleanup() {
    // 5분마다 만료된 항목 정리
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        // 리셋 시간이 10분 이상 지난 항목 삭제
        if (now - entry.resetTime > 10 * 60 * 1000) {
          this.store.delete(key)
        }
      }
    }, 5 * 60 * 1000)

    // Node.js 프로세스 종료 시 cleanup
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }
  }

  async get(key: string): Promise<RateLimitEntry | null> {
    return this.store.get(key) || null
  }

  async set(key: string, entry: RateLimitEntry, _ttlMs: number): Promise<void> {
    this.store.set(key, entry)
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async increment(key: string, windowMs: number, maxRequests: number): Promise<RateLimitResult> {
    const now = Date.now()
    const entry = this.store.get(key)

    // 첫 요청이거나 리셋 시간이 지난 경우
    if (!entry || now >= entry.resetTime) {
      const resetTime = now + windowMs
      this.store.set(key, {
        count: 1,
        resetTime,
        lastAttempt: now
      })

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        reset: resetTime
      }
    }

    // 제한 초과 확인
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        reset: entry.resetTime,
        retryAfter
      }
    }

    // 카운트 증가
    entry.count++
    entry.lastAttempt = now
    this.store.set(key, entry)

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      reset: entry.resetTime
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.store.clear()
  }
}

// ============================================
// Rate Limiter Class
// ============================================

/**
 * Rate Limiter 클래스
 */
export class RateLimiter {
  private adapter: RateLimiterAdapter
  private config: RateLimiterConfig

  constructor(config: RateLimiterConfig, adapter?: RateLimiterAdapter) {
    this.config = config
    this.adapter = adapter || new MemoryAdapter()
  }

  /**
   * Rate limit 체크 (async)
   */
  async limit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.prefix
      ? `${this.config.prefix}:${identifier}`
      : identifier

    return this.adapter.increment(key, this.config.windowMs, this.config.maxRequests)
  }

  /**
   * Rate limit 체크 (sync - 하위 호환성)
   * @deprecated Use limit() instead
   */
  check(identifier: string): RateLimitResult {
    // MemoryAdapter인 경우에만 동기적으로 처리 가능
    const key = this.config.prefix
      ? `${this.config.prefix}:${identifier}`
      : identifier

    if (this.adapter instanceof MemoryAdapter) {
      // 동기 버전을 위해 직접 접근 (레거시 호환)
      const store = (this.adapter as unknown as { store: Map<string, RateLimitEntry> }).store
      const now = Date.now()
      const entry = store.get(key)

      if (!entry || now >= entry.resetTime) {
        const resetTime = now + this.config.windowMs
        store.set(key, { count: 1, resetTime, lastAttempt: now })
        return {
          success: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests - 1,
          reset: resetTime
        }
      }

      if (entry.count >= this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          reset: entry.resetTime,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        }
      }

      entry.count++
      entry.lastAttempt = now
      store.set(key, entry)

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - entry.count,
        reset: entry.resetTime
      }
    }

    throw new Error('Sync check() is only available with MemoryAdapter')
  }

  /**
   * 특정 식별자의 rate limit 초기화
   */
  async reset(identifier: string): Promise<void> {
    const key = this.config.prefix
      ? `${this.config.prefix}:${identifier}`
      : identifier
    await this.adapter.delete(key)
  }
}

// ============================================
// Pre-configured Instances
// ============================================

// 공유 메모리 어댑터 (단일 인스턴스)
const sharedMemoryAdapter = new MemoryAdapter()

/** 인증 API용 Rate Limiter (1분당 5회) */
export const authRateLimiter = new RateLimiter(
  { windowMs: 60 * 1000, maxRequests: 5, prefix: 'auth' },
  sharedMemoryAdapter
)

/** 일반 API용 Rate Limiter (1분당 100회) */
export const apiRateLimiter = new RateLimiter(
  { windowMs: 60 * 1000, maxRequests: 100, prefix: 'api' },
  sharedMemoryAdapter
)

/** IP 기반 Rate Limiter (뉴스레터용, 5분당 3회) */
export const ipRateLimiter = new RateLimiter(
  { windowMs: 5 * 60 * 1000, maxRequests: 3, prefix: 'ip' },
  sharedMemoryAdapter
)

/** 이메일 기반 Rate Limiter (뉴스레터용, 1시간당 1회) */
export const emailRateLimiter = new RateLimiter(
  { windowMs: 60 * 60 * 1000, maxRequests: 1, prefix: 'email' },
  sharedMemoryAdapter
)

// ============================================
// Helper Functions
// ============================================

/**
 * Next.js Request에서 클라이언트 IP 추출
 */
export function getClientIP(request: Request): string {
  // Vercel, Cloudflare 등의 프록시 환경 고려
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  return '127.0.0.1'
}

/**
 * Rate limit 응답 헤더 생성
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.floor(result.reset / 1000))
  }

  if (!result.success && result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter)
  }

  return headers
}

/**
 * Rate Limiting 체크 헬퍼 함수
 */
export async function checkRateLimit(
  identifier: string,
  limiter: RateLimiter = authRateLimiter
): Promise<{ success: boolean; error?: string; headers?: Record<string, string> }> {
  const result = await limiter.limit(identifier)

  if (!result.success) {
    return {
      success: false,
      error: `요청이 너무 많습니다. ${result.retryAfter}초 후 다시 시도해주세요.`,
      headers: getRateLimitHeaders(result)
    }
  }

  return {
    success: true,
    headers: getRateLimitHeaders(result)
  }
}

// ============================================
// Re-exports for backward compatibility
// ============================================

// 레거시 호환성을 위한 타입 별칭
export type RateLimitRecord = RateLimitEntry
export type RateLimiterResult = RateLimitResult
