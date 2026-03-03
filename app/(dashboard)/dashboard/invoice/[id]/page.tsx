"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDashboardNav } from "../../layout"
import Invoice from "@/components/Invoice"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileWarning } from "lucide-react"

interface InvoiceData {
    fee: {
        id: number
        receiptNo: string | null
        month: number
        monthName: string
        year: number
        totalAmount: number
        paidAmount: number
        paidDate: string | null
        status: string
    }
    feeItems: { name: string; amount: number }[]
    student: {
        id: number
        studentName: string
        fatherName: string | null
        phone: string
    }
    admission: {
        id: number
        classEnrolled: string
        section: string
        academicYear: string
    } | null
    school: {
        schoolName: string
        slogan: string | null
        adminEmail: string
        logoBase64: string
        schoolId: string
    } | null
}

export default function InvoicePage() {
    const params = useParams()
    const router = useRouter()
    const { setBreadcrumb, setPageTitle } = useDashboardNav()
    const [data, setData] = useState<InvoiceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setBreadcrumb([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Fee Management", href: "/dashboard/fee-management" },
            { label: "Invoice" },
        ])
        setPageTitle("Fee Receipt")
    }, [setBreadcrumb, setPageTitle])

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`/api/invoice/${params.id}`)
                const result = await res.json()

                if (!result.success) {
                    setError(result.error || "Failed to load invoice")
                    return
                }

                setData(result.data)
            } catch {
                setError("Failed to fetch invoice data")
            } finally {
                setLoading(false)
            }
        }

        if (params.id) fetchInvoice()
    }, [params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading invoice…</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4 max-w-md">
                    <FileWarning className="h-12 w-12 text-destructive mx-auto" />
                    <h2 className="text-xl font-semibold">Invoice Unavailable</h2>
                    <p className="text-muted-foreground text-sm">
                        {error || "Invoice data not found."}
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard/fee-management")}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Fee Management
                    </Button>
                </div>
            </div>
        )
    }

    // Determine logo: if base64, use data URL; if path, use path; else empty
    const logoUrl = data.school?.logoBase64
        ? data.school.logoBase64.startsWith("data:")
            ? data.school.logoBase64
            : `/assets/school_logo.png`
        : "/assets/school_logo.png"

    const receiptDate = data.fee.paidDate
        ? new Date(data.fee.paidDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
        : new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })

    return (
        <div className="max-w-4xl mx-auto px-4 py-6 print:p-0 print:max-w-none">
            {/* Back button (hidden on print) */}
            <div className="mb-4 print:hidden">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/dashboard/fee-management")}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Fee Management
                </Button>
            </div>

            <Invoice
                logoUrl={logoUrl}
                schoolName={data.school?.schoolName || "School"}
                address=""
                mobileNumbers={data.student.phone ? [data.student.phone] : []}
                email={data.school?.adminEmail || ""}
                receiptDate={receiptDate}
                receiptNo={data.fee.receiptNo || `#${data.fee.id}`}
                admissionNo={data.admission?.id || data.student.id}
                studentName={data.student.studentName}
                studentClass={
                    data.admission
                        ? `${data.admission.classEnrolled} - ${data.admission.section}`
                        : "N/A"
                }
                paymentMode="Cash"
                feeItems={data.feeItems}
            />
        </div>
    )
}
