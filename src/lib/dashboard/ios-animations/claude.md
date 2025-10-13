# src/lib/dashboard/ios-animations - 대시보드 애니메이션

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~28: 파일 라인 맵
- 29~31: 중앙화·모듈화·캡슐화
- 32~35: 작업 규칙
- 36~40: 관련 문서

## 디렉토리 목적
대시보드에서 사용하는 iOS 스타일 애니메이션 설정과 시퀀스를 관리합니다.

## 핵심 책임
- 타이밍, easing, keyframe 설정 제공
- 위젯 전환·등장 애니메이션 정의

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- performance-optimizer.ts 020~313 export AnimationPerformanceOptimizer
- performance-optimizer.ts 314~316 export animationOptimizer - 싱글톤 인스턴스
- performance-optimizer.ts 317~345 export AnimationPresets - 애니메이션 프리셋
- performance-optimizer.ts 346~402 export PerformanceProfiler - 성능 프로파일링 유틸리티
- performance-optimizer.ts 403~403 export performanceProfiler

## 중앙화·모듈화·캡슐화
- 애니메이션 상수는 ios-animations 디렉터리에 집중

## 작업 규칙
- 애니메이션 변경 후 UI 회귀 테스트를 수행
- 성능 영향을 모니터링하고 필요 시 경량 옵션을 제공

## 관련 문서
- src/lib/dashboard/claude.md
- src/components/dashboard/claude.md
- src/config/brand.ts
