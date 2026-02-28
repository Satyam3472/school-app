"use client"

import React from "react"
import { FeeDetails, MonthlyFee } from "@/types/fee-management"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    FileText,
} from "lucide-react"

type Props = {
    isOpen: boolean
    onClose: () => void
    feeDetails: FeeDetails | null
    selectedStudent: { id: number; studentName?: string } | null
    getMonthName: (month: number) => string
    handlePayment: (fee: MonthlyFee) => void
    handleInvoice: (fee: MonthlyFee) => void
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
        PAID: { label: "Paid", icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: "bg-green-100 text-green-700" },
        PENDING: { label: "Pending", icon: <Clock className="h-3.5 w-3.5" />, cls: "bg-amber-100 text-amber-700" },
        PARTIAL: { label: "Partial", icon: <AlertCircle className="h-3.5 w-3.5" />, cls: "bg-orange-100 text-orange-700" },
    }
    const s = map[status] ?? map.PENDING
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
            {s.icon}
            {s.label}
        </span>
    )
}

export default function FeeDetailsModal({
    isOpen,
    onClose,
    feeDetails,
    selectedStudent,
    getMonthName,
    handlePayment,
    handleInvoice,
}: Props) {
    if (!feeDetails) return null

    const { monthlyFees, totalAmount, paidAmount, pendingAmount, pendingMonths } = feeDetails

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Fee Details — {selectedStudent?.studentName ?? feeDetails.student.studentName}
                    </DialogTitle>
                </DialogHeader>

                {/* Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total Annual", value: `Rs.${totalAmount.toLocaleString()}`, cls: "bg-blue-50 text-blue-700" },
                        { label: "Paid", value: `Rs.${paidAmount.toLocaleString()}`, cls: "bg-green-50 text-green-700" },
                        { label: "Pending", value: `Rs.${pendingAmount.toLocaleString()}`, cls: "bg-red-50 text-red-700" },
                        { label: "Pending Months", value: pendingMonths, cls: "bg-amber-50 text-amber-700" },
                    ].map((s) => (
                        <div key={s.label} className={`rounded-lg p-3 text-center ${s.cls}`}>
                            <div className="text-lg font-bold">{s.value}</div>
                            <div className="text-xs font-medium opacity-80">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Monthly fee cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {monthlyFees.map((fee) => (
                        <div key={fee.id} className="border rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {getMonthName(fee.month)} {fee.year}
                                </div>
                                <StatusBadge status={fee.status} />
                            </div>

                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Tuition</span>
                                    <span>Rs.{Number(fee.tuitionFee).toLocaleString()}</span>
                                </div>
                                {Number(fee.admissionFee) > 0 && (
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Admission</span>
                                        <span>Rs.{Number(fee.admissionFee).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-medium border-t pt-1">
                                    <span>Total</span>
                                    <span>Rs.{Number(fee.totalAmount).toLocaleString()}</span>
                                </div>
                                {Number(fee.paidAmount) > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Paid</span>
                                        <span>Rs.{Number(fee.paidAmount).toLocaleString()}</span>
                                    </div>
                                )}
                                {fee.status !== "PAID" && (
                                    <div className="flex justify-between text-red-600 font-medium">
                                        <span>Due</span>
                                        <span>Rs.{(Number(fee.totalAmount) - Number(fee.paidAmount)).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {fee.status !== "PAID" && (
                                    <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => handlePayment(fee)}>
                                        Pay Now
                                    </Button>
                                )}
                                {fee.status === "PAID" && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 h-7 text-xs gap-1"
                                        onClick={() => handleInvoice(fee)}
                                    >
                                        <FileText className="h-3 w-3" />
                                        Invoice
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {monthlyFees.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                        No fee records found for this student.
                    </p>
                )}
            </DialogContent>
        </Dialog>
    )
}
