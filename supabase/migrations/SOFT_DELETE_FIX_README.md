# Soft Delete 403 에러 해결 가이드

## 문제 진단

### 증상
- 프로젝트 삭제 시 403 Forbidden 에러 발생
- 에러 메시지: "new row violates row-level security policy for table 'projects'"
- `deletedCount: 0` 반환
- 프로젝트가 새로고침 후에도 여전히 표시됨

### 근본 원인
여러 마이그레이션을 거치면서 **RLS 정책이 중복/충돌** 상태가 됨:

1. **20251016_01_add_soft_delete.sql**: 초기 Soft Delete 구현
   - "Users can update own active projects" 정책 생성
   - "Users can delete own projects" 정책 생성 (WITH CHECK: deleted_at IS NOT NULL)

2. **20251017_01_fix_soft_delete_rls.sql**: 정책 수정 시도
   - WITH CHECK 조건 완화

3. **20251017_02_simplify_soft_delete_rls.sql**: 정책 단순화 시도
   - USING 절에서 deleted_at 조건 제거

**결과**: 정책 이름이 일치하지 않거나 중복된 정책으로 인해 RLS 검증 실패

### PostgreSQL RLS 정책 동작 방식
- **USING 절**: 수정 전 행이 조건을 만족해야 함 (OR 로직 - 하나라도 통과하면 OK)
- **WITH CHECK 절**: 수정 후 행이 조건을 만족해야 함 (AND 로직 - 모두 통과해야 OK)

여러 UPDATE 정책이 존재할 경우:
- USING: 하나라도 통과하면 수정 가능
- WITH CHECK: **모든 정책을 통과해야만 수정 가능** ← 여기서 실패!

## 해결 방법

### 1단계: 현재 상태 진단 (선택사항)

Supabase SQL Editor에서 다음 명령 실행:

```sql
-- 파일: 20251017_03_diagnose_rls_state.sql
-- 모든 RLS 정책과 제약조건을 확인
```

### 2단계: 정책 완전 재설정 (필수)

Supabase SQL Editor에서 다음 명령 실행:

```sql
-- 파일: 20251017_04_fix_soft_delete_rls_final.sql
-- 모든 기존 정책 제거 후 단순한 정책 재생성
```

**이 마이그레이션의 핵심**:
- ✅ 모든 가능한 정책 이름을 완전히 제거
- ✅ 단순하고 명확한 정책 3개만 생성:
  - `projects_select_active`: 활성 프로젝트만 조회
  - `projects_insert`: 새 프로젝트 생성
  - `projects_update`: 모든 업데이트 허용 (Soft Delete 포함)

**UPDATE 정책 상세**:
```sql
CREATE POLICY "projects_update"
ON projects FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)          -- 수정 권한: user_id만 확인
WITH CHECK (auth.uid() = user_id);    -- 결과 검증: user_id만 확인
```

### 3단계: 테스트 (필수)

Supabase SQL Editor에서 **인증된 상태로** 다음 명령 실행:

```sql
-- 파일: 20251017_05_test_soft_delete.sql
-- Soft Delete 기능 전체 흐름 테스트
```

**테스트 시나리오**:
1. ✅ 프로젝트 생성
2. ✅ 생성된 프로젝트 조회
3. ✅ Soft Delete 실행 (UPDATE deleted_at = NOW())
4. ✅ 삭제된 프로젝트가 일반 조회에서 제외되는지 확인

### 4단계: 애플리케이션 코드 확인

**SupabaseAdapter.ts의 Soft Delete 구현**:
```typescript
// 이미 구현되어 있음 (수정 불필요)
if (usesSoftDelete) {
  const updateQuery = this.supabase
    .from(tableName)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (entity !== 'users' && entity !== 'user') {
    updateQuery.eq('user_id', this.userId);
  }

  // ⚠️ .select() 제거됨 - RLS 정책 위반 방지
  const { error } = await updateQuery;

  if (error) {
    console.error(`[SupabaseAdapter.remove] ❌ Soft Delete 실패:`, error);
    throw error;
  }
}
```

**BaseService.ts의 캐시 무효화**:
```typescript
// 이미 구현되어 있음 (수정 불필요)
async delete(id: string): Promise<boolean> {
  await this.storage.remove(`${this.entityKey}:${id}`);

  // 중요: 컬렉션 캐시도 무효화
  this.storage.invalidateCachePattern(this.entityKey);

  return true;
}
```

## 실행 순서

```bash
# 1. Supabase SQL Editor 접속
# 2. 인증된 상태인지 확인 (우측 상단 사용자 아이콘)

# 3. 04번 마이그레이션 실행 (정책 재설정)
# supabase/migrations/20251017_04_fix_soft_delete_rls_final.sql 복사 → 실행

# 4. 05번 마이그레이션 실행 (테스트)
# supabase/migrations/20251017_05_test_soft_delete.sql 복사 → 실행

# 5. 애플리케이션에서 실제 테스트
npm run dev
# → 프로젝트 삭제 → 새로고침 → 프로젝트가 사라졌는지 확인
```

## 예상 결과

### 성공 시
```
✅ Soft Delete RLS 정책 최종 수정 완료
🗑️ 모든 기존 정책 제거됨
✨ 새로운 단순 정책 적용됨
📝 UPDATE 정책: USING (user_id만) + WITH CHECK (user_id만)
👁️ SELECT 정책: deleted_at IS NULL 필터 유지
🎯 Soft Delete (UPDATE deleted_at) 이제 작동해야 함
```

### 애플리케이션 로그 (성공 시)
```
[SupabaseAdapter.remove] 🗑️ Soft Delete 시작: projects/abc-123
[SupabaseAdapter.remove] ✅ Soft Delete 완료: {deletedCount: 1}
[BaseService.delete] ✅ 삭제 완료
```

## 추가 정보

### Soft Delete 복구
현재 RLS 정책은 `deleted_at IS NOT NULL`인 행을 SELECT할 수 없으므로, 복구를 위해서는 별도의 정책이나 함수가 필요합니다.

```sql
-- 복구 함수 예시 (추후 구현 필요)
CREATE OR REPLACE FUNCTION restore_project(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE projects
  SET deleted_at = NULL
  WHERE id = p_project_id
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 영구 삭제
30일 이상 된 Soft Delete 데이터는 자동으로 영구 삭제됩니다:

```sql
-- permanent_delete_old_data() 함수 (이미 정의됨)
-- cron job으로 매일 실행 가능
```

## 트러블슈팅

### 여전히 403 에러 발생 시
1. **정책 재확인**:
   ```sql
   SELECT policyname, cmd, qual, with_check
   FROM pg_policies
   WHERE tablename = 'projects';
   ```

2. **RLS 활성화 확인**:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE tablename = 'projects';
   ```

3. **캐시 클리어**:
   - 브라우저 개발자 도구 → Application → Clear storage
   - `localStorage.clear()` 실행

4. **Supabase 세션 재인증**:
   - 로그아웃 → 로그인

### 테스트 데이터 정리
```sql
-- 테스트로 생성된 프로젝트 영구 삭제 (관리자 전용)
DELETE FROM projects
WHERE name LIKE '테스트 프로젝트%'
  AND deleted_at IS NOT NULL;
```

## 참고 문서
- [Supabase RLS 공식 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 정책](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- 프로젝트 내부 문서: `src/lib/storage/adapters/SupabaseAdapter.ts`
