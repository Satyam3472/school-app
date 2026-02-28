// app/api/fee-management/route.ts
// This route is a thin layer over MonthlyFee.
// The prisma.fee model does not exist — all fee records live in MonthlyFee.
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const fees = await prisma.monthlyFee.findMany({
            include: { student: true },
            orderBy: { dueDate: "desc" },
        })
        return NextResponse.json({ success: true, data: fees })
    } catch (error) {
        console.error("[fee-management GET]", error)
        return NextResponse.json({ success: false, error: "Failed to fetch fees" }, { status: 500 })
    }
}

// POST — create an ad-hoc monthly fee record
// Frontend sends: { studentId, amount, dueDate, status, remarks }
// We derive month + year from dueDate
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { studentId, amount, dueDate } = body

        if (!studentId || !amount || !dueDate) {
            return NextResponse.json(
                { success: false, error: "studentId, amount and dueDate are required" },
                { status: 400 }
            )
        }

        const due = new Date(dueDate)
        if (isNaN(due.getTime())) {
            return NextResponse.json({ success: false, error: "Invalid dueDate" }, { status: 400 })
        }

        const month = due.getMonth() + 1
        const year = due.getFullYear()
        const parsedAmount = parseFloat(amount)
        const sid = typeof studentId === "string" ? parseInt(studentId) : studentId

        // Check for duplicate (@@unique on studentId, month, year)
        const existing = await prisma.monthlyFee.findUnique({
            where: { studentId_month_year: { studentId: sid, month, year } },
        })

        let fee
        if (existing) {
            // Update existing record instead of creating duplicate
            fee = await prisma.monthlyFee.update({
                where: { id: existing.id },
                data: {
                    totalAmount: parsedAmount,
                    tuitionFee: parsedAmount,
                    paidAmount: 0,
                    status: "PENDING",
                    dueDate: due,
                },
            })
        } else {
            fee = await prisma.monthlyFee.create({
                data: {
                    studentId: sid,
                    month,
                    year,
                    tuitionFee: parsedAmount,
                    admissionFee: 0,
                    totalAmount: parsedAmount,
                    paidAmount: 0,
                    dueDate: due,
                    status: "PENDING",
                },
            })
        }

        return NextResponse.json({ success: true, data: fee }, { status: 201 })
    } catch (error) {
        console.error("[fee-management POST]", error)
        return NextResponse.json({ success: false, error: "Failed to create fee record" }, { status: 500 })
    }
}

