/**
 * StarRating Component
 * 별점 선택 UI 컴포넌트
 */

'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StarRating Props
 */
export interface StarRatingProps {
  /** 현재 선택된 별점 (0-5) */
  rating: number;
  /** 별점 변경 콜백 */
  onRatingChange: (rating: number) => void;
  /** 크기 옵션 */
  size?: 'sm' | 'md' | 'lg';
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 크기별 스타일 매핑
 */
const SIZE_STYLES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const;

/**
 * StarRating Component
 *
 * @example
 * ```tsx
 * <StarRating
 *   rating={rating}
 *   onRatingChange={setRating}
 *   size="md"
 * />
 * ```
 */
export function StarRating({
  rating,
  onRatingChange,
  size = 'md',
  disabled = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);

  /**
   * 별 클릭 핸들러
   */
  const handleClick = (selectedRating: number) => {
    if (disabled) return;
    onRatingChange(selectedRating);
  };

  /**
   * 마우스 호버 핸들러
   */
  const handleMouseEnter = (selectedRating: number) => {
    if (disabled) return;
    setHoverRating(selectedRating);
  };

  /**
   * 마우스 떠남 핸들러
   */
  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverRating(0);
  };

  /**
   * 현재 표시할 별점 (hover 우선)
   */
  const displayRating = hoverRating || rating;

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="radiogroup"
      aria-label="별점 선택"
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={starValue}
            type="button"
            role="radio"
            aria-checked={starValue === rating}
            aria-label={`${starValue}점`}
            disabled={disabled}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            className={cn(
              'transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500 rounded',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                SIZE_STYLES[size],
                'transition-colors duration-150',
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300 hover:text-yellow-300'
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
