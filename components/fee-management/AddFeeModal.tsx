"use client"

import React from "react"
import { Student, NewFee } from "@/types/fee-management"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

const TRANSACTION_TYPES = [
    { value: "TUITION_FEE", label: "Tuition Fee" },
    { value: "ADMISSION_FEE", label: "Admission Fee" },
    { value: "EXAM_FEE", label: "Exam Fee" },
    { value: "TRANSPORT_FEE", label: "Transport Fee" },
    { value: "OTHER", label: "Other" },
]

const MONTHS = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
]

type Props = {
    isOpen: boolean
    onClose: () => void
    students: Student[]
    newFee: NewFee
    setNewFee: (fee: NewFee) => void
    handleAddFee: (e: React.FormEvent<HTMLFormElement>) => void
    isAddingFee: boolean
    getMonthName: (month: number) => string
    getTransactionTypeName: (type: string) => string
    autoFillForm: (studentId: string, month: string, year: string) => void
    calculateAmount: (studentId: string, transactionTypes: string[]) => number
}

export default function AddFeeModal({
    isOpen,
    onClose,
    students,
    newFee,
    setNewFee,
    handleAddFee,
    isAddingFee,
    autoFillForm,
    calculateAmount,
}: Props) {
    const currentYear = new Date().getFullYear()
    const years = [currentYear - 1, currentYear, currentYear + 1]

    const toggleType = (type: string) => {
        const has = newFee.transactionTypes.includes(type)
        const next = has
            ? newFee.transactionTypes.filter((t) => t !== type)
            : [...newFee.transactionTypes, type]
        const amount = calculateAmount(newFee.studentId, next)
        setNewFee({ ...newFee, transactionTypes: next, amount: amount > 0 ? amount.toString() : newFee.amount })
    }

    const handleStudentOrMonthChange = (field: "studentId" | "month" | "year", value: string) => {
        const updated = { ...newFee, [field]: value }
        setNewFee(updated)
        if (updated.studentId && updated.month && updated.year) {
            autoFillForm(updated.studentId, updated.month, updated.year)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Fee Record</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFee} className="space-y-4">
                    {/* Student */}
                    <div className="space-y-1">
                        <Label>Student *</Label>
                        <Select
                            value={newFee.studentId}
                            onValueChange={(v) => handleStudentOrMonthChange("studentId", v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((s) => (
                                    <SelectItem key={s.id} value={s.id.toString()}>
                                        {s.studentName} — {s.admission?.classEnrolled ?? ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Month + Year */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Month *</Label>
                            <Select
                                value={newFee.month}
                                onValueChange={(v) => handleStudentOrMonthChange("month", v)}
                            >
                                <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
                                <SelectContent>
                                    {MONTHS.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Year *</Label>
                            <Select
                                value={newFee.year}
                                onValueChange={(v) => handleStudentOrMonthChange("year", v)}
                            >
                                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Transaction types */}
                    <div className="space-y-1">
                        <Label>Fee Types</Label>
                        <div className="flex flex-wrap gap-2">
                            {TRANSACTION_TYPES.map((t) => (
                                <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => toggleType(t.value)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${newFee.transactionTypes.includes(t.value)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted text-muted-foreground border-muted-foreground/30"
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount + Due Date */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Amount (Rs.) *</Label>
                            <Input
                                type="number"
                                min={1}
                                value={newFee.amount}
                                onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Due Date *</Label>
                            <Input
                                type="date"
                                value={newFee.dueDate}
                                onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Remarks */}
                    <div className="space-y-1">
                        <Label>Remarks</Label>
                        <Input
                            value={newFee.remarks}
                            onChange={(e) => setNewFee({ ...newFee, remarks: e.target.value })}
                            placeholder="Optional note"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isAddingFee} className="min-w-[120px]">
                            {isAddingFee ? (
                                <span className="flex items-center gap-2">
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                    Saving...
                                </span>
                            ) : (
                                "Add Fee"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
