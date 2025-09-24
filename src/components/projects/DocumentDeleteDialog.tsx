'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border border-primary">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {getProjectPageText.deleteCancelLabel(lang)}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {getProjectPageText.deleteConfirmLabel(lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
