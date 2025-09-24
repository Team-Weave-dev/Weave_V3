// 사진 촬영 계약서 템플릿 (법적 보완 버전)

import { QuoteTemplate } from './quote-templates';

export const PHOTOGRAPHY_CONTRACT_DETAILED: QuoteTemplate = {
  id: 'photography-contract-detailed',
  name: '사진 촬영 계약서 (상세)',
  documentType: 'contract',
  category: 'creative',
  description: '제품, 인물, 행사 사진 촬영 서비스를 위한 포괄적 계약서',
  variables: ['CLIENT_NAME', 'PHOTOGRAPHER_NAME', 'PROJECT_TITLE', 'SHOOTING_DATE', 'PHOTO_FEE'],
  template: `
# 사진 촬영 계약서

**계약번호**: {{CONTRACT_NUMBER}}
**계약일자**: {{CONTRACT_DATE}}

## 계약 당사자

### "갑" (의뢰인)
- **회사명/성명**: {{CLIENT_COMPANY}}
- **대표자**: {{CLIENT_NAME}}
- **사업자등록번호**: {{CLIENT_BUSINESS_NUMBER}}
- **주소**: {{CLIENT_ADDRESS}}
- **연락처**: {{CLIENT_PHONE}}
- **이메일**: {{CLIENT_EMAIL}}

### "을" (사진작가)
- **스튜디오명/성명**: {{PHOTOGRAPHER_NAME}}
- **사업자등록번호**: {{PHOTOGRAPHER_BUSINESS_NUMBER}}
- **주소**: {{PHOTOGRAPHER_ADDRESS}}
- **연락처**: {{PHOTOGRAPHER_PHONE}}
- **이메일**: {{PHOTOGRAPHER_EMAIL}}

## 제1조 (계약의 목적)
본 계약은 "을"이 "갑"의 의뢰에 따라 사진 촬영 및 관련 서비스를 제공하는 것에 관한 제반 사항을 규정함을 목적으로 한다.

## 제2조 (촬영 내용)
① **프로젝트명**: {{PROJECT_TITLE}}
② **촬영 유형**: {{PHOTO_TYPE}}
③ **촬영 일시**: {{SHOOTING_DATE}} {{SHOOTING_TIME}}
④ **촬영 장소**: {{SHOOTING_LOCATION}}
⑤ **촬영 내용**:
   - 제품 촬영: {{PRODUCT_SHOTS}}컷
   - 인물 촬영: {{PORTRAIT_SHOTS}}컷
   - 공간 촬영: {{SPACE_SHOTS}}컷
   - 기타: {{OTHER_SHOTS}}
⑥ **최종 납품 수량**: {{FINAL_PHOTO_COUNT}}장
⑦ **용도**: {{PHOTO_USAGE}}

## 제3조 (촬영 프로세스)
① **사전 준비**:
   1. 촬영 컨셉 협의
   2. 무드보드/레퍼런스 준비
   3. 장소 답사 (필요시)
   4. 모델/소품 준비
② **촬영 당일**:
   1. 세팅 및 테스트 촬영
   2. 본 촬영 진행
   3. 현장 프리뷰 및 확인
③ **후반 작업**:
   1. 사진 선별 (1차 셀렉)
   2. 기본 보정 (색감, 밝기, 대비)
   3. 리터칭 (필요시)
   4. 최종 파일 제작

## 제4조 (촬영 비용)
① **총 촬영 비용**: ₩{{PHOTO_FEE}} (부가세 포함)
② **비용 구성**:
   - 촬영료: ₩{{SHOOTING_FEE}}
   - 보정/편집료: ₩{{EDITING_FEE}}
   - 장비 사용료: ₩{{EQUIPMENT_FEE}}
   - 출장비: ₩{{TRAVEL_FEE}}
③ **지급 방법**:
   - 계약금: 30% - 계약 체결 시
   - 잔금: 70% - 최종 납품 시
④ **추가 비용**:
   - 추가 촬영: 시간당 ₩{{HOURLY_RATE}}
   - 추가 보정: 장당 ₩{{RETOUCH_RATE}}
   - 긴급 작업: 50% 할증

## 제5조 (납품)
① **납품 일정**: 촬영 후 {{DELIVERY_DAYS}}일 이내
② **납품 형식**:
   - 파일 포맷: {{FILE_FORMAT}}
   - 해상도: {{RESOLUTION}}
   - 색상 모드: {{COLOR_MODE}}
③ **납품 방법**: {{DELIVERY_METHOD}}
④ **원본 파일**: {{RAW_FILES_PROVIDED}}

## 제6조 (저작권 및 사용권)
① **저작권**: 
   - 저작권은 "을"에게 귀속
   - "갑"은 약정된 사용권 취득
② **사용 범위**:
   - 사용 용도: {{USAGE_PURPOSE}}
   - 사용 기간: {{USAGE_PERIOD}}
   - 사용 지역: {{USAGE_TERRITORY}}
③ **추가 사용**: 별도 협의 및 추가 비용
④ **크레딧 표기**: {{CREDIT_REQUIREMENT}}

## 제7조 (모델 및 초상권)
① 모델 초상권 사용 동의서는 "갑"이 확보
② 초상권 관련 분쟁 시 확보 당사자가 책임
③ 모델료는 {{MODEL_FEE_RESPONSIBILITY}} 부담

## 제8조 (취소 및 연기)
① **촬영 취소**:
   - 7일 전: 계약금 환불
   - 3-6일 전: 계약금의 50% 환불
   - 2일 이내: 환불 불가
② **촬영 연기**: 1회에 한해 무료 연기
③ **기상 악화**: 실외 촬영 시 협의 후 연기

## 제9조 (비밀유지)
① 촬영 내용 및 미공개 정보 비밀 유지
② SNS 등 무단 공개 금지
③ 포트폴리오 사용은 "갑"의 동의 필요

## 제10조 (손해배상)
① 계약 위반 시 손해 배상
② 장비 파손: 파손 당사자 부담
③ 배상 한도: 총 촬영 비용의 200%

## 제11조 (특약사항)
{{SPECIAL_TERMS}}

---

**계약체결일**: {{CONTRACT_DATE}}

**"갑"** {{CLIENT_COMPANY}}
{{CLIENT_NAME}} (인)

**"을"** {{PHOTOGRAPHER_NAME}} (인)

### 첨부 서류
1. 촬영 기획서
2. 무드보드/레퍼런스
3. 견적서
`
};