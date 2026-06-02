/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";

export default function UserMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Profile Avatar/Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full hover:bg-zinc-700"
      >
        <img src={user.image || "/default-avatar.png"} className="w-6 h-6 rounded-full" alt="Avatar" />
        <span className="text-sm font-medium">{user.telegramUsername}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-2 z-50">
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 rounded">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}