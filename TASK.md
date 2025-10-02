# 미니 WBS 기능 구현 작업 체크리스트

## 📋 작업 개요
프로젝트 하위 태스크 관리를 위한 미니 WBS(Work Breakdown Structure) 기능 구현

## 🎯 목표
- 프로젝트별 작업 목록 관리 (대기/진행중/완료)
- 작업 완료율 기반 자동 진행률 계산 (단일 진실 공급원)
- 프로젝트 생성 모달 및 상세 정보에 통합

## 📊 구현 범위
- ✅ Phase 1: 기본 기능
- ✅ Phase 2: UX 개선
- ⏸️ Phase 3: 고급 기능 (향후)

---

## Phase 1: 기본 기능 구현 ✅

### 1.1 타입 정의 및 데이터 구조 ✅
- [x] WBSTask 타입 정의 (`src/lib/types/project-table.types.ts`)
  - [x] WBSTaskStatus 타입: 'pending' | 'in_progress' | 'completed'
  - [x] WBSTask 인터페이스 정의
  - [x] ProjectTableRow에 wbsTasks 필드 추가 (@deprecated progress 주석 추가)
- [x] 진행률 계산 유틸리티 함수 작성
  - [x] calculateProjectProgress(wbsTasks) 함수
  - [x] getWBSTaskCounts(wbsTasks) 함수

### 1.2 데이터 마이그레이션 ✅
- [x] 기존 프로젝트 데이터 마이그레이션 로직
  - [x] migrateProjectToWBS() 함수 작성
  - [x] 기존 progress 값을 유지하는 더미 태스크 생성 (10개 작업)
  - [x] localStorage 데이터 자동 마이그레이션 (getCustomProjects에서 자동 실행)

### 1.3 Mock 데이터 업데이트 ✅ (Clean Slate 시스템으로 생략)
- [x] `src/lib/mock/projects.ts` 업데이트
  - [x] ~~샘플 프로젝트에 wbsTasks 추가~~ (Clean Slate - localStorage만 사용)
  - [x] addCustomProject에서 빈 wbsTasks 배열 초기화
  - [x] ~~updateCustomProject에서 wbsTasks 업데이트 지원~~ (마이그레이션으로 처리)

### 1.4 브랜드 텍스트 추가 ✅
- [x] `src/config/brand.ts`에 WBS 관련 텍스트 추가
  - [x] wbsSection: "작업 목록 (WBS)"
  - [x] wbsAddTask: "작업 추가"
  - [x] wbsTaskStatus: pending/in_progress/completed 텍스트
  - [x] wbsEmpty: "등록된 작업이 없습니다"
  - [x] 템플릿 텍스트 (standard/consulting/education/custom)
  - [x] 헬퍼 함수 (getWBSStatusText, getWBSTemplateText 등)

### 1.5 UI 컴포넌트 구현 ✅
- [x] WBSTaskItem 컴포넌트 생성
  - [x] 위치: `src/components/projects/shared/WBSTaskItem.tsx`
  - [x] 상태별 체크박스/배지 표시 (편집/읽기 모드)
  - [x] 편집 모드: 체크박스 + 삭제 버튼
  - [x] 읽기 모드: 상태 배지만 표시
  - [x] 완료 작업: line-through 스타일 적용
- [x] MiniWBS 컴포넌트 생성
  - [x] 위치: `src/components/projects/shared/MiniWBS.tsx`
  - [x] Collapsible로 접기/펼치기 구현
  - [x] ScrollArea로 최대 높이 300px 제한
  - [x] 태스크 목록 렌더링 (order 정렬)
  - [x] 작업 추가 버튼 (편집 모드)
  - [x] 작업 개수 표시 (완료/전체)

### 1.6 ProjectDetail 컴포넌트 통합 ✅
- [x] `src/components/projects/ProjectDetail/index.tsx` 수정
  - [x] Import 추가
    - [x] MiniWBS 컴포넌트 import
    - [x] WBSTask 타입 import
    - [x] calculateProjectProgress 함수 import
  - [x] EditableProjectData 타입 확장
    - [x] wbsTasks: WBSTask[] 필드 추가 (@deprecated 주석 추가)
  - [x] 레이아웃 구조 변경 (lines 1091-1143)
    - [x] 작업 진행률: progress Input 제거, WBS 기반 자동 계산 표시만
    - [x] 미니 WBS 영역 추가 (ProjectProgress 다음)
    - [x] WBS 핸들러 연결 (인라인 구현)
  - [x] WBS 상태 관리 및 핸들러
    - [x] onStatusChange: 작업 상태 변경 (체크박스 토글)
    - [x] onDelete: 작업 삭제
    - [x] onAddTask: 새 작업 추가 (자동 ID, order 할당)

---

## Phase 2: UX 개선

### 2.1 프로젝트 생성 모달 업데이트 ✅
- [x] `src/app/projects/components/ProjectCreateModal/index.tsx` 수정
  - [x] WBS 템플릿 선택 UI 추가
    - [x] Select 컴포넌트로 템플릿 선택
    - [x] 템플릿 옵션: 표준/컨설팅/교육/커스텀
  - [x] 템플릿별 기본 작업 목록 정의 (`src/lib/wbs/templates.ts`)
  - [x] 생성 시 선택된 템플릿의 작업 목록 추가 (`getWBSTemplateByType` 함수 활용)
  - [x] 브랜드 텍스트 중앙화 (`brand.ts`에 템플릿 선택 관련 텍스트 추가)
  - [x] 타입 체크 통과

### 2.2 빠른 작업 추가 기능 ✅
- [x] 표준 템플릿 정의 (Phase 2.1에서 완료)
  - [x] 표준 프로젝트: 기획, 설계, 개발, 테스트, 배포
  - [x] 컨설팅: 착수, 분석, 제안, 실행, 종료
  - [x] 교육: 기획, 자료 제작, 리허설, 강의, 피드백
- [x] "빠른 템플릿 추가" 버튼 구현
  - [x] 편집 모드에서만 표시
  - [x] 클릭 시 템플릿 선택 다이얼로그 (`WBSTemplateSelectDialog`)
  - [x] 선택한 템플릿 작업들을 현재 목록에 추가 (`onAddFromTemplate` 핸들러)
  - [x] MiniWBS 컴포넌트에 통합 완료
  - [x] ProjectDetail에 템플릿 추가 로직 연결
  - [x] 브랜드 텍스트 중앙화 완료
  - [x] 타입 체크 통과

### 2.3 작업 순서 변경 (드래그 앤 드롭)
- [ ] @hello-pangea/dnd 라이브러리 활용
  - [ ] DragDropContext 설정
  - [ ] Draggable로 각 작업 아이템 래핑
  - [ ] onDragEnd 핸들러로 순서 업데이트
- [ ] order 필드 기반 정렬 로직

---

## ✅ 완료된 작업
(작업 완료 시 이 섹션으로 이동)

---

## 📝 작업 노트

### 현재 프로젝트 정보 구조 (스크린샷 기준)
```
[프로젝트 정보 카드]
├─ 좌측 영역
│  ├─ 프로젝트명: WEAVE2
│  ├─ 클라이언트: NEXTRUNNERS
│  ├─ 통화 단위: 환화 (KRW)
│  ├─ 총 금액: 미설정
│  └─ 정산방식: 선금+잔금
├─ 우측 영역
│  ├─ 등록일: 2025. 10. 2.
│  ├─ 마감일: 2025. 10. 2.
│  └─ 수정일: 2025. 10. 2.
└─ 하단 영역 (변경 예정)
   ├─ 작업 진행률: 0% (progress bar)
   ├─ [미니 WBS 영역 추가 예정] ⭐
   ├─ ─────────── (경계선)
   ├─ 현재 단계: 기획
   ├─ 수금상태: 미시작
   └─ 프로젝트 내용: 내용 없음
```

### 변경 후 구조
```
[프로젝트 정보 카드]
├─ 좌측/우측 영역: 동일
└─ 하단 영역 (변경)
   ├─ 작업 진행률: X% (WBS 기반 자동 계산) ⭐
   ├─ 미니 WBS 영역 (새로 추가) ⭐
   │  └─ [접기/펼치기] 작업 목록 (5개 중 3개 완료)
   ├─ ─────────── (경계선)
   ├─ 현재 단계: 기획 (위로 이동)
   ├─ 수금상태: 미시작 (위로 이동)
   └─ 프로젝트 내용: ...
```

---

## 🔗 관련 파일
- `src/lib/types/project-table.types.ts` - 타입 정의
- `src/lib/mock/projects.ts` - Mock 데이터
- `src/config/brand.ts` - 텍스트 중앙화
- `src/components/projects/ProjectDetail/index.tsx` - 메인 컴포넌트
- `src/components/projects/shared/WBSTaskItem.tsx` - 작업 아이템 (생성 예정)
- `src/components/projects/shared/MiniWBS.tsx` - WBS 컨테이너 (생성 예정)
- `src/app/projects/components/ProjectCreateModal/index.tsx` - 생성 모달

---

**작업 시작일**: 2025-10-02
**예상 완료일**: Phase 2까지 완료 목표
**담당자**: Claude + 사용자
