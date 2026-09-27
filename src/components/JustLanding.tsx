import { apiBase } from "@/lib/api-url";
import ProductCard from "./ProductCard";

const tabs = [
  "All",
  "Fruits & Vegetables",
  "Frozen Seafoods",
  "Raw Meats",
  "Coffees & Teas",
  "Milks & Dairies",
];

export default async function JustLanding() {
  const res = await fetch(`${apiBase()}/api/products/just-landing`, {
    cache: "no-store",
  });
  const json = await res.json();
  const rows: {
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
  }[] = json.data ?? [];
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <h2 className="text-xl font-bold text-foreground">Just Landing</h2>
        <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
          {tabs.map((tab, i) => (
            <a
              key={tab}
              href="#"
              className={i === 0 ? "font-semibold text-brand" : "hover:text-brand"}
            >
              {tab}
            </a>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
