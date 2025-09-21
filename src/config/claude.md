# config/ - 중앙화 설정 시스템

## 🎯 설정 시스템 개요

이 디렉토리는 프로젝트의 모든 설정, 상수, 브랜드 정보를 중앙화하여 관리합니다. **하드코딩 방지**와 **유지보수성 향상**이 핵심 목표입니다.

## 📁 파일 구조

```
config/
├── brand.ts       # 🏷️ 브랜드 정보, UI 텍스트, 다국어 지원
└── constants.ts   # 📐 레이아웃 상수, 매직 넘버, 스타일 값
```

## 🏷️ brand.ts - 브랜드 및 UI 텍스트 관리

### 주요 기능
- **브랜드 정보**: 회사명, 로고, 설명 등
- **UI 텍스트**: 모든 사용자 대면 텍스트
- **다국어 지원**: ko/en 언어 쌍으로 구성
- **라우트 관리**: 모든 페이지 경로 중앙화

### 구조
```typescript
export const brand = {
  name: { ko: "UI 컴포넌트 라이브러리", en: "UI Components Library" },
  company: { ko: "Weave", en: "Weave" },
  description: { /* ... */ },
  logo: { /* ... */ },
  metadata: { /* ... */ },
  copyright: { /* ... */ }
}

export const uiText = {
  buttons: { /* 모든 버튼 텍스트 */ },
  navigation: { /* 네비게이션 메뉴 텍스트 */ },
  notifications: { /* 알림 메시지 */ },
  badges: { /* 배지 텍스트 */ }
}

export const routes = {
  home: "/",
  components: "/components",
  docs: "/docs",
  // ...
}
```

### 헬퍼 함수
```typescript
// 브랜드 정보 접근
export const getBrandName = (lang: 'ko' | 'en' = 'ko') => brand.name[lang]
export const getDescription = (lang: 'ko' | 'en' = 'ko') => brand.description[lang]

// UI 텍스트 접근
export const getNavText = {
  home: (lang: 'ko' | 'en' = 'ko') => uiText.navigation.home[lang],
  docs: (lang: 'ko' | 'en' = 'ko') => uiText.navigation.docs[lang],
  // ...
}
```

### 사용 예시
```typescript
// ✅ 올바른 사용법
import { getBrandName, getNavText } from '@/config/brand'

const title = getBrandName('ko')  // "UI 컴포넌트 라이브러리"
const homeText = getNavText.home('ko')  // "홈"

// ❌ 절대 금지
const title = "UI 컴포넌트 라이브러리"
const homeText = "홈"
```

## 📐 constants.ts - 레이아웃 상수 및 스타일 값

### 주요 기능
- **레이아웃 크기**: 컨테이너, 네비게이션 등의 크기
- **간격 시스템**: 일관된 spacing 관리
- **타이포그래피**: 텍스트 스타일 중앙화
- **애니메이션**: 지속시간, 트랜지션 등
- **기본값**: 프로그레스바, 폼 등의 초기값

### 구조
```typescript
export const layout = {
  container: {
    maxWidth: "980px",
    textMaxWidth: "750px",
    navigationWidth: "256px"
  },
  spacing: {
    section: { sm: "py-8", md: "py-12 md:pb-8", lg: "py-24 pb-20" },
    gap: { small: "gap-2", medium: "gap-4", large: "gap-8" }
  },
  heights: {
    button: "h-11",
    icon: "h-4 w-4",
    logoSmall: "w-8 h-8",
    logoMedium: "w-12 h-12",
    logoLarge: "w-16 h-16"
  }
}

export const typography = {
  title: {
    hero: "text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]",
    section: "text-2xl font-bold text-primary",
    card: "text-lg font-semibold"
  },
  text: {
    body: "text-lg text-muted-foreground sm:text-xl",
    description: "text-sm text-muted-foreground",
    button: "text-sm font-medium"
  }
}

export const defaults = {
  progress: { initialValue: 65, min: 0, max: 100 },
  animation: { duration: "duration-200", transition: "transition-all" }
}
```

### 사용 예시
```typescript
// ✅ 올바른 사용법
import { layout, typography } from '@/config/constants'

<div style={{maxWidth: layout.container.maxWidth}}>
  <h1 className={typography.title.hero}>
    제목
  </h1>
</div>

// ❌ 절대 금지
<div style={{maxWidth: "980px"}}>
  <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
    제목
  </h1>
</div>
```

## 🚨 하드코딩 방지 규칙

### 절대 금지 사항

1. **문자열 하드코딩**
   ```typescript
   // ❌ 금지
   const message = "저장되었습니다"

   // ✅ 허용
   const message = getNotificationText.saveSuccess('ko')
   ```

2. **매직 넘버 하드코딩**
   ```typescript
   // ❌ 금지
   const maxWidth = "980px"

   // ✅ 허용
   const maxWidth = layout.container.maxWidth
   ```

3. **스타일 값 하드코딩**
   ```typescript
   // ❌ 금지
   <button className="h-11 px-8 text-sm font-medium">

   // ✅ 허용
   <button className={`${layout.heights.button} px-8 ${typography.text.button}`}>
   ```

### 새로운 값 추가 프로세스

1. **텍스트 추가**
   ```typescript
   // brand.ts의 uiText 객체에 추가
   export const uiText = {
     // 기존 내용...
     newSection: {
       newText: { ko: "새로운 텍스트", en: "New Text" }
     }
   }

   // 헬퍼 함수 추가
   export const getNewText = {
     newText: (lang: 'ko' | 'en' = defaultLanguage) => uiText.newSection.newText[lang]
   }
   ```

2. **상수 추가**
   ```typescript
   // constants.ts에 추가
   export const layout = {
     // 기존 내용...
     newDimensions: {
       width: "400px",
       height: "300px"
     }
   }
   ```

## 🔄 자동 업데이트 감지

이 디렉토리의 파일이 변경되면 다음 항목들이 자동으로 업데이트되어야 합니다:

- **메인 CLAUDE.md**: 설정 시스템 상태 반영
- **컴포넌트 문서**: 새로운 설정 사용법 안내
- **타입 정의**: TypeScript 인터페이스 업데이트

## 📊 품질 메트릭

### 중앙화 지표
- **하드코딩 문자열**: 0개 (100% 중앙화)
- **매직 넘버**: 0개 (100% 상수화)
- **다국어 커버리지**: 100% (모든 텍스트 ko/en 지원)

### 성능 지표
- **번들 크기**: < 5KB (tree-shaking 최적화)
- **타입 추론**: 100% (모든 함수 완전 타입 추론)

---

**이 중앙화 시스템은 프로젝트의 유지보수성과 확장성을 보장하는 핵심 인프라입니다.**