"use client"

import React from "react"
import { MonthlyFee, Student } from "@/types/fee-management"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle2 } from "lucide-react"

type Props = {
    fees: MonthlyFee[]
    students: Student[]
    getMonthName: (month: number) => string
    handleInvoice: (fee: MonthlyFee) => void
}

export default function FeeRecordsTable({
    fees,
    students,
    getMonthName,
    handleInvoice,
}: Props) {
    const getStudentName = (studentId: number) => {
        return students.find((s) => s.id === studentId)?.studentName ?? `#${studentId}`
    }

    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">Recent Paid Records</h2>
            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Student</TableHead>
                            <TableHead>Month</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Paid Date</TableHead>
                            <TableHead className="w-20 text-right">Invoice</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                                    No paid fee records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            fees.map((fee) => (
                                <TableRow key={fee.id}>
                                    <TableCell className="font-medium text-sm">{getStudentName(fee.studentId)}</TableCell>
                                    <TableCell className="text-sm">{getMonthName(fee.month)}</TableCell>
                                    <TableCell className="text-sm">{fee.year}</TableCell>
                                    <TableCell className="text-right text-sm">Rs.{Number(fee.totalAmount).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Paid
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                            onClick={() => handleInvoice(fee)}>
                                            <FileText className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
