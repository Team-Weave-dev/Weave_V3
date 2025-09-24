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

interface DeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onOpenChange,
  onConfirm
}: DeleteDialogProps) {
  const lang = 'ko';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-2 border-primary">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelLabel ?? getProjectPageText.deleteCancelLabel(lang)}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel ?? getProjectPageText.deleteConfirmLabel(lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
