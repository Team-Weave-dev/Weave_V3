# src/lib/storage - 통합 스토리지 시스템

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~33: 구조 요약
- 34~72: 파일 라인 맵
- 73~75: 중앙화·모듈화·캡슐화
- 76~79: 작업 규칙
- 80~85: 관련 문서

## 디렉토리 목적
LocalStorage와 향후 Supabase 동기화를 위한 통합 스토리지 레이어를 제공합니다.
StorageManager, 서비스, 어댑터, 타입, 마이그레이션을 한 체계로 관리합니다.

## 핵심 책임
- StorageManager와 이벤트 시스템 유지
- 도메인 서비스 및 마이그레이션 관리
- 성능 모니터링 유틸 제공

## 구조 요약
- __tests__/: 통합 테스트 (→ src/lib/storage/__tests__/claude.md)
- adapters/: 스토리지 어댑터 (→ src/lib/storage/adapters/claude.md)
- core/: StorageManager 코어 (→ src/lib/storage/core/claude.md)
- migrations/: 버전 관리 (→ src/lib/storage/migrations/claude.md)
- migrations/__tests__/: 마이그레이션 테스트 (→ src/lib/storage/migrations/__tests__/claude.md)
- monitoring/: 성능 모니터링 (→ src/lib/storage/monitoring/claude.md)
- services/: 도메인 서비스 (→ src/lib/storage/services/claude.md)
- services/__tests__/: 서비스 테스트 (→ src/lib/storage/services/__tests__/claude.md)
- types/: 엔티티 타입 (→ src/lib/storage/types/claude.md)
- types/entities/: 엔티티 세부 타입 (→ src/lib/storage/types/entities/claude.md)
- utils/: 성능 유틸 (→ src/lib/storage/utils/claude.md)

## 파일 라인 맵
- config.ts 21~45 export STORAGE_CONFIG - Default storage configuration - version: Schema version for migration tracking - prefix: Key prefix to namespace all storage entries - enableCache: Enable in-memory caching for better performance - enableCompression: Enable LZ-String compression for large values - compressionThreshold: Only compress values larger than this (bytes) - cacheTTL: Cache time-to-live in milliseconds
- config.ts 46~64 export CACHE_OPTIONS - Advanced cache configuration options These options control the behavior of the CacheLayer system.
- config.ts 65~96 export BATCH_OPTIONS - Batch operation configuration options These options control the behavior of batch processing operations.
- config.ts 097~144 export STORAGE_KEYS - Storage key constants These constants define the standard keys used in localStorage. Using constants prevents typos and makes refactoring easier.
- config.ts 145~164 export validateId - Validate and sanitize ID for storage key @param id - The ID to validate @param context - Context for error message (e.g., 'project', 'client') @throws {Error} If ID is invalid @returns Sanitized ID
- config.ts 165~190 export buildKey - Storage key builder functions These functions help build composite keys for related data. All IDs are validated and sanitized to prevent key injection attacks.
- config.ts 191~218 export CACHE_TTL - Default cache TTL values for different entity types Frequently accessed data can have longer TTL, while rarely accessed data should have shorter TTL.
- config.ts 219~250 export STORAGE_LIMITS - LocalStorage size limits These constants help manage storage quota and prevent errors.
- config.ts 251~285 export validateConfig - Validate storage configuration @param config - Storage configuration to validate @throws {Error} If configuration is invalid @returns true if configuration is valid @example ```typescript try { validateConfig(STORAGE_CONFIG); console.log('Configuration is valid'); } catch (error) { console.error('Invalid configuration:', error.message); } ```
- config.ts 286~310 export validateCacheOptions - Validate cache options @param options - Cache options to validate @throws {Error} If options are invalid @returns true if options are valid
- config.ts 311~348 export validateBatchOptions - Validate batch options @param options - Batch options to validate @throws {Error} If options are invalid @returns true if options are valid
- index.ts 132~240 export getStorage - Get storage manager instance @returns Storage manager instance @throws Error if storage is not initialized
- index.ts 241~249 export getServices - Get service instances @returns All service instances
- index.ts 250~250 export migrationManager
- index.ts 251~275 export backupManager
- index.ts 276~293 export storage - Legacy exports for backward compatibility Note: These dynamically use the current storage instance
- index.ts 294~303 export projectService
- index.ts 304~313 export taskService
- index.ts 314~323 export clientService
- index.ts 324~333 export calendarService
- index.ts 334~343 export documentService
- index.ts 344~353 export settingsService
- index.ts 354~363 export dashboardService
- index.ts 364~373 export userService
- index.ts 374~383 export todoSectionService
- index.ts 384~396 export activityLogService
- index.ts 397~397 export default export - Export types for convenience
- index.ts 398~400 export default export
- index.ts 401~401 export default export - Re-export entity types individually to avoid conflicts
- index.ts 402~402 export default export
- index.ts 403~403 export default export
- index.ts 404~404 export default export
- index.ts 405~405 export default export
- index.ts 406~406 export default export
- index.ts 407~407 export default export
- index.ts 408~408 export default export
- index.ts 409~409 export default export

## 중앙화·모듈화·캡슐화
- 스토리지 키·버전·엔티티 스키마는 storage 계층에서만 정의

## 작업 규칙
- 엔티티 구조 변경 시 types·services·migrations를 함께 업데이트
- 새 어댑터 추가 시 문서와 테스트를 작성

## 관련 문서
- src/lib/claude.md
- src/lib/supabase/claude.md
- src/app/projects/claude.md
- supabase/migrations/claude.md
