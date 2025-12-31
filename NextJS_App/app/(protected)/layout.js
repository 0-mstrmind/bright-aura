// protected routes layout
"use client";
import { useAuth } from "@/utils/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import Circles from "@/components/Circles";

export default function ProtectedLayout({ children }) {
    const { usr, role, loading } = useAuth();
    const pathname = usePathname();

    const router = useRouter();
    const publicPaths = ["/login", "/admin-login", "/about", "/"];

    useEffect(() => {
        if (!loading && (!usr || !role)) {
            router.push("/login");
        }
        if (usr && role && !publicPaths.includes(pathname)) {
            sessionStorage.setItem("cached_pathName", pathname);
        }
        }, [usr, role, loading, router, pathname]);

    if (loading || !usr || !role) {
        return <Circles />;
    }
    
    return <>{children}</>;
}
