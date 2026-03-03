'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DashboardNotFound() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="max-w-md w-full text-center space-y-6">
                {/* 404 Heading */}
                <div>
                    <h1 className="text-8xl font-extrabold text-muted-foreground/20 select-none">
                        404
                    </h1>
                    <h2 className="text-xl font-semibold mt-2">
                        Page Not Found
                    </h2>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        This page doesn&apos;t exist in the dashboard.
                        It may have been moved or the URL is incorrect.
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="w-full sm:w-auto gap-2"
                        aria-label="Go back to previous page"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                    <Button asChild className="w-full sm:w-auto gap-2">
                        <Link href="/dashboard" aria-label="Go to dashboard">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full sm:w-auto gap-2">
                        <Link href="/" aria-label="Go to home page">
                            <Home className="w-4 h-4" />
                            Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
