"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { List, LayoutGrid } from "lucide-react"

export type ViewMode = 'list' | 'detail';

export interface ViewModeSwitchProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
  "aria-label"?: string
  variant?: "default" | "toggle"
}

// Simple ViewModeSwitch component for direct use
export interface SimpleViewModeSwitchProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
  disabled?: boolean;
}

export interface ViewModeSwitchItemProps {
  value: string
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

const ViewModeSwitchContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: "",
  onValueChange: () => {},
})

export function ViewModeSwitch({
  value,
  onValueChange,
  children,
  className,
  "aria-label": ariaLabel,
  variant = "default",
}: ViewModeSwitchProps) {
  return (
    <ViewModeSwitchContext.Provider value={{ value, onValueChange }}>
      <div
        className={cn(
          "inline-flex items-center gap-0 rounded-lg p-1 border border-gray-300 dark:border-gray-700",
          className
        )}
        role="group"
        aria-label={ariaLabel}
        data-variant={variant}
      >
        {children}
      </div>
    </ViewModeSwitchContext.Provider>
  )
}

export function ViewModeSwitchItem({
  value,
  children,
  className,
  icon,
}: ViewModeSwitchItemProps) {
  const context = React.useContext(ViewModeSwitchContext)
  const isActive = context.value === value
  const parentElement = React.useRef<HTMLButtonElement>(null)
  const [variant, setVariant] = React.useState<"default" | "toggle">("default")

  React.useEffect(() => {
    if (parentElement.current) {
      const parent = parentElement.current.closest('[data-variant]')
      if (parent) {
        const variantValue = parent.getAttribute('data-variant') as "default" | "toggle"
        setVariant(variantValue || "default")
      }
    }
  }, [])

  return (
    <button
      ref={parentElement}
      type="button"
      role="radio"
      aria-checked={isActive}
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? variant === "toggle"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-background text-primary shadow-sm"
          : "bg-transparent text-foreground/60 hover:text-foreground",
        className
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

// Simple ViewModeSwitch for direct use with ViewMode type
export function SimpleViewModeSwitch({
  mode,
  onModeChange,
  className,
  disabled = false
}: SimpleViewModeSwitchProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center bg-secondary/20 rounded-lg p-1 border border-border",
        className
      )}
      role="group"
      aria-label="View mode selection"
    >
      <button
        type="button"
        onClick={() => onModeChange('list')}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
          mode === 'list'
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-pressed={mode === 'list'}
        aria-label="List View"
      >
        <List className="w-4 h-4" />
        <span>List View</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange('detail')}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
          mode === 'detail'
            ? "bg-background text-primary shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/10",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-pressed={mode === 'detail'}
        aria-label="Detail View"
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Detail View</span>
      </button>
    </div>
  );
}

ViewModeSwitch.displayName = "ViewModeSwitch"
ViewModeSwitchItem.displayName = "ViewModeSwitchItem"