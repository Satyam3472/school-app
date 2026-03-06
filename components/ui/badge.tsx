"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary/10 text-primary",
                active:
                    "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
                pending:
                    "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
                expelled:
                    "border-transparent bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
                inactive:
                    "border-transparent bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
                outline: "text-foreground border-border",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    dot?: boolean
}

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props}>
            {dot && (
                <span
                    className={cn("h-1.5 w-1.5 rounded-full", {
                        "bg-emerald-500": variant === "active",
                        "bg-amber-500": variant === "pending",
                        "bg-red-500": variant === "expelled",
                        "bg-gray-400": variant === "inactive",
                        "bg-primary": !variant || variant === "default",
                    })}
                />
            )}
            {children}
        </div>
    )
}

export { Badge, badgeVariants }
