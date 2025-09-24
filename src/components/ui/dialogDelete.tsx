'use client';

import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';
import { getProjectPageText } from '@/config/brand';

interface DeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: ReactNode;
  borderClassName?: string;
  confirmVariant?: ButtonProps['variant'];
  cancelVariant?: ButtonProps['variant'];
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  icon,
  borderClassName,
  confirmVariant,
  cancelVariant,
  onOpenChange,
  onConfirm
}: DeleteDialogProps) {
  const lang = 'ko';
  const borderClass = borderClassName ?? 'border-2 border-primary';
  const confirmBtnVariant = confirmVariant ?? 'destructive';
  const cancelBtnVariant = cancelVariant ?? 'secondary';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md ${borderClass}`}>
        <DialogHeader>
          {icon ? <div className="mb-2 flex items-center justify-center text-destructive">{icon}</div> : null}
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={cancelBtnVariant} onClick={() => onOpenChange(false)}>
            {cancelLabel ?? getProjectPageText.deleteCancelLabel(lang)}
          </Button>
          <Button variant={confirmBtnVariant} onClick={onConfirm}>
            {confirmLabel ?? getProjectPageText.deleteConfirmLabel(lang)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
