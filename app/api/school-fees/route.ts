import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// Auth is handled by middleware.ts — no need for inline token checks here
export async function GET() {
    try {
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
