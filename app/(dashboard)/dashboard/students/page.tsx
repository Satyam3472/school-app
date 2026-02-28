"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import {
    Plus,
    Pencil,
    ToggleLeft,
    ToggleRight,
    Search,
} from "lucide-react"
import { useDashboardNav } from "../layout"
import { showErrorAlert, showSuccessAlert } from "@/utils/customFunction"
import { useRouter } from "next/navigation"

type StudentTableRow = {
    id: number
    name: string
    fatherName: string
    motherName: string
    gender: string
    grade: string
    section: string
    address: string
    status: string
    isActive: boolean
    studentPhotoBase64?: string
    aadhaarNumber?: string
}

export default function StudentsPage() {
    const [students, setStudents] = useState<StudentTableRow[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortField, setSortField] = useState<keyof StudentTableRow>("name")
    const [sortAsc, setSortAsc] = useState(true)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editStudent, setEditStudent] = useState<StudentTableRow | null>(null)
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("active")

    const { setBreadcrumb, setPageTitle } = useDashboardNav()
    const router = useRouter()

    useEffect(() => {
        setBreadcrumb([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Students" },
        ])
        setPageTitle("Students")
    }, [setBreadcrumb, setPageTitle])

    useEffect(() => {
        fetchStudents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const includeInactive = statusFilter === "all" || statusFilter === "inactive"
            const res = await fetch(`/api/students${includeInactive ? "?includeInactive=true" : ""}`)
            const result = await res.json()

            if (result.success) {
                const mapped: StudentTableRow[] = result.data.map((s: Record<string, any>) => ({
                    id: s.id,
                    name: s.studentName,
                    fatherName: s.fatherName || "-",
                    motherName: s.motherName || "-",
                    gender: s.gender || "-",
                    grade: s.admission?.classEnrolled || "-",
                    section: s.admission?.section || "-",
                    address: s.address || "-",
                    status: s.isActive ? "Active" : "Inactive",
                    isActive: s.isActive,
                    studentPhotoBase64: s.studentPhotoBase64 || null,
                    aadhaarNumber: s.aadhaarNumber || "-",
                }))
                setStudents(mapped)
            } else {
                showErrorAlert("Error", "Failed to fetch students")
            }
        } catch {
            showErrorAlert("Error", "Failed to fetch students")
        } finally {
            setLoading(false)
        }
    }

    const handleEditStudent = (student: StudentTableRow) => {
        setEditStudent(student)
        setEditDialogOpen(true)
    }

    const saveStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editStudent) return
        const form = e.target as HTMLFormElement

        const payload = {
            id: editStudent.id,
            studentName: (form.elements.namedItem("studentName") as HTMLInputElement)?.value,
            fatherName: (form.elements.namedItem("fatherName") as HTMLInputElement)?.value,
            motherName: (form.elements.namedItem("motherName") as HTMLInputElement)?.value,
            gender: (form.elements.namedItem("gender") as HTMLSelectElement)?.value || editStudent.gender,
            address: (form.elements.namedItem("address") as HTMLInputElement)?.value,
            aadhaarNumber: (form.elements.namedItem("aadhaarNumber") as HTMLInputElement)?.value,
        }

        try {
            const res = await fetch("/api/students", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const result = await res.json()
            if (result.success) {
                setStudents((prev) =>
                    prev.map((s) =>
                        s.id === editStudent.id
                            ? {
                                ...s,
                                name: payload.studentName,
                                fatherName: payload.fatherName,
                                motherName: payload.motherName,
                                gender: payload.gender,
                                address: payload.address,
                                aadhaarNumber: payload.aadhaarNumber,
                            }
                            : s
                    )
                )
                setEditDialogOpen(false)
                setEditStudent(null)
                showSuccessAlert("Success", "Student updated successfully")
            } else {
                showErrorAlert("Error", result.error || "Failed to update student")
            }
        } catch {
            showErrorAlert("Error", "Failed to update student")
        }
    }

    const toggleStudentStatus = async (studentId: number, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/students", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: studentId, isActive: !currentStatus }),
            })
            const result = await res.json()
            if (result.success) {
                setStudents((prev) =>
                    prev.map((s) =>
                        s.id === studentId
                            ? { ...s, isActive: !currentStatus, status: !currentStatus ? "Active" : "Inactive" }
                            : s
                    )
                )
                showSuccessAlert("Success", `Student ${!currentStatus ? "activated" : "deactivated"} successfully`)
            } else {
                showErrorAlert("Error", result.error || "Failed to update status")
            }
        } catch {
            showErrorAlert("Error", "Failed to update status")
        }
    }

    const handleSort = (field: keyof StudentTableRow) => {
        if (sortField === field) setSortAsc(!sortAsc)
        else { setSortField(field); setSortAsc(true) }
    }

    const SortableHead = ({
        field,
        children,
        className = "",
    }: {
        field: keyof StudentTableRow
        children: React.ReactNode
        className?: string
    }) => (
        <TableHead
            className={`cursor-pointer select-none hover:bg-muted/50 ${className}`}
            onClick={() => handleSort(field)}
        >
            <span className="flex items-center gap-1">
                {children}
                {sortField === field && (
                    <span className="text-xs text-muted-foreground">{sortAsc ? "↑" : "↓"}</span>
                )}
            </span>
        </TableHead>
    )

    const filteredStudents = useMemo(() => {
        let list = students.filter(
            (s) =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.grade.toLowerCase().includes(searchTerm.toLowerCase())
        )
        if (statusFilter === "active") list = list.filter((s) => s.isActive)
        else if (statusFilter === "inactive") list = list.filter((s) => !s.isActive)
        return list
    }, [students, searchTerm, statusFilter])

    const sortedStudents = useMemo(() => {
        return [...filteredStudents].sort((a, b) => {
            const av = (a[sortField] ?? "").toString().toLowerCase()
            const bv = (b[sortField] ?? "").toString().toLowerCase()
            return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
        })
    }, [filteredStudents, sortField, sortAsc])

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center py-24">
                <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading students...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Students</h1>
                    <p className="text-muted-foreground text-sm">
                        {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
                    </p>
                </div>
                <Button onClick={() => router.push("/dashboard/admission")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Admission
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, father, or class..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select
                    value={statusFilter}
                    onValueChange={(v: "all" | "active" | "inactive") => setStatusFilter(v)}
                >
                    <SelectTrigger className="w-36">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Students</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-14">Photo</TableHead>
                            <SortableHead field="name">Student Name</SortableHead>
                            <SortableHead field="fatherName">Father&apos;s Name</SortableHead>
                            <SortableHead field="gender">Gender</SortableHead>
                            <SortableHead field="grade">Class</SortableHead>
                            <SortableHead field="section">Section</SortableHead>
                            <SortableHead field="address">Address</SortableHead>
                            <SortableHead field="status">Status</SortableHead>
                            <TableHead className="w-28 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-14">
                                    <p className="text-muted-foreground text-sm">
                                        {searchTerm ? "No students match your search." : "No students found."}
                                    </p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedStudents.map((student) => (
                                <TableRow key={student.id} className="hover:bg-muted/30">
                                    <TableCell>
                                        {student.studentPhotoBase64 ? (
                                            <img
                                                src={student.studentPhotoBase64}
                                                alt={student.name}
                                                className="w-9 h-9 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border">
                                                <span className="text-xs font-semibold text-muted-foreground">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() =>
                                                router.push(`/dashboard/fee-management?student=${student.id}`)
                                            }
                                            className="font-medium text-primary hover:underline text-left"
                                        >
                                            {student.name}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-sm">{student.fatherName}</TableCell>
                                    <TableCell className="text-sm">{student.gender}</TableCell>
                                    <TableCell className="text-sm font-medium">{student.grade}</TableCell>
                                    <TableCell className="text-sm">{student.section}</TableCell>
                                    <TableCell className="text-sm max-w-[200px] truncate">{student.address}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${student.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {student.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                title="Edit student"
                                                onClick={() => handleEditStudent(student)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                title={student.isActive ? "Deactivate" : "Activate"}
                                                onClick={() => toggleStudentStatus(student.id, student.isActive)}
                                            >
                                                {student.isActive ? (
                                                    <ToggleLeft className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <ToggleRight className="h-5 w-5 text-red-500" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={saveStudent} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="studentName">Student Name</Label>
                                <Input id="studentName" name="studentName" defaultValue={editStudent?.name || ""} required />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="fatherName">Father&apos;s Name</Label>
                                <Input id="fatherName" name="fatherName" defaultValue={editStudent?.fatherName || ""} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="motherName">Mother&apos;s Name</Label>
                                <Input id="motherName" name="motherName" defaultValue={editStudent?.motherName || ""} />
                            </div>
                            <div className="space-y-1">
                                <Label>Gender</Label>
                                <Select name="gender" defaultValue={editStudent?.gender || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                                <Input id="aadhaarNumber" name="aadhaarNumber" defaultValue={editStudent?.aadhaarNumber || ""} />
                            </div>
                            <div className="col-span-2 space-y-1">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" defaultValue={editStudent?.address || ""} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
