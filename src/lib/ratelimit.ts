/**
 * Rate Limiting - 레거시 호환 레이어
 *
 * @deprecated 새 코드에서는 '@/lib/rate-limiter'를 직접 사용하세요.
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 *
 * @example
 * // 새로운 방식 (권장)
 * import { checkRateLimit, authRateLimiter } from '@/lib/rate-limiter'
 *
 * // 레거시 방식 (호환)
 * import { checkRateLimit } from '@/lib/ratelimit'
 */

export {
  checkRateLimit,
  authRateLimiter,
  apiRateLimiter,
  RateLimiter,
  type RateLimitResult,
  type RateLimiterConfig
} from './rate-limiter'
