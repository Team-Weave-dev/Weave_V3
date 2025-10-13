# src/lib/calendar-integration - 통합 캘린더 매니저

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~24: 구조 요약
- 25~35: 파일 라인 맵
- 36~38: 중앙화·모듈화·캡슐화
- 39~42: 작업 규칙
- 43~48: 관련 문서

## 디렉토리 목적
캘린더, 세무, 할 일 데이터를 통합 이벤트 스트림으로 관리합니다.
Storage 이벤트와 CustomEvent를 구독해 실시간 동기화를 제공합니다.

## 핵심 책임
- IntegratedCalendarManager로 캐시·인덱싱·구독 관리
- events 모듈을 통해 위젯 간 동기화 구현
- 어댑터와 데이터 소스를 통해 저장소 추상화

## 구조 요약
- adapters/: 도메인별 어댑터 (→ src/lib/calendar-integration/adapters/claude.md)
- data-sources/: 데이터 소스 정의 (→ src/lib/calendar-integration/data-sources/claude.md)

## 파일 라인 맵
- events.ts 09~33 export CalendarDataChangedDetail - 캘린더 데이터 변경 이벤트 타입
- events.ts 34~62 export CALENDAR_DATA_CHANGED - 캘린더 데이터 변경 이벤트 이름
- events.ts 63~79 export notifyCalendarDataChanged - 캘린더 데이터 변경 알림 발송 각 위젯에서 데이터가 변경될 때 호출하여 IntegratedCalendarManager에 변경사항을 알립니다. @param detail 변경 상세 정보 @example ```typescript // CalendarWidget에서 이벤트 추가 시 notifyCalendarDataChanged({ source: 'calendar', changeType: 'add', itemId: newEventId, timestamp: Date.now() }); // TodoListWidget에서 작업 삭제 시 notifyCalendarDataChanged({ source: 'todo', changeType: 'delete', itemId: deletedTaskId, timestamp: Date.now() }); ```
- events.ts 080~100 export CalendarDataChangedListener - 캘린더 데이터 변경 이벤트 리스너 타입
- events.ts 101~138 export addCalendarDataChangedListener - 캘린더 데이터 변경 이벤트 리스너 등록 @param listener 이벤트 리스너 함수 @returns 이벤트 리스너 해제 함수 @example ```typescript // IntegratedCalendarManager에서 사용 const unsubscribe = addCalendarDataChangedListener((event) => { console.log('Data changed:', event.detail); this.invalidateCache(); this.getAllItems(); }); // 정리 시 unsubscribe(); ```
- events.ts 139~160 export addStorageListener - localStorage 변경 이벤트 리스너 등록 다른 탭에서의 데이터 변경을 감지하기 위한 리스너입니다. @param storageKey 감지할 localStorage 키 @param callback 변경 감지 시 호출할 콜백 @returns 이벤트 리스너 해제 함수 @example ```typescript const unsubscribe = addStorageListener('weave_calendar_events', () => { console.log('Calendar events changed in another tab'); this.invalidateCache(); this.getAllItems(); }); ```
- IntegratedCalendarManager.ts 32~49 export IDataSource - 데이터 소스 인터페이스 LocalStorage, IndexedDB, API 등으로 확장 가능
- IntegratedCalendarManager.ts 050~566 export IntegratedCalendarManager - 통합 캘린더 관리자 모든 위젯(캘린더, 세무, 할일)의 데이터를 통합하여 관리하고, 필터링, 검색, 구독 기능을 제공합니다. Phase 4 성능 최적화: 인덱싱 시스템으로 O(1) 조회 지원
- IntegratedCalendarManager.ts 567~567 export integratedCalendarManager - 싱글톤 인스턴스 LocalStorageDataSource와 연결되어 실제 위젯 데이터를 읽음

## 중앙화·모듈화·캡슐화
- 이벤트 키와 스토리지 키는 상수로 관리하여 위젯과 일관성 유지

## 작업 규칙
- 새 데이터 소스를 추가하면 어댑터와 문서를 함께 작성
- 캐시 정책을 수정하면 영향 범위를 정리하고 테스트를 실행

## 관련 문서
- src/lib/claude.md
- src/components/ui/widgets/calendar/claude.md
- src/app/dashboard/claude.md
- src/lib/storage/claude.md
