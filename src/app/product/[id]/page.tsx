import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "@/components/ProductGallery";
import Rating from "@/components/Rating";
import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";
import { getDb } from "@/lib/db";
import { apiBase } from "@/lib/api-url";
import type { Product } from "@/components/ProductCard";

export function generateStaticParams() {
  const db = getDb();
  const rows = db.prepare("SELECT id FROM products").all() as { id: string }[];
  return rows.map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const res = await fetch(`${apiBase()}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) return {};
  const product = await res.json();
  return {
    title: `${product.title} — Farmart`,
    description: product.description ?? undefined,
  };
}

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`${apiBase()}/api/products/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) notFound();
  const product = await res.json();

  const rawImages: { icon: string; icon_bg: string }[] = product.images ?? [];
  const images =
    rawImages.length > 0
      ? rawImages.map((img) => ({ icon: img.icon, iconBg: img.icon_bg }))
      : [{ icon: product.icon, iconBg: product.icon_bg }];

  const related: Product[] = (product.related ?? []).map(
    (p: {
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
    }) => ({
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
    })
  );

  return (
    <div className="flex flex-1 flex-col bg-white">
      <Header />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: product.category_slug, href: "/" },
            { label: product.title },
          ]}
        />
      </div>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ProductGallery images={images} />

        <div className="flex flex-col">
          <div className="text-xs text-zinc-400">{product.brand}</div>
          <h1 className="mt-1 text-2xl font-extrabold text-foreground sm:text-3xl">
            {product.title}
          </h1>

          <div className="mt-3">
            <Rating rating={product.rating} reviews={product.reviews} size="lg" />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-extrabold text-brand">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-base text-zinc-400 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
            {product.badge && (
              <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                {product.badge}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-600">
            {product.description}
          </p>

          <div className="mt-4 text-xs text-zinc-400">
            Unit: <span className="font-medium text-zinc-600">{product.unit}</span>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
            <Truck size={14} className="text-brand" />
            Free delivery on orders over $50
          </div>

          <ProductActions productId={id} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-zinc-50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">You Might Also Like</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id ?? item.title} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
