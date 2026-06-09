"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

useEffect(() => {

  const currentUrlQuery = searchParams.get("q") || "";


  if (value === currentUrlQuery) return;


  const handler = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    

    params.set("page", "1"); 
    
    router.replace(`/?${params.toString()}`, { scroll: false });
  }, 300);


  return () => clearTimeout(handler);
}, [value, router, searchParams]); 

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