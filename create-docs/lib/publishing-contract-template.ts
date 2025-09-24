// 출판 계약서 템플릿 (법적 보완 버전)

import { QuoteTemplate } from './quote-templates';

export const PUBLISHING_CONTRACT_DETAILED: QuoteTemplate = {
  id: 'publishing-contract-detailed',
  name: '출판 계약서 (상세)',
  documentType: 'contract',
  category: 'creative',
  description: '도서, 전자책, 콘텐츠 출판을 위한 포괄적 계약서',
  variables: ['AUTHOR_NAME', 'PUBLISHER_NAME', 'BOOK_TITLE', 'PUBLICATION_DATE', 'ROYALTY_RATE'],
  template: `
# 출판 계약서

**계약번호**: {{CONTRACT_NUMBER}}
**계약일자**: {{CONTRACT_DATE}}

## 계약 당사자

### "갑" (저작권자/저자)
- **성명**: {{AUTHOR_NAME}}
- **필명**: {{PEN_NAME}}
- **주민등록번호**: {{AUTHOR_ID_NUMBER}}
- **주소**: {{AUTHOR_ADDRESS}}
- **연락처**: {{AUTHOR_PHONE}}
- **이메일**: {{AUTHOR_EMAIL}}
- **계좌정보**: {{AUTHOR_BANK_ACCOUNT}}

### "을" (출판사)
- **출판사명**: {{PUBLISHER_NAME}}
- **대표자**: {{PUBLISHER_REPRESENTATIVE}}
- **사업자등록번호**: {{PUBLISHER_BUSINESS_NUMBER}}
- **주소**: {{PUBLISHER_ADDRESS}}
- **담당 편집자**: {{EDITOR_NAME}}
- **연락처**: {{PUBLISHER_PHONE}}
- **이메일**: {{PUBLISHER_EMAIL}}

## 제1조 (계약의 목적)
본 계약은 "갑"이 창작한 저작물을 "을"이 출판·배포하는 것에 관한 제반 사항을 규정함을 목적으로 한다.

## 제2조 (저작물의 내용)
① **저작물명**: {{BOOK_TITLE}}
② **부제**: {{SUBTITLE}}
③ **장르**: {{GENRE}}
④ **예상 분량**: {{MANUSCRIPT_PAGES}}매 (200자 원고지 기준)
⑤ **구성**: {{BOOK_STRUCTURE}}
⑥ **대상 독자**: {{TARGET_READERS}}

## 제3조 (출판권 설정)
① **출판권 범위**:
   1. 종이책 출판권
   2. 전자책 출판권
   3. 오디오북 제작권
   4. 해외 번역 출판권
② **독점/비독점**: {{EXCLUSIVE_RIGHTS}}
③ **출판권 설정 기간**: {{RIGHTS_PERIOD}}년
④ **출판 지역**: {{TERRITORY}}

## 제4조 (원고 인도 및 출판 시기)
① **원고 인도**: {{MANUSCRIPT_DEADLINE}}
② **초판 발행**: {{PUBLICATION_DATE}}
③ **초판 부수**: {{FIRST_PRINT_RUN}}부
④ **원고 형태**: {{MANUSCRIPT_FORMAT}}

## 제5조 (인세 및 선인세)
① **인세율**:
   - 종이책: 정가의 {{PRINT_ROYALTY}}%
   - 전자책: 판매가의 {{EBOOK_ROYALTY}}%
   - 오디오북: 판매가의 {{AUDIO_ROYALTY}}%
② **선인세**: ₩{{ADVANCE_PAYMENT}}
③ **정산 주기**: {{SETTLEMENT_PERIOD}}
④ **인세 지급일**: 정산 후 {{PAYMENT_DAYS}}일 이내

## 제6조 (저작권 및 2차 저작물)
① 저작권은 "갑"에게 귀속
② **2차 저작물 권리**:
   - 영상화: {{FILM_RIGHTS}}
   - 공연화: {{PERFORMANCE_RIGHTS}}
   - 게임화: {{GAME_RIGHTS}}
   - 상품화: {{MERCHANDISE_RIGHTS}}
③ 2차 저작물 수익 배분: {{SECONDARY_RIGHTS_SPLIT}}

## 제7조 (저자의 의무)
① 완성된 원고를 기한 내 인도
② 교정 및 교열 작업 협조
③ 홍보 및 마케팅 활동 참여
④ 동일/유사 저작물 출판 제한
⑤ 원고의 독창성 보증

## 제8조 (출판사의 의무)
① 성실한 편집 및 제작
② 적극적인 홍보 및 마케팅
③ 정확한 인세 정산 및 지급
④ 재고 및 판매 현황 보고
⑤ 품절 시 재판 협의

## 제9조 (편집 및 교정)
① "을"은 "갑"과 협의하여 편집
② 내용의 본질적 변경은 "갑"의 동의 필요
③ 교정 기회 최소 2회 제공
④ 최종 교정본 "갑" 확인

## 제10조 (홍보 및 마케팅)
① **홍보 계획**: {{MARKETING_PLAN}}
② **저자 홍보 활동**:
   - 출간 기념회
   - 북토크/강연
   - 언론 인터뷰
   - SNS 활동
③ 홍보비용은 "을" 부담

## 제11조 (재판 및 개정판)
① 재판 결정은 "을"의 권한
② 개정판은 양자 협의
③ 개정 원고료: {{REVISION_FEE}}
④ 절판 통보: 6개월 전

## 제12조 (전자책 및 오디오북)
① 종이책 출간 후 {{EBOOK_RELEASE}}개월 내 출간
② 별도 제작비 없음
③ DRM 적용 여부: {{DRM_APPLIED}}
④ 플랫폼: {{DISTRIBUTION_PLATFORMS}}

## 제13조 (해외 출판)
① 해외 출판권은 {{FOREIGN_RIGHTS_HOLDER}} 보유
② 에이전시 수수료: {{AGENCY_FEE}}%
③ 수익 배분: {{FOREIGN_RIGHTS_SPLIT}}

## 제14조 (계약 해지)
① **해지 사유**:
   - 원고 미인도
   - 출판 지연 (6개월 이상)
   - 인세 미지급
   - 중대한 계약 위반
② 해지 시 선인세 처리: {{ADVANCE_HANDLING}}
③ 재고 도서 처리: {{INVENTORY_HANDLING}}

## 제15조 (손해배상)
① 표절 등 저작권 침해 시 "갑" 책임
② 출판 포기 시 선인세 반환
③ 배상 한도: {{DAMAGES_LIMIT}}

## 제16조 (분쟁 해결)
① 한국출판인회의 조정 우선
② 관할법원: {{JURISDICTION}}지방법원

## 제17조 (특약사항)
{{SPECIAL_TERMS}}

---

**계약체결일**: {{CONTRACT_DATE}}

**"갑" (저자)**
{{AUTHOR_NAME}} (인)

**"을" (출판사)**
{{PUBLISHER_NAME}}
대표 {{PUBLISHER_REPRESENTATIVE}} (인)

### 첨부 서류
1. 출판 기획서
2. 원고 샘플
3. 저자 프로필
`
};