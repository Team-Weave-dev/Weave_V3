# docs - 서술형 레퍼런스 허브

## 라인 가이드
- 012~015: 디렉토리 목적
- 016~020: 핵심 책임
- 021~023: 구조 요약
- 024~159: 파일 라인 맵
- 160~162: 중앙화·모듈화·캡슐화
- 163~166: 작업 규칙
- 167~171: 관련 문서

## 디렉토리 목적
프로세스와 설계 문서를 모아 개발 의사결정을 지원합니다.
자동 문서화 스크립트가 참조하는 1차 자료 저장소입니다.

## 핵심 책임
- 워크플로, 체크리스트, 컨텍스트 로딩 규칙을 유지
- 스토리지 및 Supabase 설계 자료를 제공
- 위젯 설계와 목업 파일을 관리

## 구조 요약
- widget/: 위젯 관련 레퍼런스 및 목업 (→ docs/widget/claude.md)

## 파일 라인 맵
- Auto-Reference-System.md 03~11 🚨 CRITICAL: 이 문서는 Claude의 자동 실행을 보장합니다 - 이 시스템은 Claude가 **모든 작업 시작 시 자동으로 문서를 참조**하고,
- Auto-Reference-System.md 12~36 🎯 핵심 원칙 - Claude는 작업 요청을 받으면 즉시 claude.md를 읽어야 함
- Auto-Reference-System.md 37~78 🔨 실행 메커니즘 - ```typescript
- Auto-Reference-System.md 79~90 📊 작업별 필수 참조 매핑 - | 작업 유형 | 필수 읽기 파일 | 업데이트 대상 |
- Auto-Reference-System.md 091~106 ⚠️ 위반 감지 및 대응 - ```
- Auto-Reference-System.md 107~128 🔗 SuperClaude 통합 - 이 시스템은 SuperClaude의 output-styles와 연동됩니다:
- Auto-Reference-System.md 129~138 ✅ 검증 체크리스트 - Claude의 올바른 동작 확인:
- Claude-Workflow-Checklists.md 03~23 🎯 워크플로우 전체 개요 - Claude가 모든 작업에서 일관되게 따라야 하는 3단계 워크플로우의 실행 가이드입니다.
- Claude-Workflow-Checklists.md 24~90 📖 1단계: 작업 전 컨텍스트 로딩 체크리스트 - [ ] **claude.md 읽기** - 프로젝트 전체 구조와 현재 상태 파악
- Claude-Workflow-Checklists.md 091~135 🛠️ 2단계: 컨텍스트 기반 구현 체크리스트 - [ ] **명명 규칙**: 기존 파일들과 동일한 명명 규칙 적용
- Claude-Workflow-Checklists.md 136~190 📝 3단계: 작업 후 문서 업데이트 체크리스트 - [ ] **추가된 파일**: 새로 생성된 파일 목록 작성
- Claude-Workflow-Checklists.md 191~237 🚨 문제 해결 및 예외 상황 대응 - ```yaml
- Claude-Workflow-Checklists.md 238~270 📊 워크플로우 성능 최적화 - **병렬 읽기**: 여러 claude.md 파일을 동시에 읽기
- Claude-Workflow-Checklists.md 271~343 🎯 빠른 참조 가이드 - ```
- Claude-Workflow-Framework.md 03~18 🎯 목적 및 핵심 가치 - 1. **컨텍스트 손실**: 긴 세션에서 중요한 구현 세부사항이 자동 압축으로 손실
- Claude-Workflow-Framework.md 19~30 🔄 3단계 워크플로우 아키텍처 - ```
- Claude-Workflow-Framework.md 31~58 📖 1단계: 작업 전 컨텍스트 로딩 - ```
- Claude-Workflow-Framework.md 059~122 🛠️ 2단계: 컨텍스트 기반 구현 - ```typescript
- Claude-Workflow-Framework.md 123~138 📝 3단계: 작업 후 문서 업데이트 - ```
- Claude-Workflow-Framework.md 139~147 📦 설치된 컴포넌트 (X개) - **새컴포넌트**: 구체적인 기능 설명
- Claude-Workflow-Framework.md 148~158 🆕 최근 추가된 패턴 (새로운 패턴이 있는 경우) - ```typescript
- Claude-Workflow-Framework.md 159~165 📦 설치된 훅 (X개) - **새훅**: 훅의 목적과 기능
- Claude-Workflow-Framework.md 166~173 🔗 훅 간 관계 (필요시) - 새훅 ↔ 기존훅: 관계 설명
- Claude-Workflow-Framework.md 174~178 🔄 변경사항 - **변경된 파일**: 구체적 변경 내용
- Claude-Workflow-Framework.md 179~196 📋 업데이트 필요 사항 - [ ] 관련 컴포넌트들의 import 변경
- Claude-Workflow-Framework.md 197~205 📊 시스템 현황 - **YYYY-MM-DD**: 구체적 변경사항과 영향
- Claude-Workflow-Framework.md 206~233 🔍 품질 검증 프로세스 - ```
- Claude-Workflow-Framework.md 234~279 🚀 실제 적용 시나리오 - ```
- Claude-Workflow-Framework.md 280~286 📦 설치된 컴포넌트 (27개)  ← 26→27로 업데이트 - **search-input**: 자동완성 기능이 있는 검색 입력 컴포넌트
- Claude-Workflow-Framework.md 287~304 🆕 최근 추가된 패턴 - Dropdown + Input 조합으로 suggestions 표시
- Claude-Workflow-Framework.md 305~320 📊 성공 지표 - **컨텍스트 재구성 시간**: 15분 → 2분 (87% 개선)
- Claude-Workflow-Framework.md 321~340 🔮 프레임워크 발전 계획 - 기본 워크플로우 정착 및 실제 적용
- Context-Loading-System.md 03~12 🎯 시스템 목적 - Claude가 모든 작업을 시작하기 전에 **현재 프로젝트 상태를 완벽히 파악**하여:
- Context-Loading-System.md 013~110 🔍 작업 유형별 컨텍스트 로딩 가이드 - ```
- Context-Loading-System.md 111~209 📖 컨텍스트 로딩 실행 프로세스 - ```typescript
- Context-Loading-System.md 210~286 🧠 컨텍스트 분석 및 활용 - ```typescript
- Context-Loading-System.md 287~356 📋 실전 컨텍스트 로딩 체크리스트 - ```
- Context-Loading-System.md 357~429 🎯 컨텍스트 활용 성공 사례 - ```typescript
- Context-Loading-System.md 430~448 📊 성과 측정 - **패턴 일치율**: 95% 이상 (기존 코드와 일관성)
- DUALWRITE-DESIGN-FLAW.md 07~18 📋 목차 - 1. [문제 개요](#문제-개요)
- DUALWRITE-DESIGN-FLAW.md 19~33 문제 개요 - DualWrite 모드에서 **단방향 동기화(LocalStorage → Supabase)**만 구현되어, multi-device 환경에서 데이터 무결성이 보장되지 않습니다.
- DUALWRITE-DESIGN-FLAW.md 34~86 근본 원인 분석 - *현재 구조**:
- DUALWRITE-DESIGN-FLAW.md 087~140 Multi-Device 시나리오 - | 시간 | Computer A | Computer B | LocalStorage (A) | LocalStorage (B) | Supabase |
- DUALWRITE-DESIGN-FLAW.md 141~206 현재 아키텍처 분석 - ```typescript
- DUALWRITE-DESIGN-FLAW.md 207~442 해결 방안 - *개요**: DualWrite 모드를 비활성화하고 Supabase를 유일한 SSOT로 사용
- DUALWRITE-DESIGN-FLAW.md 443~630 구현 로드맵 - DualWrite 모드 비활성화 및 Supabase-only 모드 전환
- DUALWRITE-DESIGN-FLAW.md 631~655 참고 자료 - **DualWriteAdapter**: `src/lib/storage/adapters/DualWriteAdapter.ts`
- DUALWRITE-DESIGN-FLAW.md 656~667 결론 - DualWrite 모드의 설계 결함은 **단방향 동기화**와 **충돌 해결 메커니즘 부재**에서 비롯됩니다. 이를 해결하기 위해:
- DUALWRITE-DESIGN-FLAW.md 0668~1027 Phase 5.5-5.6 완료: 충돌 해결 시스템 구현 - *완료일**: 2025-10-10
- DUALWRITE-DESIGN-FLAW.md 1028~1123 Phase 5.7: 충돌 해결 시스템 통합 분석 (2025-10-10) - *분석일**: 2025-10-10
- DUALWRITE-DESIGN-FLAW.md 1124~1465 Phase 5.8: 충돌 해결 시스템 통합 완료 (2025-10-10) - *완료일**: 2025-10-10
- LOADING-GUIDE.md 05~28 🎯 로딩 UI 결정 트리 - 로딩 상태가 발생했을 때 어떤 컴포넌트를 사용해야 할지 결정하는 플로우차트입니다.
- LOADING-GUIDE.md 029~213 📦 사용 가능한 로딩 컴포넌트 - *사용 시기**: 전체 페이지 초기 로딩, 구조적 콘텐츠 로딩
- LOADING-GUIDE.md 214~250 🎨 중앙화된 로딩 텍스트 시스템 - 모든 로딩 관련 텍스트는 `@/config/brand.ts`의 `getLoadingText` 헬퍼를 사용합니다.
- LOADING-GUIDE.md 251~278 📝 페이지별 loading.tsx 패턴 - Next.js의 `loading.tsx` 파일은 페이지 전환 시 자동으로 표시됩니다.
- LOADING-GUIDE.md 279~330 🚀 향후 개선 계획 (Phase 2) - 1. **Skeleton 기본 컴포넌트** (1시간)
- LOADING-GUIDE.md 331~352 📊 품질 체크리스트 - 로딩 UI를 구현할 때 다음 항목들을 확인하세요:
- LOADING-GUIDE.md 353~358 🔗 관련 문서 - [`src/components/ui/claude.md`](../src/components/ui/claude.md) - UI 컴포넌트 상세 가이드
- LOADING-GUIDE.md 359~370 📞 도움말 - 로딩 UI 관련 질문이나 개선 제안은 다음을 참고하세요:
- LOCAL-STORAGE-ARCHITECTURE.md 03~10 📋 목차 - 1. [개요](#개요)
- LOCAL-STORAGE-ARCHITECTURE.md 11~23 개요 - **단계 1**: 모든 데이터를 로컬스토리지로 통합 관리
- LOCAL-STORAGE-ARCHITECTURE.md 24~43 현재 상태 분석 - | 도메인 | 키 | 파일 위치 | 용도 |
- LOCAL-STORAGE-ARCHITECTURE.md 44~76 목표 아키텍처 - ```
- LOCAL-STORAGE-ARCHITECTURE.md 077~162 Storage Manager 시스템 - ```typescript
- LOCAL-STORAGE-ARCHITECTURE.md 163~203 데이터 동기화 - ```typescript
- LOCAL-STORAGE-ARCHITECTURE.md 204~235 구현 로드맵 - [ ] StorageManager 클래스 구현
- LOCAL-STORAGE-ARCHITECTURE.md 236~260 파일 구조 - ```
- LOCAL-STORAGE-ARCHITECTURE.md 261~274 성능 고려사항 - 1. **배치 작업**: 여러 데이터를 한 번에 처리
- LOCAL-STORAGE-ARCHITECTURE.md 275~281 보안 고려사항 - 1. **데이터 암호화**: 민감한 정보 암호화
- LOCAL-STORAGE-ARCHITECTURE.md 282~308 테스트 전략 - ```typescript
- LOCAL-STORAGE-ARCHITECTURE.md 309~320 다음 단계 - 1. **스키마 설계 문서** 작성 (`LOCAL-STORAGE-SCHEMA.md`)
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 03~07 📋 개요 - 이 문서는 로컬스토리지 전역 관리 시스템 구축과 Supabase 마이그레이션을 위한 상세 개발 태스크를 정의합니다.
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 08~24 ✅ 진행 상황 요약 - [x] **Phase 0**: 기반 구축 및 환경 설정 (3개 태스크)
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 25~33 🎯 개발 원칙 - 1. **독립성**: 각 태스크는 독립적으로 개발 및 테스트 가능
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 034~121 [x] Phase 0: 기반 구축 및 환경 설정 - *목표**: Storage 시스템을 위한 디렉토리 구조 생성
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 122~236 [x] Phase 1: Core Storage Manager 구현 - *목표**: StorageManager 클래스의 뼈대 구현
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 237~327 [x] Phase 2: LocalStorage Adapter 구현 - *목표**: LocalStorage 어댑터 클래스 생성
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 328~489 [x] Phase 3: 데이터 스키마 구현 - *목표**: User 타입 정의 및 검증
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 490~697 [x] Phase 4: 도메인 서비스 구현 - *목표**: 서비스 공통 기능 추상화
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 698~816 [x] Phase 5: 마이그레이션 시스템 - *목표**: 버전 관리 및 마이그레이션 실행
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 817~941 [x] Phase 6: 기존 코드 통합 - *목표**: useImprovedDashboardStore 통합
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 0942~1062 [x] Phase 7: 관계 데이터 및 동기화 - *목표**: 프로젝트와 할일 간 관계 구현
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 1063~1356 [x] Phase 7-1: 대시보드 위젯 Storage API 통합 - *목표**: 나머지 4개 위젯의 목 데이터 제거 및 Storage API 연결
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 1357~1505 [x] Phase 8: 성능 최적화 - *목표**: 읽기 성능 향상
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 1506~1541 [x] Phase 9: 테스트 및 검증 - *목표**: 모든 모듈 단위 테스트
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 1542~1582 [x] Phase 10: Supabase 준비 (2/4 완료) - *목표**: Supabase 어댑터 초기 구현
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 1583~1598 📊 우선순위 매트릭스 - | Phase | 중요도 | 난이도 | 예상 시간 | 의존성 |
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 1599~1604 🎯 최소 실행 가능 제품 (MVP) - *MVP 구성**: Phase 0 → 1 → 2 → 3 → 4 → 6 (약 40시간)
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 1605~1617 🔄 반복 가능한 개발 사이클 - 각 태스크는 다음 사이클을 따릅니다:
- LOCAL-STORAGE-DEVELOPMENT-TASKS.md 1618~1644 📝 개발자 노트 - [ ] 이전 태스크의 출력물이 존재하는가?
- LOCAL-STORAGE-MIGRATION.md 03~10 📋 목차 - 1. [개요](#개요)
- LOCAL-STORAGE-MIGRATION.md 11~43 개요 - **데이터 무손실**: 모든 사용자 데이터 안전하게 이전
- LOCAL-STORAGE-MIGRATION.md 044~482 마이그레이션 단계 - *목표**: 통합 Storage API 구축 및 데이터 정규화
- LOCAL-STORAGE-MIGRATION.md 483~536 데이터 매핑 - | LocalStorage 키 | Supabase 테이블/쿼리 | 변환 로직 |
- LOCAL-STORAGE-MIGRATION.md 537~628 구현 계획 - ```bash
- LOCAL-STORAGE-MIGRATION.md 0629~1031 🔐 하이브리드 데이터 접근 전략 - | 접근 방식 | 사용 시기 | 장점 | 예시 |
- LOCAL-STORAGE-MIGRATION.md 1032~1134 리스크 관리 - | 리스크 | 영향도 | 발생 가능성 | 대응 방안 |
- LOCAL-STORAGE-MIGRATION.md 1135~1180 체크리스트 - [x] 아키텍처 설계 문서 작성
- LOCAL-STORAGE-MIGRATION.md 1181~1194 성공 지표 - **데이터 무결성**: 100% 데이터 보존
- LOCAL-STORAGE-MIGRATION.md 1195~1218 롤백 계획 - ```typescript
- LOCAL-STORAGE-MIGRATION.md 1219~1229 참고 자료 - [Supabase 공식 문서](https://supabase.com/docs)
- LOCAL-STORAGE-SCHEMA.md 03~10 📋 목차 - 1. [개요](#개요)
- LOCAL-STORAGE-SCHEMA.md 11~33 개요 - **Supabase 호환성**: 향후 마이그레이션을 위한 1:1 매핑
- LOCAL-STORAGE-SCHEMA.md 34~62 데이터 모델 - ```mermaid
- LOCAL-STORAGE-SCHEMA.md 063~530 스키마 정의 - ```typescript
- LOCAL-STORAGE-SCHEMA.md 531~546 관계 정의 - User → Projects
- LOCAL-STORAGE-SCHEMA.md 547~573 키 네이밍 규칙 - ```
- LOCAL-STORAGE-SCHEMA.md 574~615 버전 관리 - ```typescript
- LOCAL-STORAGE-SCHEMA.md 616~662 데이터 검증 - ```typescript
- LOCAL-STORAGE-SCHEMA.md 663~727 Supabase 마이그레이션 준비 - | LocalStorage Key | Supabase Table | 비고 |
- LOCAL-STORAGE-SCHEMA.md 728~760 성능 최적화 - ```typescript
- LOCAL-STORAGE-SCHEMA.md 761~772 다음 단계 - 1. **TypeScript 인터페이스** 파일 생성
- PRICING-ANALYSIS.md 07~15 목차 - 1. [개요](#개요)
- PRICING-ANALYSIS.md 16~25 개요 - 본 문서는 Weave 프로젝트의 SaaS 과금 구조를 분석하고, MAU(월간 활성 사용자) 규모별 수익성을 평가하여 최적의 가격 정책과 스토리지 용량을 제안합니다.
- PRICING-ANALYSIS.md 26~43 현재 요금제 구조 - | 구분 | Free | Basic | Pro |
- PRICING-ANALYSIS.md 44~61 인프라 비용 분석 - | 플랜 | 월 비용 | Database | Storage | MAU 제한 |
- PRICING-ANALYSIS.md 062~123 MAU별 수익성 분석 - ```
- PRICING-ANALYSIS.md 124~158 스토리지 용량 권장사항 - **프로젝트 메타데이터**: ~1KB/프로젝트
- PRICING-ANALYSIS.md 159~194 스토리지 증가 시 마진율 영향 - **Supabase 추가 스토리지**: $0.021/GB/월 (약 28원/GB/월)
- PRICING-ANALYSIS.md 195~255 결론 및 권장사항 - 1. **높은 수익성 구조**
- PRICING-ANALYSIS.md 256~312 부록 - | 서비스 | 기본 플랜 | 프로 플랜 | 특징 |
- SUPABASE-INTEGRATION-PLAN.md 03~14 📋 목차 - 1. [개요](#개요)
- SUPABASE-INTEGRATION-PLAN.md 15~32 개요 - Weave V3 프로젝트를 로컬스토리지 기반에서 Supabase 클라우드 기반으로 안전하게 마이그레이션
- SUPABASE-INTEGRATION-PLAN.md 33~58 현재 상태 분석 - ✅ **Storage System (84% 완료)**
- SUPABASE-INTEGRATION-PLAN.md 59~87 통합 아키텍처 - ```
- SUPABASE-INTEGRATION-PLAN.md 088~212 인증 시스템 설계 - **이메일/패스워드**: 기본 인증 방식
- SUPABASE-INTEGRATION-PLAN.md 213~412 데이터베이스 스키마 - ```sql
- SUPABASE-INTEGRATION-PLAN.md 413~686 하이브리드 데이터 접근 전략 - *사용 케이스**:
- SUPABASE-INTEGRATION-PLAN.md 0687~1009 마이그레이션 실행 계획 - ```bash
- SUPABASE-INTEGRATION-PLAN.md 1010~1097 테스트 전략 - ```typescript
- SUPABASE-INTEGRATION-PLAN.md 1098~1176 모니터링 및 롤백 - **응답 시간**: p50, p95, p99 레이턴시
- SUPABASE-INTEGRATION-PLAN.md 1177~1372 실행 체크리스트 - [x] Supabase 프로젝트 생성
- SUPABASE-INTEGRATION-PLAN.md 1373~1390 주요 위험 요소 및 대응 - **대응**: 3단계 백업 (LocalStorage + Supabase + 외부)
- SUPABASE-INTEGRATION-PLAN.md 1391~1410 성공 지표 - ✅ 데이터 무결성: 100%

## 중앙화·모듈화·캡슐화
- 프로세스·정책 문서는 docs/ 경로에서 시작하고 실행 지침은 각 claude.md가 담당

## 작업 규칙
- 문서를 추가하거나 갱신하면 루트 claude.md 지원 자료 목록을 업데이트
- `npm run docs:update`로 자동 동기화 상태를 확인

## 관련 문서
- CLAUDE.md
- scripts/update-claude-docs.js
- docs/Auto-Reference-System.md
