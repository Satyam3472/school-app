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
    ArrowUpRight,
    ArrowDownRight,
    Target,
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
} from "recharts"
import AdmissionForm from "./admissions/page"

const feeCollectionData = [
    { status: "Paid", value: 75, color: "#10b981" },
    { status: "Pending", value: 15, color: "#f59e0b" },
    { status: "Overdue", value: 10, color: "#ef4444" },
]

const attendanceData = [
    { day: "Mon", present: 1180, absent: 65 },
    { day: "Tue", present: 1195, absent: 50 },
    { day: "Wed", present: 1205, absent: 40 },
    { day: "Thu", present: 1210, absent: 35 },
    { day: "Fri", present: 1220, absent: 25 },
]

const EXPENSE_COLORS: Record<string, string> = {
    Utilities: "#3b82f6",
    Supplies: "#f59e0b",
    Maintenance: "#8b5cf6",
    Salaries: "#10b981",
    Other: "#ef4444",
}
const COLOR_LIST = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#14b8a6"]

const chartConfig = {
    present: { label: "Present", color: "#10b981" },
    absent: { label: "Absent", color: "#ef4444" },
}

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

export default function Dashboard() {
    const { setBreadcrumb, setPageTitle } = useDashboardNav()
    const [expenseBreakdown, setExpenseBreakdown] = useState<ChartSlice[]>([])
    const [totalExpenses, setTotalExpenses] = useState(0)

    useEffect(() => {
        setBreadcrumb([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Overview" },
        ])
        setPageTitle("Overview")
    }, [setBreadcrumb, setPageTitle])

    // Fetch real expense data for charts
    useEffect(() => {
        async function loadExpenses() {
            try {
                const res = await fetch("/api/expenses")
                const result = await res.json()
                if (result.success) {
                    const expenses: ExpenseEntry[] = result.data
                    // Group by category
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
            } catch (e) {
                // silently fail — chart stays empty
            }
        }
        loadExpenses()
    }, [])

    return (
        <div className="flex flex-1 flex-col gap-6 p-6">
            {/* Header Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm py-2">
                    <CardContent className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                                <p className="text-2xl font-bold">1,245</p>
                                <div className="flex items-center text-xs text-green-600">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    +12% from last month
                                </div>
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
                                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Attendance</p>
                                <p className="text-2xl font-bold">1,020</p>
                                <div className="flex items-center text-xs text-green-600">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    98.2% attendance rate
                                </div>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                                <CalendarCheck className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm py-2">
                    <CardContent className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                                <p className="text-2xl font-bold text-green-600">Rs.65,000</p>
                                <div className="flex items-center text-xs text-green-600">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    +15.3% from last month
                                </div>
                            </div>
                            <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm py-2">
                    <CardContent className="px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                                <p className="text-2xl font-bold text-red-600">
                                    Rs.{totalExpenses > 0 ? totalExpenses.toLocaleString() : "—"}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {expenseBreakdown.length > 0 ? `${expenseBreakdown.length} categories` : "No data yet"}
                                </div>
                            </div>
                            <div className="bg-rose-100 dark:bg-rose-900/20 p-3 rounded-lg">
                                <TrendingDown className="w-6 h-6 text-rose-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Admission Form embed */}
                <Card className="lg:col-span-2 shadow-sm py-0">
                    <CardContent className="px-0">
                        <AdmissionForm />
                    </CardContent>
                </Card>

                {/* Fee Collection Status */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Fee Collection
                        </CardTitle>
                        <CardDescription>Current payment status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center">
                            <RechartsPieChart width={200} height={200}>
                                <Pie
                                    data={feeCollectionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {feeCollectionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <ChartTooltip />
                            </RechartsPieChart>
                        </div>
                        <div className="mt-4 space-y-2">
                            {feeCollectionData.map((item) => (
                                <div key={item.status} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-muted-foreground">{item.status}</span>
                                    </div>
                                    <span className="font-medium">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Weekly Attendance */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-blue-600" />
                            Weekly Attendance
                        </CardTitle>
                        <CardDescription>Present vs absent students</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <BarChart data={attendanceData}>
                                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

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
            </div>

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="shadow-sm py-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Student Growth</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">This Month</span>
                                <span className="font-medium text-green-600">+15</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">This Year</span>
                                <span className="font-medium text-green-600">+89</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm py-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Revenue Growth</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">This Month</span>
                                <span className="font-medium text-green-600">+12.5%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">This Year</span>
                                <span className="font-medium text-green-600">+28.3%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm py-0">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CalendarCheck className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">Attendance Rate</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">This Week</span>
                                <span className="font-medium">98.2%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">This Month</span>
                                <span className="font-medium">97.8%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
