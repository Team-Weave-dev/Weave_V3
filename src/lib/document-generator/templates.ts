import {
  applyDataToTemplate,
  getTemplatesByType,
  type ClientData,
  type ProjectData,
  type QuoteTemplate
} from '../../../create-docs/lib/quote-templates';
import type { ProjectTableRow } from '@/lib/types/project-table.types';

export type ProjectDocumentCategory = 'contract' | 'invoice' | 'report' | 'estimate' | 'others';

export interface GeneratedDocumentPayload {
  name: string;
  content: string;
  templateId: string;
  category: ProjectDocumentCategory;
  source: 'quote-template' | 'custom';
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

const quoteContractTemplates = getTemplatesByType('contract');
const quoteInvoiceTemplates = getTemplatesByType('invoice');
const quoteEstimateTemplates = getTemplatesByType('quote');

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
