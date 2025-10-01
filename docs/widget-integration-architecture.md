# 위젯 데이터 통합 아키텍처 설계

## 📋 개요

캘린더, 세무일정, 할일 위젯의 데이터를 통합하여 하나의 캘린더 뷰에서 모든 정보를 확인할 수 있는 시스템 설계입니다. 현재는 로컬 스토리지 기반으로 구현하되, 향후 DB 연동을 위한 확장 가능한 구조로 설계되었습니다.

## 🎯 설계 목표

1. **통합된 일정 관리**: 모든 일정/할일/세무 정보를 한 곳에서 확인
2. **유연한 필터링**: 소스별, 우선순위별, 상태별 필터링 지원
3. **성능 최적화**: 대량 데이터도 빠르게 처리
4. **확장 가능한 구조**: 새로운 위젯 쉽게 추가 가능
5. **데이터 일관성**: 중앙화된 동기화 메커니즘
6. **DB 마이그레이션 준비**: 최소한의 코드 변경으로 DB 연동 가능

## 🏗️ 시스템 아키텍처

### 1. 레이어 구조

```
┌─────────────────────────────────────────────────────┐
│                    UI Layer                         │
│         (CalendarWidget, IntegratedView)            │
└─────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────┐
│                 Service Layer                       │
│         (IntegratedCalendarService)                 │
└─────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────┐
│               Repository Layer                      │
│   (CalendarRepo, TaxRepo, TodoRepo)                │
└─────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────┐
│               Data Source Layer                     │
│   (LocalStorage → IndexedDB → REST API)            │
└─────────────────────────────────────────────────────┘
```

### 2. 데이터 플로우

```
User Action → UI Component → Service → Repository → DataSource
                ↓                           ↓
           State Update ← Notification ← Cache Update
```

## 📊 핵심 데이터 모델

### UnifiedCalendarItem

통합 캘린더 아이템의 표준 인터페이스:

```typescript
interface UnifiedCalendarItem {
  id: string;                    // 고유 식별자 (source-originalId)
  source: 'calendar' | 'tax' | 'todo';  // 데이터 출처
  type: 'event' | 'deadline' | 'task';  // 아이템 유형
  
  // 공통 필드
  title: string;                 // 제목
  date: Date;                    // 날짜
  description?: string;          // 설명
  
  // 시간 정보
  startTime?: string;            // 시작 시간 (HH:mm)
  endTime?: string;              // 종료 시간 (HH:mm)
  allDay: boolean;               // 종일 여부
  
  // 중요도/우선순위
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // 상태
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  
  // 카테고리
  category?: string;             // 카테고리/섹션
  tags?: string[];               // 태그 목록
  
  // 원본 데이터 참조
  originalData: CalendarEvent | TaxDeadline | TodoTask;
  
  // 시각화 속성
  color: string;                 // 표시 색상
  icon?: string;                 // 아이콘 이름
}
```

## 🔄 데이터 변환 어댑터

### Adapter Pattern 구현

각 위젯의 데이터를 통합 형식으로 변환하는 어댑터:

#### CalendarDataAdapter
- CalendarEvent → UnifiedCalendarItem
- 시간 정보 및 반복 일정 처리
- 카테고리 및 위치 정보 매핑

#### TaxDataAdapter
- TaxDeadline → UnifiedCalendarItem
- D-day 계산 및 중요도 매핑
- 세무 카테고리별 색상 지정
- 월별/분기별/연간 반복 처리

#### TodoDataAdapter
- TodoTask → UnifiedCalendarItem
- 우선순위 매핑 (p1→critical, p2→high, etc.)
- 섹션 정보를 카테고리로 변환
- 하위 작업 처리 로직

## 📦 Repository Pattern

### 추상화된 데이터 접근 계층

```typescript
interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findByDateRange(start: Date, end: Date): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  subscribe(callback: (data: T[]) => void): () => void;
}
```

### 구현 전략

1. **캐싱 메커니즘**: 빈번한 조회를 위한 메모리 캐시
2. **구독/발행 패턴**: 실시간 데이터 업데이트
3. **배치 업데이트**: 성능 최적화를 위한 일괄 처리
4. **충돌 해결**: 동시 수정 시 처리 전략

## 🔌 데이터 소스 전략

### 점진적 마이그레이션 경로

#### Phase 1: LocalStorage (현재)
```typescript
{
  type: 'localStorage',
  syncInterval: 0  // 실시간 동기화
}
```

#### Phase 2: IndexedDB (중간 단계)
```typescript
{
  type: 'indexedDB',
  dbName: 'WeaveCalendar',
  version: 1
}
```

#### Phase 3: Hybrid (오프라인 우선)
```typescript
{
  type: 'hybrid',
  local: 'indexedDB',
  remote: 'api',
  syncStrategy: 'offline-first'
}
```

#### Phase 4: REST API (최종)
```typescript
{
  type: 'api',
  baseUrl: 'https://api.example.com',
  auth: 'bearer',
  realtime: true
}
```

## 🎨 UI 통합 전략

### 캘린더 뷰 렌더링

#### 월별 뷰
- 날짜별 아이템 그룹핑
- 최대 3개 표시 + "더보기"
- 소스별 색상 코딩

#### 주별 뷰
- 시간대별 배치
- 중복 시간 처리
- 드래그 앤 드롭 지원

#### 일별 뷰
- 상세 시간 표시
- 종일 일정 별도 영역
- 실시간 업데이트

#### 아젠다 뷰
- 리스트 형태 표시
- 필터링 및 검색
- 무한 스크롤

### 시각적 구분

```typescript
const sourceStyles = {
  calendar: {
    color: '#3b82f6',  // blue
    icon: 'calendar',
    border: 'border-l-2 border-blue-500'
  },
  tax: {
    color: '#ef4444',  // red
    icon: 'receipt',
    border: 'border-l-2 border-red-500'
  },
  todo: {
    color: '#10b981',  // green
    icon: 'check-circle',
    border: 'border-l-2 border-green-500'
  }
};
```

## ⚡ 성능 최적화

### 1. 메모이제이션
- 데이터 변환 결과 캐싱
- 컴포넌트 렌더링 최적화
- 계산 비용이 높은 함수 캐싱

### 2. 인덱싱
- 날짜별 인덱스: O(1) 조회
- 카테고리별 인덱스: 빠른 필터링
- 우선순위별 인덱스: 정렬 최적화

### 3. 가상 스크롤
- 대량 데이터 렌더링 최적화
- 뷰포트 기반 렌더링
- 동적 높이 계산

### 4. 배치 업데이트
- 16ms (60fps) 간격 업데이트
- 여러 변경사항 일괄 처리
- DOM 조작 최소화

## 🔄 동기화 메커니즘

### 실시간 위젯 간 동기화

위젯 간 실시간 데이터 동기화는 CustomEvent를 통해 구현됩니다.

#### 이벤트 발송 (notifyCalendarDataChanged)

데이터 변경 시 모든 위젯에 알림:

```typescript
// TodoListWidget에서 작업 삭제 시
notifyCalendarDataChanged({
  source: 'todo',
  changeType: 'delete',
  itemId: taskId,
  timestamp: Date.now()
});

// CalendarWidget에서 이벤트 삭제 시
notifyCalendarDataChanged({
  source: 'calendar',
  changeType: 'delete',
  itemId: eventId,
  timestamp: Date.now()
});
```

#### 이벤트 수신 (IntegratedCalendarManager)

`IntegratedCalendarManager`가 이벤트를 수신하여 캐시 무효화 및 재로드:

```typescript
private setupEventListeners(): void {
  addCalendarDataChangedListener((event) => {
    this.invalidateCache();
    const updatedItems = await this.getAllItems();
    this.notifySubscribers(updatedItems);
  });
}
```

### 양방향 삭제 동기화

#### 캘린더 → 투두리스트 삭제

1. **CalendarWidget**: 통합 아이템 삭제 요청
   ```typescript
   await integratedCalendarManager.deleteItem(event.id); // event.id = "todo-abc123"
   ```

2. **IntegratedCalendarManager**: 소스 감지 및 라우팅
   ```typescript
   if (itemId.startsWith('todo-')) {
     await this.dataSource.deleteTodoTask(itemId);
   }
   ```

3. **LocalStorageDataSource**: localStorage 삭제 + 이벤트 발송
   ```typescript
   async deleteTodoTask(taskId: string): Promise<void> {
     // 'todo-' 접두사 제거
     const actualTaskId = taskId.replace('todo-', '');

     // localStorage에서 삭제
     const todoData = localStorage.getItem('weave_dashboard_todo_sections');
     // ... 삭제 로직 ...

     // 다른 위젯들에게 알림
     notifyCalendarDataChanged({
       source: 'todo',
       changeType: 'delete',
       itemId: actualTaskId,
       timestamp: Date.now()
     });
   }
   ```

4. **TodoListWidget**: CustomEvent 수신 → 자동 새로고침
   - `IntegratedCalendarManager`가 이벤트를 받아 캐시 무효화
   - `useIntegratedCalendar` 훅이 구독자들에게 업데이트 전파
   - TodoListWidget의 UI가 자동으로 업데이트됨

#### 투두리스트 → 캘린더 삭제

1. **TodoListWidget**: 작업 삭제 + 이벤트 발송
   ```typescript
   handleDeleteTask(taskId);
   notifyCalendarDataChanged({
     source: 'todo',
     changeType: 'delete',
     itemId: taskId,
     timestamp: Date.now()
   });
   ```

2. **IntegratedCalendarManager**: 이벤트 수신 → 캐시 무효화
3. **CalendarWidget**: 통합 아이템 자동 새로고침

### 오프라인 우선 전략

1. **로컬 우선 적용**: 즉각적인 UI 업데이트
2. **백그라운드 동기화**: 서버와 비동기 동기화
3. **충돌 감지**: 버전 관리 및 타임스탬프
4. **자동 해결**: 머지 전략 또는 사용자 선택

### 충돌 해결 전략

```typescript
enum ConflictResolution {
  LOCAL_WINS = 'local-wins',      // 로컬 우선
  SERVER_WINS = 'server-wins',    // 서버 우선
  MERGE = 'merge',                // 자동 병합
  USER_CHOICE = 'user-choice'     // 사용자 선택
}
```

## 🗄️ DB 스키마 설계

### PostgreSQL 스키마

#### 핵심 테이블
- `users`: 사용자 정보
- `calendar_events`: 캘린더 이벤트
- `tax_deadlines`: 세무 마감일
- `todo_tasks`: 할일 목록
- `todo_sections`: 할일 섹션

#### 통합 뷰
```sql
CREATE VIEW unified_calendar_items AS
SELECT ... FROM calendar_events
UNION ALL
SELECT ... FROM tax_deadlines
UNION ALL
SELECT ... FROM todo_tasks;
```

#### 인덱스 전략
- 날짜 기반 인덱스: `(user_id, date)`
- 카테고리 인덱스: `(user_id, category)`
- 상태 인덱스: `(user_id, status)`

## 🔌 API 설계

### RESTful 엔드포인트

```
GET    /api/calendar/items?start=&end=&sources=&priorities=
POST   /api/calendar/items
PUT    /api/calendar/items/:id
DELETE /api/calendar/items/:id
GET    /api/calendar/items/search?q=
POST   /api/calendar/items/batch
```

### WebSocket 이벤트

```typescript
// 클라이언트 → 서버
{
  type: 'subscribe',
  userId: string,
  filters: CalendarFilters
}

// 서버 → 클라이언트
{
  type: 'item_created' | 'item_updated' | 'item_deleted',
  data: UnifiedCalendarItem
}
```

## 🚀 구현 로드맵

### Phase 1: 데이터 통합 레이어 (1-2일) ✅ 완료
- [x] UnifiedCalendarItem 타입 정의
- [x] 각 위젯 어댑터 구현 (CalendarAdapter, TaxAdapter, TodoAdapter)
- [x] IntegratedCalendarManager 구현
- [x] 기본 테스트 케이스 작성 (E2E 테스트 완료)

### Phase 2: React 통합 (1-2일) ✅ 완료
- [x] useIntegratedCalendar 훅 구현
- [x] 필터링 시스템 구축 (CalendarFilters 타입 및 로직)
- [x] 상태 동기화 메커니즘 (구독/발행 패턴)
- [x] Context Provider 구현 (CalendarFilterContext)
- [x] LocalStorageDataSource 구현 (실제 데이터 연결)

### Phase 3: UI 통합 (2-3일) ✅ 완료
- [x] 통합 캘린더 뷰 컴포넌트 (IntegratedCalendarWidget)
- [x] 아이템 렌더링 최적화 (아젠다 뷰 구현)
- [x] 인터랙션 처리 (소스 필터링, 뷰 전환, 날짜 네비게이션)
- [x] 반응형 디자인 (반응형 레이아웃 적용)

### Phase 4: 성능 최적화 (1-2일) ✅ 완료
- [x] 메모이제이션 적용
  - IntegratedCalendarWidget: React.memo + useCallback 적용
  - 이벤트 핸들러 메모이제이션 (toggleSourceFilter, 날짜 네비게이션)
  - useIntegratedCalendar 훅은 이미 최적화 완료
- [x] 인덱싱 시스템 구축
  - IntegratedCalendarManager에 4가지 인덱스 추가
    - indexByDate: Map<string, UnifiedCalendarItem[]> (날짜별 O(1) 조회)
    - indexBySource: Map<CalendarItemSource, UnifiedCalendarItem[]> (소스별 O(1) 조회)
    - indexByPriority: Map<string, UnifiedCalendarItem[]> (우선순위별 O(1) 조회)
    - indexByStatus: Map<string, UnifiedCalendarItem[]> (상태별 O(1) 조회)
  - buildIndexes() 메서드로 캐시 업데이트 시 인덱스 자동 구축
  - invalidateCache() 시 인덱스도 함께 초기화
- [x] 배치 업데이트 구현
  - getItemsWithFilters(): 인덱스 활용한 초기 필터링으로 검색 공간 축소
  - getItemsByDateRange(): 날짜 인덱스 활용으로 O(1) 조회
  - getStatsBySource(): 소스 인덱스에서 직접 개수 조회
  - 교차 검증 최적화: Set 활용으로 중복 제거
- [ ] 가상 스크롤 적용 (선택사항, 대량 데이터 시 필요)

### Phase 5: 테스트 및 안정화 (1-2일) ✅ 완료
- [x] 목데이터 클리어 (Phase 5 E2E 테스트 준비)
  - calendar-events.ts: generateMockEvents() → 빈 배열 반환
  - todo-list/mock-data.ts: generateInitialData() → 빈 배열 반환
  - loadCalendarEvents(): localStorage 없을 시 빈 배열 반환 (목데이터 자동 생성 비활성화)
- [x] 빌드 검증 및 코드 품질 확인
  - TypeScript 컴파일 성공
  - ESLint 경고만 있음 (에러 없음)
- [ ] E2E 테스트 실행 (수동 테스트 필요)
  - 빈 상태 IntegratedCalendarWidget 확인
  - 데이터 추가 후 기능 테스트
  - 필터링 및 네비게이션 테스트
- [ ] 성능 프로파일링 (선택사항)
- [ ] 버그 수정 및 최적화 (필요 시)

### Phase 6: DB 마이그레이션 준비 (선택)
- [ ] API 엔드포인트 구현
- [ ] WebSocket 서버 설정
- [ ] 동기화 로직 구현
- [ ] 배포 및 모니터링

## 📈 예상 효과

1. **사용자 경험 향상**: 모든 일정을 한눈에 확인
2. **개발 효율성**: 재사용 가능한 컴포넌트
3. **유지보수성**: 명확한 레이어 분리
4. **확장성**: 새로운 위젯 쉽게 추가
5. **성능**: 대량 데이터도 빠른 처리

## 🔧 기술 스택

- **Frontend**: React, TypeScript, Next.js 15
- **State Management**: React Context + Custom Hooks
- **Styling**: Tailwind CSS, shadcn/ui
- **Data Storage**: LocalStorage → IndexedDB → PostgreSQL
- **Real-time**: WebSocket / Server-Sent Events
- **Testing**: Jest, React Testing Library
- **Build**: Vite / Next.js

## 📚 참고 자료

- [Repository Pattern in TypeScript](https://martinfowler.com/eaaCatalog/repository.html)
- [Offline-First Web Apps](https://offlinefirst.org/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)