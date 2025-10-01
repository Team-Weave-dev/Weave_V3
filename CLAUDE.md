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

| 파일                     | 역할                                    | 업데이트 빈도 |
| ------------------------ | --------------------------------------- | ------------- |
| `settings.local.json`    | 권한, 도구 제어                         | 프로젝트마다  |
| `mcp-config.json`        | MCP 서버 실행 구성 및 환경 변수         | 초기 설정 후  |

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
