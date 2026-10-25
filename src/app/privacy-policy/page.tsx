import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Mail,
  Phone,
  Clock,
  Sparkles,
  ChevronRight,
  Database,
  UserCheck,
  Bell,
  Scale,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — ZURIQ FASHION | Modern & Royal Fusion Couture",
  description:
    "Read how ZURIQ FASHION collects, protects, and respects your personal information, contact credentials, and payment data.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 24, 2026";

  const sections = [
    { id: "introduction", label: "1. Introduction & Philosophy" },
    { id: "information-collected", label: "2. Information We Collect" },
    { id: "use-of-information", label: "3. How We Utilize Your Data" },
    { id: "payment-security", label: "4. Payment Security & Razorpay" },
    { id: "data-sharing", label: "5. Logistics & Third-Party Sharing" },
    { id: "data-retention", label: "6. Data Retention & Safeguards" },
    { id: "client-rights", label: "7. Your Rights as a Patron" },
    { id: "cookies", label: "8. Cookies & Analytics" },
    { id: "contact-concierge", label: "9. Privacy Concierge Contact" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#D4AF37]/20 selection:text-[#0A3622]">
      <StoreHeader />

      {/* Hero Banner */}
      <section className="relative bg-[#0A3622] text-[#FAF8F5] py-16 sm:py-20 border-b border-[#D4AF37]/30 overflow-hidden">
        {/* Luxury Background Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-stone-300 mb-4 tracking-wider uppercase">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[#D4AF37]">Privacy Policy</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Client Trust & Data Protection</span>
          </div>

          <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF8F5] leading-tight mb-4">
            ZURIQ FASHION Privacy Policy
          </h1>

          <p className="text-stone-300 max-w-2xl mx-auto text-sm sm:text-base font-light leading-relaxed">
            Your trust is our most treasured heirloom. We safeguard your identity, delivery coordinates, and measurements with highest standard encryption and utmost confidentiality.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#D4AF37] font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Effective & Last Revised: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Navigation Quick Jump Sidebar */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-28 luxury-card p-6 rounded-2xl bg-white border border-[#D4AF37]/25 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-200">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-cormorant text-lg font-bold text-[#0A3622] uppercase tracking-wider">
                  Table of Contents
                </h3>
              </div>
              <nav className="space-y-1 text-xs">
                {sections.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block py-1.5 px-2 rounded-lg text-stone-600 hover:text-[#0A3622] hover:bg-[#FAF8F5] font-medium transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-stone-100">
                <div className="p-3.5 rounded-xl bg-[#0A3622]/5 border border-[#D4AF37]/20 text-[11px] text-stone-600 space-y-2">
                  <p className="font-semibold text-[#0A3622]">Need Immediate Clarification?</p>
                  <p className="font-light">
                    Our dedicated Concierge Desk is at your service 7 days a week.
                  </p>
                  <a
                    href="mailto:concierge@zuriqfashion.com"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#0A3622] hover:text-[#D4AF37] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>concierge@zuriqfashion.com</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Detailed Policy Text */}
          <article className="lg:col-span-8 order-1 lg:order-2 space-y-10 text-stone-700 leading-relaxed text-sm">
            
            {/* Section 1 */}
            <section id="introduction" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">01.</span> Introduction & Philosophy
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                Welcome to <strong>ZURIQ FASHION</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), registered and operating under the brand identity &ldquo;ZURIQ FASHION — Elegant & Modern Fusion Apparel&rdquo;. We celebrate Indian heritage couture, handcrafted kurtis, suits, and designer fusion ensembles for patrons across India and worldwide.
              </p>
              <p>
                This Privacy Policy outlines how your personal information is collected, stored, protected, and utilized when you browse our boutique catalog at <strong>zuriqfashion.com</strong>, authenticate through our client OTP portal, or place an order for delivery.
              </p>
            </section>

            {/* Section 2 */}
            <section id="information-collected" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">02.</span> Information We Collect
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                To provide bespoke customer care and smooth door-to-door courier deliveries, we collect the following types of information:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600">
                <li>
                  <strong className="text-stone-800">Contact & Identity Coordinates:</strong> Your full name, mobile telephone number, delivery address, city, state, postal PIN code, and email address.
                </li>
                <li>
                  <strong className="text-stone-800">Phone Authentication Data:</strong> Mobile verification records managed via secure OTP (One-Time Password) sessions for passwordless, tamper-proof client login.
                </li>
                <li>
                  <strong className="text-stone-800">Order & Sizing History:</strong> Details of fusion kurtis, anarkali sets, or lehengas purchased, preferred garment sizes (XS to 3XL), coupon codes applied, and delivery tracking milestones.
                </li>
                <li>
                  <strong className="text-stone-800">Technical Device Metadata:</strong> IP address, browser type, device resolution, and referral source used to ensure our storefront displays flawlessly on your screen.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="use-of-information" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">03.</span> How We Utilize Your Data
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                We do not sell, rent, or trade your personal records to third-party telemarketers or advertisers. Your data is strictly utilized to:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/20 shadow-xs">
                  <div className="font-semibold text-xs text-[#0A3622] mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Order Fulfillment
                  </div>
                  <p className="text-xs text-stone-600 font-light">
                    Processing dispatch, tailoring confirmation, generating tax invoices, and printing courier waybills.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/20 shadow-xs">
                  <div className="font-semibold text-xs text-[#0A3622] mb-1 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#D4AF37]" /> Shipment Notifications
                  </div>
                  <p className="text-xs text-stone-600 font-light">
                    Real-time SMS, WhatsApp, or email updates on order confirmation, airway tracking, and out-for-delivery alerts.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/20 shadow-xs">
                  <div className="font-semibold text-xs text-[#0A3622] mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Client Concierge
                  </div>
                  <p className="text-xs text-stone-600 font-light">
                    Facilitating complimentary size exchanges, custom fit inquiries, and order tracking assistance.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/20 shadow-xs">
                  <div className="font-semibold text-xs text-[#0A3622] mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" /> Fraud Prevention
                  </div>
                  <p className="text-xs text-stone-600 font-light">
                    Detecting suspicious payment attempts and preserving the security of client account histories.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="payment-security" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">04.</span> Payment Security & Razorpay
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <div className="p-4 rounded-xl bg-[#0A3622]/5 border border-[#D4AF37]/30 flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="text-xs text-stone-700 leading-relaxed">
                  <strong className="text-[#0A3622] block mb-1">PCI-DSS Compliant Payment Infrastructure</strong>
                  ZURIQ FASHION does <strong>never store or handle your credit card numbers, debit card PINs, CVV codes, or UPI passwords</strong> on our servers. All digital transactions are securely routed through <strong>Razorpay Payment Solutions</strong> under 256-bit bank-grade SSL encryption and RBI-mandated tokenization guidelines.
                </div>
              </div>
              <p className="text-xs text-stone-600">
                For Cash on Delivery (COD) orders, our logistics representative only verifies physical currency receipt against your generated order manifest.
              </p>
            </section>

            {/* Section 5 */}
            <section id="data-sharing" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">05.</span> Logistics & Third-Party Sharing
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                We collaborate solely with verified, enterprise-grade service partners strictly bound by non-disclosure and security covenants:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 text-xs">
                <li>
                  <strong>Express Courier Partners (e.g. Delhivery, Blue Dart, DTDC):</strong> Given your name, phone number, and delivery address solely to execute doorstep parcel dispatch.
                </li>
                <li>
                  <strong>Cloud Database Infrastructure (Supabase PostgreSQL):</strong> Stores encrypted customer and catalog tables with row-level security policies.
                </li>
                <li>
                  <strong>Governmental or Legal Obligations:</strong> Only disclosed when compelled by applicable Indian judicial processes, tax audit mandates, or to thwart financial crimes.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="data-retention" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">06.</span> Data Retention & Safeguards
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                Your purchase records and shipping coordinates are retained for as long as your client account remains active or as required by Indian commercial law (such as GST invoice retention requirements). We employ multi-factor authentication, administrative access logs, and encrypted cloud storage to prevent unauthorized interception.
              </p>
            </section>

            {/* Section 7 */}
            <section id="client-rights" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">07.</span> Your Rights as a Patron
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                As a valued patron of ZURIQ FASHION, you hold full autonomy over your personal information:
              </p>
              <div className="space-y-2 text-xs text-stone-700">
                <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                  <span><strong>Profile Access & Editing:</strong> You can view and edit your name, email, and saved shipping addresses at any time via <Link href="/account" className="text-[#0A3622] underline font-semibold hover:text-[#D4AF37]">Your Client Account</Link>.</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                  <span><strong>Account Deletion:</strong> You may request the permanent anonymization or erasure of your customer profile by emailing our concierge team.</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200 flex items-center justify-between">
                  <span><strong>Communication Preferences:</strong> You may opt out of promotional communications at any time while retaining transactional delivery alerts.</span>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="cookies" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">08.</span> Cookies & Analytics
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                We use strictly essential local storage and session tokens to preserve your shopping bag selections (`zuriq_cart_v1`) and active client login state (`zuriq_customer_session`). You may disable browser cookies in your device settings; however, doing so may reset your shopping cart upon page refresh.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact-concierge" className="space-y-4 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">09.</span> Privacy Concierge Contact
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                Should you have any questions, grievances, or requests regarding this Privacy Policy or your data protection rights, please contact our designated Data Protection Officer:
              </p>

              <div className="luxury-card p-6 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0A3622] text-[#D4AF37] flex items-center justify-center font-cormorant font-bold text-2xl">
                    Z
                  </div>
                  <div>
                    <h3 className="font-cormorant text-xl font-bold text-[#0A3622]">
                      ZURIQ FASHION Grievance & Privacy Atelier
                    </h3>
                    <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
                      Client Concierge & Legal Compliance
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700 pt-2 border-t border-stone-100">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase text-stone-400 font-semibold">Email Concierge</span>
                      <a href="mailto:concierge@zuriqfashion.com" className="font-medium text-[#0A3622] hover:text-[#D4AF37]">
                        concierge@zuriqfashion.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase text-stone-400 font-semibold">Telephone Assistance</span>
                      <span className="font-medium text-stone-800">+91 (0) 98765 43210 (Mon–Sat, 10 AM – 7 PM IST)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </article>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
