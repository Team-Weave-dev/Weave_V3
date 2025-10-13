# src/lib/storage/adapters - 스토리지 어댑터

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~34: 파일 라인 맵
- 35~37: 중앙화·모듈화·캡슐화
- 38~41: 작업 규칙
- 42~47: 관련 문서

## 디렉토리 목적
StorageManager가 다양한 저장소를 사용할 수 있도록 추상화합니다.

## 핵심 책임
- LocalStorageAdapter로 브라우저 CRUD 지원
- 향후 Supabase 등 확장 지점 마련

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- LocalStorageAdapter.ts 20~34 export LocalStorageConfig - Configuration options for LocalStorageAdapter
- LocalStorageAdapter.ts 035~359 export LocalStorageAdapter - LocalStorage adapter implementing the StorageAdapter interface Provides a type-safe, async-compatible wrapper around browser's localStorage. Handles JSON serialization, key prefixing, and error management.
- OfflineQueue.ts 47~51 export QueueOperationType - 큐에 저장되는 작업 타입
- OfflineQueue.ts 52~73 export QueueOperation - 큐 작업 인터페이스
- OfflineQueue.ts 74~90 export OfflineQueueConfig - OfflineQueue 설정
- OfflineQueue.ts 091~417 export OfflineQueue - ========================================================= OfflineQueue 클래스 =========================================================
- RealtimeAdapter.ts 54~71 export ConnectionStatus - 연결 상태
- RealtimeAdapter.ts 72~88 export RealtimeAdapterConfig - RealtimeAdapter 설정
- RealtimeAdapter.ts 089~464 export RealtimeAdapter - ========================================================= RealtimeAdapter 클래스 =========================================================
- SupabaseAdapter.ts 20~60 export SupabaseAdapterConfig - Configuration options for SupabaseAdapter
- SupabaseAdapter.ts 0061~1540 export SupabaseAdapter - Supabase adapter implementing the StorageAdapter interface Provides integration with Supabase database with user-scoped data isolation, RLS policy support, and type-safe CRUD operations.

## 중앙화·모듈화·캡슐화
- 스토리지 키와 버전은 core와 types 정의를 사용

## 작업 규칙
- 새 어댑터 추가 시 인터페이스 구현·테스트·문서를 작성
- 스토리지 API 변경 시 어댑터와 코어를 동기화

## 관련 문서
- src/lib/storage/claude.md
- src/lib/storage/core/claude.md
- src/lib/storage/services/claude.md
- src/lib/supabase/claude.md
