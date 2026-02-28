"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
    Home,
    Users,
    BookOpen,
    Settings,
    DollarSign,
    GraduationCap,
    LogOut,
    TrendingDown,
    ClipboardList,
    Wallet,
} from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "ACCOUNTANT"

const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: Home,
        roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"] as Role[],
    },
    {
        label: "Students",
        href: "/dashboard/students",
        icon: GraduationCap,
        roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"] as Role[],
    },
    {
        label: "Admissions",
        href: "/dashboard/admission",
        icon: ClipboardList,
        roles: ["SUPER_ADMIN", "ADMIN"] as Role[],
    },
    {
        label: "Teachers",
        href: "/teachers",
        icon: Users,
        roles: ["SUPER_ADMIN", "ADMIN"] as Role[],
    },
    {
        label: "Subjects",
        href: "/subjects",
        icon: BookOpen,
        roles: ["SUPER_ADMIN", "ADMIN"] as Role[],
    },
    {
        label: "Fee Management",
        href: "/dashboard/fee-management",
        icon: Wallet,
        roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] as Role[],
    },
    {
        label: "Expenses",
        href: "/dashboard/expenses",
        icon: TrendingDown,
        roles: ["SUPER_ADMIN", "ACCOUNTANT"] as Role[],
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        roles: ["SUPER_ADMIN"] as Role[],
    },
]

interface AppSidebarProps {
    schoolData?: {
        schoolName?: string
        slogan?: string
        logoBase64?: string
    } | null
    userRole?: string
}

export function AppSidebar({ schoolData, userRole }: AppSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()

    const role = (userRole || "ADMIN") as Role
    const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" })
            router.push("/login")
            router.refresh()
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg shadow-sm shrink-0">
                        {schoolData?.logoBase64 ? (
                            <img
                                src={schoolData.logoBase64}
                                alt="School Logo"
                                className="h-10 w-10 object-contain rounded-lg"
                                onError={(e) => { e.currentTarget.style.display = "none" }}
                            />
                        ) : (
                            <Image
                                src="/assets/school_logo.png"
                                alt="School Logo"
                                width={40}
                                height={40}
                                className="h-10 w-10 object-contain"
                            />
                        )}
                    </div>
                    <div className="flex flex-col leading-tight min-w-0">
                        <span className="font-bold text-sm truncate text-sidebar-foreground">
                            {schoolData?.schoolName?.toUpperCase() || "SCHOOL APP"}
                        </span>
                        {schoolData?.slogan && (
                            <span className="text-xs text-sidebar-foreground/60 truncate">
                                {schoolData.slogan}
                            </span>
                        )}
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarMenu>
                        {filteredItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={isActive}>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3",
                                                isActive && "font-medium"
                                            )}
                                        >
                                            <Icon className="h-4 w-4 shrink-0" />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter className="p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
