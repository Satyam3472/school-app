"use client"

import React, { useState, useEffect } from "react"
import { Download, Plus, CheckCircle2, XCircle, AlertCircle, Search, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDashboardNav } from "../layout"
import { Skeleton } from "@/components/ui/skeleton"
import { showErrorAlert, showSuccessAlert } from "@/utils/customFunction"

const statusConfig = {
    Paid: {
        class: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300",
        icon: <CheckCircle2 className="w-4 h-4" />,
        label: "Paid",
    },
    Unpaid: {
        class: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
        icon: <XCircle className="w-4 h-4" />,
        label: "Unpaid",
    },
    Partial: {
        class: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
        icon: <AlertCircle className="w-4 h-4" />,
        label: "Partial",
    },
}

const categoryColors = {
    Utilities: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    Supplies: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    Maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    Salaries: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    Other: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
}

type Expense = {
    id: number
    title: string
    description?: string | null
    category: string
    amount: number | string
    expenseDate: string
    createdAt?: string
    updatedAt?: string
    status: string
}

function StatCard({
    title,
    value,
    icon,
    color,
    bgColor,
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    color: string
    bgColor: string
}) {
    return (
        <Card className="p-3 shadow-none border">
            <CardContent className="p-0">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`p-1.5 rounded-md ${bgColor} ${color}`}>{icon}</div>
                            <span className="text-xs text-muted-foreground">{title}</span>
                        </div>
                        <p className="text-lg font-semibold">{value}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const formatDate = (dateString: string) => {
    const dateObj = new Date(dateString)
    const day = String(dateObj.getDate()).padStart(2, "0")
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const year = dateObj.getFullYear()
    return `${day}/${month}/${year}`
}

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [filter, setFilter] = useState("All")
    const [search, setSearch] = useState("")
    const [form, setForm] = useState({
        category: "",
        description: "",
        amount: "",
        status: "Paid",
        date: new Date().toISOString().split("T")[0],
        title: "",
    })
    const { setBreadcrumb, setPageTitle } = useDashboardNav()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setBreadcrumb([
            { label: "Dashboard", href: "/dashboard" },
            { label: "Expenses" },
        ])
        setPageTitle("Expenses")
    }, [setBreadcrumb, setPageTitle])

    useEffect(() => {
        async function fetchExpenses() {
            setLoading(true)
            try {
                const res = await fetch("/api/expenses")
                const result = await res.json()
                if (result.success) {
                    setExpenses(
                        result.data.map((exp: Record<string, unknown>) => ({
                            ...exp,
                            status: "Paid",
                        }))
                    )
                } else {
                    showErrorAlert("Error", "Failed to fetch expenses")
                }
            } catch {
                showErrorAlert("Error", "Error loading expenses")
            } finally {
                setLoading(false)
            }
        }
        fetchExpenses()
    }, [])

    const filteredExpenses = expenses.filter((exp) => {
        const matchesStatus = filter === "All" || exp.status === filter
        const matchesSearch =
            (exp.description?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (exp.category?.toLowerCase() || "").includes(search.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

    const handleStatusChange = (id: number, newStatus: string) => {
        setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)))
        showSuccessAlert("Success", "Status updated")
    }

    const exportToCSV = () => {
        const headers = ["Category", "Description", "Amount", "Status", "Date"]
        const csv = [
            headers.join(","),
            ...filteredExpenses.map((exp) =>
                [exp.category, exp.description, exp.amount, exp.status, exp.expenseDate].join(",")
            ),
        ].join("\n")
        const blob = new Blob([csv], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.category || !form.description || !form.amount) {
            showErrorAlert("Error", "Please fill all required fields")
            return
        }

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.category,
                    category: form.category,
                    description: form.description,
                    amount: form.amount,
                    expenseDate: form.date,
                }),
            })
            const result = await res.json()
            if (result.success) {
                setExpenses((prev) => [...prev, { ...result.data, status: form.status }])
                setForm({
                    category: "",
                    description: "",
                    amount: "",
                    status: "Paid",
                    date: new Date().toISOString().split("T")[0],
                    title: "",
                })
                showSuccessAlert("Success", "Expense added successfully")
            } else {
                showErrorAlert("Error", result.error || "Failed to add expense")
            }
        } catch {
            showErrorAlert("Error", "Error adding expense")
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Expense Management</h1>
                    <p className="text-muted-foreground text-sm">Track and analyze school expenditures</p>
                </div>
            </div>

            {/* Stats Cards */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-lg" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard
                        title="Total Expenses"
                        value={`Rs.${totalExpenses.toLocaleString()}`}
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        }
                        color="text-gray-600"
                        bgColor="bg-gray-100"
                    />
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const total = expenses
                            .filter((e) => e.status === status)
                            .reduce((sum, e) => sum + Number(e.amount), 0)
                        return (
                            <StatCard
                                key={status}
                                title={config.label}
                                value={`Rs.${total.toLocaleString()}`}
                                icon={config.icon}
                                color={config.class.split(" ")[1]}
                                bgColor={config.class.split(" ")[0]}
                            />
                        )
                    })}
                </div>
            )}

            {/* Add Expense Form */}
            <Card className="shadow-sm border rounded-xl">
                <CardHeader className="px-6 pt-4 pb-3 border-b bg-muted/30 rounded-t-xl">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        Add New Expense
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleAddExpense} className="space-y-2">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="amount">Amount (Rs.)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="Enter amount"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(value) => setForm({ ...form, category: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Utilities">Utilities</SelectItem>
                                        <SelectItem value="Supplies">Supplies</SelectItem>
                                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                                        <SelectItem value="Salaries">Salaries</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1 col-span-2 sm:col-span-1">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    placeholder="e.g., Water bill for July"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(value) => setForm({ ...form, status: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Paid">Paid</SelectItem>
                                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                                        <SelectItem value="Partial">Partial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end col-span-2 sm:col-span-1">
                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Expense
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Expense Records */}
            <Card className="shadow-sm border py-0 gap-0">
                <CardHeader className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <CardTitle className="text-lg flex items-center justify-between gap-3">
                            Expense Records
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToCSV}
                                className="gap-2 py-1 bg-green-600 text-white hover:bg-green-700 hover:text-white"
                            >
                                <Upload className="w-4 h-4" />
                                Export CSV
                            </Button>
                        </CardTitle>
                        <div className="flex flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search expenses..."
                                    className="pl-9 w-full sm:w-[240px]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Expenses</SelectItem>
                                    <SelectItem value="Paid">Paid</SelectItem>
                                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                                    <SelectItem value="Partial">Partial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-4 space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-md" />
                            ))}
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                            <Download className="w-10 h-10 opacity-30" />
                            <p className="text-sm">No expenses found</p>
                        </div>
                    ) : (
                        <>
                            {/* Table — md and above */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow>
                                            <TableHead className="w-[140px]">Date</TableHead>
                                            <TableHead className="w-[160px]">Category</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="w-[120px]">Amount</TableHead>
                                            <TableHead className="w-[140px]">Status</TableHead>
                                            <TableHead className="w-[140px] text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredExpenses.map((exp) => (
                                            <TableRow key={exp.id} className="hover:bg-muted/50">
                                                <TableCell className="font-medium">{formatDate(exp.expenseDate)}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${categoryColors[exp.category as keyof typeof categoryColors] ||
                                                            categoryColors.Other
                                                            }`}
                                                    >
                                                        {exp.category}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="max-w-[240px] truncate">{exp.description}</TableCell>
                                                <TableCell className="font-medium">
                                                    Rs.{Number(exp.amount).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div
                                                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${statusConfig[exp.status as keyof typeof statusConfig]?.class ||
                                                            statusConfig.Paid.class
                                                            }`}
                                                    >
                                                        {statusConfig[exp.status as keyof typeof statusConfig]?.icon}
                                                        {exp.status}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Select
                                                        value={exp.status}
                                                        onValueChange={(value) => handleStatusChange(exp.id, value)}
                                                    >
                                                        <SelectTrigger className="w-[120px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Paid">Paid</SelectItem>
                                                            <SelectItem value="Unpaid">Unpaid</SelectItem>
                                                            <SelectItem value="Partial">Partial</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Card view — mobile */}
                            <div className="md:hidden p-4 space-y-2">
                                {filteredExpenses.map((exp) => (
                                    <Card
                                        key={exp.id}
                                        className="border py-0 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden"
                                    >
                                        <CardContent className="p-4 space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-xl font-bold">
                                                    Rs.{Number(exp.amount).toLocaleString()}
                                                </div>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[exp.category as keyof typeof categoryColors] ||
                                                        categoryColors.Other
                                                        }`}
                                                >
                                                    {exp.category}
                                                </span>
                                                <Select
                                                    value={exp.status}
                                                    onValueChange={(value) => handleStatusChange(exp.id, value)}
                                                >
                                                    <SelectTrigger className="w-[110px] text-xs font-medium">
                                                        <SelectValue placeholder="Update status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Paid">Paid</SelectItem>
                                                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                                                        <SelectItem value="Partial">Partial</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex justify-between gap-1 text-sm">
                                                <span className="font-medium text-foreground">{exp.description}</span>
                                                <span className="text-muted-foreground">{formatDate(exp.expenseDate)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
