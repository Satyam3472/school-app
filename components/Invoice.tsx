"use client"

import Image from "next/image"
import { FC, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Printer, Loader2 } from "lucide-react"

interface FeeItem {
    name: string
    amount: number
}

interface InvoiceProps {
    logoUrl: string
    schoolName: string
    address: string
    mobileNumbers: string[]
    email: string
    receiptDate: string
    receiptNo: string
    admissionNo: number
    studentName: string
    studentClass: string
    paymentMode: string
    feeItems: FeeItem[]
}

const Invoice: FC<InvoiceProps> = ({
    logoUrl,
    schoolName,
    address,
    mobileNumbers,
    email,
    receiptDate,
    receiptNo,
    admissionNo,
    studentName,
    studentClass,
    paymentMode,
    feeItems,
}) => {
    const total = feeItems.reduce((sum, item) => sum + Number(item.amount), 0)
    const invoiceRef = useRef<HTMLDivElement>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownloadPDF = async () => {
        if (!invoiceRef.current || isGenerating) return
        setIsGenerating(true)

        try {
            const html2canvas = (await import("html2canvas")).default
            const { jsPDF } = await import("jspdf")

            const safeName = schoolName.replace(/[^a-zA-Z0-9]/g, "_")
            const safeReceipt = receiptNo.replace(/[^a-zA-Z0-9\-]/g, "")
            const fileName = `${safeName}_Receipt_${safeReceipt}.pdf`

            // Override oklch/lab CSS vars before capture
            const root = document.documentElement
            const origStyles = root.getAttribute("style") || ""
            root.style.setProperty("--background", "#ffffff")
            root.style.setProperty("--foreground", "#000000")
            root.style.setProperty("--card", "#ffffff")
            root.style.setProperty("--card-foreground", "#000000")
            root.style.setProperty("--border", "#e5e7eb")
            root.style.setProperty("--primary", "#111827")
            root.style.setProperty("--muted", "#f3f4f6")
            root.style.setProperty("--muted-foreground", "#6b7280")
            root.style.setProperty("--accent", "#f3f4f6")
            root.style.setProperty("--destructive", "#ef4444")

            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            })

            // Restore original styles
            root.setAttribute("style", origStyles)

            const imgData = canvas.toDataURL("image/jpeg", 0.98)
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const margin = 10
            const imgWidth = pageWidth - margin * 2
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            // If content is taller than one page, scale to fit
            const finalHeight = Math.min(imgHeight, pageHeight - margin * 2)
            const finalWidth = imgHeight > pageHeight - margin * 2
                ? (canvas.width * finalHeight) / canvas.height
                : imgWidth

            pdf.addImage(imgData, "JPEG", margin, margin, finalWidth, finalHeight)
            pdf.save(fileName)
        } catch (error) {
            console.error("Error generating PDF:", error)
            alert("Failed to generate PDF. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="relative space-y-4">
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mb-2 print:hidden">
                <Button variant="outline" onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" />
                    Print
                </Button>
                <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2">
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating…
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            Download PDF
                        </>
                    )}
                </Button>
            </div>

            {/* Invoice Content */}
            <div
                ref={invoiceRef}
                id="invoice-content"
                style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                    padding: "2rem",
                    width: "100%",
                    maxWidth: "80rem",
                    margin: "0 auto",
                    fontSize: "0.875rem",
                }}
            >
                {/* School Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1rem",
                        paddingBottom: "1rem",
                        borderBottom: "1px solid #d1d5db",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt="School Logo"
                                width={60}
                                height={60}
                                style={{
                                    height: "4rem",
                                    width: "4rem",
                                    objectFit: "contain",
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    height: "4rem",
                                    width: "4rem",
                                    backgroundColor: "#e5e7eb",
                                    borderRadius: "0.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    fontSize: "1.25rem",
                                    color: "#6b7280",
                                }}
                            >
                                {schoolName.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                                {schoolName.toUpperCase()}
                            </h1>
                            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                Shaping Minds, Building Future
                            </p>
                        </div>
                    </div>
                    <div
                        style={{
                            textAlign: "right",
                            fontSize: "0.875rem",
                            lineHeight: "1.25rem",
                        }}
                    >
                        <p>{address}</p>
                        <p>Mobile: {mobileNumbers.join(", ")}</p>
                        <p>Email: {email}</p>
                    </div>
                </div>

                {/* Title */}
                <h2
                    style={{
                        textAlign: "center",
                        fontSize: "1rem",
                        fontWeight: "600",
                        textDecoration: "underline",
                        marginBottom: "1.5rem",
                    }}
                >
                    Fee Receipt
                </h2>

                {/* Student and Receipt Info */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.25rem 0",
                        fontSize: "0.875rem",
                        marginBottom: "1.5rem",
                    }}
                >
                    <p>
                        <strong>Date:</strong> {receiptDate}
                    </p>
                    <p>
                        <strong>Receipt No.:</strong> {receiptNo}
                    </p>
                    <p>
                        <strong>Payment Mode:</strong> {paymentMode}
                    </p>
                    <p>
                        <strong>Student:</strong> {studentName}
                    </p>
                    <p>
                        <strong>Class:</strong> {studentClass}
                    </p>
                    <p>
                        <strong>Admission No.:</strong> {admissionNo}
                    </p>
                </div>

                {/* Fee Details Table */}
                <table
                    style={{
                        width: "100%",
                        fontSize: "0.875rem",
                        marginBottom: "1.5rem",
                        border: "1px solid #d1d5db",
                    }}
                >
                    <thead style={{ backgroundColor: "#f3f4f6" }}>
                        <tr>
                            <th
                                style={{
                                    padding: "0.5rem",
                                    textAlign: "left",
                                    width: "4rem",
                                    borderRight: "1px solid #d1d5db",
                                }}
                            >
                                Sr. #
                            </th>
                            <th
                                style={{
                                    padding: "0.5rem",
                                    textAlign: "left",
                                    borderRight: "1px solid #d1d5db",
                                }}
                            >
                                Fee Name
                            </th>
                            <th style={{ padding: "0.5rem", textAlign: "right" }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feeItems.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: "1px solid #d1d5db" }}>
                                <td
                                    style={{
                                        padding: "0.5rem",
                                        borderRight: "1px solid #d1d5db",
                                    }}
                                >
                                    {idx + 1}
                                </td>
                                <td
                                    style={{
                                        padding: "0.5rem",
                                        borderRight: "1px solid #d1d5db",
                                    }}
                                >
                                    {item.name}
                                </td>
                                <td style={{ padding: "0.5rem", textAlign: "right" }}>
                                    ₹{Number(item.amount).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                    }}
                >
                    <div
                        style={{
                            textAlign: "right",
                            fontStyle: "italic",
                            fontSize: "0.875rem",
                            marginBottom: "2rem",
                            color: "#6b7280",
                            borderBottom: "1px solid #d1d5db",
                            paddingBottom: "0.25rem",
                        }}
                    >
                        (Signature of the person issuing the receipt)
                    </div>

                    <div
                        style={{
                            textAlign: "right",
                            fontSize: "1rem",
                            fontWeight: "600",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Net Amount Payable: ₹
                        {total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Invoice
