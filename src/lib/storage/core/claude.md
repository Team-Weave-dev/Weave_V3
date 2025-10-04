# core/ - StorageManager 핵심 클래스

## 📋 개요

이 디렉토리는 Storage 시스템의 핵심인 **StorageManager** 클래스를 포함합니다. 모든 데이터 작업의 단일 진입점이며, 구독, 트랜잭션, 캐싱 등의 고급 기능을 통합 관리합니다.

## 🎯 StorageManager 클래스

### 역할

- **통합 API**: 모든 CRUD 작업의 중앙 인터페이스
- **어댑터 관리**: 스토리지 백엔드 교체 가능
- **구독 시스템**: 실시간 데이터 동기화
- **트랜잭션**: 원자성 보장 작업
- **성능 최적화**: 캐싱, 배치, 압축 통합

### 주요 메서드

#### 기본 CRUD 작업

```typescript
class StorageManager {
  /**
   * 데이터 조회
   * @param key - 스토리지 키
   * @returns 데이터 또는 null
   */
  async get<T>(key: string): Promise<T | null>

  /**
   * 데이터 저장
   * @param key - 스토리지 키
   * @param value - 저장할 데이터
   * @param options - 저장 옵션 (cacheTTL, skipCache 등)
   */
  async set<T>(key: string, value: T, options?: SetOptions): Promise<void>

  /**
   * 데이터 삭제
   * @param key - 스토리지 키
   */
  async remove(key: string): Promise<void>

  /**
   * 모든 데이터 삭제
   */
  async clear(): Promise<void>
}
```

#### 배치 작업

```typescript
/**
 * 다중 키 조회 (병렬 처리)
 * @param keys - 조회할 키 배열
 * @param options - 배치 옵션 (chunkSize, maxParallel 등)
 * @returns 키-값 맵
 */
async getBatch<T>(
  keys: string[],
  options?: BatchOptions
): Promise<Map<string, T>>

/**
 * 다중 키-값 저장 (병렬 처리)
 * @param items - 저장할 키-값 맵
 * @param options - 배치 옵션
 * @returns 배치 작업 결과 (성공/실패 통계)
 */
async setBatch(
  items: Map<string, any>,
  options?: BatchOptions
): Promise<BatchOperationResult>
```

#### 구독 시스템

```typescript
/**
 * 데이터 변경 구독
 * @param key - 구독할 키 (와일드카드 '*' 지원)
 * @param callback - 변경 시 호출될 콜백
 * @returns 구독 해제 함수
 */
subscribe(key: string, callback: Subscriber): () => void

/**
 * 구독자들에게 변경 알림
 * @param key - 변경된 키
 * @param value - 새로운 값
 * @param operation - 작업 유형 ('set' | 'remove' | 'rollback')
 */
private notify(key: string, value: any, operation: string): void
```

#### 트랜잭션

```typescript
/**
 * 트랜잭션 실행 (원자성 보장)
 * - 성공 시 모든 변경사항 커밋
 * - 실패 시 자동 롤백
 * @param fn - 트랜잭션 함수
 */
async transaction(fn: TransactionFn): Promise<void>

/**
 * 트랜잭션 롤백 (내부 메서드)
 * @param snapshot - 백업 스냅샷
 */
private async rollback(snapshot: Map<string, any>): Promise<void>
```

## 📊 성능 최적화 기능

### 1. 캐싱 시스템

```typescript
// 캐시 통계 조회
const stats = storageManager.getCacheStats()
console.log(stats)
// {
//   hits: 1000,
//   misses: 200,
//   hitRate: 0.833,
//   size: 150,
//   evictions: 50,
//   totalRequests: 1200
// }

// 캐시 무효화 (패턴 지원)
storageManager.invalidateCachePattern('project:*')

// 만료된 캐시 정리
storageManager.cleanupExpiredCache()
```

### 2. 배치 처리

```typescript
// 다중 조회 (청크 단위 병렬)
const keys = ['project:1', 'project:2', 'project:3']
const projects = await storageManager.getBatch<Project>(keys, {
  chunkSize: 50,
  maxParallel: 5,
  enableStats: true
})

// 다중 저장 (에러 복구 지원)
const items = new Map([
  ['project:1', project1],
  ['project:2', project2]
])
const result = await storageManager.setBatch(items, {
  retryOnError: true,
  maxRetries: 3
})
console.log(result)
// {
//   successCount: 2,
//   errorCount: 0,
//   executionTime: 150,
//   throughput: 13.33
// }
```

### 3. 압축

```typescript
// 압축 통계 조회
const stats = storageManager.getCompressionStats()
console.log(stats)
// {
//   totalSaved: 500000,
//   averageRatio: 0.45,
//   compressionCount: 100,
//   averageCompressionTime: 5
// }
```

## 🔄 사용 패턴

### 기본 사용법

```typescript
import { storageManager } from '@/lib/storage'

// 조회
const projects = await storageManager.get<Project[]>('projects')

// 저장
await storageManager.set('projects', updatedProjects)

// 삭제
await storageManager.remove('projects')
```

### 구독 패턴 (실시간 동기화)

```typescript
// 컴포넌트 마운트 시 구독
useEffect(() => {
  const unsubscribe = storageManager.subscribe('projects', (projects) => {
    setProjects(projects)
  })

  // 컴포넌트 언마운트 시 구독 해제 (메모리 누수 방지)
  return unsubscribe
}, [])
```

### 트랜잭션 패턴 (원자성)

```typescript
try {
  await storageManager.transaction(async (tx) => {
    // 프로젝트 삭제
    const projects = await tx.get<Project[]>('projects')
    const filteredProjects = projects.filter(p => p.id !== projectId)
    await tx.set('projects', filteredProjects)

    // 관련 태스크 삭제
    const tasks = await tx.get<Task[]>('tasks')
    const filteredTasks = tasks.filter(t => t.projectId !== projectId)
    await tx.set('tasks', filteredTasks)

    // 둘 중 하나라도 실패하면 자동 롤백
  })
  console.log('Transaction committed successfully')
} catch (error) {
  console.error('Transaction failed and rolled back:', error)
}
```

### 배치 패턴 (성능)

```typescript
// 여러 프로젝트 한 번에 조회
const projectIds = ['id1', 'id2', 'id3']
const keys = projectIds.map(id => `project:${id}`)
const projectsMap = await storageManager.getBatch<Project>(keys)

// Map을 배열로 변환
const projects = Array.from(projectsMap.values())
```

## 🚨 주의사항

### 1. 구독 해제 필수

```typescript
// ✅ 올바른 패턴
useEffect(() => {
  const unsubscribe = storageManager.subscribe('key', callback)
  return unsubscribe  // 클린업
}, [])

// ❌ 잘못된 패턴 (메모리 누수)
useEffect(() => {
  storageManager.subscribe('key', callback)
  // 구독 해제 없음
}, [])
```

### 2. 트랜잭션 내부에서 예외 처리

```typescript
// ✅ 트랜잭션 외부에서 try-catch
try {
  await storageManager.transaction(async (tx) => {
    // 트랜잭션 로직
  })
} catch (error) {
  // 에러 처리
}

// ❌ 트랜잭션 내부에서 try-catch (롤백 방해)
await storageManager.transaction(async (tx) => {
  try {
    // 로직
  } catch (error) {
    // 에러를 삼키면 롤백이 작동하지 않음
  }
})
```

### 3. SetOptions 활용

```typescript
// oldValue가 필요할 때만 읽기 (성능 최적화)
await storageManager.set('projects', newProjects, {
  notifyOldValue: true  // 구독자가 oldValue를 필요로 할 때
})

// 캐시 TTL 설정
await storageManager.set('temp-data', data, {
  cacheTTL: 5 * 60 * 1000  // 5분
})

// 캐시 건너뛰기 (항상 최신 데이터 보장)
await storageManager.set('critical-data', data, {
  skipCache: true
})
```

## 📈 성능 메트릭

### Phase 1 개선 완료 (2025-01-04)

**Critical Issues 수정**:
- ✅ 트랜잭션 캐시 동기화: 변경된 키 자동 무효화
- ✅ set/setBatch Race Condition 제거: 조건부 oldValue 읽기
- ✅ StorageError 클래스: 타입 안전한 에러 처리

**성능 향상**:
- set() 작업: ~60% 빠름
- setBatch() 작업: ~60% 빠름
- transaction() 작업: ~33% 빠름

## 🔗 관련 문서

- **Adapters**: [`../adapters/claude.md`](../adapters/claude.md)
- **Types**: [`../types/claude.md`](../types/claude.md)
- **Utils**: [`../utils/claude.md`](../utils/claude.md) - CacheLayer, IndexManager

---

**StorageManager는 모든 데이터 작업의 중심이며, 성능과 안정성을 동시에 보장하는 통합 API입니다.**

*마지막 업데이트: 2025-10-05*
