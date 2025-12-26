/**
 * 문서 생성 워크플로우 타입 정의
 *
 * NOTE: 이 파일은 현재 코드에서 사용되지 않습니다.
 * User, Client, Project는 @/lib/storage에서 정의된 타입을 사용하세요.
 *
 * @deprecated 문서 워크플로우 기능 구현 시 이 파일을 정리 필요
 */

import type { User, Client, Project } from '@/lib/storage';

// Re-export for backward compatibility (if any future usage)
export type { User, Client, Project };

/** 문서 워크플로우 전용 타입 */
export interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'business' | 'legal' | 'technical' | 'financial';
  templates?: string[]; // 연관 템플릿 ID들
}

export interface WorkflowStep {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  data?: any;
}

export interface DocumentWorkflow {
  currentStep: number;
  user: User | null;
  client: Client | null;
  project: Project | null;
  documentType: DocumentType | null;
  templateId: string | null;
  steps: WorkflowStep[];
}

// 문서 종류 정의
export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'proposal',
    name: '제안서',
    description: '프로젝트 제안 및 기획 문서',
    icon: '📋',
    category: 'business',
    templates: ['basic-proposal', 'detailed-proposal', 'tech-proposal']
  },
  {
    id: 'quotation',
    name: '견적서',
    description: '서비스 및 제품 가격 제안',
    icon: '💰',
    category: 'financial',
    templates: ['basic-quote', 'detailed-quote', 'service-quote']
  },
  {
    id: 'contract',
    name: '계약서',
    description: '법적 구속력이 있는 계약 문서',
    icon: '📝',
    category: 'legal',
    templates: ['service-contract', 'nda', 'partnership-agreement']
  },
  {
    id: 'invoice',
    name: '청구서',
    description: '대금 청구 및 세금계산서',
    icon: '🧾',
    category: 'financial',
    templates: ['basic-invoice', 'tax-invoice', 'service-invoice']
  },
  {
    id: 'report',
    name: '보고서',
    description: '프로젝트 진행 및 결과 보고',
    icon: '📊',
    category: 'technical',
    templates: ['progress-report', 'final-report', 'analysis-report']
  },
  {
    id: 'specification',
    name: '명세서',
    description: '기술 사양 및 요구사항 정의',
    icon: '📄',
    category: 'technical',
    templates: ['tech-spec', 'requirements-doc', 'api-spec']
  }
];

// 산업 분야별 카테고리
export const INDUSTRY_CATEGORIES = [
  { id: 'it', name: 'IT/소프트웨어', icon: '💻' },
  { id: 'design', name: '디자인/크리에이티브', icon: '🎨' },
  { id: 'consulting', name: '컨설팅', icon: '💼' },
  { id: 'education', name: '교육', icon: '📚' },
  { id: 'healthcare', name: '헬스케어', icon: '🏥' },
  { id: 'finance', name: '금융', icon: '🏦' },
  { id: 'retail', name: '유통/리테일', icon: '🛒' },
  { id: 'manufacturing', name: '제조', icon: '🏭' },
  { id: 'other', name: '기타', icon: '📦' }
];