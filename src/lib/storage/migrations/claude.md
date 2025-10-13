# src/lib/storage/migrations - 스토리지 마이그레이션

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~30: 파일 라인 맵
- 31~33: 중앙화·모듈화·캡슐화
- 34~37: 작업 규칙
- 38~42: 관련 문서

## 디렉토리 목적
StorageManager 버전 업그레이드와 Supabase 이전을 위한 마이그레이션 로직을 제공합니다.

## 핵심 책임
- MigrationManager로 실행 순서를 관리
- SafeMigrationManager로 롤백과 백업 수행

## 구조 요약
- __tests__/: 마이그레이션 테스트 (→ src/lib/storage/migrations/__tests__/claude.md)

## 파일 라인 맵
- MigrationManager.ts 020~471 export MigrationManager
- SafeMigrationManager.ts 24~36 export SafeMigrationResult - Result of a safe migration operation
- SafeMigrationManager.ts 037~179 export SafeMigrationManager
- v1-to-v2.ts 069~368 export v1ToV2Migration - Migration from V1 to V2
- v2-to-supabase.ts 22~26 export MigrationProgressCallback - Migration progress callback
- v2-to-supabase.ts 27~44 export MigrationProgress - Migration progress information
- v2-to-supabase.ts 045~334 export MigrationResult - Migration result

## 중앙화·모듈화·캡슐화
- 버전 번호와 마이그레이션 매핑은 migrations에서만 정의

## 작업 규칙
- 새 마이그레이션 추가 시 버전과 등록 정보를 업데이트
- Supabase 스키마 변경 시 v2-to-supabase와 SQL 마이그레이션을 동기화

## 관련 문서
- src/lib/storage/claude.md
- supabase/migrations/claude.md
- src/lib/storage/types/claude.md
