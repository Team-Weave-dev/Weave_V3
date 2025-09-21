"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot
} from "recharts"

import { cn } from "@/lib/utils"
import { Chart, ChartContent, type ChartProps } from "@/components/ui/chart"
import { chart, chartTypes, cssVariables } from "@/config/constants"

const lineChartVariants = cva(
  "w-full h-full",
  {
    variants: {
      variant: {
        default: "stroke-primary",
        smooth: "stroke-primary",
        dashed: "stroke-primary stroke-dasharray-[5,5]",
        dotted: "stroke-primary stroke-dasharray-[2,2]"
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

export interface LineChartData {
  /**
   * X축 라벨
   */
  name: string
  /**
   * Y축 값
   */
  value: number
  /**
   * 추가 데이터 (멀티 시리즈용)
   */
  [key: string]: string | number
}

export interface LineChartProps
  extends Omit<ChartProps, "children" | "variant" | "color">,
    VariantProps<typeof lineChartVariants> {
  /**
   * 차트 데이터
   */
  data: LineChartData[]
  /**
   * 데이터 키 (멀티 시리즈의 경우 배열)
   */
  dataKey?: string | string[]
  /**
   * X축 키
   */
  xAxisKey?: string
  /**
   * 선 색상
   */
  color?: string | string[]
  /**
   * 선 두께
   */
  strokeWidth?: number
  /**
   * 점 크기
   */
  dotSize?: number
  /**
   * 격자 표시 여부
   */
  showGrid?: boolean
  /**
   * 축 표시 여부
   */
  showAxis?: boolean
  /**
   * 툴팁 표시 여부
   */
  showTooltip?: boolean
  /**
   * 점 표시 여부
   */
  showDots?: boolean
  /**
   * 애니메이션 활성화 여부
   */
  animate?: boolean
  /**
   * 곡선 스무딩 여부
   */
  smooth?: boolean
  /**
   * 영역 채우기 여부
   */
  fillArea?: boolean
  /**
   * 커스텀 툴팁 컴포넌트
   */
  customTooltip?: React.ComponentType<any>
  /**
   * 커스텀 범례 컴포넌트
   */
  customLegend?: React.ComponentType<any>
  /**
   * 커스텀 점 컴포넌트
   */
  customDot?: React.ComponentType<any>
}

const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  ({
    className,
    variant,
    animation,
    data,
    dataKey = "value",
    xAxisKey = "name",
    color,
    strokeWidth = chartTypes.line.defaultStroke,
    dotSize = chartTypes.line.defaultRadius,
    showGrid = true,
    showAxis = true,
    showTooltip = true,
    showLegend = false,
    showDots = true,
    animate = true,
    smooth = chartTypes.line.smoothing,
    fillArea = false,
    customTooltip,
    customLegend,
    customDot,
    ...chartProps
  }, ref) => {
    // 데이터 키가 배열인지 확인 (멀티 시리즈)
    const isMultiSeries = Array.isArray(dataKey)
    const dataKeys = isMultiSeries ? dataKey : [dataKey]

    // 색상 배열 생성
    const colors = React.useMemo(() => {
      if (Array.isArray(color)) {
        return color
      }
      if (color) {
        return [color]
      }
      return chart.colors.palette.slice(0, dataKeys.length)
    }, [color, dataKeys.length])

    // 커스텀 툴팁 컴포넌트
    const CustomTooltip = customTooltip || (({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className={cn(
            chart.tooltip.background,
            chart.tooltip.border,
            chart.tooltip.padding,
            chart.tooltip.fontSize
          )}>
            <p className="font-medium" style={{ color: cssVariables.recharts.tooltip.textColor }}>{label}</p>
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: cssVariables.recharts.tooltip.textColor }}>
                <span className="font-medium" style={{ color: cssVariables.recharts.tooltip.textColor }}>
                  {entry.dataKey}:
                </span>
                {" "}{entry.value}
              </p>
            ))}
          </div>
        )
      }
      return null
    })

    // 커스텀 점 컴포넌트
    const CustomDot = customDot || ((props: any) => {
      const { cx, cy, fill } = props
      return <Dot cx={cx} cy={cy} r={dotSize} fill={fill} />
    })

    return (
      <Chart ref={ref} {...chartProps}>
        <ChartContent className={cn(lineChartVariants({ variant, animation }), className)}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{ top: 40, right: 15, left: 10, bottom: 40 }}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray={chart.grid.strokeDasharray}
                  stroke={chart.grid.strokeColor}
                  strokeWidth={chart.grid.strokeWidth}
                />
              )}
              {showAxis && (
                <>
                  <XAxis
                    dataKey={xAxisKey}
                    tick={{
                      fontSize: parseInt(chart.axis.fontSize.replace(/\D/g, '')),
                      fill: chart.axis.color
                    }}
                    tickMargin={chart.axis.tickMargin}
                  />
                  <YAxis
                    tick={{
                      fontSize: parseInt(chart.axis.fontSize.replace(/\D/g, '')),
                      fill: chart.axis.color
                    }}
                    tickMargin={chart.axis.tickMargin}
                  />
                </>
              )}
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && customLegend && (
                <Legend
                  content={customLegend as any}
                  wrapperStyle={{
                    fontSize: chart.legend.fontSize.replace('text-', ''),
                    paddingTop: parseInt(chart.legend.padding.replace(/\D/g, ''))
                  }}
                />
              )}
              {showLegend && !customLegend && (
                <Legend
                  wrapperStyle={{
                    fontSize: chart.legend.fontSize.replace('text-', ''),
                    paddingTop: parseInt(chart.legend.padding.replace(/\D/g, '')),
                    color: cssVariables.recharts.legend.textColor
                  }}
                />
              )}
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type={smooth ? "monotone" : "linear"}
                  dataKey={key}
                  stroke={colors[index] || colors[0]}
                  strokeWidth={strokeWidth}
                  fill={fillArea ? colors[index] || colors[0] : "none"}
                  fillOpacity={fillArea ? 0.3 : 0}
                  dot={showDots ? <CustomDot /> : false}
                  isAnimationActive={animate}
                  activeDot={{ r: dotSize + 2, stroke: colors[index] || colors[0], strokeWidth: 2 }}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartContent>
      </Chart>
    )
  }
)
LineChart.displayName = "LineChart"

export { LineChart, lineChartVariants }