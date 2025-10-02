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
import { getDashboardText } from '@/config/brand';

interface ConfirmDialogProps {
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

export function ConfirmDialog({
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
}: ConfirmDialogProps) {
  const lang = 'ko';
  const borderClass = borderClassName ?? 'border-2 border-primary';
  const confirmBtnVariant = confirmVariant ?? 'default';
  const cancelBtnVariant = cancelVariant ?? 'secondary';

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md ${borderClass}`}>
        <DialogHeader>
          {icon ? <div className="mb-2 flex items-center justify-center">{icon}</div> : null}
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="whitespace-pre-line">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={cancelBtnVariant} onClick={() => onOpenChange(false)}>
            {cancelLabel ?? '취소'}
          </Button>
          <Button variant={confirmBtnVariant} onClick={handleConfirm}>
            {confirmLabel ?? '확인'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
