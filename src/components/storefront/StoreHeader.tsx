"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import { useCustomerAuth } from "@/lib/customerAuth";
import { supabase } from "@/lib/supabase";
import { Offer, Category } from "@/types/admin";
import {
  ShoppingBag,
  Sparkles,
  Search,
  Menu,
  X,
  Shield,
  Truck,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react";

export default function StoreHeader() {
  const { openCart, totalCount } = useCart();
  const { customer, logoutCustomer } = useCustomerAuth();
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Fetch active offers
    const fetchOffers = async () => {
      try {
        const { data } = await supabase
          .from("offers")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (data && data.length > 0) {
          setActiveOffers(data);
        }
      } catch (e) {
        console.error("Failed to load offers", e);
      }
    };

    // Fetch categories
    const fetchCats = async () => {
      try {
        const { data } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("name", { ascending: true });
        if (data) {
          setCategories(data);
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      }
    };

    fetchOffers();
    fetchCats();
  }, []);

  const defaultMarqueeText =
    activeOffers.length > 0
      ? activeOffers.map((o) => o.title).join("   ✦   ")
      : "✦ FESTIVE COUTURE 2026: Complimentary Express Delivery on orders above ₹2,999 ✦ Use code ZURIQ15 for 15% OFF ✦";

  const customerDisplayName = customer
    ? customer.name && customer.name !== "ZURIQ Client"
      ? customer.name.split(" ")[0]
      : "Account"
    : null;

  return (
    <>
      {/* 1. Promotional Marquee Announcement Bar */}
      <div className="bg-[#062115] text-[#FAF8F5] py-2 px-4 border-b border-[#D4AF37]/30 text-xs overflow-hidden relative select-none">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <div className="font-cormorant text-xs tracking-[0.14em] uppercase text-stone-200 text-center truncate">
            {defaultMarqueeText}
          </div>
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
        </div>
      </div>

      {/* 2. Main Luxury Header */}
      <header className="sticky top-0 z-40 bg-[#0A3622] text-[#FAF8F5] border-b border-[#D4AF37]/30 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-stone-200 hover:text-white hover:bg-white/5 border border-[#D4AF37]/30"
              aria-label="Open mobile navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] p-[1.5px] shadow-lg shadow-black/40">
                <div className="w-full h-full bg-[#0A3622] rounded-[10px] flex items-center justify-center">
                  <span className="font-cormorant text-2xl font-bold text-[#D4AF37]">Z</span>
                </div>
              </div>
              <div>
                <h1 className="font-cormorant text-xl sm:text-2xl font-bold tracking-[0.22em] uppercase text-[#FAF8F5] leading-none group-hover:text-[#D4AF37] transition-colors">
                  ZURIQ
                </h1>
                <p className="text-[9px] uppercase tracking-[0.26em] text-[#D4AF37] font-semibold mt-0.5">
                  Fashion &bull; Fusion Apparel
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-xs uppercase font-medium tracking-wider text-stone-300">
            <Link
              href="/"
              className="hover:text-[#D4AF37] transition-colors hover:scale-105 transform duration-150"
            >
              All Designs
            </Link>

            {categories.length > 0 ? (
              categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/#${c.slug}`}
                  className="hover:text-[#D4AF37] transition-colors hover:scale-105 transform duration-150"
                >
                  {c.name}
                </Link>
              ))
            ) : (
              <>
                <Link href="/#kurti-1-pc" className="hover:text-[#D4AF37] transition-colors">
                  Kurti 1 Pc
                </Link>
                <Link href="/#kurti-2-pcs" className="hover:text-[#D4AF37] transition-colors">
                  Kurti 2 Pcs
                </Link>
                <Link href="/#kurti-3-pcs" className="hover:text-[#D4AF37] transition-colors">
                  Kurti 3 Pcs
                </Link>
                <Link href="/#lehenga" className="hover:text-[#D4AF37] transition-colors">
                  Lehenga
                </Link>
              </>
            )}

            <Link
              href="/track-order"
              className="flex items-center gap-1.5 text-[#D4AF37] hover:underline transition-colors font-semibold"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </Link>
          </nav>

          {/* Right: Actions (Customer Account + Admin + Cart) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Customer Authentication Button */}
            {customer ? (
              <Link
                href="/account"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-200 hover:text-white bg-white/5 hover:bg-white/10 border border-[#D4AF37]/40 text-xs transition-colors"
                title={`Logged in as ${customer.name || customer.phone}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[10px] text-[#D4AF37] font-bold">
                  <User className="w-3 h-3 text-[#D4AF37]" />
                </div>
                <span className="text-[11px] font-semibold max-w-[80px] truncate">
                  {customerDisplayName}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/5 border border-[#D4AF37]/30 text-xs transition-colors"
                title="Customer Sign In via OTP"
              >
                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px] font-semibold hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Admin Portal Button */}
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-white/5 border border-white/10 text-xs transition-colors"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[10px] font-semibold">Admin</span>
            </Link>

            {/* Shopping Bag Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold shadow-lg shadow-[#D4AF37]/20 flex items-center gap-2 transition-all cursor-pointer"
              aria-label="Open shopping bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Bag</span>

              {totalCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#0A3622] text-[#D4AF37] text-[10px] font-bold flex items-center justify-center border border-[#D4AF37]/50 animate-pulse">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 left-0 w-72 bg-[#0A3622] text-[#FAF8F5] border-r border-[#D4AF37]/30 p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
                <div>
                  <h3 className="font-cormorant text-2xl font-bold tracking-wider text-[#FAF8F5]">
                    ZURIQ FASHION
                  </h3>
                  <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest">
                    Fusion Apparel Couture
                  </p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer Account Indicator in Mobile Menu */}
              <div className="p-3 rounded-xl bg-white/5 border border-[#D4AF37]/25 text-xs">
                {customer ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase tracking-wider">
                        Signed In
                      </span>
                      <span className="font-semibold text-stone-200">
                        {customer.name || customer.phone}
                      </span>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-2.5 py-1 rounded bg-[#D4AF37] text-[#0A3622] font-semibold text-[11px]"
                    >
                      Profile
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-stone-300 font-medium">New to ZURIQ?</span>
                      <p className="text-[10px] text-stone-400">Login with mobile OTP</p>
                    </div>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#0A3622] font-semibold text-xs"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm font-medium">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 border-b border-white/5 hover:text-[#D4AF37]"
                >
                  <span>All Collections</span>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </Link>

                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/#${c.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 border-b border-white/5 hover:text-[#D4AF37]"
                  >
                    <span>{c.name}</span>
                    <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                  </Link>
                ))}

                <Link
                  href="/track-order"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-[#D4AF37] font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Track Order
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                {customer && (
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-stone-200 hover:text-[#D4AF37]"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#D4AF37]" />
                      My Orders & Account
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[#D4AF37]/20 space-y-2">
              {customer && (
                <button
                  onClick={() => {
                    logoutCustomer();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out</span>
                </button>
              )}

              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 border border-[#D4AF37]/30 text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4 text-[#D4AF37]" />
                <span>Admin Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
