# 작업 전 컨텍스트 로딩 시스템

## 🎯 시스템 목적

Claude가 모든 작업을 시작하기 전에 **현재 프로젝트 상태를 완벽히 파악**하여:
- 기존 패턴과 일치하는 구현
- 하드코딩 방지 및 중앙화 시스템 준수
- UI 파손 및 아키텍처 편차 사전 방지
- 중복 작업 및 재구현 방지

---

## 🔍 작업 유형별 컨텍스트 로딩 가이드

### 🧩 컴포넌트 관련 작업

#### 필수 읽기 파일 순서
```
1. /CLAUDE.md
   → 전체 프로젝트 구조, 현재 컴포넌트 개수(26개) 확인

2. /src/components/claude.md
   → 컴포넌트 라이브러리 전체 아키텍처

3. /src/components/ui/claude.md
   → 25개 기존 컴포넌트 목록과 패턴, 최근 변경사항

4. /src/config/claude.md
   → 중앙화 시스템(brand.ts, constants.ts) 사용 규칙

5. 유사 컴포넌트 파일 (필요시)
   → /src/components/ui/button.tsx, input.tsx 등
```

#### 파악해야 할 핵심 정보
```typescript
// 컨텍스트 분석 체크리스트
interface ComponentContext {
  // 📊 현재 상태
  existingComponents: string[]  // 26개 컴포넌트 목록
  componentCount: number        // 26개 → 작업 후 증가 예상

  // 🏗️ 아키텍처 패턴
  namingConvention: string      // kebab-case 파일명, PascalCase 컴포넌트명
  shadcnPattern: boolean        // cva, forwardRef, displayName 패턴
  variantSystem: object         // variant, size 등 표준 props 구조

  // 🎨 스타일링 규칙
  centralizedStyling: {
    brandSystem: "brand.ts"     // 모든 텍스트 중앙화
    constants: "constants.ts"   // 모든 수치값 중앙화
    hardcodingPolicy: "금지"    // 하드코딩 절대 금지
  }

  // 🔗 통합 패턴
  importPatterns: string[]      // 표준 import 순서와 패턴
  typeDefinition: "완전성"      // 모든 Props 타입 정의 필수
  accessibility: "WCAG 2.1 AA"  // 접근성 표준 준수
}
```

### 🪝 훅 관련 작업

#### 필수 읽기 파일 순서
```
1. /CLAUDE.md → 프로젝트 구조
2. /src/hooks/claude.md → 1개 기존 훅(use-toast) 패턴
3. /src/config/claude.md → 중앙화 시스템
4. 관련 컴포넌트 파일들 → 훅 사용 패턴 확인
```

#### 파악해야 할 핵심 정보
```typescript
interface HookContext {
  existingHooks: ["use-toast"]
  hookPatterns: {
    naming: "use-camelCase"
    typeDefinition: "완전한 타입 정의"
    returnPattern: "tuple 또는 object"
    dependencies: "최소화 원칙"
  }
  integrationPoints: {
    toastSystem: "shadcn/ui Toast와 완벽 통합"
    brandSystem: "중앙화된 메시지 사용"
  }
}
```

### 📱 페이지 관련 작업

#### 필수 읽기 파일 순서
```
1. /CLAUDE.md → 프로젝트 구조
2. /src/app/claude.md → 2개 페이지, App Router 패턴
3. /src/config/claude.md → 브랜드 시스템
4. 기존 페이지 파일들 → layout.tsx, page.tsx 패턴
```

### ⚙️ 설정 관련 작업

#### 필수 읽기 파일 순서
```
1. /CLAUDE.md → 전체 시스템 영향도
2. /src/config/claude.md → 2개 설정 파일 현황
3. 모든 하위 claude.md → 설정 변경이 미치는 영향 범위
4. 실제 설정 파일들 → brand.ts, constants.ts 현재 구조
```

---

## 📖 컨텍스트 로딩 실행 프로세스

### 1단계: 기본 프로젝트 상태 파악

```typescript
// CLAUDE.md에서 추출할 정보
interface ProjectOverview {
  structure: {
    components: "26개"
    hooks: "1개"
    utils: "1개"
    pages: "2개"
    configs: "2개"
  }

  architecture: {
    framework: "Next.js 15 + App Router"
    styling: "Tailwind CSS + shadcn/ui"
    stateManagement: "React hooks"
    centralization: "brand.ts + constants.ts"
  }

  qualityStandards: {
    typescript: "100% 타입 안정성"
    hardcoding: "절대 금지"
    accessibility: "WCAG 2.1 AA"
    testing: "향후 계획"
  }
}
```

### 2단계: 작업 영역별 세부 컨텍스트

#### 컴포넌트 작업시 추가 분석
```typescript
// components/ui/claude.md에서 추출할 정보
interface ComponentLibraryContext {
  installedComponents: [
    "button", "card", "input", "label", "textarea",
    "toast", "toaster", "badge", "tabs", "dialog",
    "dropdown-menu", "header", "interactive-card", "progress",
    "select", "switch", "tooltip", "avatar", "checkbox",
    "alert", "form", "sheet", "accordion", "table", "carousel",
    "advanced-table", "palette-switcher", "project-progress", "view-mode-switch"
  ]

  establishedPatterns: {
    fileNaming: "kebab-case.tsx"
    componentNaming: "PascalCase"
    variantSystem: "cva + variants + defaultVariants"
    propsPattern: "extends React.HTMLAttributes<HTMLElement>"
    forwardRef: "React.forwardRef 필수 사용"
    displayName: "ComponentName.displayName 설정"
  }

  recentChanges: {
    lastUpdate: "2025-09-18"
    additions: "최근 추가된 컴포넌트나 패턴"
    improvements: "개선된 사항들"
  }
}
```

### 3단계: 중앙화 시스템 규칙 확인

```typescript
// config/claude.md에서 추출할 정보
interface CentralizationRules {
  brandSystem: {
    file: "src/config/brand.ts"
    structure: {
      uiText: "모든 사용자 대면 텍스트"
      metadata: "SEO 및 메타데이터"
      logo: "브랜드 자산"
      routes: "라우팅 경로"
    }
    usage: {
      getText: "getNavText('ko'), getButtonText.viewComponents('ko')"
      forbidden: "하드코딩된 문자열 절대 금지"
    }
  }

  constantsSystem: {
    file: "src/config/constants.ts"
    structure: {
      layout: "크기, 간격, 레이아웃 값"
      typography: "텍스트 스타일 클래스"
      defaults: "기본값들"
    }
    usage: {
      getConstant: "layout.container.maxWidth, typography.title.hero"
      forbidden: "매직 넘버 하드코딩 절대 금지"
    }
  }
}
```

---

## 🧠 컨텍스트 분석 및 활용

### 분석 결과 활용 가이드

#### ✅ 올바른 구현 패턴 결정
```typescript
// 컨텍스트 분석 결과를 바탕으로 한 구현 예시

// 1. 파일명 결정 (기존 패턴 확인)
// components/ui/claude.md에서 확인: kebab-case 패턴
// 새 컴포넌트 → search-input.tsx

// 2. 컴포넌트 구조 결정 (shadcn/ui 패턴)
const SearchInputVariants = cva(
  // 기본 클래스 (기존 input.tsx 패턴 참조)
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
  {
    variants: {
      size: {
        default: "h-10",
        sm: "h-9",
        lg: "h-11"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

// 3. 중앙화 시스템 사용 (config/claude.md 규칙)
import { uiText } from '@/config/brand'
import { layout } from '@/config/constants'

// 4. 타입 정의 (기존 패턴 준수)
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions?: string[]
  onSearch?: (value: string) => void
}

// 5. forwardRef 패턴 (필수)
const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, suggestions, onSearch, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          className={cn(SearchInputVariants({ className }))}
          placeholder={uiText.forms.searchPlaceholder.ko}
          {...props}
        />
        {/* 자동완성 로직... */}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"
```

#### 🚫 방지해야 할 잘못된 패턴
```typescript
// ❌ 컨텍스트를 무시한 잘못된 구현

// 1. 하드코딩 사용 (절대 금지)
placeholder="검색어를 입력하세요"  // ❌
className="h-10 px-4 py-2"        // ❌

// 2. 기존 패턴 무시
function SearchInput() { }  // ❌ forwardRef 없음
export const SearchInput   // ❌ displayName 없음

// 3. 중앙화 시스템 무시
const SEARCH_HEIGHT = "40px"  // ❌ 매직 넘버
```

---

## 📋 실전 컨텍스트 로딩 체크리스트

### 📖 읽기 단계 (모든 작업 전 필수)

```
컴포넌트 작업시:
□ CLAUDE.md 읽음 - 전체 프로젝트 상태 파악
□ components/claude.md 읽음 - 컴포넌트 라이브러리 구조
□ components/ui/claude.md 읽음 - 26개 기존 컴포넌트 패턴
□ config/claude.md 읽음 - 중앙화 시스템 규칙
□ 유사 컴포넌트 파일 읽음 - 구체적 구현 패턴

훅 작업시:
□ CLAUDE.md 읽음
□ hooks/claude.md 읽음 - 기존 훅 패턴
□ config/claude.md 읽음
□ 훅 사용 컴포넌트들 읽음 - 사용 패턴

페이지 작업시:
□ CLAUDE.md 읽음
□ app/claude.md 읽음 - App Router 패턴
□ config/claude.md 읽음 - 브랜드 시스템
□ 기존 페이지 파일들 읽음

설정 작업시:
□ CLAUDE.md 읽음 - 전체 영향도
□ config/claude.md 읽음 - 현재 설정 구조
□ 모든 하위 claude.md 읽음 - 영향 범위
□ 실제 설정 파일들 읽음
```

### 🧠 분석 단계 (읽기 후 필수)

```
현재 상태 파악:
□ 기존 컴포넌트/훅/유틸리티 개수 확인
□ 최근 변경사항 및 패턴 진화 파악
□ 확립된 명명 규칙 및 구조 패턴 이해

패턴 분석:
□ shadcn/ui 표준 패턴 확인
□ 중앙화 시스템 사용 방식 파악
□ 타입 정의 및 Props 패턴 이해
□ 접근성 및 품질 표준 확인

제약사항 확인:
□ 하드코딩 금지 규칙 숙지
□ 필수 준수 사항 리스트업
□ 기존 아키텍처와 충돌 여부 검토
□ 중앙화 규칙 준수 방법 계획
```

### ⚡ 실행 준비 단계 (구현 전 필수)

```
구현 계획:
□ 기존 패턴과 일치하는 구조 설계
□ 중앙화 시스템 활용 방법 계획
□ 필요한 텍스트/상수 추가 계획
□ 타입 정의 완전성 계획

품질 게이트:
□ 하드코딩 사용 방지 체크
□ 기존 패턴 일치성 확인
□ 중앙화 규칙 준수 확인
□ 타입 안정성 보장 계획
```

---

## 🎯 컨텍스트 활용 성공 사례

### 사례 1: 올바른 컨텍스트 로딩으로 성공한 컴포넌트 구현

```typescript
// 컨텍스트 로딩 결과:
// - 기존 26개 컴포넌트 중 input.tsx 패턴 확인
// - shadcn/ui cva + forwardRef 패턴 확인
// - brand.ts에서 forms.searchPlaceholder 사용 확인
// - constants.ts에서 heights.input 사용 확인

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, suggestions = [], onSearch, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <div className="relative">
        <input
          ref={ref}
          className={cn(searchInputVariants({ className }))}
          placeholder={uiText.forms.searchPlaceholder.ko}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          {...props}
        />
        {isOpen && suggestions.length > 0 && (
          <div className={cn(
            "absolute z-50 w-full mt-1 bg-background border rounded-md shadow-md",
            layout.shadows.dropdown
          )}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 hover:bg-accent cursor-pointer"
                onClick={() => onSearch?.(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

// ✅ 결과: 기존 패턴 완벽 준수, 중앙화 시스템 활용, 확장 가능한 구조
```

### 사례 2: 컨텍스트 무시로 실패한 구현 (방지해야 할 패턴)

```typescript
// ❌ 컨텍스트 로딩 없이 구현한 경우
function SearchBox() {  // forwardRef 패턴 무시
  return (
    <input
      placeholder="검색어 입력"  // 하드코딩
      className="h-10 px-4"    // 매직 넘버
      style={{width: "300px"}}  // 인라인 스타일
    />
  )
}

// ❌ 결과:
// - 기존 패턴과 불일치
// - 중앙화 시스템 무시
// - 확장성 및 유지보수성 저하
// - 다른 컴포넌트와 스타일 충돌
```

---

## 📊 성과 측정

### 컨텍스트 로딩 성공 지표
- **패턴 일치율**: 95% 이상 (기존 코드와 일관성)
- **하드코딩 발생률**: 0% (완전 방지)
- **중앙화 규칙 준수율**: 100%
- **타입 안정성**: 100% (모든 Props 타입 정의)
- **재작업 필요율**: 5% 이하

### 컨텍스트 무시시 문제점
- **UI 일관성 파괴**: 30-50% 확률
- **하드코딩 발생**: 80% 확률
- **리팩터링 필요**: 90% 확률
- **재작업 시간**: 2-3배 증가
- **기술 부채 증가**: 장기적 유지보수 비용 상승

---

**이 컨텍스트 로딩 시스템을 통해 Claude는 단순한 코드 생성기가 아닌, 프로젝트의 아키텍처 일관성을 보장하는 지능적 개발 파트너로 작동합니다.**
