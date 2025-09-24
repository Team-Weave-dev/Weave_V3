'use client';

import { useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ProjectTableRow } from '@/lib/types/project-table.types';
import {
  getTemplatesForCategory,
  type GeneratedDocumentPayload,
  type ProjectDocumentCategory,
  type ProjectDocumentTemplate
} from '@/lib/document-generator/templates';

interface ProjectDocumentGeneratorModalProps {
  open: boolean;
  category: ProjectDocumentCategory;
  project: ProjectTableRow;
  onOpenChange: (open: boolean) => void;
  onGenerate: (payload: GeneratedDocumentPayload) => void;
}

export default function ProjectDocumentGeneratorModal({
  open,
  category,
  project,
  onOpenChange,
  onGenerate
}: ProjectDocumentGeneratorModalProps) {
  const templates = useMemo<ProjectDocumentTemplate[]>(() => getTemplatesForCategory(category), [category]);

  const handleGenerate = (template: ProjectDocumentTemplate) => {
    const payload = template.build({ project });
    onGenerate(payload);
  };

  const categoryLabelMap: Record<ProjectDocumentCategory, string> = {
    contract: '계약서',
    invoice: '청구서/세금계산서',
    estimate: '견적서',
    report: '보고서',
    others: '기타 문서'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>{categoryLabelMap[category]} 템플릿 선택</DialogTitle>
          <DialogDescription>
            프로젝트 정보를 기반으로 템플릿을 채워 새 문서를 생성합니다. 생성 후 내용은 문서관리 탭에서 확인하고 수정할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-4">
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                선택한 카테고리에 사용할 수 있는 템플릿이 아직 없습니다. 필요하다면 새 템플릿을 추가해 주세요.
              </p>
            )}
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4 space-y-3 bg-muted/10">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold leading-tight">{template.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <Badge key={`${template.id}-${tag}`} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <p className="text-xs text-muted-foreground">템플릿 ID: {template.id}</p>
                  <Button size="sm" onClick={() => handleGenerate(template)}>
                    생성하기
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
