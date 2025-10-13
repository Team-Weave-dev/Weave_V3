# src/contexts - 컨텍스트 상태

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~19: 핵심 책임
- 20~22: 구조 요약
- 23~27: 파일 라인 맵
- 28~30: 중앙화·모듈화·캡슐화
- 31~34: 작업 규칙
- 35~39: 관련 문서

## 디렉토리 목적
페이지 간 공유가 필요한 상태를 React Context로 제공합니다.
필수 범위에서만 컨텍스트를 노출해 성능을 최적화합니다.

## 핵심 책임
- CalendarFilterContext 등 공통 필터 상태 제공
- Provider와 커스텀 훅을 통해 안전한 접근 규칙 유지

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- CalendarFilterContext.tsx 48~82 export CalendarFilterProvider - CalendarFilterProvider 통합 캘린더 데이터와 필터 상태를 하위 컴포넌트들에게 제공합니다. @example ```tsx <CalendarFilterProvider options={{ autoRefresh: true }}> <CalendarView /> <FilterControls /> </CalendarFilterProvider> ```
- CalendarFilterContext.tsx 083~113 export useCalendarFilter - useCalendarFilter CalendarFilterContext를 사용하는 커스텀 훅 @throws {Error} Provider 외부에서 사용 시 에러 발생 @example ```tsx function CalendarView() { const { filteredItems, filters, setFilters } = useCalendarFilter(); return ( <div> {filteredItems.map(item => ( <CalendarItem key={item.id} item={item} /> ))} </div> ); } ```
- CalendarFilterContext.tsx 114~116 export useCalendarFilterOptional - Optional: useCalendarFilterOptional Provider 외부에서 사용해도 에러를 발생시키지 않는 버전 null을 반환하므로 optional chaining 사용 필요 @example ```tsx function OptionalCalendarComponent() { const calendar = useCalendarFilterOptional(); if (!calendar) { return <div>No calendar context available</div>; } return <div>{calendar.filteredItems.length} items</div>; } ```

## 중앙화·모듈화·캡슐화
- 컨텍스트 기본값과 라벨은 config 상수를 사용해 일관성을 확보

## 작업 규칙
- 새 컨텍스트는 타입·훅과 함께 정의하고 구조 요약을 갱신
- Provider 범위를 최소화하여 불필요한 렌더링을 방지

## 관련 문서
- src/claude.md
- src/hooks/claude.md
- src/lib/calendar-integration/claude.md
