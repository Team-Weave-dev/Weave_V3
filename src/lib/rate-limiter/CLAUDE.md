# src/lib/rate-limiter - 통합 Rate Limiting 시스템

## 라인 가이드
- 012~015: 디렉토리 목적
- 016~020: 핵심 책임
- 021~023: 구조 요약
- 024~055: 파일 라인 맵
- 056~062: Redis 전환 가이드
- 063~068: 중앙화·모듈화·캡슐화
- 069~074: 작업 규칙
- 075~080: 관련 문서

## 디렉토리 목적
IP 및 식별자 기반 요청 속도 제한을 제공합니다.
어댑터 패턴으로 Memory/Redis 백엔드를 추상화합니다.

## 핵심 책임
- 인증 API Rate Limiting (1분당 5회)
- 일반 API Rate Limiting (1분당 100회)
- 뉴스레터 IP/이메일 Rate Limiting
- Redis 전환을 위한 어댑터 인터페이스 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- index.ts 024~040 export RateLimitEntry - Rate limit 항목 타입
- index.ts 041~055 export RateLimiterConfig - Rate limiter 설정 타입
- index.ts 056~075 export RateLimitResult - Rate limit 체크 결과 타입
- index.ts 076~095 export RateLimiterAdapter - 스토리지 어댑터 인터페이스 (Redis 전환 준비)
- index.ts 096~175 export MemoryAdapter - 메모리 기반 어댑터 구현체
- index.ts 176~240 export RateLimiter - Rate Limiter 클래스
- index.ts 241~260 export authRateLimiter - 인증 API용 (1분당 5회)
- index.ts 261~265 export apiRateLimiter - 일반 API용 (1분당 100회)
- index.ts 266~270 export ipRateLimiter - IP 기반 (5분당 3회)
- index.ts 271~275 export emailRateLimiter - 이메일 기반 (1시간당 1회)
- index.ts 276~295 export getClientIP - Request에서 클라이언트 IP 추출
- index.ts 296~310 export getRateLimitHeaders - Rate limit 응답 헤더 생성
- index.ts 311~330 export checkRateLimit - Rate Limiting 체크 헬퍼 함수

## Redis 전환 가이드

```typescript
// 1. Upstash Redis 클라이언트 설치
// npm install @upstash/redis

// 2. RedisAdapter 구현 (예시)
class UpstashAdapter implements RateLimiterAdapter {
  private redis: Redis

  async increment(key: string, windowMs: number, maxRequests: number) {
    // Upstash Redis의 INCR + EXPIRE 사용
  }
}

// 3. 어댑터 교체
const redisAdapter = new UpstashAdapter()
const authRateLimiter = new RateLimiter(config, redisAdapter)
```

## 중앙화·모듈화·캡슐화
- 모든 Rate Limiting 로직은 이 디렉토리에서 관리
- 레거시 파일(rate-limit.ts, ratelimit.ts)은 호환 레이어로 유지

## 작업 규칙
- 새 Rate Limiter 추가 시 공유 MemoryAdapter 사용
- Redis 전환 시 RateLimiterAdapter 인터페이스 구현
- 임계값 변경 시 보안 리포트 검토

## 관련 문서
- src/lib/claude.md
- docs/Security-Vulnerability-Report-2025-10-15.md
- src/app/api/auth/claude.md
