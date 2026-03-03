import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/requireSuperAdmin"

/** GET /api/db-panel/[table]/schema — column info via PRAGMA */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ table: string }> }
) {
    const denied = await requireSuperAdmin()
    if (denied) return denied

    try {
        const { table } = await params
        const valid = await validateTable(table)
        if (!valid) {
            return NextResponse.json(
                { success: false, error: "Invalid table name" },
                { status: 400 }
            )
        }

        const columns: {
            cid: number
            name: string
            type: string
            notnull: number
            dflt_value: string | null
            pk: number
        }[] = await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`)

        // Prisma returns BigInt from raw queries; convert for JSON
        const serialized = JSON.parse(
            JSON.stringify(columns, (_key, value) =>
                typeof value === "bigint" ? Number(value) : value
            )
        )

        return NextResponse.json({ success: true, columns: serialized })
    } catch (error) {
        console.error("[db-panel schema]", error)
        return NextResponse.json(
            { success: false, error: "Failed to get schema" },
            { status: 500 }
        )
    }
}

async function validateTable(name: string): Promise<boolean> {
    const tables: { name: string }[] = await prisma.$queryRaw`
        SELECT name FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
          AND name NOT LIKE '_prisma_%'
    `
    return tables.some((t) => t.name === name)
}
