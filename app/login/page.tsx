/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chrome, Sparkles, Mail, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import TelegramLogin from "@/components/TelegramLogin"; // <--- Add this import

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch verification code.");
      }
      
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      token: otp,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid or expired verification pin code.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(230,48,39,0.24),transparent_34%),linear-gradient(to_bottom,rgba(0,0,0,0.25),#000_82%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/25">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Welcome to</p>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Astro<span className="text-red-500">spectrum</span>
              </h1>
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-white/60">
            Sign in to write comments, keep your ratings synced, and carry your gallery presence across devices.
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-mono text-red-400 tracking-wide"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="email-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRequestOtp}
                className="space-y-3"
              >
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-4 text-white/45" />
                  <input
                    type="email"
                    placeholder="ENTER YOUR EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-xs font-mono uppercase tracking-wider text-white outline-none transition-all focus:border-red-500/50 focus:bg-black/60"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "SEND SECURITY PIN"}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="otp-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleVerifyOtp}
                className="space-y-3"
              >
                <p className="text-[11px] uppercase tracking-wider text-white/40 mb-1 text-center font-mono">
                  Enter verification token dispatched to {email.toLowerCase()}
                </p>
                <div className="relative flex items-center">
                  <ShieldCheck size={16} className="absolute left-4 text-white/45" />
                  <input
                    type="text"
                    placeholder="6-DIGIT PIN"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 py-4 pl-12 pr-4 text-center text-sm font-mono tracking-[0.3em] font-bold text-white outline-none transition-all focus:border-red-500/50 focus:bg-black/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition-all hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "VERIFY & LOGIN"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-1.5 mx-auto text-[10px] uppercase tracking-widest text-white/40 hover:text-white pt-2 transition-colors"
                >
                  <ArrowLeft size={10} /> Change email address
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="my-6 flex items-center justify-between gap-4">
            <div className="h-px w-full bg-white/10" />
            <span className="text-[10px] font-mono tracking-widest text-white/20 uppercase whitespace-nowrap">OR</span>
            <div className="h-px w-full bg-white/10" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:text-white hover:shadow-2xl hover:shadow-red-500/25"
            >
              <Chrome size={18} />
              Continue with Google
            </button>
            
            {/* Telegram Login added here */}
            <TelegramLogin />
          </div>

          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.22em] text-white/35">
            Secure Platform Authorization
          </p>
        </motion.div>
      </section>
    </main>
  );
}