# src/lib - 서비스·유틸리티 계층

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~20: 핵심 책임
- 21~35: 구조 요약
- 36~45: 파일 라인 맵
- 46~49: 중앙화·모듈화·캡슐화
- 50~53: 작업 규칙
- 54~58: 관련 문서

## 디렉토리 목적
애플리케이션 전반에서 사용하는 서비스, 스토리지, 유틸리티 로직을 관리합니다.
데이터 소스 추상화와 비즈니스 규칙을 모듈화하여 UI 계층에 제공합니다.

## 핵심 책임
- StorageManager와 Supabase 클라이언트 유지
- 통합 캘린더, 문서 생성, 대시보드 유틸리티 제공
- Mock 데이터와 전역 상태 스토어 관리

## 구조 요약
- auth/: 인증 유틸리티 (→ src/lib/auth/claude.md)
- calendar-integration/: 통합 캘린더 매니저 (→ src/lib/calendar-integration/claude.md)
- config/: 서비스 전용 설정 (→ src/lib/config/claude.md)
- dashboard/: 대시보드 유틸과 애니메이션 (→ src/lib/dashboard/claude.md)
- document-generator/: 문서 템플릿 생성 (→ src/lib/document-generator/claude.md)
- hooks/: 서비스 레벨 훅 (→ src/lib/hooks/claude.md)
- mock/: 목 데이터 (→ src/lib/mock/claude.md)
- storage/: 통합 스토리지 시스템 (→ src/lib/storage/claude.md)
- stores/: 전역 상태 스토어 (→ src/lib/stores/claude.md)
- supabase/: Supabase 클라이언트 (→ src/lib/supabase/claude.md)
- types/: 라이브러리 전용 타입 (→ src/lib/types/claude.md)
- utils/: 비즈니스 유틸리티 (→ src/lib/utils/claude.md)
- wbs/: 미니 WBS 템플릿 (→ src/lib/wbs/claude.md)

## 파일 라인 맵
- utils.ts 05~11 export cn
- utils.ts 012~117 export validators - 입력 검증 유틸리티 함수들
- utils.ts 118~148 export formatCurrency - 통화 단위에 따라 금액을 포맷팅합니다. @param amount - 포맷팅할 금액 @param currency - 통화 단위 ('KRW' 또는 'USD') @returns 통화 기호와 함께 포맷팅된 금액 문자열 @example ```typescript formatCurrency(50000000, 'KRW')  // "₩50,000,000" formatCurrency(50000.5, 'USD')   // "$50,000.50" ```
- utils.ts 149~201 export hasContractDocument - 프로젝트에 계약서가 있는지 확인합니다. 확인 순서: 1. documentStatus.contract.exists (Mock 프로젝트) 2. documents 배열에서 type === 'contract' 찾기 (Mock 프로젝트) 3. localStorage에서 계약서 문서 찾기 (사용자 생성 프로젝트) @param project - 확인할 프로젝트 데이터 @returns 계약서가 존재하면 true, 없으면 false @example ```typescript if (!hasContractDocument(project)) { // 계약서가 누락된 프로젝트 → 검토 상태로 표시 } ```
- utils.ts 202~243 export isContractComplete - 프로젝트의 계약서가 완료 상태인지 확인합니다. 계약서 필수 항목이 모두 입력되어 'completed' 상태인 경우에만 true를 반환합니다. @param project - 확인할 프로젝트 데이터 @returns 계약서가 완료 상태이면 true, 아니면 false @example ```typescript if (isContractComplete(project)) { // 계약서 완료 → 진행중 상태로 표시 } else { // 계약서 미완료 → 검토 상태 유지 } ```
- utils.ts 244~298 export getActualProjectStatus - 프로젝트의 실제 표시 상태를 자동 결정 로직에 따라 반환합니다. 자동 결정 규칙: 1. 수동 선택 상태 (보류/취소/완료)는 항상 유지됨 2. 계약서가 없을 때: - 총 금액 있음 → 검토 (review) - 총 금액 없음 → 기획 (planning) 3. 계약서가 있을 때: - 총 금액 있음 → 진행중 (in_progress) - 총 금액 없음 → 기획 (planning) @param project - 확인할 프로젝트 데이터 @param ignoreManualStatus - true일 경우 수동 상태도 자동 결정 (기본값: false) @returns 실제 표시될 프로젝트 상태 @example ```typescript // UI 표시용 - 수동 상태 유지 const displayStatus = getActualProjectStatus(project); // 통계 계산용 - 모든 상태를 자동 결정 const statsStatus = getActualProjectStatus(project, true); ```
- utils.ts 299~348 export formatKSTDate - UTC ISO 문자열을 KST(한국 표준시, UTC+09:00)로 변환하여 포맷팅합니다. @param dateString - UTC ISO 날짜 문자열 (예: "2025-10-13T08:10:58.86+00:00") @param format - 출력 형식 ('date' | 'datetime' | 'time') @returns KST로 변환된 날짜 문자열 (예: "2025. 10. 13.", "2025. 10. 13. 오후 5:10") @example ```typescript formatKSTDate("2025-10-13T08:10:58.86+00:00", "date") // "2025. 10. 13." formatKSTDate("2025-10-13T08:10:58.86+00:00", "datetime") // "2025. 10. 13. 오후 5:10" formatKSTDate("2025-10-13T08:10:58.86+00:00", "time") // "오후 5:10" ```
- utils.ts 349~352 export getCurrentKSTDate - 현재 KST(한국 표준시) 날짜를 ISO 8601 형식으로 반환합니다. UI 표시용이 아닌 데이터 저장용으로 사용 시 주의하세요. (Best Practice: 데이터베이스에는 UTC로 저장하고 UI에서만 KST로 표시) @returns 현재 KST 날짜의 ISO 문자열 @example ```typescript const now = getCurrentKSTDate() // "2025-10-13T17:10:58.860+09:00" ```

## 중앙화·모듈화·캡슐화
- 외부 서비스 설정은 `.env`와 config에서 주입하고 lib 계층 내부에서 하드코딩하지 않음
- 모듈 간 의존성은 배럴 파일 또는 명시적 export로 제한

## 작업 규칙
- 공통 로직을 추가할 때 기존 모듈과 책임이 중복되지 않는지 확인
- 서비스 시그니처 변경 시 사용하는 페이지·컴포넌트와 문서를 동시에 업데이트

## 관련 문서
- src/claude.md
- src/components/claude.md
- supabase/claude.md
