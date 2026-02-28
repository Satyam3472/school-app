import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Pure auth guard — checks the JWT cookie server-side.
 * The actual UI (sidebar, header, breadcrumbs) is rendered by
 * app/(dashboard)/dashboard/layout.tsx (client component).
 */
export default async function DashboardAuthLayout({
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
        select: { id: true },
    });

    if (!user) {
        redirect("/login");
    }

    return <>{children}</>;
}
