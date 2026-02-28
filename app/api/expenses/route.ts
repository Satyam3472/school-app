import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"

function validateExpenseInput(body: Record<string, unknown>) {
    const requiredFields = ["title", "category", "amount", "expenseDate"]
    for (const field of requiredFields) {
        if (!body[field]) return `Missing required field: ${field}`
    }
    return null
}

export async function GET() {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { expenseDate: "desc" },
        })
        return NextResponse.json({ success: true, data: expenses })
    } catch (error) {
        console.error("Failed to fetch expenses:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch expenses." }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const rawBody = await req.json()
        const body = {
            title: rawBody.title || rawBody.category,
            description: rawBody.description || null,
            category: rawBody.category,
            amount: Number(rawBody.amount),
            expenseDate: rawBody.expenseDate || rawBody.date,
        }

        const validationError = validateExpenseInput(body as Record<string, unknown>)
        if (validationError) {
            return NextResponse.json({ success: false, error: validationError }, { status: 400 })
        }

        let expenseDate: Date
        try {
            expenseDate = new Date(body.expenseDate as string)
            if (isNaN(expenseDate.getTime())) throw new Error("Invalid date")
        } catch {
            return NextResponse.json(
                { success: false, error: "Invalid date format for expenseDate." },
                { status: 400 }
            )
        }

        const expense = await prisma.expense.create({
            data: {
                title: body.title as string,
                description: body.description,
                category: body.category as string,
                amount: body.amount,
                expenseDate,
            },
        })

        return NextResponse.json({ success: true, data: expense }, { status: 201 })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma error:", error.code)
        }
        console.error("Expense creation error:", error)
        return NextResponse.json({ success: false, error: "Failed to create expense." }, { status: 500 })
    }
}
