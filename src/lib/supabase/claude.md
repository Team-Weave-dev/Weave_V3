# supabase/ - Supabase 클라이언트 및 마이그레이션 준비

## 📋 개요

이 디렉토리는 **Supabase** 통합을 위한 클라이언트 설정 및 향후 **LocalStorage → Supabase 마이그레이션**을 위한 준비 시스템을 포함합니다.

## 🎯 시스템 역할

### 현재 상태 (Phase 11-15 완료)

- ✅ **Supabase 클라이언트**: Browser/Server 클라이언트 설정 완료
- ✅ **인증 미들웨어**: Next.js 미들웨어 기반 세션 관리
- ✅ **데이터베이스 스키마**: 11개 테이블 생성 및 RLS 정책 적용
- ✅ **인증 시스템**: 이메일/패스워드 + Google OAuth 구현
- ✅ **DualWriteAdapter**: LocalStorage + Supabase 병행 운영
- ✅ **데이터 마이그레이션**: v2-to-supabase 완료
- ✅ **모니터링 시스템**: 동기화 상태 추적 및 대시보드

## 📁 디렉토리 구조

```
supabase/
├── 📋 claude.md          # 🎯 이 파일 - Supabase 시스템 가이드
├── client.ts             # Browser 클라이언트 생성
├── server.ts             # Server 클라이언트 생성
└── middleware.ts         # 인증 미들웨어
```

## 🔧 현재 구현 상태

### 1. client.ts - Browser 클라이언트

**브라우저 환경용 Supabase 클라이언트**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 테스트 모드: Supabase URL이 없으면 더미 값 사용
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  return createBrowserClient(url, key)
}
```

**사용 예시**:
```typescript
'use client'

import { createClient } from '@/lib/supabase/client'

export default function ClientComponent() {
  const supabase = createClient()

  // Supabase 쿼리 실행
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
}
```

### 2. server.ts - Server 클라이언트

**서버 컴포넌트 및 Server Actions용 클라이언트**

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component에서 호출된 경우 무시
          // 미들웨어에서 세션 갱신 처리
        }
      },
    },
  })
}
```

**사용 예시**:
```typescript
// Server Component
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')

  return <ProjectList projects={projects} />
}
```

### 3. middleware.ts - 인증 미들웨어

**Next.js 미들웨어를 통한 세션 관리**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Supabase 클라이언트 생성 (쿠키 기반)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // Request 및 Response 쿠키 동기화
        }
      }
    }
  )

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser()

  // 비인증 사용자 리다이렉트
  if (!user && !isPublicRoute(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

**보안 주의사항**:
- ⚠️ `createServerClient`와 `auth.getUser()` 사이에 로직 삽입 금지 (CSRF 취약점)
- ⚠️ `supabaseResponse` 객체를 반드시 그대로 반환

## 🔗 Storage 시스템과의 통합 계획

### Phase 10: SupabaseAdapter 구현

**Storage Adapter 패턴 통합**

```typescript
// 향후 구현 예정: src/lib/storage/adapters/SupabaseAdapter.ts
import { createClient } from '@/lib/supabase/client'
import type { StorageAdapter } from '@/lib/storage/types'

export class SupabaseAdapter implements StorageAdapter {
  private supabase = createClient()
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

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

  async remove(key: string): Promise<void> {
    // DELETE 구현
  }

  async clear(): Promise<void> {
    // 전체 삭제 구현 (주의: 사용자별)
  }

  async keys(): Promise<string[]> {
    // 키 목록 조회
  }
}
```

### Phase 10: DualWriteAdapter 구현

**LocalStorage + Supabase 병행 운영**

```typescript
// 향후 구현 예정: src/lib/storage/adapters/DualWriteAdapter.ts
import type { StorageAdapter } from '@/lib/storage/types'
import { LocalStorageAdapter } from './LocalStorageAdapter'
import { SupabaseAdapter } from './SupabaseAdapter'

export class DualWriteAdapter implements StorageAdapter {
  private local: LocalStorageAdapter
  private supabase: SupabaseAdapter
  private syncQueue: Map<string, any> = new Map()

  constructor(local: LocalStorageAdapter, supabase: SupabaseAdapter) {
    this.local = local
    this.supabase = supabase
    this.startSyncWorker()
  }

  async get(key: string): Promise<any> {
    // 1. LocalStorage에서 먼저 읽기 (빠른 응답)
    const localData = await this.local.get(key)

    // 2. 백그라운드에서 Supabase 동기화 확인
    this.verifySyncInBackground(key, localData)

    return localData
  }

  async set(key: string, value: any): Promise<void> {
    // 1. LocalStorage에 즉시 저장
    await this.local.set(key, value)

    // 2. Supabase 동기화 큐에 추가
    this.syncQueue.set(key, value)

    // 3. 비동기 동기화 시도
    this.syncToSupabase(key, value).catch(error => {
      console.error('Supabase sync failed:', error)
      // 실패 시 재시도 큐에 추가
    })
  }

  private async syncToSupabase(key: string, value: any): Promise<void> {
    await this.supabase.set(key, value)
    this.syncQueue.delete(key)
  }

  private startSyncWorker(): void {
    // 주기적으로 syncQueue 처리
    setInterval(() => {
      this.processSyncQueue()
    }, 5000) // 5초마다
  }
}
```

### Phase 11: 데이터 마이그레이션

**v2-to-supabase 마이그레이션 스크립트**

```typescript
// 향후 구현 예정: src/lib/storage/migrations/v2-to-supabase.ts
import { storageManager } from '@/lib/storage'
import { createClient } from '@/lib/supabase/client'

export async function migrateV2ToSupabase(userId: string): Promise<void> {
  const supabase = createClient()

  // 1. LocalStorage에서 모든 데이터 읽기
  const projects = await storageManager.get<Project[]>('projects') || []
  const tasks = await storageManager.get<Task[]>('tasks') || []
  const events = await storageManager.get<CalendarEvent[]>('events') || []
  const clients = await storageManager.get<Client[]>('clients') || []
  const documents = await storageManager.get<Document[]>('documents') || []
  const settings = await storageManager.get<Settings>('settings')

  // 2. Supabase에 배치 업로드
  await supabase.from('projects').upsert(
    projects.map(p => ({ ...p, user_id: userId }))
  )

  await supabase.from('tasks').upsert(
    tasks.map(t => ({ ...t, user_id: userId }))
  )

  await supabase.from('events').upsert(
    events.map(e => ({ ...e, user_id: userId }))
  )

  // 3. 마이그레이션 완료 플래그
  await supabase.from('migration_status').insert({
    user_id: userId,
    version: 'v2-to-supabase',
    migrated_at: new Date().toISOString()
  })
}
```

## 🚀 마이그레이션 로드맵

### Phase 9-10: LocalStorage 및 Supabase 준비 ✅ 완료
- ✅ StorageManager 및 Adapter 시스템 완료
- ✅ 7개 엔티티 타입 정의 완료
- ✅ 도메인 서비스 7개 완료
- ✅ 마이그레이션 시스템 (v1-to-v2) 완료
- ✅ SupabaseAdapter 구현
- ✅ DualWriteAdapter 구현
- ✅ Supabase 스키마 정의 (SQL 마이그레이션)
- ✅ v2-to-supabase 마이그레이션 스크립트

### Phase 11-15: Supabase 마이그레이션 ✅ 완료
- ✅ DualWrite 모드로 전환 (안전한 병행 운영)
- ✅ 데이터 검증 및 무결성 확인
- ✅ 모니터링 시스템 구축
- ✅ 최종 전환 시스템 구축
- ✅ 롤백 및 긴급 복구 시스템

### 향후 작업 (진행 예정)
- 🔄 성능 최적화
- 🔄 실시간 기능 활성화
- 🔄 백업 자동화
- 🔄 문서 업데이트

## 🗄️ Supabase 스키마 (Phase 11 완료)

```sql
-- projects 테이블
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  client_id UUID REFERENCES clients(id),
  no TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_content TEXT,
  status TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  payment_progress INTEGER,
  wbs_tasks JSONB DEFAULT '[]',
  settlement_method TEXT,
  payment_status TEXT,
  total_amount NUMERIC,
  document_status JSONB,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  registration_date TIMESTAMPTZ NOT NULL,
  modified_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client_id ON projects(client_id);

-- 업데이트 트리거
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 실시간 구독 (Phase 11)

```typescript
// Realtime 구독 예시
const supabase = createClient()

const subscription = supabase
  .channel('projects-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Project changed:', payload)
      // StorageManager 구독자들에게 알림
    }
  )
  .subscribe()
```

## 🚨 마이그레이션 주의사항

### 1. 데이터 무결성

```typescript
// ✅ 마이그레이션 전 백업 필수
import { backupManager } from '@/lib/storage/utils'

const backup = await backupManager.createBackup('Before Supabase migration')

// ✅ 마이그레이션 검증
const validation = await validateMigration(userId)
if (!validation.success) {
  throw new Error('Migration validation failed')
}

// ❌ 백업 없이 마이그레이션 금지
```

### 2. 점진적 전환

```typescript
// ✅ DualWrite 모드로 안전하게 전환
const dualAdapter = new DualWriteAdapter(localAdapter, supabaseAdapter)
const storage = new StorageManager(dualAdapter)

// ✅ 충분한 검증 기간 (최소 1주일)
// ✅ 롤백 계획 준비

// ❌ 한 번에 완전 전환 (위험)
```

### 3. RLS 정책 검증

```typescript
// ✅ RLS 정책 테스트
const testProject = await supabase
  .from('projects')
  .select('*')
  .eq('id', testId)

if (testProject.data && testProject.data.user_id !== currentUserId) {
  throw new Error('RLS policy breach!')
}

// ❌ RLS 정책 없이 프로덕션 배포
```

## 🔗 관련 문서

- **Storage System**: [`../storage/claude.md`](../storage/claude.md) - LocalStorage 통합 관리 시스템
- **Migrations**: [`../storage/migrations/claude.md`](../storage/migrations/claude.md) - 마이그레이션 시스템
- **Schema**: [`../../../docs/LOCAL-STORAGE-SCHEMA.md`](../../../docs/LOCAL-STORAGE-SCHEMA.md) - 데이터 스키마
- **Migration Plan**: [`../../../docs/LOCAL-STORAGE-MIGRATION.md`](../../../docs/LOCAL-STORAGE-MIGRATION.md) - Supabase 마이그레이션 계획

---

**Supabase 시스템은 LocalStorage 기반 Storage 시스템의 완전한 클라우드 전환을 성공적으로 완료했으며, DualWrite 모드를 통한 안전한 병행 운영과 모니터링 시스템을 제공합니다.**

*마지막 업데이트: 2025-10-09*
*현재 상태: Phase 11-15 완료 (Supabase 마이그레이션 및 전환 완료)*
*작성자: Claude Code*
