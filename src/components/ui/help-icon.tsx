'use client';

import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpIconProps {
  /**
   * 도움말 설명 텍스트 (필수)
   */
  content: string;
  /**
   * 도움말 제목 (선택)
   */
  title?: string;
  /**
   * Popover 표시 위치
   * @default "top"
   */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * 아이콘 크기
   * @default "sm"
   */
  iconSize?: 'sm' | 'md' | 'lg';
  /**
   * 추가 CSS 클래스
   */
  className?: string;
  /**
   * 접근성 레이블
   */
  ariaLabel?: string;
}

const iconSizeClasses = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
};

/**
 * 재사용 가능한 도움말 아이콘 컴포넌트
 *
 * @description
 * - Popover 기반의 클릭형 도움말
 * - 중앙화된 스타일과 동작
 * - 텍스트는 brand.ts에서 가져와 props로 전달
 *
 * @example
 * ```tsx
 * import { HelpIcon } from '@/components/ui/help-icon';
 * import { getProjectPageText } from '@/config/brand';
 *
 * <HelpIcon
 *   content={getProjectPageText.taskProgressTooltip('ko')}
 *   ariaLabel="작업 진행률 설명"
 * />
 * ```
 */
export function HelpIcon({
  content,
  title,
  side = 'top',
  iconSize = 'sm',
  className,
  ariaLabel = '도움말'
}: HelpIconProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center text-muted-foreground hover:text-foreground transition-colors',
            className
          )}
          aria-label={ariaLabel}
        >
          <HelpCircle className={iconSizeClasses[iconSize]} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-sm p-3" side={side}>
        {title ? (
          <div className="space-y-2">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{content}</p>
          </div>
        ) : (
          <p className="text-xs">{content}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
