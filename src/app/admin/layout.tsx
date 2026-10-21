"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/lib/adminAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { admin, loading } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If viewing the login page, render full screen without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show a luxury royal splash while restoring authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A3622] flex flex-col items-center justify-center text-[#FAF8F5]">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37]/30 border-t-[#D4AF37] animate-spin" />
          <span className="absolute font-cormorant text-2xl font-bold text-[#D4AF37]">Z</span>
        </div>
        <p className="mt-4 font-cormorant text-lg tracking-[0.2em] uppercase text-[#D4AF37]">
          ZURIQ FASHION
        </p>
        <p className="text-xs text-stone-400 font-sans tracking-widest uppercase mt-1">
          Verifying Admin Credentials...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col lg:flex-row antialiased">
      {/* Sidebar navigation */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <AdminHeader onOpenMobile={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
