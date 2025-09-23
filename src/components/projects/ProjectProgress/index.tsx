'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProjectProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
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
  showLabel = false,
  size = 'md',
  animated = true
}: ProjectProgressProps) {
  // Get color based on progress value using system colors
  const getProgressColor = (progress: number) => {
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

  const progressColor = getProgressColor(value);
  const sizeClass = getSizeClasses();

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">
            {value}%
          </span>
        </div>
      )}
      <div className={cn(
        "relative w-full overflow-hidden rounded-full bg-secondary",
        sizeClass,
        className
      )}>
        <div
          className={cn(
            "h-full w-full flex-1 transition-all",
            progressColor,
            animated && "duration-500 ease-out"
          )}
          style={{
            transform: `translateX(-${100 - (value || 0)}%)`
          }}
        >
          {/* Optional animated shimmer effect */}
          {animated && value > 0 && value < 100 && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
}