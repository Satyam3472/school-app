import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET /api/invoice/[id] — fetch a single paid fee with all data for invoice rendering
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const numericId = parseInt(id)
        if (isNaN(numericId) || numericId <= 0) {
            return NextResponse.json(
                { success: false, error: "Invalid fee ID" },
                { status: 400 }
            )
        }

        // Fetch fee with student + admission
        const fee = await prisma.monthlyFee.findUnique({
            where: { id: numericId },
            include: {
                student: {
                    include: { admission: true },
                },
            },
        })

        if (!fee) {
            return NextResponse.json(
                { success: false, error: "Fee record not found" },
                { status: 404 }
            )
        }

        // Only allow invoice for PAID or PARTIAL fees
        if (fee.status !== "PAID" && fee.status !== "PARTIAL") {
            return NextResponse.json(
                { success: false, error: "Invoice is only available for paid or partially paid fees" },
                { status: 403 }
            )
        }

        // Fetch school settings for invoice header
        const settings = await prisma.setting.findFirst({
            select: {
                schoolName: true,
                slogan: true,
                adminEmail: true,
                adminName: true,
                logoBase64: true,
                schoolId: true,
            },
        })

        // Build fee breakdown items
        const feeItems: { name: string; amount: number }[] = []
        if (fee.tuitionFee > 0) feeItems.push({ name: "Tuition Fee", amount: fee.tuitionFee })
        if (fee.admissionFee > 0) feeItems.push({ name: "Admission Fee", amount: fee.admissionFee })
        if (fee.transportFee > 0) feeItems.push({ name: "Transport Fee", amount: fee.transportFee })

        // If the total doesn't match sum of individual items, add an "Other" line
        const itemsSum = feeItems.reduce((s, i) => s + i.amount, 0)
        const paid = Number(fee.paidAmount)
        if (paid > 0 && Math.abs(paid - itemsSum) > 0.01) {
            // Use paidAmount as the actual total for invoice
            const diff = paid - itemsSum
            if (diff > 0) feeItems.push({ name: "Other Fees", amount: diff })
        }

        const MONTHS = [
            "", "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ]

        return NextResponse.json({
            success: true,
            data: {
                fee: {
                    id: fee.id,
                    receiptNo: fee.receiptNo,
                    month: fee.month,
                    monthName: MONTHS[fee.month] || `Month ${fee.month}`,
                    year: fee.year,
                    totalAmount: fee.totalAmount,
                    paidAmount: fee.paidAmount,
                    paidDate: fee.paidDate,
                    status: fee.status,
                },
                feeItems,
                student: {
                    id: fee.student.id,
                    studentName: fee.student.studentName,
                    fatherName: fee.student.fatherName,
                    motherName: fee.student.motherName,
                    regNo: fee.student.regNo,
                    phone: fee.student.phone,
                },
                admission: fee.student.admission
                    ? {
                        id: fee.student.admission.id,
                        classEnrolled: fee.student.admission.classEnrolled,
                        section: fee.student.admission.section,
                        academicYear: fee.student.admission.academicYear,
                    }
                    : null,
                school: settings
                    ? {
                        schoolName: settings.schoolName,
                        slogan: settings.slogan,
                        adminEmail: settings.adminEmail,
                        logoBase64: settings.logoBase64,
                        schoolId: settings.schoolId,
                    }
                    : null,
            },
        })
    } catch (error) {
        console.error("[invoice GET]", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch invoice data" },
            { status: 500 }
        )
    }
}
