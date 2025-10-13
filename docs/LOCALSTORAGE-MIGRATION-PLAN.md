# LocalStorage 마이그레이션 계획 (Phase 16 → Phase 17+)

## 문서 목적
Phase 16에서 인증 필수화와 LocalStorage fallback 제거를 완료했습니다.
이 문서는 남아있는 localStorage 직접 사용을 Supabase로 완전히 이전하기 위한 단계별 계획을 정의합니다.

---

## Phase 16 완료 사항 (2025-10-13)

### ✅ 완료된 작업
1. **storage/index.ts**
   - `initializeStorage()`: 인증 필수화 구현
   - `fallbackToLocalStorageMode()` 함수 제거
   - `getStorageOrDefault()`: LocalStorage fallback 제거

2. **StorageInitializer.tsx**
   - 비인증 사용자 자동 `/login` 리다이렉트

3. **base.ts**
   - `StorageErrorCode`에 `AUTH_REQUIRED`, `STORAGE_NOT_INITIALIZED` 추가

4. **검증 완료**
   - lint, type-check, build 모두 통과

### 현재 상태
- ✅ 인증 필수 아키텍처 구현 완료
- ✅ Supabase = Single Source of Truth
- ⚠️ 일부 컴포넌트에서 localStorage 직접 사용 중 (아래 참조)

---

## localStorage 직접 사용 현황 분석

### 1. useProjectTable.ts (프로젝트 테이블 설정)
**파일**: `src/lib/hooks/useProjectTable.ts`

**사용 위치**:
- Line 64: `localStorage.getItem(STORAGE_KEY)` - 설정 로드
- Line 119: `localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig))` - 설정 저장

**저장 데이터**:
```typescript
interface ProjectTableConfig {
  columns: ProjectTableColumn[];      // 컬럼 표시/숨김 설정
  filters: TableFilterState;          // 필터 상태
  sort: TableSortState;                // 정렬 설정
  pagination: {                        // 페이지네이션 설정
    page: number;
    pageSize: number;
    total: number;
  };
}
```

**스토리지 키**: `'weave-project-table-config'`

**마이그레이션 필요 여부**: ✅ **필요**
- 사용자별 UI 설정이므로 Supabase Settings로 이전 권장

---

### 2. DashboardService.ts (대시보드 레거시 데이터)
**파일**: `src/lib/storage/services/DashboardService.ts`

**사용 위치**:
- Line 150: `window.localStorage.getItem(this.legacyKey)` - 레거시 데이터 읽기
- Line 173: `window.localStorage.removeItem(this.legacyKey)` - 마이그레이션 후 삭제

**목적**:
- 레거시 대시보드 데이터를 Storage 시스템으로 마이그레이션
- 마이그레이션 완료 후 localStorage 키 자동 삭제

**마이그레이션 필요 여부**: ⚠️ **이미 마이그레이션 로직 내장**
- 현재 코드가 자동으로 localStorage → StorageManager 이전 수행
- **추가 작업 불필요**

---

### 3. deviceId.ts (디바이스 식별자)
**파일**: `src/lib/storage/utils/deviceId.ts`

**사용 위치**:
- Line 34: `localStorage.getItem(DEVICE_ID_KEY)` - 디바이스 ID 읽기
- Line 39: `localStorage.setItem(DEVICE_ID_KEY, deviceId)` - 디바이스 ID 저장
- Line 61: `localStorage.setItem(DEVICE_ID_KEY, newDeviceId)` - ID 리셋

**목적**:
- 브라우저별 고유 식별자 생성 및 저장
- 멀티 디바이스 환경에서 디바이스 추적

**스토리지 키**: `'weave-device-id'`

**마이그레이션 필요 여부**: ⚠️ **특수 케이스**
- 디바이스 ID는 **브라우저/디바이스별로 고유**해야 함
- Supabase로 이전 시 사용자별 설정이 아닌 디바이스별 설정 필요
- **권장**: localStorage 유지 (디바이스 로컬 식별자이므로)

---

### 4. compression.ts (스토리지 사용량 측정)
**파일**: `src/lib/storage/utils/compression.ts`

**사용 위치**:
- Line 213: `localStorage.length` - 항목 개수
- Line 214: `localStorage.key(i)` - 키 조회
- Line 216: `localStorage.getItem(key)` - 값 조회

**목적**:
- `getStorageUsage()` 함수에서 localStorage 사용량 측정
- 압축 최적화 판단을 위한 유틸리티

**마이그레이션 필요 여부**: ⚠️ **유틸리티 함수**
- LocalStorageAdapter에서만 사용
- Supabase 모드에서는 호출되지 않음
- **권장**: 현재 상태 유지 (LocalStorageAdapter 전용 유틸)

---

## 마이그레이션 우선순위

### 🔴 High Priority (Phase 17 - 1~2개월)
**1. useProjectTable.ts**
- **이유**: 사용자별 UI 설정이므로 멀티 디바이스 동기화 필요
- **목표**: Supabase Settings에 `project_table_config` 추가
- **예상 작업량**: 2~3일

**작업 내용**:
1. Settings 타입에 `projectTableConfig` 필드 추가
2. SettingsService에 get/set 메서드 추가
3. useProjectTable 훅에서 localStorage → SettingsService로 변경
4. 기존 localStorage 데이터 자동 마이그레이션 로직 추가

---

### 🟡 Medium Priority (Phase 18 - 2~3개월)
**2. deviceId.ts 결정**
- **이유**: 디바이스 식별자 전략 재검토 필요
- **옵션 A**: localStorage 유지 (브라우저별 고유 ID)
- **옵션 B**: Supabase로 이전 (사용자별 디바이스 목록 관리)
- **예상 작업량**: 1~2일 (전략 결정 후)

**권장 방향**:
- **옵션 A 채택**: 디바이스 ID는 로컬 식별자로 유지
- 이유: 멀티 디바이스 환경에서 각 디바이스는 고유 ID가 필요
- Supabase에는 `user_devices` 테이블로 디바이스 목록 관리 가능

---

### 🟢 Low Priority (유지 또는 제거 검토)
**3. DashboardService.ts 레거시 마이그레이션**
- **상태**: 이미 자동 마이그레이션 구현됨
- **작업**: 필요 없음 (현재 코드로 충분)

**4. compression.ts 유틸리티**
- **상태**: LocalStorageAdapter 전용 유틸
- **작업**: Phase 19 (LocalStorageAdapter 완전 제거 시) 함께 제거

---

## Phase 17: useProjectTable → Supabase 마이그레이션

### Step 1: Settings 타입 확장

**파일**: `src/lib/storage/types/entities/settings.ts`

```typescript
export interface Settings extends BaseEntity {
  userId: string;
  dashboardWidgets: DashboardWidget[];
  dashboardLayout: DashboardLayout;

  // 🆕 추가
  projectTableConfig?: ProjectTableConfig;
}

// 🆕 추가
export interface ProjectTableConfig {
  columns: Array<{
    id: string;
    label: string;
    visible: boolean;
    width?: number;
    pinned?: boolean;
  }>;
  filters: {
    searchQuery: string;
    statusFilter: string;
    clientFilter: string;
    customFilters: Record<string, any>;
  };
  sort: {
    column: string;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

---

### Step 2: SettingsService 확장

**파일**: `src/lib/storage/services/SettingsService.ts`

```typescript
/**
 * Get project table configuration
 */
async getProjectTableConfig(): Promise<ProjectTableConfig | null> {
  const settings = await this.get();
  return settings?.projectTableConfig || null;
}

/**
 * Update project table configuration
 */
async updateProjectTableConfig(config: ProjectTableConfig): Promise<void> {
  await this.update({ projectTableConfig: config });
}
```

---

### Step 3: useProjectTable 마이그레이션

**파일**: `src/lib/hooks/useProjectTable.ts`

**변경 사항**:
1. `localStorage.getItem/setItem` → `settingsService.getProjectTableConfig/updateProjectTableConfig`
2. 초기 로드 시 localStorage → Supabase 자동 마이그레이션
3. 하이드레이션 로직 유지 (SSR 대응)

**마이그레이션 로직**:
```typescript
// 1회성 마이그레이션: localStorage → Supabase
useEffect(() => {
  async function migrateFromLocalStorage() {
    if (!isHydrated) return;

    const supabaseConfig = await settingsService.getProjectTableConfig();
    if (supabaseConfig) {
      // 이미 Supabase에 있으면 사용
      return;
    }

    // localStorage에서 읽기
    const localConfig = localStorage.getItem(STORAGE_KEY);
    if (localConfig) {
      const parsedConfig = JSON.parse(localConfig);

      // Supabase에 저장
      await settingsService.updateProjectTableConfig(parsedConfig);

      // localStorage 삭제
      localStorage.removeItem(STORAGE_KEY);

      console.log('✅ Project table config migrated to Supabase');
    }
  }

  migrateFromLocalStorage();
}, [isHydrated]);
```

---

### Step 4: Supabase 마이그레이션

**파일**: `supabase/migrations/YYYYMMDDHHMMSS_add_project_table_config_to_settings.sql`

```sql
-- Settings 테이블에 project_table_config 컬럼 추가
ALTER TABLE settings
ADD COLUMN project_table_config JSONB DEFAULT NULL;

-- 인덱스 추가 (성능 최적화)
CREATE INDEX idx_settings_project_table_config
ON settings USING gin (project_table_config);

-- 코멘트 추가
COMMENT ON COLUMN settings.project_table_config IS
'프로젝트 테이블 UI 설정 (컬럼, 필터, 정렬, 페이지네이션)';
```

---

## Phase 18: deviceId 전략 결정 ✅ (완료 - 2025-10-13)

### ✅ 결정: Option A 채택 (localStorage 유지)

**선택 이유**:
1. **디바이스별 고유성 보장**: 각 브라우저는 고유 ID가 필요 (사용자 기반이 아님)
2. **Audit Trail 목적**: BaseService가 create/update 시 자동으로 device_id 추가
3. **성능**: localStorage 동기 읽기로 즉시 사용 가능 (네트워크 지연 없음)
4. **안정성**: 이미 잘 작동하는 시스템 유지
5. **복잡도 최소화**: 추가 테이블이나 동기화 로직 불필요

**사용 현황**:
- `src/lib/storage/services/BaseService.ts`
  - Line 68: create() - 엔티티 생성 시 device_id 추가
  - Line 122: update() - 엔티티 수정 시 device_id 추가
  - Line 75, 111: createMany/updateMany - 배치 작업 시 device_id 추가

**구현**: 현재 상태 유지 (추가 작업 불필요)

---

### Option A: localStorage 유지 (✅ 채택)

**장점**:
- 브라우저별 고유 ID 유지
- 추가 마이그레이션 불필요
- 간단하고 안정적
- 동기 API로 성능 우수

**단점**:
- localStorage 의존성 유지 (단, 디바이스 로컬 식별자이므로 적절함)

**구현**: 현재 상태 유지

---

### Option B: Supabase로 이전 (❌ 기각)

**Supabase 테이블 설계**:
```sql
CREATE TABLE user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT, -- 'browser', 'mobile', etc.
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, device_id)
);

-- RLS 정책
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own devices"
ON user_devices
FOR ALL
USING (auth.uid() = user_id);
```

**장점**:
- 사용자별 디바이스 목록 관리
- 멀티 디바이스 동기화
- 디바이스 히스토리 추적

**단점**:
- 추가 테이블 필요
- 구현 복잡도 증가
- 로그아웃/재로그인 시 동일 브라우저에 새 ID 할당 문제
- 네트워크 지연으로 초기 device_id 조회 실패 가능

**기각 사유**:
- 디바이스 ID는 **브라우저 로컬 식별자**로 유지하는 것이 더 적합
- 사용자별 디바이스 관리가 필요하다면 별도 기능으로 추가 가능

---

## Phase 19: LocalStorageAdapter 완전 제거 (3개월 이후) ⏳

### 현황 분석 (2025-10-13)

**LocalStorageAdapter 사용처**:
1. `src/lib/storage/adapters/LocalStorageAdapter.ts` - 클래스 정의
2. `src/lib/storage/migrations/v2-to-supabase.ts` - 마이그레이션 유틸 (import만)
3. `src/lib/storage/index.ts` - MigrationManager용 (line 130)

**관련 유틸리티**:
- `src/lib/storage/utils/compression.ts` - getStorageUsage() 함수
- `src/lib/storage/utils/deviceId.ts` - ✅ 유지 (Phase 18 결정)

### 제거 전 조건 확인

#### 필수 조건
- [x] useProjectTable Supabase 마이그레이션 완료 (Phase 17)
- [ ] **모든 사용자 Supabase 모드 전환 확인** (배포 후 3개월)
- [ ] **레거시 데이터 마이그레이션 완료 확인** (로그 분석 필요)
- [ ] **LocalStorage 사용률 0% 확인** (모니터링 필요)

#### 데이터 안전성 검증
```typescript
// 배포 후 모니터링 필요 지표
const metrics = {
  // 1. LocalStorage 사용자 수
  localStorageUsers: 0,  // 목표: 0명

  // 2. 마이그레이션 성공률
  migrationSuccessRate: 100,  // 목표: 100%

  // 3. Supabase 전용 사용자 수
  supabaseOnlyUsers: 1000,  // 목표: 전체 사용자

  // 4. 마이그레이션 실패 케이스
  migrationErrors: 0,  // 목표: 0건
};
```

### 제거 계획

#### Step 1: LocalStorageAdapter.ts 제거
```bash
# 파일 제거
rm src/lib/storage/adapters/LocalStorageAdapter.ts

# import 제거
# src/lib/storage/index.ts:
# - import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
# - const localAdapterForMigration = new LocalStorageAdapter(STORAGE_CONFIG);
```

#### Step 2: v2-to-supabase.ts 정리
```typescript
// Before
import type { LocalStorageAdapter } from '../adapters/LocalStorageAdapter';

export async function migrateToSupabase(
  localAdapter: LocalStorageAdapter,
  supabaseAdapter: SupabaseAdapter,
  userId: string,
  onProgress?: MigrationProgressCallback
): Promise<MigrationResult>

// After - 제거 (더 이상 마이그레이션 불필요)
// 파일 전체 삭제 또는 deprecated 마킹
```

#### Step 3: compression.ts getStorageUsage() 정리
```typescript
// 현재: localStorage 전용 함수
export function getStorageUsage(): {
  used: number;
  available: number;
  percentage: number;
  formattedUsed: string;
  formattedAvailable: string;
}

// 제거 또는 Supabase 버전으로 대체
// (Supabase storage quota API 사용)
```

#### Step 4: MigrationManager 정리
```typescript
// src/lib/storage/index.ts
// 마이그레이션 시스템 전체 제거 또는 간소화
// - v1-to-v2 마이그레이션 제거
// - LocalStorage 관련 마이그레이션 제거
```

### 제거 후 구조
```
src/lib/storage/
├── adapters/
│   ├── SupabaseAdapter.ts     ✅ 유일한 어댑터
│   ├── RealtimeAdapter.ts     ✅ 유지 (Supabase Realtime)
│   └── OfflineQueue.ts         ✅ 유지 (오프라인 큐)
├── core/
│   ├── StorageManager.ts       ✅ 유지
│   └── EventSystem.ts          ✅ 유지
├── migrations/
│   ├── MigrationManager.ts     ⚠️ 간소화
│   └── SafeMigrationManager.ts ⚠️ 간소화
├── services/
│   └── ... (모든 서비스)        ✅ 유지
├── types/
│   └── ... (타입 정의)          ✅ 유지
└── utils/
    ├── BackupManager.ts        ✅ 유지
    ├── CacheLayer.ts           ✅ 유지
    ├── IndexManager.ts         ✅ 유지
    ├── batch.ts                ✅ 유지
    ├── compression.ts          ⚠️ getStorageUsage() 제거
    └── deviceId.ts             ✅ 유지 (Phase 18 결정)
```

### 위험 요소 및 대응

#### 위험 1: 레거시 사용자 데이터 손실
**대응**:
- 제거 전 3개월 이상 마이그레이션 기간 확보
- 로그인 시 마이그레이션 자동 실행
- 마이그레이션 실패 시 에러 알림

#### 위험 2: 오프라인 사용자 문제
**대응**:
- OfflineQueue 유지 (Supabase 연결 실패 대응)
- CacheLayer 유지 (로컬 캐싱)

#### 위험 3: 롤백 불가능
**대응**:
- 제거 전 BackupManager로 전체 데이터 백업
- Git 태그로 버전 관리
- 롤백 시나리오 문서화

### 제거 조건
- ✅ useProjectTable Supabase 마이그레이션 완료
- ⏳ 모든 사용자가 Supabase 모드로 전환 (배포 후 3개월)
- ⏳ 레거시 마이그레이션 기간 종료 (3개월 이상 경과)
- ⏳ LocalStorage 사용률 0% 확인

---

## 타임라인 요약

| Phase | 작업 | 기간 | 우선순위 | 상태 |
|-------|------|------|----------|------|
| **Phase 16** | LocalStorage fallback 제거 | 완료 (2025-10-13) | 🔴 High | ✅ |
| **Phase 17** | useProjectTable → Supabase | 완료 (2025-10-13) | 🔴 High | ✅ |
| **Phase 18** | deviceId 전략 결정 | 완료 (2025-10-13) | 🟡 Medium | ✅ |
| **Phase 19** | LocalStorageAdapter 제거 | 3개월+ | 🟢 Low | ⏳ |

---

## 검증 체크리스트

### Phase 17 완료 검증 ✅
- [x] Settings 타입에 `projectTableConfig` 추가
- [x] SettingsService에 get/update 메서드 추가
- [x] useProjectTable에서 SettingsService 사용
- [x] localStorage → Supabase 자동 마이그레이션 구현
- [x] Supabase 마이그레이션 SQL 실행
- [x] 빌드/린트/타입체크 통과
- [ ] 기존 사용자 데이터 마이그레이션 확인 (배포 후)

### Phase 18 완료 검증 ✅
- [x] deviceId 전략 결정 (Option A 채택)
- [x] 선택한 전략 구현 완료 (현재 상태 유지)
- [x] 문서화 완료

### Phase 19 완료 검증
- [ ] LocalStorageAdapter 제거
- [ ] compression.ts 정리
- [ ] 마이그레이션 코드 제거
- [ ] 빌드/린트/타입체크 통과
- [ ] 프로덕션 배포 및 모니터링

---

## 위험 요소 및 대응 방안

### 1. 기존 사용자 데이터 손실
**위험**: localStorage에 저장된 설정이 마이그레이션되지 않음

**대응**:
- 마이그레이션 로직을 컴포넌트 초기화 시 자동 실행
- 마이그레이션 성공 여부 로깅
- 실패 시 기본 설정으로 fallback

---

### 2. 성능 저하
**위험**: localStorage(동기) → Supabase(비동기) 전환으로 인한 지연

**대응**:
- 설정 로드를 비동기로 처리
- 로딩 상태 UI 추가
- 캐시 레이어 활용 (CacheLayer 이미 구현됨)

---

### 3. 네트워크 오류
**위험**: Supabase 연결 실패 시 설정 로드 불가

**대응**:
- 기본 설정으로 fallback
- 에러 메시지 사용자에게 표시
- 재시도 로직 구현

---

## 관련 문서
- `docs/DUALWRITE-DESIGN-FLAW.md` - DualWrite 비활성화 이유
- `src/lib/storage/CLAUDE.md` - Storage 시스템 아키텍처
- `src/lib/storage/services/CLAUDE.md` - 서비스 계층 구조
- `supabase/migrations/CLAUDE.md` - Supabase 마이그레이션 가이드

---

## 작성 정보
- **작성일**: 2025-10-13
- **작성자**: Claude Code
- **Phase**: 16 완료 → 17 계획
- **상태**: Phase 17 대기 중
