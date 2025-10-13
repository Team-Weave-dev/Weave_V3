# claude.md - 프로젝트 작업 허브

## 라인 가이드
- 14~19: 필수 지시사항
- 20~26: 핵심 체크리스트
- 27~37: 필수 명령어
- 38~44: 기술 스택 및 시스템 요약
- 45~219: 전체 디렉토리 구조
- 220~231: 문서 네비게이션
- 232~234: 파일 라인 맵
- 235~239: 문서 동기화 규칙
- 240~248: 관련 문서

## 필수 지시사항
- 모든 커뮤니케이션과 문서는 한글로 작성하고, 코드 내부 명명은 영어로 유지합니다.
- 작업 시작 전 루트 → 상위 → 하위 claude.md 순으로 읽어 컨텍스트를 확보합니다.
- Git 경고에 나온 `please git add <path>`는 새 파일을 스테이징해야 함을 의미합니다.
- 중앙화 설정(`@/config/brand.ts`, `@/config/constants.ts`)을 반드시 참조하고 하드코딩을 피합니다.

## 핵심 체크리스트
1. `docs/Claude-Workflow-Framework.md`의 3단계 흐름(컨텍스트 로딩 → 구현 → 문서화)을 준수했는가?
2. 작업 도메인의 claude.md를 읽고 기존 패턴을 재사용했는가?
3. Supabase/Storage 관련 작업이라면 RLS·마이그레이션·동기화 규칙을 확인했는가?
4. 변경 사항을 문서와 코드에 모두 반영했는가?
5. `npm run lint`와 `npm run type-check` 등 검증이 필요한 명령을 실행했는가?

## 필수 명령어
```bash
npm run dev          # 로컬 개발 서버
npm run build        # 프로덕션 빌드 확인
npm run lint         # ESLint 검사 (경고 포함 확인)
npm run type-check   # TypeScript 타입 검사
npm run docs:update  # 모든 claude.md 자동 갱신
npm run docs:watch   # 실시간 문서 감시
python3 scripts/generate_claude_docs.py  # 스크립트 기반 수동 갱신
```

## 기술 스택 및 시스템 요약
- **Frontend**: Next.js 15(App Router), React 19, Tailwind CSS, shadcn/ui.
- **중앙화**: 모든 텍스트·상수·경로는 `@/config` 계층에서 관리합니다.
- **Storage**: LocalStorage 기반 StorageManager와 Supabase가 공존하며 DualWrite → Supabase 이전 전략이 문서화돼 있습니다.
- **Supabase**: 인증, RLS 정책, 마이그레이션 절차가 `src/lib/supabase`, `supabase/migrations`에 정의돼 있습니다.
- **자동화**: `scripts/generate_claude_docs.py`가 모든 claude.md의 라인 맵을 재생성합니다.

## 전체 디렉토리 구조
```
Weave_V3/
├── docs/
│   ├── widget/
│   │   └── claude.md
│   └── claude.md
├── public/
│   └── claude.md
├── scripts/
│   ├── claude.md
│   └── generate_claude_docs.py
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── google/
│   │   │   │   │   └── claude.md
│   │   │   │   ├── signin/
│   │   │   │   │   └── claude.md
│   │   │   │   ├── signout/
│   │   │   │   │   └── claude.md
│   │   │   │   ├── signup/
│   │   │   │   │   └── claude.md
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   ├── auth/
│   │   │   ├── auth-code-error/
│   │   │   │   └── claude.md
│   │   │   ├── callback/
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   ├── clients/
│   │   │   └── claude.md
│   │   ├── components/
│   │   │   └── claude.md
│   │   ├── dashboard/
│   │   │   └── claude.md
│   │   ├── login/
│   │   │   └── claude.md
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   └── claude.md
│   │   │   ├── components/
│   │   │   │   ├── ProjectCreateModal/
│   │   │   │   │   └── claude.md
│   │   │   │   ├── ProjectHeader/
│   │   │   │   │   └── claude.md
│   │   │   │   ├── ProjectsView/
│   │   │   │   │   └── claude.md
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   ├── settings/
│   │   │   ├── components/
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   ├── signup/
│   │   │   └── claude.md
│   │   ├── tax-management/
│   │   │   └── claude.md
│   │   └── claude.md
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── claude.md
│   │   ├── layout/
│   │   │   └── claude.md
│   │   ├── projects/
│   │   │   ├── ProjectDetail/
│   │   │   │   └── claude.md
│   │   │   ├── shared/
│   │   │   │   ├── ProjectCardCustom/
│   │   │   │   │   └── claude.md
│   │   │   │   ├── ProjectInfoRenderer/
│   │   │   │   │   └── claude.md
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   ├── ui/
│   │   │   ├── widgets/
│   │   │   │   ├── calendar/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   ├── views/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   └── claude.md
│   │   │   │   ├── todo-list/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   ├── constants/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   ├── types/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   └── claude.md
│   │   │   │   │   └── claude.md
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   └── claude.md
│   ├── config/
│   │   └── claude.md
│   ├── contexts/
│   │   └── claude.md
│   ├── hooks/
│   │   └── claude.md
│   ├── lib/
│   │   ├── auth/
│   │   │   └── claude.md
│   │   ├── calendar-integration/
│   │   │   ├── adapters/
│   │   │   │   └── claude.md
│   │   │   ├── data-sources/
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   ├── config/
│   │   │   └── claude.md
│   │   ├── dashboard/
│   │   │   ├── ios-animations/
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   ├── document-generator/
│   │   │   └── claude.md
│   │   ├── hooks/
│   │   │   └── claude.md
│   │   ├── mock/
│   │   │   └── claude.md
│   │   ├── storage/
│   │   │   ├── __tests__/
│   │   │   │   └── claude.md
│   │   │   ├── adapters/
│   │   │   │   └── claude.md
│   │   │   ├── core/
│   │   │   │   └── claude.md
│   │   │   ├── migrations/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── claude.md
│   │   │   │   └── claude.md
│   │   │   ├── monitoring/
│   │   │   │   └── claude.md
│   │   │   ├── services/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── claude.md
│   │   │   │   └── claude.md
│   │   │   ├── types/
│   │   │   │   ├── entities/
│   │   │   │   │   └── claude.md
│   │   │   │   └── claude.md
│   │   │   ├── utils/
│   │   │   │   └── claude.md
│   │   │   └── claude.md
│   │   ├── stores/
│   │   │   └── claude.md
│   │   ├── supabase/
│   │   │   └── claude.md
│   │   ├── types/
│   │   │   └── claude.md
│   │   ├── utils/
│   │   │   └── claude.md
│   │   ├── wbs/
│   │   │   └── claude.md
│   │   └── claude.md
│   ├── types/
│   │   └── claude.md
│   └── claude.md
├── supabase/
│   ├── migrations/
│   │   └── claude.md
│   └── claude.md
└── CLAUDE.md
```

## 문서 네비게이션
| 범위 | 문서 | 목적 |
| --- | --- | --- |
| 전체 아키텍처 | `src/claude.md` | 소스 구조와 개발 규칙 |
| 페이지 & 라우트 | `src/app/claude.md` | App Router 흐름 및 API 라우트 |
| 설정 | `src/config/claude.md` | 브랜드/상수 중앙화 |
| 컴포넌트 | `src/components/claude.md` | UI 라이브러리 및 위젯 |
| 서비스 & 유틸 | `src/lib/claude.md` | Storage, Supabase, 캘린더 |
| 문서 & 체크리스트 | `docs/claude.md` | 워크플로·참고 자료 |
| 자동화 스크립트 | `scripts/claude.md` | 문서/검증 스크립트 |
| Supabase | `supabase/claude.md` | 프로젝트 설정 및 마이그레이션 |

## 파일 라인 맵
- 추적 가능한 파일이 없습니다.

## 문서 동기화 규칙
- 변경 후 `python3 scripts/generate_claude_docs.py` 또는 `npm run docs:update`를 실행해 라인 맵을 최신화합니다.
- 자동 스크립트는 모든 하위 claude.md만 덮어쓰며, 루트 문서는 수동으로 유지됩니다.
- 문서 생성 후 Git 상태를 확인하고 필요한 파일을 스테이징합니다.

## 관련 문서
- docs/Claude-Workflow-Framework.md
- docs/Claude-Workflow-Checklists.md
- docs/Context-Loading-System.md
- docs/Auto-Reference-System.md
- scripts/update-claude-docs.js
- scripts/generate_claude_docs.py
- src/lib/supabase/claude.md
- src/lib/storage/claude.md
