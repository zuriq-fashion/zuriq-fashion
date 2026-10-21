"use client";

import React, { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/admin";
import { useCart } from "@/lib/cartContext";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Check,
  Star,
  Truck,
  Shield,
  RefreshCcw,
  Minus,
  Plus,
  Share2,
  ChevronRight,
  Layers,
} from "lucide-react";

function ProductDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const resolvedParams = use(paramsPromise);
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Size & Quantity selection
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [quantity, setQuantity] = useState(1);

  // Action feedback
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", resolvedParams.id)
          .maybeSingle();

        if (error || !data) {
          console.error("Product not found:", error);
          setProduct(null);
        } else {
          setProduct(data);
          // Set initial size
          if (Array.isArray(data.sizes) && data.sizes.length > 0) {
            setSelectedSize(data.sizes[0]);
          }

          // Fetch related products from same category
          if (data.category_id) {
            const { data: rel } = await supabase
              .from("products")
              .select("*")
              .eq("category_id", data.category_id)
              .neq("id", data.id)
              .limit(4);
            setRelatedProducts(rel || []);
          }
        }
      } catch (e) {
        console.error("Error fetching product:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col">
        <StoreHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-cormorant text-xl text-[#0A3622] tracking-wider">
            Loading Couture Ensemble...
          </p>
        </main>
        <StoreFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col">
        <StoreHeader />
        <main className="flex-1 max-w-lg mx-auto py-24 px-4 text-center space-y-4">
          <Layers className="w-12 h-12 text-stone-300 mx-auto" />
          <h2 className="font-cormorant text-3xl font-bold text-[#0A3622]">
            Product Not Found
          </h2>
          <p className="text-xs text-stone-500 font-sans">
            The requested fusion couture apparel piece could not be located or may have been retired from the collection.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0A3622] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider"
          >
            <span>Return to Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
        <StoreFooter />
      </div>
    );
  }

  const imagesList =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
        ];

  const hasDiscount =
    product.discount_price && Number(product.discount_price) < Number(product.price);

  const discountPercent = hasDiscount
    ? Math.round(
        ((Number(product.price) - Number(product.discount_price)) /
          Number(product.price)) *
          100
      )
    : 0;

  const effectivePrice = hasDiscount ? product.discount_price : product.price;
  const savings = hasDiscount ? Number(product.price) - Number(product.discount_price) : 0;

  const handleAddToBag = () => {
    addToCart(product, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans">
      <StoreHeader />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-[#D4AF37]/20 py-2.5 px-4 sm:px-8 text-xs font-sans">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-stone-500">
          <Link href="/" className="hover:text-[#0A3622] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-700">{product.category_name || "Catalog"}</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#0A3622] font-semibold truncate max-w-xs sm:max-w-md">
            {product.title}
          </span>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left: Gallery Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails list */}
            {imagesList.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] shrink-0">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-md"
                        : "border-stone-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Image */}
            <div className="flex-1 aspect-[3/4] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border border-[#D4AF37]/35 shadow-xl relative group">
              <img
                src={imagesList[selectedImageIndex] || imagesList[0]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_featured && (
                  <span className="bg-[#0A3622] text-[#D4AF37] border border-[#D4AF37]/50 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
                    ★ Royal Spotlight
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-[#D4AF37] text-[#0A3622] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
                    Save {discountPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Product Purchase Details Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#8C6D1F]">
                <span>{product.category_name || "Fusion Apparel"}</span>
                <span>&bull;</span>
                <span className="text-emerald-800 font-semibold">In Stock</span>
              </div>

              <h1 className="font-cormorant text-3xl sm:text-4xl font-bold text-[#0A3622] mt-1.5 leading-tight">
                {product.title}
              </h1>

              {/* Price & Discount Bar */}
              <div className="mt-4 p-4 rounded-xl bg-amber-50/50 border border-[#D4AF37]/30 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-cormorant text-3xl font-bold text-[#0A3622]">
                      ₹{Number(effectivePrice).toLocaleString("en-IN")}
                    </span>
                    {hasDiscount && (
                      <span className="line-through text-stone-400 text-base">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  {savings > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-800 block mt-0.5">
                      You save ₹{savings.toLocaleString("en-IN")} ({discountPercent}% off inclusive of taxes)
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
                    Stock Status
                  </span>
                  <span className="text-xs font-bold text-[#0A3622]">
                    {product.stock_quantity > 0
                      ? `${product.stock_quantity} Pieces Ready`
                      : "Made to Order"}
                  </span>
                </div>
              </div>
            </div>

            {/* Fabric Specification */}
            {product.fabric && (
              <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs flex items-center justify-between">
                <span className="font-semibold text-stone-600">Fabric Composition:</span>
                <span className="font-bold text-[#0A3622]">{product.fabric}</span>
              </div>
            )}

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-800 uppercase tracking-wider text-[11px]">
                  Select Couture Size
                </span>
                <span className="text-[#8C6D1F] hover:underline cursor-pointer text-[11px]">
                  Size Guide & Measurements
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {(Array.isArray(product.sizes) && product.sizes.length > 0
                  ? product.sizes
                  : ["S", "M", "L", "XL", "XXL"]
                ).map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-12 h-11 px-3.5 rounded-xl font-mono text-sm font-bold border transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "bg-[#0A3622] text-[#D4AF37] border-[#0A3622] shadow-md shadow-[#0A3622]/20 scale-105"
                          : "bg-white text-stone-700 border-stone-300 hover:border-[#D4AF37]"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5">
              <label className="block text-stone-800 text-[11px] font-semibold uppercase tracking-wider">
                Quantity
              </label>
              <div className="inline-flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-2 font-semibold text-xs text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleAddToBag}
                className={`w-full py-3.5 rounded-xl font-semibold text-xs uppercase tracking-[0.18em] shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  addedSuccess
                    ? "bg-emerald-700 text-white"
                    : "bg-[#0A3622] hover:bg-[#0E472D] text-[#D4AF37] border border-[#D4AF37]/50 shadow-[#0A3622]/20"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added To Bag &bull; View Bag &rarr;</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add To Shopping Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs uppercase tracking-[0.18em] shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Express Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Description & Styling Story */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <h3 className="font-cormorant text-xl font-bold text-[#0A3622]">
                Artisanal Detailing & Craft
              </h3>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                {product.description ||
                  "Handcrafted with exquisite attention to silhouette and texture. Each garment represents generations of Indian handwork heritage re-imagined for the modern cosmopolitan woman."}
              </p>
            </div>

            {/* 3 Trust Signals */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-200 text-center">
              <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                <Truck className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
                <span className="text-[10px] font-semibold text-stone-800 block">
                  Express Delivery
                </span>
                <span className="text-[9px] text-stone-500">Pan-India Courier</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                <Shield className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
                <span className="text-[10px] font-semibold text-stone-800 block">
                  100% Authentic
                </span>
                <span className="text-[9px] text-stone-500">Pure Indian Silks</span>
              </div>

              <div className="p-2.5 bg-white rounded-xl border border-stone-200">
                <RefreshCcw className="w-4 h-4 text-[#D4AF37] mx-auto mb-1" />
                <span className="text-[10px] font-semibold text-stone-800 block">
                  Easy Exchange
                </span>
                <span className="text-[9px] text-stone-500">7-Day Size Swap</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Recommendation */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#D4AF37]/30">
            <div className="text-center mb-8">
              <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#8C6D1F]">
                Complementary Pieces
              </span>
              <h3 className="font-cormorant text-3xl font-bold text-[#0A3622] mt-1">
                You May Also Admire
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  className="luxury-card overflow-hidden group block hover:border-[#D4AF37] transition-all"
                >
                  <div className="aspect-[3/4] bg-stone-100 overflow-hidden relative">
                    <img
                      src={
                        Array.isArray(rel.images) && rel.images[0]
                          ? rel.images[0]
                          : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5 space-y-1">
                    <h4 className="font-cormorant font-bold text-sm text-stone-900 line-clamp-1 group-hover:text-[#0A3622]">
                      {rel.title}
                    </h4>
                    <div className="font-cormorant text-base font-bold text-[#0A3622]">
                      ₹{(rel.discount_price || rel.price).toLocaleString("en-IN")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-cormorant text-xl text-[#0A3622]">
            Loading Couture Ensemble...
          </p>
        </div>
      }
    >
      <ProductDetailContent paramsPromise={params} />
    </Suspense>
  );
}
