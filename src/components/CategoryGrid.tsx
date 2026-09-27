import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiBase } from "@/lib/api-url";

export default async function CategoryGrid() {
  const res = await fetch(`${apiBase()}/api/categories`, { cache: "no-store" });
  const json = await res.json();
  const categories: { slug: string; label: string; icon: string }[] =
    json.data ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Browse by Category</h2>
        <div className="flex items-center gap-4">
          <a href="#" className="text-sm text-zinc-400 hover:text-brand">
            All Categories
          </a>
          <div className="flex items-center gap-1">
            <button
              aria-label="Previous"
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next"
              className="rounded bg-brand p-1 text-foreground hover:bg-brand-dark"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/?category=${category.slug}#best-seller`}
            className="flex flex-col items-center gap-3 rounded-lg border border-transparent bg-zinc-50 px-3 py-6 text-center transition-colors hover:bg-white hover:shadow-md hover:ring-1 hover:ring-black/5"
          >
            <span className="text-4xl">{category.icon}</span>
            <span className="text-xs font-medium leading-tight text-zinc-600">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
