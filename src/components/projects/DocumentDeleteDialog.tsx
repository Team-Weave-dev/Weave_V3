'use client';

import { DeleteDialog } from '@/components/ui/dialogDelete';
import { getProjectPageText } from '@/config/brand';
import { Trash2Icon } from 'lucide-react';

interface DocumentDeleteDialogProps {
  open: boolean;
  mode: 'single' | 'bulk';
  targetName?: string;
  customTitle?: string; // 커스텀 제목 (optional)
  customDescription?: string; // 커스텀 설명 (optional)
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DocumentDeleteDialog({
  open,
  mode,
  targetName,
  customTitle,
  customDescription,
  onOpenChange,
  onConfirm
}: DocumentDeleteDialogProps) {
  const lang = 'ko';
  const defaultTitle =
    mode === 'single'
      ? getProjectPageText.deleteSingleTitle(lang)
      : getProjectPageText.deleteBulkTitle(lang);
  const defaultDescriptionBase =
    mode === 'single'
      ? getProjectPageText.deleteSingleDescription(lang)
      : getProjectPageText.deleteBulkDescription(lang);
  const defaultDescription =
    mode === 'single' && targetName
      ? `${defaultDescriptionBase} (${targetName})`
      : defaultDescriptionBase;

  // customTitle/customDescription이 있으면 사용, 없으면 기본값 사용
  const title = customTitle || defaultTitle;
  const description = customDescription || defaultDescription;

  return (
    <DeleteDialog
      open={open}
      title={title}
      description={description}
      cancelLabel={getProjectPageText.deleteCancelLabel(lang)}
      confirmLabel={getProjectPageText.deleteConfirmLabel(lang)}
      icon={<Trash2Icon className="h-8 w-8 text-destructive" />}
      borderClassName="border-2 border-primary"
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
