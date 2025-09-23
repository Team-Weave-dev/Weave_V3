"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

export interface InteractiveCardProps
  extends React.ComponentProps<typeof Card> {
  glow?: boolean
  lift?: boolean
}

export const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, children, glow = true, lift = true, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "group relative overflow-hidden bg-card/90 backdrop-blur-sm transition-all duration-300",
          lift && "hover:-translate-y-1 hover:shadow-xl",
          glow && "hover:border-primary/50",
          className
        )}
        {...props}
      >
        {glow && (
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-60">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          </div>
        )}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </Card>
    )
  }
)
InteractiveCard.displayName = "InteractiveCard"
