import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Heart, Truck, Lock, RefreshCcw } from "lucide-react";

export default function StoreFooter() {
  return (
    <footer className="bg-[#0A3622] text-[#FAF8F5] border-t border-[#D4AF37]/30 pt-16 pb-12 font-sans">
      {/* 4 Trust Signals Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 border-b border-[#D4AF37]/20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-cormorant font-bold text-base text-[#FAF8F5]">
                Artisanal Couture
              </h4>
              <p className="text-xs text-stone-300 mt-0.5 font-light">
                Chanderi silk, georgette, and authentic zardozi embroidery.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-cormorant font-bold text-base text-[#FAF8F5]">
                Express Delivery
              </h4>
              <p className="text-xs text-stone-300 mt-0.5 font-light">
                Complimentary insured courier on orders above ₹2,999.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-cormorant font-bold text-base text-[#FAF8F5]">
                Secure Payments
              </h4>
              <p className="text-xs text-stone-300 mt-0.5 font-light">
                Razorpay 256-bit SSL encrypted UPI, Cards, NetBanking & COD.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center shrink-0">
              <RefreshCcw className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <h4 className="font-cormorant font-bold text-base text-[#FAF8F5]">
                Easy Exchanges
              </h4>
              <p className="text-xs text-stone-300 mt-0.5 font-light">
                7-day seamless size exchange guarantee on all kurtis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-[#0A3622] flex items-center justify-center font-cormorant font-bold text-2xl shadow-md">
              Z
            </div>
            <div>
              <h3 className="font-cormorant text-2xl font-bold tracking-[0.2em] uppercase text-[#FAF8F5]">
                ZURIQ
              </h3>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-semibold">
                Fashion &bull; Fusion Apparel
              </p>
            </div>
          </div>

          <p className="text-xs text-stone-300 font-light leading-relaxed">
            ZURIQ FASHION creates timeless fusion apparel that bridges royal Indian heritage with modern contemporary grace. Every stitch celebrates craftsmanship.
          </p>

          <div className="text-[11px] text-[#D4AF37] flex items-center gap-2">
            <span>Tagline:</span>
            <span className="font-cormorant italic text-sm text-stone-200">
              "Elegant & Modern Fusion Apparel"
            </span>
          </div>
        </div>

        {/* Categories Column */}
        <div>
          <h4 className="font-cormorant text-lg font-bold text-[#D4AF37] uppercase tracking-wider mb-3">
            Collections
          </h4>
          <ul className="space-y-2 text-xs text-stone-300">
            <li>
              <Link href="/#kurti-1-pc" className="hover:text-[#D4AF37] transition-colors">
                Kurti 1 Pc (Everyday & Semi-formal)
              </Link>
            </li>
            <li>
              <Link href="/#kurti-2-pcs" className="hover:text-[#D4AF37] transition-colors">
                Kurti 2 Pcs (Kurti & Pants / Dhoti)
              </Link>
            </li>
            <li>
              <Link href="/#kurti-3-pcs" className="hover:text-[#D4AF37] transition-colors">
                Kurti 3 Pcs (Anarkali & Dupatta Suits)
              </Link>
            </li>
            <li>
              <Link href="/#lehenga" className="hover:text-[#D4AF37] transition-colors">
                Heritage Bridal & Sangeet Lehengas
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Care Column */}
        <div>
          <h4 className="font-cormorant text-lg font-bold text-[#D4AF37] uppercase tracking-wider mb-3">
            Client Concierge
          </h4>
          <ul className="space-y-2 text-xs text-stone-300">
            <li>
              <Link href="/track-order" className="hover:text-[#D4AF37] transition-colors">
                Track Client Order Status
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions#shipping-delivery" className="hover:text-[#D4AF37] transition-colors">
                Shipping & Delivery Policies
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions#exchange-returns" className="hover:text-[#D4AF37] transition-colors">
                7-Day Size Exchange Guarantee
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">
                Privacy & Data Safeguards
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Admin Portal */}
        <div>
          <h4 className="font-cormorant text-lg font-bold text-[#D4AF37] uppercase tracking-wider mb-3">
            Boutique Atelier
          </h4>
          <p className="text-xs text-stone-300 font-light leading-relaxed">
            Email: <span className="text-[#D4AF37]">concierge@zuriqfashion.com</span>
            <br />
            Assistance: <span className="text-stone-200">+91 (0) 98765 43210</span>
          </p>

          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white border border-[#D4AF37]/30 text-xs transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Admin Personnel Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
        <div>
          &copy; 2026 ZURIQ FASHION. All Rights Reserved. Crafted for Modern Indian Elegance.
        </div>
        <div className="flex items-center gap-4 text-stone-400">
          <Link href="/privacy-policy" className="hover:text-[#D4AF37] transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/terms-and-conditions" className="hover:text-[#D4AF37] transition-colors">
            Terms & Conditions
          </Link>
          <span>&bull;</span>
          <span>Razorpay Verified</span>
        </div>
      </div>
    </footer>
  );
}
