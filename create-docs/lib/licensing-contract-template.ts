// 라이선스 계약서 템플릿 (법적 보완 버전)

import { QuoteTemplate } from './quote-templates';

export const LICENSING_CONTRACT_DETAILED: QuoteTemplate = {
  id: 'licensing-contract-detailed',
  name: '소프트웨어 라이선스 계약서 (상세)',
  documentType: 'contract',
  category: 'software',
  description: '소프트웨어, 콘텐츠, 지적재산권 라이선스 계약서',
  variables: ['LICENSOR_NAME', 'LICENSEE_NAME', 'SOFTWARE_NAME', 'LICENSE_FEE', 'LICENSE_PERIOD'],
  template: `
# 소프트웨어 라이선스 계약서

**계약번호**: {{CONTRACT_NUMBER}}
**계약일자**: {{CONTRACT_DATE}}

## 계약 당사자

### "갑" (라이선서/권리자)
- **회사명**: {{LICENSOR_COMPANY}}
- **대표자**: {{LICENSOR_NAME}}
- **사업자등록번호**: {{LICENSOR_BUSINESS_NUMBER}}
- **주소**: {{LICENSOR_ADDRESS}}
- **연락처**: {{LICENSOR_PHONE}}
- **이메일**: {{LICENSOR_EMAIL}}

### "을" (라이선시/사용자)
- **회사명**: {{LICENSEE_COMPANY}}
- **대표자**: {{LICENSEE_NAME}}
- **사업자등록번호**: {{LICENSEE_BUSINESS_NUMBER}}
- **주소**: {{LICENSEE_ADDRESS}}
- **연락처**: {{LICENSEE_PHONE}}
- **이메일**: {{LICENSEE_EMAIL}}

## 제1조 (목적)
본 계약은 "갑"이 개발·보유한 소프트웨어에 대한 사용권을 "을"에게 허여하는 조건과 범위를 규정함을 목적으로 한다.

## 제2조 (라이선스 대상)
① **소프트웨어명**: {{SOFTWARE_NAME}}
② **버전**: {{SOFTWARE_VERSION}}
③ **제품 구성**:
   - 실행 파일: {{EXECUTABLE_FILES}}
   - 라이브러리: {{LIBRARIES}}
   - 문서: {{DOCUMENTATION}}
   - 소스코드: {{SOURCE_CODE_INCLUDED}}
④ **시스템 요구사항**: {{SYSTEM_REQUIREMENTS}}

## 제3조 (라이선스 유형 및 범위)
① **라이선스 유형**: {{LICENSE_TYPE}}
   - [ ] 영구 라이선스
   - [ ] 구독형 라이선스
   - [ ] 기간제 라이선스
   - [ ] 동시 사용자 라이선스
② **사용 범위**:
   1. 설치 가능 수: {{INSTALLATION_COUNT}}
   2. 사용자 수: {{USER_COUNT}}
   3. 사용 지역: {{TERRITORY}}
   4. 사용 목적: {{USAGE_PURPOSE}}
③ **허용 사항**:
   - 백업 복사본 생성
   - 내부 업무용 사용
   - 문서 인쇄
④ **제한 사항**:
   - 재판매 금지
   - 대여/임대 금지
   - 역설계 금지
   - 소스코드 수정 금지 (별도 약정 제외)

## 제4조 (라이선스 비용)
① **라이선스 비용**: ₩{{LICENSE_FEE}} (부가세 별도)
② **지급 방법**:
   - 일시불: 계약 체결 후 30일 이내
   - 분할: {{PAYMENT_INSTALLMENTS}}
③ **유지보수 비용**: 연간 ₩{{MAINTENANCE_FEE}}
④ **추가 라이선스**: 단가의 {{VOLUME_DISCOUNT}}% 할인

## 제5조 (라이선스 기간)
① **라이선스 기간**: {{LICENSE_START}} ~ {{LICENSE_END}}
② **갱신**: 
   - 자동 갱신 여부: {{AUTO_RENEWAL}}
   - 갱신 통보: 만료 60일 전
③ **영구 라이선스**: 기간 제한 없음

## 제6조 (기술 지원)
① **지원 범위**:
   1. 설치 지원
   2. 사용법 문의 대응
   3. 버그 수정
   4. 업데이트 제공
② **지원 방법**:
   - 이메일/전화: 평일 09:00-18:00
   - 원격 지원: 사전 예약
③ **지원 기간**: 라이선스 기간과 동일
④ **유상 지원**: 
   - 커스터마이징
   - 추가 교육
   - 현장 방문

## 제7조 (업데이트 및 업그레이드)
① **마이너 업데이트**: 무상 제공
② **메이저 업그레이드**: 
   - 유지보수 계약 시: 무상
   - 별도 구매: 정가의 {{UPGRADE_DISCOUNT}}% 할인
③ **보안 패치**: 즉시 제공

## 제8조 (지적재산권)
① 소프트웨어의 모든 지적재산권은 "갑"에게 귀속
② "을"은 사용권만을 취득
③ "을"의 데이터 및 커스터마이징 부분은 "을" 소유

## 제9조 (보증 및 면책)
① **보증 범위**:
   1. 명시된 기능의 정상 작동
   2. 중대한 결함 없음
   3. 악성코드 없음
② **보증 기간**: {{WARRANTY_PERIOD}}
③ **보증 제외**:
   - "을"의 부적절한 사용
   - 무단 수정
   - 제3자 소프트웨어와의 충돌
④ **책임 제한**: 라이선스 비용을 초과하지 않음

## 제10조 (비밀유지)
① 소프트웨어 관련 기술 정보 비밀 유지
② 라이선스 조건 비공개
③ 유효 기간: 계약 종료 후 5년

## 제11조 (감사권)
① "갑"은 연 1회 라이선스 준수 여부 감사 가능
② 30일 전 서면 통보
③ 위반 발견 시 추가 라이선스 비용 + 30% 페널티

## 제12조 (계약 해지)
① **해지 사유**:
   1. 라이선스 비용 미지급
   2. 사용 범위 위반
   3. 불법 복제 또는 배포
② **해지 효과**:
   - 사용권 즉시 소멸
   - 소프트웨어 삭제
   - 보유 자료 반환 또는 폐기

## 제13조 (손해배상)
① 라이선스 위반 시 실손해 + 징벌적 배상
② 불법 복제 시 정품 가격의 5배 배상
③ 영업비밀 누설 시 별도 손해배상

## 제14조 (수출 규제)
① 관련 수출 규제 법규 준수
② 금지 국가 수출 불가
③ 이중 용도 품목 규제 준수

## 제15조 (오픈소스 고지)
① 포함된 오픈소스: {{OPENSOURCE_COMPONENTS}}
② 오픈소스 라이선스 조건 준수
③ 소스코드 제공 의무 (해당 시)

## 제16조 (분쟁해결)
① 대한민국 법률 적용
② 협의 → 조정 → 중재 → 소송
③ 관할: {{JURISDICTION}}지방법원

## 제17조 (특약사항)
{{SPECIAL_TERMS}}

---

**계약체결일**: {{CONTRACT_DATE}}

**"갑"** {{LICENSOR_COMPANY}}
대표 {{LICENSOR_NAME}} (인)

**"을"** {{LICENSEE_COMPANY}}
대표 {{LICENSEE_NAME}} (인)

### 첨부 서류
1. 소프트웨어 명세서
2. 라이선스 인증서
3. 사용자 매뉴얼
4. 오픈소스 고지문
`
};