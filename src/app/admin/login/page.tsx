"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/adminAuth";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("admin@zuriqfashion.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/admin");
      } else {
        setError(result.error || "Authentication failed.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@zuriqfashion.com");
    setPassword("admin123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A3622] text-[#FAF8F5] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background luxury glow accents */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] p-[2px] shadow-2xl shadow-black/50 mb-4">
            <div className="w-full h-full bg-[#0A3622] rounded-[14px] flex items-center justify-center">
              <span className="font-cormorant text-3xl font-bold text-[#D4AF37]">Z</span>
            </div>
          </div>
          <h1 className="font-cormorant text-3xl sm:text-4xl font-bold tracking-[0.16em] uppercase text-[#FAF8F5]">
            ZURIQ FASHION
          </h1>
          <p className="font-cormorant italic text-sm text-[#D4AF37] tracking-wider mt-1">
            Elegant & Modern Fusion Apparel
          </p>
          <div className="inline-block mt-3 px-3 py-1 rounded-full bg-white/5 border border-[#D4AF37]/30 text-[11px] font-sans tracking-[0.2em] uppercase text-stone-300">
            Administrative Portal
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0D452B]/80 backdrop-blur-xl border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#D4AF37]/20">
            <div>
              <h2 className="text-lg font-semibold text-white">Sign In</h2>
              <p className="text-xs text-stone-300 mt-0.5">
                Role-based access for store managers & admins
              </p>
            </div>
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-3 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 uppercase tracking-wider font-sans">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@zuriqfashion.com"
                  className="w-full bg-[#062316] border border-[#D4AF37]/30 focus:border-[#D4AF37] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all placeholder:text-stone-500 focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-stone-300 uppercase tracking-wider font-sans">
                  Password
                </label>
                <span className="text-[11px] text-stone-400">Default: admin123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#062316] border border-[#D4AF37]/30 focus:border-[#D4AF37] text-white text-sm rounded-xl pl-10 pr-10 py-2.5 outline-none transition-all placeholder:text-stone-500 focus:ring-1 focus:ring-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#D4AF37] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] hover:to-[#C69F2A] text-[#0A3622] font-semibold text-sm shadow-lg shadow-[#D4AF37]/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#0A3622] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Enter Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper Pill */}
          <div className="mt-6 pt-5 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs">
            <span className="text-stone-400">Default Credentials:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[#D4AF37] hover:underline font-mono text-[11px] bg-white/5 px-2.5 py-1 rounded-md border border-[#D4AF37]/30 transition-colors"
            >
              admin@zuriqfashion.com / admin123
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-stone-400 mt-6 tracking-wide">
          Protected by Supabase RBAC Security &bull; ZURIQ FASHION &copy; 2026
        </p>
      </div>
    </div>
  );
}
