# src/lib/mock - 목 데이터

## 라인 가이드
- 012~014: 디렉토리 목적
- 015~018: 핵심 책임
- 019~021: 구조 요약
- 022~097: 파일 라인 맵
- 098~100: 중앙화·모듈화·캡슐화
- 101~104: 작업 규칙
- 105~109: 관련 문서

## 디렉토리 목적
개발·테스트 중 사용할 목 데이터와 생성기를 제공합니다.

## 핵심 책임
- 프로젝트·클라이언트·문서 등 도메인별 목 데이터를 생성
- UI 검증을 위한 샘플 데이터를 유지

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- calendar-events.ts 36~97 export loadCalendarEvents - 로컬스토리지에서 이벤트 로드 (Storage API 사용)
- calendar-events.ts 098~165 export saveCalendarEvents - 로컬스토리지에 이벤트 저장 (Storage API 사용)
- calendar-events.ts 166~199 export addCalendarEvent - 이벤트 추가 (React StrictMode 중복 방지)
- calendar-events.ts 200~235 export updateCalendarEvent - 이벤트 수정 (React StrictMode 중복 방지)
- calendar-events.ts 236~271 export deleteCalendarEvent - 이벤트 삭제 (React StrictMode 중복 방지)
- calendar-events.ts 272~287 export resetCalendarEvents - 목데이터 리셋 (개발용)
- calendar-events.ts 288~336 export debugLocalStorageState - localStorage의 모든 데이터를 로그로 출력하여 상태 확인
- calendar-events.ts 337~416 export clearStaleCalendarData - 오래된/잘못된 데이터 구조를 감지하고 정리
- calendar-events.ts 417~501 export resetAllCalendarData - 강제로 모든 캘린더 데이터를 초기화 (핵옵션)
- calendar.ts 071~142 export toStorageCalendarEvent - Convert Dashboard CalendarEvent (UI type) to Storage CalendarEvent (Storage API entity) @param dashboardEvent - UI type CalendarEvent @param userId - Current user ID (default: '1') @returns Storage CalendarEvent entity
- calendar.ts 143~298 export toDashboardCalendarEvent - Convert Storage CalendarEvent (Storage API entity) to Dashboard CalendarEvent (UI type) @param storageEvent - Storage API CalendarEvent entity @returns UI type CalendarEvent
- documents.ts 46~76 export documentInfoToDocument - Convert DocumentInfo (UI type) to Document (Storage API entity) @param documentInfo - UI type DocumentInfo @param projectId - Project ID @param userId - Current user ID (default: '1') @returns Document entity for Storage API
- documents.ts 077~276 export documentToDocumentInfo - Convert Document (Storage API entity) to DocumentInfo (UI type) @param document - Storage API Document entity @returns UI type DocumentInfo
- documents.ts 277~360 export convertGeneratedDocumentToDocumentInfo - GeneratedDocument를 DocumentInfo로 변환하는 헬퍼 함수
- documents.ts 361~425 export cleanupLegacyDocumentData - Clean up legacy document data from localStorage
- exchange-rates.ts 08~66 export ExchangeRate - 환율 데이터 Mock 시스템 USD/KRW 환율 데이터를 제공합니다. 실제 서비스에서는 실시간 환율 API로 대체해야 합니다.
- exchange-rates.ts 67~85 export getExchangeRate - 특정 날짜의 USD → KRW 환율을 가져옵니다. @param date - 날짜 문자열 (YYYY-MM-DD 또는 YYYY-MM 형식) @returns USD를 KRW로 환산하는 환율 @example ```typescript getExchangeRate('2024-03-15')  // 1340 getExchangeRate('2024-03')     // 1340 ```
- exchange-rates.ts 086~102 export convertUSDToKRW - USD 금액을 KRW로 변환합니다. @param usdAmount - USD 금액 @param date - 기준 날짜 (환율 적용) @returns KRW로 변환된 금액 @example ```typescript convertUSDToKRW(1000, '2024-03-15')  // 1340000 ```
- exchange-rates.ts 103~121 export convertKRWToUSD - KRW 금액을 USD로 변환합니다. @param krwAmount - KRW 금액 @param date - 기준 날짜 (환율 적용) @returns USD로 변환된 금액 @example ```typescript convertKRWToUSD(1340000, '2024-03-15')  // 1000 ```
- exchange-rates.ts 122~137 export normalizeToKRW - 모든 통화를 KRW 기준으로 통일합니다. @param amount - 금액 @param currency - 통화 단위 ('KRW' | 'USD') @param date - 기준 날짜 (환율 적용) @returns KRW로 변환된 금액 @example ```typescript normalizeToKRW(50000000, 'KRW', '2024-03-15')  // 50000000 normalizeToKRW(50000, 'USD', '2024-03-15')     // 67000000 ```
- exchange-rates.ts 138~141 export getCurrentExchangeRate - 현재 날짜의 환율을 가져옵니다. @returns 현재 USD/KRW 환율
- projects.ts 40~43 const project
- projects.ts 44~44 const allProjects - ID로 못 찾으면 no 필드로 검색
- projects.ts 45~47 const foundByNo
- projects.ts 48~56 const row
- projects.ts 57~66 const row
- projects.ts 67~88 const CUSTOM_PROJECTS_KEY - localStorage 키 상수
- projects.ts 89~91 const projects - Storage API에서 모든 프로젝트 조회
- projects.ts 092~113 const rows - Project → ProjectTableRow 변환
- projects.ts 114~114 function toProject - ProjectTableRow를 Project 엔티티로 변환
- projects.ts 115~117 const now
- projects.ts 118~186 const normalizeDate - 날짜를 ISO 8601 형식으로 정규화하는 헬퍼 함수
- projects.ts 187~242 function toProjectTableRow - Project 엔티티를 ProjectTableRow로 변환 (표시용)
- projects.ts 243~250 function migrateProjectToWBS - 기존 프로젝트를 WBS 시스템으로 마이그레이션 @param project - 마이그레이션할 프로젝트 @returns WBS 데이터를 포함한 프로젝트 @description - 이미 wbsTasks가 있으면 그대로 반환 - 없으면 기존 progress 값을 유지하는 더미 태스크 생성 - 10개의 기본 작업으로 구성 (기존 진행률 유지)
- projects.ts 251~253 const oldProgress - 기존 progress 값 (없으면 0)
- projects.ts 254~254 const totalTasks - 10개의 더미 태스크 생성
- projects.ts 255~257 const completedTasks
- projects.ts 258~258 const taskNumber
- projects.ts 259~285 const isCompleted
- projects.ts 286~286 function migrateAllProjectsToWBS - 모든 프로젝트를 WBS 시스템으로 일괄 마이그레이션 @param projects - 마이그레이션할 프로젝트 배열 @returns 마이그레이션된 프로젝트 배열
- projects.ts 287~288 let migrationCount
- projects.ts 289~289 const migratedProjects
- projects.ts 290~311 const needsMigration
- projects.ts 312~333 let migrationAttempted - ============================================================================ Storage API 마이그레이션 (Migration to Storage API) ============================================================================ Legacy localStorage 데이터를 Storage API로 자동 마이그레이션합니다.
- projects.ts 334~340 const existingProjects - 1. Storage API에 이미 데이터가 있는지 확인
- projects.ts 341~350 const legacyData - 2. Legacy localStorage 키 확인
- projects.ts 351~389 const migratedRows
- projects.ts 390~410 const projectEntity - ProjectTableRow → Project 변환
- projects.ts 411~411 const allProjects - 1. ID 또는 No로 프로젝트 찾기
- projects.ts 412~443 const project
- projects.ts 444~470 const updatedProject - 3. Storage API 업데이트 (실제 ID 사용)
- projects.ts 471~496 const success
- projects.ts 497~517 const allProjects
- projects.ts 518~538 const customProjects - Storage API에서 프로젝트 로드
- projects.ts 539~560 const project
- projects.ts 561~570 const projects
- projects.ts 571~571 const dueDate
- projects.ts 572~572 const parsedDate
- projects.ts 573~574 const isValidDate
- projects.ts 575~575 let daysRemaining
- projects.ts 576~578 let category
- projects.ts 579~582 const now
- projects.ts 583~603 const diffTime
- projects.ts 604~624 const displayDays
- projects.ts 625~635 const project
- projects.ts 636~636 const parsedDate
- projects.ts 637~641 const isValidDate
- projects.ts 642~645 const now
- projects.ts 646~646 const diffTime
- projects.ts 647~648 const daysRemaining
- projects.ts 649~649 const displayDays
- projects.ts 650~664 let category
- tasks.ts 044~101 export toTask - Convert DashboardTodoTask (Dashboard type) to Task (Storage API entity) @param todoTask - Dashboard type TodoTask @param userId - Current user ID (default: '1') @returns Task entity for Storage API
- tasks.ts 102~366 export toTodoTask - Convert Task (Storage API entity) to TodoTask (Dashboard type) @param task - Storage API Task entity @param children - Child DashboardTodoTasks (for recursive conversion) @returns Dashboard type TodoTask

## 중앙화·모듈화·캡슐화
- 목 데이터는 src/lib/mock에서 관리하여 중복 생성을 방지

## 작업 규칙
- 실제 데이터 스키마가 변경되면 목 데이터도 동일하게 업데이트
- 민감 정보가 포함되지 않도록 주의

## 관련 문서
- src/lib/claude.md
- src/app/projects/claude.md
- src/components/ui/claude.md
