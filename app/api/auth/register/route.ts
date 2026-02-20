import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/auth";
import { z } from "zod";

const VALID_ROLES = ["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT"] as const;

const registerSchema = z.object({
    // New user details
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(VALID_ROLES),
    // Super-admin credentials for authorization
    adminEmail: z.string().email("Invalid admin email"),
    adminPassword: z.string().min(1, "Admin password is required"),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, email, password, role, adminEmail, adminPassword } = result.data;

        // ── Super-admin authorization ──────────────────────────────────────────
        const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

        if (!admin || admin.role !== "SUPER_ADMIN") {
            return NextResponse.json(
                { error: "Unauthorized: only a Super Admin can create users" },
                { status: 403 }
            );
        }

        const isAdminPasswordValid = await comparePassword(adminPassword, admin.password);
        if (!isAdminPasswordValid) {
            return NextResponse.json(
                { error: "Unauthorized: incorrect Super Admin password" },
                { status: 403 }
            );
        }
        // ──────────────────────────────────────────────────────────────────────

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "A user with that email already exists" }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });

        return NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        );
    } catch (error) {
        console.error("[register]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
