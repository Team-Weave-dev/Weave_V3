# Soft Delete 403 에러 최종 해결 가이드

## 📋 문제 요약

**증상**: 프로젝트 삭제 시 403 Forbidden 에러 발생
**원인**: RLS 정책 충돌 - UPDATE 후 deleted_at IS NOT NULL인 행은 SELECT 정책을 통과하지 못함
**해결**: SECURITY DEFINER 함수로 RLS를 안전하게 우회

## ✅ 해결 방안

### 방법 1: SECURITY DEFINER 함수 사용 (권장)

RLS 정책을 우회하는 안전한 함수를 사용합니다. 이 방법은:
- ✅ 권한 검증을 함수 내부에서 수행
- ✅ RLS 정책 충돌 완전 회피
- ✅ 타입스크립트 코드도 간결해짐

### 방법 2: RLS 임시 비활성화 (테스트용)

코드 로직이 맞는지 빠르게 확인하기 위한 임시 방법입니다.

## 🚀 실행 단계

### Step 1: 09번 마이그레이션 실행 (필수)

Supabase SQL Editor에서 다음 파일 내용을 실행:

```sql
-- 파일: supabase/migrations/20251017_09_soft_delete_function.sql
```

**기대 출력**:
```
✅ Soft Delete 함수 생성 완료

사용 가능한 함수:
- soft_delete_project_safe(project_id)
- soft_delete_task_safe(task_id)
- soft_delete_document_safe(document_id)
- soft_delete_event_safe(event_id)
- soft_delete_client_safe(client_id)
```

### Step 2: TypeScript 코드 확인

`SupabaseAdapter.ts` 파일이 이미 수정되었습니다. 확인:

```typescript
// Soft Delete: RLS를 우회하는 안전한 함수 호출
const functionName = `soft_delete_${tableName.slice(0, -1)}_safe`;

const { data, error } = await this.supabase.rpc(functionName, {
  [`p_${tableName.slice(0, -1)}_id`]: id
});
```

### Step 3: 브라우저 세션 클리어

```bash
# 브라우저 개발자 도구 Console에서 실행
localStorage.clear()
```

그 후 **페이지 새로고침** 후 다시 로그인

### Step 4: 테스트

1. 프로젝트 상세 페이지에서 삭제 버튼 클릭
2. 콘솔 로그 확인:
   ```
   [SupabaseAdapter.remove] 📞 함수 호출: {functionName: "soft_delete_project_safe", id: "..."}
   [SupabaseAdapter.remove] ✅ Soft Delete 완료: {id: "...", tableName: "projects", deleted_at: "..."}
   [BaseService.delete] ✅ 삭제 완료
   ```
3. 페이지 새로고침 → 프로젝트가 목록에서 사라졌는지 확인

## 🔍 트러블슈팅

### 에러: "function soft_delete_project_safe does not exist"

**원인**: 09번 마이그레이션이 실행되지 않았거나 실패함

**해결**:
```sql
-- Supabase SQL Editor에서 함수 존재 확인
SELECT proname
FROM pg_proc
WHERE proname LIKE 'soft_delete%';

-- 아무것도 안 나오면 09번 마이그레이션 다시 실행
```

### 여전히 403 에러 발생

**체크리스트**:
1. ✅ 09번 마이그레이션 실행 완료?
2. ✅ 브라우저 캐시/세션 클리어?
3. ✅ Supabase에서 로그아웃 → 로그인 다시?
4. ✅ TypeScript 코드가 함수 호출 방식으로 변경됨?

**최종 확인**:
```sql
-- Supabase SQL Editor에서 직접 테스트
SELECT soft_delete_project_safe('실제-프로젝트-UUID');

-- 예상 출력:
-- {"success": true, "project_id": "...", "deleted_at": "..."}
```

### 임시 해결책: RLS 비활성화 (테스트용)

만약 위 방법이 모두 실패한다면, 임시로 RLS를 비활성화해서 코드 로직만 확인:

```sql
-- 07번 스크립트 실행 (RLS 비활성화)
-- 파일: supabase/migrations/20251017_07_temporary_disable_rls.sql

-- 테스트 후 즉시 08번 스크립트 실행 (RLS 재활성화)
-- 파일: supabase/migrations/20251017_08_reenable_rls.sql
```

**⚠️ 경고**: 07번 스크립트는 보안을 완전히 제거합니다! 테스트 목적으로만 사용하고 즉시 08번으로 재활성화하세요.

## 📊 성공 확인

### 1. 콘솔 로그
```
[SupabaseAdapter.remove] 🔍 삭제 시작: {deleteType: "Soft Delete (함수 호출)"}
[SupabaseAdapter.remove] 📞 함수 호출: {functionName: "soft_delete_project_safe"}
[SupabaseAdapter.remove] ✅ Soft Delete 완료: {deleted_at: "2025-10-17T..."}
[BaseService.delete] 🧹 컬렉션 캐시 무효화
[BaseService.delete] ✅ 삭제 완료
```

### 2. Supabase 데이터베이스
```sql
-- deleted_at이 NULL이 아님을 확인
SELECT id, name, deleted_at
FROM projects
WHERE id = '삭제한-프로젝트-UUID';

-- 예상 결과:
-- id: abc-123
-- name: 프로젝트명
-- deleted_at: 2025-10-17T12:34:56.789Z (NOT NULL!)
```

### 3. 애플리케이션 UI
- ✅ 삭제 버튼 클릭 → 성공 메시지
- ✅ 프로젝트 목록에서 즉시 사라짐
- ✅ 페이지 새로고침 후에도 여전히 사라진 상태

## 🎯 작동 원리

### 기존 방식 (실패)
```
TypeScript: UPDATE deleted_at = NOW()
    ↓
Supabase PostgREST: UPDATE 실행
    ↓
RLS 정책 검증:
- USING: ✅ 통과 (auth.uid() = user_id)
- UPDATE 실행: ✅ deleted_at 변경됨
- WITH CHECK: ✅ 통과 (user_id 조건만 있음)
- 내부 SELECT로 결과 확인: ❌ 실패!
  (deleted_at IS NOT NULL → SELECT 정책 위반)
    ↓
403 Forbidden
```

### 새 방식 (성공)
```
TypeScript: RPC 함수 호출
    ↓
Supabase: soft_delete_project_safe() 실행
    ↓
함수 내부 (SECURITY DEFINER):
- auth.uid() 확인: ✅
- user_id 일치 확인: ✅
- UPDATE deleted_at = NOW(): ✅
- RLS 우회: ✅ (SECURITY DEFINER)
    ↓
성공 응답 반환
```

## 📚 관련 파일

| 파일 | 용도 |
|------|------|
| `20251017_09_soft_delete_function.sql` | SECURITY DEFINER 함수 생성 (필수) |
| `src/lib/storage/adapters/SupabaseAdapter.ts` | 함수 호출 구현 (이미 수정됨) |
| `20251017_07_temporary_disable_rls.sql` | RLS 임시 비활성화 (테스트용) |
| `20251017_08_reenable_rls.sql` | RLS 재활성화 (필수) |

## 🔄 다음 단계

성공 확인 후:

1. ✅ 다른 엔티티(tasks, documents, events, clients) 테스트
2. ✅ 복구 기능 구현 (별도 함수 필요)
3. ✅ 영구 삭제 스케줄 설정 (cron job)

## 💡 추가 정보

### Soft Delete 복구

현재 RLS 정책은 deleted_at IS NOT NULL인 행을 SELECT할 수 없습니다. 복구를 위해서는:

```sql
-- 복구 함수 (추후 구현)
CREATE OR REPLACE FUNCTION restore_project(p_project_id UUID)
RETURNS JSON AS $$
BEGIN
  UPDATE projects
  SET deleted_at = NULL
  WHERE id = p_project_id
    AND user_id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 영구 삭제

30일 이상 된 Soft Delete 데이터는 자동으로 영구 삭제됩니다:

```sql
-- permanent_delete_old_data() 함수 (이미 정의됨)
-- cron job으로 매일 실행 가능
```

## ✨ 결론

**SECURITY DEFINER 함수**를 사용하면:
- RLS 정책 충돌 완전 회피
- 안전한 권한 검증
- 간결한 TypeScript 코드
- 확장 가능한 아키텍처

이제 프로젝트 삭제가 정상 작동해야 합니다! 🎉
