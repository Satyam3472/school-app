"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
    Home,
    Users,
    BookOpen,
    Settings,
    DollarSign,
    GraduationCap,
} from "lucide-react";

interface SidebarProps {
    role: Role;
}

const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: Home,
        roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"] as Role[],
    },
    {
        label: "Students",
        href: "/students",
        icon: GraduationCap,
        roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"] as Role[],
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
        label: "Fees",
        href: "/fees",
        icon: DollarSign,
        roles: ["SUPER_ADMIN", "ACCOUNTANT"] as Role[],
    },
    {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["SUPER_ADMIN"] as Role[],
    },
];

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const filteredItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

    return (
        <aside className="hidden h-screen w-64 flex-col border-r bg-white md:flex">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold text-indigo-600">SchoolApp</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon className="mr-3 h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
