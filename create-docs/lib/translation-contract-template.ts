// 번역 계약서 템플릿 (법적 보완 버전)

import { QuoteTemplate } from './quote-templates';

export const TRANSLATION_CONTRACT_DETAILED: QuoteTemplate = {
  id: 'translation-contract-detailed',
  name: '번역 서비스 계약서 (상세)',
  documentType: 'contract',
  category: 'service',
  description: '문서, 콘텐츠, 통역 서비스를 위한 포괄적 계약서',
  variables: ['CLIENT_NAME', 'TRANSLATOR_NAME', 'PROJECT_TITLE', 'SOURCE_LANGUAGE', 'TARGET_LANGUAGE', 'TRANSLATION_FEE'],
  template: `
# 번역 서비스 계약서

**계약번호**: {{CONTRACT_NUMBER}}
**계약일자**: {{CONTRACT_DATE}}

## 계약 당사자

### "갑" (의뢰인)
- **회사명/성명**: {{CLIENT_COMPANY}}
- **대표자**: {{CLIENT_NAME}}
- **사업자등록번호**: {{CLIENT_BUSINESS_NUMBER}}
- **주소**: {{CLIENT_ADDRESS}}
- **담당자**: {{CLIENT_MANAGER}}
- **연락처**: {{CLIENT_PHONE}}
- **이메일**: {{CLIENT_EMAIL}}

### "을" (번역자/번역회사)
- **회사명/성명**: {{TRANSLATOR_COMPANY}}
- **대표자**: {{TRANSLATOR_NAME}}
- **사업자등록번호**: {{TRANSLATOR_BUSINESS_NUMBER}}
- **주소**: {{TRANSLATOR_ADDRESS}}
- **연락처**: {{TRANSLATOR_PHONE}}
- **이메일**: {{TRANSLATOR_EMAIL}}

## 제1조 (계약의 목적)
본 계약은 "을"이 "갑"의 의뢰에 따라 번역 서비스를 제공하는 것에 관한 제반 사항을 규정함을 목적으로 한다.

## 제2조 (번역 업무 내용)
① **프로젝트명**: {{PROJECT_TITLE}}
② **번역 유형**: {{TRANSLATION_TYPE}}
③ **원문 언어**: {{SOURCE_LANGUAGE}}
④ **번역 언어**: {{TARGET_LANGUAGE}}
⑤ **분량**:
   - 문서: {{DOCUMENT_PAGES}}페이지 / {{WORD_COUNT}}단어
   - 영상: {{VIDEO_DURATION}}분
   - 통역: {{INTERPRETATION_HOURS}}시간
⑥ **전문 분야**: {{SPECIALIZATION}}
⑦ **용도**: {{TRANSLATION_PURPOSE}}

## 제3조 (번역 프로세스)
① **번역 단계**:
   1. 1차 번역
   2. 네이티브 검수
   3. 전문 용어 감수
   4. 최종 교정
② **품질 보증**:
   - TEP(번역-편집-교정) 프로세스
   - 네이티브 스피커 검수
   - 전문 분야 감수자 검토
③ **CAT 툴 사용**: {{CAT_TOOLS}}
④ **용어집 관리**: {{GLOSSARY_PROVIDED}}

## 제4조 (납품 일정)
① **전체 기간**: {{START_DATE}} ~ {{END_DATE}}
② **단계별 일정**:
   - 1차 초안: {{FIRST_DRAFT_DATE}}
   - 검수 완료: {{REVIEW_DATE}}
   - 최종 납품: {{FINAL_DELIVERY_DATE}}
③ **긴급 작업**: 50% 할증 적용

## 제5조 (번역 비용)
① **총 번역 비용**: ₩{{TRANSLATION_FEE}} (부가세 포함)
② **단가 기준**:
   - 일반 문서: 원문 1단어당 ₩{{RATE_PER_WORD}}
   - 전문 문서: 원문 1단어당 ₩{{TECHNICAL_RATE}}
   - 통역: 시간당 ₩{{INTERPRETATION_RATE}}
③ **지급 방법**:
   - 계약금: 30% - 계약 체결 시
   - 잔금: 70% - 납품 완료 시
④ **추가 비용**:
   - 추가 수정: {{REVISION_FEE}}
   - DTP 작업: {{DTP_FEE}}
   - 공증/인증: 실비

## 제6조 (갑의 의무)
① 번역 원문 및 참고 자료 제공
② 전문 용어집/스타일 가이드 제공
③ 질의사항에 대한 신속한 답변
④ 검수 의견 제시 (납품 후 5일 이내)
⑤ 약정된 대금 지급

## 제7조 (을의 의무)
① 전문적이고 정확한 번역
② 원문의 의미와 맥락 보존
③ 일관된 용어 및 문체 유지
④ 납기 준수
⑤ 비밀 유지

## 제8조 (품질 보증)
① **정확성**: 원문 의미의 정확한 전달
② **가독성**: 자연스러운 번역 언어 표현
③ **일관성**: 용어 및 문체 통일
④ **무상 수정**: 오역/오탈자 무상 수정
⑤ **수정 기한**: 납품 후 {{WARRANTY_PERIOD}}일

## 제9조 (저작권)
① 원문 저작권은 "갑" 소유
② 번역물 저작권:
   - 2차 저작물로서 "갑" 소유
   - "을"은 번역 저작인격권 보유
③ 포트폴리오 사용: "갑" 동의 필요
④ 출판/공표 시 번역자 표기: {{CREDIT_REQUIREMENT}}

## 제10조 (비밀유지)
① 번역 내용 및 관련 정보 비밀 유지
② 제3자 제공 금지
③ 작업 완료 후 원문/번역물 폐기
④ 비밀유지 기간: 영구

## 제11조 (통역 서비스) (해당시)
① **통역 방식**: {{INTERPRETATION_TYPE}}
② **통역 일시**: {{INTERPRETATION_DATE}}
③ **통역 장소**: {{INTERPRETATION_VENUE}}
④ **준비 사항**:
   - 발표 자료 사전 제공
   - 전문 용어 리스트
   - 리허설 기회
⑤ **추가 시간**: 시간당 {{OVERTIME_RATE}}

## 제12조 (면책 조항)
① 원문 오류로 인한 번역 오류
② "갑"의 수정 요청으로 인한 오류
③ 문화적 차이로 인한 표현 한계
④ 전문 분야 검증은 "갑" 책임

## 제13조 (계약 해지)
① **해지 사유**:
   - 납기 지연 (7일 이상)
   - 품질 기준 미달
   - 비밀 유지 위반
② **해지 시 정산**: 완료 부분 비례 정산

## 제14조 (손해배상)
① 번역 오류로 인한 직접 손해 배상
② 배상 한도: 번역 비용의 100%
③ 간접/결과적 손해 제외

## 제15조 (분쟁 해결)
① 한국번역가협회 중재 우선
② 관할법원: {{JURISDICTION}}지방법원

## 제16조 (특약사항)
{{SPECIAL_TERMS}}

---

**계약체결일**: {{CONTRACT_DATE}}

**"갑" (의뢰인)**
{{CLIENT_COMPANY}}
대표 {{CLIENT_NAME}} (인)

**"을" (번역자)**
{{TRANSLATOR_COMPANY}}
{{TRANSLATOR_NAME}} (인)

### 첨부 서류
1. 번역 대상 문서 샘플
2. 용어집/스타일 가이드
3. 견적서
4. 번역자 이력서
`
};