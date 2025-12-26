import * as React from "react"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { getLoadingText } from "@/config/brand"
import { defaults } from "@/config/constants"

const loadingButtonVariants = cva("", {
  variants: {
    loadingPlacement: {
      left: "flex-row",
      right: "flex-row-reverse",
      center: "flex-col",
    },
  },
  defaultVariants: {
    loadingPlacement: "left",
  },
})

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants>,
    VariantProps<typeof loadingButtonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  children?: React.ReactNode
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({
    className,
    variant,
    size,
    asChild = false,
    loading = false,
    loadingText,
    loadingPlacement = "left",
    disabled,
    children,
    ...props
  }, ref) => {
    // 기본 로딩 텍스트는 중앙화 시스템에서 가져옴
    const defaultLoadingText = getLoadingText.pleaseWait()
    const displayText = loadingText || defaultLoadingText

    // 로딩 중이거나 disabled일 때 버튼 비활성화
    const isDisabled = loading || disabled

    return (
      <Button
        className={cn(
          loadingButtonVariants({ loadingPlacement }),
          loading && "cursor-not-allowed",
          className
        )}
        variant={variant}
        size={size}
        asChild={asChild}
        disabled={isDisabled}
        ref={ref}
        aria-describedby={loading ? "loading-state" : undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2
              className={cn(
                "h-4 w-4",
                defaults.animation.spin,
                loadingPlacement === "right" && "ml-2",
                loadingPlacement === "left" && "mr-2"
              )}
              aria-hidden="true"
            />
            <span id="loading-state" className="sr-only">
              Loading, please wait
            </span>
            {loadingPlacement !== "center" && (
              <span>{displayText}</span>
            )}
            {loadingPlacement === "center" && (
              <span className="mt-1 text-xs">{displayText}</span>
            )}
          </>
        ) : (
          children
        )}
      </Button>
    )
  }
)

LoadingButton.displayName = "LoadingButton"

export { LoadingButton, loadingButtonVariants }