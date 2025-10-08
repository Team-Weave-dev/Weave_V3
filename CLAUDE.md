# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🌐 최우선 규칙: 한글로 소통하기 (TOP PRIORITY: Communicate in Korean)

**모든 응답과 설명은 반드시 한글로 작성하세요. 코드 주석과 변수명은 영어를 유지합니다.**

- 사용자와의 모든 대화: 한글 사용(생각 과정 포함)
- 코드 설명 및 문서: 한글 작성
- 코드 내부 (변수명, 함수명, 주석): 영어 유지
- 에러 메시지 설명: 한글로 번역하여 설명

## 🚨 CRITICAL: 필수 읽기 지시사항 (MANDATORY READING INSTRUCTION)

**이 파일은 작업 시작 전 반드시 읽어야 합니다. 이 지시를 무시하면 작업이 실패합니다.**

### ⚡ 즉시 실행 체크리스트

1. ✅ 이 파일(CLAUDE.md)을 완전히 읽었는가?
2. ✅ 작업 유형을 파악했는가? (컴포넌트/페이지/설정/기타)
3. ✅ 해당 도메인의 claude.md를 읽었는가?
4. ✅ 중앙화 시스템(config/brand.ts, constants.ts)을 확인했는가?

**위 체크리스트를 완료하지 않으면 절대 작업을 시작하지 마세요.**

## 🚀 Project Overview

**Modern React/Next.js UI Components Library**

- Built with TypeScript, shadcn/ui, and Tailwind CSS
- Centralized configuration system preventing hard-coding
- 42 reusable UI components with full accessibility support
- Auto-documenting architecture with real-time synchronization

## ⚡ Quick Start

### Essential Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run type-check   # TypeScript validation
npm run lint         # Code quality check
```

### Documentation Commands

```bash
npm run docs:update  # Update all claude.md files
npm run docs:watch   # Real-time documentation sync
npm run dev:docs     # Dev server + documentation watch
```

## 🏗️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (100% type safety)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Quality**: ESLint + Prettier
- **Documentation**: Auto-sync claude.md system

## 📁 Project Architecture

```
Weave_V3/
├── 📋 CLAUDE.md                    # 🎯 This file - Project navigation hub
├── 📁 src/                         # Source code root
│   ├── 📋 claude.md                # 📚 Source architecture guide
│   ├── 📱 app/                     # Next.js App Router pages
│   │   ├── 📋 claude.md            # 🌐 Pages & routing guide
│   │   ├── 📊 projects/             # Project management page
│   │   └── components/page.tsx     # Components demo
│   ├── ⚙️ config/ (2개)           # Centralized configuration
│   │   └── 📋 claude.md            # 🔧 Configuration system guide
│   ├── 🧩 components/              # UI component library
│   │   ├── 📋 claude.md            # 🧩 Component library guide
│   │   └── 🎨 ui/                  # shadcn/ui components + advanced table
│   │       └── 📋 claude.md        # 🎨 Component implementation guide
│   ├── 🪝 hooks/                   # Custom React hooks
│   │   └── 📋 claude.md            # 🪝 Hooks library guide
│   └── 📚 lib/                     # Utility functions & types
│       └── 📋 claude.md            # 📚 Utilities guide
├── 🔧 scripts/                     # Automation scripts
└── 📦 package.json                 # Project configuration
```

## 🧭 Documentation Navigation

**📖 Choose your focus area:**

| Domain                      | Documentation                                                  | Purpose                                                                     |
| --------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **🏗️ Overall Architecture** | [`src/claude.md`](./src/claude.md)                             | Source code structure, development guidelines, and architectural principles |
| **🌐 Pages & Routing**      | [`src/app/claude.md`](./src/app/claude.md)                     | Next.js App Router, page components, and navigation patterns                |
| **⚙️ Configuration System** | [`src/config/claude.md`](./src/config/claude.md)               | Centralized settings, hard-coding prevention, and brand management          |
| **🧩 Component Library**    | [`src/components/claude.md`](./src/components/claude.md)       | Component architecture and reusability patterns                             |
| **🎨 UI Implementation**    | [`src/components/ui/claude.md`](./src/components/ui/claude.md) | shadcn/ui components, styling, and design system                            |
| **🪝 Custom Hooks**         | [`src/hooks/claude.md`](./src/hooks/claude.md)                 | React hooks library and state management patterns                           |
| **📚 Utilities**            | [`src/lib/claude.md`](./src/lib/claude.md)                     | Helper functions and common utilities                                       |
| **💾 Storage System**       | [`src/lib/storage/claude.md`](./src/lib/storage/claude.md)     | Unified localStorage management and Supabase migration preparation          |
| **⏳ Loading UI System**    | [`docs/LOADING-GUIDE.md`](./docs/LOADING-GUIDE.md)             | Loading states, spinners, skeletons, and progress indicators                |

## 🤖 Claude Workflow System

**📋 Automated development workflow for maintaining context and consistency:**

| Document                       | Purpose                                                                                    | Usage                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| **🔄 Workflow Framework**      | [`docs/Claude-Workflow-Framework.md`](./docs/Claude-Workflow-Framework.md)                 | 3-stage workflow architecture and core principles       |
| **📖 Context Loading**         | [`docs/Context-Loading-System.md`](./docs/Context-Loading-System.md)                       | Pre-task context loading system and file reading guides |
| **📝 Documentation Templates** | [`docs/Post-Task-Documentation-Templates.md`](./docs/Post-Task-Documentation-Templates.md) | Post-task documentation update templates and patterns   |
| **✅ Workflow Checklists**     | [`docs/Claude-Workflow-Checklists.md`](./docs/Claude-Workflow-Checklists.md)               | Step-by-step execution checklists and success metrics   |

**🎯 Purpose**: Prevent context loss, maintain architectural consistency, and automate documentation synchronization across development sessions.

## 🔧 MCP Integration

**프로젝트별 Model Context Protocol 설정 시스템**

이 프로젝트는 표준화된 MCP 설정으로 Claude Code의 도구 권한과 동작을 세밀하게 제어합니다.

### 📁 설정 파일 구조

#### `.claude/settings.local.json` (표준화된 프로젝트 설정)

**프로젝트별 권한 및 동작 설정 파일** - 최근 업데이트: 2025-09-30

- **권한 시스템**: 3단계 권한 제어 (allow/deny/ask)
- **허용된 MCP 서버**:
  - `sequential-thinking`: 복잡한 다단계 추론 및 체계적 문제 해결
  - `serena`: 시맨틱 코드 이해, 프로젝트 메모리, 세션 지속성
  - `playwright`: 브라우저 자동화 및 E2E 테스팅, UI 검증
- **허용된 도구**:
  - Git 명령어: add, push, commit, reset, fetch, pull, checkout, cherry-pick, merge, rm, log
  - 빌드 도구: npm run (type-check, build, dev), npx
  - 파일 읽기: 스크린샷 임시 파일, `~/.claude/**`
  - SlashCommand: `/sc:implement` 등 커스텀 명령어

#### `.claude/mcp-config.json` (MCP 서버 구성)

**MCP 서버별 실행 설정 파일**

- **shadcn Integration**: shadcn/ui CLI 도구 통합
- **Environment**: `SHADCN_PROJECT_ROOT` 환경 변수로 프로젝트 경로 지정

### 🎯 설정 파일 역할

| 파일                  | 역할                            | 업데이트 빈도 |
| --------------------- | ------------------------------- | ------------- |
| `settings.local.json` | 권한, 도구 제어                 | 프로젝트마다  |
| `mcp-config.json`     | MCP 서버 실행 구성 및 환경 변수 | 초기 설정 후  |

### 📝 설정 사용 방법

1. **권한 추가**: `settings.local.json`의 `permissions.allow` 배열에 패턴 추가
2. **MCP 서버 추가**: `mcp-config.json`의 `mcpServers` 객체에 서버 정의 추가

## 📊 Current Status

### Project Metrics

- **Components**: 42 shadcn/ui components + Advanced Table System
- **Pages**: Home, Components Demo, Projects (List/Detail views)
- **Architecture**: 100% centralized configuration
- **Type Safety**: 100% TypeScript coverage
- **Documentation**: Auto-synced claude.md system

### Development Workflow

1. **Read relevant `claude.md`** → Understand current patterns
2. **Follow centralized config** → Use `brand.ts` & `constants.ts`
3. **Implement with existing patterns** → Maintain consistency
4. **Auto-update documentation** → System handles synchronization

## 🔄 Recent Changes

- **2025-10-05**: Storage System Documentation - Complete CLAUDE.md infrastructure
  - **통합 로컬스토리지 전역 규칙 중앙화**: 모든 페이지, 위젯, 서비스에 적용 가능한 Storage 시스템 문서화 완료
  - **7개 CLAUDE.md 파일 생성**:
    - `src/lib/storage/claude.md` - Storage 시스템 메인 가이드
    - `src/lib/storage/core/claude.md` - StorageManager 클래스 상세
    - `src/lib/storage/adapters/claude.md` - Adapter 시스템 및 패턴
    - `src/lib/storage/types/claude.md` - 타입 시스템 및 엔티티 스키마
    - `src/lib/storage/services/claude.md` - 도메인 서비스 (7개 서비스)
    - `src/lib/storage/migrations/claude.md` - 마이그레이션 및 버전 관리
    - `src/lib/storage/utils/claude.md` - 성능 최적화 유틸리티
  - **84% 완료 상태 문서화**: Phases 0-8 완료, 9-10 진행 예정
  - **핵심 시스템 문서화**:
    - StorageManager: 통합 CRUD API, 구독 시스템, 트랜잭션
    - 7개 엔티티: User, Project, Client, Task, CalendarEvent, Document, Settings
    - 7개 도메인 서비스: BaseService 패턴 기반
    - 마이그레이션: SafeMigrationManager, v1-to-v2 스크립트
    - 성능 최적화: CacheLayer (80% 히트율), IndexManager (70% 성능 향상), CompressionManager (30-50% 절약)
  - **Supabase 마이그레이션 준비**: 완전한 타입 안전성과 1:1 스키마 매핑
  - 루트 CLAUDE.md 및 src/lib/claude.md 업데이트: Storage 시스템 네비게이션 추가

- **2025-09-24**: Pagination implementation refinement - Correct placement and duplicate removal
  - Issue resolution: Pagination was incorrectly applied to ListView instead of DetailView
  - **ListView**: Removed duplicate pagination (AdvancedTable already has built-in pagination)
  - **DetailView**: Added pagination to left panel project card list
    - 5 projects per page for better UX
    - Integrated existing Pagination component with centralized text system
    - Auto-reset to first page when project list changes
    - Small size pagination optimized for card layout
  - **Pagination Component**: Enhanced centralized text system integration
    - All aria-labels using getProjectPageText helpers
    - Complete TypeScript type safety
    - Responsive design for different container sizes
  - Architecture improvements:
    - Cleaner separation between table and card pagination
    - Consistent pagination behavior across views
    - Build successful with all functionality verified

- **2025-09-23**: Projects page complete implementation - Full architecture with centralized system
  - Phase 1: Text centralization completed
    - Added comprehensive project page texts to brand.ts
    - Replaced all hardcoded text with centralized system
    - Fixed UTF-8 encoding issues with proper Korean support
  - Phase 2: Component architecture completed
    - Created reusable ProjectDetail component with tab structure
    - Implemented 4 tabs: Overview, Contract, Billing, Documents
    - Full responsive design for full/compact modes
  - Phase 3: Routing and navigation completed
    - Created dynamic /projects/[id] page with Next.js 15 Promise params
    - Centralized mock data system in lib/mock/projects.ts
    - Master-Detail view with clickable project selection
    - ListView → /projects/[id] navigation
    - DetailView → Right panel update with ProjectDetail component
  - Architecture features:
    - 60fps optimized column resizing
    - Drag-and-drop column reordering with @hello-pangea/dnd
    - Delete mode with bulk selection functionality
    - URL parameter synchronization for view modes
    - Full TypeScript type safety maintained
    - Build successful with all tests passing

- **2025-09-24**: ProjectDetail component UI optimization - Removed duplicate progress cards
  - UI improvement: Removed Progress Overview section
    - Eliminated duplicate large progress cards (project progress + payment progress)
    - Streamlined user interface with direct header-to-tabs layout
    - Information preserved in Overview tab with more detailed presentation
  - Architecture benefits:
    - Cleaner component structure with less visual clutter
    - Better information hierarchy and user experience
    - Maintained all functionality while reducing redundancy
    - Build and compilation successful

- **2025-09-19**: Components page major refactoring - Centralization system improvement
  - Added 100+ new text entries to brand.ts
  - Removed hardcoded text from components/page.tsx
  - Implemented getComponentDemoText helper functions
  - Chart data now using centralized text system
  - Form labels and placeholders centralized
  - TypeScript compilation verified

- **2025-09-18**: LoadingButton component added - Loading state management pattern established
  - 3-position spinner support (left, right, center)
  - Full centralized text system integration
  - 100% Button component compatibility
  - Complete accessibility support (ARIA, screen readers)

- **2025-09-24**: Project documents status cards data integration - Overview/document tabs alignment
  - Overview 탭 자료 현황 카드는 `project.documentStatus`(미존재 시 `project.documents`) 기반으로 상태와 개수를 계산합니다.
  - 문서가 없을 때 상태 레이블을 `미보유`, 보유 시 `완료`로 통일했습니다.
  - 카드 날짜 영역은 최신 문서의 저장일(월/일)을 표시하고, 문서가 없으면 `--`로 표기합니다.
  - Mock 데이터 생성기가 문서 유형별 샘플 문서를 생성하고 요약 메타데이터(`documentStatus`)를 함께 제공합니다.

- **2025-09-25**: Project document generation workflow - Template modal + preview integration
  - `src/lib/document-generator/templates.ts`에서 `create-docs/lib` 템플릿을 계약/견적/청구/기타 카테고리로 매핑하고 프로젝트 데이터를 주입하는 생성 헬퍼를 추가했습니다.
  - Document Management 탭에 템플릿 기반 문서 생성/삭제 버튼과 목록 내 보기·편집·삭제 액션을 추가하고, 생성 문서를 로컬 상태(`ProjectDetail`)에서 즉시 관리할 수 있게 했습니다.
  - `ProjectDocumentGeneratorModal` + 미리보기/편집 다이얼로그를 통해 템플릿 선택, 내용 확인, 인라인 편집·저장을 지원하며 개요 카드 상태와 동기화됩니다. 모든 삭제 흐름은 `DocumentDeleteDialog`(공통 삭제 모달)에서 brand 텍스트와 primary 테두리를 사용합니다.

## ☁️ Supabase 통합 상태 및 규칙

### 📊 통합 진행 상황

**Supabase 마이그레이션 완료 (2025-10-09)** - Phase 11-15 모두 완료

- ✅ **Phase 11**: Supabase 환경 설정 완료
  - 11개 테이블 생성 (users, projects, tasks, events, clients, documents, user_settings, activity_logs, migration_status, file_uploads, notifications)
  - RLS 정책 적용 (모든 테이블)
  - 비즈니스 로직 함수 5개 구현
  - 트리거 및 인덱스 설정

- ✅ **Phase 12**: 인증 시스템 구현 완료
  - 이메일/패스워드 인증
  - Google OAuth 소셜 로그인
  - 쿠키 기반 세션 관리 (SSR 호환)
  - 보호된 라우트 자동 리다이렉션

- ✅ **Phase 13**: DualWrite 모드 전환 완료
  - LocalStorage + Supabase 병행 운영
  - 5초 간격 백그라운드 동기화
  - 데이터 마이그레이션 시스템 (v2-to-supabase)
  - 모니터링 API (`/api/sync-status`)

- ✅ **Phase 14**: 검증 및 모니터링 완료
  - 데이터 무결성 검증 시스템
  - 동기화 모니터링 대시보드 (`/sync-monitor`)
  - 성능 메트릭 수집 (응답시간, 처리량, 에러율)
  - 알림 시스템 (4단계 심각도)

- ✅ **Phase 15**: Supabase 전환 완료
  - 최종 데이터 검증
  - Supabase 전용 모드 전환 시스템
  - 롤백 및 긴급 복구 시스템
  - 강화된 모니터링 시스템

### 🔑 데이터 접근 전략 (하이브리드 방식)

**RLS 직접 호출 vs API Routes 선택 기준**

#### 📗 RLS 직접 호출 (단순 CRUD)
**사용 케이스**:
- 단일 테이블 CRUD 작업
- 사용자 소유 데이터 조회/수정
- 실시간 구독
- 간단한 필터링과 정렬

**예시**:
```typescript
// ✅ RLS 직접 호출 (권장)
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

#### 📘 API Routes 사용 (복잡한 로직)
**사용 케이스**:
- 여러 테이블에 걸친 트랜잭션
- 복잡한 비즈니스 규칙
- 외부 API 통합
- 파일 업로드/처리
- 이메일 발송

**예시**:
```typescript
// ✅ API Route 사용 (복잡한 로직)
const response = await fetch('/api/projects/complete', {
  method: 'POST',
  body: JSON.stringify({ projectId })
})
```

### 🛡️ 보안 규칙

#### 1. RLS (Row Level Security) 정책
**모든 테이블에 RLS 적용 필수**

```sql
-- ✅ 사용자별 데이터 격리
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);
```

**주의사항**:
- ❌ RLS 정책 없이 테이블 생성 금지
- ❌ 테스트 목적으로 RLS 비활성화 금지
- ✅ Service Role Key는 서버 전용 (환경변수로 관리)

#### 2. 인증 세션 관리
```typescript
// ✅ 세션 확인 (Server Component)
import { requireAuth } from '@/lib/auth/session'

export default async function ProtectedPage() {
  const session = await requireAuth()  // 비인증 시 자동 리다이렉트
  // ...
}

// ✅ 인증 확인 (API Route)
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

#### 3. 클라이언트 타입 분리
```typescript
// ✅ Browser Client (Client Component)
import { createClient } from '@/lib/supabase/client'

// ✅ Server Client (Server Component, API Route)
import { createClient } from '@/lib/supabase/server'
```

**주의사항**:
- ❌ Server Client를 Client Component에서 사용 금지
- ❌ Browser Client를 Server Component에서 사용 금지

### 📋 개발 체크리스트

#### 새로운 테이블 추가 시
1. ✅ SQL 마이그레이션 파일 생성 (`supabase/migrations/`)
2. ✅ RLS 정책 정의 및 적용
3. ✅ 인덱스 설정 (성능 최적화)
4. ✅ TypeScript 타입 정의 (`src/lib/storage/types/entities/`)
5. ✅ 도메인 서비스 구현 (필요시)

#### 새로운 API Route 추가 시
1. ✅ 인증 확인 구현
2. ✅ RLS 정책으로 처리 불가능한 복잡한 로직인지 확인
3. ✅ 트랜잭션 필요 여부 확인
4. ✅ 에러 처리 및 로깅
5. ✅ 타입 안전성 보장

### 🔗 관련 문서

| 문서 | 내용 |
|------|------|
| [`src/lib/supabase/claude.md`](./src/lib/supabase/claude.md) | Supabase 클라이언트 사용법 및 규칙 |
| [`src/lib/auth/claude.md`](./src/lib/auth/claude.md) | 인증 시스템 및 세션 관리 |
| [`src/lib/storage/claude.md`](./src/lib/storage/claude.md) | Storage 시스템 및 DualWrite 모드 |
| [`src/app/api/claude.md`](./src/app/api/claude.md) | API Routes 개발 가이드 |
| [`supabase/migrations/claude.md`](./supabase/migrations/claude.md) | 마이그레이션 및 스키마 관리 |
| [`docs/SUPABASE-INTEGRATION-PLAN.md`](./docs/SUPABASE-INTEGRATION-PLAN.md) | 전체 통합 실행 계획 및 완료 결과 |

### ⚠️ 마이그레이션 주의사항

#### 1. 데이터 무결성
- ✅ 모든 마이그레이션 전 자동 백업
- ✅ 검증 및 무결성 체크 시스템 활용
- ❌ 백업 없이 마이그레이션 실행 금지

#### 2. 동기화 모니터링
- ✅ `/sync-monitor` 대시보드 정기 확인
- ✅ 성공률 95% 이상 유지
- ✅ 큐 크기 100개 이하 유지
- ⚠️ 실패율 증가 시 즉시 조치

#### 3. 롤백 준비
- ✅ 긴급 롤백 시스템 구축 완료
- ✅ LocalStorage 폴백 시나리오 준비
- ✅ DualWrite 모드 재활성화 가능

---

**🎯 Next Steps**: Choose the relevant `claude.md` file above based on your current task. Each contains domain-specific guidance and implementation details.

## 📝 필수 작업 후 업데이트 (MANDATORY POST-TASK UPDATE)

### 작업 완료 후 체크리스트

1. ✅ 새로운 컴포넌트/기능을 추가했다면 → 관련 claude.md에 기록
2. ✅ 기존 패턴을 변경했다면 → 해당 섹션 업데이트
3. ✅ 새로운 의존성을 추가했다면 → package.json과 문서 동기화
4. ✅ 설정을 변경했다면 → config 관련 문서 업데이트

**이 체크리스트를 완료하지 않으면 다음 작업 시 컨텍스트가 손실됩니다.**

## 🔗 SuperClaude 통합 지시사항

이 프로젝트는 SuperClaude 프레임워크와 통합되어 있습니다:

- **글로벌 설정**: `/Users/a/.claude/output-styles/korean-language.md`
- **작업 전 필수**: 이 파일과 관련 claude.md 파일들 자동 읽기
- **작업 후 필수**: 변경사항을 문서에 반영

# important-instruction-reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
