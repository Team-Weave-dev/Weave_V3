# DualWrite 모드 설계 결함 분석 및 해결 방안

**작성일**: 2025-10-10
**심각도**: Critical
**영향**: Multi-device 환경에서 데이터 무결성 손실

## 📋 목차

1. [문제 개요](#문제-개요)
2. [근본 원인 분석](#근본-원인-분석)
3. [Multi-Device 시나리오](#multi-device-시나리오)
4. [현재 아키텍처 분석](#현재-아키텍처-분석)
5. [해결 방안](#해결-방안)
6. [구현 로드맵](#구현-로드맵)
7. [참고 자료](#참고-자료)

---

## 문제 개요

### 🚨 발견된 문제

DualWrite 모드에서 **단방향 동기화(LocalStorage → Supabase)**만 구현되어, multi-device 환경에서 데이터 무결성이 보장되지 않습니다.

### 📊 영향 범위

- **데이터 무결성**: 삭제된 데이터가 부활하는 "Data Resurrection" 문제
- **다중 기기**: 여러 기기에서 동일 계정 사용 시 데이터 충돌
- **사용자 경험**: 삭제/수정 작업이 다른 기기에서 무효화됨
- **운영 리스크**: Production 환경에서 데이터 일관성 손실

---

## 근본 원인 분석

### 1. 단방향 동기화 설계

**현재 구조**:
```typescript
// DualWriteAdapter.ts
async set<T>(key: string, value: T): Promise<void> {
  // 1. LocalStorage에 즉시 저장 (SSOT)
  await this.local.set(key, value)

  // 2. Supabase로 단방향 동기화 (백그라운드)
  this.syncToSupabase(key, value, 'set').catch(error => {
    console.warn('Background sync failed:', error)
  })
}
```

**문제점**:
- ❌ LocalStorage가 Single Source of Truth (SSOT)로 고정
- ❌ Supabase → LocalStorage 동기화 없음
- ❌ 각 기기의 LocalStorage가 독립적으로 동작
- ❌ 충돌 해결 메커니즘 부재

### 2. 타임스탬프 기반 버전 관리 부재

**현재 엔티티 구조**:
```typescript
// 기존 타임스탬프는 존재하나 충돌 해결에 미사용
export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  date: string
  created_at?: string
  updated_at?: string  // ⚠️ 타임스탬프는 있으나 비교 로직 없음
}
```

**문제점**:
- ❌ `updated_at` 타임스탬프가 충돌 해결에 사용되지 않음
- ❌ Last Write Wins (LWW) 전략 미구현
- ❌ 어떤 기기가 최신 상태인지 판단 불가

### 3. Supabase Realtime 미활용

**현재 상태**:
- ❌ Supabase Realtime subscriptions 미구현
- ❌ 다른 기기의 변경사항을 실시간으로 감지 불가
- ❌ 동시 편집 시나리오 처리 불가

---

## Multi-Device 시나리오

### 🔴 시나리오 1: 데이터 부활 (Data Resurrection)

#### 타임라인

| 시간 | Computer A | Computer B | LocalStorage (A) | LocalStorage (B) | Supabase |
|------|------------|------------|------------------|------------------|----------|
| T0 | Event 생성 | - | `{id: 1, title: "회의"}` | - | `{id: 1}` ✅ |
| T1 | - | Event 다운로드 | `{id: 1}` | `{id: 1}` | `{id: 1}` |
| T2 | - | Event 삭제 | `{id: 1}` | `{}` (삭제) | `{}` (삭제됨) |
| T3 | 로그인 | - | `{id: 1}` ⚠️ | `{}` | `{}` |
| T4 | 백그라운드 동기화 | - | `{id: 1}` | `{}` | `{id: 1}` ❌ (부활!) |

#### 결과
- ✅ Computer B에서 삭제한 데이터가 Computer A에서 재생성됨
- ❌ 사용자의 삭제 의도가 무효화됨
- ❌ Supabase에 삭제된 데이터가 다시 나타남

### 🔴 시나리오 2: 동시 편집 충돌

#### 타임라인

| 시간 | Computer A | Computer B | LocalStorage (A) | LocalStorage (B) | Supabase |
|------|------------|------------|------------------|------------------|----------|
| T0 | Event 다운로드 | Event 다운로드 | `{id: 1, title: "회의"}` | `{id: 1, title: "회의"}` | `{id: 1, title: "회의"}` |
| T1 | 제목 수정: "중요 회의" | - | `{title: "중요 회의"}` | `{title: "회의"}` | `{title: "회의"}` |
| T2 | 백그라운드 동기화 | - | `{title: "중요 회의"}` | `{title: "회의"}` | `{title: "중요 회의"}` ✅ |
| T3 | - | 제목 수정: "긴급 회의" | `{title: "중요 회의"}` | `{title: "긴급 회의"}` | `{title: "중요 회의"}` |
| T4 | - | 백그라운드 동기화 | `{title: "중요 회의"}` | `{title: "긴급 회의"}` | `{title: "긴급 회의"}` ⚠️ |

#### 결과
- ❌ Computer A의 변경사항(`"중요 회의"`)이 손실됨
- ❌ Computer B의 변경사항(`"긴급 회의"`)이 덮어씀
- ❌ 타임스탬프 비교 없이 나중에 동기화된 것이 승리

### 🔴 시나리오 3: Offline 후 동기화 충돌

#### 타임라인

| 시간 | Computer A (Offline) | Computer B (Online) | LocalStorage (A) | LocalStorage (B) | Supabase |
|------|----------------------|---------------------|------------------|------------------|----------|
| T0 | Offline 상태 | Event 삭제 | `{id: 1}` | `{}` | `{}` (삭제됨) |
| T1 | Offline 상태 | - | `{id: 1}` | `{}` | `{}` |
| T2 | Online 복귀 | - | `{id: 1}` | `{}` | `{}` |
| T3 | 백그라운드 동기화 실행 | - | `{id: 1}` | `{}` | `{id: 1}` ❌ (부활!) |

#### 결과
- ❌ Offline 기기가 Online 복귀 시 stale 데이터 동기화
- ❌ 삭제된 데이터가 다시 생성됨
- ❌ Offline 큐에 쌓인 작업이 최신 상태를 무시함

---

## 현재 아키텍처 분석

### DualWriteAdapter 구조

```typescript
// src/lib/storage/adapters/DualWriteAdapter.ts
export class DualWriteAdapter implements StorageAdapter {
  private local: LocalStorageAdapter
  private supabase: SupabaseAdapter
  private syncInterval: number = 5000

  // ❌ 문제점 1: LocalStorage → Supabase만 동기화
  async set<T>(key: string, value: T): Promise<void> {
    await this.local.set(key, value)  // SSOT
    this.syncToSupabase(key, value, 'set')  // 단방향
  }

  // ❌ 문제점 2: Supabase → LocalStorage 동기화 없음
  async get<T>(key: string): Promise<T | null> {
    return this.local.get<T>(key)  // LocalStorage만 읽음
  }

  // ❌ 문제점 3: 삭제도 단방향
  async remove(key: string): Promise<void> {
    await this.local.remove(key)
    this.syncToSupabase(key, null, 'remove')
  }

  // ⏱️ 백그라운드 동기화 (5초마다)
  private startBackgroundSync(): void {
    setInterval(() => {
      this.syncPendingOperations()
    }, this.syncInterval)
  }
}
```

### 데이터 흐름도 (현재)

```
┌─────────────────┐      ┌─────────────────┐
│  Computer A     │      │  Computer B     │
│                 │      │                 │
│  LocalStorage A │      │  LocalStorage B │
│  (독립적)       │      │  (독립적)       │
└────────┬────────┘      └────────┬────────┘
         │                        │
         │ 단방향 동기화 (5초)    │
         │ LocalStorage → Supabase│
         ▼                        ▼
    ┌─────────────────────────────────┐
    │        Supabase Database        │
    │                                 │
    │  ❌ LocalStorage → Supabase만  │
    │  ❌ Supabase → LocalStorage 없음│
    └─────────────────────────────────┘

문제점:
1. LocalStorage가 SSOT로 고정
2. Supabase 변경사항이 LocalStorage에 반영되지 않음
3. 각 기기의 LocalStorage가 독립적으로 동작
4. 충돌 해결 메커니즘 부재
```

---

## 해결 방안

### Option 1: Immediate Fix - Supabase-only 모드 전환 (권장)

**개요**: DualWrite 모드를 비활성화하고 Supabase를 유일한 SSOT로 사용

#### 장점
- ✅ **즉시 적용 가능**: 코드 변경 최소화
- ✅ **데이터 일관성 보장**: Supabase가 유일한 진실 공급원
- ✅ **Multi-device 지원**: 자동으로 모든 기기에서 일관성 유지
- ✅ **간단한 구현**: 기존 SupabaseAdapter만 사용

#### 구현
```typescript
// src/lib/storage/index.ts
export async function initializeStorage(userId?: string): Promise<StorageManager> {
  if (userId) {
    // ✅ Supabase를 유일한 SSOT로 사용
    const supabaseAdapter = new SupabaseAdapter({ userId })
    return new StorageManager(supabaseAdapter)
  }

  // 비로그인 사용자는 LocalStorage만 사용
  const localAdapter = new LocalStorageAdapter()
  return new StorageManager(localAdapter)
}
```

#### 단점
- ⚠️ **네트워크 의존성**: Offline 시 동작 불가
- ⚠️ **성능**: 모든 읽기/쓰기가 네트워크 요청

#### 적용 시점
- **Phase 1**: 즉시 적용 (데이터 무결성 보장)
- **Phase 2**: Offline 지원 추가 (아래 Option 3 참조)

---

### Option 2: Last Write Wins (LWW) 전략 구현

**개요**: 타임스탬프 기반으로 최신 변경사항을 우선 적용

#### 아키텍처

```typescript
class BidirectionalSyncAdapter implements StorageAdapter {
  private local: LocalStorageAdapter
  private supabase: SupabaseAdapter

  // ✅ 쓰기: Supabase → LocalStorage 순서
  async set<T>(key: string, value: T): Promise<void> {
    const timestamp = new Date().toISOString()
    const versionedValue = { ...value, updated_at: timestamp }

    // 1. Supabase에 먼저 저장 (SSOT)
    await this.supabase.set(key, versionedValue)

    // 2. 성공 후 LocalStorage 업데이트
    await this.local.set(key, versionedValue)
  }

  // ✅ 읽기: 타임스탬프 비교로 최신 데이터 반환
  async get<T>(key: string): Promise<T | null> {
    const [localData, supabaseData] = await Promise.all([
      this.local.get<T>(key),
      this.supabase.get<T>(key)
    ])

    // 타임스탬프 비교
    if (!localData) return supabaseData
    if (!supabaseData) return localData

    const localTime = new Date(localData.updated_at || 0)
    const supabaseTime = new Date(supabaseData.updated_at || 0)

    // Last Write Wins
    return supabaseTime > localTime ? supabaseData : localData
  }

  // ✅ 주기적 양방향 동기화
  async syncFromSupabase(): Promise<void> {
    const keys = await this.getAllKeys()

    for (const key of keys) {
      const supabaseData = await this.supabase.get(key)
      const localData = await this.local.get(key)

      if (!supabaseData) {
        // Supabase에 없으면 LocalStorage에서 삭제
        await this.local.remove(key)
        continue
      }

      if (!localData || supabaseData.updated_at > localData.updated_at) {
        // Supabase가 더 최신이면 LocalStorage 업데이트
        await this.local.set(key, supabaseData)
      }
    }
  }
}
```

#### 데이터 흐름도 (개선안)

```
┌─────────────────┐      ┌─────────────────┐
│  Computer A     │      │  Computer B     │
│                 │      │                 │
│  LocalStorage A │      │  LocalStorage B │
│  (캐시)         │      │  (캐시)         │
└────────┬────────┘      └────────┬────────┘
         │                        │
         │ 양방향 동기화          │
         │ ↕ Timestamp 비교       │
         ▼                        ▼
    ┌─────────────────────────────────┐
    │    Supabase Database (SSOT)     │
    │                                 │
    │  ✅ 모든 쓰기는 Supabase 우선  │
    │  ✅ LocalStorage는 캐시 역할   │
    │  ✅ Timestamp로 충돌 해결      │
    └─────────────────────────────────┘
```

#### 장점
- ✅ **Multi-device 지원**: 타임스탬프로 충돌 자동 해결
- ✅ **성능 향상**: LocalStorage 캐시 활용
- ✅ **데이터 일관성**: Supabase를 SSOT로 사용
- ✅ **Offline 대응**: 로컬 캐시로 읽기 가능

#### 단점
- ⚠️ **구현 복잡도**: 양방향 동기화 로직 필요
- ⚠️ **충돌 해결 한계**: Last Write Wins는 데이터 손실 가능
- ⚠️ **타임스탬프 의존**: 기기 시간 동기화 필요

---

### Option 3: Supabase Realtime + Offline Queue

**개요**: Realtime subscriptions로 실시간 동기화 + Offline 큐 시스템

#### 아키텍처

```typescript
class RealtimeSyncAdapter implements StorageAdapter {
  private local: LocalStorageAdapter
  private supabase: SupabaseAdapter
  private offlineQueue: OfflineQueue
  private realtimeChannel: RealtimeChannel

  constructor() {
    this.setupRealtimeSubscription()
  }

  // ✅ Supabase Realtime 구독
  private setupRealtimeSubscription(): void {
    this.realtimeChannel = this.supabase
      .channel('calendar-events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'calendar_events'
      }, (payload) => {
        this.handleRealtimeChange(payload)
      })
      .subscribe()
  }

  // ✅ Realtime 변경사항 처리
  private async handleRealtimeChange(payload: RealtimePayload): Promise<void> {
    const { eventType, new: newData, old: oldData } = payload

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        // LocalStorage 업데이트
        await this.local.set(newData.id, newData)
        break
      case 'DELETE':
        // LocalStorage에서 삭제
        await this.local.remove(oldData.id)
        break
    }
  }

  // ✅ Offline 지원
  async set<T>(key: string, value: T): Promise<void> {
    try {
      // 1. Supabase에 먼저 저장
      await this.supabase.set(key, value)

      // 2. 성공 시 LocalStorage 업데이트
      await this.local.set(key, value)
    } catch (error) {
      // 3. 실패 시 Offline 큐에 추가
      this.offlineQueue.add({
        operation: 'set',
        key,
        value,
        timestamp: new Date().toISOString()
      })

      // 4. LocalStorage에는 저장 (Offline 작업)
      await this.local.set(key, value)
    }
  }

  // ✅ Online 복귀 시 큐 처리
  async processOfflineQueue(): Promise<void> {
    const operations = this.offlineQueue.getAll()

    for (const op of operations) {
      try {
        await this.supabase[op.operation](op.key, op.value)
        this.offlineQueue.remove(op.id)
      } catch (error) {
        console.error('Failed to sync offline operation:', error)
      }
    }
  }
}
```

#### 장점
- ✅ **실시간 동기화**: Supabase Realtime으로 즉시 반영
- ✅ **Offline 지원**: 큐 시스템으로 Offline 작업 처리
- ✅ **Multi-device**: 모든 기기에 실시간 업데이트
- ✅ **충돌 최소화**: Realtime으로 충돌 빈도 감소

#### 단점
- ⚠️ **복잡한 구현**: Realtime + Offline 큐 관리
- ⚠️ **리소스 사용**: WebSocket 연결 유지
- ⚠️ **비용**: Supabase Realtime 사용량 증가

---

## 구현 로드맵

### Phase 1: Immediate Fix (1-2일)

#### 목표
DualWrite 모드 비활성화 및 Supabase-only 모드 전환

#### 작업 내용
1. **DualWrite 비활성화**
   ```typescript
   // src/lib/storage/index.ts
   export async function initializeStorage(userId?: string): Promise<StorageManager> {
     if (userId) {
       const supabaseAdapter = new SupabaseAdapter({ userId })
       return new StorageManager(supabaseAdapter)
     }

     const localAdapter = new LocalStorageAdapter()
     return new StorageManager(localAdapter)
   }
   ```

2. **데이터 마이그레이션**
   - 기존 LocalStorage 데이터를 Supabase로 마이그레이션
   - 중복 데이터 제거
   - 타임스탬프 검증

3. **테스트**
   - Multi-device 시나리오 테스트
   - 데이터 일관성 검증
   - 성능 테스트

#### 성공 기준
- ✅ Multi-device 환경에서 데이터 일관성 보장
- ✅ 삭제된 데이터가 부활하지 않음
- ✅ 동시 편집 시 최신 상태 유지

---

### Phase 2: Timestamp System (3-5일)

#### 목표
타임스탬프 기반 충돌 해결 시스템 구현

#### 작업 내용
1. **엔티티 타임스탬프 추가**
   ```typescript
   export interface CalendarEvent {
     id: string
     user_id: string
     title: string
     date: string
     created_at: string
     updated_at: string
     updated_by: string  // 기기 식별자
   }
   ```

2. **Last Write Wins 구현**
   ```typescript
   class TimestampSyncAdapter {
     async resolveConflict(local: Entity, remote: Entity): Promise<Entity> {
       return new Date(remote.updated_at) > new Date(local.updated_at)
         ? remote
         : local
     }
   }
   ```

3. **동기화 로직 개선**
   - Supabase → LocalStorage 동기화 추가
   - 타임스탬프 비교 로직
   - 충돌 해결 전략

#### 성공 기준
- ✅ 동시 편집 시 타임스탬프로 충돌 해결
- ✅ 모든 엔티티에 타임스탬프 적용
- ✅ 충돌 해결 로그 기록

---

### Phase 3: Bidirectional Sync (1주)

#### 목표
양방향 동기화 시스템 구현

#### 작업 내용
1. **BidirectionalSyncAdapter 구현**
   - Supabase → LocalStorage 동기화
   - LocalStorage → Supabase 동기화
   - 주기적 동기화 (10초 간격)

2. **Sync 상태 관리**
   ```typescript
   interface SyncStatus {
     lastSyncTime: string
     pendingOperations: number
     syncErrors: SyncError[]
   }
   ```

3. **에러 처리**
   - 동기화 실패 시 재시도 로직
   - 에러 로깅 및 모니터링
   - 사용자 알림

#### 성공 기준
- ✅ 양방향 동기화 정상 작동
- ✅ 동기화 실패 시 자동 재시도
- ✅ 동기화 상태 모니터링

---

### Phase 4: Realtime Subscriptions (1-2주)

#### 목표
Supabase Realtime으로 실시간 동기화 구현

#### 작업 내용
1. **Realtime 채널 설정**
   ```typescript
   const channel = supabase
     .channel('calendar-events')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'calendar_events',
       filter: `user_id=eq.${userId}`
     }, handleRealtimeChange)
     .subscribe()
   ```

2. **실시간 업데이트 처리**
   - INSERT/UPDATE/DELETE 이벤트 처리
   - LocalStorage 자동 업데이트
   - UI 자동 갱신

3. **연결 관리**
   - WebSocket 연결 상태 모니터링
   - 재연결 로직
   - 에러 처리

#### 성공 기준
- ✅ 실시간 동기화 정상 작동
- ✅ 모든 기기에 즉시 반영
- ✅ WebSocket 연결 안정성

---

### Phase 5: Offline Support (1-2주)

#### 목표
Offline 모드 및 큐 시스템 구현

#### 작업 내용
1. **Offline 감지**
   ```typescript
   window.addEventListener('online', () => {
     this.processOfflineQueue()
   })

   window.addEventListener('offline', () => {
     this.switchToOfflineMode()
   })
   ```

2. **Offline 큐 시스템**
   ```typescript
   class OfflineQueue {
     add(operation: Operation): void
     getAll(): Operation[]
     remove(id: string): void
     clear(): void
   }
   ```

3. **충돌 해결 전략**
   - Offline 작업과 Online 작업 충돌 해결
   - 사용자 확인 다이얼로그
   - 자동 머지 전략

#### 성공 기준
- ✅ Offline 모드에서 정상 작동
- ✅ Online 복귀 시 자동 동기화
- ✅ 충돌 해결 UI 제공

---

## 참고 자료

### 관련 파일

- **DualWriteAdapter**: `src/lib/storage/adapters/DualWriteAdapter.ts`
- **SupabaseAdapter**: `src/lib/storage/adapters/SupabaseAdapter.ts`
- **LocalStorageAdapter**: `src/lib/storage/adapters/LocalStorageAdapter.ts`
- **StorageManager**: `src/lib/storage/core/StorageManager.ts`
- **엔티티 타입**: `src/lib/storage/types/entities/`

### 설계 문서

- **Storage System**: `src/lib/storage/claude.md`
- **Supabase Integration**: `docs/SUPABASE-INTEGRATION-PLAN.md`
- **Architecture**: `src/lib/storage/core/claude.md`

### 외부 참고 자료

- **Supabase Realtime**: https://supabase.com/docs/guides/realtime
- **Offline-First Architecture**: https://offlinefirst.org/
- **Conflict Resolution Strategies**: https://martin.kleppmann.com/papers/local-first.pdf
- **Last Write Wins**: https://en.wikipedia.org/wiki/Eventual_consistency

---

## 결론

DualWrite 모드의 설계 결함은 **단방향 동기화**와 **충돌 해결 메커니즘 부재**에서 비롯됩니다. 이를 해결하기 위해:

1. **즉시**: Supabase-only 모드로 전환하여 데이터 무결성 보장 (Phase 1)
2. **단기**: 타임스탬프 기반 충돌 해결 구현 (Phase 2-3)
3. **장기**: Realtime 동기화 및 Offline 지원 추가 (Phase 4-5)

이러한 단계적 접근을 통해 **데이터 일관성**을 보장하면서도 **사용자 경험**을 향상시킬 수 있습니다.

---

## Phase 5.5-5.6 완료: 충돌 해결 시스템 구현

**완료일**: 2025-10-10
**상태**: ✅ 완료
**커밋**: 977a3d1

### 📊 구현 개요

Phase 5의 선택 작업인 충돌 해결 UI(Phase 5.5)와 자동 머지 전략(Phase 5.6)을 완료했습니다. 이로써 Multi-device 환경에서 발생하는 데이터 충돌을 사용자가 직접 해결하거나 시스템이 자동으로 해결할 수 있는 완전한 시스템을 구축했습니다.

### 🔧 구현된 주요 컴포넌트

#### 1. ConflictResolutionModal.tsx (348줄)
**위치**: `src/components/ui/storage/ConflictResolutionModal.tsx`

**핵심 기능**:
- React Dialog 기반 모달 UI
- 4가지 해결 전략 선택 인터페이스
- 수동 필드 선택 시 side-by-side 비교 뷰
- 중앙화된 텍스트 시스템 통합 (`brand.ts`)

**해결 전략**:
```typescript
type ResolutionStrategy =
  | 'keep_local'       // 로컬 버전 유지
  | 'keep_remote'      // 원격 버전 유지
  | 'merge_auto'       // 자동 머지 (타임스탬프 기반)
  | 'merge_manual'     // 수동 머지 (사용자 선택)
  | 'cancel'           // 해결 취소
```

**UI 구성**:
- 충돌 타입 표시 (local_newer, remote_newer, both_modified, unknown)
- 타임스탬프 비교 뷰
- 필드별 차이점 강조 표시
- 수동 선택 시 체크박스 기반 필드 선택

#### 2. conflict.ts (156줄)
**위치**: `src/lib/storage/types/conflict.ts`

**타입 정의**:
```typescript
// 충돌 타입
type ConflictType =
  | 'local_newer'      // 로컬이 더 최신
  | 'remote_newer'     // 원격이 더 최신
  | 'both_modified'    // 5초 이내 동시 수정
  | 'unknown'          // 타임스탬프 판단 불가

// 충돌 데이터 구조
interface ConflictData<T> {
  key: string
  entity: string
  id?: string
  localVersion: T
  remoteVersion: T
  localTimestamp?: number
  remoteTimestamp?: number
  conflictType: ConflictType
  differences: FieldDifference[]    // 필드별 차이
  detectedAt: number
  userId?: string
}

// 해결 결과
interface ConflictResolution<T> {
  strategy: ResolutionStrategy
  resolvedData: T
  appliedAt: number
  manualChanges?: Partial<T>
}
```

**타입 가드**:
- `isConflictData()`: 충돌 데이터 검증
- `isConflictResolution()`: 해결 결과 검증
- `isFieldDifference()`: 필드 차이 검증

#### 3. ConflictResolver.ts (424줄)
**위치**: `src/lib/storage/utils/ConflictResolver.ts`

**핵심 메서드**:

```typescript
class ConflictResolver {
  // 충돌 감지
  detectConflict<T>(key: string, local: T, remote: T): ConflictDetectionResult<T>

  // 충돌 해결
  resolve<T>(conflict: ConflictData<T>, strategy: ResolutionStrategy): ConflictResolution<T>

  // 자동 머지 (필드별 타임스탬프 비교)
  private autoMerge<T>(local: T, remote: T, differences: FieldDifference[]): T

  // 수동 머지 (사용자 선택 필드 적용)
  private manualMerge<T>(local: T, manualChanges: Partial<T>): T

  // 통계 추적
  getStats(): ConflictStats
}
```

**충돌 감지 알고리즘**:
1. 데이터 동등성 검사 (deep equality)
2. 타임스탬프 추출 (updatedAt, modifiedDate, timestamp, createdAt 순)
3. 충돌 타입 결정:
   - 시간 차이 > 5초: local_newer 또는 remote_newer
   - 시간 차이 ≤ 5초: both_modified (동시 편집)
   - 타임스탬프 없음: unknown
4. 필드별 차이 분석
5. 자동 해결 가능 여부 판단

**자동 머지 전략**:
```typescript
// 필드별 타임스탬프 비교로 최신 값 선택
for (const diff of differences) {
  if (diff.hasConflict) {
    if (diff.remoteTimestamp && diff.localTimestamp) {
      // 타임스탬프가 있으면 최신 값 선택
      if (diff.remoteTimestamp > diff.localTimestamp) {
        merged[diff.field] = diff.remoteValue
      } else {
        merged[diff.field] = diff.localValue
      }
    } else {
      // 타임스탬프 없으면 원격 우선
      merged[diff.field] = diff.remoteValue
    }
  }
}

// 최종 updated_at은 두 버전 중 최신값
merged.updated_at = Math.max(localTimestamp, remoteTimestamp)
```

#### 4. BidirectionalSyncAdapter.ts 수정
**위치**: `src/lib/storage/adapters/BidirectionalSyncAdapter.ts`

**추가된 기능**:
```typescript
interface BidirectionalSyncOptions extends ConflictResolutionOptions {
  localAdapter: LocalStorageAdapter
  supabaseAdapter: SupabaseAdapter
  syncInterval?: number
  enableAutoSync?: boolean
  maxRetries?: number
  retryDelay?: number
}

interface ConflictResolutionOptions {
  autoResolve?: boolean           // 자동 해결 활성화
  preferNewest?: boolean          // 최신 버전 우선 (기본: true)
  onConflict?: (conflict: ConflictData) => void
  onResolved?: (resolution: ConflictResolution) => void
  onError?: (error: Error) => void
}
```

### 🐛 해결된 타입 에러 (4건)

모든 에러는 TypeScript의 spread operator 타입 안전성 관련 문제였으며, type guard를 추가하여 해결했습니다.

#### 에러 1-2: ConflictResolutionModal.tsx
**문제**: `conflict.localVersion` 타입이 `JsonValue`로, spread 연산 시 타입 검증 필요

**해결**:
```typescript
// Type guard 추가
if (typeof conflict.localVersion === 'object' &&
    conflict.localVersion !== null &&
    !Array.isArray(conflict.localVersion)) {
  resolvedData = {
    ...conflict.localVersion,
    ...manualData,
    updatedAt: new Date().toISOString(),
  } as JsonValue
} else {
  resolvedData = manualData as JsonValue
}
```

#### 에러 3-4: ConflictResolver.ts
**문제**: Generic 타입 `T extends JsonValue`에 대한 spread 연산

**해결**:
```typescript
// autoMerge 메서드
if (typeof local !== 'object' || local === null || Array.isArray(local)) {
  return local
}

const localObject = local as Record<string, JsonValue>
const merged = { ...localObject }

// manualMerge 메서드
if (typeof local !== 'object' || local === null || Array.isArray(local)) {
  return manualData as T
}

return {
  ...local,
  ...manualData,
  updatedAt: new Date().toISOString(),
} as T
```

### 📋 통합 테스트 문서

**파일**: `docs/CONFLICT-RESOLUTION-TESTING.md`

**포함 내용**:
1. **시나리오 1**: 충돌 감지 테스트
   - 동시 편집 시뮬레이션
   - 충돌 타입 검증
   - 필드 차이 분석 확인

2. **시나리오 2**: 자동 머지 테스트
   - `autoMerge()` 메서드 검증
   - 타임스탬프 기반 필드 선택
   - 결과 데이터 무결성 확인

3. **시나리오 3**: UI 테스트
   - 모달 렌더링 확인
   - 4가지 해결 전략 동작
   - 수동 선택 UI 검증

4. **시나리오 4**: 통합 테스트
   - BidirectionalSyncAdapter와 통합
   - End-to-end 충돌 해결 플로우
   - 에러 처리 및 복구

### 📊 구현 결과

#### 추가된 파일 (3개)
- `src/components/ui/storage/ConflictResolutionModal.tsx` (348줄)
- `src/lib/storage/types/conflict.ts` (156줄)
- `src/lib/storage/utils/ConflictResolver.ts` (424줄)

#### 수정된 파일 (1개)
- `src/lib/storage/adapters/BidirectionalSyncAdapter.ts` (충돌 해결 옵션 추가)

#### 총 코드 라인
- **신규 코드**: 928줄
- **수정 코드**: 58줄
- **총 변경**: 986줄

#### 빌드 및 검증
```bash
# 타입 체크 통과
npm run type-check  # ✅ 에러 0개

# 빌드 성공
npm run build       # ✅ 5.5초 완료

# Git 커밋 완료
git commit -m "feat(storage): Phase 5.5-5.6 충돌 해결 시스템 완료"
# 커밋 해시: 977a3d1
# 8 files changed, 1079 insertions(+), 58 deletions(-)
```

### 🎯 시스템 동작 원리

#### 충돌 발생 시 플로우

```
1. BidirectionalSyncAdapter에서 충돌 감지
   ↓
2. ConflictResolver.detectConflict() 호출
   ↓
3. 충돌 타입 결정 및 필드 분석
   ↓
4-1. autoResolve=true
   → ConflictResolver.resolve('merge_auto')
   → 자동 머지 완료

4-2. autoResolve=false
   → onConflict() 콜백 호출
   → ConflictResolutionModal 렌더링
   → 사용자 전략 선택
   → ConflictResolver.resolve(strategy)
   → 해결 완료
   ↓
5. onResolved() 콜백 호출
   ↓
6. 해결된 데이터로 동기화 재시도
```

#### 자동 해결 예시
```typescript
const dualAdapter = new BidirectionalSyncAdapter({
  local: localAdapter,
  supabase: supabaseAdapter,
  autoResolve: true,        // 자동 해결 활성화
  preferNewest: true,       // 최신 버전 우선
  onResolved: (resolution) => {
    console.log('Conflict auto-resolved:', resolution)
  }
})
```

#### 수동 해결 예시
```tsx
const [conflict, setConflict] = useState<ConflictData | null>(null)

const dualAdapter = new BidirectionalSyncAdapter({
  local: localAdapter,
  supabase: supabaseAdapter,
  autoResolve: false,       // 수동 해결
  onConflict: (conflictData) => {
    setConflict(conflictData)  // 모달 표시
  }
})

// UI에서
<ConflictResolutionModal
  conflict={conflict}
  onResolve={async (resolution) => {
    // 해결된 데이터로 저장
    await conflictResolver.applyResolution(resolution)
  }}
/>
```

### 🔍 추가 개선 가능 영역 (향후 고려사항)

#### 1. 고급 머지 전략
- **Three-way merge**: 공통 조상 버전 활용
- **Operational Transform**: 실시간 협업 편집 지원
- **CRDT (Conflict-free Replicated Data Types)**: 자동 충돌 방지

#### 2. UI 개선
- 변경 사항 diff 뷰 (코드 diff 스타일)
- 타임라인 뷰 (변경 히스토리 시각화)
- 미리보기 모드 (해결 결과 사전 확인)

#### 3. 성능 최적화
- 대용량 객체 충돌 처리 최적화
- 배치 충돌 해결 (여러 충돌 동시 처리)
- 백그라운드 자동 해결 큐

#### 4. 모니터링 및 분석
- 충돌 발생 빈도 추적
- 해결 전략별 성공률 분석
- 사용자 선호 전략 학습

### ✅ Phase 5 완료 요약

| Phase | 상태 | 설명 |
|-------|------|------|
| **5.1** | ✅ 완료 | OfflineQueue 클래스 구현 |
| **5.2** | ✅ 완료 | Offline 감지 이벤트 리스너 |
| **5.3** | ✅ 완료 | Offline 모드 전환 (LocalStorage 우선) |
| **5.4** | ✅ 완료 | Online 복귀 시 큐 처리 |
| **5.5** | ✅ 완료 | 충돌 해결 UI (ConflictResolutionModal) |
| **5.6** | ✅ 완료 | 자동 머지 전략 (ConflictResolver) |

**전체 Phase 5 달성률**: 100% (6/6 완료)

---

**작성자**: Claude Code
**검토**: 필요
**승인**: 대기 중
