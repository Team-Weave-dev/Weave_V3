# supabase/migrations/claude.md

**Supabase 마이그레이션 파일 네이밍 규칙 및 작성 가이드**

---

## 📁 디렉토리 개요

이 폴더는 Supabase 데이터베이스 스키마와 RLS 정책을 버전 관리하는 마이그레이션 파일들을 포함합니다.

---

## 🔤 파일 네이밍 규칙 (Naming Convention)

### 표준 형식

```
YYYYMMDD_NN_descriptive_name.sql
```

### 구성 요소

| 부분 | 설명 | 예시 |
|------|------|------|
| **YYYYMMDD** | 마이그레이션 생성 날짜 (ISO 8601 기본 형식) | `20250107` |
| **NN** | 실행 순서를 나타내는 2자리 번호 (01부터 시작) | `01`, `02`, `14` |
| **descriptive_name** | 마이그레이션의 목적을 설명하는 스네이크 케이스 이름 | `create_users_table`, `fix_rls_policies` |
| **.sql** | SQL 파일 확장자 | `.sql` |

### 예시

```
20250107_01_users.sql                           # Users 테이블 생성
20250107_02_clients.sql                         # Clients 테이블 생성
20250107_10_create_users_table_and_trigger.sql  # Users 테이블 및 트리거 재생성
20250107_14_fix_rls_policies.sql                # RLS 정책 수정
```

---

## 📋 실행 순서 번호 가이드

### 기본 테이블 생성 (01-09)

- `01`: Core 사용자 테이블 (users)
- `02-07`: 도메인 테이블들 (clients, projects, tasks, events, documents, settings)
- `08`: 추가 테이블들 (additional_tables)
- `09`: 함수 및 프로시저 (functions_and_procedures)

### 설정 및 수정 (10-99)

- `10-13`: 트리거, 정책, 권한 설정
- `14+`: 버그 수정, 정책 재설정, 스키마 변경

---

## ✅ 마이그레이션 작성 원칙

### 1. 파일 구조

모든 마이그레이션 파일은 다음 구조를 따릅니다:

```sql
-- =====================================================
-- [마이그레이션 제목]
-- =====================================================
-- 설명: [상세 설명]
-- 작성일: YYYY-MM-DD
-- 의존성: [이전 마이그레이션 파일명 (있을 경우)]

-- 1. [첫 번째 작업]
[SQL 코드]

-- 2. [두 번째 작업]
[SQL 코드]

-- 완료 메시지 (선택사항)
DO $$
BEGIN
  RAISE NOTICE '✅ [작업명] 완료';
END $$;
```

### 2. IF EXISTS / IF NOT EXISTS 사용

- **CREATE**: `CREATE TABLE IF NOT EXISTS ...`
- **DROP**: `DROP POLICY IF EXISTS ...`
- **ALTER**: 조건부 실행 필요 시 `DO $$ ... END $$;` 블록 활용

### 3. RLS (Row Level Security) 필수 설정

모든 사용자 데이터 테이블은 RLS를 활성화하고 최소 권한 원칙을 따릅니다:

```sql
-- RLS 활성화
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- INSERT 정책 (authenticated 사용자만)
CREATE POLICY "Enable insert for authenticated users only"
  ON [table_name] FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- SELECT 정책 (자신의 데이터만)
CREATE POLICY "Enable read access for users based on user_id"
  ON [table_name] FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- UPDATE 정책 (자신의 데이터만)
CREATE POLICY "Enable update for users based on user_id"
  ON [table_name] FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 정책 (자신의 데이터만)
CREATE POLICY "Enable delete for users based on user_id"
  ON [table_name] FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### 4. 트리거 및 함수

공통 함수는 재사용 가능하게 작성합니다:

```sql
-- updated_at 자동 업데이트 함수 (공통)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_[table_name]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 5. 인덱스 최적화

빈번히 조회되는 컬럼에 인덱스를 생성합니다:

```sql
CREATE INDEX IF NOT EXISTS idx_[table]_[column] ON [table]([column]);
CREATE INDEX IF NOT EXISTS idx_[table]_user_id ON [table](user_id);
```

---

## 🔒 RLS 정책 네이밍 규칙

### 표준 형식

```
"[Action] [description] for [target]"
```

### 예시

```sql
"Enable insert for authenticated users only"
"Enable read access for users based on user_id"
"Enable update for users based on user_id"
"Enable delete for users based on user_id"
```

---

## 🚨 주의 사항

### 1. 마이그레이션 순서

- 번호 순서대로 실행되므로 의존성이 있는 경우 순서를 신중히 결정
- 기존 마이그레이션 파일은 절대 수정하지 않고, 새로운 파일로 변경사항 추가

### 2. 롤백 불가

- Supabase 마이그레이션은 기본적으로 롤백을 지원하지 않음
- 변경사항을 취소하려면 새로운 마이그레이션 파일 작성 필요

### 3. 프로덕션 배포 전 테스트

- 로컬 Supabase 인스턴스에서 충분히 테스트 후 배포
- `supabase db reset` 명령어로 마이그레이션 전체 재실행 테스트

### 4. 스키마 충돌 방지

- `public` 스키마 명시: `public.users`, `public.projects` 등
- `auth.users`와 `public.users` 구분

---

## 📚 참조 예시

### 테이블 생성 (20250107_01_users.sql)

```sql
-- Users 테이블 생성 (Supabase Auth와 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Enable insert for authenticated users only"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 트리거
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 정책 수정 (20250107_14_fix_rls_policies.sql)

```sql
-- =====================================================
-- RLS 정책 재설정 (올바른 정책으로 수정)
-- =====================================================
-- 설명: RLS를 다시 활성화하고 회원가입이 가능하도록 정책 수정
-- 작성일: 2025-10-08

-- 1. RLS 다시 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 모두 삭제
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- 3. 새 정책 생성
CREATE POLICY "Enable insert for authenticated users only"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ RLS 정책 재설정 완료';
END $$;
```

---

## 🔗 관련 문서

- **Storage System**: [`src/lib/storage/claude.md`](../../src/lib/storage/claude.md) - 로컬스토리지 시스템 및 Supabase 마이그레이션 준비
- **Project Root**: [`CLAUDE.md`](../../CLAUDE.md) - 프로젝트 전체 아키텍처 및 네비게이션

---

## 📝 체크리스트

새 마이그레이션 작성 시:

- [ ] 파일명이 `YYYYMMDD_NN_description.sql` 형식을 따름
- [ ] 번호가 기존 마이그레이션과 중복되지 않음
- [ ] 주석으로 목적과 작성일을 명시
- [ ] `IF EXISTS` / `IF NOT EXISTS` 사용하여 멱등성 보장
- [ ] RLS 정책이 올바르게 설정됨 (사용자 데이터 테이블인 경우)
- [ ] 인덱스가 필요한 컬럼에 추가됨
- [ ] 로컬 환경에서 테스트 완료

---

**최종 업데이트**: 2025-10-08
**마이그레이션 파일 수**: 14개
**최신 마이그레이션**: `20250107_14_fix_rls_policies.sql`
