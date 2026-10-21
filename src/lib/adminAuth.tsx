"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminUser, AdminRole } from "@/types/admin";
import { supabase } from "@/lib/supabase";

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
  isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "zuriq_admin_session";

// Fallback seed admin user if offline or freshly initialising
const DEFAULT_FALLBACK_ADMIN: AdminUser = {
  id: "e0e7deac-145e-484b-9c11-6cc729d6cfe8",
  name: "ZURIQ Owner",
  email: "admin@zuriqfashion.com",
  role: "super_admin",
  permissions: {
    admins: true,
    orders: true,
    coupons: true,
    products: true,
    customers: true,
    categories: true,
  },
  is_active: true,
  created_at: "2026-10-21T04:00:00.000Z",
};

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: AdminUser = JSON.parse(stored);
        if (parsed && parsed.email) {
          setAdmin(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to restore admin session:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Protect all /admin routes except /admin/login
  useEffect(() => {
    if (loading) return;
    const isLoginPage = pathname === "/admin/login";
    const isAdminRoute = pathname?.startsWith("/admin");

    if (isAdminRoute && !isLoginPage && !admin) {
      router.replace("/admin/login");
    } else if (isLoginPage && admin) {
      router.replace("/admin");
    }
  }, [admin, loading, pathname, router]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Check Supabase admin_users table
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (data && !error) {
        if (!data.is_active) {
          return { success: false, error: "Your administrator account has been deactivated. Please contact the owner." };
        }

        // Compare password_hash with provided password
        if (data.password_hash === password) {
          const userSession: AdminUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role as AdminRole,
            permissions: (typeof data.permissions === "object" && data.permissions !== null) ? data.permissions : {},
            is_active: data.is_active,
            created_at: data.created_at,
          };

          setAdmin(userSession);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userSession));
          return { success: true };
        }
      }

      // 2. Default fallback login for seeded account admin@zuriqfashion.com / admin123
      if (cleanEmail === "admin@zuriqfashion.com" && password === "admin123") {
        setAdmin(DEFAULT_FALLBACK_ADMIN);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FALLBACK_ADMIN));
        return { success: true };
      }

      return { success: false, error: "Invalid email or password. Please verify your credentials." };
    } catch (err: any) {
      console.error("Admin login error:", err);

      // Fallback check in case of network issue
      if (email.trim().toLowerCase() === "admin@zuriqfashion.com" && password === "admin123") {
        setAdmin(DEFAULT_FALLBACK_ADMIN);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FALLBACK_ADMIN));
        return { success: true };
      }

      return { success: false, error: err?.message || "An unexpected error occurred during login." };
    }
  };

  const logout = () => {
    setAdmin(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear admin session", e);
    }
    router.push("/admin/login");
  };

  const hasPermission = (module: string): boolean => {
    if (!admin) return false;
    if (admin.role === "super_admin") return true;
    return !!admin.permissions?.[module];
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        hasPermission,
        isSuperAdmin: admin?.role === "super_admin",
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
