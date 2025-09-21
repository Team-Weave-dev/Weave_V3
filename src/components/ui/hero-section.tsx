"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// 기본 히어로 섹션
interface BasicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  description?: string
  primaryAction?: {
    label: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
  }
  badge?: string
}

const BasicHero = React.forwardRef<HTMLDivElement, BasicHeroProps>(
  ({ className, title, subtitle, description, primaryAction, secondaryAction, badge, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("py-16 px-4 bg-gradient-to-b from-background to-muted/20", className)}
      {...props}
    >
      <div className="container mx-auto">
        <div className="max-w-3xl">
          {badge && (
            <Badge variant="secondary" className="mb-4">
              {badge}
            </Badge>
          )}
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {title}
          </h1>
          {subtitle && (
            <h2 className="text-xl md:text-2xl text-muted-foreground mb-4">
              {subtitle}
            </h2>
          )}
          {description && (
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              {description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            {primaryAction && (
              <Button size="lg" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
)
BasicHero.displayName = "BasicHero"

// 중앙정렬 히어로 섹션
interface CenteredHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  description?: string
  primaryAction?: {
    label: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
  }
  badge?: string
}

const CenteredHero = React.forwardRef<HTMLDivElement, CenteredHeroProps>(
  ({ className, title, subtitle, description, primaryAction, secondaryAction, badge, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("py-20 px-4 bg-gradient-to-b from-background to-muted/20", className)}
      {...props}
    >
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          {badge && (
            <Badge variant="secondary" className="mb-6">
              {badge}
            </Badge>
          )}
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6">
            {title}
          </h1>
          {subtitle && (
            <h2 className="text-xl md:text-3xl text-muted-foreground mb-6">
              {subtitle}
            </h2>
          )}
          {description && (
            <p className="text-lg text-muted-foreground mb-10 max-w-3xl mx-auto">
              {description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryAction && (
              <Button size="lg" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
)
CenteredHero.displayName = "CenteredHero"

// 분할 레이아웃 히어로 섹션
interface SplitHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  description?: string
  primaryAction?: {
    label: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
  }
  badge?: string
  imageUrl?: string
  imageAlt?: string
  reversed?: boolean
}

const SplitHero = React.forwardRef<HTMLDivElement, SplitHeroProps>(
  ({
    className,
    title,
    subtitle,
    description,
    primaryAction,
    secondaryAction,
    badge,
    imageUrl,
    imageAlt = "Hero image",
    reversed = false,
    ...props
  }, ref) => (
    <div
      ref={ref}
      className={cn("py-16 px-4", className)}
      {...props}
    >
      <div className="container mx-auto">
        <div className={cn(
          "grid lg:grid-cols-2 gap-12 items-center",
          reversed && "lg:grid-cols-2"
        )}>
          <div className={cn("space-y-6", reversed && "lg:order-2")}>
            {badge && (
              <Badge variant="secondary">
                {badge}
              </Badge>
            )}
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <h2 className="text-xl md:text-2xl text-muted-foreground">
                {subtitle}
              </h2>
            )}
            {description && (
              <p className="text-lg text-muted-foreground max-w-xl">
                {description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              {primaryAction && (
                <Button size="lg" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button size="lg" variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          </div>
          <div className={cn("relative", reversed && "lg:order-1")}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <Card className="h-80 lg:h-96">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-8 h-8 bg-primary/20 rounded-full"></div>
                    </div>
                    <p className="text-muted-foreground">이미지 영역</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
)
SplitHero.displayName = "SplitHero"

export { BasicHero, CenteredHero, SplitHero }