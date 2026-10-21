"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types/admin";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  ShoppingBag,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formTotalOrders, setFormTotalOrders] = useState<number | "">(0);
  const [formTotalSpent, setFormTotalSpent] = useState<number | "">(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormName("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormTotalOrders(0);
    setFormTotalSpent(0);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormPhone(c.phone || "");
    setFormAddress(c.address || "");
    setFormTotalOrders(c.total_orders);
    setFormTotalSpent(c.total_spent);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Customer name and email are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim() || null,
      address: formAddress.trim() || null,
      total_orders: formTotalOrders !== "" ? Number(formTotalOrders) : 0,
      total_spent: formTotalSpent !== "" ? Number(formTotalSpent) : 0,
    };

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from("customers")
          .update(payload)
          .eq("id", editingCustomer.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("customers").insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchCustomers();
    } catch (err: any) {
      setFormError(err.message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Delete client record for "${name}"?`)) return;
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert("Failed to delete customer: " + err.message);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622]">
            Client Registry
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Maintain customer records, contact coordinates, and lifetime value histories
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client Record</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="luxury-card p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client name, email, phone, city..."
          className="w-full bg-transparent text-xs text-stone-800 outline-none placeholder:text-stone-400 font-sans"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-stone-400 hover:text-stone-600 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading customer directory...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="font-cormorant text-lg font-bold text-stone-700">
              No clients found
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Customers will automatically appear as they place orders or you can add them manually.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#D4AF37]/20 uppercase tracking-wider text-[10px] font-sans">
                <tr>
                  <th className="py-3 px-6">Client Name</th>
                  <th className="py-3 px-6">Contact Details</th>
                  <th className="py-3 px-6">Delivery Address</th>
                  <th className="py-3 px-6">Orders</th>
                  <th className="py-3 px-6">Lifetime Spent</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-amber-50/20 transition-colors">
                    {/* Name */}
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-stone-900 font-cormorant text-sm">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        ID: {c.id.slice(0, 8)}...
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mt-0.5">
                          <Phone className="w-3 h-3 text-[#D4AF37]" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-3.5 px-6">
                      {c.address ? (
                        <div className="flex items-start gap-1.5 max-w-xs text-stone-600">
                          <MapPin className="w-3.5 h-3.5 text-[#0A3622] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{c.address}</span>
                        </div>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>

                    {/* Orders count */}
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full">
                        <ShoppingBag className="w-3 h-3 text-[#D4AF37]" />
                        {c.total_orders} Orders
                      </span>
                    </td>

                    {/* Total spent */}
                    <td className="py-3.5 px-6 font-bold text-[#0A3622] text-sm">
                      ₹{Number(c.total_spent || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(c)}
                        className="p-1.5 text-stone-600 hover:text-[#0A3622] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteCustomer(c.id, c.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="bg-[#0A3622] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div>
                <h3 className="font-cormorant text-xl font-bold tracking-wide">
                  {editingCustomer ? "Edit Client Profile" : "Register Client"}
                </h3>
                <p className="text-[11px] text-[#D4AF37] font-sans">
                  ZURIQ FASHION Customer Registry
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 text-xs font-sans">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Radhika Merchant"
                  required
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-medium text-stone-800"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="radhika@example.com"
                  required
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none text-stone-800"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none text-stone-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Shipping / Residence Address
                </label>
                <textarea
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Apartment, Street, Landmark, City, State, PIN"
                  rows={2}
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2 outline-none text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Total Orders
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formTotalOrders}
                    onChange={(e) =>
                      setFormTotalOrders(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Total Spent (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formTotalSpent}
                    onChange={(e) =>
                      setFormTotalSpent(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-2 outline-none font-semibold text-[#0A3622]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingCustomer ? "Save Changes" : "Register Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
