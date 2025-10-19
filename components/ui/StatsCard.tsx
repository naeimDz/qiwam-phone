// components/base/StatsCard.tsx
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
    label?: string
  }
  variant?: "default" | "primary" | "accent" | "secondary" | "danger" | "success"
  layout?: "vertical" | "horizontal"
  compact?: boolean
  withGradient?: boolean
  className?: string
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
  layout = "vertical",
  compact = false,
  withGradient = false,
  className,
}: StatsCardProps) => {
  // الأساس: الألوان المسطّحة (flat)
  const baseVariantStyles: Record<string, string> = {
    default: "bg-white border text-gray-900 dark:bg-neutral-900 dark:text-neutral-100 border-border",
    primary: "bg-primary/10 border border-primary/30 text-primary",
    accent: "bg-accent/10 border border-accent/30 text-accent",
    secondary: "bg-secondary/10 border border-secondary/30 text-secondary",
    danger: "bg-red-50 dark:bg-red-900/20 border border-red-300/30 text-red-700 dark:text-red-300",
    success: "bg-green-50 dark:bg-green-900/20 border border-green-300/30 text-green-700 dark:text-green-300",
  }

  // الإضافة الاختيارية: خلفية متدرجة subtle gradient
  const gradientVariants: Record<string, string> = {
    default: "bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-neutral-900 dark:to-neutral-800",
    primary: "bg-gradient-to-br from-primary/20 via-primary/10 to-background",
    accent: "bg-gradient-to-br from-accent/20 via-accent/10 to-background",
    secondary: "bg-gradient-to-br from-secondary/20 via-secondary/10 to-background",
    danger: "bg-gradient-to-br from-red-100 via-red-50 to-white dark:from-red-900/30 dark:to-background",
    success: "bg-gradient-to-br from-green-100 via-green-50 to-white dark:from-green-900/30 dark:to-background",
  }

  const iconWrapper = Icon ? (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-xl",
        variant === "default" && "bg-muted text-foreground",
        variant === "primary" && "bg-primary/20 text-primary",
        variant === "accent" && "bg-accent/20 text-accent",
        variant === "secondary" && "bg-secondary/20 text-secondary",
        variant === "danger" && "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300",
        variant === "success" && "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300"
      )}
    >
      <Icon className="h-5 w-5" />
    </div>
  ) : null

  const trendView = trend && (
    <div
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        trend.isPositive ? "text-green-600" : "text-red-600"
      )}
    >
      <span>{trend.isPositive ? "▲" : "▼"}</span>
      <span>{Math.abs(trend.value)}%</span>
      {trend.label && <span className="text-muted-foreground text-xs">({trend.label})</span>}
    </div>
  )

  return (
    <div
      className={cn(
        "rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]",
        withGradient ? gradientVariants[variant] : baseVariantStyles[variant],
        layout === "horizontal" ? "flex items-center justify-between gap-4" : "flex flex-col space-y-3",
        compact && "p-3 text-sm",
        className
      )}
    >
      <div className={cn("flex items-start justify-between", layout === "horizontal" && "flex-1")}>
        <div className={cn("space-y-1", layout === "horizontal" && "flex-1")}>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <p className={cn("font-bold", compact ? "text-xl" : "text-3xl")}>{value}</p>
            {trendView}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground font-normal leading-tight">{description}</p>
          )}
        </div>
        {iconWrapper}
      </div>
    </div>
  )
}
