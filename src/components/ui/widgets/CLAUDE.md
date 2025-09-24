# 위젯 개발 가이드 (Widget Development Guide)

이 문서는 `src/components/ui/widgets` 폴더에서 새로운 위젯을 생성할 때 반드시 따라야 할 공통 규칙과 패턴을 정의합니다.

## 🎯 핵심 원칙

1. **중앙화 시스템 우선**: 모든 텍스트와 스타일은 중앙화된 설정 파일 사용
2. **일관성 유지**: 기존 위젯과 동일한 구조와 스타일 패턴 적용
3. **접근성 보장**: WCAG 2.1 AA 준수
4. **반응형 디자인**: 모든 화면 크기에서 적절히 작동

## 📐 위젯 구조 표준

### 1. 기본 컴포넌트 구조

```tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
// 필요한 다른 컴포넌트 import

import { cn } from '@/lib/utils';
import { getWidgetText } from '@/config/brand';
import { typography } from '@/config/constants';
import type { YourWidgetProps } from '@/types/dashboard';

export function YourWidget({ title, ...props }: YourWidgetProps) {
  const displayTitle = title || getWidgetText.yourWidget.title('ko');
  
  // 위젯 로직
  
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* 헤더 영역 */}
      {/* 콘텐츠 영역 */}
    </Card>
  );
}
```

### 2. 헤더 구조 표준

#### 2.1 기본 헤더 (제목 + 설명만)
```tsx
<CardHeader>
  <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
  <CardDescription className={typography.text.description}>
    {getWidgetText.yourWidget.description('ko')}
  </CardDescription>
</CardHeader>
```

#### 2.2 툴바가 있는 헤더 (우측 정렬)
```tsx
<CardHeader>
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <CardTitle className={typography.widget.title}>{displayTitle}</CardTitle>
      <CardDescription className={typography.text.description}>
        {getWidgetText.yourWidget.description('ko')}
      </CardDescription>
    </div>
    <div className="flex items-center gap-1">
      {/* 툴바 버튼들 */}
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <IconName className="h-4 w-4" />
      </Button>
    </div>
  </div>
</CardHeader>
```

#### 2.3 액션 버튼이 제목 옆에 있는 경우 (TodoList 스타일)
```tsx
<CardHeader>
  <CardTitle className={cn(typography.widget.title, "flex items-center justify-between")}>
    <span>{displayTitle}</span>
    <Button size="sm" variant="ghost" className="h-6 px-2">
      <Plus className="h-3 w-3" />
    </Button>
  </CardTitle>
  <CardDescription className={typography.text.description}>
    {getWidgetText.yourWidget.description('ko')}
  </CardDescription>
</CardHeader>
```

### 3. 콘텐츠 영역 구조

```tsx
<CardContent className="flex-1 overflow-auto min-h-0 px-1 pb-2">
  <div className="flex flex-col h-full">
    {/* 필터/도구 영역 (선택사항) */}
    <div className="mb-2 px-3">
      {/* 필터, 검색 등 */}
    </div>
    
    {/* 메인 콘텐츠 */}
    <ScrollArea className="flex-1">
      <div className="space-y-2 px-3">
        {/* 콘텐츠 아이템들 */}
      </div>
    </ScrollArea>
    
    {/* 하단 범례/정보 (선택사항) */}
    <div className="px-3 pt-3 mt-auto border-t">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {/* 범례 아이템들 */}
      </div>
    </div>
  </div>
</CardContent>
```

## 🎨 스타일링 규칙

### 1. 간격 (Spacing) 규칙

#### 패딩 (Padding)
- **CardHeader**: 기본값 사용 (shadcn/ui 기본 패딩)
- **CardContent**: `px-1 pb-2` (좌우 최소 패딩, 하단 작은 패딩)
- **콘텐츠 내부**: `px-3` (실제 콘텐츠는 좌우 12px 패딩)
- **범례/하단 영역**: `px-3 pt-3` (상단 경계선과 함께)

#### 마진 (Margin)
- **섹션 간**: `mb-2` (8px)
- **아이템 간**: `space-y-2` (8px 간격)
- **하단 고정 요소**: `mt-auto` (남은 공간 활용)

### 2. 크기 (Sizing) 규칙

#### 버튼 크기
- **헤더 툴바 버튼**: `h-8 w-8 p-0` (아이콘만) 또는 `h-8 px-2` (텍스트 포함)
- **제목 옆 액션 버튼**: `h-6 px-2`
- **콘텐츠 내 버튼**: `h-7 px-2` 또는 상황에 맞게

#### 아이콘 크기
- **기본 아이콘**: `h-4 w-4`
- **작은 버튼 내 아이콘**: `h-3 w-3`
- **큰 표시용 아이콘**: `h-5 w-5` 또는 `h-6 w-6`

#### Select/Input 크기
- **Select 드롭다운**: `w-[100px] h-8` (고정 너비) 또는 `w-full h-8` (전체 너비)
- **Input 필드**: `h-8` (기본 높이)

### 3. 색상 (Color) 규칙

#### 상태별 배경색
```tsx
// 긴급/위험
"bg-red-50 border-red-200" // 또는 "bg-destructive/10 border-destructive/30"

// 경고/주의
"bg-orange-50 border-orange-200" // 또는 "bg-primary/5 border-primary/20"

// 일반/정보
"bg-blue-50 border-blue-200"

// 완료/성공
"bg-green-50 border-green-200"

// 기본
"bg-gray-50 border-gray-200"
```

#### 텍스트 색상
```tsx
// 상태별 텍스트
"text-red-500" // 긴급
"text-orange-500" // 주의
"text-blue-500" // 정보
"text-green-500" // 성공
"text-muted-foreground" // 보조 텍스트
```

### 4. 타이포그래피 규칙

**중앙화된 타이포그래피 사용 (constants.ts)**
```tsx
// 제목
typography.widget.title // 위젯 제목

// 설명
typography.text.description // 위젯 설명

// 값
typography.widget.value // 큰 값 표시 (예: D-16)
typography.widget.label // 레이블 텍스트

// 일반 텍스트
typography.text.small // 작은 텍스트
typography.text.xs // 아주 작은 텍스트 (범례 등)
```

## 📦 Badge 사용 규칙

```tsx
// 기본 Badge
<Badge variant="outline" className="text-xs">텍스트</Badge>

// 상태별 Badge
<Badge variant="error">긴급</Badge>
<Badge variant="warning">주의</Badge>
<Badge variant="default">일반</Badge>
<Badge variant="secondary">보조</Badge>
<Badge variant="outline">테두리</Badge>
```

## 📜 ScrollArea 사용 규칙

```tsx
// 기본 스크롤 영역
<ScrollArea className="flex-1">
  <div className="space-y-2 px-3">
    {/* 스크롤 가능한 콘텐츠 */}
  </div>
</ScrollArea>

// 빈 상태 표시
{items.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
    <IconName className="h-8 w-8 mb-2" />
    <p className="text-sm">데이터가 없습니다</p>
  </div>
) : (
  <div className="space-y-2 px-3">
    {/* 아이템 렌더링 */}
  </div>
)}
```

## 🔧 중앙화 시스템 통합

### 1. brand.ts 업데이트

```typescript
// src/config/brand.ts에 위젯 텍스트 추가
export const getWidgetText = {
  // ... 기존 위젯들
  yourWidget: {
    title: (lang: 'ko' | 'en' = defaultLanguage) => 
      lang === 'ko' ? '위젯 제목' : 'Widget Title',
    description: (lang: 'ko' | 'en' = defaultLanguage) => 
      lang === 'ko' ? '위젯 설명' : 'Widget description',
    // 추가 텍스트들...
  }
}
```

### 2. 타입 정의 추가

```typescript
// src/types/dashboard.ts에 타입 추가
export interface YourWidgetProps {
  title?: string;
  // 다른 props...
}

// 필요한 경우 추가 타입 정의
export interface YourDataType {
  id: string;
  // 데이터 필드들...
}
```

## ✅ 체크리스트

새 위젯 생성 시 확인 사항:

- [ ] 중앙화된 텍스트 시스템 사용 (`brand.ts`)
- [ ] 중앙화된 스타일 상수 사용 (`constants.ts`)
- [ ] CardHeader에 CardDescription 포함
- [ ] 일관된 간격 규칙 적용 (px-1, px-3, mb-2 등)
- [ ] ScrollArea 사용으로 반응형 스크롤 처리
- [ ] 빈 상태 UI 구현
- [ ] TypeScript 타입 정의 완성
- [ ] 접근성 속성 추가 (aria-label 등)
- [ ] 반응형 레이아웃 확인
- [ ] 다크모드 지원 확인

## 📝 참고 위젯

다음 위젯들을 참고하여 일관성 유지:

1. **TaxDeadlineWidget.tsx** - 표준 구조의 좋은 예시
2. **TodoListWidget.tsx** - 복잡한 상호작용이 있는 위젯
3. **CalendarWidget.tsx** - 툴바가 많은 위젯
4. **ProjectSummaryWidget.tsx** - 탭과 상태 관리가 있는 위젯

## 🚨 주의사항

1. **절대 하드코딩 금지**: 모든 텍스트는 `brand.ts`에서 관리
2. **인라인 스타일 최소화**: Tailwind 클래스 사용
3. **매직 넘버 금지**: 모든 수치는 상수로 정의
4. **console.log 제거**: 프로덕션 코드에 로그 남기지 않기
5. **TODO 주석 금지**: 완성된 코드만 커밋

---

이 가이드를 따라 일관성 있고 유지보수가 쉬운 위젯을 개발하세요.