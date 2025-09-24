'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import ProjectProgress from '@/components/ui/project-progress';
import { getProjectPageText, getProjectStatusText } from '@/config/brand';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import { CalendarIcon, FileTextIcon, CreditCardIcon, BriefcaseIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';

interface ProjectDetailProps {
  project: ProjectTableRow;
  mode?: 'full' | 'compact'; // full: 전체화면, compact: 패널
  onClose?: () => void;
  onEdit?: () => void;
}

/**
 * ProjectDetail Component
 *
 * Reusable project detail component with tab structure
 * Used in both /projects/[id] page and DetailView panel
 *
 * Features:
 * - 4 tabs: Overview, Contract, Billing, Documents
 * - Responsive design for full/compact modes
 * - Fully integrated with centralized text system
 */
export default function ProjectDetail({
  project,
  mode = 'full',
  onClose,
  onEdit
}: ProjectDetailProps) {
  const lang = 'ko'; // TODO: 나중에 언어 설정과 연동

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
          {mode === 'full' && (
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  {getProjectPageText.edit(lang)}
                </Button>
              )}
              {onClose && (
                <Button variant="ghost" onClick={onClose}>
                  {getProjectPageText.close(lang)}
                </Button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            {getProjectPageText.tabOverview(lang)}
          </TabsTrigger>
          <TabsTrigger value="contract" disabled={!project.hasContract}>
            {getProjectPageText.tabContract(lang)}
          </TabsTrigger>
          <TabsTrigger value="billing" disabled={!project.hasBilling}>
            {getProjectPageText.tabBilling(lang)}
          </TabsTrigger>
          <TabsTrigger value="documents" disabled={!project.hasDocuments}>
            {getProjectPageText.tabDocuments(lang)}
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

        {/* Contract Tab */}
        <TabsContent value="contract">
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
                  {getProjectPageText.contractInfo(lang)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {project.hasContract
                    ? getProjectPageText.contractLoading(lang)
                    : getProjectPageText.contractEmpty(lang)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>{getProjectPageText.tabBilling(lang)}</CardTitle>
              <CardDescription>
                {getProjectPageText.billingDesc(lang)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {getProjectPageText.billingInfo(lang)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {project.hasBilling
                    ? getProjectPageText.billingLoading(lang)
                    : getProjectPageText.billingEmpty(lang)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>{getProjectPageText.tabDocuments(lang)}</CardTitle>
              <CardDescription>
                {getProjectPageText.documentsDesc(lang)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {getProjectPageText.documentInfo(lang)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {project.hasDocuments
                    ? getProjectPageText.documentsLoading(lang)
                    : getProjectPageText.documentsEmpty(lang)}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
