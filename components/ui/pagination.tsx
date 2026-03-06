"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    className?: string
}

function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
    const getVisiblePages = () => {
        const pages: (number | "ellipsis")[] = []

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            pages.push(1)
            if (currentPage > 3) pages.push("ellipsis")

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)
            for (let i = start; i <= end; i++) pages.push(i)

            if (currentPage < totalPages - 2) pages.push("ellipsis")
            pages.push(totalPages)
        }

        return pages
    }

    return (
        <nav
            role="navigation"
            aria-label="Pagination"
            className={cn("flex items-center justify-center gap-1", className)}
        >
            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {getVisiblePages().map((page, i) =>
                page === "ellipsis" ? (
                    <span
                        key={`ellipsis-${i}`}
                        className="inline-flex items-center justify-center w-8 h-8"
                    >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            "pagination-item",
                            currentPage === page && "pagination-item-active"
                        )}
                        aria-current={currentPage === page ? "page" : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    )
}

export { Pagination }
