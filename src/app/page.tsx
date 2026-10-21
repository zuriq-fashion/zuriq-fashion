"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types/admin";
import { useCart } from "@/lib/cartContext";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Star,
  Search,
  Filter,
  Layers,
  Heart,
  ChevronDown,
  Check,
} from "lucide-react";

export default function StorefrontHomePage() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // Quick Add Size Picker feedback
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const { data: cats } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("name", { ascending: true });
        setCategories(cats || []);

        // Fetch products
        const { data: prods } = await supabase
          .from("products")
          .select("*")
          .order("is_featured", { ascending: false });
        setProducts(prods || []);
      } catch (e) {
        console.error("Failed to load storefront data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes[0] : "M";
    addToCart(p, defaultSize, 1);
    setQuickAddedId(p.id);
    setTimeout(() => setQuickAddedId(null), 1800);
  };

  // Filter & Sort
  const filteredProducts = products
    .filter((p) => {
      const matchesCat =
        selectedCategory === "all" ||
        p.category_id === selectedCategory ||
        p.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.fabric?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      const priceA = a.discount_price && a.discount_price > 0 ? a.discount_price : a.price;
      const priceB = b.discount_price && b.discount_price > 0 ? b.discount_price : b.price;

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-[#0A3622]">
      {/* 1. Header */}
      <StoreHeader />

      {/* 2. Editorial Hero Banner with Gold Lotus Motifs */}
      <section className="relative bg-[#0A3622] text-[#FAF8F5] py-20 sm:py-32 px-4 sm:px-8 overflow-hidden border-b border-[#D4AF37]/35">
        {/* Luxury Background Glow & Radial Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0E472D] rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#D4AF37]/50 text-xs text-[#D4AF37] uppercase tracking-[0.24em] font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Royal Festive Couture 2026</span>
            </div>

            <h1 className="font-cormorant text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF8F5] leading-[1.08]">
              Grace Meets <br />
              <span className="italic font-normal text-gold-gradient">
                Modern Fusion
              </span>
            </h1>

            <p className="text-stone-300 text-sm sm:text-base font-light max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Discover ZURIQ FASHION's handcrafted silhouettes — from sculpted Banarasi kurti sets to kalidar heritage lehengas. Tailored in pure Chanderi silk and delicate zardozi embroidery.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#collection"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] hover:to-[#C69F2A] text-[#0A3622] font-semibold text-xs uppercase tracking-[0.16em] shadow-xl shadow-[#D4AF37]/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#categories"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 border border-[#D4AF37]/40 font-semibold text-xs uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Explore Silhouettes</span>
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 border-t border-[#D4AF37]/25 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>Pure Chanderi & Banarasi Silks</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>Insured Pan-India Express Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                <span>UPI, Cards & COD Available</span>
              </div>
            </div>
          </div>

          {/* Right Visual Image Card with Gold Border Details */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-72 sm:w-84 aspect-[3/4] rounded-2xl p-2 bg-gradient-to-b from-[#D4AF37] via-[#8C6D1F] to-[#0A3622] shadow-2xl shadow-black/60">
              <div className="w-full h-full rounded-xl overflow-hidden relative group">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
                  alt="Zuriq Luxury Fusion Apparel"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#D4AF37]">
                    Handcrafted Heritage
                  </span>
                  <p className="font-cormorant text-xl font-bold text-white leading-tight">
                    Noor Emerald Anarkali Suit (3 Pcs)
                  </p>
                  <p className="text-xs text-stone-300 mt-0.5">
                    Starting from ₹4,799
                  </p>
                </div>
              </div>

              {/* Floating Lotus/Insignia Badge */}
              <div className="absolute -bottom-4 -left-4 bg-[#0A3622] border border-[#D4AF37] text-[#D4AF37] px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Autumn Edition 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Showcase Grid */}
      <section id="categories" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D1F] font-sans">
            Curated Silhouettes
          </span>
          <h2 className="font-cormorant text-3xl sm:text-5xl font-bold text-[#0A3622] mt-1">
            Shop By Fusion Category
          </h2>
          <div className="w-16 h-[1.5px] bg-[#D4AF37] mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                const el = document.getElementById("collection");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group text-left block luxury-card overflow-hidden hover:border-[#D4AF37] hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="aspect-[4/5] bg-stone-100 overflow-hidden relative">
                <img
                  src={
                    cat.image_url ||
                    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#D4AF37]">
                    Explore
                  </span>
                  <h3 className="font-cormorant text-xl sm:text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Featured Collection Product Grid with Tabs, Search, & Sorting */}
      <section id="collection" className="py-16 bg-[#F4EFE6]/60 border-t border-[#D4AF37]/20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D1F] font-sans">
                Signature Catalog
              </span>
              <h2 className="font-cormorant text-3xl sm:text-5xl font-bold text-[#0A3622] mt-1">
                The Heritage Collection
              </h2>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search silk, lehenga..."
                  className="bg-white border border-[#D4AF37]/35 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-[#D4AF37] text-stone-800 placeholder:text-stone-400 font-sans shadow-xs"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-white border border-[#D4AF37]/35 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37] text-stone-800 font-sans shadow-xs cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider font-sans transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-[#0A3622] text-[#D4AF37] shadow-md shadow-[#0A3622]/20 border border-[#0A3622]"
                  : "bg-white text-stone-700 border border-stone-200 hover:border-[#D4AF37]"
              }`}
            >
              All Designs ({products.length})
            </button>

            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider font-sans transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === c.id
                    ? "bg-[#0A3622] text-[#D4AF37] shadow-md shadow-[#0A3622]/20 border border-[#0A3622]"
                    : "bg-white text-stone-700 border border-stone-200 hover:border-[#D4AF37]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="py-24 text-center">
              <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest text-[#0A3622]">
                Unveiling Luxury Catalog...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-[#D4AF37]/30 p-8">
              <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-cormorant text-2xl font-bold text-stone-700">
                No matching apparel found
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Try clearing your search query or selecting another category filter.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-4 px-4 py-2 bg-[#0A3622] text-[#D4AF37] text-xs font-semibold rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => {
                const primaryImg =
                  Array.isArray(p.images) && p.images.length > 0
                    ? p.images[0]
                    : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";

                const secondaryImg =
                  Array.isArray(p.images) && p.images.length > 1
                    ? p.images[1]
                    : primaryImg;

                const hasDiscount =
                  p.discount_price && Number(p.discount_price) < Number(p.price);

                const discountPercent = hasDiscount
                  ? Math.round(
                      ((Number(p.price) - Number(p.discount_price)) / Number(p.price)) * 100
                    )
                  : 0;

                const effectivePrice = hasDiscount ? p.discount_price : p.price;

                const isQuickAdded = quickAddedId === p.id;

                return (
                  <div
                    key={p.id}
                    className="group luxury-card overflow-hidden flex flex-col justify-between hover:border-[#D4AF37] hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Image Box */}
                    <Link
                      href={`/product/${p.id}`}
                      className="block aspect-[3/4] bg-stone-100 overflow-hidden relative"
                    >
                      <img
                        src={primaryImg}
                        alt={p.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Featured Pill & Discount Badge */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {p.is_featured && (
                          <span className="bg-[#0A3622]/90 backdrop-blur-xs text-[#D4AF37] border border-[#D4AF37]/50 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                            ★ Featured
                          </span>
                        )}
                        {hasDiscount && (
                          <span className="bg-[#D4AF37] text-[#0A3622] font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Fabric tag */}
                      {p.fabric && (
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-medium px-2 py-0.5 rounded-md border border-stone-200">
                          {p.fabric}
                        </div>
                      )}
                    </Link>

                    {/* Details Box */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C6D1F]">
                          {p.category_name || "Fusion Apparel"}
                        </div>
                        <Link
                          href={`/product/${p.id}`}
                          className="font-cormorant text-lg font-bold text-[#1A1A1A] hover:text-[#0A3622] transition-colors line-clamp-1 mt-0.5"
                        >
                          {p.title}
                        </Link>
                      </div>

                      {/* Sizes Preview */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-stone-400 font-sans">Sizes:</span>
                        {Array.isArray(p.sizes) &&
                          p.sizes.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200"
                            >
                              {s}
                            </span>
                          ))}
                        {Array.isArray(p.sizes) && p.sizes.length > 4 && (
                          <span className="text-[9px] text-stone-400">+more</span>
                        )}
                      </div>

                      {/* Pricing & Add to Cart Button */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="font-cormorant text-xl font-bold text-[#0A3622] leading-tight">
                            ₹{Number(effectivePrice).toLocaleString("en-IN")}
                          </div>
                          {hasDiscount && (
                            <div className="text-[11px] line-through text-stone-400 leading-tight">
                              ₹{Number(p.price).toLocaleString("en-IN")}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(p, e)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isQuickAdded
                              ? "bg-emerald-700 text-white"
                              : "bg-[#0A3622] hover:bg-[#0E472D] text-[#D4AF37]"
                          }`}
                        >
                          {isQuickAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 5. Footer */}
      <StoreFooter />
    </div>
  );
}
