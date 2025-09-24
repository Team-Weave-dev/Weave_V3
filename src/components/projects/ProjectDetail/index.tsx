'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import ProjectProgress from '@/components/ui/project-progress';
import { getProjectPageText, getProjectStatusText } from '@/config/brand';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { CalendarIcon, FileTextIcon, CreditCardIcon, BriefcaseIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon, Edit3Icon, XIcon, Trash2Icon } from 'lucide-react';

interface ProjectDetailProps {
  project: ProjectTableRow;
  mode?: 'full' | 'compact'; // full: 전체화면, compact: 패널
  onClose?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

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
export default function ProjectDetail({
  project,
  mode = 'full',
  onClose,
  onEdit,
  onDelete
}: ProjectDetailProps) {
  const lang = 'ko'; // TODO: 나중에 언어 설정과 연동

  // Tab state management for nested structure
  const [documentSubTab, setDocumentSubTab] = useState('contract');
  const [taxSubTab, setTaxSubTab] = useState('taxInvoice');

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
      <Tabs defaultValue="overview" className="w-full">
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
          <Card>
            <CardHeader>
              <CardTitle>{getProjectPageText.tabOverview(lang)}</CardTitle>
              <CardDescription>
                {getProjectPageText.overviewDesc(lang)}
              </CardDescription>
            </CardHeader>
            <CardContent>
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

              {/* 추가 정보 섹션 */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-4 text-sm">
                  {project.hasContract && (
                    <div className="flex items-center gap-1">
                      <FileTextIcon className="h-4 w-4 text-green-600" />
                      <span>{getProjectPageText.hasContract(lang)}</span>
                    </div>
                  )}
                  {project.hasBilling && (
                    <div className="flex items-center gap-1">
                      <CreditCardIcon className="h-4 w-4 text-blue-600" />
                      <span>{getProjectPageText.hasBilling(lang)}</span>
                    </div>
                  )}
                  {project.hasDocuments && (
                    <div className="flex items-center gap-1">
                      <FileTextIcon className="h-4 w-4 text-purple-600" />
                      <span>{getProjectPageText.hasDocuments(lang)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Management Tab with Sub Tabs */}
        <TabsContent value="documentManagement">
          <Card>
            <CardContent className="pt-6">
              <Tabs value={documentSubTab} onValueChange={setDocumentSubTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="contract">
                    {getProjectPageText.tabContract(lang)}
                  </TabsTrigger>
                  <TabsTrigger value="invoice">
                    {getProjectPageText.tabInvoice(lang)}
                  </TabsTrigger>
                  <TabsTrigger value="report">
                    {getProjectPageText.tabReport(lang)}
                  </TabsTrigger>
                  <TabsTrigger value="estimate">
                    {getProjectPageText.tabEstimate(lang)}
                  </TabsTrigger>
                  <TabsTrigger value="others">
                    {getProjectPageText.tabOthers(lang)}
                  </TabsTrigger>
                </TabsList>

                {/* Contract Sub Tab */}
                <TabsContent value="contract" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabContract(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.contractDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabContract(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.contractDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Invoice Sub Tab */}
                <TabsContent value="invoice" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabInvoice(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.invoiceDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabInvoice(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.invoiceDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Report Sub Tab */}
                <TabsContent value="report" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabReport(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.reportDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabReport(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.reportDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Estimate Sub Tab */}
                <TabsContent value="estimate" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabEstimate(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.estimateDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabEstimate(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.estimateDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Others Sub Tab */}
                <TabsContent value="others" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{getProjectPageText.tabOthers(lang)}</CardTitle>
                      <CardDescription>
                        {getProjectPageText.othersDesc(lang)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {getProjectPageText.tabOthers(lang)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getProjectPageText.othersDesc(lang)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
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
    </div>
  );
}
