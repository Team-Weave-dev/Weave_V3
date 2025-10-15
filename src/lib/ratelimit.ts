/**
 * 간단한 메모리 기반 Rate Limiting
 * 프로덕션에서는 Redis 기반 솔루션 (Upstash 등) 사용 권장
 */

interface RateLimitRecord {
  count: number
  resetTime: number
  lastAttempt: number
}

class InMemoryRateLimiter {
  private records = new Map<string, RateLimitRecord>()
  private readonly windowMs: number
  private readonly maxRequests: number

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests

    // 메모리 정리: 5분마다 오래된 레코드 제거
    setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  async limit(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
  }> {
    const now = Date.now()
    const record = this.records.get(identifier)

    // 레코드가 없거나 윈도우가 지난 경우
    if (!record || now > record.resetTime) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + this.windowMs,
        lastAttempt: now,
      }
      this.records.set(identifier, newRecord)

      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: newRecord.resetTime,
      }
    }

    // 제한 초과 확인
    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: record.resetTime,
      }
    }

    // 카운트 증가
    record.count++
    record.lastAttempt = now
    this.records.set(identifier, record)

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: record.resetTime,
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, record] of this.records.entries()) {
      // 리셋 시간이 10분 이상 지난 레코드 삭제
      if (now - record.resetTime > 10 * 60 * 1000) {
        this.records.delete(key)
      }
    }
  }

  clear(identifier: string) {
    this.records.delete(identifier)
  }
}

// 인증 API용 Rate Limiter (1분에 5회)
export const authRateLimiter = new InMemoryRateLimiter(60000, 5)

// 일반 API용 Rate Limiter (1분에 100회)
export const apiRateLimiter = new InMemoryRateLimiter(60000, 100)

/**
 * Rate Limiting 체크 헬퍼 함수
 */
export async function checkRateLimit(
  identifier: string,
  limiter: InMemoryRateLimiter = authRateLimiter
): Promise<{ success: boolean; error?: string; headers?: Record<string, string> }> {
  const result = await limiter.limit(identifier)

  if (!result.success) {
    const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
    return {
      success: false,
      error: `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  }

  return {
    success: true,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.reset.toString(),
    },
  }
}
