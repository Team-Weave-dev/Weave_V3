# scripts - 유지보수 스크립트 허브

## 라인 가이드
- 012~015: 디렉토리 목적
- 016~020: 핵심 책임
- 021~023: 구조 요약
- 024~168: 파일 라인 맵
- 169~171: 중앙화·모듈화·캡슐화
- 172~175: 작업 규칙
- 176~180: 관련 문서

## 디렉토리 목적
반복 작업과 점검을 자동화하는 스크립트를 모읍니다.
스토리지 검증, 테스트, 문서 싱크를 지원합니다.

## 핵심 책임
- claude.md 자동 갱신과 감시 스크립트를 유지
- 로컬 스토리지 데이터 검증과 통계 수집
- 경량 통합 테스트와 시뮬레이션 지원

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- check-localstorage-data.mjs 17~22 const key
- check-localstorage-data.mjs 23~23 const tasksKey
- check-localstorage-data.mjs 24~25 const tasksData
- check-localstorage-data.mjs 26~37 const tasks
- check-localstorage-data.mjs 38~38 const sectionsKey
- check-localstorage-data.mjs 39~40 const sectionsData
- check-localstorage-data.mjs 41~53 const sections
- check-todo-data.mjs 11~11 const __filename - __dirname 설정 (ES modules)
- check-todo-data.mjs 12~14 const __dirname
- check-todo-data.mjs 15~16 function loadEnv - .env.local 파일 직접 읽기
- check-todo-data.mjs 17~17 const envPath
- check-todo-data.mjs 18~20 const envContent
- check-todo-data.mjs 21~24 const trimmed
- check-todo-data.mjs 25~36 const value
- check-todo-data.mjs 37~37 const supabaseUrl
- check-todo-data.mjs 38~44 const supabaseKey
- check-todo-data.mjs 45~47 const supabase
- check-todo-data.mjs 48~71 const userId - 사용자 ID (콘솔 로그에서 확인한 값)
- check-todo-data.mjs 72~73 const sectionTag - tags에서 sectionId 추출
- check-todo-data.mjs 074~104 const sectionId
- check-todo-data.mjs 105~107 const sectionIds
- check-todo-data.mjs 108~109 const sectionTag
- check-todo-data.mjs 110~110 const taskSectionId
- check-todo-data.mjs 111~128 const isMatched
- fix-todo-sectionid.js 10~24 const currentTasks
- fix-todo-sectionid.js 25~26 const fixedTasks - 모든 tasks에 sectionId 필드 추가
- fix-todo-sectionid.js 27~62 let sectionId - tags에서 sectionId 추출
- fix-todo-sectionid.js 63~64 const syncQueue - DualWrite 동기화 큐도 확인
- fix-todo-sectionid.js 65~67 const queue
- generate_claude_docs.py 10~70 Data Model - claude 문서 항목 구조
- generate_claude_docs.py 071~301 Section Extraction Utilities - 파일 섹션 파싱 로직
- generate_claude_docs.py 302~335 File Map Builder - 각 파일별 라인 범위 요약
- generate_claude_docs.py 0336~1987 Root Document Helpers - 루트 claude.md 전용 유틸
- generate_claude_docs.py 1988~2041 Document Builder - claude.md 템플릿 생성
- generate_claude_docs.py 2042~2049 File Writer - claude.md 파일 저장
- generate_claude_docs.py 2050~2060 CLI Entry Point - 스크립트 실행 지점
- integration-test.js 08~09 const puppeteer - 통합 테스트 스크립트 테스트 계정으로 로그인하고 모든 페이지를 방문하여 기본적인 작동을 확인합니다.
- integration-test.js 10~10 const BASE_URL
- integration-test.js 11~11 const TEST_EMAIL
- integration-test.js 12~14 const TEST_PASSWORD
- integration-test.js 15~27 const PAGES_TO_TEST - 테스트할 페이지 목록
- integration-test.js 28~33 const browser
- integration-test.js 34~52 const page
- integration-test.js 53~75 const currentUrl
- integration-test.js 76~78 const title - 페이지 제목 확인
- integration-test.js 079~100 const hasError - 에러 체크
- integration-test.js 101~122 const viewports
- integration-test.js 123~144 const navLinks - 사이드바 링크 확인
- integration-test.js 145~145 const fs - 스크린샷 디렉토리 생성
- integration-test.js 146~147 const path
- integration-test.js 148~154 const screenshotDir
- simple-test.js 08~10 const BASE_URL - 간단한 통합 테스트 스크립트 fetch API를 사용하여 기본적인 작동을 확인합니다.
- simple-test.js 11~19 const colors - 색상 코드
- simple-test.js 20~31 const PAGES_TO_TEST - 테스트할 페이지 목록
- simple-test.js 32~36 const response
- simple-test.js 37~56 const expectedStatuses
- simple-test.js 57~57 let successCount
- simple-test.js 58~63 let totalCount
- simple-test.js 64~74 const success
- simple-test.js 75~96 const loginResponse
- simple-test.js 097~102 const staticResources
- simple-test.js 103~137 const response
- test-date-update.mjs 12~17 const browserScript - 브라우저 콘솔에서 실행할 테스트 코드
- test-date-update.mjs 18~23 const tasks
- test-date-update.mjs 24~44 const testTask
- test-date-update.mjs 45~49 const taskToUpdate - 2. 첫 번째 task의 날짜 수정 시도
- test-date-update.mjs 50~79 const newDueDate
- test-date-update.mjs 80~85 const events
- test-date-update.mjs 086~103 const testEvent
- test-date-update.mjs 104~109 const eventToUpdate - Event 날짜 수정
- test-date-update.mjs 110~110 const newStartDate
- test-date-update.mjs 111~152 const newEndDate
- test-task-update.mjs 11~35 const dom - Set up a mock DOM environment
- test-task-update.mjs 36~36 const taskModule - Import the necessary modules
- test-task-update.mjs 37~45 const storageModule
- test-task-update.mjs 46~63 const testTask - Create a test task
- test-task-update.mjs 64~66 const newDate - Update the task date (like CalendarWidget does)
- test-task-update.mjs 67~83 const updatedTask
- test-task-update.mjs 084~108 const verifiedTask - Verify the update by fetching the task again
- update-claude-docs.js 15~15 const fs - Claude Documentation Auto-Update System 디렉토리 변경사항을 감지하여 claude.md 파일들을 자동 업데이트하는 스크립트 기능: - 파일/디렉토리 변경 감지 - 해당 claude.md 파일 자동 업데이트 - 메인 claude.md와 하위 claude.md 동기화 - 컴포넌트/훅/유틸리티 개수 자동 카운팅
- update-claude-docs.js 16~17 const path
- update-claude-docs.js 18~31 class ClaudeDocUpdater
- update-claude-docs.js 32~41 const files
- update-claude-docs.js 42~54 const ext
- update-claude-docs.js 55~62 const uiPath
- update-claude-docs.js 63~70 const hooksPath
- update-claude-docs.js 71~78 const libPath
- update-claude-docs.js 79~79 const appPath
- update-claude-docs.js 80~88 let pageCount
- update-claude-docs.js 089~107 const dirs
- update-claude-docs.js 108~121 const configPath
- update-claude-docs.js 122~124 let content
- update-claude-docs.js 125~133 const stats - 현재 개수들 계산
- update-claude-docs.js 134~166 const updatedStructure - 디렉토리 구조 업데이트
- update-claude-docs.js 167~211 const statsSection - 시스템 현황 업데이트
- update-claude-docs.js 212~219 const claudePath
- update-claude-docs.js 220~220 let content
- update-claude-docs.js 221~255 const relativePath
- update-claude-docs.js 256~259 const componentFiles
- update-claude-docs.js 260~260 const componentList
- update-claude-docs.js 261~261 const name
- update-claude-docs.js 262~266 const capitalizedName
- update-claude-docs.js 267~267 const listPattern - 컴포넌트 목록 업데이트
- update-claude-docs.js 268~286 const newSection
- update-claude-docs.js 287~290 const hookFiles
- update-claude-docs.js 291~291 const hookList
- update-claude-docs.js 292~295 const name
- update-claude-docs.js 296~296 const listPattern
- update-claude-docs.js 297~321 const newSection
- update-claude-docs.js 322~325 const utilFiles
- update-claude-docs.js 326~326 const utilList
- update-claude-docs.js 327~330 const name
- update-claude-docs.js 331~331 const listPattern
- update-claude-docs.js 332~372 const newSection
- update-claude-docs.js 373~421 const descriptions
- update-claude-docs.js 422~436 const descriptions
- update-claude-docs.js 437~457 const descriptions
- update-claude-docs.js 458~480 const directories - 각 하위 디렉토리의 claude.md 업데이트
- update-claude-docs.js 481~495 const dirPath
- update-claude-docs.js 496~497 const updater
- update-claude-docs.js 498~513 const args
- watch-and-update.js 15~15 const fs - Claude Documentation Real-time Watcher 파일 시스템 변경을 실시간으로 감지하여 claude.md 파일들을 자동 업데이트하는 스크립트 기능: - 실시간 파일 변경 감지 (chokidar 없이 순수 Node.js) - 디렉토리별 변경사항 추적 - 스마트 업데이트 (중복 업데이트 방지) - 성능 최적화 (디바운싱)
- watch-and-update.js 16~16 const path
- watch-and-update.js 17~18 const ClaudeDocUpdater
- watch-and-update.js 19~48 class ClaudeDocWatcher
- watch-and-update.js 49~49 const ext
- watch-and-update.js 50~74 const fileName
- watch-and-update.js 75~75 const affected
- watch-and-update.js 076~114 const relativePath
- watch-and-update.js 115~118 const relativePath
- watch-and-update.js 119~151 const affectedDirs - 영향받는 디렉토리들을 큐에 추가
- watch-and-update.js 152~160 const updates
- watch-and-update.js 161~162 const directories - 각 디렉토리별 업데이트
- watch-and-update.js 163~186 const dirPath
- watch-and-update.js 187~188 const watcher
- watch-and-update.js 189~194 const fullPath
- watch-and-update.js 195~209 const relativePath
- watch-and-update.js 210~233 const fullPath
- watch-and-update.js 234~259 const relativePath
- watch-and-update.js 260~260 function setupGracefulShutdown - 우아한 종료 처리
- watch-and-update.js 261~275 const cleanup
- watch-and-update.js 276~277 const watcher
- watch-and-update.js 278~308 const args

## 중앙화·모듈화·캡슐화
- 스크립트에서 사용하는 상수는 config 또는 환경 변수에서 주입하여 하드코딩을 방지

## 작업 규칙
- 새 스크립트 추가 시 목적, 실행 방법, 의존성을 파일 상단에 기록
- 파괴적 작업에는 확인 절차와 백업 전략을 포함

## 관련 문서
- claude.md
- docs/Claude-Workflow-Checklists.md
- src/lib/storage/claude.md
