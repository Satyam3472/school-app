import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const feeId = parseInt(id)
        if (isNaN(feeId)) {
            return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
        }
        const fee = await prisma.monthlyFee.findUnique({
            where: { id: feeId },
            include: { student: { include: { admission: true } } },
        })
        if (!fee) {
            return NextResponse.json({ success: false, error: "Monthly fee not found" }, { status: 404 })
        }
        return NextResponse.json({ success: true, data: fee })
    } catch (error) {
        console.error("[monthly-fees/:id GET]", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}
