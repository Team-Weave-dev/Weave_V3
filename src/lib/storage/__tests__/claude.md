# src/lib/storage/__tests__ - 스토리지 테스트

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~85: 파일 라인 맵
- 86~88: 중앙화·모듈화·캡슐화
- 89~92: 작업 규칙
- 93~97: 관련 문서

## 디렉토리 목적
StorageManager와 서비스 시나리오를 검증하는 테스트를 보관합니다.

## 핵심 책임
- CRUD·버전 업그레이드·이벤트 브로드캐스트 테스트
- 성능·페일오버 회귀 방지

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- LocalStorageAdapter.test.ts 43~52 const keys
- LocalStorageAdapter.test.ts 53~57 const defaultAdapter
- LocalStorageAdapter.test.ts 58~62 const customAdapter
- LocalStorageAdapter.test.ts 63~72 const compressedAdapter
- LocalStorageAdapter.test.ts 73~75 const testValue
- LocalStorageAdapter.test.ts 76~80 const retrieved
- LocalStorageAdapter.test.ts 81~83 const testObject
- LocalStorageAdapter.test.ts 84~88 const retrieved
- LocalStorageAdapter.test.ts 89~91 const testArray
- LocalStorageAdapter.test.ts 92~96 const retrieved
- LocalStorageAdapter.test.ts 097~103 const retrieved
- LocalStorageAdapter.test.ts 104~110 const retrieved
- LocalStorageAdapter.test.ts 111~124 const retrieved
- LocalStorageAdapter.test.ts 125~128 const testObject
- LocalStorageAdapter.test.ts 129~139 const typeGuard - Type guard that checks for required properties
- LocalStorageAdapter.test.ts 140~146 const retrieved
- LocalStorageAdapter.test.ts 147~161 const typeGuard
- LocalStorageAdapter.test.ts 162~231 let callCount - First call is for isAvailable check (should succeed) Second call is for actual set (should throw QuotaExceededError)
- LocalStorageAdapter.test.ts 232~240 const keys
- LocalStorageAdapter.test.ts 241~248 const keys
- LocalStorageAdapter.test.ts 249~260 const keys
- LocalStorageAdapter.test.ts 261~265 const exists
- LocalStorageAdapter.test.ts 266~272 const exists
- LocalStorageAdapter.test.ts 273~291 const exists
- LocalStorageAdapter.test.ts 292~297 const unavailableAdapter
- LocalStorageAdapter.test.ts 298~306 let callCount - Mock isAvailable to return false by making setItem throw on test check
- LocalStorageAdapter.test.ts 307~313 const unavailableAdapter
- LocalStorageAdapter.test.ts 314~317 const compressedAdapter
- LocalStorageAdapter.test.ts 318~322 const stats
- LocalStorageAdapter.test.ts 323~327 const stats
- StorageManager.test.ts 45~59 const keys
- StorageManager.test.ts 60~66 const customManager
- StorageManager.test.ts 67~78 const customManager
- StorageManager.test.ts 79~83 const value
- StorageManager.test.ts 84~85 const testObject
- StorageManager.test.ts 86~90 const value
- StorageManager.test.ts 91~98 const value
- StorageManager.test.ts 099~105 const value1 - First get - from adapter
- StorageManager.test.ts 106~117 const value2 - Second get - from cache
- StorageManager.test.ts 118~124 const value - Get should return value2 from storage (not cached)
- StorageManager.test.ts 125~173 const cachedValue - Get should return cached value3
- StorageManager.test.ts 174~186 const cacheStats - Cache should be cleared
- StorageManager.test.ts 187~197 const result
- StorageManager.test.ts 198~205 const result
- StorageManager.test.ts 206~212 const result
- StorageManager.test.ts 213~218 const items
- StorageManager.test.ts 219~228 const result
- StorageManager.test.ts 229~235 const result
- StorageManager.test.ts 236~240 const items
- StorageManager.test.ts 241~249 const result
- StorageManager.test.ts 250~266 const subscriber
- StorageManager.test.ts 267~284 const subscriber
- StorageManager.test.ts 285~285 const subscriber
- StorageManager.test.ts 286~297 const unsubscribe
- StorageManager.test.ts 298~307 const subscriber
- StorageManager.test.ts 308~308 const subscriber1
- StorageManager.test.ts 309~350 const subscriber2
- StorageManager.test.ts 351~380 const transaction1
- StorageManager.test.ts 381~397 const stats
- StorageManager.test.ts 398~408 const stats - Cache should be cleared for project keys but not task keys
- StorageManager.test.ts 409~421 const stats - clearCache is private, so we test through cache behavior Cache will be cleared when it reaches maxSize
- StorageManager.test.ts 422~445 const stats

## 중앙화·모듈화·캡슐화
- 테스트 시나리오는 이 디렉터리에서 관리

## 작업 규칙
- 새 서비스·어댑터 추가 시 대응 테스트 작성
- 마이그레이션 변경 후 회귀 테스트 실행

## 관련 문서
- src/lib/storage/claude.md
- src/lib/storage/services/claude.md
- src/lib/storage/migrations/claude.md
