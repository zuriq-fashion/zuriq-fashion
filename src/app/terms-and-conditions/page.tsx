import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  Scale,
  Shield,
  FileCheck2,
  Truck,
  RefreshCcw,
  Sparkles,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  AlertTriangle,
  BadgeCheck,
  CreditCard,
  Scissors,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions — ZURIQ FASHION | Modern & Royal Fusion Apparel",
  description:
    "Review the terms of purchase, 7-day size exchange guarantee, delivery commitments, and intellectual property rights at ZURIQ FASHION.",
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "October 24, 2026";

  const sections = [
    { id: "acceptance", label: "1. Acceptance of Terms" },
    { id: "artisanal-craft", label: "2. Artisanal Couture & Sizing" },
    { id: "pricing-payment", label: "3. Pricing, GST & Payments" },
    { id: "shipping-delivery", label: "4. Shipping & Transit Insurance" },
    { id: "exchange-returns", label: "5. 7-Day Exchange & Returns" },
    { id: "cancellations", label: "6. Order Modifications & Cancellation" },
    { id: "intellectual-property", label: "7. Intellectual Property Rights" },
    { id: "limitation-liability", label: "8. Limitation of Liability" },
    { id: "governing-law", label: "9. Governing Law & Jurisdiction" },
    { id: "contact-concierge", label: "10. Atelier Concierge Contact" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#D4AF37]/20 selection:text-[#0A3622]">
      <StoreHeader />

      {/* Hero Banner */}
      <section className="relative bg-[#0A3622] text-[#FAF8F5] py-16 sm:py-20 border-b border-[#D4AF37]/30 overflow-hidden">
        {/* Luxury Background Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-8 relative z-10 text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-stone-300 mb-4 tracking-wider uppercase">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[#D4AF37]">Terms and Conditions</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase mb-4">
            <Scale className="w-4 h-4" />
            <span>Client Agreement & Purchase Policy</span>
          </div>

          <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF8F5] leading-tight mb-4">
            Terms & Conditions of Service
          </h1>

          <p className="text-stone-300 max-w-2xl mx-auto text-sm sm:text-base font-light leading-relaxed">
            Welcome to the house of ZURIQ FASHION. Please review the terms that govern your shopping journey, bespoke fittings, express courier dispatches, and size exchanges.
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
                <FileCheck2 className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-cormorant text-lg font-bold text-[#0A3622] uppercase tracking-wider">
                  Policy Navigation
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
                  <p className="font-semibold text-[#0A3622]">7-Day Size Guarantee</p>
                  <p className="font-light">
                    Need a different size? We arrange swift doorstep size exchanges for all kurtis and suits.
                  </p>
                  <Link
                    href="/account"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#0A3622] hover:text-[#D4AF37] transition-colors"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Manage Orders in Account</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Detailed Terms Text */}
          <article className="lg:col-span-8 order-1 lg:order-2 space-y-10 text-stone-700 leading-relaxed text-sm">
            
            {/* Section 1 */}
            <section id="acceptance" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">01.</span> Acceptance of Terms
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                By accessing, browsing, or purchasing through <strong>ZURIQ FASHION</strong> (&ldquo;zuriqfashion.com&rdquo;, &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;the Atelier&rdquo;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms and Conditions and our associated <Link href="/privacy-policy" className="text-[#0A3622] font-semibold underline hover:text-[#D4AF37]">Privacy Policy</Link>.
              </p>
              <p>
                If you do not agree with any portion of these terms, you should kindly refrain from completing orders through our portal. We reserve the right to amend these guidelines periodically, with notice provided via the &ldquo;Last Revised&rdquo; timestamp.
              </p>
            </section>

            {/* Section 2 */}
            <section id="artisanal-craft" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">02.</span> Artisanal Couture & Sizing
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <div className="p-4 rounded-xl bg-white border border-[#D4AF37]/25 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0A3622]">
                  <Scissors className="w-4 h-4 text-[#D4AF37]" />
                  <span>Handcrafted Distinctiveness & Weaving Nuances</span>
                </div>
                <p className="text-xs text-stone-600 font-light">
                  Our collections feature genuine Chanderi silk, georgette, organza, and hand-embroidered zardozi and gota patti embellishments. Because our artisans hand-dye and hand-embroider every piece, subtle variations in thread texture, weave slubs, and color saturation are hallmarks of authentic royal Indian couture, not production defects.
                </p>
              </div>
              <p className="text-xs text-stone-600">
                Garments are patterned according to our standard Indian sizing matrix (XS, S, M, L, XL, XXL, 3XL). Please consult our size guidance on each product page or reach out to our concierge for bespoke fitting advice prior to dispatch.
              </p>
            </section>

            {/* Section 3 */}
            <section id="pricing-payment" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">03.</span> Pricing, GST & Payments
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                All prices are cited in Indian Rupees (₹ INR) and include all statutory Goods and Services Tax (GST) unless explicitly noted.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-stone-600 text-xs">
                <li>
                  <strong className="text-stone-800">Online Transactions:</strong> Processed via <strong>Razorpay</strong>, supporting all major credit cards, debit cards, UPI applications (Google Pay, PhonePe, Paytm, BHIM), and NetBanking from 50+ Indian banks.
                </li>
                <li>
                  <strong className="text-stone-800">Cash on Delivery (COD):</strong> Available for eligible Indian PIN codes. For high-value orders or first-time patrons, our concierge team may place a brief telephone confirmation call prior to dispatch.
                </li>
                <li>
                  <strong className="text-stone-800">Coupons & Promotional Privileges:</strong> Promotional coupons (e.g. <em>ZURIQ15</em>) must be applied at the checkout stage. Only one promotional code may be redeemed per order.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="shipping-delivery" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">04.</span> Shipping & Transit Insurance
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/20">
                  <div className="text-xs font-semibold text-[#0A3622] mb-1 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#D4AF37]" /> Complimentary Shipping
                  </div>
                  <p className="text-xs text-stone-600 font-light">
                    Enjoy complimentary insured express delivery across India on all orders of ₹2,999 or above. Orders below ₹2,999 carry a flat ₹150 nominal courier fee.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/20">
                  <div className="text-xs font-semibold text-[#0A3622] mb-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#D4AF37]" /> Delivery Timelines
                  </div>
                  <p className="text-xs text-stone-600 font-light">
                    Ready-to-wear kurtis and suits are dispatched within 24–48 hours and typically arrive within 3–6 business days. Real-time tracking is provided via our <Link href="/track-order" className="text-[#0A3622] font-semibold underline">Order Tracking portal</Link>.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="exchange-returns" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">05.</span> 7-Day Exchange & Returns Policy
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                We stand with pride behind our silhouettes. If your kurti, anarkali suit, or bottoms do not offer the perfection of fit you envision, we provide a <strong>7-Day Seamless Size Exchange Guarantee</strong>:
              </p>

              <div className="space-y-2 text-xs text-stone-700">
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="font-semibold text-[#0A3622]">Eligibility Window:</span> You must register your exchange request within 7 calendar days of courier delivery by reaching our concierge or initiating it through your client profile.
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="font-semibold text-[#0A3622]">Garment Condition:</span> Items must be unworn, unwashed, unaltered, and returned in their original luxury box with all brand tags, safety seals, and dust covers intact.
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="font-semibold text-[#0A3622]">Doorstep Reverse Pickup:</span> We coordinate reverse courier pickup from your delivery address at no additional shipping surcharge for the first size exchange.
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="cancellations" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">06.</span> Order Modifications & Cancellation
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                Orders may be cancelled or modified within <strong>12 hours of placement</strong>, provided the parcel has not yet been assigned to our express courier partner. Once an airway bill (AWB) is generated, cancellation is no longer possible; you may instead request a size exchange upon receipt.
              </p>
              <p className="text-xs text-stone-600">
                If ZURIQ FASHION cancels an order due to an unexpected stock exhaustion or quality control hold, a 100% full refund will be processed immediately to your original payment method within 3–5 business days.
              </p>
            </section>

            {/* Section 7 */}
            <section id="intellectual-property" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">07.</span> Intellectual Property Rights
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                All trademarks, logos, garment silhouette designs, embroidery blueprints, digital imagery, copywriting, and software code on <strong>zuriqfashion.com</strong> belong exclusively to <strong>ZURIQ FASHION</strong>. Any unauthorized commercial reproduction, imitation, or scraping of our couture designs is strictly prohibited under Indian Copyright and Design Laws.
              </p>
            </section>

            {/* Section 8 */}
            <section id="limitation-liability" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">08.</span> Limitation of Liability
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p className="text-xs text-stone-600">
                To the fullest extent permitted by Indian statutory law, ZURIQ FASHION shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from courier delivery delays caused by adverse weather, national strikes, or force majeure events. Our total liability for any claim arising from an order is strictly limited to the purchase price paid for the respective garment.
              </p>
            </section>

            {/* Section 9 */}
            <section id="governing-law" className="space-y-3 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">09.</span> Governing Law & Jurisdiction
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                These Terms and Conditions and all commercial transactions through our boutique shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or claim arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in <strong>New Delhi, India</strong>.
              </p>
            </section>

            {/* Section 10 */}
            <section id="contact-concierge" className="space-y-4 scroll-mt-28">
              <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622] flex items-center gap-2">
                <span className="text-[#D4AF37]">10.</span> Atelier Concierge Contact
              </h2>
              <div className="h-0.5 w-12 bg-[#D4AF37]" />
              <p>
                For questions regarding these terms, measurement consults, or exchange requests:
              </p>

              <div className="luxury-card p-6 rounded-2xl bg-white border border-[#D4AF37]/30 shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0A3622] text-[#D4AF37] flex items-center justify-center font-cormorant font-bold text-2xl">
                    Z
                  </div>
                  <div>
                    <h3 className="font-cormorant text-xl font-bold text-[#0A3622]">
                      ZURIQ FASHION Client Concierge Atelier
                    </h3>
                    <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
                      Orders, Fittings & Exchange Assistance
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-700 pt-2 border-t border-stone-100">
                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase text-stone-400 font-semibold">Concierge Email</span>
                      <a href="mailto:concierge@zuriqfashion.com" className="font-medium text-[#0A3622] hover:text-[#D4AF37]">
                        concierge@zuriqfashion.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] uppercase text-stone-400 font-semibold">Concierge Hotline</span>
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
