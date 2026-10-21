"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/types/admin";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  Upload,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick helper to generate slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCategories(data || []);

      // Fetch count of products per category
      const { data: prods } = await supabase.from("products").select("category_id");
      const counts: Record<string, number> = {};
      prods?.forEach((p) => {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      });
      setProductCounts(counts);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormImageUrl("");
    setFormIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormImageUrl(cat.image_url || "");
    setFormIsActive(cat.is_active);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(generateSlug(val));
    }
  };

  // Upload category image to zuriq-media bucket
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `categories/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("zuriq-media")
        .upload(path, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadErr) throw uploadErr;

      const { data: pubData } = supabase.storage.from("zuriq-media").getPublicUrl(path);
      setFormImageUrl(pubData.publicUrl);
    } catch (err: any) {
      console.error("Storage upload error:", err);
      setFormError("Image upload failed: " + (err.message || "Unknown error"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Category name is required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    const slug = formSlug.trim() || generateSlug(formName);

    try {
      if (editingCategory) {
        // Update
        const { error } = await supabase
          .from("categories")
          .update({
            name: formName.trim(),
            slug,
            image_url: formImageUrl.trim() || null,
            is_active: formIsActive,
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from("categories").insert({
          name: formName.trim(),
          slug,
          image_url: formImageUrl.trim() || null,
          is_active: formIsActive,
        });

        if (error) throw error;
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      console.error("Failed to save category:", err);
      setFormError(err.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat: Category) => {
    try {
      const nextStatus = !cat.is_active;
      // Optimistic update
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, is_active: nextStatus } : c))
      );

      const { error } = await supabase
        .from("categories")
        .update({ is_active: nextStatus })
        .eq("id", cat.id);

      if (error) {
        // Revert
        await fetchCategories();
        throw error;
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const count = productCounts[id] || 0;
    const msg =
      count > 0
        ? `Warning: Category "${name}" currently has ${count} product(s) linked to it. Are you sure you wish to delete it?`
        : `Are you sure you want to permanently delete category "${name}"?`;

    if (!confirm(msg)) return;

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert("Failed to delete category: " + (err.message || "Unknown error"));
    }
  };

  // Preset categories shortcut
  const handleSeedPresets = async () => {
    const presets = [
      { name: "Kurti 1 Pc", slug: "kurti-1-pc" },
      { name: "Kurti 2 Pcs", slug: "kurti-2-pcs" },
      { name: "Kurti 3 Pcs", slug: "kurti-3-pcs" },
      { name: "Lehenga", slug: "lehenga" },
      { name: "Anarkali Suits", slug: "anarkali-suits" },
      { name: "Fusion Co-ord Sets", slug: "fusion-co-ord-sets" },
    ];

    try {
      for (const p of presets) {
        const exists = categories.some((c) => c.slug === p.slug);
        if (!exists) {
          await supabase.from("categories").insert({
            name: p.name,
            slug: p.slug,
            is_active: true,
          });
        }
      }
      await fetchCategories();
    } catch (err) {
      console.error("Failed to seed presets:", err);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cormorant text-2xl sm:text-3xl font-bold text-[#0A3622]">
            Category Management
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Organize ZURIQ FASHION's fusion apparel categories with automatic slug generation
          </p>
        </div>

        <div className="flex items-center gap-3">
          {categories.length < 3 && (
            <button
              onClick={handleSeedPresets}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#D4AF37]/50 text-[#0A3622] hover:bg-amber-50/40 text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Add Kurti & Lehenga Presets</span>
            </button>
          )}

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] hover:to-[#C69F2A] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="luxury-card p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories by name or slug..."
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

      {/* Categories Table Card */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-400">
            <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading categories from Supabase...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h4 className="font-cormorant text-lg font-bold text-stone-700">
              No categories found
            </h4>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              Create your first category or click "Add Kurti & Lehenga Presets" to get started instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-stone-500 border-b border-[#D4AF37]/20 uppercase tracking-wider text-[10px] font-sans">
                <tr>
                  <th className="py-3 px-6">Thumbnail</th>
                  <th className="py-3 px-6">Category Name</th>
                  <th className="py-3 px-6">Slug</th>
                  <th className="py-3 px-6">Products</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredCategories.map((cat) => {
                  const count = productCounts[cat.id] || 0;

                  return (
                    <tr key={cat.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* Image */}
                      <td className="py-3.5 px-6">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 border border-[#D4AF37]/30 overflow-hidden flex items-center justify-center">
                          {cat.image_url ? (
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Layers className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-stone-900 text-sm font-cormorant tracking-wide">
                          {cat.name}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          ID: {cat.id.slice(0, 8)}...
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3.5 px-6">
                        <span className="font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-[11px] border border-stone-200">
                          /{cat.slug}
                        </span>
                      </td>

                      {/* Products Count */}
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-[#0A3622] bg-[#0A3622]/5 px-2.5 py-1 rounded-full border border-[#0A3622]/15">
                          {count} {count === 1 ? "Item" : "Items"}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            cat.is_active ? "bg-[#0A3622]" : "bg-stone-300"
                          }`}
                          aria-label={`Toggle active state for ${cat.name}`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              cat.is_active ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 text-stone-600 hover:text-[#0A3622] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#D4AF37]/40 shadow-2xl max-w-md w-full overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-[#0A3622] text-[#FAF8F5] p-5 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div>
                <h3 className="font-cormorant text-xl font-bold tracking-wide">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <p className="text-[11px] text-[#D4AF37] font-sans">
                  ZURIQ FASHION Catalog Taxonomy
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs font-sans">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Kurti 3 Pcs, Lehenga, Anarkali"
                  required
                  className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3.5 py-2.5 outline-none font-medium text-stone-800 transition-all focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  URL Slug (Auto-generated) *
                </label>
                <div className="flex items-center">
                  <span className="bg-stone-100 border border-r-0 border-stone-300 px-3 py-2.5 rounded-l-xl text-stone-500 font-mono text-[11px]">
                    /
                  </span>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="kurti-3-pcs"
                    required
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-r-xl px-3 py-2.5 outline-none font-mono text-[11px] text-stone-800 transition-all"
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block text-stone-700 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                  Category Banner / Thumbnail
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer border border-dashed border-[#D4AF37]/60 hover:border-[#D4AF37] bg-amber-50/20 hover:bg-amber-50/40 rounded-xl p-3 text-center transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-stone-600">
                        <Upload className="w-4 h-4 text-[#D4AF37]" />
                        <span className="font-medium text-[11px]">
                          {uploadingImage ? "Uploading to zuriq-media..." : "Upload from Device"}
                        </span>
                      </div>
                    </label>
                  </div>

                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="Or enter image URL (https://...)"
                    className="w-full border border-stone-300 focus:border-[#D4AF37] rounded-xl px-3 py-2 outline-none text-[11px] text-stone-800"
                  />

                  {formImageUrl && (
                    <div className="mt-2 w-full h-24 rounded-xl border border-[#D4AF37]/30 overflow-hidden relative group">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl("")}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-md text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <div className="font-semibold text-stone-800 text-xs">Active Status</div>
                  <div className="text-[10px] text-stone-500">
                    Visible to shoppers on store navigation
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#0A3622] rounded cursor-pointer"
                />
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
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs shadow-md shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
