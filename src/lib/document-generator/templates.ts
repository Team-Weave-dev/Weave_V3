import type { ProjectTableRow } from '@/lib/types/project-table.types';

export type ProjectDocumentCategory = 'contract' | 'invoice' | 'report' | 'estimate' | 'others';

interface ClientData {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  businessNumber?: string;
}

interface ProjectData {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  totalAmount?: number;
  paymentTerms?: string;
  deliverables?: string[];
  requirements?: string[];
}

type DocumentType = 'contract' | 'invoice' | 'quote';

interface QuoteTemplate {
  id: string;
  name: string;
  documentType: DocumentType;
  category:
    | 'standard'
    | 'service'
    | 'software'
    | 'web'
    | 'consulting'
    | 'marketing'
    | 'creative'
    | 'nda'
    | 'education'
    | 'maintenance'
    | 'freelance'
    | 'licensing';
  description: string;
  template: string;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  content: string;
  templateId: string;
  category: ProjectDocumentCategory;
  createdAt: Date;
}

export interface GeneratedDocumentPayload {
  name: string;
  content: string;
  templateId: string;
  category: ProjectDocumentCategory;
  source: 'quote-template' | 'custom';
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: ProjectDocumentCategory;
}

export interface ProjectDocumentTemplate {
  id: string;
  title: string;
  description: string;
  category: ProjectDocumentCategory;
  source: 'quote-template' | 'custom';
  tags?: string[];
  build: (context: TemplateBuildContext) => GeneratedDocumentPayload;
}

export interface TemplateBuildContext {
  project: ProjectTableRow;
}

const CONTRACT_PRIMARY_CATEGORIES = new Set([
  'standard',
  'service',
  'software',
  'web',
  'mobile',
  'consulting',
  'education',
  'maintenance',
  'performance',
  'freelance'
]);

const CONTRACT_SPECIAL_CATEGORIES = new Set([
  'marketing',
  'creative',
  'licensing',
  'nda',
  'design',
  'photography',
  'video'
]);

const quoteTemplates: QuoteTemplate[] = [
  {
    id: 'standard-contract',
    name: '표준 용역 계약서',
    documentType: 'contract',
    category: 'standard',
    description: '일반 프로젝트에 사용할 수 있는 기본 계약서 템플릿',
    template: `# 표준 용역 계약서\n\n## 제1조 (목적)\n본 계약은 {{CLIENT_COMPANY}}(이하 \"갑\")과 위브 팀(이하 \"을\")이 {{PROJECT_TITLE}} 용역 수행을 위해 체결한다.\n\n## 제2조 (용역 범위)\n- 용역 내용: {{PROJECT_DESCRIPTION}}\n- 납품물: {{DELIVERABLES}}\n\n## 제3조 (계약 기간)\n- 기간: {{START_DATE}} ~ {{END_DATE}} ({{DURATION}})\n\n## 제4조 (대금 지급)\n- 총 계약 금액: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n## 제5조 (일반 조항)\n1. 갑과 을은 계약을 성실히 이행한다.\n2. 분쟁 발생 시 서울중앙지방법원을 1심 관할로 한다.\n\n발행일: {{CONTRACT_DATE}}\n\n갑: __________________ (인)\n을: __________________ (인)`
  },
  {
    id: 'service-contract',
    name: '서비스 제공 계약서',
    documentType: 'contract',
    category: 'service',
    description: '정기 유지보수나 서비스 제공형 프로젝트에 적합한 계약서',
    template: `# 서비스 제공 계약서\n\n## 제1조 (서비스 내용)\n- 서비스명: {{PROJECT_TITLE}}\n- 주요 업무: {{PROJECT_DESCRIPTION}}\n\n## 제2조 (서비스 기간)\n- 서비스 기간: {{START_DATE}} ~ {{END_DATE}}\n\n## 제3조 (서비스 대가)\n- 총액: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n## 제4조 (지원 및 유지보수)\n- 갑은 필요한 자료를 제공하고, 을은 SLA에 맞춰 대응한다.\n\n## 제5조 (기타)\n- 본 계약에서 정하지 않은 사항은 상호 협의하여 정한다.\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'software-contract',
    name: '소프트웨어 개발 계약서',
    documentType: 'contract',
    category: 'software',
    description: '맞춤형 소프트웨어 구축 프로젝트 전용 계약서',
    template: `# 소프트웨어 개발 계약서\n\n## 제1조 (개발 범위)\n- 프로젝트명: {{PROJECT_TITLE}}\n- 개발 범위: {{PROJECT_DESCRIPTION}}\n- 산출물: {{DELIVERABLES}}\n\n## 제2조 (개발 일정)\n- 기간: {{START_DATE}} ~ {{END_DATE}}\n- 중간 점검은 월 단위로 실시한다.\n\n## 제3조 (대금 지급)\n- 총액: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n## 제4조 (기술 지원)\n- 납품 후 30일간 무상 유지보수 제공.\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'consulting-contract',
    name: '컨설팅 계약서',
    documentType: 'contract',
    category: 'consulting',
    description: '전략/IT/비즈니스 컨설팅 프로젝트용 계약서',
    template: `# 컨설팅 용역 계약서\n\n## 제1조 (용역 목적)\n- 프로젝트명: {{PROJECT_TITLE}}\n- 용역 범위: {{PROJECT_DESCRIPTION}}\n\n## 제2조 (수행 방식)\n- 정기 워크숍 및 리포트 제공.\n\n## 제3조 (보수)\n- 총액: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n## 제4조 (산출물)\n- 주요 산출물: {{DELIVERABLES}}\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'education-contract',
    name: '교육/강의 계약서',
    documentType: 'contract',
    category: 'education',
    description: '기업 교육, 강연, 워크숍 등에 사용 가능한 계약서',
    template: `# 교육/강의 계약서\n\n## 제1조 (교육 개요)\n- 프로그램명: {{PROJECT_TITLE}}\n- 교육 기간: {{START_DATE}} ~ {{END_DATE}}\n\n## 제2조 (교육 내용)\n- 교육 설명: {{PROJECT_DESCRIPTION}}\n- 제공 자료: {{DELIVERABLES}}\n\n## 제3조 (강사료)\n- 총 금액: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'maintenance-contract',
    name: '유지보수 계약서',
    documentType: 'contract',
    category: 'maintenance',
    description: '운영/유지보수 서비스 제공 시 사용하는 계약서',
    template: `# 유지보수 계약서\n\n## 제1조 (서비스 범위)\n- 프로젝트명: {{PROJECT_TITLE}}\n- 주요 업무: 버그 대응, 업데이트 반영 등\n\n## 제2조 (지원 시간)\n- 기본 지원 시간: 월 40시간\n\n## 제3조 (대가)\n- 월 유지보수 비용: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'freelance-contract',
    name: '프리랜서 계약서',
    documentType: 'contract',
    category: 'freelance',
    description: '개인 프리랜서와 체결하는 간편 계약서',
    template: `# 프리랜서 계약서\n\n## 제1조 (용역 내용)\n- 프로젝트명: {{PROJECT_TITLE}}\n- 세부 작업: {{PROJECT_DESCRIPTION}}\n\n## 제2조 (기간)\n- 기간: {{START_DATE}} ~ {{END_DATE}}\n\n## 제3조 (보수)\n- 금액: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'marketing-contract',
    name: '마케팅 캠페인 계약서',
    documentType: 'contract',
    category: 'marketing',
    description: '디지털 마케팅, 광고 등 캠페인 수행 시 사용할 계약서',
    template: `# 마케팅 캠페인 계약서\n\n## 제1조 (캠페인 개요)\n- 캠페인명: {{PROJECT_TITLE}}\n- 캠페인 기간: {{START_DATE}} ~ {{END_DATE}}\n\n## 제2조 (용역 범위)\n- 업무: 콘텐츠 제작, 매체 집행, 성과 분석\n\n## 제3조 (대가 및 정산)\n- 비용: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'creative-contract',
    name: '디자인/영상 제작 계약서',
    documentType: 'contract',
    category: 'creative',
    description: '디자인, 영상, 사진 등 창작 프로젝트 전용 계약서',
    template: `# 창작물 제작 계약서\n\n## 제1조 (작업 범위)\n- 프로젝트명: {{PROJECT_TITLE}}\n- 작업 내용: {{PROJECT_DESCRIPTION}}\n\n## 제2조 (산출물)\n- 전달물: {{DELIVERABLES}}\n\n## 제3조 (대금)\n- 금액: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n## 제4조 (저작권)\n- 대금 지급 완료 시 저작권은 갑에게 귀속된다.\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'licensing-contract',
    name: '라이선스 계약서',
    documentType: 'contract',
    category: 'licensing',
    description: '콘텐츠/소프트웨어 라이선스 제공 계약서',
    template: `# 라이선스 계약서\n\n## 제1조 (라이선스 범위)\n- 대상: {{PROJECT_TITLE}}\n- 사용 범위: {{PROJECT_DESCRIPTION}}\n\n## 제2조 (기간 및 대가)\n- 기간: {{START_DATE}} ~ {{END_DATE}}\n- 라이선스 비용: {{TOTAL_AMOUNT}}\n\n## 제3조 (사용 조건)\n- 갑은 정해진 범위 내에서만 콘텐츠를 사용한다.\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'nda-contract',
    name: '비밀유지 협약(NDA)',
    documentType: 'contract',
    category: 'nda',
    description: '프로젝트 논의 전 기본으로 체결하는 비밀유지 협약',
    template: `# 비밀유지 협약서 (NDA)\n\n## 제1조 (목적)\n본 협약은 {{CLIENT_COMPANY}}(갑)와 위브 팀(을)이 {{PROJECT_TITLE}} 관련 정보를 교환함에 있어 기밀을 유지하기 위함이다.\n\n## 제2조 (기밀 정보)\n- 기술 자료, 사업 전략, 가격 정책, 고객 정보 등을 포함한다.\n\n## 제3조 (의무)\n- 계약 종료 후 3년간 기밀을 유지하며 제3자에게 공개하지 않는다.\n\n## 제4조 (예외)\n- 이미 공개된 정보, 독자적으로 취득한 정보는 예외로 한다.\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'translation-contract',
    name: '번역 서비스 계약서',
    documentType: 'contract',
    category: 'creative',
    description: '문서/콘텐츠 번역 프로젝트에 사용하는 계약서',
    template: `# 번역 서비스 계약서\n\n## 제1조 (용역 범위)\n- 프로젝트명: {{PROJECT_TITLE}}\n- 번역 언어: {{PROJECT_DESCRIPTION}}\n\n## 제2조 (납품)\n- 납품물: {{DELIVERABLES}}\n- 납기: {{END_DATE}}\n\n## 제3조 (보수)\n- 금액: {{TOTAL_AMOUNT}}\n- 지급 조건: {{PAYMENT_TERMS}}\n\n발행일: {{CONTRACT_DATE}}`
  },
  {
    id: 'standard-quote',
    name: '표준 견적서',
    documentType: 'quote',
    category: 'standard',
    description: '일반 프리랜서/프로젝트 제안 시 사용하는 기본 견적서',
    template: `# 견적서\n\n## 고객 정보\n- 고객명: {{CLIENT_NAME}}\n- 회사명: {{CLIENT_COMPANY}}\n\n## 프로젝트 개요\n- 프로젝트명: {{PROJECT_TITLE}}\n- 작업 기간: {{START_DATE}} ~ {{END_DATE}}\n- 제공 산출물: {{DELIVERABLES}}\n\n## 비용 산정\n- 총 금액: {{TOTAL_AMOUNT}}\n- 결제 조건: {{PAYMENT_TERMS}}\n\n## 비고\n- 본 견적은 발행일로부터 30일간 유효합니다.\n- 추가 요구사항 발생 시 견적이 변경될 수 있습니다.\n\n발행일: {{ISSUE_DATE}}`
  },
  {
    id: 'web-quote',
    name: '웹 개발 견적서',
    documentType: 'quote',
    category: 'web',
    description: '웹사이트/웹앱 개발 프로젝트 전용 견적서',
    template: `# 웹 개발 견적서\n\n## 프로젝트 정보\n- 프로젝트명: {{PROJECT_TITLE}}\n- 작업 범위: {{PROJECT_DESCRIPTION}}\n- 기간: {{START_DATE}} ~ {{END_DATE}}\n\n## 기능 목록\n- 핵심 기능: {{REQUIREMENTS}}\n\n## 견적\n- 총 비용: {{TOTAL_AMOUNT}}\n- 결제 조건: {{PAYMENT_TERMS}}\n\n## 유의사항\n- 디자인/기능 변경 시 추가 비용이 발생할 수 있습니다.\n\n발행일: {{ISSUE_DATE}}`
  },
  {
    id: 'consulting-quote',
    name: '컨설팅 견적서',
    documentType: 'quote',
    category: 'consulting',
    description: '컨설팅, 자문 서비스용 견적서',
    template: `# 컨설팅 견적서\n\n## 프로젝트 개요\n- 프로젝트명: {{PROJECT_TITLE}}\n- 목적: {{PROJECT_DESCRIPTION}}\n- 기간: {{START_DATE}} ~ {{END_DATE}}\n\n## 제공 항목\n{{DELIVERABLES}}\n\n## 견적\n- 총 비용: {{TOTAL_AMOUNT}}\n- 결제 조건: {{PAYMENT_TERMS}}\n\n발행일: {{ISSUE_DATE}}`
  },
  {
    id: 'marketing-quote',
    name: '마케팅 견적서',
    documentType: 'quote',
    category: 'marketing',
    description: '마케팅/광고 캠페인 제안 시 사용하는 견적서',
    template: `# 마케팅 캠페인 견적서\n\n## 캠페인 개요\n- 캠페인명: {{PROJECT_TITLE}}\n- 캠페인 기간: {{START_DATE}} ~ {{END_DATE}}\n\n## 제공 서비스\n{{DELIVERABLES}}\n\n## 견적\n- 총 비용: {{TOTAL_AMOUNT}}\n- 결제 조건: {{PAYMENT_TERMS}}\n\n발행일: {{ISSUE_DATE}}`
  },
  {
    id: 'creative-quote',
    name: '디자인/영상 견적서',
    documentType: 'quote',
    category: 'creative',
    description: '디자인, 영상, 사진 촬영 견적서',
    template: `# 창작물 제작 견적서\n\n## 프로젝트 개요\n- 프로젝트명: {{PROJECT_TITLE}}\n- 작업 내용: {{PROJECT_DESCRIPTION}}\n- 일정: {{START_DATE}} ~ {{END_DATE}}\n\n## 제공 항목\n{{DELIVERABLES}}\n\n## 견적\n- 총 비용: {{TOTAL_AMOUNT}}\n- 결제 조건: {{PAYMENT_TERMS}}\n\n발행일: {{ISSUE_DATE}}`
  },
  {
    id: 'standard-invoice',
    name: '표준 청구서',
    documentType: 'invoice',
    category: 'standard',
    description: '세금계산서/청구서를 대체하는 기본 양식',
    template: `# 청구서\n\n## 공급자 정보\n- 회사명: 위브 팀\n- 사업자등록번호: 123-45-67890\n- 주소: 서울특별시 강남구 테헤란로 123\n\n## 공급받는자 정보\n- 회사명: {{CLIENT_COMPANY}}\n- 담당자: {{CLIENT_NAME}}\n\n## 청구 내역\n- 품목: {{PROJECT_TITLE}}\n- 공급가액: {{SUPPLY_AMOUNT}}\n- 세액: {{TAX_AMOUNT}}\n- 합계: {{TOTAL_AMOUNT}}\n\n## 결제 정보\n- 결제 조건: {{PAYMENT_TERMS}}\n- 결제 기한: {{PAYMENT_DUE_DATE}}\n- 계좌 정보: {{BANK_ACCOUNT}}\n\n발행일: {{INVOICE_DATE}}`
  }
];

const quoteContractTemplates = quoteTemplates.filter((template) => template.documentType === 'contract');
const quoteInvoiceTemplates = quoteTemplates.filter((template) => template.documentType === 'invoice');
const quoteEstimateTemplates = quoteTemplates.filter((template) => template.documentType === 'quote');

const applyDataToTemplate = (
  template: string,
  clientData: ClientData,
  projectData: ProjectData,
  additionalData?: Record<string, string>
): string => {
  let result = template;

  const replaceMap: Record<string, string | undefined> = {
    CLIENT_NAME: clientData.name,
    CLIENT_COMPANY: clientData.company,
    CLIENT_EMAIL: clientData.email,
    CLIENT_PHONE: clientData.phone,
    CLIENT_ADDRESS: clientData.address,
    CLIENT_BUSINESS_NUMBER: clientData.businessNumber,
    PROJECT_TITLE: projectData.title,
    PROJECT_DESCRIPTION: projectData.description,
    START_DATE: projectData.startDate,
    END_DATE: projectData.endDate,
    DURATION: projectData.duration,
    TOTAL_AMOUNT: projectData.totalAmount ? formatCurrency(projectData.totalAmount) : undefined,
    PAYMENT_TERMS: projectData.paymentTerms,
    DELIVERABLES: projectData.deliverables?.map((item) => `- ${item}`).join('\n'),
    REQUIREMENTS: projectData.requirements?.map((item) => `- ${item}`).join('\n')
  };

  Object.entries(replaceMap).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value ?? `[${key}]`);
  });

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value ?? `[${key}]`);
    });
  }

  result = result.replace(/{{ISSUE_DATE}}/g, formatISODate(new Date()) ?? '[발행일]');
  return result;
};

const measureClosestDuration = (start?: string, end?: string): string | undefined => {
  if (!start || !end) {
    return undefined;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return undefined;
  }

  const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) {
    return undefined;
  }

  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  if (months === 0) {
    return `${diffDays}일`;
  }
  if (remainingDays === 0) {
    return `${months}개월`;
  }
  return `${months}개월 ${remainingDays}일`;
};

const formatISODate = (value?: string | Date): string | undefined => {
  if (!value) {
    return undefined;
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (base: Date, days: number): Date => {
  const clone = new Date(base.getTime());
  clone.setDate(clone.getDate() + days);
  return clone;
};

const formatCurrency = (amount?: number): string | undefined => {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return undefined;
  }
  return `${amount.toLocaleString('ko-KR')}원`;
};

const toClientData = (project: ProjectTableRow): ClientData => ({
  name: project.client || '[고객명]',
  company: project.client || undefined,
  email: undefined,
  phone: undefined,
  address: undefined,
  businessNumber: undefined
});

const toProjectData = (project: ProjectTableRow): ProjectData => ({
  title: project.name,
  description: project.contract?.content || '[프로젝트 설명]',
  startDate: formatISODate(project.registrationDate),
  endDate: formatISODate(project.dueDate),
  duration: measureClosestDuration(project.registrationDate, project.dueDate),
  totalAmount: project.contract?.totalAmount,
  paymentTerms: project.contract?.documentIssue?.taxInvoice || '상호 협의 후 결제',
  deliverables: project.contract?.content ? [project.contract.content] : undefined,
  requirements: undefined
});

const buildAdditionalData = (
  project: ProjectTableRow,
  template: QuoteTemplate,
  category: ProjectDocumentCategory
): Record<string, string> => {
  const today = new Date();
  const totalAmount = project.contract?.totalAmount;
  const supplyAmount = typeof totalAmount === 'number' ? Math.round(totalAmount / 1.1) : undefined;
  const taxAmount = typeof supplyAmount === 'number' ? Math.round(supplyAmount * 0.1) : undefined;

  const baseInfo: Record<string, string> = {
    SUPPLIER_NAME: '위브 팀',
    SUPPLIER_BUSINESS_NUMBER: '123-45-67890',
    SUPPLIER_ADDRESS: '서울특별시 강남구 테헤란로 123',
    SUPPLIER_PHONE: '02-1234-5678',
    SUPPLIER_EMAIL: 'hello@weave.team',
    SUPPLIER_BUSINESS_TYPE: '서비스',
    SUPPLIER_BUSINESS_ITEM: '디지털 솔루션',
    SUPPLIER_REPRESENTATIVE: '위브 대표',
    CLIENT_BUSINESS_NUMBER: project.contract?.contractorInfo?.name || '[사업자등록번호]',
    CONTRACT_NUMBER: `CT-${project.no}`,
    CONTRACT_DATE: formatISODate(today) || '[계약일]',
    ISSUE_DATE: formatISODate(today) || '[발행일]',
    INVOICE_DATE: formatISODate(today) || '[발행일]',
    SUPPLY_DATE: formatISODate(project.modifiedDate) || formatISODate(today) || '[공급일]',
    PAYMENT_TERMS: project.contract?.documentIssue?.taxInvoice || '발행일 기준 14일 이내 지급',
    PAYMENT_DUE_DATE: formatISODate(addDays(today, 14)) || '[결제기한]',
    BANK_ACCOUNT: '국민은행 123456-01-234567 위브',
    TOTAL_AMOUNT: formatCurrency(totalAmount) || '[총 금액]',
    SUPPLY_AMOUNT: formatCurrency(supplyAmount) || '[공급가액]',
    TAX_AMOUNT: formatCurrency(taxAmount) || '[세액]',
    TOTAL_AMOUNT_KOREAN: totalAmount ? `${formatCurrency(totalAmount)} (한글 표기)` : '[금액(한글)]',
    ITEM_1: `${project.name} 서비스`,
    ITEM_1_DESC: '프로젝트 주요 산출물 제공',
    ITEM_1_QTY: '1',
    ITEM_1_PRICE: formatCurrency(totalAmount) || '0원',
    ITEM_1_TOTAL: formatCurrency(totalAmount) || '0원'
  };

  if (category === 'invoice') {
    baseInfo.INVOICE_NUMBER = `INV-${project.no}`;
  }

  if (template.category === 'marketing') {
    baseInfo.CAMPAIGN_TITLE = project.name;
  }

  return baseInfo;
};

const quoteTemplateToProjectTemplate = (
  quoteTemplate: QuoteTemplate,
  category: ProjectDocumentCategory
): ProjectDocumentTemplate => ({
  id: quoteTemplate.id,
  title: quoteTemplate.name,
  description: quoteTemplate.description,
  category,
  source: 'quote-template',
  tags: [quoteTemplate.category],
  build: ({ project }) => {
    const clientData = toClientData(project);
    const projectData = toProjectData(project);
    const additional = buildAdditionalData(project, quoteTemplate, category);
    const content = applyDataToTemplate(quoteTemplate.template, clientData, projectData, additional);
    return {
      name: `${project.name} - ${quoteTemplate.name}`,
      content,
      templateId: quoteTemplate.id,
      category,
      source: 'quote-template'
    };
  }
});

const customReportTemplates: ProjectDocumentTemplate[] = [
  {
    id: 'project-progress-report',
    title: '프로젝트 진행 보고서',
    description: '마일스톤, 리스크, 다음 계획을 포함한 표준 보고서',
    category: 'report',
    source: 'custom',
    build: ({ project }) => {
      const startDate = formatISODate(project.registrationDate) || '[시작일]';
      const endDate = formatISODate(project.dueDate) || '[종료일]';
      const duration = measureClosestDuration(project.registrationDate, project.dueDate) || '기간 미정';
      const content = `# 프로젝트 진행 보고서\n\n## 개요\n- 프로젝트명: ${project.name}\n- 클라이언트: ${project.client || '[클라이언트]'}\n- 기간: ${startDate} ~ ${endDate} (${duration})\n\n## 현재 진행 상황\n- 진행률: ${project.progress}%\n- 결제 진행률: ${project.paymentProgress ?? 0}%\n- 최신 업데이트: ${formatISODate(project.modifiedDate) || '[업데이트 일자]'}\n\n## 주요 하이라이트\n1. 이번 주 핵심 성과를 정리하세요.\n2. 제공된 주요 산출물 및 완료된 작업을 기록하세요.\n\n## 리스크 및 이슈\n- 현재 리스크: 상세 내용을 정리하세요.\n- 대응 계획: 리스크에 대한 완화 전략을 기술하세요.\n\n## 다음 단계\n1. 향후 1주간 계획된 작업을 기재하세요.\n2. 필요한 지원 사항 또는 의사결정을 요청하세요.\n\n---\n작성자: ${project.client || 'PM'}\n작성일: ${formatISODate(new Date()) || '[작성일]'}\n`;
      return {
        name: `${project.name} 진행 보고서`,
        content,
        templateId: 'project-progress-report',
        category: 'report',
        source: 'custom'
      };
    }
  },
  {
    id: 'project-retrospective',
    title: '프로젝트 회고 보고서',
    description: '성과, 교훈, 개선사항을 정리하는 회고 템플릿',
    category: 'report',
    source: 'custom',
    build: ({ project }) => {
      const content = `# 프로젝트 회고 보고서\n\n## 프로젝트 개요\n- 프로젝트명: ${project.name}\n- 클라이언트: ${project.client || '[클라이언트]'}\n- 완료일: ${formatISODate(project.modifiedDate) || '[완료일]'}\n\n## 달성한 목표\n- 주요 성과를 bullet 리스트로 정리하세요.\n\n## 잘된 점\n1. 팀워크 및 커뮤니케이션 측면에서의 강점을 기록하세요.\n2. 기술적/운영적 측면의 성공 사례를 작성하세요.\n\n## 개선이 필요한 점\n1. 지연 요인을 정리하고 개선 아이디어를 제시하세요.\n2. 품질 또는 협업 측면에서의 개선 사항을 작성하세요.\n\n## 다음 단계\n- 후속 유지보수 또는 확장 계획이 있다면 정리하세요.\n\n---\n작성자: ${project.client || 'PM'}\n작성일: ${formatISODate(new Date()) || '[작성일]'}\n`;
      return {
        name: `${project.name} 회고 보고서`,
        content,
        templateId: 'project-retrospective',
        category: 'report',
        source: 'custom'
      };
    }
  }
];

const customOtherTemplates: ProjectDocumentTemplate[] = [
  {
    id: 'project-meeting-minutes',
    title: '프로젝트 회의록',
    description: '회의 일정, 참석자, 결정 사항을 정리하는 기본 템플릿',
    category: 'others',
    source: 'custom',
    build: ({ project }) => {
      const now = new Date();
      const content = `# 프로젝트 회의록\n\n## 기본 정보\n- 프로젝트명: ${project.name}\n- 회의 일시: ${formatISODate(now) || '[회의 일시]'}\n- 참석자: [참석자 목록을 작성하세요]\n\n## 안건\n1. 주요 논의 안건을 나열하세요.\n2. 결정이 필요한 이슈를 정리하세요.\n\n## 논의 내용\n- 안건별 논의 내용을 항목으로 작성하세요.\n\n## 결정 사항\n1. 결정된 내용을 명확하게 정리하세요.\n\n## Action Items\n| 담당자 | 작업 내용 | 기한 |\n|--------|-----------|------|\n| [이름] | [작업 내용] | [기한] |\n\n## 기타 메모\n- 추가로 공유할 내용이 있다면 작성하세요.\n`;
      return {
        name: `${project.name} 회의록`,
        content,
        templateId: 'project-meeting-minutes',
        category: 'others',
        source: 'custom'
      };
    }
  },
  {
    id: 'project-nda-summary',
    title: '비밀유지 각서',
    description: '파트너 또는 외부 협력사와 공유할 수 있는 기초 NDA 템플릿',
    category: 'others',
    source: 'custom',
    build: ({ project }) => {
      const content = `# 비밀유지 각서 (NDA)\n\n## 당사자\n- 제공자(갑): ${project.client || '[회사명]'}\n- 수취자(을): 위브 팀\n\n## 목적\n본 각서는 ${project.name} 관련 논의 과정에서 공유되는 기밀 정보를 보호하기 위해 체결된다.\n\n## 기밀 정보\n- 기술 자료 및 소스코드\n- 사업 전략 및 가격 정책\n- 고객 및 파트너 정보\n\n## 의무\n1. 기밀 정보를 사전 동의 없이 제3자에게 공유하거나 활용하지 않는다.\n2. 기밀 정보에 접근 가능한 인원을 필요한 최소한으로 제한한다.\n3. 기밀 정보가 담긴 자료는 안전하게 보관하며, 프로젝트 종료 후 파기한다.\n\n## 예외\n이미 공개된 정보, 독자적으로 생성된 정보 등 법적으로 기밀로 간주되지 않는 경우는 예외로 한다.\n\n## 유효 기간\n본 각서의 효력은 서명일로부터 3년간 지속된다.\n\n---\n서명일: ${formatISODate(new Date()) || '[서명일]'}\n\n갑: ____________________ (서명)\n\n을: ____________________ (서명)\n`;
      return {
        name: `${project.name} NDA`,
        content,
        templateId: 'project-nda-summary',
        category: 'others',
        source: 'custom'
      };
    }
  }
];

const contractTemplates: ProjectDocumentTemplate[] = quoteContractTemplates
  .filter((template) => CONTRACT_PRIMARY_CATEGORIES.has(template.category))
  .map((template) => quoteTemplateToProjectTemplate(template, 'contract'));

const otherContractTemplates: ProjectDocumentTemplate[] = quoteContractTemplates
  .filter((template) => CONTRACT_SPECIAL_CATEGORIES.has(template.category))
  .map((template) => quoteTemplateToProjectTemplate(template, 'others'));

const invoiceTemplates: ProjectDocumentTemplate[] = quoteInvoiceTemplates
  .map((template) => quoteTemplateToProjectTemplate(template, 'invoice'));

const estimateTemplates: ProjectDocumentTemplate[] = quoteEstimateTemplates
  .map((template) => quoteTemplateToProjectTemplate(template, 'estimate'));

const projectDocumentTemplates: Record<ProjectDocumentCategory, ProjectDocumentTemplate[]> = {
  contract: contractTemplates,
  invoice: invoiceTemplates,
  estimate: estimateTemplates,
  report: customReportTemplates,
  others: [...customOtherTemplates, ...otherContractTemplates]
};

export function getTemplatesForCategory(category: ProjectDocumentCategory): ProjectDocumentTemplate[] {
  return projectDocumentTemplates[category] || [];
}

/**
 * 프로젝트 생성 모달의 폼 데이터를 임시 ProjectTableRow로 변환
 * 문서 생성기가 ProjectTableRow를 요구하므로 필요한 헬퍼 함수
 */
export interface ProjectCreateFormData {
  name: string;
  client: string;
  totalAmount?: number;
  dueDate?: Date;
  projectContent?: string;
}

export function createTemporaryProject(formData: Partial<ProjectCreateFormData>): import('@/lib/types/project-table.types').ProjectTableRow {
  const now = new Date();

  return {
    id: 'temp-' + Date.now(),
    no: 'TEMP001',
    name: formData.name || '[프로젝트명]',
    client: formData.client || '[클라이언트명]',
    registrationDate: formatISODate(now) || now.toISOString(),
    dueDate: formatISODate(formData.dueDate) || formatISODate(now) || now.toISOString(),
    modifiedDate: now.toISOString(),
    status: 'planning',
    progress: 0,
    paymentProgress: 'not_started',
    settlementMethod: 'not_set',
    paymentStatus: 'not_started',
    projectContent: formData.projectContent,
    totalAmount: formData.totalAmount,
    contract: {
      totalAmount: formData.totalAmount || 0,
      content: formData.projectContent || '',
      contractorInfo: {
        name: formData.client || '[클라이언트명]',
        position: '담당자'
      },
      reportInfo: {
        type: '표준'
      },
      estimateInfo: {
        type: '표준'
      },
      documentIssue: {
        taxInvoice: '발행일 기준 14일 이내 지급',
        receipt: '미설정',
        cashReceipt: '미설정',
        businessReceipt: '미설정'
      },
      other: {
        date: now.toISOString()
      }
    }
  };
}
