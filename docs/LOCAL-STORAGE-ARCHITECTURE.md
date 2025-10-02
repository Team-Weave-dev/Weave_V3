# 로컬스토리지 전역 데이터 관리 아키텍처

## 📋 목차
1. [개요](#개요)
2. [현재 상태 분석](#현재-상태-분석)
3. [목표 아키텍처](#목표-아키텍처)
4. [Storage Manager 시스템](#storage-manager-시스템)
5. [데이터 동기화](#데이터-동기화)
6. [구현 로드맵](#구현-로드맵)

## 개요

### 프로젝트 목표
- **단계 1**: 모든 데이터를 로컬스토리지로 통합 관리
- **단계 2**: Supabase 마이그레이션을 위한 기반 구축
- **단계 3**: 네이티브 앱 지원을 위한 추상화 레이어

### 핵심 원칙
- **데이터 일관성**: 모든 컴포넌트가 동일한 데이터 소스 사용
- **타입 안정성**: TypeScript로 완전한 타입 정의
- **마이그레이션 준비**: Supabase 스키마와 1:1 매핑
- **확장성**: 새로운 데이터 타입 쉽게 추가

## 현재 상태 분석

### 기존 로컬스토리지 사용 현황

| 도메인 | 키 | 파일 위치 | 용도 |
|--------|---|-----------|------|
| **대시보드** | `weave-dashboard-layout` | `lib/stores/useImprovedDashboardStore.ts` | 위젯 레이아웃 및 설정 |
| **할일** | 커스텀 훅 기반 | `components/ui/widgets/todo-list/hooks/useLocalStorage.ts` | 할일 목록 데이터 |
| **캘린더** | `calendar_events` | `lib/calendar-integration/LocalStorageDataSource.ts` | 캘린더 이벤트 |
| **프로젝트** | `weave_custom_projects` | `lib/mock/projects.ts` | 프로젝트 기본 정보 |
| **문서** | `weave_project_documents` | `lib/mock/documents.ts` | 프로젝트별 문서 |
| **클라이언트** | (미구현) | - | 클라이언트 정보 |
| **설정** | `preferredViewMode` 등 | 여러 곳에 분산 | 사용자 설정 |

### 문제점
1. **분산된 키 관리**: 각 모듈이 독립적으로 키 관리
2. **일관성 없는 API**: 모듈마다 다른 저장/조회 패턴
3. **관계 데이터 미지원**: 프로젝트-할일-캘린더 연결 없음
4. **버전 관리 없음**: 스키마 변경 시 마이그레이션 어려움

## 목표 아키텍처

### 계층 구조

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (Components, Hooks, Pages)            │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Storage Manager API             │
│  (통합 인터페이스, 타입 안정성)           │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│      Storage Adapter Layer              │
│  (LocalStorage / Supabase / Native)     │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Data Persistence                │
│  (브라우저 / 데이터베이스 / 파일시스템)   │
└─────────────────────────────────────────┘
```

### 주요 특징

1. **통합 API**: 모든 데이터 작업을 하나의 인터페이스로
2. **어댑터 패턴**: 스토리지 백엔드 교체 가능
3. **이벤트 시스템**: 실시간 데이터 동기화
4. **버전 관리**: 스키마 마이그레이션 지원

## Storage Manager 시스템

### 핵심 클래스 구조

```typescript
// src/lib/storage/StorageManager.ts
class StorageManager {
  private adapter: StorageAdapter;
  private subscribers: Map<string, Set<Subscriber>>;
  private cache: Map<string, any>;

  // 기본 CRUD 작업
  async get<T>(key: string): Promise<T | null>;
  async set<T>(key: string, value: T): Promise<void>;
  async remove(key: string): Promise<void>;
  async clear(): Promise<void>;

  // 배치 작업
  async getBatch<T>(keys: string[]): Promise<Map<string, T>>;
  async setBatch(items: Map<string, any>): Promise<void>;

  // 구독 시스템
  subscribe(key: string, callback: Subscriber): () => void;
  notify(key: string, value: any): void;

  // 트랜잭션
  async transaction(fn: TransactionFn): Promise<void>;

  // 마이그레이션
  async migrate(version: number): Promise<void>;
}
```

### Storage Adapter 인터페이스

```typescript
interface StorageAdapter {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;

  // 어댑터별 특수 기능
  beginTransaction?(): Promise<void>;
  commitTransaction?(): Promise<void>;
  rollbackTransaction?(): Promise<void>;
}
```

### 어댑터 구현체

```typescript
// LocalStorage 어댑터
class LocalStorageAdapter implements StorageAdapter {
  private prefix = 'weave_v2_';

  async get(key: string): Promise<any> {
    const data = localStorage.getItem(this.prefix + key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  // ... 나머지 메서드
}

// Supabase 어댑터 (향후 구현)
class SupabaseAdapter implements StorageAdapter {
  private supabase: SupabaseClient;

  async get(key: string): Promise<any> {
    const { data } = await this.supabase
      .from('user_data')
      .select('value')
      .eq('key', key)
      .single();
    return data?.value;
  }

  // ... 나머지 메서드
}
```

## 데이터 동기화

### 이벤트 기반 동기화

```typescript
// 데이터 변경 시 자동 동기화
storageManager.subscribe('projects', (projects) => {
  // 프로젝트 변경 시 대시보드 위젯 업데이트
  updateProjectWidget(projects);

  // 캘린더 이벤트 업데이트
  syncCalendarEvents(projects);

  // 할일 목록 업데이트
  syncTodoItems(projects);
});
```

### 관계 데이터 처리

```typescript
// 프로젝트와 연관된 데이터 자동 로드
class ProjectService {
  async getProjectWithRelations(projectId: string) {
    const [project, documents, todos, events] = await Promise.all([
      storageManager.get(`project:${projectId}`),
      storageManager.get(`documents:${projectId}`),
      storageManager.get(`todos:project:${projectId}`),
      storageManager.get(`events:project:${projectId}`)
    ]);

    return {
      ...project,
      documents,
      todos,
      events
    };
  }
}
```

## 구현 로드맵

### Phase 1: 기반 구축 (1주차)
- [ ] StorageManager 클래스 구현
- [ ] LocalStorageAdapter 구현
- [ ] 타입 정의 및 스키마 설계
- [ ] 기본 CRUD 작업 테스트

### Phase 2: 기존 코드 마이그레이션 (2-3주차)
- [ ] 대시보드 위젯 스토어 마이그레이션
- [ ] 프로젝트 데이터 마이그레이션
- [ ] 할일 목록 마이그레이션
- [ ] 캘린더 이벤트 마이그레이션

### Phase 3: 데이터 연결 (4주차)
- [ ] 프로젝트-할일 연결
- [ ] 프로젝트-캘린더 연결
- [ ] 프로젝트-문서 연결
- [ ] 실시간 동기화 구현

### Phase 4: 고급 기능 (5주차)
- [ ] 트랜잭션 지원
- [ ] 배치 작업 최적화
- [ ] 캐싱 시스템
- [ ] 성능 모니터링

### Phase 5: Supabase 준비 (6주차)
- [ ] SupabaseAdapter 프로토타입
- [ ] 마이그레이션 스크립트
- [ ] 동기화 로직
- [ ] 오프라인 지원

## 파일 구조

```
src/lib/storage/
├── StorageManager.ts        # 메인 매니저 클래스
├── adapters/
│   ├── LocalStorageAdapter.ts
│   ├── SupabaseAdapter.ts
│   └── NativeAdapter.ts
├── types/
│   ├── index.ts            # 타입 정의
│   └── schema.ts           # 데이터 스키마
├── services/
│   ├── ProjectService.ts
│   ├── TodoService.ts
│   ├── CalendarService.ts
│   └── DocumentService.ts
├── migrations/
│   ├── v1-to-v2.ts
│   └── index.ts
└── utils/
    ├── validation.ts
    └── serialization.ts
```

## 성능 고려사항

### 최적화 전략
1. **배치 작업**: 여러 데이터를 한 번에 처리
2. **레이지 로딩**: 필요한 데이터만 로드
3. **캐싱**: 자주 사용하는 데이터 메모리 캐시
4. **디바운싱**: 빠른 연속 저장 방지

### 용량 관리
- LocalStorage 한계: 5-10MB
- 데이터 압축 고려
- 오래된 데이터 자동 정리
- 대용량 데이터는 IndexedDB 사용 검토

## 보안 고려사항

1. **데이터 암호화**: 민감한 정보 암호화
2. **접근 제어**: 사용자별 데이터 분리
3. **입력 검증**: 모든 데이터 검증
4. **XSS 방지**: 저장 전 샌드박싱

## 테스트 전략

```typescript
// 단위 테스트 예시
describe('StorageManager', () => {
  let manager: StorageManager;

  beforeEach(() => {
    manager = new StorageManager(new LocalStorageAdapter());
  });

  test('should save and retrieve data', async () => {
    await manager.set('test', { value: 123 });
    const data = await manager.get('test');
    expect(data).toEqual({ value: 123 });
  });

  test('should notify subscribers on change', async () => {
    const callback = jest.fn();
    manager.subscribe('test', callback);

    await manager.set('test', { value: 456 });
    expect(callback).toHaveBeenCalledWith({ value: 456 });
  });
});
```

## 다음 단계

1. **스키마 설계 문서** 작성 (`LOCAL-STORAGE-SCHEMA.md`)
2. **마이그레이션 전략** 수립 (`LOCAL-STORAGE-MIGRATION.md`)
3. **StorageManager 구현** 시작
4. **프로토타입** 개발 및 테스트

---

*작성일: 2025-01-03*
*버전: 1.0.0*
*작성자: Claude Code*