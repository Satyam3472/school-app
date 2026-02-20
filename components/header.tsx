"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface HeaderProps {
    userName: string;
    userRole: string;
}

export function Header({ userName, userRole }: HeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="text-sm text-gray-500">
                Welcome, <span className="font-semibold text-gray-900">{userName}</span> ({userRole})
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors"
            >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </button>
        </header>
    );
}
