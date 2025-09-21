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
        // 프로젝트 상태 variants
        'project-review':
          "border-transparent bg-project-review text-project-review-foreground hover:bg-project-review/80",
        'project-complete':
          "border-transparent bg-project-complete text-project-complete-foreground hover:bg-project-complete/80",
        'project-cancelled':
          "border-transparent bg-project-cancelled text-project-cancelled-foreground hover:bg-project-cancelled/80",
        'project-planning':
          "border-transparent bg-project-planning text-project-planning-foreground hover:bg-project-planning/80",
        'project-onhold':
          "border-transparent bg-project-onhold text-project-onhold-foreground hover:bg-project-onhold/80",
        'project-inprogress':
          "border-transparent bg-project-inprogress text-project-inprogress-foreground hover:bg-project-inprogress/80",
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
