# projects/ - 프로젝트 전용 컴포넌트 라이브러리

## 🗂️ 프로젝트 컴포넌트 시스템 개요

이 디렉토리는 프로젝트 관리와 관련된 모든 재사용 가능한 컴포넌트를 포함합니다. **중앙화된 설정**과 **일관된 사용자 경험**을 우선으로 하여 설계되었습니다.

## 📁 컴포넌트 구조

```
projects/
└── ProjectDetail/      # 🗂️ 프로젝트 상세 정보 컴포넌트
    └── index.tsx       # 메인 ProjectDetail 컴포넌트
```

## 🎯 ProjectDetail 컴포넌트

### 개요
**재사용 가능한 프로젝트 상세 정보 표시 컴포넌트**로, 4개 탭 기반 구조를 제공하여 프로젝트의 모든 정보를 체계적으로 관리합니다.

### 주요 특징
- **4개 탭 구조**: Overview, Contract, Billing, Documents
- **2가지 모드**: full (전체화면) / compact (패널) 모드
- **중앙화 통합**: 모든 텍스트와 스타일이 config 시스템과 연동
- **최적화된 UI**: 중복 제거로 깔끔한 정보 표시

### 사용법
```typescript
import ProjectDetail from '@/components/projects/ProjectDetail'
import type { ProjectTableRow } from '@/lib/types/project-table.types'

// 전체화면 모드 (프로젝트 상세 페이지)
<ProjectDetail
  project={projectData}
  mode="full"
  onEdit={handleEdit}
  onClose={handleClose}
/>

// 패널 모드 (DetailView 컴포넌트 내부)
<ProjectDetail
  project={projectData}
  mode="compact"
/>
```

## 🎨 컴포넌트 구조

### Props 인터페이스
```typescript
interface ProjectDetailProps {
  project: ProjectTableRow;
  mode?: 'full' | 'compact';
  onClose?: () => void;
  onEdit?: () => void;
}
```

### 컴포넌트 레이아웃
```tsx
<div className="h-full flex flex-col">
  {/* 헤더 영역 */}
  <div className="flex-shrink-0 p-4 border-b">
    <ProjectHeader
      project={project}
      mode={mode}
      onClose={onClose}
      onEdit={onEdit}
    />
  </div>

  {/* 탭 네비게이션 */}
  <Tabs defaultValue="overview" className="flex-1 flex flex-col">
    <TabsList className="flex-shrink-0 grid w-full grid-cols-4">
      {/* 4개 탭 */}
    </TabsList>

    {/* 탭 콘텐츠 */}
    <div className="flex-1 min-h-0">
      <TabsContent value="overview" className="h-full">
        <OverviewTab project={project} />
      </TabsContent>
      {/* 기타 탭들... */}
    </div>
  </Tabs>
</div>
```

## 📋 탭별 구성

### 1. Overview 탭
```typescript
// 프로젝트 기본 정보 및 진행 현황
- 프로젝트 기본 정보 (제목, 설명, 상태)
- 진행률 표시 (ProjectProgress 컴포넌트 활용)
- 클라이언트 정보
- 주요 마일스톤
- 프로젝트 태그 및 카테고리
```

### 2. Contract 탭
```typescript
// 계약 및 협약 관련 정보
- 계약서 정보
- 계약 기간 및 조건
- 결제 조건
- 계약 상태 추적
- 계약서 첨부 파일
```

### 3. Billing 탭
```typescript
// 청구 및 결제 관리
- 청구서 목록
- 결제 상태 추적
- 결제 일정
- 수익 분석
- 세금 계산서 관리
```

### 4. Documents 탭
```typescript
// 프로젝트 관련 문서 관리
- 파일 업로드 영역
- 문서 카테고리별 분류
- 버전 관리
- 공유 및 권한 설정
- 문서 미리보기
```

## 🎨 스타일링 시스템

### 모드별 스타일링
```typescript
// Full 모드 (전체화면)
const fullModeStyles = {
  container: "w-full h-screen",
  header: "p-6 border-b",
  content: "flex-1 p-6"
}

// Compact 모드 (패널)
const compactModeStyles = {
  container: "w-full h-full",
  header: "p-4 border-b",
  content: "flex-1 p-4"
}
```

### 중앙화된 텍스트 사용
```typescript
// brand.ts에서 텍스트 가져오기
import { getProjectDetailText } from '@/config/brand'

// 탭 제목
const tabTitles = {
  overview: getProjectDetailText.tabs.overview('ko'),
  contract: getProjectDetailText.tabs.contract('ko'),
  billing: getProjectDetailText.tabs.billing('ko'),
  documents: getProjectDetailText.tabs.documents('ko')
}
```

## 🔧 최신 개선사항 (2025-09-24)

### UI 최적화
- **Progress Overview 섹션 제거**: 중복된 대형 진행률 카드 제거
  - 기존: 프로젝트 진도 + 결제 진행률 대형 카드
  - 개선: 헤더 → 탭 직접 연결로 더 깔끔한 레이아웃
- **정보 집약화**: 모든 정보는 Overview 탭에서 체계적으로 제공
- **공간 활용**: 불필요한 중복 제거로 콘텐츠 영역 확대

### 사용자 경험 개선
- **직관적인 내비게이션**: 헤더에서 바로 탭으로 이동
- **정보 밀도 최적화**: 중복 없이 필요한 정보만 표시
- **시각적 계층**: 명확한 정보 구조와 우선순위

## 🔄 상태 관리

### 로컬 상태
```typescript
const [activeTab, setActiveTab] = useState('overview')
const [isEditing, setIsEditing] = useState(false)
const [formData, setFormData] = useState(project)
```

### Props 기반 데이터 흐름
```typescript
// 상위 컴포넌트에서 데이터 전달
project: ProjectTableRow  // 프로젝트 데이터
mode: 'full' | 'compact'  // 표시 모드
onEdit?: () => void       // 편집 콜백
onClose?: () => void      // 닫기 콜백
```

## 🎯 사용 패턴

### DetailView에서 사용
```typescript
// src/app/projects/components/ProjectsView/DetailView.tsx
<div className="flex h-full">
  {/* 좌측: 프로젝트 카드 목록 */}
  <div className="w-1/3 border-r">
    <ProjectCardList />
  </div>

  {/* 우측: 프로젝트 상세 */}
  <div className="w-2/3">
    <ProjectDetail
      project={selectedProject}
      mode="compact"
    />
  </div>
</div>
```

### 전체화면 페이지에서 사용
```typescript
// src/app/projects/[id]/ProjectDetailClient.tsx
export default function ProjectDetailClient({ projectId }: { projectId: string }) {
  const project = getProjectById(projectId)

  return (
    <ProjectDetail
      project={project}
      mode="full"
      onClose={() => router.push('/projects')}
      onEdit={() => setEditMode(true)}
    />
  )
}
```

## 🚀 개발 가이드라인

### 컴포넌트 확장 시
1. **중앙화 준수**: 새로운 텍스트는 `brand.ts`에 추가
2. **타입 안정성**: `ProjectTableRow` 타입 확장 시 전체 일관성 유지
3. **접근성 우선**: 모든 UI 요소에 적절한 ARIA 속성
4. **반응형 고려**: 다양한 화면 크기에서 테스트

### 성능 최적화
```typescript
// 메모화로 불필요한 리렌더링 방지
const ProjectDetail = React.memo(({ project, mode, ...props }) => {
  // 컴포넌트 로직
})

// 무거운 계산은 useMemo로 최적화
const processedData = useMemo(() => {
  return processProjectData(project)
}, [project])
```

## 📊 품질 메트릭

### 사용자 경험
- **탭 전환 속도**: < 50ms
- **데이터 로딩**: < 200ms
- **반응형 전환**: 부드러운 애니메이션

### 코드 품질
- **재사용성**: 2개 모드로 다양한 용도 지원
- **확장성**: 새 탭 추가 용이
- **유지보수**: 중앙화된 설정으로 수정 편의

## 🔗 관련 문서

- [`../../app/projects/claude.md`](../../app/projects/claude.md) - 프로젝트 페이지 시스템
- [`../../lib/types/project-table.types.ts`] - 프로젝트 타입 정의
- [`../../config/brand.ts`] - 프로젝트 관련 텍스트 설정

---

**ProjectDetail 컴포넌트는 프로젝트 정보를 체계적이고 직관적으로 표시하는 핵심 UI 컴포넌트입니다.**