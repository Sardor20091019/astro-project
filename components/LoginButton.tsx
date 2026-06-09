/* eslint-disable @next/next/no-img-element */
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import WorldButton from "./WorldButton"; 

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt="Profile" 
              className="w-8 h-8 rounded-full border border-(--border)"
            />
          )}
          <span className="text-(--text) text-sm font-medium hidden md:block">
            {session.user?.name}
          </span>
        </div>
        
        {/* Using your WorldButton here */}
        <WorldButton onClick={() => signOut()}>
          Logout
        </WorldButton>
      </div>
    );
  }

  return (
    <WorldButton onClick={() => signIn("google")} className="flex items-center gap-2">
      <img 
        src="https://authjs.dev/img/providers/google.svg" 
        className="w-4 h-4" 
        alt="Google" 
      />
      Continue with Google
    </WorldButton>
  );
}