"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src={session.user?.image || ""} 
            alt="Profile" 
            className="w-8 h-8 rounded-full border border-white/20"
          />
          <span className="text-white text-sm font-medium hidden md:block">
            {session.user?.name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-zinc-200 transition"
    >
      <img src="https://authjs.dev/img/providers/google.svg" className="w-4 h-4" alt="Google" />
      Continue with Google
    </button>
  );
}