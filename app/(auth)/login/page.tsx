"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useTheme } from "@/context/theme";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const onSubmit = async (data: LoginFormData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: data.email, password: data.password }),
            });
            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || "Login failed");
            }
            router.push("/dashboard");
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

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
                style={{
                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                    color: theme === "dark" ? "#f3f4f6" : "#111827",
                }}
            >
                <span
                    className="material-icons-round text-xl transition-transform duration-500"
                    style={{ transform: theme === "dark" ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                    {theme === "dark" ? "light_mode" : "dark_mode"}
                </span>
            </button>

            {/* Main Card */}
            <main
                className="w-full max-w-5xl overflow-hidden flex flex-col md:flex-row rounded-3xl border transition-colors duration-300"
                style={{
                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                    borderColor: theme === "dark" ? "#374151" : "transparent",
                    boxShadow:
                        theme === "dark"
                            ? "none"
                            : "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                    minHeight: "min(800px, 90vh)",
                }}
            >
                {/* ── LEFT PANEL: Hero ── */}
                <div
                    className="w-full md:w-1/2 relative hidden md:flex items-center justify-center p-8 md:p-12 overflow-hidden order-last md:order-first"
                    style={{
                        backgroundColor: theme === "dark" ? "rgba(19,37,236,0.1)" : "rgba(19,37,236,0.05)",
                    }}
                >
                    {/* Dot grid background */}
                    <div className="absolute inset-0 dot-grid opacity-20" />

                    <div className="relative z-10 w-full max-w-md text-center md:text-left">
                        {/* Image */}
                        <div className="mb-10 relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/assets/children-image.png"
                                alt="Children learning in a modern classroom"
                                className="rounded-2xl shadow-lg object-cover w-full h-64 md:h-80 transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                            {/* Stats badge */}
                            <div
                                className="absolute -bottom-6 -right-6 p-4 rounded-2xl shadow-lg flex items-center gap-3"
                                style={{
                                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                    animation: "bounce 3s infinite",
                                }}
                            >
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ backgroundColor: theme === "dark" ? "rgba(22,185,129,0.15)" : "#dcfce7", color: "#16b981" }}
                                >
                                    <span className="material-icons-round text-2xl">school</span>
                                </div>
                                <div className="text-left">
                                    <p
                                        className="text-xs font-medium"
                                        style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                                    >
                                        Students Active
                                    </p>
                                    <p
                                        className="text-lg font-bold"
                                        style={{ color: theme === "dark" ? "#f3f4f6" : "#111827" }}
                                    >
                                        1,240+
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tagline */}
                        <h2
                            className="text-3xl md:text-4xl font-bold mb-4 mt-12 md:mt-0 tracking-tight"
                            style={{ color: "#1325ec" }}
                        >
                            Education for Tomorrow
                        </h2>
                        <p
                            className="text-lg leading-relaxed"
                            style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                        >
                            Manage your classroom, track progress, and engage with students
                            seamlessly with KidsLifeSchool.
                        </p>
                    </div>
                </div>

                {/* ── RIGHT PANEL: Form ── */}
                <div
                    className="w-full md:w-1/2 flex flex-col justify-center px-8 py-10 md:px-16 lg:px-24 transition-colors duration-300"
                    style={{ backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff" }}
                >
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-10">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{
                                backgroundColor: "#1325ec",
                                boxShadow: "0 0 15px rgba(19,37,236,0.3)",
                            }}
                        >
                            <span className="material-icons-round text-xl">local_library</span>
                        </div>
                        <span
                            className="text-xl font-bold tracking-tight"
                            style={{ color: theme === "dark" ? "#f3f4f6" : "#111827" }}
                        >
                            KidsLifeSchool
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{ color: theme === "dark" ? "#f3f4f6" : "#111827" }}
                        >
                            Welcome back
                        </h1>
                        <p style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                            Please enter your details to sign in.
                        </p>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium"
                                style={{ color: theme === "dark" ? "#f3f4f6" : "#111827" }}
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <span
                                    className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none"
                                    style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                                >
                                    mail_outline
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="teacher@kidslifeschool.com"
                                    {...register("email")}
                                    className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                        borderColor: errors.email
                                            ? "#ef4444"
                                            : theme === "dark"
                                                ? "#374151"
                                                : "#e5e7eb",
                                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    }}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs" style={{ color: "#ef4444" }}>
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium"
                                style={{ color: theme === "dark" ? "#f3f4f6" : "#111827" }}
                            >
                                Password
                            </label>
                            <div className="relative">
                                <span
                                    className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-xl pointer-events-none"
                                    style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                                >
                                    lock_outline
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password")}
                                    className="block w-full pl-10 pr-11 py-3 rounded-xl text-sm border transition focus:outline-none focus:ring-2"
                                    style={{
                                        backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                        borderColor: errors.password
                                            ? "#ef4444"
                                            : theme === "dark"
                                                ? "#374151"
                                                : "#e5e7eb",
                                        color: theme === "dark" ? "#f3f4f6" : "#111827",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    <span className="material-icons-round text-xl">
                                        {showPassword ? "visibility" : "visibility_off"}
                                    </span>
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs" style={{ color: "#ef4444" }}>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Remember me + Forgot password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    {...register("rememberMe")}
                                    className="h-4 w-4 rounded border accent-[#1325ec]"
                                    style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}
                                />
                                <span
                                    className="text-sm"
                                    style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                                >
                                    Remember me
                                </span>
                            </label>
                            <a
                                href="#"
                                className="text-sm font-medium transition-colors"
                                style={{ color: "#1325ec" }}
                                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#0e1bb5")}
                                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#1325ec")}
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white border border-transparent transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                            style={{
                                backgroundColor: "#1325ec",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) (e.currentTarget.style.backgroundColor = "#0e1bb5");
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget.style.backgroundColor = "#1325ec");
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Signing in…
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-7">
                        <div
                            className="absolute inset-0 flex items-center"
                            aria-hidden="true"
                        >
                            <div
                                className="w-full border-t"
                                style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}
                            />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span
                                className="px-3"
                                style={{
                                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                                }}
                            >
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            {
                                label: "Google",
                                icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-HWxTjXqPacWYjS-YkpERGmVaFW9KYpgvepRCa_YnfZCUsY6LG93AZ-SGIZK7gmbCUGOFXMgYjJn9gbtllUY1koDlXRpbabk4B5Bd-emv8lwBtwmnvcQhvSnVQfddk7b17Ghe1r8oR3tq9dIBJqlHLaqk-I6qT8d0dGZUWOPwGzlekd7N7ryo9x8lbfWE324DSqS09NMqUofHJODA67qBMV925eNqnugIUdHsC0VxkJ6tw40Sf4Zs5yv7V11HtobOXKLmboxPdVM",
                                invert: false,
                            },
                            {
                                label: "Microsoft",
                                icon: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUyC4f4Y2NDbms6s_-RkE5UnwJdyQsKq3arz7BJOBU-yD_w2dGRF9VoEI9YFVvpcGlsD2aHUhRrN8CQ_LEmXCffLvuR-6ybkqpRwiMNZc0kgvofJH2CpWGIXbQFzlCh0c62zRKg8jZTMeiGs4v0I3IUww_e1rqxu6RzpBld111OlMeCHxkzXJiMlIThG8IbPLVnYNRvl6TXzeLJFkVH1EoPwbICfELjHlElL-p5EwSiSIMDska47NXGmSPZ6U3LBqBDkJi-Kd-8X0",
                                invert: true,
                            },
                        ].map(({ label, icon, invert }) => (
                            <button
                                key={label}
                                type="button"
                                className="flex items-center justify-center w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
                                    borderColor: theme === "dark" ? "#374151" : "#e5e7eb",
                                    color: theme === "dark" ? "#f3f4f6" : "#111827",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        theme === "dark" ? "#374151" : "#f9fafb";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        theme === "dark" ? "#1e293b" : "#ffffff";
                                }}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={icon}
                                    alt={`${label} logo`}
                                    className="h-5 w-5 mr-2"
                                    style={invert && theme !== "dark" ? { filter: "invert(1)" } : undefined}
                                />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Footer */}
                    <p
                        className="mt-8 text-center text-sm"
                        style={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}
                    >
                        Don&apos;t have an account?{" "}
                        <a
                            href="/register"
                            className="font-medium transition-colors"
                            style={{ color: "#1325ec" }}
                        >
                            Register User
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
}
