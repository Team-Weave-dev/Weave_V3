// 인플루언서 마케팅 계약서 템플릿 (법적 보완 버전)

import { QuoteTemplate } from './quote-templates';

export const INFLUENCER_CONTRACT_DETAILED: QuoteTemplate = {
  id: 'influencer-contract-detailed',
  name: '인플루언서 마케팅 계약서 (상세)',
  documentType: 'contract',
  category: 'marketing',
  description: 'SNS 인플루언서, 유튜버, 블로거 마케팅 협업 계약서',
  variables: ['INFLUENCER_NAME', 'BRAND_NAME', 'CAMPAIGN_TITLE', 'START_DATE', 'END_DATE', 'CONTRACT_FEE'],
  template: `
# 인플루언서 마케팅 계약서

**계약번호**: {{CONTRACT_NUMBER}}
**계약일자**: {{CONTRACT_DATE}}

## 계약 당사자

본 계약은 인플루언서 마케팅 협업에 관하여 다음의 당사자 간에 체결되며, 양 당사자는 상호 이익과 신의성실의 원칙에 따라 본 계약을 이행한다.

### "갑" (광고주/브랜드)
- **회사명**: {{BRAND_COMPANY}}
- **대표자**: {{BRAND_REPRESENTATIVE}}
- **사업자등록번호**: {{BRAND_BUSINESS_NUMBER}}
- **소재지**: {{BRAND_ADDRESS}}
- **담당자**: {{BRAND_MANAGER}}
- **연락처**: {{BRAND_PHONE}}
- **이메일**: {{BRAND_EMAIL}}

### "을" (인플루언서/크리에이터)
- **활동명**: {{INFLUENCER_NAME}}
- **본명**: {{INFLUENCER_REAL_NAME}}
- **주민등록번호/사업자번호**: {{INFLUENCER_ID}}
- **소속 MCN**: {{MCN_COMPANY}}
- **주소**: {{INFLUENCER_ADDRESS}}
- **연락처**: {{INFLUENCER_PHONE}}
- **이메일**: {{INFLUENCER_EMAIL}}

## 제1조 (계약의 목적)
① 본 계약은 "갑"의 제품/서비스를 "을"이 보유한 소셜미디어 채널을 통해 홍보하는 마케팅 협업에 관한 제반 사항을 규정함을 목적으로 한다.
② "을"은 창의적이고 진정성 있는 콘텐츠를 제작하여 "갑"의 브랜드 가치를 높인다.
③ "갑"은 "을"의 창작 활동을 존중하고 합리적인 대가를 지급한다.

## 제2조 (캠페인 상세 내용)
① **캠페인명**: {{CAMPAIGN_TITLE}}
② **홍보 제품/서비스**: {{PRODUCT_NAME}}
③ **캠페인 기간**: {{START_DATE}} ~ {{END_DATE}}
④ **콘텐츠 제작 수량 및 플랫폼**:
   1. 인스타그램: 피드 {{IG_FEED}}개, 스토리 {{IG_STORY}}개, 릴스 {{IG_REELS}}개
   2. 유튜브: 전용 영상 {{YT_DEDICATED}}개, 협찬 언급 {{YT_MENTION}}개
   3. 블로그: 포스팅 {{BLOG_POST}}개
   4. 틱톡: 영상 {{TIKTOK_VIDEO}}개
⑤ **콘텐츠 컨셉**: {{CONTENT_CONCEPT}}
⑥ **필수 포함 내용**:
   - 해시태그: {{REQUIRED_HASHTAGS}}
   - 멘션: {{REQUIRED_MENTIONS}}
   - 링크: {{REQUIRED_LINKS}}
   - 핵심 메시지: {{KEY_MESSAGES}}
⑦ **금지 사항**: {{PROHIBITED_CONTENT}}

## 제3조 (계약 금액 및 지급)
① **총 계약 금액**: ₩{{CONTRACT_FEE}} (부가세 포함)
② **지급 일정**:
   1. 계약금 30%: 계약 체결 시
   2. 중도금 40%: 콘텐츠 50% 게시 시
   3. 잔금 30%: 캠페인 종료 후
③ **추가 인센티브**:
   - 조회수 {{VIEW_THRESHOLD}} 달성 시: ₩{{VIEW_BONUS}}
   - 판매 전환 {{CONVERSION_TARGET}} 달성 시: ₩{{CONVERSION_BONUS}}
④ **현물 지급**: {{PRODUCT_PROVISION}}
⑤ **비용 처리**: 원천징수 3.3% 또는 세금계산서 발행

## 제4조 (콘텐츠 제작 및 게시)
① **제작 일정**:
   1. 콘텐츠 초안 제출: {{DRAFT_DEADLINE}}
   2. 피드백 반영: 3일 이내
   3. 최종 게시: {{POSTING_SCHEDULE}}
② **콘텐츠 품질**:
   1. 고품질 이미지/영상 (최소 {{MIN_RESOLUTION}})
   2. 진정성 있는 리뷰 및 스토리텔링
   3. FTC 가이드라인 준수 (광고 표시)
③ **수정 요청**: 합리적 범위 내 {{REVISION_COUNT}}회
④ **게시 유지 기간**: 최소 {{RETENTION_PERIOD}}개월

## 제5조 (저작권 및 사용권)
① **콘텐츠 저작권**: "을"에게 귀속
② **사용권 허여**:
   1. "갑"은 마케팅 목적으로 콘텐츠 사용 가능
   2. 사용 기간: {{USAGE_PERIOD}}
   3. 사용 범위: {{USAGE_SCOPE}}
③ **2차 활용**: 추가 광고 소재 활용 시 별도 협의
④ **크레딧 표기**: "을"의 채널명/활동명 표기

## 제6조 (준수 사항)
① **광고 표시 의무**:
   1. #광고, #협찬, #스폰서 등 명확한 표시
   2. 유튜브 유료 광고 표시 기능 활성화
③ **진실성 보장**: 과장·허위 광고 금지
④ **법규 준수**: 표시광고법, 전자상거래법 등 준수
⑤ **브랜드 가이드라인**: "갑" 제공 가이드라인 준수

## 제7조 (독점권 및 경업 금지)
① **독점 기간**: 캠페인 기간 중 동종 제품 광고 금지
② **경업 금지 범위**: {{COMPETITOR_LIST}}
③ **예외 사항**: 기존 계약 건은 인정

## 제8조 (성과 측정 및 보고)
① **보고 내용**:
   1. 조회수, 좋아요, 댓글, 공유 수
   2. 도달 범위 및 노출 수
   3. 클릭률 및 전환율
② **보고 주기**: {{REPORTING_FREQUENCY}}
③ **인사이트 접근 권한**: 캠페인 기간 중 제공

## 제9조 (비밀유지)
① 캠페인 전략, 미공개 제품 정보 등 비밀유지
② 계약 조건 제3자 공개 금지
③ 유효 기간: 계약 종료 후 2년

## 제10조 (계약 해지)
① **즉시 해지 사유**:
   1. 콘텐츠 미게시 또는 임의 삭제
   2. 부정적/악의적 콘텐츠 게시
   3. 법규 위반 또는 허위 광고
② **손해배상**: 귀책 사유 있는 당사자가 배상

## 제11조 (면책 및 손해배상)
① "을"의 개인적 의견은 "갑"과 무관함을 명시
② 제3자 권리 침해 시 침해 당사자가 책임
③ 배상 한도: 총 계약 금액의 200%

## 제12조 (특약사항)
{{SPECIAL_TERMS}}

---

**계약체결일**: {{CONTRACT_DATE}}

**"갑"** {{BRAND_COMPANY}}
대표 {{BRAND_REPRESENTATIVE}} (인)

**"을"** {{INFLUENCER_NAME}}
{{INFLUENCER_REAL_NAME}} (인)
`
};