# scripts/ - 자동화 스크립트 시스템

## 🚨 CRITICAL: h2 브랜치 마이그레이션 자동 감지

**이 디렉토리의 스크립트들은 Claude가 자동으로 실행합니다. h2 브랜치 또는 UI 중앙화 작업 시 자동 활성화됩니다.**

## 📁 스크립트 구조

```
scripts/
├── claude.md                        # 이 파일 - 스크립트 가이드
├── check-and-install-components.js  # 컴포넌트 자동 설치
├── ui-migration-helper.js          # UI 마이그레이션 분석
├── update-claude-docs.js           # 문서 자동 업데이트 (있는 경우)
└── watch-and-update.js            # 실시간 문서 동기화 (있는 경우)
```

## 🎯 h2 브랜치 마이그레이션 도구

### 1. UI Migration Helper (`ui-migration-helper.js`)

**🚨 자동 실행 조건**:
- h2 브랜치 체크아웃 시
- "UI 중앙화" 키워드 감지 시
- 하드코딩된 텍스트/스타일 발견 시

**기능**:
```javascript
// 감지 패턴
- 하드코딩된 한글 텍스트
- 인라인 스타일 (px-, py-, text-*)
- 네이티브 HTML 요소 (button, input, table)
- placeholder, aria-label 등 속성

// 실행 명령
npm run migrate:analyze  // 전체 프로젝트 분석
npm run migrate:h2       // h2 브랜치 전용 분석
```

**출력물**:
- 콘솔 리포트: 문제 파일 목록 및 이슈
- `migration-guide.md`: 맞춤형 마이그레이션 가이드

### 2. Component Checker (`check-and-install-components.js`)

**🚨 자동 실행 조건**:
- 컴포넌트 import 에러 발생 시
- h2 브랜치 병합 후
- `npm run check:components` 명령 시

**기능**:
```javascript
// 필수 shadcn/ui 컴포넌트 목록
const REQUIRED_COMPONENTS = [
  'accordion', 'alert', 'avatar', 'badge', 'button',
  'calendar', 'card', 'carousel', 'chart', 'checkbox',
  // ... 27개 컴포넌트
]

// 자동 처리 프로세스
1. 누락 컴포넌트 감지
2. npx shadcn@latest add [component] 실행
3. brand.ts, constants.ts 업데이트 알림
4. TypeScript 컴파일 확인
```

## 🔄 Claude 자동 워크플로우

### h2 브랜치 작업 감지 시
```bash
# Claude가 자동으로 실행하는 시퀀스
1. git status 확인
2. if (h2_branch || merge_detected) {
     npm run migrate:analyze
   }
3. 분석 결과 기반 실행 계획 생성
4. 사용자 확인 요청
5. 리팩토링 실행
```

### UI 중앙화 실패 감지 시
```bash
# 하드코딩 패턴 발견 시
1. npm run migrate:analyze
2. migration-guide.md 생성
3. 각 파일별 리팩토링 제안
4. brand.ts, constants.ts 업데이트 가이드
```

## 📊 스크립트 실행 매트릭스

| 스크립트 | 자동 실행 | 수동 실행 | 출력 |
|---------|----------|----------|------|
| `check-and-install-components.js` | 컴포넌트 누락 시 | `npm run check:components` | 콘솔 로그 |
| `ui-migration-helper.js` | h2 브랜치 감지 시 | `npm run migrate:analyze` | 리포트 + 가이드 |

## 🛠️ 스크립트 확장 가이드

### 새 마이그레이션 패턴 추가
```javascript
// ui-migration-helper.js에 패턴 추가
const CUSTOM_PATTERNS = [
  /새로운패턴/g,  // 설명
]
```

### 새 컴포넌트 추가
```javascript
// check-and-install-components.js에 추가
const REQUIRED_COMPONENTS = [
  // 기존 컴포넌트...
  'new-component',  // 새 컴포넌트
]
```

## ⚠️ 주의사항

1. **자동 실행 우선순위**
   - 컴포넌트 체크 → UI 분석 → 마이그레이션

2. **수동 개입 필요 시점**
   - brand.ts 텍스트 추가
   - constants.ts 상수 추가
   - 복잡한 비즈니스 로직 리팩토링

3. **성능 고려사항**
   - 대규모 프로젝트에서는 디렉토리별 분석 권장
   - 캐싱 활용으로 반복 분석 최소화

## 📈 성공 메트릭

- **컴포넌트 설치**: 100% 자동화
- **하드코딩 감지**: 95% 정확도
- **마이그레이션 가이드**: 80% 자동 생성
- **수동 작업**: 20% 이하 (텍스트/상수 추가)

## 🔗 관련 문서

- [`../CLAUDE.md`](../CLAUDE.md) - 메인 프로젝트 가이드
- [`../docs/h2-branch-ui-migration-workflow.md`](../docs/h2-branch-ui-migration-workflow.md) - 상세 워크플로우
- [`../src/components/claude.md`](../src/components/claude.md) - 컴포넌트 시스템

---

**이 스크립트들은 h2 브랜치 UI 중앙화 작업을 90% 자동화합니다. Claude가 자동으로 감지하고 처리합니다.**