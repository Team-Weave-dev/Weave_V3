# src/lib/storage/services - 도메인 서비스

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~38: 파일 라인 맵
- 39~41: 중앙화·모듈화·캡슐화
- 42~45: 작업 규칙
- 46~51: 관련 문서

## 디렉토리 목적
StorageManager 위에서 동작하는 도메인별 CRUD 서비스를 제공합니다.

## 핵심 책임
- BaseService 패턴으로 공통 로직 제공
- User·Project·Client 등 도메인 서비스 구현

## 구조 요약
- __tests__/: 서비스 테스트 (→ src/lib/storage/services/__tests__/claude.md)

## 파일 라인 맵
- ActivityLogService.ts 021~206 export ActivityLogService
- BaseService.ts 016~364 export BaseEntity - Base entity interface All entities must have these required fields
- CalendarService.ts 026~533 export CalendarService - Calendar service class Manages calendar events with recurring support
- ClientService.ts 017~457 export ClientService - Client service class Manages clients with contact and address information
- DashboardService.ts 20~41 export DashboardData - Dashboard data structure
- DashboardService.ts 042~239 export DashboardService - Dashboard service class Manages dashboard layout, widgets, and configuration
- DocumentService.ts 018~506 export DocumentService - Document service class Manages documents with project associations
- ProjectService.ts 030~838 export ProjectService - Project service class Manages projects with WBS, payment tracking, and document management
- SettingsService.ts 036~548 export SettingsService - Settings service class Manages user settings and preferences Settings is stored as a Record<userId, Settings> in localStorage
- TaskService.ts 018~747 export TaskService - Task service class Manages tasks with recurring support
- TaxScheduleService.ts 025~289 export TaxScheduleService - Tax Schedule Service **특징**: - Supabase 전용 (LocalStorage 사용하지 않음) - 읽기 전용 (사용자는 조회만 가능) - 모든 사용자가 동일한 데이터 공유
- TaxScheduleService.ts 290~290 export taxScheduleService - Export singleton instance
- TodoSectionService.ts 021~158 export TodoSectionService - TodoSectionService TodoSection 엔티티를 위한 도메인 서비스 - 사용자별 섹션 관리 - 정렬 순서 관리 - 섹션 CRUD 작업
- TodoSectionService.ts 159~164 export getTodoSectionService - TodoSectionService 싱글톤 인스턴스 가져오기 @param storage - StorageManager 인스턴스 @returns TodoSectionService 인스턴스
- UserService.ts 020~148 export UserService - User domain service Manages user profiles with DualWrite mode support (LocalStorage + Supabase). Provides type-safe operations for user data management.
- PlanService.ts 021~159 export PlanService - Plan service class **특징**: - Supabase 전용 (LocalStorage 사용하지 않음) - 읽기 전용 (요금제 정보는 시스템 관리) - 모든 사용자가 동일한 데이터 공유
- PlanService.ts 164~164 export planService - Export singleton instance

## 중앙화·모듈화·캡슐화
- 서비스명과 스토리지 키는 types·core 정의를 따름

## 작업 규칙
- 도메인 스키마 변경 시 서비스·타입·마이그레이션·문서를 동기화
- 성능 최적화 후 모니터링·테스트를 업데이트

## 관련 문서
- src/lib/storage/claude.md
- src/lib/storage/types/claude.md
- src/lib/storage/core/claude.md
- src/app/projects/claude.md
