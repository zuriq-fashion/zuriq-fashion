"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/adminAuth";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  ShoppingBag,
  Users,
  TicketPercent,
  ShieldCheck,
  LogOut,
  X,
  ExternalLink,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({ mobileOpen, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const { admin, logout, hasPermission, isSuperAdmin } = useAdminAuth();

  const navItems = [
    {
      title: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
      permission: null,
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: Sparkles,
      exact: false,
      permission: "products",
    },
    {
      title: "Categories",
      href: "/admin/categories",
      icon: Layers,
      exact: false,
      permission: "categories",
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: ShoppingBag,
      exact: false,
      permission: "orders",
    },
    {
      title: "Customers",
      href: "/admin/customers",
      icon: Users,
      exact: false,
      permission: "customers",
    },
    {
      title: "Coupons & Offers",
      href: "/admin/coupons",
      icon: TicketPercent,
      exact: false,
      permission: "coupons",
    },
    {
      title: "Staff & Roles",
      href: "/admin/staff",
      icon: ShieldCheck,
      exact: false,
      permission: "admins",
      superAdminOnly: true,
    },
  ];

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "super_admin":
        return "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40";
      case "manager":
        return "bg-emerald-800/40 text-emerald-300 border-emerald-600/40";
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600/40";
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col bg-[#0A3622] text-[#FAF8F5] border-r border-[#D4AF37]/25 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] p-[1.5px] shadow-lg shadow-[#0A3622]/40">
              <div className="w-full h-full bg-[#0A3622] rounded-[7px] flex items-center justify-center">
                <span className="font-cormorant text-xl font-bold text-[#D4AF37]">Z</span>
              </div>
            </div>
            <div>
              <h1 className="font-cormorant text-xl font-bold tracking-[0.16em] text-[#FAF8F5] leading-none group-hover:text-[#D4AF37] transition-colors">
                ZURIQ
              </h1>
              <span className="text-[10px] tracking-[0.24em] uppercase text-[#D4AF37] font-sans font-semibold mt-0.5 block">
                Fashion Admin
              </span>
            </div>
          </Link>

          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/5"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-[0.2em] text-[#D4AF37]/70 uppercase font-sans">
            Store Management
          </div>

          {navItems.map((item) => {
            if (item.superAdminOnly && !isSuperAdmin) return null;
            if (item.permission && !hasPermission(item.permission)) return null;

            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(item.href + "/");

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-[#D4AF37] to-[#B89222] text-[#0A3622] font-semibold shadow-md shadow-[#D4AF37]/20"
                    : "text-stone-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-[#0A3622]" : "text-[#D4AF37]"
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A3622] animate-pulse" />
                )}
              </Link>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[10px] font-bold tracking-[0.2em] text-[#D4AF37]/70 uppercase font-sans">
            Quick Links
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-stone-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
              View Live Store
            </span>
            <span className="text-[10px] text-stone-400">Preview</span>
          </a>
        </div>

        {/* Footer Admin User Card */}
        <div className="p-4 border-t border-[#D4AF37]/20 bg-black/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
                <span className="font-cormorant font-bold text-sm text-[#D4AF37]">
                  {admin?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {admin?.name || "Administrator"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-medium ${getRoleBadgeColor(
                      admin?.role
                    )}`}
                  >
                    {admin?.role?.replace("_", " ") || "Staff"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-stone-400 hover:text-[#D4AF37] hover:bg-white/5 transition-colors shrink-0"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
