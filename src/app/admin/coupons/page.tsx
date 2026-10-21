"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Coupon, Offer } from "@/types/admin";
import {
  TicketPercent,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Upload,
  Sparkles,
  Megaphone,
  Check,
  ExternalLink,
} from "lucide-react";

export default function AdminCouponsPage() {
  const [activeTab, setActiveTab] = useState<"coupons" | "offers">("coupons");

  // Coupons State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [couponValue, setCouponValue] = useState<number | "">("");
  const [couponMinAmount, setCouponMinAmount] = useState<number | "">(1999);
  const [couponUsageLimit, setCouponUsageLimit] = useState<number | "">(100);
  const [couponExpiresAt, setCouponExpiresAt] = useState("");
  const [couponIsActive, setCouponIsActive] = useState(true);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Offers State
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerLinkUrl, setOfferLinkUrl] = useState("");
  const [offerBannerImage, setOfferBannerImage] = useState("");
  const [offerIsActive, setOfferIsActive] = useState(true);
  const [uploadingOfferBanner, setUploadingOfferBanner] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const fetchOffers = async () => {
    setLoadingOffers(true);
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOffers(data || []);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchOffers();
  }, []);

  // Coupon Handlers
  const handleOpenAddCoupon = () => {
    setCouponCode("");
    setCouponType("PERCENTAGE");
    setCouponValue("");
    setCouponMinAmount(1999);
    setCouponUsageLimit(100);
    setCouponExpiresAt("");
    setCouponIsActive(true);
    setCouponError(null);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError("Coupon code is required.");
      return;
    }
    if (couponValue === "" || Number(couponValue) <= 0) {
      setCouponError("Valid discount value is required.");
      return;
    }

    setSavingCoupon(true);
    setCouponError(null);

    try {
      const { error } = await supabase.from("coupons").insert({
        code: couponCode.trim().toUpperCase(),
        discount_type: couponType,
        discount_value: Number(couponValue),
        min_order_amount: couponMinAmount !== "" ? Number(couponMinAmount) : 0,
        usage_limit: couponUsageLimit !== "" ? Number(couponUsageLimit) : null,
        used_count: 0,
        expires_at: couponExpiresAt ? new Date(couponExpiresAt).toISOString() : null,
        is_active: couponIsActive,
      });

      if (error) throw error;
      setIsCouponModalOpen(false);
      await fetchCoupons();
    } catch (err: any) {
      setCouponError(err.message || "Failed to create coupon.");
    } finally {
      setSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (c: Coupon) => {
    const nextStatus = !c.is_active;
    setCoupons((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, is_active: nextStatus } : item))
    );

    try {
      await supabase.from("coupons").update({ is_active: nextStatus }).eq("id", c.id);
    } catch (e) {
      console.error("Failed to toggle coupon status", e);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon code "${code}"?`)) return;
    try {
      await supabase.from("coupons").delete().eq("id", id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert("Failed to delete coupon: " + err.message);
    }
  };

  // Offer Handlers
  const handleOpenAddOffer = () => {
    setOfferTitle("");
    setOfferLinkUrl("");
    setOfferBannerImage("");
    setOfferIsActive(true);
    setOfferError(null);
    setIsOfferModalOpen(true);
  };

  const handleUploadOfferBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOfferBanner(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `offers/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("zuriq-media")
        .upload(path, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: pubData } = supabase.storage.from("zuriq-media").getPublicUrl(path);
      setOfferBannerImage(pubData.publicUrl);
    } catch (err: any) {
      console.error("Offer banner upload error:", err);
      setOfferError("Failed to upload banner: " + err.message);
    } finally {
      setUploadingOfferBanner(false);
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) {
      setOfferError("Offer title is required.");
      return;
    }

    setSavingOffer(true);
    setOfferError(null);

    try {
      const { error } = await supabase.from("offers").insert({
        title: offerTitle.trim(),
        banner_image: offerBannerImage.trim() || null,
        link_url: offerLinkUrl.trim() || null,
        is_active: offerIsActive,
      });

      if (error) throw error;
      setIsOfferModalOpen(false);
      await fetchOffers();
    } catch (err: any) {
      setOfferError(err.message || "Failed to create announcement banner.");
    } finally {
      setSavingOffer(false);
    }
  };

  const handleToggleOffer = async (o: Offer) => {
    const nextStatus = !o.is_active;
    setOffers((prev) =>
      prev.map((item) => (item.id === o.id ? { ...item, is_active: nextStatus } : item))
    );

    try {
      await supabase.from("offers").update({ is_active: nextStatus }).eq("id", o.id);
    } catch (e) {
      console.error("Failed to toggle offer status", e);
    }
  };

  const handleDeleteOffer = async (id: string, title: string) => {
    if (!confirm(`Delete announcement offer "${title}"?`)) return;
    try {
      await supabase.from("offers").delete().eq("id", id);
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err: any) {
      alert("Failed to delete offer: " + err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622]">
            Coupons & Promotional Offers
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Boost conversions with promotional discount codes and top banner announcement alerts
          </p>
        </div>

        {activeTab === "coupons" ? (
          <button
            onClick={handleOpenAddCoupon}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon Code</span>
          </button>
        ) : (
          <button
            onClick={handleOpenAddOffer}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement Banner</span>
          </button>
        )}
      </div>

      {/* Luxury Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D4AF37]/20">
        <button
          onClick={() => setActiveTab("coupons")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider font-sans border-b-2 transition-all cursor-pointer ${
            activeTab === "coupons"
              ? "border-[#D4AF37] text-[#0A3622]"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <TicketPercent className="w-4 h-4" />
          <span>Discount Coupons ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("offers")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider font-sans border-b-2 transition-all cursor-pointer ${
            activeTab === "offers"
              ? "border-[#D4AF37] text-[#0A3622]"
              : "border-transparent text-stone-400 hover:text-stone-700"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Promotional Banners ({offers.length})</span>
        </button>
      </div>

      {/* TAB 1: COUPONS */}
      {activeTab === "coupons" && (
        <div className="luxury-card overflow-hidden">
          {loadingCoupons ? (
            <div className="p-12 text-center text-xs text-stone-400">
              <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading coupon codes...
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <TicketPercent className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h4 className="font-cormorant text-lg font-bold text-stone-700">
                No active coupon codes
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Create your first promotional discount coupon code (e.g. ZURIQFIRST, FESTIVE20).
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#D4AF37]/20 uppercase tracking-wider text-[10px] font-sans">
                  <tr>
                    <th className="py-3 px-6">Coupon Code</th>
                    <th className="py-3 px-6">Discount</th>
                    <th className="py-3 px-6">Min Order</th>
                    <th className="py-3 px-6">Redemptions</th>
                    <th className="py-3 px-6">Expiry</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-sans">
                  {coupons.map((c) => {
                    const isExpired = c.expires_at && new Date(c.expires_at) < new Date();

                    return (
                      <tr key={c.id} className="hover:bg-amber-50/20 transition-colors">
                        <td className="py-3.5 px-6">
                          <span className="font-mono font-bold text-sm text-[#0A3622] bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-2.5 py-1 rounded-md tracking-wider">
                            {c.code}
                          </span>
                        </td>

                        <td className="py-3.5 px-6 font-semibold text-stone-900">
                          {c.discount_type === "PERCENTAGE"
                            ? `${c.discount_value}% OFF`
                            : `₹${c.discount_value} FLAT`}
                        </td>

                        <td className="py-3.5 px-6 text-stone-600 font-medium">
                          ₹{c.min_order_amount.toLocaleString("en-IN")}
                        </td>

                        <td className="py-3.5 px-6">
                          <span className="font-medium text-stone-700">
                            {c.used_count} / {c.usage_limit || "∞"} used
                          </span>
                        </td>

                        <td className="py-3.5 px-6 text-stone-600">
                          {c.expires_at ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span className={isExpired ? "text-rose-600 font-semibold" : ""}>
                                {new Date(c.expires_at).toLocaleDateString()}
                              </span>
                              {isExpired && (
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                                  Expired
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-stone-400">Never expires</span>
                          )}
                        </td>

                        <td className="py-3.5 px-6">
                          <button
                            type="button"
                            onClick={() => handleToggleCoupon(c)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              c.is_active ? "bg-[#0A3622]" : "bg-stone-300"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                c.is_active ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </td>

                        <td className="py-3.5 px-6 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* TAB 2: PROMOTIONAL OFFERS */}
      {activeTab === "offers" && (
        <div className="space-y-4">
          {loadingOffers ? (
            <div className="luxury-card p-12 text-center text-xs text-stone-400">
              <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading promotional announcement banners...
            </div>
          ) : offers.length === 0 ? (
            <div className="luxury-card p-12 text-center">
              <Megaphone className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h4 className="font-cormorant text-lg font-bold text-stone-700">
                No announcement banners configured
              </h4>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Add an announcement banner to display atop the storefront (e.g. "Festive Sale: Up to 40% Off on Lehengas").
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offers.map((o) => (
                <div key={o.id} className="luxury-card p-5 relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                          o.is_active
                            ? "bg-emerald-50 text-[#0A3622] border-emerald-300"
                            : "bg-stone-100 text-stone-500 border-stone-200"
                        }`}
                      >
                        {o.is_active ? "Active on Store" : "Inactive"}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleOffer(o)}
                          className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1 bg-stone-100 rounded-md"
                        >
                          {o.is_active ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(o.id, o.title)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-cormorant text-xl font-bold text-stone-900">
                      {o.title}
                    </h4>

                    {o.link_url && (
                      <a
                        href={o.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#0A3622] hover:underline flex items-center gap-1 mt-1 font-mono"
                      >
                        <span>{o.link_url}</span>
                        <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                      </a>
                    )}
                  </div>

                  {o.banner_image && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-[#D4AF37]/30 aspect-[3/1] bg-stone-100">
                      <img
                        src={o.banner_image}
                        alt={o.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Coupon */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="bg-[#0A3622] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div>
                <h3 className="font-cormorant text-xl font-bold tracking-wide">
                  New Coupon Code
                </h3>
                <p className="text-[11px] text-[#D4AF37] font-sans">
                  ZURIQ FASHION Promotions
                </p>
              </div>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 text-xs font-sans">
              {couponError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ZURIQ20, LUXE500"
                  required
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-mono font-bold tracking-wider text-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Discount Type *
                  </label>
                  <select
                    value={couponType}
                    onChange={(e: any) => setCouponType(e.target.value)}
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-2 outline-none bg-white font-medium"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={couponValue}
                    onChange={(e) =>
                      setCouponValue(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder={couponType === "PERCENTAGE" ? "20" : "500"}
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-2 outline-none font-semibold text-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={couponMinAmount}
                    onChange={(e) =>
                      setCouponMinAmount(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="1999"
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-2 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Usage Limit (Max Uses)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={couponUsageLimit}
                    onChange={(e) =>
                      setCouponUsageLimit(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="100"
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-2 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={couponExpiresAt}
                  onChange={(e) => setCouponExpiresAt(e.target.value)}
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-2 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 disabled:opacity-50"
                >
                  {savingCoupon ? "Saving..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Promotional Banner Offer */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            <div className="bg-[#0A3622] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div>
                <h3 className="font-cormorant text-xl font-bold tracking-wide">
                  New Announcement Banner
                </h3>
                <p className="text-[11px] text-[#D4AF37] font-sans">
                  ZURIQ FASHION Store Announcements
                </p>
              </div>
              <button
                onClick={() => setIsOfferModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOffer} className="p-6 space-y-4 text-xs font-sans">
              {offerError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{offerError}</span>
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="e.g. Festive Special: Complimentary Shipping On Orders Over ₹2,999"
                  required
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-medium text-stone-800"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Link Destination URL (Optional)
                </label>
                <input
                  type="text"
                  value={offerLinkUrl}
                  onChange={(e) => setOfferLinkUrl(e.target.value)}
                  placeholder="/collections/lehengas"
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2 outline-none text-stone-800"
                />
              </div>

              {/* Banner Image Upload to zuriq-media */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Promotional Banner Graphic (zuriq-media bucket)
                </label>
                <div className="space-y-2">
                  <label className="cursor-pointer border border-dashed border-[#D4AF37]/60 hover:border-[#D4AF37] bg-amber-50/20 hover:bg-amber-50/40 rounded-xl p-3 flex items-center justify-center gap-2 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadOfferBanner}
                      disabled={uploadingOfferBanner}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-semibold text-[11px] text-[#0A3622]">
                      {uploadingOfferBanner ? "Uploading to zuriq-media..." : "Upload Banner Image"}
                    </span>
                  </label>

                  <input
                    type="url"
                    value={offerBannerImage}
                    onChange={(e) => setOfferBannerImage(e.target.value)}
                    placeholder="Or enter direct image URL"
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-1.5 outline-none text-[11px]"
                  />

                  {offerBannerImage && (
                    <div className="rounded-xl overflow-hidden border border-[#D4AF37]/30 h-20 bg-stone-100 relative group">
                      <img
                        src={offerBannerImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setOfferBannerImage("")}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingOffer || uploadingOfferBanner}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 disabled:opacity-50"
                >
                  {savingOffer ? "Saving..." : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
