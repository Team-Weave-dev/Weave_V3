# src/app/settings - 사용자 설정

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~19: 핵심 책임
- 20~22: 구조 요약
- 23~25: 파일 라인 맵
- 26~28: 중앙화·모듈화·캡슐화
- 29~32: 작업 규칙
- 33~38: 관련 문서

## 디렉토리 목적
사용자 환경설정, 알림, 계정 정보를 관리하는 페이지입니다.

## 핵심 책임
- 설정 섹션별 UI 구성
- 중앙화 설정과 스토리지 연동
- 향후 Supabase 프로필 동기화 기반 마련

## 구조 요약
- components/: 설정 섹션 컴포넌트 (→ src/app/settings/components/claude.md)

## 파일 라인 맵
- page.tsx 20~93 export SettingsPage - 설정 페이지 프로필, 결제, 사용량, 요금제 관리

## 중앙화·모듈화·캡슐화
- 설정 키와 기본값은 config 상수를 사용

## 작업 규칙
- 새 설정 추가 시 컴포넌트·서비스·문서를 동기화
- 데이터 저장 방식 변경 시 storage·supabase 문서를 검토

## 관련 문서
- src/app/claude.md
- src/app/settings/components/claude.md
- src/lib/storage/services/claude.md
- src/lib/supabase/claude.md
