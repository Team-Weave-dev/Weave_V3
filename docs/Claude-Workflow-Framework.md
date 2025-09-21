# Claude 통합 워크플로우 프레임워크

## 🎯 목적 및 핵심 가치

### 해결하고자 하는 문제
1. **컨텍스트 손실**: 긴 세션에서 중요한 구현 세부사항이 자동 압축으로 손실
2. **UI 파손**: 기존 패턴을 모르고 컴포넌트를 구현하여 일관성 파괴
3. **중복 작업**: 이미 해결된 문제를 재구현하는 비효율
4. **패턴 편차**: 중앙화 시스템을 무시하고 하드코딩 사용

### 핵심 가치
- **컨텍스트 연속성**: 세션 간 완벽한 컨텍스트 보존
- **패턴 일관성**: 확립된 아키텍처 패턴 준수
- **품질 보증**: 작업 전후 검증을 통한 품질 확보
- **지식 축적**: 구현 결정과 패턴을 문서로 누적

---

## 🔄 3단계 워크플로우 아키텍처

```
📖 1단계: 작업 전 컨텍스트 로딩
    ↓
🛠️ 2단계: 컨텍스트 기반 구현
    ↓
📝 3단계: 작업 후 문서 업데이트
```

---

## 📖 1단계: 작업 전 컨텍스트 로딩

### 필수 읽기 순서
```
1. 루트 CLAUDE.md → 전체 프로젝트 구조 파악
2. 영향받는 디렉토리의 claude.md → 구체적 컨텍스트
3. 관련 설정 파일 → 중앙화 시스템 현황
```

### 컨텍스트 로딩 매트릭스

| 작업 유형 | 필수 읽기 파일 | 목적 |
|-----------|----------------|------|
| **컴포넌트 작업** | CLAUDE.md + components/ui/claude.md + config/claude.md | 기존 컴포넌트 패턴, 중앙화 규칙 |
| **훅 작업** | CLAUDE.md + hooks/claude.md + 관련 컴포넌트 | 훅 패턴, 사용처 파악 |
| **페이지 작업** | CLAUDE.md + app/claude.md + config/claude.md | 라우팅 패턴, 브랜드 시스템 |
| **설정 변경** | CLAUDE.md + config/claude.md + 모든 하위 claude.md | 전체 영향도 분석 |
| **유틸리티 작업** | CLAUDE.md + lib/claude.md + 사용처 분석 | 기존 함수, 재사용성 |

### 컨텍스트 분석 체크리스트
- [ ] **현재 상태**: 기존 컴포넌트/훅/유틸리티 개수와 목록
- [ ] **패턴 확인**: 확립된 명명 규칙, 구조 패턴
- [ ] **중앙화 규칙**: brand.ts, constants.ts 사용 방식
- [ ] **의존성**: 기존 컴포넌트들과의 관계
- [ ] **제약사항**: 금지사항, 필수 준수 규칙

---

## 🛠️ 2단계: 컨텍스트 기반 구현

### 구현 원칙
```typescript
// ✅ 항상 준수해야 할 원칙
1. 중앙화 시스템 필수 사용 (brand.ts, constants.ts)
2. 기존 패턴과 일치하는 구조
3. 확립된 명명 규칙 준수
4. shadcn/ui 표준 패턴 활용
5. 타입 안정성 100% 보장
```

### 품질 게이트
```
구현 중 실시간 검증:
- 하드코딩 사용 금지 확인
- 기존 컴포넌트와 패턴 일치성
- 중앙화 시스템 규칙 준수
- 타입 정의 완전성
- 접근성 표준 준수
```

### 구현 가이드라인

#### 컴포넌트 구현시
```typescript
// 1. 기존 패턴 확인
// components/ui/claude.md에서 유사 컴포넌트 패턴 확인

// 2. 중앙화 시스템 사용
import { uiText } from '@/config/brand'
import { layout, typography } from '@/config/constants'

// 3. shadcn/ui 표준 준수
const ComponentVariants = cva(
  "기본 클래스",
  { variants: { /* 변형 정의 */ } }
)

// 4. 타입 정의 완전성
interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "secondary"
  // 모든 props 타입 정의
}
```

#### 훅 구현시
```typescript
// 1. 기존 훅 패턴 준수
// hooks/claude.md에서 확립된 훅 패턴 확인

// 2. 타입 안정성
export function useCustomHook<T>(
  param: string
): [T, (value: T) => void] {
  // 완전한 타입 정의와 함께 구현
}

// 3. 중앙화 시스템과 통합
// 필요시 brand.ts의 텍스트 사용
```

---

## 📝 3단계: 작업 후 문서 업데이트

### 업데이트 대상 결정
```
작업 영역에 따른 업데이트 파일:
- src/components/ui/* 작업 → components/ui/claude.md + CLAUDE.md
- src/hooks/* 작업 → hooks/claude.md + CLAUDE.md
- src/lib/* 작업 → lib/claude.md + CLAUDE.md
- src/app/* 작업 → app/claude.md + CLAUDE.md
- src/config/* 작업 → config/claude.md + 모든 관련 claude.md + CLAUDE.md
```

### 문서 업데이트 템플릿

#### 컴포넌트 추가시
```markdown
## 📦 설치된 컴포넌트 (X개)

- **새컴포넌트**: 구체적인 기능 설명
  - 주요 기능: 핵심 기능 나열
  - 사용 패턴: 일반적인 사용법
  - 특이사항: 주의할 점이나 고급 기능

*마지막 업데이트: YYYY-MM-DD*

## 🆕 최근 추가된 패턴 (새로운 패턴이 있는 경우)

### 새패턴명
```typescript
// 패턴 예시 코드
// 사용법과 적용 상황 설명
```
```

#### 훅 추가시
```markdown
## 📦 설치된 훅 (X개)

- **새훅**: 훅의 목적과 기능
  - 반환값: 반환하는 값들의 의미
  - 매개변수: 받는 매개변수들
  - 사용 시나리오: 언제 사용하는지

## 🔗 훅 간 관계 (필요시)
- 새훅 ↔ 기존훅: 관계 설명
```

#### 설정 변경시
```markdown
# 변경된 설정 내용

## 🔄 변경사항
- **변경된 파일**: 구체적 변경 내용
- **영향받는 컴포넌트**: 변경으로 영향받는 부분들
- **마이그레이션 가이드**: 기존 코드 수정 방법

## 📋 업데이트 필요 사항
- [ ] 관련 컴포넌트들의 import 변경
- [ ] 타입 정의 업데이트
- [ ] 문서 예시 코드 수정
```

### 메인 CLAUDE.md 업데이트

#### 통계 자동 반영
```markdown
📁 중앙화된 디렉토리 구조
- 🧩 components/ (X개)  ← 자동 업데이트
- 🪝 hooks/ (X개)      ← 자동 업데이트
- 📚 lib/ (X개)        ← 자동 업데이트
```

#### 아키텍처 변경사항 기록
```markdown
## 📊 시스템 현황

### 🔄 최근 주요 변경사항
- **YYYY-MM-DD**: 구체적 변경사항과 영향
- **패턴 진화**: 새로 확립된 패턴이나 개선된 방식
```

---

## 🔍 품질 검증 프로세스

### 작업 전 검증
```
- [ ] 관련 claude.md 파일 모두 읽었는가?
- [ ] 기존 패턴과 규칙을 이해했는가?
- [ ] 중앙화 시스템 현황을 파악했는가?
- [ ] 유사한 기존 구현이 있는지 확인했는가?
```

### 작업 중 검증
```
- [ ] 하드코딩을 사용하지 않았는가?
- [ ] 기존 패턴과 일치하는가?
- [ ] 중앙화 규칙을 준수하는가?
- [ ] 타입 정의가 완전한가?
```

### 작업 후 검증
```
- [ ] 관련 claude.md 파일을 모두 업데이트했는가?
- [ ] 새로운 패턴을 문서화했는가?
- [ ] 메인 CLAUDE.md의 통계를 업데이트했는가?
- [ ] 변경사항이 다른 영역에 미치는 영향을 검토했는가?
```

---

## 🚀 실제 적용 시나리오

### 시나리오 1: SearchInput 컴포넌트 추가 요청

#### 1단계: 컨텍스트 로딩
```
📖 읽어야 할 파일들:
1. CLAUDE.md → 프로젝트 구조, 26개 기존 컴포넌트 확인
2. components/ui/claude.md → Input, Button 등 기존 폼 컴포넌트 패턴
3. config/claude.md → brand.ts, constants.ts 사용 규칙

🧠 파악해야 할 내용:
- 기존 Input 컴포넌트 구조와 패턴
- 자동완성 관련 기존 구현 여부
- 폼 컴포넌트의 일반적 props 패턴
- shadcn/ui 표준 준수 방식
```

#### 2단계: 구현
```typescript
// 기존 패턴을 따라 구현
import { cn } from "@/lib/utils"
import { uiText } from "@/config/brand"
import { layout } from "@/config/constants"

// shadcn/ui 표준 패턴 사용
const searchInputVariants = cva(
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        default: "h-10",
        sm: "h-9",
        lg: "h-11"
      }
    }
  }
)

// 중앙화 시스템 사용
placeholder={uiText.forms.searchPlaceholder.ko}
```

#### 3단계: 문서 업데이트
```markdown
// components/ui/claude.md 업데이트
## 📦 설치된 컴포넌트 (27개)  ← 26→27로 업데이트

- **search-input**: 자동완성 기능이 있는 검색 입력 컴포넌트
  - 주요 기능: 실시간 검색, 키보드 네비게이션, 접근성 지원
  - 사용 패턴: 필터링, 전역 검색, 선택적 자동완성
  - 특이사항: onSearch callback과 suggestions prop 활용

## 🆕 최근 추가된 패턴

### 자동완성 패턴
- Dropdown + Input 조합으로 suggestions 표시
- 키보드 네비게이션 (↑↓ Enter Esc) 지원
- 접근성: aria-expanded, aria-selected 속성 활용
```

```markdown
// CLAUDE.md 업데이트
🧩 components/ (27개)  ← 통계 업데이트

### 🔄 최근 주요 변경사항
- **2024-01-15**: SearchInput 컴포넌트 추가 - 자동완성 패턴 확립
```

---

## 📊 성공 지표

### 정량적 지표
- **컨텍스트 재구성 시간**: 15분 → 2분 (87% 개선)
- **패턴 준수율**: 95% 이상 달성
- **하드코딩 발생률**: 0건 유지
- **문서 동기화율**: 100% (1분 내 업데이트)

### 정성적 지표
- **개발 연속성**: 세션 변경시에도 일관된 구현
- **품질 향상**: UI 파손 및 패턴 편차 사전 방지
- **지식 보존**: 구현 결정사항과 패턴의 누적
- **개발 효율성**: 중복 작업 및 재작업 최소화

---

## 🔮 프레임워크 발전 계획

### 단기 (1-2주)
- 기본 워크플로우 정착 및 실제 적용
- 체크리스트 및 템플릿 최적화
- 첫 번째 성공 사례 확보

### 중기 (1-2개월)
- 패턴 라이브러리 구축
- 자동화 도구와 연계
- 복잡한 리팩터링 시나리오 대응

### 장기 (3개월+)
- AI 기반 패턴 추천 시스템
- 교차 프로젝트 패턴 공유
- 팀 협업 워크플로우 확장

---

**이 프레임워크는 Claude가 단순한 코딩 도구가 아닌 프로젝트의 아키텍처 일관성을 보장하는 지능적 파트너로 작동하도록 설계되었습니다.**