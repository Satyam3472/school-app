import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Auth is handled by middleware.ts — no need for inline token checks here
export async function GET() {
    try {
        // Fetch the first school setting including classes and transport fees
        const setting = await prisma.setting.findFirst({
            select: {
                schoolName: true,
                slogan: true,
                logoBase64: true,
                schoolId: true,
                transportFeeBelow3: true,
                transportFeeBetween3and5: true,
                transportFeeBetween5and10: true,
                transportFeeAbove10: true,
                classes: {
                    select: { id: true, name: true, tuitionFee: true, admissionFee: true },
                },
            },
        })

        // Read user info from middleware-injected headers
        const { headers } = await import("next/headers")
        const hdrs = await headers()
        const userName = hdrs.get("x-user-id") ?? "Unknown"

        // Look up user name from DB using the userId from middleware
        const userId = hdrs.get("x-user-id")
        let resolvedName = userName
        let resolvedRole = hdrs.get("x-user-role") ?? "ADMIN"
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { name: true, role: true },
            })
            if (user) {
                resolvedName = user.name
                resolvedRole = user.role
            }
        }

        return NextResponse.json({
            userName: resolvedName,
            userRole: resolvedRole,
            schoolName: setting?.schoolName ?? null,
            slogan: setting?.slogan ?? null,
            logoBase64: setting?.logoBase64 ?? null,
            schoolId: setting?.schoolId ?? null,
            classes: setting?.classes ?? [],
            transportFeeBelow3: setting?.transportFeeBelow3 ?? 0,
            transportFeeBetween3and5: setting?.transportFeeBetween3and5 ?? 0,
            transportFeeBetween5and10: setting?.transportFeeBetween5and10 ?? 0,
            transportFeeAbove10: setting?.transportFeeAbove10 ?? 0,
        })
    } catch (error) {
        console.error("[school-data]", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
