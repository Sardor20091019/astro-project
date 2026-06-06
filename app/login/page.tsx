"use client";

import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Chrome, Sparkles, Mail, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import TelegramLogin from "@/components/TelegramLogin";
import WorldButton from "@/components/WorldButton"; // Use your new button

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
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch verification code.");
      }
      
      setStep(2);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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
      callbackUrl: "/", 
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
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] transition-colors duration-500">
      {/* Background imagery stays, but the page container now adapts */}
      <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,var(--accent-soft),transparent_34%),linear-gradient(to_bottom,transparent,var(--bg)_82%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          // Applying world-card here makes the container transform per theme
          className="world-card w-full max-w-md p-8 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--bg)] shadow-lg shadow-[var(--accent)]/25">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">Welcome to</p>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                Astro<span className="text-[var(--accent)]">spectrum</span>
              </h1>
            </div>
          </div>

          <p className="mb-6 text-sm leading-6 text-[var(--text-dim)]">
            Sign in to write comments, keep your ratings synced, and carry your gallery presence across devices.
          </p>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/10 p-3 text-center text-xs font-mono tracking-wide text-[var(--accent)]"
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
                  <Mail size={16} className="absolute left-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    placeholder="ENTER YOUR EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-4 pl-12 pr-4 text-xs font-mono uppercase tracking-wider text-[var(--text)] outline-none transition-all focus:border-[var(--accent)] focus:bg-[var(--surface)]"
                  />
                </div>
                
                <WorldButton type="submit" disabled={loading} className="w-full bg-[var(--accent)] text-[var(--bg)] py-4 font-black uppercase tracking-[0.18em]">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "SEND SECURITY PIN"}
                </WorldButton>
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
                <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] text-center">
                  Enter token sent to {email.toLowerCase()}
                </p>
                <div className="relative flex items-center">
                  <ShieldCheck size={16} className="absolute left-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="6-DIGIT PIN"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-4 pl-12 pr-4 text-center text-sm font-mono font-bold tracking-[0.3em] text-[var(--text)] outline-none transition-all focus:border-[var(--accent)]"
                  />
                </div>

                <WorldButton type="submit" disabled={loading} className="w-full bg-[var(--accent)] text-[var(--bg)] py-4 font-black uppercase tracking-[0.18em]">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "VERIFY & LOGIN"}
                </WorldButton>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mx-auto flex items-center justify-center gap-1.5 pt-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                >
                  <ArrowLeft size={10} /> Change email address
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="my-6 flex items-center justify-between gap-4">
            <div className="h-px w-full bg-[var(--border)]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] whitespace-nowrap">OR</span>
            <div className="h-px w-full bg-[var(--border)]" />
          </div>

          <div className="space-y-3">
            <WorldButton
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center gap-3 bg-[var(--surface)] text-[var(--text)] border-[var(--border)]"
            >
              <Chrome size={18} />
              Continue with Google
            </WorldButton>
            
            <TelegramLogin />
          </div>

          {/* Explicit User Legal Consent Verification Notice */}
          <p className="mt-6 text-center text-[10px] leading-relaxed text-[var(--text-muted)] transition-colors">
            By authenticating, you confirm you agree to our{" "}
            <Link href="/terms" className="underline font-medium text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
              Terms of Use
            </Link>{" "}
            and acknowledge our{" "}
            <Link href="/privacy" className="underline font-medium text-[var(--text-dim)] hover:text-[var(--accent)] transition-colors">
              Privacy Policy
            </Link>{" "}
            on each session login.
          </p>
        </motion.div>
      </section>
    </main>
  );
}