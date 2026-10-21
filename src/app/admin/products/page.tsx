"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types/admin";
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  X,
  AlertCircle,
  IndianRupee,
  Layers,
  Star,
  Check,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";

const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formDiscountPrice, setFormDiscountPrice] = useState<number | "">("");
  const [formFabric, setFormFabric] = useState("");
  const [formSizes, setFormSizes] = useState<string[]>(["M", "L", "XL"]);
  const [formStock, setFormStock] = useState<number | "">(10);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formImages, setFormImages] = useState<string[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");

  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      setCategories(cats || []);

      // Fetch products
      const { data: prods, error: pErr } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (pErr) throw pErr;

      // Join category name
      const categoryMap = new Map((cats || []).map((c) => [c.id, c]));
      const enriched = (prods || []).map((p) => ({
        ...p,
        category: p.category_id ? categoryMap.get(p.category_id) : undefined,
      }));

      setProducts(enriched);
    } catch (err: any) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormTitle("");
    setFormDescription("");
    setFormCategoryId(categories[0]?.id || "");
    setFormPrice("");
    setFormDiscountPrice("");
    setFormFabric("Chanderi Silk");
    setFormSizes(["M", "L", "XL"]);
    setFormStock(15);
    setFormIsFeatured(false);
    setFormImages([]);
    setManualImageUrl("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormDescription(p.description || "");
    setFormCategoryId(p.category_id || "");
    setFormPrice(p.price);
    setFormDiscountPrice(p.discount_price ?? "");
    setFormFabric(p.fabric || "");
    setFormSizes(Array.isArray(p.sizes) ? p.sizes : ["M", "L", "XL"]);
    setFormStock(p.stock_quantity);
    setFormIsFeatured(p.is_featured);
    setFormImages(Array.isArray(p.images) ? p.images : []);
    setManualImageUrl("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleSize = (size: string) => {
    if (formSizes.includes(size)) {
      setFormSizes(formSizes.filter((s) => s !== size));
    } else {
      setFormSizes([...formSizes, size]);
    }
  };

  // Multiple image upload directly to Supabase Storage bucket `zuriq-media`
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setFormError(null);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const path = `products/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from("zuriq-media")
          .upload(path, file, {
            contentType: file.type,
            upsert: true,
          });

        if (uploadErr) {
          console.error("Upload error for file:", file.name, uploadErr);
          continue;
        }

        const { data: pubData } = supabase.storage
          .from("zuriq-media")
          .getPublicUrl(path);

        if (pubData?.publicUrl) {
          newUrls.push(pubData.publicUrl);
        }
      }

      setFormImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      console.error("Image upload exception:", err);
      setFormError("Failed to upload some images: " + (err.message || "Unknown error"));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAddManualImage = () => {
    if (manualImageUrl.trim()) {
      setFormImages([...formImages, manualImageUrl.trim()]);
      setManualImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    const target = formImages[index];
    const rest = formImages.filter((_, i) => i !== index);
    setFormImages([target, ...rest]);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Product title is required.");
      return;
    }
    if (formPrice === "" || Number(formPrice) <= 0) {
      setFormError("Valid regular price is required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const selectedCatObj = categories.find((c) => c.id === formCategoryId);

    const productPayload = {
      title: formTitle.trim(),
      description: formDescription.trim() || null,
      category_id: formCategoryId || null,
      category_name: selectedCatObj?.name || "Fusion Apparel",
      price: Number(formPrice),
      discount_price: formDiscountPrice !== "" ? Number(formDiscountPrice) : null,
      fabric: formFabric.trim() || null,
      sizes: formSizes,
      stock_quantity: formStock !== "" ? Number(formStock) : 0,
      is_featured: formIsFeatured,
      images: formImages,
    };

    try {
      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", editingProduct.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from("products").insert(productPayload);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchProductsAndCategories();
    } catch (err: any) {
      console.error("Failed to save product:", err);
      setFormError(err.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you wish to delete "${title}"?`)) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Failed to delete product: " + (err.message || "Unknown error"));
    }
  };

  const handleToggleFeatured = async (p: Product) => {
    const nextState = !p.is_featured;
    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, is_featured: nextState } : item))
    );

    try {
      await supabase
        .from("products")
        .update({ is_featured: nextState })
        .eq("id", p.id);
    } catch (e) {
      console.error("Failed to toggle featured", e);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fabric?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === "all" || p.category_id === selectedCategoryFilter;

    let matchesStock = true;
    if (stockFilter === "in_stock") matchesStock = p.stock_quantity > 5;
    if (stockFilter === "low_stock") matchesStock = p.stock_quantity > 0 && p.stock_quantity <= 5;
    if (stockFilter === "out_of_stock") matchesStock = p.stock_quantity === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622]">
            Product Catalog & Pricing
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Manage fusion apparel designs, size selections, and direct image uploads
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] hover:to-[#C69F2A] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="luxury-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by apparel title, fabric..."
            className="w-full bg-transparent outline-none text-stone-800 placeholder:text-stone-400 font-sans"
          />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none cursor-pointer focus:border-[#D4AF37]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 outline-none cursor-pointer focus:border-[#D4AF37]"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt; 5)</option>
            <option value="low_stock">Low Stock (1 - 5)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading apparel catalog from Supabase...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="font-cormorant text-lg font-bold text-stone-700">
              No products found
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              No products match your current search or filters. Click "Add New Product" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#D4AF37]/20 uppercase tracking-wider text-[10px] font-sans">
                <tr>
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Pricing</th>
                  <th className="py-3 px-6">Fabric & Sizes</th>
                  <th className="py-3 px-6">Stock</th>
                  <th className="py-3 px-6">Featured</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredProducts.map((p) => {
                  const primaryImage =
                    Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;

                  const hasDiscount =
                    p.discount_price && Number(p.discount_price) < Number(p.price);

                  const discountPercent = hasDiscount
                    ? Math.round(
                        ((Number(p.price) - Number(p.discount_price)) / Number(p.price)) * 100
                      )
                    : 0;

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* Thumbnail & Title */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-lg bg-stone-100 border border-[#D4AF37]/30 overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-stone-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-stone-900 text-sm font-cormorant max-w-xs leading-snug">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                              ID: {p.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-6">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0A3622]/5 text-[#0A3622] border border-[#0A3622]/15">
                          {p.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-6">
                        {hasDiscount ? (
                          <div>
                            <div className="font-bold text-[#0A3622] text-sm">
                              ₹{Number(p.discount_price).toLocaleString("en-IN")}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="line-through text-stone-400">
                                ₹{Number(p.price).toLocaleString("en-IN")}
                              </span>
                              <span className="text-emerald-700 font-semibold">
                                {discountPercent}% OFF
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="font-bold text-[#0A3622] text-sm">
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      {/* Fabric & Sizes */}
                      <td className="py-3.5 px-6">
                        <div className="font-medium text-stone-700">{p.fabric || "—"}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(p.sizes) &&
                            p.sizes.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.2 bg-stone-100 border border-stone-200 rounded text-[9px] font-mono text-stone-600 font-semibold"
                              >
                                {s}
                              </span>
                            ))}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                            p.stock_quantity === 0
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : p.stock_quantity <= 5
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.stock_quantity === 0
                                ? "bg-rose-600"
                                : p.stock_quantity <= 5
                                ? "bg-amber-600"
                                : "bg-emerald-600"
                            }`}
                          />
                          {p.stock_quantity} in stock
                        </span>
                      </td>

                      {/* Featured toggle */}
                      <td className="py-3.5 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            p.is_featured
                              ? "bg-amber-50 border-[#D4AF37] text-[#D4AF37]"
                              : "border-stone-200 text-stone-300 hover:text-stone-400"
                          }`}
                          title={p.is_featured ? "Featured on Home" : "Mark as Featured"}
                        >
                          <Star
                            className={`w-4 h-4 ${p.is_featured ? "fill-[#D4AF37]" : ""}`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-stone-600 hover:text-[#0A3622] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-[#0A3622] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div>
                <h3 className="font-cormorant text-xl font-bold tracking-wide">
                  {editingProduct ? "Edit Product" : "Add Luxury Apparel Product"}
                </h3>
                <p className="text-[11px] text-[#D4AF37] font-sans">
                  ZURIQ FASHION Inventory & Media System
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs font-sans">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Royal Emerald Handcrafted Anarkali Suit"
                  required
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-medium text-stone-800 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Artisanal detailing, embroidery, styling recommendations, wash care..."
                  rows={3}
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2 outline-none text-stone-800"
                />
              </div>

              {/* Category & Fabric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Category *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none bg-white text-stone-800 cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Fabric Specification
                  </label>
                  <input
                    type="text"
                    value={formFabric}
                    onChange={(e) => setFormFabric(e.target.value)}
                    placeholder="e.g. Pure Chanderi Silk, Georgette"
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none text-stone-800"
                  />
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Regular Price (₹) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formPrice}
                    onChange={(e) =>
                      setFormPrice(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="4999"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-semibold text-stone-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Discount Price (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formDiscountPrice}
                    onChange={(e) =>
                      setFormDiscountPrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="3999"
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-semibold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formStock}
                    onChange={(e) =>
                      setFormStock(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    placeholder="15"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none text-stone-800"
                  />
                </div>
              </div>

              {/* Sizes Checkboxes */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1.5 uppercase tracking-wider text-[10px]">
                  Available Sizes
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((size) => {
                    const isSelected = formSizes.includes(size);
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#0A3622] text-[#D4AF37] border-[#0A3622]"
                            : "bg-white text-stone-600 border-stone-300 hover:border-[#D4AF37]"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multiple Image Upload to zuriq-media bucket */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Product Images (Storage Bucket: zuriq-media)
                </label>

                {/* Upload box */}
                <div className="space-y-3">
                  <label className="cursor-pointer border-2 border-dashed border-[#D4AF37]/60 hover:border-[#D4AF37] bg-amber-50/20 hover:bg-amber-50/40 rounded-xl p-4 flex flex-col items-center justify-center transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleImageUpload}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-[#D4AF37] mb-1" />
                    <span className="font-semibold text-xs text-[#0A3622]">
                      {uploadingImages ? "Uploading to zuriq-media..." : "Choose Multiple Images"}
                    </span>
                    <span className="text-[10px] text-stone-400 mt-0.5">
                      Upload directly to Supabase Storage zuriq-media bucket
                    </span>
                  </label>

                  {/* Manual URL input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      placeholder="Or paste direct image URL (https://...)"
                      className="flex-1 border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-1.5 outline-none text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualImage}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl text-[11px] font-semibold text-stone-700"
                    >
                      Add URL
                    </button>
                  </div>

                  {/* Image Previews */}
                  {formImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                      {formImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-[3/4] rounded-lg border border-[#D4AF37]/40 overflow-hidden group shadow-sm bg-stone-100"
                        >
                          <img
                            src={img}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-[#0A3622] text-[#D4AF37] text-[8px] font-bold px-1 rounded uppercase">
                              Cover
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="text-[9px] bg-[#D4AF37] text-[#0A3622] px-1.5 py-0.5 rounded font-bold"
                              >
                                Make Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-[9px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Featured toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="font-semibold text-stone-800 text-xs">Featured Apparel</div>
                  <div className="text-[10px] text-stone-500">
                    Showcase this item on the homepage spotlight
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={formIsFeatured}
                  onChange={(e) => setFormIsFeatured(e.target.checked)}
                  className="w-4 h-4 accent-[#0A3622] rounded cursor-pointer"
                />
              </div>

              {/* Action buttons */}
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
                  disabled={saving || uploadingImages}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
