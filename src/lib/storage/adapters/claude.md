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

---

**Adapter 시스템은 스토리지 백엔드의 완전한 추상화를 제공하며, Phase 10 완료로 Supabase 마이그레이션을 위한 견고한 기반이 구축되었습니다.**

*마지막 업데이트: 2025-01-07*
*Phase 10.1-10.2 완료: SupabaseAdapter, DualWriteAdapter*
