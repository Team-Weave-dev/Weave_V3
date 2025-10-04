# adapters/ - Storage Adapter 시스템

## 📋 개요

이 디렉토리는 **Adapter 패턴**을 통해 다양한 스토리지 백엔드를 지원하는 어댑터 구현체들을 포함합니다. 현재 LocalStorageAdapter가 구현되어 있으며, 향후 SupabaseAdapter, NativeAdapter 등이 추가될 예정입니다.

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

## 🔮 향후 구현 예정 Adapters

### SupabaseAdapter (Phase 10)

```typescript
class SupabaseAdapter implements StorageAdapter {
  private supabase: SupabaseClient

  async get(key: string): Promise<any> {
    const [entity, ...params] = key.split(':')

    switch (entity) {
      case 'projects':
        const { data } = await this.supabase
          .from('projects')
          .select('*')
          .eq('user_id', this.userId)
        return data

      case 'project':
        const projectId = params[0]
        const { data: project } = await this.supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()
        return project

      // ... 다른 엔티티들
    }
  }

  async set(key: string, value: any): Promise<void> {
    const [entity] = key.split(':')

    switch (entity) {
      case 'projects':
        await this.supabase
          .from('projects')
          .upsert(value as any)
        break

      // ... 다른 엔티티들
    }
  }
}
```

### DualWriteAdapter (Phase 3)

```typescript
/**
 * 이중 쓰기 어댑터
 * - LocalStorage에 먼저 저장 (빠른 응답)
 * - Supabase에 비동기 동기화
 */
class DualWriteAdapter implements StorageAdapter {
  private local: LocalStorageAdapter
  private supabase: SupabaseAdapter

  async set(key: string, value: any): Promise<void> {
    // 1. LocalStorage에 먼저 저장
    await this.local.set(key, value)

    // 2. Supabase에 비동기 저장
    this.supabase.set(key, value).catch(error => {
      console.error('Supabase sync failed:', error)
      // 실패 시 재시도 큐에 추가
      this.addToRetryQueue(key, value)
    })
  }

  async get(key: string): Promise<any> {
    // LocalStorage에서 먼저 읽기 (빠른 응답)
    return this.local.get(key)
  }
}
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

// Phase 3: Dual Write (LocalStorage + Supabase)
const dualAdapter = new DualWriteAdapter(localAdapter, supabaseAdapter)
const storage = new StorageManager(dualAdapter)

// Phase 5: Supabase만 사용
const supabaseAdapter = new SupabaseAdapter()
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

---

**Adapter 시스템은 스토리지 백엔드의 완전한 추상화를 제공하며, 향후 Supabase 마이그레이션을 위한 견고한 기반입니다.**

*마지막 업데이트: 2025-10-05*
