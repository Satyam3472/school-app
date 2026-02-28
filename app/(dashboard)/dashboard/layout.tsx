"use client"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSidebarClose } from "@/hooks/useSidebarClose"
import Image from "next/image"
import Link from "next/link"
import CustomBreadcrumb from "@/components/CustomBreadcrumb"

// ── School data context ─────────────────────────────────────────────────────
const SchoolDataContext = createContext<{
    schoolData: any
    loading: boolean
    error: string | null
    refetchSchoolData: () => Promise<void>
}>({
    schoolData: null,
    loading: true,
    error: null,
    refetchSchoolData: async () => { },
})

export function useSchoolData() {
    return useContext(SchoolDataContext)
}

// ── Dashboard nav context (breadcrumbs + page title) ───────────────────────
const DashboardNavContext = createContext<{
    breadcrumb: { label: string; href?: string }[]
    setBreadcrumb: (b: { label: string; href?: string }[]) => void
    pageTitle: string
    setPageTitle: (t: string) => void
}>({
    breadcrumb: [{ label: "Dashboard", href: "/dashboard" }],
    setBreadcrumb: () => { },
    pageTitle: "Dashboard",
    setPageTitle: () => { },
})

export function useDashboardNav() {
    return useContext(DashboardNavContext)
}

// ── Inner layout (must be inside SidebarProvider to use useSidebarClose) ───
function DashboardInner({ children, schoolData }: { children: React.ReactNode; schoolData: any }) {
    useSidebarClose()

    return (
        <>
            <AppSidebar schoolData={schoolData} userRole={schoolData?.userRole} />
            <SidebarInset>
                <div className="flex-1">
                    <InnerHeader schoolData={schoolData} />
                    <main className="min-h-[calc(100vh-4rem)] bg-background/50">{children}</main>
                </div>
            </SidebarInset>
        </>
    )
}

function InnerHeader({ schoolData }: { schoolData: any }) {
    const { breadcrumb } = useDashboardNav()

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border/40">
            <SidebarTrigger className="-ml-1" data-sidebar-trigger />
            <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4 hidden md:block"
            />
            <CustomBreadcrumb items={breadcrumb} />
            <Link href="/" className="ml-auto">
                <div className="sm:hidden flex items-center justify-center gap-2">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shadow-sm">
                        {schoolData?.logoBase64 ? (
                            <img
                                src={schoolData.logoBase64}
                                alt="School Logo"
                                className="h-8 w-8 object-contain"
                                onError={(e) => { e.currentTarget.style.display = "none" }}
                            />
                        ) : (
                            <Image
                                src="/assets/school_logo.png"
                                alt="Fallback School Logo"
                                width={32}
                                height={32}
                                className="h-8 w-8 object-contain"
                            />
                        )}
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="font-bold text-sm">{schoolData?.schoolName?.toUpperCase()}</span>
                        <span className="text-xs text-muted-foreground">{schoolData?.slogan}</span>
                    </div>
                </div>
            </Link>
        </header>
    )
}

// ── Main layout export ──────────────────────────────────────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [breadcrumb, setBreadcrumb] = useState<{ label: string; href?: string }[]>([
        { label: "Dashboard", href: "/dashboard" },
    ])
    const [pageTitle, setPageTitle] = useState("Dashboard")
    const [schoolData, setSchoolData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSchoolData = useCallback(async () => {
        try {
            const response = await fetch("/api/dashboard/school-data")
            if (!response.ok) {
                if (response.status === 401) {
                    setError("Session expired. Please login again.")
                } else {
                    throw new Error(`Failed to fetch school data: ${response.status}`)
                }
                setLoading(false)
                return
            }
            const data = await response.json()
            setSchoolData(data)
            setLoading(false)
        } catch (err) {
            console.error("Failed to load school data:", err)
            setError(err instanceof Error ? err.message : "Failed to load school data")
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSchoolData()
    }, [fetchSchoolData])

    return (
        <SchoolDataContext.Provider value={{ schoolData, loading, error, refetchSchoolData: fetchSchoolData }}>
            <DashboardNavContext.Provider value={{ breadcrumb, setBreadcrumb, pageTitle, setPageTitle }}>
                <SidebarProvider
                    style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
                >
                    <DashboardInner schoolData={schoolData}>
                        {children}
                    </DashboardInner>
                </SidebarProvider>
            </DashboardNavContext.Provider>
        </SchoolDataContext.Provider>
    )
}

