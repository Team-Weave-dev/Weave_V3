# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
- 27 reusable UI components with full accessibility support
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
NEW_UI_Components/
├── 📋 CLAUDE.md                    # 🎯 This file - Project navigation hub
├── 📁 src/                         # Source code root
│   ├── 📋 claude.md                # 📚 Source architecture guide
│   ├── 📱 app/ (2개)               # Next.js App Router pages
│   │   └── 📋 claude.md            # 🌐 Pages & routing guide
│   ├── ⚙️ config/ (2개)           # Centralized configuration
│   │   └── 📋 claude.md            # 🔧 Configuration system guide
│   ├── 🧩 components/ (27개)       # UI component library
│   │   ├── 📋 claude.md            # 🧩 Component library guide
│   │   └── 🎨 ui/                  # shadcn/ui components
│   │       └── 📋 claude.md        # 🎨 Component implementation guide
│   ├── 🪝 hooks/ (1개)            # Custom React hooks
│   │   └── 📋 claude.md            # 🪝 Hooks library guide
│   └── 📚 lib/ (1개)               # Utility functions
│       └── 📋 claude.md            # 📚 Utilities guide
├── 🔧 scripts/                     # Automation scripts
└── 📦 package.json                 # Project configuration
```

## 🧭 Documentation Navigation

**📖 Choose your focus area:**

| Domain | Documentation | Purpose |
|--------|---------------|---------|
| **🏗️ Overall Architecture** | [`src/claude.md`](./src/claude.md) | Source code structure, development guidelines, and architectural principles |
| **🌐 Pages & Routing** | [`src/app/claude.md`](./src/app/claude.md) | Next.js App Router, page components, and navigation patterns |
| **⚙️ Configuration System** | [`src/config/claude.md`](./src/config/claude.md) | Centralized settings, hard-coding prevention, and brand management |
| **🧩 Component Library** | [`src/components/claude.md`](./src/components/claude.md) | Component architecture and reusability patterns |
| **🎨 UI Implementation** | [`src/components/ui/claude.md`](./src/components/ui/claude.md) | shadcn/ui components, styling, and design system |
| **🪝 Custom Hooks** | [`src/hooks/claude.md`](./src/hooks/claude.md) | React hooks library and state management patterns |
| **📚 Utilities** | [`src/lib/claude.md`](./src/lib/claude.md) | Helper functions and common utilities |

## 🤖 Claude Workflow System

**📋 Automated development workflow for maintaining context and consistency:**

| Document | Purpose | Usage |
|----------|---------|-------|
| **🔄 Workflow Framework** | [`docs/Claude-Workflow-Framework.md`](./docs/Claude-Workflow-Framework.md) | 3-stage workflow architecture and core principles |
| **📖 Context Loading** | [`docs/Context-Loading-System.md`](./docs/Context-Loading-System.md) | Pre-task context loading system and file reading guides |
| **📝 Documentation Templates** | [`docs/Post-Task-Documentation-Templates.md`](./docs/Post-Task-Documentation-Templates.md) | Post-task documentation update templates and patterns |
| **✅ Workflow Checklists** | [`docs/Claude-Workflow-Checklists.md`](./docs/Claude-Workflow-Checklists.md) | Step-by-step execution checklists and success metrics |

**🎯 Purpose**: Prevent context loss, maintain architectural consistency, and automate documentation synchronization across development sessions.

## 🔧 MCP Integration

This project includes Model Context Protocol configuration:

- **MCP Config**: `.claude/mcp-config.json`
- **shadcn Integration**: Configured for this project specifically
- **Environment**: `SHADCN_PROJECT_ROOT` points to project directory

## 📊 Current Status

### Project Metrics
- **Components**: 27 shadcn/ui components installed
- **Architecture**: 100% centralized configuration
- **Type Safety**: 100% TypeScript coverage
- **Documentation**: Auto-synced claude.md system

### Development Workflow
1. **Read relevant `claude.md`** → Understand current patterns
2. **Follow centralized config** → Use `brand.ts` & `constants.ts`
3. **Implement with existing patterns** → Maintain consistency
4. **Auto-update documentation** → System handles synchronization

## 🛡️ Component Resilience System

### 자동 컴포넌트 복구 (Automatic Component Recovery)

**🚨 CRITICAL RULE**: 컴포넌트가 누락된 경우 자동으로 처리합니다.

#### 처리 프로세스
1. **감지**: import 에러 또는 컴포넌트 누락 감지
2. **설치**: `npx shadcn@latest add [component-name]` 자동 실행
3. **통합**: 현재 프로젝트 패턴에 맞게 자동 조정
   - 중앙화 시스템 적용 (brand.ts, constants.ts)
   - 현재 컴포넌트 페이지 스타일 패턴 적용
   - TypeScript 타입 정의 확인
4. **문서화**: claude.md 파일 자동 업데이트

#### 예외 처리 규칙
```typescript
// 컴포넌트 누락 시 처리 패턴
if (!componentExists) {
  1. Run: npx shadcn@latest add [component-name]
  2. Update: src/components/ui/claude.md에 추가
  3. Apply: 중앙화 텍스트 시스템 적용
  4. Verify: TypeScript 컴파일 확인
}
```

#### 스타일 일관성 유지
- **참조 파일**: `src/app/components/page.tsx`
- **패턴 준수**: Card 구조, 그리드 레이아웃, 간격 시스템
- **텍스트 중앙화**: 모든 텍스트는 brand.ts에 추가
- **상수 중앙화**: 모든 설정값은 constants.ts에 추가

## 🔄 Recent Changes

- **2025-09-21**: Component Resilience System 추가
  - 누락 컴포넌트 자동 감지 및 설치 시스템
  - 스타일 패턴 자동 적용 규칙
  - 예외 처리 워크플로우 문서화
  - Merge 브랜치 전략 추가

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
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.