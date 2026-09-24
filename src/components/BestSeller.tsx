import Link from "next/link";
import { apiBase } from "@/lib/api-url";
import ProductCard from "./ProductCard";

const tabs = [
  { label: "All", slug: "all" },
  { label: "Fruits & Vegetables", slug: "fruits-vegetables" },
  { label: "Frozen Seafoods", slug: "frozen-seafoods" },
  { label: "Raw Meats", slug: "raw-meats" },
  { label: "Coffees & Teas", slug: "coffees-teas" },
  { label: "Milks & Dairies", slug: "milks-dairies" },
];

export default async function BestSeller({
  activeCategory,
  q,
}: {
  activeCategory?: string;
  q?: string;
}) {
  let rows: {
    id: string;
    badge: string | null;
    icon: string;
    icon_bg: string;
    brand: string;
    title: string;
    rating: number;
    reviews: number;
    price: number;
    original_price: number | null;
    sold_percent?: number | null;
    sold_text?: string | null;
  }[];

  if (q) {
    const url = new URL(`${apiBase()}/api/products`);
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "12");
    const res = await fetch(url.toString(), { cache: "no-store" });
    const json = await res.json();
    rows = json.data ?? [];
  } else {
    const url = new URL(`${apiBase()}/api/products/best-sellers`);
    if (activeCategory && activeCategory !== "all") {
      url.searchParams.set("category", activeCategory);
    }
    const res = await fetch(url.toString(), { cache: "no-store" });
    const json = await res.json();
    rows = json.data ?? [];
  }

  const products = rows.map((p) => ({
    id: p.id,
    badge: p.badge ?? undefined,
    icon: p.icon,
    iconBg: p.icon_bg,
    brand: p.brand,
    title: p.title,
    rating: p.rating,
    reviews: p.reviews,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
  }));

  const sectionTitle = q ? `Search results for "${q}"` : "Best Seller";

  return (
    <section id="best-seller" className="bg-zinc-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold text-foreground">{sectionTitle}</h2>

          {!q && (
            <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
              {tabs.map((tab) => {
                const isActive =
                  tab.slug === "all"
                    ? !activeCategory || activeCategory === "all"
                    : activeCategory === tab.slug;
                return (
                  <Link
                    key={tab.slug}
                    href={tab.slug === "all" ? "/#best-seller" : `/?category=${tab.slug}#best-seller`}
                    className={isActive ? "font-semibold text-brand" : "hover:text-brand"}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {q && (
            <Link href="/" className="text-sm text-zinc-400 hover:text-brand">
              ← Clear search
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
