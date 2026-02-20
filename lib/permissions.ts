import type { Role } from "@/lib/auth";

type RoleAccessMap = Record<Role, string[]>;

export const ROUTE_ACCESS: RoleAccessMap = {
    SUPER_ADMIN: ["*"],
    ADMIN: ["/dashboard", "/students", "/teachers", "/classes", "/subjects", "/exams"],
    TEACHER: ["/dashboard", "/students", "/attendance", "/exams"],
    ACCOUNTANT: ["/dashboard", "/fees", "/students"],
};

export const hasAccess = (role: Role, path: string): boolean => {
    const allowedRoutes = ROUTE_ACCESS[role];
    if (!allowedRoutes) return false;
    if (allowedRoutes.includes("*")) return true;
    return allowedRoutes.some((route) => path.startsWith(route));
};
