import {
    Users,
    UserCheck,
    DollarSign,
    BookOpen
} from "lucide-react";

export default async function DashboardPage() {
    const stats = [
        { label: "Total Students", value: "1,234", icon: Users, color: "bg-blue-500" },
        { label: "Total Teachers", value: "123", icon: UserCheck, color: "bg-green-500" },
        { label: "Total Classes", value: "40", icon: BookOpen, color: "bg-purple-500" },
        { label: "Revenue (Month)", value: "$54,000", icon: DollarSign, color: "bg-yellow-500" },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                            <div className="flex items-center gap-4">
                                <div className={`rounded-lg p-3 ${stat.color} text-white`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                <div className="mt-4 h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500">No recent activity</p>
                </div>
            </div>
        </div>
    );
}
