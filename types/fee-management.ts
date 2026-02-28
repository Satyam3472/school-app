// Shared types for the Fee Management feature

export type Student = {
    id: number
    studentName: string
    fatherName?: string | null
    motherName?: string | null
    gender?: string | null
    email?: string | null
    phone?: string | null
    address?: string | null
    isActive: boolean
    studentPhotoBase64?: string | null
    aadhaarNumber?: string | null
    admission?: {
        id: number
        classEnrolled: string
        section: string
        academicYear: string
        transportType: string
        admissionDate: string
    } | null
}

// FeeStatus values: "PENDING" | "PAID" | "PARTIAL"
export type FeeStatusType = "PENDING" | "PAID" | "PARTIAL"

export type MonthlyFee = {
    id: number
    studentId: number
    month: number
    year: number
    tuitionFee: number
    admissionFee: number
    totalAmount: number
    paidAmount: number
    dueDate: string
    paidDate?: string | null
    status: FeeStatusType
    student?: Student
}

// Alias for backward compat
export type Fee = MonthlyFee

export type FeeDetails = {
    student: Student
    monthlyFees: MonthlyFee[]
    totalAmount: number
    paidAmount: number
    pendingAmount: number
    pendingMonths: number
}

export type NewFee = {
    studentId: string
    amount: string
    month: string
    year: string
    transactionTypes: string[]
    dueDate: string
    remarks: string
}

export type SchoolFeeStructure = {
    classes: Array<{ name: string; tuitionFee: number; admissionFee: number }>
    transportFees: {
        below3: number
        between3and5: number
        between5and10: number
        above10: number
    }
}
