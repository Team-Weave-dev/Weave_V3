# src/lib/storage/migrations/__tests__ - 마이그레이션 테스트

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~86: 파일 라인 맵
- 87~89: 중앙화·모듈화·캡슐화
- 90~93: 작업 규칙
- 94~98: 관련 문서

## 디렉토리 목적
마이그레이션 단계가 의도한 대로 작동하는지 검증합니다.

## 핵심 책임
- 업그레이드·롤백 시나리오 테스트
- 실패 케이스와 복구 절차 검증

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- MigrationManager.test.ts 013~101 const localStorageMock - Mock localStorage
- MigrationManager.test.ts 102~138 const registered
- MigrationManager.test.ts 139~149 const version
- MigrationManager.test.ts 150~156 const version
- MigrationManager.test.ts 157~161 const schemaVersion
- MigrationManager.test.ts 162~169 const expectedVersion
- MigrationManager.test.ts 170~178 const schemaVersion
- MigrationManager.test.ts 179~191 const version
- MigrationManager.test.ts 192~198 const version
- MigrationManager.test.ts 199~207 const migrations
- MigrationManager.test.ts 208~228 const migrations
- MigrationManager.test.ts 229~238 let migrationExecuted
- MigrationManager.test.ts 239~245 const results
- MigrationManager.test.ts 246~269 const currentVersion
- MigrationManager.test.ts 270~276 const results
- MigrationManager.test.ts 277~287 const currentVersion
- MigrationManager.test.ts 288~290 const results
- MigrationManager.test.ts 291~303 const currentVersion
- MigrationManager.test.ts 304~341 const results
- MigrationManager.test.ts 342~342 const migration1
- MigrationManager.test.ts 343~357 const migration2
- MigrationManager.test.ts 358~376 const schemaVersion
- MigrationManager.test.ts 377~377 const users
- MigrationManager.test.ts 378~387 const updatedUsers
- MigrationManager.test.ts 388~423 const users
- MigrationManager.test.ts 424~429 const results
- MigrationManager.test.ts 430~432 const currentVersion
- MigrationManager.test.ts 433~437 const testKey2
- MigrationManager.test.ts 438~443 const results
- MigrationManager.test.ts 444~469 const currentVersion
- MigrationManager.test.ts 470~470 const rollback1
- MigrationManager.test.ts 471~479 const rollback2
- MigrationManager.test.ts 480~494 const schemaVersion
- MigrationManager.test.ts 495~508 const results
- MigrationManager.test.ts 509~523 const registered
- MigrationManager.test.ts 524~534 const results
- MigrationManager.test.ts 535~542 const results
- SafeMigrationManager.test.ts 12~29 const localStorageMock - Mock localStorage
- SafeMigrationManager.test.ts 30~59 const keys
- SafeMigrationManager.test.ts 60~60 const migrationManager
- SafeMigrationManager.test.ts 61~69 const backupManager
- SafeMigrationManager.test.ts 70~75 const manager
- SafeMigrationManager.test.ts 76~90 const manager
- SafeMigrationManager.test.ts 091~107 const manager
- SafeMigrationManager.test.ts 108~118 const result
- SafeMigrationManager.test.ts 119~129 const migratedData - Verify migration was applied
- SafeMigrationManager.test.ts 130~141 const result
- SafeMigrationManager.test.ts 142~161 const result
- SafeMigrationManager.test.ts 162~170 const result
- SafeMigrationManager.test.ts 171~186 const testData - Verify data was restored to original state
- SafeMigrationManager.test.ts 187~205 const result
- SafeMigrationManager.test.ts 206~219 const originalRestore - Mock BackupManager to make restore fail
- SafeMigrationManager.test.ts 220~229 const downloadSpy - Mock downloadBackup to avoid actual file download
- SafeMigrationManager.test.ts 230~257 const result
- SafeMigrationManager.test.ts 258~272 const result
- SafeMigrationManager.test.ts 273~280 const count
- SafeMigrationManager.test.ts 281~287 const count
- SafeMigrationManager.test.ts 288~290 const result
- SafeMigrationManager.test.ts 291~307 const counter
- SafeMigrationManager.test.ts 308~321 const result
- SafeMigrationManager.test.ts 322~322 const beforeMigration
- SafeMigrationManager.test.ts 323~323 const result
- SafeMigrationManager.test.ts 324~330 const afterMigration

## 중앙화·모듈화·캡슐화
- 마이그레이션 테스트는 이 디렉터리에서 관리

## 작업 규칙
- 새 마이그레이션 추가 시 대응 테스트 작성
- 테스트 실행 후 데이터 상태를 검증

## 관련 문서
- src/lib/storage/migrations/claude.md
- src/lib/storage/core/claude.md
- supabase/migrations/claude.md
