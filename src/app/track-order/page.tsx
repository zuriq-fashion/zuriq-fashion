"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types/admin";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Package,
  XCircle,
  Calendar,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const STAGES: OrderStatus[] = [
  "Order Placed",
  "Confirmed",
  "Shipped",
  "Delivered",
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [searchId, setSearchId] = useState(initialId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const clean = idToSearch.trim();

      // Search by UUID or prefix or customer name
      let query = supabase.from("orders").select("*");

      if (clean.length > 20) {
        query = query.eq("id", clean);
      } else {
        query = query.ilike("id", `${clean}%`);
      }

      const { data, error: err } = await query.limit(1).maybeSingle();

      if (err || !data) {
        setError(`No order found matching reference "${idToSearch}". Please verify your Order ID.`);
      } else {
        setOrder(data);
      }
    } catch (e: any) {
      setError(e.message || "Failed to search for order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchId);
  };

  const getStageIndex = (status: OrderStatus) => {
    if (status === "Cancelled") return -1;
    return STAGES.indexOf(status);
  };

  const currentStageIdx = order ? getStageIndex(order.order_status) : 0;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-12 sm:py-20">
      <div className="text-center mb-8">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D1F]">
          Courier & Fulfillment
        </span>
        <h1 className="font-cormorant text-3xl sm:text-5xl font-bold text-[#0A3622] mt-1">
          Track Your Couture Order
        </h1>
        <p className="text-xs text-stone-500 font-sans mt-1.5 max-w-md mx-auto">
          Enter your Order ID (from your confirmation receipt or SMS) to view live atelier preparation and courier transit stages.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="luxury-card p-4 sm:p-5 mb-8 flex gap-3">
        <div className="relative flex-1">
          <Truck className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Order ID (e.g. 1463d117 or full ID)"
            required
            className="w-full pl-10 pr-4 py-2.5 text-xs border border-stone-300 focus:border-[#D4AF37] rounded-xl outline-none font-mono text-stone-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-[#0A3622] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs mb-8">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Status Display */}
      {order && (
        <div className="luxury-card p-6 sm:p-8 space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D4AF37]/20 gap-3">
            <div>
              <span className="font-mono text-xs text-[#8C6D1F] uppercase font-bold">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </span>
              <h2 className="font-cormorant text-2xl font-bold text-[#0A3622]">
                Client: {order.customer_name}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold">
                Settled Amount
              </span>
              <span className="font-cormorant text-2xl font-bold text-[#0A3622]">
                ₹{Number(order.total_amount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          {order.order_status === "Cancelled" ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <XCircle className="w-5 h-5 text-rose-600" />
              <div>
                <strong className="block">Order Cancelled</strong>
                <span>This order was cancelled. Any authorized amounts have been refunded to the source account.</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {STAGES.map((stg, idx) => {
                  const isDone = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;

                  return (
                    <div key={stg} className="space-y-2">
                      <div className="flex items-center">
                        <div
                          className={`w-full h-1 ${
                            idx === 0
                              ? "invisible"
                              : isDone
                              ? "bg-[#0A3622]"
                              : "bg-stone-200"
                          }`}
                        />
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mx-auto font-bold text-xs ${
                            isCurrent
                              ? "border-[#D4AF37] bg-[#0A3622] text-[#D4AF37] ring-4 ring-[#D4AF37]/20"
                              : isDone
                              ? "border-[#0A3622] bg-[#0A3622] text-white"
                              : "border-stone-300 bg-white text-stone-400"
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div
                          className={`w-full h-1 ${
                            idx === STAGES.length - 1
                              ? "invisible"
                              : idx < currentStageIdx
                              ? "bg-[#0A3622]"
                              : "bg-stone-200"
                          }`}
                        />
                      </div>
                      <span
                        className={`block text-[11px] font-semibold leading-tight ${
                          isCurrent
                            ? "text-[#0A3622] font-bold"
                            : isDone
                            ? "text-stone-800"
                            : "text-stone-400"
                        }`}
                      >
                        {stg}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div>
            <h3 className="text-xs uppercase font-bold text-stone-600 tracking-wider mb-2">
              Package Contents
            </h3>
            <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden text-xs">
              {Array.isArray(order.items) &&
                order.items.map((it: any, i: number) => (
                  <div key={i} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-cormorant font-bold text-sm text-[#1A1A1A]">
                        {it.title}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        Size: {it.size || "M"} &bull; Qty: {it.quantity || 1}
                      </div>
                    </div>
                    <div className="font-cormorant font-bold text-sm text-[#0A3622]">
                      ₹{Number(it.price * (it.quantity || 1)).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Footer Assistance */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>Payment: {order.payment_method} ({order.payment_status})</span>
            <Link href="/" className="text-[#0A3622] hover:text-[#D4AF37] font-semibold flex items-center gap-1">
              <span>Back to Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans">
      <StoreHeader />
      <main className="flex-1">
        <React.Suspense fallback={<div className="p-12 text-center text-xs">Loading order search...</div>}>
          <TrackOrderContent />
        </React.Suspense>
      </main>
      <StoreFooter />
    </div>
  );
}
