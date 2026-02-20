"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/theme";

const ROLES = ["ADMIN", "TEACHER", "ACCOUNTANT", "SUPER_ADMIN"] as const;

const registerSchema = z.object({
    // New user
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(ROLES, { message: "Please select a role" }),
    // Super-admin authorization
    adminEmail: z.string().email("Invalid admin email"),
    adminPassword: z.string().min(1, "Admin password is required"),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLE_LABELS: Record<typeof ROLES[number], string> = {
    ADMIN: "Admin",
    TEACHER: "Teacher",
    ACCOUNTANT: "Accountant",
    SUPER_ADMIN: "Super Admin",
};

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                    role: data.role,
                    adminEmail: data.adminEmail,
                    adminPassword: data.adminPassword,
                }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Registration failed");
            setSuccess(`User "${result.user.name}" (${ROLE_LABELS[result.user.role as typeof ROLES[number]]}) created successfully!`);
            setTimeout(() => router.push("/login"), 2500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    // ── shared style helpers ──────────────────────────────────────────────────
    const surface = theme === "dark" ? "#1e293b" : "#ffffff";
    const border = theme === "dark" ? "#374151" : "#e5e7eb";
    const textMain = theme === "dark" ? "#f3f4f6" : "#111827";
    const textMuted = theme === "dark" ? "#9ca3af" : "#6b7280";
    const inputBg = theme === "dark" ? "#0f172a" : "#ffffff";

    const inputStyle = (hasError: boolean) => ({
        backgroundColor: inputBg,
        borderColor: hasError ? "#ef4444" : border,
        color: textMain,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    });

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 md:p-8 transition-colors duration-300"
            style={{ backgroundColor: theme === "dark" ? "#0f172a" : "#f3f4f6" }}
        >
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="fixed top-5 right-5 z-50 w-12 h-12 rounded-full shadow-lg border flex items-center justify-center transition-all hover:scale-105 focus:outline-none focus:ring-2"
                style={{ backgroundColor: surface, borderColor: border, color: textMain }}
            >
                <span
                    className="material-icons-round text-xl transition-transform duration-500"
                    style={{ transform: theme === "dark" ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                    {theme === "dark" ? "light_mode" : "dark_mode"}
                </span>
            </button>

            {/* Card */}
            <main
                className="w-full max-w-2xl overflow-hidden rounded-3xl border transition-colors duration-300"
                style={{
                    backgroundColor: surface,
                    borderColor: theme === "dark" ? border : "transparent",
                    boxShadow: theme === "dark"
                        ? "none"
                        : "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                }}
            >
                <div className="px-8 py-10 md:px-16">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-8">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: "#1325ec", boxShadow: "0 0 15px rgba(19,37,236,0.3)" }}
                        >
                            <span className="material-icons-round text-xl">local_library</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight" style={{ color: textMain }}>
                            KidsLifeSchool
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-1" style={{ color: textMain }}>
                            Create New User
                        </h1>
                        <p style={{ color: textMuted }} className="text-sm">
                            Super Admin authorization is required to register any account.
                        </p>
                    </div>

                    {/* Banners */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400 flex items-start gap-2">
                            <span className="material-icons-round text-base mt-0.5">error_outline</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-start gap-2">
                            <span className="material-icons-round text-base mt-0.5">check_circle_outline</span>
                            {success} Redirecting to login…
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* ── Section: New User ────────────────────────────── */}
                        <div
                            className="rounded-2xl p-5 space-y-4 border"
                            style={{
                                borderColor: border,
                                backgroundColor: theme === "dark" ? "rgba(19,37,236,0.04)" : "rgba(19,37,236,0.02)",
                            }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#1325ec" }}>
                                New User Details
                            </p>

                            {/* Name */}
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="block text-sm font-medium" style={{ color: textMain }}>
                                    Full Name
                                </label>
                                <div className="relative">
                                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{ color: textMuted }}>
                                        person_outline
                                    </span>
                                    <input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        {...register("name")}
                                        className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2"
                                        style={inputStyle(!!errors.name)}
                                    />
                                </div>
                                {errors.name && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.name.message}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="block text-sm font-medium" style={{ color: textMain }}>
                                    Email Address
                                </label>
                                <div className="relative">
                                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{ color: textMuted }}>
                                        mail_outline
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="teacher@kidslifeschool.com"
                                        {...register("email")}
                                        className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2"
                                        style={inputStyle(!!errors.email)}
                                    />
                                </div>
                                {errors.email && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.email.message}</p>}
                            </div>

                            {/* Password + Confirm side by side on md+ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="password" className="block text-sm font-medium" style={{ color: textMain }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{ color: textMuted }}>
                                            lock_outline
                                        </span>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...register("password")}
                                            className="block w-full pl-10 pr-11 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2"
                                            style={inputStyle(!!errors.password)}
                                        />
                                        <button type="button" onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} aria-label="Toggle password">
                                            <span className="material-icons-round text-xl">{showPassword ? "visibility" : "visibility_off"}</span>
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.password.message}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: textMain }}>
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{ color: textMuted }}>
                                            lock_outline
                                        </span>
                                        <input
                                            id="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...register("confirmPassword")}
                                            className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2"
                                            style={inputStyle(!!errors.confirmPassword)}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            {/* Role */}
                            <div className="space-y-1.5">
                                <label htmlFor="role" className="block text-sm font-medium" style={{ color: textMain }}>
                                    Role
                                </label>
                                <div className="relative">
                                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{ color: textMuted }}>
                                        badge
                                    </span>
                                    <select
                                        id="role"
                                        {...register("role")}
                                        className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2 appearance-none"
                                        style={inputStyle(!!errors.role)}
                                    >
                                        <option value="" disabled>Select a role…</option>
                                        {ROLES.map((r) => (
                                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                        ))}
                                    </select>
                                    <span className="material-icons-round absolute right-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{ color: textMuted }}>
                                        expand_more
                                    </span>
                                </div>
                                {errors.role && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.role.message}</p>}
                            </div>
                        </div>

                        {/* ── Section: Super Admin Auth ────────────────────── */}
                        <div
                            className="rounded-2xl p-5 space-y-4 border"
                            style={{
                                borderColor: border,
                                backgroundColor: theme === "dark" ? "rgba(245,158,11,0.04)" : "rgba(245,158,11,0.04)",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="material-icons-round text-base" style={{ color: "#f59e0b" }}>verified_user</span>
                                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#f59e0b" }}>
                                    Super Admin Authorization
                                </p>
                            </div>
                            <p className="text-xs" style={{ color: textMuted }}>
                                Enter your Super Admin credentials to authorize this registration.
                            </p>

                            {/* Admin Email */}
                            <div className="space-y-1.5">
                                <label htmlFor="adminEmail" className="block text-sm font-medium" style={{ color: textMain }}>
                                    Super Admin Email
                                </label>
                                <div className="relative">
                                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{ color: textMuted }}>
                                        admin_panel_settings
                                    </span>
                                    <input
                                        id="adminEmail"
                                        type="email"
                                        placeholder="admin@kidslifeschool.com"
                                        {...register("adminEmail")}
                                        className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2"
                                        style={inputStyle(!!errors.adminEmail)}
                                    />
                                </div>
                                {errors.adminEmail && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.adminEmail.message}</p>}
                            </div>

                            {/* Admin Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="adminPassword" className="block text-sm font-medium" style={{ color: textMain }}>
                                    Super Admin Password
                                </label>
                                <div className="relative">
                                    <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none" style={{ color: textMuted }}>
                                        lock_outline
                                    </span>
                                    <input
                                        id="adminPassword"
                                        type={showAdminPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        {...register("adminPassword")}
                                        className="block w-full pl-10 pr-11 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2"
                                        style={inputStyle(!!errors.adminPassword)}
                                    />
                                    <button type="button" onClick={() => setShowAdminPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: textMuted }} aria-label="Toggle admin password">
                                        <span className="material-icons-round text-xl">{showAdminPassword ? "visibility" : "visibility_off"}</span>
                                    </button>
                                </div>
                                {errors.adminPassword && <p className="text-xs" style={{ color: "#ef4444" }}>{errors.adminPassword.message}</p>}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !!success}
                            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white border border-transparent transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                            style={{ backgroundColor: "#1325ec" }}
                            onMouseEnter={(e) => { if (!loading && !success) e.currentTarget.style.backgroundColor = "#0e1bb5"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1325ec"; }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Creating User…
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span className="material-icons-round text-base">person_add</span>
                                    Create User
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-7 text-center text-sm" style={{ color: textMuted }}>
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium transition-colors" style={{ color: "#1325ec" }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}
