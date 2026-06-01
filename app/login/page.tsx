"use client";

import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Chrome, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [router, status]);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(230,48,39,0.24),transparent_34%),linear-gradient(to_bottom,rgba(0,0,0,0.25),#000_82%)]" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-2xl"
        >
          <div className="mb-8 flex items-center gap-3">
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

          <p className="mb-8 text-sm leading-6 text-white/60">
            Sign in to write comments, keep your ratings synced, and carry your gallery presence across devices.
          </p>

          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:text-white hover:shadow-2xl hover:shadow-red-500/25"
          >
            <Chrome size={18} />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.22em] text-white/35">
            Secure OAuth login
          </p>
        </motion.div>
      </section>
    </main>
  );
}
