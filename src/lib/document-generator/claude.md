# src/lib/document-generator - 문서 생성기

## 라인 가이드
- 12~14: 디렉토리 목적
- 15~18: 핵심 책임
- 19~21: 구조 요약
- 22~32: 파일 라인 맵
- 33~35: 중앙화·모듈화·캡슐화
- 36~39: 작업 규칙
- 40~44: 관련 문서

## 디렉토리 목적
프로젝트 문서(계약, 견적, 청구 등)를 생성하는 헬퍼를 제공합니다.

## 핵심 책임
- 템플릿 카테고리 매핑과 데이터 주입
- 생성 결과를 UI와 서비스에서 재사용 가능하게 반환

## 구조 요약
- 하위 디렉토리가 없습니다.

## 파일 라인 맵
- templates.ts 03~48 export ProjectDocumentCategory
- templates.ts 49~57 export GeneratedDocument
- templates.ts 58~65 export GeneratedDocumentPayload
- templates.ts 66~72 export DocumentTemplate
- templates.ts 73~82 export ProjectDocumentTemplate
- templates.ts 083~553 export TemplateBuildContext
- templates.ts 554~561 export getTemplatesForCategory
- templates.ts 562~569 export ProjectCreateFormData - 프로젝트 생성 모달의 폼 데이터를 임시 ProjectTableRow로 변환 문서 생성기가 ProjectTableRow를 요구하므로 필요한 헬퍼 함수
- templates.ts 570~613 export createTemporaryProject

## 중앙화·모듈화·캡슐화
- 템플릿 메타데이터는 문서 생성기에서 정의하고 문자열은 brand 설정과 동기화

## 작업 규칙
- 템플릿 추가 시 카테고리 매핑과 브랜드 텍스트를 업데이트
- 생성 결과 구조가 변경되면 UI와 서비스 문서를 수정

## 관련 문서
- src/lib/claude.md
- src/app/projects/claude.md
- src/components/projects/ProjectDetail/claude.md
