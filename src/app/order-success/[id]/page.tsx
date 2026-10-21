"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types/admin";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  CheckCircle2,
  Sparkles,
  Printer,
  Truck,
  ArrowRight,
} from "lucide-react";

function OrderSuccessContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const resolvedParams = use(paramsPromise);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", resolvedParams.id)
          .maybeSingle();

        if (error) throw error;
        setOrder(data);
      } catch (e) {
        console.error("Failed to load order success details", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-cormorant text-xl text-[#0A3622]">
          Retrieving Your Couture Order Receipt...
        </p>
      </div>
    );
  }

  const itemsList = order && Array.isArray(order.items) ? order.items : [];

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-12 sm:py-20">
      {/* Success Card */}
      <div className="luxury-card overflow-hidden shadow-2xl border border-[#D4AF37]/40 animate-fadeIn">
        {/* Top Royal Banner */}
        <div className="bg-[#0A3622] text-[#FAF8F5] p-8 sm:p-10 text-center relative overflow-hidden border-b border-[#D4AF37]/35">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] p-[2px] mx-auto mb-4 shadow-xl">
            <div className="w-full h-full bg-[#0A3622] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37] mb-1 font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Confirmed & Authorized</span>
          </div>

          <h1 className="font-cormorant text-3xl sm:text-5xl font-bold text-[#FAF8F5] tracking-wide">
            Thank You for Choosing ZURIQ
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 font-light max-w-md mx-auto mt-2 font-sans">
            Your handcrafted fusion apparel is now being carefully prepared and packaged in our atelier with insured courier dispatch.
          </p>

          <div className="mt-4 inline-block font-mono text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 text-[#D4AF37]">
            Order Reference: #{resolvedParams.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 text-xs font-sans">
          {/* Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Customer
              </span>
              <span className="font-semibold text-stone-900 font-cormorant text-sm">
                {order?.customer_name || "Client"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Payment Method
              </span>
              <span className="font-semibold text-[#0A3622]">
                {order?.payment_method || "Online"} &bull; {order?.payment_status || "Paid"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Order Status
              </span>
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                {order?.order_status || "Order Placed"}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Courier
              </span>
              <span className="font-semibold text-stone-700">
                Insured Express
              </span>
            </div>
          </div>

          {/* Ordered Pieces */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-stone-700 mb-2">
              Ensemble Packaging Slip
            </h3>
            <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
              {itemsList.map((item: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs">
                  <div>
                    <div className="font-cormorant font-bold text-base text-[#1A1A1A]">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                      Couture Size: <strong className="text-stone-800">{item.size || "M"}</strong> &bull; Quantity: {item.quantity || 1}
                    </div>
                  </div>
                  <div className="font-cormorant font-bold text-lg text-[#0A3622]">
                    ₹{Number(item.price * (item.quantity || 1)).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-[#D4AF37]/30 flex items-center justify-between">
            <span className="font-bold text-stone-800">Total Settled Amount</span>
            <span className="font-cormorant text-2xl font-bold text-[#0A3622]">
              ₹{Number(order?.total_amount || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Print Packing Receipt</span>
            </button>

            <div className="flex items-center gap-2">
              <Link
                href={`/track-order?id=${resolvedParams.id}`}
                className="px-4 py-2.5 rounded-xl bg-[#0A3622] hover:bg-[#0E472D] text-[#D4AF37] text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Track Courier</span>
              </Link>

              <Link
                href="/"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] text-xs font-semibold flex items-center gap-2 shadow-md shadow-[#D4AF37]/20"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans">
      <StoreHeader />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="font-cormorant text-xl text-[#0A3622]">
                Loading Order Receipt...
              </p>
            </div>
          }
        >
          <OrderSuccessContent paramsPromise={params} />
        </Suspense>
      </main>
      <StoreFooter />
    </div>
  );
}
