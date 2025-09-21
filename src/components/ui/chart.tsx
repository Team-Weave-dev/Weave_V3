"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { chart } from "@/config/constants"

const chartVariants = cva(
  cn(
    "w-full",
    chart.container.padding,
    chart.container.radius,
    chart.container.background,
    chart.container.border
  ),
  {
    variants: {
      variant: {
        default: "bg-card border-border",
        ghost: "bg-transparent border-0 shadow-none",
        outline: "bg-transparent border-border"
      },
      size: {
        sm: cn(chart.container.minHeight, "p-2"),
        default: cn(chart.container.defaultHeight, chart.container.padding),
        lg: cn(chart.container.maxHeight, "p-6")
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

const chartHeaderVariants = cva(
  "flex items-center justify-between mb-4",
  {
    variants: {
      size: {
        sm: "mb-2",
        default: "mb-4",
        lg: "mb-6"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const chartTitleVariants = cva(
  "font-semibold",
  {
    variants: {
      size: {
        sm: "text-sm",
        default: "text-base",
        lg: "text-lg"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const chartDescriptionVariants = cva(
  "text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-sm"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const chartContentVariants = cva(
  "h-full w-full",
  {
    variants: {
      size: {
        sm: "h-[180px]",
        default: "h-[270px]",
        lg: "h-[370px]"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)

const chartLegendVariants = cva(
  cn(
    "flex flex-wrap items-center justify-center",
    chart.legend.padding,
    chart.legend.itemSpacing,
    chart.legend.fontSize
  ),
  {
    variants: {
      position: {
        top: "order-first mb-4",
        bottom: "order-last mt-4",
        left: "flex-col items-start mr-4",
        right: "flex-col items-end ml-4"
      }
    },
    defaultVariants: {
      position: "bottom"
    }
  }
)

export interface ChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartVariants> {
  /**
   * 차트 제목
   */
  title?: string
  /**
   * 차트 설명
   */
  description?: string
  /**
   * 범례 표시 여부
   */
  showLegend?: boolean
  /**
   * 범례 위치
   */
  legendPosition?: VariantProps<typeof chartLegendVariants>["position"]
  /**
   * 차트 내용
   */
  children: React.ReactNode
}

export interface ChartHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartHeaderVariants> {
  /**
   * 헤더 내용
   */
  children: React.ReactNode
}

export interface ChartTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof chartTitleVariants> {
  /**
   * 제목 텍스트
   */
  children: React.ReactNode
}

export interface ChartDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof chartDescriptionVariants> {
  /**
   * 설명 텍스트
   */
  children: React.ReactNode
}

export interface ChartContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartContentVariants> {
  /**
   * 차트 내용
   */
  children: React.ReactNode
}

export interface ChartLegendProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chartLegendVariants> {
  /**
   * 범례 내용
   */
  children?: React.ReactNode
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({
    className,
    variant,
    size,
    title,
    description,
    showLegend = false,
    legendPosition = "bottom",
    children,
    ...props
  }, ref) => {
    const hasHeader = title || description

    return (
      <div
        ref={ref}
        className={cn(chartVariants({ variant, size }), className)}
        {...props}
      >
        {hasHeader && (
          <ChartHeader size={size}>
            {title && <ChartTitle size={size}>{title}</ChartTitle>}
            {description && <ChartDescription size={size}>{description}</ChartDescription>}
          </ChartHeader>
        )}
        <ChartContent size={size}>
          {children}
        </ChartContent>
        {showLegend && (
          <ChartLegend position={legendPosition}>
            {/* 범례 내용은 각 차트 컴포넌트에서 구현 */}
          </ChartLegend>
        )}
      </div>
    )
  }
)
Chart.displayName = "Chart"

const ChartHeader = React.forwardRef<HTMLDivElement, ChartHeaderProps>(
  ({ className, size, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(chartHeaderVariants({ size }), className)}
      {...props}
    >
      {children}
    </div>
  )
)
ChartHeader.displayName = "ChartHeader"

const ChartTitle = React.forwardRef<HTMLHeadingElement, ChartTitleProps>(
  ({ className, size, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(chartTitleVariants({ size }), className)}
      {...props}
    >
      {children}
    </h3>
  )
)
ChartTitle.displayName = "ChartTitle"

const ChartDescription = React.forwardRef<HTMLParagraphElement, ChartDescriptionProps>(
  ({ className, size, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(chartDescriptionVariants({ size }), className)}
      {...props}
    >
      {children}
    </p>
  )
)
ChartDescription.displayName = "ChartDescription"

const ChartContent = React.forwardRef<HTMLDivElement, ChartContentProps>(
  ({ className, size, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(chartContentVariants({ size }), className)}
      {...props}
    >
      {children}
    </div>
  )
)
ChartContent.displayName = "ChartContent"

const ChartLegend = React.forwardRef<HTMLDivElement, ChartLegendProps>(
  ({ className, position, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(chartLegendVariants({ position }), className)}
      {...props}
    >
      {children}
    </div>
  )
)
ChartLegend.displayName = "ChartLegend"

export {
  Chart,
  ChartHeader,
  ChartTitle,
  ChartDescription,
  ChartContent,
  ChartLegend,
  chartVariants,
  chartHeaderVariants,
  chartTitleVariants,
  chartDescriptionVariants,
  chartContentVariants,
  chartLegendVariants
}