'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"

export default function AdmissionForm() {
    return (
        <div className="flex flex-col gap-4 p-6 h-full">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">New Admission</h3>
                    <p className="text-sm text-muted-foreground">Quick student registration</p>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {/* Placeholder fields */}
                {[
                    { label: "Student Name", placeholder: "Enter full name" },
                    { label: "Class", placeholder: "Select class" },
                    { label: "Parent Name", placeholder: "Enter parent name" },
                    { label: "Contact Number", placeholder: "Enter phone number" },
                    { label: "Date of Birth", placeholder: "DD/MM/YYYY" },
                    { label: "Address", placeholder: "Enter address" },
                ].map((field) => (
                    <div key={field.label} className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-foreground">{field.label}</label>
                        <input
                            type="text"
                            placeholder={field.placeholder}
                            disabled
                            className="h-9 rounded-md border border-border bg-muted/40 px-3 py-1 text-sm text-muted-foreground cursor-not-allowed"
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground italic">
                    Full admission management coming soon
                </p>
                <button
                    disabled
                    className="inline-flex items-center gap-2 rounded-md bg-primary/60 px-4 py-2 text-sm font-medium text-primary-foreground cursor-not-allowed opacity-60"
                >
                    <UserPlus className="w-4 h-4" />
                    Submit
                </button>
            </div>
        </div>
    )
}
