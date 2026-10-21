"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cartContext";
import { supabase } from "@/lib/supabase";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  TicketPercent,
  Check,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discountAmount,
    shippingFee,
    finalTotal,
    appliedCoupon,
    clearCart,
  } = useCart();

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("Delhi");
  const [pincode, setPincode] = useState("");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "COD">("Razorpay");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If cart is empty, prompt user
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans">
        <StoreHeader />
        <main className="flex-1 max-w-lg mx-auto py-24 px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#0A3622]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#0A3622]">
            <ShoppingBag className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="font-cormorant text-3xl font-bold text-[#0A3622]">
            Your Bag is Empty
          </h2>
          <p className="text-xs text-stone-500 font-sans">
            Please add at least one fusion couture piece to your bag before proceeding to luxury checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] text-[#0A3622] text-xs font-semibold uppercase tracking-wider"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      setErrorMessage("Please complete all required shipping fields.");
      return;
    }

    setProcessing(true);

    try {
      const fullAddressString = `${address.trim()}, ${city.trim() ? city.trim() + ", " : ""}${stateName} - ${pincode.trim()}`;

      // 1. If Online (Razorpay)
      if (paymentMethod === "Razorpay") {
        const orderRes = await fetch("/api/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalTotal,
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
              customer_name: fullName,
              customer_email: email,
            },
          }),
        });

        const rzpData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(rzpData.error || "Failed to initialize payment gateway.");
        }

        // If in Demo Mode (keys are placeholder), smoothly complete simulated payment
        // Otherwise load real Razorpay checkout modal
        if (rzpData.isDemoMode) {
          // Complete demo order directly
          await completeOrderDatabaseTransactions(fullAddressString, "Paid");
          return;
        } else {
          // Load Razorpay script dynamically
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
          }

          const options = {
            key: rzpData.key,
            amount: rzpData.amount,
            currency: rzpData.currency,
            name: "ZURIQ FASHION",
            description: "Luxury Fusion Apparel Couture",
            order_id: rzpData.id,
            prefill: {
              name: fullName,
              email: email,
              contact: phone,
            },
            theme: {
              color: "#0A3622",
            },
            handler: async function (response: any) {
              await completeOrderDatabaseTransactions(fullAddressString, "Paid");
            },
            modal: {
              ondismiss: function () {
                setProcessing(false);
                setErrorMessage("Payment was cancelled. You may retry or select Cash on Delivery.");
              },
            },
          };

          const razorpayInstance = new (window as any).Razorpay(options);
          razorpayInstance.open();
          return;
        }
      }

      // 2. If Cash on Delivery (COD)
      await completeOrderDatabaseTransactions(fullAddressString, "Pending");
    } catch (err: any) {
      console.error("Order processing error:", err);
      setErrorMessage(err.message || "Failed to finalize order. Please try again.");
      setProcessing(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const completeOrderDatabaseTransactions = async (
    fullAddress: string,
    paymentStatus: "Paid" | "Pending"
  ) => {
    // 1. Prepare ordered items array
    const orderedItems = items.map((it) => ({
      product_id: it.productId,
      title: it.title,
      size: it.size,
      quantity: it.quantity,
      price: it.price,
      image: it.image,
    }));

    // 2. Insert into orders table
    const { data: newOrder, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_name: fullName.trim(),
        items: orderedItems,
        total_amount: finalTotal,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        order_status: "Order Placed",
      })
      .select()
      .single();

    if (orderErr) {
      console.error("Orders table insertion error:", orderErr);
      throw new Error("Failed to record order: " + orderErr.message);
    }

    const createdOrderId = newOrder.id;

    // 3. Upsert Customer in customers table
    try {
      const { data: existingCust } = await supabase
        .from("customers")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .maybeSingle();

      if (existingCust) {
        await supabase
          .from("customers")
          .update({
            name: fullName.trim(),
            phone: phone.trim(),
            address: fullAddress,
            total_orders: (existingCust.total_orders || 0) + 1,
            total_spent: (Number(existingCust.total_spent) || 0) + finalTotal,
          })
          .eq("id", existingCust.id);
      } else {
        await supabase.from("customers").insert({
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: fullAddress,
          total_orders: 1,
          total_spent: finalTotal,
        });
      }
    } catch (custErr) {
      console.warn("Non-blocking customer record update warning:", custErr);
    }

    // 4. Increment coupon used count if used
    if (appliedCoupon) {
      try {
        await supabase
          .from("coupons")
          .update({ used_count: (appliedCoupon.used_count || 0) + 1 })
          .eq("id", appliedCoupon.id);
      } catch (cErr) {
        console.warn("Coupon counter increment error:", cErr);
      }
    }

    // 5. Clear cart & redirect to Order Success
    clearCart();
    router.push(`/order-success/${createdOrderId}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans">
      <StoreHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D1F]">
            Secure Client Checkout
          </span>
          <h1 className="font-cormorant text-3xl sm:text-5xl font-bold text-[#0A3622] mt-1">
            Shipping & Settlement
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Form Column (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Client Shipping Coordinates */}
            <div className="luxury-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#D4AF37]/25">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="font-cormorant text-xl font-bold text-[#0A3622]">
                  1. Delivery Destination & Contact
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase tracking-wider text-[10px]">
                    Full Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Radhika Merchant"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-medium text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase tracking-wider text-[10px]">
                    Phone Number (for Courier SMS) *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-mono text-stone-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1 uppercase tracking-wider text-[10px]">
                    Email Address (for Digital Receipt) *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="radhika@example.com"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none text-stone-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1 uppercase tracking-wider text-[10px]">
                    Street Address, Apartment & Landmark *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat 402, Royal Residency, Altamount Road"
                    rows={2}
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2 outline-none text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase tracking-wider text-[10px]">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai / New Delhi"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none text-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase tracking-wider text-[10px]">
                    State / Union Territory *
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none bg-white text-stone-800 cursor-pointer"
                  >
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi NCR</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1 uppercase tracking-wider text-[10px]">
                    Postal PIN Code *
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400026"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-mono text-stone-800"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="luxury-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#D4AF37]/25">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="font-cormorant text-xl font-bold text-[#0A3622]">
                  2. Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {/* Razorpay Online */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "Razorpay"
                      ? "bg-amber-50/40 border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]"
                      : "bg-white border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="Razorpay"
                    checked={paymentMethod === "Razorpay"}
                    onChange={() => setPaymentMethod("Razorpay")}
                    className="w-4 h-4 mt-0.5 accent-[#0A3622]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#0A3622] font-cormorant">
                        Pay Online (Razorpay)
                      </span>
                      <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">
                      Instant & secure checkout via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards & NetBanking.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                        ✦ Recommended
                      </span>
                    </div>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "COD"
                      ? "bg-amber-50/40 border-[#D4AF37] shadow-sm ring-1 ring-[#D4AF37]"
                      : "bg-white border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="w-4 h-4 mt-0.5 accent-[#0A3622]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[#0A3622] font-cormorant">
                        Cash on Delivery (COD)
                      </span>
                      <Banknote className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <p className="text-xs text-stone-500 font-sans mt-0.5">
                      Pay cash or UPI to the courier upon doorstep delivery inspection.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Summary Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="luxury-card p-6 sm:p-8 space-y-5 sticky top-28">
              <h3 className="font-cormorant text-2xl font-bold text-[#0A3622] pb-3 border-b border-[#D4AF37]/25">
                Order Summary
              </h3>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="w-14 h-16 rounded-lg overflow-hidden bg-stone-100 border border-[#D4AF37]/30 shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <h4 className="font-cormorant font-bold text-sm text-[#1A1A1A] truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                        Size: <span className="font-bold text-stone-700">{item.size}</span> &bull; Qty: {item.quantity}
                      </p>
                      <span className="font-cormorant font-bold text-sm text-[#0A3622]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Notice if applied */}
              {appliedCoupon && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TicketPercent className="w-4 h-4 text-[#0A3622]" />
                    <div>
                      <span className="font-mono font-bold text-[#0A3622]">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] text-emerald-800 block">
                        Promotional coupon applied
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-800">
                    -₹{discountAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              {/* Calculations */}
              <div className="space-y-2 text-xs text-stone-600 border-t border-stone-200 pt-4">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Courier</span>
                  <span className="font-semibold text-stone-900">
                    {shippingFee === 0 ? (
                      <span className="text-[#0A3622] font-bold uppercase text-[10px]">
                        Complimentary
                      </span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between pt-3 border-t border-stone-300 text-base font-bold text-[#1A1A1A]">
                  <span>Grand Total</span>
                  <span className="font-cormorant text-2xl text-[#0A3622]">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={processing}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] hover:to-[#C69F2A] text-[#0A3622] font-semibold text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#D4AF37]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {processing ? (
                  <div className="w-4 h-4 border-2 border-[#0A3622] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Authorize Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[10px] text-center text-stone-400 space-y-1">
                <p>Protected by 256-bit SSL Banking Encryption</p>
                <p>Authentic ZURIQ FASHION Fusion Apparel Couture</p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <StoreFooter />
    </div>
  );
}
