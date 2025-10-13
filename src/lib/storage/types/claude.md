# src/lib/storage/types - 스토리지 타입 시스템

## 라인 가이드
- 012~014: 디렉토리 목적
- 015~018: 핵심 책임
- 019~021: 구조 요약
- 022~089: 파일 라인 맵
- 090~092: 중앙화·모듈화·캡슐화
- 093~096: 작업 규칙
- 097~102: 관련 문서

## 디렉토리 목적
스토리지 엔티티와 서비스가 공유하는 타입 선언과 검증 스키마를 제공합니다.

## 핵심 책임
- 엔티티 스키마와 DTO·필터·응답 타입 정의
- entities/ 하위에서 도메인별 타입 관리

## 구조 요약
- entities/: 엔티티 세부 타입 (→ src/lib/storage/types/entities/claude.md)

## 파일 라인 맵
- base.ts 17~34 export BaseEntity - Base entity interface that all domain entities must extend Provides common fields for all entities in the system
- base.ts 35~41 export JsonPrimitive - JSON primitive types that can be safely serialized
- base.ts 42~48 export JsonObject - JSON object type Note: Using 'any' for index signature to allow nested objects of any shape All objects are JSON-serializable as long as they don't contain functions or symbols
- base.ts 49~54 export JsonArray - JSON array type
- base.ts 55~71 export JsonValue - Union type representing all valid JSON values Only these types can be safely stored and retrieved from storage
- base.ts 72~80 export TypeGuard - Type guard function for runtime type validation @template T - The type to validate against @param data - The data to validate @returns True if data matches type T, false otherwise @example ```typescript const isUser: TypeGuard<User> = (data): data is User => { return typeof data === 'object' && data !== null && 'id' in data && 'name' in data; }; ```
- base.ts 81~85 export StorageOperation - Storage operation types for event tracking
- base.ts 086~101 export StorageEvent - Storage event emitted when data changes
- base.ts 102~106 export Subscriber - Subscriber callback function for storage events
- base.ts 107~118 export Unsubscribe - Unsubscribe function returned by subscribe()
- base.ts 119~168 export StorageAdapter - Storage adapter interface - all storage backends must implement this This interface provides a consistent API for different storage solutions (LocalStorage, Supabase, etc.) and supports async operations for flexibility.
- base.ts 169~173 export TransactionFunction - Transaction function signature Transaction functions receive a storage adapter and can perform multiple operations. If the function throws, all operations should be rolled back.
- base.ts 174~189 export TransactionContext - Transaction context for rollback support
- base.ts 190~216 export StorageConfig - Storage system configuration
- base.ts 217~224 export BatchSetOperation - Batch operation for multiple set operations
- base.ts 225~238 export BatchOperationResult - Batch operation result
- base.ts 239~243 export RetryBackoffStrategy - Retry backoff strategy for batch operations
- base.ts 244~269 export BatchOptions - Batch configuration options
- base.ts 270~289 export CompressionStats - Compression statistics for monitoring storage efficiency
- base.ts 290~309 export CompressionOptions - Compression configuration options
- base.ts 310~318 export BaseCacheEntry - Base cache entry with TTL support
- base.ts 319~326 export LRUCacheEntry - LRU cache entry (Least Recently Used)
- base.ts 327~337 export LFUCacheEntry - LFU cache entry (Least Frequently Used)
- base.ts 338~345 export CacheEntry - Cache entry type based on eviction policy - LRU: requires lastAccess - LFU: requires accessCount - TTL: only requires basic fields
- base.ts 346~363 export CacheStats - Cache statistics for monitoring performance
- base.ts 364~368 export EvictionPolicy - Cache eviction policy
- base.ts 369~386 export CacheOptions - Cache configuration options
- base.ts 387~398 export IndexDefinition - Index definition for fast lookups
- base.ts 399~416 export IndexStats - Index statistics for monitoring performance
- base.ts 417~432 export IndexLookupResult - Index lookup result
- base.ts 433~441 export SchemaVersion - Schema version metadata
- base.ts 442~459 export Migration - Migration definition
- base.ts 460~477 export MigrationResult - Migration result
- base.ts 478~491 export BackupData - Backup data structure
- base.ts 492~514 export RestoreOptions - Options for restoring a backup
- base.ts 515~528 export RestoreResult - Result of a restore operation
- base.ts 529~555 export MigrationReport - Detailed report of a migration execution
- base.ts 556~568 export isStorageEvent - Check if a value is a valid StorageEvent
- base.ts 569~585 export isSchemaVersion - Check if a value is a valid SchemaVersion
- base.ts 586~598 export StorageErrorCode - Storage error codes for categorizing errors
- base.ts 599~603 export ErrorSeverity - Error severity levels
- base.ts 604~656 export StorageError - Custom error class for storage operations
- base.ts 657~672 export SetOptions - Options for set operations
- base.ts 673~684 export DeleteRelationsOptions - Options for deleting entities with relations
- base.ts 685~698 export DeleteError - Individual deletion error information
- base.ts 699~725 export DeleteRelationsResult - Result of deleting an entity with its relations
- base.ts 726~729 export STORAGE_CONSTANTS - Constants used throughout the storage system
- conflict.ts 12~20 export ConflictType - 충돌 유형
- conflict.ts 21~30 export ResolutionStrategy - 충돌 해결 전략
- conflict.ts 31~42 export FieldDifference - 필드별 차이점
- conflict.ts 43~69 export ConflictData - 충돌 데이터
- conflict.ts 70~79 export ConflictResolution - 충돌 해결 결과
- conflict.ts 080~113 export ConflictResolutionOptions - 충돌 해결 옵션
- conflict.ts 114~123 export ConflictDetectionResult - 충돌 감지 결과
- conflict.ts 124~132 export MergeStrategyFn - 병합 전략 함수 타입
- conflict.ts 133~147 export ConflictStats - 충돌 통계
- conflict.ts 148~166 export isConflictData - 타입 가드: ConflictData 검증
- conflict.ts 167~177 export isConflictResolution - 타입 가드: ConflictResolution 검증
- validators.ts 21~43 export isValidISODate - Validate ISO 8601 date string format @param value - Value to validate @returns True if value is a valid ISO 8601 date string @example isValidISODate("2025-01-05T10:30:00.000Z") // true (UTC with milliseconds) isValidISODate("2025-01-05T10:30:00Z") // true (UTC without milliseconds) isValidISODate("2025-01-05T10:30:00.000+09:00") // true (timezone offset) isValidISODate("2025-01-05T10:30:00+00:00") // true (timezone offset without milliseconds) isValidISODate("invalid-date") // false
- validators.ts 44~61 export isValidEmail - Validate email address format @param value - Value to validate @returns True if value is a valid email address @example isValidEmail("user@example.com") // true isValidEmail("invalid-email") // false
- validators.ts 62~83 export isValidURL - Validate URL format @param value - Value to validate @returns True if value is a valid URL @example isValidURL("https://example.com") // true isValidURL("not-a-url") // false
- validators.ts 84~98 export isStringArray - Validate string array @param value - Value to validate @returns True if value is an array of strings @example isStringArray(["a", "b", "c"]) // true isStringArray([1, 2, 3]) // false isStringArray(["a", 1, "b"]) // false
- validators.ts 099~118 export isValidDateRange - Validate date range (start date must be before or equal to end date) @param start - Start date string @param end - End date string @returns True if start date is before or equal to end date @example isValidDateRange("2025-01-01T00:00:00.000Z", "2025-12-31T23:59:59.999Z") // true isValidDateRange("2025-12-31T23:59:59.999Z", "2025-01-01T00:00:00.000Z") // false
- validators.ts 119~133 export isNumberInRange - Validate number is within range (inclusive) @param value - Number to validate @param min - Minimum value (inclusive) @param max - Maximum value (inclusive) @returns True if value is within range @example isNumberInRange(50, 0, 100) // true isNumberInRange(150, 0, 100) // false isNumberInRange(-10, 0, 100) // false
- validators.ts 134~148 export isPositiveNumber - Validate positive number @param value - Number to validate @returns True if value is a positive number (> 0) @example isPositiveNumber(10) // true isPositiveNumber(0) // false isPositiveNumber(-5) // false
- validators.ts 149~151 export isNonNegativeNumber - Validate non-negative number @param value - Number to validate @returns True if value is a non-negative number (>= 0) @example isNonNegativeNumber(10) // true isNonNegativeNumber(0) // true isNonNegativeNumber(-5) // false

## 중앙화·모듈화·캡슐화
- 엔티티 구조와 검증 규칙은 storage types에서만 정의

## 작업 규칙
- 엔티티 변경 시 서비스·마이그레이션·UI 문서를 갱신
- 런타임 검증과 타입이 일치하는지 확인

## 관련 문서
- src/lib/storage/claude.md
- src/lib/storage/services/claude.md
- supabase/migrations/claude.md
- src/types/claude.md
