# types/ - Storage 타입 시스템

## 📋 개요

이 디렉토리는 Storage 시스템의 **타입 정의**와 **런타임 검증** 시스템을 포함합니다. 100% 타입 안전성을 보장하며, Supabase 스키마와 1:1 매핑되도록 설계되었습니다.

## 📁 구조

```
types/
├── base.ts           # 기본 인터페이스 및 타입
├── validators.ts     # 공통 검증 함수
└── entities/         # 엔티티 타입 정의
    ├── user.ts       # User 엔티티
    ├── project.ts    # Project 엔티티 (WBS, 결제, 문서)
    ├── client.ts     # Client 엔티티
    ├── task.ts       # Task 엔티티
    ├── event.ts      # CalendarEvent 엔티티
    ├── document.ts   # Document 엔티티
    └── settings.ts   # Settings 엔티티
```

## 🔧 base.ts - 기본 타입

### StorageAdapter 인터페이스

```typescript
interface StorageAdapter {
  get(key: string): Promise<any>
  set(key: string, value: any): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>

  // 선택적 트랜잭션 메서드
  beginTransaction?(): Promise<void>
  commitTransaction?(): Promise<void>
  rollbackTransaction?(): Promise<void>
}
```

### 구독 시스템 타입

```typescript
type SubscriberCallback<T = any> = (value: T, oldValue?: T) => void

interface StorageEvent<T = any> {
  key: string
  value: T
  oldValue?: T
  operation: 'set' | 'remove' | 'rollback'
  timestamp: number
}
```

### 에러 처리

```typescript
type StorageErrorCode =
  | 'GET_ERROR'
  | 'SET_ERROR'
  | 'REMOVE_ERROR'
  | 'CLEAR_ERROR'
  | 'TRANSACTION_ERROR'
  | 'ADAPTER_ERROR'
  | 'CACHE_ERROR'
  | 'ROLLBACK_ERROR'

interface StorageError extends Error {
  code: StorageErrorCode
  severity: 'low' | 'medium' | 'high' | 'critical'
  userMessage?: string  // 사용자 친화적 메시지
  cause?: Error         // 원인 체이닝
}
```

### 성능 최적화 타입

```typescript
// SetOptions (Phase 1 개선)
interface SetOptions {
  notifyOldValue?: boolean  // oldValue 읽기 여부
  cacheTTL?: number         // 캐시 TTL (밀리초)
  skipCache?: boolean       // 캐시 건너뛰기
}

// BatchOptions
interface BatchOptions {
  chunkSize?: number        // 청크 크기 (기본: 50)
  maxParallel?: number      // 최대 병렬 (기본: 5)
  enableStats?: boolean     // 통계 수집
  retryOnError?: boolean    // 에러 재시도
  maxRetries?: number       // 최대 재시도 횟수
  retryBackoff?: 'linear' | 'exponential'  // 재시도 전략
}

// CacheEntry (조건부 타입)
type CacheEntry<T> =
  | LRUCacheEntry<T>   // lastAccess 필수
  | LFUCacheEntry<T>   // accessCount 필수
  | BaseCacheEntry<T>  // TTL만 지원
```

## 🧾 validators.ts - 공통 검증 함수

### 날짜 검증

```typescript
/**
 * ISO 8601 날짜 형식 검증
 * @param value - 검증할 값
 * @returns 유효한 ISO 날짜인지 여부
 */
function isValidISODate(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
  if (!isoDateRegex.test(value)) return false
  return !isNaN(new Date(value).getTime())
}

/**
 * 날짜 범위 논리 검증
 * @param start - 시작 날짜
 * @param end - 종료 날짜
 * @returns 시작일이 종료일보다 앞서는지 여부
 */
function isValidDateRange(start: string, end: string): boolean {
  return new Date(start) <= new Date(end)
}
```

### 형식 검증

```typescript
/**
 * 이메일 형식 검증
 */
function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * URL 형식 검증
 */
function isValidURL(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}
```

### 숫자 범위 검증

```typescript
/**
 * 숫자 범위 검증 (min-max 포함)
 */
function isNumberInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * 양수 검증 (> 0)
 */
function isPositiveNumber(value: number): boolean {
  return value > 0
}

/**
 * 비음수 검증 (>= 0)
 */
function isNonNegativeNumber(value: number): boolean {
  return value >= 0
}
```

## 📊 entities/ - 엔티티 타입

### 1. Project (project.ts)

**핵심 프로젝트 엔티티** - WBS 시스템, 결제 관리, 문서 통합

```typescript
interface Project {
  id: string
  userId: string
  clientId?: string

  // 기본 정보
  no: string
  name: string
  description?: string
  projectContent?: string

  // 상태
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled'
  progress: number  // 0-100 (WBS 기반 자동 계산, 읽기 전용)
  paymentProgress?: number  // 0-100 (결제 진행률)

  // WBS 시스템 (진행률 계산의 단일 진실 공급원)
  wbsTasks: WBSTask[]

  // 결제 시스템
  settlementMethod?: SettlementMethod  // 정산 방식
  paymentStatus?: PaymentStatus         // 수금 상태
  totalAmount?: number                  // 총 프로젝트 금액

  // 문서 시스템
  documentStatus?: ProjectDocumentStatus  // 문서 현황 통합 관리

  // 일정
  startDate?: string
  endDate?: string
  registrationDate: string
  modifiedDate: string

  createdAt: string
  updatedAt: string
}

interface WBSTask {
  id: string
  name: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed'
  assignee?: string
  order: number  // 정렬 순서
  createdAt: string
  startedAt?: string
  completedAt?: string
}

type SettlementMethod = 'not_set' | 'advance_final' | 'advance_interim_final' | 'post_payment'
type PaymentStatus = 'not_started' | 'advance_completed' | 'interim_completed' | 'final_completed'
```

**타입 가드 개선 (Phase 3)**:
- ✅ 진행률 0-100 범위 검증
- ✅ WBSTasks 배열 요소 검증
- ✅ 날짜 범위 검증 (startDate <= endDate)
- ✅ Tags 배열 검증

### 2. Task (task.ts)

**할일 엔티티** - 프로젝트 연결, 의존성, 하위작업

```typescript
interface Task {
  id: string
  userId: string
  projectId?: string

  // 기본 정보
  title: string
  description?: string

  // 상태
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'

  // 일정
  dueDate?: string
  startDate?: string
  completedAt?: string

  // 관계
  parentTaskId?: string
  subtasks?: string[]      // 하위 작업 IDs
  dependencies?: string[]  // 의존 작업 IDs

  // 추적
  estimatedHours?: number
  actualHours?: number

  createdAt: string
  updatedAt: string
}
```

**타입 가드 개선 (Phase 3)**:
- ✅ 날짜 범위 검증 (startDate <= dueDate)
- ✅ 시간 필드 비음수 검증
- ✅ subtasks/dependencies 배열 검증

### 3. CalendarEvent (event.ts)

**캘린더 이벤트 엔티티** - 프로젝트/클라이언트 연결, 반복 이벤트

```typescript
interface CalendarEvent {
  id: string
  userId: string
  projectId?: string
  clientId?: string

  // 기본 정보
  title: string
  description?: string
  location?: string

  // 시간 (필수 범위 검증: startDate <= endDate)
  startDate: string
  endDate: string
  allDay?: boolean
  timezone?: string

  // 타입
  type: 'meeting' | 'deadline' | 'milestone' | 'reminder' | 'other'
  category?: 'work' | 'personal' | 'project' | 'client'

  // 상태
  status?: 'confirmed' | 'tentative' | 'cancelled'

  // 반복
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval?: number
    endDate?: string
    daysOfWeek?: number[]
    exceptions?: string[]
  }

  createdAt: string
  updatedAt: string
}
```

**타입 가드 개선 (Phase 3)**:
- ✅ **필수 날짜 범위 검증**: startDate <= endDate (모든 이벤트)
- ✅ 참석자/리마인더 배열 요소 검증

### 4. 기타 엔티티

- **User** (user.ts): 사용자 정보, 이메일 검증
- **Client** (client.ts): 클라이언트 정보, 이메일/URL/평점 검증
- **Document** (document.ts): 문서 정보, 버전/크기 검증
- **Settings** (settings.ts): 사용자 설정, 중첩 객체 완전 검증

## 🔍 타입 가드 사용 패턴

### 기본 사용법

```typescript
import { isProject } from '@/lib/storage/types/entities/project'

const data = await storageManager.get('projects')

if (Array.isArray(data) && data.every(isProject)) {
  // 타입 안전하게 사용
  const projects: Project[] = data
  projects.forEach(p => console.log(p.name))
}
```

### Adapter에서 사용

```typescript
async get<T>(key: string, typeGuard?: (value: unknown) => value is T): Promise<T | null> {
  const data = await this.adapter.get(key)

  if (data === null) return null

  // 타입 가드로 런타임 검증
  if (typeGuard && !typeGuard(data)) {
    throw new Error(`Invalid data type for key "${key}"`)
  }

  return data as T
}

// 사용 예시
const projects = await adapter.get('projects', (data): data is Project[] =>
  Array.isArray(data) && data.every(isProject)
)
```

## 🚨 주의사항

### 1. 타입 가드 필수 사용

```typescript
// ❌ 타입 캐스팅만 사용 (위험)
const projects = await storageManager.get('projects') as Project[]

// ✅ 타입 가드로 런타임 검증
const data = await storageManager.get('projects')
if (Array.isArray(data) && data.every(isProject)) {
  const projects: Project[] = data
}
```

### 2. 날짜 범위 검증

```typescript
// CalendarEvent는 항상 startDate <= endDate 검증
const isValid = isCalendarEvent(event)
// isValid === true → startDate가 항상 endDate보다 앞섬

// 프로젝트 생성 시에도 검증
if (startDate && endDate && !isValidDateRange(startDate, endDate)) {
  throw new Error('시작일은 종료일보다 앞서야 합니다')
}
```

### 3. 배열 필드 검증

```typescript
// subtasks 배열은 항상 string[] 타입 보장
if (task.subtasks && !isStringArray(task.subtasks)) {
  throw new Error('Invalid subtasks array')
}
```

## 📊 품질 메트릭

### Phase 3 개선 완료 (2025-10-05)

**런타임 검증 강화**:
- ✅ 공통 검증 유틸리티 8개 함수 추가 (validators.ts)
- ✅ 7개 엔티티 타입 가드 개선 (504줄 추가)
- ✅ 날짜/이메일/URL 형식 검증
- ✅ 숫자 범위 검증 강화
- ✅ 배열 요소 검증 패턴 통일

**보안 및 안정성**:
- ✅ 데이터 무결성: 손상된 데이터 조기 감지
- ✅ 타입 안전성: 런타임 타입 검증 강화
- ✅ 에러 방지: 잘못된 데이터로 인한 런타임 에러 사전 차단

## 🔗 관련 문서

- **Core**: [`../core/claude.md`](../core/claude.md) - StorageManager
- **Adapters**: [`../adapters/claude.md`](../adapters/claude.md) - TypeGuard 파라미터
- **Services**: [`../services/claude.md`](../services/claude.md) - 엔티티 사용 패턴
- **Schema**: [`../../../docs/LOCAL-STORAGE-SCHEMA.md`](../../../docs/LOCAL-STORAGE-SCHEMA.md)

---

**타입 시스템은 Storage의 100% 타입 안전성을 보장하며, Supabase 마이그레이션을 위한 완벽한 스키마 매핑을 제공합니다.**

*마지막 업데이트: 2025-10-05*
