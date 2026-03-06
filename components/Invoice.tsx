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
    studentName: string
    fatherName: string
    motherName: string
    regNo: string
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
    studentName,
    fatherName,
    motherName,
    regNo,
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

            root.setAttribute("style", origStyles)

            const imgData = canvas.toDataURL("image/jpeg", 0.98)
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const pageWidth = pdf.internal.pageSize.getWidth()
            const halfPageHeight = pdf.internal.pageSize.getHeight() / 2
            const margin = 5
            const imgWidth = pageWidth - margin * 2
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            const finalHeight = Math.min(imgHeight, halfPageHeight - margin * 2)
            const finalWidth = imgHeight > halfPageHeight - margin * 2
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

            {/* Invoice Content — sized to fit half of A4 */}
            <div
                ref={invoiceRef}
                id="invoice-content"
                style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    borderRadius: "0.5rem",
                    width: "100%",
                    maxWidth: "720px",
                    margin: "0 auto",
                    fontSize: "0.8rem",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* ── Decorative Border — solid black ── */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        border: "3px solid #000000",
                        borderRadius: "0.5rem",
                        pointerEvents: "none",
                        zIndex: 1,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        inset: "5px",
                        border: "1px solid #000000",
                        borderRadius: "0.3rem",
                        pointerEvents: "none",
                        zIndex: 1,
                    }}
                />

                {/* Inner content with padding */}
                <div style={{ padding: "1.25rem 1.5rem 1rem", position: "relative", zIndex: 0 }}>
                    {/* School Header */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "0.6rem",
                            paddingBottom: "0.5rem",
                            borderBottom: "2px solid #000000",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt="School Logo"
                                    width={48}
                                    height={48}
                                    style={{
                                        height: "3rem",
                                        width: "3rem",
                                        objectFit: "contain",
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        height: "3rem",
                                        width: "3rem",
                                        backgroundColor: "#e5e7eb",
                                        borderRadius: "0.5rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        fontSize: "1rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    {schoolName.charAt(0)}
                                </div>
                            )}
                            <div>
                                <h1
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: "bold",
                                        color: "#000000",
                                        margin: 0,
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    {schoolName.toUpperCase()}
                                </h1>
                                <p style={{ fontSize: "0.65rem", color: "#6b7280", margin: 0 }}>
                                    Shaping Minds, Building Future
                                </p>
                            </div>
                        </div>
                        <div
                            style={{
                                textAlign: "right",
                                fontSize: "0.7rem",
                                lineHeight: "1.15rem",
                                color: "#374151",
                            }}
                        >
                            {address && <p style={{ margin: 0 }}>{address}</p>}
                            {mobileNumbers.length > 0 && (
                                <p style={{ margin: 0 }}>Mobile: {mobileNumbers.join(", ")}</p>
                            )}
                            {email && <p style={{ margin: 0 }}>Email: {email}</p>}
                        </div>
                    </div>

                    {/* Title */}
                    <h2
                        style={{
                            textAlign: "center",
                            fontSize: "0.9rem",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "2px",
                            marginBottom: "0.75rem",
                            color: "#000000",
                        }}
                    >
                        Fee Receipt
                    </h2>

                    {/* Student and Receipt Info — compact grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: "0.2rem 0.5rem",
                            fontSize: "0.78rem",
                            marginBottom: "0.75rem",
                            backgroundColor: "#f8fafc",
                            padding: "0.5rem 0.6rem",
                            borderRadius: "0.25rem",
                            border: "1px solid #d1d5db",
                        }}
                    >
                        <p style={{ margin: 0 }}>
                            <strong>Date:</strong> {receiptDate}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Receipt No.:</strong> {receiptNo}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Payment:</strong> {paymentMode}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Student:</strong> {studentName}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Father:</strong> {fatherName}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Mother:</strong> {motherName}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Reg. No.:</strong> {regNo}
                        </p>
                        <p style={{ margin: 0 }}>
                            <strong>Class:</strong> {studentClass}
                        </p>
                        <p style={{ margin: 0 }}></p>
                    </div>

                    {/* Fee Details Table — using inline styles for print reliability */}
                    <table
                        style={{
                            width: "100%",
                            fontSize: "0.78rem",
                            marginBottom: "0.75rem",
                            borderCollapse: "collapse",
                            border: "1px solid #000000",
                            tableLayout: "fixed",
                        }}
                    >
                        <colgroup>
                            <col style={{ width: "10%" }} />
                            <col style={{ width: "60%" }} />
                            <col style={{ width: "30%" }} />
                        </colgroup>
                        <thead>
                            <tr
                                style={{
                                    backgroundColor: "#000000",
                                    color: "#ffffff",
                                    WebkitPrintColorAdjust: "exact",
                                    printColorAdjust: "exact" as any,
                                }}
                            >
                                <th
                                    style={{
                                        padding: "0.35rem 0.5rem",
                                        textAlign: "left",
                                        borderRight: "1px solid #333333",
                                        fontWeight: 600,
                                    }}
                                >
                                    Sr.
                                </th>
                                <th
                                    style={{
                                        padding: "0.35rem 0.5rem",
                                        textAlign: "left",
                                        borderRight: "1px solid #333333",
                                        fontWeight: 600,
                                    }}
                                >
                                    Fee Name
                                </th>
                                <th
                                    style={{
                                        padding: "0.35rem 0.5rem",
                                        textAlign: "right",
                                        fontWeight: 600,
                                    }}
                                >
                                    Amount (₹)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeItems.map((item, idx) => (
                                <tr
                                    key={idx}
                                    style={{
                                        borderBottom: "1px solid #d1d5db",
                                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f9fafb",
                                        WebkitPrintColorAdjust: "exact",
                                        printColorAdjust: "exact" as any,
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "0.3rem 0.5rem",
                                            borderRight: "1px solid #d1d5db",
                                        }}
                                    >
                                        {idx + 1}
                                    </td>
                                    <td
                                        style={{
                                            padding: "0.3rem 0.5rem",
                                            borderRight: "1px solid #d1d5db",
                                        }}
                                    >
                                        {item.name}
                                    </td>
                                    <td style={{ padding: "0.3rem 0.5rem", textAlign: "right" }}>
                                        ₹{Number(item.amount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr
                                style={{
                                    backgroundColor: "#000000",
                                    color: "#ffffff",
                                    fontWeight: 700,
                                    WebkitPrintColorAdjust: "exact",
                                    printColorAdjust: "exact" as any,
                                }}
                            >
                                <td
                                    colSpan={2}
                                    style={{
                                        padding: "0.4rem 0.5rem",
                                        textAlign: "right",
                                        borderRight: "1px solid #333333",
                                    }}
                                >
                                    Net Amount Payable
                                </td>
                                <td style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>
                                    ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Footer */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            marginTop: "0.5rem",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "0.65rem",
                                color: "#9ca3af",
                                fontStyle: "italic",
                            }}
                        >
                            This is a computer-generated receipt.
                        </div>
                        <div
                            style={{
                                textAlign: "right",
                                fontStyle: "italic",
                                fontSize: "0.7rem",
                                color: "#6b7280",
                                borderTop: "1px solid #d1d5db",
                                paddingTop: "0.2rem",
                                minWidth: "140px",
                            }}
                        >
                            Authorized Signatory
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Invoice
