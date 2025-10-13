# src/lib/types - 라이브러리 타입

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~17: 핵심 책임
- 18~20: 구조 요약
- 21~53: 파일 라인 맵
- 54~56: 중앙화·모듈화·캡슐화
- 57~60: 작업 규칙
- 61~65: 관련 문서

## 디렉토리 목적
라이브러리 계층에서 사용하는 도메인별 타입을 정의합니다.

## 핵심 책임
- project-table, settings, theme 타입 정의

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- project-table.types.ts 03~14 export ProjectTableColumn - 프로젝트 테이블 시스템 중앙화된 타입 정의
- project-table.types.ts 15~52 export ProjectTableRow
- project-table.types.ts 53~61 export ProjectStatus
- project-table.types.ts 62~69 export SettlementMethod - 정산방식 타입
- project-table.types.ts 70~76 export PaymentStatus - 수금상태 타입 수금상태 타입
- project-table.types.ts 77~83 export Currency - 통화 단위 타입
- project-table.types.ts 84~86 export WBSTaskStatus - WBS 작업 상태 타입
- project-table.types.ts 87~99 export WBSTask - WBS 작업 아이템
- project-table.types.ts 100~105 export WBSTemplateType - WBS 템플릿 타입
- project-table.types.ts 106~130 export ContractInfo
- project-table.types.ts 131~138 export EstimateInfo - 견적서 정보 인터페이스 추가
- project-table.types.ts 139~153 export BillingInfo
- project-table.types.ts 154~166 export DocumentInfo
- project-table.types.ts 167~175 export ProjectDocumentStatus - 프로젝트 문서 현황 통합 관리
- project-table.types.ts 176~182 export DocumentStatus - 개별 문서 상태
- project-table.types.ts 183~193 export TableFilterState
- project-table.types.ts 194~198 export TableSortState
- project-table.types.ts 199~226 export ProjectTableConfig
- project-table.types.ts 227~251 export calculateProjectProgress - WBS 작업 목록을 기반으로 프로젝트 진행률을 자동 계산합니다. 완료된 작업 수 / 전체 작업 수 * 100 @param wbsTasks - WBS 작업 목록 @returns 진행률 (0-100) @example const tasks = [ { id: '1', name: '기획', status: 'completed', ... }, { id: '2', name: '설계', status: 'in_progress', ... }, { id: '3', name: '개발', status: 'pending', ... } ] calculateProjectProgress(tasks) // 33 (1/3 * 100)
- project-table.types.ts 252~259 export getWBSTaskCounts - WBS 작업 목록의 상태별 개수를 계산합니다. @param wbsTasks - WBS 작업 목록 @returns 상태별 작업 개수 객체 @example getWBSTaskCounts(tasks) // { //   total: 5, //   pending: 2, //   inProgress: 1, //   completed: 2 // }
- settings.types.ts 08~10 export PlanType - 요금제 타입
- settings.types.ts 11~25 export Plan - 요금제 정보
- settings.types.ts 26~45 export Usage - 사용량 정보
- settings.types.ts 46~55 export PaymentMethod - 결제 수단
- settings.types.ts 56~58 export PaymentStatus - 결제 상태
- settings.types.ts 59~69 export BillingHistory - 결제 내역
- settings.types.ts 70~73 export ChangePlanDTO - 요금제 변경 DTO
- theme.types.ts 03~15 export TypographyVariant - Typography Types for UI Components
- theme.types.ts 16~25 export TypographySize
- theme.types.ts 26~27 export TypographyWeight
- theme.types.ts 28~34 export TypographyColor

## 중앙화·모듈화·캡슐화
- 라이브러리 전용 타입은 src/lib/types에서 관리

## 작업 규칙
- 타입 변경 시 사용 중인 서비스와 컴포넌트를 동기화
- 새 타입 추가 시 상위 문서를 갱신

## 관련 문서
- src/lib/claude.md
- src/app/projects/claude.md
- src/lib/config/claude.md
