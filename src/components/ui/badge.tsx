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
        // CSS 변수를 활용한 소프트 상태 색상
        'status-soft-success': "bg-success/20 text-success border border-success/30",
        'status-soft-warning': "bg-warning/20 text-warning border border-warning/30",
        'status-soft-error': "bg-error/20 text-error border border-error/30",
        'status-soft-info': "bg-info/20 text-info border border-info/30",
        // CSS 변수를 활용한 프로젝트 상태 색상
        'status-soft-planning': "bg-project-planning/20 text-project-planning-foreground border border-project-planning/30",
        'status-soft-inprogress': "bg-project-inprogress/20 text-project-inprogress-foreground border border-project-inprogress/30",
        'status-soft-review': "bg-project-review/20 text-project-review-foreground border border-project-review/30",
        'status-soft-completed': "bg-project-complete/20 text-project-complete-foreground border border-project-complete/30",
        'status-soft-onhold': "bg-project-onhold/20 text-project-onhold-foreground border border-project-onhold/30",
        'status-soft-cancelled': "bg-project-cancelled/20 text-project-cancelled-foreground border border-project-cancelled/30",
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
