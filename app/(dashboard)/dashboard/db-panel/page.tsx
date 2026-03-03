"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useDashboardNav } from "../layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Database, RefreshCw, Plus, Pencil, Trash2, X,
    ChevronLeft, ChevronRight, Search, Loader2, AlertTriangle
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────
interface Column {
    cid: number; name: string; type: string;
    notnull: number; dflt_value: string | null; pk: number
}
interface Pagination {
    page: number; limit: number; total: number; totalPages: number
}

// ─── Main Component ─────────────────────────────────────────────
export default function DBPanelPage() {
    const { setBreadcrumb, setPageTitle } = useDashboardNav()

    const [tables, setTables] = useState<string[]>([])
    const [activeTable, setActiveTable] = useState<string | null>(null)
    const [columns, setColumns] = useState<Column[]>([])
    const [rows, setRows] = useState<Record<string, unknown>[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [tableLoading, setTableLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"create" | "edit">("create")
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [formLoading, setFormLoading] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)

    // Delete confirmation
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Sidebar toggle for mobile
    const [showTableList, setShowTableList] = useState(true)

    useEffect(() => {
        setBreadcrumb([
            { label: "Dashboard", href: "/dashboard" },
            { label: "DB Panel" },
        ])
        setPageTitle("Database Admin Panel")
    }, [setBreadcrumb, setPageTitle])

    // Fetch tables
    useEffect(() => {
        (async () => {
            setTableLoading(true)
            try {
                const res = await fetch("/api/db-panel")
                const data = await res.json()
                if (data.success) setTables(data.tables)
                else setError(data.error)
            } catch { setError("Failed to load tables") }
            finally { setTableLoading(false) }
        })()
    }, [])

    // Fetch table data
    const fetchData = useCallback(async (table: string, page = 1, searchTerm = "") => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({ page: String(page), limit: "20" })
            if (searchTerm) params.set("search", searchTerm)
            const res = await fetch(`/api/db-panel/${table}?${params}`)
            const data = await res.json()
            if (data.success) {
                setRows(data.data)
                setPagination(data.pagination)
            } else { setError(data.error) }
        } catch { setError("Failed to fetch data") }
        finally { setLoading(false) }
    }, [])

    // Fetch schema
    const fetchSchema = useCallback(async (table: string) => {
        try {
            const res = await fetch(`/api/db-panel/${table}/schema`)
            const data = await res.json()
            if (data.success) setColumns(data.columns)
        } catch { /* ignore */ }
    }, [])

    const selectTable = useCallback((table: string) => {
        setActiveTable(table)
        setSearch("")
        setSearchInput("")
        fetchSchema(table)
        fetchData(table)
        setShowTableList(false)
    }, [fetchSchema, fetchData])

    const handleSearch = () => {
        setSearch(searchInput)
        if (activeTable) fetchData(activeTable, 1, searchInput)
    }

    // ─── CRUD handlers ──────────────────────────────────────────
    const openCreateModal = () => {
        const defaults: Record<string, string> = {}
        columns.forEach((c) => {
            if (c.pk === 1) return // skip auto-increment PK
            defaults[c.name] = c.dflt_value?.replace(/^'|'$/g, "") || ""
        })
        setFormData(defaults)
        setModalMode("create")
        setFormError(null)
        setModalOpen(true)
    }

    const openEditModal = (row: Record<string, unknown>) => {
        const data: Record<string, string> = {}
        columns.forEach((c) => {
            data[c.name] = row[c.name] != null ? String(row[c.name]) : ""
        })
        setFormData(data)
        setModalMode("edit")
        setFormError(null)
        setModalOpen(true)
    }

    const handleFormSubmit = async () => {
        if (!activeTable) return
        setFormLoading(true)
        setFormError(null)
        try {
            const method = modalMode === "create" ? "POST" : "PUT"
            const res = await fetch(`/api/db-panel/${activeTable}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const data = await res.json()
            if (data.success) {
                setModalOpen(false)
                fetchData(activeTable, pagination?.page || 1, search)
            } else {
                setFormError(data.error)
            }
        } catch { setFormError("Request failed") }
        finally { setFormLoading(false) }
    }

    const handleDelete = async () => {
        if (!activeTable || deleteId === null) return
        setDeleteLoading(true)
        try {
            const res = await fetch(`/api/db-panel/${activeTable}?id=${deleteId}`, {
                method: "DELETE",
            })
            const data = await res.json()
            if (data.success) {
                setDeleteId(null)
                fetchData(activeTable, pagination?.page || 1, search)
            } else { setError(data.error) }
        } catch { setError("Delete failed") }
        finally { setDeleteLoading(false) }
    }

    // ─── Render ─────────────────────────────────────────────────
    const pkCol = columns.find((c) => c.pk === 1)
    const editableCols = columns.filter((c) => c.pk !== 1)

    return (
        <div className="flex flex-col lg:flex-row gap-4 p-4 min-h-[70vh]">
            {/* ── Table List Sidebar ─────────────────────────────── */}
            <div className={`${showTableList ? "block" : "hidden lg:block"} w-full lg:w-56 shrink-0`}>
                <div className="rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Database className="w-4 h-4" /> Tables
                        </h3>
                        <span className="text-xs text-muted-foreground">{tables.length}</span>
                    </div>
                    {tableLoading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    ) : (
                        <ul className="space-y-0.5 max-h-[60vh] overflow-y-auto">
                            {tables.map((t) => (
                                <li key={t}>
                                    <button
                                        onClick={() => selectTable(t)}
                                        className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${activeTable === t
                                                ? "bg-primary text-primary-foreground font-medium"
                                                : "hover:bg-muted"
                                            }`}
                                    >
                                        {t}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* ── Data Panel ─────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
                {!activeTable ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        <div className="text-center space-y-2">
                            <Database className="w-10 h-10 mx-auto opacity-30" />
                            <p>Select a table to browse data</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Mobile table toggle */}
                        <div className="lg:hidden">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTableList(!showTableList)}
                            >
                                <Database className="w-4 h-4 mr-1" />
                                {showTableList ? "Hide Tables" : "Show Tables"}
                            </Button>
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <h2 className="text-lg font-semibold">{activeTable}</h2>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="flex flex-1 sm:flex-initial">
                                    <Input
                                        placeholder="Search…"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="rounded-r-none h-8 text-sm"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSearch}
                                        className="rounded-l-none h-8"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchData(activeTable, pagination?.page || 1, search)}
                                    className="h-8"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" onClick={openCreateModal} className="h-8 gap-1">
                                    <Plus className="w-3.5 h-3.5" /> Add
                                </Button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                {error}
                                <button onClick={() => setError(null)} className="ml-auto">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Data Table */}
                        <div className="border rounded-lg overflow-auto max-h-[60vh]">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 sticky top-0">
                                    <tr>
                                        {columns.map((c) => (
                                            <th
                                                key={c.name}
                                                className="px-3 py-2 text-left font-medium text-xs whitespace-nowrap border-b"
                                            >
                                                {c.name}
                                                <span className="ml-1 text-muted-foreground font-normal">
                                                    {c.pk ? "🔑" : ""}
                                                </span>
                                            </th>
                                        ))}
                                        <th className="px-3 py-2 text-right font-medium text-xs border-b">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="text-center py-8">
                                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                            </td>
                                        </tr>
                                    ) : rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                                                No records found
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row, i) => (
                                            <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                                                {columns.map((c) => (
                                                    <td key={c.name} className="px-3 py-2 whitespace-nowrap max-w-[200px] truncate">
                                                        {c.name.toLowerCase().includes("password")
                                                            ? "••••••••"
                                                            : row[c.name] != null
                                                                ? String(row[c.name])
                                                                : <span className="text-muted-foreground italic">null</span>
                                                        }
                                                    </td>
                                                ))}
                                                <td className="px-3 py-2 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => openEditModal(row)}
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setDeleteId(
                                                                    Number(row[pkCol?.name || "id"])
                                                                )
                                                            }
                                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {pagination.total} records · Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <div className="flex gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page <= 1}
                                        onClick={() =>
                                            fetchData(activeTable, pagination.page - 1, search)
                                        }
                                        className="h-7"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={pagination.page >= pagination.totalPages}
                                        onClick={() =>
                                            fetchData(activeTable, pagination.page + 1, search)
                                        }
                                        className="h-7"
                                    >
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Create/Edit Modal ──────────────────────────────── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">
                                {modalMode === "create" ? "Create Record" : "Edit Record"} — {activeTable}
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setModalOpen(false)}
                                className="h-7 w-7 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-4 space-y-3">
                            {formError && (
                                <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded-md">
                                    {formError}
                                </div>
                            )}
                            {(modalMode === "create" ? editableCols : columns).map((c) => {
                                const isPk = c.pk === 1
                                const isPassword = c.name.toLowerCase().includes("password")
                                return (
                                    <div key={c.name}>
                                        <label className="text-sm font-medium mb-1 block">
                                            {c.name}
                                            <span className="text-muted-foreground font-normal ml-1 text-xs">
                                                ({c.type}{c.notnull ? ", required" : ""}{isPk ? ", PK" : ""})
                                            </span>
                                        </label>
                                        <Input
                                            value={formData[c.name] || ""}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    [c.name]: e.target.value,
                                                }))
                                            }
                                            disabled={isPk && modalMode === "edit"}
                                            type={isPassword ? "password" : "text"}
                                            placeholder={c.dflt_value || ""}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleFormSubmit}
                                disabled={formLoading}
                                className="gap-1"
                            >
                                {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {modalMode === "create" ? "Create" : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation ───────────────────────────── */}
            {deleteId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-card rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-destructive/10 rounded-full">
                                <Trash2 className="w-5 h-5 text-destructive" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Delete Record</h3>
                                <p className="text-sm text-muted-foreground">
                                    Are you sure you want to delete record #{deleteId} from{" "}
                                    <strong>{activeTable}</strong>? This cannot be undone.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteId(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className="gap-1"
                            >
                                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
