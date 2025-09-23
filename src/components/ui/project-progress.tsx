'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProjectProgressProps {
  value: number;
  className?: string;
  trackClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  variant?: 'primary' | 'success';
  labelPlacement?: 'top' | 'bottom';
  labelClassName?: string;
}

/**
 * ProjectProgress Component
 *
 * Enhanced progress bar for project pages with:
 * - Color-coded progress levels
 * - Optional animation
 * - Size variants
 * - Optional percentage label
 */
export default function ProjectProgress({
  value,
  className,
  trackClassName,
  showLabel = false,
  size = 'md',
  animated = true,
  variant = 'primary',
  labelPlacement = 'top',
  labelClassName,
}: ProjectProgressProps) {
  const clampedValue = Math.max(0, Math.min(100, value || 0));

  const getProgressColor = (progress: number) => {
    if (variant === 'success') {
      return 'bg-primary';
    }
    if (progress >= 80) return 'bg-primary';
    if (progress >= 60) return 'bg-primary/80';
    if (progress >= 40) return 'bg-primary/60';
    if (progress >= 20) return 'bg-primary/40';
    return 'bg-destructive';
  };

  // Get size classes - consistent with components page
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-1';
      case 'lg':
        return 'h-3';
      case 'md':
      default:
        return 'h-2';
    }
  };

  const progressColor = getProgressColor(clampedValue);
  const sizeClass = getSizeClasses();

  const labelClasses = cn(
    'block text-xs font-medium text-muted-foreground text-center',
    labelClassName
  );

  return (
    <div className={cn('w-full', className)}>
      {showLabel && labelPlacement === 'top' && (
        <span className={cn(labelClasses, 'mb-1')}>
          {clampedValue}%
        </span>
      )}
      <div className={cn(
        "relative w-full overflow-hidden rounded-full bg-white border border-border",
        sizeClass,
        trackClassName
      )}>
        <div
          className={cn(
            "h-full w-full flex-1 transition-all",
            progressColor,
            animated && "duration-500 ease-out"
          )}
          style={{
            transform: `translateX(-${100 - clampedValue}%)`
          }}
        >
          {/* Optional animated shimmer effect */}
          {animated && clampedValue > 0 && clampedValue < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
      {showLabel && labelPlacement === 'bottom' && (
        <span className={cn(labelClasses, 'mt-1')}>
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
