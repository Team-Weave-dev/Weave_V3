# 충돌 해결 시스템 통합 테스트 가이드

## 📋 테스트 개요

이 문서는 **Phase 5.5-5.6에서 구현된 충돌 해결 시스템**의 수동 통합 테스트 방법을 제공합니다.

### 구현 완료 항목

- ✅ **Phase 5.5**: 충돌 해결 UI 컴포넌트 (ConflictResolutionModal)
- ✅ **Phase 5.6**: 자동 머지 전략 (ConflictResolver)
- ✅ **BidirectionalSyncAdapter 통합**: 충돌 해결 옵션 추가

### 테스트 목적

1. **충돌 감지**: 로컬과 원격 데이터 간 충돌을 정확히 감지하는지 확인
2. **자동 머지**: 타임스탬프 기반 자동 병합이 올바르게 작동하는지 검증
3. **수동 해결**: 사용자가 필드별로 선택하여 병합할 수 있는지 확인
4. **UI/UX**: 충돌 해결 모달의 사용성과 접근성 검증

---

## 🔧 사전 준비

### 1. 개발 환경 실행

```bash
# 개발 서버 시작
npm run dev

# 브라우저에서 http://localhost:3000 접속
```

### 2. 브라우저 개발자 도구 준비

- **F12** 또는 **Cmd+Option+I** (macOS)로 개발자 도구 열기
- **Console 탭** 활성화 (로그 확인용)
- **Application > Local Storage** 준비 (데이터 검증용)

### 3. 테스트 데이터 준비

테스트 시작 전 브라우저 콘솔에서 실행:

```javascript
// LocalStorage 초기화 (선택)
localStorage.clear()

// 새로고침
location.reload()
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 충돌 감지 기본 동작

**목적**: ConflictResolver가 로컬과 원격 데이터의 차이를 정확히 감지하는지 확인

#### 절차

1. **브라우저 콘솔에서 ConflictResolver 테스트**:

```javascript
// ConflictResolver 임포트 (브라우저 콘솔에서는 직접 접근 불가하므로 React DevTools 사용)
// 또는 테스트 페이지를 만들어 실행

// 시뮬레이션: 프로젝트 데이터 생성
const localProject = {
  id: 'test-project-1',
  name: '로컬 프로젝트',
  status: 'in_progress',
  progress: 75,
  updatedAt: '2025-01-10T10:00:00Z'
}

const remoteProject = {
  id: 'test-project-1',
  name: '원격 프로젝트',
  status: 'review',
  progress: 80,
  updatedAt: '2025-01-10T12:00:00Z'  // 2시간 후
}

// 충돌 감지 (수동 호출)
// 실제 코드에서는 BidirectionalSyncAdapter.sync()가 자동 호출
```

2. **예상 결과**:
   - `hasConflict: true`
   - `conflictType: 'remote_newer'` (원격이 2시간 더 최신)
   - `differences` 배열에 3개 필드 (name, status, progress) 표시

#### 검증 방법

- 콘솔에서 `conflictResolver.getStats()` 실행
- `totalConflicts` 카운트가 증가했는지 확인
- `lastConflictAt` 타임스탬프가 기록되었는지 확인

---

### 시나리오 2: 자동 머지 (merge_auto) 테스트

**목적**: 필드별 타임스탬프 비교를 통한 자동 병합 검증

#### 절차

1. **충돌 발생 시뮬레이션**:
   - Device A에서 프로젝트 수정 (예: 진행률 변경)
   - Device B에서 동일 프로젝트의 다른 필드 수정 (예: 상태 변경)
   - 양쪽 변경사항이 동기화 시점에 충돌 발생

2. **자동 머지 실행**:
   - 충돌 감지 시 `recommendedStrategy`가 `merge_auto`로 설정됨
   - ConflictResolver.resolve()가 자동 호출됨

3. **결과 확인**:

```javascript
// 브라우저 콘솔에서 병합 결과 확인
const mergedData = conflictResolver.autoMerge(localProject, remoteProject, differences)

// 예상 결과:
// - 각 필드가 타임스탬프 기준으로 최신 값 선택
// - updatedAt이 가장 최신 타임스탬프로 설정
```

#### 검증 방법

- **필드별 병합 확인**:
  - `name`: 타임스탬프가 더 최신인 값 선택
  - `status`: 타임스탬프가 더 최신인 값 선택
  - `progress`: 타임스탬프가 더 최신인 값 선택
- **타임스탬프 검증**:
  - `updatedAt`이 두 버전 중 최신 값으로 설정됨
- **통계 확인**:
  - `conflictResolver.getStats().autoResolved` 증가
  - `strategyBreakdown.merge_auto` 증가

---

### 시나리오 3: ConflictResolutionModal UI 테스트

**목적**: 사용자가 충돌을 수동으로 해결할 수 있는 UI 동작 검증

#### 절차

1. **충돌 발생 상황 만들기**:
   - DualWrite 모드에서 양방향 동기화 중 충돌 발생
   - 또는 테스트 코드로 ConflictResolutionModal 직접 렌더링

2. **모달 UI 확인**:
   - [ ] 모달이 화면 중앙에 표시됨
   - [ ] 충돌 유형 (conflictType) 아이콘 및 설명 표시
   - [ ] 4가지 해결 전략 라디오 버튼 표시:
     - **로컬 버전 유지** (keep_local)
     - **원격 버전 유지** (keep_remote)
     - **자동 병합** (merge_auto)
     - **수동 병합** (merge_manual)
   - [ ] 타임스탬프 표시:
     - 로컬 버전 타임스탬프
     - 원격 버전 타임스탬프

3. **수동 병합 (merge_manual) 테스트**:
   - [ ] "수동 병합" 선택 시 필드별 비교 UI 표시
   - [ ] ScrollArea로 많은 필드도 스크롤 가능
   - [ ] 각 필드에 대해 "로컬" 또는 "원격" 버튼 선택 가능
   - [ ] 선택된 버튼이 primary 색상으로 강조 표시

4. **해결 적용**:
   - [ ] "해결 적용" 버튼 클릭
   - [ ] 로딩 상태 표시 (isResolving: true)
   - [ ] onResolve 콜백 호출됨
   - [ ] 모달 자동 닫힘

#### 검증 방법

- **UI 접근성**:
  - 키보드로 모든 버튼 탐색 가능 (Tab 키)
  - Enter로 버튼 선택 가능
  - Esc로 모달 닫기 가능
- **데이터 무결성**:
  - 병합된 데이터가 LocalStorage에 저장됨
  - `updatedAt` 필드가 현재 시각으로 갱신됨
- **통계 업데이트**:
  - `conflictResolver.getStats().manualResolved` 증가
  - `strategyBreakdown.merge_manual` 증가

---

### 시나리오 4: BidirectionalSyncAdapter 통합 테스트

**목적**: 양방향 동기화 과정에서 충돌 해결이 자동으로 동작하는지 확인

#### 절차

1. **DualWrite 모드 활성화**:
   - `src/lib/storage/index.ts`에서 DualWriteAdapter 사용 확인
   - `enableSyncWorker: true` 설정 확인

2. **다중 디바이스 시뮬레이션**:
   - **Device A**: 프로젝트 A의 진행률을 50%로 변경
   - **Device B**: 동시에 프로젝트 A의 상태를 'review'로 변경
   - 양쪽 모두 LocalStorage + Supabase 동기화 시도

3. **충돌 발생 및 자동 해결**:
   - BidirectionalSyncAdapter.sync()가 충돌 감지
   - ConflictResolver.detectConflict() 자동 호출
   - `preferNewest: true` 옵션에 따라 자동 병합
   - 양쪽 디바이스에 최종 병합 결과 동기화

#### 검증 방법

- **동기화 로그 확인** (브라우저 콘솔):

```
[BidirectionalSync] Conflict detected: project:test-project-1
[ConflictResolver] Auto-merging with strategy: merge_auto
[BidirectionalSync] Conflict resolved, syncing to Supabase...
```

- **데이터 일관성**:
  - Device A의 LocalStorage와 Supabase 데이터 일치
  - Device B의 LocalStorage와 Supabase 데이터 일치
  - 양쪽 디바이스의 최종 데이터 동일

- **통계 확인**:

```javascript
const adapter = dualWriteAdapter  // BidirectionalSyncAdapter 인스턴스
const stats = adapter.getSyncStats()

console.log('Conflict Stats:', {
  totalConflicts: stats.conflictStats?.totalConflicts,
  resolvedConflicts: stats.conflictStats?.resolvedConflicts,
  autoResolved: stats.conflictStats?.autoResolved
})
```

---

## 🔍 예상 결과 및 검증

### 1. 충돌 감지

**성공 조건**:
- [ ] 동일한 데이터는 `hasConflict: false` 반환
- [ ] 다른 데이터는 `hasConflict: true` 반환
- [ ] 타임스탬프 차이가 5초 이내면 `both_modified`로 분류
- [ ] 타임스탬프가 없으면 `unknown`으로 분류

**실패 징후**:
- 충돌이 있는데 감지되지 않음
- 충돌이 없는데 감지됨
- conflictType이 부정확함

### 2. 자동 머지

**성공 조건**:
- [ ] 각 필드가 타임스탬프 기준으로 최신 값 선택됨
- [ ] 타임스탬프가 없는 필드는 원격 우선
- [ ] 객체가 아닌 경우 전체 타임스탬프로 판단
- [ ] `updatedAt`이 최신 타임스탬프로 설정됨

**실패 징후**:
- 필드별 병합이 타임스탬프와 다름
- 원본 데이터가 손실됨
- 순환 참조 발생

### 3. 수동 병합 UI

**성공 조건**:
- [ ] 모달이 정상적으로 표시됨
- [ ] 모든 충돌 필드가 나열됨
- [ ] 사용자 선택이 올바르게 반영됨
- [ ] 병합 결과가 예상대로 저장됨

**실패 징후**:
- 모달이 표시되지 않음
- 일부 필드가 누락됨
- 선택이 반영되지 않음
- 병합 후 데이터 오류

### 4. BidirectionalSync 통합

**성공 조건**:
- [ ] 충돌 자동 감지 및 해결
- [ ] 양쪽 디바이스 데이터 일치
- [ ] 동기화 재시도 시 중복 해결 없음
- [ ] 통계가 정확히 기록됨

**실패 징후**:
- 충돌이 해결되지 않음
- 데이터 불일치 지속
- 무한 동기화 루프
- 통계 누락

---

## 🐛 문제 해결 가이드

### 문제 1: 충돌이 감지되지 않음

**원인**:
- 타임스탬프 필드가 없음
- 데이터가 완전히 동일함
- ConflictResolver가 초기화되지 않음

**해결 방법**:

```javascript
// 1. 타임스탬프 필드 확인
console.log('Local:', localProject.updatedAt)
console.log('Remote:', remoteProject.updatedAt)

// 2. 데이터 비교
console.log('Equal?', JSON.stringify(localProject) === JSON.stringify(remoteProject))

// 3. ConflictResolver 상태 확인
console.log('ConflictResolver stats:', conflictResolver.getStats())
```

---

### 문제 2: 자동 머지 결과가 예상과 다름

**원인**:
- 타임스탬프 파싱 오류
- 타임존 차이
- 필드 이름 불일치

**해결 방법**:

```javascript
// 타임스탬프 추출 확인
const localTimestamp = conflictResolver.extractTimestamp(localProject)
const remoteTimestamp = conflictResolver.extractTimestamp(remoteProject)

console.log('Local timestamp:', localTimestamp, new Date(localTimestamp))
console.log('Remote timestamp:', remoteTimestamp, new Date(remoteTimestamp))

// 필드 차이 분석
const differences = conflictResolver.findDifferences(localProject, remoteProject)
console.log('Differences:', differences)
```

---

### 문제 3: 모달이 표시되지 않음

**원인**:
- `onConflict` 콜백이 등록되지 않음
- React 컴포넌트 마운트 오류
- CSS 스타일 문제

**해결 방법**:

```javascript
// 1. onConflict 콜백 확인
console.log('onConflict registered:', typeof options.onConflict === 'function')

// 2. React DevTools로 컴포넌트 트리 확인
// 3. 브라우저 개발자 도구 > Elements에서 모달 DOM 검색
```

---

### 문제 4: 동기화 후에도 데이터 불일치

**원인**:
- 동기화 큐에 중복 작업
- RLS 정책으로 인한 권한 문제
- 네트워크 오류

**해결 방법**:

```javascript
// 1. 동기화 큐 확인
const queueSize = dualAdapter.getSyncStats().queueSize
console.log('Queue size:', queueSize)

// 2. Supabase 권한 확인
const { data, error } = await supabase.from('projects').select('*').eq('id', 'test-project-1')
console.log('Supabase data:', data, 'Error:', error)

// 3. 강제 재동기화
await dualAdapter.forceSyncAll()
```

---

## 📊 테스트 결과 기록

### 테스트 실행 정보

- **테스트 일자**: YYYY-MM-DD
- **테스터**: [이름]
- **브라우저**: Chrome / Firefox / Safari
- **환경**: Development / Staging

### 시나리오별 결과

| 시나리오 | 통과 여부 | 비고 |
|---------|----------|------|
| 1. 충돌 감지 | ✅ / ❌ | |
| 2. 자동 머지 | ✅ / ❌ | |
| 3. UI 테스트 | ✅ / ❌ | |
| 4. 통합 테스트 | ✅ / ❌ | |

### 발견된 이슈

1. **이슈 제목**: [이슈 설명]
   - **재현 방법**: [재현 단계]
   - **예상 결과**: [예상 결과]
   - **실제 결과**: [실제 결과]
   - **우선순위**: High / Medium / Low

---

## 🔗 관련 문서

- **구현 코드**:
  - [`src/components/ui/storage/ConflictResolutionModal.tsx`](../src/components/ui/storage/ConflictResolutionModal.tsx)
  - [`src/lib/storage/utils/ConflictResolver.ts`](../src/lib/storage/utils/ConflictResolver.ts)
  - [`src/lib/storage/types/conflict.ts`](../src/lib/storage/types/conflict.ts)

- **관련 문서**:
  - [`docs/DUALWRITE-DESIGN-FLAW.md`](./DUALWRITE-DESIGN-FLAW.md) - DualWrite 설계 및 문제점
  - [`src/lib/storage/adapters/CLAUDE.md`](../src/lib/storage/adapters/CLAUDE.md) - BidirectionalSyncAdapter 가이드
  - [`src/lib/storage/utils/CLAUDE.md`](../src/lib/storage/utils/CLAUDE.md) - ConflictResolver 가이드

---

## 📝 체크리스트

테스트 완료 후 확인:

- [ ] 모든 시나리오 실행 완료
- [ ] 예상 결과와 실제 결과 일치
- [ ] 발견된 이슈 기록
- [ ] 테스트 결과 요약 작성
- [ ] 관련 팀원에게 결과 공유

---

**최종 업데이트**: 2025-01-10
**작성자**: Claude Code
**문서 버전**: 1.0.0
