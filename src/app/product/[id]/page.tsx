import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Heart, Truck } from "lucide-react";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "@/components/ProductGallery";
import Rating from "@/components/Rating";
import QuantitySelector from "@/components/QuantitySelector";
import ProductCard from "@/components/ProductCard";
import { getProductById, products } from "@/data/products";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return {};
  return {
    title: `${product.title} — Farmart`,
    description: product.description,
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
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <div className="flex flex-1 flex-col bg-white">
      <Header />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: product.category, href: "/" },
            { label: product.title },
          ]}
        />
      </div>

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:px-8">
        <ProductGallery images={product.images} />

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
            {product.originalPrice && (
              <span className="text-base text-zinc-400 line-through">
                {formatPrice(product.originalPrice)}
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

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <QuantitySelector />
            <button className="flex-1 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark sm:flex-none">
              Add To Cart
            </button>
            <button
              aria-label="Add to wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 ring-1 ring-zinc-200 hover:text-brand"
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">You Might Also Like</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {product.related.map((item) => (
              <ProductCard key={item.title} product={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
