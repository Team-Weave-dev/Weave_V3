'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProjectProgress from '@/components/ui/project-progress';
import { getProjectPageText, getProjectStatusText, getSettlementMethodText, getPaymentStatusText, getCurrencyText } from '@/config/brand';
import { formatCurrency } from '@/lib/utils';
import ProjectDocumentGeneratorModal from '@/components/projects/DocumentGeneratorModal';
import { PaymentStatus as PaymentStatusComponent } from '@/components/projects/shared/ProjectInfoRenderer/PaymentStatus';
import { ProjectStatus as ProjectStatusComponent } from '@/components/projects/shared/ProjectInfoRenderer/ProjectStatus';
import DocumentDeleteDialog from '@/components/projects/DocumentDeleteDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteDialog } from '@/components/ui/dialogDelete';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  getTemplatesForCategory,
  type GeneratedDocumentPayload,
  type ProjectDocumentCategory
} from '@/lib/document-generator/templates';
import {
  getProjectDocuments,
  addProjectDocument,
  updateProjectDocument,
  deleteProjectDocument,
  deleteProjectDocumentsByType
} from '@/lib/mock/documents';
import type {
  DocumentInfo,
  DocumentStatus,
  ProjectDocumentStatus,
  ProjectTableRow,
  ProjectStatus,
  SettlementMethod,
  PaymentStatus,
  Currency
} from '@/lib/types/project-table.types';

// 편집 관련 타입
interface EditableProjectData {
  name: string;
  client: string;
  status: ProjectStatus;
  dueDate: string;
  progress: number;
  projectContent?: string;
  totalAmount?: number;
  settlementMethod?: SettlementMethod;
  currency?: Currency;
  paymentStatus?: PaymentStatus;
}

interface ProjectEditState {
  isEditing: boolean;
  editingData: EditableProjectData;
  originalData: ProjectTableRow | null;
  errors: Record<string, string>;
  isLoading: boolean;
  isDirty: boolean;
}
import {
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  Edit3Icon,
  XIcon,
  Trash2Icon,
  FilePlus2Icon,
  PlusIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  Calculator,
  BarChart3,
  Flag,
  RotateCcw,
  HelpCircle
} from 'lucide-react';

interface ProjectDetailProps {
  project: ProjectTableRow;
  mode?: 'full' | 'compact'; // full: 전체화면, compact: 패널
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateProject?: () => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  canNavigatePrevious?: boolean;
  canNavigateNext?: boolean;
  // 편집 관련 props
  editState?: ProjectEditState;
  onUpdateField?: (field: keyof EditableProjectData, value: string | number) => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  // 단계 초기화
  onResetStatus?: () => void;
}

type DocumentTabValue = 'contract' | 'invoice' | 'report' | 'estimate' | 'others';

/**
 * ProjectDetail Component
 *
 * Reusable project detail component with 2-level nested tab structure
 * Used in both /projects/[id] page and DetailView panel
 *
 * Features:
 * - 3 main tabs: Overview, Document Management, Tax Management
 * - Document Management sub-tabs: Contract, Invoice, Report, Estimate, Others
 * - Tax Management sub-tabs: Tax Invoice, Withholding, VAT, Cash Receipt, Card Receipt
 * - Responsive design for full/compact modes
 * - Fully integrated with centralized text system
 */

/**
 * 문자열에서 숫자만 추출하는 헬퍼 함수
 * @param value - 입력 문자열 (예: "₩50,000" 또는 "$1,234.56")
 * @returns 추출된 숫자 (예: 50000 또는 123456)
 */
function extractNumber(value: string): number {
  const numericOnly = value.replace(/[^\d]/g, '');
  return numericOnly === '' ? 0 : Number(numericOnly);
}

function formatDocumentDate(date?: string): string {
  if (!date) {
    return '';
  }

  const target = new Date(date);
  if (Number.isNaN(target.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric'
  }).format(target);
}

function formatDocumentFullDate(date?: string): string {
  if (!date) {
    return '';
  }

  const target = new Date(date);
  if (Number.isNaN(target.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(target);
}

export default function ProjectDetail({
  project,
  mode = 'full',
  onClose,
  onEdit,
  onDelete,
  onCreateProject,
  onNavigatePrevious,
  onNavigateNext,
  canNavigatePrevious = false,
  canNavigateNext = false,
  // 편집 관련 props
  editState,
  onUpdateField,
  onSaveEdit,
  onCancelEdit,
  // 단계 초기화
  onResetStatus
}: ProjectDetailProps) {
  const lang = 'ko'; // TODO: 나중에 언어 설정과 연동
  const { toast } = useToast();

  // 편집 모드 확인
  const isEditing = editState?.isEditing ?? false;
  const isLoading = editState?.isLoading ?? false;
  const isDirty = editState?.isDirty ?? false;

  // Tab state management for nested structure
  const [mainTab, setMainTab] = useState('overview');
  const [documentSubTab, setDocumentSubTab] = useState<DocumentTabValue>('contract');
  const [taxSubTab, setTaxSubTab] = useState('taxInvoice');
  const [isStatusHelpOpen, setIsStatusHelpOpen] = useState(false);
  const [documents, setDocuments] = useState<DocumentInfo[]>(() => {
    // localStorage에서 문서 데이터를 먼저 가져오고, 없으면 프로젝트 기본 데이터 사용
    const storedDocuments = getProjectDocuments(project.no);
    return storedDocuments.length > 0
      ? storedDocuments
      : (project.documents ?? []).map((doc) => ({ ...doc }));
  });

  // Project detail states
  const [settlementMethod, setSettlementMethod] = useState(project.settlementMethod || 'not_set');
  const [generatorState, setGeneratorState] = useState<{
    open: boolean;
    category: ProjectDocumentCategory;
    targetSubTab: DocumentTabValue;
  }>({
    open: false,
    category: 'contract',
    targetSubTab: 'contract'
  });
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    mode: 'single' | 'bulk';
    targetType: DocumentInfo['type'];
    targetDoc?: DocumentInfo;
  }>({
    open: false,
    mode: 'single',
    targetType: 'contract'
  });
  const [previewDocument, setPreviewDocument] = useState<DocumentInfo | null>(null);
  const [isDocumentEditing, setIsDocumentEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');

  // 총금액 입력 필드 포커스 상태 (통화 포맷 표시/숨김용)
  const [isTotalAmountFocused, setIsTotalAmountFocused] = useState(false);

  // 단계 초기화 확인 모달 상태
  const [showResetStatusDialog, setShowResetStatusDialog] = useState(false);

  // 🔄 문서 상태를 새로고침하는 함수 (localStorage 변경 감지용)
  const refreshDocuments = useCallback(() => {
    const storedDocuments = getProjectDocuments(project.no);
    const documentsToUse = storedDocuments.length > 0
      ? storedDocuments
      : (project.documents ?? []).map((doc) => ({ ...doc }));

    setDocuments(documentsToUse);
    console.log(`🔄 [PROJECT DETAIL] 프로젝트 ${project.no} 문서 상태 새로고침: ${documentsToUse.length}개`);
  }, [project.no, project.documents]);

  useEffect(() => {
    // localStorage에서 문서 데이터를 먼저 가져오고, 없으면 프로젝트 기본 데이터 사용
    refreshDocuments();
  }, [refreshDocuments]);

  // 🎯 localStorage 변경 감지 및 실시간 동기화
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Weave 프로젝트 문서 키 변경 감지
      if (event.key === 'weave_project_documents' && event.newValue !== event.oldValue) {
        console.log('🔔 [STORAGE EVENT] localStorage 문서 데이터 변경 감지');
        refreshDocuments();
      }
    };

    const handleCustomRefresh = () => {
      console.log('🔔 [CUSTOM EVENT] 문서 새로고침 요청 받음');
      refreshDocuments();
    };

    // 🚀 강제 새로고침 이벤트 핸들러 (프로젝트 생성 모달에서 발생)
    const handleForceRefresh = (event: any) => {
      const { projectNo, timestamp, documentCount } = event.detail || {};
      console.log('🔔 [FORCE REFRESH EVENT] 강제 문서 새로고침 이벤트 받음:', { projectNo, timestamp, documentCount });

      // 현재 프로젝트와 일치하는 경우에만 새로고침
      if (projectNo === project.no) {
        console.log(`🎯 현재 프로젝트(${project.no})와 일치 - 문서 새로고침 실행`);
        refreshDocuments();
      }
    };

    // storage 이벤트 리스너 (다른 탭에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange);

    // 커스텀 이벤트 리스너 (같은 탭 내 변경 감지)
    window.addEventListener('weave-documents-changed', handleCustomRefresh);

    // 강제 새로고침 이벤트 리스너 (프로젝트 생성 모달에서 페이지 이동 시)
    window.addEventListener('weave-force-documents-refresh', handleForceRefresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('weave-documents-changed', handleCustomRefresh);
      window.removeEventListener('weave-force-documents-refresh', handleForceRefresh);
    };
  }, [refreshDocuments]);

  // 🚑 캐시 문제 해결을 위한 강제 새로고침 (개발 모드에서 전역 함수로 노출)
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      (window as any).refreshProjectDocuments = () => {
        console.log('🚑 [MANUAL REFRESH] 수동 문서 새로고침 실행');
        refreshDocuments();
      };
    }
  }, [refreshDocuments]);

  const templateAvailability = useMemo(() => ({
    contract: getTemplatesForCategory('contract').length,
    invoice: getTemplatesForCategory('invoice').length,
    report: getTemplatesForCategory('report').length,
    estimate: getTemplatesForCategory('estimate').length,
    others: getTemplatesForCategory('others').length
  }), []);

  const getCardStatusVisuals = (status: DocumentStatus) => {
    if (!status.exists || status.status === 'none') {
      return {
        label: getProjectPageText.statusPending(lang),
        cardClass: 'bg-red-50 border-red-200 hover:bg-red-100 focus:ring-red-500',
        textClass: 'text-red-600'
      };
    }

    if (status.status === 'completed' || status.status === 'approved') {
      return {
        label: getProjectPageText.statusCompleted(lang),
        cardClass: 'bg-green-50 border-green-200 hover:bg-green-100 focus:ring-green-500',
        textClass: 'text-green-600'
      };
    }

    return {
      label: getProjectPageText.statusInProgress(lang),
      cardClass: 'bg-amber-50 border-amber-200 hover:bg-amber-100 focus:ring-amber-500',
      textClass: 'text-amber-600'
    };
  };

  // Handler for document card clicks - navigates to document management tab
  const handleDocumentCardClick = (documentType: DocumentTabValue) => {
    setMainTab('documentManagement');
    setDocumentSubTab(documentType);
  };

  // Handler for keyboard navigation on document cards
  const handleDocumentCardKeyDown = (event: React.KeyboardEvent, documentType: DocumentTabValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleDocumentCardClick(documentType);
    }
  };

  const documentsByType = useMemo(() => {
    const groups: Record<DocumentInfo['type'], DocumentInfo[]> = {
      contract: [],
      invoice: [],
      report: [],
      estimate: [],
      etc: []
    };

    documents.forEach((doc) => {
      groups[doc.type].push(doc);
    });

    return groups;
  }, [documents]);

  const documentStatus = useMemo<ProjectDocumentStatus>(() => {
    const buildStatus = (type: DocumentInfo['type']): DocumentStatus => {
      const docs = documentsByType[type];
      if (docs.length === 0) {
        return {
          exists: false,
          status: 'none',
          count: 0
        };
      }

      const latest = docs.reduce((latestDoc, currentDoc) => (
        currentDoc.createdAt > latestDoc.createdAt ? currentDoc : latestDoc
      ), docs[0]);

      const allCompleted = docs.every((doc) => doc.status === 'completed' || doc.status === 'approved');
      const aggregateStatus: DocumentStatus['status'] = allCompleted ? 'completed' : 'draft';

      return {
        exists: true,
        status: aggregateStatus,
        lastUpdated: latest.createdAt,
        count: docs.length
      };
    };

    return {
      contract: buildStatus('contract'),
      invoice: buildStatus('invoice'),
      report: buildStatus('report'),
      estimate: buildStatus('estimate'),
      etc: buildStatus('etc')
    };
  }, [documentsByType]);

  const documentCards = [
    {
      key: 'contract' as const,
      label: getProjectPageText.documentContract(lang),
      icon: FileTextIcon,
      status: documentStatus.contract,
      subTab: 'contract' as DocumentTabValue
    },
    {
      key: 'invoice' as const,
      label: getProjectPageText.documentInvoice(lang),
      icon: CreditCardIcon,
      status: documentStatus.invoice,
      subTab: 'invoice' as DocumentTabValue
    },
    {
      key: 'report' as const,
      label: getProjectPageText.documentReport(lang),
      icon: FileTextIcon,
      status: documentStatus.report,
      subTab: 'report' as DocumentTabValue
    },
    {
      key: 'estimate' as const,
      label: getProjectPageText.documentEstimate(lang),
      icon: FileTextIcon,
      status: documentStatus.estimate,
      subTab: 'estimate' as DocumentTabValue
    },
    {
      key: 'others' as const,
      label: getProjectPageText.documentOthers(lang),
      icon: FileTextIcon,
      status: documentStatus.etc,
      subTab: 'others' as DocumentTabValue
    }
  ];

  const documentStatusLabels: Record<DocumentInfo['status'], string> = {
    draft: '초안',
    sent: '전송',
    approved: '승인',
    completed: '완료'
  };

  const documentStatusBadgeVariants: Record<DocumentInfo['status'], BadgeProps['variant']> = {
    draft: 'status-soft-warning',
    sent: 'status-soft-info',
    approved: 'status-soft-success',
    completed: 'status-soft-completed'
  } as const;

  const documentTabConfigs = useMemo(
    () => [
      {
        value: 'contract' as DocumentTabValue,
        type: 'contract' as DocumentInfo['type'],
        generatorCategory: 'contract' as ProjectDocumentCategory,
        title: getProjectPageText.tabContract(lang),
        description: getProjectPageText.contractDesc(lang),
        icon: FileTextIcon
      },
      {
        value: 'invoice' as DocumentTabValue,
        type: 'invoice' as DocumentInfo['type'],
        generatorCategory: 'invoice' as ProjectDocumentCategory,
        title: getProjectPageText.tabInvoice(lang),
        description: getProjectPageText.invoiceDesc(lang),
        icon: CreditCardIcon
      },
      {
        value: 'report' as DocumentTabValue,
        type: 'report' as DocumentInfo['type'],
        generatorCategory: 'report' as ProjectDocumentCategory,
        title: getProjectPageText.tabReport(lang),
        description: getProjectPageText.reportDesc(lang),
        icon: FileTextIcon
      },
      {
        value: 'estimate' as DocumentTabValue,
        type: 'estimate' as DocumentInfo['type'],
        generatorCategory: 'estimate' as ProjectDocumentCategory,
        title: getProjectPageText.tabEstimate(lang),
        description: getProjectPageText.estimateDesc(lang),
        icon: FileTextIcon
      },
      {
        value: 'others' as DocumentTabValue,
        type: 'etc' as DocumentInfo['type'],
        generatorCategory: 'others' as ProjectDocumentCategory,
        title: getProjectPageText.tabOthers(lang),
        description: getProjectPageText.othersDesc(lang),
        icon: FileTextIcon
      }
    ],
    [lang]
  );

  const handleGeneratorOpen = (category: ProjectDocumentCategory, subTab: DocumentTabValue) => {
    setGeneratorState({ open: true, category, targetSubTab: subTab });
  };

  const openDocumentDialog = (doc: DocumentInfo, editing: boolean) => {
    setPreviewDocument(doc);
    setIsDocumentEditing(editing);
    setEditingContent(doc.content ?? '');
  };

  const handlePreviewDocument = (doc: DocumentInfo) => {
    openDocumentDialog(doc, false);
  };

  const handleEditDocument = (doc: DocumentInfo) => {
    openDocumentDialog(doc, true);
  };

  const confirmDelete = () => {
    const { mode, targetDoc, targetType } = deleteDialogState;

    if (mode === 'single' && targetDoc) {
      const updatedDocs = deleteProjectDocument(project.no, targetDoc.id);
      setDocuments(updatedDocs);
      toast({
        title: '문서를 삭제했습니다',
        description: `${targetDoc.name} 문서를 제거했습니다.`
      });
    } else {
      const docs = documentsByType[targetType];
      if (docs.length === 0) {
        toast({
          title: '삭제할 문서가 없습니다',
          description: '현재 탭에는 삭제할 문서가 존재하지 않습니다.'
        });
      } else {
        const updatedDocs = deleteProjectDocumentsByType(project.no, targetType);
        setDocuments(updatedDocs);
        toast({
          title: '문서를 삭제했습니다',
          description: '선택한 카테고리의 문서를 제거했습니다.'
        });
      }
    }

    setDeleteDialogState((prev) => ({ ...prev, open: false, targetDoc: undefined }));
  };

  const requestBulkDelete = (type: DocumentInfo['type']) => {
    const existing = documentsByType[type];
    if (existing.length === 0) {
      toast({
        title: '삭제할 문서가 없습니다',
        description: '현재 탭에는 삭제할 문서가 존재하지 않습니다.'
      });
      return;
    }
    setDeleteDialogState({ open: true, mode: 'bulk', targetType: type });
  };

  // 계약서에서 금액 자동 추출 함수
  const extractAmountFromContract = () => {
    const contractDocs = documents.filter(doc => doc.type === 'contract');

    if (contractDocs.length === 0) {
      toast({
        variant: "destructive",
        title: "계약서를 찾을 수 없습니다",
        description: "계약서 문서가 없어 금액을 추출할 수 없습니다."
      });
      return;
    }

    // 금액 추출을 위한 정규표현식 패턴들
    const amountPatterns = [
      // 총 계약 금액: ₩1,234,567원 또는 총 계약 금액: 1,234,567원
      /총\s*계약\s*금액[:\s]*[₩]?([0-9,]+)원?/gi,
      // 총 금액: ₩1,234,567원 또는 총 금액: 1,234,567원
      /총\s*금액[:\s]*[₩]?([0-9,]+)원?/gi,
      // 금액: ₩1,234,567원 또는 금액: 1,234,567원
      /[^총]\s*금액[:\s]*[₩]?([0-9,]+)원?/gi,
      // 보수: ₩1,234,567원 또는 보수: 1,234,567원
      /보수[:\s]*[₩]?([0-9,]+)원?/gi,
      // 대금: ₩1,234,567원 또는 대금: 1,234,567원
      /대금[:\s]*[₩]?([0-9,]+)원?/gi,
      // 강사료: ₩1,234,567원 또는 강사료: 1,234,567원
      /강사료[:\s]*[₩]?([0-9,]+)원?/gi
    ];

    let extractedAmount: number | null = null;
    let foundInDocument = '';

    // 각 계약서 문서에서 금액 패턴을 찾기
    for (const doc of contractDocs) {
      if (!doc.content) continue;

      for (const pattern of amountPatterns) {
        const match = pattern.exec(doc.content);
        if (match && match[1]) {
          // 숫자에서 쉼표 제거하고 숫자로 변환
          const numericAmount = parseInt(match[1].replace(/,/g, ''), 10);
          if (!isNaN(numericAmount) && numericAmount > 0) {
            extractedAmount = numericAmount;
            foundInDocument = doc.name;
            break;
          }
        }
      }

      if (extractedAmount) break;
    }

    if (extractedAmount) {
      // 추출된 금액을 totalAmount 필드에 설정
      onUpdateField?.('totalAmount', extractedAmount);

      toast({
        title: "금액을 성공적으로 추출했습니다",
        description: `${foundInDocument}에서 ₩${extractedAmount.toLocaleString('ko-KR')}을 찾아 설정했습니다.`
      });
    } else {
      toast({
        variant: "destructive",
        title: "금액을 찾을 수 없습니다",
        description: "계약서에서 인식 가능한 금액 형식을 찾을 수 없습니다."
      });
    }
  };

  const renderDocumentSection = (
    docs: DocumentInfo[],
    Icon: typeof FileTextIcon,
    hasTemplates: boolean
  ) => {
    if (docs.length === 0) {
      return (
        <div className="py-12 text-center text-sm text-muted-foreground">
          {hasTemplates
            ? '등록된 문서가 없습니다. 상단의 문서 생성 버튼을 눌러 템플릿으로 문서를 추가하세요.'
            : '등록된 문서가 없습니다. 템플릿을 추가해 주세요.'}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-3 p-3 border rounded-md bg-muted/20"
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDocumentFullDate(doc.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={documentStatusBadgeVariants[doc.status] ?? 'status-soft-info'} className="capitalize">
                {documentStatusLabels[doc.status] ?? doc.status}
              </Badge>
              <Button size="sm" variant="ghost" onClick={() => handlePreviewDocument(doc)}>
                보기
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleEditDocument(doc)}>
                {getProjectPageText.edit('ko')}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setDeleteDialogState({
                    open: true,
                    mode: 'single',
                    targetType: doc.type,
                    targetDoc: doc
                  })
                }
              >
                삭제
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const mapCategoryToDocumentType = (category: ProjectDocumentCategory): DocumentInfo['type'] => {
    if (category === 'others') {
      return 'etc';
    }
    return category;
  };

  const handleDocumentGenerated = (payload: GeneratedDocumentPayload) => {
    const targetSubTab = generatorState.targetSubTab;
    const documentType = mapCategoryToDocumentType(payload.category);
    const newDocument: DocumentInfo = {
      id: `${payload.templateId}-${Date.now()}`,
      type: documentType,
      name: payload.name,
      createdAt: new Date().toISOString(),
      status: 'draft',
      content: payload.content,
      templateId: payload.templateId,
      source: 'generated'
    };

    const updatedDocs = addProjectDocument(project.no, newDocument);
    setDocuments(updatedDocs);
    setGeneratorState((prev) => ({ ...prev, open: false }));
    setMainTab('documentManagement');
    setDocumentSubTab(targetSubTab);
    setPreviewDocument(newDocument);
    toast({
      title: '문서가 생성되었습니다',
      description: `${payload.name} 문서를 추가했습니다.`
    });
  };

  // 단계 초기화 핸들러
  const handleResetStatus = () => {
    if (onResetStatus) {
      onResetStatus();
      setShowResetStatusDialog(false);
      toast({
        title: getProjectPageText.statusResetConfirmButton(lang),
        description: '프로젝트가 기획 단계로 초기화되었습니다.'
      });
    }
  };

  const statusVariantMap: Record<ProjectTableRow['status'], BadgeProps['variant']> = {
    completed: 'status-soft-completed',
    in_progress: 'status-soft-inprogress',
    review: 'status-soft-review',
    planning: 'status-soft-planning',
    on_hold: 'status-soft-onhold',
    cancelled: 'status-soft-cancelled'
  } as const

  return (
    <div className={`${mode === 'compact' ? '' : 'container mx-auto p-6'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className={mode === 'full' ? 'text-2xl font-semibold mb-2 flex items-center gap-2' : 'text-lg font-semibold mb-2 flex items-center gap-2'}>
              <FileTextIcon className="h-5 w-5" />
              {project.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{project.client}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {onNavigatePrevious && (
              <Button
                variant="outline"
                size="icon"
                onClick={onNavigatePrevious}
                disabled={!canNavigatePrevious}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">{getProjectPageText.previousProject(lang)}</span>
              </Button>
            )}
            {onNavigateNext && (
              <Button
                variant="outline"
                size="icon"
                onClick={onNavigateNext}
                disabled={!canNavigateNext}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">{getProjectPageText.nextProject(lang)}</span>
              </Button>
            )}
            {mode === 'full' && onCreateProject && (
              <Button variant="default" onClick={onCreateProject} className="gap-2">
                <PlusIcon className="h-4 w-4" />
                {getProjectPageText.newProject(lang)}
              </Button>
            )}
            {/* 편집 관련 버튼 */}
            {isEditing ? (
              // 편집 모드: 저장/취소 버튼
              <>
                <Button
                  variant="default"
                  onClick={onSaveEdit}
                  disabled={!isDirty || isLoading}
                  className="gap-2"
                  size={mode === 'compact' ? 'sm' : 'default'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {getProjectPageText.saving('ko')}
                    </>
                  ) : (
                    getProjectPageText.save('ko')
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancelEdit}
                  disabled={isLoading}
                  className="gap-2"
                  size={mode === 'compact' ? 'sm' : 'default'}
                >
                  {getProjectPageText.cancel('ko')}
                </Button>
              </>
            ) : (
              // 일반 모드: 편집 버튼
              onEdit && (
                <Button variant="outline" onClick={onEdit} className="gap-2" size={mode === 'compact' ? 'sm' : 'default'}>
                  <Edit3Icon className="h-4 w-4" />
                  {getProjectPageText.edit(lang)}
                </Button>
              )
            )}
            {onDelete && (
              <Button variant="secondary" onClick={onDelete} className="gap-2" size={mode === 'compact' ? 'sm' : 'default'}>
                <Trash2Icon className="h-4 w-4" />
                {getProjectPageText.deleteButton(lang)}
              </Button>
            )}
            {onClose && (
              <Button variant="secondary" onClick={onClose} className="gap-2" size={mode === 'compact' ? 'sm' : 'default'}>
                <XIcon className="h-4 w-4" />
                {getProjectPageText.close(lang)}
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            {getProjectPageText.tabOverview(lang)}
          </TabsTrigger>
          <TabsTrigger value="documentManagement">
            {getProjectPageText.tabDocumentManagement(lang)}
          </TabsTrigger>
          <TabsTrigger value="taxManagement">
            {getProjectPageText.tabTaxManagement(lang)}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* 프로젝트 정보 통합 카드 */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="text-base font-semibold">
                    {getProjectPageText.projectInfo(lang)}({project.no})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* 좌측 정보 */}
                  <div className="space-y-4">
                    {/* 프로젝트명 */}
                    <div>
                      <Label className="text-sm text-muted-foreground font-medium flex items-center gap-2 mb-1">
                        <FileTextIcon className="h-4 w-4" />
                        {getProjectPageText.fieldProjectName(lang)}
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editState?.editingData.name || ''}
                          onChange={(e) => onUpdateField?.('name', e.target.value)}
                          className={editState?.errors.name ? 'border-destructive' : ''}
                        />
                      ) : (
                        <span className="text-sm block">
                          {project.name}
                        </span>
                      )}
                      {isEditing && editState?.errors.name && (
                        <p className="text-xs text-destructive mt-1">{editState.errors.name}</p>
                      )}
                    </div>

                    {/* 클라이언트 */}
                    <div>
                      <Label className="text-sm text-muted-foreground font-medium flex items-center gap-2 mb-1">
                        <Building2 className="h-4 w-4" />
                        {getProjectPageText.client(lang)}
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editState?.editingData.client || ''}
                          onChange={(e) => onUpdateField?.('client', e.target.value)}
                          className={editState?.errors.client ? 'border-destructive' : ''}
                        />
                      ) : (
                        <span className="text-sm block">
                          {project.client}
                        </span>
                      )}
                      {isEditing && editState?.errors.client && (
                        <p className="text-xs text-destructive mt-1">{editState.errors.client}</p>
                      )}
                    </div>

                    {/* 통화 단위 */}
                    <div>
                      <Label className="text-sm text-muted-foreground font-medium flex items-center gap-2 mb-1">
                        {getProjectPageText.fieldCurrency(lang)}
                      </Label>
                      {isEditing ? (
                        <Select
                          value={editState?.editingData.currency || 'KRW'}
                          onValueChange={(value) => onUpdateField?.('currency', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KRW">
                              {getCurrencyText.KRW(lang)}
                            </SelectItem>
                            <SelectItem value="USD">
                              {getCurrencyText.USD(lang)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm block">
                          {getCurrencyText[project.currency || 'KRW'](lang)}
                        </span>
                      )}
                    </div>

                    {/* 총 계약금액 */}
                    <div>
                      <Label className="text-sm text-muted-foreground font-medium flex items-center gap-2 mb-1">
                        <CreditCardIcon className="h-4 w-4" />
                        {getProjectPageText.fieldTotalAmount(lang)}
                      </Label>
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={(() => {
                                const amount = editState?.editingData.totalAmount || 0;
                                const currency = editState?.editingData.currency || 'KRW';
                                if (isTotalAmountFocused) {
                                  return amount > 0 ? String(amount) : '';
                                }
                                return amount > 0 ? formatCurrency(amount, currency) : '';
                              })()}
                              onChange={(e) => {
                                const numericValue = extractNumber(e.target.value)
                                onUpdateField?.('totalAmount', numericValue)
                              }}
                              onFocus={(e) => {
                                setIsTotalAmountFocused(true)
                                e.target.select()
                              }}
                              onBlur={() => setIsTotalAmountFocused(false)}
                              className={editState?.errors.totalAmount ? 'border-destructive' : ''}
                              placeholder="예: 50000000"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => extractAmountFromContract()}
                              disabled={!documents.some(doc => doc.type === 'contract')}
                              className="whitespace-nowrap"
                            >
                              계약서에서 가져오기
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm block">
                          {project.totalAmount
                            ? formatCurrency(project.totalAmount, project.currency || 'KRW')
                            : getProjectPageText.placeholderNotSet(lang)
                          }
                        </span>
                      )}
                      {isEditing && editState?.errors.totalAmount && (
                        <p className="text-xs text-destructive mt-1">{editState.errors.totalAmount}</p>
                      )}
                    </div>

                    {/* 정산방식 */}
                    <div>
                      <Label className="text-sm text-muted-foreground font-medium flex items-center gap-2 mb-1">
                        <Calculator className="h-4 w-4" />
                        {getProjectPageText.fieldSettlementMethod(lang)}
                      </Label>
                      {isEditing ? (
                        <Select
                          value={editState?.editingData.settlementMethod || 'not_set'}
                          onValueChange={(value) => onUpdateField?.('settlementMethod', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_set">
                              {getSettlementMethodText.not_set(lang)}
                            </SelectItem>
                            <SelectItem value="advance_final">
                              {getSettlementMethodText.advance_final(lang)}
                            </SelectItem>
                            <SelectItem value="advance_interim_final">
                              {getSettlementMethodText.advance_interim_final(lang)}
                            </SelectItem>
                            <SelectItem value="post_payment">
                              {getSettlementMethodText.post_payment(lang)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm block">
                          {getSettlementMethodText[settlementMethod](lang)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 우측 정보 */}
                  <div className="space-y-4">
                    {/* 등록일 */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {getProjectPageText.registered(lang)}
                      </span>
                      <span className="text-sm">
                        {new Date(project.registrationDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>

                    {/* 마감일 - 편집 상태가 아닐 때만 우측에 표시 */}
                    {!isEditing && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          {getProjectPageText.dueDate(lang)}
                        </span>
                        <span className="text-sm">
                          {new Date(project.dueDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    )}

                    {/* 수정일 */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                        <Edit3Icon className="h-4 w-4" />
                        {getProjectPageText.modified(lang)}
                      </span>
                      <span className="text-sm">
                        {new Date(project.modifiedDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 하단 정보 */}
                <div className="border-t pt-4 space-y-4">
                  {/* 작업 진행률 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm text-muted-foreground font-medium">
                        {getProjectPageText.taskProgress(lang)}
                      </Label>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editState?.editingData.progress || 0}
                            onChange={(e) => onUpdateField?.('progress', parseInt(e.target.value) || 0)}
                            className={`w-20 ${editState?.errors.progress ? 'border-destructive' : ''}`}
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">{project.progress}%</span>
                      )}
                    </div>
                    {isEditing && editState?.errors.progress && (
                      <p className="text-xs text-destructive mb-2">{editState.errors.progress}</p>
                    )}
                    <ProjectProgress value={isEditing ? (editState?.editingData.progress || 0) : (project.progress || 0)} size="sm" />
                  </div>

                  {/* 마감일 - 편집 상태일 때만 하단에 표시 */}
                  {isEditing && (
                    <div>
                      <Label className="text-sm text-muted-foreground flex items-center gap-2">
                        <ClockIcon className="h-4 w-4" />
                        {getProjectPageText.dueDate(lang)}
                      </Label>
                      <Input
                        type="date"
                        value={editState?.editingData.dueDate?.split('T')[0] || ''}
                        onChange={(e) => onUpdateField?.('dueDate', new Date(e.target.value).toISOString())}
                        className={editState?.errors.dueDate ? 'border-destructive' : ''}
                      />
                      {editState?.errors.dueDate && (
                        <p className="text-xs text-destructive mt-1">{editState.errors.dueDate}</p>
                      )}
                    </div>
                  )}

                  {/* 현재 단계와 수금상태 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 현재 단계 */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Label className="text-sm text-muted-foreground font-medium">
                          {getProjectPageText.currentStage(lang)}
                        </Label>
                        <Popover open={isStatusHelpOpen} onOpenChange={setIsStatusHelpOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={getProjectPageText.statusFlowTitle(lang)}
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="max-w-sm p-3" side="top">
                            <div className="space-y-2">
                              <p className="font-semibold text-sm">
                                {getProjectPageText.statusFlowTitle(lang)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {getProjectPageText.statusFlowSummary(lang)}
                              </p>
                              <div className="space-y-1 pt-2 border-t text-xs">
                                <div>• {getProjectPageText.statusFlowPlanning(lang)}</div>
                                <div>• {getProjectPageText.statusFlowReview(lang)}</div>
                                <div>• {getProjectPageText.statusFlowInProgress(lang)}</div>
                                <div>• {getProjectPageText.statusFlowManual(lang)}</div>
                                <div>• {getProjectPageText.statusFlowAutoComplete(lang)}</div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        {/* 단계 초기화 버튼: 완료/보류/취소 상태일 때만 표시 */}
                        {!isEditing && (project.status === 'completed' || project.status === 'on_hold' || project.status === 'cancelled') && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setShowResetStatusDialog(true)}
                                  className="h-auto px-2 py-1 text-xs"
                                  aria-label={getProjectPageText.statusResetTooltip(lang)}
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  {getProjectPageText.statusResetLabel(lang)}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">{getProjectPageText.statusResetTooltip(lang)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {isEditing ? (
                        <Select
                          value={editState?.editingData.status || 'planning'}
                          onValueChange={(value) => onUpdateField?.('status', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {/* 🎯 자동 결정 상태는 드롭다운에서 제거됨:
                                - planning: 계약서 완료 + 금액 없음 → 자동 표시
                                - in_progress: 계약서 완료 + 금액 있음 → 자동 표시
                                - review: 계약서 없음 또는 미완료 → 자동 표시
                            */}
                            {/* 사용자가 수동으로 선택 가능한 상태만 제공 */}
                            <SelectItem value="on_hold">
                              {getProjectStatusText('on_hold', lang)}
                            </SelectItem>
                            <SelectItem value="cancelled">
                              {getProjectStatusText('cancelled', lang)}
                            </SelectItem>
                            <SelectItem value="completed">
                              {getProjectStatusText('completed', lang)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <ProjectStatusComponent
                            project={project}
                            mode="detail"
                            lang={lang}
                          />
                        </div>
                      )}
                    </div>

                    {/* 수금상태 */}
                    <div>
                      <Label className="text-sm text-muted-foreground font-medium">
                        {getProjectPageText.paymentStatus(lang)}
                      </Label>
                      {isEditing ? (
                        <Select
                          value={editState?.editingData.paymentStatus || 'not_started'}
                          onValueChange={(value) => onUpdateField?.('paymentStatus', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {/* 🎯 정산방식에 따라 수금상태 항목이 달라짐:
                                - 미설정: not_started만
                                - 선금+잔금: not_started, advance_completed, final_completed
                                - 선금+중도금+잔금: 모든 항목
                                - 후불: not_started, final_completed
                            */}
                            <SelectItem value="not_started">
                              {getPaymentStatusText.not_started(lang)}
                            </SelectItem>

                            {/* 선금 완료 - 선금+잔금, 선금+중도금+잔금에서만 표시 */}
                            {(editState?.editingData.settlementMethod === 'advance_final' ||
                              editState?.editingData.settlementMethod === 'advance_interim_final') && (
                              <SelectItem value="advance_completed">
                                {getPaymentStatusText.advance_completed(lang)}
                              </SelectItem>
                            )}

                            {/* 중도금 완료 - 선금+중도금+잔금에서만 표시 */}
                            {editState?.editingData.settlementMethod === 'advance_interim_final' && (
                              <SelectItem value="interim_completed">
                                {getPaymentStatusText.interim_completed(lang)}
                              </SelectItem>
                            )}

                            {/* 잔금 완료 - 미설정 제외 모든 방식에서 표시 */}
                            {editState?.editingData.settlementMethod !== 'not_set' && (
                              <SelectItem value="final_completed">
                                {getPaymentStatusText.final_completed(lang)}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="mt-1">
                          <PaymentStatusComponent
                            project={project}
                            mode="detail"
                            lang={lang}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 프로젝트 내용 */}
                  <div>
                    <Label className="text-sm text-muted-foreground font-medium">
                      {getProjectPageText.fieldProjectContent(lang)}
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={editState?.editingData.projectContent || ''}
                        onChange={(e) => onUpdateField?.('projectContent', e.target.value)}
                        placeholder={getProjectPageText.placeholderNoContent(lang)}
                        className={`min-h-[80px] ${editState?.errors.projectContent ? 'border-destructive' : ''}`}
                      />
                    ) : (
                      <div className="min-h-[60px] p-3 border rounded-md bg-muted/30">
                        <span className="text-sm text-muted-foreground">
                          {project.projectContent || getProjectPageText.placeholderNoContent(lang)}
                        </span>
                      </div>
                    )}
                    {isEditing && editState?.errors.projectContent && (
                      <p className="text-xs text-destructive mt-1">{editState.errors.projectContent}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. 프로젝트 자료 현황 섹션 - 최하단 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {documentCards.map(({ key, label, icon: Icon, status, subTab }) => {
                    const { label: statusLabel, cardClass, textClass } = getCardStatusVisuals(status);
                    const displayDate = status.lastUpdated ? formatDocumentDate(status.lastUpdated) : '--';
                    const countLabel = status.count && status.count > 1 ? ` (${status.count})` : '';
                    const ariaLabel = `${label}${countLabel} - ${statusLabel}`;

                    return (
                      <div
                        key={key}
                        className={`flex flex-col items-stretch p-4 border rounded-lg transition-colors focus:outline-none focus:ring-2 cursor-pointer ${cardClass}`}
                        onClick={() => handleDocumentCardClick(subTab)}
                        onKeyDown={(event) => handleDocumentCardKeyDown(event, subTab)}
                        role="button"
                        tabIndex={0}
                        aria-label={ariaLabel}
                      >
                        <div className="flex flex-col items-center text-center">
                          <Icon className={`h-8 w-8 mb-2 ${textClass}`} />
                          <h3 className="font-medium text-sm mb-1">
                            {label}
                            {countLabel}
                          </h3>
                          <span className={`text-xs font-medium mb-1 ${textClass}`}>
                            {statusLabel}
                          </span>
                          <span className="text-xs text-muted-foreground">{displayDate}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Document Management Tab with Sub Tabs */}
        <TabsContent value="documentManagement">
          <Card>
            <CardContent className="pt-6">
              <Tabs
                value={documentSubTab}
                onValueChange={(value) => setDocumentSubTab(value as DocumentTabValue)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-5">
                  {documentTabConfigs.map((config) => (
                    <TabsTrigger key={config.value} value={config.value}>
                      {config.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {documentTabConfigs.map((config) => {
                  const documentsForTab = documentsByType[config.type];
                  const hasTemplates = templateAvailability[config.generatorCategory] > 0;
                  return (
                    <TabsContent key={config.value} value={config.value} className="mt-6">
                      <Card>
                        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <CardTitle>{config.title}</CardTitle>
                            <CardDescription>{config.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleGeneratorOpen(config.generatorCategory, config.value)}
                              disabled={!hasTemplates}
                            >
                              <FilePlus2Icon className="mr-2 h-4 w-4" /> 문서 생성
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => requestBulkDelete(config.type)}
                              disabled={documentsForTab.length === 0}
                            >
                              <Trash2Icon className="mr-2 h-4 w-4" /> 전체 삭제
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {renderDocumentSection(
                            documentsForTab,
                            config.icon,
                            hasTemplates
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Management Tab with Sub Tabs */}
        <TabsContent value="taxManagement">
          <Card>
            <CardContent className="pt-6">
              <Tabs value={taxSubTab} onValueChange={setTaxSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="taxInvoice">
                    {getProjectPageText.tabTaxInvoice(lang)}
                  </TabsTrigger>
                  <TabsTrigger value="withholding">
                    {getProjectPageText.tabWithholding(lang)}
                  </TabsTrigger>
                  <TabsTrigger value="vat">
                    {getProjectPageText.tabVat(lang)}
                  </TabsTrigger>
                  <TabsTrigger value="cashReceipt">
                    {getProjectPageText.tabCashReceipt(lang)}
                  </TabsTrigger>
                  <TabsTrigger value="cardReceipt">
                    {getProjectPageText.tabCardReceipt(lang)}
                  </TabsTrigger>
                </TabsList>

                {/* Tax Invoice Sub Tab */}
                <TabsContent value="taxInvoice" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabTaxInvoice(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.taxInvoiceDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabTaxInvoice(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.taxInvoiceDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Withholding Sub Tab */}
                <TabsContent value="withholding" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabWithholding(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.withholdingDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabWithholding(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.withholdingDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* VAT Sub Tab */}
                <TabsContent value="vat" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabVat(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.vatDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabVat(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.vatDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Cash Receipt Sub Tab */}
                <TabsContent value="cashReceipt" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabCashReceipt(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.cashReceiptDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabCashReceipt(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.cashReceiptDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Card Receipt Sub Tab */}
                <TabsContent value="cardReceipt" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabCardReceipt(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.cardReceiptDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabCardReceipt(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.cardReceiptDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProjectDocumentGeneratorModal
        open={generatorState.open}
        category={generatorState.category}
        project={project}
        onOpenChange={(open) => setGeneratorState((prev) => ({ ...prev, open }))}
        onGenerate={handleDocumentGenerated}
      />

      <DocumentDeleteDialog
        open={deleteDialogState.open}
        mode={deleteDialogState.mode}
        targetName={deleteDialogState.mode === 'single' ? deleteDialogState.targetDoc?.name : undefined}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogState((prev) => ({ ...prev, open: false, targetDoc: undefined }));
          } else {
            setDeleteDialogState((prev) => ({ ...prev, open: true }));
          }
        }}
        onConfirm={confirmDelete}
      />

      <Dialog
        open={!!previewDocument}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDocument(null);
            setIsDocumentEditing(false);
            setEditingContent('');
          }
        }}
      >
        <DialogContent className="max-w-3xl border-2 border-primary">
          <DialogHeader>
            <DialogTitle>{previewDocument?.name ?? (isDocumentEditing ? getProjectPageText.documentEdit('ko') : getProjectPageText.documentPreview('ko'))}</DialogTitle>
            <DialogDescription>
              {isDocumentEditing
                ? getProjectPageText.documentEditDescription('ko')
                : getProjectPageText.documentPreviewDescription('ko')}
            </DialogDescription>
          </DialogHeader>
          {isDocumentEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editingContent}
                onChange={(event) => setEditingContent(event.target.value)}
                className="min-h-[320px] max-h-[60vh] overflow-y-auto resize-none"
                placeholder="문서 내용을 입력하세요"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDocumentEditing(false);
                    setEditingContent('');
                  }}
                  className="gap-2"
                >
                  <XIcon className="h-4 w-4" />
                  {getProjectPageText.cancel('ko')}
                </Button>
                <Button
                  onClick={() => {
                    if (!previewDocument) {
                      return;
                    }
                    const updatedDocument: DocumentInfo = {
                      ...previewDocument,
                      content: editingContent,
                      createdAt: new Date().toISOString(),
                      status: 'draft'
                    };
                    const updatedDocs = updateProjectDocument(project.no, previewDocument.id, {
                      content: editingContent,
                      createdAt: new Date().toISOString(),
                      status: 'draft'
                    });
                    setDocuments(updatedDocs);
                    setPreviewDocument(updatedDocument);
                    setIsDocumentEditing(false);
                    toast({
                      title: '문서를 업데이트했습니다',
                      description: '수정한 내용이 저장되고 문서 현황에 반영되었습니다.'
                    });
                  }}
                >
                  {getProjectPageText.save('ko')}
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-2">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {previewDocument?.content ?? '문서 내용이 없습니다.'}
              </pre>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* 단계 초기화 확인 모달 */}
      <DeleteDialog
        open={showResetStatusDialog}
        title={getProjectPageText.statusResetConfirmTitle(lang)}
        description={getProjectPageText.statusResetConfirmMessage(lang)}
        cancelLabel={getProjectPageText.statusResetCancelButton(lang)}
        confirmLabel={getProjectPageText.statusResetConfirmButton(lang)}
        icon={<RotateCcw className="h-8 w-8 text-primary" />}
        borderClassName="border-2 border-primary"
        confirmVariant="default"
        cancelVariant="secondary"
        onOpenChange={setShowResetStatusDialog}
        onConfirm={handleResetStatus}
      />
    </div>
  );
}
