# src/components/ui/widgets/calendar/components - 캘린더 UI 컴포넌트

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~37: 파일 라인 맵
- 38~40: 중앙화·모듈화·캡슐화
- 41~44: 작업 규칙
- 45~49: 관련 문서

## 디렉토리 목적
이벤트 카드, 디테일 모달, 설정 모달 등 위젯 구성 요소를 제공합니다.

## 핵심 책임
- MiniEvent, EventDetailModal, EventForm, CalendarSettingsModal 관리
- 접근성과 반응형 레이아웃 유지

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- CalendarSettings.tsx 38~45 const CalendarSettingsModal - CalendarSettings Component 캘린더 설정을 관리하는 모달
- CalendarSettings.tsx 46~51 const handleSave
- CalendarSettings.tsx 052~315 const handleReset
- EventDetailModal.tsx 31~43 const iconMap
- EventDetailModal.tsx 44~54 const EventDetailModal - EventDetailModal Component 이벤트의 상세 정보를 표시하는 모달
- EventDetailModal.tsx 55~55 const config
- EventDetailModal.tsx 056~183 const Icon
- EventForm.tsx 32~78 const EventForm - EventForm Component 이벤트 추가/편집을 위한 폼 컴포넌트
- EventForm.tsx 79~98 const handleSubmit
- EventForm.tsx 099~105 const handleKeyDown - 엔터키로 저장하는 핸들러
- EventForm.tsx 106~266 const handleReset
- FullScreenCalendarModal.tsx 070~648 export FullScreenCalendarModal - FullScreenCalendarModal Component 전체 화면 캘린더 모달
- MiniEvent.tsx 12~17 const MiniEvent - MiniEvent Component 캘린더 내에서 이벤트를 표시하는 컴팩트한 컴포넌트 Google Calendar 스타일의 반응형 디자인
- MiniEvent.tsx 018~106 const config

## 중앙화·모듈화·캡슐화
- 텍스트와 포맷은 brand 설정을 사용

## 작업 규칙
- 컴포넌트 추가·삭제 시 뷰와 훅 문서를 업데이트
- 모달 접근성(포커스 트랩, ESC 처리)을 검증

## 관련 문서
- src/components/ui/widgets/calendar/claude.md
- src/components/ui/widgets/calendar/views/claude.md
- src/components/ui/widgets/calendar/hooks/claude.md
