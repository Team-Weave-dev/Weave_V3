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
  /**
   * @deprecated 이제 wbsTasks 기반으로 자동 계산됩니다. calculateProjectProgress() 사용 권장
   * 마이그레이션 후에는 읽기 전용으로 사용됩니다.
   */
  progress: number;
  status: ProjectStatus;
  dueDate: string;
  modifiedDate: string;
  paymentProgress?: PaymentStatus;   // 수금상태 (배지로 표시)
  // 새로운 필드 추가
  settlementMethod?: SettlementMethod;  // 정산방식
  paymentStatus?: PaymentStatus;        // 수금상태
  totalAmount?: number;                 // 총 금액
  currency?: Currency;                  // 통화 단위
  projectContent?: string;              // 프로젝트 내용
  // 미니 WBS (Work Breakdown Structure)
  wbsTasks: WBSTask[];                  // 프로젝트 하위 작업 목록 (단일 진실 공급원)
  // 지연 로딩 최적화를 위한 플래그
  hasContract?: boolean;
  hasBilling?: boolean;
  hasDocuments?: boolean;
  // 문서 생성 관련
  generateDocuments?: import('@/lib/document-generator/templates').ProjectDocumentCategory[];
  generatedDocuments?: import('@/lib/document-generator/templates').GeneratedDocument[];
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
// 수금상태 타입
export type PaymentStatus =
  | 'advance_completed'    // 선금 완료
  | 'interim_completed'    // 중도금 완료
  | 'final_completed'      // 잔금 완료
  | 'not_started';         // 미시작

// 통화 단위 타입
export type Currency =
  | 'KRW'                  // 원화 (대한민국 원)
  | 'USD';                 // 달러 (미국 달러)

// ===== 미니 WBS (Work Breakdown Structure) 타입 =====

// WBS 작업 상태 타입
export type WBSTaskStatus = 'pending' | 'in_progress' | 'completed';

// WBS 작업 아이템
export interface WBSTask {
  id: string;                    // 작업 고유 ID
  name: string;                  // 작업명
  description?: string;          // 작업 설명 (선택)
  status: WBSTaskStatus;         // 작업 상태
  assignee?: string;             // 담당자 (향후 확장)
  createdAt: string;             // 생성 일시
  startedAt?: string;            // 진행중으로 변경된 일시
  completedAt?: string;          // 완료된 일시
  order: number;                 // 정렬 순서 (드래그 앤 드롭용)
}

// WBS 템플릿 타입
export type WBSTemplateType =
  | 'standard'                   // 표준 프로젝트 (기획, 설계, 개발, 테스트, 배포)
  | 'consulting'                 // 컨설팅 (착수, 분석, 제안, 실행, 종료)
  | 'education'                  // 교육 (기획, 자료 제작, 리허설, 강의, 피드백)
  | 'custom';                    // 커스텀 (직접 입력)

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

// ===== WBS 유틸리티 함수 =====

/**
 * WBS 작업 목록을 기반으로 프로젝트 진행률을 자동 계산합니다.
 * 완료된 작업 수 / 전체 작업 수 * 100
 *
 * @param wbsTasks - WBS 작업 목록
 * @returns 진행률 (0-100)
 *
 * @example
 * const tasks = [
 *   { id: '1', name: '기획', status: 'completed', ... },
 *   { id: '2', name: '설계', status: 'in_progress', ... },
 *   { id: '3', name: '개발', status: 'pending', ... }
 * ]
 * calculateProjectProgress(tasks) // 33 (1/3 * 100)
 */
export function calculateProjectProgress(wbsTasks: WBSTask[]): number {
  if (!wbsTasks || wbsTasks.length === 0) return 0;

  const completedCount = wbsTasks.filter(
    (task) => task.status === 'completed'
  ).length;

  return Math.round((completedCount / wbsTasks.length) * 100);
}

/**
 * WBS 작업 목록의 상태별 개수를 계산합니다.
 *
 * @param wbsTasks - WBS 작업 목록
 * @returns 상태별 작업 개수 객체
 *
 * @example
 * getWBSTaskCounts(tasks)
 * // {
 * //   total: 5,
 * //   pending: 2,
 * //   inProgress: 1,
 * //   completed: 2
 * // }
 */
export function getWBSTaskCounts(wbsTasks: WBSTask[]) {
  return {
    total: wbsTasks.length,
    pending: wbsTasks.filter((t) => t.status === 'pending').length,
    inProgress: wbsTasks.filter((t) => t.status === 'in_progress').length,
    completed: wbsTasks.filter((t) => t.status === 'completed').length,
  };
}
