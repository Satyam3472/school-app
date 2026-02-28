"use client"

import React from "react"
import { Student, MonthlyFee } from "@/types/fee-management"
import { Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
    students: Student[]
    monthlyFees: MonthlyFee[]
    getPendingFeesCount: (student: Student) => number
    getTotalCollection: () => number
    getPaidThisMonth: () => number
}

export default function StatsCards({
    students,
    monthlyFees,
    getPendingFeesCount,
    getTotalCollection,
    getPaidThisMonth,
}: Props) {
    const totalStudents = students.length
    const studentsWithPending = students.filter((s) => getPendingFeesCount(s) > 0).length
    const totalCollection = getTotalCollection()
    const paidThisMonth = getPaidThisMonth()

    const stats = [
        {
            label: "Total Students",
            value: totalStudents,
            sub: `${students.filter((s) => s.isActive).length} active`,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            label: "Pending Fees",
            value: studentsWithPending,
            sub: "students with dues",
            icon: AlertTriangle,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            label: "Total Collected",
            value: `Rs.${totalCollection.toLocaleString()}`,
            sub: "all time",
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
        },
        {
            label: "Collected This Month",
            value: `Rs.${paidThisMonth.toLocaleString()}`,
            sub: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
            icon: DollarSign,
            color: "text-purple-600",
            bg: "bg-purple-50",
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
