import React from "react";
import { cn } from "@/lib/utils";
import type {
  TypographyVariant,
  TypographySize,
  TypographyWeight,
  TypographyColor,
} from "@/lib/types/theme.types";

export interface TypographyProps {
  variant?: TypographyVariant;
  size?: TypographySize;
  weight?: TypographyWeight;
  color?: TypographyColor;
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      variant = "p",
      size,
      weight,
      color = "primary",
      children,
      className,
      as,
      ...props
    },
    ref
  ) => {
    // body1, body2, caption은 HTML 요소가 아니므로 기본적으로 div로 렌더링
    const getComponent = (variant: TypographyVariant): React.ElementType => {
      if (['body1', 'body2', 'caption'].includes(variant)) {
        return 'div';
      }
      return variant as React.ElementType;
    };

    const Component = as || getComponent(variant);

    const sizes = {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    };

    const weights = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };

    const colors = {
      primary: "text-foreground",
      secondary: "text-muted-foreground",
      tertiary: "text-muted-foreground/70",
      accent: "text-primary",
      muted: "text-muted-foreground",
      gradient:
        "text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60",
    };

    const variantDefaults = {
      h1: { size: "4xl", weight: "bold" },
      h2: { size: "3xl", weight: "bold" },
      h3: { size: "2xl", weight: "semibold" },
      h4: { size: "xl", weight: "semibold" },
      h5: { size: "lg", weight: "medium" },
      h6: { size: "base", weight: "medium" },
      p: { size: "base", weight: "normal" },
      span: { size: "base", weight: "normal" },
      body1: { size: "base", weight: "normal" },
      body2: { size: "sm", weight: "normal" },
      caption: { size: "xs", weight: "normal" },
    };

    const defaultSize = size || variantDefaults[variant]?.size || "base";
    const defaultWeight =
      weight || variantDefaults[variant]?.weight || "normal";

    return (
      <Component
        ref={ref}
        className={cn(
          "leading-normal",
          sizes[defaultSize as keyof typeof sizes],
          weights[defaultWeight as keyof typeof weights],
          colors[color],
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = "Typography";

export default Typography;