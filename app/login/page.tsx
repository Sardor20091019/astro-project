/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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


  const timelineRef = useRef<HTMLElement>(null);
  const isDraggingRef = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [router, status]);


  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const updateScrollFromClientY = (clientY: number) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const height = rect.height;
    const offsetY = clientY - rect.top;
    let percentage = (offsetY / height) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const targetY = (percentage / 100) * totalHeight;
      window.scrollTo({ top: targetY, behavior: "auto" });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsDraggingTimeline(true);
    updateScrollFromClientY(e.clientY);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updateScrollFromClientY(e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDraggingTimeline(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

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
    <div className="relative min-h-screen bg-(--bg) text-(--text) flex flex-col items-center justify-center overflow-hidden">
      
      {/* Hide default browser scrollbars for clean cinematic aesthetic */}
      <style jsx global>{`
        html {
          scrollbar-width: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* High-Density Cinematic Timeline Scrubber */}
      <aside
        ref={timelineRef}
        aria-label="Page scroll position scrubber"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`fixed right-4 sm:right-7 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end justify-between h-[50vh] py-2 px-2 cursor-ns-resize touch-none select-none transition-opacity ${
          isDraggingTimeline ? "opacity-100 scale-[1.02]" : "opacity-90 hover:opacity-100"
        }`}
      >
        {Array.from({ length: 150 }).map((_, i) => {
          const tickProgress = (i / 149) * 100;
          const distance = Math.abs(scrollProgress - tickProgress);
          const isActive = distance < 2.0;
          const isMajor = i % 15 === 0;
          const isSemiMajor = i % 5 === 0;

          return (
            <span
              key={i}
              className={`rounded-full transition-all duration-150 ease-out pointer-events-none ${
                isActive 
                  ? "w-7 h-[2.5px] bg-(--accent) shadow-[0_0_12px_var(--accent)] scale-125" 
                  : isMajor
                  ? "w-4.5 h-[1.5px] bg-(--text) opacity-50"
                  : isSemiMajor
                  ? "w-3 h-[1.2px] bg-(--text-muted) opacity-35"
                  : "w-1.5 h-[1px] bg-(--text-dim) opacity-20"
              }`}
            />
          );
        })}
      </aside>

      {/* Dreamy ethereal background atmosphere */}
      <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-20 filter blur-[4px] scale-105 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-(--bg) via-(--bg)/70 to-transparent pointer-events-none" />
      
      {/* Soft floating light gradient pools */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-(--accent)/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

      {/* Main Glassmorphism Portal Card */}
      <main className="relative z-10 w-full max-w-lg px-4 py-8 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-[2.5rem] p-8 sm:p-14 bg-(--surface-1)/50 backdrop-blur-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Subtle top ethereal light rim */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-(--accent)/60 to-transparent" />

          {/* Clean minimal typography header */}
          <div className="mb-10 text-center flex flex-col items-center">
            <h1 className="text-3xl font-black tracking-tight uppercase">
              Astro<span className="text-(--accent)">spectrum</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-(--text-muted) mt-3">
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
                className="mb-6 rounded-2xl bg-(--accent)/10 border border-(--accent)/20 p-4 text-center text-xs text-(--accent) tracking-wider font-medium"
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
                  <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-(--accent)" />
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="w-full rounded-2xl border border-white/10 bg-(--surface-2)/40 py-4.5 pl-16 pr-6 text-sm font-medium text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all shadow-sm" 
                  />
                </div>
                
                <div className="flex justify-center py-2">
                  <Turnstile 
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>

                <WorldButton 
                  type="submit" 
                  disabled={loading || !turnstileToken} 
                  className="w-full bg-(--accent) text-(--bg) py-4.5 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-(--accent)/20 hover:brightness-105 active:scale-[0.99] transition-all rounded-2xl"
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
                <div className="text-center space-y-1">
                  <p className="text-xs text-(--text-muted)">
                    We sent a verification code to
                  </p>
                  <p className="text-sm font-bold text-(--text)">
                    {email.toLowerCase()}
                  </p>
                </div>

                <div className="relative group">
                  <ShieldCheck size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors group-focus-within:text-(--accent)" />
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit code" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    maxLength={6} 
                    required 
                    className="w-full rounded-2xl border border-white/10 bg-(--surface-2)/40 py-4.5 pl-16 pr-6 text-center font-mono font-bold tracking-[0.3em] text-(--text) text-lg focus:outline-none focus:border-(--accent) focus:ring-2 focus:ring-(--accent)/20 transition-all shadow-sm" 
                  />
                </div>

                <WorldButton 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-(--accent) text-(--bg) py-4.5 text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-(--accent)/20 hover:brightness-105 active:scale-[0.99] transition-all rounded-2xl"
                >
                  {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Verify Code"}
                </WorldButton>

                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="mx-auto flex items-center justify-center gap-2 pt-2 text-xs text-(--text-muted) hover:text-(--text) transition-colors"
                >
                  <ArrowLeft size={14} /> Use a different email
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px w-full bg-white/10" />
            <span className="text-xs text-(--text-muted) font-medium uppercase tracking-wider">or</span>
            <div className="h-px w-full bg-white/10" />
          </div>

          {/* Social Login Options */}
          <div className="space-y-4">
            <div className="w-full [&_iframe]:w-full [&_iframe]:min-h-[52px] [&_button]:w-full [&_button]:py-4 [&_button]:rounded-2xl">
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
      </main>
    </div>
  );
}