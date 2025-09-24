'use client';

import { DeleteDialog } from '@/components/ui/dialogDelete';
import { getProjectPageText } from '@/config/brand';
import { Trash2Icon } from 'lucide-react';

interface DocumentDeleteDialogProps {
  open: boolean;
  mode: 'single' | 'bulk';
  targetName?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DocumentDeleteDialog({
  open,
  mode,
  targetName,
  onOpenChange,
  onConfirm
}: DocumentDeleteDialogProps) {
  const lang = 'ko';
  const title =
    mode === 'single'
      ? getProjectPageText.deleteSingleTitle(lang)
      : getProjectPageText.deleteBulkTitle(lang);
  const descriptionBase =
    mode === 'single'
      ? getProjectPageText.deleteSingleDescription(lang)
      : getProjectPageText.deleteBulkDescription(lang);
  const description =
    mode === 'single' && targetName
      ? `${descriptionBase} (${targetName})`
      : descriptionBase;

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
