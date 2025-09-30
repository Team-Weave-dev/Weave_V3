'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
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
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectDocumentTemplate | null>(null);
  const [previewPayload, setPreviewPayload] = useState<GeneratedDocumentPayload | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const handlePreview = (template: ProjectDocumentTemplate) => {
    const payload = template.build({ project });
    setSelectedTemplate(template);
    setPreviewPayload(payload);
    setPreviewContent(payload.content);
    setIsPreviewOpen(true);
  };

  const handleGenerate = () => {
    if (!selectedTemplate || !previewPayload) {
      toast({
        title: '템플릿을 먼저 선택하세요',
        description: '문서를 생성할 템플릿을 선택 후 생성 버튼을 눌러주세요.'
      });
      return;
    }

    const customizedPayload = {
      ...previewPayload,
      content: previewContent || previewPayload.content
    };
    onGenerate(customizedPayload);
    setSelectedTemplate(null);
    setPreviewPayload(null);
    setPreviewContent('');
    setIsPreviewOpen(false);
    onOpenChange(false);
  };

  const categoryLabelMap: Record<ProjectDocumentCategory, string> = {
    contract: '계약서',
    invoice: '청구서/세금계산서',
    estimate: '견적서',
    report: '보고서',
    others: '기타 문서'
  };

  return (
    <>
      <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSelectedTemplate(null);
          setPreviewPayload(null);
          setPreviewContent('');
          setIsPreviewOpen(false);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl border-2 border-primary">
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
            {templates.map((template) => {
              const isSelected = template.id === selectedTemplate?.id;
              return (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 space-y-3 transition-colors ${isSelected ? 'bg-primary/5 border-primary' : 'bg-muted/10'}`}
                >
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
                    <Button size="sm" variant={isSelected ? 'secondary' : 'outline'} onClick={() => handlePreview(template)}>
                      미리보기
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>

      <Dialog
      open={isPreviewOpen}
      onOpenChange={(next) => {
        if (!next) {
          setIsPreviewOpen(false);
          setPreviewPayload(null);
          setPreviewContent('');
          setSelectedTemplate(null);
        }
      }}
    >
      <DialogContent className="max-w-3xl border-2 border-primary">
        <DialogHeader>
          <DialogTitle>{previewPayload?.name ?? '문서 미리보기'}</DialogTitle>
          <DialogDescription>
            생성 전에 내용을 확인하고 필요한 경우 수정한 뒤 생성 버튼을 눌러주세요.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={previewContent}
          onChange={(event) => setPreviewContent(event.target.value)}
          className="min-h-[320px]"
          placeholder="문서 내용을 입력하세요"
        />
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsPreviewOpen(false);
              setPreviewPayload(null);
              setPreviewContent('');
              setSelectedTemplate(null);
            }}
          >
            취소
          </Button>
          <Button onClick={handleGenerate}>
            생성하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
