'use client'

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, LayoutDashboard } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6 animate-in fade-in duration-500">
                {/* School Logo */}
                <div className="flex justify-center">
                    <Image
                        src="/assets/school_logo.png"
                        alt="School Logo"
                        width={64}
                        height={64}
                        className="h-16 w-16 object-contain opacity-60"
                    />
                </div>

                {/* 404 Heading */}
                <div>
                    <h1 className="text-8xl font-extrabold text-gray-200 select-none">
                        404
                    </h1>
                    <h2 className="text-xl font-semibold text-gray-800 mt-2">
                        Page Not Found
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                        Please check the URL or navigate back.
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
                        <Link href="/" aria-label="Go to home page">
                            <Home className="w-4 h-4" />
                            Home
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full sm:w-auto gap-2">
                        <Link href="/dashboard" aria-label="Go to dashboard">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-400 pt-4">
                    School ERP System
                </p>
            </div>
        </div>
    )
}
