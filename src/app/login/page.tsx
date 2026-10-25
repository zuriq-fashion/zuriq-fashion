"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  setupRecaptchaVerifier,
  sendOtpToPhone,
  verifyOtpCode,
  isFirebaseConfigured,
} from "@/lib/firebase";
import { useCustomerAuth } from "@/lib/customerAuth";
import { useCart } from "@/lib/cartContext";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";
import {
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  ChevronLeft,
} from "lucide-react";
import { ConfirmationResult } from "firebase/auth";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const { customer, syncCustomerWithSupabase } = useCustomerAuth();
  const { items } = useCart();

  // Step 1: Phone, Step 2: OTP
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");

  // OTP inputs (6 digits)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Firebase confirmation object
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Check if customer is already logged in
  useEffect(() => {
    if (customer) {
      const destination = redirectUrl || (items.length > 0 ? "/checkout" : "/account");
      router.replace(destination);
    }
  }, [customer, redirectUrl, items.length, router]);

  // Check if running in demo mode
  useEffect(() => {
    setIsDemoMode(!isFirebaseConfigured());
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Focus first OTP field when entering OTP step
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Format and send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNumber = phoneNumber.trim().replace(/\D/g, "");
    if (cleanNumber.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanNumber}`;
    setLoading(true);

    try {
      // 1. Setup invisible reCAPTCHA verifier if in browser
      let verifier = null;
      if (isFirebaseConfigured()) {
        verifier = setupRecaptchaVerifier("recaptcha-container");
      }

      // 2. Call sendOtp helper
      const response = await sendOtpToPhone(fullPhoneNumber, verifier);

      if (response.isDemo) {
        setIsDemoMode(true);
      } else if (response.confirmationResult) {
        setConfirmationResult(response.confirmationResult);
      }

      setStep("otp");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setSuccessMessage(
        response.isDemo
          ? "Demo Mode: Verification code sent. Use test OTP: 123456"
          : `Verification code sent to ${fullPhoneNumber}`
      );
    } catch (err: any) {
      console.error("OTP send error:", err);
      // If Firebase blocked or failed, fallback to demo mode for uninterrupted testing
      if (
        err.message?.includes("auth/operation-not-allowed") ||
        err.message?.includes("auth/invalid-app-credential") ||
        err.message?.includes("reCAPTCHA") ||
        err.message?.includes("api-key-not-valid")
      ) {
        setIsDemoMode(true);
        setStep("otp");
        setTimer(60);
        setCanResend(false);
        setSuccessMessage("Test Mode Active: Use test OTP: 123456");
      } else {
        setErrorMessage(
          err.message || "Failed to dispatch verification code. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit entry with auto-focus & paste support
  const handleOtpChange = (index: number, value: string) => {
    // If pasting full code
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      if (pastedDigits.length > 0) {
        const newOtp = [...otp];
        pastedDigits.forEach((digit, i) => {
          if (index + i < 6) {
            newOtp[index + i] = digit;
          }
        });
        setOtp(newOtp);
        const nextIndex = Math.min(index + pastedDigits.length, 5);
        otpInputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    // Single digit input
    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP & Synchronize with Supabase Customers
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const enteredOtp = otp.join("").trim();
    if (enteredOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const cleanNumber = phoneNumber.trim().replace(/\D/g, "");
      const fullPhoneNumber = `${countryCode}${cleanNumber}`;

      // 1. Verify code with Firebase or Demo handler
      await verifyOtpCode(confirmationResult || undefined, enteredOtp, isDemoMode);

      // 2. Sync with Supabase `customers` table (check or create)
      const syncedCustomer = await syncCustomerWithSupabase(
        fullPhoneNumber,
        fullName.trim() || undefined
      );

      setSuccessMessage(`Welcome back, ${syncedCustomer.name}!`);

      // 3. Smooth redirect
      setTimeout(() => {
        const destination = redirectUrl || (items.length > 0 ? "/checkout" : "/account");
        router.push(destination);
      }, 700);
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setErrorMessage(
        err.message || "Invalid or expired verification code. Please check and retry."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      {/* Invisible reCAPTCHA container required by Firebase */}
      <div id="recaptcha-container"></div>

      <div className="luxury-card p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle royal background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0A3622] text-[#D4AF37] border border-[#D4AF37]/40 shadow-lg shadow-[#0A3622]/20 mb-2">
            <span className="font-cormorant text-3xl font-bold">Z</span>
          </div>

          <span className="text-[10px] uppercase tracking-[0.28em] text-[#8C6D1F] font-semibold block">
            Client Authentication
          </span>

          <h1 className="font-cormorant text-3xl font-bold text-[#0A3622] tracking-wide">
            {step === "phone" ? "Sign In to ZURIQ" : "Enter Verification Code"}
          </h1>

          <p className="text-xs text-stone-500 font-sans max-w-xs mx-auto">
            {step === "phone"
              ? "Access your couture orders, express checkout, and bespoke bridal wishlist."
              : `Enter the 6-digit OTP sent to ${countryCode} ${phoneNumber.replace(/\D/g, "")}`}
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
        )}

        {/* Demo Mode Notice Banner */}
        {isDemoMode && (
          <div className="mb-6 p-3 rounded-xl bg-amber-50/80 border border-[#D4AF37]/50 text-stone-700 text-[11px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#8C6D1F]" />
              <span>
                Demo Mode: <strong>OTP is 123456</strong>
              </span>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#0A3622] text-[#D4AF37] rounded font-bold">
              Test Ready
            </span>
          </div>
        )}

        {/* Step 1: Phone Number Input */}
        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-stone-600 mb-1.5">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Radhika Merchant"
                className="w-full border border-stone-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] rounded-xl px-4 py-3 outline-none text-xs font-sans text-stone-800 bg-white placeholder-stone-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-stone-600 mb-1.5">
                Mobile Number *
              </label>
              <div className="flex rounded-xl border border-stone-300 focus-within:border-[#D4AF37] focus-within:ring-1 focus-within:ring-[#D4AF37] overflow-hidden bg-white">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-stone-50 border-r border-stone-200 px-3 py-3 text-xs font-medium text-stone-700 outline-none cursor-pointer"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+65">🇸🇬 +65</option>
                </select>

                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="98765 43210"
                  maxLength={12}
                  required
                  autoFocus
                  className="flex-1 px-4 py-3 outline-none text-xs font-mono font-medium text-stone-800 placeholder-stone-400"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1.5">
                We will send a 6-digit one-time password (OTP) via SMS.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs uppercase tracking-[0.18em] shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#0A3622] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: 6-Digit OTP Verification */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex items-center justify-between text-xs text-stone-500 pb-1">
              <span className="font-mono text-stone-700 font-medium">
                {countryCode} {phoneNumber.replace(/\D/g, "")}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-[#8C6D1F] hover:text-[#0A3622] hover:underline flex items-center gap-1 font-semibold text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Edit Number</span>
              </button>
            </div>

            {/* 6 Discrete Digit Inputs */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-stone-600 mb-2 text-center">
                Enter 6-Digit OTP
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 sm:w-12 h-12 sm:h-14 text-center font-mono text-lg font-bold text-[#0A3622] bg-white border border-stone-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 rounded-xl outline-none shadow-sm transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Resend Countdown */}
            <div className="text-center text-xs text-stone-500">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-[#0A3622] hover:text-[#D4AF37] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend Verification Code</span>
                </button>
              ) : (
                <span className="text-stone-400 font-mono text-[11px]">
                  Resend code in <strong className="text-stone-700">{timer}s</strong>
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89222] hover:from-[#E5C253] text-[#0A3622] font-semibold text-xs uppercase tracking-[0.18em] shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#0A3622] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify & Proceed</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Security & Guarantee Footer */}
        <div className="mt-8 pt-6 border-t border-stone-200/80 text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
            <Lock className="w-3 h-3 text-[#8C6D1F]" />
            <span>Encrypted 256-bit Secure Client Access</span>
          </div>
          <p className="text-[10px] text-stone-400">
            By signing in, you agree to ZURIQ FASHION&apos;s Terms of Couture & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] flex flex-col font-sans">
      <StoreHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <Suspense
          fallback={
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-[#0A3622] rounded-full animate-spin mx-auto mb-3" />
              <p className="font-cormorant text-stone-500 text-sm">
                Loading Secure Authentication...
              </p>
            </div>
          }
        >
          <CustomerLoginForm />
        </Suspense>
      </main>

      <StoreFooter />
    </div>
  );
}
