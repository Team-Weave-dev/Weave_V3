'use client';

import { DeleteDialog } from '@/components/ui/dialogDelete';
import { getProjectPageText } from '@/config/brand';

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
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
