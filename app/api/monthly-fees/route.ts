import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET — all fees or filtered by studentId / year
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const studentId = searchParams.get("studentId")
        const year = searchParams.get("year")

        if (!studentId) {
            const all = await prisma.monthlyFee.findMany({
                orderBy: [{ year: "asc" }, { month: "asc" }],
                include: { student: { include: { admission: true } } },
            })
            return NextResponse.json({ success: true, data: all })
        }

        const where: Record<string, unknown> = {
            studentId: parseInt(studentId),
        }
        if (year) where.year = parseInt(year)

        const fees = await prisma.monthlyFee.findMany({
            where,
            orderBy: [{ year: "asc" }, { month: "asc" }],
            include: { student: { include: { admission: true } } },
        })
        return NextResponse.json({ success: true, data: fees })
    } catch (error) {
        console.error("[monthly-fees GET]", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch monthly fees" },
            { status: 500 }
        )
    }
}

// POST — create monthly fees for a student (bulk for financial year)
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { studentId, academicYear } = body

        if (!studentId) {
            return NextResponse.json(
                { success: false, error: "studentId is required" },
                { status: 400 }
            )
        }

        const student = await prisma.student.findUnique({
            where: { id: parseInt(studentId) },
            include: { admission: true },
        })
        if (!student?.admission) {
            return NextResponse.json(
                { success: false, error: "Student or admission not found" },
                { status: 404 }
            )
        }

        const settings = await prisma.setting.findFirst({
            include: { classes: true },
        })
        if (!settings) {
            return NextResponse.json(
                { success: false, error: "School settings not found" },
                { status: 404 }
            )
        }

        const classFee = settings.classes.find(
            (c) => c.name === student.admission!.classEnrolled
        )
        if (!classFee) {
            return NextResponse.json(
                { success: false, error: "Class fee not found" },
                { status: 404 }
            )
        }

        void academicYear // acknowledged, derived from admissionDate

        const admissionDate = new Date(student.admission.admissionDate)
        const admissionMonth = admissionDate.getMonth() + 1
        const admissionYear = admissionDate.getFullYear()
        const fyStart = admissionMonth >= 4 ? admissionYear : admissionYear - 1
        const fyEnd = fyStart + 1

        const tuitionFee = Number(classFee.tuitionFee)
        const admissionFeeAmt = Number(classFee.admissionFee)

        const rows: {
            studentId: number
            month: number
            year: number
            tuitionFee: number
            admissionFee: number
            totalAmount: number
            paidAmount: number
            dueDate: Date
            status: string
        }[] = []

        let cm = admissionMonth
        let cy = admissionYear
        let first = true

        while (cy < fyEnd || (cy === fyEnd && cm <= 3)) {
            const admFee = first ? admissionFeeAmt : 0
            rows.push({
                studentId: student.id,
                month: cm,
                year: cy,
                tuitionFee,
                admissionFee: admFee,
                totalAmount: tuitionFee + admFee,
                paidAmount: 0,
                dueDate: new Date(cy, cm - 1, 1),
                status: "PENDING",
            })
            first = false
            cm++
            if (cm > 12) { cm = 1; cy++ }
        }

        const created = await prisma.monthlyFee.createMany({ data: rows })
        return NextResponse.json({ success: true, data: created })
    } catch (error) {
        console.error("[monthly-fees POST]", error)
        return NextResponse.json(
            { success: false, error: "Failed to create monthly fees" },
            { status: 500 }
        )
    }
}

// PUT — update payment status / paid amount
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, paidAmount, status, paidDate } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Monthly fee ID is required" },
                { status: 400 }
            )
        }

        // Resolve final status
        const existing = await prisma.monthlyFee.findUnique({ where: { id: parseInt(id) } })
        if (!existing) {
            return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 })
        }

        const newPaidAmount =
            paidAmount !== undefined ? parseFloat(paidAmount) : Number(existing.paidAmount)
        const total = Number(existing.totalAmount)

        let resolvedStatus: string =
            status ?? (newPaidAmount >= total ? "PAID" : newPaidAmount > 0 ? "PARTIAL" : "PENDING")
        if (resolvedStatus === "PARTIALLY_PAID") resolvedStatus = "PARTIAL"

        const updated = await prisma.monthlyFee.update({
            where: { id: parseInt(id) },
            data: {
                paidAmount: newPaidAmount,
                status: resolvedStatus,
                paidDate:
                    resolvedStatus === "PAID"
                        ? paidDate
                            ? new Date(paidDate)
                            : new Date()
                        : null,
            },
            include: { student: true },
        })

        return NextResponse.json({ success: true, data: updated })
    } catch (error) {
        console.error("[monthly-fees PUT]", error)
        return NextResponse.json(
            { success: false, error: "Failed to update monthly fee" },
            { status: 500 }
        )
    }
}
