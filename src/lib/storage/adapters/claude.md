# adapters/ - Storage Adapter 시스템

## 📋 개요

이 디렉토리는 **Adapter 패턴**을 통해 다양한 스토리지 백엔드를 지원하는 어댑터 구현체들을 포함합니다.

**구현 완료**:
- ✅ LocalStorageAdapter: 브라우저 localStorage 래퍼
- ✅ SupabaseAdapter: Supabase 데이터베이스 통합 (Phase 10.1)
- ✅ DualWriteAdapter: 이중 쓰기 전략 (Phase 10.2)

**향후 계획**: NativeAdapter (모바일 앱용)

## 🎯 Adapter 패턴

### 장점

- **백엔드 교체 가능**: localStorage → Supabase → Native App으로 쉽게 전환
- **일관된 API**: 어댑터와 관계없이 동일한 인터페이스 사용
- **테스트 용이성**: Mock Adapter로 테스트 환경 구성 가능
- **점진적 마이그레이션**: DualWrite/DualRead 어댑터로 안전한 전환

## 📐 StorageAdapter 인터페이스

모든 어댑터가 구현해야 하는 기본 인터페이스:

```typescript
interface StorageAdapter {
  /**
   * 데이터 조회
   * @param key - 스토리지 키
   * @returns 데이터 또는 null
   */
  get(key: string): Promise<any>

  /**
   * 데이터 저장
   * @param key - 스토리지 키
   * @param value - 저장할 데이터
   */
  set(key: string, value: any): Promise<void>

  /**
   * 데이터 삭제
   * @param key - 스토리지 키
   */
  remove(key: string): Promise<void>

  /**
   * 모든 데이터 삭제
   */
  clear(): Promise<void>

  /**
   * 모든 키 조회
   * @returns 키 배열
   */
  keys(): Promise<string[]>

  // 선택적 메서드 (어댑터별 특수 기능)
  beginTransaction?(): Promise<void>
  commitTransaction?(): Promise<void>
  rollbackTransaction?(): Promise<void>
}
```

## 🗂️ LocalStorageAdapter

### 개요

브라우저의 `localStorage`를 래핑하여 타입 안전성, 에러 처리, 압축 기능을 제공하는 어댑터입니다.

### 주요 기능

#### 1. 타입 안전한 CRUD

```typescript
class LocalStorageAdapter implements StorageAdapter {
  private prefix = 'weave_v2_'  // 네임스페이스

  async get(key: string): Promise<any> {
    try {
      const fullKey = this.buildKey(key)
      const data = localStorage.getItem(fullKey)

      if (!data) return null

      // 압축 데이터 자동 해제
      if (data.startsWith(COMPRESSION_PREFIX)) {
        return this.compressionManager.decompress(data.slice(COMPRESSION_PREFIX.length))
      }

      return JSON.parse(data)
    } catch (error) {
      throw new StorageError({
        code: 'GET_ERROR',
        message: `Failed to get key "${key}"`,
        cause: error,
        severity: 'high'
      })
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      const fullKey = this.buildKey(key)
      let dataToStore = JSON.stringify(value)

      // 자동 압축 (임계값 초과 시)
      const compressed = this.compressionManager.compress(dataToStore)
      if (compressed.compressed) {
        dataToStore = COMPRESSION_PREFIX + compressed.data
      }

      localStorage.setItem(fullKey, dataToStore)
    } catch (error) {
      // QuotaExceededError 처리
      if (error.name === 'QuotaExceededError') {
        throw new StorageError({
          code: 'SET_ERROR',
          message: '저장 공간이 부족합니다',
          cause: error,
          severity: 'critical',
          userMessage: '저장 공간이 부족합니다. 불필요한 데이터를 삭제해주세요.'
        })
      }
      throw new StorageError({
        code: 'SET_ERROR',
        message: `Failed to set key "${key}"`,
        cause: error,
        severity: 'high'
      })
    }
  }
}
```

#### 2. 키 관리 및 보안

```typescript
/**
 * 안전한 키 생성 (키 인젝션 공격 방지)
 * @param id - 키 식별자
 * @returns 검증되고 인코딩된 전체 키
 */
private buildKey(id: string): string {
  // validateId: 빈 문자열, null, undefined 검증
  const validatedId = validateId(id)
  // encodeURIComponent: 키 인젝션 공격 방지
  return `${this.prefix}${encodeURIComponent(validatedId)}`
}

/**
 * 모든 Storage 키 조회 (프리픽스 필터링)
 * @returns 키 배열
 */
async keys(): Promise<string[]> {
  const allKeys = Object.keys(localStorage)
  return allKeys
    .filter(key => key.startsWith(this.prefix))
    .map(key => decodeURIComponent(key.slice(this.prefix.length)))
}
```

#### 3. 압축 시스템

```typescript
/**
 * CompressionManager 통합
 * - 자동 압축: 임계값 이상 크기일 때
 * - 적응형 임계값: 압축 성공률에 따라 자동 조정
 */
private compressionManager: CompressionManager

// 압축 통계 조회
getCompressionStats(): CompressionStats {
  return this.compressionManager.getStats()
}
```

#### 4. 성능 모니터링

```typescript
/**
 * 스토리지 용량 계산 (TextEncoder 기반, 5배 빠름)
 * @returns 바이트 단위 크기
 */
private calculateSize(): number {
  const encoder = new TextEncoder()
  let totalSize = 0

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(this.prefix)) {
      const value = localStorage.getItem(key) || ''
      totalSize += encoder.encode(key).length
      totalSize += encoder.encode(value).length
    }
  }

  return totalSize
}
```

### Phase 2 개선 완료 (2025-10-05)

**보안 및 안정성 강화**:
- ✅ buildKey() 키 검증 추가: validateId 통합, encodeURIComponent
- ✅ 에러 처리 전략 통일: 모든 메서드에 StorageError 적용
- ✅ QuotaExceededError 특별 처리: 사용자 친화적 메시지

**타입 안전성 및 압축 최적화**:
- ✅ TypeGuard 타입 추가: get() 메서드에 선택적 typeGuard 파라미터
- ✅ CompressionManager 통합: COMPRESSION_PREFIX 상수화
- ✅ calculateSize 최적화: Blob → TextEncoder (5배 성능 향상)

## 🆕 SupabaseAdapter (Phase 10.1 ✅)

### 개요

Supabase 데이터베이스를 Storage 백엔드로 사용하는 어댑터입니다.

### 주요 기능

#### 1. 사용자 격리 (RLS)

```typescript
class SupabaseAdapter implements StorageAdapter {
  private supabase: SupabaseClient
  private userId: string  // 사용자별 데이터 격리

  async get<T>(key: string): Promise<T | null> {
    const { entity, id } = this.parseKey(key)

    // 모든 쿼리에 user_id 자동 필터링
    const query = this.supabase
      .from(this.getTableName(entity))
      .select('*')
      .eq('user_id', this.userId)

    if (id) {
      query.eq('id', id).single()
    }

    const { data } = await query
    return data
  }
}
```

#### 2. 엔티티-테이블 매핑

```typescript
const ENTITY_TABLE_MAP = {
  projects: 'projects',
  tasks: 'tasks',
  events: 'calendar_events',
  clients: 'clients',
  documents: 'documents',
  settings: 'user_settings',
}

// 키 파싱: 'project:abc-123' → { entity: 'project', id: 'abc-123' }
```

#### 3. 재시도 로직

```typescript
// 네트워크 오류 시 자동 재시도 (지수 백오프)
private async withRetry<T>(queryFn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < this.maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error) {
      if (this.isNetworkError(error) && attempt < this.maxRetries - 1) {
        await this.delay(this.retryDelay * Math.pow(2, attempt))
        continue
      }
      throw error
    }
  }
}
```

#### 4. 타입 안전성

```typescript
// TypeGuard 파라미터 지원
const projects = await adapter.get<Project[]>('projects', isProjectArray)
```

## 🔄 DualWriteAdapter (Phase 10.2 ✅)

### 개요

LocalStorage와 Supabase를 동시에 사용하는 이중 쓰기 어댑터로, 안전한 마이그레이션을 지원합니다.

### 핵심 전략

1. **쓰기**: LocalStorage (즉시) → Supabase (백그라운드)
2. **읽기**: LocalStorage (단일 진실 공급원)
3. **동기화**: 백그라운드 워커 (5초 간격)
4. **실패 처리**: 동기화 큐 + 재시도

### 주요 기능

#### 1. 이중 쓰기

```typescript
class DualWriteAdapter implements StorageAdapter {
  async set<T>(key: string, value: T): Promise<void> {
    // 1. LocalStorage에 즉시 저장 (차단)
    await this.local.set(key, value)

    // 2. 동기화 큐에 추가
    this.addToSyncQueue(key, value, 'set')

    // 3. Supabase 동기화 시도 (비차단)
    this.syncToSupabase(key, value, 'set').catch(error => {
      console.warn('Background sync failed:', error)
      // 이미 큐에 있으므로 나중에 재시도
    })
  }
}
```

#### 2. 동기화 큐

```typescript
interface SyncQueueEntry {
  key: string
  value: JsonValue
  operation: 'set' | 'remove'
  timestamp: number
  retryCount: number
}

// 영구 저장 (localStorage)
private persistSyncQueue(): void {
  localStorage.setItem('__dual_write_sync_queue__', JSON.stringify(entries))
}
```

#### 3. 백그라운드 워커

```typescript
// 주기적 동기화 (5초 간격)
private startSyncWorker(): void {
  this.syncWorkerInterval = setInterval(() => {
    this.processSyncQueue().catch(error => {
      console.error('Sync worker error:', error)
    })
  }, 5000)
}
```

#### 4. 동기화 통계

```typescript
interface SyncStats {
  totalAttempts: number
  successCount: number
  failureCount: number
  queueSize: number
  pendingCount: number
  lastSyncAt: number | null
}

const stats = adapter.getSyncStats()
console.log(`Queue size: ${stats.queueSize}, Success rate: ${stats.successCount / stats.totalAttempts}`)
```

## 🔧 사용 패턴

### 기본 사용법 (직접 사용은 권장하지 않음)

```typescript
import { LocalStorageAdapter } from '@/lib/storage/adapters'

// StorageManager를 통해 간접적으로 사용하는 것을 권장
const adapter = new LocalStorageAdapter()
const data = await adapter.get('projects')
```

### StorageManager를 통한 사용 (권장)

```typescript
import { storageManager } from '@/lib/storage'

// StorageManager가 내부적으로 adapter 사용
const projects = await storageManager.get('projects')
```

### 어댑터 교체 (마이그레이션 시나리오)

```typescript
import { StorageManager, LocalStorageAdapter, SupabaseAdapter } from '@/lib/storage'

// Phase 1: LocalStorage만 사용
const localAdapter = new LocalStorageAdapter()
const storage = new StorageManager(localAdapter)

// Phase 2: Dual Write (LocalStorage + Supabase) ✅ 구현 완료
const supabaseAdapter = new SupabaseAdapter({ userId: 'user-123' })
const dualAdapter = new DualWriteAdapter({
  local: localAdapter,
  supabase: supabaseAdapter,
  syncInterval: 5000,
  enableSyncWorker: true
})
const storage = new StorageManager(dualAdapter)

// Phase 3: Supabase만 사용
const storage = new StorageManager(supabaseAdapter)
```

## 🚨 주의사항

### 1. 직접 사용 금지

```typescript
// ❌ Adapter를 직접 사용하지 마세요
const adapter = new LocalStorageAdapter()
await adapter.set('key', value)

// ✅ StorageManager를 통해 사용하세요
await storageManager.set('key', value)
```

### 2. QuotaExceededError 처리

```typescript
try {
  await storageManager.set('large-data', hugeData)
} catch (error) {
  if (error instanceof StorageError && error.code === 'SET_ERROR') {
    // 용량 초과 시 사용자에게 알림
    toast.error(error.userMessage || '저장 공간이 부족합니다')
    // 대안: 압축 강화, 오래된 데이터 삭제, IndexedDB 사용
  }
}
```

### 3. TypeGuard 활용

```typescript
import { isProject } from '@/lib/storage/types/entities/project'

// 타입 안전한 조회
const data = await adapter.get('projects', isProject)
// data는 Project[] 타입으로 추론됨
```

## 📊 성능 메트릭

### 압축 통계

```typescript
const stats = adapter.getCompressionStats()
console.log(stats)
// {
//   totalSaved: 500000,        // 절약된 총 바이트
//   averageRatio: 0.45,        // 평균 압축률
//   compressionCount: 100,     // 압축 횟수
//   averageCompressionTime: 5  // 평균 압축 시간 (ms)
// }
```

### LocalStorage 용량

```typescript
const sizeInBytes = adapter['calculateSize']()
const sizeInMB = sizeInBytes / (1024 * 1024)
console.log(`Storage size: ${sizeInMB.toFixed(2)} MB / 5-10 MB`)

if (sizeInMB > 8) {
  console.warn('Storage approaching limit!')
}
```

## 🔗 관련 문서

- **Core**: [`../core/claude.md`](../core/claude.md) - StorageManager
- **Types**: [`../types/claude.md`](../types/claude.md) - 타입 시스템
- **Utils**: [`../utils/claude.md`](../utils/claude.md) - CompressionManager

## 🚀 마이그레이션 시나리오 (Phase 10 완료)

### 단계별 전환

```typescript
// 1단계: LocalStorage만 사용 (현재)
const storage = new StorageManager(new LocalStorageAdapter())

// 2단계: Dual Write 전환 (안전한 병행 운영)
const dualAdapter = new DualWriteAdapter({
  local: new LocalStorageAdapter(),
  supabase: new SupabaseAdapter({ userId }),
  enableSyncWorker: true
})
const storage = new StorageManager(dualAdapter)

// 3단계: 검증 기간 (1-2주)
// - DualWrite 모드로 운영
// - 동기화 통계 모니터링
// - 데이터 무결성 확인

// 4단계: Supabase 단독 전환
const storage = new StorageManager(new SupabaseAdapter({ userId }))

// 5단계: LocalStorage 정리 (선택)
await localAdapter.clear()
```

### 동기화 모니터링

```typescript
const dualAdapter = new DualWriteAdapter(config)

// 통계 조회
const stats = dualAdapter.getSyncStats()
console.log(`
  Total: ${stats.totalAttempts}
  Success: ${stats.successCount} (${(stats.successCount / stats.totalAttempts * 100).toFixed(1)}%)
  Failed: ${stats.failureCount}
  Queue: ${stats.queueSize}
`)

// 강제 동기화
await dualAdapter.forceSyncAll()

// 워커 제어
dualAdapter.stopSyncWorker()
```

## 🔄 RealtimeAdapter (Phase 4 ✅)

### 개요

Supabase Realtime을 사용하여 실시간 동기화를 제공하는 어댑터입니다. WebSocket 기반 PostgreSQL Change Data Capture (CDC)를 통해 INSERT/UPDATE/DELETE 이벤트를 실시간으로 수신하고 LocalStorage를 자동 업데이트합니다.

### 주요 기능

#### 1. Realtime 채널 구독 (7개 테이블)

```typescript
class RealtimeAdapter {
  private supabase: SupabaseClient
  private userId: string
  private localAdapter: StorageAdapter
  private channels: Map<string, RealtimeChannel> = new Map()

  async subscribeAll(): Promise<void> {
    const entities = ['projects', 'tasks', 'events', 'clients', 'documents', 'settings', 'user']

    for (const entity of entities) {
      await this.subscribe(entity)
    }
  }

  private async subscribe(entity: string): Promise<void> {
    const tableName = ENTITY_TABLE_MAP[entity]
    const channelName = `${entity}_changes_${this.userId}`

    const channel = this.supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: tableName,
        filter: `user_id=eq.${this.userId}`,  // 사용자별 필터링 (RLS)
      }, (payload) => {
        this.handleRealtimeEvent(payload)
      })
      .subscribe()

    this.channels.set(entity, channel)
  }
}
```

#### 2. INSERT/UPDATE/DELETE 이벤트 핸들러

```typescript
private async handleInsert(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
  const entity = this.getEntityFromTable(payload.table)
  const newRecord = payload.new

  // LocalStorage 업데이트 (새 레코드 추가)
  await this.updateLocalStorage(entity, newRecord.id, newRecord)
}

private async handleUpdate(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
  const entity = this.getEntityFromTable(payload.table)
  const updatedRecord = payload.new

  // LocalStorage 업데이트 (기존 레코드 수정)
  await this.updateLocalStorage(entity, updatedRecord.id, updatedRecord)
}

private async handleDelete(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
  const entity = this.getEntityFromTable(payload.table)
  const deletedRecord = payload.old

  // LocalStorage 업데이트 (레코드 삭제)
  await this.updateLocalStorage(entity, deletedRecord.id, null)
}
```

#### 3. LocalStorage 자동 업데이트

```typescript
private async updateLocalStorage(
  entity: string,
  id: string,
  data: any | null
): Promise<void> {
  const currentArray = (await this.localAdapter.get(entity)) || []

  let updatedArray: any[]

  if (data === null) {
    // 삭제: ID와 일치하는 레코드 제거
    updatedArray = currentArray.filter((item: any) => item.id !== id)
  } else {
    // 추가/수정: ID로 기존 레코드 찾기
    const existingIndex = currentArray.findIndex((item: any) => item.id === id)

    if (existingIndex >= 0) {
      // 수정: 기존 레코드 교체
      updatedArray = [...currentArray]
      updatedArray[existingIndex] = data
    } else {
      // 추가: 새 레코드 추가
      updatedArray = [...currentArray, data]
    }
  }

  // LocalStorage 저장
  await this.localAdapter.set(entity, updatedArray)
}
```

#### 4. 연결 상태 모니터링 및 재연결

```typescript
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

getConnectionStatus(): ConnectionStatus {
  return this.connectionStatus
}

async reconnect(): Promise<void> {
  // 기존 채널 정리
  await this.unsubscribeAll()

  // 재구독
  await this.subscribeAll()
}
```

### 사용 예시

```typescript
const realtimeAdapter = new RealtimeAdapter({
  supabase,
  userId: 'user-123',
  localAdapter,
  onConnectionChange: (status) => console.log('Connection:', status),
  onError: (error) => console.error('Realtime error:', error)
})

// 모든 테이블 구독 시작
await realtimeAdapter.subscribeAll()

// 연결 상태 확인
const status = realtimeAdapter.getConnectionStatus()

// 구독 해제
await realtimeAdapter.unsubscribeAll()
```

## 📴 OfflineQueue (Phase 5 ✅)

### 개요

오프라인 상태에서 작업을 큐에 저장하고 온라인 복귀 시 처리하는 시스템입니다. LocalStorage 지속성을 통해 브라우저 재시작 후에도 큐가 유지됩니다.

### 주요 기능

#### 1. 오프라인 작업 큐잉

```typescript
interface QueueOperation {
  operationId: string
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  entity: string
  id: string
  data: any | null
  timestamp: number
  retryCount?: number
  error?: string
}

class OfflineQueue {
  private queue: QueueOperation[] = []
  private storageKey = 'weave_offline_queue'
  private maxSize = 1000
  private maxRetries = 3

  async enqueue(operation: Omit<QueueOperation, 'operationId' | 'retryCount'>): Promise<void> {
    // 큐 크기 제한 확인
    if (this.queue.length >= this.maxSize) {
      throw new Error('Queue is full')
    }

    // 중복 작업 제거 (동일 엔티티/ID)
    this.removeDuplicates(operation.entity, operation.id)

    // 큐에 추가
    const queueOperation: QueueOperation = {
      ...operation,
      operationId: this.generateOperationId(),
      retryCount: 0,
    }

    this.queue.push(queueOperation)

    // LocalStorage에 저장
    await this.saveToStorage()
  }
}
```

#### 2. 큐 처리 로직

```typescript
async processAll(
  processor: (operation: QueueOperation) => Promise<void>
): Promise<number> {
  let processedCount = 0

  while (this.queue.length > 0) {
    const operation = this.queue[0]

    try {
      // 작업 처리
      await processor(operation)

      // 성공 시 큐에서 제거
      await this.dequeue(operation.operationId)
      processedCount++
    } catch (error) {
      // 실패 시 재시도 횟수 증가
      operation.retryCount = (operation.retryCount || 0) + 1

      // 최대 재시도 횟수 초과 시 큐에서 제거
      if (operation.retryCount >= this.maxRetries) {
        await this.dequeue(operation.operationId)
      } else {
        // 재시도 가능하면 큐 끝으로 이동
        this.queue.shift()
        this.queue.push(operation)
        await this.saveToStorage()
      }
    }
  }

  return processedCount
}
```

#### 3. LocalStorage 지속성

```typescript
private loadFromStorage(): void {
  const stored = localStorage.getItem(this.storageKey)

  if (stored) {
    this.queue = JSON.parse(stored)
  }
}

private async saveToStorage(): Promise<void> {
  localStorage.setItem(this.storageKey, JSON.stringify(this.queue))
}
```

### 사용 예시

```typescript
const queue = new OfflineQueue({
  storageKey: 'offline_queue',
  maxSize: 1000,
  onQueueChange: (size) => console.log('Queue size:', size)
})

// 오프라인 작업 추가
await queue.enqueue({
  type: 'UPDATE',
  entity: 'projects',
  id: 'proj-123',
  data: { name: 'New Project' },
  timestamp: Date.now()
})

// 온라인 복귀 시 큐 처리
await queue.processAll(async (operation) => {
  await supabase.from(operation.entity).upsert(operation.data)
})
```

## 🌐 BidirectionalSyncAdapter Offline 지원 (Phase 5 ✅)

### 개요

BidirectionalSyncAdapter에 온라인/오프라인 감지 로직을 통합하여 네트워크 상태에 따라 자동으로 동작을 변경합니다.

### 주요 기능

#### 1. 온라인/오프라인 감지

```typescript
class BidirectionalSyncAdapter implements StorageAdapter {
  private offlineQueue: OfflineQueue
  private syncStatus: SyncStatus = {
    // ...
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    offlineQueueSize: 0,
  }

  constructor(options: BidirectionalSyncOptions) {
    // OfflineQueue 초기화
    this.offlineQueue = new OfflineQueue({
      storageKey: 'weave_offline_queue',
      maxSize: 1000,
      onQueueChange: (size) => {
        this.syncStatus.offlineQueueSize = size
      }
    })

    // 온라인/오프라인 이벤트 리스너 등록
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline())
      window.addEventListener('offline', () => this.handleOffline())
    }
  }
}
```

#### 2. 오프라인 모드 전환

```typescript
private handleOffline(): void {
  console.warn('Network offline detected')
  this.syncStatus.isOnline = false

  // 동기화 워커는 계속 실행, sync() 내부에서 온라인 체크
}

async set<T>(key: string, value: T): Promise<void> {
  // LocalStorage에 즉시 저장 (온라인/오프라인 상관없이)
  await this.local.set(key, value)

  if (this.syncStatus.isOnline) {
    // 온라인: Supabase 동기화 시도
    this.pushToSupabase(key, value).catch(...)
  } else {
    // 오프라인: OfflineQueue에 추가
    await this.offlineQueue.enqueue({
      type: 'UPDATE',
      entity: key,
      id: key,
      data: value,
      timestamp: Date.now(),
    })
  }
}
```

#### 3. 온라인 복귀 처리

```typescript
private async handleOnline(): Promise<void> {
  console.log('Network online detected')
  this.syncStatus.isOnline = true

  // 1. OfflineQueue 처리
  if (!this.offlineQueue.isEmpty()) {
    const processedCount = await this.offlineQueue.processAll(async (operation) => {
      await this.pushToSupabase(operation.entity, operation.data)
    })

    console.log(`Processed ${processedCount} offline operations`)
  }

  // 2. 양방향 동기화 재개
  await this.sync()
}
```

#### 4. 동기화 상태 확인

```typescript
async sync(): Promise<void> {
  // 오프라인 체크
  if (!this.syncStatus.isOnline) {
    console.log('Offline mode: Skipping sync')
    return
  }

  // ... 동기화 로직
}

isOnline(): boolean {
  return this.syncStatus.isOnline
}

getOfflineQueueSize(): number {
  return this.offlineQueue.size()
}
```

### 오프라인 모드 동작 흐름

```
1. 네트워크 연결 끊김
   ↓
2. handleOffline() 호출
   - isOnline = false 설정
   ↓
3. set() 호출 시
   - LocalStorage에 즉시 저장 ✅
   - Supabase 동기화 건너뛰기
   - OfflineQueue에 작업 추가 ✅
   ↓
4. 네트워크 연결 복구
   ↓
5. handleOnline() 호출
   - isOnline = true 설정
   - OfflineQueue.processAll() 실행
   - 큐의 모든 작업을 Supabase로 동기화
   - 양방향 동기화 재개
```

---

**Adapter 시스템은 스토리지 백엔드의 완전한 추상화를 제공하며, Phase 4-5 완료로 실시간 동기화 및 오프라인 지원 기능이 추가되었습니다.**

*마지막 업데이트: 2025-01-10*
*Phase 4 완료: RealtimeAdapter (464줄)*
*Phase 5 완료: OfflineQueue (376줄), BidirectionalSyncAdapter Offline 지원*
*Phase 10.1-10.2 완료: SupabaseAdapter, DualWriteAdapter*
