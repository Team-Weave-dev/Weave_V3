# src/lib/wbs - 미니 WBS 템플릿

## 라인 가이드
- 12~15: 디렉토리 목적
- 16~18: 핵심 책임
- 19~21: 구조 요약
- 22~25: 파일 라인 맵
- 26~28: 중앙화·모듈화·캡슐화
- 29~32: 작업 규칙
- 33~37: 관련 문서

## 디렉토리 목적
프로젝트 미니 WBS 템플릿을 제공합니다.
문서 생성과 프로젝트 계획 기능에서 재사용할 구조를 정의합니다.

## 핵심 책임
- 섹션·태스크·마일스톤 기본 구조 제공

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- templates.ts 016~169 export getWBSTemplateByType - WBS 템플릿 타입에 따라 기본 작업 목록을 생성합니다. @param type - 템플릿 타입 ('standard' | 'consulting' | 'education' | 'custom') @returns WBSTask 배열 @example ```typescript const tasks = getWBSTemplateByType('standard'); // [{ id: 'task-1', name: '기획', status: 'pending', ... }, ...] ```
- templates.ts 170~198 export getWBSTemplateMetadata - 템플릿 타입에 대한 메타데이터를 반환합니다. @param type - 템플릿 타입 @returns 템플릿 이름과 설명

## 중앙화·모듈화·캡슐화
- WBS 텍스트와 구조는 wbs 디렉터리에서 정의하고 brand 텍스트와 동기화

## 작업 규칙
- 템플릿 변경 시 문서 생성기와 프로젝트 페이지 문서를 업데이트
- 새 템플릿 추가 시 상위 문서를 갱신

## 관련 문서
- src/lib/claude.md
- src/lib/document-generator/claude.md
- src/app/projects/claude.md
