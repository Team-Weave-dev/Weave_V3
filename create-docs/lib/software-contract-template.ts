// 소프트웨어 용역 계약서 템플릿

import { QuoteTemplate } from './quote-templates';

export const SOFTWARE_CONTRACT_DETAILED: QuoteTemplate = {
  id: 'software-contract-detailed',
  name: '소프트웨어 개발 용역 계약서 (상세)',
  documentType: 'contract',
  category: 'software',
  description: '소프트웨어 개발 프로젝트를 위한 상세 계약서',
  variables: ['CLIENT_NAME', 'CLIENT_COMPANY', 'PROJECT_NAME', 'START_DATE', 'END_DATE', 'TOTAL_AMOUNT'],
  template: `
# 소프트웨어 개발 용역 계약서 (상세)

**계약번호**: {{CONTRACT_NUMBER}}
**계약일자**: {{CONTRACT_DATE}}

## 계약 당사자

본 계약은 소프트웨어 개발 용역의 위탁과 수행에 관하여 다음의 당사자 간에 체결된다.

### "갑" (발주자)
- **회사명**: {{CLIENT_COMPANY}}
- **대표자**: {{CLIENT_NAME}}
- **사업자등록번호**: {{CLIENT_BUSINESS_NUMBER}}
- **주소**: {{CLIENT_ADDRESS}}
- **전화번호**: {{CLIENT_PHONE}}
- **이메일**: {{CLIENT_EMAIL}}

### "을" (개발자)
- **회사명**: {{SUPPLIER_COMPANY}}
- **대표자**: {{SUPPLIER_NAME}}
- **사업자등록번호**: {{SUPPLIER_BUSINESS_NUMBER}}
- **주소**: {{SUPPLIER_ADDRESS}}
- **전화번호**: {{SUPPLIER_PHONE}}
- **이메일**: {{SUPPLIER_EMAIL}}

## 제1조 (계약의 목적)
본 계약은 "갑"이 "을"에게 의뢰한 {{PROJECT_NAME}} 소프트웨어 개발(이하 "본 프로젝트")의 수행에 관한 제반 사항을 규정함을 목적으로 한다.

## 제2조 (개발 범위)
① "을"이 개발할 소프트웨어의 상세 사양은 다음과 같다:
   1. **프로젝트명**: {{PROJECT_NAME}}
   2. **개발 플랫폼**: {{PLATFORM}}
   3. **개발 언어**: {{PROGRAMMING_LANGUAGE}}
   4. **데이터베이스**: {{DATABASE}}
   5. **주요 기능**:
      {{MAIN_FEATURES}}

② 개발 범위에 포함되는 사항:
   1. 소프트웨어 설계 및 개발
   2. 데이터베이스 설계 및 구축
   3. 사용자 인터페이스(UI) 및 사용자 경험(UX) 설계
   4. 시스템 통합 및 테스트
   5. 사용자 매뉴얼 및 기술 문서 작성
   6. 소스코드 및 실행파일 제공

③ 개발 범위에서 제외되는 사항:
   1. 하드웨어 구매 및 설치
   2. 운영체제 및 상용 소프트웨어 라이선스
   3. 인터넷 회선 및 네트워크 구축
   4. 배포 후 유지보수 (별도 계약)

## 제3조 (개발 일정)
① 전체 개발 기간: {{START_DATE}} ~ {{END_DATE}} ({{DURATION}})

② 단계별 개발 일정:
   | 단계 | 기간 | 산출물 |
   |------|------|--------|
   | 1단계: 요구사항 분석 | {{PHASE1_DURATION}} | 요구사항 명세서 |
   | 2단계: 설계 | {{PHASE2_DURATION}} | 설계 문서 |
   | 3단계: 개발 | {{PHASE3_DURATION}} | 소프트웨어 알파 버전 |
   | 4단계: 테스트 | {{PHASE4_DURATION}} | 테스트 결과서, 베타 버전 |
   | 5단계: 배포 | {{PHASE5_DURATION}} | 최종 소프트웨어, 매뉴얼 |

③ 각 단계별 산출물은 "갑"의 검수를 받아야 하며, 검수 기간은 5영업일로 한다.

## 제4조 (계약 금액)
① 총 계약금액: {{TOTAL_AMOUNT}}원 (부가세 별도)
② 상기 금액은 본 계약서에 명시된 개발 범위에 한하며, 추가 개발 요구사항 발생 시 별도 협의한다.

## 제5조 (대금 지급)
① 대금 지급 일정:
   1. 계약금: 계약 체결 시 총액의 30% ({{DOWN_PAYMENT}}원)
   2. 중도금: 3단계 완료 시 총액의 40% ({{MIDDLE_PAYMENT}}원)
   3. 잔금: 최종 검수 완료 시 총액의 30% ({{FINAL_PAYMENT}}원)

② 대금은 세금계산서 발행 후 7일 이내에 지급한다.
③ 지급 계좌: {{BANK_ACCOUNT}}

## 제6조 (지식재산권)
① 본 프로젝트로 개발된 소프트웨어의 소유권은 대금 완불 시 "갑"에게 이전된다.
② "을"은 본 프로젝트 수행 중 취득한 "갑"의 영업비밀을 제3자에게 누설하여서는 아니 된다.
③ 오픈소스 라이브러리 사용 시 라이선스 조건을 명확히 고지하고 "갑"의 동의를 받아야 한다.

## 제7조 (보증 및 하자보수)
① "을"은 최종 검수일로부터 {{WARRANTY_PERIOD}}개월간 무상 하자보수를 제공한다.
② 하자보수 범위:
   1. 프로그램 오류(버그) 수정
   2. 기능 오작동 수정
   3. 성능 저하 문제 해결

③ 다음의 경우는 하자보수 대상에서 제외된다:
   1. "갑"의 임의 수정으로 인한 오류
   2. 운영 환경 변경으로 인한 문제
   3. 제3자 소프트웨어와의 호환성 문제
   4. 새로운 기능 추가 요구

## 제8조 (기밀유지)
① 양 당사자는 본 계약 수행 과정에서 취득한 상대방의 기밀정보를 제3자에게 누설하거나 본 계약 목적 외에 사용하여서는 아니 된다.
② 기밀유지 의무는 계약 종료 후 {{CONFIDENTIALITY_PERIOD}}년간 유효하다.

## 제9조 (계약의 변경 및 해지)
① 계약 내용의 변경은 양 당사자의 서면 합의에 의한다.
② 다음의 경우 상대방에게 서면 통보 후 계약을 해지할 수 있다:
   1. 일방이 계약 내용을 위반하고 시정 요구 후 7일 이내에 시정하지 않는 경우
   2. 일방이 파산, 화의, 회사정리 절차를 개시한 경우
   3. 천재지변 등 불가항력으로 계약 이행이 불가능한 경우

## 제10조 (손해배상)
① 일방의 귀책사유로 상대방에게 손해가 발생한 경우, 귀책 당사자는 상대방의 손해를 배상하여야 한다.
② 손해배상액은 계약금액의 {{PENALTY_RATE}}%를 한도로 한다.

## 제11조 (분쟁 해결)
① 본 계약과 관련하여 분쟁이 발생한 경우, 양 당사자는 상호 협의하여 원만히 해결하도록 노력한다.
② 협의가 이루어지지 않을 경우, {{JURISDICTION}} 지방법원을 제1심 관할법원으로 한다.

## 제12조 (일반 조항)
① 본 계약에 명시되지 않은 사항은 상관례와 관련 법령에 따른다.
② 본 계약서는 2부를 작성하여 양 당사자가 서명 날인 후 각 1부씩 보관한다.

---

위 계약 내용에 합의하여 본 계약을 체결하고, 이를 증명하기 위해 양 당사자는 아래와 같이 서명 날인한다.

**{{CONTRACT_DATE}}**

### "갑" (발주자)
- 회사명: {{CLIENT_COMPANY}}
- 대표자: {{CLIENT_NAME}} (인)

### "을" (개발자)
- 회사명: {{SUPPLIER_COMPANY}}
- 대표자: {{SUPPLIER_NAME}} (인)
`
};

export const SOFTWARE_CONTRACT_SIMPLE: QuoteTemplate = {
  id: 'software-contract-simple',
  name: '소프트웨어 개발 용역 계약서 (약식)',
  documentType: 'contract',
  category: 'software',
  description: '간단한 소프트웨어 개발 프로젝트를 위한 약식 계약서',
  variables: ['CLIENT_NAME', 'CLIENT_COMPANY', 'PROJECT_NAME', 'START_DATE', 'END_DATE', 'TOTAL_AMOUNT'],
  template: `
# 소프트웨어 개발 용역 계약서 (약식)

**계약일자**: {{CONTRACT_DATE}}

## 계약 당사자

### 발주자 ("갑")
- **회사명**: {{CLIENT_COMPANY}}
- **대표자**: {{CLIENT_NAME}}
- **연락처**: {{CLIENT_PHONE}}

### 개발자 ("을")
- **회사명**: {{SUPPLIER_COMPANY}}
- **대표자**: {{SUPPLIER_NAME}}
- **연락처**: {{SUPPLIER_PHONE}}

## 계약 내용

### 1. 프로젝트 개요
- **프로젝트명**: {{PROJECT_NAME}}
- **개발 기간**: {{START_DATE}} ~ {{END_DATE}}
- **개발 내용**: {{PROJECT_DESCRIPTION}}

### 2. 개발 범위
{{DEVELOPMENT_SCOPE}}

### 3. 계약 금액
- **총 금액**: {{TOTAL_AMOUNT}}원 (부가세 별도)
- **지급 방법**:
  - 계약금 (30%): {{DOWN_PAYMENT}}원
  - 잔금 (70%): {{FINAL_PAYMENT}}원

### 4. 납품 및 검수
- 개발 완료 후 소스코드 및 실행파일 납품
- 검수 기간: 납품 후 5영업일

### 5. 하자보수
- 검수 완료 후 3개월간 무상 하자보수

### 6. 기타 사항
- 본 계약에 명시되지 않은 사항은 상호 협의하여 결정
- 분쟁 발생 시 {{JURISDICTION}} 지방법원을 관할로 함

---

위 내용에 합의하여 계약을 체결함.

**{{CONTRACT_DATE}}**

**발주자 (갑)**: {{CLIENT_NAME}} (인)

**개발자 (을)**: {{SUPPLIER_NAME}} (인)
`
};