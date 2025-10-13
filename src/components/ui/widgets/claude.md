# src/components/ui/widgets - 위젯 컬렉션

## 라인 가이드
- 012~015: 디렉토리 목적
- 016~020: 핵심 책임
- 021~024: 구조 요약
- 025~096: 파일 라인 맵
- 097~099: 중앙화·모듈화·캡슐화
- 100~103: 작업 규칙
- 104~109: 관련 문서

## 디렉토리 목적
대시보드와 페이지에서 사용하는 복합 위젯을 모듈 단위로 제공합니다.
캘린더, 투두 등 데이터 집약형 UI를 캡슐화합니다.

## 핵심 책임
- 캘린더 위젯 구성 요소 관리
- 투두 리스트 위젯 모듈화
- 공통 위젯 패턴 공유

## 구조 요약
- calendar/: 캘린더 위젯 (→ src/components/ui/widgets/calendar/claude.md)
- todo-list/: 할 일 위젯 (→ src/components/ui/widgets/todo-list/claude.md)

## 파일 라인 맵
- CalendarWidget.tsx 072~898 export CalendarWidget - CalendarWidget Component - Refactored Version 리팩토링된 캘린더 위젯 - 컴포넌트 분리 및 성능 최적화
- index.ts 09~23 export default export
- KPIWidget.tsx 099~317 export KPIWidget
- ProjectSummaryWidget.tsx 034~338 export ProjectSummaryWidget
- RecentActivityWidget.tsx 096~291 export RecentActivityWidget
- RevenueChartWidget.tsx 085~358 export RevenueChartWidget
- TaxCalculatorWidget.tsx 42~52 class TaxCalculator - 세금 계산기 클래스
- TaxCalculatorWidget.tsx 53~53 let taxRate
- TaxCalculatorWidget.tsx 54~54 let taxAmount
- TaxCalculatorWidget.tsx 55~55 let totalAmount
- TaxCalculatorWidget.tsx 056~101 let netAmount
- TaxCalculatorWidget.tsx 102~102 let taxRate
- TaxCalculatorWidget.tsx 103~103 let supplyAmount
- TaxCalculatorWidget.tsx 104~104 let taxAmount
- TaxCalculatorWidget.tsx 105~136 let netAmount
- TaxCalculatorWidget.tsx 137~169 const inputAmountValue - 원천세의 경우 입력값이 실수령액이므로 inputAmount 조정
- TaxCalculatorWidget.tsx 170~181 const displayTitle
- TaxCalculatorWidget.tsx 182~184 const resultRef - 결과 섹션 ref
- TaxCalculatorWidget.tsx 185~197 const getTaxIcon - 세금 타입별 아이콘 매핑
- TaxCalculatorWidget.tsx 198~211 const getTaxTypeLabel - 세금 타입별 라벨
- TaxCalculatorWidget.tsx 212~218 const getModeLabel - 계산 모드 라벨
- TaxCalculatorWidget.tsx 219~219 const handleCalculate - 계산 실행
- TaxCalculatorWidget.tsx 220~258 const amount
- TaxCalculatorWidget.tsx 259~264 const handleReset - 초기화
- TaxCalculatorWidget.tsx 265~267 const handleCopyResult - 결과 복사
- TaxCalculatorWidget.tsx 268~285 const text
- TaxCalculatorWidget.tsx 286~294 const handleClearHistory - 히스토리 삭제
- TaxCalculatorWidget.tsx 295~570 const handleKeyPress - Enter 키로 계산
- TaxDeadlineWidget.tsx 40~42 function convertTaxScheduleToDeadline - TaxSchedule (Supabase) → TaxDeadline (위젯) 변환 함수
- TaxDeadlineWidget.tsx 43~43 const dateField - Supabase는 tax_date (스네이크 케이스) 사용 TypeScript 타입은 taxDate (카멜 케이스) 사용
- TaxDeadlineWidget.tsx 44~44 const taxDate
- TaxDeadlineWidget.tsx 45~45 const deadlineDay
- TaxDeadlineWidget.tsx 46~60 const deadlineMonth
- TaxDeadlineWidget.tsx 61~64 const category
- TaxDeadlineWidget.tsx 65~65 const frequency - Supabase의 모든 일정은 매년 반복이지만, 특정 월에 고정됨 deadlineMonth가 있으면 yearly (특정 월 고정), 없으면 monthly (매월 반복)
- TaxDeadlineWidget.tsx 066~190 const importance
- TaxDeadlineWidget.tsx 191~208 const getCategoryIcon - 카테고리별 아이콘 매핑
- TaxDeadlineWidget.tsx 209~226 const getCategoryVariant - 카테고리별 Badge variant 매핑
- TaxDeadlineWidget.tsx 227~227 const getCategoryLabel - 카테고리 라벨 매핑
- TaxDeadlineWidget.tsx 228~241 const labels
- TaxDeadlineWidget.tsx 242~257 const getImportanceColor - 중요도별 색상 매핑 - 중앙화된 Badge variants 사용
- TaxDeadlineWidget.tsx 258~258 const calculateDday - D-day 계산 함수
- TaxDeadlineWidget.tsx 259~259 const now
- TaxDeadlineWidget.tsx 260~260 const currentYear
- TaxDeadlineWidget.tsx 261~261 const currentMonth
- TaxDeadlineWidget.tsx 262~263 const currentDay
- TaxDeadlineWidget.tsx 264~264 let targetMonth
- TaxDeadlineWidget.tsx 265~283 let targetYear
- TaxDeadlineWidget.tsx 284~284 const deadline
- TaxDeadlineWidget.tsx 285~285 const diffTime
- TaxDeadlineWidget.tsx 286~303 const diffDays
- TaxDeadlineWidget.tsx 304~311 const displayTitle
- TaxDeadlineWidget.tsx 312~319 const handleViewModeChange - 뷰 모드 핸들러
- TaxDeadlineWidget.tsx 320~326 const month
- TaxDeadlineWidget.tsx 327~327 const toggleItemExpanded - 항목 확장/축소 토글
- TaxDeadlineWidget.tsx 328~337 const newExpanded
- TaxDeadlineWidget.tsx 338~342 const convertedDeadlines - Supabase schedules → 위젯 deadlines 변환
- TaxDeadlineWidget.tsx 343~343 const getNext3MonthsDeadlines - 오늘부터 3개월 후까지의 일정 가져오기
- TaxDeadlineWidget.tsx 344~344 const today
- TaxDeadlineWidget.tsx 345~348 const threeMonthsLater
- TaxDeadlineWidget.tsx 349~349 const dday
- TaxDeadlineWidget.tsx 350~364 const deadlineDate
- TaxDeadlineWidget.tsx 365~365 const filteredDeadlines - 필터링된 세무 일정
- TaxDeadlineWidget.tsx 366~391 let filtered
- TaxDeadlineWidget.tsx 392~491 const monthFilter - 특정 월 필터
- TaxDeadlineWidget.tsx 492~492 const isUrgent
- TaxDeadlineWidget.tsx 493~493 const isHighlighted
- TaxDeadlineWidget.tsx 494~618 const isExpanded
- TodoListWidget.tsx 062~806 export TodoListWidget
- WeatherWidget.tsx 110~633 export WeatherWidget

## 중앙화·모듈화·캡슐화
- 위젯 라벨, 날짜 포맷, 상태 텍스트는 brand 설정과 상수를 사용

## 작업 규칙
- 새 위젯 추가 시 하위 claude.md를 작성하고 구조를 기록
- 데이터 소스 변경 시 관련 서비스 문서를 동기화

## 관련 문서
- src/components/ui/claude.md
- src/app/dashboard/claude.md
- src/lib/calendar-integration/claude.md
- src/lib/storage/claude.md
