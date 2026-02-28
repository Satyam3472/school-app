import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("token")?.value

        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
        }
        const payload = verifyToken(token)
        if (!payload) {
            return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 })
        }

        const settings = await prisma.setting.findFirst({
            include: {
                classes: { orderBy: { name: "asc" } },
            },
        })

        if (!settings) {
            return NextResponse.json(
                { success: false, error: "School settings not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: {
                classes: settings.classes.map((c) => ({
                    name: c.name,
                    tuitionFee: c.tuitionFee,
                    admissionFee: c.admissionFee,
                })),
                transportFees: {
                    below3: settings.transportFeeBelow3 ?? 0,
                    between3and5: settings.transportFeeBetween3and5 ?? 0,
                    between5and10: settings.transportFeeBetween5and10 ?? 0,
                    above10: settings.transportFeeAbove10 ?? 0,
                },
            },
        })
    } catch (error) {
        console.error("[school-fees GET]", error)
        return NextResponse.json({ success: false, error: "Failed to fetch school fees" }, { status: 500 })
    }
}
