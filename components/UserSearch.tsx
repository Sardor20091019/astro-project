/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { searchUsers } from "@/app/actions/search";
import Link from "next/link";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 1) {
        const users = await searchUsers(query);
        setResults(users);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full max-w-xs">
      <input
        type="text"
        placeholder="Search users..."
        className="w-full bg-[#1a1a1a] text-white p-2 rounded border border-[#333] focus:outline-none focus:border-white"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
      />
      
      {/* Search Dropdown */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-[#333] rounded shadow-xl z-50">
          {results.map((user) => (
            <Link 
              href={`/profile/${user.id}`} 
              key={user.id} 
              className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] transition-colors"
              onClick={() => setResults([])}
            >
              <span className="text-white text-sm">{user.name || user.telegramUsername}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}