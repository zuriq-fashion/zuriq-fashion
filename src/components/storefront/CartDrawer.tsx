"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cartContext";
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  TicketPercent,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
} from "lucide-react";

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalCount,
    subtotal,
    discountAmount,
    shippingFee,
    finalTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setApplyingCoupon(true);
    setCouponFeedback(null);

    const res = await applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponFeedback({ type: "success", text: res.message });
      setCouponInput("");
    } else {
      setCouponFeedback({ type: "error", text: res.message });
    }
    setApplyingCoupon(false);
  };

  const freeShippingThreshold = 2999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Dark overlay backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl flex flex-col border-l border-[#D4AF37]/30 text-[#1A1A1A]">
          {/* Header */}
          <div className="bg-[#0A3622] text-[#FAF8F5] p-5 border-b border-[#D4AF37]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="font-cormorant text-xl font-bold tracking-wide">
                  Your Shopping Bag
                </h3>
                <p className="text-[11px] text-[#D4AF37] font-sans tracking-wider uppercase font-semibold">
                  {totalCount} {totalCount === 1 ? "Piece Selected" : "Pieces Selected"}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="p-1.5 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-amber-50/70 border-b border-[#D4AF37]/20 p-3 text-xs">
            {amountNeededForFreeShipping > 0 ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-[#0A3622]">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Add ₹{amountNeededForFreeShipping.toLocaleString("en-IN")} more for Complimentary Shipping
                  </span>
                  <span className="font-bold text-[#8C6D1F]">{freeShippingProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#8C6D1F] rounded-full transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-800 text-[11px] font-semibold">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>You have unlocked Complimentary Express Delivery!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#0A3622]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#0A3622]">
                  <ShoppingBag className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-cormorant text-2xl font-bold text-[#0A3622]">
                    Your bag is empty
                  </h4>
                  <p className="text-xs text-stone-500 font-sans mt-1 max-w-xs">
                    Explore our exquisite Kurtis, Lehengas, and fusion ensembles to add timeless elegance to your wardrobe.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 uppercase tracking-wider cursor-pointer"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3.5 rounded-xl bg-white border border-[#D4AF37]/25 shadow-xs relative group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-24 rounded-lg overflow-hidden bg-stone-100 border border-[#D4AF37]/30 shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.productId}`}
                          onClick={closeCart}
                          className="font-cormorant font-bold text-sm text-[#1A1A1A] hover:text-[#0A3622] leading-snug line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-mono font-bold bg-[#0A3622]/5 text-[#0A3622] px-2 py-0.5 rounded border border-[#0A3622]/15">
                          Size: {item.size}
                        </span>
                        <span className="text-[10px] text-stone-500 truncate">
                          {item.categoryName}
                        </span>
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-cormorant font-bold text-base text-[#0A3622]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        {item.regularPrice > item.price && (
                          <span className="block text-[10px] line-through text-stone-400">
                            ₹{(item.regularPrice * item.quantity).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Box */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#D4AF37]/25 bg-white space-y-4">
              {/* Coupon Box */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs">
                    <div className="flex items-center gap-2">
                      <TicketPercent className="w-4 h-4 text-[#0A3622]" />
                      <div>
                        <span className="font-mono font-bold text-[#0A3622]">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-emerald-700 text-[11px] block">
                          {appliedCoupon.discount_type === "PERCENTAGE"
                            ? `${appliedCoupon.discount_value}% Discount Applied`
                            : `₹${appliedCoupon.discount_value} Off`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <TicketPercent className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Coupon code (e.g. ZURIQ15)"
                          className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-xl outline-none focus:border-[#D4AF37] font-mono uppercase"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="px-4 py-2 bg-[#0A3622] hover:bg-[#0E472D] text-[#D4AF37] font-semibold text-xs rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {applyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>

                    {couponFeedback && (
                      <div
                        className={`text-[11px] flex items-center gap-1.5 ${
                          couponFeedback.type === "success"
                            ? "text-emerald-700"
                            : "text-rose-600"
                        }`}
                      >
                        {couponFeedback.type === "success" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{couponFeedback.text}</span>
                      </div>
                    )}
                  </form>
                )}
              </div>

              {/* Order Cost Breakdown */}
              <div className="space-y-1.5 text-xs text-stone-600 border-t border-stone-100 pt-3">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-stone-900">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Promotional Discount</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="font-semibold text-stone-900">
                    {shippingFee === 0 ? (
                      <span className="text-[#0A3622] uppercase text-[10px] font-bold">
                        Complimentary
                      </span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-[#1A1A1A]">
                  <span>Total Amount</span>
                  <span className="font-cormorant text-xl text-[#0A3622]">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] hover:to-[#C69F2A] text-[#0A3622] font-semibold text-sm shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Luxury Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-[10px] text-center text-stone-400">
                100% Authentic Indian Fusion Couture &bull; Secure Encrypted Checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
