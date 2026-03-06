'use client'
import { useEffect, useState } from "react"
import { useDashboardNav } from "./layout"
import {
    CalendarCheck,
    TrendingDown,
    TrendingUp,
    Users,
    DollarSign,
    PieChart,
    GraduationCap,
    UserPlus,
    Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import {
    Bar,
    BarChart,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts"

const EXPENSE_COLORS: Record<string, string> = {
    Utilities: "#3b82f6",
    Supplies: "#f59e0b",
    Maintenance: "#8b5cf6",
    Salaries: "#10b981",
    Other: "#ef4444",
}
const COLOR_LIST = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"]

const CLASS_COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444",
    "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16",
    "#06b6d4", "#e11d48",
]

type ExpenseEntry = {
    id: number
    category: string
    amount: number
    expenseDate: string
}

type ChartSlice = {
    category: string
    amount: number
    color: string
}

type FeeBreakdownItem = {
    status: string
    value: number
    color: string
}

type ClassDistItem = {
    className: string
    count: number
}

type RecentAdmission = {
    id: number
    studentName: string
    classEnrolled: string
    section: string
    admissionDate: string
    photoBase64: string | null
}

type DashboardStats = {
    totalStudents: number
    monthlyIncome: number
    totalExpectedFees: number
    totalExpenses: number
    totalAllExpenses: number
    profit: number
    feeBreakdown: FeeBreakdownItem[]
    classDistribution: ClassDistItem[]
    recentAdmissions: RecentAdmission[]
    currentMonth: number
    currentYear: number
}

const MONTH_NAMES = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

export default function Dashboard() {
    const { setBreadcrumb, setPageTitle } = useDashboardNav()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    // Expense breakdown (separate fetch for the chart detail)
    const [expenseBreakdown, setExpenseBreakdown] = useState<ChartSlice[]>([])
    const [totalExpenses, setTotalExpenses] = useState(0)

    useEffect(() => {
        setBreadcrumb([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Overview" },
        ])
        setPageTitle("Overview")
    }, [setBreadcrumb, setPageTitle])

    // Fetch dashboard stats
    useEffect(() => {
        async function loadStats() {
            try {
                const res = await fetch("/api/dashboard/stats")
                const result = await res.json()
                if (result.success) {
                    setStats(result.data)
                }
            } catch {
                // silently fail
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [])

    // Fetch real expense data for charts
    useEffect(() => {
        async function loadExpenses() {
            try {
                const res = await fetch("/api/expenses")
                const result = await res.json()
                if (result.success) {
                    const expenses: ExpenseEntry[] = result.data
                    const grouped: Record<string, number> = {}
                    let total = 0
                    for (const exp of expenses) {
                        const cat = exp.category || "Other"
                        grouped[cat] = (grouped[cat] || 0) + Number(exp.amount)
                        total += Number(exp.amount)
                    }
                    const breakdown = Object.entries(grouped).map(([category, amount], i) => ({
                        category,
                        amount,
                        color: EXPENSE_COLORS[category] || COLOR_LIST[i % COLOR_LIST.length],
                    }))
                    setExpenseBreakdown(breakdown)
                    setTotalExpenses(total)
                }
            } catch {
                // silently fail — chart stays empty
            }
        }
        loadExpenses()
    }, [])

    const monthLabel = stats ? MONTH_NAMES[stats.currentMonth] : ""

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm py-2">
                    <CardContent className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                                <p className="text-2xl font-bold">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    ) : (
                                        stats?.totalStudents?.toLocaleString() ?? "0"
                                    )}
                                </p>
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm py-2">
                    <CardContent className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Income ({monthLabel})
                                </p>
                                <p className="text-2xl font-bold text-green-600">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    ) : (
                                        `Rs.${(stats?.monthlyIncome ?? 0).toLocaleString()}`
                                    )}
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm py-2">
                    <CardContent className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Expenses ({monthLabel})
                                </p>
                                <p className="text-2xl font-bold text-red-600">
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    ) : (
                                        `Rs.${(stats?.totalExpenses ?? 0).toLocaleString()}`
                                    )}
                                </p>
                            </div>
                            <div className="bg-rose-100 dark:bg-rose-900/20 p-3 rounded-lg">
                                <TrendingDown className="w-6 h-6 text-rose-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm py-2">
                    <CardContent className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Profit ({monthLabel})
                                </p>
                                <p className={`text-2xl font-bold ${(stats?.profit ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    ) : (
                                        `Rs.${(stats?.profit ?? 0).toLocaleString()}`
                                    )}
                                </p>
                            </div>
                            <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-lg">
                                <CalendarCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Fee Collection — real data */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Fee Collection
                        </CardTitle>
                        <CardDescription>
                            {monthLabel} {stats?.currentYear} payment status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : !stats?.feeBreakdown?.length ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                                <DollarSign className="w-10 h-10 opacity-20" />
                                <p className="text-sm">No fee records for this month</p>
                            </div>
                        ) : (
                            <>
                                <div className="h-[200px] flex items-center justify-center">
                                    <RechartsPieChart width={200} height={200}>
                                        <Pie
                                            data={stats.feeBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.feeBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip />
                                    </RechartsPieChart>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {stats.feeBreakdown.map((item) => (
                                        <div key={item.status} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="text-muted-foreground">{item.status}</span>
                                            </div>
                                            <span className="font-medium">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Class-wise Student Distribution — real data */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            Students by Class
                        </CardTitle>
                        <CardDescription>Active student distribution across classes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : !stats?.classDistribution?.length ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                                <GraduationCap className="w-10 h-10 opacity-20" />
                                <p className="text-sm">No student data yet</p>
                            </div>
                        ) : (
                            <div className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.classDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                        <XAxis
                                            dataKey="className"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                        />
                                        <ChartTooltip />
                                        <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                                            {stats.classDistribution.map((_, index) => (
                                                <Cell
                                                    key={`bar-${index}`}
                                                    fill={CLASS_COLORS[index % CLASS_COLORS.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Row: Expense Breakdown + Recent Admissions */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Expense Breakdown — real data */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-purple-600" />
                            Expense Breakdown
                        </CardTitle>
                        <CardDescription>
                            {expenseBreakdown.length > 0
                                ? "Live data from expense records"
                                : "Add expenses to see breakdown"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {expenseBreakdown.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                                <TrendingDown className="w-10 h-10 opacity-20" />
                                <p className="text-sm">No expense data yet</p>
                                <a href="/dashboard/expenses" className="text-xs text-blue-600 underline">
                                    Add expenses
                                </a>
                            </div>
                        ) : (
                            <>
                                <div className="h-[200px] flex items-center justify-center">
                                    <RechartsPieChart width={200} height={200}>
                                        <Pie
                                            data={expenseBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="amount"
                                        >
                                            {expenseBreakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <ChartTooltip />
                                    </RechartsPieChart>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {expenseBreakdown.map((item) => (
                                        <div key={item.category} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                <span className="text-muted-foreground">{item.category}</span>
                                            </div>
                                            <span className="font-medium">Rs.{item.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Admissions */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-emerald-600" />
                            Recent Admissions
                        </CardTitle>
                        <CardDescription>Latest enrolled students</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center h-[200px]">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : !stats?.recentAdmissions?.length ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground gap-2">
                                <UserPlus className="w-10 h-10 opacity-20" />
                                <p className="text-sm">No admissions yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.recentAdmissions.map((admission) => (
                                    <div
                                        key={admission.id}
                                        className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                                    >
                                        <div className="flex-shrink-0">
                                            {admission.photoBase64 ? (
                                                <img
                                                    src={admission.photoBase64}
                                                    alt={admission.studentName}
                                                    className="w-9 h-9 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-blue-600">
                                                        {admission.studentName.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {admission.studentName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Class {admission.classEnrolled} — Sec {admission.section}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(admission.admissionDate).toLocaleDateString("en-IN", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
