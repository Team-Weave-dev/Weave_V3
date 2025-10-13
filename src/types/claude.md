# src/types - 전역 타입

## 라인 가이드
- 012~015: 디렉토리 목적
- 016~019: 핵심 책임
- 020~022: 구조 요약
- 023~100: 파일 라인 맵
- 101~103: 중앙화·모듈화·캡슐화
- 104~107: 작업 규칙
- 108~112: 관련 문서

## 디렉토리 목적
애플리케이션 전반에서 공유하는 TypeScript 타입을 관리합니다.
도메인 엔티티와 공용 유틸 타입을 중앙에서 유지합니다.

## 핵심 책임
- 프로젝트·클라이언트 등 도메인 엔티티 정의
- 서비스와 UI 간 계약을 타입으로 보장

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- ai-assistant.ts 04~19 export APIResponse - 기본 응답 타입
- ai-assistant.ts 20~27 export TokenUsage - 토큰 사용량
- ai-assistant.ts 28~38 export FileInfo - 파일 정보
- ai-assistant.ts 39~48 export DocumentType - 문서 타입
- ai-assistant.ts 49~58 export ExtractedData - 추출된 데이터
- ai-assistant.ts 59~78 export ExtractedFields - 추출된 필드
- ai-assistant.ts 79~88 export BusinessEntity - 사업자 엔티티
- ai-assistant.ts 89~97 export ExtractedItem - 추출된 아이템
- ai-assistant.ts 098~106 export ExtractedMetadata - 추출 메타데이터
- business.ts 06~20 export Project - 프로젝트 관련 타입
- business.ts 21~34 export Client - 클라이언트 관련 타입
- business.ts 35~53 export Invoice - 인보이스 관련 타입
- business.ts 54~65 export InvoiceItem - 인보이스 항목 타입
- business.ts 66~78 export Payment - 결제 관련 타입
- business.ts 79~93 export Task - 태스크 관련 타입
- business.ts 094~108 export Document - 문서 관련 타입
- business.ts 109~119 export User - 사용자 관련 타입
- business.ts 120~132 export Reminder - 리마인더 관련 타입
- dashboard.ts 03~13 export WidgetPosition - Dashboard Widget Types
- dashboard.ts 14~18 export WidgetSize
- dashboard.ts 19~29 export Widget
- dashboard.ts 30~39 export DashboardLayout
- dashboard.ts 40~47 export StatsData
- dashboard.ts 48~57 export ChartData
- dashboard.ts 58~66 export QuickAction
- dashboard.ts 67~94 export ProjectReview - 프로젝트 요약 위젯 인터페이스
- dashboard.ts 095~102 export ProjectSummaryWidgetProps
- dashboard.ts 103~104 export TodoPriority - TodoList 위젯 인터페이스
- dashboard.ts 105~113 export TodoSection
- dashboard.ts 114~129 export TodoTask
- dashboard.ts 130~139 export TodoListWidgetProps
- dashboard.ts 140~154 export CalendarEvent - Calendar 위젯 인터페이스
- dashboard.ts 155~169 export CalendarWidgetProps
- dashboard.ts 170~179 export TaxCategory - 세무 일정 위젯 인터페이스
- dashboard.ts 180~186 export TaxStatus
- dashboard.ts 187~205 export TaxDeadline
- dashboard.ts 206~220 export TaxDeadlineWidgetProps
- dashboard.ts 221~227 export TaxType - 세금 계산기 위젯 타입
- dashboard.ts 228~232 export CalculationMode
- dashboard.ts 233~259 export TaxCalculation
- dashboard.ts 260~271 export TaxCalculatorWidgetProps
- dashboard.ts 272~273 export ActivityType - 최근 활동 위젯 인터페이스
- dashboard.ts 274~280 export ActivityUser
- dashboard.ts 281~291 export ActivityItem
- dashboard.ts 292~304 export RecentActivityWidgetProps
- dashboard.ts 305~314 export WeatherCondition - 날씨 위젯 인터페이스
- dashboard.ts 315~339 export WeatherData
- dashboard.ts 340~356 export WeatherWidgetProps
- document-workflow.ts 03~10 export User - 문서 생성 워크플로우 타입 정의
- document-workflow.ts 11~22 export Client
- document-workflow.ts 23~34 export Project
- document-workflow.ts 35~43 export DocumentType
- document-workflow.ts 44~51 export WorkflowStep
- document-workflow.ts 52~62 export DocumentWorkflow
- document-workflow.ts 063~114 export DOCUMENT_TYPES - 문서 종류 정의
- document-workflow.ts 115~125 export INDUSTRY_CATEGORIES - 산업 분야별 카테고리
- improved-dashboard.ts 11~51 export ImprovedWidget - 개선된 위젯 인터페이스
- improved-dashboard.ts 52~72 export DashboardLayout - 대시보드 레이아웃
- improved-dashboard.ts 73~94 export DashboardEditState - 대시보드 편집 상태
- improved-dashboard.ts 095~110 export WidgetCallbacks - 위젯 이벤트 콜백
- improved-dashboard.ts 111~145 export DashboardConfig - 대시보드 설정
- improved-dashboard.ts 146~172 export ResponsiveLayout - 반응형 레이아웃 설정
- improved-dashboard.ts 173~188 export WidgetTemplate - 위젯 템플릿
- improved-dashboard.ts 189~205 export DashboardTheme - 대시보드 테마
- integrated-calendar.ts 10~14 export CalendarItemSource - 통합 캘린더 아이템의 데이터 출처
- integrated-calendar.ts 15~19 export CalendarItemType - 통합 캘린더 아이템의 유형
- integrated-calendar.ts 20~24 export Priority - 우선순위 단계
- integrated-calendar.ts 25~31 export ItemStatus - 아이템 상태
- integrated-calendar.ts 32~68 export UnifiedCalendarItem - 통합 캘린더 아이템 인터페이스 캘린더, 세무일정, 할일 위젯의 데이터를 하나의 표준 형식으로 통합
- integrated-calendar.ts 69~76 export DateRange - 날짜 범위 필터
- integrated-calendar.ts 77~92 export CalendarFilters - 통합 캘린더 필터 옵션
- integrated-calendar.ts 093~113 export IDataAdapter - 데이터 어댑터 인터페이스 각 위젯의 데이터를 UnifiedCalendarItem으로 변환
- integrated-calendar.ts 114~122 export SOURCE_COLORS - 소스별 색상 설정
- integrated-calendar.ts 123~131 export SOURCE_ICONS - 소스별 아이콘 설정
- integrated-calendar.ts 132~141 export PRIORITY_COLORS - 우선순위별 색상 설정
- integrated-calendar.ts 142~147 export STATUS_COLORS - 상태별 색상 설정

## 중앙화·모듈화·캡슐화
- 엔티티 스키마는 src/types에서 시작하며 다른 파일에서 재정의하지 않음

## 작업 규칙
- 타입 변경 시 storage·Supabase·UI 문서를 동시에 검토
- PascalCase 네이밍과 명확한 접두사를 유지

## 관련 문서
- src/claude.md
- src/lib/storage/types/claude.md
- supabase/migrations/claude.md
