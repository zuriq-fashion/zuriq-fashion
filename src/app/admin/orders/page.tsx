"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/types/admin";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  XCircle,
  IndianRupee,
  Calendar,
  X,
  Printer,
  ChevronDown,
} from "lucide-react";

const ORDER_STATUSES: OrderStatus[] = [
  "Order Placed",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, order_status: newStatus });
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({ order_status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
      await fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
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
          bg: "bg-emerald-50 text-[#0A3622] border-emerald-300 font-bold",
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

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.order_status === statusFilter;
    const matchesPayment = paymentFilter === "all" || o.payment_method === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622]">
            Client Orders & Dispatch
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Monitor client fulfillment, payment gateways (Razorpay / COD), and delivery stages
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 rounded-xl bg-white border border-[#D4AF37]/50 text-[#0A3622] hover:bg-amber-50/40 text-xs font-semibold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="luxury-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or order ID..."
            className="w-full bg-transparent outline-none text-stone-800 placeholder:text-stone-400 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none cursor-pointer focus:border-[#D4AF37]"
          >
            <option value="all">All Order Statuses</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none cursor-pointer focus:border-[#D4AF37]"
          >
            <option value="all">All Payment Methods</option>
            <option value="Razorpay">Razorpay</option>
            <option value="COD">Cash on Delivery (COD)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading orders from Supabase...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="font-cormorant text-lg font-bold text-stone-700">
              No orders found
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              No client orders match your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#D4AF37]/20 uppercase tracking-wider text-[10px] font-sans">
                <tr>
                  <th className="py-3 px-6">Order ID & Date</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Items</th>
                  <th className="py-3 px-6">Total Amount</th>
                  <th className="py-3 px-6">Payment</th>
                  <th className="py-3 px-6">Order Stage</th>
                  <th className="py-3 px-6 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredOrders.map((o) => {
                  const itemsList = Array.isArray(o.items) ? o.items : [];
                  const statusBadge = getStatusBadge(o.order_status);
                  const Icon = statusBadge.icon;

                  return (
                    <tr key={o.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-6">
                        <div className="font-mono font-bold text-[#0A3622] text-xs">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {o.created_at
                              ? new Date(o.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recent"}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-stone-900 font-cormorant text-sm">
                          {o.customer_name || "Guest Client"}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-6">
                        <div className="font-medium text-stone-700">
                          {itemsList.length} {itemsList.length === 1 ? "Product" : "Products"}
                        </div>
                        {itemsList[0]?.title && (
                          <div className="text-[10px] text-stone-500 truncate max-w-xs">
                            {itemsList[0].title} ({itemsList[0].size || "M"})
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-6 font-bold text-[#0A3622] text-sm">
                        ₹{Number(o.total_amount).toLocaleString("en-IN")}
                      </td>

                      {/* Payment */}
                      <td className="py-3.5 px-6">
                        <div>
                          <span className="font-semibold text-stone-800">
                            {o.payment_method || "Razorpay"}
                          </span>
                          <span
                            className={`block text-[10px] font-medium ${
                              o.payment_status === "Paid"
                                ? "text-emerald-700 font-bold"
                                : "text-amber-700"
                            }`}
                          >
                            {o.payment_status || "Pending"}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-6">
                        <div className="relative inline-block">
                          <select
                            value={o.order_status}
                            disabled={updatingId === o.id}
                            onChange={(e) =>
                              handleUpdateStatus(o.id, e.target.value as OrderStatus)
                            }
                            className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer transition-colors ${statusBadge.bg}`}
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 text-[#0A3622] hover:text-[#D4AF37] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details / Invoice Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-2xl max-w-lg w-full my-8 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-[#0A3622] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#D4AF37] font-semibold">
                  Invoice & Packing Slip
                </span>
                <h3 className="font-cormorant text-xl font-bold tracking-wide mt-0.5">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-stone-300 hover:text-white p-1.5 rounded-lg border border-white/20"
                  title="Print Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-stone-300 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs font-sans">
              {/* Customer & Payment Meta */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Customer Name
                  </span>
                  <span className="font-semibold text-stone-900 text-sm font-cormorant">
                    {selectedOrder.customer_name || "Guest Client"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Payment Status
                  </span>
                  <span className="font-semibold text-[#0A3622]">
                    {selectedOrder.payment_method} &bull; {selectedOrder.payment_status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Order Stage
                  </span>
                  <span className="font-semibold text-stone-800">
                    {selectedOrder.order_status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Date Placed
                  </span>
                  <span className="font-medium text-stone-600">
                    {selectedOrder.created_at
                      ? new Date(selectedOrder.created_at).toLocaleString("en-IN")
                      : "Recent"}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Purchased Fusion Apparel Items
                </h4>
                <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-stone-900 font-cormorant text-sm">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                            Size: <span className="font-bold text-stone-700">{item.size || "M"}</span> &bull; Qty: {item.quantity || 1}
                          </div>
                        </div>
                        <div className="font-bold text-[#0A3622]">
                          ₹{Number(item.price * (item.quantity || 1)).toLocaleString("en-IN")}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-stone-400">
                      Standard Apparel Package
                    </div>
                  )}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-sm">
                <span className="font-bold text-stone-700">Total Net Amount:</span>
                <span className="font-cormorant font-bold text-xl text-[#0A3622]">
                  ₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Stage Update Controls */}
              <div className="pt-2">
                <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                  Update Order Dispatch Stage
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                        selectedOrder.order_status === status
                          ? "bg-[#0A3622] text-[#D4AF37] border-[#0A3622] shadow-sm"
                          : "bg-white text-stone-600 border-stone-200 hover:border-[#D4AF37]"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
