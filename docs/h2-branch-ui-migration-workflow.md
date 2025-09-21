# 📋 h2 브랜치 UI 중앙화 마이그레이션 워크플로우

## 🎯 목적
New_Weave 저장소의 h2 브랜치에 구현된 기능들을 유지하면서, UI 컴포넌트와 스타일을 현재 프로젝트의 중앙화 시스템으로 리팩토링합니다.

## 🚀 전체 실행 계획

### Phase 1: 준비 단계

```bash
# 1. 현재 작업 저장
git add .
git commit -m "feat: UI 마이그레이션 도구 추가"

# 2. 새 브랜치 생성
git checkout -b feature/h2-ui-refactor

# 3. h2 브랜치 가져오기
git remote add new-weave https://github.com/Team-Weave-dev/New_Weave.git
git fetch new-weave h2

# 4. 현재 프로젝트 상태 분석
npm run migrate:analyze
```

### Phase 2: 병합 전략

#### Option A: 선택적 병합 (권장)
```bash
# 특정 디렉토리만 병합
git checkout new-weave/h2 -- src/app/invoices
git checkout new-weave/h2 -- src/app/projects
git checkout new-weave/h2 -- src/app/ai-assistant
```

#### Option B: 전체 병합 후 리팩토링
```bash
# 전체 병합 (충돌 예상)
git merge new-weave/h2 --no-commit
# 충돌 해결 후 진행
```

### Phase 3: UI 컴포넌트 리팩토링

#### 3.1 컴포넌트 분석
```bash
# 마이그레이션이 필요한 파일 스캔
npm run migrate:h2

# 누락된 컴포넌트 확인 및 설치
npm run check:components
```

#### 3.2 텍스트 중앙화
```typescript
// config/brand.ts에 추가
export const invoiceText = {
  title: { ko: "송장 관리", en: "Invoice Management" },
  create: { ko: "새 송장", en: "New Invoice" },
  list: { ko: "송장 목록", en: "Invoice List" },
  // ... h2 브랜치의 모든 텍스트
}

export const projectText = {
  title: { ko: "프로젝트", en: "Projects" },
  dashboard: { ko: "대시보드", en: "Dashboard" },
  // ... 프로젝트 관련 텍스트
}

export const aiAssistantText = {
  title: { ko: "AI 어시스턴트", en: "AI Assistant" },
  chat: { ko: "대화", en: "Chat" },
  // ... AI 어시스턴트 텍스트
}
```

#### 3.3 컴포넌트 변환 예시

**변환 전 (h2 브랜치)**:
```tsx
// src/app/invoices/page.tsx
export default function InvoicePage() {
  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold">송장 관리</h1>
      <button className="px-4 py-2 bg-blue-500 text-white">
        새 송장 만들기
      </button>
    </div>
  );
}
```

**변환 후 (중앙화 적용)**:
```tsx
// src/app/invoices/page.tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getInvoiceText } from '@/config/brand';
import { layout } from '@/config/constants';

export default function InvoicePage() {
  return (
    <Card className={layout.container}>
      <CardHeader>
        <CardTitle>{getInvoiceText.title('ko')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>
          {getInvoiceText.create('ko')}
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Phase 4: 검증 및 테스트

```bash
# 1. TypeScript 컴파일 확인
npm run type-check

# 2. 린트 확인
npm run lint

# 3. 빌드 테스트
npm run build

# 4. 개발 서버에서 기능 테스트
npm run dev
```

### Phase 5: 문서 업데이트

```bash
# claude.md 파일들 자동 업데이트
npm run docs:update

# 변경사항을 CLAUDE.md에 기록
echo "## 🔄 Recent Changes

- **$(date +%Y-%m-%d)**: h2 브랜치 UI 중앙화 완료
  - invoices 모듈 UI 리팩토링
  - projects 모듈 UI 리팩토링
  - ai-assistant 모듈 UI 리팩토링
  - brand.ts에 새로운 텍스트 섹션 추가
  - 모든 하드코딩된 스타일 제거" >> CLAUDE.md
```

## 🛠️ 도구 사용법

### 마이그레이션 분석 도구
```bash
# 전체 src 디렉토리 스캔
npm run migrate:analyze

# 특정 디렉토리 스캔
node scripts/ui-migration-helper.js src/app/invoices
```

### 컴포넌트 체크 도구
```bash
# 누락된 컴포넌트 확인 및 설치
npm run check:components
```

## ⚠️ 주의사항

1. **기능 보존**: 비즈니스 로직과 API 호출은 수정하지 않음
2. **점진적 리팩토링**: 한 번에 한 모듈씩 진행
3. **테스트 우선**: 각 단계마다 기능 동작 확인
4. **문서화**: 모든 변경사항을 claude.md에 기록

## 📊 예상 작업량

| 모듈 | 파일 수 | 예상 시간 | 난이도 |
|------|---------|-----------|---------|
| invoices | ~10 | 2-3시간 | 중간 |
| projects | ~15 | 3-4시간 | 높음 |
| ai-assistant | ~8 | 2시간 | 중간 |
| 공통 컴포넌트 | ~20 | 4시간 | 높음 |

**총 예상 시간**: 11-13시간

## 🔄 롤백 계획

문제 발생 시:
```bash
# 변경사항 스태시
git stash

# 이전 커밋으로 롤백
git reset --hard HEAD~1

# 또는 브랜치 전체 리셋
git checkout main
git branch -D feature/h2-ui-refactor
```

## ✅ 체크리스트

- [ ] h2 브랜치 분석 완료
- [ ] 마이그레이션 도구 준비
- [ ] 기능별 병합 계획 수립
- [ ] invoices 모듈 리팩토링
- [ ] projects 모듈 리팩토링
- [ ] ai-assistant 모듈 리팩토링
- [ ] brand.ts 텍스트 추가
- [ ] constants.ts 상수 추가
- [ ] TypeScript 컴파일 성공
- [ ] 빌드 테스트 통과
- [ ] 기능 동작 확인
- [ ] 문서 업데이트
- [ ] PR 생성 및 리뷰

---

**작성일**: 2025-09-22
**작성자**: Claude Code Assistant
**버전**: 1.0.0