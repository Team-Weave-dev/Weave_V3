import React from 'react';

/**
 * BaseStatCard Props
 * 모든 통계 카드의 기본 컨테이너 Props
 */
export interface BaseStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;  // hover 효과 활성화 여부 (기본값: false)
}

/**
 * SimpleStatCard Props
 * 기본 통계 카드 Props
 */
export interface SimpleStatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  bgColor?: string;       // 아이콘 배경색 (예: bg-blue-50)
  valueColor?: string;    // 값 텍스트 색상 (예: text-purple-600)
  layout?: 'horizontal' | 'vertical';  // 레이아웃 변형 (기본값: horizontal)
  enableHover?: boolean;  // hover 효과 활성화 여부 (기본값: false)
}

/**
 * BaseStatCard Component
 *
 * 모든 통계 카드의 공통 스타일을 제공하는 기본 래퍼 컴포넌트
 *
 * Features:
 * - 일관된 배경, 테두리, 패딩 스타일
 * - 선택적 hover 효과 (border 강조 + shadow)
 * - 커스텀 className 지원
 * - ref 전달 지원 (Tooltip 등과 호환)
 *
 * @example
 * <BaseStatCard enableHover>
 *   <div>커스텀 콘텐츠</div>
 * </BaseStatCard>
 */
export const BaseStatCard = React.forwardRef<HTMLDivElement, BaseStatCardProps>(
  ({ children, className = '', enableHover = false, ...props }, ref) => {
    const hoverClasses = enableHover
      ? 'cursor-help transition-all hover:border-primary/50 hover:shadow-sm'
      : '';

    return (
      <div
        ref={ref}
        className={`bg-background rounded-lg border p-4 ${hoverClasses} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BaseStatCard.displayName = 'BaseStatCard';

/**
 * SimpleStatCard Component
 *
 * 기본 통계 정보를 표시하는 재사용 가능한 카드 컴포넌트
 *
 * Layouts:
 * - **horizontal**: 좌측에 값+라벨, 우측에 아이콘 (기본)
 * - **vertical**: 상단에 아이콘+라벨, 하단에 값
 *
 * @example
 * // Horizontal 레이아웃 (기본)
 * <SimpleStatCard
 *   value={42}
 *   label="전체 프로젝트"
 *   icon={<Briefcase className="w-5 h-5 text-blue-500" />}
 *   bgColor="bg-blue-50"
 * />
 *
 * @example
 * // Vertical 레이아웃
 * <SimpleStatCard
 *   value="₩50,000,000"
 *   label="예상 월 매출"
 *   icon={<DollarSign className="w-5 h-5 text-green-500" />}
 *   bgColor="bg-green-50"
 *   valueColor="text-green-600"
 *   layout="vertical"
 * />
 */
export function SimpleStatCard({
  value,
  label,
  icon,
  bgColor = 'bg-muted',
  valueColor = 'text-foreground',
  layout = 'horizontal',
  enableHover = false
}: SimpleStatCardProps) {
  // Horizontal 레이아웃: 좌측 값+라벨, 우측 아이콘
  if (layout === 'horizontal') {
    return (
      <BaseStatCard enableHover={enableHover}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${valueColor}`}>
              {value}
            </div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
          <div className={`p-2 ${bgColor} rounded-lg`}>
            {icon}
          </div>
        </div>
      </BaseStatCard>
    );
  }

  // Vertical 레이아웃: 상단 아이콘+라벨, 하단 값
  return (
    <BaseStatCard enableHover={enableHover}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <div className={`p-2 ${bgColor} rounded-lg`}>
            {icon}
          </div>
          {label}
        </div>
        <div className={`text-2xl font-bold ${valueColor}`}>
          {value}
        </div>
      </div>
    </BaseStatCard>
  );
}
