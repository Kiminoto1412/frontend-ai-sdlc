import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiBase } from "@/lib/api-url";
import ProductCard from "./ProductCard";
import Countdown from "./Countdown";
import RegisterForm from "./RegisterForm";

export default async function TopSaver() {
  const res = await fetch(`${apiBase()}/api/products/top-savers`, {
    cache: "no-store",
  });
  const json = await res.json();
  const saleEndsAt: string | null = json.saleEndsAt ?? null;
  const data: {
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
    sold_percent: number | null;
    sold_text: string | null;
  }[] = json.data ?? [];
  const endsAtMs = saleEndsAt ? new Date(saleEndsAt).getTime() : undefined;

  const products = data.map((p) => ({
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
    soldPercent: p.sold_percent ?? undefined,
    soldText: p.sold_text ?? undefined,
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-bold text-foreground">Top Saver Today</h2>
            <a href="#" className="text-sm text-zinc-400 hover:text-brand">
              All Offers
            </a>
            <Countdown endsAt={endsAtMs} />
            <div className="ml-auto flex items-center gap-1">
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        <div className="relative flex flex-col justify-center overflow-hidden rounded-lg bg-brand-soft p-6">
          <h3 className="text-2xl font-extrabold text-foreground">15% OFF</h3>
          <p className="mt-1 text-sm text-zinc-500">
            For new members sign up for the first time
          </p>

          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
