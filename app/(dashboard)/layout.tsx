import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import type { Role } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        redirect("/login");
    }

    const payload = verifyToken(token);
    if (!payload) {
        redirect("/login");
    }

    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { name: true, role: true },
    });

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar role={user.role as Role} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header userName={user.name} userRole={user.role} />
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}

