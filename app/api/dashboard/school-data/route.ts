import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const payload = verifyToken(token)
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { name: true, role: true },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

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

        return NextResponse.json({
            userName: user.name,
            userRole: user.role,
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
