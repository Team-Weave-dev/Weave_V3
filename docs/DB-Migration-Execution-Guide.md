# 데이터베이스 개선 마이그레이션 실행 가이드

**작성일**: 2025-10-16
**대상**: Weave H4 Supabase Database
**기반 문서**: Database-Structure-Analysis-Report.md
**마이그레이션 파일**: 20251016_01 ~ 20251016_06

---

## 📋 목차

1. [개요](#개요)
2. [사전 준비사항](#사전-준비사항)
3. [마이그레이션 파일 설명](#마이그레이션-파일-설명)
4. [실행 절차](#실행-절차)
5. [검증 방법](#검증-방법)
6. [롤백 절차](#롤백-절차)
7. [문제 해결](#문제-해결)
8. [성능 모니터링](#성능-모니터링)

---

## 개요

### 목적

Database-Structure-Analysis-Report.md에서 분석된 개선사항을 적용하여:
- **데이터 복구 가능성 확보** (Soft Delete)
- **데이터 무결성 강화** (CASCADE, 순환 참조 방지)
- **성능 10-100배 향상** (인덱스, Materialized View, Full-Text Search)

### 마이그레이션 구성

**Phase 1 - Critical (즉시 적용 권장)**:
1. `20251016_01_add_soft_delete.sql` - Soft Delete 패턴
2. `20251016_02_fix_self_reference_cascade.sql` - 자기 참조 CASCADE
3. `20251016_03_add_composite_indexes.sql` - 복합 인덱스

**Phase 2 - Important (단기 적용)**:
4. `20251016_04_add_materialized_views.sql` - 통계 쿼리 최적화
5. `20251016_05_add_full_text_search.sql` - 검색 성능 최적화
6. `20251016_06_add_circular_reference_check.sql` - 순환 참조 방지

### 영향 범위

**테이블**: users, clients, projects, tasks, events, documents
**RLS 정책**: 모든 주요 테이블 정책 업데이트
**인덱스**: 20+ 개 추가
**함수/트리거**: 10+ 개 추가
**예상 다운타임**: 5-15분 (데이터 양에 따라)

---

## 사전 준비사항

### 1. 백업 생성 (필수)

```bash
# Supabase CLI로 백업
supabase db dump -f backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# 또는 Supabase Dashboard에서 수동 백업
# Settings → Database → Create Backup
```

### 2. 환경 확인

```bash
# Supabase CLI 설치 확인
supabase --version  # v1.110.0 이상 권장

# 프로젝트 연결 확인
supabase status

# PostgreSQL 버전 확인 (14+ 필요)
supabase db version
```

### 3. 데이터 검증

```sql
-- 기존 데이터 통계 확인
SELECT
  'users' as table_name, COUNT(*) as count FROM users UNION ALL
  SELECT 'projects', COUNT(*) FROM projects UNION ALL
  SELECT 'tasks', COUNT(*) FROM tasks UNION ALL
  SELECT 'events', COUNT(*) FROM events UNION ALL
  SELECT 'documents', COUNT(*) FROM documents UNION ALL
  SELECT 'clients', COUNT(*) FROM clients;

-- 순환 참조 확인 (있으면 마이그레이션 전 수정 필요)
SELECT * FROM tasks WHERE id = parent_task_id;  -- 0 rows expected
SELECT * FROM documents WHERE id = parent_document_id;  -- 0 rows expected
```

### 4. 유지보수 모드 (선택적)

프로덕션 환경인 경우:
- 사용자에게 유지보수 공지
- 읽기 전용 모드로 전환 (가능한 경우)
- 트래픽이 적은 시간대 선택 (새벽 2-4시 권장)

---

## 마이그레이션 파일 설명

### 20251016_01_add_soft_delete.sql

**목적**: Soft Delete 패턴 구현
**변경사항**:
- 6개 테이블에 `deleted_at` 컬럼 추가
- 모든 RLS 정책 업데이트 (active 데이터만 조회)
- Partial 인덱스 5개 추가
- `soft_delete_user()`, `permanent_delete_old_data()` 함수 추가

**영향**:
- ✅ 데이터 복구 가능 (30일)
- ⚠️ RLS 정책 변경으로 기존 쿼리 영향 가능
- ⚠️ 실행 시간: 1-3분 (데이터 양에 따라)

**롤백 가능**: 복잡 (RLS 정책 다수 변경)

### 20251016_02_fix_self_reference_cascade.sql

**목적**: 자기 참조 외래키 CASCADE 정책 명시
**변경사항**:
- tasks, documents 외래키 재생성 (CASCADE 추가)
- 자기 참조 방지 CHECK 제약 추가

**영향**:
- ✅ 명확한 삭제 동작
- ⚠️ 실행 시간: < 30초

**롤백 가능**: 쉬움

### 20251016_03_add_composite_indexes.sql

**목적**: 대시보드/날짜/정렬 쿼리 최적화
**변경사항**:
- 복합 인덱스 10개 추가

**영향**:
- ✅ 대시보드 2-5배 성능 향상
- ⚠️ 디스크 사용량 +50MB (예상)
- ⚠️ 실행 시간: 2-5분

**롤백 가능**: 쉬움 (DROP INDEX)

### 20251016_04_add_materialized_views.sql

**목적**: 통계 쿼리 성능 100배 향상
**변경사항**:
- `user_statistics_mv` Materialized View 생성
- 갱신 함수 2개 추가
- 호환성 VIEW 추가

**영향**:
- ✅ 대시보드 로딩 10배 향상 (2-5초 → 0.2-0.5초)
- ⚠️ 디스크 사용량 +10MB (예상)
- ⚠️ 실행 시간: 1-3분
- ⚠️ 주기적 갱신 필요 (15-60분마다)

**롤백 가능**: 쉬움

### 20251016_05_add_full_text_search.sql

**목적**: 검색 성능 100배 향상
**변경사항**:
- 3개 테이블에 `search_vector` 컬럼 추가
- GIN 인덱스 3개 추가
- 트리거 3개 추가 (자동 업데이트)
- 검색 함수 4개 추가

**영향**:
- ✅ 검색 100배 향상 (1000ms → 10ms)
- ⚠️ 디스크 사용량 +5-10MB (예상, tsvector 20-30% 추가)
- ⚠️ 실행 시간: 3-5분 (기존 데이터 업데이트)

**롤백 가능**: 중간 (트리거 제거 필요)

### 20251016_06_add_circular_reference_check.sql

**목적**: 순환 참조 방지
**변경사항**:
- 순환 검사 함수 2개 추가
- 트리거 2개 추가
- 계층 조회 헬퍼 함수 2개 추가

**영향**:
- ✅ 데이터 무결성 보장
- ⚠️ 쓰기 성능 약간 저하 (2-10ms 추가)
- ⚠️ 실행 시간: < 1분

**롤백 가능**: 쉬움

---

## 실행 절차

### Option A: Supabase CLI (권장)

```bash
# 1. 프로젝트 디렉토리로 이동
cd /path/to/weave_h4

# 2. Supabase 연결 확인
supabase status

# 3. 마이그레이션 실행 (순서대로)
supabase db push

# 또는 개별 실행
supabase db push --include-all
```

### Option B: Supabase Dashboard (수동)

1. Supabase Dashboard → SQL Editor 열기
2. 각 마이그레이션 파일을 순서대로 복사하여 실행
3. 각 실행 후 결과 확인

**실행 순서 (필수)**:
```
20251016_01_add_soft_delete.sql
↓
20251016_02_fix_self_reference_cascade.sql
↓
20251016_03_add_composite_indexes.sql
↓
20251016_04_add_materialized_views.sql
↓
20251016_05_add_full_text_search.sql
↓
20251016_06_add_circular_reference_check.sql
```

### Option C: psql 직접 실행

```bash
# 1. Supabase DB 연결 정보 확인
# Dashboard → Settings → Database → Connection String

# 2. psql 실행
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# 3. 마이그레이션 파일 실행
\i supabase/migrations/20251016_01_add_soft_delete.sql
\i supabase/migrations/20251016_02_fix_self_reference_cascade.sql
\i supabase/migrations/20251016_03_add_composite_indexes.sql
\i supabase/migrations/20251016_04_add_materialized_views.sql
\i supabase/migrations/20251016_05_add_full_text_search.sql
\i supabase/migrations/20251016_06_add_circular_reference_cascade.sql
```

---

## 검증 방법

### 1. Soft Delete 검증

```sql
-- deleted_at 컬럼 존재 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'deleted_at';

-- RLS 정책 확인
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'projects' AND policyname LIKE '%active%';

-- 기능 테스트
UPDATE projects SET deleted_at = NOW() WHERE id = 'test-id';
SELECT * FROM projects WHERE id = 'test-id';  -- 조회 안됨 (deleted)
UPDATE projects SET deleted_at = NULL WHERE id = 'test-id';  -- 복구
SELECT * FROM projects WHERE id = 'test-id';  -- 조회됨
```

### 2. CASCADE 검증

```sql
-- 외래키 제약 확인
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('tasks', 'documents')
  AND kcu.column_name IN ('parent_task_id', 'parent_document_id');
-- delete_rule should be 'CASCADE'
```

### 3. 인덱스 검증

```sql
-- 인덱스 목록 확인
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('projects', 'tasks', 'events')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 인덱스 사용률 확인 (실행 후 시간 경과 후)
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE tablename IN ('projects', 'tasks', 'events')
ORDER BY idx_scan DESC;
```

### 4. Materialized View 검증

```sql
-- Materialized View 존재 확인
SELECT matviewname, ispopulated
FROM pg_matviews
WHERE matviewname = 'user_statistics_mv';

-- 데이터 확인
SELECT * FROM user_statistics_mv LIMIT 5;

-- 갱신 테스트
SELECT refresh_user_statistics();
SELECT refreshed_at FROM user_statistics_mv LIMIT 1;
```

### 5. Full-Text Search 검증

```sql
-- search_vector 컬럼 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'projects' AND column_name = 'search_vector';

-- GIN 인덱스 확인
SELECT indexname, indexdef
FROM pg_indexes
WHERE indexname LIKE '%search%';

-- 검색 테스트
SELECT * FROM search_all(auth.uid(), 'test query', 10);
```

### 6. 순환 참조 방지 검증

```sql
-- 트리거 존재 확인
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE trigger_name IN ('prevent_task_cycles', 'prevent_document_cycles');

-- 기능 테스트 (에러 발생해야 함)
-- BEGIN;
-- INSERT INTO tasks (id, user_id, title) VALUES ('a', auth.uid(), 'Task A');
-- INSERT INTO tasks (id, user_id, title, parent_task_id) VALUES ('b', auth.uid(), 'Task B', 'a');
-- UPDATE tasks SET parent_task_id = 'b' WHERE id = 'a';  -- Error expected
-- ROLLBACK;
```

---

## 롤백 절차

### 긴급 롤백 (전체)

```bash
# 백업에서 복구
supabase db restore backup_before_migration_20251016.sql

# 또는 Supabase Dashboard
# Settings → Database → Backups → Restore
```

### 개별 마이그레이션 롤백

#### 20251016_06 롤백 (순환 참조 트리거)

```sql
DROP TRIGGER IF EXISTS prevent_task_cycles ON tasks;
DROP TRIGGER IF EXISTS prevent_document_cycles ON documents;
DROP FUNCTION IF EXISTS check_task_cycle();
DROP FUNCTION IF EXISTS check_document_cycle();
DROP FUNCTION IF EXISTS get_task_hierarchy(UUID);
DROP FUNCTION IF EXISTS get_document_hierarchy(UUID);
```

#### 20251016_05 롤백 (Full-Text Search)

```sql
DROP TRIGGER IF EXISTS projects_search_vector_update ON projects;
DROP TRIGGER IF EXISTS tasks_search_vector_update ON tasks;
DROP TRIGGER IF EXISTS documents_search_vector_update ON documents;

DROP FUNCTION IF EXISTS search_all(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS search_projects(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS search_tasks(UUID, TEXT, INTEGER);
DROP FUNCTION IF EXISTS search_documents(UUID, TEXT, INTEGER);

DROP INDEX IF EXISTS idx_projects_search;
DROP INDEX IF EXISTS idx_tasks_search;
DROP INDEX IF EXISTS idx_documents_search;

ALTER TABLE projects DROP COLUMN IF EXISTS search_vector;
ALTER TABLE tasks DROP COLUMN IF EXISTS search_vector;
ALTER TABLE documents DROP COLUMN IF EXISTS search_vector;
```

#### 20251016_04 롤백 (Materialized View)

```sql
DROP VIEW IF EXISTS user_statistics;
DROP FUNCTION IF EXISTS refresh_user_statistics();
DROP FUNCTION IF EXISTS refresh_user_stats_incremental(UUID);
DROP MATERIALIZED VIEW IF EXISTS user_statistics_mv;
```

#### 20251016_03 롤백 (복합 인덱스)

```sql
DROP INDEX IF EXISTS idx_projects_user_status;
DROP INDEX IF EXISTS idx_tasks_user_status;
DROP INDEX IF EXISTS idx_tasks_project_status;
DROP INDEX IF EXISTS idx_events_user_date_status;
DROP INDEX IF EXISTS idx_tasks_user_due_date;
DROP INDEX IF EXISTS idx_projects_user_created;
DROP INDEX IF EXISTS idx_tasks_user_created;
DROP INDEX IF EXISTS idx_events_user_start_time;
DROP INDEX IF EXISTS idx_tasks_user_section;
DROP INDEX IF EXISTS idx_todo_sections_order;
```

#### 20251016_02 롤백 (CASCADE)

```sql
ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_parent_task_id_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_parent_task_id_fkey
FOREIGN KEY (parent_task_id) REFERENCES tasks(id);  -- No CASCADE

ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS tasks_no_self_reference;

-- documents도 동일
```

#### 20251016_01 롤백 (Soft Delete) - ⚠️ 복잡

```sql
-- RLS 정책 원복 (예시 - projects)
DROP POLICY IF EXISTS "Users can view own active projects" ON projects;
DROP POLICY IF EXISTS "Users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update own active projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

CREATE POLICY "Users can manage own projects"
ON projects FOR ALL
USING (auth.uid() = user_id);

-- 함수 제거
DROP FUNCTION IF EXISTS soft_delete_user(UUID);
DROP FUNCTION IF EXISTS soft_delete_project(UUID);
DROP FUNCTION IF EXISTS permanent_delete_old_data();

-- 인덱스 제거
DROP INDEX IF EXISTS idx_projects_active;
DROP INDEX IF EXISTS idx_tasks_active;
DROP INDEX IF EXISTS idx_events_active;
DROP INDEX IF EXISTS idx_documents_active;
DROP INDEX IF EXISTS idx_clients_active;

-- 컬럼 제거 (주의: deleted_at을 사용 중이면 데이터 손실)
-- ALTER TABLE projects DROP COLUMN IF EXISTS deleted_at;
-- (다른 테이블도 동일)
```

---

## 문제 해결

### 문제 1: 마이그레이션 실행 중 타임아웃

**증상**: Execution timeout exceeded

**해결**:
```sql
-- Statement timeout 증가
SET statement_timeout = '10min';

-- 또는 데이터 배치 처리
UPDATE projects SET search_vector = ... WHERE id IN (SELECT id FROM projects LIMIT 1000);
```

### 문제 2: 순환 참조 감지

**증상**: Circular reference detected error

**해결**:
```sql
-- 순환 참조 찾기
WITH RECURSIVE task_chain AS (
  SELECT id, parent_task_id, ARRAY[id] as path
  FROM tasks
  WHERE parent_task_id IS NOT NULL

  UNION ALL

  SELECT t.id, t.parent_task_id, tc.path || t.id
  FROM tasks t
  JOIN task_chain tc ON t.id = tc.parent_task_id
  WHERE NOT (t.id = ANY(tc.path)) AND array_length(tc.path, 1) < 20
)
SELECT * FROM task_chain WHERE id = ANY(path[1:array_length(path,1)-1]);

-- 순환 제거
UPDATE tasks SET parent_task_id = NULL WHERE id IN (...);
```

### 문제 3: RLS 정책 충돌

**증상**: Permission denied for table

**해결**:
```sql
-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- 정책 재생성
DROP POLICY IF EXISTS ... ON ...;
CREATE POLICY ... ON ... ...;
```

### 문제 4: 인덱스 생성 실패

**증상**: Index creation failed

**해결**:
```sql
-- CONCURRENTLY 옵션으로 재시도
CREATE INDEX CONCURRENTLY idx_... ON ...;

-- 또는 기존 인덱스 제거 후 재생성
DROP INDEX IF EXISTS idx_...;
CREATE INDEX idx_... ON ...;
```

---

## 성능 모니터링

### 1. 쿼리 성능 측정

```sql
-- 대시보드 쿼리 (Before/After 비교)
EXPLAIN ANALYZE
SELECT * FROM projects
WHERE user_id = auth.uid() AND status = 'in_progress';

-- Materialized View 성능
EXPLAIN ANALYZE
SELECT * FROM user_statistics_mv WHERE user_id = auth.uid();

-- Full-Text Search 성능
EXPLAIN ANALYZE
SELECT * FROM search_projects(auth.uid(), 'test query', 20);
```

### 2. 인덱스 사용률

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE tablename IN ('projects', 'tasks', 'events', 'documents')
ORDER BY idx_scan DESC;
```

### 3. 테이블 크기 변화

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'tasks', 'events', 'documents')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 4. Materialized View 갱신 스케줄 설정

```sql
-- pg_cron 사용 (Supabase Pro 이상)
-- 15분마다 갱신
SELECT cron.schedule(
  'refresh-user-stats',
  '*/15 * * * *',
  $$SELECT refresh_user_statistics()$$
);

-- 스케줄 확인
SELECT * FROM cron.job;
```

또는 Supabase Edge Functions 사용:
```typescript
// edge-functions/refresh-stats/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async () => {
  const supabase = createClient(...)
  await supabase.rpc('refresh_user_statistics')
  return new Response('OK')
})

// Supabase Dashboard → Edge Functions → Deploy
// Set up cron trigger: every 15 minutes
```

---

## 다음 단계

### 단기 (1주일 이내)
- [ ] 성능 모니터링 대시보드 설정
- [ ] Materialized View 갱신 스케줄 구성
- [ ] 사용자 피드백 수집

### 중기 (1개월)
- [ ] 성능 지표 분석 및 튜닝
- [ ] 추가 최적화 기회 탐색
- [ ] 문서 업데이트

### 장기 (3개월)
- [ ] Nice to Have 개선사항 적용 (중복 플래그 제거 등)
- [ ] 스케일링 전략 재검토
- [ ] 다음 DB 개선 사이클 계획

---

## 참고 자료

- [Database-Structure-Analysis-Report.md](./Database-Structure-Analysis-Report.md) - 분석 보고서
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## 지원

문제 발생 시:
1. 이 문서의 [문제 해결](#문제-해결) 섹션 참조
2. Supabase Discord 커뮤니티 문의
3. GitHub Issues 등록 (프로젝트 저장소)
