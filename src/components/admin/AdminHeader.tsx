"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/adminAuth";
import { Menu, Calendar, Shield, Bell } from "lucide-react";

interface AdminHeaderProps {
  onOpenMobile: () => void;
}

export default function AdminHeader({ onOpenMobile }: AdminHeaderProps) {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const now = new Date();
    setCurrentDate(
      now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    );
  }, []);

  const getPageTitle = (path: string) => {
    if (path === "/admin") return "Overview Dashboard";
    if (path.startsWith("/admin/products")) return "Product Catalog & Pricing";
    if (path.startsWith("/admin/categories")) return "Category Hierarchy";
    if (path.startsWith("/admin/orders")) return "Customer Orders";
    if (path.startsWith("/admin/customers")) return "Client Registry";
    if (path.startsWith("/admin/coupons")) return "Coupons & Promotional Offers";
    if (path.startsWith("/admin/staff")) return "Staff & Access Control";
    return "Admin Portal";
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-lg text-[#0A3622] hover:bg-[#0A3622]/5 border border-[#D4AF37]/30 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#D4AF37] font-semibold">
            <span>ZURIQ FASHION</span>
            <span>/</span>
            <span className="text-[#0A3622]">Management</span>
          </div>
          <h2 className="font-cormorant text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-tight">
            {getPageTitle(pathname || "")}
          </h2>
        </div>
      </div>

      {/* Right: Date, Role Pill & Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Date */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#D4AF37]/30 text-xs text-[#0A3622] shadow-sm font-medium">
          <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{currentDate}</span>
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#D4AF37]/30">
          <div className="w-8 h-8 rounded-full bg-[#0A3622] text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center font-cormorant font-bold text-sm shadow-sm">
            {admin?.name?.charAt(0) || "A"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-[#1A1A1A] leading-none">
              {admin?.name || "Administrator"}
            </p>
            <p className="text-[10px] text-stone-500 font-sans tracking-wide mt-0.5 capitalize">
              {admin?.role?.replace("_", " ") || "Staff"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
