"use client"

import React from "react"
import { Student, MonthlyFee } from "@/types/fee-management"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Search, AlertTriangle, CheckCircle2 } from "lucide-react"

type Props = {
    students: Student[]
    filteredStudents: Student[]
    searchTerm: string
    filterClass: string
    filterStatus: string
    setSearchTerm: (v: string) => void
    setFilterClass: (v: string) => void
    setFilterStatus: (v: string) => void
    getPendingFeesCount: (student: Student) => number
    handleStudentClick: (student: Student) => void
}

export default function StudentFeeTable({
    students,
    filteredStudents,
    searchTerm,
    filterClass,
    filterStatus,
    setSearchTerm,
    setFilterClass,
    setFilterStatus,
    getPendingFeesCount,
    handleStudentClick,
}: Props) {
    const classes = Array.from(
        new Set(students.map((s) => s.admission?.classEnrolled).filter(Boolean))
    ) as string[]

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={filterClass} onValueChange={setFilterClass}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Has Pending</SelectItem>
                        <SelectItem value="paid">All Paid</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-14">Photo</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead>Transport</TableHead>
                            <TableHead className="text-right">Pending Months</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                    No students found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredStudents.map((student) => {
                                const pending = getPendingFeesCount(student)
                                return (
                                    <TableRow
                                        key={student.id}
                                        className="cursor-pointer hover:bg-primary/5"
                                        onClick={() => handleStudentClick(student)}
                                    >
                                        <TableCell>
                                            {student.studentPhotoBase64 ? (
                                                <img
                                                    src={student.studentPhotoBase64}
                                                    alt={student.studentName}
                                                    className="w-9 h-9 rounded-full object-cover border"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-semibold border">
                                                    {student.studentName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-sm">{student.studentName}</div>
                                            <div className="text-xs text-muted-foreground">{student.fatherName}</div>
                                        </TableCell>
                                        <TableCell className="text-sm">{student.admission?.classEnrolled ?? "-"}</TableCell>
                                        <TableCell className="text-sm">{student.admission?.section ?? "-"}</TableCell>
                                        <TableCell className="text-sm">{student.admission?.transportType ?? "None"}</TableCell>
                                        <TableCell className="text-right">
                                            {pending > 0 ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {pending} month{pending !== 1 ? "s" : ""}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Paid
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
