# src/components/ui/widgets/calendar/views - 캘린더 뷰

## 라인 가이드
- 012~014: 디렉토리 목적
- 015~018: 핵심 책임
- 019~021: 구조 요약
- 022~099: 파일 라인 맵
- 100~102: 중앙화·모듈화·캡슐화
- 103~106: 작업 규칙
- 107~111: 관련 문서

## 디렉토리 목적
월, 주, 일, Agenda 보기 등 캘린더 뷰 컴포넌트를 제공합니다.

## 핵심 책임
- 날짜 범위 계산과 이벤트 그룹화
- 스크롤 동기화 및 접근성 고려

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- AgendaView.tsx 21~39 const iconMap
- AgendaView.tsx 40~45 const AgendaView - AgendaView Component 일정 목록 뷰 - 날짜별로 그룹화된 이벤트 목록
- AgendaView.tsx 46~47 const parseEventDate - 안전한 날짜 파싱 헬퍼
- AgendaView.tsx 48~61 const parsed
- AgendaView.tsx 62~62 const validEvents - 유효한 이벤트만 필터링
- AgendaView.tsx 63~67 const parsedDate
- AgendaView.tsx 68~68 const groupedEvents - 날짜별로 이벤트 그룹핑
- AgendaView.tsx 69~69 const parsedDate
- AgendaView.tsx 70~78 const dateKey
- AgendaView.tsx 79~89 const sortedDates - 날짜 정렬
- AgendaView.tsx 90~90 const date
- AgendaView.tsx 091~104 const dateEvents
- AgendaView.tsx 105~105 const config
- AgendaView.tsx 106~149 const Icon
- DayView.tsx 15~21 const DayView - DayView Component 일간 캘린더 뷰 - 하루 일정을 시간대별로 표시
- DayView.tsx 22~22 const hours
- DayView.tsx 23~27 const dayEvents
- DayView.tsx 28~28 const allDayEvents - 종일 이벤트 필터링
- DayView.tsx 29~31 const hasAllDayEvents
- DayView.tsx 32~32 const headerHeight - 동적 높이 계산 (종일 이벤트 영역 포함)
- DayView.tsx 33~33 const allDayHeight
- DayView.tsx 34~34 const totalHeaderHeight
- DayView.tsx 35~70 const scrollAreaHeight
- DayView.tsx 71~73 const hourEvents
- DayView.tsx 074~106 const eventHour
- MonthView.tsx 34~48 const MonthView - MonthView Component 월간 캘린더 뷰 - Google Calendar 스타일
- MonthView.tsx 49~49 const monthStart
- MonthView.tsx 50~50 const monthEnd
- MonthView.tsx 51~51 const calendarStart
- MonthView.tsx 52~52 const calendarEnd
- MonthView.tsx 53~58 const calendarDays
- MonthView.tsx 59~61 const effectiveGridSize - 그리드 크기가 없으면 기본값 사용
- MonthView.tsx 62~62 const allWeekDays - 요일 배열 (주 시작일에 따라 동적 생성)
- MonthView.tsx 63~67 const weekDays
- MonthView.tsx 68~73 const weeks - 주 단위로 날짜 그룹핑
- MonthView.tsx 74~74 const headerHeight - 동적 높이 계산 - 반응형 (더 정밀한 계산)
- MonthView.tsx 75~75 const weekCount
- MonthView.tsx 76~76 const borderHeight
- MonthView.tsx 77~77 const availableHeight
- MonthView.tsx 78~80 const cellHeight
- MonthView.tsx 81~82 const getDisplayMode - 개선된 반응형 표시 모드 결정 - 점 모드 제거, 최소 2열 지원
- MonthView.tsx 83~83 const actualWidth - 1. 컨테이너 실제 너비 기반 우선 판단
- MonthView.tsx 084~118 const estimatedCellWidth
- MonthView.tsx 119~147 const displayMode
- MonthView.tsx 148~157 const weekNumber - 주 번호 계산 (첫 번째 날짜 기준)
- MonthView.tsx 158~160 const dayEvents
- MonthView.tsx 161~161 const isSelected
- MonthView.tsx 162~162 const isCurrentMonth
- MonthView.tsx 163~165 const dayOfWeek
- MonthView.tsx 166~170 const maxEventsToShow - 높이에 따른 최대 표시 이벤트 수 및 표시 방법 조정
- MonthView.tsx 171~194 const droppableId
- MonthView.tsx 195~201 const types - dataTransfer에서 타입 확인
- MonthView.tsx 202~202 const rect - 자식 요소로 이동하는 경우 무시
- MonthView.tsx 203~203 const x
- MonthView.tsx 204~220 const y
- MonthView.tsx 221~222 const dataJson
- MonthView.tsx 223~226 const data
- MonthView.tsx 227~227 const todoTask
- MonthView.tsx 228~267 const targetDate
- MonthView.tsx 268~273 const isIntegrated - Check if event is from integrated calendar 투두와 캘린더 이벤트는 드래그 가능, 세금만 드래그 불가
- MonthView.tsx 274~284 const isDragDisabled - 세금 이벤트만 드래그 비활성화
- MonthView.tsx 285~341 const draggableStyle - 드래그 중일 때와 아닐 때의 스타일을 분리하여 애니메이션 개선
- WeekView.tsx 22~30 const WeekView - WeekView Component 주간 캘린더 뷰 - 시간대별 그리드 표시
- WeekView.tsx 31~31 const weekStart
- WeekView.tsx 32~32 const weekEnd
- WeekView.tsx 33~35 const weekDays
- WeekView.tsx 36~38 const hours - 시간대 생성 (0시 ~ 23시)
- WeekView.tsx 39~39 const headerHeight - 동적 높이 계산
- WeekView.tsx 40~42 const scrollAreaHeight
- WeekView.tsx 43~43 const allDayEvents - 종일 이벤트 필터링
- WeekView.tsx 44~46 const hasAllDayEvents
- WeekView.tsx 47~47 const adjustedHeaderHeight - 종일 이벤트가 있을 경우 헤더 높이 조정
- WeekView.tsx 48~83 const adjustedScrollHeight
- WeekView.tsx 084~118 const dayAllDayEvents
- WeekView.tsx 119~122 const dayEvents
- WeekView.tsx 123~154 const eventHour

## 중앙화·모듈화·캡슐화
- 날짜 포맷과 라벨은 config와 brand 텍스트를 사용

## 작업 규칙
- 뷰 추가·삭제 시 상위 문서와 훅·서비스를 업데이트
- 성능 문제가 발생하면 가상 스크롤 등 최적화를 검토

## 관련 문서
- src/components/ui/widgets/calendar/claude.md
- src/components/ui/widgets/calendar/hooks/claude.md
- src/lib/calendar-integration/claude.md
