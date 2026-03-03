import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireSuperAdmin } from "@/lib/requireSuperAdmin"

// Tables that are always hidden from the panel
const BLOCKED_TABLES = new Set([
    "sqlite_master",
    "sqlite_sequence",
    "_prisma_migrations",
])

/** GET /api/db-panel — list all user tables */
export async function GET() {
    const denied = await requireSuperAdmin()
    if (denied) return denied

    try {
        const tables: { name: string }[] = await prisma.$queryRaw`
            SELECT name FROM sqlite_master
            WHERE type = 'table'
              AND name NOT LIKE 'sqlite_%'
              AND name NOT LIKE '_prisma_%'
            ORDER BY name
        `

        const filtered = tables
            .map((t) => t.name)
            .filter((n) => !BLOCKED_TABLES.has(n))

        return NextResponse.json({ success: true, tables: filtered })
    } catch (error) {
        console.error("[db-panel tables]", error)
        return NextResponse.json(
            { success: false, error: "Failed to list tables" },
            { status: 500 }
        )
    }
}
