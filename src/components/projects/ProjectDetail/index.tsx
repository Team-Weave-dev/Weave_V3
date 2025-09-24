'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import ProjectProgress from '@/components/ui/project-progress';
import { getProjectPageText, getProjectStatusText } from '@/config/brand';
import ProjectDocumentGeneratorModal from '@/components/projects/DocumentGeneratorModal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  getTemplatesForCategory,
  type GeneratedDocumentPayload,
  type ProjectDocumentCategory
} from '@/lib/document-generator/templates';
import type {
  DocumentInfo,
  DocumentStatus,
  ProjectDocumentStatus,
  ProjectTableRow
} from '@/lib/types/project-table.types';
import {
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  Edit3Icon,
  XIcon,
  Trash2Icon,
  FilePlus2Icon
} from 'lucide-react';

interface ProjectDetailProps {
  project: ProjectTableRow;
  mode?: 'full' | 'compact'; // full: 전체화면, compact: 패널
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
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
  onDelete
}: ProjectDetailProps) {
  const lang = 'ko'; // TODO: 나중에 언어 설정과 연동
  const { toast } = useToast();

  // Tab state management for nested structure
  const [mainTab, setMainTab] = useState('overview');
  const [documentSubTab, setDocumentSubTab] = useState<DocumentTabValue>('contract');
  const [taxSubTab, setTaxSubTab] = useState('taxInvoice');
  const [documents, setDocuments] = useState<DocumentInfo[]>(() =>
    (project.documents ?? []).map((doc) => ({ ...doc }))
  );
  const [generatorState, setGeneratorState] = useState<{
    open: boolean;
    category: ProjectDocumentCategory;
    targetSubTab: DocumentTabValue;
  }>({
    open: false,
    category: 'contract',
    targetSubTab: 'contract'
  });
  const [previewDocument, setPreviewDocument] = useState<DocumentInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    setDocuments((project.documents ?? []).map((doc) => ({ ...doc })));
  }, [project.id, project.documents]);

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
    setIsEditing(editing);
    setEditingContent(doc.content ?? '');
  };

  const handlePreviewDocument = (doc: DocumentInfo) => {
    openDocumentDialog(doc, false);
  };

  const handleEditDocument = (doc: DocumentInfo) => {
    openDocumentDialog(doc, true);
  };

  const handleDeleteDocuments = (type: DocumentInfo['type']) => {
    const targetDocs = documentsByType[type];
    if (targetDocs.length === 0) {
      toast({
        title: '삭제할 문서가 없습니다',
        description: '현재 탭에는 삭제할 문서가 존재하지 않습니다.'
      });
      return;
    }

    const confirmed = window.confirm('선택한 카테고리의 생성 문서를 모두 삭제하시겠습니까?');
    if (!confirmed) {
      return;
    }

    setDocuments((prev) => prev.filter((doc) => doc.type !== type));
    toast({
      title: '문서가 삭제되었습니다',
      description: '선택한 카테고리의 문서를 제거했습니다.'
    });
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
                편집
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

    setDocuments((prev) => [...prev, newDocument]);
    setGeneratorState((prev) => ({ ...prev, open: false }));
    setMainTab('documentManagement');
    setDocumentSubTab(targetSubTab);
    setPreviewDocument(newDocument);
    toast({
      title: '문서가 생성되었습니다',
      description: `${payload.name} 문서를 추가했습니다.`
    });
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
            <h1 className={mode === 'full' ? 'text-2xl font-semibold mb-2' : 'text-lg font-semibold mb-2'}>
              {project.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{getProjectPageText.projectNo(lang)}: {project.no}</span>
              <span>•</span>
              <span>{getProjectPageText.client(lang)}: {project.client}</span>
              <span>•</span>
              <Badge variant={statusVariantMap[project.status]}>
                {getProjectStatusText(project.status, lang)}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" onClick={onEdit} className="gap-2" size={mode === 'compact' ? 'sm' : 'default'}>
                <Edit3Icon className="h-4 w-4" />
                {getProjectPageText.edit(lang)}
              </Button>
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
            {/* 1. 기존 프로젝트 정보 카드 (개요) - 최상단 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 프로젝트 정보 */}
                  <div>
                    <h3 className="text-base font-semibold mb-4">
                      {getProjectPageText.projectInfo(lang)}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {getProjectPageText.registered(lang)}
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(project.registrationDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          {getProjectPageText.dueDate(lang)}
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(project.dueDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4" />
                          {getProjectPageText.modified(lang)}
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(project.modifiedDate).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 프로젝트 상태 */}
                  <div>
                    <h3 className="text-base font-semibold mb-4">
                      {getProjectPageText.projectStatus(lang)}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{getProjectPageText.taskProgress(lang)}</span>
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                          <ProjectProgress value={project.progress || 0} size="sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{getProjectPageText.paymentStatus(lang)}</span>
                            <span className="text-sm font-medium">{project.paymentProgress}%</span>
                          </div>
                          <ProjectProgress value={project.paymentProgress || 0} size="sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{getProjectPageText.currentStage(lang)}</span>
                        <Badge variant={statusVariantMap[project.status]}>
                          {getProjectStatusText(project.status, lang)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. 프로젝트 상세 정보 섹션 - 중간 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* 총 금액 */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      {getProjectPageText.fieldTotalAmount(lang)}
                    </span>
                    <span className="text-sm font-medium">
                      {getProjectPageText.placeholderNotSet(lang)} {getProjectPageText.placeholderAmount(lang)}
                    </span>
                  </div>

                  {/* 프로젝트명 */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      {getProjectPageText.fieldProjectName(lang)}
                    </span>
                    <span className="text-sm font-medium">
                      {getProjectPageText.placeholderNotSet(lang)}
                    </span>
                  </div>

                  {/* 정산방식 */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      {getProjectPageText.fieldSettlementMethod(lang)}
                    </span>
                    <span className="text-sm font-medium">
                      {getProjectPageText.placeholderNotSet(lang)}
                    </span>
                  </div>

                  {/* 선급 */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-muted-foreground">
                      {getProjectPageText.fieldAdvance(lang)}
                    </span>
                    <span className="text-sm font-medium">
                      {getProjectPageText.placeholderNotSet(lang)}
                    </span>
                  </div>

                  {/* 프로젝트 내용 */}
                  <div className="py-2">
                    <span className="text-sm text-muted-foreground block mb-2">
                      {getProjectPageText.fieldProjectContent(lang)}
                    </span>
                    <div className="min-h-[60px] p-3 border rounded-md bg-muted/30">
                      <span className="text-sm text-muted-foreground">
                        {getProjectPageText.placeholderNoContent(lang)}
                      </span>
                    </div>
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
                              onClick={() => handleDeleteDocuments(config.type)}
                              disabled={documentsForTab.length === 0}
                            >
                              <Trash2Icon className="mr-2 h-4 w-4" /> 삭제
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

      <Dialog
        open={!!previewDocument}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDocument(null);
            setIsEditing(false);
            setEditingContent('');
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDocument?.name ?? (isEditing ? '문서 편집' : '문서 미리보기')}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? '내용을 수정한 뒤 저장하면 목록과 개요 카드에 즉시 반영됩니다.'
                : '생성된 문서를 확인하세요.'}
            </DialogDescription>
          </DialogHeader>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editingContent}
                onChange={(event) => setEditingContent(event.target.value)}
                className="min-h-[320px]"
                placeholder="문서 내용을 입력하세요"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingContent('');
                  }}
                >
                  취소
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
                    setDocuments((prev) =>
                      prev.map((doc) => (doc.id === previewDocument.id ? updatedDocument : doc))
                    );
                    setPreviewDocument(updatedDocument);
                    setIsEditing(false);
                    toast({
                      title: '문서를 업데이트했습니다',
                      description: '수정한 내용이 저장되고 문서 현황에 반영되었습니다.'
                    });
                  }}
                >
                  저장
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
    </div>
  );
}
