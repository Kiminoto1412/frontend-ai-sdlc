"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/?q=${encodeURIComponent(term)}` : "/");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center rounded-lg bg-zinc-100 pr-2"
    >
      <button
        type="button"
        className="flex shrink-0 items-center gap-1 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-700 hover:text-brand"
      >
        All Categories
        <ChevronDown size={14} />
      </button>
      <span className="h-5 w-px shrink-0 bg-zinc-300" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search anything for..."
        className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-400"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex shrink-0 items-center justify-center px-3 text-zinc-500 transition-colors hover:text-brand"
      >
        <Search size={18} />
      </button>
    </form>
  );
}
