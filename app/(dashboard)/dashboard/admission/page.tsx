"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { useDashboardNav, useSchoolData } from "../layout"
import { useRouter } from "next/navigation"
import { showErrorAlert, showSuccessAlert } from "@/utils/customFunction"
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X } from "lucide-react"

const STEPS = ["Student Info", "Parent & Address", "Review & Submit"]

const INITIAL_FORM = {
    studentName: "",
    dob: "",
    gender: "",
    grade: "",
    aadhaarNumber: "",
    studentPhotoBase64: "",
    fatherName: "",
    motherName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    admissionDate: "",
    section: "A",
    academicYear: "2025-2026",
    transportType: "None",
    regNo: "",
}

type FormData = typeof INITIAL_FORM

const TRANSPORT_OPTIONS = [
    { value: "None", label: "None" },
    { value: "Below 3KM", label: "Below 3 KM" },
    { value: "3-5KM", label: "3 – 5 KM" },
    { value: "5-10KM", label: "5 – 10 KM" },
    { value: "Above 10KM", label: "Above 10 KM" },
]

function getTransportFee(
    type: string,
    schoolData: Record<string, number> | null
): number {
    if (!schoolData || type === "None") return 0
    const map: Record<string, string> = {
        "Below 3KM": "transportFeeBelow3",
        "3-5KM": "transportFeeBetween3and5",
        "5-10KM": "transportFeeBetween5and10",
        "Above 10KM": "transportFeeAbove10",
    }
    return Number(schoolData[map[type]] ?? 0)
}

function calcFeeBreakdown(formData: FormData, schoolData: Record<string, unknown> | null) {
    if (!formData.grade || !schoolData?.classes) return null
    const classes = schoolData.classes as Array<{ name: string; tuitionFee: number; admissionFee: number }>
    const cls = classes.find((c) => c.name === formData.grade)
    if (!cls) return null

    const tuitionFee = Number(cls.tuitionFee)
    const admissionFeeAmt = Number(cls.admissionFee)
    const transportFee = getTransportFee(formData.transportType, schoolData as Record<string, number>)

    const admDate = formData.admissionDate ? new Date(formData.admissionDate) : new Date()
    const admMonth = admDate.getMonth() + 1
    const admYear = admDate.getFullYear()
    const fyStart = admMonth >= 4 ? admYear : admYear - 1
    const fyEnd = fyStart + 1

    const rows: Array<{
        label: string
        year: number
        tuitionFee: number
        admissionFee: number
        transportFee: number
        total: number
    }> = []

    const MONTHS = [
        "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ]

    let cm = admMonth
    let cy = admYear
    let first = true

    while (cy < fyEnd || (cy === fyEnd && cm <= 3)) {
        const adm = first ? admissionFeeAmt : 0
        rows.push({
            label: MONTHS[cm],
            year: cy,
            tuitionFee,
            admissionFee: adm,
            transportFee,
            total: tuitionFee + adm + transportFee,
        })
        first = false
        cm++
        if (cm > 12) { cm = 1; cy++ }
    }

    return {
        cls,
        rows,
        transportFee,
        totalAnnual: rows.reduce((s, r) => s + r.total, 0),
    }
}

export default function AdmissionForm() {
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { setBreadcrumb, setPageTitle } = useDashboardNav()
    const { schoolData, loading: schoolLoading } = useSchoolData()

    useEffect(() => {
        setBreadcrumb([
            { label: "Dashboard", href: "/dashboard" },
            { label: "New Admission" },
        ])
        setPageTitle("New Admission")
    }, [setBreadcrumb, setPageTitle])

    const set = (field: keyof FormData, value: string) =>
        setFormData((prev) => ({ ...prev, [field]: value }))

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => set("studentPhotoBase64", reader.result as string)
        reader.readAsDataURL(file)
    }

    const feeBreakdown = calcFeeBreakdown(formData, schoolData as Record<string, unknown> | null)

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/admissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const result = await res.json()
            if (result.success) {
                showSuccessAlert("Success", "Admission submitted successfully")
                setFormData(INITIAL_FORM)
                setStep(0)
                router.push("/dashboard")
            } else {
                showErrorAlert("Error", result.error || "Failed to submit admission.")
            }
        } catch {
            showErrorAlert("Error", "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">New Admission</h1>
                <p className="text-muted-foreground text-sm">Fill in all required details carefully</p>
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-3">
                {STEPS.map((label, idx) => (
                    <div key={label} className="flex items-center gap-2">
                        <div
                            className={`rounded-full px-3 py-1 text-xs font-medium border transition-all ${idx === step
                                    ? "bg-primary text-primary-foreground border-primary shadow"
                                    : idx < step
                                        ? "bg-green-600 text-white border-green-600"
                                        : "bg-muted text-muted-foreground border-muted-foreground/20"
                                }`}
                        >
                            {idx < step ? "Done" : `Step ${idx + 1}`}
                        </div>
                        {idx < STEPS.length - 1 && (
                            <span className="text-muted-foreground text-xs">›</span>
                        )}
                    </div>
                ))}
            </div>

            <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5 rounded-full" />

            {/* Form card */}
            <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="shadow-md border rounded-2xl">
                    <CardHeader className="bg-muted/40 border-b rounded-t-2xl px-6 py-4">
                        <CardTitle className="text-base font-semibold text-center">{STEPS[step]}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">

                        {/* ── Step 0: Student Info ─────────────────────────────────── */}
                        {step === 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Full Name *</Label>
                                    <Input placeholder="Student's full name" value={formData.studentName}
                                        onChange={(e) => set("studentName", e.target.value)} />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Date of Birth *</Label>
                                    <Input type="date" value={formData.dob}
                                        onChange={(e) => set("dob", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(v) => set("gender", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Class *</Label>
                                    <Select value={formData.grade} onValueChange={(v) => set("grade", v)}
                                        disabled={schoolLoading}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={schoolLoading ? "Loading..." : "Select class"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schoolLoading ? (
                                                <SelectItem value="loading" disabled>Loading...</SelectItem>
                                            ) : (schoolData as Record<string, unknown>)?.classes &&
                                                ((schoolData as Record<string, unknown>).classes as unknown[]).length > 0 ? (
                                                ((schoolData as Record<string, unknown>).classes as Array<{ name: string }>).map((cls) => (
                                                    <SelectItem key={cls.name} value={cls.name}>{cls.name}</SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>No classes — add in Settings</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Registration Number</Label>
                                    <Input placeholder="Reg No" value={formData.regNo}
                                        onChange={(e) => set("regNo", e.target.value)} />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Aadhaar Number</Label>
                                    <Input placeholder="12-digit Aadhaar" value={formData.aadhaarNumber}
                                        maxLength={12} onChange={(e) => set("aadhaarNumber", e.target.value)} />
                                </div>

                                {/* Photo upload */}
                                <div className="md:col-span-4 space-y-2">
                                    <Label>Student Photo</Label>
                                    <div className="flex items-center gap-3">
                                        <Input id="studentPhoto" type="file" accept="image/*"
                                            onChange={handleImageChange} className="hidden" />
                                        <Button type="button" variant="outline" size="sm"
                                            onClick={() => document.getElementById("studentPhoto")?.click()}>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Photo
                                        </Button>
                                        <span className="text-xs text-muted-foreground">Recommended: 200×200 px</span>
                                    </div>
                                    {formData.studentPhotoBase64 && (
                                        <div className="flex items-center gap-4 p-3 border rounded-lg bg-muted/20">
                                            <img src={formData.studentPhotoBase64} alt="Preview"
                                                className="w-16 h-16 object-cover rounded-md border" />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium">Photo uploaded</span>
                                                <Button type="button" variant="destructive" size="sm" className="w-fit"
                                                    onClick={() => set("studentPhotoBase64", "")}>
                                                    <X className="w-3 h-3 mr-1" /> Remove
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Step 1: Parent & Address ─────────────────────────────── */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Father&apos;s Name *</Label>
                                    <Input placeholder="Father's full name" value={formData.fatherName}
                                        onChange={(e) => set("fatherName", e.target.value)} />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Mother&apos;s Name *</Label>
                                    <Input placeholder="Mother's full name" value={formData.motherName}
                                        onChange={(e) => set("motherName", e.target.value)} />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Phone Number *</Label>
                                    <Input type="tel" placeholder="+91 9876543210" value={formData.phone}
                                        onChange={(e) => set("phone", e.target.value)} />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Email Address</Label>
                                    <Input type="email" placeholder="parent@example.com" value={formData.email}
                                        onChange={(e) => set("email", e.target.value)} />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <Label>Address *</Label>
                                    <Input placeholder="House No, Street, Area" value={formData.address}
                                        onChange={(e) => set("address", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>City *</Label>
                                    <Input placeholder="City" value={formData.city}
                                        onChange={(e) => set("city", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>State *</Label>
                                    <Input placeholder="State" value={formData.state}
                                        onChange={(e) => set("state", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Transport</Label>
                                    <Select value={formData.transportType} onValueChange={(v) => set("transportType", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {TRANSPORT_OPTIONS.map((o) => (
                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Admission Date *</Label>
                                    <Input type="date" value={formData.admissionDate}
                                        onChange={(e) => set("admissionDate", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Section</Label>
                                    <Input value={formData.section}
                                        onChange={(e) => set("section", e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Academic Year</Label>
                                    <Input value={formData.academicYear}
                                        onChange={(e) => set("academicYear", e.target.value)} />
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Review & Submit ──────────────────────────────── */}
                        {step === 2 && (
                            <div className="space-y-5">
                                {/* Student info block */}
                                <SummaryBlock title="Student Information" color="blue">
                                    <SummaryRow label="Full Name" value={formData.studentName} />
                                    <SummaryRow label="Date of Birth" value={formData.dob ? new Date(formData.dob).toLocaleDateString() : ""} />
                                    <SummaryRow label="Gender" value={formData.gender} />
                                    <SummaryRow label="Class" value={formData.grade} />
                                    <SummaryRow label="Reg No" value={formData.regNo} />
                                    <SummaryRow label="Aadhaar" value={formData.aadhaarNumber} />
                                    <div className="col-span-2 text-sm">
                                        <span className="font-medium text-gray-700">Photo: </span>
                                        <span>{formData.studentPhotoBase64 ? "Uploaded" : "Not uploaded"}</span>
                                    </div>
                                </SummaryBlock>

                                {/* Parent info block */}
                                <SummaryBlock title="Parent & Address" color="green">
                                    <SummaryRow label="Father" value={formData.fatherName} />
                                    <SummaryRow label="Mother" value={formData.motherName} />
                                    <SummaryRow label="Phone" value={formData.phone} />
                                    <SummaryRow label="Email" value={formData.email} />
                                    <SummaryRow label="Address" value={`${formData.address}, ${formData.city}, ${formData.state}`} />
                                </SummaryBlock>

                                {/* Admission details */}
                                <SummaryBlock title="Admission Details" color="purple">
                                    <SummaryRow label="Admission Date" value={formData.admissionDate ? new Date(formData.admissionDate).toLocaleDateString() : ""} />
                                    <SummaryRow label="Section" value={formData.section} />
                                    <SummaryRow label="Academic Year" value={formData.academicYear} />
                                    <SummaryRow label="Transport" value={formData.transportType} />
                                </SummaryBlock>

                                {/* Fee breakdown */}
                                {feeBreakdown ? (
                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-4">
                                        <h4 className="font-semibold text-indigo-800 text-sm">Fee Structure</h4>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div><span className="text-gray-600 font-medium">Tuition: </span>Rs.{feeBreakdown.cls.tuitionFee}/mo</div>
                                            <div><span className="text-gray-600 font-medium">Admission: </span>Rs.{feeBreakdown.cls.admissionFee} (once)</div>
                                            {feeBreakdown.transportFee > 0 && (
                                                <div><span className="text-gray-600 font-medium">Transport: </span>Rs.{feeBreakdown.transportFee}/mo</div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {feeBreakdown.rows.map((r, i) => (
                                                <div key={i} className="bg-white border border-indigo-100 rounded-lg p-2.5 text-xs">
                                                    <div className="font-medium text-indigo-600 mb-1">{r.label} {r.year}</div>
                                                    <div className="flex justify-between text-gray-600"><span>Tuition</span><span>Rs.{r.tuitionFee}</span></div>
                                                    {r.admissionFee > 0 && <div className="flex justify-between text-gray-600"><span>Admission</span><span>Rs.{r.admissionFee}</span></div>}
                                                    {r.transportFee > 0 && <div className="flex justify-between text-gray-600"><span>Transport</span><span>Rs.{r.transportFee}</span></div>}
                                                    <div className="flex justify-between font-semibold text-indigo-800 border-t pt-1 mt-1"><span>Total</span><span>Rs.{r.total}</span></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-indigo-100 border border-indigo-200 rounded-lg p-3 flex justify-between items-center">
                                            <span className="font-semibold text-indigo-800">Total Annual Fee</span>
                                            <span className="font-bold text-lg text-indigo-900">Rs.{feeBreakdown.totalAnnual.toLocaleString()}</span>
                                        </div>
                                        <p className="text-xs text-indigo-600">* Admission fee is charged only in the first month. Transport fee applies every month if selected.</p>
                                    </div>
                                ) : formData.grade ? (
                                    <p className="text-xs text-amber-600">Could not compute fee breakdown — class may not exist in settings.</p>
                                ) : null}

                                {/* Required field check */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                                    <h4 className="font-semibold text-amber-800 text-sm">Required Fields Check</h4>
                                    {[
                                        ["Student Name", formData.studentName],
                                        ["Date of Birth", formData.dob],
                                        ["Gender", formData.gender],
                                        ["Class", formData.grade],
                                        ["Phone", formData.phone],
                                        ["Address", formData.address],
                                        ["City", formData.city],
                                        ["State", formData.state],
                                        ["Admission Date", formData.admissionDate],
                                    ].map(([label, val]) => (
                                        <div key={label} className="flex items-center gap-2 text-sm">
                                            {val ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                            ) : (
                                                <X className="w-4 h-4 text-red-500 shrink-0" />
                                            )}
                                            <span className={val ? "text-gray-700" : "text-red-600"}>{label} (Required)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}
                    disabled={step === 0 || loading} className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>

                {step < STEPS.length - 1 ? (
                    <Button onClick={() => setStep((s) => s + 1)} disabled={loading} className="gap-2">
                        Next
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={loading}
                        className="bg-primary text-white gap-2 min-w-[160px]">
                        {loading ? (
                            <>
                                <Skeleton className="w-4 h-4 rounded-full" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                Submit Admission
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    )
}

// ── Helper components ────────────────────────────────────────────────────────

function SummaryBlock({
    title,
    color,
    children,
}: {
    title: string
    color: "blue" | "green" | "purple"
    children: React.ReactNode
}) {
    const colors = {
        blue: "bg-blue-50 border-blue-200 text-blue-800",
        green: "bg-green-50 border-green-200 text-green-800",
        purple: "bg-purple-50 border-purple-200 text-purple-800",
    }
    return (
        <div className={`p-4 rounded-xl border ${colors[color]} space-y-3`}>
            <h4 className="font-semibold text-sm">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{children}</div>
        </div>
    )
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
    return (
        <div className="text-sm">
            <span className="font-medium text-gray-700">{label}: </span>
            <span className="text-gray-600">{value || "Not provided"}</span>
        </div>
    )
}
