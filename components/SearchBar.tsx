"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

useEffect(() => {
  // 1. Get the query currently sitting in the browser URL bar
  const currentUrlQuery = searchParams.get("q") || "";

  // 2. GUARD CLAUSE: If the input value matches the URL, the user is NOT typing.
  // They are likely just flipping pages. Stop here and don't reset the page!
  if (value === currentUrlQuery) return;

  // 3. Clean debouncer timer execution
  const handler = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    
    // Only resets to page 1 when the search string ACTUALLY changes
    params.set("page", "1"); 
    
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, 300);

  // 4. CRITICAL CLEANUP: Wipes out the timer if they type fast or change pages, 
  // preventing phantom background URL rewrites
  return () => clearTimeout(handler);
}, [value, router, searchParams]); // Ensure these are your exact dependencies

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <div className="relative flex items-center border border-zinc-800 bg-zinc-900/50 rounded-lg overflow-hidden">
        <div className="pl-3 text-zinc-500"><Search size={16} /></div>
        <input
          type="text"
          value={value}
          placeholder="Search by title..."
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-transparent border-none p-3 text-sm text-white outline-none"
        />
      </div>
    </div>
  );
}