import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        const studentId = parseInt(id)

        if (isNaN(studentId)) {
            return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
        }

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { admission: true },
        })

        if (!student) {
            return NextResponse.json({ success: false, error: "Student not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, data: student })
    } catch (error) {
        console.error("[students/:id GET]", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}
