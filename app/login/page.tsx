/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chrome, Sparkles, Mail, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import Link from "next/link";
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
      setError("Please complete the security check.");
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
      if (!res.ok) throw new Error(data.error || "Failed to dispatch verification code.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
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
      setError("Invalid or expired verification pin code.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,var(--accent-soft),transparent_34%),linear-gradient(to_bottom,transparent,var(--bg)_82%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <motion.div className="world-card w-full max-w-md p-8 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--bg)]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Welcome to</p>
              <h1 className="text-2xl font-black uppercase">Astro<span className="text-[var(--accent)]">spectrum</span></h1>
            </div>
          </div>

          {error && <div className="mb-4 rounded-xl bg-[var(--accent)]/10 p-3 text-center text-xs text-[var(--accent)]">{error}</div>}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="email-step" onSubmit={handleRequestOtp} className="space-y-4">
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-4 text-[var(--text-muted)]" />
                  <input type="email" placeholder="ENTER YOUR EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-2xl border bg-[var(--surface)] py-4 pl-12 pr-4 text-xs font-mono uppercase" />
                </div>
                
                <div className="flex justify-center">
                  <Turnstile 
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => setTurnstileToken(token)}
                  />
                </div>

                <WorldButton type="submit" disabled={loading || !turnstileToken} className="w-full bg-(--accent) py-4">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "SEND SECURITY PIN"}
                </WorldButton>
              </motion.form>
            ) : (
              <motion.form key="otp-step" onSubmit={handleVerifyOtp} className="space-y-3">
                <p className="mb-1 text-center font-mono text-[11px] uppercase tracking-wider text-(--text-muted)">
                  Enter token sent to {email.toLowerCase()}
                </p>
                <div className="relative">
                  <ShieldCheck size={16} className="absolute left-4 top-4 text-(--text-muted)" />
                  <input type="text" placeholder="6-DIGIT PIN" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} required className="w-full rounded-2xl border bg-[var(--surface)] py-4 text-center font-mono font-bold tracking-[0.3em]" />
                </div>
                <WorldButton type="submit" disabled={loading} className="w-full bg-[var(--accent)] py-4">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "VERIFY & LOGIN"}
                </WorldButton>
                <button type="button" onClick={() => setStep(1)} className="mx-auto flex items-center justify-center gap-1.5 pt-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)]">
                  <ArrowLeft size={10} /> Change email address
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px w-full bg-[var(--border)]" />
            <span className="text-[10px] text-[var(--text-muted)]">OR</span>
            <div className="h-px w-full bg-[var(--border)]" />
          </div>

          <div className="space-y-3">
            <WorldButton type="button" onClick={() => signIn("google", { callbackUrl: "/" })} className="flex w-full items-center justify-center gap-3 bg-[var(--surface)]">
              <Chrome size={18} /> Continue with Google
            </WorldButton>
            <TelegramLogin />
          </div>
        </motion.div>
      </section>
    </main>
  );
}