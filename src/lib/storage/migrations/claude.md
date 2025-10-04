# migrations/ - 데이터 마이그레이션 시스템

## 📋 개요

이 디렉토리는 Storage 시스템의 **데이터 마이그레이션** 및 **버전 관리** 시스템을 포함합니다. 안전한 스키마 업데이트와 데이터 변환을 보장하며, 자동 백업 및 롤백 기능을 제공합니다.

## 🎯 마이그레이션 시스템의 역할

### 핵심 책임

- **스키마 버전 관리**: 데이터 구조 변경 추적 및 관리
- **안전한 데이터 변환**: 손실 없는 데이터 마이그레이션
- **자동 백업**: 마이그레이션 전 데이터 백업
- **롤백 지원**: 실패 시 이전 상태로 복구
- **Supabase 준비**: 향후 Supabase 마이그레이션 기반

## 📁 마이그레이션 구조

```
migrations/
├── 📋 claude.md                    # 🎯 이 파일 - 마이그레이션 가이드
├── MigrationManager.ts             # 마이그레이션 실행 엔진
├── SafeMigrationManager.ts         # 안전 마이그레이션 (자동 백업)
└── v1-to-v2.ts                     # v1→v2 마이그레이션 스크립트
```

## 🔧 MigrationManager - 마이그레이션 엔진

### 개요

마이그레이션 실행 및 버전 관리를 담당하는 핵심 클래스입니다.

### 주요 기능

```typescript
class MigrationManager {
  /**
   * 현재 마이그레이션 버전 조회
   * @returns 현재 버전 번호
   */
  async getCurrentVersion(): Promise<number>

  /**
   * 마이그레이션 실행
   * @param targetVersion - 목표 버전
   * @returns 마이그레이션 결과
   */
  async migrate(targetVersion: number): Promise<MigrationResult>

  /**
   * 마이그레이션 롤백
   * @param targetVersion - 롤백 목표 버전
   * @returns 롤백 결과
   */
  async rollback(targetVersion: number): Promise<MigrationResult>

  /**
   * 마이그레이션 등록
   * @param version - 버전 번호
   * @param migration - 마이그레이션 함수
   */
  registerMigration(version: number, migration: MigrationFn): void

  /**
   * 마이그레이션 이력 조회
   * @returns 마이그레이션 이력 배열
   */
  async getHistory(): Promise<MigrationHistory[]>
}
```

### 마이그레이션 결과 타입

```typescript
interface MigrationResult {
  success: boolean
  fromVersion: number
  toVersion: number
  executedMigrations: number[]
  errors?: string[]
  duration?: number  // 실행 시간 (ms)
}

interface MigrationHistory {
  version: number
  executedAt: string
  success: boolean
  duration: number
  error?: string
}
```

### 마이그레이션 등록 패턴

```typescript
// MigrationManager 초기화
const migrationManager = new MigrationManager(storageManager)

// 마이그레이션 등록
migrationManager.registerMigration(1, async (storage) => {
  // v0 → v1 마이그레이션 로직
  const projects = await storage.get<Project[]>('projects')
  // 데이터 변환...
  await storage.set('projects', transformedProjects)
})

migrationManager.registerMigration(2, async (storage) => {
  // v1 → v2 마이그레이션 로직
  const tasks = await storage.get<Task[]>('tasks')
  // 데이터 변환...
  await storage.set('tasks', transformedTasks)
})
```

## 🛡️ SafeMigrationManager - 안전 마이그레이션

### 개요

MigrationManager를 래핑하여 **자동 백업** 및 **실패 시 자동 복구** 기능을 제공하는 안전한 마이그레이션 시스템입니다.

### 핵심 특징

- **자동 백업**: 마이그레이션 전 전체 스토리지 백업
- **원자성 보장**: 성공 또는 전체 롤백
- **에러 복구**: 실패 시 백업으로 자동 복구
- **검증 시스템**: 마이그레이션 후 데이터 무결성 검증

### 주요 기능

```typescript
class SafeMigrationManager {
  /**
   * 안전한 마이그레이션 실행
   * - 자동 백업 생성
   * - 마이그레이션 실행
   * - 실패 시 자동 복구
   * @param targetVersion - 목표 버전
   * @returns 마이그레이션 결과
   */
  async migrate(targetVersion: number): Promise<SafeMigrationResult>

  /**
   * 백업에서 복구
   * @param backupKey - 백업 키
   * @returns 복구 결과
   */
  async restoreFromBackup(backupKey: string): Promise<RestoreResult>

  /**
   * 백업 목록 조회
   * @returns 백업 목록
   */
  async listBackups(): Promise<BackupInfo[]>

  /**
   * 백업 삭제
   * @param backupKey - 백업 키
   */
  async deleteBackup(backupKey: string): Promise<void>
}
```

### 안전 마이그레이션 결과 타입

```typescript
interface SafeMigrationResult extends MigrationResult {
  backupCreated: boolean
  backupKey?: string
  restored: boolean  // 실패 시 복구 여부
  validationPassed: boolean
}

interface BackupInfo {
  key: string
  version: number
  createdAt: string
  size: number  // bytes
  description?: string
}

interface RestoreResult {
  success: boolean
  backupKey: string
  restoredVersion: number
  error?: string
}
```

### 사용 예시

```typescript
import { safeMigrationManager } from '@/lib/storage/migrations'

// 안전한 마이그레이션 실행
const result = await safeMigrationManager.migrate(2)

if (result.success) {
  console.log(`Migration successful: v${result.fromVersion} → v${result.toVersion}`)
  console.log(`Backup created: ${result.backupKey}`)
} else {
  console.error('Migration failed and was rolled back:', result.errors)
  if (result.restored) {
    console.log('Data successfully restored from backup')
  }
}

// 백업 목록 조회
const backups = await safeMigrationManager.listBackups()
backups.forEach(backup => {
  console.log(`Backup: ${backup.key} (v${backup.version}) - ${backup.size} bytes`)
})
```

## 📦 v1-to-v2 마이그레이션

### 개요

기존 v1 스키마를 v2 스키마로 변환하는 마이그레이션 스크립트입니다.

### 주요 변경사항

#### 1. Project 스키마 변경

```typescript
// v1 → v2 변경사항
{
  // 추가된 필드
  + wbsTasks: WBSTask[]        // WBS 시스템 추가
  + settlementMethod?: string  // 정산 방식
  + paymentStatus?: string     // 수금 상태
  + totalAmount?: number       // 총 금액
  + documentStatus?: object    // 문서 현황

  // 제거된 필드
  - tasks?: string[]           // WBS로 대체
  - milestones?: object[]      // WBS로 통합
}
```

#### 2. Task 스키마 변경

```typescript
// v1 → v2 변경사항
{
  // 추가된 필드
  + parentTaskId?: string      // 부모 작업 참조
  + subtasks?: string[]        // 하위 작업 IDs
  + dependencies?: string[]    // 의존 작업 IDs
  + estimatedHours?: number    // 예상 시간
  + actualHours?: number       // 실제 소요 시간

  // 변경된 필드
  priority: 'low' | 'medium' | 'high'  // v1
       ↓
  priority: 'low' | 'medium' | 'high' | 'urgent'  // v2 (urgent 추가)
}
```

#### 3. CalendarEvent 스키마 변경

```typescript
// v1 → v2 변경사항
{
  // 추가된 필드
  + recurring?: RecurringPattern  // 반복 이벤트 지원
  + timezone?: string             // 타임존 지원
  + category?: string             // 카테고리 분류

  // 필수 검증 추가
  startDate <= endDate  // 날짜 범위 검증 강제
}
```

### 마이그레이션 함수

```typescript
async function migrateV1ToV2(storage: StorageManager): Promise<void> {
  // 1. 프로젝트 마이그레이션
  const projects = await storage.get<any[]>('projects') || []
  const migratedProjects = projects.map(project => ({
    ...project,
    wbsTasks: convertTasksToWBS(project.tasks || []),
    settlementMethod: 'not_set',
    paymentStatus: 'not_started',
    documentStatus: {},
    // 제거된 필드 삭제
    tasks: undefined,
    milestones: undefined
  }))
  await storage.set('projects', migratedProjects)

  // 2. 작업 마이그레이션
  const tasks = await storage.get<any[]>('tasks') || []
  const migratedTasks = tasks.map(task => ({
    ...task,
    parentTaskId: null,
    subtasks: [],
    dependencies: [],
    estimatedHours: 0,
    actualHours: 0
  }))
  await storage.set('tasks', migratedTasks)

  // 3. 캘린더 이벤트 마이그레이션
  const events = await storage.get<any[]>('events') || []
  const migratedEvents = events.map(event => ({
    ...event,
    recurring: null,
    timezone: 'UTC',
    category: 'work'
  }))
  await storage.set('events', migratedEvents)

  // 4. 버전 업데이트
  await storage.set('migration_version', 2)
}
```

## 🔄 마이그레이션 실행 플로우

### 1. 표준 마이그레이션 플로우

```
┌─────────────────┐
│ getCurrentVersion│
└────────┬────────┘
         ↓
┌─────────────────┐
│ migrate(target) │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Execute Scripts │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Update Version  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Return Result   │
└─────────────────┘
```

### 2. 안전 마이그레이션 플로우

```
┌─────────────────┐
│  Create Backup  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Execute Migration│
└────────┬────────┘
         ├─ Success ─→ Validate ─→ Return
         │
         └─ Failure ─→ Restore ─→ Return Error
```

## 🚀 사용 패턴

### 기본 마이그레이션

```typescript
import { migrationManager } from '@/lib/storage/migrations'

// 현재 버전 확인
const currentVersion = await migrationManager.getCurrentVersion()
console.log(`Current version: ${currentVersion}`)

// 최신 버전으로 마이그레이션
const result = await migrationManager.migrate(2)

if (result.success) {
  console.log(`Migrated from v${result.fromVersion} to v${result.toVersion}`)
  console.log(`Executed ${result.executedMigrations.length} migrations`)
} else {
  console.error('Migration failed:', result.errors)
}
```

### 안전 마이그레이션 (권장)

```typescript
import { safeMigrationManager } from '@/lib/storage/migrations'

// 안전한 마이그레이션 실행
const result = await safeMigrationManager.migrate(2)

if (result.success) {
  console.log('✅ Migration successful')
  console.log(`Backup: ${result.backupKey}`)
  console.log(`Validation: ${result.validationPassed ? 'PASS' : 'FAIL'}`)
} else {
  console.error('❌ Migration failed')
  console.log(`Restored: ${result.restored}`)
  console.error('Errors:', result.errors)
}
```

### 백업 관리

```typescript
// 백업 목록 조회
const backups = await safeMigrationManager.listBackups()
console.log(`Total backups: ${backups.length}`)

// 수동 복구
const restoreResult = await safeMigrationManager.restoreFromBackup(backupKey)
if (restoreResult.success) {
  console.log(`Restored to version ${restoreResult.restoredVersion}`)
}

// 오래된 백업 정리
const oldBackups = backups.filter(b => {
  const age = Date.now() - new Date(b.createdAt).getTime()
  return age > 30 * 24 * 60 * 60 * 1000  // 30일 이상
})
for (const backup of oldBackups) {
  await safeMigrationManager.deleteBackup(backup.key)
}
```

### 애플리케이션 시작 시 자동 마이그레이션

```typescript
// app/layout.tsx 또는 초기화 코드
import { safeMigrationManager } from '@/lib/storage/migrations'

async function initializeApp() {
  try {
    // 최신 버전으로 자동 마이그레이션
    const currentVersion = await safeMigrationManager.getCurrentVersion()
    const targetVersion = 2  // 최신 버전

    if (currentVersion < targetVersion) {
      console.log(`Migrating from v${currentVersion} to v${targetVersion}...`)
      const result = await safeMigrationManager.migrate(targetVersion)

      if (result.success) {
        console.log('✅ Migration completed successfully')
      } else {
        throw new Error('Migration failed: ' + result.errors?.join(', '))
      }
    } else {
      console.log(`Already at latest version (v${currentVersion})`)
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
    // 에러 처리: 사용자에게 알림, 복구 시도 등
  }
}
```

## 🚨 주의사항

### 1. SafeMigrationManager 사용 (필수)

```typescript
// ✅ SafeMigrationManager 사용 (권장)
import { safeMigrationManager } from '@/lib/storage/migrations'
const result = await safeMigrationManager.migrate(2)

// ❌ MigrationManager 직접 사용 (위험)
import { migrationManager } from '@/lib/storage/migrations'
const result = await migrationManager.migrate(2)  // 백업 없음!
```

### 2. 마이그레이션 전 백업 확인

```typescript
// 수동 백업 생성 (선택사항)
const backups = await safeMigrationManager.listBackups()
const hasRecentBackup = backups.some(b => {
  const age = Date.now() - new Date(b.createdAt).getTime()
  return age < 24 * 60 * 60 * 1000  // 24시간 이내
})

if (!hasRecentBackup) {
  console.warn('⚠️ No recent backup found. Creating manual backup...')
  // SafeMigrationManager가 자동으로 백업 생성
}
```

### 3. 마이그레이션 테스트

```typescript
// 프로덕션 전 테스트 환경에서 먼저 실행
if (process.env.NODE_ENV === 'production') {
  // 추가 확인
  const confirmed = await confirmMigration()
  if (!confirmed) {
    throw new Error('Migration cancelled by user')
  }
}

const result = await safeMigrationManager.migrate(targetVersion)
```

### 4. 버전 스킵 금지

```typescript
// ✅ 순차적 마이그레이션
await safeMigrationManager.migrate(1)  // v0 → v1
await safeMigrationManager.migrate(2)  // v1 → v2

// ❌ 버전 스킵 (데이터 손상 위험)
// await safeMigrationManager.migrate(2)  // v0 → v2 직접 (금지)
```

### 5. 롤백 제한

```typescript
// ✅ 백업이 있는 경우에만 롤백 가능
const backups = await safeMigrationManager.listBackups()
const hasBackup = backups.some(b => b.version === targetVersion)

if (hasBackup) {
  await safeMigrationManager.rollback(targetVersion)
} else {
  console.error('No backup available for rollback')
}

// ❌ 백업 없이 롤백 시도 (실패)
```

## 📊 마이그레이션 전략

### Phase별 마이그레이션 계획

#### Phase 9: LocalStorage 완성 (현재)
- ✅ v1-to-v2 마이그레이션 완료
- ✅ SafeMigrationManager 구현
- ✅ 자동 백업/복구 시스템

#### Phase 10: Supabase 준비
- 🔄 v2-to-supabase 마이그레이션 스크립트
- 🔄 DualWriteAdapter 구현
- 🔄 실시간 동기화 테스트

#### Phase 11: Supabase 마이그레이션
- 🔄 LocalStorage → Supabase 완전 전환
- 🔄 데이터 검증 및 무결성 확인
- 🔄 성능 모니터링

## 🔗 관련 문서

- **Core**: [`../core/claude.md`](../core/claude.md) - StorageManager
- **Types**: [`../types/claude.md`](../types/claude.md) - 엔티티 스키마
- **Utils**: [`../utils/claude.md`](../utils/claude.md) - BackupManager
- **Migration Plan**: [`../../../docs/LOCAL-STORAGE-MIGRATION.md`](../../../docs/LOCAL-STORAGE-MIGRATION.md)

---

**마이그레이션 시스템은 안전한 데이터 변환과 버전 관리를 보장하며, Supabase 전환을 위한 견고한 기반을 제공합니다.**

*마지막 업데이트: 2025-10-05*
