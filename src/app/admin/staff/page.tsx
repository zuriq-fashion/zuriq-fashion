"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/lib/adminAuth";
import { AdminUser, AdminRole, AdminPermissions } from "@/types/admin";
import {
  ShieldCheck,
  Plus,
  ShieldAlert,
  UserCheck,
  Edit2,
  Trash2,
  Lock,
  Mail,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  Key,
} from "lucide-react";

const MODULE_PERMISSIONS = [
  { key: "products", label: "Product Catalog", desc: "Add, edit, price, and upload media" },
  { key: "categories", label: "Categories", desc: "Manage hierarchy & slug structure" },
  { key: "orders", label: "Orders & Shipping", desc: "View orders and update dispatch stages" },
  { key: "coupons", label: "Coupons & Offers", desc: "Create discount codes and banners" },
  { key: "customers", label: "Client Registry", desc: "View and manage customer data" },
  { key: "admins", label: "Staff & Permissions", desc: "Create accounts & assign roles" },
];

export default function AdminStaffPage() {
  const { admin, isSuperAdmin } = useAdminAuth();

  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<AdminUser | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<AdminRole>("manager");
  const [formPermissions, setFormPermissions] = useState<AdminPermissions>({
    products: true,
    categories: true,
    orders: true,
    coupons: true,
    customers: true,
    admins: false,
  });
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStaffList(data || []);
    } catch (err: any) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  // Handle Role selection changes to auto-preset permissions
  const handleRoleChange = (role: AdminRole) => {
    setFormRole(role);
    if (role === "super_admin") {
      setFormPermissions({
        products: true,
        categories: true,
        orders: true,
        coupons: true,
        customers: true,
        admins: true,
      });
    } else if (role === "manager") {
      setFormPermissions({
        products: true,
        categories: true,
        orders: true,
        coupons: true,
        customers: true,
        admins: false,
      });
    } else if (role === "support") {
      setFormPermissions({
        products: false,
        categories: false,
        orders: true,
        coupons: false,
        customers: true,
        admins: false,
      });
    }
  };

  const togglePermission = (key: string) => {
    setFormPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("manager");
    setFormPermissions({
      products: true,
      categories: true,
      orders: true,
      coupons: true,
      customers: true,
      admins: false,
    });
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (staff: AdminUser) => {
    setEditingStaff(staff);
    setFormName(staff.name);
    setFormEmail(staff.email);
    setFormPassword(""); // Leave empty unless changing
    setFormRole(staff.role);
    setFormPermissions(staff.permissions || {});
    setFormIsActive(staff.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    if (!editingStaff && !formPassword.trim()) {
      setFormError("Password is required for new accounts.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload: any = {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole,
      permissions: formPermissions,
      is_active: formIsActive,
    };

    if (formPassword.trim()) {
      payload.password_hash = formPassword.trim();
    }

    try {
      if (editingStaff) {
        const { error } = await supabase
          .from("admin_users")
          .update(payload)
          .eq("id", editingStaff.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("admin_users").insert(payload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchStaff();
    } catch (err: any) {
      setFormError(err.message || "Failed to save administrator account.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (staff: AdminUser) => {
    if (staff.email === admin?.email) {
      alert("You cannot deactivate your own administrative account.");
      return;
    }

    const nextStatus = !staff.is_active;
    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, is_active: nextStatus } : s))
    );

    try {
      await supabase
        .from("admin_users")
        .update({ is_active: nextStatus })
        .eq("id", staff.id);
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDeleteStaff = async (staff: AdminUser) => {
    if (staff.email === admin?.email) {
      alert("You cannot delete your own active administrator account.");
      return;
    }

    if (!confirm(`Permanently remove staff access for "${staff.name}" (${staff.email})?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("admin_users").delete().eq("id", staff.id);
      if (error) throw error;
      setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
    } catch (err: any) {
      alert("Failed to delete staff account: " + err.message);
    }
  };

  // If NOT Super Admin, restrict access
  if (!isSuperAdmin) {
    return (
      <div className="luxury-card p-12 text-center max-w-lg mx-auto my-12 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-cormorant text-2xl font-bold text-stone-900">
          Super Admin Authorization Required
        </h2>
        <p className="text-xs text-stone-500 font-sans mt-2 leading-relaxed">
          The Staff & Role Assignment module is strictly reserved for the primary store owner and Super Administrators. Your current role is configured as <strong className="uppercase text-stone-800">{admin?.role}</strong>.
        </p>
      </div>
    );
  }

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case "super_admin":
        return "bg-[#D4AF37]/20 text-[#0A3622] border-[#D4AF37]/50 font-bold";
      case "manager":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold";
      default:
        return "bg-stone-100 text-stone-700 border-stone-200 font-medium";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622]">
            Staff & Role Assignment
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Role-Based Access Control (RBAC) & granular module permissions for ZURIQ FASHION
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Admin / Staff Account</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading administrative personnel...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#D4AF37]/20 uppercase tracking-wider text-[10px] font-sans">
                <tr>
                  <th className="py-3 px-6">Administrator</th>
                  <th className="py-3 px-6">Role Assignment</th>
                  <th className="py-3 px-6">Granted Permissions</th>
                  <th className="py-3 px-6">Active Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {staffList.map((staff) => {
                  const perms = staff.permissions || {};
                  const activePermCount = Object.values(perms).filter(Boolean).length;

                  return (
                    <tr key={staff.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0A3622] text-[#D4AF37] flex items-center justify-center font-cormorant font-bold text-sm shrink-0">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 font-cormorant text-sm">
                              {staff.name}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">
                              {staff.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider border ${getRoleBadge(
                            staff.role
                          )}`}
                        >
                          {staff.role.replace("_", " ")}
                        </span>
                      </td>

                      {/* Permissions */}
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {MODULE_PERMISSIONS.map((m) => {
                            const isAllowed = staff.role === "super_admin" || perms[m.key];
                            return (
                              <span
                                key={m.key}
                                className={`px-2 py-0.5 rounded text-[10px] border ${
                                  isAllowed
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : "bg-stone-50 text-stone-400 border-stone-200 line-through"
                                }`}
                              >
                                {m.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(staff)}
                          disabled={staff.email === admin?.email}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                            staff.is_active ? "bg-[#0A3622]" : "bg-stone-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              staff.is_active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(staff)}
                          className="p-1.5 text-stone-600 hover:text-[#0A3622] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Permissions"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {staff.email !== admin?.email && (
                          <button
                            onClick={() => handleDeleteStaff(staff)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-2xl max-w-lg w-full my-8 overflow-hidden animate-fadeIn">
            <div className="bg-[#0A3622] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div>
                <h3 className="font-cormorant text-xl font-bold tracking-wide">
                  {editingStaff ? "Edit Administrative Permissions" : "Register Admin / Staff"}
                </h3>
                <p className="text-[11px] text-[#D4AF37] font-sans">
                  ZURIQ FASHION Role-Based Access Control
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4 text-xs font-sans">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  required
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-medium text-stone-800"
                />
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="staff@zuriqfashion.com"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Password {editingStaff ? "(Leave blank to keep)" : "*"}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    required={!editingStaff}
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none text-stone-800"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Role Preset *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["super_admin", "manager", "support"] as AdminRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        formRole === r
                          ? "bg-[#0A3622] text-[#D4AF37] border-[#0A3622] font-bold shadow-sm"
                          : "bg-white text-stone-700 border-stone-200 hover:border-[#D4AF37]"
                      }`}
                    >
                      <div className="capitalize text-xs">{r.replace("_", " ")}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Permissions Matrix */}
              <div>
                <label className="block text-stone-700 font-semibold mb-2 uppercase tracking-wider text-[10px]">
                  Granular Module Permissions
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {MODULE_PERMISSIONS.map((m) => {
                    const isChecked =
                      formRole === "super_admin" || !!formPermissions[m.key];
                    const isDisabled = formRole === "super_admin";

                    return (
                      <label
                        key={m.key}
                        className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors cursor-pointer ${
                          isChecked ? "bg-white shadow-xs" : "opacity-60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => togglePermission(m.key)}
                          className="w-4 h-4 mt-0.5 accent-[#0A3622] rounded"
                        />
                        <div>
                          <div className="font-semibold text-stone-900 text-xs">
                            {m.label}
                          </div>
                          <div className="text-[10px] text-stone-500">{m.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
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
                  {saving ? "Saving..." : editingStaff ? "Save Permissions" : "Register Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
