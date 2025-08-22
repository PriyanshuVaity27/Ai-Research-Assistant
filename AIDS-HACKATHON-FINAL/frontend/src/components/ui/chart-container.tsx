
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  glassmorphic?: boolean
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, glassmorphic = true, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center rounded-xl text-xs",
          glassmorphic && "glassmorphic-panel p-4",
          "[&_.recharts-cartesian-axis-tick_text]:fill-white/70",
          "[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-white/10",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-white/20",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none",
          "[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-white/20",
          "[&_.recharts-radial-bar-background-sector]:fill-white/5",
          "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-white/10",
          "[&_.recharts-reference-line_[stroke='#ccc']]:stroke-white/20",
          "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-sector]:outline-none",
          "[&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    )
  }
)

ChartContainer.displayName = "ChartContainer"
