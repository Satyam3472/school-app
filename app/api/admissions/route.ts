import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

type TransportType = "None" | "Below 3KM" | "3-5KM" | "5-10KM" | "Above 10KM"

function validateAdmissionInput(body: Record<string, unknown>) {
    const requiredStudent = ["studentName", "dateOfBirth", "gender", "phone", "address"]
    const requiredAdmission = ["admissionDate", "classEnrolled", "section", "academicYear"]
    for (const f of requiredStudent) {
        if (!body[f]) return `Missing required student field: ${f}`
    }
    for (const f of requiredAdmission) {
        if (!body[f]) return `Missing required admission field: ${f}`
    }
    return null
}

function getTransportFee(
    transportType: TransportType,
    settings: {
        transportFeeBelow3?: number | null
        transportFeeBetween3and5?: number | null
        transportFeeBetween5and10?: number | null
        transportFeeAbove10?: number | null
    }
): number {
    switch (transportType) {
        case "Below 3KM":
            return settings.transportFeeBelow3 ?? 0
        case "3-5KM":
            return settings.transportFeeBetween3and5 ?? 0
        case "5-10KM":
            return settings.transportFeeBetween5and10 ?? 0
        case "Above 10KM":
            return settings.transportFeeAbove10 ?? 0
        default:
            return 0
    }
}

export async function POST(req: Request) {
    try {
        const rawBody = await req.json()

        // Map frontend fields → backend fields
        const body = {
            studentName: rawBody.studentName,
            dateOfBirth: rawBody.dateOfBirth || rawBody.dob,
            gender: rawBody.gender,
            email: rawBody.email || null,
            phone: rawBody.phone,
            address: (rawBody.address || "") +
                (rawBody.city ? `, ${rawBody.city}` : "") +
                (rawBody.state ? `, ${rawBody.state}` : ""),
            fatherName: rawBody.fatherName || null,
            motherName: rawBody.motherName || null,
            aadhaarNumber: rawBody.aadhaarNumber || null,
            studentPhotoBase64: rawBody.studentPhotoBase64 || null,
            regNo: rawBody.regNo || null,
            admissionDate: rawBody.admissionDate,
            classEnrolled: rawBody.classEnrolled || rawBody.grade,
            section: rawBody.section || "A",
            academicYear: rawBody.academicYear || "2025-2026",
            remarks: rawBody.remarks || null,
            transportType: (rawBody.transportType || "None") as TransportType,
        }

        const validationError = validateAdmissionInput(body as Record<string, unknown>)
        if (validationError) {
            return NextResponse.json({ success: false, error: validationError }, { status: 400 })
        }

        // Parse dates
        const dateOfBirth = new Date(body.dateOfBirth as string)
        const admissionDate = new Date(body.admissionDate as string)
        if (isNaN(dateOfBirth.getTime()) || isNaN(admissionDate.getTime())) {
            return NextResponse.json({ success: false, error: "Invalid date format." }, { status: 400 })
        }

        // Load school settings + class fees
        const settings = await prisma.setting.findFirst({
            include: { classes: true },
        })
        if (!settings) {
            return NextResponse.json({ success: false, error: "School settings not configured. Please set up the school first." }, { status: 400 })
        }

        const classFee = settings.classes.find((c) => c.name === body.classEnrolled)
        if (!classFee) {
            return NextResponse.json({ success: false, error: `Class "${body.classEnrolled}" not found in school settings.` }, { status: 400 })
        }

        const tuitionFee = Number(classFee.tuitionFee)
        const admissionFeeAmount = Number(classFee.admissionFee)
        const transportFee = getTransportFee(body.transportType, settings)

        // ── Financial year logic ──────────────────────────────────────────────
        // Financial year: April → March
        // Start from admission month, end at March of that financial year.
        const admissionMonth = admissionDate.getMonth() + 1  // 1-12
        const admissionYear = admissionDate.getFullYear()

        // financialYearStart = the April that started this financial year
        const financialYearStart = admissionMonth >= 4 ? admissionYear : admissionYear - 1
        const financialYearEnd = financialYearStart + 1   // next year's March

        // Build monthly fee rows using the spec's while loop algorithm
        const monthlyFeeRows: {
            month: number
            year: number
            tuitionFee: number
            admissionFee: number
            totalAmount: number
            paidAmount: number
            dueDate: Date
            status: string
        }[] = []

        let currentMonth = admissionMonth
        let currentYear = admissionYear
        let isFirstMonth = true

        while (
            currentYear < financialYearEnd ||
            (currentYear === financialYearEnd && currentMonth <= 3)
        ) {
            const admFee = isFirstMonth ? admissionFeeAmount : 0
            const total = tuitionFee + admFee + transportFee
            const dueDate = new Date(currentYear, currentMonth - 1, 1)  // 1st of month

            monthlyFeeRows.push({
                month: currentMonth,
                year: currentYear,
                tuitionFee,
                admissionFee: admFee,
                totalAmount: total,
                paidAmount: 0,
                dueDate,
                status: "PENDING",
            })

            isFirstMonth = false
            currentMonth++
            if (currentMonth > 12) {
                currentMonth = 1
                currentYear++
            }
        }

        // ── Prisma transaction ────────────────────────────────────────────────
        const result = await prisma.$transaction(async (tx) => {
            const student = await tx.student.create({
                data: {
                    studentName: body.studentName as string,
                    dateOfBirth,
                    gender: body.gender as string,
                    email: body.email as string | null,
                    phone: body.phone as string,
                    address: body.address as string,
                    fatherName: body.fatherName as string | null,
                    motherName: body.motherName as string | null,
                    aadhaarNumber: body.aadhaarNumber as string | null,
                    studentPhotoBase64: body.studentPhotoBase64 as string | null,
                    regNo: body.regNo as string | null,
                },
            })

            const admission = await tx.admission.create({
                data: {
                    studentId: student.id,
                    admissionDate,
                    classEnrolled: body.classEnrolled as string,
                    section: body.section as string,
                    academicYear: body.academicYear as string,
                    remarks: body.remarks as string | null,
                    transportType: body.transportType,
                },
            })

            await tx.monthlyFee.createMany({
                data: monthlyFeeRows.map((row) => ({ ...row, studentId: student.id })),
            })

            return { student, admission }
        })

        return NextResponse.json({ success: true, data: result }, { status: 201 })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json(
                    { success: false, error: "A student with this email already exists." },
                    { status: 409 }
                )
            }
        }
        console.error("[admissions] Error:", error)
        return NextResponse.json({ success: false, error: "Failed to create admission." }, { status: 500 })
    }
}
