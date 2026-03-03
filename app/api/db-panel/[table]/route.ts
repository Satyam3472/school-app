import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/requireSuperAdmin"
import { Prisma } from "@prisma/client"

// Tables hidden from the panel
const BLOCKED_TABLES = new Set([
    "sqlite_master",
    "sqlite_sequence",
    "_prisma_migrations",
])

/** Validate table name against actual DB tables */
async function validateTable(name: string): Promise<boolean> {
    if (BLOCKED_TABLES.has(name)) return false
    const tables: { name: string }[] = await prisma.$queryRaw`
        SELECT name FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
          AND name NOT LIKE '_prisma_%'
    `
    return tables.some((t) => t.name === name)
}

/** Get column info for a table */
async function getColumns(table: string) {
    const cols: { name: string; type: string; pk: number }[] =
        await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}")`)
    return cols
}

/** GET /api/db-panel/[table] — paginated data + optional search */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ table: string }> }
) {
    const denied = await requireSuperAdmin()
    if (denied) return denied

    try {
        const { table } = await params
        if (!(await validateTable(table))) {
            return NextResponse.json(
                { success: false, error: "Invalid table" },
                { status: 400 }
            )
        }

        const url = new URL(req.url)
        const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20")))
        const search = url.searchParams.get("search")?.trim() || ""
        const offset = (page - 1) * limit

        const columns = await getColumns(table)

        let whereClause = ""
        const queryParams: unknown[] = []

        if (search) {
            // Search across all text columns
            const textCols = columns.filter((c) =>
                c.type.toUpperCase().includes("TEXT") ||
                c.type.toUpperCase().includes("VARCHAR") ||
                c.type.toUpperCase().includes("CHAR")
            )
            if (textCols.length > 0) {
                const conditions = textCols.map((c) => `"${c.name}" LIKE ?`)
                whereClause = `WHERE ${conditions.join(" OR ")}`
                textCols.forEach(() => queryParams.push(`%${search}%`))
            }
        }

        // Count total
        const countResult: { total: bigint }[] = await prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as total FROM "${table}" ${whereClause}`,
            ...queryParams
        )
        const total = Number(countResult[0]?.total || 0)

        // Fetch rows
        const rows = await prisma.$queryRawUnsafe(
            `SELECT * FROM "${table}" ${whereClause} ORDER BY "id" DESC LIMIT ? OFFSET ?`,
            ...queryParams,
            limit,
            offset
        )

        // Serialize BigInts to numbers for JSON
        const serialized = JSON.parse(
            JSON.stringify(rows, (_key, value) =>
                typeof value === "bigint" ? Number(value) : value
            )
        )

        return NextResponse.json({
            success: true,
            data: serialized,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            columns: columns.map((c) => c.name),
        })
    } catch (error) {
        console.error("[db-panel GET]", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch data" },
            { status: 500 }
        )
    }
}

/** POST /api/db-panel/[table] — create a new record */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ table: string }> }
) {
    const denied = await requireSuperAdmin()
    if (denied) return denied

    try {
        const { table } = await params
        if (!(await validateTable(table))) {
            return NextResponse.json(
                { success: false, error: "Invalid table" },
                { status: 400 }
            )
        }

        const body = await req.json()
        const columns = await getColumns(table)
        const colNames = columns.map((c) => c.name)

        // Filter only known columns, skip auto-increment PK
        const pkCol = columns.find((c) => c.pk === 1)
        const entries = Object.entries(body).filter(
            ([key]) => colNames.includes(key) && key !== pkCol?.name
        )

        if (entries.length === 0) {
            return NextResponse.json(
                { success: false, error: "No valid fields provided" },
                { status: 400 }
            )
        }

        const names = entries.map(([k]) => `"${k}"`).join(", ")
        const placeholders = entries.map(() => "?").join(", ")
        const values = entries.map(([, v]) => v === "" ? null : v)

        await prisma.$queryRawUnsafe(
            `INSERT INTO "${table}" (${names}) VALUES (${placeholders})`,
            ...values
        )

        return NextResponse.json({ success: true, message: "Record created" })
    } catch (error) {
        console.error("[db-panel POST]", error)
        const msg = error instanceof Prisma.PrismaClientKnownRequestError
            ? error.message
            : "Failed to create record"
        return NextResponse.json(
            { success: false, error: msg },
            { status: 500 }
        )
    }
}

/** PUT /api/db-panel/[table] — update a record */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ table: string }> }
) {
    const denied = await requireSuperAdmin()
    if (denied) return denied

    try {
        const { table } = await params
        if (!(await validateTable(table))) {
            return NextResponse.json(
                { success: false, error: "Invalid table" },
                { status: 400 }
            )
        }

        const body = await req.json()
        const { id, ...fields } = body

        if (id === undefined || id === null) {
            return NextResponse.json(
                { success: false, error: "id is required for updates" },
                { status: 400 }
            )
        }

        const columns = await getColumns(table)
        const colNames = columns.map((c) => c.name)

        const entries = Object.entries(fields).filter(([key]) =>
            colNames.includes(key)
        )

        if (entries.length === 0) {
            return NextResponse.json(
                { success: false, error: "No valid fields to update" },
                { status: 400 }
            )
        }

        const setClauses = entries.map(([k]) => `"${k}" = ?`).join(", ")
        const values = entries.map(([, v]) => v === "" ? null : v)

        await prisma.$queryRawUnsafe(
            `UPDATE "${table}" SET ${setClauses} WHERE "id" = ?`,
            ...values,
            id
        )

        return NextResponse.json({ success: true, message: "Record updated" })
    } catch (error) {
        console.error("[db-panel PUT]", error)
        const msg = error instanceof Prisma.PrismaClientKnownRequestError
            ? error.message
            : "Failed to update record"
        return NextResponse.json(
            { success: false, error: msg },
            { status: 500 }
        )
    }
}

/** DELETE /api/db-panel/[table]?id=N — delete a record */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ table: string }> }
) {
    const denied = await requireSuperAdmin()
    if (denied) return denied

    try {
        const { table } = await params
        if (!(await validateTable(table))) {
            return NextResponse.json(
                { success: false, error: "Invalid table" },
                { status: 400 }
            )
        }

        const url = new URL(req.url)
        const id = url.searchParams.get("id")
        if (!id) {
            return NextResponse.json(
                { success: false, error: "id query parameter is required" },
                { status: 400 }
            )
        }

        await prisma.$queryRawUnsafe(
            `DELETE FROM "${table}" WHERE "id" = ?`,
            parseInt(id)
        )

        return NextResponse.json({ success: true, message: "Record deleted" })
    } catch (error) {
        console.error("[db-panel DELETE]", error)
        const msg = error instanceof Error ? error.message : "Failed to delete record"
        // Check for FK constraint
        if (msg.includes("FOREIGN KEY")) {
            return NextResponse.json(
                { success: false, error: "Cannot delete: record is referenced by other data" },
                { status: 409 }
            )
        }
        return NextResponse.json(
            { success: false, error: msg },
            { status: 500 }
        )
    }
}
