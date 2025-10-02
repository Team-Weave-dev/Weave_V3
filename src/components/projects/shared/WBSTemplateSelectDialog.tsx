'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { getProjectPageText, getWBSTemplateText, getWBSTemplateDescription } from '@/config/brand';
import type { WBSTemplateType } from '@/lib/types/project-table.types';

interface WBSTemplateSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (template: WBSTemplateType) => void;
}

/**
 * WBS 템플릿 선택 다이얼로그
 *
 * @description
 * - 4가지 템플릿 중 선택 (standard, consulting, education, custom 제외)
 * - 각 템플릿의 이름과 설명 표시
 * - 선택 후 확인 버튼으로 템플릿 작업 추가
 */
export function WBSTemplateSelectDialog({
  open,
  onOpenChange,
  onConfirm
}: WBSTemplateSelectDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<WBSTemplateType>('standard');
  const lang = 'ko';

  // custom 제외 (빈 템플릿이므로 빠른 추가에는 의미 없음)
  const templates: WBSTemplateType[] = ['standard', 'consulting', 'education'];

  const handleConfirm = () => {
    onConfirm(selectedTemplate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getProjectPageText.wbsQuickAddTitle(lang)}</DialogTitle>
          <DialogDescription>
            {getProjectPageText.wbsQuickAddDescription(lang)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedTemplate}
            onValueChange={(value) => setSelectedTemplate(value as WBSTemplateType)}
          >
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template}
                  className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem value={template} id={template} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={template}
                      className="text-base font-medium leading-none cursor-pointer"
                    >
                      {getWBSTemplateText(template, lang)}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      {getWBSTemplateDescription(template, lang)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {getProjectPageText.wbsQuickAddCancel(lang)}
          </Button>
          <Button onClick={handleConfirm}>
            {getProjectPageText.wbsQuickAddConfirm(lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
