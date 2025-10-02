# 로컬스토리지 → Supabase 마이그레이션 전략

## 📋 목차
1. [개요](#개요)
2. [마이그레이션 단계](#마이그레이션-단계)
3. [데이터 매핑](#데이터-매핑)
4. [구현 계획](#구현-계획)
5. [리스크 관리](#리스크-관리)
6. [체크리스트](#체크리스트)

## 개요

### 마이그레이션 목표
- **데이터 무손실**: 모든 사용자 데이터 안전하게 이전
- **다운타임 최소화**: 점진적 마이그레이션으로 서비스 지속
- **롤백 가능**: 문제 발생 시 즉시 이전 상태로 복구
- **사용자 투명성**: 사용자가 변화를 느끼지 못하도록

### 마이그레이션 아키텍처

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (React Components & Hooks)             │
└────────────┬────────────────────────────┘
             │
      ┌──────▼──────┐
      │ Storage API  │ ← 추상화 레이어
      └──────┬──────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──┐         ┌───▼────┐
│Local │         │Supabase│
│Storage│        │   DB    │
└───────┘        └─────────┘

Phase 1: LocalStorage Only
Phase 2: Dual Write (LocalStorage + Supabase)
Phase 3: Dual Read (Supabase Primary, LocalStorage Fallback)
Phase 4: Supabase Only
```

## 마이그레이션 단계

### Phase 0: 준비 단계 (현재)
**목표**: 통합 Storage API 구축 및 데이터 정규화

```typescript
// 현재 상태
localStorage.setItem('weave_custom_projects', JSON.stringify(projects));

// 목표 상태
await storageManager.set('projects', projects);
```

**작업 목록**:
- [x] 아키텍처 설계
- [x] 데이터 스키마 정의
- [ ] StorageManager 클래스 구현
- [ ] LocalStorageAdapter 구현
- [ ] 기존 코드를 Storage API로 마이그레이션

### Phase 1: LocalStorage 통합 (1-2주)
**목표**: 모든 데이터를 통합 Storage API로 관리

```typescript
class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    const data = localStorage.getItem(`weave_v2_${key}`);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(`weave_v2_${key}`, JSON.stringify(value));
  }
}

const storage = new StorageManager(new LocalStorageAdapter());
```

**마이그레이션 스크립트**:
```typescript
// 기존 데이터 마이그레이션
async function migrateToUnifiedStorage() {
  // 1. 기존 키들 읽기
  const oldProjects = localStorage.getItem('weave_custom_projects');
  const oldDocuments = localStorage.getItem('weave_project_documents');
  const oldDashboard = localStorage.getItem('weave-dashboard-layout');

  // 2. 새 형식으로 변환
  if (oldProjects) {
    await storage.set('projects', JSON.parse(oldProjects));
  }
  if (oldDocuments) {
    await storage.set('documents', JSON.parse(oldDocuments));
  }
  if (oldDashboard) {
    await storage.set('dashboard:layout', JSON.parse(oldDashboard));
  }

  // 3. 버전 정보 저장
  await storage.set('_version', { version: 2, migratedAt: new Date().toISOString() });

  // 4. 기존 키 제거 (백업 후)
  backupOldData();
  cleanupOldKeys();
}
```

### Phase 2: Supabase 설정 (3-4주)
**목표**: Supabase 프로젝트 설정 및 스키마 생성

#### Supabase 프로젝트 설정
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# 로컬 개발 환경 시작
supabase start
```

#### 데이터베이스 스키마 생성
```sql
-- migrations/001_initial_schema.sql

-- Users 테이블 (Supabase Auth 통합)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects 테이블
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  no TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'on_hold', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  payment_progress INTEGER DEFAULT 0 CHECK (payment_progress >= 0 AND payment_progress <= 100),
  start_date DATE,
  end_date DATE,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  modified_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  budget DECIMAL(15, 2),
  actual_cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'KRW',
  has_contract BOOLEAN DEFAULT false,
  has_billing BOOLEAN DEFAULT false,
  has_documents BOOLEAN DEFAULT false,
  tags TEXT[],
  priority TEXT DEFAULT 'medium',
  visibility TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, no)
);

-- Clients 테이블
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address JSONB,
  business_number TEXT,
  tax_id TEXT,
  website TEXT,
  industry TEXT,
  contacts JSONB DEFAULT '[]',
  tags TEXT[],
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks 테이블
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  assignee_id UUID REFERENCES users(id),
  parent_task_id UUID REFERENCES tasks(id),
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  tags TEXT[],
  attachments JSONB DEFAULT '[]',
  recurring JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events 테이블
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'Asia/Seoul',
  type TEXT NOT NULL DEFAULT 'other',
  category TEXT,
  status TEXT DEFAULT 'confirmed',
  attendees JSONB DEFAULT '[]',
  reminders JSONB DEFAULT '[]',
  recurring JSONB,
  color TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents 테이블
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content TEXT,
  template_id UUID,
  version INTEGER DEFAULT 1,
  tags TEXT[],
  size INTEGER,
  signatures JSONB DEFAULT '[]',
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings 테이블
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dashboard JSONB DEFAULT '{}',
  calendar JSONB DEFAULT '{}',
  projects JSONB DEFAULT '{}',
  notifications JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_client_id ON projects(client_id);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);

CREATE INDEX idx_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_events_project_id ON calendar_events(project_id);
CREATE INDEX idx_events_start_date ON calendar_events(start_date);

CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_documents_type ON documents(type);

-- RLS (Row Level Security) 정책
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 각 테이블에 대한 RLS 정책 생성
CREATE POLICY "Users can manage own data" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data" ON clients
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data" ON tasks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data" ON calendar_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data" ON documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);
```

### Phase 3: Dual Write (5-6주)
**목표**: 데이터를 LocalStorage와 Supabase에 동시 저장

```typescript
class DualWriteAdapter implements StorageAdapter {
  private local: LocalStorageAdapter;
  private supabase: SupabaseAdapter;

  async set<T>(key: string, value: T): Promise<void> {
    // 1. LocalStorage에 먼저 저장 (빠른 응답)
    await this.local.set(key, value);

    // 2. Supabase에 비동기로 저장
    this.supabase.set(key, value).catch(error => {
      console.error('Supabase sync failed:', error);
      // 실패 시 재시도 큐에 추가
      this.addToRetryQueue(key, value);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    // LocalStorage에서 먼저 읽기 (빠른 응답)
    return this.local.get<T>(key);
  }
}
```

**동기화 모니터링**:
```typescript
class SyncMonitor {
  private syncStatus = new Map<string, SyncStatus>();

  async checkSyncStatus(): Promise<SyncReport> {
    const report: SyncReport = {
      total: 0,
      synced: 0,
      pending: 0,
      failed: 0,
      items: []
    };

    for (const [key, status] of this.syncStatus) {
      report.total++;
      if (status === 'synced') report.synced++;
      if (status === 'pending') report.pending++;
      if (status === 'failed') report.failed++;
    }

    return report;
  }

  async retryFailedSyncs(): Promise<void> {
    const failed = Array.from(this.syncStatus.entries())
      .filter(([_, status]) => status === 'failed');

    for (const [key] of failed) {
      await this.retrySingleSync(key);
    }
  }
}
```

### Phase 4: Dual Read (7-8주)
**목표**: Supabase를 주 데이터 소스로, LocalStorage를 폴백으로 사용

```typescript
class DualReadAdapter implements StorageAdapter {
  private local: LocalStorageAdapter;
  private supabase: SupabaseAdapter;

  async get<T>(key: string): Promise<T | null> {
    try {
      // 1. Supabase에서 먼저 읽기
      const data = await this.supabase.get<T>(key);

      // 2. LocalStorage 업데이트 (캐시)
      if (data !== null) {
        await this.local.set(key, data);
      }

      return data;
    } catch (error) {
      console.warn('Supabase read failed, using LocalStorage:', error);
      // 3. 실패 시 LocalStorage에서 읽기
      return this.local.get<T>(key);
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    // 여전히 양쪽에 저장
    await Promise.all([
      this.supabase.set(key, value),
      this.local.set(key, value)
    ]);
  }
}
```

### Phase 5: Supabase 전용 (9-10주)
**목표**: LocalStorage 완전 제거, Supabase만 사용

```typescript
class SupabaseAdapter implements StorageAdapter {
  private supabase: SupabaseClient;

  async get<T>(key: string): Promise<T | null> {
    const [entity, ...params] = key.split(':');

    switch (entity) {
      case 'projects':
        const { data } = await this.supabase
          .from('projects')
          .select('*')
          .eq('user_id', this.userId);
        return data as T;

      case 'project':
        const projectId = params[0];
        const { data: project } = await this.supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        return project as T;

      // ... 다른 엔티티들
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    const [entity, ...params] = key.split(':');

    switch (entity) {
      case 'projects':
        await this.supabase
          .from('projects')
          .upsert(value as any);
        break;

      // ... 다른 엔티티들
    }
  }
}
```

## 데이터 매핑

### 키 변환 규칙

| LocalStorage 키 | Supabase 테이블/쿼리 | 변환 로직 |
|----------------|---------------------|---------|
| `projects` | `SELECT * FROM projects WHERE user_id = ?` | 배열 → 행 |
| `project:${id}` | `SELECT * FROM projects WHERE id = ?` | 객체 → 행 |
| `documents:project:${id}` | `SELECT * FROM documents WHERE project_id = ?` | 배열 → 행 |
| `tasks:project:${id}` | `SELECT * FROM tasks WHERE project_id = ?` | 배열 → 행 |
| `events:client:${id}` | `SELECT * FROM calendar_events WHERE client_id = ?` | 배열 → 행 |
| `settings` | `SELECT * FROM user_settings WHERE user_id = ?` | 객체 → 행 |

### 데이터 변환 함수

```typescript
// LocalStorage → Supabase 변환
function transformProjectForSupabase(project: LocalProject): SupabaseProject {
  return {
    ...project,
    user_id: getCurrentUserId(),
    created_at: project.createdAt,
    updated_at: project.updatedAt,
    // camelCase → snake_case
    start_date: project.startDate,
    end_date: project.endDate,
    registration_date: project.registrationDate,
    modified_date: project.modifiedDate,
    payment_progress: project.paymentProgress,
    has_contract: project.hasContract,
    has_billing: project.hasBilling,
    has_documents: project.hasDocuments
  };
}

// Supabase → LocalStorage 변환
function transformProjectFromSupabase(row: SupabaseProject): LocalProject {
  return {
    ...row,
    // snake_case → camelCase
    startDate: row.start_date,
    endDate: row.end_date,
    registrationDate: row.registration_date,
    modifiedDate: row.modified_date,
    paymentProgress: row.payment_progress,
    hasContract: row.has_contract,
    hasBilling: row.has_billing,
    hasDocuments: row.has_documents,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
```

## 구현 계획

### 개발 환경 설정

```bash
# 필요한 패키지 설치
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react
npm install lz-string  # 데이터 압축용

# 환경 변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase 클라이언트 초기화

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'weave'
    }
  }
});
```

### 인증 통합

```typescript
// src/lib/supabase/auth.ts
import { supabase } from './client';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: email.split('@')[0] // 기본 이름 설정
      }
    }
  });

  if (error) throw error;

  // 사용자 프로필 생성
  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name
    });
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

## 🔐 하이브리드 데이터 접근 전략

### 접근 방식 결정 기준

| 접근 방식 | 사용 시기 | 장점 | 예시 |
|----------|---------|------|------|
| **RLS 직접 호출** | 단순 CRUD | 빠른 응답, 간단한 구현 | 개인 데이터 조회/수정 |
| **API Routes** | 복잡한 로직 | 비즈니스 로직 캡슐화, 보안 강화 | 트랜잭션, 외부 API 연동 |

### 📗 RLS 직접 호출 (단순 CRUD)

**적합한 경우**:
- 단일 테이블 CRUD 작업
- 사용자 소유 데이터 직접 접근
- 실시간 구독이 필요한 경우
- 간단한 필터링과 정렬

```typescript
// src/lib/supabase/services/projects.ts

// ✅ 단순 조회 - RLS 직접 호출
export async function getMyProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ✅ 단일 항목 조회 - RLS 직접 호출
export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*),
      tasks(count),
      documents(count)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ✅ 단순 생성 - RLS 직접 호출
export async function createProject(project: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      user_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ✅ 단순 업데이트 - RLS 직접 호출
export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ✅ 실시간 구독 - RLS 직접 호출
export function subscribeToProjectChanges(
  callback: (payload: any) => void
) {
  return supabase
    .channel('project-changes')
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects'
      },
      callback
    )
    .subscribe();
}
```

### 📘 API Routes 사용 (복잡한 로직)

**적합한 경우**:
- 여러 테이블에 걸친 트랜잭션
- 복잡한 비즈니스 규칙 적용
- 외부 API 통합
- 권한 검증이 복잡한 경우
- 파일 업로드/처리
- 이메일 발송 등 부가 작업

```typescript
// src/app/api/projects/complete/route.ts

export async function POST(request: Request) {
  try {
    // 1. 인증 확인
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await request.json();

    // 2. 트랜잭션 시작
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id) // 소유권 확인
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 3. 복잡한 비즈니스 로직
    // - 프로젝트 상태 변경
    // - 관련 태스크 모두 완료 처리
    // - 최종 보고서 자동 생성
    // - 청구서 생성
    // - 이메일 알림 발송

    const results = await Promise.all([
      // 프로젝트 완료 처리
      supabase
        .from('projects')
        .update({
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq('id', projectId),

      // 모든 태스크 완료 처리
      supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .neq('status', 'completed'),

      // 최종 보고서 생성
      supabase
        .from('documents')
        .insert({
          project_id: projectId,
          user_id: user.id,
          name: `최종 보고서 - ${project.name}`,
          type: 'report',
          status: 'complete',
          content: await generateFinalReport(project)
        }),

      // 청구서 생성
      supabase
        .from('documents')
        .insert({
          project_id: projectId,
          user_id: user.id,
          name: `최종 청구서 - ${project.name}`,
          type: 'invoice',
          status: 'complete',
          content: await generateInvoice(project)
        })
    ]);

    // 4. 외부 서비스 호출
    if (project.client_id) {
      await sendCompletionEmail(project.client_id, project);
    }

    // 5. 활동 로그 기록
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        action: 'project_completed',
        resource_type: 'project',
        resource_id: projectId,
        metadata: {
          project_name: project.name,
          completion_date: new Date().toISOString()
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Project completed successfully'
    });

  } catch (error) {
    console.error('Error completing project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/reports/generate/route.ts

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { startDate, endDate, type } = await request.json();

    // 복잡한 집계 쿼리
    const { data: reportData } = await supabase.rpc('generate_report', {
      user_id: user.id,
      start_date: startDate,
      end_date: endDate,
      report_type: type
    });

    // PDF 생성 (외부 라이브러리 사용)
    const pdfBuffer = await generatePDF(reportData);

    // Storage에 저장
    const fileName = `reports/${user.id}/${Date.now()}_${type}.pdf`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf'
      });

    if (uploadError) throw uploadError;

    // 보고서 메타데이터 저장
    await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        type,
        start_date: startDate,
        end_date: endDate,
        file_path: fileName,
        summary: reportData.summary
      });

    return NextResponse.json({
      success: true,
      url: supabase.storage.from('reports').getPublicUrl(fileName).data.publicUrl
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Report generation failed' },
      { status: 500 }
    );
  }
}
```

### 하이브리드 접근법 구현 패턴

```typescript
// src/lib/supabase/hybrid-service.ts

export class ProjectService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // 📗 단순 조회 - RLS 직접 호출
  async getProjects() {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*');

    if (error) throw error;
    return data;
  }

  // 📗 단순 업데이트 - RLS 직접 호출
  async updateProjectName(id: string, name: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .update({ name })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 📘 복잡한 작업 - API Route 호출
  async completeProject(projectId: string) {
    const response = await fetch('/api/projects/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId })
    });

    if (!response.ok) {
      throw new Error('Failed to complete project');
    }

    return response.json();
  }

  // 📘 보고서 생성 - API Route 호출
  async generateReport(params: ReportParams) {
    const response = await fetch('/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    return response.json();
  }

  // 📗 실시간 구독 - RLS 직접 호출
  subscribeToChanges(callback: (payload: any) => void) {
    return this.supabase
      .channel('projects')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        callback
      )
      .subscribe();
  }
}
```

### 사용 예시

```typescript
// src/app/projects/page.tsx

export default function ProjectsPage() {
  const projectService = new ProjectService(supabase);

  // 📗 단순 데이터 로딩 - RLS
  const { data: projects } = useSWR('projects',
    () => projectService.getProjects()
  );

  // 📗 단순 업데이트 - RLS
  const handleRename = async (id: string, name: string) => {
    await projectService.updateProjectName(id, name);
    mutate('projects');
  };

  // 📘 복잡한 작업 - API Route
  const handleComplete = async (projectId: string) => {
    const result = await projectService.completeProject(projectId);
    toast.success('프로젝트가 완료되었습니다');
    mutate('projects');
  };

  // 📘 보고서 생성 - API Route
  const handleGenerateReport = async () => {
    const report = await projectService.generateReport({
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      type: 'annual'
    });
    window.open(report.url, '_blank');
  };

  return (
    // UI 구현...
  );
}
```

## 리스크 관리

### 잠재적 리스크

| 리스크 | 영향도 | 발생 가능성 | 대응 방안 |
|--------|-------|-----------|---------|
| 데이터 손실 | 높음 | 낮음 | 백업 시스템, 트랜잭션 로그 |
| 동기화 실패 | 중간 | 중간 | 재시도 큐, 수동 동기화 옵션 |
| 성능 저하 | 중간 | 중간 | 캐싱, 인덱싱, 쿼리 최적화 |
| 네트워크 장애 | 높음 | 낮음 | 오프라인 모드, LocalStorage 폴백 |
| 스키마 불일치 | 높음 | 낮음 | 버전 관리, 마이그레이션 테스트 |

### 백업 전략

```typescript
class BackupManager {
  async createBackup(): Promise<BackupData> {
    const timestamp = new Date().toISOString();
    const data: BackupData = {
      version: 2,
      timestamp,
      projects: await storage.get('projects'),
      clients: await storage.get('clients'),
      tasks: await storage.get('tasks'),
      events: await storage.get('events'),
      settings: await storage.get('settings')
    };

    // 1. LocalStorage 백업
    localStorage.setItem(`backup_${timestamp}`, JSON.stringify(data));

    // 2. 파일로 다운로드
    this.downloadBackup(data);

    // 3. 클라우드 백업 (선택적)
    await this.uploadToCloud(data);

    return data;
  }

  async restoreBackup(backup: BackupData): Promise<void> {
    // 1. 현재 데이터 백업
    await this.createBackup();

    // 2. 백업 데이터 복원
    await storage.set('projects', backup.projects);
    await storage.set('clients', backup.clients);
    await storage.set('tasks', backup.tasks);
    await storage.set('events', backup.events);
    await storage.set('settings', backup.settings);

    // 3. 버전 정보 업데이트
    await storage.set('_version', {
      version: backup.version,
      restoredAt: new Date().toISOString()
    });
  }
}
```

### 모니터링 시스템

```typescript
class MigrationMonitor {
  private metrics = {
    totalRecords: 0,
    migratedRecords: 0,
    failedRecords: 0,
    syncLatency: [],
    errors: []
  };

  async trackMigration(entity: string, success: boolean, latency?: number) {
    this.metrics.totalRecords++;

    if (success) {
      this.metrics.migratedRecords++;
      if (latency) {
        this.metrics.syncLatency.push(latency);
      }
    } else {
      this.metrics.failedRecords++;
    }

    // 실시간 대시보드 업데이트
    this.updateDashboard();

    // 임계값 체크
    if (this.metrics.failedRecords > 10) {
      this.alertAdmin('High failure rate detected');
    }
  }

  getReport(): MigrationReport {
    return {
      ...this.metrics,
      successRate: (this.metrics.migratedRecords / this.metrics.totalRecords) * 100,
      averageLatency: this.metrics.syncLatency.reduce((a, b) => a + b, 0) / this.metrics.syncLatency.length
    };
  }
}
```

## 체크리스트

### Phase 0: 준비 ✅
- [x] 아키텍처 설계 문서 작성
- [x] 데이터 스키마 설계
- [x] 마이그레이션 전략 수립
- [ ] StorageManager 클래스 구현
- [ ] LocalStorageAdapter 구현
- [ ] 테스트 환경 구축

### Phase 1: LocalStorage 통합 ⏳
- [ ] 기존 코드 마이그레이션
  - [ ] 대시보드 위젯
  - [ ] 프로젝트 데이터
  - [ ] 할일 목록
  - [ ] 캘린더 이벤트
  - [ ] 문서 관리
- [ ] 통합 테스트
- [ ] 성능 측정

### Phase 2: Supabase 설정 ⏳
- [ ] Supabase 프로젝트 생성
- [ ] 데이터베이스 스키마 생성
- [ ] RLS 정책 설정
- [ ] 인증 시스템 통합
- [ ] API 엔드포인트 테스트

### Phase 3: Dual Write ⏳
- [ ] DualWriteAdapter 구현
- [ ] 동기화 모니터링 시스템
- [ ] 재시도 큐 구현
- [ ] 백업 시스템 구축
- [ ] 통합 테스트

### Phase 4: Dual Read ⏳
- [ ] DualReadAdapter 구현
- [ ] 캐싱 시스템 최적화
- [ ] 폴백 메커니즘 테스트
- [ ] 성능 벤치마크

### Phase 5: Supabase 전용 ⏳
- [ ] SupabaseAdapter 최종 구현
- [ ] LocalStorage 제거
- [ ] 최종 테스트
- [ ] 프로덕션 배포

## 성공 지표

### 기술적 지표
- **데이터 무결성**: 100% 데이터 보존
- **동기화 성공률**: > 99.9%
- **응답 시간**: < 100ms (캐시 히트)
- **API 레이턴시**: < 500ms (캐시 미스)

### 사용자 경험 지표
- **다운타임**: 0분
- **오류 발생률**: < 0.1%
- **사용자 불편**: 최소화
- **성능 체감**: 동일 또는 개선

## 롤백 계획

### 긴급 롤백 절차
```typescript
class RollbackManager {
  async emergencyRollback(): Promise<void> {
    // 1. 새 요청 차단
    this.blockNewRequests();

    // 2. 현재 상태 백업
    await this.createEmergencyBackup();

    // 3. 이전 어댑터로 전환
    storageManager.setAdapter(new LocalStorageAdapter());

    // 4. 사용자 알림
    this.notifyUsers('시스템 점검 중입니다');

    // 5. 로그 수집
    this.collectLogs();
  }
}
```

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js Supabase 통합 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [RLS 정책 베스트 프랙티스](https://supabase.com/docs/guides/auth/row-level-security)

---

*작성일: 2025-01-03*
*버전: 1.0.0*
*작성자: Claude Code*