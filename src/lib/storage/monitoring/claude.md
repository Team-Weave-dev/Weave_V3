# src/lib/storage/monitoring - 스토리지 모니터링

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~17: 핵심 책임
- 18~20: 구조 요약
- 21~32: 파일 라인 맵
- 33~35: 중앙화·모듈화·캡슐화
- 36~39: 작업 규칙
- 40~44: 관련 문서

## 디렉토리 목적
스토리지 성능과 상태를 추적하는 모니터링 유틸리티를 제공합니다.

## 핵심 책임
- 히트율·응답 시간·오류 카운터 등을 측정

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- performanceMetrics.ts 17~41 export PerformanceMetrics - Performance metrics snapshot
- performanceMetrics.ts 42~55 export AlertThresholds - Alert configuration
- performanceMetrics.ts 56~73 export Alert - Alert information
- performanceMetrics.ts 074~108 export WeeklyReport - Weekly report data
- performanceMetrics.ts 109~199 export PerformanceMetricsCollector - Performance metrics collector
- performanceMetrics.ts 200~327 export AlertSystem - Alert system
- performanceMetrics.ts 328~464 export WeeklyReportGenerator - Weekly report generator
- performanceMetrics.ts 465~465 export performanceMetricsCollector - Global instances
- performanceMetrics.ts 466~466 export alertSystem
- performanceMetrics.ts 467~467 export weeklyReportGenerator

## 중앙화·모듈화·캡슐화
- 메트릭 키와 로깅 전략은 monitoring 디렉터리에서 정의

## 작업 규칙
- 새 메트릭 추가 시 대시보드나 로깅 시스템과 연계를 검토
- 성능 개선 후 지표 변화를 문서화

## 관련 문서
- src/lib/storage/claude.md
- src/lib/storage/utils/claude.md
- src/components/dashboard/claude.md
