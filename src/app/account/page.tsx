"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/lib/customerAuth";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types/admin";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  LogOut,
  Edit2,
  CheckCircle,
  Truck,
  Sparkles,
  Package,
  ArrowRight,
  Clock,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading, logoutCustomer, updateCustomerProfile } = useCustomerAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Edit Profile modal state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login?redirect=/account");
    }
  }, [loading, customer, router]);

  // Load customer's orders
  useEffect(() => {
    if (!customer) return;

    setEditName(customer.name || "");
    setEditEmail(customer.email || "");
    setEditAddress(customer.address || "");

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        // Query orders by customer name or email
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .or(`customer_name.eq.${customer.name}`)
          .order("created_at", { ascending: false });

        if (data && !error) {
          setOrders(data as Order[]);
        }
      } catch (err) {
        console.error("Failed to fetch customer orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [customer]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const success = await updateCustomerProfile({
      name: editName.trim(),
      email: editEmail.trim(),
      address: editAddress.trim(),
    });

    setSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setEditing(false);
        setSaveSuccess(false);
      }, 1200);
    }
  };

  const handleLogout = () => {
    logoutCustomer();
    router.push("/");
  };

  if (loading || !customer) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans">
        <StoreHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-[#0A3622] rounded-full animate-spin mx-auto mb-3" />
            <p className="font-cormorant text-stone-500 text-sm">
              Loading Client Profile...
            </p>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans">
      <StoreHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#D4AF37]/25 mb-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.26em] text-[#8C6D1F] font-semibold">
              Client Portal
            </span>
            <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#0A3622] mt-0.5">
              Welcome, {customer.name || "Valued Client"}
            </h1>
            <p className="text-xs text-stone-500 font-mono mt-1">
              Member ID: {customer.id} &bull; Verified Mobile: {customer.phone}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 rounded-xl border border-[#D4AF37] bg-white hover:bg-amber-50/50 text-[#0A3622] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#8C6D1F]" />
              <span>{editing ? "Close Editor" : "Edit Profile"}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-[#0A3622] text-[#FAF8F5] hover:bg-[#072417] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Form Drawer */}
        {editing && (
          <div className="luxury-card p-6 sm:p-8 mb-8 border border-[#D4AF37] shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20 mb-4">
              <h3 className="font-cormorant text-xl font-bold text-[#0A3622]">
                Update Client Coordinates
              </h3>
              {saveSuccess && (
                <span className="text-emerald-700 font-medium text-xs flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Profile Updated
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-stone-600 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#D4AF37] text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#D4AF37] text-stone-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-stone-600 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Default Shipping Address
                  </label>
                  <textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    rows={2}
                    placeholder="Enter street, city, state and PIN code"
                    className="w-full border border-stone-300 rounded-xl px-3.5 py-2 outline-none focus:border-[#D4AF37] text-stone-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] text-[#0A3622] font-semibold text-xs uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Coordinates"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profile Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Contact Details */}
          <div className="luxury-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#0A3622] pb-2 border-b border-[#D4AF37]/20">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-cormorant font-bold text-lg">Contact Identity</h3>
            </div>
            <div className="text-xs space-y-2 text-stone-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-mono text-stone-800 font-semibold">
                  {customer.phone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-stone-800 truncate">{customer.email}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Saved Destination */}
          <div className="luxury-card p-6 space-y-3">
            <div className="flex items-center gap-2 text-[#0A3622] pb-2 border-b border-[#D4AF37]/20">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="font-cormorant font-bold text-lg">Shipping Destination</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {customer.address ? (
                customer.address
              ) : (
                <span className="italic text-stone-400">
                  No default delivery address configured yet.
                </span>
              )}
            </p>
          </div>

          {/* Card 3: Loyalty & Spend Stats */}
          <div className="luxury-card p-6 space-y-3 bg-gradient-to-br from-[#0A3622] to-[#062115] text-[#FAF8F5]">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-cormorant font-bold text-lg text-[#FAF8F5]">
                  Couture Privilege
                </h3>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold px-2 py-0.5 rounded bg-white/10 border border-[#D4AF37]/40">
                VIP
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] text-stone-300 uppercase block tracking-wider">
                  Total Orders
                </span>
                <span className="font-cormorant text-2xl font-bold text-[#FAF8F5]">
                  {customer.total_orders || orders.length || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-300 uppercase block tracking-wider">
                  Total Value
                </span>
                <span className="font-cormorant text-2xl font-bold text-[#D4AF37]">
                  ₹{Number(customer.total_spent || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/25">
            <div className="flex items-center gap-2.5">
              <Package className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-cormorant text-2xl font-bold text-[#0A3622]">
                Your Couture Orders
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-semibold text-[#8C6D1F] hover:text-[#0A3622] hover:underline flex items-center gap-1"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingOrders ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-[#0A3622] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-stone-500">Retrieving order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="luxury-card p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#0A3622]/5 border border-[#D4AF37]/30 flex items-center justify-center mx-auto text-[#0A3622]">
                <ShoppingBag className="w-7 h-7 text-[#D4AF37]" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#0A3622]">
                No Orders Placed Yet
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Explore our handcrafted fusion apparel, kurtis, and royal lehengas designed for modern grace.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] text-[#0A3622] text-xs font-semibold uppercase tracking-wider shadow-md"
              >
                <span>Discover Creations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="luxury-card p-5 sm:p-6 hover:shadow-lg transition-shadow border border-stone-200 hover:border-[#D4AF37]/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-900">
                          #{ord.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            ord.order_status === "Delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : ord.order_status === "Shipped"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {ord.order_status}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5 block flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(ord.created_at || Date.now()).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-stone-400 block uppercase tracking-wider">
                          Grand Total
                        </span>
                        <span className="font-cormorant text-xl font-bold text-[#0A3622]">
                          ₹{Number(ord.total_amount).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <Link
                        href={`/track-order?id=${ord.id}`}
                        className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#0A3622] border border-[#D4AF37]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#8C6D1F]" />
                        <span>Track</span>
                      </Link>
                    </div>
                  </div>

                  {/* Items List inside order */}
                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.isArray(ord.items) &&
                      ord.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-12 h-14 object-cover rounded-lg border border-stone-200"
                            />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-medium text-stone-900 truncate">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-stone-500 font-mono">
                              Size: {item.size} &bull; Qty: {item.quantity} &bull; ₹
                              {Number(item.price).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
