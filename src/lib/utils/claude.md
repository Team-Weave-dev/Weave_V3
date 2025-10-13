# src/lib/utils - 비즈니스 유틸리티

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~30: 파일 라인 맵
- 31~33: 중앙화·모듈화·캡슐화
- 34~37: 작업 규칙
- 38~42: 관련 문서

## 디렉토리 목적
비즈니스 계산과 공통 로직을 담당하는 유틸리티 함수를 제공합니다.

## 핵심 책임
- revenue-calculator 등 재무 지표 계산
- 공통 연산 로직 재사용

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- revenue-calculator.ts 11~25 export MonthlyRevenue
- revenue-calculator.ts 26~49 export RevenueCalculation
- revenue-calculator.ts 50~94 export calculateMonthlyRevenue - 프로젝트 목록에서 특정 월의 매출을 계산합니다. @param projects - 프로젝트 목록 @param yearMonth - 계산할 월 (YYYY-MM 형식) @returns 월별 매출 정보 @example ```typescript calculateMonthlyRevenue(projects, '2024-03') // { //   yearMonth: '2024-03', //   totalRevenue: 150000000, //   projectCount: 3, //   projects: [...] // } ```
- revenue-calculator.ts 095~115 export calculateYearlyRevenue - 1년(12개월) 매출 데이터를 생성합니다. @param projects - 프로젝트 목록 @param baseYear - 기준 연도 (기본값: 현재 연도) @returns 12개월 매출 데이터 배열
- revenue-calculator.ts 116~152 export getRevenueCalculationDetails - 매출 계산 상세 정보를 생성합니다 (툴팁 표시용). @param monthlyRevenue - 월별 매출 데이터 @returns 계산식과 설명
- revenue-calculator.ts 153~165 export getCurrentYearMonth - 현재 월을 YYYY-MM 형식으로 반환합니다. @returns 현재 월 (YYYY-MM)
- revenue-calculator.ts 166~180 export generateMonthOptions - 월 목록을 생성합니다 (드롭다운용). @param baseYear - 기준 연도 @returns 월 목록 배열

## 중앙화·모듈화·캡슐화
- 계산에 필요한 상수는 config에서 주입하여 하드코딩을 방지

## 작업 규칙
- 유틸 변경 시 사용하는 컴포넌트와 서비스를 업데이트
- 입력·출력 타입을 명확히 정의

## 관련 문서
- src/lib/claude.md
- src/components/dashboard/claude.md
- src/config/brand.ts
