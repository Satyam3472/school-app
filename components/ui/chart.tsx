"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
    [k in string]: {
        label?: React.ReactNode
        icon?: React.ComponentType
        color?: string
        theme?: Record<keyof typeof THEMES, string>
    }
}

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
    const context = React.useContext(ChartContext)
    if (!context) throw new Error("useChart must be used within a <ChartContainer />")
    return context
}

function ChartContainer({
    id,
    className,
    children,
    config,
    ...props
}: React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-slot="chart"
                data-chart={chartId}
                className={cn(
                    "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 flex aspect-video justify-center text-xs [&_.recharts-layer]:outline-hidden [&_.recharts-surface]:outline-hidden",
                    className
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>
                    {children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.theme || cfg.color)
    if (!colorConfig.length) return null

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(THEMES)
                    .map(
                        ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                                .map(([key, itemConfig]) => {
                                    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
                                    return color ? `  --color-${key}: ${color};` : null
                                })
                                .join("\n")}
}
`
                    )
                    .join("\n"),
            }}
        />
    )
}

const ChartTooltip = RechartsPrimitive.Tooltip

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltipContent(props: any) {
    const { active, payload, className, indicator = "dot", hideLabel = false, label, nameKey } = props
    const { config } = useChart()

    if (!active || !payload?.length) return null

    return (
        <div
            className={cn(
                "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
                className
            )}
        >
            {!hideLabel && label && (
                <div className="font-medium">{String(label)}</div>
            )}
            <div className="grid gap-1.5">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {payload.map((item: any, index: number) => {
                    const key = `${nameKey || item.name || item.dataKey || "value"}`
                    const itemConfig = config[key]
                    const indicatorColor = item.payload?.fill || item.color

                    return (
                        <div
                            key={`${item.dataKey}-${index}`}
                            className={cn(
                                "flex w-full items-center gap-2",
                                indicator === "dot" && "items-center"
                            )}
                        >
                            <div
                                className={cn(
                                    "shrink-0 rounded-[2px]",
                                    indicator === "dot" && "mt-0.5 size-2.5 rounded-full",
                                    indicator === "line" && "h-0.5 w-4",
                                )}
                                style={{ backgroundColor: indicatorColor }}
                            />
                            <div className="flex flex-1 justify-between leading-none items-center">
                                <span className="text-muted-foreground">
                                    {itemConfig?.label || item.name}
                                </span>
                                {item.value !== undefined && (
                                    <span className="text-foreground font-mono font-medium tabular-nums">
                                        {typeof item.value === "number"
                                            ? item.value.toLocaleString()
                                            : item.value}
                                    </span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const ChartLegend = RechartsPrimitive.Legend

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartLegendContent(props: any) {
    const { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey } = props
    const { config } = useChart()

    if (!payload?.length) return null

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-4",
                verticalAlign === "top" ? "pb-3" : "pt-3",
                className
            )}
        >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {payload.map((item: any) => {
                const key = `${nameKey || item.dataKey || "value"}`
                const itemConfig = config[key]

                return (
                    <div
                        key={item.value}
                        className="flex items-center gap-1.5"
                    >
                        {itemConfig?.icon && !hideIcon ? (
                            <itemConfig.icon />
                        ) : (
                            <div
                                className="h-2 w-2 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: item.color }}
                            />
                        )}
                        <span className="text-sm text-muted-foreground">
                            {itemConfig?.label ?? item.value}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
}
