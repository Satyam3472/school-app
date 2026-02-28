"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

/**
 * Closes the mobile sidebar whenever the route changes.
 * Must be used inside a SidebarProvider.
 */
export function useSidebarClose() {
    const pathname = usePathname()
    const { setOpenMobile } = useSidebar()

    useEffect(() => {
        setOpenMobile(false)
    }, [pathname, setOpenMobile])
}
