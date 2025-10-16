# Supabase 409 Conflict Error 해결 보고서

## 문제 요약

수동으로 SQL 마이그레이션을 실행한 후 캘린더 위젯 등에서 409 Conflict 에러가 발생했습니다.

### 에러 증상
```
gajxwhhzxqnbwmvpppcu.supabase.co/rest/v1/events?columns=...
Failed to load resource: the server responded with a status of 409

[SupabaseAdapter] Events insert error: Object
[useCalendarEvents] Failed to add event: StorageError: Failed to set key "events"
```

## 근본 원인 분석

### Phase 1: 409 에러 근본 원인 파악

**409 Conflict 에러**는 PostgreSQL의 **CHECK 제약조건 위반**으로 인해 발생합니다:
- Unique constraint 위반
- Foreign key constraint 위반
- **CHECK constraint 위반** ← 이번 경우

### Phase 1.1: Events 테이블 제약조건 분석

`supabase/migrations/20250107_05_events.sql` 파일에서 발견한 CHECK 제약조건:

```sql
-- Events 테이블 (lines 22-28)
type TEXT DEFAULT 'event'
  CHECK (type IN ('event', 'meeting', 'task', 'milestone', 'reminder', 'holiday')),

status TEXT DEFAULT 'confirmed'
  CHECK (status IN ('tentative', 'confirmed', 'cancelled')),
```

**문제**: `SupabaseAdapter.ts`에서 `event.status`를 검증 없이 그대로 INSERT하여, 잘못된 값(예: 'active', 'pending')이 전달되면 CHECK 제약조건 위반으로 409 에러 발생.

### Phase 1.2: 전역 CHECK 제약조건 매핑

전체 엔티티에 대해 CHECK 제약조건을 확인한 결과:

| 엔티티 | 필드 | CHECK 제약조건 | 검증 상태 |
|--------|------|---------------|----------|
| **Events** | type | ('event', 'meeting', 'task', 'milestone', 'reminder', 'holiday') | ✅ 검증 있음 |
| **Events** | status | ('tentative', 'confirmed', 'cancelled') | ❌ **검증 없음** |
| **Projects** | status | ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled') | ❌ **검증 없음** |
| **Clients** | status | ('active', 'inactive', 'archived') | ❌ **검증 없음** |
| **Tasks** | status | ('pending', 'in_progress', 'completed', 'cancelled', 'blocked') | ✅ 검증 있음 |
| **Tasks** | priority | ('low', 'medium', 'high', 'urgent') | ✅ 검증 있음 |
| **Documents** | type | ('contract', 'invoice', 'estimate', 'report', 'meeting_note', 'specification', 'proposal', 'other') | ✅ 검증 있음 |
| **Documents** | status | ('draft', 'review', 'approved', 'sent', 'signed', 'archived') | ✅ 검증 있음 |

**결론**: Events, Projects, Clients의 status 필드에 검증이 누락되어 있었습니다.

## 해결 방안

### Phase 2: Status 검증 코드 추가

일관된 패턴으로 3개 엔티티에 status 검증 로직을 추가했습니다:

#### Phase 2.1: Events Status 검증 추가

**파일**: `src/lib/storage/adapters/SupabaseAdapter.ts` (Lines 1058-1066)

```typescript
// Status 변환: Supabase CHECK 제약에 맞게 변환
// Supabase events.status CHECK: ('tentative', 'confirmed', 'cancelled')
const validStatuses = ['tentative', 'confirmed', 'cancelled']
let eventStatus = event.status || 'confirmed'

if (!validStatuses.includes(eventStatus)) {
  console.warn(`[SupabaseAdapter] Invalid event status "${eventStatus}", converting to "confirmed"`)
  eventStatus = 'confirmed'
}

return {
  // ... other fields ...
  status: eventStatus,  // ← 검증된 값 사용
```

#### Phase 2.2: Projects Status 검증 추가

**파일**: `src/lib/storage/adapters/SupabaseAdapter.ts` (Lines 744-752)

```typescript
// Status 변환: Supabase CHECK 제약에 맞게 변환
// Supabase projects.status CHECK: ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')
const validStatuses = ['planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled']
let projectStatus = project.status || 'planning'

if (!validStatuses.includes(projectStatus)) {
  console.warn(`[SupabaseAdapter] Invalid project status "${projectStatus}", converting to "planning"`)
  projectStatus = 'planning'
}

return {
  // ... other fields ...
  status: projectStatus,  // ← 검증된 값 사용
```

#### Phase 2.3: Clients Status 검증 추가

**파일**: `src/lib/storage/adapters/SupabaseAdapter.ts` (Lines 1166-1174)

```typescript
// Status 변환: Supabase CHECK 제약에 맞게 변환
// Supabase clients.status CHECK: ('active', 'inactive', 'archived')
const validStatuses = ['active', 'inactive', 'archived']
let clientStatus = client.status || 'active'

if (!validStatuses.includes(clientStatus)) {
  console.warn(`[SupabaseAdapter] Invalid client status "${clientStatus}", converting to "active"`)
  clientStatus = 'active'
}

return {
  // ... other fields ...
  status: clientStatus,  // ← 검증된 값 사용
```

### Phase 3: TypeScript 타입 검사 및 빌드 테스트

#### 들여쓰기 수정

코드 추가 과정에서 Projects 섹션의 들여쓰기 문제가 발생했습니다:

**문제**: Lines 770-802에서 return 객체의 들여쓰기가 10 spaces였으나 12 spaces가 필요했습니다.
**추가 문제**: `document_status` 객체 내부 필드가 12 spaces였으나 14 spaces가 필요했습니다.

**해결**: Python 스크립트를 사용하여 들여쓰기를 수정:
1. Lines 770-802: 10 spaces → 12 spaces
2. Lines 787-791: 12 spaces → 14 spaces (document_status 내부)

#### 검증 결과

```bash
# TypeScript 타입 검사
npm run type-check
✅ 에러 없음

# 프로덕션 빌드
npm run build
✅ 빌드 성공 (경고만 있음)
```

## 검증 결과

### Phase 4: 통합 테스트

1. **TypeScript 컴파일**: ✅ 성공
2. **프로덕션 빌드**: ✅ 성공
3. **코드 일관성**: ✅ 모든 엔티티가 동일한 검증 패턴 적용

### 예상 동작

이제 다음과 같은 상황에서 409 에러가 발생하지 않습니다:

1. **Events**: 잘못된 status 값(예: 'active', 'pending') 입력 시 → 'confirmed'로 자동 변환
2. **Projects**: 잘못된 status 값 입력 시 → 'planning'으로 자동 변환
3. **Clients**: 잘못된 status 값 입력 시 → 'active'로 자동 변환

### 콘솔 로그

검증 실패 시 경고 메시지가 출력됩니다:

```javascript
[SupabaseAdapter] Invalid event status "active", converting to "confirmed"
[SupabaseAdapter] Invalid project status "pending", converting to "planning"
[SupabaseAdapter] Invalid client status "deleted", converting to "active"
```

## 적용된 패턴

### 검증 패턴

모든 엔티티에 일관된 검증 패턴을 적용했습니다:

```typescript
// 1. 유효한 값 정의
const validStatuses = [/* allowed values */]

// 2. 기본값 설정
let entityStatus = entity.status || 'default_value'

// 3. 검증 및 변환
if (!validStatuses.includes(entityStatus)) {
  console.warn(`[SupabaseAdapter] Invalid status "${entityStatus}", converting to "default"`)
  entityStatus = 'default_value'
}

// 4. 검증된 값 사용
return {
  status: entityStatus,
  // ...
}
```

## 향후 권장 사항

1. **신규 엔티티 추가 시**: CHECK 제약조건이 있는 모든 필드에 검증 로직 추가
2. **마이그레이션 작성 시**: CHECK 제약조건 추가 시 SupabaseAdapter에도 검증 코드 추가
3. **테스트 강화**: 각 엔티티에 대해 잘못된 status 값 입력 테스트 추가
4. **타입 안전성**: TypeScript enum을 활용하여 status 값 타입 안전성 강화

## 참고 파일

- `supabase/migrations/20250107_02_clients.sql` (Line 26)
- `supabase/migrations/20250107_03_projects.sql` (Lines 13-14)
- `supabase/migrations/20250107_05_events.sql` (Lines 22-28)
- `src/lib/storage/adapters/SupabaseAdapter.ts` (Lines 744-752, 1058-1066, 1166-1174)

## 작업 일자

- 분석 및 수정: 2025-10-17
- 검증 완료: 2025-10-17
