import { ThemeProvider } from "@/context/theme";
import React from "react";

// This layout wraps only the (auth) routes (e.g. /login).
// ThemeProvider lives here — NOT in the root layout — so it only
// affects the auth subtree. This keeps the home page (with the Radix
// NavigationMenu in NavBar) free from the client boundary that would
// shift Radix's useId-generated IDs and cause hydration mismatches.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
}
