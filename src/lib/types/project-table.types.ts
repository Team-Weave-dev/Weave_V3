// 프로젝트 테이블 시스템 중앙화된 타입 정의

export interface ProjectTableColumn {
  id: string;
  key: keyof ProjectTableRow;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
  visible: boolean;
  order: number;
  type: 'text' | 'date' | 'number' | 'status' | 'progress' | 'currency' | 'payment_progress';
}

export interface ProjectTableRow {
  id: string;
  no: string;
  name: string;
  registrationDate: string;
  client: string;
  progress: number;
  status: ProjectStatus;
  dueDate: string;
  modifiedDate: string;
  paymentProgress?: PaymentStatus;   // 수금상태 (배지로 표시)
  // 새로운 필드 추가
  settlementMethod?: SettlementMethod;  // 정산방식
  paymentStatus?: PaymentStatus;        // 수금상태
  totalAmount?: number;                 // 총 금액
  projectContent?: string;              // 프로젝트 내용
  // 지연 로딩 최적화를 위한 플래그
  hasContract?: boolean;
  hasBilling?: boolean;
  hasDocuments?: boolean;
  // 문서 생성 관련
  generateDocuments?: import('@/lib/document-generator/templates').ProjectDocumentCategory[];
  // 세부정보용 추가 필드 (필요시 지연 로딩)
  contract?: ContractInfo;
  estimate?: EstimateInfo;    // 견적서 정보 추가
  billing?: BillingInfo;
  documents?: DocumentInfo[];
  documentStatus?: ProjectDocumentStatus;  // 문서 현황 통합 관리
}

export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

// 정산방식 타입
export type SettlementMethod =
  | 'not_set'              // 미설정
  | 'advance_final'        // 선금+잔금
  | 'advance_interim_final' // 선금+중도금+잔금
  | 'post_payment';        // 후불

// 수금상태 타입
export type PaymentStatus =
  | 'advance_completed'    // 선금 완료
  | 'interim_completed'    // 중도금 완료
  | 'final_completed'      // 잔금 완료
  | 'not_started';         // 미시작

export interface ContractInfo {
  totalAmount?: number;       // 계약서 총 금액
  content?: string;           // 계약서 내용
  contractorInfo: {
    name: string;
    position: string;
  };
  reportInfo: {
    type: string;
  };
  estimateInfo: {
    type: string;
  };
  documentIssue: {
    taxInvoice: string;
    receipt: string;
    cashReceipt: string;
    businessReceipt: string;
  };
  other: {
    date: string;
  };
}

// 견적서 정보 인터페이스 추가
export interface EstimateInfo {
  totalAmount?: number;       // 견적서 총 금액
  content?: string;           // 견적서 내용
  createdAt?: string;         // 견적서 생성일
  validUntil?: string;        // 견적서 유효기간
  status?: 'draft' | 'sent' | 'approved' | 'rejected';
}

export interface BillingInfo {
  // 청구/정산 관련 정보
  totalAmount: number;        // 총 프로젝트 금액
  paidAmount: number;         // 총 입금액 (계약금 + 중도금 + 잔금)
  remainingAmount: number;    // 미수금
  // 수금 단계별 세부 정보
  contractAmount: number;     // 계약금 (선수금)
  interimAmount: number;      // 중도금
  finalAmount: number;        // 잔금
  // 실제 입금 현황
  contractPaid: number;       // 계약금 입금액
  interimPaid: number;        // 중도금 입금액
  finalPaid: number;          // 잔금 입금액
}

export interface DocumentInfo {
  id: string;
  type: 'contract' | 'invoice' | 'report' | 'estimate' | 'etc';
  name: string;
  createdAt: string;
  status: 'draft' | 'sent' | 'approved' | 'completed';
  content?: string;
  templateId?: string;
  source?: 'generated' | 'uploaded' | 'imported';
}

// 프로젝트 문서 현황 통합 관리
export interface ProjectDocumentStatus {
  contract: DocumentStatus;      // 계약서
  invoice: DocumentStatus;       // 청구서
  report: DocumentStatus;        // 보고서
  estimate: DocumentStatus;      // 견적서
  etc: DocumentStatus;           // 기타문서
}

// 개별 문서 상태
export interface DocumentStatus {
  exists: boolean;               // 문서 존재 여부
  status: 'none' | 'draft' | 'completed' | 'approved' | 'sent';
  lastUpdated?: string;          // 마지막 업데이트
  count?: number;               // 문서 개수 (복수 문서 가능)
}

export interface TableFilterState {
  searchQuery: string;
  statusFilter: ProjectStatus | 'all';
  clientFilter: string; // 클라이언트 필터 추가
  dateRange?: {
    start: Date;
    end: Date;
  };
  customFilters: Record<string, any>;
}

export interface TableSortState {
  column: string;
  direction: 'asc' | 'desc';
}

export interface ProjectTableConfig {
  columns: ProjectTableColumn[];
  filters: TableFilterState;
  sort: TableSortState;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
