"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { List, LayoutGrid } from "lucide-react"

export type ViewMode = "list" | "detail"

interface ViewModeSwitchContextValue {
  value: string
  onValueChange: (value: string) => void
  variant: "default" | "toggle"
  disabled?: boolean
}

const ViewModeSwitchContext = React.createContext<ViewModeSwitchContextValue | null>(null)

export interface ViewModeSwitchProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
  "aria-label"?: string
  variant?: "default" | "toggle"
  disabled?: boolean
}

export function ViewModeSwitch({
  value,
  onValueChange,
  children,
  className,
  "aria-label": ariaLabel,
  variant = "default",
  disabled = false,
}: ViewModeSwitchProps) {
  return (
    <ViewModeSwitchContext.Provider
      value={{ value, onValueChange, variant, disabled }}
    >
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled}
        className={cn(
          "inline-flex items-center rounded-lg border border-border p-1 transition-colors",
          variant === "default" && "bg-muted/40",
          variant === "toggle" && "bg-background",
          disabled && "opacity-60",
          className
        )}
        data-variant={variant}
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </ViewModeSwitchContext.Provider>
  )
}

export interface ViewModeSwitchItemProps {
  value: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export function ViewModeSwitchItem({
  value,
  children,
  className,
  icon,
  disabled = false,
}: ViewModeSwitchItemProps) {
  const context = React.useContext(ViewModeSwitchContext)

  if (!context) {
    throw new Error("ViewModeSwitchItem must be used within a ViewModeSwitch")
  }

  const isActive = context.value === value
  const isDisabled = disabled || context.disabled

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isActive}
      aria-pressed={isActive}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) {
          context.onValueChange(value)
        }
      }}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        context.variant === "toggle"
          ? isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          : isActive
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span className="whitespace-nowrap">{children}</span>
    </button>
  )
}

export interface SimpleViewModeSwitchProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
  className?: string
  disabled?: boolean
  labels?: {
    list: string
    detail: string
  }
  icons?: {
    list?: React.ReactNode
    detail?: React.ReactNode
  }
  ariaLabel?: string
  variant?: "default" | "toggle"
}

export function SimpleViewModeSwitch({
  mode,
  onModeChange,
  className,
  disabled = false,
  labels,
  icons,
  ariaLabel,
  variant = "default",
}: SimpleViewModeSwitchProps) {
  const resolvedLabels = {
    list: labels?.list ?? "List View",
    detail: labels?.detail ?? "Detail View",
  }

  return (
    <ViewModeSwitch
      value={mode}
      onValueChange={(value) => onModeChange(value as ViewMode)}
      className={className}
      aria-label={ariaLabel ?? "View mode selection"}
      variant={variant}
      disabled={disabled}
    >
      <ViewModeSwitchItem
        value="list"
        icon={icons?.list ?? <List className="h-4 w-4" />}
      >
        {resolvedLabels.list}
      </ViewModeSwitchItem>
      <ViewModeSwitchItem
        value="detail"
        icon={icons?.detail ?? <LayoutGrid className="h-4 w-4" />}
      >
        {resolvedLabels.detail}
      </ViewModeSwitchItem>
    </ViewModeSwitch>
  )
}

ViewModeSwitch.displayName = "ViewModeSwitch"
ViewModeSwitchItem.displayName = "ViewModeSwitchItem"
