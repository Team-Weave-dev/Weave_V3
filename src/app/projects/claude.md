# projects/ - 프로젝트 관리 시스템

## 🏗️ 프로젝트 관리 시스템 개요

이 디렉토리는 프로젝트 관리의 핵심 기능을 담당합니다. **ListView**와 **DetailView** 두 가지 모드를 제공하여 사용자가 프로젝트를 효율적으로 관리할 수 있도록 합니다.

## 📁 페이지 구조

```
projects/
├── layout.tsx          # 📋 프로젝트 전용 레이아웃
├── page.tsx            # 🏠 프로젝트 메인 페이지 (/projects)
├── [id]/               # 📄 동적 프로젝트 상세 페이지
│   ├── page.tsx        # 프로젝트 상세 보기
│   └── ProjectDetailClient.tsx  # 클라이언트 컴포넌트
└── components/         # 🧩 프로젝트 전용 컴포넌트
    ├── ProjectHeader/  # 헤더 컴포넌트
    └── ProjectsView/   # 뷰 모드별 컴포넌트
        ├── index.tsx   # 메인 뷰 컨테이너
        ├── ListView.tsx    # 리스트 뷰 모드
        └── DetailView.tsx  # 디테일 뷰 모드
```

## 🎯 핵심 기능

### 1. 뷰 모드 전환 시스템
- **ListView**: AdvancedTable을 활용한 테이블 형태의 프로젝트 목록
- **DetailView**: 카드 형태 목록 + 상세 패널의 마스터-디테일 뷰

### 2. AdvancedTable 시스템
- **컬럼 드래그 앤 드롭**: @hello-pangea/dnd 기반 컬럼 재정렬
- **60fps 컬럼 리사이징**: 부드러운 실시간 크기 조절
- **내장 페이지네이션**: 테이블 하단 자동 페이지네이션
- **삭제 모드**: 벌크 선택 및 삭제 기능
- **키보드 내비게이션**: 완전한 접근성 지원

### 3. 페이지네이션 시스템
- **ListView**: AdvancedTable 내장 페이지네이션 사용
- **DetailView**: 좌측 카드 목록용 커스텀 페이지네이션 (5개/페이지)
- **URL 동기화**: 페이지 상태와 URL 파라미터 연동

## 📄 주요 페이지 구성

### layout.tsx - 프로젝트 레이아웃
```typescript
// 프로젝트 섹션 전용 레이아웃
export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {/* 프로젝트 전용 헤더/네비게이션 */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

### page.tsx - 메인 프로젝트 페이지
```typescript
"use client"

import { useState } from 'react'
import ProjectHeader from './components/ProjectHeader'
import ProjectsView from './components/ProjectsView'
import type { ViewMode } from '@/types/project-table.types'

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  return (
    <div className="space-y-6">
      <ProjectHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <ProjectsView viewMode={viewMode} />
    </div>
  )
}
```

### [id]/page.tsx - 동적 프로젝트 상세 페이지
```typescript
// Next.js 15 Promise params 패턴 사용
export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const projectId = resolvedParams.id

  return <ProjectDetailClient projectId={projectId} />
}
```

## 🧩 컴포넌트 시스템

### ProjectHeader 컴포넌트
- **뷰 모드 전환**: ListView ↔ DetailView 토글 버튼
- **중앙화된 텍스트**: `brand.ts`의 프로젝트 관련 텍스트 사용
- **반응형 레이아웃**: 모바일 친화적 헤더 구성

### ProjectsView 컴포넌트 시스템
```typescript
// 메인 뷰 컨테이너
interface ProjectsViewProps {
  viewMode: ViewMode
}

// ListView: 테이블 중심
- AdvancedTable 컴포넌트 활용
- 내장 페이지네이션
- 컬럼 설정 및 정렬
- 벌크 액션 지원

// DetailView: 마스터-디테일
- 좌측: 프로젝트 카드 목록 (페이지네이션 포함)
- 우측: ProjectDetail 컴포넌트 (4개 탭)
- 선택된 프로젝트 하이라이트
- 실시간 프로젝트 전환
```

## 🎨 스타일링 및 UX

### 레이아웃 여백 규칙
```typescript
// 프로젝트 페이지 표준 여백
className={`${layout.page.container} ${layout.page.padding.default}`}

// 섹션 간 간격
className={layout.page.section.stack}  // space-y-6

// 헤더 액션 영역
className={layout.page.header.actions}  // flex items-center gap-2
```

### 반응형 디자인
- **Desktop**: 전체 기능 활용
- **Tablet**: 적응형 컬럼 레이아웃
- **Mobile**: 단일 컬럼, 간소화된 인터페이스

## 🔄 상태 관리 및 데이터

### 데이터 소스
- **Mock 데이터**: `src/lib/mock/projects.ts`
- **타입 정의**: `src/lib/types/project-table.types.ts`
- **상태 관리**: React useState (향후 Zustand 연동 예정)

### 💾 로컬스토리지 기반 데이터 영속성

프로젝트 시스템은 **Clean Slate 접근법**을 사용하여 로컬스토리지에 데이터를 영구 저장합니다.

#### 로컬스토리지 키 구조

```typescript
// 프로젝트 데이터
'weave_custom_projects'           // 사용자 생성 프로젝트 목록
'weave_project_documents'         // 프로젝트별 문서 데이터
'preferredViewMode'               // 사용자 선호 뷰 모드 (list/detail)
```

#### 프로젝트 데이터 영속성

**Clean Slate 시스템**:
- ✅ 사용자가 생성한 프로젝트만 로컬스토리지에 저장
- ✅ 새로고침 후에도 데이터 유지
- ✅ Mock 데이터는 생성하지 않고 빈 상태에서 시작
- ✅ SSR 환경에서 안전하게 동작 (`typeof window` 체크)

**주요 함수들** (`src/lib/mock/projects.ts`):
```typescript
// 프로젝트 CRUD
addCustomProject(project)         // 새 프로젝트 추가 (맨 앞에 삽입)
updateCustomProject(id, updates)  // 프로젝트 업데이트 (수정일 자동 갱신)
removeCustomProject(id)           // 프로젝트 삭제
clearCustomProjects()             // 모든 프로젝트 삭제

// 데이터 조회
fetchMockProjects()               // localStorage 프로젝트만 반환 (300ms 지연)
getMockProjectById(id)            // ID 또는 번호로 프로젝트 조회
```

#### 문서 데이터 영속성

**프로젝트별 문서 관리** (`src/lib/mock/documents.ts`):
```typescript
// 문서 CRUD
getProjectDocuments(projectId)              // 프로젝트의 문서 목록 조회
saveProjectDocuments(projectId, documents)  // 프로젝트 문서 저장
addProjectDocument(projectId, document)     // 새 문서 추가
removeProjectDocument(projectId, documentId) // 문서 삭제
clearProjectDocuments(projectId)            // 프로젝트의 모든 문서 삭제
```

**문서 데이터 구조**:
```typescript
// localStorage 저장 형식
{
  'project-1': [
    { id: 'doc-1', name: '계약서', type: 'contract', ... },
    { id: 'doc-2', name: '견적서', type: 'estimate', ... }
  ],
  'project-2': [ ... ]
}
```

#### 뷰 모드 영속성

**사용자 선호 뷰 모드 저장**:
```typescript
// 뷰 모드 변경 시 자동 저장
localStorage.setItem('preferredViewMode', newMode)

// 초기 로드 시 복원 (URL > localStorage > 기본값)
const urlViewMode = searchParams.get('view')
const savedMode = localStorage.getItem('preferredViewMode')
const viewMode = urlViewMode || savedMode || 'list'
```

#### SSR 안전성

**모든 로컬스토리지 작업은 클라이언트 전용**:
```typescript
// SSR 환경 체크
if (typeof window === 'undefined') {
  return []; // 또는 안전한 기본값
}

try {
  const stored = localStorage.getItem(key);
  // ... 로직
} catch (error) {
  console.error('localStorage 에러:', error);
  return []; // 안전한 폴백
}
```

#### 디버깅 도구

**문서 시스템 디버깅 함수들** (`src/lib/mock/documents.ts`):
```typescript
debugLocalStorageState()           // 전체 localStorage 상태 출력
cleanupLegacyDocumentKeys()        // 이전 버전 키 정리
resetAllDocuments()                // 모든 문서 데이터 초기화
debugProjectDocuments(projectId)   // 특정 프로젝트 문서 상태 확인
```

**사용 예시**:
```typescript
// 브라우저 콘솔에서
import { debugLocalStorageState } from '@/lib/mock/documents';
debugLocalStorageState(); // 전체 상태 확인
```

#### 데이터 흐름

```
사용자 액션
    ↓
프로젝트 생성/수정/삭제
    ↓
addCustomProject/updateCustomProject/removeCustomProject
    ↓
localStorage.setItem('weave_custom_projects', JSON.stringify(projects))
    ↓
refreshProjectData() 호출
    ↓
fetchMockProjects() → localStorage에서 데이터 로드
    ↓
UI 업데이트
```

### URL 상태 동기화
```typescript
// 뷰 모드를 URL 파라미터로 관리
const searchParams = useSearchParams()
const viewMode = searchParams.get('view') as ViewMode || 'list'

// 프로젝트 선택 상태도 URL에 반영
/projects?view=detail&selected=project-1
```

## 🚀 개발 가이드라인

### 새 기능 추가 시
1. **컴포넌트 재사용**: 기존 ProjectsView 패턴 활용
2. **타입 안정성**: `project-table.types.ts` 확장
3. **중앙화 준수**: 모든 텍스트는 `brand.ts`에서 관리
4. **접근성 우선**: ARIA 레이블 및 키보드 내비게이션

### 성능 최적화
- **React.memo**: 무거운 컴포넌트는 메모화 적용
- **가상화**: 대량 프로젝트 목록 시 react-window 고려
- **지연 로딩**: 프로젝트 상세 정보는 필요 시 로딩

## 📊 품질 메트릭

### 사용자 경험
- **로딩 시간**: < 1초 (초기 렌더링)
- **인터랙션 응답**: < 100ms (뷰 모드 전환)
- **접근성 점수**: 100% (WAVE 도구 기준)

### 코드 품질
- **타입 커버리지**: 100%
- **컴포넌트 재사용률**: 80% 이상
- **중앙화 준수율**: 100% (하드코딩 0개)

## 🔗 관련 문서

- [`../components/projects/claude.md`](../../components/projects/claude.md) - ProjectDetail 컴포넌트 상세 가이드
- [`../../lib/mock/projects.ts`] - 프로젝트 Mock 데이터 구조
- [`../../lib/types/project-table.types.ts`] - 프로젝트 관련 타입 정의

---

**이 프로젝트 관리 시스템은 사용자의 워크플로우를 고려한 직관적이고 효율적인 인터페이스를 제공합니다.**