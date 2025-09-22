// Core AI Assistant Types

// 기본 응답 타입
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    processingTime?: number;
    tokenUsage?: TokenUsage;
  };
}

// 토큰 사용량
export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  cost?: number;
}

// 파일 정보
export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  url?: string;
}

// 문서 타입
export type DocumentType = 
  | 'receipt'
  | 'invoice'
  | 'tax_invoice'
  | 'contract'
  | 'business_card'
  | 'id_card'
  | 'unknown';

// 추출된 데이터
export interface ExtractedData {
  documentType: DocumentType;
  fields: ExtractedFields;
  confidence: number;
  rawText: string;
  structuredData: any;
  metadata: ExtractedMetadata;
}

// 추출된 필드
export interface ExtractedFields {
  // 공통 필드
  documentNumber?: string;
  date?: string;
  
  // 사업자 정보
  supplier?: BusinessEntity;
  buyer?: BusinessEntity;
  
  // 금액 정보
  items?: ExtractedItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  
  // 추가 정보
  [key: string]: any;
}

// 사업자 엔티티
export interface BusinessEntity {
  name: string;
  businessNumber?: string;
  representative?: string;
  address?: string;
  email?: string;
  phone?: string;
}

// 추출된 아이템
export interface ExtractedItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tax?: number;
}

// 추출 메타데이터
export interface ExtractedMetadata {
  extractedAt: Date;
  processingTime: number;
  aiModel: string;
  confidence: {
    overall: number;
    fields: Record<string, number>;
  };
}