# src/lib/storage/core - StorageManager 코어

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~24: 파일 라인 맵
- 25~27: 중앙화·모듈화·캡슐화
- 28~31: 작업 규칙
- 32~37: 관련 문서

## 디렉토리 목적
StorageManager, 이벤트 시스템, 캐시, 트랜잭션 등 핵심 로직을 제공합니다.

## 핵심 책임
- CRUD·구독·트랜잭션 처리
- 이벤트 브로드캐스트와 캐시·인덱싱 유지

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- StorageManager.ts 031~746 export StorageManager

## 중앙화·모듈화·캡슐화
- 스토리지 키·버전·이벤트 이름은 상수로 정의

## 작업 규칙
- API 시그니처 변경 시 서비스·어댑터·테스트를 업데이트
- 캐시·트랜잭션 수정 후 성능과 레이스 컨디션을 검토

## 관련 문서
- src/lib/storage/claude.md
- src/lib/storage/adapters/claude.md
- src/lib/storage/services/claude.md
- src/lib/storage/monitoring/claude.md
