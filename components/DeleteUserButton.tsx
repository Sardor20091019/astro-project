"use client";

import { useState } from "react";
import { deleteUser } from "@/app/actions/admin-users";

export default function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete ${userName}? This will remove all their data.`)) return;
    setLoading(true);
    await deleteUser(userId);
    setLoading(false);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="text-[9px] uppercase tracking-widest font-bold text-red-500 hover:text-red-400 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete User"}
    </button>
  );
}