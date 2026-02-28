"use client"

import React from "react"
import { MonthlyFee } from "@/types/fee-management"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
    isOpen: boolean
    onClose: () => void
    selectedMonth: MonthlyFee | null
    isProcessingPayment: boolean
    processPayment: (e: React.FormEvent) => void
    getMonthName: (month: number) => string
}

export default function PaymentModal({
    isOpen,
    onClose,
    selectedMonth,
    isProcessingPayment,
    processPayment,
    getMonthName,
}: Props) {
    if (!selectedMonth) return null

    const due = Number(selectedMonth.totalAmount) - Number(selectedMonth.paidAmount)

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Confirm Payment</DialogTitle>
                </DialogHeader>
                <form onSubmit={processPayment} className="space-y-4">
                    <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Month</span>
                            <span className="font-medium">{getMonthName(selectedMonth.month)} {selectedMonth.year}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Fee</span>
                            <span className="font-medium">Rs.{Number(selectedMonth.totalAmount).toLocaleString()}</span>
                        </div>
                        {Number(selectedMonth.paidAmount) > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Already Paid</span>
                                <span className="text-green-600 font-medium">Rs.{Number(selectedMonth.paidAmount).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t pt-2 font-semibold">
                            <span>Amount Due</span>
                            <span className="text-red-600">Rs.{due.toLocaleString()}</span>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                        This will mark the full outstanding amount as paid.
                    </p>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isProcessingPayment}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessingPayment} className="min-w-[120px]">
                            {isProcessingPayment ? (
                                <span className="flex items-center gap-2">
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                    Processing...
                                </span>
                            ) : (
                                `Pay Rs.${due.toLocaleString()}`
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
