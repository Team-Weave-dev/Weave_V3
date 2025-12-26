"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

import { cn } from "@/lib/utils"
import { Chart, ChartContent, type ChartProps } from "@/components/ui/chart"
import { chart, chartTypes, cssVariables } from "@/config/constants"

const pieChartVariants = cva(
  "w-full h-full",
  {
    variants: {
      variant: {
        default: "fill-primary",
        donut: "fill-primary",
        minimal: "fill-muted-foreground/80"
      },
      animation: {
        none: "",
        smooth: "transition-all duration-300 ease-in-out",
        bounce: "transition-all duration-500 ease-bounce"
      }
    },
    defaultVariants: {
      variant: "default",
      animation: "smooth"
    }
  }
)

export interface PieChartData {
  /**
   * 라벨
   */
  name: string
  /**
   * 값
   */
  value: number
  /**
   * 색상 (선택사항)
   */
  color?: string
  /**
   * 추가 데이터
   */
  [key: string]: string | number | undefined
}

export interface PieChartProps
  extends Omit<ChartProps, "children" | "variant">,
    VariantProps<typeof pieChartVariants> {
  /**
   * 차트 데이터
   */
  data: PieChartData[]
  /**
   * 데이터 키
   */
  dataKey?: string
  /**
   * 이름 키
   */
  nameKey?: string
  /**
   * 파이 색상 배열
   */
  colors?: string[]
  /**
   * 외부 반지름
   */
  outerRadius?: number
  /**
   * 내부 반지름 (도넛 차트용)
   */
  innerRadius?: number
  /**
   * 시작 각도
   */
  startAngle?: number
  /**
   * 끝 각도
   */
  endAngle?: number
  /**
   * 라벨 표시 여부
   */
  showLabels?: boolean
  /**
   * 값 표시 여부
   */
  showValues?: boolean
  /**
   * 퍼센트 표시 여부
   */
  showPercent?: boolean
  /**
   * 툴팁 표시 여부
   */
  showTooltip?: boolean
  /**
   * 애니메이션 활성화 여부
   */
  animate?: boolean
  /**
   * 라벨 거리
   */
  labelOffset?: number
  /**
   * 커스텀 툴팁 컴포넌트
   */
  customTooltip?: React.ComponentType<any>
  /**
   * 커스텀 범례 컴포넌트
   */
  customLegend?: React.ComponentType<any>
  /**
   * 커스텀 라벨 컴포넌트
   */
  customLabel?: React.ComponentType<any>
}

const PieChart = React.forwardRef<HTMLDivElement, PieChartProps>(
  ({
    className,
    variant,
    animation,
    data,
    dataKey = "value",
    nameKey = "name",
    colors,
    outerRadius = chartTypes.pie.defaultRadius,
    innerRadius = chartTypes.pie.innerRadius,
    startAngle = 90,
    endAngle = 450,
    showLabels = false,
    showValues = false,
    showPercent = false,
    showTooltip = true,
    showLegend = false,
    animate = true,
    labelOffset: _labelOffset = chartTypes.pie.labelOffset,
    customTooltip,
    customLegend,
    customLabel,
    ...chartProps
  }, ref) => {
    // 색상 배열 생성
    const chartColors = React.useMemo(() => {
      if (colors) {
        return colors
      }
      return chart.colors.palette
    }, [colors])

    // 총합 계산 (퍼센트용)
    const total = React.useMemo(() =>
      data.reduce((sum, entry) => sum + entry.value, 0),
      [data]
    )

    // 커스텀 툴팁 컴포넌트
    const CustomTooltip = customTooltip || (({ active, payload }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload
        const percent = ((data.value / total) * 100).toFixed(1)

        return (
          <div className={cn(
            chart.tooltip.background,
            chart.tooltip.border,
            chart.tooltip.padding,
            chart.tooltip.fontSize
          )}>
            <p className="font-medium" style={{ color: cssVariables.recharts.tooltip.textColor }}>{data.name}</p>
            <p style={{ color: cssVariables.recharts.tooltip.textColor }}>
              <span className="font-medium">값:</span> {data.value}
            </p>
            <p style={{ color: cssVariables.recharts.tooltip.textColor }}>
              <span className="font-medium">비율:</span> {percent}%
            </p>
          </div>
        )
      }
      return null
    })

    // 커스텀 라벨 컴포넌트
    const CustomLabel = customLabel || (({ cx, cy, midAngle, innerRadius, outerRadius, percent, index: _index, name, value }: any) => {
      if (!showLabels && !showValues && !showPercent) return null

      const RADIAN = Math.PI / 180
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + radius * Math.sin(-midAngle * RADIAN)

      let labelText = ""
      if (showLabels) labelText += name
      if (showValues) labelText += showLabels ? `: ${value}` : value
      if (showPercent) labelText += ` (${(percent * 100).toFixed(0)}%)`

      return (
        <text
          x={x}
          y={y}
          fill={cssVariables.colors.foreground}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          className="text-xs font-medium"
        >
          {labelText}
        </text>
      )
    })

    // 범례 데이터 생성
    const _legendData = data.map((entry, index) => ({
      value: entry.name,
      type: 'square',
      color: entry.color || chartColors[index % chartColors.length]
    }))

    // 커스텀 범례 컴포넌트
    const CustomLegend = customLegend || (({ payload }: any) => {
      if (!payload || !payload.length) return null

      return (
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span
                className="text-sm"
                style={{ color: cssVariables.recharts.legend.textColor }}
              >
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      )
    })

    return (
      <Chart ref={ref} {...chartProps}>
        <ChartContent className={cn(pieChartVariants({ variant, animation }), className)}>
          <ResponsiveContainer width="100%" height={showLegend ? "85%" : "100%"}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy={showLegend ? "40%" : "50%"}
                labelLine={false}
                label={showLabels || showValues || showPercent ? <CustomLabel /> : false}
                outerRadius={outerRadius}
                innerRadius={variant === "donut" ? outerRadius * 0.6 : innerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
                isAnimationActive={animate}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && (
                <Legend
                  content={<CustomLegend />}
                  wrapperStyle={{
                    fontSize: cssVariables.recharts.legend.fontSize,
                    paddingTop: "0px"
                  }}
                />
              )}
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartContent>
      </Chart>
    )
  }
)
PieChart.displayName = "PieChart"

export { PieChart, pieChartVariants }