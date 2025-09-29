import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-muted text-muted-foreground",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        error:
          "border-transparent bg-error text-error-foreground hover:bg-error/80",
        info:
          "border-transparent bg-info text-info-foreground hover:bg-info/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "text-foreground",
        // 프로젝트/수금 상태용 소프트 배지 (기존 스타일 복원)
        'status-soft-success': "bg-green-100 text-green-700 border border-green-200",
        'status-soft-warning': "bg-yellow-100 text-yellow-700 border border-yellow-200",
        'status-soft-error': "bg-red-100 text-red-700 border border-red-200",
        'status-soft-info': "bg-blue-100 text-blue-700 border border-blue-200",
        'status-soft-planning': "bg-gray-100 text-gray-700 border border-gray-200",
        'status-soft-inprogress': "bg-blue-100 text-blue-700 border border-blue-200",
        'status-soft-review': "bg-yellow-100 text-yellow-700 border border-yellow-200",
        'status-soft-completed': "bg-green-100 text-green-700 border border-green-200",
        'status-soft-onhold': "bg-orange-100 text-orange-700 border border-orange-200",
        'status-soft-cancelled': "bg-red-100 text-red-700 border border-red-200",
        // TodoListWidget 전용 날짜 배지 (개선된 스타일)
        'date-soft-error': "bg-error/20 text-error border border-error/30",
        'date-soft-warning': "bg-warning/20 text-warning border border-warning/30",
        'date-soft-info': "bg-info/20 text-info border border-info/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
