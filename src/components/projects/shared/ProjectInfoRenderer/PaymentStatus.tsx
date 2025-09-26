'use client';

import React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPaymentStatusText } from '@/config/brand';
import type { PaymentStatus as PaymentStatusType, ProjectTableRow } from '@/lib/types/project-table.types';
import { cn } from '@/lib/utils';

interface PaymentStatusProps {
  project: ProjectTableRow;
  mode: 'table' | 'card' | 'detail';
  isEditing?: boolean;
  onValueChange?: (value: PaymentStatusType) => void;
  className?: string;
  lang?: 'ko' | 'en';
}

/**
 * 공통 수금상태 컴포넌트
 * 모든 뷰모드(ListView, DetailView, ProjectDetail)에서 일관된 수금상태 표시
 */
export function PaymentStatus({
  project,
  mode,
  isEditing = false,
  onValueChange,
  className,
  lang = 'ko'
}: PaymentStatusProps) {
  const paymentStatus = project.paymentStatus || 'not_started';

  // 모드별 스타일링
  const modeStyles = {
    table: 'text-xs',
    card: 'text-xs',
    detail: 'text-xs'
  };

  // 편집 모드일 때 Select 컴포넌트 표시
  if (isEditing && onValueChange) {
    return (
      <Select
        value={paymentStatus}
        onValueChange={onValueChange}
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="not_started">
            {getPaymentStatusText.not_started(lang)}
          </SelectItem>
          <SelectItem value="advance_completed">
            {getPaymentStatusText.advance_completed(lang)}
          </SelectItem>
          <SelectItem value="interim_completed">
            {getPaymentStatusText.interim_completed(lang)}
          </SelectItem>
          <SelectItem value="final_completed">
            {getPaymentStatusText.final_completed(lang)}
          </SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // 읽기 전용 모드일 때 Badge 컴포넌트 표시
  const badgeVariant: BadgeProps['variant'] = paymentStatus === 'not_started' ? 'secondary' : 'default';

  return (
    <Badge
      variant={badgeVariant}
      className={cn(modeStyles[mode], className)}
    >
      {getPaymentStatusText[paymentStatus](lang)}
    </Badge>
  );
}

export default PaymentStatus;