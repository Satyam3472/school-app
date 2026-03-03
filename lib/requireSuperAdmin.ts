import { headers } from "next/headers"
import { NextResponse } from "next/server"

/**
 * Reads `x-user-role` header (set by proxy.ts) and returns a 403 response
 * if the caller is not SUPER_ADMIN.  Returns null when authorised.
 */
export async function requireSuperAdmin(): Promise<NextResponse | null> {
    const h = await headers()
    const role = h.get("x-user-role")

    if (role !== "SUPER_ADMIN") {
        return NextResponse.json(
            { success: false, error: "Forbidden — SUPER_ADMIN access required" },
            { status: 403 }
        )
    }
    return null
}
