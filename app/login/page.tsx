/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chrome, Mail, ShieldCheck, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import TelegramLogin from "@/components/TelegramLogin";
import WorldButton from "@/components/WorldButton";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [router, status]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError("Please complete the verification check.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(),
          turnstileToken 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send code.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("otp", {
      email: email.toLowerCase().trim(),
      code: otp.trim(), 
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid or expired code.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="relative min-h-screen bg-(--bg) text-(--text) overflow-hidden flex items-center justify-center">
      {/* Dreamy ethereal background atmosphere */}
      <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-20 filter blur-[4px] scale-105" />
      <div className="absolute inset-0 bg-gradient-to-tr from-(--bg) via-(--bg)/70 to-transparent" />
      
      {/* Soft floating light gradient pools */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-(--accent)/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

      {/* Main Glassmorphism Portal Card */}
      <section className="relative z-10 w-full max-w-lg px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2.5rem] p-8 sm:p-12 bg-(--surface-1)/40 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          {/* Subtle top ethereal light rim */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-(--accent)/60 to-transparent" />

          {/* Clean minimal typography header */}
          <div className="mb-10 text-center flex flex-col items-center">
            <h1 className="text-3xl font-black tracking-tight uppercase">
              Astro<span className="text-(--accent)">spectrum</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-(--text-muted) mt-2">
              Sign in to your account
            </p>
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 rounded-2xl bg-(--accent)/10 border border-(--accent)/20 p-3.5 text-center text-xs text-(--accent) tracking-wider font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Step Handling */}
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form 
                key="email-step" 
                initial={{ opacity: 0, x: -15 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 15 }} 
                transition={{ duration: 0.3 }}
                onSubmit={handleRequestOtp} 
                className="space-y-6"
              >
                <div className="relative group">
                  <Mail size={20} className="absolute left-5 top-5 text-(--text-muted) transition-colors group-focus-within:text-(--accent)" />
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full rounded-2xl border border-white/10 bg-(--surface-2)/40 py-5 pl-14 pr-6 text-sm font-medium text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all shadow-sm" 
                  />
                </div>
                
                <div className="flex justify-center py-1">
                  <Turnstile 
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>

                <WorldButton 
                  type="submit" 
                  disabled={loading || !turnstileToken} 
                  className="w-full bg-(--accent) text-(--bg) py-5 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-(--accent)/20 hover:brightness-105 active:scale-[0.99] transition-all rounded-2xl"
                >
                  {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Continue with Email"}
                </WorldButton>
              </motion.form>
            ) : (
              <motion.form 
                key="otp-step" 
                initial={{ opacity: 0, x: 15 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -15 }} 
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOtp} 
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-xs text-(--text-muted)">
                    We sent a verification code to
                  </p>
                  <p className="text-sm font-bold text-(--text) mt-1">
                    {email.toLowerCase()}
                  </p>
                </div>

                <div className="relative group">
                  <ShieldCheck size={20} className="absolute left-5 top-5 text-(--text-muted) transition-colors group-focus-within:text-(--accent)" />
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    maxLength={6} 
                    required 
                    className="w-full rounded-2xl border border-white/10 bg-(--surface-2)/40 py-5 text-center font-mono font-bold tracking-[0.3em] text-(--text) text-lg focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all shadow-sm" 
                  />
                </div>

                <WorldButton 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-(--accent) text-(--bg) py-5 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-(--accent)/20 hover:brightness-105 active:scale-[0.99] transition-all rounded-2xl"
                >
                  {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Verify Code"}
                </WorldButton>

                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="mx-auto flex items-center justify-center gap-2 pt-1 text-xs text-(--text-muted) hover:text-(--text) transition-colors"
                >
                  <ArrowLeft size={14} /> Use a different email
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px w-full bg-white/10" />
            <span className="text-xs text-(--text-muted) font-medium">or</span>
            <div className="h-px w-full bg-white/10" />
          </div>

          {/* Prominent, large login options without stickers */}
          <div className="space-y-4">
            <div className="w-full [&_iframe]:w-full [&_iframe]:min-h-[56px] [&_button]:w-full [&_button]:py-4 [&_button]:rounded-2xl">
              <TelegramLogin />
            </div>

            <WorldButton 
              type="button" 
              onClick={() => signIn("google", { callbackUrl: "/" })} 
              className="flex w-full items-center justify-center gap-3 bg-(--surface-2)/50 border border-white/10 text-(--text) hover:bg-(--surface-2) transition-all py-4 text-xs uppercase tracking-wider font-bold rounded-2xl shadow-sm"
            >
              <Chrome size={18} /> Continue with Google
            </WorldButton>
          </div>
        </motion.div>
      </section>
    </main>
  );
}