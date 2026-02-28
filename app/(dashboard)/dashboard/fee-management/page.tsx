"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus, CheckCircle } from "lucide-react"
import { useDashboardNav } from "../layout"
import { useRouter } from "next/navigation"

import StatsCards from "@/components/fee-management/StatsCards"
import StudentFeeTable from "@/components/fee-management/StudentFeeTable"
import FeeRecordsTable from "@/components/fee-management/FeeRecordsTable"
import AddFeeModal from "@/components/fee-management/AddFeeModal"
import FeeDetailsModal from "@/components/fee-management/FeeDetailsModal"
import PaymentModal from "@/components/fee-management/PaymentModal"
import { ErrorBoundary } from "@/components/ErrorBoundary"

import {
    Student,
    MonthlyFee,
    FeeDetails,
    NewFee,
    SchoolFeeStructure,
} from "@/types/fee-management"

const INITIAL_FEE: NewFee = {
    studentId: "",
    amount: "",
    month: "",
    year: new Date().getFullYear().toString(),
    transactionTypes: ["TUITION_FEE"],
    dueDate: "",
    remarks: "",
}

export default function FeeManagementPage() {
    const [students, setStudents] = useState<Student[]>([])
    const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([])
    const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null)
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false)
    const [selectedMonth, setSelectedMonth] = useState<MonthlyFee | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAddingFee, setIsAddingFee] = useState(false)
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [filterClass, setFilterClass] = useState("all")
    const [filterStatus, setFilterStatus] = useState("all")
    const [schoolFeeStructure, setSchoolFeeStructure] = useState<SchoolFeeStructure | null>(null)
    const [newFee, setNewFee] = useState<NewFee>(INITIAL_FEE)

    const { setBreadcrumb, setPageTitle } = useDashboardNav()
    const router = useRouter()

    // ── Breadcrumb ──────────────────────────────────────────────────────────
    useEffect(() => {
        setBreadcrumb([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Fee Management" },
        ])
        setPageTitle("Fee Management")
    }, [setBreadcrumb, setPageTitle])

    // ── Keyboard close ───────────────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeAllModals()
        }
        document.addEventListener("keydown", handler)
        return () => document.removeEventListener("keydown", handler)
    }, [])

    // ── Initial data fetch ───────────────────────────────────────────────────
    useEffect(() => {
        Promise.all([fetchSchoolFees(), fetchStudents(), fetchMonthlyFees()])
    }, [])

    // ── Helpers ──────────────────────────────────────────────────────────────
    const getMonthName = (month: number) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December",
        ]
        return months[month - 1]
    }

    const getTransactionTypeName = (type: string) => {
        const map: Record<string, string> = {
            TUITION_FEE: "Tuition Fee",
            ADMISSION_FEE: "Admission Fee",
            EXAM_FEE: "Exam Fee",
            TRANSPORT_FEE: "Transport Fee",
            OTHER: "Other",
        }
        return map[type] ?? type
    }

    const getLastDateOfMonth = (year: number, month: number) =>
        new Date(year, month, 0).getDate()

    const calculateTransportFee = useCallback(
        (transportType: string): number => {
            if (!schoolFeeStructure) return 0
            const map: Record<string, keyof SchoolFeeStructure["transportFees"]> = {
                "Below 3KM": "below3",
                "Below 3 km": "below3",
                "3-5KM": "between3and5",
                "3-5 km": "between3and5",
                "5-10KM": "between5and10",
                "5-10 km": "between5and10",
                "Above 10KM": "above10",
                "Above 10 km": "above10",
            }
            const key = map[transportType]
            return key ? schoolFeeStructure.transportFees[key] : 0
        },
        [schoolFeeStructure]
    )

    const getDefaultAmount = useCallback(
        (studentId: string, types: string[]): number => {
            if (!studentId || !schoolFeeStructure) return 0
            const student = students.find((s) => s.id.toString() === studentId)
            if (!student?.admission) return 0
            const cls = schoolFeeStructure.classes.find(
                (c) => c.name === student.admission!.classEnrolled
            )
            if (!cls) return 0
            return types.reduce((sum, type) => {
                switch (type) {
                    case "TUITION_FEE": return sum + cls.tuitionFee
                    case "ADMISSION_FEE": return sum + cls.admissionFee
                    case "TRANSPORT_FEE":
                        return sum + calculateTransportFee(student.admission!.transportType)
                    case "EXAM_FEE": return sum + 300
                    case "OTHER": return sum + 100
                    default: return sum
                }
            }, 0)
        },
        [students, schoolFeeStructure, calculateTransportFee]
    )

    const autoFillForm = useCallback(
        (studentId: string, month: string, year: string) => {
            if (!studentId || !month || !year) return
            const monthNum = parseInt(month)
            const yearNum = parseInt(year)
            if (isNaN(monthNum) || isNaN(yearNum)) return

            const student = students.find((s) => s.id.toString() === studentId)
            if (!student?.admission) return

            const types = ["TUITION_FEE"]
            if (monthNum === 4) types.push("ADMISSION_FEE")
            if ([6, 12].includes(monthNum)) types.push("EXAM_FEE")
            if (student.admission.transportType && student.admission.transportType !== "None")
                types.push("TRANSPORT_FEE")

            const lastDay = getLastDateOfMonth(yearNum, monthNum)
            const dueDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
            const amount = getDefaultAmount(studentId, types)

            setNewFee((prev) => ({
                ...prev,
                studentId,
                month,
                year,
                transactionTypes: types,
                amount: amount > 0 ? amount.toString() : prev.amount,
                dueDate,
            }))
        },
        [students, getDefaultAmount]
    )

    const closeAllModals = () => {
        setIsAddFeeModalOpen(false)
        setIsPaymentModalOpen(false)
        setIsFeeModalOpen(false)
        setSelectedStudent(null)
        setSelectedMonth(null)
        setFeeDetails(null)
    }

    const showSuccessToast = (msg: string) => {
        setSuccessMessage(msg)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
    }

    // ── Data fetching ────────────────────────────────────────────────────────
    const fetchSchoolFees = async () => {
        try {
            const res = await fetch("/api/school-fees")
            const result = await res.json()
            if (result.success) setSchoolFeeStructure(result.data)
        } catch (e) {
            console.error("[fetchSchoolFees]", e)
        }
    }

    const fetchStudents = async () => {
        try {
            const res = await fetch("/api/students")
            const result = await res.json()
            if (result.success) setStudents(result.data)
        } catch (e) {
            console.error("[fetchStudents]", e)
        } finally {
            setLoading(false)
        }
    }

    const fetchMonthlyFees = async () => {
        try {
            const res = await fetch("/api/monthly-fees")
            const result = await res.json()
            if (result.success) setMonthlyFees(result.data)
        } catch (e) {
            console.error("[fetchMonthlyFees]", e)
        }
    }

    const fetchFeeDetails = async (studentId: number) => {
        try {
            // Fetch ALL fees for this student (no year filter) so we see the full financial year
            const res = await fetch(`/api/monthly-fees?studentId=${studentId}`)
            const result = await res.json()
            if (result.success) {
                const student = students.find((s) => s.id === studentId)
                if (!student) return
                const fees: MonthlyFee[] = result.data
                const totalAmount = fees.reduce((s, f) => s + Number(f.totalAmount), 0)
                const paidAmount = fees
                    .filter((f) => f.status === "PAID")
                    .reduce((s, f) => s + Number(f.totalAmount), 0)
                setFeeDetails({
                    student,
                    monthlyFees: fees,
                    totalAmount,
                    paidAmount,
                    pendingAmount: totalAmount - paidAmount,
                    pendingMonths: fees.filter((f) => f.status !== "PAID").length,
                })
            }
        } catch (e) {
            console.error("[fetchFeeDetails]", e)
        }
    }

    // ── Event handlers ───────────────────────────────────────────────────────
    const handleStudentClick = async (student: Student) => {
        setSelectedStudent(student)
        await fetchFeeDetails(student.id)
        setIsFeeModalOpen(true)
    }

    const handlePayment = (fee: MonthlyFee) => {
        setSelectedMonth(fee)
        setIsPaymentModalOpen(true)
    }

    const handleInvoice = (fee: MonthlyFee) => {
        router.push(`/dashboard/invoice/${fee.id}`)
    }

    const processPayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMonth) return
        setIsProcessingPayment(true)
        try {
            const due = Number(selectedMonth.totalAmount) - Number(selectedMonth.paidAmount)
            const res = await fetch("/api/monthly-fees", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: selectedMonth.id,
                    paidAmount: Number(selectedMonth.paidAmount) + due,
                    status: "PAID",
                }),
            })
            const result = await res.json()
            if (result.success) {
                setIsPaymentModalOpen(false)
                setIsFeeModalOpen(false)
                setSelectedMonth(null)
                await Promise.all([fetchStudents(), fetchMonthlyFees()])
                if (selectedStudent) await fetchFeeDetails(selectedStudent.id)
                showSuccessToast("Payment processed successfully!")
            } else {
                alert(result.error || "Failed to process payment")
            }
        } catch (e) {
            console.error(e)
            alert("Error processing payment. Please try again.")
        } finally {
            setIsProcessingPayment(false)
        }
    }

    const handleAddFee = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newFee.studentId || !newFee.amount || !newFee.month || !newFee.year || !newFee.dueDate) {
            alert("Please fill in all required fields")
            return
        }
        const amount = parseFloat(newFee.amount)
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid amount")
            return
        }
        setIsAddingFee(true)
        try {
            const typesLabel = newFee.transactionTypes
                .map((t) => getTransactionTypeName(t))
                .join(", ")
            const remarks = newFee.remarks ? `${typesLabel} - ${newFee.remarks}` : typesLabel

            const res = await fetch("/api/fee-management", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: parseInt(newFee.studentId),
                    amount,
                    dueDate: newFee.dueDate,
                }),
            })
            const result = await res.json()
            if (result.success) {
                setNewFee(INITIAL_FEE)
                setIsAddFeeModalOpen(false)
                await Promise.all([fetchStudents(), fetchMonthlyFees()])
                showSuccessToast("Fee record added successfully!")
            } else {
                alert(result.error || "Failed to add fee record")
            }
        } catch (e) {
            console.error(e)
            alert("Error adding fee. Please try again.")
        } finally {
            setIsAddingFee(false)
        }
    }

    // ── Computed values ──────────────────────────────────────────────────────
    const getPendingFeesCount = useCallback(
        (student: Student): number => {
            return monthlyFees.filter(
                (f) => f.studentId === student.id && f.status !== "PAID"
            ).length
        },
        [monthlyFees]
    )

    const getTotalCollection = useCallback(
        () =>
            monthlyFees
                .filter((f) => f.status === "PAID")
                .reduce((s, f) => s + Number(f.totalAmount), 0),
        [monthlyFees]
    )

    const getPaidThisMonth = useCallback(() => {
        const now = new Date()
        return monthlyFees
            .filter((f) => {
                if (f.status !== "PAID" || !f.paidDate) return false
                const d = new Date(f.paidDate)
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            })
            .reduce((s, f) => s + Number(f.totalAmount), 0)
    }, [monthlyFees])

    const filteredStudents = useMemo(() => {
        let list = students.filter((s) => {
            const matchSearch =
                s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (s.fatherName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
            const matchClass =
                filterClass === "all" || s.admission?.classEnrolled === filterClass
            return matchSearch && matchClass
        })
        if (filterStatus === "pending") list = list.filter((s) => getPendingFeesCount(s) > 0)
        else if (filterStatus === "paid") list = list.filter((s) => getPendingFeesCount(s) === 0)
        return list
    }, [students, searchTerm, filterClass, filterStatus, getPendingFeesCount])

    const paidFees = useMemo(
        () => monthlyFees.filter((f) => f.status === "PAID"),
        [monthlyFees]
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading fee management...</p>
                </div>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
                {/* Success toast */}
                {showSuccess && (
                    <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-200">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{successMessage}</span>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Fee Management</h1>
                        <p className="text-muted-foreground text-sm">Manage student fees and payments</p>
                    </div>
                    <Button onClick={() => setIsAddFeeModalOpen(true)} className="gap-2 sm:w-auto w-full">
                        <Plus className="h-4 w-4" />
                        Add Fee Record
                    </Button>
                </div>

                {/* Stats */}
                <StatsCards
                    students={students}
                    monthlyFees={monthlyFees}
                    getPendingFeesCount={getPendingFeesCount}
                    getTotalCollection={getTotalCollection}
                    getPaidThisMonth={getPaidThisMonth}
                />

                {/* Student table */}
                <section className="space-y-2">
                    <h2 className="text-lg font-semibold">Students</h2>
                    <StudentFeeTable
                        students={students}
                        filteredStudents={filteredStudents}
                        searchTerm={searchTerm}
                        filterClass={filterClass}
                        filterStatus={filterStatus}
                        setSearchTerm={setSearchTerm}
                        setFilterClass={setFilterClass}
                        setFilterStatus={setFilterStatus}
                        getPendingFeesCount={getPendingFeesCount}
                        handleStudentClick={handleStudentClick}
                    />
                </section>

                {/* Paid records */}
                <FeeRecordsTable
                    fees={paidFees}
                    students={students}
                    getMonthName={getMonthName}
                    handleInvoice={handleInvoice}
                />

                {/* Modals */}
                <FeeDetailsModal
                    isOpen={isFeeModalOpen}
                    onClose={() => { setIsFeeModalOpen(false); setFeeDetails(null) }}
                    feeDetails={feeDetails}
                    selectedStudent={selectedStudent}
                    getMonthName={getMonthName}
                    handlePayment={handlePayment}
                    handleInvoice={handleInvoice}
                />

                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    selectedMonth={selectedMonth}
                    isProcessingPayment={isProcessingPayment}
                    processPayment={processPayment}
                    getMonthName={getMonthName}
                />

                <AddFeeModal
                    isOpen={isAddFeeModalOpen}
                    onClose={closeAllModals}
                    students={students}
                    newFee={newFee}
                    setNewFee={setNewFee}
                    handleAddFee={handleAddFee}
                    isAddingFee={isAddingFee}
                    getMonthName={getMonthName}
                    getTransactionTypeName={getTransactionTypeName}
                    autoFillForm={autoFillForm}
                    calculateAmount={getDefaultAmount}
                />
            </div>
        </ErrorBoundary>
    )
}
