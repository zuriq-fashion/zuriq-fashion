"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Product, Coupon } from "@/types/admin";
import { supabase } from "@/lib/supabase";

export interface CartItem {
  id: string; // `${productId}-${size}`
  productId: string;
  title: string;
  price: number; // effective unit price (discount_price || price)
  regularPrice: number;
  image: string;
  size: string;
  quantity: number;
  categoryName?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  finalTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "zuriq_cart_items";
const LOCAL_STORAGE_COUPON_KEY = "zuriq_cart_coupon";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Restore cart and coupon from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
      const storedCoupon = localStorage.getItem(LOCAL_STORAGE_COUPON_KEY);
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch (e) {
      console.error("Failed to restore cart", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(LOCAL_STORAGE_COUPON_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_COUPON_KEY);
      }
    } catch (e) {
      console.error("Failed to persist coupon", e);
    }
  }, [appliedCoupon, isLoaded]);

  const addToCart = (product: Product, size: string, quantity: number = 1) => {
    const effectivePrice =
      product.discount_price && Number(product.discount_price) > 0
        ? Number(product.discount_price)
        : Number(product.price);

    const primaryImage =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";

    const cartItemId = `${product.id}-${size}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: cartItemId,
            productId: product.id,
            title: product.title,
            price: effectivePrice,
            regularPrice: Number(product.price),
            image: primaryImage,
            size,
            quantity,
            categoryName: product.category_name || product.category?.name || "Fusion Apparel",
          },
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_COUPON_KEY);
    } catch (e) {}
  };

  // Calculations
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Discount calculation
  let discountAmount = 0;
  if (appliedCoupon && subtotal >= (appliedCoupon.min_order_amount || 0)) {
    if (appliedCoupon.discount_type === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * appliedCoupon.discount_value) / 100);
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }

  // Shipping: Complimentary above 2999, else 149
  const shippingFee = subtotal >= 2999 || subtotal === 0 ? 0 : 149;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code || !code.trim()) {
      return { success: false, message: "Please enter a coupon code." };
    }

    try {
      const cleanCode = code.trim().toUpperCase();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", cleanCode)
        .eq("is_active", true)
        .maybeSingle();

      if (error || !data) {
        return { success: false, message: `Coupon "${cleanCode}" is invalid or expired.` };
      }

      // Check expiry
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { success: false, message: `Coupon "${cleanCode}" has expired.` };
      }

      // Check minimum order requirement
      if (subtotal < (data.min_order_amount || 0)) {
        return {
          success: false,
          message: `Minimum order of ₹${data.min_order_amount.toLocaleString(
            "en-IN"
          )} required to apply "${cleanCode}".`,
        };
      }

      // Check usage limit
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        return { success: false, message: `Coupon "${cleanCode}" redemption limit reached.` };
      }

      setAppliedCoupon(data as Coupon);
      return {
        success: true,
        message: `Coupon "${cleanCode}" applied! ${
          data.discount_type === "PERCENTAGE"
            ? `${data.discount_value}% discount saved.`
            : `₹${data.discount_value} flat discount applied.`
        }`,
      };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to validate coupon." };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        totalCount,
        subtotal,
        discountAmount,
        shippingFee,
        finalTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
