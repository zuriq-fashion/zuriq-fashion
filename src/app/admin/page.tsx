"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/lib/adminAuth";
import {
  IndianRupee,
  ShoppingBag,
  Sparkles,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Order } from "@/types/admin";

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders count & sum
      const { data: orders, error: oErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const allOrders: Order[] = orders || [];
      const totalRev = allOrders.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

      // 2. Products count
      const { count: prodCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // 3. Customers count
      const { count: custCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true });

      setMetrics({
        totalRevenue: totalRev,
        totalOrders: allOrders.length,
        totalProducts: prodCount || 0,
        totalCustomers: custCount || 0,
      });

      setRecentOrders(allOrders.slice(0, 6));
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Quick Seed Demo Data helper for instant luxury showcase
  const handleSeedSampleData = async () => {
    setSeeding(true);
    try {
      // Check existing categories
      const { data: existingCats } = await supabase.from("categories").select("id, name");
      let catId = existingCats?.[0]?.id;

      if (!catId) {
        const { data: newCat } = await supabase
          .from("categories")
          .insert({
            name: "Kurti 3 Pcs",
            slug: "kurti-3-pcs",
            is_active: true,
          })
          .select()
          .single();
        catId = newCat?.id;
      }

      // Add Sample Products if none
      if (metrics.totalProducts === 0) {
        await supabase.from("products").insert([
          {
            title: "Royal Emerald Handcrafted Anarkali Suit",
            description: "Opulent silk blend anarkali with intricate golden zardozi embroidery and matching organza dupatta.",
            category_id: catId,
            price: 5499,
            discount_price: 4299,
            fabric: "Pure Chanderi Silk",
            sizes: ["M", "L", "XL"],
            stock_quantity: 18,
            is_featured: true,
            images: [
              "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            ],
          },
          {
            title: "Golden Ivory Embroidered Kurti Set",
            description: "Contemporary straight cut tunic paired with cigarette pants and hand-embroidered neckline.",
            category_id: catId,
            price: 3899,
            discount_price: 2999,
            fabric: "Georgette Silk",
            sizes: ["S", "M", "L", "XL", "XXL"],
            stock_quantity: 24,
            is_featured: true,
            images: [
              "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
            ],
          },
        ]);
      }

      // Add Sample Customers if none
      if (metrics.totalCustomers === 0) {
        await supabase.from("customers").insert([
          {
            name: "Priya Sharma",
            email: "priya.sharma@example.com",
            phone: "+91 98765 43210",
            address: "42 Golf Links, New Delhi, India",
            total_orders: 2,
            total_spent: 7298,
          },
          {
            name: "Ayesha Khan",
            email: "ayesha.khan@example.com",
            phone: "+91 98200 12345",
            address: "Bandra West, Mumbai, India",
            total_orders: 1,
            total_spent: 4299,
          },
        ]);
      }

      // Add Sample Orders if none
      if (metrics.totalOrders === 0) {
        await supabase.from("orders").insert([
          {
            customer_name: "Priya Sharma",
            total_amount: 4299,
            payment_method: "Razorpay",
            payment_status: "Paid",
            order_status: "Confirmed",
            items: [
              {
                title: "Royal Emerald Handcrafted Anarkali Suit",
                size: "M",
                quantity: 1,
                price: 4299,
              },
            ],
          },
          {
            customer_name: "Ayesha Khan",
            total_amount: 2999,
            payment_method: "COD",
            payment_status: "Pending",
            order_status: "Order Placed",
            items: [
              {
                title: "Golden Ivory Embroidered Kurti Set",
                size: "L",
                quantity: 1,
                price: 2999,
              },
            ],
          },
        ]);
      }

      // Add Sample Coupon if none
      await supabase.from("coupons").upsert(
        {
          code: "ZURIQFIRST",
          discount_type: "PERCENTAGE",
          discount_value: 15,
          min_order_amount: 2999,
          usage_limit: 100,
          used_count: 8,
          is_active: true,
        },
        { onConflict: "code" }
      );

      // Re-fetch
      await fetchDashboardData();
    } catch (e) {
      console.error("Error seeding sample data:", e);
    } finally {
      setSeeding(false);
    }
  };

  const getOrderStatusPill = (status: string) => {
    switch (status) {
      case "Order Placed":
        return {
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          icon: Clock,
        };
      case "Confirmed":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Package,
        };
      case "Shipped":
        return {
          bg: "bg-purple-50 text-purple-800 border-purple-200",
          icon: Truck,
        };
      case "Delivered":
        return {
          bg: "bg-emerald-50 text-[#0A3622] border-emerald-300",
          icon: CheckCircle2,
        };
      case "Cancelled":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          icon: XCircle,
        };
      default:
        return {
          bg: "bg-stone-50 text-stone-700 border-stone-200",
          icon: Clock,
        };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0A3622] via-[#0E472D] to-[#0A3622] text-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-[#D4AF37]/35 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-[0.2em] mb-1 font-sans">
            <Sparkles className="w-4 h-4" />
            <span>Executive Command Center</span>
          </div>
          <h1 className="font-cormorant text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide">
            Welcome, {admin?.name || "Administrator"}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-xl font-sans font-light">
            Real-time analytics, inventory management, and client orders for ZURIQ FASHION.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 border border-[#D4AF37]/30 transition-all flex items-center justify-center cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          {metrics.totalProducts === 0 && (
            <button
              onClick={handleSeedSampleData}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-[#D4AF37] font-semibold text-xs border border-[#D4AF37]/50 shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{seeding ? "Populating..." : "Seed Demo Products"}</span>
            </button>
          )}

          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] hover:to-[#C69F2A] text-[#0A3622] font-semibold text-xs shadow-lg shadow-[#D4AF37]/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 4 Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Total Revenue */}
        <div className="luxury-card p-6 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500 font-sans">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#0A3622]/10 text-[#0A3622] flex items-center justify-center group-hover:bg-[#0A3622] group-hover:text-[#D4AF37] transition-colors">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="font-cormorant text-3xl sm:text-4xl font-bold text-[#0A3622]">
            ₹{metrics.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-[#0A3622]" />
            <span>Direct from Orders</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="luxury-card p-6 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500 font-sans">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#8C6D1F] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A3622] transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="font-cormorant text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            {metrics.totalOrders}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
            <span>Razorpay & COD orders</span>
          </div>
        </div>

        {/* Metric 3: Total Products */}
        <div className="luxury-card p-6 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500 font-sans">
              Active Catalog
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#0A3622]/10 text-[#0A3622] flex items-center justify-center group-hover:bg-[#0A3622] group-hover:text-[#D4AF37] transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="font-cormorant text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            {metrics.totalProducts}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
            <span>Apparel items listed</span>
          </div>
        </div>

        {/* Metric 4: Total Customers */}
        <div className="luxury-card p-6 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-[0.16em] font-semibold text-stone-500 font-sans">
              Client Registry
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#8C6D1F] flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-[#0A3622] transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="font-cormorant text-3xl sm:text-4xl font-bold text-[#1A1A1A]">
            {metrics.totalCustomers}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-2">
            <span>Registered buyers</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/admin/categories"
          className="p-4 rounded-xl bg-white border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-sans group-hover:text-[#0A3622]">
            Categories
          </span>
          <div className="flex items-center justify-between mt-3 text-sm font-semibold text-[#0A3622]">
            <span>Manage Hierarchy</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="p-4 rounded-xl bg-white border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-sans group-hover:text-[#0A3622]">
            Orders
          </span>
          <div className="flex items-center justify-between mt-3 text-sm font-semibold text-[#0A3622]">
            <span>Track & Dispatch</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/coupons"
          className="p-4 rounded-xl bg-white border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-sans group-hover:text-[#0A3622]">
            Promotions
          </span>
          <div className="flex items-center justify-between mt-3 text-sm font-semibold text-[#0A3622]">
            <span>Coupons & Offers</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/staff"
          className="p-4 rounded-xl bg-white border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider font-sans group-hover:text-[#0A3622]">
            Access Control
          </span>
          <div className="flex items-center justify-between mt-3 text-sm font-semibold text-[#0A3622]">
            <span>Staff & Roles</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="luxury-card overflow-hidden">
        <div className="p-6 border-b border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-cormorant text-xl font-bold text-[#0A3622]">
              Recent Client Orders
            </h3>
            <p className="text-xs text-stone-500 font-sans">
              Latest transactions placed on ZURIQ FASHION
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-[#0A3622] hover:text-[#D4AF37] flex items-center gap-1.5 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h4 className="font-cormorant text-lg font-bold text-stone-700">
              No orders placed yet
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Once clients place orders through Razorpay or Cash on Delivery, they will appear here in real-time.
            </p>
            <button
              onClick={handleSeedSampleData}
              disabled={seeding}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0A3622] text-[#D4AF37] text-xs font-semibold hover:bg-[#0E472D] transition-colors"
            >
              Seed Sample Orders & Products
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#D4AF37]/20 uppercase tracking-wider text-[10px] font-sans">
                <tr>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Items Summary</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Payment</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {recentOrders.map((order) => {
                  const statusPill = getOrderStatusPill(order.order_status);
                  const Icon = statusPill.icon;
                  const itemsCount = Array.isArray(order.items) ? order.items.length : 1;

                  return (
                    <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-stone-900">
                          {order.customer_name || "Guest Client"}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                          ID: {order.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-medium text-stone-700">
                          {itemsCount} {itemsCount === 1 ? "Item" : "Items"}
                        </span>
                        {Array.isArray(order.items) && order.items[0]?.title && (
                          <p className="text-[11px] text-stone-500 truncate max-w-xs mt-0.5">
                            {order.items[0].title}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6 font-semibold text-[#0A3622]">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          {order.payment_method || "Online"} &bull; {order.payment_status}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusPill.bg}`}
                        >
                          <Icon className="w-3 h-3" />
                          {order.order_status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          href="/admin/orders"
                          className="text-xs font-semibold text-[#0A3622] hover:text-[#D4AF37] transition-colors"
                        >
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
