import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const now = new Date()
        const currentMonth = now.getMonth() + 1 // 1-12
        const currentYear = now.getFullYear()

        // ── Total active students ───────────────────────────────────────
        const totalStudents = await prisma.student.count({
            where: { isActive: true },
        })

        // ── Monthly income (sum of paidAmount for current month) ────────
        const monthlyFees = await prisma.monthlyFee.findMany({
            where: {
                month: currentMonth,
                year: currentYear,
            },
        })

        const monthlyIncome = monthlyFees.reduce(
            (sum, f) => sum + Number(f.paidAmount),
            0
        )

        // ── Total fees expected this month ──────────────────────────────
        const totalExpectedFees = monthlyFees.reduce(
            (sum, f) => sum + Number(f.totalAmount),
            0
        )

        // ── Monthly expenses ────────────────────────────────────────────
        const firstOfMonth = new Date(currentYear, currentMonth - 1, 1)
        const firstOfNext = new Date(currentYear, currentMonth, 1)

        const monthlyExpenses = await prisma.expense.findMany({
            where: {
                expenseDate: { gte: firstOfMonth, lt: firstOfNext },
            },
        })
        const totalExpenses = monthlyExpenses.reduce(
            (sum, e) => sum + Number(e.amount),
            0
        )

        // ── All-time total expenses (for the stat card) ─────────────────
        const allExpenses = await prisma.expense.findMany()
        const totalAllExpenses = allExpenses.reduce(
            (sum, e) => sum + Number(e.amount),
            0
        )

        // ── Profit ──────────────────────────────────────────────────────
        const profit = monthlyIncome - totalExpenses

        // ── Fee collection breakdown (current month) ────────────────────
        const statusCounts: Record<string, number> = {
            PAID: 0,
            PENDING: 0,
            PARTIAL: 0,
            OVERDUE: 0,
        }
        for (const fee of monthlyFees) {
            const s = fee.status || "PENDING"
            statusCounts[s] = (statusCounts[s] || 0) + 1
        }
        const totalFeeRecords = monthlyFees.length || 1 // avoid /0
        const feeBreakdown = [
            {
                status: "Paid",
                value: Math.round((statusCounts.PAID / totalFeeRecords) * 100),
                color: "#10b981",
            },
            {
                status: "Pending",
                value: Math.round(
                    (statusCounts.PENDING / totalFeeRecords) * 100
                ),
                color: "#f59e0b",
            },
            {
                status: "Partial",
                value: Math.round(
                    (statusCounts.PARTIAL / totalFeeRecords) * 100
                ),
                color: "#3b82f6",
            },
            {
                status: "Overdue",
                value: Math.round(
                    (statusCounts.OVERDUE / totalFeeRecords) * 100
                ),
                color: "#ef4444",
            },
        ].filter((b) => b.value > 0) // only include statuses that exist

        // ── Class-wise student distribution ─────────────────────────────
        const admissions = await prisma.admission.findMany({
            select: { classEnrolled: true },
            where: {
                student: { isActive: true },
            },
        })
        const classMap: Record<string, number> = {}
        for (const a of admissions) {
            classMap[a.classEnrolled] = (classMap[a.classEnrolled] || 0) + 1
        }
        // Sort classes naturally (e.g. "1", "2" ... "10", "LKG", "UKG")
        const classDistribution = Object.entries(classMap)
            .sort((a, b) => {
                const numA = parseInt(a[0])
                const numB = parseInt(b[0])
                if (!isNaN(numA) && !isNaN(numB)) return numA - numB
                if (!isNaN(numA)) return -1
                if (!isNaN(numB)) return 1
                return a[0].localeCompare(b[0])
            })
            .map(([className, count]) => ({ className, count }))

        // ── Recent admissions ───────────────────────────────────────────
        const recentAdmissions = await prisma.admission.findMany({
            take: 5,
            orderBy: { admissionDate: "desc" },
            include: {
                student: {
                    select: {
                        studentName: true,
                        studentPhotoBase64: true,
                    },
                },
            },
        })

        return NextResponse.json({
            success: true,
            data: {
                totalStudents,
                monthlyIncome,
                totalExpectedFees,
                totalExpenses,
                totalAllExpenses,
                profit,
                feeBreakdown,
                classDistribution,
                recentAdmissions: recentAdmissions.map((a) => ({
                    id: a.id,
                    studentName: a.student.studentName,
                    classEnrolled: a.classEnrolled,
                    section: a.section,
                    admissionDate: a.admissionDate,
                    photoBase64: a.student.studentPhotoBase64,
                })),
                currentMonth,
                currentYear,
            },
        })
    } catch (error) {
        console.error("[dashboard/stats]", error)
        return NextResponse.json(
            { success: false, error: "Failed to load dashboard stats" },
            { status: 500 }
        )
    }
}
